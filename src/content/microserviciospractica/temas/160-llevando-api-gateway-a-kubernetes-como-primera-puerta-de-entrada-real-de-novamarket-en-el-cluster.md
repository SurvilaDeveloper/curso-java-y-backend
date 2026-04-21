---
title: "Llevando api-gateway a Kubernetes como primera puerta de entrada real de NovaMarket en el cluster"
description: "Siguiente paso práctico del módulo 15. Despliegue de api-gateway en Kubernetes como primera puerta de entrada real del sistema dentro del cluster."
order: 160
module: "Módulo 15 · Kubernetes y orquestación final"
level: "intermedio"
draft: false
---

# Llevando `api-gateway` a Kubernetes como primera puerta de entrada real de NovaMarket en el cluster

En la clase anterior dejamos algo bastante claro:

- NovaMarket ya tiene una primera base real dentro de Kubernetes,
- `config-server` y `discovery-server` ya empezaron a vivir en el cluster,
- y el siguiente paso lógico ya no es seguir sumando piezas de soporte sin orden, sino empezar a llevar una pieza mucho más visible de la arquitectura: la puerta de entrada del sistema.

Ahora toca el paso concreto:

**llevar `api-gateway` a Kubernetes como primera puerta de entrada real de NovaMarket en el cluster.**

Ese es el objetivo de esta clase.

Porque una cosa es tener:

- un namespace,
- resources básicos,
- y el corazón técnico del sistema.

Y otra bastante distinta es conseguir que:

- la puerta de entrada del sistema,
- que ordena tráfico,
- aplica reglas,
- y se conecta con el resto de la arquitectura

empiece a vivir también dentro del cluster.

Ese es exactamente el primer gran valor práctico que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más claro por qué `api-gateway` es una pieza central del salto a Kubernetes,
- visible su primera representación real dentro del cluster,
- mejor entendida la relación entre gateway, configuración y descubrimiento en el nuevo entorno,
- y NovaMarket mejor preparado para empezar a pensar la exposición real del sistema hacia afuera.

La meta de hoy no es todavía resolver toda la entrada externa al cluster.  
La meta es mucho más concreta: **hacer que la principal puerta de entrada de NovaMarket ya viva dentro de Kubernetes como parte real de la arquitectura**.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe un namespace propio,
- `config-server` y `discovery-server` ya fueron llevados al cluster,
- y el bloque ya dejó claro que ahora conviene sumar una pieza más visible y estructural del sistema.

Eso significa que el problema ya no es cómo expresar recursos básicos.  
Ahora la pregunta útil es otra:

- **cómo trasladamos la puerta de entrada principal del sistema a Kubernetes sin perder la lógica arquitectónica que ya construimos**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- representar `api-gateway` como `Deployment`,
- exponerlo con un `Service`,
- conectarlo conceptualmente con `config-server` y `discovery-server`,
- y dejar visible la primera puerta de entrada real de NovaMarket dentro del cluster.

---

## Por qué conviene llevar ahora a `api-gateway`

A esta altura del curso, `api-gateway` es la siguiente pieza más natural.

¿Por qué?

Porque:

- es la entrada ordenada del sistema,
- ya venimos usándolo hace mucho en Compose,
- y su presencia dentro del cluster empieza a hacer muchísimo más concreta la arquitectura orquestada.

Si antes llevamos el corazón técnico, ahora conviene llevar una pieza que hace visible cómo el tráfico empieza a encontrar una puerta de entrada real dentro del nuevo entorno.

Ese criterio mejora muchísimo la progresión del bloque final.

---

## Paso 1 · Preparar el Deployment de `api-gateway`

Ahora conviene representar `api-gateway` como un `Deployment`.

Conceptualmente, algo como:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: novamarket
spec:
  replicas: 1
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
        - name: api-gateway
          image: novamarket/api-gateway:latest
          ports:
            - containerPort: 8080
```

No hace falta todavía perfeccionar probes, recursos o réplicas múltiples.

La idea central es otra:

- una pieza clave del flujo de entrada del sistema ya deja de vivir solo en Compose y pasa a ser un workload real administrado por Kubernetes.

Ese paso ya tiene muchísimo valor.

---

## Paso 2 · Pensar qué dependencias conceptuales tiene dentro del cluster

Este punto importa muchísimo.

`api-gateway` no es una pieza aislada.

A esta altura del proyecto, su lectura dentro de Kubernetes ya debería conectar naturalmente con:

- `config-server`
- `discovery-server`
- y más adelante otros servicios del sistema

Eso significa que no alcanza con “hacer correr el contenedor”.

Ahora también conviene empezar a pensar:

- cómo descubre otras piezas,
- cómo se configura,
- y cómo empieza a encontrar su lugar dentro del cluster como parte del sistema real.

Ese matiz es central para todo el bloque final.

---

## Paso 3 · Exponer `api-gateway` con un Service interno

Después de eso, conviene sumarle un `Service`.

Por ejemplo:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: novamarket
spec:
  selector:
    app: api-gateway
  ports:
    - port: 8080
      targetPort: 8080
```

