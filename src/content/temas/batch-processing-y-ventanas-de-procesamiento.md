---
title: "Batch processing y ventanas de procesamiento"
description: "Qué significa procesar datos por lotes, por qué el batch sigue siendo una herramienta central en sistemas de datos, cómo pensar ventanas de procesamiento para agrupar eventos o registros en períodos útiles, qué decisiones importan al definir frecuencia, corte, completitud, latencia y recomputación, y qué errores aparecen cuando un pipeline batch no modela bien el tiempo ni la disponibilidad real del dato."
order: 216
module: "Datos, reporting y procesamiento"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos una idea muy potente:

- los eventos pueden convertirse en fuente de datos derivados
- a partir de hechos relevantes podés construir proyecciones, métricas y snapshots
- no siempre conviene recalcular todo desde cero consultando tablas operativas
- y muchas veces el valor está en procesar cambios de manera incremental y semánticamente clara

Pero una vez que aceptás eso, aparece otra pregunta muy práctica:

**cómo y cuándo procesamos esos datos para convertirlos en información útil.**

Porque no alcanza con tener eventos o registros disponibles.
También necesitás decidir:

- cada cuánto procesás
- qué rango temporal tomás
- cuándo considerás que una ventana está lista
- qué hacés con datos tardíos
- cómo corregís errores
- y qué equilibrio buscás entre frescura, costo y confiabilidad

Ahí entra un concepto fundamental:

**batch processing y ventanas de procesamiento.**

Aunque hoy se hable muchísimo de streaming y tiempo real, el procesamiento batch sigue siendo una pieza central en sistemas reales.
De hecho, en muchísimos backends y plataformas de datos, gran parte del valor operativo y analítico todavía se construye por lotes.

No porque sea una tecnología vieja.
Sino porque resuelve muy bien problemas concretos:

- agregaciones periódicas
- cierres diarios
- conciliaciones
- reprocesos
- exportaciones masivas
- facturación
- reportes de negocio
- recomputación de modelos derivados

La clave no es pensar batch como algo “menos moderno”.
La clave es entender **cuándo conviene, qué garantías puede dar y cómo diseñar bien la dimensión temporal del procesamiento.**

## Qué significa batch processing

Batch processing significa procesar datos en **lotes**, no registro por registro apenas llegan.

En vez de reaccionar inmediatamente a cada cambio, acumulás una porción de datos y los procesás juntos según algún criterio.

Ese criterio puede ser, por ejemplo:

- cada una hora
- cada día
- cada fin de mes
- cuando se llega a cierta cantidad de registros
- cuando se cierra una ventana temporal
- cuando termina una jornada operativa

Ejemplos típicos:

- calcular ventas del día cada madrugada
- generar invoices al cierre del ciclo de facturación
- consolidar uso por tenant cada hora
- recalcular ranking de productos todas las noches
- construir snapshots diarios de inventario
- exportar movimientos a otro sistema una vez por día
- recomputar métricas históricas luego de corregir una lógica

La idea fuerte es esta:

**el batch no intenta reflejar cada cambio instantáneamente, sino producir un resultado consistente sobre un conjunto de datos ya reunido.**

## Por qué batch sigue siendo tan importante

Porque muchas necesidades reales no exigen reacción inmediata.
Y, en cambio, sí exigen:

- consistencia razonable
- costo controlado
- simplicidad operativa
- posibilidad de reintento
- capacidad de reproceso
- y un marco temporal claro

Hay muchísimos casos donde procesar cada evento en tiempo real sería innecesario o incluso peor.

Por ejemplo:

- un reporte financiero diario
- una conciliación nocturna con proveedores
- una tabla agregada de KPIs para management
- una exportación masiva para un cliente enterprise
- una recomputación histórica tras cambiar una regla de negocio

En todos esos escenarios, batch suele ser muy natural.

Además, procesar por lotes tiene ventajas fuertes:

### 1. Simplifica bastante la operación

