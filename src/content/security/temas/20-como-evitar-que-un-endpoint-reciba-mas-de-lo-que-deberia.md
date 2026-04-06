---
title: "Cómo evitar que un endpoint reciba más de lo que debería"
description: "Cómo diseñar endpoints en una aplicación Java con Spring Boot para que acepten solo la información realmente necesaria. Qué riesgos aparecen cuando el request recibe demasiado y cómo reducir superficie con contratos más chicos, operaciones específicas y mapping explícito."
order: 20
module: "Requests y validación"
level: "base"
draft: false
---

# Cómo evitar que un endpoint reciba más de lo que debería

## Objetivo del tema

Entender cómo diseñar un endpoint en una aplicación Java + Spring Boot para que reciba **solo lo que realmente necesita** y no más.

Este tema es importante porque muchísimos problemas de seguridad y de diseño aparecen cuando un endpoint acepta payloads, parámetros o combinaciones de datos más amplios de lo necesario.

Eso suele abrir la puerta a cosas como:

- mass assignment
- contratos ambiguos
- lógica de negocio difusa
- autorizaciones más difíciles de razonar
- campos internos manipulables
- cambios de estado mal controlados
- exceso de poder del cliente
- mayor superficie de ataque

La idea central es muy simple:

> cuanto más recibe un endpoint, más cosas tiene que decidir, filtrar, validar y defender.

---

## Idea clave

Un endpoint sano no debería preguntar al cliente por cosas que el backend ya debería saber o decidir por sí mismo.

En resumen:

> Un buen endpoint recibe una intención acotada, no una representación inflada de todo el objeto interno.

Eso significa que el request debería traer solo lo necesario para el caso de uso concreto.

No:

- todo el recurso
- todos los campos editables “por si acaso”
- datos internos mezclados con datos de negocio
- flags administrativos
- ownership
- estados arbitrarios
- montos finales que el backend debería recalcular

---

## Qué significa que un endpoint “recibe más de lo que debería”

Significa que el contrato HTTP permite que el cliente mande datos que:

- no hacen falta para esa operación
- el backend debería decidir solo
- pertenecen a otra operación distinta
- exigen otra autorización
- mezclan varias intenciones en un mismo request
- amplían innecesariamente el poder del actor

### Ejemplo clásico

```java
@PatchMapping("/users/{id}")
public UserResponse update(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
    return userService.update(id, request);
}
```

Con un DTO así:

```java
public class UpdateUserRequest {
    private String name;
    private String email;
    private String role;
    private Boolean enabled;
    private Long ownerId;
    private String status;
}
```

Ese endpoint está recibiendo demasiado.

Porque mezcla:

- perfil
- identidad
- privilegios
- ownership
- estado

Todo en un mismo contrato.

---

## Por qué esto es tan problemático

Porque cuando un endpoint recibe demasiado, el backend queda obligado a resolver demasiadas preguntas juntas:

- ¿qué campo sí corresponde?
- ¿qué campo no?
- ¿qué actor puede tocar cuál?
- ¿qué valor debería ignorarse?
- ¿qué parte es solo de admin?
- ¿qué parte debería venir del contexto autenticado?
- ¿qué parte es de create?
- ¿qué parte es de update?
- ¿qué parte requiere otra operación o auditoría?

Y cuanto más preguntas mezclás dentro del mismo endpoint, más fácil es olvidarte alguna.

---

## Error mental clásico

Muchos equipos piensan así:

- “aceptemos todo y después vemos qué usamos”
- “la UI no manda esos campos”
- “si viene algo raro lo ignoramos”
- “es más flexible”
- “nos ahorramos hacer varios DTOs”
- “después el service filtra”

Ese enfoque suele dejar un backend demasiado abierto.

La flexibilidad sin fronteras claras suele ser comodidad para el equipo y poder extra para el actor equivocado.

---

## Caso 1: recibir campos que el backend debería decidir

Supongamos este request:

```json
{
  "productId": 12,
  "quantity": 2,
  "userId": 55,
  "total": 100,
  "status": "PAID"
}
```

Y este DTO:

```java
public class CreateOrderRequest {
    private Long productId;
    private Integer quantity;
    private Long userId;
    private BigDecimal total;
    private String status;
}
```

## ¿Qué campos sobran?

- `userId`
- `total`
- `status`

Porque en un diseño más sano:

- el usuario sale del contexto autenticado
- el total lo calcula el backend
- el estado inicial lo decide el backend

El cliente solo debería proponer algo como:

- qué producto quiere
- cuánta cantidad

Eso es una intención acotada.

---

## Caso 2: mezclar actualización básica con operación administrativa

### Ejemplo riesgoso

```java
public class UpdateProductRequest {
    private String title;
    private String description;
    private BigDecimal price;
    private Boolean approved;
    private Boolean featured;
}
```

Ese request mezcla:

- edición común
- precio
- moderación
- visibilidad especial

