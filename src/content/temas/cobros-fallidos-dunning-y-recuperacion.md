---
title: "Cobros fallidos, dunning y recuperación"
description: "Cómo diseñar en un SaaS real el manejo de renovaciones fallidas, reintentos de cobro, comunicación con el cliente, degradación del acceso y estrategias de recuperación para que un problema transaccional no termine innecesariamente en churn." 
order: 178
module: "SaaS, billing y producto B2B"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos cómo pensar:

- facturación
- invoices
- intentos de cobro
- conciliación
- consistencia entre tu sistema y el proveedor de pagos

Eso te da una base muy importante.

Pero todavía falta una parte decisiva del mundo real.

Porque en cualquier SaaS serio no todos los cobros salen bien.

Y no hablamos solo de errores excepcionales.
Hablamos de algo estructural.

Siempre va a existir un porcentaje de casos donde pase alguna de estas cosas:

- la tarjeta venció
- el banco rechazó el pago
- no hay fondos
- el método de pago fue removido
- hubo un error temporal del procesador
- falló la autenticación del pago
- el cliente cambió de tarjeta y no la actualizó
- hubo un problema de red o de confirmación
- el cobro quedó incierto

Entonces aparece un tema central para cualquier producto SaaS con suscripciones:

**qué hacer cuando el cobro falla.**

Y ahí entra una palabra muy importante en billing moderno:

**dunning.**

No es un tema glamoroso.
Pero sí es uno de los que más impacto puede tener en:

- ingresos recuperados
- churn evitable
- experiencia del cliente
- salud operativa del producto
- claridad entre billing, soporte y access control

Porque una gran diferencia entre un SaaS improvisado y uno serio no está solo en cobrar bien cuando todo funciona.
También está en **manejar bien lo que pasa cuando deja de funcionar**.

## Qué significa realmente “cobro fallido”

A primera vista parece simple.

Un cobro fallido sería “el pago no entró”.

Pero en sistemas reales conviene distinguir varios escenarios distintos.

Por ejemplo:

- el gateway respondió rechazo definitivo
- el gateway respondió error temporal
- el banco pidió reintento posterior
- el pago quedó pendiente o incierto
- el intento no llegó a ejecutarse por un error interno
- el cobro sí pudo haberse hecho, pero tu sistema todavía no logró confirmarlo bien

O sea:

**“falló el cobro” no siempre significa lo mismo.**

Y si el backend trata todos esos casos como un solo estado bruto tipo `payment_failed`, termina tomando malas decisiones.

Porque no es lo mismo:

- pedirle al cliente que actualice su tarjeta
- reintentar automáticamente más tarde
- abrir una reconciliación interna
- degradar acceso
- mantener un período de gracia
- escalar a soporte o a revisión manual

## Qué es dunning

Dunning es el conjunto de procesos orientados a recuperar ingresos cuando un cobro recurrente falla.

Incluye cosas como:

- detectar el fallo
- clasificar la causa
- decidir si corresponde reintento automático
- avisarle al cliente
- pedir actualización del método de pago
- aplicar un período de gracia
- degradar o suspender acceso si corresponde
- cerrar el caso cuando el pago entra o cuando ya no es recuperable

Dicho simple:

**dunning = estrategia técnica y operativa para manejar deuda recurrente y tratar de recuperar el cobro sin destruir la experiencia del cliente.**

No es solo enviar un mail.
No es solo reintentar una tarjeta.
No es solo cambiar un estado.

Es una combinación de:

- billing
- pagos
- producto
- comunicación
- acceso
- operaciones

## Por qué esto importa tanto en un SaaS

Porque una parte del churn no ocurre porque el cliente ya no quiera el producto.

Ocurre por fricción de cobro.

Por ejemplo:

- una tarjeta vencida
- un rechazo bancario temporal
- una autenticación pendiente
- un método de pago corporativo que cambió
- un comprador que nunca vio el aviso
- un proceso de reintento mal diseñado

Si el sistema corta acceso demasiado pronto, pierde un cliente recuperable.

Si el sistema tarda demasiado o actúa sin claridad, acumula deuda, soporte y confusión.

Si el sistema no sabe diferenciar bien entre causa temporal y causa definitiva, mezcla casos muy distintos.

