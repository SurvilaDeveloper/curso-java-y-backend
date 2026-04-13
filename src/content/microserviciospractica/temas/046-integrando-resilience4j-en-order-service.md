---
title: "Integrando Resilience4j en order-service"
description: "Primer paso formal de resiliencia avanzada en NovaMarket. Integración de Resilience4j en order-service para empezar a proteger la llamada hacia inventory-service."
order: 46
module: "Módulo 8 · Resiliencia aplicada"
level: "intermedio"
draft: false
---

# Integrando Resilience4j en `order-service`

En la clase anterior dimos un primer endurecimiento del sistema:

- configuramos timeout,
- y mejoramos el manejo básico de errores cuando `inventory-service` falla.

Eso ya fue un avance importante, pero todavía nos falta una herramienta más explícita para trabajar resiliencia dentro de la arquitectura.

La que vamos a incorporar ahora es:

**Resilience4j**

No vamos a usarla todavía para todo el repertorio posible.  
En esta clase, el objetivo es más concreto:

**integrarla correctamente en `order-service` y empezar a proteger la llamada hacia inventario.**

Este es el primer paso formal de resiliencia avanzada en NovaMarket.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregada la dependencia de Resilience4j en `order-service`,
- configurada una base mínima para usarla,
- aplicada sobre la llamada a inventario,
- y preparada la arquitectura para extender después con retry y circuit breaker más visibles.

No hace falta resolver todo de una vez.  
Primero queremos que la integración técnica quede bien hecha y entendible.

---

## Estado de partida

Partimos de este contexto:

- `order-service` usa Feign para consultar inventario,
- ya configuramos timeout,
- ya mejoramos el manejo básico de errores,
- pero todavía no tenemos una política de resiliencia formalizada con una herramienta dedicada.

Eso significa que el sistema ya falla mejor, pero todavía no está usando una infraestructura explícita de resiliencia.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- agregar Resilience4j al proyecto,
- configurar una base mínima,
- envolver la llamada hacia inventario con una estrategia inicial,
- y verificar que el flujo siga funcionando.

---

## Por qué usar Resilience4j

Porque nos permite expresar de manera más clara y controlada cosas como:

- retry,
- circuit breaker,
- rate limiter,
- bulkhead,
- y otras piezas de resiliencia.

No tenemos por qué usar todo ya mismo.  
Pero sí conviene empezar a incorporarla como base del módulo, porque sobre ella vamos a construir las siguientes clases.

---

## Paso 1 · Agregar la dependencia de Resilience4j

Dentro de `order-service`, agregá la dependencia correspondiente a:

- **Resilience4j**
- y la integración con Spring Boot que sea coherente con tu stack

Lo importante es que el servicio ya pueda usar anotaciones o configuración propia de esta librería.

---

## Paso 2 · Agregar configuración base en `config-repo`

Como `order-service` ya consume configuración centralizada, conviene dejar la configuración inicial de resiliencia en:

```txt
novamarket/config-repo/order-service.yml
```

Una base mínima razonable podría verse conceptualmente así:

```yaml
resilience4j:
  circuitbreaker:
    instances:
      inventoryService:
        slidingWindowSize: 5
        minimumNumberOfCalls: 3
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
```

Aunque en esta clase todavía no explotemos toda la semántica del circuit breaker, ya estamos dejando la configuración lista para lo que viene.

Esto tiene mucho valor porque va ordenando desde ahora el nombre de la instancia y la forma en que vamos a trabajar el bloque.

---

## Paso 3 · Elegir dónde aplicar Resilience4j

El lugar más natural para aplicar resiliencia es la parte de `order-service` donde se consulta inventario.

Eso puede hacerse:

- directamente sobre el método que llama a Feign,
- o aislando esa llamada en un método específico del servicio.

Para el curso práctico, suele ser mejor separar la llamada a inventario en un método dedicado, porque eso deja mucho más clara la intención.

---

## Paso 4 · Extraer la llamada a inventario a un método específico

Una versión razonable de `OrderService` podría moverse hacia una estructura así:

```java
private InventoryItemResponse getInventory(Long productId) {
    return inventoryFeignClient.findByProductId(productId);
}
```

Esto parece pequeño, pero tiene bastante valor porque:

- hace más clara la responsabilidad,
- deja un punto de entrada nítido para aplicar resiliencia,
- y evita mezclar demasiado la lógica de negocio con la mecánica de la integración remota.

---

## Paso 5 · Aplicar Resilience4j sobre la llamada remota

Ahora sí, una forma razonable de empezar es anotar ese método con un mecanismo de Resilience4j.

Por ejemplo, una primera versión puede orientarse así:

```java
package com.novamarket.order.service;

import com.novamarket.order.dto.CreateOrderItemRequest;
import com.novamarket.order.dto.CreateOrderRequest;
import com.novamarket.order.dto.InventoryItemResponse;
import com.novamarket.order.model.Order;
import com.novamarket.order.model.OrderItem;
import com.novamarket.order.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final InventoryFeignClient inventoryFeignClient;
    private final OrderRepository orderRepository;

    public OrderService(InventoryFeignClient inventoryFeignClient, OrderRepository orderRepository) {
        this.inventoryFeignClient = inventoryFeignClient;
        this.orderRepository = orderRepository;
    }

    public Order createOrder(CreateOrderRequest request) {
        List<OrderItem> items = request.getItems().stream()
                .map(this::toOrderItem)
                .toList();

        for (OrderItem item : items) {
            InventoryItemResponse inventory = getInventory(item.getProductId());

            if (inventory == null || inventory.getAvailableQuantity() == null) {
                throw new InventoryUnavailableException("No se pudo obtener inventario para el producto " + item.getProductId());
            }

            if (inventory.getAvailableQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Stock insuficiente para el producto " + item.getProductId());
            }
        }

        Order order = new Order("CREATED", items);
        return orderRepository.save(order);
    }

    @CircuitBreaker(name = "inventoryService", fallbackMethod = "inventoryFallback")
    public InventoryItemResponse getInventory(Long productId) {
        return inventoryFeignClient.findByProductId(productId);
    }

    public InventoryItemResponse inventoryFallback(Long productId, Throwable throwable) {
        throw new InventoryUnavailableException("El servicio de inventario no está disponible en este momento");
    }

    private OrderItem toOrderItem(CreateOrderItemRequest item) {
        return new OrderItem(item.getProductId(), item.getQuantity());
    }
}
```

