---
title: "Guía práctica: qué hacen las anotaciones de Spring por detrás"
description: "Explicación conceptual y técnica de las anotaciones más importantes de Spring, enfocada en entender qué mecanismo interno activan y cómo pensar su equivalente manual."
order: 26
module: "Spring Boot - anotaciones"
level: "intro"
draft: false
---

# Guía práctica: qué hacen las anotaciones de Spring por detrás

## Idea central

El error más común al estudiar Spring es pensar que una anotación **hace** algo por sí sola.

En realidad, una anotación es **metadata**. No ejecuta lógica. No abre transacciones. No levanta endpoints. No crea objetos mágicamente.

Lo que sucede es esto:

1. Vos anotás una clase, método, campo o parámetro.
2. Alguna parte del ecosistema Spring lee esa anotación.
3. Esa parte del framework decide cómo tratar ese elemento.
4. Como resultado, se registra un bean, se mapea una ruta, se intercepta una llamada, se hace binding de datos, se activa caché, se aplica seguridad, etc.

La pregunta más útil para entender cualquier anotación es:

> **¿Qué subsistema la procesa, en qué momento, y qué objeto o mecanismo real cambia por detrás?**

---

## Cómo pensar las anotaciones sin caer en la “magia”

Cada vez que veas una anotación, hacete estas cinco preguntas:

### 1. ¿Quién la procesa?
- ¿Spring Core / IoC?
- ¿Spring MVC?
- ¿Spring Boot?
- ¿Spring Security?
- ¿Spring Data JPA?
- ¿Hibernate / JPA?

### 2. ¿Cuándo la procesa?
- ¿Durante el arranque?
- ¿Durante el escaneo de clases?
- ¿Cuando se crea el contexto?
- ¿Cuando llega una request HTTP?
- ¿Cuando se invoca un método?
- ¿Cuando se persiste una entidad?

### 3. ¿Qué cambia realmente?
- ¿Se registra un bean?
- ¿Se crea una ruta HTTP?
- ¿Se crea un proxy?
- ¿Se enlazan propiedades externas?
- ¿Se define metadata para el ORM?
- ¿Se aplica una regla de autorización?

### 4. ¿Qué objeto real participa?
- `ApplicationContext`
- `BeanFactory`
- `DispatcherServlet`
- `HandlerMapping`
- `HttpMessageConverter`
- `PlatformTransactionManager`
- `Proxy`
- `EntityManager`
- `SecurityInterceptor`
- `CacheManager`

### 5. ¿Cómo sería hacerlo a mano?
Esta pregunta te obliga a ver el problema real que la anotación simplifica.

---

## Las cuatro grandes familias de anotaciones

Aunque haya muchas, la mayoría entra en una de estas cuatro familias.

### A. Anotaciones de registro
Marcan clases o métodos para que Spring los registre dentro del contenedor.

Ejemplos:
- `@Component`
- `@Service`
- `@Repository`
- `@Controller`
- `@Configuration`
- `@Bean`

### B. Anotaciones de mapeo o binding
Le dicen al framework cómo convertir datos externos en llamadas o valores Java.

Ejemplos:
- `@RequestMapping`
- `@GetMapping`
- `@PathVariable`
- `@RequestParam`
- `@RequestBody`
- `@ConfigurationProperties`

### C. Anotaciones de intercepción / proxy
No cambian el cuerpo del método. Cambian cómo se invoca o envuelve ese método.

Ejemplos:
- `@Transactional`
- `@Async`
- `@Cacheable`
- `@PreAuthorize`

### D. Anotaciones de metadata del modelo
No “ejecutan” algo al instante, pero describen cómo debe tratarse una clase o campo.

Ejemplos:
- `@Entity`
- `@Id`
- `@OneToMany`
- `@ManyToOne`

---

# 1. `@SpringBootApplication`

```java
@SpringBootApplication
public class CatalogApplication {
    public static void main(String[] args) {
        SpringApplication.run(CatalogApplication.class, args);
    }
}
```

## Qué ve Spring
Spring Boot lo usa como punto de arranque de la aplicación.

## Quién la procesa
Spring Boot, durante el arranque de `SpringApplication`.

## Qué significa en realidad
`@SpringBootApplication` reúne tres ideas principales:

- configuración Java
- component scanning
- auto-configuración

O sea, esta anotación no “levanta la app” por sí sola. Lo que hace es darle a Spring Boot la información necesaria para:

- escanear componentes desde el paquete base
- registrar beans encontrados
- aplicar auto-configuraciones según el classpath y la configuración disponible

## Qué mecanismo real participa
- `SpringApplication`
- `ApplicationContext`
- auto-configuración
- escaneo de componentes

## Cómo sería a mano
Sin Spring Boot tendrías que:
- crear y configurar el contexto manualmente
- registrar configuraciones explícitas
- decidir qué beans instanciar
- conectar infraestructura web, serialización, datasource, transacciones, etc.

## Idea mental correcta
`@SpringBootApplication` no es “magia de arranque”.
Es una **señal de bootstrap** que le dice a Boot cómo iniciar y estructurar el contexto.

---

# 2. `@Component`, `@Service`, `@Repository`, `@Controller`

```java
@Service
public class ProductService {
}
```

## Qué ve Spring
Ve una clase candidata a ser gestionada por el contenedor.

## Quién la procesa
El mecanismo de classpath scanning del contenedor Spring.

## Qué pasa por detrás
Durante el escaneo de paquetes, Spring detecta clases anotadas con estereotipos y registra definiciones de beans dentro del contenedor.

Luego, cuando el contexto se inicializa, puede crear esas instancias y resolver sus dependencias.

## Diferencias conceptuales
- `@Component`: estereotipo general
- `@Service`: componente de lógica de negocio
- `@Repository`: componente de acceso a datos
- `@Controller`: componente web MVC
- `@RestController`: caso especial que veremos más adelante

## Qué aporta `@Repository` además
Además de marcar una clase como componente, también tiene sentido semántico para la capa de persistencia y suele participar en la traducción de ciertas excepciones de acceso a datos.

## Cómo sería a mano
```java
ProductRepository repository = new ProductRepository();
ProductService service = new ProductService(repository);
```

## Idea mental correcta
Estas anotaciones no agregan comportamiento mágico al código.
Le dicen al contenedor:

> “esta clase forma parte del grafo de objetos que quiero administrar”.

---

# 3. `@Configuration` y `@Bean`

```java
@Configuration
public class AppConfig {

    @Bean
    public Clock systemClock() {
        return Clock.systemUTC();
    }
}
```

## Qué ve Spring
Una clase fuente de definiciones de beans y un método que fabrica un bean.

## Quién la procesa
El contenedor Spring, al construir el contexto.

## Qué pasa por detrás
- `@Configuration` marca una clase de configuración.
- `@Bean` marca métodos cuyos retornos deben registrarse como beans del contenedor.

Es decir, el contenedor ejecuta ese método y guarda el objeto resultante como bean gestionado.

## Qué mecanismo real participa
- registro de definiciones de beans
- fábrica de objetos del contenedor
- wiring entre beans

## Cómo sería a mano
```java
Clock clock = Clock.systemUTC();
```

Pero a medida que tu aplicación crece, necesitás centralizar:
- ciclo de vida
- dependencias
- perfiles
- scopes
- reemplazos en tests

Ahí es donde el contenedor te evita el caos.

## Idea mental correcta
`@Bean` no es “crear un objeto”.
Es **crear un objeto que será administrado por Spring**.

---

# 4. `@Autowired` e inyección por constructor

```java
@Service
public class OrderService {

    private final ProductService productService;

    public OrderService(ProductService productService) {
        this.productService = productService;
    }
}
```

## Qué ve Spring
Una dependencia que debe resolverse con otro bean del contexto.

## Quién la procesa
El contenedor IoC de Spring, al crear el bean.

## Qué pasa por detrás
Cuando Spring decide crear `OrderService`, analiza su constructor y busca un bean compatible con `ProductService`.

Si lo encuentra:
- resuelve la dependencia
- invoca el constructor
- guarda la instancia creada

## Qué mecanismo real participa
- resolución de dependencias por tipo
- selección de beans candidatos
- creación del bean con constructor injection

## Cómo sería a mano
```java
ProductService productService = new ProductService(...);
OrderService orderService = new OrderService(productService);
```

## Importante
En proyectos modernos suele preferirse **inyección por constructor** en lugar de depender mucho de `@Autowired` en campos.

## Idea mental correcta
No estás pidiéndole a Spring que “inyecte magia”.
Le estás delegando al contenedor una tarea que manualmente harías con `new` y pasando dependencias.

---

# 5. `@RestController` y `@ResponseBody`

