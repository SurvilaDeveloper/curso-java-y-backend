---
title: "Cómo documentar y probar una API segura con login y JWT"
description: "Entender cómo empezar a documentar y probar una API protegida con Spring Security y JWT, para que clientes, frontend y tests puedan consumir correctamente login, rutas protegidas y flujo de autenticación."
order: 72
module: "Seguridad con Spring Security"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo manejar:

- logout
- expiración
- refresh token

dentro de una API con JWT.

Eso ya te dio una visión bastante más realista del ciclo de vida de la autenticación basada en tokens.

Pero una vez que el backend ya:

- registra usuarios
- hace login
- emite JWT
- protege rutas
- reconoce al usuario actual
- renueva acceso
- y define qué endpoints son públicos o privados

aparece una necesidad muy importante:

> todo eso tiene que poder entenderse, consumirse y probarse correctamente desde afuera.

Porque una API segura no solo tiene que “funcionar internamente”.
También tiene que poder responder preguntas como:

- ¿cómo hago login?
- ¿qué endpoint devuelve el token?
- ¿qué formato tiene la respuesta?
- ¿cómo mando el JWT después?
- ¿qué rutas requieren Bearer token?
- ¿qué error devuelve una request sin token?
- ¿cómo se prueba el flujo completo?
- ¿cómo sabe el frontend qué hacer con access y refresh token?

Ahí entran dos dimensiones muy importantes:

- **documentación**
- **pruebas externas o de consumo**

Este tema es clave porque una seguridad bien implementada pero mal documentada o mal verificada desde afuera suele convertirse en una fuente constante de fricción.

## El problema de una API segura que nadie entiende bien

Supongamos que el backend ya tiene:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- rutas públicas
- rutas privadas
- rutas admin
- `Authorization: Bearer ...`

Si todo eso existe pero no está bien explicado, el frontend o cualquier consumidor de la API puede empezar a tener dudas muy básicas pero muy costosas:

- ¿login usa username o email?
- ¿qué devuelve login exactamente?
- ¿hay que mandar el token con `Bearer` o solo el string?
- ¿refresh devuelve access token nuevo o también refresh token?
- ¿qué rutas son públicas?
- ¿cuál responde `401` y cuál `403`?
- ¿cómo hago logout?
- ¿qué body espera register?

Cuando estas respuestas no están claras, la API se vuelve mucho más difícil de usar aunque “funcione”.

## Por qué documentar seguridad importa tanto

Porque la seguridad cambia bastante el contrato de consumo de la API.

En una API sin autenticación, muchas veces alcanza con documentar:

- ruta
- método
- request body
- response body
- status codes

Pero en una API con JWT también aparecen preguntas como:

- si la ruta es pública o protegida
- cómo se obtiene el token
- cómo se manda el token
- qué errores de autenticación pueden aparecer
- qué roles hacen falta en ciertos endpoints
- qué pasa cuando el token expira
- cómo se renueva

Eso significa que la seguridad forma parte del contrato externo y no solo de la implementación interna.

## Qué debería estar bien documentado

Como mínimo, en una API con login y JWT suele ser muy importante documentar:

- endpoint de registro
- endpoint de login
- formato de la respuesta de login
- uso del header `Authorization: Bearer ...`
- qué endpoints requieren autenticación
- qué endpoints requieren roles especiales
- endpoint de refresh si existe
- comportamiento conceptual de logout
- errores típicos de autenticación/autorización

No hace falta que todo sea una enciclopedia infinita.
Pero sí conviene que el consumidor pueda entender el flujo.

## Un primer bloque que conviene documentar: register

Por ejemplo:

### Endpoint
```text
POST /auth/register
```

### Request
```json
{
  "username": "gabriel",
  "email": "gabriel@mail.com",
  "password": "ClaveSegura123"
}
```

### Respuesta exitosa
```json
{
  "id": 1,
  "username": "gabriel",
  "email": "gabriel@mail.com",
  "activo": true
}
```

### Errores posibles
- `400` si el body es inválido
- `409` si el username o email ya existen

Esto ya ayuda muchísimo a un cliente.

