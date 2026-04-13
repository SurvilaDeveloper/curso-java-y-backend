---
title: "Llevando api-gateway a Kubernetes"
description: "Continuación del bloque de Kubernetes en NovaMarket. Despliegue de api-gateway dentro del cluster para empezar a reconstruir también la capa de entrada del sistema."
order: 92
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Llevando `api-gateway` a Kubernetes

En la clase anterior logramos algo muy importante:

- `order-service` ya vive dentro del cluster,
- `notification-service` también,
- y además reconstruimos el circuito `order.created` dentro de Kubernetes.

Eso ya significa que el cluster aloja una parte muy significativa del comportamiento real de NovaMarket.

Ahora toca otro paso muy importante:

**llevar `api-gateway` a Kubernetes.**

¿Por qué importa tanto?

Porque hasta ahora reconstruimos bastante bien la lógica interna del sistema dentro del cluster, pero todavía nos falta una pieza clave para acercarnos a un entorno más completo:

**la capa de entrada.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un Deployment para `api-gateway`,
- creado un Service para exponerlo dentro del namespace,
- pensada su relación con el ecosistema ya desplegado,
- y desplegada dentro del cluster la puerta de entrada principal del sistema.

Todavía no vamos a cerrar toda la exposición externa del entorno de Kubernetes.  
La meta de hoy es instalar correctamente `api-gateway` dentro del nuevo entorno.

---

## Estado de partida

Partimos de un cluster donde ya viven:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`

Eso significa que el cluster ya alberga:

- el núcleo base del sistema,
- la capa funcional principal,
- y una parte importante del circuito asincrónico.

Lo que falta ahora es sumar la pieza que organiza el acceso de entrada a todo ese ecosistema:

**`api-gateway`**

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear una carpeta de manifests para `api-gateway`,
- definir su Deployment,
- definir su Service,
- pensar sus dependencias internas,
- desplegarlo dentro del cluster,
- y comprobar que la capa de entrada ya forma parte real del nuevo entorno.

---

## Por qué `api-gateway` conviene entrar ahora

Porque a esta altura del bloque ya tenemos suficiente cuerpo funcional dentro del cluster como para que un gateway tenga sentido real.

Si lo hubiéramos llevado demasiado pronto, solo hubiera sido una pieza de entrada apuntando a muy pocos servicios.  
Ahora, en cambio, puede empezar a actuar sobre una base bastante más representativa del sistema.

En otras palabras:

**ahora sí tiene algo importante que enrutar.**

---

## Paso 1 · Crear una carpeta específica para el servicio

Dentro de `k8s/services/`, una organización razonable sería:

```txt
k8s/services/api-gateway/
```

Esto mantiene el criterio que ya venimos usando con el resto de los servicios del bloque.

---

## Paso 2 · Crear el Deployment de `api-gateway`

Ahora creá algo como:

```txt
k8s/services/api-gateway/deployment.yaml
```

Una base razonable podría verse así:

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

Esto deja expresado lo básico:

- la imagen
- la réplica
- y el puerto del contenedor

---

## Paso 3 · Pensar qué necesita `api-gateway` para vivir bien en el cluster

Este punto es especialmente importante.

`api-gateway` no es solo otro servicio más del sistema.  
Es una pieza muy sensible porque suele concentrar:

- rutas de entrada
- integración con discovery
- seguridad
- y visibilidad general del sistema

Por eso conviene pensar muy bien su contexto dentro del cluster, especialmente en relación con:

- `config-server`
- `discovery-server`
- el proveedor de identidad si ya forma parte del entorno
- y los nombres internos de los servicios del sistema

No hace falta resolver hoy todos los matices avanzados del gateway.  
Pero sí hay que tratar su Deployment como una pieza central del ecosistema.

---

## Paso 4 · Crear el Service de `api-gateway`

Ahora creá algo como:

```txt
k8s/services/api-gateway/service.yaml
```

Una versión razonable podría verse así:

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
  type: ClusterIP
```

Con esto, el gateway ya queda expuesto internamente dentro del cluster.

---

## Por qué arrancar con `ClusterIP` sigue siendo razonable

Aunque `api-gateway` es la puerta de entrada del sistema, en esta etapa todavía conviene separar dos problemas:

### Problema 1
Hacer que el gateway viva correctamente dentro del cluster.

### Problema 2
Decidir cómo exponerlo hacia afuera.

Hoy nos concentramos en el primero.

Eso hace que `ClusterIP` siga siendo una muy buena elección inicial.  
La exposición externa del gateway la vamos a trabajar en la próxima clase.

