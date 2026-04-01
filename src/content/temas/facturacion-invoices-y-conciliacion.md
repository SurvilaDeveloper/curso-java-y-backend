---
title: "Facturación, invoices y conciliación"
description: "Cómo modelar la facturación en un producto SaaS, qué diferencia hay entre cobro, invoice y registro contable-operativo, y por qué la conciliación es clave para que billing no se vuelva una fuente silenciosa de errores." 
order: 177
module: "SaaS, billing y producto B2B"
level: "intermedio"
draft: false
---

## Introducción

Cuando alguien empieza a construir billing para un producto SaaS, muchas veces piensa primero en una sola cosa:

**cobrar.**

Y sí, cobrar importa.

Pero en un sistema real, billing no es solo “pasar la tarjeta”.

También involucra:

- decidir qué se cobra
- registrar por qué se cobra
- emitir o representar correctamente ese cobro
- saber qué quedó pendiente
- entender qué fue exitoso, qué falló y qué quedó dudoso
- poder explicarle al cliente qué pasó
- poder explicárselo al área operativa o financiera
- detectar inconsistencias entre tu sistema y el proveedor de pagos

Ahí aparecen tres conceptos que conviene separar muy bien desde temprano:

- **facturación**
- **invoices**
- **conciliación**

Si esos conceptos se mezclan, el sistema se vuelve confuso rápido.

Y lo peor es que el problema no siempre explota enseguida.
A veces el producto parece funcionar… hasta que aparecen preguntas incómodas como estas:

- “¿por qué a este cliente se le habilitó el plan si el cobro no entró?”
- “¿por qué este invoice figura pago pero el gateway no muestra transacción exitosa?”
- “¿por qué hay diferencias entre lo que dice nuestra base y lo que dice Stripe?”
- “¿por qué soporte no puede explicar qué pasó con esta renovación?”
- “¿por qué finanzas dice que faltan cobros o sobran registros?”

Esta lección trata justamente de eso:
**cómo pensar facturación, invoices y conciliación de forma seria en un SaaS real.**

## Qué significa “facturación” en un SaaS

En este contexto, facturación no es solo el acto legal o fiscal de emitir una factura formal, porque eso depende mucho del país, del marco impositivo y del tipo de cliente.

Acá vamos a pensar “facturación” como la parte del sistema que define y registra el cargo económico que corresponde por el uso del producto.

Por ejemplo:

- renovación mensual de una suscripción
- cargo anual de un plan enterprise
- cobro prorrateado por upgrade
- cargo variable por uso excedente
- crédito o ajuste a favor
- descuento aplicado
- recargo extraordinario

O sea:

**facturar es materializar económicamente una decisión comercial del producto.**

No es solo cobrar.
Es convertir reglas de negocio en un registro económico entendible.

## Billing no es lo mismo que payment

Esta distinción es fundamental.

Muchas veces se usa “billing” como si fuera sinónimo de “payment”, pero no son lo mismo.

### Billing

Se ocupa de cosas como:

- plan
- precio
- ciclo
- moneda
- período facturado
- descuentos
- impuestos
- créditos
- cargos generados
- invoices
- estado de la deuda o del cargo

### Payment

Se ocupa más de:

- medio de pago
- intento de cobro
- autorización
- captura
- rechazo
- reintento
- devolución
- referencia externa del procesador
- fraude
- estado transaccional del dinero

Dicho simple:

- **billing decide y registra qué debería cobrarse**
- **payments ejecuta o intenta ejecutar el cobro**

En productos simples, ambas cosas pueden parecer una sola.
En sistemas más reales, separar la idea evita muchísimos errores conceptuales.

## Qué es un invoice

Un invoice es una representación estructurada de un cargo.

Puede tener valor fiscal, contractual, operativo o simplemente informativo, según el producto y el contexto.

Pero a nivel de backend, conviene pensarlo como una entidad que expresa claramente:

- a quién se le cobra
- por qué se le cobra
- cuánto se le cobra
- en qué moneda
- a qué período corresponde
- qué ítems componen el cargo
- qué descuentos o impuestos aplicaron
- cuál es su estado
- si fue pagado, perdonado, anulado, ajustado o sigue pendiente

Por ejemplo, un invoice podría contener:

- plan Pro mensual
- período: 1 al 31 de marzo
- 3 usuarios incluidos
- 2 asientos extra
- descuento promocional del 20%
- impuesto aplicable
- total final

Eso ya es muchísimo más claro que simplemente guardar:

- `amount = 129.99`
- `status = paid`

Porque cuando el sistema crece, el total solo no explica nada.

## Por qué el invoice importa tanto

Porque se vuelve el punto central para responder preguntas de negocio y operación.

Por ejemplo:

- qué se cobró exactamente
- qué quedó pendiente
- qué ciclo se está pagando
- qué efecto tuvo un cambio de plan
- qué invoice corresponde a una renovación
- qué invoice originó cierto intento de pago
- qué invoice necesita reintento
- qué invoice fue perdonado manualmente
- qué invoice quedó inconsistente

Además, soporte, finanzas y producto suelen necesitar mirar el problema desde el invoice y no solo desde la transacción del gateway.

Una transacción te dice que hubo un intento de dinero.
Un invoice te dice **qué obligación económica del producto estaba detrás de ese intento**.

## Invoice e invoice line items

En productos SaaS un poco más serios, no conviene modelar el invoice como una sola cifra opaca.

Conviene pensar también en sus componentes.

Por eso suele aparecer la idea de **line items** o líneas del invoice.

Por ejemplo:

- plan base: 100 USD
- 5 usuarios extra: 25 USD
- descuento anual: -15 USD
- créditos aplicados: -10 USD
- impuesto: 21 USD
- total: 121 USD

Esto ayuda muchísimo para:

- auditar el cálculo
- explicar el cargo
- revisar prorrateos
- hacer ajustes parciales
- conciliar con mayor claridad
- mostrar el detalle en UI o emails

Cuando todo queda reducido a “un total”, más adelante cada explicación se vuelve una investigación arqueológica.

## Estados típicos de un invoice

Depende del sistema, pero suele ser útil distinguir estados como:

- `draft`
- `open`
- `pending_payment`
- `paid`
- `partially_paid`
- `void`
- `uncollectible`
- `refunded` o `credited`

No hace falta usar exactamente esos nombres.
Lo importante es que el modelo exprese algo entendible.

Un error común es usar un solo campo `status` para mezclar demasiadas cosas, por ejemplo:

- estado del invoice
- estado del payment
- estado comercial del cliente
- estado del acceso al producto

Eso genera confusión enseguida.

Conviene separar:

- **estado del invoice**
- **estado del intento de pago**
- **estado de la suscripción**
- **estado del acceso o entitlement**

Porque son cosas relacionadas, pero no idénticas.

## Qué es conciliación

Conciliación es el proceso de verificar que los distintos registros del sistema coinciden razonablemente entre sí.

En billing, eso suele significar comparar o relacionar:

- lo que tu sistema cree que generó
- lo que el proveedor de pagos dice que intentó o cobró
- lo que efectivamente quedó registrado como pago
- lo que el cliente ve
- lo que finanzas espera encontrar

En otras palabras:

**conciliar es comprobar que la historia económica del sistema tiene sentido extremo a extremo.**

## Por qué la conciliación importa tanto

Porque en sistemas reales aparecen diferencias.
Y no siempre son por bugs enormes.

A veces pasan cosas como:

- webhook que llegó tarde
- reintento automático del gateway
- timeout después de un cobro exitoso
- duplicación de evento
- cambio manual desde soporte
- invoice anulado sin ajustar pago asociado
- crédito aplicado en tu sistema pero no reflejado como esperabas
- moneda o impuesto calculado distinto en un edge case

