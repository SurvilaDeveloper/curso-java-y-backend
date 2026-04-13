---
title: "Llevando notification-service a Kubernetes"
description: "Continuación del bloque de Kubernetes en NovaMarket. Despliegue de notification-service dentro del cluster para preparar la reconstrucción del circuito asincrónico."
order: 90
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Llevando `notification-service` a Kubernetes

En la clase anterior validamos algo muy importante:

- `order-service` ya vive dentro del cluster,
- y además convive razonablemente bien con el núcleo funcional que venimos reconstruyendo.

Eso deja a NovaMarket muy cerca de un nuevo hito dentro del bloque de Kubernetes:

**empezar a reconstruir también el circuito asincrónico dentro del cluster.**

Pero, para eso, primero necesitamos desplegar la pieza que reacciona a los eventos del negocio:

**`notification-service`**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un Deployment para `notification-service`,
- creado un Service para exponerlo dentro del namespace,
- pensada su relación con el resto del ecosistema ya desplegado,
- y preparada la última pieza importante para empezar a reconstruir el circuito `order.created` dentro de Kubernetes.

Todavía no vamos a validar el circuito asincrónico completo.  
La meta de hoy es instalar bien la pieza que falta para poder hacerlo en la próxima clase.

---

## Estado de partida

Partimos de un cluster donde ya viven:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`

Eso significa que ya tenemos:

- el núcleo base
- y una parte muy significativa del flujo funcional del sistema

Lo que todavía falta para reconstruir el circuito asincrónico central es precisamente `notification-service`.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear una carpeta de manifests para `notification-service`,
- definir su Deployment,
- definir su Service,
- pensar las referencias internas que necesita,
- desplegarlo dentro del cluster,
- y comprobar que la pieza ya vive dentro del nuevo entorno.

---

## Por qué `notification-service` es clave en este punto

Porque este servicio no es simplemente “otro microservicio”.

Dentro de NovaMarket cumple un rol muy importante:

- consume eventos del negocio
- persiste notificaciones
- y expone el resultado del circuito asincrónico

Eso hace que su ingreso al cluster sea mucho más que sumar una pieza más.

En realidad, lo que estamos haciendo es preparar el terreno para llevar a Kubernetes uno de los comportamientos más interesantes del sistema:  
**el circuito asincrónico.**

---

## Paso 1 · Crear una carpeta específica para el servicio

Dentro de `k8s/services/`, una organización razonable sería:

```txt
k8s/services/notification-service/
```

Esto mantiene el mismo criterio que venimos usando con todos los servicios del bloque.

---

## Paso 2 · Crear el Deployment de `notification-service`

Ahora creá algo como:

```txt
k8s/services/notification-service/deployment.yaml
```

Una base razonable podría verse así:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: notification-service
  namespace: novamarket
spec:
  replicas: 1
  selector:
    matchLabels:
      app: notification-service
  template:
    metadata:
      labels:
        app: notification-service
    spec:
      containers:
        - name: notification-service
          image: novamarket/notification-service:latest
          ports:
            - containerPort: 8085
```

Esto deja expresado lo básico:

- la imagen
- la réplica
- y el puerto del contenedor

---

## Paso 3 · Pensar qué necesita este servicio para vivir bien en el cluster

Este punto es muy importante.

`notification-service` no vive aislado.  
A esta altura del proyecto, lo natural es que necesite convivir con:

- `config-server`
- `discovery-server`
- RabbitMQ
- y, según cómo tengas montado el sistema, quizás otras piezas de soporte del entorno

Eso significa que este Deployment también debe pensarse como parte de una arquitectura y no solo como un contenedor con un puerto.

---

## Paso 4 · Crear el Service de `notification-service`

Ahora creá algo como:

```txt
k8s/services/notification-service/service.yaml
```

Una versión razonable podría verse así:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: notification-service
  namespace: novamarket
spec:
  selector:
    app: notification-service
  ports:
    - port: 8085
      targetPort: 8085
  type: ClusterIP
