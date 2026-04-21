---
title: "Agregando la ruta de inventory-service en api-gateway"
description: "Configurar en api-gateway la ruta hacia inventory-service y verificar el acceso al servicio a través del gateway."
order: 8
module: "Módulo 2 · Primeros servicios de negocio"
level: "base"
draft: false
---

# Objetivo operativo

Agregar en `api-gateway` la ruta hacia `inventory-service` y verificar que el acceso pase por el gateway.

---

## Acciones

### 1. Abrir el archivo remoto de configuración del gateway

Abrir:

```txt
config-repo/api-gateway.yml
```

---

### 2. Reemplazar el contenido por esta versión con las dos rutas

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

### 4. Verificar que las rutas quedaron cargadas

Abrir:

```txt
http://localhost:8080/actuator/gateway/routes
```

Comprobar que existan rutas parecidas a:

```txt
catalog-service-route
inventory-service-route
```

---

### 5. Verificar acceso directo al servicio

Abrir:

```txt
http://localhost:8082/api/inventory/ping
```

Debe responder:

```txt
inventory-service ok
```

---

### 6. Verificar acceso al mismo endpoint a través del gateway

Abrir:

```txt
http://localhost:8080/api/inventory/ping
```

Debe responder:

```txt
inventory-service ok
```

---

### 7. Verificar que ambos servicios sigan registrados en Eureka

Abrir:

```txt
http://localhost:8761
```

Comprobar que aparezcan:

```txt
API-GATEWAY
CATALOG-SERVICE
INVENTORY-SERVICE
```

---

### 8. Verificar `health` del gateway

Abrir:

```txt
http://localhost:8080/actuator/health
```

---

## Verificación rápida

Comprobar que:

- la ruta de `inventory-service` aparece en `/actuator/gateway/routes`
- `inventory-service` responde directo
- `inventory-service` responde también a través de `api-gateway`
- el gateway sigue sano y registrado

---

## Resultado esperado

Tener `inventory-service` accesible a través de `api-gateway`.

---

## Siguiente archivo

Seguir con:

```txt
009-creando-order-service-y-haciendo-la-primera-llamada-a-inventory-service.md
```
