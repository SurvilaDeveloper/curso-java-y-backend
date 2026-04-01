---
title: "Métodos"
description: "Cómo definir, invocar y reutilizar métodos en Java para organizar mejor la lógica del programa."
order: 8
module: "Fundamentos del lenguaje"
level: "intro"
draft: false
---

## Introducción

Hasta ahora ya viste cómo declarar variables, usar operadores, trabajar con texto, tomar decisiones y repetir acciones.

Pero a medida que un programa crece, aparece un problema muy común: la lógica empieza a repetirse o a quedar toda concentrada en un mismo lugar.

Para resolver eso, Java permite agrupar instrucciones dentro de métodos.

Los métodos sirven para:

- dividir un problema en partes más pequeñas
- reutilizar lógica
- hacer el código más legible
- evitar repeticiones innecesarias
- expresar mejor la intención de lo que hace el programa

Si ya programás en otros lenguajes, seguramente la idea te resulte familiar. En algunos lenguajes se habla más de funciones; en Java, como el lenguaje es fuertemente orientado a objetos, el concepto aparece normalmente como método dentro de una clase.

## Qué es un método

Un método es un bloque de código con nombre que realiza una tarea específica.

Ejemplo:

```java
public static void greet() {
    System.out.println("Hola, Java");
}
```

Ese método tiene un nombre (`greet`) y agrupa una acción concreta: imprimir un mensaje.

## Para qué sirve

Sin métodos, muchas veces terminarías escribiendo todo dentro de `main`, y el programa se volvería difícil de leer.

Por ejemplo, esto puede crecer mal:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hola");
        System.out.println("Bienvenido");
        System.out.println("Curso de Java");
    }
}
```

En cambio, con métodos podés expresar mejor la intención:

```java
public class Main {
    public static void main(String[] args) {
        showWelcomeMessage();
    }

    public static void showWelcomeMessage() {
        System.out.println("Hola");
        System.out.println("Bienvenido");
        System.out.println("Curso de Java");
    }
}
```

Ahora el código principal se entiende mucho mejor.

## Estructura de un método

La forma general de un método es:

```java
modificador static tipoRetorno nombreMetodo(parametros) {
    // cuerpo del método
}
```

Ejemplo:

```java
public static void greet() {
    System.out.println("Hola");
}
```

## Partes de un método

Tomemos este ejemplo:

```java
public static void greet() {
    System.out.println("Hola");
}
```

### `public`

Es un modificador de acceso.
Más adelante vas a profundizar en esto, pero por ahora alcanza con saber que indica visibilidad.

### `static`

Permite llamar al método desde `main` sin crear un objeto.
En esta etapa inicial se usa mucho para simplificar ejemplos.

### `void`

Indica que el método no devuelve un valor.

### `greet`

Es el nombre del método.

### `()`

Los paréntesis contienen los parámetros, si existen.
En este caso no hay ninguno.

### `{ ... }`

El cuerpo del método: las instrucciones que ejecuta.

## Cómo invocar un método

Definir un método no alcanza. También hay que llamarlo.

Ejemplo completo:

```java
public class Main {
    public static void main(String[] args) {
        greet();
    }

    public static void greet() {
        System.out.println("Hola, Java");
    }
}
```

Cuando `main` ejecuta `greet();`, se corre el código que está dentro del método.

## Métodos sin parámetros

El ejemplo anterior es un método sin parámetros.

Eso significa que no necesita recibir datos para funcionar.

```java
public static void showLogo() {
    System.out.println("=== CURSO JAVA ===");
}
```

Y se invoca así:

```java
showLogo();
```

## Métodos con parámetros

Muchas veces un método necesita recibir información para trabajar.

Para eso están los parámetros.

Ejemplo:

```java
public static void greetUser(String name) {
    System.out.println("Hola, " + name);
}
```

Y se invoca así:

```java
greetUser("Gabriel");
```

Resultado:

```text
Hola, Gabriel
```

## Qué es un parámetro

Un parámetro es una variable que el método recibe para usar dentro de su lógica.

En este caso:

```java
public static void greetUser(String name)
```

`name` es un parámetro de tipo `String`.

## Métodos con varios parámetros

También podés recibir más de un dato.

```java
public static void showProduct(String name, double price) {
    System.out.println("Producto: " + name);
    System.out.println("Precio: " + price);
}
```

Invocación:

```java
showProduct("Notebook", 1250.50);
```

## Orden de los parámetros

El orden importa.

Si un método espera:

```java
showProduct(String name, double price)
```

hay que pasar primero el texto y después el número decimal.

## Métodos que devuelven un valor

Hasta ahora viste métodos `void`, o sea, métodos que no devuelven nada.

Pero muchos métodos sí devuelven un resultado.

Ejemplo:

```java
public static int sum(int a, int b) {
    return a + b;
}
```

Este método devuelve un `int`.

## Qué hace `return`

`return` finaliza el método y entrega un valor al lugar desde donde fue llamado.

Ejemplo completo:

```java
public class Main {
    public static void main(String[] args) {
        int result = sum(4, 6);
        System.out.println(result);
    }

