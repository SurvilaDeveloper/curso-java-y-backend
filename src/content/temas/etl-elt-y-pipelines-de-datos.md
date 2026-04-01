---
title: "ETL, ELT y pipelines de datos"
description: "Qué diferencia hay entre ETL y ELT, cómo pensar pipelines de datos sin humo, qué decisiones cambian según el volumen, la latencia y la calidad esperada, y cómo diseñar flujos de extracción, transformación y carga que no rompan ni la operación transaccional ni la capa analítica." 
order: 213
module: "Datos, reporting y procesamiento"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos una idea importante:

- el modelo transaccional no siempre sirve bien para reporting
- medir el negocio no es lo mismo que operar el negocio
- y una capa analítica sana necesita estructuras pensadas para consulta

Pero en cuanto eso queda claro, aparece una pregunta muy práctica:

**cómo se mueven los datos desde el mundo operativo hasta el mundo analítico.**

Porque una cosa es decir:

- “tengamos una tabla derivada”
- “armemos una vista materializada”
- “separemos reporting del core transaccional”

Y otra muy distinta es construir el mecanismo que lo haga realidad.

Ahí entran ETL, ELT y pipelines de datos.

No como palabras de moda, sino como formas concretas de responder preguntas como:

- de dónde saco los datos
- cada cuánto los muevo
- dónde los transformo
- cómo detecto errores
- qué pasa si una corrida falla a mitad de camino
- cómo evito duplicados
- cómo reproceso sin romper métricas
- cómo escalo cuando el volumen deja de ser chico

La idea central de este tema es esta:

**un pipeline de datos no es solo “mover información”; es diseñar un flujo confiable para extraer, transformar y publicar datos con semántica clara, costo razonable y comportamiento predecible.**

## El problema real: los datos no viajan solos ni llegan limpios

Cuando un sistema crece, los datos empiezan a vivir en lugares distintos.

Por ejemplo:

- una base transaccional principal
- logs de eventos
- una cola
- archivos exportados
- APIs externas
- herramientas SaaS de billing o soporte
- una base analítica o warehouse

Y el negocio quiere respuestas que cruzan todo eso.

Ejemplos:

- ventas por canal y región
- uso por tenant y plan
- tickets abiertos por tipo de cliente
- conciliación entre órdenes, pagos y reembolsos
- cohortes de activación combinando producto y facturación

Eso obliga a construir recorridos de datos.

El problema es que esos recorridos rara vez son tan limpios como parecen en una pizarra.

Aparecen cosas como:

- timestamps inconsistentes
- campos nulos inesperados
- estados ambiguos
- cambios de esquema
- filas duplicadas
- cargas parciales
- retrasos en la fuente
- datos tardíos
- fuentes que se caen
- transformaciones mal versionadas

Por eso un pipeline no es simplemente una automatización.

Es una parte del sistema que necesita diseño.

## Qué significa ETL

ETL significa:

- **Extract**
- **Transform**
- **Load**

La idea es esta:

1. extraés datos desde una o más fuentes
2. los transformás en una forma útil
3. recién después los cargás al destino final

Históricamente esto fue muy común cuando:

- las transformaciones eran pesadas
- el destino analítico tenía menos elasticidad
- convenía limpiar y consolidar antes de cargar
- las fuentes venían muy heterogéneas

### Ejemplo mental de ETL

Supongamos que querés cargar ventas diarias en una base analítica.

Podrías hacer algo así:

- leer órdenes desde la base operativa
- leer pagos desde otro sistema
- cruzar reembolsos
- aplicar reglas de conciliación
- generar un dataset limpio de ventas netas
- cargar recién ese resultado en el warehouse

Acá la transformación ocurre antes de la carga final.

## Qué significa ELT

ELT significa:

- **Extract**
- **Load**
- **Transform**

En este enfoque:

1. extraés los datos
2. los cargás bastante crudos al destino
3. transformás dentro del entorno analítico

Este enfoque se hizo mucho más común cuando los warehouses modernos empezaron a poder:

- almacenar grandes volúmenes relativamente barato
- ejecutar transformaciones potentes dentro del mismo sistema
- separar mejor capas crudas, intermedias y de negocio
- permitir reprocesos más cómodos

### Ejemplo mental de ELT

En vez de consolidar todo antes, hacés esto:

- cargás `orders` crudo
- cargás `payments` crudo
- cargás `refunds` crudo
- cargás snapshots o eventos tal como vienen
- y después, dentro del warehouse, construís modelos:
  - staging
  - modelos intermedios
  - hechos y dimensiones
  - tablas de negocio

