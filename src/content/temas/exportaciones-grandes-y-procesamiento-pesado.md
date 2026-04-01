---
title: "Exportaciones grandes y procesamiento pesado"
description: "Qué cambia cuando el sistema deja de servir solo consultas interactivas pequeñas y empieza a tener que generar exportaciones masivas, recomputaciones extensas, archivos pesados y trabajos que consumen mucho tiempo, CPU, memoria o I/O, por qué intentar resolver todo dentro del request web suele romper performance y experiencia de usuario, cómo separar procesamiento online de procesamiento offline, qué patrones ayudan a coordinar jobs largos, almacenamiento temporal, chunking, backpressure y entrega segura de resultados, y de qué manera diseñar exportaciones grandes sin poner en riesgo la operación transaccional ni convertir la plataforma en una fábrica de timeouts." 
order: 225
module: "Datos, reporting y procesamiento"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos data lake, warehouse y cuándo entran en juego.

Vimos que:

- el backend transaccional no siempre es buen lugar para absorber todas las necesidades analíticas
- que guardar datos crudos no es lo mismo que exponer datos curados
- que raw, curated y serving cumplen roles diferentes
- que lake y warehouse no son sinónimos
- y que una arquitectura sana separa mejor operación online, historización, transformación y consumo analítico cuando la escala lo exige

Ahora aparece un problema muy concreto.

Porque aunque una organización todavía no tenga un stack analítico gigantesco, en algún momento igual empieza a pedir cosas como:

- exportar un CSV con millones de filas
- generar un Excel enorme para finanzas
- recalcular históricos completos
- construir archivos para auditoría o conciliación
- producir reportes pesados para clientes enterprise
- descargar datasets enteros para análisis externo
- o correr procesos que tardan minutos, horas o más

Y ahí aparece una tensión clave.

**¿Cómo hacés para soportar exportaciones grandes y procesamiento pesado sin romper la experiencia online ni dañar la operación normal del sistema?**

Ése es el foco de este tema:

**exportaciones grandes y procesamiento pesado.**

La idea central es ésta:

**cuando el trabajo deja de ser pequeño, interactivo y de respuesta inmediata, ya no conviene tratarlo como una simple extensión del request web; conviene diseñarlo como procesamiento aparte, con control explícito de costo, concurrencia, almacenamiento, entrega y observabilidad.**

## Qué problema resuelve realmente este tema

En etapas tempranas, muchas plataformas resuelven exportaciones de forma muy simple.

El usuario hace clic en un botón.
El backend:

- ejecuta una consulta
- arma un archivo
- lo devuelve en la misma respuesta HTTP

Y listo.

Mientras el volumen es chico, eso puede funcionar razonablemente bien.

Pero cuando el sistema crece, esa misma lógica empieza a generar problemas muy reales.

Por ejemplo:

- requests que tardan demasiado
- timeouts del navegador o del proxy
- consumo exagerado de memoria
- queries enormes que compiten con tráfico normal
- workers web ocupados durante demasiado tiempo
- picos de CPU por serialización o compresión
- reintentos del usuario que disparan varias exportaciones duplicadas
- archivos intermedios que nadie limpia
- y operaciones de negocio degradadas porque un proceso pesado quedó compitiendo con lo transaccional

Entonces el problema ya no es “cómo generar un CSV”.

Pasa a ser algo más importante:

**cómo correr trabajo pesado sin tratarlo como si fuera trabajo interactivo liviano.**

Eso vale para:

- exportaciones grandes
- backfills
- recomputaciones
- generación de reportes complejos
- pipelines manuales lanzados desde backoffice
- snapshots para auditoría
- consolidaciones masivas
- y cualquier proceso cuyo costo o duración exceda el presupuesto normal de una request online

## El error clásico: querer resolver todo dentro del request HTTP

Éste es el error más común.

Alguien implementa algo así:

- llega request a `/export`
- el backend lee filtros
- arma una query grande
- carga todo en memoria
- genera un archivo completo
- y lo devuelve en la misma conexión

