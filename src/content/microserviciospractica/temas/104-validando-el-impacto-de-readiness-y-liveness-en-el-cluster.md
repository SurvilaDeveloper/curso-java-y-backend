---
title: "Validando el impacto de readiness y liveness en el cluster"
description: "Checkpoint del refinamiento operativo en Kubernetes. Verificación del comportamiento de un servicio después de incorporar readiness y liveness probes dentro de NovaMarket."
order: 104
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Validando el impacto de `readiness` y `liveness` en el cluster

En la clase anterior dimos un paso muy importante dentro del bloque de Kubernetes:

- elegimos un servicio principal,
- le agregamos `readinessProbe`,
- le agregamos `livenessProbe`,
- y con eso empezamos a hacer que el cluster interprete mejor su salud real.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer algo muy importante antes de extender el patrón al resto del sistema:

**validar qué cambió realmente en el comportamiento del entorno.**

Porque una cosa es agregar dos bloques YAML al `Deployment`.  
Y otra distinta es entender qué efecto tienen de verdad sobre la vida del servicio dentro del cluster.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- el servicio con probes sigue arrancando correctamente,
- Kubernetes distingue mejor su estado operativo,
- el comportamiento del Pod ya no depende solo de “el proceso está vivo”,
- y el bloque está listo para extender este refinamiento a más piezas del sistema.

Esta clase funciona como checkpoint directo del paso que dimos antes.

---

## Estado de partida

Partimos de un entorno donde al menos uno de los servicios principales ya tiene:

- `readinessProbe`
- `livenessProbe`

Y además el cluster ya aloja una parte muy importante del sistema de NovaMarket.

Eso nos deja en una posición muy buena para observar el impacto real del cambio.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el estado del Pod del servicio refinado,
- mirar cómo se comporta después del arranque,
- validar que sigue respondiendo funcionalmente,
- y confirmar que las probes ya están mejorando la lectura operativa del cluster.

---

## Qué problema queremos observar ahora

Lo que queremos ver no es solo si “rompió” o “no rompió”.

Queremos mirar algo mucho más interesante:

- si el servicio tarda un tiempo en estar realmente listo
- si el cluster lo distingue mejor
- si el Pod sigue sano
- y si el servicio ya no depende solo de una lectura demasiado superficial de vida

Ese aprendizaje es el que vuelve realmente valioso el refinamiento.

---

## Paso 1 · Revisar el `Deployment` refinado

Antes de mirar el comportamiento del Pod, conviene abrir nuevamente el `Deployment` y confirmar que:

- `readinessProbe` está presente
- `livenessProbe` también
- y ambas apuntan al endpoint correcto

Este primer chequeo ayuda bastante a validar que lo que vamos a observar en el cluster corresponde realmente a la configuración nueva.

---

## Paso 2 · Revisar el estado del Pod después del despliegue

Ahora mirá el Pod del servicio refinado.

La idea es observar si:

- arranca con normalidad
- tarda un poco en considerarse listo
- y no entra en un ciclo extraño por una mala configuración de las probes

No hace falta todavía forzar un fallo artificial.  
Con observar el comportamiento de arranque ya estamos aprendiendo bastante.

---

## Paso 3 · Revisar los eventos o señales del Pod

Este es un punto muy valioso.

Queremos ver si el entorno ya deja más claro algo como:

- cuándo el servicio pasa a estar listo
- cuándo una probe falla o pasa
- y cómo el cluster interpreta ese ciclo

Esa lectura más rica es justamente una de las grandes ganancias de esta etapa del bloque.

---

## Paso 4 · Mirar logs del servicio

Ahora mirá los logs del servicio refinado.

La idea es comprobar que:

- la aplicación sigue arrancando bien,
- el endpoint de health realmente responde,
- y las probes no quedaron mal alineadas con el comportamiento real de la aplicación.

Este punto es muy importante porque una probe mal calibrada puede volver inestable una pieza que en sí misma estaba sana.

