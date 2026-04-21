---
title: "Llevando config-server y discovery-server a Kubernetes como primera base del corazón de NovaMarket"
description: "Siguiente paso práctico del módulo 15. Despliegue de config-server y discovery-server en Kubernetes como primera base real del núcleo de NovaMarket dentro del cluster."
order: 158
module: "Módulo 15 · Kubernetes y orquestación final"
level: "intermedio"
draft: false
---

# Llevando `config-server` y `discovery-server` a Kubernetes como primera base del corazón de NovaMarket

En la clase anterior dejamos algo bastante claro:

- NovaMarket ya tiene una primera base real dentro de Kubernetes,
- el puente entre Compose y cluster ya dejó de ser teórico,
- y el siguiente paso lógico ya no es seguir jugando solo con recursos genéricos, sino empezar a llevar piezas realmente centrales de la arquitectura al nuevo entorno.

Ahora toca el paso concreto:

**llevar `config-server` y `discovery-server` a Kubernetes como primera base del corazón de NovaMarket.**

Ese es el objetivo de esta clase.

Porque una cosa es tener un namespace, un deployment y un service de ejemplo.

Y otra bastante distinta es conseguir que:

- piezas estructurales del sistema
- que ya venimos usando desde hace mucho
- empiecen a vivir dentro del cluster con una representación real y coherente.

Ese es exactamente el primer gran valor práctico fuerte que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más claro por qué conviene empezar el núcleo de NovaMarket en Kubernetes por `config-server` y `discovery-server`,
- visible una primera base real del corazón de la arquitectura dentro del cluster,
- mejor entendido cómo se traduce una pieza central del sistema a manifests concretos,
- y NovaMarket mejor preparado para sumar después `api-gateway` y servicios de negocio.

La meta de hoy no es todavía llevar todo el sistema al cluster.  
La meta es mucho más concreta: **hacer que el núcleo de configuración y descubrimiento de NovaMarket empiece a vivir dentro de Kubernetes de forma real**.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe una primera base de recursos Kubernetes,
- Compose ya nos permitió entender el sistema completo,
- y el módulo ya dejó claro que ahora conviene empezar a migrar piezas realmente importantes de la arquitectura al cluster.

Eso significa que el problema ya no es cómo crear un namespace o un deployment cualquiera.  
Ahora la pregunta útil es otra:

- **qué piezas conviene llevar primero al cluster para que la arquitectura empiece a tomar forma real dentro de Kubernetes**

Y eso es exactamente lo que vamos a convertir en algo visible en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- representar `config-server` en Kubernetes,
- representar `discovery-server` en Kubernetes,
- exponerlos de forma coherente dentro del cluster,
- y dejar visible una primera base real del núcleo de NovaMarket dentro del nuevo entorno.

---

## Por qué conviene empezar por estas dos piezas

A esta altura del proyecto, empezar por `config-server` y `discovery-server` tiene muchísimo sentido.

¿Por qué?

Porque:

- forman parte del corazón estructural de la arquitectura,
- no dependen de un flujo de negocio específico para justificar su valor,
- y nos permiten empezar a ver cómo el cluster recibe piezas que después van a ser referencia para el resto del sistema.

Ese criterio mejora muchísimo la progresión del bloque final.

---

## Paso 1 · Preparar el Deployment de `config-server`

Ahora conviene representar `config-server` como un `Deployment`.

Conceptualmente, algo como:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: config-server
  namespace: novamarket
spec:
  replicas: 1
  selector:
    matchLabels:
      app: config-server
  template:
    metadata:
      labels:
        app: config-server
    spec:
      containers:
        - name: config-server
          image: novamarket/config-server:latest
          ports:
            - containerPort: 8888
```

No hace falta todavía perfeccionar todos los detalles finos.

La idea central es otra:

- una pieza real del núcleo arquitectónico ya deja de ser solo contenedor en Compose y pasa a ser workload real en Kubernetes.

Ese paso ya tiene muchísimo valor.

---

## Paso 2 · Exponer `config-server` con un Service

Después de eso, conviene sumarle un `Service`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: config-server
  namespace: novamarket
spec:
  selector:
    app: config-server
  ports:
    - port: 8888
      targetPort: 8888
```

Este paso importa muchísimo porque deja visible cómo una pieza central del sistema empieza a ser alcanzable dentro del cluster con una identidad estable.

Ese matiz es central para todo lo que viene después.

---

## Paso 3 · Repetir la lógica con `discovery-server`

Ahora conviene hacer lo mismo con `discovery-server`.

Por ejemplo:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: discovery-server
  namespace: novamarket
