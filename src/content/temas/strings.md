---
title: "Strings"
description: "Cómo representar texto en Java, qué tiene de especial String y cuáles son las operaciones más comunes."
order: 5
module: "Fundamentos del lenguaje"
level: "intro"
draft: false
---

## Introducción

En casi cualquier programa aparece texto: nombres, emails, mensajes, títulos, descripciones, contraseñas, rutas, URLs y mucho más.

En Java, el tipo que se usa para representar texto es `String`.

Si ya programás en otros lenguajes, probablemente la idea de una cadena de texto te resulte familiar. Lo importante en Java es entender que `String` no es un tipo primitivo, sino un objeto, y que eso tiene consecuencias en cómo se usa y cómo se compara.

## Qué es un String

Un `String` representa una secuencia de caracteres.

Ejemplo:

```java
String name = "Gabriel";
String course = "Java";
String message = "Hola, mundo";
```

Cada uno de esos valores es texto.

## Cómo se declara

La forma general es esta:

```java
String variableName = "texto";
```

Ejemplo:

```java
String city = "Buenos Aires";
```

Importante:
en Java, los textos se escriben entre comillas dobles.

## `String` no es primitivo

Esto es muy importante desde el principio.

Aunque se usa todo el tiempo y parece muy “básico”, `String` no es un tipo primitivo como `int`, `double` o `boolean`.

`String` es un tipo de referencia, o sea, un objeto.

Eso más adelante va a importar para entender:

- métodos
- comparaciones
- null
- inmutabilidad
- colecciones

## Operaciones comunes con String

## Concatenación

Una de las operaciones más frecuentes es unir textos.

En Java se puede hacer con `+`.

```java
String firstName = "Gabriel";
String lastName = "Survila";
String fullName = firstName + " " + lastName;

System.out.println(fullName);
```

Resultado:

```text
Gabriel Survila
```

## Concatenar texto con números

También se puede concatenar texto con otros valores:

```java
int age = 25;
String message = "Edad: " + age;

System.out.println(message);
```

Resultado:

```text
Edad: 25
```

## Longitud de un String

Podés saber cuántos caracteres tiene un texto con `.length()`.

```java
String language = "Java";
System.out.println(language.length());
```

Resultado:

```text
4
```

## Acceder a un carácter

Podés obtener un carácter específico con `.charAt()`.

```java
String language = "Java";
System.out.println(language.charAt(0));
```

Resultado:

```text
J
```

Importante:
los índices empiezan en `0`.

Entonces en `"Java"`:

- índice 0 → `J`
- índice 1 → `a`
- índice 2 → `v`
- índice 3 → `a`

## Convertir mayúsculas y minúsculas

```java
String text = "Java";

System.out.println(text.toUpperCase());
System.out.println(text.toLowerCase());
```

Resultado:

```text
JAVA
java
```

## Buscar texto dentro de otro texto

Podés comprobar si un `String` contiene otro texto con `.contains()`.

```java
String email = "gabriel@example.com";
System.out.println(email.contains("@"));
```

Resultado:

```text
true
```

## Saber si empieza o termina de cierta forma

```java
String fileName = "documento.pdf";

System.out.println(fileName.startsWith("doc"));
System.out.println(fileName.endsWith(".pdf"));
```

## Obtener una parte del texto

Con `.substring()` podés sacar una porción del texto.

```java
String word = "Java";
System.out.println(word.substring(0, 2));
```

Resultado:

```text
Ja
```

El índice inicial se incluye.
El índice final no se incluye.

## Reemplazar texto

```java
String message = "Hola mundo";
String updated = message.replace("mundo", "Java");

System.out.println(updated);
```

Resultado:

```text
Hola Java
```

## Eliminar espacios sobrantes

```java
String text = "   Java   ";
System.out.println(text.trim());
```

Resultado:

```text
Java
```

Esto es muy útil cuando se validan inputs de usuario.

## Comparar Strings

Este es uno de los puntos más importantes.

Muchas personas que empiezan con Java cometen este error:

```java
String a = "Java";
String b = "Java";

System.out.println(a == b);
```

Aunque a veces pueda dar `true` en ciertos casos, **no es la forma correcta de comparar contenido de texto**.

