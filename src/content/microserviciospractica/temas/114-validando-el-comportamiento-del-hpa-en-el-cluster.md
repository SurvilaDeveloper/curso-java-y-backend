---
title: "Validando el comportamiento del HPA en el cluster"
description: "Checkpoint del escalado dinámico en Kubernetes. Verificación del comportamiento del HorizontalPodAutoscaler dentro del entorno de NovaMarket."
order: 114
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Validando el comportamiento del `HPA` en el cluster

En la clase anterior dimos un paso muy importante dentro del bloque:

- creamos el primer `HorizontalPodAutoscaler`,
- lo conectamos a una pieza importante del sistema,
- y dejamos al cluster con una política explícita de escalado dinámico.

Eso ya tiene muchísimo valor.

Pero ahora toca el checkpoint natural de ese avance:

**validar el comportamiento del `HPA` dentro del cluster.**

Porque una cosa es tener el recurso creado.  
Y otra distinta es comprobar que el entorno ya se comporta de una forma diferente gracias a esa nueva capa de escalado.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- el `HPA` existe y está correctamente vinculado a su `Deployment`,
- el cluster ya interpreta esa política de escalado,
- y NovaMarket entra en una nueva etapa donde ciertas piezas ya no viven solo con réplicas fijas, sino con un rango dinámico de crecimiento posible.

No hace falta todavía hacer una simulación de producción ni un benchmarking complejo.  
La meta de hoy es observar y comprender el comportamiento operativo del autoscaling dentro del entorno.

---

## Estado de partida

Partimos de un cluster donde ya tenemos:

- un servicio importante con más de una réplica posible,
- un `HPA` aplicado,
- probes
- y una política inicial de recursos que sirve de base para el escalado

Eso significa que ya existen los ingredientes necesarios para observar algo nuevo dentro del entorno:  
**una política que puede modificar la cantidad de Pods de forma dinámica.**

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el recurso `HPA`,
- confirmar su vínculo con el `Deployment`,
- observar el estado del servicio,
- y validar que el cluster ya tiene una nueva capa de comportamiento operativo.

---

## Qué queremos observar realmente

No queremos quedarnos solo con “el recurso existe”.

Queremos mirar algo más interesante:

- si el cluster entiende el rango de réplicas
- si la pieza objetivo ya está bajo una política dinámica
- y cómo cambia el modelo mental del entorno respecto de la etapa anterior de escalado manual

Ese es el verdadero valor de la clase.

---

## Paso 1 · Verificar que el `HPA` existe

Primero conviene comprobar que el recurso realmente está presente en el namespace `novamarket`.

Esto parece básico, pero es importante porque el resto del análisis solo tiene sentido si el `HPA` ya forma parte real del estado del cluster.

---

## Paso 2 · Verificar a qué `Deployment` apunta

Ahora revisá que el `HPA` esté efectivamente ligado a la pieza correcta, por ejemplo:

- `api-gateway`
- o el servicio que elegiste en la clase anterior

Queremos confirmar que la política dinámica de escalado no quedó apuntando a otro recurso ni mal vinculada dentro del entorno.

---

## Paso 3 · Revisar el rango definido

Ahora mirá con atención los valores de:

- `minReplicas`
- `maxReplicas`

La idea es confirmar que el servicio ya no queda anclado a un único número fijo, sino a un intervalo razonable dentro del cual el cluster podría actuar.

Ese cambio de modelo mental es uno de los aprendizajes más importantes de esta etapa.

---

## Paso 4 · Revisar las métricas o la señal base elegida

En la clase anterior instalamos el `HPA` apoyándonos en una señal simple y razonable, como la utilización de CPU.

Ahora conviene revisar que esa base siga siendo coherente con el servicio que elegimos y con la etapa del curso en la que estamos.

No hace falta todavía buscar una calibración perfecta.  
La prioridad es entender y validar el patrón.

---

## Paso 5 · Revisar el `Deployment` objetivo

Ahora mirá el `Deployment` al que apunta el `HPA`.

Queremos observar que:

- el servicio sigue sano
- las réplicas mínimas siguen teniendo sentido
- y el entorno ya tiene una relación clara entre la definición del despliegue y la política dinámica que lo acompaña

Este encastre es muy importante para entender la lógica del bloque.

---