    public static int sum(int a, int b) {
        return a + b;
    }
}
```

Resultado:

```text
10
```

## Diferencia entre `void` y un método que retorna

### `void`

```java
public static void greet() {
    System.out.println("Hola");
}
```

Hace algo, pero no devuelve un valor.

### Con retorno

```java
public static int sum(int a, int b) {
    return a + b;
}
```

Calcula algo y devuelve el resultado.

## Cuándo conviene devolver un valor

Conviene devolver un valor cuando querés:

- reutilizar el resultado
- guardarlo en una variable
- usarlo en otra expresión
- separar mejor el cálculo de la visualización

Por ejemplo, esto:

```java
int total = sum(10, 20);
```

es más flexible que imprimir directamente dentro del método.

## Métodos booleanos

Un patrón muy común es crear métodos que devuelvan `boolean`.

Ejemplo:

```java
public static boolean isAdult(int age) {
    return age >= 18;
}
```

Uso:

```java
System.out.println(isAdult(20));
```

Resultado:

```text
true
```

Este tipo de método es muy útil para validaciones.

## Variables locales y alcance

Las variables declaradas dentro de un método existen solo dentro de ese método.

Ejemplo:

```java
public static void greet() {
    String message = "Hola";
    System.out.println(message);
}
```

`message` solo existe dentro de `greet()`.

No podrías usarla directamente fuera de ese método.

## Ejemplo de programa con varios métodos

```java
public class Main {
    public static void main(String[] args) {
        showTitle();

        int total = sum(5, 7);
        System.out.println("Resultado: " + total);

        greetUser("Lucía");

        if (isAdult(21)) {
            System.out.println("Es mayor de edad");
        }
    }

    public static void showTitle() {
        System.out.println("=== CURSO JAVA ===");
    }

    public static int sum(int a, int b) {
        return a + b;
    }

    public static void greetUser(String name) {
        System.out.println("Hola, " + name);
    }

    public static boolean isAdult(int age) {
        return age >= 18;
    }
}
```

## Ventajas de usar métodos

## 1. Reutilización

Si necesitás la misma lógica varias veces, no hace falta copiarla.

## 2. Legibilidad

Un buen nombre de método ayuda a entender el flujo del programa.

## 3. Mantenimiento

Si la lógica cambia, se modifica en un solo lugar.

## 4. Organización

Permiten dividir el problema en piezas más pequeñas y manejables.

## Elegir buenos nombres

El nombre de un método debería expresar claramente qué hace.

Mejor así:

```java
calculateTotal()
isAdult()
showWelcomeMessage()
```

que así:

```java
doStuff()
x()
process()
```

Los nombres claros hacen una gran diferencia cuando el proyecto crece.

## Métodos y `main`

En esta etapa inicial, `main` es el punto de entrada del programa.

```java
public static void main(String[] args)
```

La idea más útil es pensar que `main` coordina y los demás métodos hacen tareas concretas.

Un `main` limpio suele llamar métodos más pequeños en vez de contener toda la lógica.

## Comparación con otros lenguajes

### Si venís de JavaScript

La idea se parece mucho a escribir funciones, pero en Java los métodos viven dentro de clases y suelen declararse con tipos explícitos.

### Si venís de Python

También hay una idea similar a la función tradicional, pero en Java el tipo de retorno y el tipo de cada parámetro se declaran de forma explícita.

Ejemplo en Java:

```java
public static int sum(int a, int b) {
    return a + b;
}
```

## Errores comunes

### 1. Querer usar un método sin llamarlo

Definirlo no alcanza.
Hay que invocarlo.

### 2. Confundir imprimir con devolver

Esto:

```java
System.out.println(a + b);
```

no es lo mismo que:

```java
return a + b;
```

Imprimir muestra algo.
Devolver entrega un valor al código que llamó al método.

### 3. Usar mal el tipo de retorno

Si el método dice que devuelve `int`, debería devolver un entero compatible.

### 4. Elegir nombres poco claros

Un método con nombre confuso hace que el programa sea más difícil de leer.

### 5. Poner demasiada lógica en `main`

`main` no debería transformarse en un bloque gigante y desordenado.

## Mini ejercicio

Escribí métodos para resolver estos casos:

1. mostrar un mensaje de bienvenida
2. recibir un nombre y saludar a esa persona
3. sumar dos números y devolver el resultado
4. recibir una edad y devolver si la persona es mayor de edad
5. recibir un precio y devolver el precio con un descuento simple

## Ejemplo posible

```java
public class Main {
    public static void main(String[] args) {
        showWelcomeMessage();
        greetUser("Ana");

        int total = sum(3, 4);
        System.out.println(total);

        boolean adult = isAdult(19);
        System.out.println(adult);

        double finalPrice = applyDiscount(100.0);
        System.out.println(finalPrice);
    }

    public static void showWelcomeMessage() {
        System.out.println("Bienvenido al curso");
    }

    public static void greetUser(String name) {
        System.out.println("Hola, " + name);
    }

    public static int sum(int a, int b) {
        return a + b;
    }

    public static boolean isAdult(int age) {
        return age >= 18;
    }

    public static double applyDiscount(double price) {
        return price * 0.9;
    }
}
```

## Resumen

En esta lección viste que:

- un método agrupa una tarea específica
- los métodos ayudan a organizar y reutilizar lógica
- pueden tener parámetros
- pueden devolver un valor con `return`
- `void` significa que no devuelven nada
- las variables locales viven dentro del método donde fueron declaradas
- usar buenos nombres mejora mucho la legibilidad

## Siguiente tema

En la próxima lección conviene pasar a **arrays**, porque una vez que ya sabés encapsular lógica, el siguiente paso natural es aprender a trabajar con varios valores del mismo tipo dentro de una misma estructura.