A veces funciona en desarrollo y en staging.
Pero en producción, con datos reales, aparecen los problemas.

### Qué se rompe con este enfoque

#### 1. Latencia impredecible

La duración de la request deja de ser razonable.

Una exportación puede tardar:

- 5 segundos
- 40 segundos
- varios minutos

Eso vuelve muy mala la experiencia y además complica todo el path técnico intermedio.

#### 2. Timeouts en distintas capas

Puede cortar:

- el navegador
- el load balancer
- el reverse proxy
- el gateway
- el servidor de aplicación
- el cliente que consume la API

Y muchas veces el trabajo siguió parcialmente o terminó igual, pero el usuario no sabe qué pasó.

#### 3. Competencia con tráfico real

Si los mismos workers atienden checkout, autenticación, órdenes y además exportaciones pesadas, el sistema empieza a competir consigo mismo.

#### 4. Uso excesivo de memoria

Cargar todo el dataset para recién después serializarlo es una receta clásica para reventar memoria o provocar garbage collection agresivo.

#### 5. Reintentos peligrosos

Si el usuario no ve resultado rápido, vuelve a hacer clic.

Entonces ahora hay:

- dos exportaciones iguales
- tres jobs pesados duplicados
- cuatro archivos temporales
- múltiples queries gigantes
- y ninguna coordinación clara

La conclusión es simple.

**cuando el trabajo es pesado, tratarlo como request online suele ser una mala decisión arquitectónica.**

## Exportación grande no significa solo “muchas filas”

Éste es un punto importante.

Una exportación puede ser pesada por varios motivos distintos.

### Volumen

Por ejemplo:

- millones de filas
- decenas de columnas
- archivos de cientos de MB o más

### Complejidad de consulta

Aunque el resultado no sea enorme, la preparación puede ser costosa por:

- joins complejos
- agregaciones grandes
- filtros costosos
- enriquecimiento desde varias fuentes
- reglas de negocio no triviales

### Transformación

A veces el costo está en:

- formatear
- agrupar
- convertir monedas
- anonimizar campos
- calcular columnas derivadas
- serializar a Excel o PDF
- comprimir

### Acceso a fuentes múltiples

El trabajo puede requerir:

- combinar OLTP y datos analíticos
- traer archivos externos
- llamar otros servicios
- consultar snapshots o históricos

### Concurrencia

Un solo export pesado puede ser aceptable.

El problema real aparece cuando diez usuarios hacen lo mismo al mismo tiempo, o cuando además coinciden con procesos batch, cierres, backfills o picos operativos.

Por eso el diseño no tiene que mirar solo “cuánto tarda uno”, sino también:

- cuántos pueden correr juntos
- qué recursos consumen
- qué impacto generan en el resto del sistema

## La idea central: separar pedido, ejecución y entrega

Una forma sana de pensar estas operaciones es separarlas en tres momentos.

### 1. Pedido

El usuario solicita una exportación o proceso.

El sistema registra:

- quién la pidió
- con qué filtros
- con qué formato
- cuándo se pidió
- qué permisos tenía
- y qué versión lógica del reporte o job corresponde

En esta etapa no necesariamente se ejecuta todo de inmediato.

### 2. Ejecución

El trabajo corre aparte, en una infraestructura o cola adecuada.

Ahí el sistema:

- toma el job
- procesa por chunks o lotes
- escribe resultados parciales o finales
- mide progreso
- registra errores
- y controla reintentos

### 3. Entrega

Cuando termina, el usuario accede al resultado.

Eso puede ocurrir mediante:

- descarga desde un link temporal
- notificación por email
- aviso en backoffice
- estado consultable en UI
- almacenamiento en un bucket o ubicación segura

Esta separación parece simple, pero cambia por completo la robustez del diseño.

Porque ya no tratás una exportación pesada como una respuesta HTTP larga e inestable.
La tratás como un trabajo administrado.

## Request-response vs trabajo asíncrono

No todo necesita ir a una cola.

