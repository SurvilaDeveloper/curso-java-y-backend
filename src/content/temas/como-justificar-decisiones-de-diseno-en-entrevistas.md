---
title: "Cómo justificar decisiones de diseño en entrevistas"
description: "Cómo defender decisiones de arquitectura y diseño backend en entrevistas, cómo explicar trade-offs con criterio, qué esperan escuchar los entrevistadores y cómo responder cuando no existe una única respuesta correcta."
order: 243
module: "Cloud, despliegue, carrera y proyecto final"
level: "intermedio"
draft: false
---

## Introducción

En entrevistas técnicas de backend, sobre todo cuando aparecen preguntas de system design o de arquitectura, mucha gente cree que lo más importante es llegar a “la solución correcta”.

Pero en la práctica suele pesar más otra cosa:

**cómo razonás y cómo justificás tus decisiones.**

Porque en problemas reales casi nunca existe una única respuesta perfecta.

Lo que suele existir es esto:

- varias opciones posibles
- contextos distintos
- restricciones diferentes
- trade-offs inevitables
- y decisiones que pueden ser razonables o malas según el caso

Por eso, cuando en una entrevista te preguntan cómo diseñarías un sistema, no te están evaluando solo por dibujar componentes.

También quieren ver si podés:

- entender el problema antes de correr a una solución
- identificar qué restricciones importan
- elegir prioridades
- justificar elecciones técnicas
- reconocer costos y riesgos
- y corregir el rumbo si cambian los supuestos

Dicho de otra forma:

**no alcanza con decir qué harías. Tenés que poder explicar por qué lo harías así y qué precio tiene esa decisión.**

De eso trata esta lección.

## Qué suelen evaluar realmente en este tipo de entrevistas

Cuando te piden diseñar algo, muchas veces el entrevistador no espera una arquitectura “de libro”.

Lo que quiere observar suele ser una combinación de cosas:

- si entendés el problema
- si hacés buenas preguntas
- si distinguís requerimientos funcionales de no funcionales
- si razonás con prioridades claras
- si conocés patrones útiles
- si sabés hablar de escalabilidad, consistencia, operación y seguridad
- si justificás decisiones con criterio
- y si podés comunicarte con orden

Eso es importante porque cambia la mentalidad.

Si vos encarás la entrevista como un examen de memoria, te trabás.

Si la encarás como una conversación de diseño, mejora muchísimo.

No tenés que actuar como alguien que recita una respuesta cerrada.

Tenés que actuar como un backend engineer que está pensando un problema con criterio profesional.

## El error más común: enumerar tecnologías sin justificar nada

Éste es probablemente el error más frecuente.

Ante una consigna, la persona arranca a listar:

- pondría microservicios
- usaría Kafka
- metería Redis
- pondría Kubernetes
- pondría un API Gateway
- usaría sharding
- agregaría observabilidad

Todo eso puede sonar técnico, pero si no está justificado, vale poco.

¿Por qué?

Porque una decisión de diseño no vale por el nombre de la herramienta.
Vale por el problema que resuelve y por el trade-off que implica.

Decir:

> usaría Redis

explica poco.

En cambio, decir algo como:

> incorporaría cache para desacoplar parte de las lecturas frecuentes del catálogo, porque el volumen de lectura es muy superior al de escritura y toleramos algo de staleness en esa vista, pero no usaría cache para stock reservado porque ahí necesito mayor precisión

muestra muchísimo más nivel.

No porque nombraste más cosas, sino porque:

- explicaste contexto
- mostraste criterio
- delimitaste alcance
- y hablaste de costo y riesgo

## Justificar una decisión siempre empieza por el contexto

No se puede justificar bien una decisión si antes no quedó claro el contexto.

Por eso, en entrevistas, una de las mejores señales de madurez es que no arrancás diseñando a ciegas.

Primero tratás de entender cosas como:

- qué tipo de sistema es
- cuál es el flujo crítico
- qué escala se espera
- qué latencia importa
- qué nivel de disponibilidad hace falta
- qué tan sensible es la consistencia
- si hay multi-tenancy
- si hay integraciones externas
- qué parte del dominio duele más
- qué restricciones de equipo o tiempo existen

