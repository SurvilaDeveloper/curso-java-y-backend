---
title: "Interfaces"
description: "Cómo definir contratos en Java y desacoplar comportamiento usando interfaces."
order: 17
module: "Programación orientada a objetos"
level: "base"
draft: false
---

## Introducción

En la lección anterior viste la abstracción con clases abstractas.

Eso te permitió modelar una idea general, compartir algo de estado o comportamiento común y dejar ciertos detalles a cargo de las subclases.

Ahora aparece otra herramienta fundamental de Java: las interfaces.

Las interfaces sirven para definir contratos.

Dicho simple:

- expresan qué debe poder hacer una clase
- sin obligar a heredar una implementación concreta como en una clase abstracta

Son una pieza central del diseño en Java porque ayudan a desacoplar, a modelar capacidades y a escribir código más flexible.

## La idea general

Imaginá distintas clases:

- `Dog`
- `Robot`
- `Person`

No todas pertenecen a la misma jerarquía natural, pero varias podrían compartir una capacidad:

- moverse
- emitir sonido
- guardar información
- conectarse a una red

En vez de decir que “todas son un mismo tipo padre concreto”, muchas veces conviene expresar que “todas pueden hacer cierta cosa”.

Ahí entran las interfaces.

## Qué es una interfaz

Una interfaz es una construcción de Java que define un contrato.

Ese contrato especifica métodos que una clase debe implementar si decide adherir a esa interfaz.

Ejemplo:

```java
public interface Movable {
    void move();
}
```

Esto está diciendo:

“cualquier clase que implemente `Movable` debe tener un método `move()`”.

## Qué expresa una interfaz

Una interfaz no está modelando tanto “qué es” una clase, sino “qué puede hacer”.

Esa diferencia conceptual es muy importante.

Por ejemplo:

- `Dog` puede implementar `Movable`
- `Robot` también puede implementar `Movable`

No porque sean el mismo tipo de cosa, sino porque comparten una capacidad.

## Sintaxis básica

```java
public interface Printable {
    void print();
}
```

La palabra clave es `interface`.

## Implementar una interfaz

Una clase implementa una interfaz con `implements`.

Ejemplo:

```java
public interface Printable {
    void print();
}
```

```java
public class Invoice implements Printable {
    @Override
    public void print() {
        System.out.println("Imprimiendo factura");
    }
}
```

## Qué está pasando acá

La interfaz `Printable` define el contrato:

```java
void print();
```

La clase `Invoice` promete cumplir ese contrato, por eso debe implementar el método.

## Primer ejemplo completo

```java
public interface AnimalSound {
    void makeSound();
}
```

```java
public class Dog implements AnimalSound {
    @Override
    public void makeSound() {
        System.out.println("Guau");
    }
}
```

```java
public class Cat implements AnimalSound {
    @Override
    public void makeSound() {
        System.out.println("Miau");
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        AnimalSound dog = new Dog();
        AnimalSound cat = new Cat();

        dog.makeSound();
        cat.makeSound();
    }
}
```

Resultado:

```text
Guau
Miau
```

## Qué ventaja tiene esto

Permite trabajar contra el contrato `AnimalSound`, no contra las clases concretas `Dog` y `Cat`.

Eso desacopla más el diseño.

## Interfaz y polimorfismo

Las interfaces también participan del polimorfismo.

Por ejemplo:

```java
AnimalSound sound1 = new Dog();
AnimalSound sound2 = new Cat();
```

Ambas referencias son del tipo interfaz `AnimalSound`, pero cada objeto responde distinto a `makeSound()`.

Entonces, igual que con una clase padre abstracta o concreta, podés aprovechar polimorfismo usando interfaces.

## Diferencia mental entre clase abstracta e interfaz

Una forma útil de pensarlo es así:

### Clase abstracta

Se usa cuando querés modelar una base común con posible estado, lógica compartida y comportamiento a completar.

