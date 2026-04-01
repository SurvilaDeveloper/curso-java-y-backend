---
title: "Cómo empezar a pensar mensajería, colas y brokers cuando lo asíncrono ya es parte real del sistema"
description: "Entender qué cambia cuando los eventos y tareas desacopladas dejan de ser algo ocasional y empiezan a necesitar una infraestructura más robusta, con colas, brokers y una forma más seria de coordinar productores y consumidores."
order: 101
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- caché
- lecturas rápidas
- datos derivados
- proyecciones
- frescura del dato
- invalidez
- tradeoffs entre performance y consistencia

Eso ya te dejó una idea muy importante:

> cuando el backend crece en tráfico y complejidad, ya no alcanza con leer siempre todo desde cero; a veces necesitás estructuras auxiliares para responder mejor, aunque eso te obligue a pensar más en consistencia, ownership y sincronización.

Ahora aparece otro paso muy natural cuando el sistema ya tiene:

- tareas desacopladas
- eventos
- reintentos
- jobs
- webhooks
- varios consumidores
- procesos que no conviene resolver dentro del request principal
- más volumen
- más dependencia de flujos asíncronos

La pregunta es:

> ¿qué pasa cuando publicar un evento o disparar una tarea ya no es algo ocasional, sino una parte estructural del sistema?

Porque al principio puede alcanzar con cosas simples como:

- un evento interno dentro del mismo proceso
- una tarea asíncrona sencilla
- un listener local
- una reacción secundaria poco crítica

Pero a medida que el sistema crece, aparecen necesidades como:

- garantizar mejor que un mensaje no se pierda
- desacoplar productor y consumidor con más seriedad
- soportar reintentos
- procesar en otro momento
- repartir trabajo entre consumidores
- aguantar volumen
- tolerar caídas parciales
- no depender de que todo ocurra en el mismo proceso o en el mismo instante

Ahí aparecen ideas muy importantes como:

- **mensajería**
- **colas**
- **brokers**
- **productores**
- **consumidores**
- **entrega**
- **reintentos**
- **dead letters**
- **asincronía más robusta**

Este tema es clave porque marca el momento en que “lo asíncrono” deja de ser una comodidad local y empieza a convertirse en una parte seria de la arquitectura del backend.

## El problema de tratar toda asincronía como si fuera solo un método que corre después

Cuando recién empezás a desacoplar tareas, es muy común pensar algo así:

- pasa algo importante
- disparo una tarea
- se ejecuta después
- listo

Ese modelo puede servir muchísimo para casos simples.
Pero empieza a quedarse corto cuando necesitás responder preguntas como:

- ¿qué pasa si el proceso cae antes de ejecutar esa tarea?
- ¿qué pasa si el consumidor falla?
- ¿qué pasa si tengo miles de tareas?
- ¿qué pasa si quiero varios consumidores?
- ¿qué pasa si quiero separar productor y consumidor en distintos procesos?
- ¿qué pasa si necesito reintentar?
- ¿qué pasa si un mensaje no pudo procesarse?
- ¿qué pasa si una instancia cae y otra debería seguir?

Ahí la asincronía deja de ser simplemente “hacerlo después” y empieza a necesitar una infraestructura más explícita.

## Qué significa mensajería en este contexto

Dicho simple:

> mensajería significa que una parte del sistema produce un mensaje o evento para que otra parte lo procese, sin necesidad de que ambas estén acopladas al mismo request ni a la misma ejecución inmediata.

La idea importante es esta:

- alguien **produce**
- algo **transporta o retiene**
- alguien **consume**

Y entre medio puede haber:

- tiempo
- volumen
- reintentos
- múltiples consumidores
- fallos parciales
- orden relativo
- garantías imperfectas o parciales de entrega

Esto ya es bastante más rico que una simple llamada directa.

## Qué es una cola

Podés pensar una cola como un lugar donde se deja trabajo pendiente para que alguien más lo consuma después.

A nivel intuitivo:

1. un productor deja un mensaje
2. el mensaje queda esperando
3. un consumidor lo toma
4. lo procesa
5. lo confirma o falla

La cola ayuda muchísimo a desacoplar temporalmente ambas puntas.

El productor ya no necesita que el consumidor esté listo en ese mismo milisegundo exacto.

## Qué es un broker

