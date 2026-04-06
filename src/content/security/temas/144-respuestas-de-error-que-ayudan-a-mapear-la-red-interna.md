---
title: "Respuestas de error que ayudan a mapear la red interna"
description: "Cómo pensar las respuestas de error de features salientes como superficie de reconocimiento en una aplicación Java con Spring Boot. Por qué mensajes detallados sobre DNS, timeouts, certificados, redirects o puertos pueden ayudar a mapear la red interna cuando existe riesgo de SSRF."
order: 144
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Respuestas de error que ayudan a mapear la red interna

## Objetivo del tema

Entender por qué, en una aplicación Java + Spring Boot, las **respuestas de error de features salientes** pueden ayudar a **mapear la red interna** cuando existe superficie de **SSRF**.

La idea de este tema es cerrar la secuencia anterior sobre:

- previews
- descargas remotas
- callbacks
- test connection
- validaciones de reachability

con una observación muy importante:

> a veces el atacante no necesita que el backend le devuelva el contenido interno.  
> Le alcanza con que le devuelva **buenas pistas** sobre qué pudo alcanzar, qué no, cómo falló y en qué punto del recorrido falló.

Eso es especialmente relevante cuando la aplicación responde cosas como:

- “DNS no resolvió”
- “timeout al conectar”
- “conexión rechazada”
- “certificado inválido”
- “respondió 404”
- “redirigió a otro host”
- “puerto cerrado”
- “se obtuvo 200 pero el contenido no era aceptable”

Cada una de esas diferencias puede parecer puro soporte.
Pero, desde una mirada ofensiva, también puede convertirse en una señal muy útil sobre la topología y el comportamiento de la red vista por el backend.

En resumen:

> cuando una feature saliente devuelve errores muy ricos, no solo está explicando por qué algo falló.  
> También puede estar ayudando a un atacante a distinguir destinos, puertos, servicios y comportamientos internos desde la posición privilegiada del servidor.

---

## Idea clave

En muchas superficies de SSRF, el valor ofensivo no depende únicamente de:

- leer una respuesta completa
- descargar un recurso
- obtener un secreto

A veces depende de algo más simple:

- **diferenciar tipos de fallo**

Porque eso le permite al atacante aprender cosas como:

- este host existe
- este otro no resuelve
- este puerto acepta conexión
- este servicio responde, pero distinto
- aquí hay un redirect
- aquí hay TLS mal configurado
- aquí el backend llega, pero el recurso no existe
- aquí el backend ni siquiera pudo conectar

La idea central es esta:

> errores distintos significan información distinta.  
> Y, en conjunto, pueden convertirse en una forma de reconocimiento de red desde el punto de vista del backend.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- creer que el problema de SSRF solo existe si se devuelve el body interno
- subestimar el valor ofensivo de mensajes de error detallados
- devolver diagnósticos técnicos ricos por comodidad de soporte
- no distinguir entre “mensaje útil para integrar” y “mensaje útil para mapear la red”
- asumir que si la request falló entonces no hubo impacto
- ignorar diferencias entre DNS, timeout, refused, TLS error, 404 y 200
- diseñar pruebas de conectividad como si solo ayudaran al usuario legítimo

Es decir:

> el problema no es solo que el backend llegue a un destino.  
> El problema también es cuánto aprende el usuario gracias a la forma en que la app describe ese intento.

---

## Error mental clásico

Un error muy común es este:

### “Si no devolvemos el contenido del recurso interno, entonces el riesgo baja muchísimo”

Eso puede ser parcialmente cierto.
Pero sigue faltando una parte importante.

Porque incluso sin devolver el body, la app puede devolver señales como:

- alcanzable / no alcanzable
- resolvió / no resolvió
- conexión aceptada / rechazada
- timeout / respuesta rápida
- TLS válido / inválido
- redirect / no redirect
- 200 / 403 / 404 / 500

### Idea importante

Para reconocimiento de red, esas diferencias ya pueden ser extremadamente valiosas.

---

## Por qué los errores enseñan tanto

Una request saliente del backend puede fallar en muchos lugares del recorrido:

- parseo del destino
- resolución DNS
- conexión TCP
- handshake TLS
- timeout de conexión
- timeout de lectura
- redirect inesperado
- respuesta HTTP con cierto status
- tipo de contenido inválido
- tamaño excedido
- rechazo por política interna

Si la aplicación expone bien esa diferencia, el usuario aprende bastante sobre:

- si el host existe
- si se resuelve
- si el puerto responde
- si el servicio habla HTTP/HTTPS
- si el recurso vive detrás de auth
- si el backend está más cerca o más lejos de ese destino
- si el destino se comporta como un servicio real o como un host caído

### Idea útil

En términos ofensivos, un buen mensaje de error es a veces una pequeña radiografía de lo que la red interna hizo frente a esa request.

---

## DNS no resuelve vs conexión rechazada

Este contraste ilustra muy bien el problema.

Si la app distingue entre:

- “no resolvió DNS”
y
- “resolvió, pero la conexión fue rechazada”

entonces ya está revelando dos cosas diferentes:

### Primer caso
- el backend no pudo encontrar el host

### Segundo caso
- el backend sí encontró un destino, pero al intentar entrar el puerto o servicio rechazó la conexión

### Idea importante

La mera diferencia entre esos errores ya ayuda a separar:
- host inexistente
de
- host existente con servicio no disponible o cerrado

Y eso es oro para reconocimiento.

---

## Timeout vs rechazo inmediato

Otra distinción muy útil para un atacante.

### Timeout
puede sugerir cosas como:
- ruta de red alcanzada pero lenta
- firewall silencioso
- host colgado
- servicio que acepta hasta cierto punto y luego no responde
- red interna con comportamiento distinto

### Rechazo inmediato
puede sugerir:
- host alcanzable
- servicio activo en la máquina
- puerto cerrado o listener ausente
- camino de red relativamente directo

### Idea útil

Aunque la app no vea “el contenido”, el tiempo y el tipo de fallo siguen enseñando bastante sobre el destino.

---

## 404, 403 y 200 también pueden ayudar a mapear

Si la app llega a recibir respuesta HTTP, el reconocimiento se vuelve todavía más rico.

Porque distinguir entre:

- 200
- 301 / 302
- 403
- 404
- 500

puede revelar cosas como:

- el servicio existe
- el path no existe
- el recurso está protegido
- hay un frontend web
- hay un proxy o gateway en el medio
- el destino devuelve una firma o comportamiento reconocible

### Idea importante

Un simple código de estado puede ya confirmar la existencia de un servicio interno alcanzable desde el backend.

---

## TLS, certificados y errores de handshake también hablan

Otra fuente de señales muy útil viene de errores como:

- certificado inválido
- nombre no coincide
- cadena no confiable
- handshake fallido
- protocolo no compatible

Eso puede enseñar cosas como:

- el destino usa TLS
- el backend llegó a negociar algo
- el servicio detrás parece “real” y no inexistente
- hay diferencias entre servicios internos y externos
- el host está vivo aunque mal configurado

### Regla sana

Cuanto más técnico y distinguible es el error TLS, más información de infraestructura estás regalando.

---

## Redirect detectado = otra pista valiosa

Si una feature saliente te dice cosas como:

- “el endpoint redirige”
- “redirige a tal host”
- “redirige a HTTPS”
- “redirige a un login”
- “redirect loop”

ya está revelando bastante sobre el comportamiento del destino.

### Idea importante

Los redirects no solo amplían el recorrido.
También, cuando se informan con mucho detalle, enseñan mucho sobre la arquitectura del servicio alcanzado.

---

## Lo que parece “buen feedback de integración” puede ser gran feedback ofensivo

Este es uno de los puntos más delicados del tema.

Desde producto y soporte, es tentador devolver mensajes detallados porque ayudan a integrar mejor:

- “tu webhook respondió 404”
- “tu DNS no resuelve”
- “tu certificado expiró”
- “tu endpoint redirige”
- “tu puerto parece cerrado”

Eso suena útil.
Y lo es.

Pero también convierte a la aplicación en una herramienta que hace diagnóstico de red por cuenta del usuario.

### Idea importante

No toda ayuda al integrador es neutral desde seguridad.
A veces es capacidad de reconocimiento empaquetada como UX.

---

## No hace falta que el actor sea malicioso desde el primer intento

Otra observación importante:
incluso una persona que llegó al sistema por un flujo legítimo puede descubrir más de lo que debería simplemente usando el feedback de la feature.

Por ejemplo, un tenant, un admin o un integrador podría notar:

- qué hosts internos responden distinto
- qué rangos parecen accesibles
- qué errores aparecen según el destino
- qué nombres resuelven dentro del backend
- qué puertos dan timeout y cuáles dan refused

### Regla sana

No bases tu defensa en la idea de que “solo usuarios buenos verán estos mensajes”.
Diseñá pensando en el valor informativo del feedback mismo.

---

## Los tiempos también son información

