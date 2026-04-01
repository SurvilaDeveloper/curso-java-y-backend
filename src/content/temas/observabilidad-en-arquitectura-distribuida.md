---
title: "Observabilidad en arquitectura distribuida"
description: "Qué cambia cuando intentás entender un sistema repartido en varios servicios, por qué logs, métricas y trazas tienen que trabajar juntos, y cómo diseñar observabilidad para diagnosticar problemas reales sin ahogarte en ruido." 
order: 166
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

## Introducción

En un monolito, cuando algo sale mal, muchas veces el recorrido mental parece relativamente directo.

Podés pensar así:

- entró una request
- pasó por ciertos componentes
- tocó la base
- devolvió error o tardó demasiado

Tal vez el problema no sea fácil.
Pero al menos el sistema suele vivir dentro de un mismo proceso, o dentro de unos pocos límites bastante visibles.

En una arquitectura distribuida eso cambia mucho.

Ahora puede pasar que:

- una request entre por un gateway
- salte a un servicio de autenticación
- después a uno de órdenes
- dispare una reserva de inventario
- publique un evento
- otro consumidor procese ese evento más tarde
- un servicio de pagos consulte a un proveedor externo
- parte del flujo falle recién varios segundos después

Y cuando algo se rompe, la pregunta deja de ser solamente:

**“¿qué línea falló?”**

Ahora también necesitás responder:

- qué servicio participó
- en qué orden ocurrió cada cosa
- qué dependencia introdujo la latencia
- qué parte del flujo quedó incompleta
- qué error fue causa y cuál fue consecuencia
- qué pasó en sincronía y qué pasó en diferido

Ahí entra la observabilidad.

Y conviene entenderla bien.

Porque en sistemas distribuidos, sin observabilidad suficiente, operar producción se vuelve una mezcla de intuición, suposiciones y búsqueda manual desesperada.

## Qué significa observabilidad en este contexto

La palabra suele usarse mucho, a veces de forma medio inflada.

En términos prácticos, observabilidad apunta a esto:

**tener señales suficientes para entender qué está pasando adentro del sistema a partir de su comportamiento externo e interno.**

No se trata solo de “guardar logs”.
Tampoco se trata solo de “tener dashboards lindos”.

Se trata de poder responder preguntas reales cuando el sistema:

- falla
- se degrada
- se vuelve más lento
- produce resultados inconsistentes
- empieza a comportarse distinto después de un cambio

En arquitectura distribuida, eso importa todavía más porque la complejidad ya no está toda en un solo lugar.
Está repartida.

## El problema central: ya no alcanza con mirar un solo proceso

En un sistema con muchos servicios, cada pieza ve solo una parte de la historia.

Por ejemplo:

- el gateway ve tráfico de entrada
- `orders` ve creación y transición de órdenes
- `inventory` ve reservas y liberaciones
- `payments` ve autorizaciones y rechazos
- un worker asíncrono ve eventos en cola
- el proveedor externo ve su propia parte del intercambio

Si cada parte registra cosas de manera aislada, el equipo termina con fragmentos sueltos.

Y entonces, ante un incidente, aparecen situaciones muy típicas:

- un servicio dice que respondió bien
- otro dice que nunca recibió nada
- un tercero procesó el evento dos veces
- nadie puede reconstruir el flujo completo
- cada dashboard parece contar una verdad parcial distinta

Ese es el punto clave:

**en sistemas distribuidos, la dificultad no es solo detectar señales; es poder correlacionarlas.**

## Los tres pilares más conocidos: logs, métricas y trazas

Aunque no sea la única forma de pensarlo, hay una triada muy útil para ordenar el tema.

## 1. Logs

Los logs cuentan eventos puntuales.

Ejemplos:

- “se recibió una request”
- “se validó un token”
- “falló una llamada al proveedor”
- “se publicó un evento”
- “se confirmó una reserva”

Son buenos para:

- ver contexto textual
- entender errores específicos
- auditar decisiones técnicas o de negocio
- reconstruir detalles finos de un caso puntual

## 2. Métricas

Las métricas resumen comportamiento agregado.

Ejemplos:

- cantidad de requests por minuto
- tasa de errores
- latencia p95
- tamaño de cola
- número de reintentos
- uso de CPU o memoria

Sirven para:

- detectar tendencias
- ver degradación general
- alertar
- comparar comportamiento a lo largo del tiempo

## 3. Trazas

Las trazas intentan reconstruir el recorrido completo de una operación a través de varios servicios.

Ejemplo:

- una request entra al gateway
- pasa por `orders`
- llama a `inventory`
- llama a `payments`
- publica un evento
- un worker termina el flujo

La traza permite ver ese recorrido como una unidad lógica.

Sirve para:

- entender latencia extremo a extremo
- encontrar cuellos de botella entre servicios
- ubicar qué dependencia está frenando todo
- reconstruir un flujo distribuido específico

## Ninguno de los tres alcanza por sí solo

Éste es un punto muy importante.

Hay equipos que guardan muchos logs pero casi no tienen métricas.
Otros tienen dashboards de métricas pero sin contexto detallado.
Otros instrumentan trazas pero no logran usarlas operativamente.

El problema es que cada señal responde preguntas distintas.

Por ejemplo:

- una métrica puede mostrar que subió la tasa de errores
- una traza puede mostrar que los errores se concentran después de llamar a `payments`
- los logs pueden mostrar que el proveedor devolvía `429` con cierta carga

Recién juntas, esas señales permiten diagnosticar bien.

## La diferencia entre monitoreo y observabilidad

No son exactamente lo mismo.

El monitoreo suele enfocarse más en:

- indicadores conocidos
- umbrales predefinidos
- alertas sobre condiciones esperadas

Por ejemplo:

- CPU > 80%
- errores 5xx por encima de cierto nivel
- cola con demasiados mensajes pendientes

La observabilidad va más allá.
Busca que el sistema esté instrumentado de forma tal que puedas investigar preguntas no previstas de antemano.

Por ejemplo:

- por qué las órdenes con cierto método de pago tardan más
- qué cambio introdujo latencia solo en un tenant
- qué combinación de retries y timeouts generó duplicados
- qué flujo asíncrono quedó a medio completar después de un deploy

Dicho simple:

**monitorear es ver señales conocidas; observar bien es poder explorar lo desconocido cuando algo raro aparece.**

## Qué vuelve más difícil la observabilidad en sistemas distribuidos

Hay varios factores.

## 1. La causalidad está repartida

El error visible puede aparecer en un servicio, pero la causa real puede estar en otro.

## 2. Hay asincronía

No todo pasa dentro de una misma request.
Hay eventos, colas, jobs, retries y procesamiento diferido.

## 3. La latencia se compone

Cada salto agrega:

- tiempo de red
- serialización
- validación
- espera en cola
- tiempo de dependencia externa

La latencia total ya no vive en un único lugar.

## 4. Las fallas son parciales

Un sistema puede estar “medio roto”.
No caído del todo.
Eso hace más difícil detectar patrones.

## 5. Hay mucho más volumen de señales

Más servicios implican:

- más logs
- más métricas
- más spans
- más cardinalidad
- más costo operativo

Sin criterio, la observabilidad se convierte en ruido caro.

## Correlation IDs: una pieza pequeña, pero importantísima

Uno de los conceptos más prácticos en observabilidad distribuida es el de **correlation ID**.

La idea es sencilla:

- una operación recibe un identificador
- ese identificador viaja por todos los servicios involucrados
- logs, métricas contextuales y trazas lo reutilizan

Eso permite unir piezas que de otro modo quedarían sueltas.

Por ejemplo, ante una orden fallida, un equipo puede buscar:

- el request original en el gateway
- las llamadas a `orders`
- la reserva en `inventory`
- el intento en `payments`
- el evento de compensación posterior

Sin correlación, cada servicio cuenta su historia separada.
Con correlación, al menos existe una forma razonable de reconstruir el relato completo.

## Trace IDs, Span IDs y propagación de contexto

Cuando se trabaja con tracing distribuido, suelen aparecer conceptos como:

- **trace ID**
- **span ID**
- contexto propagado entre servicios

La idea general es esta:

- una traza representa una operación de punta a punta
- cada tramo o suboperación se representa como un span
- cuando un servicio llama a otro, propaga el contexto
- el siguiente servicio continúa la misma historia distribuida

Esto suena técnico, pero en el día a día resuelve una necesidad muy concreta:

**no mirar solo eventos sueltos, sino una cadena causal completa.**

## Logs estructurados: mejor que texto caótico

