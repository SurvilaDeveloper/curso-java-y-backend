---
title: "Streaming y procesamiento incremental"
description: "Qué significa procesar datos en streaming, cómo se diferencia del batch clásico, qué implica pensar un sistema en términos de eventos que se consumen continuamente, cuándo conviene procesamiento incremental frente a recomputación por ventanas, qué desafíos aparecen con orden, latencia, duplicados, estado y correcciones, y cómo combinar streaming con batch sin caer en promesas irreales de tiempo real absoluto."
order: 217
module: "Datos, reporting y procesamiento"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos que el batch processing sigue siendo una herramienta fundamental.

Vimos que:

- agrupa datos en ventanas temporales
- permite cierres razonables y semánticamente claros
- simplifica reintentos, reprocesos y consolidaciones
- y sirve muy bien para reporting, conciliación y procesos periódicos

Pero también apareció un límite evidente.

Hay problemas donde esperar al próximo lote puede ser demasiado.
Porque a veces el sistema necesita:

- reaccionar rápido
- actualizar vistas casi en tiempo real
- disparar alertas operativas
- detectar anomalías enseguida
- consolidar eventos sin esperar al cierre de una ventana larga
- o construir experiencias donde el dato reciente tenga valor inmediato

Ahí entra otro paradigma:

**streaming y procesamiento incremental.**

La idea general es distinta a la del batch clásico.
En vez de esperar a juntar una gran porción de datos para procesarla toda junta, el sistema va procesando cambios de manera continua o casi continua, incorporando cada nuevo hecho al resultado derivado.

No significa necesariamente "tiempo real perfecto".
Significa algo más útil y más preciso:

**procesar a medida que llegan cambios, manteniendo estado y actualizando resultados sin recomputar siempre todo desde cero.**

Este tema es importante porque mucha gente escucha “streaming” y piensa solo en una tecnología o en una cola de eventos.
Pero el verdadero cambio es conceptual.
Streaming no es simplemente “usar Kafka” o “escuchar mensajes”.
Es una manera distinta de pensar:

- cómo fluye el dato
- cuándo se considera útil
- cómo se actualizan derivaciones
- qué latencia se necesita de verdad
- y qué costo operativo aceptás para conseguirlo

## Qué significa procesamiento incremental

Procesamiento incremental significa que, en lugar de recalcular un resultado completo cada vez, actualizás ese resultado usando solo los cambios nuevos.

Ejemplos simples:

- en vez de recalcular ventas del día consultando todas las órdenes, agregás cada nueva orden al acumulado
- en vez de reconstruir un saldo desde cero, aplicás cada movimiento nuevo al estado actual
- en vez de regenerar un contador completo, incrementás o decrementás según el evento recibido
- en vez de recalcular todo el catálogo indexado, actualizás solo los productos afectados

La intuición central es ésta:

**si ya tenías un resultado parcial correcto, podés avanzar desde ahí incorporando deltas.**

Eso reduce recomputación y puede bajar latencia mucho.

## Qué significa streaming

Streaming significa tratar los datos como un flujo continuo de eventos o registros que llegan a lo largo del tiempo.

En vez de pensar:

- “qué había en la tabla al final del día”

pensás más bien:

- “qué cambió recién”
- “qué nuevo hecho apareció”
- “cómo ese cambio impacta en el estado derivado”

Ejemplos de eventos en streaming:

- orden creada
- pago capturado
- item agregado al carrito
- tenant superó un límite
- stock reservado
- usuario inició sesión
- envío marcado como entregado
- webhook recibido
- archivo procesado

Cada evento puede alimentar alguna derivación:

- contadores
- métricas en vivo
- read models
- índices de búsqueda
- alertas
- dashboards operativos
- detección de fraude
- pipelines hacia otros sistemas

## Streaming no significa necesariamente tiempo real absoluto

Ésta es una aclaración importantísima.

En sistemas reales, "real time" casi nunca significa instantáneo perfecto.
Lo que suele significar es algo como:

- segundos
- algunos cientos de milisegundos
- pocos minutos
- o latencia suficientemente baja para el caso de uso

La pregunta correcta no es:

**“esto es tiempo real sí o no”.**

La pregunta correcta es:

**“qué latencia necesita realmente esta capacidad para seguir siendo útil”.**

Ejemplos:

- una alerta antifraude quizá necesita reaccionar en segundos
- una vista de ventas para operación comercial quizá tolera 1 o 2 minutos
- una invoice mensual no necesita streaming
- un panel de incidentes sí puede necesitar actualización continua

Pensar así evita sobrediseñar.

## Diferencia mental entre batch y streaming

Podés resumirlo así.

### Batch

- procesa por lotes
- piensa en ventanas cerradas
- suele recomputar o consolidar por rangos
- prioriza cierres, costo controlado y simplicidad operativa

### Streaming / incremental

- procesa cambios a medida que llegan
- piensa en flujos continuos
- actualiza estado derivado progresivamente
- prioriza frescura, reacción rápida y actualización continua

La diferencia no es moral.
No es “viejo versus moderno”.
Son herramientas distintas para necesidades distintas.

## Ejemplo mental: ventas del día

Imaginá que querés mostrar ventas del día en un dashboard.

### En batch

Podrías:

- correr un job cada hora
- recalcular ventas del día hasta ese momento
- guardar el resultado en una tabla agregada

### En incremental/streaming

Podrías:

- escuchar cada orden confirmada
- actualizar un acumulado por fecha, canal y moneda
- refrescar el dashboard continuamente

Ambas estrategias pueden ser válidas.
La diferencia es:

- batch da frescura por saltos
- incremental da frescura continua

Y eso cambia costo, complejidad y expectativa de consistencia.

## Ejemplo mental: inventario

En inventario, muchas veces la latencia importa más.

Si cada reserva o liberación modifica disponibilidad, esperar media hora para reflejarlo puede ser demasiado.

Entonces un enfoque incremental tiene mucho sentido:

- evento de reserva -> baja disponible
- evento de cancelación -> libera disponible
- evento de recepción -> incrementa stock físico
- evento de ajuste -> corrige estado derivado

Acá la gracia del incremental no es solo velocidad.
También es evitar recalcular todo el inventario completo para cada cambio pequeño.

## Ejemplo mental: SaaS con usage billing

Supongamos un SaaS que cobra por uso.

Necesitás varias cosas al mismo tiempo:

- detectar si un tenant está cerca del límite
- mostrar consumo acumulado en el panel
- consolidar uso confiable para facturación

Ahí aparece muy naturalmente una arquitectura híbrida:

- streaming para reflejar uso reciente y alertas
- batch para cierres diarios o mensuales y conciliación final

Esto ya anticipa una idea central del tema:

**streaming e incremental no reemplazan siempre al batch; muchas veces lo complementan.**

## Estado derivado y actualización continua

Para que el incremental funcione, muchas veces mantenés algún tipo de estado derivado.

Ejemplos:

- total de ventas por día
- cantidad de sesiones activas
- saldo actual por cuenta
- uso acumulado del mes por tenant
- ranking parcial de productos más vendidos
- índice de búsqueda actualizado por cambios de catálogo

Cada evento nuevo modifica ese estado.

Eso vuelve al sistema muy potente, pero introduce complejidad.
Porque ahora no solo importa el dato entrante.
También importa el **estado previo** sobre el cual ese dato actúa.

## Procesar eventos no es solo consumirlos

Un error conceptual común es pensar que streaming = leer mensajes de una cola.

Pero un pipeline serio tiene más preguntas:

- cómo interpretás cada evento
- cómo garantizás idempotencia
- cómo tratás duplicados
- qué hacés si llegan fuera de orden
- cómo persistís el estado derivado
- cómo reanudás después de una caída
- cómo corregís errores históricos
- cómo re-procesás si cambia la lógica

Es decir:

**streaming no es solo transporte de mensajes; es procesamiento con semántica y estado.**

## Orden de eventos

Uno de los grandes problemas reales.

En teoría, te gustaría que los eventos lleguen exactamente en el orden en que ocurrieron.
Pero en la práctica eso no siempre pasa.

Ejemplos:

- una integración entrega mensajes tarde
- una cola reintenta uno viejo después de uno nuevo
- distintos nodos publican con pequeñas demoras
- una red lenta altera el orden observable

Entonces aparecen preguntas incómodas:

- qué pasa si llega “pago confirmado” antes que “orden creada”
- qué pasa si llega una cancelación después de una confirmación ya procesada
- qué hacés si un ajuste llega horas más tarde

Un sistema incremental maduro necesita definir reglas para eso.

## Duplicados

También son inevitables.

