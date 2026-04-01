---
title: "JPA"
description: "Qué es JPA, cómo ayuda a mapear objetos Java a tablas relacionales y por qué es una pieza central del backend Java con persistencia."
order: 36
module: "Persistencia"
level: "intermedio"
draft: false
---

## Introducción

En la lección anterior viste repository, o sea, la capa encargada de acceder a los datos.

Eso te permitió entender bien la separación entre:

- controller
- service
- repository

Pero hasta ahora los ejemplos de repository trabajaban con listas en memoria o con implementaciones simples.

En proyectos reales, normalmente querés persistir datos en una base de datos relacional.

Ahí aparece JPA.

JPA es una de las piezas más importantes del backend Java moderno cuando trabajás con persistencia.

## Qué es JPA

JPA significa:

**Jakarta Persistence API**

Es una especificación para manejar persistencia de datos en Java usando objetos en lugar de escribir todo el acceso relacional a mano desde cero.

Dicho simple:

JPA te ayuda a mapear objetos Java a tablas de base de datos.

## La idea general

Supongamos que tenés esta clase Java:

```java
public class Product {
    private Long id;
    private String name;
    private double price;
}
```

Y en la base de datos querés algo como una tabla `products` con columnas:

- `id`
- `name`
- `price`

JPA permite definir ese vínculo entre clase y tabla.

Entonces, en vez de pensar solo en filas y columnas, también podés trabajar con objetos del dominio y dejar que la capa de persistencia traduzca muchas cosas.

## Qué problema resuelve JPA

Sin JPA, tendrías que hacer mucho trabajo manual como:

- escribir SQL para cada operación
- mapear cada fila a un objeto Java
- mapear cada objeto a columnas
- manejar más detalles de persistencia repetitivos

JPA reduce muchísimo esa fricción.

## Importante: JPA no es una implementación concreta

Esto conviene tenerlo muy claro.

JPA es una especificación.

Eso significa que define reglas e interfaces generales.

La implementación concreta más usada en el ecosistema Spring Boot suele ser Hibernate.

Una forma útil de pensarlo es:

- JPA → contrato / especificación
- Hibernate → implementación frecuente

## ORM

Cuando se habla de JPA, también aparece mucho la idea de ORM.

ORM significa:

**Object Relational Mapping**

Dicho simple:

es el mapeo entre objetos del programa y estructuras relacionales de la base de datos.

## Qué significa eso en la práctica

- una clase Java puede representar una tabla
- un objeto puede representar una fila
- un atributo puede representar una columna

Ese es el corazón del enfoque ORM.

## Entidad

La clase principal con la que se trabaja en JPA suele ser una entidad.

Una entidad es una clase que representa algo persistente en la base de datos.

Ejemplo:

```java
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Product {

    @Id
    private Long id;

    private String name;
    private double price;

    public Product() {
    }

    public Product(Long id, String name, double price) {
        this.id = id;
        this.name = name;
        this.price = price;
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
}
```

## Qué hace `@Entity`

La anotación:

```java
@Entity
```

le dice a JPA que esta clase representa una entidad persistente.

O sea, una clase que debe poder mapearse a una tabla.

## Qué hace `@Id`

La anotación:

```java
@Id
```

marca el identificador principal de la entidad.

En términos relacionales, representa la clave primaria.

## Ejemplo mental simple

Si tenés esto:

```java
@Entity
public class Product {
    @Id
    private Long id;
    private String name;
    private double price;
}
```

JPA puede pensar algo parecido a:

- clase `Product` → tabla `product` o `products`, según configuración
- atributo `id` → columna `id`
- atributo `name` → columna `name`
- atributo `price` → columna `price`

## Constructor vacío

En entidades JPA suele ser muy importante tener un constructor vacío.

Ejemplo:

```java
public Product() {
}
```

Eso facilita que la implementación de JPA pueda crear instancias cuando hace falta.

## `@GeneratedValue`

Muchas veces no querés asignar manualmente el id.

Querés que la base o la estrategia de persistencia lo genere automáticamente.

Para eso suele usarse:

```java
@GeneratedValue
```

Ejemplo:

```java
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private double price;

    public Product() {
    }

    public Product(String name, double price) {
        this.name = name;
        this.price = price;
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
}
```

## Qué significa esto

Con esa configuración, el id suele generarse automáticamente al guardar la entidad.

