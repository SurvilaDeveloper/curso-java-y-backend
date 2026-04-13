---
title: "Publicando y consumiendo usando exchange y routing key"
description: "Refactor del flujo asincrónico de NovaMarket para usar la nueva topología AMQP basada en exchange, routing key y binding."
order: 63
module: "Módulo 10 · Mensajería asincrónica con RabbitMQ"
level: "intermedio"
draft: false
---

# Publicando y consumiendo usando exchange y routing key

En la clase anterior dejamos mejor modelada la topología AMQP del proyecto:

- definimos un exchange de eventos,
- definimos una routing key para `order.created`,
- y dejamos una cola de notificaciones enlazada mediante un binding explícito.

Eso fue un paso muy importante de diseño.

Ahora toca hacer que esa topología mejorada deje de ser solo una intención arquitectónica y pase a ser el flujo real del sistema.

En otras palabras:

**vamos a refactorizar el productor y el consumidor para que usen exchange + routing key en lugar de depender de una cola directa.**

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- `order-service` publicando en el exchange de eventos,
- `notification-service` consumiendo desde la cola enlazada al binding correspondiente,
- y el evento `order.created` circulando ya sobre la nueva topología AMQP.

---

## Estado de partida

Partimos de este contexto:

- RabbitMQ está arriba,
- el primer flujo asincrónico ya existe,
- `notification-service` ya persiste y expone notificaciones,
- y la topología AMQP nueva ya fue modelada.

Pero todavía no terminamos de mover el flujo real a esa topología.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- ajustar el productor para publicar al exchange,
- ajustar el consumidor para seguir escuchando la cola correcta,
- revisar que el binding haga el enrutamiento esperado,
- y volver a probar el circuito completo.

---

## Qué problema estamos resolviendo exactamente

Queremos dejar atrás este estilo conceptual:

- productor -> cola específica

Y pasar a este otro:

- productor -> exchange
- con routing key -> RabbitMQ decide la cola
- consumidor -> escucha su propia cola

Esto mejora mucho el desacoplamiento del sistema.

---

## Paso 1 · Revisar las constantes AMQP

Antes de tocar productor y consumidor, conviene revisar la clase de constantes.

Una base razonable debería incluir algo equivalente a:

```java
public final class AmqpConstants {

    public static final String EVENTS_EXCHANGE = "novamarket.events";
    public static final String ORDER_CREATED_ROUTING_KEY = "order.created";
    public static final String NOTIFICATION_ORDER_CREATED_QUEUE = "notification.order-created.queue";

    private AmqpConstants() {
    }
}
```

La idea es que tanto publicación como consumo se apoyen en esta convención y no en strings sueltos.

---

## Paso 2 · Ajustar `order-service` para publicar al exchange

Este es el cambio central del productor.

Donde antes teníamos algo como:

```java
rabbitTemplate.convertAndSend(AmqpConstants.NOTIFICATION_ORDER_CREATED_QUEUE, event);
```

ahora queremos movernos a algo como:

```java
rabbitTemplate.convertAndSend(
        AmqpConstants.EVENTS_EXCHANGE,
        AmqpConstants.ORDER_CREATED_ROUTING_KEY,
        event
);
```

Ese pequeño cambio transforma bastante la arquitectura del flujo.

---

## Paso 3 · Revisar el lugar exacto donde se publica

Dentro de `OrderService`, el bloque razonable podría quedar conceptualmente así:

```java
OrderCreatedEvent event = new OrderCreatedEvent(
        savedOrder.getId(),
        savedOrder.getStatus(),
        Instant.now(),
        savedOrder.getItems().size()
);

rabbitTemplate.convertAndSend(
        AmqpConstants.EVENTS_EXCHANGE,
        AmqpConstants.ORDER_CREATED_ROUTING_KEY,
        event
);
```

Lo importante es que:

- el productor ya no conoce la cola final,
- solo conoce el exchange y la naturaleza del evento mediante la routing key.

Ese desacoplamiento es el gran valor del refactor.

---

## Paso 4 · Mantener o ajustar la configuración AMQP

La configuración del exchange, cola y binding que preparamos antes debería seguir existiendo.

Conceptualmente, algo como:

```java
@Bean
public TopicExchange eventsExchange() {
    return new TopicExchange(AmqpConstants.EVENTS_EXCHANGE, true, false);
}

@Bean
public Queue notificationOrderCreatedQueue() {
    return new Queue(AmqpConstants.NOTIFICATION_ORDER_CREATED_QUEUE, true);
}

@Bean
public Binding notificationOrderCreatedBinding(
        Queue notificationOrderCreatedQueue,
        TopicExchange eventsExchange
) {
    return BindingBuilder
            .bind(notificationOrderCreatedQueue)
            .to(eventsExchange)
            .with(AmqpConstants.ORDER_CREATED_ROUTING_KEY);
}
```

Ese binding es justamente lo que permite que el mensaje publicado con `order.created` termine en la cola de notificaciones.

---

## Paso 5 · Ajustar el consumidor para escuchar la cola final

Del lado de `notification-service`, el listener puede seguir escuchando la cola concreta.