En sistemas distribuidos, muchas veces preferís “entregar al menos una vez” antes que arriesgar perder datos.
Eso significa que algún consumidor podría ver el mismo evento más de una vez.

Si tu procesamiento no es idempotente, eso rompe todo:

- montos duplicados
- contadores inflados
- emails repetidos
- reservas de stock incorrectas
- exportaciones dobles

Por eso streaming e incremental exigen muchísimo cuidado con:

- claves idempotentes
- versionado
- deduplicación lógica
- estado consistente frente a reintentos

## Estado, checkpoints y reanudación

Un pipeline incremental sano necesita saber dónde quedó.

Ejemplos:

- último offset consumido
- último watermark lógico
- última versión procesada de un stream
- último evento consolidado correctamente

Eso permite:

- retomar después de una caída
- evitar saltos o reprocesos ciegos
- auditar hasta dónde llegó el sistema

Pero no alcanza con el checkpoint técnico.
Muchas veces también necesitás checkpoint semántico.
Por ejemplo:

- consumo mensual consolidado hasta tal marca
- ranking recalculado hasta tal lote de eventos
- alertas evaluadas hasta tal timestamp de negocio

## Tiempo del evento vs tiempo de procesamiento

Igual que en batch, en streaming la dimensión temporal importa muchísimo.

Podés tener:

- tiempo en que ocurrió el hecho
- tiempo en que fue ingerido
- tiempo en que se procesó

Y si esos tiempos divergen, las derivaciones pueden comportarse distinto.

Ejemplo:

- una compra ocurrió a las 12:01
- el evento llegó a las 12:07
- el dashboard se actualizó a las 12:08

Eso no necesariamente está mal.
Pero tiene que ser entendible.

En algunos casos importa el orden de ocurrencia.
En otros, alcanza con el orden de llegada.
No decidir eso explícitamente genera inconsistencias difíciles de explicar.

## Watermarks y completitud parcial

En streaming, rara vez sabés con certeza absoluta que “ya llegó todo”.
Entonces se trabaja muchas veces con ideas como:

- tolerancia a tardanza
- marcas de progreso
- watermarks lógicos
- ventanas que se consideran suficientemente completas

Esto conecta muchísimo con el tema anterior.
Porque incluso en streaming, cuando agregás por tiempo, seguís necesitando decidir:

- cuándo una ventana es usable
- cuánto esperás datos tardíos
- cuándo corregís
- si reabrís o ajustás hacia adelante

## Streaming con estado vs streaming sin estado

### Sin estado

Cada evento se procesa en forma aislada.

Ejemplos:

- validar formato
- enrutar hacia otro sistema
- transformar una estructura
- disparar un webhook

### Con estado

El resultado depende también de lo que ya pasó.

Ejemplos:

- sumar total acumulado
- detectar secuencias sospechosas
- mantener top N dinámico
- calcular uso por tenant
- consolidar saldo o disponibilidad

El streaming con estado suele ser el más valioso, pero también el más delicado.
Porque ahí entran:

- almacenamiento de estado
- recuperación ante fallos
- sincronización
- versionado
- correcciones

## Cuándo conviene procesamiento incremental

Hay señales bastante claras.

### Señales fuertes

- el valor del dato cae rápido si llega tarde
- necesitás reflejar cambios frecuentes sin recalcular todo
- el dataset completo es grande y la recomputación continua sería cara
- el producto u operación exige dashboards o alertas frescas
- las actualizaciones naturales del dominio vienen como eventos o deltas

Ejemplos:

- stock y reservas
- paneles operativos en vivo
- detección temprana de abuso
- tracking de envíos
- consumo por tenant
- índices de búsqueda que deben reflejar cambios recientes

## Cuándo no hace falta

También es importante saber cuándo **no** conviene complicarse.

Señales de que quizá batch alcanza:

- el negocio consume cierres diarios o mensuales
- la latencia de minutos u horas no afecta decisiones
- el proceso necesita mucha reconciliación antes de ser confiable
- la complejidad operativa de streaming no se justifica

Ejemplos:

- facturación mensual final
- reportes financieros cerrados
- exportaciones periódicas
- recálculo histórico tras cambio de reglas

## El gran problema: correcciones

El incremental brilla mucho mientras todo llega bien.
Pero los sistemas reales tienen:

- eventos tardíos
- correcciones manuales
- bugs de publicación
- reclasificaciones
- reversas
- reembolsos
- backfills históricos

