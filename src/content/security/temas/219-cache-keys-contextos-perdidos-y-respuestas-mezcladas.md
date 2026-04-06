---
title: "Cache keys, contextos perdidos y respuestas mezcladas"
description: "Cómo entender el riesgo de cache keys pobres, contextos perdidos y respuestas mezcladas en aplicaciones Java con Spring Boot. Por qué muchas fallas de caché no nacen del dato cacheado en sí, sino de qué información del contexto se pierde al construir la clave."
order: 219
module: "Cachés, poisoning y trust boundaries de datos internos"
level: "base"
draft: false
---

# Cache keys, contextos perdidos y respuestas mezcladas

## Objetivo del tema

Entender por qué las **cache keys**, los **contextos perdidos** y las **respuestas mezcladas** son una superficie central en aplicaciones Java + Spring Boot cuando una caché empieza a reutilizar resultados que nunca debieron compartirse entre:

- usuarios
- permisos
- tenants
- idiomas
- regiones
- sesiones
- feature flags
- estados del negocio
- o cualquier otro contexto que el sistema necesitaba conservar para que la respuesta siguiera siendo válida

La idea de este tema es continuar directamente lo que vimos en la introducción del bloque.

Ya entendimos que:

- una caché no solo mejora performance
- también congela decisiones de confianza
- un dato cacheado puede seguir arrastrando un origen frágil
- y lo “interno” no se vuelve seguro automáticamente por vivir en Redis, memoria o una capa propia del sistema

Ahora toca mirar una de las causas más frecuentes y más traicioneras de poisoning o reuse inseguro:

> la **clave** con la que el sistema decide qué cosas son “el mismo resultado”.

Y esto importa mucho porque, en la práctica, muchísimas fallas de caché no nacen de:

- un valor obviamente malicioso
- un payload extravagante
- una corrupción espectacular

Sino de algo bastante más cotidiano:

- una key demasiado pobre
- una dimensión de contexto que se olvidó
- una suposición optimista de equivalencia
- o una decisión de diseño donde el sistema dijo “esto alcanza para identificar la respuesta” y en realidad no alcanzaba

En resumen:

> cache keys, contextos perdidos y respuestas mezcladas importan porque el riesgo muchas veces no está en el valor guardado en sí,  
> sino en que la caché deja de distinguir contextos que para el negocio y la seguridad eran muy distintos, y entonces empieza a reutilizar como si fueran equivalentes respuestas que no deberían compartir verdad, permisos ni alcance.

---

## Idea clave

La idea central del tema es esta:

> una cache key no solo optimiza búsquedas.  
> También define **qué contextos el sistema considera equivalentes**.

Eso cambia bastante la forma de revisar cachés.

Porque una cosa es pensar:

- “la key apunta rápido al valor”

Y otra muy distinta es pensar:

- “la key decide qué dimensiones del contexto sobrevivirán”
- “y todo lo que no entre en la key se perderá como frontera de aislamiento”

### Idea importante

Una key pobre no solo baja precisión técnica.
Puede romper aislamiento entre respuestas y usuarios.

### Regla sana

Cada vez que diseñes una caché, preguntate no solo:
- “¿qué identifica el valor?”
sino también:
- “¿qué contextos importantes estoy descartando al construir esta key?”

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar la cache key como un detalle de implementación menor
- quedarse solo con “ID del recurso” cuando la respuesta depende de más contexto
- olvidar permisos, tenant, locale, flags o identidad al cachear
- asumir que dos requests que miran el mismo objeto siempre merecen la misma respuesta
- no distinguir contenido base de presentación derivada por contexto
- tratar respuestas mezcladas como bugs de UX y no como fallas reales de seguridad o trust boundary

Es decir:

> el problema no es solo cachear una respuesta.  
> El problema es **con qué frontera de equivalencia** decidís hacerlo.

---

## Error mental clásico

Un error muy común es este:

### “La clave está bien porque identifica el recurso”

Eso puede ser cierto para el recurso bruto.
Pero dejar de ser suficiente para la **respuesta final** que el sistema entrega.

