---
title: "Cómo se crea un proyecto Spring Boot y cuál es su estructura"
description: "Creación del primer proyecto Spring Boot: Spring Initializr, dependencias iniciales, estructura del proyecto y arranque de la aplicación."
order: 3
module: "Primer proyecto Spring Boot"
level: "intro"
draft: false
---

Hasta acá viste dos ideas importantes:

- qué es Spring Framework
- qué es Spring Boot y por qué acelera el desarrollo

Ahora toca dar el primer paso práctico: **crear un proyecto Spring Boot real** y entender cómo está organizado.

Este tema es importante porque muchas personas empiezan copiando proyectos sin comprender bien qué archivos aparecen, para qué sirven y qué se espera encontrar dentro de una aplicación Spring Boot.

La idea no es solamente que sepas “crear un proyecto”, sino que empieces a leer su estructura con criterio.

## El objetivo de este primer proyecto

En este tema vas a aprender a:

- crear un proyecto Spring Boot desde cero
- entender qué hace Spring Initializr
- reconocer los archivos principales del proyecto
- distinguir qué parte corresponde a Java, cuál al build y cuál a la configuración
- correr la aplicación por primera vez
- empezar a leer una estructura típica de proyecto

No vamos a meternos todavía con controladores, base de datos o seguridad. Primero conviene entender bien el punto de partida.

## La forma más común de crear un proyecto Spring Boot

La forma más habitual de empezar un proyecto Spring Boot es usar **Spring Initializr**.

Spring Initializr es una herramienta que genera una base de proyecto lista para empezar a trabajar. En lugar de armar todo manualmente, elegís algunas opciones iniciales y obtenés un proyecto preparado con:

- estructura básica
- configuración mínima
- sistema de build
- dependencias elegidas
- clase principal de arranque

Dicho de forma simple: Initializr te evita construir a mano el esqueleto inicial.

## Qué decisiones te pide Spring Initializr

Cuando creás un proyecto con Spring Initializr, normalmente tenés que definir algunas cosas.

### 1. El sistema de build

Generalmente podés elegir entre:

- **Maven**
- **Gradle**

Ambos sirven. Para empezar, muchos cursos y ejemplos usan Maven por ser muy común en el ecosistema Java.

Lo importante no es discutir cuál es “mejor”, sino entender que uno de ellos será el encargado de:

- resolver dependencias
- compilar
- correr tests
- generar el artefacto final

## 2. El lenguaje

En este caso el lenguaje será **Java**.

Spring Boot también puede convivir con Kotlin, pero para este curso el foco es Java.

## 3. La versión de Spring Boot

Acá elegís la versión del framework con la que va a arrancar el proyecto.

Siempre conviene tener presente que la versión impacta en:

- dependencias transitivas
- compatibilidad con librerías
- soporte de ciertas features
- versión mínima o recomendada de Java

Para aprender, lo razonable es trabajar con una versión estable y actual del ecosistema, no con una demasiado vieja.

## 4. Los datos del proyecto

Initializr también te pide algunos metadatos.

Por ejemplo:

- `group`
- `artifact`
- `name`
- `description`
- `package name`

Estos valores ayudan a definir la identidad técnica del proyecto.

### Group

Suele representar una especie de espacio de nombres general, muy parecido al paquete base.

Ejemplo:

```text
com.gabrielsurvila
```

### Artifact

Es el nombre técnico del proyecto o módulo.

Ejemplo:

```text
springboot-lab
```

### Package name

Es el paquete base desde el cual suele arrancar la aplicación.

Ejemplo:

```text
com.gabrielsurvila.springbootlab
```

## 5. La versión de Java

También elegís con qué versión de Java querés trabajar.

Esto importa porque Spring Boot se ejecuta sobre la JVM y ciertas versiones del ecosistema están pensadas para versiones modernas de Java.

A nivel de aprendizaje, lo importante es que:

- el proyecto use una versión actual y soportada
- tu JDK local coincida con la versión configurada
- entiendas que una incompatibilidad de versión puede romper el build o el arranque

## 6. Las dependencias iniciales

Otro punto clave de Initializr es que te deja marcar dependencias desde el principio.

Por ejemplo, más adelante podrías agregar:

- Spring Web
- Validation
- Spring Data JPA
- Spring Security
- DevTools
- PostgreSQL Driver

Pero para un proyecto inicial conviene empezar lo más liviano posible.

Podés arrancar incluso con una base mínima e ir agregando dependencias conforme el curso avance.

## Qué te genera Spring Initializr

Cuando descargás el proyecto, obtenés un `.zip` con una estructura ya preparada.

Si lo descomprimís y lo abrís en el editor, vas a ver algo parecido a esto:

```text
springboot-lab/
  src/
    main/
      java/
      resources/
    test/
      java/
  pom.xml
```

Si usás Gradle, en vez de `pom.xml` vas a ver archivos propios de Gradle.

