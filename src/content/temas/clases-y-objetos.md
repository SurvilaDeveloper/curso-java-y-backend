---
title: "Clases y objetos"
description: "Cómo modelar entidades en Java usando clases, crear objetos y entender la base de la programación orientada a objetos."
order: 11
module: "Programación orientada a objetos"
level: "base"
draft: false
---

## Introducción

Hasta ahora trabajaste con tipos básicos del lenguaje, arrays, matrices, condicionales, bucles y métodos.

Eso alcanza para muchos programas pequeños, pero Java está pensado fuertemente alrededor de la programación orientada a objetos.

Por eso, uno de los pasos más importantes al aprender Java es entender qué son las clases y qué son los objetos.

Esta lección es clave porque a partir de acá empezás a modelar cosas del mundo del problema, no solo variables sueltas.

## La idea general

Supongamos que querés representar un producto.

Hasta ahora podrías hacer algo así:

```java
String productName = "Notebook";
double productPrice = 1250.50;
boolean available = true;
```

Eso funciona, pero tiene un problema: los datos están separados.

No existe una sola entidad que represente al producto como unidad.

La programación orientada a objetos permite agrupar datos y comportamiento dentro de una misma estructura.

## Qué es una clase

Una clase es un molde o plantilla que define cómo será un tipo de objeto.

Dentro de una clase normalmente se definen:

- atributos
- métodos

Los atributos representan datos.
Los métodos representan comportamientos.

## Qué es un objeto

Un objeto es una instancia concreta de una clase.

Si la clase es el molde, el objeto es la realización concreta de ese molde.

Ejemplo mental:

- clase: `Product`
- objeto: un producto específico, como una notebook de cierto precio

## Primer ejemplo de clase

```java
public class Product {
    String name;
    double price;
    boolean available;
}
```

Esta clase define que un `Product` tiene:

- un nombre
- un precio
- un estado de disponibilidad

## Crear un objeto

A partir de esa clase, podés crear objetos.

```java
public class Main {
    public static void main(String[] args) {
        Product product = new Product();

        product.name = "Notebook";
        product.price = 1250.50;
        product.available = true;

        System.out.println(product.name);
        System.out.println(product.price);
        System.out.println(product.available);
    }
}
```

## Qué está pasando acá

### `Product product`

Declara una variable capaz de referenciar un objeto de tipo `Product`.

### `new Product()`

Crea un nuevo objeto de esa clase.

### `product.name = "Notebook";`

Asigna un valor al atributo `name` de ese objeto.

## Clase y objeto no son lo mismo

Este punto es muy importante.

La clase define la estructura.
El objeto es una instancia concreta.

Por ejemplo:

```java
Product product1 = new Product();
Product product2 = new Product();
```

Ambos son objetos distintos, aunque provengan de la misma clase.

## Varios objetos de la misma clase

```java
public class Main {
    public static void main(String[] args) {
        Product product1 = new Product();
        product1.name = "Notebook";
        product1.price = 1250.50;
        product1.available = true;

        Product product2 = new Product();
        product2.name = "Mouse";
        product2.price = 25.99;
        product2.available = false;

        System.out.println(product1.name);
        System.out.println(product2.name);
    }
}
```

Esto muestra muy bien la idea de que una clase sirve para crear muchos objetos con la misma forma general, pero con valores distintos.

## Atributos

Los atributos son variables que pertenecen al objeto.

En este ejemplo:

```java
public class Product {
    String name;
    double price;
    boolean available;
}
```

los atributos son:

- `name`
- `price`
- `available`

Sirven para describir el estado del objeto.

## Métodos dentro de una clase

Una clase no solo puede guardar datos. También puede definir comportamientos.

Ejemplo:

```java
public class Product {
    String name;
    double price;
    boolean available;

    void showInfo() {
        System.out.println("Nombre: " + name);
        System.out.println("Precio: " + price);
        System.out.println("Disponible: " + available);
    }
}
```

Y se usa así:

```java
public class Main {
    public static void main(String[] args) {
        Product product = new Product();
        product.name = "Notebook";
        product.price = 1250.50;
        product.available = true;

        product.showInfo();
    }
}
```

## Qué cambia con esto

Ahora el comportamiento relacionado con el producto está dentro del propio `Product`.

Eso hace que el diseño sea más natural.

En vez de tener datos sueltos y funciones externas, el objeto reúne ambas cosas:

- estado
- comportamiento

## Referencias a objetos

Cuando hacés esto:

```java
Product product = new Product();
```

la variable `product` no contiene el objeto entero “como un valor simple” al estilo de un `int`.

Contiene una referencia al objeto.

Esa diferencia más adelante será muy importante para entender asignaciones, comparaciones y `null`.

## Acceso con punto

Para acceder a atributos o métodos de un objeto se usa la notación con punto.

Ejemplo:

```java
product.name
product.price
product.showInfo()
```

Eso se lee como:

- el nombre del objeto `product`
- seguido del atributo o método al que querés acceder

## Un ejemplo más realista

```java
public class User {
    String username;
    String email;
    boolean active;

    void showProfile() {
        System.out.println("Usuario: " + username);
        System.out.println("Email: " + email);
        System.out.println("Activo: " + active);
    }
}
```

