---
title: "Creando un HPA para un servicio importante"
description: "Primer paso concreto del escalado dinámico en Kubernetes. Creación de un HorizontalPodAutoscaler para una pieza importante de NovaMarket dentro del cluster."
order: 113
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Creando un `HPA` para un servicio importante

En la clase anterior dejamos claro algo muy importante:

- el cluster ya es lo suficientemente maduro como para que el escalado dinámico tenga sentido,
- ya no dependemos solo de una cantidad fija de réplicas,
- y además construimos una base muy buena con probes, recursos y múltiples instancias en piezas importantes.

Ahora toca el paso concreto:

**crear el primer `HorizontalPodAutoscaler` del bloque.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- elegido un servicio importante del sistema para inaugurar el autoscaling,
- creado un recurso `HPA`,
- conectada esa política a un `Deployment` real de NovaMarket,
- y preparada la base para empezar a observar un escalado más dinámico dentro del cluster.

Todavía no vamos a cerrar una estrategia final de producción.  
La meta de hoy es instalar correctamente el primer patrón real de autoscaling.

---

## Estado de partida

Partimos de un cluster donde varias piezas del sistema ya viven con bastante madurez:

- despliegues funcionales
- acceso por gateway e `Ingress`
- configuración externalizada
- probes
- política inicial de recursos
- y, además, una primera ampliación manual de réplicas en servicios importantes

Eso significa que ya existe casi todo lo necesario para dar el siguiente paso lógico.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir un servicio adecuado para el primer `HPA`,
- revisar el `Deployment` al que va a apuntar,
- definir un mínimo y un máximo de réplicas,
- crear el recurso,
- y aplicarlo dentro del cluster.

---

## Qué servicio conviene elegir primero

Para esta primera experiencia, un muy buen candidato puede ser:

- `api-gateway`
- o `order-service`

¿Por qué?

Porque son piezas donde:

- el tráfico es más intuitivo,
- el valor del escalado es fácil de explicar,
- y el impacto del autoscaling se entiende mucho mejor que en servicios secundarios.

Para esta clase, `api-gateway` es una gran opción porque es una pieza de entrada bastante visible y muy buena para inaugurar esta etapa.

---

## Paso 1 · Verificar que el `Deployment` ya tiene una base razonable

Antes de crear el `HPA`, conviene revisar que el servicio elegido ya tenga:

- probes razonables
- `requests` definidos
- y una estructura suficientemente madura dentro del cluster

Esto importa mucho porque el autoscaling no debería caer sobre una pieza todavía inmadura o mal calibrada.

---

## Paso 2 · Recordar qué necesita `HPA` para funcionar bien

En una instalación razonable de Kubernetes, `HPA` suele apoyarse en métricas del entorno para tomar decisiones.

No hace falta convertir esta clase en una guía exhaustiva de `metrics-server`, pero sí conviene confirmar que tu entorno cuenta con la base necesaria para que el cluster pueda observar señales útiles del servicio.

La idea es evitar tratar al `HPA` como si fuera una especie de magia aislada.

---

## Paso 3 · Elegir el rango de escalado

Ahora conviene definir algo muy claro:

- un mínimo de réplicas
- y un máximo de réplicas

Para esta etapa del curso práctico, una base razonable y simple puede ser algo como:

- mínimo: `2`
- máximo: `5`

No hace falta que esos valores sean definitivos ni perfectos para producción.  
Lo importante es que ya expresen que el servicio tiene una base estable, pero también un margen para crecer.

---

## Paso 4 · Elegir la señal base de escalado

Para una primera versión didáctica, una opción muy razonable es usar utilización de CPU.

No hace falta todavía entrar en métricas complejas.

Lo importante es que el recurso exprese algo como:

- si la utilización promedio supera cierto umbral,
- Kubernetes puede aumentar la cantidad de réplicas dentro del rango permitido

Ese tipo de política ya aporta muchísimo valor para esta etapa.

---

## Paso 5 · Crear el recurso `HPA`

Ahora creá algo como:

```txt
k8s/services/api-gateway/hpa.yaml
```

Una base conceptual razonable podría verse así:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway
  namespace: novamarket
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 2
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

No hace falta que estos valores sean exactamente los finales para tu entorno, pero sí conviene que la primera versión sea simple, clara y fácil de explicar.

---

