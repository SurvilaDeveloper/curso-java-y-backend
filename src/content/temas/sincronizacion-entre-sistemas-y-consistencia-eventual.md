---
title: "Sincronización entre sistemas y consistencia eventual"
description: "Cómo pensar la sincronización entre sistemas cuando los estados no se actualizan todos al mismo tiempo, qué significa consistencia eventual y por qué este tema es clave en integraciones y flujos distribuidos."
order: 84
module: "Integraciones y sistemas reales"
level: "intermedio"
draft: false
---

## Introducción

Cuando un sistema trabaja solo con su propia base de datos y resuelve todo dentro de una misma transacción, es relativamente fácil pensar que el estado final queda definido de forma inmediata y clara.

Pero cuando empezás a integrar varios sistemas, esa idea deja de ser tan simple.

Por ejemplo:

- tu backend crea una orden
- un proveedor externo procesa el pago
- otro sistema calcula el envío
- un webhook confirma un cambio
- una cola procesa tareas en segundo plano
- una sincronización posterior actualiza otros datos

En ese tipo de escenario, no todo cambia al mismo tiempo.

Y ahí aparecen dos conceptos muy importantes:

- **sincronización entre sistemas**
- **consistencia eventual**

Entender esto es clave para dejar de imaginar que todos los sistemas se actualizan en perfecta simultaneidad.

## Qué significa sincronización entre sistemas

Sincronizar sistemas significa lograr que dos o más sistemas mantengan información compatible o coherente respecto de ciertos datos, estados o eventos.

Por ejemplo:

- que tu sistema y una pasarela de pagos coincidan sobre el estado de un pago
- que tu inventario local y un sistema externo coincidan sobre stock
- que una orden local y una logística externa coincidan sobre el envío
- que un sistema interno y un sistema administrativo reflejen el mismo cliente o documento

A veces esa sincronización es inmediata.
Muchas veces no.

## Qué es consistencia eventual

La consistencia eventual es la idea de que distintos sistemas o componentes pueden no reflejar exactamente el mismo estado en el mismo instante, pero convergen a un estado consistente con el tiempo.

En otras palabras:

- ahora puede haber una diferencia temporal
- después de cierto procesamiento, reintentos o sincronización, ambos lados terminan alineándose

No significa “todo vale”.
No significa “el sistema puede quedar mal para siempre”.

Significa que aceptás que la convergencia puede tardar un poco y que esa transición forma parte del diseño.

## Ejemplo intuitivo

Supongamos este flujo:

1. el usuario paga
2. el proveedor registra el pago
3. tu sistema todavía no recibió el webhook
4. internamente la orden sigue figurando como pendiente
5. segundos después llega el webhook
6. un worker procesa el evento
7. la orden pasa a pagada

Durante ese lapso, hay una diferencia entre sistemas.

El proveedor ya sabe que el pago está aprobado.
Tu sistema todavía no.

Eso no siempre es un error.
A veces es parte normal del flujo distribuido.

## Por qué esto importa tanto

Porque muchos desarrolladores, al empezar, imaginan el sistema como si todo cambiara junto y de inmediato.

Pero en sistemas reales hay:

- latencia
- retries
- colas
- webhooks
- procesamiento diferido
- fallos temporales
- integraciones externas
- operaciones aceptadas pero no finalizadas
- estados transitorios

Si no entendés consistencia eventual, podés diseñar mal:

- los estados
- la experiencia de usuario
- la trazabilidad
- la recuperación ante fallos
- la lógica de negocio
- el soporte

## Cuándo aparece este problema

Aparece mucho cuando:

- integrás sistemas externos
- usás jobs y colas
- procesás eventos asincrónicos
- tenés tareas en background
- trabajás con microservicios o servicios separados
- hay flujos con confirmaciones posteriores
- existen varios sistemas dueños de distintas partes del proceso

O sea:

**es un problema muy frecuente una vez que dejás el mundo del request-response inmediato y único.**

## Consistencia fuerte vs consistencia eventual

Conceptualmente puede ayudarte pensar esta diferencia.

### Consistencia fuerte

Esperás que, al terminar una operación, todos los componentes relevantes reflejen inmediatamente el mismo estado.

### Consistencia eventual

Aceptás que durante un tiempo puede haber diferencias temporales, pero el sistema está diseñado para converger después.

No siempre una es “mejor” que la otra.
Depende mucho del contexto, del costo y del flujo.

## Por qué no siempre se puede tener consistencia fuerte

Porque a veces implicaría:

- demasiado acoplamiento
- demasiada espera en tiempo real
- dependencia excesiva de sistemas externos
- baja tolerancia a fallos
- operaciones lentas o frágiles
- mayor complejidad transaccional

Por ejemplo, si para confirmar una orden tuvieras que esperar que:

- el pago se confirme
- el stock externo se sincronice
- la logística externa responda
- el email salga
- el reporte analítico se actualice

