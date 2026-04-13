---
title: "Ajustando DTOs, validaciones y respuestas"
description: "Refinamiento de la API de NovaMarket. Separación entre modelos y contratos HTTP, incorporación de validaciones básicas y mejora de respuestas en order-service."
order: 20
module: "Módulo 3 · Persistencia real con JPA"
level: "intermedio"
draft: false
---

# Ajustando DTOs, validaciones y respuestas

Hasta este punto, **NovaMarket** ya tiene un flujo bastante valioso:

- catálogo persistente,
- inventario persistente,
- órdenes persistentes,
- y validación de stock antes de crear una orden.

Pero todavía hay algo que podemos mejorar bastante:

**la calidad del contrato HTTP.**

En varias clases usamos modelos del dominio directamente en requests o responses porque era una forma rápida de avanzar.  
Eso estuvo bien para arrancar, pero ahora el proyecto ya llegó a un punto donde conviene hacer una limpieza importante:

- separar contratos HTTP del modelo interno,
- validar mejor la entrada,
- y devolver respuestas más claras y más estables.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar mejorado el contrato de `order-service` a través de:

- DTOs de entrada más claros,
- validaciones básicas sobre la request,
- respuestas más expresivas,
- y una separación más prolija entre modelo del dominio y API externa.

No vamos a cambiar el flujo funcional central.  
Vamos a **refinarlo**.

---

## Estado de partida

En este punto tenemos:

- `catalog-service` persistente,
- `inventory-service` persistente,
- `order-service` persistente,
- y `POST /orders` funcionando.

Pero todavía hay algunos puntos mejorables:

- `CreateOrderRequest` usa directamente `OrderItem`,
- faltan validaciones explícitas,
- y la respuesta del endpoint es simplemente la entidad `Order`.

Eso no está mal como paso intermedio, pero ya podemos llevarlo a una versión bastante más profesional.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear DTOs específicos para request y response,
- agregar Bean Validation,
- mejorar el controller,
- y verificar que la API siga funcionando, pero con un contrato más claro.

---

## Qué problema queremos resolver

Queremos evitar este tipo de acoplamiento:

- usar directamente una clase del dominio como contrato externo,
- depender de que la estructura interna del modelo siempre coincida con la API,
- y permitir requests poco claras o inválidas.

La meta es que `order-service` tenga una frontera HTTP más limpia.

---

## Paso 1 · Crear `CreateOrderItemRequest`

Dentro de `order-service`, creá:

```txt
src/main/java/com/novamarket/order/dto/CreateOrderItemRequest.java
```

Una versión razonable podría ser:

```java
package com.novamarket.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CreateOrderItemRequest {

    @NotNull(message = "productId es obligatorio")
    private Long productId;

    @NotNull(message = "quantity es obligatoria")
    @Min(value = 1, message = "quantity debe ser mayor o igual a 1")
    private Integer quantity;

    public CreateOrderItemRequest() {
    }

    public CreateOrderItemRequest(Long productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
```

---

## Paso 2 · Ajustar `CreateOrderRequest`

Ahora modifiquemos `CreateOrderRequest` para que ya no use `OrderItem`, sino el DTO recién creado.

```java
package com.novamarket.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreateOrderRequest {

    @NotEmpty(message = "items no puede estar vacío")
    @Valid
    private List<CreateOrderItemRequest> items;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(List<CreateOrderItemRequest> items) {
        this.items = items;
    }

    public List<CreateOrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<CreateOrderItemRequest> items) {
        this.items = items;
    }
}
```

Fijate que ahora el request queda bastante más explícito y validable.

---

## Paso 3 · Crear un DTO de respuesta

Ahora conviene dejar de devolver directamente la entidad `Order`.

Creá:

```txt
src/main/java/com/novamarket/order/dto/OrderResponse.java
```

Una versión simple y útil podría ser:

```java
package com.novamarket.order.dto;

import java.util.List;

public class OrderResponse {

    private Long id;
    private String status;
    private List<OrderItemResponse> items;

    public OrderResponse() {
    }

    public OrderResponse(Long id, String status, List<OrderItemResponse> items) {
        this.id = id;
        this.status = status;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }
}
```

Y también:

```txt
src/main/java/com/novamarket/order/dto/OrderItemResponse.java
```

```java
package com.novamarket.order.dto;

public class OrderItemResponse {

    private Long productId;
    private Integer quantity;

    public OrderItemResponse() {
    }

    public OrderItemResponse(Long productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
```

---

## Paso 4 · Mapear request hacia modelo

Ahora toca ajustar `OrderService` para transformar los DTOs de entrada en el modelo interno `OrderItem`.

Una versión razonable del método `createOrder` podría quedar así:

```java
package com.novamarket.order.service;

import com.novamarket.order.dto.CreateOrderItemRequest;
import com.novamarket.order.dto.CreateOrderRequest;
import com.novamarket.order.dto.InventoryItemResponse;
import com.novamarket.order.model.Order;
import com.novamarket.order.model.OrderItem;
import com.novamarket.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final InventoryClient inventoryClient;
    private final OrderRepository orderRepository;

    public OrderService(InventoryClient inventoryClient, OrderRepository orderRepository) {
        this.inventoryClient = inventoryClient;
        this.orderRepository = orderRepository;
    }

    public Order createOrder(CreateOrderRequest request) {
        List<OrderItem> items = request.getItems().stream()
                .map(this::toOrderItem)
                .toList();

        for (OrderItem item : items) {
            InventoryItemResponse inventory = inventoryClient.findByProductId(item.getProductId());

            if (inventory == null || inventory.getAvailableQuantity() == null) {
                throw new IllegalArgumentException("No se pudo obtener inventario para el producto " + item.getProductId());
            }

            if (inventory.getAvailableQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Stock insuficiente para el producto " + item.getProductId());
            }
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

## Paso 5 · Mapear entidad hacia response

Ahora ajustemos `OrderController` para devolver un `OrderResponse` en lugar de la entidad cruda.

Una versión razonable podría ser:

```java
package com.novamarket.order.controller;

import com.novamarket.order.dto.*;
import com.novamarket.order.model.Order;
import com.novamarket.order.model.OrderItem;
import com.novamarket.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        try {
            Order order = orderService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(order));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Request inválido");

        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::toItemResponse)
                .toList();

        return new OrderResponse(order.getId(), order.getStatus(), items);
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(item.getProductId(), item.getQuantity());
    }
}
```

---

## Paso 6 · Probar request válida

Levantá `inventory-service` y `order-service`, y probá:

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

La respuesta debería seguir siendo `201 Created`, pero ahora con un contrato más limpio y explícito.

---

## Paso 7 · Probar request inválida por validación

Ahora probá un caso inválido, por ejemplo una cantidad cero:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 0 }
    ]
  }'
```

La respuesta esperada ahora debería ser:

- `400 Bad Request`
- un mensaje como:
  - `"quantity debe ser mayor o igual a 1"`

También conviene probar un body vacío:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": []
  }'
```

Y otro caso con `productId` ausente.

---

## Qué estamos logrando con esta clase

Esta clase mejora mucho la calidad de la API sin cambiar todavía la arquitectura global.

Ahora `order-service`:

- separa mejor la entrada del dominio interno,
- valida explícitamente la request,
- devuelve una respuesta más controlada,
- y empieza a comportarse como un servicio más serio desde el punto de vista del contrato HTTP.

Eso tiene muchísimo valor antes de entrar a bloques como Config Server, Eureka y Gateway.

---

## Qué todavía no estamos haciendo

Todavía no estamos:

- agregando un manejo de errores global más sofisticado,
- versionando la API,
- devolviendo un formato uniforme para todos los errores del sistema,
- ni agregando DTOs equivalentes en todos los servicios.

Todo eso puede aparecer después.

La meta de hoy es más concreta:

**que `order-service` tenga un contrato más claro, validable y mantenible.**

---

## Errores comunes en esta etapa

### 1. Seguir usando `OrderItem` directamente en el request
Eso acopla el contrato HTTP al modelo interno.

### 2. Olvidar `@Valid`
Entonces Bean Validation no se ejecuta como esperamos.

### 3. No validar la lista de ítems
Una orden vacía no debería aceptarse.

### 4. Devolver directamente la entidad persistente
Conviene desacoplar la respuesta desde ahora.

### 5. No probar casos inválidos
Esta clase tiene valor justamente porque mejora el comportamiento frente a inputs incorrectos.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `order-service` debería:

- recibir requests mediante DTOs explícitos,
- validar mejor la entrada,
- devolver respuestas más cuidadas,
- y mantener operativo `POST /orders`.

Esto mejora bastante la calidad de la API antes de entrar a configuración centralizada.

---

## Punto de control

Antes de seguir, verificá que:

- existe `CreateOrderItemRequest`,
- `CreateOrderRequest` ya no usa `OrderItem`,
- existe `OrderResponse`,
- la validación funciona,
- y `POST /orders` sigue operando correctamente con stock persistente.

Si eso está bien, ya podemos pasar al siguiente gran bloque del curso.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar el bloque de **configuración centralizada**, creando `config-server`.

Eso va a marcar un cambio importante en la arquitectura de NovaMarket.

---

## Cierre

En esta clase refinamos bastante la API de órdenes.

Sin cambiar el flujo principal, mejoramos el contrato HTTP, agregamos validaciones y desacoplamos mejor los DTOs del modelo interno.

Ese tipo de mejora silenciosa pero importante es exactamente lo que hace que NovaMarket siga creciendo con una base más profesional.
