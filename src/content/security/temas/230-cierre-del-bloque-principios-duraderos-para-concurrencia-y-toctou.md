---
title: "Cierre del bloque: principios duraderos para concurrencia y TOCTOU"
description: "Principios duraderos para diseñar y revisar concurrencia, race conditions y TOCTOU en aplicaciones Java con Spring Boot. Una síntesis práctica del bloque sobre recursos exclusivos, autorización bajo concurrencia, idempotencia, workers y máquinas de estados."
order: 230
module: "Race conditions, TOCTOU y consistencia bajo concurrencia"
level: "base"
draft: false
---

# Cierre del bloque: principios duraderos para concurrencia y TOCTOU

## Objetivo del tema

Cerrar este bloque con una lista de **principios duraderos** para diseñar, revisar y endurecer lógica de negocio bajo **concurrencia real** en aplicaciones Java + Spring Boot.

La idea de este tema es hacer una síntesis parecida a la que ya hicimos al cerrar los bloques de SSRF, XXE, deserialización, archivos complejos, expresiones, cachés y SSRF moderno.

Ya recorrimos muchas piezas concretas:

- introducción a race conditions y TOCTOU
- stock, cuotas y recursos exclusivos
- checks de permiso antes de usar el recurso
- idempotencia rota
- retries y efectos dobles
- workers, jobs y schedulers compitiendo con requests web
- transiciones de estado
- máquinas de estados
- y carreras entre caminos válidos

Todo eso deja bastante material.
Pero si el bloque termina siendo solo una lista de casos clásicos como “overselling”, “doble click” o “approve vs cancel”, el aprendizaje queda demasiado pegado al ejemplo puntual.

Por eso conviene cerrar con algo más estable:

> principios que sigan sirviendo aunque mañana el problema ya no sea stock, ni permisos, ni un scheduler concreto, sino cualquier flujo donde el sistema verifique algo en un momento y actúe más tarde como si el mundo no pudiera cambiar en el medio.

En resumen:

> el objetivo de este cierre no es sumar otro bug de concurrencia a la colección,  
> sino quedarnos con una forma de pensar carreras, exclusividad e invariantes de negocio que siga siendo útil aunque cambien el recurso, el tipo de actor concurrente o la infraestructura concreta donde se persiste el estado.

---

## Idea clave

La idea central que deja este bloque podría resumirse así:

> una verificación correcta no alcanza si el sistema no protege también la relación temporal entre esa verificación y la acción real.

Esa frase resume prácticamente todo el bloque.

Porque los errores más repetidos aparecieron cuando el sistema:

- leía un estado y asumía que seguiría igual
- verificaba permisos demasiado temprano
- tomaba disponibilidad como si ya fuera posesión
- reintentaba sin distinguir retry de nueva operación
- dejaba que jobs y requests compitieran sin modelarlo
- o asumía que varias transiciones válidas nunca chocarían entre sí

### Idea importante

La defensa duradera en este bloque no depende de memorizar palabras como TOCTOU o idempotencia.
Depende de una idea más simple:
- **la verdad del sistema puede cambiar mientras decidís**, y el diseño tiene que hacerse cargo de eso.

---

# Principio 1: el mundo no se congela mientras el backend decide

Este fue el punto de partida más importante del bloque.

Mucho código se escribe y se lee como si la realidad fuera secuencial:

- leo
- valido
- decido
- actúo
- guardo

Pero en sistemas reales, mientras ese flujo corre también pueden ocurrir:

- otras requests
- retries
- workers
- schedulers
- callbacks
- procesos de limpieza
- revocaciones
- expiraciones
- conciliaciones
- cambios de ownership o de estado

### Idea duradera

El backend no decide sobre una realidad quieta.
Decide sobre una realidad compartida y cambiante.

### Regla sana

Cada vez que una decisión dependa de un estado leído antes, preguntate:
- “¿qué otras cosas podrían cambiarlo antes de que la acción termine?”

---

# Principio 2: “primero chequeamos” no es una defensa completa

Otra gran lección del bloque fue esta:

muchos flujos parecen prolijos porque hacen algo como:

- verificar stock
- verificar permiso
- verificar que sigue libre
- verificar que sigue pendiente
- verificar que el token no fue usado

Eso es bueno.
Pero no alcanza por sí solo.

### Idea duradera

La seguridad y la consistencia no dependen solo de que exista el check.
Dependen también de cómo se protege el vínculo entre el check y el uso real.

### Regla sana

No preguntes solo:
- “¿se valida?”
Preguntá también:
- “¿qué impide que esa validación quede vieja antes de la acción?”

---

# Principio 3: disponibilidad no es posesión

Esto apareció muy fuerte con stock, cuotas y recursos exclusivos.

Una cosa es que el sistema vea:

- “queda una unidad”
- “el cupo sigue libre”
- “el turno todavía existe”
- “el código todavía no fue usado”

Y otra muy distinta es que ya haya convertido eso en:

- asignación real
- consumo efectivo
- reserva consolidada
- exclusividad garantizada

### Idea duradera

Leer que algo está disponible no equivale a haberlo ganado.

### Regla sana

Cada vez que el negocio necesite exclusividad, preguntate:
- “¿qué transforma disponibilidad en posesión de forma realmente exclusiva?”

---

# Principio 4: dos requests normales alcanzan para romper una suposición frágil

Otro aprendizaje fuerte del bloque fue este:

no hace falta un atacante sofisticado ni miles de requests.
A veces alcanza con:

- dos usuarios legítimos
- un doble click
- una request web y un retry
- un request y un worker
- un usuario y un scheduler
- dos administradores

### Idea duradera

La concurrencia problemática no requiere comportamiento raro.
Puede salir del uso normal del producto.

### Regla sana

No pruebes mentalmente un flujo solo con un actor ideal y secuencial.
Probalo también con dos actores razonables llegando casi a la vez.

---

# Principio 5: el mismo flujo puede competir consigo mismo

Esto fue central en el tema de idempotencia.

Muchas veces la carrera no es entre dos actores distintos.
Puede ser entre:

- un request y su retry
- una operación y su doble submit
- un mensaje y su redelivery
- un callback y su reenvío
- una tarea y su replay manual

### Idea duradera

La concurrencia no siempre es social.
A veces es **la misma intención lógica volviendo a correr** sin que el sistema pueda distinguirla bien.

### Regla sana

Cada vez que una operación pueda repetirse por dudas de red o por automatización, preguntate:
- “¿qué evita que el segundo intento produzca un segundo efecto real?”

---

# Principio 6: idempotencia no es un lujo; es defensa contra incertidumbre

Otro punto muy fuerte del bloque fue este:

los retries existen porque los sistemas viven con incertidumbre:

- no sé si la respuesta volvió
- no sé si el mensaje se confirmó
- no sé si el otro lado procesó
- no sé si el commit ocurrió antes del timeout

### Idea duradera

Cuando no podés saber con certeza si el primer intento ya produjo efecto, la idempotencia deja de ser elegancia técnica y pasa a ser protección básica del negocio.

### Regla sana

Cada vez que un flujo pueda quedar en “no sé si pasó”, modelá explícitamente qué debería ocurrir si se reintenta.

---

# Principio 7: jobs, workers y schedulers también son actores de negocio

Esto fue uno de los aprendizajes más importantes y más subestimados del bloque.

Muchos equipos piensan concurrencia solo entre requests HTTP.
Pero el sistema real también se mueve por:

- `@Scheduled`
- colas
- consumers
- cleanup jobs
- retriers
- conciliaciones
- expiraciones
- compensaciones
- pipelines automáticos

### Idea duradera

La app no compite solo con usuarios.
También compite consigo misma a través de sus procesos internos.

### Regla sana

Cada vez que un recurso lo toque una UI y también un proceso automático, asumí que la concurrencia ya es parte del diseño del negocio.

---

# Principio 8: autorización también sufre TOCTOU

Otra lección clave fue que TOCTOU no aplica solo a stock o contadores.
También aplica a permisos cuando dependen de cosas mutables como:

- ownership
- visibilidad
- tenant
- estado del recurso
- membership
- grant
- vigencia de una relación

### Idea duradera

Un permiso correcto en T1 puede dejar de justificar la acción en T2.

### Regla sana

Cada vez que una autorización dependa del estado vivo del recurso, preguntate:
- “¿sigue siendo verdad cuando la acción realmente toca el recurso?”

---

# Principio 9: los snapshots viejos son peligrosos aunque vengan de UI “normal”

Esto apareció con formularios y paneles de edición.

Una UI puede mostrar:

- “todavía podés editar”
- “todavía podés aprobar”
- “todavía podés cancelar”

pero entre que el usuario ve eso y actúa, el mundo puede haber cambiado.

### Idea duradera

Una interfaz visible no es una garantía duradera de que la transición o el permiso siga vigente.

### Regla sana

No confundas:
- “el botón estaba visible”
con
- “la acción sigue siendo legítima ahora”.

---

# Principio 10: las máquinas de estados necesitan coherencia temporal, no solo semántica

Este fue uno de los grandes cierres del bloque.

Muchos workflows están bien pensados en papel:

- desde `PENDING` se puede aprobar
- desde `PENDING` se puede cancelar
- desde `ACTIVE` se puede archivar
- desde `ACTIVE` se puede expirar

Todo eso puede ser correcto.
Pero bajo concurrencia aparece otra pregunta:

- ¿qué pasa si dos caminos válidos parten del mismo estado al mismo tiempo?

### Idea duradera

