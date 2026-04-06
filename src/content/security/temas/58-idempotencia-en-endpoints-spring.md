---
title: "Idempotencia en endpoints Spring"
description: "Qué significa realmente que una operación sea idempotente en un backend Java con Spring Boot. Cómo pensar reintentos, duplicados, efectos secundarios y operaciones críticas para evitar cobros dobles, pedidos repetidos, cambios inconsistentes o acciones ejecutadas más de una vez."
order: 58
module: "Lógica de negocio y abuso funcional"
level: "base"
draft: false
---

# Idempotencia en endpoints Spring

## Objetivo del tema

Entender qué significa **idempotencia** en un backend Java + Spring Boot y por qué importa cuando una misma operación puede llegar más de una vez por:

- reintentos automáticos
- doble click del usuario
- refresh del navegador
- pérdida de red
- timeouts
- reenvíos del frontend
- reintentos de integraciones externas
- comportamiento malicioso o abusivo

La idea es que el backend pueda decidir con claridad:

- qué operaciones toleran repetición sin cambiar el resultado final
- cuáles no
- cómo evitar efectos duplicados
- cómo diseñar endpoints más seguros y predecibles

En resumen:

> idempotencia no significa “hacer lo mismo dos veces y cruzar los dedos”.  
> Significa diseñar el backend para que repetir una misma intención no produzca daño extra.

---

## Idea clave

Una operación es idempotente cuando **ejecutarla varias veces con la misma intención produce el mismo efecto final que ejecutarla una sola vez**.

Eso no significa necesariamente:

- misma respuesta exacta en cada intento
- mismo status code siempre
- ausencia total de logs o métricas adicionales

Lo importante es el **efecto del negocio**.

### Ejemplo sencillo

Si una operación es:

- “marcar esta notificación como leída”

entonces:

- hacerlo una vez deja la notificación leída
- hacerlo otra vez debería dejarla leída también
- no debería crear estados nuevos ni efectos extra

### Ejemplo sensible

Si una operación es:

- “cobrar esta orden”

entonces repetirla sin control puede producir:

- doble cobro
- doble registro de pago
- doble envío a terceros
- inconsistencias contables

Ahí la idempotencia deja de ser comodidad y pasa a ser protección real del negocio.

---

## Qué problema intenta resolver este tema

Este tema intenta evitar escenarios como:

- crear dos órdenes iguales por doble submit
- cobrar dos veces una compra
- generar dos transferencias
- enviar dos emails sensibles
- descontar stock más de una vez
- procesar dos veces un webhook
- duplicar una operación administrativa
- dejar el sistema en un estado ambiguo tras un timeout

Es decir:

> el problema no es solo que la request llegue repetida.  
> El problema es que el backend trate cada repetición como si fuera una intención nueva.

---

## Error mental clásico

Un error muy común es pensar:

- “si el frontend no duplica la request, estamos bien”

Eso es una mala base.

Porque una request puede repetirse aunque el frontend esté bien hecho:

- el usuario reintenta porque no vio respuesta
- el cliente móvil reenvía por mala conectividad
- un proxy o integración reintenta
- un timeout corta la respuesta pero no la ejecución real
- un atacante prueba repetición deliberada

### La idea sana

El backend tiene que preguntarse:

- si esta operación llega dos veces, ¿qué pasa?
- ¿se duplica algo?
- ¿el estado final queda bien?
- ¿puedo reconocer que ya procesé esta intención?

---

## Idempotencia no es lo mismo que “ignorar duplicados”

A veces se simplifica demasiado este concepto.

No se trata solo de:

- detectar una request repetida
- descartarla sin más

También se trata de poder responder con lógica consistente sobre una intención ya procesada.

### Ejemplo sano

Si el cliente manda dos veces la misma intención de crear un pago con una clave de idempotencia válida, el backend podría:

- procesar la primera vez
- guardar el resultado asociado a esa clave
- devolver el mismo resultado en reintentos equivalentes

Eso es mucho más fuerte que simplemente decir “duplicado”.

---

## HTTP ayuda, pero no resuelve solo el problema

En HTTP suele enseñarse que:

- `GET` debería ser seguro e idempotente
- `PUT` suele modelarse como idempotente
- `DELETE` suele pensarse como idempotente
- `POST` no es idempotente por defecto

Eso sirve como guía.

Pero en backend real, la pregunta importante no es solo el verbo HTTP.

La pregunta importante es:

- ¿qué efecto produce esta operación en el negocio?

### Ejemplo

Un `POST /orders` normalmente crea algo nuevo.

Si llega dos veces y crea dos órdenes, no hay idempotencia.

En cambio, un `PUT /users/{id}/email-preferences` puede actualizar el mismo recurso una y otra vez hacia el mismo estado final.

---

## Dónde suele importar más

La idempotencia merece atención especial en operaciones como:

- pagos
- creación de órdenes
- descuentos de stock
- reservas
- emisión de facturas
- activaciones
- reseteo de contraseña
- webhooks
- tareas programadas que podrían correr dos veces
- acciones administrativas críticas

En todas ellas, repetir una intención puede ser caro, riesgoso o difícil de revertir.

