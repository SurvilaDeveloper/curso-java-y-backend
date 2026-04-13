---
title: "Ajustando rolling update en un servicio importante"
description: "Primer paso concreto de las actualizaciones controladas en Kubernetes. Ajuste de la estrategia de rolling update en una pieza importante de NovaMarket dentro del cluster."
order: 117
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Ajustando `rolling update` en un servicio importante

En la clase anterior dejamos claro algo importante:

- el cluster ya es lo suficientemente maduro como para que las actualizaciones controladas tengan sentido,
- y además ya construimos una muy buena base previa con probes, recursos, réplicas y un primer `HPA`.

Ahora toca el paso concreto:

**ajustar una estrategia de `rolling update` en un servicio importante.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- elegido un servicio importante del sistema para inaugurar este refinamiento,
- ajustada su estrategia de actualización,
- reaplicado el `Deployment`,
- y preparada la base para validar una transición de versión más madura dentro del cluster.

Todavía no vamos a hablar de despliegues avanzados.  
La meta de hoy es instalar bien el patrón de `rolling update` donde más valor aporta primero.

---

## Estado de partida

Partimos de un cluster donde el entorno ya tiene bastante madurez acumulada:

- servicios funcionales importantes
- acceso por `Ingress`
- configuración externalizada
- probes
- política de recursos
- réplicas múltiples
- y un primer `HPA`

Eso significa que el entorno ya está en condiciones de sostener algo más refinado que una simple sustitución brusca de Pods.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir un servicio importante del sistema,
- revisar su `Deployment`,
- ajustar la estrategia de actualización,
- reaplicar el manifiesto,
- y dejar lista la base para validar cómo se comporta el cluster ante un cambio más controlado.

---

## Qué servicio conviene elegir primero

Para esta primera iteración, un candidato muy razonable puede ser:

- `api-gateway`
- o `order-service`

¿Por qué?

Porque son piezas donde el valor de una actualización controlada se entiende con mucha claridad, tanto por su peso funcional como por su visibilidad dentro del sistema.

Para esta clase, `api-gateway` es un ejemplo especialmente bueno porque es una pieza de entrada muy fácil de observar.

---

## Paso 1 · Revisar el `Deployment` actual del servicio elegido

Antes de cambiar nada, conviene abrir el `Deployment` del servicio y ubicar claramente el lugar donde vive la estrategia del despliegue.

La idea es ver con claridad el punto exacto donde vamos a pasar de una configuración más implícita o más básica a una definición más explícita de actualización.

---

## Paso 2 · Pensar qué queremos lograr con esta estrategia

A esta altura del bloque, la idea no es “poner más YAML”.

La idea es que el cluster ya tenga una política más clara sobre cómo reemplazar Pods de una versión por otra.

Eso significa que queremos una transición más gradual y más predecible entre:

- Pods viejos
- y Pods nuevos

especialmente en una pieza importante del sistema.

---

## Paso 3 · Ajustar la estrategia de actualización

Una base conceptual razonable dentro del `Deployment` puede verse así:

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0
    maxSurge: 1