Y si además billing, entitlements y acceso están mal desacoplados, el resultado suele ser una mezcla peligrosa de:

- ingresos perdidos
- clientes enojados
- soporte sobrecargado
- estados inconsistentes
- decisiones manuales improvisadas

## El error más común: pensar solo en “reintentar N veces”

Muchos sistemas arrancan con una lógica parecida a esta:

- si falla, reintentar 3 veces
- si sigue fallando, cancelar

Eso puede parecer razonable.
Pero es demasiado pobre para un SaaS real.

¿Por qué?

Porque ignora preguntas clave como:

- ¿falló por un motivo transitorio o definitivo?
- ¿el cliente tiene historial sano o viene en mora hace rato?
- ¿es un tenant chico o una cuenta enterprise?
- ¿conviene suspender acceso, degradarlo o mantener gracia temporal?
- ¿el producto necesita una acción del usuario para recuperar el pago?
- ¿el método de pago actual permite smart retries?
- ¿el problema es de fondos, autenticación, vencimiento o configuración?
- ¿hubo comunicación efectiva con el cliente?

Entonces, más que pensar solo en “cantidad de reintentos”, conviene pensar en una **política de recuperación**.

## Separar intento fallido, deuda abierta y suscripción en riesgo

Esta separación es muy importante.

### Intento fallido

Es el evento transaccional puntual.

Ejemplo:

- se intentó cobrar el invoice 2026-03
- el gateway devolvió rechazo por tarjeta vencida

### Deuda abierta

Es la obligación económica que sigue pendiente.

Ejemplo:

- el invoice sigue `open`
- el monto todavía no fue pagado

### Suscripción en riesgo

Es el estado comercial-operativo de la relación con el cliente.

Ejemplo:

- plan activo pero en grace period
- renovación pendiente de recuperación
- acceso parcialmente degradado
- cancelación programada si no se regulariza

Si estas tres cosas se mezclan en un solo `status`, el sistema se vuelve muy difícil de razonar.

## Tipos comunes de causas de fallo

No todas las causas merecen el mismo tratamiento.

Conviene distinguir al menos entre estas familias:

### 1. Fallos transitorios

Ejemplos:

- error temporal del procesador
- timeout
- indisponibilidad momentánea
- rechazo blando del banco

Suelen justificar reintentos automáticos.

### 2. Fallos por fondos o límite

Ejemplos:

- fondos insuficientes
- límite excedido

A veces se recuperan con reintentos posteriores.

### 3. Fallos por credencial o método inválido

Ejemplos:

- tarjeta vencida
- tarjeta reemplazada
- método eliminado

Acá el reintento puro suele servir poco si el cliente no actualiza el medio de pago.

### 4. Fallos que requieren acción del cliente

Ejemplos:

- autenticación 3DS pendiente
- verificación adicional
- aprobación del titular

Acá el sistema tiene que guiar al usuario, no solo reintentar en silencio.

### 5. Fallos inciertos o ambiguos

Ejemplos:

- no sabés si el cobro entró
- el webhook no llegó
- el proveedor respondió algo inconsistente

Acá conviene ir a estado de revisión o conciliación antes de cortar acceso por reflejo.

## Qué debería modelar un sistema de dunning

Aunque la implementación concreta varíe, conviene que el backend pueda representar cosas como:

- invoice pendiente
- cantidad de intentos realizados
- fecha y resultado de cada intento
- causa o categoría del fallo
- próximo reintento programado
- estado del caso de recuperación
- fecha de fin del grace period
- acciones de comunicación disparadas
- necesidad de actualización de medio de pago
- decisión de acceso asociada
- resolución final del caso

Por ejemplo, podrías tener conceptos como:

- `payment_attempt`
- `collection_case`
- `dunning_stage`
- `grace_period_until`
- `requires_payment_method_update`
- `recovery_outcome`

No hace falta usar exactamente esos nombres.
Lo importante es que el modelo no esconda bajo una sola etiqueta lo que en realidad son procesos distintos.

## Reintentos automáticos: cuándo sí y cuándo no

Los reintentos son valiosos, pero mal usados también generan ruido.

### Cuándo suelen ayudar

- rechazos blandos
- fondos insuficientes
- problemas temporales del banco o del procesador
- ventanas horarias donde el medio de pago puede recuperarse

