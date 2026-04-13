---
title: "Consolidando la política de recursos del cluster"
description: "Checkpoint del refinamiento de recursos en Kubernetes. Revisión del estado del cluster de NovaMarket después de introducir requests y limits en piezas importantes del sistema."
order: 109
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Consolidando la política de recursos del cluster

En las últimas clases del bloque de Kubernetes dimos otro refinamiento importante de madurez:

- entendimos por qué `requests` y `limits` ya tenían sentido,
- los aplicamos a varias piezas relevantes del sistema,
- y con eso el cluster dejó de interpretar esas aplicaciones solo por salud y disponibilidad, para empezar también a tener una primera lectura explícita de recursos.

Eso ya tiene muchísimo valor.

Ahora conviene hacer lo que venimos haciendo en cada salto importante del bloque:

**un checkpoint de consolidación.**

Porque una cosa es tocar varios `Deployment` con bloques de `resources`.  
Y otra bastante distinta es detenerse a mirar qué cambió realmente en la calidad del entorno.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- varias piezas importantes ya viven bajo una política explícita de recursos,
- el cluster sigue sosteniéndolas correctamente,
- NovaMarket se siente más maduro también desde el punto de vista del consumo y la reserva de recursos,
- y el entorno queda listo para seguir refinándose sobre una base mucho más seria.

Esta clase funciona como checkpoint fuerte del refinamiento de recursos del bloque.

---

## Estado de partida

Partimos de un cluster donde ya existen muchas capas de madurez acumuladas:

- servicios desplegados
- acceso vía gateway
- `Ingress`
- configuración externalizada
- probes
- y ahora también `requests` y `limits` en varias piezas críticas

Eso significa que el entorno ya no solo es funcional y más sano, sino que también empieza a ser más consciente del consumo esperado de sus servicios.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar los `Deployment` refinados,
- observar el comportamiento de los Pods,
- confirmar que el cluster sigue operativo,
- y consolidar este nuevo paso antes de pasar a otros refinamientos más avanzados del entorno.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si arrancan”.

Queremos observar algo más valioso:

- si los servicios siguen sanos con su nueva política de recursos
- si el entorno se siente más ordenado
- y si el cluster ya cuenta con una base mejor para sostener las piezas más importantes del sistema

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Revisar los `Deployment` que ya tienen bloque de `resources`

Primero conviene confirmar qué piezas importantes ya fueron refinadas.

Por ejemplo:

- `api-gateway`
- `order-service`
- `config-server`
- o `discovery-server`

La idea es mirar el conjunto de servicios donde ya introdujimos esta capa de madurez operativa.

---

## Paso 2 · Revisar el estado de sus Pods

Ahora comprobá que los Pods correspondientes:

- existen
- siguen sanos
- y no muestran señales de inestabilidad causadas por valores demasiado agresivos o poco realistas

Este paso es muy importante porque la política de recursos tiene valor solo si mejora el entorno sin volverlo arbitrariamente frágil.

---

## Paso 3 · Revisar logs de algunas piezas representativas

Conviene mirar al menos una o dos piezas críticas, por ejemplo:

- `api-gateway`
- y `order-service`

Queremos confirmar que:

- siguen arrancando con normalidad
- no muestran síntomas obvios de restricción mal calibrada
- y la nueva política de recursos convive razonablemente bien con la vida real de la aplicación

Esto ayuda muchísimo a consolidar la confianza sobre el refinamiento.

---

## Paso 4 · Validar una señal funcional del sistema

Después del cambio, conviene volver a probar una señal funcional razonable del entorno.

Por ejemplo:

- una ruta simple vía gateway
- o una parte del flujo principal que ya venías usando como checkpoint

La idea es confirmar que el cluster no solo se volvió más maduro en sus manifiestos, sino que sigue sosteniendo bien el comportamiento real del sistema.

---

## Paso 5 · Pensar qué cambió en la calidad del entorno

A esta altura conviene fijar algo importante:

antes, el cluster ya interpretaba mejor la salud y la disponibilidad.  
Ahora, además, empieza a tener una idea más explícita sobre:

- qué necesita cada pieza para vivir
- y qué techo razonable le queremos marcar

Eso significa que la operación del entorno ya no depende tanto del azar o de una lectura completamente implícita del consumo.

Ese cambio vale muchísimo.

---

## Paso 6 · Comparar este estado con etapas anteriores del bloque

Si miramos el recorrido completo del módulo, la evolución es muy clara:

### Primero
- reconstruir servicios

### Después
- validar circuitos funcionales

### Luego
- madurar entrada, configuración y salud

### Ahora
- empezar a madurar también la política de recursos

Eso muestra muy bien que el bloque no solo fue creciendo en cantidad de piezas, sino también en calidad operativa.

---

## Paso 7 · Entender qué todavía no estamos haciendo

Conviene dejar esto muy claro.

En este punto del bloque todavía no estamos:

- haciendo autoscaling
- definiendo políticas avanzadas de consumo
- ni ajustando el cluster con una mirada fina de carga real

Eso está bien.

La meta de este tramo es más concreta:

**dejar una primera política explícita y razonable de recursos en las piezas más importantes del sistema.**

Ese es un paso muy valioso por sí mismo.

---

## Paso 8 · Pensar qué refinamientos podrían venir después

Ahora que el cluster ya tiene una primera política de recursos, empiezan a quedar mejor preparados otros refinamientos del entorno.

Por ejemplo, más adelante pueden tener sentido cosas como:

- escalado
- observabilidad aún más rica
- y estrategias de operación más refinadas

No hace falta elegir el siguiente paso ahora.  
Lo importante es reconocer que el entorno ya alcanzó otro nivel de madurez.

---

## Qué estamos logrando con esta clase

Esta clase consolida otra etapa importante del bloque de Kubernetes.

Ya no estamos solo desplegando, configurando y endureciendo salud.  
Ahora también estamos empezando a darle al cluster una idea mucho más seria de cómo sostener el sistema en términos de recursos.

Eso eleva mucho la calidad operativa del entorno.

---

## Qué todavía no hicimos

Todavía no:

- agotamos todos los refinamientos posibles del cluster
- ni transformamos este entorno en una operación final de producción

Eso puede venir después.

La meta de hoy es mucho más concreta:

**consolidar la política inicial de recursos del bloque antes de seguir avanzando.**

---

## Errores comunes en esta etapa

### 1. Pensar que con poner `requests` y `limits` ya está todo resuelto
Esto es un gran paso, pero no el final del tema.

### 2. No volver a validar el comportamiento del sistema
La madurez operativa tiene que seguir sosteniendo funcionalidad real.

### 3. Mirar solo que los Pods sigan vivos
El valor también está en lo que cambió conceptualmente para el cluster.

### 4. Dar por hecho que los primeros valores son perfectos
Pueden refinarse más adelante.

### 5. Pasar al siguiente tema sin consolidar este
Eso haría más difícil leer después el estado real del entorno.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión bastante más clara de cómo quedó NovaMarket dentro del cluster después de introducir `requests` y `limits` y por qué el entorno ya es operativamente más maduro también desde el punto de vista de recursos.

Eso deja muy bien preparado el siguiente tramo del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- varias piezas críticas ya tienen `resources`,
- los Pods siguen sanos,
- el sistema mantiene funcionalidad importante,
- y sentís que el cluster ya ganó otra capa de madurez operativa gracias a este refinamiento.

Si eso está bien, entonces NovaMarket ya dio otro salto fuerte dentro de Kubernetes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a pensar el siguiente gran refinamiento del entorno apoyándonos en toda esta base que ya construimos: despliegue, acceso, configuración, salud y ahora también recursos.

---

## Cierre

En esta clase consolidamos la política de recursos del cluster.

Con eso, NovaMarket ya no solo tiene una parte muy importante del sistema reconstruida dentro de Kubernetes: también empieza a vivir en un entorno que interpreta mejor cuánto necesitan y cuánto deberían consumir varias de sus piezas más importantes.
