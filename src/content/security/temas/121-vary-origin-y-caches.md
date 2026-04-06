---
title: "Vary: Origin y caches"
description: "Cómo se relacionan Vary: Origin, CORS y caches en una aplicación Java con Spring Boot. Por qué una respuesta que cambia según el Origin no debería cachearse como si fuera igual para todos, y qué riesgos aparecen cuando proxies, CDNs o caches intermedios reutilizan headers CORS fuera de contexto."
order: 121
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# Vary: Origin y caches

## Objetivo del tema

Entender por qué **`Vary: Origin`** importa cuando una aplicación Java + Spring Boot usa CORS y hay **caches** involucrados en el camino.

La idea de este tema es revisar un problema que suele pasar desapercibido porque no parece “seguridad del backend” en sentido clásico.
Suena más a detalle de infraestructura o de performance.

Pero puede generar comportamientos peligrosos o, como mínimo, muy confusos.

Porque cuando una respuesta CORS depende del valor de:

- `Origin`

y en el medio existen cosas como:

- reverse proxies
- CDNs
- caches compartidos
- gateways
- capas intermedias de aceleración

aparece una pregunta importante:

> si la respuesta cambia según el origin, ¿cómo se entera el cache de que no debería reutilizar la misma versión para todos?

Ahí entra `Vary: Origin`.

En resumen:

> si el backend responde distinto según el `Origin`, el cache necesita saberlo.  
> Si no, puede reutilizar una respuesta CORS fuera de contexto y terminar sirviendo una política equivocada al cliente equivocado.

---

## Idea clave

Un cache funciona mejor cuando puede asumir que una misma request produce una misma respuesta reutilizable.

Pero en CORS eso no siempre es cierto.

Si el backend:

- devuelve `Access-Control-Allow-Origin` en función del `Origin` recibido
- o cambia otros headers CORS según el origen

entonces la respuesta deja de ser “idéntica para todos”.
Pasa a depender de un input del request.

La idea central es esta:

> cuando el `Origin` influye en la respuesta, el cache no debería tratar esa respuesta como intercambiable entre distintos orígenes.

`Vary: Origin` existe justamente para comunicar esa dependencia.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- cachear respuestas CORS como si fueran iguales para cualquier origin
- no indicar que la respuesta depende de `Origin`
- suponer que CORS y caches no se afectan entre sí
- dejar que un proxy o CDN reutilice un `Access-Control-Allow-Origin` generado para otro frontend
- pensar que el navegador siempre “lo va a resolver solo”
- no revisar qué headers finales salen después de capas intermedias
- tratar `Vary` como un detalle cosmético y no como parte de la corrección de la respuesta

Es decir:

> el problema no es solo generar bien los headers CORS.  
> El problema también es que no se mezclen mal cuando hay caches que reutilizan respuestas entre requests con `Origin` distinto.

---

## Error mental clásico

Un error muy común es este:

### “Si el backend respondió bien una vez, ya está”

Eso es demasiado simple.

Porque tal vez respondió bien **para ese origin**.
Pero si un cache intermedio reutiliza esa misma respuesta para otro origin, el resultado ya no representa la decisión que el backend habría tomado para ese segundo caso.

### Idea importante

La corrección de CORS no depende solo de la lógica del backend.
También depende de que la infraestructura no recicle respuestas como si todas las variaciones de `Origin` fueran equivalentes.

---

## Qué significa `Vary` en términos simples

El header `Vary` le dice a caches y componentes intermedios algo parecido a esto:

> “no trates esta respuesta como igual para todos los requests;  
> fijate también en estos headers del request porque pueden cambiar el resultado.”

Cuando la respuesta CORS depende de `Origin`, usar:

- `Vary: Origin`

le comunica al cache que:

- no debería servir la misma versión a requests con origins diferentes como si nada.

### Idea útil

No es un tema de “más seguridad por tener otro header”.
Es un tema de **coherencia entre la política generada y el contexto del request**.

---

## Por qué importa tanto en CORS

En CORS, muchas aplicaciones responden de forma distinta según el `Origin`.

Por ejemplo, podrían:

- permitir ciertos origins y no otros
- reflejar un origin concreto permitido
- variar si hay credentials
- devolver headers distintos según entorno o frontend

Eso significa que la respuesta no es universal.

### Entonces la pregunta sana es

- ¿qué pasa si un cache guarda una respuesta generada para `https://frontend-a...`
y luego la reusa para `https://frontend-b...`?

### Idea importante

Si el cache no sabe que `Origin` forma parte de la variación, puede mezclar respuestas que no deberían compartirse.

---

## No es un tema solo del navegador

Esto conviene remarcarlo porque CORS suele pensarse mucho en clave de browser.

Pero `Vary: Origin` importa especialmente por todo lo que puede haber **antes** de llegar al navegador:

- CDN
- reverse proxy
- gateway
- cache HTTP
- edge layer
- proxy corporativo
- infraestructura que reutiliza respuestas

### Idea importante

Acá no solo se juega qué decide el navegador.
También se juega qué respuesta le llega realmente después de atravesar capas que podrían reutilizarla mal.

