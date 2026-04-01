---
title: "Matrices"
description: "Cómo trabajar con arrays bidimensionales en Java para representar datos organizados en filas y columnas."
order: 10
module: "Fundamentos del lenguaje"
level: "intro"
draft: false
---

## Introducción

En la lección anterior viste que un array permite guardar varios valores del mismo tipo dentro de una sola estructura.

Eso funciona muy bien cuando los datos pueden pensarse como una lista.

Por ejemplo:

- una lista de nombres
- una lista de precios
- una lista de puntajes

Pero a veces los datos tienen una organización de filas y columnas.

Por ejemplo:

- un tablero
- una grilla de números
- una tabla de notas por alumno y materia
- una planilla simple
- una matriz matemática

Para eso se usan las matrices.

## Qué es una matriz

En Java, una matriz es un array bidimensional.

Dicho simple:
es un array cuyos elementos son otros arrays.

Ejemplo:

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6}
};
```

Eso representa una estructura con:

- 2 filas
- 3 columnas

## Cómo pensar una matriz

Podés imaginarla así:

```text
1 2 3
4 5 6
```

La primera fila es:

```text
1 2 3
```

La segunda fila es:

```text
4 5 6
```

## Declaración de una matriz

La forma general es:

```java
tipo[][] nombre;
```

Ejemplo:

```java
int[][] numbers;
String[][] names;
double[][] prices;
```

## Inicialización con valores directos

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6}
};
```

Acá Java crea una matriz con dos filas y tres columnas.

## Inicialización indicando tamaño

También podés crearla así:

```java
int[][] matrix = new int[2][3];
```

Eso crea:

- 2 filas
- 3 columnas

Y luego podés asignar valores por posición:

```java
matrix[0][0] = 1;
matrix[0][1] = 2;
matrix[0][2] = 3;
matrix[1][0] = 4;
matrix[1][1] = 5;
matrix[1][2] = 6;
```

## Índices en una matriz

En una matriz, normalmente usás dos índices:

- el primero para la fila
- el segundo para la columna

Ejemplo:

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6}
};
```

Entonces:

- `matrix[0][0]` → 1
- `matrix[0][1]` → 2
- `matrix[0][2]` → 3
- `matrix[1][0]` → 4
- `matrix[1][1]` → 5
- `matrix[1][2]` → 6

## Acceder a un elemento

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6}
};

System.out.println(matrix[0][0]);
System.out.println(matrix[1][2]);
```

Resultado:

```text
1
6
```

## Modificar un elemento

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6}
};

matrix[1][1] = 99;

System.out.println(matrix[1][1]);
```

Resultado:

```text
99
```

## Cantidad de filas y columnas

### Filas

La cantidad de filas se obtiene con:

```java
matrix.length
```

Ejemplo:

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6}
};

System.out.println(matrix.length);
```

Resultado:

```text
2
```

### Columnas

La cantidad de columnas de una fila se obtiene con:

```java
matrix[0].length
```

Ejemplo:

```java
System.out.println(matrix[0].length);
```

Resultado:

```text
3
```

## Importancia de entender esto

En una matriz bidimensional:

- `matrix.length` da la cantidad de filas
- `matrix[fila].length` da la cantidad de columnas de esa fila

Esto es muy importante para recorrer matrices correctamente.

## Recorrer una matriz con bucles anidados

La forma más común es usar un `for` dentro de otro `for`.

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6}
};

for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.println(matrix[i][j]);
    }
}
```

Resultado:

```text
1
2
3
4
5
6
```

## Cómo entender este recorrido

- el bucle externo recorre filas
- el bucle interno recorre columnas dentro de cada fila

Es una estructura fundamental cuando trabajás con matrices.

## Mostrar la matriz como tabla

También podés imprimirla de forma más visual:

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6}
};

for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.print(matrix[i][j] + " ");
    }
    System.out.println();
}
```

Resultado:

```text
1 2 3
4 5 6
```

## Recorrer con `for-each`

También se puede usar `for-each`, aunque suele ser menos útil cuando necesitás posiciones.

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6}
};