```java
@RestController
@RequestMapping("/products")
public class ProductController {

    @GetMapping("/{id}")
    public ProductDto findById(@PathVariable Long id) {
        return new ProductDto(id, "Mouse");
    }
}
```

## Qué ve Spring
Una clase controladora cuyos métodos devuelven directamente el cuerpo de la respuesta HTTP.

## Quién la procesa
Spring MVC.

## Qué pasa por detrás
`@RestController` combina la idea de:
- controlador Spring MVC
- serialización automática del valor de retorno al body de la respuesta

Cuando el método devuelve un objeto Java, Spring usa convertidores HTTP para serializarlo, normalmente a JSON.

## Qué mecanismo real participa
- `DispatcherServlet`
- `HandlerMapping`
- `HandlerAdapter`
- `HttpMessageConverter`

## Cómo sería a mano
Sin Spring MVC tendrías que:
- leer la request
- decidir qué método invocar
- ejecutar la lógica
- convertir el objeto a JSON
- escribir headers y status
- devolver bytes por la respuesta

## Idea mental correcta
`@RestController` no “crea una API”.
Declara que esta clase participa en el pipeline web y que su salida se escribe en la respuesta HTTP.

---

# 6. `@RequestMapping`, `@GetMapping`, `@PostMapping`

```java
@GetMapping("/{id}")
public ProductDto findById(@PathVariable Long id) {
    ...
}
```

## Qué ve Spring
Ve una regla de mapeo entre una request HTTP y un método Java.

## Quién la procesa
Spring MVC o Spring WebFlux, según el stack usado.

## Qué pasa por detrás
Spring registra metadata de routing:
- path
- método HTTP
- headers opcionales
- media types
- parámetros requeridos

Cuando llega una request, el dispatcher busca qué handler coincide con esa metadata.

## Qué mecanismo real participa
- `HandlerMapping`
- resolución de endpoints
- invocación de método controlador

## Cómo sería a mano
- levantar un servidor HTTP
- comparar method + path
- parsear segmentos de URL
- elegir un handler
- invocar el método correcto

## Idea mental correcta
Estas anotaciones no “ejecutan lógica web”.
Le describen al motor web cómo enrutar una request hacia un método.

---

# 7. `@PathVariable`, `@RequestParam`, `@RequestBody`

## `@PathVariable`

```java
@GetMapping("/{id}")
public ProductDto findById(@PathVariable Long id) {
    ...
}
```

### Qué pasa por detrás
Spring toma un fragmento de la URL, lo extrae, lo convierte al tipo Java esperado y lo pasa como argumento del método.

### Manualmente
Vos tendrías que parsear `/products/15`, extraer `"15"` y convertirlo a `Long`.

---

## `@RequestParam`

```java
@GetMapping
public List<ProductDto> search(@RequestParam String q) {
    ...
}
```

### Qué pasa por detrás
Spring toma parámetros de query string o form data y los enlaza al parámetro del método.

### Manualmente
Vos tendrías que leer `?q=mouse`, validar si existe, convertir tipos y pasarlo vos mismo.

---

## `@RequestBody`

```java
@PostMapping
public ProductDto create(@RequestBody CreateProductRequest request) {
    ...
}
```

### Qué pasa por detrás
Spring:
- lee el body de la request
- detecta el content type
- elige un `HttpMessageConverter`
- deserializa JSON a un objeto Java

### Manualmente
Tendrías que:
- leer bytes del body
- convertir el JSON a objeto
- manejar errores de parseo
- validar el contenido

## Idea mental correcta
Estas anotaciones son **adaptadores declarativos** entre datos HTTP y parámetros Java.

---

# 8. `@Transactional`

```java
@Transactional
public void createOrder(Order order) {
    orderRepository.save(order);
    auditRepository.save(...);
}
```

## Qué ve Spring
Un método que debe ejecutarse con semántica transaccional.

## Quién la procesa
La infraestructura de transacciones de Spring.

## Qué pasa por detrás
Muy importante: en la mayoría de los casos, Spring no modifica el cuerpo del método.

Lo que hace es crear un **proxy** alrededor del bean.

Cuando una llamada externa entra por ese proxy:
1. abre o participa en una transacción
2. ejecuta el método real
3. hace commit o rollback según corresponda

## Qué mecanismo real participa
- proxy
- AOP / method interception
- `PlatformTransactionManager`

