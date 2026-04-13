---
title: "Llevando order-service a Kubernetes"
description: "Paso clave del bloque de Kubernetes en NovaMarket. Despliegue de order-service dentro del cluster para empezar a reconstruir el flujo principal del negocio."
order: 88
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Llevando `order-service` a Kubernetes

En las últimas clases del bloque de Kubernetes construimos algo muy importante:

- validamos el núcleo base del ecosistema,
- llevamos `catalog-service`,
- llevamos `inventory-service`,
- y además comprobamos que esa primera capa funcional del negocio ya está razonablemente sana dentro del cluster.

Ahora toca uno de los pasos más importantes de todo este tramo:

**llevar `order-service` a Kubernetes.**

Este servicio es especialmente relevante porque:

- participa directamente del flujo principal del negocio,
- depende de otras piezas funcionales del sistema,
- y además conecta con varios bloques del curso:
  - seguridad
  - resiliencia
  - mensajería
  - observabilidad

Por eso esta clase marca un punto muy importante del bloque.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un Deployment para `order-service`,
- creado un Service para exponerlo dentro del namespace,
- pensada su relación con el resto del ecosistema ya desplegado,
- y dado uno de los pasos más fuertes hacia la reconstrucción del flujo principal dentro del cluster.

Todavía no vamos a cerrar todo el recorrido completo de órdenes en Kubernetes.  
La meta de hoy es desplegar bien el servicio y dejarlo listo para la siguiente etapa de validación.

---

## Estado de partida

Partimos de este contexto:

- el namespace `novamarket` ya existe,
- `config-server` ya está desplegado,
- `discovery-server` también,
- `catalog-service` ya vive en Kubernetes,
- `inventory-service` también,
- y esa base funcional ya fue revisada en la clase anterior.

Eso significa que el cluster ya tiene suficiente cuerpo como para intentar mover el servicio más central del flujo principal.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear una carpeta de manifests para `order-service`,
- definir su Deployment,
- definir su Service,
- pensar las referencias internas que necesita,
- desplegarlo dentro del cluster,
- y validar el arranque de una de las piezas más importantes del sistema.

---

## Por qué `order-service` es un servicio más delicado

A diferencia de servicios anteriores, `order-service` no solo vive del núcleo base.

También suele depender de cosas como:

- `inventory-service`
- mensajería con RabbitMQ
- trazas
- y varias configuraciones sensibles del entorno

Eso significa que esta clase no es simplemente “repetir el patrón” de otros servicios.

Lo que estamos haciendo ahora es empezar a mover al cluster una pieza mucho más representativa del sistema real.

---

## Paso 1 · Crear una carpeta específica para el servicio

Dentro de `k8s/services/`, una organización razonable sería:

```txt
k8s/services/order-service/
```

Esto mantiene la coherencia del bloque y deja agrupados los recursos del servicio.

---

## Paso 2 · Crear el Deployment de `order-service`

Ahora creá algo como:

```txt
k8s/services/order-service/deployment.yaml
```

Una base razonable podría verse así:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
  namespace: novamarket
spec:
  replicas: 1
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
        - name: order-service
          image: novamarket/order-service:latest
          ports:
            - containerPort: 8083
```

Esto deja expresado lo básico:

- la imagen
- la réplica
- y el puerto del contenedor

---

## Paso 3 · Pensar qué necesita `order-service` para vivir bien en el cluster

Este es el punto más importante de la clase.

`order-service` no vive solo.  
Conviene pensar muy bien qué necesita del entorno para arrancar de forma coherente.

Los candidatos más claros son:

- `config-server`
- `discovery-server`
- `inventory-service`
- `rabbitmq`
- y, según cómo lo tengas montado, quizás otros soportes del sistema

No hace falta que hoy resolvamos todas las sutilezas del flujo de punta a punta, pero sí conviene que el Deployment ya se piense como parte de un ecosistema y no como un contenedor aislado.

---

## Paso 4 · Crear el Service de `order-service`

Ahora creá algo como:

```txt
k8s/services/order-service/service.yaml
```

Una versión razonable podría verse así:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: order-service
  namespace: novamarket
spec:
  selector:
    app: order-service
  ports:
    - port: 8083
      targetPort: 8083
  type: ClusterIP
```

Esto deja a `order-service` expuesto de forma estable dentro del cluster.

---

## Por qué `ClusterIP` sigue siendo lo natural en esta etapa

Igual que en clases anteriores, todavía no necesitamos exponer este servicio directamente como interfaz pública externa.

Lo importante es que:

- exista dentro del namespace,
- tenga un nombre estable de acceso interno,
- y pueda integrarse con las otras piezas del sistema dentro del cluster.

