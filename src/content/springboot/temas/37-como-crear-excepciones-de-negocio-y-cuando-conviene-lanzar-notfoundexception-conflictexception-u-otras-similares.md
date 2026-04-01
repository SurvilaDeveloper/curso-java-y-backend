---
title: "Cómo crear excepciones de negocio y cuándo conviene lanzar NotFoundException, ConflictException u otras similares"
description: "Entender por qué conviene modelar errores de negocio con excepciones propias, cómo diseñarlas de forma clara y cómo ayudan a separar mejor la lógica del dominio de los detalles HTTP."
order: 37
module: "Validación y manejo de errores"
level: "base"
draft: false
---

En los temas anteriores viste cómo:

- validar datos de entrada
- capturar errores de validación
- centralizar el manejo de excepciones
- traducir fallos a respuestas HTTP más claras

Eso ya te da una base bastante sólida.

Pero aparece un problema nuevo, muy importante en aplicaciones reales:

> no todos los errores vienen de requests mal formados ni de fallos técnicos del framework.

A veces el request está bien armado, pero el problema está en la **lógica del negocio** o en el **estado actual del sistema**.

Por ejemplo:

- querés buscar un usuario que no existe
- querés crear un recurso con un email duplicado
- querés confirmar un pedido que ya está cancelado
- querés eliminar una categoría que todavía está en uso
- querés realizar una operación que el dominio no permite en ese momento

En todos esos casos, el error no es simplemente “input inválido”.
Es un error más semántico, más ligado a lo que el sistema representa.

Ahí entra una herramienta conceptual muy importante:

- crear **excepciones de negocio**
- lanzarlas desde donde corresponde
- y luego traducirlas de forma centralizada a respuestas HTTP adecuadas

## Qué problema resuelven las excepciones de negocio

Imaginá este servicio:

```java
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    public String obtenerNombre(Long id) {
        if (id.equals(999L)) {
            return null;
        }

        return "Usuario " + id;
    }
}
```

Esto puede parecer simple, pero trae varias preguntas incómodas:

- ¿qué significa exactamente `null`?
- ¿el usuario no existe?
- ¿hubo un error interno?
- ¿el servicio decidió que no había resultado?
- ¿el controlador tiene que adivinar qué pasó?

Ese tipo de ambigüedad suele hacer más confuso el diseño.

Ahora mirá esta alternativa:

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

Acá el servicio ya no devuelve algo ambiguo.
Está expresando claramente una situación del dominio:

> el usuario buscado no existe.

Eso hace el código mucho más expresivo.

## Qué es una excepción de negocio

Podés pensar una excepción de negocio como una excepción que representa una situación significativa del dominio o del flujo de la aplicación.

No habla tanto de un fallo técnico interno, sino de algo como:

- no se encontró el recurso esperado
- ya existe algo que no debería duplicarse
- la operación no está permitida por el estado actual
- cierta regla del negocio se violó
- el sistema entiende perfectamente el problema y quiere expresarlo con claridad

Dicho de forma simple:

> una excepción de negocio comunica que ocurrió un caso problemático pero comprensible dentro de la lógica del sistema.

## Por qué conviene modelarlas explícitamente

Porque mejoran muchísimo la claridad del código.

Cuando ves algo como:

- `UsuarioNoEncontradoException`
- `EmailDuplicadoException`
- `PedidoYaCanceladoException`
- `CategoriaEnUsoException`

ya entendés bastante bien qué pasó, incluso antes de leer el handler o el controlador.

Eso aporta:

- legibilidad
- expresividad
- mejor comunicación entre capas
- menos ambigüedad
- mejor separación de responsabilidades

## Qué diferencia hay con un error técnico

Esta distinción es muy importante.

### Error técnico
Suele representar problemas como:
- un null inesperado
- una falla de infraestructura
- una excepción interna del framework
- un bug
- un error de conexión
- una condición no prevista

### Error de negocio
Suele representar cosas como:
- el recurso no existe
- el email ya está registrado
- el pedido no puede pasar a ese estado
- no se puede cerrar una orden sin pago
- la operación entra en conflicto con reglas del dominio

Ambos pueden terminar siendo excepciones.
Pero no significan lo mismo.

