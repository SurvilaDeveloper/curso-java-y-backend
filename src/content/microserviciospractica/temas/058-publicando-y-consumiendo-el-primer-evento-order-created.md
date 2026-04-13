---
title: "Publicando y consumiendo el primer evento order.created"
description: "Primer flujo asincrónico real de NovaMarket. Publicación de un evento de orden creada desde order-service y consumo en notification-service usando RabbitMQ."
order: 58
module: "Módulo 10 · Mensajería asincrónica con RabbitMQ"
level: "intermedio"
draft: false
---

# Publicando y consumiendo el primer evento `order.created`

En las dos clases anteriores dejamos lista la base del bloque de mensajería:

- levantamos RabbitMQ,
- y creamos `notification-service` como nueva pieza del proyecto.

Ahora sí toca el paso más importante de este tramo:

**hacer que el sistema publique y consuma un evento real del negocio.**

La idea práctica es muy clara:

- cuando una orden se crea correctamente,
- `order-service` va a publicar un evento,
- y `notification-service` va a reaccionar a ese evento de forma asincrónica.

Ese será el primer flujo de mensajería real de NovaMarket.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- configurado `order-service` para publicar un evento `order.created`,
- configurado `notification-service` para consumir ese evento,
- conectado RabbitMQ al flujo real del sistema,
- y verificado el primer recorrido asincrónico completo de NovaMarket.

---

## Estado de partida

Partimos de este contexto:

- RabbitMQ ya está arriba,
- `notification-service` ya existe,
- `order-service` ya crea órdenes de manera síncrona,
- y el flujo principal del sistema ya está bastante consolidado.

Pero hoy todavía no existe ninguna reacción asincrónica real asociada a la creación de una orden.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- agregar la integración de RabbitMQ a los servicios necesarios,
- definir una cola simple,
- crear un evento de orden creada,
- publicar ese evento desde `order-service`,
- consumirlo en `notification-service`,
- y verificar el recorrido completo.

---

## Qué estamos intentando lograr a nivel arquitectónico

Hasta ahora, la creación de una orden termina dentro de `order-service`.

Después de esta clase, la arquitectura va a poder hacer algo más interesante:

- `order-service` sigue cumpliendo su flujo principal,
- pero además dispara un evento que otro servicio consume después.

Eso es muy importante porque empieza a desacoplar la reacción secundaria del núcleo del request.

En términos del proyecto, es un gran paso hacia una arquitectura más realista.

---

## Paso 1 · Agregar la dependencia de RabbitMQ en `order-service`

Dentro de `order-service`, agregá la dependencia correspondiente a:

- **Spring AMQP** o la integración de RabbitMQ que ya venís usando en tu stack

La idea es que `order-service` pueda publicar mensajes al broker.

---

## Paso 2 · Agregar la misma dependencia en `notification-service`

Ahora repetí la integración en:

- `notification-service`

Este servicio va a necesitarla para consumir mensajes desde RabbitMQ.

Con esto, ambos extremos del flujo asincrónico quedan preparados.

---

## Paso 3 · Agregar configuración de RabbitMQ en `config-repo`

Como ambos servicios ya usan configuración centralizada, conviene agregar o completar las propiedades necesarias en:

- `order-service.yml`
- `notification-service.yml`

Una base conceptual razonable podría verse así:

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

O las credenciales equivalentes que hayas configurado al levantar RabbitMQ.

La idea es que ambos servicios apunten al mismo broker.

---

## Paso 4 · Definir una cola simple para el evento

Para esta primera versión del flujo, conviene empezar con algo muy claro y sencillo.

Por ejemplo, una cola llamada:

```txt
order-created.queue
```

No hace falta meter exchanges sofisticados ni topologías complejas todavía.

Para esta etapa del curso, lo más valioso es dejar visible el concepto de:

- publicación
- y consumo

sobre un caso real del negocio.

---

## Paso 5 · Crear una configuración compartida o explícita de mensajería

Podés definir la cola desde `order-service`, desde `notification-service` o en una configuración común si querés ser más prolijo.

Para el curso práctico, una opción simple es crear una clase de configuración equivalente en ambos lados o en el productor si querés que deje declarada la infraestructura mínima.

