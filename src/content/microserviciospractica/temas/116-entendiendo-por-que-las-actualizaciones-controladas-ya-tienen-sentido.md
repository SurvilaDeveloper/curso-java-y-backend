---
title: "Entendiendo por qué las actualizaciones controladas ya tienen sentido"
description: "Inicio del siguiente refinamiento del bloque de Kubernetes en NovaMarket. Comprensión de por qué, después de consolidar salud, recursos y escalado, ya conviene pensar en estrategias controladas de actualización."
order: 116
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Entendiendo por qué las actualizaciones controladas ya tienen sentido

En las últimas clases del bloque de Kubernetes llevamos a NovaMarket a un punto bastante más maduro:

- el sistema ya vive de forma importante dentro del cluster,
- consolidamos una capa de salud operativa más rica,
- definimos una política inicial de recursos,
- y además empezamos a pensar el crecimiento del entorno con múltiples réplicas y un primer `HPA`.

Eso ya deja al cluster bastante bien parado.

Pero ahora aparece otra pregunta muy natural:

**si el sistema ya vive, escala y se comporta razonablemente bien dentro de Kubernetes, cómo actualizamos sus servicios sin volver frágil el entorno?**

Ese es el terreno de esta clase.

Porque una cosa es desplegar una versión del servicio y lograr que funcione.  
Y otra muy distinta es pensar qué pasa cuando queremos:

- cambiar la imagen,
- actualizar una pieza importante,
- o reemplazar Pods sin degradar demasiado la operación del sistema.

Ese es exactamente el lugar donde empiezan a importar mucho más:

- las estrategias de actualización
- y el concepto de rollout controlado

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué las actualizaciones controladas ya tienen sentido en este punto del bloque,
- entendida la diferencia entre “cambiar una imagen” y “actualizar un servicio de forma madura”,
- alineado el modelo mental del curso para trabajar con `rolling update`,
- y preparado el terreno para aplicar esta idea a servicios importantes de NovaMarket en las próximas clases.

Todavía no vamos a tocar el manifiesto de un servicio.  
La meta de hoy es entender por qué este nuevo refinamiento aparece ahora y no antes.

---

## Estado de partida

Partimos de un cluster donde ya existe una reconstrucción bastante rica del sistema:

- núcleo base
- servicios funcionales importantes
- gateway
- `Ingress`
- configuración externalizada
- probes
- política de recursos
- y una primera estrategia de escalado

Eso significa que el entorno ya no está en la etapa de “simplemente poner servicios a vivir”.

Ahora empieza a importar con mucha más fuerza otra dimensión del ciclo de vida del sistema:

**cómo evolucionan esas piezas una vez que ya están desplegadas.**

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué problema aparece cuando una actualización se piensa de forma demasiado brusca,
- entender qué aporta una estrategia controlada de reemplazo de Pods,
- conectar esto con las probes y con el escalado que ya construimos,
- y dejar clara la lógica que vamos a aplicar a NovaMarket después.

---

## Qué problema queremos resolver exactamente

Cuando un entorno todavía es muy pequeño o muy inmaduro, actualizar un servicio puede sentirse como algo simple:

- cambiar la imagen,
- reaplicar,
- y listo

Pero cuando el cluster ya aloja una parte importante del sistema, esa mirada empieza a quedarse corta.

Porque ahora conviene preguntarse cosas como:

- ¿qué pasa mientras una versión vieja se reemplaza por otra?
- ¿cómo evitamos una caída brusca?
- ¿cómo se relaciona esto con las probes?
- ¿qué rol juega la cantidad de réplicas?
- ¿y qué tan controlado queda el reemplazo de Pods?

Ese es el tipo de pregunta que abre esta etapa.

---

## Por qué este paso tiene sentido justamente ahora

Porque el bloque ya construyó varias bases previas que hacen que este refinamiento tenga muchísimo más sentido que al principio:

- ya tenemos servicios realmente importantes en el cluster,
- ya tenemos probes para distinguir mejor disponibilidad y salud,
- ya tenemos una base de recursos,
- y en algunos casos también múltiples réplicas o autoscaling.

Todo eso hace que la actualización deje de ser un cambio “ciego” y pase a ser una operación que conviene pensar mucho mejor.

---

## Qué significa actualizar de forma controlada en este contexto

Para esta etapa del curso práctico, una forma útil de pensarlo es esta:

**actualizar de forma controlada significa permitir que el cluster reemplace Pods de una versión por otra sin tratar al despliegue como un corte brusco y binario.**

Eso nos lleva naturalmente a una idea muy importante:

- no todo cambio tiene por qué sentirse como “apagar todo y prender todo”
- Kubernetes puede ayudarnos a hacer ese reemplazo de forma gradual

Ese es uno de los valores más fuertes del entorno.

---

## Paso 1 · Entender por qué “recrear” no es el único modelo mental posible

Si el entorno fuera mucho más simple, podríamos pensar las actualizaciones de forma bastante tosca.

Pero a esta altura del bloque ya no conviene quedarnos con una lógica del tipo:

- tumbo la versión actual
- levanto la nueva
- y espero que todo salga bien

Ahora el cluster ya tiene suficientes herramientas como para pensar algo mejor:

