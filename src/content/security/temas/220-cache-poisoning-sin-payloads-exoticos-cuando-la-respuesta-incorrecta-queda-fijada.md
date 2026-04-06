---
title: "Cache poisoning sin payloads exóticos: cuando la respuesta incorrecta queda fijada"
description: "Cómo entender cache poisoning sin payloads exóticos en aplicaciones Java con Spring Boot. Por qué muchas veces el problema no es una entrada llamativa, sino una respuesta incorrecta o demasiado contextual que el sistema fija y reutiliza como si fuera estable."
order: 220
module: "Cachés, poisoning y trust boundaries de datos internos"
level: "base"
draft: false
---

# Cache poisoning sin payloads exóticos: cuando la respuesta incorrecta queda fijada

## Objetivo del tema

Entender por qué mucho **cache poisoning** en aplicaciones Java + Spring Boot no aparece como un caso llamativo de “payload malicioso raro”, sino como algo bastante más cotidiano:

- una respuesta incorrecta
- una respuesta incompleta
- una respuesta demasiado contextual
- una primera evaluación equivocada
- o un valor derivado de un momento especial

que el sistema decide **cachear** y luego reutilizar como si fuera una verdad estable.

La idea de este tema es continuar directamente lo que vimos sobre:

- cachés
- trust boundaries internas
- cache keys
- contextos perdidos
- respuestas mezcladas

Ahora toca dar un paso más.

Ya entendimos que una parte grande del problema puede estar en la **key** y en qué contextos se pierden.
Pero incluso cuando la key parece razonable, todavía puede haber otra falla importante:

> el sistema cachea una respuesta que, por su naturaleza, nunca debió tratarse como verdad durable ni compartible.

Y esto importa mucho porque, en la práctica, muchos equipos imaginan poisoning como algo así:

- input muy raro
- header extraño
- parámetro sorprendente
- valor obviamente malicioso
- cadena exótica que “contamina” la caché

Eso existe.
Pero deja afuera una familia de casos mucho más frecuente.

En resumen:

> el cache poisoning sin payloads exóticos importa porque muchas veces no hace falta inyectar nada raro para romper la caché; alcanza con lograr que el sistema congele una respuesta equivocada, parcial o excesivamente contextual y después la reutilice como si fuera una verdad general del sistema.

---

## Idea clave

La idea central del tema es esta:

> una caché puede quedar envenenada no solo por un valor “malicioso”,  
> sino también por una respuesta **incorrecta para ser reutilizada**.

Eso cambia mucho la intuición del problema.

Porque una cosa es pensar:

- “alguien metió algo extraño en la caché”

Y otra muy distinta es pensar:

- “el sistema tomó una respuesta perfectamente normal en su contexto original, pero equivocada para reutilizar después, y la fijó como si fuera estable”

### Idea importante

El poisoning muchas veces no entra disfrazado de ataque raro.
Entra disfrazado de **respuesta válida en el momento equivocado**.

### Regla sana

Cada vez que vayas a cachear algo, preguntate no solo:
- “¿esta respuesta salió bien?”
sino también:
- “¿esta respuesta merece convertirse en verdad reutilizable?”

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que solo hay poisoning cuando aparece un payload extravagante
- no revisar si la respuesta cacheada es demasiado contextual
- asumir que “si el endpoint respondió 200, ya es cacheable”
- no distinguir entre respuesta correcta para un request y respuesta correcta para reuso
- tratar como estable un valor calculado bajo condiciones demasiado particulares
- no ver que el sistema puede fijar accidentalmente una mentira operativa sin que nadie haya “inyectado” nada raro

Es decir:

> el problema no es solo qué valor entra.  
> El problema también es **qué clase de respuesta el sistema decide inmovilizar y redistribuir**.

---

## Error mental clásico

Un error muy común es este:

### “No veo ningún payload raro, así que acá no debería haber poisoning”

Eso suele ser una mala intuición.

Porque todavía conviene preguntar:

- ¿la respuesta dependía de un contexto muy particular?
- ¿era incompleta?
- ¿era provisional?
- ¿venía de un upstream frágil?
- ¿era una respuesta de error tratada como verdad?
- ¿era una primera carga todavía no estable?
- ¿era correcta solo para ese actor, sesión o momento?

### Idea importante

La ausencia de una entrada llamativa no elimina el riesgo de que el sistema fije una respuesta equivocada.

---

# Parte 1: Qué significa “respuesta incorrecta queda fijada”

## La intuición simple

Podés pensar este problema así:

1. llega un request o se ejecuta un cálculo
2. el sistema produce una respuesta que, en ese contexto puntual, puede parecer razonable o al menos posible
3. esa respuesta queda cacheada
4. luego otros consumidores la reciben como si fuera representación estable de la verdad

### Idea útil

La falla no está siempre en la generación inmediata de la respuesta.
Muchas veces está en la decisión de **persistirla para reuso**.

### Regla sana

No todo lo que puede devolverse una vez debería reutilizarse muchas veces.

---

# Parte 2: Respuesta correcta localmente, incorrecta globalmente

Este es uno de los aprendizajes más importantes del tema.

