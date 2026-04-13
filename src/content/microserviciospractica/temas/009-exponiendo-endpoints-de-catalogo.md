---
title: "Exponiendo endpoints de catálogo"
description: "Implementación de los primeros endpoints funcionales de catalog-service. Creación de un servicio simple en memoria, un controlador de productos y verificación de GET /products y GET /products/{id}."
order: 9
module: "Módulo 2 · Primer flujo funcional del sistema"
level: "base"
draft: false
---

# Exponiendo endpoints de catálogo

En la clase anterior creamos el modelo `Product` dentro de `catalog-service`.

Ahora vamos a dar el siguiente paso natural:

**exponer una API real de catálogo.**

Esto significa que `catalog-service` va a dejar de ser solo un proyecto con una clase de modelo y va a empezar a responder endpoints útiles para consultar productos.

Todavía no vamos a usar base de datos.  
En esta etapa conviene ir por una solución simple y verificable: una lista en memoria que nos permita levantar el servicio, probar rutas y validar comportamiento sin agregar persistencia antes de tiempo.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar funcionando en `catalog-service`:

- `GET /products`
- `GET /products/{id}`

Además, el servicio debería tener:

- una clase de servicio simple,
- una lista de productos en memoria,
- un controlador que exponga las rutas,
- y respuestas verificables por navegador, Postman o `curl`.

---

## Estado de partida

Partimos de `catalog-service` con esta base:

- el servicio ya arranca correctamente,
- existe la clase `Product`,
- la estructura interna por paquetes ya está definida.

Por ejemplo:

```txt
src/main/java/com/novamarket/catalog/
  CatalogServiceApplication.java
  controller/
  service/
  repository/
  model/
    Product.java
  dto/
  config/
```

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear un `ProductService` simple,
- cargar algunos productos en memoria,
- crear un `ProductController`,
- exponer `GET /products`,
- exponer `GET /products/{id}`,
- y probar ambas rutas.

---

## Enfoque recomendado para esta etapa

Como todavía no entramos en JPA, lo más conveniente es trabajar con una lista fija en memoria.

Eso nos da varias ventajas:

- implementación rápida,
- bajo nivel de complejidad,
- facilidad para probar,
- y una API funcional real sin depender todavía de infraestructura adicional.

Cuando llegue el momento de persistencia, reemplazaremos esta estrategia por una basada en base de datos.

---

## Paso 1 · Crear `ProductService`

Dentro de `catalog-service`, creá la clase:

```txt
src/main/java/com/novamarket/catalog/service/ProductService.java
```

Una versión inicial razonable podría ser esta:

```java
package com.novamarket.catalog.service;

import com.novamarket.catalog.model.Product;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final List<Product> products = List.of(
        new Product(1L, "Notebook", "Notebook para trabajo y estudio", new BigDecimal("1200.00"), true),
        new Product(2L, "Mouse", "Mouse inalámbrico", new BigDecimal("25.50"), true),
        new Product(3L, "Teclado", "Teclado mecánico", new BigDecimal("80.00"), true)
    );

    public List<Product> findAll() {
        return products;
    }

    public Product findById(Long id) {
        return products.stream()
                .filter(product -> product.getId().equals(id))
                .findFirst()
                .orElse(null);
    }
}
```

---

## Por qué esta implementación es suficiente por ahora

Acá no estamos buscando una solución definitiva.  
Estamos buscando una solución útil para esta etapa del curso.

Este `ProductService` ya nos permite:

- devolver una lista de productos,
- buscar un producto por id,
- y validar el comportamiento del catálogo.

Además, deja bastante clara la relación entre:

- el modelo `Product`,
- una capa de servicio,
- y el controlador que vamos a crear a continuación.

---

## Paso 2 · Crear `ProductController`

Ahora creá esta clase en:

```txt
src/main/java/com/novamarket/catalog/controller/ProductController.java
```

Una implementación inicial razonable podría ser:

```java
package com.novamarket.catalog.controller;

import com.novamarket.catalog.model.Product;
import com.novamarket.catalog.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<Product> findAll() {
        return productService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> findById(@PathVariable Long id) {
        Product product = productService.findById(id);

        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(product);
    }
}
```

---

## Qué está pasando en este controlador

Este controlador hace dos cosas simples pero muy importantes.

### `GET /products`
Devuelve todos los productos en memoria.

### `GET /products/{id}`
Busca un producto por id y:

- devuelve `200 OK` si lo encuentra,
- devuelve `404 Not Found` si no existe.

Esto ya nos deja una API de catálogo funcional y razonablemente correcta para esta etapa.

---