```

Con esto, `notification-service` ya queda accesible de forma estable dentro del namespace.

---

## Por qué `ClusterIP` vuelve a ser una buena elección

En esta etapa del bloque, lo importante no es exponer públicamente `notification-service`.

Lo que queremos es:

- que exista dentro del cluster
- que tenga un nombre interno estable
- y que quede listo para participar del circuito asincrónico reconstruido dentro del nuevo entorno

Por eso `ClusterIP` sigue siendo una elección natural.

---

## Paso 5 · Pensar variables de entorno o configuración complementaria

A esta altura del bloque ya debería volverse bastante natural pensar en cosas como:

- URL de Config Server
- URL de Eureka
- host del broker
- ajustes mínimos del entorno del servicio dentro del cluster

No hace falta que esta clase cierre todavía una estrategia definitiva de ConfigMap o Secret para todas las piezas.  
Pero sí conviene tratar el Deployment de forma realista.

---

## Paso 6 · Aplicar los manifests

Ahora aplicá:

- el Deployment
- y el Service de `notification-service`

Todo dentro del namespace `novamarket`.

Este es un paso muy importante porque con él ya tenemos desplegadas dentro del cluster todas las piezas principales que intervienen en el circuito asincrónico que venimos trabajando desde el bloque de RabbitMQ.

---

## Paso 7 · Verificar Pods y Service

Después de aplicar los recursos, revisá:

- que el Pod exista
- que el Deployment haya creado correctamente la réplica
- y que el Service también esté presente

La idea es confirmar que la pieza ya forma parte real del entorno Kubernetes.

---

## Paso 8 · Revisar logs de `notification-service`

Ahora mirá los logs del Pod.

Queremos comprobar que:

- la aplicación arranca correctamente,
- no queda en crash loop,
- y no muestra una falla evidente de configuración o integración con el cluster.

Este punto vale mucho porque este servicio va a ser la pieza clave para validar el siguiente gran paso del bloque.

---

## Paso 9 · Entender el significado de este paso

Después de esta clase, NovaMarket ya tiene dentro del cluster:

### Núcleo base
- `config-server`
- `discovery-server`

### Capa funcional
- `catalog-service`
- `inventory-service`
- `order-service`

### Reacción asincrónica
- `notification-service`

Eso significa que el cluster ya alberga una porción muy sustancial del sistema.

La reconstrucción dentro de Kubernetes ya es realmente importante.

---

## Paso 10 · Probar el servicio si tu entorno local ya te lo permite

Si tenés una forma razonable de validar señales básicas del servicio dentro de tu entorno local de Kubernetes, este es un buen momento para hacerlo.

No hace falta todavía reconstruir todo el circuito asincrónico en esta clase.  
La prioridad sigue siendo que la pieza esté viva, sana y lista.

---

## Qué estamos logrando con esta clase

Esta clase instala la pieza que faltaba para que el bloque de Kubernetes deje de reconstruir solo la parte síncrona del sistema y pueda empezar a reconstruir también la parte asincrónica.

Eso es un cambio muy importante en el peso del entorno dentro del cluster.

---

## Qué todavía no hicimos

Todavía no:

- validamos el circuito `order.created` dentro del cluster
- comprobamos el recorrido completo entre `order-service`, broker y `notification-service`
- ni cerramos el flujo asincrónico en el nuevo entorno

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**dejar arriba la pieza final que faltaba para poder hacerlo.**

---

## Errores comunes en esta etapa

### 1. Tratar `notification-service` como un servicio aislado
Su rol dentro del circuito asincrónico importa muchísimo.

### 2. No pensar el broker y el resto del entorno como parte de su contexto real
A esta altura el ecosistema ya pesa bastante.

### 3. Olvidar el namespace
Eso sigue siendo una fuente clásica de desorden.

### 4. No revisar logs
El Deployment aplicado no garantiza que el servicio esté sano.

### 5. Querer validar todo el circuito asincrónico en esta misma clase
Hoy la prioridad es instalar bien la pieza.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `notification-service` debería estar desplegado en Kubernetes con su Deployment y su Service dentro del namespace `novamarket`.

Eso deja al proyecto listo para empezar a reconstruir también el circuito asincrónico dentro del cluster.

---

## Punto de control

Antes de seguir, verificá que:

- existe el Deployment de `notification-service`,
- existe el Service de `notification-service`,
- el Pod arranca,
- los logs son razonables,
- y la última gran pieza del circuito asincrónico ya vive dentro del cluster.

Si eso está bien, ya podemos reconstruir el primer flujo asincrónico completo en Kubernetes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar el circuito `order.created` dentro del cluster.

Ese será uno de los hitos más importantes del bloque porque va a demostrar que Kubernetes ya no aloja solo servicios sueltos, sino una parte muy significativa del comportamiento real del sistema.

---

## Cierre

En esta clase llevamos `notification-service` a Kubernetes.

Con eso, NovaMarket ya tiene dentro del cluster las piezas principales del circuito asincrónico y queda perfectamente preparado para empezar a reconstruir también esa parte del sistema dentro del nuevo entorno.
