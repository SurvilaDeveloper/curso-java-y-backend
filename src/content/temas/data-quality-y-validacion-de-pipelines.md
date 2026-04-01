---
title: "Data quality y validación de pipelines"
description: "Qué significa calidad de datos en pipelines reales, por qué un flujo técnicamente exitoso puede producir información incorrecta, cómo definir reglas de validación, controles de completitud, unicidad, consistencia y frescura, qué hacer frente a datos tardíos, corruptos o inesperados, y cómo diseñar pipelines que no solo muevan datos sino que también detecten cuándo los resultados dejaron de ser confiables."
order: 218
module: "Datos, reporting y procesamiento"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos streaming y procesamiento incremental.

Vimos que:

- un sistema puede actualizar derivados continuamente
- que no todo se resuelve con batch
- que el incremental sirve para reflejar cambios con baja latencia
- y que aparecen problemas reales como duplicados, orden, estado y correcciones

Pero todo eso abre una pregunta todavía más importante.

No alcanza con que un pipeline:

- procese rápido
- no se caiga
- mueva mensajes
- o termine "en verde"

Porque un pipeline puede estar técnicamente sano y, aun así, estar produciendo información equivocada.

Puede:

- perder registros sin romperse visiblemente
- duplicar eventos sin lanzar errores
- mezclar monedas o unidades incompatibles
- calcular métricas con campos incompletos
- retrasarse tanto que los datos ya no sirvan
- o poblar dashboards con números que parecen razonables pero son falsos

Ahí entra un tema central para cualquier backend data-aware:

**data quality y validación de pipelines.**

La idea profunda es simple:

**un pipeline no vale solo por mover datos; vale por producir datos suficientemente correctos, completos, consistentes y oportunos para el uso que el negocio necesita.**

## Qué significa calidad de datos

Cuando se habla de calidad de datos, muchas personas piensan en “datos limpios” como una idea vaga.

Pero en sistemas reales conviene volverlo concreto.

La calidad de datos suele involucrar preguntas como:

- ¿están todos los registros que deberían estar?
- ¿hay duplicados que no deberían existir?
- ¿los campos importantes vienen completos?
- ¿los valores caen dentro de rangos razonables?
- ¿las relaciones entre entidades siguen siendo válidas?
- ¿la semántica del dato es coherente con el dominio?
- ¿el dato llega a tiempo para seguir siendo útil?
- ¿el derivado refleja correctamente la realidad operativa?

Es decir:

**calidad no es una propiedad abstracta; es el grado en que los datos sirven confiablemente para un propósito real.**

## Un pipeline puede “funcionar” y estar mal

Ésta es una de las trampas más comunes.

Muchas veces se monitorea si el pipeline:

- corrió
- terminó
- no devolvió error
- movió N registros
- escribió en una tabla destino

Y eso da una falsa sensación de seguridad.

Pero imaginá estos casos:

- el job terminó bien, pero faltó el 12% de los registros porque una fuente respondió parcial
- el stream consumió sin fallar, pero procesó dos veces un lote por reintentos
- la tabla destino se actualizó, pero con timestamps en zona horaria incorrecta
- la transformación corrió completa, pero mezcló órdenes canceladas con órdenes confirmadas
- el dashboard muestra ventas “del día” usando evento de ingestión y no de negocio

Desde infraestructura, puede parecer todo normal.
Desde negocio, está roto.

Por eso la calidad de datos necesita controles propios, no solo controles de ejecución técnica.

## Dimensiones típicas de calidad

Aunque cada sistema define sus propias reglas, hay varias dimensiones que aparecen mucho.

### Completitud

¿Está llegando todo lo que debería llegar?

Ejemplos:

- todas las órdenes confirmadas del día aparecen en la tabla analítica
- cada pago capturado generó su evento derivado
- cada tenant con uso reportado tiene su consolidación mensual

### Unicidad

¿Un hecho aparece una sola vez cuando así debería ocurrir?

Ejemplos:

- una orden no debería contarse dos veces
- un evento con mismo `event_id` no debería generar dos acumulaciones
- una invoice no debería emitirse duplicada por reintento

