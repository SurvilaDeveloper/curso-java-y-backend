---
title: "Kubernetes desde cero"
description: "Kubernetes es una plataforma de orquestación de contenedores.
  Eso significa que sirve para **ejecutar, distribuir, escalar y administrar aplicaciones en contenedores** de forma automática.
  Dicho más simple:
- Docker te permite **empaquetar** una aplicación dentro de un contenedor.
- Kubernetes te permite **manejar muchos contenedores** en uno o varios servidores sin hacerlo todo manualmente."
order: 22
module: "'Despliegue'"
level: "intro"
draft: false
---
# Kubernetes desde cero

## Qué es Kubernetes

Kubernetes es una **plataforma de orquestación de contenedores**.

Eso significa que sirve para **ejecutar, distribuir, escalar y administrar aplicaciones en contenedores** de forma automática.

Dicho más simple:

- Docker te permite **empaquetar** una aplicación dentro de un contenedor.
- Kubernetes te permite **manejar muchos contenedores** en uno o varios servidores sin hacerlo todo manualmente.

Cuando una aplicación crece, deja de alcanzar con “levantar un contenedor y listo”.
En ese punto aparecen necesidades como estas:

- correr varias instancias de la misma app
- reiniciar contenedores que se caen
- distribuir la carga entre varias réplicas
- exponer la app por red
- separar frontend, backend y base de datos
- desplegar nuevas versiones sin cortar el servicio
- administrar configuración y secretos

Ahí es donde entra Kubernetes.

---

## Para qué sirve

Kubernetes sirve para:

- **desplegar aplicaciones** en contenedores
- **escalar horizontalmente** agregando o quitando réplicas
- **recuperarse de fallos** reiniciando contenedores o moviéndolos a otros nodos
- **balancear tráfico** entre instancias
- **automatizar despliegues** y actualizaciones
- **administrar configuración** y variables externas
- **coordinar aplicaciones distribuidas**

Por eso se usa mucho en:

- microservicios
- APIs backend
- aplicaciones web modernas
- sistemas en nube
- plataformas internas de empresas

---

## La idea mental correcta

Kubernetes no es una aplicación que “corre tu código” de manera mágica.
Es un **sistema que coordina infraestructura y contenedores** para que tu aplicación esté siempre en el estado deseado.

Vos declarás algo como:

- “quiero 3 instancias de mi API”
- “quiero que escuche en el puerto 80”
- “quiero usar esta imagen Docker”
- “quiero que se reinicie si falla”

Y Kubernetes intenta mantener ese estado de forma continua.

---

## Conceptos básicos que hay que entender primero

### 1. Cluster

Un **cluster** es el conjunto de máquinas donde corre Kubernetes.

Ese cluster normalmente tiene:

- un **control plane**
- uno o más **nodes**

### 2. Control plane

El **control plane** es la parte que toma decisiones sobre el cluster.

Se encarga de cosas como:

- recibir instrucciones
- decidir en qué nodo corre cada carga
- observar el estado real
- corregir desvíos

### 3. Node

Un **node** es una máquina que ejecuta cargas de trabajo.
Puede ser física o virtual.

### 4. Pod

El **Pod** es la unidad más pequeña que se despliega en Kubernetes.

Un Pod suele contener:

- un contenedor principal
- o, a veces, varios contenedores que deben vivir juntos

En la práctica, muchas veces vas a desplegar una aplicación y Kubernetes la va a ejecutar dentro de Pods.

### 5. Deployment

Un **Deployment** describe cómo debe correr una aplicación.

Por ejemplo:

- qué imagen usar
- cuántas réplicas querés
- cómo actualizar la versión

En la práctica, para una app stateless, el Deployment es uno de los recursos que más vas a usar.

### 6. Service

Un **Service** da una forma estable de acceder a Pods, aunque los Pods cambien, se reinicien o se recreen.

Sirve para:

- exponer una aplicación dentro del cluster
- exponerla hacia afuera
- balancear el tráfico entre varias réplicas

### 7. ConfigMap y Secret

Sirven para sacar configuración del contenedor.

- **ConfigMap**: configuración no sensible
- **Secret**: datos sensibles, como tokens, contraseñas o claves

### 8. Namespace

Un **Namespace** permite organizar recursos dentro del cluster.

Es útil para separar:

- ambientes
- equipos
- proyectos
- aplicaciones

