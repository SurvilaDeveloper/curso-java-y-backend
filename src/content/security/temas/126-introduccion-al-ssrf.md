---
title: "Introducción al SSRF"
description: "Qué es SSRF en una aplicación Java con Spring Boot y por qué aparece cuando el backend realiza requests salientes hacia URLs o destinos influenciados por el usuario. Cómo pensar este riesgo antes de entrar en validaciones, allowlists y consumo seguro de recursos externos."
order: 126
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Introducción al SSRF

## Objetivo del tema

Entender qué es **SSRF** en una aplicación Java + Spring Boot y por qué este riesgo aparece cuando el backend hace requests hacia destinos que el usuario puede influir, directa o indirectamente.

La idea de este tema es abrir un bloque nuevo con una intuición correcta desde el principio.

Muchas personas piensan SSRF como si fuera algo parecido a:

- “el atacante entra al servidor”
- “el atacante ve la red interna”
- “el atacante ejecuta algo remoto”
- “es un problema muy raro de infraestructura”

Eso puede llevar a subestimarlo o a imaginarlo mal.

La pregunta útil es otra:

> ¿qué pasa cuando mi backend acepta una URL, un host, un callback, un recurso remoto o algún destino parecido, y termina haciendo una request en nombre del usuario hacia algo que el usuario no debería poder hacerle pedir?

Ahí empieza la conversación real.

En resumen:

> SSRF no consiste solo en “hacer una request saliente”.  
> Consiste en perder control sobre **a qué destinos** está dispuesto a conectarse tu backend y **con qué nivel de confianza** lo hace.

---

## Idea clave

SSRF significa, en términos simples, **Server-Side Request Forgery**.

La intuición más útil para arrancar es esta:

> el atacante no necesita que el servidor le entregue directamente algo sensible.  
> A veces le alcanza con lograr que el servidor haga una request por él hacia un destino elegido o influenciado por ese atacante.

Eso cambia bastante la forma de pensar el problema.

Porque el backend suele tener ventajas que el usuario no tiene, por ejemplo:

- está en otra red
- ve servicios internos
- puede alcanzar hosts privados
- puede autenticarse frente a sistemas internos
- puede confiar en DNS o rutas internas
- puede tener permisos de salida más amplios
- puede acceder a metadata o recursos infraestructurales

La idea central es esta:

> cuando el servidor hace la request, ya no estás mirando solo “qué puede hacer el usuario desde su navegador”.  
> Estás mirando qué puede hacer **tu backend** como cliente HTTP, y eso suele ser mucho más sensible.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que SSRF solo existe si el usuario pega una URL completa en un formulario
- subestimar cualquier feature donde el backend consume recursos remotos
- creer que “si nosotros hacemos la request desde servidor, es más seguro”
- no ver riesgo en previsualizaciones, webhooks, importaciones, callbacks, fetchers, scrapers o validaciones externas
- asumir que toda request saliente es inocente si devuelve algo esperado
- olvidar que el servidor ve una red distinta y más privilegiada que el navegador del usuario
- tratar SSRF como un tema de infraestructura aislado y no como un problema de diseño de aplicación

Es decir:

> el problema no es solo aceptar URLs.  
> El problema es todo punto donde el usuario logra influir en **a qué destino se conecta el backend** y bajo qué condiciones.

---

## Error mental clásico

Un error muy común es este:

### “Eso solo pasa si dejamos al usuario escribir cualquier URL”

Eso es demasiado estrecho.

Sí, aceptar una URL libre es un caso clásico.
Pero SSRF también puede aparecer cuando el usuario controla o influye cosas como:

- una URL completa
- un hostname
- un dominio
- una IP
- un callback
- un identificador que luego se resuelve a una URL
- una ruta remota
- un parámetro que termina armando el destino
- una redirección intermedia
- un recurso externo que el backend decide seguir

### Idea importante

No hace falta que el usuario vea o escriba claramente “http://...”.
A veces alcanza con que influya una pieza del destino y la app complete el resto.

