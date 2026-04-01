---
title: "Cómo pensar consistencia eventual, duplicados y compensaciones cuando un flujo ya no ocurre todo junto"
description: "Entender qué cambia cuando una operación del backend atraviesa varios pasos, eventos o servicios, y por qué consistencia eventual, idempotencia, duplicados y compensaciones se vuelven conceptos centrales en sistemas distribuidos o desacoplados."
order: 93
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar la comunicación entre componentes o servicios usando:

- request-respuesta
- APIs internas
- eventos
- contratos
- sincronía
- asincronía
- acoplamiento temporal

Eso ya te dejó una idea muy importante:

> cuando varias partes del sistema tienen que colaborar, ya no alcanza con pensar solo en “llamar a otro componente”; también importa muchísimo si necesitás respuesta inmediata, si podés desacoplarte y qué costo trae cada forma de comunicación.

Pero apenas un flujo deja de ocurrir todo dentro del mismo proceso, en el mismo instante y bajo una única transacción local, aparece otra familia de preguntas muy importante:

- ¿qué pasa si una parte ya confirmó algo y otra todavía no?
- ¿qué pasa si llega el mismo evento dos veces?
- ¿qué pasa si un paso falló después de que otro ya había tenido éxito?
- ¿qué pasa si el sistema queda un rato “desalineado”?
- ¿cómo se recupera un flujo que quedó a medio hacer?
- ¿qué significa realmente “éxito” cuando la operación completa tarda varios pasos en cerrarse?

Ahí entran conceptos centrales de sistemas distribuidos y de flujos desacoplados:

- **consistencia eventual**
- **duplicados**
- **idempotencia**
- **compensaciones**
- **pasos parciales**
- **recuperación de flujos**

Este tema es clave porque, a partir de cierto punto, un backend ya no puede seguir pensando todas las operaciones como si fueran una única unidad perfectamente atómica donde todo sale bien o todo revierte mágicamente.

## El problema de querer que todo el sistema quede alineado en el mismo instante

Cuando uno empieza, el modelo mental suele ser algo así:

1. entra request
2. hago todo
3. si sale bien, todo quedó bien
4. si sale mal, nada quedó hecho

Ese modelo es muy cómodo y muchas veces funciona bien dentro de una operación local simple.
Pero cuando el flujo involucra:

- varios servicios
- eventos
- colas
- webhooks
- terceros
- pasos asíncronos
- tareas desacopladas

ese ideal empieza a romperse.

Porque pueden pasar cosas como:

- el pedido se creó, pero la notificación todavía no salió
- el pago se aprobó en el proveedor, pero tu sistema aún no procesó el webhook
- se publicó un evento y un consumidor lo procesó más tarde
- se disparó una tarea secundaria que todavía no terminó
- un servicio confirmó algo y otro quedó pendiente
- un mensaje llegó dos veces
- un paso falló después de que otro ya había dejado efectos

Entonces aparece una realidad muy importante:

> no siempre todo el sistema queda alineado al mismo tiempo.

Y eso no necesariamente significa que el diseño esté mal.
Puede ser parte natural del modelo.

## Qué significa consistencia eventual

Dicho simple:

> significa que distintas partes del sistema pueden no reflejar exactamente el mismo estado en el mismo instante, pero se espera que converjan a un estado consistente después de un tiempo razonable y bajo las reglas del flujo.

Esta definición es importantísima.

No significa:

- caos permanente
- incoherencia arbitraria
- “más tarde vemos”

Significa algo mucho más preciso:

- aceptás desalineaciones temporales
- pero diseñás el sistema para que se reconcilie

## Un ejemplo muy claro

Supongamos un flujo de pagos:

1. el backend inicia checkout
2. el proveedor procesa el pago
3. el proveedor aprueba
4. el webhook tarda unos segundos en llegar
5. tu sistema todavía muestra el intento como `PENDIENTE`
6. luego llega el webhook
7. tu sistema actualiza la orden a `PAGADO`

Durante unos segundos hubo una diferencia entre:

- el estado en el proveedor
- y el estado local de tu backend

Eso es consistencia eventual.

No es idealización.
Es realidad práctica de muchísimos sistemas.

## Por qué esto importa tanto

Porque si no aceptás esta realidad, podés caer en errores de diseño como:

- asumir sincronía donde no existe
- mostrar estados demasiado definitivos demasiado pronto
- marcar una operación como final sin confirmación real
- escribir código que explota ante estados intermedios normales
- intentar forzar transacciones imposibles entre sistemas externos

