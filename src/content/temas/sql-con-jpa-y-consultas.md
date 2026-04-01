---
title: "SQL con JPA y consultas"
description: "Cómo consultar datos con JPA y Spring Data, cuándo alcanza con los métodos derivados y cuándo conviene pensar más de cerca en SQL y consultas personalizadas."
order: 38
module: "Persistencia"
level: "intermedio"
draft: false
---

## Introducción

En las lecciones anteriores viste:

- repository
- JPA
- Hibernate

Eso te permitió entender cómo una aplicación Java puede persistir entidades y delegar gran parte del trabajo relacional a un ORM.

Pero guardar datos es solo una parte del problema.

Muy pronto aparece otra necesidad central:

**consultar datos**

Por ejemplo:

- listar todos los productos
- buscar uno por id
- traer solo los activos
- filtrar por precio
- buscar por texto
- consultar relaciones entre entidades

Ahí se vuelve muy importante entender cómo consultar datos con JPA y cómo se relaciona eso con SQL.

## La idea general

Cuando trabajás con JPA y Spring Data, no siempre necesitás escribir SQL manualmente.

Muchas consultas comunes pueden resolverse con:

- métodos heredados de `JpaRepository`
- métodos derivados por nombre
- consultas personalizadas con `@Query`

Pero aunque el framework te ayude mucho, sigue siendo muy importante pensar qué consulta se está ejecutando realmente.

## Qué problema resuelve Spring Data JPA

Spring Data JPA te ahorra muchísimo trabajo repetitivo.

Por ejemplo, sin escribir SQL manual para cada caso, ya podés tener cosas como:

- `findAll()`
- `findById(...)`
- `save(...)`
- `deleteById(...)`

Y además podés declarar consultas por convención de nombres.

Eso acelera mucho el desarrollo.

## Aun así, SQL sigue importando

Esto es clave.

Aunque uses JPA y Hibernate, el acceso a datos sigue terminando en consultas reales contra una base relacional.

Por eso conviene seguir pensando en cosas como:

- qué filtros aplica la consulta
- cuántas filas puede traer
- si se apoya en índices
- si se están trayendo datos de más
- si se están disparando demasiadas consultas

## Repository básico con JpaRepository