- reemplazo gradual
- lectura de disponibilidad
- y convivencia temporal del cambio dentro de ciertos márgenes

Ese cambio mental es exactamente lo que abre la puerta a `rolling update`.

---

## Paso 2 · Conectar esto con probes y réplicas

Este punto vale muchísimo.

Las probes no fueron un refinamiento aislado.  
Las réplicas tampoco.

Todo eso prepara muy bien el siguiente paso, porque una actualización controlada necesita apoyarse en una idea más madura de:

- cuándo un Pod está listo,
- cuándo una pieza puede recibir tráfico,
- y qué margen tenemos para que convivan instancias viejas y nuevas sin romper el servicio.

Por eso este nuevo tema aparece ahora de forma tan lógica dentro del roadmap.

---

## Paso 3 · Pensar qué servicios conviene usar primero

No todos los servicios merecen exactamente la misma prioridad para inaugurar esta etapa.

A esta altura del bloque, algunos candidatos muy razonables pueden ser:

- `api-gateway`
- `order-service`

¿Por qué?

Porque son piezas importantes, visibles, y donde el valor de una actualización más controlada se entiende mucho mejor.

Conviene empezar donde el aprendizaje sea más claro.

---

## Paso 4 · Entender qué NO estamos buscando todavía

Conviene aclararlo bien.

En este punto del bloque todavía no estamos:

- diseñando una estrategia completa de entregas continuas de producción
- ni resolviendo todos los patrones posibles de despliegue
- ni entrando todavía en variantes más sofisticadas como canary o blue-green

La meta actual es mucho más concreta:

**entender por qué ya conviene dejar atrás una lógica demasiado brusca de actualización y pasar a una estrategia más controlada.**

Eso ya aporta muchísimo valor.

---

## Paso 5 · Pensar en continuidad del servicio, no solo en cambio de imagen

A esta altura del bloque, el lenguaje empieza a cambiar bastante.

Antes podíamos pensar algo como:

- “quiero pasar de una imagen a otra”

Ahora, en cambio, conviene empezar a pensar algo más rico:

- “quiero pasar de una versión a otra manteniendo al entorno lo más sano y utilizable posible”

Ese cambio de lenguaje importa muchísimo, porque muestra que el foco ya no está solo en el artefacto, sino también en la continuidad operativa del sistema.

---

## Paso 6 · Entender que esto no reemplaza lo anterior

Las actualizaciones controladas no reemplazan:

- probes
- configuración madura
- recursos razonables
- escalado
- ni una arquitectura funcional sana

Se apoyan sobre todo eso.

Este punto es muy importante porque mantiene la lógica del bloque bien ordenada y evita tratar el rollout como una solución mágica.

---

## Qué estamos logrando con esta clase

Esta clase no cambia todavía ningún `Deployment`, pero hace algo muy importante:

**prepara el siguiente refinamiento fuerte del bloque de Kubernetes.**

Ahora el foco ya no está solo en que el servicio viva, escale y consuma recursos razonablemente.

También empieza a importar:

- cómo lo actualizamos
- y cómo dejamos que el cluster acompañe ese cambio de una forma más madura

Eso es una mejora fuerte en la calidad operativa del entorno.

---

## Qué todavía no hicimos

Todavía no:

- definimos una estrategia concreta de actualización en un manifiesto
- ni validamos un rollout real dentro del cluster

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué las actualizaciones controladas ya tienen sentido ahora.**

---

## Errores comunes en esta etapa

### 1. Pensar que este tema debería haber aparecido mucho antes
Ahora tiene mucho más sentido gracias a todo lo que ya construimos.

### 2. Creer que actualizar una imagen y hacer un rollout controlado son exactamente lo mismo
En realidad hay una diferencia operativa muy importante.

### 3. No conectar este paso con probes y réplicas
Ese vínculo es una de las claves del momento actual del roadmap.

### 4. Querer entrar directo a estrategias avanzadas
Para esta etapa, `rolling update` es una evolución muy razonable y didáctica.

### 5. Tratar este tema como algo aislado del resto del módulo
En realidad es una consecuencia muy natural de toda la madurez que ya ganó el cluster.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para empezar a trabajar con actualizaciones controladas dentro de Kubernetes y por qué este paso aparece ahora, y no antes, dentro del bloque.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés por qué una actualización brusca ya empieza a quedarse corta,
- ves la relación entre rollout, probes y réplicas,
- identificás qué servicios conviene tocar primero,
- y entendés por qué este refinamiento tiene sentido en este punto del bloque.

Si eso está bien, ya podemos pasar a ajustar una estrategia de `rolling update` en un servicio importante.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a aplicar una estrategia de actualización más controlada a una pieza importante de NovaMarket dentro del cluster.

Ese será el primer paso concreto para profesionalizar también el ciclo de cambio de los servicios.

---

## Cierre

En esta clase entendimos por qué las actualizaciones controladas ya tienen sentido en NovaMarket dentro de Kubernetes.

Con eso, el bloque queda listo para dar otro salto de madurez: dejar de pensar solo en servicios desplegados, sanos y escalables, y empezar a pensar también cómo evolucionan dentro del cluster sin volver frágil la operación del sistema.
