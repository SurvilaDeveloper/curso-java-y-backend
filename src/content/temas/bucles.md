---
title: "Bucles"
description: "Cómo repetir acciones en Java usando while, do while, for y foreach según cada caso."
order: 7
module: "Fundamentos del lenguaje"
level: "intro"
draft: false
---

## Introducción

Hasta ahora ya viste cómo guardar datos, operar con ellos y tomar decisiones.

Pero muchos programas también necesitan repetir acciones.

Por ejemplo:

- mostrar los números del 1 al 10
- recorrer una lista de elementos
- pedir datos hasta que el usuario ingrese algo válido
- ejecutar un bloque varias veces
- procesar colecciones o arrays

Para eso existen los bucles.

## Qué es un bucle

Un bucle es una estructura que permite repetir un bloque de código varias veces.

La repetición puede depender de:

- una cantidad fija de veces
- una condición
- la cantidad de elementos que haya en una colección o array

En Java, los bucles más importantes al empezar son:

- `while`
- `do while`
- `for`
- `foreach` o `for-each`

## `while`

El bucle `while` repite un bloque mientras una condición sea verdadera.

La forma general es:

```java
while (condicion) {
    // código a repetir
}
```

Ejemplo:

```java
int count = 1;

while (count <= 5) {
    System.out.println(count);
    count++;
}
```

## Cómo se lee este ejemplo

Ese código se puede leer así:

- mientras `count` sea menor o igual que 5
- imprimir el valor
- aumentar `count` en 1

Resultado:

```text
1
2
3
4
5
```

## Importancia de actualizar la condición

Este punto es fundamental.

Si la condición nunca deja de ser verdadera, el bucle no termina.

Ejemplo problemático:

```java
int count = 1;

while (count <= 5) {
    System.out.println(count);
}
```

Ese código entra en un bucle infinito, porque `count` nunca cambia.

Por eso, en un `while`, siempre hay que revisar bien qué hace que la condición termine volviéndose falsa.

## `do while`

`do while` es parecido a `while`, pero con una diferencia importante:

el bloque se ejecuta al menos una vez, incluso si la condición es falsa desde el principio.

La forma general es:

```java
do {
    // código a repetir
} while (condicion);
```

Ejemplo:

```java
int count = 1;

do {
    System.out.println(count);
    count++;
} while (count <= 5);
```

Resultado:

```text
1
2
3
4
5
```

## Diferencia entre `while` y `do while`

Compará estos casos.

### `while`

```java
int count = 10;

while (count <= 5) {
    System.out.println(count);
}
```

No imprime nada, porque la condición ya es falsa desde el comienzo.

### `do while`

```java
int count = 10;

do {
    System.out.println(count);
} while (count <= 5);
```

Imprime una vez:

```text
10
```

Porque en `do while` primero se ejecuta el bloque y después se evalúa la condición.

## Cuándo usar `while`

`while` suele ser útil cuando:

- no sabés exactamente cuántas veces se repetirá algo
- la repetición depende de una condición
- querés seguir ejecutando hasta que pase algo específico

Ejemplo mental:
“seguir pidiendo una opción hasta que el usuario ingrese una válida”.

## `for`

El bucle `for` es muy usado cuando sabés cuántas veces querés repetir algo o cuando manejás un contador.

La forma general es:

```java
for (inicializacion; condicion; actualizacion) {
    // código a repetir
}
```

Ejemplo:

```java
for (int i = 1; i <= 5; i++) {
    System.out.println(i);
}
```

Resultado:

```text
1
2
3
4
5
```

## Cómo entender un `for`

Este ejemplo:

```java
for (int i = 1; i <= 5; i++) {
    System.out.println(i);
}
```

significa:

1. crear una variable `i` con valor 1
2. mientras `i` sea menor o igual que 5, repetir
3. después de cada vuelta, incrementar `i`

## Partes del `for`

### Inicialización

```java
int i = 1
```

Se ejecuta una sola vez al empezar.

### Condición

```java
i <= 5
```

Se evalúa antes de cada iteración.

### Actualización

```java
i++
```

Se ejecuta al final de cada vuelta.

## `for` descendente

También podés contar hacia atrás.

```java
for (int i = 5; i >= 1; i--) {
    System.out.println(i);
}
```

Resultado:

```text
5
4
3
2
1
```

## `for` con saltos distintos

No siempre tenés que avanzar de 1 en 1.

```java
for (int i = 0; i <= 10; i += 2) {
    System.out.println(i);
}
```

Resultado:

```text
0
2
4
6
8
10
```

## Cuándo usar `for`

`for` suele ser ideal cuando:

- sabés cuántas repeticiones querés
- trabajás con índices
- recorrés arrays o estructuras por posición
- necesitás una estructura compacta con contador

## `for-each`

Cuando querés recorrer todos los elementos de un array o colección y no necesitás el índice, `for-each` suele ser más claro.

Ejemplo con array:

```java
String[] names = {"Ana", "Luis", "Sofía"};

for (String name : names) {
    System.out.println(name);
}
```

Resultado:

```text
Ana
Luis
Sofía
```

