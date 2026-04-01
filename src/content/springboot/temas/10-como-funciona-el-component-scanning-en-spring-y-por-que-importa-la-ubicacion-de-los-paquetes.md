---
title: "Cómo funciona el component scanning en Spring y por qué importa la ubicación de los paquetes"
description: "Una introducción al component scanning de Spring: cómo detecta clases anotadas, qué paquetes recorre y por qué la ubicación del código influye tanto en el arranque de la aplicación."
order: 10
module: "Fundamentos de Spring y Spring Boot"
level: "intro"
draft: false
---

En los temas anteriores viste varias piezas importantes:

- Spring trabaja con un contenedor
- el contenedor administra beans
- muchas clases se registran mediante anotaciones como `@Component`, `@Service`, `@Repository` o `@RestController`
- Spring Boot simplifica el arranque de la aplicación con `@SpringBootApplication`

Ahora aparece una pregunta muy natural:

> si yo marco clases con anotaciones, ¿cómo hace Spring para encontrarlas?

La respuesta está en un mecanismo central del framework: el **component scanning**.

## Qué es el component scanning

El component scanning es el proceso por el cual Spring recorre ciertos paquetes del proyecto, detecta clases anotadas como componentes y las registra como beans dentro del contenedor.

Dicho de forma simple:

- vos anotás clases
- Spring las busca en determinados paquetes
- si las encuentra y son candidatas válidas, las registra
- una vez registradas, pueden ser inyectadas en otras clases

Eso evita que tengas que registrar cada componente manualmente uno por uno.

## Por qué este mecanismo es tan importante

Sin component scanning, una aplicación con muchas clases sería muy tediosa de configurar.

Imaginá un proyecto con:

- controladores
- servicios
- repositorios
- validadores
- adaptadores
- utilidades internas
- clientes de integración

Si Spring no pudiera encontrarlos automáticamente, tendrías que ir declarando cada clase de forma explícita en configuraciones manuales.

El component scanning permite que la aplicación crezca sin que el arranque se vuelva insoportable.

## La idea central: Spring no escanea todo el disco ni todo el proyecto porque sí

Esto es importante.

Spring no busca componentes en cualquier lugar del universo. Necesita un **punto de partida**.

Ese punto de partida normalmente lo define la clase principal de la aplicación.

Por ejemplo:

```java
@SpringBootApplication
public class MiAplicacion {

    public static void main(String[] args) {
        SpringApplication.run(MiAplicacion.class, args);
    }
}
```

La anotación `@SpringBootApplication` incluye, entre otras cosas, el comportamiento de escaneo de componentes.

Por defecto, Spring empieza a escanear desde el paquete donde está esa clase y sus subpaquetes.

## Un ejemplo concreto de paquetes

Supongamos esta estructura:

```text
com.ejemplo.demo
 ├── DemoApplication.java
 ├── controller
 │    └── UsuarioController.java
 ├── service
 │    └── UsuarioService.java
 └── repository
      └── UsuarioRepository.java
```

Si `DemoApplication.java` está en `com.ejemplo.demo`, Spring puede escanear:

- `com.ejemplo.demo.controller`
- `com.ejemplo.demo.service`
- `com.ejemplo.demo.repository`

porque todos son subpaquetes del paquete principal.

Entonces, si esas clases están anotadas correctamente, Spring las detecta sin que tengas que hacer nada extra.

## Qué pasa si ubicás clases fuera del paquete base

Ahora imaginá esto:

```text
com.ejemplo.demo
 └── DemoApplication.java

com.ejemplo.usuarios.service
 └── UsuarioService.java
```

En este caso, `UsuarioService` no está dentro del árbol de paquetes que Spring recorre por defecto.

Entonces puede pasar algo como esto:

- la clase existe
- está anotada con `@Service`
- el código compila
- pero Spring no la encuentra
- por lo tanto no la registra como bean
- y luego falla la inyección en otra parte del sistema

Ese tipo de error es muy común al principio.

## Qué clases suele detectar el component scanning

Spring detecta como candidatas a bean, principalmente, clases anotadas con:

- `@Component`
- `@Service`
- `@Repository`
- `@Controller`
- `@RestController`
- otras anotaciones meta-anotadas con `@Component`

Eso significa que varias anotaciones “especializadas” también entran en el escaneo porque, en el fondo, derivan de la idea de componente.

## `@Component` como raíz conceptual

En muchos casos, cuando Spring encuentra una clase marcada como `@Service` o `@Repository`, puede tratarla como bean porque esas anotaciones son especializaciones de `@Component`.

Por ejemplo:

```java
@Service
public class PedidoService {
}
```

Aunque no veas `@Component` escrito directamente, esa clase participa del mismo mecanismo general de escaneo.

## Qué hace Spring cuando encuentra una clase candidata

Cuando el escaneo detecta una clase válida, Spring puede:

- registrarla como bean
- asignarle un nombre interno
- resolver sus dependencias
- dejarla disponible para inyección

Por ejemplo:

```java
@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;

    public PedidoService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }
}
```

Si `PedidoRepository` también fue detectado durante el escaneo, Spring puede crear ambos objetos y conectarlos.

## El component scanning no reemplaza toda forma de configuración

Esto también conviene entenderlo bien.

No todo bean nace necesariamente del escaneo automático.

A veces necesitás registrar objetos manualmente usando `@Configuration` y `@Bean`, por ejemplo cuando:

- la clase viene de una librería externa
- no podés modificar su código fuente
- necesitás construir el objeto con lógica especial
- querés controlar su creación de manera explícita

O sea:

- **component scanning** → detecta clases anotadas dentro de paquetes escaneados
- **`@Bean`** → registra objetos explícitamente desde configuración

Ambos mecanismos conviven.