## Paso 3 · Revisar estructura final de `catalog-service`

Después de crear estas clases, la estructura debería verse aproximadamente así:

```txt
src/main/java/com/novamarket/catalog/
  CatalogServiceApplication.java
  controller/
    ProductController.java
  service/
    ProductService.java
  repository/
  model/
    Product.java
  dto/
  config/
```

Todavía no usamos `repository`, `dto` ni `config` para esta funcionalidad, y eso está bien.

---

## Paso 4 · Levantar `catalog-service`

Ahora toca arrancar nuevamente el servicio.

Podés hacerlo desde el IDE o con Maven.

Lo importante es verificar que:

- no haya errores de compilación,
- Spring detecte el controller y el service,
- y el servicio quede arriba en el puerto configurado.

---

## Paso 5 · Probar `GET /products`

Una vez levantado el servicio, probá:

```txt
http://localhost:8081/products
```

También podés usar `curl`:

```bash
curl http://localhost:8081/products
```

La respuesta esperada debería ser una lista JSON con los tres productos definidos en memoria.

Por ejemplo, algo conceptualmente parecido a:

```json
[
  {
    "id": 1,
    "name": "Notebook",
    "description": "Notebook para trabajo y estudio",
    "price": 1200.00,
    "active": true
  }
]
```

Obviamente la lista completa debería incluir todos los productos cargados.

---

## Paso 6 · Probar `GET /products/{id}`

Ahora probá una consulta puntual.

Por ejemplo:

```txt
http://localhost:8081/products/1
```

O con `curl`:

```bash
curl http://localhost:8081/products/1
```

La respuesta esperada debería ser un JSON representando ese producto.

También conviene probar un id inexistente, por ejemplo:

```txt
http://localhost:8081/products/99
```

En ese caso, la respuesta debería ser `404 Not Found`.

---

## Qué estamos logrando con esta clase

Aunque todavía trabajamos con una lista fija, ya conseguimos algo muy importante:

`catalog-service` tiene ahora una responsabilidad visible y comprobable dentro de NovaMarket.

Después de esta clase, ya existe una API real para consultar productos.  
Eso transforma el proyecto de forma bastante significativa.

---

## Qué todavía no hicimos

Todavía no implementamos:

- persistencia con JPA,
- DTOs de salida,
- validaciones más avanzadas,
- paginación,
- filtros,
- seguridad,
- ni integración con otros servicios.

Todo eso vendrá después.

Por ahora, el objetivo es tener el catálogo funcionando y listo para el resto del flujo.

---

## Posibles mejoras futuras que ya quedan preparadas

Esta implementación simple nos deja listos varios pasos futuros:

- migrar la lista en memoria a base de datos,
- exponer solo productos activos,
- devolver DTOs en vez de entidades del dominio,
- agregar endpoints de alta o modificación si más adelante hicieran falta.

Ese es otro motivo por el que conviene mantener la estructura por capas desde el principio.

---

## Errores comunes en esta etapa

### 1. Crear el controller en el paquete equivocado
Debería vivir en `controller/`.

### 2. No anotar correctamente el servicio o el controlador
Sin `@Service` o `@RestController`, Spring no los va a detectar como esperamos.

### 3. Usar mal `@PathVariable`
Conviene revisar bien el mapping del endpoint por id.

### 4. No manejar el caso de producto inexistente
Devolver `404` es mucho más correcto que responder cualquier cosa.

### 5. No probar las rutas después de codificar
En este curso, cada paso importante debería terminar con una verificación real.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `catalog-service` debería exponer correctamente:

- `GET /products`
- `GET /products/{id}`

Y deberías poder consultar productos reales del sistema aunque todavía estén cargados en memoria.

Eso convierte a `catalog-service` en el primer servicio funcional real de NovaMarket.

---

## Punto de control

Antes de seguir, verificá que:

- existe `ProductService`,
- existe `ProductController`,
- `GET /products` devuelve la lista,
- `GET /products/{id}` devuelve un producto por id,
- y `GET /products/{id}` devuelve `404` cuando corresponde.

Si eso está bien, ya podemos pasar al segundo dominio importante del sistema: el inventario.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a trabajar en `inventory-service` creando el modelo de inventario.

Ese paso es clave para que más adelante `order-service` pueda validar stock antes de aceptar una orden.

---

## Cierre

En esta clase convertimos `catalog-service` en un servicio funcional real.

Ahora NovaMarket ya tiene una primera API concreta y verificable, y eso marca el inicio del flujo de negocio del sistema.

A partir de acá, el proyecto empieza a sentirse de verdad como una aplicación distribuida en construcción.
