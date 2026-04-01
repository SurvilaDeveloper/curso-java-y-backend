---
title: "Cómo se organizan las capas más comunes de una aplicación Spring Boot"
description: "Una guía para entender la estructura por capas más habitual en Spring Boot: qué rol cumple cada parte del proyecto y cómo se relacionan controller, service, repository y otras piezas frecuentes."
order: 11
module: "Fundamentos de Spring y Spring Boot"
level: "intro"
draft: false
---

En los temas anteriores viste ideas importantes que ya empiezan a encajar entre sí:

- Spring trabaja con un contenedor
- el contenedor administra beans
- las clases suelen registrarse mediante anotaciones
- Spring detecta componentes con el component scanning
- la ubicación de los paquetes influye en qué clases puede encontrar

Ahora conviene dar un paso muy importante:

> entender cómo suele organizarse internamente una aplicación Spring Boot.

Este tema no trata todavía de base de datos, seguridad o APIs complejas.

La idea acá es mucho más estructural:

- qué capas suelen existir
- qué responsabilidad tiene cada una
- qué clases suelen vivir en cada parte
- cómo se comunican entre sí
- qué errores de diseño conviene evitar desde temprano

## Por qué importa pensar en capas

Cuando una aplicación empieza siendo pequeña, es muy tentador poner todo junto.

Por ejemplo:

- el controlador recibe el request
- valida datos
- aplica reglas de negocio
- arma respuestas
- consulta la base de datos
- transforma objetos
- captura excepciones
- decide códigos HTTP

Al principio eso puede parecer práctico.

Pero cuando el proyecto crece, aparece el caos:

- clases demasiado largas
- responsabilidades mezcladas
- lógica duplicada
- dificultades para testear
- cambios pequeños que impactan en varios lugares
- código difícil de leer y mantener

La organización por capas busca evitar ese problema.

No es una receta mágica, pero ayuda mucho a que el sistema tenga una estructura más clara.

## La idea general de una arquitectura por capas

En una aplicación Spring Boot típica suele aparecer una separación como esta:

- **controller** → entrada y salida web
- **service** → lógica de negocio
- **repository** → acceso a datos
- **model / entity** → representación del dominio o persistencia
- **dto** → objetos para entrada y salida de datos
- **config** → configuraciones del sistema

No todos los proyectos usan exactamente los mismos nombres ni la misma profundidad, pero esta división aparece muchísimo.

Una forma simple de visualizarlo es así:

```text
Cliente HTTP
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
Base de datos
```

Y alrededor de eso suelen aparecer otras piezas como:

- validadores
- excepciones personalizadas
- handlers globales
- mappers
- utilidades
- clientes para servicios externos

## Qué hace la capa controller

La capa **controller** es la puerta de entrada de la aplicación para requests HTTP.

Es la capa que normalmente:

- recibe requests
- toma parámetros de la URL
- recibe cuerpos JSON
- delega el trabajo a un servicio
- arma la respuesta HTTP
- devuelve datos al cliente

Por ejemplo:

```java
@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public List<ProductoResponse> listar() {
        return productoService.listar();
    }
}
```

Fijate que el controlador no debería convertirse en “el cerebro” de la aplicación.

Su trabajo idealmente es más bien coordinar la interacción web.

## Qué no debería hacer un controller

Un error muy común al principio es meter demasiada lógica en el controlador.

Por ejemplo, un controller no debería volverse el lugar donde:

- se toman decisiones complejas de negocio
- se hacen cálculos importantes
- se accede directamente a la base de datos
- se resuelven muchas reglas internas del sistema
- se mezclan varias responsabilidades distintas

El controller debería estar enfocado en la capa HTTP.

O sea:

- request
- response
- status code
- delegación al servicio adecuado

## Qué hace la capa service

La capa **service** suele concentrar la lógica de negocio.

Es el lugar donde normalmente viven decisiones como:

- qué reglas se aplican para crear algo
- cuándo una operación es válida o inválida
- qué pasos hay que ejecutar en cierto orden
- cómo interactúan distintas partes del sistema
- qué restricciones del dominio hay que respetar

Por ejemplo:

```java
@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<ProductoResponse> listar() {
        return productoRepository.findAll()
                .stream()
                .map(producto -> new ProductoResponse(producto.getId(), producto.getNombre()))
                .toList();
    }
}
```

Acá el servicio actúa como intermediario entre la capa web y la capa de datos.

