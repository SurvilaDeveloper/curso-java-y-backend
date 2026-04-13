---
title: "Trazas distribuidas con Micrometer Tracing"
description: "Introducción al tracing distribuido con Micrometer Tracing, spans, traces y contexto de observabilidad aplicado al flujo de NovaMarket entre gateway, order-service, inventory-service y notification-service."
order: 27
module: "Módulo 7 · Observabilidad moderna"
level: "base"
draft: false
---

# Trazas distribuidas con Micrometer Tracing

En una aplicación monolítica, seguir el recorrido de una operación suele ser relativamente sencillo. Una request entra al sistema, atraviesa varios componentes dentro del mismo proceso y, con algo de logging, normalmente se puede reconstruir qué pasó.

En una arquitectura de microservicios la situación cambia bastante.

Una sola operación de negocio puede pasar por varios procesos distintos, en distintas máquinas o contenedores, con tiempos de respuesta diferentes y fallas parciales en cualquier punto del recorrido.

En **NovaMarket**, una acción aparentemente simple como crear una orden puede implicar este recorrido:

1. la request entra por `api-gateway`,
2. el gateway la enruta a `order-service`,
3. `order-service` consulta a `inventory-service`,
4. luego registra la orden,
5. publica un evento,
6. y `notification-service` consume ese evento.

Si algo sale mal en ese flujo, los logs aislados de cada servicio muchas veces no alcanzan para entender el recorrido completo. Ahí es donde aparece el **tracing distribuido**.

---

## Qué es una traza distribuida

Una **traza distribuida** es una representación del recorrido completo de una operación a través de varios servicios.

En lugar de mirar cada servicio por separado, el tracing permite reconstruir una única historia técnica de la request, viendo:

- por dónde pasó,
- cuánto tardó cada tramo,
- qué operaciones fueron hijas de otras,
- dónde apareció una latencia inusual,
- y en qué punto ocurrió el error.

La idea principal no es solo “registrar más información”, sino **correlacionar correctamente el trabajo que hacen varios componentes distintos para una misma operación**.

---

## Qué problema resuelve

Sin tracing distribuido, pueden aparecer situaciones como estas:

- el gateway responde lento, pero no está claro si el problema fue suyo o de un servicio downstream,
- `order-service` devuelve error al crear una orden, pero no se sabe si falló la consulta a inventario o el guardado,
- `notification-service` procesa tarde un evento y no se entiende si hubo demora en RabbitMQ o en el consumidor,
- los logs existen, pero no hay una manera simple de agruparlos por request.

El tracing resuelve esto permitiendo seguir un identificador común a través de todo el recorrido.

---

## Conceptos fundamentales: trace y span

Para entender bien el tracing, hay dos conceptos que conviene fijar desde el principio.

### Trace

Una **trace** representa la operación completa.

Por ejemplo:
- “crear una orden”
- “consultar un producto”
- “procesar una notificación”

Toda esa operación, aunque pase por varios servicios, pertenece a una misma traza.

### Span

Un **span** representa una unidad de trabajo dentro de esa traza.

Por ejemplo, dentro de la traza “crear orden” podrían existir spans como:

- request recibida en el gateway,
- lógica de negocio en `order-service`,
- llamada HTTP a `inventory-service`,
- publicación del evento `OrderCreatedEvent`,
- consumo del evento en `notification-service`.

Dicho de otra manera:

- la **trace** es la historia completa,
- cada **span** es un capítulo dentro de esa historia.

---

## Cómo se relacionan los spans

Los spans no están sueltos. Normalmente forman una estructura jerárquica.

Por ejemplo, en NovaMarket podríamos imaginar algo así:

- span raíz: `POST /api/orders`
  - span hijo: lógica principal en `order-service`
    - span hijo: llamada a `inventory-service`
    - span hijo: persistencia de la orden
    - span hijo: publicación de evento en RabbitMQ
  - span hijo: procesamiento del evento en `notification-service`

Eso permite ver no solo cuánto tardó toda la operación, sino también **qué parte consumió más tiempo**.

---

## Qué es la propagación de contexto

El tracing distribuido funciona bien solo si el contexto de observabilidad viaja junto con la operación.

Cuando una request entra en un servicio, ese servicio necesita conservar información como:

- identificador de la traza,
- identificador del span actual,
- relación con spans padre e hijo.

Luego, cuando ese servicio llama a otro o publica un mensaje, debe **propagar ese contexto** para que la historia continúe en el siguiente componente.

A esto se lo conoce como **context propagation**.

Sin propagación de contexto, cada servicio podría crear spans aislados, pero no habría una traza coherente de punta a punta.

---

## Por qué Micrometer Tracing

En el ecosistema actual de Spring Boot, el tracing moderno se integra con la capa de observabilidad a través de **Micrometer Tracing**.

Esto es importante porque en el curso queremos mantener una línea moderna y coherente con la observabilidad actual:

- métricas con Micrometer,
- Actuator para exponer señales del sistema,
- tracing con Micrometer Tracing,
- backend de trazas para visualizar el recorrido.

En vez de estudiar tracing como una pieza aislada, conviene pensarlo como parte del conjunto **logs + métricas + trazas**.

---

## Qué aporta Micrometer Tracing en el proyecto

