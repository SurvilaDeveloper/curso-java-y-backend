---
title: "Búsqueda y filtrado avanzado"
description: "Cómo diseñar búsquedas y filtros más expresivos en una API, qué estrategias existen y qué cosas conviene cuidar para que sigan siendo correctos, útiles y eficientes."
order: 62
module: "Arquitectura y escalabilidad"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya recorriste una parte muy amplia del backend con Java y Spring Boot:

- controllers
- services
- DTOs
- validaciones
- seguridad
- persistencia
- testing
- observabilidad
- cache
- arquitectura
- versionado de API
- multitenancy

Eso ya te permite construir APIs bastante serias.

Pero cuando una aplicación empieza a manejar más datos y más casos reales, aparece una necesidad muy importante:

**¿cómo permitís que el cliente busque y filtre información de forma flexible sin volver la API caótica o ineficiente?**

Ahí entra la búsqueda y el filtrado avanzado.

## La idea general

Al principio, muchas APIs arrancan con endpoints simples como:

```text
GET /products
```

o como mucho:

```text
GET /products?categoryId=3
```

Eso está bien para empezar.

Pero en sistemas reales pronto aparece la necesidad de permitir consultas más expresivas, por ejemplo:

- buscar por texto
- filtrar por categoría
- filtrar por estado
- filtrar por rango de precio
- filtrar por fecha
- combinar filtros
- ordenar
- paginar
- buscar dentro de un tenant específico
- distinguir filtros opcionales de obligatorios

Ese es un salto importante.

## Qué es filtrar

Filtrar significa devolver solo los elementos que cumplen ciertas condiciones.

Por ejemplo:

- productos activos
- órdenes de un usuario
- tareas pendientes
- órdenes creadas esta semana
- clientes con email verificado

## Qué es buscar

Buscar suele implicar una forma más libre o más textual de encontrar información.

Por ejemplo:

- productos cuyo nombre contenga “notebook”
- usuarios por email o username
- órdenes por número de referencia
- tareas por palabra clave

## Por qué este tema importa tanto

Porque una API real no suele servir solo para crear y leer recursos de forma rígida.

Muy seguido necesita soportar:

- paneles administrativos
- listados con filtros
- catálogos
- búsquedas por texto
- dashboards
- reportes
- navegación rica del frontend

Y si la búsqueda está mal diseñada, el sistema se vuelve incómodo o costoso de mantener.

## Qué problema resuelve

Este tema ayuda a resolver preguntas como:

- ¿cómo represento filtros en una API?
- ¿cómo combino varios filtros opcionales?
- ¿cómo evito endpoints duplicados para cada caso?
- ¿cómo hago búsquedas expresivas sin romper performance?
- ¿cómo valido filtros?
- ¿cómo mantengo claridad del contrato?

## Filtros simples en query params

La forma más común y natural de empezar es usar query params.

Ejemplo:

```text
GET /products?active=true&categoryId=3
```

## Qué ventaja tiene esto

- es simple
- es entendible
- encaja bien con HTTP GET
- es amigable para frontend
- es fácil de documentar

## Qué problema aparece después

Cuando los filtros empiezan a crecer mucho, podés terminar con cosas como:

```text
GET /products?active=true&categoryId=3&minPrice=100&maxPrice=500&search=notebook&sort=price,asc&page=0&size=20
```

Esto todavía puede estar bien, pero ya exige más criterio de diseño y más cuidado en el backend.

## Filtrado básico con Spring

Supongamos este controller:

```java
@RestController
@RequestMapping("/products")
public class ProductController {

    @GetMapping
    public List<ProductResponseDto> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean active
    ) {
        return List.of();
    }
}
```

## Qué muestra esto

Que los filtros pueden entrar como parámetros opcionales de la request.

## Qué pasa después

El problema interesante no es solo recibirlos.
Es decidir cómo aplicar esos filtros de forma:

- correcta
- flexible
- mantenible
- eficiente

