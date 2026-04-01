---
title: "Billing recurrente y suscripciones"
description: "Cómo modelar suscripciones, ciclos de facturación, renovaciones, estados comerciales y eventos de cobro en un backend SaaS sin mezclar el dominio del producto con la lógica del proveedor de pagos, sin perder trazabilidad y sin volver frágil la operación comercial." 
order: 173
module: "SaaS, billing y producto B2B"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos una distinción clave para cualquier SaaS serio:

- tenant
- plan
- entitlements
- límites

Eso nos ayudó a separar mejor la identidad del cliente,
la estructura de la cuenta,
las capacidades habilitadas
y las restricciones operativas.

Pero todavía falta una pieza central.

Porque una cosa es saber **qué puede hacer una cuenta**,
y otra bastante distinta es saber **qué relación comercial tiene hoy con el producto**.

Ahí aparece el mundo de:

- suscripciones
- renovaciones
- vencimientos
- cobros periódicos
- upgrades
- downgrades
- cancelaciones
- períodos de gracia
- estados de pago
- eventos del proveedor de billing

Y este punto es mucho más delicado de lo que parece.

Muchos sistemas arrancan con una idea demasiado simple:

- el cliente elige un plan
- se guarda un campo `plan = pro`
- si paga, está activo
- si no paga, se bloquea

Al principio parece suficiente.
Después llegan los casos reales:

- clientes mensuales y anuales
- pruebas gratis con fecha de fin
- upgrades inmediatos
- downgrades diferidos a la próxima renovación
- pagos fallidos con reintentos
- cancelaciones programadas
- cuentas suspendidas pero no eliminadas
- cobros que se procesan en un proveedor externo pero tardan en reflejarse
- suscripciones con add-ons
- contratos enterprise con condiciones distintas

Entonces se vuelve evidente algo importante:

**billing recurrente no es solo cobrar; es modelar correctamente el estado comercial de una cuenta a lo largo del tiempo.**

## El error más común: confundir plan con suscripción

Esto pasa muchísimo.

Ya vimos que el plan representa una definición comercial o de producto.
Por ejemplo:

- Free
- Pro
- Business
- Enterprise

Pero la suscripción representa otra cosa.

Representa la **relación activa y temporal** entre un tenant y ese plan.

Por ejemplo:

- qué plan tiene hoy
- desde cuándo lo tiene
- hasta cuándo corre el período actual
- si renueva automáticamente o no
- si está en trial
- si está cancelada al final del período
- si hubo un fallo de cobro
- si está suspendida
- si existe un cambio programado para el próximo ciclo

Dicho simple:

- el **plan** es el producto comercial ofertado
- la **suscripción** es el estado vivo de una cuenta respecto de ese producto

Parece una diferencia menor.
Pero si no la separás, el backend se vuelve confuso muy rápido.

## Una suscripción no es solo “activa o inactiva”

Otro error frecuente es modelar la suscripción con muy pocos estados.

Algo así:

- active
- inactive

Eso rara vez alcanza en un SaaS real.

Porque entre “todo bien” y “no tiene servicio” hay muchos matices operativos y comerciales.

Por ejemplo, una suscripción puede estar:

- en **trial**
- **activa** y al día
- **activa con cancelación programada** al final del período
- en **grace period** por fallo de cobro
- **past due** o con deuda pendiente
- **paused** por acuerdo especial
- **suspendida** por problema operativo o financiero
- **cancelada**, pero todavía con acceso hasta cierta fecha
- **expirada**

Si el sistema no representa esos estados con claridad, después aparecen problemas como:

- acceso cortado antes de tiempo
- cuentas con servicio cuando no deberían tenerlo
- soporte sin visibilidad clara
- lógica repetida en varios lugares
- decisiones inconsistentes entre backend, backoffice y proveedor de billing

## Qué debería representar una suscripción

No hay un único modelo correcto.
Pero conceptualmente una suscripción suele necesitar responder preguntas como estas:

- ¿a qué tenant pertenece?
- ¿qué plan tiene asociado?
- ¿cuál es el período vigente?
- ¿renueva automáticamente?
- ¿cuál es su estado comercial actual?
- ¿hubo una cancelación solicitada?
- ¿hay un cambio de plan pendiente?
- ¿cuál fue el último resultado de facturación?
- ¿qué proveedor externo la representa?
- ¿qué eventos ya procesamos y cuáles no?

En otras palabras:

**la suscripción es una pieza del modelo de negocio, no solo un reflejo del proveedor de pagos.**

## Billing no debería estar pegado al nombre del plan

En productos simples se cae fácil en algo como esto:

- si plan es Pro, cobrar X
- si plan es Business, cobrar Y
- si plan es Enterprise, resolver manualmente

Eso funciona poco tiempo.

Después aparecen más variables:

- facturación mensual o anual
- descuentos temporales
- promociones de onboarding
- add-ons
- cargos por exceso
- monedas distintas
- impuestos
- contratos personalizados
- grandfathering de precios antiguos

Entonces conviene separar varias cosas:

- **plan de producto**
- **precio o pricing vigente**
- **suscripción efectiva del tenant**
- **eventos de facturación**
- **estado de cobro**

Si todo queda mezclado en una sola etiqueta, cambiar precios o condiciones se vuelve riesgoso.

## Una estructura mental útil: catálogo comercial, suscripción y facturación

En muchos SaaS ayuda pensar en tres capas relacionadas, pero separadas.

### 1. Catálogo comercial

Describe la oferta.
Por ejemplo:

- planes
- intervalos de facturación
- precios base
- add-ons disponibles
- reglas de elegibilidad

Es la definición comercial del producto.

### 2. Suscripción

Describe el acuerdo activo de un tenant con ese catálogo.
Por ejemplo:

- plan contratado
- ciclo mensual o anual
- estado actual
- fechas importantes
- cancelación futura
- cambio pendiente

Es el estado vivo de la relación comercial.

### 3. Facturación y cobro

Describe qué pasó operativamente con el dinero.
Por ejemplo:

- invoice generada
- intento de cobro
- cobro exitoso
- pago fallido
- reintento
- crédito aplicado
- nota de ajuste

Es la parte transaccional y financiera del sistema.

Separar estas capas evita un montón de acoplamientos peligrosos.

## El backend no debería depender ciegamente del proveedor de pagos

Éste es un principio muy importante.

En muchos SaaS, Stripe, Paddle, Mercado Pago, Adyen u otro proveedor participa del billing.
Eso está perfecto.

Pero el backend no debería modelar su verdad interna únicamente a partir de nombres, estados o eventos del proveedor como si fueran el dominio completo del producto.

¿Por qué?

Porque los proveedores:

- tienen sus propios estados
- usan su propia terminología
- pueden cambiar ciertos comportamientos
- pueden reenviar eventos
- pueden enviar eventos fuera de orden
- representan bien el pago, pero no necesariamente toda la lógica de acceso del producto

Entonces conviene pensar así:

- el proveedor es una **fuente externa importante**
- nuestro backend mantiene una **representación propia del estado comercial**
- los webhooks y callbacks actualizan ese estado mediante reglas explícitas
- no todo evento externo implica un cambio inmediato de acceso sin validación interna

Dicho de otra forma:

**integrarse con billing externo no significa tercerizar completamente el modelo comercial del SaaS.**

## Eventos de billing: donde empieza mucha complejidad real

La complejidad no suele venir del primer cobro.
Suele venir de la secuencia de eventos en el tiempo.

Por ejemplo:

- se crea la suscripción
- arranca un trial
- vence el trial
- se genera una invoice
- el cobro falla
- se reintenta
- el cliente actualiza su medio de pago
- el cobro entra
- se programa una cancelación al fin de período
- antes de vencer, el cliente hace upgrade
- después pide downgrade para el próximo ciclo

Si el backend no tiene una máquina mental clara para procesar esa historia, aparecen errores como:

- dobles activaciones
- cancelaciones mal resueltas
- cambios de plan aplicados antes de tiempo
- pérdida de trazabilidad
- estados imposibles de explicar

Por eso en billing recurrente conviene tratar los eventos como parte importante del diseño.
No como simples notificaciones accesorias.

