---
title: "Qué respuesta devuelve Spring cuando la validación falla y cómo ordenar esos errores"
description: "Entender qué ocurre cuando un request no pasa la validación en Spring Boot, qué tipo de error genera el framework por defecto y cómo empezar a devolver respuestas de error más claras y útiles para el cliente."
order: 34
module: "Validación y manejo de errores"
level: "base"
draft: false
---

En el tema anterior viste cómo usar `@Valid` junto con anotaciones como `@NotBlank`, `@Email`, `@Min` o `@Positive` para rechazar datos inválidos de entrada.

Eso ya es un paso enorme.

Pero inmediatamente aparece otra pregunta muy importante:

> cuando la validación falla, ¿qué respuesta recibe el cliente?

Porque detectar un error no alcanza.

Una API también debería **comunicar bien** ese error.

No es lo mismo responder con algo vago o desordenado que devolver una estructura clara que le diga al cliente:

- qué salió mal
- en qué campo
- por qué razón
- qué tipo de error fue

Este tema es importante porque conecta dos piezas muy fuertes del diseño de APIs:

- validar correctamente
- devolver errores útiles

Una API madura no solo protege su entrada.
También sabe explicarle al cliente cuándo esa entrada no es válida.

## Qué pasa cuando la validación falla

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

Y este controlador:

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

Si el cliente manda algo como esto:

```json
{
  "nombre": "",
  "email": "correo-invalido",
  "edad": -5
}
```

el request no cumple la validación.

Entonces el método del controlador no sigue normalmente como si nada.

Spring detecta el problema y genera un error asociado al proceso de validación.

## La validación corta el flujo

Este punto es muy importante.

Cuando usás `@Valid` sobre un `@RequestBody`, la validación ocurre **antes** de que el método procese normalmente el request.

Eso significa que si el body es inválido:

- no entrás realmente al flujo feliz del endpoint
- no llegás a la lógica de negocio como si los datos fueran correctos
- el framework interrumpe el procesamiento normal y genera una respuesta de error

Esto es justamente lo que buscabas al validar temprano.

## Qué tipo de error genera Spring

A nivel conceptual, cuando falla la validación del request body, Spring construye una excepción asociada a esa falla de binding y validación.

No hace falta que memorices desde ya todos los nombres internos del framework, pero sí conviene saber que no es simplemente “un false”.
Se trata de un error formal dentro del procesamiento del request.

Muy frecuentemente, este escenario aparece asociado a excepciones del estilo de validación del body ya enlazado al objeto del controlador.

Más adelante vas a trabajar con manejo global de excepciones y ahí sí esos nombres internos van a importar más.

Por ahora, lo importante es entender el comportamiento general:

> el framework detecta la violación de restricciones y transforma eso en un error HTTP del lado del cliente.

## Por qué esto es bueno

Porque evita que tu método tenga que hacer manualmente todo esto:

- leer campo por campo
- revisar si están vacíos
- detectar errores
- cortar la ejecución
- inventar una respuesta de error desde cero en cada endpoint

En lugar de eso, Spring puede centralizar gran parte de ese proceso.

Esto vuelve la API:

- más limpia
- más consistente
- más mantenible
- más predecible

## Qué tipo de código HTTP suele devolverse

Cuando la validación de entrada falla, lo más natural es responder con un error del lado del cliente.

Y, en la práctica, eso suele expresarse con un `400 Bad Request`.

Tiene mucho sentido:

- el request llegó
- el servidor lo entendió lo suficiente como para validarlo
- pero los datos no cumplen las reglas esperadas

No es un `500`, porque no falló el servidor internamente.
Tampoco es un `404`, porque el problema no es que falte el recurso.
Es un request inválido.

## Por qué 400 encaja tan bien con validación fallida

Porque comunica algo muy concreto:

> el cliente mandó datos que no cumplen el contrato del endpoint.

Esa es exactamente la naturaleza del problema.

Por eso, cuando la validación de entrada falla, `400 Bad Request` suele ser una de las respuestas más razonables y comunes.

## Qué respuesta devuelve Spring por defecto

Si no personalizás nada, Spring Boot puede devolver una respuesta de error automática.

La forma exacta puede variar según la configuración y el stack, pero la idea general es que el cliente recibe:

- un status 400
- cierta información técnica o estructural sobre el error

Eso es útil porque ya existe una reacción automática.
No tenés que construirla desde cero para empezar.

Pero al mismo tiempo, en APIs reales suele aparecer una necesidad nueva:

> la respuesta por defecto puede no ser la más clara, estable o amigable para el cliente.

Y ahí entra el siguiente nivel de diseño.

## Por qué muchas veces no alcanza la respuesta por defecto

Porque una respuesta automática genérica puede ser:

- demasiado técnica
- poco uniforme
- difícil de consumir desde frontend
- poco clara para integraciones externas
- incómoda de leer
- inestable si cambia entre escenarios

Una API más profesional suele querer algo más explícito y controlado.

Por ejemplo, algo como:

```json
{
  "error": "validation_error",
  "message": "La petición contiene datos inválidos",
  "fields": [
    {
      "field": "nombre",
      "message": "no debe estar vacío"
    },
    {
      "field": "email",
      "message": "debe tener formato válido"
    }
  ]
}
```

Este tipo de estructura ya es mucho más útil para un cliente real.

## Qué significa “ordenar” los errores

Ordenar los errores no significa solo atraparlos.

Significa también:

- decidir qué estructura devolver
- mantener consistencia entre endpoints
- expresar claramente qué tipo de error fue
- separar mensaje general y detalle por campo
- evitar respuestas caóticas o demasiado internas

Dicho de otro modo:

> no alcanza con que la API falle correctamente; también conviene que falle de forma comprensible.

## Un ejemplo del problema si no ordenás nada

Imaginá un frontend que consume tu API.

Si ante errores de validación recibe una respuesta muy cruda o inconsistente, le cuesta:

- mostrar mensajes al usuario
- marcar campos inválidos
- distinguir errores de validación de otros errores
- reaccionar de forma estable

En cambio, si siempre recibe una estructura clara, el consumo mejora muchísimo.

## Qué información suele ser útil en un error de validación

Por ejemplo:

- un código general del error
- un mensaje general legible
- una lista de campos inválidos
- el motivo de cada error
- opcionalmente, el valor rechazado o metadata adicional si tiene sentido

No siempre necesitás todo eso, pero sí conviene pensar qué información sería útil para el consumidor de la API.

## Un primer modelo mental saludable

Podés pensar los errores de validación en dos niveles:

### 1. Mensaje general
Algo como:
- “La petición contiene errores de validación”
- “Hay campos inválidos en el request”

### 2. Errores por campo
Algo como:
- `nombre` → no debe estar vacío
- `email` → debe tener formato válido
- `precio` → debe ser positivo

Esta separación suele ser muy buena.

## Por qué conviene devolver errores por campo

Porque cuando la validación falla, el problema rara vez es solo uno.

Podría haber varios campos inválidos a la vez.

Por ejemplo:

```json
{
  "nombre": "",
  "email": "correo-malo",
  "edad": -5
}
```

Acá no tiene mucho sentido devolver un único mensaje genérico tipo:

```json
{
  "message": "Request inválido"
}
```

Eso es demasiado pobre.

El cliente necesita entender qué campos están mal y por qué.

## Qué todavía no estás haciendo

En este tema todavía no vas a construir la solución global definitiva para manejo de errores de toda la aplicación.

Eso viene muy naturalmente con herramientas como:

- `@ControllerAdvice`
- `@ExceptionHandler`

y otros mecanismos que vas a ver enseguida.

El objetivo ahora es entender bien el problema y la necesidad de diseño.

## Qué significa tener una respuesta de error consistente

Una API consistente intenta que los errores sigan una estructura parecida.

Por ejemplo:

- siempre hay un campo `error`
- siempre hay un campo `message`
- siempre hay `status`
- si corresponde, siempre hay una lista `fields`

Eso ayuda muchísimo a quien consume la API, porque no tiene que adivinar un formato distinto en cada controlador o en cada escenario.

## Un ejemplo de estructura razonable