### Validez

¿Los valores cumplen reglas básicas?

Ejemplos:

- cantidades no negativas
- moneda dentro de un conjunto permitido
- email con formato aceptable
- timestamps parseables
- estado dentro del enum esperado

### Consistencia

¿Los datos se sostienen entre sí?

Ejemplos:

- el total de la orden coincide con la suma de líneas, descuentos e impuestos
- una devolución no supera lo comprado
- un envío no aparece entregado antes de ser despachado
- un consumo por tenant no puede existir sin tenant válido

### Frescura

¿El dato llegó dentro de una latencia útil?

Ejemplos:

- un panel operativo no sirve si tiene tres horas de retraso
- una alerta de fraude tardía puede perder valor
- una métrica comercial puede tolerar minutos, pero no un día completo

### Integridad referencial o semántica

¿Las relaciones y significados siguen teniendo sentido en el dominio?

Ejemplos:

- el producto existe
- el plan del tenant es reconocible
- el carrier referenciado está habilitado
- la categoría o canal reportado pertenece a valores válidos del negocio

## Calidad de datos no es lo mismo que validación de input

Esto es importante.

Ya vimos validación defensiva en APIs y entrada de datos.
Eso protege al sistema en el momento de recibir información.

Pero acá hablamos de otra capa.

En pipelines, la pregunta no es solo:

- “¿este payload tiene formato correcto?”

También es:

- “¿este registro tiene sentido dentro del dataset?”
- “¿es coherente con otros registros?”
- “¿llegó en tiempo útil?”
- “¿puedo confiar en este agregado?”
- “¿el derivado sigue alineado con la fuente?”

La calidad de datos mira el dato en contexto, no solo en aislamiento.

## Ejemplo mental: ventas del día

Imaginá que tenés un dashboard de ventas diarias.

Podrían aparecer varios tipos de problemas:

- faltan órdenes de cierto canal
- se duplican pagos confirmados
- algunas ventas entran con la fecha de procesamiento y no con la fecha real de compra
- los montos vienen mezclados entre ARS y USD sin normalización
- se están incluyendo órdenes anuladas por un cambio de lógica

El pipeline puede seguir “corriendo”.
Pero el número ya no representa ventas confiables.

Ésta es la diferencia entre:

- pipeline técnicamente operativo
- pipeline semánticamente confiable

## Reglas de calidad explícitas

Un error común es dejar la calidad como intuición humana.

Entonces alguien revisa dashboards, nota algo raro y recién ahí empieza la investigación.

Eso llega tarde.

Un enfoque mejor es definir reglas explícitas.

Ejemplos:

- porcentaje máximo permitido de campos nulos en columnas críticas
- unicidad obligatoria de cierta clave de negocio
- rango válido para importes, cantidades o porcentajes
- tolerancia de delay aceptable por dataset
- correspondencia esperada entre conteo de origen y destino
- diferencia máxima tolerable entre una tabla consolidada y una fuente oficial

La lógica es ésta:

**si algo es importante para confiar en el dato, debería existir una regla verificable que lo exprese.**

## Controles en distintos niveles

La validación no tiene por qué existir en un solo punto.

Puede haber controles en varias capas.

### En la ingesta

- formato mínimo válido
- campos obligatorios presentes
- schema compatible
- timestamp interpretable
- clave idempotente disponible

### En la transformación

- enums válidos
- unidades consistentes
- relaciones lógicas correctas
- derivaciones matemáticamente válidas
- reglas del dominio respetadas

### En la carga o publicación

- conteo esperado de registros
- duplicados detectados
- constraints de unicidad
- integridad referencial
- comparación con baseline o snapshot anterior

### Después de publicar

- reconciliación con fuentes de verdad
- tests sobre agregados
- monitoreo de drift o cambios bruscos
- alertas de frescura
- chequeos de consistencia transversal

## Data contracts y schemas

En muchos pipelines, la primera línea de defensa es el contrato del dato.

Eso incluye cosas como:

- nombre y tipo de campos
- obligatoriedad
- significado
- formato temporal
- unidades
- valores permitidos
- reglas de evolución

