---
title: "Repository"
description: "Cómo separar el acceso a datos en Spring Boot usando la capa repository y por qué eso mejora el diseño y la mantenibilidad."
order: 35
module: "Backend web"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya viste varias piezas importantes de una aplicación backend bien organizada:

- controllers
- services
- DTOs
- validaciones
- manejo de errores

Eso te permitió separar bastante bien:

- la capa web
- la lógica de negocio
- la forma en que se exponen datos

Pero todavía falta una parte clave:
¿dónde vive el acceso a datos?

Por ejemplo:

- buscar un producto por id
- guardar un usuario nuevo
- listar órdenes
- actualizar el estado de una entidad
- eliminar registros

Para resolver eso aparece la capa repository.

## Qué es un repository

Un repository es una capa o componente cuya responsabilidad principal es acceder a los datos.

Dicho simple:

- guarda
- busca
- actualiza
- elimina
- consulta información persistente

En una arquitectura típica, el repository se encarga del acceso a datos, mientras que el service se encarga de la lógica de negocio.

## La idea general

Una aplicación backend no debería mezclar todo en un mismo lugar.

Por ejemplo, no conviene que un controller haga directamente cosas como:

- decidir la lógica del negocio
- consultar datos
- transformar errores
- hablar con la base
- armar responses

Tampoco conviene que un service mezcle toda la lógica con detalles técnicos de cómo se guarda o recupera información.

La capa repository ayuda a separar mejor la preocupación de persistencia.

## Regla práctica simple

Podés pensar así:

- controller → HTTP
- service → negocio
- repository → datos

Esa regla no explica todos los casos del mundo, pero como guía inicial es muy útil.

## Qué problema resuelve el repository

Sin una capa clara de acceso a datos, suele pasar que:

- se mezcla lógica con persistencia
- el código queda más acoplado
- cuesta cambiar la fuente de datos
- testear se vuelve más difícil
- las clases empiezan a hacer demasiadas cosas

El repository ayuda a encapsular la forma en que se accede a los datos.

## Repositorio sin base de datos todavía

Antes de llegar a JPA o a una base real, conviene entender la idea con ejemplos simples.

Por ejemplo, podrías tener un repository en memoria.

### Modelo

```java
public class Product {
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

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}
```

### Repository simple

```java
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class ProductRepository {
    private final List<Product> products = new ArrayList<>();

    public ProductRepository() {
        products.add(new Product(1L, "Notebook", 1250.50));
        products.add(new Product(2L, "Mouse", 25.99));
    }

    public List<Product> findAll() {
        return products;
    }

    public Product findById(Long id) {
        return products.stream()
                .filter(product -> product.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public Product save(Product product) {
        products.add(product);
        return product;
    }
}
```

## Qué muestra este ejemplo

Aunque todavía no hay base de datos, ya aparece una idea importante:

la clase `ProductRepository` es la responsable de manejar la colección de datos.

No el controller.
No el service.

## `@Repository`

La anotación más típica para esta capa es:

```java
@Repository
```

Ejemplo:

```java
import org.springframework.stereotype.Repository;

@Repository
public class ProductRepository {
}
```

## Qué significa `@Repository`

Le indica a Spring que esta clase es un componente relacionado con acceso a datos.

En la práctica:

- Spring la detecta como bean
- puede inyectarla donde haga falta
- comunica con claridad su rol en la arquitectura

## Controller, service y repository juntos

### Repository

```java
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class ProductRepository {
    private final List<Product> products = new ArrayList<>();

    public ProductRepository() {
        products.add(new Product(1L, "Notebook", 1250.50));
        products.add(new Product(2L, "Mouse", 25.99));
    }

    public List<Product> findAll() {
        return products;
    }

    public Product findById(Long id) {
        return products.stream()
                .filter(product -> product.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public Product save(Product product) {
        products.add(product);
        return product;
    }
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

    public List<Product> getProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("El id debe ser mayor que cero");
        }

        Product product = productRepository.findById(id);

        if (product == null) {
            throw new ResourceNotFoundException("Producto no encontrado");
        }

        return product;
    }

    public Product createProduct(Product product) {
        if (product.getPrice() < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }

        return productRepository.save(product);
    }
}
```

