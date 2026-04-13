---
title: "Sumando los microservicios propios a Docker Compose"
description: "Continuación del bloque de despliegue operativo. Incorporación de los microservicios de NovaMarket al stack de Docker Compose junto con la infraestructura ya modelada."
order: 72
module: "Módulo 11 · Despliegue operativo con Docker Compose"
level: "intermedio"
draft: false
---

# Sumando los microservicios propios a Docker Compose

En la clase anterior preparamos la base del `docker-compose.yml` y dejamos modelada la infraestructura principal del entorno.

Ahora toca el siguiente paso importante:

**sumar los microservicios propios de NovaMarket al stack.**

Hasta ahora, el compose ya podía representar piezas como:

- RabbitMQ
- Zipkin
- Keycloak

Pero lo que realmente va a convertir a NovaMarket en un entorno integrado es que también entren ahí:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- `api-gateway`

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- definida la incorporación de los microservicios propios dentro de `docker-compose.yml`,
- preparada la estrategia de `build` o imagen para cada uno,
- alineadas las referencias internas con nombres de servicio de Docker,
- y listo el stack para levantar el sistema completo en la próxima clase.

Todavía no vamos a hacer la validación final del ecosistema.  
Primero queremos dejar bien compuesta la topología del stack.

---

## Estado de partida

Partimos de este contexto:

- ya existe una base de `docker-compose.yml`,
- la infraestructura externa principal ya fue modelada,
- y los microservicios del sistema ya existen y funcionan de manera individual.

Lo que todavía falta es integrarlos dentro del despliegue declarado del stack.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- pensar cómo contenedizar cada servicio,
- sumar bloques de servicio al compose,
- revisar puertos, `build` y dependencias,
- y ajustar mentalmente el proyecto para que sus servicios se hablen dentro de la red Docker.

---

## Qué problema estamos resolviendo

Hasta ahora, cada microservicio puede existir bien por separado.  
Pero para que el sistema se levante de forma unificada necesitamos dos cosas:

### 1. Contenedores o builds claros
Cada servicio debe tener una forma concreta de entrar al stack.

### 2. Comunicación coherente dentro de Docker
Los servicios ya no deberían pensar solo en `localhost`, sino también en nombres de host internos como:

- `config-server`
- `discovery-server`
- `rabbitmq`
- `zipkin`

Esta clase empieza a resolver justamente eso.

---

## Paso 1 · Confirmar que cada microservicio tenga su `Dockerfile`

Antes de sumar servicios al compose, conviene verificar que cada uno pueda construirse como contenedor.

Para esta etapa, lo ideal es que ya tengan o empiecen a tener un `Dockerfile` claro, al menos para:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- `api-gateway`

No hace falta que todos tengan una optimización súper avanzada.  
Alcanza con que puedan empaquetarse y arrancar de forma razonable.

---

## Paso 2 · Elegir una estrategia de build consistente

Una forma razonable para esta etapa del curso es usar `build` desde el contexto de cada servicio.

Conceptualmente, el compose puede empezar a verse así:

```yaml
services:
  config-server:
    build: ./services/config-server

  discovery-server:
    build: ./services/discovery-server

  catalog-service:
    build: ./services/catalog-service

  inventory-service:
    build: ./services/inventory-service

  order-service:
    build: ./services/order-service

  notification-service:
    build: ./services/notification-service

  api-gateway:
    build: ./services/api-gateway
```

Esto deja el stack bastante claro y alineado con el monorepo.

---

## Paso 3 · Exponer puertos razonables

Aunque dentro de la red Docker los servicios puedan hablarse por nombre, para desarrollo sigue siendo útil exponer ciertos puertos hacia el host.

Una estrategia razonable es mantener los puertos que veníamos usando, por ejemplo:

- `8888` para `config-server`
- `8761` para `discovery-server`
- `8081` catálogo
- `8082` inventario
- `8083` órdenes
- `8085` notificaciones
- `8080` gateway

No hace falta exponer absolutamente todo si no aporta valor, pero para esta etapa del curso ayuda bastante a validar el entorno.

---

## Paso 4 · Pensar `depends_on` con criterio

Compose permite declarar dependencias de arranque.

Por ejemplo, conceptualmente puede tener sentido que:

- varios servicios dependan de `config-server`
- el gateway y algunos servicios dependan de `discovery-server`
- `order-service` y `notification-service` dependan de `rabbitmq`
- los servicios que exportan trazas dependan de `zipkin`

Esto no resuelve mágicamente toda la sincronización fina del arranque, pero ayuda bastante a expresar la topología general.

---

## Paso 5 · Revisar nombres internos para referencias de infraestructura

Este paso es muy importante.

Dentro del stack, referencias como estas empiezan a tener más sentido que `localhost`:

- `rabbitmq`
- `zipkin`
- `keycloak`
- `config-server`
- `discovery-server`

Eso significa que varias configuraciones del sistema ya deberían empezar a pensarse para ese entorno de red interna.

Por ejemplo, dentro del compose y del entorno integrado, puede empezar a ser más razonable que el host del broker sea `rabbitmq` y no `localhost`.

Lo mismo con Zipkin o con Config Server.

---

## Paso 6 · Pensar si usar variables de entorno o configuración remota adaptada

A esta altura del curso práctico hay dos estrategias razonables:

### Opción 1
Ajustar la configuración remota para el entorno Docker.

### Opción 2
Inyectar variables de entorno desde Compose para ciertos hosts críticos.

No hace falta cerrar ahora mismo el diseño perfecto de entornos múltiples, pero sí conviene ser consciente de que el stack integrado necesita referencias coherentes con el mundo Docker.

---

## Paso 7 · Completar una versión más rica del compose

Conceptualmente, el archivo ya podría moverse hacia una forma más parecida a esta:

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

  config-server:
    build: ./services/config-server
    ports:
      - "8888:8888"

  discovery-server:
    build: ./services/discovery-server
    ports:
      - "8761:8761"
    depends_on:
      - config-server

  catalog-service:
    build: ./services/catalog-service
    ports:
      - "8081:8081"
    depends_on:
      - config-server
      - discovery-server

  inventory-service:
    build: ./services/inventory-service
    ports:
      - "8082:8082"
    depends_on:
      - config-server
      - discovery-server

  order-service:
    build: ./services/order-service
    ports:
      - "8083:8083"
    depends_on:
      - config-server
      - discovery-server
      - rabbitmq

  notification-service:
    build: ./services/notification-service
    ports:
      - "8085:8085"
    depends_on:
      - config-server
      - discovery-server
      - rabbitmq

  api-gateway:
    build: ./services/api-gateway
    ports:
      - "8080:8080"
    depends_on:
      - config-server
      - discovery-server

networks:
  default:
    name: novamarket-network
```

No hace falta que esta sea la versión final perfecta.  
Lo importante es que la estructura general del stack ya quede clara.

---

## Paso 8 · Entender qué todavía puede requerir ajustes

Aunque el compose ya quede bastante completo, todavía pueden quedar detalles operativos por revisar, como:

- readiness real de ciertos servicios
- tiempos de arranque
- referencias de host entre contenedores
- y configuración de perfiles o entornos

Eso es completamente normal.

Esta clase no busca resolver todos los bordes finos del mundo real, sino dejar el stack suficientemente integrado como para que pueda levantarse y probarse en conjunto.

---

## Qué estamos logrando con esta clase

Esta clase convierte a NovaMarket en algo mucho más cercano a un sistema integrado desplegable localmente.

Ya no estamos modelando solo infraestructura externa.  
Ahora también estamos incorporando los microservicios propios al stack declarado.

Eso es un paso enorme.

---

## Qué todavía no hicimos

Todavía no:

- levantamos y validamos todo el entorno de punta a punta,
- comprobamos que los servicios realmente se vean entre sí dentro del stack,
- ni recorrimos el flujo completo sobre Compose.

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**dejar declarados e incorporados los microservicios dentro del stack.**

---

## Errores comunes en esta etapa

### 1. No tener `Dockerfile` claro para algún servicio
Eso frena el compose enseguida.

### 2. Seguir usando hosts tipo `localhost` dentro de un stack Docker
Suele ser uno de los principales puntos de confusión.

### 3. Exponer puertos sin criterio o con conflictos
Conviene sostener una convención clara.

### 4. Pensar que `depends_on` resuelve toda la readiness
Ayuda, pero no es la solución completa.

### 5. Querer perfeccionar todo antes de tener el stack armado
Primero conviene integrar, después afinar.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `docker-compose.yml` debería incluir ya tanto la infraestructura externa como los microservicios propios de NovaMarket, dejando el sistema listo para ser levantado como stack integrado.

Eso abre el camino para la validación fuerte del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- los microservicios ya están declarados en el compose,
- la red sigue clara,
- los puertos están definidos,
- `depends_on` expresa una topología razonable,
- y el archivo ya representa al sistema completo.

Si eso está bien, ya podemos pasar a levantar todo y probar el entorno completo.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a levantar NovaMarket completo con Docker Compose y validar el sistema integrado.

Ese será el cierre fuerte del primer tramo de despliegue operativo del curso práctico.

---

## Cierre

En esta clase sumamos los microservicios propios a Docker Compose.

Con eso, NovaMarket deja de estar modelado solo como piezas sueltas y empieza a existir como un stack operativo completo, listo para ser levantado y validado como sistema integrado.
