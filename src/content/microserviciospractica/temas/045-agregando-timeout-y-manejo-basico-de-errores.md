---
title: "Agregando timeout y manejo básico de errores"
description: "Primer endurecimiento del flujo distribuido en NovaMarket. Configuración de timeout y mejora del manejo básico de errores cuando inventory-service falla o responde mal."
order: 45
module: "Módulo 8 · Resiliencia aplicada"
level: "intermedio"
draft: false
---

# Agregando timeout y manejo básico de errores

En la clase anterior provocamos fallas reales en `inventory-service` y vimos algo importante:

**el sistema actual sufre demasiado cuando una dependencia crítica deja de responder.**

Eso es completamente normal para el punto del proyecto en el que estábamos, pero ahora toca mejorar esa situación.

Todavía no vamos a introducir Resilience4j ni circuit breaker.  
Primero conviene hacer algo más básico y muy valioso:

- limitar mejor cuánto estamos dispuestos a esperar,
- y mejorar la forma en que el sistema responde cuando la dependencia falla.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- configurado un timeout razonable para la llamada hacia inventario,
- mejorado el manejo del error técnico cuando el servicio remoto falla,
- y más controlada la respuesta que recibe el cliente cuando una dependencia no está disponible.

Todavía no vamos a resolver el problema completo, pero sí vamos a lograr que falle **mejor**.

---

## Estado de partida

Partimos de este contexto:

- `order-service` usa Feign para consultar `inventory-service`,
- si inventario falla, el flujo de órdenes se rompe,
- y la respuesta actual todavía puede ser poco amigable o poco controlada.

Ya vimos el problema.  
Ahora vamos a dar el primer paso para hacerlo menos caótico.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar cómo configurar timeout en el cliente remoto,
- mejorar el tratamiento de errores en `order-service`,
- devolver respuestas más controladas,
- y volver a probar el sistema con inventario caído o degradado.

---

## Qué problema queremos resolver exactamente

Cuando un servicio remoto falla, hay dos dolores bastante típicos:

### 1. Esperar demasiado
Si la llamada tarda más de lo razonable, el usuario sufre una experiencia mala y el sistema acumula presión.

### 2. Fallar de forma poco clara
Si el servicio responde con una excepción técnica desordenada o con un mensaje poco útil, cuesta entender qué pasó.

Esta clase apunta justamente a esos dos problemas.

---

## Paso 1 · Revisar la configuración del cliente Feign

Como `order-service` ya usa OpenFeign, una forma muy razonable de empezar es ajustar la configuración de timeout del cliente.

Podés hacerlo a través de la configuración centralizada del servicio, por ejemplo en:

```txt
novamarket/config-repo/order-service.yml
```

Una base conceptual razonable podría ser agregar algo como:

```yaml
spring:
  application:
    name: order-service
  datasource:
    url: jdbc:h2:mem:orderdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8084/realms/novamarket

server:
  port: 8083

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka

order:
  validation:
    stock-required: true

feign:
  client:
    config:
      inventory-service:
        connectTimeout: 2000
        readTimeout: 2000
```

La sintaxis exacta puede variar según la variante de OpenFeign que estés usando, pero conceptualmente queremos dejar tiempos de espera explícitos y razonables.

---

## Por qué esto ya mejora bastante el sistema

Si no definimos tiempos de espera claros, el sistema puede quedarse bloqueado más tiempo del que conviene cuando una dependencia se degrada.

Con un timeout razonable, la aplicación deja de esperar indefinidamente o demasiado tiempo y puede reaccionar antes.

Eso no resuelve toda la resiliencia, pero sí mejora bastante la experiencia.

---

## Paso 2 · Revisar el manejo actual de excepciones en `order-service`

Ahora mirá cómo está reaccionando hoy `OrderService` cuando Feign no puede obtener inventario.

Lo más probable es que hoy tengamos un manejo todavía demasiado crudo.

La idea es capturar mejor el problema técnico y transformarlo en una respuesta más clara para el cliente.

---

## Paso 3 · Mejorar `OrderService` para capturar errores remotos

Una forma simple y razonable de empezar es capturar la excepción del cliente remoto y traducirla a una excepción de aplicación más entendible.

Por ejemplo, podrías ajustar `OrderService` de forma conceptual hacia algo como esto:

```java
package com.novamarket.order.service;

import com.novamarket.order.dto.CreateOrderItemRequest;
import com.novamarket.order.dto.CreateOrderRequest;
import com.novamarket.order.dto.InventoryItemResponse;
import com.novamarket.order.model.Order;
import com.novamarket.order.model.OrderItem;
import com.novamarket.order.repository.OrderRepository;
import feign.FeignException;
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

        try {
            for (OrderItem item : items) {
                InventoryItemResponse inventory = inventoryFeignClient.findByProductId(item.getProductId());

                if (inventory == null || inventory.getAvailableQuantity() == null) {
                    throw new IllegalArgumentException("No se pudo obtener inventario para el producto " + item.getProductId());
                }

                if (inventory.getAvailableQuantity() < item.getQuantity()) {
                    throw new IllegalArgumentException("Stock insuficiente para el producto " + item.getProductId());
                }
            }
        } catch (FeignException ex) {
            throw new InventoryUnavailableException("El servicio de inventario no está disponible en este momento");
        }

        Order order = new Order("CREATED", items);
        return orderRepository.save(order);
    }

    private OrderItem toOrderItem(CreateOrderItemRequest item) {
        return new OrderItem(item.getProductId(), item.getQuantity());
    }
}
```

