---
title: "Checklists de revisión para features con requests salientes"
description: "Cómo usar checklists de revisión para evaluar features con requests salientes en una aplicación Java con Spring Boot. Qué preguntas conviene hacerse sobre destino, DNS, redirects, contenido, privilegios, errores y red para detectar superficies de SSRF y de consumo remoto riesgoso."
order: 153
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Checklists de revisión para features con requests salientes

## Objetivo del tema

Entender cómo usar **checklists de revisión** para evaluar features con **requests salientes** en una aplicación Java + Spring Boot.

La idea de este tema es hacer una pausa práctica después de todo el bloque anterior.

Ya recorrimos muchos temas relacionados con:

- SSRF
- previews
- descargas remotas
- webhooks
- callbacks
- test connection
- redirects
- DNS
- metadata cloud
- servicios internos
- proxies
- workers
- mínimo privilegio
- segmentación de red
- trust boundaries

Eso da bastante material.
Pero también puede pasar algo normal:

- que el mapa mental se vuelva largo
- que en una code review te olvides la mitad
- que una feature nueva “parezca simple” y no recuerdes qué mirar primero
- que el equipo detecte tarde riesgos que en retrospectiva eran bastante visibles

Por eso conviene construir una herramienta más operativa:

> un checklist que te permita revisar una feature saliente de forma consistente, rápida y con buena cobertura mental.

En resumen:

> una buena checklist no reemplaza el criterio técnico,  
> pero ayuda mucho a que el análisis no dependa solo de memoria, intuición o de acordarse justo ese día del caso raro de SSRF que habías visto hace dos semanas.

---

## Idea clave

Una feature con requests salientes debería disparar siempre una revisión estructurada.

No importa tanto si se llama:

- preview
- webhook
- importación remota
- callback
- test connection
- sincronización
- connector
- downloader
- unfurling
- proxy interno
- health check de integración

La idea central es esta:

> cada vez que el backend va a resolver, conectar, descargar, reenviar o consultar algo remoto, conviene hacer una serie de preguntas repetibles.

Porque esas preguntas ayudan a detectar cosas como:

- influencia externa sobre el destino
- redirects peligrosos
- DNS engañoso
- exceso de reachability
- errores demasiado ricos
- workers demasiado poderosos
- budgets de red demasiado amplios
- contenido remoto procesado con demasiada confianza

### Idea importante

La checklist sirve para pasar de:
- “creo que esto está más o menos bien”
a
- “sé exactamente qué revisé, qué riesgos encontré y qué parte quedó pendiente o aceptada”.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- revisar una feature saliente solo por intuición
- acordarse de algunos riesgos pero olvidar otros
- mirar host y olvidar redirects
- mirar destino y olvidar el contexto del worker
- mirar SSRF y olvidar logging o budgets
- repetir discusiones similares sin un marco común
- depender de la experiencia individual de una sola persona del equipo
- no tener una forma práctica de revisar features nuevas y refactors

Es decir:

> el problema no es no saber teoría de SSRF.  
> El problema es no tener una forma sistemática de aplicar esa teoría cuando aparece una feature concreta en una app real.

---

## Error mental clásico

Un error muy común es este:

### “Esto es una request saliente bastante simple, no hace falta tanta ceremonia”

Eso suele ser el comienzo de varios problemas.

Porque muchas superficies riesgosas nacen justo en features que parecían simples, por ejemplo:

- un preview de link
- una imagen desde URL
- un “probá este endpoint”
- un callback configurable
- un downloader auxiliar
- una verificación de reachability
- un wrapper que alguien reutilizó “solo un poco”

### Idea importante

La checklist no existe porque todo sea enorme.
Existe justamente porque muchas superficies peligrosas parecen pequeñas al principio.

---

## Qué hace buena a una checklist

Una checklist útil para consumo saliente debería ser:

- corta de ejecutar
- amplia en cobertura mental
- fácil de repetir
- orientada a decisiones
- entendible por varias personas del equipo
- útil tanto en code review como en diseño

### Y, sobre todo, debería ayudarte a responder:
- ¿hay una superficie saliente real?
- ¿qué tan peligrosa es?
- ¿qué controles faltan?
- ¿qué impacto tendría si algo falla?

### Idea útil

Una checklist buena no es una lista de preguntas decorativas.
Es una forma de forzar claridad.

---

## Primer bloque: entender qué hace realmente la feature

Antes de mirar mitigaciones, conviene contestar algo básico:

- ¿qué está intentando hacer esta feature?
- ¿cuál es su caso de uso real?
- ¿por qué necesita salir a la red?
- ¿qué valor de producto aporta?
- ¿realmente necesita esa flexibilidad o estamos dándole salida de más por comodidad?

### Preguntas concretas

- ¿la feature necesita request saliente sí o sí?
- ¿qué necesidad de negocio resuelve?
- ¿qué promesa exacta hace?
- ¿es algo liviano, como un preview, o algo pesado, como una importación?
- ¿hay una forma más acotada de ofrecer el mismo valor?

### Idea importante

Muchos problemas se reducen cuando el contrato del feature se vuelve más modesto y preciso.

---

## Segundo bloque: quién influye el destino

Este es uno de los núcleos del análisis.

Conviene preguntar:

- ¿quién define el destino?
- ¿el usuario pone la URL completa?
- ¿solo controla un host, subdominio o path?
- ¿sale de una configuración persistida?
- ¿viene de un tenant, de un admin o de otro sistema?
- ¿hay partes del destino que parecen “internas” pero igual pueden variar demasiado?

### Preguntas concretas

- ¿qué parte del destino controla el actor externo?
- ¿esa influencia es directa o indirecta?
- ¿el destino se arma a partir de fragmentos?
- ¿se persiste y se usa más tarde?
- ¿la app trata ese valor como confiable demasiado pronto?

### Regla sana

Si el usuario o un actor externo influye el destino, ya entrás de lleno en el terreno de SSRF y consumo remoto sensible.

---

## Tercer bloque: cómo se interpreta el destino

Acá entran parseo, normalización y esquema.

Conviene preguntar:

- ¿se parsea antes de validar?
- ¿se normaliza?
- ¿qué esquema acepta?
- ¿qué host parseado queda de verdad?
- ¿qué puerto resulta explícito o implícito?
- ¿la validación se hace sobre estructura real o sobre texto crudo?

### Preguntas concretas

- ¿la app valida strings o valida componentes parseados?
- ¿qué esquemas son legítimos?
- ¿qué puertos son legítimos?
- ¿la allowlist se aplica sobre host real o sobre apariencia textual?
- ¿hay diferencias entre la representación validada y la que usa el cliente final?

### Idea importante

Validar antes de entender bien el destino casi siempre produce defensas frágiles.

---

## Cuarto bloque: DNS, redirects y destino final real

Muchas features parecen seguras hasta que cambia el recorrido.

Conviene preguntar:

- ¿cuándo se resuelve DNS?
- ¿se resuelve una vez o varias?
- ¿qué pasa si el hostname cambia de significado?
- ¿el cliente sigue redirects?
- ¿se revalida después de cada cambio de destino?
- ¿el destino final puede terminar en otro host, otra red o otro puerto?

### Preguntas concretas

- ¿qué destino inicial aprobamos?
- ¿qué destino final consumimos realmente?
- ¿hay redirects?
- ¿hay riesgo de DNS engañoso o de cambio entre check y use?
- ¿qué diferencia existe entre nombre aprobado e IP o servicio real consumido?

### Regla sana

Nunca cierres la revisión solo sobre la URL inicial si el flujo puede cambiar de destino en el camino.

---

## Quinto bloque: qué red y qué servicios puede ver el proceso

Acá empieza el análisis de impacto.

Conviene preguntar:

- ¿el proceso puede alcanzar localhost?
- ¿puede alcanzar redes privadas?
- ¿ve Actuator?
- ¿ve paneles internos?
- ¿ve metadata cloud?
- ¿ve sidecars o servicios auxiliares?
- ¿qué DNS internos resuelve?

### Preguntas concretas

- ¿qué reachability real tiene este proceso?
- ¿qué servicios internos quedarían expuestos si la feature se abusara?
- ¿la red está segmentada?
- ¿existe egress filtering?
- ¿hay puertos o hosts internos que nunca debió ver?

### Idea importante

El impacto de la misma SSRF cambia muchísimo según la red visible desde ese proceso.

---

## Sexto bloque: con qué identidad corre la salida

Acá entra mínimo privilegio.

Conviene preguntar:

- ¿qué identidad usa el proceso?
- ¿qué permisos de plataforma tiene?
- ¿qué secretos puede leer?
- ¿qué storage o colas puede tocar?
- ¿está sobredimensionado para lo que hace?
- ¿hereda demasiados privilegios del sistema por comodidad?

### Preguntas concretas

- ¿qué cuenta, rol o service account usa?
- ¿qué APIs de plataforma podría tocar si algo sale mal?
- ¿qué parte de sus permisos es realmente necesaria?
- ¿qué feature flexible corre en el proceso más poderoso?
- ¿sería fácil separar este flujo en un worker con menos privilegio?

### Regla sana

Toda checklist de consumo saliente debería preguntar también por identidad, no solo por URL.

---

## Séptimo bloque: qué cliente HTTP o componente hace la request

Esto conecta con wrappers, `RestTemplate`, `WebClient` y proxies internos.

Conviene preguntar:

- ¿qué cliente HTTP se usa?
- ¿es específico o demasiado genérico?
- ¿acepta URL, método y headers arbitrarios?
- ¿sigue redirects?
- ¿reintenta?
- ¿inyecta auth?
- ¿el flujo delega a otro servicio interno?
- ¿hay un proxy que amplifique alcance?

### Preguntas concretas

- ¿la request sale directamente o a través de otro servicio?
- ¿ese intermediario tiene más reachability o más identidad?
- ¿el cliente base trae defaults peligrosos?
- ¿qué parte del comportamiento viene del wrapper y cuál del llamador?
- ¿el componente parece un mini proxy más que un cliente específico?

### Idea importante

No alcanza con revisar el controller o service visible.
También importa qué brazo técnico usa para salir a la red.

---

## Octavo bloque: cuánto puede gastar la feature

Acá entran timeouts, tamaños y budgets.

Conviene preguntar:

- ¿cuánto puede tardar?
- ¿cuánto puede descargar?
- ¿cuántos redirects tolera?
- ¿cuántos retries hace?
- ¿qué tamaño máximo acepta?
- ¿qué pasa si el remoto responde lento, enorme o nunca termina bien?

### Preguntas concretas

- ¿la feature tiene presupuesto de red explícito?
- ¿el presupuesto coincide con el valor del caso de uso?
- ¿es una feature liviana con costos de crawler?
- ¿se corta temprano cuando ya no sirve?
- ¿qué parte del pipeline posterior sufre si la descarga es grande o lenta?

### Regla sana

Toda feature saliente necesita un presupuesto razonable.
No debería heredar el presupuesto más generoso del stack solo porque está disponible.

---

## Noveno bloque: qué contenido remoto entra al sistema

Cuando vuelve algo remoto, empieza otra fase del riesgo.

Conviene preguntar:

- ¿qué tipo de contenido esperamos?
- ¿cómo lo validamos?
- ¿lo guardamos?
- ¿lo transformamos?
- ¿lo parseamos?
- ¿lo mostramos?
- ¿lo reusamos después?
- ¿qué tan grande o costoso puede ser?

### Preguntas concretas

