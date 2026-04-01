---
title: "Data lake, warehouse y cuándo entran en juego"
description: "Qué problema intentan resolver un data lake y un data warehouse cuando el backend transaccional ya no alcanza para absorber todas las necesidades analíticas, por qué no son sinónimos ni modas intercambiables, cómo pensar diferencias de propósito, estructura, calidad y costo, qué rol cumplen los datos crudos, los datos curados, las capas intermedias y el modelado analítico, y en qué señales concretas conviene empezar a considerar estas piezas sin convertir la arquitectura en una sobreingeniería prematura."
order: 224
module: "Datos, reporting y procesamiento"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos retención, archivado y ciclo de vida del dato.

Vimos que:

- no todos los datos envejecen igual
- que guardar todo del mismo modo suele ser caro, riesgoso e innecesario
- que hot, warm y cold data ayudan a pensar accesibilidad y costo
- que archivar no es lo mismo que olvidar
- y que una plataforma madura necesita políticas explícitas sobre cuánto tiempo conservar, transformar, anonimizar o eliminar información

Ahora aparece otra pregunta importante.

Porque una vez que el sistema ya tiene:

- datos transaccionales vivos
- eventos históricos
- pipelines que derivan información
- reporting cada vez más exigente
- y necesidades analíticas que crecen

surge una tensión inevitable.

**¿Dónde deberían vivir todos esos datos y con qué estructura?**

Porque llega un punto en el que pedirle todo al backend transaccional empieza a salir mal.

Y ahí aparecen nombres que se escuchan muchísimo:

- data lake
- data warehouse
- lakehouse
- zonas raw, curated y serving
- capas analíticas
- storage de objetos
- motores de consulta separados

El problema es que muchas veces estos conceptos entran a la conversación como si fueran:

- herramientas mágicas
- sinónimos entre sí
- o requisitos inevitables de cualquier sistema moderno

Y no.

Ése es el foco de este tema:

**data lake, warehouse y cuándo entran en juego.**

La idea central es ésta:

**estas piezas no existen para “modernizar” la arquitectura, sino para separar mejor el mundo transaccional del mundo analítico cuando el volumen, la variedad y el tipo de preguntas ya no encajan bien en una sola capa.**

## Qué problema resuelve realmente este tema

Durante bastante tiempo, un sistema puede vivir razonablemente bien con:

- una base OLTP
- algunas consultas agregadas
- dashboards simples
- exports periódicos
- y una o dos tablas derivadas

En esa etapa, no siempre hace falta introducir infraestructura analítica más sofisticada.

Pero a medida que el sistema crece, empiezan a aparecer tensiones concretas.

Por ejemplo:

- el equipo de producto quiere analizar comportamiento histórico detallado
- finanzas necesita conciliaciones y reportes de alta confianza
- marketing quiere segmentaciones complejas
- operaciones necesita series históricas y comparativas largas
- soporte quiere reconstruir flujos pasados
- data quiere entrenar modelos o recalcular métricas con lógica nueva
- y todo eso convive con una aplicación que además tiene que seguir cobrando, despachando, autenticando y respondiendo rápido

Ahí aparece el problema real.

**la misma infraestructura rara vez sirve igual de bien para operar transacciones y para explorar, re-procesar, agregar, historizar y analizar datos a otra escala.**

Entonces este tema ayuda a entender:

- cuándo separar responsabilidades
- dónde conviene guardar datos crudos
- dónde conviene guardar datos curados
- qué estructura favorece el análisis confiable
- y qué señales muestran que el backend transaccional ya no debería cargar con todo

## El error clásico: creer que data lake y warehouse son lo mismo

Éste es un error muy común.

Muchas veces se escucha algo como:

- “armemos un data lake”
- “pasemos todo a un warehouse”
- “necesitamos analytics serio”

como si todo eso significara básicamente lo mismo.

Pero no lo significa.

Aunque en la práctica pueden convivir y complementarse, la idea de fondo no es igual.

### Data lake