---

## No es solo “el servidor llama una API externa”

Esta también es una confusión frecuente.

Muchas apps llaman APIs externas todo el tiempo.
Eso, por sí solo, no significa SSRF.

El problema aparece cuando el destino o el recorrido de la request quedan demasiado influenciados por datos no confiables.

### Entonces la pregunta correcta no es
- “¿mi backend hace requests salientes?”

Sino:
- “¿quién controla o influye a qué destino sale?”
- “¿qué validaciones existen?”
- “¿qué red o servicios puede alcanzar ese backend?”
- “¿qué confianza implícita estoy dando a esa salida?”

### Idea útil

SSRF no se define por la existencia de requests salientes.
Se define por el **control insuficiente del destino**.

---

## Qué vuelve especialmente delicado a SSRF

Este riesgo importa mucho porque una request hecha por el servidor puede tener características que el atacante valora mucho:

- sale desde la red del backend
- puede llegar a lugares no expuestos públicamente
- puede usar DNS interno
- puede ver servicios administrativos
- puede tocar metadata de cloud
- puede hablar con servicios internos sin pasar por el navegador
- puede estar más cerca de secretos, tokens o paneles internos

### Idea importante

La request del servidor hereda el punto de vista del servidor.
Y ese punto de vista suele ser mucho más privilegiado que el del atacante externo.

---

## Pensar en “destinos alcanzables por el backend”

Esta es una muy buena intuición para arrancar.

Cuando analizás SSRF, conviene preguntarte:

> si mi backend acepta o construye una request saliente influida por el usuario, ¿qué destinos podría llegar a alcanzar realmente desde su posición de red?

Esa pregunta suele incluir cosas como:

- internet público
- otros microservicios
- servicios internos
- hosts del cluster
- redes privadas
- metadata endpoints
- consolas internas
- panels
- DNS internos
- puertos que el usuario desde afuera no ve

### Idea útil

SSRF se entiende mucho mejor si lo pensás como un problema de **capacidad de alcance del servidor**, no solo como “una URL rara”.

---

## SSRF no siempre busca leer una respuesta visible

Otra aclaración importante.

A veces, cuando se explica SSRF, parece que el objetivo fuera únicamente:

- leer el contenido que devuelve el servidor remoto

Eso puede ser parte del ataque.
Pero no es el único interés.

En algunos escenarios, al atacante le alcanza con que el backend:

- haga la request
- alcance cierto host
- pegue a un endpoint interno
- valide la existencia de algo
- dispare una interacción
- produzca un efecto lateral
- confirme que cierta ruta responde

### Idea importante

SSRF no es solo exfiltración.
También puede ser:
- descubrimiento
- pivot
- interacción no autorizada
- o activación de acciones internas

---

## Se parece a “hacer navegar al backend”

Una forma intuitiva de explicarlo es esta:

> en vez de dejar que el atacante navegue tu red con su propio cliente, le prestás el navegador del servidor.

Claro que no es literalmente un navegador.
Pero la idea mental sirve:

- el backend pasa a ser el que resuelve
- el backend pasa a ser el que conecta
- el backend pasa a ser el que confía
- el backend pasa a ser el que ve la respuesta

### Idea útil

Eso ayuda a entender por qué SSRF es tan poderoso:
porque el actor que hace la request no es el usuario externo, sino tu propio servidor.

---

## Features que suelen abrir esta superficie

Aunque en los próximos temas iremos bajando casos, conviene ya tener un radar general.

SSRF suele aparecer alrededor de funcionalidades como:

- importar datos desde URL
- previsualizar enlaces
- descargar archivos remotos
- procesar imágenes remotas
- webhooks salientes
- callbacks configurables
- scrapers
- validadores de URL o de dominio
- fetchers de contenido
- integraciones donde el usuario define destino
- conectores “genéricos” a endpoints remotos
- proxies, pasarelas o herramientas de diagnóstico

### Idea importante

