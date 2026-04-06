---
title: "Features de preview y unfurling como superficie de SSRF"
description: "Cómo pensar previews de enlaces, unfurling y extracción automática de metadata como superficie de SSRF en una aplicación Java con Spring Boot. Por qué una feature de UX puede convertir al backend en un cliente privilegiado hacia destinos influenciados por el usuario y qué preguntas conviene hacerse antes de implementarla."
order: 140
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Features de preview y unfurling como superficie de SSRF

## Objetivo del tema

Entender por qué las **features de preview, unfurling y extracción automática de metadata** son una superficie muy común de **SSRF** en una aplicación Java + Spring Boot.

La idea de este tema es tomar una funcionalidad que suele sonar totalmente amigable y de producto:

- pegar un enlace
- mostrar título, imagen y descripción
- autocompletar una tarjeta de vista previa
- traer metadata de una página
- “enriquecer” un link antes de guardarlo o mostrarlo

Todo eso parece muy razonable desde UX.
Y muchas veces realmente mejora la experiencia.

Pero desde seguridad, la pregunta cambia bastante:

> ¿qué le estamos pidiendo realmente al backend cuando le decimos que haga unfurling o preview de un enlace?

La respuesta suele ser algo así:

- resolver un destino
- conectarse
- descargar contenido
- seguir redirects
- parsear metadata
- elegir qué devolver
- todo eso desde la posición de red del servidor, no del navegador del usuario

En resumen:

> un preview de enlaces no es solo una mejora visual.  
> También es una feature que puede convertir al backend en explorador de destinos elegidos o influidos por el usuario.

---

## Idea clave

Unfurling, preview o metadata extraction suelen significar algo como:

1. el usuario entrega un enlace o algo que lo representa
2. el backend visita ese destino
3. obtiene HTML, cabeceras o contenido parcial
4. extrae datos como:
   - título
   - descripción
   - imagen
   - favicon
   - tipo de contenido
   - Open Graph
   - Twitter cards
5. devuelve un resumen o lo persiste

La idea central es esta:

> la aplicación no solo “muestra un enlace mejor”.  
> Está haciendo trabajo de red en nombre del usuario hacia un destino que puede ser problemático.

Y eso pone la feature de lleno dentro del modelo de riesgo de SSRF.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que un preview es solo un tema de frontend
- subestimar que el backend tiene que visitar el enlace
- creer que “solo traemos el título” reduce automáticamente el riesgo
- no ver que el destino del preview puede ser influido por el usuario
- asumir que por ser una feature de UX no necesita controles fuertes
- ignorar redirects, tamaño del contenido o recursos secundarios
- olvidar que el backend ve una red distinta de la que ve el usuario

Es decir:

> el problema no es adornar enlaces.  
> El problema es que, para hacerlo, el backend termina actuando como cliente saliente hacia destinos que pueden no ser confiables.

---

## Error mental clásico

Un error muy común es este:

### “Solo hacemos preview, no una integración seria, así que no debería ser tan peligroso”

Eso minimiza demasiado la superficie.

Porque incluso un preview simple puede implicar:

- salir a la red
- resolver DNS
- seguir redirects
- tocar hosts internos si el control es flojo
- leer contenido no esperado
- devolverle al usuario señales sobre qué alcanzó el servidor
- repetir requests automáticamente cada vez que alguien pega un enlace

### Idea importante

El hecho de que la funcionalidad sea “solo visual” no la vuelve poco sensible.
Desde el punto de vista de SSRF, sigue siendo una request saliente influida por usuario.

---

## Por qué esta feature aparece tanto en apps reales

Esta superficie es muy común porque previews y unfurlings son muy atractivos desde producto.

Aparecen en cosas como:

- chats
- comentarios
- publicaciones
- CMS
- paneles internos
- herramientas de soporte
- CRMs
- tickets
- descripciones enriquecidas
- campos donde se pegan enlaces
- backoffices que importan metadata de recursos externos

### Idea útil

Cuanto más natural te parezca pegar un link y que “pase algo lindo”, más probable es que esa feature merezca revisión de SSRF.