---

## Qué puede salir mal si falta `Vary: Origin`

Conceptualmente, pueden pasar cosas como:

- el cache devuelve una respuesta con `Access-Control-Allow-Origin` correspondiente a otro frontend
- una request legítima recibe headers CORS incorrectos y falla
- una request que no debería heredar cierto permiso recibe una respuesta preparada para otro origen
- el comportamiento se vuelve intermitente y difícil de reproducir
- el equipo cree que “CORS anda raro” cuando el problema real es el cache

### Idea útil

No siempre el resultado será una vulnerabilidad dramática evidente.
A veces será una mezcla de:

- errores extraños
- inconsistencias
- permisividad incorrecta
- o bloqueos inesperados

Pero todo eso ya es señal de que la política no está llegando bien segmentada.

---

## Este tema aparece especialmente cuando el backend refleja origins permitidos

Se vuelve muy relevante cuando la aplicación hace algo como:

- recibe un `Origin`
- verifica si está permitido
- y, si lo está, responde con ese mismo valor en `Access-Control-Allow-Origin`

Eso puede ser totalmente válido en ciertos contextos.
Pero justamente ahí la respuesta ya depende del `Origin`.

### Regla sana

Si la respuesta depende del `Origin`, el cache debería saberlo explícitamente.

Y esa es la razón conceptual más fuerte para `Vary: Origin`.

---

## Si la respuesta es fija para todos, la conversación cambia

No todas las políticas CORS tienen el mismo problema con caches.

Si de verdad la respuesta fuese idéntica para todos los requests relevantes, el nivel de preocupación cambia.
Pero en cuanto empezás a variar por origin, la necesidad de comunicar esa variación se vuelve mucho más clara.

### Idea importante

El punto no es “siempre poné cosas porque sí”.
El punto es:

- si el resultado cambia por `Origin`, no deberías dejar que un cache lo ignore.

---

## `Vary: Origin` no reemplaza una mala política CORS

Esto también conviene decirlo claro.

Agregar `Vary: Origin` no arregla problemas como:

- origins demasiado amplios
- credentials mal configuradas
- whitelists flojas
- confusión entre CORS y auth
- políticas heredadas y sobreabiertas

### Regla sana

`Vary: Origin` no hace mejor la política.
Hace más correcta su interacción con caches cuando la política ya depende del origin.

### Idea importante

Es una pieza de corrección y coherencia, no un parche para cualquier diseño débil.

---

## Un comportamiento intermitente suele ser señal de infraestructura en el medio

Este tema aparece mucho cuando el equipo ve cosas como:

- a veces el frontend anda y a veces no
- desde cierto entorno falla raro
- el mismo origin parece aceptado en una request y no en otra
- el navegador muestra errores CORS inconsistentes
- en local funciona, detrás del CDN falla

### Idea útil

Cuando CORS parece “caprichoso”, conviene sospechar también de caches y de qué tan bien la respuesta está marcando sus dependencias.

No todo error CORS nace del código Java de la app.

---

## CORS correcto en app + caché incorrecto en borde = resultado incorrecto

Esta es una buena forma de resumir el problema.

Podés tener:

- lógica CORS razonable en Spring
- whitelist precisa
- origins bien validados

y aun así obtener un comportamiento final incorrecto si una capa intermedia reutiliza respuestas fuera de contexto.

### Idea importante

La política efectiva es la que ve el navegador al final del camino, no la intención original del código.

---

## `Vary` también ayuda a explicar la arquitectura

Otra ventaja menos obvia es que obliga al equipo a reconocer algo importante:

- qué inputs del request modifican la respuesta

En CORS dinámico, `Origin` es uno de esos inputs.

### Idea útil

Pensar en `Vary` obliga a hacer explícito que la respuesta no es universal.
Y eso mejora no solo caches, sino también la comprensión del contrato HTTP real.

---

## CORS, caches y debugging: combinación difícil

Cuando este tema no está bien resuelto, el debugging se vuelve muy molesto porque:

- el backend parece responder bien
- el navegador a veces se queja
- el proxy cachea
- el CDN sirve algo viejo
- el equipo revisa solo la app y no ve el problema

### Regla sana

En problemas de CORS con comportamiento no determinista, conviene revisar siempre:

- qué headers salen de la app
- qué headers llegan al navegador
- qué hace cada capa intermedia
- y si `Origin` está siendo tratado como parte de la variación de la respuesta

---

## También importa con preflight

Este tema no se limita solo a la respuesta final del recurso.
También puede importar en respuestas de preflight si estas varían según origin u otros factores.

### Idea importante

Si el navegador está negociando CORS y la infraestructura intermedia cachea esa negociación como si fuera igual para todos, también podés heredar respuestas fuera de contexto.

---

## No todos los caches se comportan igual, pero el riesgo conceptual sigue

No hace falta entrar ahora en el detalle de cada producto o proveedor.
Lo importante es el modelo mental:

- si hay una capa que reutiliza respuestas
- y la respuesta depende de `Origin`
- entonces esa dependencia debería declararse

