---
title: "Manejo de errores en Spring Boot"
description: "Cómo capturar errores y devolver respuestas consistentes, claras y útiles en una API Spring Boot."
order: 34
module: "Backend web"
level: "intermedio"
draft: false
---

## Introducción

En la lección anterior viste validaciones, o sea, cómo rechazar datos inválidos antes de que entren de lleno en la lógica del sistema.

Eso ya mejora bastante la calidad de una API.

Pero todavía falta una pieza importante:
¿qué pasa cuando algo falla dentro de la aplicación?

Por ejemplo:

- un recurso no existe
- una validación del dominio falla
- llega una request con datos incorrectos
- se produce una excepción inesperada
- un servicio lanza un error de negocio

Si no manejás bien esos casos, la API puede devolver respuestas desordenadas, inconsistentes o difíciles de entender.

Por eso el manejo de errores es una parte central del backend profesional.

## La idea general

Una API no solo tiene que responder bien cuando todo sale perfecto.

También tiene que responder bien cuando algo sale mal.

Eso significa, por ejemplo:

- usar status codes adecuados
- devolver mensajes claros
- mantener un formato consistente de error
- separar errores esperables de errores inesperados

## Qué problema aparece si no hacés nada

Si no definís una estrategia clara de errores, puede pasar que:

- algunas rutas devuelvan mensajes distintos para el mismo problema
- algunas excepciones rompan todo con respuestas confusas
- el frontend no sepa interpretar qué pasó
- el debugging se vuelva más difícil

## Qué significa “manejar errores bien”

Manejar errores bien suele implicar varias cosas a la vez:

- detectar el tipo de problema
- transformarlo en una respuesta HTTP razonable
- devolver una estructura clara
- evitar exponer detalles internos innecesarios
- mantener coherencia en toda la API

## Errores típicos en una API

En una API Spring Boot suelen aparecer errores como estos:

- `400 Bad Request` por datos inválidos
- `404 Not Found` cuando un recurso no existe
- `409 Conflict` en ciertos conflictos del dominio
- `401 Unauthorized` si falta autenticación
- `403 Forbidden` si falta permiso
- `500 Internal Server Error` si algo inesperado falla

## Qué no conviene hacer

No conviene responder errores “a mano y distinto” en cada controller sin una estrategia común.

Por ejemplo, si cada método inventa su propio formato de error, la API se vuelve inconsistente.

## `ResponseEntity` para errores puntuales

Una forma básica de devolver errores puntuales es usar `ResponseEntity`.

Ejemplo:

```java
@GetMapping("/{id}")
public ResponseEntity<Product> getProductById(@PathVariable Long id) {
    if (id <= 0) {
        return ResponseEntity.notFound().build();
    }

    Product product = new Product(id, "Notebook", 1250.50);
    return ResponseEntity.ok(product);
}
```

## Qué tiene de bueno esto

Sirve para casos simples y directos.

Pero a medida que el proyecto crece, no alcanza con manejar todo caso por caso dentro de cada endpoint.

Ahí conviene pasar a una estrategia centralizada.

## Manejo centralizado de errores

Spring Boot permite centralizar el manejo de errores usando clases anotadas con:

```java
@ControllerAdvice
```

o, muy comúnmente en APIs REST:

```java
@RestControllerAdvice
```

## Qué es `@RestControllerAdvice`

Es una forma de definir manejo global de excepciones para toda la API.

Dicho simple:

- captura excepciones lanzadas en controllers
- permite transformarlas en responses coherentes
- evita repetir manejo de errores en cada endpoint

## `@ExceptionHandler`

Dentro de un `@RestControllerAdvice`, podés usar métodos con `@ExceptionHandler` para capturar tipos concretos de excepciones.

Ejemplo:

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ex.getMessage());
    }
}
```

## Qué hace este ejemplo

Si en cualquier controller o service se lanza un `IllegalArgumentException`, Spring puede capturarlo acá y responder:

- status `400 Bad Request`
- body con el mensaje de error

## Por qué esto es mejor

Porque centraliza una regla común.

En vez de repetir en todos lados:

- `try/catch`
- mensajes a mano
- status code manual

definís una estrategia reusable.

## Ejemplo con service

### Service

```java
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    public Product getProductById(Long id) {
        if (id <= 0) {
            throw new IllegalArgumentException("El id debe ser mayor que cero");
        }

        return new Product(id, "Notebook", 1250.50);
    }
}
```

### Controller

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }
}
```