```

No hace falta que estos valores sean los únicos posibles para tu entorno, pero para una primera iteración didáctica son muy útiles porque expresan algo bastante claro:

- no queremos degradar innecesariamente la disponibilidad
- y permitimos un reemplazo gradual controlado

Eso ya aporta muchísimo valor.

---

## Qué expresa esta configuración

Este ajuste le dice al cluster algo importante:

- no reemplaces todo de golpe
- mantené el servicio disponible
- y permití una transición progresiva entre la versión anterior y la nueva

Ese cambio es muy fuerte comparado con una lógica más tosca o menos explícita de actualización.

---

## Paso 4 · Reaplicar el `Deployment`

Después de ajustar la estrategia, reaplicá el manifiesto.

La idea es que el servicio ya no dependa solo de la estrategia por defecto o implícita, sino que empiece a tener una política de actualización más claramente declarada.

Este es el verdadero momento importante de la clase.

---

## Paso 5 · Validar que el `Deployment` quedó correctamente actualizado

Ahora comprobá que el `Deployment` siga existiendo y que la nueva estrategia haya quedado reflejada en el recurso.

No hace falta todavía disparar un cambio de imagen complejo.  
Primero queremos confirmar que la política ya forma parte real del estado del entorno.

---

## Paso 6 · Revisar la salud del servicio después del cambio

Ahora comprobá que el servicio:

- sigue sano
- mantiene sus Pods
- y no muestra ninguna degradación obvia por haber ajustado la estrategia de despliegue

La idea es confirmar que el nuevo nivel de control no introduce inestabilidad gratuita en la pieza elegida.

---

## Paso 7 · Entender qué cambió en el modelo mental del bloque

A esta altura conviene fijar algo importante:

antes, podíamos pensar las actualizaciones como algo más bien difuso o muy implícito.

Ahora, en cambio, el entorno empieza a decir de forma más explícita:

- cómo se actualiza una pieza
- y bajo qué reglas de reemplazo queremos que el cluster haga ese trabajo

Ese cambio vale muchísimo y es una gran señal de madurez operativa.

---

## Paso 8 · Pensar qué tipo de validación viene después

Después de esta clase, la pregunta natural es:

**¿cómo se ve esta estrategia cuando realmente hay una transición entre Pods viejos y nuevos?**

Esa es justamente la validación que vamos a trabajar en la próxima clase.

La idea de hoy fue dejar la política instalada y lista, no agotar todavía todo el recorrido.

---

## Paso 9 · Pensar qué servicios podrían seguir después

Una vez instalado el patrón en una pieza importante, ya empieza a quedar claro que esto también podría aplicarse, más adelante, a otras partes relevantes del sistema como:

- `order-service`
- `api-gateway` si elegiste otra pieza
- y eventualmente otros servicios donde el valor del rollout controlado sea claro

No hace falta hacerlo todo hoy.  
Lo importante es instalar bien el criterio.

---

## Qué estamos logrando con esta clase

Esta clase agrega otra capa de madurez muy propia del mundo Kubernetes dentro del bloque.

Ya no estamos solo pensando:

- cómo vive el servicio
- cómo se configura
- cómo escala
- y cómo se mantiene sano

Ahora también empezamos a pensar:

- cómo evoluciona de una versión a otra dentro del cluster

Eso es una mejora muy importante.

---

## Qué todavía no hicimos

Todavía no:

- validamos el comportamiento real del rollout
- ni observamos una transición concreta dentro del entorno

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**instalar una estrategia de `rolling update` en un servicio importante.**

---

## Errores comunes en esta etapa

### 1. Pensar que el rollout controlado es solo “otro detalle del Deployment”
En realidad cambia bastante la forma de entender las actualizaciones.

### 2. Elegir una pieza poco representativa para la primera iteración
Conviene empezar donde el valor del cambio sea visible.

### 3. Poner una estrategia demasiado agresiva o demasiado rara para una primera versión
Para esta etapa, una configuración simple y clara es mejor.

### 4. Reaplicar el `Deployment` y no verificar cómo quedó la estrategia
Siempre conviene validar el estado real del recurso.

### 5. Querer agotar toda la validación en esta misma clase
Hoy la prioridad es instalar bien la política.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, al menos una pieza importante de NovaMarket debería tener una estrategia explícita de `rolling update` dentro de su `Deployment`.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- elegiste un servicio importante,
- ajustaste la estrategia de actualización,
- el `Deployment` sigue sano,
- la política quedó reflejada en el cluster,
- y entendés por qué esto ya cambia la madurez del entorno.

Si eso está bien, ya podemos pasar a validar el comportamiento real del rollout dentro del cluster.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a observar cómo se comporta NovaMarket con esta estrategia de actualización más controlada y consolidar este nuevo refinamiento del bloque.

---

## Cierre

En esta clase ajustamos `rolling update` en un servicio importante de NovaMarket.

Con eso, el bloque de Kubernetes suma otra capa fuerte de madurez: el cluster ya no solo sostiene una parte importante del sistema con buena salud, recursos y escalado, sino que también empieza a actualizarla de una forma mucho más controlada.
