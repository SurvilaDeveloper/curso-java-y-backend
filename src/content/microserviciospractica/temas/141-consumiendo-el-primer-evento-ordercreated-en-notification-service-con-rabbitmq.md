---
title: "Consumiendo el primer evento OrderCreated en notification-service con RabbitMQ"
description: "Siguiente paso práctico del módulo 13. Consumo del primer evento real del dominio en notification-service para cerrar un flujo asíncrono completo de punta a punta."
order: 141
module: "Módulo 13 · Comunicación asíncrona y eventos"
level: "intermedio"
draft: false
---

# Consumiendo el primer evento `OrderCreated` en `notification-service` con RabbitMQ

En la clase anterior dejamos algo bastante claro:

- RabbitMQ ya no es solo infraestructura viva,
- `order-service` ya puede publicar un evento real del dominio,
- y el siguiente paso lógico ya no es seguir hablando de productores en abstracto, sino hacer que otra pieza del sistema consuma ese evento y reaccione a él.

Ahora toca el paso concreto:

**consumir el primer evento `OrderCreated` en `notification-service` con RabbitMQ.**

Ese es el objetivo de esta clase.

Porque una cosa es tener:

- un broker corriendo,
- un evento publicado,
- y una intención de desacoplar.

Y otra bastante distinta es conseguir que:

- otra pieza escuche ese evento,
- lo procese,
- y cierre un flujo asíncrono real de punta a punta dentro del sistema.

Ese es exactamente el primer gran valor práctico que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la relación entre productor, cola y consumidor,
- visible una primera reacción real de `notification-service` a un evento del dominio,
- cerrado un primer flujo asíncrono completo dentro de NovaMarket,
- y el proyecto mejor preparado para seguir consolidando mensajería basada en eventos después.

La meta de hoy no es todavía diseñar un sistema completo de eventos de negocio.  
La meta es mucho más concreta: **hacer que un evento real publicado por `order-service` sea consumido y procesado por `notification-service`**.

---

## Estado de partida

Partimos de un sistema donde ya:

- RabbitMQ forma parte del entorno,
- existe un exchange y una convención básica para `OrderCreated`,
- `order-service` ya puede publicar ese evento,
- y el módulo ya dejó claro que ahora conviene cerrar el otro lado del flujo.

Eso significa que el problema ya no es cómo producir el mensaje.  
Ahora la pregunta útil es otra:

- **cómo hacemos que otra pieza del sistema reciba ese evento y reaccione de forma desacoplada**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- definir una cola razonable para notificaciones,
- enlazarla con el exchange y routing key correspondientes,
- hacer que `notification-service` escuche el mensaje,
- y dejar visible un primer consumo real del evento dentro del sistema.

---

## Paso 1 · Definir la cola de notificaciones

A esta altura del curso, una convención clara y didáctica puede ser algo como:

- queue: `notifications.order-created.queue`

No hace falta todavía una taxonomía gigantesca.

La idea central es más simple:

- que exista un destino concreto para este tipo de reacción desacoplada del sistema.

Ese criterio mejora muchísimo la claridad del bloque.

---

## Paso 2 · Enlazar cola, exchange y routing key

Ahora conviene dejar explícita la relación entre:

- exchange: `orders.exchange`
- routing key: `orders.created`
- queue: `notifications.order-created.queue`

Ese paso importa muchísimo porque hace visible algo muy central de la mensajería:

- el productor no tiene por qué conocer al consumidor final
- pero ambos quedan coordinados por la infraestructura y las reglas de enrutamiento

Ese matiz es uno de los corazones de toda la clase.

---

## Paso 3 · Preparar a `notification-service` como consumidor

Ahora conviene crear un consumidor sencillo y bien visible.

Conceptualmente, algo como:

```java
@RabbitListener(queues = "notifications.order-created.queue")
public void handleOrderCreated(OrderCreatedEvent event) {
    log.info("NotificationService recibió evento OrderCreated para orderId={}", event.orderId());
}
```

No hace falta todavía un procesamiento de negocio gigantesco.

La meta es mucho más concreta:

- cerrar de forma clara el primer consumo real del evento.

Ese paso ya tiene muchísimo valor.

---

## Paso 4 · Entender qué cambia realmente con este paso

Conviene leerlo con calma.

Antes:

- `order-service` publicaba un mensaje
- pero todavía no había una reacción real y visible al otro lado

Ahora, en cambio, además existe una pieza que:

- escucha,
- consume,
- y reacciona al hecho del dominio

Ese cambio parece chico, pero conceptualmente es enorme, porque es ahí donde la arquitectura basada en eventos deja de ser preparación y empieza a ser flujo real.

---

## Paso 5 · Probar el flujo completo

Ahora ejecutá nuevamente la creación de una orden o el flujo equivalente.

La idea es observar algo muy concreto:

- `order-service` publica
- RabbitMQ enruta
- `notification-service` consume

Ese recorrido es el corazón práctico de toda la clase.

---

## Paso 6 · Verificar en logs y/o panel del broker

Ahora conviene revisar:

- logs del productor,
- logs del consumidor,
- y si hace falta, el estado de la cola dentro de RabbitMQ

Lo importante es confirmar que el evento:

- existe,
- se enruta,
- y efectivamente termina provocando una reacción en otra pieza del sistema.

Ese momento vale muchísimo.

---

## Paso 7 · Pensar qué gana NovaMarket con este flujo

Este punto importa muchísimo.

Hasta ahora, si queríamos que `notification-service` reaccionara, la intuición natural podía ser una llamada síncrona directa.

Ahora, en cambio, el sistema gana otra forma de coordinación:

- `order-service` emite el hecho
- y `notification-service` reacciona después, desacoplado del request principal

Ese cambio reduce muchísimo el acoplamiento temporal entre ambas piezas.

---

## Paso 8 · Entender por qué este flujo ya cambia bastante la arquitectura

A esta altura del módulo, conviene hacer una lectura muy concreta:

aunque todavía sea un primer caso, ya hay algo importante que cambió:

- el sistema ya no coordina todo únicamente por cadenas síncronas
- ahora también puede reaccionar a hechos de negocio mediante mensajes

Ese salto es exactamente el corazón del bloque de eventos.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene toda su arquitectura basada en eventos resuelta”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene un primer flujo asíncrono real de punta a punta entre `order-service` y `notification-service`.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase consume el primer evento `OrderCreated` en `notification-service` con RabbitMQ.

Ya no estamos solo levantando infraestructura o publicando mensajes aislados.  
Ahora también estamos haciendo que una pieza del sistema reaccione de forma desacoplada a un hecho real del dominio.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos todavía este subbloque con un checkpoint fuerte,
- ni decidimos aún si conviene profundizar eventos, reintentos de mensajes o patrones más avanzados.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**cerrar el primer flujo asíncrono real de punta a punta dentro de NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que productor y consumidor tienen que conocerse directamente
La infraestructura justamente ayuda a desacoplarlos.

### 2. Saltar demasiado rápido a un procesamiento complejo en el consumidor
En esta etapa conviene un flujo claro y visible.

### 3. No verificar el enrutamiento entre exchange, routing key y queue
Ese es el corazón técnico del flujo.

### 4. Creer que consumir un mensaje ya implica arquitectura de eventos completa
Todavía estamos en el primer caso real.

### 5. No probar el recorrido completo de punta a punta
La verificación distribuida es parte central del valor de la clase.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- el evento `OrderCreated` ya se consume en `notification-service`,
- el flujo asíncrono ya funciona de punta a punta,
- y NovaMarket ya dio un primer paso serio hacia una arquitectura más desacoplada y basada en eventos.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- existe una cola real para este evento,
- `notification-service` ya consume el mensaje,
- entendés qué desacoplamiento nuevo gana el sistema con este paso,
- y sentís que NovaMarket ya dejó de tener solo infraestructura y publicación para empezar a sostener un flujo asíncrono completo.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta nueva capa del módulo 13.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar este primer flujo asíncrono real entre `order-service` y `notification-service` antes de decidir cómo seguir profundizando mensajería y eventos en NovaMarket.

---

## Cierre

En esta clase consumimos el primer evento `OrderCreated` en `notification-service` con RabbitMQ.

Con eso, el proyecto deja de usar RabbitMQ solo como infraestructura viva o como productor aislado y empieza a sostener un primer flujo real de eventos del dominio de punta a punta, mucho más desacoplado y mucho más alineado con una arquitectura moderna de microservicios.
