---
title: "Cómo usar @RequestBody para recibir JSON en el cuerpo de la petición"
description: "Entender cómo funciona @RequestBody en Spring Boot, cómo permite recibir JSON desde el cliente y por qué es una pieza central para crear y actualizar recursos en una API."
order: 30
module: "Spring Web y APIs REST"
level: "base"
draft: false
---

En los temas anteriores viste distintas formas de recibir información en un endpoint:

- con `@PathVariable`, desde partes variables de la ruta
- con `@RequestParam`, desde parámetros de consulta en la URL

Eso cubre una parte importante del diseño de una API.

Pero rápidamente aparece una necesidad más poderosa:

- crear un usuario enviando nombre, email y password
- registrar un producto con título, precio y stock
- actualizar un pedido con varios campos
- recibir datos estructurados desde un frontend o desde otra API

En esos casos, la información ya no cabe naturalmente en la ruta ni en query params.

Ahí entra el **cuerpo de la petición**, y en Spring Boot la herramienta más importante para leerlo es `@RequestBody`.

## Qué problema resuelve `@RequestBody`

Supongamos que un cliente quiere crear un usuario.

Mandar todo por URL sería una mala idea:

```text
POST /usuarios?nombre=Ana&email=ana@email.com&password=123456
```

Eso puede volverse incómodo, poco claro e incluso poco apropiado cuando la estructura crece.

En cambio, lo normal es que el cliente envíe un cuerpo JSON como este:

```json
{
  "nombre": "Ana",
  "email": "ana@email.com",
  "password": "123456"
}
```

La pregunta entonces es:

> ¿cómo convierte Spring ese JSON en algo usable dentro del método del controlador?

La respuesta es `@RequestBody`.

Dicho de forma simple:

> `@RequestBody` permite recibir el contenido del cuerpo de la petición y mapearlo a un objeto Java.

## Qué es el request body

En HTTP, una petición no solo puede tener:

- una ruta
- un verbo
- query params
- headers

También puede tener un **body**, es decir, un contenido enviado en la propia petición.

Ese body suele usarse especialmente en operaciones como:

- `POST`
- `PUT`
- `PATCH`

porque ahí el cliente normalmente necesita enviar datos estructurados al servidor.

## Qué tipo de contenido suele viajar en el body

Puede haber distintos formatos, pero en APIs modernas lo más común es JSON.

Por ejemplo:

```json
{
  "titulo": "Notebook",
  "precio": 2500,
  "stock": 10
}
```

Ese JSON representa datos estructurados que el servidor necesita procesar.

## La idea general de `@RequestBody`

La lógica básica es esta:

1. el cliente manda JSON en el cuerpo del request
2. el controlador declara un parámetro anotado con `@RequestBody`
3. Spring lee el body
4. Spring convierte el JSON a un objeto Java compatible
5. el método recibe ese objeto ya construido

Ejemplo:

```java
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UsuarioController {

    @PostMapping("/usuarios")
    public String crearUsuario(@RequestBody UsuarioRequest request) {
        return "Usuario recibido: " + request.getNombre();
    }
}
```

## Un DTO simple para recibir datos

Por ejemplo:

```java
public class UsuarioRequest {

    private String nombre;
    private String email;
    private String password;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
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

Si el cliente manda:

```json
{
  "nombre": "Ana",
  "email": "ana@email.com",
  "password": "123456"
}
```

Spring puede convertir ese JSON a una instancia de `UsuarioRequest`.

## Cómo leer este ejemplo

```java
@PostMapping("/usuarios")
public String crearUsuario(@RequestBody UsuarioRequest request) {
    return "Usuario recibido: " + request.getNombre();
}
```

Podés leerlo así:

- este endpoint atiende un POST
- espera un body JSON
- ese body debe poder mapearse a `UsuarioRequest`
- Spring crea el objeto y lo inyecta en el método
- el controlador ya trabaja con un objeto Java normal

Esa conversión automática es una de las piezas más cómodas y potentes de Spring Boot para APIs.

## Qué papel cumple Jackson

Aunque no hace falta que memorices internamente todos los detalles desde ya, es útil saber que Spring Boot suele apoyarse en una librería de serialización/deserialización para convertir JSON a objetos Java y viceversa.

En la práctica, uno de los nombres más habituales detrás de esto es Jackson.

La idea importante, por ahora, no es profundizar en la librería, sino entender el efecto:

> Spring puede tomar JSON y convertirlo en objetos Java si la estructura es compatible.

## Cuándo se usa normalmente `@RequestBody`

Suele usarse cuando el cliente necesita enviar datos estructurados al servidor.

Por ejemplo:

- crear recursos
- actualizar recursos
- enviar formularios complejos
- mandar payloads con varios campos
- ejecutar acciones que requieren información rica

Es una pieza central en cualquier API real.

## El caso más típico: crear un recurso

Este es probablemente el uso más clásico.

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    @PostMapping
    public String crearProducto(@RequestBody ProductoRequest request) {
        return "Producto creado: " + request.getTitulo();
    }
}
```

DTO:

```java
public class ProductoRequest {

    private String titulo;
    private double precio;
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

JSON:

```json
{
  "titulo": "Notebook Gamer",
  "precio": 2500,
  "stock": 10
}
```

## También es muy común para actualizar

Por ejemplo:

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    @PutMapping("/{id}")
    public String actualizarProducto(
        @PathVariable Long id,
        @RequestBody ProductoRequest request
    ) {
        return "Producto " + id + " actualizado con título " + request.getTitulo();
    }
}
```

Acá conviven dos formas de entrada:

- `@PathVariable` para identificar el recurso
- `@RequestBody` para recibir los nuevos datos

Esa combinación aparece constantemente en APIs reales.

## `@RequestBody` no reemplaza a todo lo demás

Esto es importante.

No todo dato que entra al endpoint tiene que venir en el body.

Por ejemplo:

- el id del recurso puede venir en la ruta
- filtros pueden venir en query params
- datos de creación o actualización pueden venir en el body

Cada forma de entrada cumple un rol distinto.

## Una buena regla mental

Podés pensarlo así:

- **ruta** → qué recurso
- **query params** → cómo consultar
- **body** → qué datos estructurados manda el cliente

Esa distinción te ayuda muchísimo a diseñar endpoints más claros.

## Un ejemplo completo con varias partes

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @PutMapping("/{id}")
    public String actualizarUsuario(
        @PathVariable Long id,
        @RequestParam(required = false) boolean notificar,
        @RequestBody UsuarioRequest request
    ) {
        return "Actualizando usuario " + id + " y notificar=" + notificar;
    }
}
```

Acá el endpoint recibe:

- el id desde la ruta
- un flag opcional desde query param
- los datos del usuario desde el body

Ese ejemplo muestra muy bien cómo las distintas formas de entrada pueden convivir.

## Por qué se suele usar un DTO

Cuando recibís datos desde el cliente, lo habitual no es mapear directamente a cualquier clase del sistema.

Muy a menudo conviene usar un objeto específico para entrada, por ejemplo:

- `UsuarioRequest`
- `ProductoRequest`
- `PedidoCreateRequest`

¿Por qué?

Porque eso permite:

- separar la forma de entrada del modelo interno
- controlar qué campos aceptás
- evolucionar la API con más claridad
- validar mejor lo que llega
- evitar mezclar estructuras externas con internas

Más adelante vas a profundizar mucho más en DTOs y validación, pero desde ya conviene pensar `@RequestBody` junto a esta idea.

## Un error común: usar entidades como request directamente

Aunque a veces se hace en ejemplos rápidos, más adelante suele volverse una mala práctica acoplar directamente la capa web a entidades de persistencia.

Por ejemplo, usar una entidad JPA como si fuera el objeto ideal para entrada puede traer problemas de diseño y acoplamiento.

Por eso, conceptualmente, es mejor que el request body se mapee a DTOs pensados para la API.

## Qué pasa si falta el body

Si un endpoint espera:

```java
@RequestBody UsuarioRequest request
```

y el cliente no manda body, o manda algo incompatible, la petición no podrá resolverse correctamente.

Esto es lógico: el método declaró que necesita datos en el cuerpo.
Si no están o no se pueden interpretar, no hay forma razonable de seguir.

## Qué pasa si el JSON no coincide bien

Por ejemplo, si el JSON viene mal formado o no puede convertirse a la clase esperada, Spring no podrá construir correctamente el objeto del request.

Esto es importante porque muestra que el request body no es “texto libre”.

El framework espera cierta estructura compatible con el tipo declarado.

## Un ejemplo con tipos variados

```java
public class PedidoRequest {

    private Long clienteId;
    private String observaciones;
    private boolean urgente;
    private int cantidad;

    public Long getClienteId() {
        return clienteId;
    }

