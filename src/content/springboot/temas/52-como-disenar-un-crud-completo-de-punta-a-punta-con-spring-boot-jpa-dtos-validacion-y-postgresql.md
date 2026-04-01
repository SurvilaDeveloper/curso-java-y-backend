---
title: "Cómo diseñar un CRUD completo de punta a punta con Spring Boot, JPA, DTOs, validación y PostgreSQL"
description: "Entender cómo se conectan controller, service, repository, DTOs, validación, entidades y PostgreSQL al construir un CRUD real de extremo a extremo en Spring Boot."
order: 52
module: "Persistencia con Spring Data JPA"
level: "base"
draft: false
---

En los temas anteriores viste por separado muchas piezas fundamentales:

- entidades JPA
- repositories con Spring Data JPA
- queries derivadas y `@Query`
- paginación
- relaciones entre entidades
- `@Transactional`
- migraciones con Flyway
- conexión real con PostgreSQL
- DTOs
- validación
- manejo de errores
- arquitectura por capas

Todo eso es muchísimo contenido.

Pero ahora aparece una necesidad muy importante:

> dejar de pensar cada pieza aislada y ver cómo se conectan todas dentro de una feature real.

Ese es el foco de este tema.

Acá vas a ver cómo diseñar un CRUD completo de punta a punta, es decir, una funcionalidad donde:

- entra un request HTTP
- se valida
- pasa por el controller
- el service aplica lógica
- el repository persiste o consulta
- la entidad vive en PostgreSQL
- la respuesta vuelve como DTO
- y los errores se manejan de forma coherente

Este tipo de ejercicio es clave porque te permite consolidar un montón de conceptos que por separado ya entendés, pero que ahora tienen que funcionar juntos dentro de una misma pieza de aplicación.

## Qué significa “CRUD completo de punta a punta”

CRUD suele referirse a las cuatro operaciones básicas más comunes sobre un recurso:

- **Create** → crear
- **Read** → leer
- **Update** → actualizar
- **Delete** → eliminar

Cuando decimos “de punta a punta”, lo que queremos decir es que no nos quedamos solo con un método o una entidad suelta.

Queremos ver el flujo completo:

- contrato HTTP
- DTOs
- validación
- lógica del caso de uso
- persistencia real
- respuestas
- errores

Es decir:

> no solo que el backend “tenga un repository”, sino que el caso de uso esté realmente armado de extremo a extremo.

## Qué recurso conviene usar para aprender esto

Podría ser casi cualquiera:

- producto
- categoría
- usuario
- tarea
- artículo
- pedido

Para este tema, vamos a usar un ejemplo bastante claro y didáctico: **Producto**.

Es un recurso cómodo porque permite mostrar cosas como:

- creación
- consulta
- actualización
- eliminación
- validación
- unicidad simple si querés
- listados
- DTOs de entrada y salida
- persistencia con PostgreSQL

## El mapa general del flujo

Podés pensar un CRUD sano así:

```text
HTTP Request
   ↓
Controller
   ↓
DTO de entrada + validación
   ↓
Service
   ↓
Entidad JPA
   ↓
Repository
   ↓
PostgreSQL
   ↑
Entidad
   ↑
Mapper
   ↑
DTO de salida
   ↑
HTTP Response
```

Este mapa resume muy bien por qué este tema es tan importante:
porque une casi todo lo que venías viendo.

## Paso 1: definir la entidad

Supongamos una entidad `Producto` así:

```java
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Producto {

    @Id
    @GeneratedValue
    private Long id;

    private String titulo;
    private double precio;
    private int stock;
    private boolean activo;

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}
```

Esta entidad representa el modelo persistente principal del recurso.

## Por qué esta entidad no debería ser automáticamente el contrato HTTP

Esto conecta muy bien con temas anteriores.

La entidad sirve para persistencia.
Pero el cliente HTTP no necesariamente debería enviar o recibir exactamente esta misma clase.

Por ejemplo:

- al crear un producto, el cliente no debería mandar `id`
- quizá tampoco convenga que mande `activo`
- al responder, quizá querés mostrar ciertos campos y no otros
- más adelante la entidad podría crecer con cosas internas

Por eso usamos DTOs.

## Paso 2: definir el DTO de creación

