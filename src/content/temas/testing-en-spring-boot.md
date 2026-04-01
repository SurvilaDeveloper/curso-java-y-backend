---
title: "Testing en Spring Boot"
description: "Cómo probar controllers, services y repositorios en Spring Boot para construir aplicaciones más confiables y fáciles de mantener."
order: 39
module: "Calidad y testing"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya viste una buena parte del camino para construir una aplicación backend con Java y Spring Boot:

- controllers
- services
- DTOs
- validaciones
- manejo de errores
- repository
- JPA
- Hibernate
- consultas

Eso ya te permite armar una API bastante seria.

Pero ahora aparece una pregunta muy importante:

¿cómo comprobás que todo eso realmente funciona bien y sigue funcionando cuando hacés cambios?

Ahí entra testing.

Testing no es un adorno.
Es una parte clave del desarrollo profesional porque ayuda a construir software más confiable y más fácil de evolucionar.

## Qué es testear

Testear significa ejecutar comprobaciones automáticas sobre el comportamiento del sistema.

Dicho simple:

- preparás un escenario
- ejecutás una parte del código
- verificás que el resultado sea el esperado

## Por qué importa tanto

Los tests ayudan a:

- detectar errores antes
- evitar regresiones
- refactorizar con más confianza
- documentar comportamiento esperado
- mejorar el diseño del código
- reducir miedo a cambiar cosas

## La idea general

Supongamos que tenés un `ProductService` que debe rechazar precios negativos.

Podrías probar manualmente esa regla entrando a la API, mandando requests y mirando respuestas.

Eso sirve a veces, pero no escala bien.

Un test automatizado puede comprobar esa regla una y otra vez en segundos, sin depender de que alguien la recuerde.

## Tipos de tests que conviene distinguir

A nivel práctico, al empezar con Spring Boot, conviene entender al menos estos tres grupos:

- tests unitarios
- tests de integración
- tests web / de controller

## Tests unitarios

Prueban una unidad pequeña de código de forma aislada.

Ejemplo:

- un service
- una clase utilitaria
- un mapper
- una validación concreta

La idea es que el test se enfoque en una pieza y no levante todo el contexto de la aplicación.

## Tests de integración

Prueban cómo interactúan varias partes juntas.

Por ejemplo:

- service + repository
- persistencia real en base de datos de prueba
- contexto Spring
- comportamiento de varias capas integradas

## Tests web / controller

Prueban la capa HTTP.

Por ejemplo:

- endpoint
- status code
- body JSON
- validaciones web
- estructura de respuesta

## Herramientas principales

En el ecosistema Spring Boot vas a ver mucho estas herramientas:

- JUnit
- Mockito
- Spring Boot Test
- MockMvc

## JUnit

Es la base más común para escribir tests en Java moderno.

## Mockito

Sirve mucho para crear mocks y aislar dependencias en tests unitarios.

## Spring Boot Test

Ayuda a probar partes de la aplicación dentro del ecosistema Spring.

## MockMvc

Permite probar endpoints HTTP sin necesidad de levantar un servidor real completo como si estuvieras usando Postman manualmente.

## Dependencia típica de test

En muchos proyectos Spring Boot ya aparece algo así en Maven:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

Eso suele traer bastante de lo necesario para testing inicial en Spring Boot.

## Estructura de tests

En un proyecto Maven típico, los tests van en:

```text
src/test/java
```

Eso refleja la estructura del código principal en:

```text
src/main/java
```

## Primer ejemplo con JUnit

Supongamos esta clase simple:

```java
public class PriceCalculator {
    public double applyDiscount(double price, double discount) {
        return price * (1 - discount);
    }
}
```

Un test básico podría ser:

```java
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class PriceCalculatorTest {

    @Test
    void shouldApplyDiscountCorrectly() {
        PriceCalculator calculator = new PriceCalculator();

        double result = calculator.applyDiscount(100, 0.2);

        assertEquals(80, result);
    }
}
```

## Qué está pasando acá

