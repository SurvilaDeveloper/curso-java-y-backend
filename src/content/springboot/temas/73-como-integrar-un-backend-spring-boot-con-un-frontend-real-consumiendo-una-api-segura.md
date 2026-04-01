---
title: "Cómo integrar un backend Spring Boot con un frontend real consumiendo una API segura"
description: "Entender cómo empieza a integrarse un frontend real con un backend Spring Boot protegido con JWT, qué flujo sigue el cliente para login y consumo de rutas seguras, y por qué esta integración cambia bastante la forma de pensar errores, estado y experiencia de usuario."
order: 73
module: "Integración backend y frontend"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo documentar y probar una API segura con:

- register
- login
- Bearer token
- refresh
- rutas protegidas
- errores típicos como `401` y `403`

Eso ya te dejó una base muy importante del lado del backend y del contrato de la API.

Pero ahora aparece una pregunta muy natural:

> ¿qué pasa cuando un frontend real empieza a consumir todo esto?

Porque una cosa es tener un backend que:

- registra usuarios
- hace login
- devuelve JWT
- protege endpoints
- reconoce al usuario actual
- expone `/me`
- maneja refresh

Y otra cosa muy distinta es integrar eso con un cliente real que necesita:

- mandar requests correctamente
- guardar el token
- saber cuándo mostrar login
- saber cuándo el usuario está autenticado
- llamar a rutas protegidas
- manejar errores de auth
- renovar sesión si hace falta
- cerrar sesión de forma coherente

Este tema es clave porque acá el backend deja de verse como una pieza aislada y pasa a formar parte de un flujo completo de aplicación.

## Qué cambia cuando aparece un frontend real

Mientras trabajás solo del lado backend, muchas cosas pueden sentirse bastante lineales:

- existe `POST /auth/login`
- devuelve token
- existe `GET /usuarios/me`
- requiere Bearer token
- existe refresh
- existen rutas admin

Pero cuando un frontend real entra en juego, aparecen nuevas preguntas muy concretas:

- ¿dónde guarda el token?
- ¿cómo sabe si el usuario sigue autenticado?
- ¿qué hace si `/me` devuelve `401`?
- ¿qué hace si una ruta devuelve `403`?
- ¿cuándo intenta refresh?
- ¿cómo redirige al login?
- ¿cómo inicializa el estado del usuario al abrir la app?

Eso significa que integrar backend y frontend no es solo “hacer fetch”.
Es diseñar un flujo completo de autenticación y consumo.

## Qué problema resuelve la integración frontend-backend

Resuelve algo muy concreto:

> transformar endpoints sueltos en una experiencia real de aplicación.

Por ejemplo, el usuario final no piensa:

- “voy a pegarle a `/auth/login`”
- “voy a guardar un access token”
- “voy a reenviar el header Authorization”

El usuario piensa:

- “quiero entrar”
- “quiero ver mi cuenta”
- “quiero comprar”
- “quiero ver mis pedidos”
- “quiero seguir logueado”
- “quiero cerrar sesión”

La integración entre frontend y backend es lo que traduce esa experiencia a requests y respuestas reales.

## Qué piezas del backend suelen consumir primero los frontends

Muy frecuentemente, un frontend real arranca usando cosas como:

- `POST /auth/register`
- `POST /auth/login`
- `GET /usuarios/me`
- endpoints protegidos del dominio, como:
  - `/pedidos/mis-pedidos`
  - `/carrito`
  - `/productos`
  - `/admin/...` si existe panel administrativo

Y alrededor de eso construye:

- formularios
- estado de autenticación
- guards o protección de rutas del lado cliente
- navegación
- recuperación de sesión

Esto ya muestra por qué el bloque de seguridad del backend era tan importante.

## El flujo más típico de login desde frontend

Un flujo muy común suele verse así:

1. el usuario completa formulario de login
2. el frontend manda `POST /auth/login`
3. el backend devuelve:
   - `accessToken`
   - tal vez `refreshToken`
4. el frontend guarda esas credenciales según su estrategia
5. el frontend actualiza su estado a “autenticado”
6. el frontend puede pedir `/usuarios/me`
7. desde ese momento empieza a llamar rutas protegidas con `Authorization: Bearer ...`

Este flujo es uno de los más centrales de toda la integración.

