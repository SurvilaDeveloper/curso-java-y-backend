---
title: "Validando la externalización de configuración con ConfigMap y Secret"
description: "Checkpoint del refinamiento de configuración en Kubernetes. Verificación del uso de ConfigMap y Secret dentro de NovaMarket antes de seguir endureciendo el entorno del cluster."
order: 101
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Validando la externalización de configuración con `ConfigMap` y `Secret`

En las últimas clases del bloque de Kubernetes dimos un refinamiento muy importante al entorno de NovaMarket:

- entendimos por qué ya tenía sentido externalizar configuración,
- creamos un `ConfigMap` para datos no sensibles,
- y después creamos un `Secret` para datos sensibles.

Eso ya deja al sistema mucho más ordenado dentro del cluster.

Pero antes de seguir agregando más refinamientos, conviene hacer una pausa muy valiosa:

**validar que esta nueva estrategia de configuración realmente quedó bien integrada al entorno.**

Porque una cosa es crear los recursos.  
Y otra bastante distinta es comprobar que los servicios:

- los consumen correctamente,
- siguen arrancando,
- y el sistema se vuelve realmente más claro y más mantenible gracias a ellos.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- el `ConfigMap` ya participa correctamente del despliegue de al menos un servicio,
- el `Secret` también,
- los servicios siguen sanos después de esa externalización,
- y NovaMarket ya cuenta con una base bastante madura de configuración dentro del cluster.

Esta clase funciona como checkpoint importante antes de seguir endureciendo el entorno operativo.

---

## Estado de partida

Partimos de un cluster donde ya existe una reconstrucción muy significativa del sistema:

- núcleo base
- servicios funcionales principales
- gateway
- acceso maduro con `Ingress`
- y ahora también una primera capa de externalización de configuración con `ConfigMap` y `Secret`

Eso significa que el entorno ya no solo importa por lo que despliega, sino también por cómo está configurado.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar los recursos `ConfigMap` y `Secret`,
- revisar el servicio o los servicios que ya los consumen,
- comprobar su arranque y salud,
- y validar que esta nueva forma de configuración ya es parte real del entorno Kubernetes de NovaMarket.

---

## Por qué esta clase importa tanto

Porque este tipo de refinamiento puede parecer “solo prolijidad”, pero en realidad tiene muchísimo impacto.

Si queda bien hecho, ganamos:

- más claridad
- menos mezcla entre despliegue y configuración
- una base mejor para seguir evolucionando el sistema
- y una forma más madura de pensar el entorno

Si queda mal hecho, aparecen síntomas como:

- servicios que no arrancan
- variables no resueltas
- referencias mal conectadas
- o manifiestos aparentemente prolijos pero operativamente rotos

Por eso vale mucho validar este paso con calma.

---

## Paso 1 · Verificar que el `ConfigMap` existe

Antes de mirar los servicios, conviene confirmar que el `ConfigMap` que creamos realmente está presente en el namespace `novamarket`.

La idea es revisar:

- que existe
- que está correctamente nombrado
- y que contiene los valores no sensibles que decidimos externalizar

Este primer chequeo evita perseguir problemas de consumo cuando en realidad el recurso ni siquiera quedó bien aplicado.

---

## Paso 2 · Verificar que el `Secret` existe

Ahora hacé lo mismo con el `Secret`.

Queremos confirmar que:

- existe en el namespace correcto
- fue aplicado correctamente
- y ya forma parte real del entorno del cluster

No hace falta todavía mirar todos los detalles de cada valor.  
La prioridad es confirmar que el recurso está y que el bloque ya tiene ambos tipos de configuración externalizada.

---

## Paso 3 · Revisar qué `Deployment` consume el `ConfigMap`

Ahora conviene ir al servicio que elegiste en la clase anterior para usar configuración no sensible desde `ConfigMap`.

Puede ser, por ejemplo:

- `api-gateway`
- o `order-service`

La idea es revisar que en el `Deployment` realmente exista la referencia al recurso y que ya no dependa solo de valores embebidos de forma directa en el manifiesto.

---

## Paso 4 · Revisar qué `Deployment` consume el `Secret`

Ahora hacé lo mismo con el servicio donde decidiste usar configuración sensible.

Queremos confirmar que el `Deployment` ya no tenga ese valor delicado escrito directamente, sino que lo obtenga desde el `Secret`.

Este punto importa muchísimo porque es donde la mejora deja de ser teórica y pasa a formar parte del despliegue real.

---

## Paso 5 · Mirar los Pods de los servicios afectados

Ahora revisá el estado de los Pods de los servicios que fueron tocados por estos cambios.

Queremos comprobar que:

- existen
- no están en estados evidentemente problemáticos
- y no hay señales obvias de que la externalización de configuración haya roto el arranque