Si una funcionalidad “hace una request hacia algún lugar que no era 100% fijo y controlado por la app”, ya merece sospecha.

---

## No todo SSRF se ve igual en el código

Otra razón por la que este tema se subestima es que no siempre aparece como algo obvio tipo:

```java
restTemplate.getForObject(urlDelUsuario, String.class)
```

A veces la influencia del usuario está más escondida, por ejemplo en:

- un dominio resuelto por configuración
- un callback guardado en base
- una redirección seguida automáticamente
- un identificador que se traduce a URL
- una plantilla donde el usuario aporta una parte del host
- una ruta compuesta a partir de datos externos

### Idea útil

El código vulnerable a SSRF no siempre “grita URL libre”.
A veces hay que seguir la cadena de construcción del destino.

---

## SSRF y confianza excesiva en “solo validamos que exista”

Otro patrón frecuente es este:

- “solo hacemos la request para verificar que la URL exista”
- “solo probamos que responda”
- “solo traemos metadata”
- “solo generamos preview”
- “solo chequeamos que el callback esté vivo”

Eso puede sonar inocente.
Pero sigue implicando que el backend:

- resuelve
- conecta
- y alcanza un destino

### Idea importante

Aunque el objetivo funcional sea pequeño, la superficie de red y confianza puede ser grande igual.

---

## No hace falta imaginar un exploit ultra sofisticado para que importe

A veces SSRF se presenta como algo tan avanzado que parece lejano del día a día.
Eso también es una trampa mental.

Muchas veces empieza en una funcionalidad bastante normal:

- el usuario pega una URL
- el sistema genera un preview
- importa un avatar
- descarga un CSV
- valida un webhook
- consulta una imagen remota
- “prueba conexión” a un servicio externo

### Idea útil

SSRF suele nacer más de features convenientes que de features obviously peligrosas.

---

## Pensar en confianza saliente, no solo confianza entrante

Esto conecta con una idea más profunda.

En seguridad backend solemos pensar mucho en:

- requests entrantes
- autenticación
- autorización
- validación de input

SSRF obliga a pensar algo adicional:

- ¿qué confianza tiene el backend cuando sale hacia otros sistemas?
- ¿qué destinos considera aceptables?
- ¿qué rutas internas podría tocar sin querer?
- ¿qué permisos de red está heredando?

### Idea importante

No alcanza con endurecer entrada.
También hay que diseñar con cuidado la **capacidad de salida** del backend.

---

## SSRF no es solo HTTP en sentido estrecho

En el día a día muchas veces se manifiesta vía HTTP o HTTPS.
Pero conceptualmente la preocupación es más amplia:

- el servidor conectándose a destinos no suficientemente controlados
- resolviendo hosts o rutas no confiables
- usando su posición de red para interactuar con algo que no debería

### Idea útil

Aunque empecemos pensándolo en URLs y requests web, la intuición correcta es más general:
**el backend actuando como cliente hacia destinos influenciados por el atacante**.

---

## Qué señales deberían prenderte alarmas

Hay frases o features que merecen sospecha inmediata, por ejemplo:

- “acepta una URL”
- “importa desde enlace”
- “descarga recurso remoto”
- “verifica callback”
- “prueba conexión”
- “consulta endpoint externo configurado por usuario”
- “renderiza preview”
- “scrapea metadata”
- “sigue redirects”
- “el usuario define host o subdominio”
- “la app reenvía requests a otro lado”

### Idea importante

No todo eso será vulnerable.
Pero todo eso justifica una revisión de SSRF.

---

## Qué deberías empezar a preguntarte desde ahora

Aunque este tema es solo introductorio, ya conviene adoptar algunas preguntas guía:

- ¿qué requests salientes hace mi backend?
- ¿cuáles de ellas dependen de input del usuario?
- ¿quién define el destino?
- ¿qué tan fijo o variable es?
- ¿qué red puede alcanzar ese proceso?
- ¿qué servicios internos podría tocar?
- ¿qué pasa si el destino redirige?
- ¿qué validaciones existen antes de conectar?
- ¿qué información devuelve la app al usuario sobre esa request?
- ¿qué tan costoso sería que el backend actuara como explorador de red por cuenta ajena?

