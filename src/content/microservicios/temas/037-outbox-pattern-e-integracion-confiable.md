---
title: "Outbox pattern e integración confiable"
description: "Cómo funciona el Outbox pattern, qué problema resuelve en microservicios y por qué es una pieza clave para publicar eventos sin perder consistencia."
order: 37
module: "Módulo 9 · Datos distribuidos y consistencia"
level: "intermedio"
draft: false
---

# Outbox pattern e integración confiable

Cuando un microservicio modifica datos propios y además necesita publicar un evento para que otros servicios reaccionen, aparece un problema clásico:

**¿cómo garantizar que ambas cosas queden coordinadas de forma confiable?**

En NovaMarket ese problema aparece de forma muy natural.

Por ejemplo, cuando `order-service` crea una orden:

1. persiste la orden en su base,
2. y luego necesita publicar `OrderCreatedEvent`.

A primera vista parece simple.  
Pero si se lo piensa mejor, enseguida aparece una pregunta incómoda:

**¿qué pasa si la orden se guarda, pero el evento no se publica?**

O al revés:

**¿qué pasa si el evento se publica, pero la transacción local de la orden falla?**

Ese desajuste entre persistencia local y publicación de eventos es justamente el problema que intenta resolver el **Outbox pattern**.

---

## El problema de fondo

Supongamos que `order-service` hace algo así:

1. inserta la orden en la base,
2. hace commit,
3. publica un mensaje a RabbitMQ.

Ese flujo parece razonable, pero tiene una ventana de riesgo.

### Escenario problemático
- la orden ya fue guardada,
- el servicio intenta publicar el evento,
- en ese instante hay un error de red, caída del broker o fallo del proceso,
- el evento nunca llega a publicarse.

Resultado:

- la orden existe,
- pero `notification-service` jamás se entera,
- y cualquier otro proceso dependiente del evento tampoco.

El sistema quedó **parcialmente actualizado**.

No necesariamente corrupto, pero sí inconsistente respecto del flujo esperado.

---

## Por qué no basta con “hacer las dos cosas juntas”

La intuición inmediata suele ser:

**“Bueno, entonces hago la inserción y la publicación en la misma transacción.”**

El problema es que la base de datos local y el broker de mensajería suelen ser recursos distintos.  
Coordinarlos con una transacción distribuida fuerte no siempre es simple, deseable o sostenible.

En arquitecturas de microservicios, la práctica más común es evitar ese acoplamiento fuerte y preferir estrategias más robustas y operables.

Ahí aparece el Outbox pattern.

---

## Qué es el Outbox pattern

El Outbox pattern consiste, en esencia, en guardar dentro de la **misma base de datos local del servicio** un registro que represente el evento que debe enviarse después.

Es decir, cuando `order-service` crea una orden:

- guarda la orden,
- y guarda también una fila en una tabla de outbox,
- todo dentro de la **misma transacción local**.

De esa manera, la operación crítica queda unificada a nivel del recurso que sí controla el servicio: su propia base.

Más tarde, un proceso separado se encarga de leer la tabla de outbox y publicar esos eventos al broker.

---

## Idea general del flujo

En NovaMarket, el flujo con Outbox podría verse así:

1. llega una request para crear una orden,
2. `order-service` valida lo necesario,
3. guarda la orden en su tabla principal,
4. guarda un registro `OrderCreatedEvent` en una tabla `outbox`,
5. se confirma la transacción,
6. un publicador de outbox detecta ese registro pendiente,
7. publica el mensaje a RabbitMQ,
8. marca el registro como enviado o procesado.

Así se evita el problema de “la orden quedó, pero el evento se perdió antes de salir”.

---

## Qué gana el sistema con esto

La ventaja principal es muy concreta:

**si la transacción local se confirmó, entonces el evento quedó registrado como pendiente de publicación.**

Eso no significa que el mensaje ya haya llegado al broker en ese mismo instante.  
Pero sí significa que el sistema no se olvidó de él.

Esa diferencia es enorme.

Sin outbox:
- un fallo en el peor momento puede borrar la intención de publicar.

Con outbox:
- la intención queda persistida y puede retomarse.

---

## Qué suele tener una tabla outbox

Una tabla de outbox suele incluir campos como:

- `id`
- `event_type`
- `aggregate_type`
- `aggregate_id`
- `payload`
- `created_at`
- `status`
- `processed_at` opcional
- `retry_count` opcional

Por ejemplo, para NovaMarket podría existir una fila así:

- `event_type = OrderCreatedEvent`
- `aggregate_type = Order`
- `aggregate_id = 101`
- `payload = {...json del evento...}`
- `status = PENDING`

La estructura exacta puede variar, pero la idea general es la misma.

---

## Qué componente publica desde outbox

Hay varias estrategias posibles.

### Opción 1: proceso interno dentro del mismo servicio
Un componente periódico revisa la tabla outbox y publica los pendientes.

### Opción 2: worker dedicado
Un proceso separado se encarga de esa publicación.

### Opción 3: CDC o herramientas más avanzadas
En entornos más complejos pueden usarse mecanismos de Change Data Capture, pero para el curso conviene empezar por una versión más clara y didáctica.

