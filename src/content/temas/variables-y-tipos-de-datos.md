---
title: "Variables y tipos de datos"
description: "Cómo declarar variables en Java, qué tipos existen y por qué el tipado importa tanto."
order: 3
module: "Fundamentos del lenguaje"
level: "intro"
draft: false
---

## Introducción

Una variable es un nombre que usamos para guardar un valor en memoria y poder trabajar con él dentro del programa.

Si ya programás en otros lenguajes, la idea general seguramente te resulte familiar. Lo que cambia en Java es que el tipo de cada dato tiene un papel mucho más visible y más importante desde el principio.

Java es un lenguaje fuertemente tipado. Eso significa, entre otras cosas, que cada variable tiene un tipo definido y que ese tipo condiciona qué valores puede guardar y qué operaciones se pueden hacer con ella.

## Qué es una variable

Una variable permite almacenar información para usarla después.

Por ejemplo:

```java
int age = 25;
String name = "Gabriel";
boolean active = true;
```

En este ejemplo:

- `age` guarda un número entero
- `name` guarda texto
- `active` guarda un valor verdadero o falso

## Cómo se declara una variable en Java

La forma general es esta:

```java
tipo nombre = valor;
```

Ejemplo:

```java
int age = 25;
double price = 199.99;
char initial = 'G';
boolean active = true;
String name = "Java";
```

Java te pide que declares el tipo de la variable. Eso hace que el código sea más explícito y que muchos errores se detecten antes de ejecutar el programa.

## El nombre de la variable

En Java, como en otros lenguajes, elegir buenos nombres importa mucho.

Por ejemplo:

```java
int userAge = 25;
String customerName = "Ana";
boolean isAvailable = false;
```

Estos nombres son más claros que algo como:

```java
int a = 25;
String x = "Ana";
boolean b = false;
```

## Tipos primitivos y tipos de referencia

Esta es una distinción muy importante en Java.

En Java existen dos grandes grupos de tipos:

- tipos primitivos
- tipos de referencia

## Tipos primitivos

Los tipos primitivos son los más básicos del lenguaje. Guardan valores simples.

Los principales son:

- `byte`
- `short`
- `int`
- `long`
- `float`
- `double`
- `char`
- `boolean`

### Ejemplos

```java
int age = 25;
long population = 46000000L;
double price = 12.5;
float discount = 2.5f;
char letter = 'A';
boolean active = true;
```

## `int`

Se usa para números enteros.

```java
int quantity = 10;
```

## `double`

Se usa para números con decimales.

```java
double temperature = 23.7;
```

## `boolean`

Se usa para valores lógicos: verdadero o falso.

```java
boolean loggedIn = false;
```

## `char`

Se usa para un único carácter.

```java
char grade = 'A';
```

Importante: en Java, `char` usa comillas simples.

## Tipos de referencia

Los tipos de referencia apuntan a objetos.

Ejemplos comunes:

- `String`
- arrays
- clases creadas por vos
- listas y mapas
- cualquier objeto

Ejemplo:

```java
String name = "Gabriel";
```

Aunque mucha gente lo usa como si fuera un tipo “básico”, `String` no es un tipo primitivo. Es un objeto.

## Diferencia mental útil

Podés quedarte con esta idea inicial:

- los tipos primitivos representan valores simples
- los tipos de referencia representan objetos

Más adelante esto se vuelve muy importante para entender memoria, null, métodos y colecciones.

## Por qué el tipado importa tanto en Java

En Java, el tipo no es un detalle menor. Define:

- qué valor puede guardarse
- qué operaciones son válidas
- qué métodos se pueden usar
- qué conversiones hacen falta

Ejemplo correcto:

```java
int age = 25;
```

Ejemplo incorrecto:

```java
int age = "25";
```

Eso da error porque `"25"` es texto, no un entero.

## Inferencia con `var`

En Java moderno existe `var` para variables locales.

Ejemplo:

```java
var age = 25;
var name = "Gabriel";
var active = true;
```

