---
title: "Maven"
description: "Cómo gestionar proyectos Java, dependencias y automatización de build usando Maven."
order: 25
module: "Herramientas y ecosistema"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora venís trabajando sobre todo con el lenguaje, la biblioteca estándar y conceptos de diseño.

Pero en proyectos reales no alcanza con escribir archivos `.java` sueltos.

También necesitás resolver cosas como estas:

- organizar el proyecto
- compilarlo de forma consistente
- manejar dependencias externas
- ejecutar tests
- empaquetar la aplicación
- automatizar tareas repetitivas

Para eso existen herramientas de build.

En Java, una de las más importantes y más usadas es Maven.

## Qué es Maven

Maven es una herramienta de automatización y gestión de proyectos para Java.

Sirve para:

- estructurar proyectos
- compilar código
- ejecutar tests
- descargar dependencias
- generar artefactos como `.jar`
- estandarizar tareas comunes de desarrollo

Dicho simple:

Maven ayuda a que un proyecto Java sea más ordenado, reproducible y mantenible.

## La idea general

Sin una herramienta como Maven, tendrías que encargarte manualmente de muchas cosas:

- compilar archivos en el orden correcto
- descargar librerías externas
- configurar el classpath
- empaquetar la aplicación
- repetir comandos largos una y otra vez

Maven centraliza y automatiza todo eso.

## Qué problema resuelve más claramente

Uno de los problemas más importantes que resuelve Maven es el manejo de dependencias.

Por ejemplo, si tu proyecto necesita una librería externa como:

- JUnit
- Jackson
- Lombok
- Spring Boot
- PostgreSQL driver

Maven puede descargarla y ponerla disponible para el proyecto sin que vos tengas que copiar `.jar` manualmente.

## Estructura estándar de un proyecto Maven

Maven promueve una estructura de carpetas muy conocida y muy usada.

La más importante al empezar es esta:

```text
mi-proyecto/
  pom.xml
  src/
    main/
      java/
      resources/
    test/
      java/
      resources/
```

## Qué significa esto

### `pom.xml`

Es el archivo central de configuración del proyecto Maven.

### `src/main/java`

Ahí va el código principal de la aplicación.

### `src/main/resources`

Ahí van recursos como archivos de configuración, plantillas o textos.

### `src/test/java`

Ahí van los tests.

### `src/test/resources`

Ahí van recursos usados por los tests.

## Qué es `pom.xml`

`pom.xml` es probablemente el archivo más importante en Maven.

POM significa:

**Project Object Model**

Ese archivo describe el proyecto y le dice a Maven cosas como:

- nombre
- versión
- dependencias
- plugins
- configuración de build

## Ejemplo mínimo de `pom.xml`

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>mi-proyecto</artifactId>
    <version>1.0-SNAPSHOT</version>
</project>
```

## Qué significan `groupId`, `artifactId` y `version`

### `groupId`

Identifica la organización o grupo del proyecto.

Ejemplo:

```xml
<groupId>com.example</groupId>
```

### `artifactId`

Es el nombre del artefacto o módulo.

Ejemplo:

```xml
<artifactId>mi-proyecto</artifactId>
```

### `version`

Es la versión del proyecto.

Ejemplo:

```xml
<version>1.0-SNAPSHOT</version>
```

## Qué significa `SNAPSHOT`

`SNAPSHOT` suele indicar una versión en desarrollo, no final.

Por ejemplo:

- `1.0-SNAPSHOT` → versión en construcción
- `1.0.0` → versión más estable y cerrada

## Dependencias

Una de las partes más importantes del `pom.xml` es la sección de dependencias.

Ejemplo:

```xml
<dependencies>
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>5.10.0</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## Qué expresa esto

Le estás diciendo a Maven:

- este proyecto necesita JUnit Jupiter
- esta dependencia se usa para tests

Maven se encarga de descargarla y ponerla donde corresponde.

## Qué es `scope`

