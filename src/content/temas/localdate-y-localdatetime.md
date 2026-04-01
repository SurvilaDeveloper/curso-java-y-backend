---
title: "LocalDate y LocalDateTime"
description: "Cómo representar y manipular fechas y fechas con hora en Java usando la API moderna de java.time."
order: 23
module: "Herramientas clave del lenguaje"
level: "intermedio"
draft: false
---

## Introducción

En muchos programas necesitás trabajar con fechas y horas.

Por ejemplo:

- fecha de nacimiento de una persona
- fecha de creación de una orden
- fecha y hora de una reserva
- vencimiento de una factura
- registro de eventos del sistema

Java tiene una API moderna para manejar todo esto de forma mucho más clara y segura que las clases viejas como `Date` y `Calendar`.

Esa API vive en `java.time`.

En esta lección nos vamos a enfocar en dos tipos muy importantes:

- `LocalDate`
- `LocalDateTime`

## La idea general

No siempre necesitás lo mismo cuando hablás de tiempo.

A veces solo importa la fecha:

- 2026-03-23

A veces importa la fecha y también la hora:

- 2026-03-23 18:45

Por eso Java separa estos conceptos en tipos distintos.

## `LocalDate`

`LocalDate` representa una fecha sin hora.

Incluye:

- año
- mes
- día

Pero no incluye:

- hora
- minutos
- segundos
- zona horaria

Ejemplo:

```java
LocalDate date = LocalDate.of(2026, 3, 23);
```

## `LocalDateTime`

`LocalDateTime` representa una fecha con hora.

Incluye:

- año
- mes
- día
- hora
- minuto
- segundo
- nanosegundo si hace falta

Pero no incluye zona horaria.

Ejemplo:

```java
LocalDateTime dateTime = LocalDateTime.of(2026, 3, 23, 18, 45);
```

## Import importante

Para usar estas clases, normalmente necesitás importar:

```java
import java.time.LocalDate;
import java.time.LocalDateTime;
```

## Crear una fecha con `LocalDate`

La forma más explícita es con `of(...)`.

```java
LocalDate birthday = LocalDate.of(1995, 8, 14);
System.out.println(birthday);
```

Resultado:

```text
1995-08-14
```

## Crear la fecha actual

```java
LocalDate today = LocalDate.now();
System.out.println(today);
```

Esto devuelve la fecha actual del sistema.

## Crear fecha y hora actual

```java
LocalDateTime now = LocalDateTime.now();
System.out.println(now);
```

Esto devuelve la fecha y hora actuales del sistema.

## Crear una fecha y hora específica

```java
LocalDateTime meeting = LocalDateTime.of(2026, 4, 10, 15, 30);
System.out.println(meeting);
```

Resultado esperado:

```text
2026-04-10T15:30
```

## Obtener partes de la fecha

Con `LocalDate` podés acceder a sus componentes.

```java
LocalDate date = LocalDate.of(2026, 3, 23);

System.out.println(date.getYear());
System.out.println(date.getMonthValue());
System.out.println(date.getDayOfMonth());
```

## También podés obtener el nombre del mes o el día de la semana

```java
System.out.println(date.getMonth());
System.out.println(date.getDayOfWeek());
```

Esto devuelve enums del lenguaje de tiempo de Java.

## Obtener partes de `LocalDateTime`

```java
LocalDateTime dateTime = LocalDateTime.of(2026, 3, 23, 18, 45, 10);

System.out.println(dateTime.getYear());
System.out.println(dateTime.getMonthValue());
System.out.println(dateTime.getDayOfMonth());
System.out.println(dateTime.getHour());
System.out.println(dateTime.getMinute());
System.out.println(dateTime.getSecond());
```

## Inmutabilidad

`LocalDate` y `LocalDateTime` son inmutables.

Eso significa que no se modifican a sí mismos.

Por ejemplo:

```java
LocalDate date = LocalDate.of(2026, 3, 23);
date.plusDays(5);

System.out.println(date);
```

Esto sigue mostrando la fecha original.

¿Por qué?
Porque `plusDays(5)` devuelve un nuevo objeto, no modifica el anterior.

La forma correcta sería:

```java
LocalDate date = LocalDate.of(2026, 3, 23);
date = date.plusDays(5);

System.out.println(date);
```

