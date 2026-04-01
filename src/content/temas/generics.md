---
title: "Generics"
description: "Cómo escribir código reutilizable y más seguro en Java usando tipos parametrizados."
order: 22
module: "Herramientas clave del lenguaje"
level: "intermedio"
draft: false
---

## Introducción

En las lecciones anteriores viste arrays, Collections y enums.

Seguramente ya te cruzaste con sintaxis como estas:

```java
List<String> names = new ArrayList<>();
List<Integer> numbers = new ArrayList<>();
Map<String, Double> prices = new HashMap<>();
```

Esa parte entre `< >` tiene que ver con los generics.

Los generics son una de las herramientas más importantes de Java para escribir código:

- más reutilizable
- más claro
- más seguro en términos de tipos

## Qué es un generic

Un generic permite definir clases, interfaces o métodos que trabajan con tipos parametrizados.

Dicho simple:

en vez de escribir código atado a un tipo concreto, podés escribir código que funcione con distintos tipos, manteniendo seguridad de tipos.

## La idea general

Supongamos que querés una clase para guardar un solo valor.

Sin generics, podrías caer en algo así:

```java
public class Box {
    private Object value;

    public void setValue(Object value) {
        this.value = value;
    }

    public Object getValue() {
        return value;
    }
}
```

Eso funciona, pero tiene un problema:
`Object` acepta cualquier cosa, y después perdés precisión sobre el tipo real.

## Problema de usar `Object`

Ejemplo:

```java
Box box = new Box();
box.setValue("Hola");

String text = (String) box.getValue();
```

Esto obliga a hacer casting.

Y si te equivocás en el tipo, el error aparece en runtime.

## Qué resuelven los generics

Los generics permiten expresar:
“esta clase trabaja con un tipo que voy a definir al usarla”.

Entonces podés escribir algo así:

```java
public class Box<T> {
    private T value;

    public void setValue(T value) {
        this.value = value;
    }

    public T getValue() {
        return value;
    }
}
```

## Qué significa `T`

`T` es un parámetro de tipo.

No representa un valor concreto como una variable.
Representa un tipo que será definido más adelante.

La convención más común es usar letras como:

- `T` para tipo
- `E` para elemento
- `K` para key
- `V` para value

## Cómo usar una clase genérica

```java
Box<String> textBox = new Box<>();
textBox.setValue("Hola");

String text = textBox.getValue();
System.out.println(text);
```

Acá `T` pasa a ser `String`.

Entonces:

- `setValue` recibe un `String`
- `getValue` devuelve un `String`

Sin casts manuales.

## Otro ejemplo

```java
Box<Integer> numberBox = new Box<>();
numberBox.setValue(42);

int number = numberBox.getValue();
System.out.println(number);
```

La misma clase sirve para distintos tipos.

Eso es una de las grandes ventajas de los generics.

## Qué se gana con esto

Se gana:

- reutilización
- seguridad de tipos
- menos casting manual
- código más expresivo

## Comparación entre versión sin generics y con generics

### Sin generics

```java
Object value = box.getValue();
String text = (String) value;
```

### Con generics

```java
String text = textBox.getValue();
```

La segunda versión es más limpia y más segura.

## Generics en Collections

Las Collections usan generics intensivamente.

Ejemplo:

```java
List<String> names = new ArrayList<>();
```

Eso significa que la lista está pensada para guardar `String`.

Entonces:

```java
names.add("Ana");
names.add("Luis");
```

es válido.

Pero esto no:

```java
names.add(10);
```

porque `10` no es un `String`.

## Qué ventaja da eso en Collections

Evita errores de mezcla de tipos y hace que el compilador ayude más.

También mejora el autocompletado y la legibilidad del código.

## Clase genérica simple

```java
public class Pair<K, V> {
    private K key;
    private V value;

    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }

    public K getKey() {
        return key;
    }

    public V getValue() {
        return value;
    }
}
```

Uso:

```java
Pair<String, Integer> pair = new Pair<>("Edad", 25);

System.out.println(pair.getKey());
System.out.println(pair.getValue());
```

## Qué muestra este ejemplo

Que una clase puede tener más de un parámetro de tipo.

En este caso:

- `K` representa la clave
- `V` representa el valor

## Métodos genéricos

No solo las clases pueden ser genéricas.
También los métodos.

Ejemplo:

```java
public class Utils {
    public static <T> void printArray(T[] array) {
        for (T element : array) {
            System.out.println(element);
        }
    }
}
```

Uso:

```java
String[] names = {"Ana", "Luis", "Sofía"};
Integer[] numbers = {1, 2, 3};

Utils.printArray(names);
Utils.printArray(numbers);
```

## Cómo leer esto

```java
public static <T> void printArray(T[] array)
```

significa:

- este método trabaja con un tipo genérico `T`
- recibe un array de ese tipo
- puede usarse con distintos tipos concretos

## Importancia de la parte `<T>` antes del retorno

En un método genérico, el parámetro de tipo se declara antes del tipo de retorno:

```java
public static <T> ...
```

Eso le dice al compilador que el método usa un tipo parametrizado.

## Método genérico que devuelve valor

```java
public class Utils {
    public static <T> T getFirst(T[] array) {
        return array[0];
    }
}
```

Uso:

```java
String[] names = {"Ana", "Luis"};
String first = Utils.getFirst(names);

System.out.println(first);
```

## Restricciones con `extends`

A veces no querés aceptar cualquier tipo, sino solo tipos que cumplan cierta condición.

Para eso existen los bounded generics.

Ejemplo:

```java
public class NumberBox<T extends Number> {
    private T value;

    public NumberBox(T value) {
        this.value = value;
    }

    public T getValue() {
        return value;
    }
}
```

## Qué significa esto

```java
T extends Number
```

significa:
“T debe ser `Number` o una subclase de `Number`”.

Entonces sirve para:

- `Integer`
- `Double`
- `Long`

pero no para `String`.

## Ejemplo

```java
NumberBox<Integer> intBox = new NumberBox<>(10);
NumberBox<Double> doubleBox = new NumberBox<>(12.5);
```

Esto sí funciona.

Pero esto no:

```java
NumberBox<String> textBox = new NumberBox<>("Hola");
```

## Por qué esto es útil

Porque a veces querés restringir el uso a tipos compatibles con cierta operación o familia de clases.

## Wildcards: `?`

Otra parte importante de los generics son los wildcards.

Ejemplo:

```java
List<?> items
```

El `?` significa:
“una lista de algún tipo, pero no especifico cuál”.

## Cuándo sirve `?`

Sirve cuando no necesitás conocer exactamente el tipo concreto para cierta operación.

Ejemplo:

```java
public static void printList(List<?> items) {
    for (Object item : items) {
        System.out.println(item);
    }
}
```

Uso:

```java
List<String> names = List.of("Ana", "Luis");
List<Integer> numbers = List.of(1, 2, 3);

printList(names);
printList(numbers);
```

## Qué ventaja tiene esto

El método puede aceptar listas de distintos tipos sin quedar atado a uno solo.

## `? extends`

También existe:

```java
List<? extends Number>
```

Eso significa:
“una lista de algún tipo que sea `Number` o subtipo de `Number`”.

Ejemplo:

```java
public static void printNumbers(List<? extends Number> numbers) {
    for (Number number : numbers) {
        System.out.println(number);
    }
}
```

Esto puede aceptar:

- `List<Integer>`
- `List<Double>`
- `List<Long>`

## `? super`

También existe:

```java
List<? super Integer>
```

Eso significa:
“una lista de algún tipo que sea `Integer` o una superclase de `Integer`”.

Es una idea más avanzada, pero conviene saber que existe porque aparece en APIs del lenguaje.

## Regla práctica para esta etapa

En este punto, lo más importante es entender bien:

- clases genéricas
- métodos genéricos
- uso de generics en Collections
- wildcard `?`

Con eso ya ganás muchísimo.

## Type safety

Una de las ideas más importantes de los generics es la seguridad de tipos.

Por ejemplo:

```java
List<String> names = new ArrayList<>();
names.add("Ana");
```

Después, cuando hacés:

```java
String name = names.get(0);
```

el compilador ya sabe que eso es un `String`.

No necesitás casting manual ni asumir cosas en runtime.

## Limitaciones importantes

