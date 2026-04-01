---
title: "Programación funcional en Java: lambdas, streams y Optional"
description: "Cómo escribir código más expresivo y moderno en Java usando lambdas, Stream API y Optional, y cómo aplicarlo en backend real."
order: 47
module: "Profundización en Java moderno"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya recorriste una base muy fuerte de Java y backend con Spring Boot.

Eso incluye:

- lenguaje
- orientación a objetos
- colecciones
- excepciones
- DTOs
- services
- repositories
- JPA
- testing
- seguridad
- despliegue
- documentación de API

En este punto aparece una profundización muy importante para escribir Java moderno con más claridad y más expresividad:

- lambdas
- streams
- `Optional`

Este tema no reemplaza la orientación a objetos.
La complementa.

Y en proyectos reales aparece muchísimo.

## La idea general

Durante bastante tiempo, mucho código Java se escribía con estilos muy verbosos para:

- recorrer listas
- filtrar datos
- transformar colecciones
- buscar elementos
- ordenar
- manejar nulos

Con Java moderno, varias de esas tareas se pueden expresar mejor usando herramientas funcionales.

Esto ayuda a que el código sea, en muchos casos:

- más claro
- más declarativo
- más corto
- más expresivo
- más fácil de combinar

## Qué significa “programación funcional” en este contexto

No significa que Java se convierta en Haskell ni que todo deba escribirse de manera puramente funcional.

Significa que Java incorpora herramientas inspiradas en programación funcional para expresar mejor ciertas operaciones.

Por ejemplo:

- pasar comportamiento como dato
- transformar secuencias
- evitar ciertos `null`
- trabajar más declarativamente

## Dónde aparece esto en backend real

En backend con Java moderno lo vas a ver mucho en cosas como:

- mapping de entidades a DTOs
- filtrado de listas
- agrupaciones
- validaciones
- búsquedas en colecciones
- `Optional` de repositorios JPA
- procesamiento de datos intermedios

Por eso conviene dominarlo bien.

## Lambdas

Empecemos por lambdas.

Una lambda es una forma compacta de representar una función o bloque de comportamiento.

## Antes de lambdas

Supongamos que querés ordenar una lista con una lógica concreta.

En versiones más viejas o estilos más verbosos, podrías necesitar clases anónimas bastante largas.

Las lambdas simplifican muchísimo eso.

## Sintaxis general de lambda

La forma general es algo así:

```java
(parametros) -> expresion
```

o

```java
(parametros) -> {
    // bloque
}
```

## Ejemplo muy simple

```java
x -> x * 2
```

Eso representa una función que recibe `x` y devuelve `x * 2`.

## Ejemplo con dos parámetros

```java
(a, b) -> a + b
```

Eso representa una función que recibe dos parámetros y devuelve su suma.

## Interfaces funcionales

Las lambdas en Java suelen trabajar sobre interfaces funcionales.

Una interfaz funcional es una interfaz que tiene un único método abstracto.

Por ejemplo:

```java
@FunctionalInterface
public interface Calculator {
    int operate(int a, int b);
}
```

## Qué significa esto

Como esa interfaz tiene un solo método abstracto, se puede implementar con una lambda.

Ejemplo:

```java
Calculator sum = (a, b) -> a + b;

System.out.println(sum.operate(2, 3));
```

## Qué hace `@FunctionalInterface`

No es estrictamente obligatorio en todos los casos, pero conviene usarlo cuando querés dejar claro que la interfaz está pensada para ese rol.

Además ayuda a detectar errores si alguien le agrega más métodos abstractos y rompe esa naturaleza funcional.

## Ejemplo completo con lambda

```java
@FunctionalInterface
public interface Greeting {
    void sayHello(String name);
}
```

Uso:

```java
public class Main {
    public static void main(String[] args) {
        Greeting greeting = name -> System.out.println("Hola, " + name);

        greeting.sayHello("Gabriel");
    }
}
```

## Qué ventaja tiene esto

Evita escribir una clase completa o una implementación anónima más larga para una lógica muy simple.

## Lambdas y código más expresivo

Una lambda es especialmente útil cuando querés pasar una acción o criterio.

Por ejemplo:

- cómo ordenar
- cómo filtrar
- cómo transformar
- qué hacer cuando algo ocurre

