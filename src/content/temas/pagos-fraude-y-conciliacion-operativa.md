---
title: "Pagos, fraude y conciliación operativa"
description: "Cómo pensar pagos en un e-commerce real, por qué autorizar no siempre es cobrar, qué rol juega el fraude y por qué la conciliación operativa es clave para no perder control sobre el dinero." 
order: 197
module: "E-commerce profesional"
level: "intermedio"
draft: false
---

## Introducción

Cuando alguien compra en un e-commerce, desde afuera parece simple:

- el cliente paga
- la tienda cobra
- la orden sigue su camino

Pero en la práctica real, pagos es uno de los dominios más delicados del sistema.

Porque entre el checkout y el dinero efectivo aparecen muchas situaciones intermedias:

- pagos aprobados pero todavía no acreditados
- pagos autorizados pero no capturados
- pagos pendientes
- pagos rechazados
- pagos en revisión
- contracargos
- reembolsos
- notificaciones asíncronas del proveedor
- diferencias entre lo que dice la UI, lo que cree el backend y lo que informa la pasarela

Y además se cruza otro tema todavía más sensible:

**el fraude.**

Por eso, en un e-commerce real, el problema no es solo “integrar un medio de pago”.
El problema es diseñar un sistema que pueda:

- cobrar con seguridad
- tolerar incertidumbre
- detectar situaciones sospechosas
- mantener trazabilidad
- reconciliar lo que pasó de verdad con el proveedor

Esta lección trata justamente de eso.

## Pagar no es un evento único

Un error muy común es imaginar el pago como algo binario:

- pagado
- no pagado

Eso rara vez alcanza.

En la práctica, un pago suele atravesar etapas.
Por ejemplo:

- iniciado
- pendiente
- autorizado
- capturado
- acreditado
- fallido
- cancelado
- reembolsado
- desconocido o en disputa

Dependiendo del medio de pago y del proveedor, el flujo puede cambiar bastante.

Por ejemplo:

- en tarjeta puede haber autorización y captura separadas
- en transferencia puede haber validación posterior
- en efectivo puede existir una ventana de espera hasta que el pago se acredita
- en billeteras o PSPs puede haber webhooks asíncronos que actualizan el resultado después

Entonces conviene pensar el pago como un proceso con estados y eventos, no como un simple booleano.

## Autorización, captura y acreditación

Estas tres ideas suelen mezclarse mucho al principio, pero conviene distinguirlas.

### Autorización

Es cuando el emisor o proveedor aprueba la posibilidad de cobrar.
No siempre significa que el dinero ya esté liquidado.

### Captura

Es cuando efectivamente se ejecuta el cobro sobre una autorización previa.
En algunos modelos se captura inmediatamente.
En otros, se captura después.

### Acreditación o liquidación

Es cuando el dinero realmente entra en el circuito del comercio según la operatoria del proveedor.
No siempre ocurre en el mismo instante del checkout.

Esta diferencia importa mucho.
Porque una orden puede estar:

- autorizada pero no capturada
- capturada pero no liquidada
- aprobada por la UI pero todavía pendiente de confirmación confiable

Si el sistema mezcla todo eso en un único “pagado”, tarde o temprano aparecen errores operativos.

## Estado del pago vs estado de la orden

Esto conecta muy fuerte con la lección anterior.

La orden y el pago no son exactamente la misma cosa.
Una orden puede existir aunque el pago todavía esté pendiente.
Y un pago puede tener incidencias aunque la orden ya esté creada.

Por eso suele ser útil separar:

- estado de la orden
- estado del pago
- estado de fulfillment

Por ejemplo, una orden podría estar:

- creada
- con pago pendiente
- y sin iniciar preparación

O también:

- confirmada
- con pago aprobado
- pero retenida por revisión antifraude

O incluso:

- entregada
- pero con contracargo posterior

Separar estas dimensiones evita mezclar dinero, operación y logística en una sola etiqueta confusa.

## Qué suele guardar el sistema de pagos

No alcanza con saber si se cobró o no.
Normalmente conviene guardar bastante más contexto.

Por ejemplo:

- proveedor de pago usado
- método de pago
- identificador de transacción del proveedor
- monto
- moneda
- estado interno
- estado reportado por el proveedor
- timestamps relevantes
- código de autorización o referencia
- cantidad de cuotas si aplica
- fingerprint o metadata antifraude si existe
- motivo de rechazo o error
- historial de eventos recibidos

Eso ayuda muchísimo para:

- soporte
- auditoría
- conciliación
- debugging
- reclamos
- investigaciones de fraude

## Confirmación inmediata vs confirmación diferida

No todos los pagos se confirman de la misma forma.

### Confirmación inmediata

Sucede cuando el checkout recibe una respuesta confiable y suficiente para avanzar rápido.
Por ejemplo, una aprobación en línea con tarjeta o billetera.