### Regla sana

Si todavía no podés contestar estas preguntas, ya tenés una buena razón para seguir investigando.

---

## Qué conviene revisar en una app Spring

Cuando revises introducción a SSRF en una app Spring, mirá especialmente:

- uso de `RestTemplate`, `WebClient`, `HttpClient`, `URLConnection` o clientes similares
- features que aceptan URLs o hosts
- callbacks configurables
- previews, scrapers o importadores
- descarga de archivos remotos
- seguimiento automático de redirects
- construcción dinámica de endpoints
- configuración multi-tenant que arma destinos
- conectividad interna que el backend hereda por infraestructura
- cuánto feedback recibe el usuario sobre lo que pasó con la request saliente

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- destinos salientes más fijos y explícitos
- menos features “genéricas” que aceptan cualquier URL
- mejor claridad sobre qué requests hace el backend y por qué
- menos confianza implícita en recursos remotos dados por usuarios
- conciencia de que la posición de red del servidor importa
- sospecha sana frente a funciones de preview, importación y callbacks

---

## Señales de ruido

Estas señales merecen revisión rápida:

- el usuario puede definir destinos remotos con mucha libertad
- el equipo ve “hacer una request saliente” como algo inocuo por default
- nadie sabe qué partes del sistema hablan con URLs externas armadas dinámicamente
- se siguen redirects sin pensar demasiado
- previews o importadores se implementaron “rápido” y nunca se revisaron
- se cree que SSRF solo existe en casos muy sofisticados
- el backend tiene mucho alcance de red y nadie lo conecta con estas features

---

## Checklist práctico

Cuando hagas una primera revisión mental de SSRF, preguntate:

- ¿qué endpoints o jobs hacen requests salientes?
- ¿el usuario puede influir el destino directa o indirectamente?
- ¿esa influencia es total, parcial o indirecta?
- ¿qué red puede alcanzar el servidor desde ese punto?
- ¿qué servicios internos serían peligrosos si el backend los tocara?
- ¿la app sigue redirects?
- ¿la app devuelve al usuario el contenido o solo verifica algo?
- ¿qué feature “normal” podría estar abriendo esta superficie sin que el equipo la vea como riesgosa?
- ¿qué request saliente te da más miedo si la controlara un atacante?
- ¿qué parte del sistema merece revisión más profunda en el próximo paso?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué funcionalidades hacen requests salientes?
2. ¿Cuáles aceptan URL, host, callback o identificadores relacionados con destinos?
3. ¿Qué parte de ese destino puede influir el usuario?
4. ¿Qué red puede alcanzar tu backend desde ahí?
5. ¿Qué feature te parecía inocente y ahora ya no tanto?
6. ¿Dónde sospechás que podría haber seguimiento de redirects o consumo remoto poco controlado?
7. ¿Qué punto revisarías primero si quisieras encontrar riesgo de SSRF real?

---

## Resumen

SSRF aparece cuando el backend hace requests hacia destinos que el usuario puede influir y, al hacerlo, pone a trabajar su propia posición de red, confianza y permisos en beneficio del atacante.

No se trata solo de aceptar URLs “raras”.
Se trata de permitir que el servidor:

- resuelva
- conecte
- alcance
- y a veces lea o interactúe

con destinos que no deberían quedar bajo control del usuario.

En resumen:

> un backend más maduro no trata las requests salientes como una zona inocente solo porque “nosotros hacemos la llamada desde servidor”.  
> Entiende que cada feature que deja al usuario influir destinos remotos puede convertir al backend en un cliente privilegiado al servicio del atacante, y que la primera defensa real empieza por ver esa superficie con claridad antes de hablar de allowlists, validaciones o bloqueos concretos.

---

## Próximo tema

**Dónde aparece SSRF en apps reales**
