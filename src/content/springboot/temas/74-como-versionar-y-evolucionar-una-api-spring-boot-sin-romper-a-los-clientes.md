---
title: "Cómo versionar y evolucionar una API Spring Boot sin romper a los clientes"
description: "Entender por qué una API necesita evolucionar con cuidado cuando ya tiene consumidores reales, qué significa versionarla y cómo evitar cambios que rompan frontend, móviles u otras integraciones existentes."
order: 74
module: "Integración backend y frontend"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo integrar un backend Spring Boot con un frontend real consumiendo una API segura con:

- login
- JWT
- Bearer token
- `/me`
- rutas protegidas
- manejo de `401` y `403`
- refresh
- logout

Eso ya te mostró algo muy importante:

> apenas un backend empieza a ser consumido por un cliente real, deja de ser solo “código tuyo” y pasa a convertirse en un contrato que otros dependen de que siga funcionando.

Y ahí aparece una preocupación muy seria:

> ¿qué pasa cuando necesitás cambiar la API?

Porque en un proyecto real, la API no se queda congelada para siempre.
Con el tiempo querés:

- agregar campos
- cambiar nombres
- mejorar respuestas
- introducir validaciones nuevas
- separar endpoints
- reorganizar recursos
- deprecar cosas viejas
- soportar nuevas features del frontend
- corregir errores de diseño inicial

Pero si hacés esos cambios sin criterio, podés romper a los clientes que ya dependen del contrato actual.

Este tema es clave porque te ayuda a entender qué significa **versionar y evolucionar** una API sin convertir cada cambio en una fuente de roturas.

## El problema de cambiar una API como si nadie la consumiera

Mientras el backend todavía no tiene consumidores reales, puede parecer que cambiar un endpoint es trivial.

Por ejemplo, hoy tenés:

```json
{
  "id": 1,
  "username": "gabriel",
  "email": "gabriel@mail.com"
}
```

Y mañana decidís devolver:

```json
{
  "userId": 1,
  "name": "gabriel",
  "mail": "gabriel@mail.com"
}
```

Desde adentro del backend, eso puede parecer “solo un refactor”.

Pero si ya existe un frontend esperando:

- `id`
- `username`
- `email`

ese cambio puede romper la aplicación cliente inmediatamente.

Y esto no pasa solo con nombres de campos.
También pasa con:

- rutas
- métodos HTTP
- códigos de respuesta
- validaciones
- formato de errores
- paginación
- shape de objetos
- reglas de autenticación

Entonces la API deja de ser solo implementación.
Pasa a ser contrato.

## Qué significa que la API sea un contrato

Significa que hay otros consumidores que esperan ciertas cosas estables, como:

- una ruta específica
- un body específico
- una respuesta con cierta forma
- ciertos nombres de campos
- ciertos códigos HTTP
- cierta semántica de autenticación

Cuando esos consumidores existen, cambiar la API es parecido a cambiar una interfaz pública:
ya no depende solo de lo que te resulte más cómodo en backend.

Ese cambio mental es fundamental.

## Qué significa evolucionar una API

No significa dejarla congelada para siempre.
Tampoco significa romper todo cada dos semanas.

Significa algo más maduro:

> hacer que la API pueda mejorar, crecer y corregirse sin destruir innecesariamente a quienes ya la consumen.

Esa es la idea madre del tema.

## Qué significa versionar una API

Versionar una API significa introducir una noción explícita de versión o compatibilidad cuando el contrato cambia de forma relevante.

Por ejemplo, podrían aparecer cosas como:

- `/api/v1/...`
- `/api/v2/...`

o estrategias equivalentes.

La idea general es:

> cuando el contrato cambia de manera incompatible, en lugar de forzar a todos los clientes a romperse al mismo tiempo, mantenés una versión anterior y ofrecés una nueva.

Eso da muchísimo más control.

## Por qué esto importa tanto cuando ya hay frontend real

Porque el frontend puede estar desplegado en otro ritmo distinto al backend.

Por ejemplo:

- backend se deploya hoy
- frontend se deploya mañana
- app móvil tarda días o semanas en actualizarse
- una integración externa quizá no cambia rápido
- otro equipo depende de tu API y necesita tiempo para adaptarse

Si el backend rompe el contrato sin transición, el problema no queda “solo en backend”.
Se convierte en una rotura de sistema.

## Un ejemplo muy simple de cambio riesgoso

