---
title: "Persistiendo notificaciones consumidas"
description: "Evolución de notification-service en NovaMarket. Persistencia de eventos consumidos para que el servicio deje de ser solo un listener y pase a tener estado propio."
order: 60
module: "Módulo 10 · Mensajería asincrónica con RabbitMQ"
level: "intermedio"
draft: false
---

# Persistiendo notificaciones consumidas

En la clase anterior mejoramos bastante el primer flujo asincrónico de NovaMarket:

- el evento `order.created` quedó mejor modelado,
- la configuración AMQP quedó más clara,
- y el consumidor ya recibe un mensaje más rico y mejor estructurado.

Eso ya está muy bien.  
Pero todavía hay una limitación importante:

**`notification-service` consume el evento, pero no hace nada durable con él.**

Por ahora, el servicio es casi solo un listener que imprime información en consola.  
Eso sirve para demostrar el circuito, pero ya es momento de dar el siguiente paso:

**hacer que `notification-service` tenga estado propio.**

En esta clase vamos a persistir las notificaciones consumidas.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- un modelo persistente de notificación dentro de `notification-service`,
- guardado en base de datos cada evento consumido relevante,
- y convertido `notification-service` en un servicio real con estado, no solo en un consumidor efímero.

Todavía no vamos a exponer una API para consultar notificaciones.  
Primero queremos que el servicio persista lo que consume.

---

## Estado de partida

Partimos de este contexto:

- RabbitMQ ya está arriba,
- `order-service` ya publica `order.created`,
- `notification-service` ya consume el evento,
- y el flujo asincrónico base ya funciona.

Pero hoy el resultado del consumo se pierde si solo imprimimos en logs y no lo guardamos en ninguna parte.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear un modelo de notificación,
- agregar persistencia en `notification-service`,
- guardar cada evento consumido,
- y verificar que el servicio deja trazabilidad durable de lo que procesa.

---

## Qué problema queremos resolver

Si un consumidor solo imprime en logs, después cuesta mucho responder preguntas como:

- ¿qué notificaciones se generaron?
- ¿qué eventos fueron realmente procesados?
- ¿qué estado tiene hoy ese servicio?
- ¿qué historia guarda de su actividad?

En cambio, si el servicio persiste lo que consume, ya empieza a comportarse como una pieza de negocio real y no solo como una demostración técnica.

---

## Paso 1 · Agregar persistencia a `notification-service`

Dentro de `notification-service`, agregá las dependencias necesarias para trabajar con persistencia real.

Como base, necesitás:

- **Spring Data JPA**
- una base de trabajo, por ejemplo **H2**, si querés mantener coherencia con el resto del proyecto en esta etapa

La idea es repetir una lógica ya conocida del curso:  
que el servicio pueda tener su propia base de datos y no dependa únicamente de memoria o logs.

---

## Paso 2 · Configurar datasource y JPA en `config-repo`

Ahora agregá en:

```txt
novamarket/config-repo/notification-service.yml
```

una base razonable para persistencia.

Por ejemplo, conceptualmente:

```yaml
spring:
  application:
    name: notification-service
  datasource:
    url: jdbc:h2:mem:notificationdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

server:
  port: 8085

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka

management:
  endpoints:
    web:
      exposure:
        include: health,info
```

Esto deja a `notification-service` bastante alineado con la forma en que ya trabajan otros servicios persistentes del proyecto.

---

## Paso 3 · Crear el modelo `NotificationRecord`

Dentro de `notification-service`, creá una entidad que represente lo que el servicio guarda cuando consume un evento.

Por ejemplo:

```txt
src/main/java/com/novamarket/notification/model/NotificationRecord.java
```

Una versión razonable podría ser:

```java
package com.novamarket.notification.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notification_records")
public class NotificationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;
    private String eventType;
    private String status;
    private Integer itemsCount;
    private Instant createdAt;

    public NotificationRecord() {
    }

    public NotificationRecord(Long orderId, String eventType, String status, Integer itemsCount, Instant createdAt) {
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

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getItemsCount() {
        return itemsCount;
    }

    public void setItemsCount(Integer itemsCount) {
        this.itemsCount = itemsCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
```

---

## Paso 4 · Crear el repositorio

Ahora creá:

```txt
src/main/java/com/novamarket/notification/repository/NotificationRecordRepository.java
```

Una versión mínima razonable podría ser:

```java
package com.novamarket.notification.repository;

import com.novamarket.notification.model.NotificationRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRecordRepository extends JpaRepository<NotificationRecord, Long> {
}
```

---