En cambio, cuando aceptás la consistencia eventual de forma consciente, empezás a diseñar mejor:

- estados intermedios
- UX
- reintentos
- webhooks
- eventos
- recuperaciones

Y eso vuelve el sistema mucho más realista.

## Qué son los estados intermedios y por qué son tan valiosos

Cuando un flujo se distribuye, muchas veces necesitás más que un simple:

- éxito
- fracaso

Empiezan a aparecer estados como:

- pendiente
- iniciado
- en proceso
- confirmado parcialmente
- procesando
- esperando webhook
- en reconciliación
- reintentando
- fallido recuperable
- compensado

Estos estados ayudan a modelar mejor la realidad del sistema.

Por ejemplo, `PENDIENTE` muchas veces no significa error.
Significa que el flujo todavía no terminó.

Y esa diferencia es enorme.

## Qué problema aparece con los duplicados

Este es uno de los grandes clásicos.

En sistemas distribuidos o con comunicación más desacoplada, puede pasar que el mismo mensaje, evento o webhook llegue dos veces.

Por ejemplo:

- el proveedor reintenta un webhook
- una cola entrega un mensaje otra vez
- un consumidor se reinicia
- un cliente reintenta una llamada
- una request se repite por timeout ambiguo
- una acción del usuario se dispara dos veces

Entonces la pregunta ya no es si va a ocurrir o no.
La pregunta más útil es:

> ¿qué hace tu sistema cuando ocurre?

## Por qué los duplicados no son una rareza

Porque muchos mecanismos reales priorizan entregar eventualmente antes que prometer una sola entrega perfecta.

Entonces es normal encontrarte con escenarios como:

- “este evento quizá llegue más de una vez”
- “si no pude confirmar procesamiento, vuelvo a mandarlo”
- “reintento la entrega para evitar perder el mensaje”

Eso hace que el backend necesite soportar duplicados razonablemente, no sorprenderse por ellos.

## Qué significa idempotencia

La idempotencia, a muy alto nivel, es la propiedad de una operación por la cual repetirla más de una vez no genera efectos incorrectos o duplicados no deseados.

Dicho más simple:

> si esta misma operación ocurre dos veces, el sistema no debería quedar peor ni multiplicar efectos incorrectamente.

No significa que “no pase nada”.
Significa que repetir la operación no rompe la semántica esperada.

## Un ejemplo simple

Supongamos un webhook que dice:

```text
payment.updated → APPROVED
```

Si ese webhook llega dos veces y tu sistema:

- marca la orden como `PAGADO`
- y la segunda vez detecta que ya estaba `PAGADO`
- y no vuelve a generar efectos peligrosos

entonces el procesamiento es bastante más idempotente.

En cambio, si cada repetición:

- vuelve a generar factura
- vuelve a mandar email crítico
- vuelve a acreditar saldo
- vuelve a crear movimientos

tenés un problema mucho más serio.

## Qué diferencia hay entre “repetir” y “duplicar efectos”

Este matiz es muy importante.

No te asusta tanto que el sistema procese algo dos veces.
Te asusta que procesarlo dos veces produzca consecuencias incorrectas.

Entonces el foco no es solo detectar repeticiones por deporte.
El foco es proteger la semántica del negocio.

## Un ejemplo muy claro

No es lo mismo repetir:

- “actualizar estado a `PAGADO` si no lo está”

que repetir:

- “crear una devolución de dinero”
- “crear un nuevo cobro”
- “emitir una nueva factura”
- “crear un nuevo envío”

Estas segundas acciones suelen ser mucho más peligrosas frente a duplicados.

## Qué relación tiene esto con referencias únicas

Muy fuerte.

Muchas veces la idempotencia se apoya en poder reconocer que “esto ya lo vimos”.

Por ejemplo, usando cosas como:

- id del evento externo
- externalPaymentId
- externalReference
- correlationId
- clave de idempotencia
- número de operación única
- combinación de identificadores relevantes

Sin una forma razonable de identificar repeticiones, la defensa frente a duplicados se vuelve mucho más difícil.

## Un ejemplo mental útil

Podés pensar así:

> si no puedo reconocer que este hecho ya fue procesado, me va a costar muchísimo volver mi sistema idempotente.

Esta idea ordena bastante el diseño.

## Qué son las compensaciones

Ahora vayamos a otra pieza muy importante.

A veces, en un flujo distribuido, no podés hacer un rollback mágico global de todo lo que ya ocurrió.

