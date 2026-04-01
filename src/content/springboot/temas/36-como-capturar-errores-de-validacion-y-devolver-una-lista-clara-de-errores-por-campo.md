---
title: "Cómo capturar errores de validación y devolver una lista clara de errores por campo"
description: "Entender cómo interceptar errores de validación en Spring Boot y transformarlos en respuestas ordenadas con detalle por campo, para que el cliente de la API sepa exactamente qué dato falló y por qué."
order: 36
module: "Validación y manejo de errores"
level: "base"
draft: false
---

En el tema anterior viste cómo usar `@ControllerAdvice` y `@ExceptionHandler` para centralizar el manejo de errores en toda la API.

Eso ya es una mejora enorme.

Pero hay un caso que merece especial atención porque aparece muchísimo en aplicaciones reales:

- el cliente manda un JSON
- ese JSON no pasa la validación
- hay uno o varios campos inválidos
- necesitás devolver una respuesta clara y útil
- y lo ideal es que el cliente sepa exactamente **qué campo falló y por qué**

La pregunta entonces es:

> ¿cómo capturás específicamente los errores de validación y los convertís en una lista ordenada de errores por campo?

Ese es justamente el foco de este tema.

## El problema real

Supongamos este DTO:

```java
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class UsuarioRequest {

    @NotBlank
    private String nombre;

    @Email
    @NotBlank
    private String email;

    @Positive
    private int edad;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getEdad() {
        return edad;
    }

    public void setEdad(int edad) {
        this.edad = edad;
    }
}
```

Y este endpoint:

```java
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @PostMapping
    public String crearUsuario(@Valid @RequestBody UsuarioRequest request) {
        return "Usuario válido";
    }
}
```

Si el cliente manda esto:

```json
{
  "nombre": "",
  "email": "correo-invalido",
  "edad": -5
}
```

hay varios errores a la vez:

- `nombre` no debe estar vacío
- `email` no tiene formato válido
- `edad` debe ser positiva

No alcanza con devolver un simple:

```json
{
  "message": "Bad request"
}
```

Eso es demasiado pobre.

## Qué sería una mejor respuesta

Lo ideal sería algo como esto:

```json
{
  "status": 400,
  "error": "validation_error",
  "message": "La petición contiene errores de validación",
  "fields": [
    {
      "field": "nombre",
      "message": "no debe estar vacío"
    },
    {
      "field": "email",
      "message": "debe ser una dirección de email válida"
    },
    {
      "field": "edad",
      "message": "debe ser mayor que 0"
    }
  ]
}
```

Esto ya cambia muchísimo la experiencia del cliente.

Ahora sí puede saber:

- qué salió mal
- en qué campo
- qué corregir
- si hay más de un error a la vez

## Por qué esto importa tanto

Porque una API no debería obligar al cliente a adivinar.

Si el request tiene errores de validación, lo ideal es que la respuesta sea lo bastante rica como para permitir:

- mostrar errores por input en un formulario
- resaltar campos inválidos
- detener envíos hasta corregir
- informar bien a otra API consumidora
- registrar el problema de forma clara en testing

Cuanto más precisa sea la respuesta, más fácil es consumir bien la API.

## Qué excepción suele capturar Spring en este caso

Cuando la validación de un `@RequestBody` falla, Spring MVC suele lanzar una excepción específica asociada al binding y validación del cuerpo del request.

Uno de los nombres más importantes que aparece aquí es:

`MethodArgumentNotValidException`

No hace falta obsesionarse con memorizar nombres internos del framework, pero este sí conviene conocerlo porque es el caso más típico cuando falla la validación de un DTO recibido con `@Valid @RequestBody`.

## La idea general de la solución

El flujo suele ser este:

1. el DTO tiene anotaciones de validación
2. el endpoint usa `@Valid`
3. la validación falla
4. Spring lanza `MethodArgumentNotValidException`
5. tu `@ControllerAdvice` la intercepta
6. construís una respuesta clara con errores por campo

