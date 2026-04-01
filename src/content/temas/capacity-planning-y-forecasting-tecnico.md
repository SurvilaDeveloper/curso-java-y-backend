---
title: "Capacity planning y forecasting técnico"
description: "Qué es planificar capacidad en sistemas reales, por qué crecer no es solo agregar más máquinas, cómo estimar demanda, detectar cuellos de botella futuros y decidir inversiones técnicas antes de que la saturación se convierta en una crisis operativa."
order: 148
module: "Seguridad y operación avanzada"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior hablamos de **runbooks, on-call y operación de incidentes**.

Ahí vimos que una parte importante de operar sistemas reales consiste en responder bien cuando algo ya está fallando:

- detectar
- diagnosticar
- coordinar
- mitigar
- escalar
- aprender después

Pero un equipo maduro no puede vivir solamente reaccionando.

Si toda la operación gira alrededor de incidentes, guardias, alertas y mitigaciones de urgencia, tarde o temprano aparece una pregunta más incómoda:

**¿estamos creciendo hacia un sistema sostenible o simplemente estamos sobreviviendo hasta el próximo cuello de botella?**

Y esa pregunta nos mete de lleno en este tema.

Porque muchos problemas operativos importantes no aparecen de golpe.
Se van gestando.
Se acumulan.
Se vuelven visibles tarde.
Y cuando finalmente explotan, el equipo siente que “pasó de la nada”, aunque en realidad había señales previas.

Por ejemplo:

- una base que cada mes tarda un poco más en responder
- una cola que en picos especiales tarda cada vez más en vaciarse
- un cluster cuyo uso promedio parece razonable, pero cuyos picos ya rozan el límite
- una dependencia externa que crece en costo y latencia a medida que sube el tráfico
- un proceso batch nocturno que empieza a solaparse con el horario hábil
- un sistema multi-tenant donde unos pocos clientes grandes cambian por completo el perfil de carga
- un servicio cuyo throughput teórico parece suficiente, pero cuya combinación de CPU, I/O y locking lo vuelve frágil ante variaciones reales

En todos esos casos, el problema no es únicamente “capacidad actual”.
El problema es **la relación entre capacidad, demanda, crecimiento, riesgo operativo y tiempo de reacción**.

Eso es justamente lo que estudia el capacity planning.

Y cuando además intentamos proyectar cómo podría cambiar esa demanda en el tiempo, entramos en el forecasting técnico.

En esta lección vamos a ver:

- qué significa realmente planificar capacidad
- por qué no alcanza con mirar uso promedio
- qué señales ayudan a anticipar saturación futura
- cómo pensar demanda, throughput, latencia, concurrencia y margen operativo
- qué diferencia hay entre estimar y adivinar
- cómo construir modelos simples pero útiles
- cómo conectar crecimiento de negocio con decisiones técnicas
- qué errores comunes llevan a subestimar o sobredimensionar sistemas

## Qué es capacity planning

**Capacity planning** es la práctica de estimar cuánta capacidad necesita un sistema para soportar su carga esperada con un nivel aceptable de desempeño, resiliencia y costo.

Dicho más simple:

es intentar responder, con criterio técnico, preguntas como estas:

- ¿cuánto tráfico podemos soportar hoy?
- ¿cuánto margen real tenemos?
- ¿qué componente se va a saturar primero si crecemos?
- ¿qué pasa en el próximo pico comercial o evento importante?
- ¿cuándo deberíamos escalar infraestructura o rediseñar una parte del sistema?
- ¿estamos operando demasiado al límite?
- ¿estamos gastando mucho más de lo que hace falta?

Fijate que no se trata solo de “comprar más capacidad”.

También se trata de:

- entender límites reales
- anticipar puntos de quiebre
- priorizar inversiones
- reducir incertidumbre
- evitar reaccionar demasiado tarde
- operar con margen razonable

## Qué es forecasting técnico