En NovaMarket, Micrometer Tracing nos permite:

- seguir una request desde el gateway hasta los servicios de negocio,
- detectar qué llamada downstream agrega más latencia,
- ver cómo se comporta la operación cuando hay fallas o retries,
- correlacionar logs con trazas,
- y entender mejor el efecto de circuit breakers, timeouts y mensajería.

Eso lo vuelve muy valioso no solo para debugging, sino también para operación real.

---

## Tracing y logs no son lo mismo

Es común mezclar estos conceptos al principio.

### Logging

El logging sirve para registrar eventos puntuales, mensajes técnicos, errores y estado interno.

Ejemplo:
- “Se recibió una solicitud para crear la orden 101”
- “La verificación de stock devolvió false”
- “Se publicó OrderCreatedEvent”

### Tracing

El tracing sirve para reconstruir el recorrido completo de una operación distribuida.

Ejemplo:
- cuándo entró la request,
- cuánto tardó el gateway,
- cuánto tardó la llamada a inventario,
- en qué tramo se produjo el error,
- qué spans formaron parte de la misma historia.

No compiten entre sí. Se complementan.

---

## Tracing y métricas tampoco son lo mismo

Las métricas muestran patrones agregados:

- cuántas requests hubo,
- cuánto tarda en promedio cierto endpoint,
- cuántos errores aparecen por minuto,
- cómo evoluciona la latencia con el tiempo.

En cambio, el tracing permite entrar al detalle de **una ejecución concreta**.

Una forma útil de verlo es esta:

- las **métricas** ayudan a detectar que hay un problema,
- las **trazas** ayudan a reconstruir dónde estuvo ese problema,
- los **logs** ayudan a entender con más contexto qué ocurrió dentro de cada servicio.

---

## Ejemplo aplicado a NovaMarket

Imaginemos que crear una orden tarda demasiado.

Con métricas podríamos detectar algo como:

- aumento en la latencia promedio de `POST /orders`.

Con tracing podríamos descubrir que:

- el gateway respondió rápido,
- `order-service` tardó poco en recibir la request,
- pero la llamada a `inventory-service` consumió la mayor parte del tiempo,
- y además el evento fue publicado sin inconvenientes.

Con logs podríamos completar el diagnóstico viendo:

- qué producto se intentó reservar,
- qué cantidad se pidió,
- qué mensaje técnico devolvió el servicio de inventario.

Las tres señales se complementan de forma natural.

---

## Qué conviene trazar en este curso

No todo merece el mismo nivel de instrumentación manual. En el contexto de NovaMarket, conviene enfocarse en el flujo principal:

- entrada por `api-gateway`,
- creación de la orden,
- consulta a stock,
- persistencia,
- publicación del evento,
- consumo del evento en `notification-service`.

Ese recorrido es suficiente para mostrar:

- spans HTTP,
- spans internos,
- trazas multi-servicio,
- correlación de logs,
- y propagación de contexto en mensajería.

---

## Qué preguntas puede responder el tracing

Una vez bien implementado, el tracing ayuda a responder preguntas como estas:

- ¿qué servicio hizo lenta esta operación?
- ¿la latencia apareció antes o después del gateway?
- ¿esta falla fue en el consumidor o en el productor del evento?
- ¿el retry volvió a ejecutar una llamada remota?
- ¿cuál fue el orden real de las operaciones?
- ¿qué tramo exacto de la request produjo el error?

Eso tiene un enorme valor didáctico en el curso, porque hace visible la complejidad distribuida.

---

## Errores comunes al introducir tracing

Cuando se empieza a trabajar con trazas distribuidas, suelen aparecer varios errores conceptuales.

### 1. Pensar que el tracing reemplaza al logging

No lo reemplaza. Lo complementa.

### 2. Instrumentar demasiado pronto todo el sistema

Conviene empezar por el flujo principal y después expandir.

### 3. No propagar contexto entre servicios

Eso rompe la continuidad de la traza.

### 4. Generar spans sin intención clara

Crear spans manuales para todo puede volver el análisis confuso. Hay que instrumentar con criterio.

### 5. No relacionar trazas con el negocio

Una traza es más útil cuando se entiende qué operación funcional representa.

---

## Cómo encaja este tema en el roadmap

Hasta ahora el curso ya incorporó:

- gateway,
- seguridad distribuida,
- resiliencia,
- métricas,
- Actuator.

El siguiente paso lógico es poder **seguir una request real a través de varios servicios**.

Por eso este tema aparece justo ahora: la arquitectura de NovaMarket ya tiene el nivel suficiente de distribución como para que el tracing deje de ser “algo decorativo” y pase a ser una necesidad real.

---

## Cierre

Las trazas distribuidas permiten reconstruir el recorrido completo de una operación cuando intervienen varios servicios, procesos o integraciones.

En una arquitectura como NovaMarket, eso es fundamental para entender latencias, errores, fallas parciales y dependencias entre componentes.

Micrometer Tracing nos da una forma moderna de incorporar esa capacidad dentro de la observabilidad del sistema, junto con métricas y logs.

En la próxima clase vamos a pasar de la idea conceptual a la implementación práctica: cómo instrumentar el tracing distribuido dentro del flujo principal de NovaMarket.
