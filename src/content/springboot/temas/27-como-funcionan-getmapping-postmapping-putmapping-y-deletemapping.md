---
title: "Cómo funcionan @GetMapping, @PostMapping, @PutMapping y @DeleteMapping"
description: "Entender cómo se usan los verbos HTTP más comunes en Spring Boot y qué intención representa cada uno dentro del diseño de una API."
order: 27
module: "Spring Web y APIs REST"
level: "base"
draft: false
---

En el tema anterior viste cómo crear un endpoint HTTP básico con `@RestController` y `@GetMapping`.

Eso te permitió dar el primer paso real dentro del desarrollo web con Spring Boot.

Pero una API no vive solo de endpoints GET.

Cuando una aplicación empieza a exponer operaciones reales, aparece una necesidad más rica:

- a veces querés consultar datos
- a veces querés crear algo nuevo
- a veces querés reemplazar o actualizar
- a veces querés eliminar
- a veces querés expresar con claridad qué está intentando hacer el cliente

Ahí entran los **verbos HTTP** y sus anotaciones asociadas en Spring Boot.

Este tema es importante porque te ayuda a entender que una API no se diseña solo con URLs.
También se diseña con la **intención del método HTTP**.

## La idea general

En HTTP, no alcanza con saber a qué ruta se llama.

También importa **cómo** se la llama.

Por ejemplo, no significa lo mismo hacer:

- `GET /usuarios`
- `POST /usuarios`
- `PUT /usuarios/10`
- `DELETE /usuarios/10`

Aunque las rutas se parezcan, la intención cambia muchísimo.

Spring Boot refleja esa diferencia con anotaciones como:

- `@GetMapping`
- `@PostMapping`
- `@PutMapping`
- `@DeleteMapping`

Cada una representa un tipo de operación habitual dentro de una API.

## Por qué esto importa tanto

Porque una API bien diseñada no solo funciona: también comunica correctamente qué está haciendo.

Cuando usás bien los verbos HTTP:

- el contrato es más claro
- el cliente entiende mejor la intención
- la API se vuelve más consistente
- los recursos se modelan mejor
- el sistema se siente más natural de consumir

En otras palabras:

> los verbos HTTP ayudan a que la API no sea solo una colección de rutas, sino una interfaz coherente.

## Qué representa `@GetMapping`

`@GetMapping` se usa para manejar peticiones HTTP GET.

La intención más habitual de GET es:

- consultar
- leer
- recuperar información
- obtener recursos existentes