Entonces al crear un producto nuevo, no necesitás setear el id a mano desde entrada.

## `@Table`

A veces querés indicar explícitamente el nombre de la tabla.

Ejemplo:

```java
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {
    @Id
    private Long id;
}
```

## Qué hace `@Table`

Le dice a JPA qué nombre de tabla usar.

Si no lo ponés, JPA/Hibernate suele aplicar convenciones por defecto.

## `@Column`

También podés controlar columnas explícitamente.

Ejemplo:

```java
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Product {

    @Id
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "unit_price")
    private double price;
}
```

## Qué hace `@Column`

Permite ajustar detalles como:

- nombre de columna
- nullability
- longitud
- unicidad en algunos casos
- otras configuraciones del mapeo

## JPA y repository

Ahora que ya viste repository, esto encaja muy bien.

Con Spring Data JPA, una forma muy común de definir un repository es así:

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
```

## Qué expresa eso

Le estás diciendo a Spring Data JPA:

- esta entidad es `Product`
- su id es `Long`

Y automáticamente obtenés muchas operaciones comunes ya resueltas, como:

- `findAll()`
- `findById(...)`
- `save(...)`
- `deleteById(...)`

## Qué gana el diseño con esto

Antes, el repository en memoria tenía que implementar a mano cosas como:

- listar
- buscar por id
- guardar
- eliminar

Con JPA, gran parte de eso ya viene resuelto si definís bien la entidad y el repository.

## Ejemplo de repository JPA

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
```

## Qué podés hacer con esto

Por ejemplo, desde un service podrías hacer:

```java
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getProducts() {
        return productRepository.findAll();
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }
}
```

## Qué importante entender acá

JPA no “reemplaza” la idea de repository.
La potencia.

La capa repository sigue existiendo, pero ahora apoyada en un framework de persistencia mucho más poderoso.

## `findById` y `Optional`

Con JPA, muchas operaciones de búsqueda por id devuelven `Optional`.

Ejemplo:

```java
productRepository.findById(id)
```

Esto suele devolver algo como:

```java
Optional<Product>
```

Eso expresa:
“puede existir un producto o no existir”.

## Ejemplo en service

```java
import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
    }
}
```

## Qué está pasando acá

Si el producto existe, se devuelve.

Si no existe, se lanza una excepción del dominio.

Eso conecta muy bien con:

- repository
- service
- manejo de errores en Spring Boot

## Persistir una entidad

Cuando guardás una entidad, el flujo general suele ser:

1. crear un objeto Java
2. pasarlo al repository
3. JPA / Hibernate lo traduce a una operación SQL
4. la base persiste el registro

Ejemplo conceptual:

```java
Product product = new Product("Notebook", 1250.50);
productRepository.save(product);
```

## Qué hace `save(...)`

Según el caso, puede:

- insertar una nueva fila
- actualizar una existente

Eso depende del estado de la entidad y de su identificador.

## JPA y consultas derivadas

Spring Data JPA también permite definir métodos de consulta a partir del nombre.

Ejemplo:

```java
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByName(String name);
}
```

## Qué expresa esto

Sin escribir SQL manualmente, estás declarando una intención:

“buscar productos por nombre”.

Spring Data JPA puede interpretar ese método y generar la consulta correspondiente.

## Más ejemplos de métodos derivados

```java
List<Product> findByPriceGreaterThan(double price);
List<Product> findByNameContaining(String text);
boolean existsByName(String name);
```

Esto más adelante se vuelve muy útil para construir filtros y consultas de negocio simples.

## JPA y base de datos relacional

JPA trabaja muy bien con bases relacionales como:

- PostgreSQL
- MySQL
- MariaDB
- H2
- otras compatibles

Más adelante, cuando veas configuración de datasource y base real, esto va a cobrar todavía más sentido.

## Configuración conceptual mínima

En Spring Boot, una aplicación con JPA suele necesitar cosas como:

- dependencia de Spring Data JPA
- dependencia del driver de la base
- propiedades de conexión en `application.properties` o `application.yml`

No hace falta profundizar todavía en toda la configuración fina.
Lo importante por ahora es entender el rol de la entidad y del repository.

