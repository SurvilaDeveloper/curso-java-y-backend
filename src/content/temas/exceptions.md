---
title: "Exceptions"
description: "Cómo manejar errores y situaciones inesperadas en Java usando try, catch, finally, throw y jerarquía de excepciones."
order: 20
module: "Herramientas clave del lenguaje"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora venís trabajando con código que asume que todo sale bien.

Pero en programas reales pasan cosas como estas:

- un usuario ingresa un dato inválido
- se intenta dividir por cero
- se busca una posición inexistente en una lista
- se intenta leer un archivo que no existe
- una operación externa falla

Cuando algo así ocurre, Java necesita una forma clara de representar y controlar esos errores.

Para eso existen las exceptions.

## Qué es una excepción

Una excepción es un objeto que representa una situación anormal o un error que ocurre durante la ejecución del programa.

Cuando aparece una excepción y no se maneja correctamente, el flujo normal del programa se interrumpe.

## La idea general

Pensalo así:

- el código intenta hacer algo
- si todo sale bien, sigue normalmente
- si ocurre un problema, Java “lanza” una excepción
- el programa puede capturarla y decidir qué hacer

## Primer ejemplo

```java
public class Main {
    public static void main(String[] args) {
        int result = 10 / 0;
        System.out.println(result);
    }
}
```

Esto produce una excepción.

¿Por qué?
Porque no se puede dividir por cero.

## Qué pasa si no se maneja

Si una excepción no se maneja, el programa termina con error y Java muestra información sobre lo ocurrido, incluyendo el tipo de excepción y en qué parte del código apareció.

Ese mensaje ayuda mucho para depurar.

## Tipos de errores y exceptions

No todos los problemas en Java son exactamente lo mismo.

A nivel general, conviene distinguir:

- errores de compilación
- errores de lógica
- excepciones en tiempo de ejecución

## Error de compilación

El programa ni siquiera compila.

Ejemplo:

```java
int age = "25";
```

Eso no es una excepción.
Es un error detectado antes de ejecutar.

## Error lógico

El programa compila y corre, pero hace algo incorrecto desde el punto de vista del problema.

Ejemplo:
una fórmula mal planteada.

Tampoco es necesariamente una excepción.

## Excepción en tiempo de ejecución

El programa compila, empieza a ejecutarse, pero en cierto punto ocurre una situación anormal que Java representa con una excepción.

Ejemplo:

```java
int[] numbers = {1, 2, 3};
System.out.println(numbers[10]);
```

Esto compila, pero falla al ejecutarse.

## `try` y `catch`

La forma más conocida de manejar excepciones en Java es con `try` y `catch`.

```java
try {
    // código que puede fallar
} catch (ExceptionType e) {
    // qué hacer si ocurre esa excepción
}
```

## Ejemplo con división por cero

```java
public class Main {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println("No se puede dividir por cero");
        }
    }
}
```

Ahora, en vez de romperse sin control, el programa captura la excepción y responde con un mensaje.

## Qué hace `try`

El bloque `try` contiene el código que podría lanzar una excepción.

## Qué hace `catch`

El bloque `catch` captura una excepción de cierto tipo y permite manejarla.

## El objeto de excepción

En este ejemplo:

```java
catch (ArithmeticException e)
```

`e` es el objeto excepción.

Con él podés acceder a información útil, por ejemplo:

```java
System.out.println(e.getMessage());
```

## Ejemplo con mensaje del sistema

```java
try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Error: " + e.getMessage());
}
```

## Ejemplo con arrays

```java
public class Main {
    public static void main(String[] args) {
        try {
            int[] numbers = {1, 2, 3};
            System.out.println(numbers[5]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Índice fuera de rango");
        }
    }
}
```

## Múltiples `catch`

A veces un mismo bloque puede lanzar distintos tipos de excepción.

```java
try {
    String text = null;
    System.out.println(text.length());
} catch (NullPointerException e) {
    System.out.println("El texto es null");
} catch (Exception e) {
    System.out.println("Ocurrió un error general");
}
```

## Importancia del orden en múltiples `catch`

El orden importa.

