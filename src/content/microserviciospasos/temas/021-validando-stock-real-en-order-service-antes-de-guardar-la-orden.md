---
title: "Validando stock real en order-service antes de guardar la orden"
description: "Modificar order-service para consultar el endpoint real de stock en inventory-service antes de guardar una orden."
order: 21
module: "Módulo 4 · Primer dominio real"
level: "base"
draft: false
---

# Objetivo operativo

Hacer que `order-service` consulte el stock real en `inventory-service` antes de guardar una orden.

---

## Acciones

### 1. Crear el paquete `dto` si no existe en `order-service`

Verificar que exista:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/dto/
```

---

### 2. Crear el DTO `StockCheckResponse`

Crear el archivo:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/dto/StockCheckResponse.java
```

Pegar esto:

```java
package com.novamarket.orderservice.dto;

public class StockCheckResponse {

    private String productSlug;
    private Integer requestedQuantity;
    private Integer availableQuantity;
    private Boolean available;

    public StockCheckResponse() {
    }

    public String getProductSlug() {
        return productSlug;
    }

    public Integer getRequestedQuantity() {
        return requestedQuantity;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setProductSlug(String productSlug) {
        this.productSlug = productSlug;
    }

    public void setRequestedQuantity(Integer requestedQuantity) {
        this.requestedQuantity = requestedQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }
}
```

---

### 3. Reemplazar `InventoryClientService`

Abrir:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/service/InventoryClientService.java
```

Reemplazar todo el contenido por esto:

```java
package com.novamarket.orderservice.service;

import com.novamarket.orderservice.dto.StockCheckResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class InventoryClientService {

    private final RestClient.Builder restClientBuilder;

    public InventoryClientService(RestClient.Builder restClientBuilder) {
        this.restClientBuilder = restClientBuilder;
    }

    public String pingInventory() {
        return restClientBuilder
                .build()
                .get()
                .uri("http://INVENTORY-SERVICE/api/inventory/ping")
                .retrieve()
                .body(String.class);
    }

    public boolean canCreateOrder(String productSlug, Integer quantity) {
        StockCheckResponse response = restClientBuilder
                .build()
                .get()
                .uri("http://INVENTORY-SERVICE/api/inventory/check?productSlug={productSlug}&quantity={quantity}",
                        productSlug, quantity)
                .retrieve()
                .body(StockCheckResponse.class);

        return response != null && Boolean.TRUE.equals(response.getAvailable());
    }
}
```

---

### 4. Modificar `OrderController`

Abrir:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/controller/OrderController.java
```

Buscar el método `create` y reemplazarlo por este:

```java
@PostMapping("/api/orders")
public CustomerOrder create(@RequestBody CreateOrderRequest request) {
    boolean inventoryAvailable = inventoryClientService.canCreateOrder(
            request.getProductSlug(),
            request.getQuantity()
    );

    if (!inventoryAvailable) {
        throw new IllegalStateException("Insufficient stock");
    }

    CustomerOrder order = new CustomerOrder();
    order.setProductSlug(request.getProductSlug());
    order.setQuantity(request.getQuantity());
    order.setStatus("CREATED");
    order.setCreatedAt(LocalDateTime.now());

    return customerOrderRepository.save(order);
}
```

---

### 5. Reiniciar `order-service`

Detener `order-service` si está corriendo.

Volver a ejecutarlo.

---

### 6. Probar una orden válida directo en `order-service`

Hacer un `POST` a:

```txt
http://localhost:8083/api/orders
```

Con este JSON:

```json
{
  "productSlug": "mouse-inalambrico",
  "quantity": 2
}
```

Debe devolver una orden guardada.

---

### 7. Probar una orden inválida directo en `order-service`

Hacer un `POST` a:

```txt
http://localhost:8083/api/orders
```

Con este JSON:

```json
{
  "productSlug": "mouse-inalambrico",
  "quantity": 200
}
```

Debe fallar.

---

### 8. Probar una orden válida a través del gateway

Hacer un `POST` a:

```txt
http://localhost:8080/api/orders
```

Con este JSON:

```json
{
  "productSlug": "teclado-mecanico",
  "quantity": 1
}
```

Debe devolver una orden guardada.

---

### 9. Verificar listado de órdenes a través del gateway

Abrir:

```txt
http://localhost:8080/api/orders
```

Comprobar que las órdenes válidas quedaron guardadas.

---

### 10. Verificar la base

Ejecutar:

```sql
SELECT id, product_slug, quantity, status, created_at
FROM customer_order
ORDER BY id;
```

Comprobar que la orden inválida no fue insertada.

---

## Verificación rápida

Comprobar que:

- `order-service` consulta el endpoint real de stock
- una orden con stock suficiente se guarda
- una orden sin stock suficiente falla
- todo sigue funcionando también a través del gateway

---

## Resultado esperado

Tener creación de órdenes validando stock real contra `inventory-service` antes de guardar en la base.

---

## Siguiente archivo

El siguiente tramo práctico debería cubrir:

- categorías y productos más completos
- refactor del catálogo hacia un dominio más parecido al curso teórico
- o el comienzo del bloque de seguridad
