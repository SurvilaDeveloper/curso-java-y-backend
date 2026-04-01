---
title: "Cómo pensar procesamiento batch, jobs programados y tareas periódicas cuando no todo nace de una request"
description: "Entender qué cambia cuando el backend necesita ejecutar trabajo fuera del flujo request-response o de eventos puntuales, y cómo pensar jobs programados, procesamiento batch y tareas periódicas con más criterio en sistemas Spring Boot."
order: 102
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo empezar a pensar:

- mensajería
- colas
- brokers
- productores
- consumidores
- reintentos
- backlog
- asincronía más robusta cuando ya no alcanza con eventos locales simples

Eso ya te dejó una idea muy importante:

> a medida que el backend crece, no todo trabajo conviene ocurrir dentro de la request principal ni depender de que un consumidor puntual esté pegado temporalmente al productor.

Pero hay otra familia de trabajo muy común en sistemas reales que tampoco nace necesariamente de:

- una request del usuario
- un evento puntual
- una interacción directa con frontend

La pregunta es:

> ¿qué pasa con el trabajo que el sistema tiene que hacer igual, aunque nadie lo esté pidiendo justo ahora?

Por ejemplo:

- vencer carritos o reservas
- expirar tokens o sesiones
- recalcular resúmenes
- sincronizar con otro sistema cada cierto tiempo
- reprocesar pendientes
- limpiar archivos temporales
- emitir reportes
- consolidar métricas
- reenviar fallos recuperables
- revisar órdenes viejas
- mandar recordatorios
- regenerar vistas derivadas
- compactar o archivar información
- correr cierres diarios o mensuales

Ahí aparecen ideas muy importantes como:

- **jobs programados**
- **tareas periódicas**
- **procesamiento batch**
- **trabajo fuera de request**
- **cron o scheduling**
- **escaneo de pendientes**
- **ventanas de procesamiento**
- **trabajo por lotes**

Este tema es clave porque, a partir de cierto punto, un backend serio ya no vive solo reaccionando a tráfico online.
También tiene una vida propia de mantenimiento, reconciliación, limpieza y procesamiento periódico.

## El problema de pensar que todo trabajo nace de una request o de un evento

Cuando el backend todavía es chico, muchas veces todo parece nacer de:

- un usuario que hace click
- una request HTTP
- un webhook
- un evento inmediato

Y eso está muy bien durante un buen tramo.

Pero a medida que el sistema crece, aparece mucho trabajo que existe por razones como:

- el paso del tiempo
- necesidad de mantenimiento
- reconciliación de estados
- limpieza de datos
- procesamiento acumulado
- cierres de período
- integraciones que necesitan barridos
- datos pendientes que deben revisarse después

Ese trabajo no siempre tiene un disparador online claro.
A veces simplemente **toca hacerlo**.

Y ahí aparece una diferencia muy importante:

> no todo proceso del backend es reactivo a una request concreta.

## Qué significa procesamiento batch

Dicho simple:

> procesamiento batch significa ejecutar trabajo sobre un conjunto de datos o tareas agrupadas, muchas veces recorriendo pendientes o elementos acumulados, en vez de reaccionar a una sola unidad puntual en tiempo real.

La palabra “batch” no implica automáticamente algo gigantesco.
Puede significar cosas bastante variadas, por ejemplo:

- procesar 1000 registros pendientes
- recorrer reservas vencidas
- recalcular resúmenes diarios
- reprocesar mensajes fallidos
- tomar una tanda de archivos pendientes
- consolidar movimientos del día

La idea importante es esta:

> el sistema trabaja por lote o por barrido, no necesariamente por request individual en vivo.

## Qué es un job programado

Podés pensarlo así:

> un job programado es una tarea que el backend ejecuta automáticamente según una frecuencia, horario o criterio temporal.

Por ejemplo:

- cada 5 minutos
- cada hora
- todos los días a medianoche
- cada lunes
- cada fin de mes
- cada 30 segundos
- al inicio del sistema y luego periódicamente

Esto es muy valioso cuando el trabajo depende más del tiempo que de la interacción inmediata de un usuario.

## Qué tipo de problemas suele resolver un job programado

Por ejemplo:

- vencimientos
- limpieza
- sincronización periódica
- recordatorios
- consolidación
- reconciliación
- escaneo de tareas pendientes
- generación de snapshots
- cierre de ciclos
- mantenimiento de proyecciones

Todos estos casos aparecen muchísimo en aplicaciones reales.

## Un ejemplo muy claro