Supongamos que hoy existe:

```text
GET /usuarios/me
```

y devuelve:

```json
{
  "id": 1,
  "username": "gabriel",
  "email": "gabriel@mail.com"
}
```

Y mañana decidís cambiarlo a:

```json
{
  "id": 1,
  "nombreVisible": "Gabriel",
  "correo": "gabriel@mail.com"
}
```

Si no hubo versión, transición ni compatibilidad, el frontend que esperaba `username` y `email` puede romperse.

Esto muestra muy bien que “mejorar” el contrato desde backend puede ser una regresión para el cliente si no se gestiona bien.

## Qué cambios suelen ser más peligrosos

En general, suelen ser especialmente delicados cambios como:

- renombrar campos existentes
- eliminar campos existentes
- cambiar tipos de datos
- cambiar la semántica de un endpoint
- mover rutas consumidas
- exigir autenticación donde antes no existía sin coordinación
- cambiar formato de errores
- modificar paginación o sorting sin transición
- cambiar el cuerpo esperado del request de forma incompatible

Este tipo de cambios puede romper clientes aunque el backend “siga compilando perfecto”.

## Qué cambios suelen ser más seguros

En muchos casos, suelen ser menos peligrosos cambios como:

- agregar un nuevo endpoint
- agregar un nuevo campo opcional sin eliminar otros
- introducir una nueva ruta paralela
- sumar un nuevo filtro opcional
- crear una nueva versión manteniendo la vieja
- extender un contrato sin destruir lo existente

No significa que sean mágicamente inocuos siempre.
Pero en general tienen menos riesgo de romper consumidores ya adaptados al contrato anterior.

## Una intuición muy útil

Podés pensar así:

### Cambio compatible
El cliente viejo sigue funcionando aunque no use la novedad.

### Cambio incompatible
El cliente viejo deja de funcionar o interpreta mal la API.

Esta diferencia vale oro.

## Un ejemplo de cambio compatible

Hoy la respuesta es:

```json
{
  "id": 1,
  "username": "gabriel"
}
```

Mañana agregás:

```json
{
  "id": 1,
  "username": "gabriel",
  "avatarUrl": "/avatars/1.png"
}
```

Si los clientes viejos no dependen de que la respuesta tenga exactamente solo dos campos, probablemente este cambio sea compatible.

## Un ejemplo de cambio incompatible

Hoy la respuesta tiene:

```json
{
  "username": "gabriel"
}
```

Mañana reemplazás eso por:

```json
{
  "name": "gabriel"
}
```

Ahí muchos clientes viejos pueden romperse porque el campo esperado dejó de existir.

Ese tipo de cambio suele ser claramente incompatible.

## Una estrategia muy sana: evolucionar sin romper de inmediato

En vez de cambiar brutalmente algo muy usado, muchas veces conviene estrategias como:

- agregar el nuevo campo
- mantener el viejo por un tiempo
- documentar deprecación
- avisar a consumidores
- migrar frontend
- recién después retirar lo viejo si realmente corresponde

Esto hace que la API evolucione sin producir trauma innecesario.

## Qué significa deprecación

Deprecar algo significa marcarlo como algo que todavía existe, pero que ya no se recomienda usar porque en el futuro podría retirarse.

Por ejemplo:

- un endpoint viejo sigue funcionando
- pero documentás que hay uno nuevo mejor
- o un campo viejo sigue saliendo
- pero avisás que será reemplazado

La deprecación es una herramienta muy valiosa para transiciones sanas.

## Por qué esto es mejor que romper de golpe

Porque le da tiempo a los consumidores para adaptarse.

Eso es especialmente importante cuando:

- hay varios frontends
- hay apps móviles
- hay integraciones externas
- hay distintos equipos
- el deploy de los clientes no ocurre al mismo tiempo que el deploy del backend

La transición gradual suele ser muchísimo más profesional que la ruptura sorpresiva.

## Cómo suele verse la versioning más explícita

Una de las formas más conocidas es versionar por URL.

Por ejemplo:

```text
/api/v1/productos
/api/v2/productos
```

La idea sería:

- `v1` mantiene el contrato viejo
- `v2` introduce un contrato nuevo incompatible o claramente mejorado

No es la única estrategia del universo, pero es una de las más fáciles de entender y comunicar.

## Qué gana una versión explícita

Muchísimo.

Porque deja claro que:

- existe una API anterior
- existe una nueva
- no son exactamente iguales
- el cliente puede migrar con mayor control
- el backend puede convivir un tiempo con ambas si hace falta

Eso ordena bastante la evolución.

## Qué costo trae versionar

También trae costo.

Porque mantener varias versiones puede implicar:

- más endpoints
- más testing
- más documentación
- más mantenimiento
- más lógica duplicada o adaptaciones internas

Entonces versionar no es algo para hacer por deporte.
Es una herramienta útil cuando el cambio realmente lo justifica.

## Cuándo suele tener sentido versionar

Por ejemplo, cuando:

- el cambio rompe contratos existentes
- varios consumidores ya dependen de la API
- el rediseño es grande
- necesitás convivir con clientes viejos por un tiempo
- no podés coordinar un cambio atómico con todos los consumidores

Ahí versionar suele empezar a tener mucho sentido.

## Cuándo quizás no hace falta una nueva versión

Si el cambio es claramente compatible, muchas veces no necesitás una nueva versión.

Por ejemplo:

- agregar un campo opcional
- sumar un endpoint nuevo
- agregar una nueva ruta adicional sin tocar la vieja
- extender comportamiento sin romper lo anterior

No conviene versionar compulsivamente cada mínimo ajuste.
La versión debería responder a una necesidad real de compatibilidad.

## Qué relación tiene esto con DTOs

Muy fuerte.

Porque una de las zonas donde más se siente la evolución de la API es en los DTOs públicos.

Por ejemplo:

- `UsuarioResponseV1`
- `UsuarioResponseV2`

o diseños equivalentes cuando la diferencia de contrato lo justifica.

No significa que siempre tengas que nombrarlo así de manera literal.
Pero sí conviene entender que el contrato público puede necesitar coexistencia de formas distintas.

## Un ejemplo simple de evolución razonable

Supongamos que en `v1` devolvías:

```json
{
  "id": 1,
  "username": "gabriel"
}
```

Y ahora querés una estructura más rica en `v2`:

```json
{
  "id": 1,
  "username": "gabriel",
  "profile": {
    "displayName": "Gabriel",
    "avatarUrl": "/avatars/1.png"
  }
}
```

Si ese cambio realmente rompe expectativas del cliente viejo o cambia mucho el contrato, una `v2` puede ser una decisión razonable.

## Qué pasa con autenticación al versionar

Muy buena pregunta.

La seguridad también forma parte del contrato.
Entonces cambios como estos también deben tratarse con cuidado:

- una ruta que antes era pública ahora pasa a privada
- cambia el formato de login
- cambia el response de login
- cambia la estructura del token o del refresh
- cambia el comportamiento de logout
- cambia el formato de `/me`

Todo eso puede requerir transición, documentación clara e incluso versionado si rompe el flujo del cliente.

## Qué pasa con los errores

También es importante.

Si un frontend depende de un formato de error como:

```json
{
  "status": 404,
  "error": "not_found",
  "message": "No existe el usuario"
}
```

y de pronto cambiás eso por otra estructura completamente distinta, el cliente puede romperse aunque la lógica de negocio siga bien.

Por eso el contrato de errores también merece estabilidad razonable.

## Una zona muy delicada: paginación, filtros y sorting

Muchos cambios en listados también rompen clientes.

Por ejemplo:

- cambiar nombres de parámetros
- cambiar formato de paginación
- cambiar shape del objeto paginado
- cambiar defaults de orden sin avisar
- renombrar filtros usados por frontend

Esto también forma parte del contrato y conviene tratarlo con cuidado.

## Una buena estrategia antes de cambiar una API

Podés hacerte preguntas como:

- ¿este cambio rompe a clientes actuales?
- ¿podría resolverlo agregando en vez de reemplazar?
- ¿necesito transición?
- ¿debería deprecar antes?
- ¿necesito una versión nueva?
- ¿cuánto tiempo convivirán ambas?
- ¿qué necesita actualizar frontend?

Estas preguntas suelen evitar muchos errores impulsivos.

## Qué relación tiene esto con documentación

Total.

Apenas la API empieza a evolucionar, la documentación se vuelve todavía más importante.

Porque ahora ya no alcanza con explicar “qué existe”.
También hay que explicar:

- qué está vigente
- qué está deprecado
- qué cambió
- qué versión usar
- qué timeline de migración existe, si aplica

Una API que cambia sin documentación clara suele ser una fuente constante de confusión.