## Por qué esto mejora la arquitectura

Porque cada capa puede empezar a expresar mejor su intención.

Por ejemplo:

- el servicio no tiene por qué devolver `ResponseEntity`
- tampoco tiene por qué saber de `404`, `409` o `400`
- lo que sí puede hacer es decir: “esto no existe”, “esto ya existe”, “esto no está permitido”

Esa traducción al lenguaje HTTP puede hacerse después, desde el manejo global de errores.

Esto separa mejor:

- lógica del negocio
- contrato HTTP

Y esa separación suele ser una excelente decisión.

## Un primer ejemplo: recurso no encontrado

### Excepción

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

### Handler global

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

Esto ya muestra una arquitectura muy sana:

- el servicio expresa el problema del dominio
- el advice traduce eso a `404 Not Found`

## Por qué esto es mejor que tirar `RuntimeException` genérica

Porque una excepción genérica dice muy poco.

Por ejemplo:

```java
throw new RuntimeException("Error");
```

Eso no comunica nada útil del negocio.

En cambio:

```java
throw new UsuarioNoEncontradoException("No existe un usuario con id " + id);
```

es mucho más claro.

La diferencia en legibilidad y mantenimiento es enorme.

## Cuándo conviene una NotFoundException

Suele tener mucho sentido cuando:

- el recurso buscado no existe
- la operación depende de un recurso ausente
- la ruta o el identificador apuntan a algo no disponible
- semánticamente la mejor respuesta HTTP será un `404`

Ejemplos típicos:

- usuario no encontrado
- producto no encontrado
- pedido no encontrado
- categoría no encontrada

## ¿Conviene una excepción genérica tipo ResourceNotFoundException o una por caso?

Esta es una muy buena pregunta.

Hay varias estrategias razonables.

### Opción 1: una excepción genérica
Por ejemplo:

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

Esto puede estar bien cuando querés una categoría amplia.

### Opción 2: una excepción específica por agregado o recurso
Por ejemplo:

- `UsuarioNoEncontradoException`
- `ProductoNoEncontradoException`
- `PedidoNoEncontradoException`

Esto suele ser más expresivo.

No hay una única respuesta universal.
Pero al empezar, muchas veces tener nombres específicos ayuda bastante a leer mejor la intención.

## Un segundo ejemplo: conflicto de unicidad

Supongamos que querés crear un usuario pero el email ya existe.

### Excepción

```java
public class EmailDuplicadoException extends RuntimeException {

    public EmailDuplicadoException(String message) {
        super(message);
    }
}
```

### Servicio

```java
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    public void crearUsuario(String email) {
        if ("existente@email.com".equals(email)) {
            throw new EmailDuplicadoException("Ya existe un usuario con ese email");
        }
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

Acá el servicio expresa un problema del dominio:
no se puede crear algo porque entraría en conflicto con el estado actual.

## Cuándo conviene una ConflictException

Suele encajar bien cuando:

- un valor que debería ser único ya existe
- el estado actual impide completar la operación
- la petición es comprensible, pero entra en conflicto con el sistema
- semánticamente `409 Conflict` expresa mejor el caso que `400`

Ejemplos típicos:

- email duplicado
- slug duplicado
- nombre único repetido
- transición incompatible de estado
- intento de crear algo que ya existe bajo una regla de unicidad

## Un tercer ejemplo: operación no permitida por estado

Por ejemplo, un pedido ya cancelado no puede volver a confirmarse.

### Excepción

```java
public class PedidoYaCanceladoException extends RuntimeException {

    public PedidoYaCanceladoException(String message) {
        super(message);
    }
}
```

### Servicio

```java
import org.springframework.stereotype.Service;

@Service
public class PedidoService {

