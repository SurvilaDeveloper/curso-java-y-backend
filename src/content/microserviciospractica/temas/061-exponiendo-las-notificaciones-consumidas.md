---
title: "Exponiendo las notificaciones consumidas"
description: "Cierre del primer tramo de mensajería en NovaMarket. Implementación de endpoints en notification-service para consultar las notificaciones generadas a partir de eventos order.created."
order: 61
module: "Módulo 10 · Mensajería asincrónica con RabbitMQ"
level: "intermedio"
draft: false
---

# Exponiendo las notificaciones consumidas

En la clase anterior dimos un paso muy importante en la evolución de `notification-service`:

- el servicio ya consume eventos,
- y además ya los persiste.

Eso significa que el resultado del flujo asincrónico ya no se pierde en consola ni queda escondido solo en logs o en la base.

Ahora toca el siguiente paso lógico:

**hacer visible ese resultado desde una API.**

La idea es simple y muy valiosa:

- crear una orden en NovaMarket,
- dejar que el evento se procese asincrónicamente,
- y después poder consultar desde afuera qué notificación quedó registrada.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- expuesta una API básica de `notification-service`,
- disponible un endpoint para listar notificaciones,
- y visible desde afuera el resultado del flujo asincrónico del sistema.

Esto cierra bastante bien el primer tramo del módulo de mensajería.

---

## Estado de partida

Partimos de este contexto:

- RabbitMQ ya está arriba,
- `order-service` ya publica `order.created`,
- `notification-service` ya consume el evento,
- y además ya persiste `NotificationRecord`.

Lo que todavía falta es una forma limpia de consultar esa información desde fuera del servicio.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear un servicio de lectura sobre notificaciones,
- exponer un controller,
- agregar un endpoint de listado,
- y validar el flujo completo:
  - crear orden,
  - consumir evento,
  - persistir notificación,
  - consultar notificación vía HTTP.

---

## Qué problema queremos resolver

Hasta ahora, aunque `notification-service` ya guarda lo que consume, todavía cuesta responder desde afuera preguntas como:

- ¿qué notificaciones se generaron?
- ¿qué eventos ya fueron procesados?
- ¿qué evidencia visible tengo de que el flujo asincrónico realmente ocurrió?

El objetivo de esta clase es que esa información pase a ser accesible mediante una API concreta.

---

## Paso 1 · Crear un servicio de lectura

Aunque podríamos usar el repositorio directamente desde el controller, conviene mantener el mismo criterio de capas que ya venimos usando.

Por eso, una opción razonable es crear o ampliar `NotificationService` para incluir una operación de lectura.

Por ejemplo:

```java
package com.novamarket.notification.service;

import com.novamarket.notification.dto.OrderCreatedEvent;
import com.novamarket.notification.model.NotificationRecord;
import com.novamarket.notification.repository.NotificationRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRecordRepository repository;

    public NotificationService(NotificationRecordRepository repository) {
        this.repository = repository;
    }

    public NotificationRecord saveOrderCreated(OrderCreatedEvent event) {
        NotificationRecord record = new NotificationRecord(
                event.getOrderId(),
                "order.created",
                event.getStatus(),
                event.getItemsCount(),
                event.getCreatedAt()
        );

        return repository.save(record);
    }

    public List<NotificationRecord> findAll() {
        return repository.findAll();
    }
}
```

---

## Paso 2 · Pensar si conviene devolver directamente la entidad

Para esta etapa del curso, devolver directamente `NotificationRecord` puede ser aceptable si querés mantener la implementación simple.

Pero si preferís mantener una frontera HTTP más prolija, también podrías crear un DTO de salida.

Como ya venimos trabajando bastante con DTOs en otras partes del curso, una opción razonable es hacerlo también acá.

---

## Paso 3 · Crear un DTO de respuesta opcional

Si querés mantener la API más prolija, podés crear algo como:

```txt
src/main/java/com/novamarket/notification/dto/NotificationResponse.java
```

Una versión simple podría ser:

```java
package com.novamarket.notification.dto;

import java.time.Instant;

public class NotificationResponse {

    private Long id;
    private Long orderId;
    private String eventType;
    private String status;
    private Integer itemsCount;
    private Instant createdAt;

    public NotificationResponse() {
    }

    public NotificationResponse(Long id, Long orderId, String eventType, String status, Integer itemsCount, Instant createdAt) {
        this.id = id;
        this.orderId = orderId;
        this.eventType = eventType;
        this.status = status;
        this.itemsCount = itemsCount;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public String getEventType() {
        return eventType;
    }

    public String getStatus() {
        return status;
    }

    public Integer getItemsCount() {
        return itemsCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
```

---

## Paso 4 · Crear el controller

Ahora vamos a exponer la API.

Creá algo como:

```txt
src/main/java/com/novamarket/notification/controller/NotificationController.java
```

Una versión razonable podría ser:

```java
package com.novamarket.notification.controller;

import com.novamarket.notification.dto.NotificationResponse;
import com.novamarket.notification.model.NotificationRecord;
import com.novamarket.notification.service.NotificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> findAll() {
        return notificationService.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private NotificationResponse toResponse(NotificationRecord record) {
        return new NotificationResponse(
                record.getId(),
                record.getOrderId(),
                record.getEventType(),
                record.getStatus(),
                record.getItemsCount(),
                record.getCreatedAt()
        );
    }
}
```

Con esto, `notification-service` ya empieza a comportarse también como una API de consulta y no solo como un consumidor silencioso.

---

## Paso 5 · Revisar si querés enrutar el servicio por el gateway

En esta etapa del curso, podés probar `notification-service` directamente por su puerto para mantener la clase simple.

Pero también sería razonable empezar a pensar en agregar una ruta al gateway más adelante, por ejemplo si querés que quede integrado al acceso unificado del sistema.

Para esta clase, cualquiera de las dos estrategias es válida, siempre que el objetivo quede claro:  
hacer visible desde afuera el resultado del flujo asincrónico.

---

## Paso 6 · Reiniciar `notification-service`

Después de agregar el controller y la lectura, reiniciá `notification-service`.

Asegurate también de tener arriba:

- RabbitMQ
- `config-server`
- `discovery-server`
- Keycloak
- `inventory-service`
- `order-service`
- `api-gateway`

La idea es probar el circuito completo.

---

## Paso 7 · Crear una orden autenticada

Ahora generá nuevamente una orden válida:

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

La orden debería crearse como siempre.

Pero ahora, además, ya sabés que:

- se publica el evento,
- `notification-service` lo consume,
- lo persiste,
- y además lo expone por API.

---

## Paso 8 · Consultar las notificaciones

Ahora probá:

```bash
curl http://localhost:8085/notifications
```

La respuesta esperada debería incluir al menos una notificación asociada a la orden que acabás de crear.

Eso cierra el circuito de una forma muy clara.

---

## Paso 9 · Repetir la prueba con varias órdenes

Para enriquecer la clase, conviene crear dos o tres órdenes válidas y volver a consultar.

La idea es observar que el endpoint ya deja ver una colección creciente de notificaciones persistidas.

Eso ayuda mucho a reforzar la idea de que el servicio tiene estado propio y un historial de lo que consumió.

---

## Paso 10 · Relacionar el flujo síncrono con el asincrónico

Este es uno de los puntos más valiosos de la clase.

Ahora ya podés describir el recorrido así:

1. el cliente crea una orden
2. `order-service` la persiste
3. publica `order.created`
4. `notification-service` consume ese evento
5. lo guarda
6. y lo expone mediante `/notifications`

Ese recorrido muestra muy bien cómo una reacción secundaria puede vivir fuera del request principal y seguir siendo observable y útil.

---

## Qué estamos logrando con esta clase

Esta clase cierra muy bien el primer tramo de mensajería de NovaMarket.

Ya no tenemos solo:

- un broker arriba,
- y un consumidor escuchando.

Ahora tenemos un flujo completo donde:

- el negocio emite un evento,
- otro servicio reacciona,
- persiste esa reacción,
- y además la vuelve visible mediante una API.

Eso es un salto muy importante de madurez.

---

## Qué todavía no hicimos

Todavía no:

- agregamos filtros o búsqueda sobre notificaciones,
- manejamos duplicados o idempotencia,
- modelamos retries del consumidor,
- ni incorporamos DLQ.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**hacer visible y consultable el resultado del primer flujo asincrónico real.**

---

## Errores comunes en esta etapa

### 1. Exponer directamente el repositorio desde el controller
Conviene mantener una pequeña capa de servicio.

### 2. No probar el circuito completo antes de consultar
Primero hace falta crear una orden y disparar el evento.

### 3. Esperar datos en `/notifications` sin haber consumido nada
El endpoint no se pobla solo.

### 4. No reiniciar `notification-service` después de agregar el controller
Eso deja resultados confusos.

### 5. Olvidarse de que el flujo es asincrónico
A veces conviene esperar un instante breve entre crear la orden y consultar, según el entorno.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería poder:

- crear una orden,
- publicar y consumir el evento `order.created`,
- persistir la notificación,
- y consultar esa notificación por API.

Eso deja muy bien cerrado el primer circuito completo de mensajería del proyecto.

---

## Punto de control

Antes de seguir, verificá que:

- `notification-service` expone `/notifications`,
- crear una orden sigue funcionando,
- el evento sigue consumiéndose,
- la notificación se persiste,
- y `/notifications` devuelve el resultado esperado.

Si eso está bien, el bloque inicial de mensajería asincrónica ya quedó bastante sólido.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a profundizar el flujo asincrónico agregando una mejor topología de mensajería con exchange y routing key.

Eso nos va a permitir salir de la primera versión simple basada en una sola cola y empezar a modelar mejor el sistema de eventos.

---

## Cierre

En esta clase expusimos las notificaciones consumidas por `notification-service`.

Con eso, el primer flujo asincrónico real de NovaMarket ya no solo existe internamente: también puede observarse desde afuera como una parte visible y consultable del sistema.