Un data lake suele pensarse como un lugar donde almacenar grandes volúmenes de datos en forma relativamente cruda o con transformación mínima.

Suele servir para:

- conservar datos originales
- centralizar fuentes heterogéneas
- soportar re-procesamientos futuros
- guardar eventos, logs, exports, snapshots o archivos semi-estructurados
- permitir que distintas transformaciones partan del mismo material base

No está orientado necesariamente a consumo directo por negocio final.

Su fortaleza principal suele ser:

**guardar mucho, variado y relativamente barato, preservando flexibilidad futura.**

### Data warehouse

Un data warehouse suele pensarse como una capa más curada, modelada y gobernada para análisis, reporting y consulta confiable.

Suele servir para:

- métricas de negocio consistentes
- datasets modelados para análisis
- consultas analíticas optimizadas
- reporting compartido por múltiples áreas
- definiciones relativamente estables y auditables

Su fortaleza principal suele ser:

**convertir datos dispersos o crudos en información analítica usable, consistente y gobernable.**

Entonces, simplificando mucho:

- el lake tiende a priorizar flexibilidad y captura amplia
- el warehouse tiende a priorizar estructura, consistencia y consumo analítico

No son enemigos.
Son piezas que pueden cumplir funciones distintas.

## Otra confusión frecuente: creer que el lake resuelve automáticamente la analítica

Guardar datos en bruto no equivale a tener analítica buena.

Éste es un malentendido muy común.

Un data lake puede darte:

- capacidad de almacenar mucho
- flexibilidad para distintos formatos
- material para re-procesar
- trazabilidad de origen

Pero no te garantiza por sí solo:

- métricas bien definidas
- datos limpios
- semántica compartida
- joins razonables
- reportes entendibles
- consistencia de negocio

De hecho, muchos lakes mal diseñados se convierten en algo bastante triste:

**un pantano de archivos donde todo “está”, pero casi nada es fácil de usar con confianza.**

Por eso aparece la idea de pasar de raw a curated.

Y por eso un warehouse —o una capa equivalente de datos modelados— sigue siendo tan importante.

## Otra confusión frecuente: creer que el warehouse elimina la necesidad de conservar datos crudos

Tampoco funciona al revés.

Si solo conservás datos finales ya agregados o modelados, perdés flexibilidad.

Después aparecen problemas como:

- no poder recalcular una métrica con una definición nueva
- no poder investigar un bug histórico de pipeline
- no poder reconstruir un dataset derivado
- no poder volver atrás para auditar transformaciones
- no poder responder preguntas nuevas que nadie había previsto al diseñar el modelo

Por eso el mundo analítico maduro suele separar capas.

No para complicar la arquitectura gratuitamente.
Sino para no mezclar necesidades distintas:

- conservación de materia prima
- transformación y enriquecimiento
- exposición confiable para consumo analítico

## Una forma útil de pensarlo: raw, curated y serving

Aunque los nombres cambian según herramienta o equipo, una forma muy útil de entender este espacio es pensar en capas.

### Capa raw

Acá vive la materia prima.

Por ejemplo:

- eventos tal como llegaron
- logs exportados
- snapshots de tablas operativas
- archivos de terceros
- datos semi-estructurados o JSON
- dumps históricos

Objetivos:

- preservar origen
- permitir re-procesamiento
- evitar pérdida temprana de información
- desacoplar ingestión de modelado final

### Capa curated

Acá los datos empiezan a limpiarse, validarse, enriquecerse y alinearse con reglas comunes.

Por ejemplo:

- normalización de campos
- deduplicación
- aplicación de catálogos y dimensiones
- estandarización temporal
- corrección de tipos
- unificación de entidades

Objetivos:

- mejorar calidad
- reducir ambigüedad
- hacer consistentes las transformaciones
- dejar una base mejor preparada para análisis

### Capa serving o analítica de consumo

Acá viven datasets listos para que negocio, analítica, BI o aplicaciones lean con confianza.

Por ejemplo:

- hechos y dimensiones
- tablas agregadas
- métricas definidas
- modelos listos para dashboards
- datasets preparados para segmentación o reporting recurrente

Objetivos:

- consulta simple
- semántica compartida
- performance razonable
- baja fricción para consumidores

No hace falta memorizar la terminología exacta.
Lo importante es entender el principio.

**no todo dato debería estar al mismo tiempo en el mismo nivel de crudeza, calidad y usabilidad.**

## Entonces, ¿cuándo entra en juego un data lake?

No cuando querés “sonar moderno”.

Entra en juego cuando aparecen necesidades como:

- conservar grandes volúmenes de datos crudos o semi-crudos
- centralizar múltiples fuentes heterogéneas
- soportar re-procesamientos futuros
- guardar históricos extensos a costo relativamente bajo
- desacoplar ingestión de modelado analítico final
- retener material para machine learning, investigación o auditoría

Se vuelve especialmente razonable cuando empezás a tener:

- eventos de producto masivos
- logs abundantes
- datos de terceros en formatos variables
- snapshots frecuentes
- feeds externos grandes
- o necesidades de reconstrucción histórica más allá del reporting básico

Dicho simple:

**el lake suele aparecer cuando necesitás memoria analítica amplia y flexible, no solo tablas listas para dashboard.**

## Entonces, ¿cuándo entra en juego un warehouse?

Entra cuando el problema dominante deja de ser “guardar todo” y pasa a ser:

- definir métricas confiables
- dar acceso consistente a negocio
- evitar que cada área calcule lo mismo distinto
- mejorar performance de consultas analíticas
- separar reporting serio del OLTP
- gobernar mejor semántica, calidad y ownership

Un warehouse empieza a tener mucho sentido cuando ya no alcanza con:

- consultas SQL ad hoc sobre producción
- exports manuales
- tablas armadas artesanalmente por cada equipo
- dashboards que dependen de lógica duplicada y poco auditada

Dicho de forma simple:

**el warehouse aparece cuando necesitás una capa analítica gobernada y consumible, no solo almacenamiento grande.**

## Señales concretas de que el OLTP ya no debería cargar con todo

Ésta es probablemente la parte más importante del tema.

Porque el objetivo no es adoptar componentes de moda.
El objetivo es detectar cuándo la arquitectura actual está mal repartiendo responsabilidades.

Señales frecuentes:

- dashboards que pegan directo a tablas transaccionales pesadas
- consultas analíticas que compiten con tráfico operativo
- necesidad creciente de históricos largos y comparativas complejas
- recalcular métricas implica jobs frágiles y lentos sobre producción
- distintas áreas obtienen números distintos para la misma pregunta
- múltiples fuentes externas no encajan bien en el modelo OLTP
- hay eventos o logs valiosos que no querés perder pero tampoco querés meter en tablas operativas
- soporte, fraude o auditoría requieren reconstrucciones difíciles
- el costo de consultar producción para análisis se vuelve alto en performance o riesgo

Cuando eso pasa, muchas veces el problema no es “optimizar más una query”.
Es que estás pidiendo a la capa equivocada que resuelva el problema equivocado.

## Cuándo NO hace falta todavía

También es importante decirlo.

No siempre necesitás un lake o un warehouse.

Si tu sistema todavía tiene:

- bajo volumen
- pocos consumidores analíticos
- métricas simples
- una sola fuente principal
- históricos cortos
- y escasa necesidad de re-procesamiento

podés vivir muy bien con:

- una base transaccional bien cuidada
- algunas tablas derivadas
- exports programados
- vistas materializadas
- o una pequeña capa analítica separada pero modesta

Meter demasiado pronto:

- storage distribuido
- motores analíticos complejos
- pipelines sofisticados
- demasiadas capas

puede darte más costo y más complejidad que valor.

Acá vuelve una idea importante de este roadmap:

**la arquitectura correcta no es la más grande; es la que resuelve los problemas reales de la etapa actual sin bloquear innecesariamente la siguiente.**

## Lake, warehouse y backend transaccional: no compiten, se reparten responsabilidades