```java
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class CrearProductoRequest {

    @NotBlank
    @Size(min = 3, max = 120)
    private String titulo;

    @Positive
    private double precio;

    @PositiveOrZero
    private int stock;

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }
}
```

Este DTO define claramente:

- qué datos entran al crear
- qué validaciones mínimas se aplican
- qué campos controla el cliente

Eso ya da bastante claridad al contrato.

## Paso 3: definir el DTO de actualización

No siempre el request de actualización tiene que ser igual al de creación, pero muchas veces puede parecerse bastante.

```java
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class ActualizarProductoRequest {

    @NotBlank
    @Size(min = 3, max = 120)
    private String titulo;

    @Positive
    private double precio;

    @PositiveOrZero
    private int stock;

    private boolean activo;

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}
```

Esto muestra algo importante: el contrato de actualización puede incluir cosas que el de creación no incluía.

## Paso 4: definir el DTO de respuesta

```java
public class ProductoResponse {

    private Long id;
    private String titulo;
    private double precio;
    private int stock;
    private boolean activo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}
```

Este DTO representa lo que la API devuelve hacia afuera.

## Qué gana la API con esta separación

Muchísimo.

Ahora está claro:

- qué entra al crear
- qué entra al actualizar
- qué sale al responder
- qué queda como modelo persistente interno

Esto evita pedirle a una sola clase que sirva para todo.

## Paso 5: definir el repository

```java
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByTitulo(String titulo);

    boolean existsByTitulo(String titulo);
}
```

Este repository ya tiene:

- CRUD básico por herencia de `JpaRepository`
- chequeo de unicidad por título
- búsqueda por un campo natural simple

Es una base bastante realista.

## Paso 6: definir una excepción de negocio

Por ejemplo, si querés que el título sea único.

```java
public class ProductoDuplicadoException extends RuntimeException {

    public ProductoDuplicadoException(String message) {
        super(message);
    }
}
```

Y también una excepción para recurso no encontrado.

```java
public class ProductoNoEncontradoException extends RuntimeException {

    public ProductoNoEncontradoException(String message) {
        super(message);
    }
}
```

Esto hace el código mucho más expresivo que usar excepciones genéricas.

## Paso 7: definir el mapper

```java
import org.springframework.stereotype.Component;

@Component
public class ProductoMapper {

    public Producto toEntity(CrearProductoRequest request) {
        Producto producto = new Producto();
        producto.setTitulo(request.getTitulo());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        producto.setActivo(true);
        return producto;
    }

    public ProductoResponse toResponse(Producto producto) {
        ProductoResponse response = new ProductoResponse();
        response.setId(producto.getId());
        response.setTitulo(producto.getTitulo());
        response.setPrecio(producto.getPrecio());
        response.setStock(producto.getStock());
        response.setActivo(producto.isActivo());
        return response;
    }

    public void updateEntity(ActualizarProductoRequest request, Producto producto) {
        producto.setTitulo(request.getTitulo());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        producto.setActivo(request.isActivo());
    }
}
```

Este mapper ya resuelve tres cosas muy útiles:

- request de creación → entidad
- entidad → response
- request de actualización → mutación de entidad existente

## Por qué esto ayuda tanto

Porque el service puede enfocarse más en el caso de uso y menos en transformar manualmente estructuras una y otra vez.

## Paso 8: definir el service

Acá empieza a verse el corazón del flujo.

```java
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ProductoMapper productoMapper;

    public ProductoService(ProductoRepository productoRepository, ProductoMapper productoMapper) {
        this.productoRepository = productoRepository;
        this.productoMapper = productoMapper;
    }

    @Transactional
    public ProductoResponse crear(CrearProductoRequest request) {
        if (productoRepository.existsByTitulo(request.getTitulo())) {
            throw new ProductoDuplicadoException("Ya existe un producto con ese título");
        }

        Producto producto = productoMapper.toEntity(request);
        Producto guardado = productoRepository.save(producto);

        return productoMapper.toResponse(guardado);
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtener(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ProductoNoEncontradoException("No existe el producto " + id));

        return productoMapper.toResponse(producto);
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listar() {
        return productoRepository.findAll()
                .stream()
                .map(productoMapper::toResponse)
                .toList();
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ActualizarProductoRequest request) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ProductoNoEncontradoException("No existe el producto " + id));

        if (!producto.getTitulo().equals(request.getTitulo())
                && productoRepository.existsByTitulo(request.getTitulo())) {
            throw new ProductoDuplicadoException("Ya existe un producto con ese título");
        }

        productoMapper.updateEntity(request, producto);

        Producto actualizado = productoRepository.save(producto);

        return productoMapper.toResponse(actualizado);
    }

    @Transactional
    public void eliminar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ProductoNoEncontradoException("No existe el producto " + id));

        productoRepository.delete(producto);
    }
}
```