### `@Test`

Marca un método como test.

### `assertEquals(...)`

Verifica que el valor obtenido sea igual al esperado.

## Nombres de tests

Conviene que el nombre del test exprese claramente el comportamiento esperado.

Por ejemplo:

- `shouldApplyDiscountCorrectly`
- `shouldThrowExceptionWhenPriceIsNegative`
- `shouldReturnNotFoundWhenProductDoesNotExist`

Eso hace que el test también funcione como documentación.

## Assertions comunes

Algunas assertions útiles al empezar son:

- `assertEquals(...)`
- `assertTrue(...)`
- `assertFalse(...)`
- `assertNotNull(...)`
- `assertThrows(...)`

## `assertThrows(...)`

Muy útil para validar excepciones.

Ejemplo:

```java
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;

public class ProductValidatorTest {

    @Test
    void shouldThrowExceptionWhenPriceIsNegative() {
        ProductValidator validator = new ProductValidator();

        assertThrows(IllegalArgumentException.class, () -> {
            validator.validatePrice(-10);
        });
    }
}
```

## Qué ventaja tiene esto

Te permite verificar no solo resultados exitosos, sino también errores esperados.

Y eso es muy importante en backend.

## Test unitario de un service

Supongamos este service:

```java
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    public Product createProduct(String name, double price) {
        if (price < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }

        return new Product(1L, name, price);
    }
}
```

Test:

```java
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class ProductServiceTest {

    @Test
    void shouldCreateProductWhenPriceIsValid() {
        ProductService service = new ProductService();

        Product product = service.createProduct("Notebook", 1250.50);

        assertEquals("Notebook", product.getName());
        assertEquals(1250.50, product.getPrice());
    }

    @Test
    void shouldThrowExceptionWhenPriceIsNegative() {
        ProductService service = new ProductService();

        assertThrows(IllegalArgumentException.class, () -> {
            service.createProduct("Notebook", -10);
        });
    }
}
```

## Qué tiene de bueno este test

No levanta todo Spring.
No depende de base de datos.
No depende de HTTP.

Prueba una pieza concreta:
la lógica del service.

Eso lo vuelve rápido y claro.

## Mockito

Cuando una clase depende de otra, a veces conviene mockear esa dependencia para probar la clase en aislamiento.

Supongamos este service:

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

## Por qué usar mock

Si querés probar `ProductService`, no siempre querés depender de una base real o de toda la capa repository real.

En un test unitario podés mockear el repository.

## Ejemplo con Mockito

```java
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

public class ProductServiceTest {

    @Test
    void shouldReturnProductWhenItExists() {
        ProductRepository repository = Mockito.mock(ProductRepository.class);
        ProductService service = new ProductService(repository);

        Product product = new Product(1L, "Notebook", 1250.50);

        when(repository.findById(1L)).thenReturn(Optional.of(product));

        Product result = service.getProductById(1L);

        assertEquals("Notebook", result.getName());
    }
}
```

## Qué está pasando acá

- se crea un mock de `ProductRepository`
- se define qué debería devolver cuando se llame `findById(1L)`
- se prueba el service sin base real

## Ventaja de esto

Permite probar la lógica del service sin depender del acceso a datos real.

Eso hace el test más aislado y más rápido.

## Test de controller con MockMvc

Ahora pasemos a la capa web.

Supongamos este controller:

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

## Qué querés probar acá

Por ejemplo:

- que el endpoint responde `200 OK`
- que devuelve JSON
- que el contenido tiene ciertos campos

Para eso, una herramienta muy útil es `MockMvc`.