El **forecasting técnico** complementa el capacity planning.

Mientras capacity planning pregunta algo como:

- ¿qué capacidad necesitamos?

El forecasting agrega otra dimensión:

- ¿cómo creemos que evolucionará la demanda y cuándo esa necesidad va a cambiar?

Es decir, intenta proyectar tendencias futuras usando:

- histórico de tráfico
- estacionalidad
- lanzamientos de producto
- campañas comerciales
- incorporación de clientes grandes
- crecimiento por tenant
- cambios de comportamiento de uso
- impacto esperado de nuevas features
- patrones horarios, semanales o mensuales

No busca adivinar el futuro con precisión mágica.
Busca **reducir sorpresa operativa**.

En sistemas reales, la mayoría de las decisiones de capacidad no requieren una predicción perfecta.
Requieren una estimación razonable, explícita y revisable.

## La diferencia entre capacidad teórica y capacidad operativa real

Un error muy común es pensar que la capacidad de un sistema es un único número.

Por ejemplo:

- “este servicio procesa 2000 requests por segundo”
- “esta base soporta 500 conexiones”
- “esta cola maneja 50 mil eventos por minuto”

Esos números pueden servir como referencia, pero casi siempre esconden demasiado.

Porque la capacidad real depende de muchas condiciones:

- tipo de operación
- mezcla de lecturas y escrituras
- tamaño del payload
- percentiles de latencia aceptables
- cache hit ratio
- distribución por tenant
- concurrencia
- picos cortos versus carga sostenida
- dependencia de terceros
- locks, retries, timeouts y backpressure
- degradación bajo error parcial

Por eso conviene distinguir entre:

### Capacidad teórica

Lo que el sistema podría soportar en condiciones idealizadas o de laboratorio.

### Capacidad operativa real

Lo que realmente puede sostener en producción con:

- tráfico heterogéneo
- ruido operativo
- fallos parciales
- despliegues
- jobs en paralelo
- variación temporal
- dependencia de sistemas externos
- margen suficiente para absorber desvíos

En producción casi nunca te interesa el máximo absoluto.
Te interesa el **máximo sostenible con riesgo razonable**.

## Capacidad no es solo infraestructura

A veces se reduce todo a “CPU, RAM y pods”.
Pero el problema real suele ser más amplio.

La capacidad de un sistema está distribuida entre varios límites posibles.

### 1. Capacidad de cómputo

- CPU
- memoria
- threads
- workers
- file descriptors
- conexiones abiertas

### 2. Capacidad de datos

- throughput de lecturas
- throughput de escrituras
- locking
- tamaño de índices
- IOPS
- replication lag
- crecimiento de tablas
- costo de joins o scans

### 3. Capacidad de integración

- rate limits de terceros
- throughput contractual con proveedores
- colas internas hacia sistemas externos
- tiempo de respuesta de APIs dependientes

### 4. Capacidad operativa

- cuántos incidentes simultáneos puede absorber el equipo
- cuánto tarda una mitigación manual
- cuánto tarda escalar un cluster
- cuánto demora aprovisionar recursos nuevos
- cuánto tarda restaurar o hacer rollback

### 5. Capacidad económica

- presupuesto disponible
- elasticidad de costos
- costo marginal por tenant o por transacción
- límite donde escalar deja de ser financieramente razonable

Esto importa mucho porque un sistema puede sobrar de CPU y aun así quedarse sin capacidad útil por:

- base de datos saturada
- dependencia externa lenta
- cola atrasada
- cardinalidad explosiva en métricas
- storage insuficiente
- equipo incapaz de operar el crecimiento con seguridad

## La idea de margen operativo

En muchos contextos, operar cerca del 100% parece eficiente.
En sistemas reales suele ser peligroso.

Un servicio que vive siempre al borde:

- tolera peor un pico inesperado
- degrada más rápido frente a errores parciales
- tiene menos espacio para retries
- responde peor durante deploys o failovers
- vuelve más costoso cualquier incidente

