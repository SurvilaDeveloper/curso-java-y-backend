---
title: "DTOs seguros para entrada y salida"
description: "Cómo diseñar DTOs seguros en una aplicación Java con Spring Boot para controlar mejor qué entra y qué sale del backend. Por qué no conviene exponer entidades directamente y cómo usar DTOs para reducir superficie, proteger datos y separar mejor responsabilidades."
order: 13
module: "Requests y validación"
level: "base"
draft: false
---

# DTOs seguros para entrada y salida

## Objetivo del tema

Aprender a diseñar **DTOs seguros** en una aplicación Java + Spring Boot para controlar mejor:

- qué datos acepta el backend
- qué datos devuelve el backend
- qué campos quedan bajo control del cliente
- qué información interna nunca debería exponerse
- cómo separar HTTP, negocio y persistencia con menos ingenuidad

Este tema es muy importante porque muchísimos problemas de seguridad backend aparecen cuando la aplicación usa mal sus objetos y termina mezclando:

- request
- entidad
- lógica interna
- response

como si fueran lo mismo.

No lo son.

---

## Idea clave

Un DTO no es solo “un objeto para transportar datos”.

Bien diseñado, también es una **frontera de seguridad**.

En resumen:

> Los DTOs ayudan a decidir qué parte del mundo externo puede entrar al sistema y qué parte del mundo interno puede salir de él.

Eso significa dos cosas distintas:

- **DTO de entrada**: controla lo que el cliente puede proponer
- **DTO de salida**: controla lo que el backend elige mostrar

Ambas cosas importan muchísimo.

---

## Qué es un DTO

DTO significa **Data Transfer Object**.

En una app Spring suele usarse para representar datos que viajan entre capas o, más específicamente en una API, entre:

- cliente y controller
- controller y service
- backend y response HTTP

### Importante

Un DTO no debería confundirse con:

- entidad JPA
- modelo de dominio interno
- objeto persistente
- recurso completo de base

El DTO debería representar un **contrato explícito** para un caso de uso concreto.

---

## Error común: usar entidades como request y como response

Este es uno de los errores más comunes en backends Spring.

Ejemplo riesgoso:

```java
@PostMapping("/users")
public User create(@RequestBody User user) {
    return userRepository.save(user);
}
```

Y también:

```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    return userRepository.findById(id).orElseThrow();
}
```

## ¿Qué problemas hay acá?

- el cliente puede intentar setear campos internos
- la entidad expone estructura de persistencia
- podés devolver datos sensibles sin querer
- mezclás contrato HTTP con modelo interno
- la API queda atada a la base
- se vuelve más fácil el mass assignment
- cuesta más separar permisos, ownership y campos editables

---

## Qué resuelven bien los DTOs

Los DTOs bien diseñados ayudan a:

- reducir superficie de ataque
- evitar binds peligrosos
- separar mejor responsabilidades
- validar entrada con más claridad
- no exponer datos internos
- no devolver más información de la necesaria
- expresar mejor operaciones específicas
- evitar que el cliente controle campos que no le corresponden

---

## DTOs de entrada

Un DTO de entrada debería responder:

- ¿qué parte de esta operación puede proponer el cliente?
- ¿qué campos corresponden a este actor?
- ¿qué información tiene sentido recibir por HTTP?
- ¿qué parte debería decidir el backend y no el cliente?

### Ejemplo sano

```java
public class CreateUserRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;
}
```

Esto está mucho mejor que aceptar una entidad `User` completa.

---

## DTOs de salida

Un DTO de salida debería responder:

- ¿qué necesita ver realmente este actor?
- ¿qué campos no conviene exponer?
- ¿qué parte del modelo interno no debería salir nunca?
- ¿qué información puede ayudar demasiado a un actor equivocado?

### Ejemplo sano

```java
public class UserResponse {
    private Long id;
    private String name;
    private String email;
}
```

### Qué no expone

- password hash
- roles internos completos
- flags delicados
- timestamps internos innecesarios
- ownership interno
- metadatos sensibles
- notas internas
- tokens o secretos

---

## Diferencia entre DTO de entrada y de salida

No conviene reutilizar un mismo DTO para todo.

### Mala idea

```java
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    private Boolean enabled;
}
```

Y usarlo para:

- crear
- actualizar
- devolver
- filtrar
- administrar

Eso suele mezclar demasiado.

### Mejor enfoque

Separar por intención:

- `CreateUserRequest`
- `UpdateProfileRequest`
- `UpdateUserRoleRequest`
- `UserResponse`
- `AdminUserResponse`

Cada uno expresa un contrato distinto y reduce ambigüedad.

---

## Qué campos no deberían estar en DTOs de entrada salvo casos muy justificados

En general, deberían prender alarmas campos como:

- `id`
- `ownerId`
- `userId`
- `role`
- `enabled`
- `deleted`
- `approved`
- `visibility`
- `createdAt`
- `updatedAt`
- `status`
- `total`
- `price`
- `internalNotes`
- `moderationState`

