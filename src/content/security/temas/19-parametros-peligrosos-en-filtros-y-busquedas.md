---
title: "Parámetros peligrosos en filtros y búsquedas"
description: "Cómo identificar y controlar parámetros peligrosos en filtros y búsquedas de una aplicación Java con Spring Boot. Qué riesgos aparecen cuando el backend acepta demasiada libertad en queries, sorting, paginación y combinaciones de criterios."
order: 19
module: "Requests y validación"
level: "base"
draft: false
---

# Parámetros peligrosos en filtros y búsquedas

## Objetivo del tema

Entender por qué los filtros, búsquedas, ordenamientos y parámetros de consulta pueden convertirse en una de las superficies más subestimadas de una API hecha con Java + Spring Boot.

Este tema es importante porque muchas apps piensan estos endpoints como algo “solo de lectura” y, por eso, les prestan menos atención de la que merecen.

Pero en la práctica, filtros y búsquedas mal diseñados pueden abrir la puerta a problemas como:

- enumeración de recursos
- exposición de datos de más
- consultas demasiado amplias
- fuga de contexto interno
- abuso de performance
- bypass de restricciones de ownership
- acceso a estados o campos que no deberían ser visibles
- combinaciones de criterios que nadie pensó bien

---

## Idea clave

Un endpoint de búsqueda no es inocuo solo porque no haga cambios.

En resumen:

> Un filtro o búsqueda mal diseñado puede darle a un actor demasiado poder para explorar, aprender, enumerar, correlacionar y extraer información del sistema.

La seguridad no se juega solo en “crear”, “editar” o “borrar”.

También se juega en:

- qué se puede listar
- qué se puede ordenar
- qué se puede filtrar
- qué se puede combinar
- cuánto puede pedirse de una sola vez
- qué aprende el actor al probar distintos parámetros

---

## Qué entendemos por “parámetros peligrosos”

Son parámetros que, si el backend acepta con demasiada libertad, pueden ampliar demasiado la capacidad del actor.

### Ejemplos típicos

- `userId`
- `status`
- `role`
- `tenantId`
- `email`
- `from`
- `to`
- `sort`
- `direction`
- `page`
- `size`
- `includeDeleted`
- `includeInternal`
- `export`
- `fields`

No es que estén mal por existir.

El problema aparece cuando el backend no controla suficientemente:

- quién puede usarlos
- qué valores admite
- qué combinaciones son válidas
- cuánto pueden ampliar el alcance de la consulta
- qué costo o visibilidad extra habilitan

---

## Por qué estos parámetros se subestiman tanto

Porque suelen aparecer en endpoints que se perciben como:

- “solo lectura”
- “solo listados”
- “solo búsqueda”
- “solo filtros de UI”
- “solo para backoffice”
- “solo para tablas”

Y entonces el equipo tiende a pensar:

- “no toca nada crítico”
- “si total solo devuelve datos”
- “el frontend ya limita las opciones”
- “nadie va a probar combinaciones raras”
- “la tabla usa ese sort y nada más”

Pero desde el backend la pregunta real es otra:

- ¿qué pasa si el actor prueba valores y combinaciones que la UI no ofrece?
- ¿qué aprende?
- ¿qué volumen puede pedir?
- ¿qué superficies vecinas puede explorar?

---

## Ejemplo básico de endpoint riesgoso

```java
@GetMapping("/orders")
public Page<OrderResponse> search(
        @RequestParam(required = false) Long userId,
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt") String sort) {
    return orderService.search(userId, status, page, size, sort);
}
```

A simple vista parece normal.

Pero en seguridad aparecen preguntas como:

- ¿quién puede mandar `userId`?
- ¿un usuario común puede pedir órdenes de otro?
- ¿qué estados puede consultar?
- ¿el `sort` acepta cualquier campo?
- ¿`size` tiene límite real?
- ¿esta búsqueda puede combinarse para aprender demasiado?
- ¿qué datos de salida incluye?
- ¿qué tan fácil es automatizarla?

---

## Caso 1: filtrar por `userId`

Este es uno de los clásicos.

### Ejemplo riesgoso

```java
@GetMapping("/orders")
public List<OrderResponse> findByUser(@RequestParam Long userId) {
    return orderService.findByUser(userId);
}
```

## ¿Qué puede salir mal?

Si el backend cree demasiado en ese `userId`:

- un usuario autenticado podría consultar órdenes ajenas
- podría enumerar usuarios
- podría correlacionar IDs con actividad
- podría automatizar extracción de datos
- podría aprovechar diferencias entre “hay resultados” y “no hay resultados”

Muchas veces, si el caso es “mis órdenes”, ese parámetro ni siquiera debería existir.

Versión mejor:

```java
@GetMapping("/orders/me")
public List<OrderResponse> myOrders(Authentication authentication) {
    return orderService.findByCurrentUser(authentication.getName());
}
```

