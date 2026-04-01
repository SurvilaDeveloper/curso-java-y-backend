---
title: "Qué son los starters en Spring Boot y cómo se agregan dependencias"
description: "Entender qué son los starters, por qué simplifican Spring Boot y cómo se manejan dependencias en Maven o Gradle sin perder el control del proyecto."
order: 5
module: "Fundamentos de Spring y Spring Boot"
level: "intro"
draft: false
---

Hasta acá ya viste qué es Spring, qué es Spring Boot, cómo se crea un proyecto y cuál es la función de la clase principal.

Ahora toca entender una de las ideas que más hacen que Spring Boot se sienta cómodo de usar desde el principio: los **starters**.

Cuando alguien empieza con Spring Boot, suele escuchar cosas como:

- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-test`
- `spring-boot-starter-security`

A simple vista parecen nombres de dependencias más, pero en realidad expresan una idea muy importante del framework: en lugar de obligarte a descubrir manualmente todas las librerías que necesitás para una determinada tarea, Boot te ofrece paquetes de dependencias ya pensados para casos de uso comunes.

Esa decisión ahorra tiempo, reduce errores y hace que arrancar un proyecto sea mucho más simple.

## El problema de manejar dependencias manualmente

Imaginá una aplicación Java tradicional donde querés construir una API web.

Si tuvieras que resolver todo manualmente, probablemente tendrías que investigar e incorporar varias cosas por separado:

- una librería para HTTP o MVC
- una para serializar JSON
- una para logs
- una para validación
- una para manejar configuración
- una versión compatible de cada una

Y además tendrías que asegurarte de que todas esas dependencias sean compatibles entre sí.

Eso no solo lleva tiempo. También abre la puerta a varios problemas:

- conflictos de versiones
- librerías incompatibles
- configuraciones repetitivas
- proyectos difíciles de mantener
- setups distintos entre equipos

Spring Boot intenta reducir ese trabajo inicial con una combinación de ideas. Una de las más visibles son los starters.

## Qué es un starter

Un **starter** es una dependencia “agrupadora” que reúne otras dependencias necesarias para un objetivo concreto.

Dicho más simple:

> un starter no suele ser la funcionalidad final en sí misma, sino una puerta de entrada conveniente a un conjunto de librerías relacionadas.

Por ejemplo, si querés desarrollar una aplicación web con Spring Boot, en lugar de buscar a mano cada pieza necesaria, agregás:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

Y con eso Boot trae una base razonable para desarrollar aplicaciones web.

## La idea detrás de los starters

Los starters representan muy bien la filosofía de Spring Boot.

Boot parte de esta idea:

> para los casos comunes, el framework debería darte una solución estándar, práctica y coherente.

Es decir, si miles de personas crean APIs web, proyectos con JPA, tests o seguridad, tiene sentido ofrecer puntos de arranque ya preparados.

Así:

- empezás más rápido
- escribís menos configuración manual
- evitás investigar veinte librerías antes de hacer tu primer endpoint
- mantenés una base técnica más consistente

## Qué resuelve un starter

Un starter resuelve varias cosas al mismo tiempo.

### 1. Agrupa dependencias relacionadas

En lugar de agregar muchas piezas por separado, agregás una sola dependencia principal.

### 2. Usa versiones alineadas

Spring Boot maneja un ecosistema de versiones compatibles. Eso reduce bastante los choques entre librerías.

### 3. Hace más legible el proyecto

Cuando alguien ve `spring-boot-starter-data-jpa`, entiende enseguida que el proyecto trabaja con persistencia usando Spring Data JPA.

### 4. Facilita el arranque

Te deja concentrarte antes en construir funcionalidad que en resolver setup.

## Starters comunes en Spring Boot

Estos son algunos de los starters más habituales.

### `spring-boot-starter`

Es un starter base. Suele estar presente como fundamento de otros starters.

### `spring-boot-starter-web`

Se usa para aplicaciones web basadas en Spring MVC, controladores REST, serialización JSON y ejecución embebida con servidor integrado.

En muchos cursos y proyectos iniciales, este es el starter más importante.

### `spring-boot-starter-test`

Agrupa herramientas de testing para trabajar con pruebas unitarias e integradas.

### `spring-boot-starter-data-jpa`

Se usa para persistencia con JPA y Spring Data.

### `spring-boot-starter-security`

Agrega la base para trabajar con seguridad, autenticación y autorización.

### `spring-boot-starter-validation`

Permite usar validación declarativa sobre DTOs y otros objetos.

### `spring-boot-starter-thymeleaf`

Se usa si querés renderizar vistas del lado del servidor con Thymeleaf.

### `spring-boot-starter-actuator`

Agrega herramientas para observabilidad, salud, métricas y monitoreo.

## No todos los proyectos necesitan los mismos starters

Este es un punto importante.

Que exista un starter no significa que debas agregarlo “por las dudas”.

Conviene que cada dependencia entre al proyecto porque cumple una función real.

Por ejemplo:

- si vas a hacer una API REST, probablemente necesites `web`
- si además vas a persistir datos, sumarás `data-jpa`
- si vas a validar entradas, necesitarás `validation`
- si querés seguridad, sumarás `security`

Pero no hay necesidad de cargar un proyecto con starters que todavía no cumplen ninguna función.

Una dependencia innecesaria agrega ruido, aumenta el peso conceptual del proyecto y puede abrir configuraciones automáticas que todavía no querés.

## Cómo se agregan dependencias en Spring Boot

Esto depende del sistema de build que estés usando.

Los dos más comunes son:

- **Maven**
- **Gradle**

## Agregar dependencias con Maven

En Maven, las dependencias se definen dentro del archivo `pom.xml`.

Ejemplo:

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
</dependencies>
```

