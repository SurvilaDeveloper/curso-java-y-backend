---
title: "Herencia"
description: "Cómo reutilizar y extender comportamiento entre clases relacionadas usando herencia en Java."
order: 14
module: "Programación orientada a objetos"
level: "base"
draft: false
---

## Introducción

En las lecciones anteriores viste cómo modelar entidades con clases, crear objetos, inicializarlos con constructores y proteger su estado con encapsulamiento.

Ahora aparece una pregunta muy importante:

¿qué pasa cuando dos clases comparten características y comportamiento parecidos?

Por ejemplo:

- un `Dog` y un `Cat` tienen nombre y edad
- un `Car` y una `Bike` son vehículos
- un `AdminUser` y un `CustomerUser` son usuarios

Copiar y pegar atributos y métodos en varias clases no suele ser una buena idea.

Para resolver eso, Java ofrece la herencia.

## Qué es la herencia

La herencia es un mecanismo que permite que una clase reutilice atributos y métodos de otra clase.

Dicho simple:

- una clase puede heredar de otra
- la clase hija reutiliza parte de la estructura de la clase padre
- además, puede agregar o modificar comportamiento

## La idea general

Imaginá esta clase:

```java
public class Animal {
    private String name;
    private int age;
}
```

Y ahora pensá en `Dog` y `Cat`.

Ambos comparten:

- nombre
- edad

Entonces tiene sentido que esas propiedades vivan en una clase más general, y que las clases más específicas hereden de ella.

## Terminología básica

Cuando una clase hereda de otra, suelen usarse estos nombres:

- clase padre
- clase base
- superclase

y

- clase hija
- clase derivada
- subclase

## Sintaxis básica

En Java, la herencia se declara con `extends`.

Ejemplo:

```java
public class Dog extends Animal {
}
```

Eso significa que `Dog` hereda de `Animal`.

## Primer ejemplo

```java
public class Animal {
    protected String name;
    protected int age;

    public void showInfo() {
        System.out.println("Nombre: " + name);
        System.out.println("Edad: " + age);
    }
}
```

```java
public class Dog extends Animal {
    public void bark() {
        System.out.println("Guau");
    }
}
```

Uso:

```java
public class Main {
    public static void main(String[] args) {
        Dog dog = new Dog();
        dog.name = "Toby";
        dog.age = 4;

        dog.showInfo();
        dog.bark();
    }
}
```

## Qué está pasando acá

La clase `Dog` no declara directamente `name`, `age` ni `showInfo()`.

Sin embargo, puede usarlos porque los hereda de `Animal`.

Eso permite reutilizar código y expresar mejor la relación entre clases.

## Qué se hereda

En general, una subclase puede heredar:

- atributos accesibles
- métodos accesibles

Pero eso depende de los modificadores de acceso.

## `protected`

En el ejemplo anterior apareció `protected`.

```java
protected String name;
protected int age;
```

`protected` permite que esos atributos sean accesibles dentro de la propia clase y también desde sus subclases.

En esta etapa sirve para entender el ejemplo, aunque en diseño real muchas veces se sigue prefiriendo encapsular con `private` y exponer acceso controlado.

## Herencia con encapsulamiento

Una versión más cuidada del ejemplo sería esta:

```java
public class Animal {
    private String name;
    private int age;

    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }

    public void showInfo() {
        System.out.println("Nombre: " + name);
        System.out.println("Edad: " + age);
    }
}
```

```java
public class Dog extends Animal {
    public Dog(String name, int age) {
        super(name, age);
    }

    public void bark() {
        System.out.println("Guau");
    }
}
```

## Qué es `super`

En este constructor:

```java
public Dog(String name, int age) {
    super(name, age);
}
```

`super(...)` llama al constructor de la clase padre.

Eso es muy importante cuando la superclase tiene constructores con parámetros.

## Forma mental útil

Podés pensar esto así:

- `this` se refiere al objeto actual
- `super` se refiere a la parte heredada desde la clase padre

## Por qué hace falta `super`

Si `Animal` necesita `name` y `age` para inicializarse correctamente, entonces `Dog` tiene que delegar esa parte al constructor del padre.

Por eso usa:

```java
super(name, age);
```

## Agregar comportamiento propio en la subclase

La herencia no solo reutiliza.
También permite extender.

Ejemplo:

```java
public class Cat extends Animal {
    public Cat(String name, int age) {
        super(name, age);
    }

    public void meow() {
        System.out.println("Miau");
    }
}
```

Ahora `Cat` hereda lo común de `Animal`, pero además agrega su propio comportamiento.

## Ejemplo completo

```java
public class Animal {
    private String name;
    private int age;

    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }

    public void showInfo() {
        System.out.println("Nombre: " + name);
        System.out.println("Edad: " + age);
    }
}
```

```java
public class Dog extends Animal {
    public Dog(String name, int age) {
        super(name, age);
    }

    public void bark() {
        System.out.println(getName() + " dice: Guau");
    }
}
```

```java
public class Cat extends Animal {
    public Cat(String name, int age) {
        super(name, age);
    }

    public void meow() {
        System.out.println(getName() + " dice: Miau");
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Dog dog = new Dog("Toby", 4);
        Cat cat = new Cat("Mishi", 2);

        dog.showInfo();
        dog.bark();

        System.out.println("---");

        cat.showInfo();
        cat.meow();
    }
}
```

## Qué problema resuelve la herencia

Sin herencia, tendrías que repetir en `Dog` y `Cat` cosas como:

- `name`
- `age`
- constructor para esos atributos
- métodos comunes como `showInfo()`

Con herencia, lo común vive en `Animal`.

## Cuándo tiene sentido usar herencia

