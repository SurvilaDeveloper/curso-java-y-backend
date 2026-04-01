---
title: "OLTP vs OLAP y por qué no todo dato vive igual"
description: "Qué diferencia hay entre sistemas transaccionales y sistemas analíticos, por qué no conviene tratar toda la información como si sirviera para lo mismo, cómo cambian el modelado, las consultas, la latencia y el costo según el tipo de uso, y qué decisiones de backend ayudan a separar operación y análisis sin romper ninguna de las dos cosas."
order: 211
module: "Datos, reporting y procesamiento"
level: "intermedio"
draft: false
---

## Introducción

Hasta acá venías trabajando mucho con sistemas que operan cosas en tiempo real:

- órdenes
- pagos
- stock
- envíos
- usuarios
- permisos
- integraciones
- eventos operativos

Es decir:

**sistemas que ejecutan el negocio.**

Pero ahora entramos en una etapa donde aparece otra necesidad igual de importante:

**entender el negocio, medirlo, resumirlo, procesarlo y usar sus datos para decidir mejor.**

Y ahí aparece una distinción que para backend es clave:

- una cosa es un sistema pensado para registrar y operar transacciones
- otra cosa es un sistema pensado para consultar, agregar y analizar grandes volúmenes de datos

A esos dos mundos se los suele resumir con dos siglas muy conocidas:

- **OLTP**
- **OLAP**

A veces se nombran como si fueran un tema de base de datos aislado.
Pero en realidad afectan mucho más que eso.

Afectan:

- cómo modelás
- cómo escribís consultas
- qué latencia esperás
- qué consistencia necesitás
- qué costo computacional asumís
- qué tipo de carga recibe el sistema
- cómo separás la operación del análisis

La idea central de este tema es esta:

**no todo dato vive igual porque no todo dato se usa con el mismo propósito.**

Y cuando mezclás mal esos propósitos, el sistema operativo se degrada, el análisis se vuelve caro o frágil, y los equipos terminan trabajando con números lentos, inconsistentes o difíciles de explicar.

## El error inicial: creer que una sola base sirve igual para todo

Un error muy común cuando un sistema todavía es chico es pensar así:

- guardamos todo en la base principal
- si después necesitamos métricas, hacemos consultas sobre esa misma base
- si crece un poco, agregamos índices
- si crece más, optimizamos algunas queries
- y listo

Ese enfoque puede funcionar durante un tiempo.

De hecho, muchas veces es razonable empezar así.

El problema aparece cuando no distinguís bien los tipos de carga.

Porque una cosa es responder operaciones como:

- crear una orden
- reservar stock
- registrar un pago
- actualizar el estado de un envío
- autenticar a un usuario

Y otra muy distinta es responder preguntas como:

- cuánto se vendió por categoría en los últimos 18 meses
- cuál fue la conversión por canal, por dispositivo y por cohorte
- cómo evolucionó el tiempo medio de entrega por zona
- qué promociones rindieron mejor según margen neto
- qué clientes repiten compra y cada cuánto

Las primeras suelen requerir:

- baja latencia
- escrituras frecuentes
- integridad transaccional
- acceso por clave o por relaciones operativas concretas

Las segundas suelen requerir:

- escanear muchos datos
- agrupar
- agregar
- comparar ventanas temporales
- cruzar dimensiones
- tolerar cierta latencia en la actualización

Ahí aparece el choque.

**el sistema que mejor sirve para operar no siempre es el mejor sistema para analizar.**

## Qué significa OLTP

OLTP viene de **Online Transaction Processing**.

No hace falta memorizar la sigla como definición académica.
Lo importante es entender la idea.

Un sistema OLTP está pensado para manejar la operación cotidiana del negocio.

Por ejemplo:

- un checkout que crea una orden
- una API que registra un pago
- un panel que cambia el estado de fulfillment
- un login que valida credenciales
- una app que reserva turnos
- un sistema que descuenta inventario

### Características típicas de OLTP

#### 1. Muchas operaciones pequeñas y frecuentes

Se ejecutan muchísimas lecturas y escrituras puntuales.

#### 2. Baja latencia

Importa que la respuesta llegue rápido.