## Renovación automática: un detalle que impacta mucho

En SaaS, una suscripción suele funcionar por períodos.
Por ejemplo:

- mensual
- trimestral
- anual

Y ahí aparece una pregunta operativa clave:

**¿qué pasa al final del período actual?**

Algunas posibilidades:

- renovar automáticamente
- no renovar y dejar expirar
- renovar con precio actualizado
- renovar respetando precio antiguo
- renovar con cambio de plan pendiente

Esto implica que la suscripción no solo necesita un estado actual.
También suele necesitar una noción de:

- fecha de inicio del período actual
- fecha de fin del período actual
- si auto-renueva
- qué acción está programada al cierre del ciclo

Ese detalle es importante porque muchísimas reglas de negocio dependen de eso.

## Cancelar no siempre significa cortar acceso ya mismo

Éste es otro punto donde suelen aparecer errores.

Muchos equipos implementan “cancelar suscripción” como si fuera:

- desactivar ahora
- bloquear ahora
- bajar plan ahora

Pero en muchos SaaS la cancelación significa otra cosa.
Significa:

- no renovar al final del período ya pago

Eso cambia bastante la lógica.

Porque una cuenta puede estar:

- activa hoy
- cancelada para el futuro
- todavía con acceso hasta el cierre del ciclo

Si no diferenciás bien eso, terminás castigando al cliente antes de tiempo o generando inconsistencias entre lo que se prometió comercialmente y lo que hace el backend.

## Upgrade y downgrade rara vez se comportan igual

En general, un **upgrade** suele tender a aplicarse rápido.
Porque el cliente quiere más capacidad ahora.

En cambio, un **downgrade** muchas veces se difiere al próximo período para no recortar beneficios ya pagos.

No siempre es así,
pero es un patrón muy común.

Entonces el sistema debería poder representar cosas como:

- plan actual efectivo
- plan siguiente programado
- fecha a partir de la cual cambia
- si requiere prorrateo
- si requiere ajuste de límites inmediatos o diferidos

Si esto no está modelado, el backend termina con lógica ambigua y soporte manual para resolver casos que deberían ser normales.

## Facturación recurrente y acceso al producto no son exactamente lo mismo

Ésta es otra separación sana.

El billing responde preguntas como:

- ¿hay una invoice emitida?
- ¿se intentó cobrar?
- ¿se cobró?
- ¿hay deuda?
- ¿la suscripción renovó?

El acceso al producto responde preguntas como:

- ¿esta cuenta puede usar la feature hoy?
- ¿debe seguir operativa durante gracia?
- ¿está suspendida?
- ¿debe limitarse parcialmente?
- ¿debe pasar a modo lectura?

A veces ambos mundos coinciden.
A veces no exactamente.

Por ejemplo:

- una invoice puede fallar hoy, pero el producto puede mantener acceso por algunos días
- una cuenta enterprise puede seguir operativa mientras finanzas resuelve un tema contractual
- una suscripción puede estar cancelada, pero con acceso vigente hasta fin de ciclo

Por eso conviene definir explícitamente la relación entre:

- estado de suscripción
- estado financiero
- estado de acceso del producto

No asumir que uno reemplaza automáticamente al otro.

## Qué suele romper un diseño de billing demasiado ingenuo

### 1. Guardar solo el nombre del plan actual

Después no sabés nada sobre períodos, renovaciones, cambios futuros o historia comercial.

### 2. Depender completamente del estado textual del proveedor externo

El dominio del producto queda atado a una semántica que no controlás.

### 3. Procesar webhooks sin idempotencia

En billing esto es especialmente grave.
Los eventos pueden repetirse o llegar desordenados.

### 4. Mezclar invoices, cobros y acceso en una sola bandera

Entonces cualquier cambio financiero impacta de forma brusca y poco explicable en la cuenta.

### 5. No guardar historia de cambios

Después nadie sabe:

- cuándo cambió el plan
- quién lo cambió
- si fue automático o manual
- por qué se suspendió una cuenta
- cuándo vencía realmente el ciclo