Muchas veces es más fácil razonar sobre:

- qué datos entran en un lote
- cuándo se corre
- cuándo terminó bien
- qué hacer si falla
- y cómo reintentar

que mantener un pipeline continuo con latencia baja todo el tiempo.

### 2. Facilita reproceso y corrección

Si un cálculo salió mal, muchas veces podés volver a ejecutar una ventana completa.

### 3. Permite optimizar costo

No siempre querés mantener procesamiento activo de alta frecuencia si el negocio no lo necesita.

### 4. Se adapta bien a cierres de negocio

Muchos procesos del negocio ya son naturalmente batch:

- cierre diario
- cierre semanal
- cierre mensual
- liquidaciones
- consolidaciones
- auditorías

## Qué es una ventana de procesamiento

Una ventana de procesamiento es el **conjunto temporal** de datos que decidís agrupar y tratar como unidad de cálculo.

Por ejemplo:

- todas las órdenes entre las 00:00 y las 00:59
- todos los pagos capturados durante el día
- todo el uso registrado entre el primer y el último día del ciclo mensual
- todos los eventos recibidos hasta el cierre de una hora operativa

La ventana responde una pregunta básica:

**qué porción del tiempo estoy procesando ahora.**

Sin una ventana clara, un pipeline batch se vuelve ambiguo.
Y cuando la dimensión temporal es ambigua, aparecen errores feos:

- duplicados lógicos
- huecos de datos
- totales inconsistentes
- cierres que no coinciden
- métricas difíciles de explicar

## Tiempo de negocio vs tiempo de procesamiento

Éste es uno de los puntos más importantes.

Cuando procesás batch, tenés que distinguir al menos dos tiempos:

- **tiempo del hecho**: cuándo ocurrió realmente el evento o la operación
- **tiempo de procesamiento**: cuándo el pipeline tomó ese dato y lo procesó

A veces también aparece un tercero:

- **tiempo de ingestión**: cuándo el dato entró al sistema de datos

Esto importa muchísimo.

Ejemplo:

- una orden se creó a las 23:59
- el evento se ingirió a las 00:03
- el batch corrió a las 00:10

La pregunta es:

**esa orden pertenece al día anterior o al nuevo día.**

La respuesta depende de qué semántica uses.
Y eso no puede quedar implícito.

Cuando diseñás una ventana, tenés que definir con claridad:

- qué timestamp manda
- qué zona horaria aplica
- cómo tratás datos tardíos
- cuándo una ventana se considera cerrada

## Ventana no es solo “de tal hora a tal hora”

Mucha gente piensa ventana y solo imagina un rango fijo, pero en realidad hay varias dimensiones.

### 1. Rango temporal

Qué período cubre.

Ejemplos:

- una hora
- un día
- una semana
- un ciclo de facturación

### 2. Momento de ejecución

Cuándo corrés el procesamiento.

Por ejemplo:

- procesar el día anterior a las 02:00
- procesar cada hora al minuto 10
- procesar al cierre de cada ciclo mensual

### 3. Política de cierre

Cuándo considerás que ya tenés suficiente información para cerrar la ventana.

### 4. Política de corrección

Qué hacés si después aparecen datos que pertenecían a una ventana ya cerrada.

## Ejemplo mental: ventas diarias

Supongamos que querés construir una tabla `daily_sales_summary`.

Podría tener:

- fecha
- cantidad de órdenes
- monto bruto
- descuentos
- reembolsos
- monto neto
- moneda
- canal

Acá necesitás responder varias preguntas:

- ¿la fecha se define por `placed_at`, por `paid_at` o por `captured_at`?
- ¿qué pasa con órdenes creadas ayer pero pagadas hoy?
- ¿qué zona horaria usa el negocio?
- ¿se recalcula el día completo si entra una corrección?
- ¿los reembolsos corrigen el día original o el día del reembolso?

Eso ya muestra algo importante:

**definir una ventana no es solo cortar tiempo. Es decidir la semántica con la que el negocio va a leer ese tiempo.**

## Ejemplo mental: SaaS y usage billing

Imaginá un SaaS que cobra por uso.

Querés calcular consumo por tenant cada hora y consolidarlo a fin de mes.

Ventanas posibles:

- ventana horaria para sumar eventos de uso
- ventana diaria para monitoreo operativo
- ventana mensual para facturación final

Cada una sirve para cosas distintas.

Por ejemplo:

- la horaria sirve para alertas y observabilidad
- la diaria sirve para seguimiento de crecimiento o abuso
- la mensual sirve para invoice y conciliación

Un mismo sistema puede tener varias ventanas superpuestas, cada una con una intención diferente.

## Batch orientado a lectura vs batch orientado a movimiento

No todo batch persigue el mismo objetivo.

### Batch orientado a lectura

Busca construir datos más consultables.

Ejemplos:

- agregaciones diarias
- snapshots
- dashboards
- read models analíticos

### Batch orientado a movimiento

Busca trasladar o sincronizar datos.

Ejemplos:

- exportar invoices a un ERP
- enviar liquidaciones a un proveedor
- volcar datos a data warehouse
- replicar resultados hacia otro sistema

### Batch orientado a corrección o recomputación

Busca rehacer resultados.

Ejemplos:

- recalcular métricas históricas
- regenerar una proyección rota
- recomputar score con nueva lógica
- rehidratar una tabla derivada

Entender cuál es tu tipo de batch ayuda mucho a elegir:

- frecuencia
- tolerancia a demora
- política de reintento
- estrategia de validación
- necesidad de idempotencia y replay

## Ventanas fijas, móviles y por ciclo

### Ventanas fijas

Son las más comunes.

Ejemplos:

- por hora
- por día
- por semana
- por mes

Sirven muy bien para reporting periódico y procesos operativos previsibles.

### Ventanas móviles

Se recalculan sobre un rango que se desplaza.

Ejemplos:

- últimos 7 días
- últimos 30 días
- últimas 24 horas

Sirven mucho para métricas de tendencia, alertas y salud operativa.

### Ventanas por ciclo de negocio

No siguen necesariamente calendario puro.
Siguen una lógica del dominio.

Ejemplos:

- ciclo de facturación de un tenant
- período de una campaña comercial
- cierre contable
- lote de liquidación de marketplace

Estas ventanas suelen ser especialmente importantes en sistemas reales porque el negocio no siempre vive en días calendario perfectos.

## Batch no significa necesariamente recalcular todo

Éste es otro malentendido común.

Procesar batch no implica siempre hacer un full scan completo de todo el histórico.

Podés tener batchs que:

- procesan solo la última ventana cerrada
- procesan solo lo nuevo desde un checkpoint
- recalculan un rango pequeño afectado por correcciones
- reconstruyen completo solo en situaciones excepcionales

De hecho, en sistemas sanos, suele haber una mezcla:

- procesamiento incremental frecuente
- recomputación parcial cuando hace falta
- recomputación total solo para incidentes o cambios grandes de lógica

## Qué significa que una ventana esté “lista”

Ésta es una de las decisiones más delicadas.

En teoría, una ventana diaria podría cerrarse a las 23:59:59.
Pero en la práctica quizá no querés hacerlo ahí, porque:

- hay latencia de ingestión
- hay integraciones que llegan más tarde
- hay eventos que se publican con demora
- hay reconciliaciones que tardan minutos u horas

Entonces muchas veces se define una política como:

- la ventana del día D se procesa a las 02:00 del día D+1
- la ventana horaria se procesa 10 minutos después del cierre de la hora
- la liquidación se corre 24 horas después del cierre del ciclo para absorber tardanzas

Eso introduce una idea clave:

**completitud suficiente**.

No siempre esperás perfección absoluta.
Esperás una completitud razonable y explícitamente definida.