### Regla sana

No pienses solo en “mi app Spring”.
Pensá también en:
- qué recorrido hace la respuesta
- quién la puede almacenar
- y bajo qué criterios la puede reutilizar

---

## Este tema se vuelve más sensible con credentials

Como en otros temas de CORS, si además hay:

- cookies
- sesión
- credenciales
- datos privados

la importancia práctica sube.

Porque ya no hablamos solo de un header incorrecto que rompe una SPA pública.
Podemos hablar de respuestas autenticadas que deberían estar mucho más cuidadosamente asociadas al origin correcto.

### Idea importante

Cuanto más sensible es la respuesta, más caro puede ser que una capa intermedia reutilice mal una política generada para otro origin.

---

## Qué no deberías hacer

Algunas malas prácticas conceptuales que conviene evitar:

- ignorar `Vary` cuando la respuesta refleja el origin
- asumir que el proxy “ya lo manejará”
- probar solo contra la app y no contra el recorrido real
- culpar al navegador sin revisar caches
- abrir más origins para “compensar” un problema que en realidad era de reutilización incorrecta
- pensar que porque no usás `*` ya no hay nada más que revisar en CORS

### Idea útil

La precisión en la whitelist no alcanza si después la respuesta se sirve fuera de contexto por una capa intermedia.

---

## Qué conviene revisar en una app Spring

Cuando revises `Vary: Origin` y caches en una aplicación Spring, mirá especialmente:

- si la respuesta CORS depende del `Origin`
- si se refleja un origin permitido en `Access-Control-Allow-Origin`
- qué headers finales recibe el navegador
- si hay proxy, gateway, CDN o cache intermedio
- si los problemas CORS son intermitentes o dependen del entorno
- si preflight y respuesta real pasan por las mismas capas
- si la infraestructura puede reutilizar respuestas entre origins distintos
- si el equipo entiende que `Vary` comunica dependencia de la respuesta respecto del request
- si hay credentials que hacen más delicado un mal reciclado de respuestas

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- comprensión clara de cuándo la respuesta varía por origin
- uso coherente de `Vary: Origin` cuando corresponde
- menos misterios de CORS “a veces funciona”
- mejor alineación entre app y capas intermedias
- más verificación de la respuesta real vista por el navegador
- menos confianza ciega en defaults del cache o del CDN

---

## Señales de ruido

Estas señales merecen revisión rápida:

- la app refleja origins pero nadie miró `Vary`
- problemas CORS intermitentes según entorno o capa
- el equipo solo revisa el código Spring y no el borde
- nadie sabe qué hace el CDN o proxy con esas respuestas
- se abren más origins para “arreglar” síntomas raros
- hay credentials de por medio y la reutilización de respuestas no está bien razonada
- se piensa que `Vary` es solo tuning de caché y no una pieza de corrección HTTP

---

## Checklist práctico

Cuando revises `Vary: Origin` y caches, preguntate:

- ¿mi respuesta CORS cambia según el `Origin`?
- ¿estoy reflejando origins permitidos?
- ¿hay caches o capas intermedias entre la app y el navegador?
- ¿esa infraestructura sabe que la respuesta depende de `Origin`?
- ¿el navegador está viendo exactamente lo que sale de la app?
- ¿hay síntomas intermitentes o inconsistentes?
- ¿las respuestas de preflight también podrían verse afectadas?
- ¿qué pasaría si una respuesta generada para un origin se reutiliza para otro?
- ¿hay cookies o credentials que hacen esto más sensible?
- ¿qué revisarías primero en el recorrido completo y no solo en la app?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Tu backend responde distinto según el `Origin`?
2. ¿Cómo lo hace: whitelist fija, reflection, lógica dinámica?
3. ¿Hay CDN, proxy o gateway con cache en el medio?
4. ¿Qué headers CORS llegan realmente al navegador?
5. ¿Tu equipo ya vio errores CORS intermitentes alguna vez?
6. ¿Qué tan costoso sería que una respuesta generada para un origin termine sirviéndose a otro?
7. ¿Qué cambio harías primero para que la política CORS viaje correctamente por toda la infraestructura?

---

## Resumen

`Vary: Origin` importa cuando la respuesta CORS depende del `Origin`, porque ayuda a que caches y capas intermedias no reutilicen la misma respuesta como si fuera válida para todos los origins.

No mejora por sí solo una mala política CORS.
Pero sí evita que una política razonable se vuelva incorrecta en el camino por culpa de reutilización fuera de contexto.

En resumen:

> un backend más maduro no se limita a generar bien `Access-Control-Allow-Origin` y asumir que el resto del recorrido no importa.  
> También entiende que, si la respuesta cambia según quién pregunta, esa dependencia debe quedar explícita para proxies, CDNs y caches, porque sabe que una política CORS correcta en el código puede convertirse en una política errática o equivocada en producción si las capas intermedias no saben que `Origin` forma parte de la variación real de la respuesta.

---

## Próximo tema

**Riesgos de infraestructura y reverse proxy**
