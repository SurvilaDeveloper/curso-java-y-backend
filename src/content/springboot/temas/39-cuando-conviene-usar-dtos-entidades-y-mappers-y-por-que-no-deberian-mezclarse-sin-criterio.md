---
title: "Cuándo conviene usar DTOs, entidades y mappers y por qué no deberían mezclarse sin criterio"
description: "Entender qué rol cumplen los DTOs, las entidades y los mappers en una aplicación Spring Boot, y por qué separar estos objetos mejora mucho la claridad entre la capa web, la lógica del sistema y la persistencia."
order: 39
module: "Arquitectura por capas en Spring Boot"
level: "base"
draft: false
---

En el tema anterior viste cómo separar **controller**, **service** y **repository** para repartir mejor las responsabilidades entre la capa web, la lógica del sistema y el acceso a datos.

Esa separación ya mejora muchísimo la arquitectura.

Pero enseguida aparece otra pregunta muy importante:

> si las capas están separadas, ¿deberían trabajar todas con exactamente los mismos objetos?

Por ejemplo:

- el controlador recibe un JSON
- el servicio aplica reglas
- el repositorio guarda datos
- y uno podría pensar: “bueno, usemos la misma clase para todo”

A veces eso parece cómodo al principio.
Pero cuando la aplicación crece, suele traer varios problemas.

Ahí entran tres conceptos muy importantes:

- **DTOs**
- **entidades**
- **mappers**

Este tema es clave porque te ayuda a no mezclar la capa web, la lógica del sistema y la persistencia como si todas hablaran exactamente el mismo idioma.

## El problema de usar la misma clase para todo

Supongamos que tenés una clase `Usuario`.

Y pretendés usarla para:

- recibir el request HTTP
- devolver la respuesta al cliente
- representar el modelo persistido
- aplicar lógica interna del sistema

Eso puede parecer práctico porque “ahorrás clases”.

Pero muy rápido aparecen preguntas incómodas:

- ¿ese objeto debería tener `password` cuando se devuelve al cliente?
- ¿el request de creación tiene los mismos campos que la respuesta?
- ¿la entidad de base de datos debería exponerse tal cual por la API?
- ¿qué pasa si la base tiene campos internos que no querés mostrar?
- ¿qué pasa si el contrato web cambia pero la persistencia no?
- ¿qué pasa si necesitás estructuras distintas para crear, actualizar y responder?

Cuando todo vive en la misma clase, esas fronteras se desdibujan demasiado.

## Qué es un DTO

DTO significa **Data Transfer Object**.

Dicho de forma simple, un DTO es un objeto pensado para **transportar datos entre capas o fronteras del sistema**.

En Spring Boot, muy a menudo se usan DTOs para:

- recibir datos del cliente
- devolver datos al cliente
- mover información entre partes del sistema con una forma controlada

No están pensados principalmente para persistencia.
Están pensados para representar datos con una intención concreta de transferencia.

## Qué es una entidad

Una entidad, en el contexto más común de aplicaciones Spring Boot con persistencia, suele representar un objeto que está ligado al modelo de datos y a la persistencia.

Más adelante, cuando entres fuerte en JPA, esto se va a volver todavía más importante.

Por ahora alcanza con esta idea:

> una entidad suele estar mucho más cerca de cómo el sistema modela y guarda un recurso en la base de datos.

Eso significa que una entidad puede contener cosas que no necesariamente tienen sentido en la API pública.

Por ejemplo:

- ids internos
- campos de auditoría
- timestamps técnicos
- relaciones de persistencia
- flags internos
- detalles que no querés exponer

## Qué es un mapper

Un mapper es una pieza cuyo trabajo consiste en **transformar un objeto en otro**.

Por ejemplo:

- de request DTO a entidad
- de entidad a response DTO
- de un modelo interno a un objeto de salida
- de una estructura de persistencia a una estructura web

Dicho de forma simple:

> el mapper traduce entre representaciones distintas.

No siempre hace falta una clase separada súper sofisticada desde el primer minuto, pero la idea de mapeo es fundamental para mantener las capas realmente separadas.

## Un primer ejemplo del problema

Supongamos esta clase:

```java
public class Usuario {

    private Long id;
    private String nombre;
    private String email;
    private String password;
    private boolean activo;
    private String rol;

    // getters y setters
}
```

Si usás esta misma clase para:

- recibir el body de creación
- devolver la respuesta del endpoint
- representar el usuario guardado

podrían aparecer problemas como estos:

- exponés `password` en respuestas por accidente
- permitís que el cliente envíe `rol` cuando no debería
- mezclás campos de entrada, salida y persistencia
- perdés claridad sobre qué contrato espera cada endpoint