### Cuándo ayudan poco por sí solos

- tarjeta vencida
- método removido
- autenticación pendiente
- credencial inválida persistente

En esos casos, el sistema debería combinar:

- reintentos inteligentes
- comunicación clara
- actualización del medio de pago
- reglas de gracia y degradación

## Qué es un grace period

El grace period es una ventana temporal durante la cual el cliente conserva acceso total o parcial aunque el cobro todavía no se haya recuperado.

Sirve para evitar que una falla puntual de pago se traduzca inmediatamente en una mala experiencia o en churn innecesario.

Por ejemplo:

- renovación falla hoy
- se abre un período de gracia de 5 días
- durante ese tiempo se hacen reintentos y se le avisa al cliente
- si regulariza, la suscripción sigue normalmente
- si no regulariza, se aplica degradación o suspensión según política

Esto ayuda mucho, pero también hay que diseñarlo con criterio.

Porque un grace period mal pensado puede:

- regalar acceso indefinidamente
- dejar inconsistencias entre billing y producto
- complicar reporting de ingresos
- generar abuso

## Acceso: no todo es “activo” o “cancelado”

Este tema conecta muy fuerte con entitlements y feature access.

En vez de modelar solo:

- activo
- cancelado

muchos productos necesitan estados o decisiones más finas, por ejemplo:

- activo normal
- activo en recuperación
- activo con restricciones
- suspendido por impago
- cancelación programada
- cancelado efectivo

Y además pueden existir distintos niveles de degradación:

- solo bloquear features premium
- dejar lectura pero no escritura
- bloquear nuevos usuarios o nuevos recursos
- congelar automatizaciones
- impedir exportaciones
- suspender completamente

Eso depende del producto, del segmento de cliente y del riesgo de negocio.

## Comunicación con el cliente: parte técnica del sistema, no adorno

En dunning, la comunicación no es secundaria.

Es parte del flujo.

El backend debería poder coordinar o al menos registrar acciones como:

- email de primer fallo
- recordatorio antes del próximo reintento
- aviso de actualización requerida de tarjeta
- notificación de grace period próximo a vencer
- confirmación de recuperación exitosa
- aviso de suspensión o cancelación por impago

Y algo muy importante:

**no todos los mensajes deberían ser iguales.**

No es lo mismo comunicar:

- “vamos a reintentar automáticamente”
- “necesitamos que actualices tu tarjeta”
- “tu acceso será restringido en 48 horas”
- “tu cuenta fue recuperada y sigue activa”

Un sistema maduro distingue esos casos.

## Dunning y customer experience

Muchos equipos miran dunning solo como palanca de ingresos.

Pero también es una parte delicada de la experiencia del cliente.

Un mal flujo de recuperación puede generar cosas como:

- mensajes confusos
- cortes sorpresivos
- acceso bloqueado cuando el pago ya se había regularizado
- cliente obligado a contactar soporte por algo evitable
- pérdida de confianza en el producto

En cambio, un flujo bien diseñado hace que la recuperación se sienta clara y razonable.

Idealmente el cliente debería entender:

- qué pasó
- qué se intentó
- qué tiene que hacer
- cuánto tiempo tiene
- qué pasará si no actúa
- cómo se confirma que quedó resuelto

## Dunning no es igual para todos los clientes

Éste es otro punto importante.

No siempre conviene tratar igual a:

- un self-serve pequeño
- una pyme con pocos usuarios
- una cuenta enterprise con contrato anual
- un cliente históricamente sano
- una cuenta con varios eventos de mora previos

Tal vez un cliente enterprise requiera:

- ventana de gracia más larga
- tratamiento manual
- aviso al owner de cuenta
- excepción temporal
- contacto comercial antes de suspender acceso

Mientras que en un plan self-serve puede bastar con automatización estándar.

Esto no significa improvisar.
Significa que la política de recuperación puede necesitar segmentación explícita.

## Métricas importantes en recovery

Si el sistema de dunning existe pero no se mide, va a costar mejorarlo.

Conviene observar métricas como:

- porcentaje de renovaciones fallidas
- tasa de recuperación después de reintentos
- tasa de recuperación después de actualización de medio de pago
- tiempo promedio hasta recuperación
- churn asociado a fallos de cobro
- ingresos recuperados por dunning
- cuentas suspendidas por impago
- volumen de casos que terminan en soporte manual

