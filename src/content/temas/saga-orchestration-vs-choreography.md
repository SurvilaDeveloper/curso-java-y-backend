---
title: "Saga orchestration vs choreography"
description: "Qué es una saga en sistemas distribuidos, por qué aparece cuando una transacción atraviesa varios servicios, en qué se diferencian la orquestación y la coreografía, y qué trade-offs conviene entender antes de elegir una estrategia." 
order: 162
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

## Introducción

Cuando una operación de negocio vive dentro de un solo servicio y una sola base de datos, la consistencia suele apoyarse en una transacción local.

Pero cuando el flujo atraviesa varios servicios, esa comodidad desaparece.

Por ejemplo:

- una orden se crea en un servicio
- inventario debe reservar stock
- pagos debe autorizar el cobro
- envíos debe preparar fulfillment
- notificaciones debe informar al usuario

Desde la mirada del negocio, todo eso parece parte de una sola operación más grande.

Desde la mirada técnica, no.

Son varios servicios.
Varias bases.
Varios pasos.
Varios posibles fallos parciales.
Y ningún `commit` único que abarque todo.

Ahí aparece uno de los problemas clásicos de sistemas distribuidos:

**¿cómo coordinamos una operación larga compuesta por varios pasos sin depender de una transacción distribuida global?**

Una de las respuestas más conocidas es la **saga**.

Y cuando uno empieza a trabajar con sagas, aparece enseguida otra pregunta importante:

**¿conviene coordinarlas con orchestration o con choreography?**

Ese contraste es el corazón de esta lección.

## Qué es una saga

Una saga es una forma de modelar una operación distribuida como una secuencia de pasos locales, donde cada servicio hace su parte y, si algo falla en el medio, se aplican acciones compensatorias para desarmar o neutralizar lo que ya se había hecho.

La idea base no es:

- todo confirma o revierte de forma atómica perfecta

La idea realista es:

- avanzamos paso a paso
- cada servicio confirma su cambio local
- si después algo sale mal, compensamos lo necesario

Dicho simple:

**una saga reemplaza la ilusión de una gran transacción distribuida por una coordinación explícita de pasos y compensaciones.**

## Por qué hace falta algo así

Supongamos un checkout distribuido.

Queremos hacer esto:

1. crear la orden
2. reservar stock
3. autorizar pago
4. generar envío
5. notificar confirmación

Si todo vive en un solo sistema con una sola base, una transacción podría resolver mucho.

Pero si cada paso pertenece a un servicio distinto:

- `orders`
- `inventory`
- `payments`
- `shipping`
- `notifications`

ya no hay una transacción simple que abarque todo.

Entonces pueden pasar cosas como:

- la orden se creó pero no había stock
- el stock se reservó pero el pago fue rechazado
- el pago se autorizó pero el envío falló
- el usuario recibió un email antes de que el flujo quedara realmente confirmado

La saga aparece para darle estructura a ese caos potencial.

## La idea de compensación

Un punto muy importante:

las compensaciones no son exactamente lo mismo que un rollback técnico tradicional.

En una base de datos, un rollback revierte cambios no comprometidos dentro de la misma transacción.

En una saga, en cambio:

- los pasos suelen haber sido confirmados localmente
- otros sistemas pueden haber reaccionado
- el tiempo puede haber pasado
- algunos efectos ya son visibles afuera

Entonces la compensación es otra cosa.

Por ejemplo:

- si reservaste stock, compensar puede ser liberar la reserva
- si autorizaste un pago, compensar puede ser cancelar o revertir la autorización
- si generaste un envío, compensar puede ser marcarlo como cancelado
- si mandaste un email, quizá no puedas “desenviarlo”; tendrás que emitir una corrección posterior

Esto ya muestra algo clave:

**una saga no vive en el terreno de la atomicidad perfecta, sino en el terreno de la coordinación, la reversibilidad parcial y la consistencia eventual.**

## Dos estilos principales

Hay muchas variantes, pero conceptualmente suelen aparecer dos grandes estilos.

## 1. Orchestration

Un componente central decide el flujo.

Ese coordinador:

- sabe qué paso sigue
- invoca o dispara a cada servicio
- interpreta resultados
- decide cuándo avanzar
- decide cuándo compensar

Es decir:

**hay una entidad explícita que conduce la saga.**

## 2. Choreography

No hay un coordinador central fuerte.

Cada servicio reacciona a eventos y, según lo que ocurre, publica nuevos eventos para que otros continúen el flujo.

Es decir:

**la saga emerge de la interacción entre servicios que escuchan y reaccionan.**

