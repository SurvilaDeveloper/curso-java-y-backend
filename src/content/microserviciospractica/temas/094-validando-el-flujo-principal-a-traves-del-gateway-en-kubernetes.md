---
title: "Validando el flujo principal a través del gateway en Kubernetes"
description: "Checkpoint fuerte del bloque de Kubernetes. Validación del sistema entrando por api-gateway dentro del cluster para confirmar la reconstrucción del flujo principal de NovaMarket."
order: 94
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Validando el flujo principal a través del gateway en Kubernetes

En las clases anteriores del bloque logramos algo muy importante:

- desplegamos las piezas principales del sistema dentro del cluster,
- reconstruimos una parte importante del comportamiento distribuido,
- llevamos `api-gateway` a Kubernetes,
- y además lo dejamos accesible dentro del entorno.

Ahora toca uno de los checkpoints más fuertes de todo este tramo:

**validar el flujo principal entrando por el gateway dentro de Kubernetes.**

¿Por qué importa tanto?

Porque hasta ahora ya habíamos demostrado muchas cosas por separado:

- que los servicios viven en el cluster
- que `order-service` funciona
- que `notification-service` también
- que el circuito `order.created` puede reconstruirse

Pero ahora queremos algo todavía más valioso:

**usar el sistema desde su puerta natural de entrada dentro del nuevo entorno.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- `api-gateway` funciona razonablemente como punto de entrada dentro del cluster,
- el flujo principal del negocio puede recorrerse entrando por esa capa,
- y NovaMarket ya tiene dentro de Kubernetes no solo servicios sueltos o circuitos internos, sino una porción muy significativa del sistema utilizable desde su entrada natural.

Esta clase marca uno de los hitos más fuertes de todo el bloque.

---

## Estado de partida

Partimos de un cluster donde ya viven:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- `api-gateway`

Además:

- el gateway ya fue desplegado,
- y en la clase anterior ya definimos una forma razonable de acceso a él.

Eso significa que ya no falta la puerta de entrada para intentar una validación mucho más seria del sistema.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar que el gateway siga sano y accesible,
- usarlo como punto de entrada real,
- validar rutas importantes del sistema a través de él,
- y confirmar que el entorno de Kubernetes ya aloja una reconstrucción muy significativa del comportamiento principal de NovaMarket.

---

## Por qué esta clase vale tanto

Porque una cosa es validar servicios y circuitos internos dentro del cluster.  
Y otra muy distinta es poder decir:

**“ya puedo entrar al sistema por el gateway también dentro de Kubernetes”.**

Ese cambio es enorme.

Ya no estamos solo hablando de piezas desplegadas.  
Estamos hablando de una experiencia de uso y validación mucho más parecida a la del sistema real.

---

## Paso 1 · Confirmar que el gateway sigue accesible

Antes de probar flujos del negocio, conviene verificar de nuevo que:

- `api-gateway` sigue arriba
- su Service está correcto
- y el mecanismo de exposición elegido en la clase anterior sigue funcionando

No hace falta todavía una prueba compleja.  
Primero queremos asegurarnos de que la puerta de entrada sigue estable.

---

## Paso 2 · Probar una ruta pública simple a través del gateway

Un muy buen punto de partida es usar una ruta sencilla del sistema, por ejemplo una ruta del catálogo si ya forma parte del gateway.

La idea es comprobar que el acceso básico a través del gateway funciona y que ya no estamos hablando solo de una pieza viva, sino de una pieza utilizable.

Este paso es importante porque nos da una señal rápida de salud del recorrido de entrada.

---

## Paso 3 · Pensar qué recorrido queremos validar de verdad

Después de esa prueba inicial, conviene tener claro el mapa del flujo más valioso para esta etapa.

Una lectura razonable sería algo así:

1. entrar por `api-gateway`  
2. alcanzar `order-service`  
3. interactuar con `inventory-service` en el flujo  
4. disparar el evento correspondiente  
5. y eventualmente observar la reacción en `notification-service`

No hace falta que todo explote al máximo en una sola línea de prueba.  
Lo importante es usar el gateway como puerta natural de entrada al sistema.

---

## Paso 4 · Ejecutar una orden válida entrando por el gateway

Ahora sí, conviene probar una orden válida usando el acceso al gateway que definiste en la clase anterior.

La idea es disparar el flujo principal del negocio pasando por:

- gateway
- órdenes
- inventario
- y eventualmente la reacción asincrónica

Este es probablemente uno de los momentos más importantes del bloque.

---

## Paso 5 · Revisar logs de `api-gateway`

Ahora mirá los logs del gateway.

Queremos comprobar que:

- la request llegó correctamente,
- el gateway participó del recorrido,
- y la puerta de entrada del cluster ya está siendo usada como capa real del sistema y no solo como un Service desplegado.

