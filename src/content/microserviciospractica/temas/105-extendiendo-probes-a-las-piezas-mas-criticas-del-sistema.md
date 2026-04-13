---
title: "Extendiendo probes a las piezas más críticas del sistema"
description: "Continuación del endurecimiento operativo en Kubernetes. Aplicación de readiness y liveness a otras piezas importantes de NovaMarket dentro del cluster."
order: 105
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Extendiendo probes a las piezas más críticas del sistema

En las últimas clases del bloque hicimos algo muy importante:

- entendimos por qué `readiness` y `liveness` ya tenían sentido,
- las aplicamos a un servicio principal,
- y además validamos que el patrón realmente mejora la lectura operativa del cluster.

Eso ya es un gran avance.

Pero ahora aparece una consecuencia natural:

**si este refinamiento vale tanto en una pieza importante, también conviene empezar a extenderlo al resto de las piezas más críticas del sistema.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- identificado qué servicios del entorno conviene endurecer primero,
- agregadas probes a más de una pieza crítica,
- y elevado el nivel de madurez operativa de una porción más amplia del sistema dentro de Kubernetes.

No hace falta todavía aplicar probes a absolutamente todo el stack.  
La meta es extender el patrón donde más valor aporta primero.

---

## Estado de partida

Partimos de un cluster donde al menos un servicio importante ya tiene `readiness` y `liveness` funcionando razonablemente bien.

Además, el sistema ya cuenta con:

- núcleo base
- capa funcional importante
- gateway
- entrada por `Ingress`
- y configuración más madura con `ConfigMap` y `Secret`

Eso significa que el entorno ya está listo para un endurecimiento más amplio.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir otras piezas críticas del sistema,
- revisar sus `Deployment`,
- agregar probes razonables,
- reaplicar los cambios,
- y comprobar que el cluster empieza a tener una lectura mucho más rica de una porción mayor del ecosistema.

---

## Qué servicios conviene tocar primero

No todos los servicios pesan igual dentro del cluster.

A esta altura del bloque, algunos candidatos muy naturales son:

- `api-gateway`
- `order-service`
- `config-server`
- `discovery-server`

¿Por qué?

Porque una degradación o una mala lectura operativa de estas piezas puede impactar bastante sobre el resto del sistema.

Este es justamente el tipo de prioridad que conviene aprender a ver.

---

## Paso 1 · Elegir dos o tres piezas importantes

Para esta clase no hace falta ir a lo masivo.

Conviene elegir un grupo razonable, por ejemplo:

- `api-gateway`
- `order-service`
- y alguna pieza base como `config-server` o `discovery-server`

La idea es que la extensión del patrón ya se note sobre una parte significativa del sistema sin volver el bloque demasiado cargado de golpe.

---

## Paso 2 · Revisar el endpoint de salud disponible en cada servicio

Antes de copiar probes casi por inercia, conviene revisar que cada servicio tenga un endpoint razonable, por ejemplo:

```txt
/actuator/health
```

La idea es confirmar que la base funcional del proyecto realmente soporta esta nueva capa operativa.

Este paso importa mucho porque el patrón no debería aplicarse a ciegas.

---

## Paso 3 · Agregar `readinessProbe` a las nuevas piezas

Ahora sumá probes de `readiness` a los `Deployment` elegidos.

La forma conceptual sigue siendo la misma que en la clase anterior:

- un endpoint de salud
- un puerto correcto
- y tiempos razonables para el arranque de la aplicación

No hace falta buscar todavía la calibración perfecta de cada servicio.  
Lo importante es instalar el patrón con criterio.

---

## Paso 4 · Agregar `livenessProbe` a las nuevas piezas

Ahora hacé lo mismo con `liveness`.

Recordá que, aunque en esta etapa puedan apoyarse en el mismo endpoint base de salud, siguen respondiendo a preguntas distintas dentro del cluster.

Esa distinción sigue siendo valiosa incluso cuando el YAML inicial de ambas probes se parece bastante.

---

## Paso 5 · Reaplicar los `Deployment`

Después de agregar las probes, reaplicá los manifiestos de las piezas que elegiste.

La idea es que el cluster ya no interprete solo a un servicio principal de forma más madura, sino a una porción más amplia y crítica del sistema.

Este es el verdadero momento importante de la clase.

---

## Paso 6 · Observar el comportamiento de los Pods