---

## Caso 2: `status` demasiado abierto

Filtrar por estado parece inocuo.
Pero muchas veces el estado revela más de lo que parece.

### Ejemplo

- `PENDING`
- `PAID`
- `REFUNDED`
- `CANCELLED`
- `INTERNAL_REVIEW`
- `BLOCKED`
- `FRAUD_CHECK`

La pregunta no es solo si el parámetro existe.

La pregunta es:

- ¿qué actor puede filtrar por qué estados?
- ¿hay estados internos que no deberían ser visibles?
- ¿el sistema está exponiendo workflow interno?
- ¿combinado con otros parámetros permite aprender demasiado?

No todos los estados deberían necesariamente estar disponibles para todos los actores.

---

## Caso 3: `sort` arbitrario

Este es un clásico muy subestimado.

### Ejemplo riesgoso

```java
@GetMapping("/users")
public Page<UserResponse> list(
        @RequestParam(defaultValue = "createdAt") String sort,
        @RequestParam(defaultValue = "asc") String direction,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
    return userService.list(sort, direction, page, size);
}
```

## Riesgos posibles

- ordenar por campos que la UI no muestra
- ordenar por campos internos o sensibles
- provocar errores útiles para aprender nombres de columnas
- generar consultas más costosas
- facilitar enumeración o inferencia por orden

### Mejor enfoque

Tener una whitelist clara de campos permitidos.

Por ejemplo:

- `createdAt`
- `name`

Y rechazar el resto.

No conviene dejar `sort` totalmente libre “porque después vemos”.

---

## Caso 4: `size` sin límite

Otro clásico.

### Ejemplo riesgoso

```java
@GetMapping("/products")
public Page<ProductResponse> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
    return productService.list(page, size);
}
```

Si `size` no se limita realmente, el actor podría pedir:

- 1000
- 10000
- 50000

Eso puede generar:

- abuso de recursos
- respuestas enormes
- mayor exposición de datos
- extracción masiva
- consultas costosas
- presión innecesaria sobre DB y app

La defensa básica es simple:

- imponer un máximo razonable
- ignorar valores excesivos o rechazarlos
- no confiar en que el frontend nunca mandará más

---

## Caso 5: filtros combinados que amplían demasiado el alcance

A veces cada filtro individual parece razonable, pero la combinación se vuelve peligrosa.

### Ejemplo

```java
@GetMapping("/admin/orders")
public Page<OrderResponse> search(
        @RequestParam(required = false) String email,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) LocalDate from,
        @RequestParam(required = false) LocalDate to,
        @RequestParam(required = false) String sort,
        @RequestParam(defaultValue = "20") int size) {
    return adminOrderService.search(email, status, from, to, sort, size);
}
```

Esto puede estar bien para un actor administrativo real.

Pero en otros contextos podría ser demasiado poderoso porque permite:

- acotar rangos
- explorar actividad
- localizar usuarios
- correlacionar comportamiento
- extraer listados muy precisos

No solo importa el parámetro aislado.
Importa el **poder combinado** de la búsqueda.

---

## Caso 6: `includeDeleted`, `includeInternal` y flags similares

Estos parámetros suelen aparecer en backoffice o endpoints viejos.

### Ejemplo riesgoso

```java
@GetMapping("/products")
public List<ProductResponse> list(
        @RequestParam(defaultValue = "false") boolean includeDeleted,
        @RequestParam(defaultValue = "false") boolean includeInternal) {
    return productService.list(includeDeleted, includeInternal);
}
```

Si el backend no controla bien quién puede usar eso, el actor podría acceder a:

- recursos borrados lógicamente
- estados internos
- información administrativa
- flags de moderación
- datos que la UI nunca mostraría

Este tipo de parámetros merecen muchísimo cuidado.

---

## Caso 7: búsquedas por texto libre

Ejemplo:

```java
@GetMapping("/users/search")
public Page<UserResponse> search(
        @RequestParam String q,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
    return userService.search(q, page, size);
}
```

### Riesgos posibles

- consultas demasiado amplias
- enumeración de usuarios
- aprendizaje de existencia
- extracción masiva por búsqueda incremental
- presión sobre índices o performance
- diferencias sutiles entre respuestas

La búsqueda no solo debe “funcionar”.
También debe estar pensada para no dar demasiado poder exploratorio.

---

## Caso 8: paginación ingenua

La paginación mejora rendimiento y UX, pero no resuelve sola problemas de seguridad.

### Preguntas útiles

- ¿qué pasa si alguien recorre todas las páginas?
- ¿qué tan fácil es automatizar extracción?
- ¿hay límite de `size`?
- ¿los resultados están suficientemente filtrados por actor o tenant?
- ¿la paginación revela demasiado contexto sobre cantidad total?

A veces incluso el total de resultados ya revela información sensible.

---

## Qué deberías controlar siempre en filtros y búsquedas

