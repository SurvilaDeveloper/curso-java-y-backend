---
title: "Validando y consolidando las actualizaciones controladas"
description: "Checkpoint del refinamiento de actualizaciones en Kubernetes. Validación del comportamiento del rolling update y consolidación de esta nueva etapa del entorno de NovaMarket."
order: 118
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Validando y consolidando las actualizaciones controladas

En las últimas clases del bloque de Kubernetes dimos otro paso fuerte de madurez:

- entendimos por qué las actualizaciones controladas ya tenían sentido,
- ajustamos una estrategia de `rolling update` en una pieza importante del sistema,
- y dejamos instalada una política mucho más explícita sobre cómo evoluciona ese servicio dentro del cluster.

Eso ya tiene muchísimo valor.

Ahora conviene hacer lo que venimos haciendo cada vez que el bloque sube de nivel:

**un checkpoint de consolidación.**

Porque una cosa es modificar un `Deployment`.  
Y otra muy distinta es detenerse a mirar qué cambió realmente en la calidad operativa del entorno gracias a esa decisión.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- el servicio refinado sigue sano,
- la estrategia de `rolling update` ya forma parte real de su ciclo de vida dentro del cluster,
- NovaMarket empieza a tener una forma más madura de actualizar piezas importantes,
- y el bloque queda listo para seguir avanzando sobre una base mucho más seria.

Esta clase funciona como checkpoint fuerte del refinamiento de actualizaciones controladas.

---

## Estado de partida

Partimos de un cluster donde ya existen muchas capas de madurez acumuladas:

- despliegue de una parte muy importante del sistema
- entrada madura
- configuración externalizada
- probes
- política de recursos
- primeras decisiones de escalado
- y ahora también una estrategia más explícita de actualización

Eso significa que el entorno ya no solo está mejor construido.  
Empieza a estar también mejor gobernado en sus cambios.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el servicio donde aplicamos `rolling update`,
- observar cómo queda esa pieza dentro del cluster,
- validar que el sistema sigue funcional,
- y consolidar este nuevo paso del bloque antes de seguir con otros refinamientos.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si el YAML quedó bien”.

Queremos observar algo más valioso:

- si el servicio sigue sano,
- si el entorno ahora tiene una política de actualización más clara,
- y si NovaMarket ya empieza a dejar atrás una lógica demasiado implícita o brusca de evolución dentro del cluster.

Ese es el verdadero valor de este checkpoint.

---

## Paso 1 · Revisar el `Deployment` refinado

Primero conviene volver a abrir el `Deployment` donde ajustamos la estrategia de actualización.

Queremos confirmar que:

- la política sigue ahí
- y forma parte real de la definición del servicio

Este paso parece simple, pero ayuda mucho a fijar que el cambio ya no es una idea, sino una parte concreta del despliegue.

---

## Paso 2 · Revisar el estado de los Pods del servicio

Ahora mirá los Pods de esa pieza importante.

La idea es comprobar que:

- siguen sanos
- el entorno no quedó inestable
- y la estrategia más madura de actualización convive bien con probes, recursos y réplicas del servicio

Este punto es muy importante porque muestra si el refinamiento realmente encaja bien con el resto de las capas del bloque.

---

## Paso 3 · Revisar logs del servicio

Ahora mirá los logs del servicio refinado.

Queremos confirmar que:

- la aplicación sigue arrancando bien
- no aparece ninguna señal extraña en su comportamiento
- y el cambio de estrategia no dejó al entorno en un estado problemático

Esto ayuda muchísimo a consolidar confianza sobre el refinamiento.

---

## Paso 4 · Validar una señal funcional del sistema

Como en otros checkpoints del bloque, conviene probar una señal funcional importante.

Por ejemplo:

- una ruta simple vía gateway
- o una parte del flujo principal que ya venías usando como referencia

La idea es comprobar que esta nueva capa de control sobre las actualizaciones sigue sosteniendo correctamente el comportamiento real del sistema.

---

## Paso 5 · Pensar qué cambió en la calidad del entorno

A esta altura conviene fijar algo importante:

antes, el bloque ya tenía servicios vivos, sanos y mejor configurados.

Pero ahora también empieza a tener algo más:

- una política más explícita sobre cómo cambian esas piezas
- y una forma más madura de pensar sus actualizaciones