Ahora revisá cómo se comportan los Pods después del cambio.

Queremos ver cosas como:

- si arrancan con normalidad
- si tardan un poco en estar listos
- y si el cluster empieza a manejar mejor la transición entre existencia del Pod y disponibilidad real del servicio

Cuando esto se ve en varias piezas a la vez, el valor del patrón se vuelve muchísimo más evidente.

---

## Paso 7 · Revisar logs de las piezas tocadas

Ahora mirá logs de los servicios que modificaste.

Queremos confirmar que:

- siguen arrancando correctamente
- no aparecen errores de health endpoint mal resuelto
- y las probes no quedaron demasiado agresivas para el ritmo real de inicialización de cada servicio

Este punto es clave, porque extender el patrón sin observar su impacto real sería un error bastante clásico.

---

## Paso 8 · Pensar qué gana el cluster con esta extensión

A esta altura del bloque, el cluster ya no tiene una lectura rica de salud solo sobre una pieza.

Empieza a tenerla sobre varias de las más importantes.

Eso significa que el entorno:

- tolera mejor arranques graduales
- entiende mejor cuándo mandar tráfico
- y tiene más herramientas para reaccionar frente a degradaciones

Esa mejora operativa es muy importante.

---

## Paso 9 · Comparar este estado con el anterior

Antes teníamos un sistema bastante reconstruido, pero con una lectura de salud todavía algo limitada.

Ahora, después de extender probes a varias piezas críticas, la operación del cluster ya empieza a sentirse bastante más seria.

Eso es exactamente lo que queríamos construir con esta etapa del bloque.

---

## Paso 10 · Pensar qué piezas podrían quedar para más adelante

No hace falta endurecer todo hoy.

Puede tener sentido dejar para clases posteriores servicios como:

- `catalog-service`
- `inventory-service`
- `notification-service`

según cómo quieras equilibrar prioridad operativa y carga del curso.

Lo importante es que a esta altura ya queda muy claro qué criterio usar para decidir por dónde seguir.

---

## Qué estamos logrando con esta clase

Esta clase amplía de forma muy clara la madurez operativa del entorno Kubernetes de NovaMarket.

Ya no estamos aplicando probes como una mejora aislada.  
Ahora empiezan a formar parte real del comportamiento del cluster sobre varias piezas importantes del sistema.

Eso eleva bastante el nivel del bloque.

---

## Qué todavía no hicimos

Todavía no:

- revisamos el efecto global del refinamiento sobre el entorno completo
- ni consolidamos este tramo como checkpoint operativo del cluster

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**extender el patrón de probes a las piezas más críticas del sistema.**

---

## Errores comunes en esta etapa

### 1. Aplicar probes a muchos servicios de golpe sin criterio
Conviene priorizar donde más valor aportan primero.

### 2. No revisar que el endpoint de salud exista realmente en cada pieza
Eso puede romper Pods sanos.

### 3. Usar tiempos idénticos para todo por comodidad
Conviene al menos pensar si tiene sentido.

### 4. Reaplicar los `Deployment` sin observar el comportamiento posterior
La mejora tiene que leerse en el cluster.

### 5. Creer que “más probes” siempre es automáticamente mejor
El valor está en el criterio con que se aplican.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, varias piezas críticas de NovaMarket deberían tener `readiness` y `liveness` aplicadas razonablemente dentro del cluster.

Eso deja al bloque muy bien preparado para un checkpoint operativo más amplio.

---

## Punto de control

Antes de seguir, verificá que:

- ya no hay solo un servicio con probes,
- las piezas críticas elegidas siguen sanas,
- los Pods muestran un ciclo de vida más claro,
- los logs no muestran problemas serios,
- y el cluster ya interpreta mejor una porción importante del sistema.

Si eso está bien, ya podemos consolidar este refinamiento como un nuevo checkpoint del bloque.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a revisar cómo queda NovaMarket después de extender probes a varias piezas críticas y qué tan madura ya es la salud operativa del cluster.

---

## Cierre

En esta clase extendimos `readiness` y `liveness` a las piezas más críticas del sistema.

Con eso, NovaMarket da otro paso fuerte de madurez en Kubernetes: el cluster ya no solo aloja una parte muy importante del sistema, sino que además empieza a leer mejor la salud real de varias de sus piezas más importantes.