### Global handler

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ex.getMessage());
    }
}
```

## Qué gana este diseño

Ahora el controller queda limpio y el service puede lanzar una excepción clara.

La transformación a respuesta HTTP queda centralizada.

## Mejor que devolver solo strings

Aunque devolver un `String` de error puede servir al principio, en APIs reales conviene mucho más devolver una estructura JSON consistente.

Por ejemplo:

```json
{
  "error": "Bad Request",
  "message": "El id debe ser mayor que cero",
  "status": 400
}
```

## DTO de error

Una forma muy buena de ordenar esto es crear un DTO de error.

Ejemplo:

```java
public class ApiErrorResponse {
    private int status;
    private String error;
    private String message;

    public ApiErrorResponse(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
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
}
```

## Usar DTO de error en el handler

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ApiErrorResponse error = new ApiErrorResponse(
                400,
                "Bad Request",
                ex.getMessage()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
```

## Qué devuelve esto

Si algo falla, la API puede responder con un JSON consistente como este:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "El id debe ser mayor que cero"
}
```

## Por qué esto es muy valioso

Porque el frontend o cualquier cliente ya sabe qué estructura esperar cuando hay error.

Eso facilita muchísimo:

- consumo de la API
- debugging
- logging
- consistencia del proyecto

## Excepciones personalizadas

Otra mejora importante es no depender siempre de excepciones genéricas como `IllegalArgumentException`.

En muchos casos conviene crear excepciones del dominio.

Por ejemplo:

- `ResourceNotFoundException`
- `UserAlreadyExistsException`
- `InvalidOrderStateException`

## Ejemplo de excepción personalizada

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

## Uso en service

```java
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    public Product getProductById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("El id debe ser mayor que cero");
        }

        if (id.equals(999L)) {
            throw new ResourceNotFoundException("No se encontró el producto con id " + id);
        }

        return new Product(id, "Notebook", 1250.50);
    }
}
```

## Handler para excepción personalizada

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ApiErrorResponse error = new ApiErrorResponse(
                404,
                "Not Found",
                ex.getMessage()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ApiErrorResponse error = new ApiErrorResponse(
                400,
                "Bad Request",
                ex.getMessage()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
```

## Qué muestra esto

Muestra que distintos tipos de excepción pueden mapearse a distintas respuestas HTTP.

Eso hace mucho más clara la API.

## Manejar errores de validación

En la lección anterior viste Bean Validation con `@Valid`.

Cuando una validación falla, Spring puede lanzar excepciones específicas.

Una muy común en request bodies es `MethodArgumentNotValidException`.

Esto se puede capturar para devolver errores de validación más claros.

## Ejemplo básico

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        ApiErrorResponse error = new ApiErrorResponse(
                400,
                "Bad Request",
                "La request tiene errores de validación"
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
```

## Ir un paso más allá con detalles de validación

Muchísimas APIs devuelven no solo un mensaje genérico, sino el detalle de qué campos fallaron.

Por ejemplo:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "La request tiene errores de validación",
  "details": {
    "username": "El username es obligatorio",
    "email": "El email no es válido"
  }
}
```

Eso es muy útil para el cliente.

## DTO de error más rico

```java
import java.util.Map;

public class ValidationErrorResponse {
    private int status;
    private String error;
    private String message;
    private Map<String, String> details;

    public ValidationErrorResponse(int status, String error, String message, Map<String, String> details) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.details = details;
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

    public Map<String, String> getDetails() {
        return details;
    }
}
```

## Handler con detalle de campos

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> details = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error ->
                details.put(error.getField(), error.getDefaultMessage())
        );

        ValidationErrorResponse response = new ValidationErrorResponse(
                400,
                "Bad Request",
                "La request tiene errores de validación",
                details
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
```

## Excepción genérica de respaldo

También suele ser útil tener un handler más general para errores inesperados.

Ejemplo:

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex) {
        ApiErrorResponse error = new ApiErrorResponse(
                500,
                "Internal Server Error",
                "Ocurrió un error inesperado"
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

## Por qué esto conviene

Porque evita que errores inesperados rompan la API con respuestas caóticas o demasiado expuestas.

## Cuidado con exponer demasiados detalles

En desarrollo puede ser tentador devolver el mensaje real de toda excepción.

Pero en producción, eso a veces puede exponer detalles internos que no conviene mostrar.

Por eso muchas veces:

- se loguea el detalle real
- se devuelve al cliente un mensaje más controlado

## Buenas prácticas iniciales

## 1. Mantener formato de error consistente

Las respuestas de error deberían tener una estructura predecible.

## 2. Usar excepciones del dominio cuando aporten claridad

Por ejemplo:
`ResourceNotFoundException`.

## 3. Separar errores de validación de errores inesperados

No todo error debería terminar como `500`.

## 4. No esconder completamente el problema

El cliente necesita entender qué pasó, al menos a un nivel razonable.

## 5. Evitar detalles internos innecesarios en producción

La API no debería filtrar información sensible del sistema.

## Ejemplo completo

### DTO de error

```java
public class ApiErrorResponse {
    private int status;
    private String error;
    private String message;

    public ApiErrorResponse(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
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
}
```

### Excepción personalizada

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

### Service

```java
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    public Product getProductById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("El id debe ser mayor que cero");
        }

        if (id.equals(999L)) {
            throw new ResourceNotFoundException("Producto no encontrado");
        }

        return new Product(id, "Notebook", 1250.50);
    }
}
```

### Controller

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }
}
```

