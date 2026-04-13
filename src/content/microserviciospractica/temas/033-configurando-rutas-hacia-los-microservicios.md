---
title: "Configurando rutas hacia los microservicios"
description: "Definición de rutas en api-gateway hacia catalog-service, inventory-service y order-service. Primer paso para entrar a NovaMarket a través de un único punto."
order: 33
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Configurando rutas hacia los microservicios

En la clase anterior creamos `api-gateway` y lo dejamos listo como nuevo punto de entrada de NovaMarket.

Ahora toca hacer que esa pieza empiece a tener valor real:

**configurar rutas hacia los microservicios principales.**

Hasta este momento seguimos entrando directamente a cada servicio por su puerto.  
Después de esta clase, el objetivo es poder empezar a entrar por el gateway y dejar que él decida a qué servicio reenviar cada request.

Ese es el primer uso real del gateway dentro de la arquitectura.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- definido un conjunto inicial de rutas en `api-gateway`,
- configurado el ruteo hacia:
  - `catalog-service`
  - `inventory-service`
  - `order-service`
- y listo el entorno para probar acceso al sistema a través de un único punto de entrada.

Todavía no vamos a agregar filtros ni seguridad.  
Primero queremos que el gateway enrute correctamente.

---

## Estado de partida

En este punto del curso deberíamos tener:

- `config-server` arriba,
- `discovery-server` arriba,
- `catalog-service`, `inventory-service` y `order-service` arriba,
- y `api-gateway` ya creado y arrancando correctamente.

Además, los servicios principales ya deberían estar registrados en Eureka.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- definir rutas en la configuración del gateway,
- apuntar a servicios por nombre lógico,
- verificar que el gateway vea a Eureka,
- y probar requests que entren por el gateway en lugar de ir directamente al puerto de cada microservicio.

---

## Cómo conviene definir las rutas

Como el sistema ya usa Eureka, una estrategia muy razonable para esta etapa es que las rutas del gateway apunten por nombre lógico y no por URL fija.

Eso significa que el gateway va a delegar en discovery la resolución de la ubicación real del servicio.

Por ejemplo, una ruta puede decir conceptualmente:

- todo lo que empiece por `/api/products` va a `catalog-service`

Eso deja la arquitectura bastante mejor alineada con lo que ya venimos construyendo.

---

## Paso 1 · Revisar la configuración remota del gateway

Vamos a trabajar sobre:

```txt
novamarket/config-repo/api-gateway.yml
```

Como este servicio ya debería estar consumiendo configuración centralizada, lo más natural es definir las rutas ahí mismo.

---

## Paso 2 · Definir la configuración base del gateway

Una versión razonable del archivo podría incluir algo así:

```yaml
spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: catalog-service-route
          uri: lb://catalog-service
          predicates:
            - Path=/api/products/**
        - id: inventory-service-route
          uri: lb://inventory-service
          predicates:
            - Path=/api/inventory/**
        - id: order-service-route
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**

server:
  port: 8080

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

Acá hay varios detalles importantes.

---

## Qué significa `lb://`

El uso de:

```txt
lb://catalog-service
```

indica que el gateway no está apuntando a una URL rígida.

Está diciendo algo más interesante:

- “resolvé este servicio mediante el mecanismo de load balancing/discovery”

En esta etapa del curso, eso se apoya en Eureka y nos permite usar el nombre lógico del servicio como referencia.

Ese detalle es uno de los grandes valores del bloque actual.

---

## Paso 3 · Pensar bien los prefijos de ruta

Fijate que estamos usando prefijos así:

- `/api/products/**`
- `/api/inventory/**`
- `/api/orders/**`

Eso es razonable porque:

- deja claro que el gateway es el punto de entrada,
- unifica el acceso bajo `/api`,
- y evita exponer directamente la topología interna del sistema.

Todavía no estamos reescribiendo paths.  
En esta primera etapa del gateway, nos conviene mantener algo simple y fácil de seguir.

---

## Paso 4 · Verificar la relación con los endpoints reales

Acá conviene pensar un momento cómo quedan las cosas.

### `catalog-service` expone
- `/products`
- `/products/{id}`

### `inventory-service` expone
- `/inventory`
- `/inventory/{productId}`

### `order-service` expone
- `/orders`

Si el gateway recibe:

- `/api/products`
- `/api/inventory`
- `/api/orders`

tenemos que asegurarnos de que el path final llegue al servicio del modo esperado.

En una versión inicial simple, muchas veces conviene alinear los predicados con los paths que ya existen o agregar reescritura más adelante.

Para este curso práctico, una opción muy clara es que el gateway reenvíe manteniendo rutas equivalentes a las existentes, por ejemplo usando `/products/**`, `/inventory/**`, `/orders/**`, y después sumar `/api` más adelante si queremos unificar todo con más elegancia.

Si querés mantener esta clase simple y muy directa, una configuración inicial aún más clara podría ser:

```yaml
spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: catalog-service-route
          uri: lb://catalog-service
          predicates:
            - Path=/products/**
        - id: inventory-service-route
          uri: lb://inventory-service
          predicates:
            - Path=/inventory/**
        - id: order-service-route
          uri: lb://order-service
          predicates:
            - Path=/orders/**

server:
  port: 8080

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

Esta variante tiene una enorme ventaja didáctica:  
reduce ruido y evita introducir reescritura de paths demasiado pronto.

---

## Recomendación práctica para esta clase

Para esta etapa del curso, conviene arrancar con la versión más simple:

- `/products/**`
- `/inventory/**`
- `/orders/**`

Así el cambio se enfoca en **entrar por el gateway**, no en pelear con transformaciones de path.

Más adelante, cuando agreguemos filtros o refinemos el acceso, podremos volver a trabajar eso.

---

## Paso 5 · Levantar infraestructura y servicios

Antes de probar el gateway, asegurate de tener levantados:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `api-gateway`

El orden sigue siendo importante porque el gateway necesita:

- su configuración remota,
- y el entorno de discovery disponible.

---

## Paso 6 · Verificar que `api-gateway` vea Eureka

Conviene abrir la consola de Eureka y revisar que también aparezca `api-gateway` como instancia registrada, si ya lo dejaste configurado como cliente.

Además, necesitás ver registrados:

- `CATALOG-SERVICE`
- `INVENTORY-SERVICE`
- `ORDER-SERVICE`

Sin eso, el ruteo por nombre lógico no va a funcionar como esperamos.

---

## Paso 7 · Probar acceso al catálogo a través del gateway

Ahora probemos una ruta concreta por gateway.

Si configuraste la variante simple, ejecutá:

```bash
curl http://localhost:8080/products
```

Y también:

```bash
curl http://localhost:8080/products/1
```

La respuesta debería ser equivalente a la que antes obtenías yendo directo a `catalog-service`, pero ahora entrando por el gateway.

Ese es el primer gran hito visible de esta clase.

---

## Paso 8 · Probar acceso al inventario a través del gateway

Ahora hacé lo mismo con inventario:

```bash
curl http://localhost:8080/inventory
```

Y también:

```bash
curl http://localhost:8080/inventory/1
```

La respuesta esperada debería ser la misma que obtenías entrando directamente a `inventory-service`, pero ahora a través del punto de entrada central.

---

## Paso 9 · Probar creación de órdenes a través del gateway

Ahora probemos el flujo principal entrando por el gateway.

Ejecutá:

```bash
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 2 }
    ]
  }'
```

Si todo está bien, la orden debería crearse correctamente.

Esto tiene mucho valor porque confirma que el gateway no solo enruta lecturas simples, sino también el flujo principal del sistema.

---

## Qué estamos logrando con esta clase

Después de esta clase, NovaMarket deja de ser un conjunto de servicios a los que se entra por puertos separados y pasa a tener una primera forma clara de acceso unificado.

Eso mejora muchísimo la arquitectura desde el punto de vista de:

- uso,
- organización,
- y evolución futura.

Además, prepara muy bien el bloque que sigue, donde vamos a agregar filtros y después seguridad sobre el gateway.

---

## Qué todavía no hicimos

Todavía no:

- agregamos filtros,
- reescribimos paths de forma más elaborada,
- centralizamos seguridad,
- ni protegemos rutas.

Todo eso viene después.

La meta de hoy es más concreta:

**que el gateway enrute correctamente hacia los microservicios principales.**

---

## Errores comunes en esta etapa

### 1. Configurar rutas con nombres lógicos mal escritos
Si el `uri` no coincide con lo registrado en Eureka, la resolución falla.

### 2. Intentar usar `/api/...` sin pensar la reescritura del path
Para esta clase, conviene mantener la versión más simple.

### 3. No tener los servicios registrados en Eureka
El gateway no va a poder resolverlos.

### 4. No reiniciar el gateway después de cambiar configuración remota
Conviene asegurarse de que esté leyendo la última versión del `api-gateway.yml`.

### 5. Probar solo una ruta
Conviene validar catálogo, inventario y órdenes.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `api-gateway` debería:

- tener rutas configuradas,
- resolver servicios por nombre lógico,
- y permitir entrar al catálogo, inventario y órdenes desde un único puerto.

Eso ya convierte al gateway en una pieza activa y visible dentro de NovaMarket.

---

## Punto de control

Antes de seguir, verificá que:

- existen rutas definidas en `api-gateway.yml`,
- el gateway arranca correctamente,
- `GET /products` funciona entrando por el gateway,
- `GET /inventory` funciona entrando por el gateway,
- y `POST /orders` también funciona entrando por el gateway.

Si eso está bien, ya podemos hacer una verificación integral del nuevo punto de entrada del sistema.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a probar NovaMarket a través del gateway de manera más completa.

La idea será consolidar este nuevo punto de entrada antes de empezar a agregar filtros.

---

## Cierre

En esta clase configuramos las primeras rutas de `api-gateway`.

Con eso, NovaMarket ya puede usarse entrando por un único punto y apoyándose en discovery para resolver los microservicios internos.

Ese es uno de los cambios más visibles y útiles del curso hasta ahora.