La diferencia puede parecer sutil al principio, pero cambia muchísimo la forma en que el sistema se entiende, se opera y se depura.

## Ejemplo simple de orquestación

Imaginemos una saga de creación de orden.

Un orquestador podría hacer algo así:

1. pedir a `orders` que cree la orden en estado `PENDING`
2. pedir a `inventory` que reserve stock
3. si salió bien, pedir a `payments` que autorice el pago
4. si salió bien, pedir a `shipping` que prepare el envío
5. si todo salió bien, pedir a `orders` que marque `CONFIRMED`
6. si algo falla, disparar compensaciones según corresponda

Por ejemplo:

- si falla pago después de reservar stock, ordenar liberación de stock
- si falla envío después del pago, ordenar cancelar pago y liberar stock

Acá el flujo está bastante explícito.

Hay un “director”.

## Ejemplo simple de coreografía

Ahora pensemos lo mismo pero con eventos.

Podría pasar así:

1. `orders` crea la orden y publica `OrderCreated`
2. `inventory` escucha `OrderCreated`, reserva stock y publica `StockReserved`
3. `payments` escucha `StockReserved`, autoriza pago y publica `PaymentAuthorized`
4. `shipping` escucha `PaymentAuthorized`, genera envío y publica `ShipmentCreated`
5. `orders` escucha `ShipmentCreated` y marca la orden como `CONFIRMED`

Si algo falla:

- `inventory` podría publicar `StockReservationFailed`
- `payments` podría publicar `PaymentFailed`
- otros servicios reaccionan con acciones compensatorias

Acá no hay un director visible que haga avanzar el flujo.
El flujo se construye a partir de eventos.

## Qué se siente mejor al principio

Mucha gente que entra al tema por primera vez siente esto:

- orchestration parece más pesada pero más clara
- choreography parece más elegante y desacoplada

Y algo de eso es verdad.

Pero con el tiempo aparecen matices.

## Ventajas de orchestration

## 1. El flujo queda explícito

Esto es enorme.

Uno puede leer el coordinador y entender:

- qué pasos existen
- en qué orden ocurren
- qué pasa si algo falla
- dónde se dispara cada compensación

Para flujos complejos, esa claridad vale muchísimo.

## 2. Más facilidad para razonar el proceso completo

Cuando alguien pregunta:

- “¿qué pasó con esta orden?”
- “¿en qué paso falló?”
- “¿por qué se compensó tal cosa?”

el orquestador suele ofrecer un lugar claro donde mirar.

## 3. Mejor control central de timeouts, retries y estados

El coordinador puede manejar de forma más coherente:

- reintentos
- expiraciones
- límites de espera
- transición de estados de saga
- escalamiento de errores

## 4. Más simple cuando el flujo es muy procedural

Hay procesos que naturalmente se parecen a:

- paso 1
- luego paso 2
- luego paso 3
- si falla en 3, hacé A y B

En esos casos, una orquestación explícita suele calzar muy bien.

## Costos de orchestration

## 1. Aparece un componente central importante

Eso implica:

- más responsabilidad concentrada
- más acoplamiento al flujo global
- más presión sobre ese componente

Si está mal diseñado, el orquestador puede transformarse en un mini-monolito de coordinación.

## 2. Puede invadir demasiado conocimiento de otros servicios

Un orquestador torpe empieza a saber demasiado sobre:

- reglas internas
- errores específicos
- estados de cada servicio
- detalles que deberían pertenecer al dueño del dominio local

Eso degrada los límites entre servicios.

## 3. Riesgo de coordinador gigante

Cuando todo termina pasando por el mismo componente central, pueden aparecer:

- sagas difíciles de mantener
- branching excesivo
- lógica duplicada
- coordinadores enormes y frágiles

## 4. Puede volverse un cuello de diseño

No siempre de rendimiento, pero sí de evolución.

Cada cambio de flujo pasa por ese coordinador.
Eso puede volverlo un punto muy sensible.

## Ventajas de choreography

## 1. Menor acoplamiento directo entre servicios

Cada servicio:

- escucha eventos relevantes
- hace su trabajo local
- emite nuevos eventos

Eso encaja bien con sistemas orientados a eventos.

## 2. Mejor alineación con ownership distribuido

Cada dominio conserva más autonomía.

Por ejemplo:

- `inventory` decide cómo reservar y liberar
- `payments` decide cómo autorizar y revertir
- `shipping` decide cómo crear y cancelar envíos

Nadie necesita controlar todos los detalles internos desde un centro.

## 3. Buena escalabilidad organizacional en algunos contextos

