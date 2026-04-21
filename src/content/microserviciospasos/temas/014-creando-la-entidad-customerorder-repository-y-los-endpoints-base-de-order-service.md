---
title: "Creando la entidad CustomerOrder, el repository y los endpoints base de order-service"
description: "Crear la entidad CustomerOrder, el repository, el DTO de entrada y los endpoints base de order-service para guardar y listar órdenes."
order: 14
module: "Módulo 4 · Primer dominio real"
level: "base"
draft: false
---

# Objetivo operativo

Crear la entidad `CustomerOrder`, el repository y los endpoints base de `order-service` para guardar y listar órdenes desde PostgreSQL.

---

## Acciones

### 1. Crear el paquete `entity`

Crear esta carpeta si no existe:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/entity/
```

---

### 2. Crear la entidad `CustomerOrder`

Crear el archivo:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/entity/CustomerOrder.java
```

Pegar esto:

```java
package com.novamarket.orderservice.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_order")
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_slug", nullable = false, length = 160)
    private String productSlug;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public CustomerOrder() {
    }

    public Long getId() {
        return id;
    }

    public String getProductSlug() {
        return productSlug;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setProductSlug(String productSlug) {
        this.productSlug = productSlug;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
```

---

### 3. Crear el paquete `repository`

Crear esta carpeta si no existe:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/repository/
```

---

### 4. Crear el repository

Crear el archivo:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/repository/CustomerOrderRepository.java
```

Pegar esto:

```java
package com.novamarket.orderservice.repository;

import com.novamarket.orderservice.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
}
```

---

### 5. Crear el paquete `dto`

Crear esta carpeta si no existe:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/dto/
```

---

### 6. Crear el DTO de entrada

Crear el archivo:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/dto/CreateOrderRequest.java
```

Pegar esto:

```java
package com.novamarket.orderservice.dto;

public class CreateOrderRequest {

    private String productSlug;
    private Integer quantity;

    public CreateOrderRequest() {
    }

    public String getProductSlug() {
        return productSlug;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setProductSlug(String productSlug) {
        this.productSlug = productSlug;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
```

---

### 7. Reemplazar el controlador actual

Abrir:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/controller/OrderController.java
```

Reemplazar todo el contenido por esto:

```java
package com.novamarket.orderservice.controller;

import com.novamarket.orderservice.dto.CreateOrderRequest;
import com.novamarket.orderservice.entity.CustomerOrder;
import com.novamarket.orderservice.repository.CustomerOrderRepository;
import com.novamarket.orderservice.service.InventoryClientService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
public class OrderController {

    private final InventoryClientService inventoryClientService;
    private final CustomerOrderRepository customerOrderRepository;

    public OrderController(
            InventoryClientService inventoryClientService,
            CustomerOrderRepository customerOrderRepository
    ) {
        this.inventoryClientService = inventoryClientService;
        this.customerOrderRepository = customerOrderRepository;
    }

    @GetMapping("/api/orders/ping")
    public String ping() {
        return "order-service ok";
    }

    @GetMapping("/api/orders/check-inventory")
    public String checkInventory() {
        return inventoryClientService.pingInventory();
    }

    @GetMapping("/api/orders")
    public List<CustomerOrder> findAll() {
        return customerOrderRepository.findAll();
    }

    @PostMapping("/api/orders")
    public CustomerOrder create(@RequestBody CreateOrderRequest request) {
        CustomerOrder order = new CustomerOrder();
        order.setProductSlug(request.getProductSlug());
        order.setQuantity(request.getQuantity());
        order.setStatus("CREATED");
        order.setCreatedAt(LocalDateTime.now());
        return customerOrderRepository.save(order);
    }
}
```

---

### 8. Reiniciar `order-service`

Detener `order-service` si está corriendo.

Volver a ejecutarlo.

---

### 9. Probar creación de una orden

Hacer un `POST` a:

```txt
http://localhost:8083/api/orders
```

Con este JSON:

```json
{
  "productSlug": "notebook-pro-14",
  "quantity": 1
}
```

---

### 10. Verificar listado de órdenes

Abrir:

```txt
http://localhost:8083/api/orders
```

Debe devolver una lista JSON con al menos una orden.

---

### 11. Verificar en la base

Ejecutar:

```sql
SELECT id, product_slug, quantity, status, created_at
FROM customer_order
ORDER BY id;
```

---

## Verificación rápida

Comprobar que:

- `order-service` arranca sin errores
- se puede hacer `POST /api/orders`
- se puede consultar `GET /api/orders`
- la orden queda guardada en PostgreSQL

---

## Resultado esperado

Tener `order-service` guardando y listando órdenes reales desde la base de datos.

---

## Siguiente archivo

Seguir con:

```txt
015-validando-inventory-service-antes-de-guardar-la-orden-en-order-service.md
```
