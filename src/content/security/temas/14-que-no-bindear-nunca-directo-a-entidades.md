---
title: "Qué no bindear nunca directo a entidades"
description: "Por qué no conviene bindear entidades JPA directamente desde requests HTTP en una app Java con Spring Boot. Qué riesgos aparecen al mezclar input externo con modelo persistente y cómo reemplazar ese enfoque por DTOs y mapeos más seguros."
order: 14
module: "Requests y validación"
level: "base"
draft: false
---

# Qué no bindear nunca directo a entidades

## Objetivo del tema

Entender por qué en una aplicación Java + Spring Boot no conviene bindear entidades JPA directamente desde requests HTTP, y cómo ese hábito abre la puerta a problemas de:

- mass assignment
- exposición de campos internos
- mezcla de capas
- autorizaciones difusas
- estados inválidos
- cambios peligrosos sobre datos persistentes

Este tema es muy importante porque el binding directo a entidades parece cómodo al principio, pero suele dejar un backend demasiado confiado y demasiado expuesto.

---

## Idea clave

Una entidad JPA no es un contrato HTTP.

Una entidad representa, sobre todo:

- persistencia
- relaciones internas
- estado del dominio
- estructura de base
- comportamiento interno del sistema

Un request HTTP, en cambio, representa:

- una intención externa
- parcial
- acotada
- contextual
- dependiente del actor y del caso de uso

En resumen:

> Cuando bindear una entidad directamente desde el cliente, el backend empieza a tratar como si fueran equivalentes dos cosas que no lo son: el modelo interno y el input externo.

---

## Qué significa “bindear directo a entidad”

Significa recibir desde HTTP un objeto que ya es la misma clase que se persiste en base.

### Ejemplo clásico

```java
@PostMapping("/users")
public User create(@RequestBody User user) {
    return userRepository.save(user);
}
```

O también:

```java
@PatchMapping("/products/{id}")
public Product update(@PathVariable Long id, @RequestBody Product product) {
    product.setId(id);
    return productRepository.save(product);
}
```

A simple vista parece práctico:

- menos clases
- menos mapping
- menos código
- menos “ceremonia”

Pero desde seguridad y diseño suele ser una mala idea.

---

## Por qué parece buena idea al principio

Porque da la sensación de que todo fluye rápido:

- el cliente manda JSON
- Spring lo deserializa
- la entidad ya está lista
- el repository guarda
- la response sale fácil

Problema:

esa comodidad normalmente se logra regalando demasiadas cosas al input externo.

---

## Qué problemas crea el binding directo a entidades

## 1. El cliente controla campos que no debería

Si la entidad tiene campos internos, el cliente puede intentar mandarlos.

### Ejemplo

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

Si hacés esto:

```java
@PostMapping("/users")
public User create(@RequestBody User user) {
    return userRepository.save(user);
}
```

el cliente podría intentar mandar cosas como:

```json
{
  "name": "Juan",
  "email": "juan@mail.com",
  "passwordHash": "ya-lo-mando-listo",
  "role": "ADMIN",
  "enabled": true
}
```

Aunque la UI no lo haga, el cliente igual puede intentarlo.

---

## 2. Aparece mass assignment

Cuando Spring bindea un objeto grande desde input externo, cualquier campo accesible que no esté bien controlado puede terminar siendo seteado.

Eso vuelve más probable que el cliente influya sobre:

- roles
- estados
- ownership
- flags internos
- campos de moderación
- timestamps
- visibilidad
- aprobación
- montos
- relaciones

No hace falta que todos los campos sean peligrosos para que el diseño ya sea malo.
Alcanza con que algunos lo sean.

---

## 3. Se mezclan HTTP, dominio y persistencia

La entidad deja de ser una representación del modelo persistente y pasa a ser también:

- request
- response
- objeto de transporte
- contrato público de la API

Eso genera varias tensiones:

- cambios en base rompen contratos externos
- cambios en API obligan a tocar persistencia
- se vuelve más difícil pensar qué campos son internos y cuáles públicos
- se borra la frontera entre input externo y verdad del sistema

---

## 4. Se vuelve difuso qué decide el backend

Si recibís una entidad completa, cuesta más responder:

- ¿qué campos realmente propuso el cliente?
- ¿qué campos decidió el backend?
- ¿qué campos deberían ignorarse?
- ¿qué campos necesitan autorización especial?
- ¿qué campos requieren recalcularse?