Una respuesta puede ser correcta para:

- un request
- un usuario
- una sesión
- un tenant
- un estado intermedio
- un momento de fallback
- una degradación temporal

y aun así ser incorrecta como valor compartido de caché.

### Idea importante

Lo que era “aceptable ahora” no siempre es “verdadero para todos después”.

### Regla sana

Diferenciá siempre entre:
- corrección local para el request
y
- validez global para reuso.

---

# Parte 3: El poisoning también puede venir de errores, no solo de abuso

Otra razón por la que este tema importa es que no siempre hace falta una intención maliciosa clara.
Puede bastar con:

- un upstream que respondió raro
- una primera carga incompleta
- un timeout parcial
- una degradación de servicio
- una decisión de fallback
- un estado transitorio del recurso
- un dato desactualizado
- una respuesta armada con contexto insuficiente

### Idea útil

La caché puede convertir un problema momentáneo en una verdad persistente.

### Regla sana

Cada vez que una respuesta venga de un camino de error, fallback o estado parcial, preguntate si realmente debería entrar en caché.

### Idea importante

Un problema operativo chiquito puede volverse un problema sistémico si la caché lo inmoviliza.

---

# Parte 4: HTTP 200 no significa “cacheable sin pensar”

Esta simplificación es muy común.

A veces el equipo ve:

- status 200
- cuerpo bien formado
- respuesta técnicamente válida

y concluye:
- “si salió bien, la cacheamos”

Eso es demasiado débil.

Porque todavía importan preguntas como:

- ¿era una respuesta específica de ese actor?
- ¿venía de un fallback?
- ¿faltaba información?
- ¿era un estado provisional?
- ¿dependía de headers o contexto que no van a preservarse?
- ¿representa realmente una verdad estable del recurso?

### Idea importante

La cacheabilidad no la define solo el éxito técnico del response.
La define también su **estabilidad semántica**.

### Regla sana

No hagas depender la decisión de cachear solo del status code.

---

# Parte 5: Fallbacks y degradaciones: una fuente muy subestimada de poisoning

Esto aparece muchísimo en sistemas reales.

El sistema puede responder algo razonable para no romper UX:

- valor por defecto
- contenido mínimo
- respuesta parcial
- “sin datos por ahora”
- una vista degradada
- una imagen placeholder
- un resultado vacío
- una traducción fallback

Todo eso puede ser totalmente válido como respuesta momentánea.

### Problema

Si eso queda cacheado como si fuera la representación normal del recurso, el fallback deja de ser temporal y se convierte en verdad persistente.

### Idea útil

La caché puede transformar estrategias de resiliencia en estrategias de contaminación.

### Regla sana

Cada vez que uses fallback o degradación, revisá explícitamente si ese camino debe o no poblar caché.

---

# Parte 6: Respuestas vacías también pueden envenenar

Otra trampa fuerte: pensar que el poisoning requiere “más contenido”.

No siempre.
A veces basta con fijar:

- un array vacío
- un perfil sin campos
- un objeto incompleto
- una lista aún no cargada
- “not found” en un momento incorrecto
- ausencia temporal de datos

### Idea importante

Un vacío cacheado en el momento equivocado puede contaminar tanto como un valor incorrecto.

### Regla sana

No subestimes respuestas vacías, nulas o mínimas.
También pueden volverse mentiras persistentes si el sistema las reusa sin contexto.

---

# Parte 7: Primer request especial, verdad compartida después

Muchas veces el primer request que puebla la caché tiene alguna particularidad:

- llega con ciertos headers
- llega sin autenticación o con otra identidad
- ocurre durante una transición
- coincide con un upstream degradado
- viene de un crawler interno
- llega antes de que el estado esté completo
- usa un camino de fallback

### Idea útil

Si esa primera fotografía queda fijada, todos los requests posteriores heredan la verdad del primero aunque no compartan su contexto.

### Regla sana

Pensá siempre:
- “¿qué pasa si el primer poblador de esta caché ve una versión rara del mundo?”

### Idea importante

El primer hit no solo llena la caché.
También puede definir la mentira que otros van a consumir.

---

# Parte 8: Por qué esto se parece a trust boundary shifting

Este tema encaja muy bien con la lógica general del curso.

La respuesta nace en un contexto frágil, parcial o dependiente de algo externo.
Pero una vez cacheada, el sistema la trata como:

- estado interno
- snapshot válido
- base para otras decisiones
- verdad compartida

### Idea útil

Lo peligroso no es solo la respuesta.
Es el cambio de frontera de confianza que ocurre cuando esa respuesta queda “internalizada”.

### Regla sana

Cada vez que una respuesta quede materializada para reuso, preguntate:
- “¿qué confianza nueva acaba de ganar y se la merece realmente?”

---

# Parte 9: Qué señales indican poisoning aunque todo “parezca normal”

Conviene sospechar más cuando veas cosas como:

- cachear respuestas de fallback
- cachear vacíos o nulos sin mucha reflexión
- cachear resultados de upstreams inestables
- cachear antes de terminar de enriquecer un objeto
- cachear respuestas con contexto difícil de reconstruir
- usar la misma política de caché para caminos felices y caminos degradados
- asumir que todo resultado serializable ya es material reutilizable

