---
title: "Dashboards, agregaciones y costo de consulta"
description: "Qué cambia cuando una métrica deja de ser una definición semántica y pasa a convertirse en consultas, paneles y agregaciones que alguien ejecuta todos los días, por qué un dashboard útil no es solo una colección de gráficos, cómo pensar granularidad, preagregación, cardinalidad, refresh, filtros, drill-down, costos de cómputo, latencia y concurrencia, y qué decisiones permiten construir una capa analítica usable sin volver inmanejable ni carísima la consulta de datos en producción o en el warehouse."
order: 222
module: "Datos, reporting y procesamiento"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos diseño de métricas de negocio y analítica de producto.

Vimos que:

- una métrica no es solo una query
- que primero hay que definir entidad, denominador, ventana temporal y reglas válidas
- que la semántica del indicador importa tanto como su implementación técnica
- y que una organización sana necesita discutir menos el significado del número y más qué hacer con él

Pero una vez que eso está razonablemente definido, aparece el siguiente problema.

Porque las métricas no viven solamente en documentos semánticos.
En algún momento alguien las quiere:

- ver en un dashboard
- filtrar por dimensiones
- comparar en el tiempo
- desglosar por cohortes o segmentos
- cruzar con otras métricas
- refrescar varias veces por día
- compartir con negocio
- y consultar sin esperar minutos eternos ni disparar costos absurdos

Ahí empieza este tema.

Porque una cosa es definir bien una métrica.
Y otra muy distinta es hacer que esa métrica sea **consultable, visible y sostenible** a escala.

Ése es el foco de este capítulo:

**dashboards, agregaciones y costo de consulta.**

La idea de fondo es ésta:

**una capa analítica útil no solo necesita números correctos; también necesita consultas razonables, tiempos de respuesta aceptables, agregaciones bien pensadas y paneles que no destruyan ni la experiencia de uso ni el presupuesto de infraestructura.**

## Qué problema resuelve realmente este tema

Hay una trampa muy común en sistemas analíticos.

Al principio, el equipo logra definir algunas métricas importantes.
Eso ya es un avance enorme.

Entonces llega el siguiente paso natural:

- alguien arma un dashboard en BI
- otro crea una vista derivada
- producto suma filtros
- dirección pide comparaciones históricas
- finanzas quiere breakdown por plan
- customer success quiere ver por tenant
- operaciones pide segmentar por región, canal y cohorte

Y de a poco empieza a aparecer una capa visual cada vez más grande.

En ese punto suele pasar algo así:

- las consultas empiezan a tardar mucho
- cada filtro agrega joins costosos
- algunos gráficos se vuelven imposibles de recalcular en tiempo real
- aparecen tablas agregadas duplicadas sin criterio uniforme
- distintos dashboards usan distintas granularidades
- la gente pierde confianza porque un panel refresca distinto que otro
- y el costo de ejecutar consultas crece más rápido que el valor que aportan

Entonces se descubre algo importante:

**el problema ya no era solo semántico; ahora también es físico, operativo y económico.**

Diseñar dashboards y agregaciones no es un tema cosmético.
Es una parte central de cómo se materializa la analítica en la práctica.

## Un dashboard no es una colección de gráficos

Éste es uno de los errores más frecuentes.

Mucha gente piensa un dashboard como:

- tarjetas con números arriba
- líneas y barras abajo
- filtros en un costado
- y algún gráfico extra “por si sirve”

Pero un dashboard serio debería verse más como una herramienta de lectura y decisión.

Eso implica que cada panel debería responder al menos estas preguntas:

- para quién está hecho
- qué decisiones habilita
- qué entidad observa
- qué granularidad usa
- con qué frecuencia se refresca
- qué métricas son oficiales
- qué parte del sistema puede tensionar cuando se consulta mucho

Sin eso, el dashboard se vuelve un collage de cosas sueltas.

Y los collages suelen producir tres problemas:

### 1. Sobrecarga cognitiva

Hay demasiadas visualizaciones para la pregunta real que alguien intenta contestar.

### 2. Inconsistencia semántica

Dos gráficos parecen comparables, pero no comparten ni definición ni ventana temporal.

### 3. Costo innecesario

Se consultan datos complejos que nadie usa para decidir nada.

Por eso un dashboard serio debería diseñarse como una interfaz de consulta orientada a casos de uso, no como una galería de gráficos bonitos.

## La pregunta correcta no es “qué gráfico mostramos”, sino “qué lectura queremos permitir”

