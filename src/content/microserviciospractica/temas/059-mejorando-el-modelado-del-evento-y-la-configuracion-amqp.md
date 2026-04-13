---
title: "Mejorando el modelado del evento y la configuración AMQP"
description: "Refinamiento del primer flujo asincrónico de NovaMarket. Mejora del evento order.created, de la configuración de RabbitMQ y de la serialización entre order-service y notification-service."
order: 59
module: "Módulo 10 · Mensajería asincrónica con RabbitMQ"
level: "intermedio"
draft: false
---

# Mejorando el modelado del evento y la configuración AMQP

En la clase anterior logramos algo muy importante:

- `order-service` ya publica un evento,
- `notification-service` ya lo consume,
- y NovaMarket ya tiene su primer flujo asincrónico real.

Eso ya tiene muchísimo valor.  
Pero ahora que el circuito básico existe, conviene hacer una mejora importante:

**dejar el evento y la configuración AMQP en una forma más prolija, más clara y más sostenible.**

Porque una cosa es demostrar que RabbitMQ funciona.  
Y otra distinta es dejar la base bien preparada para seguir creciendo con nuevos eventos y nuevos consumidores.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mejor definido el evento `order.created`,
- más clara la configuración de cola y mensajería,
- más consistente la serialización entre productor y consumidor,
- y más ordenado el primer flujo asincrónico de NovaMarket.

Todavía no vamos a meter dead-letter queues ni estrategias avanzadas de reintento.  
Primero queremos ordenar bien lo que ya construimos.

---

## Estado de partida

Partimos de este contexto:

- RabbitMQ ya está levantado,
- `order-service` ya publica un evento cuando se crea una orden,
- `notification-service` ya lo consume,
- y el sistema ya puede reaccionar asincrónicamente a la creación de una orden.

Pero la implementación actual todavía puede tener algunas limitaciones típicas de una primera iteración, por ejemplo:

- nombres de cola repetidos “a mano” en varios lugares,
- evento demasiado mínimo,
- serialización poco explícita,
- y configuración AMQP todavía muy básica.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- mejorar el contrato del evento,
- centralizar mejor nombres de mensajería,
- configurar más claramente el convertidor JSON,
- y dejar el flujo productor-consumidor mucho más legible.

---

## Qué problema queremos resolver

Cuando un flujo asincrónico empieza a crecer, conviene evitar cosas como estas:

- strings mágicos repetidos en productor y consumidor,
- eventos demasiado pobres,
- configuración AMQP implícita o difícil de leer,
- y acoplamiento innecesario en torno al formato del mensaje.

La meta de esta clase es dejar una base que se pueda reutilizar mejor en lo que venga después.

---

## Paso 1 · Revisar el evento actual

En la clase anterior, el evento `OrderCreatedEvent` probablemente tenía algo muy simple como:

- `orderId`
- `status`

Eso alcanza para una primera demostración, pero ahora conviene enriquecerlo un poco para que represente mejor un hecho del negocio.

Una versión más útil podría incluir:

- `orderId`
- `status`
- `createdAt`
- `itemsCount`

No hace falta volverlo gigantesco.  
Pero sí conviene que deje más contexto útil para los consumidores.

---

## Paso 2 · Mejorar `OrderCreatedEvent`

Dentro de `order-service`, ajustá la clase del evento para que se acerque a algo como esto:

```java
package com.novamarket.order.dto;

import java.time.Instant;

public class OrderCreatedEvent {

    private Long orderId;
    private String status;
    private Instant createdAt;
    private Integer itemsCount;

    public OrderCreatedEvent() {
    }

    public OrderCreatedEvent(Long orderId, String status, Instant createdAt, Integer itemsCount) {
        this.orderId = orderId;
        this.status = status;
        this.createdAt = createdAt;
        this.itemsCount = itemsCount;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getItemsCount() {
        return itemsCount;
    }

    public void setItemsCount(Integer itemsCount) {
        this.itemsCount = itemsCount;
    }
}
```

Esto deja el evento bastante más expresivo para cualquier consumidor futuro.

---

## Paso 3 · Reutilizar una convención de nombres AMQP

Ahora conviene dejar de repetir nombres “a mano” dentro del código.

Una estrategia simple y muy útil es centralizar nombres como:

- nombre de cola
- nombre de exchange si lo incorporás
- routing key si más adelante la necesitás

Por ejemplo, dentro de `order-service` y también como referencia conceptual para `notification-service`, podés usar una clase tipo:

```java
package com.novamarket.order.config;

public final class AmqpConstants {

    public static final String ORDER_CREATED_QUEUE = "order-created.queue";

    private AmqpConstants() {
    }
}
```

Si querés ir un paso más ordenado, podés preparar también nombres para exchange y routing key, aunque todavía no los uses de forma elaborada.

---

## Paso 4 · Mejorar la configuración AMQP

En lugar de dejar solo una cola declarada de forma muy mínima, podés hacer la configuración un poco más explícita.

Por ejemplo:

```java
package com.novamarket.order.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    @Bean
    public Queue orderCreatedQueue() {
        return new Queue(AmqpConstants.ORDER_CREATED_QUEUE, true);
    }
}
```

La cola durable ya deja una base mejor que una cola puramente efímera de laboratorio.

