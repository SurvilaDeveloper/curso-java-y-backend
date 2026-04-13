---
title: "Entendiendo por qué HPA ya tiene sentido"
description: "Preparación conceptual para el siguiente refinamiento del bloque de Kubernetes. Comprensión de por qué, después de consolidar salud, recursos y réplicas, ya conviene introducir HorizontalPodAutoscaler."
order: 112
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Entendiendo por qué `HPA` ya tiene sentido

En la clase anterior dimos un paso muy importante dentro de la etapa de escalado:

- dejamos de asumir que ciertas piezas importantes debían vivir con una sola réplica,
- ajustamos `Deployment` relevantes,
- y validamos que el cluster ya puede sostener varias instancias de servicios críticos de NovaMarket.

Eso ya tiene muchísimo valor.

Pero ahora aparece una pregunta muy natural:

**si ya tiene sentido que algunas piezas tengan más de una réplica, cuándo deja de convenir que ese número sea fijo y empieza a tener sentido que cambie según la situación?**

Ese es el terreno de esta clase.

Y ahí es donde entra:

**`HorizontalPodAutoscaler`**

No como una pieza aislada, sino como la evolución natural de todo lo que ya construimos antes en el bloque.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué `HPA` ya tiene sentido en este punto del roadmap,
- entendida su relación con probes, recursos y réplicas,
- preparada la base mental para introducirlo en un servicio principal,
- y alineada la secuencia del curso para pasar del escalado manual a un escalado más dinámico.

Todavía no vamos a crear el recurso.  
La meta de hoy es entender por qué el momento ya llegó y qué problema operativo real viene a resolver.

---

## Estado de partida

Partimos de un cluster donde el entorno ya tiene bastante madurez acumulada:

- servicios relevantes reconstruidos
- acceso vía gateway e `Ingress`
- configuración externalizada
- probes
- política inicial de recursos
- y ahora también varias réplicas en piezas importantes

Eso significa que el sistema ya tiene casi todos los ingredientes previos necesarios para empezar a pensar escalado dinámico de una forma coherente.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué limitación empieza a mostrar el escalado manual,
- entender qué agrega `HPA`,
- conectarlo con las capas previas del bloque,
- y dejar clara la transición hacia una política de escalado más madura.

---

## Qué problema queremos resolver exactamente

Ajustar `replicas` manualmente ya fue un gran paso.  
Pero también deja ver una limitación bastante clara:

- el número sigue siendo fijo
- aunque la situación del entorno cambie

Eso significa que si el tráfico o el uso cambian, el cluster no tiene todavía una forma declarativa de reaccionar por sí mismo dentro de los márgenes que definamos.

Ahí aparece el valor de `HPA`:

**permitir que la cantidad de Pods deje de ser completamente estática.**

---

## Por qué este paso tiene sentido justamente ahora

Porque `HPA` no conviene introducirlo en el vacío.

Antes de llegar a él, el bloque ya construyó varias capas que lo sostienen muy bien:

- probes
- `requests` y `limits`
- múltiples réplicas
- servicios funcionales significativos dentro del cluster

Eso hace que ahora sí tenga sentido pasar del pensamiento:

- “este servicio corre con X réplicas”

al pensamiento:

- “este servicio puede oscilar razonablemente entre un mínimo y un máximo según ciertas señales”

Ese cambio tiene mucho más valor ahora que antes.

---

## Qué es lo importante de `HPA` en este curso

Para esta etapa del curso práctico, la idea más valiosa es esta:

**`HPA` le permite al cluster ajustar horizontalmente la cantidad de Pods de un servicio dentro de ciertos límites.**

No hace falta todavía entrar en todas las variantes avanzadas.

Lo importante es entender:

- que ya no estamos hablando solo de un número fijo de réplicas,
- y que Kubernetes empieza a participar de forma más activa en el crecimiento o reducción de ciertas piezas del sistema.

---

## Paso 1 · Conectarlo con `requests`

Este punto es especialmente importante.

`HPA` no aparece mágicamente desconectado del resto del bloque.

Las clases anteriores sobre `requests` y `limits` importan mucho acá porque una política de autoscaling apoyada en recursos necesita una base razonable sobre qué consume cada servicio.

Ese vínculo es clave para ver la coherencia del roadmap.

---

## Paso 2 · Entender por qué no empezamos por acá

Conviene decirlo explícitamente.

Si hubiéramos metido `HPA` demasiado pronto, el bloque hubiera quedado mucho más confuso, porque todavía faltaban varias bases importantes:

- salud
- configuración
- recursos
- y la propia idea de múltiples réplicas

Ahora, en cambio, el sistema ya está bastante reconstruido y bastante maduro.

Por eso este paso aparece en un momento mucho más lógico del curso.

---

## Paso 3 · Pensar qué servicios conviene considerar primero

No todos los servicios merecen la misma prioridad para la primera experiencia con `HPA`.

A esta altura del bloque, un candidato muy razonable puede ser:

- `api-gateway`
- o `order-service`

¿Por qué?

Porque son piezas donde:

- el tráfico puede variar de forma más intuitiva,
- el valor del escalado es fácil de explicar,
- y el impacto sobre el sistema es bastante visible.

Ese tipo de criterio importa mucho.

---

## Paso 4 · Entender qué NO estamos buscando todavía

Conviene dejar esto muy claro.

En esta etapa del curso no estamos todavía:

- diseñando una estrategia definitiva de producción
- ni afinando thresholds perfectos de carga
- ni resolviendo todos los matices de métricas avanzadas

La meta ahora es mucho más concreta:

**entender cómo pasar de un número fijo de réplicas a una política declarativa de escalado horizontal razonable.**

Eso ya aporta muchísimo valor.

---

## Paso 5 · Pensar en mínimo y máximo, no solo en una cifra

A esta altura del bloque, la mentalidad empieza a cambiar bastante.

Con réplicas fijas pensábamos algo como:

- este servicio corre con 2 pods

Con `HPA` empezamos a pensar algo más rico:

- este servicio debería tener al menos cierta base
- pero podría crecer hasta cierto punto si la situación lo justifica

Ese cambio de lenguaje vale muchísimo y es una de las razones más fuertes para introducir este tema ahora.

---

## Paso 6 · Entender que esto no reemplaza la arquitectura previa

`HPA` no reemplaza:

- buenas probes
- recursos razonables
- configuración clara
- ni una pieza funcional sana

Se apoya sobre todo eso.

Este punto es muy importante porque mantiene la lógica del bloque en orden y evita tratar el autoscaling como una solución mágica.

---

## Qué estamos logrando con esta clase

Esta clase no crea todavía el `HorizontalPodAutoscaler`, pero hace algo muy importante:

**prepara el salto desde escalado manual a escalado más dinámico sin romper la coherencia del roadmap.**

Eso importa muchísimo, porque evita que `HPA` aparezca como una capa aislada y lo vuelve la consecuencia natural del trabajo que ya hicimos antes.

---

## Qué todavía no hicimos

Todavía no:

- escribimos el recurso `HPA`
- lo conectamos a un `Deployment`
- ni validamos todavía su efecto dentro del cluster

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué `HPA` ya tiene sentido ahora.**

---

## Errores comunes en esta etapa

### 1. Pensar que `HPA` debería haber aparecido mucho antes
En realidad ahora tiene mucho más sentido gracias a todo lo que ya construimos.

### 2. Creer que reemplaza a las réplicas fijas sin más
En realidad parte de una base de mínimo y máximo.

### 3. No conectarlo con `requests` y `limits`
Ese vínculo es una de las claves del bloque.

### 4. Querer afinar de entrada una política perfecta
Para esta etapa, una primera versión razonable es más que suficiente.

### 5. Tratarlo como un tema completamente aislado del resto del módulo
En realidad es una evolución muy natural de todo lo anterior.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para introducir `HPA` dentro de Kubernetes y por qué este paso aparece ahora, y no antes, dentro del bloque.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés la limitación del escalado manual,
- ves por qué las réplicas fijas ya no son la única forma razonable de pensar ciertas piezas,
- entendés la relación entre `HPA` y `requests`,
- e identificás qué servicio del sistema conviene usar como primer candidato.

Si eso está bien, ya podemos crear el primer `HorizontalPodAutoscaler` del bloque.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a crear un `HPA` para una pieza importante de NovaMarket dentro del cluster.

Ese será el primer paso concreto para pasar de escalado estático a escalado más dinámico dentro del entorno.

---

## Cierre

En esta clase entendimos por qué `HPA` ya tiene sentido en NovaMarket dentro de Kubernetes.

Con eso, el bloque queda listo para dar otro salto fuerte de madurez: dejar atrás la lógica de réplicas totalmente fijas y empezar a construir una política de escalado horizontal mucho más propia del mundo Kubernetes.
