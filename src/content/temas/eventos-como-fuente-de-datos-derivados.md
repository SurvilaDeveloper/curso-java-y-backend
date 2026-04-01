---
title: "Eventos como fuente de datos derivados"
description: "Cómo usar eventos para construir datos derivados sin acoplar toda la lectura al modelo transaccional, qué tipos de eventos conviene emitir, cómo pensar proyecciones alimentadas por eventos, qué problemas aparecen con orden, duplicados y reprocesos, y por qué los eventos pueden convertirse en una base poderosa para reporting, monitoreo y modelos de lectura más expresivos."
order: 215
module: "Datos, reporting y procesamiento"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos algo central:

- el modelo de escritura no siempre sirve bien para leer
- muchas veces conviene construir **proyecciones**, **read models** o **vistas materializadas**
- la lectura puede necesitar otra forma, otra semántica y otra latencia
- y diseñar una estructura derivada no es duplicar por capricho, sino publicar una lectura más útil

Pero apenas aceptás eso, aparece una pregunta importante:

**de dónde salen esos datos derivados y cómo se actualizan sin convertir todo en una maraña de dependencias frágiles.**

Una respuesta muy poderosa es esta:

**usar eventos como fuente para derivar información.**

En vez de pensar únicamente en tablas finales, joins o procesos que escanean todo el sistema, empezás a pensar que cada cambio relevante puede dejar un rastro explícito.
Y ese rastro puede alimentar:

- dashboards
- read models
- métricas
- timelines
- conciliaciones
- alertas
- pipelines analíticos
- integraciones internas

La idea fuerte no es “usar eventos porque suena moderno”.
La idea fuerte es otra:

**si el sistema expresa bien qué cosas importantes ocurrieron, después resulta mucho más fácil derivar lecturas, estados y agregados sin depender siempre del modelo operativo crudo.**

Eso abre una forma distinta de pensar el backend.
No solo como un lugar donde se guardan estados actuales, sino también como un sistema que produce hechos observables sobre su propia evolución.

## Qué significa usar eventos como fuente de datos derivados

Significa que, cuando ocurre algo relevante en el sistema, ese hecho se registra o publica como un **evento**.
Y luego otros componentes usan esos eventos para construir estructuras derivadas.

Ejemplos:

- `OrderPlaced`
- `PaymentCaptured`
- `ShipmentDispatched`
- `RefundIssued`
- `SubscriptionRenewed`
- `InvoicePaid`
- `TenantProvisioned`
- `FeatureUsageRecorded`

Cada uno de esos eventos puede alimentar procesos que mantengan actualizado algún dato derivado.

Por ejemplo:

- un timeline de una orden
- un resumen diario de ventas
- un contador de uso por tenant
- un snapshot de salud de cobranza
- una proyección para soporte operativo
- una tabla analítica de actividad reciente

La intuición clave es esta:

**en lugar de reconstruir todo preguntándole siempre al estado actual, muchas veces conviene derivar información a partir de los hechos que fueron ocurriendo.**

## Estado actual vs historia de cambios

Muchísimos sistemas modelan muy bien el estado actual.

Por ejemplo:

- una orden está `paid`
- un envío está `delivered`
- una suscripción está `active`
- una factura está `overdue`

Eso está bien y es necesario.

Pero cuando querés contestar preguntas más ricas, el estado actual no siempre alcanza.

Por ejemplo:

- cuándo pasó de pendiente a pagada
- cuántas veces entró en revisión antifraude
- cuántos reintentos de cobro hubo
- cuánto tardó en despacharse
- si primero se canceló y después se reabrió
- cómo evolucionó el uso del tenant durante el mes

Ahí empieza a aparecer el valor de los eventos.
Porque los eventos no describen solo “cómo está ahora”, sino **qué ocurrió para que llegue hasta acá**.

Y eso sirve muchísimo para derivar:

- métricas temporales
- auditoría
- reporting incremental
- modelos de lectura orientados a timeline
- análisis de embudos
- detección de anomalías