Sin conciliación, esas diferencias se acumulan silenciosamente.

Y después aparecen consecuencias muy costosas:

- clientes mal cobrados
- acceso habilitado cuando no corresponde
- acceso bloqueado cuando sí pagaron
- reportes de revenue incorrectos
- soporte sin trazabilidad
- finanzas desconfiando del sistema

## Qué cosas se suelen conciliar

Por ejemplo:

- invoices abiertos sin intento de pago cuando debería existir uno
- invoices marcados como pagados sin evidencia transaccional válida
- pagos exitosos sin invoice asociado
- diferencias entre monto esperado y monto cobrado
- duplicados de cobro
- refunds no reflejados en estado interno
- suscripciones activas con invoices vencidos no resueltos
- usage billing calculado distinto del monto final emitido
- períodos superpuestos o faltantes en renovaciones

La conciliación puede ser:

- online, en tiempo real o casi real
- asíncrona, por jobs periódicos
- manual asistida
- híbrida

## Conciliación no es desconfianza: es diseño maduro

A veces se diseña como si el proveedor externo siempre fuera perfectamente consistente y como si tu sistema siempre procesara todo sin fallos.

Ese supuesto es demasiado optimista.

Diseñar conciliación no significa asumir desastre permanente.
Significa aceptar algo muy real:

**los sistemas distribuidos y las integraciones de dinero tienen incertidumbre.**

Y cuando hay incertidumbre, necesitás mecanismos para detectar y resolver diferencias.

## Ejemplo concreto

Supongamos este flujo:

1. se genera un invoice mensual por 100 USD
2. se intenta el cobro con el gateway
3. el gateway cobra correctamente
4. tu sistema no recibe la confirmación a tiempo por un timeout
5. el invoice queda en `pending_payment`
6. la suscripción entra en una zona dudosa
7. más tarde llega un webhook tardío o una tarea de conciliación consulta el estado real

Si no pensaste conciliación, podés terminar con:

- invoice pendiente aunque el cliente sí pagó
- acceso bloqueado injustamente
- soporte diciendo “acá figura impago”
- cliente enojado con razón

En cambio, si diseñaste bien:

- existe correlación entre invoice e intento de pago
- existe estado intermedio de incertidumbre
- existe job de reconciliación
- existe criterio claro para actualizar estado sin duplicar efectos

Eso cambia muchísimo la robustez del producto.

## Modelos útiles para pensar la relación

Una forma práctica de pensar el problema es separar entidades como:

- `Subscription`
- `Invoice`
- `InvoiceLineItem`
- `PaymentAttempt`
- `PaymentTransaction`
- `CreditNote` o `Adjustment`
- `ReconciliationIssue`

No siempre necesitás todas desde el día uno.

Pero conceptualmente ayuda mucho distinguir:

- la obligación económica
- el detalle del cargo
- el intento de cobro
- el resultado financiero
- los ajustes posteriores
- los desvíos detectados

Cuando todo eso colapsa en una sola tabla improvisada, el sistema se vuelve muy difícil de evolucionar.

## Qué preguntas conviene poder responder

Un backend de billing razonable debería permitir responder con claridad:

1. ¿qué invoice corresponde al ciclo actual?
2. ¿qué se estaba cobrando exactamente?
3. ¿qué payment attempts hubo?
4. ¿cuál fue el resultado final del cobro?
5. ¿hubo reintentos?
6. ¿hubo ajustes, créditos o refunds?
7. ¿el estado interno coincide con el proveedor externo?
8. ¿el acceso del cliente refleja correctamente la situación económica?
9. ¿hay algo incierto o pendiente de conciliación?

Si tu modelo no deja responder eso sin mirar logs manualmente, probablemente todavía está verde.

## Errores comunes

### 1. Tratar invoice y payment como la misma cosa

Eso vuelve opaco todo el modelo.

### 2. Guardar solo el monto final sin detalle