## Segundo bloque importante: login

### Endpoint
```text
POST /auth/login
```

### Request
```json
{
  "username": "gabriel",
  "password": "ClaveSegura123"
}
```

### Respuesta exitosa
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "type": "Bearer"
}
```

### Error típico
- `401` o respuesta equivalente si las credenciales no son válidas

Esto es extremadamente importante porque login es una de las puertas principales de toda la API.

## Qué conviene explicar del token

No alcanza con mostrar el JSON de respuesta.
También conviene documentar cómo se usa.

Por ejemplo:

> en las requests protegidas, el `accessToken` debe enviarse en el header `Authorization` con el formato `Bearer <token>`.

Ejemplo:

```text
Authorization: Bearer eyJhbGciOi...
```

Esto parece obvio si ya vivís dentro del backend.
Pero para quien consume la API, tenerlo escrito de forma clara ahorra muchísimo tiempo.

## Tercer bloque: rutas protegidas

Conviene que la documentación deje claro cuáles endpoints requieren token.

Por ejemplo:

### Requiere autenticación
- `GET /usuarios/me`
- `PUT /usuarios/me`
- `GET /pedidos/mis-pedidos`
- `POST /pedidos`

### Requiere rol admin
- `POST /productos`
- `PUT /productos/{id}`
- `DELETE /productos/{id}`
- `GET /admin/reportes`

Esto ayuda mucho a que el consumidor entienda de antemano qué esperar.

## Qué conviene explicar sobre 401 y 403

Esto es muy importante en APIs seguras.

### 401
Suele significar:
- no hay autenticación válida
- falta token
- token inválido o vencido

### 403
Suele significar:
- sí hay autenticación
- pero no hay permisos suficientes para esa acción

Este punto es muy útil para frontend, QA y cualquier integrador.
Ayuda a interpretar correctamente los fallos de acceso.

## Qué conviene documentar del refresh

Si tu sistema usa refresh token, también conviene explicar claramente:

### Endpoint
```text
POST /auth/refresh
```

### Request
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

### Respuesta
```json
{
  "accessToken": "eyJhbGciOi...",
  "type": "Bearer"
}
```

### Cuándo se usa
- cuando el access token venció o está por vencer
- para obtener un nuevo access token sin login completo

Este punto suele ser una de las mayores fuentes de confusión si no está escrito claramente.

## Qué pasa con logout en la documentación

Aunque logout con JWT no sea igual a una sesión clásica, conviene documentar el comportamiento que espera el cliente.

Por ejemplo, si existe un endpoint:

```text
POST /auth/logout
```

conviene explicar algo como:

- qué recibe
- si invalida refresh token
- qué debe borrar el cliente de su lado
- si el access token actual sigue valiendo hasta expirar o no, según el diseño

No hace falta convertir esto en un tratado teórico.
Pero sí conviene dejar el comportamiento claro.

## Una forma sana de pensar la documentación

Podés pensarla así:

> no solo tengo que explicar qué endpoint existe, sino cómo se inserta en el flujo completo de autenticación.

Eso hace que la documentación sea mucho más útil que una mera lista de rutas sueltas.

## Qué pasa con OpenAPI o Swagger

Acá aparece una herramienta muy importante.

En proyectos Spring Boot es muy común documentar APIs con OpenAPI y exponer una UI tipo Swagger para:

- ver endpoints
- ver request/response
- probar rutas
- definir seguridad Bearer
- entender contratos más rápido

Esto puede aportar muchísimo valor en APIs seguras.

No hace falta ahora entrar a toda la configuración exacta de librerías.
Lo importante primero es entender por qué OpenAPI se vuelve tan valioso en este contexto.

## Por qué OpenAPI ayuda tanto en seguridad

Porque permite que la documentación no quede solo en texto estático.
También puede mostrar:

- endpoints de auth
- esquemas de request y response
- qué rutas requieren autenticación
- cómo probar con Bearer token
- errores esperables
- contratos actualizados de forma más integrada al código

Eso reduce mucho la distancia entre implementación y documentación.

## Qué conviene mostrar en OpenAPI para JWT

Suele ser muy útil documentar cosas como:

- esquema de seguridad Bearer
- endpoints de register/login/refresh
- ejemplos de request y response
- qué endpoints requieren autenticación
- qué rutas son admin o especiales si querés detallarlo

Esto hace que la API sea mucho más amigable para frontend y para pruebas manuales.

## Qué significa probar la API “desde afuera”

Significa verificarla desde el punto de vista del consumidor real del contrato, no solo desde tests internos del backend.

Por ejemplo:

- probar login desde Postman o Swagger UI
- copiar el JWT y usarlo en una ruta protegida
- verificar qué responde una request sin token
- probar refresh
- comprobar que un USER no accede a rutas ADMIN
- verificar expiración o errores de acceso

Este tipo de prueba es muy valioso porque se parece bastante a cómo la usará el cliente real.

## Por qué esto no reemplaza los tests automáticos

Porque cumple otro papel.

Los tests internos del backend verifican:

- lógica
- persistencia
- seguridad
- controladores
- integración

Las pruebas externas o de consumo verifican más bien:

- que el contrato se entiende
- que el flujo se puede usar de verdad
- que la documentación coincide con la práctica
- que frontend o integradores no se van a perder

Ambas dimensiones se complementan.

## Un flujo manual mínimo que conviene poder probar

Una API con JWT ya bastante armada debería poder probarse manualmente con algo así:

1. registrar usuario
2. hacer login
3. recibir access y refresh token
4. llamar a `/usuarios/me` con Bearer token
5. probar una ruta protegida sin token y ver rechazo
6. probar una ruta admin con usuario no admin y ver `403`
7. usar refresh para renovar access token
8. probar logout según el diseño

Si ese flujo está claro y es repetible, la API ya está bastante bien parada.

## Qué herramientas suelen usarse para esto

Muy comúnmente:

- Swagger UI / OpenAPI UI
- Postman
- Insomnia
- curl
- frontend real de la aplicación
- tests de integración automatizados

No hace falta casarse con una sola.
Lo importante es que exista alguna forma clara de consumir y verificar la API como cliente real.

## Qué conviene documentar en cada endpoint protegido

Además de request y response, conviene indicar cosas como:

- si requiere Bearer token
- si requiere rol especial
- si puede devolver `401`
- si puede devolver `403`
- ejemplos mínimos de uso

Ese nivel de claridad ayuda muchísimo a evitar malentendidos.

## Un ejemplo textual bien útil

Por ejemplo, para `/usuarios/me`:

### Endpoint
```text
GET /usuarios/me
```

### Seguridad
Requiere `Authorization: Bearer <accessToken>`

### Respuesta
```json
{
  "id": 1,
  "username": "gabriel",
  "email": "gabriel@mail.com",
  "activo": true,
  "roles": ["USER"]
}
```

### Errores posibles
- `401` si falta token o es inválido
- `403` si la política del sistema lo requiere por alguna condición adicional

Esto ya es mucho más útil que simplemente listar la ruta sin contexto.

## Qué conviene documentar para endpoints admin

Por ejemplo:

### Endpoint
```text
DELETE /productos/{id}
```

### Seguridad
Requiere Bearer token con rol `ADMIN`

### Errores posibles
- `401` si no hay autenticación válida
- `403` si el usuario autenticado no tiene rol `ADMIN`
- `404` si el producto no existe

Este tipo de documentación evita muchísima fricción.

## Qué pasa con ejemplos

Los ejemplos ayudan muchísimo en APIs seguras.

Especialmente conviene incluir ejemplos de:

- register
- login
- request con Bearer token
- refresh
- errores típicos
- endpoints como `/me`

Porque ahí es donde más fácil es que un cliente se pierda si solo ve firmas abstractas.

## Qué relación tiene esto con frontend

Muy fuerte.

El frontend necesita saber con claridad:

- qué endpoint usar para login
- qué payload mandar
- qué token guardar
- cómo enviarlo
- cuándo usar refresh
- qué interpretar de un `401`
- qué interpretar de un `403`

Si esto no está bien documentado o bien probado desde afuera, la integración con frontend se vuelve mucho más dolorosa aunque el backend esté “bien codificado”.

## Qué relación tiene esto con QA o testing manual

También muy fuerte.

Un QA o alguien que prueba la API necesita un mapa claro de:

- escenarios válidos
- escenarios inválidos
- credenciales
- roles
- respuestas esperadas
- flujo de autenticación

Por eso documentar seguridad también mejora mucho la calidad del proceso de prueba.

## Qué relación tiene esto con OpenAPI bien usado

Muy fuerte otra vez.

Cuando OpenAPI está bien configurado, puede convertirse en una forma muy cómoda de:

- leer la API
- entender auth
- copiar ejemplos
- probar endpoints
- cargar Bearer token y reutilizarlo
- comunicar el contrato a otros equipos

Eso le da muchísimo valor más allá de “tener swagger porque sí”.

## Qué no conviene hacer

No conviene asumir que el consumidor “ya sabrá” cómo funciona tu JWT o tu login.

Aunque para vos sea obvio desde adentro del backend, para afuera no lo es necesariamente.

## Otro error común

Documentar solo el login y olvidarse de explicar cómo se usa el token en las rutas protegidas.

Eso deja la parte más práctica del consumo incompleta.

## Otro error común

No diferenciar bien 401 y 403 en la documentación o en los ejemplos.
Eso genera mucha confusión en frontend y en pruebas.

## Otro error común

Cambiar el contrato del login, refresh o `/me` y no actualizar la documentación o los ejemplos.
Ahí es donde OpenAPI integrado puede ayudar muchísimo.

## Otro error común

Pensar que porque ya hay tests internos no hace falta probar el flujo de autenticación desde afuera.

En realidad, los dos niveles aportan valor distinto.

## Una buena heurística

Podés preguntarte:

- ¿alguien que no escribió este backend entendería cómo usar login y JWT leyendo mi documentación?
- ¿está claro qué endpoints son públicos y cuáles protegidos?
- ¿está claro cómo se manda el Bearer token?
- ¿hay ejemplos de refresh y errores típicos?
- ¿puedo reproducir el flujo completo como cliente externo sin adivinar cosas?

Si la respuesta es sí, tu API segura ya está mucho mejor preparada para ser usada de verdad.

## Qué relación tiene esto con una API real

Muy directa.

Porque una API segura sin documentación clara suele bloquear muchísimo más de lo que ayuda.
Y una API segura sin pruebas externas razonables suele romper integraciones con demasiada facilidad.

Por eso esta parte no es “decoración”.
Es parte real de la calidad del backend.

## Relación con Spring Boot

Spring Boot encaja muy bien con esta etapa porque el ecosistema tiene herramientas muy buenas para:

- documentar endpoints
- exponer OpenAPI
- describir esquemas
- integrar seguridad Bearer
- y probar rutas protegidas de forma bastante cómoda

Eso hace que no tengas que elegir entre seguridad y usabilidad del contrato.
Podés trabajar ambas cosas bastante bien juntas.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> una API segura con login y JWT no solo tiene que autenticar bien, sino también explicar claramente cómo se usa desde afuera y poder probarse como la consumirá un cliente real, documentando endpoints de auth, Bearer token, rutas protegidas, errores típicos y flujo de refresh de forma comprensible y verificable.

## Resumen

- La seguridad también forma parte del contrato externo de la API.
- Conviene documentar register, login, uso del Bearer token, refresh, logout y rutas protegidas.
- OpenAPI/Swagger puede aportar muchísimo valor en APIs seguras.
- Las pruebas externas ayudan a validar el flujo real de consumo, no solo la lógica interna.
- Frontend, QA e integradores dependen mucho de que el flujo de autenticación esté claro.
- 401, 403 y el uso del header Authorization deberían estar bien explicados.
- Este tema cierra muy bien el bloque de seguridad llevándolo al terreno del consumo real de la API.

## Próximo tema

En el próximo tema vas a ver cómo empezar a integrar un backend Spring Boot con un frontend real consumiendo esta API segura, que es el paso natural después de tener ya login, JWT y endpoints protegidos bien modelados.
