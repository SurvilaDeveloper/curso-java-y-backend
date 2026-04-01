---
title: "Collections"
description: "Cómo trabajar con estructuras dinámicas en Java usando List, Set y Map para manejar grupos de datos con más flexibilidad que los arrays."
order: 19
module: "Herramientas clave del lenguaje"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora trabajaste bastante con arrays y matrices.

Eso fue muy útil para entender cómo guardar y recorrer varios valores del mismo tipo.

Pero los arrays tienen una limitación importante: su tamaño es fijo.

Si querés una estructura más flexible para agregar, quitar, buscar o agrupar datos de forma dinámica, Java ofrece el framework de Collections.

Las Collections son una parte central del lenguaje y se usan muchísimo en proyectos reales.

## La idea general

Los arrays sirven bien para aprender base del lenguaje y para ciertos casos concretos, pero en aplicaciones reales es muy común necesitar estructuras que permitan:

- crecer dinámicamente
- eliminar elementos
- buscar con más comodidad
- representar conjuntos sin duplicados
- asociar claves con valores

Para eso aparecen estructuras como:

- `List`
- `Set`
- `Map`

## Qué significa “Collections”

Cuando se habla de Collections en Java, normalmente se hace referencia al conjunto de interfaces y clases del framework de colecciones de Java.

No todas funcionan igual, y no todas sirven para el mismo caso.

Por eso lo importante no es memorizar nombres, sino entender qué problema resuelve cada una.

## Las tres ideas base que conviene dominar primero

## `List`

Sirve para mantener una secuencia ordenada de elementos, permitiendo repetidos.

## `Set`

Sirve para representar un conjunto sin duplicados.

## `Map`

Sirve para asociar una clave con un valor.

## Por qué no alcanza con arrays

Supongamos esto:

```java
String[] names = {"Ana", "Luis", "Sofía"};
```

Eso está bien.

Pero si después querés:

- agregar otro nombre
- sacar uno
- insertar uno entre medio
- redimensionar fácilmente

el array se vuelve incómodo.

En cambio, con una colección dinámica, eso es mucho más natural.

## `List`

La interfaz `List` representa una colección ordenada de elementos.

Permite:

- mantener el orden de inserción
- acceder por índice
- repetir valores
- agregar y eliminar elementos con más flexibilidad que un array

La implementación más usada al empezar es `ArrayList`.

## Primer ejemplo con `ArrayList`

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();

        names.add("Ana");
        names.add("Luis");
        names.add("Sofía");

        System.out.println(names);
    }
}
```

Resultado:

```text
[Ana, Luis, Sofía]
```

## Qué está pasando acá

### `List<String>`

La variable está declarada con la interfaz `List`.

### `new ArrayList<>()`

La implementación concreta usada es `ArrayList`.

Esta forma es muy buena porque el código depende de la abstracción (`List`) y no tanto de la implementación concreta.

## Por qué usar la interfaz como tipo

Esto:

```java
List<String> names = new ArrayList<>();
```

suele ser mejor que esto:

```java
ArrayList<String> names = new ArrayList<>();
```

porque deja más flexible el diseño.

La idea es:
“me importa trabajar como lista; la implementación concreta puede cambiar si hace falta”.

## Operaciones comunes con `List`

## Agregar elementos

```java
names.add("Carlos");
```

## Acceder por índice

```java
System.out.println(names.get(0));
```

## Modificar un elemento

```java
names.set(1, "Lucía");
```

## Eliminar un elemento

```java
names.remove("Ana");
```

o por índice:

```java
names.remove(0);
```

## Saber cuántos elementos tiene

```java
System.out.println(names.size());
```

## Comprobar si contiene un valor

```java
System.out.println(names.contains("Sofía"));
```

## Recorrer una lista

### Con `for-each`

```java
for (String name : names) {
    System.out.println(name);
}
```

### Con `for` clásico

```java
for (int i = 0; i < names.size(); i++) {
    System.out.println(names.get(i));
}
```

## `List` permite duplicados

```java
List<String> names = new ArrayList<>();
names.add("Ana");
names.add("Ana");

System.out.println(names);
```

Resultado:

```text
[Ana, Ana]
```

Eso es normal en una lista.

## `Set`

La interfaz `Set` representa un conjunto sin duplicados.

Si agregás un valor repetido, el set no lo incorpora de nuevo.

Una implementación muy común es `HashSet`.

## Primer ejemplo con `Set`

```java
import java.util.HashSet;
import java.util.Set;