Supongamos que tu sistema de e-commerce permite iniciar checkout, pero ciertos pedidos quedan:

- iniciados
- pendientes
- o expirados si pasa demasiado tiempo sin confirmación

Podrías modelar parte de eso con eventos o webhooks.
Pero además puede tener mucho sentido que exista un job periódico que revise:

- intentos demasiado viejos
- pedidos que siguen `PENDIENTE`
- reservas que ya deberían liberarse
- estados que necesitan expirar o reconciliarse

Eso muestra muy bien por qué no todo se resuelve solo con request-response o mensajería reactiva.

## Qué relación tiene esto con consistencia eventual

Muy fuerte.

A veces un sistema acepta que ciertas cosas no se corrigen instantáneamente.
Pero necesita una forma de converger después.

Por ejemplo:

- quedó algo pendiente
- falló una integración
- se perdió una oportunidad de actualizar en tiempo real
- hubo un error temporal
- una proyección necesita recomponerse
- un estado quedó necesitando reconciliación

Un job periódico puede ser una herramienta muy buena para ayudar a esa convergencia posterior.

## Qué relación tiene esto con reintentos

También muy fuerte.

Hay veces donde un retry inmediato no conviene o no alcanza.
Entonces aparece un patrón como:

- fallo ahora
- se registra pendiente
- luego un job vuelve a mirar qué quedó pendiente
- reintenta con otra estrategia o en otro momento

Esto es muy común en:

- emails
- integraciones externas
- sincronización con terceros
- tareas de generación de documentos
- procesamiento de lotes

Y muestra que los jobs pueden ser una pieza importante de recuperación y robustez.

## Una intuición muy útil

Podés pensar así:

### Request online
Algo ocurre porque alguien pide algo ahora.

### Evento
Algo reacciona a un hecho puntual ocurrido.

### Job programado
Algo ocurre porque ya tocaba revisar, limpiar, recalcular o procesar una cierta clase de pendientes.

Esa diferencia mental ayuda muchísimo.

## Qué tipo de tareas suelen ser buenas candidatas para jobs

Por ejemplo:

- expirar recursos
- liberar reservas
- revisar pendientes
- reenviar fallos recuperables
- consolidar estadísticas
- generar resúmenes periódicos
- archivar o borrar temporales
- sincronizar lotes con otro sistema
- enviar recordatorios programados
- procesar colas de trabajo de baja urgencia
- validar vencimientos
- regenerar snapshots o materializaciones

Estas son señales muy naturales.

## Qué tipo de tareas suelen ser peores candidatas

Por ejemplo:

- validaciones que el usuario necesita al instante
- decisiones críticas del flujo online
- acciones que dependen de feedback inmediato
- pasos que no deberían esperar una ventana periódica
- operaciones donde el retraso cambia demasiado la experiencia o la semántica

Otra vez:
no todo problema se resuelve con “hagamos un cron”.
El criterio importa muchísimo.

## Qué diferencia hay entre job pequeño y batch pesado

No todo job programado implica toneladas de datos.

A veces un job puede ser algo chico como:

- revisar 20 tokens vencidos
- borrar temporales viejos
- enviar recordatorios pendientes

Y otras veces puede ser bastante más pesado:

- recorrer cientos de miles de registros
- recalcular métricas de un día entero
- consolidar movimientos masivos
- exportar datos
- reindexar información

La diferencia importa muchísimo porque cambia:

- duración
- costo de recursos
- observabilidad
- posibilidad de correrlo en línea o no
- forma de particionar el trabajo
- riesgo de superposición

Entonces conviene no meter todo bajo la palabra “job” como si fueran casos equivalentes.

## Qué relación tiene esto con el tiempo

Total.

Los jobs son una forma explícita de decir:

> el paso del tiempo también produce trabajo en el backend.

Esto puede parecer obvio, pero es una idea profunda.
Porque te obliga a pensar el sistema no solo como algo que reacciona a inputs externos, sino como algo que:

- madura estados
- expira cosas
- revisa condiciones
- hace mantenimiento
- procesa acumulación
- cierra períodos

Eso es muy real en backend profesional.

## Qué relación tiene esto con ownership y dominio

Muy fuerte.

Porque no conviene que los jobs sean solo scripts medio sueltos sin relación clara con el dominio.

Por ejemplo:

- si expira reservas, eso toca un subdominio concreto
- si reconcilia pagos pendientes, eso toca payments
- si limpia temporales de upload, eso toca storage
- si manda recordatorios, eso toca notifications o el dominio que los dispara

