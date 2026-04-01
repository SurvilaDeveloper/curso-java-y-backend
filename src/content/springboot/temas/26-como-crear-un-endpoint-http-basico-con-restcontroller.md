---
title: "Cómo crear un endpoint HTTP básico con @RestController"
description: "Entender qué es @RestController, cómo exponer un endpoint HTTP básico en Spring Boot y por qué este paso marca el inicio real de una API web."
order: 26
module: "Spring Web y APIs REST"
level: "base"
draft: false
---

Hasta ahora viste muchas de las bases que sostienen una aplicación Spring Boot:

- cómo arranca
- cómo se crean beans
- cómo se resuelven dependencias
- cómo se organiza la configuración
- cómo reaccionar al ciclo de vida de la aplicación

Todo eso es muy importante.

Pero en algún momento Spring Boot deja de ser solo una aplicación que “levanta bien” y pasa a convertirse en algo que **responde solicitudes reales**.

Ahí entra el desarrollo web.

Y uno de los primeros pasos más importantes de ese bloque es entender cómo crear un endpoint HTTP básico.

La herramienta más conocida para eso en una API Spring Boot es `@RestController`.

## Qué problema resuelve `@RestController`

Cuando una aplicación web recibe una solicitud HTTP, necesita algún punto del sistema que la atienda.

Por ejemplo:

- alguien hace un `GET`
- alguien llama una URL
- alguien envía datos en un `POST`
- otra aplicación quiere consumir tu API

Entonces necesitás una clase capaz de:

- recibir la petición
- entender qué URL se invocó
- decidir qué método ejecutar
- devolver una respuesta

En Spring Boot, uno de los roles principales para eso lo cumplen los controladores web.

Y cuando lo que querés es construir una API que devuelva datos, lo más común es usar `@RestController`.

## Qué es un endpoint

Antes de seguir, conviene dejar clara una idea.

Un **endpoint** es, de forma simple, un punto accesible de tu aplicación web.

Por ejemplo:

- `/saludo`
- `/usuarios`
- `/productos/10`
- `/api/pedidos`

Cada uno representa una dirección a la que alguien puede hacer una petición HTTP.

Por eso, cuando hablamos de “crear un endpoint”, en la práctica hablamos de exponer una URL y asociarla a un comportamiento.

## Qué es `@RestController`

`@RestController` es una anotación de Spring que marca una clase como controlador REST.

Eso significa, conceptualmente, que esa clase:

- forma parte del sistema web
- puede recibir requests HTTP
- puede devolver respuestas pensadas para una API, normalmente datos y no vistas HTML tradicionales

Dicho de forma simple:

> `@RestController` le dice a Spring que esa clase existe para atender solicitudes web y devolver respuestas directamente al cliente.

## Un ejemplo mínimo

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SaludoController {

    @GetMapping("/saludo")
    public String saludar() {
        return "Hola desde Spring Boot";
    }
}
```

Este ejemplo ya muestra una API mínima funcionando.

La idea general es:

- la clase está marcada con `@RestController`
- el método está asociado a una URL con `@GetMapping`
- cuando alguien hace un `GET /saludo`, Spring ejecuta `saludar()`
- la respuesta se devuelve al cliente

## Qué significa `@GetMapping`

`@GetMapping` es una anotación que asocia un método con una petición HTTP GET a una ruta concreta.

En este caso:

```java
@GetMapping("/saludo")
```

quiere decir algo como:

> si llega una petición GET a `/saludo`, ejecutá este método.

Eso es una base central del desarrollo web con Spring MVC y Spring Boot.

## Cómo se lee el ejemplo completo

```java
@RestController
public class SaludoController {

