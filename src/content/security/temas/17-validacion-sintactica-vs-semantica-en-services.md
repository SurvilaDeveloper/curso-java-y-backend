---
title: "Validación sintáctica vs semántica en services"
description: "Cómo distinguir validación sintáctica y validación semántica en una aplicación Java con Spring Boot. Qué debería validarse con Bean Validation o en el borde HTTP y qué decisiones de negocio deben vivir en la capa de service."
order: 17
module: "Requests y validación"
level: "base"
draft: false
---

# Validación sintáctica vs semántica en services

## Objetivo del tema

Entender la diferencia entre:

- **validación sintáctica**
- **validación semántica**

en una aplicación Java + Spring Boot, y ver por qué esa diferencia mejora mucho la seguridad, el diseño y la claridad del backend.

Este tema es importante porque muchas apps:

- validan muy bien la forma del request
- pero validan mal su sentido real

O al revés:

- meten demasiada lógica de negocio en el borde HTTP
- y vuelven el código más frágil, repetido y difícil de mantener

La idea central es separar mejor qué valida el sistema en el **borde** y qué valida en la **capa de service**.

---

## Idea clave

No alcanza con que un request esté “bien formado”.

También tiene que tener **sentido real** para el sistema.

En resumen:

> La validación sintáctica responde si el dato tiene forma aceptable.  
> La validación semántica responde si ese dato, en este contexto, para este actor y sobre este recurso, tiene sentido y está permitido.

Las dos importan.  
Pero no viven necesariamente en el mismo lugar.

---

## Qué es validación sintáctica

La validación sintáctica mira la **forma** del dato.

Preguntas típicas:

- ¿el campo vino?
- ¿es null?
- ¿es blank?
- ¿el email tiene formato válido?
- ¿el número es positivo?
- ¿la longitud entra en el límite?
- ¿la lista vino vacía?
- ¿el valor respeta un patrón?

### Ejemplos clásicos

- `@NotBlank`
- `@Email`
- `@Size`
- `@Positive`
- `@NotNull`
- `@Pattern`

Este tipo de validación suele vivir bien en:

- DTOs de entrada
- Bean Validation
- controller
- borde HTTP

---

## Qué es validación semántica

La validación semántica mira el **significado** del request dentro del sistema real.

Preguntas típicas:

- ¿este usuario puede hacer esto?
- ¿esta orden existe?
- ¿le pertenece?
- ¿está en un estado válido para esta operación?
- ¿el cupón aplica a este caso?
- ¿ese email ya está registrado?
- ¿este actor puede cambiar ese rol?
- ¿esa transición tiene sentido?
- ¿esta operación ya fue hecha?
- ¿este total corresponde a la realidad del backend?

Este tipo de validación suele vivir mejor en:

- service
- dominio
- capa de negocio
- políticas de autorización
- lógica específica del caso de uso

---

## Ejemplo rápido para fijar la diferencia

Supongamos este DTO:

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

### Validación sintáctica
Responde cosas como:

- ¿name vino vacío?
- ¿email tiene forma de email?
- ¿password tiene tamaño mínimo?

### Validación semántica
Responde cosas como:

- ¿ese email ya está en uso?
- ¿el actor actual puede crear usuarios?
- ¿el alta está permitida en este entorno o módulo?
- ¿hay restricciones especiales para ese tipo de cuenta?

El DTO puede estar perfecto y el request seguir siendo inválido desde negocio.

---

## Error mental clásico

Muchas apps hacen esto:

- agregan `@Valid`
- ponen constraints en el DTO
- devuelven 400 si algo viene mal

Y después sienten que “la validación ya está resuelta”.

No.

Ahí resolvieron la **entrada básica**.

Todavía faltan cosas como:

- permisos
- ownership
- existencia real
- estado del recurso
- transición válida
- unicidad
- integridad del negocio
- contexto del actor
- efectos colaterales

---

## Dónde debería vivir cada una

## Validación sintáctica
Suele vivir bien en:

- DTOs
- Bean Validation
- `@Valid`
- controller
- validadores declarativos
- borde HTTP

## Validación semántica
Suele vivir bien en:

- service
- dominio
- validadores de negocio
- políticas de autorización
- consultas de existencia o ownership
- lógica de transición
- chequeos contextuales

Esta separación no es caprichosa.
Hace que el backend sea más claro y menos ingenuo.

---

## Ejemplo sano de separación

### DTO

