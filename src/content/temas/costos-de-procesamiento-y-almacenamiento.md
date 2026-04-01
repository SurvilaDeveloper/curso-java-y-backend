---
title: "Costos de procesamiento y almacenamiento"
description: "Cómo pensar el costo real de correr pipelines, consultas, transformaciones, exportaciones y datasets derivados, por qué en sistemas data-aware el problema no es solo que algo funcione sino cuánto cuesta sostenerlo, qué componentes suelen disparar gasto en compute, storage, scans, retención y transferencia, qué decisiones técnicas empeoran la economía del sistema sin que el equipo lo note, y de qué manera diseñar datos, particiones, frecuencias, niveles de detalle y políticas de vida útil para que la plataforma siga siendo útil, escalable y financieramente razonable." 
order: 228
module: "Datos, reporting y procesamiento"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior hablamos de **observabilidad de pipelines de datos**.

Ahí vimos que no alcanza con saber si un job terminó verde o rojo.
También importa entender si el dato llegó completo, a tiempo, sin duplicaciones, con calidad suficiente y con impacto controlado.

Pero una vez que un equipo empieza a observar mejor sus pipelines, aparece otra pregunta que tarde o temprano se vuelve inevitable.

No solo:

- si el pipeline funciona
- si el dashboard está fresco
- si la transformación es correcta
- o si el sistema soporta el volumen actual

Sino también:

- cuánto cuesta sostener todo eso
- cuánto cuesta recalcular
- cuánto cuesta guardar históricos
- cuánto cuesta mantener datasets derivados duplicados
- cuánto cuesta exportar, escanear, re-procesar y servir datos
- y cuánto de ese costo realmente agrega valor

Porque en una etapa temprana muchas decisiones parecen baratas.

Guardar “por las dudas”.
Recalcular todo una vez más.
Duplicar una tabla porque simplifica una consulta.
Mantener varios read models parecidos.
Correr un pipeline cada cinco minutos aunque nadie necesite esa frecuencia.
Volver a procesar históricos completos por comodidad.
Guardar snapshots diarios, horarios y por evento.

Al principio eso puede pasar desapercibido.
Pero cuando el sistema crece, esa comodidad empieza a tener impacto real.

Impacto en:

- la factura cloud
- la performance
- los tiempos de proceso
- la complejidad operativa
- la huella de almacenamiento
- el costo de recovery
- y la sostenibilidad general de la plataforma

Por eso este tema es importante.

**Pensar costos de procesamiento y almacenamiento no es un ejercicio financiero separado de la arquitectura; es parte del diseño técnico de un backend que ya empezó a volverse data-aware.**

En esta lección vamos a estudiar:

- por qué costo y arquitectura están profundamente conectados
- dónde se dispara el gasto en sistemas de datos
- qué decisiones técnicas suelen encarecer la plataforma sin necesidad
- cómo pensar costo de compute, storage, scans y transferencia
- qué estrategias ayudan a mantener utilidad sin sobreconstruir
- y cómo razonar sobre eficiencia sin caer en optimización prematura

## El error clásico: creer que el costo es problema del área financiera

Éste es un error muy común.

Un equipo técnico diseña pipelines, tablas, storage, jobs, colas y exportaciones pensando sobre todo en:

- que funcione
- que sea rápido
- que sea flexible
- que sea observable

Y asume que el costo “lo verá después” otra parte de la organización.

Pero en sistemas reales eso rara vez funciona bien.

Porque gran parte del costo no nace de un precio aislado.
Nace de decisiones de diseño.

Por ejemplo:

- frecuencia de ejecución innecesariamente alta
- datasets derivados demasiado redundantes
- queries que escanean muchísimo más de lo necesario
- almacenamiento eterno de datos que ya no se usan
- particionado pobre que obliga a leer de más
- formatos ineficientes
- recomputaciones completas cuando alcanzaba con incremental
- granularidad excesiva en logs, eventos o snapshots
- exportaciones lanzadas sin límites ni cuotas
- pipelines acoplados que repiten trabajo varias veces

En otras palabras:

**muchas veces el costo no es una consecuencia accidental del crecimiento; es el reflejo directo de cómo está pensada la arquitectura.**

## Costo no es solo “cuánto pago por mes”

Cuando se habla de costos, mucha gente piensa enseguida en la factura del proveedor.
Eso importa, claro.
Pero técnicamente conviene pensar el costo en varias dimensiones.

## 1. Costo monetario directo

Es el más evidente.

