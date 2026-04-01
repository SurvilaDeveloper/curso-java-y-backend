---
title: "Tareas programadas y procesos batch"
description: "Qué son las tareas programadas y los procesos batch, para qué sirven en un backend real, y cómo pensar trabajos automáticos que corren fuera del request inmediato del usuario."
order: 72
module: "Backend real e integraciones"
level: "intermedio"
draft: false
---

## Introducción

No todo lo que hace un backend ocurre como respuesta inmediata a una acción del usuario.

Muchas veces, un sistema también necesita ejecutar trabajo de manera automática:

- todos los días a una hora determinada
- cada cierta cantidad de minutos
- al finalizar el día
- en segundo plano
- sobre muchos registros a la vez
- sin que haya un request HTTP disparándolo en ese momento

Ahí aparecen dos conceptos muy importantes:

- **tareas programadas**
- **procesos batch**

Estos temas son muy comunes en sistemas reales, porque no todo pasa en un controller ni en una petición puntual del frontend.

Por ejemplo, un sistema puede necesitar:

- enviar recordatorios automáticos
- limpiar tokens vencidos
- recalcular estadísticas
- generar reportes nocturnos
- sincronizar información con otro sistema
- cerrar órdenes expiradas
- procesar colas de trabajo
- exportar datos
- actualizar estados vencidos
- ejecutar conciliaciones

Todo eso forma parte del trabajo real de muchos backends.

## Qué es una tarea programada

Una tarea programada es un proceso que el sistema ejecuta automáticamente según alguna regla de tiempo.

Por ejemplo:

- cada 5 minutos
- todos los días a las 02:00
- una vez por hora
- cada lunes
- al final de cada mes

La idea es que no haga falta que un usuario entre a una pantalla y toque un botón para que ese trabajo ocurra.

El propio sistema lo ejecuta.

## Qué es un proceso batch

Un proceso batch es un trabajo que procesa un conjunto de datos o una gran cantidad de registros de manera agrupada.

Por ejemplo:

- recorrer todas las órdenes pendientes
- actualizar miles de registros
- generar una exportación de datos
- recalcular saldos
- procesar un archivo de importación
- consolidar movimientos
- generar facturación
- enviar una tanda de emails

La palabra “batch” suele asociarse a trabajos por lote o por bloques.

No siempre un proceso batch está programado por horario, pero muchas veces sí.

## Diferencia entre ambos conceptos

Están relacionados, pero no son exactamente lo mismo.

### Tarea programada

Se enfoca en **cuándo** corre algo.

Ejemplo:

- correr todos los días a las 03:00

### Proceso batch

Se enfoca más en **qué tipo de trabajo** se hace.

Ejemplo:

- recorrer 50.000 registros y actualizarlos por lote

A veces tenés ambas cosas juntas:

- una tarea programada
- que dispara un proceso batch

Por ejemplo:

“todos los días a la 01:00, recalcular intereses de todas las cuentas activas”.

## Por qué esto importa en un backend real

Cuando uno empieza con backend, casi todo gira alrededor de:

- controller
- request
- response
- base de datos
- frontend que consume la API

Pero en aplicaciones reales, hay muchas responsabilidades que no dependen de una interacción instantánea.

Por ejemplo:

- limpiar información vieja
- renovar estados
- detectar vencimientos
- enviar alertas
- sincronizar catálogos
- consolidar información
- generar reportes internos
- procesar colas
- recalcular métricas

Es decir:

**un backend real no solo responde requests.  
También ejecuta trabajo automático y diferido.**

## Ejemplos típicos

## 1. Limpiar tokens o sesiones vencidas

Cada cierto tiempo, el sistema elimina registros expirados.

## 2. Cerrar órdenes pendientes

Si una orden quedó sin pago durante demasiado tiempo, se puede cancelar automáticamente.

## 3. Enviar recordatorios

Por ejemplo, mails de vencimiento, turnos o tareas pendientes.

## 4. Generar reportes

Muchos reportes pesados se generan fuera del request del usuario.

## 5. Sincronizar con sistemas externos

Por ejemplo, importar productos, estados logísticos o cotizaciones.

## 6. Recalcular métricas

A veces conviene recalcular ciertos datos cada cierto tiempo en vez de hacerlo en tiempo real.

## 7. Procesar archivos

Cuando alguien sube un archivo, el sistema puede procesarlo en segundo plano.

## Por qué no conviene hacer todo dentro del request HTTP

A veces un desarrollador intenta meter demasiado trabajo dentro de un endpoint.

Por ejemplo:

- crear una orden
- enviar emails
- generar factura
- llamar a un sistema externo
- actualizar analíticas
- recalcular métricas
- generar PDF
- impactar en otro sistema

