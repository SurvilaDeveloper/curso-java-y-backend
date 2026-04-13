---
title: "Llevando discovery-server a Kubernetes"
description: "Segundo despliegue real del bloque de Kubernetes. Creación de Deployment y Service para discovery-server dentro del namespace de NovaMarket."
order: 83
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Llevando `discovery-server` a Kubernetes

En la clase anterior dimos el primer paso real del bloque de Kubernetes:

- creamos el namespace `novamarket`,
- ordenamos la estructura base de manifests,
- y desplegamos `config-server` dentro del cluster.

Eso ya es un avance muy importante.

Ahora toca llevar la segunda pieza fundacional del ecosistema:

**`discovery-server`**

Si `config-server` resuelve la configuración centralizada del sistema, `discovery-server` resuelve otra necesidad clave:  
**que los servicios puedan registrarse y descubrirse dentro del entorno.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un Deployment para `discovery-server`,
- creado un Service para exponerlo dentro del cluster,
- definido su vínculo básico con `config-server`,
- y desplegada la segunda pieza base del ecosistema de NovaMarket dentro de Kubernetes.

Todavía no vamos a llevar todos los microservicios.  
La meta de hoy es seguir reconstruyendo dentro del cluster el núcleo fundacional del sistema.

---

## Estado de partida

Partimos de este contexto:

- el namespace `novamarket` ya existe,
- `config-server` ya fue desplegado,
- la carpeta `k8s/` ya tiene una estructura base razonable,
- y `discovery-server` ya existe como servicio conocido dentro de la arquitectura actual del proyecto.

Eso deja el terreno listo para mover la siguiente pieza crítica.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear los manifests de `discovery-server`,
- definir Deployment y Service,
- pensar la relación operativa con `config-server`,
- aplicar los recursos al cluster,
- y validar que el segundo pilar del ecosistema ya vive en Kubernetes.

---

## Por qué conviene llevar `discovery-server` ahora

Porque, a esta altura del sistema, `discovery-server` es una pieza que organiza muchísimo el resto del ecosistema.

Además:

- ya conocemos bien su comportamiento,
- depende bastante naturalmente de `config-server`,
- y nos sirve como base para empezar a reconstruir dentro del cluster el modelo de service discovery que ya usábamos fuera de él.

En otras palabras:

**es el siguiente paso lógico después de `config-server`.**

---

## Paso 1 · Crear una carpeta específica para el servicio

Dentro de `k8s/services/`, una organización razonable sería:

```txt
k8s/services/discovery-server/
```

Así mantenemos el mismo criterio que empezamos a usar con `config-server`.

---

## Paso 2 · Crear el Deployment de `discovery-server`

Ahora creá algo como:

```txt
k8s/services/discovery-server/deployment.yaml
```

Una base razonable podría verse así:

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

Esto ya deja expresado lo básico:

- qué imagen corre
- y en qué puerto expone el contenedor

---

## Paso 3 · Pensar la configuración que necesita dentro del cluster

Este punto es muy importante.

Igual que pasó con `config-server`, `discovery-server` no vive aislado.  
Para arrancar bien dentro de Kubernetes, conviene pensar qué referencias del entorno necesita.

En particular, si `discovery-server` obtiene configuración centralizada, ya empieza a tener sentido que su referencia a Config Server apunte al nombre del Service interno del cluster, no a un host heredado de Compose o del entorno local manual.

Ese cambio es uno de los grandes aprendizajes del bloque.

---

## Paso 4 · Crear el Service de `discovery-server`

Ahora creá algo como:

```txt
k8s/services/discovery-server/service.yaml
```

Una versión razonable podría verse así:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: discovery-server
  namespace: novamarket
spec:
  selector:
    app: discovery-server
  ports:
    - port: 8761
      targetPort: 8761
  type: ClusterIP
