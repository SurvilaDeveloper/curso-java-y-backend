---
title: "Simulando fallas en notification-service"
description: "Inicio del tramo de robustez del bloque asincrónico en NovaMarket. Simulación controlada de errores en el consumidor para observar cómo se comporta RabbitMQ cuando el procesamiento falla."
order: 65
module: "Módulo 10 · Mensajería asincrónica con RabbitMQ"
level: "intermedio"
draft: false
---

# Simulando fallas en `notification-service`

En las clases anteriores logramos algo muy valioso:

- `order-service` publica el evento `order.created`,
- RabbitMQ lo enruta usando exchange, routing key y binding,
- `notification-service` lo consume,
- lo persiste,
- y además lo expone por API.

Eso deja un circuito asincrónico bastante sólido.

Pero todavía nos falta enfrentar una de las preguntas más importantes del módulo:

**¿qué pasa cuando falla el consumidor?**

Hasta ahora nos concentramos en el camino feliz:

- el evento llega,
- se procesa,
- y se guarda.

Pero en sistemas reales también puede pasar esto:

- el consumidor levanta una excepción,
- la base de datos del consumidor no responde,
- el payload llega en un estado inesperado,
- o la lógica del servicio falla en medio del procesamiento.

Ese es el objetivo de esta clase:  
**romper intencionalmente el consumidor para observar qué hace el broker y qué hace nuestro sistema.**

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- el consumidor puede fallar durante el procesamiento,
- RabbitMQ no “hace magia” automáticamente si el manejo no está bien definido,
- y el flujo asincrónico también necesita estrategia de robustez, no solo el flujo síncrono.

No vamos a arreglar todavía el problema por completo.  
Primero queremos verlo con claridad.

---

## Estado de partida

Partimos de este contexto:

- RabbitMQ está arriba,
- `order-service` publica eventos `order.created`,
- `notification-service` consume esos eventos,
- y la persistencia de notificaciones ya funciona en el caso feliz.

Eso significa que ya existe un circuito asincrónico real sobre el que tiene sentido trabajar manejo de fallas.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- introducir una falla controlada en `notification-service`,
- publicar eventos reales,
- observar qué pasa cuando el consumidor rompe el procesamiento,
- revisar logs,
- mirar RabbitMQ,
- y entender mejor por qué el bloque asincrónico necesita manejo explícito de errores.

---

## Por qué conviene romper primero el consumidor

Es el mismo criterio que ya usamos en el bloque de resiliencia síncrona.

Antes de agregar reintentos, error handling o DLQ, conviene responder una pregunta muy simple:

**¿cómo se comporta hoy el sistema cuando algo sale mal?**

Ese contraste es clave porque después cada mejora técnica se apoya en un problema visible, no en una receta memorizada.

---

## Qué tipo de falla nos interesa simular

Para esta etapa del curso práctico conviene usar una falla bien simple y controlada, por ejemplo:

- lanzar una excepción intencional dentro del listener para un caso puntual,
- o cortar el guardado en base bajo una condición concreta.

No hace falta complicarlo más que eso.

La idea es que el evento llegue al consumidor, pero que el procesamiento falle una vez adentro.

---

## Paso 1 · Confirmar primero el caso sano

Antes de romper nada, conviene volver a probar el circuito sano.

Generá una orden válida:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

Y después consultá:

```bash
curl http://localhost:8085/notifications
```

La idea es verificar que el circuito está funcionando bien antes de introducir la falla.

---

## Paso 2 · Introducir una falla controlada en el listener

Ahora vamos a modificar temporalmente `notification-service` para que falle al procesar cierto caso.

Por ejemplo, dentro del listener podés hacer algo conceptualmente así:

```java
@RabbitListener(queues = "notification.order-created.queue")
public void handleOrderCreated(OrderCreatedEvent event) {
    if (event.getItemsCount() != null && event.getItemsCount() > 1) {
        throw new RuntimeException("Falla intencional de prueba en notification-service");
    }

    notificationService.saveOrderCreated(event);
}
```

Esto nos deja un escenario muy útil:

- si la orden tiene 1 ítem, el consumidor funciona,
- si tiene más de 1 ítem, el consumidor falla.

Eso hace muy fácil comparar ambos comportamientos.

---

## Paso 3 · Reiniciar `notification-service`

Después de introducir esta lógica de prueba, reiniciá `notification-service`.

Asegurate también de tener arriba:

- RabbitMQ
- `config-server`
- `discovery-server`
- Keycloak
- `inventory-service`
- `order-service`
- `api-gateway`

Queremos observar el comportamiento en el sistema real.

---

## Paso 4 · Probar un caso que no falle