public class Main {
    public static void main(String[] args) {
        Set<String> tags = new HashSet<>();

        tags.add("java");
        tags.add("backend");
        tags.add("java");

        System.out.println(tags);
    }
}
```

El resultado contiene `"java"` una sola vez.

## Idea importante sobre `Set`

Con `Set`, lo importante no es el índice ni la posición.
Lo importante es la pertenencia al conjunto.

Por eso:

- no accedés por índice como en una lista
- sí preguntás si un elemento pertenece o no

## Operaciones comunes con `Set`

## Agregar

```java
tags.add("spring");
```

## Eliminar

```java
tags.remove("backend");
```

## Verificar pertenencia

```java
System.out.println(tags.contains("java"));
```

## Saber tamaño

```java
System.out.println(tags.size());
```

## Recorrer

```java
for (String tag : tags) {
    System.out.println(tag);
}
```

## Orden en `Set`

Con `HashSet`, el orden no está garantizado.

Eso es importante.

Si necesitás un comportamiento de conjunto pero querés preservar orden de inserción, más adelante podrías ver otras implementaciones como `LinkedHashSet`.

En esta etapa, alcanza con entender que:

- `Set` elimina duplicados
- `HashSet` no garantiza orden

## `Map`

La interfaz `Map` sirve para asociar claves con valores.

Ejemplo mental:

- id → usuario
- código → producto
- país → capital
- username → email

Una implementación muy usada es `HashMap`.

## Primer ejemplo con `Map`

```java
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, String> capitals = new HashMap<>();

        capitals.put("Argentina", "Buenos Aires");
        capitals.put("Chile", "Santiago");
        capitals.put("Perú", "Lima");

        System.out.println(capitals);
    }
}
```

## Qué expresa un `Map`

No representa una lista ni un conjunto simple.

Representa relaciones de tipo:

- clave → valor

## Operaciones comunes con `Map`

## Agregar o actualizar

```java
capitals.put("Uruguay", "Montevideo");
```

## Obtener un valor por clave

```java
System.out.println(capitals.get("Argentina"));
```

## Verificar si existe una clave

```java
System.out.println(capitals.containsKey("Chile"));
```

## Verificar si existe un valor

```java
System.out.println(capitals.containsValue("Lima"));
```

## Eliminar por clave

```java
capitals.remove("Perú");
```

## Saber cantidad de pares

```java
System.out.println(capitals.size());
```

## Recorrer un `Map`

Hay varias formas.

### Recorrer claves

```java
for (String country : capitals.keySet()) {
    System.out.println(country);
}
```

### Recorrer valores

```java
for (String capital : capitals.values()) {
    System.out.println(capital);
}
```

### Recorrer pares clave-valor

```java
for (Map.Entry<String, String> entry : capitals.entrySet()) {
    System.out.println(entry.getKey() + " -> " + entry.getValue());
}
```

## Diferencia entre `List`, `Set` y `Map`

### `List`

- mantiene orden
- permite repetidos
- acceso por índice

### `Set`

- no permite duplicados
- no trabaja por índice
- representa pertenencia al conjunto

### `Map`

- guarda pares clave-valor
- cada clave es única
- sirve para búsquedas por clave

## Genéricos en Collections

En todos estos ejemplos viste cosas como:

```java
List<String>
Set<String>
Map<String, String>
```

Eso forma parte de los genéricos de Java.

Los genéricos permiten decir de qué tipo serán los elementos de la colección.

Por ejemplo:

```java
List<Integer> numbers = new ArrayList<>();
```

Eso indica que la lista guarda enteros.

## Por qué esto es importante

Sin genéricos, tendrías menos seguridad de tipos y más necesidad de conversiones manuales.

Los genéricos hacen que el código sea más seguro y más claro.

## Ejemplo con objetos propios

Las colecciones no solo guardan strings o enteros.
También pueden guardar objetos definidos por vos.

```java
public class Product {
    private String name;