## Qué relación tiene esto con testing

También muy fuerte.

Cuando la API evoluciona, conviene tener bastante claro que necesitás verificar:

- que la versión vieja siga funcionando si prometiste mantenerla
- que la nueva versión cumpla lo esperado
- que los cambios compatibles realmente no rompan clientes existentes
- que los contratos de auth, errores y DTOs se mantengan coherentes

Esto hace que testing y versionado vayan bastante de la mano.

## Qué relación tiene esto con frontend real

Absolutamente directa.

Porque frontend es uno de los primeros consumidores que sufre si el backend rompe contrato sin transición.

Por ejemplo:

- cambia un nombre de campo y la pantalla se rompe
- cambia un endpoint y falla el fetch
- cambia el login y ya no se guarda bien el token
- cambia `/me` y la app deja de reconocer al usuario actual
- cambia una respuesta paginada y deja de renderizar listados

Es decir, versionar y evolucionar bien una API no es una preocupación abstracta.
Es una necesidad muy práctica.

## Qué no conviene hacer

No conviene pensar:

> “como el backend cambió, el frontend ya se adaptará”

Ese enfoque suele generar muchísima fricción.

Tampoco conviene romper contratos en silencio.
Y mucho menos cambiar seguridad, auth o DTOs públicos sin revisar impacto en consumidores reales.

## Otro error común

Versionar demasiado tarde, cuando ya rompiste clientes.

Muchas veces la necesidad de versionado se hace evidente justo después de un cambio incompatible mal gestionado.

Conviene detectar esa necesidad antes, no después del daño.

## Otro error común

Versionar absolutamente todo desde el día cero con una complejidad enorme sin que todavía exista una necesidad real.

Eso también puede sobrecomplicar el proyecto.

La idea no es burocratizar la API, sino darle herramientas sanas de evolución cuando realmente hacen falta.

## Otro error común

Confundir refactor interno con cambio de contrato externo.

Podés refactorizar muchísimo internamente sin romper a nadie si mantenés el contrato.
Y al revés: un cambio “pequeño” de nombre en un campo puede romper muchísimo aunque internamente te parezca trivial.

Esta diferencia es clave.

## Una buena heurística

Podés preguntarte:

- ¿este cambio lo notaría un consumidor externo?
- si lo nota, ¿le rompe algo?
- si rompe, ¿cómo lo voy a transicionar?
- ¿puedo convivir un tiempo con ambas formas?
- ¿debería marcar la vieja como deprecada?
- ¿necesito una versión nueva?

Responder eso te ordena muchísimo el criterio.

## Qué relación tiene esto con una app completa

Muy fuerte.

Porque apenas el backend empieza a tener frontend real, móviles, QA o integraciones, deja de ser razonable cambiar el contrato sin pensar impacto.

Ahí la API empieza a comportarse como una interfaz pública de verdad.
Y eso exige más madurez en cómo la evolucionás.

## Relación con Spring Boot

Spring Boot te facilita muchísimo construir y cambiar endpoints, pero esa facilidad técnica no debería confundirse con libertad para romper contratos sin estrategia.

Cuanto más fácil es cambiar el backend, más importante se vuelve acordarte de que puede haber clientes dependiendo de lo que ya publicaste.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> una vez que una API Spring Boot tiene consumidores reales, cambiarla ya no es solo refactorizar código interno: implica cuidar un contrato público, evolucionarlo con compatibilidad razonable, usar deprecación o versionado cuando haga falta y evitar romper frontend u otros clientes por cambios impulsivos.

## Resumen

- Una API consumida por clientes reales se convierte en un contrato público.
- No todos los cambios son iguales: algunos son compatibles y otros rompen consumidores.
- Deprecar y transicionar suele ser mejor que romper de golpe.
- Versionar una API tiene mucho sentido cuando el cambio es incompatible y hay consumidores existentes.
- Seguridad, errores, DTOs, paginación y rutas también forman parte del contrato.
- Documentación y testing se vuelven todavía más importantes cuando la API evoluciona.
- Este tema te ayuda a pensar la API como algo vivo que debe mejorar sin destruir innecesariamente a quienes ya dependen de ella.

## Próximo tema

En el próximo tema vas a ver cómo empezar a diseñar integraciones con servicios externos desde Spring Boot, porque una vez que el backend ya se conecta bien con frontend y clientes propios, aparece naturalmente la necesidad de hablar también con APIs de terceros.