---

## Paso 5 · Pensar variables de entorno o configuración complementaria

En `api-gateway`, esto suele importar bastante.

Es razonable que el Deployment necesite pensar al menos en cosas como:

- URL de Config Server
- URL de Eureka
- referencias internas del ecosistema
- y, si corresponde, algún ajuste relacionado con seguridad o tracing

No hace falta que esta clase cierre toda la estrategia de ConfigMap y Secret del sistema.  
Pero sí conviene tratar `api-gateway` como la pieza sensible que realmente es.

---

## Paso 6 · Aplicar los manifests

Ahora aplicá:

- el Deployment
- y el Service de `api-gateway`

Todo dentro del namespace `novamarket`.

Este paso es muy importante porque ya instala dentro del cluster la capa de entrada del sistema.

---

## Paso 7 · Verificar Pods y Service

Después de aplicar los recursos, revisá:

- que el Pod exista
- que el Deployment haya creado correctamente la réplica
- y que el Service también esté presente

La idea es confirmar que `api-gateway` ya forma parte real del entorno Kubernetes.

---

## Paso 8 · Revisar logs de `api-gateway`

Ahora mirá los logs del Pod.

Queremos comprobar que:

- la aplicación arranca correctamente,
- no entra en crash loop,
- y no muestra fallas obvias de integración con el ecosistema ya desplegado.

Este punto vale muchísimo porque el gateway concentra varias dependencias importantes del sistema.

---

## Paso 9 · Pensar qué significa este paso dentro del bloque

Después de esta clase, el cluster ya no tiene solo el núcleo base y una parte importante de la lógica interna.

Ahora también tiene la pieza que organiza la entrada al sistema.

Eso cambia bastante el peso real del entorno dentro de Kubernetes y lo acerca mucho más a una reconstrucción completa del stack principal.

---

## Paso 10 · Validar señales básicas del servicio si tu entorno lo permite

Si tenés una forma razonable de validar señales de vida dentro de tu entorno local de Kubernetes, este es un buen momento para comprobar algún endpoint básico o health del gateway.

No hace falta todavía cerrar la exposición externa completa.  
La prioridad sigue siendo confirmar que la pieza ya vive de forma razonable dentro del cluster.

---

## Qué estamos logrando con esta clase

Esta clase mete dentro de Kubernetes la capa de entrada del sistema.

Eso significa que el bloque ya no reconstruye solo piezas internas o lógicas de negocio:  
empieza a reconstruir también la forma en que se accede al sistema.

Ese paso es muy importante.

---

## Qué todavía no hicimos

Todavía no:

- expusimos el gateway hacia fuera del cluster
- validamos un recorrido real entrando por esa capa dentro del nuevo entorno
- ni cerramos la reconstrucción más completa del sistema en Kubernetes

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**instalar correctamente `api-gateway` dentro del cluster.**

---

## Errores comunes en esta etapa

### 1. Tratar `api-gateway` como un microservicio cualquiera
Su rol dentro del ecosistema es mucho más sensible.

### 2. Querer resolver toda la exposición externa en esta misma clase
Hoy primero queremos que viva correctamente dentro del cluster.

### 3. No pensar sus dependencias internas
Gateway suele depender de varias piezas del entorno.

### 4. No revisar logs
En esta pieza eso vale muchísimo.

### 5. Olvidar el namespace
Eso sigue siendo una fuente clásica de desorden.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `api-gateway` debería estar desplegado en Kubernetes con su Deployment y su Service dentro del namespace `novamarket`.

Eso deja al proyecto muy cerca de poder validar un acceso más completo al sistema dentro del cluster.

---

## Punto de control

Antes de seguir, verificá que:

- existe el Deployment de `api-gateway`,
- existe el Service de `api-gateway`,
- el Pod arranca,
- los logs son razonables,
- y la capa de entrada ya vive dentro del cluster.

Si eso está bien, ya podemos pasar a exponerlo y usarlo como puerta de acceso dentro del nuevo entorno.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a definir una forma razonable de acceso al gateway dentro del entorno Kubernetes.

Eso nos va a permitir empezar a validar el sistema entrando por la puerta natural del stack también dentro del cluster.

---

## Cierre

En esta clase llevamos `api-gateway` a Kubernetes.

Con eso, NovaMarket ya no solo tiene dentro del cluster una parte muy significativa de su lógica interna y asincrónica: también empieza a reconstruir la capa de entrada del sistema dentro del nuevo entorno de orquestación.