Por ejemplo:

- ya creaste algo localmente
- ya notificaste algo
- ya reservaste stock
- ya disparaste una acción externa
- y después falla un paso siguiente

En muchos de esos casos, no existe una “transacción universal” que revierta todo automáticamente.

Entonces aparece una idea muy importante:

> en vez de rollback perfecto global, a veces necesitás una acción compensatoria.

Es decir, una acción posterior que intenta neutralizar o corregir el efecto de un paso previo.

## Un ejemplo muy claro

Supongamos un flujo así:

1. creás una orden
2. reservás stock
3. iniciás cobro
4. el cobro falla definitivamente

Tal vez una compensación razonable sea:

- liberar stock
- marcar orden como cancelada
- registrar el intento fallido
- notificar al usuario

No “deshacer el tiempo”.
Sino ejecutar acciones que lleven el sistema a un estado consistente posterior.

## Por qué compensar no es lo mismo que rollback

Porque rollback suele sugerir:

- todo vuelve exactamente al estado previo
- sin rastros
- de manera inmediata y total

En sistemas distribuidos, eso muchas veces no existe.

La compensación es más realista:

- reconoce que algunas cosas ya pasaron
- decide cómo corregir o neutralizar
- deja una historia coherente del flujo

Eso es muchísimo más maduro para backend real.

## Qué relación tiene esto con pagos

Muy directa.

En pagos, por ejemplo, pueden aparecer cosas como:

- orden creada
- intento de cobro iniciado
- proveedor devuelve pendiente
- usuario abandona
- webhook llega tarde
- sistema local y proveedor se desalinean unos minutos
- llega un rechazo final
- se requiere cancelar o dejar expirar algo localmente

Ahí consistencia eventual, idempotencia y compensaciones aparecen por todos lados.

Por eso pagos es uno de los mejores ejemplos de este tema.

## Qué relación tiene esto con webhooks

También total.

Los webhooks combinan varios de estos problemas:

- pueden llegar tarde
- pueden llegar repetidos
- pueden llegar fuera de orden
- pueden traer estados intermedios
- pueden fallar en procesamiento

Entonces una integración seria con webhooks casi siempre necesita pensar en:

- idempotencia
- estado actual del dominio
- tolerancia a eventos repetidos
- procesamiento seguro de cambios de estado
- compensaciones o reconciliación si algo falló antes

## Qué significa que un evento llegue “fuera de orden”

A veces puede pasar que el sistema reciba eventos en un orden que no coincide exactamente con la intuición más cómoda.

Por ejemplo:

- un estado `PENDING`
- luego `APPROVED`
- o incluso reintentos de uno anterior
- o notificaciones atrasadas

Si el sistema asume ingenuamente que el orden siempre será perfecto, puede terminar retrocediendo o corrompiendo el estado local.

Por eso conviene pensar el procesamiento no solo en términos de “llegó un evento”, sino de:

- qué estado actual tengo
- qué transición es válida
- si este evento todavía tiene sentido
- si ya lo superó uno más reciente

## Qué relación tiene esto con reglas del dominio

Muy fuerte.

Porque la idempotencia y las compensaciones no son solo problemas técnicos.
También son problemas de negocio.

Por ejemplo:

- una orden pagada no debería volver a pendiente por un evento viejo
- un stock liberado no debería liberarse dos veces
- un reembolso no debería ejecutarse dos veces
- una factura ya emitida no debería reemitirse sin criterio

Esto muestra que el dominio tiene muchísimo que decir en estos flujos.

## Un ejemplo de regla útil

Podrías pensar algo como:

> “si el estado local ya es `PAGADO`, ignorar un evento repetido `APPROVED` y no volver a disparar efectos críticos”

Eso mezcla:

- negocio
- protección contra duplicados
- consistencia

Y es exactamente el tipo de criterio que hace fuerte a un backend real.

## Qué relación tiene esto con UX

También es importantísima.

Si el sistema trabaja con consistencia eventual, el frontend y la experiencia del usuario no pueden asumir siempre que todo será instantáneamente definitivo.

Por ejemplo:

- “tu pago está siendo procesado”
- “recibimos tu acción, estamos confirmando”
- “tu solicitud quedó pendiente de validación”
- “te avisaremos cuando el procesamiento termine”

Estas experiencias suelen ser mucho más honestas y sanas que fingir inmediatez total donde no la hay.

## Qué relación tiene esto con debugging y observabilidad

Total.