Con DTOs eso suele quedar mucho más claro.

---

## 5. Las actualizaciones se vuelven peligrosas

El binding directo es especialmente riesgoso en updates.

### Ejemplo

```java
@PatchMapping("/users/{id}")
public User update(@PathVariable Long id, @RequestBody User user) {
    user.setId(id);
    return userRepository.save(user);
}
```

## ¿Qué puede salir mal?

- el cliente manda `role`
- el cliente manda `enabled`
- el cliente manda `passwordHash`
- el cliente manda campos en null y pisa información válida
- el cliente altera relaciones
- el cliente intenta cambiar ownership
- el cliente cambia flags que jamás debían quedar expuestos

En una API real, este diseño suele ser demasiado abierto.

---

## 6. Se vuelve más fácil exponer datos internos

Si la misma entidad que recibís también la devolvés, podés terminar exponiendo cosas como:

- password hash
- roles internos
- flags de moderación
- notas internas
- estados no visibles
- campos técnicos
- relaciones innecesarias
- detalles de persistencia

Aunque hoy no pase, el diseño ya quedó mal alineado para el futuro.

---

## 7. La entidad empieza a cargarse preocupaciones ajenas

Cuando una entidad pasa a usarse como request, muchas veces termina llena de:

- anotaciones de validación pensadas para HTTP
- defaults pensados para formularios
- restricciones de UX
- compromisos por compatibilidad de API

Eso suele deformar el modelo y mezclar preocupaciones que deberían ir separadas.

---

## Qué cosas no conviene bindear directo a entidades

En general, no conviene bindear directo cosas que:

- tengan `id`
- tengan ownership
- tengan roles
- tengan estados internos
- tengan flags administrativos
- tengan timestamps
- tengan relaciones delicadas
- tengan campos calculados
- tengan secretos o hashes
- tengan visibilidad o moderación
- tengan montos finales o precios críticos

---

## Ejemplo claro: entidad de orden

```java
@Entity
public class Order {

    @Id
    @GeneratedValue
    private Long id;

    private Long userId;
    private BigDecimal total;
    private String status;
    private Boolean refunded;
}
```

Si recibís esto directo desde el cliente, abrís la puerta a que intente mandar:

- `userId`
- `total`
- `status`
- `refunded`

Es decir, casi todo lo sensible.

Eso no es un problema de una línea.
Es un problema del contrato.

---

## Ejemplo seguro: DTO de entrada acotado

Mejor hacer algo así:

```java
public class CreateOrderRequest {

    @NotNull
    private Long productId;

    @NotNull
    @Positive
    private Integer quantity;
}
```

Y después en service:

- el backend toma el usuario desde autenticación
- busca precio real
- calcula total real
- define estado inicial
- decide flags internos

### Controller

```java
@PostMapping("/orders")
public OrderResponse create(
        @Valid @RequestBody CreateOrderRequest request,
        Authentication authentication) {
    return orderService.create(request, authentication.getName());
}
```

Eso ya es muchísimo más sano.

---

## Caso especial: updates parciales

Los updates parciales son donde más tentador se vuelve usar la entidad directa.

Pero también donde más se pagan los errores.

### Mala idea

```java
@PatchMapping("/products/{id}")
public Product update(@PathVariable Long id, @RequestBody Product product) {
    product.setId(id);
    return productRepository.save(product);
}
```

### Mejor enfoque

Diseñar DTOs por intención.

Por ejemplo:

```java
public class UpdateProductBasicInfoRequest {

    @NotBlank
    @Size(max = 120)
    private String title;
}
```

O:

```java
public class UpdateProductPriceRequest {

    @NotNull
    @Positive
    private BigDecimal price;
}
```

O incluso separar en endpoints distintos si la operación lo justifica.

Esto reduce muchísimo el poder del cliente.

---

## Qué conviene bindear en lugar de entidades

Conviene bindear:

- DTOs de entrada
- pequeños, claros y orientados al caso de uso
- con Bean Validation
- sin campos internos innecesarios
- sin mezclar varias operaciones sensibles en el mismo contrato

### Ejemplos sanos

