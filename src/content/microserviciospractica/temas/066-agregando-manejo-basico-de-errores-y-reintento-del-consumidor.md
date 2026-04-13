---
title: "Agregando manejo básico de errores y reintento del consumidor"
description: "Primer endurecimiento del lado consumidor en NovaMarket. Mejora del tratamiento de errores en notification-service y preparación del camino hacia una DLQ."
order: 66
module: "Módulo 10 · Mensajería asincrónica con RabbitMQ"
level: "intermedio"
draft: false
---

# Agregando manejo básico de errores y reintento del consumidor

En la clase anterior provocamos fallas intencionales en `notification-service` y vimos algo muy importante:

**aunque el request principal termine bien, el circuito asincrónico puede romperse después.**

Eso deja una conclusión bastante clara:

- no alcanza con publicar eventos,
- no alcanza con tener un consumidor,
- también hay que decidir qué hacer cuando el consumidor falla.

En esta clase vamos a dar el primer paso real para mejorar ese comportamiento:

**agregar un manejo básico de errores y preparar una estrategia de reintento del lado consumidor.**

Todavía no vamos a entrar de lleno en DLQ.  
Primero conviene ordenar el tratamiento del error y separar mejor fallas transitorias de fallas más serias.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mejorado el manejo del error dentro del consumidor,
- más clara la diferencia entre fallo técnico y procesamiento exitoso,
- y preparada la base para que el siguiente paso del módulo sea una dead-letter queue.

No buscamos todavía una solución definitiva.  
Queremos hacer que el consumidor falle mejor y más controladamente.

---

## Estado de partida

Partimos de este contexto:

- `order-service` ya publica `order.created`,
- `notification-service` ya consume el evento,
- ya vimos que el listener puede fallar,
- y el sistema todavía necesita una política más clara sobre qué hacer con esos fallos.

Actualmente, el comportamiento puede sentirse demasiado crudo o poco controlado.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar el listener,
- mover mejor la lógica de procesamiento a una capa de servicio,
- distinguir errores esperables de errores técnicos,
- y preparar el flujo para manejar reintentos de forma más explícita más adelante.

---

## Qué problema queremos resolver

Cuando el consumidor falla, dos cosas suelen mezclarse demasiado:

### 1. La lógica de consumo
Escuchar el mensaje y deserializarlo.

### 2. La lógica de negocio
Persistir la notificación o aplicar alguna regla.

Esa mezcla vuelve más difícil razonar sobre el error.

Por eso, una de las metas de esta clase es separar mejor responsabilidades y hacer más legible qué parte del proceso está fallando.

---

## Paso 1 · Limpiar el listener

Conviene que el listener haga lo mínimo razonable:

- recibir el mensaje,
- delegar el procesamiento,
- y dejar que el servicio de aplicación decida cómo reaccionar.

Por ejemplo, una versión mejor orientada podría verse así:

```java
package com.novamarket.notification.listener;

import com.novamarket.notification.dto.OrderCreatedEvent;
import com.novamarket.notification.service.NotificationProcessingService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OrderCreatedListener {

    private final NotificationProcessingService processingService;

    public OrderCreatedListener(NotificationProcessingService processingService) {
        this.processingService = processingService;
    }

    @RabbitListener(queues = "notification.order-created.queue")
    public void handleOrderCreated(OrderCreatedEvent event) {
        processingService.processOrderCreated(event);
    }
}
```

Esto ya deja mucho más claro que el listener no debería convertirse en un mini-servicio lleno de reglas adentro.

---

## Paso 2 · Crear un servicio de procesamiento específico

Ahora vamos a mover la lógica a un servicio dedicado. Por ejemplo:

```txt
src/main/java/com/novamarket/notification/service/NotificationProcessingService.java
```

Una versión razonable podría ser:

```java
package com.novamarket.notification.service;

import com.novamarket.notification.dto.OrderCreatedEvent;
import org.springframework.stereotype.Service;

@Service
public class NotificationProcessingService {

    private final NotificationService notificationService;

    public NotificationProcessingService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public void processOrderCreated(OrderCreatedEvent event) {
        notificationService.saveOrderCreated(event);
    }
}
```

Aunque parezca un pequeño wrapper, tiene bastante valor porque separa:

- consumo de mensajería
- de procesamiento del evento

Y eso vuelve mucho más fácil evolucionar el flujo.

---

## Paso 3 · Crear una excepción específica para errores de procesamiento

Ahora conviene dejar de depender solo de excepciones genéricas.

Por ejemplo, podés crear algo como:

```txt
src/main/java/com/novamarket/notification/service/NotificationProcessingException.java
```

Una versión simple podría ser:

```java
package com.novamarket.notification.service;

public class NotificationProcessingException extends RuntimeException {

    public NotificationProcessingException(String message) {
        super(message);
    }

    public NotificationProcessingException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

Esto ayuda mucho a que el módulo empiece a tener un vocabulario propio para sus fallas, en lugar de mezclar todo en `RuntimeException`.

---

## Paso 4 · Traducir errores técnicos dentro del procesamiento

Ahora podés hacer que el servicio de procesamiento capture problemas técnicos y los traduzca mejor.

Por ejemplo:

```java
package com.novamarket.notification.service;

