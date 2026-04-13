---
title: "Llevando inventory-service a Kubernetes"
description: "Continuación del bloque de Kubernetes en NovaMarket. Despliegue de inventory-service dentro del cluster para seguir reconstruyendo la capa funcional del sistema."
order: 86
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Llevando `inventory-service` a Kubernetes

En la clase anterior dimos un paso muy importante dentro del bloque de Kubernetes:

- validamos el núcleo base del ecosistema,
- y además llevamos `catalog-service` al cluster como primer servicio funcional del negocio.

Eso ya dejó a NovaMarket con algo muy valioso dentro de Kubernetes:

- `config-server`
- `discovery-server`
- `catalog-service`

Ahora toca sumar otra pieza fundamental de la capa funcional:

**`inventory-service`**

¿Por qué es importante?

Porque inventario no solo es un servicio del negocio, sino que además forma parte directa del flujo principal de órdenes que más adelante vamos a querer reconstruir dentro del cluster.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un Deployment para `inventory-service`,
- creado un Service para exponerlo dentro del namespace,
- pensada su integración básica con el núcleo ya desplegado,
- y llevada una segunda pieza funcional del negocio a Kubernetes.

Todavía no vamos a cerrar el flujo principal completo.  
La meta de hoy es seguir ampliando la capa funcional de NovaMarket dentro del cluster de forma ordenada.

---

## Estado de partida

Partimos de este contexto:

- el namespace `novamarket` ya existe,
- `config-server` ya vive en Kubernetes,
- `discovery-server` también,
- `catalog-service` ya fue desplegado,
- y el núcleo base del sistema ya fue validado antes de empezar a mover servicios del negocio.

Esto deja el cluster listo para recibir la siguiente pieza funcional.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear una carpeta de manifests para `inventory-service`,
- definir su Deployment,
- definir su Service,
- pensar qué referencias internas necesita,
- desplegarlo dentro del cluster,
- y comprobar que el segundo servicio de negocio ya quedó arriba.

---

## Por qué conviene llevar `inventory-service` ahora

Porque, dentro del proyecto actual, `inventory-service` tiene varias ventajas para esta etapa:

- su responsabilidad es clara,
- ya es un servicio muy conocido del sistema,
- se conecta naturalmente con el núcleo base,
- y además es una dependencia central de `order-service`.

Eso significa que moverlo ahora no solo amplía la capa funcional, sino que además prepara el terreno para el siguiente gran paso del bloque.

---

## Paso 1 · Crear una carpeta específica para el servicio

Dentro de `k8s/services/`, una organización razonable sería:

```txt
k8s/services/inventory-service/
```

Esto mantiene el mismo criterio que venimos usando con los otros servicios.

---

## Paso 2 · Crear el Deployment de `inventory-service`

Ahora creá algo como:

```txt
k8s/services/inventory-service/deployment.yaml
```

Una base razonable podría verse así:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: inventory-service
  namespace: novamarket
spec:
  replicas: 1
  selector:
    matchLabels:
      app: inventory-service
  template:
    metadata:
      labels:
        app: inventory-service
    spec:
      containers:
        - name: inventory-service
          image: novamarket/inventory-service:latest
          ports:
            - containerPort: 8082
```

Esto deja expresado lo básico:

- la imagen
- la réplica
- y el puerto del contenedor

---

## Paso 3 · Pensar qué necesita para arrancar bien

Igual que pasó con `catalog-service`, `inventory-service` no vive aislado.

Conviene pensar desde ya su relación con:

- `config-server`
- `discovery-server`

Y, según cómo tengas armado el proyecto, también con la forma en que resuelve su propia configuración dentro del cluster.

Este punto importa mucho porque el verdadero objetivo no es solo “tener un Pod corriendo”, sino que el servicio viva de forma coherente en el nuevo entorno.

---

## Paso 4 · Crear el Service de `inventory-service`

Ahora creá algo como:

```txt
k8s/services/inventory-service/service.yaml
```

Una versión razonable podría verse así:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: inventory-service
  namespace: novamarket
spec:
  selector:
    app: inventory-service
  ports:
    - port: 8082
      targetPort: 8082
  type: ClusterIP
```

Esto deja al servicio accesible internamente dentro del cluster con un nombre estable.

---

## Por qué `ClusterIP` sigue siendo la decisión correcta

En esta etapa del bloque todavía estamos reconstruyendo el ecosistema funcional dentro del cluster.

No necesitamos exponer `inventory-service` al exterior como servicio público.

Lo importante es que:

- exista como recurso real,
- tenga un punto de acceso interno estable,
- y pueda servir como pieza del flujo distribuido que vamos a reconstruir más adelante.