No significa que nunca puedan aparecer.

Significa que, si aparecen, deberías poder justificar muy bien:

- por qué el cliente debería controlarlos
- en qué flujo
- con qué autorización
- con qué validación
- con qué auditoría

---

## Ejemplo: DTO peligroso de entrada

```java
public class UpdateUserRequest {
    private String name;
    private String email;
    private String role;
    private Boolean enabled;
    private Long ownerId;
}
```

## Problemas

- mezcla perfil con privilegios
- mezcla datos del usuario con estado interno
- deja abierta la puerta a mass assignment
- obliga al backend a desconfiar de demasiados campos
- hace más probable que el controller o service olviden filtrar algo

### Mejor diseño

Separar en varios contratos:

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

Con eso:

- cada operación es más clara
- cada autorización puede ser distinta
- cada validación es más precisa
- el backend reduce el poder del cliente

---

## DTOs y mass assignment

Uno de los grandes beneficios de los DTOs es cortar el problema de **mass assignment**.

Si recibís una entidad completa o un objeto demasiado abierto, el cliente puede intentar setear:

- campos internos
- banderas de administración
- estados
- ownership
- flags de publicación
- permisos

En cambio, si el DTO solo contiene lo que corresponde al caso de uso, el espacio de abuso baja muchísimo.

### Ejemplo

En vez de esto:

```java
public class Product {
    private Long id;
    private String title;
    private BigDecimal price;
    private Boolean approved;
    private Long ownerId;
    private Boolean featured;
}
```

y aceptar eso directo en un `@RequestBody`, es mucho más sano hacer:

```java
public class CreateProductRequest {

    @NotBlank
    @Size(max = 120)
    private String title;

    @NotNull
    @Positive
    private BigDecimal price;
}
```

---

## DTOs y validación

Los DTOs de entrada funcionan especialmente bien junto con Bean Validation.

### Ejemplo

```java
public class CreateProductRequest {

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 120, message = "El título no puede superar los 120 caracteres")
    private String title;

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor que cero")
    private BigDecimal price;
}
```

Y en controller:

```java
@PostMapping("/products")
public ProductResponse create(@Valid @RequestBody CreateProductRequest request) {
    return productService.create(request);
}
```

Eso ayuda a que el request llegue mejor formado, sin meter la entidad JPA en el medio.

---

## DTOs y autorización

Los DTOs no resuelven autorización por sí solos, pero ayudan a no mezclarla peor.

Por ejemplo:

- si un DTO no tiene `role`, el cliente ya no puede proponerlo
- si un DTO no tiene `ownerId`, el cliente ya no puede reasignarlo
- si un DTO no tiene `status`, el cambio de estado debe pasar por otra operación

Eso obliga a que la autorización sea más explícita y menos difusa.

---

## DTOs y operaciones específicas

Una API suele ser más segura cuando sus DTOs representan **intenciones concretas** y no cambios genéricos gigantes.

### Más riesgoso

```java
@PatchMapping("/orders/{id}")
public OrderResponse update(@PathVariable Long id, @RequestBody UpdateOrderRequest request) {
    return orderService.update(id, request);
}
```

Con un DTO abierto tipo:

```java
public class UpdateOrderRequest {
    private String status;
    private BigDecimal total;
    private Long userId;
    private String note;
}
```

### Más sano

Tener operaciones específicas:

- `CancelOrderRequest`
- `RefundOrderRequest`
- `UpdateShippingAddressRequest`

O incluso endpoints sin body cuando no hace falta uno:

```java
@PostMapping("/orders/{id}/cancel")
public ResponseEntity<Void> cancel(@PathVariable Long id, Authentication authentication) {
    orderService.cancel(id, authentication.getName());
    return ResponseEntity.noContent().build();
}
```

Eso reduce mucho ambigüedad y riesgo.

---

## DTOs de salida y exposición innecesaria

También hay muchos problemas cuando el backend devuelve demasiado.

### Ejemplo riesgoso

```java
public class User {
    private Long id;
    private String name;
    private String email;
    private String passwordHash;
    private String role;
    private Boolean enabled;
    private String internalNotes;
}
```

Si devolvés esto directo:

- exponés estructura interna
- podés filtrar campos sensibles
- podés dar más contexto del necesario
- podés facilitar abuso o enumeración
- quedás atado a la entidad y a su evolución

### Mejor

```java
public class UserResponse {
    private Long id;
    private String name;
    private String email;
}
```

Y quizá otro distinto para admin:

```java
public class AdminUserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private Boolean enabled;
}
```

No todo actor necesita ver lo mismo.

---

## Un DTO de salida también es una decisión de seguridad

Esto es importante.

No es solo “qué lindo queda el JSON”.

También responde preguntas como:

- ¿qué parte del sistema le estoy mostrando?
- ¿qué puede inferir el actor?
- ¿qué campos podrían combinarse con otros endpoints para aprender demasiado?
- ¿estoy revelando flags internos?
- ¿estoy revelando estructura operativa?
- ¿estoy devolviendo cosas que después me van a costar auditar o contener?

