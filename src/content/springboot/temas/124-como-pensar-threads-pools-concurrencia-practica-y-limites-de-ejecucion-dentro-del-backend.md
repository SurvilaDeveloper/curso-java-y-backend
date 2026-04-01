---
title: "Cómo pensar threads, pools, concurrencia práctica y límites de ejecución dentro del backend"
description: "Entender por qué un backend Spring Boot serio no puede tratar la concurrencia solo como “hacer muchas cosas a la vez”, y cómo pensar mejor threads, pools, límites de ejecución y saturación para que el sistema no se estorbe a sí mismo bajo carga."
order: 124
module: "Seguridad, performance y operación avanzada"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- colas
- throughput asíncrono
- backlog
- tasa de entrada
- tasa de drenaje
- latencia total de procesamiento
- retries
- bursts
- presión acumulada en flujos fuera del request-response

Eso ya te dejó una idea muy importante:

> en un backend serio, lo asíncrono no debería verse solo como “trabajo que se hará después”, sino como un sistema con capacidad, backlog, latencia y costo propios, donde importa muchísimo cuánto entra, cuánto se procesa y cuánto se acumula.

Ahora aparece una pregunta muy natural cuando querés bajar todo eso a la ejecución concreta del backend:

> ¿cuántas cosas puede intentar hacer el sistema al mismo tiempo antes de empezar a estorbarse a sí mismo?

Porque muchas veces la intuición inicial sobre concurrencia suena a algo así:

- más threads
- más paralelismo
- más workers
- más consumidores
- más cosas haciendo trabajo a la vez
- entonces más capacidad

Y a veces eso ayuda.
Pero en sistemas reales, muy pronto aparecen problemas como:

- pools saturados
- demasiados threads compitiendo por los mismos recursos
- conexiones a base agotadas
- context switching caro
- colas internas que crecen
- workers que se pisan
- tasks bloqueadas esperando I/O
- más paralelismo que el sistema no puede sostener
- throughput que no mejora y latencia que empeora
- sensación de “estamos haciendo mucho” cuando en realidad estamos generando contención

Ahí aparecen ideas muy importantes como:

- **threads**
- **thread pools**
- **pools de ejecución**
- **límites de concurrencia**
- **contención**
- **saturación de pools**
- **parallelism vs throughput real**
- **trabajo bloqueante vs no bloqueante**
- **backpressure**
- **capacidad práctica del proceso**

Este tema es clave porque, en un backend serio, no alcanza con querer hacer más cosas en paralelo.
También necesitás pensar:

> cuántas vale la pena intentar a la vez, con qué recursos y en qué punto el sistema empieza a degradarse por exceso de concurrencia en lugar de mejorar.

## El problema de pensar que más concurrencia siempre significa más capacidad

Este es uno de los errores más comunes.

Cuando alguien ve lentitud o backlog, una reacción bastante intuitiva es:

- levantemos más threads
- subamos el pool
- pongamos más workers
- hagamos más en paralelo

Y claro, a veces eso sirve.

Pero otras veces pasa exactamente lo contrario:
- la base ya está al límite
- el pool de conexiones no da más
- la dependencia externa no responde más rápido
- los locks empeoran
- la CPU gasta más tiempo coordinando que resolviendo
- la memoria sube
- el contexto se vuelve más ruidoso
- la cola interna se llena igual

Entonces aparece una verdad muy importante:

> más concurrencia no siempre equivale a más throughput útil.

A veces solo significa:
- más presión
- más contención
- más complejidad
- y degradación más difícil de diagnosticar

## Qué significa concurrencia práctica

Dicho simple:

> concurrencia práctica es la cantidad de trabajo que el backend intenta sostener al mismo tiempo en la vida real del proceso, usando threads, workers, pools, conexiones y otros recursos finitos.

La palabra importante es **práctica**.

Porque no estamos hablando solo de teoría de concurrencia.
Estamos hablando de cosas muy concretas como:

- cuántas requests se ejecutan a la vez
- cuántos jobs pueden correr juntos
- cuántos mensajes puede consumir el sistema simultáneamente
- cuántas operaciones bloqueantes se apilan
- cuántas conexiones a base hay disponibles
- cuántos hilos están ocupados esperando terceros
- cuántas tareas se meten en cola dentro del proceso

Eso ya es muchísimo más cercano a la operación real del backend.

## Qué es un thread, en esta conversación

No hace falta entrar en todos los detalles de bajo nivel.
A este nivel, podés pensarlo así:

> un thread es una unidad de ejecución que permite que el proceso avance tareas de forma concurrente.

Lo importante acá no es memorizar internals de la JVM.
Lo importante es captar esta idea:

- los threads no son infinitos
- tienen costo
- compiten por CPU y memoria
- y muchas veces pasan tiempo esperando recursos externos

