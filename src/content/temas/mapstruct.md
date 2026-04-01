---
title: "MapStruct"
description: "Qué es MapStruct, cómo ayuda a mapear entidades y DTOs en Java y por qué es una herramienta muy útil en proyectos Spring Boot."
order: 48
module: "Profundización en Java moderno"
level: "intermedio"
draft: false
---

## Introducción

En la lección anterior viste programación funcional en Java con:

- lambdas
- streams
- `Optional`

Y viste que una de sus aplicaciones más comunes en backend real es el mapping entre entidades y DTOs.

Por ejemplo:

- transformar una entidad JPA a un response DTO
- transformar un request DTO a una entidad
- mapear listas completas
- evitar repetir una y otra vez el mismo código de conversión

Ahí aparece una herramienta muy importante en proyectos Java modernos: **MapStruct**.

## Qué es MapStruct

MapStruct es una librería para generar código de mapping entre clases Java.

Dicho simple:

- vos definís una interfaz de mapeo
- MapStruct genera la implementación
- evitás escribir a mano gran parte del código repetitivo de conversión

## La idea general

Supongamos que tenés estas dos clases:

### Entidad

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

### DTO

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

Sin una herramienta de mapping, tendrías que hacer algo así muchas veces:

```java
public ProductResponseDto toDto(Product product) {
    return new ProductResponseDto(
            product.getId(),
            product.getName(),
            product.getPrice()
    );
}
```

Eso no está mal.
De hecho, a veces está perfectamente bien.

Pero cuando el proyecto crece y aparecen muchos DTOs y muchas entidades, ese código repetitivo empieza a multiplicarse bastante.

## Qué problema resuelve MapStruct

MapStruct ayuda a reducir:

- código repetitivo de mapping
- errores de copiar y pegar
- transformaciones mecánicas escritas a mano
- ruido visual en servicios y controllers

## Qué no resuelve

No reemplaza diseño.
No decide arquitectura por vos.
No evita pensar DTOs.

Lo que hace es automatizar una parte muy repetitiva del trabajo de conversión entre clases.

## Por qué encaja tan bien después de DTOs

A esta altura del roadmap ya viste que:

- no conviene exponer entidades directamente por la API
- los DTOs ayudan a separar entrada, salida y modelo interno
- muchas veces hay que convertir entre entidad y DTO

MapStruct entra exactamente ahí.

## Cómo funciona conceptualmente

La idea central es esta:

1. definís una interfaz mapper
2. declarás métodos como `toDto(...)` o `toEntity(...)`
3. MapStruct genera la implementación concreta en compilación

Eso es importante:

**MapStruct genera código Java real en compile time**

No trabaja por reflexión pesada al estilo de otras herramientas.

## Por qué eso es interesante

Porque tiene ventajas como:

- mejor performance
- errores detectables en compilación
- código generado bastante explícito
- menos magia en runtime

## Dependencias típicas

En Maven suele haber que agregar la librería principal y el procesador de anotaciones.

Ejemplo conceptual:

```xml
<dependencies>
    <dependency>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct</artifactId>
        <version>1.5.5.Final</version>
    </dependency>
</dependencies>
```

Y configurar annotation processing en el build.

No hace falta memorizar todo ahora.
Lo importante es entender qué rol cumple la herramienta.

## Primer ejemplo de mapper

```java
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductResponseDto toDto(Product product);
}
```

## Qué expresa esto

Le estás diciendo a MapStruct:

- generá un mapper para esta interfaz
- integralo con Spring
- creá la lógica para convertir `Product` en `ProductResponseDto`

## Qué significa `componentModel = "spring"`

Significa que el mapper generado podrá integrarse como bean de Spring.

Eso permite inyectarlo fácilmente en services o controllers.

## Ejemplo de uso en service

```java
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository,
                          ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    public List<ProductResponseDto> getProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toDto)
                .toList();
    }
}
```

## Qué tiene de bueno esto

El service ya no necesita preocuparse por escribir el mapping campo por campo a mano.

Se enfoca más en la lógica del caso de uso.

## Mapping de listas

MapStruct también puede mapear listas.

Ejemplo:

```java
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductResponseDto toDto(Product product);

    List<ProductResponseDto> toDtoList(List<Product> products);
}
```

## Qué hace esto

MapStruct genera también la conversión de lista de entidades a lista de DTOs.

Entonces podrías hacer algo como:

```java
public List<ProductResponseDto> getProducts() {
    return productMapper.toDtoList(productRepository.findAll());
}
```

## Qué ventaja da eso

Todavía menos código repetitivo y más claridad en la intención del método.

## Mapping inverso

