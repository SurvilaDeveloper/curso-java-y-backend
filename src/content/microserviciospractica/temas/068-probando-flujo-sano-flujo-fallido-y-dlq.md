---
title: "Probando flujo sano, flujo fallido y DLQ"
description: "Checkpoint práctico del bloque de mensajería robusta en NovaMarket. Comparación entre el circuito asincrónico normal y el circuito que termina en dead-letter queue."
order: 68
module: "Módulo 10 · Mensajería asincrónica con RabbitMQ"
level: "intermedio"
draft: false
---

# Probando flujo sano, flujo fallido y DLQ

En las últimas clases NovaMarket dio un salto importante en la robustez del flujo asincrónico:

- el evento `order.created` ya circula por RabbitMQ,
- `notification-service` lo consume,
- el resultado se persiste,
- vimos cómo falla el consumidor,
- ordenamos mejor el procesamiento,
- y además agregamos una **dead-letter queue** para aislar mensajes que no pudieron procesarse correctamente.

Eso ya deja al bloque de mensajería mucho más serio.

Antes de seguir creciendo con reprocesamiento o nuevas extensiones, conviene hacer una pausa muy útil:

**comparar de punta a punta el circuito sano con el circuito fallido.**

Ese contraste es el verdadero corazón de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- un evento sano recorre correctamente el circuito normal,
- un evento fallido termina en la DLQ,
- podemos distinguir claramente ambos caminos,
- y la arquitectura asincrónica de NovaMarket ya tiene un comportamiento mucho más controlado frente a errores del consumidor.

---

## Estado de partida

En este punto del curso deberíamos tener:

- RabbitMQ arriba,
- un exchange principal para eventos,
- una routing key `order.created`,
- una cola de notificaciones,
- una DLQ para mensajes fallidos,
- `order-service` publicando,
- y `notification-service` consumiendo con una falla controlada reproducible.

Además, el flujo síncrono principal de órdenes debería seguir funcionando.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- levantar el entorno completo,
- probar un caso feliz,
- probar un caso fallido,
- comparar el resultado en `notification-service`,
- revisar RabbitMQ,
- y dejar muy clara la diferencia entre ambos recorridos.

---

## Por qué esta clase vale mucho

Porque tener una DLQ declarada no alcanza.

Lo que realmente importa es entender algo así:

- cuándo el mensaje sigue el flujo normal,
- cuándo termina muerto,
- y qué evidencia concreta tenemos de cada caso.

Ese nivel de lectura operativa es lo que transforma una configuración “bonita” en una arquitectura realmente entendida.

---

## Paso 1 · Levantar el entorno completo

Conviene arrancar con todas las piezas relevantes arriba:

1. RabbitMQ
2. `config-server`
3. `discovery-server`
4. Keycloak
5. `inventory-service`
6. `order-service`
7. `notification-service`
8. `api-gateway`

La idea es probar el flujo real de NovaMarket, no una simulación parcial.

---

## Paso 2 · Revisar RabbitMQ antes de probar

Entrá a la consola de RabbitMQ y verificá visualmente al menos esto:

- existe el exchange principal de eventos,
- existe la cola normal de notificaciones,
- existe la DLQ,
- y las bindings están definidas.

No hace falta todavía analizar cada contador, pero sí confirmar que la topología correcta está cargada.

---

## Paso 3 · Confirmar cuál es el caso feliz y cuál el caso fallido

Como venimos usando una falla controlada, la regla debería estar clara.

Por ejemplo:

- **orden con un solo ítem** → caso feliz
- **orden con más de un ítem** → caso fallido del consumidor

Esto es importante porque nos permite provocar ambos escenarios de manera repetible y sin ambigüedad.

---

## Paso 4 · Probar el caso feliz

Generá una orden válida con un solo ítem:

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

La expectativa es:

- la orden se crea correctamente,
- el evento se publica,
- `notification-service` lo consume,
- la notificación se persiste,
- y no interviene la DLQ.

---

## Paso 5 · Verificar el resultado del caso feliz

Ahora mirá:

### Logs de `notification-service`
Deberías ver el procesamiento exitoso.

### Endpoint `/notifications`
Probá:

```bash
curl http://localhost:8085/notifications
```

La lista debería incluir la notificación correspondiente.

### RabbitMQ
La cola normal debería procesar ese mensaje sin mandarlo a la DLQ.

Este es el camino sano del circuito.

---

## Paso 6 · Probar el caso fallido

