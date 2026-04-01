---
title: "Mensajería y eventos: introducción a colas y procesamiento asíncrono"
description: "Qué es la mensajería, cómo funcionan las colas y por qué el procesamiento asíncrono puede mejorar desacople, resiliencia y escalabilidad en backend."
order: 57
module: "Arquitectura y escalabilidad"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya recorriste una parte muy amplia del backend con Java y Spring Boot:

- controllers
- services
- DTOs
- validaciones
- seguridad
- persistencia
- testing
- Docker
- observabilidad
- cache
- CI/CD
- arquitectura hexagonal

Eso ya te permite construir sistemas bastante sólidos.

Pero muchos sistemas reales no resuelven todo dentro del esquema clásico:

- request HTTP
- procesamiento inmediato
- response inmediata

A medida que la complejidad crece, aparece otra necesidad muy importante:

**hacer ciertas tareas de forma asíncrona, desacoplada o diferida**

Ahí entran la mensajería, las colas y los eventos.

## La idea general

Supongamos que un usuario crea una orden.

En un sistema simple, podrías hacer todo dentro de la misma request:

- guardar la orden
- actualizar stock
- enviar email
- registrar auditoría
- notificar otro sistema
- actualizar métricas de negocio
- generar factura

Eso puede funcionar al principio.

Pero si todo eso ocurre síncronamente dentro de la misma request, aparecen varios problemas:

- más latencia
- más acoplamiento
- más puntos de falla
- más dificultad para escalar

La mensajería ayuda a separar mejor estas responsabilidades.

## Qué es mensajería

Mensajería significa que distintas partes del sistema se comunican enviando mensajes en lugar de depender siempre de llamadas directas y síncronas.

Dicho simple:

- una parte produce un mensaje
- otra parte lo consume
- no necesariamente tienen que ejecutarse al mismo tiempo ni estar acopladas directamente

## Qué es procesamiento asíncrono

Procesamiento asíncrono significa que una tarea no se resuelve necesariamente dentro del mismo flujo inmediato de la request.

Por ejemplo:

- el cliente hace una request
- el sistema responde rápido
- una tarea adicional queda encolada
- otro componente la procesa después

## Qué problema resuelve esto

Ayuda a resolver cosas como:

- tareas lentas dentro de requests
- integraciones frágiles
- picos de carga
- exceso de acoplamiento entre módulos
- necesidad de reintentos
- trabajo que puede diferirse sin bloquear al usuario

## Sincrónico vs asíncrono

Conviene distinguirlos muy bien.

## Procesamiento sincrónico

La operación ocurre dentro del flujo principal y el resultado suele esperarse en ese mismo momento.

Ejemplo:

- guardar un producto
- devolver respuesta cuando terminó

## Procesamiento asíncrono

La operación puede dispararse ahora pero resolverse más tarde o en otro componente.

Ejemplo:

- registrar orden ahora
- enviar email después por cola

## Diferencia mental útil

Podés pensarlo así:

- sincrónico = “hacelo ya y esperá resultado”
- asíncrono = “dejá esto en marcha y seguí”

## Qué es una cola

Una cola es una estructura donde se colocan mensajes o tareas para ser procesados posteriormente por consumidores.

En términos simples:

- alguien produce mensajes
- la cola los almacena temporalmente
- otro proceso o componente los consume

## Qué es un productor

El productor es quien envía el mensaje.

Por ejemplo:

- un módulo de órdenes
- un controller
- un caso de uso
- un servicio que publica un evento

## Qué es un consumidor

El consumidor es quien recibe y procesa el mensaje.

Por ejemplo:

- un worker de emails
- un servicio que actualiza stock
- un módulo de auditoría
- una integración con otro sistema

## Qué es un mensaje

Un mensaje es la unidad de información que viaja por el sistema.

Por ejemplo, un mensaje podría decir:

- “se creó una orden”
- “hay que enviar email de bienvenida”
- “procesar factura”
- “sincronizar stock con otro sistema”

