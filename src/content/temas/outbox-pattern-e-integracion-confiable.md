---
title: "Outbox pattern e integración confiable"
description: "Qué problema resuelve el outbox pattern en sistemas distribuidos, por qué el dual write es peligroso, cómo combinar transacción local y publicación diferida de eventos, y qué prácticas vuelven una integración mucho más confiable en presencia de fallos, retries e incertidumbre." 
order: 161
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

## Introducción

Cuando un sistema empieza a integrarse con otros servicios, colas o brokers, aparece una necesidad muy común:

- guardar un cambio de negocio en nuestra base
- y además publicar un evento o mensaje para que otros reaccionen

Por ejemplo:

- se confirma una orden
- y queremos emitir `OrderConfirmed`

O esto:

- se registra un pago exitoso
- y queremos notificar a facturación, inventario o analytics

O esto:

- se crea una cuenta
- y queremos disparar onboarding, envío de email y provisión de recursos

A simple vista parece sencillo.

Uno podría pensar:

- guardo en la base
- publico el mensaje
- listo

Pero en sistemas reales ese “listo” esconde uno de los problemas más traicioneros de la arquitectura distribuida.

Porque esas dos cosas:

- persistir el cambio local
- publicar hacia afuera

no suelen ocurrir dentro de una misma transacción atómica global.

Y entonces aparece una pregunta delicada:

**¿qué pasa si una de las dos acciones sale bien y la otra falla?**

Ahí entra el **outbox pattern**.

No como un patrón elegante para lucirse en una entrevista, sino como una forma concreta de resolver una de las fuentes más frecuentes de inconsistencia en integraciones distribuidas.

## El problema del dual write

A este problema se lo suele llamar **dual write**.

Es la situación donde una misma operación intenta escribir en dos lugares distintos como si fuera una sola acción lógica.

Por ejemplo:

- actualizar la base de datos del servicio
- publicar un evento en Kafka, RabbitMQ o cualquier broker

O también:

- persistir una orden
- llamar a un servicio externo para propagar el cambio

El riesgo aparece porque esas dos escrituras no comparten la misma atomicidad.

Entonces pueden pasar combinaciones incómodas.

## Caso 1: la base confirma y el mensaje no sale

- la orden queda guardada como confirmada
- pero ningún otro sistema se entera

Resultado posible:

- inventario no reserva
- billing no factura
- analytics no registra el evento
- notificaciones no informa al usuario

Tu sistema local cree que la operación ocurrió.
El ecosistema alrededor, no.

## Caso 2: el mensaje sale y la base no confirma

- el broker recibe el evento
- pero la transacción local falla o se revierte

Resultado posible:

- otros servicios reaccionan a un hecho que en realidad nunca quedó confirmado localmente
- aparece una “verdad” afuera que no existe en la base fuente

Éste es incluso más peligroso, porque propagás una mentira operativa.

## Caso 3: no sabés si el mensaje salió o no

- intentaste publicar
- hubo timeout o error de red
- no tenés confirmación confiable

Entonces el sistema queda en incertidumbre:

- si reintentás, quizá duplicás
- si no reintentás, quizá perdiste el evento

Éste es el tipo de problema que el outbox pattern viene a domesticar.

## La idea central del outbox pattern

La idea es elegantemente pragmática:

**en lugar de intentar actualizar la base y publicar externamente en el mismo paso inseguro, escribís todo primero dentro de tu propia base local y dejás la publicación externa para un proceso posterior y controlado.**

Dicho simple:

1. hacés la operación de negocio normal
2. dentro de la misma transacción local guardás también un registro en una tabla outbox
3. otro proceso lee esa tabla y publica los mensajes pendientes
4. cuando el mensaje se publica correctamente, ese registro se marca como enviado o procesado

Así evitás el dual write inconsistente.

Porque ya no estás intentando hacer dos escrituras independientes al mismo tiempo.
Ahora hacés una sola transacción local sólida:

- cambio de negocio
- intención de publicación

ambas persistidas juntas.

## Qué garantiza realmente

El outbox pattern **no garantiza magia**.
No elimina todos los problemas distribuidos.
No evita duplicados por sí solo.
No convierte todo en exactly-once perfecto.

Lo que sí garantiza es algo muy valioso:

**si la operación de negocio local se confirmó, la intención de publicar también quedó persistida de forma durable.**

Eso cambia muchísimo el juego.

