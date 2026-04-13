---
title: "Reprocesando mensajes desde la DLQ"
description: "Evolución del bloque de robustez asincrónica en NovaMarket. Reprocesamiento básico de mensajes fallidos para salir del modelo de 'solo aislar' y pasar a una estrategia de recuperación."
order: 69
module: "Módulo 10 · Mensajería asincrónica con RabbitMQ"
level: "intermedio"
draft: false
---

# Reprocesando mensajes desde la DLQ

En la clase anterior dejamos algo muy claro:

- el mensaje sano sigue el circuito normal,
- el mensaje fallido termina en la dead-letter queue,
- y la DLQ cumple muy bien su rol de aislar mensajes problemáticos.

Eso ya es muchísimo valor.

Pero todavía nos falta un paso muy importante para que el bloque de mensajería se sienta más completo:

**hacer algo con esos mensajes fallidos.**

Porque aislarlos está muy bien, pero a veces el siguiente paso natural es este:

- revisar el motivo del fallo,
- corregir la causa,
- e intentar reprocesar el mensaje.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- definido un mecanismo básico de reprocesamiento de mensajes desde la DLQ,
- reinyectado un mensaje fallido al flujo principal,
- y validado que NovaMarket ya puede no solo aislar errores, sino también intentar recuperarlos.

No vamos a construir todavía una estrategia industrial súper compleja de replay.  
La meta es algo mucho más concreta y didáctica: cerrar el primer circuito de recuperación.

---

## Estado de partida

Partimos de este contexto:

- existe una cola principal de notificaciones,
- existe una DLQ,
- ya sabemos producir un caso fallido,
- y ya sabemos observar que el mensaje termina en la cola de error.

Pero hasta ahora esos mensajes quedan simplemente estacionados ahí.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- definir una forma simple de reprocesamiento,
- crear una pieza de aplicación que publique nuevamente el mensaje,
- simular una corrección de la causa del fallo,
- y verificar que un mensaje antes fallido ahora pueda terminar procesándose bien.

---

## Qué problema queremos resolver

Una DLQ sin estrategia posterior deja una parte importante del trabajo sin cerrar.

La gran pregunta es:

**¿qué hacemos después con esos mensajes?**

Para esta etapa del curso práctico, vamos a adoptar una respuesta simple y muy útil:

- leer el mensaje desde la DLQ,
- y reenviarlo a la topología normal una vez que el sistema esté listo para procesarlo correctamente.

Eso nos permite introducir la idea de recuperación sin agregar todavía demasiada complejidad.

---

## Paso 1 · Definir una estrategia simple de replay

Para esta clase, no hace falta automatizar un flujo perfecto ni crear una plataforma entera de operaciones.

Una estrategia didáctica muy buena es esta:

- crear un pequeño componente en `notification-service` o en una pieza auxiliar,
- capaz de volver a publicar el mensaje al exchange principal con la routing key original.

Es decir:  
vamos a hacer un **replay controlado** del mensaje fallido.

---

## Paso 2 · Asegurar que la causa del fallo puede corregirse

Este punto es importantísimo.

No tiene mucho sentido reprocesar el mensaje si la causa del fallo sigue exactamente igual.

Por eso, antes del replay, conviene:

- quitar o desactivar temporalmente la falla controlada del consumidor,
- o modificar la condición de prueba para que el mensaje ya no vuelva a explotar de la misma manera.

Por ejemplo, si la clase anterior fallaba cuando `itemsCount > 1`, este es un buen momento para desactivar temporalmente esa regla de laboratorio.

---

## Paso 3 · Crear una pieza de reprocesamiento básica

Una opción razonable para esta etapa es crear un servicio que pueda reenviar un evento fallido al exchange principal.

Por ejemplo:

```txt
src/main/java/com/novamarket/notification/service/DlqReplayService.java
```

Una versión conceptual simple podría verse así:

```java
package com.novamarket.notification.service;

import com.novamarket.notification.config.AmqpConstants;
import com.novamarket.notification.dto.OrderCreatedEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class DlqReplayService {

    private final RabbitTemplate rabbitTemplate;

    public DlqReplayService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void replayOrderCreated(OrderCreatedEvent event) {
        rabbitTemplate.convertAndSend(
                AmqpConstants.EVENTS_EXCHANGE,
                AmqpConstants.ORDER_CREATED_ROUTING_KEY,
                event
        );
    }
}
```

La idea es simple: reinyectar el evento al mismo circuito normal.

---

## Paso 4 · Crear una forma manual de disparar el replay

Para esta etapa del curso práctico, una opción muy útil es exponer un endpoint manual de laboratorio.

Por ejemplo, un controller de replay podría verse conceptualmente así:

```java
package com.novamarket.notification.controller;

import com.novamarket.notification.dto.OrderCreatedEvent;
import com.novamarket.notification.service.DlqReplayService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/replay")
public class DlqReplayController {

    private final DlqReplayService replayService;

    public DlqReplayController(DlqReplayService replayService) {
        this.replayService = replayService;
    }

    @PostMapping("/order-created")
    public ResponseEntity<String> replay(@RequestBody OrderCreatedEvent event) {
        replayService.replayOrderCreated(event);
        return ResponseEntity.ok("Evento reenviado al flujo principal");
    }
}
```