Por eso el capacity planning no apunta solo a “soportar la carga actual”.
También apunta a conservar **margen operativo**.

Ese margen sirve para absorber:

- picos normales
- picos anómalos
- variabilidad temporal
- fallas parciales
- rebalanceos
- tareas de mantenimiento
- crecimiento más rápido del esperado

La pregunta correcta no es únicamente:

- ¿aguanta?

Sino también:

- ¿aguanta con margen suficiente para no volverse frágil?

## Throughput, latencia y concurrencia: tres variables que no conviene mezclar mal

Cuando se habla de capacidad, estas tres ideas aparecen todo el tiempo.

### Throughput

Es cuánto trabajo procesa el sistema por unidad de tiempo.

Ejemplos:

- requests por segundo
- jobs por minuto
- eventos consumidos por hora
- órdenes creadas por segundo

### Latencia

Es cuánto tarda una operación en completarse.

Ejemplos:

- p50, p95, p99 de una API
- tiempo total de checkout
- demora de una exportación

### Concurrencia

Es cuántas operaciones están en curso al mismo tiempo.

Ejemplos:

- usuarios simultáneos
- requests activas
- workers ocupados
- jobs en ejecución concurrente

Estas variables están relacionadas, pero no son equivalentes.

Podés tener:

- buen throughput con mala latencia
- baja concurrencia con alto costo por request
- latencia aceptable hasta cierto punto y luego degradación abrupta
- throughput estable en promedio, pero colapso en percentiles altos

Por eso los modelos de capacidad más útiles no se quedan con una sola métrica aislada.

## Los promedios engañan mucho

Este punto es importantísimo.

Supongamos que un servicio promedia 40% de CPU diaria.
A primera vista parece que sobra capacidad.

Pero ese promedio puede esconder que:

- a las 11:00 y a las 18:00 sube al 85%
- durante deploys o rebalanceos supera 90%
- cuando cae la caché llega a 95%
- un tenant grande concentra la mayoría del consumo en ciertas ventanas
- los p95 de latencia se disparan bastante antes del límite de CPU

Lo mismo pasa con:

- conexiones a base
- tamaño de cola
- uso de memoria
- throughput por shard
- latencia por endpoint

El average sirve, pero rara vez alcanza.

Para capacity planning suele importar mucho más mirar:

- picos
- percentiles
- tendencia de picos
- duración de saturaciones
- frecuencia de eventos cercanos al límite
- comportamiento bajo combinaciones desfavorables

## Demanda normal, picos y estacionalidad

No toda demanda se comporta igual.

Un sistema puede ser muy estable, o puede tener perfiles mucho más agresivos.

### Demanda base

Es la carga normal del día a día.

### Picos previsibles

Son aumentos esperables por eventos conocidos.

Ejemplos:

- cierre de mes
- campañas de marketing
- Black Friday
- horario de apertura comercial
- batch nocturno de facturación
- onboarding masivo de clientes

### Picos imprevisibles

Son aumentos que no podés anticipar con precisión, pero sí contemplar como riesgo.

Ejemplos:

- mención mediática
- comportamiento viral
- ataque de abuso
- fallo de un proveedor que redirige tráfico
- retry storms

### Estacionalidad

Son patrones repetitivos de variación.

Ejemplos:

- ciertos días de la semana
- cierto horario del día
- determinados meses
- eventos recurrentes del negocio

Un error típico es diseñar para la demanda promedio y descubrir tarde que el sistema falla en la demanda importante: la del pico que sí importa para el negocio.

## Capacidad y colas: cuando el sistema no cae, pero empieza a atrasarse

No todos los problemas de capacidad se manifiestan como caída inmediata.

A veces el sistema sigue respondiendo, pero acumula trabajo pendiente.

Eso pasa mucho en:

- colas de procesamiento
- pipelines batch
- envíos de emails
- sincronizaciones con terceros
- generación de reportes
- indexing
- jobs de billing

En esos casos, una señal crítica no es solo “¿está vivo?”
Sino también:

- ¿la cola se vacía más rápido de lo que entra?
- ¿el backlog está creciendo?
- ¿cuánto tardaría en recuperarse si el pico termina ahora?
- ¿la latencia total de procesamiento sigue dentro de lo aceptable?

Un sistema puede no romperse de golpe y aun así entrar en una forma lenta de saturación:

**cada minuto procesa menos de lo que necesita, y la deuda operativa se acumula.**

Eso también es un problema de capacidad.

## Qué componentes suelen saturarse primero

No siempre falla lo que uno imagina.

En muchos sistemas, el primer cuello de botella suele estar en alguno de estos lugares:

### Base de datos principal

Muy frecuente por:

- consultas costosas
- falta de índices
- locking
- crecimiento de tablas
- write amplification
- mezcla de OLTP con cargas analíticas

### Caché

No porque la caché “sea mala”, sino porque:

- se dimensionó mal
- tiene keys explosivas
- el eviction pattern degrada el hit ratio
- un cache miss masivo empuja todo hacia la base

### Dependencias externas

Por ejemplo:

- pagos
- correo
- carriers
- servicios de identidad
- ERPs
- storage externo

Tu sistema puede tener capacidad local suficiente y aun así quedar limitado por un proveedor.

### Workers asíncronos

Sucede cuando:

- la tasa de entrada supera la de procesamiento
- el tamaño medio del job crece
- hay reintentos excesivos
- la paralelización genera contención en otro recurso

### Almacenamiento y red

Más frecuente de lo que parece en:

- uploads
- exportaciones grandes
- analytics pesadas
- backups
- replicación

### El propio equipo

Sí: a veces el verdadero cuello de botella es organizacional.

Por ejemplo:

- tarda demasiado en hacer cambios seguros
- no puede aprovisionar rápido
- no tiene suficiente observabilidad
- depende de una sola persona para ajustar capacidad

## Capacity planning no es solo para “gran escala”

Éste es otro error común.

Hay quienes creen que planificar capacidad recién importa cuando tenés millones de usuarios.

No es así.

Importa mucho antes.

Porque incluso en sistemas pequeños o medianos puede haber:

- campañas puntuales
- clientes desproporcionadamente grandes
- recursos limitados
- dependencia fuerte de una sola base o proveedor
- batchs sensibles
- errores que disparan reintentos costosos

En realidad, cuanto menos margen económico y operativo tiene un sistema, más útil suele ser pensar capacidad con criterio.

## Modelos simples que ya ayudan muchísimo

No hace falta arrancar con una disciplina hiper sofisticada.

Muchas veces alcanza con construir modelos simples pero explícitos.

### Modelo 1: crecimiento lineal básico

Preguntas útiles:

- ¿cuál es el tráfico actual?
- ¿cuánto creció en los últimos 3, 6 o 12 meses?
- si esa tendencia sigue, ¿cuándo tocamos el primer límite?

No es perfecto, pero ya ayuda a visualizar urgencia.

### Modelo 2: carga por evento comercial

Preguntas útiles:

- ¿qué pasó en el último evento comparable?
- ¿qué componente sufrió más?
- ¿cuánto margen hubo realmente?
- ¿qué crecería si el próximo pico fuera 2x?

### Modelo 3: capacidad por tenant

Muy importante en SaaS o B2B.

Preguntas útiles:

- ¿qué tenants concentran consumo?
- ¿cuánto costaría incorporar dos clientes grandes más?
- ¿qué capacidad necesita cada nuevo tenant enterprise?

### Modelo 4: tasa de entrada vs tasa de salida

Ideal para colas y procesamiento asíncrono.

Preguntas útiles:

- ¿a qué ritmo entra trabajo?
- ¿a qué ritmo se procesa?
- ¿qué pasa si la tasa de entrada sube 30%?
- ¿cuánto backlog se acumula en una hora?

### Modelo 5: costo por operación o por unidad de negocio

Muy útil para vincular sistema y negocio.

Preguntas útiles:

- ¿cuánto recurso consume una orden?
- ¿cuánto storage agrega cada tenant?
- ¿cuánto cuestan 100 mil emails extra?
- ¿cuál es el costo marginal por transacción?

## Forecasting técnico: proyectar sin vender humo

Hacer forecasting no significa prometer precisión absoluta.

Significa trabajar con hipótesis explícitas.

Un forecast sano suele incluir:

- qué datos se usaron
- qué supuestos se asumieron
- qué incertidumbres existen
- qué rango probable se espera
- qué escenarios alternativos conviene contemplar

Por eso suele ser mejor hablar en términos como:

- escenario conservador
- escenario probable
- escenario agresivo

En vez de afirmar algo como:

- “en octubre vamos a tener exactamente 18 420 requests por segundo”

La proyección madura reconoce incertidumbre.
Pero aun así sirve para decidir.

## Escenarios: una herramienta muy valiosa

Una técnica muy útil es construir varios escenarios.

Por ejemplo:

### Escenario conservador

Crecimiento menor al esperado.

### Escenario probable

La hipótesis central más razonable.

### Escenario agresivo

Pico alto, campaña exitosa o incorporación fuerte de clientes.

Esto ayuda mucho porque no obliga a tomar decisiones binarias del estilo:

- o estamos perfectos
- o estamos perdidos

En cambio, permite preguntar:

- ¿qué pasa si crecemos 20%?
- ¿qué pasa si crecemos 60%?
- ¿qué límite se toca primero en cada caso?
- ¿qué inversión alcanza para cubrir dos escenarios pero no tres?

## Vertical, horizontal o rediseño

Cuando el forecast muestra que viene un problema de capacidad, no siempre la solución es la misma.

### Escalar verticalmente

Aumentar recursos de una instancia o nodo.

Sirve cuando:

- el sistema todavía no necesita distribuirse más
- el cuello es claro
- el costo es razonable
- la complejidad extra no se justifica todavía

### Escalar horizontalmente

Agregar más instancias o workers.

Sirve cuando:

- el sistema realmente es stateless o paralelizable
- la distribución de carga funciona bien
- no aparece otro cuello central enseguida

### Optimizar

A veces conviene mejorar:

- queries
- caching
- payloads
- concurrencia
- batching
- retries
- algoritmos

### Rediseñar

Cuando el límite no es meramente de infraestructura sino de arquitectura.

Ejemplos:

- una base única ya concentra demasiado
- el modelo multi-tenant no aísla bien consumo
- el pipeline batch no escala con el negocio
- una operación crítica tiene complejidad estructural alta

El capacity planning ayuda a elegir cuál de estas opciones tiene más sentido y en qué momento.

## El costo de subdimensionar y el costo de sobredimensionar

Ambos existen.

### Subdimensionar

Trae riesgos como:

- incidentes
- degradación bajo carga
- pérdida de ventas
- mala experiencia de usuario
- estrés operativo
- decisiones apresuradas de último momento

### Sobredimensionar

Trae otros costos:

- gasto innecesario
- arquitectura más compleja de lo que hacía falta
- falsa sensación de seguridad
- poca presión para corregir ineficiencias reales

La meta no es “tener de más siempre”.
La meta es **tener suficiente capacidad con margen razonable al costo correcto**.

## Señales de que estás llegando tarde al capacity planning

Hay varios síntomas bastante claros.

### 1. Escalás solo después de incidentes

El crecimiento siempre te encuentra desprevenido.

### 2. Nadie sabe cuál es el verdadero límite del sistema

Se toman decisiones casi a ciegas.

### 3. Los picos importantes generan miedo operativo recurrente

