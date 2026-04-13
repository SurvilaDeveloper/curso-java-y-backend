---
title: "Agregando requests y limits a servicios importantes"
description: "Primer paso concreto del refinamiento de recursos en Kubernetes. Aplicación de requests y limits a piezas importantes de NovaMarket dentro del cluster."
order: 108
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Agregando `requests` y `limits` a servicios importantes

En la clase anterior dejamos claro algo importante:

- NovaMarket ya está lo suficientemente maduro dentro del cluster como para que empiece a importar no solo qué servicios viven ahí y qué tan sanos están,
- sino también **cómo** consumen recursos.

Ahora toca el paso concreto:

**agregar `requests` y `limits` a algunas piezas importantes del sistema.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- elegido un conjunto razonable de servicios importantes,
- agregados `requests` y `limits` a sus `Deployment`,
- reaplicados los manifiestos,
- y dado el primer paso real hacia una política de recursos más madura dentro de Kubernetes.

Todavía no vamos a afinar todos los servicios ni a buscar el tuning perfecto.  
La meta de hoy es instalar correctamente el patrón donde más valor aporta primero.

---

## Estado de partida

Partimos de un cluster donde el entorno ya tiene bastante madurez:

- piezas base
- servicios funcionales
- gateway
- `Ingress`
- configuración externalizada
- probes
- y una salud operativa bastante más rica que al comienzo del bloque

Eso significa que ya existe una base suficientemente sólida como para que la política de recursos deje de ser una preocupación prematura y pase a ser una mejora real.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir dos o tres piezas importantes del sistema,
- revisar sus `Deployment`,
- agregar bloques de `resources`,
- reaplicar los cambios,
- y dejar al cluster con una primera política de recursos explícita sobre servicios relevantes.

---

## Qué servicios conviene elegir primero

Igual que en clases anteriores, no hace falta tocar todo el stack de golpe.

Para esta primera iteración, algunos candidatos muy razonables son:

- `api-gateway`
- `order-service`
- y una pieza base como `config-server` o `discovery-server`

La idea es que el cambio se note donde más valor operativo aporta primero.

---

## Paso 1 · Revisar el `Deployment` de una pieza principal

Antes de agregar nada, conviene abrir el `Deployment` de un servicio importante, por ejemplo `api-gateway`.

Queremos ubicar claramente el contenedor y el lugar correcto donde vamos a agregar el bloque de recursos.

No hace falta cambiar todavía nada más del manifiesto.  
Primero queremos partir de una lectura ordenada.

---

## Paso 2 · Agregar un bloque inicial de `resources`

Una primera versión razonable, simple y didáctica podría verse así:

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "256Mi"
  limits:
    cpu: "500m"
    memory: "512Mi"
