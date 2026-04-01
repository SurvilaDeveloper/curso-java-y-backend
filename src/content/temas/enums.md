---
title: "Enums"
description: "Cómo representar conjuntos cerrados de valores en Java de forma clara, segura y expresiva usando enums."
order: 21
module: "Herramientas clave del lenguaje"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora, cuando necesitabas representar ciertos estados o categorías, podrías haber usado cosas como:

- strings
- enteros
- constantes sueltas

Por ejemplo:

```java
String status = "PENDING";
```

o

```java
int role = 1;
```

Eso puede funcionar, pero tiene varios problemas:

- es fácil cometer errores de escritura
- el código pierde claridad
- aparecen valores inválidos con más facilidad
- el diseño se vuelve menos expresivo

Para resolver mejor ese tipo de casos, Java ofrece los enums.

## Qué es un enum

Un enum es un tipo especial que representa un conjunto fijo y cerrado de constantes.

Dicho simple:

- define una lista de valores posibles
- el programa puede trabajar con esos valores de forma segura
- evita depender de strings mágicos o números difíciles de entender

## La idea general

Supongamos que querés representar el estado de una orden.

Podrías hacer esto:

```java
String status = "SHIPPED";
```

Pero también podrías equivocarte y escribir:

```java
String status = "SHIPPPED";
```

Eso compila igual, pero está mal.

Con un enum, el conjunto válido de opciones queda definido explícitamente.

## Sintaxis básica

```java
public enum OrderStatus {
    PENDING,
    PAID,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
```

Esto define un tipo `OrderStatus` con cinco valores posibles.

## Cómo usar un enum

```java
public class Main {
    public static void main(String[] args) {
        OrderStatus status = OrderStatus.PENDING;

        System.out.println(status);
    }
}
```

Resultado:

```text
PENDING
```

## Qué se gana con esto

Se gana seguridad y claridad.

Ahora ya no podés asignar cualquier string arbitrario.

Por ejemplo, esto ya no sería válido:

```java
OrderStatus status = "PENDING";
```

porque `status` no es un `String`, sino un `OrderStatus`.

## Cuándo conviene usar enums

Conviene usar enums cuando tenés un conjunto cerrado y bien definido de valores.

Por ejemplo:

- estados de una orden
- días de la semana
- tipos de usuario
- niveles de acceso
- categorías fijas
- prioridad de una tarea

## Ejemplo simple

```java
public enum UserRole {
    ADMIN,
    CUSTOMER,
    GUEST
}
```

Uso:

```java
UserRole role = UserRole.ADMIN;
```

## Comparación con strings

### Con strings

```java
String role = "ADMIN";
```

Problemas posibles:

- errores tipográficos
- falta de validación fuerte
- menos claridad semántica

### Con enum

```java
UserRole role = UserRole.ADMIN;
```

Ventajas:

- opciones cerradas
- mayor seguridad de tipos
- autocompletado y legibilidad
- menos errores accidentales

## Enums en condiciones

Los enums se usan mucho con condicionales y con `switch`.

Ejemplo con `if`:

```java
OrderStatus status = OrderStatus.SHIPPED;

if (status == OrderStatus.SHIPPED) {
    System.out.println("La orden ya fue enviada");
}
```

## Comparación en enums

Es muy común comparar enums con `==`.

Eso está bien.

Ejemplo:

```java
if (status == OrderStatus.PAID) {
    ...
}
```

En este caso no estás comparando strings o contenidos arbitrarios, sino constantes bien definidas del enum.

## Ejemplo con `switch`

```java
OrderStatus status = OrderStatus.PENDING;

switch (status) {
    case PENDING:
        System.out.println("Orden pendiente");
        break;
    case PAID:
        System.out.println("Orden pagada");
        break;
    case SHIPPED:
        System.out.println("Orden enviada");
        break;
    case DELIVERED:
        System.out.println("Orden entregada");
        break;
    case CANCELLED:
        System.out.println("Orden cancelada");
        break;
}
```

## Qué hace esto más expresivo

Un enum hace que el código se acerque más al dominio real.

Leer esto:

```java
OrderStatus.SHIPPED
```

es mucho más expresivo que leer un entero o un string aislado cuyo significado hay que recordar.

## Métodos útiles de un enum

Los enums en Java no son solo una lista tonta de palabras.
También traen comportamiento útil.

## `values()`

Devuelve todos los valores del enum.

Ejemplo:

```java
for (OrderStatus status : OrderStatus.values()) {
    System.out.println(status);
}
```

Resultado:

```text
PENDING
PAID
SHIPPED
DELIVERED
CANCELLED
```

Esto es muy útil para recorrer todas las opciones posibles.

## `name()`

Devuelve el nombre literal de la constante.

```java
OrderStatus status = OrderStatus.PAID;
System.out.println(status.name());
```

Resultado:

```text
PAID
```

## `ordinal()`

Devuelve la posición de la constante dentro del enum, empezando desde 0.

```java
System.out.println(OrderStatus.PENDING.ordinal());
System.out.println(OrderStatus.SHIPPED.ordinal());
```

Eso podría dar:

```text
0
2
```

## Atención con `ordinal()`

Aunque existe, no conviene usar `ordinal()` como si fuera una identidad de negocio estable.

¿Por qué?
Porque si cambiás el orden de las constantes, cambian esos números.

Como regla general:
usá `ordinal()` solo si realmente entendés bien por qué lo necesitás.

## `valueOf()`

Convierte un string exacto en un valor del enum.

