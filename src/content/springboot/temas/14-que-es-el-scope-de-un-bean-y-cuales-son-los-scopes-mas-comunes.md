---
title: "Qué es el scope de un bean y cuáles son los scopes más comunes"
description: "Entender qué es el scope de un bean en Spring, cómo afecta su ciclo de vida y cuáles son los scopes más usados en aplicaciones Spring Boot."
order: 14
module: "Fundamentos de Spring y Spring Boot"
level: "intro"
draft: false
---

En Spring, no alcanza con saber que una clase puede transformarse en un bean. También importa **cómo vive ese bean dentro del contenedor**.

Ahí entra el concepto de **scope**.

El scope define la forma en que Spring administra la existencia de un bean: cuántas instancias crea, cuánto duran, cuándo se reutilizan y en qué contexto viven.

Dicho de forma simple:

> el scope responde a la pregunta: **¿cómo existe este bean dentro de la aplicación?**

Este tema es importante porque ayuda a entender por qué algunos beans se comportan como objetos compartidos en toda la app, mientras que otros pueden crearse varias veces según la necesidad.

## Qué significa scope

Cuando Spring registra un bean, no solo sabe **qué clase** tiene que administrar. También puede saber **con qué alcance** debe administrarla.

Ese alcance determina cosas como:

- si habrá una sola instancia o varias
- si esa instancia se compartirá
- si vivirá toda la aplicación o menos tiempo
- si dependerá de un request web, de una sesión o de otro contexto

Por eso, el scope está directamente relacionado con el **ciclo de vida del bean**.

## Por qué el scope importa

A veces, cuando uno recién empieza, puede pensar que todos los beans funcionan igual.

Pero no es así.

Elegir mal el scope puede traer problemas como:

- compartir estado donde no corresponde
- crear demasiadas instancias innecesarias
- generar comportamiento impredecible
- mezclar responsabilidades
- introducir errores difíciles de detectar

En cambio, entender bien el scope te permite decidir mejor qué tipo de bean necesitás según el caso.

## El scope por defecto: singleton

El scope más común en Spring es **singleton**.

Cuando un bean tiene scope singleton, Spring crea **una sola instancia** de ese bean dentro del contexto, y esa misma instancia se reutiliza cada vez que haga falta.

```java
@Service
public class PedidoService {
}
```

Si no indicás otra cosa, ese bean normalmente será singleton.

Eso significa que, en general, Spring va a trabajar con una sola instancia de `PedidoService` durante la vida de la aplicación.

## Cómo pensar un singleton en Spring

En Spring, singleton no significa necesariamente “una sola instancia en toda la JVM universalmente”.

Significa, de forma práctica:

> una sola instancia administrada por el contenedor para ese contexto de aplicación

Para una app Spring Boot típica, eso suele implicar una única instancia compartida por toda la aplicación mientras el contexto esté vivo.

## Por qué singleton es el más usado

La mayoría de los servicios, repositorios, componentes y configuraciones en Spring se modelan bien como singleton.

¿Por qué?

Porque suelen ser objetos **sin estado mutable propio**, o al menos sin estado que deba ser diferente por request o por usuario.

Por ejemplo:

- un servicio de negocio
- un repositorio
- un mapper
- una clase de configuración
- un cliente hacia otro servicio

En todos esos casos, una única instancia suele ser suficiente y deseable.

## Un ejemplo típico de singleton

```java
@Service
public class ProductoService {

    public String obtenerMensaje() {
        return "Servicio de productos";
    }
}
```

Si este bean es inyectado en varios lugares, Spring no crea un `ProductoService` nuevo para cada clase. Reutiliza el mismo bean singleton.

```java
@RestController
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }
}
```

```java
@Service
public class ReporteService {

    private final ProductoService productoService;

    public ReporteService(ProductoService productoService) {
        this.productoService = productoService;
    }
}
```

Tanto `ProductoController` como `ReporteService` pueden recibir la misma instancia de `ProductoService`.

## Qué cuidado hay que tener con singleton

Que un bean sea singleton no es un problema. De hecho, es lo más normal.

El problema aparece cuando un bean singleton guarda **estado mutable** que cambia durante el uso normal de la aplicación.

Por ejemplo:

```java
@Service
public class ContadorService {

    private int contador = 0;

    public int incrementar() {
        contador++;
        return contador;
    }
}
```

Acá hay un riesgo conceptual importante: ese `contador` queda compartido para toda la aplicación.

Entonces:

- distintos requests podrían modificar el mismo valor
- distintos usuarios verían el mismo estado compartido
- podrían aparecer problemas de concurrencia

