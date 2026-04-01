---
title: "Qué es Spring Framework y qué problema resuelve"
description: "Primer contacto con Spring Framework: qué es, por qué existe y qué problemas intenta resolver en aplicaciones Java."
order: 1
module: "Fundamentos de Spring y Spring Boot"
level: "intro"
draft: false
---

Spring Framework es un framework para Java que ayuda a construir aplicaciones de una forma más ordenada, modular y mantenible.

Dicho de forma simple: Spring apareció para resolver varios de los problemas típicos de las aplicaciones Java tradicionales, donde el código tendía a quedar demasiado acoplado, difícil de probar y lleno de configuración repetitiva.

No nació como una herramienta “mágica”, sino como una propuesta para organizar mejor una aplicación y delegar en el framework ciertas tareas que, hechas manualmente, suelen volver el proyecto más rígido y difícil de escalar.

## La idea general de Spring

Cuando una aplicación crece, empiezan a aparecer muchas clases que dependen unas de otras.

Por ejemplo:

- un controlador necesita un servicio
- ese servicio necesita un repositorio
- el repositorio necesita una conexión o un acceso a datos
- otras clases necesitan configuración, utilidades, validadores, clientes HTTP, etc.

Si uno crea todo manualmente con `new`, el código empieza a quedar muy acoplado.

```java
public class PedidoService {

    private PedidoRepository pedidoRepository = new PedidoRepository();

    public void crearPedido() {
        pedidoRepository.guardar();
    }
}
```

A primera vista parece simple, pero este enfoque trae varios problemas:

- la clase decide por sí sola qué dependencia usar
- reemplazar implementaciones se vuelve incómodo
- testear es más difícil
- el código queda más rígido
- el crecimiento del sistema aumenta la complejidad

Spring propone otra idea: que las dependencias no las cree cada clase por su cuenta, sino que exista un contenedor que las administre y las inyecte cuando haga falta.

## Qué problema intenta resolver Spring

Spring no resuelve un único problema. Resuelve un conjunto de problemas comunes en aplicaciones Java empresariales o medianamente grandes.

### 1. Exceso de acoplamiento

Sin una buena arquitectura, las clases quedan muy atadas entre sí.

Cuando una clase crea internamente sus dependencias, cambiar una parte del sistema puede impactar en muchas otras. Eso vuelve más difícil mantener, probar y evolucionar el proyecto.

Spring reduce ese acoplamiento mediante **inyección de dependencias**.

## 2. Código difícil de testear

Si una clase está llena de dependencias creadas manualmente, testearla en aislamiento se vuelve incómodo.

Por ejemplo, si un servicio crea por dentro su repositorio, en una prueba no podés reemplazarlo fácilmente por un mock o un stub.

Con Spring, la clase recibe lo que necesita desde afuera. Eso la vuelve más simple de probar.

## 3. Mucha configuración repetitiva

En aplicaciones Java antiguas era común dedicar demasiado tiempo a cablear componentes, configurar objetos, inicializar recursos y conectar piezas del sistema manualmente.

Spring busca centralizar y simplificar esa organización.

## 4. Falta de una estructura consistente

Sin una base clara, cada proyecto puede terminar organizado de una forma distinta, con capas mezcladas y responsabilidades poco definidas.

Spring favorece una estructura más clara, donde cada tipo de clase cumple un rol.

Por ejemplo:

- controladores para exponer endpoints o manejar entrada
- servicios para reglas de negocio
- repositorios para acceso a datos
- configuraciones para definir beans o ajustes del sistema

## 5. Dificultad para escalar aplicaciones

Una aplicación pequeña puede sobrevivir con decisiones improvisadas. Una aplicación mediana o grande no.

Spring fue pensado para acompañar aplicaciones que crecen, manteniendo una base más limpia y extensible.

## El corazón de Spring: el contenedor

Uno de los conceptos más importantes de Spring es el **contenedor IoC**.

IoC significa **Inversion of Control**.

La idea es que el control de la creación y ensamblado de objetos ya no quede disperso por toda la aplicación, sino que pase al framework.

En lugar de esto:

```java
PedidoRepository pedidoRepository = new PedidoRepository();
PedidoService pedidoService = new PedidoService(pedidoRepository);
```

Spring puede encargarse de crear esos objetos y conectarlos.

Ese “contenedor” administra objetos que en Spring suelen llamarse **beans**.

## Qué es un bean

En Spring, un bean es un objeto administrado por el contenedor.

Eso significa que Spring puede:

- crearlo
- configurarlo
- inyectarlo en otras clases
- controlar parte de su ciclo de vida

Por ejemplo, si una clase está marcada como componente, Spring puede detectarla y registrarla.

```java
@Service
public class PedidoService {
}
```

A partir de ahí, Spring puede inyectarla en otra clase:

```java
@RestController
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }
}
```

