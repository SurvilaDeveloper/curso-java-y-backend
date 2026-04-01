---
title: "Observabilidad de pipelines de datos"
description: "Cómo observar pipelines batch, streaming y jobs de transformación más allá de mirar si terminaron o fallaron, qué métricas, logs, trazas y señales de negocio conviene instrumentar, cómo detectar retrasos, duplicaciones, pérdida de datos y degradaciones silenciosas, y de qué manera construir una operación data-aware que permita investigar incidentes, entender impacto y recuperar confianza cuando los flujos de datos dejan de comportarse como se esperaba."
order: 227
module: "Datos, reporting y procesamiento"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior hablamos de **datos sensibles, permisos y seguridad analítica**.

Ahí vimos que no alcanza con construir pipelines y dashboards útiles.
También hay que controlar quién puede ver qué, quién puede exportar, qué nivel de detalle se expone y cómo evitar filtraciones silenciosas.

Pero una vez que el acceso está razonablemente cuidado, aparece otro problema igual de importante.

Porque un pipeline puede ser “seguro” y aun así estar roto.
Puede estar cargando tarde.
Puede estar duplicando eventos.
Puede estar perdiendo registros.
Puede estar procesando con una versión vieja de una transformación.
Puede estar generando métricas inconsistentes.
Puede estar entregando dashboards con números creíbles… pero incorrectos.

Y eso es especialmente peligroso porque muchas veces no explota de forma obvia.
No siempre hay una excepción espectacular.
A veces el job termina “ok”, pero los datos llegaron incompletos.
A veces la cola sigue corriendo, pero con lag creciente.
A veces el dashboard carga, pero quedó dos horas atrasado.
A veces una dimensión cambió y nadie notó que la cardinalidad se disparó.

Por eso este tema es clave.

**La observabilidad de pipelines de datos consiste en poder entender, medir e investigar el comportamiento real de los flujos de datos para detectar retrasos, pérdidas, duplicaciones, degradaciones y desvíos antes de que el negocio tome decisiones sobre una realidad mal representada.**

En esta lección vamos a estudiar:

- por qué observar pipelines no es lo mismo que observar APIs
- qué señales importan de verdad en batch, streaming y transformaciones
- qué conviene medir además de “éxito o fallo”
- cómo detectar lag, frescura, volumen anómalo y calidad degradada
- cómo correlacionar ejecución técnica con impacto de negocio
- qué errores de observabilidad son muy comunes en sistemas data-driven
- y cómo construir una operación más confiable alrededor de pipelines reales

## El error clásico: creer que un pipeline observado es un pipeline con logs

Éste es uno de los errores más comunes.

Un equipo tiene:

- logs de arranque
- logs de fin
- algún stacktrace si explota
- tal vez un estado “SUCCESS” o “FAILED”

Y cree que con eso ya tiene observabilidad.

Pero eso apenas cubre una parte mínima del problema.

Porque un pipeline de datos puede fallar de muchas formas más sutiles:

- terminar con menos filas de las esperadas
- procesar la ventana equivocada
- duplicar una partición
- quedar atrasado respecto de la fuente
- completar una carga parcial sin marcar error
- mezclar datos de dos versiones distintas de esquema
- omitir una tabla auxiliar crítica
- degradar muchísimo el tiempo de proceso sin llegar a “caerse”
- seguir publicando datasets, pero con semántica alterada

Entonces, mirar solo logs o estados terminales no alcanza.

**En datos, observar bien significa entender si el pipeline corrió, cuánto tardó, qué volumen procesó, con qué calidad salió, cuán fresco quedó el resultado, qué costo consumió y qué impacto tiene cualquier desvío.**

## Por qué la observabilidad de datos no es igual a la observabilidad de APIs

Cuando observás una API, muchas veces te importan señales como:

- latencia
- throughput
- tasa de error
- uso de CPU o memoria
- dependencia lenta
- saturación de pool o base

Eso sigue siendo útil para pipelines.
Pero no alcanza.

Porque en pipelines también importan otras preguntas:

- ¿qué partición o ventana temporal se procesó realmente?
- ¿qué watermark o lag tiene el flujo?
- ¿cuántos registros entraron y cuántos salieron?
- ¿cuántos se descartaron?
- ¿hubo duplicados?
- ¿cuál es la frescura del dataset publicado?
- ¿qué porcentaje de datos llegó tarde?
- ¿qué tabla derivada quedó desactualizada?
- ¿qué dashboards o exportaciones dependen de ese pipeline?
- ¿qué tenants o clientes quedaron afectados?