Ésa también es una aclaración importante.

Si un reporte:

- tarda poco
- devuelve poco volumen
- no compite con tráfico crítico
- y tiene costo razonable

puede seguir siendo síncrono.

El problema aparece cuando se rompe ese presupuesto.

Una forma útil de pensarlo es ésta.

### Trabajo interactivo

Conviene hacerlo síncrono cuando:

- dura poco
- el usuario espera respuesta inmediata
- el costo es acotado
- y el sistema lo puede sostener sin degradación

### Trabajo pesado

Conviene pasarlo a mecanismo asíncrono cuando:

- puede tardar mucho
- el volumen es incierto o alto
- el costo depende demasiado del dataset
- el trabajo requiere chunking o persistencia intermedia
- hay que reintentar con seguridad
- o la infraestructura online no debería quedar ocupada esperando

No es una discusión ideológica.
Es una discusión sobre presupuesto técnico y experiencia de usuario.

## Jobs largos: estados explícitos en lugar de magia implícita

Cuando el trabajo es asíncrono, conviene modelar sus estados.

Por ejemplo:

- `PENDING`
- `QUEUED`
- `RUNNING`
- `COMPLETED`
- `FAILED`
- `CANCELLED`
- `EXPIRED`

Eso permite:

- mostrar progreso o al menos estado visible
- evitar ambigüedad para el usuario
- hacer troubleshooting
- coordinar reintentos
- registrar quién lanzó qué
- y saber si existe un archivo válido para descargar

Sin estados explícitos, la UX suele quedar reducida a algo muy frágil:

- “hacé clic y esperá”
- “si no funcionó, probá otra vez”

Y eso es justo lo que conviene evitar.

## Chunking: no querer hacer todo de una sola vez

Cuando el volumen es grande, uno de los patrones más importantes es procesar en chunks.

Eso puede significar:

- leer filas por páginas o ventanas
- escribir output incrementalmente
- procesar lotes intermedios
- checkpointear progreso
- evitar cargar todo en memoria

### Por qué ayuda tanto

Porque reduce varios riesgos a la vez:

- baja el uso pico de memoria
- permite reanudar mejor
- hace más observable el progreso
- facilita backpressure
- y desacopla tamaño total del trabajo respecto del tamaño de cada unidad operativa

Hay que tener cuidado, claro.

No cualquier paginado sirve.

Por ejemplo, si usás offsets enormes sobre tablas grandes, el costo puede empeorar con el tiempo.

Muchas veces conviene más trabajar con:

- cursores
- ventanas por rango
- IDs crecientes
- particiones temporales
- snapshots consistentes

La idea no es “partir porque sí”.
La idea es **hacer que el trabajo pesado tenga unidades manejables**.

## Snapshot lógico: exportar algo consistente

Otro problema clásico.

Imaginá que una exportación grande tarda bastante y mientras tanto los datos cambian.

Entonces puede pasar que el archivo final mezcle:

- filas leídas antes de ciertos cambios
- otras filas leídas después
- estados inconsistentes entre tablas relacionadas

Y eso genera una exportación difícil de interpretar o incluso incorrecta.

Entonces muchas veces hace falta decidir explícitamente qué significa consistencia para esa exportación.

Algunas posibilidades:

- snapshot de base en un momento dado
- rango temporal cerrado hasta cierta marca
- versión lógica del dataset
- materialización intermedia sobre la que luego se exporta

No toda exportación necesita consistencia perfecta.
Pero sí necesita una semántica clara.

Porque si no, después nadie sabe qué número representa realmente ese archivo.

## Dónde correr el trabajo pesado

Otra decisión importante es dónde ejecutar estos procesos.

### Opción 1: en los mismos servidores web

Solo conviene cuando:

- el trabajo es relativamente chico
- la concurrencia es baja
- el impacto está muy controlado

En general no es la mejor opción para trabajo realmente pesado.

### Opción 2: workers separados

Suele ser mucho mejor.

Permite:

- aislar recursos
- limitar concurrencia
- escalar independientemente
- separar tráfico online de trabajo batch

### Opción 3: infraestructura especializada

En algunos casos el trabajo puede ir a:

- motores de consulta analítica
- entornos batch
- procesamiento distribuido
- pipelines externos

Esto tiene sentido cuando el volumen o complejidad ya exceden claramente lo que conviene hacer dentro del backend transaccional.

La pregunta útil no es “qué arquitectura suena más seria”.
La pregunta útil es:

**qué entorno puede ejecutar este trabajo con el menor daño posible sobre la operación principal.**

## Almacenamiento del resultado: no todo debería viajar directamente por la API

Otro error común es asumir que el archivo final siempre debe salir directo en la respuesta.

Para exportaciones grandes, muchas veces conviene:

- generar el archivo aparte
- guardarlo en storage temporal o permanente según el caso
- exponer una referencia segura de descarga
- y permitir que el usuario lo obtenga cuando esté listo

Esto tiene varias ventajas:

- desacopla generación de descarga
- evita conexiones larguísimas
- facilita reintentos de descarga sin recomputar todo
- permite expiración controlada
- mejora auditoría

También obliga a pensar cosas importantes.

Por ejemplo:

- cuánto tiempo vive el archivo
- quién puede descargarlo
- si requiere firma temporal
- si contiene datos sensibles
- cómo se limpia luego

## Idempotencia y duplicados

Una exportación grande también puede sufrir problemas de duplicación.

Por ejemplo:

- el usuario pide dos veces lo mismo por impaciencia
- el frontend reintenta
- el worker se cae y vuelve a levantar
- el scheduler relanza un job incierto

Si no hay estrategia clara, terminás con:

- trabajo duplicado
- costo innecesario
- múltiples archivos equivalentes
- estados confusos

Entonces conviene pensar:

- si pedidos idénticos deberían reusar un resultado reciente
- si la operación necesita una clave de idempotencia
- si un job ya en curso debería bloquear uno equivalente
- si duplicados cercanos deberían consolidarse

No siempre hay que deduplicar todo.
Pero sí hay que decidirlo explícitamente.

## Backpressure y límites: proteger al sistema de sus propios consumidores

Cuando el procesamiento pesado está bien separado, aparece otra responsabilidad.

**poner límites.**

Porque si cualquier usuario puede disparar infinitas exportaciones gigantes, el sistema igual va a sufrir.

Algunas herramientas de control:

- límite de jobs concurrentes globales
- límite por tenant
- límite por usuario
- cuotas por período
- tamaño máximo exportable por operación
- priorización de ciertos trabajos sobre otros
- ventanas horarias para procesos especialmente caros

Esto no es “ser restrictivo porque sí”.
Es evitar que una funcionalidad útil se convierta en una vía de autoataque interno.

## UX sana para trabajos largos

Muchas malas implementaciones no fallan solo técnicamente.
También fallan en la UX.

Una UX más sana para trabajo pesado suele incluir:

- confirmación de que el pedido fue recibido
- estado visible del trabajo
- posibilidad de volver más tarde
- notificación cuando termina
- mensaje claro si falla
- explicación de límites o tiempos esperables
- acceso posterior al archivo sin recomputar innecesariamente

Cuando esto está bien hecho, el usuario deja de depender de mirar una request colgada en la pantalla.

Empieza a interactuar con una operación administrada.

## Exportaciones para humanos vs exportaciones para sistemas

No toda exportación tiene el mismo destinatario.
Y eso cambia bastante el diseño.

### Exportaciones para humanos

Suelen priorizar:

- legibilidad
- nombres de columnas amigables
- formatos tipo CSV, XLSX o PDF
- agrupaciones entendibles
- cierta estabilidad visual

### Exportaciones para sistemas

Suelen priorizar:

- estructura estable
- serialización robusta
- versionado
- consumo automatizado
- tamaños grandes
- reinicio o re-procesamiento

Mezclar ambas necesidades en un mismo mecanismo suele traer problemas.

