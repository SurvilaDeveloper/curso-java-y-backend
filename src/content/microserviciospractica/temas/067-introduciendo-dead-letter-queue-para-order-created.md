---
title: "Introduciendo dead-letter queue para order.created"
description: "Primer cierre serio del manejo de errores en mensajería dentro de NovaMarket. Configuración de una DLQ para eventos order.created que no pudieron procesarse correctamente."
order: 67
module: "Módulo 10 · Mensajería asincrónica con RabbitMQ"
level: "intermedio"
draft: false
---

# Introduciendo dead-letter queue para `order.created`

En las clases anteriores vimos claramente algo importante:

- el circuito asincrónico funciona,
- pero también puede fallar,
- y cuando el consumidor falla necesitamos una estrategia mejor que simplemente “dejar que explote”.

En la clase anterior ordenamos el lado consumidor:

- limpiamos el listener,
- separamos el procesamiento,
- y empezamos a darle nombre propio a los errores.

Ahora sí toca dar un paso muy importante dentro del módulo:

**introducir una dead-letter queue.**

La idea es sencilla pero muy poderosa:

- si un mensaje no pudo procesarse correctamente,
- no queremos perderlo ni dejarlo en un limbo confuso,
- queremos moverlo a un lugar explícito donde quede identificado como mensaje fallido.

Ese es el rol de una **DLQ**.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- configurada una dead-letter queue para el flujo `order.created`,
- conectada la cola principal con su DLQ,
- y validado el recorrido de un mensaje que falla y termina en la cola de error.

Esto marca un cierre bastante serio del primer tramo de robustez en mensajería dentro de NovaMarket.

---

## Estado de partida

Partimos de este contexto:

- `order-service` publica `order.created`,
- RabbitMQ enruta el mensaje hacia la cola de notificaciones,
- `notification-service` lo consume,
- y ya sabemos provocar fallas controladas del lado consumidor.

Lo que todavía falta es una política explícita para esos mensajes fallidos.

Hoy el sistema puede fallar, pero todavía necesita una forma más clara de aislar y observar esos errores.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- definir una dead-letter queue,
- conectar la cola principal con esa DLQ,
- ajustar la configuración AMQP,
- volver a provocar una falla del consumidor,
- y verificar que el mensaje termine en la cola de error.

---

## Qué problema resuelve una DLQ

Una DLQ no “arregla” el mensaje automáticamente.

Lo que hace es muchísimo más valioso desde el punto de vista operativo:

- evita que el mensaje se pierda silenciosamente,
- evita que quede mezclado con el flujo normal,
- y deja un lugar explícito donde los mensajes fallidos pueden revisarse, reintentarse o diagnosticarse.

En otras palabras:

**convierte el error en algo observable y gestionable.**

---

## Paso 1 · Elegir un nombre claro para la dead-letter queue

Conviene sostener la convención que ya venimos usando.

Si la cola principal es:

```txt
notification.order-created.queue
```

una DLQ razonable podría llamarse:

```txt
notification.order-created.dlq
```

Ese nombre es claro y deja muy visible su relación con la cola principal.

---

## Paso 2 · Elegir una routing key para la DLQ

También conviene darle una routing key clara.

Por ejemplo:

```txt
order.created.dlq
```

No hace falta sobrecargar esta clase con una taxonomía inmensa de claves, pero sí conviene que la naming strategy ya sea expresiva y consistente.

---

## Paso 3 · Extender las constantes AMQP

Ahora conviene ampliar la clase de constantes con algo conceptual como esto:

```java
public final class AmqpConstants {

    public static final String EVENTS_EXCHANGE = "novamarket.events";
    public static final String ORDER_CREATED_ROUTING_KEY = "order.created";
    public static final String NOTIFICATION_ORDER_CREATED_QUEUE = "notification.order-created.queue";

    public static final String DLX_EXCHANGE = "novamarket.dlx";
    public static final String ORDER_CREATED_DLQ = "notification.order-created.dlq";
    public static final String ORDER_CREATED_DLQ_ROUTING_KEY = "order.created.dlq";

    private AmqpConstants() {
    }
}
```

No es obligatorio que el exchange de DLQ se llame exactamente así, pero sí conviene dejar claro que estamos separando:

- el flujo normal de eventos
- del flujo de mensajes muertos

---

## Paso 4 · Configurar la cola principal con dead-letter exchange

Ahora viene uno de los cambios centrales.

La cola principal ya no debería declararse solo como durable.  
Conviene añadirle argumentos de dead-lettering.

Conceptualmente, la declaración puede verse así:

```java
@Bean
public Queue notificationOrderCreatedQueue() {
    return QueueBuilder
            .durable(AmqpConstants.NOTIFICATION_ORDER_CREATED_QUEUE)
            .deadLetterExchange(AmqpConstants.DLX_EXCHANGE)
            .deadLetterRoutingKey(AmqpConstants.ORDER_CREATED_DLQ_ROUTING_KEY)
            .build();
}
```

Esto le dice a RabbitMQ que, si un mensaje no puede procesarse correctamente en esta cola bajo la política correspondiente, debe reencaminarse al exchange de DLQ con la routing key indicada.

---

## Paso 5 · Declarar el exchange de DLQ y la cola de error

Ahora vamos a agregar la infraestructura complementaria.

Por ejemplo:

```java
@Bean
public TopicExchange deadLetterExchange() {
    return new TopicExchange(AmqpConstants.DLX_EXCHANGE, true, false);
}

@Bean
public Queue orderCreatedDlq() {
    return new Queue(AmqpConstants.ORDER_CREATED_DLQ, true);
}

@Bean
public Binding orderCreatedDlqBinding(
        Queue orderCreatedDlq,
        TopicExchange deadLetterExchange
) {
    return BindingBuilder
            .bind(orderCreatedDlq)
            .to(deadLetterExchange)
            .with(AmqpConstants.ORDER_CREATED_DLQ_ROUTING_KEY);
}
```