Dicho simple:

**en APIs observás disponibilidad y performance del servicio; en pipelines además necesitás observar completitud, frescura, corrección, cobertura temporal e impacto aguas abajo.**

## Qué señales importan de verdad en pipelines de datos

Una forma útil de ordenar la observabilidad es pensar en varias capas de señal.

## 1. Señales de ejecución técnica

Son las más obvias.

Por ejemplo:

- inicio y fin de job
- duración total
- duración por etapa
- uso de CPU, memoria, disco o red
- reintentos
- fallos por tarea o partición
- tamaño de colas o backlog
- workers activos
- concurrencia
- throughput de procesamiento

Estas señales sirven para responder preguntas como:

- ¿corrió?
- ¿cuánto tardó?
- ¿qué parte se volvió más lenta?
- ¿dónde falló?
- ¿hay saturación o cuello de botella?

Son necesarias, pero no suficientes.

## 2. Señales de volumen y cobertura

Acá empezás a mirar si el pipeline procesó la cantidad y el rango de datos esperados.

Por ejemplo:

- filas leídas
- filas transformadas
- filas escritas
- registros descartados
- registros inválidos
- eventos duplicados detectados
- archivos consumidos
- particiones procesadas
- ventanas temporales cubiertas
- tamaño final del dataset

Estas señales ayudan a responder:

- ¿procesamos todo lo esperado?
- ¿faltan particiones?
- ¿el volumen cayó demasiado?
- ¿hubo explosión de cardinalidad?
- ¿algo duplicó entradas sin que el job fallara?

Muchas veces los problemas serios aparecen acá.
Un pipeline puede terminar “ok” técnicamente y estar mal en volumen.

## 3. Señales de frescura y atraso

En datos, una de las preguntas más importantes es:

**¿qué tan actual está lo que estoy viendo?**

Eso se refleja en métricas como:

- data freshness
- lag respecto de la fuente
- tiempo desde último evento ingerido
- tiempo desde última publicación exitosa
- retraso por partición
- watermark actual
- edad del dato más reciente disponible

Esto es crítico porque muchos incidentes de datos no consisten en fallar por completo.
Consisten en llegar tarde.

Y un dashboard atrasado dos minutos puede ser tolerable.
Uno atrasado seis horas quizá no.

## 4. Señales de calidad de datos

Esto ya se mete más en observabilidad semántica.

Por ejemplo:

- campos nulos fuera de rango normal
- distribución anómala de valores
- porcentaje de claves huérfanas
- duplicados inesperados
- violaciones de unicidad
- cambios bruscos en cardinalidad
- drift de esquemas
- drift de valores categóricos
- timestamps imposibles
- montos negativos donde no deberían existir

Estas señales sirven para detectar que el pipeline “funcionó”, pero el resultado quedó degradado.

## 5. Señales de negocio o consumo aguas abajo

Ésta es la capa que más valor agrega y más suele faltar.

Porque no alcanza con saber que una tabla derivada no se actualizó.
También importa saber qué rompe eso en el negocio.

Por ejemplo:

- dashboards críticos atrasados
- scorecards incompletos
- reportes diarios no generados
- tenant enterprise sin exportación lista
- alertas de fraude sin datos frescos
- decisiones de pricing alimentadas por agregados viejos
- facturación usage-based afectada por ingestión atrasada

Esta capa conecta incidente técnico con impacto real.

## Batch y streaming no se observan exactamente igual

Aunque comparten principios, no tienen el mismo comportamiento operativo.

## En batch

Suele importar mucho:

- si el job corrió o no
- duración total
- cumplimiento de ventana
- disponibilidad de insumos previos
- cantidad de filas o archivos procesados
- éxito por etapa
- tiempo de publicación final

El foco suele estar en:

- cumplimiento del schedule
- atraso respecto de hora esperada
- fallas por dependencia
- recomputaciones
- backfills
- volumen anómalo

## En streaming

Además de lo anterior, suele importar mucho:

- consumer lag
- backlog acumulado
- watermark
- tiempo de procesamiento por evento o microbatch
- porcentaje de late events
- retry storms
- particiones calientes
- throughput por partición o shard
- checkpoints y offsets

En streaming, el sistema puede seguir vivo mucho tiempo mientras se degrada lentamente.
Por eso el lag, el backlog y la frescura suelen ser señales centrales.

## El concepto más importante: frescura del dato

Hay una métrica que merece un apartado propio.

**La frescura del dato.**

Porque muchas veces el usuario no necesita saber si Spark, Airflow, Flink o el job custom están “up”.
Necesita saber si el dato que consulta está actualizado en un nivel aceptable para su caso de uso.