No hace falta todavía entrar a una topología más rica con exchange + binding si no querés complejizar esta clase de más.

---

## Paso 5 · Configurar un convertidor JSON explícito

Este paso es muy importante.

Aunque Spring puede resolver bastante automáticamente según el stack, para el curso práctico conviene dejar clara la intención de serializar el evento como JSON.

Podés configurar un `MessageConverter` explícito, por ejemplo con Jackson.

Una aproximación razonable en `order-service` sería:

```java
package com.novamarket.order.config;

import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMessageConfig {

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
```

Y una configuración equivalente en `notification-service`.

Esto hace mucho más clara la serialización y evita ambigüedades innecesarias.

---

## Paso 6 · Ajustar la publicación del evento

Ahora, cuando se crea la orden, el evento debería construirse usando los nuevos campos.

Dentro de `OrderService`, una versión conceptual razonable sería:

```java
OrderCreatedEvent event = new OrderCreatedEvent(
        savedOrder.getId(),
        savedOrder.getStatus(),
        Instant.now(),
        savedOrder.getItems().size()
);

rabbitTemplate.convertAndSend(AmqpConstants.ORDER_CREATED_QUEUE, event);
```

Con esto, el evento deja de ser una notificación mínima y pasa a ser un hecho del negocio algo más expresivo.

---

## Paso 7 · Ajustar el consumidor en `notification-service`

Ahora el listener debería consumir el evento enriquecido.

Por ejemplo:

```java
package com.novamarket.notification.listener;

import com.novamarket.notification.dto.OrderCreatedEvent;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OrderCreatedListener {

    @RabbitListener(queues = "order-created.queue")
    public void handleOrderCreated(OrderCreatedEvent event) {
        System.out.println(
                "Evento recibido en notification-service: orderId=" + event.getOrderId()
                        + ", status=" + event.getStatus()
                        + ", createdAt=" + event.getCreatedAt()
                        + ", itemsCount=" + event.getItemsCount()
        );
    }
}
```

Y, nuevamente, conviene que el nombre de la cola no quede hardcodeado si ya decidiste centralizarlo también del lado consumidor.

---

## Paso 8 · Reiniciar `order-service` y `notification-service`

Después de estos cambios, reiniciá ambos servicios.

Asegurate también de tener arriba:

- RabbitMQ
- `config-server`
- `discovery-server`
- Keycloak
- `inventory-service`
- `api-gateway`

La idea es volver a probar el flujo asincrónico real completo.

---

## Paso 9 · Crear una orden autenticada

Ahora generá nuevamente una orden válida:

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

La respuesta principal debería seguir siendo la creación exitosa de la orden.

Pero ahora, además, el evento consumido debería ser más rico y mejor definido.

---

## Paso 10 · Revisar logs del consumidor

Mirá la consola de `notification-service`.

Deberías poder ver algo más expresivo que antes, por ejemplo:

- `orderId`
- `status`
- `createdAt`
- `itemsCount`

Esto confirma que la nueva estructura del evento está viajando y llegando correctamente.

---

## Qué estamos logrando con esta clase

Esta clase hace más serio el primer flujo asincrónico de NovaMarket.

Antes teníamos una demo funcional.  
Ahora tenemos una base bastante más clara para evolucionar:

- evento mejor modelado,
- configuración AMQP más prolija,
- y serialización más explícita.

Ese tipo de orden es muy valioso cuando el sistema empieza a crecer.

---

## Qué todavía no hicimos

Todavía no:

- persistimos la notificación consumida,
- modelamos exchange y routing keys más ricas,
- ni manejamos fallas del consumidor con más profundidad.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**dejar bien modelado y mejor configurado el primer flujo asincrónico.**

---

## Errores comunes en esta etapa

### 1. Seguir repitiendo strings mágicos de cola en varios lugares
Conviene centralizarlos.

### 2. Dejar la serialización demasiado implícita
Es mejor declarar intención clara con JSON.

### 3. Enriquecer demasiado el evento
Todavía queremos algo útil, no monstruoso.

### 4. Cambiar el productor y olvidarse del consumidor
Ambos tienen que entender el mismo contrato.

### 5. No volver a probar el flujo real después del refactor
Siempre conviene validar que la mejora no rompió el circuito.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería seguir publicando y consumiendo el evento `order.created`, pero con una implementación bastante más ordenada y expresiva que la primera versión.

Eso deja mucho mejor parada la arquitectura asincrónica del proyecto.

---

## Punto de control

Antes de seguir, verificá que:

- el evento fue enriquecido,
- el productor lo publica correctamente,
- el consumidor lo recibe correctamente,
- existe una configuración AMQP más clara,
- y la serialización JSON quedó explícita.

Si eso está bien, ya podemos dar el siguiente paso: guardar de verdad lo que el consumidor procesa.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a persistir las notificaciones consumidas y exponerlas como parte del sistema.

Ese será un paso importante porque `notification-service` dejará de ser solo un consumidor que imprime logs y pasará a convertirse en un servicio con estado propio.

---

## Cierre

En esta clase mejoramos el modelado del evento y la configuración AMQP del primer flujo asincrónico de NovaMarket.

Con eso, la arquitectura no solo sigue funcionando: también empieza a quedar preparada para crecer con más orden, más claridad y menos acoplamiento accidental.