Esto es importante porque muchos errores nacen cuando una fuente cambia sin coordinación.

Ejemplos:

- `amount` deja de venir en centavos y pasa a unidad monetaria
- `status` agrega nuevos valores no contemplados
- un campo se vuelve opcional sin avisar
- una marca temporal cambia de zona horaria
- una clave deja de ser estable

Sin contrato claro, el pipeline puede seguir aceptando datos y degradarse silenciosamente.

## Schema válido no garantiza semántica válida

Ésta es otra distinción clave.

Un payload puede cumplir el schema y aun así estar mal para negocio.

Ejemplos:

- `total = -500`
- `currency = ARS`, pero el monto en realidad vino en USD
- `order_status = shipped`, pero la orden nunca fue pagada
- `refund_amount` mayor al monto cobrado
- `delivered_at` antes de `shipped_at`

Por eso los schemas son necesarios, pero insuficientes.

Necesitás además validaciones semánticas de dominio.

## Calidad en pipelines batch

En batch, aparecen patrones bastante claros.

Podés validar:

- cantidad de archivos esperados
- tamaño mínimo o máximo razonable
- columnas obligatorias
- porcentaje de nulos
- distribución de valores
- conteo de registros respecto del día anterior
- checksum o huella del archivo
- consistencia entre subtotales y totales

También podés definir umbrales para decidir:

- continuar
- detener el job
- continuar con warning
- publicar parcialmente con marca de dato incompleto

Batch facilita mucho ciertos controles porque trabaja sobre conjuntos cerrados.

## Calidad en streaming

En streaming la cosa se vuelve más delicada.

Porque el dato está entrando continuamente y no siempre sabés cuándo algo está “completo”.

Aparecen controles como:

- tasa de eventos por ventana
- porcentaje de mensajes inválidos
- lag de consumo
- tiempo desde ocurrencia hasta procesamiento
- duplicados por clave en una ventana
- gaps anómalos en secuencias
- volumen inesperadamente bajo o alto respecto a baseline

También necesitás pensar qué hacer cuando algo falla.

Ejemplos:

- ¿descartás el evento?
- ¿lo mandás a dead-letter?
- ¿lo retenés para reproceso?
- ¿bloqueás el pipeline?
- ¿marcás el derivado como potencialmente incompleto?

Streaming obliga a diseñar no solo validación, sino también reacción operacional.

## Fail fast vs tolerancia controlada

No todos los datasets admiten la misma estrategia.

A veces conviene fallar rápido.

Ejemplos:

- facturación
- conciliación de pagos
- liquidaciones
- datos regulatorios

Ahí publicar un dato dudoso puede ser peor que no publicar nada.

Otras veces conviene tolerar y marcar.

Ejemplos:

- dashboard exploratorio
- métrica operativa no crítica
- ranking en tiempo casi real
- alertas auxiliares

Ahí quizá preferís seguir operando, pero dejando claro que el dato está degradado.

La decisión depende del costo de:

- frenar el sistema
- publicar algo parcialmente incorrecto
- corregir después
- y confundir a usuarios o equipos internos

## Reconciliación con fuente de verdad

Muchos pipelines no deberían confiar ciegamente en sí mismos.

Necesitan reconciliarse con una fuente más autoritativa.

Ejemplos:

- total de pagos capturados comparado con PSP
- invoices emitidas comparadas con sistema de billing oficial
- stock derivado comparado con inventario transaccional
- órdenes consolidadas comparadas con tabla fuente
- uso facturado comparado con eventos originales

La reconciliación sirve para detectar:

- pérdidas silenciosas
- duplicados
- bugs de transformación
- delays extraordinarios
- diferencias de interpretación temporal o de negocio

## Drift y anomalías

No todos los problemas son errores binarios.

A veces el dato cambia de forma extraña.

Ejemplos:

- el volumen cae 70% respecto a lo habitual
- la proporción de cierto estado se dispara sin explicación
- una moneda aparece de repente en un mercado donde no operaba
- la tasa de eventos inválidos sube gradualmente
- el delay medio de llegada empeora cada semana