Por eso `ClusterIP` sigue siendo una muy buena opción.

---

## Paso 5 · Pensar si necesita variables de entorno o ajustes de arranque

Dependiendo de cómo venga hoy el proyecto, puede tener sentido complementar el Deployment con:

- referencias al Config Server
- URL de Eureka
- perfil activo
- o cualquier ajuste mínimo que lo haga convivir bien con el entorno del cluster

No hace falta convertir esta clase en una tesis sobre ConfigMaps y Secrets todavía.  
Pero sí conviene empezar a pensar que un Deployment útil suele necesitar algo más que solo imagen y puerto.

---

## Paso 6 · Aplicar los manifests

Ahora aplicá:

- el Deployment
- y el Service de `inventory-service`

Todo dentro del namespace `novamarket`.

Este paso sigue ampliando la capa funcional del negocio dentro del cluster y deja cada vez más cerca la reconstrucción del flujo principal.

---

## Paso 7 · Verificar Pods y Service

Después de aplicar los recursos, revisá:

- que el Pod exista
- que el Deployment haya creado correctamente la réplica
- y que el Service también esté presente

La idea es confirmar que el segundo servicio de negocio ya forma parte real del entorno Kubernetes.

---

## Paso 8 · Revisar logs de `inventory-service`

Ahora mirá los logs del Pod.

Queremos comprobar que:

- la aplicación arranca correctamente,
- no entra en crash loop,
- y no está mostrando una falla evidente por configuración o integración con el núcleo base.

Este punto es muy importante porque nos empieza a decir si la base que ya construimos dentro del cluster realmente sostiene servicios funcionales de negocio.

---

## Paso 9 · Pensar el significado de este paso dentro del roadmap

Después de esta clase, NovaMarket ya no tiene solo una pieza funcional del negocio dentro de Kubernetes.

Ahora tiene dos:

- `catalog-service`
- `inventory-service`

Eso ya empieza a parecerse mucho más a una reconstrucción real del sistema y no solo a una prueba aislada de despliegue.

Este es un gran momento del bloque.

---

## Paso 10 · Probar el servicio si tu entorno ya lo permite

Si tenés una forma razonable de validar el servicio en tu entorno local de Kubernetes, este es un gran momento para probar algún endpoint funcional simple de inventario.

No hace falta todavía cerrar el acceso externo definitivo de la arquitectura.  
La prioridad sigue siendo confirmar que el servicio ya vive y responde dentro del cluster.

---

## Qué estamos logrando con esta clase

Esta clase amplía de forma clara la capa funcional del sistema dentro de Kubernetes.

Antes solo habíamos llevado `catalog-service`.  
Ahora el cluster ya empieza a alojar una pequeña porción real del negocio que se parece mucho más al sistema que venimos construyendo desde el principio.

Eso le da muchísimo más cuerpo al bloque.

---

## Qué todavía no hicimos

Todavía no:

- llevamos `order-service`
- reconstruimos el flujo principal completo
- ni validamos integración funcional entre estos servicios dentro del cluster

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**sumar la segunda pieza funcional del negocio dentro del nuevo entorno.**

---

## Errores comunes en esta etapa

### 1. Tratar `inventory-service` como si fuera un Pod aislado
La integración con el núcleo base importa mucho.

### 2. Olvidar el namespace
Eso rompe la organización del bloque enseguida.

### 3. No alinear labels y selector del Service
Entonces el Service existe, pero no enruta al Pod.

### 4. No revisar logs
El Deployment creado no garantiza que el servicio esté sano.

### 5. Apurarse a pasar a `order-service` sin consolidar este paso
Conviene tener bien parada la base funcional antes de llevar el servicio más delicado del flujo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `inventory-service` debería estar desplegado en Kubernetes con su Deployment y su Service dentro del namespace `novamarket`.

Eso deja la capa funcional del sistema mucho mejor armada y prepara el terreno para el siguiente gran paso del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- existe el Deployment de `inventory-service`,
- existe el Service de `inventory-service`,
- el Pod arranca,
- los logs son razonables,
- y la segunda pieza funcional del negocio ya vive dentro del cluster.

Si eso está bien, ya podemos hacer un checkpoint importante del bloque funcional dentro de Kubernetes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar `catalog-service` e `inventory-service` dentro del cluster como primer núcleo funcional del negocio.

Ese checkpoint va a ser muy valioso antes de llevar `order-service` y empezar a reconstruir el flujo principal.

---

## Cierre

En esta clase llevamos `inventory-service` a Kubernetes.

Con eso, NovaMarket ya tiene dos servicios funcionales del negocio viviendo dentro del cluster y el bloque de orquestación empieza a acercarse de verdad a una reconstrucción real del sistema completo.