Cuando hay varios pasos, duplicados o compensaciones, necesitás poder reconstruir:

- qué pasó primero
- qué se repitió
- qué estado había
- qué acción compensatoria se ejecutó
- qué evento llegó después
- por qué algo quedó pendiente

Sin buena observabilidad, estos flujos se vuelven muchísimo más difíciles de entender.

## Qué relación tiene esto con diseño de APIs o contratos internos

Muy fuerte.

Si una operación puede repetirse o llegar en distintos tiempos, los contratos deberían ayudar a soportar eso.

Por ejemplo:

- referencias estables
- ids de operación
- claves de idempotencia
- estados explícitos
- mensajes con identificadores claros
- semántica razonable de retry

Esto hace que la consistencia eventual no sea solo una idea filosófica, sino algo soportado por tus contratos.

## Qué no conviene hacer

No conviene:

- asumir entrega exactamente una sola vez en todos los flujos
- asumir orden perfecto siempre
- asumir rollback global mágico entre sistemas separados
- modelar todo con solo “éxito/fallo” cuando en realidad hay varios estados
- ignorar duplicados como si fueran imposibles
- disparar acciones irreversibles sin una estrategia de idempotencia o compensación

Ese tipo de suposiciones suele romperse bastante rápido en sistemas reales.

## Otro error común

Tratar consistencia eventual como excusa para cualquier desorden.
No.
No significa “todo puede quedar como sea”.
Significa aceptar desalineaciones temporales, pero diseñar cómo converger y recuperarse.

## Otro error común

Creer que si una operación es asíncrona entonces ya no importa tanto su semántica.
En realidad, cuanto más pasos y más desacople hay, más importante suele volverse pensar bien estados, duplicados y recuperación.

## Otro error común

Diseñar compensaciones solo cuando ya hay un desastre en producción.
Conviene al menos pensar desde antes:
“si este paso posterior falla, ¿cómo vuelvo a un estado aceptable?”

## Una buena heurística

Podés preguntarte:

- ¿qué partes de este flujo pueden quedar temporalmente desalineadas?
- ¿qué estados intermedios necesito modelar?
- ¿qué pasa si el mismo evento llega dos veces?
- ¿cómo sabría que algo ya fue procesado?
- ¿qué acción compensatoria tendría sentido si un paso posterior falla?
- ¿qué parte de esto requiere idempotencia fuerte?
- ¿qué verá el usuario mientras el sistema todavía converge?

Responder eso te ayuda muchísimo a madurar flujos distribuidos.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque apenas el backend empieza a tener:

- pagos
- webhooks
- colas
- eventos
- notificaciones desacopladas
- varios componentes
- integraciones externas
- tareas asíncronas

la consistencia eventual deja de ser una teoría lejana y pasa a ser parte de la vida cotidiana del sistema.

## Relación con Spring Boot

Spring Boot puede convivir perfectamente con estos patrones, pero el framework no resuelve por vos:

- qué estados modelar
- qué acciones son idempotentes
- qué compensación tiene sentido
- cuándo aceptar consistencia eventual
- cómo converger sin romper negocio

Eso sigue siendo diseño del backend y del dominio.

Y justamente por eso este tema es tan importante.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando un flujo del backend atraviesa varios pasos, eventos o servicios, conviene dejar de pensar en éxito atómico perfecto y empezar a modelar estados intermedios, consistencia eventual, idempotencia frente a duplicados y acciones compensatorias, porque esa es una de las bases más reales para que un sistema distribuido siga siendo coherente aunque no todo ocurra al mismo tiempo ni una sola vez.

## Resumen

- En flujos distribuidos o desacoplados no siempre todo el sistema queda alineado en el mismo instante.
- La consistencia eventual acepta desalineaciones temporales, pero exige convergencia posterior.
- Los duplicados no son rarezas; muchos sistemas reales deben soportarlos de forma segura.
- La idempotencia protege al negocio frente a repeticiones no deseadas.
- Las compensaciones ayudan cuando ya hubo efectos parciales y no existe rollback global perfecto.
- Estados intermedios, referencias únicas y buena observabilidad se vuelven mucho más importantes.
- Este tema te mete de lleno en una de las realidades más centrales de sistemas distribuidos serios.

## Próximo tema

En el próximo tema vas a ver cómo pensar APIs gateway, edge o Backend for Frontend cuando hay varios servicios o módulos detrás, porque una vez que el backend deja de ser un bloque único para el cliente, también cambia mucho cómo se organiza la puerta de entrada al sistema.