### 9. Volume

Los **volúmenes** permiten persistir datos.

Son importantes cuando no querés que la información se pierda al recrearse un Pod.

### 10. Ingress

**Ingress** se usa para publicar aplicaciones HTTP/HTTPS con reglas más avanzadas, por ejemplo:

- varios dominios
- varias rutas
- TLS
- reversa de tráfico web

---

## Diferencia entre Docker y Kubernetes

Una confusión común es pensar que Kubernetes reemplaza a Docker como idea general.

La forma más clara de verlo es esta:

- **Docker** te ayuda a construir y ejecutar contenedores.
- **Kubernetes** te ayuda a administrar esos contenedores en uno o varios servidores.

Ejemplo mental:

- con Docker corrés un contenedor de tu app
- con Kubernetes corrés 3 réplicas, las exponés por red, las escalás y las recuperás si fallan

---

## Cómo se consigue Kubernetes

Hay varias formas de obtenerlo o empezar a usarlo.

### Opción 1. Usarlo localmente para aprender

Es la mejor opción para empezar.

Las formas más comunes son:

- **minikube**
- **kind**
- otras soluciones locales según el entorno

Para principiantes, **minikube** es una opción muy común porque levanta un cluster local pensado para aprendizaje y pruebas.

### Opción 2. Usarlo en la nube como servicio administrado

Muchísimas empresas no instalan Kubernetes desde cero en sus servidores, sino que usan un servicio administrado del proveedor cloud.

Ejemplos típicos:

- Google Kubernetes Engine (GKE)
- Amazon Elastic Kubernetes Service (EKS)
- Azure Kubernetes Service (AKS)

En este modelo, el proveedor se encarga de buena parte de la infraestructura del cluster.

### Opción 3. Instalar tu propio cluster

También podés instalar tu propio Kubernetes en servidores o máquinas virtuales.

Una forma clásica es usar:

- **kubeadm**

Esto ya es más cercano a administración de infraestructura y no suele ser el primer paso para aprender.

---

## Qué necesitás para empezar

Para dar los primeros pasos, lo más normal es tener:

- un sistema operativo compatible
- una terminal
- **kubectl**, que es la herramienta de línea de comandos de Kubernetes
- una forma de tener un cluster, por ejemplo **minikube**

### Qué es kubectl

`kubectl` es la herramienta con la que hablás con Kubernetes desde la terminal.

Con `kubectl` podés:

- ver Pods
- crear recursos
- aplicar archivos YAML
- escalar despliegues
- ver logs
- borrar recursos

---

## Camino recomendado para alguien que no sabe nada

Si estás empezando, el recorrido más sano suele ser este:

1. aprender qué es un cluster, un node, un pod y un deployment
2. instalar `kubectl`
3. levantar un cluster local con `minikube`
4. desplegar una app simple
5. exponerla con un `Service`
6. escalarla
7. pasar de comandos directos a archivos YAML

Ese recorrido te permite entender la herramienta sin entrar demasiado rápido en complejidades de producción.

---

## Paso a paso para usar Kubernetes por primera vez

## Paso 1. Instalar kubectl

Primero necesitás `kubectl`.

La instalación cambia según el sistema operativo:

- Linux
- macOS
- Windows

Lo importante es que, una vez instalado, puedas ejecutar:

```bash
kubectl version --client
```

Si ese comando responde, ya tenés la CLI instalada.

---

## Paso 2. Instalar una solución local de cluster

Para aprender, una opción muy usada es **minikube**.

Una vez instalado, podés iniciar un cluster local con:

```bash
minikube start
```

Después podés verificar su estado:

```bash
minikube status
```

Si todo salió bien, ya tenés un cluster funcionando localmente.

---

## Paso 3. Comprobar que kubectl se conecta al cluster

Ahora probá:

```bash
kubectl get nodes
```

Ese comando lista los nodos disponibles.

En un entorno local de aprendizaje, normalmente vas a ver un solo nodo.

---

## Paso 4. Desplegar una aplicación simple

Podés crear un Deployment con una imagen pública, por ejemplo Nginx:

```bash
kubectl create deployment nginx-demo --image=nginx
```

Ahora mirá qué se creó:

```bash
kubectl get deployments
kubectl get pods
```

Con eso ya tenés tu primera aplicación corriendo en Kubernetes.

---