```

Con esto, `discovery-server` ya empieza a tener un punto estable de acceso interno dentro del cluster.

---

## Por qué `ClusterIP` vuelve a tener sentido acá

Igual que con `config-server`, en esta etapa no hace falta exponer `discovery-server` hacia afuera del cluster como una pieza pública.

Lo importante es que:

- otros servicios puedan hablarle internamente,
- y el nombre `discovery-server` funcione como dirección estable dentro del namespace.

Eso hace que `ClusterIP` siga siendo una decisión muy razonable.

---

## Paso 5 · Pensar si necesita variables de entorno o configuración complementaria

Dependiendo de cómo esté resuelto hoy el servicio, puede tener sentido complementar el Deployment con variables de entorno para cosas como:

- URL de Config Server
- perfil activo
- otras referencias críticas del entorno

No hace falta que esta clase cierre todavía la estrategia definitiva de ConfigMap y Secret para todos los servicios.  
Pero sí conviene empezar a notar que los Deployments reales pronto van a necesitar algo más que solo imagen y puerto.

---

## Paso 6 · Aplicar los manifests

Ahora aplicá:

- el Deployment
- y el Service de `discovery-server`

Todo dentro del namespace `novamarket`.

Este es un momento importante porque ya estamos desplegando la segunda gran pieza fundacional del bloque.

---

## Paso 7 · Verificar Pods y Service

Después de aplicar los recursos, conviene revisar:

- que el Pod exista
- que el Deployment haya creado la réplica
- y que el Service también esté presente

La idea es confirmar que Kubernetes ya materializó esta segunda pieza base del sistema.

---

## Paso 8 · Mirar logs del Pod

Ahora revisá los logs de `discovery-server`.

Queremos comprobar que:

- la aplicación realmente arranca,
- no queda en crash loop inmediato,
- y la relación con `config-server` no está rota de una forma obvia.

Este punto es muy importante porque el manifiesto puede verse bien, pero el verdadero valor está en que el servicio viva correctamente dentro del cluster.

---

## Paso 9 · Pensar la relación entre `config-server` y `discovery-server` dentro de Kubernetes

A esta altura del bloque, ya conviene fijar una idea muy importante:

el cluster empieza a reconstruir el núcleo base del ecosistema que antes veníamos levantando con Compose.

Eso significa que ahora ya existen dentro de Kubernetes dos nombres importantes:

- `config-server`
- `discovery-server`

Y esos nombres dejan de ser solo convención del proyecto.  
Empiezan a convertirse en puntos reales de acceso entre servicios.

Ese cambio vale muchísimo.

---

## Paso 10 · Validar que Eureka esté arriba si la app ya expone su UI

Si el servicio quedó correctamente desplegado y responde, este es un buen momento para pensar cómo vas a verificarlo:

- por logs
- por health si ya está disponible
- o por acceso controlado a la UI de Eureka si tu entorno local lo permite

No hace falta que el acceso externo quede perfecto en esta misma clase.  
La prioridad sigue siendo que el servicio exista y esté sano dentro del cluster.

---

## Qué estamos logrando con esta clase

Esta clase reconstruye el segundo gran pilar del ecosistema de NovaMarket dentro de Kubernetes.

Antes teníamos solo `config-server`.  
Ahora ya empezamos a tener la pareja base que sostiene una parte enorme del resto del sistema:

- configuración centralizada
- más discovery

Eso hace que el bloque gane muchísima tracción.

---

## Qué todavía no hicimos

Todavía no:

- desplegamos servicios de negocio
- registramos servicios dentro de Eureka en el cluster
- ni reconstruimos el flujo principal completo dentro de Kubernetes

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**dejar arriba la segunda pieza fundacional del entorno.**

---

## Errores comunes en esta etapa

### 1. Desplegar `discovery-server` sin revisar su relación con `config-server`
Es uno de los primeros puntos críticos.

### 2. Olvidar el namespace
Eso desordena el bloque enseguida.

### 3. No alinear labels y selector del Service
Entonces el Service existe, pero no enruta correctamente.

### 4. Mirar solo que el recurso existe y no revisar logs
El Deployment puede estar creado, pero la app no necesariamente sana.

### 5. Querer resolver acceso externo perfecto desde esta clase
Por ahora nos importa sobre todo la vida interna del servicio dentro del cluster.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `discovery-server` debería estar desplegado en Kubernetes con su Deployment y su Service dentro del namespace `novamarket`.

Eso deja al proyecto muy bien preparado para empezar a desplegar servicios que dependan de este núcleo base.

---

## Punto de control

Antes de seguir, verificá que:

- existe el Deployment de `discovery-server`,
- existe el Service de `discovery-server`,
- el Pod arranca,
- los logs son razonables,
- y el núcleo base del ecosistema ya tiene dos piezas reales dentro del cluster.

Si eso está bien, ya podemos pasar al primer servicio de negocio.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a llevar `catalog-service` a Kubernetes.

Ese será el primer servicio de negocio del proyecto desplegado dentro del cluster y nos va a permitir empezar a reconstruir no solo la base del ecosistema, sino también parte del flujo funcional del sistema.

---

## Cierre

En esta clase llevamos `discovery-server` a Kubernetes.

Con eso, NovaMarket ya tiene dentro del cluster sus dos piezas fundacionales principales y el bloque de orquestación empieza a sentirse mucho más real y mucho más conectado con la arquitectura que venimos construyendo desde el comienzo del curso.