## Ejemplo con `Comparator`

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("Luis", "Ana", "Carlos"));

        names.sort((a, b) -> a.compareTo(b));

        System.out.println(names);
    }
}
```

## Qué pasa acá

La lambda define el criterio de comparación.

Eso reemplaza mucho código repetitivo y hace que la intención quede más cerca del uso.

## Streams

Ahora pasemos a streams.

La Stream API sirve para procesar secuencias de datos de forma más declarativa.

Por ejemplo, te permite:

- filtrar
- transformar
- ordenar
- agrupar
- reducir
- combinar operaciones

sin escribir tantos bucles imperativos manuales.

## La idea de stream

Un stream no es una colección nueva en sí misma.

Es una forma de procesar una secuencia de elementos.

Podés pensarla como una tubería de operaciones sobre datos.

## Crear un stream desde una lista

```java
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = List.of("Ana", "Luis", "Carlos");

        names.stream().forEach(System.out::println);
    }
}
```

## Qué hace esto

- `names.stream()` crea un stream a partir de la lista
- `forEach(...)` ejecuta una acción sobre cada elemento

## `filter`

Una operación muy usada es `filter`.

Sirve para quedarse solo con los elementos que cumplen cierta condición.

Ejemplo:

```java
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = List.of("Ana", "Luis", "Carlos", "Alba");

        names.stream()
                .filter(name -> name.startsWith("A"))
                .forEach(System.out::println);
    }
}
```

## Qué hace esto

Filtra los nombres que empiezan con `"A"`.

## `map`

Otra operación central es `map`.

Sirve para transformar cada elemento en otra cosa.

Ejemplo:

```java
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = List.of("Ana", "Luis", "Carlos");

        names.stream()
                .map(String::toUpperCase)
                .forEach(System.out::println);
    }
}
```

## Qué hace esto

Transforma cada nombre a mayúsculas.

## Método de referencia

En el ejemplo apareció esto:

```java
String::toUpperCase
```

Eso es una referencia a método.

Es una forma aún más compacta de expresar ciertas lambdas simples.

Por ejemplo:

```java
name -> name.toUpperCase()
```

puede expresarse como:

```java
String::toUpperCase
```

en contextos compatibles.

## `collect`

Muy a menudo vas a querer transformar una lista y obtener otra lista como resultado.

Para eso se usa mucho `collect`.

Ejemplo:

```java
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<String> names = List.of("Ana", "Luis", "Carlos");

        List<String> result = names.stream()
                .filter(name -> name.length() > 3)
                .map(String::toUpperCase)
                .collect(Collectors.toList());

        System.out.println(result);
    }
}
```

## Qué hace esto

1. toma la lista original
2. filtra nombres con longitud mayor a 3
3. los transforma a mayúsculas
4. recolecta el resultado en una nueva lista

## `toList()`

En Java moderno, muchas veces podés escribir:

```java
List<String> result = names.stream()
        .filter(name -> name.length() > 3)
        .map(String::toUpperCase)
        .toList();
```

Eso es más compacto y muy usado.

## `findFirst`

También podés buscar un primer elemento que cumpla una condición.

Ejemplo:

```java
import java.util.List;
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        List<String> names = List.of("Ana", "Luis", "Carlos");

        Optional<String> result = names.stream()
                .filter(name -> name.startsWith("C"))
                .findFirst();

        System.out.println(result);
    }
}
```

## Qué devuelve

Devuelve un `Optional<String>`.

Eso es importante porque el resultado puede existir o no existir.

## `anyMatch`, `allMatch`, `noneMatch`

Estas operaciones son muy útiles para validaciones o chequeos rápidos.

### `anyMatch`

```java
boolean hasLongName = names.stream()
        .anyMatch(name -> name.length() > 5);
```

Responde si al menos uno cumple.

### `allMatch`

```java
boolean allShort = names.stream()
        .allMatch(name -> name.length() < 10);
```

Responde si todos cumplen.

### `noneMatch`

```java
boolean noneEmpty = names.stream()
        .noneMatch(String::isBlank);
```

Responde si ninguno cumple.

## `sorted`

También podés ordenar dentro del pipeline.

Ejemplo:

```java
List<String> sorted = names.stream()
        .sorted()
        .toList();
```

O con criterio custom:

```java
List<String> sortedByLength = names.stream()
        .sorted((a, b) -> Integer.compare(a.length(), b.length()))
        .toList();
```

## `distinct`

Sirve para eliminar duplicados.

```java
List<String> unique = List.of("Ana", "Ana", "Luis").stream()
        .distinct()
        .toList();
```

## `count`

Cuenta cuántos elementos pasan por la secuencia.

```java
long total = names.stream()
        .filter(name -> name.length() > 3)
        .count();
