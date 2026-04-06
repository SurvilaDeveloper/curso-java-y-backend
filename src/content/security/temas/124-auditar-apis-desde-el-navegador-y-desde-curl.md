---
title: "Auditar APIs desde el navegador y desde curl"
description: "Cómo auditar una API Java con Spring Boot comparando lo que se ve desde el navegador y desde curl. Por qué ambas miradas muestran cosas distintas sobre CORS, headers, redirects y respuestas reales, y cómo usar esa diferencia para detectar problemas de seguridad y de infraestructura."
order: 124
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# Auditar APIs desde el navegador y desde curl

## Objetivo del tema

Entender cómo **auditar una API** Java + Spring Boot comparando dos miradas muy útiles y complementarias:

- **el navegador**
- **`curl`**

La idea de este tema es cerrar el bloque anterior con una práctica muy concreta.

Muchas veces, cuando algo falla o cuando queremos revisar seguridad HTTP, el equipo mira solo una de estas dos cosas:

- o abre DevTools en el navegador
- o prueba con `curl`
- o mira solo Postman
- o se queda únicamente con la respuesta que ve el frontend

Eso da información útil, pero incompleta.

Porque el navegador y `curl` no representan exactamente el mismo tipo de cliente.
Y esa diferencia, lejos de ser un problema, es una herramienta muy buena para auditar mejor.

En resumen:

> mirar la API desde el navegador y desde `curl` no es redundante.  
> Es una forma muy útil de separar qué depende del browser, qué depende de CORS, qué depende de infraestructura y qué está saliendo realmente por la red sin interpretación adicional.

---

## Idea clave

El navegador y `curl` observan la API desde lugares parecidos, pero no iguales.

## El navegador
te muestra una realidad donde importan mucho cosas como:

- CORS
- preflights
- cookies
- políticas del browser
- redirects vistos por el frontend
- comportamiento real del cliente web

## `curl`
te muestra una realidad más cruda y más directa:

- status
- headers
- cuerpo
- redirects
- sin same-origin policy
- sin CORS bloqueando lectura
- sin la capa de interpretación del navegador

La idea central es esta:

> comparar ambas miradas ayuda a descubrir si el problema está en la API, en el navegador, en la política CORS, en la infraestructura intermedia o en las suposiciones del equipo.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- creer que una API “anda mal” solo porque el navegador muestra error CORS
- asumir que si `curl` responde bien entonces el frontend no tiene ningún problema real
- no distinguir entre la request real y lo que el navegador permite leer
- auditar seguridad solo con DevTools o solo con `curl`
- no detectar diferencias entre respuesta de la app y comportamiento del browser
- no revisar headers, redirects y errores fuera del contexto del frontend
- pensar que una prueba desde un cliente basta para entender toda la superficie HTTP

Es decir:

> el problema no es elegir una herramienta.  
> El problema es perder la información que aparece justamente cuando comparás herramientas con modelos de ejecución distintos.

---

## Error mental clásico

Un error muy común es este:

### “Si con `curl` devuelve 200, entonces la API está perfecta”

Eso puede ser parcialmente cierto y parcialmente engañoso.

Porque desde `curl` podés confirmar cosas muy valiosas como:

- que el endpoint existe
- que responde
- qué headers devuelve
- qué status code sale
- qué cuerpo llega

Pero no vas a ver automáticamente:

- cómo reacciona el navegador a CORS
- si hubo preflight
- si la respuesta quedó bloqueada por política del browser
- cómo se comportan cookies en contexto real de frontend
- qué ve exactamente el código JavaScript de la página

### Idea importante

`curl` muestra la respuesta HTTP.
El navegador muestra además el efecto de las políticas del browser sobre esa respuesta.

---

## Error mental opuesto

También aparece el error contrario:

### “Si en el navegador falla, la API está rota”

No siempre.

A veces lo que pasa es que:

- la API responde bien
- pero CORS no permite que la página lea la respuesta
- o la preflight falla
- o el navegador bloquea algo por política propia
- o el contexto de cookies no coincide
- o el problema está en cómo el frontend hace la request

### Idea importante

Un fallo en navegador puede significar:
- API rota
o
- integración cross-origin mal configurada
o
- política del browser actuando como corresponde

Sin comparar con un cliente más crudo, es fácil confundir esas capas.

---

## Qué te muestra mejor el navegador

El navegador es especialmente útil para observar cosas como:

- CORS real
- preflights `OPTIONS`
- qué headers ve realmente el frontend
- cookies en contexto de la app
- redirects tal como los vive la navegación
- políticas del browser
- errores visibles en DevTools
- respuestas desde la perspectiva del usuario real

### Idea útil

Si tu preocupación es:
- cómo vive esto una SPA
- cómo lee la respuesta el frontend
- qué bloquea el browser
- cómo se comporta la sesión del usuario

entonces el navegador es imprescindible.

---

## Qué te muestra mejor `curl`

`curl` es especialmente útil para observar:

- respuesta HTTP cruda
- headers completos
- status codes reales
- comportamiento del servidor sin same-origin policy
- diferencias entre entornos
- redirects
- bodies de error
- respuestas del proxy o de la infraestructura
- endpoints que el navegador no te deja inspeccionar con tanta limpieza

### Idea importante

`curl` es muy bueno para preguntarte:
- **¿qué está saliendo realmente del sistema?**

No qué opina el navegador sobre eso.
Sino qué manda la red.

---

## CORS: uno de los mejores motivos para usar ambas miradas

Este es probablemente el caso más claro.

### Desde el navegador
ves:
- si hubo preflight
- si el `Origin` fue enviado
- si la respuesta quedó bloqueada
- qué mensaje muestra el browser
- qué ve el JavaScript de la página

### Desde `curl`
podés ver:
- qué responde el servidor
- qué `Access-Control-Allow-Origin` devuelve
- qué headers CORS están presentes
- cómo se comporta con distintos headers o métodos
- qué pasa sin la capa de enforcement del browser

### Idea importante

Comparar ambas miradas te ayuda a separar:
- problema de backend
- problema de política CORS
- problema de frontend
- problema de infraestructura

---

## Cookies y sesión: otra razón fuerte para comparar

Cuando la app usa:

- cookies
- sesión
- frontend en navegador
- endpoints privados

la diferencia entre navegador y `curl` también se vuelve muy instructiva.

### Porque el navegador
vive dentro de:
- contexto real de cookies
- navegación del usuario
- políticas del browser
- same-origin y cross-origin

### Mientras que `curl`
necesita que vos seas explícito con:
- headers
- cookies
- métodos
- follows de redirect
- detalles de la request

### Idea útil

Eso te obliga a entender mejor qué parte del comportamiento depende del usuario real y qué parte depende solo de la respuesta HTTP.

---

## Redirects: el navegador y `curl` te enseñan cosas distintas

Con redirects también es muy útil mirar ambas cosas.

### El navegador
te deja ver:
- cómo impacta al flujo real de la página
- si cae en login
- si cambia de dominio
- si rompe por CORS o mixed content
- cómo lo vive el usuario

### `curl`
te deja ver:
- status concreto
- `Location`
- cadena de redirects
- headers exactos
- qué capa parece generarlos

### Idea importante

Muchas configuraciones raras de proxy, TLS o host se entienden mejor cuando comparás el redirect crudo con la experiencia del navegador.

---

## Errores: 401, 403, 404, 500, 502

Otra auditoría muy útil es comparar errores desde ambas miradas.

### En el navegador
podés ver:
- cómo se integran al flujo web
- si el frontend ve el body o queda bloqueado
- si hay mensajes de CORS
- si el usuario real recibe HTML, JSON u otra cosa

### Con `curl`
podés ver:
- headers completos
- body exacto
- branding de proxy o gateway
- diferencias entre una 500 de la app y una 502 del edge