Primero generá una orden con un solo ítem:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

Y verificá que siga apareciendo correctamente en:

```bash
curl http://localhost:8085/notifications
```

Esto confirma que la falla simulada está realmente acotada al caso que queremos estudiar.

---

## Paso 5 · Probar un caso que sí falle

Ahora generá una orden con más de un ítem:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 },
      { "productId": 2, "quantity": 1 }
    ]
  }'
```

La orden principal debería seguir creándose correctamente, porque el flujo síncrono ya terminó bien en `order-service`.

Pero ahora el consumidor va a fallar cuando intente procesar el evento.

Este contraste es muy importante:

- el negocio principal puede haber terminado bien,
- pero la reacción asincrónica puede quedar rota.

---

## Paso 6 · Revisar logs de `notification-service`

Ahora mirá la consola de `notification-service`.

Deberías ver la excepción controlada que introdujimos.

Este paso es central porque muestra con mucha claridad que el consumidor recibió el mensaje, pero no pudo completar su trabajo.

---

## Paso 7 · Consultar nuevamente `/notifications`

Ahora probá otra vez:

```bash
curl http://localhost:8085/notifications
```

La idea es observar que la notificación correspondiente al caso fallido probablemente no quedó persistida.

Eso confirma que el problema no es “de publicación”, sino específicamente de procesamiento del consumidor.

---

## Paso 8 · Mirar RabbitMQ

Ahora entrá a la consola de RabbitMQ y observá qué pasa con la cola.

Dependiendo de la configuración actual del consumidor y del broker, pueden pasar cosas distintas:

- el mensaje puede volver a intentarse,
- puede quedarse en un estado problemático,
- o puede reencolarse según la política actual.

No hace falta todavía cerrar toda la teoría del ack/nack en esta clase.  
Lo importante es notar que un fallo de consumidor tiene impacto real sobre el estado del mensaje y del flujo.

---

## Paso 9 · Pensar qué parte del sistema falló y cuál no

Este punto es muy importante.

Después de este experimento, conviene distinguir bien:

### Lo que siguió funcionando
- autenticación
- gateway
- creación de la orden
- publicación del evento

### Lo que falló
- el procesamiento del evento en `notification-service`

Ese mapa es valiosísimo, porque nos muestra que en arquitecturas asincrónicas el éxito del request principal no garantiza que toda la cadena posterior haya quedado bien.

---

## Qué estamos logrando con esta clase

Esta clase vuelve visible algo muy importante:

**la mensajería también necesita resiliencia.**

No alcanza con que RabbitMQ esté arriba y el productor publique bien.

También hay que pensar:

- qué pasa si el consumidor rompe,
- qué pasa con el mensaje,
- y cómo queremos reaccionar cuando el procesamiento falla.

Ese problema ya está totalmente visible después de esta clase.

---

## Qué todavía no hicimos

Todavía no:

- agregamos reintentos controlados del consumidor,
- definimos una estrategia clara de error,
- ni implementamos una dead-letter queue.

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**ver cómo falla el consumidor en el estado actual del sistema.**

---

## Errores comunes en esta etapa

### 1. No probar primero el caso sano
Eso impide comparar correctamente el impacto real de la falla.

### 2. Introducir una falla demasiado caótica
Conviene que sea simple y condicionada.

### 3. Mirar solo el productor
En esta clase el foco está en el consumidor.

### 4. No revisar `/notifications` después de la falla
Ese endpoint ayuda mucho a comprobar si el efecto final quedó persistido o no.

### 5. Intentar arreglar el problema antes de observarlo
El valor de la clase está justamente en el contraste.

---

## Resultado esperado al terminar la clase

Al terminar esta clase deberías haber visto que:

- el flujo síncrono puede terminar bien,
- el evento puede publicarse bien,
- pero el consumidor puede fallar y dejar el circuito asincrónico incompleto.

Eso deja perfectamente planteado el siguiente paso del módulo.

---

## Punto de control

Antes de seguir, verificá que:

- simulaste una falla controlada en `notification-service`,
- generaste un caso que pasa y otro que falla,
- revisaste logs del consumidor,
- revisaste `/notifications`,
- y entendiste que el flujo asincrónico también necesita manejo explícito de errores.

Si eso está bien, ya podemos pasar a mejorar el manejo básico del consumidor.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a agregar una estrategia básica de manejo de errores y reintento del consumidor.

Ese será el primer paso para que el sistema no dependa solo de “que el listener no falle”.

---

## Cierre

En esta clase simulamos fallas en `notification-service` y dejamos visible un punto clave del módulo: el bloque asincrónico también puede romperse, y cuando lo hace necesitamos una estrategia concreta para no perder control del sistema.