`scope` indica en qué contexto se usa la dependencia.

Uno muy común al empezar es:

```xml
<scope>test</scope>
```

Eso significa que la dependencia se usa para tests, no para el código principal de producción.

## Repositorio local

Cuando Maven descarga dependencias, normalmente las guarda en un repositorio local de tu máquina.

Así no necesita bajarlas de internet cada vez.

La idea importante es que Maven gestiona automáticamente ese ciclo por vos.

## Comandos comunes de Maven

## `mvn compile`

Compila el código principal del proyecto.

## `mvn test`

Ejecuta los tests.

## `mvn package`

Compila, testea y genera un artefacto, como un `.jar`.

## `mvn clean`

Limpia archivos generados por builds anteriores.

## Ejemplo muy común

```bash
mvn clean package
```

Este comando suele:

1. limpiar el build anterior
2. compilar
3. ejecutar tests
4. empaquetar el proyecto

## `target/`

Cuando Maven genera resultados del build, suele guardarlos en la carpeta:

```text
target/
```

Ahí pueden aparecer:

- `.class`
- `.jar`
- reportes
- archivos temporales de compilación

## Ejemplo de un `.jar`

Después de `mvn package`, podrías encontrar algo así:

```text
target/mi-proyecto-1.0-SNAPSHOT.jar
```

Ese es el artefacto empaquetado.

## Ciclo de vida de Maven

Maven trabaja con la idea de lifecycle o ciclo de vida.

No hace falta memorizar todo ahora, pero sí entender que hay fases comunes como:

- `validate`
- `compile`
- `test`
- `package`
- `verify`
- `install`
- `deploy`

## Idea práctica para esta etapa

La forma más útil de pensarlo al principio es esta:

- `compile` compila
- `test` prueba
- `package` empaqueta
- `clean` limpia

Con eso ya podés trabajar muy bien en muchos proyectos iniciales.

## Crear un proyecto Maven

Una forma común es usar un arquetipo de Maven o que el IDE lo genere por vos.

Muchísima gente crea proyectos Maven directamente desde IntelliJ IDEA.

Eso está perfecto.

Lo importante es entender qué estructura se está generando y qué papel juega el `pom.xml`.

## Ejemplo simple de proyecto Maven

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>java-course-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

## Qué hacen esas propiedades

```xml
<maven.compiler.source>21</maven.compiler.source>
<maven.compiler.target>21</maven.compiler.target>
```

Indican la versión del lenguaje / bytecode que querés usar para compilar.

Eso ayuda a mantener consistencia entre entorno y proyecto.

## Plugins

Además de dependencias, Maven puede configurarse con plugins.

Los plugins agregan o controlan comportamientos del build.

Ejemplos típicos:

- compilar
- ejecutar tests
- empaquetar
- generar reportes
- crear fat jars
- integrar otras herramientas

## Idea importante

Al principio no hace falta obsesionarse con plugins.

Lo más importante es entender bien:

- estructura del proyecto
- `pom.xml`
- dependencias
- comandos básicos

Los plugins los vas incorporando a medida que los necesitás.

## Maven y JUnit

Maven se usa muchísimo junto con JUnit.

Por ejemplo, si agregás JUnit como dependencia de test, Maven puede ejecutar automáticamente los tests con:

```bash
mvn test
```

Eso conecta muy bien con la etapa de calidad y testing del roadmap.

## Maven y Spring Boot

Muchísimos proyectos Spring Boot usan Maven.

En esos proyectos, el `pom.xml` crece más y aparecen más dependencias y plugins, pero la base conceptual sigue siendo la misma.

Por eso aprender Maven ahora te prepara muy bien para el backend moderno con Java.

## Qué diferencia hay entre Maven y Gradle

Es común escuchar hablar de ambos.

### Maven

- muy declarativo
- muy estándar
- usa `pom.xml`
- estructura muy tradicional y conocida

### Gradle

- más flexible
- usa scripts
- puede ser más potente o más expresivo en ciertos casos

