---
title: "Conectando order-service con inventory-service usando llamada simple"
description: "Primera integración real entre microservicios en NovaMarket. order-service consulta a inventory-service por HTTP para validar disponibilidad antes de crear una orden."
order: 14
module: "Módulo 2 · Primer flujo funcional del sistema"
level: "intermedio"
draft: false
---

# Conectando `order-service` con `inventory-service` usando llamada simple

Hasta ahora, `order-service` ya puede recibir una orden y devolver una respuesta con estado `CREATED`.

Pero todavía hay un problema importante:  
**crea órdenes sin verificar si existe stock disponible**.

Eso significa que el flujo todavía no refleja una regla básica del negocio.

En esta clase vamos a dar un paso muy importante en el curso práctico:

**hacer que `order-service` consulte a `inventory-service` antes de crear una orden.**

Todavía no vamos a usar Eureka ni OpenFeign.  
La idea es empezar con una integración simple por HTTP para entender bien el mecanismo y verificarlo manualmente antes de introducir herramientas más sofisticadas.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar funcionando lo siguiente:

- `order-service` consulta a `inventory-service` por HTTP,
- valida si hay stock para cada ítem recibido,
- crea la orden solo si todos los productos tienen disponibilidad,
- y rechaza la operación cuando falta stock o no existe inventario para un producto.

Esto marca la primera integración real entre microservicios en NovaMarket.

---

## Estado de partida

Partimos de este contexto:

- `catalog-service` ya expone el catálogo,
- `inventory-service` ya expone:
  - `GET /inventory`
  - `GET /inventory/{productId}`
- `order-service` ya expone:
  - `POST /orders`

Pero ese endpoint todavía crea órdenes sin consultar stock.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear un cliente HTTP simple en `order-service`,
- consumir `inventory-service` por URL fija,
- validar disponibilidad para cada ítem,
- ajustar la lógica de creación de órdenes,
- y probar escenarios válidos e inválidos.

---

## Estrategia recomendada para esta etapa

Como todavía no estamos en la fase de discovery ni Feign, conviene usar una solución simple y explícita.

La idea es que `order-service`:

- haga una llamada HTTP a `inventory-service`,
- consulte el stock de cada `productId`,
- y compare la cantidad solicitada contra `availableQuantity`.

Para eso vamos a usar una aproximación simple apoyada en `RestTemplate` o en un cliente HTTP equivalente.

En esta etapa del curso práctico, lo importante no es la sofisticación, sino que el flujo distribuido empiece a funcionar y se pueda verificar claramente.

---

## Paso 1 · Crear un DTO para leer la respuesta de inventario

Dentro de `order-service`, conviene crear una clase para mapear la respuesta que viene desde `inventory-service`.

Creá:

```txt
src/main/java/com/novamarket/order/dto/InventoryItemResponse.java
```

Una versión razonable podría ser:

```java
package com.novamarket.order.dto;

public class InventoryItemResponse {

    private Long productId;
    private Integer availableQuantity;

    public InventoryItemResponse() {
    }

    public InventoryItemResponse(Long productId, Integer availableQuantity) {
        this.productId = productId;
        this.availableQuantity = availableQuantity;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }
}
```

---

## Paso 2 · Registrar un `RestTemplate`

Dentro de `order-service`, creá una configuración simple para exponer un `RestTemplate` como bean.

Creá:

```txt
src/main/java/com/novamarket/order/config/HttpClientConfig.java
```

Una implementación inicial razonable podría ser:

```java
package com.novamarket.order.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class HttpClientConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

---

## Paso 3 · Crear un cliente simple para inventario

Ahora conviene encapsular la llamada HTTP en una clase específica.

Creá:

```txt
src/main/java/com/novamarket/order/service/InventoryClient.java
```

Una implementación base podría ser:

```java
package com.novamarket.order.service;

import com.novamarket.order.dto.InventoryItemResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class InventoryClient {

    private final RestTemplate restTemplate;

    public InventoryClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public InventoryItemResponse findByProductId(Long productId) {
        try {
            return restTemplate.getForObject(
                    "http://localhost:8082/inventory/{productId}",
                    InventoryItemResponse.class,
                    productId
            );
        } catch (RestClientException ex) {
            return null;
        }
    }
}
```

En esta etapa usamos la URL fija de `inventory-service` porque todavía no vimos discovery.

---

## Paso 4 · Ajustar `OrderService`

Ahora vamos a modificar `OrderService` para que valide stock antes de crear la orden.

Una versión simple y razonable podría quedar así:

```java
package com.novamarket.order.service;

import com.novamarket.order.dto.CreateOrderRequest;
import com.novamarket.order.dto.InventoryItemResponse;
import com.novamarket.order.model.Order;
import com.novamarket.order.model.OrderItem;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicLong;

@Service
public class OrderService {

    private final AtomicLong idGenerator = new AtomicLong(1);
    private final InventoryClient inventoryClient;