Por ejemplo:

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
    }
  ]
}
```

Esto ya tiene varias virtudes:

- el status es claro
- el tipo de error es reconocible
- hay un mensaje general
- hay detalle por campo

Una respuesta así es mucho más útil que algo opaco o improvisado.

## Qué diferencia hay entre error de validación y otros errores

Esto es muy importante.

No todos los errores deben lucir igual ni significar lo mismo.

Por ejemplo:

### Error de validación
- el request vino mal
- falta o sobra algo en la entrada
- un campo no cumple restricciones
- suele ser `400`

### Recurso no encontrado
- lo pedido no existe
- suele ser `404`

### Falta de autenticación
- el cliente no está autenticado
- suele ser `401`

### Falta de permisos
- el cliente no está autorizado
- suele ser `403`

### Error interno
- algo falló en el servidor
- suele ser `500`

Ordenar los errores también implica distinguir estas familias y no meter todo en la misma bolsa.

## Qué pasa si no diferenciás bien los errores

El cliente recibe señales confusas.

Por ejemplo:

- un error de validación tratado como error interno
- un recurso no encontrado tratado como request inválido
- un conflicto tratado como 200 con un texto raro

Eso hace más difícil consumir la API y también más difícil debuguearla.

## Un objetivo muy sano para una API

Que el cliente pueda responder correctamente a preguntas como:

- ¿el error fue mío o del servidor?
- ¿qué campo está mal?
- ¿el recurso existe?
- ¿me falta autenticación?
- ¿hay un conflicto de negocio?
- ¿debería reintentar o corregir datos?

Cuanto más clara sea la respuesta de error, más fácil será eso.

## El controlador no debería inventar todos los errores manualmente

Podrías hacer algo como:

```java
@PostMapping("/usuarios")
public ResponseEntity<?> crear(@RequestBody UsuarioRequest request) {
    if (request.getNombre() == null || request.getNombre().isBlank()) {
        return ResponseEntity.badRequest().body("El nombre es obligatorio");
    }

    if (request.getEmail() == null || request.getEmail().isBlank()) {
        return ResponseEntity.badRequest().body("El email es obligatorio");
    }

    return ResponseEntity.ok("ok");
}
```

Pero eso tiene varios problemas:

- repetición
- respuestas inconsistentes
- controladores ruidosos
- mala escalabilidad
- difícil mantenimiento

La idea es que el controlador se mantenga razonablemente limpio y que el sistema tenga una forma más centralizada de traducir fallos de validación en respuestas útiles.

## Un ejemplo de intención más profesional

Lo ideal suele ser que el flujo sea este:

1. el DTO declara restricciones
2. `@Valid` valida automáticamente
3. Spring detecta la falla
4. un mecanismo centralizado traduce eso a una respuesta clara

Eso produce APIs más coherentes.

## Qué papel juega el cliente en todo esto

La validación de entrada y el formato de errores no son solo decisiones “internas del backend”.

Afectan directamente a:

- frontends web
- apps móviles
- integraciones con otros servicios
- herramientas de testing
- documentación viva de la API

Por ejemplo, un frontend puede necesitar:

- resaltar el campo `email`
- mostrar el mensaje correcto debajo del input
- diferenciar errores globales de errores específicos de campo

Si el backend no devuelve nada ordenado, eso se vuelve mucho más difícil.

## Un ejemplo práctico de consumo

Supongamos que el frontend recibe esto:

```json
{
  "error": "validation_error",
  "fields": [
    {
      "field": "email",
      "message": "debe tener formato válido"
    },
    {
      "field": "password",
      "message": "debe tener al menos 6 caracteres"
    }
  ]
}
```

Con eso puede:

- marcar el input email
- marcar el input password
- mostrar mensajes claros
- impedir continuar hasta corregir

Eso es muchísimo mejor que un simple:

```json
{
  "message": "Bad request"
}
```

## La validación automática no te quita criterio

Esto también es importante.

Que Spring detecte los errores automáticamente no significa que el diseño de la respuesta quede resuelto mágicamente.

Todavía hace falta criterio para decidir:

- qué estructura usar
- qué nivel de detalle devolver
- qué mensajes exponer
- cuánto contenido técnico mostrar
- cómo mantener consistencia

## No todo debería ser demasiado técnico

Una respuesta de error que expone demasiado detalle interno del framework puede ser poco útil o incluso poco conveniente.

Muchas veces conviene traducir el fallo técnico a una respuesta más estable y más pensada para el cliente.

Por ejemplo, en lugar de mandar una traza o una estructura interna rara, conviene algo más como:

- error
- status
- message
- fields

Esto hace la API más amigable y más sólida como contrato.

## Qué relación tiene esto con el manejo global de errores

Muy directa.

Este tema, en cierto sentido, prepara el terreno para el siguiente gran paso:

- centralizar errores
- manejar excepciones de forma uniforme
- devolver respuestas consistentes desde un solo lugar

Eso es exactamente lo que herramientas como `@ControllerAdvice` van a permitir más adelante.

## Un mapa mental muy útil

Podés pensar este bloque así:

### Tema 33
Cómo detectar datos inválidos.

### Tema 34
Qué pasa cuando esos datos inválidos llegan y cómo conviene comunicarlo.

Esa continuidad es muy importante.
Validar y comunicar errores son dos caras de la misma calidad de contrato.

## Qué conviene buscar en una buena respuesta de error

Una buena respuesta de error de validación suele tener estas virtudes:

- el status HTTP correcto
- un tipo de error reconocible
- un mensaje general claro
- detalle útil por campo cuando corresponde
- formato consistente
- poca dependencia de detalles internos del framework

No significa que haya una única estructura correcta universal.
Pero sí conviene apuntar a estas cualidades.

## Error común: dejar la respuesta por defecto sin revisar si le sirve al cliente

La respuesta automática del framework puede ser suficiente para arrancar, pero no siempre será ideal para una API que querés exponer o mantener seriamente.

Conviene mirarla críticamente y preguntarte:

- ¿esto le sirve al frontend?
- ¿esto le sirve a otra integración?
- ¿esto es estable como contrato?
- ¿esto es claro?

## Error común: inventar respuestas distintas en cada endpoint

Si cada controlador arma errores de validación a su manera, el sistema se vuelve inconsistente.

Por ejemplo:

- uno devuelve `message`
- otro devuelve `error`
- otro devuelve una lista
- otro devuelve un string
- otro devuelve un map improvisado

Eso complica muchísimo el consumo de la API.

## Error común: tratar errores de validación como errores internos

Si el cliente manda datos inválidos, la respuesta no debería comunicar que el servidor “reventó”.

Eso distorsiona completamente la semántica del error.

La validación fallida es, por lo general, un problema del request.
No un `500`.

## Error común: devolver solo un texto genérico

Mensajes como:

- “Error”
- “Bad request”
- “Request inválido”

sin más contexto, suelen quedarse cortos.

El cliente muchas veces necesita saber qué campo falló y por qué.

## Error común: mezclar detalles internos con mensajes para cliente

A veces una estructura técnica interna del framework no es la mejor respuesta para exponer tal cual.

Conviene pensar la API como contrato.
Y un contrato bueno suele priorizar claridad y estabilidad.

## Relación con Spring Boot

Spring Boot facilita muchísimo tanto la validación automática como la integración con mecanismos de manejo de errores.

Eso significa que el framework ya te da una base muy poderosa.

Pero la calidad final del contrato de error sigue dependiendo de cómo diseñes la respuesta que querés exponer hacia afuera.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando la validación falla en Spring Boot, el framework puede detener automáticamente el request y responder con un error del lado del cliente, pero para construir una API realmente buena conviene ordenar esas respuestas y devolver errores de validación claros, consistentes y útiles para quien consume el sistema.

## Resumen

- La validación fallida corta el flujo normal del endpoint.
- Este tipo de problema suele encajar naturalmente en `400 Bad Request`.
- Spring Boot puede devolver una respuesta automática, pero muchas veces conviene personalizarla.
- Una buena respuesta de validación debería ser clara, consistente y útil para el cliente.
- Suele ser muy valioso incluir detalle por campo cuando corresponde.
- Validar bien y comunicar bien el error forman parte del mismo problema de diseño.
- Este tema prepara el terreno para el manejo global de errores con herramientas más centralizadas.

## Próximo tema

En el próximo tema vas a ver cómo manejar excepciones de forma centralizada con `@ControllerAdvice` y `@ExceptionHandler`, y eso te va a permitir transformar errores dispersos en un sistema coherente de respuestas para toda la API.
