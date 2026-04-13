---
title: "Creando un ConfigMap para configuración no sensible"
description: "Primer paso concreto del refinamiento de configuración en Kubernetes. Creación de un ConfigMap para NovaMarket y uso dentro de uno de los Deployments del sistema."
order: 99
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Creando un `ConfigMap` para configuración no sensible

En la clase anterior dejamos claro algo importante:

- NovaMarket ya está lo suficientemente reconstruido dentro del cluster como para que empiece a importar no solo qué servicios viven ahí,
- sino también **cómo** están configurados.

Eso nos llevó a distinguir dos grandes tipos de datos:

- configuración no sensible
- y configuración sensible

Ahora toca el primer paso concreto de ese refinamiento:

**crear un `ConfigMap` para configuración no sensible.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un `ConfigMap` para NovaMarket,
- modelada una primera porción de configuración no sensible fuera de un `Deployment`,
- y aplicado ese `ConfigMap` a uno de los servicios ya desplegados dentro del cluster.

Todavía no vamos a introducir `Secret`.  
La meta de hoy es instalar bien la primera capa del refinamiento de configuración.

---

## Estado de partida

Partimos de un cluster donde ya existen varias piezas importantes del sistema y donde algunos `Deployment` probablemente todavía cargan bastante configuración directamente embebida en sus manifests.

Eso estuvo bien para avanzar más rápido en el bloque.  
Pero ahora ya podemos empezar a ordenar eso mejor.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- identificar una porción razonable de configuración no sensible,
- crear un `ConfigMap`,
- conectarlo con un servicio del sistema,
- y verificar que el recurso ya participa del despliegue real de NovaMarket dentro del cluster.

---

## Qué problema queremos resolver exactamente

Queremos evitar que los `Deployment` sigan mezclando demasiado:

- definición del contenedor
- y datos de configuración que podrían vivir fuera

Eso vuelve más legible el despliegue y deja el manifiesto enfocado en cosas como:

- imagen
- réplicas
- puertos
- health
- estrategia de ejecución

mientras que la configuración no sensible empieza a vivir en un recurso más apropiado.

---

## Paso 1 · Elegir un servicio inicial para usar `ConfigMap`

Para esta primera versión, conviene elegir un servicio que:

- ya esté desplegado,
- tenga una configuración relativamente clara,
- y no nos obligue a resolver demasiadas cosas sensibles todavía.

Un buen candidato puede ser:

- `api-gateway`
- o `order-service`

En esta clase vamos a pensar el ejemplo con uno de esos servicios, porque son piezas donde ya se siente bastante el valor de externalizar configuración de entorno.

---

## Paso 2 · Identificar variables no sensibles razonables

Una selección simple y útil puede incluir cosas como:

- URL de `config-server`
- URL de `discovery-server`
- perfil activo
- host de `zipkin`
- host interno de algún componente no sensible

No hace falta meter demasiados valores de una sola vez.  
Conviene empezar con una versión pequeña, clara y bien justificada.

---

## Paso 3 · Crear una carpeta o ubicación razonable para el recurso

Una buena opción puede ser algo como:

```txt
k8s/base/configmap.yaml
```

o, si preferís una organización más específica:

```txt
k8s/base/novamarket-config.yaml
```

La idea es que el recurso quede ubicado en una zona lógica de la estructura del proyecto y no perdido entre manifests de servicios individuales.

---

## Paso 4 · Crear el recurso `ConfigMap`

Una base conceptual razonable podría verse así:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: novamarket-config
  namespace: novamarket
data:
  CONFIG_SERVER_URL: "http://config-server:8888"
  EUREKA_SERVER_URL: "http://discovery-server:8761/eureka"
  SPRING_PROFILES_ACTIVE: "k8s"
  ZIPKIN_URL: "http://zipkin:9411"
```

No hace falta que estos nombres sean exactamente los mismos que usa tu implementación actual, pero sí conviene que el recurso sea claro y que agrupe configuración no sensible del entorno.

---

## Qué expresa este recurso

Este `ConfigMap` está diciendo algo muy valioso:

- estos valores forman parte de la configuración del entorno,
- no son secretos,
- y no tienen por qué seguir escritos directamente dentro de cada `Deployment`

Eso ya es una mejora conceptual importante.

---

## Paso 5 · Aplicar el `ConfigMap`

Ahora aplicá el recurso al namespace `novamarket`.

La idea es que el cluster ya tenga disponible un recurso explícito de configuración no sensible sobre el que podamos empezar a apoyar los servicios del sistema.

---

## Paso 6 · Elegir un `Deployment` para consumirlo

Ahora vamos al siguiente paso importante:

hacer que un servicio real empiece a usar este recurso.

Un ejemplo razonable sería ajustar el `Deployment` de `api-gateway` para que tome variables del `ConfigMap`.

No hace falta que migres absolutamente toda su configuración de una sola vez.  
Con mover una porción clara ya estamos logrando muchísimo valor.

---

## Paso 7 · Inyectar variables desde `ConfigMap`

Una forma conceptual razonable dentro del contenedor del `Deployment` puede verse así:

```yaml
envFrom:
  - configMapRef:
      name: novamarket-config
