---
title: "Ajustando réplicas en servicios importantes y preparando HPA"
description: "Primer paso concreto del escalado en Kubernetes. Ajuste de réplicas en piezas importantes de NovaMarket para preparar una futura política de autoscaling."
order: 111
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Ajustando réplicas en servicios importantes y preparando `HPA`

En la clase anterior dejamos claro algo importante:

- el cluster ya es lo suficientemente maduro como para que el escalado tenga sentido,
- y además ya construimos una muy buena base previa con configuración, probes y recursos.

Ahora toca el primer paso concreto de esta nueva etapa:

**trabajar con réplicas en servicios importantes del sistema.**

Todavía no vamos a saltar directamente a `HorizontalPodAutoscaler`.  
Antes conviene hacer algo más básico, más visible y muy valioso:

**dejar de asumir que ciertas piezas importantes deben vivir solo con una única réplica.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- revisado qué servicios importantes conviene escalar primero,
- ajustado el número de réplicas en uno o más `Deployment`,
- validado que el cluster sostiene esa nueva configuración,
- y preparada la base para introducir `HPA` en el siguiente paso del bloque.

La meta de hoy no es automatizar todavía el escalado.  
Es empezar a construir la idea operativa de múltiples instancias de forma clara y controlada.

---

## Estado de partida

Partimos de un cluster donde varias piezas importantes del sistema ya tienen:

- probes
- configuración más madura
- política inicial de recursos
- y una reconstrucción bastante rica del comportamiento del negocio

Eso significa que el entorno ya está en condiciones de sostener algo más que “una sola instancia para todo”.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir uno o más servicios donde el escalado tenga sentido,
- revisar sus `Deployment`,
- aumentar el número de réplicas,
- reaplicar los manifiestos,
- y validar que el cluster sostiene correctamente esta nueva etapa del entorno.

---

## Qué servicios conviene tocar primero

Para esta primera iteración, algunos candidatos muy razonables siguen siendo:

- `api-gateway`
- `order-service`

¿Por qué?

Porque son piezas donde el tráfico y el peso del sistema suelen sentirse de forma mucho más clara.

También es razonable incluir más adelante otras piezas, pero para inaugurar esta etapa conviene empezar donde el valor sea más visible y más fácil de justificar.

---

## Paso 1 · Revisar el `Deployment` actual de una pieza importante

Antes de cambiar nada, abrí el `Deployment` del primer servicio elegido, por ejemplo `api-gateway`.

La idea es ubicar claramente el campo:

```yaml
replicas: 1
```

o el valor equivalente que tenga hoy el manifiesto.

Eso nos deja listo el punto exacto donde vamos a introducir el primer refinamiento visible de esta etapa.

---

## Paso 2 · Ajustar la cantidad de réplicas

Ahora cambiá ese valor por algo más razonable para esta etapa del curso, por ejemplo:

```yaml
replicas: 2
```

No hace falta que el número sea enorme.  
Lo importante es que el cluster deje de sostener esa pieza como una única instancia y empiece a tratarla como un servicio con una pequeña base de redundancia o paralelismo.

Ese cambio ya enseña muchísimo.

---

## Paso 3 · Repetir el patrón en otra pieza crítica

Ahora hacé lo mismo con un segundo servicio relevante, por ejemplo `order-service`.

La idea es que el refinamiento no quede concentrado en una sola pieza de entrada, sino también en una pieza central del negocio.

Eso vuelve mucho más claro que estamos entrando de verdad en la etapa de escalado del bloque.

---

## Paso 4 · Reaplicar los `Deployment`

Después de ajustar las réplicas, reaplicá los manifiestos.

Este es el verdadero momento importante de la clase.

La idea es que el cluster ya no sostenga esas piezas solo como Pods únicos, sino como servicios con varias instancias activas.

---

## Paso 5 · Revisar los Pods generados

Ahora comprobá que Kubernetes haya creado las nuevas réplicas.

Queremos observar que:

- existen varios Pods del mismo servicio
- el cluster los sostiene correctamente
- y no aparecen señales obvias de degradación por el cambio

Este paso importa mucho porque transforma la idea de escalado en algo visible y real dentro del entorno.