- ¿la feature solo conecta o también ingiere contenido?
- ¿qué hace con ese contenido después?
- ¿hay límites de tipo y tamaño?
- ¿hay una frontera clara entre descarga y procesamiento?
- ¿qué bibliotecas o workers adicionales lo tocarán?

### Idea importante

Muchas surfaces salientes son también surfaces de ingestión.
Y eso merece checklist propia.

---

## Décimo bloque: qué feedback le devuelve al usuario

Esto conecta con errores y reconocimiento de red.

Conviene preguntar:

- ¿qué mensajes devuelve la feature?
- ¿distingue DNS, timeout, refused, TLS, 404, 403, 200?
- ¿muestra redirects?
- ¿muestra latencias?
- ¿expone detalles de reachability?
- ¿devuelve demasiado contexto técnico?

### Preguntas concretas

- ¿qué aprendería un atacante si prueba varios destinos?
- ¿qué parte del feedback es útil para UX y cuál es útil para mapear la red?
- ¿qué debería quedar en logs internos y no en la respuesta?
- ¿la feature se parece a una sonda de red explicativa?

### Regla sana

No revises solo lo que la request hace.
Revisá también lo que la app cuenta sobre esa request.

---

## Undécimo bloque: qué queda persistido después

Muchas veces el riesgo no termina cuando la request finaliza.

Conviene preguntar:

- ¿guardamos la URL?
- ¿guardamos metadata?
- ¿guardamos el archivo?
- ¿guardamos el resultado del test?
- ¿el callback queda registrado para uso futuro?
- ¿quedan logs ricos?
- ¿la confianza se vuelve duradera?

### Preguntas concretas

- ¿qué decisión de confianza estamos persistiendo?
- ¿quién revalida eso después?
- ¿qué se reusa más tarde?
- ¿qué se conserva en logs?
- ¿ese dato podría cambiar de significado con el tiempo?

### Idea importante

Persistir algo remoto casi siempre merece una segunda mirada de seguridad.

---

## Duodécimo bloque: qué mitigaciones existen fuera del código

Acá entra infraestructura.

Conviene preguntar:

- ¿hay egress filtering?
- ¿hay segmentación?
- ¿hay menos reachability de la necesaria?
- ¿el proceso puede ver metadata, localhost o redes internas?
- ¿su red es más amplia de lo que el negocio necesita?
- ¿el daño quedaría contenido si la validación de app falla?

### Preguntas concretas

- ¿qué hosts o rangos nunca debería alcanzar este proceso?
- ¿la red hoy se los deja tocar igual?
- ¿qué parte del riesgo bajaríamos solo con segmentación?
- ¿qué proceso merece egress más chico?
- ¿qué mitigación infra sería más barata y de mayor impacto?

### Regla sana

El checklist bueno no termina en el código.
También mira si la red y el despliegue acompañan el contrato del feature.

---

## Cómo usar esta checklist sin volverte lento

No hace falta convertir cada review en un ritual eterno.
La idea práctica es:

### Paso 1
Detectar si la feature realmente hace consumo saliente.

### Paso 2
Recorrer rápido los bloques más relevantes.

### Paso 3
Profundizar en los que en ese caso particular más importan.

Por ejemplo:

- en un preview, importan mucho destino, redirects, tamaño, errores y worker
- en un webhook, importan mucho persistencia, identidad, egress y logging
- en una descarga remota, importan mucho tamaño, contenido, processing y worker
- en un test connection, importan mucho feedback de error, redirects y reachability

### Idea útil

La checklist no te obliga a profundizar igual en todo.
Te ayuda a no olvidar las dimensiones importantes.

---

## Formato mental mínimo para revisión rápida

Si querés una versión ultra breve, podés reducirlo a estas preguntas:

1. ¿Quién influye el destino?
2. ¿Qué destino real consume el backend después de parseo, DNS y redirects?
3. ¿Qué red e identidad tiene el proceso que hace la salida?
4. ¿Qué contenido entra o qué señales se devuelven?
5. ¿Qué queda persistido?
6. ¿Qué mitigaciones de código e infraestructura contienen el daño?