Ejemplo:

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SaludoController {

    @GetMapping("/saludo")
    public String saludar() {
        return "Hola";
    }
}
```

Acá el cliente no está creando ni modificando nada.
Solo está pidiendo una respuesta.

## Cómo pensar GET

Una forma sana de pensarlo es esta:

> GET se usa cuando querés obtener datos.

Por ejemplo:

- obtener todos los usuarios
- obtener un producto por id
- consultar el estado de un pedido
- listar categorías
- ver información de una cuenta

GET suele ser el verbo más natural para operaciones de lectura.

## Ejemplos típicos de GET

```text
GET /usuarios
GET /usuarios/10
GET /productos
GET /productos/25
GET /pedidos/100
```

Todos esos casos representan consultas.

Aunque lo que se devuelve pueda variar, la intención general es la misma: recuperar información.

## Qué representa `@PostMapping`

`@PostMapping` se usa para manejar peticiones HTTP POST.

La intención más habitual de POST es:

- crear un nuevo recurso
- enviar datos al servidor para procesarlos
- iniciar una operación que genera algo nuevo

Ejemplo básico:

```java
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UsuarioController {

    @PostMapping("/usuarios")
    public String crearUsuario() {
        return "Usuario creado";
    }
}
```

Acá ya no se está consultando algo existente.
Se está intentando crear algo nuevo.

## Cómo pensar POST

Una buena regla inicial es esta:

> POST suele usarse para crear.

Por ejemplo:

- crear un usuario
- registrar un pedido
- generar una orden
- enviar un formulario
- iniciar un proceso que crea un recurso

Más adelante vas a ver que POST también puede aparecer en algunos escenarios más flexibles, pero para empezar esta idea es muy útil y bastante sólida.

## Ejemplos típicos de POST

```text
POST /usuarios
POST /productos
POST /pedidos
POST /categorias
```

En todos esos casos, el cliente manda información para generar algo nuevo en el servidor.

## Qué representa `@PutMapping`

`@PutMapping` se usa para manejar peticiones HTTP PUT.

La intención más habitual de PUT es:

- reemplazar
- actualizar de forma completa
- enviar una nueva representación de un recurso existente

Ejemplo:

```java
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UsuarioController {

    @PutMapping("/usuarios/10")
    public String actualizarUsuario() {
        return "Usuario actualizado";
    }
}
```

Acá la idea ya no es crear uno nuevo ni consultar.
La intención es modificar un recurso existente.

## Cómo pensar PUT

Una forma útil de pensarlo al empezar es esta:

> PUT suele usarse para actualizar un recurso de manera más completa.

Por ejemplo:

- actualizar un usuario existente
- reemplazar los datos de un producto
- editar una categoría
- actualizar una configuración de un recurso

Más adelante vas a profundizar en diferencias más finas entre PUT y PATCH, pero por ahora lo importante es captar la idea de actualización.

## Ejemplos típicos de PUT

```text
PUT /usuarios/10
PUT /productos/25
PUT /categorias/3
PUT /pedidos/100
```

Todos estos casos apuntan a modificar un recurso ya identificado.

## Qué representa `@DeleteMapping`

`@DeleteMapping` se usa para manejar peticiones HTTP DELETE.

La intención más habitual de DELETE es:

- eliminar
- borrar
- quitar un recurso existente

Ejemplo:

```java
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UsuarioController {

    @DeleteMapping("/usuarios/10")
    public String eliminarUsuario() {
        return "Usuario eliminado";
    }
}
```

Acá la intención es muy clara: se quiere eliminar el recurso identificado por esa ruta.

## Cómo pensar DELETE

Una buena regla simple es esta:

> DELETE se usa cuando querés borrar un recurso existente.

Por ejemplo:

- eliminar un usuario
- borrar un producto
- quitar una categoría
- cancelar o eliminar un recurso expuesto por la API

## Ejemplos típicos de DELETE

```text
DELETE /usuarios/10
DELETE /productos/25
DELETE /pedidos/100
```

En todos esos casos, la operación apunta a remover algo existente.

## La ruta también importa, no solo el verbo

Es muy importante entender que la intención de una API surge de la combinación de:

- ruta
- verbo HTTP

Por ejemplo:

```text
GET /usuarios
POST /usuarios
```

La ruta base es la misma: `/usuarios`.

Pero el verbo cambia completamente la intención.

- `GET /usuarios` → listar o consultar usuarios
- `POST /usuarios` → crear un nuevo usuario

Esto muestra algo clave:

> el diseño de una API no se expresa solo en la URL, sino también en el método HTTP.

## Un ejemplo completo con varios verbos

```java
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @GetMapping
    public String listarUsuarios() {
        return "Lista de usuarios";
    }

    @PostMapping
    public String crearUsuario() {
        return "Usuario creado";
    }

    @PutMapping("/{id}")
    public String actualizarUsuario() {
        return "Usuario actualizado";
    }

    @DeleteMapping("/{id}")
    public String eliminarUsuario() {
        return "Usuario eliminado";
    }
}
```

Este ejemplo ya muestra una idea muy importante: una misma clase puede representar un recurso y distintas operaciones sobre él.

## Un recurso y varias operaciones

Ese es el patrón más natural al empezar a modelar APIs.

Por ejemplo:

- `/usuarios`
- `/productos`
- `/pedidos`
- `/categorias`

Cada recurso puede exponer varias operaciones según el verbo.

Eso deja la API mucho más ordenada que inventar rutas completamente arbitrarias para cada acción.

## Un ejemplo de diseño más desordenado

```text
GET /listar-usuarios
POST /crear-usuario
POST /actualizar-usuario
POST /borrar-usuario
```

Esto puede funcionar técnicamente, pero pierde mucha expresividad del modelo HTTP.

Es más claro y más coherente algo como:

```text
GET /usuarios
POST /usuarios
PUT /usuarios/10
DELETE /usuarios/10
```

Ese estilo aprovecha mejor la semántica del protocolo.

## Qué aporta esta forma de diseñar

Cuando una API sigue este modelo:

- el cliente entiende mejor el contrato
- las rutas son más uniformes
- el sistema escala con más orden
- se vuelve más natural documentar y consumir la API

Por eso, entender bien estos verbos es mucho más que aprender anotaciones.
Es empezar a pensar en diseño de APIs.

## `@RequestMapping` como base común

Como ya viste antes, es muy habitual usar `@RequestMapping` a nivel de clase para definir la ruta base del recurso.

Por ejemplo:

```java
@RestController
@RequestMapping("/productos")
public class ProductoController {
}
```

Y dentro de esa clase:

- `@GetMapping`
- `@PostMapping`
- `@PutMapping("/{id}")`
- `@DeleteMapping("/{id}")`

Esto mantiene el controlador mucho más coherente.

## El recurso plural suele ser una convención cómoda

Aunque no es una ley obligatoria, suele ser muy común usar nombres plurales para los recursos.

Por ejemplo:

- `/usuarios`
- `/productos`
- `/pedidos`

Eso ayuda a pensar la ruta como una colección o tipo de recurso, y luego el verbo indica la acción principal.

## Qué pasa con el identificador del recurso

Cuando querés operar sobre un recurso puntual, suele aparecer el identificador en la ruta.

Por ejemplo:

```text
GET /usuarios/10
PUT /usuarios/10
DELETE /usuarios/10
```

Eso expresa que la operación no apunta a toda la colección, sino a un elemento concreto.

Más adelante vas a profundizar en `@PathVariable`, pero desde ahora conviene entender esta idea general.

## GET sobre colección y GET sobre elemento

Hay una diferencia importante entre:

```text
GET /usuarios
```

y

```text
GET /usuarios/10
```

El primero suele representar:

- listar usuarios
- consultar una colección

El segundo suele representar:

- obtener un usuario específico

Esto es parte del lenguaje natural de una API REST bien estructurada.

## POST no suele llevar id en la ruta de colección al crear

Cuando creás algo nuevo, lo común es apuntar a la colección.

Por ejemplo:

```text
POST /usuarios
POST /productos
POST /pedidos
```

La lógica general es:

- la colección es el “lugar” donde nace el nuevo recurso
- el servidor se encarga de crearlo

Esto resulta mucho más claro que inventar rutas verbales para cada operación.

## PUT y DELETE suelen ir sobre un recurso específico

En cambio, PUT y DELETE muchas veces operan sobre algo ya identificado.

Por eso es tan común ver:

```text
PUT /usuarios/10
DELETE /usuarios/10
```

La idea es sencilla:

- ya existe ese recurso
- ahora querés modificarlo o eliminarlo

## Qué pasa si usás el verbo “equivocado”

Técnicamente podrías construir una API donde casi todo use POST, por ejemplo.

Pero perderías semántica y claridad.

Eso puede traer varios problemas:

- contratos menos intuitivos
- rutas más raras
- mayor confusión al consumir la API
- menos alineación con herramientas y convenciones comunes

Por eso conviene usar el verbo más representativo de la intención real.

## Un criterio práctico muy sano

Podés empezar con esta brújula:

- leer → `GET`
- crear → `POST`
- actualizar → `PUT`
- eliminar → `DELETE`

No cubre toda la complejidad del mundo HTTP, pero es una base excelente y muy útil para empezar bien.

## Qué todavía no estás viendo

En este tema todavía no profundizaste en cosas como:

- cuerpo del request
- parámetros
- path variables
- códigos de estado
- validación
- diferencias finas entre PUT y PATCH
- DTOs
- `ResponseEntity`

Y está bien que así sea.

La idea ahora no es entrar en toda la complejidad de golpe, sino consolidar el mapa mental de los verbos principales.

## Un ejemplo didáctico completo

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    @GetMapping
    public String listar() {
        return "Listado de productos";
    }

    @GetMapping("/{id}")
    public String obtenerUno() {
        return "Detalle de un producto";
    }

    @PostMapping
    public String crear() {
        return "Producto creado";
    }

    @PutMapping("/{id}")
    public String actualizar() {
        return "Producto actualizado";
    }

    @DeleteMapping("/{id}")
    public String eliminar() {
        return "Producto eliminado";
    }
}
```