No alcanza con que cada transición sea legal por separado.
También hace falta que el sistema resuelva bien la competencia entre transiciones compatibles con el mismo estado inicial.

### Regla sana

Cada vez que un estado tenga varias salidas válidas, preguntate:
- “¿qué ocurre si dos intentan ejecutarse a la vez?”

---

# Principio 11: el estado final no cuenta toda la historia

Otra idea muy importante fue esta:

a veces el recurso termina con un solo estado visible en base.
Pero antes pudieron haber ocurrido side effects incompatibles como:

- dos eventos
- un cobro y una cancelación
- una aprobación y una expiración
- una notificación y una revocación
- una reserva y una limpieza automática

### Idea duradera

La consistencia no se evalúa solo mirando la última columna `status`.

### Regla sana

Cuando revises concurrencia, mirá también:
- efectos laterales,
- eventos emitidos,
- integraciones disparadas,
- y acciones irreversibles asociadas a la transición.

---

# Principio 12: muchos bugs de concurrencia son localmente razonables y globalmente incorrectos

Este fue un hilo conceptual muy valioso del bloque.

Puede pasar que:

- el request haga lo correcto según su lógica
- el worker haga lo correcto según la suya
- el scheduler haga lo correcto según su política temporal
- el retry haga lo correcto según su capa de resiliencia

Y aun así el sistema rompa una invariante.

### Idea duradera

La race condition muchas veces nace de sumar varios comportamientos localmente razonables sin un modelo global de exclusividad temporal.

### Regla sana

No revises solo si cada pieza “está bien”.
Revisá también si sus supuestos temporales son compatibles entre sí.

---

# Principio 13: donde el negocio dice “solo una vez”, la concurrencia deja de ser secundaria

Este patrón apareció una y otra vez:

- una sola unidad
- un solo uso
- una sola reserva
- un solo cupón
- una sola transición legítima
- una sola operación de cobro
- un solo permiso vigente
- una sola historia válida del recurso

### Idea duradera

Cada vez que el negocio necesita unicidad, exclusividad o irreversibilidad, la concurrencia pasa a ser un tema central de diseño y no un detalle de implementación.

### Regla sana

Si el producto no tolera duplicación o caminos incompatibles, no dejes que la protección dependa solo de timing “favorable”.

---

# Principio 14: los procesos internos también deben entrar en el modelo de amenaza

Esto vale mucho más allá de seguridad clásica.

Workers, schedulers, retries y jobs pueden:

- duplicar efectos
- competir por estados
- usar verdades viejas
- archivar o expirar mientras otro flujo sigue vivo
- reabrir carreras que el request principal parecía haber cerrado

### Idea duradera

Los procesos internos no son observadores neutrales.
Son actores que pueden romper invariantes de negocio y de seguridad.

### Regla sana

Cada vez que armes el mapa de actores sobre un recurso, incluí:
- usuarios,
- admins,
- requests,
- workers,
- jobs,
- schedulers,
- retries,
- y procesos batch.

---

# Principio 15: la mejor pregunta del bloque es “qué cambia si dos llegan a la vez”

Este principio resume muy bien toda la parte práctica.

Cuando revises cualquier flujo sensible, en vez de quedarte solo con:

- “la lógica tiene sentido”
- “el check está”
- “el save ocurre”
- “el estado está validado”

preguntate:

- ¿qué pasa si dos llegan a la vez?
- ¿qué pasa si el mismo flujo se repite?
- ¿qué pasa si un job toca eso en el medio?
- ¿qué pasa si la autorización cambia mientras actúo?
- ¿qué pasa si dos transiciones parten del mismo estado?
- ¿qué pasa si no sé si el primer intento ya produjo el efecto?

### Idea duradera

La revisión madura de concurrencia empieza cuando dejás de leer el método como una historia lineal única.

### Regla sana

Toda operación sensible merece al menos una simulación mental seria de:
- actor A,
- actor B,
- y estado que cambia en el medio.

---

## Cómo usar estos principios después del bloque

No hace falta recordar cada ejemplo puntual si te quedan claras unas pocas preguntas base.

Podés llevarte esta secuencia corta:

1. **¿Qué estado lee este flujo antes de actuar?**
2. **¿Qué otros actores podrían cambiar ese mismo estado?**
3. **¿Qué pasa entre el check y la acción real?**
4. **¿Qué efecto no debería ocurrir dos veces?**
5. **¿Qué transiciones o decisiones compiten sobre el mismo recurso?**
6. **¿Qué side effects harían grave una carrera aunque el estado final parezca razonable?**
7. **¿Qué pasaría si dos intentos válidos llegaran casi al mismo tiempo?**

### Idea útil

Si respondés bien estas preguntas, ya tenés una brújula muy fuerte para casi cualquier problema de TOCTOU o concurrencia de negocio.

