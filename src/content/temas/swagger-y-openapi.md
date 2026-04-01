---
title: "Swagger y OpenAPI"
description: "Qué es OpenAPI, cómo documentar una API Spring Boot y por qué Swagger ayuda tanto a entender, probar y comunicar endpoints."
order: 46
module: "Cierre de etapa y proyección"
level: "intermedio"
draft: false
---

## Introducción

Después de construir una API con:

- controllers
- services
- DTOs
- validaciones
- manejo de errores
- seguridad
- persistencia
- testing
- Docker
- despliegue

aparece una necesidad muy concreta:

**¿cómo explicás esa API para que otra persona la use sin tener que leer todo el código?**

Ahí entran OpenAPI y Swagger.

Documentar bien una API no es un detalle menor.
Es una parte muy importante de volverla utilizable, mantenible y profesional.

## Qué es OpenAPI

OpenAPI es una especificación para describir APIs HTTP de forma estructurada.

Dicho simple:

permite definir de manera estándar cosas como:

- endpoints
- métodos HTTP
- parámetros
- request bodies
- responses
- códigos de estado
- autenticación
- esquemas de datos

## Qué es Swagger

Swagger suele usarse para referirse al ecosistema de herramientas que trabaja sobre especificaciones OpenAPI.

En la práctica, mucha gente dice “Swagger” para hablar de la documentación visual e interactiva de una API.

Una forma útil de pensarlo es así:

- OpenAPI = la especificación
- Swagger = herramientas para trabajar con esa especificación

## La idea general

Una API bien documentada debería permitir entender rápidamente cosas como:

- qué rutas existen
- qué hace cada endpoint
- qué datos espera
- qué devuelve
- qué errores puede responder
- qué endpoints requieren autenticación

Sin eso, incluso una API buena puede ser incómoda de usar.

## Por qué importa tanto

Documentar la API ayuda a:

- facilitar consumo desde frontend o clientes externos
- reducir dudas
- acelerar pruebas
- mejorar onboarding de otras personas
- hacer el proyecto más profesional
- detectar inconsistencias en el diseño

## Qué problema resuelve

Sin documentación, muchas veces pasa esto:

- hay que leer controllers para entender la API
- no queda claro qué body mandar
- no se sabe qué status codes esperar
- los errores no están documentados
- cada consumidor prueba “a ojo”

OpenAPI ayuda a ordenar todo eso.

## Qué suele mostrar una documentación OpenAPI

Una documentación bien generada suele mostrar:

- lista de endpoints
- método HTTP
- descripción
- parámetros
- body esperado
- esquema de request
- esquema de response
- ejemplos
- códigos de error
- seguridad requerida

## Swagger UI

Una de las herramientas más conocidas es Swagger UI.

Swagger UI muestra la API en una interfaz web interactiva donde podés:

- ver endpoints
- expandir detalles
- leer esquemas
- probar requests
- enviar requests reales si está habilitado

Eso es extremadamente útil.

## Ejemplo mental

Supongamos un endpoint:

```text
POST /auth/login
```

Una buena documentación debería dejar claro:

- qué JSON espera
- qué devuelve si el login es correcto
- qué devuelve si falla
- si el endpoint es público
- qué formato tiene la respuesta con token

## OpenAPI en Spring Boot

En Spring Boot, una forma muy común de generar documentación OpenAPI es usar herramientas que lean tus controllers, DTOs y anotaciones y produzcan una documentación navegable.

Eso evita tener que escribir toda la documentación a mano desde cero.

## Qué tipo de cosas se documentan

Por ejemplo, en una API de productos, OpenAPI puede describir:

- `GET /products`
- `GET /products/{id}`
- `POST /products`
- `PUT /products/{id}`
- `DELETE /products/{id}`

Y además aclarar:

- qué requiere auth
- qué roles aplican
- qué body entra
- qué JSON sale

## Valor real para un proyecto integrador

En un proyecto integrador, sumar documentación OpenAPI tiene muchísimo valor porque demuestra que no solo construiste endpoints, sino que pensaste también en:

- usabilidad
- comunicación técnica
- consumo real de la API
- profesionalismo del backend

## Documentación y DTOs

Los DTOs ayudan muchísimo a que la documentación sea más clara.

