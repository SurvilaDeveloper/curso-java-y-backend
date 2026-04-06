---
title: "Errores comunes con @RequestBody"
description: "Qué errores de diseño e implementación aparecen al usar @RequestBody en una aplicación Java con Spring Boot. Cómo evitar payloads demasiado amplios, binds peligrosos, confianza excesiva en el cliente y contratos HTTP mal definidos."
order: 16
module: "Requests y validación"
level: "base"
draft: false
---

# Errores comunes con `@RequestBody`

## Objetivo del tema

Entender cuáles son los errores más comunes al usar `@RequestBody` en una aplicación Java + Spring Boot y por qué algo tan cotidiano puede abrir varios problemas de seguridad cuando el backend acepta payloads demasiado abiertos, ambiguos o confiados de más.

Este tema importa mucho porque `@RequestBody` aparece en casi cualquier API moderna y, usado sin criterio, puede convertirse en la puerta de entrada a:

- mass assignment
- campos internos manipulables
- contratos demasiado amplios
- validación insuficiente
- cambios de estado inválidos
- lógica de negocio delegada al cliente
- exposición innecesaria del modelo interno

---

## Idea clave

`@RequestBody` no es el problema.

El problema aparece cuando el backend trata al body como si ya fuera:

- correcto
- suficiente
- honesto
- seguro
- compatible con el modelo interno
- listo para persistir

En resumen:

> El body es solo input externo.  
> El backend tiene que decidir qué parte acepta, qué parte ignora, qué parte valida y qué parte jamás debería venir desde el cliente.

---

## Qué hace `@RequestBody`

En Spring MVC, `@RequestBody` le dice al framework que tome el cuerpo de la request y lo convierta en un objeto Java.

### Ejemplo básico

```java
@PostMapping("/users")
public UserResponse create(@RequestBody CreateUserRequest request) {
    return userService.create(request);
}
```

Spring deserializa el JSON recibido y lo convierte en `CreateUserRequest`.

Eso es muy útil.

Pero justamente por ser tan cómodo, a veces lleva a decisiones malas de diseño.

---

## Error 1: usar `@RequestBody` con entidades JPA

Este es uno de los errores más comunes.

### Ejemplo riesgoso

```java
@PostMapping("/users")
public User create(@RequestBody User user) {
    return userRepository.save(user);
}
```

## ¿Qué problemas hay acá?

- bind directo a entidad
- mezcla contrato HTTP con persistencia
- el cliente puede intentar setear campos internos
- aumenta riesgo de mass assignment
- se vuelve difuso qué decide el backend
- la API queda demasiado acoplada al modelo interno

Si `User` tiene cosas como:

- `role`
- `enabled`
- `passwordHash`
- `ownerId`
- `createdAt`

entonces el cliente podría intentar mandarlas.

Aunque la UI no lo haga, igual podría probar.

---

## Error 2: DTO demasiado grande

A veces no se usa entidad directa, pero el DTO igual está mal planteado.

### Ejemplo riesgoso

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

Y después:

```java
@PatchMapping("/users/{id}")
public UserResponse update(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
    return userService.update(id, request);
}
```

## ¿Qué está mal?

El request mezcla demasiadas intenciones:

- editar perfil
- cambiar email
- cambiar rol
- habilitar o deshabilitar
- cambiar ownership
- cambiar estado

Eso hace que `@RequestBody` se vuelva demasiado poderoso.

La solución no es solo “validar mejor”.
La solución suele ser dividir el contrato.

---

## Error 3: asumir que el body ya viene bien formado

Otro error muy frecuente es usar `@RequestBody` sin Bean Validation ni controles mínimos.

### Ejemplo flojo

```java
@PostMapping("/products")
public ProductResponse create(@RequestBody CreateProductRequest request) {
    return productService.create(request);
}
```

Si `CreateProductRequest` no tiene validación o el controller no usa `@Valid`, entonces el backend puede recibir:

- campos vacíos
- números negativos
- textos larguísimos
- listas vacías
- estructuras parcialmente inválidas

Versión mejor:

```java
@PostMapping("/products")
public ProductResponse create(@Valid @RequestBody CreateProductRequest request) {
    return productService.create(request);
}
```

Y el DTO:

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

## Error 4: confiar en campos que el backend debería decidir

A veces el problema no es la forma del body, sino su contenido.