#### 3. Integridad fuerte de la transacción

No querés cobrar dos veces.
No querés vender stock inexistente.
No querés dejar una orden en un estado imposible.

#### 4. Datos bastante normalizados

Suele importar evitar duplicación descontrolada y preservar consistencia operativa.

#### 5. Consultas orientadas a casos concretos

Por ejemplo:

- buscar una orden por ID
- traer los ítems de un carrito
- obtener el stock de un SKU
- listar las órdenes recientes de un usuario

Dicho simple:

**OLTP está optimizado para ejecutar el negocio sin romper la operación.**

## Qué significa OLAP

OLAP viene de **Online Analytical Processing**.

Otra vez: más importante que la sigla es la idea.

Un sistema OLAP está pensado para analizar información, resumirla y explorarla desde muchas dimensiones.

Por ejemplo:

- ventas por mes, canal y categoría
- cohortes de retención
- comparación entre regiones
- evolución del margen
- tiempos operativos promedio por etapa
- análisis de fraude por método de pago
- comportamiento de uso por plan en un SaaS

### Características típicas de OLAP

#### 1. Consultas menos frecuentes, pero mucho más pesadas

No necesariamente hay millones de usuarios golpeando el sistema analítico al mismo tiempo.
Pero cada consulta puede leer enormes volúmenes.

#### 2. Lecturas mucho más intensivas que escrituras

Importa consultar, resumir, agrupar y comparar.
No tanto registrar microtransacciones en tiempo real.

#### 3. Modelo orientado a análisis

Muchas veces conviene desnormalizar, preagregar o reorganizar datos para que ciertas preguntas sean baratas de responder.

#### 4. Mayor tolerancia a latencia del dato

En muchos casos no hace falta que el dato esté actualizado al milisegundo.
A veces alcanza con minutos, horas o cierres diarios.

#### 5. Consultas multidimensionales

Se pregunta por tiempo, canal, cliente, región, producto, plan, segmento y combinaciones entre ellos.

Dicho simple:

**OLAP está optimizado para entender el negocio, no para ejecutar cada operación del negocio.**

## La diferencia más importante: operar versus explicar

Una forma práctica de no confundirte es pensar esta diferencia:

### OLTP responde:

- qué tiene que pasar ahora
- qué estado tiene esta entidad
- podemos confirmar esta operación
- este cambio es válido o no

### OLAP responde:

- qué estuvo pasando en el tiempo
- qué patrones aparecen
- qué segmentos se comportan distinto
- cómo se compara una dimensión contra otra
- dónde conviene tomar decisiones

Uno gobierna la acción.
El otro ayuda a interpretar la acción.

Y esa diferencia tiene consecuencias muy concretas.

Por ejemplo:

- una orden debe crearse correctamente aunque todavía no exista en el tablero analítico
- un dashboard comercial puede tolerar algunos minutos de retraso si a cambio evita castigar el sistema de checkout
- una consulta de cohortes no debería competir por CPU con la API que cobra pagos

## Por qué no conviene mezclar OLTP y OLAP sin criterio

Técnicamente se puede consultar una base transaccional para análisis.
Y a veces, al principio, está bien.

El problema es hacerlo sin límites.

### 1. Las consultas analíticas suelen castigar la operación

Consultas con:

- joins grandes
- agregaciones pesadas
- filtros temporales largos
- scans amplios
- ordenamientos costosos

pueden competir con las transacciones del negocio.

Y entonces el sistema empieza a sufrir justo donde más duele:

- checkout más lento
- paneles operativos trabados
- timeouts en endpoints
- locks más frecuentes
- mayor consumo de CPU y memoria

### 2. El modelo transaccional no siempre representa bien la mirada analítica

Una base operativa suele modelar entidades para funcionar.
No necesariamente para analizar.

Por ejemplo:

- una orden tiene muchos estados intermedios
- un pago tiene semántica propia
- una devolución aparece después
- una promoción pudo aplicarse por distintas reglas

Todo eso puede estar bien para operar.
Pero para analizar conviene quizás tener:

- hechos consolidados
- snapshots diarios
- dimensiones limpias
- métricas precomputadas
- tablas preparadas para reporting

