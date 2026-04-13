---
title: "Introducción a RabbitMQ"
description: "Fundamentos de RabbitMQ, conceptos de broker, exchanges, colas y routing keys, y cómo incorporarlo a NovaMarket para comunicación asincrónica entre microservicios."
order: 31
module: "Módulo 8 · Comunicación asincrónica"
level: "base"
draft: false
---

# Introducción a RabbitMQ

En la clase anterior vimos por qué una arquitectura de microservicios no debería apoyarse únicamente en comunicación sincrónica.

Cuando todo depende de requests directas entre servicios, el sistema gana claridad en algunos flujos, pero también acumula acoplamiento temporal y sensibilidad a fallos. Por eso, para ciertos procesos conviene usar mensajería asincrónica.

En NovaMarket, ese es el paso que vamos a dar ahora.

Una vez que `order-service` crea una orden, hay tareas que no deberían bloquear la respuesta principal. Un ejemplo claro es la generación de notificaciones. Ahí es donde nos conviene publicar un mensaje y permitir que otro servicio lo procese de forma desacoplada.

Para eso vamos a usar **RabbitMQ**.

---

## Qué es RabbitMQ

RabbitMQ es un **message broker**.

Eso significa que actúa como intermediario entre componentes que producen mensajes y componentes que los consumen.

En lugar de que un servicio invoque directamente a otro mediante HTTP, puede publicar un mensaje en el broker. Luego, uno o más consumidores leerán ese mensaje y lo procesarán según corresponda.

RabbitMQ no representa solamente una “cola”. En realidad ofrece una infraestructura de enrutamiento de mensajes bastante flexible.

---

## Qué problema resuelve dentro de NovaMarket

Pensemos en el flujo de creación de orden.

Si `order-service` tuviera que llamar sincrónicamente a `notification-service` después de registrar la orden, aparecerían varios problemas:

- el usuario quedaría esperando más tiempo,
- `notification-service` tendría que estar disponible en ese mismo momento,
- una falla en notificaciones podría contaminar el flujo principal,
- el acoplamiento entre ambos servicios aumentaría.

Con RabbitMQ, `order-service` puede hacer esto:

1. crear la orden,
2. publicar un evento como `OrderCreatedEvent`,
3. devolver respuesta al cliente,
4. dejar que `notification-service` consuma el mensaje más tarde.

Ese desacoplamiento es uno de los grandes motivos por los que los brokers son tan usados en arquitectura distribuida.

---

## Componentes conceptuales principales

Para empezar a usar RabbitMQ, hay algunos conceptos que conviene tener muy claros.

### Producer
Es el componente que publica mensajes.

En NovaMarket, inicialmente el productor va a ser `order-service`.

---

### Consumer
Es el componente que recibe y procesa mensajes.

En NovaMarket, inicialmente el consumidor va a ser `notification-service`.

---

### Queue
Es la cola donde los mensajes quedan almacenados hasta ser consumidos.

Si un consumidor todavía no procesó un mensaje, la cola lo mantiene disponible según la configuración del sistema.

---

### Exchange
Es el punto al que el productor envía el mensaje.

El exchange no procesa lógica de negocio, pero decide cómo enrutar el mensaje hacia una o varias colas según sus reglas.

Esto es importante: en RabbitMQ los productores normalmente publican al **exchange**, no directamente a la cola.

---

### Routing key
Es una clave de enrutamiento asociada al mensaje.

El exchange la usa para determinar a qué cola o colas debe enviarlo, según el tipo de exchange y las bindings configuradas.

---

### Binding
Es la relación entre un exchange y una cola.

Define bajo qué condiciones los mensajes que llegan al exchange terminan en una cola determinada.

---

## Una forma simple de imaginarlo

Podés pensar RabbitMQ así:

- el productor entrega un sobre al correo,
- el correo es el broker,
- el exchange decide a qué buzón o buzones corresponde,
- la cola es el buzón donde queda esperando,
- el consumidor retira el mensaje y lo procesa.

La idea central es que el productor y el consumidor no necesitan hablarse directamente.

---

## Tipos de exchange más conocidos

RabbitMQ soporta varios tipos de exchange. Para el curso no necesitamos memorizar todos desde el primer minuto, pero sí entender los más importantes.

### Direct exchange
Enruta mensajes según coincidencia exacta de routing key.

Es una muy buena opción para comenzar porque resulta fácil de visualizar.

---

### Topic exchange
Permite enrutar usando patrones.

Es útil cuando querés agrupar mensajes por categorías más flexibles.

Ejemplos conceptuales:

- `order.created`
- `order.rejected`
- `inventory.updated`

---

### Fanout exchange
Envía el mensaje a todas las colas vinculadas, sin prestar atención a la routing key.

Sirve cuando querés difundir el mismo evento a varios consumidores.

---

### Headers exchange
Enruta según headers del mensaje.

Es menos común para empezar y no lo vamos a tomar como eje inicial del curso.