## Qué suele mandar el frontend al login

Por ejemplo:

```json
{
  "username": "gabriel",
  "password": "ClaveSegura123"
}
```

o, si tu diseño usa email:

```json
{
  "email": "gabriel@mail.com",
  "password": "ClaveSegura123"
}
```

Lo importante es que frontend y backend tengan totalmente claro cuál es el contrato real de login.

## Qué suele recibir el frontend del login

Por ejemplo:

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "type": "Bearer"
}
```

O una versión más simple si todavía no usás refresh.

El frontend necesita entender muy bien esa respuesta porque de ahí sale todo el estado posterior de autenticación.

## Qué hace el frontend con el token

Conceptualmente, después del login el frontend necesita:

- guardar el token
- usarlo en requests futuras
- saber cuándo dejar de usarlo
- eventualmente renovarlo
- borrarlo al logout

No hace falta en este tema casarte ya con una estrategia única de almacenamiento.
Lo importante ahora es entender el rol del frontend:

> el cliente no solo muestra pantallas; también participa activamente del ciclo de autenticación.

## Un ejemplo mental de request protegida desde frontend

Supongamos que el usuario ya hizo login y ahora el frontend quiere pedir `/usuarios/me`.

El request conceptual sería algo así:

```text
GET /usuarios/me
Authorization: Bearer eyJhbGciOi...
```

El backend:

- recibe el token
- el filtro JWT lo valida
- carga autenticación
- deja pasar
- devuelve el usuario actual

Y el frontend usa esa respuesta para poblar estado como:

- usuario logueado
- nombre visible
- email
- roles
- permisos base de la UI

Este flujo es central en apps reales.

## Por qué /me suele ser tan importante para frontend

Porque le permite al frontend reconstruir rápidamente el usuario actual sin tener que confiar solo en que “hay un token guardado”.

Por ejemplo, al recargar la aplicación, el frontend puede hacer:

1. leer si hay token
2. llamar a `/usuarios/me`
3. si responde bien, considera sesión válida
4. si falla con `401`, considera sesión inválida o vencida

Eso hace que `/me` sea una de las rutas más valiosas de toda la API para el lado cliente.

## Qué problema resuelve `/me` al iniciar la app

Muchísimo.

Porque el frontend muchas veces necesita resolver algo como:

- ¿hay usuario autenticado o no?
- ¿quién es?
- ¿qué roles tiene?
- ¿debo mostrar panel admin?
- ¿debo mostrar menú de cuenta o botón de login?

`/me` permite responder todo eso de forma mucho más confiable que simplemente mirar si existe un token guardado.

## Un flujo muy común de arranque del frontend

Podés pensarlo así:

1. abre la app
2. el frontend detecta si tiene token
3. si no tiene token → usuario anónimo
4. si tiene token → intenta `GET /usuarios/me`
5. si responde `200` → usuario autenticado y perfil cargado
6. si responde `401` → token inválido o vencido; limpiar sesión o intentar refresh

Este patrón aparece muchísimo en aplicaciones reales.

## Qué cambia en el frontend cuando hay rutas protegidas

El frontend ya no puede asumir que cualquier request va a funcionar igual.

Ahora tiene que entender cosas como:

- esta pantalla requiere usuario autenticado
- esta acción requiere rol admin
- esta ruta del backend puede responder `401`
- esta otra puede responder `403`
- tengo que redirigir o mostrar mensaje según el caso

Eso vuelve mucho más rica la lógica del cliente.

## Qué significa manejar bien un 401 desde frontend

Normalmente significa algo como:

- no hay autenticación válida
- el token falta, venció o es inválido
- el usuario ya no puede seguir operando como autenticado

Entonces el frontend suele tener que decidir algo como:

- limpiar estado local
- intentar refresh si el sistema lo soporta
- redirigir a login
- mostrar aviso de sesión vencida

El punto importante es que `401` no es solo “un error más”.
Es parte del flujo normal de autenticación.

## Qué significa manejar bien un 403 desde frontend

En cambio, `403` suele significar:

- el usuario sí está autenticado
- pero no tiene permiso suficiente

Eso lleva a otro tipo de respuestas del cliente, por ejemplo:

- mostrar “no tenés permisos”
- esconder ciertas acciones
- redirigir a una pantalla segura
- evitar loops absurdos hacia login si el usuario ya está autenticado

La diferencia entre `401` y `403` se vuelve muy práctica acá.

## Qué relación tiene esto con roles en la UI

Muy fuerte.

Por ejemplo, si `/usuarios/me` devuelve algo como:

```json
{
  "id": 1,
  "username": "gabriel",
  "email": "gabriel@mail.com",
  "roles": ["ADMIN"]
}
```

el frontend puede usar esa información para decidir cosas como:

- mostrar menú admin
- habilitar botones de edición especial
- mostrar panel de reportes
- ocultar acciones que no corresponden al usuario común

Eso no reemplaza la seguridad del backend, claro.
Pero sí mejora mucho la experiencia de usuario.

## Qué no conviene hacer del lado frontend

No conviene pensar:

> “si oculto el botón, ya resolví permisos”

No.
La autorización real sigue perteneciendo al backend.

Pero el frontend sí puede usar el estado del usuario para construir una UI más coherente con esos permisos.

Esa distinción es importantísima.

## Qué relación tiene esto con register

También es muy directa.

Un frontend real suele necesitar un flujo parecido a:

1. mostrar formulario de registro
2. mandar `POST /auth/register`
3. interpretar errores como:
   - username duplicado
   - email duplicado
   - body inválido
4. decidir qué hacer después:
   - pedir login manual
   - loguear automáticamente según el diseño
   - mostrar pantalla de éxito
   - pedir verificación de email si existe ese flujo

Eso muestra que integrar seguridad no es solo login; también afecta el onboarding completo del usuario.

## Qué pasa con refresh token del lado cliente

Si el sistema usa refresh token, el frontend necesita una estrategia para:

- detectar cuándo un access token ya no sirve
- llamar a `/auth/refresh`
- actualizar el access token almacenado
- reintentar requests si corresponde
- cerrar sesión si el refresh también falla

No hace falta que resuelvas en este tema todos los detalles finos de implementación.
Lo importante es entender que esto ya forma parte de la integración real cliente-backend.

## Un flujo típico con refresh

Podés imaginar algo así:

1. request protegida devuelve `401`
2. el frontend detecta que puede ser token vencido
3. llama a `/auth/refresh`
4. si refresh responde bien, actualiza access token
5. reintenta la request original
6. si refresh falla, borra sesión y manda al login

Este patrón aparece muchísimo y es muy útil entenderlo conceptualmente.

## Qué relación tiene esto con interceptores o helpers del frontend

Muy fuerte.

Porque repetir manualmente en cada request cosas como:

- leer token
- poner Authorization
- manejar 401
- intentar refresh
- limpiar sesión

se vuelve rápido muy incómodo.

Por eso en clientes reales suelen aparecer piezas como:

- wrappers de fetch
- interceptores HTTP
- clientes API centralizados
- helpers de auth

No hace falta que ahora te cases con una librería o framework concreto.
Lo importante es la idea:

> la integración suele centralizarse para no repetir lógica de autenticación por todos lados.

## Qué cambia en la UX cuando el backend es seguro

Muchísimo.

Aparecen estados de UI como:

- usuario anónimo
- usuario autenticado
- usuario admin
- sesión cargando
- sesión vencida
- acceso denegado
- perfil recuperado
- logout en proceso

Eso muestra que backend y frontend están completamente conectados alrededor de la seguridad.

## Qué pasa con pantallas protegidas del lado frontend

En muchas apps aparece algo como:

- página de perfil → solo si hay usuario
- historial de pedidos → solo si hay usuario
- panel admin → solo si hay rol admin

Esto no reemplaza la protección del backend, pero sí mejora mucho la navegación y evita mostrar experiencias absurdas.

Otra vez:
UI y backend se complementan, no se reemplazan.

## Qué debería estar claro entre frontend y backend

Como mínimo:

- qué endpoint hace login
- qué devuelve login
- cómo se manda el token
- qué endpoint da el usuario actual
- qué errores de auth pueden aparecer
- si existe refresh
- cómo funciona logout
- qué rutas son públicas y privadas
- qué roles importan para la UI

Cuanto más claro esté eso, más fluida suele ser la integración.

## Qué relación tiene esto con documentación

Total.

El tema 72 ya te mostró por qué documentar auth era tan importante.
Acá se ve todavía más claro:
un frontend real depende muchísimo de que ese contrato esté bien explicado.

Sin esa claridad, integrar la app se vuelve bastante más caótico.

## Qué relación tiene esto con pruebas reales

También muy fuerte.

Una integración razonable entre backend y frontend debería poder verificarse con escenarios como:

- register exitoso
- login exitoso
- `/me` con token válido
- `/me` con token inválido
- request admin con user común → `403`
- refresh exitoso
- refresh fallido
- logout y limpieza de estado

Eso hace que seguridad deje de ser “algo que pasa solo en backend” y pase a ser una parte verificable de la experiencia completa.

## Qué no conviene hacer

No conviene diseñar el backend como si el frontend fuera a “adivinar” cómo manejar JWT, 401, 403 o refresh.

Tampoco conviene diseñar el frontend como si pudiera inventar seguridad por su cuenta.

La integración real necesita un contrato claro y flujos pensados en conjunto.

## Otro error común

Guardar token y asumir que con eso ya está todo resuelto.

En realidad, todavía falta:

- reconstruir usuario actual
- manejar expiración
- manejar refresh
- limpiar sesión
- responder a errores

El token es solo una pieza del sistema, no el sistema completo.

## Otro error común

No tener un endpoint tipo `/me` y obligar al frontend a deducir todo desde un token o a usar ids de forma incómoda.

Eso suele hacer la integración más frágil y menos expresiva.

## Otro error común

Mezclar mal 401 y 403 del lado cliente, por ejemplo mandando al login a un usuario autenticado que simplemente no tiene permisos.

Ese tipo de error genera mucha confusión en la UX.

## Una buena heurística

Podés preguntarte:

- ¿qué necesita saber el frontend para consumir esta API segura sin adivinar?
- ¿el flujo login → guardar token → `/me` → rutas protegidas está claro?
- ¿está claro qué hacer con 401 y qué hacer con 403?
- ¿el sistema soporta refresh? ¿cómo lo usa el cliente?
- ¿hay endpoints centrados en el usuario actual que faciliten la integración?

Responder eso te ayuda muchísimo a pasar de “backend seguro” a “aplicación completa que funciona bien”.

## Qué relación tiene esto con una app real

Absolutamente directa.

Porque en una app real el usuario no vive el backend y el frontend como dos mundos separados.
Vive una sola experiencia.

Y esa experiencia depende de que:

- el backend exponga bien seguridad y contratos
- el frontend los consuma correctamente
- ambos lados manejen autenticación y permisos con coherencia

Por eso este tema no es secundario.
Es el paso natural después de tener una API segura ya armada.

## Relación con Spring Boot

Spring Boot te deja muy bien parado para esta integración porque podés construir una API clara, segura y predecible.
Pero el verdadero salto aparece cuando esa API empieza a ser consumida por un cliente real y comprobás que:

- login funciona
- `/me` funciona
- Bearer token funciona
- rutas protegidas responden como esperabas
- frontend y backend hablan el mismo idioma

Ahí es donde el backend deja de ser solo backend y pasa a formar parte de una aplicación completa.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> integrar un backend Spring Boot seguro con un frontend real implica mucho más que guardar un token: significa diseñar y consumir de forma coherente el flujo completo de login, carga del usuario actual, uso de Bearer token, manejo de 401/403, refresh y logout para construir una experiencia de aplicación realmente usable.

## Resumen

- Una API segura empieza a tomar sentido completo cuando un frontend real la consume.
- Login, Bearer token, `/me`, refresh y logout forman parte del flujo normal del cliente.
- El frontend necesita manejar claramente estados de autenticación y errores como 401 y 403.
- Patrones como `/me` y `/mis-recursos` facilitan muchísimo la integración.
- La UI puede usar roles para experiencia de usuario, pero la seguridad real sigue siendo del backend.
- Backend y frontend necesitan un contrato claro para que la autenticación funcione bien de punta a punta.
- Este tema abre el bloque donde el backend deja de verse aislado y empieza a integrarse con una aplicación completa.

## Próximo tema

En el próximo tema vas a ver cómo versionar y evolucionar una API Spring Boot sin romper a los clientes, que es otra preocupación muy real apenas el backend empieza a ser consumido de verdad por frontend u otros sistemas.
