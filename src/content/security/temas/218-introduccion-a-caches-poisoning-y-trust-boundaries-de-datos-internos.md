---
title: "Introducción a cachés, poisoning y trust boundaries de datos internos"
description: "Introducción a cachés, poisoning y trust boundaries de datos internos en aplicaciones Java con Spring Boot. Qué cambia cuando un dato cacheado deja de verse como input reciente y empieza a reutilizarse como si fuera interno, estable o confiable."
order: 218
module: "Cachés, poisoning y trust boundaries de datos internos"
level: "base"
draft: false
---

# Introducción a cachés, poisoning y trust boundaries de datos internos

## Objetivo del tema

Entender por qué las **cachés**, el **poisoning** y las **trust boundaries de datos internos** forman una categoría importante en aplicaciones Java + Spring Boot, y por qué no alcanza con pensar la caché como una optimización técnica neutral o como un espacio automáticamente confiable por vivir “del lado del sistema”.

La idea de este tema es abrir un nuevo bloque con una advertencia muy útil:

- no todo dato interno es realmente confiable
- no todo dato cacheado es solo una copia inocente
- no todo poisoning se parece a “inyectar contenido malicioso” de forma obvia
- y muchas veces el problema empieza cuando el sistema deja de tratar un dato como algo recién recibido y lo empieza a tratar como si fuera:
  - estable
  - validado
  - interno
  - o suficientemente confiable para reutilizarlo sin demasiadas preguntas

Ahí aparece este bloque.

Porque una cosa es que entre un dato desde:

- usuario
- partner
- servicio externo
- API upstream
- crawler
- webhook
- preview remota
- pipeline documental
- integración de negocio

Y otra muy distinta es que después ese dato quede:

- cacheado
- materializado
- reusado por otros componentes
- mezclado con respuestas internas
- servido una y otra vez
- o tratado como si ya no fuera input sino “estado del sistema”

En resumen:

> cachés y poisoning importan porque el riesgo no siempre está solo en el momento de entrada del dato,  
> sino en el momento en que ese dato gana una nueva vida interna, se reutiliza muchas veces y cruza una frontera de confianza que el equipo rara vez modela con suficiente cuidado.

---

## Idea clave

La idea central del tema es esta:

> una caché no solo guarda rendimiento.  
> También puede **congelar confianza**.

Eso parece una frase extraña, pero explica mucho de este bloque.

Porque cuando el sistema cachea algo, a menudo también está haciendo una apuesta implícita:

- que vale la pena reusarlo
- que no hace falta recalcularlo siempre
- que representa suficientemente bien una respuesta, un estado o un contenido
- y que otros componentes pueden tratarlo como base válida para trabajar después

### Idea importante

El problema aparece cuando esa apuesta técnica se convierte, sin querer, en una apuesta de confianza demasiado grande.

### Regla sana

Cada vez que un dato pase a caché, preguntate no solo:
- “¿me ahorra trabajo?”
sino también:
- “¿qué confianza adicional gana ahora este dato por quedar persistido y reusado adentro del sistema?”

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que una caché siempre contiene datos “más internos” y por eso más confiables
- no revisar quién pudo influir lo que terminó cacheado
- asumir que un dato ya validado una vez sigue siendo seguro para cualquier reuso posterior
- no distinguir entre optimización de performance y transformación de trust boundary
- tratar poisoning solo como un problema de HTTP cache pública y no como una familia más amplia
- olvidar que un dato cacheado puede afectar a muchos consumidores posteriores

Es decir:

> el problema no es solo cachear algo.  
> El problema es **qué pasa con la confianza y con el impacto** cuando ese algo empieza a circular adentro del sistema como si ya fuera dato interno.

---

## Error mental clásico

Un error muy común es este:

### “Eso ya viene de caché, así que debería ser más seguro que el input original”

Eso suele ser una intuición muy engañosa.

Porque todavía conviene preguntar:

- ¿quién llenó esa caché?
- ¿con qué validación?
- ¿para qué caso de uso se cacheó?
- ¿qué claves o contexto definieron ese contenido?
- ¿quién más va a consumirlo?
- ¿el dato cacheado representa realmente algo estable o solo una fotografía frágil de un contexto anterior?
- ¿qué pasa si un actor pudo influir el valor inicial que ahora otros tratarán como “interno”?

### Idea importante