    public OrderService(InventoryClient inventoryClient) {
        this.inventoryClient = inventoryClient;
    }

    public Order createOrder(CreateOrderRequest request) {
        for (OrderItem item : request.getItems()) {
            InventoryItemResponse inventory = inventoryClient.findByProductId(item.getProductId());

            if (inventory == null || inventory.getAvailableQuantity() == null) {
                throw new IllegalArgumentException("No se pudo obtener inventario para el producto " + item.getProductId());
            }

            if (inventory.getAvailableQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Stock insuficiente para el producto " + item.getProductId());
            }
        }

        return new Order(
                idGenerator.getAndIncrement(),
                "CREATED",
                request.getItems()
        );
    }
}
```

---

## Paso 5 · Mejorar el manejo de errores del controlador

Si `OrderService` lanza `IllegalArgumentException`, conviene responder algo más claro que un error genérico.

Podés ajustar `OrderController` así:

```java
package com.novamarket.order.controller;

import com.novamarket.order.dto.CreateOrderRequest;
import com.novamarket.order.model.Order;
import com.novamarket.order.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            Order order = orderService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
```

Esto ya nos deja respuestas bastante más claras para esta etapa del proyecto.

---

## Paso 6 · Levantar `inventory-service` y `order-service`

Ahora sí, para probar esta integración, necesitamos tener ambos servicios arriba al mismo tiempo.

Conviene levantar:

- `inventory-service`
- `order-service`

Y si querés también `catalog-service`, aunque para esta prueba no es estrictamente necesario.

---

## Paso 7 · Probar una orden válida

Probá un request con productos que sí tengan stock.

Por ejemplo:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 2, "quantity": 1 }
    ]
  }'
```

La respuesta esperada debería ser:

- `201 Created`
- una orden con estado `CREATED`

Porque en nuestra data de ejemplo esos productos tienen stock suficiente.

---

## Paso 8 · Probar una orden inválida por falta de stock

Ahora probá un request donde la cantidad supere el stock disponible.

Por ejemplo, si el producto `3` tiene `8` unidades:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 3, "quantity": 20 }
    ]
  }'
```

La respuesta esperada ahora debería ser:

- `400 Bad Request`
- un JSON con un mensaje de error parecido a:
  - `"Stock insuficiente para el producto 3"`

---

## Paso 9 · Probar un producto inexistente en inventario

Conviene probar también un producto que no exista en `inventory-service`.

Por ejemplo:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 99, "quantity": 1 }
    ]
  }'
```

La respuesta debería ser un error controlado indicando que no se pudo obtener inventario.

---

## Qué estamos logrando con esta clase

Esta clase tiene muchísimo valor porque por primera vez NovaMarket deja de ser una suma de APIs separadas y empieza a comportarse como un sistema distribuido de verdad.

Ahora ya existe una dependencia real entre servicios:

- `order-service` no decide solo,
- depende de lo que informe `inventory-service`.

Ese cambio es muy importante en el curso.

---

## Qué todavía no hicimos

Todavía no estamos usando:

- OpenFeign,
- Eureka,
- balanceo,
- circuit breaker,
- ni timeouts finos.

Tampoco estamos persistiendo órdenes ni descontando stock.

Todo eso va a venir después.

La meta de esta clase es mucho más concreta:

**que la primera integración HTTP simple funcione y quede verificada.**

---

## Errores comunes en esta etapa

### 1. No tener levantado `inventory-service`
En ese caso, `order-service` no va a poder validar stock.

### 2. Mapear mal la respuesta remota
Si el DTO no coincide con el JSON de inventario, la integración falla.

### 3. No manejar el caso de producto inexistente
Conviene responder con error controlado.

### 4. Mezclar ya Feign o discovery antes de tiempo
Esta clase busca que primero entiendas la integración simple.

### 5. No probar escenarios de éxito y de error
Acá es muy importante validar ambos caminos.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `order-service` debería:

- consultar `inventory-service`,
- validar disponibilidad por producto,
- crear la orden solo cuando hay stock,
- y rechazarla con un error controlado cuando no lo hay.

Esto deja el primer flujo distribuido real de NovaMarket en funcionamiento.

---

## Punto de control

Antes de seguir, verificá que:

- existe `InventoryItemResponse`,
- existe `InventoryClient`,
- `OrderService` valida stock,
- una orden válida se crea correctamente,
- una orden inválida por falta de stock se rechaza,
- y la integración HTTP entre servicios ya funciona.

Si eso está bien, ya podemos probar el flujo completo de punta a punta.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a detenernos a probar el flujo funcional completo que construimos hasta acá.

La idea va a ser verificar NovaMarket como sistema mínimo antes de pasar al siguiente gran bloque del curso: la persistencia real.

---

## Cierre

En esta clase conectamos por primera vez `order-service` con `inventory-service` usando una llamada HTTP simple.

Con eso, NovaMarket da su primer paso real como arquitectura distribuida: la creación de órdenes ya depende de otro servicio y empieza a respetar una regla básica del negocio.