```

Otra opción sería mapear variables individualmente, pero para esta primera clase de `ConfigMap`, la carga desde `envFrom` suele ser muy clara y muy didáctica.

---

## Paso 8 · Reaplicar el `Deployment`

Después de ajustar el `Deployment` del servicio elegido, reaplicá el manifiesto.

La idea es que el servicio ya no dependa solamente de valores embebidos en su definición, sino que empiece a apoyarse en el `ConfigMap` del entorno.

Este es el verdadero momento importante de la clase.

---

## Paso 9 · Verificar el arranque del servicio

Ahora comprobá que el servicio:

- sigue arrancando,
- no entra en crash loop,
- y no muestra señales de haber roto su configuración básica por el cambio

La idea es validar que el paso hacia `ConfigMap` no solo ordena el manifiesto, sino que también funciona realmente en el entorno.

---

## Paso 10 · Pensar qué cambió en el `Deployment`

A esta altura conviene notar algo importante:

el `Deployment` del servicio ahora ya no se siente tan cargado de detalles de configuración no sensible.

Empieza a verse más como lo que realmente es:

- una descripción del despliegue
- apoyada en un recurso externo para parte de su configuración

Ese cambio vale mucho.

---

## Paso 11 · Pensar qué otros servicios podrían migrar después

Después de esta primera aplicación, ya debería empezar a quedar claro que este patrón también podría extenderse a:

- `order-service`
- `notification-service`
- `inventory-service`
- `catalog-service`
- e incluso algunas piezas base si la estrategia del proyecto lo justifica

No hace falta hacer todo eso hoy.  
Lo importante es instalar bien el criterio.

---

## Qué estamos logrando con esta clase

Esta clase le agrega al bloque una nueva capa de madurez:

**ya no solo estamos desplegando servicios. También empezamos a externalizar mejor su configuración no sensible.**

Eso vuelve el entorno mucho más limpio, más legible y más propio del mundo Kubernetes.

---

## Qué todavía no hicimos

Todavía no:

- movimos configuración sensible
- introdujimos `Secret`
- ni refinamos todavía una estrategia completa para todos los servicios del sistema

Todo eso viene después.

La meta de hoy es mucho más concreta:

**crear el primer `ConfigMap` real del bloque y usarlo en un servicio.**

---

## Errores comunes en esta etapa

### 1. Meter demasiada configuración de una sola vez en el primer `ConfigMap`
Conviene empezar chico y claro.

### 2. Mezclar datos sensibles dentro del `ConfigMap`
Justamente queremos evitar eso.

### 3. Reaplicar el `Deployment` sin revisar cómo queda referenciado el recurso
Siempre conviene validar bien la relación.

### 4. Pensar que `ConfigMap` reemplaza la configuración de aplicación completa
No; es una herramienta más dentro de la estrategia del entorno.

### 5. No verificar el arranque del servicio después del cambio
La mejora tiene que funcionar, no solo verse prolija.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería tener un `ConfigMap` real dentro del namespace y al menos uno de sus servicios ya debería estar consumiendo configuración no sensible desde ese recurso.

Eso deja perfectamente preparado el siguiente paso del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- el `ConfigMap` existe,
- está en el namespace correcto,
- al menos un servicio lo consume,
- el servicio sigue arrancando,
- y entendés el valor de sacar configuración no sensible fuera del `Deployment`.

Si eso está bien, ya podemos pasar a la siguiente capa del refinamiento: `Secret`.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a crear un `Secret` para datos sensibles y usarlo en uno de los servicios del sistema.

Ese será el paso que complete la primera versión madura de externalización de configuración dentro del bloque de Kubernetes.

---

## Cierre

En esta clase creamos el primer `ConfigMap` real de NovaMarket dentro de Kubernetes.

Con eso, el bloque empieza a dejar atrás una parte importante de la configuración embebida en los manifiestos y da un paso muy claro hacia una forma de operación más ordenada y más madura dentro del cluster.
