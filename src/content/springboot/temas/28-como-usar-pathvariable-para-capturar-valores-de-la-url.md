---
title: "Cómo usar @PathVariable para capturar valores de la URL"
description: "Entender cómo funciona @PathVariable en Spring Boot, cómo permite leer partes variables de la ruta y por qué es fundamental para trabajar con recursos identificados dinámicamente."
order: 28
module: "Spring Web y APIs REST"
level: "base"
draft: false
---

En el tema anterior viste cómo funcionan `@GetMapping`, `@PostMapping`, `@PutMapping` y `@DeleteMapping`.

Eso te dio el mapa básico de los verbos HTTP más comunes.

Pero todavía había una limitación importante en muchos ejemplos: las rutas eran bastante estáticas.

Por ejemplo:

- `/saludo`
- `/usuarios`
- `/productos`

Eso alcanza para algunas operaciones, pero una API real casi siempre necesita ir un paso más allá.

Muy pronto aparece una necesidad como esta:

- obtener un usuario específico
- consultar un producto puntual
- actualizar un pedido concreto
- eliminar una categoría por su identificador

Ahí entran rutas como estas:

- `/usuarios/10`
- `/productos/25`
- `/pedidos/100`
- `/categorias/3`

La gran pregunta es:

> ¿cómo capturo ese valor variable de la URL dentro del método del controlador?

Spring Boot resuelve eso con `@PathVariable`.

## Qué problema resuelve `@PathVariable`

Cuando definís una ruta como:

```text
/usuarios/10
```

hay una parte fija y una parte variable.

- fija: `/usuarios`
- variable: `10`

Ese `10` representa algo importante para la lógica de la API.
No es un detalle decorativo de la URL.

Generalmente expresa:

- el id de un recurso
- un código
- un slug
- una clave natural
- algún dato que identifica lo que el cliente quiere consultar o modificar

`@PathVariable` permite tomar ese valor desde la ruta y llevarlo al método Java que atiende la petición.

Dicho de forma simple:

> `@PathVariable` sirve para capturar partes dinámicas de la URL.

## La idea general

Para usarlo, normalmente hacés dos cosas:

1. definís una parte variable en la ruta
2. la vinculás a un parámetro del método

Por ejemplo:

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UsuarioController {

    @GetMapping("/usuarios/{id}")
    public String obtenerUsuario(@PathVariable Long id) {
        return "Usuario con id: " + id;
    }
}
```

Acá Spring entiende que:

- `{id}` es una parte variable de la ruta
- ese valor debe inyectarse en el parámetro `id`
- si llega `GET /usuarios/10`, entonces `id` vale `10`

## Cómo leer este ejemplo

```java
@GetMapping("/usuarios/{id}")
public String obtenerUsuario(@PathVariable Long id) {
    return "Usuario con id: " + id;
}
```

Podés leerlo así:

- este endpoint atiende un GET
- la ruta tiene una variable llamada `id`
- Spring extrae ese valor desde la URL
- lo convierte al tipo adecuado
- lo inyecta en el método

Esto es una base fundamental para APIs que operan sobre recursos concretos.

## Qué significa `{id}`

Dentro del mapping, las llaves indican una variable de ruta.

Por ejemplo:

```java
"/usuarios/{id}"
```

le dice a Spring algo como:

> en esta parte de la URL espero un valor dinámico y quiero llamarlo `id`.

Ese nombre importa porque luego se relaciona con el parámetro anotado con `@PathVariable`.

## Un ejemplo muy simple en funcionamiento

Si el cliente hace:

```text
GET /usuarios/10
```

y el controlador es este:

```java
@GetMapping("/usuarios/{id}")
public String obtenerUsuario(@PathVariable Long id) {
    return "Usuario con id: " + id;
}
```

entonces la respuesta podría ser:

```text
Usuario con id: 10
```

La clave está en que el `10` no fue leído desde el cuerpo ni desde un query param.
Fue tomado directamente desde la ruta.

## Por qué esto es tan importante

Porque una enorme cantidad de operaciones reales necesitan identificar recursos específicos.

Por ejemplo:

- ver un usuario puntual
- editar un producto específico
- borrar un pedido concreto
- consultar una orden por número
- abrir un recurso según su slug

Sin `@PathVariable`, te quedarías limitado a rutas demasiado rígidas o tendrías que usar estrategias menos naturales para identificar recursos.

## Un recurso individual vs una colección

Una diferencia fundamental en APIs REST suele ser esta:

### Colección
```text
GET /usuarios
```

### Recurso individual
```text
GET /usuarios/10
```

En el primer caso, querés la colección o un listado.
En el segundo, querés un recurso concreto.

`@PathVariable` entra justamente en ese segundo escenario.

## Ejemplo típico con GET individual

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductoController {

    @GetMapping("/productos/{id}")
    public String obtenerProducto(@PathVariable Long id) {
        return "Detalle del producto " + id;
    }
}
```

