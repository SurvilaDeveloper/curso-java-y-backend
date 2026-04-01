---
title: "Consistencia distribuida y compensaciones"
description: "Qué cambia cuando una operación atraviesa varios servicios con sus propias bases de datos, por qué la consistencia distribuida es difícil, cuándo aceptar consistencia eventual y cómo pensar compensaciones sin confundirlas con una reversión mágica de todo el sistema."
order: 160
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

## Introducción

En un sistema simple, muchas operaciones de negocio importantes viven dentro de una sola transacción local.

Por ejemplo:

- se crea una orden
- se descuenta stock
- se registra el pago
- se confirma el estado final

Si todo ocurre contra una misma base y dentro del mismo límite transaccional, la intuición suele ser bastante cómoda:

- o se confirma todo
- o no se confirma nada

Eso no significa que el problema sea trivial, pero al menos la idea general es clara.

En sistemas distribuidos, esa comodidad desaparece rápido.

Ahora una misma operación puede involucrar:

- un servicio de órdenes
- un servicio de pagos
- un servicio de inventario
- un servicio de envíos
- una cola o broker
- uno o más procesos asíncronos
- varias bases de datos distintas

Entonces aparece una pregunta incómoda:

**¿cómo mantenemos coherencia de negocio cuando la operación ya no vive en un único lugar transaccional?**

Ahí entran dos conceptos centrales:

- la **consistencia distribuida**
- las **compensaciones**

Y entenderlos bien es importante porque una de las mayores trampas en microservicios es diseñar como si todavía existiera una gran transacción global fácil de controlar.

## Qué significa consistencia en este contexto

Cuando hablamos de consistencia distribuida no estamos hablando solo de “datos prolijos”.

Estamos hablando de algo más delicado:

**que el sistema completo mantenga reglas de negocio razonables aunque el flujo atraviese varios componentes independientes.**

Por ejemplo:

- no vender stock inexistente
- no dejar una orden confirmada sin pago válido
- no disparar un envío para una compra cancelada
- no cobrar dos veces por la misma operación
- no dejar estados incompatibles entre servicios

El desafío es que cada servicio suele tener:

- su propia base
- su propio ciclo de vida
- su propio ritmo de procesamiento
- sus propias fallas posibles
- su propia visión parcial de la realidad

Entonces la consistencia ya no es solo “la base está bien”.
Pasa a ser:

**¿el conjunto de servicios termina convergiendo a un estado de negocio correcto o aceptable?**

## El problema real: una operación de negocio se fragmenta

Pensemos en una compra.

Desde la mirada del usuario, puede parecer una sola acción:

- confirmar checkout

Pero internamente podrían pasar varias cosas:

- órdenes crea la orden en estado pendiente
- pagos intenta autorizar el cobro
- inventario reserva stock
- notificaciones manda confirmación
- envíos prepara la logística

Cada uno de esos pasos puede salir bien o mal de forma independiente.

Y ahí aparece el problema central:

**el sistema ya no tiene un único botón atómico que garantice todo de una vez.**

Puede pasar algo así:

- la orden se crea
- el pago se aprueba
- la reserva de stock falla

O esto:

- la orden se crea
- inventario reserva stock
- el pago queda incierto por timeout

O esto:

- el pago se autorizó realmente en el proveedor
- el servicio local no recibió la confirmación
- la orden quedó pendiente aunque el dinero quedó retenido

En otras palabras:

la operación de negocio puede quedar en un estado intermedio, ambiguo o incompleto.

Y diseñar sistemas distribuidos implica aceptar eso como una realidad normal, no como una excepción exótica.

## La ilusión peligrosa de la transacción global

Cuando un sistema empieza a separarse en servicios, es común que aparezca el impulso de querer preservar la misma comodidad que había dentro de un monolito transaccional.

La fantasía suele ser algo así:

- llamo a varios servicios
- todos participan de una gran transacción coordinada
- si algo falla, deshago todo automáticamente

Conceptualmente suena hermoso.
Operativamente, suele ser caro, frágil o directamente inviable.

Porque en sistemas reales aparecen varios problemas:

- bases de datos distintas
- tecnologías distintas
- dependencias externas que no participan de tu transacción
- colas o brokers asincrónicos
- latencia de red
- fallos parciales
- timeouts
- confirmaciones inciertas

Por eso, en arquitectura distribuida madura, el objetivo rara vez es sostener una ilusión de atomicidad global perfecta.

Más bien, el objetivo suele ser este:

**diseñar flujos que toleren estados intermedios, converjan correctamente y tengan mecanismos de recuperación cuando algo sale mal.**

## Consistencia fuerte vs consistencia eventual

Acá conviene distinguir dos ideas.

## Consistencia fuerte