Porque si el proceso de publicación se cae, reinicia o falla temporalmente, el mensaje no se pierde simplemente en memoria o en el aire.
Queda registrado en la base y puede reintentarse.

En otras palabras:

- ya no dependés de que el publish ocurra exactamente en el mismo instante del commit
- no perdés la intención de integración cuando hay fallos parciales
- ganás recuperabilidad y trazabilidad

## Un ejemplo concreto

Supongamos un servicio de órdenes.

Queremos hacer esto:

- confirmar una orden
- emitir `OrderConfirmed`

Una implementación ingenua podría ser:

1. actualizar orden a `CONFIRMED`
2. publicar evento al broker

Parece bien, pero si entre esos dos pasos algo falla, quedás en un estado inconsistente.

Con outbox pattern, el flujo cambia.

Dentro de una misma transacción local:

- actualizás la orden a `CONFIRMED`
- insertás un registro en `outbox_events`

Por ejemplo:

- `id`
- `aggregate_type = ORDER`
- `aggregate_id = 123`
- `event_type = OrderConfirmed`
- `payload = {...}`
- `status = PENDING`
- `created_at`

Si esa transacción confirma, ya sabés dos cosas:

- la orden está confirmada
- existe evidencia durable de que debe emitirse ese evento

Después, un proceso aparte:

- lee los eventos pendientes
- los publica al broker
- y marca el registro como `SENT` o `PROCESSED`

## Por qué esto es mejor que “publicar después del commit” sin más

A veces alguien propone:

- hago commit de la base
- y después, fuera de la transacción, publico el mensaje

Eso reduce algunos riesgos, pero no resuelve el problema central.

Porque entre el commit y la publicación pueden pasar muchas cosas:

- crash del proceso
- reinicio del servidor
- excepción inesperada
- timeout con el broker
- error de configuración
- corte de red

Y si no dejaste persistida la intención de publicación, perdiste la posibilidad de recuperación confiable.

El outbox pattern existe justamente para que el “después lo publico” no dependa de memoria, suerte o timing.

## La tabla outbox como cola persistente local

Una buena forma mental de pensar la outbox es ésta:

**es una cola persistente dentro de tu propia base de datos, atada al mismo commit que el cambio de negocio.**

No reemplaza necesariamente a un broker.
Más bien actúa como puente seguro entre:

- la transacción local
- y la publicación externa

Te da un buffer durable y observable.

Eso permite:

- reintentos
- auditoría
- recuperación tras fallos
- diagnósticos operativos
- control de mensajes pendientes

## Componentes típicos del patrón

Aunque hay variantes, normalmente aparecen estas piezas.

## 1. Cambio de negocio

La lógica principal del caso de uso.
Por ejemplo:

- crear orden
- confirmar pago
- cancelar suscripción
- registrar envío

## 2. Registro en outbox

Dentro de la misma transacción se guarda un evento pendiente.

Suele incluir:

- identificador único
- tipo de evento
- clave de negocio o aggregate id
- payload serializado
- timestamps
- estado de publicación
- metadata útil para tracing o retries

## 3. Publicador o relay

Un proceso separado consulta la outbox y publica eventos pendientes.

Puede ser:

- un worker periódico
- un background job continuo
- un componente que escucha cambios en la base
- un conector tipo CDC en arquitecturas más avanzadas

## 4. Marcado de estado

Cuando un mensaje fue emitido correctamente, el registro se actualiza.

Por ejemplo:

- `SENT`
- `FAILED`
- `RETRY_PENDING`
- `DEAD_LETTER`

No todos usan exactamente esos estados, pero la idea es que el flujo quede visible.

## Qué problema de consistencia resuelve exactamente

El outbox no resuelve toda la consistencia distribuida.
Resuelve una parte muy específica, pero muy importante:

**que un cambio de estado local y la intención de integrarlo hacia afuera queden acoplados de manera confiable.**

Esto evita especialmente el caso donde:

- la operación quedó confirmada en la base
- pero el evento se perdió

Y ése es uno de los peores escenarios cuando otros servicios dependen de esos eventos para mantener coherencia.

## Lo que no resuelve por sí solo

Conviene decirlo con claridad.

El outbox pattern no garantiza automáticamente:

- exactly-once end-to-end
- que el consumidor procese una sola vez
- que nunca haya duplicados
- que el orden global de todos los eventos sea perfecto
- que una integración externa sea reversible

Tampoco reemplaza:

- idempotencia
- retries bien diseñados
- observabilidad
- manejo de errores del consumidor
- reconciliación