Fijate que, en muchos casos, ni siquiera hace falta poner una versión explícita para cada starter.

Eso ocurre porque Spring Boot gestiona versiones de forma centralizada a través de su ecosistema.

## Agregar dependencias con Gradle

En Gradle, normalmente las dependencias se agregan en `build.gradle` o `build.gradle.kts`.

Ejemplo con sintaxis tradicional:

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

Ejemplo con Kotlin DSL:

```kotlin
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}
```

La idea de fondo es la misma: declarar qué necesita el proyecto y dejar que la herramienta resuelva el árbol de dependencias.

## Qué pasa después de agregar una dependencia

Cuando agregás una dependencia al proyecto:

- el sistema de build la descarga
- resuelve sus dependencias transitivas
- la deja disponible en el classpath
- el IDE suele reindexar o sincronizar el proyecto

En Spring Boot, además, esa presencia en el classpath puede activar ciertas configuraciones automáticas.

Esto es muy importante.

Porque no solo sumás librerías: también podés estar habilitando comportamiento automático de Boot.

Por ejemplo, cuando agregás dependencias web, Boot detecta que el proyecto tiene piezas necesarias para una aplicación web y puede configurar bastante infraestructura por vos.

## Dependencias directas y dependencias transitivas

Cuando agregás un starter, muchas veces no solo entra esa dependencia principal, sino también otras que arrastra.

A eso se lo suele llamar **dependencias transitivas**.

Por ejemplo, un starter web puede terminar trayendo piezas relacionadas con:

- Spring MVC
- Jackson
- logging
- servidor embebido

Eso no significa que tengas que conocer de memoria cada dependencia transitiva desde el día uno.

Pero sí conviene entender la idea:

> una sola línea en tu archivo de build puede estar incorporando muchas librerías por debajo.

## Por qué Spring Boot no te obliga a poner versiones todo el tiempo

Una de las ventajas más prácticas de Boot es que maneja una alineación de versiones del ecosistema.

Eso significa que Boot ya define un conjunto de versiones compatibles entre sí para muchas dependencias comunes.

Así, vos no tenés que estar resolviendo manualmente si cierta versión de una librería combina bien con otra.

Eso baja muchísimo la fricción inicial.

Sin embargo, esto no significa que pierdas control total.

