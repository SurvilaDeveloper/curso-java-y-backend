---
title: "Llevando config-server a Kubernetes"
description: "Primer despliegue real de NovaMarket en Kubernetes. Creación de Deployment y Service para config-server dentro del namespace del proyecto."
order: 82
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Llevando `config-server` a Kubernetes

En la clase anterior dimos el primer paso concreto dentro del bloque de Kubernetes:

- creamos la carpeta `k8s/`,
- ordenamos la estructura de manifests,
- y aplicamos el namespace `novamarket`.

Ahora toca el siguiente paso lógico y muy importante:

**desplegar el primer microservicio real del sistema dentro de Kubernetes.**

La pieza ideal para empezar es:

**`config-server`**

¿Por qué?

Porque ya conocemos bien su rol, es una pieza fundacional del ecosistema y además nos sirve muchísimo como base para los siguientes servicios.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un Deployment para `config-server`,
- creado un Service para exponerlo dentro del cluster,
- aplicado todo dentro del namespace `novamarket`,
- y validado que el primer microservicio de NovaMarket ya vive en Kubernetes.

Todavía no vamos a mover todo el sistema.  
La meta de hoy es hacer bien el primer despliegue real.

---

## Estado de partida

Partimos de este contexto:

- el namespace `novamarket` ya existe,
- el proyecto ya tiene una carpeta `k8s/` ordenada,
- `config-server` ya tiene imagen o una estrategia de empaquetado razonable,
- y además ya conocemos muy bien su rol dentro del sistema.

Eso lo vuelve el mejor candidato para inaugurar el bloque de despliegue real.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear los manifests de `config-server`,
- definir Deployment y Service,
- aplicarlos en el namespace del proyecto,
- y verificar que el servicio quede operativo dentro del cluster.

---

## Por qué conviene empezar por `config-server`

Porque muchos otros servicios ya dependen de él en la arquitectura actual.

Además:

- tiene un rol bien acotado,
- no es el más complejo del negocio,
- y su despliegue nos obliga a empezar a pensar varios conceptos centrales de Kubernetes sin meter todavía demasiadas piezas a la vez.

Es un primer paso muy equilibrado.

---

## Paso 1 · Crear una carpeta específica para el servicio

Dentro de `k8s/services/`, una organización razonable podría ser:

```txt
k8s/services/config-server/
```

Esto ayuda a mantener cada servicio con sus propios manifests bien agrupados.

---

## Paso 2 · Crear el Deployment de `config-server`

Ahora creá algo como:

```txt
k8s/services/config-server/deployment.yaml
```

Una base razonable podría verse así:

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

No hace falta que el tag o nombre de imagen sean exactamente esos si tu estrategia actual usa otros.  
Lo importante es que el Deployment ya exprese claramente:

- qué imagen corre
- y en qué puerto escucha el contenedor

---

## Paso 3 · Pensar la imagen que va a usar el Deployment

Este punto es importante.

El Deployment necesita una imagen que Kubernetes pueda usar.

Para esta etapa del curso práctico, hay varias estrategias posibles según tu entorno:

- usar una imagen local construida previamente
- usar una imagen cargada en el runtime local del cluster
- o una imagen publicada en un registry si ya decidiste trabajar así

No hace falta hoy resolver toda la estrategia global de registry.  
Alcanza con que `config-server` tenga una imagen usable en tu entorno actual.

---

## Paso 4 · Crear el Service de `config-server`

Ahora necesitamos exponer el Deployment dentro del cluster.

Creá algo como:

```txt
k8s/services/config-server/service.yaml
```

Una versión razonable podría verse así:

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
  type: ClusterIP
