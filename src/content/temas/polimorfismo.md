---
title: "Polimorfismo"
description: "Cómo una misma referencia puede representar distintos objetos y comportarse de manera diferente en Java."
order: 15
module: "Programación orientada a objetos"
level: "base"
draft: false
---

## Introducción

En la lección anterior viste la herencia: una clase hija puede reutilizar y extender una clase padre.

También viste que una subclase puede sobrescribir métodos heredados.

Ahora aparece una idea todavía más poderosa: el polimorfismo.

El polimorfismo permite que una misma referencia general pueda apuntar a distintos tipos concretos de objetos, y que cada objeto responda a su manera.

Es una de las ideas más importantes de la programación orientada a objetos, porque ayuda a escribir código más flexible, más extensible y menos acoplado.

## Qué significa “polimorfismo”

La palabra polimorfismo viene de la idea de “muchas formas”.

En programación orientada a objetos, significa que una misma interfaz común o una misma referencia de tipo padre puede representar objetos distintos.

Por ejemplo:

- una referencia de tipo `Animal` puede apuntar a un `Dog`
- también puede apuntar a un `Cat`
- y al invocar un mismo método, cada objeto puede responder distinto

## La idea general

Supongamos estas clases:

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

Ahora mirá esto:

```java
Animal a1 = new Dog();
Animal a2 = new Cat();
```

Ambas variables son de tipo `Animal`, pero el objeto real que tienen adentro no es el mismo.

## Qué pasa al llamar el método

```java
a1.makeSound();
a2.makeSound();
```

Resultado:

```text
Guau
Miau
```

Aunque la referencia sea de tipo `Animal`, Java ejecuta el método sobrescrito según el tipo real del objeto.

Eso es polimorfismo en acción.

## Idea mental clave

Hay dos cosas distintas:

- el tipo de la referencia
- el tipo real del objeto

Ejemplo:

```java
Animal animal = new Dog();
```

### Tipo de la referencia

`Animal`

### Tipo real del objeto

`Dog`

Eso permite escribir código más general sin perder comportamiento específico.

## Por qué esto es útil

Sin polimorfismo, muchas veces terminarías escribiendo lógica separada para cada subtipo.

Con polimorfismo, podés tratar varios objetos relacionados de forma uniforme y dejar que cada uno responda según su implementación.

## Ejemplo simple

```java
public class Main {
    public static void main(String[] args) {
        Animal[] animals = {
            new Dog(),
            new Cat()
        };

        for (Animal animal : animals) {
            animal.makeSound();
        }
    }
}
```

Resultado:

```text
Guau
Miau
```

Acá el mismo mensaje:

```java
animal.makeSound();
```

se comporta distinto según el objeto real.

## Qué hace posible el polimorfismo

El polimorfismo se apoya sobre todo en:

- herencia
- sobrescritura de métodos
- referencias del tipo padre
- despacho dinámico de métodos en tiempo de ejecución

En esta etapa no hace falta memorizar todos esos nombres técnicos, pero sí entender la idea práctica.

## Despacho dinámico

Cuando hacés esto:

```java
Animal animal = new Dog();
animal.makeSound();
```

Java no decide qué método ejecutar solo por el tipo de la variable.

Lo decide por el objeto real en tiempo de ejecución.

Eso es lo que hace que termine ejecutándose el `makeSound()` de `Dog`.

## Ejemplo más completo

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

```java
public class Main {
    public static void main(String[] args) {
        Animal animal1 = new Dog();
        Animal animal2 = new Cat();
        Animal animal3 = new Animal();

        animal1.makeSound();
        animal2.makeSound();
        animal3.makeSound();
    }
}
```

Resultado:

```text
Guau
Miau
Sonido genérico
```

## Polimorfismo y colecciones

Una de las razones por las que el polimorfismo es tan útil es que permite trabajar con grupos heterogéneos de objetos relacionados.

Ejemplo:

```java
Animal[] animals = {
    new Dog(),
    new Cat(),
    new Dog()
};
```

Todos esos objetos pueden guardarse en un array de `Animal` porque todos “son un” `Animal`.

Y después podés recorrerlos uniformemente:

```java
for (Animal animal : animals) {
    animal.makeSound();
}
```

## Otro ejemplo más cercano a negocio

```java
public class User {
    public void showRole() {
        System.out.println("Usuario genérico");
    }
}
```

```java
public class AdminUser extends User {
    @Override
    public void showRole() {
        System.out.println("Administrador");
    }
}
```

```java
public class CustomerUser extends User {
    @Override
    public void showRole() {
        System.out.println("Cliente");
    }
}
```

Uso:

```java
public class Main {
    public static void main(String[] args) {
        User[] users = {
            new AdminUser(),
            new CustomerUser(),
            new AdminUser()
        };

        for (User user : users) {
            user.showRole();
        }
    }
}
```

Resultado:

```text
Administrador
Cliente
Administrador
```

## Ventaja real del polimorfismo

Te permite escribir código más general.

En vez de depender de clases concretas en todos lados, podés depender de un tipo común.

Eso hace que el diseño sea más flexible.

Por ejemplo, si mañana agregás una nueva subclase como `GuestUser`, muchas veces el código general puede seguir funcionando sin grandes cambios, siempre que esa nueva clase respete la estructura esperada.

## Qué se puede hacer desde la referencia padre

Esto es importante.

Si tenés:

```java
Animal animal = new Dog();
```

podés usar los métodos declarados en `Animal`.

Por ejemplo:

```java
animal.makeSound();
```

Pero no podés llamar directamente métodos exclusivos de `Dog` si la referencia es `Animal`.

Por ejemplo, esto no compila:

```java
animal.bark();
```

