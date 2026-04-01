---
title: "Controllers"
description: "Cómo recibir requests HTTP y exponer endpoints en Spring Boot usando controladores."
order: 30
module: "Backend web"
level: "intermedio"
draft: false
---

## Introducción

En la lección anterior viste qué es Spring Boot y por qué es tan importante para construir aplicaciones backend modernas en Java.

Ahora toca profundizar en una de las piezas más visibles de una API Spring Boot: los controllers.

Los controllers son la capa que recibe las requests HTTP y devuelve responses.

Si querés construir APIs REST con Java, entender bien controllers es fundamental.

## Qué es un controller

Un controller es una clase que expone endpoints HTTP.

Dicho simple:

- recibe requests del cliente
- interpreta datos de entrada
- delega trabajo a otras capas si corresponde
- devuelve una response

En una aplicación Spring Boot, el controller suele ser la puerta de entrada web.

## La idea general

Supongamos que un cliente hace esta request:

```text
GET /products
```

Alguien del lado del backend tiene que:

- recibir esa request
- decidir qué método manejará esa ruta
- ejecutar lógica
- devolver una respuesta

Ese “alguien” es el controller.

## `@RestController`

La anotación más típica para APIs es:

```java
@RestController
```

Ejemplo:

```java
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
}
```

## Qué significa `@RestController`

Le indica a Spring que esa clase:

- participa del manejo web
- expone endpoints
- devuelve datos directamente como response body

En APIs REST modernas, esto es muy común.

## Primer endpoint simple

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hola desde Spring Boot";
    }
}
```

## Qué está pasando acá

### `@RestController`

Marca la clase como controller REST.

### `@GetMapping("/hello")`

Indica que este método responde a requests `GET` sobre `/hello`.

### `public String hello()`

Es el método que se ejecuta cuando entra esa request.

## Qué devuelve

Si hacés una request a:

```text
GET http://localhost:8080/hello
```

la respuesta será:

```text
Hola desde Spring Boot
```

## `@RequestMapping`

También existe una anotación más general:

```java
@RequestMapping
```

Se usa mucho para definir un prefijo común en el controller.

Ejemplo:

```java
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/products")
public class ProductController {
}
```

## Qué ventaja tiene eso

Te evita repetir el prefijo en cada endpoint.

Por ejemplo, después podrías tener:

- `GET /products`
- `GET /products/{id}`
- `POST /products`

## `@GetMapping`

Se usa para manejar requests `GET`.

Ejemplo:

```java
@GetMapping
public String getAll() {
    return "Lista de productos";
}
```

Si la clase tiene:

```java
@RequestMapping("/products")
```

entonces este método responde a:

```text
GET /products
```

## `@PostMapping`

Se usa para manejar requests `POST`.

Ejemplo:

```java
@PostMapping
public String create() {
    return "Producto creado";
}
```

Con `@RequestMapping("/products")`, eso respondería a:

```text
POST /products
```

## Otras anotaciones importantes

También existen:

- `@PutMapping`
- `@PatchMapping`
- `@DeleteMapping`

Y responden a:

- `PUT`
- `PATCH`
- `DELETE`

respectivamente.

## Ejemplo CRUD simple

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
public class ProductController {

    @GetMapping
    public String getAllProducts() {
        return "Obtener todos los productos";
    }

    @GetMapping("/{id}")
    public String getProductById() {
        return "Obtener un producto por id";
    }

    @PostMapping
    public String createProduct() {
        return "Crear producto";
    }

    @PutMapping("/{id}")
    public String updateProduct() {
        return "Actualizar producto";
    }

    @DeleteMapping("/{id}")
    public String deleteProduct() {
        return "Eliminar producto";
    }
}
```

## `@PathVariable`

Cuando una ruta tiene una parte dinámica como:

```text
/products/10
```

podés capturar ese valor usando `@PathVariable`.

Ejemplo:

```java
@GetMapping("/{id}")
public String getProductById(@PathVariable Long id) {
    return "Producto con id: " + id;
}
```

## Qué hace esto

Si llega una request a:

```text
GET /products/10
```

Spring toma el valor `10` de la URL y lo pasa al parámetro `id`.

## `@RequestParam`

Cuando querés leer query parameters, usás `@RequestParam`.