Los generics tienen algunas reglas que al principio pueden sorprender.

## No se puede usar primitivos directamente

Esto no es válido:

```java
List<int> numbers = new ArrayList<>();
```

Los generics trabajan con tipos de referencia, no con primitivos.

La forma correcta sería:

```java
List<Integer> numbers = new ArrayList<>();
```

Esto vale también para:

- `double` → `Double`
- `boolean` → `Boolean`
- `char` → `Character`

## Type erasure

Internamente, Java implementa generics con un mecanismo llamado type erasure.

No hace falta dominarlo ahora, pero conviene saber que existe.

La idea general es que mucha de la información genérica se usa sobre todo en compilación para dar seguridad de tipos, no como un sistema de tipos completamente reificado en runtime.

## Ejemplo completo

```java
public class Box<T> {
    private T value;

    public Box(T value) {
        this.value = value;
    }

    public T getValue() {
        return value;
    }

    public void showValue() {
        System.out.println("Valor: " + value);
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Box<String> textBox = new Box<>("Hola");
        Box<Integer> numberBox = new Box<>(42);

        textBox.showValue();
        numberBox.showValue();

        String text = textBox.getValue();
        Integer number = numberBox.getValue();

        System.out.println(text);
        System.out.println(number);
    }
}
```

## Ejemplo con método genérico

```java
public class Utils {
    public static <T> void showElements(T[] array) {
        for (T element : array) {
            System.out.println(element);
        }
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        String[] names = {"Ana", "Luis"};
        Integer[] numbers = {10, 20, 30};

        Utils.showElements(names);
        Utils.showElements(numbers);
    }
}
```

## Comparación con otros lenguajes

### Si venís de JavaScript

Esto puede sentirse más rígido que trabajar con estructuras libres, pero esa rigidez ayuda mucho a detectar errores antes y a construir APIs más claras.

### Si venís de Python

Puede parecer más verboso que el enfoque dinámico, pero en Java los generics dan una combinación muy útil de reutilización y seguridad de tipos.

## Errores comunes

### 1. Pensar que `T` es una variable normal

No representa un valor.
Representa un tipo.

### 2. Usar `Object` cuando un generic sería mejor

Eso suele obligar a castings y perder seguridad de tipos.

### 3. Intentar usar primitivos directamente

Los generics trabajan con tipos de referencia, no con `int`, `double`, etc.

### 4. Complicarse demasiado pronto con wildcards avanzados

Al principio conviene dominar bien lo básico antes de profundizar en casos más sofisticados.

### 5. No aprovechar generics en clases propias

Muchas veces vale la pena diseñar tus propias clases o utilidades genéricas si el caso lo amerita.

## Mini ejercicio

Creá una clase genérica `Container<T>` que:

1. guarde un valor de tipo `T`
2. tenga un constructor
3. tenga un getter
4. tenga un método `showValue()`

Después:

- usarla con `String`
- usarla con `Integer`

Además, crear un método genérico que reciba un array y muestre sus elementos.

## Ejemplo posible

```java
public class Container<T> {
    private T value;

    public Container(T value) {
        this.value = value;
    }

    public T getValue() {
        return value;
    }

    public void showValue() {
        System.out.println(value);
    }
}
```

```java
public class Utils {
    public static <T> void printElements(T[] array) {
        for (T element : array) {
            System.out.println(element);
        }
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Container<String> textContainer = new Container<>("Hola");
        Container<Integer> numberContainer = new Container<>(100);

        textContainer.showValue();
        numberContainer.showValue();

        String[] names = {"Ana", "Luis"};
        Utils.printElements(names);
    }
}
```

## Resumen

En esta lección viste que:

- los generics permiten trabajar con tipos parametrizados
- ayudan a escribir código reutilizable y seguro
- se usan muchísimo en Collections
- pueden aplicarse a clases, interfaces y métodos
- permiten reducir casting manual
- existen restricciones como `extends` y wildcards como `?`
- no trabajan directamente con tipos primitivos

## Siguiente tema

En la próxima lección conviene pasar a **LocalDate y LocalDateTime**, porque después de dominar estructuras, estados y tipos más expresivos, el siguiente paso natural es aprender a modelar fechas y tiempos correctamente en Java.
