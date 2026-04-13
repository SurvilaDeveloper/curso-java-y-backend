---
title: "Modelando exchange, routing key y bindings"
description: "Evolución de la topología AMQP en NovaMarket. Reemplazo de la primera integración simple por una configuración más expresiva basada en exchange, routing key y bindings."
order: 62
module: "Módulo 10 · Mensajería asincrónica con RabbitMQ"
level: "intermedio"
draft: false
---

# Modelando exchange, routing key y bindings

En las clases anteriores logramos un primer circuito asincrónico real en NovaMarket:

- `order-service` publica un evento,
- `notification-service` lo consume,
- lo persiste,
- y además ya lo expone por API.

Eso ya tiene muchísimo valor.

Pero la topología de mensajería actual todavía está en una etapa muy básica:  
**una publicación directa a una sola cola.**

Eso alcanza para empezar, pero si queremos que el bloque de eventos del proyecto crezca con más orden, conviene dar un paso importante:

**pasar de una cola simple a una topología más expresiva basada en exchange, routing key y bindings.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- modelada una topología AMQP más clara,
- definido un exchange para eventos del dominio,
- definida una routing key para `order.created`,
- y vinculada la cola de notificaciones mediante un binding explícito.

Todavía no vamos a cambiar por completo todo el flujo de publicación y consumo.  
Primero queremos dejar la arquitectura de mensajería mejor modelada.

---

## Estado de partida

Partimos de este contexto:

- RabbitMQ ya está arriba,
- `order-service` ya publica un evento `order.created`,
- `notification-service` ya lo consume,
- y actualmente el envío se hace apuntando directamente a una cola simple.

Esto funciona, pero también deja algunas limitaciones:

- el productor conoce demasiado la cola final,
- cuesta crecer a múltiples consumidores o tipos de evento,
- y la semántica del sistema de eventos todavía está muy pegada a una primera versión de laboratorio.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar por qué conviene introducir un exchange,
- definir un nombre claro para el exchange de eventos,
- definir la routing key del evento `order.created`,
- crear el binding con la cola consumida por `notification-service`,
- y dejar la infraestructura lista para refactorizar el productor en la próxima clase.

---

## Qué problema queremos resolver

Hoy el flujo es algo conceptualmente parecido a:

- `order-service` conoce una cola
- y publica directamente ahí

Eso tiene dos problemas importantes:

### 1. Acopla demasiado al productor con el destino final
El productor sabe más de la topología de consumo de lo que conviene.

### 2. Escala peor si el sistema crece
Si mañana querés que más de un consumidor reaccione a `order.created`, o querés introducir otros eventos, la estructura directa por cola se vuelve incómoda.

La idea de esta clase es dejar una base más propia de una arquitectura basada en eventos.

---

## Recordatorio rápido: qué rol cumple cada pieza

### Exchange
Es el punto al que el productor publica el mensaje.

### Routing key
Es una clave que ayuda a decidir cómo enrutar el mensaje.

### Queue
Es donde termina almacenado el mensaje para ser consumido.

### Binding
Es la relación entre exchange y queue, indicando con qué criterio llegan mensajes a esa cola.

No hace falta memorizar teoría abstracta.  
Lo importante es entender cómo eso mejora el diseño actual de NovaMarket.

---

## Paso 1 · Elegir un exchange del dominio

Para esta etapa del curso práctico, conviene usar un nombre claro y reutilizable.

Una opción razonable puede ser:

```txt
novamarket.events
```

Este nombre deja bastante explícito que estamos hablando de un exchange de eventos del sistema, no de una cola específica de un servicio puntual.

---

## Paso 2 · Elegir una routing key clara

Ahora pensemos el evento puntual que ya venimos trabajando:

```txt
order.created
```

Ese nombre es muy razonable porque:

- expresa un hecho del dominio,
- es claro,
- y deja abierta la puerta a otros eventos futuros, como:
  - `order.cancelled`
  - `inventory.updated`
  - `notification.sent`

En otras palabras, ya empieza a ordenar el vocabulario de eventos del sistema.

---

## Paso 3 · Mantener una cola clara para notificaciones

Del lado del consumidor, podemos seguir usando una cola específica para notificaciones. Por ejemplo:

```txt
notification.order-created.queue
```

Esto mejora bastante respecto de `order-created.queue`, porque deja más explícito el propósito de esa cola:

- pertenece al contexto de notificaciones,
- y está interesada en el evento `order.created`.

Ese nivel de expresividad ayuda mucho cuando el sistema empieza a crecer.

---

## Paso 4 · Centralizar nombres AMQP

Ahora conviene formalizar esta convención de nombres en una clase de constantes o equivalente.

Por ejemplo, una clase conceptual podría verse así:

```java
package com.novamarket.order.config;

public final class AmqpConstants {

    public static final String EVENTS_EXCHANGE = "novamarket.events";
    public static final String ORDER_CREATED_ROUTING_KEY = "order.created";
    public static final String NOTIFICATION_ORDER_CREATED_QUEUE = "notification.order-created.queue";

    private AmqpConstants() {
    }
}
```

No hace falta que esté exactamente en ese paquete si luego decidís moverla o duplicar una versión equivalente del lado consumidor.  
Lo importante es que el modelo deje de depender de strings mágicos dispersos.

---

## Paso 5 · Definir la infraestructura AMQP explícitamente

Ahora ya no queremos solo declarar una cola.  
Queremos declarar:

- el exchange,
- la cola,
- y el binding.

Una configuración razonable del lado productor o en una configuración compartida conceptualmente podría verse así:

```java
package com.novamarket.order.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

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
}
```

---

## Por qué usar `TopicExchange` acá

Para esta etapa del curso práctico, `TopicExchange` es una elección bastante razonable porque:

- nos permite usar routing keys expresivas,
- deja abierta la puerta a patrones más ricos si el sistema crece,
- y enseña una topología más cercana a escenarios reales.

No es obligatorio usarlo en todos los proyectos, pero para NovaMarket en esta fase del curso tiene bastante sentido.

---

## Paso 6 · Entender cómo queda el flujo después de esta mejora

Con esta topología, el recorrido conceptual ya no es:

- productor -> cola específica

Ahora pasa a ser algo más interesante:

- productor publica en `novamarket.events`
- usando `order.created`
- y RabbitMQ enruta el mensaje hacia `notification.order-created.queue`
- porque existe un binding que lo indica

Ese pequeño cambio mejora mucho la arquitectura.

---

## Paso 7 · Revisar la consola de RabbitMQ

Si querés enriquecer esta clase, este es un buen momento para abrir la consola de RabbitMQ y empezar a reconocer visualmente:

- el exchange
- la cola
- y el binding

Aunque todavía no cambiamos toda la publicación del productor, ya deberías poder empezar a ver una topología más clara dentro del broker.

---

## Paso 8 · Pensar qué ganamos arquitectónicamente

Este paso es muy importante.

Con esta mejora, el productor deja de estar tan pegado a una cola específica.

Eso significa que mañana podrías agregar, por ejemplo:

- otra cola interesada también en `order.created`
- otro consumidor distinto
- o nuevas routing keys dentro del mismo exchange

sin tener que rehacer el modelo desde cero.

Ese es exactamente el tipo de flexibilidad que queremos introducir en el módulo.

---

## Qué estamos logrando con esta clase

Esta clase no cambia todavía el flujo funcional visible del sistema, pero mejora mucho la forma en que está modelado.

Antes teníamos un flujo asincrónico que funcionaba.  
Ahora empezamos a tener un flujo asincrónico **mejor diseñado**.

Y eso es muy importante porque los sistemas de eventos crecen rápido; conviene ordenar bien la base desde temprano.

---

## Qué todavía no hicimos

Todavía no:

- cambiamos la publicación para que vaya al exchange,
- ajustamos completamente el consumidor a la nueva topología,
- ni revalidamos el circuito completo sobre esta nueva estructura.

Todo eso viene en las próximas dos clases.

La meta de hoy es más concreta:

**dejar bien modelada la topología AMQP.**

---

## Errores comunes en esta etapa

### 1. Seguir pensando solo en colas y olvidarse del exchange
Eso deja el diseño demasiado acoplado.

### 2. Elegir nombres poco expresivos
Conviene que exchange, queue y routing key digan claramente qué representan.

### 3. Meter demasiada complejidad de entrada
Para esta etapa, una sola routing key bien elegida alcanza.

### 4. No centralizar las constantes
Después aparecen strings mágicos difíciles de mantener.

### 5. Pensar que esta clase ya cambia el recorrido completo
Todavía no; hoy estamos preparando la infraestructura.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería tener una topología AMQP mejor definida, con:

- exchange,
- routing key,
- cola específica,
- y binding explícito.

Eso deja mucho mejor preparada la mensajería del sistema para seguir creciendo.

---

## Punto de control

Antes de seguir, verificá que:

- existe un exchange claro para eventos,
- existe una routing key `order.created`,
- existe una cola específica para notificaciones,
- el binding quedó bien definido,
- y la topología AMQP ya es más expresiva que la versión inicial.

Si eso está bien, ya podemos pasar a refactorizar el productor y el consumidor para usar esta nueva estructura.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a publicar y consumir usando el exchange y la routing key nuevos.

Ese será el paso donde la topología mejorada deje de ser solo diseño y pase a ser el flujo real del sistema.

---

## Cierre

En esta clase mejoramos el modelado AMQP de NovaMarket.

Con eso, la arquitectura asincrónica da un paso importante: deja atrás la primera versión basada en una cola directa y empieza a apoyarse en una topología mucho más clara, expresiva y preparada para crecer.