### Confirmación diferida

Sucede cuando el resultado real llega más tarde.
Por ejemplo:

- por webhook
- por polling
- por procesamiento batch
- por acreditación posterior
- por validación manual

Este punto es clave.
Porque muchas integraciones de pago no deberían considerarse definitivas solo por lo que vuelve en el frontend.

Con frecuencia, la fuente de verdad real termina siendo:

- un webhook firmado
- una consulta server-to-server
- una conciliación posterior

## El frontend no debería ser la fuente de verdad

Este es un error muy común.

A veces se diseña el flujo así:

1. el frontend llama al proveedor
2. el proveedor responde “aprobado”
3. el frontend le avisa al backend
4. el backend marca la orden como pagada

Eso es frágil.

¿Por qué?
Porque el frontend puede:

- perder conexión
- duplicar requests
- recibir un estado transitorio
- ser manipulado
- quedar desfasado respecto del proveedor

Lo sano es que el backend confirme el estado por una fuente más confiable.
Por ejemplo:

- webhook del proveedor
- consulta directa a la API del PSP
- proceso de reconciliación posterior

El frontend sirve para experiencia de usuario.
Pero el backend necesita una confirmación más robusta.

## Webhooks y pagos

En pagos, los webhooks suelen ser fundamentales.

Sirven para enterarse de eventos como:

- pago aprobado
- pago rechazado
- pago acreditado
- devolución emitida
- contracargo iniciado
- transacción actualizada

Pero integrarlos bien requiere cuidado.

Porque puede pasar que los webhooks:

- lleguen duplicados
- lleguen fuera de orden
- lleguen tarde
- fallen temporalmente
- informen estados parciales

Entonces conviene diseñar con:

- idempotencia
- verificación de firma o autenticidad
- trazabilidad completa del payload recibido
- lógica de transición válida
- posibilidad de reintentar o reprocesar

En pagos, asumir que “cada evento llega una sola vez y en el orden perfecto” es una receta para problemas.

## Qué es fraude en este contexto

Fraude no significa solamente “una tarjeta robada”.

En e-commerce puede incluir cosas como:

- uso no autorizado de un medio de pago
- cuentas tomadas o comprometidas
- compras con identidades falsas
- triangulación
- abuso de promociones
- chargebacks oportunistas
- intentos automatizados de testeo de tarjetas
- manipulación de flujos de devolución o reembolso

No todos los negocios tienen el mismo perfil de riesgo.
Pero incluso en operaciones pequeñas, fraude ya puede impactar:

- pérdida económica
- mercadería entregada sin cobrar bien
- costo operativo de investigación
- reputación
- relación con proveedores de pago

Por eso no alcanza con “que el pago pase”.
También importa si el pago es confiable.

## Revisión antifraude

Algunos negocios o proveedores agregan una capa antifraude.
Eso puede derivar en estados como:

- `PENDING_REVIEW`
- `UNDER_REVIEW`
- `APPROVED`
- `REJECTED_FOR_RISK`
- `MANUAL_REVIEW_REQUIRED`

Eso impacta mucho en la operación.
Porque una orden puede estar técnicamente aprobada por el medio de pago, pero todavía no lista para fulfillment.

Por ejemplo, quizás convenga:

- no despachar todavía
- pedir validación adicional
- limitar ciertos medios para ciertos perfiles de riesgo
- pasar el caso a revisión manual

Acá aparece una idea importante:

**no todo pago aprobado debería convertirse automáticamente en mercadería despachada.**

Depende del nivel de riesgo, del ticket promedio, del canal y del negocio.

## Señales que suelen disparar sospecha

No hace falta construir un sistema de fraude ultra sofisticado para razonar bien.

Algunas señales típicas pueden ser:

- múltiples intentos fallidos en poco tiempo
- muchas tarjetas probadas sobre la misma cuenta
- discrepancia fuerte entre país de pago y país de envío
- montos atípicos para el patrón histórico
- dirección sospechosa o difícil de verificar
- compras masivas anormales
- uso intensivo de promociones de forma rara
- cambios frecuentes de identidad o contacto
- historial previo conflictivo

La clave no es tratar cada señal como certeza absoluta.
La clave es usar señales para:

- bajar riesgo
- aumentar revisión
- priorizar investigación
- decidir si despachar o no

## Contracargos y disputas

Uno de los problemas más duros en pagos es el contracargo.

Un contracargo ocurre cuando el titular o la entidad financiera disputa la operación.
Eso puede pasar por:

- fraude real
- desconocimiento de compra
- reclamos sobre el producto o la entrega
- errores de procesamiento
- abuso por parte del comprador

Para el comercio esto es delicado porque puede significar:

- pérdida del dinero
- pérdida de la mercadería
- costo administrativo
- penalización del proveedor
- empeoramiento del perfil de riesgo

