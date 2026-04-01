---
title: "Operadores"
description: "Cómo usar operadores en Java para asignar, comparar, combinar condiciones y trabajar con valores numéricos."
order: 4
module: "Fundamentos del lenguaje"
level: "intro"
draft: false
---

## Introducción

Una vez que ya sabés declarar variables y entender sus tipos, el siguiente paso natural es aprender a operar con esos valores.

Los operadores permiten hacer cosas como:

- asignar valores
- sumar, restar, multiplicar y dividir
- comparar datos
- combinar condiciones lógicas
- incrementar o decrementar variables

Si ya programás en otros lenguajes, muchos operadores te van a resultar familiares. Aun así, conviene aprenderlos en Java con atención, porque el tipado fuerte y algunas reglas de evaluación hacen que ciertos detalles importen más.

## Qué es un operador

Un operador es un símbolo que le indica al lenguaje que haga una operación sobre uno o más valores.

Por ejemplo:

```java
int total = 10 + 5;
```

Acá:

- `=` es un operador de asignación
- `+` es un operador aritmético

## Tipos principales de operadores en Java

En esta etapa conviene dominar estos grupos:

- operadores de asignación
- operadores aritméticos
- operadores relacionales
- operadores lógicos
- operadores de incremento y decremento

## Operador de asignación

El operador más básico es `=`.

Sirve para asignar un valor a una variable.

```java
int age = 25;
String name = "Java";
boolean active = true;
```

Importante:
`=` no significa “comparar”.
Significa “asignar”.

## Operadores aritméticos

Se usan para trabajar con números.

Los más comunes son:

- `+` suma
- `-` resta
- `*` multiplicación
- `/` división
- `%` módulo o resto

### Suma

```java
int result = 10 + 5;
System.out.println(result);
```

### Resta

```java
int result = 10 - 3;
System.out.println(result);
```

### Multiplicación

```java
int result = 4 * 6;
System.out.println(result);
```

### División

```java
int result = 20 / 4;
System.out.println(result);
```

### Módulo

El operador `%` devuelve el resto de una división.

```java
int remainder = 10 % 3;
System.out.println(remainder);
```

En este caso, el resultado es `1`.

## Para qué sirve `%`

Es muy útil, por ejemplo, para saber si un número es par.

```java
int number = 8;
boolean isEven = number % 2 == 0;
System.out.println(isEven);
```

## Atención con la división entre enteros

Este punto es muy importante en Java.

```java
int result = 5 / 2;
System.out.println(result);
```

El resultado es `2`, no `2.5`.

¿Por qué?
Porque ambos operandos son enteros, entonces Java hace división entera.

Si querés resultado decimal, al menos uno de los valores debe ser decimal:

```java
double result = 5.0 / 2;
System.out.println(result);
```

Ahora sí el resultado es `2.5`.

## Operadores de asignación compuesta

Son una forma abreviada de combinar operación + asignación.

Los más comunes son:

- `+=`
- `-=`
- `*=`
- `/=`
- `%=`

### Ejemplo con `+=`

```java
int score = 10;
score += 5;
System.out.println(score);
```

Eso equivale a:

```java
score = score + 5;
```

### Otros ejemplos

```java
int value = 20;

value -= 4;
value *= 2;
value /= 8;
value %= 3;
```

## Operadores relacionales

Sirven para comparar valores.

Devuelven un `boolean`: `true` o `false`.

Los más comunes son:

- `==` igual a
- `!=` distinto de
- `>` mayor que
- `<` menor que
- `>=` mayor o igual que
- `<=` menor o igual que

### Ejemplos

```java
int age = 20;

System.out.println(age == 20);
System.out.println(age != 18);
System.out.println(age > 18);
System.out.println(age < 30);
System.out.println(age >= 20);
System.out.println(age <= 25);
```

## Diferencia entre `=` y `==`

Este es uno de los errores más comunes al empezar.

```java
int age = 25;
```

Acá `=` asigna.

```java
System.out.println(age == 25);
```

Acá `==` compara.

Pensarlo así ayuda mucho:

- `=` cambia un valor
- `==` pregunta si dos valores son iguales

## Operadores lógicos

Se usan para combinar expresiones booleanas.

Los principales son:

- `&&` AND lógico
- `||` OR lógico
- `!` NOT lógico

## `&&` (AND)

Da `true` solo si ambas condiciones son verdaderas.

```java
int age = 25;
boolean hasId = true;

boolean canEnter = age >= 18 && hasId;
System.out.println(canEnter);
```

## `||` (OR)

