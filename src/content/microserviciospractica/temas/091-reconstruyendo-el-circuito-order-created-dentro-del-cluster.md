---
title: "Reconstruyendo el circuito order.created dentro del cluster"
description: "Hito principal del bloque de Kubernetes. Validación del circuito asincrónico entre order-service y notification-service dentro del cluster de NovaMarket."
order: 91
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Reconstruyendo el circuito `order.created` dentro del cluster

En las clases anteriores del bloque de Kubernetes fuimos reconstruyendo el sistema por capas:

- primero el núcleo base
- después la primera capa funcional del negocio
- luego `order-service`
- y finalmente `notification-service`

Eso ya dejó al cluster con una parte muy importante de NovaMarket viviendo dentro del nuevo entorno.

Ahora toca uno de los hitos más fuertes de todo este tramo:

**reconstruir y validar el circuito `order.created` dentro del cluster.**

¿Por qué es tan importante?

Porque este circuito no representa solo un servicio aislado.  
Representa algo mucho más interesante:

- lógica de negocio
- publicación de evento
- consumo asincrónico
- persistencia de resultado

Es decir, una parte muy rica del comportamiento real del sistema.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- `order-service` puede vivir dentro del cluster y disparar el flujo de negocio correspondiente,
- `notification-service` puede reaccionar dentro del mismo entorno,
- y el circuito asincrónico `order.created` ya puede reconstruirse dentro de Kubernetes.

Esto marca uno de los hitos más importantes del bloque.

---

## Estado de partida

Partimos de un cluster donde ya viven:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`

Y además, en el proyecto original ya veníamos trabajando el circuito asincrónico de órdenes usando RabbitMQ.

Lo que toca ahora es comprobar que esa lógica ya puede sostenerse también dentro del entorno Kubernetes que venimos construyendo.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el estado de las piezas involucradas,
- validar el circuito desde `order-service`,
- observar el resultado en `notification-service`,
- y confirmar que el cluster ya aloja una parte muy significativa del comportamiento real del sistema.

---

## Por qué esta clase vale tanto

Porque hasta ahora ya habíamos demostrado que Kubernetes podía alojar:

- servicios base
- servicios funcionales
- y el núcleo del flujo principal

Pero esta clase suma algo más profundo:

**la reconstrucción de un comportamiento distribuido real del sistema.**

No estamos validando solo que “los servicios arrancan”.  
Estamos validando que una parte importante del negocio sigue viva dentro del cluster.

---

## Paso 1 · Verificar el estado de los servicios involucrados

Antes de probar el circuito, conviene revisar al menos:

- `order-service`
- `notification-service`
- `inventory-service`

La idea es confirmar que las piezas involucradas en el recorrido están arriba y no muestran problemas obvios antes de activar la prueba.

---

## Paso 2 · Revisar también el broker o la infraestructura asincrónica involucrada

Si dentro de tu estrategia del bloque ya estás apoyándote en un broker disponible para el entorno Kubernetes o en una transición controlada desde la infraestructura del bloque anterior, este es un gran momento para comprobar que esa pieza también está viva.

La idea es que el circuito asincrónico tenga un suelo firme antes de empezar a probar el recorrido.

---

## Paso 3 · Recordar el mapa del circuito

Antes de lanzar cualquier prueba, conviene recordar conceptualmente qué queremos validar:

1. se crea la orden  
2. `order-service` publica `order.created`  
3. el mensaje se enruta  
4. `notification-service` consume  
5. persiste la notificación  
6. el resultado queda observable  

Este mapa mental ayuda muchísimo a leer mejor lo que pase durante la prueba.

---

## Paso 4 · Disparar una orden válida dentro del entorno

Ahora generá una orden válida del mismo modo que venías haciendo en los bloques anteriores, pero observando ahora el comportamiento del sistema dentro del nuevo entorno orquestado.

No hace falta que el mecanismo de prueba sea radicalmente distinto al que ya venías usando.  
Lo importante es que esa orden active el flujo real del negocio y del evento asincrónico.

---

## Paso 5 · Revisar logs de `order-service`

Ahora mirá `order-service`.

Queremos observar que:

- el servicio recibe el request o la acción esperada,
- la lógica central del negocio avanza razonablemente,
- y el evento `order.created` forma parte del recorrido esperado.

No hace falta todavía buscar una traza perfecta de todos los detalles.  
Queremos confirmar que la pieza central del circuito se comporta como esperamos dentro del cluster.

---

## Paso 6 · Revisar logs de `notification-service`

Este es uno de los puntos más importantes de la clase.

Queremos ver que `notification-service`:

- reciba el evento,
- procese el mensaje,
- y deje evidencia de que el circuito asincrónico se cerró correctamente.

Este paso es justamente el que transforma la clase en un hito del bloque.

---

## Paso 7 · Verificar la persistencia o el resultado visible

Según cómo hayas venido trabajando `notification-service` en el proyecto, este es un muy buen momento para validar el resultado final observable del circuito.

Por ejemplo, consultar el endpoint correspondiente de notificaciones o cualquier mecanismo equivalente que ya hubieras usado antes para verificar el resultado del flujo asincrónico.

Lo importante es cerrar el recorrido completo:

- no solo logs,
- también evidencia final del procesamiento.

---

## Paso 8 · Comparar con el mismo circuito fuera de Kubernetes

Este punto es muy valioso.

Ya conocíamos este circuito en el mundo previo del curso:

- primero de forma local
- después en Compose
- y ahora dentro de Kubernetes

La pregunta interesante es:

**¿qué significa que ahora también viva dentro del cluster?**

La respuesta razonable es algo así:

- el bloque de Kubernetes ya no aloja solo servicios
- también empieza a alojar comportamiento real del negocio

Ese cambio de nivel vale muchísimo.

---

## Paso 9 · Pensar qué parte del sistema ya quedó reconstruida dentro del cluster

A esta altura, dentro de Kubernetes ya tenemos:

### Núcleo base
- `config-server`
- `discovery-server`

### Servicios funcionales
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`