Antes de discutir si usar barras, líneas o tablas, conviene definir qué operación mental debería poder hacer quien usa el dashboard.

Por ejemplo:

- detectar una caída abrupta
- comparar evolución entre períodos
- encontrar segmentos anómalos
- identificar top contributors
- entender distribución por plan o canal
- bajar de una métrica global a un subconjunto
- distinguir señal real de ruido temporal

Esas operaciones son las que deberían guiar la forma del dashboard.

Ejemplos:

Si el objetivo es monitoreo operativo:

- importa más frescura y alerta que riqueza exploratoria
- tal vez conviene menos detalle y más señales rápidas

Si el objetivo es análisis de producto:

- importa más segmentación, cohortes y drill-down
- puede tolerarse algo más de latencia si gana profundidad

Si el objetivo es reporte ejecutivo:

- importa más estabilidad semántica y lectura simple
- no hace falta exponer toda la complejidad subyacente

Un mismo dataset puede servir para distintas lecturas, pero no necesariamente en el mismo dashboard ni con el mismo costo de consulta.

## Agregación: el puente entre dato granular y dato legible

La palabra “agregación” parece simple, pero es una de las decisiones más importantes de toda la capa analítica.

Agregar significa resumir datos granulares para poder responder preguntas de nivel superior.

Ejemplos:

- eventos por minuto convertidos en DAU por día
- órdenes individuales resumidas en ventas por canal
- uso de features agregado por tenant y semana
- tickets de soporte resumidos en tiempos medios y percentiles

El problema es que una agregación siempre descarta detalle.
Y eso obliga a decidir muy bien:

- qué granularidad conservar
- qué dimensiones mantener disponibles
- qué filtros seguirán siendo posibles
- qué preguntas ya no podrán responderse desde esa tabla

No existe agregación perfecta.
Existe una agregación adecuada para ciertas preguntas y mala para otras.

## Granularidad: una decisión mucho más importante de lo que parece

Cuando una capa analítica se degrada, muchas veces el problema no es solo “falta de performance”.
El problema es que se eligió mal la granularidad base de consulta.

Preguntas clave:

- conviene guardar por evento, por sesión, por orden, por día, por tenant o por cohorte
- hace falta una tabla diaria, otra semanal y otra mensual
- el dashboard necesita drill-down hasta registro individual o solo tendencias agregadas
- qué tan cara es la consulta si siempre parte del dato más granular

Ejemplos:

Un dashboard de revenue diario por tenant probablemente no debería recalcular todo desde la tabla más cruda de eventos cada vez que alguien abre el panel.

Un panel exploratorio de producto quizá sí necesite acceso a más granularidad, pero con límites de ventana y filtros más estrictos.

Una buena regla mental es ésta:

**la granularidad debería elegirse según la pregunta más frecuente y no según la fantasía de soportar cualquier pregunta desde cualquier dashboard en tiempo real.**

## El costo oculto de querer máxima flexibilidad

Muchos equipos quieren una capa analítica que permita:

- cualquier filtro
- cualquier dimensión
- cualquier ventana temporal
- cualquier comparación histórica
- cualquier drill-down
- y todo eso con refresco inmediato

El problema es que ese ideal suele ser carísimo.

Porque cada grado extra de flexibilidad puede impactar en:

- más joins
- más cardinalidad
- más scans
- más memoria
- más cómputo
- más complejidad para cachear
- más dificultad para preagregar
- y más riesgo de inconsistencia entre paneles

En otras palabras:

**la expresividad analítica también tiene costo.**

No siempre conviene pagarla completa.

## Cardinilidad y explosión combinatoria

Éste es un tema muy importante y muy subestimado.

No todas las dimensiones cuestan lo mismo.

Algunas tienen cardinalidad baja:

- país
- plan
- canal
- estado
- tipo de dispositivo

Otras pueden tener cardinalidad altísima:

- user_id
- tenant_id
- session_id
- product_id en catálogos enormes
- search query libre
- combinación de tags dinámicos

Cuando una tabla agregada intenta conservar demasiadas dimensiones de alta cardinalidad, aparece una explosión combinatoria.

Por ejemplo:

- por día
- por tenant
- por plan
- por feature
- por país
- por seller
- por canal

Cada eje adicional multiplica el espacio posible de agregación.

Eso impacta en:

- volumen almacenado
- tiempo de construcción
- costo de actualización
- tamaño de índices
- latencia de lectura
- costo total del warehouse