---

## Qué revisar en una app Spring

Cuando uses este cierre como guía en una app Spring, conviene mirar especialmente:

- métodos `read → validate → write`
- recursos con stock, cuotas, cupos o unicidad
- autorizaciones que dependen de ownership, visibilidad o membresías mutables
- POSTs sensibles con retries o doble submit posible
- workers y `@Scheduled` que tocan las mismas entidades que la UI
- workflows con múltiples transiciones saliendo del mismo estado
- side effects fuertes asociados a cambios de estado
- puntos donde el sistema necesita responder bien a “¿qué pasa si esto corre dos veces?”

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- conciencia clara de que verificar y usar no son lo mismo
- modelado explícito de recursos exclusivos o de efectos irreversibles
- menos confianza en snapshots viejos
- inclusión de jobs y retries dentro del análisis del negocio
- mejor mirada sobre side effects incompatibles
- equipos que piensan en simultaneidad como parte del diseño y no como accidente improbable

### Idea importante

La madurez aquí se nota cuando el sistema ya no asume un mundo secuencial para flujos que el producto en realidad expone a concurrencia real.

---

## Señales de ruido

Estas señales indican que todavía queda trabajo pendiente:

- “primero chequeamos” como respuesta suficiente
- concurrencia modelada solo entre usuarios
- retries agregados sin pensar en efectos dobles
- authZ vista como estática aunque dependa de estado mutable
- workflows dibujados sin analizar carreras entre transiciones
- jobs y schedulers tratados como si no formaran parte del dominio
- bugs “raros” que el equipo explica como timing y no como diseño

### Regla sana

Si el sistema no puede responder con claridad qué pasa cuando dos actores —humanos o automáticos— llegan casi juntos al mismo recurso, probablemente todavía no tiene bien cerrada la concurrencia de ese flujo.

---

## Checklist práctica

Para cerrar este bloque, cuando revises un flujo sensible preguntate:

- ¿qué estado observa?
- ¿qué puede cambiar en el medio?
- ¿quién más puede tocarlo?
- ¿qué efecto no debe duplicarse?
- ¿qué transición o decisión compite con otra?
- ¿qué side effect volvería grave una carrera?
- ¿qué asunción secuencial está haciendo el código que la realidad no garantiza?

---

## Mini ejercicio de reflexión

Tomá un flujo real de tu app Spring y respondé:

1. ¿Qué recurso o estado protege?
2. ¿Qué check hace antes de actuar?
3. ¿Qué otros actores pueden intervenir?
4. ¿Qué parte del flujo podría repetirse o competir?
5. ¿Qué side effect incompatible te preocuparía más?
6. ¿Qué parte del equipo sigue leyendo este flujo como si fuera secuencial?
7. ¿Qué cambio revisarías primero para mejorar consistencia bajo concurrencia?

---

## Resumen

Este bloque deja una idea muy simple y muy útil:

- el sistema no decide sobre una realidad quieta
- la verificación previa no alcanza si el mundo puede cambiar antes del uso real
- una operación puede competir con otra o consigo misma
- jobs, retries y schedulers también son actores del problema
- y muchas inconsistencias graves nacen no de lógica absurda, sino de lógica localmente razonable que no soporta convivencia temporal con otros flujos

Por eso los principios más duraderos del bloque son:

- no asumir un mundo secuencial
- distinguir disponibilidad de posesión
- tratar idempotencia como defensa contra incertidumbre
- modelar authZ también como verdad temporal
- incluir procesos automáticos en el mapa de actores
- analizar máquinas de estados bajo concurrencia
- mirar side effects y no solo el estado final
- y preguntarse siempre qué cambia si dos intentos válidos llegan a la vez

En resumen:

> un backend más maduro no trata las race conditions y los TOCTOU como rarezas de infraestructura o como simples accidentes de timing que se resuelven “siendo prolijos” con validaciones previas, sino como una propiedad estructural de cualquier sistema donde varias decisiones, automáticas o manuales, compiten sobre la misma verdad mutable.  
> Entiende que la seguridad y la consistencia duraderas no nacen de leer el código como una historia lineal ideal, sino de preguntarse explícitamente qué otras acciones pueden intervenir entre el check y el efecto real, qué operaciones podrían repetirse y qué transiciones válidas por separado podrían volverse incompatibles cuando corren al mismo tiempo.  
> Y justamente por eso este cierre importa tanto: porque deja una forma de pensar que sigue sirviendo aunque cambie el recurso, el tipo de actor concurrente o la tecnología concreta, y esa forma de pensar es probablemente la herramienta más útil para seguir diseñando flujos robustos en sistemas modernos mucho después de olvidar el nombre de una race concreta o de una anotación específica del framework.

---

## Próximo tema

**Introducción a firmas, tokens temporales y confianza en datos autocontenidos**
