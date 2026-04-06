---
title: "Riesgos de infraestructura y reverse proxy"
description: "Cómo afectan el reverse proxy, gateways, CDNs e infraestructura intermedia a la seguridad HTTP de una aplicación Java con Spring Boot. Por qué no alcanza con revisar solo el código de la app y qué riesgos aparecen cuando headers, CORS, HTTPS, caches y rutas cambian en capas que el backend no controla del todo."
order: 122
module: "HTTP, headers y superficie del navegador"
level: "base"
draft: false
---

# Riesgos de infraestructura y reverse proxy

## Objetivo del tema

Entender qué **riesgos de seguridad aparecen en la infraestructura y en el reverse proxy** cuando una aplicación Java + Spring Boot se expone al mundo real.

La idea de este tema es cerrar el bloque de HTTP y navegador con una lección muy importante:

> la respuesta que ve el cliente no siempre es exactamente la que generó tu aplicación.

Entre el navegador y tu backend puede haber capas como:

- reverse proxy
- ingress
- API gateway
- load balancer
- CDN
- edge cache
- WAF
- proxies corporativos
- plataformas de hosting o cloud

Y todas esas capas pueden:

- agregar headers
- quitar headers
- reescribir paths
- terminar TLS
- cachear respuestas
- modificar CORS
- servir errores propios
- bloquear o redirigir requests
- cambiar el contexto que la app cree tener

En resumen:

> una app Spring puede estar “bien” en código y aun así exponer una superficie incorrecta si la infraestructura intermedia cambia lo que entra, lo que sale o cómo se interpreta.

---

## Idea clave

Cuando el backend responde, esa respuesta rara vez viaja intacta hasta el cliente sin intervención.

Muchas veces pasa por capas que toman decisiones sobre:

- transporte
- host
- protocolo
- headers
- caching
- compresión
- redirects
- seguridad
- observabilidad
- rutas
- errores
- autenticación delegada
- políticas cross-origin

La idea central es esta:

> la seguridad HTTP real de una aplicación no es solo la que diseña el código.  
> Es la que resulta de la combinación entre app, framework e infraestructura intermedia.

Eso significa que revisar solo el controlador, solo Spring Security o solo la config de la app puede ser insuficiente.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- asumir que la respuesta final es la misma que genera la app
- no saber qué capa pone o pisa headers de seguridad
- pensar que CORS vive solo en Spring y no en el proxy
- confiar en HTTPS porque “el certificado está en el edge” sin revisar la cadena completa
- no entender cómo el proxy reescribe host, scheme o IP de cliente
- dejar que caches o CDNs alteren políticas CORS o seguridad
- no distinguir entre errores servidos por la app y errores servidos por infraestructura
- creer que “el backend no expone eso” cuando otra capa sí lo hace
- olvidar que redirects, compresión, routing y rewrites también afectan seguridad

Es decir:

> el problema no es usar reverse proxy o infraestructura intermedia.  
> El problema es no modelar qué cambian y seguir razonando como si el cliente hablara directo con tu aplicación.

---

## Error mental clásico

Un error muy común es este:

### “Si en local la app responde bien, en producción debería ser lo mismo”

Eso rara vez es completamente cierto.

Porque en producción suelen existir capas que:

- agregan o quitan headers
- terminan TLS
- reescriben rutas
- bloquean métodos
- cachean respuestas
- modifican timeouts
- sirven páginas de error propias
- alteran CORS
- tocan compresión y contenido

### Idea importante

La seguridad efectiva no es la del entorno idealizado local.
Es la del recorrido completo que existe en producción.

---

## Qué hace un reverse proxy en términos de seguridad

Un reverse proxy no es solo “algo que reenvía tráfico”.

También puede ser un lugar donde se decide:

- si una request llega o no llega
- qué headers se exponen
- qué orígenes están permitidos
- si se fuerza HTTPS
- cómo se manejan redirects
- qué host ve la app
- qué respuestas se cachean
- qué errores se muestran
- qué métodos se aceptan

### Idea útil

Eso lo vuelve una pieza de infraestructura con muchísimo peso en la superficie real de seguridad HTTP.

---

## App segura + proxy flojo = superficie floja

Esta es una de las mejores formas de resumir el problema.

Podés tener en Spring:

- buenos headers
- CORS precisa
- HSTS bien pensado
- CSP razonable
- control de rutas
- sesiones seguras

y aun así terminar con exposición incorrecta si el proxy:

- elimina headers
- los pisa
- agrega defaults distintos
- responde errores sin las mismas políticas
- deja rutas más abiertas
- cachea cosas que no debía
- sirve una política CORS distinta

### Idea importante

La postura de seguridad final es la del conjunto, no la de la app aislada.

---

## Proxy bueno + app floja tampoco salva todo

También conviene evitar la ilusión opuesta.

A veces el equipo cree:

- “eso lo resuelve nginx”
- “eso lo controla el ingress”
- “el gateway ya agrega seguridad”

Eso puede ayudar.
Pero no reemplaza:

- auth correcta
- autorización real
- diseño de endpoints
- templates sanos
- manejo seguro de archivos
- buena configuración de sesión
- control de secretos

### Regla sana

La infraestructura intermedia puede endurecer mucho.
Pero no convierte una app insegura en una app segura por arte de magia.

---

## TLS y HTTPS: dónde termina de verdad

Uno de los primeros lugares donde la infraestructura cambia mucho la historia es el transporte.

En muchas arquitecturas, HTTPS termina en:

- load balancer
- reverse proxy
- ingress
- CDN
- edge gateway

### Entonces aparecen preguntas importantes

- ¿la app sabe que la request original era HTTPS?
- ¿se fuerza bien el esquema seguro?
- ¿los redirects generan URLs correctas?
- ¿HSTS sale en la capa adecuada?
- ¿qué pasa entre el proxy y la app?
- ¿hay tramos internos inseguros o mal asumidos?

### Idea importante

“Tener HTTPS” no significa automáticamente que toda la cadena de decisión sobre HTTPS esté bien modelada.

---

## Host, scheme e IP del cliente: la app puede ver otra cosa

Esto es muy importante en producción.

La app muchas veces no ve directamente:

- el host original
- el esquema original
- la IP real del cliente

sino lo que le llega a través de la infraestructura.

### Problema

Si esos datos se interpretan mal o se confían de forma incorrecta, pueden aparecer errores en:

- redirects
- generación de links absolutos
- detección de HTTPS
- rate limiting
- logs
- auditoría
- decisiones de seguridad basadas en origen o cliente

### Idea útil

La infraestructura no solo cambia respuestas.
También cambia la percepción que la app tiene de la request.

---

## Headers de seguridad: ¿quién los pone de verdad?

Este tema conecta con todo el bloque anterior.

En producción puede pasar que:

- Spring Security ponga unos headers
- el proxy agregue otros
- el CDN quite algunos
- el ingress duplique valores
- ciertas respuestas de error no pasen por la app
- una ruta estática no use el mismo pipeline que una ruta dinámica

### Resultado típico

nadie sabe con claridad:

- qué headers recibe realmente el navegador
- cuáles vienen de la app
- cuáles vienen del proxy
- cuáles se pisan
- cuáles faltan en ciertos casos

### Regla sana

No alcanza con mirar la configuración.
Hay que mirar la respuesta final que recibe el cliente.

---

## CORS y proxy: doble fuente de verdad

Este es uno de los puntos donde más se rompen las cosas.

A veces CORS se configura en:

- Spring
- gateway
- proxy
- CDN
- varias capas a la vez

### Problemas comunes

- valores contradictorios
- origins permitidos en una capa y negados en otra
- preflights que falla una capa aunque la otra esté bien
- responses sin `Vary: Origin`
- reflection del `Origin` en un lugar que el equipo ni sabía

### Idea importante

CORS es especialmente sensible a configuraciones duplicadas o mal coordinadas en infraestructura.

---

## Errores servidos por el proxy también importan

Muchos equipos revisan bien las respuestas “normales” de la app.
Pero se olvidan de:

- errores del proxy
- errores del CDN
- timeouts
- páginas de mantenimiento
- fallos del gateway
- respuestas de WAF

### ¿Por qué importa?

Porque esas respuestas pueden:

- carecer de headers de seguridad
- revelar infraestructura
- tener contenido distinto
- omitir CORS esperada
- mostrar mensajes o branding no deseados
- comportarse diferente en caching

### Idea importante

La superficie visible del sistema incluye también los errores que no genera Spring.

