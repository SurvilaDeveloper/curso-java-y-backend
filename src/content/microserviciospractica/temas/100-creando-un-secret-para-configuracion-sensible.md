---
title: "Creando un Secret para configuración sensible"
description: "Continuación del refinamiento de configuración en Kubernetes. Creación de un Secret para NovaMarket y uso dentro de uno de los Deployments del sistema."
order: 100
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Creando un `Secret` para configuración sensible

En la clase anterior dimos un paso muy importante dentro del bloque de Kubernetes:

- creamos un `ConfigMap`,
- externalizamos configuración no sensible,
- y además lo conectamos con uno de los servicios ya desplegados en el cluster.

Eso ya dejó al bloque mucho más maduro.

Pero todavía nos falta completar la otra mitad de la idea:

**la configuración sensible.**

Porque una cosa es externalizar datos operativos comunes.  
Y otra muy distinta es decidir correctamente qué hacer con valores como:

- credenciales
- client secrets
- passwords
- y otros datos delicados del entorno

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un `Secret` para NovaMarket,
- modelada una primera porción de configuración sensible fuera del `Deployment`,
- usado ese `Secret` en al menos uno de los servicios del sistema,
- y cerrada una primera versión bastante madura de externalización de configuración dentro del bloque de Kubernetes.

Todavía no vamos a agotar todas las estrategias de seguridad posibles del cluster.  
La meta de hoy es instalar bien el patrón correcto.

---

## Estado de partida

Partimos de un entorno donde:

- el sistema ya vive de forma bastante importante dentro del cluster,
- ya tenemos un `ConfigMap` para configuración no sensible,
- y algunos `Deployment` todavía pueden requerir datos sensibles que conviene dejar de manejar de forma demasiado directa o mezclada.

Eso deja perfectamente planteado el siguiente paso.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- identificar un tipo razonable de dato sensible del entorno,
- crear un `Secret`,
- conectarlo con uno de los servicios del sistema,
- y verificar que la aplicación siga comportándose correctamente después del cambio.

---

## Qué problema queremos resolver exactamente

Queremos evitar que datos sensibles queden:

- mezclados con configuración no sensible,
- demasiado visibles dentro de manifests comunes,
- o tratados como si fueran simples variables operativas del entorno

No hace falta sobreprometer seguridad absoluta con solo usar `Secret`.  
Pero sí es un paso muy importante para separar mejor el tratamiento de los datos delicados.

---

## Paso 1 · Elegir un caso de uso razonable para el primer `Secret`

Para esta etapa del curso práctico, no hace falta buscar el caso más complejo imaginable.

Conviene elegir algo claro y entendible.

Por ejemplo, pueden ser buenos candidatos:

- client secret del gateway para integración con identidad
- password de alguna pieza del entorno
- credenciales de un componente que ya forma parte del sistema

La idea es que el ejemplo sea realista y didáctico, no artificialmente rebuscado.

---

## Paso 2 · Crear una ubicación razonable para el recurso

Una opción clara podría ser algo como:

```txt
k8s/base/novamarket-secret.yaml
```

Eso mantiene el mismo criterio que usamos para el `ConfigMap` y deja la configuración transversal del sistema agrupada en una zona lógica.

---

## Paso 3 · Crear el recurso `Secret`

Una base conceptual razonable podría verse así:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: novamarket-secret
  namespace: novamarket
type: Opaque
stringData:
  KEYCLOAK_CLIENT_SECRET: "cambiar-por-un-valor-real"
  RABBITMQ_PASSWORD: "cambiar-por-un-valor-real"
```

No hace falta que uses exactamente estos nombres si tu implementación actual maneja otros.  
Lo importante es que el recurso deje claro:

- qué tipo de datos estamos separando,
- y que ya no queremos tratarlos como configuración común.

---

## Qué expresa este recurso

Este `Secret` está diciendo algo conceptualmente muy importante:

- estos valores siguen siendo necesarios para el sistema,
- pero no deberían tratarse igual que un host interno o un perfil de Spring,
- y su lugar natural ya no es el mismo que el de la configuración no sensible.

Ese cambio de orden importa muchísimo.

---

## Paso 4 · Aplicar el `Secret`

Ahora aplicá el recurso al namespace `novamarket`.

La idea es que el cluster ya cuente con una pieza explícita para sostener este primer conjunto de datos sensibles del sistema.

---

## Paso 5 · Elegir un `Deployment` para consumirlo

Ahora conviene elegir un servicio donde este cambio tenga sentido real.

Un buen candidato puede ser:

- `api-gateway`
- o alguna otra pieza donde ya tenga sentido separar una credencial o secreto del resto de la configuración

La idea es que el ejemplo no sea abstracto, sino que impacte en un servicio real del ecosistema.

---

## Paso 6 · Inyectar variables desde `Secret`

Una forma conceptual razonable puede ser algo como:

```yaml
env:
  - name: KEYCLOAK_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: novamarket-secret
        key: KEYCLOAK_CLIENT_SECRET
