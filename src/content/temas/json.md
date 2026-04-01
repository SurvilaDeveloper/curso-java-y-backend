---
title: "JSON"
description: "Qué es JSON, cómo se estructura y por qué es uno de los formatos más usados para intercambiar datos en backend y APIs."
order: 27
module: "Backend web"
level: "intermedio"
draft: false
---

## Introducción

En la lección anterior viste HTTP, o sea, el protocolo que permite la comunicación entre cliente y servidor.

Pero HTTP, por sí solo, no define cómo deben representarse los datos que viajan dentro de una request o una response.

Ahí aparece JSON.

JSON es uno de los formatos más usados para intercambiar información entre sistemas, especialmente en APIs web modernas.

Si querés trabajar en backend con Java, entender JSON es fundamental.

## Qué es JSON

JSON significa:

**JavaScript Object Notation**

A pesar del nombre, no pertenece solo a JavaScript.

Hoy se usa muchísimo en muchísimos lenguajes y plataformas, incluyendo Java.

JSON es un formato de texto liviano y legible para representar datos estructurados.

## La idea general

JSON sirve para expresar información en forma de:

- objetos
- listas
- pares clave-valor
- números
- texto
- booleanos
- null

Por ejemplo, un producto puede representarse así:

```json
{
  "id": 1,
  "name": "Notebook",
  "price": 1250.50,
  "available": true
}
```

## Por qué se usa tanto

JSON se volvió muy popular porque:

- es fácil de leer
- es fácil de generar
- es fácil de parsear
- funciona muy bien para intercambiar datos entre cliente y servidor
- encaja muy bien con estructuras comunes en programación

En backend moderno, es probablemente el formato más común para request y response bodies.

## JSON es texto

Esto es importante.

JSON no es un objeto de Java, ni un objeto de JavaScript, ni una clase del lenguaje.

JSON es texto con una estructura específica.

Por ejemplo, esto es JSON:

```json
{
  "username": "gabriel",
  "active": true
}
```

Eso es un texto estructurado, no un objeto Java todavía.

## Estructuras básicas de JSON

Las dos estructuras más importantes al empezar son:

- objeto
- array

## Objeto JSON

Un objeto JSON está formado por pares clave-valor.

Ejemplo:

```json
{
  "name": "Ana",
  "age": 30,
  "active": true
}
```

## Qué representa esto

- `"name"` es una clave
- `"Ana"` es su valor
- `"age"` es otra clave
- `30` es su valor
- `"active"` es otra clave
- `true` es su valor

## Array JSON

Un array JSON representa una lista ordenada de valores.

Ejemplo:

```json
[
  "Java",
  "Spring",
  "SQL"
]
```

También puede contener objetos:

```json
[
  { "id": 1, "name": "Notebook" },
  { "id": 2, "name": "Mouse" }
]
```

## Tipos de valores en JSON

Los valores válidos en JSON pueden ser:

- string
- number
- boolean
- null
- object
- array

## String

```json
"name": "Gabriel"
```

Importante:
en JSON, los strings van entre comillas dobles.

## Number

```json
"price": 1250.50
```

## Boolean

```json
"available": true
```

o

```json
"active": false
```

## Null

```json
"middleName": null
```

## Object

```json
"address": {
  "city": "Buenos Aires",
  "zipCode": "1884"
}
```

## Array

```json
"tags": ["java", "backend", "api"]
```

## Reglas importantes de sintaxis

JSON tiene una sintaxis bastante simple, pero conviene respetar bien estas reglas:

- las claves van entre comillas dobles
- los strings van entre comillas dobles
- no se usan comillas simples
- los objetos van entre llaves `{ }`
- los arrays van entre corchetes `[ ]`
- los pares clave-valor se separan con `:`
- los elementos se separan con `,`

## Ejemplo válido

```json
{
  "id": 1,
  "name": "Notebook",
  "available": true
}
```

## Ejemplo inválido

```json
{
  name: "Notebook"
}
```

Eso es inválido en JSON porque la clave debería estar entre comillas dobles.

## Otro ejemplo inválido

```json
{
  "name": 'Notebook'
}
```

Eso también es inválido porque JSON no usa comillas simples para strings.

## JSON anidado

