---
title: "Validando inventory-service antes de guardar la orden en order-service"
description: "Modificar order-service para llamar a inventory-service antes de guardar la orden y probar la creación real de órdenes a través del gateway."
order: 15
module: "Módulo 4 · Primer dominio real"
level: "base"
draft: false
---

# Objetivo operativo

Hacer que `order-service` consulte a `inventory-service` antes de guardar una orden y probar la creación real de órdenes a través de `api-gateway`.

---

## Acciones

### 1. Abrir el servicio `InventoryClientService`

Abrir:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/service/InventoryClientService.java
```

---

### 2. Reemplazar el contenido por esta versión

Pegar esto:

```java
package com.novamarket.orderservice.service;

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

    public boolean canCreateOrder() {
        String response = restClientBuilder
                .build()
                .get()
                .uri("http://INVENTORY-SERVICE/api/inventory/ping")
                .retrieve()
                .body(String.class);

        return "inventory-service ok".equals(response);
    }
}
```

---

### 3. Abrir el controlador de `order-service`

Abrir:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/controller/OrderController.java
```

---

### 4. Reemplazar el método `create`

Buscar este método:

```java
@PostMapping("/api/orders")
public CustomerOrder create(@RequestBody CreateOrderRequest request) {
    CustomerOrder order = new CustomerOrder();
    order.setProductSlug(request.getProductSlug());
    order.setQuantity(request.getQuantity());
    order.setStatus("CREATED");
    order.setCreatedAt(LocalDateTime.now());
    return customerOrderRepository.save(order);
}
```

Reemplazarlo por este:

```java
@PostMapping("/api/orders")
public CustomerOrder create(@RequestBody CreateOrderRequest request) {
    boolean inventoryAvailable = inventoryClientService.canCreateOrder();

    if (!inventoryAvailable) {
        throw new IllegalStateException("Inventory service unavailable");
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

### 5. Agregar la ruta de `order-service` si todavía no está

Abrir:

```txt
config-repo/api-gateway.yml
```

Verificar que exista esta ruta:

```yaml
- id: order-service-route
  uri: lb://ORDER-SERVICE
  predicates:
    - Path=/api/orders/**
```

Si no existe, agregarla dentro de `routes`.

---

### 6. Reiniciar `api-gateway`

Detener `api-gateway` si está corriendo.

Volver a ejecutarlo.

---

### 7. Reiniciar `order-service`

Detener `order-service` si está corriendo.

Volver a ejecutarlo.

---

### 8. Probar creación de una orden directo en `order-service`

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

Debe devolver una orden guardada con `status=CREATED`.

---

### 9. Probar creación de una orden a través del gateway

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

### 10. Verificar listado de órdenes a través del gateway

Abrir:

```txt
http://localhost:8080/api/orders
```

Debe devolver la lista JSON de órdenes creadas.

---

### 11. Verificar en la base

Ejecutar:

```sql
SELECT id, product_slug, quantity, status, created_at
FROM customer_order
ORDER BY id;
```

Comprobar que las nuevas órdenes quedaron guardadas.

---

## Verificación rápida

Comprobar que:

- `order-service` sigue pudiendo llamar a `inventory-service`
- se puede crear una orden directo en el puerto `8083`
- se puede crear una orden a través de `api-gateway`
- las órdenes se guardan en PostgreSQL

---

## Resultado esperado

Tener el primer flujo real de creación de órdenes con validación previa contra `inventory-service`, funcionando también a través de `api-gateway`.

---

## Siguiente archivo

El siguiente tramo práctico debería cubrir:

- categorías
- productos más completos
- endpoints más cercanos al dominio real de catálogo