Esto es un ejemplo muy típico de por qué separar modelos puede ser una gran idea.

## Una separación mucho más sana

Por ejemplo:

### DTO de request

```java
public class CrearUsuarioRequest {

    private String nombre;
    private String email;
    private String password;

    // getters y setters
}
```

### Entidad

```java
public class Usuario {

    private Long id;
    private String nombre;
    private String email;
    private String passwordHash;
    private boolean activo;
    private String rol;

    // getters y setters
}
```

### DTO de response

```java
public class UsuarioResponse {

    private Long id;
    private String nombre;
    private String email;
    private boolean activo;

    // getters y setters
}
```

Ahora cada objeto tiene una intención mucho más clara.

## Cómo leer esta separación

### `CrearUsuarioRequest`
Representa lo que el cliente puede mandar al crear un usuario.

### `Usuario`
Representa el modelo persistido o interno principal.

### `UsuarioResponse`
Representa lo que la API quiere exponer al cliente.

Eso ya resuelve muchísimos problemas de diseño.

## Por qué no conviene devolver entidades directamente

Esta es una de las ideas más importantes del tema.

A veces alguien hace esto:

```java
@GetMapping("/{id}")
public Usuario obtenerUsuario(@PathVariable Long id) {
    return usuarioService.obtenerPorId(id);
}
```

Y técnicamente puede funcionar.

Pero conceptualmente puede ser riesgoso o poco prolijo porque:

- exponés campos que quizá no deberías mostrar
- acoplás la API pública a la estructura de persistencia
- hacés más difícil evolucionar la capa web sin tocar la capa de datos
- abrís la puerta a fugas de detalles internos

Por eso, en aplicaciones más cuidadas, suele ser mucho más sano devolver un DTO de respuesta.

## Por qué no conviene recibir entidades directamente como request

Por ejemplo:

```java
@PostMapping
public ResponseEntity<?> crear(@RequestBody Usuario usuario) {
    ...
}
```

Esto también puede parecer cómodo, pero trae problemas parecidos:

- el cliente puede enviar campos que no debería controlar
- mezclás el contrato web con el modelo persistido
- la entidad queda expuesta a la estructura del request
- más adelante cuesta más separar validación, seguridad y persistencia

Usar DTOs de entrada suele dar mucho más control.

## Un patrón muy común

En muchísimas APIs aparece esta estructura:

- `CreateXRequest`
- `UpdateXRequest`
- `XResponse`
- `XEntity` o la entidad principal

Por ejemplo:

- `CrearProductoRequest`
- `ActualizarProductoRequest`
- `ProductoResponse`
- `Producto`

Esto ya te muestra que una misma “idea de negocio” puede tener distintas representaciones según la capa y el caso de uso.

## Qué gana la capa web con DTOs

Muchísimo.

La capa web puede definir con claridad:

- qué acepta
- qué devuelve
- qué campos son públicos
- qué nombres usa el contrato
- qué estructura conviene exponer

Eso le da independencia respecto de la persistencia.

## Qué gana la capa de persistencia con entidades propias

También mucho.

La persistencia puede modelar:

- ids
- columnas
- relaciones
- flags internos
- timestamps
- detalles técnicos

sin quedar completamente atada a cómo la API pública decide mostrar o recibir datos.

Eso da flexibilidad para evolucionar una capa sin romper automáticamente la otra.

## Qué gana el service con esta separación

La capa service puede operar con más claridad sobre:

- requests ya validados
- entidades del sistema
- respuestas construidas a partir del resultado
- decisiones explícitas sobre qué se persiste y qué se expone

En otras palabras, deja de vivir en una niebla donde “todo es el mismo objeto”.

## Un ejemplo simple de flujo completo

### Request DTO

```java
public class CrearProductoRequest {

    private String titulo;
    private double precio;
    private int stock;

    // getters y setters
}
```

### Entidad

```java
public class Producto {

    private Long id;
    private String titulo;
    private double precio;
    private int stock;
    private boolean activo;

    // getters y setters
}
```

### Response DTO

```java
public class ProductoResponse {

    private Long id;
    private String titulo;
    private double precio;
    private boolean activo;

    // getters y setters
}
```

### Service

```java
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    public ProductoResponse crearProducto(CrearProductoRequest request) {
        Producto producto = new Producto();
        producto.setId(1L);
        producto.setTitulo(request.getTitulo());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        producto.setActivo(true);

        ProductoResponse response = new ProductoResponse();
        response.setId(producto.getId());
        response.setTitulo(producto.getTitulo());
        response.setPrecio(producto.getPrecio());
        response.setActivo(producto.isActivo());

        return response;
    }
}
```