Cuando los equipos están realmente separados por dominios y trabajan fuerte con eventos, la coreografía puede permitir una evolución más independiente.

## 4. Se integra de forma natural con arquitectura event-driven

Si el sistema ya usa eventos como columna vertebral, la coreografía puede sentirse muy natural.

## Costos de choreography

## 1. El flujo global se vuelve más difícil de ver

Éste es probablemente el costo más importante.

Nadie tiene el mapa completo en un solo lugar.

Entonces entender el proceso implica reconstruirlo a partir de:

- eventos
- consumidores
- side effects
- timeouts
- compensaciones

A pequeña escala parece limpio.
A gran escala, puede volverse opaco.

## 2. Debuggear se vuelve bastante más difícil

Cuando algo falla, la pregunta ya no es solo:

- “¿qué método rompió?”

Sino:

- “¿qué evento no llegó?”
- “¿quién debía reaccionar y no reaccionó?”
- “¿hubo duplicados?”
- “¿se publicó el evento de compensación?”
- “¿qué servicio quedó desalineado?”

Sin muy buena observabilidad, esto se vuelve doloroso.

## 3. Riesgo de comportamiento emergente difícil de gobernar

Un servicio reacciona a un evento.
Otro reacciona al evento del primero.
Otro más toma una acción compensatoria.

Después de un tiempo, el flujo total ya no está realmente diseñado con nitidez.
Empieza a “emerger”.

Y eso puede ser peligroso.

## 4. Mayor dificultad para imponer orden global

Cuando el negocio necesita una secuencia muy clara y estricta, la coreografía puede complicar bastante la gobernanza del flujo.

## Una regla práctica muy útil

Si el proceso necesita que alguien lo **dirija** claramente, orchestration suele ser una señal fuerte.

Si el proceso puede modelarse como una serie de **reacciones locales a hechos de negocio**, choreography puede ser razonable.

No es una ley absoluta.
Pero ayuda mucho para pensar.

## Qué pasa con las compensaciones en cada modelo

## En orchestration

Normalmente el orquestador decide:

- qué compensación disparar
- en qué orden
- bajo qué condición
- hasta cuándo reintentar

Eso vuelve el manejo de fallos más explícito.

## En choreography

Las compensaciones suelen distribuirse.

Por ejemplo:

- `PaymentFailed` hace que `inventory` libere stock
- `ShipmentCreationFailed` hace que `payments` revierta el cobro
- `OrderCancelled` hace que otros servicios limpien su parte

Eso puede ser elegante, pero también más difícil de seguir mentalmente.

## Un error común: pensar que uno es moderno y el otro viejo

No.

No es:

- choreography = moderno
- orchestration = anticuado

Ni tampoco al revés.

Los dos son herramientas.
Los dos tienen costos.
Los dos pueden estar bien o muy mal usados.

Elegir bien depende del tipo de flujo, del dominio, de la complejidad operativa y de la madurez del equipo.

## Cuándo suele convenir orchestration

Suele ser muy razonable cuando:

- el flujo de negocio es largo y secuencial
- hay muchas compensaciones condicionales
- necesitás visibilidad clara del estado global
- el proceso tiene deadlines, timeouts o expiraciones importantes
- querés un lugar explícito para gobernar la saga
- el equipo necesita depuración y auditoría más directa

Ejemplos típicos:

- onboarding complejo de clientes
- provisioning empresarial
- checkout con muchas validaciones dependientes
- procesos administrativos largos con pasos claros

## Cuándo suele convenir choreography

Suele encajar mejor cuando:

- el sistema ya es fuertemente event-driven
- los dominios están bien separados
- cada servicio puede reaccionar de forma relativamente autónoma
- el flujo no necesita tanta dirección central explícita
- el costo de reconstruir el proceso es aceptable y está bien cubierto por observabilidad

Ejemplos posibles:

- propagación de eventos de dominio
- enriquecimiento progresivo de información
- pipelines distribuidos de reacción a hechos de negocio
- integraciones donde cada actor tiene comportamiento local bastante independiente

## Cuándo ambas cosas se mezclan

Esto pasa muchísimo en sistemas reales.

No siempre elegís una pureza total.

Puede haber:

- una saga principal orquestada
- y dentro de algunos pasos, servicios que se comunican por eventos

O al revés:

- una arquitectura bastante coreografiada
- con ciertos flujos críticos coordinados por un orquestador explícito

En la práctica, muchas arquitecturas maduras mezclan estilos según el problema.

## Relación con outbox pattern

El tema anterior ayuda mucho acá.

Si una saga depende de eventos entre servicios, la confiabilidad de publicación importa muchísimo.

