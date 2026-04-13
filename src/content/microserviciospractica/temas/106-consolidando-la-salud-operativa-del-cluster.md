---
title: "Consolidando la salud operativa del cluster"
description: "Checkpoint del endurecimiento operativo en Kubernetes. Revisión del estado del cluster de NovaMarket después de introducir probes en varias piezas críticas del sistema."
order: 106
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Consolidando la salud operativa del cluster

En las últimas clases del bloque de Kubernetes dimos otro salto importante de madurez:

- entendimos por qué `readiness` y `liveness` ya tenían sentido,
- las aplicamos a un servicio principal,
- y después extendimos el patrón a varias piezas críticas del sistema.

Eso ya dejó al entorno mucho mejor parado.

Ahora conviene hacer algo muy importante antes de seguir con nuevos refinamientos:

**mirar el cluster como conjunto y revisar qué tan madura ya es su salud operativa.**

Porque una cosa es tocar `Deployment` por `Deployment`.  
Y otra muy distinta es detenerse a ver qué cambió realmente en la calidad del entorno completo.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- varias piezas críticas del sistema ya tienen una lectura operativa más madura,
- el cluster distingue mejor disponibilidad y salud,
- NovaMarket se siente más robusto dentro de Kubernetes,
- y el bloque ya quedó listo para seguir con otros refinamientos sobre una base mucho más sólida.

Esta clase funciona como checkpoint fuerte del endurecimiento operativo que venimos construyendo.

---

## Estado de partida

Partimos de un cluster donde ya existe una reconstrucción muy rica de NovaMarket:

- núcleo base
- capa funcional importante
- gateway
- acceso por `Ingress`
- configuración externalizada con `ConfigMap` y `Secret`
- y ahora también probes en varias piezas importantes

Eso significa que el entorno ya no es solo funcional: empieza a ser también más operativamente maduro.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar las piezas críticas del cluster,
- observar cómo se comportan con probes,
- validar que el entorno sigue funcional,
- y consolidar esta nueva etapa del bloque antes de avanzar.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si siguen arriba”.

Queremos observar algo más interesante:

- si el cluster tiene una lectura más rica del estado de sus piezas
- si el arranque se interpreta mejor
- si la disponibilidad se entiende mejor
- y si el entorno general se siente menos frágil que antes

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Revisar las piezas críticas que ya tienen probes

Conviene mirar especialmente servicios como:

- `api-gateway`
- `order-service`
- `config-server`
- `discovery-server`

o los que efectivamente hayas refinado en las clases anteriores.

La idea es observar el conjunto de piezas más sensibles donde el cluster ahora ya tiene una lectura operativa mejor.

---

## Paso 2 · Revisar el estado de sus Pods

Ahora mirá los Pods correspondientes.

Queremos ver que:

- existen
- siguen sanos
- y no muestran inestabilidad causada por probes mal calibradas

Este paso es muy importante porque el refinamiento tiene valor solo si mejora el entorno sin degradar innecesariamente su estabilidad.

---

## Paso 3 · Revisar los eventos y señales del ciclo de vida

A esta altura del bloque ya es muy útil observar cómo el cluster refleja:

- cuándo una pieza pasa a estado listo
- cómo se comporta después del arranque
- y si las probes están realmente participando en la lectura del ciclo de vida

Esto ayuda muchísimo a ver que el cambio no fue solo “más YAML”, sino una mejora real en el comportamiento operativo.

---

## Paso 4 · Revisar logs de algunas piezas representativas

Ahora conviene mirar logs de al menos una o dos piezas críticas.

Queremos confirmar que:

- siguen arrancando bien
- no muestran errores por health checks mal resueltos
- y las probes ya conviven de forma razonable con el ritmo real de las aplicaciones

Este paso es clave para consolidar confianza sobre el refinamiento.

---

## Paso 5 · Validar que el sistema sigue funcionando

Después del refinamiento operativo, conviene volver a probar al menos una señal funcional importante del sistema.

Por ejemplo:

- una ruta simple vía gateway
- o una parte del flujo principal que ya venías usando como checkpoint

La idea es comprobar que el cluster no solo se volvió más “correcto” operativamente, sino que también sigue sosteniendo el comportamiento del negocio.

---

## Paso 6 · Pensar qué cambió en la calidad del entorno

A esta altura conviene fijar algo importante:

antes del refinamiento con probes, el cluster ya podía alojar una parte importante del sistema.

Pero ahora empieza a hacer algo más:

- interpretar mejor la salud real de varias piezas
- decidir mejor cuándo están listas
- y reaccionar con más criterio frente a estados problemáticos

Ese cambio es una ganancia de calidad operativa muy fuerte.

---

## Paso 7 · Comparar este estado con etapas anteriores del bloque

Si miramos todo el recorrido del módulo, se nota una evolución muy clara:

### Al principio
- desplegar servicios
- validar que vivan

### Después
- reconstruir circuitos funcionales
- exponer gateway
- mejorar entrada con `Ingress`

### Ahora
- ordenar configuración
- y empezar a endurecer salud operativa

Ese recorrido muestra muy bien cómo el bloque fue subiendo de nivel sin perder coherencia.

---

## Paso 8 · Pensar qué tipo de refinamientos ya tienen sentido después de este checkpoint

Ahora que la salud operativa del cluster ya es más madura, empiezan a quedar mejor preparados otros refinamientos del entorno.

Por ejemplo, más adelante podrían tener sentido cosas como:

- escalado
- recursos
- observabilidad más rica
- o estrategias operativas aún más refinadas

No hace falta elegir el siguiente paso ahora mismo.  
Lo importante es reconocer que el entorno ya alcanzó otro nivel de estabilidad conceptual y operativa.

---

## Qué estamos logrando con esta clase

Esta clase cierra una etapa muy importante del bloque de Kubernetes.

Ya no estamos solo desplegando ni solo reconstruyendo circuitos.  
Ahora también estamos consolidando una lectura más madura de la salud del sistema dentro del cluster.

Eso eleva bastante el nivel del entorno.

---

## Qué todavía no hicimos

Todavía no:

- agotamos todos los refinamientos operativos posibles
- ni transformamos este cluster en un entorno final de producción

Eso puede venir después.

La meta de hoy es mucho más concreta:

**consolidar la salud operativa del entorno como base para seguir creciendo.**

---

## Errores comunes en esta etapa

### 1. Mirar solo que los Pods “siguen vivos”
El valor real está en cómo el cluster ya interpreta mejor su salud.

### 2. No volver a validar una señal funcional del sistema
La robustez operativa tiene que sostener el comportamiento del negocio.

### 3. Dar por hecho que las probes ya están “perfectas”
Siempre pueden ajustarse más adelante.

### 4. No mirar el bloque como un todo
Esta clase justamente existe para consolidar una visión de conjunto.

### 5. Creer que este checkpoint es menor
En realidad marca una mejora muy fuerte en la calidad del entorno.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión mucho más clara de cómo quedó NovaMarket dentro del cluster después de introducir probes en varias piezas críticas y por qué el entorno ya es operativamente más maduro.

Eso deja muy bien preparado el siguiente tramo del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- varias piezas críticas tienen probes funcionando,
- el cluster las interpreta razonablemente bien,
- los Pods siguen sanos,
- el sistema mantiene funcionalidad importante,
- y sentís que el entorno ya ganó una base operativa bastante más sólida.

Si eso está bien, entonces NovaMarket ya dio otro salto fuerte de madurez dentro de Kubernetes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a pensar el siguiente gran refinamiento del entorno Kubernetes, apoyándonos en toda esta base funcional, de acceso, configuración y salud que ya logramos consolidar.

---

## Cierre

En esta clase consolidamos la salud operativa del cluster.

Con eso, NovaMarket ya no solo tiene una parte muy importante del sistema reconstruida dentro de Kubernetes: también empieza a contar con un entorno mucho más inteligente y robusto para sostenerla.