Este ejemplo ya muestra la idea central:
distintas representaciones para distintos momentos del flujo.

## Ahí aparece el mapper

En el ejemplo anterior, el service hizo el mapeo “a mano”.

Eso puede estar bien al principio, especialmente si el caso es pequeño.

Pero conceptualmente ya hay dos traducciones:

- de `CrearProductoRequest` a `Producto`
- de `Producto` a `ProductoResponse`

Eso es mapeo.

Y cuando el proyecto crece, muchas veces conviene extraer esa responsabilidad.

## Un mapper simple a mano

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
        response.setActivo(producto.isActivo());
        return response;
    }
}
```

Ahora el service puede enfocarse más en el flujo y menos en la transformación manual.

## El service usando el mapper

```java
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    private final ProductoMapper productoMapper;

    public ProductoService(ProductoMapper productoMapper) {
        this.productoMapper = productoMapper;
    }

    public ProductoResponse crearProducto(CrearProductoRequest request) {
        Producto producto = productoMapper.toEntity(request);

        producto.setId(1L);

        return productoMapper.toResponse(producto);
    }
}
```

Esto ya deja bastante más claras las responsabilidades.

## Cuándo conviene extraer un mapper

No hace falta crear un mapper separado para cualquier cosa diminuta.

Pero suele tener sentido cuando:

- el mapeo empieza a repetirse
- la entidad y los DTOs tienen diferencias claras
- el service empieza a llenarse de código de transformación
- querés reutilizar conversiones
- querés mantener más limpio el caso de uso

## Cuándo puede no hacer falta todavía

Si el caso es muy pequeño y el mapeo es trivial, podrías hacerlo directamente en el service sin problema.

La clave no es seguir una burocracia rígida, sino mantener claridad.

El principio importante es este:

> aunque no siempre tengas una clase mapper separada, conviene que conceptualmente entiendas que estás transformando entre representaciones distintas.

## Un ejemplo clásico: ocultar campos sensibles

Este es uno de los argumentos más fuertes a favor de los DTOs de salida.

Supongamos la entidad:

```java
public class Usuario {

    private Long id;
    private String nombre;
    private String email;
    private String passwordHash;
    private String rol;
    private boolean activo;