Acá la transformación ocurre después de la carga.

## ETL vs ELT: no es una guerra religiosa

Uno de los errores más comunes es tratar esto como una discusión doctrinaria.

Como si hubiera una única respuesta moderna y todo lo demás fuera obsoleto.

No funciona así.

La pregunta sana no es:

**qué sigla está más de moda.**

La pregunta sana es:

**dónde conviene transformar según mi contexto técnico y de negocio.**

### Casos donde ETL puede tener mucho sentido

- cuando necesitás limpiar o anonimizar antes de cargar
- cuando no querés mover cierto dato sensible al destino final en crudo
- cuando el destino no es bueno transformando grandes volúmenes
- cuando integrás fuentes muy desprolijas y preferís consolidar antes
- cuando cargás archivos ya preparados para consumo

### Casos donde ELT suele ser muy conveniente

- cuando usás un warehouse fuerte para transformar
- cuando querés conservar materia prima casi cruda
- cuando necesitás reprocesar con reglas nuevas
- cuando querés versionar modelos analíticos por capas
- cuando el costo de cargar primero y transformar después es razonable

En muchos sistemas reales, además, no hay pureza total.

Hay mezclas.

Por ejemplo:

- una extracción que ya normaliza fechas y nombres de columnas
- una carga cruda al warehouse
- y luego transformaciones más semánticas dentro de la capa analítica

Eso también está bien.

## Qué es un pipeline de datos, de verdad

Un pipeline de datos es el recorrido controlado por el cual un conjunto de datos:

- sale de una fuente
- pasa por pasos de validación o transformación
- llega a un destino útil
- y deja trazabilidad sobre lo que hizo

No es solo un script suelto que corre cada tanto.

Un pipeline sano tiene, al menos implícitamente:

- una fuente
- un destino
- una frecuencia o condición de ejecución
- una definición de éxito o fracaso
- una estrategia frente a duplicados
- una manera de detectar incompletitud
- una forma de observar resultados
- una política de reproceso

Pensarlo así cambia mucho el nivel de calidad.

## Las tres preguntas que ordenan casi todo

Antes de diseñar un pipeline conviene responder tres preguntas.

### 1. Qué datos necesito mover

No “todo lo que exista”.
Sino exactamente qué entidades, qué campos y con qué objetivo.

### 2. Con qué frescura los necesito

No es lo mismo:

- cada día
- cada hora
- cada cinco minutos
- casi en tiempo real
- ante cada evento

### 3. Qué garantías necesito

Por ejemplo:

- tolero retraso pero no duplicados
- tolero duplicados temporales pero no pérdida
- tolero eventual consistency
- necesito auditabilidad fuerte
- necesito poder reprocesar todo el mes

Estas tres preguntas suelen definir más el diseño que la herramienta elegida.

## Batch y streaming: otra distinción importante

Además de ETL y ELT, hay otra separación que conviene entender:

- **batch**
- **streaming**

### Batch

Procesás datos por lotes.

Ejemplos:

- una vez por día
- cada hora
- cada noche
- al cierre de período

Ventajas:

- diseño más simple
- más fácil de depurar
- más fácil de reprocesar en bloques
- menos presión operativa continua

Costos:

- mayor latencia
- posibles picos de carga en ventanas concretas
- datos menos frescos

### Streaming

Procesás datos a medida que llegan o casi inmediatamente.

Ejemplos:

- eventos de uso
- cambios de estado
- pagos capturados
- eventos de fraude
- métricas operativas en tiempo casi real

Ventajas:

- menor latencia
- visibilidad más rápida
- mejor reacción operativa en ciertos casos

Costos:

- mayor complejidad
- más cuidado con orden, duplicados y reintentos
- debugging más difícil
- más exigencia de observabilidad

La trampa habitual es usar streaming porque “suena mejor”, cuando el negocio estaría perfectamente bien con batch.

## La mayoría de los problemas empiezan en la extracción

Muchos equipos piensan sobre todo en la transformación.

Pero la extracción ya puede arruinar todo.

### Problemas típicos al extraer

- leer tablas demasiado grandes completas cada vez
- depender de `updated_at` mal mantenidos
- perder registros tardíos
- romper la fuente por hacer consultas demasiado pesadas
- no saber desde qué punto continuar
- duplicar extracciones por retries mal diseñados