También puede hacerse el mapping contrario.

Por ejemplo, de request DTO a entidad.

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

### Entidad

```java
public class Product {
    private Long id;
    private String name;
    private double price;
    private boolean active;

    public Product() {
    }

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

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
```

### Mapper

```java
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductResponseDto toDto(Product product);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", constant = "true")
    Product toEntity(CreateProductRequestDto request);
}
```

## Qué expresan esas anotaciones

### `@Mapping(target = "id", ignore = true)`

Dice que no intente mapear `id` desde el request DTO.

Eso tiene sentido porque normalmente el id lo genera la base.

### `@Mapping(target = "active", constant = "true")`

Dice que el campo `active` se inicialice con `true`.

## Qué muestra este ejemplo

Muestra algo muy importante:
MapStruct no solo copia campos iguales automáticamente.
También permite ajustar reglas de mapping.

## Convención automática

Una de las ventajas más lindas de MapStruct es que, cuando los nombres y tipos coinciden razonablemente, puede mapear mucho de forma automática.

Por ejemplo:

- `name` → `name`
- `price` → `price`

Eso hace que muchos mappers simples sean muy compactos.

## Cuándo necesitás configuración extra

Necesitás más configuración cuando:

- los nombres cambian
- querés ignorar campos
- querés asignar constantes
- querés transformar estructuras distintas
- hay nested objects
- hay relaciones más complejas

## Ejemplo con nombres distintos

Supongamos:

### Entidad

```java
public class Product {
    private String name;
}
```

### DTO

```java
public class ProductResponseDto {
    private String productName;
}
```

Ahí MapStruct necesita ayuda.

```java
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(source = "name", target = "productName")
    ProductResponseDto toDto(Product product);
}
```

## Qué hace `source` y `target`

- `source` = campo de origen
- `target` = campo de destino

## Update de entidades existentes

Otro caso muy útil es actualizar una entidad existente a partir de un DTO.

Por ejemplo:

```java
public class UpdateProductRequestDto {
    private String name;
    private double price;

    public String getName() {
        return name;
    }

    public double getPrice() {
        return price;
    }
}
```

Y querés aplicar esos cambios sobre un `Product` ya existente.

MapStruct permite algo así:

```java
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    void updateEntity(UpdateProductRequestDto request, @MappingTarget Product product);
}
```

## Qué hace `@MappingTarget`

Le indica a MapStruct que no cree un objeto nuevo, sino que actualice el objeto existente.

Eso es muy útil en updates.

## Ejemplo de uso

```java
public Product updateProduct(Long id, UpdateProductRequestDto request) {
    Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

    productMapper.updateEntity(request, product);

    return productRepository.save(product);
}
```

## Qué tiene de valioso esto

Te evita escribir asignaciones repetitivas como:

```java
product.setName(request.getName());
product.setPrice(request.getPrice());
```

en muchos lugares del proyecto.

## MapStruct y nested objects

También puede mapear estructuras anidadas, aunque ahí el mapping puede requerir más configuración o mappers auxiliares.

Por ejemplo, si tenés:

- `Order`
- `Customer`
- `OrderItem`

y querés construir un DTO más plano o más específico, MapStruct puede ayudarte bastante, aunque esos casos ya exigen pensar más el diseño del mapping.

## MapStruct no reemplaza criterio de diseño

Esto es importante.

Que algo pueda mapearse automáticamente no significa que debas hacerlo siempre sin pensar.

Sigue siendo importante decidir:

- qué DTO querés exponer
- qué campos deben salir
- qué campos deben ignorarse
- qué relaciones no conviene incluir
- qué transformación expresa mejor el caso de uso

MapStruct te ayuda a implementar eso, pero no decide por vos.

## MapStruct y services más limpios

Sin MapStruct, es común terminar con services llenos de bloques de mapping.

Por ejemplo:

```java
return new ProductResponseDto(
        product.getId(),
        product.getName(),
        product.getPrice()
);
```

Eso está bien si es poco.

Pero cuando el proyecto crece, suele ser mejor separar esa responsabilidad.

MapStruct ayuda mucho a limpiar esa parte.

## Cuándo sí conviene usarlo

MapStruct suele aportar mucho cuando:

- tenés varios DTOs
- tenés varias entidades
- hacés mucho mapping repetitivo
- querés separar mejor esa responsabilidad
- querés evitar boilerplate

## Cuándo quizá no hace falta todavía

Si el proyecto es muy chico y casi no hay conversiones, quizá escribir el mapping a mano todavía sea suficiente y más simple.

No hace falta meter una herramienta extra por deporte.

La clave es usarla cuando realmente reduce fricción.