En NovaMarket, la forma más razonable para enseñar el concepto es usar un publicador interno simple, fácil de seguir y de entender.

---

## Qué problema resuelve exactamente

El Outbox pattern no hace magia.  
No elimina todos los errores posibles.

Lo que resuelve es algo muy específico y muy importante:

**evitar que una modificación local exitosa quede desacoplada de la intención de publicar el evento que la representa.**

Dicho de otra forma:

- protege la coordinación entre datos propios y mensaje saliente,
- sin exigir una transacción distribuida compleja.

---

## Qué no resuelve por sí solo

Es importante no atribuirle más de lo que realmente hace.

El Outbox pattern no garantiza automáticamente:

- que el consumidor procese bien el evento,
- que el mensaje no llegue duplicado,
- que no haya reintentos,
- que no exista latencia,
- que el flujo completo termine instantáneamente.

Por eso suele combinarse con:

- idempotencia,
- observabilidad,
- reintentos,
- manejo de errores,
- y modelado correcto de estados.

---

## Relación con consistencia eventual

La clase anterior introdujo consistencia eventual.  
El Outbox pattern encaja perfecto ahí.

¿Por qué?

Porque en microservicios muchas veces la operación completa no termina de forma simultánea en todos los servicios.  
Lo importante es que el sistema tenga un camino confiable para propagar los cambios.

Outbox ayuda justamente a eso:

- el servicio asegura primero su estado local,
- y deja persistida la intención de comunicar el cambio,
- para que otros componentes lo procesen después.

Es una pieza que **mejora la confiabilidad de la convergencia**.

---

## Ejemplo concreto en NovaMarket

Imaginemos que `order-service` recibe esta solicitud:

```json
{
  "items": [
    { "productId": 1, "quantity": 2 }
  ]
}
```

Si la validación de stock es correcta, `order-service` podría hacer una sola transacción local que:

1. inserte la nueva orden en `orders`,
2. inserte una fila en `outbox_events` con el `OrderCreatedEvent`.

Si la transacción falla, no queda ni la orden ni el evento pendiente.  
Si la transacción confirma, quedan ambas cosas.

Después, el publicador de outbox toma el evento pendiente y lo manda a RabbitMQ para que `notification-service` o cualquier otro consumidor lo procese.

---

## Qué pasa si el publicador falla

Ese es uno de los puntos fuertes del patrón.

Si el publicador falla:

- la orden ya quedó persistida,
- el registro de outbox sigue pendiente,
- y el sistema puede reintentar más tarde.

El evento no desaparece simplemente porque un intento de publicación salió mal.

Eso vuelve mucho más robusta la integración.

---

## Riesgos y cuidados del patrón

Aunque es muy útil, también trae responsabilidades de diseño.

### 1. Hay que evitar publicaciones duplicadas
Un reintento puede publicar dos veces si el sistema no marca correctamente el estado.

### 2. Hay que pensar en la idempotencia del consumidor
Aunque el emisor haga bien su parte, del otro lado sigue siendo buena práctica tolerar duplicados.

### 3. Hay que monitorear la tabla outbox
Si los eventos se acumulan y nadie los publica, hay un problema operativo.

### 4. Hay que limpiar o archivar registros antiguos
La tabla no debería crecer indefinidamente sin control.

---

## Por qué este patrón es tan valioso didácticamente

Porque enseña algo muy importante:

en sistemas distribuidos, la confiabilidad rara vez surge de una sola instrucción “mágica”.  
Surge de modelar bien la realidad y aceptar que algunos pasos ocurren en distintos momentos.

Outbox ayuda a transformar esta idea difusa:

- “después publico un evento”

en algo concreto y durable:

- “la intención de publicar quedó persistida y puede retomarse”.

---

## Cómo se conecta con los próximos temas

Este patrón prepara el camino para temas más avanzados.

Por ejemplo:

- idempotencia del lado consumidor,
- reintentos,
- dead letter queues,
- sagas,
- observabilidad de procesos distribuidos.

También ayuda a entender mejor por qué una arquitectura orientada a eventos necesita más que un simple `send()` al broker.

---

## Una idea práctica para llevarse

Cuando un servicio necesita hacer estas dos cosas:

- cambiar su propio estado,
- y avisarle algo al resto del sistema,

la pregunta correcta no es solo:

**“¿Cómo publico un mensaje?”**

La pregunta realmente importante es:

**“¿Cómo hago para no perder la intención de publicarlo si mi cambio local ya quedó confirmado?”**

Outbox pattern es una respuesta sólida a ese problema.

---

## Cierre

El Outbox pattern es una estrategia muy útil para integrar persistencia local y publicación de eventos de manera más confiable en una arquitectura de microservicios.

No elimina toda la complejidad del sistema, pero sí resuelve una de las fallas más delicadas: que el estado interno de un servicio se actualice sin que el resto del ecosistema pueda enterarse de forma durable.

En NovaMarket, este patrón encaja de manera natural en `order-service`, donde la creación de una orden y la emisión de `OrderCreatedEvent` deben quedar coordinadas sin depender de una transacción distribuida global.

En la próxima clase vamos a ver otro concepto clave para procesos distribuidos de varios pasos: **las sagas**.
