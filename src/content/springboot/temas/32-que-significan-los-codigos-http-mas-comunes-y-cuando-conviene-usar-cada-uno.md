---
title: "Qué significan los códigos HTTP más comunes y cuándo conviene usar cada uno"
description: "Entender qué comunican los códigos HTTP más frecuentes en una API Spring Boot y cómo elegir entre respuestas como 200, 201, 204, 400, 401, 403, 404, 409 o 500 según el resultado real de la operación."
order: 32
module: "Spring Web y APIs REST"
level: "base"
draft: false
---

En el tema anterior viste cómo usar `ResponseEntity` para devolver respuestas más expresivas.

Eso te permitió controlar:

- el cuerpo de la respuesta
- el código de estado HTTP
- los headers

Pero aparece una pregunta muy importante:

> si puedo elegir el status, ¿cómo sé cuál conviene devolver en cada caso?

Esa decisión no es menor.

Una API puede funcionar técnicamente, pero si responde con códigos HTTP poco precisos, el contrato se vuelve confuso para el cliente.

Por eso este tema es tan importante.

Los códigos HTTP no son “detalles secundarios” de una API.
Son parte central de la forma en que la API comunica qué pasó realmente.

## Qué representa un código HTTP

Cuando un cliente hace una petición a una API, el servidor no solo devuelve datos.

También devuelve un **status code**, es decir, un código HTTP que resume el resultado general de la operación.

Por ejemplo:

- si todo salió bien
- si se creó algo
- si no había nada que devolver
- si el cliente mandó algo inválido
- si el recurso no existe
- si hubo un conflicto
- si el servidor falló

Ese código ya transmite una señal importante antes incluso de mirar el body.

## Por qué esto importa tanto

Porque el cliente de tu API puede necesitar reaccionar distinto según el resultado.

Por ejemplo:

- si recibe `200`, quizá muestra datos
- si recibe `201`, quizá entiende que se creó un recurso
- si recibe `404`, quizá muestra “no encontrado”
- si recibe `401`, quizá redirige al login
- si recibe `409`, quizá informa que hubo conflicto
- si recibe `500`, quizá registra un fallo del servidor

Es decir:

> el código HTTP no solo describe el resultado; también guía el comportamiento del cliente.

## Un mal contrato HTTP puede arruinar una buena API

Podrías tener una lógica interna correcta pero responder siempre `200 OK`.

Por ejemplo:

- recurso no encontrado → `200`
- error del cliente → `200`
- conflicto de negocio → `200`
- fallo interno → `200`

Eso obligaría al cliente a adivinar todo leyendo el body.

No es una buena práctica.

HTTP ya tiene un lenguaje muy útil para expresar estados. Conviene aprovecharlo.

## La idea general de las familias de códigos

No hace falta memorizar todo el catálogo de HTTP, pero sí conviene entender las familias más comunes:

### 2xx
La operación fue exitosa en términos generales.

### 4xx
Hubo un problema del lado del cliente o de la petición.

### 5xx
Hubo un problema del lado del servidor.

Esa división ya da una brújula muy poderosa.

## Qué significa 200 OK

`200 OK` es probablemente el código más conocido.

Comunica, en términos simples:

> la petición fue exitosa y la respuesta devuelve contenido normal.

Suele usarse mucho en operaciones como:

- consultar un recurso
- listar datos
- obtener información
- actualizar algo y devolver resultado
- responder con contenido útil luego de una operación válida

## Ejemplo típico de 200

```java
@GetMapping("/usuarios/{id}")
public ResponseEntity<String> obtenerUsuario(@PathVariable Long id) {
    return ResponseEntity.ok("Usuario " + id);
}
```

Acá tiene sentido:

- la operación fue correcta
- hay un body útil
- no se creó nada nuevo
- no es un caso especial de “sin contenido”

## Cuándo conviene pensar primero en 200

Suele ser un buen punto de partida cuando:

- la operación salió bien
- querés devolver cuerpo
- no hay una semántica más específica como creación o ausencia de contenido

Es, en cierto modo, el status “éxito estándar con respuesta”.

## Qué significa 201 Created

`201 Created` expresa algo más específico:

> la petición fue exitosa y como resultado se creó un nuevo recurso.

Esto es especialmente útil en operaciones `POST` que generan algo nuevo.

## Ejemplo típico de 201

