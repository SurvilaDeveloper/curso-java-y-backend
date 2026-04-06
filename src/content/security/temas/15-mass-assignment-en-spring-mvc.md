---
title: "Mass assignment en Spring MVC"
description: "Qué es mass assignment en una aplicación Java con Spring Boot, por qué aparece al bindear requests demasiado abiertos y cómo prevenirlo con DTOs acotados, mapeo explícito y operaciones más específicas."
order: 15
module: "Requests y validación"
level: "base"
draft: false
---

# Mass assignment en Spring MVC

## Objetivo del tema

Entender qué es **mass assignment** en una aplicación Java + Spring Boot, por qué aparece con tanta facilidad cuando el backend acepta objetos demasiado abiertos y cómo prevenirlo sin complicar innecesariamente el diseño.

Este tema es importante porque el mass assignment no siempre se ve como “una vulnerabilidad espectacular”.

Muchas veces aparece disfrazado de:

- comodidad
- rapidez de desarrollo
- menos clases
- menos mapping
- menos código repetido

Pero esa comodidad suele dejar demasiado poder en manos del cliente.

---

## Idea clave

Mass assignment ocurre cuando el backend permite que el cliente setee más campos de los que realmente debería controlar.

En resumen:

> El problema no es solo que el cliente mande muchos datos.  
> El problema es que el backend los acepta y los transforma en estado interno sin separar bien qué campos pertenecen a la intención externa y cuáles pertenecen a la verdad del sistema.

---

## Qué es mass assignment

Mass assignment aparece cuando un framework toma varios campos de un request y los asigna automáticamente a un objeto del backend sin suficiente control fino.

En una app Spring MVC esto suele pasar cuando:

- se bindea un `@RequestBody` demasiado amplio
- se usa una entidad JPA como input
- se usan DTOs genéricos con demasiados campos
- se hace update copiando “todo lo que venga”
- se mezclan operaciones muy distintas dentro del mismo contrato

El resultado es que el cliente puede intentar modificar campos que:

- no le corresponden
- no deberían venir por request
- necesitan otra autorización
- deberían decidirse en backend
- pertenecen a lógica interna o administrativa

---

## Qué hace especialmente peligroso al mass assignment

Hace peligroso algo muy simple:

- el cliente puede probar campos que la UI no expone
- el backend puede aceptarlos igual
- el sistema cambia más de lo que el caso de uso permitía

Y eso puede afectar cosas como:

- `role`
- `enabled`
- `ownerId`
- `status`
- `price`
- `total`
- `approved`
- `visibility`
- `deleted`
- `internalNotes`
- `featured`
- `moderationState`

No hace falta que todos sean explotables a la vez.
Alcanza con que uno importante quede abierto.

---

## Cómo suele verse en Spring

### Ejemplo riesgoso

```java
@PostMapping("/users")
public User create(@RequestBody User user) {
    return userRepository.save(user);
}
```

Si `User` tiene campos como:

```java
@Entity
public class User {

    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private String email;
    private String passwordHash;
    private String role;
    private Boolean enabled;
}
```

el cliente podría intentar mandar algo como:

```json
{
  "name": "Ana",
  "email": "ana@mail.com",
  "passwordHash": "hash-que-no-deberia-controlar",
  "role": "ADMIN",
  "enabled": true
}
```

Aunque la UI jamás mande eso, el backend podría aceptarlo si el binding y la persistencia están demasiado abiertos.

Eso es mass assignment.

---

## Error mental clásico

Muchas apps caen en ideas como:

- “la UI no muestra ese campo”
- “el formulario no lo tiene”
- “el frontend nunca mandaría eso”
- “como el payload normal no lo incluye, no pasa nada”

Eso no alcanza.

Desde el backend, el request podría venir:

- armado a mano
- interceptado y modificado
- fabricado con Postman
- automatizado con un script
- construido desde otra app
- combinado con campos extra

Por eso el backend no debería depender de lo que la UI decidió mostrar o no mostrar.

---

## Dónde aparece más seguido

El mass assignment suele aparecer sobre todo en estos escenarios:

- creación de usuarios
- updates de perfil
- updates genéricos de recursos
- paneles admin mal diseñados
- formularios de backoffice
- entidades JPA usadas como request body
- DTOs universales para create/update/admin
- endpoints `PATCH` demasiado amplios
- modelos con muchos flags internos

---

## Ejemplo típico de update peligroso

```java
@PatchMapping("/users/{id}")
public UserResponse update(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
    return userService.update(id, request);
}
```

Y luego:

```java
public class UpdateUserRequest {
    private String name;
    private String email;
    private String role;
    private Boolean enabled;
    private Long ownerId;
}
```

## ¿Qué está mal?

Ese DTO mezcla demasiadas responsabilidades.

El mismo request deja abierta la puerta a:

- cambiar nombre
- cambiar email
- cambiar rol
- habilitar o deshabilitar
- cambiar ownership