Entonces el backend no “hace todo a la vez” mágicamente.
Lo hace dentro de ciertos límites de ejecución.

## Qué es un pool

Podés pensarlo así:

> un pool es un conjunto controlado de recursos reutilizables que limita y organiza cuántas tareas pueden ejecutarse concurrentemente sobre cierto tipo de trabajo.

Hay muchos tipos de pools que importan en backend, por ejemplo:

- thread pools
- pools de conexiones a base
- pools de conexiones HTTP
- workers de consumidores
- pools asociados a schedulers o jobs

La idea central es:

> el sistema necesita límites y reutilización, no crecimiento sin forma.

## Una intuición muy útil

Podés pensar así:

- el thread representa ejecución posible
- el pool representa cuánta de esa ejecución querés permitir y administrar

Esta diferencia ayuda mucho.

## Por qué los pools importan tanto

Porque sin límites claros, un backend puede intentar hacer más trabajo concurrente del que sus recursos o dependencias realmente soportan.

Y eso lleva a cosas como:

- colas internas infinitas
- latencia enorme
- memoria creciendo
- tareas esperando demasiado
- requests timeout
- contención sobre la base
- saturación de terceros
- sistema aparentemente “vivo” pero muy degradado

Entonces los pools cumplen una función central:
**no solo habilitan concurrencia; también la disciplinan**.

## Qué diferencia hay entre concurrencia útil y concurrencia dañina

Esto es muy importante.

### Concurrencia útil
Permite aprovechar mejor CPU, ocultar esperas de I/O y sostener más trabajo total sin degradarse demasiado.

### Concurrencia dañina
Hace que demasiadas tareas compitan por recursos escasos y terminen empeorando:
- latencia
- throughput
- contención
- uso de memoria
- fairness
- errores
- estabilidad general

La clave está en que el número “más alto” no siempre es mejor.
A veces hay un punto sano y después viene la degradación.

## Un ejemplo muy claro

Supongamos que un worker procesa mensajes que:
- leen base
- pegan a un tercero
- escriben estado
- producen otro evento

Si duplicás el número de consumidores, podría pasar que:
- mejore un poco el throughput
- o podría pasar que:
  - la base se caliente
  - el tercero rate-limitee
  - aumenten retries
  - el pool de conexiones se sature
  - y el throughput efectivo no mejore casi nada

Eso muestra algo muy importante:

> la concurrencia útil depende del cuello real del sistema, no del entusiasmo con el que abras threads.

## Qué relación tiene esto con throughput

Absolutamente total.

Ya viste en temas anteriores que throughput es cuánto trabajo útil puede sostener el sistema por unidad de tiempo.

Bueno:
los threads y pools son parte central de eso, porque determinan:

- cuántas tareas pueden progresar a la vez
- cuántas quedan esperando
- cuánto tiempo pasan bloqueadas
- cuánta presión meten sobre recursos compartidos

Pero otra vez:
más concurrencia no siempre da más throughput.
A veces llega un punto donde:
- sube contención
- baja eficiencia
- crece latencia
- aparecen errores
- y el throughput se estanca o empeora

## Qué relación tiene esto con latencia

También muy fuerte.

Podés tener un sistema que:
- intenta hacer muchas cosas a la vez
- pero mete tanto trabajo en cola o tanta contención
- que cada operación individual tarda más

Es decir:
la misma configuración que parece “más agresiva” en concurrencia puede empeorar la experiencia de cada request o de cada job.

Por eso conviene mirar siempre juntas:
- latencia
- throughput
- saturación de pools
- backlog interno
- contención externa

## Qué relación tiene esto con trabajo bloqueante

Muy importante.

No todo trabajo se comporta igual.

Por ejemplo, hay tareas que:
- consumen CPU
- y otras que
- pasan mucho tiempo esperando I/O:
  - base
  - red
  - APIs externas
  - storage
  - colas
  - archivos

Si una tarea es muy bloqueante, podés llenarte de threads que en realidad están quietos esperando.
Eso puede crear la ilusión de “estamos procesando un montón”, cuando en realidad tenés:
- muchos hilos ocupados
- poco progreso útil
- y presión innecesaria sobre el resto del sistema

Entonces otra pregunta madura pasa a ser:

> ¿este pool está ejecutando trabajo que progresa o trabajo que pasa demasiado tiempo bloqueado?

## Qué relación tiene esto con pools de conexiones

Absolutamente fuerte.

A veces alguien sube la concurrencia del lado de threads, pero se olvida de que después todo ese trabajo necesita cosas como:

- conexiones a base
- conexiones HTTP salientes
- recursos de terceros
- acceso a storage
- locks de dominio

