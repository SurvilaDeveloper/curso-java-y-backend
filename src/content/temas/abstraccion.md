---
title: "Abstracción"
description: "Cómo modelar lo esencial de un concepto en Java y dejar que las clases concretas definan los detalles."
order: 16
module: "Programación orientada a objetos"
level: "base"
draft: false
---

## Introducción

En las lecciones anteriores viste cómo modelar clases, crear objetos, encapsular su estado, reutilizar comportamiento con herencia y aprovechar el polimorfismo.

Ahora aparece una idea que atraviesa toda la programación orientada a objetos: la abstracción.

La abstracción consiste en enfocarse en lo esencial de una entidad o comportamiento, y dejar en segundo plano los detalles específicos que no hace falta mostrar en ese nivel.

Dicho simple:

- una abstracción muestra qué importa
- oculta o posterga cómo se resuelve el detalle concreto

## La idea general

Imaginá que querés representar distintas formas geométricas.

Todas pueden compartir cierta idea general:

- tienen un nombre
- pueden dibujarse
- pueden calcular un área

Pero no todas calculan el área de la misma manera.

En vez de definir desde el inicio todos los detalles concretos, podés modelar una idea más general: una figura.

Después, cada figura concreta resuelve sus particularidades.

Eso es abstracción.

## Abstracción en programación orientada a objetos

En POO, la abstracción ayuda a responder preguntas como estas:

- ¿qué comportamiento común comparten varios objetos?
- ¿qué es esencial en este nivel del diseño?
- ¿qué cosas deberían quedar definidas más adelante por clases concretas?

La abstracción te ayuda a construir modelos más limpios y más expresivos.

## Qué no es la abstracción

No es simplemente “esconder cosas”.

Eso se parece más al encapsulamiento.

La abstracción tiene más que ver con representar un concepto general y dejar fuera detalles que no corresponden a ese nivel.

## Una comparación útil

### Encapsulamiento

Protege el estado interno y controla el acceso.

### Abstracción

Modela la idea esencial de una entidad o comportamiento.

Ambas cosas se relacionan, pero no son lo mismo.

## Ejemplo intuitivo

Pensá en un `Payment`.

En un sistema real puede haber:

- pago con tarjeta
- pago con transferencia
- pago con billetera virtual

Todos comparten una idea general:

- son pagos
- tienen un monto
- pueden procesarse

Pero la forma exacta de procesarlos cambia según el tipo.

Entonces tiene sentido modelar algo general como `Payment` y después dejar que cada subtipo resuelva su implementación concreta.

## Clases abstractas

Una forma muy importante de expresar abstracción en Java es con clases abstractas.

Una clase abstracta:

- representa una idea general
- no está pensada para instanciarse directamente
- puede contener comportamiento común
- puede declarar métodos que las subclases deben implementar

## Sintaxis básica

```java
public abstract class Shape {
}
```

La palabra clave es `abstract`.

## Qué significa que una clase sea abstracta

Si una clase es abstracta, no podés hacer esto:

```java
Shape shape = new Shape();
```

Eso no compila.

¿Por qué?
Porque `Shape` representa una idea general, no una instancia concreta lista para usarse.

## Primer ejemplo

```java
public abstract class Shape {
    public abstract double getArea();
}
```

Acá `Shape` declara que toda figura debería poder calcular su área.

Pero no define cómo, porque eso depende de cada figura concreta.

## Método abstracto

Este método:

```java
public abstract double getArea();
```

es un método abstracto.

Eso significa:

- no tiene implementación en esta clase
- obliga a que las subclases concretas lo implementen

## Qué expresa esto

La clase abstracta está diciendo:

“cualquier figura concreta de este modelo debe saber calcular su área, aunque yo no pueda definir una fórmula única para todas”.

Eso es abstracción muy clara.

## Subclases concretas

```java
public class Circle extends Shape {
    private double radius;

    public Circle(double radius) {
        this.radius = radius;
    }

    @Override
    public double getArea() {
        return Math.PI * radius * radius;
    }
}
```

