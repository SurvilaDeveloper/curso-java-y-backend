---
title: "Configurando las primeras rutas del gateway con lb://"
description: "Primer cierre práctico del bloque rehecho de API Gateway. Definición de rutas reales en api-gateway usando nombres lógicos y lb:// para exponer catálogo, inventario y órdenes desde un único punto de entrada."
order: 36
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Configurando las primeras rutas del gateway con `lb://`

En las clases anteriores hicimos tres cosas muy importantes:

- entendimos por qué el gateway no debería enrutar usando direcciones rígidas,
- distinguimos el modelo de balanceo que encaja con NovaMarket,
- e integramos **Spring Cloud LoadBalancer** en `api-gateway`.

Ahora sí toca el paso que hace visible todo ese trabajo:

**configurar las primeras rutas reales del gateway con `lb://`.**

Ese es el objetivo de esta clase.

Porque recién acá `api-gateway` deja de ser una pieza “creada y lista” y pasa a convertirse en el verdadero punto de entrada práctico del sistema.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- configurado `api-gateway` con rutas reales hacia `catalog-service`, `inventory-service` y `order-service`,
- esas rutas apoyadas en nombres lógicos y `lb://`,
- el acceso centralizado al sistema funcionando desde el puerto del gateway,
- y validado que NovaMarket ya puede entrar por un solo punto en lugar de pegarle directamente a cada servicio.

Este es uno de los hitos más importantes del curso hasta ahora.

---

## Estado de partida

En este punto ya tenemos:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `api-gateway`

Además:

- los servicios principales ya se registran en Eureka,
- el gateway ya tiene Spring Cloud Gateway,
- el gateway ya tiene Eureka Discovery Client,
- y en la clase anterior también quedó integrado con Spring Cloud LoadBalancer.

Eso significa que por fin ya están todas las piezas listas para enrutar correctamente.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- definir rutas en la configuración del gateway,
- usar nombres lógicos con `lb://`,
- aplicar una transformación simple de path,
- arrancar el entorno completo,
- y probar catálogo, inventario y órdenes entrando por `api-gateway`.

---

## Qué problema queremos resolver exactamente

Hasta ahora, para hablar con NovaMarket teníamos que entrar por puertos distintos:

- `http://localhost:8081/products`
- `http://localhost:8082/inventory`
- `http://localhost:8083/orders`

Eso fue útil para construir y probar cada microservicio.

Pero ahora queremos algo más serio:

- un solo punto de entrada
- que se encargue de enrutar internamente hacia el servicio correcto
- sin exponer al consumidor final la topología interna por puertos

Ahí es donde el gateway pasa a tener sentido real.

---

## Cómo vamos a pensar las rutas

Una forma clara y didáctica de exponer los servicios desde el gateway en esta etapa es esta:

- `/catalog/**` → `catalog-service`
- `/inventory/**` → `inventory-service`
- `/orders/**` → `order-service`

Esto deja muy visible:

- qué parte del gateway apunta a qué microservicio,
- y cómo se transforma una request pública en una request interna.

---

## Paso 1 · Revisar `api-gateway.yml` en `config-repo`

Como venimos trabajando con configuración centralizada, lo más prolijo es definir las rutas del gateway dentro de:

```txt
novamarket/config-repo/api-gateway.yml
```

Hasta ahora ese archivo podía tener algo mínimo como:

```yaml
spring:
  application:
    name: api-gateway

server:
  port: 8080

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

Ahora vamos a expandirlo para agregar rutas reales.

---

## Paso 2 · Definir la ruta hacia `catalog-service`

Una forma razonable de exponer catálogo es:

- request pública:
  - `/catalog/products`
- request interna al servicio:
  - `/products`

Para eso conviene usar una ruta con `Path` y un filtro que quite el primer segmento.

Por ejemplo:

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
            - Path=/catalog/**
          filters:
            - StripPrefix=1
```

Con esto, si alguien entra por:

```txt
/catalog/products
```

el gateway quita `catalog` y reenvía:

```txt
/products
```

hacia el servicio lógico `catalog-service`.

---

## Paso 3 · Definir la ruta hacia `inventory-service`

Ahora repetimos el mismo patrón para inventario:

```yaml
        - id: inventory-service-route
          uri: lb://inventory-service
          predicates:
            - Path=/inventory/**
          filters:
            - StripPrefix=1
```

La idea es que:

```txt
/inventory/inventory
```

termine llegando como:

```txt
/inventory
```

al microservicio real.

Y que:

```txt
/inventory/inventory/1
```

termine llegando como:

```txt
/inventory/1
```

Esto puede parecer un poco repetitivo en naming, pero mantiene una transición muy clara con el contrato actual del servicio.

---

## Paso 4 · Definir la ruta hacia `order-service`

Ahora hacemos lo mismo para órdenes:

```yaml
        - id: order-service-route
          uri: lb://order-service
          predicates:
            - Path=/orders/**
          filters:
            - StripPrefix=1
```

Y acá aparece un detalle importante:

como `order-service` hoy expone su endpoint en `/orders`, usar `StripPrefix=1` con `/orders/**` puede dejarte una ruta interna distinta a la esperada si no pensás bien el path público.

Para esta etapa, una variante más prolija es exponerlo como:

- público:
  - `/order-api/**`
- interno:
  - `/orders/**`

Entonces una mejor ruta sería:

```yaml
        - id: order-service-route
          uri: lb://order-service
          predicates:
            - Path=/order-api/**
          filters:
            - StripPrefix=1
```

Así:

```txt
/order-api/orders
```

llega como:

```txt
/orders
```

a `order-service`.

Eso mantiene la intención del diseño mucho más clara.

---

## Paso 5 · Dejar una versión completa razonable del archivo