¿Por qué?
Porque los request DTO y response DTO reflejan de forma bastante precisa los contratos de entrada y salida de la API.

Eso hace que OpenAPI pueda mostrar esquemas mucho más entendibles.

## Ejemplo conceptual

Supongamos este DTO:

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

Una herramienta de OpenAPI puede usar eso para mostrar un esquema aproximado del body esperado.

## Documentación y validaciones

Las validaciones también ayudan muchísimo.

Si un DTO tiene reglas como:

- nombre obligatorio
- precio positivo
- longitud mínima
- email válido

la documentación puede reflejar parte de esas restricciones, lo que mejora mucho la experiencia del consumidor de la API.

## Documentación y seguridad

Una API protegida también necesita documentar:

- qué endpoints son públicos
- cuáles requieren autenticación
- si usa Bearer token
- cómo se manda el token
- qué endpoints requieren rol o permisos particulares

Eso es especialmente importante cuando trabajás con JWT.

## Ejemplo de endpoint protegido

Por ejemplo:

```text
GET /profile
Authorization: Bearer <token>
```

La documentación debería dejar claro que ese endpoint requiere autenticación y que espera ese header.

## Qué no debería pasar

No debería pasar que la única forma de saber cómo usar la API sea:

- mirar todo el código
- adivinar el body
- probar manualmente hasta que algo funcione

Documentar bien ahorra muchísimo tiempo y evita muchos malentendidos.

## Documentación automática vs documentación pensada

Una observación importante:

generar documentación automática ayuda muchísimo, pero no alcanza por sí sola si la API está mal diseñada o si los nombres y contratos son confusos.

La mejor documentación nace de una API que ya está bastante clara.

## Qué conviene cuidar para que la documentación salga mejor

Conviene que la API tenga:

- nombres razonables
- DTOs claros
- endpoints coherentes
- responses consistentes
- errores razonablemente estructurados
- seguridad bien definida

Si eso está bien, OpenAPI luce mucho mejor y comunica mejor.

## Qué tipo de anotaciones suelen aparecer

En proyectos reales, es común enriquecer la documentación con anotaciones para describir mejor:

- operaciones
- parámetros
- responses
- esquemas
- ejemplos

No hace falta memorizar todas ahora.
Lo importante es entender el propósito:

**hacer la API más comprensible y más navegable**

## Ejemplo conceptual de controller documentado

```java
@RestController
@RequestMapping("/products")
public class ProductController {

    @GetMapping
    public List<ProductResponseDto> getProducts() {
        return List.of();
    }

    @PostMapping
    public ProductResponseDto createProduct(@RequestBody CreateProductRequestDto request) {
        return null;
    }
}
```

Una herramienta OpenAPI puede detectar bastante de esto automáticamente y convertirlo en documentación navegable.

## Qué suele mostrar Swagger UI para ese ejemplo

Algo así como:

- `GET /products`
  - descripción del endpoint
  - esquema de respuesta
  - status `200`

- `POST /products`
  - body esperado
  - esquema de request
  - esquema de response
  - posibles status

## Cómo ayuda durante desarrollo

Swagger UI también ayuda mucho durante desarrollo porque te permite probar endpoints sin depender exclusivamente de Postman o del frontend.

Eso no reemplaza otras herramientas, pero suma muchísimo.

## Diferencia con Postman

Postman sirve mucho para probar requests manuales.

Swagger UI, en cambio, suma además una capa muy fuerte de:

- documentación viva
- descubrimiento de endpoints
- entendimiento de contratos
- prueba rápida desde una interfaz conectada a la propia API

Ambos pueden convivir perfectamente.

## Qué conviene documentar sí o sí

En una API integradora o seria, conviene documentar al menos:

- auth / login
- endpoints principales del dominio
- requests importantes
- responses importantes
- errores clave
- seguridad requerida
- headers necesarios si aplica

## Documentar errores

Esto es un punto muy valioso.

No solo conviene documentar el caso feliz.
También conviene dejar claro:

- cuándo puede venir `400`
- cuándo puede venir `401`
- cuándo puede venir `403`
- cuándo puede venir `404`

Eso ayuda mucho a quien consume la API.

## Ejemplo mental de login documentado

### Request

```json
{
  "username": "gabriel",
  "password": "1234"
}
```

### Response exitosa

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