### Controller

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

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }
}
```

## Qué mejora con esta separación

Ahora cada capa tiene un rol más claro:

- controller recibe requests y devuelve responses
- service aplica reglas del negocio
- repository accede a los datos

Eso hace el sistema mucho más entendible y mantenible.

## Qué suele hacer un repository

Dependiendo del proyecto, un repository suele ofrecer operaciones como:

- `findAll()`
- `findById(...)`
- `save(...)`
- `deleteById(...)`
- búsquedas específicas
- consultas filtradas

## Qué no debería hacer un repository

En general, no debería contener reglas de negocio complejas.

Por ejemplo, una decisión como:

“no se puede cancelar una orden ya enviada”

suele tener más sentido en el service que en el repository.

El repository se enfoca en persistencia y consulta.

## Diferencia entre service y repository

### Repository

Se enfoca en datos.

### Service

Se enfoca en reglas y operaciones del dominio.

A veces una operación del service delega casi directamente en el repository.
Eso puede estar bien.

Pero la separación sigue teniendo valor porque deja claro dónde vive cada preocupación.

## Repositories y fuente de datos

Una gran ventaja de esta capa es que abstrae la fuente de datos.

Hoy puede ser:

- una lista en memoria
- una base relacional
- un archivo
- un sistema externo

La aplicación de más arriba no necesita saber todos esos detalles si se apoya bien en el repository.

## Ejemplo con interfaz

También es común definir repositorios como interfaz y dejar la implementación en otra clase.

Ejemplo:

```java
import java.util.List;