Busca que, después de una operación, todos los actores relevantes vean inmediatamente un estado coherente y actualizado.

En la práctica, esto exige coordinación más estricta.
Y cuanto más distribuido está el sistema, más costosa se vuelve esa coordinación.

Puede servir en ciertos dominios o en ciertos pasos críticos, pero no siempre escala bien como estrategia general.

## Consistencia eventual

Acepta que durante un tiempo puede haber diferencias temporales entre componentes, siempre que el sistema termine convergiendo a un estado correcto o aceptable.

Por ejemplo:

- la orden queda `PENDING`
- pagos confirma después
- inventario procesa unos segundos más tarde
- el estado final converge a `CONFIRMED`

Durante un intervalo puede haber desalineación.
La clave es que esa desalineación esté pensada, acotada y operable.

En sistemas distribuidos reales, muchísimas veces la consistencia eventual no es una concesión mediocre.
Es la forma natural de construir flujos robustos sin fingir una coordinación imposible.

## El punto importante: eventual no significa descontrolada

A veces se escucha “esto es eventualmente consistente” como si eso justificara cualquier desorden.

Pero no.

Consistencia eventual bien diseñada no significa:

- estados arbitrarios
- incertidumbre indefinida
- imposibilidad de explicar qué pasó
- entidades colgadas para siempre
- side effects duplicados sin control

Significa algo mucho más serio:

- se aceptan transiciones parciales
- se modelan estados intermedios
- se definen mecanismos de recuperación
- se contemplan retries e idempotencia
- se diseñan compensaciones cuando corresponde
- se monitorea la convergencia del flujo

La consistencia eventual sana tiene disciplina.
No es improvisación.

## Qué son las compensaciones

Una compensación es una acción diseñada para corregir, contrarrestar o neutralizar un paso anterior cuando una operación distribuida no pudo completarse como se esperaba.

Dicho simple:

**si no podés deshacer mágicamente toda la historia, necesitás acciones explícitas para llevar el sistema a un estado aceptable.**

Ejemplos:

- si se reservó stock pero el pago falló, liberar la reserva
- si se autorizó un cobro pero la orden no puede confirmarse, cancelar o revertir el pago según el caso
- si se emitió un cupón por error, invalidarlo
- si se creó un envío para una orden cancelada, frenar el despacho si todavía es posible

La idea importante es que la compensación no borra el tiempo.
No hace de cuenta que nada ocurrió.

Más bien:

- reconoce que ocurrió algo real
- agrega una acción nueva
- intenta restaurar coherencia operativa o de negocio

## Compensar no es lo mismo que revertir una transacción local

Esta diferencia es muy importante.

En una transacción local, un rollback evita que el mundo externo vea cambios intermedios confirmados.

En una compensación distribuida, muchas veces el cambio anterior **sí existió de verdad**.
Y ahora necesitás otra acción para contrapesarlo.

Por ejemplo:

- un proveedor de pagos recibió una autorización
- un cliente pudo recibir un email
- un evento pudo ser consumido por terceros
- un stock pudo quedar reservado durante un tiempo

No podés “hacer de cuenta” que no pasó.
Tenés que trabajar con el hecho de que pasó, y decidir cómo reaccionar.

Por eso las compensaciones tienen un carácter más operativo y de negocio que una simple reversión técnica.

## Un ejemplo concreto de consistencia distribuida

Supongamos este flujo:

- órdenes crea una orden en estado `PENDING`
- inventario reserva stock
- pagos autoriza la tarjeta
- órdenes pasa a `CONFIRMED`

Ahora imaginemos que el paso de pagos falla.

Posible resultado:

- la orden existe
- la reserva de stock existe
- el pago no quedó aprobado

¿Qué hacemos?

Una posibilidad sana es:

- marcar la orden como `PAYMENT_FAILED`
- disparar una compensación para liberar la reserva de stock
- registrar el motivo
- permitir retry de pago si el negocio lo admite

El objetivo no es “volver mágicamente al segundo cero”.
El objetivo es que el sistema quede en un estado entendible y operable.

## Otro ejemplo: confirmación incierta

Ahora pensemos un caso más sutil.

- el servicio de pagos manda la autorización al proveedor
- ocurre un timeout
- el sistema local no sabe si el proveedor aprobó o no

Éste es un caso clásico de consistencia distribuida difícil.

Porque no tenés un simple “éxito” o “fracaso”.
Tenés un **estado incierto**.

Y un diseño maduro no debería resolverlo así:

- “como hubo timeout, asumo que falló”

¿Por qué?
Porque podrías terminar:

- reintentando y cobrando dos veces
- cancelando una orden cuyo pago sí entró
- liberando stock que en realidad ya estaba asociado a una operación válida

En estos casos suele hacer falta:

- marcar estado incierto
- consultar luego al proveedor
- apoyarse en webhooks o reconciliación posterior
- diseñar idempotencia fuerte
- evitar decisiones destructivas prematuras

La consistencia distribuida madura no consiste en actuar rápido a cualquier costo.
Consiste en manejar bien la incertidumbre.

## Por qué las compensaciones no siempre son perfectas

Acá hay otra trampa conceptual.

A veces se imagina la compensación como si fuera un “undo” exacto y limpio.
Pero en sistemas reales eso muchas veces no existe.

Algunas razones:

- un correo ya fue enviado
- un tercero ya consumió un evento
- un usuario ya vio cierto estado
- un proveedor externo no soporta reversión inmediata
- una acción física ya empezó a ejecutarse

Por ejemplo:

- si ya despachaste un paquete, “compensar” no es simplemente deshacer un registro
- si ya emitiste una factura, puede requerirse una nota de crédito o un flujo contable posterior
- si un cliente ya recibió una confirmación, puede requerirse una comunicación adicional

Entonces conviene pensar así:

**una compensación no siempre restaura el estado original exacto; muchas veces restaura una situación aceptable desde negocio y operación.**

## Diseñar estados explícitos ayuda muchísimo

Uno de los mayores errores en sistemas distribuidos es modelar estados demasiado binarios.

Por ejemplo:

- `CONFIRMED` o `FAILED`
- `PAID` o `UNPAID`
- `DONE` o `ERROR`

Eso puede quedar corto cuando existen pasos intermedios reales.

Muchas veces hace falta modelar estados como:

- `PENDING_PAYMENT`
- `PAYMENT_IN_PROGRESS`
- `PAYMENT_UNKNOWN`
- `STOCK_RESERVED`
- `COMPENSATION_PENDING`
- `CANCELLED_AFTER_PAYMENT`
- `REFUND_REQUIRED`

No se trata de inventar estados por deporte.
Se trata de representar la realidad operativa suficiente para:

- entender qué pasó
- saber qué falta
- evitar decisiones equivocadas
- permitir recuperación automática o manual

En sistemas distribuidos, un modelo de estados bien pensado vale muchísimo más que una ilusión simplista de éxito o fracaso inmediato.

## Cuándo conviene orquestar y cuándo coreografiar

La consistencia distribuida muchas veces se implementa dentro de flujos tipo saga, ya sea más orquestados o más coreografiados.

No hace falta meternos todavía en toda la profundidad del patrón, pero sí entender la tensión.

## Orquestación

Un componente central coordina el flujo.
Decide:

- qué paso sigue
- qué hacer si algo falla
- qué compensación disparar

Ventajas:

- flujo más visible
- reglas centralizadas
- recuperación más explícita

Costos:

- más acoplamiento al coordinador
- mayor responsabilidad concentrada

## Coreografía

Los servicios reaccionan a eventos y van encadenando acciones.
No hay un director central tan visible.

Ventajas:

- menor coordinación central
- mayor desacople local

Costos:

- más dificultad para entender el flujo completo
- compensaciones más dispersas
- más riesgo de comportamiento emergente difícil de seguir

En ambos casos, la consistencia distribuida sigue siendo un problema real.
La diferencia es dónde vive la coordinación y cómo se vuelve observable.

## Errores comunes al pensar consistencia distribuida

## 1. Suponer que “microservicios” implica automáticamente mejor consistencia

No.
De hecho, separar servicios suele volver este problema más difícil, no más fácil.

## 2. Diseñar como si existiera una transacción global gratuita

Eso suele producir soluciones frágiles o expectativas irreales.

## 3. No modelar estados intermedios

Cuando solo existen estados finales ficticios, el sistema queda ciego ante la realidad operativa.

## 4. No diseñar compensaciones explícitas

Si el flujo distribuido puede fallar parcialmente, pero no sabés cómo recuperar, tarde o temprano vas a acumular inconsistencias manuales.

## 5. Confundir retry con compensación

Reintentar puede ayudar, pero no reemplaza el hecho de que ciertas combinaciones ya dejaron efectos parciales y requieren otra acción.

## 6. Olvidar la idempotencia

Tanto los pasos principales como las compensaciones deberían diseñarse para tolerar duplicados o reejecuciones razonables.

## 7. No contemplar estados inciertos

Asumir éxito o fracaso cuando en realidad la respuesta es “no sabemos todavía” genera muchos errores graves.

## 8. No observar la convergencia

No alcanza con diseñar el flujo.
También hay que poder detectar cuándo quedó atascado, incompleto o divergente.

## Compensaciones automáticas vs intervención manual

No todo tiene que resolverse automáticamente.

Algunos casos admiten compensación automática clara.
Por ejemplo:

- liberar una reserva de stock vencida
- cancelar una orden pendiente sin pago
- reintentar una publicación de evento