## Evento no es lo mismo que fila cambiada

Éste es un punto importante.

Un evento útil no es simplemente “se modificó una fila”.
Un evento útil expresa un hecho con significado para el dominio.

No es lo mismo:

- “la columna `status` cambió de `PENDING` a `PAID`”

que:

- `PaymentCaptured`

El segundo dice mucho más.
Dice que ocurrió algo que el negocio entiende.
Y esa diferencia cambia por completo la utilidad del dato derivado.

Porque cuando los eventos tienen semántica de dominio:

- son más fáciles de consumir
- se entienden mejor entre equipos
- alimentan mejor proyecciones y métricas
- sobreviven mejor a cambios internos de implementación

La regla práctica es esta:

**si querés usar eventos como fuente de datos derivados, te conviene que los eventos hablen del negocio o de la operación relevante, no solo de detalles internos de persistencia.**

## Por qué los eventos son tan útiles para derivar datos

Porque desacoplan bastante la pregunta “qué ocurrió” de la pregunta “cómo está modelado internamente hoy”.

Eso trae varios beneficios.

### 1. Permiten procesamiento incremental

En vez de recalcular siempre desde cero, podés procesar solo lo nuevo.

Ejemplo:

- llega `OrderPlaced`
- incrementás contador de órdenes del día
- llega `RefundIssued`
- actualizás monto reembolsado
- llega `ShipmentDelivered`
- actualizás tiempo medio de fulfillment

No necesitás escanear toda la historia cada vez.

### 2. Hacen más natural construir timelines

Si los hechos ya están expresados como eventos, construir la historia de una entidad resulta mucho más sencillo.

### 3. Facilitan proyecciones específicas

Cada consumidor puede derivar la estructura que necesita:

- una proyección de soporte
- una de finanzas
- una de customer success
- una analítica

Todos parten de los mismos hechos, pero producen lecturas diferentes.

### 4. Reducen dependencia de joins operativos complejos

Muchos read models difíciles de construir leyendo tablas en vivo se vuelven más manejables si se actualizan al ritmo de eventos relevantes.

### 5. Ayudan a reprocesar

Si la historia de eventos está disponible, muchas veces podés volver a generar una proyección cuando cambia la lógica.

## Ejemplo mental: e-commerce

Imaginá que querés un modelo de lectura `order_operational_view`.

Necesita mostrar:

- id de la orden
- cliente
- total
- estado de pago
- estado de fulfillment
- tracking
- riesgo antifraude
- fecha del último evento relevante

Podrías construirlo leyendo muchas tablas en vivo.
Pero también podrías mantenerlo desde eventos como:

- `OrderPlaced`
- `PaymentAuthorized`
- `PaymentCaptured`
- `FraudReviewOpened`
- `FraudReviewApproved`
- `ShipmentCreated`
- `ShipmentDispatched`
- `ShipmentDelivered`
- `RefundIssued`
- `OrderCancelled`

Cada evento actualiza una parte de la proyección.

El valor de esta idea no es solo técnico.
Es también semántico.
La proyección refleja la historia operativa relevante, no solo el último estado bruto guardado en una tabla.

## Ejemplo mental: SaaS B2B

Supongamos que querés derivar una vista de salud por tenant.

Podrías consumir eventos como:

- `TenantProvisioned`
- `SubscriptionStarted`
- `SubscriptionRenewed`
- `InvoiceIssued`
- `InvoicePaid`
- `PaymentFailed`
- `UsageRecorded`
- `SeatLimitReached`
- `CriticalIncidentOpened`
- `CriticalIncidentResolved`

Con eso podrías alimentar un snapshot `tenant_health_snapshot` con campos como:

- `tenant_id`
- `current_plan`
- `billing_health`
- `usage_ratio`
- `recent_payment_failures`
- `open_incidents`
- `last_activity_at`
- `risk_score`