## Paso 6 · Observar el estado de los Pods del servicio

Ahora revisá los Pods del servicio escalable.

La idea es confirmar que:

- existen dentro del rango esperado
- siguen sanos
- y el entorno ya puede pensar esa pieza no solo como un Pod o un número fijo de Pods, sino como una unidad que puede crecer dentro de ciertos márgenes

Ese cambio es muy valioso.

---

## Paso 7 · Pensar qué cambió respecto del escalado manual

Este punto importa muchísimo.

Con escalado manual pensábamos algo como:

- “este servicio tiene 2 réplicas”

Ahora, en cambio, la lectura cambia a algo como:

- “este servicio tiene una base de réplicas, pero el cluster podría ajustarlas dentro del rango permitido”

Ese cambio de lenguaje marca muy bien la diferencia entre una etapa y otra del bloque.

---

## Paso 8 · Validar una señal funcional del sistema

Después de revisar el estado del `HPA`, conviene verificar que el servicio objetivo siga comportándose razonablemente bien.

No hace falta todavía una prueba de carga compleja.

Con una validación funcional simple ya alcanza para confirmar que este nuevo refinamiento no rompió la operación básica del sistema.

---

## Paso 9 · Entender qué todavía no estamos buscando

Conviene dejar esto bien claro.

En esta etapa no estamos todavía buscando:

- una gran demostración de performance
- ni una simulación intensiva de tráfico
- ni una estrategia definitiva de escalado para producción

La meta actual es mucho más concreta:

**validar que el cluster ya cuenta con una política de autoscaling real y entender cómo cambia eso la operación del entorno.**

---

## Paso 10 · Pensar qué tan importante es este cambio para el bloque

A esta altura del roadmap, el cluster ya no solo:

- despliega
- configura
- enruta
- y sostiene salud

Ahora también empieza a tener una política más madura de crecimiento dinámico.

Eso significa que el bloque ya se acerca mucho más a una operación realmente propia del mundo Kubernetes.

---

## Qué estamos logrando con esta clase

Esta clase convierte al `HPA` en algo observable y comprensible dentro del entorno.

Ya no es solo “otro recurso más” escrito en YAML.  
Ahora empieza a formar parte real de la forma en que el cluster interpreta y sostiene una pieza importante del sistema.

Eso es un salto fuerte de madurez.

---

## Qué todavía no hicimos

Todavía no:

- extendimos `HPA` a otras piezas
- ni consolidamos todavía esta nueva etapa del escalado como checkpoint del bloque

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**validar que el primer `HPA` ya cambió el modelo operativo de una pieza importante dentro del cluster.**

---

## Errores comunes en esta etapa

### 1. Mirar solo que el recurso exista y no pensar qué significa operativamente
La clase vale por el cambio de modelo mental del entorno.

### 2. Esperar una gran demostración de carga desde la primera iteración
No hace falta para capturar el valor del paso.

### 3. Confundir el `HPA` con una sustitución total del `Deployment`
En realidad lo complementa.

### 4. No revisar el rango definido
Esa es una de las piezas más importantes del comportamiento.

### 5. Pensar que esta clase ya cierra toda la estrategia de escalado
Todavía estamos en una primera versión razonable y didáctica.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías haber validado que el primer `HPA` ya forma parte real de NovaMarket dentro del cluster y que el entorno ahora piensa al menos una de sus piezas importantes con una política dinámica de escalado.

Eso deja muy bien preparado el siguiente checkpoint.

---

## Punto de control

Antes de seguir, verificá que:

- el `HPA` existe,
- apunta al servicio correcto,
- el rango de escalado es razonable,
- el servicio sigue sano,
- y entendés por qué este paso cambia de verdad la forma en que el cluster sostiene esa pieza.

Si eso está bien, ya podemos consolidar esta nueva etapa del bloque.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a consolidar la estrategia inicial de escalado de NovaMarket dentro de Kubernetes y a revisar qué tan madura ya es esta capa del entorno.

---

## Cierre

En esta clase validamos el comportamiento del primer `HPA` dentro del cluster.

Con eso, NovaMarket ya no solo tiene una parte muy importante del sistema reconstruida, sana y mejor configurada dentro de Kubernetes: también empieza a contar con una política real de escalado dinámico sobre una de sus piezas más relevantes.