### 6. Resolver casos edge directamente desde soporte sin traza seria

El sistema termina con estados difíciles de auditar y imposibles de reproducir bien.

## Un ejemplo conceptual sano

Imaginá un SaaS B2B con planes Free, Pro y Business.
Podrías pensar algo así:

- `tenant`
- `plan_catalog`
- `price_catalog`
- `subscription`
- `subscription_change_schedule`
- `invoice`
- `payment_attempt`
- `billing_event_log`
- `access_state`

Entonces, por ejemplo, una renovación podría seguir una secuencia como esta:

1. llega la fecha de renovación
2. se genera la invoice del período siguiente
3. se intenta el cobro
4. si el cobro sale bien, se confirma el nuevo período
5. si falla, se entra en estado de deuda o gracia según política
6. se actualiza el estado de acceso del producto si corresponde
7. se registra trazabilidad completa

Fijate que ahí no alcanza con poner `plan = pro`.
Hay una historia comercial y operativa bastante más rica.

## Qué conviene decidir explícitamente

Antes de implementar billing recurrente, conviene responder preguntas como estas:

1. ¿qué representa exactamente una suscripción en nuestro sistema?
2. ¿qué diferencia hay entre plan, precio, suscripción y acceso?
3. ¿qué estados comerciales necesitamos de verdad?
4. ¿cómo tratamos pagos fallidos?
5. ¿hay grace period?
6. ¿cuándo una cancelación corta acceso y cuándo solo evita renovar?
7. ¿cómo se modelan upgrades y downgrades?
8. ¿qué eventos del proveedor procesamos y cuáles solo registramos?
9. ¿cómo garantizamos idempotencia y orden lógico en webhooks?
10. ¿cómo auditaríamos dentro de seis meses por qué una cuenta tenía cierto estado comercial?

## Señales de que el billing está mal modelado

- soporte tiene que entrar al proveedor externo para entender qué pasó con una cuenta
- el backend no puede explicar con claridad por qué una cuenta tiene acceso o no
- cambiar de plan rompe límites o entitlements de forma inesperada
- los fallos de cobro generan comportamientos inconsistentes
- el sistema no distingue entre cancelación inmediata y cancelación al fin del período
- los upgrades y downgrades se resuelven con parches manuales
- hay una sola bandera para resumir demasiadas realidades distintas
- nadie puede reconstruir la historia comercial de una cuenta sin mirar varias tablas y logs externos

Si eso pasa, probablemente el problema no sea solo de pagos.
Probablemente sea de **modelado comercial insuficiente**.

## Lo que deberías llevarte de esta lección

Si tuvieras que quedarte con una sola idea, que sea ésta:

**billing recurrente no consiste solo en cobrar periódicamente; consiste en modelar con claridad la relación comercial viva entre el tenant, la suscripción, los eventos de facturación y el acceso efectivo al producto.**

Cuando eso se mezcla mal:

- el soporte se vuelve opaco
- los cambios de plan se vuelven riesgosos
- la operación comercial depende de parches
- la trazabilidad se pierde
- el producto reacciona mal ante pagos, renovaciones o cancelaciones

Cuando se modela bien:

- el comportamiento es explicable
- los cambios son más seguros
- la operación comercial escala mejor
- soporte trabaja con más claridad
- el backend puede crecer sin quedar rehén del proveedor externo

## Cierre

Billing recurrente y suscripciones son una parte central del backend SaaS.

Porque ahí se define:

- cómo se representa la relación comercial con cada tenant
- cómo se expresan períodos y renovaciones
- cómo se manejan cobros, fallos y cancelaciones
- cómo se conecta el dinero con el acceso al producto
- cómo se conserva trazabilidad operativa y comercial

Si esta capa está bien modelada, el sistema gana claridad.
Y una vez que eso está firme, el siguiente paso natural es entrar en otro problema muy común en SaaS real:

**qué hacer cuando la cuenta cambia en el tiempo, prueba el producto, sube de plan, baja de plan o modifica su relación comercial mientras sigue operando.**

Ahí entramos en el próximo tema: **trials, upgrades, downgrades y cambios de plan**.