Uso:

```java
public class Main {
    public static void main(String[] args) {
        User user = new User();
        user.username = "gabriel";
        user.email = "gabriel@example.com";
        user.active = true;

        user.showProfile();
    }
}
```

## ¿Por qué esto es mejor que variables sueltas?

Porque permite representar una entidad real del dominio de forma más coherente.

En vez de tener:

```java
String username = "gabriel";
String email = "gabriel@example.com";
boolean active = true;
```

tenés un objeto `user` que agrupa todo eso.

Eso mejora:

- organización
- legibilidad
- mantenibilidad
- escalabilidad

## Pensar en objetos

Una habilidad importante en Java es aprender a mirar un problema y detectar posibles clases.

Por ejemplo, en un e-commerce podrían aparecer:

- `Product`
- `User`
- `Order`
- `Category`
- `Cart`

Cada una representa una entidad del dominio.

## Diferencia entre tipo primitivo y objeto

Hasta ahora viste tipos como:

- `int`
- `double`
- `boolean`

Esos son primitivos.

En cambio:

```java
Product product = new Product();
```

`Product` es un tipo definido por vos, basado en una clase.

Eso amplía muchísimo lo que podés modelar en el lenguaje.

## Valores por defecto en atributos

Cuando creás un objeto y no asignás valores manualmente a sus atributos, Java les da valores por defecto.

Ejemplo:

```java
public class Product {
    String name;
    double price;
    boolean available;
}
```

Si hacés:

```java
Product product = new Product();
System.out.println(product.name);
System.out.println(product.price);
System.out.println(product.available);
```

los valores iniciales serán:

- `name` → `null`
- `price` → `0.0`
- `available` → `false`

Esto vale para atributos de instancia, no para variables locales dentro de métodos.

## `this` como idea inicial

Más adelante vas a profundizar en `this`, pero conviene nombrarlo desde ahora.

Dentro de una clase, `this` representa al objeto actual.

Todavía no hace falta usarlo mucho en esta etapa, pero es bueno saber que existe.

## Ejemplo completo

```java
public class Product {
    String name;
    double price;
    boolean available;

    void showInfo() {
        System.out.println("Nombre: " + name);
        System.out.println("Precio: " + price);
        System.out.println("Disponible: " + available);
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Product product1 = new Product();
        product1.name = "Notebook";
        product1.price = 1250.50;
        product1.available = true;

        Product product2 = new Product();
        product2.name = "Mouse";
        product2.price = 25.99;
        product2.available = false;

        product1.showInfo();
        System.out.println("---");
        product2.showInfo();
    }
}
```

## Comparación con otros lenguajes

### Si venís de JavaScript

La idea puede recordarte a objetos, pero en Java las clases y los tipos tienen un papel mucho más explícito y estructurado.

### Si venís de Python

Puede recordarte a definir clases con atributos y métodos, pero en Java la sintaxis es más explícita y el tipado también.

## Errores comunes

### 1. Confundir clase con objeto

La clase define.
El objeto es la instancia concreta.

### 2. Pensar que `new` es opcional

Para crear un objeto de una clase, normalmente necesitás usar `new`.

### 3. Modelar todo con variables sueltas

Eso funciona al principio, pero impide aprovechar la orientación a objetos.

### 4. Meter demasiada lógica en `main`

Cuando empezás a trabajar con objetos, conviene que `main` coordine y que las clases encapsulen mejor sus responsabilidades.

### 5. No ver la diferencia entre atributo y variable local

Un atributo pertenece al objeto.
Una variable local pertenece a un método.

## Mini ejercicio

Creá una clase para representar un libro.

La clase podría tener:

- título
- autor
- cantidad de páginas
- si está disponible o no

Después:

1. crear dos objetos `Book`
2. asignarles valores
3. mostrar sus datos
4. agregar un método que imprima la información del libro

## Ejemplo posible

```java
public class Book {
    String title;
    String author;
    int pages;
    boolean available;

    void showInfo() {
        System.out.println("Título: " + title);
        System.out.println("Autor: " + author);
        System.out.println("Páginas: " + pages);
        System.out.println("Disponible: " + available);
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Book book1 = new Book();
        book1.title = "Clean Code";
        book1.author = "Robert C. Martin";
        book1.pages = 464;
        book1.available = true;

        Book book2 = new Book();
        book2.title = "Effective Java";
        book2.author = "Joshua Bloch";
        book2.pages = 416;
        book2.available = false;

        book1.showInfo();
        System.out.println("---");
        book2.showInfo();
    }
}
```

## Resumen

En esta lección viste que:

- una clase es un molde
- un objeto es una instancia concreta de una clase
- una clase puede tener atributos y métodos
- los objetos se crean con `new`
- varias instancias pueden salir de la misma clase
- la notación con punto permite acceder a atributos y métodos
- Java está fuertemente orientado a objetos

## Siguiente tema

En la próxima lección conviene pasar a **constructores**, porque una vez que ya sabés crear objetos, el siguiente paso natural es aprender a inicializarlos mejor desde el momento de su creación.