## Ejemplo mental simple

Un usuario confirma una compra.

En vez de hacer todo dentro de la request, podrías:

1. guardar la orden
2. responder al cliente
3. publicar un mensaje `OrderCreated`
4. otro consumidor procesa envío de email
5. otro consumidor actualiza proyecciones de ventas
6. otro consumidor integra con logística

## Qué gana el sistema con esto

- respuesta más rápida al usuario
- menos acoplamiento entre módulos
- posibilidad de reintentar tareas
- mejor escalabilidad
- arquitectura más flexible

## Qué es un evento

Un evento representa algo que ocurrió en el sistema.

Por ejemplo:

- `UserRegistered`
- `OrderCreated`
- `PaymentApproved`
- `ProductDeleted`

Los eventos ayudan a modelar el sistema desde hechos relevantes del dominio o del flujo técnico.

## Evento no es lo mismo que comando

Esto conviene distinguirlo.

### Comando

Suele expresar intención de hacer algo.

Ejemplo:
`SendWelcomeEmail`

### Evento

Suele expresar algo que ya ocurrió.

Ejemplo:
`UserRegistered`

## Por qué importa esta diferencia

Porque cambia la semántica del mensaje.

- comando = “hacé esto”
- evento = “esto pasó”

En muchos sistemas, ambos conceptos conviven.

## Qué tipos de tareas suelen ir bien a procesamiento asíncrono

Suelen ir bien tareas como:

- envío de emails
- generación de notificaciones
- auditoría
- integración con otros sistemas
- actualización de proyecciones o estadísticas
- procesamiento de archivos
- trabajos pesados no críticos para la respuesta inmediata

## Qué tareas quizá no conviene mandar a cola primero

No todo debe ser asíncrono.

Por ejemplo, suele ser importante mantener síncrono lo que define la consistencia inmediata del caso principal.

Si crear una orden requiere sí o sí guardar la orden correctamente, eso no debería diferirse alegremente.

## Ejemplo de separación sana

Podrías hacer así:

### Sincrónico

- validar orden
- guardar orden
- devolver éxito si se guardó bien

### Asíncrono

- enviar email de confirmación
- publicar evento de auditoría
- recalcular reportes
- notificar a otro servicio

## Qué es un broker

Un broker de mensajería es el sistema que recibe, almacena y distribuye mensajes entre productores y consumidores.

Ejemplos conocidos en el ecosistema general son:

- RabbitMQ
- Kafka
- ActiveMQ
- otros

No hace falta profundizar todos ahora.
Lo importante es entender el rol conceptual.

## Cola vs pub/sub

A nivel introductorio, también conviene conocer esta diferencia.

### Cola

Un mensaje suele ser consumido por un consumidor o worker que procesa esa tarea.

### Pub/Sub

Un evento puede ser publicado y recibido por varios suscriptores distintos.

Esto cambia mucho el modelo de comunicación.

## Ejemplo de pub/sub

Se publica:

```text
OrderCreated
```

Y podrían reaccionar varios consumidores:

- email
- auditoría
- analytics
- logística

Eso es muy potente.

## Ventajas de la mensajería

## 1. Desacople

El productor no necesita conocer todos los detalles internos del consumidor.

## 2. Menor latencia en requests

Algunas tareas pueden hacerse después.

## 3. Escalabilidad

Podés escalar consumidores por separado.

## 4. Reintentos

Si un consumidor falla, el sistema puede reintentar según diseño.

## 5. Mejor separación de responsabilidades

Cada consumidor puede encargarse de una tarea concreta.

## Costos o complejidades

También tiene costo.

No es magia.

Agregar mensajería introduce temas como:

- más infraestructura
- trazabilidad más compleja
- fallos distribuidos
- reintentos
- duplicados
- orden de procesamiento
- idempotencia

Por eso conviene incorporarla con criterio.

## Qué es idempotencia