### Interfaz

Se usa cuando querés definir un contrato o capacidad sin comprometerte con una jerarquía concreta de implementación.

## Ejemplo de capacidad compartida

```java
public interface Flyable {
    void fly();
}
```

```java
public class Bird implements Flyable {
    @Override
    public void fly() {
        System.out.println("El ave está volando");
    }
}
```

```java
public class Airplane implements Flyable {
    @Override
    public void fly() {
        System.out.println("El avión está volando");
    }
}
```

Acá `Bird` y `Airplane` no necesitan compartir una misma clase padre concreta para expresar que ambos pueden volar.

La interfaz modela esa capacidad.

## Una clase puede implementar varias interfaces

Este es un punto muy importante.

Java no permite heredar de varias clases, pero sí permite implementar varias interfaces.

Ejemplo:

```java
public interface Flyable {
    void fly();
}
```

```java
public interface Trackable {
    void trackLocation();
}
```

```java
public class Drone implements Flyable, Trackable {
    @Override
    public void fly() {
        System.out.println("El dron está volando");
    }

    @Override
    public void trackLocation() {
        System.out.println("Ubicación registrada");
    }
}
```

Esto le da mucha flexibilidad al diseño.

## Por qué esto importa

Porque una clase real suele participar de varias capacidades distintas.

Y las interfaces permiten expresar eso sin forzar jerarquías extrañas de herencia.

## Métodos por defecto

En Java moderno, una interfaz también puede tener métodos `default`.

Ejemplo:

```java
public interface Logger {
    void log(String message);

    default void logInfo(String message) {
        log("[INFO] " + message);
    }
}
```

Esto permite agregar cierta lógica compartida dentro de la interfaz.

## Qué significa `default`

Un método `default`:

- ya trae implementación
- no obliga a que cada clase lo reescriba
- pero puede ser sobrescrito si hace falta

Ejemplo:

```java
public class ConsoleLogger implements Logger {
    @Override
    public void log(String message) {
        System.out.println(message);
    }
}
```

Uso:

```java
ConsoleLogger logger = new ConsoleLogger();
logger.logInfo("Sistema iniciado");
```

Resultado:

```text
[INFO] Sistema iniciado
```

## Métodos estáticos en interfaces

Las interfaces también pueden tener métodos estáticos.

Ejemplo:

```java
public interface MathHelper {
    static int doubleValue(int value) {
        return value * 2;
    }
}
```

Uso:

```java
System.out.println(MathHelper.doubleValue(5));
```

## Interfaz como tipo de referencia

Igual que una clase padre, una interfaz puede usarse como tipo de referencia.

Ejemplo:

```java
Flyable flyingThing = new Bird();
flyingThing.fly();
```

Acá la referencia es del tipo interfaz `Flyable`, pero el objeto real es `Bird`.

Eso refuerza todavía más el desacoplamiento.

## Otro ejemplo más cercano a negocio

```java
public interface PaymentProcessor {
    void process(double amount);
}
```

```java
public class CardProcessor implements PaymentProcessor {
    @Override
    public void process(double amount) {
        System.out.println("Procesando tarjeta por " + amount);
    }
}
```

```java
public class TransferProcessor implements PaymentProcessor {
    @Override
    public void process(double amount) {
        System.out.println("Procesando transferencia por " + amount);
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        PaymentProcessor processor1 = new CardProcessor();
        PaymentProcessor processor2 = new TransferProcessor();

        processor1.process(1500);
        processor2.process(2000);
    }
}
```

## Qué gana este diseño

En vez de depender directamente de una implementación concreta, el código puede depender del contrato `PaymentProcessor`.

Eso hace más fácil:

- cambiar implementaciones
- extender el sistema
- testear
- desacoplar responsabilidades

## Interfaces y arquitectura

En proyectos grandes, las interfaces aparecen muchísimo porque ayudan a separar:

- qué se espera de un componente
- cómo está implementado realmente