Ejemplo:

```java
@GetMapping("/search")
public String searchProduct(@RequestParam String name) {
    return "Buscar producto: " + name;
}
```

## Qué request lo activa

```text
GET /products/search?name=notebook
```

En ese caso, `name` vale `"notebook"`.

## `@RequestBody`

Cuando querés recibir datos JSON en el body de la request, usás `@RequestBody`.

Ejemplo:

```java
@PostMapping
public Product createProduct(@RequestBody Product product) {
    return product;
}
```

## Qué hace esto

Spring toma el JSON del body y lo convierte en un objeto Java.

Por ejemplo, si el cliente envía:

```json
{
  "id": 1,
  "name": "Notebook",
  "price": 1250.50
}
```

Spring puede mapear eso al objeto `Product`.

## Clase `Product` de ejemplo

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

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}
```

## Por qué hacen falta getters, setters y constructor vacío

Cuando Spring convierte JSON a objetos Java, suele necesitar una estructura compatible para poder crear y poblar el objeto.

En esta etapa, conviene pensar que:

- constructor vacío
- getters
- setters

ayudan a que el mapeo sea cómodo y compatible.

## Devolver objetos y listas

Los controllers no solo devuelven `String`.

También pueden devolver:

- objetos
- listas
- maps
- DTOs
- respuestas más complejas

Ejemplo:

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    @GetMapping
    public List<Product> getProducts() {
        return List.of(
            new Product(1L, "Notebook", 1250.50),
            new Product(2L, "Mouse", 25.99)
        );
    }
}
```

## Qué devuelve esto

Spring convierte automáticamente esa lista de objetos Java a JSON.

Response posible:

```json
[
  {
    "id": 1,
    "name": "Notebook",
    "price": 1250.5
  },
  {
    "id": 2,
    "name": "Mouse",
    "price": 25.99
  }
]
```

## `@ResponseStatus`

A veces querés indicar explícitamente un código de estado HTTP.

Ejemplo:

```java
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;

@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public Product createProduct(@RequestBody Product product) {
    return product;
}
```

## Qué hace esto

Hace que la response use status:

```text
201 Created
```

en vez de depender solo del comportamiento por defecto.

## `ResponseEntity`

Otra herramienta muy importante es `ResponseEntity`.

Sirve para controlar mejor:

- status code
- body
- headers

Ejemplo:

```java
import org.springframework.http.ResponseEntity;

@GetMapping("/{id}")
public ResponseEntity<Product> getProductById(@PathVariable Long id) {
    Product product = new Product(id, "Notebook", 1250.50);
    return ResponseEntity.ok(product);
}
```

## Por qué es útil `ResponseEntity`

Porque te da más control que simplemente devolver un objeto directo.

Por ejemplo, podés hacer cosas como:

```java
return ResponseEntity.notFound().build();
```

o

```java
return ResponseEntity.status(201).body(product);
```

## Ejemplo con `404 Not Found`

```java
@GetMapping("/{id}")
public ResponseEntity<Product> getProductById(@PathVariable Long id) {
    if (id <= 0) {
        return ResponseEntity.notFound().build();
    }

    Product product = new Product(id, "Notebook", 1250.50);
    return ResponseEntity.ok(product);
}
```

## Controllers y capa service

Esto es muy importante.

Aunque los controllers reciben requests, no deberían contener toda la lógica del negocio.

Por ejemplo, esto sería una mejor estructura:

- controller recibe la request
- service decide la lógica
- controller devuelve la response

## Ejemplo conceptual

### Controller

```java
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

### Service

```java
import java.util.List;