Esto te permite un manejo mucho más elegante que dejar la respuesta por defecto o improvisar mensajes en cada controlador.

## Un primer ejemplo de handler

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> manejarErroresDeValidacion(MethodArgumentNotValidException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("La petición contiene errores de validación");
    }
}
```

Esto ya es mejor que no manejar nada, porque al menos te permite controlar el mensaje general.

Pero todavía no estás devolviendo detalle por campo.

## Qué información trae esa excepción

`MethodArgumentNotValidException` contiene información mucho más rica que un simple mensaje.

Entre otras cosas, te permite acceder a los errores de validación detectados sobre los campos del objeto.

Conceptualmente, ahí podés obtener cosas como:

- nombre del campo
- mensaje de error
- valor rechazado en algunos casos
- lista completa de errores encontrados

Eso es justamente lo que permite construir una respuesta mucho más útil.

## Qué son los field errors

Cuando la validación falla sobre campos concretos, Spring conserva una lista de errores asociados a esos campos.

Por ejemplo:

- `nombre` → no debe estar vacío
- `email` → debe ser una dirección de email válida
- `edad` → debe ser mayor que 0

Esos errores suelen poder recorrerse uno por uno para construir la respuesta final.

## Un DTO para cada error de campo

Una forma muy sana de modelar esto es crear un objeto específico para representar un error de validación por campo.

Por ejemplo:

```java
public class FieldValidationError {

    private String field;
    private String message;

    public FieldValidationError(String field, String message) {
        this.field = field;
        this.message = message;
    }

    public String getField() {
        return field;
    }

    public String getMessage() {
        return message;
    }
}
```

Este tipo de clase hace que tu respuesta sea más clara y más tipada.

## Un DTO para la respuesta completa

Por ejemplo:

```java
import java.util.List;

public class ValidationErrorResponse {

    private int status;
    private String error;
    private String message;
    private List<FieldValidationError> fields;

    public ValidationErrorResponse(int status, String error, String message, List<FieldValidationError> fields) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.fields = fields;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public List<FieldValidationError> getFields() {
        return fields;
    }
}
```

Esto ya te da una estructura mucho más profesional para responder errores de validación.

## Un handler más completo

```java
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> manejarErroresDeValidacion(MethodArgumentNotValidException ex) {
        List<FieldValidationError> fields = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new FieldValidationError(error.getField(), error.getDefaultMessage()))
                .toList();

        ValidationErrorResponse response = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "validation_error",
                "La petición contiene errores de validación",
                fields
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
```

Este ejemplo ya representa una solución bastante buena para muchísimas APIs.

## Cómo leer este handler

Podés leerlo así:

- si ocurre `MethodArgumentNotValidException`
- Spring entra a este handler
- el handler obtiene los errores de campo
- transforma cada uno a un objeto simple
- arma una respuesta general
- devuelve un `400 Bad Request` con detalle estructurado

Esta secuencia es muy importante porque muestra cómo pasar de una excepción técnica a un contrato útil para el cliente.

## Qué resultado podría generar

Para un request inválido, una respuesta así:

```json
{
  "status": 400,
  "error": "validation_error",
  "message": "La petición contiene errores de validación",
  "fields": [
    {
      "field": "nombre",
      "message": "no debe estar vacío"
    },
    {
      "field": "email",
      "message": "debe ser una dirección de email válida"
    },
    {
      "field": "edad",
      "message": "debe ser mayor que 0"
    }
  ]
}
```

Eso ya es muchísimo más consumible que un error genérico.

## Por qué esta estructura suele ser tan buena

Porque separa muy bien dos niveles:

### Error general
- status
- tipo de error
- mensaje general

### Detalle por campo
- nombre del campo
- motivo concreto del fallo

Esa separación funciona muy bien tanto para frontends como para otros servicios.

## Qué gana un frontend con esto

Muchísimo.

Puede, por ejemplo:

- marcar el input `nombre`
- marcar el input `email`
- mostrar el mensaje correcto debajo de cada campo
- seguir usando un mensaje general arriba del formulario
- evitar adivinanzas

Esta es una de las razones por las que este patrón aparece tanto en APIs serias.

## ¿Siempre hay errores de campo?

No necesariamente.

En muchos casos de validación de `@RequestBody`, sí habrá errores asociados a campos concretos.

Pero también pueden existir otros tipos de errores estructurales o globales.

Por eso conviene pensar que esta solución cubre muy bien el caso clásico de validación por campo, que es justamente uno de los más frecuentes.

## El orden de los errores

A veces puede interesarte mantener el orden en que Spring los reporta.
Otras veces puede darte igual.

No hace falta obsesionarse demasiado con eso al principio.

Lo importante es que la respuesta sea:

- completa
- consistente
- legible
- útil

El refinamiento fino del orden puede venir después si realmente lo necesitás.

## Qué mensaje conviene usar

Hay dos niveles de mensaje:

### Mensaje general
Por ejemplo:
- “La petición contiene errores de validación”
- “Uno o más campos son inválidos”

### Mensajes por campo
Por ejemplo:
- “no debe estar vacío”
- “debe ser una dirección de email válida”
- “debe ser mayor que 0”

Esta combinación suele ser muy equilibrada.

## ¿Conviene incluir el valor rechazado?

A veces sí, a veces no.

Podrías agregar algo como:

- campo
- valor rechazado
- mensaje

Pero hay que tener cuidado.

No siempre conviene exponer el valor rechazado, especialmente si:

- es sensible
- puede ser muy largo
- no aporta demasiado
- puede ensuciar la respuesta

Como regla inicial, devolver solo `field` y `message` suele ser una base bastante sana.

## Un ejemplo con valor rechazado, solo a nivel conceptual

```java
public class FieldValidationError {

