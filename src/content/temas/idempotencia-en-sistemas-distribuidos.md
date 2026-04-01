---
title: "Idempotencia en sistemas distribuidos"
description: "Qué significa realmente la idempotencia cuando hay reintentos, duplicados e incertidumbre entre servicios, por qué es una pieza central de los sistemas distribuidos, y cómo diseñarla sin confundirla con simple deduplicación superficial." 
order: 163
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

## Introducción

En un sistema monolítico y local, muchas operaciones parecen simples.

Llega una petición.
Se ejecuta una vez.
Devuelve una respuesta.
Y listo.

Pero cuando el sistema empieza a distribuirse, el mundo cambia.

Aparecen:

- timeouts
- reintentos automáticos
- colas de mensajes
- eventos duplicados
- respuestas que nunca llegan
- conexiones que se cortan después de enviar la operación
- incertidumbre sobre si algo pasó o no pasó realmente

Y entonces aparece una pregunta muy seria:

**si el mismo pedido llega dos o tres veces, ¿el sistema termina bien o produce efectos duplicados?**

Ese es el terreno de la **idempotencia**.

La idempotencia es una de esas ideas que al principio suenan muy teóricas, pero en sistemas distribuidos se vuelve totalmente práctica.

Porque muchas veces el problema no es que una operación falle.
El problema es que no sabemos con certeza si falló o si se ejecutó pero perdimos la confirmación.

Y cuando eso pasa, el sistema necesita tolerar reintentos y duplicados sin romper el negocio.

Ése es el corazón de esta lección.

## Qué significa idempotencia

Una operación idempotente es una operación que puede ejecutarse varias veces con la misma intención sin producir efectos adicionales no deseados.

Dicho más simple:

**si repetís la misma operación lógica, el resultado de negocio debería equivaler a haberla hecho una sola vez.**

No significa necesariamente que:

- la respuesta técnica sea idéntica byte por byte
- no haya logs extra
- no aumente un contador de observabilidad
- no se registre que hubo reintentos

Lo que significa es que:

- el efecto de negocio principal no se duplica
- el estado final correcto no se corrompe
- el sistema puede absorber la repetición de la misma intención

## Un ejemplo intuitivo

Supongamos que un cliente intenta pagar una orden.

Envía la operación.
El servicio procesa el cobro.
Pero justo después la conexión se corta y el cliente no recibe la respuesta.

Entonces el cliente piensa:

- “no sé si el cobro se hizo o no”
- “voy a reintentar”

Si la operación no es idempotente, ese reintento puede:

- cobrar dos veces
- crear dos órdenes
- reservar stock dos veces
- disparar dos envíos

Si la operación sí es idempotente, el segundo intento debería comportarse como una repetición segura de la misma intención original.

No debería volver a cobrar.
No debería volver a crear otra orden.
No debería duplicar el efecto principal.

## Por qué la idempotencia importa mucho más en sistemas distribuidos

Porque en sistemas distribuidos el duplicado no es una rareza.
Es una posibilidad normal.

Puede aparecer por:

- clientes que reintentan por timeout
- balanceadores o gateways que repiten requests
- workers que reprocesan mensajes
- brokers que entregan más de una vez
- procesos de recuperación después de fallos
- jobs que se relanzan
- reconciliaciones que vuelven a empujar operaciones

En otras palabras:

**si el diseño asume implícitamente que cada operación llegará exactamente una vez, está asumiendo demasiado.**

Y eso suele salir caro.

## El mito de “exactly once”

Mucha gente entra al mundo distribuido con la esperanza de lograr algo así como:

- cada mensaje se procesa exactamente una vez
- cada petición se aplica exactamente una vez
- cada efecto ocurre exactamente una vez

En la práctica, eso es muy difícil de garantizar de punta a punta.

A veces una tecnología promete ciertos mecanismos cercanos a “exactly once” en un tramo concreto del sistema.
Pero cuando mirás el flujo completo, siguen existiendo:

- cortes de red
- reintentos del cliente
- procesos que se reinician
- integraciones externas
- side effects fuera de tu control

Por eso, una mirada madura suele partir de esta idea:

**más que confiar en una fantasía de “exactly once”, conviene diseñar operaciones que toleren “at least once” sin romper el negocio.**

Y para eso, la idempotencia es central.

