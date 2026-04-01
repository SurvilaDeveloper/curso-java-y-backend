---
title: "Cómo manejar excepciones de forma centralizada con @ControllerAdvice y @ExceptionHandler"
description: "Entender cómo centralizar el manejo de errores en Spring Boot usando @ControllerAdvice y @ExceptionHandler, para devolver respuestas consistentes sin llenar de lógica repetitiva cada controlador."
order: 35
module: "Validación y manejo de errores"
level: "base"
draft: false
---

En el tema anterior viste que cuando la validación falla, Spring puede cortar automáticamente el flujo del request y devolver un error del lado del cliente.

Eso ya es una gran ayuda.

Pero muy rápido aparece una necesidad más amplia:

- no solo querés manejar errores de validación
- también querés manejar recursos no encontrados
- conflictos de negocio
- excepciones personalizadas
- errores inesperados
- y todo eso de una forma consistente en toda la API

La pregunta entonces es:

> ¿cómo evitás que cada controlador termine lleno de `try/catch`, respuestas repetidas y formatos de error distintos?

Spring Boot y Spring MVC resuelven esto con una herramienta muy importante:

- `@ControllerAdvice`
- `@ExceptionHandler`

Este tema es clave porque te permite pasar de un manejo de errores disperso y manual a un sistema centralizado, más limpio y mucho más mantenible.

## El problema de manejar errores dentro de cada controlador

Imaginá algo así:

```java
@GetMapping("/usuarios/{id}")
public ResponseEntity<?> obtenerUsuario(@PathVariable Long id) {
    try {
        UsuarioResponse usuario = usuarioService.obtenerPorId(id);
        return ResponseEntity.ok(usuario);
    } catch (UsuarioNoEncontradoException e) {
        return ResponseEntity.status(404).body("Usuario no encontrado");
    } catch (Exception e) {
        return ResponseEntity.status(500).body("Error interno");
    }
}
```

Y en otro endpoint:

```java
@PostMapping("/usuarios")
public ResponseEntity<?> crearUsuario(@RequestBody UsuarioRequest request) {
    try {
        UsuarioResponse usuario = usuarioService.crear(request);
        return ResponseEntity.status(201).body(usuario);
    } catch (EmailDuplicadoException e) {
        return ResponseEntity.status(409).body("El email ya existe");
    } catch (Exception e) {
        return ResponseEntity.status(500).body("Error interno");
    }
}
```

Esto puede funcionar.

Pero rápidamente aparecen varios problemas:

- mucho código repetido
- controladores más ruidosos
- respuestas inconsistentes
- lógica de errores mezclada con lógica HTTP normal
- dificultad para mantener un formato uniforme

Ese es exactamente el tipo de problema que el manejo centralizado de excepciones viene a resolver.

## La idea general

Podés pensar el manejo centralizado así:

> en lugar de capturar y traducir errores en cada endpoint, dejás que las excepciones se propaguen y definís en un lugar común cómo debe responder la API cuando aparezcan.

Ese “lugar común” suele construirse con `@ControllerAdvice`.

Y las reglas concretas de traducción se definen con `@ExceptionHandler`.

## Qué es `@ExceptionHandler`

`@ExceptionHandler` sirve para asociar una excepción con una lógica de respuesta.

Por ejemplo, conceptualmente:

- si aparece `UsuarioNoEncontradoException`
- devolver `404`
- con cierto body de error

O:

- si aparece `EmailDuplicadoException`
- devolver `409`
- con cierto mensaje claro

La idea es traducir una excepción Java a una respuesta HTTP adecuada.

## Qué es `@ControllerAdvice`

`@ControllerAdvice` marca una clase que puede aplicar lógica transversal sobre controladores.

Uno de sus usos más importantes es justamente centralizar manejo de excepciones.

Dicho de forma simple:

> `@ControllerAdvice` te permite capturar errores de muchos controladores desde un solo lugar.

Eso hace que el sistema se vuelva mucho más limpio.

## La combinación entre ambos

Generalmente trabajan juntos así:

- `@ControllerAdvice` define la clase global
- `@ExceptionHandler` define cómo responder ante cada tipo de excepción

Por ejemplo:

```java
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsuarioNoEncontradoException.class)
    public ResponseEntity<String> manejarUsuarioNoEncontrado(UsuarioNoEncontradoException ex) {
        return ResponseEntity.status(404).body("Usuario no encontrado");
    }
}
```

Con esto, ya no hace falta capturar esa excepción manualmente dentro de cada controlador.

## Cómo cambia el controlador

Antes:

```java
@GetMapping("/usuarios/{id}")
public ResponseEntity<?> obtenerUsuario(@PathVariable Long id) {
    try {
        UsuarioResponse usuario = usuarioService.obtenerPorId(id);
        return ResponseEntity.ok(usuario);
    } catch (UsuarioNoEncontradoException e) {
        return ResponseEntity.status(404).body("Usuario no encontrado");
    }
}
```

Después:

```java
@GetMapping("/usuarios/{id}")
public ResponseEntity<UsuarioResponse> obtenerUsuario(@PathVariable Long id) {
    UsuarioResponse usuario = usuarioService.obtenerPorId(id);
    return ResponseEntity.ok(usuario);
}
```

Y si el servicio lanza `UsuarioNoEncontradoException`, el `@ControllerAdvice` se encarga de traducirla.

Esto deja el controlador mucho más claro.

## Por qué esto es tan valioso

Porque hace que cada parte del sistema vuelva a parecerse más a su responsabilidad natural.

- el controlador maneja interacción HTTP normal
- el servicio ejecuta lógica de negocio
- el manejador global traduce errores a respuestas HTTP

Eso es muchísimo más ordenado que repartir manejo de errores en todos lados.

## Un primer ejemplo completo

### Excepción personalizada

```java
public class UsuarioNoEncontradoException extends RuntimeException {

    public UsuarioNoEncontradoException(String message) {
        super(message);
    }
}
```

### Servicio

```java
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    public String obtenerNombre(Long id) {
        if (id.equals(999L)) {
            throw new UsuarioNoEncontradoException("No existe un usuario con id " + id);
        }

        return "Usuario " + id;
    }
}
```

### Controlador

```java
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<String> obtener(@PathVariable Long id) {
        String nombre = usuarioService.obtenerNombre(id);
        return ResponseEntity.ok(nombre);
    }
}
```

### Handler global

```java
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsuarioNoEncontradoException.class)
    public ResponseEntity<String> manejarUsuarioNoEncontrado(UsuarioNoEncontradoException ex) {
        return ResponseEntity.status(404).body(ex.getMessage());
    }
}
```

Este ejemplo ya muestra la idea completa funcionando.

## Qué gana el controlador con esto

Mucho.

Se vuelve más limpio porque ya no tiene que:

- capturar manualmente excepciones de negocio
- decidir el formato de error en cada método
- repetir bloques de `try/catch`
- mezclar lógica feliz con lógica de error

Eso mejora muchísimo la legibilidad.

## Qué gana el cliente de la API

También gana bastante.

Porque ahora resulta mucho más fácil que todas las respuestas de error tengan:

- la misma estructura
- los mismos campos
- el mismo estilo
- la misma semántica según el tipo de problema

Eso hace la API mucho más consistente y más fácil de consumir.

## No hace falta devolver solo String

Igual que con `ResponseEntity`, el handler puede devolver objetos de error estructurados.

Por ejemplo:

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