Pero hay otros casos donde puede hacer falta revisión humana.
Por ejemplo:

- un cobro aprobado con estado local incierto
- un envío ya preparado mientras la orden fue cancelada
- una conciliación financiera con diferencias
- una acción sensible con impacto legal o contable

Diseño maduro no significa automatizar ciegamente todo.
Significa saber:

- qué recuperar solo
- qué escalar a operación
- qué marcar para conciliación posterior

## La reconciliación como herramienta de consistencia

Aun con buenos flujos online, muchos sistemas maduros necesitan procesos de reconciliación.

¿Por qué?
Porque algunos desalineamientos no se resuelven solo en el request principal.

La reconciliación sirve para comparar realidades entre sistemas y corregir diferencias.

Ejemplos:

- pagos locales vs pagos confirmados por proveedor
- reservas de stock activas vs órdenes válidas
- suscripciones internas vs estado real en plataforma externa
- envíos emitidos vs órdenes efectivamente facturadas

La reconciliación no reemplaza un buen diseño de flujo.
Pero sí actúa como una red de seguridad importante para cerrar brechas inevitables.

## Qué significa “estado aceptable”

Ésta es una idea muy importante.

En sistemas distribuidos, a veces el objetivo no es llegar siempre al estado ideal perfecto en el primer intento.
El objetivo es llegar a un estado **aceptable** para negocio, operación y usuario.

Por ejemplo, un estado aceptable podría ser:

- la orden quedó en revisión y no se despachó nada
- el cobro quedó retenido, pero está identificado para conciliación
- el stock fue liberado correctamente
- el usuario recibió un mensaje consistente con la situación
- existe trazabilidad para continuar el caso

Eso es mucho mejor que intentar una falsa atomicidad y terminar con:

- estados incompatibles
- decisiones irreversibles mal tomadas
- imposibilidad de explicar qué pasó

## Buenas prácticas conceptuales

## 1. Diseñar para fallos parciales desde el principio

En distribuido, no preguntes “¿y si falla?”.
Preguntá “¿en qué puntos va a fallar parcialmente y cómo reaccionamos?”.

## 2. Modelar estados intermedios reales

Que el dominio pueda representar incertidumbre, espera, compensación y conciliación.

## 3. Hacer explícitos los pasos con side effects

Cobros, reservas, emisiones, envíos, notificaciones, provisión de recursos.
Esos puntos merecen especial cuidado.

## 4. Diseñar compensaciones idempotentes

Porque puede haber retries, duplicados o ejecuciones repetidas.

## 5. Diferenciar fallos definitivos de fallos inciertos

No es lo mismo rechazo confirmado que timeout ambiguo.

## 6. Aceptar consistencia eventual donde tenga sentido

Pero con límites, monitoreo y convergencia observable.

## 7. Incorporar reconciliación para cerrar huecos inevitables

Especialmente en integraciones externas y flujos financieros.

## 8. Conectar lo técnico con lo operativo

Si una inconsistencia queda visible, debería ser detectable, trazable y accionable.

## Preguntas que conviene hacerse

## 1. ¿Qué pasa si uno de los pasos del flujo confirma y otro falla?

No como ejercicio teórico, sino exactamente en cada paso importante.

## 2. ¿Qué side effects son reversibles y cuáles no?

Eso cambia por completo la estrategia de compensación.

## 3. ¿Qué estados inciertos pueden existir legítimamente?

Ignorarlos no los elimina.

## 4. ¿Cómo sabemos que el sistema convergió bien?

Sin esa respuesta, la consistencia eventual queda demasiado abstracta.

## 5. ¿Qué parte puede recuperarse automáticamente y cuál necesita intervención humana?

Ésa es una frontera operativa muy importante.

## 6. ¿Podríamos duplicar un efecto por retry o falta de idempotencia?

Muchos incidentes graves nacen ahí.

## 7. ¿Tenemos reconciliación para los casos donde el flujo online no alcanza?

Especialmente importante en pagos, billing, stock y provisioning.

## Idea final

La consistencia distribuida no consiste en perseguir una perfección transaccional imposible a cualquier costo.
Consiste en diseñar sistemas que sepan convivir con:

- fallos parciales
- latencia
- incertidumbre
- estados intermedios
- acciones que ocurren en momentos distintos

Y aun así puedan converger a resultados de negocio correctos o aceptables.

Ahí las compensaciones cumplen un rol clave.
No como magia que borra la historia, sino como mecanismos explícitos para corregir el rumbo cuando una operación distribuida no pudo completarse de forma lineal.

Cuando un equipo entiende esto de verdad, deja de diseñar microservicios como si fueran un monolito partido en pedazos.
Y empieza a diseñar flujos que toleran la realidad distribuida con mucha más madurez.
