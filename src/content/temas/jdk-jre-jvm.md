---
title: "JDK, JRE y JVM"
description: "Entender qué hace cada componente del ecosistema Java y cuál necesitás para desarrollar."
order: 2
module: "Primer contacto con Java"
level: "intro"
draft: false
---

## Introducción

Cuando alguien empieza con Java, una de las primeras confusiones suele ser esta: aparecen siglas como JDK, JRE y JVM, y al principio parece que todas significan más o menos lo mismo.

No significan lo mismo.

Entender la diferencia entre estas tres piezas es importante porque aclara cómo funciona Java por dentro y qué necesitás instalar según lo que quieras hacer.

## La idea general

Java no funciona exactamente como muchos lenguajes interpretados, ni tampoco como un binario nativo tradicional en todos los casos.

El flujo simplificado es este:

1. escribís código fuente en archivos `.java`
2. el compilador transforma ese código en bytecode
3. ese bytecode es ejecutado por la JVM

En ese proceso aparecen estas tres siglas:

- JDK
- JRE
- JVM

## Qué es la JVM

JVM significa **Java Virtual Machine**.

Es la máquina virtual que se encarga de ejecutar el bytecode de Java.

Cuando compilás un archivo Java, no obtenés directamente un ejecutable nativo como en otros lenguajes. Obtenés bytecode, normalmente en archivos `.class`, y ese bytecode corre dentro de la JVM.

## Qué hace la JVM

La JVM se encarga, entre otras cosas, de:

- cargar clases
- ejecutar bytecode
- administrar memoria
- manejar parte del runtime de Java
- permitir que el mismo programa pueda correr en distintos sistemas con una JVM compatible

## Una idea importante

La JVM no es el lenguaje Java.

Java es el lenguaje.
La JVM es el entorno que ejecuta el resultado compilado de ese lenguaje.

Eso es clave porque más adelante vas a ver que la JVM también puede ejecutar código generado desde otros lenguajes del ecosistema, no solo Java.

## Qué es la JRE

JRE significa **Java Runtime Environment**.

La JRE incluye lo necesario para ejecutar aplicaciones Java.

Dicho simple:
si una persona solo necesitara correr un programa Java ya hecho, en el modelo clásico alcanzaría con tener la JRE.

## Qué incluye la JRE

La JRE incluye:

- la JVM
- librerías base necesarias para ejecutar programas Java
- componentes del entorno de ejecución

La idea central es:

- la **JVM ejecuta**
- la **JRE prepara el entorno de ejecución**

## Qué es la JDK

JDK significa **Java Development Kit**.

La JDK es el kit de desarrollo de Java.

Incluye herramientas para desarrollar, compilar, ejecutar y trabajar con programas Java.

## Qué incluye la JDK

La JDK incluye:

- herramientas de desarrollo
- el compilador `javac`
- utilidades del ecosistema Java
- la JRE o lo necesario para ejecutar programas, según la distribución moderna
- todo lo necesario para programar

La idea central es:

- la **JDK sirve para desarrollar**
- la **JRE sirve para ejecutar**
- la **JVM es la máquina que ejecuta el bytecode**

## Relación entre JDK, JRE y JVM

La relación mental más útil es esta:

- dentro de la **JDK** están las herramientas de desarrollo
- la ejecución necesita una **JVM**
- la **JRE** representa el entorno necesario para correr aplicaciones Java

Una forma práctica de recordarlo es:

- **JVM** = ejecuta
- **JRE** = entorno de ejecución
- **JDK** = kit para desarrollar

## Qué instalar si se quiere programar

Si el objetivo es escribir código Java, compilarlo y ejecutarlo, lo normal es instalar la **JDK**.

Esa es la opción correcta para una persona que quiere aprender Java.

## Qué pasa con la JRE en versiones modernas

En el aprendizaje introductorio se suele enseñar la diferencia entre JDK, JRE y JVM porque conceptualmente sigue siendo útil.

Pero en la práctica moderna muchas distribuciones se centran sobre todo en instalar la JDK, y no siempre vas a trabajar con una instalación separada de la JRE como en materiales más viejos.

Por eso conviene quedarse con esta idea:

si vas a desarrollar en Java, instalá la **JDK**.

## Ejemplo mental simple

Imaginá este programa:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hola, Java");
    }
}
```

### Paso 1: escribir

Primero escribís el archivo fuente `Main.java`.

### Paso 2: compilar

Después lo compilás. El compilador transforma ese código fuente en bytecode.

### Paso 3: ejecutar

Luego la JVM ejecuta ese bytecode.

## Comparación con otros lenguajes

### Si venís de JavaScript

En JavaScript muchas veces el entorno parece más directo: escribís el archivo y lo ejecutás con Node.js o lo corrés en el navegador.

En Java hay una separación más explícita entre:

- código fuente
- compilación
- runtime

### Si venís de Python

En Python suele sentirse más natural ejecutar el archivo directamente.

En Java, en cambio, entender el proceso de compilación y ejecución es parte importante de aprender el ecosistema.

## Error común 1: pensar que JDK, JRE y JVM son sinónimos

No lo son.

Cada término señala una parte distinta del proceso.

## Error común 2: creer que la JVM compila

La JVM no compila el código fuente `.java`.

La compilación del código fuente la hace el compilador Java, como `javac`.

La JVM ejecuta el resultado compilado.

## Error común 3: instalar algo sin saber para qué sirve

Al empezar, mucha gente descarga cosas por seguir pasos sin entender qué está instalando.

Lo mejor es quedarse con una regla muy simple:

si querés programar en Java, instalá la **JDK**.

## Mini mapa conceptual

Podés resumirlo así:

- escribís código Java
- la JDK te da herramientas para compilarlo
- el compilador genera bytecode
- la JVM ejecuta ese bytecode
- la JRE representa el entorno necesario para correr la aplicación

## Ejemplo de comando

En un entorno clásico, podrías compilar así:

```bash
javac Main.java
```

Y luego ejecutar así:

```bash
java Main
```

Eso refleja muy bien la separación entre compilar y ejecutar.

## Mini ejercicio

Respondé con tus palabras:

1. ¿Qué hace la JVM?
2. ¿Qué diferencia hay entre la JDK y la JRE?
3. ¿Qué herramienta usarías para compilar código Java?
4. Si quisieras aprender Java y programar, ¿qué instalarías?

## Resumen

En esta lección viste que:

- la JVM ejecuta bytecode
- la JRE representa el entorno de ejecución
- la JDK es el kit de desarrollo
- para programar en Java normalmente instalás la JDK
- entender estas diferencias ayuda a comprender mejor cómo funciona Java

## Siguiente tema

En la próxima lección conviene pasar a **variables y tipos de datos**, porque ahí empieza el trabajo real con la sintaxis básica del lenguaje.