---

## Qué enfoque vamos a usar primero en NovaMarket

Para mantener el aprendizaje ordenado, vamos a empezar con un escenario simple y claro.

### Primer caso de uso asincrónico

Cuando una orden se crea correctamente:

- `order-service` publica `OrderCreatedEvent`
- RabbitMQ recibe el mensaje
- `notification-service` lo consume
- `notification-service` genera una notificación de ejemplo

### Diseño inicial sugerido

- un exchange para eventos de órdenes,
- una cola de notificaciones,
- una routing key para órdenes creadas.

Por ejemplo, conceptualmente:

- exchange: `orders.exchange`
- queue: `notifications.order-created.queue`
- routing key: `order.created`

No son los únicos nombres posibles, pero sí una convención clara y didáctica.

---

## Qué gana el sistema con este cambio

Al incorporar RabbitMQ, NovaMarket gana varias cosas.

### 1. Desacoplamiento
`order-service` ya no necesita conocer detalles internos de `notification-service`.

### 2. Menor impacto en la request principal
La creación de la orden puede responder más rápido.

### 3. Mejor tolerancia a picos
Si muchas órdenes se crean al mismo tiempo, los mensajes pueden quedar en cola para ser procesados.

### 4. Base para futuros consumidores
Más adelante el mismo evento podría ser consumido por otros servicios:

- auditoría,
- analytics,
- facturación,
- integración externa.

---

## Qué no resuelve automáticamente RabbitMQ

Aunque es muy útil, RabbitMQ no elimina la complejidad.

Con mensajería empiezan a importar temas nuevos:

- mensajes duplicados,
- reentregas,
- orden de procesamiento,
- errores de deserialización,
- consumidores lentos,
- colas saturadas,
- necesidad de idempotencia,
- monitoreo del broker.

Eso significa que usar un broker no es simplemente “mandar mensajes”. También exige diseñar mejor cómo se publican y consumen.

---

## Mensaje vs. evento

En la práctica, muchas veces se usan estas palabras de forma cercana, pero conviene marcar una diferencia conceptual.

### Mensaje
Es la unidad técnica que circula por el broker.

### Evento
Es la representación de algo que ocurrió en el dominio.

En nuestro caso:

- técnicamente publicamos un mensaje,
- semánticamente representa un evento: `OrderCreatedEvent`.

Esta diferencia ayuda a pensar mejor el diseño.

---

## Qué debería contener nuestro primer evento

Como punto de partida, `OrderCreatedEvent` podría incluir:

- `orderId`
- `userId`
- `createdAt`
- `items`
- `totalAmount`

La idea no es meter todo el universo de la orden, sino la información necesaria para que otros servicios reaccionen al evento sin depender de una llamada inmediata extra.

---

## Cómo entra RabbitMQ en la arquitectura general

Hasta ahora la arquitectura de NovaMarket tenía como actores principales:

- `api-gateway`
- `order-service`
- `inventory-service`
- `catalog-service`
- `config-server`
- `discovery-server`
- `notification-service`
- Keycloak

Ahora sumamos una nueva pieza de infraestructura:

- **RabbitMQ**

RabbitMQ no reemplaza al gateway, ni a Eureka, ni a la comunicación REST. Se incorpora como mecanismo adicional para procesos asincrónicos.

Ese punto es importante porque en sistemas reales no suele haber una sola forma de comunicación para todo.

---

## Cuándo conviene usar RabbitMQ en este proyecto

Dentro del curso, RabbitMQ va a tener sentido sobre todo para:

- notificaciones,
- auditoría,
- integraciones desacopladas,
- tareas posteriores a la creación de una orden,
- procesamiento que puede tolerar cierto retraso.

No lo vamos a usar para cada interacción del sistema. Por ejemplo, seguir consultando stock con mensajería para el flujo principal de creación de orden complicaría innecesariamente una validación que necesita respuesta inmediata.

---

## Qué necesitamos para empezar a usarlo con Spring Boot

En la próxima clase vamos a dar el paso práctico:

- agregar dependencia de Spring AMQP,
- definir colas, exchange y bindings,
- publicar mensajes desde `order-service`,
- consumir mensajes desde `notification-service`.

Ahí vamos a pasar de la idea general a la integración real con el proyecto.

---

## Cierre

RabbitMQ es un broker de mensajes que nos permite introducir comunicación asincrónica dentro de una arquitectura distribuida.

En NovaMarket lo vamos a usar para desacoplar tareas posteriores a la creación de una orden, empezando por el flujo de notificación. Su valor principal está en reducir el acoplamiento temporal, permitir procesamiento en segundo plano y preparar el sistema para crecer con más flexibilidad.

Pero, como toda pieza importante de infraestructura, no resuelve problemas mágicamente. También introduce nuevos desafíos que iremos trabajando a medida que avancemos.

En la próxima clase vamos a integrarlo con Spring Boot y a publicar nuestro primer evento del dominio.
