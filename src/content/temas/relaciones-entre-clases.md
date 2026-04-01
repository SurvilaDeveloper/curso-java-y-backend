---
title: "Relaciones entre clases"
description: "Cómo se conectan las clases entre sí en Java mediante asociación, agregación, composición y otras relaciones de diseño."
order: 18
module: "Programación orientada a objetos"
level: "base"
draft: false
---

## Introducción

Hasta ahora viste clases, objetos, constructores, encapsulamiento, herencia, polimorfismo, abstracción e interfaces.

Todo eso ayuda a modelar entidades y comportamiento.

Pero en un sistema real las clases no viven aisladas. Se relacionan entre sí.

Por ejemplo:

- una `Order` tiene un `Customer`
- un `Cart` contiene `Product`
- una `Company` tiene `Employee`
- un `User` puede tener una `Address`

Entender esas relaciones es una parte muy importante del diseño orientado a objetos, porque afecta cómo representás el dominio y cómo organizás tu código.

## La idea general

Una relación entre clases aparece cuando un objeto necesita conocer, contener, usar o depender de otro.

Por ejemplo:

```java
public class Order {
    private Customer customer;
}
```

Eso ya expresa una relación:
una orden está relacionada con un cliente.

## Por qué importa esto

Modelar bien las relaciones entre clases ayuda a:

- representar mejor el dominio
- evitar duplicación
- separar responsabilidades
- reducir acoplamiento innecesario
- hacer el diseño más mantenible

## Tipos comunes de relaciones

En esta etapa conviene entender especialmente estas:

- asociación
- agregación
- composición
- dependencia
- herencia

La herencia ya la viste antes. Acá nos vamos a enfocar sobre todo en cómo unas clases se vinculan con otras por uso o pertenencia.

## Asociación

La asociación es una relación general entre clases.

Dicho simple:
una clase conoce o usa a otra.

Ejemplo:

```java
public class Customer {
    private String name;

    public Customer(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

```java
public class Order {
    private Customer customer;

    public Order(Customer customer) {
        this.customer = customer;
    }

    public void showCustomer() {
        System.out.println("Cliente: " + customer.getName());
    }
}
```

Acá `Order` está asociada con `Customer`.

## Cómo pensar la asociación

No necesariamente significa que uno “posee totalmente” al otro.

Solo significa que existe un vínculo entre objetos.

En este ejemplo:

- una orden conoce a su cliente
- el cliente puede existir independientemente de la orden

## Asociación unidireccional y bidireccional

### Unidireccional

Una clase conoce a la otra, pero no al revés.

Ejemplo:
`Order` conoce a `Customer`, pero `Customer` no conoce a `Order`.

### Bidireccional

Ambas clases se conocen mutuamente.

Eso puede ser útil a veces, pero también aumenta acoplamiento.

Al empezar, suele ser más sano preferir relaciones unidireccionales cuando alcanzan.

## Dependencia

Una dependencia es una relación más débil y más temporal.

Una clase depende de otra cuando la usa momentáneamente para hacer algo, pero no necesariamente la guarda como atributo.

Ejemplo:

```java
public class EmailService {
    public void sendEmail(String message) {
        System.out.println("Enviando email: " + message);
    }
}
```

```java
public class NotificationManager {
    public void notifyUser(EmailService emailService, String message) {
        emailService.sendEmail(message);
    }
}
```

Acá `NotificationManager` depende de `EmailService` para realizar una acción, pero no lo guarda como parte de su estado.

## Diferencia entre asociación y dependencia

### Asociación

La otra clase suele aparecer como atributo del objeto.

### Dependencia

La otra clase suele aparecer como parámetro, variable local o uso temporal.

## Agregación

La agregación es una relación de “todo-parte” donde una clase contiene o agrupa objetos, pero esas partes pueden existir por separado.

Ejemplo clásico:
una empresa tiene empleados.

```java
public class Employee {
    private String name;