Un broker, a muy alto nivel, es el componente o sistema especializado en recibir, almacenar, enrutar y distribuir mensajes entre productores y consumidores.

No hace falta ahora meterte en herramientas concretas.
Lo importante es la idea arquitectónica:

> el broker permite que productores y consumidores no se hablen directamente siempre entre sí, sino a través de una infraestructura de mensajería.

Eso hace muchísimo más robusta la asincronía cuando el sistema crece.

## Una intuición muy útil

Podés pensar así:

### Evento local simple
“Pasó algo y otra parte del mismo backend reacciona”

### Mensajería con cola o broker
“Pasó algo y ahora ese hecho o tarea entra en una infraestructura donde puede ser transportado, retenido, consumido, reintentado o redistribuido”

Esta diferencia es enorme.

## Qué problema intenta resolver una cola

Resuelve varias tensiones a la vez.

Por ejemplo:

- no quiero bloquear el request principal
- no quiero perder la tarea si el consumidor no está listo ahora
- quiero separar productor y consumidor
- quiero tolerar picos de volumen
- quiero repartir trabajo
- quiero procesar luego
- quiero reintentar si falla
- quiero sacar el trabajo del hilo de la request

Todo esto vuelve muy valioso el uso de una cola en ciertos escenarios.

## Un ejemplo muy típico

Supongamos:

- se crea un pedido
- hay que enviar email
- registrar analytics
- generar comprobante
- sincronizar con otro sistema

Podrías hacerlo todo:

- dentro del request
- o con eventos locales

Pero si ese flujo ya es importante, repetido y con volumen, puede tener mucho sentido que una o varias de esas tareas se conviertan en mensajes enviados a una cola.

Entonces el pedido queda creado y ciertas tareas derivadas ya no dependen del timing exacto del request.

## Qué gana el sistema con esto

Muchísimo.

Por ejemplo:

- menor latencia en el request principal
- más desacople entre responsabilidades
- mejor tolerancia a consumidores lentos
- posibilidad de reintentar
- mejor absorción de picos
- menos presión para que todo ocurra ya
- mejor separación entre flujo transaccional principal y tareas derivadas

Estas son ventajas muy reales.

## Qué costos trae

También trae costos importantes.

Por ejemplo:

- más complejidad operativa
- más necesidad de observabilidad
- mensajes duplicados o reintentos
- consistencia eventual más explícita
- debugging más difícil
- necesidad de idempotencia
- más cuidado en los contratos de los mensajes
- más necesidad de pensar qué hacer si un mensaje no se procesa

Es decir:

> la mensajería resuelve problemas reales, pero también distribuye la complejidad de otra manera.

## Qué tipo de cosas suelen ser buenas candidatas para mensajería

Por ejemplo:

- notificaciones
- emails
- generación de PDFs
- indexaciones
- analytics
- sincronización con sistemas externos
- tareas derivadas de eventos del dominio
- procesamiento que puede esperar
- pasos que no conviene ejecutar dentro del request principal
- cargas de trabajo que pueden repartirse

No significa que todo eso deba ir sí o sí a colas.
Pero son señales bastante frecuentes.

## Qué tipo de cosas suelen ser peores candidatas

Por ejemplo:

- decisiones que requieren respuesta inmediata y determinante
- validaciones que el usuario necesita ya para seguir
- pasos donde no tiene sentido retrasar la respuesta
- flujos donde la asincronía solo agregaría opacidad sin resolver un problema real

Otra vez, el criterio importa muchísimo más que la moda.

## Qué diferencia hay entre “evento” y “mensaje”

No siempre el lenguaje se usa con una separación rígida en todas partes.
Pero una intuición útil podría ser esta:

### Evento
Enfatiza que “algo ocurrió”.

### Mensaje
Enfatiza que “se envía algo para que sea procesado”.

A veces coinciden bastante.
Otras veces conviene distinguir si estás publicando un hecho del dominio o encolando una tarea más operativa.

No hace falta obsesionarse con una pureza terminológica total.
Lo importante es entender qué semántica estás queriendo expresar.

## Qué relación tiene esto con productores y consumidores

Es la base del modelo.

### Productor
Es quien emite o publica el mensaje.

### Consumidor
Es quien lo recibe y lo procesa.

El gran valor de la mensajería es que ambos pueden estar mucho más desacoplados:

- no tienen que correr en el mismo momento exacto
- no siempre tienen que conocerse directamente
- no tienen que vivir en el mismo proceso
- pueden escalar distinto
- pueden fallar de forma más independiente

Eso vuelve al sistema más flexible, aunque también más complejo de seguir.

## Un ejemplo mental muy claro

Podés pensar así:

1. `orders` crea un pedido
2. publica un mensaje `PedidoCreado`
3. `notifications` lo consume
4. `analytics` lo consume
5. otro consumidor dispara integración externa

`orders` ya no necesita esperar a que todas esas partes respondan una por una.

Eso es potentísimo cuando el sistema tiene múltiples reacciones derivadas.

## Qué relación tiene esto con picos de volumen

Muy fuerte.

Imaginá que llegan mil eventos en poco tiempo.

Si cada productor tuviera que ejecutar todo inmediatamente, podrías saturar varias capas del sistema.
En cambio, una cola permite absorber ese pico y dejar que los consumidores procesen a un ritmo razonable.

Eso no resuelve mágicamente todo.
Pero sí ayuda muchísimo a desacoplar ingreso de trabajo y ritmo de procesamiento.

## Qué relación tiene esto con retry

También es central.

En mensajería es muy común que un consumidor falle temporalmente.
Entonces necesitás pensar:

- ¿se reintenta?
- ¿cuántas veces?
- ¿cuándo?
- ¿qué pasa si siempre falla?
- ¿qué pasa si el mensaje ya produjo un efecto parcial?

Esto conecta directo con todo lo que ya viste sobre idempotencia, duplicados y consistencia eventual.

## Qué relación tiene esto con idempotencia

Absolutamente total.

Porque en sistemas con colas o brokers, muy a menudo tenés que aceptar algo como:

> este mensaje podría procesarse más de una vez o podría intentarse de nuevo.

Entonces el consumidor no puede ser ingenuo.
Tiene que pensar:

- si esto ya se aplicó
- si repetirlo duplica efectos peligrosos
- si el estado actual todavía permite esta transición
- cómo reconoce mensajes repetidos

Es decir, la mensajería robusta y la idempotencia están fuertemente unidas.

## Qué pasa si un mensaje no se puede procesar nunca

Acá aparece otra idea importante.

No todo error merece retry infinito.

A veces el mensaje:

- está mal formado
- quedó viejo
- viola una regla
- apunta a un recurso que ya no existe
- entra en un estado imposible
- o revela un bug serio

Entonces necesitás alguna estrategia para no dejarlo ciclando eternamente.

En muchos sistemas aparece una idea como:

- separar mensajes problemáticos
- marcarlos
- moverlos a una cola de error o análisis
- investigarlos aparte

No hace falta ahora entrar a todos los patrones formales, pero conviene captar el problema.

## Qué es una dead letter, a nivel intuitivo

Podés pensarla como un lugar donde van a parar mensajes que ya no pudieron procesarse correctamente tras ciertos intentos o reglas.

Es decir:

- no se pierden silenciosamente
- pero tampoco traban eternamente el flujo principal
- quedan apartados para análisis o tratamiento especial

Esta idea es muy importante para que la mensajería robusta no se convierta en una máquina de reintentos ciegos.

## Qué relación tiene esto con observabilidad

Muy fuerte.

En sistemas con colas y brokers necesitás todavía más visibilidad sobre cosas como:

- cuántos mensajes se producen
- cuántos se consumen
- cuánto tardan
- cuántos fallan
- cuántos se reintentan
- cuántos van a dead letter
- qué consumidores están lentos
- qué backlog se está acumulando

Porque si no, lo asíncrono se vuelve una caja negra peligrosamente cómoda.

## Qué relación tiene esto con contratos de mensajes

También es central.

Un mensaje no es solo “un JSON que mando”.
Es un contrato que otros van a consumir.

Entonces importan cosas como:

- forma del payload
- semántica
- versión
- campos opcionales o no
- ids de correlación
- referencias del dominio
- estabilidad razonable
- compatibilidad entre productor y consumidor

Esto se conecta directamente con el tema anterior de contratos internos y compatibilidad.

## Qué relación tiene esto con ownership

También importa mucho saber:

- quién produce este mensaje
- quién es dueño de su semántica
- quién lo puede cambiar
- quiénes lo consumen
- qué significa exactamente que este evento ocurra

