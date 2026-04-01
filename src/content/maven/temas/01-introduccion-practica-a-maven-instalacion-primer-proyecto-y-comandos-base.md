---
title: "Introducción práctica a Maven: instalación, primer proyecto y comandos base"
description: "Primer tema práctico del curso de Maven: qué es Maven, cómo instalarlo, cómo crear un proyecto inicial y cómo usar los comandos base para compilar, testear y empaquetar."
order: 1
module: "Fundamentos de Maven"
level: "intro"
draft: false
---

# Introducción práctica a Maven: instalación, primer proyecto y comandos base

## Objetivo del tema

En este primer tema vas a:

- entender qué problema resuelve Maven
- instalar y verificar Maven
- crear tu primer proyecto Maven
- aprender la estructura base de un proyecto Maven
- ejecutar los comandos más importantes del día a día
- generar tu primer `.jar`

La idea no es que memorices teoría suelta, sino que al terminar tengas un proyecto funcionando y ya te sientas cómodo con el flujo básico.

---

## Qué es Maven

Maven es una herramienta de automatización y gestión de proyectos Java.

Te ayuda a:

- estructurar proyectos de forma estándar
- descargar dependencias automáticamente
- compilar
- correr tests
- empaquetar el proyecto
- instalar artefactos localmente
- mantener builds más ordenados y repetibles

Dicho simple:

> Maven te evita hacer a mano muchas tareas repetitivas del proyecto Java y te da una forma estándar de construirlo.

---

## Qué vas a hacer hoy

En este tema vas a crear un proyecto Maven real desde cero y vas a ejecutar este flujo:

1. crear proyecto
2. abrirlo y entender su estructura
3. compilar
4. correr tests
5. empaquetar
6. instalar localmente

---

## Requisitos previos

Antes de empezar, necesitás tener instalado:

- Java JDK
- Maven

### Verificá Java

Abrí una terminal y ejecutá:

```bash
java -version
javac -version
```

Deberías ver algo parecido a:

```bash
java version "21" ...
javac 21 ...
```

### Verificá Maven

Ejecutá:

```bash
mvn -version
```

Deberías ver algo parecido a:

```bash
Apache Maven 3.9.x
Maven home: ...
Java version: 21, vendor: ...
OS name: ...
```

Si `mvn` no funciona, probablemente Maven no esté agregado al `PATH`.

---

## Idea central que tenés que llevarte

Maven trabaja principalmente con dos cosas:

- un archivo `pom.xml`
- una estructura estándar de carpetas

El `pom.xml` le dice a Maven:

- cómo se llama tu proyecto
- qué versión tiene
- qué dependencias usa
- cómo se construye

---

## Primer proyecto Maven

## Paso 1: crear una carpeta de trabajo

Por ejemplo:

```bash
mkdir curso-maven
cd curso-maven
```

## Paso 2: generar un proyecto con Maven

Ejecutá:

```bash
mvn archetype:generate "-DgroupId=com.gabriel.maven" "-DartifactId=hola-maven" "-DarchetypeArtifactId=maven-archetype-quickstart" "-DinteractiveMode=false"
```

Esto crea un proyecto base con una estructura inicial.

## Qué significa cada parte

- `groupId`: identificador lógico del grupo o empresa
- `artifactId`: nombre del proyecto
- `archetypeArtifactId`: plantilla que Maven va a usar
- `interactiveMode=false`: evita preguntas interactivas

---

## Paso 3: entrar al proyecto

```bash
cd hola-maven
```

---

## Estructura generada

Ahora deberías tener algo parecido a esto:

```text
hola-maven/
├── pom.xml
└── src
    ├── main
    │   └── java
    │       └── com
    │           └── gabriel
    │               └── maven
    │                   └── App.java
    └── test
        └── java
            └── com
                └── gabriel
                    └── maven
                        └── AppTest.java
```

## Qué significa cada carpeta

### `src/main/java`
Acá va el código principal de tu aplicación.

### `src/test/java`
Acá van los tests.

### `target`
Todavía no existe al principio.
Maven la crea cuando compila o empaqueta.
Ahí pone los archivos generados.

### `pom.xml`
Es el corazón del proyecto Maven.

---

## Mirando el `pom.xml`

Abrí el archivo `pom.xml`.
Vas a ver algo parecido a esto:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.gabriel.maven</groupId>
    <artifactId>hola-maven</artifactId>
    <version>1.0-SNAPSHOT</version>

    <dependencies>
        ...
    </dependencies>