Este controlador todavía es muy simple, pero ya tiene bastante valor conceptual.

Te permite ver cómo se organiza un recurso real dentro de una API.

## Por qué esta estructura escala bien

Porque cuando agregás más recursos, repetís el mismo patrón mental.

Por ejemplo:

- `UsuarioController`
- `ProductoController`
- `PedidoController`
- `CategoriaController`

Cada uno con sus verbos principales.

Eso genera una API más predecible y más fácil de mantener.

## Controlador no significa una sola operación

A veces, al empezar, uno piensa un controlador como si fuera “un endpoint”.

Pero en realidad suele ser mejor pensar un controlador como el lugar donde agrupás operaciones relacionadas con un mismo recurso.

Eso da lugar a clases más coherentes.

## Error común: usar POST para absolutamente todo

Es un error bastante habitual cuando recién empezás.

Como POST acepta cuerpo y parece “flexible”, a veces se termina usando para:

- crear
- actualizar
- borrar
- buscar
- todo

Eso puede funcionar, pero empobrece el diseño de la API y hace que pierdas mucha semántica útil.

## Error común: crear rutas verbales en vez de modelar recursos

Por ejemplo:

```text
/post-crear-usuario
/post-borrar-usuario
/post-editar-usuario
```

Ese estilo suele ser menos claro que modelar el recurso y dejar que el verbo HTTP exprese la acción.