## Filtros opcionales

En sistemas reales, es muy común que varios filtros sean opcionales.

Por ejemplo:

- si llega `categoryId`, filtrar por categoría
- si llega `active`, filtrar por estado
- si llega `search`, aplicar búsqueda textual
- si no llega alguno, simplemente no usarlo

Eso lleva naturalmente a consultas dinámicas o composiciones más flexibles.

## Qué NO conviene hacer

No conviene crear un endpoint distinto para cada combinación imaginable.

Por ejemplo, esto sería una mala señal:

- `/products/active`
- `/products/by-category`
- `/products/by-category-and-price`
- `/products/by-search-and-status`
- `/products/by-category-and-search-and-price`

Eso escala muy mal.

## Criterio importante

Conviene pensar el listado principal como una consulta flexible con filtros opcionales, no como una explosión de endpoints especializados.

## Filtros exactos

Son los más simples.

Ejemplos:

- `active=true`
- `status=PENDING`
- `categoryId=3`
- `currency=ARS`

## Filtros por rango

También muy comunes.

Ejemplos:

- `minPrice=100`
- `maxPrice=500`
- `createdAfter=2026-01-01`
- `createdBefore=2026-01-31`

## Búsqueda textual

Otra necesidad muy común.

Ejemplos:

- `search=notebook`
- `query=juan`
- `q=orden 123`

Acá aparece bastante rápido el tema de cómo implementar búsquedas parciales o por múltiples campos.

## Ejemplo mental de búsqueda

Podrías querer que:

```text
GET /products?search=note
```

encuentre productos cuyo nombre contenga “note”.

O incluso combinar varios campos, como:

- nombre
- descripción
- SKU

## Búsqueda y JPA

Con Spring Data JPA, algunas búsquedas simples pueden resolverse con métodos derivados.

Ejemplo:

```java
Page<Product> findByNameContainingIgnoreCase(String text, Pageable pageable);
```

## Qué hace esto

Busca productos cuyo nombre contenga cierto texto ignorando mayúsculas y minúsculas.

## Qué limitación puede aparecer

Que si querés combinar muchos filtros opcionales, los métodos derivados empiezan a quedarse cortos o a volverse imprácticos.

## Ejemplo de método que empieza a ser incómodo

```java
findByActiveTrueAndCategoryIdAndPriceGreaterThanAndNameContainingIgnoreCase(...)
```

Eso ya se vuelve poco agradable.

## Cuándo aparece la necesidad de algo más flexible

Cuando querés combinar:

- muchos filtros opcionales
- paginación
- ordenamiento
- condiciones dinámicas

Ahí suele hacer falta una estrategia más escalable.

## Estrategias comunes para filtrado más avanzado

A nivel general, suelen aparecer varias estrategias como:

- JPQL con condiciones específicas
- queries dinámicas
- Specifications
- Criteria API
- QueryDSL
- motores de búsqueda más potentes para casos complejos

No hace falta dominar todas hoy.
La idea es entender el terreno general.

## Specifications

En el ecosistema Spring Data, una estrategia bastante conocida para filtros dinámicos es usar Specifications.

No hace falta entrar todavía en toda la API exacta si no querés, pero sí entender la idea:

podés construir condiciones de forma combinable y dinámica.

## Qué gana el diseño con eso

Que podés armar consultas complejas sin tener que codificar un método fijo por cada combinación de filtros.

## Ejemplo mental de filtro compuesto

Supongamos estos filtros opcionales:

- `search`
- `categoryId`
- `active`
- `minPrice`
- `maxPrice`

Una estrategia más avanzada podría ir sumando condiciones solo cuando cada filtro existe.

## DTO de filtro

También puede ser útil agrupar filtros en una clase.

Ejemplo:

```java
public class ProductFilter {
    private String search;
    private Long categoryId;
    private Boolean active;
    private Double minPrice;
    private Double maxPrice;

    public String getSearch() {
        return search;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public Boolean getActive() {
        return active;
    }

    public Double getMinPrice() {
        return minPrice;
    }

    public Double getMaxPrice() {
        return maxPrice;
    }
}
```

## Qué ventaja tiene esto

Que el filtro se vuelve una unidad más clara del caso de uso.

En vez de pasar diez parámetros sueltos, podés trabajar con un objeto de criterios.

## Cuándo conviene un objeto filtro

Conviene mucho cuando:

- hay varios parámetros
- querés validarlos juntos
- querés pasarlos del controller al service con más orden
- querés componer mejor la lógica de consulta

## Controller con filtro

```java
@GetMapping
public Page<ProductResponseDto> getProducts(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) Boolean active,
        @RequestParam(required = false) Double minPrice,
        @RequestParam(required = false) Double maxPrice,
        Pageable pageable
) {
    ProductFilter filter = new ProductFilter(search, categoryId, active, minPrice, maxPrice);
    return productService.searchProducts(filter, pageable);
}
```

## Qué muestra esto

Que la capa web puede seguir siendo clara y al mismo tiempo entregar un objeto de filtro más ordenado al service.

## Validar filtros

Esto es muy importante.

Los filtros también forman parte del contrato de la API.

Por ejemplo, deberías pensar cosas como:

- `minPrice` no puede ser negativa
- `maxPrice` no debería ser menor que `minPrice`
- el campo de ordenamiento debe ser válido
- ciertas combinaciones pueden no tener sentido
- una fecha “desde” no puede ser posterior a una fecha “hasta”

## Por qué esto importa

Porque una API madura no solo recibe filtros: también los valida y responde con sentido si vienen mal.

## Ejemplo de validación simple

```java
if (filter.getMinPrice() != null && filter.getMinPrice() < 0) {
    throw new IllegalArgumentException("minPrice no puede ser negativa");
}

if (filter.getMinPrice() != null && filter.getMaxPrice() != null
        && filter.getMinPrice() > filter.getMaxPrice()) {
    throw new IllegalArgumentException("minPrice no puede ser mayor que maxPrice");
}
```

## Filtrado y seguridad

También hay que pensar esto.

No todo filtro es solo una comodidad del cliente.
A veces debe cruzarse con reglas de seguridad.

Por ejemplo:

- un usuario solo puede buscar sus propias órdenes
- un tenant solo puede filtrar dentro de sus datos
- un admin puede ver más cosas que un usuario común

Entonces el filtrado no vive solo en el aire: se cruza con autorización y contexto.

## Ejemplo mental

```text
GET /orders?status=PENDING
```

Ese endpoint quizá no debería devolver todas las órdenes pendientes del sistema, sino solo las del usuario autenticado o las del tenant actual.

## Búsqueda libre vs filtrado estructurado

Conviene distinguirlos.

### Búsqueda libre

Por ejemplo:

```text
search=notebook
```

Más flexible, pero más ambigua.

### Filtrado estructurado

Por ejemplo:

```text
categoryId=3&active=true
```

Más preciso y más fácil de razonar.

Muchas APIs combinan ambas cosas.

## Ordenamiento y paginación

Esto conecta directamente con la lección anterior.

Una búsqueda o filtro avanzado casi siempre convive con:

- paginación
- ordenamiento

Porque de poco sirve permitir filtros ricos si después devolvés todo descontroladamente.

## Ejemplo bastante realista

```text
GET /products?search=notebook&categoryId=3&minPrice=100&page=0&size=20&sort=price,asc
```

Eso ya representa una API bastante real.

## Performance y filtrado

Este tema es crucial.

No alcanza con que la búsqueda “funcione”.
También tiene que ser razonablemente eficiente.

Conviene pensar cosas como:

- índices
- cantidad de joins
- volumen de datos
- selectividad del filtro
- paginación
- si conviene usar búsqueda textual simple o algo más especializado