Este estilo es extremadamente común.

## También sirve con PUT y DELETE

No es solo para GET.

Por ejemplo, al actualizar:

```java
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductoController {

    @PutMapping("/productos/{id}")
    public String actualizarProducto(@PathVariable Long id) {
        return "Producto actualizado: " + id;
    }
}
```

Y al eliminar:

```java
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductoController {

    @DeleteMapping("/productos/{id}")
    public String eliminarProducto(@PathVariable Long id) {
        return "Producto eliminado: " + id;
    }
}
```

Esto deja muy claro que la operación apunta a un recurso concreto.

## Cómo se vincula el nombre

Una de las formas más comunes es esta:

```java
@GetMapping("/usuarios/{id}")
public String obtener(@PathVariable Long id) {
    return "Usuario " + id;
}
```

En este caso, Spring puede vincular automáticamente:

- la variable `{id}`
- con el parámetro `id`

porque los nombres coinciden.

## También se puede escribir explícitamente

Si querés ser más explícito, podés indicar el nombre dentro de la anotación.

```java
@GetMapping("/usuarios/{id}")
public String obtener(@PathVariable("id") Long usuarioId) {
    return "Usuario " + usuarioId;
}
```

Acá la ruta usa `{id}`, pero el parámetro Java se llama `usuarioId`.

La anotación explicita la relación.

Esto puede ser útil cuando querés que el nombre interno del código sea más expresivo que el nombre corto de la URL.

## Cuándo conviene usar la forma explícita

Suele convenir cuando:

- el nombre del parámetro Java no coincide con el de la ruta
- querés mayor claridad
- preferís dejar más explícita la intención
- el equipo sigue una convención donde los parámetros internos tienen nombres más largos

Por ejemplo:

```java
@GetMapping("/pedidos/{id}")
public String obtenerPedido(@PathVariable("id") Long pedidoId) {
    return "Pedido " + pedidoId;
}
```

Esto puede leerse muy bien.

## Tipos que puede manejar

`@PathVariable` no se limita a `String`.

Puede trabajar con tipos frecuentes como:

- `String`
- `Long`
- `Integer`
- `UUID` en ciertos escenarios comunes
- otros tipos convertibles según el sistema de conversión

Por ejemplo:

```java
@GetMapping("/usuarios/{id}")
public String obtener(@PathVariable Long id) {
    return "Usuario " + id;
}
```

Acá Spring toma el texto de la URL y lo convierte a `Long`.

## Qué pasa si el tipo no coincide

Este punto es importante.

Si la URL trae un valor incompatible con el tipo esperado, Spring puede fallar al intentar convertirlo.

Por ejemplo, si el método espera:

```java
@PathVariable Long id
```

pero la URL trae algo como:

```text
/usuarios/abc
```

ese valor no puede convertirse a `Long`.

En ese tipo de casos, la petición no podrá resolverse correctamente.

Esto es bueno porque evita que el sistema siga como si nada con datos inválidos.

## Un ejemplo con String

No todas las variables de ruta tienen que ser ids numéricos.

A veces pueden ser códigos o slugs.

```java
@GetMapping("/articulos/{slug}")
public String obtenerArticulo(@PathVariable String slug) {
    return "Artículo: " + slug;
}
```

Si llamás:

```text
GET /articulos/introduccion-a-spring
```

entonces `slug` vale:

```text
introduccion-a-spring
```

Esto es muy útil para URLs más semánticas.

## Un ejemplo con dos variables de ruta

También podés capturar más de una parte variable en la misma URL.

Por ejemplo:

```java
@GetMapping("/usuarios/{usuarioId}/pedidos/{pedidoId}")
public String obtenerPedidoDeUsuario(
    @PathVariable Long usuarioId,
    @PathVariable Long pedidoId
) {
    return "Usuario " + usuarioId + " - Pedido " + pedidoId;
}
```