Esto no siempre viola una regla exacta, pero sí puede indicar degradación.

Por eso sirven controles basados en:

- baseline histórico
- distribuciones esperadas
- percentiles
- estacionalidad normal
- límites adaptativos

## Datasets críticos vs datasets tolerantes

No todo merece el mismo nivel de control.

Conviene clasificar.

### Críticos

- billing
- pagos
- impuestos
- saldos
- conciliaciones
- métricas que disparan decisiones automáticas importantes

### Importantes pero tolerantes

- dashboards internos
- reportes operativos exploratorios
- vistas parciales para soporte
- analítica de producto de baja criticidad

### Derivados secundarios

- rankings informativos
- resúmenes auxiliares
- features no esenciales

Esto ayuda a decidir:

- qué validar siempre
- qué bloquear si falla
- qué alertar solo como warning
- qué dataset necesita reconciliación formal

## El costo oculto de no validar

Cuando no hay controles de calidad, pasan cosas muy caras.

- decisiones de negocio tomadas con números falsos
- equipos que dejan de confiar en dashboards
- discusiones interminables sobre cuál dato “es el bueno”
- incidentes que tardan semanas en detectarse
- reprocesos históricos costosos
- parches manuales difíciles de auditar
- automatizaciones que reaccionan sobre datos corruptos

Lo más peligroso no es el error visible.
Muchas veces es la **pérdida de confianza**.

Una vez que un área deja de creer en la data, reconstruir esa confianza cuesta muchísimo.

## Qué errores aparecen mucho

### 1. Validar solo schema

Entonces el dato “parsea”, pero igual está mal de negocio.

### 2. No medir frescura

El dataset puede estar correcto pero llegar demasiado tarde para servir.

### 3. No comparar origen y destino

Y las pérdidas silenciosas pasan desapercibidas.

### 4. No distinguir datasets críticos de datasets tolerantes

Se aplican los mismos controles a todo, o ninguno.

### 5. Detectar solo fallos técnicos

El pipeline corre, pero las métricas ya no representan la realidad.

### 6. No definir dueños del dato

Nadie sabe quién debe responder cuando la calidad cae.

### 7. Corregir manualmente sin dejar trazabilidad

Eso resuelve lo inmediato pero destruye auditabilidad y repetibilidad.

## Mini ejercicio mental

Imaginá un SaaS con:

- eventos de uso
- límites por plan
- facturación mensual
- dashboards para clientes
- alertas internas de abuso

Preguntas para pensar:

- qué datasets considerarías críticos y cuáles tolerantes
- qué reglas mínimas de completitud y unicidad definirías
- qué diferencia aceptarías entre uso en dashboard y uso facturado
- cómo detectarías eventos duplicados o tardíos
- qué reconciliarías al cierre del mes antes de emitir invoices

Ahora imaginá un e-commerce con:

- órdenes
- pagos
- envíos
- devoluciones
- catálogo y stock

Preguntas:

- qué validaciones harías sobre órdenes y pagos
- cómo detectarías que faltan eventos de un carrier
- qué métrica operativa toleraría datos incompletos y cuál no
- cómo alertarías si las ventas del día caen anómalamente por un problema de ingesta y no por negocio real

## Resumen

Data quality y validación de pipelines no consisten solo en verificar que un proceso terminó.
Consisten en decidir bajo qué condiciones los datos siguen siendo confiables para su propósito.

La idea central de este tema es ésta:

**un pipeline sano no solo mueve datos; también verifica activamente si esos datos siguen siendo completos, únicos, válidos, consistentes y frescos para el uso que prometen soportar.**

Eso implica diseñar:

- reglas explícitas
- validaciones por capa
- reconciliaciones con fuentes de verdad
- controles de frescura
- alertas de anomalías
- y estrategias distintas según criticidad del dataset

Cuando esto falta, el sistema puede seguir funcionando en apariencia mientras la confianza en la data se rompe por debajo.

Y eso nos deja listos para el siguiente tema, donde vamos a profundizar en una capacidad clave para pipelines robustos y reejecutables:

**idempotencia y re-procesamiento de datos.**
