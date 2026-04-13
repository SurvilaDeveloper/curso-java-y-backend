---
title: "Creando notification-service con Spring Initializr"
description: "Continuación del bloque de mensajería asincrónica en NovaMarket. Creación de notification-service como servicio dedicado a reaccionar a eventos del negocio."
order: 57
module: "Módulo 10 · Mensajería asincrónica con RabbitMQ"
level: "intermedio"
draft: false
---

# Creando `notification-service` con Spring Initializr

En la clase anterior levantamos **RabbitMQ** y dejamos listo el broker de mensajería del proyecto.

Ahora toca sumar una pieza muy importante para que ese bloque tenga sentido desde el punto de vista del negocio:

**`notification-service`**

Hasta ahora, NovaMarket ya tiene:

- catálogo,
- inventario,
- órdenes,
- y varias piezas de infraestructura.

Pero todavía no tiene un servicio específico pensado para reaccionar a eventos asincrónicos del sistema.

Ese va a ser el rol de `notification-service`.

No lo vamos a usar todavía para algo sofisticado como envío real de emails o SMS.  
Primero queremos que exista como módulo concreto del proyecto, bien creado, bien ubicado y listo para consumir mensajes.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado `notification-service`,
- ubicado dentro del monorepo,
- con configuración mínima alineada al resto del sistema,
- y arrancando correctamente como nuevo microservicio de NovaMarket.

Todavía no va a consumir mensajes de RabbitMQ.  
Primero queremos dejar el servicio base listo.

---

## Estado de partida

Partimos de un monorepo que ya debería tener una forma parecida a esta:

```txt
novamarket/
  services/
    catalog-service/
    inventory-service/
    order-service/
    config-server/
    discovery-server/
    api-gateway/
  infrastructure/
    keycloak/
    rabbitmq/
    zipkin/
  config-repo/
```

Además:

- RabbitMQ ya está arriba,
- y ya decidimos que NovaMarket va a empezar a trabajar eventos asincrónicos.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- generar `notification-service` con Spring Initializr,
- ubicarlo dentro de `services/`,
- agregar dependencias básicas,
- alinearlo con Config Server y Eureka,
- y verificar su arranque.

---

## Qué responsabilidad va a tener este servicio

En el diseño base de NovaMarket, `notification-service` es una pieza ideal para encargarse de reacciones asincrónicas del sistema.

Por ejemplo, más adelante podría:

- registrar una notificación de orden creada,
- simular un email,
- simular un aviso interno,
- o actuar como consumidor de eventos del negocio.

La idea importante es esta:

**no queremos que el flujo principal de creación de órdenes tenga que hacer todo directamente dentro del request.**

Al separar esta responsabilidad en otro servicio, ganamos desacoplamiento y claridad.

---

## Paso 1 · Abrir Spring Initializr

Vamos a repetir el patrón que usamos para otros servicios, pero ahora para uno que nace explícitamente con una vocación asincrónica.

---

## Paso 2 · Configuración recomendada en Initializr

Una configuración razonable para este proyecto es:

### Project
**Maven**

### Language
**Java**

### Group
```txt
com.novamarket
```

### Artifact
```txt
notification-service
```

### Name
```txt
notification-service
```

### Packaging
```txt
Jar
```

### Java
La misma versión que venís usando en el resto del proyecto.

---

## Paso 3 · Dependencias iniciales recomendadas

Para esta primera etapa del servicio, una base razonable puede incluir:

- **Spring Boot Actuator**
- **Config Client**
- **Eureka Discovery Client**
- y más adelante **Spring AMQP** o la dependencia relacionada con RabbitMQ cuando empecemos a consumir mensajes

Si querés mantener esta clase lo más limpia posible, podés dejar RabbitMQ para la próxima y enfocarte hoy en que el servicio nazca bien integrado al ecosistema.

---

## Paso 4 · Generar y ubicar el proyecto

Una vez generado, ubicá el proyecto dentro de:

```txt
novamarket/services/
```

El resultado esperado debería verse así:

```txt
novamarket/
  services/
    catalog-service/
    inventory-service/
    order-service/
    notification-service/
    config-server/
    discovery-server/
    api-gateway/
```

Esto ya deja al servicio incorporado dentro del monorepo general.

---

## Paso 5 · Revisar la estructura generada

La estructura base del proyecto debería ser la habitual:

```txt
notification-service/
  src/
    main/
      java/
      resources/
    test/
      java/
  pom.xml
  mvnw
  mvnw.cmd
```

Y la clase principal debería verse como cualquier aplicación Spring Boot estándar.

---

## Paso 6 · Elegir un paquete base coherente

Una opción razonable para el paquete raíz del servicio podría ser:

```txt
com.novamarket.notification
```

Esto mantiene consistencia con lo que ya venimos haciendo en:

- `com.novamarket.catalog`
- `com.novamarket.inventory`
- `com.novamarket.order`

