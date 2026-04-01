---
title: "Webhooks"
description: "Qué son los webhooks, cómo funcionan en integraciones reales y qué decisiones de diseño importan para recibir y procesar eventos entre sistemas de forma segura y confiable."
order: 76
module: "Backend real e integraciones"
level: "intermedio"
draft: false
---

## Introducción

Cuando dos sistemas necesitan comunicarse, una posibilidad es que uno consulte al otro cada cierto tiempo preguntando si pasó algo.

Por ejemplo:

- “¿ya se aprobó este pago?”
- “¿esta orden cambió de estado?”
- “¿hay novedades?”
- “¿ya terminó este proceso?”

Ese enfoque existe, pero no siempre es el más eficiente.

Muchas veces conviene lo contrario:

**que un sistema avise automáticamente al otro cuando ocurre un evento.**

Ahí aparece un concepto muy importante en integraciones modernas:

**los webhooks.**

Los webhooks son una forma muy común de conectar sistemas sin necesidad de estar preguntando constantemente si hubo cambios.

## Qué es un webhook

Un webhook es una notificación automática que un sistema envía a otro sistema mediante una petición HTTP cuando ocurre un evento determinado.

En otras palabras:

- pasa algo en el sistema A
- el sistema A hace una llamada HTTP al sistema B
- el sistema B recibe la información del evento y decide qué hacer

Por ejemplo:

- se aprueba un pago
- se crea un envío
- cambia el estado de una suscripción
- se firma un documento
- termina un proceso externo
- se actualiza un recurso en otra plataforma

Entonces, en vez de esperar que el sistema receptor consulte todo el tiempo, el emisor empuja la novedad cuando sucede.

## Ejemplo intuitivo

Supongamos que integrás tu backend con una pasarela de pagos.

El usuario paga en un sistema externo.
Después de eso, tu aplicación necesita enterarse si el pago quedó:

- aprobado
- rechazado
- pendiente
- cancelado

Podrías consultar periódicamente a la API del proveedor, pero muchas veces el proveedor ofrece un webhook.

Entonces ocurre esto:

1. el pago cambia de estado en el sistema externo
2. el proveedor envía una petición HTTP a una URL de tu backend
3. tu backend recibe el evento
4. valida que el mensaje sea legítimo
5. procesa el cambio correspondiente

Ese es uno de los casos más típicos.

## Diferencia entre webhook y polling

Esto es muy importante.

### Polling

Tu sistema pregunta repetidamente si pasó algo.

Por ejemplo:

- cada minuto consultar el estado de un pago
- cada 10 minutos revisar si cambió una orden externa

### Webhook

El otro sistema te avisa cuando pasa algo.

Por ejemplo:

- “pago aprobado”
- “suscripción renovada”
- “envío entregado”

## Ventajas del webhook frente al polling

En muchos casos:

- reduce consultas innecesarias
- mejora la frescura de la información
- evita revisar constantemente algo que no cambió
- desacopla mejor ciertas integraciones
- hace más reactiva la comunicación entre sistemas

## Pero no siempre reemplaza totalmente al polling

A veces ambos enfoques conviven.

Por ejemplo:

- usás webhook como mecanismo principal
- pero tenés una tarea de reconciliación por si algo falló o quedó desincronizado

Eso es bastante común en integraciones serias.

## Casos de uso frecuentes

## 1. Pagos

Cuando una operación cambia de estado, el proveedor avisa automáticamente.

## 2. Logística y envíos

El sistema externo informa que un paquete fue despachado, entregado o falló.

## 3. Suscripciones

Cambios de renovación, cancelación o vencimiento.

## 4. Firma digital o documentos

Cuando se completa una firma o se actualiza el estado de un documento.

## 5. Integraciones entre plataformas

Por ejemplo, una plataforma externa notifica cambios en usuarios, productos o inventario.

## 6. Sistemas internos desacoplados

A veces incluso dentro de una organización se usan mecanismos webhook-like para comunicar eventos entre servicios.

## Qué necesita un sistema para recibir un webhook

En términos generales, necesita una URL o endpoint expuesto para que el sistema emisor pueda enviarle la notificación.

Por ejemplo:

`POST /api/webhooks/payments`

o

`POST /api/webhooks/shipping`

Ese endpoint recibe el evento y luego el backend decide cómo procesarlo.

Pero recibir el request es solo el comienzo.

Después hay que pensar muchas otras cosas:

- autenticidad
- seguridad
- idempotencia
- retries
- trazabilidad
- validación
- errores
- consistencia

## Estructura general de un webhook

Aunque cada proveedor define su formato, conceptualmente suele haber algo así:

- tipo de evento
- identificador del evento
- fecha o timestamp
- datos del recurso afectado
- identificador externo
- firma o mecanismo de validación
- metadata adicional

Por ejemplo, puede llegar información como:

- `event_id`
- `event_type`
- `resource_id`
- `status`
- `timestamp`

No importa memorizar un payload particular.
Lo importante es entender el patrón.

## Webhook no significa “confiar y ejecutar”

Este es uno de los puntos más importantes de todos.

Que llegue una petición HTTP a tu endpoint no significa que debas creerle automáticamente.

Primero hay que preguntarse:

- ¿realmente vino del sistema esperado?
- ¿no fue alterada?
- ¿no está repetida?
- ¿tiene el formato correcto?
- ¿corresponde procesarla?
- ¿ya la procesé antes?

En integraciones reales, recibir un webhook requiere diseño defensivo.

## Seguridad en webhooks

Este tema es central.

Si tu backend recibe peticiones externas automáticas, no puede tratarlas como si fueran siempre confiables.

Hay varias estrategias comunes.

## 1. Validar firma o secret compartido

Muchos proveedores envían una firma o hash calculado con un secreto compartido.

Tu backend recalcula o verifica esa firma para comprobar que el mensaje realmente vino del proveedor y no fue manipulado.

## 2. Validar headers específicos

Algunos sistemas agregan headers particulares para identificar el origen o la firma.

## 3. Validar origen de forma complementaria

En algunos casos también puede haber controles adicionales, aunque esto solo no suele ser suficiente.

## 4. No exponer lógica sensible sin validación

Nunca conviene procesar un webhook importante sin algún criterio de autenticidad.

## Idempotencia en webhooks

Los webhooks suelen reenviarse.

Esto no es una rareza.
Es algo bastante normal.

¿Por qué?

Porque el sistema emisor puede:

- reintentar si no recibió respuesta
- reenviar por timeout
- volver a mandar el mismo evento por seguridad
- tener mecanismos “at least once”

Entonces, tu backend tiene que asumir algo muy importante:

**un mismo webhook puede llegar más de una vez.**

Por eso la idempotencia acá no es opcional.
Es fundamental.

## Ejemplo de duplicado

Supongamos que llega un webhook:

- evento: pago aprobado
- event_id: `evt_123`

Tu sistema:

- marca orden como pagada
- descuenta stock
- registra movimiento contable
- manda email de confirmación

Si ese mismo webhook vuelve a llegar y no controlás duplicados, podrías repetir efectos peligrosos.

Por eso muchas veces conviene registrar:

- `event_id`
- tipo de evento
- proveedor
- fecha de recepción
- estado de procesamiento

Y verificar si ese evento ya fue manejado.

## Responder rápido vs procesar todo en el momento

Este punto también es muy importante.

A veces conviene separar:

- recepción del webhook
- procesamiento profundo del webhook

¿Por qué?

Porque algunos emisores esperan una respuesta rápida.
Si tu endpoint tarda demasiado:

- pueden asumir fallo
- pueden reintentar
- pueden duplicar tráfico
- puede empeorar la integración

Entonces, muchas veces el patrón sano es:

1. recibir el webhook
2. validar autenticidad básica y formato
3. registrar recepción
4. responder rápido con éxito si corresponde
5. procesar el trabajo más pesado aparte

Esto reduce fragilidad y mejora robustez.

## Relación con trabajo en background

Este tema conecta muy bien con lo que ya viste sobre tareas programadas y procesamiento diferido.

Un webhook puede funcionar así:

- entra el evento
- se persiste
- se marca como pendiente
- una cola o worker hace el procesamiento principal
- luego se registra resultado final

Ese enfoque suele ser más robusto que intentar hacer todo sin desacople.

## Qué pasa si el webhook llega antes de que tu sistema esté listo

Este es un caso real.

Por ejemplo:

- llega un evento de pago
- pero tu orden todavía no está visible internamente por un desfase temporal
- o llega un cambio externo antes de cierta sincronización previa

Entonces tu sistema tiene que decidir:

- ¿reintenta más tarde?
- ¿deja el evento pendiente?
- ¿lo marca como no procesable por ahora?
- ¿lo reconcilia después?