Supongamos esta entidad:

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

    @Column(nullable = false)
    private boolean active;

    public Product() {
    }

    public Product(String name, double price, boolean active) {
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

Y este repository:

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
```

## Qué ya obtenés automáticamente

Con eso ya podés usar métodos como:

- `findAll()`
- `findById(...)`
- `save(...)`
- `deleteById(...)`
- `existsById(...)`
- `count()`

## `findAll()`

Sirve para listar todas las entidades de ese tipo.

Ejemplo:

```java
List<Product> products = productRepository.findAll();
```

## `findById(...)`

Sirve para buscar por clave primaria.

```java
Optional<Product> product = productRepository.findById(1L);
```

## `existsById(...)`

Permite saber si existe una entidad con cierto id.

```java
boolean exists = productRepository.existsById(1L);
```

## Métodos derivados por nombre

Una de las características más prácticas de Spring Data JPA es que puede derivar consultas a partir del nombre del método.

Por ejemplo:

```java
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActive(boolean active);

    List<Product> findByName(String name);

    List<Product> findByPriceGreaterThan(double price);
}
```

## Qué significa cada uno

### `findByActive(boolean active)`

Busca productos por estado activo.

### `findByName(String name)`

Busca productos cuyo nombre coincide.

### `findByPriceGreaterThan(double price)`

Busca productos con precio mayor a cierto valor.

## Qué tiene de bueno esto

Que para muchas consultas simples no hace falta escribir SQL ni JPQL manualmente.

El nombre del método expresa la intención y Spring Data intenta construir la consulta adecuada.

## Otros ejemplos útiles de consultas derivadas

```java
List<Product> findByPriceLessThan(double price);
List<Product> findByNameContaining(String text);
List<Product> findByActiveTrue();
List<Product> findByNameStartingWith(String prefix);
List<Product> findByNameEndingWith(String suffix);
```

## `Containing`

Muy útil para búsquedas parciales.

```java
List<Product> findByNameContaining(String text);
```

Ejemplo mental:
buscar productos cuyo nombre contenga cierta cadena.

## `True` y `False`

También podés derivar consultas booleanas expresivas.

```java
List<Product> findByActiveTrue();
List<Product> findByActiveFalse();
```

## `OrderBy`

También podés incluir ordenamiento en el nombre del método.

```java
List<Product> findByActiveTrueOrderByPriceAsc();
List<Product> findByActiveTrueOrderByPriceDesc();
```

## Qué está pasando detrás

Spring Data interpreta ese nombre y genera una consulta equivalente.

No hace falta que memorices todos los patrones desde ya, pero sí entender la idea:

**muchas consultas simples se pueden declarar por convención**

## `Optional` en consultas únicas

Si buscás una sola entidad, muchas veces conviene devolver `Optional`.

Ejemplo:

```java
Optional<Product> findByName(String name);
```

Eso expresa:
“puede haber un resultado o puede no haberlo”.

## `existsBy...`

A veces no querés traer toda la entidad.
Solo querés saber si existe.

Ejemplo:

```java
boolean existsByName(String name);
```

Esto puede ser muy útil para validaciones de negocio, por ejemplo evitar nombres duplicados.

## `countBy...`

También podés contar con consultas derivadas.

```java
long countByActiveTrue();
```

## Cuándo alcanzan los métodos derivados

Los métodos derivados funcionan muy bien cuando:

- la consulta es simple o moderada
- el nombre sigue siendo legible
- no necesitás una lógica demasiado compleja

## Cuándo empiezan a volverse incómodos

Si el nombre del método empieza a crecer demasiado o la consulta se vuelve muy específica, muchas veces conviene pasar a consultas personalizadas.

Por ejemplo, algo como esto:

```java
findByActiveTrueAndPriceGreaterThanAndNameContainingOrderByPriceDesc(...)
```

puede funcionar, pero empieza a ponerse pesado.

## `@Query`

Cuando querés más control, podés usar `@Query`.

Ejemplo:

```java
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE p.active = true")
    List<Product> findActiveProducts();
}
```

## Qué lenguaje usa `@Query`

Por defecto, muchas veces se usa JPQL.

JPQL significa:

**Java Persistence Query Language**

Es un lenguaje parecido a SQL, pero orientado a entidades y atributos, no a tablas y columnas puras.

## Diferencia entre SQL y JPQL

### SQL

Piensa en:

- tablas
- columnas
- sintaxis relacional pura

Ejemplo:

```sql
SELECT * FROM products WHERE active = true;
```

### JPQL

Piensa en:

- entidades
- atributos
- modelo orientado a objetos persistente

Ejemplo:

```java
@Query("SELECT p FROM Product p WHERE p.active = true")
```

Acá no consultás la tabla `products`, sino la entidad `Product`.

## Ejemplo con parámetro

```java
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE p.price > :minPrice")
    List<Product> findProductsMoreExpensiveThan(@Param("minPrice") double minPrice);
}
```

## Qué está pasando acá

- `:minPrice` es un parámetro nombrado
- `@Param("minPrice")` lo vincula con el parámetro Java del método

## Otro ejemplo útil

```java
@Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :text, '%'))")
List<Product> searchByName(@Param("text") String text);
```

## Qué hace esto

Busca productos cuyo nombre contenga cierto texto, ignorando mayúsculas y minúsculas.

## Por qué `@Query` puede ser útil

Porque te da más control y hace más explícita la consulta cuando:

- la convención de nombres ya no es cómoda
- querés una consulta más expresiva
- necesitás joins o condiciones más elaboradas

## Consultas nativas

También existe la posibilidad de usar SQL nativo.

Ejemplo conceptual:

```java
@Query(value = "SELECT * FROM products WHERE active = true", nativeQuery = true)
List<Product> findActiveProductsNative();
```

## Cuándo puede servir SQL nativo

Puede servir cuando:

- necesitás una consulta muy específica
- querés aprovechar algo particular del motor de base
- la consulta en JPQL no resulta cómoda
- necesitás un control muy cercano al SQL real

## Cuidado con SQL nativo

Aunque a veces es útil, conviene no saltar a SQL nativo para todo.

¿Por qué?
Porque perdés parte de la abstracción orientada a entidades y te atás más a detalles concretos de la base.

## Consultas y relaciones

Cuando aparecen relaciones entre entidades, las consultas se vuelven todavía más importantes.

Por ejemplo, supongamos:

```java
@Entity
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
}
```

```java
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    private Category category;
}
```

Entonces podrías tener una consulta derivada como:

```java
List<Product> findByCategoryName(String name);
```

## Qué tiene de interesante

Spring Data puede navegar relaciones y construir consultas basadas en propiedades anidadas.

Eso es muy poderoso, pero también conviene entender qué consulta real termina ejecutándose.

## Paginación

Otra necesidad muy común en consultas reales es no traer todo de una sola vez.

Para eso existen herramientas de paginación.

Por ejemplo, Spring Data JPA permite trabajar con `Pageable`.

Ejemplo conceptual:

```java
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByActiveTrue(Pageable pageable);
}
```

## Qué ventaja tiene esto

Te permite pedir datos por páginas, por ejemplo:

- página 0, tamaño 10
- página 1, tamaño 10

Eso es muchísimo más sano que cargar miles de registros de golpe.

## Ordenamiento

También existe soporte para ordenamiento.

Ejemplo conceptual:

```java
import org.springframework.data.domain.Sort;

