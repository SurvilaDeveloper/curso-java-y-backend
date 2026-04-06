---
title: "Doble submit y repetición de requests"
description: "Cómo entender y diseñar defensas contra el doble submit y la repetición de requests en una aplicación Java con Spring Boot. Qué problemas aparecen cuando una misma operación crítica llega varias veces, por qué el frontend no alcanza para evitarlo y cómo pensar endpoints que resistan reintentos, clicks repetidos y abuso funcional."
order: 57
module: "Lógica de negocio y abuso funcional"
level: "base"
draft: false
---

# Doble submit y repetición de requests

## Objetivo del tema

Entender qué problema aparece cuando una misma operación crítica llega **más de una vez** al backend y cómo pensar un diseño que no dependa de que el usuario, el navegador o el frontend “se porten bien”.

La idea es desarrollar una intuición muy práctica para detectar situaciones como estas:

- un usuario hace doble clic en un botón
- el navegador reintenta
- el cliente móvil manda de nuevo la misma operación
- un proxy o integrador repite la request
- el usuario refresca una pantalla en el peor momento
- un actor malicioso automatiza la repetición de un endpoint sensible

En resumen:

> una operación crítica no debería romperse solo porque llegó dos veces.

---

## Idea clave

No toda repetición es un ataque.

A veces la repetición ocurre por:

- UX torpe
- latencia
- timeouts
- reintentos automáticos
- pérdida de conectividad
- errores del frontend
- usuarios impacientes

Pero desde el backend eso da bastante igual.

La pregunta importante no es **por qué** llegó de nuevo.
La pregunta importante es:

> ¿qué pasa si esta misma acción se ejecuta dos, tres o diez veces?

Si la respuesta es:

- se cobra dos veces
- se crean órdenes duplicadas
- se envían dos emails críticos
- se procesa dos veces un retiro
- se consume dos veces un cupón
- se dispara dos veces un webhook

entonces el problema es real aunque el origen haya sido accidental.

---

## Qué problema intenta resolver este tema

Muchos backends implementan bien la lógica “una vez”, pero no piensan qué pasa si la misma request se repite.

### Ejemplos típicos
- crear una orden
- confirmar un pago
- aplicar un cupón
- enviar una invitación
- procesar un retiro
- cancelar una suscripción
- aprobar una operación administrativa
- emitir un documento o comprobante

El problema es que varias de estas acciones deberían comportarse como:

- ejecutarse una sola vez
- producir un único efecto válido
- no duplicar side effects
- no dejar estados inconsistentes

Si el backend no está preparado, una simple repetición puede romper reglas de negocio que parecían claras.

---

## Error mental clásico

Un error muy común es pensar así:

> “El usuario no va a hacer clic dos veces.”

O esta variante:

> “El frontend deshabilita el botón, así que está cubierto.”

Eso mejora la experiencia, pero no protege la regla del negocio.

Porque la request puede repetirse igual por muchos otros caminos:

- el frontend no siempre controla todo
- otro cliente puede consumir la API
- un script puede pegarle directo al endpoint
- una integración externa puede reintentar
- una pestaña puede reenviar el formulario
- un timeout puede llevar a reintentar una acción que sí se ejecutó

En seguridad backend, confiar en que la interfaz evitará la repetición es una mala base.

---

## Doble submit no es exactamente lo mismo que race condition

Los dos temas están relacionados, pero no son idénticos.

### Race condition
Se enfoca en operaciones concurrentes que compiten sobre el mismo estado.

### Doble submit o repetición
Se enfoca en que la **misma intención** puede llegar varias veces al backend.

A veces los dos problemas se mezclan.

### Ejemplo
- el usuario hace doble clic en “Pagar”
- salen dos requests casi al mismo tiempo
- ambas intentan ejecutar la misma operación crítica

Ahí hay repetición **y** puede haber concurrencia.

Pero incluso sin concurrencia real, una repetición separada por algunos segundos también puede ser un problema si la acción no debería repetirse.

---

## Casos donde más importa pensar esto

Conviene prestar especial atención a endpoints que:

- cobran dinero
- generan órdenes o reservas
- consumen stock o saldo
- activan cuentas o beneficios únicos
- cambian estados irreversibles
- crean facturas, recibos o comprobantes
- envían webhooks o emails importantes
- ejecutan acciones administrativas sensibles
- procesan callbacks de terceros

Cuanto más costosa, irreversible o auditable es la acción, menos tolerable es que se ejecute dos veces.