## Error común: no distinguir colección de elemento

No es lo mismo operar sobre:

- `/usuarios`
- `/usuarios/{id}`

La colección y el elemento individual suelen tener comportamientos y verbos distintos.

Entender esa diferencia es una base muy fuerte para diseñar APIs razonables.

## Error común: mezclar demasiadas cosas en un mismo controlador

También puede pasar que un controlador empiece a manejar recursos que no están realmente relacionados.

Eso hace que la clase pierda foco.

Una buena señal suele ser que el controlador represente un recurso o una familia muy cercana de recursos.

## Relación con Spring Boot

Spring Boot hace muy simple empezar a trabajar con verbos HTTP porque te da anotaciones directas y un stack web listo para usar.

Pero lo importante no es solo saber cuál anotación usar, sino entender qué está comunicando cada una dentro del contrato HTTP.

Cuando entendés eso, dejás de “anotar métodos” y empezás realmente a diseñar una API.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `@GetMapping`, `@PostMapping`, `@PutMapping` y `@DeleteMapping` no son solo anotaciones distintas: representan intenciones distintas dentro de una API, y usarlas bien ayuda a construir contratos HTTP más claros, consistentes y naturales.

## Resumen

- Una API se diseña con rutas y también con verbos HTTP.
- `@GetMapping` se usa principalmente para consultar.
- `@PostMapping` se usa principalmente para crear.
- `@PutMapping` se usa principalmente para actualizar.
- `@DeleteMapping` se usa principalmente para eliminar.
- Un mismo recurso puede exponer varias operaciones según el verbo.
- Entender estos verbos es una base central para diseñar APIs limpias en Spring Boot.

## Próximo tema

En el próximo tema vas a ver cómo capturar partes variables de la URL con `@PathVariable`, y eso te va a permitir pasar de endpoints estáticos a endpoints que operan sobre recursos identificados dinámicamente.