Incluye cosas como:

- cómputo consumido por jobs y queries
- almacenamiento persistente
- almacenamiento de backups y snapshots
- transferencia de datos
- servicios administrados
- colas, clusters, warehouses, buckets y bases asociadas

## 2. Costo de performance

Aunque algo no “cueste más” en dinero de forma inmediata, puede costar en:

- latencia
- saturación
- contención de recursos
- competencia con cargas transaccionales
- backlog operativo

Un pipeline ineficiente quizá no solo gaste más.
También puede empeorar la operación del resto del sistema.

## 3. Costo de complejidad

Cada dataset derivado extra, cada read model adicional, cada copia redundante y cada flujo de recomputación agrega superficie operativa.

Eso cuesta en:

- mantenimiento
- debugging
- observabilidad
- testing
- recovery
- coordinación entre equipos

## 4. Costo de oportunidad

Cuando el sistema está lleno de jobs caros, lentos y poco eficientes, el equipo pierde capacidad para:

- agregar nuevas capacidades
- responder picos
- experimentar
- servir clientes más grandes
- o priorizar cosas con más retorno

Entonces el costo no es solo plata.
También es capacidad futura.

## Dónde suele estar el costo real en sistemas data-aware

No siempre está donde el equipo cree.

A veces alguien mira una tabla enorme y asume que ahí está el principal problema.
Pero muchas veces el gasto más fuerte viene de otra parte.

## 1. Compute repetido o innecesario

Es muy común procesar más veces de las necesarias.

Por ejemplo:

- recalcular todo el histórico para producir un agregado diario
- recomputar métricas completas cuando solo cambió una partición
- hacer join costoso en cada request en vez de materializar una vista razonable
- regenerar exportaciones idénticas varias veces
- correr el mismo enriquecimiento en varios pipelines paralelos

Cuando el sistema escala, el compute redundante se vuelve carísimo.

## 2. Scans excesivos

En muchos stacks modernos, una parte grande del costo proviene de cuánto dato se lee, no solo de cuánto se guarda.

Por eso duele tanto:

- no particionar bien
- no filtrar temprano
- guardar en formatos poco eficientes
- consultar tablas enormes para obtener subconjuntos mínimos
- no usar pruning posible por fecha, tenant o segmento

Un pipeline puede estar “bien” funcionalmente y aun así ser ruinoso porque escanea de más en cada corrida.

## 3. Almacenamiento redundante

Guardar datos no siempre es caro al principio, y eso genera una falsa sensación de libertad.

Entonces aparecen:

- copias crudas
- copias limpias
- copias enriquecidas
- snapshots completos diarios
- tablas agregadas duplicadas por equipo
- datasets temporales que nunca se borran
- resultados intermedios persistidos indefinidamente

Cada pieza puede parecer razonable por separado.
Pero juntas terminan armando un ecosistema de datos sobredimensionado y difícil de sostener.

## 4. Retención indefinida

“Guardemos todo por las dudas” es una frase peligrosamente cara.

A veces realmente hace falta conservar mucho tiempo.
Por auditoría, compliance, histórico analítico o trazabilidad.

Pero otras veces se retiene indefinidamente información que:

- ya no se consulta
- ya fue agregada en otro nivel
- ya fue exportada
- o solo se conserva por inercia

La falta de políticas de ciclo de vida suele disparar el storage sin que nadie lo cuestione durante meses.

## 5. Transferencia y movimiento de datos

Mover datos también cuesta.

Y no solo en dinero.
También en tiempo, fragilidad y dependencia entre capas.

Por ejemplo:

- copiar datasets entre regiones
- exportar grandes volúmenes frecuentemente
- replicar entre servicios y entornos
- mover datos entre OLTP, lake, warehouse y serving layer
- enviar archivos masivos a clientes o partners

Muchas arquitecturas se encarecen no por cuánto almacenan, sino por cuánto mueven permanentemente.

## Qué decisiones técnicas suelen encarecer el sistema sin necesidad

## 1. Frecuencia de ejecución no alineada con necesidad real

Éste es un error muy común.

Se diseña un pipeline para correr:

- cada minuto
- cada cinco minutos
- en cuasi tiempo real

Porque “suena mejor” o porque técnicamente se puede.

Pero después el caso de uso real es:

- reporte diario
- scorecard por hora
- conciliación nocturna
- exportación semanal

Entonces el equipo paga costo de frescura que el negocio ni siquiera necesitaba.

