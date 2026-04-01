---
title: "Jobs distribuidos y colas de trabajo"
description: "Qué son los jobs distribuidos y las colas de trabajo, por qué son tan útiles en sistemas reales y cómo ayudan a desacoplar procesamiento, repartir carga y manejar trabajo asíncrono de forma más robusta."
order: 79
module: "Backend real e integraciones"
level: "intermedio"
draft: false
---

## Introducción

A medida que una aplicación crece, empieza a ser menos conveniente hacer todo dentro del mismo request HTTP.

Hay trabajos que:

- tardan demasiado
- pueden fallar por causas externas
- no necesitan terminar antes de responder al usuario
- conviene ejecutar en segundo plano
- pueden repartirse entre varios workers
- pueden reintentarse
- necesitan desacoplarse del flujo principal

Ahí aparecen dos ideas muy importantes en backend real:

- **colas de trabajo**
- **jobs distribuidos**

Son herramientas fundamentales para mover procesamiento fuera del request inmediato y para construir sistemas más robustos frente a carga, fallos y crecimiento.

## Qué es una cola de trabajo

Una cola de trabajo es un mecanismo donde una parte del sistema deja una tarea pendiente para que otra parte la procese después.

La idea básica es:

1. alguien genera trabajo
2. ese trabajo se encola
3. otro proceso o worker lo toma
4. lo ejecuta
5. registra resultado, error o reintento

En vez de hacer todo en el momento, el sistema delega trabajo para procesarlo de forma desacoplada.

## Qué es un job

Un job es una unidad de trabajo concreta que el sistema debe ejecutar.

Por ejemplo:

- enviar un email
- generar un PDF
- procesar una imagen
- sincronizar con un sistema externo
- recalcular un dato
- exportar un archivo
- ejecutar una conciliación
- notificar a otro servicio

La cola es el mecanismo de transporte y organización.
El job es la tarea concreta.

## Qué significa “distribuidos”

Cuando hablamos de jobs distribuidos, nos referimos a que ese trabajo no tiene por qué ejecutarse dentro de la misma instancia o proceso que recibió el request original.

Puede pasar esto:

- una API recibe una solicitud
- registra el trabajo
- una o varias instancias worker lo procesan
- el trabajo se reparte según capacidad

Eso permite desacoplar mejor responsabilidades y escalar procesamiento.

## Ejemplo intuitivo

Supongamos que un usuario hace una compra.

Después de crear la orden, el sistema podría necesitar:

- enviar email de confirmación
- generar comprobante
- informar a una integración externa
- registrar analítica
- notificar internamente

Podrías hacer todo dentro del mismo request.
Pero eso puede volver lenta y frágil la operación principal.

En cambio, podrías hacer esto:

1. guardar la orden
2. responder al usuario
3. encolar jobs para tareas secundarias
4. dejar que workers las procesen

Ese patrón es muy común en sistemas reales.

## Por qué esto importa tanto

Porque ayuda a resolver varios problemas a la vez.

### 1. Desacople

La operación principal no necesita ejecutar todo inmediatamente.

### 2. Mejor tiempo de respuesta

El usuario recibe respuesta más rápido.

### 3. Mayor robustez frente a fallos externos

Si una integración o servicio lento falla, no necesariamente rompe todo el flujo principal.

### 4. Reintentos controlados

Los jobs pueden reintentarse de forma ordenada.

### 5. Escalado más razonable

Podés aumentar workers sin tocar tanto la API principal.

### 6. Procesamiento diferido

Ideal para tareas que no requieren inmediatez absoluta.

## Diferencia entre tarea programada y cola de trabajo

Esto se relaciona con una lección anterior.

### Tarea programada

Se ejecuta según el tiempo.

Ejemplo:

- todos los días a las 02:00

### Cola de trabajo

Se ejecuta cuando aparece una unidad de trabajo pendiente.

Ejemplo:

- se creó una orden y se encola un email de confirmación

Ambos conceptos pueden convivir.
Incluso una tarea programada puede generar jobs en una cola.

## Productor y consumidor

Una forma simple de pensar este patrón es con dos roles.

### Productor

Es quien genera el job.

Por ejemplo:

- un controller
- un service
- una tarea programada
- un webhook recibido
- otro sistema

### Consumidor o worker

Es quien toma el job y lo procesa.

A veces hay uno.
A veces varios.

Esta separación ayuda mucho a desacoplar responsabilidades.