## Idempotencia no es lo mismo que “hacer nada”

A veces se piensa mal este tema.

Una operación idempotente no significa:

- ignorar todo lo repetido sin mirar
- rechazar cualquier segundo intento automáticamente
- negarse a procesar la misma entrada nunca más

Puede significar varias cosas distintas según el caso:

- devolver el mismo resultado ya calculado
- reconocer que la operación ya fue aplicada
- mapear el reintento al mismo recurso creado antes
- confirmar que el estado ya es el correcto
- no volver a ejecutar el side effect principal

Lo importante no es la táctica exacta.
Lo importante es que la repetición de la misma intención no genere un segundo efecto de negocio indebido.

## Ejemplos donde la idempotencia es crítica

## 1. Creación de órdenes

Si un checkout reintenta por timeout y cada intento crea una orden nueva, terminás con compras duplicadas.

## 2. Cobros y pagos

Si el mismo intento de cobro puede aplicar el cargo más de una vez, el problema ya no es solo técnico.
Es de dinero real.

## 3. Reserva de stock

Si repetís la reserva varias veces, podés bloquear inventario inexistente.

## 4. Alta de usuarios o suscripciones

Sin control, podrías crear recursos duplicados o dejar estados inconsistentes.

## 5. Procesamiento de eventos

Si un consumidor recibe el mismo evento más de una vez y vuelve a aplicar el cambio, podés romper proyecciones, métricas o estados derivados.

## 6. Integraciones externas

Cuando no controlás completamente el otro lado, la idempotencia ayuda a absorber retries e incertidumbre con menos daño.

## Distintos tipos de operaciones y su relación con idempotencia

No todas las operaciones son iguales.

## 1. Operaciones naturalmente idempotentes

Por ejemplo:

- marcar una orden como `CANCELLED`
- asignar un estado fijo
- setear un flag a `true`

Si la repetís varias veces, el estado final sigue siendo el mismo.

Aun así, hay que cuidar side effects asociados.
Porque cambiar el estado puede ser idempotente, pero mandar una notificación en cada intento no lo es.

## 2. Operaciones que no son naturalmente idempotentes

Por ejemplo:

- crear una orden nueva
- cobrar dinero
- incrementar saldo
- descontar stock
- agregar puntos a una cuenta

Acá repetir la operación sí cambia el negocio.
Por eso necesitan algún mecanismo explícito de idempotencia.

## La forma más conocida: idempotency key

Uno de los mecanismos más usados es la **idempotency key**.

La idea es que el cliente envíe un identificador estable para representar una intención lógica única.

Por ejemplo:

- “quiero cobrar esta orden”
- “quiero crear esta compra”
- “quiero registrar este pago”

Entonces el servidor guarda la relación entre:

- clave idempotente
- operación lógica
- resultado o estado asociado

Si llega de nuevo la misma operación con la misma clave, el sistema reconoce que no es una intención nueva.
Es el mismo intento lógico repetido.

## Qué hace el sistema cuando ve la misma clave otra vez

Depende del diseño.

Podría:

- devolver la misma respuesta exitosa que devolvió antes
- devolver una respuesta equivalente que indique “ya estaba procesado”
- informar que la operación sigue en curso
- mapear al recurso ya creado previamente

Lo importante es esto:

**la segunda vez no debería crear un nuevo efecto principal.**

## Qué condiciones tiene que cumplir una buena idempotency key

## 1. Debe representar la misma intención lógica

No debería cambiar entre retries del mismo intento.

Si el cliente genera una clave nueva para cada reenvío, se pierde el objetivo.

## 2. No debería reutilizarse para otra operación distinta

Una misma clave para dos intenciones diferentes puede hacer que el sistema mezcle cosas que no corresponden.

## 3. Debe poder persistirse con suficiente duración

Si la ventana de retención es demasiado corta y los retries llegan más tarde, el sistema puede olvidar la operación anterior y duplicarla.

## 4. Debe validarse junto con el contexto correcto

No alcanza con mirar solo la clave desnuda.
Muchas veces conviene asociarla también a:

- usuario o tenant
- tipo de operación
- recurso objetivo
- hash o forma canónica del payload relevante

Eso reduce errores peligrosos.

## Un punto muy importante: misma clave no siempre implica mismo payload