---

## DTOs según actor

A veces conviene tener distintos DTOs de salida según actor.

Ejemplos:

- `OrderResponse`
- `AdminOrderResponse`
- `SupportOrderResponse`

No porque quieras complicar todo, sino porque:

- el usuario común no debería ver lo mismo que soporte
- soporte no siempre debería ver lo mismo que admin
- el backend debe decidir la visibilidad de forma consciente

Esto reduce mucho la exposición accidental.

---

## Mapping: dónde convertir entre entidad y DTO

En una app Spring, una decisión sana suele ser:

- controller recibe DTO de entrada
- service trabaja con lógica del dominio
- mapper convierte entre entidad y DTO de salida
- controller devuelve DTO de salida

### Ejemplo

```java
@PostMapping("/users")
public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
    return userService.create(request);
}
```

Y en service:

```java
public UserResponse create(CreateUserRequest request) {
    User user = new User();
    user.setName(request.getName());
    user.setEmail(request.getEmail());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

    userRepository.save(user);

    return userMapper.toResponse(user);
}
```

Esto hace mucho más clara la frontera entre:

- input externo
- modelo interno
- output externo

---

## Señales de que una codebase usa DTOs de forma insegura

Estas señales suelen hacer ruido rápido:

- entidades JPA en `@RequestBody`
- entidades JPA en responses
- un mismo DTO para crear, actualizar y responder
- DTOs gigantes con muchos campos internos
- campos como `role`, `ownerId`, `status`, `enabled` en requests generales
- responses que exponen flags internos o información innecesaria
- ausencia total de separación entre user response y admin response
- controllers que persisten casi directo lo que reciben

---

## Qué decisiones mejoran mucho el diseño

Estas decisiones suelen elevar bastante la seguridad y claridad del backend:

- DTOs chicos
- DTOs por caso de uso
- separación entre entrada y salida
- separación entre actor común y actor administrativo
- mapping explícito
- no exponer entidades
- no aceptar campos que el cliente no debería controlar
- operaciones específicas en vez de DTOs universales de update

---

## Ejemplo completo

### DTO de entrada

```java
public class UpdateProfileRequest {

    @NotBlank
    @Size(max = 100)
    private String name;
}
```

### Controller

```java
@PatchMapping("/users/me/profile")
public UserResponse updateProfile(
        @Valid @RequestBody UpdateProfileRequest request,
        Authentication authentication) {
    return userService.updateProfile(authentication.getName(), request);
}
```

### Service

```java
public UserResponse updateProfile(String username, UpdateProfileRequest request) {
    User user = userRepository.findByEmail(username).orElseThrow();
    user.setName(request.getName());
    userRepository.save(user);
    return userMapper.toResponse(user);
}
```

### DTO de salida

```java
public class UserResponse {
    private Long id;
    private String name;
    private String email;
}
```

Acá hay varias cosas sanas a la vez:

- el cliente no manda `role`
- el cliente no manda `enabled`
- el cliente no manda `ownerId`
- la identidad sale del contexto autenticado
- la response no devuelve datos internos
- el contrato es acotado y claro

---

## Checklist práctico

Cuando revises DTOs en una app Spring, preguntate:

- ¿este DTO representa una intención concreta o mezcla demasiadas cosas?
- ¿estoy aceptando campos que el cliente no debería controlar?
- ¿este DTO de entrada expone estados, roles o ownership?
- ¿estoy devolviendo entidades directamente?
- ¿la response incluye campos internos innecesarios?
- ¿debería haber un DTO distinto para admin o soporte?
- ¿el mapping entre entidad y DTO es explícito?
- ¿estoy usando un DTO universal cuando en realidad necesito varios contratos más chicos?
- ¿este DTO reduce superficie o la amplía?
- ¿este diseño hace más fácil o más difícil el mass assignment?

---

## Mini ejercicio de reflexión

Tomá tres endpoints de tu backend y respondé:

1. ¿Qué DTO de entrada usan?
2. ¿Qué DTO de salida usan?
3. ¿Hay algún campo que el cliente no debería controlar?
4. ¿Hay algún dato que la response devuelve de más?
5. ¿El mismo DTO sirve para demasiadas operaciones?
6. ¿Estás exponiendo entidad o contrato?

Si respondés que sí a varias de esas señales, probablemente tus DTOs todavía estén ayudando poco y filtrando demasiado.

---

## Resumen

Los DTOs bien diseñados ayudan a:

- acotar mejor la entrada
- proteger mejor la salida
- separar mejor capas
- reducir mass assignment
- no exponer datos internos
- expresar mejor operaciones concretas
- mantener más clara la verdad del backend

En resumen:

> Un DTO seguro no es solo un objeto de transporte.  
> Es una frontera explícita entre lo que el cliente puede proponer, lo que el sistema decide y lo que el backend elige mostrar.

---

## Próximo tema

**Qué no bindear nunca directo a entidades**