Esto no es “hacer tiempo”.

Es diseño real.

Porque no es lo mismo construir:

- una API interna para un equipo chico
- un sistema de checkout
- una plataforma SaaS B2B
- un motor de reporting
- un servicio de autenticación
- o un backend para catálogo con muchísimas lecturas

Las mismas tecnologías pueden aparecer en varios casos, pero las decisiones correctas cambian muchísimo.

## Una fórmula mental muy útil para justificar

Una forma simple y muy poderosa de justificar decisiones es pensar así:

**contexto → problema → alternativas → decisión → trade-off**

Ese recorrido funciona muy bien en entrevistas.

### Contexto

Qué condiciones tiene el problema.

### Problema

Qué necesidad concreta querés resolver.

### Alternativas

Qué otras opciones existen.

### Decisión

Cuál elegís.

### Trade-off

Qué ganás y qué costo aceptás.

Esta estructura hace que tus respuestas suenen profesionales y no arbitrarias.

## Ejemplo simple de respuesta mal justificada vs bien justificada

### Respuesta floja

> Separaría todo en microservicios para que escale mejor.

Problemas de esta respuesta:

- no explica por qué el sistema necesita eso
- asume que microservicios siempre escalan mejor
- no menciona costos operativos
- no habla de límites de dominio
- no muestra ninguna evaluación real

### Respuesta mucho mejor

> No iría directo a microservicios salvo que vea límites claros en el dominio, ownership separado y necesidades de despliegue independientes. Si el sistema todavía está consolidando reglas de negocio y el equipo es chico, preferiría un monolito modular bien separado. Me da menor complejidad operativa y mantiene cambios transversales más baratos. Recién separaría servicios cuando los límites de contexto y la carga operativa lo justifiquen.

Acá ya aparece criterio real.

Se ve que entendés:

- costo de complejidad
- madurez del dominio
- tamaño del equipo
- y evolución razonable del sistema

## Qué esperan escuchar cuando hablás de trade-offs

Una entrevista de diseño mejora muchísimo cuando mostrás que entendés que toda decisión importante tiene compensaciones.

Por ejemplo:

### Cache

Puede mejorar latencia y descarga de base, pero:

- introduce invalidación
- agrega complejidad operativa
- puede exponer datos desactualizados
- y no sirve igual para todos los datos

### Microservicios

Pueden mejorar separación y autonomía, pero:

- aumentan complejidad de despliegue
- agregan observabilidad distribuida
- complican testing e integración
- y pueden ser un costo enorme si el dominio todavía no está claro

### Procesamiento asíncrono

Puede desacoplar carga y mejorar resiliencia, pero:

- introduce consistencia eventual
- obliga a pensar reintentos e idempotencia
- complica debugging
- y desplaza parte del problema a colas, workers y observabilidad

### Base relacional vs otra alternativa

Una base relacional puede dar:

- transacciones fuertes
- constraints
- joins útiles
- madurez operativa

Pero también puede traer:

- límites en ciertos patrones de escalado
- costos en consultas analíticas pesadas
- necesidad de separar workloads con el tiempo

Lo importante es esto:

**cuando hablás de trade-offs, no debilitás tu respuesta. La fortalecés.**

Porque mostrás que no estás vendiendo una herramienta como solución mágica.

## Cómo defender una decisión incluso cuando no estás 100% seguro

Esto pasa mucho.

En una entrevista, a veces no sabés exactamente qué opción conviene.

Y está bien.

Lo importante es no esconder la duda de una manera torpe ni bloquearte esperando certeza total.

Una muy buena estrategia es explicitar supuestos.

Por ejemplo:

> Si el volumen esperado es moderado y el dominio todavía está cambiando, asumiría un monolito modular. Si después vemos equipos separados, despliegues independientes y cuellos claros, reevaluaría esa decisión.

O:

> Si el flujo de pago no tolera duplicación, pondría mucho foco en idempotencia y trazabilidad de estados. Si además el proveedor externo tiene confirmaciones ambiguas, diseñaría reconciliación posterior y no confiaría solo en la respuesta síncrona inicial.