Acá hay una trampa fina.

Supongamos que alguien reutiliza la misma idempotency key pero cambia datos importantes del request.

Por ejemplo:

- mismo identificador
- distinto monto
- distinta moneda
- distinta orden

¿Qué debería hacer el sistema?

La respuesta madura suele ser:

- no tratarlo como si fuera el mismo intento válido sin más
- detectar la inconsistencia
- rechazarlo o marcarlo como conflicto

Porque si la misma clave representa dos intenciones distintas, el contrato ya se rompió.

## Idempotencia en APIs HTTP

HTTP suele confundir un poco este tema.

Hay métodos que semánticamente se consideran más idempotentes, como:

- `PUT`
- `DELETE`

Y otros que típicamente no lo son, como:

- `POST`

Pero en sistemas reales la cosa no termina ahí.

Un `POST` puede volverse idempotente si le agregás una estrategia explícita.
Y un `PUT` puede dejar de ser seguro si detrás dispara efectos no controlados.

Entonces la enseñanza correcta no es:

- “tal verbo HTTP ya resuelve todo”

Sino:

- “la idempotencia real depende del efecto de negocio y de cómo modelás la operación completa”

## Idempotencia en mensajería y eventos

En colas y brokers este tema aparece todo el tiempo.

Muchos sistemas de mensajería favorecen una entrega **al menos una vez**.
Eso significa que un consumidor debe estar listo para recibir el mismo mensaje más de una vez.

Entonces aparecen estrategias como:

- registrar IDs de mensajes ya procesados
- usar claves de negocio para reconocer duplicados
- diseñar actualizaciones que sean naturalmente idempotentes
- convertir ciertos cambios en “set state” en lugar de “sumar otra vez”

Por ejemplo, no es lo mismo:

- `incrementarSaldo(100)`

que:

- `marcarPagoComoAplicado(paymentId=123, amount=100)`

La primera, si se repite, suma dos veces.
La segunda puede diseñarse de forma mucho más segura.

## Idempotencia y operaciones ambiguas

Éste es uno de los casos más importantes.

Una operación ambigua es aquella donde no sabés si se aplicó o no.

Por ejemplo:

- enviás un comando a otro servicio
- el timeout vence
- no sabés si el otro lado llegó a ejecutarlo

En ese escenario, tenés varias opciones maduras:

- reintentar con clave idempotente
- consultar estado con el identificador de la operación
- reconciliar después si sigue habiendo duda
- compensar si el flujo general lo requiere

La idempotencia no elimina la incertidumbre.
Pero sí evita que la incertidumbre se convierta en duplicación destructiva.

## Idempotencia no reemplaza observabilidad

Otra idea importante.

Aunque una operación sea idempotente, igual necesitás saber:

- cuántos retries ocurrieron
- cuántos duplicados absorbiste
- si hubo conflictos de clave
- cuánto tardó en resolverse la operación original
- si hubo respuestas ambiguas frecuentes

Porque si no, podés tener un sistema que “sobrevive” a duplicados pero está escondiendo un problema serio de fondo.

La idempotencia protege el negocio.
La observabilidad te ayuda a entender por qué necesitaste esa protección tan seguido.

## Errores comunes al implementar idempotencia

## 1. Guardar la clave demasiado tarde

Si primero ejecutás el side effect y después registrás la clave, una carrera o un fallo intermedio puede dejar la operación aplicada sin protección frente a retries.

## 2. Tratar la clave como un detalle cosmético

No es un header lindo para decorar una API.
Es parte del contrato operativo de la operación.

## 3. No persistir suficiente contexto

Guardar solo “vi esta clave” puede ser insuficiente.
Muchas veces conviene guardar también:

- estado de procesamiento
- resultado devuelto
- identificador del recurso creado
- payload relevante o su hash
- timestamps

## 4. No pensar en concurrencia

Si dos requests iguales llegan casi al mismo tiempo, el sistema debe evitar que ambos pasen como si fueran el primer intento.

## 5. Creer que deduplicar mensajes resuelve todo

A veces el duplicado no entra por el broker.
Entra por el cliente, por el gateway o por una integración externa.

La idempotencia no debería depender solo de un punto del pipeline.

## 6. Hacer idempotente el estado pero no los side effects

Tal vez la orden queda bien, pero:

- mandaste dos emails
- emitiste dos webhooks
- generaste dos asientos contables

La idempotencia tiene que mirarse sobre el flujo completo relevante.

## 7. Expirar demasiado rápido el registro de claves

Si el sistema olvida la operación antes de que termine la ventana real de retries, la duplicación vuelve a ser posible.

## 8. Confundir idempotencia con immutabilidad

No son lo mismo.
Una operación puede ser idempotente sin que el sistema entero sea inmutable.

## Idempotencia y modelado de comandos

Hay una decisión de diseño muy útil acá.

Muchas veces conviene modelar comandos de negocio como:

- aplicar esta intención única
- sobre este recurso
- con este identificador estable

En lugar de modelarlos como simples “acciones ciegas” repetibles sin contexto.

Por ejemplo, suele ser más robusto pensar:

- `registrarPago(orderId, paymentAttemptId)`

que:

- `sumarCobro(orderId, amount)`

El primero permite razonar mejor sobre repeticiones y reconciliaciones.
El segundo tiende a ser más peligroso ante duplicados.

## Idempotencia y consistencia eventual

En muchos sistemas distribuidos no conseguís confirmación instantánea perfecta.

Entonces una operación puede quedar en estados como:

- recibida
- procesando
- aplicada
- compensada
- fallida
- estado incierto en revisión

La idempotencia ayuda a que los retries durante esa ventana no empeoren el cuadro.

Es decir:

- no resuelve mágicamente toda la coordinación distribuida
- pero vuelve mucho más manejable la convivencia con consistencia eventual

## Cuándo la idempotencia es obligatoria de verdad

Hay contextos donde ya deja de ser una mejora opcional.

Por ejemplo:

- cobros
- órdenes
- facturación
- reservas
- altas con impacto económico
- integraciones con proveedores externos inestables
- consumidores de eventos con reprocesamiento
- sagas con reintentos y compensaciones

En todos esos casos, asumir “esto seguro llega una sola vez” suele ser ingenuo.

## Preguntas que conviene hacerse

## 1. ¿Qué pasa si esta operación se repite dos veces?

No a nivel técnico superficial.
A nivel negocio.

## 2. ¿Cómo identifico la misma intención lógica a través de retries?

Si no podés responder eso, probablemente la idempotencia todavía no está diseñada.

## 3. ¿Qué guardo para reconocer una repetición segura?

Clave sola, recurso creado, resultado, hash de payload, estado de procesamiento.
Todo eso importa.

## 4. ¿Qué pasa si el retry llega mientras el primer intento sigue corriendo?

El sistema tiene que tener una respuesta coherente también para ese caso.

## 5. ¿Qué side effects también deben ser protegidos?

No solo la escritura principal.
También emails, webhooks, eventos derivados o acciones contables.

## 6. ¿Durante cuánto tiempo necesito recordar esta operación?

La ventana de retención no debería elegirse al azar.

## 7. ¿Qué voy a hacer si hay conflicto entre misma clave y payload distinto?

Eso debe definirse explícitamente.

## Una mirada madura sobre el tema

La idempotencia no es un truco ornamental.
Es una respuesta concreta a una realidad del mundo distribuido:

- la red falla
- los clientes reintentan
- los mensajes se duplican
- las respuestas se pierden
- la certeza perfecta no siempre existe

Entonces, en lugar de pretender que el entorno se comporte impecablemente, el diseño maduro hace algo mejor:

**prepara al sistema para absorber repeticiones sin producir daño de negocio.**

Eso no vuelve trivial al sistema.
Pero sí lo vuelve mucho más seguro y operable.

## Idea final

En sistemas distribuidos, muchas veces el problema no es solo el error.
Es la duda.

No saber si una operación:

- no llegó
- llegó y falló
- llegó y se aplicó
- se aplicó pero la confirmación se perdió

Frente a esa duda, los retries son inevitables.
Y frente a retries inevitables, la idempotencia deja de ser un lujo.

Pasa a ser una defensa fundamental.

Por eso, diseñar idempotencia es diseñar para un mundo donde:

- hay duplicados
- hay incertidumbre
- hay reintentos
- y aun así el negocio tiene que mantenerse correcto

Ésa es la razón por la que la idempotencia ocupa un lugar tan importante en microservicios y sistemas distribuidos.
