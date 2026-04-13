---
title: "Agregando persistencia a catalog-service"
description: "Inicio del bloque de persistencia real en NovaMarket. Integración de Spring Data JPA en catalog-service, configuración de base y migración del catálogo desde datos en memoria."
order: 16
module: "Módulo 3 · Persistencia real con JPA"
level: "intermedio"
draft: false
---

# Agregando persistencia a `catalog-service`

Hasta acá, NovaMarket ya tiene un primer flujo funcional distribuido.

Pero todavía hay una limitación importante:

**los datos viven en memoria.**

Eso significa que:

- si reiniciamos el servicio, se pierden,
- no existe un almacenamiento real,
- y el sistema todavía no refleja un comportamiento persistente más cercano a una aplicación seria.

En esta clase vamos a empezar a cambiar eso.

El primer servicio al que vamos a incorporar persistencia real es:

**`catalog-service`**

La idea es migrar el catálogo desde una lista en memoria hacia una implementación basada en base de datos usando **Spring Data JPA**.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregada la dependencia de JPA en `catalog-service`,
- configurada una base de datos de trabajo,
- adaptado el modelo `Product` para persistencia,
- creado un repositorio,
- y preparado el servicio para dejar de depender de la lista en memoria.

Todavía podemos mantener una transición gradual, pero el foco de hoy es que el catálogo ya empiece a apoyarse en persistencia real.

---

## Estado de partida

Partimos de este contexto:

- `catalog-service` ya expone:
  - `GET /products`
  - `GET /products/{id}`
- pero los datos todavía están definidos en memoria en `ProductService`.

Además, la clase `Product` fue creada como modelo simple y todavía no fue preparada como entidad JPA.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- agregar dependencias necesarias,
- configurar una base de trabajo,
- adaptar `Product`,
- crear `ProductRepository`,
- modificar `ProductService`,
- y verificar que el servicio siga funcionando ahora con persistencia.

---

## Decisión práctica para esta etapa

Para el curso práctico, una muy buena opción inicial es usar una base simple como H2 o una base relacional real según cómo quieras llevar el proyecto.

Si el objetivo inmediato es avanzar sin demasiada fricción, **H2** resulta muy útil porque:

- es rápida de integrar,
- no requiere infraestructura externa para esta etapa,
- y nos permite enfocarnos en JPA y persistencia antes de entrar a entornos más pesados.

Más adelante, cuando el curso lo requiera, podremos migrar a PostgreSQL u otra base relacional más realista.

En esta clase vamos a asumir ese enfoque gradual.

---

## Paso 1 · Agregar dependencias necesarias

Dentro de `catalog-service`, agregá en el `pom.xml` las dependencias correspondientes a persistencia.

Como mínimo, vamos a necesitar:

- **Spring Data JPA**
- **H2 Database** si elegís esa base para esta etapa

La idea es que el servicio ya pueda trabajar con entidades y repositorios reales.

---

## Paso 2 · Configurar la base en `application.yml`

Ahora conviene agregar configuración de base de datos en `catalog-service`.

Una configuración razonable para esta etapa podría incluir:

- URL de la base,
- driver,
- usuario,
- password,
- y comportamiento de `ddl-auto`.

Conceptualmente, algo como esto:

```yaml
spring:
  application:
    name: catalog-service
  datasource:
    url: jdbc:h2:mem:catalogdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

server:
  port: 8081
```

No hace falta que esta configuración sea definitiva para todo el curso.  
Lo importante es dejar una base funcional para empezar a persistir productos.

---

## Paso 3 · Adaptar `Product` como entidad

Ahora vamos a transformar `Product` para que deje de ser solo una clase simple y pase a ser una entidad persistente.

Una versión razonable podría quedar así:

```java
package com.novamarket.catalog.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {

    @Id
    private Long id;

    private String name;
    private String description;
    private BigDecimal price;
    private boolean active;

    public Product() {
    }

    public Product(Long id, String name, String description, BigDecimal price, boolean active) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
```

En esta etapa podemos mantener el id manual para simplificar la transición desde los datos en memoria.

Más adelante podremos refinar esta decisión si el proyecto lo necesita.

---

## Paso 4 · Crear `ProductRepository`

Dentro de `catalog-service`, creá:

```txt
src/main/java/com/novamarket/catalog/repository/ProductRepository.java
```

Una implementación mínima razonable podría ser:

```java
package com.novamarket.catalog.repository;

import com.novamarket.catalog.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
```

Esto ya nos da acceso a operaciones básicas sobre productos sin necesidad de implementar repositorio manualmente.

---

## Paso 5 · Modificar `ProductService`

Ahora el servicio tiene que dejar de usar la lista fija en memoria y empezar a trabajar con el repositorio.

Una versión razonable podría ser:

```java
package com.novamarket.catalog.service;

import com.novamarket.catalog.model.Product;
import com.novamarket.catalog.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Product findById(Long id) {
        return productRepository.findById(id).orElse(null);
    }
}
```

Fijate que desde el punto de vista del controller, el contrato del servicio sigue siendo casi el mismo.  
Eso es una buena señal: la capa de servicio está ayudando a absorber el cambio.