### Ejemplo riesgoso

```java
public class CreateOrderRequest {
    private Long productId;
    private Integer quantity;
    private BigDecimal total;
    private String status;
    private Long userId;
}
```

## ¿Qué campos hacen ruido?

- `total`
- `status`
- `userId`

Porque esos campos deberían decidirse en backend.

El cliente puede proponer:

- producto
- cantidad

Pero el backend debería decidir:

- usuario real
- precio real
- total real
- estado inicial correcto

Si el body trae demasiada “verdad”, el backend se vuelve ingenuo.

---

## Error 5: mezclar create y update en el mismo contrato

Esto pasa bastante en APIs “rápidas”.

### Ejemplo sospechoso

```java
public class SaveProductRequest {
    private Long id;
    private String title;
    private BigDecimal price;
    private Boolean approved;
}
```

Y se usa para:

- crear
- actualizar
- moderar
- devolver

Eso suele estar mal por varias razones:

- mezcla casos de uso distintos
- mezcla campos que no siempre corresponden
- vuelve más confusa la autorización
- aumenta superficie del body
- hace más fácil que el cliente mande de más

Mucho más sano suele ser separar:

- `CreateProductRequest`
- `UpdateProductBasicInfoRequest`
- `UpdateProductPriceRequest`
- `ApproveProductRequest`

---

## Error 6: `@RequestBody` en operaciones que no necesitan cuerpo

A veces se usa body donde bastaría una acción más explícita.

### Más riesgoso

```java
@PatchMapping("/orders/{id}")
public OrderResponse update(@PathVariable Long id, @RequestBody UpdateOrderRequest request) {
    return orderService.update(id, request);
}
```

Con algo como:

```java
public class UpdateOrderRequest {
    private String status;
}
```

### Más sano

```java
@PostMapping("/orders/{id}/cancel")
public ResponseEntity<Void> cancel(@PathVariable Long id, Authentication authentication) {
    orderService.cancel(id, authentication.getName());
    return ResponseEntity.noContent().build();
}
```

Eso reduce muchísimo:

- ambigüedad
- superficie del body
- riesgo de estados arbitrarios
- dificultad de autorización

No toda operación necesita un `@RequestBody`.

---

## Error 7: copiar todo lo que llega a la entidad

Otro patrón muy peligroso:

```java
public UserResponse update(Long id, UpdateUserRequest request) {
    User user = userRepository.findById(id).orElseThrow();

    BeanUtils.copyProperties(request, user);

    userRepository.save(user);

    return userMapper.toResponse(user);
}
```

## ¿Qué hace ruido acá?

- copia automática masiva
- difícil ver qué campos se tocan de verdad
- fácil que se cuele algo sensible
- más riesgoso si el DTO crece
- más difícil razonar autorización y negocio

Mucho mejor mapear explícitamente:

```java
user.setName(request.getName());
user.setEmail(request.getEmail());
```

Eso obliga al backend a decidir con más claridad.

---

## Error 8: no diferenciar entre ausencia y nulidad en updates

En updates parciales, `@RequestBody` puede traer problemas si el backend no distingue bien entre:

- campo ausente
- campo presente en null
- campo presente con valor vacío

### Ejemplo problemático

```java
public class UpdateProfileRequest {
    private String name;
    private String bio;
}
```

Y luego:

```java
user.setName(request.getName());
user.setBio(request.getBio());
```

Si el cliente manda:

```json
{
  "name": null
}
```

o simplemente omite `name`, el resultado puede ser muy distinto.

Esto no siempre es una vulnerabilidad grave, pero sí puede provocar:

- pérdida accidental de datos
- cambios inconsistentes
- comportamiento ambiguo
- lógica difícil de auditar

En updates delicados conviene pensar muy bien el contrato.

---

## Error 9: devolver mensajes o errores demasiado reveladores sobre el body

La validación del body debería ayudar, no regalar señales innecesarias.

Ejemplo:

- reflejar exactamente qué campos internos reconoce el backend
- mostrar demasiada estructura del modelo
- devolver trazas de deserialización muy técnicas
- diferenciar en exceso entre casos internos

Esto puede darle demasiado contexto a alguien que prueba requests a mano.

Conviene que los errores sean:

- claros
- consistentes
- útiles
- pero no excesivamente verbosos

---