### Posibles errores

- `400` si faltan datos
- `401` si credenciales inválidas

Una buena documentación debería dejar esto bastante claro.

## Qué valor agrega a portfolio

Si tu proyecto tiene documentación OpenAPI / Swagger bien montada, eso suma mucho valor de portfolio porque muestra que pensaste la API no solo para vos, sino para ser usada por otros.

Eso es muy profesional.

## Cómo se conecta con todo lo anterior

OpenAPI / Swagger se apoya muy bien en todo lo que ya trabajaste:

- HTTP
- JSON
- API REST
- controllers
- DTOs
- validaciones
- manejo de errores
- seguridad con JWT
- proyecto integrador

Por eso aparece muy naturalmente en esta etapa.

## Buenas prácticas iniciales

## 1. Documentar contratos importantes

No solo los endpoints “bonitos”.

## 2. Mantener DTOs claros

Eso mejora directamente la documentación.

## 3. No confiar solo en generación automática sin revisar

Conviene mirar cómo queda la documentación final.

## 4. Dejar claro qué endpoints requieren autenticación

Especialmente si usás JWT.

## 5. Revisar ejemplos y respuestas de error

Eso mejora muchísimo la experiencia del consumidor de la API.

## Qué señales hacen que una documentación sea buena

Una documentación buena suele lograr que otra persona pueda:

- entender rápido qué ofrece la API
- autenticarse si hace falta
- probar endpoints
- saber qué body enviar
- saber qué esperar de respuesta
- detectar errores de consumo más rápido

## Qué señales hacen que una documentación sea mala

Una documentación mala suele dejarte con preguntas como:

- “¿qué campo espera acá?”
- “¿esto requiere token o no?”
- “¿qué devuelve exactamente?”
- “¿este 400 cuándo aparece?”
- “¿cómo pruebo login?”

Si esas dudas quedan abiertas, la documentación todavía no está cumpliendo bien su rol.

## Comparación con otros lenguajes

### Si venís de JavaScript

Quizás ya viste APIs documentadas con Swagger/OpenAPI en Node o frameworks similares. En Spring Boot cumple exactamente el mismo rol estratégico: volver más visible, usable y comprobable una API.

### Si venís de Python

Puede recordarte a la documentación automática de frameworks modernos. En Java y Spring Boot, OpenAPI también se volvió una herramienta muy importante para conectar código, documentación y prueba interactiva.

## Errores comunes

### 1. No documentar nada porque “el código ya se entiende”

Eso no ayuda a quien consume la API.

### 2. Documentar solo el caso feliz

Los errores y la seguridad también importan.

### 3. No revisar la documentación generada

A veces hay esquemas o nombres que conviene mejorar.

### 4. Tener una API inconsistente y esperar que la documentación la arregle

La documentación ayuda, pero no salva un diseño malo.

### 5. Olvidar documentar autenticación

Eso complica muchísimo probar endpoints protegidos.

## Mini ejercicio

Tomá un módulo de tu proyecto integrador, por ejemplo `auth` o `products`, y definí qué debería quedar documentado para que otra persona pueda usarlo.

Pensá al menos en:

1. endpoints
2. método HTTP
3. request body
4. response body
5. errores posibles
6. si requiere autenticación
7. si requiere rol especial

## Ejemplo posible

### `POST /auth/login`

- público
- recibe `username` y `password`
- devuelve `token`
- puede responder `400` o `401`

### `POST /products`

- requiere autenticación
- requiere rol `ADMIN`
- recibe `name` y `price`
- devuelve producto creado
- puede responder `400`, `401` o `403`

## Resumen

En esta lección viste que:

- OpenAPI es una especificación para describir APIs HTTP
- Swagger es el ecosistema de herramientas que ayuda a trabajar con esa especificación
- documentar una API mejora muchísimo su usabilidad y profesionalismo
- DTOs, validaciones, errores y seguridad influyen directamente en la calidad de la documentación
- Swagger UI permite navegar y probar endpoints de forma interactiva
- una buena documentación vuelve tu proyecto mucho más entendible para otras personas

## Siguiente tema

A partir de acá, el siguiente paso natural es aplicar todo esto en tu proyecto integrador, sumar documentación a tus endpoints y seguir profundizando según el tipo de backend que quieras construir.