---

## Paso 4 · Crear una excepción específica del dominio técnico

Ahora conviene crear una excepción propia, por ejemplo:

```txt
src/main/java/com/novamarket/order/service/InventoryUnavailableException.java
```

Una versión simple podría ser:

```java
package com.novamarket.order.service;

public class InventoryUnavailableException extends RuntimeException {

    public InventoryUnavailableException(String message) {
        super(message);
    }
}
```

Esto mejora bastante la claridad del flujo, porque deja de mezclarse el problema técnico remoto con errores de negocio comunes como “stock insuficiente”.

---

## Paso 5 · Mejorar el controller para responder mejor

Ahora podemos ajustar `OrderController` para devolver una respuesta más clara cuando inventario está caído.

Por ejemplo:

```java
@PostMapping
public ResponseEntity<?> createOrder(
        @Valid @RequestBody CreateOrderRequest request,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {

    try {
        Order order = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(order));
    } catch (InventoryUnavailableException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", ex.getMessage()));
    } catch (IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}
```

Con esto ya logramos una distinción valiosa:

- errores de negocio → `400`
- indisponibilidad técnica de inventario → `503`

Eso hace mucho más legible el comportamiento del sistema.

---

## Paso 6 · Reiniciar `order-service`

Después de aplicar estos cambios, reiniciá `order-service`.

También conviene tener listo el entorno para la prueba:

- `config-server`
- `discovery-server`
- `api-gateway`
- Keycloak
- y `inventory-service`, al menos al principio

La idea es validar primero que el flujo sano siga funcionando antes de romperlo de nuevo.

---

## Paso 7 · Verificar que el flujo sano sigue funcionando

Primero probá una orden válida con el sistema sano.

Por ejemplo:

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

Esto confirma que el endurecimiento del cliente no rompió el caso feliz.

---

## Paso 8 · Apagar o degradar `inventory-service` otra vez

Ahora repetí la prueba de la clase anterior:

- apagá `inventory-service`,
- o generá una falla equivalente,
- y volvé a ejecutar el request autenticado.

---

## Paso 9 · Observar la nueva respuesta

Ahora el sistema debería comportarse mejor que antes.

En lugar de una falla más cruda o caótica, lo esperable es algo más parecido a:

- `503 Service Unavailable`
- con un mensaje claro del estilo:
  - “El servicio de inventario no está disponible en este momento”

Eso representa una mejora importante, aunque todavía no hay resiliencia avanzada.

---

## Paso 10 · Pensar qué parte del problema ya resolvimos y cuál no

Después de esta clase, conviene dejar bien claro esto:

### Ya mejoramos
- la espera tiene límites más claros
- el error técnico se traduce mejor
- la respuesta al cliente es más entendible

### Todavía no resolvimos
- reintentos
- apertura/cierre de circuit breaker
- degradación controlada más avanzada
- protección frente a cascadas de fallos

Eso nos deja muy bien posicionados para la próxima clase.

---

## Qué estamos logrando con esta clase

Esta clase transforma un fallo distribuido crudo en un fallo más controlado.

Ese cambio puede parecer pequeño, pero en realidad es muy importante:

**el sistema empieza a comportarse con más madurez cuando algo sale mal.**

Y eso es exactamente lo que buscamos al entrar al bloque de resiliencia.

---

## Qué todavía no hicimos

Todavía no usamos Resilience4j.  
Todo lo que hicimos hoy fue:

- timeout
- y mejor tratamiento básico del error

Eso es importante porque nos deja entender que la resiliencia no empieza con una librería mágica, sino con decisiones correctas sobre espera y respuesta.

---

## Errores comunes en esta etapa

### 1. Dejar timeouts demasiado altos
Entonces el sistema sigue sufriendo demasiado antes de fallar.

### 2. Tratar indisponibilidad remota igual que error de negocio
Eso confunde mucho al cliente.

### 3. Capturar excepciones de forma demasiado genérica
Conviene identificar bien la naturaleza del problema remoto.

### 4. No volver a probar el caso feliz
Siempre hay que comprobar que no rompimos lo que funcionaba.

### 5. Creer que con esto ya alcanza
Todavía no.  
La resiliencia recién está empezando.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería:

- esperar menos cuando inventario falla,
- responder mejor ante esa falla,
- y distinguir mejor entre un problema de negocio y una indisponibilidad técnica.

Eso deja el terreno listo para integrar una herramienta de resiliencia más seria.

---

## Punto de control

Antes de seguir, verificá que:

- existe una configuración de timeout,
- `order-service` captura mejor fallas remotas,
- la respuesta técnica ahora es más clara,
- el caso feliz sigue funcionando,
- y una caída de `inventory-service` se traduce mejor.

Si eso está bien, ya podemos pasar a integrar Resilience4j.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a integrar **Resilience4j** en `order-service`.

Ese será el primer paso donde la resiliencia dejará de ser solo buena configuración y manejo básico para pasar a una estrategia más robusta y explícita.

---

## Cierre

En esta clase agregamos timeout y un manejo básico más sano de errores remotos.

Con eso, NovaMarket ya no reacciona de una forma tan cruda cuando inventario falla y queda mucho mejor preparado para incorporar resiliencia más avanzada en la siguiente etapa.
