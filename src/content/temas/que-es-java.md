---
title: "Qué es Java"
description: "Primer contacto con Java: qué es, cómo se ejecuta y por qué sigue siendo tan importante."
order: 1
module: "Primer contacto con Java"
level: "intro"
draft: false
---

## Introducción

Java es un lenguaje de programación de propósito general, fuertemente tipado y orientado a objetos, muy usado en backend, sistemas empresariales, aplicaciones Android legacy, herramientas internas y plataformas de gran escala.

Si ya programás en otros lenguajes, lo más importante al empezar con Java no es memorizar sintaxis, sino entender su filosofía: Java tiende a ser explícito, estructurado y predecible. Eso hace que al principio parezca más verboso, pero también ayuda mucho cuando los proyectos crecen.

## ¿Por qué aprender Java hoy?

Java sigue siendo una tecnología muy relevante porque:

- tiene un ecosistema enorme
- se usa muchísimo en backend profesional
- tiene herramientas maduras
- funciona muy bien en sistemas grandes y mantenibles
- Spring Boot lo convirtió en una opción muy fuerte para APIs y aplicaciones empresariales

Además, aprender Java suele mejorar la forma de pensar diseño, estructura y mantenibilidad del código.

## Qué hace diferente a Java

Si venís de JavaScript, Python o PHP, probablemente notes estas diferencias rápido:

- el tipado tiene más protagonismo
- las clases y la estructura del proyecto importan mucho
- muchas decisiones son más explícitas
- el ecosistema valora bastante la claridad y la organización

Por ejemplo, en Java normalmente declarás el tipo de cada variable:

```java
int age = 25;
String name = "Gabriel";
boolean active = true;
```

Eso hace que el código sea más explícito que en lenguajes con tipado más flexible.

## Cómo se ejecuta Java

Una de las ideas más importantes para empezar bien es entender que Java no se ejecuta exactamente igual que un lenguaje interpretado clásico.

El flujo general es este:

1. escribís código fuente en archivos `.java`
2. ese código se compila
3. el compilador genera bytecode
4. la JVM ejecuta ese bytecode

## Código fuente, compilación y ejecución

Ejemplo de un programa mínimo:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hola, Java");
    }
}
```

Ese archivo contiene código fuente. Luego Java lo compila y lo convierte en bytecode, que después puede ser ejecutado por la JVM.

## JDK, JRE y JVM

Estos tres conceptos suelen confundirse al principio, así que conviene dejarlos claros desde ya.

### JVM

La JVM, o Java Virtual Machine, es la máquina virtual que ejecuta el bytecode de Java.

### JRE

La JRE incluye lo necesario para ejecutar programas Java.

### JDK

La JDK incluye herramientas para desarrollar, como el compilador `javac`, y también lo necesario para ejecutar programas.

Como programador, normalmente instalás la **JDK**.

## La idea de “write once, run anywhere”

Históricamente, Java se volvió muy popular por la idea de que el mismo programa podía ejecutarse en distintos sistemas mientras hubiera una JVM compatible.

La frase no significa “sin diferencias mágicas en todos los casos”, pero sí resume una idea importante del ecosistema Java: la portabilidad.

## Primer ejemplo explicado

Volvamos a este programa:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hola, Java");
    }
}
```

### `public class Main`

Declara una clase llamada `Main`.

### `public static void main(String[] args)`

Es el punto de entrada del programa. Cuando ejecutás la aplicación, Java busca ese método.

### `System.out.println(...)`

Imprime texto en consola.

## Comparación rápida con otros lenguajes

### JavaScript

En JavaScript podrías escribir algo como esto:

```javascript
console.log("Hola");
```

En Java, incluso el ejemplo mínimo suele ser más estructurado porque todo vive dentro de una clase:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hola");
    }
}
```

### Python

En Python, imprimir algo es muy directo:

```python
print("Hola")
```

En Java hay más estructura inicial, pero eso después encaja bien con proyectos grandes.

## Qué conviene aprender después de este tema

Una vez entendido qué es Java y cómo se ejecuta, el siguiente paso natural es aprender:

- variables
- tipos de datos
- operadores
- strings
- condicionales
- bucles
- métodos

O sea: los fundamentos del lenguaje.

## Errores comunes al empezar

### 1. Querer aprender Java como si fuera “otro JavaScript”

Java tiene una filosofía distinta. Conviene aceptar su estilo en vez de pelearse con él.

### 2. Obsesionarse con memorizar siglas sin entender el flujo

No alcanza con repetir JDK, JRE y JVM. Lo importante es entender quién compila y quién ejecuta.

### 3. Asustarse por la verbosidad inicial

Al principio Java parece más pesado, pero gran parte de esa estructura después ayuda.

## Mini ejercicio

Respondé con tus palabras:

1. ¿Qué diferencia hay entre código fuente y bytecode?
2. ¿Qué hace la JVM?
3. ¿Qué instalarías para programar en Java: JRE o JDK?
4. ¿Cuál es el método de entrada más común de una aplicación Java?

## Resumen

En esta lección viste que:

- Java es un lenguaje muy usado en backend y sistemas grandes
- su estilo es explícito y estructurado
- el código Java se compila a bytecode
- la JVM ejecuta ese bytecode
- la JDK es la herramienta que normalmente instalás para desarrollar

## Siguiente tema

En la próxima lección conviene pasar a **variables y tipos de datos**, porque son la base para escribir cualquier programa en Java.
