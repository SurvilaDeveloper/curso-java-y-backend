---
title: "Validación con Bean Validation"
description: "Cómo usar Bean Validation en una aplicación Java con Spring Boot para validar inputs de forma clara, mantenible y segura. Qué resuelve, qué no resuelve, dónde conviene usarlo y cómo combinarlo con validación de negocio."
order: 12
module: "Requests y validación"
level: "base"
draft: false
---

# Validación con Bean Validation

## Objetivo del tema

Aprender a usar **Bean Validation** en una aplicación Java + Spring Boot para validar inputs de forma:

- clara
- mantenible
- consistente
- reutilizable

y, sobre todo, entender **qué sí resuelve** y **qué no resuelve** dentro de la seguridad backend.

Porque Bean Validation es muy útil, pero no alcanza por sí sola para proteger un backend.

---

## Idea clave

Bean Validation sirve para validar muy bien la **forma** de los datos de entrada.

Pero no alcanza para validar por sí sola:

- ownership
- permisos
- reglas de negocio
- estados válidos
- existencia real
- integridad entre objetos
- transiciones complejas

En resumen:

> Bean Validation es excelente para validar estructura, formato y restricciones declarativas.  
> La verdad de negocio sigue viviendo en el backend, normalmente en la capa de service.

---

## Qué es Bean Validation

Bean Validation es el mecanismo estándar de Java para declarar restricciones sobre objetos, campos o parámetros usando anotaciones como:

- `@NotNull`
- `@NotBlank`
- `@Size`
- `@Email`
- `@Min`
- `@Max`
- `@Positive`
- `@Pattern`

En el ecosistema Spring Boot, esto suele integrarse de forma muy natural con:

- DTOs de entrada
- `@RequestBody`
- `@Valid`
- `@Validated`
- controladores
- parámetros de métodos

---

## Para qué sirve bien

Bean Validation sirve muy bien para cosas como:

- campo obligatorio
- longitud mínima o máxima
- formato de email
- números positivos
- rango simple
- regex básica
- listas vacías o no vacías
- validación de objetos anidados
- mensajes de error consistentes
- evitar payloads claramente inválidos desde la entrada

---

## Para qué no alcanza

Bean Validation **no debería cargarse con responsabilidades que no le corresponden**.

No alcanza bien para responder preguntas como:

- ¿este usuario puede modificar este recurso?
- ¿este email ya existe?
- ¿esta orden pertenece al actor actual?
- ¿este cambio de estado está permitido?
- ¿este total es correcto?
- ¿esta operación puede hacerse dos veces?
- ¿esta transición tiene sentido en este momento?
- ¿este recurso existe realmente en base?
- ¿este descuento aplica a este usuario y a este producto?

Eso ya es validación de negocio o autorización real.

---

## Error mental común

Mucha gente ve esto:

```java
@PostMapping("/users")
public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
    return userService.create(request);
}
```

y piensa:

- “listo, ya validamos”

No.

Lo que hiciste fue validar **parte** del problema.

Probablemente validaste:

- formato
- obligatoriedad
- tamaño
- estructura básica

Todavía falta validar:

- unicidad de email
- reglas del dominio
- permisos del actor
- coherencia del estado
- side effects
- restricciones del negocio

---

## Dependencia típica en Spring Boot

En proyectos Spring Boot, Bean Validation suele venir con:

- `spring-boot-starter-validation`

Si no estuviera, normalmente se agrega así en Maven:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

---

## Ejemplo básico de DTO validado

```java
public class CreateUserRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String name;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 100, message = "La contraseña debe tener entre 8 y 100 caracteres")
    private String password;

    // getters y setters
}
```

Y en el controller:

```java
@PostMapping("/users")
public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
    return userService.create(request);
}
```

Con esto, Spring puede rechazar requests claramente inválidos antes de entrar de lleno en la lógica del negocio.

---

## Qué gana el backend con esto

Usar Bean Validation bien te da varias ventajas:

- menos validación repetida a mano
- DTOs más expresivos
- contratos más claros
- errores más consistentes
- menos ruido en controllers
- mejor separación entre forma del input y lógica de negocio
- menos requests absurdos llegando a services

No es solo comodidad. También mejora claridad defensiva.

---

## `@NotNull` vs `@NotBlank` vs `@NotEmpty`

Conviene no usarlas como si fueran equivalentes.

## `@NotNull`
Solo exige que el valor no sea `null`.

Sirve para:

- números
- enums
- objetos
- campos donde `null` no debe existir

## `@NotEmpty`
Exige que no sea `null` ni vacío.

Aplica a:

- strings
- colecciones
- arrays

## `@NotBlank`
Exige que no sea `null`, ni vacío, ni solo espacios.

Se usa mucho para `String`.

### Ejemplo

```java
@NotBlank
private String name;
```

Esto suele ser mejor que `@NotNull` para nombres, emails, títulos, etc.

---

## Ejemplo útil en un backend Spring

```java
public class CreateProductRequest {

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 120, message = "El título no puede superar los 120 caracteres")
    private String title;

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor que cero")
    private BigDecimal price;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;
}
```

Esto resuelve bien preguntas como:

- ¿faltó el campo?
- ¿el número es negativo?
- ¿el texto vino vacío?
- ¿hay un límite razonable de longitud?

---

## Validar colecciones y objetos anidados

Bean Validation también sirve muy bien para estructuras más complejas.

### Ejemplo

```java
public class CreateOrderRequest {

    @NotEmpty(message = "La orden debe incluir al menos un item")
    @Valid
    private List<CreateOrderItemRequest> items;
}
```

Y el item:

```java
public class CreateOrderItemRequest {

    @NotNull(message = "El productId es obligatorio")
    private Long productId;

    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor que cero")
    private Integer quantity;
}
```

Acá `@Valid` permite validar también los objetos internos de la lista.

---

## Dónde usar `@Valid`

En Spring Boot, `@Valid` suele usarse en lugares como:

- `@RequestBody`
- parámetros de métodos
- objetos anidados
- listas de DTOs
- argumentos de entrada que quieras validar declarativamente

### Ejemplo clásico

```java
@PostMapping("/orders")
public OrderResponse create(@Valid @RequestBody CreateOrderRequest request) {
    return orderService.create(request);
}
```

---

## Qué pasa cuando falla la validación

Cuando Spring encuentra una validación fallida en un `@RequestBody` con `@Valid`, normalmente lanza una excepción tipo:

- `MethodArgumentNotValidException`

Si no la manejás, Spring ya puede devolver un `400 Bad Request`.

Pero en una app real conviene casi siempre tener un manejo consistente de errores.

---

## Manejo de errores de validación

Una forma común de hacerlo es con `@RestControllerAdvice`.

### Ejemplo

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        return ResponseEntity.badRequest().body(errors);
    }
}
```

Esto te permite devolver errores más claros y consistentes.

---

## Por qué esto también importa para seguridad

Una validación consistente ayuda a:

- reducir inputs absurdos o malformados
- bajar superficie innecesaria
- evitar estados inválidos obvios
- cortar requests que ya nacen mal
- hacer más predecible el comportamiento del backend

Pero ojo:

si devolvés demasiada información o mensajes mal pensados, también podés filtrar señales innecesarias.

Por eso conviene que los errores:

- sean útiles
- pero no revelen de más
- y mantengan un formato estable

---

## Qué conviene validar con Bean Validation

Conviene validar con Bean Validation cosas como:

- obligatoriedad
- longitud
- formato
- rango
- positividad
- listas vacías o no
- patrones simples
- presencia de objetos anidados
- estructura declarativa del request

---

## Qué no conviene cargarle a Bean Validation

No conviene forzar Bean Validation para resolver sola cosas como:

- ownership
- reglas de autorización
- consultas a base pesadas
- lógica dependiente de estado
- integridad de negocio compleja
- decisiones contextuales del actor
- secuencia de operaciones
- totales, descuentos o recalculos críticos
- “si existe tal cosa en la base y además está en tal estado y además este actor puede tocarla”

Eso suele ir mejor en service.

---

## Ejemplo de frontera sana

### DTO con Bean Validation

```java
public class RefundRequest {

    @NotNull(message = "El orderId es obligatorio")
    private Long orderId;