Por ejemplo:

- para un dashboard ejecutivo diario, quizás 2 horas de atraso sean tolerables
- para fraude, quizá 2 horas sean un desastre
- para monitoreo de logística, 20 minutos pueden ser graves
- para conciliación mensual, una demora de algunos minutos quizá no importe

Entonces la observabilidad madura no define salud solo por infraestructura.
También define salud por **freshness SLO** o expectativa de actualización según el uso.

Eso cambia mucho la calidad operativa.
Porque deja de preguntar solo:

- ¿el pipeline está caído?

Y pasa a preguntar también:

- ¿el dato sigue siendo útil para la decisión que tiene que soportar?

## Métricas concretas que conviene tener

No hace falta instrumentar todo desde el día uno.
Pero sí conviene empezar por algunas métricas base.

### Métricas de ejecución

- cantidad de ejecuciones
- ejecuciones exitosas
- ejecuciones fallidas
- duración total por job
- duración por etapa
- reintentos por job
- tiempo de espera en cola

### Métricas de datos procesados

- registros de entrada
- registros válidos
- registros descartados
- registros de salida
- tasa de duplicados detectados
- tamaño de archivos generados
- particiones procesadas

### Métricas de frescura

- minutos desde última carga exitosa
- lag respecto del evento más reciente de la fuente
- antigüedad del dato publicado
- atraso por tenant o partición

### Métricas de calidad

- porcentaje de nulls por campo crítico
- violaciones de unicidad
- fallos de integridad referencial
- valores fuera de dominio
- drift respecto de baseline histórica

### Métricas de impacto

- datasets dependientes desactualizados
- dashboards afectados
- tenants afectados
- exportaciones bloqueadas por atraso
- alertas de negocio deshabilitadas por falta de dato

## Logs útiles en pipelines

Los logs siguen siendo importantes.
Pero tienen que registrar cosas que realmente sirvan para investigar.

Por ejemplo:

- job_id o execution_id
- versión del pipeline o release
- rango temporal procesado
- partición o shard
- dataset fuente y dataset destino
- conteos por etapa
- causas de descarte
- dependencia externa consultada
- errores por lote
- checkpoint u offset relevante
- decisión de reintento o skip

Un mal log dice:

- “error al procesar archivo”

Un log útil dice algo más parecido a:

- qué archivo
- qué ventana
- qué partición
- qué tenant
- cuántos registros alcanzó a procesar
- qué esquema esperaba
- en qué etapa falló
- si hubo retry
- qué versión del job estaba corriendo

En investigación de datos, el contexto importa muchísimo.

## Trazabilidad en pipelines

En muchos equipos, la traza se asocia solo con requests HTTP distribuidas.
Pero en datos también importa bastante la trazabilidad.

No siempre como distributed tracing clásico de punta a punta, aunque eso puede ayudar.
A veces lo que más valor da es poder correlacionar:

- ejecución del pipeline
- archivos o particiones consumidas
- transformación aplicada
- publicación del dataset derivado
- dashboard o exportación que consumió ese resultado

La idea es simple:

**si un número salió mal, deberías poder reconstruir qué flujo lo produjo, con qué versión, sobre qué datos y en qué momento.**

Sin esa trazabilidad, investigar incidentes se vuelve lento, incierto y muy manual.

## Alertas que sirven de verdad

Un problema muy común es alertar solo por “FAILED”.

Eso deja afuera muchísimos incidentes silenciosos.

Además de fallos duros, conviene pensar alertas para cosas como:

- job demasiado lento respecto de baseline
- dataset atrasado más allá del umbral aceptable
- caída abrupta de volumen
- aumento anormal de descartes
- explosión de duplicados
- ausencia de archivos esperados
- lag creciente en consumidores
- pipeline que no publica salida aunque el proceso siga corriendo
- drift fuerte en un campo clave

La idea no es llenar al equipo de ruido.
La idea es detectar desvíos con impacto real.

Por eso las alertas de datos suelen funcionar mejor cuando combinan:

- señal técnica
- contexto del pipeline
- umbral razonable
- severidad
- y noción de impacto

## Un ejemplo concreto de incidente silencioso

Imaginá este caso.

Tenés un pipeline que calcula ventas diarias por tenant.
Corre cada hora.
No falla.
El scheduler lo marca como exitoso.
La tabla final existe.

Pero una fuente intermedia cambió el nombre de una categoría y eso dejó fuera del join a un subconjunto de registros.

¿Qué pasa?

