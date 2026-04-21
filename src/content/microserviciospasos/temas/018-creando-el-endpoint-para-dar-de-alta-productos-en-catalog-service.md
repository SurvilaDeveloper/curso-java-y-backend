---
title: "Creando el endpoint para dar de alta productos en catalog-service"
description: "Crear el DTO de alta, buscar la categoría por slug, guardar productos nuevos en la base y probar el alta directa y a través del gateway."
order: 18
module: "Módulo 4 · Primer dominio real"
level: "base"
draft: false
---

# Objetivo operativo

Crear el endpoint para dar de alta productos en `catalog-service` usando una categoría existente.

---

## Acciones

### 1. Crear el DTO de alta de producto

Crear el archivo:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/dto/CreateProductRequest.java
```

Pegar esto:

```java
package com.novamarket.catalogservice.dto;

import java.math.BigDecimal;

public class CreateProductRequest {

    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private String currency;
    private Integer stock;
    private Boolean active;
    private String categorySlug;

    public CreateProductRequest() {
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

    public String getCategorySlug() {
        return categorySlug;
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

    public void setCategorySlug(String categorySlug) {
        this.categorySlug = categorySlug;
    }
}
```

---

### 2. Reemplazar `CatalogController`

Abrir:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/controller/CatalogController.java
```

Reemplazar todo el contenido por esto:

```java
package com.novamarket.catalogservice.controller;

import com.novamarket.catalogservice.dto.CategoryResponse;
import com.novamarket.catalogservice.dto.CreateProductRequest;
import com.novamarket.catalogservice.dto.ProductResponse;
import com.novamarket.catalogservice.entity.Category;
import com.novamarket.catalogservice.entity.Product;
import com.novamarket.catalogservice.repository.CategoryRepository;
import com.novamarket.catalogservice.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CatalogController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public CatalogController(
            ProductRepository productRepository,
            CategoryRepository categoryRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping("/api/catalog/ping")
    public String ping() {
        return "catalog-service ok";
    }

    @GetMapping("/api/catalog/products")
    public List<ProductResponse> findAll() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/api/catalog/products/{slug}")
    public ProductResponse findBySlug(@PathVariable String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        return toResponse(product);
    }

    @PostMapping("/api/catalog/products")
    public ProductResponse create(@RequestBody CreateProductRequest request) {
        Category category = categoryRepository.findBySlug(request.getCategorySlug())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        Product product = new Product();
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCurrency(request.getCurrency());
        product.setStock(request.getStock());
        product.setActive(request.getActive());
        product.setCategory(category);

        Product saved = productRepository.save(product);

        return toResponse(saved);
    }

    private ProductResponse toResponse(Product product) {
        CategoryResponse category = null;

        if (product.getCategory() != null) {
            category = new CategoryResponse(
                    product.getCategory().getId(),
                    product.getCategory().getName(),
                    product.getCategory().getSlug()
            );
        }

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getPrice(),
                product.getCurrency(),
                product.getStock(),
                product.getActive(),
                category
        );
    }
}
```

---

### 3. Reiniciar `catalog-service`

Detener `catalog-service` si está corriendo.

Volver a ejecutarlo.

---

### 4. Crear un producto directo en `catalog-service`

Hacer un `POST` a:

```txt
http://localhost:8081/api/catalog/products
```

Con este JSON:

```json
{
  "name": "Monitor 27",
  "slug": "monitor-27",
  "description": "Monitor de ejemplo",
  "price": 420000.00,
  "currency": "ARS",
  "stock": 8,
  "active": true,
  "categorySlug": "perifericos"
}
```

---

### 5. Verificar el producto nuevo directo

Abrir:

```txt
http://localhost:8081/api/catalog/products/monitor-27
```

---

### 6. Crear un producto a través del gateway

Hacer un `POST` a:

```txt
http://localhost:8080/api/catalog/products
```

Con este JSON:

```json
{
  "name": "Notebook Air 13",
  "slug": "notebook-air-13",
  "description": "Notebook de ejemplo 13 pulgadas",
  "price": 1150000.00,
  "currency": "ARS",
  "stock": 5,
  "active": true,
  "categorySlug": "notebooks"
}
```

---

### 7. Verificar el producto nuevo a través del gateway

Abrir:

```txt
http://localhost:8080/api/catalog/products/notebook-air-13
```

---

### 8. Verificar el listado total de productos

Abrir:

```txt
http://localhost:8080/api/catalog/products
```

Comprobar que incluya los productos nuevos.

---

### 9. Verificar los registros en la base

Ejecutar:

```sql
SELECT id, name, slug, price, currency, stock, active, category_id
FROM product
ORDER BY id;
```

---

## Verificación rápida

Comprobar que:

- se puede crear un producto directo en `catalog-service`
- se puede crear un producto también a través del gateway
- el producto queda asociado a una categoría existente
- el producto nuevo aparece en la base y en los endpoints de lectura

---

## Resultado esperado

Tener el alta real de productos funcionando en `catalog-service`, con categoría y acceso también a través del gateway.

---

## Siguiente archivo

El siguiente tramo práctico debería cubrir:

- enriquecer `inventory-service`
- stock por producto
- validaciones más reales antes de crear órdenes