Por eso, en sistemas event-driven, un outbox bien implementado suele ser una pieza muy útil para que:

- el paso local se confirme
- el evento que hace avanzar la saga no se pierda
- las compensaciones también puedan emitirse de forma confiable

Sin eso, una saga coreografiada puede romperse no por mala lógica, sino porque un evento crítico desapareció en el camino.

## Relación con idempotencia

Acá también vuelve una idea central.

En sagas distribuidas hay que asumir:

- retries
- duplicados
- mensajes fuera de orden en algunos casos
- incertidumbre parcial

Entonces los participantes de la saga deberían tolerar razonablemente:

- reintentos del mismo comando
- reprocesamiento del mismo evento
- compensaciones repetidas

Una compensación que rompe todo cuando llega dos veces no está lista para un entorno distribuido real.

## Errores comunes al diseñar sagas

## 1. No modelar estados intermedios

Pensar solo en:

- éxito final
- fracaso final

es pobre.

Las sagas suelen necesitar estados como:

- pending
- reserving
- payment_pending
- compensating
- failed
- cancelled
- completed

Sin eso, el flujo queda opaco.

## 2. No definir bien qué significa compensar

No alcanza con decir “si falla, deshacemos”.

Hay que precisar:

- qué se deshace
- cómo
- hasta cuándo
- con qué garantías
- qué pasa si la compensación también falla

## 3. Elegir choreography por moda

A pequeña escala parece hermoso.
Después nadie entiende el flujo completo.

## 4. Elegir orchestration y meter toda la lógica del mundo en un coordinador

Eso termina degradando límites de contexto y ownership.

## 5. Ignorar observabilidad

Sin trazabilidad de saga, correlación e historial de pasos, operar estos flujos se vuelve muy difícil.

## 6. No pensar timeouts y estados atascados

¿Qué pasa si un servicio nunca responde?
¿Esperamos para siempre?
¿Compensamos?
¿Marcamos intervención manual?

Eso también es parte del diseño.

## 7. No contemplar intervención operativa

Hay flujos donde, después de varios fallos, una persona debe mirar el caso.
No todo se resuelve automáticamente.

## Preguntas que conviene hacerse antes de elegir

## 1. ¿Necesitamos ver el flujo completo en un solo lugar?

Si la respuesta es sí, eso empuja bastante hacia orchestration.

## 2. ¿Los servicios pueden reaccionar de forma autónoma a eventos bien definidos?

Si la respuesta es sí, choreography puede funcionar mejor.

## 3. ¿El costo de depurar un flujo distribuido emergente es aceptable para este equipo?

Ésta es una pregunta muy real.

## 4. ¿Qué tan complejas son las compensaciones?

Si son muchas y muy condicionales, orchestration suele dar más claridad.

## 5. ¿Qué observabilidad tenemos disponible?

Sin tracing, correlación, métricas y estados visibles, choreography se vuelve bastante más riesgosa.

## 6. ¿Estamos resolviendo un problema real o copiando una moda arquitectónica?

Pregunta incómoda, pero muy necesaria.

## Una mirada madura sobre el tema

Lo más sano suele ser esto:

- no idealizar ninguno de los dos modelos
- elegir según el flujo real
- revisar el costo operativo además del diseño conceptual
- pensar no solo cómo se implementa, sino cómo se entiende y se depura después

Porque una arquitectura distribuida no se juzga solo por lo elegante que suena en un diagrama.
También se juzga por:

- qué tan operable es
- qué tan entendible es bajo presión
- qué tan bien tolera fallos parciales
- qué tan fácil resulta corregir un caso roto

## Idea final

Las sagas existen porque en sistemas distribuidos una operación grande rara vez puede apoyarse en una sola transacción global.

Entonces hay que coordinar pasos, aceptar fallos parciales y diseñar compensaciones.

Dentro de ese problema, **orchestration** y **choreography** son dos maneras distintas de organizar la coordinación.

La orquestación aporta:

- flujo explícito
- control central
- mayor claridad para gobernar y depurar

La coreografía aporta:

- menor acoplamiento directo
- mayor naturalidad en arquitecturas orientadas a eventos
- más autonomía local entre servicios

Pero ninguna de las dos elimina el costo central del mundo distribuido:

- incertidumbre
- duplicados
- reintentos
- compensaciones imperfectas
- necesidad de observabilidad

Por eso, más que preguntar cuál es “la correcta”, conviene preguntar:

**¿qué modelo vuelve este flujo más entendible, más gobernable y más recuperable cuando las cosas salen mal?**

Ésa suele ser la mejor brújula.
