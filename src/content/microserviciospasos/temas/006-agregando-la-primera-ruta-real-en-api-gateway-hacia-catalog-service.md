---
title: "Agregando la primera ruta real en api-gateway hacia catalog-service"
description: "Configurar en api-gateway la primera ruta real hacia catalog-service y verificar el acceso al servicio a través del gateway."
order: 6
module: "Módulo 2 · Primer servicio de negocio"
level: "base"
draft: false
---

# Objetivo operativo

Agregar la primera ruta real en `api-gateway` hacia `catalog-service` y verificar que el acceso pase por el gateway.

---

## Acciones

### 1. Abrir el archivo remoto de configuración del gateway

Abrir:

```txt
config-repo/api-gateway.yml
```

---

### 2. Reemplazar el contenido por esta versión con rutas

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

### 4. Verificar que la ruta quedó cargada

Abrir:

```txt
http://localhost:8080/actuator/gateway/routes
```

Comprobar que exista una ruta con id parecido a:

```txt
catalog-service-route
```

---

### 5. Verificar acceso directo al servicio

Abrir:

```txt
http://localhost:8081/api/catalog/ping
```

Debe responder:

```txt
catalog-service ok
```

---

### 6. Verificar acceso al mismo endpoint a través del gateway

Abrir:

```txt
http://localhost:8080/api/catalog/ping
```

Debe responder:

```txt
catalog-service ok
```

---

### 7. Verificar que `catalog-service` siga registrado en Eureka

Abrir:

```txt
http://localhost:8761
```

Comprobar que aparezcan:

```txt
API-GATEWAY
CATALOG-SERVICE
```

---

### 8. Verificar que el gateway sigue sano

Abrir:

```txt
http://localhost:8080/actuator/health
```

---

### 9. Dejar corriendo estos servicios

Dejar ejecutándose:

1. `config-server`
2. `discovery-server`
3. `api-gateway`
4. `catalog-service`

---

## Verificación rápida

Comprobar que:

- la ruta aparece en `/actuator/gateway/routes`
- `catalog-service` responde directo
- `catalog-service` responde también a través de `api-gateway`
- el gateway sigue registrado y sano

---

## Resultado esperado

Tener la primera ruta real de NovaMarket pasando por `api-gateway`.

---

## Siguiente archivo

El siguiente tramo práctico debería cubrir:

- creación de `inventory-service`
- registro en Eureka
- primer consumo o primera interacción entre servicios