---

## Ejemplo clásico: crear una orden

### Flujo ingenuo

```java
@PostMapping("/orders")
public OrderResponse createOrder(@RequestBody CreateOrderRequest request) {
    Order order = orderService.createOrder(request);
    return OrderResponse.from(order);
}
```

Y adentro del service:

```java
@Transactional
public Order createOrder(CreateOrderRequest request) {
    Order order = new Order();
    order.setUserId(request.userId());
    order.setTotal(request.total());
    order.setStatus(OrderStatus.PENDING);

    orderRepository.save(order);
    emailService.sendOrderCreated(order);

    return order;
}
```

A simple vista parece normal.

Pero si la misma request llega dos veces, podrías terminar con:

- dos órdenes casi iguales
- dos emails de confirmación
- dos procesos posteriores disparados
- dos cobros si otro sistema continúa el flujo

Y nada de eso se arregla diciendo “el usuario hizo doble clic”.

---

## Ejemplo clásico: confirmar un pago

Supongamos un endpoint interno o una integración que confirma un pago.

```java
@Transactional
public void confirmPayment(Long paymentId) {
    Payment payment = paymentRepository.findById(paymentId)
        .orElseThrow();

    if (payment.getStatus() == PaymentStatus.CONFIRMED) {
        return;
    }

    payment.setStatus(PaymentStatus.CONFIRMED);
    orderService.markAsPaid(payment.getOrderId());
    emailService.sendPaymentConfirmation(payment.getOrderId());
}
```

Este código ya es mejor que uno que siempre confirma de nuevo.
Pero todavía conviene pensar varias cosas:

- ¿qué pasa si dos requests llegan juntas?
- ¿qué pasa si el email ya salió y luego falla otra parte?
- ¿qué pasa si otro proceso ya marcó la orden como paga?
- ¿qué pasa si un proveedor externo repite el callback?

El problema no es solo “guardar dos veces”.
Muchas veces el problema real son los **side effects duplicados**.

---

## La repetición puede ser legítima

Esto es importante.

No conviene diseñar pensando que toda repetición es maliciosa.

### Casos legítimos
- un cliente no recibió respuesta porque hubo timeout
- una red inestable cortó la conexión
- un webhook externo reintenta por diseño
- un usuario cree que no funcionó y vuelve a intentar
- un balanceador o proxy reenvía

Por eso, un backend maduro no se limita a “bloquear todo lo repetido”.
Piensa mejor:

- qué operaciones deben tolerar repetición
- cuáles deben producir el mismo resultado
- cuáles deben rechazar duplicados
- cuáles deben registrar y contener el abuso

---

## Qué NO alcanza

Hay varias soluciones aparentes que no son suficientes.

### 1. Deshabilitar el botón en el frontend
Sirve para UX.
No protege la API.

### 2. Mostrar un spinner
Sirve para que el usuario espere.
No evita reintentos por otros caminos.

### 3. Confiar en que el navegador no reenvía
No es una garantía de negocio.

### 4. Revisar después si quedó algo duplicado
Eso ya significa que el sistema permitió el problema.

### 5. Usar POST y asumir que por eso se ejecuta una sola vez
El verbo HTTP no impide repetición.

### 6. Suponer que “nunca pasa”
En flujos críticos, alcanza con que pase una vez para generar daño o soporte costoso.

---

## La pregunta correcta al revisar un endpoint

Cuando veas una operación crítica, preguntate:

> si esta misma request llega de nuevo, ¿qué debería pasar?

Y tratá de responder de forma explícita.

### Posibles respuestas sanas
- debería devolver el mismo resultado sin duplicar efectos
- debería reconocer que ya fue procesada
- debería rechazar la repetición como conflicto
- debería ser segura frente a reintentos del mismo actor
- debería registrar el evento y no volver a ejecutar lo irreversible

Lo peligroso es no tener ninguna respuesta clara.

---

## Tres familias de operaciones

Pensarlo en familias ayuda mucho.

### 1. Operaciones naturalmente repetibles
Ejemplo:
- consultar perfil
- listar órdenes
- pedir un recurso de solo lectura

Que lleguen dos veces no suele ser grave.

### 2. Operaciones que podrían repetirse pero deberían converger
Ejemplo:
- marcar una orden como leída
- confirmar una acción ya confirmada
- activar una cuenta que ya está activa

La segunda request no debería romper nada.
Tal vez devuelve el mismo estado final.

