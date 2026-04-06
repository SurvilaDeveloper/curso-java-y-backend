---
title: "Checklist mínima para detectar SSRF en code review"
description: "Una checklist breve y práctica para detectar riesgo de SSRF durante code review en una aplicación Java con Spring Boot. Qué preguntas rápidas conviene hacerse sobre destinos, redirects, DNS, workers, errores y privilegios antes de aprobar una feature con requests salientes."
order: 154
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Checklist mínima para detectar SSRF en code review

## Objetivo del tema

Tener una **checklist mínima, breve y práctica** para detectar riesgo de **SSRF** durante una **code review** en una aplicación Java + Spring Boot.

La idea de este tema es bajar todavía más a tierra el tema anterior.

La checklist amplia sirve mucho para diseño, arquitectura y revisión profunda.
Pero en el día a día también hace falta otra herramienta:

> una versión corta que te ayude a mirar un PR, un refactor o una feature nueva y decidir rápido si hay una superficie saliente que merece atención más seria.

Porque en revisión cotidiana no siempre tenés tiempo para rehacer todo el modelo mental completo.
A veces necesitás responder algo más operativo:

- ¿esto huele a SSRF?
- ¿hay una request saliente que nadie está modelando?
- ¿el destino depende de input externo?
- ¿se está usando un cliente HTTP demasiado abierto?
- ¿tengo que frenar este cambio y revisarlo mejor antes de aprobar?

En resumen:

> esta checklist mínima no reemplaza el análisis profundo,  
> pero sirve como filtro rápido para detectar cuándo una feature saliente merece una revisión de seguridad más completa.

---

## Idea clave

En code review, muchas superficies de SSRF se descubren no porque alguien haya corrido un pentest sofisticado, sino porque una persona vio a tiempo algo como:

- una URL dinámica
- un `RestTemplate` con input externo
- un `WebClient` genérico
- un “test connection”
- un preview
- un downloader remoto
- un callback configurable
- un worker que hace fetch de algo persistido

La idea central es esta:

> la mejor checklist mínima es la que te deja detectar rápidamente señales de riesgo sin necesitar reconstruir toda la arquitectura en ese mismo momento.

Eso implica hacer pocas preguntas, pero muy cargadas.

### Idea importante

No estás buscando demostrar en la review que existe una explotación completa.
Estás buscando detectar:
- “acá hay suficiente superficie saliente como para no aprobar distraídamente”.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- aprobar PRs con requests salientes “porque parecían chiquitas”
- no frenar una URL influida por usuario a tiempo
- pensar que si el código compila la discusión de seguridad puede esperar
- mirar solo la línea del cliente HTTP y no el origen del destino
- pasar por alto redirects, workers o proxies internos
- dejar que el análisis de SSRF dependa solo del reviewer más experto del equipo

Es decir:

> el problema no es no saber teoría.  
> El problema es no tener una forma rápida de detectar señales de riesgo cuando el código pasa delante de tus ojos en una review real.

---

## Error mental clásico

Un error muy común es este:

### “No veo nada raro, solo están pegándole a una URL”

Esa frase, en una review, suele ser justo la alarma.

Porque muchas superficies de SSRF se disfrazan de algo aparentemente simple:

- “solo verifican que responda”
- “solo hacen preview”
- “solo descargan un archivo”
- “solo mandan un webhook”
- “solo prueban conectividad”
- “solo llaman un endpoint configurable”

### Idea importante

En consumo saliente, el “solo” suele ser una gran forma de esconder complejidad y riesgo.

---

## Cuándo activar la checklist mínima

Conviene dispararla cada vez que en el PR aparezca algo como:

- `RestTemplate`
- `WebClient`
- `HttpClient`
- `URLConnection`
- wrappers HTTP internos
- “fetch”, “download”, “resolve”, “preview”, “webhook”, “callback”, “test”
- URLs o hosts armados dinámicamente
- workers que procesan enlaces o endpoints
- persistencia de callbacks o integraciones

### Regla sana

Si el backend va a salir a la red, ya hay motivo para activar la checklist, aunque la feature parezca pequeña.

---

## La checklist mínima

Acá va la versión corta.

### 1. ¿Quién influye el destino?
- ¿viene del usuario?
- ¿viene de un tenant?
- ¿viene de config editable?
- ¿viene de base de datos cargada desde afuera?

### 2. ¿La app usa el destino casi directo?
- ¿se pasa una URL o un host a un cliente HTTP?
- ¿se arma con fragmentos controlados externamente?