**No toda necesidad es realtime.**
Y forzar near real-time donde no hace falta suele ser una forma muy cara de sofisticación innecesaria.

## 2. Materializar demasiado

Materializar ayuda muchísimo cuando reduce costo repetido y mejora consumo.
Pero materializar todo también puede salir mal.

Por ejemplo:

- demasiadas tablas derivadas levemente diferentes
- agregados por cada variante posible de consumo
- datasets por equipo en vez de datasets compartidos con ownership claro
- snapshots completos donde alcanzaba con incremental

La pregunta no es “¿materializo o no?”.
La pregunta es:

**¿esta materialización evita costo recurrente real o solo desplaza complejidad y storage a otra parte?**

## 3. No diferenciar niveles de detalle

No todo dato tiene que quedar disponible con la misma granularidad para siempre.

A veces conviene distinguir entre:

- dato crudo de alta resolución por un período acotado
- dato agregado por períodos más largos
- snapshots o resúmenes históricos de conservación extendida

Si guardás indefinidamente todo en el máximo nivel de detalle, el costo crece sin control.

## 4. Reprocesar todo por simplicidad operativa

A veces se elige recalcular todo porque la lógica incremental parece más compleja.

Y en sistemas chicos eso puede estar bien.
Pero cuando el volumen crece, esa comodidad deja de ser barata.

Entonces aparece una pregunta importante:

- ¿seguimos recomputando full por simplicidad?
- ¿o ya llegó el punto en el que incremental, particionado o re-proceso selectivo son claramente más razonables?

No hay una respuesta universal.
Pero ignorar la pregunta suele salir caro.

## 5. Diseñar sin costo por consulta en mente

Muchos problemas nacen porque el modelo se piensa solo desde semántica o comodidad de consumo, sin mirar qué implican las consultas reales.

Por ejemplo:

- filtros que no aprovechan partición
- joins inevitables entre datasets gigantes
- columnas de alta cardinalidad usadas mal
- falta de clustering o orden útil
- datasets que obligan a leer enormes rangos históricos

Cuando el uso crece, la semántica sola no alcanza.
También importa cuánto cuesta servirla.

## Compute barato, almacenamiento barato: una media verdad peligrosa

Es común escuchar frases como:

- “el storage hoy es barato”
- “el compute escala”
- “después optimizamos”

Hay algo de verdad en eso.
En fases tempranas muchas veces conviene priorizar velocidad de aprendizaje.

Pero esa idea se vuelve peligrosa cuando se convierte en excusa permanente.

Porque el problema no suele ser que una corrida puntual sea cara.
El problema es este:

- miles de corridas
- durante meses
- sobre cada vez más volumen
- con más tenants
- más consumidores
- más réplicas
- más históricos
- más re-procesos

Lo que parecía irrelevante en pequeño empieza a multiplicarse de forma brutal.

Por eso el criterio sano no es optimizar todo desde el día uno.
Tampoco ignorar siempre el costo.

El criterio sano es:

**detectar qué decisiones tienen efecto multiplicador y diseñarlas con algo de disciplina desde temprano.**

## Cómo pensar el costo de almacenamiento

Una forma útil es dejar de ver storage como un solo bloque indiferenciado.

## 1. Datos fuente

Son los datos crudos o casi crudos que necesitás para:

- trazabilidad
- reconstrucción
- backfills
- auditoría
- debugging

La pregunta acá es:

- ¿cuánto tiempo hace falta conservarlos?
- ¿con qué formato?
- ¿con qué compresión?
- ¿en qué nivel de acceso?

## 2. Datos derivados

Son resultados de transformaciones, agregados, read models, vistas materializadas o tablas de serving.

Acá conviene preguntar:

- ¿cuántos consumidores reales tienen?
- ¿evitan trabajo costoso o solo duplican información?
- ¿se regeneran fácil o son difíciles de recalcular?
- ¿tienen una política clara de versionado y obsolescencia?

## 3. Datos temporales o intermedios

Suelen olvidarse muchísimo.

Por ejemplo:

- staging tables
- archivos parciales
- exports temporales
- resultados de backfills
- snapshots auxiliares
- checkpoints que ya no sirven

Muchas plataformas se encarecen mucho por basura intermedia que nunca se limpia.

## 4. Backups y snapshots

Importan, claro.
Pero también conviene saber:

- qué se respalda
- con qué frecuencia
- con qué retención
- qué nivel de redundancia es realmente necesario

No todo merece la misma política de backup.