## Ejemplo con `@WebMvcTest`

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Test
    void shouldReturnProductsAsJson() throws Exception {
        when(productService.getProducts()).thenReturn(
                List.of(
                        new Product(1L, "Notebook", 1250.50),
                        new Product(2L, "Mouse", 25.99)
                )
        );

        mockMvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].name").value("Notebook"))
                .andExpect(jsonPath("$[1].name").value("Mouse"));
    }
}
```

## Qué hace `@WebMvcTest`

Levanta una parte acotada del contexto Spring enfocada en la capa web.

Eso permite probar controllers sin cargar toda la aplicación completa.

## Qué hace `@MockBean`

Crea un mock administrado por Spring para reemplazar la dependencia real.

En este caso, `ProductService` se mockea para controlar su comportamiento en el test.

## Qué hace `MockMvc`

Simula requests HTTP dentro del test.

Por ejemplo:

```java
mockMvc.perform(get("/products"))
```

simula una request `GET /products`.

## Qué hace `jsonPath(...)`

Permite verificar partes concretas del JSON de respuesta.

Ejemplo:

```java
jsonPath("$[0].name").value("Notebook")
```

verifica que el primer elemento de la lista tenga `"name": "Notebook"`.

## Test de validación web

Supongamos este DTO:

```java
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class CreateProductRequestDto {

    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @Positive(message = "El precio debe ser positivo")
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

Y este controller:

```java
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products")
public class ProductController {

    @PostMapping
    public String createProduct(@Valid @RequestBody CreateProductRequestDto request) {
        return "ok";
    }
}
```

Test:

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
public class ProductControllerValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnBadRequestWhenBodyIsInvalid() throws Exception {
        String invalidJson = """
                {
                  "name": "",
                  "price": -10
                }
                """;

        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }
}
```

## Qué demuestra esto

Demuestra que también podés testear:

- validaciones
- status codes
- comportamiento HTTP de error

No solo los casos felices.

## `@SpringBootTest`

Cuando querés cargar el contexto completo de Spring Boot, existe:

```java
@SpringBootTest
```

Eso sirve más para tests de integración amplios.

Ejemplo conceptual:

```java
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class ApplicationTest {

    @Test
    void contextLoads() {
    }
}
```

## Qué hace este test

Comprueba que el contexto de la aplicación puede arrancar correctamente.

Es un test muy básico, pero útil como chequeo general.

## Cuándo usar `@SpringBootTest`

Conviene cuando realmente querés probar integración más amplia entre componentes reales del contexto.

No conviene usarlo para todo por costumbre, porque suele ser más pesado y más lento que tests unitarios o tests más acotados.

## Tests de repository

Cuando trabajás con JPA, también podés querer probar repositories y persistencia.

Una anotación muy útil para eso es:

```java
@DataJpaTest
```

Ejemplo conceptual:

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.assertFalse;

@DataJpaTest
public class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Test
    void shouldFindSavedProducts() {
        Product product = new Product("Notebook", 1250.50, true);
        productRepository.save(product);

        assertFalse(productRepository.findAll().isEmpty());
    }
}
```

## Qué hace `@DataJpaTest`

Levanta una parte acotada del contexto enfocada en persistencia JPA.

Eso permite probar entities, repositories y consultas de forma bastante directa.

## Qué conviene testear

No hace falta testear absolutamente todo al mismo nivel.

Una guía útil podría ser:

### En services

- reglas de negocio
- validaciones del dominio
- decisiones importantes

### En controllers

- status codes
- JSON
- rutas
- validaciones de entrada
- estructura de respuesta

### En repositories

- consultas personalizadas
- comportamiento de persistencia
- filtros relevantes

## Tests felices y tests de error

Un buen set de tests no prueba solo el caso ideal.

Conviene probar también:

- datos inválidos
- recurso inexistente
- excepciones esperadas
- bordes del comportamiento

Por ejemplo:

- crear producto con precio válido
- crear producto con precio negativo
- buscar producto existente
- buscar producto inexistente
- request válida
- request inválida

## Nombres claros

Conviene que cada test diga claramente qué espera.

Ejemplos:

- `shouldCreateProductWhenInputIsValid`
- `shouldThrowExceptionWhenPriceIsNegative`
- `shouldReturnBadRequestWhenRequestBodyIsInvalid`
- `shouldReturnNotFoundWhenProductDoesNotExist`

