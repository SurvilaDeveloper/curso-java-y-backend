---
title: "Entendiendo el salto de Docker Compose a Kubernetes"
description: "Inicio del bloque de orquestación del curso práctico. Preparación conceptual y operativa para llevar NovaMarket desde Docker Compose hacia Kubernetes."
order: 80
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Entendiendo el salto de Docker Compose a Kubernetes

Hasta este punto, NovaMarket ya logró algo muy importante:

- puede levantarse como un stack integrado,
- tiene infraestructura y microservicios corriendo juntos,
- y además ya pasó por un refinamiento razonable de Dockerfile, imágenes y Docker Compose.

Eso deja al proyecto bastante bien parado para operación local.

Pero ahora aparece una pregunta muy natural:

**¿qué hacemos cuando Docker Compose ya no alcanza como modelo mental principal del despliegue?**

No porque Compose deje de servir, sino porque hay otro nivel de orquestación que conviene empezar a trabajar:

**Kubernetes**

Este módulo no arranca intentando “meter todo el sistema en Kubernetes” de golpe.  
Primero vamos a hacer algo mucho más importante:

**entender bien qué cambia cuando damos ese salto.**

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué NovaMarket ya está listo para empezar a pensar en Kubernetes,
- entendido qué cambia respecto de Docker Compose,
- definida una estrategia gradual de migración del entorno,
- y preparado el terreno para empezar a escribir manifests reales en las próximas clases.

Todavía no vamos a desplegar el stack completo.  
La meta de hoy es alinear el modelo mental del curso con el siguiente gran bloque.

---

## Estado de partida

Partimos de una arquitectura donde ya existen y funcionan piezas como:

- `config-server`
- `discovery-server`
- `api-gateway`
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- RabbitMQ
- Zipkin
- Keycloak

Además:

- el sistema ya corre con Docker Compose,
- los servicios ya tienen imágenes razonables,
- y el entorno local ya es bastante serio.

Eso significa que el proyecto ya tiene una base excelente para dar el siguiente paso.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- comparar Compose con Kubernetes desde el punto de vista de NovaMarket,
- identificar qué piezas del sistema conviene llevar primero,
- pensar la estructura de manifests que vamos a usar,
- y definir una estrategia progresiva para no romper la coherencia del curso.

---

## Por qué NovaMarket ya está listo para Kubernetes

Este punto es importante.

No conviene llevar un proyecto a Kubernetes demasiado pronto si todavía ni siquiera tiene:

- servicios bien identificados,
- puertos claros,
- imágenes consistentes,
- configuración relativamente ordenada,
- o una idea razonable de dependencias.

NovaMarket ya tiene todo eso.

Eso no significa que el salto sea trivial.  
Pero sí significa que **ya tiene sentido hacerlo**.

---

## Qué problema resuelve Kubernetes en este momento del curso

Docker Compose nos ayudó muchísimo a:

- levantar el entorno integrado,
- visualizar el stack,
- y operar localmente con varias piezas.

Kubernetes empieza a aportar otra clase de valor:

- orquestación más explícita,
- recursos declarativos más ricos,
- separación más clara entre despliegue y runtime,
- y una forma mucho más extensible de pensar la operación del sistema.

En otras palabras:

**Compose nos ayudó a integrar. Kubernetes nos va a ayudar a orquestar mejor.**

---

## Qué cambia mentalmente al pasar de Compose a Kubernetes

Este es uno de los puntos más importantes de la clase.

Con Compose solemos pensar bastante en:

- un archivo central
- servicios
- puertos
- depends_on
- red

Con Kubernetes vamos a empezar a pensar mucho más en:

- Pods
- Deployments
- Services
- ConfigMaps
- Secrets
- Namespaces

No hace falta entender todo eso hoy en profundidad.  
Lo importante es empezar a aceptar que el lenguaje operativo del sistema va a cambiar.

---

## Qué conviene migrar primero

No todo tiene el mismo nivel de dificultad ni de prioridad.

Para este curso práctico, una estrategia gradual bastante razonable es esta:

### Primero
- crear la estructura base del entorno Kubernetes
- definir namespace
- ordenar manifests

### Después
- llevar infraestructura y servicios propios por capas
- empezando por piezas bien comprendidas como `config-server` y `discovery-server`

### Más adelante
- llevar servicios de negocio
- gateway
- y eventualmente otras piezas de soporte

Este orden es muy valioso porque evita que el bloque se vuelva caótico.

---

## Qué no conviene hacer en esta etapa

No conviene intentar hoy cosas como:

- meter todas las piezas del sistema en manifests gigantes
- resolver en una sola clase todo lo relativo a secrets, persistence, ingress y readiness avanzada
- o abandonar Compose por completo de golpe

La idea del curso no es hacer una migración brutal, sino una transición entendible y sostenible.

---

