---
title: "Levantando la primera base real de NovaMarket en Kubernetes con Namespace, Deployment y Service"
description: "Primer paso práctico del módulo 15. Incorporación de una primera base real de NovaMarket en Kubernetes usando Namespace, Deployment y Service para empezar a representar el sistema fuera de Docker Compose."
order: 157
module: "Módulo 15 · Kubernetes y orquestación final"
level: "intermedio"
draft: false
---

# Levantando la primera base real de NovaMarket en Kubernetes con Namespace, Deployment y Service

En la clase anterior dejamos algo bastante claro:

- NovaMarket ya está lo suficientemente maduro como para abrir Kubernetes,
- Compose ya cumplió muy bien su rol como entorno de construcción y validación,
- y el siguiente paso lógico ya no es seguir hablando de orquestación en abstracto, sino empezar a representar el sistema con manifests reales.

Ahora toca el paso concreto:

**levantar la primera base real de NovaMarket en Kubernetes con `Namespace`, `Deployment` y `Service`.**

Ese es el objetivo de esta clase.

Porque una cosa es entender qué es Kubernetes.

Y otra bastante distinta es conseguir que:

- el sistema empiece a vivir dentro de un namespace propio,
- una primera pieza real se ejecute como Deployment,
- y además quede expuesta internamente con un Service.

Ese es exactamente el primer gran valor práctico que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la relación entre NovaMarket y los recursos básicos de Kubernetes,
- visible una primera base real del sistema representada con manifests,
- mejor entendido el paso de Compose a una lógica de cluster,
- y el proyecto mejor preparado para sumar luego piezas más importantes como `config-server`, `discovery-server` y `api-gateway`.

La meta de hoy no es todavía desplegar todo NovaMarket en Kubernetes.  
La meta es mucho más concreta: **dar el primer paso real para que el sistema deje de vivir solo en Compose y empiece a representarse como recursos de cluster**.

---

## Estado de partida

Partimos de un sistema donde ya:

- NovaMarket existe como plataforma completa,
- su arquitectura ya fue recorrida de punta a punta,
- y el módulo ya dejó claro que ahora conviene empezar a representarlo en Kubernetes de forma gradual y coherente.

Eso significa que el problema ya no es “por qué Kubernetes”.

Ahora la pregunta útil es otra:

- **cómo empezamos a llevar el sistema a Kubernetes sin intentar mover todo de golpe**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear un `Namespace` propio para NovaMarket,
- desplegar una primera pieza real con `Deployment`,
- exponerla internamente con un `Service`,
- y dejar visible la primera base concreta del sistema dentro del cluster.

---

## Por qué conviene empezar por recursos básicos

A esta altura del curso, no conviene saltar directamente a manifests enormes para todo el sistema.

Lo más sano es empezar por algo:

- pequeño,
- claro,
- visible,
- y perfectamente alineado con la lógica de Kubernetes.

Por eso, esta clase gira alrededor de tres piezas fundamentales:

- `Namespace`
- `Deployment`
- `Service`

Ese criterio mejora muchísimo la progresión del bloque.

---

## Paso 1 · Crear un namespace propio para NovaMarket

Lo primero que conviene hacer es darle al sistema un espacio claro dentro del cluster.

Por ejemplo:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: novamarket
```

Esto importa muchísimo porque empieza a dejar visible algo central del bloque:

- NovaMarket ya no vive solo como un conjunto de contenedores locales,
- ahora también empieza a ocupar un espacio propio dentro del cluster.

Ese cambio ya tiene mucho valor.

---

## Paso 2 · Elegir una primera pieza real para desplegar

A esta altura del proyecto, conviene elegir una pieza simple pero real.

No hace falta todavía mover medio sistema.

Una muy buena opción puede ser empezar con un servicio que ya conozcamos bien o con una pieza auxiliar del stack que nos permita validar el circuito básico de Kubernetes sin sumar demasiada complejidad al mismo tiempo.

La idea no es impresionar con cantidad.  
La idea es construir una base sana.

---

## Paso 3 · Representar esa pieza como Deployment

Ahora conviene tomar esa primera pieza y expresarla como un `Deployment`.

Conceptualmente, algo así:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: example-service
  namespace: novamarket
spec:
  replicas: 1
  selector:
    matchLabels:
      app: example-service
  template:
    metadata:
      labels:
        app: example-service
    spec:
      containers:
        - name: example-service
          image: novamarket/example-service:latest
          ports:
            - containerPort: 8080
```

No importa todavía si más adelante ajustás imágenes, probes, variables o secretos.

La idea central es otra:

- empezar a pensar una pieza del sistema como workload administrado por el cluster.

Ese paso es uno de los corazones prácticos de toda la clase.

---

## Paso 4 · Exponerla con un Service