## Sumar y restar tiempo

### Con `LocalDate`

```java
LocalDate date = LocalDate.of(2026, 3, 23);

System.out.println(date.plusDays(10));
System.out.println(date.minusDays(7));
System.out.println(date.plusMonths(2));
System.out.println(date.plusYears(1));
```

### Con `LocalDateTime`

```java
LocalDateTime dateTime = LocalDateTime.of(2026, 3, 23, 18, 45);

System.out.println(dateTime.plusHours(2));
System.out.println(dateTime.minusMinutes(30));
System.out.println(dateTime.plusDays(1));
```

## Comparar fechas

Podés comparar fechas con métodos como:

- `isBefore(...)`
- `isAfter(...)`
- `isEqual(...)`

Ejemplo:

```java
LocalDate start = LocalDate.of(2026, 3, 1);
LocalDate end = LocalDate.of(2026, 3, 31);

System.out.println(start.isBefore(end));
System.out.println(end.isAfter(start));
System.out.println(start.isEqual(end));
```

## Comparar fecha y hora

```java
LocalDateTime a = LocalDateTime.of(2026, 3, 23, 10, 0);
LocalDateTime b = LocalDateTime.of(2026, 3, 23, 12, 0);

System.out.println(a.isBefore(b));
System.out.println(b.isAfter(a));
```

## Parsear desde texto

Podés convertir texto a fecha o fecha y hora si el formato coincide.

### `LocalDate`

```java
LocalDate date = LocalDate.parse("2026-03-23");
System.out.println(date);
```

### `LocalDateTime`

```java
LocalDateTime dateTime = LocalDateTime.parse("2026-03-23T18:45:00");
System.out.println(dateTime);
```

## Cuidado con el formato

`parse(...)` espera formatos estándar ISO por defecto.

Por ejemplo:

- `LocalDate` espera algo como `2026-03-23`
- `LocalDateTime` espera algo como `2026-03-23T18:45:00`

Si el texto no coincide, se produce una excepción.

## Formatear fechas

Para mostrar una fecha con otro formato, usás `DateTimeFormatter`.

Import:

```java
import java.time.format.DateTimeFormatter;
```

Ejemplo:

```java
LocalDate date = LocalDate.of(2026, 3, 23);
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

System.out.println(date.format(formatter));
```

Resultado:

```text
23/03/2026
```

## Formatear `LocalDateTime`

```java
LocalDateTime dateTime = LocalDateTime.of(2026, 3, 23, 18, 45);
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

System.out.println(dateTime.format(formatter));
```

Resultado:

```text
23/03/2026 18:45
```

## Parsear con formato personalizado

También podés convertir texto con formato custom.

```java
String text = "23/03/2026";
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

LocalDate date = LocalDate.parse(text, formatter);
System.out.println(date);
```

## Combinar fecha y hora

A veces tenés una fecha por un lado y una hora por otro, y querés construir un `LocalDateTime`.

Podés hacerlo así:

```java
LocalDate date = LocalDate.of(2026, 3, 23);
LocalDateTime dateTime = date.atTime(18, 45);

System.out.println(dateTime);
```

## Obtener la parte de fecha desde `LocalDateTime`

```java
LocalDateTime dateTime = LocalDateTime.of(2026, 3, 23, 18, 45);

LocalDate date = dateTime.toLocalDate();
System.out.println(date);
```

## Casos de uso típicos

### Usá `LocalDate` cuando

- solo importa la fecha
- no necesitás hora
- ejemplos: cumpleaños, vencimiento, fecha de publicación

### Usá `LocalDateTime` cuando

- importa fecha y hora
- ejemplos: turno, reserva, log de evento, creación de registro

## Diferencia con zona horaria

Ni `LocalDate` ni `LocalDateTime` representan zona horaria.

Eso es importante.

Si más adelante necesitás representar tiempo con zona o instantáneas globales, aparecerán otros tipos como:

- `ZonedDateTime`
- `OffsetDateTime`
- `Instant`

Por ahora alcanza con entender que `LocalDate` y `LocalDateTime` son “locales”, o sea, no incluyen zona.

## Ejemplo con dominio real