## Datos tardíos

Tarde o temprano aparecen.

Ejemplos:

- un webhook llegó dos horas después
- un proveedor devolvió confirmación tarde
- una cola se drenó con demora
- un archivo se cargó fuera de horario
- un bug hizo que ciertos eventos se reingestaran después

Si tu pipeline batch no piensa datos tardíos, tarde o temprano rompe consistencia.

Hay varias estrategias posibles.

### 1. Ignorarlos

Sólo sirve si el impacto es irrelevante y eso está aceptado.

### 2. Reabrir la ventana afectada

Procesás nuevamente la ventana donde cae el dato tardío.

### 3. Aplicar corrección hacia adelante

En vez de reescribir el pasado, agregás un ajuste en una ventana posterior.

### 4. Mantener ventanas “calientes” por un tiempo

Por ejemplo, recalculás los últimos 3 días en cada corrida para absorber tardanzas razonables.

No hay una respuesta universal.
Depende del dominio, del costo y de la semántica que necesites.

## Idempotencia en batch

Aunque mucha gente la asocia a APIs o eventos, la idempotencia también es crucial en batch.

Porque un job batch puede:

- fallar a mitad de ejecución
- reintentarse
- correrse dos veces por error
- recomputarse después de una corrección

Si el procesamiento no es idempotente, podrías:

- duplicar filas
- sumar montos dos veces
- reexportar movimientos ya enviados
- generar snapshots inconsistentes

Preguntas sanas:

- si corro esta ventana otra vez, ¿obtengo el mismo resultado?
- sobrescribo el resultado anterior o agrego encima?
- guardo marcas de ejecución o versionado?
- puedo detectar que una exportación ya se hizo?

## Estrategias comunes de materialización

Cuando terminás un batch, el resultado tiene que quedar en algún lado.
Y cómo lo materializás importa mucho.

### Reemplazo completo de la ventana

Ejemplo:

- recalculás el resumen del día
- borrás la versión anterior del día
- insertás la nueva

Ventaja:

- simple de razonar

Costo:

- puede ser pesado si la ventana es grande

### Upsert incremental

Actualizás registros existentes o insertás nuevos.

Ventaja:

- más eficiente en algunos casos

Costo:

- exige más cuidado con consistencia y deduplicación

### Tabla staging + swap

Calculás en staging y luego hacés un cambio controlado.

Ventaja:

- evita dejar la tabla destino en estado parcial

Esto suele ser muy sano para datasets importantes.

## Checkpoints y progreso

Un pipeline batch sano necesita saber hasta dónde procesó.

Ejemplos:

- última fecha cerrada correctamente
- último id o offset consolidado
- última versión de snapshot calculada
- watermark lógico de procesamiento

Eso evita cosas muy peligrosas como:

- reprocesar sin querer rangos completos
- saltarte intervalos
- no saber dónde retomar después de una falla

El checkpoint no siempre es sólo técnico.
A veces también es semántico.
Por ejemplo:

- “facturé hasta el ciclo X inclusive”
- “cerré inventario hasta el día Y”
- “exporté movimientos hasta las 15:00 UTC”

## Validaciones que un batch necesita

Un error muy común es pensar solo en “si el job terminó” y no en “si el resultado tiene sentido”.

Validaciones útiles:

- conteos esperados
- montos no negativos cuando corresponde
- ausencia de duplicados imposibles
- completitud mínima por ventana
- integridad referencial básica
- comparación con históricos recientes
- alarmas por desvíos anómalos

A veces un batch puede terminar técnicamente bien y estar conceptualmente mal.
Y eso es incluso más peligroso.

## Batch y recomputación histórica

Uno de los mayores valores del batch es que hace más natural la recomputación.

Casos típicos:

- cambió la lógica de una métrica
- apareció un bug en un cálculo de facturación
- una integración perdió datos y hubo que reinyectarlos
- cambió una clasificación y hay que recalcular snapshots