## Error 10: pensar que `@RequestBody` + `@Valid` ya resolvió todo

Este es uno de los errores conceptuales más comunes.

### Ejemplo

```java
@PostMapping("/refunds")
public ResponseEntity<Void> refund(@Valid @RequestBody RefundRequest request) {
    refundService.refund(request);
    return ResponseEntity.noContent().build();
}
```

DTO:

```java
public class RefundRequest {
    @NotNull
    private Long orderId;

    @NotBlank
    private String reason;
}
```

Esto está bien como validación estructural.

Pero todavía faltan preguntas como:

- ¿el actor puede reembolsar esa orden?
- ¿la orden existe?
- ¿le pertenece?
- ¿está en estado reembolsable?
- ¿ya fue reembolsada?
- ¿requiere auditoría especial?

`@RequestBody` y Bean Validation resuelven forma.
No resuelven la verdad del negocio.

---

## Cómo usar bien `@RequestBody`

## 1. Siempre con contratos explícitos
Preferí DTOs claros y chicos.

## 2. Con `@Valid` cuando corresponda
Para evitar inputs obviamente inválidos.

## 3. Sin entidades JPA
No bindear directo a persistencia.

## 4. Sin campos que el backend debería decidir
No aceptar roles, ownership, estados o montos críticos si no corresponde.

## 5. Con mapping explícito
No copiar todo automáticamente.

## 6. Con operaciones específicas
No usar un body genérico para cualquier cambio delicado.

---

## Ejemplo sano

### DTO

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

Esto está bastante mejor porque:

- el body es chico
- el cliente no decide identidad
- el cliente no toca campos internos
- la operación es clara
- el mapping es explícito

---

## Señales de que un `@RequestBody` merece revisión

Estas señales suelen hacer ruido rápido:

- body con entidad JPA
- DTO muy grande
- campos como `role`, `status`, `ownerId`, `enabled`, `approved`
- create/update/admin compartiendo el mismo request
- controller que persiste casi directo el body
- body usado para operaciones de cambio delicado demasiado amplias
- ausencia de `@Valid`
- mapping automático sin control fino
- frontend sosteniendo parte importante de la verdad

---

## Qué gana la app si usa mejor `@RequestBody`

Cuando el backend usa `@RequestBody` con más criterio, gana:

- menos superficie de ataque
- menos confianza en el cliente
- contratos más claros
- menos mass assignment
- mejor separación por intención
- menos ambigüedad en updates
- mejor autorización
- mejor trazabilidad
- menos coupling con persistencia

---

## Checklist práctico

Cuando revises `@RequestBody` en una app Spring, preguntate:

- ¿está entrando una entidad o un DTO?
- ¿el DTO representa una intención concreta?
- ¿el body trae campos que el backend debería decidir?
- ¿el backend está usando `@Valid`?
- ¿hay campos internos mezclados con campos editables?
- ¿el mapping es explícito o automático?
- ¿la operación debería dividirse en endpoints más específicos?
- ¿este body mezcla create, update o admin?
- ¿el request depende demasiado del caso feliz de la UI?
- ¿qué podría mandar alguien con Postman que la pantalla nunca enviaría?

---

## Mini ejercicio de reflexión

Tomá tres endpoints con `@RequestBody` de tu backend y respondé:

1. ¿Qué clase recibe el body?
2. ¿Es un DTO chico o un contrato demasiado amplio?
3. ¿Qué campos no debería controlar nunca el cliente?
4. ¿El backend recalcula lo importante o cree demasiado en el body?
5. ¿Ese endpoint debería dividirse en operaciones más chicas?
6. ¿Qué parte del negocio todavía no queda validada aunque el body pase bien la deserialización?

Ese ejercicio te va a mostrar muy rápido qué tan sano está el diseño de entrada de tu API.

---

## Resumen

`@RequestBody` es una herramienta útil y normal en Spring Boot.

Pero se vuelve peligrosa cuando se usa con:

- entidades directas
- DTOs demasiado grandes
- campos internos
- confianza excesiva en el cliente
- mapping automático masivo
- operaciones demasiado genéricas

En resumen:

> El body nunca es la verdad del sistema.  
> Es solo input externo que el backend debe filtrar, validar, limitar y traducir a una acción segura.

---

## Próximo tema

**Validación sintáctica vs semántica en services**