Por eso conviene pensar explícitamente la estrategia de extracción.

### Algunas estrategias comunes

#### Extracción full

Leés todo cada vez.

Sirve cuando:

- el volumen es bajo
- el costo es aceptable
- la simplicidad vale más que la eficiencia

#### Extracción incremental por watermark

Leés desde cierto punto en adelante.

Ejemplo:

- “traer todo lo creado o actualizado después de `T`”

Sirve mucho, pero exige cuidado con:

- relojes
- updates tardíos
- reintentos
- ventanas de solapamiento

#### Extracción basada en CDC o logs de cambios

Capturás cambios de la fuente en lugar de reconsultar todo.

Es muy potente, pero suele aumentar la complejidad operativa.

## Transformar no es solo limpiar columnas

Cuando alguien escucha “transformación”, a veces imagina cosas simples como:

- renombrar campos
- convertir tipos
- normalizar fechas

Eso existe, pero las transformaciones importantes suelen ser más semánticas.

Por ejemplo:

- decidir qué cuenta como venta válida
- conciliar un pago con una orden
- marcar una suscripción como churn real y no solo impaga temporalmente
- convertir eventos crudos en métricas de activación
- agrupar múltiples estados operativos en un estado analítico

Ahí la transformación ya no es cosmética.

Es lógica de negocio.

Y cuando hay lógica de negocio, hace falta:

- versionado
- claridad semántica
- tests
- trazabilidad

## Una buena práctica: separar capas dentro del pipeline

Aunque no uses herramientas sofisticadas, pensar en capas ayuda muchísimo.

### Capa cruda o raw

Datos muy parecidos a la fuente.

Objetivo:

- preservar la materia prima
- permitir auditoría
- facilitar reprocesos

### Capa staging o normalizada

Datos con:

- tipos consistentes
- nombres coherentes
- nulos tratados
- estructura más predecible

### Capa intermedia o semántica

Acá aparecen:

- joins importantes
- consolidaciones
- enriquecimientos
- reglas de negocio

### Capa de consumo

La que usan:

- dashboards
- reportes
- equipos de negocio
- modelos analíticos
- APIs internas de reporting

Pensar así evita mezclar en el mismo paso:

- ingestión
- limpieza
- reconciliación
- métrica final

Cuando todo eso se mezcla, el pipeline se vuelve difícil de entender y de reparar.

## Idempotencia también importa en datos

Éste es un punto clave.

Un pipeline tiene que convivir con:

- retries
- reejecuciones manuales
- reprocesos históricos
- eventos duplicados
- cargas parciales

Si no pensás idempotencia, aparecen problemas muy feos:

- métricas duplicadas
- tablas infladas
- snapshots inconsistentes
- resultados distintos en cada corrida

La pregunta útil es:

**si corro este paso otra vez con la misma entrada, el resultado queda bien o se rompe.**

Algunas formas comunes de cuidar esto:

- upserts en lugar de inserts ciegos
- claves naturales o técnicas bien definidas
- particiones reprocesables por período
- estrategias de replace por bloque
- deduplicación explícita
- checkpoints claros por corrida

## Los datos tardíos existen, aunque molesten

En casi todos los sistemas reales hay datos que llegan tarde.

Ejemplos:

- un proveedor externo confirma horas después
- una réplica se pone al día tarde
- un evento queda retenido en una cola
- un archivo llega con retraso
- un reembolso se registra días después de la venta original

Si el pipeline asume que todo llega en orden perfecto, las métricas se deforman.

Por eso muchas veces conviene:

- recalcular ventanas recientes
- dejar días abiertos a corrección
- usar marcas de negocio y no solo tiempo de ingesta
- distinguir entre dato observado y dato definitivo

Esto es especialmente importante en:

- billing
- conciliación financiera
- fulfillment
- métricas por día
- cohortes

## Qué rompe un pipeline con el tiempo

Al principio muchas cosas “andan”.
Después empiezan los problemas.

### Señales de deterioro

- nadie sabe bien qué hace cada job
- los nombres de tablas no explican semántica
- los pasos dependen de orden implícito no documentado
- una falla parcial deja datos mezclados
- no hay forma clara de reprocesar un rango
- cada cambio tarda demasiado por miedo a romper todo
- distintas salidas dan números incompatibles
- el pipeline tarda cada vez más sin que nadie entienda por qué

Estas son señales de que el pipeline dejó de ser un flujo diseñado y pasó a ser una zona artesanal acumulada.