## Por qué la capa service suele ser tan importante

Si un proyecto no tiene una buena capa de servicio, suele pasar una de estas dos cosas:

- la lógica queda desparramada por controllers, repositories y utilidades
- o directamente se mezcla toda en un solo lugar

La capa service ayuda a que la lógica del negocio tenga un hogar más claro.

Eso facilita:

- mantener el código
- reutilizar lógica
- testear reglas
- cambiar el transporte web sin romper el corazón de la aplicación

## Qué hace la capa repository

La capa **repository** se ocupa del acceso a datos.

En Spring Boot esto aparece muchísimo junto con Spring Data JPA, aunque el concepto es más amplio.

Un repository suele encargarse de:

- buscar datos
- guardar datos
- actualizar datos
- borrar datos
- ejecutar consultas específicas

Ejemplo:

```java
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
```

O, según el caso, puede haber implementaciones más manuales.

Lo importante es la responsabilidad:

> el repository habla con la persistencia.

## Qué no debería hacer un repository

Un repository no debería convertirse en el lugar donde vive la lógica de negocio.

Por ejemplo, no es buena idea usarlo para decidir cosas como:

- si una operación está permitida o no
- qué validaciones del dominio aplicar
- qué comportamiento de negocio ejecutar
- cómo coordinar varias acciones del sistema

Su foco debería ser el acceso a datos.

## Modelos, entidades y objetos del dominio

En una aplicación Spring Boot suelen aparecer clases que representan información del sistema.

Según el estilo del proyecto, podés encontrar nombres como:

- `entity`
- `model`
- `domain`

Cuando trabajás con JPA, las entidades suelen representar objetos persistidos en base de datos.

Ejemplo:

```java
@Entity
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private BigDecimal precio;

    // getters, setters, constructores
}
```

Más adelante vas a profundizar mucho en esto.

Por ahora lo importante es entender que estas clases representan datos y estructura del sistema, no la capa HTTP.

## Qué son los DTOs y por qué suelen aparecer

En muchos proyectos no conviene exponer directamente entidades hacia afuera.

Por eso suelen usarse **DTOs** (*Data Transfer Objects*).

Los DTOs sirven para transportar datos entre capas o hacia el exterior.

Por ejemplo:

```java
public record ProductoResponse(Long id, String nombre, BigDecimal precio) {
}
```

Y también puede haber DTOs de entrada:

```java
public record CrearProductoRequest(String nombre, BigDecimal precio) {
}
```

Esto ayuda a separar:

- cómo se persiste algo
- cómo se expone algo
- cómo se recibe algo

Esa separación suele ser muy sana.

## Qué suele ir en config

La carpeta o paquete `config` suele agrupar configuraciones explícitas del sistema.

Por ejemplo:

- beans definidos manualmente
- configuración de seguridad
- CORS
- serialización
- clientes externos
- settings especiales del framework

Ejemplo:

```java
@Configuration
public class AppConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
```

El objetivo es que la configuración no quede mezclada en cualquier parte del proyecto.

## Otras piezas que suelen aparecer

Además de controller, service y repository, muchas aplicaciones suman otros paquetes o capas auxiliares.

### `exception`
Para excepciones personalizadas y manejo global de errores.

### `mapper`
Para transformar entidades en DTOs y viceversa.

### `validation`
Para validaciones personalizadas.

### `client` o `integration`
Para conectarse con APIs externas.

### `security`
Para filtros, configuración y componentes de seguridad.

### `util`
Para utilidades reutilizables, aunque conviene usarlo con criterio y no convertirlo en un cajón de sastre.

## Una estructura de paquetes bastante típica

Podría verse algo así:

```text
com.gabrielsurvila.curso
 ├── CursoApplication.java
 ├── controller
 │    └── ProductoController.java
 ├── service
 │    └── ProductoService.java
 ├── repository
 │    └── ProductoRepository.java
 ├── entity
 │    └── Producto.java
 ├── dto
 │    ├── CrearProductoRequest.java
 │    └── ProductoResponse.java
 ├── config
 │    └── AppConfig.java
 └── exception
      └── RecursoNoEncontradoException.java
```

Esto no es la única forma posible, pero sí una bastante fácil de entender y muy útil para aprender.

## Cómo se relacionan normalmente las capas

Una forma muy común de flujo sería esta:

1. el cliente hace un request HTTP
2. el controller recibe ese request
3. el controller delega en el service
4. el service aplica lógica de negocio
5. el service usa el repository si necesita datos
6. el repository accede a la base de datos
7. el resultado vuelve hacia arriba
8. el controller responde al cliente

Eso puede verse así:

```text
Request HTTP
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
DB
```

Y luego de regreso:

```text
DB
   ↓
Repository
   ↓
Service
   ↓
Controller
   ↓
Response HTTP
```

## Por qué conviene respetar bastante esa dirección

Cuando las capas empiezan a llamarse en cualquier dirección, la aplicación se vuelve confusa.

Por ejemplo, suele ser mala señal si:

- un repository llama a un controller
- un controller llama directo a la base de datos
- una entidad conoce detalles HTTP
- una config empieza a concentrar lógica de negocio

Cuanto más clara sea la dirección de responsabilidades, más mantenible suele ser el proyecto.

## Un ejemplo pequeño pero razonable

### Controller

```java
@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @PostMapping
    public ProductoResponse crear(@RequestBody CrearProductoRequest request) {
        return productoService.crear(request);
    }
}
```

### Service

```java
@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public ProductoResponse crear(CrearProductoRequest request) {
        Producto producto = new Producto();
        producto.setNombre(request.nombre());
        producto.setPrecio(request.precio());

        Producto guardado = productoRepository.save(producto);
        return new ProductoResponse(guardado.getId(), guardado.getNombre(), guardado.getPrecio());
    }
}
```

### Repository

```java
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
```

Aunque todavía no viste todos esos detalles en profundidad, este ejemplo sirve para visualizar cómo se reparten responsabilidades.

## Qué errores de organización son muy comunes al principio

### 1. Controllers gigantes

Cuando el controller termina haciendo validaciones, reglas, mapeos, acceso a datos y manejo de errores complejos.

### 2. Services demasiado débiles

A veces el servicio queda como simple “pasamanos” y toda la lógica real queda mal ubicada en otro lado.

### 3. Repositories con decisiones de negocio

El acceso a datos se mezcla con reglas del dominio.

### 4. Entidades expuestas directamente al cliente

Eso puede acoplar demasiado la API con la estructura interna de persistencia.

### 5. Paquetes sin criterio

Todo termina dentro de `util`, `common`, `helpers` o carpetas demasiado genéricas.

## ¿Esta estructura es obligatoria?

No.

Y esto es importante.

Spring no obliga a usar exactamente esta arquitectura.

Podrías organizar un proyecto de otras maneras, por ejemplo:

- por capas técnicas
- por módulos de negocio
- por features
- por bounded contexts
- con arquitectura hexagonal
- con enfoque más orientado al dominio

Pero para aprender Spring Boot desde cero, esta estructura por capas es muy buena porque:

- se entiende rápido
- aparece muchísimo en proyectos reales
- ayuda a separar responsabilidades
- permite leer ejemplos con más facilidad
- da una base clara antes de pasar a diseños más sofisticados

## Cuándo conviene empezar a complejizar la arquitectura

No al principio.

Primero conviene dominar bien:

- controller
- service
- repository
- entities
- DTOs
- configuración básica

Después, cuando ya tengas más recorrido, podés pasar a estructuras más avanzadas.

Pero si te adelantás demasiado, corrés el riesgo de aprender nombres complejos sin entender todavía los problemas que intentan resolver.

## Qué conviene llevarte de este tema

Lo más importante no es memorizar nombres de carpetas.

Lo importante es entender la lógica detrás de la organización:

- la capa web recibe y responde
- la capa de servicio decide y coordina
- la capa de datos persiste y consulta
- otras piezas complementan esa estructura

Si esa idea te queda clara, ya vas a poder leer proyectos Spring Boot con mucho más criterio.

## Resumen

- Una aplicación Spring Boot suele organizarse en capas para separar responsabilidades.
- Las capas más comunes son controller, service y repository.
- El controller se ocupa de la interacción HTTP.
- El service concentra la lógica de negocio.
- El repository se enfoca en el acceso a datos.
- También suelen aparecer DTOs, entidades, configuración y manejo de excepciones.
- Esta estructura no es la única posible, pero es una muy buena base para aprender y construir proyectos claros.

## Próximo tema

En el próximo tema vas a ver qué es **`application.properties`**, para qué sirve y cómo se empieza a configurar una aplicación Spring Boot desde afuera del código.