Esto muestra que la ruta puede expresar una estructura más rica y que Spring puede recuperar múltiples valores desde ella.

## Cómo pensar rutas anidadas

Rutas como esta:

```text
/usuarios/{usuarioId}/pedidos/{pedidoId}
```

suelen expresar una relación entre recursos.

Por ejemplo:

- un pedido que pertenece a un usuario
- un comentario dentro de un post
- un ítem dentro de una orden
- una imagen dentro de un producto

No siempre conviene anidar profundamente todo, pero entender este patrón es muy importante.

## Un ejemplo más realista

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    @GetMapping("/{id}")
    public String obtenerPedido(@PathVariable Long id) {
        return "Detalle del pedido " + id;
    }

    @PutMapping("/{id}")
    public String actualizarPedido(@PathVariable Long id) {
        return "Pedido actualizado " + id;
    }

    @DeleteMapping("/{id}")
    public String eliminarPedido(@PathVariable Long id) {
        return "Pedido eliminado " + id;
    }
}
```

Acá ya tenés una estructura bastante representativa de una API real.

## Relación con el diseño REST

`@PathVariable` encaja muy bien con una idea central del diseño REST: los recursos se identifican por URLs.

Eso significa que el identificador del recurso suele formar parte de la ruta.

Por eso es tan habitual ver:

- `/usuarios/{id}`
- `/productos/{id}`
- `/pedidos/{id}`

No es casualidad. Es una forma muy natural de modelar recursos identificables.

## Ruta y recurso: una conexión muy fuerte

Una buena API suele hacer que la ruta exprese claramente qué recurso se está atacando.

Por ejemplo:

```text
GET /productos/25
```

Eso ya dice mucho:

- el recurso es “producto”
- el identificador es 25
- el verbo es GET
- la intención es consultar ese recurso

Cuando la ruta y el verbo se combinan bien, la API se vuelve mucho más expresiva.

## `@PathVariable` no reemplaza a otras formas de entrada

Esto también es importante.

Hay distintas formas de recibir datos en un endpoint:

- desde la ruta
- desde query params
- desde headers
- desde el body del request

`@PathVariable` cubre el caso específico de los datos que forman parte de la URL.

No sirve para todo, pero es la herramienta correcta cuando el valor identifica o contextualiza el recurso desde la ruta misma.

## Cuándo conviene usar variable de ruta

Suele tener mucho sentido cuando el dato:

- identifica directamente el recurso
- forma parte natural de la dirección del endpoint
- expresa jerarquía entre recursos
- hace más semántica la URL

Por ejemplo:

- id de usuario
- id de pedido
- slug de artículo
- nombre de categoría en una URL pública

## Cuándo no conviene forzarlo

No todo dato tiene que ir en la ruta.

Si un valor no identifica el recurso sino que solo ajusta una consulta, a veces conviene más usar query parameters.

Por ejemplo, para cosas como:

- filtros
- paginación
- ordenamiento
- búsqueda
- flags de consulta

Eso lo vas a ver más adelante con más detalle.

Por ahora, alcanza con distinguir esta idea:

> la ruta suele representar identidad o estructura del recurso; otras entradas pueden representar parámetros de consulta o payload.

## Un ejemplo con `@RequestMapping` a nivel de clase

Esto es muy habitual:

```java
@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @GetMapping("/{id}")
    public String obtenerUsuario(@PathVariable Long id) {
        return "Usuario " + id;
    }
}
```

La ruta final queda compuesta por:

- base de clase: `/usuarios`
- parte del método: `/{id}`

Resultado final:

```text
/usuarios/{id}
```

Esto hace que el código se vea más ordenado.

## Qué pasa si falta el valor en la URL

Si la ruta está definida como:

```java
@GetMapping("/usuarios/{id}")
```

entonces el endpoint espera esa parte variable.

No coincide con:

```text
/usuarios
```

porque ahí no hay ningún `id`.

Esto es importante porque muestra que:

- `/usuarios`
- `/usuarios/{id}`

son rutas distintas, con intenciones distintas.

## Dos endpoints diferentes y complementarios

Es muy común tener ambos en el mismo controlador:

```java
@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @GetMapping
    public String listarUsuarios() {
        return "Listado";
    }

    @GetMapping("/{id}")
    public String obtenerUsuario(@PathVariable Long id) {
        return "Usuario " + id;
    }
}
```

Eso expresa perfectamente la diferencia entre:

- colección
- recurso individual

## Por qué esto es una base tan fuerte

Porque casi toda API real se apoya en esta lógica.

Una vez que entendés bien `@PathVariable`, ya podés modelar:

- recursos individuales
- relaciones entre recursos
- operaciones sobre entidades específicas
- rutas semánticas con valores dinámicos

Es uno de esos conceptos que parece simple pero después aparece constantemente en proyectos reales.

## Un ejemplo con nombres más expresivos

A veces puede quedar mejor así:

```java
@GetMapping("/usuarios/{id}")
public String obtenerUsuarioPorId(@PathVariable("id") Long usuarioId) {
    return "Usuario " + usuarioId;
}
```

Esto tiene una pequeña ventaja de legibilidad:

- la URL sigue siendo corta y natural
- el código Java puede ser más claro internamente

## Qué conviene hacer al empezar

Una buena práctica inicial es esta:

- usar `Long` o `String` según el caso
- mantener nombres claros
- modelar rutas simples y limpias
- no anidar demasiado de entrada
- usar `@PathVariable` cuando la URL realmente expresa identidad de recurso

Eso ya te da una base excelente.

## Error común: confundir ruta variable con query parameter

Por ejemplo, no es lo mismo:

```text
/usuarios/10
```

que:

```text
/usuarios?id=10
```

Ambas formas pueden transportar información, pero no expresan lo mismo conceptualmente.

La primera modela al recurso como parte de la ruta.
La segunda modela un parámetro de consulta.

Más adelante vas a ver `@RequestParam`, y esa diferencia va a importar mucho.

## Error común: usar variables de ruta para todo

A veces alguien mete demasiada información en la ruta aunque no represente identidad real del recurso.

Eso puede volver la API menos clara.

No todo valor que entra al endpoint tiene que ser `@PathVariable`.

## Error común: usar nombres poco expresivos

Rutas como:

```text
/items/{x}
```

o parámetros como:

```java
@PathVariable String dato
```

pueden funcionar, pero no comunican mucho.

Conviene que los nombres ayuden a entender el dominio:

- `id`
- `usuarioId`
- `pedidoId`
- `slug`
- `codigo`

## Error común: no distinguir colección y elemento

Ya lo vimos antes, pero acá vuelve a importar mucho.

No es lo mismo atender:

- `/productos`
- `/productos/{id}`

La primera suele apuntar a la colección.
La segunda, a un recurso específico.

Diseñar bien esa diferencia hace que la API se entienda mucho mejor.

## Error común: intentar meter lógica de parsing innecesaria manualmente

A veces, al no confiar en el framework, alguien intenta tomar el valor como string y convertirlo todo a mano.

En muchos casos, Spring ya puede hacer conversiones básicas por vos de forma limpia.

Conviene aprovechar esa capacidad mientras mantengas tipos razonables y claros.

## Relación con Spring Boot

Spring Boot hace muy cómodo trabajar con rutas dinámicas porque integra el sistema de mapeo web con el modelo de anotaciones de Spring MVC.

Con muy poco código ya podés pasar de rutas estáticas a endpoints que operan sobre recursos reales identificados dinámicamente.

Eso te acerca mucho más a una API de verdad.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `@PathVariable` permite capturar partes variables de la URL y convertirlas en parámetros del método del controlador, haciendo posible que una API Spring Boot trabaje naturalmente con recursos específicos identificados dinámicamente.

## Resumen

- `@PathVariable` sirve para leer valores que vienen dentro de la ruta.
- Es ideal para identificar recursos concretos como `/usuarios/{id}`.
- Puede trabajar con distintos tipos como `String`, `Long` o `Integer`.
- También puede capturar múltiples variables en la misma URL.
- Encaja muy bien con el estilo REST de identificar recursos mediante rutas.
- No reemplaza a otras formas de entrada como query params o request body.
- Entenderlo es clave para pasar de endpoints estáticos a APIs realmente útiles.

## Próximo tema

En el próximo tema vas a ver cómo usar `@RequestParam` para recibir parámetros de consulta, y ahí vas a empezar a distinguir claramente entre datos que identifican recursos en la ruta y datos que simplemente ajustan o filtran la petición.
