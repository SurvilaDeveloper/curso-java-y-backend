---
title: "Paginación y ordenamiento"
description: "Cómo devolver listas grandes de datos de forma más eficiente y usable usando paginación y ordenamiento en Spring Boot y Spring Data JPA."
order: 50
module: "Persistencia profesional"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya recorriste una parte muy fuerte del backend con Java y Spring Boot:

- controllers
- services
- DTOs
- validaciones
- manejo de errores
- repository
- JPA
- Hibernate
- consultas
- testing
- seguridad
- Docker
- Flyway

Eso ya te permite construir APIs bastante serias.

Pero en cuanto tu aplicación empieza a manejar más datos, aparece una necesidad muy concreta:

**¿cómo devolvés listas grandes sin traer todo de golpe y sin perder control sobre el orden?**

Ahí entran dos herramientas muy importantes para APIs reales:

- paginación
- ordenamiento

## La idea general

Supongamos que tenés una tabla de productos con miles de registros.

Si tu endpoint hace esto:

```text
GET /products
```

y devuelve absolutamente todo de una sola vez, pueden aparecer varios problemas:

- respuestas muy pesadas
- consumo innecesario de memoria
- experiencia mala para frontend
- consultas menos eficientes
- poca flexibilidad para navegar datos

La paginación y el ordenamiento ayudan a resolver eso.

## Qué es paginar

Paginar significa dividir un conjunto grande de datos en porciones más pequeñas.

En vez de pedir todo junto, el cliente pide una parte.

Por ejemplo:

- página 0 con 10 elementos
- página 1 con 10 elementos
- página 2 con 10 elementos

## Qué es ordenar

Ordenar significa definir en qué secuencia querés recibir los resultados.

Por ejemplo:

- por precio ascendente
- por precio descendente
- por nombre
- por fecha de creación
- por stock

## Por qué esto importa tanto

En APIs reales, es muy común necesitar:

- listar recursos en partes
- mostrar resultados ordenados
- combinar filtros + paginación + ordenamiento

Esto aparece en:

- catálogos
- paneles administrativos
- historiales
- órdenes
- búsquedas
- listados de usuarios
- dashboards

## Qué problema resuelve la paginación

La paginación resuelve cosas como:

- no traer miles de filas de una sola vez
- mejorar tiempos de respuesta
- facilitar navegación del frontend
- reducir carga innecesaria sobre la aplicación y la base

## Qué problema resuelve el ordenamiento

El ordenamiento resuelve cosas como:

- devolver resultados en una secuencia útil
- permitir UX más predecible
- soportar criterios de visualización del negocio
- dar control al cliente sobre cómo quiere ver la lista

## Ejemplo mental simple

En vez de esto:

```text
GET /products
```

sin control, podrías tener algo como:

```text
GET /products?page=0&size=10&sort=price,desc
```

Eso expresa:

- página 0
- tamaño 10
- ordenar por precio descendente

## Spring Data JPA y paginación

Spring Data JPA ofrece soporte muy cómodo para esto mediante tipos como:

- `Pageable`
- `Page`
- `Sort`

## `Pageable`

`Pageable` representa la solicitud de paginación.

Por ejemplo:

- qué página querés
- cuántos elementos por página
- qué orden querés

## `Page`

`Page` representa el resultado paginado.

No solo contiene la lista de elementos.
También incluye metadatos útiles.

Por ejemplo:

- contenido de la página
- número de página
- tamaño
- total de elementos
- total de páginas

## `Sort`

`Sort` representa criterios de ordenamiento.

## Ejemplo de repository con paginación

Supongamos esta entidad:

```java
import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private double price;
    private boolean active;

    public Product() {
    }

    public Product(String name, double price, boolean active) {
        this.name = name;
        this.price = price;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }

    public boolean isActive() {
        return active;
    }
}
```

Y este repository:

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByActiveTrue(Pageable pageable);
}
```

## Qué expresa esto

Le estás diciendo a Spring Data JPA:

- buscá productos activos
- devolvelos paginados según el `Pageable`

## Qué ventaja tiene

Que ya no necesitás traer todos los productos activos de una sola vez.

## Uso en service

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Page<Product> getActiveProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable);
    }
}
```

## Qué devuelve esto

Devuelve un `Page<Product>`.

Eso significa que además de los productos, tenés información sobre la paginación.

## Uso en controller

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public Page<Product> getProducts(Pageable pageable) {
        return productService.getActiveProducts(pageable);
    }
}
```

## Qué tiene de interesante esto

Spring puede interpretar automáticamente parámetros como:

- `page`
- `size`
- `sort`

desde la request.

Por ejemplo:

```text
GET /products?page=0&size=5&sort=price,desc
```

## Parámetros típicos

### `page`

Número de página.
Suele arrancar en `0`.

### `size`

Cantidad de elementos por página.

### `sort`

Criterio de ordenamiento.

Ejemplo:

```text
sort=price,desc
```

o

```text
sort=name,asc
```

## Ejemplo de request real

```text
GET /products?page=1&size=10&sort=name,asc
```

Eso podría significar:

- segunda página
- 10 elementos
- ordenados por nombre ascendente

## Qué contiene un `Page`

Un `Page<T>` suele darte cosas como:

- contenido actual
- número de página
- tamaño de página
- total de elementos
- total de páginas
- si hay siguiente página
- si hay página anterior

## Ejemplo de uso de `Page`

```java
Page<Product> page = productRepository.findByActiveTrue(pageable);