aunque el objeto real sea un `Dog`.

¿Por qué?
Porque el tipo de la referencia es `Animal`, y `Animal` no declara `bark()`.

## Ejemplo de esto

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

    public void bark() {
        System.out.println("Ladrando...");
    }
}
```

```java
Animal animal = new Dog();
animal.makeSound(); // sí
```

Pero esto no:

```java
animal.bark(); // no compila
```

## Casting

Si realmente necesitás tratar la referencia como el subtipo concreto, existe el casting.

Ejemplo:

```java
Animal animal = new Dog();
Dog dog = (Dog) animal;
dog.bark();
```

Eso funciona si el objeto real efectivamente es un `Dog`.

## Cuidado con el casting incorrecto

Esto es peligroso:

```java
Animal animal = new Cat();
Dog dog = (Dog) animal;
```

Eso compila, pero falla en tiempo de ejecución porque el objeto real no es un `Dog`.

Por eso el casting debe usarse con criterio.

## `instanceof`

Para comprobar si una referencia corresponde a cierto tipo antes de hacer cast, podés usar `instanceof`.

```java
Animal animal = new Dog();

if (animal instanceof Dog) {
    Dog dog = (Dog) animal;
    dog.bark();
}
```

## Igual de importante: no abusar del casting

Si tu diseño te obliga a hacer casting todo el tiempo, muchas veces es una señal de que no estás aprovechando bien el polimorfismo.

La idea fuerte no es “convertir todo”, sino escribir código que opere bien desde el tipo general.

## Polimorfismo no es lo mismo que sobrecarga

Esto conviene aclararlo.

### Sobrecarga

Es cuando varios métodos tienen el mismo nombre pero distinta lista de parámetros.

### Polimorfismo

En este contexto, es cuando distintas clases responden de forma diferente al mismo mensaje heredado y sobrescrito.

Son ideas distintas.

## Ejemplo completo

```java
public class Shape {
    public void draw() {
        System.out.println("Dibujando forma genérica");
    }
}
```

```java
public class Circle extends Shape {
    @Override
    public void draw() {
        System.out.println("Dibujando círculo");
    }
}
```

```java
public class Rectangle extends Shape {
    @Override
    public void draw() {
        System.out.println("Dibujando rectángulo");
    }
}
```

```java
public class Triangle extends Shape {
    @Override
    public void draw() {
        System.out.println("Dibujando triángulo");
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Shape[] shapes = {
            new Circle(),
            new Rectangle(),
            new Triangle()
        };

        for (Shape shape : shapes) {
            shape.draw();
        }
    }
}
```

Resultado:

```text
Dibujando círculo
Dibujando rectángulo
Dibujando triángulo
```

## Por qué este ejemplo importa

Porque el código que recorre las figuras no necesita saber exactamente cuál es cada una para invocar `draw()`.

Solo necesita confiar en que todas son `Shape` y que cada una implementa correctamente ese comportamiento.

Eso reduce acoplamiento y mejora extensibilidad.

## Comparación con otros lenguajes

### Si venís de JavaScript

La idea puede recordarte a objetos distintos respondiendo al mismo método, pero en Java todo esto queda mucho más formalizado por el sistema de tipos y por la herencia.

### Si venís de Python

Puede resultarte bastante familiar la idea de que distintos objetos respondan distinto a un mismo mensaje. En Java, esa flexibilidad convive con un sistema de tipos estático mucho más explícito.

## Errores comunes

### 1. Pensar que polimorfismo es solo “usar herencia”

La herencia ayuda, pero el punto fuerte está en poder tratar objetos distintos mediante un tipo común.

### 2. Confundir el tipo de la referencia con el tipo real del objeto

Son dos cosas distintas y entender esa diferencia es clave.

### 3. Abusar del casting

El polimorfismo debería reducir la necesidad de castings, no aumentarla.

### 4. Creer que desde la referencia padre se puede acceder a cualquier método del hijo

Solo se puede acceder a lo que el tipo de la referencia declara.

### 5. No sobrescribir correctamente los métodos

Si no sobrescribís bien, el comportamiento polimórfico no aparece como esperás.

## Mini ejercicio

Creá una clase `Employee` con un método:

- `work()`

Después creá dos subclases:

- `Developer`
- `Designer`

Cada una debería sobrescribir `work()` con un mensaje distinto.

Luego:

1. crear un array de `Employee`
2. guardar distintos empleados concretos
3. recorrer el array
4. llamar a `work()` en cada elemento

## Ejemplo posible

```java
public class Employee {
    public void work() {
        System.out.println("Trabajando...");
    }
}
```

```java
public class Developer extends Employee {
    @Override
    public void work() {
        System.out.println("Escribiendo código");
    }
}
```

```java
public class Designer extends Employee {
    @Override
    public void work() {
        System.out.println("Diseñando interfaces");
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Employee[] employees = {
            new Developer(),
            new Designer(),
            new Developer()
        };

        for (Employee employee : employees) {
            employee.work();
        }
    }
}
```

## Resumen

En esta lección viste que:

- el polimorfismo permite tratar objetos distintos mediante un tipo común
- una referencia del tipo padre puede apuntar a distintos subtipos
- al invocar un método sobrescrito, Java ejecuta la versión del objeto real
- el tipo de la referencia y el tipo real del objeto no son lo mismo
- el polimorfismo ayuda a escribir código más flexible y extensible
- el casting existe, pero conviene usarlo con cuidado

## Siguiente tema

En la próxima lección conviene pasar a **abstracción**, porque después de entender cómo se relacionan y se comportan las clases en una jerarquía, el siguiente paso natural es aprender a modelar mejor qué se quiere expresar y qué se quiere dejar a cargo de las subclases.
