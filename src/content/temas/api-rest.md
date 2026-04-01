---
title: "API REST"
description: "Qué es una API REST, cómo se diseñan recursos y endpoints, y cómo se aprovechan HTTP y JSON para exponer servicios web coherentes."
order: 28
module: "Backend web"
level: "intermedio"
draft: false
---

## Introducción

En las lecciones anteriores viste dos bases fundamentales del backend web:

- HTTP
- JSON

HTTP te mostró cómo se comunican cliente y servidor.
JSON te mostró cómo suelen representarse los datos que viajan en esa comunicación.

Ahora toca unir esas dos piezas en un concepto central del backend moderno: las APIs REST.

Si querés trabajar con Java backend, APIs REST es uno de los temas más importantes de todo el camino.

## Qué es una API

API significa:

**Application Programming Interface**

Dicho simple, una API es una interfaz que permite que un sistema use funcionalidades o datos de otro sistema.

En el contexto web, una API suele exponer endpoints a través de HTTP para que otros clientes puedan consultar o modificar información.

## Qué significa REST

REST significa:

**Representational State Transfer**

No hace falta memorizar toda la teoría formal al principio.

Lo importante es entender que REST es un estilo de diseño para construir APIs sobre HTTP de forma clara y consistente.

## La idea general

Una API REST organiza la información alrededor de recursos.

Ejemplos de recursos:

- users
- products
- orders
- categories
- tasks

Y usa HTTP para operar sobre esos recursos de forma coherente.

Por ejemplo:

- `GET /products`
- `GET /products/10`
- `POST /products`
- `PUT /products/10`
- `DELETE /products/10`

## Qué es un recurso

Un recurso es una entidad del dominio que la API expone.

Por ejemplo, en un e-commerce podrían ser recursos:

- productos
- órdenes
- usuarios
- categorías
- carritos

En una API REST, el diseño gira alrededor de esos recursos, no alrededor de verbos arbitrarios en la URL.

## Ejemplo mental de recurso

Supongamos que tenés productos.

Entonces una buena API REST suele exponer rutas como:

- `/products`
- `/products/{id}`

Eso es mejor que inventar endpoints como:

- `/getAllProducts`
- `/createProductNow`
- `/deleteProductById`

REST favorece URLs basadas en recursos y dejar que el método HTTP exprese la operación.

## Métodos HTTP y recursos

Uno de los pilares de REST es combinar bien:

- recurso
- método HTTP

### Obtener colección

```text
GET /products
```

### Obtener uno solo

```text
GET /products/10
```

### Crear recurso

```text
POST /products
```

### Actualizar recurso

```text
PUT /products/10
```

o

```text
PATCH /products/10
```

### Eliminar recurso

```text
DELETE /products/10
```

## Qué hace más claro este enfoque

Hace que el diseño sea:

- predecible
- consistente
- fácil de entender para otros desarrolladores
- más alineado con el funcionamiento natural de HTTP

## Endpoint

Un endpoint es una ruta concreta de la API que el cliente puede consumir.

Por ejemplo:

- `GET /users`
- `POST /orders`
- `DELETE /products/5`

Cada endpoint representa una operación accesible del sistema.

## Colección vs recurso individual

Esta diferencia es muy importante.

### Colección

```text
GET /products
```

Representa el conjunto de productos.

### Recurso individual

```text
GET /products/10
```

Representa un producto específico.

Pensar bien esta diferencia ayuda mucho a diseñar APIs más limpias.

## Request y response en una API REST

Una API REST usa requests y responses HTTP normales, pero con convenciones bien elegidas.

Por ejemplo:

### Request

```http
POST /products HTTP/1.1
Content-Type: application/json

{
  "name": "Notebook",
  "price": 1250.50
}
```