La caché no purifica el dato.
Solo cambia su ubicación, su duración y muchas veces su impacto.

---

# Parte 1: Qué es una caché, vista con esta lente

## La intuición simple

Normalmente pensamos una caché como algo que:

- evita recalcular
- evita volver a pedir un recurso
- acelera respuestas
- reduce carga
- mejora experiencia

Todo eso es correcto.
Pero desde seguridad conviene sumarle otra pregunta:

> ¿qué significado gana un dato cuando deja de ser “respuesta recién producida” y pasa a ser “valor reusado desde un espacio interno del sistema”?

### Idea útil

La caché no solo cambia performance.
También cambia semántica operativa:

- duración
- alcance
- frecuencia de reuso
- visibilidad
- y a veces nivel de confianza percibido

### Regla sana

No mires la caché solo como optimización.
Mirala también como un lugar donde el sistema decide qué datos merecen vivir más y circular más.

---

# Parte 2: Qué significa “poisoning”, a nivel intuitivo

## La intuición útil

Podés pensar **poisoning** como una situación donde un actor o una condición no confiable logra influir qué queda guardado, asociado o reutilizado en una caché o mecanismo similar, y después otros consumidores tratan ese valor como si fuera representativo, válido o interno.

No hace falta imaginar todavía una técnica concreta.
Lo importante es la forma del problema:

1. un dato influido por alguien externo o por un contexto incorrecto entra al sistema
2. el sistema lo materializa o cachea
3. después otros flujos lo reutilizan con confianza extra
4. el impacto crece porque el dato ya no afecta solo al request original

### Idea importante

El poisoning no siempre consiste en “inyectar algo raro”.
Muchas veces consiste en lograr que una respuesta equivocada o un contexto incorrecto quede **fijado** y después se reutilice como si fuera verdad interna.

### Regla sana

Cuando pienses en poisoning, pensá menos en el payload llamativo y más en la pregunta:
- “¿qué quedó cacheado, para quién y con qué confianza extra?”

---

# Parte 3: Interno no es sinónimo de confiable

Este va a ser uno de los principios más importantes de todo el bloque.

Muchas veces el equipo ve algo como:

- Redis
- cache local
- cache distribuida
- resultado materializado
- resumen precomputado
- snapshot interno
- respuesta guardada en memoria

y mentalmente concluye:
- “esto ya es nuestro”
- “esto ya es interno”
- “esto ya no es input”

### Problema

Eso suele ser falso o, al menos, incompleto.

Porque el valor puede seguir siendo:

- derivado de input externo
- derivado de servicios upstream poco confiables
- resultado de una request muy contextual
- mezcla de identidades distintas
- dependiente de una clave mal diseñada
- o contaminado por una primera evaluación errónea que luego se expandió a muchos consumidores

### Idea importante

El origen del dato no desaparece porque ahora viva en una infraestructura interna.

### Regla sana

Cada vez que algo venga “de cache”, preguntate:
- “¿quién pudo influir ese valor antes de que terminara acá?”

---

# Parte 4: La caché amplifica impacto

Otra razón por la que este tema importa es que cachear no solo guarda algo:
también lo **multiplica**.

Un dato que en el request original afectaba a:

- una sola respuesta
- un solo usuario
- un solo momento

puede pasar a afectar después a:

- muchos requests
- muchos usuarios
- muchos procesos
- distintas capas del sistema
- distintas ventanas temporales

### Idea útil

La caché convierte un error local o una influencia puntual en algo mucho más persistente y compartido.

### Regla sana

Cada vez que revises un dato cacheado, preguntate no solo:
- “¿qué tan malo sería que esté mal?”
sino también:
- “¿a cuántos consumidores podría contaminar si está mal?”

### Idea importante

La caché es un amplificador de alcance, no solo un acelerador de respuesta.

---

# Parte 5: Qué son las trust boundaries de datos internos

## La intuición útil

Una **trust boundary de datos internos** aparece cuando el sistema mueve un dato desde una zona donde claramente era:

- input
- respuesta externa
- configuración editable
- contenido de usuario
- resultado de tercero

hacia otra zona donde empieza a tratarse como:

- estado interno
- dato “ya validado”
- base para otras decisiones
- entrada de pipelines posteriores
- material de cache o de precálculo
- resultado reutilizable sin demasiadas preguntas