Por eso, una regla muy sana al empezar es esta:

> los beans singleton suelen funcionar mejor cuando son **stateless**, es decir, cuando no guardan estado mutable de negocio dentro del objeto.

## Qué significa stateless

Un bean stateless es un bean que no necesita recordar datos internos que cambian entre una invocación y otra.

Por ejemplo:

```java
@Service
public class PrecioService {

    public double aplicarDescuento(double precio) {
        return precio * 0.9;
    }
}
```

Este servicio no guarda estado entre llamadas. Solo ejecuta lógica.

Ese estilo encaja muy bien con singleton.

## Prototype

Otro scope conocido es **prototype**.

Cuando un bean es prototype, Spring crea una nueva instancia cada vez que ese bean se solicita al contenedor.

Se define así:

```java
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("prototype")
public class TokenTemporal {
}
```

La idea general es:

- singleton: una sola instancia compartida
- prototype: una instancia nueva cada vez que se pide

## Cuándo podría tener sentido prototype

Prototype puede tener sentido cuando realmente necesitás objetos con estado propio y vida corta.

Por ejemplo:

- objetos temporales
- componentes armados para un uso puntual
- estructuras que no deben compartirse
- casos avanzados de procesamiento

Sin embargo, en aplicaciones Spring Boot comunes, prototype se usa mucho menos que singleton.

## Un detalle importante sobre prototype

Aunque prototype cree instancias nuevas, no conviene pensar que automáticamente resuelve cualquier problema de estado.

Además, su ciclo de vida administrado por Spring no es igual al de singleton.

Spring crea el bean prototype y lo entrega, pero la fase de destrucción no se maneja igual que en singleton.

Por eso, prototype no es simplemente “singleton pero mejor”. Es otra herramienta, con otros compromisos.

## Request scope

Cuando una aplicación web usa Spring MVC, existe también el scope **request**.

En este caso, Spring crea una instancia del bean por cada request HTTP.

Ejemplo conceptual:

```java
@Component
@Scope("request")
public class RequestData {
}
```

Eso significa que cada request recibe su propia instancia de ese bean.

Si llegan dos requests distintos, Spring no reutiliza el mismo bean `RequestData`.

## Cuándo puede servir request scope

Puede ser útil cuando querés almacenar información temporal que vive solo durante una petición web.

Por ejemplo:

- datos ligados al request actual
- contexto temporal de una operación
- metadatos construidos durante el procesamiento de esa petición

De todos modos, al empezar con Spring Boot no es el scope que más vas a usar. Sirve más como idea de cómo Spring también puede adaptar el ciclo de vida al contexto web.

## Session scope

Otro scope web es **session**.

En ese caso, Spring crea una instancia por sesión de usuario.

```java
@Component
@Scope("session")
public class CarritoTemporal {
}
```

Conceptualmente, eso implica que un usuario podría tener su propia instancia durante su sesión, distinta de la de otro usuario.

## Cuándo podría servir session scope

Puede servir en aplicaciones web tradicionales con estado de sesión, por ejemplo para:

- datos temporales de usuario
- flujos multipaso
- información asociada a una sesión concreta

En APIs REST modernas stateless, este scope suele tener menos protagonismo, porque muchas veces se evita mantener estado de sesión en el servidor.

## Application scope

También existe el scope **application**, más asociado a ciertos contextos web.

La idea general es que el bean viva a nivel de aplicación web completa.

No suele ser el primero que necesitás dominar, pero conviene saber que existe dentro del ecosistema de scopes posibles.

## WebSocket scope

En aplicaciones específicas también existe soporte para otros scopes, como el asociado a WebSocket.

No hace falta profundizar eso ahora, pero sirve para ver que Spring puede adaptar la vida de un bean según distintos contextos de ejecución.

## Cómo se declara un scope

Generalmente, el scope se declara con `@Scope`.

```java
@Component
@Scope("prototype")
public class GeneradorTemporal {
}
```

O con otro valor:

```java
@Component
@Scope("request")
public class RequestInfo {
}
```

La idea base es siempre la misma: indicarle al contenedor cómo debe gestionar la vida de ese bean.

## El scope y la cantidad de instancias

Una forma muy útil de pensar esto es la siguiente:

### Singleton
- una instancia compartida
- suele vivir toda la aplicación
- es el más usado

### Prototype
- una instancia nueva cada vez que se solicita
- útil para casos específicos

### Request
- una instancia por request HTTP

### Session
- una instancia por sesión de usuario

## Scope y rendimiento