## La forma correcta: `.equals()`

Para comparar el contenido de dos strings, se usa `.equals()`.

```java
String a = "Java";
String b = "Java";

System.out.println(a.equals(b));
```

Eso sí compara el contenido.

## Diferencia mental útil

Podés recordarlo así:

- `==` compara referencias o valores según el tipo
- `.equals()` compara contenido en objetos como `String`

Para texto, casi siempre querés `.equals()`.

## Comparación ignorando mayúsculas y minúsculas

```java
String a = "java";
String b = "JAVA";

System.out.println(a.equalsIgnoreCase(b));
```

Resultado:

```text
true
```

## Inmutabilidad

Otra idea muy importante: los `String` en Java son inmutables.

Eso significa que, una vez creado un string, su contenido no se modifica.

Por ejemplo:

```java
String text = "Java";
text.toUpperCase();
System.out.println(text);
```

Eso sigue imprimiendo:

```text
Java
```

Porque `toUpperCase()` no modifica el string original: devuelve uno nuevo.

La forma correcta sería:

```java
String text = "Java";
text = text.toUpperCase();
System.out.println(text);
```

Ahora sí:

```text
JAVA
```

## String y null

Como `String` es un tipo de referencia, puede valer `null`.

```java
String name = null;
```

Esto significa que la variable no apunta a ningún objeto.

Más adelante vas a ver que esto puede generar errores si intentás llamar métodos sobre una referencia nula.

Por ejemplo:

```java
String name = null;
System.out.println(name.length());
```

Eso produciría un error en tiempo de ejecución.

## Ejemplo combinado

```java
public class Main {
    public static void main(String[] args) {
        String firstName = "Gabriel";
        String lastName = "Survila";
        String fullName = firstName + " " + lastName;

        System.out.println("Nombre completo: " + fullName);
        System.out.println("Longitud: " + fullName.length());
        System.out.println("En mayúsculas: " + fullName.toUpperCase());
        System.out.println("¿Contiene 'Sur'? " + fullName.contains("Sur"));
    }
}
```

## Comparación con otros lenguajes

### Si venís de JavaScript

En JavaScript también trabajás mucho con strings, pero en Java tiene mucho peso entender que `String` es un objeto y que la comparación de contenido se hace con `.equals()`.

### Si venís de Python

La idea general de cadena de texto es parecida, pero en Java vas a usar métodos como `.length()`, `.substring()` o `.equals()` con sintaxis orientada a objetos.

## Errores comunes

### 1. Comparar strings con `==`

Para comparar contenido de texto, usá `.equals()`.

### 2. Olvidar que `String` es un objeto

No es un tipo primitivo.

### 3. Pensar que un método modifica el string original

Muchos métodos devuelven un nuevo string. No cambian el anterior.

### 4. Confundir índices

Los índices empiezan en `0`, no en `1`.

### 5. No cuidar `null`

Si una variable `String` vale `null`, llamar métodos sobre ella da error.

## Mini ejercicio

Declarar variables y resolver estas tareas:

1. guardar un nombre y un apellido
2. unirlos en una variable `fullName`
3. mostrar la longitud del nombre completo
4. comprobar si contiene una letra específica
5. convertirlo a mayúsculas
6. comparar dos textos usando `.equals()`

## Ejemplo posible

```java
String firstName = "Ana";
String lastName = "López";
String fullName = firstName + " " + lastName;

System.out.println(fullName);
System.out.println(fullName.length());
System.out.println(fullName.contains("A"));
System.out.println(fullName.toUpperCase());
System.out.println(fullName.equals("Ana López"));
```

## Resumen

En esta lección viste que:

- `String` representa texto en Java
- `String` no es un tipo primitivo, sino un objeto
- se puede concatenar con `+`
- existen métodos muy usados como `.length()`, `.charAt()`, `.contains()`, `.substring()` y `.replace()`
- para comparar contenido se usa `.equals()`
- los strings son inmutables
- un `String` puede valer `null`

## Siguiente tema

En la próxima lección conviene pasar a **condicionales**, porque una vez que ya sabés trabajar con datos y expresiones, el siguiente paso es tomar decisiones dentro del programa.
