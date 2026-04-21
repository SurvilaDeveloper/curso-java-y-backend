---
title: "Agregando una primera dead letter queue para OrderCreated en NovaMarket"
description: "Siguiente paso práctico del módulo 13. Incorporación de una primera dead letter queue para mensajes OrderCreated que no pueden procesarse correctamente en notification-service."
order: 144
module: "Módulo 13 · Comunicación asíncrona y eventos"
level: "intermedio"
draft: false
---

# Agregando una primera dead letter queue para `OrderCreated` en NovaMarket

En la clase anterior dejamos algo bastante claro:

- el primer flujo asíncrono real ya existe,
- publicar y consumir mensajes felices no alcanza por sí solo,
- y el siguiente paso lógico ya no es seguir mirando solo el caso exitoso, sino empezar a manejar mejor los mensajes que fallan del lado consumidor.

Ahora toca el paso concreto:

**agregar una primera dead letter queue para `OrderCreated` en NovaMarket.**

Ese es el objetivo de esta clase.

Porque una cosa es tener:

- un evento publicado,
- un consumidor funcionando,
- y un flujo feliz de punta a punta.

Y otra bastante distinta es conseguir que:

- si ese consumidor falla,
- el mensaje no destruya el flujo,
- no quede reintentándose sin criterio,
- y termine separado en un lugar razonable para análisis o tratamiento posterior.

Ese es exactamente el primer gran valor práctico que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la relación entre flujo principal y mensajes fallidos,
- visible una primera dead letter queue real dentro de NovaMarket,
- mejorado el manejo de errores del lado asíncrono,
- y el proyecto mejor preparado para seguir consolidando mensajería robusta después.

La meta de hoy no es todavía diseñar toda la política final de retries y mensajes venenosos del sistema.  
La meta es mucho más concreta: **hacer que NovaMarket deje de tratar los fallos de consumo como algo caótico y empiece a separar explícitamente mensajes problemáticos en una cola propia**.

---

## Estado de partida

Partimos de un sistema donde ya:

- RabbitMQ forma parte del entorno,
- existe un flujo real `OrderCreated` desde `order-service` hacia `notification-service`,
- y el módulo ya dejó claro que ahora conviene manejar mejor los mensajes que no pueden procesarse correctamente.

Eso significa que el problema ya no es cómo producir y consumir en el caso feliz.  
Ahora la pregunta útil es otra:

- **cómo hacemos para que un mensaje problemático salga del flujo principal y quede en una cola separada**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- definir una dead letter queue para `OrderCreated`,
- enlazarla de forma razonable al flujo principal,
- preparar el consumidor para que mensajes fallidos terminen ahí,
- y dejar visible una primera capa de manejo más maduro de errores en mensajería.

---

## Paso 1 · Definir la cola de errores

A esta altura del curso, una convención clara y didáctica puede ser algo como:

- queue principal: `notifications.order-created.queue`
- dead letter queue: `notifications.order-created.dlq`

No hace falta todavía una taxonomía gigantesca.

La idea central es otra:

- que exista un destino explícito y visible para los mensajes que el flujo principal no puede procesar bien.

Ese criterio mejora muchísimo la claridad del bloque.

---

## Paso 2 · Entender qué relación tiene la DLQ con la cola principal

Este punto importa muchísimo.

La dead letter queue no reemplaza a la cola principal.  
Hace otra cosa:

- recibe los mensajes que ya no deberían seguir circulando normalmente por el flujo principal bajo cierto criterio de fallo.

Eso significa que ahora el sistema ya no solo consume mensajes.  
También empieza a distinguir entre:

- mensajes sanos
- y mensajes problemáticos

Ese salto es uno de los corazones prácticos de toda la clase.

---

## Paso 3 · Preparar el enrutamiento hacia la DLQ

A esta altura del bloque, una estrategia conceptual razonable suele ser:

- la cola principal queda configurada para dead-lettering,
- y los mensajes que no se procesan correctamente terminan siendo enviados a una exchange/queue específica de errores.

No hace falta todavía abrir todas las variantes posibles de configuración.

La meta de hoy es más concreta:

- que exista una primera ruta real para aislar mensajes fallidos.

---

## Paso 4 · Forzar un fallo controlado en `notification-service`

Para el laboratorio, una decisión muy útil puede ser forzar un caso controlado donde `notification-service` falle al procesar `OrderCreated`.

Por ejemplo:

- lanzar una excepción ante una condición de prueba,
- o fallar temporalmente un mensaje específico del laboratorio.

No estamos diciendo que esta sea la lógica final de producción.

La idea es otra:

- construir un escenario visible,
- reproducible,
- y útil para comprobar que la DLQ realmente entra en juego.

Ese matiz importa muchísimo.

---

## Paso 5 · Ejecutar el flujo y observar el desvío

Ahora volvé a crear una orden o a disparar el flujo equivalente.

La idea es observar algo muy concreto:

- `order-service` publica,
- `notification-service` no logra procesar,
- y el mensaje termina saliendo del flujo principal hacia la dead letter queue.

Ese recorrido es el corazón práctico de toda la clase.

---

## Paso 6 · Verificar en RabbitMQ

Ahora conviene revisar en RabbitMQ que:

- la cola principal no queda trabada indefinidamente por ese mensaje,
- la DLQ existe,
- y el mensaje problemático efectivamente termina separado ahí.

No hace falta todavía un análisis súper profundo.

La meta de hoy es más concreta:

- comprobar que el sistema ya distingue y aísla mensajes fallidos de una forma explícita.

Ese momento vale muchísimo.

---

## Paso 7 · Entender qué cambia realmente con este paso

Conviene leerlo con calma.

Antes:

- si el consumidor fallaba,
- el sistema tenía una postura bastante más frágil o difusa frente al mensaje problemático.

Ahora, en cambio, además ya existe algo mucho más serio:

- el mensaje puede salir del flujo principal,
- no bloquear al resto,
- y quedar visible en un lugar separado para tratamiento posterior.

Ese cambio parece chico, pero conceptualmente es enorme.

---

## Paso 8 · Pensar por qué esto mejora muchísimo la robustez del sistema

A esta altura del módulo, conviene hacer una lectura muy concreta:

si un mensaje problemático se mezcla sin control con el flujo sano, la mensajería pierde mucha confiabilidad operativa.

Con una DLQ, en cambio:

- el flujo principal queda más protegido,
- los casos problemáticos se aíslan,
- y el sistema gana una base mucho más madura para operar y diagnosticar.

Ese cambio vale muchísimo.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene toda su estrategia de mensajería robusta resuelta”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una primera dead letter queue real para separar mensajes `OrderCreated` problemáticos del flujo principal.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase agrega una primera dead letter queue para `OrderCreated` en NovaMarket.

Ya no estamos solo publicando y consumiendo mensajes felices.  
Ahora también estamos haciendo que el sistema trate de una forma mucho más madura los mensajes que fallan del lado consumidor.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos todavía este subbloque con un checkpoint fuerte,
- ni definimos todavía toda la política de retries del flujo.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que NovaMarket no trate mensajes fallidos como caos, sino como casos separados y manejables dentro de su arquitectura de eventos.**

---

## Errores comunes en esta etapa

### 1. Pensar que una DLQ es solo “otra cola”
En realidad cambia bastante la robustez operativa del flujo.

### 2. No provocar un fallo controlado para verificar la ruta
El laboratorio necesita un caso visible.

### 3. Mezclar mensajes sanos y fallidos sin estrategia clara
Eso vuelve muy frágil a la mensajería.

### 4. Creer que esta clase ya resuelve toda la confiabilidad del sistema basado en eventos
Todavía estamos en una primera capa.

### 5. No revisar que el mensaje realmente termina aislado
La verificación distribuida sigue siendo parte central del valor de la clase.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- existe una DLQ real para `OrderCreated`,
- un mensaje fallido puede salir del flujo principal,
- y NovaMarket ya dio un primer paso serio hacia una mensajería asíncrona más robusta.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- la cola de mensajes fallidos ya existe,
- el sistema puede separar mensajes problemáticos del flujo principal,
- entendés qué robustez nueva gana la arquitectura con este paso,
- y sentís que NovaMarket ya dejó de tener solo flujo feliz para empezar a manejar mejor los errores asíncronos.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta nueva capa del módulo 13.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de dead letter queue antes de decidir cómo seguir profundizando mensajería y eventos dentro de NovaMarket.

---

## Cierre

En esta clase agregamos una primera dead letter queue para `OrderCreated` en NovaMarket.

Con eso, el proyecto deja de tratar los fallos de consumo como un problema difuso o desordenado y empieza a sostener una forma mucho más robusta, mucho más operable y mucho más madura de separar mensajes problemáticos dentro de su arquitectura basada en eventos.
