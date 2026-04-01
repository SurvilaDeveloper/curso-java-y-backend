---
title: "Cómo empezar con JWT en Spring Boot de forma conceptual y práctica"
description: "Entender cómo funciona JWT dentro de una API Spring Boot, qué papel cumple en el login, cómo viaja en requests posteriores y por qué se volvió una de las estrategias más comunes para frontends desacoplados y apps móviles."
order: 64
module: "Seguridad con Spring Security"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo elegir entre:

- sesión
- Basic Auth
- JWT

para autenticar usuarios.

Eso te dio una mirada muy importante:
no todas las aplicaciones mantienen la identidad del usuario del mismo modo, y la elección de esa estrategia impacta bastante en la arquitectura del backend y en la relación con el frontend.

Ahora toca bajar una de las opciones más usadas en APIs modernas a un plano mucho más concreto:

**JWT**

Este tema es clave porque JWT aparece muchísimo cuando el backend expone una API para:

- frontend desacoplado
- SPA
- aplicaciones móviles
- clientes múltiples
- arquitecturas más orientadas a token

Pero no alcanza con saber que “JWT existe”.
Hace falta entender bien:

- qué problema resuelve
- cómo encaja en el login
- qué devuelve el backend
- qué manda el cliente en requests posteriores
- cómo el servidor reconstruye la identidad a partir del token
- y qué cambia en la forma de pensar Spring Security

## Qué es JWT a nivel simple

JWT significa **JSON Web Token**.

Más allá del nombre técnico, la idea inicial importante es esta:

> JWT es un token que el backend puede emitir después de autenticar correctamente a un usuario, y que el cliente enviará después en requests posteriores para demostrar esa identidad.

Esa es la intuición central.

No hace falta empezar pensando en toda su estructura interna ni en detalles criptográficos finos.
Primero conviene fijar el flujo mental correcto.

## El problema que JWT intenta resolver

Supongamos este escenario:

1. el usuario manda login y contraseña
2. el backend valida que son correctos
3. ahora el usuario quiere seguir haciendo requests autenticadas

La pregunta es:

> ¿cómo reconoce el backend al usuario en la request número 2, 3, 4, 20 o 100?

Con JWT, la respuesta general es:

- el backend genera un token
- el cliente lo guarda
- el cliente lo vuelve a mandar en cada request protegida
- el backend valida ese token
- a partir de él reconstruye la identidad del usuario

Ese flujo es la esencia del enfoque.

## Cómo se siente mentalmente JWT

Podés pensarlo así:

- el login no te “logea para siempre” mágicamente
- el login te da un token
- ese token es la prueba de identidad que el cliente presenta después
- el backend lo examina en cada request protegida

Eso hace que el modelo sea muy natural para APIs desacopladas.

## Un flujo completo muy básico

La historia general suele verse más o menos así:

1. el usuario manda credenciales a `/auth/login`
2. el backend valida usuario y contraseña
3. si son válidos, genera un JWT
4. el backend responde con ese token
5. el cliente lo guarda
6. en cada request posterior protegida, el cliente envía ese token
7. el backend lo valida
8. si el token es válido, reconstruye el usuario autenticado y deja pasar la request

Este flujo resume casi todo el corazón del tema.

## Por qué JWT encaja tan bien con APIs modernas

Porque es muy natural en escenarios donde:

- frontend y backend están separados
- hay una SPA en React, Vue, Angular o similar
- además hay cliente móvil
- varios clientes distintos consumen la misma API
- no querés depender del mismo estilo de sesión clásica de una app web tradicional

En esos contextos, que el cliente lleve el token y lo mande request por request suele sentirse muy coherente.

## Qué devuelve normalmente el login con JWT

En lugar de establecer una sesión tradicional visible para el cliente como idea principal, un endpoint de login con JWT suele devolver algo como:

```json
{
  "token": "eyJhbGciOi..."
}
```

o a veces algo un poco más rico:

```json
{
  "token": "eyJhbGciOi...",
  "type": "Bearer"
}
```

o incluso:

```json
{
  "accessToken": "eyJhbGciOi...",
  "expiresIn": 3600
}
```

No hay una única forma universal de respuesta.
Lo importante es entender la lógica:

> el login exitoso devuelve un token que el cliente usará en requests posteriores.

## Qué manda el cliente después

Una vez que tiene el token, el cliente normalmente lo manda en el header `Authorization`.

La forma más típica y famosa es:

```text
Authorization: Bearer eyJhbGciOi...
```

La palabra **Bearer** es muy importante en este ecosistema.

Podés leer ese header así:

> te presento este token como prueba de autenticación para esta request.

## Cómo se ve mentalmente una request autenticada con JWT

Podés imaginar algo así:

```text
GET /usuarios/me
Authorization: Bearer eyJhbGciOi...
```

El backend recibe esa request y entonces se pregunta:

- ¿hay header Authorization?
- ¿está en formato Bearer?
- ¿el token es válido?
- ¿no venció?
- ¿fue emitido correctamente?
- ¿qué usuario representa?

Si todo eso da bien, la request se trata como autenticada.

## Qué cambia respecto de sesión

Con sesión, el servidor recuerda de una manera más clásica al usuario autenticado.

Con JWT, la idea base es más bien:

- el cliente trae el token
- el backend lo valida
- el backend reconstruye la identidad desde ese token o a partir de lo que el token contiene

Eso hace que el modelo sea muy cómodo para una API que no quiere depender tanto de sesión tradicional del lado servidor.

## Qué significa “Bearer”

Conviene detenerse un segundo acá porque aparece muchísimo.

Cuando ves:

```text
Authorization: Bearer <token>
```

la palabra `Bearer` comunica algo así como:

> esta request trae un token portador que el backend debe usar para autenticación.

No hace falta sobreromantizar el término.
Lo importante es que esa es la convención típica cuando trabajás con JWT en APIs.

## Qué suele contener conceptualmente un JWT

Sin entrar todavía a toda la estructura exacta, conviene entender que el token suele contener información útil para identificar o describir al usuario autenticado.

Por ejemplo, según el diseño, podría reflejar cosas como:

- username
- email
- id
- roles
- expiración
- metadata de autenticación

No hace falta definir ahora qué debería ir exactamente en todos los casos.
Lo importante es entender que el token ayuda al backend a reconstruir identidad y contexto de seguridad.

## Qué papel cumple la expiración

Muy importante.

Un token JWT no suele pensarse como “válido eternamente”.

Porque eso sería un riesgo enorme.

Entonces una de las ideas más comunes es que el token tenga vencimiento.

Eso significa, conceptualmente:

> el token sirve por un tiempo determinado; después deja de ser válido y el cliente necesita otra estrategia para seguir autenticado.

Esto es central para no pensar el token como algo perpetuo e incontestable.

## Qué hace el backend cuando llega un token

A muy alto nivel, el backend suele hacer algo así:

1. leer el header Authorization
2. verificar que tiene formato Bearer
3. extraer el token
4. validarlo
5. si es válido, reconstruir el usuario o principal
6. cargar esa autenticación dentro del contexto de seguridad
7. dejar pasar la request hacia el controller

Este flujo es extremadamente importante porque ahí está el corazón de JWT dentro de Spring Security.

## Qué papel juega Spring Security acá

Spring Security es el marco que te permite integrar este flujo dentro del pipeline real de la aplicación.

Dicho simple:

> no se trata solo de que el token exista, sino de que Spring Security pueda usarlo para poblar correctamente la autenticación de la request actual.

Y esa es una de las grandes razones por las que JWT y Spring Security suelen verse tan juntos.

## Qué piezas suelen aparecer en una implementación típica con JWT

Aunque más adelante podrías entrar en cada una con más detalle, una implementación típica suele incluir algo como:

- endpoint de login
- servicio de autenticación
- componente para generar tokens
- componente para validar tokens
- filtro que inspecciona el header Authorization
- integración con Spring Security para cargar el usuario autenticado
- reglas de seguridad para proteger rutas

No hace falta aprender todas esas piezas de golpe hoy mismo.
Pero conviene ver el mapa completo desde temprano.

## Un ejemplo conceptual del login

Supongamos un endpoint así:

```java
@PostMapping("/auth/login")
public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    LoginResponse response = authService.login(request);
    return ResponseEntity.ok(response);
}
```

Y algo como:

```java
public class LoginRequest {
    private String username;
    private String password;
}
```

```java
public class LoginResponse {
    private String token;
}
```

La lógica conceptual del `authService.login(...)` sería:

- validar credenciales
- si son correctas, generar token JWT
- devolverlo al cliente

Eso ya te deja un esqueleto mental bastante claro.

## Cómo se ve la idea dentro del service de login

Algo conceptual podría ser:

```java
public LoginResponse login(LoginRequest request) {
    // validar credenciales
    // si son inválidas, rechazar
    // si son válidas, generar token

    String token = jwtService.generarToken(...);

    LoginResponse response = new LoginResponse();
    response.setToken(token);

    return response;
}
```

Más adelante verás mejor qué significa “validar credenciales”.
Pero para este tema, la idea importante es que el login no solo dice “ok”.
Entrega un token usable para el resto de la sesión lógica del cliente.

## Qué papel cumple un JwtService o similar

Suele ser muy común separar la lógica de JWT en un componente dedicado.

Por ejemplo:

- generar token
- validar token
- extraer username
- verificar expiración

Eso puede vivir en algo como:

- `JwtService`
- `TokenService`
- `JwtProvider`

El nombre puede variar.
La idea es la misma:

> encapsular la lógica específica del manejo del token.

Esto ayuda mucho a no ensuciar controllers o services con detalles de infraestructura de seguridad.

## Qué hace un filtro JWT

Otra pieza muy común es un filtro que intercepta requests.

Su trabajo conceptual suele ser:

- mirar si viene header Authorization
- verificar si empieza con `Bearer `
- extraer el token
- validarlo
- si es válido, cargar la autenticación en el contexto de seguridad

Ese filtro es uno de los grandes puentes entre:

- el token que manda el cliente
- y el principal autenticado que luego puede usar el backend

## Por qué esto es tan importante

Porque el controller no debería andar parseando manualmente headers JWT request por request.

La seguridad bien integrada busca que, cuando la request llegue al controller, ya exista un contexto autenticado razonablemente armado.

Por eso el filtro es una pieza tan clave del pipeline.

## Un ejemplo mental del flujo completo de request protegida

Imaginá esto:

```text
GET /usuarios/me
Authorization: Bearer eyJhbGciOi...
```

Entonces el flujo conceptual es:

1. el filtro ve el header
2. extrae el token
3. lo valida
4. reconoce al usuario representado
5. carga autenticación en el contexto
6. la request sigue
7. el controller puede acceder al usuario actual

Eso conecta directamente con todo lo que viste en el tema 62 sobre `/me` y recursos propios.

## Qué relación tiene esto con el usuario actual

Total.

Porque sin un mecanismo como este, el backend no podría reconstruir correctamente el principal en cada request protegida.

Y sin ese principal, endpoints como:

- `/me`
- `/mis-pedidos`
- `/mi-carrito`

perderían sentido o tendrían que reinventar manualmente la seguridad.

JWT hace posible que el backend tenga identidad actual request por request de forma bastante natural en APIs desacopladas.

## Qué relación tiene esto con roles

También muy fuerte.

Si el token o el contexto reconstruido permite conocer roles del usuario, entonces Spring Security puede aplicar reglas como:

- `hasRole("ADMIN")`
- `hasAnyRole("ADMIN", "MODERATOR")`

Eso significa que JWT no solo ayuda a identificar al usuario, sino también a restaurar parte del contexto de autorización que necesita el sistema.

## Un ejemplo mental con admin

Imaginá:

```text
DELETE /productos/10
Authorization: Bearer eyJhbGciOi...
```

Entonces el backend puede llegar a razonar algo como:

- el token es válido
- representa al usuario X
- el usuario X tiene rol ADMIN
- la ruta requiere ADMIN
- se permite acceso

Esa es una de las razones por las que JWT y autorización por rol se integran tan naturalmente.

## Qué pasa si el token es inválido

Si el token está mal formado, vencido, alterado o no puede validarse correctamente, la request no debería tratarse como autenticada válida.

Entonces el flujo de seguridad debería reaccionar como corresponda, normalmente bloqueando el acceso a rutas que exigen autenticación.

Eso muestra otra vez que el token no es simplemente “un string cualquiera”.
Tiene que pasar una validación real.

## Qué pasa si no viene token

Si una ruta protegida espera autenticación y no viene token, entonces la request debería comportarse como anónima o no autenticada, y ser rechazada según la política de seguridad del endpoint.

Otra vez, la idea importante es esta:

- JWT funciona cuando el cliente manda el token correcto
- si no lo manda o es inválido, no hay autenticación válida

## Qué relación tiene esto con el frontend

Muchísima.

Porque el frontend con JWT suele tener responsabilidades como:

- hacer login
- recibir el token
- guardarlo en el lugar elegido
- enviarlo en requests posteriores
- detectar vencimientos o rechazos de autenticación
- eventualmente renovar o volver a loguear según la estrategia

Eso hace que JWT no sea una decisión solo del backend.
Es una decisión de contrato entre frontend y backend.

## Qué relación tiene esto con apps móviles

También muy fuerte.

Las apps móviles suelen trabajar muy cómodamente con un modelo de token por request.

Por eso JWT se volvió tan popular también fuera del navegador clásico.

No porque sea mágico, sino porque encaja muy bien con clientes desacoplados que consumen APIs.

## Qué ventajas conceptuales tiene JWT

Entre las más importantes para APIs modernas:

- muy natural para frontend separado
- muy natural para móvil
- identidad transportada request por request
- buena compatibilidad con modelos orientados a API
- permite construir seguridad bastante desacoplada del modelo clásico de sesión web tradicional

Por eso aparece tanto en arquitecturas modernas.