Aunque no escribas el tipo explícitamente, Java lo sigue infiriendo.

Por ejemplo:

- `age` será `int`
- `name` será `String`
- `active` será `boolean`

## Cuándo usar `var`

`var` puede hacer el código más cómodo en algunos casos, pero no conviene abusar.

Esto:

```java
var name = "Java";
```

puede ser bastante claro.

Pero esto:

```java
var x = calculateSomething();
```

puede volverse confuso si no se entiende qué devuelve ese método.

Al empezar, conviene dominar primero la declaración explícita de tipos.

## Asignación y reasignación

Una variable puede recibir un valor y luego cambiarlo, si no fue declarada como `final`.

Ejemplo:

```java
int score = 10;
score = 20;
```

Después de la reasignación, `score` vale 20.

## Inicialización

En muchos casos, una variable local debe ser inicializada antes de usarse.

Ejemplo correcto:

```java
int age = 25;
System.out.println(age);
```

Ejemplo incorrecto:

```java
int age;
System.out.println(age);
```

Eso da error porque la variable local no fue inicializada.

## Constantes con `final`

Si querés que una variable no cambie después de asignarle un valor, podés usar `final`.

```java
final double PI = 3.14159;
```

Eso indica que el valor no debería reasignarse.

Convencionalmente, cuando algo actúa como constante, se suele escribir en mayúsculas.

## Ejemplos combinados

```java
public class Main {
    public static void main(String[] args) {
        String productName = "Notebook";
        int stock = 8;
        double price = 1250.50;
        boolean available = true;

        System.out.println(productName);
        System.out.println(stock);
        System.out.println(price);
        System.out.println(available);
    }
}
```

Este ejemplo muestra cómo distintas variables representan distintos tipos de información dentro de un programa.

## Comparación con otros lenguajes

### Si venís de JavaScript

En JavaScript podrías escribir:

```javascript
let age = 25;
let name = "Gabriel";
```

En Java, normalmente declarás el tipo:

```java
int age = 25;
String name = "Gabriel";
```

Eso hace el código más explícito y permite detectar incompatibilidades antes.

### Si venís de Python

En Python podrías hacer:

```python
age = 25
name = "Gabriel"
```

En Java, el tipo aparece desde el principio y forma parte central del lenguaje.

## Errores comunes

### 1. Pensar que `String` es primitivo

No lo es.
`String` es un tipo de referencia.

### 2. Confundir `=` con comparación

En Java, `=` asigna un valor.
La comparación se hace con `==` en tipos primitivos booleanos o numéricos, aunque más adelante verás matices importantes con objetos.

### 3. Usar mal comillas

- texto: comillas dobles `"Hola"`
- carácter único: comillas simples `'A'`

Ejemplo correcto:

```java
String text = "Hola";
char initial = 'H';
```

### 4. Mezclar tipos sin pensar

Ejemplo problemático:

```java
int age = 25;
double price = 10.5;
```

No pasa nada malo acá, pero más adelante, cuando combines operaciones entre tipos, vas a tener que entender conversiones y promociones de tipo.

## Mini ejercicio

Declarar variables para representar:

1. el nombre de una persona
2. su edad
3. si está activa en el sistema
4. el precio de un producto
5. la letra inicial de un curso

Intentá elegir el tipo correcto para cada caso.

## Ejemplo posible

```java
String personName = "Lucía";
int age = 30;
boolean active = true;
double productPrice = 99.99;
char courseInitial = 'J';
```

## Resumen

En esta lección viste que:

- una variable permite guardar datos
- en Java cada variable tiene un tipo
- existen tipos primitivos y tipos de referencia
- `int`, `double`, `boolean` y `char` son tipos primitivos comunes
- `String` es un tipo de referencia
- Java es un lenguaje fuertemente tipado
- `final` sirve para evitar reasignaciones

## Siguiente tema

En la próxima lección conviene seguir con **operadores**, porque una vez que sabés guardar datos, el paso natural es aprender a operarlos y combinarlos.