## Cómo pensar el costo de procesamiento

## 1. Costo por ejecución

Cada job o query tiene un costo unitario.

Conviene preguntar:

- ¿cuánto tarda?
- ¿cuánto lee?
- ¿cuánto escribe?
- ¿cuánto compute ocupa?
- ¿cuánto compite con otras cargas?

## 2. Costo por frecuencia

Una ejecución barata puede ser muy cara si corre innecesariamente miles de veces.

## 3. Costo por volumen

A medida que el volumen sube, algunas estrategias escalan razonablemente y otras explotan.

Por ejemplo:

- full recompute diario
- joins entre históricos completos
- scans sin pruning
- serialización pesada sobre datasets masivos

## 4. Costo por concurrencia

A veces el problema no es una corrida aislada.
Es muchas al mismo tiempo.

Por ejemplo:

- varios tenants grandes exportando en paralelo
- re-procesos coincidiendo con jobs normales
- dashboards pesados corriendo al mismo tiempo que pipelines batch
- reconciliaciones y cierres compartiendo recursos con la operación estándar

## 5. Costo por recovery

También importa cuánto cuesta recuperarse de un incidente.

Si cada reparación implica re-procesar históricos completos, el sistema es operativamente caro aunque el día a día parezca razonable.

## Particionado, incrementalidad y compresión: tres aliados enormes

No son la solución a todo, pero ayudan muchísimo.

## Particionado

Bien usado, reduce:

- scans
- recomputaciones
- costo de lectura
- tiempo de recovery

Particionar por:

- fecha
- tenant
- región
- dominio operativo

puede cambiar drásticamente el costo total del sistema.

Mal usado también puede empeorar las cosas.
Por ejemplo con demasiada fragmentación o claves que no acompañan los patrones reales de consulta.

## Incrementalidad

Cuando el volumen crece, procesar solo lo nuevo o lo cambiado suele ser una ventaja enorme.

No siempre vale la pena desde el principio.
Pero a cierta escala pasa a ser uno de los mayores drivers de eficiencia.

## Compresión y formatos adecuados

No es lo mismo:

- guardar todo como texto plano
- usar formatos columnares cuando el caso de uso lo favorece
- comprimir bien
- ordenar de modo útil para pruning o lectura parcial

Una mala decisión de formato se paga una y otra vez en storage, scans y tiempos de proceso.

## El costo de la redundancia útil vs la redundancia inútil

No toda duplicación es mala.

A veces duplicar datos o materializar resultados está muy bien porque:

- mejora tiempo de respuesta
- desacopla consumo
- reduce joins costosos repetidos
- protege sistemas fuente
- facilita serving estable para varios consumidores

El problema aparece cuando la redundancia deja de ser estratégica y pasa a ser caótica.

Por ejemplo:

- tres equipos mantienen agregados casi iguales
- hay tablas que nadie sabe si siguen en uso
- se exportan snapshots completos que nadie consulta
- se replican datasets “por seguridad” sin ownership claro

Entonces conviene distinguir:

### Redundancia útil

Existe por una razón explícita, medible y entendida.

### Redundancia inútil

Existe por inercia, miedo a borrar, falta de ownership o ausencia de limpieza periódica.

## Una pregunta muy sana: ¿quién paga este costo y por qué?

Ésta es una gran pregunta de diseño.

No necesariamente en sentido contable fino.
Sino en sentido arquitectónico.

Por ejemplo:

- ¿el costo lo absorbe el pipeline nocturno?
- ¿lo absorbe el usuario cuando pide una exportación?
- ¿lo absorbe el sistema transaccional porque una consulta analítica pega sobre OLTP?
- ¿lo absorbe un tenant ruidoso perjudicando a otros?
- ¿lo absorbe el equipo de operaciones porque cada recovery es carísimo?

Pensar así ayuda a detectar costos escondidos.

A veces una solución parece barata en un lugar porque está trasladando el costo a otro:

- a la base transaccional
- al equipo de soporte
- al cliente que espera demasiado
- al área financiera que recibe facturas inesperadas
- o al equipo de datos que vive apagando incendios

## Políticas de ciclo de vida: una de las cosas más subestimadas

Muchos problemas de costo no se resuelven con una gran optimización heroica.
Se resuelven con disciplina básica.

Por ejemplo:

- retención diferenciada por tipo de dato
- borrado programado de temporales
- archivado de históricos viejos
- downgrade de storage para datos fríos
- expiración de exports generadas
- limpieza periódica de staging y snapshots auxiliares
- revisión de datasets sin consumidores reales