No hace falta que esto sea una solución definitiva de producción.  
Para el curso práctico, es una herramienta excelente para entender el mecanismo.

---

## Paso 5 · Reiniciar `notification-service`

Después de agregar el servicio y el endpoint de replay, reiniciá `notification-service`.

Asegurate también de que:

- RabbitMQ esté arriba,
- la topología siga cargada,
- y la falla intencional del consumidor ya no esté activa para el caso que querés reprocesar.

La idea es que el mensaje fallido tenga ahora una oportunidad real de ser procesado correctamente.

---

## Paso 6 · Producir un mensaje fallido

Si todavía no tenés uno disponible, generá nuevamente una orden que dispare la falla del consumidor y termine en DLQ.

Por ejemplo, una orden con dos ítems si esa era la condición de prueba.

La idea es confirmar que el mensaje efectivamente llegó a la DLQ antes de intentar recuperarlo.

---

## Paso 7 · Corregir la causa del fallo

Ahora desactivá o corregí la causa de la falla controlada.

Esto puede ser tan simple como:

- comentar temporalmente la regla artificial de error,
- o cambiar la condición para que ese evento ya no falle.

Este paso es clave porque el reprocesamiento no debería repetir ciegamente el mismo error.

---

## Paso 8 · Reenviar el mensaje

Ahora usá el endpoint de replay o la herramienta equivalente que definiste para volver a publicar el evento.

Conceptualmente, algo como:

```bash
curl -X POST http://localhost:8085/admin/replay/order-created \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 123,
    "status": "CREATED",
    "createdAt": "2026-04-12T12:00:00Z",
    "itemsCount": 2
  }'
```

La idea es reinyectar el mensaje al exchange principal usando la routing key normal.

---

## Paso 9 · Revisar logs del consumidor

Ahora mirá `notification-service`.

La expectativa es que el evento reenviado:

- vuelva al flujo normal,
- sea consumido,
- y esta vez sí quede persistido correctamente.

Ese es el verdadero momento importante de la clase.

---

## Paso 10 · Verificar `/notifications`

Ahora consultá:

```bash
curl http://localhost:8085/notifications
```

La notificación correspondiente al evento que antes había fallado debería aparecer ahora si el reprocesamiento fue exitoso.

Eso demuestra que el sistema ya puede no solo aislar un error, sino también recuperarse parcialmente de él.

---

## Paso 11 · Pensar qué estamos haciendo y qué no

Este punto importa bastante.

### Sí estamos haciendo
- replay manual básico
- recuperación del circuito
- reprocesamiento del mensaje aislado

### Todavía no estamos haciendo
- replay automático sofisticado
- control avanzado de duplicados
- interfaz de operaciones completa
- gobierno fino sobre mensajes muertos

Eso está bien.  
Para esta etapa del curso, este nivel de recuperación ya enseña muchísimo.

---

## Qué estamos logrando con esta clase

Esta clase transforma la DLQ en algo todavía más útil.

Antes, la DLQ servía para aislar errores.  
Ahora además empezamos a verla como una estación intermedia desde la que un mensaje puede:

- revisarse,
- corregirse,
- y reintentarse.

Eso acerca mucho más el módulo a problemas reales de operación.

---

## Qué todavía no hicimos

Todavía no:

- agregamos una API para listar mensajes fallidos directamente,
- manejamos idempotencia del reprocesamiento,
- ni armamos políticas automáticas más maduras.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**demostrar que un mensaje fallido puede volver al circuito principal y terminar bien.**

---

## Errores comunes en esta etapa

### 1. Intentar reprocesar sin corregir la causa del fallo
Entonces el mensaje vuelve a caer exactamente igual.

### 2. Reenviar el evento a una cola equivocada
El replay debería volver al exchange y routing key del flujo normal.

### 3. No validar primero que el mensaje estaba realmente en la DLQ
El contraste se pierde si el caso fallido no quedó bien establecido.

### 4. No revisar `/notifications` después del replay
Ese endpoint es una de las mejores evidencias del éxito final.

### 5. Confundir replay manual con solución completa de producción
Esta clase apunta a comprender el mecanismo, no a cerrar todavía toda la operación real.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería poder:

- tener un mensaje fallido en DLQ,
- corregir la causa del fallo,
- reprocesarlo manualmente,
- y terminar persistiendo correctamente la notificación.

Eso es un avance muy fuerte en la madurez del bloque asincrónico.

---

## Punto de control

Antes de seguir, verificá que:

- existe una forma de replay,
- pudiste producir un mensaje fallido,
- corregiste la causa del fallo,
- reenviaron el evento al flujo normal,
- y finalmente la notificación apareció en `/notifications`.

Si eso está bien, ya podemos cerrar este tramo del módulo con una lectura más general de la estrategia completa.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a hacer una revisión integral del bloque de mensajería: flujo sano, flujo fallido, DLQ y replay.

Eso nos va a permitir dejar esta parte muy bien consolidada antes de avanzar a otro bloque del curso.

---

## Cierre

En esta clase reprocesamos un mensaje desde la dead-letter queue.

Con eso, NovaMarket ya no solo sabe publicar, consumir y aislar fallos: también empieza a mostrar una capacidad muy valiosa de recuperación controlada del circuito asincrónico.