Otra idea clave.

No se trata de reemplazar completamente el backend operativo.

El backend transaccional sigue siendo central para:

- reglas de negocio vivas
- operaciones online
- consistencia operativa
- estados actuales
- experiencias transaccionales

El mundo analítico cumple otra función.

Sirve para:

- explorar historia
- consolidar múltiples fuentes
- recalcular métricas
- servir reporting
- sostener decisiones de negocio
- habilitar modelos derivados

Cuando todo eso se mezcla sin criterio, aparecen fricciones.

Cuando cada capa asume mejor su rol, el sistema suele volverse mucho más sano.

## El trade-off real: flexibilidad, gobernanza y costo

Ninguna de estas piezas es gratis.

Un lake te da flexibilidad, pero puede degradarse en caos si no tenés buenas prácticas de organización, metadata, particionado, naming y calidad.

Un warehouse te da estructura y consumo claro, pero requiere más trabajo de modelado, ownership, definiciones estables y disciplina de transformación.

Además aparecen costos de:

- almacenamiento
- cómputo
- pipelines
- observabilidad
- gobernanza
- catálogo de datos
- gestión de permisos
- soporte operativo

Entonces la discusión nunca debería ser:

- “qué herramienta está de moda”

Sino más bien:

- qué problema queremos resolver
- qué clase de consumidores existen
- cuánto histórico necesitamos
- cuánto re-procesamiento esperamos
- qué nivel de consistencia semántica necesitamos
- cuánto costo y complejidad podemos sostener

## Mini ejercicio mental

Imaginá que trabajás en un e-commerce en crecimiento que ya tiene:

- base OLTP para órdenes, pagos y catálogo
- eventos de producto y navegación
- datos de carriers y pasarelas externas
- reportes financieros mensuales
- dashboards de negocio cada vez más pesados
- y discusiones constantes sobre por qué “el número cambia según quién lo mire”

Preguntas para pensar:

- qué parte de esos datos debería permanecer solo en OLTP
- qué tipo de información convendría conservar en raw para re-procesamiento futuro
- qué datasets deberían modelarse en una capa más curada y gobernada
- qué consultas nunca más deberían ejecutarse directo sobre producción
- qué equipos serían dueños de cada capa
- en qué punto un warehouse empezaría a aportar más que una colección de tablas sueltas

Ahora imaginá otra situación.

Un equipo propone crear un lake gigantesco “por si acaso”, pero nadie puede explicar:

- qué fuentes va a recibir
- qué preguntas de negocio va a habilitar
- qué políticas de calidad va a tener
- quién lo va a gobernar
- ni qué problemas concretos no pueden resolverse todavía con la arquitectura actual

Preguntas:

- qué señales mostrarían que la decisión es prematura
- qué riesgo hay de crear más complejidad que valor
- qué pasos intermedios tomarías antes de montar una capa analítica grande

## Resumen

Data lake y data warehouse no son sinónimos ni decoraciones arquitectónicas.
Son respuestas distintas a problemas distintos dentro del mundo de datos.

La idea central de este tema es ésta:

**cuando el backend transaccional deja de ser un buen lugar para guardar, transformar, historizar y consultar todo al mismo tiempo, empieza a tener sentido separar mejor almacenamiento flexible, transformación curada y consumo analítico.**

Eso implica entender:

- diferencia entre datos crudos y datos modelados
- diferencia entre flexibilidad y gobernanza
- valor de las capas raw, curated y serving
- señales de saturación del OLTP
- costo real de mover el problema a infraestructura analítica
- y el momento adecuado para introducir estas piezas sin sobreingeniería

Cuando esto se entiende bien, lake y warehouse dejan de verse como buzzwords y empiezan a verse como herramientas con propósito claro dentro de una arquitectura data-aware.

Y eso nos deja listos para el siguiente tema, donde vamos a bajar esta discusión a un problema muy práctico que aparece cuando los consumidores de datos piden mover volúmenes grandes fuera del sistema:

**exportaciones grandes y procesamiento pesado.**