Por eso conviene que el modelo soporte eventos como:

- `CHARGEBACK_OPENED`
- `CHARGEBACK_WON`
- `CHARGEBACK_LOST`
- `DISPUTE_UNDER_REVIEW`

Y también conviene tener trazabilidad suficiente para defender operaciones cuando corresponda.

## Reembolsos

Un reembolso tampoco es tan simple como parece.

Puede ser:

- total
- parcial
- automático
- manual
- inmediato
- diferido

Y además puede relacionarse con:

- cancelación previa al despacho
- devolución posterior
- problema operativo
- gesto comercial
- error de pricing

Entonces conviene modelar bien:

- monto reembolsado
- motivo
- actor que lo disparó
- referencia externa del proveedor
- impacto en la orden
- impacto en reporting

Porque si no, después aparecen diferencias entre:

- lo cobrado
- lo devuelto
- lo facturado
- lo reportado

## Qué es conciliación operativa

La conciliación es el proceso de comparar y alinear distintas fuentes de verdad.

Por ejemplo:

- lo que el e-commerce cree que cobró
- lo que el proveedor de pagos informa
- lo que efectivamente se liquidó
- lo que figura en contabilidad o ERP
- lo que se reembolsó
- lo que se disputó

En sistemas chicos esto a veces se hace manualmente.
En sistemas más serios empieza a haber procesos automáticos o semiautomáticos.

La conciliación es importante porque en producción real siempre aparecen diferencias.

Por ejemplo:

- una orden quedó “pagada” pero el proveedor nunca la liquidó
- un webhook falló y el backend quedó desactualizado
- hubo refund parcial no reflejado correctamente
- una disputa cambió el estado financiero después de la entrega
- un pago quedó duplicado o ambiguo

Si no conciliás, podés terminar operando sobre una ilusión contable.

## Por qué la conciliación no es solo un tema contable

Mucha gente piensa que conciliación pertenece solo a administración.
Pero no.
También impacta al backend y a la operación.

Porque de la conciliación salen decisiones como:

- investigar pagos inconsistentes
- corregir estados internos
- emitir o frenar fulfillment
- gestionar reclamos
- ajustar reporting comercial
- detectar errores de integración

O sea:
**conciliación también es una defensa técnica del sistema.**

## Situaciones ambiguas que sí ocurren

Este dominio está lleno de ambigüedad.
Por ejemplo:

- el cliente vio “aprobado” pero el webhook nunca llegó
- el proveedor respondió timeout, pero después el cobro sí ocurrió
- la orden quedó cancelada, pero el pago se acreditó tarde
- hubo dos notificaciones contradictorias en momentos distintos
- el backend recibió confirmación parcial y el resto llegó horas después

Por eso el modelo necesita tolerar estados dudosos.

A veces conviene tener estados como:

- `PAYMENT_PENDING_CONFIRMATION`
- `PAYMENT_INCONSISTENT`
- `PAYMENT_REQUIRES_REVIEW`
- `PAYMENT_UNKNOWN`

Eso es mucho mejor que forzar una certeza falsa.

## Idempotencia y duplicación

En pagos, la duplicación da miedo de verdad.

Puede ocurrir por:

- reintentos del cliente
- doble click en checkout
- retries automáticos
- timeouts con reenvío
- webhooks repetidos
- errores del proveedor

Por eso necesitás mecanismos de idempotencia para evitar cosas como:

- crear dos órdenes por una misma intención de compra
- registrar dos pagos idénticos
- emitir dos reembolsos
- capturar dos veces una autorización

Este tema conecta directamente con varias lecciones anteriores del roadmap.
En pagos, la idempotencia deja de ser una prolijidad conceptual y pasa a ser protección económica concreta.

## Observabilidad y trazabilidad en pagos

Pagos es un dominio donde la trazabilidad vale oro.

Conviene poder reconstruir preguntas como:

- qué intentó pagar el cliente
- qué respondió el proveedor
- qué webhook llegó y cuándo
- qué estado interno tenía la orden en cada momento
- quién emitió un reembolso
- por qué se bloqueó el fulfillment
- qué diferencias detectó la conciliación

Eso implica registrar bien:

- request IDs
- payment IDs internos y externos
- logs estructurados
- eventos relevantes
- decisiones manuales
- cambios de estado

Sin eso, debugging y soporte se vuelven muy dolorosos.

## Separar intención de pago, transacción y orden

En diseños más sanos suele ayudar distinguir algunas piezas.

Por ejemplo:

- `Order`
- `PaymentIntent`
- `PaymentTransaction`
- `Refund`
- `Dispute`

La idea no es complicar por complicar.
La idea es representar mejor la realidad.

Porque:

- una orden puede tener más de un intento de pago
- una transacción puede cambiar de estado varias veces
- puede haber reembolsos parciales
- puede aparecer una disputa mucho después

Si todo eso vive apretado en un solo objeto plano, el sistema se vuelve difícil de razonar.

## Qué errores comunes aparecen

Algunos muy frecuentes son:

- marcar como pagado solo porque el frontend dijo que salió bien
- mezclar pago, fraude, orden y fulfillment en un solo estado
- no verificar autenticidad de webhooks
- no soportar duplicados ni reintentos
- no guardar referencias externas del proveedor
- no modelar reembolsos parciales
- no contemplar contracargos
- no tener proceso de conciliación
- asumir certeza donde en realidad hay estado ambiguo

## Qué preguntas conviene hacerse al diseñar pagos

Por ejemplo:

1. ¿qué fuente considero definitiva para confirmar un pago?
2. ¿distingo autorización, captura, acreditación y reembolso?
3. ¿qué parte del flujo puede ser asíncrona?
4. ¿qué estados ambiguos necesito representar sin mentirme?
5. ¿cómo evito duplicaciones y reintentos peligrosos?
6. ¿qué señales de riesgo deberían frenar o revisar fulfillment?
7. ¿cómo voy a conciliar lo que cree mi sistema con lo que informa el proveedor?
8. ¿qué eventos necesito registrar para auditoría y soporte?

## Relación con la lección anterior

La lección anterior se metió en:

- órdenes
- estados
- fulfillment real

Eso dio el eje operativo del e-commerce.

Esta lección se enfoca en una dimensión crítica de esa misma orden:
**el dinero, la incertidumbre del cobro y la necesidad de operar con confianza frente a pagos y fraude.**

## Relación con las lecciones que vienen

Esto conecta muy fuerte con lo que sigue:

- envíos, logística y tracking
- devoluciones, reembolsos y postventa
- backoffice y operación interna
- conciliación con sistemas externos

Porque muchas decisiones logísticas y operativas dependen de cuán confiable sea realmente el estado del pago.

## Buenas prácticas iniciales

## 1. Separar claramente orden, pago, fraude y fulfillment

Eso baja mucha confusión.

## 2. Tratar el pago como proceso, no como booleano

Hay etapas, transiciones y ambigüedades.

## 3. No confiar ciegamente en el frontend como fuente final

Confirmar por backend y fuentes más robustas.

## 4. Diseñar webhooks con idempotencia y verificación

En pagos esto es obligatorio.

## 5. Registrar referencias externas y eventos relevantes

La trazabilidad después salva tiempo y dinero.

## 6. Modelar reembolsos, disputas y estados dudosos

No todo termina en “pagado” o “rechazado”.

## 7. Tener alguna forma de conciliación

Manual al principio, más automatizada después, pero tiene que existir.

## Errores comunes

### 1. Marcar pago definitivo demasiado pronto

Después aparecen órdenes inconsistentes.

### 2. No distinguir entre aprobación comercial y cobro realmente confiable

Eso puede disparar fulfillment de forma prematura.

### 3. No soportar reintentos o eventos duplicados

Muy riesgoso en dinero real.

### 4. No modelar fraude ni revisión

El sistema queda ciego frente a riesgo.

### 5. No hacer conciliación

Tarde o temprano aparecen diferencias que nadie entiende.

### 6. Tratar reembolsos y contracargos como casos marginales

En producción real terminan importando mucho.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. si hoy integraras pagos, ¿qué fuente usarías para marcar una orden como realmente pagada?
2. ¿tu diseño soportaría pagos pendientes, aprobados, reembolsados y disputados sin mezclar todo?
3. ¿qué harías si el frontend muestra éxito pero el proveedor todavía no confirma nada al backend?
4. ¿qué señales de riesgo usarías para frenar un despacho?
5. ¿cómo detectarías que tu sistema cree haber cobrado algo que el proveedor no liquidó?

## Resumen

En esta lección viste que:

- en e-commerce, pagar no es un evento único sino un proceso con etapas y posibles ambigüedades
- autorización, captura, acreditación, reembolso y disputa no son lo mismo y conviene distinguirlos
- el backend no debería depender solo del frontend para declarar un pago como definitivo
- fraude y revisión de riesgo forman parte real del dominio de pagos
- conciliación operativa sirve para detectar diferencias entre lo que cree el sistema y lo que realmente ocurrió con el proveedor
- idempotencia, trazabilidad y buen modelado de estados son claves para operar con dinero real sin perder control

## Siguiente tema

Ahora que ya entendés mejor cómo pensar pagos, fraude y conciliación operativa, el siguiente paso natural es meterse en **envíos, logística y tracking**, porque una vez que el cobro está razonablemente bajo control, la siguiente gran complejidad del e-commerce aparece al mover físicamente la orden hasta el cliente.