### 3. Operaciones que no deben duplicar efectos
Ejemplo:
- crear cobro
- emitir factura
- descontar saldo
- reservar stock
- crear una orden real

Estas merecen diseño especial.

---

## Ejemplo mental útil

Pensá este caso:

### Acción
“Procesar retiro de dinero”.

Si la misma request llega dos veces, ¿qué pasa?

### Respuesta inmadura
- se procesan dos retiros

### Respuesta aceptable
- la segunda se detecta como repetida y no vuelve a mover dinero

### Respuesta madura
- el sistema puede correlacionar la misma intención
- evita repetir el side effect
- deja trazabilidad
- devuelve una respuesta consistente

Ese es el tipo de madurez que conviene buscar.

---

## Dónde suele aparecer el problema en el código

Prestá atención a patrones como estos:

- crear entidades nuevas sin una clave de negocio que ayude a detectar duplicados
- disparar emails o webhooks apenas llega la request
- ejecutar side effects antes de asegurar el estado final correcto
- no distinguir entre “intención nueva” y “reintento de la misma intención”
- procesar callbacks de terceros como si siempre fueran únicos
- no guardar ninguna marca que permita saber si algo ya fue procesado

En muchos sistemas, el problema no es que la lógica esté completamente mal.
Es que fue pensada como si cada request fuera única por definición.

---

## Un error común con callbacks y webhooks

Las integraciones externas son un lugar clásico donde aparece este problema.

Muchos proveedores reintentan webhooks cuando:

- no recibieron `2xx`
- hubo timeout
- hubo latencia
- el sistema receptor estaba caído

Si tu backend procesa cada callback como si siempre fuera nuevo, podés terminar con:

- pagos re-confirmados sin control
- estados re-ejecutados
- eventos duplicados en auditoría
- side effects múltiples

Acá conviene pensar siempre:

- ¿cómo reconozco un evento ya visto?
- ¿qué identificador del proveedor puedo usar?
- ¿qué parte de la operación no debe volver a correr?

---

## Qué papel juega la idempotencia

La idempotencia es una idea muy importante acá, pero merece un tema propio.

Por ahora alcanza con esta intuición:

> algunas operaciones deberían poder recibir la misma intención más de una vez sin duplicar el efecto final.

Eso no significa que toda operación tenga que ser idempotente por arte de magia.
Significa que, cuando el negocio lo necesita, el backend debería poder:

- reconocer la repetición
- evitar efectos duplicados
- responder de forma coherente

En el próximo tema lo vamos a mirar con más foco.

---

## Estrategias sanas a nivel de diseño

Sin entrar todavía al nivel más técnico posible, hay varias ideas útiles.

### 1. Diferenciar intención de ejecución
A veces conviene modelar la intención del usuario o del integrador de forma que se pueda reconocer si ya fue procesada.

### 2. Tener identificadores útiles para detectar duplicados
Si todo depende de comparar “payloads parecidos”, suele ser frágil.
Es mejor tener alguna forma más clara de correlación.

### 3. No disparar side effects irreversibles demasiado pronto
Primero conviene asegurar el estado correcto.
Después disparar lo que corresponda.

### 4. Pensar el resultado de la segunda request
No alcanza con definir la primera.
También hay que decidir qué devolver si vuelve a llegar.

### 5. Auditar sin sobre-reaccionar
No toda repetición es abuso.
Pero sí conviene dejar trazabilidad cuando se repiten operaciones sensibles.

---

## Ejemplo conceptual inseguro

```java
@Transactional
public Invoice createInvoice(CreateInvoiceRequest request) {
    Invoice invoice = new Invoice();
    invoice.setOrderId(request.orderId());
    invoice.setAmount(request.amount());

    invoiceRepository.save(invoice);
    externalBillingClient.emit(invoice);

    return invoice;
}
```

Problemas posibles si llega dos veces:

- dos facturas para la misma orden
- dos emisiones externas
- confusión contable
- auditoría difícil de explicar

No alcanza con decir “esa pantalla no debería mandar dos veces”.

---

## Ejemplo conceptual más sano

Una versión más madura del diseño se haría preguntas como:

- ¿esta orden ya tiene factura emitida?
- ¿esta misma intención ya fue procesada?
- ¿si reintentan, devolvemos la misma factura o rechazamos el duplicado?
- ¿cómo evitamos emitir dos veces en el sistema externo?
- ¿qué evidencia dejamos para soporte y auditoría?

