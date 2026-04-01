---
title: "HTTP"
description: "Cómo funciona la comunicación entre cliente y servidor en la web usando el protocolo HTTP."
order: 26
module: "Backend web"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora trabajaste mucho con el lenguaje Java, estructuras de datos, diseño orientado a objetos, manejo de archivos y herramientas como Maven.

Eso te da una base muy buena para programar.

Pero si querés entrar de lleno al backend moderno, necesitás entender cómo se comunican los sistemas a través de la web.

Ahí aparece HTTP.

HTTP es una de las bases más importantes del desarrollo backend, porque casi toda API web moderna se apoya en este protocolo.

## Qué es HTTP

HTTP significa:

**HyperText Transfer Protocol**

Es un protocolo de comunicación que permite intercambiar información entre un cliente y un servidor.

Dicho simple:

- un cliente hace una petición
- un servidor responde

## La idea general

Imaginá que abrís una página web o que una aplicación frontend consulta una API.

En ambos casos suele pasar algo así:

1. el cliente envía una request
2. el servidor la recibe
3. el servidor procesa la solicitud
4. el servidor devuelve una response

Ese intercambio se hace usando HTTP.

## Cliente y servidor

## Cliente

Es quien inicia la comunicación.

Ejemplos:

- un navegador
- una app móvil
- un frontend en React
- Postman
- otra API

## Servidor

Es quien recibe la request, la procesa y genera una response.

Ejemplos:

- un backend hecho en Java
- un servidor con Spring Boot
- una API REST
- un servidor web

## Request y response

Estas dos palabras son fundamentales.

### Request

Es la petición que envía el cliente.

### Response

Es la respuesta que devuelve el servidor.

## Qué suele incluir una request

Una request HTTP suele incluir cosas como:

- método HTTP
- URL
- headers
- body en algunos casos
- parámetros
- información de autenticación si corresponde

## Qué suele incluir una response

Una response HTTP suele incluir:

- código de estado
- headers
- body
- datos de respuesta o mensaje de error

## Ejemplo mental simple

Supongamos que un frontend quiere obtener una lista de productos.

El cliente podría enviar una request como esta:

```text
GET /products
```

Y el servidor podría responder con algo como:

```json
[
  { "id": 1, "name": "Notebook" },
  { "id": 2, "name": "Mouse" }
]
```

## Método HTTP

Uno de los elementos más importantes de una request es el método HTTP.

El método indica la intención de la operación.

Los más comunes al empezar son:

- `GET`
- `POST`
- `PUT`
- `PATCH`
- `DELETE`

## `GET`

Se usa para obtener información.

Ejemplo:

```text
GET /products
```

Eso suele significar:
“quiero obtener la lista de productos”.

## `POST`

Se usa para crear un recurso nuevo.

Ejemplo:

```text
POST /products
```

Eso suele significar:
“quiero crear un nuevo producto”.

## `PUT`

Se usa normalmente para reemplazar o actualizar un recurso completo.

Ejemplo:

```text
PUT /products/10
```

## `PATCH`

Se usa normalmente para actualizar parcialmente un recurso.

Ejemplo:

```text
PATCH /products/10
```

## `DELETE`

Se usa para eliminar un recurso.

Ejemplo:

```text
DELETE /products/10
```

## URL

La URL indica a qué recurso o endpoint querés acceder.

Ejemplo:

```text
https://api.example.com/products/10
```

En esa URL puede haber distintas partes:

- protocolo
- dominio
- path
- query params

## Path

El path representa el recurso al que querés acceder.

Ejemplos:

```text
/products
/products/10
/users
/orders/1001
```

## Query parameters

Los query params permiten enviar filtros o datos adicionales en la URL.

Ejemplo:

```text
GET /products?category=electronics&limit=10
```

Ahí el cliente está diciendo algo como:

- categoría = electronics
- límite = 10

## Headers

Los headers son metadatos que acompañan la request o la response.

Por ejemplo, pueden indicar:

- tipo de contenido
- autenticación
- idioma
- tokens
- configuración de caché

Ejemplo:

```text
Content-Type: application/json
Authorization: Bearer <token>
```

## Body

El body contiene datos enviados en la request o devueltos en la response.

No todas las requests lo usan.

Por ejemplo:

- `GET` normalmente no lleva body
- `POST` suele llevar body
- `PUT` y `PATCH` también suelen llevar body

## Ejemplo de body en JSON

```json
{
  "name": "Notebook",
  "price": 1250.50
}
```

Eso podría usarse en una request `POST` para crear un producto.

## Formato JSON

En backend moderno, uno de los formatos más usados para intercambiar datos sobre HTTP es JSON.

Ejemplo:

```json
{
  "id": 1,
  "name": "Notebook",
  "price": 1250.50
}
```

Java después puede transformar eso en objetos y viceversa, algo que más adelante vas a ver con frameworks como Spring Boot.

## Códigos de estado HTTP

La response HTTP incluye un código de estado.

Ese código indica cómo salió la operación.

Los más comunes se agrupan así:

- 2xx → éxito
- 4xx → error del cliente
- 5xx → error del servidor

## Códigos comunes de éxito

### `200 OK`

La operación salió bien.

### `201 Created`

Se creó un recurso correctamente.

### `204 No Content`

La operación salió bien pero no hay contenido en la respuesta.

## Códigos comunes de error del cliente

### `400 Bad Request`

La request está mal formada o tiene datos inválidos.

### `401 Unauthorized`

Falta autenticación o no es válida.

### `403 Forbidden`

El cliente está autenticado, pero no tiene permiso.

### `404 Not Found`

El recurso no existe.

## Códigos comunes de error del servidor

### `500 Internal Server Error`

Ocurrió un error inesperado en el servidor.

## Ejemplo mental completo

Supongamos esta request:

```text
GET /products/10
```

### Caso 1: el producto existe

Response:

- status: `200 OK`
- body: datos del producto

### Caso 2: el producto no existe

Response:

- status: `404 Not Found`

## HTTP es stateless

Una de las características más importantes de HTTP es que, por defecto, es stateless.

Eso significa que cada request es independiente y no “recuerda” automáticamente la anterior.

Cada petición debe traer la información necesaria para ser procesada.

Esto más adelante es clave para entender autenticación con tokens, sesiones, APIs REST y escalabilidad.

## Ejemplo de stateless

Un servidor no asume automáticamente que porque hiciste una request antes ahora ya sabe todo sobre vos.

Si necesitás autenticación, normalmente cada request relevante debe incluir algo como un token o una cookie.

## Content-Type

Un header muy importante es `Content-Type`.

Indica el tipo de contenido que se está enviando.

Ejemplo:

```text
Content-Type: application/json
```

Eso significa que el body contiene JSON.

Otros ejemplos posibles:

- `text/plain`
- `text/html`
- `application/xml`

## Accept

Otro header importante es `Accept`.

Indica qué tipo de respuesta espera recibir el cliente.

Ejemplo:

```text
Accept: application/json
```

## Ejemplo de request HTTP simple

```http
GET /products HTTP/1.1
Host: example.com
Accept: application/json
```

## Ejemplo de response HTTP simple

```http
HTTP/1.1 200 OK
Content-Type: application/json

[
  { "id": 1, "name": "Notebook" },
  { "id": 2, "name": "Mouse" }
]
```

## HTTP y backend Java

¿Por qué importa tanto HTTP si estás aprendiendo Java?

Porque en backend Java vas a trabajar muchísimo con cosas como:

- endpoints
- controllers
- APIs REST
- requests
- responses
- headers
- JSON
- códigos de estado

Frameworks como Spring Boot abstraen parte del trabajo, pero si no entendés HTTP por debajo, muchas cosas se vuelven “magia”.

## HTTP y CRUD

HTTP encaja muy bien con operaciones CRUD.

### Create

`POST`

### Read

`GET`

### Update

`PUT` o `PATCH`

### Delete

`DELETE`

Esto aparece constantemente en APIs REST.

## Ejemplo de CRUD con productos

