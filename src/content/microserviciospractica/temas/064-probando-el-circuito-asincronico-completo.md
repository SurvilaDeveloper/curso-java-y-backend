---
title: "Probando el circuito asincrónico completo"
description: "Checkpoint práctico del bloque de mensajería en NovaMarket. Verificación integral de publicación, enrutamiento, consumo, persistencia y consulta del flujo order.created."
order: 64
module: "Módulo 10 · Mensajería asincrónica con RabbitMQ"
level: "intermedio"
draft: false
---

# Probando el circuito asincrónico completo

En las últimas clases NovaMarket dio un paso muy importante hacia una arquitectura más desacoplada:

- levantamos RabbitMQ,
- creamos `notification-service`,
- publicamos el evento `order.created`,
- persistimos la notificación consumida,
- y además refactorizamos el flujo para usar exchange, routing key y binding.

Eso ya nos deja un módulo de mensajería bastante interesante.

Antes de seguir creciendo con más eventos o más complejidad, conviene hacer una pausa y validar algo muy importante:

**que el circuito asincrónico completo realmente está sano.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- una orden se crea correctamente,
- se publica un evento asincrónico,
- RabbitMQ lo enruta como esperamos,
- `notification-service` lo consume,
- lo persiste,
- y la notificación resultante puede consultarse por API.

En otras palabras:  
vamos a verificar de punta a punta el primer circuito completo de eventos de NovaMarket.

---

## Estado de partida

En este punto del curso deberíamos tener:

- RabbitMQ arriba,
- `order-service` publicando a `novamarket.events`,
- una routing key `order.created`,
- una cola de notificaciones enlazada,
- `notification-service` consumiendo,
- y `/notifications` exponiendo lo persistido.

La arquitectura asincrónica ya no es una idea: ya existe.  
Ahora toca comprobarla con criterio.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- levantar el entorno completo,
- crear órdenes válidas,
- observar el circuito asincrónico,
- revisar RabbitMQ,
- revisar los servicios,
- y validar que toda la cadena funciona correctamente.

---

## Paso 1 · Levantar el entorno necesario

Conviene arrancar con todo el ecosistema relevante arriba:

1. RabbitMQ
2. `config-server`
3. `discovery-server`
4. Keycloak
5. `inventory-service`
6. `order-service`
7. `notification-service`
8. `api-gateway`

La idea es probar el circuito real del sistema, no una simulación parcial.

---

## Paso 2 · Verificar el broker

Antes de probar negocio, conviene revisar que RabbitMQ esté realmente arriba y accesible.

Entrá a la consola administrativa y asegurate de que:

- el exchange existe,
- la cola existe,
- y el entorno base está sano.

No hace falta todavía mirar todo al detalle, pero sí confirmar que el broker no es el punto roto del circuito.

---

## Paso 3 · Verificar que el flujo síncrono de órdenes sigue sano

Antes de enfocarnos en la parte asincrónica, conviene recordar que este circuito nace a partir de una orden creada correctamente.

Por eso, probá una orden válida autenticada:

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

La respuesta principal debería seguir siendo una orden creada con éxito.

Ese es el punto de partida del circuito asincrónico.

---

## Paso 4 · Pensar qué debería pasar inmediatamente después

Después de esa respuesta síncrona, el sistema debería disparar algo así:

1. `order-service` persiste la orden  
2. publica `order.created`  
3. RabbitMQ enruta el mensaje  
4. `notification-service` consume el evento  
5. persiste una notificación  
6. esa notificación queda visible por API  

Ese mapa mental es muy importante para saber qué verificar y en qué orden.

---

## Paso 5 · Revisar logs de `order-service`

Mirá la consola de `order-service`.

Queremos confirmar que:

- la orden se creó,
- y el evento fue publicado.

No hace falta que el log sea extremadamente detallado, pero conviene tener alguna señal visible de que el productor hizo su parte del circuito.

---

## Paso 6 · Revisar logs de `notification-service`

Ahora mirá `notification-service`.

Queremos ver algo como:

- recepción del evento,
- guardado del registro,
- y confirmación de persistencia.

Este punto es muy importante porque es donde el flujo deja de ser solo una expectativa arquitectónica y se vuelve un comportamiento observable.

---

## Paso 7 · Consultar `/notifications`

Ahora hacé la verificación externa más fuerte del circuito:

```bash
curl http://localhost:8085/notifications
```

La respuesta debería incluir la notificación correspondiente a la orden que acabás de crear.

Si eso ocurre, ya tenés una confirmación muy valiosa de que:

- el evento fue publicado,
- enrutado,
- consumido,
- persistido,
- y expuesto.

---

## Paso 8 · Repetir la prueba con varias órdenes