public interface ProductRepository {
    List<Product> findAll();
    Product findById(Long id);
    Product save(Product product);
}
```

Y después una implementación simple:

```java
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class InMemoryProductRepository implements ProductRepository {
    private final List<Product> products = new ArrayList<>();

    public InMemoryProductRepository() {
        products.add(new Product(1L, "Notebook", 1250.50));
        products.add(new Product(2L, "Mouse", 25.99));
    }

    @Override
    public List<Product> findAll() {
        return products;
    }

    @Override
    public Product findById(Long id) {
        return products.stream()
                .filter(product -> product.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    @Override
    public Product save(Product product) {
        products.add(product);
        return product;
    }
}
```

## Por qué esto puede ser valioso

Porque desacopla aún más la aplicación de una implementación concreta.

El service puede depender de la abstracción:

```java
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
}
```

Eso deja abierta la puerta a cambiar la implementación más adelante.

## Repositories y JPA

Más adelante, cuando llegues a persistencia relacional y JPA, esta idea se vuelve todavía más fuerte.

Ahí vas a ver cosas como interfaces que extienden repositorios de Spring Data JPA, por ejemplo:

```java
public interface ProductRepository extends JpaRepository<Product, Long> {
}
```

No hace falta profundizar todavía, pero conviene ver que el concepto de repository que estás aprendiendo ahora es exactamente la base de eso.

## Qué ganás al entenderlo antes de JPA

Ganás claridad conceptual.

Si aprendieras `JpaRepository` sin entender antes el rol de la capa repository, muchas cosas parecerían magia o convenciones arbitrarias.

En cambio, ahora ya sabés qué problema intenta resolver esa capa.

## Repositories y testing

Otra ventaja muy importante es que los repositories ayudan a testear mejor.

Por ejemplo, en tests de servicios podés:

- usar una implementación fake
- mockear el repository
- aislar mejor la lógica del service

Eso mejora bastante la calidad del proyecto.

## Ejemplo más cercano a dominio

Supongamos una API de usuarios.

Podrías tener:

- `UserRepository`
- `UserService`
- `UserController`

### Repository

Se encarga de guardar y buscar usuarios.

### Service

Se encarga de decidir cosas como:

- username obligatorio
- email único
- validaciones del dominio

### Controller

Se encarga de recibir requests y devolver responses.

## Buenas prácticas iniciales

## 1. No mezclar HTTP dentro del repository

El repository no debería saber de rutas, requests o status codes.

## 2. No meter reglas de negocio pesadas dentro del repository

Eso suele pertenecer al service.

## 3. Mantener nombres claros

Métodos como:

- `findAll`
- `findById`
- `save`
- `deleteById`

suelen ser muy expresivos.

## 4. Pensar el repository como capa técnica, no como centro del dominio

El dominio no debería depender enteramente de detalles de persistencia.

## 5. Aprovechar la separación incluso en proyectos chicos

Aunque el ejemplo sea pequeño, practicar esta separación te prepara para proyectos reales.

## Ejemplo completo con delete

### Repository

```java
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class ProductRepository {
    private final List<Product> products = new ArrayList<>();

    public ProductRepository() {
        products.add(new Product(1L, "Notebook", 1250.50));
        products.add(new Product(2L, "Mouse", 25.99));
    }

    public List<Product> findAll() {
        return products;
    }

    public Product findById(Long id) {
        return products.stream()
                .filter(product -> product.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public Product save(Product product) {
        products.add(product);
        return product;
    }

    public boolean deleteById(Long id) {
        return products.removeIf(product -> product.getId().equals(id));
    }
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

    public List<Product> getProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        Product product = productRepository.findById(id);

        if (product == null) {
            throw new ResourceNotFoundException("Producto no encontrado");
        }

        return product;
    }

    public Product createProduct(Product product) {
        if (product.getPrice() < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        boolean deleted = productRepository.deleteById(id);

        if (!deleted) {
            throw new ResourceNotFoundException("Producto no encontrado");
        }
    }
}
```

### Controller

```java
import org.springframework.http.ResponseEntity;
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
```

## Qué demuestra este ejemplo

Demuestra cómo repository, service y controller cooperan sin pisarse responsabilidades.

Eso es exactamente el tipo de orden que se busca en una aplicación backend mantenible.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a una capa de acceso a datos separada de handlers y lógica de negocio. En Java y Spring, esta separación suele formalizarse mucho más porque escala mejor en proyectos medianos y grandes.

### Si venís de Python

Puede parecerse a repositorios o adapters de persistencia en diseños más limpios. En Java, esta idea encaja muy bien con Spring y se vuelve aún más fuerte cuando entra JPA.

## Errores comunes

### 1. Meter lógica de negocio pesada dentro del repository

Eso debilita el papel del service.

### 2. Saltarse la capa repository y acceder a datos desde cualquier lado

Eso aumenta acoplamiento y desorden.

### 3. Hacer que el repository conozca detalles HTTP

La capa de datos no debería preocuparse por eso.

### 4. Usar nombres poco claros

Métodos confusos vuelven la capa menos expresiva.

### 5. Creer que repository “solo importa cuando hay base de datos”

Incluso con almacenamiento simple, entender esta separación ya aporta mucho.

## Mini ejercicio

Diseñá una pequeña API de usuarios con:

1. `UserRepository`
2. `UserService`
3. `UserController`

Hacé que el repository pueda:

- listar usuarios
- buscar por id
- guardar usuario
- eliminar usuario por id

Y que el service:

- valide username no vacío
- lance excepción si el usuario no existe al buscar o eliminar

## Ejemplo posible

```java
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class UserRepository {
    private final List<User> users = new ArrayList<>();

    public List<User> findAll() {
        return users;
    }

    public User findById(Long id) {
        return users.stream()
                .filter(user -> user.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public User save(User user) {
        users.add(user);
        return user;
    }

    public boolean deleteById(Long id) {
        return users.removeIf(user -> user.getId().equals(id));
    }
}
```

## Resumen

En esta lección viste que:

- un repository se encarga del acceso a datos
- ayuda a separar persistencia de lógica de negocio y de HTTP
- normalmente expone operaciones como buscar, guardar, listar y eliminar
- controller, service y repository forman una estructura muy usada en Spring Boot
- entender bien esta capa prepara directamente el camino para JPA y bases de datos reales
- una buena separación mejora mantenibilidad, claridad y testing

## Siguiente tema

En la próxima lección conviene pasar a **JPA**, porque después de entender bien el rol del repository, el siguiente paso natural es aprender a persistir entidades reales en bases de datos relacionales desde Java.