```

## `reduce`

`reduce` sirve para combinar varios elementos en un solo resultado.

Ejemplo simple:

```java
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 3, 4);

        int sum = numbers.stream()
                .reduce(0, Integer::sum);

        System.out.println(sum);
    }
}
```

## Qué hace esto

Va acumulando todos los números hasta obtener una suma final.

## Streams en backend real

Veamos un ejemplo más cercano a backend.

Supongamos esta entidad:

```java
public class Product {
    private Long id;
    private String name;
    private double price;
    private boolean active;

    public Product(Long id, String name, double price, boolean active) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }

    public boolean isActive() {
        return active;
    }
}
```

Y este DTO:

```java
public class ProductResponseDto {
    private Long id;
    private String name;

    public ProductResponseDto(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}
```

## Mapping con stream

```java
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Product> products = List.of(
                new Product(1L, "Notebook", 1250.50, true),
                new Product(2L, "Mouse", 25.99, false),
                new Product(3L, "Teclado", 45.00, true)
        );

        List<ProductResponseDto> dtos = products.stream()
                .filter(Product::isActive)
                .map(product -> new ProductResponseDto(product.getId(), product.getName()))
                .toList();

        System.out.println(dtos.size());
    }
}
```

## Qué muestra este ejemplo

Muestra algo muy común en backend:

- filtrar entidades
- transformarlas a DTOs
- devolver una lista preparada para la capa web

## Optional

Ahora pasemos a `Optional`.

`Optional` es una forma de representar que un valor puede existir o no existir.

En vez de trabajar todo el tiempo con `null` crudo, `Optional` hace esa posibilidad explícita.

## Qué problema intenta resolver

El uso indiscriminado de `null` puede llevar a:

- `NullPointerException`
- código menos claro
- chequeos dispersos
- intención poco explícita

`Optional` no elimina todos los problemas del mundo, pero ayuda a modelar mejor ciertos casos de ausencia de valor.

## Crear un `Optional`

### Valor presente

```java
Optional<String> name = Optional.of("Ana");
```

### Valor posiblemente nulo

```java
Optional<String> name = Optional.ofNullable(getNameFromSomewhere());
```

### Vacío

```java
Optional<String> empty = Optional.empty();
```

## Consultar si hay valor

```java
if (name.isPresent()) {
    System.out.println(name.get());
}
```

Esto funciona, aunque después vamos a ver formas más expresivas.

## `orElse`

Permite devolver un valor por defecto si el `Optional` está vacío.

```java
String result = name.orElse("Desconocido");
```

## `orElseThrow`

Muy útil cuando la ausencia del valor debería convertirse en error.

```java
String result = name.orElseThrow(() -> new IllegalArgumentException("Nombre no encontrado"));
```

## `ifPresent`

Ejecuta algo solo si el valor existe.

```java
name.ifPresent(System.out::println);
```

## `map` en Optional

Igual que en streams, `map` permite transformar el valor si existe.

```java
Optional<String> upper = name.map(String::toUpperCase);
```

## Ejemplo con `Optional` y repository

En Spring Data JPA, algo muy común es:

```java
Optional<Product> product = productRepository.findById(id);
```

Eso expresa claramente que el producto puede existir o no.

## Uso típico en service

```java
public Product getProductById(Long id) {
    return productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
}
```

## Por qué esto es tan útil

Porque expresa muy bien la intención:

- buscá el producto
- si existe, devolvelo
- si no existe, lanzá excepción

Eso queda mucho más claro que ciertos flujos con `null` disperso.

## `Optional` no significa “usar Optional para todo”

Esto es muy importante.

`Optional` es útil, pero no conviene usarlo de forma exagerada o artificial.

Por ejemplo, no suele ser buena idea usar `Optional` como atributo de entidades JPA o en cualquier parte sin criterio.

Conviene usarlo donde realmente modela bien una posible ausencia de valor.

## Lambdas + streams + Optional juntos

En Java moderno, estas herramientas suelen aparecer combinadas.

Ejemplo:

```java
Optional<ProductResponseDto> result = products.stream()
        .filter(Product::isActive)
        .filter(product -> product.getId().equals(1L))
        .findFirst()
        .map(product -> new ProductResponseDto(product.getId(), product.getName()));
