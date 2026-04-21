---
title: "Agregando una primera capa real de ConfigMap y Secret en NovaMarket en Kubernetes"
description: "Siguiente paso práctico del módulo 15. Incorporación de una primera capa real de ConfigMap y Secret para una pieza concreta de NovaMarket dentro del cluster."
order: 165
module: "Módulo 15 · Kubernetes y orquestación final"
level: "intermedio"
draft: false
---

# Agregando una primera capa real de `ConfigMap` y `Secret` en NovaMarket en Kubernetes

En la clase anterior dejamos algo bastante claro:

- NovaMarket ya tiene piezas reales dentro del cluster,
- `api-gateway` ya cuenta con una primera entrada externa real,
- y el siguiente paso lógico ya no es seguir representando todo solo con Deployments y Services, sino empezar a darle al sistema una forma más madura de manejar configuración y datos sensibles dentro de Kubernetes.

Ahora toca el paso concreto:

**agregar una primera capa real de `ConfigMap` y `Secret` en NovaMarket en Kubernetes.**

Ese es el objetivo de esta clase.

Porque una cosa es tener:

- workloads reales,
- services,
- y acceso externo.

Y otra bastante distinta es conseguir que:

- parte de la configuración general viva como `ConfigMap`,
- parte de la información sensible viva como `Secret`,
- y una pieza real del sistema consuma ambos recursos de una forma mucho más propia del cluster.

Ese es exactamente el primer gran valor práctico que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la relación entre una pieza real del sistema y sus recursos de configuración en Kubernetes,
- visible una primera capa real de `ConfigMap` y `Secret`,
- mejor entendida la separación entre información general y sensible,
- y NovaMarket mejor preparado para seguir completando su arquitectura dentro del cluster con una representación mucho más madura.

La meta de hoy no es todavía modelar toda la configuración final del sistema.  
La meta es mucho más concreta: **hacer que una pieza real de NovaMarket deje de depender solo de valores embebidos o mezclados y empiece a consumir configuración y secretos de una forma más propia de Kubernetes**.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe un namespace propio,
- existen piezas reales como `config-server`, `discovery-server` y `api-gateway`,
- ya existe una primera entrada externa real,
- y el módulo ya dejó claro que ahora conviene separar mejor configuración general de datos sensibles.

Eso significa que el problema ya no es solo cómo correr servicios dentro del cluster.  
Ahora la pregunta útil es otra:

- **cómo hacemos para que una pieza real del sistema consuma configuración y secretos de forma más madura dentro de Kubernetes**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir una pieza concreta de NovaMarket para abrir este frente,
- crear un `ConfigMap` con configuración no sensible,
- crear un `Secret` con información sensible,
- conectarlos al Deployment correspondiente,
- y dejar visible una primera capa real de configuración madura dentro del cluster.

---

## Qué pieza conviene elegir primero

A esta altura del curso, una opción muy razonable puede ser trabajar con `api-gateway` o con una pieza del núcleo técnico que ya esté dentro del cluster y sea suficientemente visible.

¿Por qué?

Porque:

- ya conocemos bien su rol,
- ya está representada en Kubernetes,
- y nos permite ver con claridad cómo un Deployment empieza a apoyarse en recursos externos al manifiesto principal.

No hace falta todavía abrir esta lógica en todo el sistema.

La meta es mucho más concreta:

- construir un primer caso real, visible y entendible.

---

## Paso 1 · Crear un `ConfigMap` sencillo y útil

Ahora conviene representar una porción de configuración no sensible como `ConfigMap`.

Conceptualmente, algo así:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-gateway-config
  namespace: novamarket
data:
  SPRING_PROFILES_ACTIVE: "k8s"
  SERVER_PORT: "8080"
```

No importa todavía si luego ajustás nombres, perfiles o más variables.

La idea central es otra:

- parte de la configuración general ya deja de estar pegada al Deployment
- y pasa a vivir como recurso propio del cluster.

Ese paso ya tiene muchísimo valor.

---

## Paso 2 · Crear un `Secret` para información sensible

Después de eso, conviene representar información sensible por separado.

Por ejemplo:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-gateway-secret
  namespace: novamarket
type: Opaque
stringData:
  API_GATEWAY_INTERNAL_TOKEN: "super-secret-token"
```

No hace falta todavía discutir acá toda la estrategia final de rotación, cifrado o gestión empresarial de secretos.

La meta de hoy es más concreta:

- distinguir claramente lo sensible de la configuración general
- y dejar de tratarlo como un dato cualquiera dentro del despliegue.

Ese matiz importa muchísimo.

---

## Paso 3 · Conectar ambos recursos al Deployment

Ahora conviene hacer que el Deployment consuma estos recursos.

Conceptualmente, algo como:

```yaml
spec:
  containers:
    - name: api-gateway
      image: novamarket/api-gateway:latest
      envFrom:
        - configMapRef:
            name: api-gateway-config
        - secretRef:
            name: api-gateway-secret
```

No hace falta todavía abrir todas las variantes posibles de montaje, claves individuales o archivos.

La idea central es otra:

- una pieza real del sistema ya puede depender de recursos de configuración separados y propios de Kubernetes.

Ese paso es uno de los corazones prácticos de toda la clase.

---

## Paso 4 · Aplicar los recursos y observar el cluster

Ahora conviene aplicar algo como:

```bash
kubectl apply -f k8s/api-gateway-configmap.yaml
kubectl apply -f k8s/api-gateway-secret.yaml
kubectl apply -f k8s/api-gateway-deployment.yaml
```

Y después revisar:

```bash
kubectl get configmaps -n novamarket
kubectl get secrets -n novamarket
kubectl get pods -n novamarket
```

Lo importante es comprobar que:

- el `ConfigMap` existe,
- el `Secret` existe,
- y el Deployment ya se apoya en ellos como parte de su definición operativa dentro del cluster.

Ese momento vale muchísimo.

---

## Paso 5 · Entender qué cambia realmente con este paso

Conviene leerlo con calma.

Antes:

- el sistema ya tenía piezas reales en Kubernetes,
- pero todavía podía seguir viéndose demasiado apoyado en una lógica más cruda o más parecida a Compose.

Ahora, en cambio, además ya existe algo mucho más maduro:

- parte de la configuración general vive como `ConfigMap`,
- parte de la información sensible vive como `Secret`,
- y la pieza real del sistema ya se alimenta de ambos recursos de una forma más propia del cluster.

Ese cambio parece chico, pero conceptualmente es enorme.

---

## Paso 6 · Pensar por qué esto importa tanto para el bloque final

A esta altura del módulo, conviene hacer una lectura muy concreta:

si el sistema ya vive dentro de Kubernetes, pero su configuración sigue demasiado mezclada con los Deployments o embebida de una forma poco prolija, el bloque final todavía queda a mitad de camino.

Con `ConfigMap` y `Secret`, en cambio:

- la arquitectura empieza a separarse mejor,
- el despliegue se vuelve más claro,
- y NovaMarket gana una representación mucho más seria dentro del cluster.

Ese cambio vale muchísimo.

---

## Paso 7 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene toda su política final de configuración en Kubernetes resuelta”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una primera capa real de `ConfigMap` y `Secret` aplicada a una pieza concreta del sistema.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase agrega una primera capa real de `ConfigMap` y `Secret` en NovaMarket en Kubernetes.

Ya no estamos solo representando workloads y networking.  
Ahora también estamos haciendo que el sistema empiece a separar con mucho más criterio configuración general y datos sensibles dentro del cluster.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- extendimos todavía esta lógica a más piezas del sistema,
- ni cerramos aún el bloque final de Kubernetes como módulo completo.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que NovaMarket deje de pensar configuración y secretos como datos mezclados y empiece a representarlos con recursos más propios de Kubernetes.**

---

## Errores comunes en esta etapa

### 1. Pensar que `ConfigMap` y `Secret` son solo “dos archivos más”
En realidad cambian bastante la madurez de la representación del sistema dentro del cluster.

### 2. Seguir embebiendo toda la configuración en el Deployment aunque ya no haga falta
Eso vuelve mucho más rígido el despliegue.

### 3. Tratar datos sensibles como si fueran configuración común
Ese es justamente uno de los problemas que este paso ayuda a ordenar.

### 4. No verificar que el Deployment realmente consuma los recursos
La integración real es parte central del valor de la clase.

### 5. Creer que este paso ya resuelve toda la configuración de producción
Todavía estamos en una primera capa, no en la solución final.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que NovaMarket ya tiene una primera capa real de `ConfigMap` y `Secret` dentro de Kubernetes y que una pieza concreta del sistema ya consume esa configuración de una forma más madura y más propia del cluster.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- ya existe un `ConfigMap` real en el namespace de NovaMarket,
- ya existe un `Secret` real asociado a una pieza concreta del sistema,
- entendés qué cambio conceptual trae esta separación,
- y sentís que NovaMarket ya está avanzando hacia una representación mucho más seria de su configuración dentro de Kubernetes.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta nueva capa del bloque final.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de `ConfigMap` y `Secret` antes de decidir cómo cerrar el tramo final del curso.

---

## Cierre

En esta clase agregamos una primera capa real de `ConfigMap` y `Secret` en NovaMarket en Kubernetes.

Con eso, el proyecto deja de pensar el despliegue solo como ejecución de imágenes y networking básico y empieza a sostener una representación mucho más madura, mucho más ordenada y mucho más coherente de cómo el sistema se configura realmente dentro del cluster.