---

## Reescritura de paths y rutas: seguridad también cambia ahí

Otra zona delicada es cuando la infraestructura:

- agrega prefijos
- remueve prefijos
- reescribe rutas
- hace path-based routing
- expone la app bajo subpaths distintos
- divide tráfico según host o path

### Problemas posibles

- rutas internas expuestas accidentalmente
- paths admin publicados sin querer
- reglas de seguridad desalineadas con la URL real
- documentación o Actuator en lugares no previstos
- generación incorrecta de enlaces o callbacks

### Regla sana

La app no siempre sabe exactamente bajo qué forma se está publicando.
Y eso puede importar mucho para seguridad.

---

## Caching, CDN y respuestas sensibles

Este tema ya apareció con `Vary: Origin`, pero vale ampliarlo.

La infraestructura puede:

- cachear recursos públicos
- cachear respuestas con headers variables
- mezclar respuestas por path o host
- reutilizar contenido donde no debería
- retener demasiado tiempo
- servir respuestas privadas en contextos equivocados si la política es mala

### Idea importante

Los caches no son solo un tema de performance.
También pueden alterar el contexto de seguridad de la respuesta.

---

## Compresión, transformación y contenido servido

Algunas capas intermedias pueden:

- comprimir
- reescribir
- minificar
- transformar imágenes
- modificar headers relacionados al contenido
- cambiar cómo se entrega un archivo o un error

### Aunque no siempre sea un problema
sí conviene recordar que el contenido final puede no ser exactamente lo que la app generó.

### Idea útil

Si una política depende de cómo se entrega la respuesta, la infraestructura que la transforma también entra en la conversación de seguridad.

---

## Rate limiting, bloqueo y reputación IP

Muchas veces el reverse proxy o gateway decide cosas como:

- bloquear IPs
- limitar volumen
- filtrar bots
- cortar métodos
- detectar abuso

Eso puede ser muy útil.
Pero también puede generar falsas suposiciones del lado de la app.

### Por ejemplo

- la app cree que cierto abuso está cubierto
- pero en otra ruta el proxy no aplica la misma regla
- o staging/prod difieren
- o el proxy ve otra IP por cadena de proxies mal entendida

### Idea importante

Los controles perimetrales ayudan, pero deben entenderse con precisión y no como “seguridad mágica en el borde”.

---

## Reverse proxy y confianza en headers entrantes

Otro tema delicado es qué headers acepta la app como confiables para deducir cosas como:

- IP real
- protocolo original
- host real
- ruta original
- identidad delegada

### Problema

Si esa confianza está mal modelada, un actor podría explotar suposiciones incorrectas sobre el contexto original de la request.

### Regla sana

La app no debería confiar ciegamente en headers “de infraestructura” sin saber exactamente qué capa los pone y bajo qué garantías.

---

## Múltiples capas = responsabilidad difusa

Cuantas más capas haya, más fácil es que aparezca un problema organizacional:

- backend piensa que lo resuelve infra
- infra piensa que lo resuelve el framework
- frontend piensa que lo maneja CORS
- nadie revisa la respuesta real extremo a extremo

### Idea importante

Muchas fallas de seguridad HTTP en producción no nacen de mala intención técnica, sino de responsabilidad repartida y poco explícita.

---

## Lo que ves en local no incluye edge behavior

Otro recordatorio útil:

en local normalmente no ves:

- CDN
- WAF
- proxy corporativo
- LB gestionado
- terminación TLS real
- errores de edge
- caching de borde
- compresión del proveedor
- reglas del ingress

### Idea útil

Si un control o un bug depende de esas capas, el entorno local no te lo va a mostrar por sí solo.

---

## Qué conviene revisar extremo a extremo

Cuando hay infraestructura intermedia, conviene revisar no solo:

- el código Spring
- la configuración de Spring Security

sino también:

- qué headers finales ve el navegador
- qué responde el edge en errores
- quién pone CORS
- quién pone HSTS
- qué respuestas pasan por cache
- qué rutas se reescriben
- cómo se detecta HTTPS
- qué IP ve la app
- qué host real llega a negocio y logging

### Regla sana

Seguridad HTTP en producción es una revisión de cadena completa, no de componente aislado.

---

## Qué señales muestran que el proxy o la infraestructura están influyendo demasiado