Cada evento relevante parece una apuesta.

### 4. La capacidad depende de conocimiento informal

No hay números explícitos ni hipótesis compartidas.

### 5. Los costos suben, pero no está claro por qué

Falta relación entre demanda, arquitectura y gasto.

### 6. La cola se recupera cada vez más lento

Hay saturación acumulativa.

### 7. Los deploys o fallos parciales ya no tienen margen

El sistema está demasiado al límite.

### 8. Un cliente grande cambia por completo el perfil de carga

Y el modelo actual no lo absorbe bien.

## Relación con observabilidad, confiabilidad y operación

Este tema no vive aislado.

Conecta directamente con **observabilidad operativa avanzada**, porque sin métricas, percentiles, backlog, throughput y señales históricas serias, el capacity planning se vuelve puro presentimiento.

Conecta con **SLO, SLI, error budgets y confiabilidad**, porque la capacidad que necesitás depende del nivel de servicio que querés sostener. No alcanza con que el sistema “más o menos responda”; importa si mantiene la latencia y disponibilidad comprometidas.

Conecta con **runbooks, on-call y operación de incidentes**, porque muchas saturaciones terminan en incidentes, y a la vez muchos incidentes recurrentes son síntomas de mala planificación de capacidad más que de fallas aisladas.

Conecta con **backups, restauración y recuperación ante desastres**, porque también hay que pensar capacidad para recuperar, no solo para operar en estado normal. Restaurar lento o reconstruir demasiado tarde también es un problema de capacidad.

Y conecta con todo lo que vimos sobre arquitectura, colas, caché, base de datos y multitenancy: el crecimiento rara vez golpea a todos los componentes igual.

## Qué deberías llevarte de esta lección

Si tuvieras que quedarte con una idea, que sea ésta:

**capacity planning no es una planilla decorativa ni forecasting es futurología; son herramientas para reducir sorpresa, decidir antes y crecer sin improvisar al borde del colapso.**

Eso implica aprender a pensar en:

- capacidad real y no solo teórica
- margen operativo y no solo promedio de uso
- throughput, latencia y concurrencia como variables relacionadas pero distintas
- picos, backlog y estacionalidad
- cuellos de botella distribuidos
- escenarios y no una sola predicción rígida
- costo técnico y costo económico al mismo tiempo
- escalado, optimización o rediseño según el tipo de límite

Un backend profesional no solo funciona hoy.
También puede explicar con cierta claridad **qué pasará si mañana crece**.

## Cierre

Cuando no existe pensamiento de capacidad, el crecimiento se vuelve una secuencia de sobresaltos.

Cada pico parece inesperado.
Cada cliente grande asusta.
Cada evento comercial exige cruzar los dedos.
Cada incidente deja la sensación de que el sistema “venía bien” hasta que de repente no.

Pero cuando capacity planning y forecasting empiezan a formar parte de la operación, cambia la conversación.

El equipo deja de preguntar solamente:

- ¿qué hacemos si explota?

Y empieza a preguntar también:

- ¿qué límite se acerca?
- ¿cuándo deberíamos actuar?
- ¿qué escenario queremos cubrir?
- ¿qué inversión técnica realmente vale la pena?
- ¿qué parte del sistema merece rediseño antes de que el costo operativo se vuelva demasiado alto?

Eso no elimina la incertidumbre.
Pero la vuelve más manejable.
Y sobre todo, transforma el crecimiento en algo más gobernable y menos reactivo.

Y en ese punto aparece el siguiente paso natural.

Porque después de pensar capacidad y crecimiento, conviene someter al sistema a algo todavía más incómodo pero muy valioso:

**¿qué pasa si deliberadamente introducimos fallas, forzamos degradaciones controladas y verificamos si nuestra resiliencia es real o solo supuesta?**

Ahí entramos en el próximo tema: **chaos engineering básico y validación de resiliencia**.