spec:
  replicas: 1
  selector:
    matchLabels:
      app: discovery-server
  template:
    metadata:
      labels:
        app: discovery-server
    spec:
      containers:
        - name: discovery-server
          image: novamarket/discovery-server:latest
          ports:
            - containerPort: 8761
```

Y después un `Service` equivalente.

La idea no es solo copiar la receta.

La idea es que el cluster ya empiece a contener piezas verdaderamente importantes del sistema.

---

## Paso 4 · Pensar qué configuración mínima necesitan

Este punto importa muchísimo.

A esta altura del bloque, no alcanza con que el contenedor arranque.

También conviene pensar:

- qué variables necesita,
- cómo se referencia internamente,
- y cómo se va a vincular más adelante con las demás piezas.

No hace falta todavía cerrar toda la historia de ConfigMaps y Secrets en esta clase, pero sí empezar a leer que Kubernetes no es solo “ejecutar contenedores”, sino representar un sistema con sus relaciones.

Ese matiz vale muchísimo.

---

## Paso 5 · Aplicar los manifests y observar el cluster

Ahora conviene aplicar los recursos y revisar:

```bash
kubectl apply -f k8s/config-server/
kubectl apply -f k8s/discovery-server/

kubectl get pods -n novamarket
kubectl get services -n novamarket
```

Lo importante es comprobar que:

- ambas piezas existen,
- el cluster las ve,
- y el corazón técnico de NovaMarket ya empieza a tener presencia real dentro del nuevo entorno.

Ese momento vale muchísimo.

---

## Paso 6 · Entender por qué este cambio importa tanto

Hasta ahora, Kubernetes podía sentirse todavía como una base genérica.

Ahora, en cambio, el cluster ya empieza a contener piezas que el alumno asocia claramente con la arquitectura de NovaMarket.

Ese cambio importa muchísimo porque vuelve muchísimo más concreta la transición desde Compose hacia orquestación.

---

## Paso 7 · Pensar qué gana el proyecto con este orden

A esta altura del módulo, conviene hacer una lectura muy concreta:

si primero llevamos al cluster el corazón técnico del sistema, después va a ser mucho más natural sumar:

- `api-gateway`
- servicios de negocio
- y otras piezas del stack

Ese criterio evita mover todo sin brújula y mejora muchísimo la claridad del bloque final.

---

## Paso 8 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya está completo en Kubernetes”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene `config-server` y `discovery-server` representados dentro del cluster como primera base real del corazón de la arquitectura.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase lleva `config-server` y `discovery-server` a Kubernetes como primera base real del corazón de NovaMarket.

Ya no estamos solo trabajando con recursos genéricos.  
Ahora también estamos haciendo que piezas centrales del sistema empiecen a vivir de forma concreta dentro del cluster.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- llevamos todavía `api-gateway`,
- ni los servicios de negocio,
- ni consolidamos aún este subbloque con un checkpoint fuerte.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**hacer que el corazón técnico de NovaMarket empiece a vivir dentro de Kubernetes de una forma real y coherente.**

---

## Errores comunes en esta etapa

### 1. Querer mover directamente piezas de negocio más complejas sin esta base
Eso vuelve confuso el orden del bloque.

### 2. Tratar a `config-server` y `discovery-server` como simples ejemplos genéricos
En realidad son piezas estructurales del sistema.

### 3. Olvidar que el cluster también necesita relaciones claras entre componentes
No es solo “arrancar pods”.

### 4. No validar que los Services existan y apunten bien
Eso debilita mucho el aprendizaje de esta etapa.

### 5. Pensar que este paso ya cierra todo Kubernetes
Todavía estamos en el comienzo real del bloque final.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que `config-server` y `discovery-server` ya tienen una representación real dentro del cluster y que NovaMarket ya empezó a trasladar piezas centrales de su arquitectura a Kubernetes de una forma concreta y entendible.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- `config-server` ya existe como Deployment y Service,
- `discovery-server` ya existe como Deployment y Service,
- entendés por qué era razonable empezar por estas piezas,
- y sentís que NovaMarket ya está dando un paso serio desde una base genérica en Kubernetes hacia una arquitectura real dentro del cluster.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta nueva capa del bloque final.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera base real del corazón de NovaMarket en Kubernetes antes de sumar piezas todavía más visibles como `api-gateway`.

---

## Cierre

En esta clase llevamos `config-server` y `discovery-server` a Kubernetes como primera base real del corazón de NovaMarket.

Con eso, el proyecto deja de pensar Kubernetes solo como un conjunto de recursos genéricos y empieza a sostener una representación mucho más concreta, mucho más fiel y mucho más madura de su arquitectura dentro del cluster.