```java
import java.time.LocalDate;

public class User {
    private String username;
    private LocalDate birthDate;

    public User(String username, LocalDate birthDate) {
        this.username = username;
        this.birthDate = birthDate;
    }

    public void showInfo() {
        System.out.println("Usuario: " + username);
        System.out.println("Fecha de nacimiento: " + birthDate);
    }
}
```

Uso:

```java
User user = new User("gabriel", LocalDate.of(1998, 6, 10));
user.showInfo();
```

## Otro ejemplo con `LocalDateTime`

```java
import java.time.LocalDateTime;

public class Order {
    private String orderNumber;
    private LocalDateTime createdAt;

    public Order(String orderNumber, LocalDateTime createdAt) {
        this.orderNumber = orderNumber;
        this.createdAt = createdAt;
    }

    public void showInfo() {
        System.out.println("Orden: " + orderNumber);
        System.out.println("Creada en: " + createdAt);
    }
}
```

Uso:

```java
Order order = new Order("ORD-1001", LocalDateTime.now());
order.showInfo();
```

## Ejemplo completo

```java
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Main {
    public static void main(String[] args) {
        LocalDate today = LocalDate.now();
        LocalDate birthday = LocalDate.of(1998, 6, 10);

        System.out.println("Hoy: " + today);
        System.out.println("Cumpleaños: " + birthday);
        System.out.println("Año: " + birthday.getYear());
        System.out.println("Dentro de 10 días: " + today.plusDays(10));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime meeting = LocalDateTime.of(2026, 4, 10, 15, 30);

        System.out.println("Ahora: " + now);
        System.out.println("Reunión: " + meeting);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        System.out.println("Reunión formateada: " + meeting.format(formatter));
    }
}
```

## Comparación con clases viejas

Antes de `java.time`, Java usaba mucho:

- `Date`
- `Calendar`

Esas APIs son más incómodas y menos claras.

La API moderna (`java.time`) suele ser la opción recomendada para trabajar con fechas y horas en Java actual.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede sorprenderte que Java tenga tipos separados para fecha sin hora, fecha con hora y otros casos. Esa separación ayuda mucho a modelar mejor cada situación.

### Si venís de Python

Puede recordarte a `date` y `datetime`, con la ventaja de una API moderna y bastante consistente dentro del ecosistema Java.

## Errores comunes

### 1. Usar `LocalDateTime` cuando solo necesitabas una fecha

Eso agrega información innecesaria al modelo.

### 2. Olvidar que estas clases son inmutables

Métodos como `plusDays(...)` devuelven un nuevo objeto.

### 3. Parsear textos con formato incorrecto

Si el formato no coincide, falla.

### 4. Confundir `.length` mentalmente con fecha y hora como si fueran strings

Son tipos específicos del lenguaje, no simples textos.

### 5. Ignorar el tema de zonas horarias cuando el problema realmente las necesita

`LocalDate` y `LocalDateTime` no resuelven eso por sí solos.

## Mini ejercicio

Escribí código para:

1. crear una fecha de nacimiento con `LocalDate`
2. crear la fecha actual con `LocalDate.now()`
3. sumar 7 días a una fecha
4. comparar dos fechas
5. crear una fecha y hora con `LocalDateTime`
6. mostrarla con formato `dd/MM/yyyy HH:mm`

## Ejemplo posible

```java
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Main {
    public static void main(String[] args) {
        LocalDate birthDate = LocalDate.of(1998, 6, 10);
        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusDays(7);

        System.out.println(birthDate);
        System.out.println(today);
        System.out.println(nextWeek);
        System.out.println(birthDate.isBefore(today));

        LocalDateTime meeting = LocalDateTime.of(2026, 4, 10, 15, 30);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        System.out.println(meeting.format(formatter));
    }
}
```

## Resumen

En esta lección viste que:

- `LocalDate` representa una fecha sin hora
- `LocalDateTime` representa una fecha con hora
- ambas clases forman parte de `java.time`
- son inmutables
- permiten crear, comparar, sumar, restar, parsear y formatear fechas
- conviene elegir el tipo según la necesidad real del dominio
- la API moderna de fechas en Java es mucho mejor que las clases viejas como `Date` y `Calendar`

## Siguiente tema

En la próxima lección conviene pasar a **archivos**, porque después de modelar datos, colecciones y fechas de forma sólida, el siguiente paso natural es aprender a leer y escribir información persistente fuera de la memoria del programa.