Podés inspeccionar el árbol de dependencias, excluir librerías concretas o incluso sobrescribir versiones cuando realmente lo necesitás.

## Un ejemplo mental útil

Pensá los starters como un “combo” bien armado.

Si fueras a una cafetería y quisieras pedir cada ingrediente por separado, tardarías más y probablemente te olvidarías de algo.

En cambio, un combo ya viene pensado para una necesidad concreta.

Con los starters pasa algo parecido.

No te quitan libertad, pero te ofrecen una base razonable para arrancar sin fricción innecesaria.

## Qué riesgo hay en usar starters sin entenderlos

Aunque los starters simplifican mucho, tampoco conviene usarlos de forma ciega.

Hay dos errores comunes:

### 1. Agregar starters “por si acaso”

Eso termina cargando el proyecto de cosas que todavía no necesitás.

### 2. No entender qué habilitan

Algunas dependencias pueden activar auto-configuraciones o comportamientos que conviene comprender, al menos a nivel general.

La buena práctica no es evitar starters. La buena práctica es usarlos con criterio.

## Cómo mirar qué dependencias tiene un proyecto

No hace falta memorizarlo todo, pero sí conviene saber que podés inspeccionar el árbol de dependencias.

Con Maven y Gradle existen comandos para eso.

Por ejemplo, en Maven suele usarse algo como:

```bash
mvn dependency:tree
```

Y eso te deja ver qué dependencias entraron y por qué.

Más adelante, cuando el proyecto crezca, esto te va a servir para:

- detectar librerías duplicadas
- entender conflictos
- revisar dependencias transitivas
- analizar qué está trayendo cada starter

## Ejemplo práctico mínimo

Supongamos que querés un proyecto muy básico con endpoints HTTP y validación.

En Maven podrías tener algo así:

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

Con esas tres piezas ya tendrías una base bastante razonable para:

- exponer endpoints
- recibir y validar datos
- empezar a testear

## Qué relación tienen los starters con Spring Initializr

Cuando creás un proyecto desde Spring Initializr y marcás opciones como:

- Spring Web
- Validation
- Spring Data JPA
- Security

lo que Initializr está haciendo por debajo es armarte un proyecto con los starters correspondientes.

O sea, Initializr y los starters están muy conectados.

Initializr te facilita seleccionar dependencias desde una interfaz.

Los starters son la forma concreta en que esas capacidades entran al proyecto.

## Cuándo conviene agregar una dependencia nueva

Lo más sano es agregar dependencias cuando el proyecto ya necesita una capacidad nueva.

Por ejemplo:

- ahora voy a exponer endpoints → agrego `web`
- ahora voy a validar requests → agrego `validation`
- ahora voy a persistir datos → agrego `data-jpa`
- ahora voy a trabajar seguridad → agrego `security`

Ese crecimiento progresivo ayuda a que entiendas qué aporta cada cosa.

## Una idea importante para tu forma de aprender

Como vos querés armar un curso bien progresivo, este tema es clave porque enseña una costumbre sana:

> no llenar el proyecto desde el comienzo con todas las tecnologías posibles.

Es mejor que cada dependencia entre en el momento en que empieza a tener sentido.

Así el proyecto se entiende mejor y cada nuevo bloque del curso introduce una capacidad real, en lugar de meter herramientas adelantadas.

## Resumen

- Un starter es una dependencia agrupadora pensada para un caso de uso común.
- Spring Boot usa starters para simplificar el arranque de proyectos.
- Los starters reducen configuración manual, errores de compatibilidad y ruido inicial.
- Se agregan desde Maven o Gradle, según el sistema de build del proyecto.
- Un starter puede traer dependencias transitivas.
- No conviene agregar starters “por las dudas”.
- Spring Initializr usa esta lógica para armar proyectos rápidamente.

## Próximo tema

En el próximo tema vas a ver cómo funciona la **configuración automática** en Spring Boot y por qué el framework puede dejar tantas cosas listas con tan poca configuración explícita.