## Ejemplo de configuración conceptual

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
spring.datasource.username=postgres
spring.datasource.password=secret
spring.jpa.hibernate.ddl-auto=update
```

## Qué idea hay detrás de esto

La aplicación necesita saber:

- a qué base conectarse
- con qué usuario
- cómo manejar el esquema

Más adelante esto merece una lección propia de persistencia y configuración.

## Relaciones entre entidades

JPA también permite modelar relaciones como:

- uno a uno
- uno a muchos
- muchos a uno
- muchos a muchos

por ejemplo entre:

- `Order` y `Customer`
- `Order` y `OrderItem`
- `User` y `Address`

Eso conecta directamente con lo que ya viste sobre relaciones entre clases, pero ahora llevado al mundo de la persistencia relacional.

## Ejemplo simple de una entidad más realista

```java
import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "unit_price", nullable = false)
    private double price;

    public Product() {
    }

    public Product(String name, double price) {
        this.name = name;
        this.price = price;
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
}
```

## Repository asociado

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
```

## Service asociado

```java
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getProducts() {
        return productRepository.findAll();
    }

    public Product createProduct(String name, double price) {
        if (price < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }

        Product product = new Product(name, price);
        return productRepository.save(product);
    }
}
```

## Controller asociado

```java
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<Product> getProducts() {
        return productService.getProducts();
    }
}
```

## Qué demuestra este ejemplo

Demuestra que JPA entra muy naturalmente dentro de la arquitectura que ya venís armando:

- controller
- service
- repository
- entidad

Eso hace que el paso hacia persistencia real se sienta bastante coherente.

## Qué NO conviene hacer

No conviene tratar JPA como una caja mágica sin entender nada.

Aunque abstrae muchísimo, igual conviene tener clara la base:

- clases
- tablas
- ids
- relaciones
- consultas
- persistencia

Si no, más adelante ciertos problemas se vuelven difíciles de depurar.

## JPA no reemplaza entender SQL

Esto es muy importante.

Aunque JPA ahorra mucho trabajo manual, sigue siendo muy valioso entender bien SQL y bases de datos relacionales.

¿Por qué?
Porque abajo sigue existiendo una base relacional con:

- tablas
- joins
- índices
- constraints
- transacciones

JPA no hace innecesario entender eso.
Solo te da una capa de trabajo más productiva sobre esa base.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a ORMs del ecosistema JS, pero en Java JPA/Hibernate forman una pieza especialmente clásica y central del backend relacional.

### Si venís de Python

Puede hacerte pensar en ORMs como SQLAlchemy o Django ORM. En Java, JPA cumple un rol parecido como capa de mapeo objeto-relacional, pero con convenciones y herramientas propias del ecosistema Spring.

## Errores comunes

### 1. Pensar que JPA reemplaza entender bases de datos

No.
Sigue siendo importante entender modelo relacional y SQL.

### 2. Aprender `JpaRepository` sin entender antes qué es un repository

Eso vuelve muchas cosas confusas.

### 3. No distinguir entre entidad y DTO

La entidad representa persistencia; el DTO representa datos de entrada o salida.

### 4. Creer que todas las consultas complejas “se resuelven mágicamente”

JPA ayuda muchísimo, pero no elimina la necesidad de pensar consultas y modelo de datos.

### 5. No prestar atención a ids, relaciones y mapeos

Ahí suelen aparecer muchos de los problemas reales al trabajar con persistencia.

## Mini ejercicio

Diseñá una persistencia simple para `Product` usando JPA:

1. crear una entidad `Product`
2. marcar el id con `@Id`
3. usar `@GeneratedValue`
4. crear un `ProductRepository` que extienda `JpaRepository`
5. crear un `ProductService` que use `findAll()` y `save()`

## Ejemplo posible

```java
import jakarta.persistence.*;

@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private double price;

    public Product() {
    }

    public Product(String name, double price) {
        this.name = name;
        this.price = price;
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
}
```

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
```

## Resumen

En esta lección viste que:

- JPA es una especificación para persistencia en Java
- ayuda a mapear objetos Java a tablas relacionales
- las clases persistentes suelen anotarse con `@Entity`
- el identificador se marca con `@Id`
- `@GeneratedValue` permite generar ids automáticamente
- JPA se integra muy bien con repositories en Spring Boot
- entender JPA te prepara para persistencia real con bases relacionales

## Siguiente tema

En la próxima lección conviene pasar a **Hibernate**, porque después de entender qué es JPA como especificación, el siguiente paso natural es ver la implementación más común y poderosa que suele estar detrás en proyectos Spring Boot.