Ahora generá una orden que dispare la falla controlada:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 },
      { "productId": 2, "quantity": 1 }
    ]
  }'
```

La idea es que el request principal siga terminando bien en el lado síncrono, pero que el consumidor falle al procesar el evento.

---

## Paso 7 · Verificar el resultado del caso fallido

Ahora observá tres cosas muy importantes.

### 1. Logs de `notification-service`
Deberías ver la excepción o el fallo del procesamiento.

### 2. Endpoint `/notifications`
Probá otra vez:

```bash
curl http://localhost:8085/notifications
```

La notificación correspondiente al caso fallido no debería aparecer como una persistencia normal.

### 3. RabbitMQ
El mensaje debería haber terminado en la **dead-letter queue**.

Este es el punto central de la clase.

---

## Paso 8 · Comparar ambos recorridos

A esta altura conviene hacer una comparación explícita.

### Caso feliz
- orden creada
- evento publicado
- consumidor procesa
- notificación persistida
- sin DLQ

### Caso fallido
- orden creada
- evento publicado
- consumidor falla
- no hay persistencia normal
- mensaje va a DLQ

Esta comparación vale muchísimo más que cualquier explicación teórica aislada.

---

## Paso 9 · Revisar qué parte del sistema falló y cuál no

Este mapa es muy útil.

### Lo que siguió funcionando en ambos casos
- autenticación
- gateway
- creación de la orden
- publicación del evento

### Lo que cambia entre ambos casos
- el procesamiento en `notification-service`
- el destino final del mensaje
- la persistencia o no de la notificación

Esta lectura ayuda a separar mucho mejor:

- la salud del flujo síncrono
- del resultado del flujo asincrónico

---

## Paso 10 · Pensar qué resuelve realmente la DLQ

Esta clase sirve para reforzar una idea clave:

la DLQ **no arregla** el procesamiento fallido.  
Lo que hace es:

- aislar el mensaje,
- evitar que se mezcle con el flujo normal,
- y dejarlo disponible para diagnóstico o reprocesamiento posterior.

Ese cambio de enfoque es muy importante para trabajar mensajería con madurez.

---

## Qué estamos logrando con esta clase

Esta clase deja completamente visible el valor de la DLQ dentro de NovaMarket.

Ya no es una pieza abstracta de configuración.

Ahora podés ver claramente que:

- el flujo normal existe,
- el flujo fallido también,
- y ambos tienen destinos bien diferenciados y observables.

Eso fortalece mucho el módulo.

---

## Qué todavía no hicimos

Todavía no:

- reprocesamos manual o automáticamente la DLQ,
- exponemos mensajes fallidos por API,
- ni implementamos un mecanismo de reparación del circuito fallido.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**entender y validar muy bien la diferencia entre el camino normal y el camino muerto.**

---

## Errores comunes en esta etapa

### 1. No comparar explícitamente el caso feliz con el fallido
Ese contraste es el núcleo de la clase.

### 2. Mirar solo RabbitMQ y no `/notifications`
La persistencia o no de la notificación dice muchísimo.

### 3. Confundir la falla del consumidor con una falla del request principal
La orden puede haberse creado bien y aun así el evento terminar mal.

### 4. Querer “arreglar” el mensaje desde esta clase
Hoy el foco es diagnóstico y comprensión del flujo.

### 5. No revisar logs del consumidor
Ahí aparece mucha evidencia clave.

---

## Resultado esperado al terminar la clase

Al terminar esta clase deberías poder describir con claridad los dos caminos del flujo asincrónico actual de NovaMarket:

- el camino sano
- y el camino que termina en DLQ

Eso deja el módulo mucho mejor comprendido y preparado para el siguiente paso.

---

## Punto de control

Antes de seguir, verificá que:

- probaste un caso feliz y uno fallido,
- viste la diferencia en `/notifications`,
- viste la diferencia en RabbitMQ,
- entendiste el rol de la DLQ,
- y ya podés describir de punta a punta ambos recorridos.

Si eso está bien, ya podemos pasar a la siguiente mejora: reprocesar mensajes fallidos.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a hacer un reprocesamiento básico de mensajes desde la DLQ.

Ese será el primer paso para que el sistema no solo aísle mensajes fallidos, sino que también pueda intentar recuperarlos.

---

## Cierre

En esta clase comparamos el flujo asincrónico sano con el flujo que termina en dead-letter queue.

Con eso, NovaMarket ya no solo tiene robustez configurada: también tiene un circuito asincrónico cuyo comportamiento exitoso y fallido puede leerse claramente de punta a punta.