## Qué expresa este recurso

Este `HPA` está diciendo algo muy importante:

- `api-gateway` ya no queda atado a una cantidad fija de Pods
- puede moverse dentro de un rango definido
- y el cluster empieza a tener permiso explícito para participar en ese escalado

Eso es un cambio bastante fuerte respecto de todo lo que veníamos haciendo antes.

---

## Paso 6 · Aplicar el `HPA`

Ahora aplicá el recurso al namespace `novamarket`.

La idea es que el cluster ya no solo conozca el `Deployment` del servicio, sino también la política bajo la cual podría escalarlo.

Este es el verdadero momento importante de la clase.

---

## Paso 7 · Verificar que el recurso exista

Después de aplicarlo, comprobá que el `HPA` ya existe dentro del namespace.

Queremos confirmar que la nueva política ya forma parte real del entorno y que no quedó solo como un archivo escrito en el repo.

---

## Paso 8 · Revisar la relación entre `Deployment` y `HPA`

Ahora conviene mirar algo conceptualmente importante:

- el `Deployment` sigue describiendo cómo corre el servicio
- y el `HPA` agrega una política dinámica sobre la cantidad de réplicas

Ese encastre es una de las ideas más valiosas de esta etapa del bloque.

---

## Paso 9 · No buscar todavía una gran prueba de carga

En esta clase todavía no hace falta provocar una situación compleja de consumo.

La meta actual es más concreta:

- dejar el recurso correctamente creado
- confirmar que apunta al `Deployment` correcto
- y validar que el cluster ya cuenta con esta nueva capa de escalado dinámico

La observación más fuerte del comportamiento la vamos a hacer en la próxima clase.

---

## Paso 10 · Pensar qué cambió en el modelo mental del bloque

Hasta ahora veníamos pensando cosas como:

- este servicio corre con 1 réplica
- este otro con 2

Ahora, en cambio, el lenguaje empieza a ser otro:

- este servicio puede oscilar entre un mínimo y un máximo según la situación

Ese cambio vale muchísimo, porque marca una nueva etapa de madurez del entorno.

---

## Qué estamos logrando con esta clase

Esta clase introduce uno de los refinamientos más propios del mundo Kubernetes dentro de todo el bloque.

Ya no solo estamos desplegando, configurando, endureciendo salud y definiendo recursos.

Ahora también empezamos a darle al cluster una política explícita de crecimiento dinámico.

Eso es una mejora muy importante.

---

## Qué todavía no hicimos

Todavía no:

- validamos el comportamiento real del `HPA`
- observamos el escalado en acción
- ni comparamos operativamente esta etapa con la del escalado manual

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**crear correctamente el primer `HorizontalPodAutoscaler` del bloque.**

---

## Errores comunes en esta etapa

### 1. Crear un `HPA` sin haber trabajado antes probes y recursos
Este paso tiene mucho más sentido apoyado en toda la base previa.

### 2. Elegir un servicio poco representativo para la primera experiencia
Conviene empezar donde el valor del escalado se entienda bien.

### 3. Usar un rango de réplicas demasiado extremo
Para esta etapa, una versión simple y razonable es mejor.

### 4. Pensar que esta clase ya debe probar el escalado a fondo
Hoy la prioridad es instalar bien la política.

### 5. No verificar que el recurso efectivamente existe dentro del namespace
Siempre conviene validar el estado real en el cluster.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería tener su primer `HPA` real dentro de Kubernetes, apuntando a una pieza importante del sistema.

Eso deja perfectamente preparado el siguiente checkpoint del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- existe un `HPA` real en el namespace,
- apunta al `Deployment` correcto,
- tiene un mínimo y un máximo razonables,
- y ya representa una política dinámica de escalado para una pieza importante del sistema.

Si eso está bien, ya podemos pasar a validar su comportamiento dentro del cluster.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a observar el comportamiento del `HPA` y a validar cómo se ve NovaMarket cuando el cluster ya puede participar dinámicamente del escalado.

---

## Cierre

En esta clase creamos el primer `HorizontalPodAutoscaler` de NovaMarket.

Con eso, el bloque de Kubernetes da otro salto fuerte de madurez: el cluster ya no solo aloja una parte muy importante del sistema, sino que también empieza a tener permiso explícito para acompañar su crecimiento de una forma mucho más propia del entorno.
