---
title: "Entendiendo por qué el escalado ya tiene sentido"
description: "Inicio del siguiente refinamiento del bloque de Kubernetes en NovaMarket. Comprensión de por qué, después de consolidar salud y recursos, ya conviene empezar a pensar en escalado."
order: 110
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Entendiendo por qué el escalado ya tiene sentido

En las últimas clases del bloque de Kubernetes fuimos madurando bastante el entorno de NovaMarket:

- reconstruimos una parte muy importante del sistema dentro del cluster,
- mejoramos la entrada,
- externalizamos configuración,
- incorporamos `readiness` y `liveness`,
- y además empezamos a definir una política más seria de recursos con `requests` y `limits`.

Eso ya deja al entorno bastante mejor parado que al comienzo del módulo.

Y justamente por eso ahora aparece otra pregunta muy natural:

**si el cluster ya sabe mejor qué servicios viven, cuándo están listos y qué recursos necesitan, cuándo tiene sentido pensar en escalado?**

Ese es el terreno de esta clase.

Porque una cosa es tener un `Deployment` con una sola réplica funcionando correctamente.  
Y otra muy distinta es empezar a pensar qué pasa cuando queremos que una pieza del sistema:

- tolere mejor carga,
- soporte más tráfico,
- o tenga más de una instancia disponible dentro del cluster.

Ese es exactamente el paso siguiente de madurez que vamos a empezar a trabajar.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué el escalado ya tiene sentido en este punto del bloque,
- entendida la diferencia entre tener una sola réplica y empezar a pensar en múltiples instancias,
- alineado el modelo mental del curso para introducir replicas y luego autoscaling,
- y preparado el terreno para aplicar este refinamiento a NovaMarket en las próximas clases.

Todavía no vamos a crear un `HPA`.  
La meta de hoy es entender por qué este nuevo tema ya aparece de forma natural dentro del roadmap.

---

## Estado de partida

Partimos de un cluster donde ya existe una reconstrucción bastante rica de NovaMarket:

- núcleo base
- servicios funcionales
- gateway
- `Ingress`
- configuración externalizada
- probes
- y una política inicial de recursos en piezas importantes

Eso significa que el entorno ya dejó atrás la etapa de “simplemente lograr que el sistema viva”.

Ahora empieza a tener sentido pensar:

- cómo responde ese sistema si necesita crecer
- y cómo queremos que el cluster participe en ese crecimiento

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué problema aparece cuando una sola réplica ya no alcanza como modelo mental suficiente,
- entender por qué `requests` y `limits` preparan muy bien este siguiente paso,
- distinguir entre escalado manual y escalado más dinámico,
- y dejar clara la secuencia que vamos a usar en NovaMarket.

---

## Qué problema queremos resolver exactamente

Cuando el entorno todavía es muy inmaduro, pensar en escalado demasiado pronto suele ser una distracción.

Pero cuando el sistema ya:

- vive bastante bien dentro del cluster,
- tiene configuración más ordenada,
- cuenta con probes,
- y empieza a tener recursos definidos,

entonces la pregunta por el escalado deja de ser prematura y pasa a ser muy razonable.

Porque a esta altura ya podemos preguntarnos cosas como:

- ¿tiene sentido que ciertas piezas sigan con una sola réplica?
- ¿qué servicios merecen crecer antes que otros?
- ¿cómo impacta eso en la entrada del sistema?
- ¿y qué rol debería jugar Kubernetes si la carga cambia?

Ese es el tipo de pregunta que abre esta etapa.

---

## Por qué este paso tiene sentido justamente ahora

Porque el bloque ya construyó varias bases previas sin las cuales hablar de escalado sería mucho menos útil.

Por ejemplo:

- ya tenemos servicios funcionando de verdad en el cluster,
- ya tenemos una capa de entrada usable,
- ya validamos flujos importantes,
- y además ya definimos una primera política de recursos.

Todo eso hace que el tema del escalado no aparezca en el vacío, sino apoyado sobre un entorno que ya tiene bastante sustancia.

---

## Qué significa escalar en este contexto

Para esta etapa del curso práctico, conviene pensarlo de una forma simple:

**escalar significa dejar de asumir que una única instancia del servicio es siempre suficiente.**

Eso puede expresarse primero de forma bastante directa:

- aumentar la cantidad de réplicas

Y más adelante de una forma más sofisticada:

- dejar que el cluster ajuste esa cantidad según ciertas señales

No hace falta entrar todavía en el detalle técnico.  
Lo importante es fijar esta idea base.

---

## Paso 1 · Entender por qué “una réplica” no siempre es la única forma razonable

Hasta ahora, usar una sola réplica estuvo perfecto para:

- aprender,
- avanzar rápido,
- y no meter demasiadas variables a la vez.

Pero a medida que el sistema madura, una sola réplica empieza a quedar corta como modelo mental único.

No porque siempre esté mal.  
Sino porque deja de ser la única posibilidad interesante cuando el entorno ya está mucho más armado.

---

