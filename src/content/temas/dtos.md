---
title: "DTOs"
description: "Qué son los DTOs, por qué son importantes en una API Spring Boot y cómo ayudan a separar mejor la capa web del modelo interno."
order: 32
module: "Backend web"
level: "intermedio"
draft: false
---

## Introducción

En la lección anterior viste la capa service, o sea, el lugar donde suele vivir la lógica de negocio.

Eso ayuda a que los controllers no se llenen de reglas y decisiones del sistema.

Ahora aparece otra pieza muy importante en aplicaciones backend bien diseñadas: los DTOs.

DTO significa:

**Data Transfer Object**

Los DTOs ayudan a controlar mejor qué datos entran y salen de la API.

## Qué es un DTO

Un DTO es un objeto pensado para transportar datos entre capas o entre sistemas.

Dicho simple:

- representa datos que viajan
- no está pensado para contener lógica de negocio compleja
- suele usarse en requests y responses
- ayuda a no exponer directamente ciertas clases internas del sistema

## La idea general

Supongamos que tenés esta clase de dominio:

```java
public class User {
    private Long id;
    private String username;
    private String email;
    private String password;
    private boolean active;

    // constructores, getters, setters
}
```

Ahora imaginá que querés devolver un usuario en una API.

Si devolvés directamente esa clase, podrías estar exponiendo datos que no querés mostrar, como por ejemplo:

- password
- campos internos
- estructuras que no deberían salir de la API

Ahí un DTO se vuelve muy útil.

## Qué problema resuelve un DTO

Un DTO ayuda a resolver problemas como estos:

- exponer campos de más
- acoplar demasiado la API al modelo interno
- mezclar entrada y salida con entidades del dominio
- dificultar la evolución de la API
- volver más frágil el diseño

## Ejemplo intuitivo

En vez de devolver directamente `User`, podés crear un DTO para la respuesta:

```java
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;

    public UserResponseDto(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }
}
```

## Qué gana este diseño

Ahora la API solo expone:

- id
- username
- email

Y no expone:

- password
- flags internos innecesarios
- detalles del modelo que no deberían salir

## DTO de request y DTO de response

Muchas veces conviene distinguir dos tipos de DTO:

### Request DTO

Representa datos que entran a la API.

### Response DTO

Representa datos que salen de la API.

Eso permite diseñar mejor la entrada y la salida según cada caso.

## Ejemplo de request DTO

```java
public class CreateUserRequestDto {
    private String username;
    private String email;
    private String password;

    public CreateUserRequestDto() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
```

## Ejemplo de response DTO

```java
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;

    public UserResponseDto(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }
}
```

## Por qué separar request y response

Porque lo que entra no siempre coincide con lo que sale.

Por ejemplo:

### Al crear usuario, entra:

- username
- email
- password

### Al devolver usuario, quizá salga:

- id
- username
- email

Y claramente no querés devolver la password.

## DTOs y controllers

Los DTOs aparecen muchísimo en controllers.

Por ejemplo:

```java
@RestController
@RequestMapping("/users")
public class UserController {
    @PostMapping
    public UserResponseDto createUser(@RequestBody CreateUserRequestDto request) {
        // ...
        return null;
    }
}
```

## Qué expresa esto

El controller ya no depende directamente de una clase de dominio cruda para representar la entrada y la salida web.

Eso mejora mucho el diseño.

## DTOs y services

Los services también pueden trabajar con DTOs, aunque depende del estilo de diseño del proyecto.

En muchos casos, el flujo es algo así:

- controller recibe request DTO
- service transforma o procesa
- service devuelve datos
- controller arma response DTO

O también:

- controller recibe request DTO
- lo transforma a modelo interno
- service trabaja con modelo interno
- controller transforma a response DTO

## Idea importante

No hay una única forma válida para todos los proyectos.

Lo importante es entender el objetivo:

**separar mejor la capa web del modelo interno**.

## DTO no es entidad

Esto conviene tenerlo muy claro.

Un DTO no es lo mismo que una entidad de dominio o de persistencia.

### DTO

Se usa para transportar datos.

### Entidad / modelo interno

Representa el dominio o la persistencia real del sistema.

Si confundís ambas cosas, el diseño se empieza a mezclar demasiado.

## Ejemplo comparativo

### Entidad interna

```java
public class User {
    private Long id;
    private String username;
    private String email;
    private String password;
    private boolean active;

    public User(Long id, String username, String email, String password, boolean active) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public boolean isActive() {
        return active;
    }
}
```

### DTO de salida

```java
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;

    public UserResponseDto(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }
}
```

## Mapping

Cuando usás DTOs, aparece una tarea importante:

**mapear**

O sea:
convertir entre una estructura y otra.

Por ejemplo:

- de request DTO a entidad
- de entidad a response DTO

## Ejemplo de mapping manual

```java
public class UserMapper {
    public static UserResponseDto toResponseDto(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }
}
```

## Mapping desde request DTO a modelo interno

```java
public class UserMapper {
    public static User toUser(CreateUserRequestDto request) {
        return new User(
                null,
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                true
        );
    }
}
```

## Por qué esto sirve

Porque hace explícita la conversión entre capas.

Eso ayuda a:

- controlar qué campos se usan
- evitar exponer datos sensibles
- mantener clara la intención del diseño

## Ejemplo de controller usando DTOs

```java
@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public UserResponseDto createUser(@RequestBody CreateUserRequestDto request) {
        User createdUser = userService.createUser(request);
        return new UserResponseDto(
                createdUser.getId(),
                createdUser.getUsername(),
                createdUser.getEmail()
        );
    }
}
```

## Ejemplo de service