Esto ayuda a que los jobs no se conviertan en un cajón de sastre de tareas raras sin dueño claro.

## Un ejemplo útil

Supongamos un job de reconciliación de pagos.

No debería ser solo:

- “un cron que corre una query y hace cosas”

También debería quedar claro:

- qué estado revisa
- qué transiciones del dominio puede disparar
- qué pasa si encuentra algo inconsistente
- quién es dueño de esa lógica
- qué observabilidad tiene
- qué pasa si falla a mitad de camino

Eso ya muestra una visión bastante más seria.

## Qué relación tiene esto con idempotencia

Absolutamente total.

Porque muchos jobs:

- pueden reintentarse
- pueden volver a ejecutarse
- pueden correr dos veces por error
- pueden levantarse en paralelo sin que quieras
- pueden procesar elementos que otro job ya tocó

Entonces, igual que en eventos y mensajería, la idempotencia importa muchísimo.

Por ejemplo:

- si un job de vencimiento corre dos veces, no debería romper el estado
- si un job de recordatorios se repite, no debería mandar veinte veces lo mismo
- si un batch de reconciliación vuelve a mirar una orden ya corregida, debería manejarlo con seguridad

## Qué relación tiene esto con concurrencia

También muy fuerte.

Imaginá que:

- un usuario actualiza una orden
- al mismo tiempo corre un job que revisa órdenes vencidas
- o un job reintenta una integración mientras otra parte ya la resolvió

Ahí aparecen conflictos parecidos a los del tema anterior:

- estados pisados
- decisiones sobre datos viejos
- transiciones inválidas
- doble procesamiento

Entonces un job serio también necesita pensar:

- locking
- filtros correctos
- condiciones de transición
- idempotencia
- detección de “ya no corresponde”

## Qué problema aparece con la superposición de jobs

Este es uno de los más clásicos.

Supongamos que un job corre cada 5 minutos, pero a veces tarda 7.
Entonces puede pasar que:

- empiece una ejecución
- antes de terminar, se dispare otra
- ambas procesen parte del mismo trabajo
- se duplique esfuerzo o efectos
- el sistema quede raro o sobrecargado

Por eso no alcanza con “programar”.
También hay que pensar:

- cuánto tarda
- si puede superponerse
- si eso es tolerable o no
- cómo evitar doble corrida peligrosa

Este es un tema operativamente muy importante.

## Qué relación tiene esto con volumen

Muy fuerte otra vez.

Un batch o job chico puede ser simple.
Pero si el volumen crece, aparecen preguntas como:

- ¿lo proceso todo junto o por páginas/lotes?
- ¿cuánto trabajo meto por ejecución?
- ¿cómo corto o retomo?
- ¿cómo evito timeouts o consumo excesivo?
- ¿cómo mido avance?
- ¿qué hago si falla a mitad?

Esto vuelve el procesamiento batch bastante más interesante que un simple método programado.

## Una intuición muy útil

Podés pensar así:

> cuanto más grande sea el lote, más importante se vuelve que el job no asuma que puede hacer todo de una sola vez, de forma invisible y sin fallar.

Esa frase ayuda mucho.

## Qué relación tiene esto con observabilidad

Absolutamente central.

Un job serio debería poder responder preguntas como:

- cuándo corrió
- cuánto tardó
- qué procesó
- cuántos elementos encontró
- cuántos pudo completar
- cuántos fallaron
- si quedó algo pendiente
- si hubo reintentos
- si hubo superposición o bloqueo
- si la ejecución fue parcial o completa

Sin eso, los jobs se convierten en una caja negra muy incómoda.

## Qué relación tiene esto con logs y métricas

Muy fuerte.

Suelen ser muy útiles cosas como:

- cantidad de items procesados
- cantidad de fallos
- tiempo total del job
- tiempo por item o lote
- backlog pendiente
- próxima ejecución
- última ejecución exitosa
- tasa de retry
- cantidad de elementos enviados a manejo manual o dead letter equivalente

No hace falta instrumentarlo todo desde el día uno.
Pero sí conviene entender que un job serio también necesita observabilidad seria.

## Qué relación tiene esto con health

Interesante también.

A veces un sistema puede estar “vivo” y “listo” para requests, pero tener jobs críticos totalmente frenados o atrasados.

Eso quizá no invalida toda la readiness inmediata, pero sí puede ser una señal importante de degradación operativa.

Por ejemplo:

- reconciliación de pagos atrasada
- job de expiraciones frenado
- recordatorios acumulándose
- sincronización interna rota