System.out.println(page.getContent());
System.out.println(page.getTotalElements());
System.out.println(page.getTotalPages());
System.out.println(page.getNumber());
System.out.println(page.getSize());
```

## Por qué esto es tan útil para frontend

Porque el frontend no solo necesita la lista.
Muchas veces también necesita saber:

- cuántas páginas hay
- en qué página está
- si puede avanzar
- si puede retroceder
- cuántos elementos totales existen

`Page` ayuda muchísimo con eso.

## DTOs y paginación

En proyectos reales muchas veces no querés devolver `Page<Entity>` directamente.

Suele ser más sano devolver DTOs.

Por ejemplo:

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository,
                          ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    public Page<ProductResponseDto> getActiveProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable)
                .map(productMapper::toDto);
    }
}
```

## Qué hace esto

Toma un `Page<Product>` y lo transforma a `Page<ProductResponseDto>` usando `map`.

Eso es muy elegante y muy útil.

## Ordenamiento simple con `Sort`

También podés trabajar con ordenamiento directo sin paginación.

Ejemplo:

```java
import org.springframework.data.domain.Sort;

List<Product> products = productRepository.findAll(Sort.by("price").descending());
```

## Qué hace esto

Busca todos los productos ordenados por precio descendente.

## Más ejemplos de ordenamiento

### Por nombre ascendente

```java
Sort.by("name").ascending()
```

### Por precio descendente

```java
Sort.by("price").descending()
```

### Combinado

```java
Sort.by("active").descending().and(Sort.by("name").ascending())
```

## Qué expresa el ordenamiento combinado

Primero ordena por `active`, luego por `name`.

Esto puede ser útil para paneles o listados más específicos.

## `PageRequest`

A veces querés construir el `Pageable` manualmente en código.

Para eso se usa mucho `PageRequest`.

Ejemplo:

```java
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

Pageable pageable = PageRequest.of(0, 10, Sort.by("price").descending());
```

## Qué expresa esto

- página 0
- tamaño 10
- ordenar por precio descendente

## Cuándo puede servir esto

Sirve cuando la paginación no viene directamente del request HTTP, sino que querés construirla en lógica interna o tests.

## `Slice`

Además de `Page`, también existe `Slice`.

No hace falta profundizar muchísimo ahora, pero conviene saber que:

- `Page` trae más metadatos, incluyendo total de elementos
- `Slice` es más liviano cuando solo te importa navegación por porciones y no el conteo total exacto

Para la mayoría de los casos introductorios, `Page` es la puerta más natural.

## Paginación y consultas derivadas

También podés combinar paginación con métodos derivados.

Ejemplo:

```java
Page<Product> findByNameContainingIgnoreCase(String text, Pageable pageable);
```

## Qué hace esto

Busca productos cuyo nombre contenga cierto texto y devuelve resultados paginados.

## Paginación + filtros + ordenamiento

Este combo es extremadamente común en APIs reales.

Ejemplo:

```text
GET /products?search=notebook&page=0&size=10&sort=price,asc
```

Eso ya representa un endpoint bastante realista.

## Ejemplo de repository más completo

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByNameContainingIgnoreCase(String text, Pageable pageable);

    Page<Product> findByPriceGreaterThan(double minPrice, Pageable pageable);
}
```

## Qué demuestra esto

Que Spring Data JPA permite combinar consultas con paginación de forma muy natural.

## Cuándo no conviene devolver entidades directamente

Esto ya lo viste antes, pero en paginación importa aún más.

Muchas veces conviene devolver un objeto de respuesta más controlado, por ejemplo:

- contenido paginado en DTOs
- metadatos seleccionados
- estructura más estable para frontend

## Ejemplo conceptual de response paginada custom

En vez de devolver el `Page` tal cual, podrías construir algo como:

```json
{
  "content": [
    { "id": 1, "name": "Notebook" },
    { "id": 2, "name": "Mouse" }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 57,
  "totalPages": 6
}
```

## Por qué esto puede ser útil

Porque a veces querés controlar mejor el contrato de salida y no depender directamente de la estructura concreta de `Page`.

## Paginación y performance

Paginar ayuda mucho, pero tampoco es magia total.

Conviene seguir pensando:

- qué consulta se ejecuta
- qué campos se filtran
- si hay índices adecuados
- si hay relaciones que disparan problemas
- si el ordenamiento tiene sentido

## Ordenamiento y campos válidos

Esto también es importante.

No siempre conviene permitir ordenar por cualquier campo que mande el cliente.

En APIs más cuidadas, muchas veces se valida qué campos de ordenamiento están permitidos para evitar errores o usos no deseados.

## Ejemplo mental de validación

Podrías permitir ordenar por:

- `name`
- `price`
- `createdAt`

y rechazar cualquier otro campo.

Eso hace la API más robusta.

## Paginación y tamaño máximo

Tampoco conviene permitir tamaños arbitrariamente grandes como:

```text
size=100000
```

En proyectos reales suele ser sano poner límites razonables.

Por ejemplo:

- default 10 o 20
- máximo 50 o 100

## Ejemplo de lógica simple en controller

```java
@GetMapping
public Page<ProductResponseDto> getProducts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "name") String sortBy,
        @RequestParam(defaultValue = "asc") String direction
) {
    if (size > 50) {
        size = 50;
    }

    Sort sort = direction.equalsIgnoreCase("desc")
            ? Sort.by(sortBy).descending()
            : Sort.by(sortBy).ascending();

    Pageable pageable = PageRequest.of(page, size, sort);

    return productService.getActiveProducts(pageable);
}
```

## Qué tiene de bueno este enfoque

Te da más control explícito sobre:

- defaults
- límites
- dirección
- campos

Aunque también agrega algo más de código manual.

## Qué enfoque elegir

Hay varias formas sanas de resolver paginación.

Una buena regla mental puede ser:

- si querés simplicidad, dejá que Spring reciba `Pageable`
- si querés más control del contrato HTTP, parseá y validá los params manualmente

## Ejemplo completo

### Repository

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByActiveTrue(Pageable pageable);
}
```