Lo que hace es reducir drásticamente una fuente concreta de pérdida e inconsistencia: el dual write inseguro.

## La relación con la idempotencia

Acá aparece una idea clave.

Como el relay puede reintentar y como los sistemas distribuidos toleran mal la certeza absoluta, **hay que asumir que un evento puede publicarse más de una vez**.

Por eso, en la práctica, outbox pattern e idempotencia suelen ir de la mano.

### Del lado del productor

El productor debería usar identificadores estables por evento.
No conviene generar payloads ambiguos o imposibles de deduplicar.

### Del lado del consumidor

El consumidor debería poder responder a algo como:

- “este mensaje ya lo procesé”
- “este side effect ya fue aplicado”

porque eso vuelve tolerable que el evento se publique de nuevo.

Sin esa disciplina, el outbox te mejora la confiabilidad de emisión, pero igual podés terminar con efectos duplicados aguas abajo.

## Un ejemplo de duplicado razonable

Supongamos que el relay hace esto:

1. publica `OrderConfirmed`
2. el broker lo recibe
3. justo antes de marcar la fila como enviada, el proceso se cae

Cuando el worker vuelve a arrancar, ve ese registro todavía pendiente y publica otra vez.

¿Es un error del patrón?
No.
Es una consecuencia normal de diseñar para no perder mensajes bajo fallos.

El sistema prefiere el riesgo de duplicado controlable al riesgo de pérdida silenciosa.

Por eso el consumo idempotente es parte del diseño maduro.

## Polling vs CDC

Hay dos estrategias muy comunes para sacar eventos de la outbox.

## Polling

Un worker consulta periódicamente la tabla:

- busca registros pendientes
- publica
- actualiza estado

Ventajas:

- simple de entender
- simple de implementar
- funciona bien en muchísimos escenarios

Costos:

- agrega algo de latencia
- requiere cuidado con locking y concurrencia
- si el polling es muy agresivo puede cargar la base innecesariamente

## Change Data Capture (CDC)

Se capturan cambios del log transaccional o mecanismos equivalentes y se traducen en publicaciones externas.

Ventajas:

- menor latencia potencial
- menos polling activo
- buen encaje en arquitecturas orientadas a eventos de mayor escala

Costos:

- mayor complejidad operativa
- tooling más exigente
- debugging menos trivial

Para muchos sistemas reales, empezar con polling bien hecho es perfectamente razonable.
No hace falta sofisticar todo desde el día uno.

## Cosas que conviene modelar bien en la outbox

## 1. Identificador único del evento

Sirve para tracing, deduplicación y correlación.

## 2. Tipo de evento claro

No solo “evento genérico”, sino algo entendible como:

- `OrderConfirmed`
- `PaymentAuthorized`
- `SubscriptionCancelled`

## 3. Aggregate o entidad asociada

Ayuda a seguir el historial de negocio.

## 4. Payload versionado

Los contratos evolucionan.
Conviene contemplar versiones o metadata suficiente.

## 5. Estado operativo

Para saber si está:

- pendiente
- enviado
- fallado
- esperando retry
- descartado

## 6. Información de error

Si falló la publicación, necesitás visibilidad del motivo.

## 7. Timestamps

Para retries, métricas, aging y observabilidad.

## Errores comunes al implementar outbox

## 1. Guardar el cambio de negocio y publicar al broker sin tabla intermedia

Eso directamente vuelve al problema original.

## 2. Insertar la fila outbox fuera de la misma transacción

Si no ocurre en el mismo commit que el cambio principal, rompés la garantía central del patrón.

## 3. Borrar filas demasiado pronto

Perdés trazabilidad, debugging y capacidad de auditoría.
Muchas veces conviene retenerlas un tiempo razonable o archivarlas.

## 4. No contemplar duplicados

Tarde o temprano los vas a tener.
Diseñar como si fueran imposibles es una fuente segura de bugs.

## 5. No limitar ni observar retries

Un evento que falla infinitamente sin visibilidad termina siendo deuda operativa.

## 6. Meter payloads pobres o ambiguos

Después los consumidores no saben cómo actuar o no pueden evolucionar el contrato con claridad.

## 7. No pensar el orden donde realmente importa

Algunos flujos toleran desorden.
Otros no.
Hay que saber dónde el orden por entidad o aggregate sí importa.

## 8. Usar outbox como excusa para no hacer reconciliación

