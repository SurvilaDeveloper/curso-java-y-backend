---
title: "Entrega confiable e idempotencia"
description: "Cómo diseñar consumidores y flujos asincrónicos resistentes a reintentos, duplicados y reentregas en una arquitectura de microservicios con RabbitMQ."
order: 33
module: "Módulo 8 · Comunicación asincrónica"
level: "intermedio"
draft: false
---

# Entrega confiable e idempotencia

Cuando una arquitectura distribuida empieza a usar mensajería, aparece una idea tentadora: pensar que publicar un mensaje en un broker ya garantiza, por sí solo, que el procesamiento del negocio será correcto.

En la práctica no funciona así.

Un broker puede ayudar muchísimo a desacoplar procesos, amortiguar picos y mejorar la robustez general del sistema, pero eso no elimina varios problemas importantes:

- mensajes duplicados,
- reintentos,
- fallas parciales durante el procesamiento,
- consumidores que reciben más de una vez el mismo evento,
- y operaciones que no pueden repetirse sin producir efectos no deseados.

En NovaMarket, este tema aparece con claridad cuando `order-service` publica un `OrderCreatedEvent` y `notification-service` lo consume para generar una notificación. Si el mensaje se reentrega o el consumidor falla después de haber procesado parcialmente el evento, necesitamos una estrategia para que el sistema no termine comportándose de forma inconsistente.

---

## El problema de fondo

En una integración asincrónica, el emisor y el consumidor no comparten el mismo proceso ni la misma transacción.

Eso significa que entre publicar y procesar un evento pueden pasar muchas cosas:

- el consumidor puede caerse,
- el mensaje puede reentregarse,
- la confirmación de procesamiento puede no llegar,
- el código del consumidor puede lanzar una excepción,
- el efecto externo puede haberse ejecutado antes del fallo,
- o el mensaje puede ser procesado dos veces.

Por eso, cuando hablamos de mensajería de verdad, no alcanza con “escuchar una cola”. Hay que diseñar el procesamiento para que siga siendo correcto cuando el sistema se comporta como un sistema distribuido real.

---

## Qué significa entrega confiable

La entrega confiable no significa perfección absoluta.

Significa diseñar el flujo para que:

- el mensaje no se pierda fácilmente,
- el consumidor tenga oportunidades razonables de reprocesarlo,
- el sistema soporte fallas transitorias,
- y el resultado del negocio no se corrompa si hay reintentos o duplicados.

En otras palabras, la confiabilidad no depende solamente del broker. También depende de cómo está modelado el procesamiento del lado del consumidor.

---

## Por qué los duplicados son normales

Uno de los errores conceptuales más comunes es asumir que “si llegó una vez, va a procesarse una sola vez”.

En sistemas distribuidos, lo normal es que el diseño tolere la posibilidad de duplicados.

Esto puede pasar, por ejemplo, si:

1. el consumidor procesa el mensaje,
2. realiza parte del trabajo,
3. pero falla antes de confirmar al broker,
4. entonces el broker interpreta que no se completó el procesamiento,
5. y vuelve a entregar el mensaje.

Desde la perspectiva del broker, esa reentrega tiene sentido. El problema aparece si el consumidor no fue diseñado para manejarla.

---

## Idempotencia

La respuesta más importante a este escenario es la **idempotencia**.

Un procesamiento idempotente es aquel que, ante la misma entrada repetida varias veces, deja el sistema en un estado consistente y equivalente al de haberla procesado una sola vez.

Esto no significa que el código tenga que ejecutarse cero o una sola vez. Significa que **repetirlo no debe romper el resultado final del negocio**.

---

## Ejemplo en NovaMarket

Supongamos que `order-service` publica este evento:

```json
{
  "eventId": "evt-1001",
  "orderId": 101,
  "userId": "user-123",
  "status": "CREATED"
}
```

Y `notification-service` lo consume para registrar una notificación del tipo:

- “La orden 101 fue creada correctamente”.

Si el consumidor procesa el mensaje dos veces sin control, podrían pasar cosas como estas:

- crear dos registros iguales,
- enviar dos emails,
- disparar dos integraciones externas,
- generar dos auditorías equivalentes,
- o duplicar un efecto que el usuario sí percibe.

Eso ya es un error funcional.

---

## Qué hace que una operación no sea idempotente

Una operación deja de ser idempotente cuando repetirla genera un efecto acumulativo no deseado.

Por ejemplo:

- incrementar stock cada vez que llega el mismo evento,
- enviar una notificación externa cada vez,
- registrar múltiples pagos para la misma orden,
- descontar saldo varias veces,
- o crear varias reservas con el mismo origen lógico.

Si el consumidor no sabe distinguir entre “evento nuevo” y “evento repetido”, el sistema queda expuesto.

---

## Estrategias para lograr idempotencia

### 1. Usar un identificador único de evento

Cada mensaje debería incluir un identificador de evento estable y único, por ejemplo:

- `eventId`,
- `messageId`,
- o una combinación estable derivada del negocio.

Ese identificador permite que el consumidor sepa si ya procesó antes ese evento.

---

### 2. Persistir el procesamiento

Una estrategia habitual consiste en guardar en una tabla o estructura persistente los eventos ya procesados.

Por ejemplo, `notification-service` podría tener una tabla:

- `processed_events`

Con campos como:

- `event_id`
- `consumer_name`
- `processed_at`

Entonces el flujo sería:

1. llega el mensaje,
2. se verifica si `eventId` ya fue procesado,
3. si ya existe, se descarta o se ignora de forma segura,
4. si no existe, se procesa,
5. se registra el `eventId` como procesado.

Esto no elimina todos los desafíos de concurrencia, pero ya establece una base sólida.

---

### 3. Diseñar efectos de negocio naturalmente idempotentes

En algunos casos conviene que la operación misma sea idempotente.

Por ejemplo, en lugar de “sumar una notificación nueva”, podría plantearse “asegurar que exista una notificación asociada a tal orden y tipo”.

Eso permite transformar una operación acumulativa en una operación de convergencia.

---

### 4. Definir claves naturales de unicidad

A veces no alcanza con el `eventId`. También ayuda imponer restricciones de unicidad más cercanas al negocio.

Ejemplo:

- no puede existir más de una notificación de tipo `ORDER_CREATED` para la misma `orderId` y el mismo destinatario.

Eso agrega una defensa adicional incluso si la lógica del consumidor falla.

---

## Qué no conviene hacer

### Confiar en que “RabbitMQ no va a duplicar”

El broker no te garantiza que el efecto del negocio vaya a ejecutarse una sola vez de manera perfecta.

### Confirmar demasiado pronto

Si hacés ack del mensaje antes de completar el procesamiento real, podés perder la posibilidad de reprocesarlo ante un error.

### Confirmar demasiado tarde sin pensar en idempotencia

Si confirmás al final, lo cual muchas veces tiene sentido, necesitás asumir que puede haber reentregas si algo falla antes del ack.

### Basarse en memoria local del proceso

Si la detección de duplicados vive solo en memoria, se pierde al reiniciar la aplicación o al cambiar de instancia.

---

## Ack, reintentos y consistencia

En mensajería, el momento del ack es delicado.

Si el consumidor confirma demasiado pronto, corre el riesgo de perder el mensaje sin haber completado el trabajo.

Si confirma demasiado tarde, acepta la posibilidad de reentrega.

Como esa tensión existe, la solución real no suele ser “encontrar el punto mágico”, sino **diseñar procesamiento seguro ante repetición**.

Ahí es donde la idempotencia deja de ser un detalle técnico y pasa a ser una propiedad central del sistema.

---

## Aplicación concreta en NovaMarket

En NovaMarket, `notification-service` debería consumir `OrderCreatedEvent` con una estrategia como esta:

1. leer el mensaje,
2. extraer `eventId` y `orderId`,
3. verificar si ya se procesó,
4. si ya se procesó, terminar sin duplicar efecto,
5. si no se procesó, crear el registro de notificación,
6. registrar el evento como procesado,
7. recién entonces confirmar el mensaje.

De esa forma, una reentrega no rompe la consistencia del flujo.

---

## Idempotencia y operaciones externas

El tema se vuelve todavía más importante cuando el consumidor llama a sistemas externos.

Por ejemplo:

- servicio de email,
- SMS,
- push notification,
- plataforma de pagos,
- auditoría externa,
- ERP.

En esos casos, repetir una llamada puede tener efectos costosos o visibles para el usuario.

Por eso conviene decidir explícitamente:

- si el efecto externo se puede repetir,
- si se puede deduplicar,
- si el proveedor externo admite claves idempotentes,
- y cómo registrar que la operación ya ocurrió.

---

## Relación con outbox pattern

Más adelante en el curso vamos a ver el **outbox pattern**, que ayuda a resolver un problema complementario: cómo evitar inconsistencias entre persistir cambios y publicar eventos.

Ese patrón mejora la confiabilidad del lado emisor.

La idempotencia, en cambio, es una defensa clave del lado consumidor.

Ambas piezas trabajan muy bien juntas:

- **outbox** ayuda a no perder eventos,
- **idempotencia** ayuda a no romper el sistema cuando hay duplicados o reprocesos.

---

## Señales de que el diseño todavía es frágil

Conviene sospechar que el flujo todavía no está bien diseñado si:

- un mismo mensaje puede crear varios efectos equivalentes,
- el consumidor depende de que nunca haya reentregas,
- no hay identificadores estables de evento,
- no existe registro de eventos procesados,
- una caída parcial puede dejar el sistema duplicado,
- o la lógica solo “funciona” en el camino feliz.

En un curso práctico, el objetivo no es fingir que esos casos raros no existen, sino preparar el sistema para soportarlos.

---

## Cierre

Cuando una arquitectura usa mensajería, la pregunta importante ya no es solo “cómo publico un mensaje”, sino **cómo mantengo correcto el resultado del negocio cuando aparecen reintentos, duplicados y reentregas**.

La entrega confiable exige pensar tanto en el broker como en el diseño del consumidor.

Y la idempotencia aparece como una capacidad fundamental: no para impedir que el mensaje llegue dos veces, sino para evitar que el sistema quede mal si eso ocurre.

En NovaMarket, esta idea va a ser clave para que la comunicación asincrónica siga siendo robusta cuando `notification-service` procese eventos emitidos por `order-service`.

En la próxima clase vamos a profundizar en dos mecanismos muy relacionados con esto: los **reintentos** y las **dead letter queues**, que permiten manejar mejor los mensajes que fallan repetidamente.