## Punto clave
Las llamadas internas dentro de la misma clase normalmente **no pasan por el proxy**, por eso hay casos donde `@Transactional` “no parece funcionar”.

## Cómo sería a mano
```java
connection.setAutoCommit(false);
try {
    // operaciones
    connection.commit();
} catch (Exception e) {
    connection.rollback();
    throw e;
}
```

## Idea mental correcta
`@Transactional` no “mete una transacción dentro del método”.
Hace que el método sea **invocado bajo una capa de infraestructura transaccional**.

---

# 9. `@Async` y `@EnableAsync`

```java
@EnableAsync
@Configuration
public class AsyncConfig {
}
```

```java
@Async
public void sendEmail() {
    ...
}
```

## Qué ve Spring
Un método que debe ejecutarse de forma asíncrona, normalmente usando un executor.

## Quién la procesa
La infraestructura de ejecución asíncrona de Spring.

## Qué pasa por detrás
Otra vez, el patrón es proxy + intercepción:
- Spring detecta métodos `@Async`
- crea una envoltura que delega la ejecución a un executor
- la llamada vuelve antes de que termine el trabajo real

## Qué mecanismo real participa
- proxy
- executor
- infraestructura async habilitada con `@EnableAsync`

## Cómo sería a mano
```java
executor.submit(() -> sendEmailInterno());
```

## Idea mental correcta
`@Async` no hace que Java “se vuelva paralelo”.
Le dice a Spring que esa llamada debe delegarse a un ejecutor asíncrono.

---

# 10. `@Cacheable` y `@EnableCaching`

```java
@EnableCaching
@Configuration
public class CacheConfig {
}
```

```java
@Cacheable("products")
public ProductDto findById(Long id) {
    ...
}
```

## Qué ve Spring
Un método cuyos resultados pueden almacenarse y reutilizarse.

## Quién la procesa
La abstracción de caché de Spring.

## Qué pasa por detrás
De nuevo, se usa intercepción:
- antes de ejecutar el método, Spring calcula una clave
- revisa si existe un valor cacheado
- si existe, devuelve ese valor sin ejecutar el método
- si no existe, ejecuta el método y guarda el resultado

## Qué mecanismo real participa
- proxy o advice
- `CacheManager`
- resolución de claves

## Cómo sería a mano
```java
if (cache.containsKey(id)) {
    return cache.get(id);
}
ProductDto dto = loadFromDatabase(id);
cache.put(id, dto);
return dto;
```

## Idea mental correcta
`@Cacheable` no “hace más rápido el método”.
Hace que ciertas invocaciones futuras eviten ejecutar de nuevo la lógica real.

---

# 11. `@EventListener` y `@TransactionalEventListener`

```java
@EventListener
public void handleProductCreated(ProductCreatedEvent event) {
    ...
}
```

## Qué ve Spring
Un método que debe reaccionar cuando se publica un evento de aplicación.

## Quién la procesa
La infraestructura de eventos del contexto Spring.

## Qué pasa por detrás
Cuando alguien publica un evento, Spring busca listeners compatibles y llama los métodos registrados.

## Qué mecanismo real participa
- event publisher
- multicaster de eventos
- listeners registrados

## Cómo sería a mano
Tendrías que implementar tu propio sistema de observadores:
- lista de listeners
- registro manual
- dispatch de eventos

---

## `@TransactionalEventListener`

```java
@TransactionalEventListener
public void afterCommit(OrderCreatedEvent event) {
    ...
}
```

### Qué cambia
Este listener no se dispara simplemente “cuando se publica”.
Queda vinculado al ciclo de vida de la transacción, normalmente al commit exitoso.

### Idea mental correcta
Sirve para expresar:

> “reaccioná al evento, pero solo cuando la transacción realmente quedó confirmada”.

---

# 12. `@ConfigurationProperties`

```java
@ConfigurationProperties(prefix = "app.mail")
public class MailProperties {
    private String from;
    private int retryCount;
}
```

## Qué ve Spring Boot
Una clase o bean al que se le deben enlazar propiedades externas.

## Quién la procesa
Spring Boot, durante el binding de configuración.

## Qué pasa por detrás
Spring Boot:
- lee propiedades desde archivos, variables de entorno, argumentos, etc.
- busca las claves compatibles con el prefijo
- convierte strings a tipos Java
- llena un objeto tipado