Cuando eso pasa, necesitás decidir:

- qué rango recomputar
- si reemplazás resultados viejos
- cómo distinguís la nueva versión
- cómo validás que el reproceso quedó bien

La capacidad de recomputar bien suele separar pipelines maduros de pipelines frágiles.

## Qué errores aparecen mucho

### 1. No definir la semántica temporal

Entonces nadie sabe qué significa exactamente “ventas del día” o “uso del mes”.

### 2. Usar zona horaria implícita

Y después aparecen cierres corridos, dashboards raros y reconciliaciones imposibles.

### 3. Cerrar ventanas demasiado pronto

Lo que deja afuera datos legítimos que llegaron con demora razonable.

### 4. No pensar datos tardíos

Y entonces el histórico queda incorrecto o inconsistente.

### 5. Hacer full recompute para todo siempre

Eso vuelve caro, lento y frágil un pipeline que podría ser incremental.

### 6. No hacer el procesamiento idempotente

Y los reintentos terminan duplicando resultados.

### 7. No distinguir éxito técnico de éxito semántico

El job terminó, pero el dato quedó mal.

### 8. No tener estrategia de replay o corrección

Cuando cambia la lógica, nadie sabe cómo rehacer el pasado sin romper más cosas.

## Cuándo batch suele ser una gran elección

Hay señales bastante claras.

### Señales de que conviene mucho

- el negocio consume cierres periódicos
- no necesitás reacción en segundos
- querés controlar costo y complejidad
- necesitás recomputar a veces
- la consistencia por ventana importa más que la inmediatez
- trabajás con exportaciones, conciliaciones o reporting periódico

### Señales de que quizá no alcanza solo con batch

- necesitás latencia muy baja
- la lectura operativa depende de información casi instantánea
- las alertas pierden valor si llegan tarde
- el producto exige reacción continua sobre eventos recientes

En esos casos, muchas veces aparece una arquitectura híbrida:

- procesamiento rápido para lo operativo inmediato
- batch para consolidación, corrección, reporting y cierres

Y eso es completamente normal.

## Mini ejercicio mental

Imaginá un e-commerce con:

- órdenes
- pagos
- envíos
- devoluciones
- campañas comerciales

Preguntas para pensar:

- qué procesos te alcanza con correr por hora o por día
- qué KPI necesita cierre diario y cuál necesita casi tiempo real
- qué timestamp usarías para ventas, fulfillment y reembolsos
- cuántas horas de tolerancia darías a datos tardíos
- qué ventanas recalcularías ante una corrección de pricing
- qué tabla materializarías como resumen diario de negocio

Ahora imaginá un SaaS con:

- tenants
- uso medido
- suscripciones
- invoices
- incidentes

Preguntas:

- qué cálculo harías por hora, cuál por día y cuál por ciclo mensual
- cómo separarías monitoreo operativo de facturación final
- cómo corregirías uso tardío o duplicado
- qué políticas de cierre de ventana usarías para billing confiable

## Resumen

Batch processing sigue siendo una herramienta fundamental para construir sistemas de datos útiles, confiables y económicamente razonables.

La idea central de este tema es esta:

**procesar por lotes no es simplemente correr jobs cada tanto; es decidir cómo agrupar el tiempo, cuándo considerar suficiente completitud, cómo materializar resultados y cómo corregir el pasado sin destruir la consistencia.**

Las ventanas de procesamiento permiten justamente eso:

- definir qué período se procesa
- con qué semántica temporal
- con qué política de cierre
- con qué tolerancia a tardanzas
- y con qué estrategia de reintento o recomputación

Cuando eso está bien diseñado, el batch deja de ser un parche nocturno.
Pasa a convertirse en una pieza central de reporting, conciliación, snapshots y procesamiento derivado serio.

Y eso nos deja listos para el siguiente tema, donde vamos a movernos hacia otro paradigma complementario:

**streaming y procesamiento incremental.**
