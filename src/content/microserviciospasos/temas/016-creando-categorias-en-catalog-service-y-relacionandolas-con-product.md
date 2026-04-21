---
title: "Creando categorías en catalog-service y relacionándolas con Product"
description: "Agregar categorías al catálogo, crear las migraciones necesarias, mapear la relación con Product y exponer un endpoint base de categorías."
order: 16
module: "Módulo 4 · Primer dominio real"
level: "base"
draft: false
---

# Objetivo operativo

Agregar categorías al catálogo, relacionarlas con `Product` y dejar un endpoint base de categorías funcionando.

---

## Acciones

### 1. Crear una nueva migración para categorías

Crear el archivo:

```txt
services/catalog-service/src/main/resources/db/migration/V3__create_category_table_and_link_product.sql
```

Pegar esto:

```sql
CREATE TABLE category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE
);

ALTER TABLE product
ADD COLUMN category_id BIGINT;

ALTER TABLE product
ADD CONSTRAINT fk_product_category
FOREIGN KEY (category_id)
REFERENCES category(id);
```

---

### 2. Crear una migración con categorías de ejemplo

Crear el archivo:

```txt
services/catalog-service/src/main/resources/db/migration/V4__insert_sample_categories_and_link_products.sql
```

Pegar esto:

```sql
INSERT INTO category (name, slug)
VALUES
('Notebooks', 'notebooks'),
('Perifericos', 'perifericos');

UPDATE product
SET category_id = (SELECT id FROM category WHERE slug = 'notebooks')
WHERE slug = 'notebook-pro-14';

UPDATE product
SET category_id = (SELECT id FROM category WHERE slug = 'perifericos')
WHERE slug IN ('mouse-inalambrico', 'teclado-mecanico');
```

---

### 3. Crear el paquete `entity` si no existe

Verificar que exista:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/entity/
```

---

### 4. Crear la entidad `Category`

Crear el archivo:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/entity/Category.java
```

Pegar esto:

```java
package com.novamarket.catalogservice.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 160)
    private String slug;

    public Category() {
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

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }
}
```

---

### 5. Modificar la entidad `Product`

Abrir:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/entity/Product.java
```

Reemplazar todo el contenido por esto:

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

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

    public java.math.BigDecimal getPrice() {
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

    public Category getCategory() {
        return category;
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

    public void setPrice(java.math.BigDecimal price) {
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

    public void setCategory(Category category) {
        this.category = category;
    }
}
```

---

### 6. Crear el paquete `repository` si no existe

Verificar que exista:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/repository/
```

---

### 7. Crear el repository de categorías

Crear el archivo:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/repository/CategoryRepository.java
```

Pegar esto:

```java
package com.novamarket.catalogservice.repository;

import com.novamarket.catalogservice.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);
}
```

---

### 8. Crear el paquete `controller` si no existe

Verificar que exista:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/controller/
```

---

### 9. Crear un controlador de categorías

Crear el archivo:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/controller/CategoryController.java
```

Pegar esto:

```java
package com.novamarket.catalogservice.controller;

import com.novamarket.catalogservice.entity.Category;
import com.novamarket.catalogservice.repository.CategoryRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping("/api/catalog/categories")
    public List<Category> findAll() {
        return categoryRepository.findAll();
    }
}
```

---

### 10. Reiniciar `catalog-service`

Detener `catalog-service` si está corriendo.

Volver a ejecutarlo.

---

### 11. Verificar las tablas y relaciones en la base

Ejecutar:

```sql
SELECT id, name, slug
FROM category
ORDER BY id;
```

Después ejecutar:

```sql
SELECT id, name, slug, category_id
FROM product
ORDER BY id;
```

---

### 12. Verificar el endpoint de categorías directo

Abrir:

```txt
http://localhost:8081/api/catalog/categories
```

Debe devolver categorías en JSON.

---

### 13. Verificar el endpoint de categorías por gateway

Abrir:

```txt
http://localhost:8080/api/catalog/categories
```

Debe devolver la misma lista JSON.

---

## Verificación rápida

Comprobar que:

- existen las tablas `category` y `product` con la relación
- `catalog-service` arranca sin errores
- `/api/catalog/categories` devuelve categorías
- el endpoint responde también a través del gateway

---

## Resultado esperado

Tener categorías creadas, productos relacionados y un endpoint base de categorías funcionando.

---

## Siguiente archivo

Seguir con:

```txt
017-devolviendo-productos-con-categoria-y-agregando-el-endpoint-por-slug-en-catalog-service.md
```