## Cómo se lee un `for-each`

Este fragmento:

```java
for (String name : names) {
    System.out.println(name);
}
```

se puede leer así:

“para cada `name` dentro de `names`, ejecutar este bloque”.

## Cuándo usar `for-each`

Conviene usarlo cuando:

- solo querés recorrer todos los elementos
- no necesitás saber la posición
- no necesitás modificar el índice manualmente

Es más simple y más legible para muchos casos.

## Ejemplo con suma usando `for`

```java
int total = 0;

for (int i = 1; i <= 5; i++) {
    total += i;
}

System.out.println(total);
```

Resultado:

```text
15
```

Porque suma:

1 + 2 + 3 + 4 + 5

## Ejemplo con validación usando `while`

```java
boolean valid = false;
int attempts = 0;

while (!valid && attempts < 3) {
    System.out.println("Intentando...");
    attempts++;

    if (attempts == 3) {
        valid = true;
    }
}
```

Este ejemplo muestra cómo un bucle puede depender de varias condiciones.

## `break`

`break` sirve para cortar un bucle antes de que termine naturalmente.

Ejemplo:

```java
for (int i = 1; i <= 10; i++) {
    if (i == 5) {
        break;
    }

    System.out.println(i);
}
```

Resultado:

```text
1
2
3
4
```

Cuando `i` vale 5, el bucle se corta.

## `continue`

`continue` sirve para saltar a la siguiente iteración sin ejecutar el resto del bloque actual.

Ejemplo:

```java
for (int i = 1; i <= 5; i++) {
    if (i == 3) {
        continue;
    }

    System.out.println(i);
}
```

Resultado:

```text
1
2
4
5
```

Cuando `i` vale 3, no se imprime y se pasa a la vuelta siguiente.

## Bucles anidados

También pueden existir bucles dentro de otros bucles.

Ejemplo:

```java
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 2; j++) {
        System.out.println("i = " + i + ", j = " + j);
    }
}
```

Resultado:

```text
i = 1, j = 1
i = 1, j = 2
i = 2, j = 1
i = 2, j = 2
i = 3, j = 1
i = 3, j = 2
```

Esto más adelante va a ser útil para matrices y ciertos algoritmos.

## Ejemplo combinado

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("While:");
        int count = 1;

        while (count <= 3) {
            System.out.println(count);
            count++;
        }

        System.out.println("For:");
        for (int i = 1; i <= 3; i++) {
            System.out.println(i);
        }

        System.out.println("For-each:");
        String[] colors = {"Rojo", "Verde", "Azul"};

        for (String color : colors) {
            System.out.println(color);
        }
    }
}
```

## Comparación con otros lenguajes

### Si venís de JavaScript

`while` y `for` te van a resultar familiares. El `for-each` de Java puede recordarte a ciertas formas de recorrer arrays, aunque la sintaxis es distinta.

### Si venís de Python

El `for` clásico de Java suele sentirse más explícito. En Python muchas iteraciones se expresan sin tanto detalle de índice.

En Java:

```java
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}
```

## Errores comunes

### 1. Crear bucles infinitos

Pasa cuando la condición nunca deja de cumplirse o cuando olvidás actualizar la variable de control.

### 2. Elegir mal el tipo de bucle

A veces se usa `while` cuando `for` sería más claro, o al revés.

### 3. Confundir `for-each` con recorrido por índice

Con `for-each` recorrés elementos, no posiciones.

### 4. Usar `break` y `continue` de forma confusa

Pueden ser útiles, pero abusar de ellos hace el código menos claro.

### 5. Hacer condiciones difíciles de leer

Si la lógica del bucle es complicada, conviene simplificar nombres y expresiones.

## Mini ejercicio

Escribí código para resolver estos casos:

1. mostrar los números del 1 al 10 usando `while`
2. mostrar los números del 1 al 10 usando `for`
3. mostrar solo números pares del 0 al 10
4. recorrer un array de nombres con `for-each`
5. cortar un bucle cuando aparezca un valor específico

## Ejemplo posible

```java
int n = 1;

while (n <= 10) {
    System.out.println(n);
    n++;
}

for (int i = 1; i <= 10; i++) {
    System.out.println(i);
}

for (int i = 0; i <= 10; i += 2) {
    System.out.println(i);
}

String[] names = {"Ana", "Luis", "Sofía"};

for (String name : names) {
    System.out.println(name);
}

for (int i = 1; i <= 10; i++) {
    if (i == 7) {
        break;
    }

    System.out.println(i);
}
```

## Resumen

En esta lección viste que:

- un bucle permite repetir código
- `while` repite mientras una condición sea verdadera
- `do while` ejecuta el bloque al menos una vez
- `for` es muy útil cuando hay un contador o una cantidad conocida de repeticiones
- `for-each` sirve para recorrer arrays o colecciones sin usar índices
- `break` corta un bucle
- `continue` salta a la siguiente iteración
- hay que evitar los bucles infinitos accidentales

## Siguiente tema

En la próxima lección conviene pasar a **métodos**, porque después de aprender a repetir lógica, el siguiente paso natural es encapsularla y reutilizarla mejor.
