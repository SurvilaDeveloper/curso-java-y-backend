---
title: "Services"
description: "Cómo separar la lógica de negocio en Spring Boot usando la capa service y por qué eso mejora el diseño de una aplicación."
order: 31
module: "Backend web"
level: "intermedio"
draft: false
---

## Introducción

En la lección anterior viste controllers, o sea, la capa que recibe requests HTTP y devuelve responses.

Eso te permitió entender cómo una API expone endpoints y cómo Spring Boot mapea rutas, parámetros y bodies.

Pero si empezaras a poner toda la lógica dentro del controller, el diseño se volvería rápidamente difícil de mantener.

Por eso aparece una capa muy importante en el backend moderno: la capa service.

## Qué es un service

Un service es una clase que encapsula lógica de negocio.

Dicho simple:

- el controller maneja la parte web
- el service maneja la lógica del sistema

Esto ayuda a que cada capa tenga una responsabilidad más clara.

## La idea general

Supongamos que un cliente hace esta request:

```text
POST /products
```

El controller puede:

- recibir el JSON
- convertirlo a objeto Java
- delegar la lógica

Y el service puede encargarse de cosas como:

- validar reglas de negocio
- transformar datos
- decidir operaciones
- coordinar acceso a datos
- aplicar lógica reutilizable

## Qué problema resuelve la capa service

Sin capa service, suele pasar esto:

- controllers enormes
- lógica repetida
- validaciones duplicadas
- menor reutilización
- más acoplamiento entre web y negocio

La capa service ayuda a separar mejor esas responsabilidades.

## Responsabilidad típica de cada capa

## Controller

Se ocupa de:

- endpoints
- request / response
- status codes
- parámetros
- JSON
- interacción web

## Service

Se ocupa de:

- lógica de negocio
- validaciones del dominio
- decisiones del sistema
- coordinación entre objetos y repositorios

## Repository

Se ocupa de:

- acceso a datos
- persistencia
- consultas
- guardado y lectura

## Regla práctica útil

Una forma simple de pensarlo es esta:

- controller → entrada y salida HTTP
- service → reglas y lógica
- repository → datos

## Ejemplo sin service

Esto funciona, pero no es una buena dirección si el proyecto crece:

```java
@RestController
@RequestMapping("/products")
public class ProductController {

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        if (product.getPrice() < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }

        return product;
    }
}
```

## Qué problema tiene este enfoque

El controller está tomando demasiadas responsabilidades.

Está mezclando:

- capa web
- validación de negocio
- posible lógica de persistencia futura

Eso conviene moverlo a un service.

## Ejemplo con service

### Controller

```java
@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }
}
```

### Service

```java
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    public Product createProduct(Product product) {
        if (product.getPrice() < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }

        return product;
    }
}
```

## Qué mejora con esto

Ahora el controller queda más limpio.

Solo se ocupa de recibir la request y delegar.

La lógica importante queda concentrada en el service.

## `@Service`

La anotación más típica para esta capa es:

```java
@Service
```

Ejemplo:

```java
import org.springframework.stereotype.Service;

@Service
public class ProductService {
}
```

## Qué significa `@Service`

Le indica a Spring que esta clase forma parte de la capa de servicio y que debería ser gestionada como componente dentro del contexto de la aplicación.

En términos prácticos, eso permite que Spring la detecte y la inyecte donde haga falta.

## Inyección de dependencias en services

Igual que viste con controllers, los services suelen recibir sus dependencias por constructor.

Ejemplo:

```java
@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
}
```

## Por qué esto importa

Porque el service no debería crear manualmente todas sus dependencias con `new`.

Recibirlas desde afuera mejora:

- desacoplamiento
- testabilidad
- flexibilidad
- claridad del diseño

## Services como lugar de lógica reutilizable

Una gran ventaja de los services es que permiten centralizar lógica que puede ser usada por varios controllers o varios flujos del sistema.

Ejemplo:

- calcular precios finales
- validar stock
- cambiar estado de una orden
- registrar eventos
- aplicar descuentos

Todo eso suele tener mucho más sentido en un service que en un controller.

## Ejemplo práctico

Supongamos un e-commerce.

Podrías tener lógica como:

- crear producto
- listar productos
- buscar por id
- actualizar precio
- validar que el precio no sea negativo

Todo eso encaja bien en un `ProductService`.

## Ejemplo completo simple

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

### Service

```java
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {
    private final List<Product> products = new ArrayList<>();

    public ProductService() {
        products.add(new Product(1L, "Notebook", 1250.50));
        products.add(new Product(2L, "Mouse", 25.99));
    }

    public List<Product> getProducts() {
        return products;
    }

    public Product getProductById(Long id) {
        return products.stream()
                .filter(product -> product.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public Product createProduct(Product product) {
        if (product.getPrice() < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }

        products.add(product);
        return product;
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

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);

        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(product);
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(product);
    }
}
```

## Qué demuestra este ejemplo

Demuestra una separación básica muy importante:

- controller → capa web
- service → lógica y manejo de productos

Aunque todavía no hay base de datos, ya hay una estructura bastante más sana que meter todo en el controller.

## Services y validaciones

Las validaciones de negocio suelen vivir muy bien en services.

Por ejemplo:

- precio no negativo
- usuario bloqueado no puede comprar
- orden ya enviada no puede cancelarse
- stock insuficiente impide confirmar compra

Eso no depende tanto de HTTP, sino de las reglas del sistema.

Por eso es una buena señal cuando esa lógica vive en services.