### Idea importante

El problema no está solo en que el dato cambie de lugar.
Está en que **cambia el trato de confianza** que recibe.

### Regla sana

Prestá mucha atención cada vez que un dato deja de verse como input fresco y empieza a verse como “material interno del sistema”.

---

# Parte 6: Por qué esto se parece a otros bloques del curso

Esta continuidad importa mucho.

## Con deserialización
aprendimos que lo “interno” no siempre era realmente confiable para reconstruir objetos.

## Con archivos complejos
aprendimos que lo extraído o derivado no perdía su origen no confiable solo por quedar en disco.

## Con SSRF de segunda orden
aprendimos que una URL persistida seguía siendo una request futura, no solo un string de base.

## Con cachés y poisoning
vuelve a aparecer la misma lección:
- lo que ahora vive adentro del sistema puede seguir arrastrando la confianza frágil del punto de entrada original.

### Idea útil

Este bloque encaja perfecto con un patrón general del curso:
- cambiar de capa o de almacenamiento no vuelve automáticamente seguro a un dato.

---

# Parte 7: Qué tipos de cosas suelen quedar cacheadas y por qué importan

No estamos hablando solo de “páginas HTML cacheadas”.
En sistemas reales se cachean muchas cosas como:

- respuestas HTTP
- metadata de recursos remotos
- perfiles de usuario
- permisos o autorizaciones derivadas
- previews de enlaces
- resultados de consultas costosas
- feature flags resueltas
- reglas o configuraciones materializadas
- documentos enriquecidos
- listas calculadas
- decisiones de negocio precalculadas

### Idea importante

El riesgo no depende solo del mecanismo de caché.
También depende del tipo de verdad que el sistema cree estar guardando ahí.

### Regla sana

Cuanto más usa el sistema un dato cacheado como base para otras decisiones, más importante se vuelve revisar su frontera de confianza.

---

# Parte 8: Qué hace que una caché se vuelva delicada

Una caché se vuelve más delicada cuando se combinan cosas como:

- input influenciable
- claves demasiado amplias o ambiguas
- mezcla de contexto entre usuarios o casos de uso
- validación incompleta
- reutilización por muchos consumidores
- larga duración
- poca trazabilidad de quién pobló el valor
- alto impacto si el valor es incorrecto

### Idea útil

No hace falta una técnica sofisticada para que exista poisoning.
A veces alcanza con un diseño flojo de:
- clave
- alcance
- o confianza implícita.

### Regla sana

Cada vez que una caché parezca “simple”, revisá:
- quién la llena,
- cómo se identifica el valor,
- y quién lo reutiliza después.

---

# Parte 9: La clave de caché también es una frontera de seguridad

Este matiz es muy importante y suele subestimarse.

Desde producto, la clave de caché parece un detalle técnico.
Pero desde seguridad decide mucho:

- qué requests comparten valor
- qué contexto se conserva
- qué contexto se pierde
- qué usuarios o actores terminan viendo el mismo resultado
- y qué tan fácil es que algo influido en un contexto termine contaminando otro

### Idea importante

La clave no solo optimiza lookup.
Define la **frontera de aislamiento** entre respuestas o resultados cacheados.

### Regla sana

Cuando revises una caché, preguntate:
- “¿qué información del contexto se usa para separar valores?”
y también:
- “¿qué información importante se está perdiendo en esa clave?”

---

# Parte 10: Qué señales indican poisoning potencial aunque no haya “payload malicioso”

Esto también conviene dejarlo claro.

A veces el poisoning no viene de una entrada obviamente rara.
Puede venir simplemente de:

- contexto mezclado
- respuesta incompleta
- upstream poco fiable
- timing particular
- una primera request especial
- un error de clasificación
- un valor temporal que el sistema trató como estable
- un cálculo hecho con assumptions demasiado optimistas

### Idea útil

El poisoning muchas veces se parece más a:
- fijar una verdad equivocada
que a
- inyectar contenido llamativo.

### Regla sana

No busques solo valores “maliciosos”.
Buscá también valores **equivocados pero persistentemente reutilizados**.

---

# Parte 11: Qué preguntas conviene hacer desde el inicio del bloque

Cada vez que veas una caché o un valor materializado en una app Spring, conviene empezar a preguntarte:

- ¿quién llena esta caché?
- ¿qué parte del valor pudo ser influida por input externo o por un contexto frágil?
- ¿qué consumidores reutilizan después esto?
- ¿qué confianza extra gana por estar cacheado?
- ¿qué separa unas respuestas de otras dentro de la clave?
- ¿qué pasaría si este valor fuera incorrecto pero persistente?
- ¿quién detectaría que el dato cacheado ya no representa lo que el sistema cree?

### Idea importante

La review buena no se queda en:
- “esto mejora performance”
Sigue hasta:
- “¿qué verdad está congelando y para quién?”

---

# Parte 12: Qué revisar en una app Spring

En una app Spring o en el ecosistema Java más amplio, conviene sospechar especialmente cuando veas:

- `@Cacheable`
- Redis
- caches locales o distribuidas
- materialized views o snapshots de negocio
- resultados enriquecidos con datos externos
- permisos o contextos derivados cacheados
- metadata remota persistida para reuso
- respuestas que pasan a considerarse “internas” una vez guardadas

### Idea útil

Si un dato cambia de “respuesta de un flujo puntual” a “valor reusado por muchos”, ya merece una revisión de trust boundary.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- claridad sobre quién puebla la caché
- claves que conservan el contexto importante
- menos sobreconfianza en datos reusados
- menor mezcla entre input externo y “estado interno”
- consumidores que entienden de dónde viene el valor
- equipos que pueden explicar qué representa exactamente ese dato cacheado y para quién

### Idea importante

La madurez aquí se nota cuando el sistema no trata la caché como un agujero negro donde los datos dejan de tener historia.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “si viene de Redis ya está validado”
- nadie sabe bien quién llenó el valor
- claves demasiado pobres o ambiguas
- el sistema reutiliza datos cacheados como base de decisiones sensibles sin revisar origen ni contexto
- se asume que lo interno ya es confiable
- nadie puede explicar qué consumidores quedan afectados si el valor cacheado está mal

### Regla sana

Si la app ya no puede contar la historia de un dato cacheado —de dónde vino, qué contexto perdió y quién lo reutiliza— probablemente la trust boundary está mal entendida.

---

## Checklist práctica

Para arrancar este bloque, cuando veas una caché o un valor materializado, preguntate:

- ¿quién lo llenó?
- ¿qué origen tiene realmente?
- ¿qué contexto conserva y qué contexto perdió?
- ¿qué consumidores lo reutilizan?
- ¿qué confianza adicional gana por estar “adentro”?
- ¿qué impacto tendría si estuviera mal pero siguiera circulando?
- ¿qué parte del sistema lo trata como si ya no fuera input?

---

## Mini ejercicio de reflexión

Tomá una caché real de tu app Spring y respondé:

1. ¿Qué dato guarda?
2. ¿Quién la puebla?
3. ¿Qué input o contexto pudo influir ese valor?
4. ¿Qué clave usa para separar casos?
5. ¿Qué otros componentes lo reutilizan después?
6. ¿Qué parte del equipo lo sigue viendo como “interno y confiable”?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Las cachés, el poisoning y las trust boundaries de datos internos importan porque el riesgo no siempre está solo en el momento en que entra un dato, sino también en el momento en que ese dato queda fijado, reusado y tratado como si fuera más confiable por el solo hecho de haber pasado a una capa interna del sistema.

La gran intuición de este inicio es esta:

- una caché no solo guarda rendimiento
- también guarda y amplifica decisiones de confianza
- el dato cacheado puede seguir arrastrando un origen frágil
- la clave de caché define aislamiento real entre contextos
- y lo interno no se vuelve seguro solo por haber cambiado de capa

En resumen:

> un backend más maduro no trata los datos cacheados como si hubieran perdido automáticamente su origen o su fragilidad por el solo hecho de vivir en Redis, memoria o cualquier otra capa interna, sino que sigue preguntando quién pudo influirlos, qué contexto conservan, qué contexto perdieron y quién los reutiliza después con confianza extra.  
> Y justamente por eso este tema importa tanto: porque abre un bloque donde la pregunta ya no es solo qué input entra, sino qué verdades parciales, frágiles o equivocadas el sistema decide congelar y redistribuir como si fueran verdades internas estables, que es donde muchas veces empieza el poisoning de verdad.

---

## Próximo tema

**Cache keys, contextos perdidos y respuestas mezcladas**