Otra vez se ve que la salud del sistema no siempre es solo request-response.

## Qué relación tiene esto con microservicios y distribución

Muy directa.

Cuando el sistema se distribuye más, a veces los jobs:

- viven en su propio proceso
- compiten por la misma base o cola
- necesitan coordinación
- trabajan sobre ownership de otros módulos
- dependen de mensajes o eventos
- participan en pipelines más largos

Eso los vuelve todavía más importantes y más delicados.

No son un apéndice menor.
Muchas veces son parte real del flujo de negocio.

## Qué no conviene hacer

No conviene:

- meter toda tarea rara en un cron sin semántica clara
- no pensar superposición
- no pensar idempotencia
- hacer jobs gigantescos opacos e imposibles de observar
- usar jobs para tapar diseño confuso que quizá debía resolverse antes en el modelo
- procesar lotes enormes sin estrategia de paginado o corte
- olvidar qué módulo es dueño de la lógica que el job ejecuta

Ese tipo de decisiones suele traer bastante dolor después.

## Otro error común

Creer que porque algo ocurre “en segundo plano” importa menos.
Muchas veces importa muchísimo, porque de ahí dependen:

- reconciliaciones
- vencimientos
- limpieza de estados
- reportes
- recordatorios
- consistencia operativa

## Otro error común

No distinguir entre:
- job periódico
- batch pesado
- reintento técnico
- mantenimiento
- proyección derivada
- flujo funcional real del negocio

Meter todo eso en la misma bolsa suele confundir bastante.

## Otro error común

Pensar que el schedule ya resolvió el problema.
En realidad todavía quedan preguntas clave como:

- qué procesa
- con qué criterio
- con qué locking
- con qué retries
- con qué observabilidad
- con qué semántica de dominio

## Una buena heurística

Podés preguntarte:

- ¿esta tarea nace del tiempo, de acumulación o de una condición periódica?
- ¿debe correr sí o sí aunque no haya requests?
- ¿cuánto volumen procesa y con qué frecuencia?
- ¿qué pasa si corre dos veces?
- ¿qué pasa si falla a mitad?
- ¿qué parte del dominio está tocando realmente?
- ¿cómo voy a saber si está sano o atrasado?

Responder eso te ayuda muchísimo a pasar de “un cron suelto” a un procesamiento periódico más serio.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque a cierta altura del backend ya no todo depende del tráfico online.
Empiezan a existir procesos de:

- vencimiento
- consolidación
- reproceso
- limpieza
- sincronización
- recordatorios
- mantenimiento
- cálculo periódico

Y esos procesos pueden ser tan importantes como una API pública.

Por eso este tema es una parte muy real del backend profesional.

## Relación con Spring Boot

Spring Boot puede ser una muy buena base para este tipo de trabajo, pero el framework no decide por vos:

- qué merece un job
- qué merece un batch
- qué frecuencia tiene sentido
- cómo evitar superposición
- qué es idempotente
- qué hay que observar
- qué backlog es aceptable

Eso sigue siendo diseño del sistema y del dominio.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando el backend ya tiene trabajo que no nace de una request ni de un evento puntual, conviene pensar jobs programados y procesamiento batch como parte seria de la arquitectura, diseñando su volumen, frecuencia, idempotencia, observabilidad y relación con el dominio para que no se conviertan en tareas opacas, frágiles o peligrosamente duplicables.

## Resumen

- No todo trabajo del backend nace de requests o eventos puntuales.
- Los jobs programados y el procesamiento batch aparecen cuando el tiempo, el mantenimiento o la acumulación generan trabajo propio.
- La idempotencia, la concurrencia y la observabilidad importan muchísimo también en estos procesos.
- No conviene subestimar la superposición, el volumen ni la semántica del dominio en los jobs.
- Un batch serio necesita más que un schedule: necesita criterio de corte, reintento, ownership y visibilidad.
- Este tema amplía la mirada del backend como sistema que no solo reacciona, sino que también ejecuta trabajo periódico esencial.
- A partir de acá la arquitectura empieza a incluir con más naturalidad flujos offline, mantenimiento y procesamiento operativo continuo.

## Próximo tema

En el próximo tema vas a ver cómo pensar despliegue continuo, releases y cambios seguros cuando el sistema ya tiene varios módulos, jobs, colas e integraciones sensibles, porque a esta altura ya no alcanza con “subir cambios”: importa muchísimo cómo cambiás el sistema sin romperlo.