Eso muestra algo muy valioso:

**sabés decidir bajo incertidumbre sin fingir certeza absoluta.**

## Cómo responder cuando el entrevistador desafía tu diseño

En buenas entrevistas, es normal que el entrevistador te cuestione.

No necesariamente porque tu respuesta esté mal.
Muchas veces lo hace para ver cómo razonás bajo presión.

Te puede decir cosas como:

- “¿por qué no usarías microservicios desde el inicio?”
- “¿qué pasa si el tráfico se multiplica por diez?”
- “¿cómo harías rollback de esto?”
- “¿qué pasa si el proveedor externo responde dos veces?”
- “¿cómo evitás que esto rompa consistencia?”
- “¿por qué elegirías SQL y no NoSQL?”

Acá el error es ponerse a la defensiva.

Lo mejor suele ser:

1. reconocer el punto
2. aclarar el supuesto actual
3. mostrar el trade-off
4. y, si corresponde, ajustar el diseño

Por ejemplo:

> Sí, en ese escenario el diseño cambia. Mi propuesta actual asume una etapa donde priorizo simplicidad operativa. Si el tráfico creciera mucho y además aparecieran equipos con ownership claros, empezaría a separar capacidades que hoy mantendría juntas.

O:

> Tenés razón, ahí mi propuesta síncrona quedaría corta. Para ese caso movería esa parte a procesamiento asíncrono con cola e idempotencia, porque priorizaría absorción de carga por sobre respuesta inmediata.

Eso da una señal excelente.

No mostrás rigidez.
Mostrás capacidad de revisión.

## Una decisión bien justificada suele mencionar prioridades

Otra forma muy buena de justificar es dejar claro qué estás optimizando.

Porque no se puede optimizar todo al mismo tiempo.

Según el caso, podrías priorizar:

- simplicidad
- tiempo de salida
- consistencia
- latencia
- throughput
- auditabilidad
- costo operativo
- facilidad de evolución
- aislamiento entre clientes
- resiliencia ante fallos parciales

Por ejemplo:

> En esta etapa priorizaría consistencia e integridad operacional por encima de latencia extrema, porque el flujo es checkout y el costo de errores de stock o de cobro incorrecto es más grave que sumar algunos milisegundos.

O:

> Acá priorizaría simplicidad y mantenibilidad del equipo por encima de sofisticación distribuida, porque todavía no veo evidencia de que separar servicios nos dé más valor que costo.

Cuando hacés esto, tus decisiones dejan de sonar caprichosas.

## Qué pasa si hay varias respuestas razonables

Pasa todo el tiempo.

Y eso es parte del punto.

En diseño backend, dos personas buenas pueden proponer soluciones diferentes y ambas ser defendibles.

Lo que suele marcar diferencia no es tanto “acertar la única”, sino:

- si la tuya es coherente con el contexto
- si reconocés sus costos
- si sabés explicar por qué no elegiste otras opciones
- y si podrías evolucionarla cuando cambien las condiciones

Por eso conviene usar frases como:

- “en este contexto elegiría…”
- “bajo esta restricción priorizaría…”
- “una alternativa válida sería…, pero la descartaría ahora porque…”
- “si cambiara tal supuesto, reconsideraría…”

Ese lenguaje transmite madurez.

## Qué tipos de justificación suelen sonar débiles

Hay varias justificaciones que en entrevistas suelen sonar pobres.

### 1. “Porque se usa mucho” 

Popularidad no es criterio suficiente.

### 2. “Porque escala” 

Escalar qué, bajo qué patrón de carga, con qué costo, y por qué eso importa acá.

### 3. “Porque es más profesional” 

Eso no significa nada por sí solo.

### 4. “Porque así lo hacen las empresas grandes” 

Las empresas grandes tienen problemas, equipos y presupuestos distintos.

### 5. “Porque me gusta más” 

La preferencia personal no alcanza si no está conectada con el problema.

## Qué tipos de justificación suelen sonar fuertes

En cambio, suelen sonar mucho mejor razonamientos como éstos:

- “elijo esto porque reduce complejidad operativa en esta etapa”
- “acá priorizo consistencia sobre throughput”
- “esta opción encaja mejor con un equipo chico y un dominio todavía cambiante”
- “esta alternativa permite aislar mejor fallos parciales”
- “prefiero esto porque el costo de evolución futura es menor”
- “esta decisión me simplifica auditoría, rollback y operación”
- “descarto esta opción por sobreingeniería en el contexto actual”

Fijate que todas tienen algo en común:

**conectan la decisión con una consecuencia concreta.**

## Cómo estructurar una respuesta en vivo durante la entrevista

Una estructura muy práctica podría ser ésta:

### 1. Aclarar contexto

> Antes de decidir, asumiría tal volumen, tal criticidad y tal etapa del producto.

### 2. Definir prioridad principal

> En este caso priorizaría consistencia / simplicidad / throughput / aislamiento.

### 3. Proponer diseño

> Con eso en mente, diseñaría el sistema así…

### 4. Justificar

> Elijo esta opción porque…

### 5. Mostrar trade-off

> El costo de esta decisión sería…

### 6. Mencionar evolución futura

> Si el sistema creciera en tal dirección, evolucionaría hacia…

Esa secuencia da mucha claridad.

## Ejemplo completo de mini-justificación

Imaginá que te preguntan cómo diseñarías la creación de órdenes para un e-commerce.

Una respuesta con buen nivel podría sonar así:

> Asumiría que el flujo crítico es checkout y que la prioridad principal es evitar inconsistencias entre pago, orden y stock. Por eso no intentaría distribuir demasiadas decisiones al comienzo. Mantendría la creación de orden dentro de un límite transaccional claro, con reserva de stock controlada y estados explícitos para pago y fulfillment. Integraría pagos como dependencia externa idempotente y asumiría que la confirmación del proveedor puede ser ambigua, así que agregaría reconciliación posterior y trazabilidad de estados. No partiría esto en varios servicios al inicio salvo que el volumen operativo o los límites de negocio lo exigieran, porque priorizaría integridad y simplicidad operativa por encima de desacople prematuro.

Fijate lo que hace esa respuesta:

- define supuestos
- prioriza
- propone diseño
- reconoce dependencia externa
- introduce idempotencia
- habla de estados
- evita sobreingeniería
- y muestra criterio evolutivo

## Justificar bien también es comunicar bien

No alcanza con pensar bien.

Hay que poder explicarlo con claridad.

Eso implica evitar algunas cosas:

- saltar desordenadamente entre temas
- mezclar detalle bajo con visión global
- llenar la respuesta de buzzwords
- hablar demasiado rápido
- no cerrar ideas
- usar términos complejos sin conectarlos con el problema

Una comunicación fuerte en este contexto suele sentirse así:

- ordenada
- concreta
- basada en supuestos explícitos
- capaz de reconocer límites
- y orientada a decisiones, no a exhibición técnica

## Señales de madurez que suelen destacar mucho

En entrevistas de diseño, suelen destacar muy bien cosas como:

- preguntar antes de decidir
- pensar en operación además de código
- hablar de fallos y no solo del camino feliz
- reconocer cuándo algo sería sobreingeniería
- distinguir etapa actual de evolución futura
- saber cambiar de estrategia si cambian los supuestos
- defender una decisión sin tratarla como dogma

Todo eso transmite nivel profesional real.

## Cierre

Justificar decisiones de diseño en entrevistas no consiste en adivinar qué tecnología quiere escuchar el entrevistador.

Consiste en demostrar que sabés pensar como alguien que diseña sistemas de verdad.

Eso implica:

- entender contexto
- definir prioridades
- evaluar alternativas
- elegir con criterio
- explicar trade-offs
- y adaptar la solución si cambian las condiciones

Cuando hacés eso, dejás de sonar como alguien que memoriza arquitecturas.

Y empezás a sonar como alguien que puede tomar decisiones técnicas en el mundo real.

## Próximo paso

En la próxima lección vamos a meternos en otra habilidad muy importante para entrevistas y trabajo profesional:

**cómo leer sistemas existentes y proponer mejoras**, que es clave para no pensar siempre desde cero y poder analizar arquitecturas ya vivas con criterio técnico.