### Idea importante

La ausencia de rareza visible no vuelve sano al valor cacheado.
A veces solo vuelve el problema más invisible.

### Regla sana

Si el sistema no distingue entre “respuesta disponible” y “respuesta digna de ser reusada”, probablemente la caché ya está sobreconfiando.

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises poisoning sin payloads exóticos, conviene preguntar:

- ¿qué tipo de respuesta se cachea?
- ¿es estable o depende de contexto frágil?
- ¿viene de camino feliz o de fallback?
- ¿puede estar incompleta?
- ¿puede estar vacía por una condición temporal?
- ¿qué pasa si esa versión del mundo queda fijada para otros consumidores?
- ¿el sistema diferencia respuestas reutilizables de respuestas solo aceptables para ese momento?

### Idea importante

La review buena no termina en:
- “la respuesta parecía válida”
Sigue hasta:
- “¿era válida para convertirse en verdad compartida?”

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- `@Cacheable` sobre métodos que también tienen paths de fallback
- caches de respuestas enriquecidas desde servicios externos
- materialización temprana de resultados parciales
- caches pobladas antes de completar validaciones o transformaciones
- reuse de vacíos, nulls o errores como si fueran resultados plenos
- equipos que cachean “todo lo que vino bien” sin clasificar semánticamente la respuesta

### Idea útil

Si la app cachea caminos degradados igual que caminos estables, ya hay una superficie fuerte de poisoning silencioso.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- distinción entre respuesta utilizable y respuesta cacheable
- menor entusiasmo por cachear fallbacks o vacíos
- clasificación mejor de estados parciales
- cuidado extra con upstreams frágiles
- equipos que entienden que el problema no es solo el valor sino la verdad que representa
- menos sobreconfianza en “200 OK = listo para caché”

### Idea importante

La madurez aquí se nota cuando la caché se usa para fijar verdades estables y no para congelar cualquier cosa que salió una vez.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- cachear caminos de error o degradación sin pensarlo
- tratar respuestas vacías como si siempre fueran representación estable
- no distinguir entre corrección local y validez para reuso
- el equipo cree que poisoning requiere payload malicioso visible
- el sistema reutiliza primeras respuestas raras como si fueran normales
- nadie puede explicar qué tipo de verdad representa realmente el valor cacheado

### Regla sana

Si el sistema cachea respuestas “aceptables por ahora” como si fueran “correctas para todos después”, probablemente ya hay poisoning silencioso en potencia.

---

## Checklist práctica

Para revisar cache poisoning sin payloads exóticos, preguntate:

- ¿qué verdad representa este valor cacheado?
- ¿es estable o contextual?
- ¿viene de camino normal o degradado?
- ¿podría estar vacío, incompleto o provisional?
- ¿qué pasa si otros consumidores lo reutilizan como si fuera universal?
- ¿qué primera respuesta rara podría poblar esta caché?
- ¿qué parte del sistema confunde “respuesta disponible” con “respuesta reusable”?

---

## Mini ejercicio de reflexión

Tomá una caché real de tu app Spring y respondé:

1. ¿Qué tipo de respuesta guarda?
2. ¿Podría venir de fallback, vacío o estado parcial?
3. ¿Qué hace que esa respuesta parezca válida localmente?
4. ¿Qué la vuelve dudosa como verdad compartida?
5. ¿Qué consumidores heredarían esa versión si queda fijada?
6. ¿Qué parte del equipo sigue pensando que poisoning necesita un payload raro?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

El cache poisoning sin payloads exóticos importa porque muchas veces no hace falta inyectar nada llamativo para romper una caché: alcanza con que el sistema fije una respuesta equivocada, incompleta, vacía o demasiado contextual y después la reutilice como si fuera una verdad estable y compartible.

La gran intuición del tema es esta:

- no todo poisoning entra como payload raro
- una respuesta localmente válida puede ser globalmente peligrosa
- los fallbacks, vacíos y estados parciales también contaminan
- 200 OK no equivale a “cacheable sin pensar”
- y la decisión crítica no es solo qué respondió el sistema, sino si esa respuesta merece convertirse en verdad reutilizable

En resumen:

> un backend más maduro no evalúa una caché solo por si el valor guardado “se ve razonable” o por si la respuesta original no contenía nada raro, sino por qué clase de verdad representa ese valor y si realmente puede sobrevivir al cambio de contexto que implica ser reutilizado por otros requests, otros usuarios u otros momentos del sistema.  
> Entiende que la pregunta importante no es solo si la respuesta estaba bien para ese request, sino si estaba bien para convertirse en estado compartido.  
> Y justamente por eso este tema importa tanto: porque muestra una de las formas más silenciosas y más frecuentes de poisoning real, la de respuestas incorrectas o provisionales que el sistema congela por costumbre, amplificando después un error local hasta convertirlo en una mentira interna que circula con mucha más confianza de la que merece.

---

## Próximo tema

**Caché de permisos, roles y decisiones de autorización: cuándo una optimización se vuelve crítica**