## AAA: Arrange, Act, Assert

Un patrón muy útil para escribir tests es:

- Arrange
- Act
- Assert

### Arrange

Preparar datos y escenario.

### Act

Ejecutar lo que querés probar.

### Assert

Verificar el resultado.

## Ejemplo

```java
@Test
void shouldCreateProductWhenPriceIsValid() {
    // Arrange
    ProductService service = new ProductService();

    // Act
    Product product = service.createProduct("Notebook", 1250.50);

    // Assert
    assertEquals("Notebook", product.getName());
}
```

## Tests y diseño

Una verdad muy útil es esta:

si algo es muy difícil de testear, muchas veces también está mal diseñado.

Por ejemplo:

- demasiadas dependencias internas
- demasiadas responsabilidades mezcladas
- acoplamiento alto
- lógica escondida en lugares raros

Los tests no solo verifican el sistema.
También te obligan a mirar la calidad del diseño.

## Buenas prácticas iniciales

## 1. Empezar por services

Suelen ser una excelente puerta de entrada a tests unitarios valiosos.

## 2. No testear framework por testear

No hace falta escribir tests que solo confirman lo obvio del framework sin valor real.

## 3. Probar comportamiento, no implementación interna irrelevante

Lo importante es qué hace el sistema, no cada detalle arbitrario.

## 4. Mantener tests legibles

Un test también debería ser fácil de leer y entender.

## 5. Cubrir tanto casos felices como errores

Eso mejora muchísimo la confiabilidad.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a separar tests unitarios, tests de endpoints y tests de integración. En Spring Boot esa separación también es muy importante y suele estar bastante bien soportada por las herramientas del ecosistema.

### Si venís de Python

Puede parecerse a probar servicios, vistas y persistencia con distintos niveles de aislamiento. En Java, el ecosistema Spring ofrece anotaciones bastante específicas para cada tipo de test, lo cual ayuda mucho a estructurar bien la estrategia.

## Errores comunes

### 1. No testear nada hasta el final

Eso vuelve mucho más difícil detectar problemas y refactorizar con confianza.

### 2. Usar siempre el test más pesado posible

No todo necesita `@SpringBootTest`.

### 3. Escribir tests frágiles o demasiado acoplados a detalles internos

Eso hace que mantenerlos sea un dolor.

### 4. Probar solo el caso feliz

Los errores y bordes también importan muchísimo.

### 5. Confundir mocks con magia

Mockear ayuda, pero hay que entender bien qué dependencia estás aislando y por qué.

## Mini ejercicio

Diseñá una estrategia mínima de tests para una API de productos que incluya:

1. un test unitario del `ProductService`
2. un test web del `ProductController`
3. un test de validación del body de entrada
4. un test de repository o persistencia simple

Intentá decidir para cada uno:

- qué querés probar
- qué anotación usarías
- qué dependencia mockearías si hace falta

## Ejemplo posible

### Service

- probar precio negativo
- probar creación válida
- usar JUnit + Mockito si hay dependencia externa

### Controller

- probar `GET /products`
- usar `@WebMvcTest`
- mockear el service

### Validación

- probar `POST /products` con body inválido
- usar `MockMvc`

### Repository

- probar consulta o guardado simple
- usar `@DataJpaTest`

## Resumen

En esta lección viste que:

- testing ayuda a construir aplicaciones más confiables y mantenibles
- en Spring Boot conviene distinguir tests unitarios, web e integración
- JUnit es la base más común para escribir tests en Java
- Mockito ayuda a aislar dependencias
- MockMvc sirve para probar endpoints HTTP
- `@WebMvcTest`, `@SpringBootTest` y `@DataJpaTest` sirven para distintos niveles de prueba
- probar tanto casos felices como errores mejora muchísimo la calidad del backend

## Siguiente tema

En la próxima lección conviene pasar a **Spring Security**, porque después de construir y probar una API razonablemente ordenada, el siguiente paso natural es aprender a proteger endpoints, autenticar usuarios y manejar permisos.