## Cuándo una búsqueda simple ya no alcanza

En algunos casos, una búsqueda con `LIKE` o `ContainingIgnoreCase` puede ser suficiente.

Pero si necesitás cosas como:

- relevancia
- full-text search potente
- tolerancia a errores
- stemming
- búsqueda avanzada por texto

quizá ya convenga pensar en herramientas especializadas.

Para esta etapa no hace falta entrar ahí todavía, pero conviene saber que existe ese límite.

## Filtros y contrato limpio

También es importante no volver la API inmanejable.

Una API de búsqueda avanzada sigue necesitando:

- nombres claros
- parámetros coherentes
- defaults razonables
- documentación buena
- reglas bien definidas

## Qué conviene documentar

Si tenés un endpoint con varios filtros, conviene documentar:

- qué parámetros admite
- cuáles son opcionales
- qué formato espera cada uno
- qué validaciones aplica
- qué valores de ordenamiento permite
- qué combinaciones importantes existen

OpenAPI y Swagger ayudan muchísimo acá.

## Ejemplo conceptual de repository simple

```java
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByNameContainingIgnoreCase(String search, Pageable pageable);

    Page<Product> findByCategoryIdAndActiveTrue(Long categoryId, Pageable pageable);
}
```

## Qué muestra esto

Que para ciertos casos simples, los métodos derivados siguen siendo útiles.

## Cuándo dar un salto de complejidad

Conviene darlo cuando realmente lo necesitás.

Por ejemplo:

- varios filtros opcionales
- combinaciones crecientes
- demasiados métodos derivados
- necesidad de componer condiciones de forma dinámica

## Ejemplo conceptual de service

```java
@Service
public class ProductService {

    public Page<ProductResponseDto> searchProducts(ProductFilter filter, Pageable pageable) {
        // validar filtros
        // construir consulta dinámica
        // mapear resultados
        return Page.empty();
    }
}
```

## Qué expresa esto

Que el service puede actuar como orquestador del filtrado:

- valida
- interpreta
- delega búsqueda
- transforma a DTOs

## Búsqueda avanzada y dominio

También conviene pensar si la búsqueda expresa una necesidad del dominio o solo una conveniencia técnica.

Por ejemplo:

- “productos activos de una categoría” puede ser una necesidad muy de negocio
- “buscar por texto en nombre y descripción” también puede ser una necesidad real del catálogo
- “órdenes del usuario autenticado en cierto rango de fechas” claramente cruza dominio y seguridad

No todo filtro es superficial.

## Búsqueda y multitenancy

Esto conecta muy fuerte con la lección anterior.

Si tu sistema es multitenant, toda búsqueda tiene que respetar el tenant actual.

De lo contrario, un filtro bien armado pero mal aislado puede terminar mezclando datos entre clientes.

## Ejemplo mental de query segura

```java
Page<Order> findByTenantIdAndStatus(Long tenantId, OrderStatus status, Pageable pageable);
```

## Qué demuestra esto

Que el contexto de tenant también forma parte de la búsqueda.

## Qué no conviene hacer

No conviene:

- crear un endpoint nuevo por cada combinación de filtros
- dejar filtros sin validación
- permitir ordenamientos arbitrarios sin control
- ignorar seguridad o tenant al buscar
- no pensar performance
- mezclar demasiado contrato externo con detalles internos

## Buenas prácticas iniciales

## 1. Empezar simple, pero con estructura que pueda crecer

No hace falta una mega solución desde el primer día.

## 2. Agrupar filtros cuando empiezan a ser varios

Un objeto filtro suele ayudar mucho.

## 3. Validar filtros y combinaciones

También forman parte del contrato.

## 4. Combinar bien filtrado con paginación y ordenamiento

Eso vuelve a la API mucho más útil.

## 5. Pensar seguridad, tenant y performance en cada búsqueda importante

No solo funcionalidad superficial.

## Ejemplo completo conceptual

### Filtro