Porque todavía conviene preguntar:

- ¿la respuesta depende del usuario?
- ¿depende del tenant?
- ¿depende de permisos?
- ¿depende del idioma?
- ¿depende de la región?
- ¿depende de flags?
- ¿depende del estado del negocio?
- ¿depende de headers, cookies o identidad?
- ¿depende de transformaciones o filtros aplicados después?

### Idea importante

Identificar el recurso no siempre equivale a identificar la respuesta correcta para todos los consumidores.

---

# Parte 1: Qué hace realmente una cache key

## La intuición simple

Una cache key suele verse como algo así:

- un string
- una combinación de valores
- un hash
- una clave compuesta
- una identidad calculada

Desde performance, eso parece solo el “índice” que permite encontrar el valor.

Pero desde seguridad y correctness hace algo más profundo:

> define qué inputs, estados o contextos van a compartir la misma verdad cacheada.

### Idea útil

La key no solo encuentra el valor.
Decide quién lo comparte.

### Regla sana

Cada vez que mires una cache key, preguntate:
- “¿qué poblaciones de requests quedan metidas dentro de la misma bolsa?”

---

# Parte 2: Qué significa “contexto perdido”

## La intuición útil

Hay **contexto perdido** cuando una respuesta depende de cierta información, pero la key no la conserva.
Entonces la caché actúa como si esa dimensión no importara.

Ejemplos conceptuales de contexto que a veces se pierde:

- identidad del usuario
- rol o permisos
- tenant
- locale
- país
- moneda
- device
- flags activas
- visibilidad de negocio
- estado de publicación o moderación
- pertenencia a experimento o segmento

### Idea importante

El contexto perdido no desaparece de la realidad del sistema.
Solo desaparece de la key.
Y eso es suficiente para que la caché empiece a mezclar cosas que no debía.

### Regla sana

Toda dimensión de la respuesta que importe para seguridad o correctness debería, de alguna forma, sobrevivir en la estrategia de cacheo o quedar fuera de lo cacheable.

---

# Parte 3: Recurso igual no siempre significa respuesta igual

Este es uno de los aprendizajes más importantes del tema.

Dos requests pueden apuntar al mismo recurso lógico y aun así no merecer la misma respuesta cacheada.

Por ejemplo, porque la respuesta puede variar según:

- quién la pide
- qué puede ver
- cómo debe formatearse
- qué versión del contenido le corresponde
- qué capa de negocio aplica
- qué flags están activas
- qué estado interno del recurso es visible para ese actor

### Idea útil

La caché suele fallar cuando toma “mismo recurso” como sinónimo de “misma respuesta”.
Eso muchas veces es demasiado fuerte.

### Regla sana

No definas la key desde el modelo de datos solamente.
Definila también desde la semántica real de la respuesta.

---

# Parte 4: Respuestas mezcladas: qué quiere decir eso

## La intuición simple

Podés pensar **respuestas mezcladas** como situaciones donde la caché devuelve a un contexto algo que fue calculado o permitido para otro.

Eso puede implicar cosas como:

- ver contenido de otro usuario
- ver una versión con permisos más altos
- ver otro tenant
- ver otro idioma o región
- heredar una decisión antigua que ya no corresponde
- mostrar un estado administrativo a quien no debía
- combinar verdad pública y verdad privada bajo la misma key

### Idea importante

La mezcla no siempre se nota como “corrupción”.
A veces se ve como:
- respuesta rara
- inconsistencia
- UI equivocada
- dato que parece viejo
- o permiso que aparece “misteriosamente”

### Regla sana

Cada vez que una respuesta cacheada parezca cruzar contextos, sospechá primero de la key antes que del valor.

---

# Parte 5: La key como frontera de aislamiento

Este matiz conviene dejarlo bien claro.

En muchos sistemas, la cache key funciona como una especie de frontera de aislamiento lógico.
Define qué requests quedan separadas entre sí y cuáles se colapsan sobre el mismo valor.