Este service ya consolida muchísimo de lo que venías aprendiendo.

## Qué responsabilidades está tomando el service

### Crear
- valida unicidad
- transforma request a entidad
- persiste
- devuelve DTO de salida

### Obtener
- busca por id
- lanza excepción si no existe
- mapea a response

### Listar
- consulta todos
- transforma a responses

### Actualizar
- busca entidad existente
- valida unicidad si cambia el título
- aplica cambios
- guarda
- devuelve response

### Eliminar
- busca
- valida existencia
- borra

Eso ya es un CRUD bastante serio y coherente.

## Qué relación tiene esto con `@Transactional`

Muy fuerte.

El service define los casos de uso.

Y esos casos de uso suelen ser un lugar natural para definir la unidad transaccional.

Por ejemplo:

- crear un producto → transaccional
- actualizar → transaccional
- eliminar → transaccional
- leer → muchas veces `readOnly = true` tiene sentido conceptual

No hace falta obsesionarse todavía con todas las optimizaciones finas, pero ya se ve una intención arquitectónica bastante sana.

## Paso 9: definir el controller

```java
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody CrearProductoRequest request) {
        ProductoResponse response = productoService.crear(request);
        return ResponseEntity.status(201).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> obtener(@PathVariable Long id) {
        ProductoResponse response = productoService.obtener(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductoResponse>> listar() {
        List<ProductoResponse> response = productoService.listar();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarProductoRequest request
    ) {
        ProductoResponse response = productoService.actualizar(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
```

Este controller ya muestra muy bien una capa web limpia.

## Qué está haciendo bien este controller

- recibe requests
- valida con `@Valid`
- delega al service
- devuelve respuestas HTTP coherentes
- no mete lógica de persistencia adentro
- no mezcla reglas de negocio pesadas
- no construye respuestas de error manuales en cada método

Eso es exactamente la dirección que venías construyendo tema a tema.

## Paso 10: definir manejo de errores centralizado

```java
public class ApiErrorResponse {

    private int status;
    private String error;
    private String message;

    public ApiErrorResponse(int status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }
}
```