```java
public class ProductFilter {
    private final String search;
    private final Long categoryId;
    private final Boolean active;
    private final Double minPrice;
    private final Double maxPrice;

    public ProductFilter(String search, Long categoryId, Boolean active, Double minPrice, Double maxPrice) {
        this.search = search;
        this.categoryId = categoryId;
        this.active = active;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
    }

    public String getSearch() {
        return search;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public Boolean getActive() {
        return active;
    }

    public Double getMinPrice() {
        return minPrice;
    }

    public Double getMaxPrice() {
        return maxPrice;
    }
}
```

### Controller

```java
@GetMapping("/products")
public Page<ProductResponseDto> getProducts(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) Boolean active,
        @RequestParam(required = false) Double minPrice,
        @RequestParam(required = false) Double maxPrice,
        Pageable pageable
) {
    ProductFilter filter = new ProductFilter(search, categoryId, active, minPrice, maxPrice);
    return productService.searchProducts(filter, pageable);
}
```

### Service

```java
public Page<ProductResponseDto> searchProducts(ProductFilter filter, Pageable pageable) {
    // validar
    // delegar búsqueda dinámica
    // mapear resultados
    return Page.empty();
}
```

## Qué demuestra este ejemplo

Demuestra una dirección sana para APIs que empiezan a necesitar búsquedas más serias:

- contrato claro
- filtros opcionales
- composición ordenada
- lugar para validar
- integración con paginación

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a endpoints con query params cada vez más ricos y al problema de no convertir la API en un caos de rutas duplicadas. En Java y Spring Boot la situación es la misma, pero el ecosistema te invita mucho a estructurar mejor filtros, DTOs y paginación.

### Si venís de Python

Puede parecerse a construir filtros dinámicos, búsquedas textuales y listados ricos en APIs web. En Java, el desafío es el mismo: equilibrar flexibilidad, claridad, performance y seguridad sin volver el backend inmantenible.

## Errores comunes

### 1. Crear un endpoint por cada combinación de filtros

Eso escala muy mal.

### 2. No validar filtros

Después aparecen errores raros o resultados incoherentes.

### 3. Ignorar paginación y ordenamiento en búsquedas grandes

La API se vuelve menos útil y menos eficiente.

### 4. No pensar en seguridad o tenant al filtrar

Eso puede ser muy grave.

### 5. Meter una solución complejísima demasiado pronto

Conviene crecer con criterio.

## Mini ejercicio

Tomá un recurso de tu proyecto integrador, por ejemplo:

- productos
- órdenes
- tareas
- usuarios

Y diseñá un endpoint de búsqueda avanzada definiendo:

1. qué filtros permitirías
2. cuáles serían opcionales
3. cómo los representarías en query params
4. qué validaciones harías
5. cómo combinarías eso con paginación y ordenamiento
6. qué riesgos de seguridad o performance tendrías que cuidar

## Ejemplo posible

Recurso:
productos

Filtros:
- `search`
- `categoryId`
- `active`
- `minPrice`
- `maxPrice`

Query ejemplo:

```text
GET /products?search=notebook&categoryId=3&minPrice=100&maxPrice=500&page=0&size=20&sort=price,asc
```

## Resumen

En esta lección viste que:

- las APIs reales suelen necesitar búsquedas y filtros más expresivos
- conviene distinguir búsqueda libre de filtrado estructurado
- los filtros suelen modelarse bien con query params y, cuando crecen, con objetos filtro
- la búsqueda avanzada debe convivir con validación, paginación, ordenamiento, seguridad y performance
- diseñar bien esta parte hace que una API sea mucho más útil y profesional

## Siguiente tema

La siguiente natural es **auditoría y trazabilidad de acciones**, porque después de profundizar bastante en arquitectura, seguridad, contratos y búsquedas más ricas, otro paso muy valioso en sistemas más serios es registrar qué pasó, quién lo hizo y cuándo ocurrió.