- `GET /products` → listar productos
- `GET /products/10` → obtener producto 10
- `POST /products` → crear producto
- `PUT /products/10` → actualizar producto completo
- `DELETE /products/10` → eliminar producto

## Idempotencia

Este es un concepto útil para empezar a escuchar.

Una operación idempotente es una que, repetida varias veces, deja el mismo resultado final.

Por ejemplo:

- varios `GET` iguales deberían devolver el mismo recurso sin cambiar nada
- un `DELETE` repetido sobre el mismo recurso idealmente no debería ir “borrándolo más” cada vez

No hace falta dominarlo a fondo ahora, pero es una idea importante dentro de HTTP.

## HTTPS

En la práctica moderna vas a ver mucho más HTTPS que HTTP plano.

HTTPS es HTTP sobre una capa segura.

Eso protege la comunicación mediante cifrado.

A nivel conceptual para empezar, podés enfocarte en entender HTTP. Luego HTTPS aparece como su versión segura para producción.

## Herramientas para probar HTTP

Para trabajar con HTTP no hace falta siempre tener frontend.

Podés probar requests y responses con herramientas como:

- navegador
- Postman
- Insomnia
- curl
- clientes integrados en IDEs

Más adelante Postman te va a resultar especialmente útil cuando trabajes con APIs Java.

## Ejemplo práctico con Postman

Podrías hacer una request:

```text
GET http://localhost:8080/products
```

Y observar:

- método
- URL
- headers
- body
- status code

Eso ayuda muchísimo a aprender backend.

## Ejemplo completo conceptual

### Request

```http
POST /products HTTP/1.1
Host: localhost:8080
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

## Qué muestra este ejemplo

Muestra una operación muy típica:

- el cliente envía datos para crear un recurso
- el servidor procesa la petición
- responde con `201 Created`
- devuelve el recurso creado o información relevante

## Comparación con otros lenguajes

### Si venís de JavaScript

Es probable que ya hayas consumido APIs con `fetch` o `axios`. Esta lección te ayuda a entender qué está pasando por debajo cuando hacés esas llamadas.

### Si venís de Python

Puede que hayas trabajado con requests HTTP desde frameworks o librerías. En Java pasa lo mismo: más adelante frameworks como Spring abstraen mucho, pero la base sigue siendo HTTP.

## Errores comunes

### 1. Creer que HTTP es “solo para frontend”

No. Es una base central del backend moderno.

### 2. Confundir método con URL

La URL dice a qué recurso apuntás; el método dice qué querés hacer.

### 3. No diferenciar request y response

Son dos partes distintas del intercambio.

### 4. Ignorar los códigos de estado

El status code comunica información muy importante.

### 5. Usar HTTP como magia sin entenderlo

Después eso complica muchísimo cuando trabajás con APIs, errores, autenticación o debugging.

## Mini ejercicio

Respondé estas preguntas y escribí ejemplos simples:

1. ¿Qué diferencia hay entre request y response?
2. ¿Cuándo usarías `GET` y cuándo `POST`?
3. ¿Qué significa `404 Not Found`?
4. ¿Qué significa que HTTP sea stateless?
5. Escribí un ejemplo de endpoint para:
   - listar usuarios
   - obtener un usuario por id
   - crear un usuario
   - eliminar un usuario

## Ejemplo posible

- `GET /users`
- `GET /users/10`
- `POST /users`
- `DELETE /users/10`

## Resumen

En esta lección viste que:

- HTTP es el protocolo de comunicación entre cliente y servidor en la web
- una request la inicia el cliente y una response la devuelve el servidor
- los métodos HTTP más comunes son `GET`, `POST`, `PUT`, `PATCH` y `DELETE`
- las responses incluyen códigos de estado como `200`, `201`, `404` y `500`
- los headers y el body aportan información importante al intercambio
- HTTP es una base esencial para entender APIs y backend moderno en Java

## Siguiente tema

En la próxima lección conviene pasar a **JSON**, porque después de entender cómo viaja la comunicación por HTTP, el siguiente paso natural es ver uno de los formatos de datos más usados para intercambiar información entre cliente y servidor.