- `CreateUserRequest`
- `UpdateProfileRequest`
- `ChangePasswordRequest`
- `CreateOrderRequest`
- `CancelOrderRequest`
- `UpdateUserRoleRequest`
- `RefundOrderRequest`

Cada uno expresa una intención más precisa.

---

## Qué hacer con la entidad entonces

La entidad debería quedar más asociada a:

- persistencia
- dominio interno
- invariantes del modelo
- relaciones entre objetos
- estado real del sistema

Y no tanto al mundo HTTP.

El flujo sano suele ser:

### request DTO
entra desde el cliente

### service
decide qué parte de esa intención se convierte en cambio válido

### entidad
representa el estado interno persistente

### response DTO
expone solo lo necesario

---

## Ejemplo completo de flujo sano

### DTO de entrada

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

### Entity

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

### Controller

```java
@PostMapping("/users")
public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
    return userService.create(request);
}
```

### Service

```java
public UserResponse create(CreateUserRequest request) {
    User user = new User();
    user.setName(request.getName());
    user.setEmail(request.getEmail());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setRole("USER");
    user.setEnabled(true);

    userRepository.save(user);

    return userMapper.toResponse(user);
}
```

Acá queda muy claro:

- el cliente propone nombre, email y password
- el backend decide hash, rol y estado inicial
- la entidad sigue siendo interna
- la response puede exponer solo lo que corresponde

---

## Señales de que una codebase está bindeando demasiado a entidades

Estas señales suelen hacer ruido rápido:

- `@RequestBody Entity`
- `return entityRepository.save(entity)`
- controllers que casi no usan DTOs
- updates con `PATCH` o `PUT` sobre entidad completa
- entidades con validaciones pensadas para HTTP
- entidades usadas también como response
- campos internos que aparecen en requests
- services que persisten casi directo lo que reciben

---

## Qué problemas terminan apareciendo después

Aunque al principio “funcione”, este patrón suele traer:

- endpoints demasiado abiertos
- mass assignment
- validaciones difusas
- mayor exposición accidental
- coupling fuerte entre API y base
- más miedo a refactorizar
- dificultades para separar permisos
- DTOs inexistentes o improvisados tarde
- autorizaciones raras por campo
- más riesgo en updates y operaciones críticas

---

## Señal de diseño maduro

Una app más madura suele:

- bindear DTOs, no entidades
- tener contratos específicos por caso de uso
- decidir campos internos en backend
- separar entrada, dominio y salida
- no permitir que el cliente controle demasiado
- usar mapping explícito
- reducir superficie del request

Eso no solo mejora seguridad.
También mejora claridad de diseño.

---

## Checklist práctico

Cuando revises una app Spring, preguntate:

- ¿hay `@RequestBody` con entidades JPA?
- ¿hay updates que persisten casi directo lo que llega?
- ¿el cliente puede enviar campos internos?
- ¿las entidades se usan también como response?
- ¿los DTOs de entrada son realmente acotados?
- ¿están separadas las intenciones de create, update y admin?
- ¿qué campos hoy podría intentar manipular alguien con un request fabricado?
- ¿la entidad está cargando validaciones o preocupaciones de HTTP?
- ¿este diseño facilita mass assignment?
- ¿qué parte del contrato debería rediseñarse para que el backend decida más y el cliente menos?

---

## Mini ejercicio de reflexión

Tomá tres endpoints de tu backend y respondé:

1. ¿Reciben entidad o DTO?
2. ¿Qué campos internos quedarían expuestos si recibieran entidad?
3. ¿Qué parte de la verdad del sistema está quedando en manos del cliente?
4. ¿Qué DTO más chico podrías diseñar para esa operación?
5. ¿Qué parte debería decidir siempre el backend aunque hoy venga en el request?

Si esas respuestas te muestran demasiados campos o demasiado poder del cliente, probablemente el binding esté mal planteado.

---

## Resumen

No conviene bindear directo a entidades porque eso suele:

- abrir mass assignment
- mezclar capas
- exponer campos internos
- debilitar contratos
- volver difusa la verdad del sistema
- dejar demasiado poder en el cliente

En resumen:

> Una entidad JPA representa el estado interno persistente.  
> Un request representa una intención externa.  
> Tratarlos como si fueran lo mismo vuelve al backend más cómodo, pero también mucho más fácil de abusar.

---

## Próximo tema

**Mass assignment en Spring MVC**