## Ejemplos típicos de jobs

## 1. Emails transaccionales

Después de un evento del negocio, se encola el envío.

## 2. Procesamiento de imágenes o archivos

Por ejemplo:

- generar miniaturas
- convertir formatos
- comprimir

## 3. Integraciones externas

Llamadas que pueden tardar o fallar.

## 4. Exportaciones

Generar archivos grandes fuera del request.

## 5. Recalcular métricas

Trabajo pesado o masivo.

## 6. Sincronizaciones

Importar o empujar datos entre sistemas.

## 7. Notificaciones

No solo email:
también push, webhooks salientes o alertas internas.

## Cuándo conviene usar una cola

Suele tener sentido cuando:

- el trabajo no necesita completarse antes de responder
- el proceso puede tardar
- hay dependencia de servicios externos
- querés reintentos ordenados
- querés repartir carga
- el volumen puede crecer
- el mismo tipo de trabajo aparece muchas veces

## Cuándo quizá no hace falta

No todo merece una cola.

Puede no hacer falta si:

- la tarea es trivial y muy rápida
- la respuesta depende de ese resultado inmediato
- el costo de complejidad supera el beneficio
- el sistema todavía es muy pequeño y el flujo es simple

No se trata de usar colas por moda, sino por necesidad real.

## Por qué no conviene meter todo en un request

Hacer demasiado dentro del request puede traer:

- latencia alta
- timeouts
- errores encadenados
- mala experiencia de usuario
- acoplamiento fuerte con servicios externos
- dificultades para escalar

Ejemplo típico:

- guardar orden
- llamar API externa
- enviar email
- generar factura
- procesar stock
- recalcular reportes

Todo eso junto puede ser demasiado frágil.

## Flujo típico con cola

Un patrón bastante sano puede ser:

1. ocurre la acción principal
2. se guarda el estado de negocio necesario
3. se encola uno o varios jobs
4. se responde rápido
5. workers procesan el resto
6. se registran resultados o fallos

Esto permite separar mejor:

- operación principal
- trabajo secundario o diferido

## Reintentos

Una gran ventaja de los jobs es que muchos pueden reintentarse si fallan.

Por ejemplo:

- el proveedor externo no responde
- hubo timeout
- falló una red temporalmente
- el servicio dependiente estaba caído

En vez de perder la operación para siempre, el sistema puede intentar de nuevo con cierta estrategia.

Pero ojo:

**reintentar sin control también puede ser peligroso.**

Por eso importan temas como:

- cantidad máxima de reintentos
- demoras entre intentos
- clasificación de errores
- idempotencia
- registro del historial

## Idempotencia en jobs

Este punto es fundamental.

Si un job se reprocesa, no debería generar efectos peligrosos repetidos.

Por ejemplo:

- no querés enviar cinco veces el mismo email crítico
- no querés descontar stock dos veces
- no querés crear duplicados en una integración

Como ya viste antes, cuando hay reintentos, timeouts o incertidumbre, la idempotencia deja de ser opcional.

## Jobs fallidos

No todos los jobs van a salir bien al primer intento.

Por eso conviene pensar:

- qué pasa si falla
- cuántas veces se reintenta
- cuándo se deja de intentar
- dónde queda registrado
- quién se entera
- si necesita intervención manual
- si debe ir a una cola de errores o estado fallido

Ignorar esto hace que el sistema pierda trazabilidad y confiabilidad.

## Dead letter y trabajos que no pudieron resolverse

Aunque no hace falta profundizar todavía en detalles de infraestructura, conceptualmente es útil entender que a veces un job puede fallar tantas veces que el sistema decide dejarlo aparte para revisión o tratamiento especial.

La idea es:

- no perderlo
- no reintentarlo infinitamente
- dejar registro de que requiere atención

Esto es muy importante en sistemas serios.

## Jobs distribuidos y escalado

Una cola también ayuda a repartir carga.

Si hay mucho trabajo pendiente, podés tener:

- 1 worker
- 2 workers
- 10 workers

según la necesidad.

Eso permite escalar procesamiento sin depender de que la API principal haga todo.

Por ejemplo:

- en una campaña, sube mucho el volumen de emails
- aumentás workers de ese tipo de job
- la API principal sigue más liviana

## Orden y concurrencia

No todos los jobs son iguales.

Algunas preguntas importantes son:

- ¿importa el orden?
- ¿se pueden procesar varios al mismo tiempo?
- ¿dos jobs sobre la misma entidad pueden chocar?
- ¿qué pasa si llegan antes de que otro termine?

No siempre hace falta resolver todo igual.
Pero el diseño importa mucho.

## Relación con integraciones externas

Las colas y los jobs son muy útiles cuando tu sistema depende de terceros.

Por ejemplo:

- proveedor de email
- almacenamiento externo
- pasarela de pagos
- sistema logístico
- servicio de notificaciones

Si una dependencia falla temporalmente, el job puede reintentarse sin bloquear el request original.

Eso vuelve la arquitectura bastante más robusta.

## Observabilidad

Conviene poder responder preguntas como:

- qué jobs se encolaron
- cuándo
- quién los generó
- cuántos están pendientes
- cuántos fallaron
- cuántos se reintentaron
- cuánto tardan
- cuál tipo de job da más problemas
- si hay acumulación
- si un worker está consumiendo correctamente

Esto es clave en operación real.

## Riesgo de usar colas sin criterio

Aunque son muy útiles, también agregan complejidad.

Por ejemplo:

- más componentes
- más estados posibles
- más casos de fallo
- procesamiento asíncrono más difícil de seguir
- consistencia menos inmediata
- depuración más compleja

Por eso no conviene usarlas “porque sí”.

Hay que usarlas donde realmente agregan valor.

## Cuándo un job debería ser síncrono igual

A veces una tarea necesita ejecutarse en el mismo flujo porque:

- la respuesta depende directamente del resultado
- no se puede aceptar consistencia diferida
- el trabajo es simple y rápido
- la operación no tiene sentido si ese paso no termina bien

En esos casos, una cola quizá no sea la herramienta correcta.

## Buenas prácticas iniciales

## 1. Separar claramente trabajo principal y trabajo diferido

Eso ayuda a decidir qué va a cola y qué no.

## 2. Diseñar jobs idempotentes cuando sea posible

Especialmente si pueden reintentarse.

## 3. Pensar desde el inicio qué pasa si el job falla

No dejarlo como detalle secundario.

## 4. Registrar estado y trazabilidad

Muy importante para soporte y operación.

## 5. Evitar reintentos infinitos

Eso puede empeorar mucho los problemas.

## 6. Revisar si realmente hace falta una cola

No todo debe pasar a async.

## 7. Medir latencia, backlog y fallos

La observabilidad es parte del diseño.

## Errores comunes

### 1. Mover trabajo a una cola sin pensar idempotencia

Después aparecen duplicados peligrosos.

### 2. Usar colas para todo

Eso agrega complejidad innecesaria.

### 3. No definir estrategia de error

Entonces los jobs fallidos quedan invisibles o se pierden.

### 4. No observar acumulación

Una cola puede llenarse y degradar el sistema.

### 5. Mezclar demasiadas responsabilidades en un mismo tipo de job

Conviene que las tareas sean claras.

### 6. Pensar que “asíncrono” significa “problema resuelto”

Solo cambia la forma del problema.
Todavía hay que diseñarlo bien.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué tareas de un e-commerce mandarías a cola?
2. ¿cuáles deberían seguir dentro del request?
3. ¿qué pasaría si un job de envío de email se reintenta varias veces?
4. ¿qué harías con un job que falla permanentemente?
5. ¿qué métricas te gustaría ver sobre tu sistema de jobs?

## Resumen

En esta lección viste que:

- una cola de trabajo permite dejar tareas pendientes para que otro proceso las ejecute después
- un job es una unidad concreta de trabajo, como enviar un email o procesar un archivo
- los jobs distribuidos permiten desacoplar procesamiento de la API principal y repartir carga entre workers
- esta estrategia mejora tiempos de respuesta, robustez y escalabilidad en muchos sistemas reales
- reintentos, idempotencia, trazabilidad y manejo de errores son aspectos fundamentales del diseño
- no todo merece una cola, pero cuando el trabajo es pesado, diferible o dependiente de terceros, suele ser una herramienta muy valiosa

## Siguiente tema

Ahora que ya entendés cómo usar jobs distribuidos y colas de trabajo para desacoplar procesamiento y manejar tareas asíncronas con más robustez, el siguiente paso natural es aprender sobre **diseño de backend para producto real**, porque ahí se juntan muchos de estos temas para pensar el sistema no solo como código funcional, sino como producto operable, escalable y mantenible.