</project>
```

## Qué significa esto

### `modelVersion`
Versión del modelo POM.
Normalmente vas a usar `4.0.0`.

### `groupId`
Agrupa lógicamente el proyecto.

### `artifactId`
Nombre del artefacto o proyecto.

### `version`
Versión actual del proyecto.

### `dependencies`
Dependencias que necesita el proyecto.

---

## Tu primer comando importante: compile

Ejecutá:

```bash
mvn compile
```

## Qué hace

- compila el código fuente
- crea la carpeta `target`
- deja los `.class` generados dentro

## Qué deberías ver

Algo parecido a:

```bash
BUILD SUCCESS
```

---

## Mirá la carpeta `target`

Después de compilar, fijate qué apareció:

```text
target/
├── classes/
└── ...
```

Dentro de `target/classes` deberían estar los `.class` compilados.

---

## Segundo comando importante: test

Ejecutá:

```bash
mvn test
```

## Qué hace

- compila el código principal
- compila los tests
- corre los tests

## Resultado esperado

Deberías volver a ver:

```bash
BUILD SUCCESS
```

Si algo falla, Maven te lo marca claramente.

---

## Tercer comando importante: package

Ejecutá:

```bash
mvn package
```

## Qué hace

- compila
- testea
- empaqueta el proyecto

## Qué genera

Deberías ver un archivo `.jar` dentro de `target`, algo así:

```text
target/hola-maven-1.0-SNAPSHOT.jar
```

Este es tu artefacto empaquetado.

---

## Cuarto comando importante: install

Ejecutá:

```bash
mvn install
```

## Qué hace

Además de compilar, testear y empaquetar:

- instala el `.jar` en tu repositorio local de Maven

Eso permite que otros proyectos Maven de tu máquina puedan usar este artefacto como dependencia.

---

## Resumen mental de los comandos base

### `mvn compile`
Compila el proyecto.

### `mvn test`
Corre los tests.

### `mvn package`
Genera el `.jar`.

### `mvn install`
Instala el artefacto en tu repositorio local.

---

## Tu primera modificación práctica

Ahora abrí `App.java`.

Probablemente tenga algo parecido a esto:

```java
package com.gabriel.maven;

public class App {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
```

Cambialo por esto:

```java
package com.gabriel.maven;

public class App {
    public static void main(String[] args) {
        System.out.println("Hola Maven, este es mi primer proyecto.");
    }
}
```

Guardá el archivo.

---

## Volvé a compilar

```bash
mvn compile
```

---

## Cambio práctico en el test

Ahora abrí `AppTest.java`.

No hace falta que entiendas a fondo testing todavía.
Solo verificá que el archivo exista y que Maven lo esté ejecutando cuando corrés:

```bash
mvn test
```

La idea de este tema es que ya veas que Maven separa claramente:

- código principal
- tests
- artefactos generados

---

## Qué está haciendo Maven por detrás

Aunque hoy lo vamos a mantener simple, ya conviene que entiendas esta idea:

cuando ejecutás una fase como:

```bash
mvn package
```

Maven no hace solo `package`.

También ejecuta antes lo necesario para llegar ahí:

- validate
- compile
- test
- package

Eso es parte del **lifecycle** de Maven, que más adelante vas a estudiar mejor.

---

## Error común 1: no tener Java bien configurado

Si Maven falla con mensajes relacionados con Java, revisá:

```bash
java -version
javac -version
mvn -version
```

Asegurate de que Maven esté usando el JDK correcto.

---

## Error común 2: no tener Maven en PATH

Si la terminal dice algo como:

```bash
'mvn' no se reconoce como un comando interno o externo
```

entonces Maven no está correctamente agregado al `PATH`.

---

## Error común 3: pensar que Maven “ejecuta Java”

Maven no reemplaza Java.
Maven organiza y automatiza tareas del proyecto Java.

Java sigue siendo el lenguaje y la plataforma.
Maven es la herramienta que te ordena el build.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente esto:

### Ejercicio 1
Creá el proyecto `hola-maven`.

### Ejercicio 2
Ejecutá:

```bash
mvn compile
mvn test
mvn package
mvn install
```

### Ejercicio 3
Modificá `App.java` para imprimir un mensaje personalizado.

### Ejercicio 4
Verificá que dentro de `target` aparezca el `.jar`.

### Ejercicio 5
Escribí con tus palabras qué hace cada uno de estos comandos:

- `compile`
- `test`
- `package`
- `install`

---

## Mini desafío

Creá otro proyecto Maven distinto, por ejemplo:

- `calculadora-maven`
- `agenda-maven`
- `notas-maven`

No hace falta que tenga lógica compleja.
Solo repetí el proceso de generación, compilación y empaquetado para afianzar el flujo.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este primer tema, ya deberías poder:

- verificar que Java y Maven estén instalados
- crear un proyecto Maven desde terminal
- reconocer la estructura estándar de carpetas
- ubicar el `pom.xml`
- correr `compile`, `test`, `package` e `install`
- entender qué es `target`
- y sentirte cómodo con el flujo básico de trabajo

---

## Resumen del tema

- Maven organiza y automatiza el build de proyectos Java.
- El archivo central del proyecto es `pom.xml`.
- La estructura estándar separa código principal, tests y artefactos generados.
- Los comandos más importantes del comienzo son:
  - `compile`
  - `test`
  - `package`
  - `install`
- `target` contiene lo que Maven genera.
- Ya creaste tu primer proyecto Maven real.

---

## Próximo tema

En el próximo tema vas a aprender a leer y escribir mejor el `pom.xml`, porque después de crear y ejecutar un proyecto Maven básico, el siguiente paso natural es entender con más claridad qué está declarando realmente ese archivo y cómo empezar a modificarlo con intención.