Por ejemplo:

```java
@Component
public class OrderCreatedListener {

    private final NotificationService notificationService;

    public OrderCreatedListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.order-created.queue")
    public void handleOrderCreated(OrderCreatedEvent event) {
        notificationService.saveOrderCreated(event);

        System.out.println("Notificación persistida para orderId=" + event.getOrderId());
    }
}
```

Idealmente, también conviene que el nombre de la cola se centralice del lado consumidor para sostener coherencia con el nuevo diseño.

---

## Paso 6 · Revisar la serialización JSON

Como ya venimos usando un `Jackson2JsonMessageConverter` o equivalente, conviene confirmar que tanto productor como consumidor mantienen la misma estrategia.

Este refactor no debería romper la serialización si el evento sigue teniendo el mismo contrato general.

Pero igual vale la pena revisarlo, porque estamos tocando el punto central del flujo asincrónico.

---

## Paso 7 · Reiniciar `order-service` y `notification-service`

Ahora reiniciá ambos servicios para tomar:

- la nueva publicación al exchange,
- la topología actual,
- y cualquier ajuste del consumidor.

Asegurate también de tener arriba:

- RabbitMQ
- `config-server`
- `discovery-server`
- Keycloak
- `inventory-service`
- `api-gateway`

---

## Paso 8 · Crear una orden autenticada

Ahora generá una orden válida otra vez:

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

La expectativa es:

- la orden se crea como siempre,
- el evento se publica al exchange,
- RabbitMQ lo enruta a la cola de notificaciones,
- y `notification-service` lo consume y persiste.

---

## Paso 9 · Verificar el resultado en `notification-service`

Mirá la consola de `notification-service`.

Deberías seguir viendo la recepción del evento y la persistencia de la notificación.

Eso confirma que el refactor no rompió el flujo y que la nueva topología ya está operativa de verdad.

---

## Paso 10 · Verificar también el endpoint `/notifications`

Ahora consultá:

```bash
curl http://localhost:8085/notifications
```

La respuesta debería incluir la notificación generada a partir de la orden recién creada.

Este paso es muy valioso porque confirma que:

- la publicación funcionó,
- el binding enrutó correctamente,
- el consumidor recibió el mensaje,
- y el resultado final quedó visible por API.

---

## Paso 11 · Revisar RabbitMQ en la consola

Si querés darle más valor visual a esta clase, abrí la UI de RabbitMQ y revisá:

- el exchange `novamarket.events`
- la cola `notification.order-created.queue`
- y el binding correspondiente

Esto ayuda mucho a conectar:

- el código,
- el diseño de la topología,
- y el comportamiento real del broker.

---

## Qué estamos logrando con esta clase

Esta clase completa un refactor arquitectónico importante.

Antes, el flujo asincrónico funcionaba, pero con un productor demasiado pegado a una cola final.

Ahora el sistema ya trabaja con una topología mucho más clara y propia de un diseño basado en eventos.

Eso mejora bastante la sostenibilidad del módulo.

---

## Qué todavía no hicimos

Todavía no:

- agregamos más de un consumidor para el mismo evento,
- modelamos nuevos eventos,
- usamos comodines de routing key,
- ni implementamos colas de error o reintentos más avanzados.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**que el primer flujo asincrónico real ya funcione sobre exchange + routing key.**

---

## Errores comunes en esta etapa

### 1. Cambiar el productor pero dejar mal el binding
Entonces el mensaje se publica, pero no llega a ninguna cola útil.

### 2. Mantener nombres inconsistentes entre exchange, routing key y cola
Conviene sostener muy bien la convención.

### 3. Romper la serialización al mover el flujo
Hay que confirmar que productor y consumidor siguen entendiendo el mismo evento.

### 4. No volver a probar el endpoint `/notifications`
Ese endpoint es una gran verificación de punta a punta.

### 5. Pensar que el consumidor tiene que escuchar el exchange
En RabbitMQ el consumidor escucha la cola; el exchange enruta.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería seguir completando el flujo asincrónico de `order.created`, pero ahora apoyándose en una topología AMQP más seria y mejor desacoplada.

Eso deja bastante mejor parado el módulo de mensajería.

---

## Punto de control

Antes de seguir, verificá que:

- `order-service` ya publica al exchange,
- la routing key usada es `order.created`,
- el binding enruta hacia la cola correcta,
- `notification-service` sigue consumiendo,
- y `/notifications` sigue reflejando el resultado.

Si eso está bien, ya podemos cerrar este tramo del módulo con una verificación integral del circuito asincrónico completo.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a probar de punta a punta el circuito asincrónico actual y revisar qué parte del módulo ya quedó sólida.

Eso nos va a permitir cerrar bien esta etapa antes de avanzar hacia nuevas extensiones del roadmap.

---

## Cierre

En esta clase refactorizamos el flujo asincrónico de NovaMarket para usar de verdad la topología basada en exchange, routing key y binding.

Con eso, el sistema no solo sigue funcionando: también queda mucho mejor diseñado para crecer hacia una arquitectura de eventos más rica y más desacoplada.