### Response

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 1,
  "name": "Notebook",
  "price": 1250.50
}
```

## JSON en REST

JSON suele ser el formato más usado para request bodies y response bodies en APIs REST.

Por eso entender HTTP y JSON antes de REST tiene mucho sentido.

## Códigos de estado en REST

Los status codes son muy importantes en una API REST porque comunican el resultado de la operación.

## Códigos típicos

### `200 OK`

Operación exitosa con contenido.

Ejemplo:
consultar un recurso que existe.

### `201 Created`

Recurso creado exitosamente.

Ejemplo:
crear un producto con `POST`.

### `204 No Content`

Operación exitosa sin body de respuesta.

Ejemplo:
algunas eliminaciones o actualizaciones.

### `400 Bad Request`

La request tiene datos inválidos.

Ejemplo:
precio negativo, campo obligatorio ausente.

### `404 Not Found`

El recurso no existe.

Ejemplo:
`GET /products/9999` cuando ese producto no existe.

### `500 Internal Server Error`

Error inesperado del servidor.

## Ejemplo de CRUD REST

Supongamos un recurso `products`.

## Listar productos

```text
GET /products
```

Response posible:

```json
[
  { "id": 1, "name": "Notebook" },
  { "id": 2, "name": "Mouse" }
]
```

## Obtener un producto

```text
GET /products/1
```

Response posible:

```json
{
  "id": 1,
  "name": "Notebook",
  "price": 1250.50
}
```

## Crear un producto

```text
POST /products
```

Body:

```json
{
  "name": "Teclado",
  "price": 45.99
}
```

Response posible:

- status `201 Created`
- body con el recurso creado

## Actualizar un producto

```text
PUT /products/1
```

Body:

```json
{
  "name": "Notebook Pro",
  "price": 1500.00
}
```

## Eliminar un producto

```text
DELETE /products/1
```

Response posible:

- status `204 No Content`

## `PUT` vs `PATCH`

Esta diferencia conviene empezar a verla desde ahora.

### `PUT`

Suele usarse para reemplazar o actualizar de forma más completa un recurso.

### `PATCH`

Suele usarse para actualizar parcialmente un recurso.

Ejemplo:

```text
PATCH /products/1
```

Body:

```json
{
  "price": 1399.99
}
```

Eso expresa una actualización parcial.

## URLs limpias y RESTful

En REST conviene que las URLs representen recursos de forma clara.

Mejor así:

```text
GET /products
POST /products
GET /products/10
DELETE /products/10
```

que así:

```text
GET /getAllProducts
POST /createProduct
POST /deleteProduct
```

¿Por qué?
Porque en REST el método HTTP ya expresa buena parte de la intención.

## Nombres en plural

Es muy común usar nombres de recursos en plural:

- `/users`
- `/products`
- `/orders`

No es una ley absoluta, pero es una convención bastante extendida y útil para mantener consistencia.

## Recursos relacionados

A veces un recurso se relaciona con otro.

Ejemplo:

- órdenes de un usuario
- ítems de una orden
- comentarios de un post

Podrías tener rutas como:

```text
GET /users/10/orders
GET /orders/100/items
```

Esto ayuda a representar relaciones del dominio de forma clara.

## Query parameters en REST

Los query params suelen usarse para:

- filtros
- paginación
- ordenamiento
- búsqueda

Ejemplos:

```text
GET /products?category=electronics
GET /products?page=2&size=20
GET /products?sort=price,desc
GET /products?search=notebook
```

Esto permite mantener la URL del recurso principal y agregar criterios de consulta.

## REST no es “solo usar JSON”

Esto es importante.

Una API no se vuelve REST solo porque usa HTTP y devuelve JSON.

REST implica también cierta coherencia de diseño, como por ejemplo:

- recursos bien modelados
- uso razonable de métodos HTTP
- status codes adecuados
- endpoints consistentes
- separación clara entre colección y recurso individual

## Stateless en REST

REST se apoya muy bien en la idea de que HTTP es stateless.

Eso significa que cada request debería traer suficiente información para ser entendida por el servidor sin depender demasiado de estado implícito entre llamadas.

Esto encaja muy bien con APIs modernas escalables.

## Ejemplo con autenticación

Una request autenticada podría incluir algo como:

```text
Authorization: Bearer <token>
```

Y el servidor valida ese token en cada request relevante.

Eso es más compatible con el estilo stateless que depender de estado oculto del lado del servidor.

## REST y DTOs

En una API REST, rara vez querés exponer directamente cualquier objeto interno sin pensar.

Lo habitual es usar DTOs para definir:

- qué entra
- qué sale
- qué campos viajan
- qué estructura JSON espera o devuelve la API

Esto más adelante va a conectar muy fuerte con Spring Boot.

## Ejemplo conceptual con DTO

### Request DTO

Podría representar los datos de entrada para crear un producto:

```json
{
  "name": "Notebook",
  "price": 1250.50
}
```

### Response DTO

Podría devolver:

```json
{
  "id": 1,
  "name": "Notebook",
  "price": 1250.50,
  "available": true
}
```

## REST y validaciones

Una API REST debería validar datos de entrada.

Por ejemplo:

- nombre obligatorio
- precio no negativo
- email válido
- stock no negativo

Si los datos son inválidos, lo esperable suele ser una respuesta como:

- `400 Bad Request`

con un body JSON de error razonable.

## Ejemplo de error JSON

```json
{
  "error": "Bad Request",
  "message": "El precio no puede ser negativo",
  "status": 400
}
```

## Diseño de una API REST: preguntas útiles

Cuando diseñás una API REST, conviene preguntarte:

- ¿cuál es el recurso principal?
- ¿qué operaciones quiero permitir?
- ¿qué método HTTP corresponde?
- ¿cuál debería ser la URL?
- ¿qué status code tiene sentido?
- ¿qué JSON entra?
- ¿qué JSON sale?

## Ejemplo completo conceptual

Supongamos una API de tareas.

## Listar tareas

```text
GET /tasks
```

Response:

```json
[
  { "id": 1, "title": "Estudiar Java", "done": false },
  { "id": 2, "title": "Practicar Maven", "done": true }
]
```

## Crear tarea

```text
POST /tasks
```

Body:

```json
{
  "title": "Aprender REST"
}
```

Response:

```json
{
  "id": 3,
  "title": "Aprender REST",
  "done": false
}
```

Status:
`201 Created`

## Obtener tarea puntual

```text
GET /tasks/3
```

## Actualizar tarea

```text
PATCH /tasks/3
```

Body:

```json
{
  "done": true
}
```

## Eliminar tarea

```text
DELETE /tasks/3
```

Status:
`204 No Content`

## Qué hace buena a una API REST

No se trata solo de que “funcione”.

Una buena API REST suele ser:

- consistente
- legible
- predecible
- fácil de consumir
- clara en sus recursos y respuestas
- razonable en sus status codes

## REST y Spring Boot

¿Por qué este tema importa tanto en tu camino de Java?

Porque más adelante, con Spring Boot, vas a crear cosas como:

- controllers
- endpoints
- request bodies
- response bodies
- validaciones
- manejo de errores
- status codes

Y todo eso se entiende mucho mejor si primero tenés clara la lógica REST.

## Comparación con otros lenguajes

### Si venís de JavaScript

Quizás ya consumiste APIs REST con `fetch` o `axios`. Esta lección te ayuda a pasar del lado del consumo al lado del diseño y construcción.

### Si venís de Python

Puede que ya hayas visto APIs con Flask o FastAPI. En Java, Spring Boot cumple un rol parecido, pero el diseño REST subyacente sigue siendo el mismo.

## Errores comunes

### 1. Diseñar URLs con verbos innecesarios

REST favorece recursos y dejar que el método HTTP exprese la acción.

### 2. Ignorar los status codes correctos

La API no solo devuelve datos; también comunica resultado y contexto.

### 3. No diferenciar colección y recurso individual

`/products` y `/products/{id}` cumplen roles distintos.

### 4. Usar `POST` para todo

Aunque pueda funcionar, suele empobrecer el diseño.

### 5. Pensar que REST es solo “devolver JSON”

REST implica coherencia de diseño, no solo formato.

## Mini ejercicio

Diseñá endpoints REST para un recurso `users` y respondé:

1. ¿cómo listarías todos los usuarios?
2. ¿cómo obtendrías un usuario por id?
3. ¿cómo crearías un usuario?
4. ¿cómo actualizarías solo el email?
5. ¿cómo eliminarías un usuario?
6. ¿qué status code usarías si el usuario no existe?

## Ejemplo posible

- `GET /users`
- `GET /users/10`
- `POST /users`
- `PATCH /users/10`
- `DELETE /users/10`
- si no existe: `404 Not Found`

## Resumen

En esta lección viste que:

- una API REST es una forma de diseñar servicios web sobre HTTP
- REST organiza la API alrededor de recursos
- los métodos HTTP expresan operaciones sobre esos recursos
- JSON suele usarse para request y response bodies
- los status codes comunican el resultado de cada operación
- una buena API REST busca consistencia, claridad y coherencia
- entender REST prepara directamente el camino para trabajar con Spring Boot

## Siguiente tema

En la próxima lección conviene pasar a **Spring Boot**, porque después de entender HTTP, JSON y diseño REST, el siguiente paso natural es usar el framework más importante del ecosistema Java backend para construir APIs reales de forma productiva.