---

## Paso 6 · Revisar la salud de esas nuevas instancias

Ahora mirá si los nuevos Pods:

- arrancan correctamente
- pasan sus probes
- y entran en estado listo de forma razonable

Esto es importante porque una cosa es pedir más réplicas.  
Y otra distinta es que el sistema efectivamente pueda sostenerlas sanamente.

---

## Paso 7 · Validar una señal funcional del servicio

Después del ajuste de réplicas, conviene volver a probar una señal funcional simple.

Por ejemplo:

- una ruta vía gateway
- o una parte del flujo principal

No hace falta todavía simular carga ni medir balanceo fino.  
Con validar que el sistema sigue respondiendo correctamente ya estamos ganando mucho valor.

---

## Paso 8 · Pensar qué cambió realmente

A esta altura conviene fijar algo importante:

antes, el sistema ya vivía de forma bastante madura dentro del cluster, pero ciertas piezas seguían pensadas como instancias únicas.

Ahora, en cambio, algunas de las más importantes ya empiezan a vivir como servicios con más de una réplica.

Eso tiene un peso operativo y conceptual bastante fuerte.

---

## Paso 9 · Entender por qué esto prepara muy bien `HPA`

Este paso vale muchísimo.

Ajustar réplicas manualmente no es el final del camino, pero sí prepara muy bien la siguiente etapa, porque instala algo fundamental:

**el servicio ya no está mentalmente anclado a una sola instancia.**

Ese cambio es una base excelente para que, en la próxima clase, tenga sentido introducir una política de escalado más dinámica.

---

## Paso 10 · No buscar todavía el escalado “ideal”

Conviene dejarlo muy claro.

En esta etapa no estamos todavía buscando:

- el número perfecto de réplicas para producción
- ni una política definitiva de alta disponibilidad

La meta es mucho más concreta:

**instalar el patrón de múltiples réplicas en piezas importantes y dejar lista la base para `HPA`.**

Eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase inaugura de forma concreta la etapa de escalado del bloque de Kubernetes.

Ya no solo hablamos de salud, configuración y recursos.  
Ahora el cluster empieza a sostener algunas piezas importantes del sistema con varias instancias reales.

Eso eleva bastante la madurez del entorno.

---

## Qué todavía no hicimos

Todavía no:

- automatizamos el escalado
- ni introdujimos un `HorizontalPodAutoscaler`
- ni validamos todavía una política dinámica de crecimiento

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**ajustar réplicas de forma explícita y preparar el siguiente salto del bloque.**

---

## Errores comunes en esta etapa

### 1. Querer saltar directo a `HPA` sin pasar por el cambio explícito de réplicas
Este paso ayuda mucho a entender mejor la transición.

### 2. Escalar demasiadas piezas a la vez
Conviene empezar por servicios donde el valor sea más claro.

### 3. No revisar que las nuevas réplicas realmente entren en estado sano
El cambio tiene que sostenerse de verdad dentro del cluster.

### 4. Pensar que dos réplicas ya equivalen a una estrategia final de producción
Esto sigue siendo una etapa de aprendizaje y maduración gradual.

### 5. No validar una señal funcional después del cambio
La mejora operativa tiene que seguir sosteniendo el comportamiento del sistema.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, al menos algunas piezas importantes de NovaMarket deberían estar corriendo con más de una réplica dentro del cluster.

Eso deja perfectamente preparado el siguiente paso del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- aumentaste réplicas en servicios importantes,
- los nuevos Pods existen,
- pasan sus probes,
- el sistema sigue respondiendo,
- y ya sentís que el entorno está listo para empezar a pensar en escalado dinámico.

Si eso está bien, ya podemos introducir `HPA`.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a entender por qué `HorizontalPodAutoscaler` ya tiene sentido en este punto del bloque y cómo se conecta con todo lo que venimos construyendo.

---

## Cierre

En esta clase ajustamos réplicas en servicios importantes de NovaMarket.

Con eso, el bloque de Kubernetes deja atrás la idea de servicio único como única forma de vivir dentro del cluster y prepara muy bien el terreno para una política de escalado más madura en las próximas clases.