## MapStruct y compile-time safety

Una gran ventaja es que muchos errores de mapping pueden detectarse durante compilación.

Eso es bastante mejor que descubrirlos recién en runtime.

Por eso MapStruct suele gustar mucho en equipos que valoran claridad y seguridad de tipos.

## Ejemplo completo

### Entidad

```java
public class Product {
    private Long id;
    private String name;
    private double price;
    private boolean active;

    public Product() {
    }

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

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
```

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

### Mapper

```java
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductResponseDto toDto(Product product);

    List<ProductResponseDto> toDtoList(List<Product> products);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", constant = "true")
    Product toEntity(CreateProductRequestDto request);
}
```

### Service

```java
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public ProductService(ProductRepository productRepository,
                          ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    public List<ProductResponseDto> getProducts() {
        return productMapper.toDtoList(productRepository.findAll());
    }

    public ProductResponseDto createProduct(CreateProductRequestDto request) {
        Product product = productMapper.toEntity(request);
        Product saved = productRepository.save(product);
        return productMapper.toDto(saved);
    }
}
```

## Qué demuestra este ejemplo

Demuestra varias cosas valiosas a la vez:

- request DTO → entidad
- entidad → response DTO
- lista de entidades → lista de DTOs
- integración del mapper como bean Spring
- services más limpios y enfocados

## Relación con lo ya visto

MapStruct conecta muy bien con todo esto:

- DTOs
- services
- JPA
- streams y mapping manual
- proyecto integrador
- Swagger / OpenAPI

Porque en todos esos puntos aparece el problema de cómo convertir estructuras de forma clara y mantenible.

## Buenas prácticas iniciales

## 1. No meter MapStruct demasiado pronto si el proyecto es diminuto

Que la herramienta aparezca cuando aporta valor real.

## 2. Mantener los DTOs bien pensados

MapStruct no arregla contratos mal diseñados.

## 3. Usar mappers para conversiones repetitivas y mecánicas

Ahí brilla especialmente.

## 4. Revisar mappings especiales con atención

Sobre todo cuando hay campos distintos o reglas no triviales.

## 5. No perder de vista la claridad del flujo

El objetivo sigue siendo que el código se entienda bien.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a helpers o capas de transformación entre modelos y payloads, pero en Java MapStruct aporta una ventaja muy fuerte: genera código tipado en compilación, lo cual encaja muy bien con la filosofía del ecosistema.

### Si venís de Python

Puede parecerse a separar esquemas de entrada y salida y usar conversores dedicados. En Java, MapStruct se vuelve especialmente atractivo porque reduce mucho boilerplate sin depender de reflexión pesada en runtime.

## Errores comunes

### 1. Pensar que MapStruct reemplaza el diseño de DTOs

No lo hace.
Solo ayuda a implementar mappings.

### 2. Meterlo en un proyecto donde casi no hay mapping

Ahí puede ser sobreingeniería.

### 3. No revisar qué campos se están mapeando realmente

Especialmente cuando hay estructuras más complejas.

### 4. Mezclar demasiada lógica de negocio dentro del mapper

El mapper debería enfocarse en conversión, no en reglas profundas del dominio.

### 5. Querer usarlo como solución mágica para todo tipo de transformación

Hay casos donde un mapping manual bien pensado sigue siendo mejor.

## Mini ejercicio

Tomá una entidad y dos DTOs de tu proyecto o de un ejemplo simple:

1. un request DTO
2. un response DTO

Y diseñá un mapper que haga:

- request DTO → entidad
- entidad → response DTO
- lista de entidades → lista de response DTO

Si querés ir un paso más allá, agregá un update con `@MappingTarget`.

## Ejemplo posible

```java
@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponseDto toDto(User user);

    List<UserResponseDto> toDtoList(List<User> users);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", constant = "true")
    User toEntity(CreateUserRequestDto request);
}
```

## Resumen

En esta lección viste que:

- MapStruct es una herramienta para generar código de mapping entre clases Java
- ayuda mucho a convertir entidades y DTOs sin escribir tanto boilerplate
- funciona muy bien en proyectos Spring Boot con `componentModel = "spring"`
- puede mapear objetos individuales, listas y actualizaciones sobre entidades existentes
- no reemplaza el diseño, pero sí reduce mucho la fricción de conversiones repetitivas
- es una herramienta muy útil cuando el proyecto ya tiene varios DTOs y varios mappings

## Siguiente tema

La siguiente natural es **Flyway**, porque después de profundizar bastante el código backend moderno, el siguiente paso muy valioso es empezar a profesionalizar también la evolución de la base de datos con migraciones controladas.