### 3. ¿Hay redirects o DNS que puedan cambiar el destino real?
- ¿se sigue redirect?
- ¿se valida solo la URL inicial?
- ¿el nombre puede resolver a otra cosa?

### 4. ¿Qué proceso hace la request?
- ¿es el request web?
- ¿un worker?
- ¿otro servicio interno?
- ¿con qué identidad o reachability corre?

### 5. ¿Qué puede ver ese proceso?
- ¿localhost?
- ¿red privada?
- ¿Actuator?
- ¿metadata?
- ¿servicios internos?

### 6. ¿Qué devuelve la feature al usuario?
- ¿contenido remoto?
- ¿errores detallados?
- ¿señales de reachability?
- ¿status o timings?

### 7. ¿Qué queda persistido o procesado después?
- ¿se guarda la URL?
- ¿se guarda el archivo?
- ¿se vuelve a usar luego?
- ¿se lo manda a otro pipeline?

### 8. ¿El cliente HTTP o wrapper es demasiado genérico?
- ¿acepta URL, método, headers o redirects casi libres?
- ¿se parece más a una navaja suiza que a un cliente específico?

### 9. ¿Hay límites claros?
- ¿timeouts?
- ¿tamaño?
- ¿retries?
- ¿presupuesto de red?

### 10. ¿La red o el despliegue contienen el daño?
- ¿hay segmentación?
- ¿egress filtering?
- ¿o el proceso puede llegar a mucho más de lo que necesita?

### Idea importante

Si varias de estas respuestas te incomodan, la review ya debería subir de nivel.

---

## Regla de decisión rápida

Una forma útil de usar la checklist es esta:

### Riesgo bajo para seguir mirando tranquilo
- destino fijo y conocido
- cliente específico
- sin input externo
- sin redirects
- proceso con poco privilegio
- poco contenido remoto
- pocos errores ricos
- límites claros

### Riesgo medio o alto, conviene frenar y revisar mejor
- destino influido por actor externo
- URL dinámica o casi dinámica
- redirects o DNS no modelados
- worker poderoso o con mucha reachability
- contenido remoto descargado o persistido
- mensajes ricos de error
- wrapper genérico
- poca contención de red

### Regla sana

No hace falta demostrar explotación para pedir más revisión.
Alcanza con detectar suficiente superficie mal explicada o poco acotada.

---

## Señales rojas en un PR

Hay ciertos olores que, en code review, deberían dispararte revisión inmediata.

### Olor 1
`restTemplate.getForObject(url, ...)` o equivalente con `url` poco claro.

### Olor 2
`webClient.get().uri(...)` con destino armado a partir de input externo.

### Olor 3
wrappers del tipo:
- `fetch(url, options)`
- `call(endpoint, method, headers, body)`

### Olor 4
nombres como:
- `PreviewService`
- `WebhookService`
- `TestConnectionService`
- `RemoteFileImportService`

### Olor 5
persistencia de:
- `callbackUrl`
- `webhookUrl`
- `endpoint`
- `targetUrl`

### Olor 6
comentarios o razonamientos del tipo:
- “solo hacemos un test”
- “solo baja metadata”
- “solo descarga una imagen”
- “solo sigue el redirect para que funcione mejor”

### Idea importante

En review, muchas veces los mejores indicadores no son los bugs obvios, sino estos patrones repetidos.

---

## Preguntas rápidas que conviene dejar en la review

Si detectás superficie saliente, no hace falta escribir un ensayo.
A veces alcanza con dejar preguntas como:

- ¿de dónde sale esta URL?
- ¿quién controla este host?
- ¿qué pasa si redirige?
- ¿esto corre en un worker distinto?
- ¿qué reachability tiene ese proceso?
- ¿hay límites de tamaño y timeout?
- ¿esto devuelve errores ricos?
- ¿necesitamos realmente tanta flexibilidad?
- ¿hay segmentación o egress que lo contenga?
- ¿este wrapper no quedó demasiado genérico?

### Regla sana

Una buena review de seguridad no siempre bloquea de inmediato.
A veces abre justo la pregunta que nadie se estaba haciendo.

---

## Cómo distinguir “esto merece revisión profunda” de “esto está bien”

No toda request saliente es automáticamente preocupante.
La checklist mínima sirve justamente para separar.

### Menos preocupante
- proveedor fijo
- host fijo
- cliente específico
- sin input externo
- sin redirects
- sin persistencia rara
- con pocos privilegios
- límites claros

