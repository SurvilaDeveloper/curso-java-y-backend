---
title: "Preparando Docker Compose para NovaMarket"
description: "Inicio del bloque de despliegue operativo del curso práctico. Preparación del archivo docker-compose.yml y definición de la estrategia para levantar NovaMarket como un entorno integrado."
order: 71
module: "Módulo 11 · Despliegue operativo con Docker Compose"
level: "intermedio"
draft: false
---

# Preparando Docker Compose para NovaMarket

Hasta este punto, NovaMarket ya tiene un ecosistema bastante amplio:

- `config-server`
- `discovery-server`
- `api-gateway`
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- Keycloak
- RabbitMQ
- Zipkin

Además, el sistema ya tiene:

- seguridad,
- resiliencia,
- observabilidad,
- mensajería,
- y varios flujos de negocio funcionando.

Pero hay una limitación operativa muy clara:

**para trabajar con todo el sistema, venimos levantando muchas piezas por separado.**

Eso estuvo perfecto para aprender y construir el proyecto paso a paso.  
Pero ya llegó el momento de dar otro salto:

**empezar a levantar NovaMarket como un entorno integrado.**

La herramienta que vamos a usar para eso es **Docker Compose**.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- preparado el archivo `docker-compose.yml`,
- definida una estrategia clara de servicios y dependencias,
- identificadas las piezas que van a entrar al entorno orquestado,
- y listo el terreno para contenedorizarlas y levantarlas como un stack coherente.

Todavía no vamos a levantar todo funcionando de punta a punta.  
Primero queremos diseñar bien el compose.

---

## Estado de partida

Partimos de un proyecto donde muchas piezas ya existen y ya fueron probadas, pero todavía suelen arrancarse por separado:

- algunas desde el IDE,
- otras desde contenedores manuales,
- otras con configuración local.

Eso tiene valor para desarrollo incremental, pero no es todavía una experiencia operativa unificada.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- definir qué piezas van a entrar al `docker-compose.yml`,
- decidir cómo organizarlas,
- pensar puertos, nombres de servicio y redes,
- y dejar una base clara para el despliegue local integrado de NovaMarket.

---

## Qué problema resuelve Docker Compose en este punto

Compose nos permite levantar varias piezas del sistema juntas con una sola definición declarativa.

Eso ayuda muchísimo porque:

- deja más clara la arquitectura completa,
- evita levantar manualmente tantas cosas una por una,
- y acerca el proyecto a una operación local mucho más realista.

En otras palabras:

**deja de sentirse como una suma de experimentos separados y empieza a sentirse como un sistema.**

---

## Qué piezas conviene incluir primero

Para esta primera etapa del bloque, conviene pensar en dos grupos:

### Infraestructura
- `rabbitmq`
- `zipkin`
- `keycloak`

### Servicios propios
- `config-server`
- `discovery-server`
- `api-gateway`
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`

No hace falta que todo quede perfecto en esta misma clase.  
Pero sí conviene definir con claridad qué rol cumple cada pieza dentro del compose.

---

## Paso 1 · Crear una carpeta o punto claro para Compose

Una opción razonable es dejar el archivo principal en la raíz del proyecto práctico:

```txt
novamarket/docker-compose.yml
```

Esto tiene bastante sentido porque el compose va a describir el entorno integrado general del proyecto y no el de un solo servicio.

---

## Paso 2 · Pensar la estructura general del archivo

A esta altura del curso, conviene que `docker-compose.yml` tenga una estructura clara y fácil de leer.

Una base conceptual razonable podría ser:

- servicios de infraestructura
- servicios propios del sistema
- red compartida
- volúmenes si hacen falta
- puertos expuestos

No hace falta todavía meter optimizaciones ni perfiles avanzados.  
La prioridad es claridad.

---

## Paso 3 · Elegir nombres de servicios consistentes

Conviene que los nombres de los servicios dentro de Compose se alineen con lo que ya venimos usando en el proyecto.

Por ejemplo:

- `rabbitmq`
- `zipkin`
- `keycloak`
- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- `api-gateway`

Esa consistencia ayuda mucho a leer la arquitectura y también a preparar futuras referencias entre contenedores.

---

## Paso 4 · Pensar la red compartida

Una práctica muy razonable es que todos los servicios del sistema corran dentro de una red de Docker compartida.

Por ejemplo, algo como:

```txt
novamarket-network
```

Esto deja una base muy buena para que los contenedores puedan encontrarse entre sí usando nombres de servicio en lugar de depender tanto de `localhost`.

Ese cambio de mentalidad es muy importante para este bloque.

---

## Paso 5 · Identificar dependencias de arranque

No todas las piezas tienen el mismo rol.

Por ejemplo:

- `config-server` conviene que esté arriba antes que varios servicios propios
- `discovery-server` también suele ser una dependencia operativa importante
- `rabbitmq`, `zipkin` y `keycloak` son infraestructura útil para varios componentes

No hace falta todavía resolver todos los matices de readiness perfecta, pero sí conviene empezar a pensar el orden lógico de dependencias.

---

## Paso 6 · Preparar una primera versión del compose

Una base conceptual mínima del archivo podría verse así:

```yaml
services:
  rabbitmq:
    image: rabbitmq:management
    ports:
      - "5672:5672"
      - "15672:15672"

  zipkin:
    image: openzipkin/zipkin
    ports:
      - "9411:9411"

  keycloak:
    image: quay.io/keycloak/keycloak
    ports:
      - "8084:8080"
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    command: start-dev