    public void setClienteId(Long clienteId) {
        this.clienteId = clienteId;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public boolean isUrgente() {
        return urgente;
    }

    public void setUrgente(boolean urgente) {
        this.urgente = urgente;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }
}
```

JSON:

```json
{
  "clienteId": 50,
  "observaciones": "Entregar por la tarde",
  "urgente": true,
  "cantidad": 3
}
```

Spring puede mapear esto al DTO si las claves y tipos son razonablemente compatibles.

## `@RequestBody` y verbos HTTP

Aunque puede aparecer en más contextos, los casos más naturales suelen ser:

- `POST`
- `PUT`
- `PATCH`

porque son verbos donde el cliente suele enviar datos al servidor.

En cambio, en GET normalmente el body no es el mecanismo típico de entrada para una API REST común.

## El cuerpo representa el payload del cliente

Esta es una idea importante.

El body es, conceptualmente, el **payload** de la petición.

Es la información principal que el cliente quiere enviar para que el servidor:

- cree algo
- actualice algo
- procese algo
- interprete una estructura de datos

Por eso `@RequestBody` es tan central en endpoints que reciben información significativa.

## Un ejemplo didáctico muy claro

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    @PostMapping
    public String crearCategoria(@RequestBody CategoriaRequest request) {
        return "Categoría creada: " + request.getNombre();
    }
}
```

```java
public class CategoriaRequest {

    private String nombre;
    private String descripcion;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
```

JSON:

```json
{
  "nombre": "Electrónica",
  "descripcion": "Productos electrónicos y accesorios"
}
```

Este ejemplo ya se parece bastante a una API real.

## Qué conviene hacer en el controlador

El controlador no debería convertirse en el lugar donde se procesa todo el request con lógica pesada.

Lo más sano suele ser:

- recibir el DTO
- delegar a un servicio
- devolver una respuesta

Por ejemplo:

```java
@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public String crear(@RequestBody UsuarioRequest request) {
        return usuarioService.crearUsuario(request);
    }
}
```

Eso mantiene más limpio el rol del controlador.

## `@RequestBody` y validación

Muy pronto vas a ver que un request body puede validarse.

Por ejemplo:

- nombre obligatorio
- email válido
- precio positivo
- stock no negativo

Eso es muy importante en APIs reales, porque recibir JSON no alcanza:
también hay que verificar que ese JSON tenga sentido.

Más adelante vas a combinar `@RequestBody` con `@Valid`.

## `@RequestBody` y respuestas

Por ahora el foco está en recibir datos, pero conviene notar que el flujo general de una API suele ser:

- el cliente manda body
- el servidor lo convierte a un DTO
- el controlador delega
- el sistema responde con un objeto, texto o una respuesta HTTP más rica

Es decir, `@RequestBody` forma parte de un intercambio más amplio entre cliente y servidor.

## Un patrón muy común

Una estructura muy habitual en APIs es esta:

- `POST /recurso` + `@RequestBody CreateRequest`
- `PUT /recurso/{id}` + `@RequestBody UpdateRequest`

Por ejemplo:

- `POST /usuarios`
- `PUT /usuarios/{id}`
- `POST /productos`
- `PUT /productos/{id}`

Esto aparece una y otra vez en aplicaciones reales.

## Qué ventaja tiene frente a mandar muchos query params

Cuando la información es más rica, el body ofrece muchas ventajas:

- mejor legibilidad
- estructura natural en JSON
- menos fragilidad
- más claridad semántica
- mejor compatibilidad con objetos complejos

Si intentaras modelar todo eso con query params, la API se volvería más rara y menos cómoda de consumir.

## Error común: querer mandar estructuras complejas por query string

Por ejemplo, intentar meter muchos campos de creación en la URL.

Eso suele ser una mala idea cuando el payload ya tiene entidad propia.

En esos casos, el body es el lugar natural.

## Error común: no separar request DTO y modelo interno

Ya lo vimos antes, pero vale insistir.

Que el cliente mande JSON no significa que debas acoplar directamente esa estructura a cualquier clase interna del dominio o de persistencia.

Pensar en DTOs de entrada suele ser un paso mucho más sano.

## Error común: meter demasiada lógica de transformación en el controlador

A veces el controlador recibe un body y enseguida empieza a:

- validar manualmente
- transformar mucho
- armar entidades
- resolver reglas complejas
- invocar medio sistema

Eso puede volver la capa web demasiado pesada.

Conviene mantener el controlador claro y delegar las transformaciones o reglas importantes a capas más apropiadas.

## Error común: creer que `@RequestBody` solo sirve para POST

No.

Aunque POST es un caso muy típico, también aparece naturalmente en PUT y PATCH, y en general en endpoints donde el cliente necesita mandar un payload estructurado.

## Error común: no pensar el contrato JSON

El JSON que acepta tu API forma parte del contrato público del endpoint.

No es un detalle improvisado.

Por eso conviene pensar:

- qué campos acepta
- cuáles son obligatorios
- cuáles opcionales
- cómo se llaman
- qué estructura tienen

Ese cuidado hace que la API sea mucho más sólida.

## Relación con Spring Boot

Spring Boot hace muy simple pasar de un JSON enviado por el cliente a un objeto Java usable dentro del controlador.

Esa comodidad es una de las razones por las que construir APIs en Spring Boot resulta tan productivo.

Pero la anotación por sí sola no alcanza.
También importa cómo diseñás tus DTOs, tus contratos y tus capas.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `@RequestBody` permite recibir JSON en el cuerpo de la petición y convertirlo en un objeto Java, haciendo posible que una API Spring Boot acepte datos estructurados para crear, actualizar o procesar recursos de forma natural.

## Resumen

- `@RequestBody` sirve para leer el cuerpo de la petición.
- Se usa especialmente para recibir JSON.
- Spring puede convertir ese JSON a un objeto Java compatible.
- Es central en operaciones como crear o actualizar recursos.
- No reemplaza a `@PathVariable` ni a `@RequestParam`; cada uno cumple un rol distinto.
- Lo habitual es combinar `@RequestBody` con DTOs específicos de entrada.
- Es una herramienta clave para pasar de endpoints simples a APIs realmente útiles.

## Próximo tema

En el próximo tema vas a ver cómo devolver respuestas más expresivas con `ResponseEntity`, y eso te va a permitir controlar no solo el cuerpo de la respuesta sino también el código HTTP y otros detalles importantes del contrato.
