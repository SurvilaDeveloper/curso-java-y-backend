---
title: "Integración de RabbitMQ con Spring Boot"
description: "Cómo integrar RabbitMQ con Spring Boot para publicar y consumir mensajes, definiendo exchange, colas y bindings dentro del flujo de órdenes de NovaMarket."
order: 32
module: "Módulo 8 · Comunicación asincrónica"
level: "intermedio"
draft: false
---

# Integración de RabbitMQ con Spring Boot

En la clase anterior introdujimos RabbitMQ como broker de mensajes y definimos el motivo por el que entra en la arquitectura de NovaMarket.

Ahora vamos a dar el paso práctico: integrar RabbitMQ con Spring Boot para que un microservicio publique mensajes y otro los consuma.

Nuestro objetivo inicial va a ser claro y acotado:

- `order-service` publica un `OrderCreatedEvent`,
- RabbitMQ lo enruta,
- `notification-service` lo consume,
- el procesamiento posterior queda desacoplado de la request principal.

Esta primera integración no busca resolver todavía todos los escenarios avanzados. Busca dejarnos una base sólida para entender el modelo y después evolucionarlo con reintentos, dead letters e idempotencia.

---

## Dónde encaja esta integración en el flujo del sistema

Recordemos el flujo principal actualizado de NovaMarket:

1. el usuario autenticado envía una solicitud para crear una orden,
2. `order-service` valida stock de forma sincrónica con `inventory-service`,
3. si hay disponibilidad, registra la orden,
4. publica un evento asincrónico,
5. `notification-service` consume el evento y genera una notificación.

La parte nueva de esta clase está entre los pasos 4 y 5.

---

## Dependencia principal en Spring Boot

Para integrar RabbitMQ con Spring Boot, el punto de entrada habitual es el starter de AMQP.

Dependencia Maven más común:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

Este starter aporta soporte para conexión con RabbitMQ, plantillas de publicación, listeners y configuración base.

---

## Configuración mínima de conexión

Cada servicio que use RabbitMQ necesita conocer, como mínimo:

- host,
- puerto,
- usuario,
- contraseña.

En el contexto del curso, conviene externalizar esto mediante Spring Cloud Config para que la configuración de broker no quede hardcodeada dentro de cada aplicación.

Ejemplo conceptual de propiedades:

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

Más adelante, cuando dockericemos el sistema, estos valores podrán apuntar al servicio de RabbitMQ dentro de Docker Compose.

---

## Componentes que vamos a definir

Para el primer flujo asincrónico de NovaMarket vamos a trabajar con estos elementos:

- un **exchange** para eventos de órdenes,
- una **cola** para notificaciones asociadas a órdenes creadas,
- un **binding** entre ambos,
- una **routing key** que represente el tipo de evento.

### Convención didáctica sugerida

- exchange: `orders.exchange`
- queue: `notifications.order-created.queue`
- routing key: `order.created`

Lo importante no es memorizar estos nombres, sino mantener una convención clara y consistente.

---

## Configuración de exchange, queue y binding

Una forma común en Spring Boot es declararlos como beans de configuración.

Ejemplo conceptual:

```java
@Configuration
public class RabbitConfig {

    public static final String ORDERS_EXCHANGE = "orders.exchange";
    public static final String ORDER_CREATED_QUEUE = "notifications.order-created.queue";
    public static final String ORDER_CREATED_ROUTING_KEY = "order.created";

    @Bean
    public DirectExchange ordersExchange() {
        return new DirectExchange(ORDERS_EXCHANGE);
    }

    @Bean
    public Queue orderCreatedQueue() {
        return new Queue(ORDER_CREATED_QUEUE);
    }

    @Bean
    public Binding orderCreatedBinding() {
        return BindingBuilder
            .bind(orderCreatedQueue())
            .to(ordersExchange())
            .with(ORDER_CREATED_ROUTING_KEY);
    }
}
```

Este ejemplo usa un **DirectExchange**, que es una excelente elección para empezar porque el enrutamiento por routing key exacta resulta fácil de seguir mentalmente.

---

## Publicación desde `order-service`

Una vez creada la orden, `order-service` debe publicar un evento.

Spring suele usar `RabbitTemplate` para este tipo de publicación.

Ejemplo conceptual:

```java
@Service
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public OrderEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishOrderCreated(OrderCreatedEvent event) {
        rabbitTemplate.convertAndSend(
            "orders.exchange",
            "order.created",
            event
        );
    }
}
```

Este servicio encapsula la publicación y evita mezclar detalles de infraestructura en cualquier clase del dominio.

---

## En qué momento conviene publicar el evento

Este punto es importante desde el diseño.

No conviene publicar el evento antes de que la orden haya quedado efectivamente registrada.

La secuencia correcta, en esta etapa del curso, sería:

1. validar stock,
2. persistir la orden,
3. recién después publicar el evento.

Eso no resuelve todavía todos los desafíos de consistencia distribuida, pero sí evita un error conceptual básico: publicar un evento sobre una orden que todavía no existe de verdad en la base.

Más adelante, cuando entremos en outbox pattern, vamos a profundizar justamente este problema.

---

## Diseño del evento `OrderCreatedEvent`

Para nuestro caso inicial, el evento podría modelarse así:

```java
public class OrderCreatedEvent {
    private Long orderId;
    private String userId;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private List<OrderItemPayload> items;
}
```

No hace falta que el evento replique exactamente toda la entidad `Order`. Conviene incluir solo la información necesaria para consumidores posteriores.

Eso reduce acoplamiento y hace más claro el contrato del evento.

---

## Consumo desde `notification-service`

Del lado consumidor, Spring Boot permite escuchar una cola con `@RabbitListener`.

Ejemplo conceptual:

```java
@Service
public class OrderCreatedListener {

    @RabbitListener(queues = "notifications.order-created.queue")
    public void handleOrderCreated(OrderCreatedEvent event) {
        System.out.println("Orden recibida: " + event.getOrderId());
        // lógica de notificación
    }
}
```

En un primer momento, la “notificación” puede ser tan simple como:

- loguear el evento,
- persistir un registro,
- simular el envío de un email.

La idea es centrarse primero en la integración técnica.

---

## Qué pasa con la serialización del mensaje

Cuando enviamos objetos a RabbitMQ, es importante definir cómo se serializan y deserializan.

Una opción muy común es usar JSON.

Conceptualmente, eso permite que:

- el productor publique un objeto,
- el mensaje viaje como JSON,
- el consumidor lo reconstruya como un tipo Java.

En entornos reales conviene cuidar mucho:

- compatibilidad de contratos,
- evolución de eventos,
- versionado,
- campos opcionales.

Para el curso vamos a comenzar con una estructura simple y estable.

---

## Qué conviene separar en el código

Aunque técnicamente podríamos meter todo junto, conviene separar responsabilidades.

### En `order-service`

- lógica de negocio de creación de orden,
- componente publicador de eventos,
- configuración AMQP,
- modelo del evento.

### En `notification-service`

- configuración AMQP,
- listener,
- lógica de notificación,
- eventualmente persistencia de notificaciones.

Esta separación mejora legibilidad y prepara el sistema para crecer.

---

## Un flujo completo de punta a punta

Veamos el recorrido conceptual completo.

### Paso 1
El usuario autenticado llama a:

- `POST /api/orders`

### Paso 2
El gateway enruta hacia `order-service`.

### Paso 3
`order-service` valida stock con `inventory-service`.

### Paso 4
Si la validación es correcta, persiste la orden.

### Paso 5
`order-service` publica `OrderCreatedEvent` en:

- exchange: `orders.exchange`
- routing key: `order.created`

### Paso 6
RabbitMQ enruta el mensaje hacia:

- `notifications.order-created.queue`

### Paso 7
`notification-service` consume el mensaje y genera la notificación.

Todo esto sucede sin que la request del usuario tenga que esperar el último paso.

---

## Qué ventajas visibles obtenemos ya mismo

Incluso con esta primera integración básica, el sistema gana varias cosas.

### 1. Menor acoplamiento entre servicios
`order-service` no necesita llamar directamente a `notification-service`.

### 2. Menor trabajo dentro del request principal
La respuesta al usuario puede salir antes.

### 3. Base para crecimiento
Más adelante otro servicio podría escuchar el mismo evento.

### 4. Mejor separación entre operación crítica y tareas secundarias
La creación de la orden sigue siendo el flujo central. La notificación pasa a ser un proceso desacoplado.

---

## Qué limitaciones tiene todavía esta primera versión

Esta implementación inicial es útil, pero todavía no cubre temas más avanzados.

Por ejemplo:

- qué pasa si el consumidor falla,
- qué hacer con reintentos,
- cómo manejar mensajes duplicados,
- cómo evitar efectos secundarios repetidos,
- cómo almacenar eventos de forma más confiable,
- cómo enrutar mensajes fallidos a una dead letter queue.

Todo eso vendrá en las próximas clases.

---

## Buenas prácticas iniciales

Desde esta primera integración conviene incorporar algunos criterios sanos.

### Usar nombres explícitos
Evita nombres ambiguos en exchanges, colas y routing keys.

### No publicar entidades JPA directamente
Conviene usar DTOs o payloads específicos para eventos.

### No mezclar lógica de negocio con infraestructura
Publicar mensajes debe estar encapsulado.

### Diseñar eventos con intención
Un evento debería expresar algo que ocurrió en el dominio, no ser solo un volcado accidental de datos.

---

## Cómo se conecta esto con las próximas clases

En la siguiente parte del módulo vamos a trabajar problemas más realistas de mensajería:

- reintentos,
- duplicados,
- idempotencia,
- dead letter queues,
- consumidores robustos.

O sea: esta clase deja andando el mecanismo base, y las siguientes lo endurecen para escenarios menos ideales.

---

## Cierre

Integrar RabbitMQ con Spring Boot nos permite llevar la comunicación asincrónica de la teoría a la práctica.

En NovaMarket esto se traduce en un cambio importante: `order-service` deja de depender directamente de `notification-service` para completar la experiencia del usuario, y pasa a publicar un evento que el resto del sistema puede consumir de forma desacoplada.

Con esto ya tenemos una primera arquitectura híbrida funcionando:

- REST para validaciones y consultas inmediatas,
- RabbitMQ para procesos posteriores y desacoplados.

En las próximas clases vamos a fortalecer esta integración para que resista mejor fallos y reprocesamientos.