Lo importante no es memorizar un patrón único.
Lo importante es abandonar la suposición de unicidad automática.

---

## Repetición accidental vs abuso deliberado

Las dos cosas importan.

### Repetición accidental
- doble clic
- refresh
- timeout
- reintento del cliente

### Abuso deliberado
- scripts que disparan la misma acción muchas veces
- intentos de cobrar, reservar o consumir beneficios múltiples
- automatización para ganar carreras o duplicar efectos

Por eso este tema toca tanto confiabilidad como seguridad.

> un endpoint que no tolera repetición puede ser frágil para usuarios legítimos y explotable para actores maliciosos.

---

## Señales de alarma muy concretas

Prestá atención si ves alguno de estos síntomas:

- órdenes casi idénticas creadas con segundos de diferencia
- cupones aplicados más de una vez
- emails duplicados que confirman la misma acción
- callbacks del mismo proveedor procesados varias veces
- operaciones administrativas repetidas sin trazabilidad clara
- soporte diciendo “a veces pasa que se genera duplicado”
- bugs que aparecen solo con mucha latencia o muchos clics

Cuando aparece alguno de estos síntomas, no conviene pensar solo en “un bug raro”.
Muy seguido el problema de fondo es que la operación no fue diseñada para tolerar repetición.

---

## Qué revisar especialmente en una app Spring

Cuando mires un backend Spring, revisá con cuidado:

- endpoints `POST` que crean recursos críticos
- callbacks de pagos, mensajería o terceros
- operaciones con stock, saldo o beneficios únicos
- services que disparan side effects externos
- uso de transacciones sin una política clara para duplicados
- ausencia de correlación entre requests que representan la misma intención
- lógica que asume que una acción solo puede llegar una vez

Spring ayuda a estructurar el código.
Pero no toma por vos la decisión de qué hacer ante repetición.

---

## Qué gana el sistema si esto está bien pensado

Cuando un backend resiste mejor el doble submit y la repetición de requests, gana:

- menos duplicados funcionales
- menos soporte manual
- menos daño por reintentos legítimos
- menos superficie para abuso funcional
- mejor trazabilidad
- mejor integración con terceros que reintentan
- mayor previsibilidad operativa

No es solo una mejora de robustez.
También es una mejora de seguridad de negocio.

---

## Checklist práctico

Cuando revises una operación crítica, preguntate:

- ¿qué pasa si esta misma request llega dos veces?
- ¿la segunda request duplica efectos o converge al mismo resultado?
- ¿el frontend es la única barrera contra el doble submit?
- ¿hay side effects externos que podrían ejecutarse dos veces?
- ¿una integración externa podría reintentar automáticamente?
- ¿el sistema puede reconocer una intención ya procesada?
- ¿la respuesta a un duplicado está definida o queda al azar?
- ¿hay trazabilidad suficiente para investigar repetición?
- ¿un atacante podría abusar esta operación enviándola muchas veces?
- ¿la operación necesita diseño idempotente?

---

## Mini ejercicio de reflexión

Tomá tres endpoints sensibles de tu backend y respondé:

1. ¿Qué pasa si el usuario hace doble clic?
2. ¿Qué pasa si el cliente no recibe respuesta y reintenta?
3. ¿Qué pasa si un integrador externo manda el mismo evento dos veces?
4. ¿Qué side effects podrían duplicarse?
5. ¿La segunda ejecución debería repetir, converger o rechazarse?
6. ¿Hoy el sistema tiene una política clara para eso?

Ese ejercicio suele revelar muy rápido qué partes del backend todavía dependen demasiado de que las requests lleguen “perfectamente una sola vez”.

---

## Resumen

El doble submit y la repetición de requests no son un detalle menor.

Son una fuente real de:

- duplicados de negocio
- inconsistencia operativa
- side effects repetidos
- abuso funcional
- bugs costosos de explicar

La idea central es esta:

- no confiar en que el frontend evitará la repetición
- no asumir que toda request es única
- decidir explícitamente qué debe pasar si la misma intención llega otra vez
- diseñar operaciones críticas para tolerar reintentos o rechazar duplicados de forma sana

En resumen:

> un backend más maduro no depende de que una acción importante llegue exactamente una sola vez.  
> Depende de un diseño que sabe qué hacer cuando esa acción vuelve a aparecer.

---

## Próximo tema

**Idempotencia en endpoints Spring**