## 1. Qué parámetros existen
No exponer filtros “porque sí”.

## 2. Qué valores admite cada uno
Whitelists, enums, límites, validación.

## 3. Qué actor puede usar cada combinación
No todos deberían poder filtrar igual.

## 4. Cuánto amplían el alcance
Pensar qué datos o contexto extra habilitan.

## 5. Qué costo generan
Performance también forma parte del riesgo.

## 6. Qué aprende el actor
Aunque no cambie nada, una búsqueda puede enseñar demasiado.

---

## Ejemplo sano de control de parámetros

### DTO de búsqueda

```java
public class SearchOrdersRequest {

    @Size(max = 100)
    private String email;

    private OrderStatus status;

    @Min(0)
    private Integer page = 0;

    @Min(1)
    @Max(100)
    private Integer size = 20;
}
```

### Controller

```java
@GetMapping("/admin/orders")
public Page<OrderResponse> search(
        @Valid SearchOrdersRequest request,
        Authentication authentication) {
    return orderService.search(request, authentication.getName());
}
```

### Service

```java
public Page<OrderResponse> search(SearchOrdersRequest request, String username) {
    User actor = userRepository.findByEmail(username).orElseThrow();

    if (!actor.hasRole("ADMIN") && !actor.hasRole("SUPPORT")) {
        throw new AccessDeniedException("No autorizado");
    }

    int safeSize = Math.min(request.getSize(), 100);

    return orderRepository.search(
            request.getEmail(),
            request.getStatus(),
            PageRequest.of(request.getPage(), safeSize, Sort.by("createdAt").descending())
    );
}
```

### Qué mejora esto

- parámetros más controlados
- tamaño acotado
- actor validado
- orden fijo o controlado
- menos libertad arbitraria

---

## Qué papel juega el service acá

El service no solo ejecuta la búsqueda.

También debería decidir:

- quién puede usar qué filtro
- qué campos son válidos
- qué tamaño máximo permitir
- qué sorts aceptar
- si cierto estado debe ser visible
- si el actor puede ver datos globales o solo propios

Este es un lugar muy importante para evitar confianza ingenua.

---

## Señales de que un endpoint de búsqueda merece revisión

Estas señales suelen hacer ruido rápido:

- `userId` desde request en endpoints de datos propios
- `size` sin límite
- `sort` libre
- filtros por campos internos
- demasiados parámetros opcionales sin control claro
- queries que mezclan tenant o ownership de forma débil
- respuestas masivas
- flags como `includeDeleted`, `includeHidden`, `includeInternal`
- búsquedas por texto libre sobre datos sensibles
- endpoints “solo para tablas” con demasiado poder

---

## Qué gana la app si controla mejor esto

Cuando filtros y búsquedas están mejor diseñados, la app gana:

- menos enumeración
- menos extracción masiva
- menos exposición lateral
- menos presión innecesaria sobre recursos
- contratos de consulta más claros
- menos dependencia en que la UI limite opciones
- mejor control por actor o tenant
- menos superficie para exploración abusiva

---

## Checklist práctico

Cuando revises filtros y búsquedas en una app Spring, preguntate:

- ¿qué parámetros acepta el endpoint?
- ¿quién puede usarlos?
- ¿hay alguno que debería salir del contexto autenticado y no del request?
- ¿`size` tiene límite razonable?
- ¿`sort` está acotado a campos permitidos?
- ¿hay estados o flags internos filtrables?
- ¿las combinaciones de filtros dan demasiado poder exploratorio?
- ¿la query podría automatizarse para extraer datos?
- ¿el actor puede aprender demasiado aunque no modifique nada?
- ¿la UI está ocultando opciones que el backend igual aceptaría?

---

## Mini ejercicio de reflexión

Tomá tres endpoints de búsqueda de tu backend y respondé:

1. ¿Qué parámetros aceptan?
2. ¿Cuáles son realmente necesarios?
3. ¿Cuáles podrían dar demasiado alcance si se manipulan?
4. ¿Qué límites tienen `page`, `size` y `sort`?
5. ¿Qué podría aprender un actor probando combinaciones?
6. ¿Qué parámetro parece pensado para la UI pero resulta demasiado poderoso desde backend?

Ese ejercicio ayuda muchísimo a ver que “solo lectura” no significa “poco riesgo”.

---

## Resumen

Los filtros y búsquedas pueden ser una superficie muy poderosa de abuso cuando el backend acepta con demasiada libertad:

- IDs
- estados
- rangos
- sorts
- tamaños
- flags
- combinaciones

En resumen:

> Un endpoint de búsqueda no necesita modificar nada para ser peligroso.  
> A veces alcanza con que le permita al actor ver, aprender, ordenar y recorrer demasiado bien el sistema.

---

## Próximo tema

**Cómo evitar que un endpoint reciba más de lo que debería**