### 3. La semántica del dato analítico necesita más contexto

En OLTP guardás eventos y estados.
En OLAP querés responder preguntas de negocio.

Y entre una cosa y otra suele hacer falta:

- limpieza
- enriquecimiento
- conciliación
- reglas explícitas
- transformación
- historización

### 4. El costo de consulta cambia mucho

Una base diseñada para miles de transacciones por segundo no necesariamente es barata para consultas que recorren meses o años de historia cruzando múltiples dimensiones.

## El modelo de datos también cambia

Éste es un punto clave.

La misma información puede representarse distinto según el propósito.

### En OLTP suele importar más

- integridad referencial
- actualización segura
- consistencia por operación
- normalización razonable
- writes correctos y rápidos

### En OLAP suele importar más

- facilidad de consulta
- agregaciones eficientes
- lecturas masivas
- particionado por tiempo
- desnormalización útil
- compresión y scans eficientes

No significa que un modelo sea “bueno” y el otro “malo”.

Significa que **responden a tensiones distintas**.

Un ejemplo simple:

En OLTP podrías tener:

- `orders`
- `order_items`
- `payments`
- `shipments`
- `refunds`
- `customers`
- `products`

Cada tabla con su lógica operativa.

En OLAP tal vez te convenga construir algo más cercano a:

- una tabla de hechos de ventas
- dimensiones de tiempo, producto, cliente, canal y región
- métricas derivadas por día o por hora
- snapshots de estado operativo

Las dos miradas pueden coexistir.
De hecho, en sistemas serios suelen coexistir.

## Latencia del dato: no todo necesita tiempo real

Una parte madura del diseño es aceptar que **no toda pregunta necesita la frescura máxima**.

Eso te permite separar mejor cargas y bajar costos.

### Casos donde sí suele importar mucha frescura

- monitoreo operativo
- alertas de fraude o caídas
- backlog de órdenes
- saturación de un carrier
- errores de checkout

### Casos donde suele tolerarse latencia razonable

- ventas por día
- cohortes de clientes
- reporting ejecutivo
- rentabilidad por canal
- análisis por campaña
- uso mensual por tenant

Cuando tratás todo como tiempo real, muchas veces terminás diseñando algo más caro, más frágil y más difícil de operar de lo necesario.

## De dónde suele salir la capa analítica

La capa OLAP rara vez aparece por arte de magia.

Normalmente nace a partir de datos operativos que luego se mueven, transforman o proyectan.

Algunas estrategias comunes son:

### 1. Réplicas de lectura

Pueden ayudar a descargar parte de las consultas pesadas.

Sirven en algunos escenarios.
Pero no resuelven por sí solas la diferencia entre modelo operativo y analítico.

### 2. ETL o ELT

Tomás datos del sistema transaccional y los cargás en otra capa donde se transforman para análisis.

### 3. Read models o proyecciones específicas

Construís tablas preparadas para ciertas consultas del negocio.

### 4. Eventos y pipelines incrementales

Cada evento relevante alimenta una proyección analítica o de reporting.

### 5. Data warehouse o motor analítico separado

Cuando el volumen, la complejidad o la cantidad de consultas justifican separar más claramente la analítica del core transaccional.

La elección depende de:

- volumen
- frescura requerida
- costo
- complejidad del negocio
- madurez del equipo
- tipo de preguntas que querés responder

## Ejemplo mental: e-commerce

Supongamos un e-commerce real.

### En OLTP te importan operaciones como:

- crear carrito
- agregar ítems
- recalcular checkout
- autorizar pago
- crear orden
- descontar stock
- cambiar estado de fulfillment
- registrar devolución

Todo eso requiere coherencia operativa inmediata.

### En OLAP te interesan preguntas como:

- ventas netas por categoría y por semana
- conversión por fuente de tráfico
- tasa de devolución por tipo de producto
- margen estimado por canal
- tiempo promedio hasta despacho por depósito
- cohorte de recompra por mes de alta

Si intentás resolver toda esa capa analítica con la misma base y la misma lógica del checkout, tarde o temprano aparecen problemas.

No porque esté “prohibido”.
Sino porque el sistema operativo y el sistema analítico empiezan a estorbarse entre sí.