todo dentro del mismo request, el sistema sería mucho más frágil.

A veces conviene aceptar consistencia eventual y modelarla bien.

## Estados transitorios

Para trabajar bien con este tipo de flujos, los estados transitorios son muy importantes.

Por ejemplo, en vez de usar solo:

- `PAID`
- `NOT_PAID`

quizá conviene tener también:

- `PAYMENT_PENDING`
- `PAYMENT_PROCESSING`
- `PAYMENT_CONFIRMED`
- `PAYMENT_FAILED`

Eso ayuda a representar mejor lo que realmente está pasando.

Lo mismo puede pasar con:

- envíos
- importaciones
- documentos
- archivos
- sincronizaciones
- conciliaciones

## Ejemplo con órdenes

Supongamos un e-commerce.

La orden podría pasar por estados como:

- `CREATED`
- `PAYMENT_PENDING`
- `PAID`
- `CANCELLED`
- `SHIPPING_PENDING`
- `SHIPPED`

Si además dependés de sistemas externos, algunos de esos estados pueden durar más o menos tiempo según:

- latencia
- webhooks
- reintentos
- disponibilidad del proveedor

Si intentás reducir todo a “pagado o no pagado”, quizás el modelo te quede demasiado pobre para explicar la realidad.

## Qué ve el usuario mientras el sistema converge

Este punto es muy importante.

La consistencia eventual no es solo una cuestión técnica.
También impacta en UX.

Por ejemplo, si el sistema todavía está esperando confirmación, ¿qué le mostrás al usuario?

- “Pago pendiente”
- “Estamos procesando tu pago”
- “Tu orden fue recibida y estamos esperando confirmación”
- “Volvé a consultar en unos minutos”

Mostrar esto bien puede evitar:

- confusión
- soporte innecesario
- duplicación de acciones
- desconfianza del usuario

## Qué ve soporte

También importa mucho para operación y soporte.

Si soporte abre una orden, debería poder entender:

- qué pasó
- en qué estado está
- si está pendiente de proveedor
- si hubo webhook
- si hubo retries
- si quedó desincronizada
- si necesita reconciliación

Por eso los estados y trazas importan tanto.

## Fuentes de desincronización

Hay muchas causas posibles.

Por ejemplo:

- webhook que tarda
- job pendiente
- error temporal
- retry no completado
- proveedor lento
- integración caída
- fallo parcial
- dato aceptado pero no procesado aún
- orden local guardada antes de la confirmación externa
- cambio externo que todavía no llegó internamente

Si entendés estas fuentes, diseñás mejor.

## Sincronización por request directo

En algunos casos, la sincronización se intenta resolver consultando directamente al otro sistema en tiempo real.

Por ejemplo:

- pedir estado actual del pago
- consultar disponibilidad actual de stock
- verificar estado del envío

Esto puede servir, pero no siempre alcanza.

¿Por qué?

Porque:

- puede fallar
- puede ser lento
- puede tener rate limits
- puede dar un estado intermedio
- no siempre querés depender del proveedor en cada pantalla o acción

## Sincronización por eventos

Otra estrategia común es usar eventos, como:

- webhooks
- mensajes
- colas
- notificaciones de cambios

Acá el sistema remoto avisa cuando algo pasa.

Esto suele ser más reactivo, pero también trae desafíos como:

- duplicados
- retrasos
- orden de llegada
- reintentos
- validación
- idempotencia

## Sincronización por reconciliación

Una estrategia muy importante en sistemas reales es la reconciliación.

Esto significa revisar periódicamente si tu sistema y el sistema externo siguen alineados.

Por ejemplo:

- consultar pagos pendientes
- revisar órdenes no confirmadas
- buscar envíos en estado dudoso
- verificar importaciones incompletas

La reconciliación sirve para reparar lo que el flujo ideal no resolvió perfectamente.

## Ejemplo conceptual de reconciliación

Supongamos que un webhook nunca llegó.

Tu sistema dejó una orden como `PAYMENT_PENDING`.

Una tarea programada podría:

1. buscar órdenes pendientes viejas
2. consultar el proveedor
3. verificar el estado real
4. corregir el estado interno si hace falta
5. dejar trazabilidad de la reparación

Esto es muy común y muy valioso.

## Aceptar la eventualidad no significa resignarse al caos

Este punto es clave.

Consistencia eventual no significa:

- “ya fue, que cada sistema tenga lo que quiera”
- “si queda distinto, no importa”
- “el usuario que espere y vea”
- “si algún día converge, mejor”

No.

Significa que:

- aceptás diferencia temporal
- la modelás
- la hacés visible
- la hacés operable
- definís estrategias de convergencia
- prevenís estados eternamente ambiguos

## Qué decisiones de diseño importan mucho

Cuando hay consistencia eventual, importan mucho decisiones como:

- qué sistema es fuente de verdad en cada dato
- qué estados transitorios existen
- qué eventos disparan cambios
- qué pasa si un evento no llega
- cómo se reintenta
- cómo se reconcilia
- qué ve el usuario
- qué ve soporte
- cuánto tiempo puede durar un estado pendiente
- cuándo algo se considera fallido

## Fuente de verdad

No siempre todos los sistemas son igual de “dueños” de un dato.

Por ejemplo:

- el proveedor de pagos puede ser fuente de verdad del estado del pago
- tu sistema puede ser fuente de verdad del estado de la orden
- la logística puede ser fuente de verdad del tracking
- tu sistema puede ser fuente de verdad de la relación entre orden y usuario

Pensar eso ayuda mucho a no mezclar responsabilidades.

## Relación con idempotencia

Cuando hay consistencia eventual, suele haber retries y eventos repetidos.

Entonces la idempotencia importa muchísimo.

Por ejemplo:

- el mismo webhook llega dos veces
- una tarea de reconciliación reintenta
- una cola reprocesa un mensaje

Si el procesamiento no es idempotente, la convergencia puede volverse caótica.

## Relación con jobs y colas

Muchas veces la consistencia eventual se materializa gracias a procesamiento diferido.

Por ejemplo:

- se recibe un evento
- se encola un job
- se actualiza el estado luego
- si falla, se reintenta

Eso significa que entender jobs y colas ayuda mucho a entender cómo convergen los estados en sistemas reales.

## Relación con diseño de producto real

Este tema también conecta directo con producto.

Porque no alcanza con que los sistemas “eventualmente se alineen”.
También importa:

- qué siente el usuario mientras tanto
- qué entiende soporte
- cómo se explican los estados
- cuándo se dispara una alerta
- cómo se evita duplicación de acciones

## Qué errores aparecen si no pensás esto bien

Algunos errores comunes son:

- estados demasiado binarios para un flujo realmente distribuido
- UX que promete confirmación inmediata donde no existe
- soporte que no sabe interpretar estados intermedios
- lógica que asume sincronía perfecta
- reintentos que duplican efectos
- reconciliación inexistente
- datos divergentes sin estrategia de reparación
- usuarios repitiendo acciones porque no entienden el estado actual

## Buenas prácticas iniciales

## 1. Modelar estados transitorios de forma explícita

Eso suele ser mejor que esconder la incertidumbre.

## 2. Definir fuente de verdad por cada tipo de dato importante

Ayuda mucho a ordenar el diseño.

## 3. Diseñar cómo convergen los estados

No asumir que “de alguna manera va a pasar”.

## 4. Incorporar reconciliación donde haga falta

Especialmente en integraciones importantes.

## 5. Hacer visibles los pendientes y diferencias temporales

Para usuarios y soporte cuando corresponda.

## 6. Pensar idempotencia y retries desde el inicio

La eventualidad suele venir con reprocesamiento.

## 7. No prometer inmediatez si el flujo real no la tiene

Eso mejora honestidad del sistema y experiencia.

## Errores comunes

### 1. Diseñar como si todos los sistemas cambiaran juntos y al instante

Eso suele romperse rápido en producción.

### 2. No tener estados intermedios

Entonces el sistema no puede expresar lo que realmente está pasando.

### 3. Dejar divergencias sin estrategia de reparación

Después aparecen inconsistencias persistentes.

### 4. No definir quién es la fuente de verdad

Eso genera conflictos conceptuales.

### 5. No pensar en lo que ve el usuario durante la transición

Entonces la experiencia se vuelve confusa.

### 6. Tratar consistencia eventual como excusa para desorden

No es resignación, es diseño consciente.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué datos de un e-commerce pueden depender de otros sistemas y quedar momentáneamente desalineados?
2. ¿qué estado intermedio te convendría mostrar mientras esperás confirmación de pago?
3. ¿qué tarea de reconciliación te gustaría tener para reparar desincronizaciones?
4. ¿qué sistema sería la fuente de verdad del pago, del envío y de la orden?
5. ¿qué problema aparece si un usuario repite una acción porque no entendió que el sistema todavía estaba procesando?

## Resumen

En esta lección viste que:

- sincronizar sistemas significa mantener información coherente entre componentes o servicios distintos
- la consistencia eventual acepta que puede haber diferencias temporales antes de converger a un estado alineado
- este tema aparece mucho con integraciones externas, webhooks, jobs, colas y procesamiento asíncrono
- modelar estados transitorios ayuda a representar mejor la realidad del flujo
- reconciliación, idempotencia, retries y fuente de verdad son ideas fundamentales
- también importa mucho qué ven el usuario y soporte mientras el sistema todavía está convergiendo

## Siguiente tema

Ahora que ya entendés cómo funcionan la sincronización entre sistemas y la consistencia eventual en flujos distribuidos, el siguiente paso natural es aprender sobre **manejo de credenciales, secretos y configuración sensible**, porque toda integración seria también necesita proteger claves, tokens y datos operativos críticos de forma segura y mantenible.