La idea es que el servicio nazca ya ordenado y alineado con la estructura general de NovaMarket.

---

## Paso 7 · Preparar la configuración mínima local

Como este servicio debería integrarse desde el inicio con la infraestructura centralizada, una base local mínima razonable podría ser algo como:

```yaml
spring:
  application:
    name: notification-service
  config:
    import: "optional:configserver:http://localhost:8888"
```

Esto deja el servicio listo para cargar su configuración remota desde `config-server`.

---

## Paso 8 · Crear configuración remota en `config-repo`

Ahora creá o completá:

```txt
novamarket/config-repo/notification-service.yml
```

Una base razonable para esta etapa podría incluir algo como:

```yaml
spring:
  application:
    name: notification-service

server:
  port: 8085

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka

management:
  endpoints:
    web:
      exposure:
        include: health,info
```

No hace falta todavía meter configuración de RabbitMQ si querés dejar esa parte para la próxima clase.  
La prioridad hoy es integrar bien el servicio al ecosistema.

---

## Paso 9 · Integrar Eureka y Actuator

Este paso es especialmente útil para mantener coherencia con el resto del proyecto.

Queremos que `notification-service` también:

- se registre en Eureka,
- y exponga endpoints operativos básicos.

De esa forma, cuando empecemos a consumir eventos, el servicio ya va a estar completamente alineado con la arquitectura de NovaMarket.

---

## Paso 10 · Levantar infraestructura base

Antes de arrancar el nuevo servicio, conviene tener arriba:

- `config-server`
- `discovery-server`

La idea es que `notification-service` ya nazca con el mismo esquema que el resto de los servicios modernos del proyecto:

- configuración centralizada
- más registro en discovery

---

## Paso 11 · Levantar `notification-service`

Ahora sí, levantá el nuevo servicio.

Queremos verificar que:

- arranca correctamente,
- carga su configuración remota,
- y, si ya integraste Eureka, aparece registrado en `discovery-server`.

---

## Paso 12 · Verificar en Eureka

Abrí:

```txt
http://localhost:8761
```

Y revisá si aparece algo equivalente a:

- `NOTIFICATION-SERVICE`

Esto no es solo prolijidad.  
Es importante porque más adelante este servicio también formará parte del ecosistema operativo del sistema.

---

## Paso 13 · Verificar Actuator

Si agregaste Actuator, probá algo como:

```bash
curl http://localhost:8085/actuator/health
```

La idea es confirmar que el servicio no solo arranca, sino que ya queda observable desde el principio.

---

## Qué estamos logrando con esta clase

Esta clase agrega una nueva pieza de negocio a NovaMarket, pero con una característica especial:

es el primer servicio del proyecto creado pensando explícitamente en reacciones asincrónicas.

Eso abre un tramo muy interesante del curso, porque empieza a desacoplar responsabilidades del flujo principal de órdenes.

---

## Qué todavía no hicimos

Todavía no:

- conectamos `notification-service` a RabbitMQ,
- declaramos colas,
- ni consumimos mensajes.

Todo eso viene inmediatamente después.

La meta de hoy es mucho más concreta:

**dejar el servicio creado, integrado y operativo.**

---

## Errores comunes en esta etapa

### 1. Crear el servicio fuera del monorepo
Conviene mantenerlo dentro de `services/`.

### 2. No dejarlo integrado a Config Server y Eureka desde el inicio
Después toca volver atrás a alinearlo.

### 3. No definir bien `spring.application.name`
Esto impacta en Config Server y en Eureka.

### 4. Elegir un puerto que choque con otra pieza del sistema
Conviene reservar claramente el del servicio.

### 5. Querer meter toda RabbitMQ en esta clase
Hoy el foco está en crear bien el servicio base.

---

## Resultado esperado al terminar la clase

Al terminar esta clase deberías tener:

- `notification-service` creado,
- registrado en la arquitectura,
- y listo para consumir eventos asincrónicos en las próximas clases.

Eso deja preparada la segunda mitad del bloque de mensajería.

---

## Punto de control

Antes de seguir, verificá que:

- existe `notification-service` dentro de `services/`,
- el servicio arranca,
- carga configuración centralizada,
- aparece en Eureka,
- y expone `health` si ya agregaste Actuator.

Si eso está bien, ya podemos pasar al punto central del módulo: publicar y consumir el primer evento del negocio.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a publicar el primer evento `order.created` desde `order-service` y consumirlo en `notification-service`.

Ese será el primer flujo asincrónico real de NovaMarket.

---

## Cierre

En esta clase creamos `notification-service` y lo dejamos listo como nuevo módulo del proyecto.

Con eso, NovaMarket incorpora una pieza especialmente pensada para el mundo asincrónico y queda preparado para empezar a reaccionar a eventos del negocio sin sobrecargar el flujo síncrono principal.