## Estructura general del proyecto

Veamos qué representa cada parte.

## `src/main/java`

Acá vive el código principal de la aplicación.

Normalmente dentro de esa carpeta vas a encontrar el paquete base del proyecto, por ejemplo:

```text
src/main/java/com/gabrielsurvila/springbootlab
```

Y dentro de ese paquete, al principio, suele aparecer la clase principal.

## `src/main/resources`

Acá van recursos que la aplicación necesita en tiempo de ejecución.

Por ejemplo:

- archivos de configuración
- templates
- archivos estáticos
- mensajes
- recursos complementarios

En una app Spring Boot, una de las cosas más comunes acá es encontrar:

```text
application.properties
```

o también:

```text
application.yml
```

## `src/test/java`

Acá van las pruebas.

Aunque al principio tal vez no les prestes mucha atención, desde el comienzo conviene entender que el proyecto ya nace con un lugar específico para testear.

Eso no es un detalle menor: muestra que el testing no es un agregado raro, sino una parte natural del desarrollo.

## El archivo de build

Si usás Maven, el archivo central va a ser:

```text
pom.xml
```

Ese archivo define, entre otras cosas:

- coordenadas del proyecto
- versión
- dependencias
- plugins
- configuración del build

En otras palabras, buena parte de la vida técnica del proyecto pasa por ahí.

## La clase principal de Spring Boot

Uno de los archivos más importantes del arranque es la clase principal.

Suele verse más o menos así:

```java
package com.gabrielsurvila.springbootlab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SpringbootLabApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringbootLabApplication.class, args);
    }
}
```

Esta clase cumple un rol central: es el punto de entrada de la aplicación.

## Qué significa `@SpringBootApplication`

Esa anotación resume varias cosas importantes de Spring Boot.

Por ahora no hace falta desarmarla por completo, pero sí entender que le dice a Spring Boot que arranque una aplicación con comportamiento típico de Boot.

Más adelante vas a estudiar esta anotación con mucho más detalle.

En este momento alcanza con entender que:

- marca la clase principal
- habilita el arranque de la aplicación
- participa en el escaneo de componentes
- forma parte de la configuración automática típica de Boot

## Qué hace `SpringApplication.run(...)`

Esta línea:

```java
SpringApplication.run(SpringbootLabApplication.class, args);
```

es la que dispara el arranque.

Dicho de forma conceptual, ahí Spring Boot:

- crea el contexto de aplicación
- procesa configuración
- carga dependencias necesarias
- inicializa beans
- levanta la infraestructura correspondiente

Todavía no hace falta entrar en el detalle interno de cada fase, pero sí conviene que entiendas que esa llamada es mucho más que un simple `main` vacío.

## Cómo se corre el proyecto

Una vez creado el proyecto, lo normal es abrirlo con un IDE como IntelliJ IDEA o VS Code con soporte Java.

Desde ahí, muchas veces podés correr directamente la clase principal.

También es posible arrancarlo desde la terminal usando el sistema de build.

Por ejemplo, con Maven es común usar comandos para:

- compilar
- testear
- correr la aplicación
- empaquetar el proyecto

En este punto no importa memorizar comandos todavía. Lo importante es saber que Spring Boot no depende exclusivamente del IDE: el proyecto también puede ser operado desde el build tool.

## Qué pasa cuando la app arranca bien

Cuando todo sale bien, en la consola vas a ver logs de arranque.

Es común que aparezcan mensajes indicando:

- que la aplicación inició
- qué perfil está activo
- cuánto tardó en arrancar
- si levantó servidor embebido
- si hubo errores de configuración

Aprender a leer ese arranque es parte de aprender Spring Boot.

No hace falta entender cada línea desde el día uno, pero sí conviene empezar a mirar la consola con atención.

## El servidor embebido

Uno de los puntos más cómodos de Spring Boot es que muchas aplicaciones web pueden correr con un servidor embebido.

Eso quiere decir que no necesitás, en muchos casos, instalar y configurar manualmente un servidor externo para empezar a desarrollar.

Si tu proyecto incluye dependencias web, Spring Boot puede levantar una aplicación ejecutable con servidor incorporado.

Esta es una de las razones por las que el arranque de proyectos modernos con Boot resulta tan práctico.

## La importancia del paquete base

Hay un detalle de estructura que desde temprano conviene respetar: la ubicación de la clase principal.

En general, la clase anotada con `@SpringBootApplication` conviene ponerla en un paquete raíz alto dentro de la aplicación.

¿Por qué?

Porque a partir de ahí Spring Boot suele escanear componentes en subpaquetes.

Por ejemplo, si tu clase principal está en:

```text
com.gabrielsurvila.springbootlab
```

entonces es natural que debajo tengas cosas como:

```text
com.gabrielsurvila.springbootlab.controller
com.gabrielsurvila.springbootlab.service
com.gabrielsurvila.springbootlab.repository
com.gabrielsurvila.springbootlab.config
```