Porque un archivo excelente para una persona puede ser pésimo para ingestión automática.
Y un dump técnico ideal para otra máquina puede ser horrible para finanzas o soporte.

## El costo oculto: limpieza, expiración y gobernanza

Una exportación no termina cuando el archivo se generó.

Después aparecen preguntas operativas muy reales:

- dónde quedó guardado
- quién puede accederlo
- por cuánto tiempo
- qué pasa si contiene PII o datos sensibles
- cómo se borra cuando expira
- cómo se audita la descarga
- qué versionado de columnas usó
- si puede reproducirse después

Si esto no se diseña, la plataforma acumula:

- buckets llenos de archivos huérfanos
- resultados viejos que nadie limpia
- datos sensibles descargables mucho más tiempo del debido
- costos de storage innecesarios
- y auditoría débil sobre quién sacó qué información del sistema

## Cuándo una exportación ya no debería nacer del backend transaccional

Hay una señal importante de madurez.

Al principio, muchas exportaciones salen directo del backend operativo.
Pero llega un punto en el que conviene apoyarse más en capas analíticas o materializaciones intermedias.

Señales típicas:

- la query pega demasiado sobre tablas críticas
- el archivo necesita mucha historia consolidada
- el cálculo depende de lógica analítica pesada
- el dataset se arma mejor desde read models o warehouse
- varias áreas consumen la misma exportación o variantes cercanas
- el costo de generarla online ya es claramente injustificable

En ese momento, la discusión correcta deja de ser:

- “cómo optimizamos más esta query”

Y pasa a ser:

- “desde qué capa debería producirse realmente este resultado”

Eso conecta directamente este tema con todo lo que venimos viendo sobre separación entre OLTP y capas analíticas.

## Mini ejercicio mental

Imaginá un SaaS B2B donde cada cliente enterprise puede pedir:

- exportación completa de usuarios
- historial de actividad de seis meses
- órdenes y pagos conciliados
- auditoría de cambios
- y datasets para integrar con sus propias herramientas

Preguntas para pensar:

- qué exportaciones podrían seguir siendo pequeñas e interactivas
- cuáles deberían transformarse en jobs asíncronos
- cuáles deberían salir desde OLTP y cuáles desde una capa derivada
- qué límites pondrías por tenant
- qué harías para evitar duplicados si el usuario insiste varias veces
- cómo manejarías expiración y seguridad del archivo final

Ahora imaginá otro caso.

El equipo de operaciones necesita recalcular un histórico de comisiones sobre un año entero porque cambió una regla comercial.

Preguntas:

- por qué sería peligroso hacer eso desde los mismos workers que atienden checkout
- cómo separarías pedido, ejecución y publicación del resultado
- qué checkpoints o chunking usarías
- qué semántica de consistencia necesitarías para confiar en el resultado

## Resumen

Exportaciones grandes y procesamiento pesado no son simplemente “consultas más largas”.
Son otro tipo de trabajo.

La idea central de este tema es ésta:

**cuando una operación consume demasiado tiempo, volumen o recursos, deja de ser razonable tratarla como una request interactiva común; conviene modelarla como un job administrado, con estados, límites, aislamiento, almacenamiento adecuado y entrega desacoplada.**

Eso implica entender:

- cuándo dejar de usar request-response directo
- cómo separar pedido, ejecución y entrega
- valor del procesamiento asíncrono y los workers separados
- importancia de chunking, snapshot lógico e idempotencia
- necesidad de límites, backpressure y gobernanza
- y el costo real de archivos pesados, resultados temporales y seguridad de acceso

Cuando esto se diseña bien, las exportaciones dejan de ser una fuente de timeouts, duplicados y degradación operativa.
Pasan a ser una capacidad seria del sistema.

Y eso nos deja listos para el siguiente tema, donde aparece una preocupación fundamental apenas empezamos a mover datos, exportarlos y analizarlos con más fuerza:

**datos sensibles, permisos y seguridad analítica.**