    public void confirmarPedido(String estadoActual) {
        if ("CANCELADO".equals(estadoActual)) {
            throw new PedidoYaCanceladoException("No se puede confirmar un pedido cancelado");
        }
    }
}
```

Esto ya es claramente una situación de negocio.

No es un request mal formado.
No es un bug técnico.
Es una regla del dominio.

## Cuándo conviene crear excepciones tan específicas

Cuando la situación tiene sentido propio dentro del dominio y querés que el código la exprese con claridad.

Cuanto más importante y frecuente sea esa regla, más justificado suele estar modelarla de forma explícita.

## Una muy buena pregunta: ¿dónde deberían lanzarse estas excepciones?

Generalmente, donde realmente se conoce la regla del dominio.

Muchas veces eso es:

- en el servicio
- en una capa de aplicación
- en un agregado o lógica de dominio
- en algún componente que coordina la operación

Lo importante es que la excepción nazca donde el sistema realmente puede afirmar:

- esto no existe
- esto está duplicado
- esto no está permitido
- esto entra en conflicto

No conviene que el controlador tenga que inventar todas esas decisiones si pertenecen a una capa más profunda.

## Por qué no conviene acoplar el servicio a HTTP

Por ejemplo, esto sería un olor de diseño:

```java
@Service
public class UsuarioService {

    public ResponseEntity<?> obtenerUsuario(Long id) {
        if (id.equals(999L)) {
            return ResponseEntity.status(404).body("No encontrado");
        }

        return ResponseEntity.ok("Usuario");
    }
}
```

¿Por qué está mal conceptualmente?

Porque el servicio ya está hablando el lenguaje HTTP.
Y eso lo acopla innecesariamente a la web.

Es mucho más sano que el servicio diga:

- “esto no existe”
- “esto entra en conflicto”
- “esto no está permitido”

Y que la capa web traduzca eso a 404, 409 o lo que corresponda.

## Excepción de negocio no significa caos de excepciones

Tampoco se trata de crear una clase nueva para absolutamente cualquier cosa diminuta.

La idea no es inflar el proyecto con cientos de excepciones irrelevantes.

Conviene crear excepciones cuando:

- representan situaciones importantes
- mejoran la legibilidad
- expresan reglas significativas
- ayudan a mapear mejor la respuesta HTTP
- evitan ambigüedad

## Un criterio práctico muy sano

Podés pensar así:

- si el caso merece un nombre claro dentro del dominio, probablemente merece una excepción clara
- si el caso es muy genérico o poco significativo, quizá alcance otra estrategia
- si una excepción mejora mucho la semántica del flujo, suele valer la pena

## Un ejemplo de diseño más maduro

### Excepciones

```java
public class ProductoNoEncontradoException extends RuntimeException {
    public ProductoNoEncontradoException(String message) {
        super(message);
    }
}
```

```java
public class StockInsuficienteException extends RuntimeException {
    public StockInsuficienteException(String message) {
        super(message);
    }
}
```

### Servicio

```java
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    public void reservarStock(Long productoId, int cantidad) {
        if (productoId.equals(999L)) {
            throw new ProductoNoEncontradoException("No existe el producto " + productoId);
        }

        if (cantidad > 5) {
            throw new StockInsuficienteException("No hay stock suficiente para la cantidad solicitada");
        }
    }
}
```

### Handler

```java
@ExceptionHandler(ProductoNoEncontradoException.class)
public ResponseEntity<ApiErrorResponse> manejarProductoNoEncontrado(ProductoNoEncontradoException ex) {
    ApiErrorResponse error = new ApiErrorResponse(404, "not_found", ex.getMessage());
    return ResponseEntity.status(404).body(error);
}