Por eso no alcanza con pensar “qué filtros quiere negocio”.
También hay que pensar:

**qué combinaciones realmente justifican existir materializadas y cuáles pueden resolverse bajo demanda con restricciones claras.**

## Preagregación: cuándo ayuda y cuándo complica

La preagregación suele ser una herramienta excelente.

Consiste en calcular de antemano resultados resumidos para no repetir consultas pesadas cada vez.

Ejemplos:

- ventas diarias por región
- MAU por plan
- tickets cerrados por semana
- eventos de adopción por tenant y mes

Esto puede mejorar muchísimo:

- latencia
- costo de consulta repetida
- estabilidad de dashboards
- concurrencia

Pero también introduce problemas nuevos.

### Riesgo 1: proliferación de tablas derivadas

Aparecen muchas variantes parecidas:

- daily_sales_v1
- daily_sales_v2
- daily_sales_region
- daily_sales_region_channel
- daily_sales_net
- daily_sales_final

y pronto nadie sabe cuál es la oficial.

### Riesgo 2: refresh inconsistente

Un dashboard actualiza cada hora, otro cada seis horas y otro al cierre del día.
Entonces el usuario compara cosas que parecen iguales pero no están sincronizadas.

### Riesgo 3: pérdida de flexibilidad

La tabla preagregada responde muy bien algunas preguntas, pero impide otras que antes sí podían hacerse desde el dato base.

### Riesgo 4: costo de mantenimiento

Cada tabla agregada necesita:

- lógica de construcción
- validación
- observabilidad
- backfills
- estrategia de corrección
- documentación

Por eso una preagregación no debería nacer porque una query fue lenta una vez.
Debería nacer porque existe un patrón de lectura repetido, valioso y suficientemente estable.

## Materializar no siempre significa resolver el problema correcto

A veces un equipo detecta que un dashboard es lento y decide materializar una tabla agregada.

Eso puede ser correcto.
Pero también puede ser una mala respuesta si el problema real era otro.

Por ejemplo:

- la query era lenta por filtros mal diseñados
- había joins innecesarios
- el panel traía más datos de los que mostraba
- el gráfico refrescaba demasiado seguido
- se estaban mezclando preguntas operativas y exploratorias en un mismo panel
- el dashboard consultaba períodos enormes por defecto

Materializar sin entender el patrón de uso puede generar más costo estructural del que evita.

La pregunta no debería ser solo:

**¿cómo hago esta consulta más rápida?**

Sino también:

**¿esta consulta debería existir así, con esta frecuencia, para este caso de uso?**

## Dashboards operativos, analíticos y ejecutivos no deberían diseñarse igual

Ésta es una distinción que ahorra muchísimos problemas.

### Dashboard operativo

Busca observar salud reciente del sistema o del negocio.

Ejemplos:

- órdenes por minuto
- tasa de fallos de pago
- errores de un pipeline
- retraso en fulfillment

Características típicas:

- alta frescura
- poca ambigüedad
- pocas dimensiones críticas
- énfasis en detectar desvíos

### Dashboard analítico

Busca explorar comportamiento, entender causas y generar hipótesis.

Ejemplos:

- adopción por cohortes
- comportamiento por plan
- conversión segmentada por canal
- retención por grupo de usuarios

Características típicas:

- más profundidad y segmentación
- puede tolerar algo más de latencia
- suele requerir drill-down y comparaciones históricas

### Dashboard ejecutivo

Busca resumir estado general para decisiones de alto nivel.

Ejemplos:

- revenue
- crecimiento
- churn
- margen
- uso de grandes clientes

Características típicas:

- lectura simple
- alta estabilidad semántica
- pocas métricas clave
- mínimo ruido visual

Cuando estos tres usos se mezclan en un solo panel, suele salir mal.
Porque cada uno empuja hacia una arquitectura distinta de consulta.

## El costo de consulta no es solo tiempo de respuesta

Éste es un punto muy importante.

Cuando hablamos de costo de consulta, mucha gente piensa solo en latencia.
Pero el costo real puede tener varias dimensiones.

### Costo computacional

Cuánta CPU, memoria, I/O o scan necesita la consulta.

### Costo económico

Cuánto dinero consume ejecutar esas consultas repetidamente en el warehouse o motor analítico.

### Costo de concurrencia

Qué pasa cuando muchos usuarios abren el mismo dashboard o aplican filtros al mismo tiempo.

### Costo de mantenimiento

Cuántas tablas, jobs, caches o refreshes hacen falta para sostener la experiencia.

