---
title: "Agregando la ruta de order-service en api-gateway y probando el flujo completo"
description: "Configurar en api-gateway la ruta hacia order-service y verificar un flujo completo que pase por gateway y llegue hasta inventory-service."
order: 10
module: "Módulo 3 · Primer flujo entre servicios"
level: "base"
draft: false
---

# Objetivo operativo

Agregar en `api-gateway` la ruta hacia `order-service` y verificar un flujo completo que entre por el gateway y termine llamando a `inventory-service`.

---

## Acciones

### 1. Abrir el archivo remoto de configuración del gateway

Abrir:

```txt
config-repo/api-gateway.yml
```

---

### 2. Reemplazar el contenido por esta versión con tres rutas

Pegar esto:

```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      server:
        webflux:
          routes:
            - id: catalog-service-route
              uri: lb://CATALOG-SERVICE
              predicates:
                - Path=/api/catalog/**
            - id: inventory-service-route
              uri: lb://INVENTORY-SERVICE
              predicates:
                - Path=/api/inventory/**
            - id: order-service-route
              uri: lb://ORDER-SERVICE
              predicates:
                - Path=/api/orders/**

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka

management:
  endpoints:
    web:
      exposure:
        include: health,info,gateway
```

---

### 3. Reiniciar `api-gateway`

Detener `api-gateway` si está corriendo.

Volver a ejecutarlo.

---

### 4. Verificar que la nueva ruta quedó cargada

Abrir:

```txt
http://localhost:8080/actuator/gateway/routes
```

Comprobar que exista una ruta parecida a:

```txt
order-service-route
```

---

### 5. Verificar acceso directo a `order-service`

Abrir:

```txt
http://localhost:8083/api/orders/ping
```

Debe responder:

```txt
order-service ok
```

---

### 6. Verificar acceso a `order-service` a través del gateway

Abrir:

```txt
http://localhost:8080/api/orders/ping
```

Debe responder:

```txt
order-service ok
```

---

### 7. Verificar el flujo completo a través del gateway

Abrir:

```txt
http://localhost:8080/api/orders/check-inventory
```

Debe responder:

```txt
inventory-service ok
```

---

### 8. Verificar que todos los servicios siguen registrados

Abrir:

```txt
http://localhost:8761
```

Comprobar que aparezcan:

```txt
API-GATEWAY
CATALOG-SERVICE
INVENTORY-SERVICE
ORDER-SERVICE
```

---

### 9. Dejar corriendo estos servicios

Dejar ejecutándose:

1. `config-server`
2. `discovery-server`
3. `api-gateway`
4. `catalog-service`
5. `inventory-service`
6. `order-service`

---

## Verificación rápida

Comprobar que:

- la ruta de `order-service` aparece en `/actuator/gateway/routes`
- `order-service` responde directo
- `order-service` responde también a través de `api-gateway`
- el endpoint `/api/orders/check-inventory` responde correctamente a través del gateway

---

## Resultado esperado

Tener el primer flujo completo entrando por `api-gateway`, pasando por `order-service` y llegando hasta `inventory-service`.

---

## Siguiente archivo

Seguir con:

```txt
011-preparando-postgresql-y-conectando-catalog-service-a-la-base-commerce_lab.md
```