### Comportamiento validado
- el circuito asincrónico `order.created`

Eso ya es una porción muy importante de NovaMarket.

Este es uno de los momentos donde el bloque se vuelve realmente contundente.

---

## Paso 10 · Identificar qué sigue faltando para una reconstrucción todavía más completa

También conviene ser explícitos con lo que todavía no cerramos del todo:

- la capa completa de entrada con gateway dentro del cluster
- algunas piezas de observabilidad más ricas del nuevo entorno
- y otras partes del ecosistema que todavía pueden requerir integración o refinamiento

Eso está bien.  
El valor de esta clase no está en “terminar todo”, sino en llegar a un hito suficientemente fuerte y muy significativo.

---

## Qué estamos logrando con esta clase

Esta clase demuestra que el bloque de Kubernetes ya no se limita a alojar microservicios de manera aislada.

Ahora también puede sostener una parte distribuida y asincrónica del comportamiento real del sistema.

Eso es un salto enorme en la madurez del bloque.

---

## Qué todavía no hicimos

Todavía no:

- cerramos toda la exposición externa del sistema vía gateway en Kubernetes
- consolidamos el stack completo al mismo nivel que el de Compose
- ni afinamos todavía una operación más avanzada del nuevo entorno

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**demostrar que el circuito `order.created` ya puede vivir dentro del cluster.**

---

## Errores comunes en esta etapa

### 1. Mirar solo que los Pods están arriba y no validar el circuito real
Esta clase existe justamente para validar comportamiento.

### 2. No revisar logs de ambos lados del flujo
`order-service` y `notification-service` cuentan partes distintas de la historia.

### 3. No buscar evidencia final del resultado del procesamiento
El circuito tiene que cerrar, no solo “parecer que corrió”.

### 4. Esperar que esta clase cierre todo el sistema en Kubernetes
Todavía estamos consolidando por capas.

### 5. Perder de vista el valor arquitectónico del paso
Acá ya no estamos validando solo despliegue, sino comportamiento distribuido real.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías haber comprobado que el circuito `order.created` puede reconstruirse dentro del cluster con las piezas principales de NovaMarket ya desplegadas en Kubernetes.

Eso representa uno de los hitos más importantes de todo este bloque.

---

## Punto de control

Antes de seguir, verificá que:

- `order-service` está arriba,
- `notification-service` también,
- el circuito `order.created` se dispara,
- hay evidencia de consumo y resultado,
- y sentís que el cluster ya aloja una parte muy significativa del comportamiento real del sistema.

Si eso está bien, entonces el bloque de Kubernetes ya alcanzó uno de sus primeros grandes hitos.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a pensar cómo llevar también el gateway al cluster para acercarnos todavía más a una reconstrucción completa del entorno principal de NovaMarket dentro de Kubernetes.

---

## Cierre

En esta clase reconstruimos el circuito `order.created` dentro del cluster.

Con eso, NovaMarket ya no solo tiene servicios del negocio desplegados en Kubernetes: también empieza a demostrar que puede sostener dentro del nuevo entorno una parte realmente importante, distribuida y asincrónica del comportamiento del sistema.