    // getters y setters
}
```

Si la devolvés directamente, podrías terminar exponiendo campos como:

- `passwordHash`
- `rol`
- flags internos que no querías mostrar

En cambio, con un `UsuarioResponse` podés decidir exactamente qué campos salen hacia afuera.

## Otro ejemplo clásico: request más chico que la entidad

Al crear un producto, el cliente quizá solo debería mandar:

- título
- precio
- stock

Pero la entidad puede tener además:

- id
- activo
- createdAt
- updatedAt
- version
- internalCode

No tiene sentido que el cliente controle todo eso.

Por eso el request DTO suele ser más chico y más específico que la entidad.

## DTOs distintos para crear y actualizar

Esto también es muy común.

No siempre el request de creación y el de actualización son iguales.

Por ejemplo:

### Crear
- requiere `nombre`
- requiere `email`
- requiere `password`

### Actualizar
- quizá permite cambiar `nombre`
- quizá permite cambiar `activo`
- quizá no permite tocar `email`
- quizá no permite tocar `password` desde ese endpoint

Entonces tiene mucho sentido tener DTOs distintos.

Por ejemplo:

- `CrearUsuarioRequest`
- `ActualizarUsuarioRequest`

Esto sería difícil de expresar con claridad si intentaras usar una única clase para todo.

## DTOs distintos para request y response

También es muy normal que la respuesta no refleje exactamente lo mismo que entró.

Por ejemplo, al crear un usuario:

### Request
```json
{
  "nombre": "Ana",
  "email": "ana@email.com",
  "password": "123456"
}
```

### Response
```json
{
  "id": 10,
  "nombre": "Ana",
  "email": "ana@email.com",
  "activo": true
}
```

La respuesta no debería incluir el password.
Y además puede incluir datos nuevos generados por el sistema.

Eso es otro motivo muy fuerte para separar DTOs.

## Qué relación tiene esto con validación

Muchísima.

Los DTOs de entrada son un lugar excelente para poner:

- `@NotBlank`
- `@Email`
- `@Positive`
- `@Size`

En cambio, una entidad de persistencia no necesariamente debería cargar con todas las mismas preocupaciones de validación del contrato web.

Separar DTO y entidad también ordena mejor dónde vive cada tipo de restricción.

## Qué relación tiene esto con JPA

Cuando más adelante entres en JPA, esta distinción se va a volver todavía más importante.

Porque las entidades JPA suelen traer consigo preocupaciones como:

- relaciones
- lazy loading
- proxies
- anotaciones de persistencia
- ids generados
- campos de auditoría
- detalles técnicos de base de datos

Eso hace todavía menos conveniente tratarlas como si fueran automáticamente el contrato ideal de tu API pública.

## Un ejemplo de controller sano con DTOs

```java
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
    public ResponseEntity<ProductoResponse> crear(@RequestBody CrearProductoRequest request) {
        ProductoResponse response = productoService.crearProducto(request);
        return ResponseEntity.status(201).body(response);
    }
}
```

Esto ya se ve mucho más claro que un endpoint que use la misma clase para todo.

## Qué relación tiene esto con las capas

Muy fuerte.

La separación de objetos acompaña la separación de capas.

### Controller
Trabaja naturalmente con DTOs de entrada y salida.

### Service
Coordina reglas y decide cómo transformar o usar esas estructuras.

### Repository
Trabaja con entidades o modelos de persistencia.

Cuando esta separación existe, la arquitectura se vuelve mucho más coherente.

## Un mapa mental muy útil

Podés pensarlo así:

- **request DTO** → lo que entra desde el cliente
- **entidad** → cómo el sistema representa y persiste el recurso
- **response DTO** → lo que sale hacia el cliente
- **mapper** → la traducción entre esas formas

Ese mapa es muy poderoso y te va a servir muchísimo más adelante.

## Error común: usar la entidad para request y response “porque es más rápido”

Sí, puede parecer más rápido al principio.

Pero a mediano plazo suele volverse más costoso porque:

- expone demasiado
- acopla demasiado
- dificulta cambios
- mezcla responsabilidades
- vuelve más frágil la API

## Error común: crear DTOs idénticos a la entidad sin una razón clara

También puede pasar lo contrario.

Si un DTO es 100 por ciento idéntico a la entidad y jamás cumple un rol distinto, puede sentirse artificial.

La separación tiene valor cuando hay una intención real.

La clave no es duplicar por duplicar, sino aislar responsabilidades cuando eso trae claridad.

## Error común: meter lógica de negocio dentro del mapper

El mapper debería enfocarse sobre todo en transformar estructuras.

No debería convertirse en el lugar donde viven reglas complejas del dominio.

Por ejemplo, “si el pedido está cancelado no se puede confirmar” no es una regla de mapper.
Eso pertenece a otra capa.

## Error común: usar el service como bolsa de mapeo infinito

Si todo el mapeo queda adentro del service y empieza a repetirse mucho, el código también se puede ensuciar.

Ahí aparece una señal de que quizá conviene extraer esa responsabilidad.

## Error común: pensar que mapper siempre implica una librería externa

No necesariamente.

Más adelante quizá conozcas herramientas que ayudan con mapeos, pero desde el punto de vista conceptual eso es secundario.

Lo importante primero es entender la necesidad del mapeo, aunque lo hagas a mano.

## Una regla práctica muy sana

Podés resumirlo así:

- si el objeto representa el contrato HTTP de entrada o salida → probablemente DTO
- si representa persistencia o modelo interno principal → probablemente entidad
- si necesitás pasar de uno a otro → hay mapeo
- si el mapeo empieza a repetirse → probablemente conviene un mapper más explícito

## Relación con Spring Boot

Spring Boot no te obliga rígidamente a separar DTOs, entidades y mappers, pero te da un ecosistema donde esa separación encaja muy bien con:

- validación
- controladores REST
- servicios
- repositorios
- persistencia con JPA
- serialización JSON

Por eso es una práctica muy natural y muy recomendable a medida que el proyecto crece.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> separar DTOs, entidades y mappers ayuda a que cada capa de una aplicación Spring Boot trabaje con objetos más acordes a su responsabilidad, evitando que la API pública, la lógica del sistema y la persistencia queden acopladas artificialmente a una única representación para todo.

## Resumen

- Los DTOs sirven para transferir datos entre capas o fronteras del sistema.
- Las entidades suelen representar mejor el modelo de persistencia.
- Los mappers transforman entre request DTOs, entidades y response DTOs.
- Usar una sola clase para todo puede parecer cómodo, pero suele traer problemas de acoplamiento y exposición indebida.
- Los DTOs ayudan mucho a controlar qué entra y qué sale por la API.
- La separación entre estos objetos mejora claridad, mantenibilidad y flexibilidad.
- Este patrón se vuelve todavía más importante cuando más adelante entres en JPA y persistencia real.

## Próximo tema

En el próximo tema vas a ver cómo empezar a modelar una entidad de persistencia con `@Entity`, `@Id` y `@GeneratedValue`, y ahí empieza el bloque donde Spring Boot deja de operar solo con clases comunes para entrar de lleno en acceso a datos con JPA.