Con esto ya dejamos una ruta explícita para los mensajes fallidos.

---

## Paso 6 · Mantener la topología principal

No hay que perder de vista que la topología normal sigue existiendo.

Seguimos necesitando:

- exchange principal de eventos
- cola normal de notificaciones
- binding con `order.created`

La DLQ no reemplaza eso.  
Se agrega como una vía paralela para el caso de fallo.

---

## Paso 7 · Pensar el rechazo del mensaje desde el consumidor

Para que la DLQ tenga efecto real, necesitamos que el mensaje se considere fallido y no procesado correctamente.

Según cómo estés usando el listener container y el manejo de errores del consumidor, esto puede requerir:

- una excepción que no sea absorbida silenciosamente,
- una política de requeue específica,
- o configuración adicional del listener container.

En esta etapa del curso práctico, lo importante es mantener el error visible y preparar el flujo para que RabbitMQ trate el mensaje como fallido.

No hace falta todavía convertir esta clase en una tesis sobre cada variante del ack manual.  
La idea es dejar el circuito claro y verificable.

---

## Paso 8 · Reiniciar el entorno relevante

Después de ajustar la configuración AMQP, reiniciá:

- RabbitMQ si necesitás limpiar topología previa
- `order-service`
- `notification-service`

Y mantené arriba también:

- `config-server`
- `discovery-server`
- Keycloak
- `inventory-service`
- `api-gateway`

Esto es importante porque estamos tocando la infraestructura de mensajería y conviene arrancar con un estado claro del broker.

---

## Paso 9 · Generar un caso que falle en el consumidor

Ahora usá otra vez la falla controlada del consumidor, por ejemplo una orden con más de un ítem si esa condición sigue disparando la excepción de prueba.

Ejecutá algo como:

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

La orden puede seguir creándose correctamente en el flujo síncrono, pero ahora el evento debería terminar fallando del lado consumidor y terminar en la DLQ.

---

## Paso 10 · Revisar la consola de RabbitMQ

Ahora entrá a la UI de RabbitMQ y revisá:

- la cola principal
- la DLQ
- y el movimiento del mensaje

La meta fuerte de esta clase es justamente ver que el mensaje fallido ya no queda ambiguo: ahora tiene un destino explícito.

Ese es uno de los momentos más valiosos del módulo.

---

## Paso 11 · Interpretar lo que pasó arquitectónicamente

Después de esta prueba, el flujo real debería verse conceptualmente así:

1. se crea una orden
2. se publica `order.created`
3. RabbitMQ la enruta a la cola normal
4. `notification-service` intenta procesar
5. falla
6. el mensaje termina en la dead-letter queue

Eso significa que el sistema ya no solo procesa mensajes: también sabe **dónde dejar los que no pudo procesar**.

---

## Paso 12 · Probar también un caso feliz

Para cerrar el contraste, generá una orden que no dispare la falla del consumidor.

Por ejemplo, una de un solo ítem.

La idea es confirmar que:

- el caso sano sigue yendo por la cola normal y termina persistido,
- mientras que el caso fallido termina en la DLQ.

Ese contraste deja muchísimo más clara la utilidad de la estrategia.

---

## Qué estamos logrando con esta clase

Esta clase le agrega una capacidad muy valiosa al bloque de mensajería:

**el sistema ya no solo procesa eventos; también puede aislar explícitamente los que no pudo procesar.**

Eso mejora muchísimo la robustez operativa del circuito asincrónico.

---

## Qué todavía no hicimos

Todavía no:

- implementamos reprocesamiento de la DLQ,
- construimos una API para inspeccionar mensajes fallidos,
- ni agregamos una estrategia más rica de retry del consumidor antes de enviarlos a DLQ.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**tener una DLQ real y verificarla.**

---

## Errores comunes en esta etapa

### 1. Declarar la DLQ pero olvidar conectarla mediante dead-letter exchange
Entonces la infraestructura está, pero nunca se usa.

### 2. Mantener la excepción completamente absorbida en el consumidor
Si el mensaje no se considera fallido, no va a moverse como esperamos.

### 3. No revisar RabbitMQ después de la prueba
La consola del broker es una de las mejores formas de validar el circuito.

### 4. No comparar caso feliz y caso fallido
Ese contraste explica muchísimo mejor el valor de la DLQ.

### 5. Pensar que la DLQ “soluciona” el mensaje
No lo soluciona; lo aísla y lo vuelve gestionable.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería poder mover a una dead-letter queue los mensajes `order.created` que no pudieron procesarse correctamente en `notification-service`.

Eso representa un cierre muy fuerte del primer bloque serio de robustez en mensajería.

---

## Punto de control

Antes de seguir, verificá que:

- existe una DLQ clara,
- la cola principal tiene configuración de dead-lettering,
- el caso fallido termina en la DLQ,
- el caso feliz sigue funcionando por el circuito normal,
- y RabbitMQ deja visible esa diferencia.

Si eso está bien, el bloque actual de mensajería ya queda bastante más maduro.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a cerrar este tramo revisando el flujo asincrónico sano, el flujo fallido y el rol de la DLQ como parte de una estrategia más completa.

Eso va a dejar muy bien consolidado el módulo antes de avanzar hacia el siguiente gran bloque del curso.

---

## Cierre

En esta clase introdujimos una dead-letter queue para el evento `order.created`.

Con eso, NovaMarket ya no solo sabe publicar y consumir mensajes: también sabe aislar de forma explícita aquellos que no pudieron procesarse correctamente, que es una de las capacidades más importantes cuando la mensajería empieza a volverse realmente seria.