### Costo cognitivo

Qué tan difícil es explicar por qué un número tarda, cambia o no coincide con otro panel.

Pensar solo en latencia puede esconder problemas de arquitectura mucho más profundos.

## Frescura vs costo vs exactitud

Casi nunca podés maximizar simultáneamente estas tres cosas:

- frescura extrema
- exactitud final absoluta
- costo bajo

Normalmente hay trade-offs.

Ejemplos:

### Caso 1: panel de pagos operativos

- necesita frescura alta
- puede aceptar cierta corrección posterior
- sirve para monitoreo

### Caso 2: revenue conciliado para finanzas

- necesita exactitud y estabilidad
- puede aceptar refresco diario o por cierre
- no conviene recalcularlo en cada interacción

### Caso 3: exploración de producto
n
- necesita flexibilidad y segmentación
- puede aceptar límites de ventana o menor frecuencia de actualización

La clave es explicitar estos trade-offs.
No esconderlos.

## Ventanas por defecto: una decisión de UX con impacto técnico enorme

Parece un detalle menor, pero no lo es.

Muchísimos dashboards se vuelven caros porque vienen configurados con ventanas demasiado amplias por defecto.

Ejemplos problemáticos:

- abrir siempre con 24 meses completos
- cargar todas las regiones y todos los planes a la vez
- mostrar series por día cuando el rango cubre varios años
- habilitar búsquedas abiertas sobre datasets gigantes sin límites iniciales

A veces una mejora enorme no requiere rehacer pipelines.
Requiere cambiar decisiones de producto del dashboard, como:

- default a últimos 7 o 30 días
- granularidad automática según rango
- paginación o top-N inicial
- filtros obligatorios antes de consultar
- drill-down solo a demanda

La UX del panel también diseña el costo del sistema.

## Granularidad visual y granularidad de almacenamiento no son lo mismo

Otro error común es confundir cómo se guarda un dato con cómo se muestra.

Ejemplo:

Podés almacenar eventos a nivel muy granular,
pero mostrar una curva semanal en el dashboard.

O podés tener una tabla preagregada diaria,
pero permitir vistas mensuales que reagrupan esa base.

Lo importante es no forzar al sistema a recalcular desde la materia prima más cruda cada vez que alguien cambia una visualización simple.

Una buena arquitectura suele separar:

- capa de eventos o hechos base
- capa de modelos derivados
- capa de agregaciones consumibles
- capa de presentación

Cuando todo eso se mezcla, cada cambio visual puede volverse una discusión de infraestructura.

## Drill-down: útil, pero peligroso si no se diseña bien

Muchos usuarios quieren “poder bajar” desde una métrica agregada hasta casos individuales.
Eso tiene mucho valor.

Por ejemplo:

- de tasa de fallos de pago a transacciones fallidas
- de churn por cohorte a tenants concretos
- de tickets abiertos a conversaciones específicas

El problema es que el drill-down mal diseñado puede romper completamente la economía de la consulta.

Riesgos típicos:

- pasar de agregados livianos a scans masivos de detalle
- permitir queries sin filtros suficientes
- mezclar exploración libre con información sensible
- disparar joins costosos sobre tablas enormes

Por eso conviene diseñarlo con límites claros:

- ventanas máximas
- filtros mínimos requeridos
- paginación
- sampleo cuando corresponde
- acceso por rol
- separación entre dashboard y vista operacional detallada

Drill-down no significa acceso irrestricto a todo desde cualquier punto.

## Filtros: potencia analítica vs costo y confusión

Los filtros son útiles, pero cada filtro extra también complica.

Preguntas que conviene hacer:

- este filtro aporta una lectura que alguien usa de verdad
- el filtro es estable o cambia demasiado la semántica de la métrica
- el sistema puede soportarlo sin multiplicar costo y complejidad
- conviene preagregar para esta dimensión o resolverla bajo demanda

Hay filtros que son casi estructurales:

- fecha
- plan
- canal
- región

Y hay otros que pueden ser carísimos o generar lecturas confusas:

- tags libres
- combinaciones arbitrarias de features
- dimensiones derivadas poco estables
- campos con cardinalidad muy alta

Un dashboard más poderoso no es necesariamente el que tiene más filtros.
A veces es el que tiene menos, pero mejor elegidos.

## Cachear dashboards: ayuda mucho, pero no arregla semántica mala

El cache puede ser un gran aliado para bajar costo y latencia.

Especialmente cuando:

- hay muchas lecturas repetidas
- los dashboards cambian poco entre refreshes
- la información no necesita precisión al segundo

Pero cachear no resuelve problemas como:

- métricas mal definidas
- granularidad incorrecta
- joins absurdamente costosos
- filtros que no deberían existir
- tablas derivadas mal sincronizadas

Cachear una mala consulta puede aliviar síntomas, pero no siempre corrige la enfermedad.

## Concurrencia: no importa solo una consulta aislada

A veces una query individual parece razonable.
El problema aparece cuando:

- 30 personas abren el dashboard a la misma hora
- un board ejecutivo refresca automáticamente cada pocos minutos
- un panel embedded se usa en muchos tenants
- o un dashboard popular se consulta durante un incidente

Entonces el costo total no es la consulta individual, sino el patrón de concurrencia.

Eso obliga a pensar en:

- caché compartida
- refresh programado
- snapshots precomputados
- límites de frecuencia
- colas o aislamiento por workloads

Diseñar para un usuario puede ser fácil.
Diseñar para muchos usuarios concurrentes consultando el mismo insight es otro problema.

## Métricas baratas de leer suelen ser caras de preparar

Éste es un trade-off muy importante.

Cuando un dashboard abre rápido y responde bien, muchas veces eso significa que hubo trabajo previo:

- modelado
- preagregación
- indexación
- particionado
- refresh incremental
- validación
- cacheado

Es decir:

**se desplazó costo desde el momento de lectura hacia el momento de preparación.**

Eso puede ser excelente si el patrón de uso lo justifica.
Pero conviene hacerlo conscientemente.

Porque si precomputás mucho para paneles poco usados, terminás pagando preparación de datos que casi nadie consulta.

## No todo dashboard merece tiempo real

Éste es otro principio muy sano.

La etiqueta “real time” seduce, pero no siempre agrega valor real.

Preguntas útiles:

- alguien tomaría una decisión distinta si el dato estuviera 2 minutos más fresco
- o 15 minutos más fresco
- o 1 hora más fresco

Si la respuesta es no, tal vez tiempo real solo agrega costo y fragilidad.

Ejemplos:

- monitoreo de checkout en pico comercial sí puede requerir casi tiempo real
- revenue conciliado diario probablemente no
- adopción por cohortes semanales claramente no

No usar tiempo real cuando no hace falta es una forma madura de diseñar sistemas.

## Cómo pensar una estrategia sana de agregaciones

Una estrategia razonable suele combinar varios niveles.

### Nivel 1: datos base o eventos

Sirven para reconstrucción, auditoría y preguntas profundas.
No deberían ser la fuente principal de cada dashboard repetitivo.

### Nivel 2: modelos derivados limpios

Normalizan semántica, corrigen nombres, unifican estados y preparan entidades de análisis.

### Nivel 3: agregaciones reutilizables

Resuelven patrones frecuentes:

- por día
- por tenant
- por plan
- por canal
- por cohorte

### Nivel 4: vistas de presentación

Ajustan formato, naming y orden para dashboards concretos.

Esta separación reduce mucho el caos.

## Señales de que tu capa de dashboards está entrando en zona peligrosa

Hay varios síntomas bastante claros.

### Señal 1: nadie sabe cuál panel es el oficial

Aparecen múltiples dashboards con nombres parecidos y resultados levemente distintos.

### Señal 2: cada nueva pregunta exige una nueva tabla agregada

Eso puede indicar que la base semántica está mal armada o que no hay estrategia clara de reuso.

### Señal 3: los costos suben más rápido que el uso real

Mucho cómputo para poco valor consumido.

### Señal 4: el equipo de datos vive apagando incendios de performance

Cada nuevo filtro o gráfico genera una crisis.

### Señal 5: el usuario no entiende la frescura del dato

No sabe si está viendo algo preliminar, reconciliado o atrasado.

### Señal 6: los dashboards mezclan exploración, monitoreo y reporte ejecutivo

Se intenta resolver todo con una sola interfaz y una sola estrategia de consulta.

## Buenas prácticas concretas

### 1. Definir dashboards oficiales por caso de uso

No todo panel merece el mismo nivel de gobernanza.

### 2. Documentar frescura y cobertura

Cada dashboard debería dejar claro:

- hasta qué momento llegan los datos
- si son preliminares o finales
- con qué frecuencia refrescan

### 3. Limitar filtros y rangos por defecto

Especialmente en paneles de alto uso.

### 4. Crear agregaciones reutilizables, no dashboards disfrazados de tablas