- técnicamente el pipeline terminó
- no hubo excepción
- la publicación ocurrió
- el dashboard sigue respondiendo

Pero ahora:

- las ventas aparecen 11% por debajo en ciertos tenants
- el volumen de filas bajó sin explicación
- la distribución por categoría cambió abruptamente
- y el área comercial empieza a tomar decisiones sobre un dato incompleto

Este tipo de incidente muestra por qué “success” no significa “correcto”.

Sin observabilidad de volumen, distribución, calidad y freshness, el problema puede durar horas o días.

## La importancia de versionar y etiquetar ejecuciones

Para observar bien, no alcanza con emitir métricas genéricas.
También conviene tener buena identidad sobre cada ejecución.

Por ejemplo:

- nombre del pipeline
- execution_id
- versión de código
- versión de transformación
- ventana temporal
- tenant o segmento
- entorno
- input version
- output dataset version

Eso ayuda mucho cuando necesitás responder:

- ¿desde qué deploy empezó el problema?
- ¿afecta a todos o solo a algunos tenants?
- ¿rompió una sola partición?
- ¿el backfill corrigió realmente el dato?
- ¿la salida actual fue construida con la versión nueva o vieja?

La observabilidad mejora muchísimo cuando cada ejecución es identificable y comparable.

## Dashboards que sí ayudan a operar

Un buen dashboard de pipelines no debería ser solo una lista de jobs verdes y rojos.

Debería ayudar a ver, como mínimo:

- estado actual de pipelines críticos
- última ejecución exitosa
- duración histórica y actual
- frescura del dataset final
- volumen procesado vs baseline
- backlog o lag
- descartes y duplicados
- tendencia de fallos o retries
- impacto por tenant o producto crítico

En otras palabras:

**no solo si el pipeline corrió, sino si el resultado sigue siendo confiable y útil.**

## Errores muy comunes en observabilidad de pipelines

### 1. Mirar solo status final

Éxito o fallo no alcanza.
Muchos incidentes de datos son degradaciones parciales.

### 2. No medir freshness

Saber que “terminó” no dice si el dato publicado está actual.

### 3. No medir input vs output

Sin comparar entradas y salidas, se te escapan pérdidas y duplicaciones.

### 4. No conectar métricas técnicas con impacto de negocio

Podés ver backlog creciendo, pero no entender que eso afecta facturación, fraude o reporting ejecutivo.

### 5. Alertas demasiado ruidosas o demasiado pobres

Si todo alerta, el equipo deja de mirar.
Si solo alertan fallos duros, llegás tarde.

### 6. Falta de identidad de ejecución

Sin execution_id, versión y contexto temporal, investigar se vuelve muchísimo más difícil.

### 7. No observar dependencias aguas abajo

A veces el pipeline terminó, pero el dataset no se publicó o el consumidor final no refrescó.

## Qué se gana cuando la observabilidad de datos madura

Cuando esto está bien resuelto, el equipo gana varias cosas muy concretas.

### Menor tiempo de detección

Los problemas se detectan antes de que escalen al negocio.

### Menor tiempo de investigación

Es más fácil reconstruir qué pasó, dónde y desde cuándo.

### Más confianza en reporting y analítica

El negocio deja de operar “a ciegas” respecto de la calidad y frescura de sus números.

### Mejor capacidad de recovery

Cuando sabés qué partición falló, qué ventana quedó incompleta y qué dataset se afectó, podés re-procesar con más precisión.

### Más criterio para priorizar incidentes

No todo atraso merece el mismo nivel de urgencia.
Con buena observabilidad entendés mejor severidad e impacto.

## Cierre

La observabilidad de pipelines de datos no consiste en mirar si un job terminó verde.

Consiste en poder responder preguntas más importantes:

- ¿el dato llegó?
- ¿llegó completo?
- ¿llegó sin duplicarse?
- ¿llegó a tiempo?
- ¿llegó con calidad suficiente?
- ¿qué impacto tiene si no llega o llega mal?

Ésa es la diferencia entre tener pipelines que “corren” y tener pipelines **operables**.

Porque en sistemas data-aware, el problema no es solo mover datos.
El problema es poder confiar en ellos mientras se mueven, se transforman y se publican.

Y esa confianza no aparece sola.
Se construye con señales correctas, contexto suficiente, métricas útiles, alertas razonables y una operación que entienda que en datos también existen degradaciones silenciosas, incidentes progresivos y fallos que no gritan.

En el próximo tema vamos a meternos en otro aspecto igual de importante: **costos de procesamiento y almacenamiento**.