    @GetMapping("/saludo")
    public String saludar() {
        return "Hola desde Spring Boot";
    }
}
```

Podés leerlo así:

- esta clase es un controlador REST
- tiene un endpoint GET en `/saludo`
- cuando lo llamen, responderá con un texto

Es una estructura muy simple, pero representa el primer paso real para construir una API.

## Qué hace Spring por debajo

Aunque el código se ve corto, Spring Boot está resolviendo bastante trabajo detrás de escena.

Por ejemplo:

- detecta la clase como bean
- la registra como controlador web
- la conecta al sistema MVC/web
- asocia la URL al método
- escucha requests HTTP
- ejecuta el método adecuado
- construye y devuelve la respuesta

Todo eso ocurre gracias al stack web de Spring y a la auto-configuración de Boot.

## Qué necesitás para que esto funcione

Para que una aplicación Spring Boot exponga endpoints HTTP, normalmente necesitás la dependencia web correspondiente.

Conceptualmente, eso suele venir del starter web.

La idea es que tu aplicación ya esté preparada para actuar como aplicación web y no solo como app Java general.

## Qué devuelve un método en un `@RestController`

Un punto muy importante es que, en un controlador REST, el valor retornado por un método suele convertirse en la respuesta HTTP.

En el ejemplo anterior, el método devuelve:

```java
"Hola desde Spring Boot"
```

y ese valor es enviado al cliente.

Más adelante vas a ver cómo devolver:

- objetos
- listas
- JSON
- respuestas más completas
- códigos de estado personalizados

Pero para empezar, alcanza con entender que el retorno del método forma parte de la respuesta.

## Diferencia conceptual con un controlador tradicional

En el ecosistema Spring, no todo controlador tiene por qué ser REST.

Históricamente, un controlador también podía servir para devolver vistas HTML renderizadas en servidor.

Pero en una API moderna, lo más habitual es devolver datos.

Por eso, `@RestController` es especialmente importante cuando tu objetivo es construir servicios HTTP consumibles por frontends, apps móviles u otros sistemas.

## Un endpoint básico no necesita todavía mucha infraestructura

Algo lindo de este primer paso es que no necesitás todavía:

- base de datos
- DTOs complejos
- validación avanzada
- seguridad
- servicios enormes
- persistencia

Podés empezar con algo mínimo, solo para entender el circuito:

- llega una petición
- Spring encuentra el método
- se ejecuta
- se devuelve una respuesta

Esa claridad inicial es muy valiosa.

## Qué pasa cuando llamás `/saludo`

Si la app está corriendo y hacés una petición HTTP GET a `/saludo`, Spring:

1. recibe la solicitud
2. identifica que existe un mapeo hacia ese endpoint
3. invoca el método `saludar()`
4. toma el valor retornado
5. lo envía como respuesta

Ese circuito es la base de casi todo lo que viene después en el desarrollo de APIs con Spring Boot.

## Por qué esto marca un punto de inflexión

Hasta este tema venías viendo principalmente:

- contenedor
- configuración
- arranque
- ciclo de vida

Todo eso era importantísimo, pero todavía no habías entrado del todo en la parte visible para un cliente HTTP.

Con `@RestController`, la aplicación ya empieza a tener una cara pública.

Ahora sí hay una puerta concreta por la que otros sistemas pueden interactuar con tu app.

Por eso este tema es un punto de inflexión dentro del curso.

## Un ejemplo con ruta base usando `@RequestMapping`

También es común agrupar rutas usando `@RequestMapping` a nivel de clase.

Por ejemplo:

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class SaludoController {

    @GetMapping("/saludo")
    public String saludar() {
        return "Hola desde /api/saludo";
    }
}
```

Acá la ruta efectiva sería:

```text
/api/saludo
```

Esto se vuelve muy útil cuando un controlador maneja varios endpoints relacionados.

## Por qué `@RequestMapping` a nivel de clase resulta útil

Te permite definir una base común para todos los métodos de ese controlador.

Por ejemplo:

- `/api/usuarios`
- `/api/productos`
- `/api/pedidos`

En vez de repetir la base en cada método, la declarás una vez a nivel de clase.

Eso mejora la claridad y reduce repetición.

## Un ejemplo un poco más ordenado

```java
@RestController
@RequestMapping("/api/saludos")
public class SaludoController {

    @GetMapping
    public String obtenerSaludo() {
        return "Hola";
    }

    @GetMapping("/formal")
    public String obtenerSaludoFormal() {
        return "Buenos días";
    }
}
```

Acá tenés dos endpoints distintos dentro del mismo recurso lógico.

Eso ya muestra una idea importante: un controlador no tiene por qué tener un solo método.

## Qué conviene devolver al principio

Al empezar, está perfecto devolver:

- `String`
- objetos simples
- respuestas fáciles de entender

Lo importante no es todavía la sofisticación de la respuesta, sino comprender:

- cómo se define la ruta
- cómo se atiende una petición
- cómo se estructura un controlador

La complejidad puede venir después.

## Un ejemplo con un objeto simple

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

```java
@RestController
@RequestMapping("/api")
public class SaludoController {

    @GetMapping("/saludo")
    public MensajeResponse saludar() {
        return new MensajeResponse("Hola desde Spring Boot");
    }
}
```

Acá el controlador ya no devuelve solo texto, sino un objeto.

Spring Boot puede transformar ese objeto en una respuesta estructurada para el cliente.

Más adelante vas a profundizar mucho más en esto, pero desde ahora conviene ver que el controlador no se limita a strings planos.

## Qué papel cumple el controlador

Es muy importante no perder de vista el rol de esta clase.

El controlador existe para manejar la interacción HTTP.

Eso suele implicar cosas como:

- recibir requests
- mapear rutas
- leer parámetros
- delegar a servicios
- devolver respuestas

No conviene que el controlador se convierta en el lugar donde viva toda la lógica de negocio.

Este tema recién empieza, así que todavía estamos en ejemplos mínimos.
Pero desde ya conviene sembrar esta idea:

> el controlador debería coordinar la interacción web, no absorber toda la inteligencia del sistema.

## Un ejemplo de lo que no conviene a futuro

```java
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @GetMapping
    public String procesarTodo() {
        // lógica de negocio enorme
        // acceso a datos
        // validaciones
        // cálculos
        // integración externa
        return "ok";
    }
}
```