## Por qué la clase principal suele ponerse en un paquete raíz

En proyectos Spring Boot se acostumbra poner la clase principal en un paquete lo más “alto” posible dentro del proyecto.

Por ejemplo:

```text
com.gabrielsurvila.springbootcurso
 ├── SpringbootCursoApplication.java
 ├── controller
 ├── service
 ├── repository
 ├── config
 └── ...
```

Esa decisión no es un capricho.

Se hace así para que el escaneo incluya naturalmente todo lo relevante.

Si la clase principal la pusieras, por ejemplo, en un paquete demasiado específico, podrías dejar afuera partes importantes del proyecto.

## Un error típico de principiantes

Uno de los errores más comunes es este:

- crear una clase con `@Service`
- intentar inyectarla
- recibir un error que dice que no se encontró ningún bean de ese tipo

Y muchas veces el problema no es la anotación en sí, sino la ubicación de la clase.

Por ejemplo:

```text
com.ejemplo.app.main
 └── AppApplication.java

com.ejemplo.servicios
 └── ClienteService.java
```

Si el paquete base del arranque es `com.ejemplo.app.main`, entonces `com.ejemplo.servicios` puede quedar fuera del escaneo por defecto.

## Cómo se ve ese tipo de problema en la práctica

Podrías tener algo así:

```java
@RestController
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }
}
```

Y Spring podría fallar al iniciar diciendo que no puede crear `ClienteController` porque no existe un bean de tipo `ClienteService`.

Eso no siempre significa que falte `@Service`.

A veces significa que Spring simplemente nunca llegó a escanear esa clase.

## Cómo se puede ajustar el escaneo si hace falta

Aunque por defecto Spring Boot escanea desde el paquete de la clase principal hacia abajo, ese comportamiento puede personalizarse.

Por ejemplo, se puede indicar explícitamente qué paquetes escanear.

Conceptualmente sería algo así:

```java
@SpringBootApplication
@ComponentScan(basePackages = {
    "com.ejemplo.app",
    "com.ejemplo.moduloexterno"
})
public class MiAplicacion {
}
```

Eso existe y es útil, pero al principio no conviene abusar de esa solución.

Lo normal y más sano es organizar bien los paquetes desde el principio.

## Qué conviene hacer en la mayoría de los proyectos

En la enorme mayoría de los casos, conviene:

- tener una clase principal en un paquete raíz
- ubicar debajo de ese paquete todas las capas del proyecto
- dejar que Spring Boot use su escaneo por defecto

Por ejemplo:

```text
com.gabrielsurvila.curso
 ├── CursoApplication.java
 ├── controller
 ├── service
 ├── repository
 ├── config
 ├── dto
 └── domain
```

Esta estructura suele evitar muchos dolores de cabeza.

## Relación entre escaneo y arquitectura

Aunque el component scanning parece un tema “técnico”, también afecta la arquitectura.

Una estructura de paquetes desordenada puede traer:

- componentes difíciles de ubicar
- clases fuera del escaneo
- dependencias confusas
- más configuración manual de la necesaria

En cambio, una estructura clara ayuda a que:

- el escaneo funcione bien
- el proyecto sea más fácil de leer
- las capas estén mejor separadas
- el arranque sea más predecible

## Escaneo no significa que todo deba ser componente

Otro error común es anotar demasiadas clases solo para que “Spring las vea”.

No toda clase del proyecto tiene que ser bean.

Por ejemplo, muchas veces no hace falta anotar:

- DTOs
- entidades JPA
- clases de utilidad sin estado si no necesitan contenedor
- modelos simples de dominio

El component scanning es para componentes que tiene sentido que el contenedor administre.

## Cómo pensar este tema de manera simple

Podés resumirlo así:

1. Spring necesita saber qué clases administrar.
2. Para eso escanea ciertos paquetes.
3. Si encuentra clases anotadas como componentes, las registra como beans.
4. Si una clase queda fuera del paquete escaneado, Spring no la ve.
5. Por eso la estructura de paquetes importa mucho.

## Un ejemplo mental útil

Pensá el component scanning como si Spring tuviera una linterna.

Esa linterna no ilumina todo el proyecto completo sin criterio.

Ilumina desde un punto de arranque hacia ciertos paquetes.

Si una clase está dentro de la zona iluminada y tiene una anotación adecuada, Spring puede verla.

Si está fuera de esa zona, para Spring prácticamente no existe.

## Qué conviene llevarte de este tema

No necesitás memorizar opciones avanzadas de escaneo todavía.

Lo más importante en esta etapa es entender estas ideas:

- Spring detecta componentes automáticamente
- no lo hace en cualquier lugar, sino desde un paquete base
- la clase principal suele definir ese punto de arranque
- por eso la ubicación de los paquetes importa muchísimo
- muchas veces un error de bean inexistente se debe a un problema de escaneo

Con entender bien esto, ya empezás a leer la estructura de una aplicación Spring Boot con mucho más criterio.

## Resumen

- El component scanning es el mecanismo con el que Spring detecta clases anotadas y las registra como beans.
- Por defecto, Spring Boot escanea desde el paquete de la clase principal y sus subpaquetes.
- `@Component`, `@Service`, `@Repository`, `@Controller` y `@RestController` participan de este mecanismo.
- Si una clase está fuera del paquete escaneado, Spring puede no detectarla.
- La estructura de paquetes del proyecto importa mucho para que todo funcione de forma natural.
- Aunque el escaneo es muy útil, no reemplaza por completo la configuración explícita con `@Bean`.

## Próximo tema

En el próximo tema vas a ver con más claridad cómo se organizan las capas más comunes de una aplicación Spring Boot, para entender mejor dónde suele ir cada clase dentro del proyecto.