### Idea útil

Eso la vuelve muy parecida a una policy boundary:

- separa o mezcla usuarios
- separa o mezcla tenants
- separa o mezcla permisos
- separa o mezcla verdades derivadas

### Regla sana

No diseñes la key solo para minimizar misses.
Diseñala también para preservar las separaciones que el negocio y la seguridad realmente necesitan.

### Idea importante

Una key agresiva para performance puede ser demasiado agresiva para aislamiento.

---

# Parte 6: El tenant olvidado es uno de los errores más clásicos

En sistemas multi-tenant, una de las fallas más frecuentes es esta:

- la key identifica bien el recurso
- pero no incluye el tenant
- o lo incluye de forma inconsistente
- o lo deriva de manera poco estable

### Idea útil

Cuando eso pasa, la caché deja de distinguir verdades que el negocio considera totalmente separadas.

### Regla sana

Si el tenant importa para la respuesta, debería importar para la estrategia de cacheo, no solo para la query original.

### Idea importante

Multi-tenant y cacheo mal aislado son una combinación especialmente sensible.

---

# Parte 7: Permisos y visibilidad también son contexto

Otra trampa muy común:
la key guarda:

- el ID del recurso
- o el slug
- o la query base

pero se olvida de que la respuesta cambia según:

- rol
- ownership
- visibility
- active/inactive
- estado moderado
- publicación parcial
- datos privados vs públicos

### Idea útil

El sistema termina cacheando una verdad que quizá solo era válida para cierto actor con cierta visibilidad.

### Regla sana

Si la respuesta depende de autorizaciones o visibilidad, no trates ese dato como si fuera universalmente cacheable bajo una key plana.

---

# Parte 8: Idioma, región y presentación también pueden importar más de lo que parece

A veces el equipo piensa estos contextos como “solo UX”.
Pero una respuesta puede depender de:

- idioma
- formato
- moneda
- región
- localización
- reglas comerciales por país
- contenido visible en un mercado pero no en otro

### Idea importante

Si la app no conserva esas dimensiones, la caché puede terminar mezclando no solo textos, sino también reglas y disponibilidades distintas.

### Regla sana

No subestimes las dimensiones “de presentación”.
A veces también son dimensiones de negocio y de autorización contextual.

---

# Parte 9: Feature flags, experimentos y estados derivados

Otra fuente muy moderna de contexto perdido son:

- feature flags
- experimentos
- cohorts
- segmentos
- rollout gradual
- state derivado de negocio o sesión

### Idea útil

Si la respuesta cambia por flags o segmentos pero la key no lo refleja, la caché puede congelar una versión del mundo y servírsela a quien no corresponde.

### Regla sana

Cada vez que una respuesta dependa de flags o experimentos, preguntate si esa variación vive también en la estrategia de cacheo.

### Idea importante

Una caché puede romper rollout, aislamiento y consistencia aunque el cálculo original esté perfecto.

---

# Parte 10: Qué señales indican una key demasiado pobre

Conviene sospechar especialmente cuando veas keys basadas solo en cosas como:

- ID del recurso
- slug
- path
- query sin contexto
- hash de parámetros parciales
- nombre del método
- o algún identificador que luce limpio pero pierde demasiada información real

### Idea útil

Una key limpia y elegante a veces es justamente la señal de que borró más contexto del que debía.

### Regla sana

No confundas simplicidad de la key con corrección de la equivalencia.

---

# Parte 11: Qué preguntas conviene hacer en una review

Cuando revises una caché, conviene preguntar:

- ¿qué representa realmente el valor cacheado?
- ¿qué contextos influyen esa respuesta?
- ¿cuáles de esos contextos sobreviven en la key?
- ¿qué contextos se pierden?
- ¿qué actores o requests terminan compartiendo el mismo valor?
- ¿qué pasaría si esa respuesta se mezclara?
- ¿el sistema cachea un recurso bruto o una vista ya derivada por permisos, locale o flags?

### Idea importante