La herencia tiene sentido cuando existe una relación real de tipo:

**“es un”**

Por ejemplo:

- un `Dog` es un `Animal`
- un `Car` es un `Vehicle`
- un `AdminUser` es un `User`

Si esa relación no es clara, probablemente la herencia no sea la mejor opción.

## Cuándo no conviene usar herencia

No conviene usarla solo para “ahorrar líneas” si la relación conceptual no tiene sentido.

Por ejemplo, si dos clases comparten un detalle técnico menor pero no representan una relación real de tipo “es un”, puede ser mejor otra estrategia, como composición.

Más adelante vas a ver que no todo se resuelve con herencia.

## Sobrescritura de métodos

Una subclase también puede redefinir un método heredado para adaptarlo.

Eso se llama sobrescritura u overriding.

Ejemplo:

```java
public class Animal {
    public void makeSound() {
        System.out.println("Sonido genérico");
    }
}
```

```java
public class Dog extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Guau");
    }
}
```

```java
public class Cat extends Animal {
    @Override
    public void makeSound() {
        System.out.println("Miau");
    }
}
```

## Qué significa sobrescribir

La subclase conserva la idea general del método, pero le da una implementación específica.

Eso es muy poderoso y más adelante va a conectar directamente con polimorfismo.

## `@Override`

La anotación `@Override` no es obligatoria en todos los casos para que el código compile, pero conviene usarla.

Ayuda a:

- dejar claro que estás sobrescribiendo un método heredado
- detectar errores si el método no coincide realmente con el del padre

## Ejemplo con sobrescritura

```java
public class Animal {
    private String name;

    public Animal(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void makeSound() {
        System.out.println("Sonido genérico");
    }
}
```

```java
public class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }

    @Override
    public void makeSound() {
        System.out.println(getName() + " dice: Guau");
    }
}
```

```java
public class Cat extends Animal {
    public Cat(String name) {
        super(name);
    }

    @Override
    public void makeSound() {
        System.out.println(getName() + " dice: Miau");
    }
}
```

## Herencia simple en Java

Java no permite herencia múltiple de clases.

Eso significa que una clase puede extender solo una clase padre.

Esto sí es válido:

```java
public class Dog extends Animal {
}
```

Pero una clase no puede extender dos clases a la vez.

Más adelante vas a ver que Java resuelve parte de esa necesidad con interfaces.

## Ejemplo más cercano a negocio

```java
public class User {
    private String username;
    private String email;

    public User(String username, String email) {
        this.username = username;
        this.email = email;
    }

    public void showInfo() {
        System.out.println("Usuario: " + username);
        System.out.println("Email: " + email);
    }
}
```

```java
public class AdminUser extends User {
    public AdminUser(String username, String email) {
        super(username, email);
    }

    public void manageUsers() {
        System.out.println("Gestionando usuarios");
    }
}
```

```java
public class CustomerUser extends User {
    public CustomerUser(String username, String email) {
        super(username, email);
    }

    public void buyProduct() {
        System.out.println("Comprando producto");
    }
}
```

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte al uso moderno de clases con `extends`, aunque en Java la herencia y el sistema de tipos están mucho más integrados al diseño general del lenguaje.

### Si venís de Python

La idea general se parece bastante: una clase hija reutiliza y amplía una clase padre. Lo que cambia es la sintaxis y la explicitud del modelo en Java.

## Errores comunes

### 1. Usar herencia cuando no hay una relación real

No todo lo parecido debería heredarse.

### 2. Confundir reutilización con buen diseño

Reutilizar código no alcanza si la relación conceptual está mal planteada.

### 3. Olvidar llamar a `super(...)` cuando hace falta

Si el padre necesita datos para construirse, la subclase debe delegar esa inicialización.

### 4. Exponer demasiado con `protected`

Puede ser útil, pero si se usa sin criterio puede debilitar el encapsulamiento.

### 5. No distinguir entre heredar y sobrescribir

Una cosa es reutilizar tal cual.
Otra es redefinir comportamiento.

## Mini ejercicio

Creá una clase `Vehicle` con estos datos y comportamientos:

- brand
- model
- método `showInfo()`

Después creá dos subclases:

- `Car`
- `Bike`

Y agregá en cada una un método propio, por ejemplo:

- `drive()` en `Car`
- `pedal()` en `Bike`

## Ejemplo posible

```java
public class Vehicle {
    private String brand;
    private String model;

    public Vehicle(String brand, String model) {
        this.brand = brand;
        this.model = model;
    }

    public String getBrand() {
        return brand;
    }

    public String getModel() {
        return model;
    }

    public void showInfo() {
        System.out.println("Marca: " + brand);
        System.out.println("Modelo: " + model);
    }
}
```

```java
public class Car extends Vehicle {
    public Car(String brand, String model) {
        super(brand, model);
    }

    public void drive() {
        System.out.println("El auto está en marcha");
    }
}
```

```java
public class Bike extends Vehicle {
    public Bike(String brand, String model) {
        super(brand, model);
    }

    public void pedal() {
        System.out.println("La bicicleta está avanzando");
    }
}
```

## Resumen

En esta lección viste que:

- la herencia permite reutilizar y extender clases
- se declara con `extends`
- una subclase hereda atributos y métodos accesibles de la superclase
- `super(...)` permite llamar al constructor del padre
- una subclase puede agregar comportamiento propio
- también puede sobrescribir métodos heredados
- la herencia tiene sentido cuando existe una relación clara de tipo “es un”

## Siguiente tema

En la próxima lección conviene pasar a **polimorfismo**, porque la sobrescritura y las jerarquías de herencia preparan directamente el terreno para entender cómo una misma referencia puede comportarse de distintas maneras según el objeto real.