    public Employee(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

```java
public class Company {
    private Employee[] employees;

    public Company(Employee[] employees) {
        this.employees = employees;
    }

    public void showEmployees() {
        for (Employee employee : employees) {
            System.out.println(employee.getName());
        }
    }
}
```

## Cómo pensar la agregación

La empresa agrupa empleados, pero esos empleados no dependen totalmente de que exista esa empresa para existir como concepto dentro del sistema.

Eso diferencia la agregación de una relación aún más fuerte: la composición.

## Composición

La composición también es una relación de “todo-parte”, pero mucho más fuerte.

En composición, la parte está fuertemente ligada al todo.

Ejemplo mental:
una casa y sus habitaciones.
Una habitación tiene sentido como parte de esa casa.

Otro ejemplo de software:
una orden y sus líneas de detalle.

## Ejemplo de composición

```java
public class OrderItem {
    private String productName;
    private int quantity;

    public OrderItem(String productName, int quantity) {
        this.productName = productName;
        this.quantity = quantity;
    }

    public void showInfo() {
        System.out.println(productName + " x" + quantity);
    }
}
```

```java
public class Order {
    private OrderItem[] items;

    public Order() {
        items = new OrderItem[] {
            new OrderItem("Notebook", 1),
            new OrderItem("Mouse", 2)
        };
    }

    public void showItems() {
        for (OrderItem item : items) {
            item.showInfo();
        }
    }
}
```

## Qué expresa la composición

Acá `Order` contiene `OrderItem`, y esos ítems están fuertemente ligados al contexto de la orden.

La idea fuerte es que la parte vive dentro del todo de forma mucho más cerrada.

## Diferencia entre agregación y composición

La frontera exacta puede variar según el dominio, pero esta idea ayuda mucho:

### Agregación

- la parte puede existir independientemente
- la relación es más débil

### Composición

- la parte está fuertemente unida al todo
- la relación es más fuerte y estructural

## Ejemplo comparativo simple

### Agregación

Una `Team` tiene `Player`.
El jugador puede seguir existiendo aunque cambie de equipo.

### Composición

Una `Order` tiene `OrderItem`.
Ese detalle tiene sentido como parte de esa orden.

## Herencia como relación

La herencia también es una relación entre clases, pero de otro tipo.

No expresa “tiene un”.
Expresa “es un”.

Ejemplo:

- un `Dog` es un `Animal`
- un `AdminUser` es un `User`

Eso es distinto de relaciones como:

- una `Order` tiene un `Customer`
- una `Company` tiene `Employee`

## “Es un” vs “tiene un”

Esta es una regla muy útil al diseñar:

### Herencia

Expresa una relación de tipo:
**es un**

### Asociación / agregación / composición

Expresan relaciones de tipo:
**tiene un** o **usa un**

Ejemplos:

- `Dog` es un `Animal`
- `Order` tiene un `Customer`
- `Cart` tiene productos
- `NotificationManager` usa un `EmailService`

## Relación uno a uno

Ejemplo:

- un `User` tiene una `Profile`

```java
public class Profile {
    private String bio;

    public Profile(String bio) {
        this.bio = bio;
    }

    public String getBio() {
        return bio;
    }
}
```

```java
public class User {
    private String username;
    private Profile profile;

    public User(String username, Profile profile) {
        this.username = username;
        this.profile = profile;
    }

    public void showProfile() {
        System.out.println(username + ": " + profile.getBio());
    }
}
```

## Relación uno a muchos

Ejemplo:

- una empresa tiene muchos empleados
- una orden tiene muchos ítems

```java
public class Department {
    private Employee[] employees;

    public Department(Employee[] employees) {
        this.employees = employees;
    }
}
```

## Relación muchos a muchos

A nivel conceptual, también existen relaciones muchos a muchos.

Por ejemplo:

- estudiantes y cursos
- productos y categorías

Más adelante, cuando veas base de datos y modelado relacional, esto va a cobrar todavía más importancia.

## Ejemplo completo de asociación

```java
public class Customer {
    private String name;

    public Customer(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

```java
public class Order {
    private Customer customer;
    private String orderNumber;

    public Order(String orderNumber, Customer customer) {
        this.orderNumber = orderNumber;
        this.customer = customer;
    }

    public void showInfo() {
        System.out.println("Orden: " + orderNumber);
        System.out.println("Cliente: " + customer.getName());
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Customer customer = new Customer("Gabriel");
        Order order = new Order("ORD-1001", customer);

        order.showInfo();
    }
}
```

## Ejemplo completo de agregación

```java
public class Employee {
    private String name;

    public Employee(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

```java
public class Company {
    private String name;
    private Employee[] employees;

    public Company(String name, Employee[] employees) {
        this.name = name;
        this.employees = employees;
    }

    public void showEmployees() {
        System.out.println("Empresa: " + name);
        for (Employee employee : employees) {
            System.out.println("- " + employee.getName());
        }
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Employee e1 = new Employee("Ana");
        Employee e2 = new Employee("Luis");

        Company company = new Company("TechCorp", new Employee[]{e1, e2});
        company.showEmployees();
    }
}
```

## Ejemplo completo de composición

```java
public class Address {
    private String street;
    private String city;

    public Address(String street, String city) {
        this.street = street;
        this.city = city;
    }

    public void showInfo() {
        System.out.println(street + ", " + city);
    }
}
```

```java
public class User {
    private String username;
    private Address address;

    public User(String username, String street, String city) {
        this.username = username;
        this.address = new Address(street, city);
    }

    public void showInfo() {
        System.out.println("Usuario: " + username);
        address.showInfo();
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        User user = new User("gabriel", "Calle 123", "Buenos Aires");
        user.showInfo();
    }
}
```

## Qué muestra ese ejemplo

Muestra una relación fuerte entre `User` y `Address` en el diseño elegido, porque `User` crea internamente la dirección y la integra en su propia construcción.

## Diseño: composición antes que herencia

Vas a escuchar mucho esta idea:

**preferir composición antes que herencia**

No significa que la herencia esté mal.
Significa que muchas veces es mejor combinar objetos que forzar jerarquías demasiado rígidas.

Por ejemplo, a veces es más sano que una clase tenga un objeto auxiliar, en vez de heredar de una clase solo para reutilizar algunas pocas líneas.

## Cómo pensar mejor las relaciones

Una buena pregunta para cada caso es:

- ¿esta clase es un subtipo real de la otra?
- ¿o simplemente tiene una referencia a la otra?
- ¿o la usa temporalmente?
- ¿o la contiene como parte estructural?

Responder bien eso mejora muchísimo el diseño.

## Comparación con otros lenguajes

### Si venís de JavaScript

La idea general puede resultarte familiar, aunque en Java las relaciones suelen modelarse de forma más explícita y más estructurada.

### Si venís de Python

También puede sentirse conocida, pero en Java es muy habitual pensar estas relaciones con más formalidad porque impactan fuerte en el diseño de clases, servicios y entidades.

## Errores comunes

### 1. Usar herencia cuando la relación real era “tiene un”

Eso suele generar diseños forzados.

### 2. Acoplar bidireccionalmente sin necesidad

Si dos clases se conocen mutuamente sin una razón fuerte, el diseño se vuelve más difícil de mantener.

### 3. No distinguir entre dependencia y asociación

No es lo mismo usar algo temporalmente que convertirlo en parte del estado de un objeto.

### 4. Modelar todo como composición fuerte

A veces la relación no es tan cerrada y conviene una relación más débil.

### 5. No pensar el dominio antes de escribir clases

Muchas malas decisiones de diseño vienen de saltar demasiado rápido a la implementación.

## Mini ejercicio

Modelá estas relaciones:

1. una `Course` tiene muchos `Student`
2. una `Car` usa un `Engine`
3. una `User` tiene un `Profile`
4. una `PaymentService` usa un `Logger`

Intentá identificar en cada caso si se parece más a:

- asociación
- agregación
- composición
- dependencia

## Ejemplo posible

```java
public class Student {
    private String name;

    public Student(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

```java
public class Course {
    private String title;
    private Student[] students;

    public Course(String title, Student[] students) {
        this.title = title;
        this.students = students;
    }

    public void showStudents() {
        System.out.println("Curso: " + title);
        for (Student student : students) {
            System.out.println(student.getName());
        }
    }
}
```

## Resumen

En esta lección viste que:

- las clases pueden relacionarse de distintas maneras
- la asociación expresa un vínculo general
- la dependencia expresa un uso temporal
- la agregación es una relación de todo-parte más débil
- la composición es una relación de todo-parte más fuerte
- la herencia expresa una relación de tipo “es un”
- distinguir “es un” de “tiene un” mejora mucho el diseño

## Siguiente tema

En la próxima lección conviene pasar a **Collections**, porque después de entender cómo se modelan y conectan las clases, el siguiente paso natural es trabajar con estructuras dinámicas más potentes que los arrays para manejar grupos de objetos.
