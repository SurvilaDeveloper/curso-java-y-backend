---
title: "Consolidando la estrategia inicial de escalado"
description: "Checkpoint del refinamiento de escalado en Kubernetes. Revisión de cómo queda NovaMarket después de introducir réplicas múltiples y un primer HPA dentro del cluster."
order: 115
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Consolidando la estrategia inicial de escalado

En las últimas clases del bloque de Kubernetes dimos otro salto fuerte de madurez:

- entendimos por qué el escalado ya tenía sentido,
- ajustamos réplicas en servicios importantes,
- entendimos por qué `HPA` ya tenía sentido,
- y además creamos y validamos el primer `HorizontalPodAutoscaler` del entorno.

Eso ya deja al cluster en un punto bastante interesante.

Ahora conviene hacer algo muy importante antes de seguir avanzando hacia nuevos refinamientos:

**consolidar la estrategia inicial de escalado.**

Porque una cosa es sumar:

- varias réplicas
- y un primer `HPA`

Y otra distinta es detenerse a mirar qué cambió realmente en la madurez del entorno gracias a esas decisiones.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- el cluster ya sostiene piezas importantes con más de una réplica,
- al menos una de esas piezas ya tiene una política dinámica de crecimiento,
- NovaMarket se siente más maduro también desde el punto de vista del escalado,
- y el bloque queda listo para seguir refinando el entorno sobre una base mucho más seria.

Esta clase funciona como checkpoint fuerte del tramo de escalado inicial del módulo.

---

## Estado de partida

Partimos de un cluster donde ya existen muchas capas de madurez acumuladas:

- servicios funcionales importantes
- acceso por `Ingress`
- configuración externalizada
- probes
- política inicial de recursos
- varias réplicas en piezas críticas
- y un primer `HPA`

Eso significa que el entorno ya no solo es funcional y más sano, sino que también empieza a pensar el crecimiento de forma más rica.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar las piezas que ya están escaladas,
- mirar cómo conviven réplicas fijas y escalado dinámico,
- validar que el sistema sigue comportándose razonablemente bien,
- y consolidar esta nueva etapa del bloque antes de pasar a otros refinamientos.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si hay más Pods”.

Queremos observar algo más valioso:

- si el entorno ya piensa algunas piezas con una base mínima más robusta
- si el cluster ya tiene margen para actuar dinámicamente sobre al menos una de ellas
- y si NovaMarket ya se siente menos anclado al modelo de instancia única

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Revisar qué piezas importantes ya tienen más de una réplica

Primero conviene identificar claramente qué servicios del sistema ya dejaron atrás el modelo de una sola instancia.

Por ejemplo:

- `api-gateway`
- `order-service`

o los que hayas elegido en las clases anteriores.

La idea es mirar el conjunto de piezas donde el cluster ya sostiene una forma más madura de disponibilidad y capacidad.

---

## Paso 2 · Revisar cuál de esas piezas ya tiene `HPA`

Ahora identificá la pieza sobre la que instalaste el primer `HorizontalPodAutoscaler`.

Queremos observar que ya existe una diferencia dentro del entorno entre:

- servicios con réplicas fijas
- y al menos una pieza con una política dinámica de escalado

Ese contraste es muy importante para entender la evolución del bloque.

---

## Paso 3 · Revisar el estado de los Pods en esas piezas

Ahora mirá los Pods correspondientes.

Queremos ver que:

- siguen sanos
- las probes siguen funcionando razonablemente
- las réplicas múltiples no introdujeron inestabilidad
- y la pieza con `HPA` sigue bien integrada al entorno

Este paso es muy importante porque el escalado tiene valor solo si el sistema sigue siendo sano y utilizable.

---

## Paso 4 · Validar una señal funcional del sistema

Como en otros checkpoints del bloque, conviene volver a probar una señal funcional importante del entorno.

Por ejemplo:

- una ruta simple vía gateway
- o una parte del flujo principal que ya venías usando como referencia

La idea es comprobar que el escalado no solo existe en los manifiestos, sino que convive bien con el comportamiento real del sistema.

---

## Paso 5 · Pensar qué cambió en el modelo mental del cluster

A esta altura conviene fijar algo importante:

antes, el sistema ya estaba bastante bien desplegado en Kubernetes, pero muchas piezas seguían pensadas como instancias más bien fijas y aisladas.