Entonces necesitás decidir cómo corregir.

Opciones típicas:

### 1. Aplicar eventos compensatorios

En vez de reescribir el pasado, emitís un nuevo evento que corrige el estado.

### 2. Reprocesar desde cierto punto

Volvés a correr una parte del flujo usando eventos históricos.

### 3. Recalcular una vista derivada completa

Si la lógica cambió mucho, quizá conviene reconstruir desde cero.

Esto muestra algo muy importante:

**aunque tengas streaming, tarde o temprano necesitás capacidades de replay y de batch/rebuild.**

## Replay y reconstrucción

Un sistema incremental serio debería poder reconstruir su estado derivado.

Porque si no puede:

- un bug deja corrupción permanente
- un cambio de lógica no se puede aplicar al histórico
- una pérdida parcial de estado se vuelve un incidente mayor

Por eso muchas arquitecturas maduras combinan:

- flujo incremental para mantener el estado al día
- posibilidad de replay para reconstrucción
- procesos batch para reconciliar y validar

## Arquitecturas híbridas

Ésta suele ser la respuesta más realista.

No todo es batch.
No todo es streaming.

Muchas veces el sistema más sano mezcla ambos.

Ejemplos:

- streaming para actualizar dashboards operativos
- batch nocturno para cerrar métricas oficiales
- incremental para stock en vivo
- batch para snapshot diario de inventario
- streaming para detectar anomalías rápido
- batch para consolidación y reporting histórico

La idea no es duplicar por capricho.
La idea es reconocer que distintos consumidores necesitan distintos niveles de frescura y distintas garantías.

## Qué errores aparecen mucho

### 1. Elegir streaming por moda

Se agrega complejidad enorme para resolver un problema que aceptaba batch.

### 2. Confundir latencia baja con calidad del dato

Un dashboard puede actualizar rápido y aun así estar conceptualmente mal.

### 3. No pensar idempotencia

Y los duplicados arruinan acumulados y estados derivados.

### 4. No diseñar correcciones

Todo anda hasta que aparece el primer dato tardío o el primer bug serio.

### 5. No distinguir transporte de procesamiento

Tener eventos en una cola no significa tener una arquitectura de datos bien pensada.

### 6. Depender solo del incremental sin capacidad de rebuild

Entonces cualquier inconsistencia acumulada se vuelve muy difícil de corregir.

### 7. Querer tiempo real absoluto donde no hace falta

Eso encarece y fragiliza el sistema sin aportar valor real.

## Mini ejercicio mental

Imaginá un e-commerce con:

- catálogo
- stock
- órdenes
- pagos
- envíos
- campañas

Preguntas para pensar:

- qué cosas necesitan reflejarse casi al instante y cuáles no
- qué derivaciones harías incrementalmente
- cuáles cerrarías en batch cada hora o cada día
- cómo corregirías stock si aparece un evento tardío
- cómo reconstruirías un read model de órdenes si cambió la lógica

Ahora imaginá un SaaS con:

- tenants
- consumo medido
- límites de plan
- facturación mensual
- alertas de abuso

Preguntas:

- qué parte necesita streaming
- qué parte necesita cierre batch confiable
- qué datos usarías para mostrar consumo en panel vs facturar oficialmente
- cómo tratarías duplicados o eventos tardíos de uso

## Resumen

Streaming y procesamiento incremental permiten construir sistemas que reaccionan más rápido, actualizan derivaciones continuamente y evitan recomputar siempre todo desde cero.

La idea central de este tema es ésta:

**procesar incrementalmente no es sólo consumir eventos rápido; es mantener estado derivado con reglas claras sobre orden, duplicados, tiempo, correcciones y reconstrucción.**

Cuando está bien diseñado, el enfoque incremental sirve muchísimo para:

- dashboards operativos
- alertas
- uso acumulado
- stock y disponibilidad
- tracking y seguimiento
- read models actualizados

Pero también trae exigencias más altas:

- idempotencia
- estado consistente
- replay
- corrección de tardíos
- observabilidad
- y límites claros sobre qué significa “casi en tiempo real”

Por eso, en sistemas reales, la mejor respuesta suele ser híbrida.
Streaming para reaccionar.
Batch para consolidar.
Rebuild para corregir.

Y eso nos deja listos para el siguiente tema, donde vamos a seguir profundizando la calidad del dato en pipelines y derivados:

**data quality y validación de pipelines.**