## Qué complejidades trae

También es muy importante no idealizarlo.

JWT trae preguntas y desafíos como:

- dónde guardar el token del lado cliente
- cómo manejar expiración
- cómo hacer refresh si el diseño lo requiere
- cómo invalidar accesos cuando haga falta
- qué claims poner
- cuánto meter dentro del token
- cómo manejar logout en términos prácticos

O sea:
es muy útil, pero no es “más fácil en todo”.
Es una elección con tradeoffs.

## Qué no conviene hacer

No conviene empezar a copiar implementaciones de JWT sin entender primero el flujo conceptual.

Porque si no, terminás con:

- filtros copiados
- servicios de token copiados
- configuración rara
- errores difíciles de entender
- seguridad mal razonada

Primero conviene tener muy claro el mapa mental:

- login genera token
- cliente guarda token
- cliente envía token
- backend valida token
- backend reconstruye autenticación
- backend protege rutas y usa identidad actual

Ese mapa es oro.

## Una muy buena pregunta para saber si JWT tiene sentido en tu caso

Podés preguntarte:

- ¿mi backend expone una API consumida por frontend separado?
- ¿tengo clientes móviles o varios tipos de cliente?
- ¿quiero un modelo muy orientado a token request por request?
- ¿me resulta natural una arquitectura más stateless?
- ¿no estoy construyendo simplemente una web clásica integrada donde sesión ya resolvería bien el problema?

Responder eso ordena muchísimo la elección.

## Qué relación tiene esto con testing

Cuando aparece JWT, el testing de seguridad también gana otra dimensión.

Ahora las preguntas pueden ser:

- ¿el login devuelve token?
- ¿una request con token válido deja pasar?
- ¿una request sin token se rechaza?
- ¿una request con token inválido se bloquea?
- ¿el token de admin sí permite acceder a rutas admin?

Eso muestra otra vez que la seguridad cambia toda la estrategia de pruebas.

## Una comparación muy útil con sesión

### Sesión
- el servidor mantiene continuidad de autenticación
- muy natural para app web clásica

### JWT
- el cliente manda token en cada request
- muy natural para API desacoplada

Las dos pueden ser válidas.
La diferencia no es moral, es arquitectónica.

## Qué relación tiene esto con diseño del backend

Muy fuerte.

Porque cuando elegís JWT, el backend empieza a asumir cosas como:

- habrá endpoint de login que devuelve token
- habrá filtro que lee Authorization Bearer
- la identidad se reconstruye request por request
- la seguridad de rutas y del usuario actual dependerá de ese pipeline

Eso ya moldea claramente la arquitectura.

## Qué todavía no estás viendo del todo

En este tema estamos fijando el flujo conceptual y práctico general.

Todavía no estamos entrando a fondo en:

- la estructura interna exacta del token
- claims
- firma
- refresh token en detalle
- invalidación avanzada
- filtros específicos de implementación
- configuración concreta completa de Spring Security con JWT
- manejo fino de expiración

Todo eso puede venir después.

Pero si entendés bien el flujo general, después todo eso se vuelve muchísimo más comprensible.

## Relación con Spring Security

Spring Security es el gran marco que te permite que este modelo no quede en “un token suelto”, sino en una autenticación realmente integrada al contexto de la aplicación.

JWT por sí solo no es toda la seguridad.
Spring Security es lo que permite que ese token se convierta en:

- principal actual
- roles actuales
- autorización sobre endpoints
- acceso a `/me`
- reglas de ownership y recursos propios

Ahí está una de las claves más importantes del tema.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> en Spring Boot con JWT, el login exitoso emite un token que el cliente envía luego en el header `Authorization: Bearer ...`, y el backend lo valida para reconstruir la identidad autenticada en cada request protegida, integrando esa identidad con Spring Security y con los casos de uso reales del sistema.

## Resumen

- JWT permite que el backend reconozca al usuario entre requests mediante un token enviado por el cliente.
- El login exitoso normalmente devuelve ese token.
- Las requests protegidas suelen enviarlo en el header `Authorization: Bearer ...`.
- El backend valida el token y reconstruye la autenticación actual.
- Esto encaja muy bien con APIs desacopladas, SPAs y apps móviles.
- JWT es muy potente, pero también introduce decisiones importantes sobre expiración, almacenamiento y flujo de seguridad.
- Este tema te da el mapa conceptual y práctico necesario para entender cómo JWT encaja realmente dentro de Spring Security.

## Próximo tema

En el próximo tema vas a ver cómo modelar un usuario del sistema para seguridad, con campos como username, password y roles, porque una vez que entendés el flujo JWT, aparece naturalmente la necesidad de definir qué entidad representa a ese usuario autenticable dentro del backend.