```

O un patrón equivalente según el tipo de dato que estés usando en tu implementación.

No hace falta mover todos los secretos de un solo golpe.  
Con uno o dos ejemplos claros ya estamos instalando muy bien el criterio.

---

## Paso 7 · Reaplicar el `Deployment`

Después de ajustar el `Deployment`, reaplicá el manifiesto del servicio.

La idea es que la pieza elegida ya no dependa de tener el dato sensible embebido directamente en su definición, sino que lo obtenga desde el `Secret` del entorno.

Este es el verdadero momento importante de la clase.

---

## Paso 8 · Verificar el arranque del servicio

Ahora comprobá que el servicio:

- sigue arrancando,
- no entra en crash loop,
- y no muestra señales de una mala integración con el nuevo recurso

Esto importa mucho porque el objetivo no es solo “hacerlo más prolijo”, sino también mantenerlo funcional.

---

## Paso 9 · Comparar lo que ya tenemos: `ConfigMap` + `Secret`

A esta altura del bloque ya conviene fijar muy bien esta diferencia:

### `ConfigMap`
- configuración no sensible
- valores operativos
- datos comunes del entorno

### `Secret`
- datos que conviene tratar con más cuidado
- credenciales
- tokens
- passwords
- client secrets

Esa separación es justamente una de las ganancias más fuertes de esta etapa del bloque.

---

## Paso 10 · Pensar qué servicios podrían seguir este patrón después

A partir de esta clase, ya debería quedar bastante claro que este enfoque podría extenderse a otros servicios del sistema.

No hace falta hacerlo todo hoy.  
Pero ya empieza a emerger una estrategia más madura para:

- gateway
- servicios de negocio
- y otras piezas del entorno que necesiten datos sensibles

Ese horizonte vale mucho.

---

## Qué estamos logrando con esta clase

Esta clase completa la primera versión madura de externalización de configuración dentro del bloque de Kubernetes.

Ya no tenemos solo servicios y entrada reconstruidos.  
Ahora también empezamos a tener una forma más ordenada de vivir configurados dentro del cluster.

Eso es una mejora muy importante en la calidad del entorno.

---

## Qué todavía no hicimos

Todavía no:

- refinamos todos los servicios del sistema con la misma profundidad
- ni agotamos todas las estrategias posibles de configuración del bloque

Eso puede venir después.

La meta de hoy es mucho más concreta:

**instalar correctamente el patrón de `Secret` y dejar completa la base del refinamiento de configuración.**

---

## Errores comunes en esta etapa

### 1. Meter datos no sensibles en `Secret` por inercia
Conviene que el criterio siga siendo claro.

### 2. Tratar `Secret` como una solución mágica de seguridad total
Es una mejora importante, pero no resuelve todo por sí sola.

### 3. Reaplicar el `Deployment` sin verificar la referencia al recurso
Siempre conviene revisar muy bien la integración.

### 4. Mover demasiados secretos de una sola vez
Para esta primera iteración, menos es más.

### 5. No comprobar que el servicio sigue sano después del cambio
El refinamiento tiene que sostener también el comportamiento del sistema.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería tener un `Secret` real dentro del namespace y al menos uno de sus servicios ya debería consumir configuración sensible desde ese recurso.

Eso deja muy bien consolidada esta nueva etapa del bloque de Kubernetes.

---

## Punto de control

Antes de seguir, verificá que:

- el `Secret` existe,
- está en el namespace correcto,
- al menos un servicio lo consume,
- el servicio sigue arrancando,
- y entendés claramente la diferencia entre configuración no sensible y sensible dentro del entorno.

Si eso está bien, entonces el refinamiento de configuración del bloque ya alcanzó una base bastante madura.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a revisar cómo queda NovaMarket después de introducir `ConfigMap` y `Secret`, para consolidar esta nueva etapa del bloque antes de seguir con otros refinamientos del entorno.

---

## Cierre

En esta clase creamos un `Secret` para NovaMarket dentro de Kubernetes.

Con eso, el bloque completa una primera versión bastante madura de externalización de configuración y el sistema empieza a vivir dentro del cluster no solo como un conjunto de servicios desplegados, sino también como un entorno mucho mejor organizado en términos de configuración.
