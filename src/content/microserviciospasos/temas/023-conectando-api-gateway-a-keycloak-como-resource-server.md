---
title: "Conectando api-gateway a Keycloak como resource server"
description: "Agregar Spring Security y OAuth2 Resource Server a api-gateway, configurarlo con el issuer de Keycloak y dejarlo validando tokens JWT."
order: 23
module: "Módulo 5 · Seguridad"
level: "base"
draft: false
---

# Objetivo operativo

Conectar `api-gateway` a Keycloak para que valide tokens JWT emitidos por el realm `novamarket`.

---

## Acciones

### 1. Agregar dependencias al `pom.xml` de `api-gateway`

Abrir:

```txt
services/api-gateway/pom.xml
```

Agregar estas dependencias dentro de `<dependencies>`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

---

### 2. Abrir la configuración remota del gateway

Abrir:

```txt
config-repo/api-gateway.yml
```

---

### 3. Reemplazar el contenido por esta versión

Pegar esto:

```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:9090/realms/novamarket
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

### 4. Crear el paquete `config` en `api-gateway`

Crear esta carpeta si no existe:

```txt
services/api-gateway/src/main/java/com/novamarket/apigateway/config/
```

---

### 5. Crear la configuración de seguridad

Crear el archivo:

```txt
services/api-gateway/src/main/java/com/novamarket/apigateway/config/SecurityConfig.java
```

Pegar esto:

```java
package com.novamarket.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchange -> exchange
                        .pathMatchers("/actuator/**").permitAll()
                        .pathMatchers("/api/catalog/**").permitAll()
                        .pathMatchers("/api/inventory/**").permitAll()
                        .pathMatchers("/api/orders/**").authenticated()
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .build();
    }
}
```

---

### 6. Reiniciar `api-gateway`

Detener `api-gateway` si está corriendo.

Volver a ejecutarlo.

---

### 7. Verificar que el gateway arranca sin errores

Abrir:

```txt
http://localhost:8080/actuator/health
```

---

### 8. Verificar que catálogo sigue público

Abrir:

```txt
http://localhost:8080/api/catalog/products
```

Debe seguir respondiendo sin token.

---

### 9. Verificar que órdenes ahora requieren autenticación

Abrir:

```txt
http://localhost:8080/api/orders
```

Debe responder `401 Unauthorized` o equivalente.

---

### 10. Obtener un token nuevo

Ejecutar este `curl` en terminal:

```bash
curl -X POST "http://localhost:9090/realms/novamarket/protocol/openid-connect/token" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "client_id=api-gateway" ^
  -d "username=gabriel" ^
  -d "password=gabriel123" ^
  -d "grant_type=password"
```

Si estás en Git Bash o Linux/macOS, usar:

```bash
curl -X POST "http://localhost:9090/realms/novamarket/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=api-gateway" \
  -d "username=gabriel" \
  -d "password=gabriel123" \
  -d "grant_type=password"
```

Guardar el valor de `access_token`.

---

## Verificación rápida

Comprobar que:

- `api-gateway` arranca con Spring Security
- `/api/catalog/**` sigue siendo público
- `/api/orders/**` ahora devuelve `401` sin token
- se puede obtener un JWT desde Keycloak

---

## Resultado esperado

Tener `api-gateway` conectado a Keycloak y validando JWT como resource server.

---

## Siguiente archivo

Seguir con:

```txt
024-probando-el-primer-flujo-protegido-con-token-a-traves-de-api-gateway.md
```
