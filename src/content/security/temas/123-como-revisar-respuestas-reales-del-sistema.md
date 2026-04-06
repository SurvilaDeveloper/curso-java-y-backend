---
title: "Cómo revisar respuestas reales del sistema"
description: "Cómo revisar las respuestas HTTP reales de una aplicación Java con Spring Boot desde seguridad. Por qué no alcanza con leer código o configuración, qué conviene inspeccionar en navegador, proxy y respuestas finales, y cómo detectar diferencias entre lo que la app cree enviar y lo que el cliente recibe de verdad."
order: 123
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# Cómo revisar respuestas reales del sistema

## Objetivo del tema

Entender **cómo revisar las respuestas HTTP reales del sistema** en una aplicación Java + Spring Boot desde una mirada de seguridad.

La idea de este tema es cerrar el bloque anterior con una práctica muy concreta y muy importante.

Después de hablar de:

- headers de seguridad
- CORS
- preflights
- HSTS
- CSP
- reverse proxy
- caches
- infraestructura intermedia

queda una lección fundamental:

> la seguridad HTTP no se valida solo leyendo el código o la configuración.  
> Se valida mirando qué recibe realmente el cliente.

Porque una cosa es lo que:

- tu controlador cree devolver
- Spring Security cree agregar
- el proxy cree reescribir
- el CDN cree cachear
- y el equipo cree haber configurado

Y otra cosa, bastante más importante, es:

- **qué sale finalmente por la red y llega de verdad al navegador o cliente real**

En resumen:

> revisar respuestas reales es el paso que convierte suposiciones en evidencia.  
> Sin eso, es muy fácil creer que una política existe cuando en realidad llega incompleta, contradictoria o directamente distinta.

---

## Idea clave

Una aplicación web moderna rara vez responde de forma “directa y pura” desde el código hasta el cliente.

En el medio pueden intervenir:

- filtros
- Spring Security
- serialización
- reverse proxy
- load balancer
- ingress
- gateway
- CDN
- cache
- WAF
- páginas de error
- redirecciones automáticas
- compresión
- reescrituras

La idea central es esta:

> la respuesta efectiva del sistema es la que ve el cliente al final del recorrido,  
> no la que vos imaginás leyendo una clase o una configuración aislada.

Por eso, una revisión seria de seguridad HTTP necesita mirar el sistema **en ejecución real**.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- asumir que un header está presente porque “lo configuramos”
- revisar solo el código Spring y no la respuesta final
- mirar una 200 y olvidarse de cómo responde una 302, una 401, una 403 o una 500
- no inspeccionar preflights, redirects o errores generados por otra capa
- creer que CORS está bien porque “en local andaba”
- ignorar diferencias entre entornos
- confiar en defaults del proxy o del framework sin verificarlos
- no revisar qué headers cambian según path, método, origin o tipo de respuesta
- pensar que basta con una captura de configuración y no hace falta evidencia de runtime

Es decir:

> el problema no es solo configurar seguridad HTTP.  
> El problema es no verificar si esa seguridad realmente llega al cliente como creías.

---

## Error mental clásico

Un error muy común es este:

### “Ya vi la configuración, así que ya sé cómo responde el sistema”

Eso es una falsa tranquilidad.

Porque entre la configuración y la respuesta final pueden pasar cosas como:

- headers duplicados
- headers ausentes
- headers pisados por otra capa
- CORS distinta según entorno
- HSTS que solo sale en ciertas rutas
- CSP que desaparece en errores
- redirects con host o scheme incorrecto
- respuestas cacheadas con política vieja
- páginas servidas por el proxy y no por Spring

### Idea importante

Leer configuración te da hipótesis.
Mirar la respuesta real te da evidencia.

---

## Qué significa “respuesta real”

Cuando hablamos de respuesta real, hablamos de cosas como:

- status code final
- headers finales
- cuerpo real de la respuesta
- redirects efectivos
- política CORS vista por el navegador
- headers de seguridad realmente presentes
- variaciones según origin, método o ruta
- diferencias entre 200, 302, 401, 403, 404, 500 y errores de infraestructura

