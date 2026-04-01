---
title: "Encapsulamiento"
description: "Cómo proteger y controlar el estado de un objeto en Java usando modificadores de acceso, getters y setters."
order: 13
module: "Programación orientada a objetos"
level: "base"
draft: false
---

## Introducción

En las lecciones anteriores viste cómo crear clases, instanciar objetos y usar constructores para inicializarlos.

Pero todavía había un problema importante: los atributos quedaban expuestos directamente.

Por ejemplo:

```java
public class Product {
    String name;
    double price;
    boolean available;
}
```

Con una clase así, cualquier parte del programa puede cambiar libremente esos valores:

```java
Product product = new Product("Notebook", 1250.50, true);
product.price = -999;
product.name = null;
```

Eso puede dejar al objeto en un estado inválido o inconsistente.

Para evitar ese tipo de problemas, aparece uno de los principios más importantes de la programación orientada a objetos: el encapsulamiento.

## Qué es el encapsulamiento

El encapsulamiento es la idea de ocultar o proteger el estado interno de un objeto y controlar cómo se accede o modifica.

Dicho simple:

- los datos internos del objeto no deberían quedar expuestos sin control
- el propio objeto debería decidir qué cambios son válidos y cuáles no

Esto mejora muchísimo:

- seguridad
- claridad del diseño
- mantenibilidad
- control de reglas de negocio

## La idea general

En vez de hacer esto:

```java
product.price = -999;
```

preferís que el objeto exponga una forma controlada de cambiar su precio.

Por ejemplo:

```java
product.setPrice(999.99);
```

Y dentro de ese método se puede validar que el valor tenga sentido.

## Modificadores de acceso

Para encapsular, Java usa modificadores de acceso.

Los principales son:

- `public`
- `private`
- `protected`
- acceso por paquete (sin palabra clave)

En esta etapa, el más importante para entender encapsulamiento es `private`.

## `private`

Cuando un atributo es `private`, no se puede acceder directamente desde fuera de la clase.

Ejemplo:

```java
public class Product {
    private String name;
    private double price;
    private boolean available;
}
```

Ahora esto ya no funciona desde otra clase:

```java
product.price = 10.0;
```

porque `price` está protegido dentro del objeto.

## Qué gana el diseño con eso

El objeto deja de ser una “bolsa de datos abierta” y pasa a controlar mejor su estado.

Eso es una mejora enorme.

## Getters y setters

Una forma muy común de trabajar con encapsulamiento en Java es usar:

- getters
- setters

### Getter

Sirve para leer el valor de un atributo privado.

### Setter

Sirve para modificar el valor de un atributo privado, idealmente con validación.

## Ejemplo básico

```java
public class Product {
    private String name;
    private double price;
    private boolean available;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
```

## Cómo usar esa clase

```java
public class Main {
    public static void main(String[] args) {
        Product product = new Product();

        product.setName("Notebook");
        product.setPrice(1250.50);
        product.setAvailable(true);

        System.out.println(product.getName());
        System.out.println(product.getPrice());
        System.out.println(product.isAvailable());
    }
}
```

## ¿Por qué el getter booleano suele llamarse `isAvailable()`?

En Java, por convención, los getters de valores booleanos suelen escribirse así:

- `isActive()`
- `isAvailable()`
- `isBlocked()`

aunque también en algunos casos puede verse `getAvailable()`.
La convención más natural suele ser `is...`.

## Encapsular no significa solo “poner getters y setters”

Esto es muy importante.

Mucha gente cree que encapsular es simplemente:

- poner todo `private`
- generar getters y setters automáticamente

Pero el verdadero punto del encapsulamiento es controlar el acceso con criterio.

A veces tiene sentido exponer un setter.
A veces no.

## Validación en setters

Acá aparece una de las mayores ventajas del encapsulamiento.

Ejemplo:

```java
public class Product {
    private String name;
    private double price;
    private boolean available;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name != null && !name.isBlank()) {
            this.name = name;
        }
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        if (price >= 0) {
            this.price = price;
        }
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
```

Ahora el objeto ya no acepta cualquier valor ciegamente.

## Qué cambia con eso

Antes, cualquiera podía hacer esto:

```java
product.price = -100;
```

Ahora, con setter validado, el objeto puede impedir valores inválidos.

Eso es muchísimo más robusto.

## Constructor + encapsulamiento

Los constructores y el encapsulamiento se complementan muy bien.

Ejemplo:

```java
public class Product {
    private String name;
    private double price;
    private boolean available;

    public Product(String name, double price, boolean available) {
        setName(name);
        setPrice(price);
        setAvailable(available);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name != null && !name.isBlank()) {
            this.name = name;
        }
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        if (price >= 0) {
            this.price = price;
        }
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
```

Eso hace que incluso la creación del objeto pase por reglas controladas.

## Cuándo no conviene exponer setter

No todos los atributos deberían poder modificarse libremente.

Por ejemplo, quizá tenga sentido que un `User` permita leer el `id`, pero no cambiarlo desde afuera.

Ejemplo:

```java
public class User {
    private int id;
    private String username;

    public User(int id, String username) {
        this.id = id;
        this.username = username;
    }

    public int getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        if (username != null && !username.isBlank()) {
            this.username = username;
        }
    }
}
```

Acá `id` se puede leer, pero no modificar desde afuera.

Eso también es encapsulamiento.

## Encapsulamiento como diseño, no solo como sintaxis

La pregunta útil no es:
“¿Tengo getters y setters?”

La pregunta útil es:
“¿Esta clase controla razonablemente su estado?”

Ese es el núcleo del encapsulamiento.

## Ejemplo completo

```java
public class BankAccount {
    private String owner;
    private double balance;

    public BankAccount(String owner, double balance) {
        setOwner(owner);
        setBalance(balance);
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        if (owner != null && !owner.isBlank()) {
            this.owner = owner;
        }
    }

    public double getBalance() {
        return balance;
    }

    private void setBalance(double balance) {
        if (balance >= 0) {
            this.balance = balance;
        }
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }

    public void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
        }
    }

    public void showInfo() {
        System.out.println("Titular: " + owner);
        System.out.println("Saldo: " + balance);
    }
}
```

Uso:

```java
public class Main {
    public static void main(String[] args) {
        BankAccount account = new BankAccount("Gabriel", 1000);

        account.deposit(500);
        account.withdraw(200);

        account.showInfo();
    }
}
```

## Por qué este ejemplo es bueno

Porque no expone libremente algo delicado como `balance`.

En vez de permitir:

```java
account.balance = -1000;
```

la clase obliga a usar operaciones controladas como:

- `deposit`
- `withdraw`

Eso es mucho más realista y seguro.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede resultarte más rígido que trabajar con objetos más abiertos, pero esa rigidez ayuda mucho en proyectos grandes.

### Si venís de Python

La idea general de proteger el estado puede resultarte familiar, aunque en Java el uso de `private`, getters y setters es mucho más explícito y convencional.

## Errores comunes

### 1. Dejar todos los atributos públicos

Eso rompe el control sobre el estado del objeto.

### 2. Generar setters para todo sin pensar

No todo debe poder cambiarse libremente.

### 3. Creer que encapsular es solo ocultar

No se trata solo de esconder, sino de controlar.

### 4. Duplicar reglas por fuera del objeto

Si una validación pertenece al objeto, lo más coherente es que viva dentro de la clase.

### 5. No usar métodos de dominio cuando harían el código más claro

A veces es mejor exponer métodos como `deposit()` o `changeEmail()` que setters genéricos.

## Mini ejercicio

Creá una clase `User` con estos atributos:

- username
- email
- active

Después:

1. hacer los atributos `private`
2. crear getters
3. crear setters con validación básica para username y email
4. agregar un constructor
5. crear un método `showInfo()`

## Ejemplo posible

```java
public class User {
    private String username;
    private String email;
    private boolean active;

    public User(String username, String email, boolean active) {
        setUsername(username);
        setEmail(email);
        this.active = active;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        if (username != null && !username.isBlank()) {
            this.username = username;
        }
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        if (email != null && email.contains("@")) {
            this.email = email;
        }
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void showInfo() {
        System.out.println("Usuario: " + username);
        System.out.println("Email: " + email);
        System.out.println("Activo: " + active);
    }
}
```

## Resumen

En esta lección viste que:

- el encapsulamiento protege el estado interno de un objeto
- `private` impide el acceso directo desde fuera de la clase
- los getters permiten leer atributos
- los setters permiten modificarlos de forma controlada
- encapsular no es solo ocultar, sino validar y diseñar mejor
- no siempre conviene exponer setters para todo
- a veces es mejor ofrecer métodos de dominio más expresivos

## Siguiente tema

En la próxima lección conviene pasar a **herencia**, porque una vez que ya sabés modelar y proteger objetos, el siguiente paso natural es aprender cómo reutilizar y extender estructuras entre clases relacionadas.