Hay síntomas bastante claros:

- en local funciona y en producción “CORS se vuelve rara”
- los headers cambian según entorno
- HSTS aparece a veces sí y a veces no
- una respuesta 200 tiene una política y una 502 otra muy distinta
- redirects salen con host o esquema incorrecto
- la app cree que está en HTTP aunque el usuario ve HTTPS
- aparecen errores servidos por otra capa sin el mismo endurecimiento
- el equipo no sabe quién es dueño de la política final

### Idea importante

Cuando los síntomas son intermitentes o cambian por entorno, sospechá siempre de la infraestructura intermedia.

---

## Qué conviene revisar en una app Spring

Cuando revises riesgos de infraestructura y reverse proxy en una app Spring, mirá especialmente:

- dónde termina TLS
- qué headers de forwarding usa la app
- qué headers de seguridad agrega Spring y cuáles agrega el proxy
- cómo se maneja CORS en cada capa
- qué respuestas pasan por cache
- qué errores sirven el proxy, CDN o gateway
- si hay reescritura de paths o hosts
- qué IP, host y scheme cree ver la app
- si Actuator, docs o rutas internas quedan expuestas por routing
- si el equipo puede describir el flujo completo request/response desde el navegador hasta Spring y de vuelta

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- responsabilidades claras entre app e infraestructura
- buena visibilidad de la respuesta final real
- headers consistentes entre rutas y errores relevantes
- CORS centralizada o al menos claramente coordinada
- TLS y redirects bien modelados
- menos sorpresas entre local y producción
- menor dependencia de supuestos implícitos sobre lo que hace el proxy

---

## Señales de ruido

Estas señales merecen revisión rápida:

- nadie sabe qué capa agrega qué header
- CORS duplicada o contradictoria
- la app confía ciegamente en información de forwarding
- errores servidos por edge sin políticas equivalentes
- problemas de seguridad que “solo pasan detrás del proxy”
- redirects con host o scheme incorrectos
- respuestas cacheadas fuera de contexto
- el equipo nunca prueba la respuesta final desde el navegador o cliente real

---

## Checklist práctico

Cuando revises infraestructura y reverse proxy, preguntate:

- ¿qué capas hay entre el navegador y mi app?
- ¿dónde termina TLS?
- ¿qué headers de seguridad pone cada capa?
- ¿quién controla CORS de verdad?
- ¿qué respuestas pueden ser cacheadas?
- ¿qué errores no los genera la app sino la infraestructura?
- ¿la app interpreta correctamente host, scheme e IP original?
- ¿hay rutas o reescrituras que cambian la superficie publicada?
- ¿qué política final ve realmente el cliente?
- ¿qué parte del stack nadie está mirando porque todos asumen que la maneja otro?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Qué capas hay entre el usuario y tu backend?
2. ¿Quién termina TLS?
3. ¿Quién agrega CORS y quién agrega headers de seguridad?
4. ¿Qué error o comportamiento raro viste alguna vez solo en producción?
5. ¿Qué respuesta del sistema no la genera la app, sino otra capa?
6. ¿Qué parte de tu seguridad HTTP depende hoy de supuestos sobre el proxy que no verificaste?
7. ¿Qué revisarías primero extremo a extremo para asegurarte de que la política real coincide con la que creés tener?

---

## Resumen

La seguridad HTTP real de una app Spring no se decide solo en el código.
También la moldean reverse proxies, gateways, CDNs, caches, terminación TLS y otras capas intermedias.

Eso significa que pueden aparecer riesgos cuando la infraestructura:

- pisa headers
- rompe CORS
- sirve errores propios
- reescribe rutas
- cachea mal
- cambia host, scheme o contexto
- y nadie valida qué ve finalmente el cliente

En resumen:

> un backend más maduro no asume que la seguridad HTTP que configuró en Spring llega intacta al navegador.  
> También revisa qué hace cada capa intermedia, porque entiende que la superficie real del sistema es la que resulta de toda la cadena de publicación, y que muchas fallas de CORS, HTTPS, headers o exposición no nacen de una sola mala línea de código, sino de la suma de pequeñas decisiones repartidas entre app, proxy e infraestructura que nadie estaba mirando de punta a punta.

---

## Próximo tema

**Cómo revisar respuestas reales del sistema**