```java
public class CancelOrderRequest {

    @NotBlank
    @Size(max = 300)
    private String reason;
}
```

### Controller

```java
@PostMapping("/orders/{id}/cancel")
public ResponseEntity<Void> cancel(
        @PathVariable Long id,
        @Valid @RequestBody CancelOrderRequest request,
        Authentication authentication) {
    orderService.cancel(id, request, authentication.getName());
    return ResponseEntity.noContent().build();
}
```

### Service

```java
public void cancel(Long orderId, CancelOrderRequest request, String username) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    User user = userRepository.findByEmail(username).orElseThrow();

    if (!order.belongsTo(user) && !user.hasRole("SUPPORT")) {
        throw new AccessDeniedException("No autorizado");
    }

    if (!order.canBeCancelled()) {
        throw new IllegalStateException("La orden no puede cancelarse");
    }

    order.cancel(request.getReason());
    orderRepository.save(order);
}
```

### Qué validó cada capa

**DTO / controller**
- que el motivo exista
- que no venga vacío
- que no exceda tamaño

**Service**
- que la orden exista
- que el actor pueda cancelarla
- que el estado permita cancelación

Eso está mucho mejor separado.

---

## Por qué la validación semántica suele vivir en service

Porque depende de cosas que normalmente el borde HTTP no conoce bien por sí solo:

- actor autenticado
- recurso real en base
- estado actual
- reglas del negocio
- integridad previa
- autorización
- relaciones entre objetos
- contexto temporal
- restricciones operativas

El controller ve el request.
El service entiende el caso de uso.

---

## Ejemplo: un request sintácticamente válido pero semánticamente inválido

### DTO

```java
public class ChangeUserRoleRequest {

    @NotBlank
    private String role;
}
```

### Request recibido

```json
{
  "role": "ADMIN"
}
```

Sintácticamente:

- el campo vino
- no está vacío
- el JSON es válido

Pero semánticamente puede ser inválido si:

- el actor actual no es admin
- el usuario objetivo no puede cambiarse
- la app no permite autoelevación
- el sistema prohíbe que soporte asigne ese rol
- falta auditoría o aprobación adicional

El dato tiene forma válida.
La operación sigue siendo inválida.

---

## Ejemplo: un request sintácticamente inválido pero semánticamente irrelevante

### DTO

```java
public class CreateCouponRequest {

    @NotBlank
    @Size(max = 30)
    private String code;

    @NotNull
    @Positive
    private Integer percentage;
}
```

Si el request viene con:

```json
{
  "code": "",
  "percentage": -10
}
```

Ni siquiera hace falta llegar a negocio.

Esto debería cortarse en el borde.

Esa es una buena tarea para Bean Validation.

---

## Qué problemas aparecen cuando mezclás ambas mal

## Si metés toda la validación en controller

Pueden aparecer problemas como:

- lógica de negocio repartida
- controllers gigantes
- repetición
- servicios débiles
- huecos cuando otro flujo reutiliza el mismo service
- difícil testeo del negocio real

## Si metés toda la validación en service y nada en el borde

Pueden aparecer cosas como:

- requests absurdos entrando demasiado profundo
- errores menos claros
- ruido innecesario
- validaciones básicas duplicadas a mano
- DTOs pobres
- menos claridad de contrato

Lo sano suele ser repartir mejor.

---

## Qué suele ir bien en Bean Validation

Bean Validation funciona muy bien para:

- obligatoriedad
- formato
- tamaño
- rangos simples
- listas no vacías
- patrones
- validación de objetos anidados
- límites declarativos

### Ejemplo

```java
public class CreateProductRequest {

    @NotBlank
    @Size(max = 120)
    private String title;

    @NotNull
    @Positive
    private BigDecimal price;

    @NotNull
    @Min(0)
    private Integer stock;
}
```

Eso está perfecto como validación sintáctica.

---

## Qué no conviene cargarle a Bean Validation

No conviene forzar Bean Validation para resolver sola cosas como:

- ownership
- autorización real
- estado del recurso
- existencia en base
- unicidad compleja
- transición válida
- descuentos aplicables
- stock real en ese momento
- reglas por tenant
- restricciones del actor actual

Porque todo eso depende de contexto y de negocio.

---

## Ejemplo: unicidad de email

### DTO

```java
public class RegisterRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;
}
```

### Bean Validation resuelve
- formato de email
- obligatoriedad
- longitud de password

### Service debería resolver
- si el email ya existe
- si el alta está permitida
- si hay restricciones por dominio
- si hace falta activación adicional