## Ejemplo mental: SaaS B2B

Ahora imaginá un SaaS con tenants, planes y billing recurrente.

### En OLTP te importa:

- registrar usuarios
- autenticar
- validar permisos
- medir consumo del tenant
- aplicar límites por plan
- emitir una invoice
- registrar pago o fallo de cobro
- habilitar o bloquear una feature

### En OLAP te interesa:

- crecimiento de MRR
- churn por cohorte
- uso por plan
- expansión por tenant
- costo por segmento
- feature adoption
- retención por industria
- dunning recovery rate

Otra vez aparece la misma idea:

**la capa transaccional sostiene la plataforma; la capa analítica te ayuda a entender si la plataforma y el negocio van bien.**

## Señales de que estás mezclando mal los dos mundos

Hay varias señales muy típicas.

### 1. Los reportes lentos degradan el sistema operativo

Cada consulta pesada se siente en endpoints transaccionales.

### 2. Las métricas importantes dependen de SQL artesanal cada vez

No existe una capa de datos pensada para análisis.
Todo sale de consultas ad hoc sobre tablas operativas.

### 3. Cambiar un flujo funcional rompe dashboards históricos

La semántica del dato analítico está demasiado pegada al modelo operativo del momento.

### 4. Cada equipo calcula los números distinto

Producto, finanzas y operaciones no comparten definiciones claras.

### 5. El sistema guarda bien estados actuales, pero mal historia

Podés operar hoy, pero no entender bien qué pasó durante el tiempo.

### 6. Todo exige tiempo real aunque no haga falta

Se encarece el diseño sin ganar valor real.

## Qué decisiones sanas puede tomar un backend engineer

No hace falta construir un data platform gigante para pensar bien este tema.

Hay decisiones más simples que ya mejoran muchísimo la situación.

### 1. Distinguir explícitamente uso operativo y uso analítico

Parece obvio, pero cambia la conversación técnica.

### 2. Registrar eventos y timestamps relevantes

No quedarte solo con el estado actual cuando sabés que después querrás explicar evolución.

### 3. Diseñar claves y referencias útiles para conciliación

Sobre todo cuando hay pagos, carriers, ERPs o terceros.

### 4. Evitar que dashboards pesados peguen directo al core transaccional

Aunque sea con tablas derivadas simples o procesos batch básicos.

### 5. Aceptar latencias distintas según la pregunta

No todo necesita ser realtime.

### 6. Separar semántica de negocio de estructura física improvisada

Que “venta”, “usuario activo”, “tenant pago” o “orden válida” no dependan de interpretaciones casuales.

### 7. Pensar la evolución futura del dato

Porque una base transaccional puede ser el origen, pero no siempre será el mejor destino final para análisis.

## Mini ejercicio mental

Imaginá que tenés un sistema con:

- órdenes
- pagos
- envíos
- reembolsos
- clientes
- promociones
- múltiples canales de venta

Preguntas para pensar:

- qué operaciones requieren transacción fuerte y respuesta inmediata
- qué preguntas de negocio toleran unos minutos u horas de latencia
- qué tablas actuales solo sirven para operar y cuáles también ayudan a analizar
- qué historia se perdería si guardaras solo el estado final de cada entidad
- qué reportes hoy castigarían demasiado la base principal
- qué proyecciones o modelos derivados podrías construir primero sin sobrediseñar

## Resumen

OLTP y OLAP no son solo dos etiquetas teóricas.

Son dos formas distintas de mirar y diseñar el dato según el trabajo que querés hacer con él.

La idea central de este tema es esta:

**el dato operativo y el dato analítico pueden venir del mismo negocio, pero no necesariamente deben vivir, modelarse ni consultarse de la misma manera.**

Cuando entendés eso:

- dejás de castigar el sistema transaccional con preguntas que no fue diseñado para responder
- construís reporting y análisis con más claridad semántica
- aceptás latencias razonables donde tiene sentido
- empezás a pensar mejor cómo separar operación, historia y análisis

Y eso nos deja listos para el siguiente tema, donde vamos a bajar esta idea a una pregunta muy concreta:

**cómo modelar para reporting sin romper la operación transaccional.**