Eso sigue haciendo de `ClusterIP` una muy buena decisión.

---

## Paso 5 · Pensar variables de entorno o configuración complementaria

Para `order-service`, este paso pesa más que en otros servicios anteriores.

Es muy razonable que el Deployment necesite algo de contexto adicional, por ejemplo:

- ubicación de Config Server
- dirección de Eureka
- host de RabbitMQ
- host de Zipkin si ya querés preparar tracing
- o cualquier otra referencia crítica del entorno

No hace falta que hoy resolvamos de forma perfecta toda la matriz de configuración del servicio.  
Pero sí conviene dejar claro que este Deployment ya exige pensar más seriamente el entorno que lo rodea.

---

## Paso 6 · Aplicar los manifests

Ahora aplicá:

- el Deployment
- y el Service de `order-service`

Todo dentro del namespace `novamarket`.

Este es uno de los momentos más importantes del bloque, porque empezamos a mover al cluster el corazón del flujo principal del negocio.

---

## Paso 7 · Verificar Pods y Service

Después de aplicar los recursos, revisá:

- que el Pod exista
- que el Deployment haya creado correctamente la réplica
- y que el Service también esté presente

La idea es confirmar que `order-service` ya forma parte real del entorno Kubernetes.

---

## Paso 8 · Revisar logs de `order-service`

Ahora mirá los logs del Pod.

Queremos comprobar que:

- la aplicación arranca correctamente,
- no entra en crash loop,
- y sus dependencias más importantes no están evidentemente mal resueltas.

Este punto es más sensible que en otros servicios previos justamente porque `order-service` concentra bastante más complejidad.

---

## Paso 9 · Entender qué significa este paso dentro del roadmap

Después de esta clase, el cluster ya no tiene solo:

- núcleo base
- y una primera capa funcional simple

Ahora también empieza a tener el servicio más central del flujo principal del negocio.

Eso hace que el bloque de Kubernetes ya esté muy cerca de poder reconstruir recorridos reales del sistema dentro del cluster.

Este es un hito fuerte del curso.

---

## Paso 10 · Probar el servicio si tu entorno local ya te lo permite

Si contás con un mecanismo razonable de prueba en tu entorno de Kubernetes, este es un buen momento para validar señales básicas de vida de `order-service`.

No hace falta todavía cerrar todo el flujo funcional desde gateway ni resolver exposición externa completa.  
La prioridad sigue siendo confirmar que el servicio ya vive razonablemente dentro del cluster.

---

## Qué estamos logrando con esta clase

Esta clase mete en Kubernetes una de las piezas más importantes de todo NovaMarket.

Eso significa que el bloque ya no está construyendo solo los bordes del sistema.  
Empieza a entrar de lleno en su centro funcional.

Ese cambio es enorme.

---

## Qué todavía no hicimos

Todavía no:

- validamos el flujo principal completo de órdenes dentro del cluster
- llevamos `notification-service`
- ni reconstruimos la capa de entrada con `api-gateway`

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**desplegar correctamente `order-service` y dejarlo listo para el siguiente checkpoint.**

---

## Errores comunes en esta etapa

### 1. Tratar `order-service` como un despliegue igual de simple que los anteriores
Su complejidad ambiental suele ser mayor.

### 2. No pensar las referencias internas del ecosistema
Este servicio depende mucho más del contexto que otros.

### 3. Olvidar el namespace
Eso rompe la organización del bloque rápidamente.

### 4. No revisar logs con cuidado
Este es uno de los servicios donde más valor tienen.

### 5. Esperar cerrar todo el flujo del negocio en esta misma clase
Hoy estamos instalando bien la pieza; la validación fuerte viene después.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `order-service` debería estar desplegado en Kubernetes con su Deployment y su Service dentro del namespace `novamarket`.

Eso deja al proyecto muchísimo más cerca de reconstruir el flujo principal del negocio dentro del cluster.

---

## Punto de control

Antes de seguir, verificá que:

- existe el Deployment de `order-service`,
- existe el Service de `order-service`,
- el Pod arranca,
- los logs son razonables,
- y el servicio central del flujo principal ya vive dentro del cluster.

Si eso está bien, ya podemos pasar a validar el núcleo del flujo principal dentro del entorno Kubernetes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar `order-service` junto con la base funcional que ya desplegamos dentro del cluster.

Ese checkpoint va a ser muy importante antes de llevar más piezas del sistema y reconstruir el circuito completo.

---

## Cierre

En esta clase llevamos `order-service` a Kubernetes.

Con eso, NovaMarket dio uno de los pasos más fuertes de todo el bloque de orquestación y quedó mucho más cerca de poder reconstruir dentro del cluster el flujo principal del negocio que venimos trabajando desde el comienzo del curso.
