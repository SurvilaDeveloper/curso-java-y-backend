---
title: "Cómo devolver respuestas más expresivas con ResponseEntity"
description: "Entender qué es ResponseEntity, cómo permite controlar el cuerpo, el código de estado y los headers de una respuesta HTTP, y por qué es una herramienta central en APIs Spring Boot más claras y profesionales."
order: 31
module: "Spring Web y APIs REST"
level: "base"
draft: false
---

En el tema anterior viste cómo usar `@RequestBody` para recibir JSON en el cuerpo de la petición.

Eso te permitió pasar de endpoints de consulta simples a endpoints que aceptan datos estructurados para crear o actualizar recursos.

Ahora aparece una pregunta muy importante del otro lado del intercambio:

> una vez que el servidor procesó la petición, ¿cómo conviene responder?

Porque una API no solo tiene que recibir bien.
También tiene que **responder bien**.

Y responder bien no significa solamente devolver un objeto o un texto.

En una API HTTP real, la respuesta también debería poder expresar con claridad cosas como:

- si la operación salió bien
- si el recurso fue creado
- si no había contenido para devolver
- si faltó algo
- si el recurso no existe
- si querés agregar headers
- si querés construir un contrato HTTP más explícito

Ahí entra una herramienta muy importante de Spring Boot y Spring Web:

`ResponseEntity`

## Qué problema resuelve `ResponseEntity`

Si en un controlador devolvés algo así:

```java
@GetMapping("/saludo")
public String saludar() {
    return "Hola";
}
```

Spring responde con ese cuerpo, y muchas veces eso está bien.

Pero a veces querés más control.

Por ejemplo:

- devolver `200 OK` explícitamente
- devolver `201 Created` al crear algo
- devolver `204 No Content` cuando no hay cuerpo
- devolver `404 Not Found`
- agregar un header
- devolver una respuesta completa y no solo “el contenido”

`ResponseEntity` existe justamente para eso.

Dicho de forma simple:

> `ResponseEntity` permite construir una respuesta HTTP más explícita y controlada.

## Qué es exactamente `ResponseEntity`

`ResponseEntity` es una clase que representa una respuesta HTTP completa.

Eso incluye, conceptualmente:

- el cuerpo de la respuesta
- el código de estado HTTP
- los headers

Mientras que devolver solo un objeto o un string suele enfocarse principalmente en el body, `ResponseEntity` te deja trabajar con la respuesta como una entidad más completa.

## La idea general

Con `ResponseEntity`, el método del controlador ya no devuelve solo “datos”.

Devuelve una representación más rica de la respuesta.

Ejemplo:

```java
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SaludoController {

    @GetMapping("/saludo")
    public ResponseEntity<String> saludar() {
        return ResponseEntity.ok("Hola desde Spring Boot");
    }
}
```

Acá no solo devolvés el texto `"Hola desde Spring Boot"`.
También estás diciendo explícitamente que la respuesta es un `200 OK`.

## Cómo leer ese ejemplo

```java
public ResponseEntity<String> saludar() {
    return ResponseEntity.ok("Hola desde Spring Boot");
}
```

Podés leerlo así:

- el método devuelve una respuesta HTTP completa
- el body es `"Hola desde Spring Boot"`
- el status es `200 OK`

Esto ya hace mucho más explícita la intención del endpoint.

## Por qué esto importa tanto

Porque en una API el código de estado HTTP forma parte central del contrato.

No es un detalle secundario.

Por ejemplo, no comunica lo mismo:

- `200 OK`
- `201 Created`
- `204 No Content`
- `400 Bad Request`
- `404 Not Found`

Aunque el cliente pudiera leer el body, el código HTTP ya transmite una señal muy importante sobre el resultado de la operación.

`ResponseEntity` te ayuda a expresar mejor esa señal.

## Cuándo no hace falta `ResponseEntity`

Esto también es importante.

No significa que tengas que devolver `ResponseEntity` en absolutamente todos los métodos.

Si el endpoint es muy simple y alcanza con devolver un objeto o un texto con el comportamiento por defecto, eso puede estar bien.

Por ejemplo:

```java
@GetMapping("/ping")
public String ping() {
    return "pong";
}
```

Este tipo de endpoint puede ser perfectamente válido sin `ResponseEntity`.

La clave es entender cuándo el contrato necesita más control.

## Cuándo sí empieza a tener mucho sentido

Suele tener mucho sentido cuando querés:

- elegir explícitamente el status HTTP
- devolver respuestas distintas según el caso
- agregar headers
- hacer el contrato más claro
- construir respuestas más profesionales y previsibles

## Primer caso clásico: devolver 200 OK explícito

```java
@GetMapping("/productos/{id}")
public ResponseEntity<String> obtenerProducto(@PathVariable Long id) {
    return ResponseEntity.ok("Producto " + id);
}
```

Esto es muy directo:

- status: `200 OK`
- body: `"Producto " + id`

## Segundo caso clásico: devolver 201 Created

Cuando una API crea un recurso, muchas veces lo más coherente no es responder con `200 OK`, sino con `201 Created`.

Por ejemplo:

```java
@PostMapping("/usuarios")
public ResponseEntity<String> crearUsuario(@RequestBody UsuarioRequest request) {
    return ResponseEntity.status(201).body("Usuario creado: " + request.getNombre());
}
```

Acá estás diciendo claramente:

- se creó algo nuevo
- el body puede incluir información útil
- el status expresa mejor la intención de la operación

## Otra forma habitual de escribirlo

También es común usar constantes de estado HTTP en lugar de números literales.

Por ejemplo:

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@PostMapping("/usuarios")
public ResponseEntity<String> crearUsuario(@RequestBody UsuarioRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
            .body("Usuario creado: " + request.getNombre());
}
```

Eso suele ser más legible que usar `201` directamente.

## Tercer caso clásico: 204 No Content

Hay endpoints donde la operación sale bien, pero no hace falta devolver body.

Por ejemplo, al eliminar un recurso.

```java
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UsuarioController {

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }
}
```

Acá la respuesta expresa:

- la operación fue correcta
- no hay cuerpo para devolver
- el status es `204 No Content`

## Por qué `204 No Content` tiene sentido en ciertos casos

Porque a veces devolver un mensaje como `"Usuario eliminado"` no es estrictamente necesario.

La API puede expresar suficientemente el éxito con el status HTTP.

Esto es muy útil para contratos más limpios y más alineados con el protocolo.

## Qué significa `ResponseEntity<Void>`

En este ejemplo:

```java
public ResponseEntity<Void> eliminarUsuario(...)
```

el tipo `Void` expresa que no esperás body.

No significa que el endpoint “no responde”.
Significa que la respuesta no lleva contenido útil en el cuerpo.

Eso encaja muy bien con casos como `204 No Content`.

## Cuarto caso clásico: 404 Not Found

Otro escenario muy típico es cuando el recurso buscado no existe.

Por ejemplo:

```java
@GetMapping("/usuarios/{id}")
public ResponseEntity<String> obtenerUsuario(@PathVariable Long id) {
    if (id.equals(999L)) {
        return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok("Usuario " + id);
}
```

Esto ya muestra algo muy valioso:

- una misma ruta puede devolver respuestas distintas según el caso
- el contrato HTTP refleja el resultado real de la operación

## Por qué esto es mejor que devolver siempre 200

Si el usuario no existe, devolver `200 OK` con un texto ambiguo no sería lo ideal.

HTTP ya tiene una forma expresiva de comunicar ese escenario: `404 Not Found`.

Usar `ResponseEntity` te permite aprovechar ese lenguaje del protocolo en lugar de esconderlo todo dentro del body.

## Quinto caso clásico: 400 Bad Request

En algunas situaciones querés indicar que la petición del cliente no fue válida.

Por ejemplo:

```java
@PostMapping("/productos")
public ResponseEntity<String> crearProducto(@RequestBody ProductoRequest request) {
    if (request.getPrecio() < 0) {
        return ResponseEntity.badRequest().body("El precio no puede ser negativo");
    }

    return ResponseEntity.status(HttpStatus.CREATED)
            .body("Producto creado");
}
```

Acá la respuesta expresa claramente que el problema no fue un fallo interno del servidor, sino una petición incorrecta del cliente.

Más adelante vas a ver validación formal con `@Valid`, pero este ejemplo ya muestra por qué `ResponseEntity` resulta tan útil.

## Un ejemplo más completo

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    @GetMapping("/{id}")
    public ResponseEntity<String> obtener(@PathVariable Long id) {
        if (id.equals(100L)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok("Categoría " + id);
    }

    @PostMapping
    public ResponseEntity<String> crear(@RequestBody CategoriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Categoría creada: " + request.getNombre());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }
}
```

Aunque todavía no hay servicios ni persistencia real, ya se ve una API más seria y expresiva.

## `ResponseEntity` también puede devolver objetos

No está limitado a strings.

Por ejemplo:

```java
@GetMapping("/saludo")
public ResponseEntity<MensajeResponse> saludar() {
    MensajeResponse response = new MensajeResponse("Hola");
    return ResponseEntity.ok(response);
}
```

Acá el body es un objeto.

Eso quiere decir que `ResponseEntity` no reemplaza el contenido.
Lo envuelve dentro de una respuesta HTTP más completa.

## Un DTO de respuesta simple

```java
public class MensajeResponse {

    private String mensaje;

    public MensajeResponse(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getMensaje() {
        return mensaje;
    }
}
```

Esto permite construir respuestas más estructuradas sin perder el control del status.

## `ResponseEntity` y headers

Otra ventaja importante es que también podés agregar headers.

Ejemplo conceptual:

```java
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

@GetMapping("/demo")
public ResponseEntity<String> demo() {
    HttpHeaders headers = new HttpHeaders();
    headers.add("X-App-Version", "1.0");

    return ResponseEntity.ok()
            .headers(headers)
            .body("Respuesta con header");
}
```

No es lo primero que más vas a usar, pero es muy útil saber que existe esa posibilidad.

## Cuándo puede servir agregar headers

Por ejemplo:

- headers informativos
- metadata técnica
- ubicación de un recurso creado
- cache control
- identificadores de trazabilidad
- respuestas más ricas para clientes específicos

No siempre los vas a necesitar, pero cuando aparecen, `ResponseEntity` se vuelve especialmente valioso.

## Un caso muy importante: Location al crear un recurso

Cuando se crea algo nuevo, una práctica muy buena es devolver `201 Created` y, cuando corresponde, indicar dónde quedó el recurso creado.

Conceptualmente, eso puede expresarse con un header `Location`.

Por ejemplo:

```java
import java.net.URI;
import org.springframework.http.ResponseEntity;

@PostMapping("/usuarios")
public ResponseEntity<String> crearUsuario(@RequestBody UsuarioRequest request) {
    URI location = URI.create("/usuarios/123");

    return ResponseEntity.created(location)
            .body("Usuario creado");
}
```

Esto ya se parece bastante a un contrato HTTP profesional.

## Por qué esto mejora el diseño de la API

Porque el cliente no solo sabe que la creación salió bien.
También puede saber dónde está el nuevo recurso.

Eso hace que la API sea más útil y más alineada con buenas prácticas HTTP.

## Diferencia entre devolver objeto y devolver ResponseEntity

Esta es una distinción muy importante.

### Devolver objeto directamente

```java
@GetMapping("/usuarios/{id}")
public UsuarioResponse obtenerUsuario(@PathVariable Long id) {
    return new UsuarioResponse(id, "Ana");
}
```

Acá Spring se encarga de responder, normalmente con un `200 OK`.

### Devolver `ResponseEntity<UsuarioResponse>`

```java
@GetMapping("/usuarios/{id}")
public ResponseEntity<UsuarioResponse> obtenerUsuario(@PathVariable Long id) {
    UsuarioResponse response = new UsuarioResponse(id, "Ana");
    return ResponseEntity.ok(response);
}
```

Acá el endpoint expresa explícitamente el status y deja la puerta abierta a variar la respuesta según el caso.

## Cuándo conviene uno y cuándo el otro

Una brújula útil puede ser esta:

- si la respuesta es simple y siempre igual en su comportamiento HTTP, devolver el objeto directo puede ser suficiente
- si necesitás controlar status, headers o distintos escenarios, `ResponseEntity` suele ser mejor

## Un ejemplo con ramas distintas

```java
@GetMapping("/productos/{id}")
public ResponseEntity<ProductoResponse> obtenerProducto(@PathVariable Long id) {
    if (id.equals(999L)) {
        return ResponseEntity.notFound().build();
    }

    ProductoResponse response = new ProductoResponse(id, "Notebook");
    return ResponseEntity.ok(response);
}
```

Acá ya se ve claramente por qué `ResponseEntity` da tanto valor:

- caso encontrado → `200 OK` con body
- caso no encontrado → `404 Not Found` sin body

Ese tipo de expresividad es muy difícil de lograr igual de claro si devolvés solo objetos directos.

## El método del controlador como constructor del contrato HTTP

Con `ResponseEntity`, el método del controlador empieza a parecerse más a un lugar donde se arma explícitamente el contrato de salida.

No solo decidís “qué devolver”.
También decidís:

- con qué status
- con qué headers
- con o sin body

Eso te obliga a pensar mejor la respuesta, y eso suele ser algo positivo.

## Qué todavía no estás resolviendo

Aunque `ResponseEntity` es poderosísimo, todavía no resuelve por sí solo temas como:

- validación automática
- manejo global de errores
- respuestas uniformes para excepciones
- estrategias centralizadas de error
- serialización avanzada
- convenciones globales de API

Más adelante vas a ver que muchas de esas cosas se combinan muy bien con `ResponseEntity`, pero este tema es el punto de partida.

## Un ejemplo didáctico bastante completo

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    @GetMapping("/{id}")
    public ResponseEntity<String> obtener(@PathVariable Long id) {
        if (id <= 0) {
            return ResponseEntity.badRequest().body("El id debe ser positivo");
        }

        if (id.equals(999L)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok("Producto " + id);
    }

    @PostMapping
    public ResponseEntity<String> crear(@RequestBody ProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Producto creado: " + request.getTitulo());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }
}
```

Este controlador ya comunica mucho mejor el resultado de cada operación.

## Qué ventaja tiene para el cliente de la API

Muchísima.

Cuando el contrato HTTP está bien expresado:

- el frontend sabe mejor qué pasó
- otra API cliente puede reaccionar correctamente
- los errores son más claros
- los flujos se vuelven más previsibles
- el consumo de la API es más profesional

No es solo una comodidad del backend.
También mejora muchísimo la experiencia de integración.

## Error común: devolver siempre 200 para todo

Este es uno de los errores más frecuentes.

Por ejemplo:

- recurso creado → `200`
- recurso no encontrado → `200`
- error del cliente → `200`

Eso empobrece el contrato HTTP y obliga al cliente a interpretar todo por el contenido del body.

Spring y HTTP ya te ofrecen un lenguaje mucho mejor para comunicar estados.

## Error común: usar ResponseEntity en todos lados sin necesidad real

También existe el error inverso.

No siempre hace falta envolver absolutamente toda respuesta en `ResponseEntity`.

Si un endpoint es muy simple y el comportamiento por defecto es suficiente, podés mantenerlo más liviano.

La clave es usar `ResponseEntity` cuando aporta claridad y control reales.

## Error común: esconder errores detrás de textos genéricos

Por ejemplo, responder siempre con:

```text
"Error"
```

sin cuidar el status HTTP ni el contrato.

Eso deja al cliente con poca información estructurada.

`ResponseEntity` ayuda a construir respuestas más útiles, pero requiere que pienses bien la semántica del caso.

## Error común: meter demasiada lógica condicional en el controlador

Aunque `ResponseEntity` te deja variar la respuesta, eso no significa que el controlador deba convertirse en una máquina enorme de decisiones.

Lo ideal sigue siendo:

- recibir el request
- delegar a un servicio
- traducir el resultado a una respuesta HTTP razonable

## Error común: no distinguir entre éxito con body y éxito sin body

No todo éxito tiene que devolver contenido.

Por eso es importante reconocer casos como `204 No Content`.

A veces una respuesta vacía comunica mejor que un string artificial.

## Relación con Spring Boot

Spring Boot hace muy fluido el uso de `ResponseEntity` porque se integra perfectamente con controladores REST, serialización JSON y el stack web en general.

Con muy poco código ya podés pasar de respuestas “básicas” a respuestas mucho más expresivas y profesionales.

Eso es una mejora enorme en la calidad de la API.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `ResponseEntity` permite construir respuestas HTTP más completas y expresivas en Spring Boot, controlando no solo el cuerpo sino también el código de estado y los headers, lo que mejora mucho la claridad y calidad del contrato de una API.

## Resumen

- `ResponseEntity` representa una respuesta HTTP completa.
- Permite controlar body, status y headers.
- Es muy útil para devolver `200`, `201`, `204`, `400`, `404` y otros estados con claridad.
- Puede devolver tanto strings como objetos.
- No siempre es obligatorio, pero resulta muy valioso cuando el contrato necesita más control.
- Mejora mucho la comunicación entre la API y sus clientes.
- Es una herramienta central para construir endpoints más profesionales en Spring Boot.

## Próximo tema

En el próximo tema vas a ver cómo funcionan los códigos HTTP más comunes en una API y cuándo conviene devolver `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409` o `500` según el tipo de resultado que quieras expresar.