Aunque técnicamente puedas validarlo, el diseño ya es malo porque mete demasiadas cosas distintas bajo el mismo endpoint.

Más sano sería separar:

- `UpdateProductBasicInfoRequest`
- `UpdateProductPriceRequest`
- `ApproveProductRequest`
- `FeatureProductRequest`

Cada una con su propio:

- actor
- validación
- autorización
- auditoría
- contexto

---

## Caso 3: pedir `userId` en operaciones del usuario actual

Esto es muy frecuente.

### Ejemplo riesgoso

```java
@GetMapping("/orders")
public List<OrderResponse> myOrders(@RequestParam Long userId) {
    return orderService.findByUser(userId);
}
```

Si el caso de uso es “mis órdenes”, ese endpoint ya está recibiendo de más.

Porque el backend no necesita que el cliente le diga quién es.

Eso debería salir del contexto autenticado.

Versión mejor:

```java
@GetMapping("/orders/me")
public List<OrderResponse> myOrders(Authentication authentication) {
    return orderService.findByCurrentUser(authentication.getName());
}
```

Ahí el endpoint recibe menos, y justamente por eso queda mejor protegido.

---

## Caso 4: recibir estados arbitrarios

### Ejemplo riesgoso

```java
public class UpdateOrderRequest {
    private String status;
}
```

Y luego:

```java
@PatchMapping("/orders/{id}")
public OrderResponse update(@PathVariable Long id, @RequestBody UpdateOrderRequest request) {
    return orderService.update(id, request);
}
```

Esto suele ser demasiado amplio porque permite que el cliente proponga un cambio interno importante del sistema.

Si querés menos superficie y menos ambigüedad, suele ser mejor exponer operaciones concretas:

- `/cancel`
- `/pay`
- `/ship`
- `/refund`

En vez de dejar que el cliente proponga cualquier estado.

---

## Caso 5: endpoints de búsqueda con demasiados parámetros

No solo el body puede recibir de más.
También los query params.

### Ejemplo riesgoso

```java
@GetMapping("/orders")
public Page<OrderResponse> search(
        @RequestParam(required = false) Long userId,
        @RequestParam(required = false) String email,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Boolean includeDeleted,
        @RequestParam(required = false) String sort,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
    return orderService.search(userId, email, status, includeDeleted, sort, page, size);
}
```

Esto puede estar recibiendo demasiado si:

- mezcla filtros para usuarios comunes y backoffice
- deja pasar parámetros internos
- acepta `userId` cuando no corresponde
- acepta `includeDeleted`
- acepta `sort` arbitrario
- deja demasiada libertad en combinaciones

A veces un endpoint recibe demasiado no por el body, sino por la suma de parámetros sueltos.

---

## Qué gana un endpoint cuando recibe menos

Cuando un endpoint está más acotado, gana varias cosas:

- menos superficie de ataque
- menos ambigüedad
- autorización más clara
- menos mass assignment
- menos confianza en el cliente
- menos mezcla de responsabilidades
- menos ramas raras de validación
- mejor trazabilidad
- mejor mantenibilidad

No es solo una preferencia de estilo.
Es una mejora real de seguridad y diseño.

---

## Cómo diseñar endpoints más chicos y más seguros

## 1. Separar por intención

En vez de un endpoint “universal”, conviene tener endpoints por acción real.

### Más riesgoso

- un `PATCH` genérico sobre todo el recurso

### Más sano

- actualizar perfil
- cambiar email
- cancelar orden
- aprobar recurso
- cambiar precio
- bloquear usuario

Cada endpoint debería reflejar mejor la intención real.

---

## 2. Diseñar DTOs mínimos

Un DTO debería tener solo los campos necesarios para ese caso de uso.

### Ejemplo sano

```java
public class UpdateProfileRequest {

    @NotBlank
    @Size(max = 100)
    private String name;
}
```

Esto es mucho mejor que un `UpdateUserRequest` gigante con:

- `role`
- `enabled`
- `ownerId`
- `status`

---

## 3. Sacar del request lo que sale del contexto

No le pidas al cliente cosas que el backend ya sabe.

Por ejemplo:

- identidad del usuario actual
- tenant actual
- rol efectivo
- estado real del recurso
- montos calculables
- ownership real

Si el backend puede resolverlo desde:

- autenticación
- base
- configuración
- lógica de negocio

entonces el request no debería cargar con eso.

---

## 4. No mezclar campos “comunes” con campos “sensibles”

Si un campo:

- cambia permisos
- cambia estado
- cambia ownership
- cambia moderación
- cambia dinero
- cambia visibilidad

entonces probablemente no debería viajar junto con campos de edición común.

---

## 5. Mapear explícitamente

Cuando el endpoint recibe poco y el mapping es explícito, el backend decide mejor qué se toca.

### Ejemplo

```java
public UserResponse updateProfile(String username, UpdateProfileRequest request) {
    User user = userRepository.findByEmail(username).orElseThrow();

    user.setName(request.getName());

    userRepository.save(user);

    return userMapper.toResponse(user);
}
```