Conviene crear dos o tres órdenes más y volver a consultar `/notifications`.

Por ejemplo:

- una orden con un solo ítem,
- otra con dos ítems,
- otra distinta en cantidad

La idea es verificar que la colección crece y que el circuito se sostiene en múltiples ejecuciones, no solo en un caso aislado.

---

## Paso 9 · Revisar RabbitMQ durante las pruebas

Si querés enriquecer esta clase, mientras generás órdenes podés mirar la consola de RabbitMQ y revisar visualmente:

- el exchange `novamarket.events`
- la cola `notification.order-created.queue`
- el binding
- y el tráfico general

Esto ayuda mucho a conectar lo que ocurre en la arquitectura lógica con lo que realmente está pasando dentro del broker.

---

## Paso 10 · Pensar qué parte del flujo es síncrona y cuál es asincrónica

Este es uno de los puntos más valiosos del módulo.

Conviene diferenciar muy bien:

### Parte síncrona
- creación de la orden
- validación de inventario
- respuesta al cliente

### Parte asincrónica
- publicación de `order.created`
- consumo en `notification-service`
- persistencia de la notificación

Ese corte arquitectónico es exactamente lo que hace valioso el diseño que estamos construyendo.

---

## Paso 11 · Probar una orden inválida y observar que no se publique nada útil

Ahora probá una orden que falle en el flujo principal, por ejemplo por falta de stock:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": 3, "quantity": 999 }
    ]
  }'
```

La idea es observar que, si la orden no se crea, no deberíamos esperar una notificación exitosa asociada a un evento `order.created`.

Este contraste es muy bueno porque ayuda a confirmar que el evento está acoplado al hecho de negocio correcto, no simplemente a cualquier intento de creación.

---

## Qué estamos validando realmente en esta clase

No se trata solo de “hacer un POST y mirar una lista”.

Lo que estamos validando es esto:

### 1. Que el productor publica correctamente
### 2. Que RabbitMQ enruta correctamente
### 3. Que el consumidor procesa correctamente
### 4. Que el resultado se persiste
### 5. Que la arquitectura asincrónica ya es observable desde afuera

Eso es muchísimo valor para el módulo.

---

## Qué estamos logrando con esta clase

Esta clase cierra de manera muy sólida el primer bloque de mensajería asincrónica de NovaMarket.

Ya no estamos frente a una demo de “se mandó un mensajito”.  
Estamos frente a un circuito real donde:

- un hecho del negocio produce un evento,
- otro servicio reacciona,
- guarda resultado,
- y lo expone como parte visible del sistema.

Eso es un salto enorme de madurez.

---

## Qué todavía no estamos haciendo

Todavía no:

- incorporamos DLQ,
- manejamos duplicados o idempotencia,
- modelamos varios consumidores para el mismo evento,
- ni trabajamos retries del consumidor de forma avanzada.

Todo eso puede venir después.

La meta de hoy es más concreta:

**cerrar con confianza el primer circuito asincrónico completo.**

---

## Errores comunes en esta etapa

### 1. Probar el endpoint `/notifications` sin haber creado primero una orden válida
El circuito necesita dispararse desde el flujo principal.

### 2. No mirar logs del productor y del consumidor
Ambos lados ayudan muchísimo a validar el recorrido.

### 3. Pensar que cualquier intento de orden debería generar evento
No: el evento debería salir del hecho de negocio correcto.

### 4. No revisar RabbitMQ durante la prueba
La consola del broker puede aportar mucha claridad.

### 5. Quedarse solo con un único caso exitoso
Conviene probar varios y también un caso inválido.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería mostrar un circuito asincrónico completo y verificable:

- orden creada,
- evento publicado,
- mensaje enrutado,
- notificación persistida,
- y notificación consultable.

Eso deja muy bien consolidado el primer tramo de mensajería del proyecto.

---

## Punto de control

Antes de seguir, verificá que:

- crear una orden válida sigue funcionando,
- el evento se publica al exchange correcto,
- la cola recibe el mensaje,
- `notification-service` lo consume,
- `/notifications` lo expone,
- y un intento fallido de orden no dispara el mismo resultado.

Si eso está bien, entonces el bloque actual de mensajería ya quedó bastante sólido.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a robustecer este bloque asincrónico, introduciendo manejo de fallas del consumidor e ideas de reintento y error handling.

Eso nos va a permitir hacer que la mensajería no solo funcione, sino que también falle de forma más controlada.

---

## Cierre

En esta clase probamos de punta a punta el circuito asincrónico completo de NovaMarket.

Con eso, el proyecto ya no solo integra RabbitMQ técnicamente: también demuestra un uso real, observable y persistente de eventos del negocio dentro de su arquitectura.
