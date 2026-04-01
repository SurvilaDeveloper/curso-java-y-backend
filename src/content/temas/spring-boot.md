---
title: "Spring Boot"
description: "Qué es Spring Boot, por qué es tan importante en backend Java y cómo simplifica la creación de aplicaciones y APIs web."
order: 29
module: "Backend web"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya viste varias piezas que forman la base del backend web moderno:

- HTTP
- JSON
- API REST
- Maven
- orientación a objetos
- manejo de errores
- colecciones
- fechas
- archivos

Todo eso te prepara muy bien para entrar en una de las tecnologías más importantes del ecosistema Java backend: Spring Boot.

Spring Boot no reemplaza el lenguaje ni los fundamentos que ya aprendiste.
Lo que hace es darte una forma mucho más productiva y ordenada de construir aplicaciones reales, especialmente APIs y sistemas backend.

## Qué es Spring Boot

Spring Boot es un framework construido sobre el ecosistema Spring que simplifica muchísimo la creación de aplicaciones Java.

Su objetivo es permitirte arrancar proyectos más rápido, con menos configuración manual y con una estructura muy preparada para desarrollo real.

Se usa muchísimo para:

- APIs REST
- backends web
- sistemas empresariales
- microservicios
- servicios internos
- integraciones con bases de datos, seguridad y mucho más

## La idea general

Antes de Spring Boot, construir una aplicación backend en Java podía implicar bastante configuración repetitiva.

Por ejemplo:

- configurar el servidor
- registrar componentes
- conectar librerías
- definir muchas cosas a mano
- preparar el arranque del proyecto
- resolver integración entre muchas partes del ecosistema

Spring Boot vino a simplificar eso.

Dicho simple:

Spring Boot te deja enfocarte más en la lógica del sistema y menos en la fricción de configuración inicial.

## Qué relación tiene con Spring

Conviene distinguir estas dos ideas:

### Spring

Es el ecosistema y framework base, muy grande y poderoso.

### Spring Boot

Es una capa que facilita el uso de Spring, sobre todo para arrancar proyectos rápidamente y con menos configuración manual.

Una forma útil de pensarlo es:

- Spring es el ecosistema base
- Spring Boot es la forma moderna, práctica y productiva de usarlo en muchísimos proyectos

## Por qué es tan importante

Spring Boot es tan importante porque resolvió de forma muy práctica varios problemas comunes del desarrollo backend Java:

- configuración excesiva
- dificultad para arrancar proyectos
- integración compleja entre componentes
- necesidad de mucho código boilerplate
- fricción para exponer APIs rápidamente

Gracias a eso, hoy es una de las opciones más fuertes y más comunes para backend Java profesional.

## Qué cosas simplifica

Spring Boot simplifica mucho cosas como estas:

- arranque del proyecto
- configuración automática
- servidor embebido
- manejo de dependencias
- exposición de endpoints
- validaciones
- integración con bases de datos
- integración con seguridad
- configuración externa

## Aplicación Spring Boot mínima

Una aplicación mínima puede verse así:

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
```

## Qué está pasando acá

### `@SpringBootApplication`

Es una anotación muy importante.
Marca el punto de entrada principal de una aplicación Spring Boot y activa varias configuraciones automáticas.

### `SpringApplication.run(...)`

Arranca la aplicación.

## Servidor embebido

Una de las cosas más cómodas de Spring Boot es que normalmente podés levantar una aplicación web sin configurar manualmente un servidor externo aparte.

Por ejemplo, al arrancar la app, Spring Boot puede levantar un servidor embebido y dejar la aplicación lista para responder requests HTTP.

Eso hace muchísimo más fluido el desarrollo.

## Autoconfiguración

Una palabra muy importante en Spring Boot es:

**autoconfiguración**

Esto significa que Spring Boot detecta muchas cosas del proyecto y configura automáticamente bastante comportamiento razonable.

Por ejemplo:

- si detecta dependencias web, prepara una aplicación web
- si detecta soporte para JSON, prepara serialización
- si detecta ciertos componentes, los integra automáticamente

No significa que “haga magia infinita”, pero sí que reduce una enorme cantidad de configuración repetitiva.

## Dependencias y starters

Spring Boot usa mucho la idea de starters.

Un starter es una dependencia que agrupa todo lo necesario para cierto tipo de funcionalidad.

Por ejemplo:

- starter web
- starter test
- starter data jpa
- starter security

Esto ayuda muchísimo porque no tenés que elegir manualmente cada librería una por una desde cero.

## Ejemplo conceptual de dependencias en Maven

En un proyecto Spring Boot, el `pom.xml` suele incluir cosas como estas:

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## Qué hace `spring-boot-starter-web`

Ese starter suele traer lo necesario para construir aplicaciones web y APIs REST, incluyendo soporte para:

- servidor embebido
- controladores
- requests y responses HTTP
- JSON
- integración web básica

## Qué hace `spring-boot-starter-test`

Ese starter trae herramientas útiles para testing dentro del ecosistema Spring Boot.

## Proyecto Spring Boot típico

Un proyecto Spring Boot suele organizarse con una estructura bastante clara.

Por ejemplo:

```text
src/main/java/com/example/demo
  DemoApplication.java
  controller/
  service/
  repository/
  model/
  dto/