Los `catch` más específicos deberían ir antes que los más generales.

Por ejemplo, si primero pusieras `catch (Exception e)`, el `catch` específico de `NullPointerException` quedaría inútil o directamente inválido según el caso.

## `finally`

El bloque `finally` se ejecuta siempre, haya o no haya excepción.

```java
try {
    System.out.println("Intentando...");
} catch (Exception e) {
    System.out.println("Error");
} finally {
    System.out.println("Esto se ejecuta siempre");
}
```

## Cuándo sirve `finally`

Sirve especialmente cuando querés asegurarte de ejecutar algo al final, como:

- cerrar recursos
- liberar conexiones
- imprimir un cierre
- dejar el sistema en un estado consistente

## Ejemplo simple

```java
public class Main {
    public static void main(String[] args) {
        try {
            int result = 10 / 2;
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println("No se pudo calcular");
        } finally {
            System.out.println("Fin del bloque");
        }
    }
}
```

## Jerarquía básica de excepciones

En Java, las excepciones forman una jerarquía de clases.

No hace falta memorizar todo ahora, pero sí entender que:

- muchas excepciones específicas heredan de clases más generales
- por eso a veces podés capturar una excepción concreta
- o una más general como `Exception`

Ejemplos comunes:

- `ArithmeticException`
- `NullPointerException`
- `ArrayIndexOutOfBoundsException`
- `IllegalArgumentException`

## Checked exceptions y unchecked exceptions

Esta distinción es muy importante en Java.

## Unchecked exceptions

Son excepciones que no estás obligado a declarar o capturar explícitamente.

Suelen representar errores de programación o situaciones evitables con buen código.

Ejemplos:

- `NullPointerException`
- `ArithmeticException`
- `ArrayIndexOutOfBoundsException`

## Checked exceptions

Son excepciones que Java obliga a manejar o declarar.

Suelen aparecer mucho en operaciones como archivos, IO, base de datos o recursos externos.

Ejemplo conceptual:
si una operación puede fallar porque un archivo no existe, Java quiere que lo tengas en cuenta.

## Idea práctica para esta etapa

No hace falta dominar toda la jerarquía todavía.

Lo importante ahora es entender que:

- algunas excepciones aparecen libremente en runtime
- otras te obligan a decidir explícitamente cómo manejarlas

## `throw`

Además de capturar excepciones, también podés lanzarlas manualmente con `throw`.

Ejemplo:

```java
public class Main {
    public static void main(String[] args) {
        int age = -5;

        if (age < 0) {
            throw new IllegalArgumentException("La edad no puede ser negativa");
        }
    }
}
```

## Cuándo tiene sentido usar `throw`

Tiene sentido cuando querés señalar explícitamente que un valor o situación es inválido.

Por ejemplo:

- parámetros incorrectos
- estados imposibles
- reglas del dominio violadas

## Ejemplo en método

```java
public class UserValidator {
    public static void validateAge(int age) {
        if (age < 0) {
            throw new IllegalArgumentException("La edad no puede ser negativa");
        }
    }
}
```

Uso:

```java
UserValidator.validateAge(-1);
```

## `throws`

No hay que confundir `throw` con `throws`.

### `throw`

Lanza una excepción concreta.

### `throws`

Declara que un método puede lanzar ciertas excepciones.

Ejemplo:

```java
public void doSomething() throws Exception {
    // ...
}
```

Eso le avisa a quien llama al método que existe la posibilidad de excepción y que debe tenerlo en cuenta.

## Ejemplo conceptual con `throws`

```java
public static void riskyOperation() throws Exception {
    throw new Exception("Algo salió mal");
}
```

Y luego:

```java
public static void main(String[] args) {
    try {
        riskyOperation();
    } catch (Exception e) {
        System.out.println(e.getMessage());
    }
}
```

## Crear excepciones con buenos mensajes

Cuando lanzás excepciones, el mensaje importa mucho.

Esto:

```java
throw new IllegalArgumentException("Precio inválido");
```

es mucho mejor que lanzar algo sin contexto claro.

Un buen mensaje ayuda a depurar y entender el problema.

## Excepciones personalizadas