```java
public class Rectangle extends Shape {
    private double width;
    private double height;

    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public double getArea() {
        return width * height;
    }
}
```

Ahora cada subclase concreta implementa el detalle específico que `Shape` dejó abstracto.

## Ejemplo completo

```java
public abstract class Shape {
    public abstract double getArea();
}
```

```java
public class Circle extends Shape {
    private double radius;

    public Circle(double radius) {
        this.radius = radius;
    }

    @Override
    public double getArea() {
        return Math.PI * radius * radius;
    }
}
```

```java
public class Rectangle extends Shape {
    private double width;
    private double height;

    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    @Override
    public double getArea() {
        return width * height;
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Shape shape1 = new Circle(3);
        Shape shape2 = new Rectangle(4, 5);

        System.out.println(shape1.getArea());
        System.out.println(shape2.getArea());
    }
}
```

## Qué se gana con este diseño

Se gana claridad conceptual.

El código expresa algo muy fuerte:

- existe una idea general de figura
- toda figura concreta debe poder calcular su área
- pero no todas lo hacen igual

Eso es mucho mejor que intentar meter toda la lógica en una única clase desordenada.

## Las clases abstractas también pueden tener lógica concreta

Una clase abstracta no está obligada a ser “solo abstracta”.

Puede tener:

- atributos
- constructores
- métodos concretos
- métodos abstractos

Ejemplo:

```java
public abstract class Animal {
    private String name;

    public Animal(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void showName() {
        System.out.println("Nombre: " + name);
    }

    public abstract void makeSound();
}
```

## Qué aporta este ejemplo

`Animal` tiene una parte común concreta:

- el nombre
- el constructor
- un método para mostrar el nombre

Pero deja abstracta una parte que cambia según el subtipo:

```java
makeSound()
```

Eso es un uso muy típico de abstracción.

## Subclases

```java
public class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }

    @Override
    public void makeSound() {
        System.out.println("Guau");
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
        System.out.println("Miau");
    }
}
```

Uso:

```java
public class Main {
    public static void main(String[] args) {
        Animal dog = new Dog("Toby");
        Animal cat = new Cat("Mishi");

        dog.showName();
        dog.makeSound();

        cat.showName();
        cat.makeSound();
    }
}
```

## Cuándo tiene sentido una clase abstracta

Una clase abstracta tiene sentido cuando:

- existe una idea general útil
- hay comportamiento o estado común para compartir
- pero no querés permitir instancias genéricas de esa idea
- o hay partes que necesariamente dependen de cada subclase

## Diferencia entre clase concreta y clase abstracta

### Clase concreta

Se puede instanciar directamente.

```java
Product product = new Product(...);
```

### Clase abstracta

No se puede instanciar directamente.

```java
Shape shape = new Shape(); // no válido
```

Solo sirve como base para clases concretas derivadas.

## Diferencia entre método concreto y método abstracto

### Método concreto

Tiene implementación.

```java
public void showName() {
    System.out.println(name);
}
```

### Método abstracto

Solo declara la firma.

```java
public abstract void makeSound();
```

La implementación queda a cargo de la subclase.

## Abstracción y diseño

La abstracción ayuda a no pensar el sistema solo como una suma de casos concretos.

Te obliga a identificar:

- qué tienen en común ciertas entidades
- qué comportamiento debería existir sí o sí
- qué detalles deberían delegarse a implementaciones específicas

Eso mejora mucho la calidad del modelo.

## Otro ejemplo más cercano a negocio

```java
public abstract class Payment {
    protected double amount;

    public Payment(double amount) {
        this.amount = amount;
    }

    public double getAmount() {
        return amount;
    }

    public abstract void process();
}
```

```java
public class CardPayment extends Payment {
    public CardPayment(double amount) {
        super(amount);
    }

    @Override
    public void process() {
        System.out.println("Procesando pago con tarjeta por " + amount);
    }
}
```