Este paso es muy importante porque la mejor prueba de que el refinamiento fue bueno es que el servicio sigue sano y operativo.

---

## Paso 6 · Revisar logs de los servicios modificados

Ahora mirá sus logs.

Queremos ver que:

- arrancan correctamente,
- no muestran errores de variables faltantes,
- no fallan por configuración mal resuelta,
- y el entorno ya reconoce bien esta nueva estrategia de configuración.

Este es probablemente uno de los puntos más importantes de toda la clase.

---

## Paso 7 · Pensar qué cambió realmente en los manifests

A esta altura conviene detenerse a mirar algo importante:

los `Deployment` ya no deberían sentirse tan cargados de detalles de configuración.

Empiezan a verse más como lo que realmente son:

- descripciones del despliegue
- apoyadas en recursos específicos para configuración

Ese cambio conceptual vale muchísimo y es una de las señales más fuertes de madurez del bloque.

---

## Paso 8 · Validar que el sistema siga comportándose bien

Si los servicios modificados participan de algún flujo ya validado en clases anteriores, este es un muy buen momento para volver a probar al menos una señal funcional básica.

La idea es comprobar que la mejora no solo es prolija, sino que también deja al sistema operando normalmente.

No hace falta todavía recorrer el sistema completo otra vez.  
Con una validación razonable del comportamiento ya estamos ganando mucho.

---

## Paso 9 · Comparar este estado con el anterior del bloque

Antes de introducir `ConfigMap` y `Secret`, el bloque ya funcionaba, pero la configuración podía sentirse más dispersa o más embebida de lo deseable.

Ahora, después de este checkpoint, deberíamos poder decir algo así:

- los servicios siguen funcionando
- pero ahora la configuración está mejor separada
- y el cluster se siente más ordenado en términos operativos

Esa mejora es muy valiosa aunque no cambie directamente la lógica del negocio.

---

## Paso 10 · Pensar qué viene después de esta etapa

Ahora que ya tenemos una base más madura de configuración, el siguiente refinamiento natural del bloque empieza a ser otro:

**cómo se comportan los servicios frente al arranque, la salud y la disponibilidad dentro del cluster.**

Eso nos empuja directamente al siguiente tema importante del roadmap:

- `readiness`
- `liveness`
- y probes de salud

Por eso esta clase funciona tan bien como bisagra.

---

## Qué estamos logrando con esta clase

Esta clase consolida la externalización de configuración del bloque de Kubernetes.

Ya no tenemos solo los recursos creados:  
ahora comprobamos que el sistema puede vivir apoyándose en ellos de forma sana.

Eso deja el entorno bastante más maduro.

---

## Qué todavía no hicimos

Todavía no:

- refinamos todos los servicios con la misma profundidad
- ni endurecimos todavía el comportamiento operativo del cluster frente a salud y disponibilidad

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**asegurar que `ConfigMap` y `Secret` ya quedaron realmente integrados al entorno.**

---

## Errores comunes en esta etapa

### 1. Ver que el recurso existe y asumir que ya todo está bien
También hay que validar consumo real desde los servicios.

### 2. No revisar logs
Los problemas de configuración suelen aparecer con mucha claridad ahí.

### 3. Pensar que este refinamiento es solo estético
En realidad cambia bastante la calidad operativa del entorno.

### 4. Mezclar sin querer responsabilidades entre `ConfigMap` y `Secret`
Conviene mantener la frontera clara.

### 5. Saltar al siguiente refinamiento sin validar este
Eso vuelve más difícil entender después dónde se rompió algo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías haber comprobado que `ConfigMap` y `Secret` ya forman parte real y funcional de la estrategia de despliegue de NovaMarket dentro de Kubernetes.

Eso deja al bloque perfectamente preparado para el siguiente refinamiento operativo.

---

## Punto de control

Antes de seguir, verificá que:

- el `ConfigMap` existe y se usa,
- el `Secret` existe y se usa,
- los servicios modificados siguen sanos,
- los logs no muestran errores de configuración importantes,
- y sentís que el entorno ya ganó claridad operativa gracias a esta separación.

Si eso está bien, ya podemos pasar a endurecer la salud de los servicios dentro del cluster.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a entender por qué `readiness` y `liveness` ya tienen sentido en este punto del bloque de Kubernetes.

Eso nos va a permitir seguir profesionalizando cómo viven los servicios dentro del cluster.

---

## Cierre

En esta clase validamos la externalización de configuración con `ConfigMap` y `Secret`.

Con eso, NovaMarket ya no solo tiene una parte importante del sistema reconstruida dentro de Kubernetes: también empieza a vivir con una estrategia de configuración mucho más madura, más ordenada y mejor alineada con el entorno.
