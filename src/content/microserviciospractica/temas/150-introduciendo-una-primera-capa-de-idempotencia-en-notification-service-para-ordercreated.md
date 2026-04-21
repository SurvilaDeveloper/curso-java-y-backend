---
title: "Introduciendo una primera capa de idempotencia en notification-service para OrderCreated"
description: "Siguiente paso práctico del módulo 13. Incorporación de una primera capa de idempotencia en notification-service para evitar efectos duplicados al reprocesar OrderCreated."
order: 150
module: "Módulo 13 · Comunicación asíncrona y eventos"
level: "intermedio"
draft: false
---

# Introduciendo una primera capa de idempotencia en `notification-service` para `OrderCreated`

En la clase anterior dejamos algo bastante claro:

- el primer flujo asíncrono real ya existe,
- retries y DLQ ya vuelven más robusto el consumo,
- y el siguiente paso lógico ya no es seguir tratando cada mensaje como si fuera perfectamente único, sino empezar a proteger al consumidor frente a duplicados o reprocesamientos.

Ahora toca el paso concreto:

**introducir una primera capa de idempotencia en `notification-service` para `OrderCreated`.**

Ese es el objetivo de esta clase.

Porque una cosa es tener:

- publicación real,
- consumo real,
- retries,
- DLQ.

Y otra bastante distinta es conseguir que:

- si el mismo evento reaparece,
- o si se reprocesa,
- el consumidor no dispare dos veces el mismo efecto de negocio como si fuera la primera vez.

Ese es exactamente el primer gran valor práctico que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la relación entre eventos duplicados e idempotencia,
- visible una primera protección concreta en `notification-service`,
- mejorada la estabilidad del flujo `OrderCreated`,
- y NovaMarket mejor preparado para seguir consolidando mensajería robusta después.

La meta de hoy no es todavía diseñar la política final de idempotencia de todo el sistema.  
La meta es mucho más concreta: **hacer que `notification-service` no produzca dos veces el mismo efecto de negocio al reprocesar el mismo `OrderCreated`**.

---

## Estado de partida

Partimos de un sistema donde ya:

- `order-service` publica `OrderCreated`,
- `notification-service` lo consume,
- existen retries controlados y DLQ,
- y el módulo ya dejó claro que ahora hace falta una protección frente a duplicados.

Eso significa que el problema ya no es cómo mover mensajes y manejar fallos básicos.  
Ahora la pregunta útil es otra:

- **cómo hacemos para que el mismo evento no vuelva a ejecutar el mismo efecto como si fuera nuevo**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir una primera estrategia simple de idempotencia,
- aplicarla en `notification-service`,
- ejecutar un escenario donde el mismo evento pueda reaparecer,
- y dejar visible cómo el consumidor ya no repite el efecto de negocio de forma ciega.

---

## Paso 1 · Elegir una clave de idempotencia razonable

A esta altura del curso, una primera decisión clara puede ser usar algo como:

- `eventId`
- o una clave suficientemente estable del evento

Si el evento todavía no trae una identidad propia clara, este suele ser un muy buen momento para agregarla.

Por ejemplo, algo conceptualmente así:

```java
public record OrderCreatedEvent(
        String eventId,
        Long orderId,
        String customerEmail,
        String status,
        String createdAt
) {
}
```

No hace falta todavía una estrategia gigantesca.

La idea central es otra:

- el consumidor necesita una referencia explícita para saber si ya procesó ese evento antes.

Ese paso es uno de los corazones prácticos de toda la clase.

---

## Paso 2 · Elegir una forma simple de recordar lo ya procesado

A esta altura del módulo, una primera estrategia didáctica y clara puede ser:

- guardar el `eventId` procesado en una tabla o repositorio sencillo
- y consultar antes de ejecutar el efecto de negocio

Conceptualmente, algo así:

```java
if (processedEventRepository.existsByEventId(event.eventId())) {
    log.info("Evento ya procesado, se ignora. eventId={}", event.eventId());
    return;
}
```

No hace falta todavía una arquitectura perfecta de deduplicación global.

La meta es mucho más concreta:

- introducir una primera protección real y visible del lado consumidor.

---

## Paso 3 · Registrar el procesamiento solo cuando el efecto fue realmente aceptado

Este punto importa muchísimo.

La idempotencia no gana valor si marcamos un evento como procesado demasiado pronto.

La lógica sana suele ser más bien:

1. verificar si ya fue procesado
2. si no, ejecutar la reacción
3. registrar el evento como procesado cuando corresponde

Ese orden importa mucho porque evita inconsistencias entre “el evento quedó marcado” y “el efecto realmente se hizo”.

Ese matiz vuelve muchísimo más sólida la clase.

---

## Paso 4 · Ejecutar un escenario de reprocesamiento o duplicado

Ahora conviene construir un caso controlado donde el mismo `OrderCreated` reaparezca o vuelva a entregarse.

La idea no es todavía depender del azar del broker.

La meta es más concreta:

- tener un caso visible y reproducible para demostrar que el consumidor ya no duplica el efecto de negocio.

Ese paso vale muchísimo.

---

## Paso 5 · Observar qué cambia en `notification-service`

Ahora queremos ver algo muy concreto:

- la primera vez el evento se procesa,
- la siguiente vez el sistema detecta que ya pasó por ahí,
- y en lugar de ejecutar el efecto otra vez, lo ignora o lo trata de forma segura.

Ese contraste es el corazón práctico de la clase.

---

## Paso 6 · Entender qué cambia realmente con este paso

Conviene leerlo con calma.

Antes:

- un evento duplicado podía terminar generando dos veces el mismo efecto si no había cuidado explícito del lado consumidor

Ahora, en cambio, además ya existe una protección real:

- el consumidor puede reconocer que ese evento ya fue tratado
- y evitar repetir el efecto como si fuera nuevo

Ese cambio parece chico, pero conceptualmente es enorme.

---

## Paso 7 · Pensar por qué esto mejora muchísimo la robustez del sistema

A esta altura del módulo, conviene hacer una lectura muy concreta:

si el sistema ya publica, consume, reintenta y aísla errores, pero no sabe tratar duplicados, todavía queda un frente importante abierto.

Con una primera capa de idempotencia, en cambio:

- el flujo se vuelve mucho más confiable,
- los reintentos son menos peligrosos,
- y el sistema gana estabilidad frente a una realidad muy típica de la mensajería operativa.

Ese cambio vale muchísimo.

---

## Paso 8 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene toda su estrategia de idempotencia final resuelta”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una primera capa real de idempotencia en `notification-service` para `OrderCreated`.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase introduce una primera capa de idempotencia en `notification-service` para `OrderCreated`.

Ya no estamos solo moviendo mensajes y manejando fallos básicos.  
Ahora también estamos haciendo que el consumidor procese con mucho más cuidado los eventos que pueden reaparecer, evitando efectos duplicados problemáticos.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos todavía este subbloque con un checkpoint fuerte,
- ni decidimos aún si seguir profundizando eventos o pasar al siguiente gran bloque del roadmap.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que NovaMarket no trate duplicados como si fueran siempre eventos nuevos y completamente inocuos.**

---

## Errores comunes en esta etapa

### 1. Pensar que el broker debería resolver por completo el problema de duplicados
La protección del consumidor sigue siendo central.

### 2. Marcar un evento como procesado demasiado pronto
Eso puede abrir inconsistencias.

### 3. Elegir una clave de idempotencia poco estable
Entonces la protección se vuelve frágil.

### 4. No construir un caso visible de reprocesamiento
El laboratorio pierde mucho valor sin esa comparación.

### 5. Creer que esta clase ya cierra todo el frente de eventos robustos
Todavía puede profundizarse bastante más.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- `notification-service` ya tiene una primera protección frente a duplicados,
- el mismo `OrderCreated` ya no produce automáticamente el mismo efecto dos veces,
- y NovaMarket ya dio un primer paso serio hacia una arquitectura basada en eventos mucho más segura y mucho más madura.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- existe una clave o identidad clara del evento,
- el consumidor ya verifica si el evento fue tratado antes,
- entendés qué estabilidad nueva gana el sistema con este paso,
- y sentís que NovaMarket ya dejó de tener una mensajería ingenua frente a duplicados para empezar a sostener un consumo mucho más seguro.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta nueva capa del módulo 13.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de idempotencia antes de decidir cómo seguir profundizando el bloque de mensajería basada en eventos en NovaMarket.

---

## Cierre

En esta clase introdujimos una primera capa de idempotencia en `notification-service` para `OrderCreated`.

Con eso, el proyecto deja de tratar el consumo de eventos como si cada mensaje fuera siempre nuevo y empieza a sostener una forma mucho más segura, mucho más estable y mucho más madura de manejar duplicados dentro de su arquitectura basada en eventos.