## Qué mecanismo real participa
- binder de configuración
- fuentes de configuración externas
- conversión de tipos

## Cómo sería a mano
Tendrías que:
- leer `application.properties`
- parsear valores
- convertir tipos
- llenar un POJO manualmente

## Idea mental correcta
`@ConfigurationProperties` no “lee properties por arte de magia”.
Declara un contrato de binding entre configuración externa y un objeto Java tipado.

---

# 13. `@PreAuthorize` y `@EnableMethodSecurity`

```java
@EnableMethodSecurity
@Configuration
public class SecurityConfig {
}
```

```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteProduct(Long id) {
    ...
}
```

## Qué ve Spring Security
Una regla de autorización a nivel método.

## Quién la procesa
La infraestructura de method security de Spring Security.

## Qué pasa por detrás
Antes de permitir la invocación del método:
- se inspecciona el contexto de seguridad actual
- se evalúa la expresión
- si la condición se cumple, la llamada continúa
- si no, se rechaza

## Qué mecanismo real participa
- interceptor de seguridad
- evaluación de expresiones
- `SecurityContext`

## Cómo sería a mano
Tendrías que escribir algo parecido a:
```java
if (!currentUser.hasRole("ADMIN")) {
    throw new ForbiddenException();
}
deleteProductReal(id);
```

## Idea mental correcta
`@PreAuthorize` no es solo una etiqueta.
Es una regla declarativa que la infraestructura de seguridad evalúa **antes** de la ejecución real.

---

# 14. `@Entity`, `@Id` y relaciones JPA

```java
@Entity
public class Product {

    @Id
    private Long id;

    private String name;
}
```

## Qué ve JPA / Hibernate
Ve una clase que representa una entidad persistente.

## Quién la procesa
El proveedor JPA, normalmente Hibernate en proyectos Spring Boot.

## Qué pasa por detrás
Se construye metadata de mapeo:
- qué clase representa una tabla o estructura persistente
- qué campo identifica la fila
- cómo persistir y reconstruir objetos
- cómo mapear relaciones

## Qué mecanismo real participa
- metadata ORM
- `EntityManager`
- generación o interpretación de SQL
- contexto de persistencia

## Cómo sería a mano
Tendrías que escribir:
- SQL de insert / update / select / delete
- mapeo fila -> objeto
- mapeo objeto -> fila
- manejo de relaciones

## Idea mental correcta
`@Entity` no guarda nada por sí sola.
Define la forma en que el ORM debe tratar esa clase dentro del modelo persistente.

---

# 15. `@Query` en Spring Data JPA

```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("select p from Product p where p.name like %:text%")
    List<Product> search(String text);
}
```

## Qué ve Spring Data JPA
Un método de repositorio asociado a una query explícita.

## Quién la procesa
La infraestructura de repositorios de Spring Data JPA.

## Qué pasa por detrás
Spring Data genera una implementación del repositorio y asocia ese método con la query declarada.

## Qué mecanismo real participa
- proxy de repositorio
- infraestructura Spring Data
- integración con JPA / `EntityManager`

## Cómo sería a mano
Tendrías que:
- implementar la clase del repositorio
- escribir la consulta
- crear la query
- setear parámetros
- ejecutar
- mapear resultados

## Idea mental correcta
`@Query` no reemplaza a JPA.
Le dice a la infraestructura de repositorios qué consulta ejecutar para ese método.

---

# 16. Patrones internos que se repiten una y otra vez

Si querés entender Spring en serio, hay pocos patrones internos que aparecen una y otra vez.

## Patrón 1: Escaneo y registro
Se usa con:
- `@Component`
- `@Service`
- `@Repository`
- `@Controller`

Pregunta clave:
> ¿Esta anotación hace que Spring descubra y registre algo?

---

## Patrón 2: Declaración de beans
Se usa con:
- `@Configuration`
- `@Bean`

Pregunta clave:
> ¿Esta anotación define cómo fabricar un objeto administrado?

---

## Patrón 3: Routing y binding web
Se usa con:
- `@RequestMapping`
- `@GetMapping`
- `@PathVariable`
- `@RequestParam`
- `@RequestBody`

Pregunta clave:
> ¿Esta anotación conecta datos HTTP con una llamada Java?

---

## Patrón 4: Proxy e intercepción
Se usa con:
- `@Transactional`
- `@Async`
- `@Cacheable`
- `@PreAuthorize`