### Idea importante

Si no podés responder esas seis, la feature todavía merece más revisión.

---

## Qué revisar en una app Spring

Cuando revises checklists de revisión para features con requests salientes en una aplicación Spring, mirá especialmente:

- si el equipo tiene un marco repetible o improvisa cada vez
- qué features salientes existen hoy
- qué bloques del checklist están más olvidados en tu codebase
- si destino, worker, redirects y feedback suelen analizarse juntos o por separado
- si hay decisiones de confianza persistidas sin mucha revisión
- si la infraestructura acompaña o contradice el contrato de la feature

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- revisiones más consistentes
- menos decisiones implícitas
- mejor identificación de trust boundaries
- menos olvido de redirects, DNS o workers
- más claridad sobre identidad y red del proceso
- menos feedback riesgoso hacia el usuario
- mejor alineación entre producto, código y despliegue

### Idea importante

La checklist no crea seguridad por sí sola.
Pero sí crea disciplina, y la disciplina evita muchos errores repetibles.

---

## Señales de ruido

Estas señales merecen revisión rápida:

- cada feature saliente se revisa “a ojo”
- nadie pregunta por redirects o DNS
- el worker casi nunca entra en la conversación
- el logging y el feedback quedan fuera del análisis
- la infraestructura nunca se considera parte de la mitigación
- el equipo habla de “una URL” cuando hay una cadena mucho más compleja
- cada incidente revela cosas que la checklist podría haber detectado antes

### Regla sana

Si los mismos olvidos se repiten entre features distintas, ya necesitás una checklist común.

---

## Checklist práctico

Cuando revises una feature con requests salientes, preguntate:

- ¿qué necesidad de negocio justifica esta salida?
- ¿quién influye el destino?
- ¿cómo se parsea y valida?
- ¿qué cambia con DNS y redirects?
- ¿qué red puede ver el proceso?
- ¿con qué identidad corre?
- ¿qué cliente o proxy hace la request real?
- ¿qué presupuesto de tiempo y tamaño tiene?
- ¿qué contenido entra al sistema?
- ¿qué feedback se devuelve?
- ¿qué queda persistido?
- ¿qué mitigaciones de infraestructura la contienen?

---

## Mini ejercicio de reflexión

Tomá una feature saliente real de tu app Spring y respondé:

1. ¿Qué necesidad de negocio resuelve?
2. ¿Qué parte del destino controla un actor externo?
3. ¿Qué cambia entre input, destino parseado y destino final?
4. ¿Qué worker o proceso hace la request?
5. ¿Qué red e identidad tiene?
6. ¿Qué contenido entra o qué señales vuelve la app?
7. ¿Qué bloque del checklist habías mirado menos hasta ahora?

---

## Resumen

Las checklists de revisión ayudan a convertir el análisis de consumo saliente en una práctica repetible, clara y menos dependiente de memoria o intuición.

Sirven para revisar de forma estructurada cosas como:

- destino
- parseo
- DNS
- redirects
- worker
- identidad
- red
- cliente HTTP
- budgets
- contenido remoto
- feedback
- persistencia
- mitigaciones de infraestructura

En resumen:

> un backend más maduro no analiza cada feature saliente como si fuera un caso completamente nuevo que depende del olfato momentáneo de quien la revisa.  
> También usa checklists porque entiende que el consumo remoto mezcla demasiadas dimensiones de riesgo como para confiar solo en acordarse de todo a mano, y que una revisión sistemática no sirve solo para encontrar SSRF clásica, sino para detectar a tiempo cuándo una feature aparentemente pequeña empieza a abrir demasiado destino, demasiada red, demasiado contenido o demasiada confianza para el valor real que el negocio obtiene a cambio.

---

## Próximo tema

**Checklist mínima para detectar SSRF en code review**