---

## Paso 6 · Cargar datos iniciales

Si pasamos a base de datos y no insertamos productos, el catálogo va a quedar vacío.

Para esta etapa, una forma simple y muy útil de resolverlo es cargar algunos datos al arrancar.

Podés hacerlo con un `CommandLineRunner`.

Por ejemplo, creá una configuración o un componente en `config/` o donde prefieras ubicarlo, algo equivalente a esto:

```java
package com.novamarket.catalog.config;

import com.novamarket.catalog.model.Product;
import com.novamarket.catalog.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
public class ProductDataLoader {

    @Bean
    CommandLineRunner loadProducts(ProductRepository productRepository) {
        return args -> {
            if (productRepository.count() == 0) {
                productRepository.save(new Product(1L, "Notebook", "Notebook para trabajo y estudio", new BigDecimal("1200.00"), true));
                productRepository.save(new Product(2L, "Mouse", "Mouse inalámbrico", new BigDecimal("25.50"), true));
                productRepository.save(new Product(3L, "Teclado", "Teclado mecánico", new BigDecimal("80.00"), true));
            }
        };
    }
}
```

Esto nos permite conservar productos de ejemplo aunque el origen de datos ya no sea una lista en memoria dentro del servicio.

---

## Paso 7 · Levantar `catalog-service`

Ahora toca volver a arrancar el servicio.

En este punto conviene prestar atención a varias cosas:

- que las dependencias estén bien resueltas,
- que Hibernate o JPA no generen errores,
- que la tabla se cree correctamente,
- y que el data loader inserte productos.

La consola debería darte señales bastante claras de esto, especialmente si activaste `show-sql`.

---

## Paso 8 · Probar el catálogo otra vez

Ahora repetí las pruebas que ya teníamos antes.

Por ejemplo:

```bash
curl http://localhost:8081/products
```

Y también:

```bash
curl http://localhost:8081/products/1
```

La idea es verificar que, desde afuera, el servicio sigue respondiendo correctamente aunque por dentro ya no esté usando una lista en memoria.

Eso es muy importante:  
el contrato HTTP sigue igual, pero la implementación ya dio un salto importante de madurez.

---

## Paso 9 · Verificar que la persistencia realmente existe

Además del endpoint, conviene verificar que la carga inicial y la base están funcionando.

Si estás usando H2 y habilitaste consola o logs SQL, este es un buen momento para revisar:

- creación de tabla,
- inserts iniciales,
- y consultas ejecutadas.

Ese tipo de observación ayuda mucho a conectar la teoría de JPA con el comportamiento real del proyecto.

---

## Qué estamos logrando con esta clase

Esta clase marca un cambio importante en el curso:

**el proyecto empieza a dejar atrás el modo demo en memoria y entra en persistencia real.**

Eso tiene muchísimo valor porque el sistema empieza a comportarse más como una aplicación de verdad.

Además, lo hacemos de forma gradual y controlada, sin romper el flujo que ya veníamos usando.

---

## Qué todavía no hicimos

Todavía no persistimos:

- inventario,
- órdenes,
- ni eventos.

Y tampoco estamos trabajando todavía con bases separadas más realistas o contenedorizadas.

Todo eso va a venir después.

La meta de hoy es mucho más concreta:

**que `catalog-service` ya use JPA y una base real de trabajo.**

---

## Errores comunes en esta etapa

### 1. Olvidar la dependencia de JPA o de la base
Eso impide que el servicio levante.

### 2. No anotar `Product` como entidad
Sin eso, el repositorio no va a funcionar como esperamos.

### 3. No cargar datos iniciales
El catálogo puede quedar vacío y parecer roto.

### 4. Cambiar demasiado el contrato del servicio
Conviene que la API siga comportándose igual aunque la implementación cambie.

### 5. No revisar logs de arranque
En esta etapa, los logs suelen decir muy claramente qué parte de la configuración de persistencia falló.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `catalog-service` debería:

- usar Spring Data JPA,
- persistir productos en una base de trabajo,
- cargar datos iniciales,
- y seguir respondiendo correctamente:
  - `GET /products`
  - `GET /products/{id}`

Esto abre el bloque de persistencia real de NovaMarket.

---

## Punto de control

Antes de seguir, verificá que:

- `Product` es entidad JPA,
- existe `ProductRepository`,
- `ProductService` usa el repositorio,
- los productos se cargan al iniciar,
- y los endpoints del catálogo siguen funcionando.

Si eso está bien, ya podemos continuar con el mismo proceso sobre inventario y órdenes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a llevar persistencia real a `inventory-service`.

Eso nos va a permitir dejar atrás la lista en memoria de stock y acercarnos todavía más a un flujo realista de creación de órdenes.

---

## Cierre

En esta clase agregamos persistencia real a `catalog-service`.

Fue un cambio importante porque el servicio mantuvo su contrato HTTP, pero por dentro dejó de depender de datos fijos en memoria y empezó a trabajar con JPA y una base real.

Ese es exactamente el tipo de evolución progresiva que queremos en NovaMarket.