Idempotencia significa que procesar dos veces el mismo mensaje no debería romper el sistema ni duplicar efectos no deseados.

Esto es extremadamente importante en mensajería.

## Ejemplo de problema

Supongamos que un consumidor procesa dos veces el mensaje:

```text
SendWelcomeEmail(userId=15)
```

Si el sistema no está bien diseñado, podría enviar dos emails idénticos.

O peor aún:

- duplicar una factura
- duplicar una orden
- descontar stock dos veces

Por eso la idempotencia es una idea central.

## Reintentos

Una gran ventaja de sistemas de mensajería es que ciertos fallos temporales pueden reintentarse.

Ejemplo:

- el proveedor de email está caído
- el mensaje no se pierde
- se reintenta más tarde

Eso vuelve al sistema más resiliente.

## Qué significa resiliencia acá

Que el sistema soporta mejor ciertos fallos parciales sin colapsar completamente el flujo principal.

## Ejemplo mental realista

El usuario crea una orden.

La orden se guarda bien, pero el servicio de email está momentáneamente caído.

Sin mensajería, podrías:

- romper toda la request
- o perder el email

Con mensajería y reintentos, podrías:

- guardar la orden
- publicar evento
- reintentar email luego

Eso suele ser mucho más sano.

## Orden de mensajes

Otro tema importante es si el orden importa.

En algunos casos no importa demasiado.

En otros sí.

Por ejemplo, si llegan eventos de estado de una orden fuera de orden, el resultado puede ser incorrecto.

Esto muestra que la mensajería exige diseño cuidadoso.

## Relación con arquitectura hexagonal

Esto conecta muy bien con la lección anterior.

La mensajería puede verse muy naturalmente como:

- puertos de salida para publicar eventos
- adaptadores para broker real
- adaptadores de entrada para consumidores

Eso encaja muy bien con puertos y adaptadores.

## Ejemplo conceptual de puerto de publicación

```java
public interface OrderEventPublisherPort {
    void publishOrderCreated(OrderCreatedEvent event);
}
```

## Caso de uso

```java
public class CreateOrderService implements CreateOrderUseCase {

    private final SaveOrderPort saveOrderPort;
    private final OrderEventPublisherPort orderEventPublisherPort;

    public CreateOrderService(SaveOrderPort saveOrderPort,
                              OrderEventPublisherPort orderEventPublisherPort) {
        this.saveOrderPort = saveOrderPort;
        this.orderEventPublisherPort = orderEventPublisherPort;
    }

    @Override
    public OrderResult createOrder(CreateOrderCommand command) {
        Order saved = saveOrderPort.save(new Order(...));

        orderEventPublisherPort.publishOrderCreated(
                new OrderCreatedEvent(saved.getId(), saved.getUserId())
        );

        return new OrderResult(saved.getId());
    }
}
```

## Qué muestra esto

Que el caso de uso expresa la necesidad de publicar un evento sin depender directamente del broker concreto.

Eso es muy coherente con la arquitectura hexagonal.

## Adaptador concreto

Después podrías tener un adaptador real que publique en RabbitMQ, Kafka o lo que corresponda.

```java
@Component
public class OrderEventPublisherAdapter implements OrderEventPublisherPort {

    @Override
    public void publishOrderCreated(OrderCreatedEvent event) {
        // publicar en infraestructura real
    }
}
```

## Qué ventaja tiene esto

Que la lógica del negocio no queda pegada a la tecnología concreta de mensajería.

## Eventos de dominio vs eventos técnicos

También conviene distinguir esto.

### Evento de dominio

Expresa algo importante para el negocio.

Ejemplo:
`OrderCreated`

### Evento técnico

Expresa algo más operativo o de infraestructura.

Ejemplo:
`CacheInvalidationRequested`

Ambos existen, pero no cumplen exactamente el mismo rol.

## Qué aprender primero

Para esta etapa, lo más importante no es dominar ya un broker concreto.

Lo más valioso es entender bien:

- cuándo algo conviene ser asíncrono
- qué tarea debería seguir siendo sincrónica
- qué significa producir/consumir mensajes
- qué implica reintento
- qué implica idempotencia
- cómo cambia la arquitectura

## Spring Boot y mensajería

Spring Boot puede integrarse con varias tecnologías de mensajería.

No hace falta entrar en todas ahora.

Lo importante es entender que el ecosistema permite trabajar bastante bien con estos patrones.

## Ejemplo de caso de uso muy razonable

Un caso muy clásico es:

### Sincrónico

`POST /auth/register`

- validar
- guardar usuario

### Asíncrono

- enviar email de bienvenida
- registrar evento analytics
- auditar registro

Eso ya muestra muy bien el valor del enfoque.

## Qué no conviene hacer

No conviene mandar a cola cosas críticas sin pensar bien consistencia.

Tampoco conviene agregar mensajería solo porque “suena más avanzado”.

Tiene sentido cuando realmente aporta desacople, resiliencia o escalabilidad.

## Buenas prácticas iniciales

## 1. Empezar por casos simples y útiles

Por ejemplo, emails, auditoría o notificaciones.

## 2. No romper consistencia del flujo principal sin criterio

Lo esencial del caso de uso suele seguir siendo sincrónico.

## 3. Pensar en idempotencia desde el inicio

Es una de las ideas más importantes.

## 4. Diseñar mensajes claros

Que expresen bien intención o evento.

## 5. No mezclar arquitectura distribuida compleja si todavía no hay necesidad real

Primero entender bien el patrón.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a colas, workers y eventos en sistemas Node más avanzados. En Java y Spring Boot la idea general es la misma, pero suele integrarse muy bien con diseño por capas, puertos y adaptadores, y con un enfoque más explícito en contratos.

### Si venís de Python

Puede hacerte pensar en colas y tareas asíncronas con workers. En Java, el ecosistema también trabaja muy bien estos patrones, pero el gran valor aquí está en cómo se conectan con arquitectura, casos de uso y desacople del negocio.

## Errores comunes

### 1. Querer volver asíncrono todo

No todo lo necesita ni lo soporta bien.

### 2. Ignorar idempotencia

Eso puede generar duplicados peligrosos.

### 3. No distinguir evento de comando

La semántica importa mucho.

### 4. Meter un broker complejo sin necesidad clara

La infraestructura extra también cuesta.

### 5. Creer que la mensajería simplifica todo automáticamente

Puede mejorar muchas cosas, pero también agrega complejidad real.

## Mini ejercicio

Tomá un caso de uso de tu proyecto integrador y separá:

1. qué parte debería seguir siendo sincrónica
2. qué parte podría hacerse asíncrona
3. qué evento o mensaje publicarías
4. qué consumidor podría procesarlo
5. qué riesgo de duplicado o reintento deberías considerar

## Ejemplo posible

Caso:
crear orden

### Sincrónico
- validar stock
- guardar orden

### Asíncrono
- enviar email
- registrar auditoría
- actualizar analytics

### Evento
- `OrderCreated`

### Consumidores
- `SendOrderConfirmationConsumer`
- `OrderAuditConsumer`
- `OrderAnalyticsConsumer`

## Resumen

En esta lección viste que:

- la mensajería permite desacoplar partes del sistema mediante mensajes
- las colas ayudan a procesar trabajo de forma diferida o asíncrona
- los eventos representan cosas que ocurrieron en el sistema
- el procesamiento asíncrono puede mejorar latencia, resiliencia y escalabilidad
- la idempotencia y los reintentos son ideas centrales en este tipo de diseño
- este enfoque encaja muy bien con arquitectura hexagonal y con sistemas que empiezan a crecer

## Siguiente tema

La siguiente natural es **integraciones externas y clientes HTTP**, porque después de entender cómo un sistema puede desacoplarse internamente con eventos y colas, el siguiente paso muy valioso es ver cómo se comunica con servicios externos de forma robusta.