---

## Casos donde una operación puede ser idempotente

### 1. Llevar un recurso a un estado concreto

Ejemplos:

- activar una preferencia
- marcar como archivado
- bloquear una cuenta
- asociar un rol fijo

Si el estado final ya quedó aplicado, repetir la operación no debería producir daño adicional.

### 2. Reintentos técnicos sobre una intención única

Ejemplos:

- crear un pago
- registrar una orden
- procesar un webhook con un identificador único

Acá la idempotencia suele requerir memoria del procesamiento previo.

---

## Casos donde no podés asumir idempotencia

Hay operaciones donde repetir es claramente peligroso:

- sumar saldo
- descontar stock
- incrementar contadores de negocio
- registrar movimientos contables
- otorgar créditos
- emitir devoluciones
- ejecutar transferencias

En estos casos, si querés tolerar reintentos, necesitás un diseño explícito.

No alcanza con decir:

- “si vuelve a llegar, probablemente no pase nada”

---

## Ejemplo mental importante: intención vs request

Esta distinción ayuda muchísimo.

No toda request nueva representa una intención nueva.

A veces una segunda request es solo:

- un reintento de la misma intención original

### Ejemplo

Un usuario hace clic en “Pagar”.

La app envía la request.
El pago se procesa.
Pero la respuesta no llega por un timeout.
Entonces el cliente reintenta.

Desde el punto de vista del negocio:

- no hay dos intenciones de pagar
- hay una intención con dos requests

Ese matiz cambia completamente el diseño correcto.

---

## Qué suele romper la idempotencia

Patrones que suelen generar problemas:

- insertar siempre un nuevo registro ante cada request
- ejecutar efectos secundarios antes de confirmar estado
- no tener identificadores únicos de operación
- no validar si la transición ya ocurrió
- depender de memoria local de una instancia
- procesar mensajes o webhooks sin deduplicación
- disparar integraciones externas dos veces
- no modelar estados del recurso

---

## Estrategia 1: modelar estado final en vez de acción repetible

A veces la mejor solución no es “ejecutar una acción”, sino “llevar el recurso a un estado”.

### Menos sano

- `POST /orders/{id}/cancel`

### Más claro en algunos casos

- `PUT /orders/{id}/status` hacia `CANCELLED`

La ventaja conceptual es que el backend puede razonar mejor:

- si ya está cancelada, el estado final ya fue alcanzado
- repetir no cambia nada relevante

No siempre hay que rediseñarlo así, pero esta forma de pensar ayuda mucho.

---

## Estrategia 2: usar claves de idempotencia

En operaciones críticas de creación o ejecución única, suele servir una **idempotency key**.

La idea general es:

- el cliente envía una clave única para una intención
- el backend guarda que esa clave ya fue procesada
- si la misma clave vuelve con la misma intención, no vuelve a ejecutar el efecto

### Ejemplo conceptual

- crear pago con clave `abc-123`
- el backend procesa y registra el resultado
- si llega otra vez `abc-123`, el sistema devuelve el resultado anterior o una respuesta controlada

### Qué evita

- doble cobro
- doble orden
- doble side effect

### Qué exige

- persistencia confiable
- política de expiración razonable
- validación de que la clave represente la misma intención y no otra distinta

---

## Una clave de idempotencia no debería reutilizarse para otra cosa

Esto es importante.

No alcanza con guardar “ya vi esta clave”.

También conviene pensar:

- ¿la request repetida es realmente equivalente?
- ¿el payload cambió?
- ¿la operación es la misma?

Porque si alguien reutiliza la misma clave con otro contenido, no deberías tratarlo como si fuera exactamente la misma intención.

---

## Estrategia 3: restricciones únicas e invariantes en base de datos

Muchas veces la base de datos ayuda a sostener idempotencia.

Ejemplos:

- una orden externa con `external_reference` único
- un evento procesado con `event_id` único
- una relación usuario-recurso con unicidad
- una activación que solo puede registrarse una vez

Esto no resuelve todo por sí solo, pero agrega una barrera muy útil.

Porque incluso si dos requests pasan casi al mismo tiempo, la persistencia puede impedir que ambas consoliden el mismo efecto.

---

## Estrategia 4: verificar transición de estado antes de ejecutar

En muchos casos la pregunta correcta es:

- ¿todavía corresponde ejecutar esta operación?

### Ejemplo

Si una orden ya está:

- pagada
- cancelada
- enviada
- revertida

entonces algunas operaciones ya no deberían correr otra vez.

Esa validación de transición protege contra:

- reintentos tardíos
- llamadas duplicadas
- secuencias inválidas

---

## Ojo con los efectos secundarios fuera de la base

Un backend puede persistir bien el estado y aun así duplicar cosas fuera de la base:

- emails
- notificaciones
- llamadas a pasarela de pago
- publicación de eventos
- mensajes en cola
- webhooks salientes

Por eso la idempotencia no debe revisarse solo en el repository.

También hay que mirar:

- qué se dispara alrededor
- en qué momento se dispara
- si puede repetirse
- si existe forma de deduplicarlo o correlacionarlo