No solo el texto del error importa.
También importa cuánto tarda en ocurrir.

Diferencias como:

- falla inmediato
- tarda 2 segundos
- tarda 10 segundos
- siempre corta igual
- a veces responde rápido y a veces no

pueden decir bastante sobre:

- si el backend pudo conectar
- si hubo ruta parcial
- si hay firewall silencioso
- si el servicio existe pero responde lento
- si el recurso se alcanzó pero no contestó a tiempo

### Idea importante

La latencia también es una señal de red.

---

## Test connection y respuestas ricas: combinación especialmente peligrosa

Esto conecta directamente con el tema anterior.

Una feature de “test connection” que además devuelve diagnósticos detallados se acerca mucho a una pequeña sonda de red explicativa.

No solo porque:

- intenta conectar

sino porque también:

- explica cómo falló
- distingue clases de fallo
- a veces lo hace rápido y repetible
- y puede ser usada múltiples veces contra distintos destinos

### Idea útil

El peligro no está solo en que el backend pruebe un host.
También en que te cuente bien qué aprendió al probarlo.

---

## Previews, descargas y callbacks también pueden filtrar reconocimiento

Esto no es exclusivo de los botones de prueba.

También puede pasar en:

- previews
- descarga remota de archivos
- validación de webhooks
- conectores
- importadores
- scrapers

si la respuesta al usuario incluye demasiado detalle sobre:

- por qué falló
- dónde falló
- qué tipo de fallo fue
- si alcanzó o no ciertos pasos de la conexión

### Regla sana

Toda feature saliente merece revisar no solo qué request hace, sino también qué cuenta sobre esa request.

---

## El backend ve más que el usuario, y el error lo traduce

Esta es una muy buena forma de resumir la idea.

El backend puede ver:

- localhost
- red privada
- servicios internos
- metadata endpoints
- DNS internos
- puertos auxiliares

El usuario no.
Pero la app puede traducir parte de esa visibilidad en mensajes como:

- “sí”
- “no”
- “timeout”
- “refused”
- “403”
- “404”
- “TLS fail”

### Idea importante

La respuesta de error es, muchas veces, la interfaz por la cual la red interna se vuelve parcialmente observable desde afuera.

---

## Menos detalle no significa peor producto en todos los casos

A veces el miedo del equipo es:

- “si reducimos detalles, empeora mucho la UX”

Eso puede pasar en algunos casos.
Pero muchas veces se puede buscar un equilibrio mejor entre:

- suficiente feedback para un uso legítimo
- sin convertir la feature en una herramienta demasiado expresiva para reconocimiento

### Idea útil

No se trata de devolver siempre “falló” sin más contexto.
Se trata de preguntarte:
- “¿cuánto de este detalle realmente necesita el usuario y cuánto valor adicional le regala a alguien que quiere mapear la red?”

---

## Qué preguntas conviene hacer sobre los errores de una feature saliente

Cuando revises una feature saliente, conviene preguntar:

- ¿qué errores puede devolver?
- ¿qué clases de fallo distingue?
- ¿devuelve DNS, timeout, refused, TLS, redirect, status code?
- ¿devuelve latencia o timing?
- ¿qué parte del mensaje ayuda a integrar y qué parte ayuda a mapear?
- ¿qué actor puede disparar esta feature?
- ¿cuántas veces puede hacerlo?
- ¿qué red puede ver el backend?
- ¿qué servicios internos quedarían parcialmente visibles gracias a este feedback?
- ¿qué simplificarías primero sin destruir totalmente la UX?

### Regla sana

Toda diferencia diagnóstica que la app expone debería leerse también como posible diferencia de reconocimiento.

---

## Qué revisar en una codebase Spring

En una app Spring, esta superficie suele aparecer alrededor de:

- excepciones devueltas o traducidas por `RestTemplate`, `WebClient` o wrappers
- mensajes de error de `test connection`
- respuestas de validación de webhook
- previews o descargas que devuelven detalles de fallo
- logs o respuestas de API que distinguen demasiadas clases de error
- controladores admin o endpoints de integración que serializan mensajes técnicos
- capas que convierten excepciones de red en mensajes de negocio casi textuales

### Idea útil

Si la app le devuelve al cliente la explicación técnica de por qué la conexión falló, ya tenés algo que mirar con mucha atención.

---

## Qué vuelve más sana a una feature así

Una implementación más sana suele mostrar:

- menos detalle diagnóstico innecesario
- mejor separación entre logs internos y mensajes al usuario
- menos riqueza ofensiva en el feedback
- más cuidado con distinciones de reachability
- mejor equilibrio entre UX y exposición
- más conciencia de que el error también es superficie

### Idea importante

La seguridad no siempre exige silencio total.
Pero sí exige pensar el valor informativo de cada detalle que devolvés.

---

## Qué señales de ruido deberían prenderte alarmas

Estas señales merecen revisión rápida:

- mensajes muy técnicos al usuario
- diferencia explícita entre DNS, timeout, refused y TLS
- se muestran redirects y hosts finales
- se exponen status codes internos de recursos remotos
- se informa latencia o tiempos de respuesta
- la feature puede repetirse muchas veces
- el equipo nunca miró el error como canal de reconocimiento
- el feedback ayuda más a mapear que a integrar

### Regla sana

Cuanto más informativo es el error y más libre es el destino, más probable es que estés regalando señales de red.

---

## Qué conviene revisar en una app Spring

Cuando revises respuestas de error que ayudan a mapear la red interna en una aplicación Spring, mirá especialmente:

- qué excepciones de red llegan hasta la API o UI
- qué nivel de detalle se devuelve
- si se distinguen muchas clases de fallo
- si se exponen status codes, redirects o detalles TLS
- qué features salientes permiten ver ese feedback
- cuántas veces puede ejecutarse la misma prueba
- si la aplicación corre en una red con servicios internos sensibles
- si el equipo separa bien logs internos de mensajes externos
- qué detalles podrían simplificarse sin romper del todo la usabilidad

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- mensajes más sobrios
- menos traducción literal de errores de red al usuario
- mejor separación entre observabilidad interna y feedback externo
- menos detalles sobre reachability
- menos valor ofensivo en la respuesta
- más conciencia de que el error también expone información

---

## Señales de ruido

Estas señales merecen revisión rápida:

- “DNS no resolvió”, “puerto cerrado”, “certificado inválido” y similares expuestos tal cual
- status y detalles del host remoto visibles para el usuario
- tiempos de respuesta incluidos en el feedback
- diagnósticos muy ricos para cualquier destino configurable
- features repetibles que combinan salida de red + error detallado
- nadie se preguntó cuánto ayuda eso a mapear la red interna

---

## Checklist práctico

Cuando revises este tema, preguntate:

- ¿qué diferencias de error devolvemos hoy?
- ¿qué puede inferir un usuario con ellas?
- ¿qué features permiten disparar esos errores?
- ¿qué red ve el backend desde ahí?
- ¿qué servicios internos quedarían más visibles gracias a este feedback?
- ¿qué parte del mensaje es realmente necesaria?
- ¿qué parte solo está por comodidad de soporte?
- ¿qué debería quedar en logs internos y no en la respuesta?
- ¿qué simplificación tendría mejor relación entre UX y reducción de reconocimiento?
- ¿qué endpoint revisarías primero porque combina destinos libres con errores demasiado ricos?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué feature saliente devuelve errores más detallados?
2. ¿Qué clases de fallo distingue hoy?
3. ¿Qué aprende un usuario si compara esos errores entre varios destinos?
4. ¿Qué parte del feedback iría mejor a logs internos?
5. ¿Qué servicio interno te preocuparía que pudiera ser inferido por estas diferencias?
6. ¿Qué flujo puede repetirse muchas veces con poco costo?
7. ¿Qué cambio harías primero para bajar el valor ofensivo del feedback sin volverlo inútil?

---

## Resumen

Las respuestas de error de features salientes pueden ayudar a mapear la red interna incluso cuando la app no devuelve contenido sensible del recurso remoto.

Eso pasa porque las diferencias entre:

- DNS
- timeout
- refused
- TLS
- redirect
- 200 / 403 / 404 / 500
- y hasta la latencia

ya contienen bastante información sobre qué pudo alcanzar el backend y cómo se comportó el destino.

En resumen:

> un backend más maduro no se limita a pensar si una request saliente “tuvo éxito o no” y tampoco asume que mientras no devuelva el body interno no hay demasiado riesgo.  
> También revisa cuánto de la topología, accesibilidad y comportamiento de su propia red está traduciendo a mensajes de error o diagnósticos visibles para otros actores, porque entiende que en SSRF el reconocimiento no siempre llega por una gran exfiltración, sino muchas veces por pequeñas diferencias de error bien contadas, repetidas y observadas desde afuera hasta que la red interna deja de ser opaca y empieza a parecer un mapa.

---

## Próximo tema

**Logs de requests salientes sin filtrar secretos**
