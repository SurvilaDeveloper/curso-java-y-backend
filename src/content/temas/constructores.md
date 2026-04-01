---
title: "Constructores"
description: "Cómo inicializar objetos en Java de forma más clara y segura usando constructores."
order: 12
module: "Programación orientada a objetos"
level: "base"
draft: false
---

## Introducción

En la lección anterior viste qué son las clases y los objetos, y cómo crear instancias con `new`.

También viste que, después de crear un objeto, podías asignarle valores a sus atributos así:

```java
Product product = new Product();
product.name = "Notebook";
product.price = 1250.50;
product.available = true;
```

Eso funciona, pero tiene una desventaja: el objeto puede existir un rato “a medio completar”.

Por ejemplo, podría quedar creado sin nombre, sin precio o en un estado inconsistente.

Para resolver mejor esa inicialización, Java usa constructores.

## Qué es un constructor

Un constructor es un bloque especial de una clase que se ejecuta cuando se crea un objeto.

Su objetivo principal es inicializar el objeto.

Ejemplo:

```java
public class Product {
    String name;
    double price;
    boolean available;

    public Product(String name, double price, boolean available) {
        this.name = name;
        this.price = price;
        this.available = available;
    }
}
```

Ahora, al crear el objeto, podés pasarle directamente los datos necesarios.

## Cómo se reconoce un constructor

Un constructor tiene dos características muy importantes:

- tiene el mismo nombre que la clase
- no tiene tipo de retorno, ni siquiera `void`

Ejemplo:

```java
public Product(String name, double price, boolean available) {
    ...
}
```

Eso es un constructor.

En cambio, esto sería un método:

```java
public void Product() {
    ...
}
```

Aunque tenga un nombre parecido, no es constructor porque tiene `void`.

## Usar un constructor

Con la clase anterior, podés crear objetos así:

```java
Product product = new Product("Notebook", 1250.50, true);
```

Ahora el objeto nace ya inicializado.

## Qué pasa al ejecutar `new`

Cuando hacés esto:

```java
new Product("Notebook", 1250.50, true);
```

Java:

1. reserva memoria para el objeto
2. crea la instancia
3. ejecuta el constructor
4. deja el objeto listo para usarse

## Ventajas de usar constructores

## 1. Inicialización más clara

El objeto se crea directamente con los datos importantes.

## 2. Menos riesgo de estados incompletos

Evitás objetos creados “vacíos” que después dependan de muchas asignaciones externas.

## 3. Código más legible

Compará esto:

```java
Product product = new Product();
product.name = "Notebook";
product.price = 1250.50;
product.available = true;
```

con esto:

```java
Product product = new Product("Notebook", 1250.50, true);
```

La segunda versión es más compacta y más expresiva.

## Primer ejemplo completo

```java
public class Product {
    String name;
    double price;
    boolean available;

    public Product(String name, double price, boolean available) {
        this.name = name;
        this.price = price;
        this.available = available;
    }

    void showInfo() {
        System.out.println("Nombre: " + name);
        System.out.println("Precio: " + price);
        System.out.println("Disponible: " + available);
    }
}
```

Uso:

```java
public class Main {
    public static void main(String[] args) {
        Product product = new Product("Notebook", 1250.50, true);
        product.showInfo();
    }
}
```

## Qué es `this`

En el constructor aparece esto:

```java
this.name = name;
this.price = price;
this.available = available;
```

`this` representa al objeto actual.

## Por qué hace falta `this` acá

En este constructor:

```java
public Product(String name, double price, boolean available) {
    this.name = name;
    this.price = price;
    this.available = available;
}
```

los parámetros tienen el mismo nombre que los atributos.

Entonces:

- `name` a secas refiere al parámetro
- `this.name` refiere al atributo del objeto

Lo mismo pasa con `price` y `available`.

## Forma mental útil

Podés leer esto así:

```java
this.name = name;
```

“el atributo `name` de este objeto recibe el valor del parámetro `name`”.

## Constructor sin parámetros

También puede existir un constructor sin parámetros.

Ejemplo:

```java
public class Product {
    String name;
    double price;
    boolean available;

    public Product() {
        name = "Sin nombre";
        price = 0.0;
        available = false;
    }
}
```

Uso:

```java
Product product = new Product();
```

En este caso el objeto se crea con valores iniciales definidos por vos.

## Constructor por defecto

Conviene distinguir dos ideas:

### Constructor sin parámetros escrito por vos

```java
public Product() {
    ...
}
```

### Constructor por defecto generado por Java

Si no escribís ningún constructor en una clase, Java genera automáticamente uno vacío sin parámetros.

Por ejemplo, si tu clase es:

```java
public class Product {
    String name;
    double price;
}
```

Java permite hacer:

```java
Product product = new Product();
```

porque genera un constructor vacío implícito.

## Atención importante

Si vos escribís cualquier constructor, Java deja de generar automáticamente el constructor vacío.

Por ejemplo, si escribís esto:

```java
public class Product {
    String name;

    public Product(String name) {
        this.name = name;
    }
}
```

entonces esto ya no funciona:

```java
Product product = new Product();
```

salvo que vos también declares un constructor vacío.

## Sobrecarga de constructores

Una clase puede tener varios constructores, siempre que cambie la lista de parámetros.

Eso se llama sobrecarga.

Ejemplo:

```java
public class Product {
    String name;
    double price;
    boolean available;

    public Product() {
        this.name = "Sin nombre";
        this.price = 0.0;
        this.available = false;
    }

    public Product(String name, double price, boolean available) {
        this.name = name;
        this.price = price;
        this.available = available;
    }
}
```

Ahora podés crear objetos de dos formas:

```java
Product p1 = new Product();
Product p2 = new Product("Notebook", 1250.50, true);
```

## Cuándo sirve la sobrecarga

Sirve cuando querés ofrecer distintas formas válidas de crear un objeto.

Por ejemplo:

- con todos los datos
- con algunos datos
- con valores por defecto

## Constructor con parte de los datos

```java
public class User {
    String username;
    String email;
    boolean active;

    public User(String username, String email) {
        this.username = username;
        this.email = email;
        this.active = true;
    }
}
```

Uso:

```java
User user = new User("gabriel", "gabriel@example.com");
```

Acá el constructor decide que todo usuario nuevo arranca activo.

## Buen criterio al diseñar constructores

Al empezar, una buena pregunta es:

“¿Qué datos son mínimos para que este objeto tenga sentido?”

Si un `Product` no tiene sentido sin nombre y precio, entonces probablemente esos datos deberían estar en el constructor.

## Ejemplo completo con varios constructores

```java
public class Book {
    String title;
    String author;
    int pages;
    boolean available;

    public Book() {
        this.title = "Sin título";
        this.author = "Desconocido";
        this.pages = 0;
        this.available = false;
    }

    public Book(String title, String author, int pages, boolean available) {
        this.title = title;
        this.author = author;
        this.pages = pages;
        this.available = available;
    }

    void showInfo() {
        System.out.println("Título: " + title);
        System.out.println("Autor: " + author);
        System.out.println("Páginas: " + pages);
        System.out.println("Disponible: " + available);
    }
}
```

Uso:

```java
public class Main {
    public static void main(String[] args) {
        Book book1 = new Book();
        Book book2 = new Book("Effective Java", "Joshua Bloch", 416, true);

        book1.showInfo();
        System.out.println("---");
        book2.showInfo();
    }
}
```

## Relación entre constructores y encapsulamiento

Más adelante vas a ver getters, setters y encapsulación más formal.

Pero incluso antes de llegar a eso, los constructores ya ayudan a mejorar el diseño porque obligan a pensar mejor cómo nace un objeto.

## Comparación con otros lenguajes

### Si venís de JavaScript

La idea puede recordarte al `constructor` de una clase moderna, aunque en Java el uso está mucho más integrado al modelo clásico de clases tipadas.

### Si venís de Python

Puede recordarte a `__init__`, con la diferencia de que en Java el constructor tiene el mismo nombre que la clase y no declara tipo de retorno.

## Errores comunes

### 1. Pensar que el constructor es un método cualquiera

No lo es.
Tiene reglas especiales y se ejecuta al crear el objeto.

### 2. Poner `void` en el constructor

Si tiene `void`, ya no es constructor.

### 3. Olvidar `this` cuando hace falta distinguir atributo y parámetro

En muchos casos, usar `this` evita ambigüedades y hace el código más claro.

### 4. Escribir un constructor con parámetros y creer que sigue existiendo el vacío automáticamente

Si declarás un constructor, Java ya no genera el constructor vacío por vos.

### 5. Crear constructores que no representan estados válidos

Conviene que la creación del objeto refleje una inicialización razonable.

## Mini ejercicio

Creá una clase `User` con estos atributos:

- username
- email
- active

Después:

1. crear un constructor que reciba username y email
2. hacer que `active` arranque en `true`
3. agregar un método para mostrar la información
4. crear al menos dos objetos usando el constructor

## Ejemplo posible

```java
public class User {
    String username;
    String email;
    boolean active;

    public User(String username, String email) {
        this.username = username;
        this.email = email;
        this.active = true;
    }

    void showInfo() {
        System.out.println("Usuario: " + username);
        System.out.println("Email: " + email);
        System.out.println("Activo: " + active);
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        User user1 = new User("gabriel", "gabriel@example.com");
        User user2 = new User("ana", "ana@example.com");

        user1.showInfo();
        System.out.println("---");
        user2.showInfo();
    }
}
```

## Resumen

En esta lección viste que:

- un constructor se ejecuta al crear un objeto
- sirve para inicializar el estado del objeto
- tiene el mismo nombre que la clase
- no tiene tipo de retorno
- `this` permite referirse al objeto actual
- pueden existir varios constructores con distinta lista de parámetros
- si escribís un constructor, Java deja de generar automáticamente el vacío

## Siguiente tema

En la próxima lección conviene pasar a **encapsulamiento**, porque una vez que ya sabés crear e inicializar objetos, el siguiente paso natural es controlar mejor cómo se accede y modifica su estado.