## Qué observar en un pipeline

No alcanza con saber si “corrió”.

También conviene saber:

- cuánto tardó
- cuántas filas leyó
- cuántas escribió
- cuántas descartó
- cuántas quedaron inválidas
- qué particiones procesó
- cuál fue la última watermark válida
- cuántos retries hubo
- qué porcentaje falló por validación

Un pipeline puede terminar sin error técnico y aun así producir datos malos.

Por eso la observabilidad de datos no es solo disponibilidad.
También es volumen, frescura y calidad esperada.

## Ejemplo mental: e-commerce

Imaginá que querés producir una tabla diaria de ventas netas.

Podrías tener un pipeline que:

1. extrae órdenes nuevas o modificadas
2. extrae pagos capturados
3. extrae reembolsos
4. normaliza monedas, timestamps y estados
5. concilia orden, cobro y devolución
6. recalcula los últimos N días por seguridad
7. publica una tabla `daily_sales_facts`

Preguntas sanas para ese caso:

- qué pasa si un reembolso llega tres días tarde
- qué pasa si una orden cambia de estado después del cierre diario
- qué pasa si la corrida falla a mitad de publicación
- qué identificador garantiza que no duplicás ventas
- qué métricas pueden consumirse antes de conciliación final y cuáles no

## Ejemplo mental: SaaS B2B

Ahora imaginá que querés calcular uso facturable por tenant.

Un pipeline podría:

1. ingerir eventos de uso
2. deduplicarlos
3. mapearlos a features facturables
4. aplicar límites del plan
5. consolidar por tenant y período
6. publicar una tabla de metering lista para billing

Ahí aparecen preguntas distintas:

- qué hacés con eventos repetidos
- cómo tratás eventos tardíos
- cuál es el momento de corte mensual
- dónde versionás las reglas de facturación
- cómo auditás por qué un tenant terminó con cierto consumo

## Qué decisiones sanas puede tomar un backend engineer

Aunque no seas data engineer, hay varias decisiones muy valiosas que podés tomar.

### 1. Diseñar fuentes que sean extraíbles

Por ejemplo:

- timestamps confiables
- eventos con identificadores claros
- estados bien definidos
- cambios observables

### 2. No esconder semántica importante en SQL improvisado

Si una transformación define una métrica de negocio, merece claridad y versionado.

### 3. Favorecer reprocesos seguros

No asumir que cada corrida será perfecta.
Diseñar para repetir sin miedo.

### 4. Separar frescura de exactitud final

A veces conviene publicar un dato preliminar y luego uno conciliado.

### 5. Elegir la complejidad adecuada

No montar streaming distribuido para algo que con batch horario alcanza.

### 6. Documentar qué representa cada salida

Una tabla que nadie entiende no sirve aunque técnicamente esté “bien cargada”.

### 7. Pensar los pipelines como producto interno

Tienen usuarios.
Esos usuarios pueden ser:

- finanzas
- operaciones
- producto
- soporte
- otros servicios internos

## Mini ejercicio mental

Imaginá que tu sistema tiene:

- base operativa de órdenes
- eventos de uso de producto
- pagos en un proveedor externo
- tickets en una herramienta SaaS
- un warehouse para reporting

Preguntas para pensar:

- qué datos moverías primero y por qué
- qué harías por batch y qué dejarías más cerca de realtime
- dónde te conviene transformar: antes o después de cargar
- qué datos querrías conservar en raw
- qué estrategia usarías para reprocessar un período
- qué watermark o clave usarías para incrementalidad
- qué métrica sería peligrosa si no manejás datos tardíos

## Resumen

ETL y ELT no son simplemente dos siglas del mundo de datos.

Son dos maneras de decidir:

- cuándo transformar
- dónde transformar
- cómo conservar materia prima
- cómo publicar datos útiles sin destruir la operación

La idea central de este tema es esta:

**un buen pipeline de datos no solo mueve información; conserva significado, tolera fallas, permite reprocesar y entrega datos confiables para que el negocio pueda decidir mejor.**

Cuando eso está bien resuelto:

- el reporting deja de depender de consultas heroicas
- las métricas ganan estabilidad
- los reprocesos dejan de ser un drama
- la capa analítica se vuelve más explicable
- el backend conversa mejor con el mundo de datos

Y eso nos deja listos para el siguiente tema, donde vamos a meternos en una pieza muy usada para servir consultas rápidas y estables:

**proyecciones, read models y vistas materializadas.**