Ahora, en cambio, el cluster ya empieza a sostener algunas de las más importantes como servicios que:

- pueden vivir con múltiples instancias
- y, al menos en un caso, pueden crecer dinámicamente dentro de un rango

Ese cambio es una mejora muy fuerte en la madurez del entorno.

---

## Paso 6 · Comparar este estado con el de etapas anteriores del bloque

Si miramos el recorrido completo del módulo, la evolución es muy clara:

### Primero
- desplegar servicios
- validar que vivan

### Después
- reconstruir circuitos importantes
- mejorar entrada
- ordenar configuración

### Luego
- endurecer salud y recursos

### Ahora
- empezar a pensar en crecimiento real del sistema dentro del cluster

Ese recorrido muestra muy bien cómo el bloque subió de nivel sin perder coherencia.

---

## Paso 7 · Entender qué todavía no estamos haciendo

Conviene dejar esto muy claro.

En esta etapa todavía no estamos:

- afinando una estrategia de autoscaling compleja para todo el stack
- ni diseñando una política final de alta disponibilidad de producción
- ni sometiendo el entorno a una simulación seria de carga

Eso está bien.

La meta actual es mucho más concreta:

**consolidar una primera estrategia razonable de escalado dentro del cluster.**

Y eso ya es un paso muy valioso.

---

## Paso 8 · Pensar qué refinamientos quedan mejor preparados después de este punto

Ahora que el entorno ya tiene:

- probes
- recursos
- múltiples réplicas
- y al menos un `HPA`

quedan mejor preparados otros refinamientos del cluster, como por ejemplo:

- observabilidad más rica
- ajustes más finos por servicio
- y capas operativas todavía más maduras

No hace falta elegir el siguiente paso ahora mismo.  
Lo importante es reconocer que el entorno ya alcanzó otro nivel de madurez.

---

## Qué estamos logrando con esta clase

Esta clase consolida otra etapa muy importante del bloque de Kubernetes.

Ya no estamos solo reconstruyendo el sistema y haciéndolo accesible.  
Ahora también estamos empezando a darle una forma más madura de crecer dentro del cluster.

Eso eleva bastante el nivel del entorno.

---

## Qué todavía no hicimos

Todavía no:

- agotamos todas las posibilidades de escalado del sistema
- ni convertimos esta etapa en una estrategia final de producción

Eso puede venir después.

La meta de hoy es mucho más concreta:

**consolidar la primera versión seria de la estrategia de escalado del bloque.**

---

## Errores comunes en esta etapa

### 1. Pensar que por tener un `HPA` ya el tema del escalado está “resuelto”
En realidad recién empieza una etapa más madura.

### 2. Mirar solo el número de Pods y no el cambio conceptual del entorno
La clase vale mucho por esa evolución de modelo mental.

### 3. No volver a validar funcionalidad real del sistema
La madurez operativa siempre tiene que seguir sosteniendo el comportamiento del negocio.

### 4. Tratar todas las piezas como si merecieran el mismo nivel de escalado ya mismo
Conviene seguir aplicando criterio.

### 5. Pasar al siguiente tema sin consolidar este
Eso haría más difícil entender después el nivel real del cluster.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión mucho más clara de cómo quedó NovaMarket dentro del cluster después de introducir múltiples réplicas y un primer `HPA`, y por qué el entorno ya es más maduro también desde el punto de vista del escalado.

Eso deja muy bien preparado el siguiente tramo del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- hay piezas importantes con más de una réplica,
- al menos una tiene `HPA`,
- el entorno sigue sano,
- el sistema mantiene funcionalidad importante,
- y sentís que el cluster ya ganó otra capa de madurez gracias al escalado.

Si eso está bien, entonces NovaMarket ya dio otro salto fuerte dentro de Kubernetes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a pensar el siguiente gran refinamiento del entorno apoyándonos en toda esta base que ya construimos: acceso, configuración, salud, recursos y ahora también escalado.

---

## Cierre

En esta clase consolidamos la estrategia inicial de escalado de NovaMarket dentro de Kubernetes.

Con eso, el bloque ya no solo tiene una parte muy importante del sistema reconstruida, sana y mejor configurada dentro del cluster: también empieza a sostenerla con una lógica de crecimiento mucho más madura y mucho más propia del mundo Kubernetes.