Y el `@ControllerAdvice`:

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ProductoNoEncontradoException.class)
    public ResponseEntity<ApiErrorResponse> manejarProductoNoEncontrado(ProductoNoEncontradoException ex) {
        ApiErrorResponse error = new ApiErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                "not_found",
                ex.getMessage()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ProductoDuplicadoException.class)
    public ResponseEntity<ApiErrorResponse> manejarProductoDuplicado(ProductoDuplicadoException ex) {
        ApiErrorResponse error = new ApiErrorResponse(
                HttpStatus.CONFLICT.value(),
                "conflict",
                ex.getMessage()
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> manejarErrorGeneral(Exception ex) {
        ApiErrorResponse error = new ApiErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "internal_error",
                "Ocurrió un error interno inesperado"
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

Ahora el CRUD ya tiene un contrato de errores mucho más serio.

## Qué falta todavía para que esto sea “real de verdad”

Con lo visto hasta acá, ya falta poco.

Las otras dos piezas grandes son:

- la base PostgreSQL real
- el esquema de base

Y eso conecta con:

- `application.properties`
- Flyway

## Paso 11: migración inicial

Archivo:

```text
src/main/resources/db/migration/V1__crear_tabla_producto.sql
```

Contenido:

```sql
CREATE TABLE producto (
    id BIGINT PRIMARY KEY,
    titulo VARCHAR(120) NOT NULL UNIQUE,
    precio DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    activo BOOLEAN NOT NULL
);
```

Esto hace que el esquema quede versionado y acompañe a la entidad.

## Paso 12: configuración de PostgreSQL

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/curso_springboot
spring.datasource.username=postgres
spring.datasource.password=123456
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.show-sql=true
```

Con esto, la aplicación ya puede hablar con PostgreSQL real.

## Qué queda armado ahora

Si unís todas las piezas, tenés algo así:

- entidad `Producto`
- DTOs de request y response
- mapper
- repository
- service transaccional
- controller REST
- manejo de errores
- migración Flyway
- conexión a PostgreSQL

Eso ya es un CRUD completo de punta a punta.

## Cómo se ve el flujo de creación

Imaginá un request así:

```json
{
  "titulo": "Notebook Gamer",
  "precio": 2500,
  "stock": 10
}
```

Flujo:

1. entra al endpoint `POST /productos`
2. `@Valid` valida el body
3. el controller delega al service
4. el service verifica si ya existe un producto con ese título
5. el mapper transforma request → entidad
6. el repository guarda en PostgreSQL
7. el mapper transforma entidad → response
8. el controller devuelve `201 Created`

Ese flujo resume muchísimos conceptos del curso funcionando juntos.

## Cómo se ve el flujo de lectura

Request:

```text
GET /productos/10
```

Flujo:

1. entra al controller
2. el service busca por id
3. si no existe, lanza `ProductoNoEncontradoException`
4. si existe, se mapea a `ProductoResponse`
5. el controller devuelve `200 OK`

Y si no existe:

- el `@ControllerAdvice` devuelve `404 Not Found`

Esto ya se parece muchísimo a una API profesional.

## Cómo se ve el flujo de actualización

Request:

```text
PUT /productos/10
```

Body:

```json
{
  "titulo": "Notebook Pro",
  "precio": 3000,
  "stock": 5,
  "activo": true
}
```

Flujo:

1. validación del body
2. búsqueda del producto existente
3. chequeo de conflicto si cambia el título
4. aplicación de cambios sobre la entidad
5. persistencia
6. mapeo a response
7. respuesta `200 OK`

## Cómo se ve el flujo de eliminación

Request:

```text
DELETE /productos/10
```

Flujo:

1. búsqueda por id
2. si no existe, `404`
3. si existe, delete
4. respuesta `204 No Content`

Esto muestra por qué los códigos HTTP que viste antes encajan tan bien dentro de un CRUD real.

## Qué aporta PostgreSQL específicamente en este escenario

PostgreSQL no cambia la arquitectura del CRUD, pero sí le da un soporte real de persistencia.

Ahora los datos:

- se guardan de verdad
- sobreviven según el entorno
- pueden consultarse luego
- pueden validarse contra restricciones reales
- forman parte de un esquema relacional serio

Eso hace que el ejercicio deje de ser “un CRUD de juguete” y se acerque mucho más a una feature real.

## Qué relación tiene esto con el diseño limpio

Muy fuerte.

Un CRUD “que funciona” podría armarse mucho peor.
Por ejemplo:

- controller enorme
- entidad usada para todo
- sin DTOs
- sin validación
- sin excepciones claras
- sin separación de capas
- sin migraciones
- sin mapper
- sin respuesta consistente

Y aun así podría parecer que anda.

Pero este tema justamente busca mostrarte algo mejor:

> cómo se ve un CRUD cuando conectás bien todas las piezas del diseño que fuiste aprendiendo.

## Qué todavía no estás resolviendo del todo

Aunque este CRUD ya es bastante serio, todavía no estás entrando a fondo en cosas como:

- paginación del listado
- filtros
- soft delete
- relaciones complejas
- seguridad
- auditoría
- testing automatizado
- documentación OpenAPI
- eventos de dominio
- concurrencia
- validaciones más avanzadas

Y está perfecto.

La idea acá no es resolver todo el backend del mundo de una vez, sino consolidar una feature realista y bien estructurada.

## Un muy buen mapa mental

Podés resumir el CRUD completo así:

### Create
- request DTO
- validación
- service
- entidad
- save
- response DTO
- `201`

### Read
- path variable
- findById
- excepción si no existe
- response DTO
- `200`

### Update
- request DTO
- validación
- búsqueda previa
- actualización de entidad
- save
- response DTO
- `200`

### Delete
- búsqueda previa
- delete
- `204`

Ese mapa es muy potente porque ordena mucho las responsabilidades.

## Una variante muy sana: separar listado y detalle

A medida que el CRUD crece, puede tener mucho sentido usar distintos DTOs para distintos endpoints.

Por ejemplo:

- `ProductoResumenResponse` para listados
- `ProductoDetalleResponse` para detalle

Esto no es obligatorio desde el minuto uno, pero conviene ya intuir que el contrato puede crecer en sofisticación sin romper la separación de capas.

## Qué relación tiene esto con frontend

Muy directa.

Un frontend suele agradecer mucho que el backend tenga:

- DTOs claros
- errores claros
- códigos HTTP correctos
- contratos estables
- validación coherente
- respuestas sin campos internos ni basura relacional

Todo lo que hiciste en este CRUD ayuda directamente a eso.

## Qué relación tiene esto con testing

También muy fuerte.

Una arquitectura así es mucho más fácil de testear porque:

- el controller tiene un foco claro
- el service tiene lógica bien localizada
- el mapper puede probarse aparte si hace falta
- el repository puede probarse como capa de persistencia
- las excepciones son explícitas

Esto hace que el proyecto no solo “ande”, sino que también sea más mantenible.

## Error común: pensar que un CRUD completo es solo controller + repository

Eso puede funcionar para demos muy mínimas, pero se queda corto muy rápido.

Un CRUD realmente sano suele necesitar:

- DTOs
- validación
- service
- errores
- mapeo
- persistencia real
- estructura de respuesta clara

## Error común: usar la entidad como request y response porque “es más fácil”

Puede parecer más fácil por unos minutos.
Pero después trae problemas de:

- acoplamiento
- exposición innecesaria
- mezcla de responsabilidades
- falta de control del contrato

Justamente este tema muestra por qué un CRUD más cuidado se beneficia mucho de la separación.

## Error común: meter toda la lógica en el controller

Ya lo viste varias veces, pero acá se vuelve especialmente visible.

Un CRUD bien armado no debería tener controladores que hagan:

- validación manual extensa
- chequeos de unicidad
- acceso a repository directo
- mapeo repetitivo
- decisiones de dominio complejas

Eso pertenece mucho más a service, mapper y manejo global de errores.

## Error común: no pensar en la base real desde el principio del caso de uso

A veces uno diseña el CRUD “en abstracto” y recién después intenta ver qué pasa en la base.

Pero cuando integrás PostgreSQL y migraciones desde temprano, la feature se vuelve mucho más realista y aparecen antes los problemas verdaderos del diseño.

Eso es algo bueno.

## Una buena heurística final

Podés pensar así:

> si podés explicar claramente qué entra, qué se valida, qué entidad se persiste, qué reglas se aplican, qué error puede aparecer y qué DTO se devuelve, entonces tu CRUD ya está bastante bien armado.

Esa es una brújula muy útil.

## Relación con Spring Boot

Spring Boot hace que todo este armado sea mucho más fluido porque integra muy bien:

- web
- validación
- JPA
- datasource
- PostgreSQL
- manejo de errores
- inyección de dependencias
- arquitectura por capas

Eso hace que un CRUD completo de punta a punta se pueda construir con mucha menos fricción que en stacks más manuales.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> un CRUD completo de punta a punta en Spring Boot no es solo “guardar y listar”, sino una composición coherente de DTOs, validación, controller, service, repository, entidad, manejo de errores y base de datos real, todos colaborando para construir una feature clara, mantenible y operativa.

## Resumen

- Un CRUD completo conecta muchas piezas del backend y no solo el repository.
- La entidad representa persistencia; los DTOs controlan entrada y salida.
- El controller gestiona HTTP y delega.
- El service concentra la lógica del caso de uso y las reglas principales.
- El repository resuelve acceso a datos.
- Las excepciones de negocio y el `@ControllerAdvice` mejoran mucho el contrato de error.
- PostgreSQL y Flyway hacen que el caso de uso funcione de verdad sobre una base real.

## Próximo tema

En el próximo tema vas a ver cómo probar repositories, services y endpoints en Spring Boot, porque una vez que ya sabés construir una feature completa, el paso siguiente natural es aprender a verificarla con tests útiles y bien ubicados.
