---
title: "Condicionales"
description: "Cómo tomar decisiones en Java usando if, else, else if y switch según distintas condiciones."
order: 6
module: "Fundamentos del lenguaje"
level: "intro"
draft: false
---

## Introducción

Hasta ahora ya viste cómo guardar datos en variables, cómo operar con ellos y cómo trabajar con texto.

Pero un programa no solo guarda y muestra información. También necesita tomar decisiones.

Por ejemplo:

- mostrar un mensaje distinto según la edad de una persona
- permitir o no una acción según si el usuario está autenticado
- clasificar un valor según su resultado
- ejecutar un bloque de código solo si se cumple una condición

Para eso existen las estructuras condicionales.

## Qué es una estructura condicional

Una estructura condicional permite ejecutar un bloque de código solo cuando se cumple una condición.

En Java, las condiciones se expresan con valores booleanos: `true` o `false`.

Por ejemplo:

```java
boolean isAdmin = true;
```

Si una condición es verdadera, el programa sigue un camino.
Si es falsa, sigue otro.

## `if`

La forma más básica de una condicional es `if`.

```java
if (condicion) {
    // código a ejecutar si la condición es true
}
```

Ejemplo:

```java
int age = 20;

if (age >= 18) {
    System.out.println("Es mayor de edad");
}
```

Si `age` es 18 o más, se imprime el mensaje.

## Cómo se lee un `if`

Este código:

```java
if (age >= 18) {
    System.out.println("Es mayor de edad");
}
```

se puede leer así:

“Si la edad es mayor o igual a 18, ejecutar este bloque”.

## `if` con una condición booleana

También podés evaluar directamente una variable booleana.

```java
boolean active = true;

if (active) {
    System.out.println("La cuenta está activa");
}
```

Eso significa:
“si `active` es verdadero”.

## `if` + `else`

Muchas veces no alcanza con ejecutar algo cuando la condición es verdadera. También hace falta definir qué pasa cuando no se cumple.

Para eso está `else`.

```java
if (condicion) {
    // bloque si es true
} else {
    // bloque si es false
}
```

Ejemplo:

```java
int age = 16;

if (age >= 18) {
    System.out.println("Puede ingresar");
} else {
    System.out.println("No puede ingresar");
}
```

## Cómo pensar `if` + `else`

- `if` cubre el caso verdadero
- `else` cubre el caso contrario

Eso hace que el flujo del programa sea más claro.

## `else if`

Cuando no tenés solo dos caminos, sino varios posibles, podés usar `else if`.

```java
if (condicion1) {
    // bloque 1
} else if (condicion2) {
    // bloque 2
} else {
    // bloque final
}
```

Ejemplo:

```java
int score = 85;

if (score >= 90) {
    System.out.println("Excelente");
} else if (score >= 70) {
    System.out.println("Aprobado");
} else {
    System.out.println("Desaprobado");
}
```

## Cómo se evalúa un `else if`

Java evalúa las condiciones en orden.

En este ejemplo:

```java
int score = 85;

if (score >= 90) {
    System.out.println("Excelente");
} else if (score >= 70) {
    System.out.println("Aprobado");
} else {
    System.out.println("Desaprobado");
}
```

pasa esto:

1. revisa si `score >= 90`
2. como eso es falso, sigue
3. revisa si `score >= 70`
4. como eso es verdadero, ejecuta `"Aprobado"`
5. ya no revisa lo demás

## Importancia del orden

El orden de las condiciones importa muchísimo.

Mirá este ejemplo:

```java
int score = 95;

if (score >= 70) {
    System.out.println("Aprobado");
} else if (score >= 90) {
    System.out.println("Excelente");
}
```

Aunque el valor sea 95, va a imprimir `"Aprobado"`.

¿Por qué?
Porque la primera condición ya se cumple y Java entra ahí sin seguir evaluando el resto.

Por eso conviene ordenar de la condición más específica a la más general cuando corresponda.

## Condiciones con operadores lógicos

Las condicionales suelen combinar varias expresiones con `&&`, `||` y `!`.

Ejemplo:

```java
int age = 22;
boolean hasTicket = true;

if (age >= 18 && hasTicket) {
    System.out.println("Puede entrar");
}
```

Acá ambas condiciones deben ser verdaderas.

Otro ejemplo:

```java
boolean isAdmin = false;
boolean isEditor = true;

if (isAdmin || isEditor) {
    System.out.println("Tiene permisos");
}
```

Con `||`, alcanza con que una sea verdadera.

## Negación con `!`

También podés negar una condición.

```java
boolean blocked = false;

if (!blocked) {
    System.out.println("El usuario no está bloqueado");
}
```

## Bloques con llaves

Aunque Java permite en algunos casos omitir llaves cuando hay una sola línea, conviene usarlas siempre al empezar.

Esto es más claro:

```java
if (age >= 18) {
    System.out.println("Mayor de edad");
}
```

que esto:

```java
if (age >= 18)
    System.out.println("Mayor de edad");
```

Usar llaves ayuda a evitar errores y mejora la legibilidad.

## `switch`

Cuando tenés que comparar un valor contra varios casos posibles, `switch` puede ser más claro que muchos `else if`.

Ejemplo:

```java
int day = 2;

switch (day) {
    case 1:
        System.out.println("Lunes");
        break;
    case 2:
        System.out.println("Martes");
        break;
    case 3:
        System.out.println("Miércoles");
        break;
    default:
        System.out.println("Otro día");
}
```

## Cómo funciona `switch`

`switch` evalúa un valor y lo compara con distintos `case`.

- si encuentra coincidencia, ejecuta ese bloque
- si no encuentra ninguna, puede ejecutar `default`

## Qué hace `break`

En el `switch` clásico, `break` evita que la ejecución siga cayendo en los siguientes casos.

Por ejemplo:

```java
int day = 1;

switch (day) {
    case 1:
        System.out.println("Lunes");
        break;
    case 2:
        System.out.println("Martes");
        break;
}
```

Si `day` vale 1, imprime `"Lunes"` y se detiene por el `break`.

## Qué pasa si no hay `break`

```java
int day = 1;

switch (day) {
    case 1:
        System.out.println("Lunes");
    case 2:
        System.out.println("Martes");
    default:
        System.out.println("Otro día");
}
```

Como no hay `break`, Java sigue ejecutando los casos siguientes.
Eso se llama *fall-through*.

El resultado sería:

```text
Lunes
Martes
Otro día
```

Al empezar, conviene usar `break` salvo que tengas una razón clara para no hacerlo.

## `switch` con texto

También podés usar `switch` con `String`.

```java
String role = "admin";

switch (role) {
    case "admin":
        System.out.println("Acceso total");
        break;
    case "user":
        System.out.println("Acceso limitado");
        break;
    default:
        System.out.println("Rol desconocido");
}
```

## Cuándo usar `if` y cuándo `switch`

Una regla práctica:

- usá `if` cuando evaluás rangos o condiciones complejas
- usá `switch` cuando comparás un mismo valor contra varios casos concretos

Ejemplo de rango:

```java
if (score >= 90) {
    ...
}
```

Eso encaja mejor con `if`.

Ejemplo de opciones fijas:

```java
switch (role) {
    ...
}
```

Eso encaja muy bien con `switch`.

## Ejemplo combinado

```java
public class Main {
    public static void main(String[] args) {
        int age = 20;
        String role = "user";

        if (age >= 18) {
            System.out.println("Es mayor de edad");
        } else {
            System.out.println("Es menor de edad");
        }

        switch (role) {
            case "admin":
                System.out.println("Panel de administración");
                break;
            case "user":
                System.out.println("Panel de usuario");
                break;
            default:
                System.out.println("Rol no reconocido");
        }
    }
}
```

## Comparación con otros lenguajes

### Si venís de JavaScript

La idea de `if`, `else` y `switch` te va a resultar familiar. Lo importante en Java es que las condiciones deben ser expresiones booleanas claras.

### Si venís de Python

La lógica es parecida, pero la sintaxis cambia mucho porque Java usa paréntesis y llaves.

En Java:

```java
if (age >= 18) {
    System.out.println("Mayor de edad");
}
```

## Errores comunes

### 1. Usar `=` en vez de comparación

Una condición no debería usar asignación cuando querías comparar.

Hay que pensar bien cuándo querés asignar y cuándo querés evaluar una condición.

### 2. Ordenar mal los `else if`

Si ponés primero una condición muy general, puede tapar otras más específicas.

### 3. Escribir condiciones innecesariamente complejas

A veces funciona, pero es difícil de leer.
Conviene buscar claridad.

### 4. Olvidarse de `break` en un `switch`

En el `switch` clásico, eso puede hacer que se ejecuten casos que no querías.

### 5. No usar llaves

Puede funcionar, pero al crecer el código se vuelve más propenso a errores.

## Mini ejercicio

Escribí código para resolver estos casos:

1. mostrar si una persona es mayor o menor de edad
2. mostrar si un usuario puede entrar según edad y ticket
3. clasificar una nota:
   - 90 o más: excelente
   - 70 o más: aprobado
   - menos de 70: desaprobado
4. mostrar un mensaje distinto según un rol usando `switch`

## Ejemplo posible

```java
int age = 19;
boolean hasTicket = true;
int score = 88;
String role = "admin";

if (age >= 18) {
    System.out.println("Mayor de edad");
} else {
    System.out.println("Menor de edad");
}

if (age >= 18 && hasTicket) {
    System.out.println("Puede entrar");
} else {
    System.out.println("No puede entrar");
}

if (score >= 90) {
    System.out.println("Excelente");
} else if (score >= 70) {
    System.out.println("Aprobado");
} else {
    System.out.println("Desaprobado");
}

switch (role) {
    case "admin":
        System.out.println("Acceso total");
        break;
    case "user":
        System.out.println("Acceso limitado");
        break;
    default:
        System.out.println("Rol desconocido");
}
```

## Resumen

En esta lección viste que:

- las condicionales permiten tomar decisiones
- `if` ejecuta un bloque cuando una condición es verdadera
- `else` cubre el caso contrario
- `else if` permite varios caminos
- el orden de evaluación importa
- `switch` sirve para comparar un valor con varios casos concretos
- `break` evita seguir ejecutando otros casos en el `switch` clásico

## Siguiente tema

En la próxima lección conviene pasar a **bucles**, porque después de aprender a tomar decisiones, el paso natural es repetir acciones de manera controlada.