```java
public class TransferPayment extends Payment {
    public TransferPayment(double amount) {
        super(amount);
    }

    @Override
    public void process() {
        System.out.println("Procesando transferencia por " + amount);
    }
}
```

Uso:

```java
public class Main {
    public static void main(String[] args) {
        Payment payment1 = new CardPayment(1500);
        Payment payment2 = new TransferPayment(2300);

        payment1.process();
        payment2.process();
    }
}
```

## Qué muestra este ejemplo

Muestra muy bien la abstracción:

- todos son pagos
- todos tienen un monto
- todos pueden procesarse
- pero cada tipo concreto procesa de una forma distinta

## Abstracción y polimorfismo

Estas ideas trabajan muy bien juntas.

La abstracción define una estructura general.
El polimorfismo permite usar esa estructura general con múltiples implementaciones concretas.

Por eso muchas veces aparecen juntas en el diseño orientado a objetos.

## Abstracción e interfaces

Más adelante vas a ver interfaces, que también son una herramienta muy importante para expresar abstracción.

Por ahora alcanza con entender que:

- una clase abstracta puede combinar estado, lógica común y comportamiento abstracto
- una interfaz se enfoca más en definir contratos

Eso lo vas a ver con detalle en la siguiente parte del curso.

## Comparación con otros lenguajes

### Si venís de JavaScript

La idea puede sentirse menos necesaria al principio porque JavaScript suele ser más flexible, pero en Java la abstracción ayuda muchísimo a modelar sistemas grandes con más claridad.

### Si venís de Python

Puede recordarte al uso de clases base abstractas, aunque en Java el mecanismo queda más explícito y central en muchos diseños orientados a objetos.

## Errores comunes

### 1. Creer que una clase abstracta es solo una clase “incompleta”

No se trata de que esté incompleta por accidente, sino de que modela intencionalmente una idea general.

### 2. Querer instanciar una clase abstracta

No está pensada para eso.

### 3. Confundir abstracción con encapsulamiento

Se relacionan, pero cumplen funciones distintas.

### 4. No identificar bien qué debe ser abstracto y qué debe ser concreto

Si algo cambia necesariamente según la subclase, probablemente sea candidato a abstracción.

### 5. Diseñar abstracciones demasiado forzadas

La abstracción ayuda cuando expresa una idea real del dominio, no cuando se usa por moda o exceso de generalización.

## Mini ejercicio

Creá una clase abstracta `Employee` con:

- atributo `name`
- constructor para inicializarlo
- método concreto `showName()`
- método abstracto `work()`

Después creá dos subclases:

- `Developer`
- `Designer`

Cada una debe implementar `work()` de forma distinta.

## Ejemplo posible

```java
public abstract class Employee {
    private String name;

    public Employee(String name) {
        this.name = name;
    }

    public void showName() {
        System.out.println("Nombre: " + name);
    }

    public abstract void work();
}
```

```java
public class Developer extends Employee {
    public Developer(String name) {
        super(name);
    }

    @Override
    public void work() {
        System.out.println("Escribiendo código");
    }
}
```

```java
public class Designer extends Employee {
    public Designer(String name) {
        super(name);
    }

    @Override
    public void work() {
        System.out.println("Diseñando interfaces");
    }
}
```

## Resumen

En esta lección viste que:

- la abstracción consiste en modelar lo esencial y dejar de lado detalles concretos
- Java permite expresarla con clases abstractas y métodos abstractos
- una clase abstracta no se puede instanciar directamente
- puede contener tanto lógica concreta como comportamiento abstracto
- las subclases concretas implementan los detalles faltantes
- la abstracción mejora claridad, expresividad y diseño

## Siguiente tema

En la próxima lección conviene pasar a **interfaces**, porque son otra herramienta fundamental para expresar abstracción y contratos en Java, y complementan muy bien lo que ya viste con clases abstractas.