También podés crear tus propias clases de excepción.

Por ahora no hace falta profundizar demasiado, pero conviene saber que existe.

Ejemplo conceptual:

```java
public class InvalidPriceException extends RuntimeException {
    public InvalidPriceException(String message) {
        super(message);
    }
}
```

Uso:

```java
throw new InvalidPriceException("El precio no puede ser negativo");
```

Esto más adelante te sirve para modelar mejor errores de dominio.

## Ejemplo completo

```java
public class ProductService {
    public static void validatePrice(double price) {
        if (price < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }
    }

    public static double calculateDiscountedPrice(double price, double discount) {
        validatePrice(price);

        if (discount < 0 || discount > 1) {
            throw new IllegalArgumentException("El descuento debe estar entre 0 y 1");
        }

        return price * (1 - discount);
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        try {
            double finalPrice = ProductService.calculateDiscountedPrice(100, 0.2);
            System.out.println("Precio final: " + finalPrice);

            ProductService.calculateDiscountedPrice(-10, 0.2);
        } catch (IllegalArgumentException e) {
            System.out.println("Error de validación: " + e.getMessage());
        } finally {
            System.out.println("Proceso finalizado");
        }
    }
}
```

## Buenas prácticas iniciales

## 1. No capturar excepciones solo por capturar

Capturar una excepción sin hacer nada útil suele ser mala idea.

## 2. Preferir mensajes claros

Tanto al lanzar como al registrar errores.

## 3. No usar excepciones para flujo normal

Las excepciones representan situaciones anormales, no la lógica habitual del programa.

## 4. Validar antes cuando tenga sentido

Muchas veces es mejor prevenir ciertos errores que capturarlos después.

## 5. Capturar el tipo más específico posible

Eso suele hacer el manejo más claro y más seguro.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a `try/catch`, pero en Java el sistema de excepciones está mucho más integrado al tipado y a la firma de métodos.

### Si venís de Python

La idea general te va a resultar familiar, pero Java distingue con más fuerza entre excepciones checked y unchecked, y eso impacta bastante en el diseño del código.

## Errores comunes

### 1. Usar `catch (Exception e)` para todo sin pensar

A veces conviene capturar algo más específico.

### 2. Silenciar errores

Capturar una excepción y no hacer nada puede volver muy difícil detectar problemas.

### 3. Confundir `throw` con `throws`

Uno lanza; el otro declara.

### 4. Usar excepciones para casos normales

Eso suele empeorar claridad y diseño.

### 5. No entender qué parte del código realmente puede fallar

Cuanto más preciso seas, mejor vas a manejar errores.

## Mini ejercicio

Escribí código para resolver estos casos:

1. capturar una división por cero
2. capturar un acceso fuera de rango en un array
3. lanzar una excepción si una edad es negativa
4. usar `finally` para mostrar un mensaje al final
5. crear un método que valide un precio y use `IllegalArgumentException`

## Ejemplo posible

```java
public class Main {
    public static void validateAge(int age) {
        if (age < 0) {
            throw new IllegalArgumentException("La edad no puede ser negativa");
        }
    }

    public static void main(String[] args) {
        try {
            int result = 10 / 0;
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println("No se puede dividir por cero");
        }

        try {
            int[] numbers = {1, 2, 3};
            System.out.println(numbers[5]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Índice inválido");
        }

        try {
            validateAge(-1);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        } finally {
            System.out.println("Fin del programa");
        }
    }
}
```

## Resumen

En esta lección viste que:

- una excepción representa un error o situación anormal en runtime
- `try` contiene código que puede fallar
- `catch` permite capturar y manejar excepciones
- `finally` se ejecuta siempre
- `throw` permite lanzar excepciones manualmente
- `throws` declara que un método puede lanzar excepciones
- existen excepciones checked y unchecked
- manejar errores bien mejora mucho la robustez del programa

## Siguiente tema

En la próxima lección conviene pasar a **Enums**, porque después de ver cómo representar y controlar errores, el siguiente paso natural es aprender a modelar conjuntos cerrados de valores de forma más clara y segura que usando strings o enteros sueltos.