Este paso ayuda muchísimo a reforzar el valor arquitectónico de la clase.

---

## Paso 6 · Revisar logs de `order-service`

Ahora mirá `order-service`.

Queremos ver que:

- recibió el request
- o participó del flujo esperado
- y que la parte central del negocio sigue viva dentro del cluster aun entrando a través del gateway

Este paso es muy importante porque conecta la capa de entrada con el corazón del sistema.

---

## Paso 7 · Revisar también el resultado en `notification-service` si corresponde

Si la orden que acabás de probar dispara el circuito asincrónico que ya veníamos reconstruyendo, este es un gran momento para mirar también `notification-service`.

La idea es confirmar que, entrando por el gateway, el sistema no solo resuelve el request principal, sino que además puede seguir extendiéndose hasta el circuito de evento y reacción dentro del cluster.

Eso tiene muchísimo valor.

---

## Paso 8 · Buscar una evidencia final del resultado del flujo

No alcanza con ver logs.

Conviene que también haya una evidencia final del recorrido, por ejemplo:

- la respuesta de la orden
- el resultado observable del circuito de notificaciones
- o cualquier señal equivalente del flujo completo que ya venías usando en clases anteriores

La idea es cerrar el recorrido de punta a punta.

---

## Paso 9 · Comparar con lo que ya habíamos logrado en Compose

Este punto vale muchísimo.

En Compose ya habíamos logrado una reconstrucción bastante rica del sistema.

Ahora, dentro de Kubernetes, la pregunta importante es:

**¿ya estamos cerca de una experiencia equivalente, pero en el nuevo entorno?**

Y la respuesta, después de esta clase, debería empezar a acercarse bastante a un sí.

Ese contraste da muchísimo contexto al avance real del bloque.

---

## Paso 10 · Pensar qué parte del sistema ya quedó realmente reconstruida dentro del cluster

A esta altura del bloque ya tenemos dentro de Kubernetes:

- núcleo base
- servicios funcionales
- `order-service`
- `notification-service`
- circuito asincrónico
- y acceso vía gateway

Eso ya no es un experimento pequeño.  
Es una reconstrucción muy sustancial del sistema real.

Este es uno de los puntos donde más vale la pena detenerse a mirar el avance logrado.

---

## Qué estamos logrando con esta clase

Esta clase demuestra algo muy fuerte:

**NovaMarket ya no solo puede vivir por piezas dentro del cluster. También empieza a poder usarse entrando por su puerta natural de acceso.**

Ese salto es enorme en términos de madurez del bloque.

---

## Qué todavía no hicimos

Todavía no:

- refinamos una entrada más seria con Ingress
- consolidamos del todo la estrategia de exposición
- ni llevamos todas las piezas complementarias del ecosistema al mismo nivel de madurez en Kubernetes

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**demostrar que el flujo principal puede recorrerse entrando por el gateway dentro del cluster.**

---

## Errores comunes en esta etapa

### 1. Mirar solo que el gateway responde y no recorrer un flujo real
Esta clase vale por el recorrido, no solo por el health.

### 2. No revisar los logs de gateway y de órdenes
Ahí se ve muy bien la transición entre entrada y negocio.

### 3. Olvidarse del resultado final observable del flujo
No alcanza con “parece que corrió”.

### 4. Comparar el resultado con Compose de forma demasiado rígida
Lo importante es la reconstrucción funcional en el nuevo entorno.

### 5. Creer que esta clase ya cierra para siempre todo el bloque
En realidad marca uno de los grandes hitos, pero todavía puede haber refinamientos más adelante.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías haber comprobado que el flujo principal del negocio ya puede validarse entrando por `api-gateway` dentro del entorno Kubernetes.

Eso representa uno de los hitos más fuertes de todo el bloque de orquestación.

---

## Punto de control

Antes de seguir, verificá que:

- el gateway es accesible,
- una ruta pública simple funciona,
- una orden puede dispararse entrando por el gateway,
- hay evidencia del recorrido en los servicios internos,
- y el sistema ya se siente usable desde su capa natural de entrada dentro del cluster.

Si eso está bien, entonces el bloque de Kubernetes ya alcanzó un nivel de reconstrucción realmente importante.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a pensar cómo hacer más madura la exposición de entrada del sistema en Kubernetes, avanzando desde una solución simple hacia una capa más rica de acceso.

---

## Cierre

En esta clase validamos el flujo principal de NovaMarket entrando por `api-gateway` dentro del entorno Kubernetes.

Con eso, el proyecto ya no solo tiene dentro del cluster una parte importante de su lógica: también empieza a ser utilizable desde su puerta natural de entrada en el nuevo entorno de orquestación.