Una versión razonable de `api-gateway.yml` para esta etapa podría quedar así:

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
            - Path=/catalog/**
          filters:
            - StripPrefix=1

        - id: inventory-service-route
          uri: lb://inventory-service
          predicates:
            - Path=/inventory/**
          filters:
            - StripPrefix=1

        - id: order-service-route
          uri: lb://order-service
          predicates:
            - Path=/order-api/**
          filters:
            - StripPrefix=1

server:
  port: 8080

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

Esta configuración ya deja al gateway con rutas reales y coherentes con el estado actual del proyecto.

---

## Paso 6 · Levantar la infraestructura en orden

Ahora toca probar todo.

Conviene respetar este orden:

1. `config-server`
2. `discovery-server`
3. `catalog-service`
4. `inventory-service`
5. `order-service`
6. `api-gateway`

Este orden sigue siendo importante porque el gateway depende tanto de configuración centralizada como de discovery.

---

## Paso 7 · Revisar Eureka antes de probar

Antes de mandar requests, entrá a:

```txt
http://localhost:8761
```

Y verificá que estén visibles al menos:

- `CATALOG-SERVICE`
- `INVENTORY-SERVICE`
- `ORDER-SERVICE`
- `API-GATEWAY`

Esto no prueba todavía el ruteo, pero sí confirma que el entorno está sano y listo.

---

## Paso 8 · Probar catálogo entrando por el gateway

Ahora sí, primera prueba importante.

En vez de entrar directo a `8081`, probá:

```bash
curl http://localhost:8080/catalog/products
```

Y también:

```bash
curl http://localhost:8080/catalog/products/1
```

La respuesta debería ser equivalente a la que antes obtenías entrando directamente a `catalog-service`.

Esto confirma que la ruta:

- entra por el gateway,
- se resuelve por nombre lógico,
- se balancea con `lb://`,
- y termina en el servicio correcto.

---

## Paso 9 · Probar inventario entrando por el gateway

Ahora hacé lo mismo con inventario.

Probá:

```bash
curl http://localhost:8080/inventory/inventory
```

Y también:

```bash
curl http://localhost:8080/inventory/inventory/1
```

Puede parecer redundante el prefijo `/inventory/inventory`, pero didácticamente sigue siendo aceptable en esta etapa porque preserva intacto el contrato interno del servicio.

Más adelante, si querés, esto se puede refinar con `RewritePath` o rediseño de endpoints.

---

## Paso 10 · Probar órdenes entrando por el gateway

Ahora hagamos el salto grande: crear una orden sin entrar directamente al puerto `8083`.

Probá:

```bash
curl -X POST http://localhost:8080/order-api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 2, "quantity": 1 }
    ]
  }'
```

La respuesta esperada debería seguir siendo:

- `201 Created`
- una orden válida
- con estado `CREATED`

Este es uno de los hitos más importantes del curso hasta ahora, porque confirma que:

- el cliente entra por el gateway,
- el gateway enruta a `order-service`,
- `order-service` sigue consumiendo a `inventory-service`,
- y toda la arquitectura ya funciona con un punto de entrada unificado.

---

## Paso 11 · Probar un error de negocio también por el gateway

Ahora probá una orden inválida, por ejemplo por falta de stock:

```bash
curl -X POST http://localhost:8080/order-api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 3, "quantity": 999 }
    ]
  }'
```

La respuesta debería seguir siendo un `400 Bad Request` con mensaje claro.

Esto confirma que el gateway no rompe la lógica funcional del sistema.  
Solo centraliza y enruta el acceso.

---

## Qué estamos logrando con esta clase

Esta clase convierte al gateway en una pieza realmente útil dentro de NovaMarket.

Hasta acá el proyecto tenía:

- microservicios,
- configuración centralizada,
- discovery,
- y comunicación profesional entre servicios.

Ahora además tiene algo decisivo:

**un punto de entrada único y funcional apoyado en nombres lógicos y `lb://`.**

Ese es un salto arquitectónico enorme.

---

## Qué todavía no hicimos

Todavía no:

- levantamos múltiples instancias reales de un mismo servicio,
- observamos reparto de tráfico,
- comparamos rutas explícitas con discovery locator,
- ni trabajamos sobre filtros más ricos del gateway.

Todo eso viene después.

La meta de hoy es mucho más concreta:

**dejar a `api-gateway` enroutando realmente hacia los servicios principales de NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Intentar usar `lb://` sin haber agregado LoadBalancer al gateway
Entonces la resolución no queda bien soportada.

### 2. Definir mal el `Path`
Si el predicado no coincide con la request, la ruta no se ejecuta.

### 3. Olvidar `StripPrefix=1`
Entonces el microservicio recibe un path distinto del que espera.

### 4. No revisar si el servicio destino está registrado en Eureka
Sin registro, la resolución lógica falla.

### 5. Mezclar mal el path público y el path interno
Conviene pensar muy bien qué entra al gateway y qué sale hacia el microservicio.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder:

- consultar catálogo desde `http://localhost:8080/catalog/...`
- consultar inventario desde `http://localhost:8080/inventory/...`
- crear órdenes desde `http://localhost:8080/order-api/orders`
- y entender que todo ese flujo ya está apoyado en `lb://` y nombres lógicos.

Eso deja a NovaMarket con su primer punto de entrada realmente funcional.

---

## Punto de control

Antes de seguir, verificá que:

- `api-gateway.yml` ya tiene rutas reales,
- esas rutas usan `lb://`,
- el gateway arranca correctamente,
- los servicios están registrados en Eureka,
- y podés entrar al sistema por `8080` sin ir directo a los puertos internos.

Si eso está bien, ya podemos pasar al siguiente tema y empezar a probar múltiples instancias reales para hacer visible el reparto de tráfico.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a levantar múltiples instancias reales de un mismo servicio y a comprobar cómo el gateway, apoyado en `lb://`, empieza a repartir requests entre ellas.

---

## Cierre

En esta clase configuramos las primeras rutas reales del gateway con `lb://`.

Con eso, NovaMarket deja de exponer sus servicios principales solo por puertos internos y gana por fin un punto de entrada único, coherente y apoyado correctamente en discovery y balanceo por nombre lógico.