Si desordenás esa estructura demasiado al principio, pueden aparecer comportamientos raros de escaneo o configuraciones menos claras.

## Una estructura típica cuando el proyecto empieza a crecer

Aunque al principio el proyecto nace casi vacío, con el tiempo es normal que aparezcan carpetas o paquetes como estos:

```text
controller
service
repository
dto
entity
config
exception
mapper
```

No hace falta crear todo eso desde el día uno.

De hecho, conviene evitar llenar el proyecto de carpetas vacías “por las dudas”.

Lo que sí conviene es saber que una aplicación Spring Boot real suele evolucionar hacia una organización por responsabilidades.

## El archivo `application.properties`

Uno de los primeros archivos que conviene mirar es:

```text
src/main/resources/application.properties
```

Ese archivo sirve para configurar comportamiento de la aplicación.

Más adelante lo vas a usar para cosas como:

- nombre de la app
- puerto
- perfiles
- conexión a base de datos
- logs
- propiedades propias

Al principio puede estar vacío o casi vacío, y está bien.

No es necesario llenarlo de configuración desde el primer día.

## Qué dependencias conviene tener en el primer arranque

Para un primer proyecto de aprendizaje, una estrategia razonable es esta:

- proyecto base con Spring Boot
- después agregar Spring Web cuando toque trabajar endpoints
- después Validation
- después Data JPA
- después Security

Esta progresión tiene una ventaja importante: cada tema suma complejidad cuando realmente la necesitás.

Si al principio cargás demasiadas cosas a la vez, te queda una aplicación que arranca, sí, pero con muchas piezas que todavía no entendés.

## Qué errores suelen aparecer al empezar

Hay varios errores típicos en el primer contacto con Spring Boot.

### 1. Confundir Spring con Spring Boot

A veces se crea el proyecto y se empieza a usar Boot sin entender qué está heredando de Spring.

No hace falta ser experto en Spring antes de usar Boot, pero sí conviene recordar que Boot simplifica una base más grande.

## 2. No entender qué hace el archivo de build

Muchos principiantes ven el `pom.xml` o los archivos de Gradle como algo casi decorativo.

En realidad, son archivos centrales.

Si algo falla con dependencias, plugins o versiones, muchas veces el problema pasa por ahí.

## 3. Usar demasiadas dependencias desde el día uno

Agregar de entrada web, seguridad, JPA, plantillas, drivers, cache y más cosas puede hacer que el proyecto nazca ya sobrecargado.

Para aprender, menos suele ser mejor.

## 4. No prestar atención a la estructura de paquetes

Si movés clases sin criterio o dejás la clase principal en un lugar extraño, después pueden aparecer problemas con el escaneo de componentes.

## 5. No mirar la consola de arranque

La consola de Spring Boot da muchísima información útil.

Si te acostumbrás desde temprano a leer logs, vas a detectar problemas mucho más rápido.

## Un ejemplo mínimo de proyecto recién creado

Imaginá que generaste un proyecto llamado `springboot-lab`.

Podría empezar con esta estructura:

```text
springboot-lab/
  src/
    main/
      java/
        com/
          gabrielsurvila/
            springbootlab/
              SpringbootLabApplication.java
      resources/
        application.properties
    test/
      java/
        com/
          gabrielsurvila/
            springbootlab/
              SpringbootLabApplicationTests.java
  pom.xml
```

Esa estructura, aunque parezca simple, ya contiene lo necesario para arrancar una aplicación Spring Boot y empezar a crecer desde ahí.

## Qué deberías llevarte de este tema

Si al terminar este tema te quedás con estas ideas, ya vas bien:

- Spring Initializr es la forma más común de generar un proyecto Spring Boot
- el proyecto nace con una estructura clara
- la clase principal es el punto de entrada
- `@SpringBootApplication` cumple un rol central
- el archivo de build es una pieza técnica clave
- `application.properties` será una fuente importante de configuración
- entender la estructura del proyecto desde el inicio te ahorra mucha confusión más adelante

## Resumen

- Un proyecto Spring Boot normalmente se crea con Spring Initializr.
- Al crearlo, elegís build tool, versión de Java, versión de Spring Boot y dependencias.
- La estructura principal del proyecto se organiza alrededor de `src/main/java`, `src/main/resources` y `src/test/java`.
- La clase principal contiene `@SpringBootApplication` y el `main` que arranca la aplicación.
- El archivo `pom.xml` o los archivos de Gradle controlan el build y las dependencias.
- `application.properties` o `application.yml` permiten configurar la aplicación.
- La estructura de paquetes importa, especialmente para el escaneo de componentes.

## Próximo tema

En el próximo tema vas a profundizar en la **clase principal**, el rol de `@SpringBootApplication` y qué pasa conceptualmente durante el arranque de una aplicación Spring Boot.