Para empezar en Java, Maven suele ser una muy buena puerta de entrada porque fuerza bastante orden y tiene mucha presencia en el ecosistema.

## Maven Wrapper

En algunos proyectos vas a ver archivos como:

- `mvnw`
- `mvnw.cmd`

Eso es el Maven Wrapper.

Sirve para que el proyecto pueda usar una versión concreta de Maven sin depender tanto de la instalación global de cada máquina.

No hace falta profundizar mucho ahora, pero conviene saber que existe.

## Ejemplo de flujo real simple

Supongamos que tenés este proyecto:

- código en `src/main/java`
- tests en `src/test/java`
- dependencias declaradas en `pom.xml`

Entonces podrías hacer:

```bash
mvn clean test
```

o

```bash
mvn clean package
```

Y Maven se encarga del flujo.

## Ejemplo de clase simple en proyecto Maven

Ubicada en:

```text
src/main/java/com/example/Main.java
```

```java
package com.example;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hola desde Maven");
    }
}
```

Y si compilás o empaquetás con Maven, el proyecto sigue una estructura estándar.

## Buenas prácticas iniciales con Maven

## 1. Respetar la estructura estándar

Eso hace que herramientas e IDEs entiendan mejor el proyecto.

## 2. Mantener el `pom.xml` limpio

No agregar dependencias innecesarias.

## 3. Entender qué agrega cada dependencia

No conviene copiar dependencias sin saber para qué están.

## 4. Usar scopes correctamente

Por ejemplo, no mezclar dependencias de test con producción sin motivo.

## 5. Pensar Maven como parte del proyecto, no solo como “un comando”

Maven describe y organiza el proyecto completo.

## Ejemplo completo de `pom.xml` inicial

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>maven-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte al rol que cumplen herramientas como npm o pnpm en la gestión de dependencias, aunque Maven también estructura el build y el ciclo de vida del proyecto de una forma más integrada.

### Si venís de Python

Puede hacerte pensar en una mezcla entre gestión de dependencias y automatización del proyecto, pero en Java Maven tiene un papel especialmente central porque organiza bastante la forma de construir y empaquetar aplicaciones.

## Errores comunes

### 1. Pensar que Maven es solo para descargar librerías

También organiza estructura, build, test y empaquetado.

### 2. No entender el `pom.xml`

Copiar dependencias sin comprenderlas vuelve el proyecto más confuso.

### 3. Mezclar dependencias sin criterio

Cuantas más dependencias metés, más importante es saber para qué está cada una.

### 4. No respetar la estructura estándar

Eso puede complicar integración con IDEs y herramientas.

### 5. Querer aprender todos los plugins de golpe

No hace falta.
Primero conviene dominar la base.

## Mini ejercicio

Creá un proyecto Maven simple y hacé estas cosas:

1. definir `groupId`, `artifactId` y `version`
2. agregar la versión del compilador en `properties`
3. agregar JUnit como dependencia de test
4. crear una clase `Main`
5. compilar el proyecto con Maven
6. ejecutar `mvn package`

## Ejemplo posible

Archivo `pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>curso-java-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.0</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

## Resumen

En esta lección viste que:

- Maven es una herramienta de gestión y automatización de proyectos Java
- ayuda a manejar dependencias, compilación, tests y empaquetado
- la estructura estándar del proyecto es muy importante
- `pom.xml` es el archivo central de configuración
- `groupId`, `artifactId` y `version` identifican el proyecto
- comandos como `mvn compile`, `mvn test` y `mvn package` forman parte del flujo básico
- aprender Maven prepara muy bien para proyectos reales y para frameworks como Spring Boot

## Siguiente tema

En la próxima lección conviene pasar a **HTTP**, porque después de dominar bastante bien lenguaje, estructuras, fechas, archivos y tooling base, el siguiente paso natural es entrar en el mundo del backend web y entender cómo se comunican cliente y servidor.