### Idea útil

No alcanza con revisar la respuesta feliz del caso ideal.
La seguridad también se juega en:

- errores
- fallos intermedios
- redirecciones
- respuestas parciales
- recursos estáticos
- páginas de login
- descargas
- preflights

---

## Código, configuración y respuesta final: tres niveles distintos

Conviene pensar estos tres planos por separado.

## 1. Lo que el código intenta hacer
Por ejemplo:
- agregar un header
- responder con cierto status
- habilitar CORS para ciertos origins

## 2. Lo que la configuración cree hacer
Por ejemplo:
- Spring Security habilita headers
- nginx agrega HSTS
- el ingress reescribe rutas
- el CDN cachea ciertas respuestas

## 3. Lo que realmente llega al cliente
Por ejemplo:
- headers finales visibles
- redirects observados
- CORS efectiva
- respuestas de error
- diferencias según entorno

### Idea importante

La seguridad real vive en el tercer plano.
Los otros dos son importantes, pero no la sustituyen.

---

## Por qué esto importa tanto en seguridad

Porque muchas decisiones de seguridad HTTP son frágiles a pequeñas diferencias de implementación.

Por ejemplo:

- un header ausente en una sola familia de respuestas ya puede abrir superficie
- un redirect mal armado puede romper HTTPS estricto
- una CORS correcta en 200 pero incorrecta en preflight ya rompe el contrato real
- una página de error sin la misma política puede revelar o comportarse distinto
- una respuesta cacheada sin `Vary` correcto puede mezclar contexts

### Idea importante

En seguridad web, los “pequeños desalineamientos” entre teoría y respuesta real suelen importar mucho más de lo que parecen.

---

## Qué mirar primero: respuesta feliz y respuesta no feliz

Una revisión sana no debería mirar solo el caso donde todo sale bien.

Conviene inspeccionar al menos dos grupos:

### Respuestas felices
- 200
- 201
- 204
- descargas exitosas
- recursos estáticos válidos
- HTML normal

### Respuestas no felices
- 301 / 302 / 307 / 308
- 401
- 403
- 404
- 405
- 429
- 500
- errores del proxy
- páginas de mantenimiento
- fallos de timeout

### Regla sana

Si una política de seguridad solo está bien en la respuesta feliz, todavía no está bien del todo.

---

## Los redirects también son respuesta y también importan

Esto se subestima muchísimo.

Un redirect puede enseñar o romper cosas como:

- host incorrecto
- scheme incorrecto
- pérdida de HTTPS
- mezcla de dominios
- rutas internas expuestas
- comportamiento inconsistente entre app y proxy

### Idea útil

Cuando revises seguridad HTTP, mirá también:
- a dónde redirige
- con qué status
- con qué headers
- y desde qué capa se está generando

---

## Los errores del proxy también forman parte del sistema

Otro punto clave.

Si el cliente puede recibir errores generados por:

- nginx
- ingress
- gateway
- CDN
- WAF
- load balancer

entonces esas respuestas también forman parte de la superficie del sistema.

### Conviene revisar

- qué body devuelven
- qué headers traen o no traen
- si filtran algo de infraestructura
- si respetan políticas razonables
- si se comportan muy distinto que las respuestas de la app

### Idea importante

La seguridad visible del sistema incluye también lo que responde cuando Spring ni siquiera llegó a procesar la request.

---

## Qué mirar en headers

Una revisión práctica de respuestas reales debería revisar al menos:

- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Content-Security-Policy`
- `Referrer-Policy`
- `Permissions-Policy`
- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Credentials`
- `Vary`
- `Content-Type`
- `Content-Disposition`
- `Cache-Control`
- y otros headers relevantes según el caso

### Pero no alcanza con “están o no están”

También importa:
- en qué respuestas aparecen
- si son consistentes
- si cambian entre entornos
- si otra capa los pisa
- si ciertos errores o recursos no los heredan

---

## Qué mirar en CORS

Cuando inspecciones respuestas reales para CORS, conviene revisar:

- qué `Origin` mandó el cliente
- qué `Access-Control-Allow-Origin` volvió
- si hubo preflight
- qué respondió el `OPTIONS`
- qué headers CORS finales llegaron al navegador
- si hay `Vary: Origin`
- si cambian según credentials, método o entorno
- si el comportamiento es consistente entre éxito y error

### Idea útil

CORS rara vez se entiende bien leyendo solo config.
Se entiende mucho mejor mirando:
- request real
- preflight real
- response real
- error real del navegador

---

## Qué mirar en contenido y descargas

En respuestas de archivos o contenido servido al navegador, conviene revisar:

- `Content-Type`
- `Content-Disposition`
- cache headers
- headers de seguridad presentes o ausentes
- si el navegador recibe lo que la app cree servir
- si hay diferencias entre archivos públicos y privados
- si ciertos recursos estáticos salen por otra capa con otra política

### Idea importante

Las respuestas de archivos también merecen revisión real.
No son solo bytes.

---

## Qué mirar en status codes y cuerpos

A veces la seguridad no falla por un header, sino por el cuerpo o el tipo de error.

Conviene revisar:

- si el body filtra detalles internos
- si hay stack traces
- si aparece infraestructura
- si los mensajes cambian demasiado entre estados
- si el error enseña existencia, permisos o estructura interna
- si el HTML de error trae políticas peores que el HTML normal

### Regla sana

No mires solo cabeceras.
Mirá también el cuerpo, el tipo y la forma de la respuesta.

---

## Cómo mirar el sistema “de verdad”

Conceptualmente, conviene revisar las respuestas reales desde distintos puntos de vista:

### 1. Como navegador
Porque ahí ves:
- CORS
- redirects
- políticas del browser
- headers vistos por frontend

### 2. Como cliente HTTP simple
Porque ahí ves:
- status
- headers
- cuerpos
- errores sin interpretación del navegador

### 3. Como recorrido completo en producción
Porque ahí ves:
- efecto del proxy
- edge responses
- diferencias de entorno
- caches
- CDN
- infraestructura real

### Idea importante

Cada mirada muestra una parte distinta de la verdad.

---

## Local no alcanza

Una app puede responder “perfecto” en local y comportarse distinto cuando pasa por:

- TLS termination real
- proxy
- ingress
- gateway
- cache
- CDN
- headers de forwarding
- errores del edge

### Idea útil

La revisión local sirve.
Pero la revisión que importa de verdad es la que observa el recorrido final donde viven los usuarios reales.

---

## Una sola captura no alcanza

También conviene evitar la revisión superficial de:
- una sola request
- una sola respuesta 200
- una sola captura de DevTools
- un solo endpoint “importante”

### Porque podrías perderte

- respuestas de error
- rutas estáticas
- redirects
- preflights
- diferencias por método
- diferencias por origin
- respuestas servidas por otra capa
- inconsistencias entre HTML y API

### Regla sana

La revisión real necesita muestrear más de una superficie.

---

## Qué revisar por familias de endpoints

Una buena práctica es revisar por familias:

- login
- logout
- recursos públicos
- recursos autenticados
- admin
- archivos y descargas
- recursos estáticos
- documentación
- Actuator
- errores
- redirects
- preflights

### Idea útil

Esto ayuda a descubrir que distintas zonas del mismo sistema pueden estar expuestas con políticas diferentes sin que nadie lo haya querido explícitamente.

---

## Qué señales indican que la respuesta real no coincide con lo esperado

Hay varios síntomas bastante claros:

- el navegador recibe menos headers que la app cree enviar
- un error 502 no se parece en nada a una 500 de Spring
- CORS funciona en local pero falla detrás del proxy
- HSTS aparece en ciertas rutas y no en otras
- CSP desaparece en páginas de error
- redirects salen a HTTP o a un host raro
- una respuesta cacheada trae headers de otro contexto
- la respuesta final muestra branding, mensajes o estructura de otra capa

### Idea importante

Estos síntomas suelen ser señal de desalineación entre código, framework e infraestructura.

---

## Qué conviene registrar mentalmente durante la revisión

No alcanza con mirar “si está o no está”.
Conviene preguntarte siempre:

- ¿qué capa generó esta respuesta?
- ¿qué cambió en el camino?
- ¿esta respuesta es consistente con otras similares?
- ¿qué vería un usuario real?
- ¿qué vería un atacante curioso?
- ¿esta política está bien en éxito, en error y en redirect?
- ¿es igual en producción y en staging?
- ¿esto lo configuró la app o lo heredó de otra capa?

### Regla sana

No revises respuestas como objetos aislados.
Revisalas como evidencia de una cadena de decisiones.

---

## Qué conviene revisar en una app Spring

Cuando revises respuestas reales del sistema en una aplicación Spring, mirá especialmente:

- 200, 3xx, 4xx y 5xx reales
- preflights `OPTIONS`
- respuestas de login, logout y sesión
- recursos HTML, JSON y descargas
- errores servidos por la app y por el proxy
- headers finales en navegador
- headers finales en cliente HTTP
- diferencias entre local, staging y producción
- efectos del CDN, cache o proxy
- coherencia entre lo configurado y lo realmente observado

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- respuestas consistentes entre capas
- headers de seguridad presentes de forma razonable en éxito y error
- CORS observable y coherente
- redirects correctos
- menos diferencias misteriosas entre entornos
- mejor correspondencia entre código, config e infraestructura
- equipo acostumbrado a validar con evidencia final y no solo con suposiciones

---

## Señales de ruido

Estas señales merecen revisión rápida:

- nadie sabe qué respuesta final ve el navegador
- el equipo se guía solo por config
- respuestas de error totalmente distintas según capa
- diferencias entre local y prod nunca investigadas
- headers presentes solo “a veces”
- CORS caprichosa o intermitente
- redirects inesperados
- caches mezclando contextos
- la política real solo se descubre cuando algo ya falló en producción

---

## Checklist práctico

Cuando revises respuestas reales del sistema, preguntate:

- ¿qué recibe realmente el cliente final?
- ¿qué cambia entre 200, 302, 401, 403, 404, 500 y errores de infraestructura?
- ¿qué headers de seguridad están presentes de verdad?
- ¿qué pasa con CORS en preflight y en request real?
- ¿qué responde el proxy cuando la app no responde?
- ¿hay diferencias entre navegador y cliente HTTP simple?
- ¿la respuesta cambia por entorno o capa?
- ¿qué política cree tener la app y qué política ve realmente el cliente?
- ¿qué parte del sistema nunca miramos de punta a punta?
- ¿qué revisarías primero para pasar de suposición a evidencia?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y elegí cinco respuestas reales distintas, por ejemplo:

- una 200 HTML
- una 200 JSON
- una preflight
- una 302
- una 500 o 502

y respondé:

1. ¿Qué headers recibe el cliente en cada una?
2. ¿Qué diferencias no esperabas?
3. ¿Cuál de esas respuestas no la genera del todo la app?
4. ¿Qué política de seguridad desaparece o cambia?
5. ¿Qué capa parece estar interviniendo?
6. ¿Qué asunción del equipo quedó desmentida por la evidencia?
7. ¿Qué revisarías después de eso en el recorrido completo?

---

## Resumen

Revisar respuestas reales del sistema significa dejar de confiar solo en código, configs o intuiciones y pasar a mirar evidencia concreta de lo que recibe el cliente final.

Eso importa porque la seguridad HTTP efectiva depende de:

- status reales
- headers reales
- cuerpos reales
- redirects reales
- errores reales
- CORS real
- infraestructura real

En resumen:

> un backend más maduro no se conforma con “haber configurado bien” y esperar que la respuesta final coincida.  
> También verifica lo que sale de verdad por la red, porque entiende que entre Spring, Security, proxy, CDN, caché y errores de infraestructura hay demasiadas oportunidades para que una política aparentemente correcta se convierta en una respuesta inconsistente, más abierta o simplemente distinta de la que el equipo cree tener, y que la única forma de descubrirlo antes de que se vuelva incidente es mirar el sistema como lo mira el cliente: por sus respuestas reales.

---

## Próximo tema

**Auditar APIs desde el navegador y desde curl**