```

## Qué está pasando acá

1. se filtran productos activos
2. se busca uno con id 1
3. se toma el primero encontrado
4. si existe, se transforma a DTO
5. el resultado final es un `Optional<ProductResponseDto>`

Eso ya se parece bastante a código real de backend moderno.

## Ventajas de este estilo

Bien usado, este enfoque permite:

- expresar mejor intenciones
- reducir ruido de loops manuales
- encadenar transformaciones
- manejar ausencia de valor con más claridad
- escribir mapping y filtrado más limpios

## Riesgos o malos usos

También hay que evitar ciertos excesos.

No todo mejora automáticamente por volverse “más funcional”.

Código muy encadenado o rebuscado también puede volverse difícil de leer.

La meta no es usar streams o lambdas porque sí.
La meta es mejorar claridad y diseño.

## Cuándo conviene usar streams

Suelen convenir cuando querés:

- filtrar
- transformar
- ordenar
- agrupar
- resumir
- contar
- mapear listas

sobre todo si la intención queda más clara que con un `for` manual.

## Cuándo un `for` sigue estando bien

A veces un `for` clásico sigue siendo perfectamente válido y más claro.

Por ejemplo, cuando:

- el flujo tiene mucha lógica condicional compleja
- hay mutaciones o efectos laterales importantes
- la versión con streams queda demasiado críptica

No se trata de prohibir loops, sino de elegir bien.

## Ejemplo comparativo

### Con `for`

```java
List<String> result = new ArrayList<>();

for (String name : names) {
    if (name.length() > 3) {
        result.add(name.toUpperCase());
    }
}
```

### Con stream

```java
List<String> result = names.stream()
        .filter(name -> name.length() > 3)
        .map(String::toUpperCase)
        .toList();
```

En muchos casos, la segunda versión expresa mejor la intención.

## Cómo se conecta con Spring Boot real

En un proyecto Spring Boot esto aparece mucho en:

- servicios que mapean entidades a DTOs
- filtros sobre datos en memoria
- composición de validaciones
- procesamiento de respuestas
- uso de `Optional` desde repositories

Por eso dominarlo te hace escribir Java backend bastante más moderno.

## Buenas prácticas iniciales

## 1. Priorizar claridad

Si el stream queda ilegible, no está ayudando.

## 2. Usar `Optional` para ausencia de valor real

No como moda.

## 3. No abusar de `get()` sobre `Optional`

Mejor `orElse`, `orElseThrow`, `map`, `ifPresent`.

## 4. Evitar streams con demasiados efectos secundarios

Funcionan mejor cuando expresan transformaciones limpias.

## 5. Practicar mucho mapping de entidad a DTO

Es uno de los usos más comunes y más valiosos.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a `map`, `filter`, `find` y ciertos patrones con arrays. La idea general es bastante parecida, aunque Java tiene su propia sintaxis, su sistema de tipos y la presencia fuerte de `Optional`.

### Si venís de Python

Puede hacerte pensar en comprensiones, `map`, `filter` y manejo más explícito de ausencia de valor en ciertos contextos. En Java, estas herramientas se integran con un estilo orientado a objetos bastante particular y muy usado en backend real.

## Errores comunes

### 1. Querer convertir absolutamente todo en stream

No siempre mejora el código.

### 2. Encadenar demasiadas operaciones y perder legibilidad

Más funcional no siempre significa más claro.

### 3. Usar `Optional.get()` sin cuidado

Eso puede devolverte al mismo tipo de problemas que querías evitar.

### 4. No entender bien qué devuelve cada operación

Por ejemplo:
- `map` transforma
- `filter` filtra
- `findFirst` devuelve `Optional`

### 5. Usar lambdas sin entender la interfaz funcional que hay detrás

Conviene entender la base, no solo copiar la sintaxis.

## Mini ejercicio

Tomá una lista de productos y hacé estas tareas:

1. filtrar solo los activos
2. quedarte con nombres en mayúsculas
3. obtener una lista final
4. buscar el primer producto con precio mayor a cierto valor
5. mapear ese resultado a `Optional<String>` con el nombre del producto

## Ejemplo posible

```java
List<String> activeNames = products.stream()
        .filter(Product::isActive)
        .map(Product::getName)
        .map(String::toUpperCase)
        .toList();

Optional<String> expensiveProductName = products.stream()
        .filter(product -> product.getPrice() > 1000)
        .findFirst()
        .map(Product::getName);
```

## Resumen

En esta lección viste que:

- las lambdas permiten expresar comportamiento de forma más compacta
- los streams permiten procesar secuencias de datos de forma declarativa
- `filter`, `map`, `sorted`, `findFirst`, `count` y `reduce` son operaciones muy importantes
- `Optional` permite modelar mejor la posible ausencia de valor
- estas herramientas aparecen muchísimo en backend moderno con Java y Spring Boot
- bien usadas, ayudan a escribir código más expresivo, claro y reusable

## Siguiente tema

A partir de acá, una continuación muy natural es **MapStruct**, porque después de ver streams y mapping manual de entidades a DTOs, el siguiente paso lógico es aprender una herramienta muy útil para automatizar y ordenar esos mapeos en proyectos reales.