Nuevamente, no estás leyendo una sola tabla milagrosa.
Estás construyendo una lectura derivada a partir de hechos relevantes del sistema.

## Eventos como contrato interno de observación

Pensar en eventos también ayuda a madurar el diseño del backend.

Porque obliga a responder:

- qué hechos son realmente importantes
- cuándo consideramos que algo “ocurrió”
- con qué nombre y semántica lo expresamos
- qué datos mínimos acompañan ese hecho
- qué consumidores podrían derivar valor de él

Eso convierte a los eventos en una especie de contrato interno de observación.

No necesariamente un contrato público para terceros.
A veces ni siquiera algo externo al servicio.
Pero sí una forma explícita de decir:

**estas son las cosas que nuestro sistema considera significativas.**

Y eso, para reporting y procesamiento derivado, vale muchísimo.

## Qué debería tener un evento útil para derivaciones

No existe un formato único obligatorio, pero sí hay preguntas sanas.

### Identidad del evento

Cada evento debería poder identificarse de forma única.
Eso ayuda con:

- deduplicación
- trazabilidad
- idempotencia
- debugging

### Tipo de evento

Tiene que ser claro y semántico.

Ejemplos buenos:

- `OrderPlaced`
- `PaymentCaptured`
- `InvoiceOverdue`

Ejemplos pobres:

- `RowUpdated`
- `StatusChanged`
- `DataModified`

### Momento del hecho

No solo cuándo fue procesado, sino cuándo ocurrió según la semántica del sistema.

### Entidad afectada

Qué orden, tenant, factura, envío o usuario está involucrado.

### Datos relevantes para consumidores

Lo suficiente para derivar lectura útil sin obligar a mirar siempre cinco fuentes extra.
Pero sin convertir cada evento en un volcado completo y descontrolado del estado.

### Contexto de trazabilidad

Por ejemplo:

- correlación
- causalidad
- request id
- actor que originó el cambio

Esto ayuda mucho cuando después querés analizar cadenas completas de eventos.

## Uno de los grandes beneficios: agregar nuevas derivaciones sin tocar tanto el core

Si el sistema ya emite buenos eventos, muchas veces podés agregar nuevos consumidores derivados sin romper demasiado la lógica principal.

Ejemplos:

- sumar una nueva proyección para customer support
- agregar un pipeline de métricas de uso
- construir un feed de actividad reciente
- mantener un snapshot diario por tenant
- disparar alertas operativas

Todo eso puede crecer más sanamente si la fuente ya existe como flujo de hechos relevantes.

No hace falta que cada nueva necesidad de lectura entre a pelearse contra el modelo transaccional principal.

## Eventos y read models: una relación natural

En el tema anterior vimos que un read model es una estructura pensada específicamente para consulta.

Los eventos suelen ser una fuente muy natural para mantener esos read models.

Por ejemplo:

- `OrderPlaced` crea el registro inicial
- `PaymentCaptured` actualiza `payment_status`
- `ShipmentDispatched` actualiza `fulfillment_status`
- `RefundIssued` ajusta `refund_total`

El read model entonces no nace de “preguntar todo otra vez”, sino de **ir reaccionando a hechos relevantes**.

Eso puede dar lecturas:

- más rápidas
- más explícitas
- más cercanas a la semántica del negocio
- y más fáciles de adaptar a consumidores concretos

## Eventos y métricas derivadas

Otra aplicación fuertísima es la generación de métricas.

Por ejemplo, a partir de eventos podrías derivar:

- órdenes creadas por hora
- pagos capturados por gateway
- tiempo promedio entre orden y despacho
- tasa de rechazo antifraude
- uso diario por tenant
- facturas vencidas por plan
- churn por cohorte

En todos esos casos, los eventos permiten construir agregados incrementales.

La ventaja es enorme frente a recalcular todo constantemente sobre tablas operativas pesadas.

Pero eso no te habilita a ser descuidado.
Tenés que pensar bien:

- la ventana temporal
- el criterio de agregación
- qué pasa con eventos tardíos
- cómo corregís eventos erróneos
- cómo reprocesás si cambia la lógica de negocio

## Eventos y auditoría

Cuando el sistema expresa hechos relevantes como eventos, la auditoría mejora muchísimo.

No porque “guardar eventos” resuelva mágicamente todo.
Sino porque deja mejor registrado:

- qué pasó
- cuándo
- sobre qué entidad
- disparado por quién o por qué proceso
- con qué correlación operativa

Eso sirve para:

- investigar incidentes
- reconstruir timelines
- justificar cambios sensibles
- analizar procesos operativos
- responder preguntas de negocio con contexto temporal

## Eventos y replay

Una de las ideas más poderosas aparece cuando podés **reprocesar** eventos.

Por ejemplo, supongamos que cambió la lógica para calcular:

- score de riesgo
- ingresos reconocidos
- salud de tenant
- clasificación de incidentes

Si tenés una historia de eventos adecuada, podrías regenerar una proyección o agregado con la nueva lógica.

Eso no siempre será trivial ni barato.
Pero conceptualmente es muy valioso.

Porque ya no dependés solo del estado final actual.
Tenés una secuencia de hechos desde la cual reconstruir una lectura derivada.

## El problema del orden

Ahora vienen las dificultades reales.

Una de las más importantes es el **orden**.

En la práctica, los eventos pueden:

- llegar fuera de orden
- demorarse
- duplicarse
- reprocesarse
- fallar parcialmente

Entonces, si tu proyección asume orden perfecto, tarde o temprano vas a tener inconsistencias.

Ejemplo:

- llega `ShipmentDelivered`
- después llega tarde `ShipmentDispatched`

Si no pensaste la lógica, podrías dejar un estado incoherente.

Preguntas sanas:

- el orden importa para esta proyección
- cómo detecto eventos viejos o tardíos
- qué timestamp manda
- puedo recalcular desde una fuente más estable si se desordena demasiado
- necesito versionado por entidad

## El problema de los duplicados

Éste también aparece muchísimo.

Un consumidor puede recibir el mismo evento más de una vez por:

- reintentos
- reprocesos
- fallas de red
- garantías at-least-once

Si tu derivación no es idempotente, un duplicado puede romper métricas o estados.

Ejemplos clásicos:

- contar dos veces una venta
- sumar dos veces uso
- duplicar una transición
- inflar montos de facturación

Por eso, usar eventos como fuente de datos derivados exige pensar seriamente en:

- identificadores únicos de evento
- reglas de deduplicación
- actualizaciones idempotentes
- marcas de procesamiento

## El problema de la semántica temporal

Otra trampa es confundir:

- cuándo ocurrió el hecho
- cuándo lo emitiste
- cuándo lo consumiste
- cuándo quedó reflejado en la proyección

Para datos derivados esto importa muchísimo.

Porque no es lo mismo:

- ventas del día según hora de orden
- ventas del día según hora de captura de pago
- ventas del día según hora de ingestión en analytics

Los tres pueden ser válidos.
Pero no significan lo mismo.

Cuando trabajás con eventos, esta claridad temporal deja de ser un lujo y pasa a ser una necesidad.

## Eventos “finos” vs eventos “gruesos”

Otra decisión importante es el nivel de granularidad.

### Eventos más finos

Ejemplos:

- `PaymentAuthorized`
- `PaymentCaptured`
- `PaymentCaptureFailed`
- `PaymentRefunded`

Ventajas:

- más expresividad
- mejor análisis de procesos
- mejor auditoría
- más flexibilidad para derivaciones futuras

Costos:

- más volumen
- más complejidad
- más consumidores que mantener

### Eventos más gruesos

Ejemplos:

- `PaymentStateChanged`
- `OrderUpdated`

Ventajas:

- menos volumen conceptual
- menos tipos de evento

Costos:

- menor claridad semántica
- más trabajo interpretativo del consumidor
- peor capacidad analítica futura

No hay una respuesta universal.
Pero para datos derivados suele ayudar mucho que los eventos expresen **hechos relevantes y distinguibles**, no cambios vagos demasiado comprimidos.

## Qué errores aparecen mucho

### 1. Emitir eventos sin semántica de negocio

Después nadie sabe qué significan realmente.

### 2. Pretender que cada evento lleve todo el estado completo

Eso vuelve el esquema pesado, frágil y difícil de evolucionar.

### 3. Construir derivaciones sin idempotencia

Y entonces duplicados o reintentos rompen todo.

### 4. No definir qué tiempo representa cada métrica

Lo que genera dashboards ambiguos y discusiones eternas.

### 5. Pensar que un evento es automáticamente verdad absoluta

A veces un hecho se corrige, se revierte o se compensa.
La derivación tiene que contemplar eso.

### 6. No diseñar replay o recomputación

Cuando cambia la lógica, nadie sabe cómo regenerar datos derivados de forma segura.

### 7. Publicar demasiados eventos irrelevantes

Eso produce ruido y dificulta distinguir qué importa de verdad.

## Cuándo conviene mucho pensar en eventos

Hay señales bastante claras.

### Señales de que ayudan mucho

- querés construir varias proyecciones distintas desde los mismos hechos
- necesitás timelines o trazabilidad temporal
- las métricas se benefician de procesamiento incremental
- el sistema tiene integraciones internas o varios consumidores
- querés desacoplar lecturas derivadas del modelo operativo crudo
- necesitás capacidad de reproceso
- querés detectar anomalías o patrones de comportamiento

### Señales de que todavía no hace falta tanto

- el sistema es pequeño y pocas lecturas exigen historia temporal
- las consultas siguen siendo simples sobre el estado actual
- la complejidad de infraestructura sería mayor que el valor inmediato
- todavía no identificaste hechos realmente relevantes y estables

Como siempre, el punto no es meter eventos por moda.
El punto es reconocer cuándo ayudan a representar mejor el sistema y a derivar datos con menos fricción.

## Mini ejercicio mental

Imaginá un SaaS con:

- tenants
- suscripciones
- invoices
- usage metering
- incidentes
- soporte

Preguntas para pensar:

- qué hechos del sistema hoy merecerían un evento claro
- qué dashboard o snapshot podrías derivar a partir de ellos
- qué métrica incremental te sería más fácil calcular con eventos que con queries full scan
- qué eventos necesitarías para reconstruir la salud de un cliente enterprise
- qué harías si un evento llega duplicado o tarde
- qué semántica temporal usarías para medir churn, uso o cobranza

## Resumen

Usar eventos como fuente de datos derivados es una forma poderosa de construir reporting, proyecciones y modelos de lectura más expresivos sin depender siempre del modelo transaccional en vivo.

La idea central de este tema es esta:

**si el sistema expresa bien los hechos relevantes que van ocurriendo, después resulta mucho más natural derivar lecturas, agregados, métricas y snapshots con mejor semántica, mejor incrementalidad y más capacidad de reproceso.**

Eso permite:

- construir read models más claros
- mantener timelines operativos
- derivar métricas incrementales
- mejorar auditoría y trazabilidad
- agregar nuevos consumidores con menos acoplamiento
- y separar mejor operación transaccional de procesamiento derivado

Pero también exige cuidar:

- semántica de los eventos
- orden
- duplicados
- idempotencia
- temporalidad
- replay
- y consistencia de las proyecciones derivadas

Cuando eso está bien pensado, los eventos dejan de ser solo mensajes que “pasan por ahí”.
Pasan a convertirse en una base muy útil para construir inteligencia operativa y analítica sobre el sistema.
Y eso nos deja listos para el siguiente tema, donde vamos a bajar a otro tipo de procesamiento clave para datos derivados:

**batch processing y ventanas de procesamiento.**