## Paso 2 · Pensar qué servicios conviene escalar primero

No todos los servicios del sistema tienen exactamente la misma prioridad para este refinamiento.

A esta altura del bloque, algunos candidatos muy naturales para empezar a pensar en escalado son:

- `api-gateway`
- `order-service`

¿Por qué?

Porque son piezas donde el tráfico y el peso funcional del sistema suelen sentirse más directamente.

También podrían entrar otras piezas más adelante, pero para una primera iteración conviene empezar por servicios donde el valor del escalado sea fácil de justificar.

---

## Paso 3 · Conectar esto con `requests` y `limits`

Este punto vale muchísimo.

Las clases anteriores no fueron un refinamiento aislado.

`requests` y `limits` preparan muy bien el terreno para hablar de escalado porque le dan al cluster una base mejor para interpretar:

- qué recursos necesita una pieza,
- y cómo se comporta esa pieza dentro del entorno

Eso significa que el bloque está subiendo por capas bastante coherentes:

1. desplegar  
2. configurar  
3. endurecer salud  
4. definir recursos  
5. pensar escalado  

Esa secuencia importa mucho.

---

## Paso 4 · Distinguir escalado manual de escalado más dinámico

A esta altura conviene instalar otra distinción muy importante.

### Escalado manual
Cambiar la cantidad de réplicas de un `Deployment` de forma explícita.

### Escalado más dinámico
Dejar que Kubernetes ajuste la cantidad de réplicas apoyándose en señales del sistema.

Para este curso, lo más sano es empezar por lo primero y luego avanzar hacia lo segundo.

No hace falta saltar directamente a la forma más sofisticada si todavía no consolidamos la base.

---

## Paso 5 · Entender por qué esto no reemplaza otras capas del bloque

Escalar no arregla por sí solo otros problemas.

No reemplaza:

- buena configuración
- probes bien pensadas
- política de recursos razonable
- ni una arquitectura funcional sana

Lo que hace es apoyarse sobre todo eso.

Este punto es importante porque mantiene el roadmap en orden y evita tratar el escalado como una solución mágica.

---

## Paso 6 · Pensar qué todavía no estamos haciendo

Conviene dejar esto muy claro.

En esta etapa del bloque todavía no estamos:

- afinando una estrategia completa de alta disponibilidad de producción
- ni construyendo políticas complejas de escalado desde el primer momento
- ni entrando todavía a tuning avanzado por métricas reales

La meta actual es mucho más concreta:

**entender por qué ya tiene sentido pasar de la réplica única a una lógica más madura de escalado.**

---

## Qué estamos logrando con esta clase

Esta clase no crea todavía réplicas adicionales ni un `HorizontalPodAutoscaler`, pero hace algo muy importante:

**prepara el siguiente refinamiento fuerte del bloque de Kubernetes.**

Ahora el foco ya no está solo en que el servicio viva, esté sano y tenga recursos razonables.

También empieza a importar:

- cuántas instancias conviene sostener
- y cómo queremos que el cluster acompañe ese crecimiento

Eso es una subida importante de nivel.

---

## Qué todavía no hicimos

Todavía no:

- ajustamos réplicas en los `Deployment`
- ni introdujimos un `HPA`
- ni validamos comportamiento de escalado dentro del cluster

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué el escalado ya tiene sentido ahora.**

---

## Errores comunes en esta etapa

### 1. Pensar en escalado demasiado pronto
Ahora tiene sentido porque el entorno ya está bastante maduro.

### 2. Creer que escalar resuelve por sí solo problemas de configuración o salud
En realidad se apoya sobre lo que ya construimos.

### 3. Querer saltar directamente al autoscaling sin entender antes la lógica de réplicas
Conviene respetar la secuencia del bloque.

### 4. Tratar todos los servicios como si merecieran el mismo nivel de escalado
Conviene empezar por piezas más críticas.

### 5. No conectar este tema con `requests` y `limits`
Ese enlace es una de las claves del momento actual del roadmap.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para empezar a pensar en escalado dentro de Kubernetes y cuál va a ser la secuencia más razonable para introducirlo.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés por qué una sola réplica ya no tiene por qué ser el único modelo mental del bloque,
- distinguís escalado manual de escalado más dinámico,
- ves por qué `requests` y `limits` preparan muy bien este siguiente paso,
- e identificás qué piezas del sistema conviene tocar primero.

Si eso está bien, ya podemos pasar a ajustar réplicas y empezar a preparar la capa de autoscaling.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a trabajar con réplicas en servicios importantes de NovaMarket y dejar lista la base para introducir `HPA`.

Ese será el primer paso concreto hacia una política de escalado más madura dentro del cluster.

---

## Cierre

En esta clase entendimos por qué el escalado ya tiene sentido en NovaMarket dentro de Kubernetes.

Con eso, el bloque queda listo para seguir profesionalizando el entorno y pasar de un cluster funcional, sano y mejor configurado a uno que también empieza a pensar en crecimiento y elasticidad de sus piezas más importantes.