---

## No hace falta que el usuario vea la request

Otro punto importante es este:

el usuario no necesita controlar una interfaz explícita tipo:

- “haz una request”

Le alcanza con pegar algo aparentemente inocente:

- una URL
- un enlace acortado
- un dominio
- un recurso remoto
- una referencia que luego termina resolviendo un link

### Idea importante

Eso vuelve a esta superficie especialmente engañosa:
parece un flujo de contenido,
pero por debajo es un flujo de red.

---

## Preview no significa “solo una request pequeña”

A veces el equipo piensa:

- “hacemos una consulta rápida”
- “solo bajamos un poquito”
- “solo leemos metadata”
- “solo hacemos HEAD”
- “solo parseamos Open Graph”

Eso puede reducir algunas cosas.
Pero no elimina el hecho central:

- el backend sigue conectándose
- sigue resolviendo
- sigue alcanzando destinos
- y sigue devolviendo señales sobre lo que encontró

### Regla sana

No confundas “menos datos descargados” con “no hay superficie SSRF”.
La superficie sigue existiendo igual.

---

## Qué hace especialmente delicada a esta feature

Los previews tienen varias cosas que los vuelven terreno fértil para SSRF:

- aceptan input muy libre
- suelen dispararse automáticamente
- se integran en flujos muy usados
- el usuario espera respuesta rápida
- a veces siguen redirects para “funcionar mejor”
- suelen intentar leer HTML real
- a veces consultan imágenes o recursos adicionales
- el equipo quiere que “anden con muchos enlaces”

### Idea importante

Es una combinación muy típica de:
- mucha flexibilidad
- poca fricción
- mucho valor UX
- y riesgo saliente subestimado

---

## Unfurling y redirects: combinación clásica

Esto es especialmente importante.

Muchos sistemas de preview quieren “funcionar bien” aunque el link inicial redirija.
Entonces hacen algo como:

- visitar la URL
- seguir redirects
- llegar al destino final
- recién ahí extraer metadata

### Problema

Ese comportamiento puede convertir una validación inicial razonable en un recorrido mucho más peligroso si nadie revalida el destino posterior.

### Idea útil

Un preview que sigue redirects sin mucha disciplina puede terminar abriendo caminos hacia hosts, puertos o redes que la feature nunca quiso tocar.

---

## Previews e imágenes remotas

Muchas veces el preview no solo extrae texto.
También intenta traer:

- imagen destacada
- favicon
- thumbnail
- recursos adicionales

Eso puede significar más de una request saliente o, al menos, más de un recurso remoto a considerar.

### Idea importante

Cuanto más “rico” es el preview, más crece la superficie:

- más destinos
- más contenido
- más tamaños
- más requests
- más parseo
- más oportunidad de desalineación entre lo que el negocio quería y lo que el backend termina haciendo

---

## Lo que el usuario aprende de la respuesta también importa

Incluso si la app no devuelve el HTML completo, un preview puede darle al usuario señales valiosas como:

- si el host respondió
- si hubo redirect
- qué título devolvió
- si existía cierta ruta
- si el contenido era HTML
- si tardó más o menos
- si el servidor interno respondió distinto

### Idea útil

SSRF no necesita exfiltración total para ser útil.
A veces basta con pequeñas señales de reconocimiento.
Y un preview puede entregar justo ese tipo de señales.

---

## El backend hace la visita desde un lugar privilegiado

Esto conecta con toda la lógica anterior del bloque.

Si el navegador del usuario hiciera el preview, el alcance sería uno.
Pero cuando lo hace el backend, el alcance puede incluir:

- localhost
- red privada
- DNS interno
- servicios del cluster
- metadata endpoints
- paneles administrativos no públicos

### Idea importante

Eso es lo que vuelve a los previews una superficie más seria de lo que parecen:
no navega el usuario, navega el servidor.

---

## Auto-preview y ejecución automática

Otra razón por la que esta feature merece sospecha es que muchas veces no requiere ni un clic especial.
Se dispara sola cuando:

- el usuario pega el enlace
- se guarda el contenido
- se renderiza una tarjeta
- un job procesa enlaces pendientes
- otro usuario abre el contenido
- un bot o proceso interno reintenta enriquecer la metadata

### Regla sana

Cuando una request saliente puede dispararse automáticamente, la superficie escala porque deja de depender de una acción deliberada puntual del equipo o del usuario.

---

## Si el preview corre en background, igual sigue siendo SSRF

A veces el equipo siente más tranquilidad si el unfurling ocurre:

- en una cola
- en un worker
- en un proceso async
- en background

Eso puede mejorar disponibilidad o UX.
Pero no cambia la naturaleza del riesgo.

### Idea importante

No importa tanto si el request saliente corre síncrono o asíncrono.
Importa:
- quién influye el destino
- qué alcanza el backend
- qué valida
- qué devuelve
- y qué red ve ese proceso

---

## Features internas también cuentan

No todo preview vive en una app pública.
A veces aparece en:

- backoffices
- herramientas de soporte
- paneles administrativos
- sistemas internos de documentación o tickets
- CRMs
- workflows operativos

Y eso puede ser incluso más delicado, porque esas herramientas:

- suelen tener más conectividad
- menos revisión
- más poder operativo
- menos fricción para usuarios internos

### Regla sana

No asumas que un preview “interno” es menos riesgoso.
A veces es al revés.

---

## Un preview puede terminar pareciéndose a un pequeño crawler

Cuando la feature crece demasiado, empieza a sumar cosas como:

- seguir redirects
- pedir HTML
- extraer Open Graph
- buscar favicon
- descargar imagen
- resolver varios recursos
- reintentar
- aplicar heurísticas

En ese punto, el preview deja de ser una request simple y se acerca más a un pequeño crawler.

### Idea importante

Cuanto más se parece a un crawler, más fuerte debería ser tu revisión de SSRF, límites de destino, tamaño y comportamiento saliente.

---

## Qué preguntas conviene hacer sobre una feature de preview

Cuando revises unfurling o metadata extraction, conviene preguntar:

- ¿qué input controla el usuario?
- ¿qué destinos permite realmente la feature?
- ¿sigue redirects?
- ¿hace una sola request o varias?
- ¿descarga HTML completo o parcial?
- ¿intenta traer imágenes o favicons?
- ¿qué devuelve al usuario?
- ¿qué señales le está dando sobre reachability?
- ¿qué red puede alcanzar el backend que hace ese preview?
- ¿qué pasaría si esa feature apuntara a localhost, red privada o metadata?

### Regla sana

No pienses “qué lindo queda el preview”.
Pensá también:
- “qué capacidad de red le estamos dando al backend para producirlo”.

---

## Qué revisar en una codebase Spring

En una app Spring, esta superficie suele aparecer alrededor de:

- servicios tipo `LinkPreviewService`
- `OpenGraphService`
- `MetadataFetcher`
- `UnfurlService`
- `UrlEnricher`
- importadores de enlaces o recursos remotos
- uso de `RestTemplate` o `WebClient` para leer HTML de URLs dadas por usuario
- follow redirects
- parsers de metadata
- jobs async que procesan enlaces pendientes

### Idea útil

Si ves una feature cuyo trabajo es “mirar un link y traer algo de él”, ya tenés un candidato fuerte a revisar por SSRF.

---

## Qué vuelve más sana a una feature así

Una implementación más sana suele mostrar cosas como:

- destinos más acotados o más verificados
- menos flexibilidad gratuita
- redirects controlados
- menos recursos secundarios descargados
- límites claros de comportamiento
- más claridad sobre qué información se devuelve
- contrato explícito sobre qué tipo de preview se ofrece realmente

### Idea importante

La feature no tiene que dejar de existir.
Pero sí debería funcionar dentro de una política saliente mucho más deliberada.

---

## Qué señales de ruido deberían prenderte alarmas

Estas señales merecen revisión rápida:

- “pegá cualquier link y te traemos la preview”
- follow redirects automático
- trae HTML, imágenes y favicon sin mucha separación
- corre en background y nadie revisó qué puede alcanzar
- se usa un cliente genérico para todo
- no hay allowlist ni política clara de destinos
- devuelve mensajes ricos sobre por qué un host no respondió
- el equipo lo ve como puro frontend aunque el backend haga el trabajo pesado

### Regla sana

Cuanto más automática, libre y “mágica” es la UX del preview, más importante suele ser su revisión de SSRF.

---

## Qué conviene revisar en una app Spring

Cuando revises features de preview y unfurling como superficie de SSRF en una aplicación Spring, mirá especialmente:

- endpoints o jobs que aceptan enlaces
- servicios que extraen metadata remota
- follow redirects
- descarga de imágenes o favicons
- tamaño y tipo de contenido consultado
- cuánto del destino controla el usuario
- qué respuestas o señales vuelve la feature
- qué cliente HTTP usa
- si hay limits claros por host, esquema, puerto y red alcanzable
- si el equipo entiende que esto es consumo saliente sensible y no solo UX

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- previews más acotados
- menos recursos secundarios innecesarios
- mejor control del destino
- menos redirects libres
- mejor separación entre UX y capacidad de red
- menos confianza en “como es metadata, no pasa nada”
- más claridad sobre el alcance real del worker o servicio que hace la visita

---

## Señales de ruido

Estas señales merecen revisión rápida:

- cualquier link dispara unfurling
- el sistema sigue “lo que venga” para mostrar una tarjeta bonita
- descarga múltiples recursos sin demasiados límites
- el backend devuelve demasiada información sobre lo que logró alcanzar
- no hay controles claros de destino
- se usa un cliente HTTP genérico para esta feature
- la funcionalidad existe hace tiempo y nunca fue mirada desde SSRF

---

## Checklist práctico

Cuando revises una feature de preview o unfurling, preguntate:

- ¿quién define el enlace?
- ¿el backend lo visita desde su propia red?
- ¿qué redirects sigue?
- ¿cuántos recursos descarga?
- ¿qué metadata devuelve?
- ¿qué información de reachability le da al usuario?
- ¿qué pasaría si el link apuntara a localhost, red privada o metadata?
- ¿qué tan genérico es el cliente saliente?
- ¿qué parte del comportamiento existe por conveniencia UX y no por necesidad real?
- ¿qué restringirías primero para que el preview deje de comportarse como un mini crawler demasiado libre?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Existe alguna feature de preview o unfurling?
2. ¿Qué input controla el usuario?
3. ¿Qué requests salientes hace realmente?
4. ¿Sigue redirects?
5. ¿Descarga solo HTML o también imágenes, favicons u otros recursos?
6. ¿Qué información le devuelve al usuario sobre el destino remoto?
7. ¿Qué cambio harías primero para reducir la superficie SSRF de esa feature?

---

## Resumen

Las features de preview, unfurling y extracción automática de metadata son una superficie muy típica de SSRF porque convierten al backend en un cliente saliente hacia destinos influenciados por usuario bajo la excusa de mejorar la UX.

El riesgo no está solo en “leer un título”.
Está en todo lo que la feature puede terminar haciendo:

- resolver
- conectar
- seguir redirects
- descargar contenido
- tocar recursos secundarios
- devolver señales sobre reachability
- todo desde la red privilegiada del backend

En resumen:

> un backend más maduro no trata el unfurling como una simple mejora visual ni como una tarea inocente de scraping ligero.  
> Lo trata como una capacidad saliente real, con implicancias de SSRF, porque entiende que cada vez que el producto promete “pegá un link y te mostramos qué hay ahí”, en el fondo también está prometiendo que el servidor va a mirar ese destino en nombre del usuario, y que la verdadera pregunta de seguridad no es qué tan linda queda la tarjeta resultante, sino cuánto del recorrido, del destino y del comportamiento de esa visita quedó realmente bajo control del sistema y cuánto quedó librado a lo que el usuario o el enlace remoto quieran decidir.

---

## Próximo tema

**Webhooks salientes y callbacks configurables**