Por ejemplo, algo conceptualmente parecido a:

```java
package com.novamarket.order.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String ORDER_CREATED_QUEUE = "order-created.queue";

    @Bean
    public Queue orderCreatedQueue() {
        return new Queue(ORDER_CREATED_QUEUE, true);
    }
}
```

Este mismo nombre después debería ser reutilizado por el consumidor.

---

## Paso 6 · Crear el evento `OrderCreatedEvent`

Ahora conviene modelar explícitamente el evento del negocio.

Por ejemplo, en `order-service` podés crear:

```txt
src/main/java/com/novamarket/order/dto/OrderCreatedEvent.java
```

Una versión simple y razonable podría ser:

```java
package com.novamarket.order.dto;

public class OrderCreatedEvent {

    private Long orderId;
    private String status;

    public OrderCreatedEvent() {
    }

    public OrderCreatedEvent(Long orderId, String status) {
        this.orderId = orderId;
        this.status = status;
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
}
```

Para esta primera iteración no hace falta que el evento sea enorme.  
Alcanza con algo simple y claro.

---

## Paso 7 · Publicar el evento desde `order-service`

Ahora vamos a usar `RabbitTemplate` o el mecanismo equivalente de tu integración para publicar el mensaje cuando la orden se crea correctamente.

Una forma razonable de integrarlo en `OrderService` podría ser esta:

```java
package com.novamarket.order.service;

import com.novamarket.order.config.RabbitConfig;
import com.novamarket.order.dto.CreateOrderItemRequest;
import com.novamarket.order.dto.CreateOrderRequest;
import com.novamarket.order.dto.InventoryItemResponse;
import com.novamarket.order.dto.OrderCreatedEvent;
import com.novamarket.order.model.Order;
import com.novamarket.order.model.OrderItem;
import com.novamarket.order.repository.OrderRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final InventoryFeignClient inventoryFeignClient;
    private final OrderRepository orderRepository;
    private final RabbitTemplate rabbitTemplate;

    public OrderService(
            InventoryFeignClient inventoryFeignClient,
            OrderRepository orderRepository,
            RabbitTemplate rabbitTemplate
    ) {
        this.inventoryFeignClient = inventoryFeignClient;
        this.orderRepository = orderRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    public Order createOrder(CreateOrderRequest request) {
        List<OrderItem> items = request.getItems().stream()
                .map(this::toOrderItem)
                .toList();

        for (OrderItem item : items) {
            InventoryItemResponse inventory = getInventory(item.getProductId());

            if (inventory == null || inventory.getAvailableQuantity() == null) {
                throw new InventoryUnavailableException("No se pudo obtener inventario para el producto " + item.getProductId());
            }

            if (inventory.getAvailableQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Stock insuficiente para el producto " + item.getProductId());
            }
        }

        Order order = new Order("CREATED", items);
        Order savedOrder = orderRepository.save(order);

        OrderCreatedEvent event = new OrderCreatedEvent(savedOrder.getId(), savedOrder.getStatus());
        rabbitTemplate.convertAndSend(RabbitConfig.ORDER_CREATED_QUEUE, event);

        return savedOrder;
    }

    // resto del servicio...
}
```

---

## Qué valor tiene esta publicación

Esto es muy importante porque `order-service` ya no solo persiste la orden.

Ahora además emite un hecho del negocio:

**“se creó una orden”**

Y ese hecho puede ser consumido por otro servicio sin meter esa lógica dentro del request principal.

Ese es el corazón arquitectónico del módulo.

---

## Paso 8 · Crear el consumidor en `notification-service`

Ahora vamos al otro extremo del flujo.

Dentro de `notification-service`, creá algo como:

```txt
src/main/java/com/novamarket/notification/listener/OrderCreatedListener.java
```

Una versión simple y razonable podría ser:

```java
package com.novamarket.notification.listener;

import com.novamarket.notification.dto.OrderCreatedEvent;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OrderCreatedListener {

    @RabbitListener(queues = "order-created.queue")
    public void handleOrderCreated(OrderCreatedEvent event) {
        System.out.println("Evento recibido en notification-service: orderId=" 
                + event.getOrderId() + ", status=" + event.getStatus());
    }
}
```