### Service

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository,
                          ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    public Page<ProductResponseDto> getActiveProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable)
                .map(productMapper::toDto);
    }
}
```

### Controller

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public Page<ProductResponseDto> getProducts(Pageable pageable) {
        return productService.getActiveProducts(pageable);
    }
}
```

## Qué demuestra este ejemplo

Demuestra una integración muy natural entre:

- Spring MVC
- Spring Data JPA
- DTOs
- mapping
- paginación real

Eso es muy valioso para APIs serias.

## Relación con lo anterior

Este tema conecta muy bien con:

- consultas con JPA
- DTOs
- MapStruct
- testing
- Swagger/OpenAPI
- proyecto integrador

Porque una API real tarde o temprano necesita listar datos de forma controlada.

## Buenas prácticas iniciales

## 1. No devolver listas enormes sin necesidad

Paginar suele ser más sano.

## 2. Definir tamaños por defecto razonables

Y límites máximos.

## 3. Pensar bien por qué campos tiene sentido ordenar

No abrir cualquier cosa sin criterio.

## 4. Devolver DTOs paginados cuando haga falta

No siempre entidades directas.

## 5. Revisar el SQL y la performance de consultas grandes

Paginación ayuda, pero igual hay que pensar.

## Comparación con otros lenguajes

### Si venís de JavaScript

Probablemente ya hayas consumido APIs con `page`, `limit`, `sort` o similares. En Spring Boot esto se integra muy naturalmente con `Pageable`, `Page` y `Sort`, lo cual vuelve la implementación bastante elegante.

### Si venís de Python

Puede recordarte a paginación y ordenamiento en frameworks web o ORMs. En Java y Spring Data JPA, la ventaja fuerte es que estos patrones vienen muy bien soportados y encajan de forma muy natural con repositories y DTOs.

## Errores comunes

### 1. Devolver todos los registros de una tabla por defecto

Eso puede volverse un problema rápido.

### 2. No limitar `size`

El cliente podría pedir cantidades absurdas.

### 3. No pensar el ordenamiento

Una lista sin orden claro puede ser inconsistente o poco útil.

### 4. Exponer paginación directa sin pensar el contrato final

A veces conviene envolver o adaptar la respuesta.

### 5. Olvidar que sigue existiendo SQL detrás

La paginación no reemplaza pensar consulta, índices y relaciones.

## Mini ejercicio

Diseñá un endpoint paginado para `Product` que permita:

1. listar solo productos activos
2. elegir página
3. elegir tamaño
4. ordenar por nombre o precio
5. devolver DTOs

Pensá además:

- qué tamaño máximo permitirías
- qué valor por defecto usarías
- qué harías si el cliente pide un campo de orden inválido

## Ejemplo posible

- `GET /products?page=0&size=10&sort=price,desc`
- default `size = 10`
- máximo `size = 50`
- permitir `sortBy = name | price`
- devolver `Page<ProductResponseDto>`

## Resumen

En esta lección viste que:

- la paginación permite dividir grandes listas de datos en porciones manejables
- el ordenamiento permite controlar la secuencia de resultados
- Spring Data JPA ofrece soporte muy cómodo con `Pageable`, `Page` y `Sort`
- paginación y ordenamiento son herramientas esenciales para APIs reales
- conviene combinarlos con DTOs, validaciones de parámetros y buen criterio de performance

## Siguiente tema

La siguiente natural es **refresh tokens**, porque después de consolidar bastante persistencia y endpoints más realistas, el siguiente paso muy valioso en seguridad moderna es mejorar la experiencia y robustez de autenticación basada en JWT.