Eso es muy valioso en servicios, repositorios, adapters, clientes externos y muchas otras capas.

## Interfaz no es lo mismo que clase abstracta

Aunque ambas sirven para abstracción, no son lo mismo.

### Una clase abstracta

- puede tener estado de instancia
- puede tener constructores
- puede combinar lógica concreta y abstracta
- se hereda con `extends`

### Una interfaz

- define principalmente un contrato
- se implementa con `implements`
- una clase puede implementar varias
- no modela una base concreta de estado del mismo modo que una clase abstracta

## Cuándo conviene una interfaz

Suele convenir una interfaz cuando:

- querés expresar capacidades o contratos
- querés desacoplar implementación de uso
- varias clases distintas comparten una misma operación esperada
- no necesitás una jerarquía concreta fuerte con estado común

## Cuándo puede convenir una clase abstracta

Suele convenir una clase abstracta cuando:

- querés compartir estado común
- querés compartir implementación base
- querés definir una estructura general más fuerte entre clases relacionadas

## Ejemplo comparativo simple

### Interfaz

```java
public interface Exportable {
    void export();
}
```

Podrían implementarla:

- `Invoice`
- `Report`
- `UserData`

No necesariamente porque “sean lo mismo”, sino porque todas pueden exportarse.

### Clase abstracta

```java
public abstract class Employee {
    private String name;

    public Employee(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public abstract void work();
}
```

Acá sí hay una idea más fuerte de familia concreta de tipos relacionados.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede parecer más formal que el enfoque basado en objetos flexibles, pero ayuda mucho a modelar contratos claros en proyectos grandes.

### Si venís de Python

Puede recordarte a protocolos o clases base abstractas en su uso conceptual, aunque en Java las interfaces tienen un rol muy central y muy visible en el diseño.

## Errores comunes

### 1. Usar interfaz solo porque “suena más profesional”

Tiene sentido cuando expresa un contrato útil, no por moda.

### 2. Confundir interfaz con clase abstracta

Comparten terreno conceptual, pero sirven para cosas distintas.

### 3. Diseñar interfaces demasiado grandes

Un contrato muy enorme y poco enfocado suele ser mala señal.

### 4. Acoplarse igual a la implementación concreta aunque exista la interfaz

La ventaja aparece cuando realmente programás contra la abstracción.

### 5. No ver que una clase puede implementar varias interfaces

Esa es una de las fortalezas más importantes de esta herramienta.

## Mini ejercicio

Creá una interfaz `Playable` con el método:

- `play()`

Después creá dos clases que la implementen:

- `Song`
- `Podcast`

Cada una debe definir `play()` de una forma distinta.

Luego:

1. crear un array de `Playable`
2. guardar distintos objetos concretos
3. recorrer el array
4. llamar a `play()` en cada uno

## Ejemplo posible

```java
public interface Playable {
    void play();
}
```

```java
public class Song implements Playable {
    @Override
    public void play() {
        System.out.println("Reproduciendo canción");
    }
}
```

```java
public class Podcast implements Playable {
    @Override
    public void play() {
        System.out.println("Reproduciendo podcast");
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Playable[] items = {
            new Song(),
            new Podcast(),
            new Song()
        };

        for (Playable item : items) {
            item.play();
        }
    }
}
```

## Resumen

En esta lección viste que:

- una interfaz define un contrato
- una clase la implementa con `implements`
- las interfaces ayudan a modelar capacidades y desacoplar diseño
- una clase puede implementar varias interfaces
- también permiten polimorfismo
- no son lo mismo que las clases abstractas
- son fundamentales para escribir código flexible y extensible

## Siguiente tema

En la próxima lección conviene pasar a **relaciones entre clases**, porque una vez que ya viste clases, herencia, abstracción e interfaces, el siguiente paso natural es entender mejor cómo se conectan las clases entre sí en el diseño de un sistema.