Este paso importa muchísimo porque deja visible que el gateway ya tiene identidad propia dentro del cluster y que la entrada del sistema empieza a adquirir una representación concreta también del lado de networking interno.

Ese cambio vale muchísimo.

---

## Paso 4 · Aplicar manifests y observar el cluster

Ahora conviene aplicar los recursos y revisar:

```bash
kubectl apply -f k8s/api-gateway/

kubectl get deployments -n novamarket
kubectl get pods -n novamarket
kubectl get services -n novamarket
```

Lo importante es comprobar que:

- `api-gateway` existe,
- el pod levanta,
- el service lo representa,
- y la arquitectura del sistema dentro del cluster ya deja de ser puramente interna o técnica para empezar a mostrar también su borde de entrada.

Ese momento vale muchísimo.

---

## Paso 5 · Entender por qué este cambio importa tanto

Hasta ahora, Kubernetes ya tenía una primera base seria del sistema.

Pero con `api-gateway` aparece algo muy fuerte:

- el cluster ya no solo tiene piezas de soporte,
- también empieza a representar la entrada organizada del sistema completo.

Ese cambio importa muchísimo porque vuelve mucho más visible el puente entre arquitectura interna y recorrido real del tráfico.

---

## Paso 6 · Pensar qué gana NovaMarket con este orden

A esta altura del módulo, conviene hacer una lectura muy concreta:

si primero llevamos al cluster el corazón técnico y luego la puerta de entrada, después va a ser muchísimo más natural sumar:

- servicios de negocio,
- exposición más real,
- y entrada externa más seria.

Ese criterio evita mover piezas sin brújula y mejora muchísimo la claridad del tramo final.

---

## Paso 7 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya está completamente expuesto y operativo desde afuera del cluster”

Sería exagerado.

Lo correcto es algo más preciso:

- `api-gateway` ya vive dentro de Kubernetes como primera puerta de entrada real del sistema en el cluster.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase lleva `api-gateway` a Kubernetes como primera puerta de entrada real de NovaMarket en el cluster.

Ya no estamos solo trabajando con piezas de soporte o recursos genéricos.  
Ahora también estamos haciendo que la principal puerta de entrada del sistema empiece a vivir de forma concreta dentro del nuevo entorno.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- resolvimos todavía la exposición externa real del gateway,
- ni consolidamos aún este subbloque con un checkpoint fuerte.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**hacer que la entrada principal de NovaMarket ya tenga una representación real dentro de Kubernetes.**

---

## Errores comunes en esta etapa

### 1. Llevar `api-gateway` sin pensar su relación con el resto del sistema
No es una pieza aislada.

### 2. Tratarlo como un servicio más del montón
En realidad ordena el borde de entrada del sistema.

### 3. Pensar que con el Deployment ya está resuelto todo el networking externo
Todavía falta abrir ese frente.

### 4. No verificar que el Service exista y apunte bien
Eso debilita mucho la lectura del paso.

### 5. No leer el cambio conceptual de esta etapa
Con gateway, el cluster empieza a parecerse mucho más al sistema real.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que `api-gateway` ya tiene una representación real dentro del cluster y que NovaMarket ya empezó a llevar su borde de entrada a Kubernetes de una forma concreta y entendible.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- `api-gateway` ya existe como Deployment,
- ya tiene un Service interno dentro del namespace,
- entendés por qué esta pieza cambia mucho la lectura del sistema dentro del cluster,
- y sentís que NovaMarket ya está listo para empezar a pensar la exposición real del tráfico hacia afuera.

Si eso está bien, ya podemos pasar al siguiente tema y abrir la exposición externa del sistema en Kubernetes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a entender por qué la exposición externa del tráfico ya tiene sentido en NovaMarket y cómo empezar a resolverla con recursos más propios del bloque final de Kubernetes.

---

## Cierre

En esta clase llevamos `api-gateway` a Kubernetes como primera puerta de entrada real de NovaMarket en el cluster.

Con eso, el proyecto deja de pensar el cluster solo como un lugar para piezas internas y empieza a sostener una representación mucho más fiel, mucho más visible y mucho más madura de su arquitectura de entrada dentro de Kubernetes.