    public Product(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Product> products = new ArrayList<>();

        products.add(new Product("Notebook"));
        products.add(new Product("Mouse"));
        products.add(new Product("Teclado"));

        for (Product product : products) {
            System.out.println(product.getName());
        }
    }
}
```

## Cuándo usar cada uno

## Usá `List` cuando

- te importa el orden
- aceptás repetidos
- querés recorrer secuencias
- querés acceso por índice

## Usá `Set` cuando

- querés evitar duplicados
- te importa pertenencia más que posición

## Usá `Map` cuando

- necesitás buscar por clave
- querés asociar un dato con otro

## Ejemplo práctico comparativo

Supongamos un sistema de cursos.

### Lista de alumnos inscriptos

```java
List<String> students = new ArrayList<>();
```

### Conjunto de tecnologías vistas

```java
Set<String> topics = new HashSet<>();
```

### Mapa de usuario a email

```java
Map<String, String> emails = new HashMap<>();
```

Cada estructura responde a una necesidad distinta.

## `Collection` vs `Collections`

Conviene no confundir estos nombres.

### `Collection`

Es una interfaz base del framework de colecciones.

### `Collections`

Es una clase utilitaria con métodos útiles.

Por ejemplo, más adelante podés usar cosas como:

```java
Collections.sort(lista);
```

En esta etapa no hace falta profundizar mucho, pero conviene saber que no son lo mismo.

## Ejemplo completo

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Ana");
        names.add("Luis");
        names.add("Ana");

        Set<String> uniqueNames = new HashSet<>();
        uniqueNames.add("Ana");
        uniqueNames.add("Luis");
        uniqueNames.add("Ana");

        Map<String, Integer> scores = new HashMap<>();
        scores.put("Ana", 90);
        scores.put("Luis", 85);

        System.out.println("Lista:");
        for (String name : names) {
            System.out.println(name);
        }

        System.out.println("Set:");
        for (String name : uniqueNames) {
            System.out.println(name);
        }

        System.out.println("Map:");
        for (Map.Entry<String, Integer> entry : scores.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
    }
}
```

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a arrays, sets y objetos o maps, pero en Java todo esto aparece tipado, con interfaces explícitas y con implementaciones concretas bien diferenciadas.

### Si venís de Python

Puede recordarte a listas, conjuntos y diccionarios. La diferencia es que en Java la jerarquía de tipos y la elección de interfaz/implementación son mucho más explícitas.

## Errores comunes

### 1. Usar `List` para todo por costumbre

A veces conviene un `Set` o un `Map` según el problema.

### 2. Esperar acceso por índice en un `Set`

`Set` no está pensado para eso.

### 3. Creer que `HashSet` mantiene orden

No lo garantiza.

### 4. Confundir clave con valor en un `Map`

La clave identifica; el valor es el dato asociado.

### 5. No usar genéricos

Las colecciones sin tipo explícito suelen volver el código menos seguro y menos claro.

## Mini ejercicio

Creá un ejemplo donde uses:

1. una `List<String>` para guardar nombres
2. un `Set<String>` para guardar categorías únicas
3. un `Map<String, Double>` para asociar productos con precios

Después:

- agregá datos
- recorré cada estructura
- imprimí sus contenidos
- probá operaciones como `contains`, `get`, `remove` y `size`

## Ejemplo posible

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Ana");
        names.add("Luis");
        names.add("Sofía");

        Set<String> categories = new HashSet<>();
        categories.add("Electrónica");
        categories.add("Hogar");
        categories.add("Electrónica");

        Map<String, Double> prices = new HashMap<>();
        prices.put("Notebook", 1250.50);
        prices.put("Mouse", 25.99);

        System.out.println(names.contains("Ana"));
        System.out.println(categories.size());
        System.out.println(prices.get("Notebook"));

        for (String name : names) {
            System.out.println(name);
        }

        for (String category : categories) {
            System.out.println(category);
        }

        for (Map.Entry<String, Double> entry : prices.entrySet()) {
            System.out.println(entry.getKey() + " -> " + entry.getValue());
        }
    }
}
```

## Resumen

En esta lección viste que:

- las Collections permiten manejar grupos de datos de forma más flexible que los arrays
- `List` representa secuencias ordenadas y permite duplicados
- `Set` representa conjuntos sin duplicados
- `Map` asocia claves con valores
- `ArrayList`, `HashSet` y `HashMap` son implementaciones muy comunes
- los genéricos permiten definir de qué tipo serán los elementos
- elegir bien la estructura mejora mucho el diseño del código

## Siguiente tema

En la próxima lección conviene pasar a **Exceptions**, porque una vez que ya sabés modelar y manejar datos con más flexibilidad, el siguiente paso natural es aprender a controlar errores y situaciones inesperadas de manera robusta.