    private String field;
    private Object rejectedValue;
    private String message;

    public FieldValidationError(String field, Object rejectedValue, String message) {
        this.field = field;
        this.rejectedValue = rejectedValue;
        this.message = message;
    }

    public String getField() {
        return field;
    }

    public Object getRejectedValue() {
        return rejectedValue;
    }

    public String getMessage() {
        return message;
    }
}
```

Esto puede ser útil en algunos contextos, pero conviene usarlo con criterio.

## Qué relación tiene esto con el tema anterior

Muy directa.

En el tema anterior viste la necesidad de “ordenar” los errores de validación.
En este tema estás viendo justamente una forma concreta de hacerlo.

Podrías resumirlo así:

- antes: Spring detecta que algo está mal
- ahora: vos decidís cómo traducir eso a una respuesta clara

Eso es un salto muy importante en calidad de API.

## Un ejemplo completo de punta a punta

### DTO

```java
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class RegistroRequest {

    @NotBlank
    private String nombre;

    @Email
    @NotBlank
    private String email;

    @Positive
    private int edad;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getEdad() {
        return edad;
    }

    public void setEdad(int edad) {
        this.edad = edad;
    }
}
```

### Controlador

```java
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/registro")
public class RegistroController {

    @PostMapping
    public String registrar(@Valid @RequestBody RegistroRequest request) {
        return "Registro válido";
    }
}
```

### Handler global

```java
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> manejarErroresDeValidacion(MethodArgumentNotValidException ex) {
        List<FieldValidationError> fields = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new FieldValidationError(error.getField(), error.getDefaultMessage()))
                .toList();

        ValidationErrorResponse response = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "validation_error",
                "La petición contiene errores de validación",
                fields
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
```

Esto ya es una base muy fuerte para cualquier API CRUD seria.

## Qué pasa con varios errores sobre el mismo campo

A veces, dependiendo de las anotaciones, podría haber más de una regla asociada al mismo campo.

Por ejemplo:

- `@NotBlank`
- `@Size(min = 3)`

sobre un mismo string.

No hace falta resolver todos los matices de ese caso desde el minuto uno.

Una buena base inicial suele ser devolver todos los errores que Spring reporte.
Más adelante, si hace falta, podés decidir si filtrás, agrupás o priorizás mensajes.

## Qué pasa con validaciones globales no atadas a un campo

También existen escenarios más avanzados donde la validación no está asociada solo a un campo concreto, sino al objeto o a una combinación de valores.

Eso también puede modelarse y manejarse, pero este tema se centra deliberadamente en el caso más frecuente y más útil al empezar:

> errores por campo dentro de DTOs validados.

## Una buena práctica: usar nombres de error estables

Por ejemplo:

- `validation_error`
- `not_found`
- `conflict`
- `internal_error`

Esto ayuda mucho porque el cliente puede reconocer categorías de error de forma estable, más allá del mensaje exacto que se muestre al usuario.

## Otra buena práctica: mantener un formato uniforme

Si ya tenés una estructura de error general para otras excepciones, conviene que la validación encaje dentro del mismo estilo.

Por ejemplo:

- siempre `status`
- siempre `error`
- siempre `message`
- y para validación, además `fields`

Eso hace que la API se sienta consistente.

## Qué no conviene hacer

No conviene devolver errores de validación así:

```json
{
  "message": "Bad request"
}
```

porque eso casi no ayuda.

Tampoco conviene algo caótico y demasiado técnico que cambie de forma impredecible según el caso.

La clave está en encontrar un formato:
- claro
- simple
- suficientemente rico
- estable

## Error común: dejar que cada endpoint arme su propia lista de errores manualmente

Eso destruye la ventaja del manejo centralizado.

Si cada controlador empieza a construir maps, listas y strings a su manera, volvés al caos inicial.

## Error común: no distinguir mensaje general de errores por campo

Si mezclás todo en una sola lista de strings sin estructura, el cliente tiene más trabajo para interpretar la respuesta.

Separar mensaje general y lista de field errors suele ser mucho más útil.

## Error común: devolver información sensible o innecesaria

El error de validación debe ser útil, pero no hace falta convertirlo en una filtración de detalles internos.

Conviene pensar siempre:
- qué le sirve realmente al cliente
- qué conviene no exponer

## Error común: considerar que con esto ya resolviste toda la estrategia de errores de la API

Esto resuelve muy bien un caso concreto e importante: validación de entrada.

Pero una estrategia completa de manejo de errores también incluye:

- not found
- conflict
- forbidden
- internal error
- errores de negocio
- errores técnicos

Por eso este tema es una pieza muy importante, pero forma parte de un sistema más grande.

## Relación con Spring Boot

Spring Boot te da acceso muy cómodo a los errores de validación del request, y combinado con `@ControllerAdvice` te permite transformarlos en respuestas mucho mejores para quien consume la API.

Eso es una de las formas más claras en las que el framework ayuda a construir backends limpios y profesionales sin tener que reinventar todo desde cero.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> capturar `MethodArgumentNotValidException` en un `@ControllerAdvice` y transformarla en una respuesta con lista de errores por campo permite que una API Spring Boot no solo rechace datos inválidos, sino que además le explique al cliente de forma precisa qué campos fallaron y por qué.

## Resumen

- Cuando falla la validación de un `@RequestBody`, Spring suele lanzar `MethodArgumentNotValidException`.
- Ese error puede manejarse de forma centralizada con `@ControllerAdvice`.
- Es muy útil construir una respuesta con un mensaje general y una lista de errores por campo.
- Esta estructura mejora mucho la experiencia del cliente de la API.
- Conviene mantener el formato claro, consistente y estable.
- Es una pieza clave para profesionalizar el contrato de error de una API.
- Este patrón encaja perfectamente con validación declarativa y manejo global de excepciones.

## Próximo tema

En el próximo tema vas a ver cómo crear tus propias excepciones de negocio y cuándo conviene lanzar una `NotFoundException`, una `ConflictException` u otras variantes personalizadas para que la capa de servicio exprese mejor lo que pasó sin depender de detalles HTTP en todos lados.