```java
OrderStatus status = OrderStatus.valueOf("PAID");
System.out.println(status);
```

Resultado:

```text
PAID
```

## Cuidado con `valueOf()`

El texto debe coincidir exactamente con el nombre de la constante.

Por ejemplo:

```java
OrderStatus.valueOf("paid");
```

eso falla, porque no coincide con `PAID`.

## Enums dentro de clases

Los enums se usan mucho como tipo de atributos.

Ejemplo:

```java
public enum OrderStatus {
    PENDING,
    PAID,
    SHIPPED
}
```

```java
public class Order {
    private String orderNumber;
    private OrderStatus status;

    public Order(String orderNumber, OrderStatus status) {
        this.orderNumber = orderNumber;
        this.status = status;
    }

    public void showInfo() {
        System.out.println("Orden: " + orderNumber);
        System.out.println("Estado: " + status);
    }
}
```

Uso:

```java
Order order = new Order("ORD-1001", OrderStatus.PENDING);
order.showInfo();
```

## Qué ventaja da esto en diseño

El atributo `status` ya no admite cualquier texto.
Solo puede ser uno de los valores definidos por `OrderStatus`.

Eso vuelve el modelo mucho más robusto.

## Enums con atributos y métodos

Los enums pueden ser más poderosos todavía.

También pueden tener:

- atributos
- constructores
- métodos

Ejemplo:

```java
public enum Priority {
    LOW("Baja"),
    MEDIUM("Media"),
    HIGH("Alta");

    private final String label;

    Priority(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
```

Uso:

```java
Priority priority = Priority.HIGH;
System.out.println(priority.getLabel());
```

Resultado:

```text
Alta
```

## Qué muestra este ejemplo

Muestra que un enum en Java no es solo una lista de constantes.
También puede encapsular información y comportamiento asociado a cada valor.

## Ejemplo completo

```java
public enum TaskStatus {
    TODO("Pendiente"),
    IN_PROGRESS("En progreso"),
    DONE("Completada");

    private final String label;

    TaskStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
```

```java
public class Task {
    private String title;
    private TaskStatus status;

    public Task(String title, TaskStatus status) {
        this.title = title;
        this.status = status;
    }

    public void showInfo() {
        System.out.println("Tarea: " + title);
        System.out.println("Estado: " + status.getLabel());
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        Task task = new Task("Estudiar enums", TaskStatus.IN_PROGRESS);
        task.showInfo();

        System.out.println("---");

        for (TaskStatus status : TaskStatus.values()) {
            System.out.println(status + " -> " + status.getLabel());
        }
    }
}
```

## Enums y métodos de dominio

También podés apoyarte en enums para escribir lógica más clara.

Ejemplo:

```java
public class Order {
    private OrderStatus status;

    public Order(OrderStatus status) {
        this.status = status;
    }

    public boolean canBeCancelled() {
        return status == OrderStatus.PENDING || status == OrderStatus.PAID;
    }
}
```

Eso hace que ciertas reglas del dominio queden más legibles y menos frágiles.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte al uso de objetos congelados o constantes agrupadas, pero en Java el enum es un tipo real del lenguaje, con mucha más integración y seguridad.

### Si venís de Python

Puede parecerse a `Enum`, aunque en Java su presencia en modelos de dominio y en diseño tipado suele ser especialmente fuerte y muy habitual.

## Errores comunes

### 1. Seguir usando strings cuando un enum sería mejor

Eso hace perder claridad y seguridad.

### 2. Pensar que un enum es solo una lista de nombres

También puede tener atributos y comportamiento.

### 3. Abusar de `ordinal()`

No suele ser buena base para lógica de negocio.

### 4. Usar `valueOf()` sin validar bien la entrada

Si el texto no coincide exactamente, falla.

### 5. Crear enums para cosas que no son realmente cerradas

Un enum conviene cuando el conjunto de valores es fijo y bien definido.

## Mini ejercicio

Creá un enum `UserRole` con:

- ADMIN
- EDITOR
- VIEWER

Después:

1. usarlo como atributo de una clase `User`
2. mostrar información del usuario
3. escribir una condición que detecte si el usuario es admin
4. recorrer todos los valores del enum con `values()`

## Ejemplo posible

```java
public enum UserRole {
    ADMIN,
    EDITOR,
    VIEWER
}
```

```java
public class User {
    private String username;
    private UserRole role;

    public User(String username, UserRole role) {
        this.username = username;
        this.role = role;
    }

    public void showInfo() {
        System.out.println("Usuario: " + username);
        System.out.println("Rol: " + role);
    }

    public boolean isAdmin() {
        return role == UserRole.ADMIN;
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        User user = new User("gabriel", UserRole.ADMIN);
        user.showInfo();
        System.out.println("¿Es admin? " + user.isAdmin());

        for (UserRole role : UserRole.values()) {
            System.out.println(role);
        }
    }
}
```

## Resumen

En esta lección viste que:

- un enum representa un conjunto cerrado de valores
- ayuda a modelar estados y categorías de forma más segura que strings o enteros
- se usa mucho en condiciones, `switch` y modelos de dominio
- los enums pueden tener atributos, constructores y métodos
- `values()`, `name()` y `valueOf()` son herramientas útiles
- usar enums mejora claridad, expresividad y seguridad del código

## Siguiente tema

En la próxima lección conviene pasar a **Generics**, porque después de trabajar con colecciones y enums, el siguiente paso natural es entender mejor cómo Java maneja tipos parametrizados para escribir código más reutilizable y seguro.