```java
@PostMapping("/usuarios")
public ResponseEntity<String> crearUsuario(@RequestBody UsuarioRequest request) {
    return ResponseEntity.status(201).body("Usuario creado");
}
```

O de forma más expresiva:

```java
import org.springframework.http.HttpStatus;

@PostMapping("/usuarios")
public ResponseEntity<String> crearUsuario(@RequestBody UsuarioRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body("Usuario creado");
}
```

## Por qué 201 comunica mejor que 200 al crear

Porque no solo dice que “todo salió bien”.

Dice algo más específico:

- la petición fue procesada exitosamente
- se generó un recurso nuevo

Eso hace que el contrato sea más preciso.

## Cuándo conviene 201

Suele encajar muy bien cuando:

- un `POST` crea algo nuevo
- la operación no es simplemente una consulta
- querés expresar claramente que hubo creación

A veces incluso conviene acompañarlo con un header `Location`, pero eso ya lo viste conceptualmente en el tema anterior.

## Qué significa 204 No Content

`204 No Content` comunica esto:

> la operación fue exitosa, pero no hay cuerpo para devolver.

Esto es muy útil cuando el éxito no necesita ir acompañado de un payload.

## Ejemplo típico de 204

```java
@DeleteMapping("/usuarios/{id}")
public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
    return ResponseEntity.noContent().build();
}
```

Acá tiene mucho sentido:

- la operación salió bien
- no hace falta devolver un body
- la API comunica éxito sin fabricar un texto artificial

## Cuándo suele ser útil 204

Suele aparecer mucho en:

- eliminaciones
- operaciones exitosas sin respuesta útil
- actualizaciones donde no querés devolver cuerpo
- acciones idempotentes que simplemente confirman éxito

## Diferencia entre 200 y 204

Esta diferencia es muy importante.

### 200 OK
- éxito
- hay body útil

### 204 No Content
- éxito
- no hay body

No son equivalentes.

Elegir entre uno y otro hace que el contrato sea más claro.

## Qué significa 400 Bad Request

`400 Bad Request` expresa algo como:

> la petición del cliente no es válida en su forma o contenido.

No significa necesariamente que el cliente sea “malo” en un sentido moral.
Significa que el request no cumple condiciones mínimas para ser aceptado.

## Casos típicos donde 400 tiene sentido

Por ejemplo:

- faltan datos obligatorios
- un parámetro tiene formato inválido
- el body viene mal formado
- un valor no puede convertirse al tipo esperado
- la estructura de la petición no cumple lo que el endpoint necesita

## Ejemplo simple de 400

```java
@PostMapping("/productos")
public ResponseEntity<String> crearProducto(@RequestBody ProductoRequest request) {
    if (request.getPrecio() < 0) {
        return ResponseEntity.badRequest().body("El precio no puede ser negativo");
    }

    return ResponseEntity.status(201).body("Producto creado");
}
```

Acá la petición del cliente trae un dato inválido.
No es un fallo interno del servidor.
Por eso 400 comunica mucho mejor el problema.

## Cuándo conviene 400 y cuándo no

Conviene 400 cuando el problema está en el request:

- estructura inválida
- dato inválido
- falta de información necesaria
- formato incorrecto

No conviene usarlo cuando el problema real es de autenticación, autorización o fallo interno del servidor.

## Qué significa 401 Unauthorized

`401 Unauthorized` suele comunicar:

> la petición requiere autenticación válida y el cliente no la proporcionó o no es aceptable.

Esto aparece cuando el cliente no está autenticado correctamente.

## Cómo pensar 401

No significa simplemente “no permitido”.

Más bien significa algo como:

- falta autenticación
- el token no está
- el token no es válido
- las credenciales no son correctas
- la sesión no existe o no es aceptable

Es una respuesta muy ligada a identidad/autenticación.

## Ejemplo conceptual de 401

Aunque normalmente esto lo manejarás más adelante con Spring Security, conceptualmente sería algo como:

- el endpoint requiere autenticación
- el cliente no la tiene
- la respuesta adecuada es `401`

Esto le comunica al cliente que el problema principal está en autenticarse, no en la forma del request.

## Qué significa 403 Forbidden

`403 Forbidden` expresa una idea distinta:

> el cliente está autenticado o identificado, pero no tiene permiso suficiente para realizar la operación.

Esta diferencia con 401 es muy importante.

## Diferencia entre 401 y 403

### 401
El problema es la autenticación.

### 403
El problema es la autorización.

Podés resumirlo así:

- `401` → “no estás autenticado correctamente”
- `403` → “aunque estés identificado, no tenés permiso para esto”

## Ejemplo conceptual de 403

Por ejemplo:

- un usuario común intenta entrar a un endpoint de admin
- el sistema sabe quién es
- pero no le permite esa operación

En ese caso, `403 Forbidden` comunica mejor el problema que `401`.

## Qué significa 404 Not Found

`404 Not Found` expresa:

> el recurso solicitado no existe o no puede encontrarse en ese contexto.

Es uno de los códigos más importantes para APIs que trabajan con recursos identificados por ruta.

## Casos típicos donde 404 tiene sentido

Por ejemplo:

- `GET /usuarios/999` y ese usuario no existe
- `PUT /productos/999` y ese producto no existe
- `DELETE /pedidos/999` y ese pedido no existe

En todos esos casos, el cliente apuntó a un recurso que no está disponible.

## Ejemplo simple de 404

```java
@GetMapping("/usuarios/{id}")
public ResponseEntity<String> obtenerUsuario(@PathVariable Long id) {
    if (id.equals(999L)) {
        return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok("Usuario " + id);
}
```

Esto ya comunica mucho mejor el resultado que un `200 OK` con un texto ambiguo.

## Qué significa 409 Conflict

`409 Conflict` se usa cuando la petición es entendible y válida en su forma, pero entra en conflicto con el estado actual del sistema.

Esta idea es muy importante.

No es lo mismo:

- petición mal formada → `400`
- conflicto con el estado actual → `409`

## Casos típicos donde 409 tiene sentido

Por ejemplo:

- querés crear un usuario con un email que ya existe
- querés registrar una categoría con un slug duplicado
- querés crear un recurso que viola una unicidad de negocio
- querés ejecutar una transición de estado incompatible con la situación actual

## Ejemplo conceptual de 409

```java
@PostMapping("/usuarios")
public ResponseEntity<String> crearUsuario(@RequestBody UsuarioRequest request) {
    if ("existente@email.com".equals(request.getEmail())) {
        return ResponseEntity.status(409).body("Ya existe un usuario con ese email");
    }

    return ResponseEntity.status(201).body("Usuario creado");
}
```

Acá el request está bien formado.
No falta nada.
No hay un problema técnico interno.
Pero hay un conflicto con el estado actual del sistema.

Por eso 409 expresa mucho mejor la situación que 400.

## Qué significa 500 Internal Server Error

`500 Internal Server Error` comunica:

> ocurrió un error inesperado del lado del servidor.

Este código representa fallos internos que no deberían atribuirse al cliente.

Por ejemplo:

- una excepción no controlada
- un bug
- una falla inesperada del backend
- una situación interna que impide completar la operación

## Cuándo conviene usar 500

En general, 500 es adecuado cuando:

- el servidor falló
- la petición del cliente no era el problema principal
- el sistema no pudo completar la operación por un error interno

Más adelante vas a ver cómo manejar mejor estas situaciones con manejo global de errores.
No siempre las vas a devolver manualmente desde cada controlador.

## Qué no conviene hacer con 500

No conviene usar 500 para cualquier cosa.

Por ejemplo, no sería una buena elección si:

- el cliente mandó datos inválidos
- faltan credenciales
- el recurso no existe
- hubo un conflicto de negocio

En esos casos, hay códigos 4xx mucho más expresivos.

Usar 500 para todo borra mucha información útil del contrato.

## Un mapa mental muy útil

Podés pensarlo así:

### 2xx
La operación salió bien.

- `200` → éxito con body
- `201` → recurso creado
- `204` → éxito sin body

### 4xx
El problema está del lado del cliente o de la petición.

- `400` → request inválido
- `401` → falta autenticación válida
- `403` → no tiene permiso
- `404` → recurso no encontrado
- `409` → conflicto con el estado actual

### 5xx
El problema está del lado del servidor.

- `500` → error interno inesperado

Este mapa ya sirve muchísimo para tomar buenas decisiones.

## Ejemplos comparativos

### Consultar algo que existe
- `200 OK`

### Crear algo nuevo correctamente
- `201 Created`

### Eliminar algo sin devolver cuerpo
- `204 No Content`

### Mandar un request inválido
- `400 Bad Request`

### No estar autenticado
- `401 Unauthorized`

### Estar autenticado pero sin permiso
- `403 Forbidden`

