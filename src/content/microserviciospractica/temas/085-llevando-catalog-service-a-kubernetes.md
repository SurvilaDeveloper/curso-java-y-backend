---
title: "Llevando catalog-service a Kubernetes"
description: "Primer servicio de negocio de NovaMarket desplegado dentro del cluster. Creación de Deployment y Service para catalog-service sobre la base ya montada con config-server y discovery-server."
order: 85
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Llevando `catalog-service` a Kubernetes

En las últimas clases del bloque de Kubernetes hicimos un trabajo muy importante:

- creamos el namespace `novamarket`,
- ordenamos la estructura base de manifests,
- llevamos `config-server` al cluster,
- llevamos `discovery-server`,
- y además validamos que ese núcleo base ya está razonablemente sano.

Ahora sí toca un paso muy importante:

**llevar el primer servicio funcional del negocio a Kubernetes.**

La pieza elegida para eso es:

**`catalog-service`**

¿Por qué?

Porque es un servicio relativamente claro, muy conocido dentro del proyecto y además nos permite empezar a reconstruir la capa funcional del sistema sin entrar todavía en el servicio más cargado de dependencias del flujo principal.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un Deployment para `catalog-service`,
- creado un Service para exponerlo dentro del namespace,
- pensada su relación con `config-server` y `discovery-server`,
- y desplegado el primer servicio de negocio de NovaMarket dentro del cluster.

Todavía no vamos a reconstruir todo el flujo principal.  
La meta de hoy es inaugurar la capa funcional del sistema en Kubernetes.

---

## Estado de partida

Partimos de este contexto:

- el namespace `novamarket` ya existe,
- `config-server` ya vive en Kubernetes,
- `discovery-server` también,
- y ese núcleo base ya fue validado.

Además, `catalog-service` ya existe, ya tiene imagen o estrategia de build razonable y ya es una pieza muy conocida del proyecto.

Eso lo vuelve un excelente candidato para el siguiente paso del bloque.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear una carpeta de manifests para `catalog-service`,
- definir su Deployment,
- definir su Service,
- pensar las referencias internas que necesita,
- desplegarlo en el cluster,
- y verificar que el primer servicio de negocio ya quedó arriba.

---

## Por qué conviene empezar por `catalog-service`

Este servicio tiene varias ventajas para esta etapa:

- es conocido
- su responsabilidad es clara
- suele ser más simple que `order-service`
- y nos permite empezar a validar endpoints funcionales en Kubernetes sin cargar todavía el entorno con todas las dependencias del flujo más complejo

En otras palabras:

**es un primer servicio de negocio muy equilibrado para inaugurar esta etapa.**

---

## Paso 1 · Crear una carpeta específica para el servicio

Dentro de `k8s/services/`, una organización razonable sería:

```txt
k8s/services/catalog-service/
```

Esto mantiene el mismo criterio que venimos usando con los servicios anteriores.

---

## Paso 2 · Crear el Deployment de `catalog-service`

Ahora creá algo como:

```txt
k8s/services/catalog-service/deployment.yaml
```

Una base razonable podría verse así:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: catalog-service
  namespace: novamarket
spec:
  replicas: 1
  selector:
    matchLabels:
      app: catalog-service
  template:
    metadata:
      labels:
        app: catalog-service
    spec:
      containers:
        - name: catalog-service
          image: novamarket/catalog-service:latest
          ports:
            - containerPort: 8081
```

Esto deja expresado lo básico:

- una réplica
- la imagen del servicio
- y el puerto del contenedor

---

## Paso 3 · Pensar qué necesita para arrancar dentro del cluster

A esta altura del bloque, ya deberíamos hacernos una pregunta cada vez más importante:

**¿qué referencias del entorno necesita el servicio para vivir bien dentro de Kubernetes?**

En el caso de `catalog-service`, lo más natural es pensar en su relación con:

- `config-server`
- `discovery-server`

Eso significa que la configuración del servicio ya debería ir razonablemente alineada con nombres internos del cluster y no depender tanto de supuestos heredados del entorno manual o de Compose.

Este punto es clave para que el despliegue no sea solo “aplicar un YAML”, sino hacerlo con sentido arquitectónico.

---

## Paso 4 · Crear el Service de `catalog-service`

Ahora creá algo como:

```txt
k8s/services/catalog-service/service.yaml
```

Una versión razonable podría verse así:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: catalog-service
  namespace: novamarket
spec:
  selector:
    app: catalog-service
  ports:
    - port: 8081
      targetPort: 8081
  type: ClusterIP
```

Con esto, `catalog-service` ya queda expuesto de forma estable dentro del cluster.

---

## Por qué `ClusterIP` sigue siendo una gran opción

En esta etapa no hace falta exponer `catalog-service` como servicio público hacia fuera del cluster.

Lo importante es que:

- exista como pieza funcional dentro del namespace,
- tenga un nombre estable de acceso interno,
- y podamos seguir reconstruyendo el ecosistema progresivamente.

Eso hace que `ClusterIP` siga siendo la opción más natural.

---

## Paso 5 · Pensar si necesita variables de entorno o configuración complementaria

Igual que pasó con los servicios anteriores, es muy posible que `catalog-service` necesite un pequeño ajuste del Deployment para convivir bien con el nuevo entorno.

Por ejemplo, puede tener sentido usar variables de entorno o configuración centralizada para cosas como:

- URL de Config Server
- URL de Eureka
- perfil o entorno activo

No hace falta que esta clase cierre la estrategia definitiva para todos los servicios.  
Pero sí conviene empezar a pensar el Deployment de forma realista y no solo como un contenedor aislado con un puerto.

---

## Paso 6 · Aplicar los manifests

Ahora aplicá:

- el Deployment
- y el Service de `catalog-service`

Todo dentro del namespace `novamarket`.

Este es un momento importante porque ya no estamos desplegando solo piezas base del ecosistema: estamos entrando de verdad a la capa funcional del negocio.

---

## Paso 7 · Verificar Pods y Service

Después de aplicar los recursos, revisá:

- que el Pod exista
- que el Deployment haya creado la réplica
- y que el Service también esté presente

Esto confirma que el recurso ya forma parte real del cluster.

---

## Paso 8 · Revisar logs de `catalog-service`

Ahora mirá los logs del Pod.

Queremos comprobar que:

- la aplicación arranca correctamente,
- no queda en un ciclo de reinicios,
- y su integración básica con el entorno no está rota.

Este punto es especialmente valioso porque empieza a mostrar si el núcleo base que validamos antes realmente ya puede sostener servicios funcionales.

---

## Paso 9 · Pensar el significado de este paso dentro del bloque

Hasta ahora, lo que existía dentro del cluster era sobre todo infraestructura lógica del ecosistema:

- configuración
- discovery

Con `catalog-service`, eso cambia bastante.

Ahora el cluster empieza a alojar también una pieza del negocio real.

Ese cambio es muy importante porque abre la puerta al resto de la reconstrucción del sistema.

---

## Paso 10 · Probar el servicio si tu entorno lo permite

Si ya contás con una forma razonable de validar el servicio en tu entorno local de Kubernetes, este es un gran momento para verificar algún endpoint funcional simple del catálogo.

No hace falta todavía resolver todo lo relativo a ingress o exposición final del sistema.  
La prioridad sigue siendo confirmar que el primer servicio funcional realmente vive y responde dentro del cluster.

---

## Qué estamos logrando con esta clase

Esta clase marca un hito importante del bloque.

Antes teníamos el núcleo base del ecosistema.  
Ahora ya empezamos a tener también la capa funcional del negocio entrando a Kubernetes.

Eso hace que el bloque deje de parecer meramente infraestructural y pase a sentirse como una migración real del sistema.

---

## Qué todavía no hicimos

Todavía no:

- llevamos `inventory-service`
- desplegamos `order-service`
- ni reconstruimos el flujo principal completo

Todo eso viene en las próximas clases.

La meta de hoy es mucho más concreta:

**desplegar bien el primer servicio de negocio dentro del cluster.**

---

## Errores comunes en esta etapa

### 1. Tratar `catalog-service` como si no dependiera del núcleo base
El entorno ya importa mucho más que en la primera parte del curso.

### 2. Olvidar el namespace
Eso rompe el orden del bloque enseguida.

### 3. No alinear labels y selector del Service
Entonces el Service existe, pero no enruta tráfico al Pod.

### 4. No revisar logs
El Deployment aplicado no garantiza que la aplicación realmente esté sana.

### 5. Apurarse a llevar demasiados servicios antes de validar este paso
Conviene consolidar bien el primer servicio funcional.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `catalog-service` debería estar desplegado en Kubernetes con su Deployment y su Service dentro del namespace `novamarket`.

Eso inaugura formalmente la capa funcional del sistema dentro del cluster y deja muy bien preparado el siguiente escalón del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- existe el Deployment de `catalog-service`,
- existe el Service de `catalog-service`,
- el Pod arranca,
- los logs son razonables,
- y el primer servicio de negocio ya vive dentro del cluster.

Si eso está bien, ya podemos seguir reconstruyendo el ecosistema funcional de NovaMarket en Kubernetes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a llevar `inventory-service` a Kubernetes.

Eso nos va a permitir ampliar la capa funcional del sistema dentro del cluster y acercarnos cada vez más a la reconstrucción del flujo principal.

---

## Cierre

En esta clase llevamos `catalog-service` a Kubernetes.

Con eso, NovaMarket ya no solo tiene su núcleo base dentro del cluster: también empieza a reconstruir su capa funcional real en el nuevo entorno de orquestación.