### Más preocupante
- destino configurable
- preview o importación
- callback por tenant
- test connection
- downloader remoto
- worker con mucha reachability
- errores técnicos ricos
- proxy interno o servicio intermedio

### Idea importante

La checklist mínima no busca etiquetar todo como crítico.
Busca detectar rápido dónde conviene gastar más atención.

---

## Qué hacer si la checklist “da mal”

Si varias respuestas salen mal, no hace falta improvisar.
Podés pasar al análisis más completo del tema anterior y revisar bloques como:

- destino
- parseo
- DNS
- redirects
- worker
- identidad
- contenido remoto
- logging
- budgets
- red
- persistencia

### Regla sana

La checklist mínima funciona bien como puerta de entrada hacia una revisión más profunda, no como sentencia final absoluta.

---

## Qué revisar en una app Spring

Cuando uses esta checklist en una app Spring, conviene mirar especialmente:

- controladores que reciben URLs, hosts o callbacks
- services que usan `RestTemplate` o `WebClient`
- wrappers HTTP compartidos
- jobs o workers que procesan URLs persistidas
- entidades con campos de endpoints remotos
- endpoints admin de prueba o validación
- servicios de preview, unfurling, download o integración

### Idea útil

En Spring, gran parte del riesgo aparece distribuido entre controller, service, worker y wrapper.
La checklist te ayuda a no mirar solo una capa.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- destinos más fijos
- clientes más específicos
- menos input externo llegando directo al cliente HTTP
- menos redirects libres
- menos errores ricos
- workers con menos privilegio
- mejor contención de red
- menos persistencia ingenua de destinos remotos

### Idea importante

Si en la review podés ver eso rápido, la feature ya transmite mucho más control.

---

## Señales de ruido

Estas señales merecen revisión rápida:

- URL dinámica poco explicada
- wrapper demasiado flexible
- feature “chica” pero con fetch remoto real
- redirects no mencionados
- worker o proxy interno en el medio
- destinos persistidos
- errores detallados devueltos al usuario
- nada de límites ni de contexto de red
- comentarios del estilo “solo para que ande”

### Regla sana

Si el PR hace que el backend salga a la red y no explica claramente el contrato de esa salida, ya hay una deuda de revisión.

---

## Checklist práctica

Cuando hagas code review de una feature con requests salientes, preguntate:

- ¿quién influye el destino?
- ¿la app usa ese destino casi directo?
- ¿hay redirects o DNS que cambien el destino real?
- ¿qué proceso hace la request?
- ¿qué red e identidad tiene ese proceso?
- ¿qué contenido entra o qué señales se devuelven?
- ¿qué se persiste?
- ¿el cliente HTTP es demasiado genérico?
- ¿hay límites claros?
- ¿la infraestructura contiene algo del daño?

---

## Mini ejercicio de reflexión

Tomá un PR real o imaginario de tu app Spring y respondé:

1. ¿Dónde aparece la request saliente?
2. ¿De dónde sale el destino?
3. ¿El reviewer promedio del equipo detectaría rápido el riesgo?
4. ¿Qué señal roja de esta checklist aparece primero?
5. ¿Qué pregunta dejarías en la review?
6. ¿Qué bloque del análisis profundo te gustaría revisar después?
7. ¿Qué cambio haría que el PR se vea mucho más seguro a simple vista?

---

## Resumen

La checklist mínima para detectar SSRF en code review sirve para identificar rápido si una feature saliente merece revisión más profunda.

No intenta reemplazar el análisis detallado.
Intenta ayudarte a ver a tiempo:

- destino influido por externos
- clientes HTTP demasiado abiertos
- redirects y DNS no modelados
- workers con demasiada reachability
- contenido remoto o errores ricos
- persistencia de confianza
- falta de contención en infraestructura

En resumen:

> un backend más maduro no espera a tener un incidente o un pentest para preguntarse si una feature saliente era peligrosa, sino que entrena su code review para detectar temprano cuándo el sistema está empezando a salir a la red con demasiada libertad, demasiada confianza o demasiado poder.  
> Y una checklist mínima bien usada vale muchísimo precisamente por eso: porque convierte intuiciones sueltas sobre SSRF en preguntas concretas, repetibles y rápidas que pueden frenar a tiempo un cambio aparentemente inocente antes de que termine consolidándose en producción como otro caso de “nadie lo vio venir” aunque las señales estaban ahí desde el primer PR.

---

## Próximo tema

**Checklist de auditoría para webhooks, previews y downloads**