También vas a necesitar la clase `OrderCreatedEvent` del lado del consumidor o una estructura equivalente para deserializar correctamente el mensaje.

---

## Paso 9 · Asegurar formato de serialización razonable

Para que productor y consumidor se entiendan bien, conviene dejar clara una estrategia de serialización.

En esta etapa del curso, una opción razonable es trabajar con JSON mediante el soporte habitual de Spring AMQP.

Lo importante es que el mensaje publicado por `order-service` llegue de forma legible y coherente a `notification-service`.

---

## Paso 10 · Levantar el entorno completo

Ahora conviene tener arriba:

- RabbitMQ
- `config-server`
- `discovery-server`
- Keycloak
- `inventory-service`
- `order-service`
- `notification-service`
- `api-gateway`

La idea es probar el flujo real completo, no solo publicar o consumir de forma aislada.

---

## Paso 11 · Crear una orden autenticada

Ahora ejecutá una orden válida entrando por el gateway:

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

La expectativa es doble:

- la orden debe crearse correctamente,
- y además debe publicarse el evento asincrónico.

---

## Paso 12 · Mirar logs de `notification-service`

Ahora revisá la consola de `notification-service`.

Si todo salió bien, deberías ver algo como:

- recepción del evento
- impresión del `orderId`
- y del estado

Esto confirma que el sistema ya logró su primer flujo asincrónico real.

---

## Paso 13 · Revisar también RabbitMQ si querés enriquecer la verificación

Podés abrir la consola de RabbitMQ y revisar visualmente la cola, el tráfico o los mensajes según cómo estés trabajando.

No es obligatorio para validar la clase, pero sí suma bastante para conectar visualmente el comportamiento del broker con el recorrido del sistema.

---

## Qué estamos logrando con esta clase

Esta clase cambia bastante la arquitectura de NovaMarket.

Antes, la creación de una orden terminaba dentro de `order-service`.

Ahora, además de completar el flujo síncrono principal, el sistema también emite un evento que otro servicio procesa por separado.

Eso es exactamente el tipo de desacoplamiento que hace valiosa a la mensajería asincrónica.

---

## Qué todavía no hicimos

Todavía no:

- modelamos exchanges y bindings más ricos,
- agregamos retries del consumidor,
- persistimos notificaciones,
- ni manejamos fallas más avanzadas del broker.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**lograr el primer flujo asincrónico real del proyecto.**

---

## Errores comunes en esta etapa

### 1. No levantar RabbitMQ antes de los servicios
Entonces productor o consumidor fallan al iniciar o al usar el broker.

### 2. Usar nombres distintos de cola entre productor y consumidor
Conviene centralizar ese nombre o repetirlo con muchísimo cuidado.

### 3. No revisar serialización
El productor y el consumidor tienen que entender el mismo formato.

### 4. Probar solo publicación o solo consumo
El valor fuerte de la clase está en cerrar el circuito completo.

### 5. No mirar `notification-service`
Ahí es donde más claramente se ve el resultado del flujo asincrónico.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería poder:

- crear una orden,
- publicar un evento `order.created`,
- y consumir ese evento en `notification-service`.

Eso representa el primer uso real de RabbitMQ dentro del proyecto.

---

## Punto de control

Antes de seguir, verificá que:

- `order-service` publica el evento,
- existe una cola clara para `order.created`,
- `notification-service` escucha esa cola,
- la orden se crea correctamente,
- y el consumidor recibe el mensaje.

Si eso está bien, entonces el bloque inicial de mensajería ya quedó bien abierto.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a consolidar este flujo asincrónico y mejorar el modelado del evento y del consumidor.

Eso nos va a permitir seguir madurando la parte de mensajería dentro de NovaMarket.

---

## Cierre

En esta clase construimos el primer flujo asincrónico real de NovaMarket.

Con eso, la arquitectura deja de depender únicamente de integración síncrona y empieza a reaccionar a eventos del negocio de una manera más desacoplada y más cercana a una solución de microservicios real.