Esto es mucho más claro que copiar “todo lo que venga” desde el request.

---

## Ejemplo completo: diseño demasiado ancho vs diseño más sano

## Diseño demasiado ancho

```java
public class UpdateUserRequest {
    private String name;
    private String email;
    private String role;
    private Boolean enabled;
    private Long ownerId;
}
```

```java
@PatchMapping("/users/{id}")
public UserResponse update(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
    return userService.update(id, request);
}
```

## Problemas

- mezcla demasiadas intenciones
- mezcla campos sensibles con campos comunes
- vuelve más difícil la autorización
- vuelve más probable el mass assignment
- obliga al service a filtrar demasiado

## Diseño más sano

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

Endpoints:

- `/users/me/profile`
- `/users/me/email`
- `/admin/users/{id}/role`

Cada uno recibe menos y, justamente por eso, se vuelve más claro y más defendible.

---

## Qué señales indican que un endpoint recibe demasiado

Estas señales suelen hacer ruido rápido:

- DTOs gigantes
- `PATCH` genéricos
- muchos campos opcionales sin criterio claro
- mezcla de campos comunes y administrativos
- `userId`, `ownerId`, `role`, `status`, `enabled`, `approved` dentro del mismo request
- mismo contrato para create/update/admin
- filtros con demasiados parámetros
- requests que duplican datos que el backend ya conoce
- operaciones delicadas resueltas con un objeto demasiado libre

---

## Qué revisar en controller

Cuando leas un controller, preguntate:

- ¿este endpoint recibe solo lo necesario?
- ¿hay campos que el backend ya podría inferir?
- ¿hay campos que pertenecen a otra operación?
- ¿hay una acción concreta o un contrato demasiado genérico?
- ¿el request está orientado al caso de uso o refleja demasiado el modelo interno?

---

## Qué revisar en service

Cuando leas un service, preguntate:

- ¿está filtrando demasiadas cosas que el endpoint nunca debió aceptar?
- ¿está corrigiendo un contrato mal diseñado?
- ¿está ignorando campos que no deberían haber llegado?
- ¿la lógica se vuelve confusa porque el request mezcla demasiadas intenciones?

Si la respuesta es sí, probablemente el problema ya esté en el diseño del endpoint.

---

## Relación con seguridad

Recibir demasiado complica la seguridad porque:

- aumenta superficie
- aumenta combinaciones posibles
- aumenta el poder del cliente
- aumenta la dificultad de autorización
- aumenta el riesgo de olvidar un control
- vuelve más probable que una UI limitada esconda un backend demasiado abierto

En backend real, muchas veces el problema no es solo “qué hace el endpoint”, sino “cuánto le deja proponer al cliente”.

---

## Qué relación tiene con mantenibilidad

También mejora muchísimo el mantenimiento.

Porque un endpoint más acotado suele ser:

- más fácil de entender
- más fácil de testear
- más fácil de autorizar
- más fácil de auditar
- más fácil de cambiar sin romper otras operaciones

Diseño defensivo y diseño mantenible acá suelen empujar en la misma dirección.

---

## Checklist práctico

Cuando revises un endpoint Spring, preguntate:

- ¿qué datos recibe?
- ¿todos esos datos son realmente necesarios?
- ¿hay algo que el backend ya podría saber sin preguntarlo?
- ¿hay algo que el cliente no debería controlar nunca?
- ¿el endpoint mezcla varias intenciones?
- ¿debería dividirse en operaciones más específicas?
- ¿el DTO está orientado a un caso de uso o refleja demasiado el recurso interno?
- ¿qué parte del request hace más difícil la autorización?
- ¿qué campo podría usarse para abuso o confusión?
- ¿qué pasaría si un actor fabricara el request a mano y agregara cosas que la UI nunca manda?

---

## Mini ejercicio de reflexión

Tomá tres endpoints de tu backend y para cada uno respondé:

1. ¿Qué campos recibe?
2. ¿Cuáles son realmente indispensables?
3. ¿Cuáles podría inferir el backend?
4. ¿Cuáles no debería controlar nunca el cliente?
5. ¿El endpoint representa una intención concreta o una edición demasiado abierta?
6. ¿Podrías dividirlo en dos o tres contratos más chicos y más claros?

Ese ejercicio suele mostrar muy rápido dónde el backend todavía está recibiendo más de lo que necesita.

---

## Resumen

Un endpoint recibe más de lo que debería cuando acepta datos que:

- no hacen falta
- pertenecen a otra operación
- el backend debería decidir por sí mismo
- mezclan varias intenciones
- complican autorización y validación
- amplían demasiado la superficie

En resumen:

> Un backend más sano no le pregunta al cliente todo lo que podría preguntarle.  
> Le pregunta solo lo mínimo necesario para entender la intención y decidir el resto con criterio propio.

---

## Próximo tema

**Arquitectura de autenticación en Spring Security**