@ExceptionHandler(StockInsuficienteException.class)
public ResponseEntity<ApiErrorResponse> manejarStockInsuficiente(StockInsuficienteException ex) {
    ApiErrorResponse error = new ApiErrorResponse(409, "conflict", ex.getMessage());
    return ResponseEntity.status(409).body(error);
}
```

Esto ya tiene una separación de responsabilidades muy saludable.

## Excepciones específicas vs jerarquías de excepciones

Más adelante podrías construir jerarquías más sofisticadas, por ejemplo:

- una excepción base del dominio
- subclasses específicas
- distintos handlers según familias de error

Pero al empezar no hace falta complicarlo tanto.

Una estrategia simple y clara suele ser suficiente:

- excepciones específicas con buen nombre
- handlers explícitos y legibles

## Qué ganás con esto en la práctica

Muchísimo.

Por ejemplo:

- código más expresivo
- mejor separación entre negocio y HTTP
- servicios más limpios
- controladores más livianos
- respuestas más consistentes
- posibilidad de mapear errores a distintos status con claridad

Es una de esas decisiones que mejoran mucho la sensación general de calidad del backend.

## Qué pasa con la validación de entrada

Conviene no mezclar todo.

Ya viste que los errores de validación de entrada suelen manejarse por otro camino más técnico, por ejemplo con `MethodArgumentNotValidException`.

Las excepciones de negocio suelen jugar en otra capa:

- el request es estructuralmente válido
- pero el caso no puede completarse por reglas del dominio o estado actual

Esa diferencia es muy importante.

## Un mapa mental muy útil

Podés pensar los errores así:

### Validación de entrada
- el cliente mandó datos inválidos
- suele terminar en `400`

### Not found
- el recurso no existe
- suele terminar en `404`

### Conflict
- el recurso existe o el estado actual choca con la operación
- suele terminar en `409`

### Error interno
- algo falló del lado del servidor
- suele terminar en `500`

Las excepciones de negocio viven mucho en las dos categorías del medio.

## Error común: devolver null o Optional vacío y que el controlador adivine demasiado

A veces eso funciona, pero otras veces termina haciendo que la semántica del caso quede demasiado dispersa.

Una excepción bien nombrada muchas veces comunica mejor que un `null` ambiguo.

## Error común: lanzar RuntimeException genérica para todo

Eso le quita mucho valor al modelo de errores.

Si todo es una excepción genérica, se pierde claridad y se vuelve más difícil mapear correctamente a respuestas HTTP expresivas.

## Error común: usar excepciones de negocio para errores técnicos

No conviene disfrazar fallos técnicos internos como si fueran reglas del dominio.

Si falló la base, si explotó una dependencia técnica, si hubo un bug inesperado, eso no necesariamente debería maquillarse como “not found” o “conflict”.

Mantener esa diferencia es parte de un diseño serio.

## Error común: meter mensajes poco cuidados

La excepción termina impactando en el mensaje que verá el cliente o al menos en el mensaje que usará el handler.

Por eso conviene cuidar nombres y mensajes.

No es lo mismo:

```java
throw new EmailDuplicadoException("Error")
```

que:

```java
throw new EmailDuplicadoException("Ya existe un usuario con ese email")
```

La segunda opción comunica muchísimo mejor.

## Error común: hacer depender el dominio de detalles de status HTTP

Por ejemplo, una excepción llamada:

- `Http404UserException`

sería una mala señal.

El dominio debería expresar significado de negocio.
La traducción a status HTTP pertenece a la capa web o al advice global.

## Una regla conceptual muy sana

Podés resumirlo así:

> el servicio debería hablar el lenguaje del negocio; el advice global debería hablar el lenguaje HTTP.

Esa frase suele ordenar mucho el diseño.

## Relación con Spring Boot

Spring Boot hace muy fácil traducir excepciones a respuestas HTTP, y eso permite que valga la pena modelar mejor las situaciones de error del dominio.

Cuando combinás:

- excepciones con buen nombre
- servicios que expresan reglas claras
- `@ControllerAdvice`
- `@ExceptionHandler`

obtenés una arquitectura bastante elegante para el manejo de errores.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> crear excepciones de negocio como `NotFoundException`, `ConflictException` o variantes más específicas permite que la capa de servicio exprese con claridad lo que realmente pasó en el dominio, mientras que la capa web puede traducir esas situaciones a respuestas HTTP apropiadas sin mezclar responsabilidades.

## Resumen

- No todos los errores son técnicos ni de validación de entrada.
- Muchas veces el problema real pertenece al dominio o al estado actual del sistema.
- Excepciones con nombres claros mejoran mucho la legibilidad y expresividad del código.
- Es sano que el servicio exprese el problema de negocio y que el advice global lo traduzca a HTTP.
- `NotFoundException` y `ConflictException` son patrones muy comunes.
- No conviene usar `RuntimeException` genérica para todo.
- Separar lenguaje de negocio y lenguaje HTTP mejora bastante la arquitectura.

## Próximo tema

En el próximo tema vas a ver cómo separar mejor la capa web, la capa de servicio y la capa de acceso a datos, y ahí empieza a consolidarse la arquitectura clásica de controller-service-repository que después vas a usar muchísimo con Spring Boot.