La agregación debería servir para más de una visualización cuando tenga sentido.

### 5. Medir uso real de dashboards

No conviene optimizar eternamente un panel que nadie consulta.

### 6. Separar lectura rápida de exploración profunda

Un panel ejecutivo no tiene por qué cargar todo el detalle exploratorio.

### 7. Revisar periódicamente costo por insight

No solo costo total, sino qué valor real entrega cada capa.

## Ejemplo mental: SaaS B2B con uso por tenant

Imaginá un SaaS con:

- tenants enterprise y self-serve
- múltiples módulos de producto
- usuarios por rol
- eventos de uso muy granulares
- métricas de adopción, uso y retención

Negocio quiere:

- un dashboard ejecutivo diario
- un panel de customer success por tenant
- una vista de producto por feature y cohorte

Si intentaras resolver todo desde la tabla cruda de eventos, probablemente pagarías demasiado en:

- costo de consulta
- complejidad de joins
- latencia
- concurrencia

Una arquitectura mejor podría ser:

- eventos base auditables
- modelo derivado de actividad limpia
- agregación diaria por tenant y feature
- agregación semanal por cohorte
- dashboard ejecutivo con snapshot diario
- panel exploratorio con límites de rango y drill-down controlado

La misma información general, pero materializada de acuerdo con patrones reales de lectura.

## Ejemplo mental: e-commerce en pico comercial

Ahora imaginá un e-commerce grande durante una campaña fuerte.

Hay interés en:

- órdenes por minuto
- fallos de pago
- conversión de checkout
- revenue por canal
- stock en riesgo
- cumplimiento logístico

No todas esas vistas deberían apoyarse igual.

Por ejemplo:

- fallos de pago y órdenes por minuto pueden requerir casi tiempo real
- revenue neto conciliado puede ir por otra vía más estable
- stock crítico puede depender de una vista operacional específica
- métricas históricas de marketing pueden vivir en otro dashboard más analítico

Mezclar todo en un solo panel con refresh agresivo sería carísimo y probablemente confuso.

## Una pregunta muy útil: cuánto cuesta sostener esta lectura en el tiempo

Antes de sumar un dashboard, una dimensión o una agregación, conviene preguntar:

- quién lo va a usar realmente
- con qué frecuencia
- qué decisión habilita
- qué tan fresca tiene que ser la información
- qué costo técnico y económico implica sostenerlo
- qué otra capa se complica por agregarlo

A veces la respuesta justifica totalmente el esfuerzo.
A veces no.

La madurez está en distinguir ambas situaciones.

## Mini ejercicio mental

Imaginá que trabajás en una plataforma con:

- millones de eventos por día
- múltiples equipos consumiendo dashboards
- un warehouse con costo por scan
- dashboards operativos y ejecutivos mezclados
- quejas por lentitud y números inconsistentes

Preguntas para pensar:

- qué dashboards separarías por caso de uso
- qué métricas materializarías y cuáles dejarías bajo demanda
- qué filtros limitarías
- qué rangos pondrías por defecto
- dónde usarías cache
- dónde aceptarías más latencia a cambio de costo más bajo
- qué paneles descontinuarías si nadie los usa

Ahora imaginá que un director pide “un dashboard único con todo”.

Preguntas:

- qué riesgos semánticos, operativos y económicos ves
- cómo explicarías que un único panel no siempre es la mejor solución
- qué estructura modular propondrías en su lugar

## Resumen

Dashboards, agregaciones y costo de consulta no tratan solo de visualización.
Tratan de cómo llevar métricas definidas correctamente a una capa consumible sin volver inviable ni la operación analítica ni el presupuesto del sistema.

La idea central de este tema es ésta:

**una analítica útil necesita equilibrio entre legibilidad, flexibilidad, frescura, exactitud y costo.**

Eso implica prestar atención a:

- diseño por caso de uso
- granularidad
- preagregación
- cardinalidad
- filtros
- drill-down
- concurrencia
- costo computacional y económico
- relación entre UX del dashboard y arquitectura de consulta

Cuando esto está bien resuelto, los dashboards dejan de ser una fuente constante de confusión, lentitud y discusiones de números, y pasan a ser herramientas reales para operar, analizar y decidir.

Y eso nos deja listos para el siguiente tema, donde vamos a mirar qué pasa cuando los datos no deberían vivir para siempre con la misma forma, el mismo costo y la misma accesibilidad:

**retención, archivado y ciclo de vida del dato.**