## Paso 5 · Crear un servicio de persistencia de notificaciones

Conviene no meter toda la lógica de guardado directamente dentro del listener.

Por eso, una opción ordenada es crear un servicio específico. Por ejemplo:

```txt
src/main/java/com/novamarket/notification/service/NotificationService.java
```

Una versión razonable podría ser:

```java
package com.novamarket.notification.service;

import com.novamarket.notification.dto.OrderCreatedEvent;
import com.novamarket.notification.model.NotificationRecord;
import com.novamarket.notification.repository.NotificationRecordRepository;
import org.springframework.stereotype.Service;

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
}
```

---

## Paso 6 · Ajustar el listener para persistir

Ahora el listener ya no debería limitarse a imprimir por consola.

Podés ajustarlo a algo como esto:

```java
package com.novamarket.notification.listener;

import com.novamarket.notification.dto.OrderCreatedEvent;
import com.novamarket.notification.service.NotificationService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OrderCreatedListener {

    private final NotificationService notificationService;

    public OrderCreatedListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "order-created.queue")
    public void handleOrderCreated(OrderCreatedEvent event) {
        notificationService.saveOrderCreated(event);

        System.out.println("Notificación persistida para orderId=" + event.getOrderId());
    }
}
```

Con esto el servicio ya empieza a tener una responsabilidad mucho más concreta.

---

## Paso 7 · Reiniciar `notification-service`

Después de agregar persistencia, reiniciá `notification-service`.

Asegurate también de tener arriba:

- RabbitMQ
- `config-server`
- `discovery-server`
- Keycloak
- `inventory-service`
- `order-service`
- `api-gateway`

La idea es volver a probar el flujo asincrónico real.

---

## Paso 8 · Crear una orden autenticada

Ahora generá una orden válida:

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

La orden debería crearse como siempre, pero ahora además esperamos que el evento consumido quede guardado en la base de `notification-service`.

---

## Paso 9 · Verificar que la persistencia ocurrió

Podés validarlo de varias formas.

### Opción 1
Mirar los logs de `notification-service` y revisar inserts de JPA.

### Opción 2
Usar H2 Console si la habilitaste.

### Opción 3
Agregar temporalmente un `CommandLineRunner` o endpoint de prueba, aunque esto último conviene dejarlo para la próxima clase, donde justamente vamos a exponer una API de notificaciones.

Para esta etapa alcanza con comprobar por logs que el evento fue persistido.

---

## Qué estamos logrando con esta clase

Esta clase cambia bastante el rol de `notification-service`.

Antes era casi un servicio “reactivo de laboratorio”.  
Después de esta clase, ya empieza a convertirse en un servicio con:

- estado propio,
- persistencia,
- y responsabilidad concreta sobre eventos consumidos.

Eso es un gran paso de madurez.

---

## Qué todavía no hicimos

Todavía no:

- expusimos una API para consultar notificaciones,
- manejamos duplicados,
- implementamos reintentos del consumidor,
- ni modelamos estados más ricos de la notificación.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**que el servicio persista lo que consume.**

---

## Errores comunes en esta etapa

### 1. Dejar toda la lógica dentro del listener
Conviene separar escucha y persistencia.

### 2. No agregar configuración de base de datos
Entonces el servicio sigue consumiendo, pero no guarda nada.

### 3. No verificar que la entidad realmente se persiste
La impresión en consola sola ya no alcanza.

### 4. Olvidar reiniciar el servicio después de agregar JPA
Es una fuente muy común de confusión.

### 5. Persistir demasiado detalle innecesario del evento
Para esta etapa, menos es más.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `notification-service` debería:

- consumir `order.created`,
- persistir una representación de esa notificación,
- y dejar evidencia durable de que el evento fue procesado.

Eso lo convierte en un servicio mucho más real dentro de NovaMarket.

---

## Punto de control

Antes de seguir, verificá que:

- la entidad `NotificationRecord` existe,
- el listener ya no solo imprime,
- el evento se guarda en base,
- y el flujo asincrónico sigue funcionando.

Si eso está bien, ya podemos dar el siguiente paso lógico: exponer esas notificaciones como una API.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a exponer los endpoints de `notification-service` para listar las notificaciones consumidas.

Ese será un paso muy valioso porque va a volver visible desde afuera el resultado del flujo asincrónico del sistema.

---

## Cierre

En esta clase hicimos que `notification-service` deje de ser solo un consumidor que reacciona en memoria o en logs.

Con eso, NovaMarket gana una nueva pieza con estado propio y el flujo asincrónico empieza a dejar rastros reales y consultables dentro del sistema.