Otro salto muy importante es dejar de pensar el log como una línea textual improvisada.

En producción, conviene mucho más emitir logs estructurados.

Por ejemplo, con campos como:

- timestamp
- level
- service
- environment
- traceId
- correlationId
- operation
- tenantId
- orderId
- errorCode
- durationMs

¿Por qué ayuda tanto?

Porque después podés:

- filtrar mejor
- agrupar mejor
- correlacionar mejor
- automatizar búsquedas
- cruzar señales con menos fricción

Un mensaje como:

- “falló el pago”

sirve poco.

En cambio, algo estructurado que diga:

- servicio
- operación
- proveedor
- tipo de error
- latencia
- correlación

sirve muchísimo más para investigar.

## Pero cuidado: loguear todo no es observar mejor

Éste es un error muy común.

Cuando falta visibilidad, la reacción impulsiva suele ser:

- “agreguemos más logs”

A veces ayuda.
Muchas veces no.

Porque un exceso de logs puede producir:

- ruido enorme
- costos altos de almacenamiento e indexación
- dificultad para encontrar lo importante
- exposición accidental de datos sensibles
- señales repetidas que no agregan valor

La observabilidad madura no consiste en emitir todo indiscriminadamente.
Consiste en emitir lo suficiente, con estructura, contexto y propósito.

## Métricas útiles en arquitectura distribuida

No todas las métricas valen igual.

Algunas son especialmente útiles.

## 1. Tasa de requests

Ayuda a entender carga y cambios de tráfico.

## 2. Tasa de errores

Permite detectar degradación funcional.

## 3. Latencia por percentiles

No alcanza con promedio.
Necesitás mirar p95, p99 y distribución.

## 4. Saturación de recursos

CPU, memoria, conexiones, hilos, colas, pool de conexiones.

## 5. Métricas de dependencias

Por ejemplo:

- latencia a bases
- latencia a proveedores externos
- errores por servicio dependiente
- timeouts
- circuit breaker opens

## 6. Métricas de negocio operativas

Muy importantes.

Ejemplos:

- órdenes creadas
- órdenes fallidas
- pagos rechazados
- reservas vencidas
- eventos en DLQ
- compensaciones disparadas

Porque a veces el sistema “técnicamente está arriba”, pero el negocio está sufriendo igual.

## Las métricas técnicas no cuentan toda la historia

Un sistema puede mostrar:

- CPU razonable
- latencia aceptable
- error rate moderado

Y aun así tener un problema grave de negocio.

Por ejemplo:

- pagos marcados como pendientes demasiado tiempo
- órdenes creadas pero no confirmadas
- eventos sin procesar para cierto tenant
- duplicación de conciliaciones

Por eso, en arquitectura distribuida, conviene combinar:

- métricas técnicas
- métricas de dependencia
- métricas de flujo de negocio

## Qué aportan las trazas que no aportan las métricas

Las métricas te dicen que hay un problema agregado.
Las trazas te ayudan a encontrar cómo se ve ese problema en un recorrido concreto.

Por ejemplo:

una métrica puede mostrar que la latencia del checkout subió.

La traza puede revelar que:

- el gateway no es el cuello
- `orders` responde rápido
- `inventory` tarda poco
- `payments` llama dos veces al proveedor
- el proveedor externo tarda mucho en responder
- además hay retries que alargan todavía más el flujo

Eso reduce muchísimo el tiempo de diagnóstico.

## Trazabilidad en flujos asíncronos

Acá el tema se pone más interesante.

Porque no todo sucede dentro del mismo request-response.

Puede pasar que:

- una request cree una orden
- se publique un evento
- un consumidor lo lea segundos después
- otro job procese un paso adicional minutos más tarde

Si no propagás correlación también por mensajes, colas y eventos, la historia se corta.

Entonces la observabilidad distribuida madura necesita pensar también en:

- contexto propagado en eventos
- IDs de operación de negocio
- correlación entre request síncrona y procesamiento diferido
- estado de colas y consumidores
- tiempos entre publicación y consumo

Porque muchas veces el incidente real no está en la request inicial.
Está en el tramo asíncrono que viene después.

## Un ejemplo concreto: checkout distribuido

Imaginemos este flujo:

1. el usuario confirma compra
2. `orders` crea la orden en estado `PENDING`
3. `inventory` reserva stock
4. `payments` intenta autorizar el cobro
5. se publica un evento `order-confirmed`
6. un worker dispara email y actualización de backoffice

Ahora imaginemos que usuarios reportan:

- la compra parece hecha
- el email no llega
- algunas órdenes quedan pendientes demasiado tiempo

Sin observabilidad suficiente, cada equipo puede defender una parte:

- `orders`: “yo la creé bien”
- `inventory`: “la reserva existe”
- `payments`: “el proveedor respondió 200”
- notifications: “yo no recibí nada”

Con buena observabilidad podrías reconstruir algo así:

- la request inicial tuvo latencia normal
- `payments` respondió bien
- el evento `order-confirmed` se publicó
- el broker lo aceptó
- el consumidor de notifications estaba degradado
- acumuló lag durante 18 minutos
- luego reprocesó en lote
- parte de los emails se enviaron tarde y parte fallaron por timeout del proveedor de correo

Eso ya es una historia operable.
No una colección de intuiciones separadas.

## Qué señales conviene mirar por servicio

Cada servicio debería exponer al menos una base razonable de señales.

## 1. Salud básica

- disponibilidad
- errores
- latencia
- saturación

## 2. Dependencias críticas

- llamadas salientes
- tiempo de respuesta por dependencia
- timeouts
- retries
- circuit breaker state

## 3. Operaciones de negocio clave

- comandos relevantes
- estados de transición
- rechazos importantes
- colas pendientes
- resultados finales

## 4. Contexto para debugging

- correlation IDs
- trace IDs
- entidades de negocio relevantes
- códigos de error consistentes

## Alertas buenas versus alertas inútiles

No todo umbral merece una alerta.

Una mala estrategia de alertas produce:

- fatiga
- ignorancia progresiva
- tickets irrelevantes
- on-call saturado

Las alertas valiosas suelen ser las que señalan:

- impacto real o inminente
- degradación sostenida
- pérdida de capacidad
- riesgo de incumplir SLO
- bloqueo de flujo de negocio

Por ejemplo, suele ser más útil alertar por:

- aumento sostenido de errores en checkout
- crecimiento fuerte de mensajes en DLQ
- latencia p95 de pagos muy por encima del umbral
- caída de throughput en un consumidor crítico

que por señales demasiado ruidosas o aisladas.

## El costo de la cardinalidad descontrolada

Éste es un tema muy práctico y a veces subestimado.

En observabilidad, algunas dimensiones pueden multiplicar brutalmente la cantidad de series o combinaciones.

Por ejemplo, etiquetar métricas por:

- userId
- requestId
- orderId
- email

suele ser mala idea para sistemas grandes.

Eso genera explosión de cardinalidad.
Y la explosión de cardinalidad trae:

- más costo
- peor performance en consultas
- dashboards lentos
- herramientas que se vuelven difíciles de operar

Hay que distinguir bien entre:

- campos útiles para logs o trazas puntuales
- etiquetas razonables para métricas agregadas

No todo campo contextual debería ser un label métrico.

## Sampling: a veces no conviene guardar todas las trazas

En sistemas grandes, capturar absolutamente todas las trazas puede ser costoso.

Entonces aparece el sampling.

La idea es seleccionar:

- una parte representativa del tráfico normal
- una mayor proporción del tráfico con error
- ciertos endpoints o flujos críticos con prioridad

Esto ayuda a equilibrar:

- costo
- visibilidad
- capacidad de diagnóstico

El criterio importante es no muestrear de manera que te quedes ciego justo en los caminos más relevantes.

## Observabilidad y cambios de arquitectura

Cada vez que agregás una nueva pieza distribuida, tu necesidad de observabilidad también cambia.

Por ejemplo:

- agregar un broker exige mirar lag, retries, DLQ y tiempo de procesamiento
- agregar un gateway exige trazabilidad de entrada, auth y routing
- agregar un proveedor externo exige métricas de latencia, error y fallback
- agregar jobs periódicos exige visibilidad de ejecución, duración y resultado

O sea:

**no alcanza con desplegar una pieza nueva; también hay que volverla visible operativamente.**

## Un error frecuente: dashboards bonitos pero poco accionables

A veces hay mucho esfuerzo puesto en visualizaciones, pero poca capacidad real de responder preguntas.

Se ven paneles con:

- muchos colores
- muchas líneas
- muchos numeritos

Pero cuando ocurre un incidente, nadie sabe bien:

- qué panel mirar primero
- cómo saltar del síntoma a la causa probable
- cómo correlacionar servicios
- qué flujo de negocio está afectado

Un dashboard vale cuando ayuda a decidir o investigar.
No cuando solo decora.

## Otro error frecuente: cada servicio instrumenta distinto

Si cada equipo usa nombres, campos y criterios distintos, la observabilidad global se vuelve difícil.

Por ejemplo:

- un servicio loguea `request_id`
- otro `correlationId`
- otro `trace-id`
- uno usa `userId`
- otro `customer_id`
- uno emite latencia en ms
- otro en segundos

Eso rompe consistencia.

Conviene acordar convenciones mínimas sobre:

- nombres de campos
- propagación de contexto
- taxonomía de errores
- nombres de operaciones
- unidades de tiempo
- etiquetas comunes por servicio y entorno

## Qué señales indican observabilidad débil

Hay varias bastante reconocibles.

## 1. Resolver incidentes depende de personas “que conocen el sistema de memoria”

Eso indica que las señales no son autosuficientes.

## 2. Los equipos discuten durante mucho tiempo qué servicio empezó el problema

Falta correlación clara.

## 3. La causa raíz aparece horas después, leyendo logs a mano sin estructura

Faltan trazas, contexto o modelos de consulta mejores.

## 4. Hay métricas de infraestructura, pero casi nada de flujo de negocio

Se ve la máquina, pero no el producto.

## 5. Los cambios introducen regresiones y nadie las detecta rápido

Faltan señales comparables y alertas útiles.

## Qué conviene decidir explícitamente

## 1. ¿Qué operaciones críticas queremos poder reconstruir de punta a punta?

Por ejemplo:

- checkout
- alta de tenant
- cobro recurrente
- reserva de inventario
- provisioning externo

## 2. ¿Qué contexto debe propagarse siempre?

- trace ID
- correlation ID
- tenant
- entorno
- operación

## 3. ¿Qué métricas son realmente accionables?

No todo merece un panel.

## 4. ¿Qué errores de negocio deben tener visibilidad propia?

No conviene esconderlos detrás de un simple 500 genérico.

## 5. ¿Cómo vamos a observar el procesamiento asíncrono?

Éste suele ser uno de los puntos más olvidados.

## 6. ¿Qué convención compartida van a seguir todos los servicios?

Sin eso, cada equipo instrumenta a su manera y después integrar cuesta mucho más.

## Una idea importante: observar no es solo detectar fallas

También sirve para entender comportamiento normal.

Por ejemplo:

- cuánto tarda realmente cierto flujo en hora pico
- qué dependencia domina la latencia
- qué operaciones tienen más retries
- qué tenants usan más cierta capacidad
- qué parte del sistema está más cerca del límite

Esa información ayuda a:

- rediseñar
- optimizar
- escalar mejor
- hacer capacity planning
- decidir prioridades técnicas con evidencia

## Cierre

La **observabilidad en arquitectura distribuida** no es un adorno ni una capa opcional que se agrega al final “si hay tiempo”.

Es parte del diseño real del sistema.

Porque cuando el backend se reparte en varios servicios, colas, procesos y dependencias, entender qué está pasando deja de ser trivial.

Y si no diseñás bien esa visibilidad, después vas a pagar el costo en:

- incidentes más largos
- diagnósticos más lentos
- discusiones confusas entre equipos
- regresiones que nadie detecta a tiempo
- decisiones de arquitectura tomadas a ciegas

La observabilidad madura combina:

- logs con contexto y estructura
- métricas útiles y accionables
- trazas que reconstruyen recorridos
- correlación entre señales
- visibilidad de flujos síncronos y asíncronos
- atención tanto a lo técnico como a lo que importa para el negocio

En un sistema distribuido sano, no solo importa que los servicios hablen entre sí.
También importa que el equipo pueda entender lo que esos servicios están haciendo cuando algo sale bien, cuando algo se degrada y cuando algo se rompe.

Porque en el mundo real, operar arquitectura distribuida no consiste solo en construir piezas.
Consiste también en poder verlas, relacionarlas y explicar su comportamiento con suficiente claridad como para mejorar el sistema sin adivinar.