for (int[] row : matrix) {
    for (int value : row) {
        System.out.println(value);
    }
}
```

Esto recorre todos los valores, pero no te da directamente los índices.

## Sumar todos los elementos

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6}
};

int total = 0;

for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        total += matrix[i][j];
    }
}

System.out.println(total);
```

Resultado:

```text
21
```

## Buscar un valor dentro de una matriz

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6}
};

int target = 5;
boolean found = false;

for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] == target) {
            found = true;
            break;
        }
    }

    if (found) {
        break;
    }
}

System.out.println(found);
```

Resultado:

```text
true
```

## Matrices irregulares

En Java, no todas las matrices tienen que tener el mismo número de columnas por fila.

Por ejemplo:

```java
int[][] matrix = {
    {1, 2},
    {3, 4, 5},
    {6}
};
```

Esto también es válido.

Por eso es importante recorrer columnas con:

```java
matrix[i].length
```

y no asumir que todas las filas tienen la misma longitud.

## Valores por defecto

Si creás una matriz con `new`, sus elementos también reciben valores por defecto.

Ejemplo:

```java
int[][] matrix = new int[2][3];

System.out.println(matrix[0][0]);
System.out.println(matrix[1][2]);
```

Resultado:

```text
0
0
```

## Ejemplo completo

```java
public class Main {
    public static void main(String[] args) {
        int[][] scores = {
            {8, 7, 9},
            {10, 6, 8}
        };

        System.out.println("Filas: " + scores.length);
        System.out.println("Columnas de la fila 0: " + scores[0].length);
        System.out.println("Elemento [1][2]: " + scores[1][2]);

        int total = 0;

        for (int i = 0; i < scores.length; i++) {
            for (int j = 0; j < scores[i].length; j++) {
                total += scores[i][j];
                System.out.print(scores[i][j] + " ");
            }
            System.out.println();
        }

        System.out.println("Suma total: " + total);
    }
}
```

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a un array de arrays. La idea general es similar, pero en Java el tipo queda declarado de forma explícita.

### Si venís de Python

Puede parecerse a una lista de listas, aunque Java mantiene un control de tipos y estructura más explícito.

## Errores comunes

### 1. Confundir filas con columnas

El primer índice es fila.
El segundo es columna.

### 2. Usar mal `.length`

- filas: `matrix.length`
- columnas: `matrix[i].length`

### 3. Intentar acceder a posiciones inexistentes

Por ejemplo, si una fila tiene menos columnas que otra, no podés asumir que todas comparten la misma longitud.

### 4. Recorrer mal matrices irregulares

Por eso no conviene usar siempre `matrix[0].length` para todas las filas.

### 5. Perderse en los índices

Los nombres claros como `row` y `col`, o `i` y `j` con buena disciplina, ayudan bastante.

## Mini ejercicio

Escribí código para resolver estos casos:

1. crear una matriz de 2 filas y 3 columnas
2. mostrar un elemento específico
3. recorrer toda la matriz e imprimir sus valores
4. mostrarla como tabla
5. sumar todos los elementos
6. comprobar si un número existe dentro de la matriz

## Ejemplo posible

```java
int[][] matrix = {
    {2, 4, 6},
    {1, 3, 5}
};

System.out.println(matrix[0][1]);

for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.println(matrix[i][j]);
    }
}

for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.print(matrix[i][j] + " ");
    }
    System.out.println();
}

int total = 0;
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        total += matrix[i][j];
    }
}

System.out.println(total);

int target = 3;
boolean found = false;

for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] == target) {
            found = true;
            break;
        }
    }
    if (found) {
        break;
    }
}

System.out.println(found);
```

## Resumen

En esta lección viste que:

- una matriz es un array bidimensional
- se accede con dos índices: fila y columna
- `matrix.length` da la cantidad de filas
- `matrix[i].length` da la cantidad de columnas de una fila
- lo más habitual es recorrer matrices con bucles anidados
- pueden existir matrices irregulares
- se pueden sumar, buscar e imprimir como tabla

## Siguiente tema

En la próxima lección conviene pasar a **clases y objetos**, porque hasta ahora trabajaste con estructuras básicas del lenguaje, y el siguiente gran paso en Java es empezar a pensar en programación orientada a objetos.