## Services y reglas de negocio

Conviene distinguir entre:

### Validación técnica o de entrada

Por ejemplo:
un body mal formado o un parámetro ausente.

### Validación de negocio

Por ejemplo:
“no se puede cancelar una orden entregada”.

La validación de negocio suele tener mucho sentido en la capa service.

## Services y controllers delgados

Vas a escuchar mucho la idea de “controllers delgados” o “thin controllers”.

Significa que el controller debería hacer poco trabajo directamente y delegar la lógica importante.

Eso no es una ley absoluta, pero sí una muy buena dirección de diseño.

## Services y repositories

Más adelante, cuando sumes persistencia real, el service normalmente se ubicará entre controller y repository.

Flujo típico:

- controller recibe request
- service procesa lógica
- repository accede a datos
- service decide la respuesta de negocio
- controller devuelve response

## Ejemplo conceptual con repository

```java
@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product createProduct(Product product) {
        if (product.getPrice() < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }

        return productRepository.save(product);
    }
}
```

## Por qué no poner todo en repository

Porque repository no debería encargarse de reglas de negocio.

El repository guarda, busca, consulta.

El service decide qué tiene sentido hacer según las reglas del sistema.

## Services y testing

Otra razón por la que los services son tan importantes es que suelen ser un lugar excelente para testear lógica.

Es más fácil testear un service bien separado que lógica enredada dentro de un controller.

Por eso esta capa también mejora mucho la calidad del proyecto.

## Methods típicos de un service

Dependiendo del caso, un service puede tener métodos como:

- `createProduct(...)`
- `getProductById(...)`
- `updateProduct(...)`
- `deleteProduct(...)`
- `changeOrderStatus(...)`
- `registerUser(...)`
- `calculateTotal(...)`

Cada uno expresa una operación del dominio, no solo una operación HTTP.

## Services y nombres expresivos

Un buen service no solo mueve lógica fuera del controller.
También ayuda a que el código se lea mejor.

Por ejemplo, esto:

```java
orderService.cancelOrder(orderId);
```

es mucho más expresivo que tener esa lógica escondida entre varias líneas dentro de un controller.

## Services y transacciones

Más adelante, cuando trabajes con base de datos y JPA, los services suelen ser un lugar muy natural para manejar transacciones.

No hace falta profundizar ahora, pero conviene saber que la capa service también es importante por eso.

## Ejemplo más cercano a negocio

```java
@Service
public class OrderService {

    public void cancelOrder(Order order) {
        if (order.isDelivered()) {
            throw new IllegalStateException("No se puede cancelar una orden entregada");
        }

        order.setStatus("CANCELLED");
    }
}
```

## Qué tiene de valioso este ejemplo

La regla importante del dominio:

“no se puede cancelar una orden entregada”

vive en el service.

Eso tiene mucho más sentido que enterrarla en un controller o en una capa de acceso a datos.

## Services no significan clases gigantes

También hay que evitar el extremo contrario.

No se trata de meter toda la lógica del universo en una clase llamada `ApplicationService`.

Un buen diseño busca services con responsabilidad razonablemente clara.

Ejemplos sanos:

- `ProductService`
- `UserService`
- `OrderService`

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a separar lógica de negocio de handlers o rutas. En Java y Spring esa separación suele volverse especialmente importante a medida que el proyecto crece.

### Si venís de Python

Puede parecerse a una capa de servicios o casos de uso encima de las vistas o endpoints. En Spring Boot esta separación también ayuda mucho a mantener orden y testabilidad.

## Errores comunes

### 1. Meter toda la lógica en el controller

Eso hace el código más frágil y menos reutilizable.

### 2. Crear services que no agregan ninguna separación real

Mover código por moverlo no alcanza. Tiene que haber una responsabilidad clara.

### 3. Mezclar acceso a datos, HTTP y negocio todo junto

Eso dificulta muchísimo mantenimiento y testing.

### 4. Usar services solo como “pasamanos” eternos sin criterio

A veces una simple delegación está bien, pero la capa service gana valor cuando realmente centraliza reglas y coordinación.

### 5. No nombrar bien los métodos del dominio

Los nombres ayudan muchísimo a entender qué está haciendo el sistema.

## Mini ejercicio

Diseñá un `UserService` con operaciones como:

1. listar usuarios
2. buscar usuario por id
3. crear usuario
4. validar que el username no esté vacío
5. devolver `null` o lanzar excepción si algo no es válido, según el caso que elijas

Y usalo desde un `UserController`.

## Ejemplo posible

```java
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {
    private final List<User> users = new ArrayList<>();

    public List<User> getUsers() {
        return users;
    }

    public User getUserById(Long id) {
        return users.stream()
                .filter(user -> user.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public User createUser(User user) {
        if (user.getUsername() == null || user.getUsername().isBlank()) {
            throw new IllegalArgumentException("El username es obligatorio");
        }

        users.add(user);
        return user;
    }
}
```

## Resumen

En esta lección viste que:

- un service encapsula lógica de negocio
- ayuda a que los controllers queden más limpios
- suele encargarse de validaciones de dominio, coordinación y decisiones del sistema
- mejora reutilización, testabilidad y diseño general
- normalmente se ubica entre controller y repository
- es una pieza central de la arquitectura típica en Spring Boot

## Siguiente tema

En la próxima lección conviene pasar a **DTOs**, porque después de separar bien la lógica de negocio, el siguiente paso natural es controlar mejor qué datos entran y salen de la API sin depender directamente de las clases internas del dominio.