```java
import org.springframework.stereotype.Service;

@Service
public class UserService {

    public User createUser(CreateUserRequestDto request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new IllegalArgumentException("El username es obligatorio");
        }

        return new User(
                1L,
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                true
        );
    }
}
```

## Qué muestra este ejemplo

Muestra que:

- la API recibe un request DTO
- el service procesa esos datos
- el controller devuelve un response DTO
- la clase `User` interna no se expone directamente tal cual

## DTOs y validación

Los DTOs de request son muy buenos lugares para representar los datos que deben validarse.

Por ejemplo:

- username obligatorio
- email válido
- password mínima

Más adelante, cuando veas validaciones con anotaciones, esto va a ser todavía más claro.

## DTOs y evolución de la API

Otra ventaja fuerte es que ayudan a evolucionar la API sin romper tanto el modelo interno.

Por ejemplo:

- podés cambiar detalles internos de la entidad
- sin cambiar necesariamente el contrato externo de la API

O al revés:
podés diseñar una response distinta para clientes sin tocar demasiado el corazón del dominio.

## DTOs específicos por caso de uso

No siempre tiene sentido tener un solo DTO por entidad.

A veces conviene tener varios según el caso:

- `CreateUserRequestDto`
- `UpdateUserRequestDto`
- `UserResponseDto`
- `UserSummaryDto`

¿Por qué?
Porque distintos endpoints pueden necesitar estructuras distintas.

## Ejemplo conceptual

### Para listar usuarios

Quizá solo quieras:

- id
- username

### Para detalle de usuario

Quizá quieras:

- id
- username
- email
- active

Eso puede justificar DTOs distintos para respuestas distintas.

## DTOs y seguridad

Los DTOs ayudan mucho a no exponer datos sensibles accidentalmente.

Por ejemplo, no querés devolver:

- password
- tokens internos
- claves técnicas
- flags privados de seguridad
- IDs internos que no deberían salir

Con DTOs, ese control es mucho más explícito.

## DTOs y acoplamiento

Si tu API depende directamente de entidades internas en todos lados, el acoplamiento crece.

Los DTOs ayudan a desacoplar:

- capa web
- capa de negocio
- persistencia
- contrato de la API

Eso es muy valioso a medida que el proyecto crece.

## DTOs en proyectos chicos

En proyectos muy pequeños, a veces da la tentación de “saltearse” DTOs para ir más rápido.

Eso puede funcionar al principio.

Pero cuanto más crece la aplicación, más valor suele aportar una separación mejor cuidada.

## Ejemplo completo

### Request DTO

```java
public class CreateProductRequestDto {
    private String name;
    private double price;

    public CreateProductRequestDto() {
    }

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}
```

### Response DTO

```java
public class ProductResponseDto {
    private Long id;
    private String name;
    private double price;

    public ProductResponseDto(Long id, String name, double price) {
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

### Modelo interno

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

### Service

```java
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    public Product createProduct(CreateProductRequestDto request) {
        if (request.getPrice() < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }

        return new Product(
                1L,
                request.getName(),
                request.getPrice(),
                true
        );
    }
}
```

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
    public ProductResponseDto createProduct(@RequestBody CreateProductRequestDto request) {
        Product product = productService.createProduct(request);

        return new ProductResponseDto(
                product.getId(),
                product.getName(),
                product.getPrice()
        );
    }
}
```

## Qué demuestra este ejemplo

Demuestra una separación bastante sana entre:

- entrada web
- modelo interno
- salida web

Eso es exactamente el tipo de orden que los DTOs ayudan a construir.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a definir esquemas de entrada y salida o a separar payloads de objetos internos. En Java y Spring esta separación suele tomar mucha forma con clases explícitas y tipadas.

### Si venís de Python

Puede parecerse a usar modelos distintos para request y response. En Java, los DTOs encajan muy bien con el sistema de tipos y con la claridad arquitectónica que suele buscarse en proyectos medianos y grandes.

## Errores comunes

### 1. Exponer entidades internas directamente sin pensar

Eso puede filtrar datos que no querías mostrar.

### 2. Usar un solo DTO para todo

A veces conviene separar request y response, o incluso tener varios DTOs por caso de uso.

### 3. Duplicar sin criterio

No se trata de crear clases extras por deporte, sino de separar responsabilidades cuando aporta claridad.

### 4. Mezclar lógica de negocio dentro del DTO

El DTO está pensado para transportar datos, no para convertirse en el centro del dominio.

### 5. No mapear con claridad

Si la conversión entre capas está desordenada, el beneficio de usar DTOs baja mucho.

## Mini ejercicio

Diseñá una API simple de usuarios usando:

1. `CreateUserRequestDto`
2. `UserResponseDto`
3. una clase `User`
4. un `UserService`
5. un `UserController`

Intentá que:

- el request DTO tenga `username`, `email` y `password`
- el response DTO devuelva `id`, `username` y `email`
- la clase `User` interna tenga también `active`

## Ejemplo posible

```java
public class CreateUserRequestDto {
    private String username;
    private String email;
    private String password;

    public CreateUserRequestDto() {
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
```

```java
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;

    public UserResponseDto(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }
}
```

## Resumen

En esta lección viste que:

- un DTO es un objeto pensado para transportar datos
- request DTO y response DTO suelen tener roles distintos
- los DTOs ayudan a no exponer directamente el modelo interno
- mejoran seguridad, claridad y desacoplamiento
- suelen usarse muchísimo en controllers y APIs Spring Boot
- mapear entre DTOs y modelos internos es una parte importante del diseño
- usar DTOs prepara muy bien el camino para validaciones y APIs más robustas

## Siguiente tema

En la próxima lección conviene pasar a **validaciones**, porque después de separar bien entrada, salida y lógica de negocio, el siguiente paso natural es controlar formalmente qué datos son válidos antes de procesarlos.