public class ProductService {
    public List<Product> getProducts() {
        return List.of(
            new Product(1L, "Notebook", 1250.50),
            new Product(2L, "Mouse", 25.99)
        );
    }
}
```

## Qué idea importante hay acá

El controller debería enfocarse en:

- request
- response
- parámetros
- body
- status codes

No en toda la lógica de negocio.

## `@RequestParam` opcional

También podés marcar parámetros como opcionales.

Ejemplo:

```java
@GetMapping("/search")
public String search(@RequestParam(required = false) String name) {
    return "Buscar: " + name;
}
```

Si el query param no viene, `name` puede quedar en `null`.

## `@PathVariable` con nombres

También podés ser explícito:

```java
@GetMapping("/{id}")
public String getById(@PathVariable("id") Long productId) {
    return "Producto: " + productId;
}
```

Esto puede servir cuando el nombre del parámetro Java no coincide exactamente con la variable de la ruta.

## Diferencia entre `@Controller` y `@RestController`

Esto conviene saberlo desde ahora.

### `@Controller`

Se usa más en aplicaciones MVC tradicionales donde querés devolver vistas.

### `@RestController`

Se usa para APIs REST donde querés devolver datos directamente.

En este curso, para backend API moderno, `@RestController` va a ser lo más frecuente.

## Ejemplo completo

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    @GetMapping
    public List<Product> getProducts() {
        return List.of(
            new Product(1L, "Notebook", 1250.50),
            new Product(2L, "Mouse", 25.99)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        if (id <= 0) {
            return ResponseEntity.notFound().build();
        }

        Product product = new Product(id, "Notebook", 1250.50);
        return ResponseEntity.ok(product);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product createProduct(@RequestBody Product product) {
        return product;
    }

    @GetMapping("/search")
    public String searchProduct(@RequestParam String name) {
        return "Buscar producto: " + name;
    }
}
```

## Qué demuestra este ejemplo

Demuestra varias cosas fundamentales a la vez:

- prefijo común con `@RequestMapping`
- endpoint `GET`
- endpoint `POST`
- uso de `@PathVariable`
- uso de `@RequestParam`
- uso de `@RequestBody`
- uso de `ResponseEntity`
- control de status code

## Relación con lo ya aprendido

Todo esto conecta directamente con:

- HTTP → métodos, rutas, status codes
- JSON → request y response body
- API REST → diseño basado en recursos
- Spring Boot → framework que facilita toda esta integración

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a handlers en frameworks backend, pero Spring hace muy explícita la relación entre anotaciones, rutas, parámetros y respuestas.

### Si venís de Python

Puede parecerse a cómo se definen rutas y funciones en frameworks web, pero en Java el sistema de tipos y el mapeo a objetos suele estar más integrado con clases y DTOs.

## Errores comunes

### 1. Meter toda la lógica en el controller

Eso vuelve el código difícil de mantener.

### 2. Confundir `@PathVariable` con `@RequestParam`

Uno toma datos del path.
El otro toma datos de query params.

### 3. No entender que `@RequestBody` depende del JSON recibido

Si el JSON no coincide razonablemente con el objeto esperado, puede fallar.

### 4. Devolver siempre `String` por costumbre

En APIs reales, muchas veces vas a devolver objetos, listas, DTOs o `ResponseEntity`.

### 5. No pensar los status codes

La respuesta no es solo el body; el status code comunica muchísimo.

## Mini ejercicio

Diseñá un `UserController` con:

1. `GET /users`
2. `GET /users/{id}`
3. `POST /users`
4. `GET /users/search?name=...`

Y usá en el ejemplo:

- `@RestController`
- `@RequestMapping`
- `@GetMapping`
- `@PostMapping`
- `@PathVariable`
- `@RequestParam`
- `@RequestBody`

## Ejemplo posible

```java
@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping
    public List<User> getUsers() {
        return List.of(
            new User(1L, "Ana"),
            new User(2L, "Luis")
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        if (id <= 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(new User(id, "Ana"));
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return user;
    }

    @GetMapping("/search")
    public String searchUser(@RequestParam String name) {
        return "Buscar usuario: " + name;
    }
}
```

## Resumen

En esta lección viste que:

- un controller recibe requests HTTP y devuelve responses
- `@RestController` se usa para APIs REST
- `@RequestMapping` define prefijos comunes
- `@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping` y `@DeleteMapping` manejan métodos HTTP
- `@PathVariable`, `@RequestParam` y `@RequestBody` permiten capturar distintos tipos de datos de entrada
- `ResponseEntity` permite controlar mejor la respuesta
- los controllers deberían enfocarse en la capa web y delegar la lógica de negocio

## Siguiente tema

En la próxima lección conviene pasar a **services**, porque después de entender cómo entra una request al sistema, el siguiente paso natural es separar y modelar la lógica de negocio en una capa más limpia y reutilizable.