Aunque técnicamente podrías hacerlo, no sería una buena estructura.

Más adelante vas a trabajar con capas para separar mejor estas responsabilidades.

## Un ejemplo más sano conceptualmente

```java
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public String obtenerEstado() {
        return pedidoService.obtenerEstado();
    }
}
```

Acá el controlador ya se parece más a lo que suele buscarse en una aplicación ordenada:

- recibe la solicitud
- delega
- devuelve el resultado

## Qué errores aparecen si algo está mal configurado

Si la app no tiene bien preparado el stack web o el controlador no está siendo detectado, pueden pasar cosas como:

- el endpoint no aparece
- la ruta devuelve 404
- el controlador nunca se registra
- la aplicación no se comporta como app web

Por eso es importante que todo lo anterior del curso tenga sentido: el arranque, el scanning, la auto-configuración y la organización de paquetes afectan directamente que esto funcione.

## Cómo se relaciona con el component scanning

Un `@RestController` también es un bean administrado por Spring.

Eso significa que:

- debe estar en un paquete que Spring escanee
- puede inyectar dependencias
- participa del contenedor como otros componentes

O sea: el mundo web no está separado del contenedor.
Se apoya completamente en él.

## Un detalle importante sobre el verbo HTTP

En este tema trabajaste con `GET`.

Eso es intencional porque suele ser el verbo más simple para empezar.

Más adelante vas a ver:

- `POST`
- `PUT`
- `PATCH`
- `DELETE`

Cada uno cumple un rol distinto en una API REST.

Pero primero conviene consolidar el caso más simple de todos: exponer un GET que responda correctamente.

## Qué estás aprendiendo realmente con este primer endpoint

Aunque parezca un ejemplo pequeño, ya estás aprendiendo varias cosas al mismo tiempo:

- qué rol cumple un controlador
- cómo se define una ruta
- cómo se asocia una URL a un método
- cómo se devuelve una respuesta
- cómo Spring integra el contenedor con la capa web

Eso es muchísimo más importante de lo que aparenta el tamaño del código.

## Un buen primer objetivo práctico

Al terminar este tema, deberías poder hacer algo como esto sin copiar a ciegas:

1. crear un controlador
2. marcarlo con `@RestController`
3. definir una ruta con `@GetMapping`
4. correr la aplicación
5. invocar esa URL
6. comprobar que devuelve una respuesta

Si lográs eso, ya diste el primer paso real dentro del bloque web.

## Error común: creer que cualquier clase con un método público será un endpoint

No.

Para que Spring la trate como parte de la capa web, tiene que estar registrada correctamente como controlador.

`@RestController` no es un adorno: comunica a Spring que esa clase forma parte del sistema web.

## Error común: meter toda la lógica en el controlador

Ya lo anticipamos, pero vale repetirlo.

Un controlador no debería volverse un “superobjeto” con toda la lógica del sistema.

Su rol es mucho más de orquestación HTTP.

Más adelante esta idea se vuelve clave cuando entren DTOs, servicios, validación y persistencia.

## Error común: no entender que la ruta incluye la composición clase + método

Cuando usás `@RequestMapping` a nivel clase y `@GetMapping` a nivel método, la ruta final es la combinación de ambas partes.

Eso a veces genera confusión cuando alguien prueba una URL equivocada y obtiene 404.

## Error común: pensar que devolver un String siempre significa “texto plano”

En un `@RestController`, devolver un `String` normalmente se interpreta como contenido de respuesta.
Más adelante vas a ver cómo el tipo retornado y el stack web influyen en la forma final de la respuesta.

Por ahora, alcanza con entender que el método devuelve algo al cliente, no una vista.

## Relación con Spring Boot

Este tema muestra una de las grandes fortalezas de Spring Boot:

con muy poco código podés pasar de una aplicación Java general a una aplicación HTTP funcional.

Gracias a la auto-configuración, al starter web y al modelo de anotaciones, podés crear endpoints muy rápido sin montar toda la infraestructura manualmente.

Pero lo importante no es solo la velocidad, sino entender qué está pasando detrás.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `@RestController` permite exponer endpoints HTTP de forma directa en Spring Boot, convirtiendo una aplicación ya configurada y bien arrancada en una API real capaz de recibir solicitudes y devolver respuestas.

## Resumen

- Un endpoint es un punto accesible por HTTP dentro de tu aplicación.
- `@RestController` marca una clase como controlador REST.
- `@GetMapping` asocia un método a una petición GET sobre una ruta.
- `@RequestMapping` a nivel de clase ayuda a agrupar rutas comunes.
- El controlador debería encargarse de la interacción HTTP y delegar la lógica de negocio.
- Un controlador también es un bean administrado por Spring.
- Este tema marca el inicio real del bloque de Spring Web y APIs REST.

## Próximo tema

En el próximo tema vas a ver cómo funcionan `@GetMapping`, `@PostMapping`, `@PutMapping` y `@DeleteMapping`, y cómo cada uno representa una intención distinta dentro de una API HTTP.