List<Product> products = productRepository.findAll(Sort.by("price").descending());
```

## Qué gana una API con esto

- mejor performance
- respuestas más controladas
- mejor experiencia para el cliente
- consultas más razonables a medida que crecen los datos

## SQL mental detrás de JPA

Aunque uses JPA, conviene mantener una intuición del SQL subyacente.

Por ejemplo, si hacés:

```java
List<Product> products = productRepository.findByActiveTrue();
```

pensá algo parecido a:

```sql
SELECT id, name, unit_price, active
FROM products
WHERE active = true;
```

No hace falta escribir eso siempre a mano, pero sí conviene poder imaginarlo.

## Ver el SQL generado

En desarrollo, una práctica muy útil es activar logs SQL.

Por ejemplo:

```properties
spring.jpa.show-sql=true
```

Eso ayuda a ver qué está ejecutando Hibernate realmente.

Y eso ayuda muchísimo a aprender.

## Consultas y rendimiento

No toda consulta “que funciona” es una consulta sana.

Conviene empezar a mirar cosas como:

- ¿trae más datos de los necesarios?
- ¿está bien filtrada?
- ¿dispara joins razonables?
- ¿hay riesgo de demasiadas consultas?
- ¿se está paginando bien?

No hace falta obsesionarse de entrada, pero sí ir formando ese criterio.

## Service usando consultas

### Repository

```java
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByActiveTrue();
    List<Product> findByPriceGreaterThan(double price);
}
```

### Service

```java
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    public List<Product> getExpensiveProducts(double minPrice) {
        return productRepository.findByPriceGreaterThan(minPrice);
    }
}
```

## Qué muestra este ejemplo

Que el service puede apoyarse en consultas expresivas del repository sin preocuparse por detalles de SQL en cada uso.

Eso mantiene bien separadas las responsabilidades.

## Cuándo usar qué

## Método heredado de `JpaRepository`

Cuando la operación ya viene resuelta y es suficiente.

## Método derivado por nombre

Cuando la consulta es simple y el nombre sigue siendo claro.

## `@Query` con JPQL

Cuando querés más control y la consulta ya merece una definición más explícita.

## SQL nativo

Cuando realmente necesitás ese nivel de control o una capacidad particular del motor de base.

## Ejemplo completo

### Entidad

```java
import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private double price;

    private boolean active;

    public Product() {
    }

    public Product(String name, double price, boolean active) {
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

### Repository

```java
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrue();

    List<Product> findByPriceGreaterThan(double price);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :text, '%'))")
    List<Product> searchByName(String text);
}
```

### Service

```java
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getActiveProducts() {
        return productRepository.findByActiveTrue();
    }

    public List<Product> getProductsMoreExpensiveThan(double minPrice) {
        return productRepository.findByPriceGreaterThan(minPrice);
    }

    public List<Product> searchProducts(String text) {
        return productRepository.searchByName(text);
    }
}
```

## Qué demuestra este ejemplo

Demuestra tres estilos muy comunes de consulta:

- consulta heredada básica
- consulta derivada por nombre
- consulta personalizada con `@Query`

Eso ya te da una base muy fuerte para persistencia real.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a ORMs que permiten mezclar métodos de conveniencia con consultas más explícitas. En Java y Spring Data esto aparece muy fuerte con métodos derivados y `@Query`.

### Si venís de Python

Puede parecerse a ORMs donde ciertas consultas se expresan muy alto nivel y otras necesitan más detalle. La diferencia es que acá la combinación JPA + Hibernate + Spring Data tiene sus propias convenciones muy marcadas.

## Errores comunes

### 1. Confiar ciegamente en que cualquier consulta derivada será siempre ideal

A veces funciona, pero puede no ser lo más claro o eficiente.

### 2. Usar `@Query` o SQL nativo para todo sin necesidad

Muchas veces los métodos estándar o derivados alcanzan perfectamente.

### 3. No pensar qué SQL real hay detrás

Eso vuelve más difícil detectar problemas de rendimiento o de diseño.

### 4. Hacer queries demasiado largas por nombre

Si el nombre empieza a ser monstruoso, quizá conviene una consulta explícita.

### 5. Traer demasiados datos de golpe

Paginación y ordenamiento importan mucho en aplicaciones reales.

## Mini ejercicio

Diseñá consultas para `Product` que permitan:

1. listar todos los productos activos
2. listar productos con precio mayor que un valor
3. buscar productos cuyo nombre contenga un texto
4. comprobar si existe un producto con cierto nombre
5. contar cuántos productos activos hay

Intentá resolver algunos casos con:

- métodos derivados
- y al menos uno con `@Query`

## Ejemplo posible

```java
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrue();

    List<Product> findByPriceGreaterThan(double price);

    List<Product> findByNameContaining(String text);

    boolean existsByName(String name);

    long countByActiveTrue();

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :text, '%'))")
    List<Product> searchByName(String text);
}
```

## Resumen

En esta lección viste que:

- consultar datos con JPA no se limita a `findAll()` y `findById()`
- Spring Data JPA permite consultas heredadas, derivadas por nombre y consultas personalizadas
- `@Query` da más control cuando la consulta lo necesita
- SQL nativo existe, pero conviene usarlo con criterio
- aunque uses ORM, sigue siendo importante pensar en el SQL subyacente
- paginación, ordenamiento y diseño de consultas importan mucho en aplicaciones reales

## Siguiente tema

En la próxima lección conviene pasar a **testing en Spring Boot**, porque después de construir capas, endpoints, validaciones y persistencia básica, el siguiente paso natural es aprender a comprobar que todo eso funcione de forma confiable.
