---
title: "Arrays"
description: "Cómo almacenar varios valores del mismo tipo en Java, acceder a ellos y recorrerlos correctamente."
order: 9
module: "Fundamentos del lenguaje"
level: "intro"
draft: false
---

## Introducción

Hasta ahora trabajaste con variables que guardan un solo valor por vez.

Por ejemplo:

```java
int age = 25;
String name = "Gabriel";
```

Pero muchas veces un programa necesita manejar varios valores del mismo tipo.

Por ejemplo:

- una lista de notas
- varios nombres
- una colección de precios
- una serie de puntajes
- los elementos de un menú

Para eso existen los arrays.

## Qué es un array

Un array es una estructura que permite guardar varios valores del mismo tipo dentro de una misma variable.

Ejemplo:

```java
int[] numbers = {10, 20, 30, 40};
```

Ese array guarda cuatro enteros.

La idea más simple para empezar es esta:

un array es una secuencia ordenada de elementos del mismo tipo.

## Por qué usar arrays

Sin arrays, tendrías que hacer algo como esto:

```java
int score1 = 10;
int score2 = 20;
int score3 = 30;
int score4 = 40;
```

Eso funciona para muy pocos datos, pero no escala bien.

Con un array:

```java
int[] scores = {10, 20, 30, 40};
```

el código queda más claro y más fácil de recorrer.

## Cómo se declara un array

La sintaxis más común es esta:

```java
tipo[] nombre;
```

Ejemplo:

```java
int[] numbers;
String[] names;
double[] prices;
```

Eso declara la variable, pero todavía no le asigna elementos concretos.

## Cómo inicializar un array

Hay varias formas.

## Forma 1: con valores directos

```java
int[] numbers = {10, 20, 30, 40};
```

```java
String[] names = {"Ana", "Luis", "Sofía"};
```

## Forma 2: indicando tamaño

```java
int[] numbers = new int[4];
```

Eso crea un array con espacio para 4 enteros.

Luego podés asignar valores por posición:

```java
numbers[0] = 10;
numbers[1] = 20;
numbers[2] = 30;
numbers[3] = 40;
```

## Índices

Los arrays usan índices para acceder a cada elemento.

Importante:
los índices empiezan en `0`.

Ejemplo:

```java
String[] names = {"Ana", "Luis", "Sofía"};
```

Queda así:

- índice 0 → `"Ana"`
- índice 1 → `"Luis"`
- índice 2 → `"Sofía"`

## Acceder a un elemento

Para acceder a una posición, se usa el índice entre corchetes.

```java
String[] names = {"Ana", "Luis", "Sofía"};

System.out.println(names[0]);
System.out.println(names[1]);
System.out.println(names[2]);
```

Resultado:

```text
Ana
Luis
Sofía
```

## Modificar un elemento

También podés cambiar un valor por índice.

```java
String[] names = {"Ana", "Luis", "Sofía"};
names[1] = "Carlos";

System.out.println(names[1]);
```

Resultado:

```text
Carlos
```

## Longitud de un array

Para saber cuántos elementos tiene un array, se usa `.length`.

```java
int[] numbers = {10, 20, 30, 40};
System.out.println(numbers.length);
```

Resultado:

```text
4
```

Atención:
en arrays se usa `.length` sin paréntesis.

Eso es diferente de `String`, donde usabas `.length()` con paréntesis.

## Recorrer un array con `for`

La forma clásica de recorrer un array es usando un `for` con índice.

```java
int[] numbers = {10, 20, 30, 40};

for (int i = 0; i < numbers.length; i++) {
    System.out.println(numbers[i]);
}
```

Resultado:

```text
10
20
30
40
```

## Cómo entender este recorrido

- `i` empieza en 0
- mientras `i` sea menor que la longitud del array
- se imprime el elemento en esa posición
- luego `i` aumenta en 1

## Recorrer un array con `for-each`

Cuando no necesitás el índice, `for-each` suele ser más claro.

```java
int[] numbers = {10, 20, 30, 40};

for (int number : numbers) {
    System.out.println(number);
}
```

Resultado:

```text
10
20
30
40
```

## Cuándo usar `for` y cuándo `for-each`

Usá `for` cuando:

- necesitás el índice
- querés modificar por posición
- querés recorrer de cierta posición a otra
- querés avanzar hacia atrás

Usá `for-each` cuando:

- solo querés recorrer todos los elementos
- no necesitás saber la posición
- buscás un código más simple y legible

## Valores por defecto

Cuando creás un array con `new`, Java le asigna valores por defecto según el tipo.

Ejemplo:

```java
int[] numbers = new int[3];
System.out.println(numbers[0]);
System.out.println(numbers[1]);
System.out.println(numbers[2]);
```

Resultado:

```text
0
0
0
```

Algunos valores por defecto comunes:

- `int` → `0`
- `double` → `0.0`
- `boolean` → `false`
- referencias como `String` → `null`

Ejemplo:

```java
String[] names = new String[2];
System.out.println(names[0]);
```

Resultado:

```text
null
```

## Arrays de String

También es muy común trabajar con arrays de texto.

```java
String[] cities = {"Buenos Aires", "Córdoba", "Rosario"};

for (String city : cities) {
    System.out.println(city);
}
```

## Sumar elementos de un array

Ejemplo:

```java
int[] numbers = {10, 20, 30, 40};
int total = 0;

for (int number : numbers) {
    total += number;
}

System.out.println(total);
```

Resultado:

```text
100
```

## Buscar un valor

Podés recorrer el array para comprobar si existe cierto valor.

```java
int[] numbers = {10, 20, 30, 40};
int target = 30;
boolean found = false;

for (int number : numbers) {
    if (number == target) {
        found = true;
        break;
    }
}

System.out.println(found);
```

Resultado:

```text
true
```

## Arrays y métodos

También podés pasar arrays como parámetros a métodos.

Ejemplo:

```java
public static void showNumbers(int[] numbers) {
    for (int number : numbers) {
        System.out.println(number);
    }
}
```

Uso:

```java
int[] values = {1, 2, 3};
showNumbers(values);
```

## Ejemplo completo

```java
public class Main {
    public static void main(String[] args) {
        int[] scores = {8, 10, 7, 9};

        System.out.println("Primer puntaje: " + scores[0]);
        System.out.println("Cantidad de elementos: " + scores.length);

        int total = 0;

        for (int score : scores) {
            total += score;
        }

        System.out.println("Suma total: " + total);

        for (int i = 0; i < scores.length; i++) {
            System.out.println("Índice " + i + ": " + scores[i]);
        }
    }
}
```

## Comparación con otros lenguajes

### Si venís de JavaScript

La idea de guardar varios elementos en una misma variable te va a resultar familiar, pero en Java los arrays tienen tamaño fijo y tipo definido.

### Si venís de Python

Puede recordarte a una lista en algunos usos básicos, pero en Java el array es más rígido:

- todos los elementos son del mismo tipo
- el tamaño queda definido al crearlo
- el manejo por índice es muy explícito

## Errores comunes

### 1. Olvidar que el índice empieza en 0

Este es uno de los errores más comunes al empezar.

### 2. Intentar acceder a una posición inexistente

Por ejemplo:

```java
int[] numbers = {10, 20, 30};
System.out.println(numbers[3]);
```

Eso da error porque las posiciones válidas son 0, 1 y 2.

### 3. Confundir `.length` con `.length()`

En arrays se usa:

```java
numbers.length
```

No:

```java
numbers.length()
```

### 4. Pensar que el tamaño cambia solo

En un array tradicional de Java, el tamaño es fijo.

### 5. Usar `for-each` cuando necesitás índice

`for-each` es cómodo, pero no te da la posición directamente.

## Mini ejercicio

Escribí código para resolver estos casos:

1. crear un array de 5 enteros
2. mostrar el primer y el último elemento
3. recorrer todos los elementos con `for`
4. recorrer todos los elementos con `for-each`
5. sumar todos los valores
6. comprobar si cierto número existe dentro del array

## Ejemplo posible

```java
int[] numbers = {5, 10, 15, 20, 25};

System.out.println(numbers[0]);
System.out.println(numbers[numbers.length - 1]);

for (int i = 0; i < numbers.length; i++) {
    System.out.println(numbers[i]);
}

for (int number : numbers) {
    System.out.println(number);
}

int total = 0;
for (int number : numbers) {
    total += number;
}

System.out.println(total);

int target = 15;
boolean found = false;

for (int number : numbers) {
    if (number == target) {
        found = true;
        break;
    }
}

System.out.println(found);
```

## Resumen

En esta lección viste que:

- un array permite guardar varios valores del mismo tipo
- los arrays usan índices que empiezan en 0
- podés declarar, inicializar, leer y modificar elementos
- `.length` permite conocer la cantidad de elementos
- `for` y `for-each` sirven para recorrer arrays
- los arrays tienen tamaño fijo
- al acceder a posiciones inválidas se produce un error

## Siguiente tema

En la próxima lección conviene seguir con **matrices**, porque son la extensión natural de los arrays cuando necesitás organizar datos en más de una dimensión.