Da `true` si al menos una condición es verdadera.

```java
boolean hasCoupon = false;
boolean isPremiumUser = true;

boolean getsDiscount = hasCoupon || isPremiumUser;
System.out.println(getsDiscount);
```

## `!` (NOT)

Invierte el valor lógico.

```java
boolean active = true;
System.out.println(!active);
```

Eso imprime `false`.

## Expresiones lógicas combinadas

```java
int age = 22;
boolean hasTicket = true;
boolean blocked = false;

boolean canEnter = age >= 18 && hasTicket && !blocked;
System.out.println(canEnter);
```

Este tipo de expresiones aparece muchísimo en validaciones.

## Operadores de incremento y decremento

Sirven para aumentar o disminuir una variable en 1.

- `++` incrementa
- `--` decrementa

### Ejemplo

```java
int count = 5;
count++;
System.out.println(count);
```

Ahora `count` vale `6`.

```java
count--;
System.out.println(count);
```

Ahora vuelve a `5`.

## Forma prefija y postfija

Este detalle no siempre hace falta dominarlo en profundidad al inicio, pero conviene conocerlo.

### Postfijo

```java
int x = 5;
int y = x++;
System.out.println(x);
System.out.println(y);
```

Resultado:
- `x` termina en `6`
- `y` vale `5`

### Prefijo

```java
int x = 5;
int y = ++x;
System.out.println(x);
System.out.println(y);
```

Resultado:
- `x` termina en `6`
- `y` vale `6`

Al empezar, conviene usar `++` y `--` con claridad y no abusar de combinaciones raras dentro de expresiones complejas.

## Operadores con `String`

El operador `+` también se usa para concatenar texto.

```java
String firstName = "Gabriel";
String lastName = "Survila";

String fullName = firstName + " " + lastName;
System.out.println(fullName);
```

Esto es muy común en ejemplos simples, aunque más adelante verás mejores opciones para ciertos casos.

## Precedencia básica

Cuando hay varios operadores juntos, Java sigue reglas de precedencia.

Por ejemplo:

```java
int result = 2 + 3 * 4;
System.out.println(result);
```

El resultado es `14`, no `20`, porque la multiplicación se resuelve antes que la suma.

Si querés forzar otro orden, usás paréntesis:

```java
int result = (2 + 3) * 4;
System.out.println(result);
```

Ahora el resultado es `20`.

## Comparación rápida con otros lenguajes

### Si venís de JavaScript

Muchos operadores te van a resultar familiares. Pero en Java el tipado hace que ciertos usos ambiguos sean menos tolerados.

### Si venís de Python

La lógica general es parecida, pero la sintaxis cambia. Por ejemplo, en Python no usás `&&` y `||`, sino `and` y `or`.

En Java:

```java
boolean valid = true && false;
```

## Errores comunes

### 1. Usar `=` cuando querías comparar

Incorrecto:

```java
// esto estaría mal en una comparación
```

La comparación correcta usa `==`.

### 2. Esperar decimales en una división entera

```java
int result = 5 / 2;
```

Eso no da `2.5`. Da `2`.

### 3. Escribir condiciones confusas

A veces una condición funciona, pero es difícil de leer.

Conviene preferir claridad:

```java
boolean canAccess = age >= 18 && active;
```

mejor que expresiones innecesariamente enredadas.

### 4. Abusar de `++` dentro de expresiones complejas

Al empezar, es mejor escribir código claro que sorprenderse con efectos laterales.

## Mini ejercicio

Declará variables y resolvé estas expresiones:

1. sumar dos números enteros
2. comprobar si un número es mayor que otro
3. comprobar si un número es par
4. combinar dos condiciones con `&&`
5. concatenar nombre y apellido

## Ejemplo posible

```java
int a = 10;
int b = 3;

int sum = a + b;
boolean greater = a > b;
boolean even = a % 2 == 0;
boolean valid = a > 5 && b < 5;

String firstName = "Ana";
String lastName = "López";
String fullName = firstName + " " + lastName;
```

## Resumen

En esta lección viste que:

- `=` asigna valores
- los operadores aritméticos permiten trabajar con números
- los operadores relacionales comparan valores
- los operadores lógicos combinan condiciones
- `++` y `--` incrementan o decrementan
- `%` sirve para obtener el resto de una división
- `+` también puede concatenar texto
- la división entre enteros no produce decimales

## Siguiente tema

En la próxima lección conviene pasar a **strings**, porque aunque ya viste ejemplos con texto, ese tipo merece una lección propia por lo mucho que se usa en Java.