    @NotBlank(message = "El motivo es obligatorio")
    @Size(max = 300, message = "El motivo no puede superar los 300 caracteres")
    private String reason;
}
```

### Controller

```java
@PostMapping("/refunds")
public ResponseEntity<Void> refund(
        @Valid @RequestBody RefundRequest request,
        Authentication authentication) {
    refundService.refund(request, authentication.getName());
    return ResponseEntity.noContent().build();
}
```

### Service

```java
public void refund(RefundRequest request, String username) {
    Order order = orderRepository.findById(request.getOrderId()).orElseThrow();

    User user = userRepository.findByEmail(username).orElseThrow();

    if (!order.belongsTo(user) && !user.hasRole("SUPPORT")) {
        throw new AccessDeniedException("No autorizado");
    }

    if (!order.canBeRefunded()) {
        throw new IllegalStateException("La orden no puede reembolsarse");
    }

    // lógica real
}
```

Acá está bien separado:

- Bean Validation valida forma
- service valida verdad de negocio

---

## Validación en controller vs validación en service

## Controller + Bean Validation
Ideal para:

- campos requeridos
- formato
- tamaño
- estructura básica del payload

## Service
Ideal para:

- permisos
- reglas del dominio
- estado actual
- ownership
- integridad real
- restricciones del negocio
- relaciones entre objetos
- decisiones contextuales

---

## Señales de uso sano de Bean Validation

- DTOs chicos y claros
- anotaciones simples y expresivas
- `@Valid` en requests donde corresponde
- errores consistentes
- services liberados de validación sintáctica repetitiva
- reglas de negocio no mezcladas con constraints declarativas raras

---

## Señales de uso problemático

- creer que `@Valid` ya resolvió seguridad
- meter lógica de negocio compleja como si fuera una simple constraint
- usar Bean Validation sobre entidades expuestas directamente al cliente
- tener DTOs gigantes con demasiados campos
- mezclar validación declarativa con side effects
- depender del frontend igual aunque exista Bean Validation
- no manejar errores de forma consistente
- usar mensajes que filtran información innecesaria

---

## Validación sobre entidades vs validación sobre DTOs

En general, para requests HTTP suele ser mucho más sano validar **DTOs** que entidades JPA directamente.

¿Por qué?

Porque la entidad:

- pertenece a persistencia
- puede tener campos internos
- puede tener relaciones delicadas
- puede no representar bien el contrato externo
- puede mezclar reglas técnicas con reglas de API

Los DTOs te dan una frontera mucho más clara.

---

## Grupos de validación

Bean Validation también permite grupos, pero al principio conviene no complejizar demasiado el curso.

La idea importante acá es esta:

- primero aprendé a usar bien validación declarativa simple
- después, si el caso lo justifica, podés usar grupos para escenarios distintos como create/update

No hace falta meter esa complejidad desde el día uno.

---

## Qué gana la arquitectura si validás bien

Cuando Bean Validation está bien usada:

- los controllers quedan más claros
- los DTOs expresan mejor el contrato
- baja la basura que entra al service
- los errores son más consistentes
- se vuelve más fácil mantener el backend
- se distinguen mejor validación sintáctica y validación de negocio

Eso ayuda tanto a seguridad como a diseño general.

---

## Checklist práctico

Cuando revises un backend Spring, preguntate:

- ¿los DTOs de entrada usan Bean Validation?
- ¿se está usando `@Valid` donde corresponde?
- ¿hay campos obligatorios que hoy no se validan?
- ¿hay tamaños o límites razonables?
- ¿hay números que deberían ser positivos o no negativos?
- ¿se validan listas vacías o nulas?
- ¿los objetos anidados se validan con `@Valid`?
- ¿se están validando DTOs o entidades directas?
- ¿hay errores de validación manejados de forma consistente?
- ¿el equipo está creyendo que Bean Validation resuelve también reglas de negocio que en realidad deberían ir en service?

---

## Mini ejercicio de reflexión

Tomá un DTO real de tu backend y respondé:

1. ¿Qué campos deberían ser obligatorios?
2. ¿Qué campos deberían tener tamaño máximo?
3. ¿Qué campos numéricos deberían tener límites?
4. ¿Qué listas deberían no venir vacías?
5. ¿Qué objetos anidados deberían validarse también?
6. ¿Qué cosa importante no puede resolverse solo con Bean Validation y debería vivir en service?

Ese último punto es el más valioso del ejercicio.

---

## Resumen

Bean Validation es una herramienta muy buena para:

- validar estructura
- validar formato
- validar obligatoriedad
- validar límites simples
- limpiar mucho la entrada al backend

Pero no reemplaza:

- autorización
- ownership
- reglas de negocio
- control de estados
- integridad real
- decisiones sensibles del sistema

En resumen:

> Bean Validation ayuda a que el request llegue mejor formado.  
> La lógica real que decide si el sistema acepta esa intención sigue viviendo en el backend, normalmente en service.

---

## Próximo tema

**DTOs seguros para entrada y salida**