```

No hace falta que estos valores sean exactamente los definitivos para tu entorno real.  
Lo importante es que:

- ya exista una expectativa mínima,
- ya exista un techo razonable,
- y el cluster deje de trabajar completamente a ciegas respecto de esa pieza.

---

## Paso 3 · Aplicar el mismo criterio a otro servicio importante

Ahora conviene repetir el patrón en una segunda pieza significativa, por ejemplo `order-service`.

No hace falta copiar exactamente los mismos valores si sentís que el servicio puede merecer una lectura distinta, pero para esta etapa del curso también es perfectamente válido empezar con una base bastante razonable y simple.

La prioridad sigue siendo instalar bien el patrón.

---

## Paso 4 · Pensar qué servicio base también conviene endurecer

Ahora sumá una pieza base del ecosistema, por ejemplo:

- `config-server`
- o `discovery-server`

La idea es que el refinamiento no quede solo concentrado en servicios de negocio o de entrada, sino que también empiece a tocar parte de la base del sistema.

Eso vuelve mucho más clara la madurez general del bloque.

---

## Paso 5 · Reaplicar los `Deployment`

Después de agregar `requests` y `limits` a las piezas elegidas, reaplicá los manifiestos.

Este es el verdadero momento importante de la clase.

La idea es que el cluster ya no vea a estas piezas solo como Pods que viven y están sanos, sino también como servicios cuyo consumo esperado empieza a estar mejor definido.

---

## Paso 6 · Revisar el estado de los Pods

Ahora comprobá que los Pods de los servicios refinados:

- siguen existiendo
- siguen arrancando correctamente
- y no muestran señales obvias de que los valores elegidos resultan incompatibles con la vida básica del servicio

No estamos todavía haciendo tuning fino.  
Queremos validar que la política inicial de recursos sea razonable.

---

## Paso 7 · Revisar logs de los servicios modificados

Ahora mirá logs de las piezas que tocaste.

Queremos comprobar que:

- siguen arrancando bien
- no aparecen síntomas obvios de restricción mal calibrada
- y el cluster sigue sosteniendo estos servicios con normalidad después del cambio

Este punto importa mucho porque una política de recursos demasiado agresiva puede romper un entorno que antes estaba estable.

---

## Paso 8 · Pensar qué cambió realmente

A esta altura conviene fijar algo muy importante:

antes, el cluster ya tenía una idea más rica de salud gracias a probes, pero todavía carecía de una primera política explícita de recursos sobre varias piezas críticas.

Ahora eso cambia.

El entorno empieza a tener una lectura más madura también sobre:

- cuánto necesita cada servicio para vivir
- y hasta qué punto debería poder crecer sin desbordarse

Ese cambio vale muchísimo.

---

## Paso 9 · No buscar todavía la perfección

Este punto conviene dejarlo muy claro.

En esta etapa del curso, el objetivo no es encontrar:

- el valor exacto perfecto de CPU para cada servicio
- ni el límite definitivo de memoria de producción

La meta es mucho más concreta:

**instalar el patrón de forma razonable y operativamente útil.**

Ese criterio evita volver esta clase demasiado frágil o demasiado prematura.

---

## Paso 10 · Pensar qué servicios podrían seguir después

Después de esta primera iteración ya debería empezar a quedar claro que el patrón también podría extenderse, más adelante, a:

- `inventory-service`
- `catalog-service`
- `notification-service`

No hace falta hacer todo hoy.  
Lo importante es que el cluster ya empezó a construir una política de recursos explícita sobre varias de sus piezas más importantes.

---

## Qué estamos logrando con esta clase

Esta clase le agrega al bloque de Kubernetes otra capa de madurez muy valiosa.

Ya no estamos solo hablando de:

- despliegue
- acceso
- configuración
- salud

Ahora también empezamos a darle al cluster una primera política explícita de recursos para sostener el sistema.

Eso fortalece muchísimo el entorno.

---

## Qué todavía no hicimos

Todavía no:

- validamos el impacto global del cambio sobre el cluster como conjunto
- ni revisamos cómo se siente ahora la operación del sistema después de este refinamiento

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**agregar `requests` y `limits` a piezas importantes del sistema.**

---

## Errores comunes en esta etapa

### 1. Querer afinar valores perfectos desde el primer intento
Conviene empezar razonable y ajustar después.

### 2. Aplicar exactamente lo mismo a todos los servicios por comodidad
Puede servir al inicio, pero conviene mantener criterio.

### 3. No revisar el comportamiento posterior de los Pods
El YAML no alcanza; hay que observar el entorno.

### 4. Elegir piezas poco representativas para la primera iteración
Conviene empezar donde el valor operativo sea visible.

### 5. Pensar que esto ya resuelve toda la estrategia de recursos del cluster
Es el inicio del refinamiento, no su final absoluto.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, varias piezas importantes de NovaMarket deberían tener `requests` y `limits` aplicados razonablemente dentro del cluster.

Eso deja al bloque muy bien preparado para un nuevo checkpoint operativo.

---

## Punto de control

Antes de seguir, verificá que:

- los `Deployment` elegidos ya tienen bloque de `resources`,
- los Pods siguen sanos,
- los servicios siguen arrancando,
- los logs no muestran problemas obvios,
- y el cluster ya cuenta con una primera política explícita de recursos sobre piezas importantes.

Si eso está bien, ya podemos pasar a consolidar este nuevo refinamiento del entorno.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a revisar cómo queda NovaMarket después de introducir `requests` y `limits` y qué tan madura ya es la operación del cluster con este nuevo refinamiento.

---

## Cierre

En esta clase agregamos `requests` y `limits` a servicios importantes de NovaMarket dentro de Kubernetes.

Con eso, el bloque suma otra capa fuerte de madurez: el cluster ya no solo aloja una parte muy importante del sistema y la interpreta mejor en términos de salud, sino que también empieza a tener una idea más clara de cómo reservar y limitar recursos para sus piezas más críticas.