A veces puede surgir esta duda:

**¿No sería mejor que todo fuese singleton para ahorrar recursos?**

No necesariamente.

La pregunta correcta no es “qué scope usa menos memoria”, sino:

> ¿qué scope representa correctamente la naturaleza de este objeto?

Si el bean conceptualmente debe ser compartido, singleton suele ser perfecto.

Si el bean necesita una vida más corta o un estado independiente, puede que otro scope tenga más sentido.

O sea: primero pensás el modelo correcto; después evaluás implicancias de rendimiento.

## Scope y estado compartido

Este es uno de los puntos más importantes del tema.

Cuando un bean es singleton, hay que asumir que puede ser usado por múltiples partes de la aplicación, incluso al mismo tiempo.

Por eso conviene evitar diseños como este:

```java
@Service
public class UsuarioActualService {

    private String usuario;

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getUsuario() {
        return usuario;
    }
}
```

Esto sería peligroso como singleton, porque estarías guardando estado mutable compartido en un bean que potencialmente atiende múltiples requests.

Esa es una fuente clásica de errores de diseño.

## Reglas sanas para empezar

Si estás empezando con Spring Boot, estas reglas te van a ayudar mucho:

1. asumí que casi todos tus servicios y repositorios serán singleton
2. diseñalos para que sean stateless
3. no guardes dentro de ellos datos variables de usuario o request
4. usá otros scopes solo cuando el problema realmente lo pida
5. no cambies de scope para “parchar” un mal diseño

## El scope no reemplaza una buena arquitectura

Esto también es importante.

No conviene pensar:

- “mi bean tiene estado raro, le cambio el scope y listo”

A veces el problema real no está en el scope, sino en el diseño.

Capaz esa clase no debería almacenar ese estado.
Capaz ese dato debería viajar como parámetro.
Capaz debería existir otro objeto temporal.
Capaz la información pertenece a otro nivel.

El scope ayuda, pero no reemplaza el criterio arquitectónico.

## Un ejemplo conceptual comparando scopes

Supongamos esta clase:

```java
@Component
public class GeneradorId {
}
```

### Si es singleton
Spring crea una sola instancia y la comparte.

### Si es prototype
Spring crea una nueva cada vez que alguien la pide al contenedor.

### Si es request
Spring crea una nueva por cada request web.

### Si es session
Spring crea una nueva por cada sesión de usuario.

La clase es la misma. Lo que cambia es cómo Spring decide administrarla.

## Qué scope vas a usar más en la práctica

En una aplicación Spring Boot típica, lo más común es:

- **singleton** para servicios, repositorios, controladores y configuraciones
- `request` o `session` solo en escenarios puntuales
- `prototype` en casos bastante específicos

O sea: no necesitás dominar veinte scopes distintos desde el primer día.

Lo más importante es entender bien:

- qué es un scope
- por qué singleton es el default
- por qué un singleton debería evitar estado mutable compartido

## Relación con el ciclo de vida del bean

En el tema anterior viste que un bean tiene un ciclo de vida.

El scope modifica ese ciclo.

Por ejemplo:

- un singleton suele vivir mientras vive el contexto
- un bean request vive lo que dura el request
- un bean session vive lo que dura la sesión
- un prototype se crea cuando se necesita y su gestión posterior cambia

Por eso scope y ciclo de vida están íntimamente conectados.

## Error común: pensar que más scopes es más “pro”

A veces, cuando alguien descubre varios scopes, puede sentir la tentación de usarlos por sofisticación.

Pero en la práctica, un diseño simple con beans singleton stateless suele ser mucho más sólido que uno lleno de scopes especiales sin necesidad.

Usar un scope más raro no te vuelve más avanzado automáticamente.

A veces, lo más profesional es justamente elegir la opción más simple y correcta.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> el scope define cómo existe un bean dentro del contenedor, y esa decisión impacta directamente en su vida, su reutilización y su seguridad de diseño.

## Resumen

- El scope define el alcance y la forma de vida de un bean.
- El scope por defecto es `singleton`.
- Singleton significa, en la práctica, una instancia compartida dentro del contexto.
- La mayoría de los beans comunes en Spring Boot suelen ser singleton.
- Los beans singleton conviene que sean stateless.
- También existen scopes como `prototype`, `request` y `session`.
- Elegir un scope correcto depende de la naturaleza del objeto, no solo de preferencias personales.

## Próximo tema

En el próximo tema vas a ver cómo crear beans de forma explícita con `@Configuration` y `@Bean`, y en qué casos conviene hacerlo en lugar de depender solo del component scanning.