La buena review no termina en “la caché pega rápido”.
Sigue hasta:
- “¿qué realidades distintas está colapsando esta key?”

---

# Parte 12: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- `@Cacheable` con keys muy simples
- caches sobre métodos que devuelven respuestas derivadas por usuario o contexto
- multi-tenant con cache sharing poco explícito
- contenido público/privado resuelto por la misma capa
- feature flags y experimentos mezclados con resultados cacheados
- datos de negocio transformados antes de cachearse
- equipos que piensan la caché solo desde performance y no desde aislamiento contextual

### Idea útil

Si el sistema cachea una respuesta ya transformada para un caso de uso concreto, la key tiene que modelar ese caso de uso, no solo el recurso de origen.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- claridad sobre qué representa cada valor cacheado
- keys que conservan contexto importante
- menos mezcla entre respuesta universal y respuesta contextual
- mejor separación entre contenido bruto y vistas derivadas
- equipos que saben explicar para quién es válido ese valor cacheado
- menor sobreconfianza en “same resource = same response”

### Idea importante

La madurez aquí se nota cuando la cache key se diseña como frontera de aislamiento y no solo como atajo de lookup.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- keys basadas solo en recurso cuando la respuesta depende de mucho más
- nadie sabe bien qué contexto se pierde al cachear
- tenants, roles o flags ausentes de la estrategia
- respuestas derivadas cacheadas como si fueran universales
- equipos que explican la key desde performance, pero no desde correctness o seguridad
- inconsistencias raras atribuidas a “cosas de cache” sin revisar frontera de equivalencia

### Regla sana

Si el sistema no puede explicar con claridad qué contextos distinguen dos respuestas, probablemente la key ya está mezclando más de lo debido.

---

## Checklist práctica

Para revisar cache keys, contextos perdidos y respuestas mezcladas, preguntate:

- ¿qué representa el valor cacheado?
- ¿de qué contextos depende?
- ¿qué parte de ese contexto vive en la key?
- ¿qué parte se pierde?
- ¿qué requests terminan compartiendo el mismo valor?
- ¿qué pasaría si ese valor se mezclara entre actores distintos?
- ¿qué dimensión del negocio o de seguridad está hoy invisibilizada por la key?

---

## Mini ejercicio de reflexión

Tomá una caché real de tu app Spring y respondé:

1. ¿Qué valor cachea exactamente?
2. ¿Qué contextos influyen esa respuesta?
3. ¿Qué usa la key hoy?
4. ¿Qué contexto importante está faltando?
5. ¿Qué consumidores terminan compartiendo el mismo valor?
6. ¿Qué mezcla sería más peligrosa en ese caso?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Las cache keys, los contextos perdidos y las respuestas mezcladas importan porque muchísimas fallas de caché no nacen del valor guardado en sí, sino de la decisión de qué contextos se consideran equivalentes y cuáles se pierden al construir la clave.

La gran intuición del tema es esta:

- la key no solo busca rápido
- la key decide aislamiento
- mismo recurso no siempre significa misma respuesta
- el contexto perdido no desaparece de la realidad, solo desaparece de la clave
- y cuando eso pasa, la caché empieza a mezclar verdades que el negocio y la seguridad necesitaban mantener separadas

En resumen:

> un backend más maduro no diseña cache keys pensando solo en performance o elegancia técnica, sino también en qué fronteras de contexto necesita preservar para que el valor cacheado siga siendo correcto, seguro y legítimo para quien lo consume.  
> Entiende que la pregunta importante no es solo si la key identifica el recurso, sino si identifica suficientemente bien la respuesta concreta que el sistema va a reutilizar después.  
> Y justamente por eso este tema importa tanto: porque muestra que una parte muy grande del poisoning y de las mezclas peligrosas no nace de valores “maliciosos” espectaculares, sino de equivalencias mal definidas, que son una de las formas más silenciosas y más frecuentes de romper aislamiento dentro de datos supuestamente internos.

---

## Próximo tema

**Cache poisoning sin payloads exóticos: cuando la respuesta incorrecta queda fijada**