Todo eso dentro de una sola petición puede traer problemas:

- respuestas lentas
- timeouts
- errores difíciles de manejar
- mala experiencia de usuario
- operaciones frágiles
- acoplamiento excesivo

Por eso muchas veces conviene separar:

- lo urgente e inmediato
- de lo pesado o diferido

## Trabajo inmediato vs trabajo diferido

### Trabajo inmediato

Es lo que tiene que pasar sí o sí para responder correctamente al usuario.

Por ejemplo:

- validar datos
- guardar una entidad
- responder que la operación fue aceptada

### Trabajo diferido

Es lo que puede ejecutarse después, sin bloquear la respuesta principal.

Por ejemplo:

- enviar un email
- recalcular estadísticas
- generar un reporte
- procesar una exportación
- sincronizar con otro sistema

Pensar esta separación es una habilidad muy importante en backend profesional.

## Casos donde una tarea programada tiene sentido

Conviene pensar en tareas programadas cuando:

- el trabajo depende del tiempo
- no hace falta intervención manual
- el sistema tiene que mantenerse solo
- hay tareas repetitivas
- no querés depender de que alguien recuerde ejecutar algo
- necesitás consistencia operativa

Ejemplos:

- “todos los días a medianoche”
- “cada 10 minutos”
- “cada hora”
- “todos los lunes”
- “al inicio de cada mes”

## Casos donde un batch tiene sentido

Conviene pensar en procesamiento batch cuando:

- hay muchos registros
- el trabajo masivo sería costoso en tiempo real
- no necesitás resolver todo en un request
- querés agrupar operaciones
- el proceso puede ejecutarse en bloques
- necesitás importar o exportar información

## Ejemplo conceptual

Supongamos un e-commerce.

El sistema necesita:

- detectar órdenes pendientes de pago vencidas
- cambiar su estado a CANCELLED
- liberar stock reservado
- registrar auditoría
- quizá notificar al usuario

Eso podría resolverse con una tarea programada que corra cada cierto tiempo.

No hace falta que un admin esté entrando todos los días a revisar eso a mano.

El sistema puede hacerlo solo.

## Otro ejemplo conceptual

Supongamos una aplicación con suscripciones.

Todos los días el sistema debe:

- revisar suscripciones vencidas
- cambiar el plan o el estado
- limitar acceso
- generar un aviso

Eso también encaja perfectamente en una tarea automática.

## Procesos batch y volumen de datos

Cuando trabajás con pocos registros, todo parece simple.

Pero en sistemas reales a veces tenés:

- miles de usuarios
- miles de órdenes
- cientos de miles de movimientos
- grandes tablas
- muchas integraciones

Ahí aparece otra preocupación:

**no solo hay que hacer el trabajo.  
También hay que hacerlo de forma eficiente.**

Por eso en batch importa mucho pensar:

- tamaño de los lotes
- paginación
- memoria
- tiempo de ejecución
- reintentos
- logging
- tolerancia a fallos

## Riesgos comunes

Trabajar con tareas programadas y batch tiene ventajas, pero también desafíos.

### 1. Ejecutar dos veces lo mismo

Si una tarea corre dos veces por error, puede duplicar efectos.

Por eso estos procesos suelen relacionarse mucho con:

- idempotencia
- locks
- control de estado
- registros de ejecución

### 2. Procesar demasiado en memoria

Cargar demasiados datos de golpe puede romper el rendimiento.

### 3. Bloquear demasiado la base de datos

Ciertos procesos masivos pueden generar carga o locks innecesarios.

### 4. No registrar qué pasó

Si una tarea falla y no deja trazabilidad, después cuesta muchísimo diagnosticar el problema.

### 5. Hacer tareas muy pesadas en una sola unidad

A veces conviene partir el trabajo en bloques más pequeños.

### 6. No definir qué pasa si algo falla a la mitad

En procesos reales, eso hay que pensarlo de antemano.

## Preguntas importantes al diseñar una tarea automática

Cuando diseñás una tarea programada o batch, conviene preguntarte:

1. ¿qué dispara esta tarea?
2. ¿cada cuánto debería ejecutarse?
3. ¿qué volumen de datos puede procesar?
4. ¿qué pasa si tarda más de lo esperado?
5. ¿qué pasa si falla?
6. ¿qué pasa si se vuelve a ejecutar?
7. ¿cómo sé si ya se procesó?
8. ¿qué logs o métricas necesito?
9. ¿puedo dividir el trabajo?
10. ¿debe ser transaccional total o por bloques?

Estas preguntas son mucho más importantes que “cómo anotar una expresión cron”.

## Relación con Spring Boot