Entonces el thread pool puede quedar grande, pero el cuello real sigue estando en:
- pool de conexiones
- lock compartido
- recurso caliente
- dependencia lenta

Eso crea algo muy típico:
- muchas tareas activas
- poca capacidad real adicional

Entonces los pools no se piensan aislados.
Se piensan en conjunto con la cadena de recursos que cada tarea necesita.

## Una intuición muy útil

Podés pensar así:

> un thread extra solo ayuda si el resto del camino también tiene margen para que ese trabajo avance.

Esta frase vale muchísimo.

## Qué relación tiene esto con request-response

Muy fuerte.

En el tráfico HTTP puede importar muchísimo:

- cuántas requests concurrentes soportás
- cuánto tiempo queda ocupado cada thread
- cuánto tardan los downstreams
- qué parte del tiempo es CPU y cuál espera
- si la aplicación está atascando sus workers en trabajo que podría desacoplarse o limitarse mejor

Esto impacta directamente en:
- p95
- p99
- timeouts
- saturación
- throughput efectivo

Entonces el pool de ejecución de requests también es una parte central del rendimiento real del backend.

## Qué relación tiene esto con jobs y schedulers

También muy fuerte.

Los jobs no son “gratis” por correr fuera del request principal.
También compiten por:
- CPU
- base
- conexiones
- I/O
- memoria
- terceros
- tiempo operativo

Entonces conviene pensar:
- cuántos jobs pueden correr a la vez
- si se pisan entre sí
- si compiten con tráfico online
- si hay pools separados o compartidos
- si un job pesado puede estorbar hot paths del producto

Esto vuelve mucho más madura la operación del sistema.

## Qué relación tiene esto con colas y consumers

Absolutamente total.

En consumidores asíncronos, el tamaño del pool o la cantidad de workers suele ser una de las primeras perillas tentadoras.
Pero otra vez:
- no siempre conviene subir sin entender
- qué cuello limita
- qué backlog existe
- qué tiempo tarda cada mensaje
- qué terceros toca
- qué retry se genera
- qué tenant domina la carga

A veces el problema no es que falten consumers.
A veces el problema es que:
- el trabajo por mensaje es demasiado caro
- la granularidad del mensaje es mala
- el recurso compartido se satura
- el retry rate es absurdo
- o la cola oculta un diseño poco sano

## Qué relación tiene esto con backpressure

A nivel intuitivo:

> backpressure es la capacidad del sistema de resistirse a recibir o ejecutar más trabajo del que puede procesar razonablemente sin degradarse peor.

Esto es súper importante.

Porque un backend serio no debería tratar de tragarse todo alegremente si:
- ya está saturado
- los pools están llenos
- los workers están tardando mucho
- el backlog está creciendo
- los downstreams están lentos

A veces conviene mucho más:
- limitar
- rechazar
- desacoplar mejor
- retardar
- encolar con control
- o frenar el ritmo

que seguir aceptando trabajo y entrar en espiral de degradación.

## Qué relación tiene esto con errores y timeouts

Muy fuerte.

Cuando los pools y la concurrencia están mal balanceados, los síntomas típicos pueden ser:

- timeouts
- latencia rara
- requests en espera
- tasks que nunca arrancan a tiempo
- backlog interno
- consumers lentos
- jobs eternos
- conexiones agotadas
- retries
- error rate creciente

Y muchas veces esos síntomas parecen:
- “problema de red”
- “problema del proveedor”
- “problema de la base”

cuando en realidad también hay una dimensión de:
- cómo el backend distribuye y limita su ejecución interna

## Qué relación tiene esto con multi-tenancy

Muy fuerte.

En plataformas multi-tenant, ciertos tenants pueden dominar:

- pools de jobs
- workers de export
- consumers de integraciones
- recursos compartidos del proceso
- conexiones a base
- throughput de ciertas colas

Entonces la concurrencia práctica también puede necesitar pensar:
- fairness
- aislamiento
- límites por tenant
- colas separadas
- pools diferenciados
- prioridades

Si no, un tenant grande puede convertir un pool compartido en una zona de espera permanente para los demás.

## Qué relación tiene esto con observabilidad

Absolutamente central.

Conviene poder ver cosas como:

- tamaño y uso del pool
- tareas activas
- tareas en cola
- tiempo de espera antes de ejecución
- throughput por worker o consumer
- backlog
- saturación de conexiones
- latencia por dependencia
- retries
- tiempo bloqueado vs tiempo útil si podés aproximarlo
- presión por tenant o por feature

Sin eso, ajustar pools se vuelve:
- intuición
- folklore
- prueba y error sin mucha lectura real

## Qué relación tiene esto con performance tuning

Muy fuerte.

Mucha gente piensa tuning como:
- “subamos el pool”
- “metamos más threads”
- “aumentemos conexiones”