## Paso 1 · Pensar Kubernetes como un nuevo entorno, no solo como otro archivo

Uno de los errores más comunes es pensar Kubernetes como “Docker Compose más complicado”.

Eso no ayuda demasiado.

Para este bloque conviene pensar algo más útil:

**Kubernetes es otra forma de describir y operar el sistema.**

Eso significa que varios conceptos van a cambiar de nivel, de granularidad y de intención.

---

## Paso 2 · Definir una carpeta para manifests

Antes de escribir recursos, conviene ordenar el proyecto.

Una opción razonable es crear una carpeta como:

```txt
novamarket/k8s/
```

Y adentro empezar a pensar una estructura base del estilo:

```txt
k8s/
  base/
  infrastructure/
  services/
```

No hace falta todavía llenarla por completo.  
La idea es que desde el inicio el bloque tenga orden.

---

## Paso 3 · Pensar cómo vamos a organizar los recursos

Una organización razonable para este curso podría ser:

### `k8s/base/`
Recursos muy básicos del entorno, como namespace.

### `k8s/infrastructure/`
Piezas como RabbitMQ, Zipkin o Keycloak, si decidimos llevarlas más adelante.

### `k8s/services/`
Manifests de los microservicios de NovaMarket.

Este tipo de separación ayuda muchísimo cuando el proyecto empieza a crecer.

---

## Paso 4 · Decidir una estrategia de avance gradual

Para este bloque del curso práctico, una secuencia razonable puede ser:

1. crear estructura y namespace  
2. llevar `config-server` a Kubernetes  
3. llevar `discovery-server`  
4. después servicios del negocio  
5. y más adelante gateway y otras piezas  

Este orden tiene bastante sentido porque `config-server` y `discovery-server` son piezas fundacionales del ecosistema actual.

---

## Paso 5 · Revisar qué conocimientos previos del curso nos ayudan ahora

A esta altura del proyecto, Kubernetes ya no cae en el vacío.  
Lo que construimos antes ayuda muchísimo:

- Dockerfile refinados
- imágenes razonables
- puertos claros
- Actuator y health endpoints
- configuración más coherente
- stack integrado entendido como sistema

Todo eso hace que el bloque de Kubernetes tenga mucho más sentido que si apareciera desde cero.

---

## Paso 6 · Aceptar que Compose y Kubernetes pueden convivir durante un tiempo

Este punto es muy importante.

Durante este tramo del curso no hace falta pensar en una sustitución inmediata y total.

Compose puede seguir siendo útil para:

- ciertas pruebas locales rápidas,
- infraestructura temporal,
- o comparación entre enfoques

Mientras que Kubernetes va a empezar a cubrir:

- orquestación por recursos
- y despliegue más estructurado

Esa convivencia es completamente razonable.

---

## Qué estamos logrando con esta clase

Esta clase no crea todavía un Deployment ni levanta Pods, pero hace algo fundamental:

**prepara correctamente la transición mental y estructural del curso hacia Kubernetes.**

Eso importa muchísimo, porque si el cambio se hace sin ese alineamiento, el bloque se vuelve muy confuso muy rápido.

---

## Qué todavía no hicimos

Todavía no:

- creamos namespace
- escribimos Deployments
- escribimos Services de Kubernetes
- ni desplegamos servicios del stack

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender bien el salto y preparar el terreno.**

---

## Errores comunes en esta etapa

### 1. Pensar Kubernetes solo como “otro Compose”
Eso suele complicar más de lo que ayuda.

### 2. Querer mover todo el sistema de golpe
Conviene hacerlo por capas.

### 3. No ordenar una carpeta de manifests desde el principio
Después cuesta mucho mantener el bloque limpio.

### 4. Creer que Compose deja de servir inmediatamente
Durante un tiempo ambos enfoques pueden convivir.

### 5. Empezar a escribir recursos sin una estrategia de migración
El bloque se vuelve caótico enseguida.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para comenzar el bloque de Kubernetes, qué diferencias hay respecto de Compose y cuál va a ser la estrategia gradual del curso para avanzar.

Eso deja muy bien preparada la próxima clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés por qué el proyecto ya puede entrar a Kubernetes,
- ya definiste una carpeta `k8s/`,
- tenés una idea de organización por recursos,
- y entendés que la migración del stack va a ser gradual.

Si eso está bien, ya podemos empezar a escribir los primeros manifests base del entorno.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a crear el namespace y la estructura inicial de manifests de Kubernetes para NovaMarket.

Ese será el primer paso concreto del bloque de orquestación.

---

## Cierre

En esta clase entendimos el salto de Docker Compose a Kubernetes para NovaMarket.

Con eso, el curso queda perfectamente alineado para entrar a la siguiente etapa de despliegue con una base mucho más madura, sin perder la coherencia que venimos construyendo desde el principio del proyecto.
