---
title: "Agregando retry"
description: "Profundización del bloque de resiliencia en NovaMarket. Configuración de reintentos controlados en la llamada hacia inventory-service para mejorar el comportamiento ante fallas transitorias."
order: 47
module: "Módulo 8 · Resiliencia aplicada"
level: "intermedio"
draft: false
---

# Agregando retry

En la clase anterior dimos un paso importante en la resiliencia de NovaMarket:

- agregamos timeout,
- mejoramos el manejo básico del error,
- e integramos Resilience4j en `order-service`.

Eso ya nos dejó una llamada remota mejor protegida, pero todavía falta explorar una estrategia clave dentro de este módulo:

**retry**.

La idea detrás del retry es simple:

**si una llamada falla, a veces conviene volver a intentarla antes de darla por perdida.**

Eso puede ser muy útil cuando la falla es transitoria, breve o intermitente.  
Pero también puede ser peligroso si se aplica sin criterio.

Ese equilibrio es justamente lo que vamos a empezar a trabajar en esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- configurado un retry explícito para la llamada hacia inventario,
- aplicada la estrategia sobre el punto sensible del flujo,
- y validado cuándo ayuda y cuándo no dentro de NovaMarket.

No vamos a dejarlo como una receta ciega.  
La idea es entender su valor y también sus límites.

---

## Estado de partida

Partimos de este contexto:

- `order-service` ya usa Feign para consultar `inventory-service`,
- ya existe timeout,
- ya existe una integración básica con Resilience4j,
- y la llamada remota ya tiene al menos una estructura más explícita de manejo de fallas.

Pero hoy todavía no estamos reintentando cuando una llamada falla.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- agregar configuración de retry en Resilience4j,
- aplicar retry sobre la llamada protegida,
- volver a provocar fallas,
- y observar cuándo el reintento mejora el comportamiento y cuándo no.

---

## Qué problema intenta resolver retry

No toda falla remota es una caída total o permanente.

Hay escenarios donde puede ocurrir algo como esto:

- una respuesta demora un poco más de la cuenta,
- una instancia todavía está arrancando,
- hay un corte breve,
- o una condición transitoria hace fallar una llamada puntual.

En esos casos, un reintento bien configurado puede evitar rechazar operaciones que podrían salir bien con un segundo o tercer intento rápido.

---

## Por qué retry no siempre es buena idea

Este punto es muy importante.

Retry puede ser útil, pero también puede empeorar un problema si se usa mal.

Por ejemplo:

- si la dependencia está realmente caída,
- si el timeout es largo,
- si se reintenta demasiadas veces,
- o si el servicio remoto ya está bajo presión,

entonces el retry puede multiplicar el problema en lugar de aliviarlo.

Por eso esta clase no se trata solo de “activar reintentos”, sino de hacerlo con criterio.

---

## Paso 1 · Agregar configuración de retry en `order-service.yml`

Como `order-service` ya consume configuración centralizada, lo más razonable es agregar el bloque de retry en:

```txt
novamarket/config-repo/order-service.yml
```

Una base conceptual razonable podría verse así:

```yaml
resilience4j:
  retry:
    instances:
      inventoryService:
        maxAttempts: 3
        waitDuration: 500ms
```

Si ya venías usando el nombre `inventoryService` para otras piezas de resiliencia, conviene mantenerlo para no fragmentar el modelo mental del bloque.

---

## Qué expresan estos valores

### `maxAttempts: 3`
Le estamos diciendo al sistema que pruebe hasta tres veces en total.

### `waitDuration: 500ms`
Entre intento e intento va a esperar medio segundo.

Esto ya deja una estrategia bastante fácil de entender y de probar.

No es necesariamente la configuración definitiva para todos los escenarios, pero es una muy buena base para el curso práctico.

---

## Paso 2 · Aplicar `@Retry` sobre la llamada remota

Ahora vamos a proteger la llamada hacia inventario con retry.

Como ya habíamos extraído un método específico para consultar inventario, ese es el lugar natural donde aplicarlo.

Una versión razonable de `OrderService` podría moverse hacia algo así:

```java
package com.novamarket.order.service;

import com.novamarket.order.dto.CreateOrderItemRequest;
import com.novamarket.order.dto.CreateOrderRequest;
import com.novamarket.order.dto.InventoryItemResponse;
import com.novamarket.order.model.Order;
import com.novamarket.order.model.OrderItem;
import com.novamarket.order.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
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

    @Retry(name = "inventoryService")
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

## Por qué conviene aplicar retry justo acá

Porque este método representa claramente el punto más sensible del flujo distribuido actual.

No tiene mucho sentido agregar retry sobre toda la creación de orden.  
Lo que queremos reintentar es la llamada remota que puede fallar de forma transitoria.

Ese criterio es importante porque ayuda a usar resiliencia de forma quirúrgica y no indiscriminada.

---

## Paso 3 · Reiniciar `order-service`

Después de sumar configuración y anotación, reiniciá `order-service`.

Asegurate también de tener operativo el entorno completo necesario:

- Keycloak
- `config-server`
- `discovery-server`
- `api-gateway`
- `inventory-service`

Primero vamos a validar el caso sano, después provocaremos fallas.

---

## Paso 4 · Probar el caso feliz

Primero probá una orden válida con el sistema sano:

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

Este paso es importante porque cualquier mejora de resiliencia primero tiene que respetar el caso feliz.

---

## Paso 5 · Simular una falla breve o intermitente

Ahora conviene hacer una prueba donde el retry tenga oportunidad de ayudar.

Una forma didáctica de hacerlo puede ser:

- reiniciar rápidamente `inventory-service`,
- introducir una demora transitoria,
- o hacer una caída muy corta durante la llamada.

No hace falta que la simulación sea perfecta.  
Lo importante es intentar observar un escenario donde el primer intento falle, pero un intento posterior podría llegar a funcionar.

---

## Paso 6 · Observar si el retry ayuda

En este tipo de escenario, el retry puede mejorar el comportamiento si:

- la falla dura poco,
- el servicio remoto se recupera rápido,
- o la primera llamada falló por una condición transitoria.

Acá conviene mirar con bastante atención:

- la respuesta final,
- el tiempo total del request,
- y los logs de `order-service`.

---

## Paso 7 · Probar una caída total de inventario

Ahora hagamos la comparación importante.

Apagá completamente `inventory-service` y repetí la orden autenticada.

En este caso, lo esperable es que el retry **no resuelva** el problema, porque no hay una recuperación real del servicio remoto.

Lo que sí debería pasar es que el sistema:

- intente varias veces,
- y después falle de forma controlada.

Ese contraste es exactamente lo que queremos aprender en esta clase.

---

## Paso 8 · Mirar logs de `order-service`

Esta es una de las partes más valiosas de la clase.

Mirá la consola de `order-service` y fijate si podés detectar:

- reintentos repetidos,
- demoras entre intentos,
- error final,
- y paso posterior al fallback o al manejo controlado.

Aunque todavía no tengamos una observabilidad súper refinada del retry, ya se puede aprender muchísimo mirando cómo cambia el comportamiento respecto de una sola llamada fallida.

---

## Paso 9 · Pensar cuándo conviene retry y cuándo no

Después de probar ambos escenarios, la lectura importante es esta:

### Retry ayuda más cuando
- la falla es breve
- o la dependencia se recupera rápido

### Retry ayuda menos o empeora cuando
- la caída es total
- la espera es larga
- la presión sobre la dependencia ya es alta

Ese criterio es mucho más valioso que simplemente memorizar una anotación.

---

## Qué estamos logrando con esta clase

Esta clase le agrega a NovaMarket una capacidad nueva:

**la arquitectura ya no siempre falla al primer intento.**

Eso puede mejorar bastante la experiencia del flujo cuando hay problemas transitorios.

Pero además deja una enseñanza más profunda:

retry no es magia; es una herramienta que tiene sentido solo bajo ciertas condiciones.

---

## Qué todavía no hicimos

Todavía no:

- profundizamos el comportamiento del circuit breaker,
- analizamos estados abiertos o cerrados,
- ni exponemos métricas y estado por Actuator.

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**introducir retry con criterio.**

---

## Errores comunes en esta etapa

### 1. Agregar retry sobre un bloque demasiado grande
Conviene aplicarlo al punto exacto de llamada remota.

### 2. Reintentar demasiadas veces
Eso puede empeorar la presión sobre una dependencia degradada.

### 3. No probar una falla total además de una transitoria
El aprendizaje fuerte aparece justamente al comparar ambos casos.

### 4. Creer que retry resuelve indisponibilidad permanente
No; para eso necesitamos otras herramientas complementarias.

### 5. No mirar el impacto en latencia total
Un retry también cambia la experiencia temporal del request.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `order-service` debería:

- reintentar la llamada hacia inventario bajo una estrategia explícita,
- seguir funcionando correctamente en el caso feliz,
- y mostrar un comportamiento más interesante frente a fallas transitorias.

Eso deja el módulo mucho mejor preparado para trabajar el circuit breaker con más claridad.

---

## Punto de control

Antes de seguir, verificá que:

- existe configuración de retry,
- la llamada remota pasa por `@Retry`,
- el caso feliz sigue funcionando,
- probaste al menos un escenario transitorio y uno de caída total,
- y entendiste en qué casos el retry ayuda y en cuáles no.

Si eso está bien, ya podemos pasar al corazón más visible del módulo de resiliencia: el circuit breaker.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a trabajar específicamente con **circuit breaker**.

Ahí vamos a empezar a ver estados, apertura del circuito y protección más clara frente a fallas repetidas.

---

## Cierre

En esta clase agregamos retry a la llamada hacia inventario.

Con eso, NovaMarket ya puede tolerar mejor ciertos problemas transitorios, y al mismo tiempo deja mucho más clara una idea central de la resiliencia: no toda falla se trata igual, y no toda herramienta sirve para todos los escenarios.