JSON permite estructuras anidadas.

Ejemplo:

```json
{
  "id": 1,
  "name": "Gabriel",
  "address": {
    "street": "Calle 123",
    "city": "Buenos Aires"
  },
  "roles": ["ADMIN", "EDITOR"]
}
```

Esto es muy común en APIs reales.

## Cómo se usa JSON en HTTP

JSON aparece muchísimo como body en requests y responses HTTP.

Por ejemplo, una request `POST` para crear un producto podría enviar esto:

```json
{
  "name": "Notebook",
  "price": 1250.50,
  "available": true
}
```

Y el servidor podría responder con algo como:

```json
{
  "id": 1,
  "name": "Notebook",
  "price": 1250.50,
  "available": true
}
```

## Header importante: `Content-Type`

Cuando una request o response lleva JSON, suele aparecer este header:

```text
Content-Type: application/json
```

Eso le dice al otro lado:
“el contenido que te estoy enviando está en formato JSON”.

## JSON y Java

En Java, JSON no se trabaja normalmente “a mano” en proyectos grandes.

Lo habitual es usar librerías que conviertan entre:

- objetos Java
- texto JSON

Ese proceso suele llamarse:

- serialización
- deserialización

## Serialización

Convertir un objeto Java a JSON.

Ejemplo conceptual:

```java
Product product = new Product(1, "Notebook", 1250.50);
```

↓

```json
{
  "id": 1,
  "name": "Notebook",
  "price": 1250.50
}
```

## Deserialización

Convertir JSON a objeto Java.

Ejemplo conceptual:

```json
{
  "id": 1,
  "name": "Notebook",
  "price": 1250.50
}
```

↓

```java
Product product = ...
```

## Librerías comunes para JSON en Java

En proyectos Java se usan mucho librerías como:

- Jackson
- Gson

Más adelante, cuando trabajes con Spring Boot, Jackson aparece muchísimo porque suele encargarse automáticamente de transformar objetos Java a JSON y viceversa.

## JSON y DTOs

JSON se relaciona mucho con la idea de DTOs.

Por ejemplo, una API puede recibir un JSON que represente datos de entrada, y eso se transforma en un DTO de Java.

Más adelante, cuando veas APIs REST y Spring Boot, esto va a volverse muy importante.

## Diferencia entre JSON y objeto Java

Esto conviene tenerlo muy claro.

### Objeto Java

Tiene clases, tipos, métodos, encapsulación, constructores, etc.

### JSON

Es solo una representación textual estructurada de datos.

Por ejemplo, esto es Java:

```java
Product product = new Product(1, "Notebook", 1250.50);
```

Y esto es JSON:

```json
{
  "id": 1,
  "name": "Notebook",
  "price": 1250.50
}
```

No son lo mismo, aunque puedan representar la misma información.

## JSON y arrays / collections

Un array o una colección Java puede representarse muy naturalmente como un array JSON.

Ejemplo en Java conceptual:

```java
List<String> tags = List.of("java", "backend", "api");
```

Como JSON:

```json
["java", "backend", "api"]
```

Y una lista de objetos:

```json
[
  { "id": 1, "name": "Notebook" },
  { "id": 2, "name": "Mouse" }
]
```

## Ejemplo de JSON para una orden

```json
{
  "orderNumber": "ORD-1001",
  "customer": {
    "name": "Gabriel",
    "email": "gabriel@example.com"
  },
  "items": [
    {
      "productName": "Notebook",
      "quantity": 1
    },
    {
      "productName": "Mouse",
      "quantity": 2
    }
  ],
  "paid": true
}
```

Este ejemplo muestra muy bien que JSON puede representar estructuras bastante ricas.

## JSON en APIs REST

En APIs REST, JSON suele usarse para:

- enviar datos de entrada
- devolver datos de salida
- representar errores
- modelar listas y recursos

Por ejemplo:

### `GET /products`

Response:

```json
[
  { "id": 1, "name": "Notebook" },
  { "id": 2, "name": "Mouse" }
]
```

### `POST /products`

Request body:

```json
{
  "name": "Teclado",
  "price": 45.99
}
```

## JSON y errores

Las APIs también suelen devolver errores en formato JSON.

Ejemplo:

```json
{
  "error": "Bad Request",
  "message": "El precio no puede ser negativo",
  "status": 400
}
```

## Ventajas de JSON

## 1. Legibilidad

Es bastante fácil de leer incluso sin herramientas especiales.

## 2. Portabilidad

Se usa en muchísimos lenguajes y plataformas.

## 3. Flexibilidad

Permite estructuras simples o anidadas.

## 4. Integración natural con APIs

Encaja muy bien con HTTP y backend moderno.

## Limitaciones de JSON

También conviene saber que JSON no resuelve todo.

Por ejemplo:

- no modela comportamiento
- no representa tipos Java de forma exacta por sí solo
- necesita conversión cuando querés trabajar con objetos del lenguaje
- para ciertas estructuras complejas o formatos binarios puede no ser la mejor opción

## JSON bien formado vs mal formado

Ejemplo bien formado:

```json
{
  "name": "Ana",
  "age": 30
}
```

Ejemplo mal formado:

```json
{
  "name": "Ana"
  "age": 30
}
```

Eso está mal porque falta una coma.

Otro ejemplo mal formado:

```json
{
  "active": True
}
```

Eso está mal porque en JSON los booleanos válidos son `true` y `false`, en minúscula.

## Comparación con otros formatos

JSON no es el único formato de intercambio, pero sí uno de los más usados.

Otros formatos que existen son:

- XML
- CSV
- YAML

En backend moderno, JSON suele ser el más frecuente para APIs web.

## Ejemplo conceptual de conversión en Java

No hace falta que lo implementes a mano todavía, pero conceptualmente, con una librería como Jackson podrías tener algo así:

```java
ObjectMapper mapper = new ObjectMapper();

String json = mapper.writeValueAsString(product);
Product parsed = mapper.readValue(json, Product.class);
```

La idea importante por ahora no es memorizar esa API, sino entender qué problema resuelve.

## Comparación con otros lenguajes

### Si venís de JavaScript

JSON seguramente te resulte muy familiar. Lo importante acá es separar claramente JSON como texto del objeto JavaScript o del objeto Java.

### Si venís de Python

También puede resultarte muy conocido. En Java, la diferencia fuerte es que suele integrarse con clases, DTOs y librerías de serialización dentro de un ecosistema tipado.

## Errores comunes

### 1. Creer que JSON es “un objeto Java”

No lo es. Es texto estructurado.

### 2. Usar comillas simples

JSON usa comillas dobles para strings y claves.

### 3. Olvidar comas o llaves / corchetes

Eso vuelve inválido el JSON.

### 4. Confundir un array JSON con un objeto JSON

Son estructuras distintas y sirven para cosas distintas.

### 5. No pensar cómo ese JSON se va a mapear a objetos Java

Más adelante esto importa muchísimo al diseñar APIs.

## Mini ejercicio

Escribí ejemplos de JSON para representar:

1. un usuario con username, email y activo
2. una lista de productos
3. una orden con cliente e ítems
4. un error de validación
5. una tarea con título, estado y tags

Después intentá identificar en cada ejemplo:

- qué partes son objetos
- qué partes son arrays
- qué partes son strings, números, booleanos o null

## Ejemplo posible

### Usuario

```json
{
  "username": "gabriel",
  "email": "gabriel@example.com",
  "active": true
}
```

### Lista de productos

```json
[
  { "id": 1, "name": "Notebook", "price": 1250.50 },
  { "id": 2, "name": "Mouse", "price": 25.99 }
]
```

### Error

```json
{
  "error": "Bad Request",
  "message": "El nombre es obligatorio",
  "status": 400
}
```

## Resumen

En esta lección viste que:

- JSON es un formato de texto para representar datos estructurados
- se usa muchísimo en HTTP, APIs y backend moderno
- puede representar objetos, arrays, strings, números, booleanos y null
- no es lo mismo que un objeto Java
- suele viajar en request y response bodies con `Content-Type: application/json`
- en Java normalmente se convierte a objetos usando librerías como Jackson o Gson

## Siguiente tema

En la próxima lección conviene pasar a **API REST**, porque después de entender HTTP y JSON, el siguiente paso natural es ver cómo se diseñan servicios backend que exponen recursos y operaciones de forma coherente sobre la web.
