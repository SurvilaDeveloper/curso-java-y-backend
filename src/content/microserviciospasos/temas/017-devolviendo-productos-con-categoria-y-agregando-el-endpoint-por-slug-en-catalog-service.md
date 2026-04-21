---
title: "Devolviendo productos con categoría y agregando el endpoint por slug en catalog-service"
description: "Crear DTOs de salida para productos, devolver productos con categoría y agregar un endpoint para buscar un producto por slug."
order: 17
module: "Módulo 4 · Primer dominio real"
level: "base"
draft: false
---

# Objetivo operativo

Devolver productos con categoría en `catalog-service` y agregar un endpoint para consultar un producto por `slug`.

---

## Acciones

### 1. Crear el paquete `dto` si no existe

Crear esta carpeta si no existe:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/dto/
```

---

### 2. Crear el DTO `CategoryResponse`

Crear el archivo:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/dto/CategoryResponse.java
```

Pegar esto:

```java
package com.novamarket.catalogservice.dto;

public class CategoryResponse {

    private Long id;
    private String name;
    private String slug;

    public CategoryResponse() {
    }

    public CategoryResponse(Long id, String name, String slug) {
        this.id = id;
        this.name = name;
        this.slug = slug;
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
}
```

---

### 3. Crear el DTO `ProductResponse`

Crear el archivo:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/dto/ProductResponse.java
```

Pegar esto:

```java
package com.novamarket.catalogservice.dto;

import java.math.BigDecimal;

public class ProductResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private String currency;
    private Integer stock;
    private Boolean active;
    private CategoryResponse category;

    public ProductResponse() {
    }

    public ProductResponse(
            Long id,
            String name,
            String slug,
            String description,
            BigDecimal price,
            String currency,
            Integer stock,
            Boolean active,
            CategoryResponse category
    ) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.price = price;
        this.currency = currency;
        this.stock = stock;
        this.active = active;
        this.category = category;
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

    public CategoryResponse getCategory() {
        return category;
    }
}
```

---

### 4. Modificar `ProductRepository`

Abrir:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/repository/ProductRepository.java
```

Reemplazar todo el contenido por esto:

```java
package com.novamarket.catalogservice.repository;

import com.novamarket.catalogservice.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);
}
```

---

### 5. Reemplazar `CatalogController`

Abrir:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/controller/CatalogController.java
```

Reemplazar todo el contenido por esto:

```java
package com.novamarket.catalogservice.controller;

import com.novamarket.catalogservice.dto.CategoryResponse;
import com.novamarket.catalogservice.dto.ProductResponse;
import com.novamarket.catalogservice.entity.Product;
import com.novamarket.catalogservice.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

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

### 6. Reiniciar `catalog-service`

Detener `catalog-service` si está corriendo.

Volver a ejecutarlo.

---

### 7. Verificar el listado enriquecido de productos directo

Abrir:

```txt
http://localhost:8081/api/catalog/products
```

Comprobar que cada producto incluya un objeto `category`.

---

### 8. Verificar el listado enriquecido por gateway

Abrir:

```txt
http://localhost:8080/api/catalog/products
```

Comprobar que devuelva la misma estructura.

---

### 9. Verificar el endpoint por slug directo

Abrir:

```txt
http://localhost:8081/api/catalog/products/notebook-pro-14
```

---

### 10. Verificar el endpoint por slug por gateway

Abrir:

```txt
http://localhost:8080/api/catalog/products/notebook-pro-14
```

---

## Verificación rápida

Comprobar que:

- `/api/catalog/products` devuelve productos con categoría
- `/api/catalog/products/{slug}` devuelve un producto específico
- ambos endpoints funcionan directo y también a través del gateway

---

## Resultado esperado

Tener productos enriquecidos con categoría y búsqueda por `slug` funcionando en `catalog-service`.

---

## Siguiente archivo

Seguir con:

```txt
018-creando-el-endpoint-para-dar-de-alta-productos-en-catalog-service.md
```