---

## Ejemplo: update de perfil

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

    if (!user.isEnabled()) {
        throw new IllegalStateException("La cuenta no está habilitada");
    }

    user.setName(request.getName());
    userRepository.save(user);

    return userMapper.toResponse(user);
}
```

Acá de nuevo:

**sintaxis**
- que el nombre no venga vacío
- que no supere tamaño

**semántica**
- que la cuenta exista
- que esté habilitada
- que esa operación tenga sentido en este contexto

---

## Cómo se ve esto en una revisión de codebase

Cuando revises una app Spring, una señal sana es esta:

- DTOs con validación declarativa clara
- services con reglas de negocio claras
- controller liviano
- poca mezcla entre formato y semántica

### Señales de ruido

- controllers gigantes llenos de ifs de negocio
- services que confían demasiado en el DTO
- ausencia de `@Valid`
- Bean Validation intentando resolver negocio complejo
- endpoints que validan formato pero no ownership
- DTOs perfectos con services ingenuos
- código duplicado para reglas que deberían vivir en un solo lugar

---

## La validación semántica también es seguridad

Esto es clave.

Mucha gente asocia “seguridad” con autenticación, roles o vulnerabilidades técnicas.

Pero la validación semántica también es seguridad porque ayuda a impedir cosas como:

- usar recursos ajenos
- forzar transiciones inválidas
- operar fuera de contexto
- ejecutar acciones no permitidas
- aprovechar incoherencias del dominio
- abusar flujos válidos fuera de su sentido real

En backend real, muchísimos incidentes vienen más de reglas mal validadas que de bugs “exóticos”.

---

## Cuándo debería fallar cada tipo de validación

### La validación sintáctica debería fallar antes
Cuando el request ni siquiera tiene forma aceptable.

Por ejemplo:

- falta un campo obligatorio
- el email no tiene formato
- el número es negativo
- la lista vino vacía

### La validación semántica debería fallar después
Cuando el request tiene forma aceptable, pero no sentido real.

Por ejemplo:

- la orden no pertenece al actor
- la operación no está permitida
- el recurso no está en estado válido
- el email ya existe
- el cupón no aplica
- el actor no tiene alcance suficiente

---

## Qué gana el backend si separa bien ambas

Cuando las separás bien, el backend gana:

- contracts más claros
- controllers más limpios
- services más fuertes
- errores más consistentes
- menos repetición
- mejor testeo
- menos ingenuidad
- mejor lectura de seguridad

No es solo prolijidad.
También es una mejora real de diseño defensivo.

---

## Checklist práctico

Cuando revises una app Spring, preguntate:

- ¿qué parte del request se valida solo en forma?
- ¿qué parte del negocio se valida realmente en service?
- ¿hay `@Valid` donde corresponde?
- ¿hay reglas de negocio metidas en controller?
- ¿el service confía demasiado en que el DTO “ya viene bien”?
- ¿qué validaciones dependen del actor actual?
- ¿qué validaciones dependen del estado del recurso?
- ¿qué validaciones dependen de existencia o unicidad real?
- ¿se está usando Bean Validation para cosas que en realidad son de negocio?
- ¿hay operaciones donde el dato está bien formado pero igual debería rechazarse por contexto?

---

## Mini ejercicio de reflexión

Tomá tres endpoints de tu backend y para cada uno armá dos listas:

### Lista A — Validación sintáctica
- qué campos deberían ser obligatorios
- qué formato deberían tener
- qué límites simples aplicarían

### Lista B — Validación semántica
- qué reglas de negocio deberían aplicarse
- qué permisos u ownership se necesitan
- qué estado del recurso importa
- qué contexto del actor cambia la decisión

Si mezclaste demasiado ambas listas, probablemente tu diseño todavía pueda mejorar bastante.

---

## Resumen

La validación sintáctica revisa la forma del input.

La validación semántica revisa su sentido real dentro del sistema.

## Sintáctica
- formato
- obligatoriedad
- tamaño
- rango
- estructura

## Semántica
- permisos
- ownership
- existencia
- estado
- transición
- integridad del negocio
- contexto del actor

En resumen:

> Un request puede estar perfectamente bien escrito y seguir siendo inválido para el sistema.  
> Por eso un backend fuerte no valida solo cómo viene el dato, sino también si esa acción tiene sentido real.

---

## Próximo tema

**Normalización y sanitización en backend**