### Pedir un recurso inexistente
- `404 Not Found`

### Intentar crear algo que entra en conflicto
- `409 Conflict`

### Fallo interno del servidor
- `500 Internal Server Error`

## Un ejemplo de controlador didáctico

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @GetMapping("/{id}")
    public ResponseEntity<String> obtener(@PathVariable Long id) {
        if (id.equals(999L)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok("Usuario " + id);
    }

    @PostMapping
    public ResponseEntity<String> crear(@RequestBody UsuarioRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("El email es obligatorio");
        }

        if ("existente@email.com".equals(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("El email ya existe");
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Usuario creado");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (id.equals(999L)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
```

Este ejemplo ya permite ver varios status distintos según el resultado real.

## Por qué esto mejora tanto la API

Porque deja de ser una API que “solo devuelve cosas” y pasa a ser una API que comunica mejor lo que ocurrió.

Eso mejora:

- la integración con frontends
- la integración con otros backends
- la claridad del contrato
- el debugging
- la experiencia de consumo

## Cuándo conviene pensar primero en la semántica y después en el código

Una práctica muy sana es esta:

antes de escribir el return del controlador, preguntarte:

- ¿qué pasó realmente?
- ¿se creó algo?
- ¿no había nada para devolver?
- ¿faltó autenticación?
- ¿el recurso no existe?
- ¿hubo conflicto?
- ¿falló internamente el sistema?

La respuesta a esas preguntas te guía hacia el status adecuado.

## Un principio importante: no abuses del body para comunicar cosas que HTTP ya sabe decir

Por ejemplo, responder siempre:

```json
{
  "ok": false,
  "mensaje": "No encontrado"
}
```

con status `200` no es ideal.

Si el recurso no existe, HTTP ya tiene una forma mucho más clara de decirlo: `404`.

El body puede complementar, pero no debería reemplazar sistemáticamente la semántica del protocolo.

## Error común: responder 200 para todo

Ya lo vimos, pero vale insistir.

Es uno de los errores más frecuentes en APIs novatas.

El problema no es técnico solamente.
Es semántico.

El contrato pierde riqueza y el cliente tiene que adivinar demasiado.

## Error común: usar 400 para cualquier error de negocio

No todo problema del request es `400`.

Si el body está bien pero el estado del sistema genera un conflicto, `409` suele comunicar mejor.

Distinguir estos matices hace una gran diferencia en la calidad de la API.

## Error común: confundir 401 y 403

Esto pasa muchísimo.

Una regla simple para recordarlo:

- `401` → no autenticado correctamente
- `403` → autenticado, pero sin permisos

Esa diferencia va a volverse muy importante cuando llegues a Spring Security.

## Error común: usar 500 para errores que en realidad son del cliente

Si el cliente manda mal los datos, no tiene sentido culpar al servidor con un `500`.

Eso genera diagnósticos confusos y contratos pobres.

## Error común: obsesionarse con memorizar todos los códigos del universo

No hace falta.

Con entender y usar bien los más frecuentes ya podés construir APIs muchísimo mejores.

El objetivo no es transformarte en un catálogo humano de HTTP, sino aprender a elegir razonablemente entre los estados más comunes y expresivos.

## Relación con Spring Boot

Spring Boot hace muy fácil devolver distintos códigos con `ResponseEntity`, pero la calidad de esa decisión sigue dependiendo de tu criterio de diseño.

El framework te da las herramientas.
El significado lo construís vos al elegir el status correcto según el caso.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> elegir bien el código HTTP hace que una API Spring Boot comunique mucho mejor el resultado real de cada operación, permitiendo distinguir con claridad entre éxitos, errores del cliente, conflictos y fallos internos del servidor.

## Resumen

- Los códigos HTTP forman parte central del contrato de una API.
- `200` expresa éxito con body.
- `201` expresa creación exitosa de un recurso.
- `204` expresa éxito sin contenido.
- `400` indica una petición inválida.
- `401` indica falta de autenticación válida.
- `403` indica falta de permisos.
- `404` indica recurso no encontrado.
- `409` indica conflicto con el estado actual del sistema.
- `500` indica un fallo interno del servidor.

## Próximo tema

En el próximo tema vas a ver cómo validar datos de entrada con `@Valid` y anotaciones como `@NotBlank`, `@Email`, `@Min` o `@Positive`, para que la API empiece a rechazar automáticamente requests inválidos antes de que lleguen demasiado lejos.