Después de eso, conviene sumar un `Service`.

Por ejemplo:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: example-service
  namespace: novamarket
spec:
  selector:
    app: example-service
  ports:
    - port: 80
      targetPort: 8080
```

Este paso importa muchísimo porque marca una diferencia muy importante respecto de Compose:

- en Kubernetes no pensamos solo en “contenedores corriendo”,
- también pensamos en cómo las piezas se descubren y se alcanzan dentro del cluster.

Ese matiz es central para todo el bloque final.

---

## Paso 5 · Aplicar los manifests

Ahora conviene aplicar los recursos:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/example-service-deployment.yaml
kubectl apply -f k8s/example-service-service.yaml
```

Lo importante no es memorizar esta secuencia como receta ciega.

Lo importante es ver que:

- el cluster ya empieza a contener piezas reales de NovaMarket,
- y que el sistema ya está dejando huellas concretas en Kubernetes.

Ese momento vale muchísimo.

---

## Paso 6 · Verificar que los recursos existan

Ahora conviene revisar algo como:

```bash
kubectl get ns
kubectl get deployments -n novamarket
kubectl get pods -n novamarket
kubectl get services -n novamarket
```

La idea es comprobar que:

- el namespace existe,
- el deployment está activo,
- el pod está corriendo,
- y el service ya representa el punto de acceso interno.

No hace falta todavía una lectura ultra avanzada del cluster.

La meta de hoy es mucho más concreta: validar la primera base real del sistema en Kubernetes.

---

## Paso 7 · Entender qué cambia respecto de Compose

Este punto vale muchísimo.

Compose nos permitió levantar piezas juntas de una forma muy didáctica.

Kubernetes, en cambio, empieza a cambiar la mirada:

- ahora pensamos en recursos declarativos,
- en estado deseado,
- en pods gestionados,
- y en servicios internos del cluster.

Ese cambio importa muchísimo porque es justo ahí donde el bloque final empieza a diferenciarse de verdad.

---

## Paso 8 · Pensar por qué esta base es tan importante

A primera vista, podría parecer que solo creamos tres recursos básicos.

Pero en realidad estamos haciendo algo bastante más valioso:

- construir la primera traducción real entre la arquitectura que ya conocemos
- y la forma en que esa arquitectura empieza a vivir dentro de Kubernetes.

Ese cambio vale muchísimo porque prepara muy bien todo lo que viene después.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya está desplegado completo en Kubernetes”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una primera base real en Kubernetes con namespace, deployment y service.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase levanta la primera base real de NovaMarket en Kubernetes con `Namespace`, `Deployment` y `Service`.

Ya no estamos solo abriendo el bloque de orquestación.  
Ahora también estamos haciendo que el sistema empiece a representarse de verdad como recursos concretos dentro del cluster.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- llevamos todavía piezas críticas como `config-server`, `discovery-server` o `api-gateway`,
- ni consolidamos aún este subbloque con un checkpoint fuerte.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que NovaMarket deje de ser solo una arquitectura entendida en Compose y empiece a vivir dentro de Kubernetes.**

---

## Errores comunes en esta etapa

### 1. Querer mover todo el sistema de golpe
En esta etapa conviene una base chica, visible y coherente.

### 2. Pensar que Namespace, Deployment y Service son solo “tres archivos más”
En realidad cambian bastante la forma de representar el sistema.

### 3. Saltar demasiado rápido a Ingress, Secrets o escalado sin esta base clara
Eso vuelve confuso el aprendizaje.

### 4. No verificar recursos luego del apply
La observación del cluster sigue siendo parte central de la clase.

### 5. No leer el cambio conceptual respecto de Compose
Ese puente es uno de los corazones del bloque final.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que NovaMarket ya tiene una primera base real en Kubernetes y que namespace, deployment y service ya dejaron de ser conceptos abstractos para convertirse en recursos concretos del proyecto.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- ya existe un namespace propio para NovaMarket,
- ya hay al menos una pieza real desplegada como Deployment,
- ya existe un Service que la representa dentro del cluster,
- y sentís que NovaMarket ya empezó a pasar de Compose a Kubernetes de una forma concreta y entendible.

Si eso está bien, ya podemos pasar al siguiente tema y empezar a llevar piezas mucho más centrales de la arquitectura a Kubernetes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a llevar `config-server` y `discovery-server` a Kubernetes como primera base real del corazón de NovaMarket dentro del cluster.

---

## Cierre

En esta clase levantamos la primera base real de NovaMarket en Kubernetes con `Namespace`, `Deployment` y `Service`.

Con eso, el proyecto deja de pensar Kubernetes solo como teoría de orquestación y empieza a sostener una primera representación concreta, visible y mucho más madura de su arquitectura dentro del cluster.