---

## Paso 5 · Validar una señal funcional del servicio

Después del arranque y de revisar la salud operativa, conviene validar una señal funcional simple del servicio.

No hace falta recorrer el sistema entero.  
Con una comprobación razonable ya alcanza para confirmar que la mejora no solo dejó al Pod “bonito” en Kubernetes, sino que además sigue sosteniendo comportamiento útil.

---

## Paso 6 · Pensar qué cambió realmente

A esta altura de la clase conviene fijar una idea muy importante:

antes de las probes, el cluster sabía mucho menos sobre este servicio.

Ahora, en cambio, ya empieza a poder responder mejor preguntas como:

- ¿está listo para recibir tráfico?
- ¿sigue sano?
- ¿debería mantenerse en el circuito?
- ¿debería reiniciarse si se degrada?

Ese cambio es el verdadero valor del refinamiento.

---

## Paso 7 · Comparar con el estado anterior del bloque

Antes, el entorno ya funcionaba bastante bien, pero la lectura de salud era más pobre.

Ahora, con probes aplicadas al menos a una pieza importante, el cluster gana una capa adicional de inteligencia operativa.

Eso significa que el bloque ya no solo se está volviendo más completo en cantidad de servicios, sino también más maduro en calidad de operación.

---

## Paso 8 · Pensar si ya vale la pena extender el patrón

Después de este checkpoint, la pregunta natural es:

**¿ya tiene sentido aplicar probes también a otras piezas críticas del sistema?**

La respuesta debería empezar a acercarse bastante a un sí, justamente porque ya validamos el patrón en un caso principal y vemos que el valor es real.

Ese es el puente hacia la próxima clase.

---

## Qué estamos logrando con esta clase

Esta clase convierte la incorporación de probes en algo observable y comprensible.

Ya no es solo una mejora “porque sí” en el manifiesto.  
Ahora podemos empezar a ver que el cluster interpreta de forma más rica la vida del servicio.

Eso fortalece muchísimo el bloque.

---

## Qué todavía no hicimos

Todavía no:

- extendimos probes a varias piezas críticas
- ni revisamos el efecto del refinamiento sobre una porción más grande del sistema

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**validar que el primer servicio con probes realmente mejora la lectura operativa del entorno.**

---

## Errores comunes en esta etapa

### 1. Mirar solo que el Pod sigue vivo y no observar su transición a estado listo
Justamente ahí está gran parte del valor.

### 2. No revisar logs del servicio
Las probes se entienden mucho mejor viendo cómo conviven con el arranque real.

### 3. Confundir una probe mal calibrada con un problema del servicio
Siempre conviene revisar ambos lados.

### 4. Pasar al siguiente refinamiento sin validar este primero
Eso haría más difícil entender después dónde se rompió algo.

### 5. Pensar que esta clase no agrega nada porque no crea nuevos recursos
En realidad consolida uno de los refinamientos más importantes del bloque.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías haber comprobado que el primer servicio con `readiness` y `liveness` sigue funcionando bien y que el cluster ya interpreta mejor su salud operativa.

Eso deja perfectamente preparado el siguiente paso.

---

## Punto de control

Antes de seguir, verificá que:

- el servicio refinado sigue sano,
- las probes están funcionando razonablemente,
- el Pod muestra un ciclo de vida más claro,
- la funcionalidad básica no se rompió,
- y sentís que este patrón ya puede extenderse al resto del entorno.

Si eso está bien, ya podemos pasar a endurecer otras piezas críticas del sistema.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a extender `readiness` y `liveness` a otras piezas importantes del cluster, especialmente aquellas que más impacto tienen sobre el resto del sistema.

---

## Cierre

En esta clase validamos el impacto real de `readiness` y `liveness` dentro del cluster.

Con eso, NovaMarket ya no solo empieza a usar probes: también empieza a entender su valor real dentro de una operación más madura en Kubernetes.