---

## Idempotencia y race conditions se tocan, pero no son lo mismo

Estos dos temas están muy relacionados, pero conviene distinguirlos.

### Race condition
Trata sobre competencia temporal entre ejecuciones.

### Idempotencia
Trata sobre tolerar repetición de una misma intención sin producir efectos extra.

A veces una operación necesita ambas cosas:

- no romperse si llegan dos requests casi simultáneas
- y además no duplicar el efecto final

---

## Qué respuesta conviene devolver en reintentos

No existe una única respuesta correcta para todos los casos.

Lo importante es la consistencia semántica.

Según el diseño, un reintento idempotente podría devolver:

- el mismo resultado exitoso
- una representación actual del recurso
- una confirmación de que ya estaba aplicado
- una respuesta controlada indicando que la intención ya fue procesada

Lo importante es evitar mensajes confusos como:

- “falló” cuando en realidad ya se había ejecutado
- “se creó de nuevo” cuando no debería

---

## Mal diseño típico

### Ejemplo conceptual inseguro

Un endpoint de pago hace esto:

1. recibe request
2. llama al proveedor de pagos
3. guarda registro
4. responde

Si entre el paso 2 y el 4 hay timeout o reintento, podrías terminar con:

- dos cobros
- un cobro y dos registros
- respuestas ambiguas

### Problema de fondo

La operación no fue diseñada para reconocer la misma intención repetida.

---

## Diseño más sano

Un enfoque más sano suele incluir:

- identificador único de intención
- validación de estado actual
- persistencia consistente del procesamiento
- control de duplicados
- cuidado con efectos secundarios
- respuesta coherente en reintentos

No hace falta bajar acá a una implementación específica para entender la idea.

La clave es que el backend pueda decir:

- “esto ya lo procesé”
- o “esto ya quedó en el estado deseado”

sin volver a ejecutar daño de negocio.

---

## Qué conviene revisar en Spring

Cuando revises un endpoint Spring con ojos de idempotencia, preguntate:

- ¿esta operación crea, modifica, cobra, envía o descuenta algo?
- ¿qué pasa si llega dos veces?
- ¿puede haber reintentos legítimos?
- ¿hay timeout entre procesamiento y respuesta?
- ¿hay una clave de idempotencia o identificador único?
- ¿la base de datos ayuda con unicidad o transición de estado?
- ¿hay efectos secundarios externos duplicables?
- ¿la lógica vive en service o depende del frontend?
- ¿el endpoint distingue intención nueva de reintento?

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- operaciones críticas modeladas explícitamente
- invariantes claras de negocio
- validaciones de estado antes de ejecutar
- unicidad donde corresponde
- tolerancia a reintentos técnicos
- deduplicación de webhooks o eventos
- manejo claro de efectos secundarios
- respuestas coherentes cuando la intención ya fue procesada

---

## Señales de ruido

Estas señales suelen indicar problemas:

- cada request repetida crea algo nuevo sin preguntas
- el frontend es la única defensa contra duplicados
- no hay forma de saber si una operación ya se ejecutó
- los timeouts dejan al sistema en zona gris
- pagos, stock o reservas pueden duplicarse con facilidad
- webhooks se procesan varias veces
- la lógica depende del azar temporal
- nadie puede explicar qué pasa ante reintentos

---

## Checklist práctico

Cuando revises idempotencia en un backend Spring, preguntate:

- ¿qué operaciones son peligrosas si se repiten?
- ¿la repetición representa una intención nueva o un reintento?
- ¿cómo reconoce el backend esa diferencia?
- ¿hay validación de transición de estado?
- ¿hay claves de idempotencia donde hacen falta?
- ¿hay restricciones únicas útiles en base de datos?
- ¿se pueden duplicar pagos, órdenes, stock o notificaciones?
- ¿los webhooks y jobs toleran repetición?
- ¿los efectos externos también están controlados?
- ¿la respuesta en reintentos es clara y consistente?

---

## Mini ejercicio de reflexión

Tomá tres endpoints de tu backend y respondé:

1. ¿Qué efecto de negocio produce cada uno?
2. ¿Qué pasaría si llega dos veces la misma request?
3. ¿La segunda request sería una intención nueva o un reintento?
4. ¿Puede duplicar cobros, registros o efectos secundarios?
5. ¿Hay una transición de estado que te ayude a protegerte?
6. ¿Necesitaría una clave de idempotencia?
7. ¿Cuál de esos tres endpoints hoy te preocupa más si hay reintentos?

---

## Resumen

Idempotencia no es un detalle académico de HTTP.

Es una forma de diseñar el backend para que una misma intención no genere daño adicional cuando la request se repite.

Eso ayuda a evitar:

- dobles cobros
- duplicados de órdenes
- side effects repetidos
- estados inconsistentes
- comportamiento frágil ante reintentos

En resumen:

> un backend más maduro no trata toda request repetida como una operación nueva.  
> Primero intenta entender si está viendo una nueva intención o el mismo intento que volvió a llegar.

---

## Próximo tema

**Confirmaciones útiles en flujos sensibles**