Pero el tuning sano suele requerir preguntas previas como:

- ¿qué recurso está limitando de verdad?
- ¿la tarea es CPU-bound o I/O-bound?
- ¿el backlog es por falta de workers o por trabajo demasiado pesado?
- ¿subir concurrencia aumentará throughput o solo contención?
- ¿qué parte del sistema empieza a saturar primero?
- ¿qué pasa con p95 y p99 cuando cambio esto?
- ¿qué tenant o tipo de flujo consume más estos workers?

Eso vuelve el tuning mucho más serio.

## Qué no conviene hacer

No conviene:

- asumir que más threads siempre ayudan
- subir pools sin mirar base, terceros o colas
- mezclar en el mismo pool trabajos con comportamientos muy distintos sin pensarlo
- ignorar que jobs y tráfico online compiten por recursos
- tratar la saturación solo cuando ya se convirtió en incidente
- no observar cuánto tiempo pasa una tarea esperando antes de ejecutarse
- olvidar fairness y multi-tenancy en pools compartidos

Ese tipo de decisiones suele empeorar bastante las cosas.

## Otro error común

Pensar que la concurrencia es gratis mientras haya CPU disponible.
A veces el cuello está en:
- base
- conexiones
- locks
- terceros
- storage
- backlogs
- colas internas
- costos de coordinación

## Otro error común

No distinguir entre:
- más tareas activas
- más progreso útil
- más throughput
- y más ruido o contención

No son equivalentes.

## Otro error común

Diseñar el sistema para aceptar mucho trabajo concurrente sin pensar qué pasa cuando:
- todo ese trabajo queda esperando lo mismo
- o golpea el mismo recurso caliente
- o produce más retries
- o compite con los mismos tenants o jobs

## Una buena heurística

Podés preguntarte:

- ¿qué tipo de trabajo corre en este pool?
- ¿es CPU-bound, I/O-bound o mixto?
- ¿qué recurso real limita primero a estas tareas?
- ¿más concurrencia mejoraría throughput o solo aumentaría contención?
- ¿hay cola interna creciendo porque el pool no da o porque el trabajo es demasiado caro?
- ¿este pool está compartido por cosas que deberían aislarse?
- ¿qué pasa con tenants desiguales dentro de este mismo recurso?
- ¿qué métricas me mostrarían que el sistema ya se está estorbando a sí mismo?

Responder eso te ayuda muchísimo a pensar concurrencia con bastante más madurez.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque en el backend real los síntomas muchas veces suenan así:

- “subimos workers y no mejoró”
- “hay threads de sobra pero la cola sigue creciendo”
- “tenemos CPU, pero todo igual espera”
- “los jobs online y offline se pisan”
- “la base se queda sin conexiones”
- “ciertos tenants monopolizan procesamiento”
- “bajo carga el sistema se siente cada vez más torpe aunque no esté caído”

Y para entender bien eso necesitás mirar cómo el backend intenta ejecutar trabajo por dentro, no solo qué endpoints expone.

## Relación con Spring Boot

Spring Boot puede ser una muy buena base para trabajar con pools, schedulers y ejecución concurrente.
Pero el framework no decide por vos:

- cuánto paralelismo conviene
- qué trabajos deberían aislarse
- qué pool se está saturando
- qué recurso limita primero
- cuándo más concurrencia deja de ayudar
- cómo proteger fairness entre tenants
- qué backpressure hace falta

Eso sigue siendo criterio de backend, operación y arquitectura.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> en un backend serio, la concurrencia práctica no debería verse como “hacer muchas cosas a la vez”, sino como la gestión cuidadosa de cuántas tareas vale la pena intentar en paralelo con los recursos reales del sistema, usando threads, pools y límites de ejecución de forma que aumenten el throughput útil sin convertir al backend en una máquina de contención, espera y degradación interna.

## Resumen

- Más concurrencia no siempre significa más capacidad útil.
- Threads y pools ayudan a organizar ejecución, pero también deben limitarla con criterio.
- La saturación suele aparecer cuando demasiadas tareas compiten por los mismos recursos reales.
- Requests, jobs, consumers y tenants pueden compartir recursos y estorbarse entre sí.
- Backpressure y observabilidad son claves para no convertir pools en cajas negras.
- Este tema lleva la conversación de throughput y backlog hacia la ejecución concreta dentro del proceso.
- A partir de acá el bloque queda listo para seguir entrando en memoria, GC, JVM y otras fuentes de comportamiento real del backend bajo presión.

## Próximo tema

En el próximo tema vas a ver cómo pensar memoria, heap, GC y comportamiento de la JVM sin caer en mística ni tuning ciego, porque después de entender mejor pools y concurrencia, otra gran fuente de degradación práctica del backend aparece en cómo vive, crece y limpia memoria el proceso real.