networks:
  default:
    name: novamarket-network
```

Esta versión todavía no incluye nuestros microservicios, pero ya deja una base muy clara del entorno de infraestructura.

---

## Paso 7 · Entender por qué arrancamos así

Podríamos intentar meter todo el sistema completo en un solo salto, pero pedagógicamente conviene ir por capas.

Primero queremos:

- el archivo bien planteado,
- la red bien definida,
- los servicios de infraestructura razonablemente claros.

Después, en la próxima clase, vamos a sumar los servicios propios del proyecto.

Ese orden ayuda bastante a no convertir el compose en algo confuso.

---

## Paso 8 · Pensar en configuración externa y nombres de host

Este bloque empieza a empujar una idea muy importante:

cuando los servicios corren en contenedores, muchas referencias dejan de ser `localhost` y pasan a ser el nombre del servicio dentro de la red Docker.

Por ejemplo, más adelante puede empezar a tener mucho sentido pensar cosas como:

- `rabbitmq` como host del broker
- `zipkin` como host del tracing backend
- `keycloak` como host del proveedor de identidad

Esta clase es una muy buena oportunidad para empezar a hacer ese cambio mental.

---

## Paso 9 · Decidir qué vamos a dejar para la próxima clase

Conviene ser explícitos con esto.

### Hoy dejamos preparado
- el archivo compose
- la estructura
- la red
- la infraestructura base

### Próxima clase
- sumar los microservicios propios
- pensar `build`, `Dockerfile` y puertos
- y empezar a levantar el sistema integrado

Este mapa ayuda mucho a que el bloque sea más claro.

---

## Qué estamos logrando con esta clase

Esta clase no pone todavía todo el sistema arriba con un solo comando, pero sí hace algo muy importante:

**convierte el despliegue integrado en un problema bien modelado.**

Después de esta clase, el stack ya no es solo una idea difusa.  
Empieza a estar declarado de una forma operativa y ordenada.

---

## Qué todavía no hicimos

Todavía no:

- contenedorizamos todos los microservicios
- levantamos todo NovaMarket con Compose
- ni verificamos el flujo completo sobre el entorno integrado

Todo eso viene a continuación.

La meta de hoy es mucho más concreta:

**preparar bien el terreno del despliegue integrado.**

---

## Errores comunes en esta etapa

### 1. Intentar meter todo en el compose sin orden
Conviene construirlo por capas.

### 2. Seguir pensando todo con `localhost`
Dentro de Docker eso suele cambiar bastante.

### 3. No definir una red clara
Eso complica mucho el siguiente paso.

### 4. Usar nombres de servicio inconsistentes
La consistencia ayuda mucho en compose.

### 5. Pensar que esta clase ya debería levantar todo
Todavía estamos diseñando bien la base.

---

## Resultado esperado al terminar la clase

Al terminar esta clase debería existir una primera base clara de `docker-compose.yml`, con la infraestructura principal del sistema modelada y una red compartida lista para el resto del stack.

Eso deja muy bien preparado el siguiente paso del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- ya existe `docker-compose.yml` en la raíz del proyecto,
- la red está definida,
- la infraestructura principal está modelada,
- y el archivo ya tiene una estructura clara para crecer.

Si eso está bien, ya podemos sumar los microservicios propios del proyecto.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a contenedizar y sumar al compose los servicios de NovaMarket.

Ese será el paso donde el stack empiece realmente a levantarse como una unidad integrada.

---

## Cierre

En esta clase preparamos Docker Compose para NovaMarket.

Con eso, el proyecto empieza a dejar atrás la etapa de levantar piezas completamente sueltas y da el primer paso hacia una operación local mucho más parecida a la de un sistema real.