Estos escenarios muestran por qué las integraciones reales no son solo “un controller más”.

## Webhook como disparador, no como fuente absoluta de verdad

Muchas veces el webhook sirve para avisarte que pasó algo, pero después tu backend puede decidir consultar la API del proveedor para confirmar el estado actual.

Esto pasa mucho cuando:

- el payload del webhook es limitado
- necesitás validar información
- querés evitar depender solo del contenido recibido
- el proveedor recomienda consultar el recurso real

Por ejemplo:

1. llega “payment.updated”
2. tu sistema valida el webhook
3. luego consulta la API del proveedor
4. obtiene el estado actual real
5. procesa con esa información

Ese patrón es bastante habitual.

## Observabilidad y trazabilidad

Conviene poder responder preguntas como:

- qué webhook llegó
- cuándo llegó
- de qué proveedor
- con qué event id
- si pasó validación o no
- si ya había sido procesado
- qué resultado tuvo
- si quedó pendiente
- si falló
- cuántas veces fue reintentado

Esto ayuda muchísimo en soporte e integraciones complejas.

## Estados posibles de procesamiento

Aunque depende del sistema, conceptualmente puede ser útil pensar estados como:

- recibido
- validado
- descartado
- duplicado
- pendiente
- procesado
- fallido

No siempre hace falta modelarlo igual, pero mentalmente ayuda mucho.

## ¿Qué devolver como respuesta?

Esto depende del proveedor y del contrato, pero en general importa mucho responder correctamente según:

- si el webhook fue aceptado
- si la firma era inválida
- si el payload era incorrecto
- si hubo error interno
- si conviene pedir reintento o no

No todos los errores deberían tratarse igual.

## Errores comunes al trabajar con webhooks

### 1. No validar autenticidad

Gravísimo.
Podrías procesar requests falsos.

### 2. No pensar en duplicados

Y terminar aplicando varias veces el mismo efecto.

### 3. Hacer procesamiento pesado antes de responder

Eso puede disparar timeouts y retries innecesarios.

### 4. No registrar qué webhook llegó

Después es muy difícil depurar.

### 5. Confiar totalmente en el payload sin criterio

A veces conviene verificar estado real vía API.

### 6. No diseñar casos de fallo parcial

Un evento puede recibirse, pero procesarse solo a medias.

## Buenas prácticas iniciales

## 1. Tratar todo webhook como entrada externa no confiable hasta validar

Ese debería ser el punto de partida.

## 2. Implementar autenticidad o verificación de firma cuando exista

Es clave para seguridad.

## 3. Diseñar idempotencia desde el inicio

No después.

## 4. Registrar recepción y resultado

Ayuda mucho más de lo que parece.

## 5. Responder rápido cuando el proveedor lo requiera

Y mover trabajo pesado a segundo plano si conviene.

## 6. Tener estrategia para retries y reconciliación

No siempre todo sale bien al primer intento.

## 7. Separar claramente recepción, validación y procesamiento

Eso mejora robustez y mantenibilidad.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué proveedores de un e-commerce podrían usar webhooks?
2. ¿qué efectos peligrosos podrían duplicarse si un webhook llega dos veces?
3. ¿qué validarías antes de aceptar un evento de pago?
4. ¿responderías rápido y procesarías después o harías todo en el momento?
5. ¿guardarías el `event_id`? ¿Para qué?

## Resumen

En esta lección viste que:

- un webhook es una notificación HTTP automática entre sistemas cuando ocurre un evento
- es una alternativa muy común al polling para integraciones más reactivas
- aparece mucho en pagos, logística, suscripciones y plataformas externas
- recibir un webhook no significa confiar automáticamente en él
- seguridad, validación, idempotencia y trazabilidad son fundamentales
- un mismo evento puede llegar varias veces, así que hay que diseñar tolerancia a duplicados
- muchas veces conviene responder rápido y procesar en segundo plano
- en algunos casos el webhook funciona mejor como disparador para luego consultar el estado real del recurso en la API externa

## Siguiente tema

Ahora que ya entendés cómo funcionan los webhooks y por qué son tan importantes en integraciones reales, el siguiente paso natural es aprender sobre **rate limiting y protección contra abuso**, porque cuando un backend se expone a clientes, integraciones y tráfico externo, también necesita defenderse frente a uso excesivo, errores y comportamientos maliciosos.