No.
El patrón reduce pérdida de emisión, pero no reemplaza conciliaciones en dominios delicados como pagos, billing o stock.

## Relación con sagas y consistencia distribuida

El outbox suele ser una pieza muy útil dentro de flujos más grandes de consistencia distribuida.

Por ejemplo:

- una orden se confirma
- se escribe `OrderConfirmed` en outbox
- inventario consume y reserva stock
- pagos consume y procesa cobro
- otros servicios reaccionan después

En ese contexto, la outbox no resuelve toda la saga.
Pero sí vuelve mucho más confiable el paso inicial de propagación.

Sin ella, una saga orientada a eventos puede romperse simplemente porque el primer evento nunca salió aunque el estado local sí cambió.

## Cuándo vale la pena usarlo

En general, vale mucho la pena cuando:

- otros servicios dependen de tus eventos
- no querés perder publicaciones bajo fallos
- el cambio local y la emisión forman una misma intención de negocio
- hay procesos asíncronos críticos aguas abajo
- necesitás trazabilidad de lo que debía publicarse

Especialmente útil en:

- órdenes
- pagos
- billing
- inventario
- suscripciones
- provisioning
- auditoría distribuida

## Cuándo quizá no hace falta

No todo requiere outbox.

Si una notificación secundaria es poco crítica y tolera pérdida ocasional sin impacto serio, quizá el costo de complejidad no se justifica.

Por ejemplo:

- un evento puramente analítico no crítico
- una métrica auxiliar
- una señal no esencial con recuperación fácil por otro camino

La decisión depende del costo de perder ese mensaje y del impacto de incoherencia aguas abajo.

## Buenas prácticas conceptuales

## 1. Considerar la outbox parte del caso de uso, no un parche técnico

Si el negocio necesita propagar un hecho, esa intención debería modelarse explícitamente.

## 2. Mantener la inserción en la misma transacción local

Ésa es la base del patrón.

## 3. Diseñar consumidores idempotentes

Porque la confiabilidad de emisión normalmente trae consigo posibilidad de duplicado.

## 4. Hacer visible el estado operativo de la outbox

Cantidad pendiente, fallos, retries, antigüedad, stuck events.
Todo eso importa.

## 5. Definir estrategia de retry y dead letter

No todo debe reintentarse para siempre.

## 6. Versionar contratos y payloads con criterio

Los eventos viven y evolucionan.

## 7. Pensar retención y limpieza

No llenar la tabla eternamente sin plan, pero tampoco borrar sin rastro.

## 8. Complementar con reconciliación donde el dominio lo exige

Especialmente en integraciones financieras o de alto impacto.

## Preguntas que conviene hacerse

## 1. ¿Qué pasa si el cambio local confirma y el proceso cae antes de publicar?

Si la respuesta es “perdemos el evento”, probablemente te falta un outbox o una solución equivalente.

## 2. ¿Qué pasa si publicamos dos veces?

Si eso rompe el negocio, te falta idempotencia o deduplicación.

## 3. ¿Cómo sabemos qué eventos quedaron pendientes o atascados?

Sin observabilidad operativa, el patrón queda incompleto.

## 4. ¿Qué eventos son realmente críticos y cuáles no?

No todo merece la misma inversión.

## 5. ¿El payload tiene información suficiente para que el consumidor actúe bien?

Si no, vas a tener contratos frágiles.

## 6. ¿Cómo evolucionamos el evento sin romper consumidores?

La integración confiable también exige compatibilidad y versionado.

## 7. ¿Qué hacemos con eventos fallidos después de varios retries?

Necesitás una respuesta operativa clara.

## Idea final

El outbox pattern no existe porque a los arquitectos les guste agregar tablas extras.
Existe porque en sistemas distribuidos el dual write ingenuo rompe la coherencia con una facilidad alarmante.

Cuando un cambio de negocio local necesita propagarse hacia afuera, lo importante no es publicar “rápido” sino publicar **de forma recuperable, observable y consistente con el commit local**.

Ahí el outbox aporta una mejora enorme:

- convierte una intención frágil en evidencia durable
- desacopla el commit local de la publicación externa
- permite retries sin perder el rastro
- vuelve mucho más confiable la integración entre servicios

Y cuando se combina con:

- idempotencia
- observabilidad
- retries sanos
- contratos claros
- reconciliación donde hace falta

se transforma en una pieza central para construir sistemas distribuidos que no dependan de la suerte para mantenerse coherentes.