```

Esto no es una ley absoluta, pero es una forma muy común de organizar responsabilidades.

## Primer endpoint simple

Una de las cosas más lindas de Spring Boot es que podés exponer un endpoint muy rápido.

Ejemplo:

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

Le dice a Spring que esta clase va a manejar endpoints web y devolver respuestas directamente.

### `@GetMapping("/hello")`

Le dice que este método responde a requests `GET` sobre la ruta `/hello`.

## Qué pasa si corrés esta app

Si la aplicación está levantada, y hacés una request como esta:

```text
GET http://localhost:8080/hello
```

la respuesta será algo como:

```text
Hola desde Spring Boot
```

## Por qué este ejemplo importa

Porque muestra muy bien el valor de Spring Boot:

con muy poco código ya tenés una aplicación capaz de exponer un endpoint HTTP real.

## JSON automático

Spring Boot también suele integrarse muy bien con JSON.

Por ejemplo, si devolvés un objeto Java desde un controlador REST, Spring Boot puede convertirlo automáticamente a JSON.

Ejemplo:

```java
public class Product {
    private Long id;
    private String name;
    private double price;

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

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductController {

    @GetMapping("/product")
    public Product getProduct() {
        return new Product(1L, "Notebook", 1250.50);
    }
}
```

## Qué devuelve esto

Si hacés una request a:

```text
GET /product
```

Spring Boot puede responder algo como:

```json
{
  "id": 1,
  "name": "Notebook",
  "price": 1250.5
}
```

## Qué demuestra este ejemplo

Demuestra que Spring Boot integra muy bien:

- HTTP
- Java
- JSON

Y eso lo vuelve ideal para construir APIs REST.

## Recibir datos con `POST`

Además de devolver datos, también podés recibirlos.

Ejemplo conceptual:

```java
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductController {

    @PostMapping("/products")
    public Product createProduct(@RequestBody Product product) {
        return product;
    }
}
```

## Qué está pasando acá

### `@PostMapping("/products")`

Este método responde a requests `POST`.

### `@RequestBody`

Le dice a Spring que convierta el JSON recibido en el body a un objeto Java.

## Qué relación tiene esto con JSON

Esto conecta directamente con lo que ya viste:

- el cliente manda JSON
- Spring Boot lo transforma en objeto Java
- tu método trabaja con ese objeto
- y puede devolver otro objeto que Spring convierte nuevamente a JSON

Ese ciclo es central en el backend moderno con Java.

## Controller, Service y Repository

En Spring Boot aparece mucho una separación por capas.

Una forma muy típica es:

- controller
- service
- repository

## Controller

Recibe requests HTTP y arma responses.

## Service

Contiene lógica de negocio.

## Repository

Se encarga del acceso a datos.

## Idea importante

No todo debería vivir en el controller.

El controller es solo la puerta de entrada web.

La lógica importante suele ir en servicios, y el acceso a datos en repositorios.

Eso mejora muchísimo el diseño.

## Ejemplo conceptual de capas

### Controller

```java
@RestController
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
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

## Inyección de dependencias

Spring Boot trabaja muchísimo con inyección de dependencias.

La idea general es que los objetos no deberían crear manualmente todas sus dependencias internas a cada rato, sino recibirlas de forma controlada.

Eso mejora:

- desacoplamiento
- testabilidad
- mantenibilidad

Más adelante esto merece una lección propia, pero conviene ir viendo desde ahora que es central en el ecosistema Spring.

## Configuración externa

Spring Boot también facilita mucho manejar configuración desde archivos como:

- `application.properties`
- `application.yml`

Ahí más adelante vas a poner cosas como:

- puerto
- conexión a base de datos
- variables de entorno
- configuración del framework

## Por qué encaja tan bien con el roadmap

Todo lo que viste antes prepara directamente este momento.

Por ejemplo:

- POO → para modelar clases, DTOs, servicios y entidades
- Collections → para manejar listas y mapas
- Exceptions → para manejar errores y validaciones
- Maven → para gestionar el proyecto
- HTTP → para entender requests y responses
- JSON → para entender bodies de APIs
- API REST → para entender el estilo de diseño que Spring Boot implementa muy bien

## Spring Boot no reemplaza entender fundamentos

Esto es muy importante.

Spring Boot te da mucha productividad, pero si no entendés:

- Java
- HTTP
- JSON
- REST
- diseño orientado a objetos

todo puede sentirse como magia o como copiar código sin comprenderlo.

Por eso el orden en el que venís estudiando tiene mucho sentido.

## Cómo se suele crear un proyecto Spring Boot

Una forma muy común es usar Spring Initializr, que genera un proyecto base con las dependencias que elijas.

También el IDE muchas veces se integra con eso.

No hace falta entrar en detalle profundo ahora.
Lo importante es entender que Spring Boot tiene una forma muy amigable de arrancar proyectos reales.

## Ejemplo completo conceptual

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

```java
public class Product {
    private Long id;
    private String name;
    private double price;

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

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ProductController {

    @GetMapping("/products")
    public List<Product> getProducts() {
        return List.of(
            new Product(1L, "Notebook", 1250.50),
            new Product(2L, "Mouse", 25.99)
        );
    }
}
```

## Qué hace este mini ejemplo

Te da una aplicación Spring Boot mínima que:

- arranca
- expone un endpoint
- devuelve una lista de objetos Java
- los transforma automáticamente a JSON

Eso ya es un pequeño backend real.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede hacerte pensar en frameworks backend que simplifican rutas, respuestas y estructura de proyecto. La diferencia es que Spring Boot lo hace dentro del ecosistema Java, muy apoyado en tipado fuerte, anotaciones e integración con muchísimas herramientas enterprise.

### Si venís de Python

Podría recordarte a la comodidad de frameworks web modernos, pero en Java Spring Boot tiene un peso especialmente fuerte como estándar de facto para muchísimos proyectos backend.

## Errores comunes

### 1. Pensar que Spring Boot es “Java mágico”

No es magia: abstrae muchísimo, pero sigue apoyándose en conceptos concretos que conviene entender.

### 2. Poner toda la lógica en el controller

Eso suele empeorar diseño y mantenimiento.

### 3. Usar Spring Boot sin entender HTTP o JSON

Después se vuelve difícil depurar o diseñar APIs buenas.

### 4. Copiar anotaciones sin comprender qué hacen

Spring Boot usa muchas anotaciones, pero cada una tiene un propósito.

### 5. Ir demasiado rápido a bases de datos o seguridad sin entender la base web

Conviene avanzar por capas.

## Mini ejercicio

Pensá y escribí un mini diseño para una API de productos en Spring Boot:

1. una clase principal de aplicación
2. una clase `Product`
3. un `ProductController`
4. un endpoint `GET /products`
5. un endpoint `POST /products`

No hace falta conectarlo a base de datos todavía.
La idea es practicar estructura mental y responsabilidades.

## Ejemplo posible

```java
@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

```java
public class Product {
    private Long id;
    private String name;
    private double price;

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

```java
@RestController
public class ProductController {

    @GetMapping("/products")
    public List<Product> getProducts() {
        return List.of(
            new Product(1L, "Notebook", 1250.50)
        );
    }

    @PostMapping("/products")
    public Product createProduct(@RequestBody Product product) {
        return product;
    }
}
```

## Resumen

En esta lección viste que:

- Spring Boot es el framework más importante del ecosistema Java backend moderno
- simplifica muchísimo la creación de aplicaciones y APIs
- reduce configuración manual mediante autoconfiguración
- integra muy bien HTTP, JSON y diseño REST
- suele trabajar con controladores, servicios y otras capas
- usa mucho anotaciones, dependencias y estructura de proyecto ordenada
- aprender Spring Boot es un paso central para construir backends reales con Java

## Siguiente tema

En la próxima lección conviene pasar a **Controllers**, porque después de entender qué es Spring Boot y por qué importa, el siguiente paso natural es profundizar en cómo una aplicación recibe requests HTTP y expone endpoints concretos.