Sin eso, la mensajería puede volverse muy difícil de gobernar.

## Qué relación tiene esto con BFF, APIs internas y request-respuesta

La mensajería no reemplaza automáticamente a la comunicación síncrona.

Sigue habiendo muchos casos donde request-respuesta es mejor porque necesitás una respuesta ya.

La mensajería gana más valor cuando:

- no necesitás respuesta inmediata
- querés desacoplar
- querés absorber volumen
- querés repartir trabajo
- querés reacciones derivadas
- no querés inflar el request principal

No es una bala de plata.
Es otra herramienta con su tradeoff.

## Qué no conviene hacer

No conviene:

- meter un broker porque suena más “escalable” aunque el sistema no lo necesite
- usar colas para esconder diseño confuso
- mandar mensajes sin pensar contratos ni ownership
- reintentar indefinidamente todo
- ignorar idempotencia
- creer que lo asíncrono mágicamente resuelve el problema del negocio
- no observar backlog, fallos o retries

Ese tipo de decisiones suele traer bastante dolor.

## Otro error común

Pensar que publicar un evento ya resolvió toda la confiabilidad del flujo.
No.
Todavía queda pensar:

- entrega
- consumo
- reintentos
- duplicados
- observabilidad
- compensaciones
- errores irreversibles

La mensajería seria empieza justamente donde termina la ingenuidad de “mandar y listo”.

## Otro error común

Crear demasiados mensajes o demasiada fragmentación asíncrona sin una semántica clara.
Eso puede volver el sistema opaco y difícil de seguir.

## Otro error común

No distinguir entre:
- evento de negocio
- tarea técnica
- comando implícito
- señal operativa

Mezclar todo bajo la palabra “evento” puede terminar generando bastante confusión.

## Una buena heurística

Podés preguntarte:

- ¿esta tarea realmente necesita desacoplarse del request principal?
- ¿si el consumidor falla, qué debería pasar?
- ¿qué pasa si este mensaje llega dos veces?
- ¿cómo observamos backlog y errores?
- ¿qué contrato exacto están asumiendo productor y consumidor?
- ¿esto necesita respuesta inmediata o puede procesarse después?
- ¿estoy resolviendo un problema real de latencia, volumen o desacople, o solo agregando complejidad?

Responder eso te ayuda muchísimo a decidir cuándo la mensajería robusta realmente vale la pena.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque apenas el sistema empieza a tener:

- reacciones derivadas importantes
- varios consumidores
- tareas desacopladas
- picos de volumen
- múltiples integraciones
- varios módulos o servicios
- necesidad de reintentos y resiliencia

la mensajería deja de ser una curiosidad y pasa a ser una parte seria de la arquitectura.

## Relación con Spring Boot

Spring Boot puede convivir perfectamente con este tipo de arquitectura, pero el framework no decide por vos:

- qué merece una cola
- qué merece un broker
- qué contrato debe tener un mensaje
- qué reintentos tienen sentido
- qué consumidores deberían existir
- cómo se observa y se recupera un flujo asíncrono

Eso sigue siendo diseño de sistema.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando lo asíncrono deja de ser algo ocasional y se vuelve parte importante del backend, conviene pensar mensajería, colas y brokers como una infraestructura para desacoplar productores y consumidores con más seriedad, aceptando a cambio nuevas responsabilidades sobre contratos, reintentos, idempotencia, observabilidad y tratamiento de errores persistentes.

## Resumen

- Las colas y brokers aparecen cuando la asincronía ya necesita más robustez que un evento local simple.
- Ayudan a desacoplar, absorber volumen y sacar trabajo del request principal.
- No reemplazan toda comunicación síncrona ni eliminan complejidad; la redistribuyen.
- Retry, duplicados, idempotencia y dead letters se vuelven centrales.
- Los mensajes también son contratos y necesitan ownership, semántica y evolución cuidadosa.
- Observabilidad sobre backlog, fallos y consumidores es parte esencial del diseño.
- Este tema abre una etapa más madura del backend donde la coordinación asíncrona ya es una pieza estructural del sistema.

## Próximo tema

En el próximo tema vas a ver cómo pensar procesamiento batch, jobs programados y tareas periódicas cuando el sistema ya tiene trabajo que no depende de una request ni de un evento puntual, porque no todo lo que el backend hace nace de tráfico online.