Estas métricas ayudan a ver si el problema principal está en:

- el procesador
- la UX de actualización
- la política de retries
- la comunicación
- la lógica de acceso
- la segmentación de clientes

## Relación con conciliación

Este tema conecta directamente con la lección anterior.

Porque un caso de cobro fallido mal modelado puede terminar generando inconsistencias como:

- invoice abierto pero pago realmente cobrado
- suscripción suspendida aunque el pago ya entró
- reintentos ejecutados sobre un caso ya resuelto
- accesos degradados por información vieja
- comunicación incorrecta al cliente

Por eso dunning necesita convivir bien con:

- estados claros de invoice
- payment attempts trazables
- conciliación con el proveedor
- reglas explícitas de resolución

## Errores comunes

### 1. Usar una sola etiqueta “payment_failed” para todo

Eso mezcla causas definitivas, temporales e inciertas.

### 2. Reintentar ciegamente sin clasificar el motivo

Genera ruido y recupera menos de lo que podría.

### 3. Cortar acceso demasiado rápido

Convierte un problema recuperable en churn innecesario.

### 4. Mantener acceso indefinidamente sin política clara

Eso erosiona ingresos y vuelve borrosa la operación.

### 5. No registrar trazabilidad de los intentos y comunicaciones

Después nadie entiende qué se hizo y qué faltó hacer.

### 6. No separar deuda, intento fallido y estado de suscripción

Muy común y muy dañino.

### 7. No coordinar dunning con el modelo de access control

Termina habiendo clientes suspendidos cuando no corresponde o activos cuando ya no deberían estarlo.

### 8. Diseñar una política única para todo tipo de cliente

Suele quedar demasiado rígida o demasiado blanda.

## Buenas prácticas iniciales

## 1. Clasificar causas de fallo

Aunque sea en categorías amplias, ayuda muchísimo.

## 2. Separar invoice, payment attempt y recovery case

Eso vuelve mucho más claro el flujo.

## 3. Diseñar una política explícita de retries

Con tiempos, límites y criterios según el tipo de fallo.

## 4. Definir grace period con criterio de negocio

Ni demasiado corto ni infinito.

## 5. Coordinar billing con access control

La deuda y el acceso tienen relación, pero no son la misma cosa.

## 6. Registrar toda comunicación relevante

Para trazabilidad operativa y soporte.

## 7. Medir recovery y churn por cobro fallido

Porque sin métricas no sabés si la política realmente funciona.

## Mini ejercicio mental

Pensá estas preguntas:

1. si mañana falla la renovación de un cliente, ¿tu sistema distingue si el problema es transitorio, definitivo o incierto?
2. ¿podrías saber cuántos reintentos hubo y cuál fue el resultado de cada uno?
3. ¿tu producto tiene alguna forma explícita de grace period o todo es activo/cancelado?
4. ¿qué tendría que pasar para pedir actualización del medio de pago en vez de solo reintentar?
5. ¿cómo evitarías suspender acceso si el pago quedó en estado ambiguo y todavía no fue conciliado?

## Resumen

En esta lección viste que:

- un cobro fallido no siempre significa lo mismo y conviene distinguir causas temporales, definitivas e inciertas
- dunning es el proceso de recuperación que combina reintentos, comunicación, reglas de acceso y resolución del caso
- separar intento fallido, deuda abierta y suscripción en riesgo evita muchos errores conceptuales
- los grace periods permiten recuperar ingresos sin cortar acceso demasiado pronto, pero requieren política clara
- un sistema serio coordina billing, payments, conciliación y entitlements para no tomar decisiones inconsistentes
- la recuperación de cobros tiene impacto directo tanto en ingresos como en churn y experiencia del cliente

## Siguiente tema

Ahora que ya entendés cómo manejar cobros fallidos y procesos de recuperación, el siguiente paso natural es estudiar **empresas, organizaciones y cuentas B2B**, porque a medida que el SaaS crece ya no alcanza con modelar usuarios individuales: también necesitás representar estructuras organizacionales, ownership, administración compartida y relaciones comerciales más complejas dentro del producto.