Ese salto vale muchísimo, porque hace que el cluster ya no solo sostenga servicios, sino también su evolución de una forma más seria.

---

## Paso 6 · Comparar este estado con el de etapas anteriores del bloque

Si miramos el recorrido completo del módulo, la evolución es muy clara:

### Primero
- reconstruir el sistema dentro del cluster

### Después
- hacerlo accesible
- ordenar configuración
- endurecer salud
- madurar recursos
- empezar con escalado

### Ahora
- empezar a profesionalizar también la forma en que las piezas se actualizan

Ese recorrido muestra muy bien cómo el bloque fue subiendo de nivel sin perder coherencia.

---

## Paso 7 · Entender qué todavía no estamos haciendo

Conviene dejar esto muy claro.

En esta etapa todavía no estamos:

- diseñando una estrategia completa de deployment continuo de producción
- ni usando patrones más avanzados como canary o blue-green
- ni refinando todavía todos los servicios con la misma profundidad

Eso está bien.

La meta actual es mucho más concreta:

**consolidar una primera estrategia razonable de actualización controlada dentro del cluster.**

Y eso ya es un paso muy valioso.

---

## Paso 8 · Pensar qué refinamientos quedan mejor preparados después de este punto

Ahora que el entorno ya tiene:

- probes
- recursos
- escalado
- y una estrategia inicial de actualización más madura

quedan mejor preparados otros refinamientos operativos del bloque, como por ejemplo:

- observabilidad más rica
- políticas más finas por servicio
- o nuevas mejoras del ciclo de vida del despliegue

No hace falta elegir el siguiente paso ahora mismo.  
Lo importante es reconocer que el cluster ya alcanzó otro nivel de madurez.

---

## Qué estamos logrando con esta clase

Esta clase consolida otra etapa importante del bloque de Kubernetes.

Ya no estamos solo haciendo que el sistema viva, escale y se mantenga sano.  
Ahora también estamos empezando a hacer que cambie y evolucione de una forma más madura dentro del cluster.

Eso eleva mucho la calidad operativa del entorno.

---

## Qué todavía no hicimos

Todavía no:

- agotamos todas las formas posibles de rollout
- ni convertimos esta etapa en una estrategia final de producción

Eso puede venir después.

La meta de hoy es mucho más concreta:

**consolidar la primera versión seria de las actualizaciones controladas dentro del bloque.**

---

## Errores comunes en esta etapa

### 1. Pensar que por ajustar `rolling update` ya todo el tema de despliegues está resuelto
En realidad recién empieza una etapa más madura.

### 2. Mirar solo que el servicio sigue vivo y no el cambio conceptual del entorno
La clase vale mucho por esa evolución operativa.

### 3. No volver a validar una señal funcional del sistema
Toda mejora operativa tiene que seguir sosteniendo el comportamiento real del negocio.

### 4. Tratar este refinamiento como algo aislado del resto del bloque
En realidad encaja de forma muy natural con probes, recursos y escalado.

### 5. Pasar al siguiente tema sin consolidar este
Eso haría más difícil entender después el nivel real de madurez del cluster.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión mucho más clara de cómo quedó NovaMarket dentro del cluster después de introducir una estrategia inicial de actualización controlada y por qué el entorno ya es más maduro también desde el punto de vista de su evolución.

Eso deja muy bien preparado el siguiente tramo del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- el servicio refinado sigue sano,
- la estrategia de `rolling update` ya forma parte real del `Deployment`,
- el sistema mantiene funcionalidad importante,
- y sentís que el cluster ya ganó otra capa de madurez gracias a este refinamiento.

Si eso está bien, entonces NovaMarket ya dio otro salto fuerte dentro de Kubernetes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a pensar el siguiente gran refinamiento del entorno apoyándonos en toda esta base que ya construimos: acceso, configuración, salud, recursos, escalado y ahora también actualizaciones más maduras.

---

## Cierre

En esta clase validamos y consolidamos las actualizaciones controladas en NovaMarket dentro de Kubernetes.

Con eso, el bloque ya no solo tiene una parte muy importante del sistema reconstruida, sana, escalable y mejor configurada dentro del cluster: también empieza a actualizarla de una forma mucho más seria y mucho más propia del mundo Kubernetes.
