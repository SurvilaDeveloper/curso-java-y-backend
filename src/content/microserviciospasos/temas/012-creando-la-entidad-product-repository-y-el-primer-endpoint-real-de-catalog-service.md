---
title: "Creando la entidad Product, el repository y el primer endpoint real de catalog-service"
description: "Crear la entidad Product, el repository, cargar datos de ejemplo y exponer el primer endpoint real de productos en catalog-service."
order: 12
module: "Módulo 4 · Primer dominio real"
level: "base"
draft: false
---

# Objetivo operativo

Crear la entidad `Product`, el repository y el primer endpoint real de `catalog-service` para devolver productos desde la base de datos.

---

## Acciones

### 1. Crear el paquete `entity`

Crear esta carpeta si no existe:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/entity/
```

---

### 2. Crear la entidad `Product`

Crear el archivo:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/entity/Product.java
```

Pegar esto:

```java
package com.novamarket.catalogservice.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 160)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false)
    private Integer stock;

    @Column(nullable = false)
    private Boolean active;

    public Product() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getCurrency() {
        return currency;
    }

    public Integer getStock() {
        return stock;
    }

    public Boolean getActive() {
        return active;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
```

---

### 3. Crear el paquete `repository`

Crear esta carpeta si no existe:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/repository/
```

---

### 4. Crear el repository

Crear el archivo:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/repository/ProductRepository.java
```

Pegar esto:

```java
package com.novamarket.catalogservice.repository;

import com.novamarket.catalogservice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
```

---

### 5. Crear el paquete `controller` si no existe

Verificar que exista:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/controller/
```

---

### 6. Reemplazar el controlador actual

Abrir:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/controller/CatalogController.java
```

Reemplazar todo el contenido por esto:

```java
package com.novamarket.catalogservice.controller;

import com.novamarket.catalogservice.entity.Product;
import com.novamarket.catalogservice.repository.ProductRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class CatalogController {

    private final ProductRepository productRepository;

    public CatalogController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping("/api/catalog/ping")
    public String ping() {
        return "catalog-service ok";
    }

    @GetMapping("/api/catalog/products")
    public List<Product> findAll() {
        return productRepository.findAll();
    }

}
```

---

### 7. Crear una migración con datos iniciales

Crear el archivo:

```txt
services/catalog-service/src/main/resources/db/migration/V2__insert_sample_products.sql
```

Pegar esto:

```sql
INSERT INTO product (name, slug, description, price, currency, stock, active)
VALUES
('Notebook Pro 14', 'notebook-pro-14', 'Notebook de ejemplo', 1500000.00, 'ARS', 12, true),
('Mouse Inalambrico', 'mouse-inalambrico', 'Mouse de ejemplo', 35000.00, 'ARS', 40, true),
('Teclado Mecanico', 'teclado-mecanico', 'Teclado de ejemplo', 98000.00, 'ARS', 20, true);
```

---

### 8. Reiniciar `catalog-service`

Detener `catalog-service` si está corriendo.

Volver a ejecutarlo.

---

### 9. Verificar el endpoint real de productos directo

Abrir:

```txt
http://localhost:8081/api/catalog/products
```

Debe devolver una lista JSON con productos.

---

### 10. Verificar el endpoint real de productos por gateway

Abrir:

```txt
http://localhost:8080/api/catalog/products
```

Debe devolver la misma lista JSON.

---

### 11. Verificar que los productos existen en la base

Ejecutar:

```sql
SELECT id, name, slug, price, currency, stock, active
FROM product
ORDER BY id;
```

---

## Verificación rápida

Comprobar que:

- `catalog-service` arranca sin errores
- la entidad `Product` coincide con la tabla
- la migración `V2` se ejecuta
- `/api/catalog/products` devuelve datos
- el mismo endpoint responde también a través del gateway

---

## Resultado esperado

Tener el primer endpoint real de negocio devolviendo productos desde PostgreSQL.

---

## Siguiente archivo

El siguiente tramo práctico debería cubrir:

- base de datos de `order-service`
- primera creación real de órdenes
- primera integración real con el catálogo o inventario