```

Este Service es muy importante porque empieza a darle al sistema un punto estable de acceso interno dentro del cluster.

---

## Por qué `ClusterIP` tiene sentido acá

Para esta etapa del bloque, `config-server` no necesita necesariamente exponerse de forma pública al exterior del cluster.

Lo importante es que:

- otros servicios lo puedan resolver internamente
- y el nombre `config-server` tenga sentido como punto de acceso estable dentro del namespace

Eso hace que `ClusterIP` sea una opción muy razonable para empezar.

---

## Paso 5 · Aplicar los manifests

Ahora aplicá ambos recursos:

- el Deployment
- y el Service

La idea es que `config-server` ya exista como pieza real dentro del namespace `novamarket`.

Este es un momento muy importante porque inaugura el primer despliegue real del bloque.

---

## Paso 6 · Verificar Pods y Service

Después de aplicar los recursos, conviene revisar:

- que el Pod exista
- que el Deployment haya creado correctamente la réplica
- y que el Service también esté presente

No hace falta todavía entrar a troubleshooting avanzado.  
La idea es confirmar que el recurso se materializó dentro del cluster.

---

## Paso 7 · Revisar logs del Pod

Ahora mirá los logs de `config-server`.

Queremos comprobar que:

- la aplicación arranca correctamente,
- el contenedor no cae inmediatamente,
- y el servicio realmente está vivo dentro del entorno Kubernetes.

Este paso es muy valioso porque el Deployment puede existir, pero lo importante es que la app también esté sana.

---

## Paso 8 · Pensar el acceso interno al servicio

A partir de esta clase, el nombre:

```txt
config-server
```

dentro del namespace ya empieza a importar mucho más.

Ese nombre deja de ser solo una idea heredada de Compose y pasa a convertirse en un punto real de acceso interno en Kubernetes.

Eso es un cambio importante y vale la pena notarlo.

---

## Paso 9 · Probar el endpoint de health si está disponible

Si `config-server` ya expone Actuator, este es un gran momento para validar algo como:

- su endpoint de health
- o algún endpoint funcional básico del servidor de configuración

La forma exacta de acceso depende del entorno local de tu cluster y de cómo estés haciendo las pruebas, pero conceptualmente lo importante es confirmar que el servicio no solo existe como recurso, sino que también responde.

---

## Paso 10 · Pensar qué ganamos con este primer despliegue

Después de esta clase, NovaMarket ya tiene algo muy valioso:

**su primer microservicio real desplegado en Kubernetes.**

Eso significa que el bloque dejó de ser puramente preparatorio y pasó a tener un impacto concreto sobre el sistema.

Además, nos deja listo el siguiente paso lógico:

desplegar la siguiente pieza fundacional del ecosistema.

---

## Qué estamos logrando con esta clase

Esta clase inaugura el tramo realmente operativo del bloque de Kubernetes.

Ya no estamos solo organizando carpetas ni hablando de conceptos.  
Ahora el proyecto tiene un Deployment y un Service reales dentro del cluster.

Eso es un hito importante.

---

## Qué todavía no hicimos

Todavía no:

- desplegamos `discovery-server`
- conectamos varios servicios dentro del cluster
- ni migramos el flujo principal completo

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**hacer bien el primer despliegue real de un servicio fundacional.**

---

## Errores comunes en esta etapa

### 1. Apuntar el Deployment a una imagen inexistente o no accesible
Es uno de los errores más comunes al empezar.

### 2. Olvidar el namespace en los manifests
Eso hace que los recursos aparezcan fuera del espacio esperado.

### 3. No alinear labels del Deployment con el selector del Service
Entonces el Service existe, pero no enruta a ningún Pod.

### 4. Aplicar el recurso y no mirar logs
Eso deja demasiadas cosas sin validar.

### 5. Querer hacer networking externo perfecto en esta misma clase
Para esta etapa, lo importante es primero el acceso interno y la vida básica del servicio.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `config-server` debería estar desplegado dentro de Kubernetes con un Deployment y un Service propios en el namespace `novamarket`.

Eso deja al proyecto perfectamente preparado para seguir llevando el ecosistema al cluster.

---

## Punto de control

Antes de seguir, verificá que:

- existe el Deployment de `config-server`,
- existe el Service de `config-server`,
- el Pod arranca,
- los logs son razonables,
- y el primer servicio real de NovaMarket ya vive dentro del cluster.

Si eso está bien, ya podemos pasar a desplegar la siguiente pieza base del ecosistema.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a llevar `discovery-server` a Kubernetes.

Ese será el segundo pilar del entorno y nos va a permitir empezar a reconstruir dentro del cluster la base del ecosistema que ya veníamos usando en Compose.

---

## Cierre

En esta clase llevamos `config-server` a Kubernetes.

Con eso, NovaMarket dio su primer paso real dentro del nuevo entorno de orquestación, dejando atrás la fase puramente preparatoria y empezando a desplegar servicios concretos del sistema dentro del cluster.