## Paso 5. Exponer la aplicación

Crear un Deployment no significa automáticamente que puedas abrirlo desde el navegador.

Para darle acceso por red, podés crear un Service:

```bash
kubectl expose deployment nginx-demo --type=NodePort --port=80
```

Y después inspeccionarlo:

```bash
kubectl get services
```

Si estás usando minikube, podés abrirlo así:

```bash
minikube service nginx-demo
```

Eso normalmente abre la aplicación en el navegador o te muestra la URL.

---

## Paso 6. Escalar la aplicación

Ahora probá correr varias réplicas:

```bash
kubectl scale deployment nginx-demo --replicas=3
```

Y verificá:

```bash
kubectl get pods
```

Ahora Kubernetes intentará mantener **3 Pods** de esa app corriendo.

Si uno falla, el sistema intentará volver al estado deseado.

---

## Paso 7. Ver detalles y logs

Comandos muy comunes:

```bash
kubectl get all
```

```bash
kubectl describe deployment nginx-demo
```

```bash
kubectl logs <nombre-del-pod>
```

```bash
kubectl get pods -o wide
```

Estos comandos te ayudan a inspeccionar qué está pasando realmente.

---

## Paso 8. Borrar recursos

Cuando terminás una prueba:

```bash
kubectl delete service nginx-demo
kubectl delete deployment nginx-demo
```

Y si querés apagar el cluster local de minikube:

```bash
minikube stop
```

---

## Cómo se usa de forma más profesional

Al principio es normal usar comandos directos como `kubectl create deployment`.

Pero en proyectos reales lo más importante es trabajar de forma **declarativa** usando archivos YAML.

En vez de decirle manualmente a Kubernetes “hacé esto”, le entregás un archivo que describe el estado deseado.

Por ejemplo, un `deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-demo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx-demo
  template:
    metadata:
      labels:
        app: nginx-demo
    spec:
      containers:
        - name: nginx
          image: nginx
          ports:
            - containerPort: 80
```

Y un `service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-demo
spec:
  selector:
    app: nginx-demo
  ports:
    - port: 80
      targetPort: 80
  type: NodePort
```

Después aplicás ambos así:

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

Y para revisar:

```bash
kubectl get deployments
kubectl get pods
kubectl get services
```

Este enfoque declarativo es el que más se usa en entornos reales.

---

## Qué hace Kubernetes cuando aplicás esos archivos

Cuando aplicás un YAML, Kubernetes:

1. recibe la definición
2. la guarda como estado deseado
3. compara ese estado deseado con el estado real
4. crea, modifica o elimina recursos para que coincidan

Esa es una de las ideas más importantes de todo Kubernetes.

---

## Qué se aprende después de lo básico

Una vez que entendés lo inicial, lo siguiente suele ser:

- probes (`liveness`, `readiness`, `startup`)
- variables de entorno
- ConfigMaps
- Secrets
- volúmenes persistentes
- Ingress
- namespaces
- requests y limits
- rolling updates
- rollback
- Helm
- observabilidad
- seguridad

---

## Cuándo conviene usar Kubernetes

Conviene especialmente cuando:

- tenés varias aplicaciones o microservicios
- necesitás escalado automático o manual
- querés despliegues más robustos
- corrés cargas distribuidas
- querés una plataforma estándar para contenedores

---

## Cuándo puede ser demasiado

No siempre hace falta.

Para proyectos chicos o de aprendizaje inicial, a veces alcanza con:

- Docker
- Docker Compose
- un VPS simple

Kubernetes tiene una curva de aprendizaje real.
No conviene meterlo porque sí.

---

## Resumen corto

Kubernetes es una plataforma para **orquestar contenedores**.

Sirve para:

- desplegar apps
- escalarlas
- exponerlas
- mantenerlas corriendo
- administrarlas con una lógica declarativa

Para empezar, el camino más simple suele ser:

1. instalar `kubectl`
2. levantar `minikube`
3. crear un `Deployment`
4. exponerlo con un `Service`
5. inspeccionarlo con `kubectl`
6. escalarlo
7. pasar a YAML

---

## Fuentes oficiales recomendadas

- Documentación general de Kubernetes
- Overview de Kubernetes
- Cluster Architecture
- Install Tools (`kubectl`)
- Hello Minikube
- Installing Kubernetes with deployment tools
- Installing kubeadm