Pregunta clave:
> ¿Esta anotación no cambia el método, sino la forma en que la llamada es envuelta o interceptada?

---

## Patrón 5: Metadata de modelo
Se usa con:
- `@Entity`
- `@Id`
- relaciones JPA

Pregunta clave:
> ¿Esta anotación describe cómo debe tratarse esta clase o campo dentro de otro sistema?

---

# 17. Cómo estudiar anotaciones de forma sana

## En vez de:
- memorizar listas gigantes
- aprender nombres aislados
- copiar ejemplos sin saber por qué funcionan

## Hacé esto:
Para cada anotación, escribí una mini ficha con estas columnas:

1. Nombre
2. Módulo (`Spring MVC`, `Security`, `Data JPA`, etc.)
3. Dónde se usa
4. Quién la procesa
5. Qué efecto real tiene
6. Cómo sería a mano
7. Error común asociado

Ejemplo corto:

| Anotación | Módulo | Quién la procesa | Efecto real | Equivalente manual |
|---|---|---|---|---|
| `@Service` | Core | contenedor | registra un bean | `new Service()` |
| `@GetMapping` | MVC | dispatcher/routing | mapea request a método | if path + método coincide |
| `@Transactional` | Tx | proxy + tx manager | abre/gestiona transacción | begin / commit / rollback |
| `@RequestBody` | MVC | converter | JSON -> objeto Java | parsear body manualmente |

---

# 18. Errores mentales típicos

## Error 1: “La anotación hace la lógica”
No. La lógica la hace el framework que interpreta la anotación.

## Error 2: “Si está anotado, seguro funciona”
No. Depende de que el subsistema correspondiente esté activo y configurado.

Ejemplos:
- `@Async` necesita soporte async habilitado
- `@PreAuthorize` necesita method security habilitado
- `@Cacheable` necesita caching habilitado
- `@Transactional` depende de cómo se llama el método y del proxy

## Error 3: “Entender Spring = memorizar anotaciones”
No. Entender Spring es entender:
- contenedor
- beans
- escaneo
- proxies
- dispatcher web
- binding
- persistencia
- seguridad

Las anotaciones son solo la interfaz declarativa para operar esos mecanismos.

---

# 19. Un método de estudio muy efectivo

Tomá una anotación y hacé este ejercicio:

## Paso 1
Escribí un ejemplo mínimo.

## Paso 2
Describí en una frase qué promete.

## Paso 3
Nombrá el subsistema que la procesa.

## Paso 4
Decí qué objeto o mecanismo real participa.

## Paso 5
Escribí el equivalente manual.

Por ejemplo, con `@Transactional`:

- ejemplo: método de servicio con dos saves
- promesa: ejecutar con semántica transaccional
- subsistema: infraestructura de transacciones de Spring
- mecanismo: proxy + `PlatformTransactionManager`
- equivalente manual: begin / try / commit / rollback

Si repetís esto 20 veces, dejás de ver Spring como magia.

---

# 20. Resumen final

La clave no es aprender “muchas anotaciones”.

La clave es aprender a reconocer **qué patrón interno representa cada una**:

- registro
- configuración
- routing
- binding
- proxy
- seguridad
- metadata ORM

Cuando pensás así, las anotaciones dejan de ser atajos incomprensibles y pasan a ser **una forma declarativa de pedir infraestructura**.

En otras palabras:

> una anotación de Spring no suele “hacer” algo por sí sola; más bien le dice a una pieza del framework cómo debe tratar una clase, método, campo o parámetro.

Y esa idea cambia por completo la forma de estudiar Spring.

---

# Fuentes oficiales consultadas

Esta guía se apoya en la documentación oficial de Spring Framework, Spring Boot, Spring Security y Spring Data JPA, especialmente en los apartados dedicados a:

- `@SpringBootApplication`
- `@Autowired`
- `@Configuration` y `@Bean`
- `@RequestMapping`
- `@Transactional`
- `@EventListener` y `@TransactionalEventListener`
- `@EnableAsync` y `@Async`
- caché declarativa con `@Cacheable`
- `@ConfigurationProperties`
- seguridad de métodos con `@PreAuthorize`
- repositorios y `@Query` en Spring Data JPA
- auditoría y soporte de entidades en Spring Data JPA / JPA

Recomendación práctica: cuando estudies una anotación nueva, buscala directamente en la referencia oficial del módulo correspondiente y no en blogs genéricos.