Eso casi siempre es demasiado poder para un único contrato.

Aunque después pongas algunos `if`, el diseño sigue siendo riesgoso.

---

## Mass assignment no es solo “usar entidades”

Usar entidades directas lo vuelve más probable, pero el problema no desaparece automáticamente por usar DTOs.

### También puede haber mass assignment con DTOs

Si hacés esto:

```java
public class UpdateProductRequest {
    private String title;
    private BigDecimal price;
    private Boolean approved;
    private Boolean featured;
    private Long ownerId;
}
```

seguís teniendo un contrato demasiado amplio.

Entonces, el problema real no es solo “entidad vs DTO”.

También importa:

- qué campos tiene el DTO
- qué operación representa
- qué actor lo usa
- qué parte del sistema debería decidir cada campo

---

## Cómo detectar un DTO sospechoso

Un DTO de entrada empieza a hacer ruido cuando:

- tiene muchos campos heterogéneos
- mezcla datos visibles con campos internos
- mezcla perfil con privilegios
- mezcla datos del negocio con flags administrativos
- incluye `status`, `role`, `ownerId`, `enabled`, `approved`, etc.
- sirve tanto para create como para update como para admin
- parece un “reflejo” de la entidad en vez de un contrato específico

### Señal útil

Si al leer el DTO pensás:

- “esto sirve para demasiadas cosas”

entonces probablemente sea un mal DTO para seguridad.

---

## Ejemplo concreto de abuso

Supongamos este DTO:

```java
public class UpdateOrderRequest {
    private String shippingAddress;
    private String status;
    private BigDecimal total;
    private Boolean refunded;
}
```

Y este endpoint:

```java
@PatchMapping("/orders/{id}")
public OrderResponse update(@PathVariable Long id, @RequestBody UpdateOrderRequest request) {
    return orderService.update(id, request);
}
```

Un cliente podría intentar:

- cambiar la dirección
- marcar la orden como reembolsada
- alterar el total
- forzar un estado inválido

Todo dentro del mismo contrato.

Eso vuelve difusa la autorización y vuelve demasiado cómodo el abuso.

---

## Por qué el mass assignment rompe mejor la autorización

Cuando un DTO o entidad dejan cambiar muchas cosas a la vez, la autorización se vuelve más difícil de razonar.

Porque ya no es una sola pregunta.

Pasa a ser algo así:

- ¿puede cambiar el nombre?
- ¿puede cambiar el email?
- ¿puede cambiar el role?
- ¿puede cambiar el estado?
- ¿puede cambiar ownership?
- ¿puede cambiar flags internos?
- ¿puede cambiar montos?

Si todo eso viaja junto, el backend tiene que filtrar demasiado fino dentro de un contrato ya mal planteado.

Mucho más sano es diseñar contratos separados por intención.

---

## Cómo prevenir mass assignment

## 1. No bindear entidades directo

Este es el primer paso más claro.

En vez de:

```java
@PostMapping("/users")
public User create(@RequestBody User user) {
    return userRepository.save(user);
}
```

usar:

```java
@PostMapping("/users")
public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
    return userService.create(request);
}
```

---

## 2. Diseñar DTOs pequeños y específicos

En vez de un DTO gigante:

```java
public class UpdateUserRequest {
    private String name;
    private String email;
    private String role;
    private Boolean enabled;
    private Long ownerId;
}
```

hacer varios contratos:

```java
public class UpdateProfileRequest {
    @NotBlank
    @Size(max = 100)
    private String name;
}
```

```java
public class ChangeEmailRequest {
    @NotBlank
    @Email
    private String email;
}
```

```java
public class UpdateUserRoleRequest {
    @NotBlank
    private String role;
}
```

Cada uno obliga a separar:

- permisos
- reglas
- contexto
- auditoría

---

## 3. Hacer mapping explícito

En vez de copiar “todo lo que venga”, conviene mapear de forma deliberada.

### Ejemplo

```java
public UserResponse updateProfile(String username, UpdateProfileRequest request) {
    User user = userRepository.findByEmail(username).orElseThrow();

    user.setName(request.getName());

    userRepository.save(user);
    return userMapper.toResponse(user);
}
```

Acá el backend decide exactamente qué campo se actualiza.

Eso baja muchísimo el riesgo.

---

## 4. Exponer operaciones específicas

Muchas veces el mass assignment aparece porque el endpoint es demasiado genérico.

### Más riesgoso

```java
@PatchMapping("/orders/{id}")
public OrderResponse update(@PathVariable Long id, @RequestBody UpdateOrderRequest request) {
    return orderService.update(id, request);
}
```

### Más sano

Separar operaciones como:

- `/cancel`
- `/refund`
- `/change-shipping-address`
- `/approve`
- `/publish`

Eso hace que cada endpoint tenga:

- menos campos
- menos ambigüedad
- mejor autorización
- mejor auditoría
- menos espacio para abuso

---

## 5. No aceptar campos que el backend debería decidir

Regla útil:

si el backend es quien realmente debe decidir un valor, ese valor no debería venir del cliente como si fuera verdad.

Ejemplos clásicos:

- `role`
- `enabled`
- `ownerId`
- `status`
- `price`
- `total`
- `approved`
- `visibility`
- `deleted`

El cliente puede, a lo sumo, pedir una acción.
El backend decide el resultado.

---

## Ejemplo completo: diseño inseguro vs diseño sano

## Diseño inseguro

```java
public class UpdateProductRequest {
    private String title;
    private BigDecimal price;
    private Boolean approved;
    private Boolean featured;
}
```

```java
@PatchMapping("/products/{id}")
public ProductResponse update(@PathVariable Long id, @RequestBody UpdateProductRequest request) {
    return productService.update(id, request);
}
```

## Problema

Un mismo request mezcla:

- edición común
- precio
- moderación
- visibilidad especial

Eso es demasiado.

## Diseño más sano

```java
public class UpdateProductBasicInfoRequest {
    @NotBlank
    @Size(max = 120)
    private String title;
}
```

```java
public class UpdateProductPriceRequest {
    @NotNull
    @Positive
    private BigDecimal price;
}
```

```java
public class ApproveProductRequest {
    @NotBlank
    private String reason;
}
```

Y cada operación puede tener:

- actor distinto
- validación distinta
- autorización distinta
- auditoría distinta

---

## Señales de que una codebase tiene riesgo de mass assignment

Estas señales suelen aparecer rápido:

- `@RequestBody Entity`
- DTOs enormes con muchos flags
- create/update/admin usando el mismo contrato
- `PATCH` genéricos sobre recursos sensibles
- services que copian muchos campos desde request a entidad
- campos internos aceptados “porque total la UI no los muestra”
- requests con `role`, `status`, `ownerId`, `enabled`, `total`
- poca separación entre perfil, permisos y estados
- muchos campos opcionales sin criterio claro

---

## Cómo revisar si el problema ya existe

Cuando mires un controller o DTO, preguntate:

- ¿qué campos del request nunca deberían venir del cliente?
- ¿qué campos se copian directo a entidad?
- ¿qué parte del objeto interno quedó demasiado expuesta?
- ¿qué campos mezclan operación común con operación administrativa?
- ¿qué DTO parece un reflejo de la entidad?
- ¿qué operación sería más sana si se separara en dos o tres contratos distintos?

---

## Qué gana el backend si evitás mass assignment

Cuando evitás este problema, el backend gana:

- menos confianza ingenua
- contratos más claros
- menos superficie del request
- mejor autorización
- mejor trazabilidad
- menos campos internos expuestos
- mejor separación entre operaciones
- menos chance de que una UI limitada esconda un backend demasiado abierto

---

## Checklist práctico

Cuando revises una app Spring, preguntate:

- ¿hay entidades JPA entrando por `@RequestBody`?
- ¿hay DTOs demasiado amplios?
- ¿un mismo DTO mezcla datos comunes con campos internos?
- ¿el cliente puede mandar `role`, `enabled`, `ownerId`, `status`, `total` o similares?
- ¿los updates copian muchos campos del request a la entidad?
- ¿debería haber operaciones más específicas en vez de un `PATCH` genérico?
- ¿la UI está ocultando campos que el backend igual aceptaría?
- ¿hay mapping explícito o se persiste casi directo lo recibido?
- ¿esta operación está diseñada por intención o por comodidad?
- ¿si un request fabricado agrega campos extra, el sistema podría aceptarlos?

---

## Mini ejercicio de reflexión

Elegí tres DTOs de entrada de tu backend y respondé:

1. ¿Qué campos tiene?
2. ¿Cuáles son realmente necesarios para esa operación?
3. ¿Cuáles no debería controlar nunca el cliente?
4. ¿Qué campos mezclan negocio común con privilegios o estados internos?
5. ¿El DTO podría separarse en contratos más chicos?
6. ¿Hay un riesgo de mass assignment si alguien fabrica el request a mano?

Si varias respuestas te muestran demasiados campos o demasiada mezcla, el contrato probablemente esté mal planteado.

---

## Resumen

Mass assignment en Spring MVC aparece cuando el backend acepta y asigna más campos de los que el cliente realmente debería controlar.

Eso suele pasar por:

- entidades directas
- DTOs demasiado amplios
- endpoints demasiado genéricos
- mapping implícito o demasiado cómodo
- confianza excesiva en lo que la UI “normalmente” manda

En resumen:

> La mejor defensa contra mass assignment no es solo filtrar mejor.  
> Es diseñar contratos más chicos, operaciones más específicas y un backend que decida más cosas por sí mismo.

---

## Próximo tema

**Errores comunes con `@RequestBody`**