### Global handler

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiErrorResponse(404, "Not Found", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiErrorResponse(400, "Bad Request", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiErrorResponse(500, "Internal Server Error", "Ocurrió un error inesperado"));
    }
}
```

## Qué demuestra este ejemplo

Demuestra una estrategia bastante sana para empezar:

- service lanza excepciones claras
- controller queda limpio
- handler global traduce errores a HTTP
- respuestas de error mantienen formato consistente

## Relación con lo anterior

Esta lección conecta directamente con:

- exceptions → cómo funcionan las excepciones en Java
- validaciones → cómo rechazar requests inválidas
- controllers → cómo se reciben requests y se devuelven responses
- services → dónde suele vivir parte importante de la lógica que puede fallar

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a middlewares globales de error o a handlers centrales de excepciones. En Spring Boot esto se expresa mucho con `@RestControllerAdvice`.

### Si venís de Python

Puede parecerse a mecanismos globales para capturar y transformar excepciones en respuestas HTTP. En Java y Spring esto suele quedar muy ordenado con handlers tipados por excepción.

## Errores comunes

### 1. Manejar errores distinto en cada endpoint

Eso vuelve la API inconsistente.

### 2. Responder siempre `500` para todo

Muchos errores son realmente `400` o `404`, no errores internos del servidor.

### 3. Devolver solo strings sueltos

Puede servir para empezar, pero en APIs reales conviene un JSON consistente.

### 4. Exponer detalles internos sensibles

No siempre conviene devolver el mensaje técnico exacto de una excepción inesperada.

### 5. No separar errores de validación de errores del dominio

Cada uno comunica cosas distintas y suele merecer tratamiento diferente.

## Mini ejercicio

Diseñá un manejo de errores para una API de usuarios que contemple al menos estos casos:

1. `IllegalArgumentException` → `400 Bad Request`
2. `ResourceNotFoundException` → `404 Not Found`
3. error genérico inesperado → `500 Internal Server Error`

Intentá usar:

- un DTO de error
- una excepción personalizada
- un `@RestControllerAdvice`

## Ejemplo posible

```java
public class ApiErrorResponse {
    private int status;
    private String error;
    private String message;

    public ApiErrorResponse(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
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
}
```

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

## Resumen

En esta lección viste que:

- una buena API también debe manejar bien los errores
- `@RestControllerAdvice` permite centralizar el manejo de excepciones
- `@ExceptionHandler` permite traducir excepciones a responses HTTP claras
- usar DTOs de error ayuda a mantener un formato consistente
- los errores de validación, de dominio y los inesperados no deberían tratarse todos igual
- una estrategia ordenada de errores mejora muchísimo la calidad profesional de la API

## Siguiente tema

En la próxima lección conviene pasar a **repository**, porque después de ordenar bastante bien entrada, lógica y errores, el siguiente paso natural es conectar la aplicación con persistencia y separar mejor el acceso a datos.