En el ecosistema Java y Spring, este tema suele aparecer con herramientas y conceptos como:

- tareas agendadas
- scheduling
- jobs
- procesamiento en background
- Spring Scheduler
- Spring Batch
- colas y workers

En esta etapa del curso, lo importante es entender bien la lógica conceptual antes de profundizar en herramientas concretas.

Primero hay que entender:

- por qué existe este problema
- cuándo usar estas estrategias
- qué riesgos tienen
- cómo diseñarlas bien

Después tiene sentido meterse en implementación.

## Tarea programada no significa “solución mágica”

No porque algo corra en segundo plano automáticamente significa que ya esté bien diseñado.

Una tarea automática mal pensada puede ser peligrosa si:

- corre demasiado seguido
- duplica efectos
- falla sin dejar rastros
- consume demasiados recursos
- procesa mal estados intermedios
- impacta negativamente en otras partes del sistema

Por eso este tema no es solamente técnico.
También es de diseño operativo.

## Cuándo evitar una tarea programada

No todo debería resolverse con cron o tareas automáticas.

A veces no conviene si:

- el trabajo debe ocurrir exactamente al momento de una acción del usuario
- el caso requiere procesamiento orientado a eventos
- conviene una cola
- la operación necesita respuesta inmediata
- el problema en realidad se resuelve mejor con otro diseño

Es decir:

**las tareas programadas son una herramienta más, no la respuesta universal a todo.**

## Diferencia entre tarea programada y cola de trabajo

Esto es importante.

### Tarea programada

El sistema corre algo según el tiempo.

Ejemplo:

- cada 15 minutos revisar vencimientos

### Cola de trabajo

Un evento o acción genera una unidad de trabajo para procesar.

Ejemplo:

- cuando se crea una orden, se encola el envío del email de confirmación

Ambas cosas pueden convivir, pero no son lo mismo.

## Buenas prácticas iniciales

## 1. Definir bien la responsabilidad

Cada tarea debería tener un objetivo claro.

## 2. Mantener el proceso observable

Necesitás logs, métricas y algún criterio para detectar fallos.

## 3. Diseñar pensando en reintentos

En sistemas reales, los reintentos existen.

## 4. Evitar trabajos gigantes si podés dividirlos

Procesar por páginas o por bloques suele ser más sano.

## 5. No depender de memoria local para todo

Especialmente si el sistema puede escalar a varias instancias.

## 6. Pensar en impacto operativo

Una tarea pesada puede afectar rendimiento, base de datos o integraciones.

## 7. Tener criterio de éxito y de error

No alcanza con “se ejecutó”.
Importa saber si terminó bien, qué hizo y qué faltó.

## Errores comunes

### 1. Poner lógica pesada en un controller solo porque “es más directo”

Eso puede volver lentísima la API.

### 2. Hacer una tarea masiva sin considerar volumen real

Con pocos datos parece andar bien, pero en producción explota.

### 3. No registrar ejecución, errores y resultados

Después no sabés si corrió, si falló o si quedó a medias.

### 4. Diseñar el proceso sin pensar en idempotencia

Un reproceso puede duplicar efectos.

### 5. Cargar todos los registros de golpe

Mala idea en procesos grandes.

### 6. Programar demasiado seguido algo que no lo necesita

Eso consume recursos innecesariamente.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué tareas automáticas necesitaría un e-commerce?
2. ¿qué procesos batch podrían existir en un sistema de facturación?
3. ¿qué convendría hacer dentro del request y qué fuera del request?
4. ¿qué riesgos aparecen si una tarea programada corre dos veces?
5. ¿cómo harías observable un proceso que corre de madrugada?

## Resumen

En esta lección viste que:

- una tarea programada es un trabajo que se ejecuta automáticamente según una regla temporal
- un proceso batch procesa conjuntos de datos o grandes volúmenes de registros
- en sistemas reales, no todo ocurre dentro de requests HTTP
- muchas tareas importantes del backend se ejecutan en segundo plano o en horarios determinados
- separar trabajo inmediato de trabajo diferido ayuda a diseñar sistemas más robustos
- en estos procesos importan mucho la idempotencia, la observabilidad, el volumen de datos, los reintentos y la tolerancia a fallos
- entender el problema conceptual es el paso previo a usar herramientas concretas como schedulers, jobs o frameworks de batch

## Siguiente tema

Ahora que ya entendés por qué muchos backends necesitan ejecutar trabajo automático fuera del request del usuario, el siguiente paso natural es aprender sobre **subida y gestión de archivos**, porque en aplicaciones reales también es muy común manejar imágenes, documentos, exportaciones y otros recursos persistidos fuera de la base de datos.