---

## Qué valor tiene este primer uso

Aunque más adelante vamos a profundizar bastante en circuit breaker, retry y métricas, esta integración ya aporta mucho porque:

- deja explícito que la llamada remota está protegida,
- separa mejor el punto sensible del flujo,
- y permite tener un fallback controlado.

Eso mejora bastante la claridad arquitectónica del sistema.

---

## Paso 6 · Mantener coherencia con el manejo de errores del controller

Como ya veníamos devolviendo `503 Service Unavailable` cuando inventario no estaba disponible, este cambio puede integrarse bastante bien con lo que ya teníamos.

La idea es que el controller siga capturando `InventoryUnavailableException` y devolviendo una respuesta clara.

Eso es bueno porque muestra que Resilience4j no reemplaza toda la aplicación, sino que se integra sobre un flujo que ya venía mejorándose.

---

## Paso 7 · Reiniciar `order-service`

Después de sumar la dependencia, la configuración y la anotación, reiniciá `order-service`.

También conviene tener arriba:

- `config-server`
- `discovery-server`
- `api-gateway`
- Keycloak
- `inventory-service`

La idea es validar primero el caso feliz y después volver a probar escenarios de falla.

---

## Paso 8 · Probar una orden válida

Primero, con el sistema sano, probá:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

La respuesta debería seguir siendo correcta.

Es muy importante comprobar que la incorporación de Resilience4j no rompe el caso feliz.

---

## Paso 9 · Probar una falla de inventario

Ahora volvé a apagar o degradar `inventory-service` y repetí la prueba.

La expectativa es que el sistema:

- no explote de forma caótica,
- pase por el fallback,
- y termine respondiendo con el error controlado que ya veníamos manejando.

Esto es importante porque ahora ya no estamos solo reaccionando a una excepción cruda, sino pasando por una estructura explícita de resiliencia.

---

## Paso 10 · Pensar qué parte del módulo ya quedó lista

Después de esta clase, conviene reconocer esto:

### Ya tenemos
- timeout
- mejor manejo de errores
- integración formal de Resilience4j
- un punto protegido de llamada remota con fallback

### Todavía no tenemos
- retry explícito
- circuit breaker analizado en profundidad
- métricas y estado observables
- reglas más ricas de resiliencia

Eso deja el camino muy claro para las siguientes clases.

---

## Qué estamos logrando con esta clase

Esta clase marca un cambio importante:

**la resiliencia deja de ser solo buena configuración y manejo artesanal del error, y pasa a convertirse en una capacidad explícita del servicio.**

Eso fortalece bastante la arquitectura y mejora mucho la claridad del diseño.

---

## Qué todavía no hicimos

Todavía no analizamos:

- cuántas fallas tolera el circuit breaker,
- cuándo se abre,
- cómo se comporta el retry,
- ni cómo exponer esto por Actuator.

Todo eso viene después.

La meta de hoy es mucho más concreta:

**integrar Resilience4j de forma correcta y útil.**

---

## Errores comunes en esta etapa

### 1. Agregar la dependencia pero no usarla en un punto claro del flujo
Conviene aplicar resiliencia donde realmente duele: la llamada remota.

### 2. No definir un fallback coherente
Entonces el comportamiento sigue siendo confuso.

### 3. Cambiar demasiadas cosas al mismo tiempo
Para esta clase, menos es más.

### 4. No probar el caso feliz después de integrar la librería
Siempre conviene validar que no rompimos lo que ya funcionaba.

### 5. Creer que con una sola anotación ya resolvimos toda la resiliencia
Todavía falta bastante; esta es solo la base.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `order-service` debería:

- tener Resilience4j integrado,
- proteger formalmente la llamada hacia inventario,
- seguir funcionando en el caso feliz,
- y manejar de manera más estructurada la indisponibilidad remota.

Eso deja al módulo de resiliencia mucho mejor encaminado.

---

## Punto de control

Antes de seguir, verificá que:

- agregaste la dependencia de Resilience4j,
- existe configuración inicial en `order-service.yml`,
- la llamada remota pasa por un método protegido,
- el fallback funciona,
- y el caso feliz sigue respondiendo correctamente.

Si eso está bien, ya podemos seguir profundizando el bloque con retry y luego circuit breaker de forma más visible.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a trabajar específicamente con **retry**.

Eso nos va a permitir explorar cuándo conviene reintentar una llamada remota y cuándo no, dentro del flujo de NovaMarket.

---

## Cierre

En esta clase integramos Resilience4j en `order-service`.

Con eso, NovaMarket dejó atrás la etapa donde toda la resiliencia dependía solo de timeouts y manejo manual de errores, y empezó a construir una estrategia explícita y más sólida para proteger sus llamadas remotas.