import com.novamarket.notification.dto.OrderCreatedEvent;
import org.springframework.stereotype.Service;

@Service
public class NotificationProcessingService {

    private final NotificationService notificationService;

    public NotificationProcessingService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public void processOrderCreated(OrderCreatedEvent event) {
        try {
            notificationService.saveOrderCreated(event);
        } catch (Exception ex) {
            throw new NotificationProcessingException(
                    "No se pudo procesar la notificación para orderId=" + event.getOrderId(),
                    ex
            );
        }
    }
}
```

Esto tiene mucho valor porque hace más clara la semántica del fallo.

---

## Paso 5 · Reintroducir una falla controlada para pruebas

Ahora conviene mantener o reintroducir una falla controlada en el procesamiento, pero de forma más ordenada.

Por ejemplo, dentro de `NotificationProcessingService` podrías dejar algo como:

```java
if (event.getItemsCount() != null && event.getItemsCount() > 1) {
    throw new NotificationProcessingException(
            "Falla intencional de prueba para orderId=" + event.getOrderId()
    );
}
```

La ventaja de hacerlo acá y no directamente en el listener es que ya estamos probando el circuito sobre una estructura más limpia.

---

## Paso 6 · Pensar el reintento de forma conceptual

En esta clase todavía no hace falta meterse de lleno en una configuración avanzada de retry del consumidor.

Pero sí conviene introducir claramente la idea:

- no todas las fallas deberían enviarse inmediatamente a descarte,
- a veces conviene reintentar,
- y para eso necesitamos tener el procesamiento mejor encapsulado y los errores mejor definidos.

Es decir:  
esta clase prepara la arquitectura del consumidor para una política de reintento más seria.

---

## Paso 7 · Reiniciar `notification-service`

Después de estos cambios, reiniciá `notification-service`.

Asegurate también de tener arriba:

- RabbitMQ
- `config-server`
- `discovery-server`
- Keycloak
- `inventory-service`
- `order-service`
- `api-gateway`

Queremos volver a probar el circuito real.

---

## Paso 8 · Probar un caso feliz

Primero generá una orden válida con un solo ítem:

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

La notificación debería seguir consumiéndose y persistiéndose normalmente.

Esto confirma que el refactor del consumidor no rompió el caso feliz.

---

## Paso 9 · Probar el caso fallido otra vez

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

La expectativa es que el fallo siga ocurriendo, pero ahora dentro de una estructura bastante más ordenada y entendible.

---

## Paso 10 · Revisar logs del consumidor

Mirá la consola de `notification-service`.

Lo ideal ahora es que el error tenga una forma más clara:

- qué se estaba procesando,
- qué orderId estaba involucrado,
- y qué parte del flujo falló.

Esto mejora bastante la base para el siguiente paso del módulo.

---

## Qué estamos logrando con esta clase

Esta clase no resuelve todavía toda la robustez del consumidor, pero sí hace algo muy importante:

**ordena el terreno donde esa robustez va a vivir.**

Ahora el consumidor ya no es solo un listener que puede explotar.  
Empieza a tener:

- separación de responsabilidades,
- excepciones más semánticas,
- y un punto claro donde pensar reintento o descarte.

Eso es muy valioso.

---

## Qué todavía no hicimos

Todavía no:

- definimos una DLQ,
- configuramos una política explícita de redelivery más avanzada,
- ni cerramos el circuito de mensajes fallidos.

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**que el consumidor falle de una forma más ordenada y preparada para el siguiente paso.**

---

## Errores comunes en esta etapa

### 1. Dejar toda la lógica dentro del listener
Eso vuelve muy difícil evolucionar el tratamiento del error.

### 2. Seguir usando solo `RuntimeException` genéricas
Conviene empezar a nombrar mejor los fallos.

### 3. Querer resolver DLQ antes de ordenar el procesamiento
Esta clase justamente prepara la base.

### 4. Romper el caso feliz al refactorizar
Siempre hay que volver a probarlo.

### 5. Mirar solo RabbitMQ y no el código del consumidor
En esta clase el foco está mucho en ordenar el lado aplicación.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `notification-service` debería tener un flujo de consumo mejor estructurado, con una separación más clara entre escucha, procesamiento y error.

Eso deja el módulo listo para introducir una estrategia concreta de mensajes fallidos.

---

## Punto de control

Antes de seguir, verificá que:

- el listener quedó más limpio,
- existe una capa de procesamiento,
- el error fallido está mejor semantizado,
- el caso feliz sigue funcionando,
- y el caso fallido sigue siendo reproducible.

Si eso está bien, ya podemos cerrar este tramo agregando una dead-letter queue.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a introducir una **DLQ** para el evento `order.created`.

Ese será el paso que le dé al módulo una estrategia más seria para manejar mensajes que no pudieron procesarse correctamente.

---

## Cierre

En esta clase mejoramos el manejo básico de errores del consumidor y dejamos el terreno listo para robustecer de verdad la mensajería.

Con eso, NovaMarket ya no solo tiene un flujo asincrónico funcional: también empieza a prepararse para soportar fallas del lado consumidor con mucho más criterio.