### Idea importante

A veces la seguridad se entiende más por cómo falla el sistema que por cómo responde en el caso feliz.

---

## Auditar preflights con `curl` también ayuda a pensar mejor

Aunque la preflight es algo muy ligado al navegador, revisar manualmente su respuesta puede ayudarte a entender mejor:

- qué methods están permitidos
- qué headers están permitidos
- qué `Origin` refleja o acepta el backend
- si hay `Vary: Origin`
- qué capa está generando la respuesta

### Idea útil

No se trata de “simular el navegador a la perfección”.
Se trata de inspeccionar la política que el navegador está negociando.

---

## `curl` ayuda a romper la ilusión del “el navegador no lo deja, entonces está seguro”

Esto conecta con varios temas anteriores.

A veces el equipo ve que el navegador bloquea algo y concluye:

- “la API quedó protegida”

Pero con `curl` podés comprobar rápidamente si:

- el endpoint sigue respondiendo
- el recurso sigue existiendo
- el backend sigue entregando datos
- el problema era solo de lectura cross-origin

### Idea importante

Eso ayuda muchísimo a no sobreestimar CORS ni otras políticas del browser como si fueran autorización real del backend.

---

## El navegador ayuda a romper la ilusión del “con `curl` anda, así que está perfecto”

Y a la inversa, DevTools te ayuda a ver cosas que `curl` no te muestra por sí sola, como:

- errores de CORS
- bloqueos del browser
- fallos por preflight
- comportamiento de cookies en el flujo real
- recursos cargados por HTML
- diferencias entre request visible para red y request usable por JavaScript

### Idea útil

El navegador te devuelve la perspectiva del producto vivo.
No solo la del protocolo desnudo.

---

## Qué revisar en una auditoría básica desde navegador

Desde el navegador, conviene mirar al menos:

- pestaña **Network**
- request real y preflight
- headers de request y response
- status
- redirects
- `Origin`
- cookies enviadas o no enviadas
- errores en consola relacionados con CORS, CSP o mixed content
- qué body ve realmente el frontend
- diferencias entre respuestas felices y errores

### Idea importante

No te quedes solo con el mensaje rojo de consola.
Abrí la request y mirá el detalle real del intercambio.

---

## Qué revisar en una auditoría básica con `curl`

Con `curl`, conviene mirar al menos:

- status code
- headers completos
- cuerpo
- redirects
- respuesta con distintos origins
- respuesta con distintos methods
- errores del proxy o la app
- diferencias entre entornos
- presencia o ausencia de headers de seguridad
- consistencia entre rutas y tipos de respuesta

### Idea útil

`curl` te obliga a mirar la respuesta como evidencia HTTP y no como experiencia de UI.

---

## Comparar varias rutas, no una sola

Otra buena práctica es no probar solo el endpoint “principal”.

Conviene comparar ambas miradas en:

- endpoint público
- endpoint autenticado
- login
- logout
- preflight
- error 401 o 403
- redirect
- recurso estático
- descarga de archivo
- endpoint detrás del proxy o del CDN

### Regla sana

La política real de un sistema suele cambiar entre familias de respuestas.
No la adivines a partir de un solo caso.

---

## Cuando ambos dicen cosas distintas, ahí suele estar el aprendizaje

Este es uno de los puntos más valiosos.

Si `curl` y el navegador muestran comportamientos distintos, no lo tomes como ruido.
Tomalo como señal.

### Esa diferencia suele ayudarte a detectar cosas como:

- problemas de CORS
- cookies no enviadas
- preflight mal respondida
- redirects incompatibles con frontend
- mixed content
- políticas del browser actuando
- infraestructura intermedia alterando respuestas

### Idea importante

Las discrepancias son justamente donde más podés aprender sobre la superficie real.

---

## Qué no hacer al auditar

Conviene evitar algunas trampas comunes.

### No hagas esto:

- mirar solo la consola del navegador
- mirar solo Postman y asumir que ya entendiste CORS
- probar solo una respuesta 200
- no comparar entornos
- no revisar redirects
- no abrir headers completos
- asumir que porque la app responde en local la política ya es la correcta
- olvidar errores del proxy o del edge

### Regla sana

Una auditoría HTTP útil necesita:
- variedad de respuestas
- comparación de clientes
- y foco en evidencia real

---

## Qué conviene revisar en una app Spring

Cuando audites una API Spring desde navegador y desde `curl`, mirá especialmente:

- endpoints públicos y autenticados
- CORS en request real y preflight
- cookies y sesión
- redirects de login o de HTTPS
- 401, 403, 404, 500 y 502
- headers de seguridad presentes o ausentes
- diferencias entre local, staging y producción
- comportamiento detrás de proxy, gateway o CDN
- consistencia entre lo que ve el frontend y lo que sale realmente de la red

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- consistencia razonable entre respuesta cruda y comportamiento del navegador
- diferencias explicables entre lo que `curl` ve y lo que el browser permite
- CORS precisa y entendible
- headers de seguridad presentes de forma consistente
- errores y redirects previsibles
- equipo acostumbrado a validar con herramientas complementarias y no solo con intuición

---

## Señales de ruido

Estas señales merecen revisión rápida:

- `curl` y navegador cuentan historias totalmente distintas y nadie sabe por qué
- CORS falla solo en browser y nadie inspecciona preflight
- la app parece bien en Postman pero el frontend sigue ciego
- redirects raros solo en producción
- errores del edge mezclados con errores de la app
- headers que aparecen en unas respuestas y desaparecen en otras
- el equipo usa una sola herramienta y concluye demasiado rápido

---

## Checklist práctico

Cuando audites desde navegador y desde `curl`, preguntate:

- ¿qué ve el navegador y qué ve `curl`?
- ¿dónde coinciden y dónde divergen?
- ¿hubo preflight?
- ¿qué `Origin` se envió y qué respondió el backend?
- ¿qué headers de seguridad salen realmente?
- ¿qué cookies o sesión están en juego?
- ¿hay redirects o errores servidos por otra capa?
- ¿el frontend está bloqueado por política del browser o el backend está mal?
- ¿qué respuesta real está viendo el usuario?
- ¿qué parte del problema se aclara solo cuando comparo ambas miradas?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y elegí un endpoint autenticado o con CORS.
Luego respondé:

1. ¿Qué muestra DevTools para esa request?
2. ¿Qué muestra `curl` para la misma ruta?
3. ¿Hay preflight o no?
4. ¿Qué headers aparecen en uno y en otro contexto?
5. ¿Qué cookies o credenciales cambian la historia?
6. ¿Qué parte del comportamiento depende del navegador y cuál del backend?
7. ¿Qué entendiste recién cuando comparaste ambas perspectivas?

---

## Resumen

Auditar una API desde el navegador y desde `curl` es una práctica muy potente porque te permite separar:

- respuesta HTTP real
- políticas del navegador
- CORS
- cookies y sesión
- redirects
- infraestructura intermedia
- errores de app vs errores de edge

El navegador te muestra:
- la experiencia y restricciones reales del frontend

`curl` te muestra:
- la respuesta cruda y la política efectiva de la red

En resumen:

> un backend más maduro no se conforma con probar la API desde un solo lugar y sacar conclusiones rápidas.  
> También compara cómo se comporta frente a un navegador real y frente a un cliente HTTP crudo, porque entiende que la seguridad web vive justamente en esa diferencia: entre lo que el servidor responde, lo que la infraestructura transforma y lo que el navegador finalmente permite ver, leer o ejecutar, y que auditar bien significa mirar esas capas juntas hasta que dejen de contradecirse y empiecen a contar una historia coherente.

---

## Próximo tema

**Buenas prácticas globales para HTTP y navegador**