Fijate que `PedidoController` no crea el servicio con `new`.

Eso es una de las bases más importantes del enfoque Spring.

## Inyección de dependencias

La **inyección de dependencias** es el mecanismo por el cual una clase recibe lo que necesita desde afuera, en vez de construirlo internamente.

Este concepto tiene varias ventajas:

- baja el acoplamiento
- mejora la legibilidad
- facilita pruebas
- permite reemplazar implementaciones
- hace más flexible la arquitectura

Este tema después lo vas a ver con más profundidad, pero desde ya conviene quedarte con esta idea:

> Spring no quiere que cada clase sea una isla. Quiere que las piezas del sistema se conecten de forma controlada y mantenible.

## Qué tipo de aplicaciones se pueden hacer con Spring

Spring no se limita a un solo tipo de proyecto.

Con el ecosistema Spring se pueden construir, entre otras cosas:

- APIs REST
- aplicaciones web
- sistemas empresariales
- aplicaciones con acceso a base de datos
- sistemas con seguridad y autenticación
- microservicios
- procesamiento batch
- integración con mensajería
- aplicaciones reactivas

Por eso Spring se volvió tan importante en el mundo Java.

No es solo un framework aislado, sino un ecosistema muy grande.

## Spring Framework no es lo mismo que Spring Boot

Esto es importante desde el principio.

### Spring Framework
Es la base. Ahí viven conceptos centrales como:

- IoC
- beans
- inyección de dependencias
- configuración
- Spring MVC
- acceso a datos
- seguridad, entre otros módulos del ecosistema

### Spring Boot
Es una herramienta construida sobre Spring para simplificar mucho el arranque y desarrollo de aplicaciones.

Boot no reemplaza a Spring. Lo hace más rápido de usar.

Más adelante vas a ver esta diferencia con claridad, pero desde el comienzo conviene separar estas ideas:

- **Spring Framework** = base conceptual y técnica
- **Spring Boot** = forma más rápida, práctica y moderna de usar gran parte de esa base

## Por qué Spring tuvo tanta adopción

Spring creció mucho porque ofreció una alternativa más simple y flexible frente a modelos anteriores del ecosistema Java empresarial.

Su propuesta fue atractiva porque permitía:

- escribir código más testeable
- reducir configuración compleja
- organizar mejor aplicaciones grandes
- trabajar con capas claras
- integrar muchos tipos de tecnologías
- mantener cierta consistencia entre proyectos

En otras palabras, Spring ayudó a que desarrollar en Java fuese más productivo y menos doloroso en muchos escenarios reales.

## Un ejemplo conceptual sin Spring y con Spring

### Sin Spring

```java
public class NotificacionService {

    private EmailClient emailClient = new EmailClient();

    public void enviarBienvenida() {
        emailClient.enviar("Bienvenido");
    }
}
```

Acá `NotificacionService` queda acoplado a `EmailClient`.

### Con una idea al estilo Spring

```java
public class NotificacionService {

    private final EmailClient emailClient;

    public NotificacionService(EmailClient emailClient) {
        this.emailClient = emailClient;
    }

    public void enviarBienvenida() {
        emailClient.enviar("Bienvenido");
    }
}
```

En esta segunda versión, la clase ya no decide cómo crear `EmailClient`.

Eso abre la puerta a que un contenedor, como Spring, se encargue de proporcionarlo.

## Qué no hace Spring por sí solo

También es importante no idealizarlo.

Spring no hace que una aplicación sea buena automáticamente.

No reemplaza:

- el diseño correcto
- la buena separación de responsabilidades
- una buena base de Java
- el criterio arquitectónico
- el modelado del dominio
- las buenas prácticas de testing

Spring ayuda muchísimo, pero sigue siendo una herramienta. Si se usa mal, también puede terminar acompañando código desordenado.

## Idea clave para llevarte de este tema

Si tuvieras que resumir este primer tema en una sola idea, sería esta:

> Spring Framework existe para ayudarte a construir aplicaciones Java más desacopladas, configurables, testeables y mantenibles.

Y lo hace apoyándose en conceptos como:

- contenedor IoC
- beans
- inyección de dependencias
- organización por componentes

Todo lo demás que vas a aprender en Spring Boot se apoya, de una u otra forma, en esta base.

## Resumen

- Spring Framework es un framework para construir aplicaciones Java de forma más ordenada.
- Uno de sus objetivos principales es reducir el acoplamiento entre clases.
- Su contenedor administra objetos llamados beans.
- La inyección de dependencias permite que una clase reciba lo que necesita sin crearlo por su cuenta.
- Spring Framework y Spring Boot no son lo mismo.
- Spring Boot simplifica mucho el uso de Spring, pero primero conviene entender qué problema intenta resolver Spring.

## Próximo tema

En el próximo tema vas a ver qué es **Spring Boot** y por qué acelera tanto el desarrollo sobre Spring.