Esto suele tener impacto enorme con complejidad moderada.

## Métricas que conviene mirar para no gestionar costo a ciegas

No hace falta construir un sistema financiero complejo desde el día uno.
Pero sí conviene mirar algunas señales.

### Métricas de almacenamiento

- tamaño por dataset
- crecimiento semanal o mensual
- tamaño por entorno
- tamaño por tenant si aplica
- proporción entre raw, curated, serving y temporales
- volumen retenido fuera de política esperada

### Métricas de procesamiento

- costo por job o por pipeline crítico
- duración por corrida
- bytes leídos y escritos
- costo por re-proceso
- frecuencia de full recompute
- queries más caras o más repetidas

### Métricas de consumo

- dashboards o exports más demandados
- datasets materializados sin uso real
- tenants o clientes con patrones desbalanceados
- jobs triggered manualmente con alta frecuencia

### Métricas de eficiencia

- cuánto del dato almacenado se consulta realmente
- cuánto del dato leído termina siendo útil
- cuánto trabajo repetido existe entre pipelines
- cuánto storage temporal queda huérfano

## Errores muy comunes cuando un equipo intenta “bajar costos”

## 1. Cortar gasto sin entender arquitectura

A veces se busca ahorrar rápido y se rompen capacidades valiosas.

Por ejemplo:

- borrar históricos necesarios para auditoría
- bajar retención sin entender dependencias
- desmaterializar datasets que evitaban cargas muy costosas
- mover todo a storage frío sin mirar tiempos de recuperación

Reducir costo sin entender el sistema puede salir más caro después.

## 2. Optimizar lo irrelevante

También pasa lo contrario.

El equipo dedica muchísimo tiempo a ahorrar poco en algo marginal mientras ignora:

- scans enormes recurrentes
- recomputaciones completas diarias
- storage temporal descontrolado
- exportaciones duplicadas sin límites

## 3. Medir solo la factura total

La factura total sirve, pero no ayuda a decidir si no sabés:

- qué pipeline cuesta más
- qué dataset crece más
- qué equipo o flujo genera más presión
- qué cambio disparó el gasto

## 4. No asignar ownership

Si nadie es responsable de revisar:

- datasets huérfanos
- temporales viejos
- materializaciones redundantes
- políticas de retención

entonces el costo solo puede crecer.

## 5. Perseguir costo cero a costa de utilidad

Un sistema demasiado “optimizado” puede volverse rígido, frágil o lento para el negocio.

El objetivo no es minimizar cualquier gasto.
El objetivo es que el costo tenga sentido respecto del valor que produce.

## Qué se gana cuando el costo pasa a ser una preocupación técnica sana

Cuando el equipo madura en esto, gana varias cosas.

### Más previsibilidad

Es más fácil anticipar qué pasa cuando sube el volumen, aparece un cliente grande o se habilita una nueva analítica.

### Más capacidad de escala

El sistema puede crecer sin que cada nueva necesidad multiplique el gasto de forma descontrolada.

### Mejor priorización

Se vuelve más claro qué optimización vale la pena y cuál no.

### Menos deuda invisible

Los costos dejan de acumularse silenciosamente en pipelines, tablas y storage que nadie revisa.

### Arquitectura más sostenible

La plataforma deja de ser solo funcional.
También se vuelve económicamente viable de sostener.

## Cierre

Pensar costos de procesamiento y almacenamiento no significa convertir cada decisión técnica en una planilla.

Significa algo más simple y más importante:

**entender que en sistemas con datos, la arquitectura también define cuánto cuesta operar, crecer, recuperar y servir valor.**

No alcanza con que un pipeline funcione.
También importa:

- cuánto procesa
- cuántas veces corre
- cuánto lee
- cuánto duplica
- cuánto guarda
- cuánto mueve
- y cuánto de todo eso realmente vale la pena

Porque un sistema data-aware sano no es el que acumula más datos ni el que corre más jobs.
Es el que logra una relación razonable entre:

- utilidad
- frescura
- trazabilidad
- costo
- y sostenibilidad operativa

Cuando esa relación está mal, la plataforma se vuelve pesada, cara, difícil de justificar y más frágil de lo que parece.

Cuando está bien, el sistema puede crecer con más control y con decisiones mucho menos impulsivas.

En el próximo tema vamos a cerrar este bloque con una pregunta muy importante: **cuándo un backend necesita separarse de su capa analítica**.