Después explicar cargos o ajustes se vuelve dificilísimo.

### 3. Mezclar estado comercial, estado de cobro y estado de acceso

Eso genera bugs conceptuales y operativos.

### 4. Asumir que un webhook siempre llega bien y a tiempo

Demasiado frágil para sistemas reales.

### 5. No prever conciliación porque “el proveedor ya lo resuelve”

El proveedor resuelve su parte, no necesariamente la consistencia completa de tu producto.

### 6. No poder reconstruir la historia de un cobro

Muy grave para soporte, auditoría y confianza del sistema.

### 7. Hacer ajustes manuales sin trazabilidad clara

Después nadie entiende por qué un cliente quedó en cierto estado.

## Relación con los temas anteriores

Esto conecta directamente con lo que viste antes:

- **billing recurrente y suscripciones** te dio el marco del cobro periódico
- **trials, upgrades, downgrades y cambios de plan** mostró que el monto no siempre es fijo ni trivial
- **metering y usage-based billing** agregó variabilidad por consumo
- **entitlements y feature access por plan** separó acceso de facturación

Ahora el paso siguiente es entender cómo convertir todo eso en registros económicos claros y operables.

Porque una cosa es definir el plan.
Otra es **dejar bien representado qué se cobró, qué se intentó cobrar y qué quedó pendiente de revisar**.

## Buenas prácticas iniciales

## 1. Separar claramente invoice, payment y subscription

Aunque estén conectados, no representan lo mismo.

## 2. Modelar detalle del cargo

Aunque sea de forma modesta, ayuda muchísimo.

## 3. Diseñar estados explícitos para zonas inciertas

No fuerces “paid” o “failed” cuando todavía no sabés bien qué pasó.

## 4. Correlacionar todo con identificadores claros

Invoice, intento de pago, transacción externa y evento de conciliación deberían poder relacionarse.

## 5. Pensar conciliación desde el diseño y no como parche tardío

Porque después cuesta muchísimo reconstruir trazabilidad.

## 6. Registrar ajustes y acciones manuales

Toda corrección manual debería dejar rastro.

## 7. Separar lógica operativa de lógica fiscal si hace falta

Según el país o negocio, quizás necesites una capa adicional para temas impositivos o legales.

## Mini ejercicio mental

Pensá estas preguntas:

1. si hoy cobrases una suscripción mensual, ¿podrías explicar con claridad qué invoice originó el cobro?
2. ¿tu modelo distingue entre obligación de pago e intento de cobro?
3. ¿qué pasaría si el gateway cobra pero tu sistema no recibe confirmación inmediata?
4. ¿cómo detectarías un pago exitoso sin invoice asociado, o un invoice pago sin transacción válida?
5. ¿soporte podría reconstruir la historia de un cliente sin revisar logs técnicos manualmente?

## Resumen

En esta lección viste que:

- billing no es lo mismo que payment, aunque estén estrechamente relacionados
- un invoice representa de forma estructurada qué se cobra, a quién, por qué y en qué período
- modelar líneas o componentes del invoice mejora trazabilidad, explicación y auditoría
- conciliación consiste en verificar que invoices, pagos, estados internos y registros externos cuenten una historia consistente
- los sistemas reales necesitan contemplar diferencias, retrasos, duplicados e incertidumbre en flujos de cobro
- separar bien invoice, payment, suscripción, acceso y ajustes hace que el backend sea mucho más robusto, entendible y operable

## Siguiente tema

Ahora que ya entendés cómo representar cargos, invoices y consistencia económica dentro del sistema, el siguiente paso natural es aprender sobre **cobros fallidos, dunning y recuperación**, porque en un SaaS real una parte clave del negocio no está solo en cobrar cuando todo sale bien, sino en saber qué hacer cuando la renovación falla, cómo recuperar ingresos y cómo evitar que un problema transaccional termine convirtiéndose en churn evitable.
