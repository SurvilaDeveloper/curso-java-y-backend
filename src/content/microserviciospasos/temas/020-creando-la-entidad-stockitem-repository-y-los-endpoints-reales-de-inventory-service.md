---
title: "Creando la entidad StockItem, el repository y los endpoints reales de inventory-service"
description: "Crear la entidad StockItem, el repository, cargar stock inicial y exponer endpoints reales para listar y validar stock por producto."
order: 20
module: "Módulo 4 · Primer dominio real"
level: "base"
draft: false
---

# Objetivo operativo

Crear la entidad `StockItem`, el repository y los endpoints reales de `inventory-service` para consultar stock por producto desde la base de datos.

---

## Acciones

### 1. Crear una migración con stock inicial

Crear el archivo:

```txt
services/inventory-service/src/main/resources/db/migration/V2__insert_sample_stock_items.sql
```

Pegar esto:

```sql
INSERT INTO stock_item (product_slug, available_quantity, active)
VALUES
('notebook-pro-14', 12, true),
('mouse-inalambrico', 40, true),
('teclado-mecanico', 20, true);
```

---

### 2. Crear el paquete `entity`

Crear esta carpeta si no existe:

```txt
services/inventory-service/src/main/java/com/novamarket/inventoryservice/entity/
```

---

### 3. Crear la entidad `StockItem`

Crear el archivo:

```txt
services/inventory-service/src/main/java/com/novamarket/inventoryservice/entity/StockItem.java
```

Pegar esto:

```java
package com.novamarket.inventoryservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "stock_item")
public class StockItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_slug", nullable = false, unique = true, length = 160)
    private String productSlug;

    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity;

    @Column(nullable = false)
    private Boolean active;

    public StockItem() {
    }

    public Long getId() {
        return id;
    }

    public String getProductSlug() {
        return productSlug;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public Boolean getActive() {
        return active;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setProductSlug(String productSlug) {
        this.productSlug = productSlug;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
```

---

### 4. Crear el paquete `repository`

Crear esta carpeta si no existe:

```txt
services/inventory-service/src/main/java/com/novamarket/inventoryservice/repository/
```

---

### 5. Crear el repository

Crear el archivo:

```txt
services/inventory-service/src/main/java/com/novamarket/inventoryservice/repository/StockItemRepository.java
```

Pegar esto:

```java
package com.novamarket.inventoryservice.repository;

import com.novamarket.inventoryservice.entity.StockItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StockItemRepository extends JpaRepository<StockItem, Long> {
    Optional<StockItem> findByProductSlug(String productSlug);
}
```

---

### 6. Crear el paquete `dto`

Crear esta carpeta si no existe:

```txt
services/inventory-service/src/main/java/com/novamarket/inventoryservice/dto/
```

---

### 7. Crear el DTO `StockCheckResponse`

Crear el archivo:

```txt
services/inventory-service/src/main/java/com/novamarket/inventoryservice/dto/StockCheckResponse.java
```

Pegar esto:

```java
package com.novamarket.inventoryservice.dto;

public class StockCheckResponse {

    private String productSlug;
    private Integer requestedQuantity;
    private Integer availableQuantity;
    private Boolean available;

    public StockCheckResponse() {
    }

    public StockCheckResponse(
            String productSlug,
            Integer requestedQuantity,
            Integer availableQuantity,
            Boolean available
    ) {
        this.productSlug = productSlug;
        this.requestedQuantity = requestedQuantity;
        this.availableQuantity = availableQuantity;
        this.available = available;
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
}
```

---

### 8. Reemplazar `InventoryController`

Abrir:

```txt
services/inventory-service/src/main/java/com/novamarket/inventoryservice/controller/InventoryController.java
```

Reemplazar todo el contenido por esto:

```java
package com.novamarket.inventoryservice.controller;

import com.novamarket.inventoryservice.dto.StockCheckResponse;
import com.novamarket.inventoryservice.entity.StockItem;
import com.novamarket.inventoryservice.repository.StockItemRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class InventoryController {

    private final StockItemRepository stockItemRepository;

    public InventoryController(StockItemRepository stockItemRepository) {
        this.stockItemRepository = stockItemRepository;
    }

    @GetMapping("/api/inventory/ping")
    public String ping() {
        return "inventory-service ok";
    }

    @GetMapping("/api/inventory/items")
    public List<StockItem> findAll() {
        return stockItemRepository.findAll();
    }

    @GetMapping("/api/inventory/check")
    public StockCheckResponse check(
            @RequestParam String productSlug,
            @RequestParam Integer quantity
    ) {
        StockItem stockItem = stockItemRepository.findByProductSlug(productSlug)
                .orElseThrow(() -> new IllegalArgumentException("Stock item not found"));

        boolean available = stockItem.getActive() && stockItem.getAvailableQuantity() >= quantity;

        return new StockCheckResponse(
                stockItem.getProductSlug(),
                quantity,
                stockItem.getAvailableQuantity(),
                available
        );
    }
}
```

---

### 9. Reiniciar `inventory-service`

Detener `inventory-service` si está corriendo.

Volver a ejecutarlo.

---

### 10. Verificar el listado de stock directo

Abrir:

```txt
http://localhost:8082/api/inventory/items
```

Debe devolver una lista JSON de `stock_item`.

---

### 11. Verificar el listado de stock por gateway

Abrir:

```txt
http://localhost:8080/api/inventory/items
```

Debe devolver la misma lista.

---

### 12. Verificar la validación de stock directo

Abrir:

```txt
http://localhost:8082/api/inventory/check?productSlug=mouse-inalambrico&quantity=2
```

Debe devolver un JSON parecido a:

```json
{
  "productSlug": "mouse-inalambrico",
  "requestedQuantity": 2,
  "availableQuantity": 40,
  "available": true
}
```

---

### 13. Verificar la validación de stock por gateway

Abrir:

```txt
http://localhost:8080/api/inventory/check?productSlug=mouse-inalambrico&quantity=50
```

Debe devolver `available: false`.

---

## Verificación rápida

Comprobar que:

- `inventory-service` arranca sin errores
- `/api/inventory/items` devuelve stock desde la base
- `/api/inventory/check` devuelve disponibilidad real
- ambos endpoints funcionan directo y también a través del gateway

---

## Resultado esperado

Tener `inventory-service` trabajando con stock real por producto y validando disponibilidad desde PostgreSQL.

---

## Siguiente archivo

Seguir con:

```txt
021-validando-stock-real-en-order-service-antes-de-guardar-la-orden.md
```