Y el handler:

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsuarioNoEncontradoException.class)
    public ResponseEntity<ApiErrorResponse> manejarUsuarioNoEncontrado(UsuarioNoEncontradoException ex) {
        ApiErrorResponse error = new ApiErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "not_found",
            ex.getMessage()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
```

Esto ya se parece mucho más a una API seria.

## Por qué conviene devolver un objeto de error

Porque te permite mantener una estructura uniforme.

Por ejemplo:

```json
{
  "status": 404,
  "error": "not_found",
  "message": "No existe un usuario con id 999"
}
```

Eso suele ser mucho más útil que un simple string suelto.

Además, deja la puerta abierta para agregar campos como:

- timestamp
- path
- fieldErrors
- traceId
- code
- details

Más adelante eso puede crecer bastante bien.

## Qué tipos de errores suelen centralizarse

Muy comúnmente:

- recurso no encontrado
- conflictos de negocio
- errores de validación
- errores de autenticación/autorización
- errores internos inesperados
- excepciones personalizadas del dominio

No todas se resuelven exactamente igual, pero centralizarlas ayuda muchísimo.

## Un ejemplo con conflicto de negocio

### Excepción

```java
public class EmailDuplicadoException extends RuntimeException {

    public EmailDuplicadoException(String message) {
        super(message);
    }
}
```

### Handler

```java
@ExceptionHandler(EmailDuplicadoException.class)
public ResponseEntity<ApiErrorResponse> manejarEmailDuplicado(EmailDuplicadoException ex) {
    ApiErrorResponse error = new ApiErrorResponse(
        409,
        "conflict",
        ex.getMessage()
    );

    return ResponseEntity.status(409).body(error);
}
```

Esto permite expresar mucho mejor un conflicto que si cada endpoint inventara su propia respuesta.

## También puede existir un handler más general

Además de manejar excepciones específicas, muchas veces se agrega un handler general para casos inesperados.

Por ejemplo:

```java
@ExceptionHandler(Exception.class)
public ResponseEntity<ApiErrorResponse> manejarErrorGeneral(Exception ex) {
    ApiErrorResponse error = new ApiErrorResponse(
        500,
        "internal_error",
        "Ocurrió un error interno inesperado"
    );

    return ResponseEntity.status(500).body(error);
}
```

Esto sirve como una red de contención para errores no previstos.

## Por qué un handler general puede ser útil

Porque evita que una excepción inesperada termine con una respuesta caótica o poco consistente.

No reemplaza el hecho de corregir bugs, pero sí ayuda a que la API degrade de forma más ordenada.

Eso es mejor para:

- clientes de la API
- debugging
- consistencia
- observabilidad

## Pero no conviene abusar del handler general

Si todo termina en un handler genérico, podés perder precisión.

Lo ideal suele ser:

- handlers específicos para errores bien conocidos
- un handler general como respaldo final

Eso mantiene el sistema expresivo sin quedarse sin red de contención.

## Un ejemplo con varios handlers

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsuarioNoEncontradoException.class)
    public ResponseEntity<ApiErrorResponse> manejarUsuarioNoEncontrado(UsuarioNoEncontradoException ex) {
        ApiErrorResponse error = new ApiErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "not_found",
            ex.getMessage()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(EmailDuplicadoException.class)
    public ResponseEntity<ApiErrorResponse> manejarEmailDuplicado(EmailDuplicadoException ex) {
        ApiErrorResponse error = new ApiErrorResponse(
            HttpStatus.CONFLICT.value(),
            "conflict",
            ex.getMessage()
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> manejarGeneral(Exception ex) {
        ApiErrorResponse error = new ApiErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "internal_error",
            "Ocurrió un error interno inesperado"
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

Esto ya da una idea bastante clara de cómo puede organizarse el manejo global.

## Qué pasa con los errores de validación

Conectando con el tema anterior, los errores de validación también suelen terminar siendo candidatos ideales para manejo centralizado.

Por ejemplo:

- si un `@Valid` falla
- en lugar de dejar una respuesta automática poco controlada
- podés interceptar esa excepción
- construir un formato propio y consistente

Eso hace que validación y manejo global de errores se lleven muy bien.

En el próximo tema seguramente profundizarás mucho más justo en ese tipo de caso.

## Qué relación tiene esto con el diseño de capas

Una de las ventajas más grandes de `@ControllerAdvice` es que evita mezclar responsabilidades.

Sin manejo centralizado, el controlador tiende a absorber cosas como:

- traducción de errores
- mapeo de excepciones
- construcción de respuestas de error
- decisiones repetitivas de status HTTP

Con manejo centralizado, la capa web queda bastante más ordenada.

## Un detalle importante: no es lo mismo capturar que manejar bien

Podrías capturar todo con `try/catch`, sí.

Pero manejar bien implica además:

- hacerlo de forma consistente
- no repetir código
- mantener respuestas uniformes
- dejar controladores limpios
- facilitar mantenimiento futuro

`@ControllerAdvice` no existe para “ahorrar escritura” solamente.
Existe para mejorar diseño y coherencia.

## Un buen patrón inicial

Un patrón bastante sano puede ser este:

- crear excepciones de negocio claras
- dejarlas subir desde el servicio cuando corresponda
- traducirlas globalmente a respuestas HTTP consistentes
- dejar el controlador centrado en el flujo feliz del endpoint

Eso da una base muy fuerte para crecer.

## Un ejemplo del antes y el después

### Antes

```java
@GetMapping("/usuarios/{id}")
public ResponseEntity<?> obtener(@PathVariable Long id) {
    try {
        return ResponseEntity.ok(usuarioService.obtener(id));
    } catch (UsuarioNoEncontradoException ex) {
        return ResponseEntity.status(404).body("No encontrado");
    }
}
```

### Después

```java
@GetMapping("/usuarios/{id}")
public ResponseEntity<UsuarioResponse> obtener(@PathVariable Long id) {
    return ResponseEntity.ok(usuarioService.obtener(id));
}
```

Y el error se resuelve globalmente.

La segunda versión suele ser mucho más limpia.

## Qué conviene devolver en el body del error

No hay una única estructura universal obligatoria, pero suele ser muy útil incluir al menos:

- `status`
- `error`
- `message`

Y para ciertos casos:
- `fields`
- `timestamp`
- `path`
- `details`

La clave es que la estructura sea consistente.

## Un ejemplo simple de error uniforme

```json
{
  "status": 404,
  "error": "not_found",
  "message": "No existe un usuario con id 999"
}
```

Y para validación, algo como:

```json
{
  "status": 400,
  "error": "validation_error",
  "message": "La petición contiene errores de validación",
  "fields": [
    {
      "field": "email",
      "message": "debe tener formato válido"
    }
  ]
}
```

Estas estructuras hacen que la API sea mucho más cómoda de consumir.

## Error común: capturar excepciones en cada endpoint

Ya lo vimos, pero vale repetirlo.

Es uno de los patrones que más ruido agrega cuando una API empieza a crecer.

Centralizar errores suele ser una mejora muy grande en legibilidad.

## Error común: tener un handler global pero devolver estructuras distintas para cada caso

La centralización ayuda, pero si cada handler devuelve algo completamente diferente sin criterio, seguís teniendo inconsistencia.

No alcanza con centralizar. También conviene diseñar bien el formato.

## Error común: usar un único handler para todo y perder semántica

Si todo termina mapeado a:

- mismo status
- mismo mensaje
- mismo tipo de error

entonces se pierde mucha expresividad del contrato.

Lo ideal es centralizar sin empobrecer el significado de cada caso.

## Error común: exponer mensajes internos poco convenientes

A veces una excepción interna tiene un mensaje demasiado técnico o poco apropiado para el cliente.

Por eso conviene pensar bien qué parte del mensaje exponés hacia afuera y qué parte preferís reservar para logs.

## Error común: meter lógica de negocio dentro del handler

El handler debería traducir errores a respuestas HTTP.
No debería convertirse en un lugar donde viva lógica de negocio compleja.

Su rol es de adaptación y coherencia transversal.

## Relación con Spring Boot

Spring Boot y Spring MVC integran muy bien este modelo de manejo de excepciones, y eso te permite construir APIs mucho más limpias sin inventar toda la infraestructura a mano.

Es una de esas piezas que cambian mucho la calidad del código cuando la aplicación empieza a crecer.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `@ControllerAdvice` y `@ExceptionHandler` permiten sacar el manejo de errores de cada controlador y centralizarlo en un solo lugar, haciendo que la API Spring Boot responda de forma más limpia, consistente y mantenible ante excepciones de negocio, validación o errores inesperados.

## Resumen

- `@ExceptionHandler` permite traducir excepciones a respuestas HTTP.
- `@ControllerAdvice` permite aplicar ese manejo de forma global sobre muchos controladores.
- Esta combinación evita repetir `try/catch` y respuestas de error en cada endpoint.
- Ayuda a devolver formatos de error consistentes.
- Es ideal para excepciones de negocio, validación y errores inesperados.
- Conviene combinar handlers específicos con uno general como respaldo.
- Centralizar errores mejora mucho la claridad y mantenibilidad de una API.

## Próximo tema

En el próximo tema vas a ver cómo capturar específicamente los errores de validación y devolver una lista ordenada de errores por campo, para que el cliente pueda saber exactamente qué dato falló y por qué.
