---
title: "Configurando api-gateway como Resource Server"
description: "Primer paso real de seguridad distribuida en NovaMarket. Configuración de api-gateway para validar JWT emitidos por Keycloak y comenzar a centralizar el control de acceso."
order: 39
module: "Módulo 7 · Seguridad con Keycloak y JWT"
level: "intermedio"
draft: false
---

# Configurando `api-gateway` como Resource Server

En la clase anterior preparamos la base de identidad del proyecto dentro de Keycloak:

- creamos el realm,
- creamos el cliente,
- y creamos un usuario de prueba.

Ahora toca hacer que esa identidad empiece a importar de verdad para la arquitectura.

La pieza natural para empezar es `api-gateway`, porque hoy ya funciona como el punto de entrada central de NovaMarket.

En esta clase vamos a configurarlo como **Resource Server**, de forma que pueda recibir un token JWT emitido por Keycloak y validarlo antes de dejar pasar tráfico hacia los microservicios internos.

Todavía no vamos a cerrar todas las rutas del sistema.  
Primero queremos dejar funcionando el mecanismo base de validación de tokens.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregada seguridad al gateway,
- configurado `api-gateway` como Resource Server,
- integrado con el issuer de Keycloak,
- y validado el arranque del gateway con soporte real para JWT.

Todavía no vamos a proteger específicamente `/orders`.  
La meta de hoy es dejar el gateway listo para entender tokens.

---

## Estado de partida

En este punto del curso deberíamos tener:

- Keycloak levantado,
- un realm `novamarket`,
- un cliente configurado,
- un usuario de prueba,
- y `api-gateway` funcionando como punto de entrada del sistema.

Pero hoy el gateway todavía deja pasar todo el tráfico sin validar identidad.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- agregar dependencias de seguridad al gateway,
- definir configuración para JWT,
- conectar el gateway con Keycloak,
- crear una configuración base de seguridad,
- y verificar que el gateway arranca correctamente con este nuevo rol.

---

## Qué significa que el gateway sea Resource Server

Quiere decir que el gateway va a aceptar requests con un token JWT y va a validar si ese token fue emitido por el proveedor de identidad que configuramos.

No estamos diciendo todavía:

- qué rutas se protegen,
- qué roles se exigen,
- ni cómo se propaga identidad.

Estamos resolviendo el paso anterior a todo eso:

**que el gateway sepa validar tokens reales.**

---

## Paso 1 · Agregar dependencias de seguridad al gateway

Dentro de `api-gateway`, agregá las dependencias necesarias para trabajar con seguridad basada en JWT.

Como base, necesitás:

- **Spring Security**
- soporte de **OAuth2 Resource Server**

El objetivo es que el gateway pueda actuar como consumidor y validador de tokens emitidos por Keycloak.

---

## Paso 2 · Revisar la configuración remota del gateway

Como `api-gateway` ya está dentro del esquema de configuración centralizada, lo más razonable es agregar las propiedades de seguridad dentro de:

```txt
novamarket/config-repo/api-gateway.yml
```

Una base conceptual razonable podría verse así:

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
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8084/realms/novamarket

server:
  port: 8080

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

El valor exacto del `issuer-uri` depende del puerto y la URL real con la que hayas levantado Keycloak, pero la idea es que apunte al realm `novamarket`.

---

## Paso 3 · Por qué usamos `issuer-uri`

Usar `issuer-uri` permite que el gateway:

- descubra la metadata del proveedor de identidad,
- resuelva dónde validar la firma del token,
- y entienda que los JWT válidos para este sistema son los emitidos por ese realm.

Es una forma muy práctica y alineada con estándares de dejar configurado el Resource Server.

---

## Paso 4 · Crear una configuración de seguridad mínima

Ahora conviene agregar una clase de configuración en el gateway.

Por ejemplo:

```txt
src/main/java/com/novamarket/gateway/config/SecurityConfig.java
```

Una base razonable para esta etapa podría ser:

```java
package com.novamarket.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchange -> exchange
                        .anyExchange().permitAll()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt())
                .build();
    }
}
```

Esta configuración es intencionalmente transicional.

¿Por qué?

Porque queremos:

- activar la capacidad de validar JWT,
- pero todavía no cerrar rutas.

En otras palabras: hoy habilitamos el mecanismo, mañana lo hacemos obligatorio en las rutas que correspondan.

---

## Paso 5 · Revisar que el gateway siga siendo una aplicación WebFlux

Este detalle es importante.

Spring Cloud Gateway trabaja sobre una base reactiva, así que la configuración de seguridad también tiene que ser coherente con eso.

Por eso usamos `SecurityWebFilterChain` y `ServerHttpSecurity`, no las variantes típicas de MVC tradicional.

---

## Paso 6 · Levantar primero la infraestructura necesaria

Antes de arrancar el gateway, conviene tener arriba:

- `config-server`
- `discovery-server`
- Keycloak
- y luego el resto de los servicios si querés probar el sistema completo

Lo importante acá es que, para arrancar con seguridad, el gateway pueda alcanzar correctamente al `issuer-uri`.

---

## Paso 7 · Levantar `api-gateway`

Ahora sí, reiniciá `api-gateway`.

Queremos verificar que:

- arranca correctamente,
- no falla al resolver el issuer de Keycloak,
- y queda operativo como Resource Server.

Si algo está mal en el `issuer-uri`, esta es una de las etapas donde suele notarse enseguida.

---

## Paso 8 · Qué deberías observar en esta etapa

Si todo está correcto:

- el gateway debería arrancar,
- las rutas deberían seguir existiendo,
- y el sistema todavía debería poder usarse como antes, porque todavía no cerramos accesos.

La diferencia importante es que ahora el gateway **ya entiende** tokens JWT emitidos por Keycloak, aunque todavía no esté exigiéndolos.

Ese matiz es importante.

---

## Paso 9 · Verificar que el flujo actual no se rompa

Una vez levantado el gateway, conviene probar algo simple:

```bash
curl http://localhost:8080/products
```

Y también:

```bash
curl http://localhost:8080/inventory
```

E incluso una orden válida:

```bash
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

La idea es confirmar que el gateway sigue funcionando y que la incorporación de seguridad no rompió todavía el flujo general.

---

## Qué estamos logrando con esta clase

Esta clase deja una pieza muy importante lista:

**el gateway ya sabe validar JWT.**

Aunque todavía no estemos bloqueando rutas, eso ya cambia la arquitectura del sistema porque el punto de entrada empieza a incorporar un rol real de seguridad.

Es el paso previo necesario para cerrar accesos de forma ordenada.

---

## Qué todavía no hicimos

Todavía no:

- exigimos token para rutas concretas,
- pedimos tokens desde Keycloak,
- propagamos identidad,
- ni configuramos los microservicios internos como Resource Servers.

Todo eso viene después.

La meta de hoy es más concreta:

**habilitar el gateway como Resource Server.**

---

## Errores comunes en esta etapa

### 1. Configurar mal el `issuer-uri`
Entonces el gateway no puede validar tokens correctamente.

### 2. Usar clases de seguridad de MVC en lugar de WebFlux
En Gateway esto suele generar bastante confusión.

### 3. Cerrar todas las rutas demasiado pronto
Conviene hacer la transición de forma gradual.

### 4. No levantar Keycloak antes del gateway
Si el issuer no está disponible, el arranque puede dar problemas o el entorno queda incompleto.

### 5. Pensar que hoy ya deberíamos exigir token
Todavía no; estamos preparando la base.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `api-gateway` debería:

- tener dependencias de seguridad,
- estar configurado como Resource Server,
- conocer el issuer de Keycloak,
- y seguir funcionando correctamente.

Eso deja lista la base para empezar a proteger rutas reales.

---

## Punto de control

Antes de seguir, verificá que:

- agregaste las dependencias correctas,
- existe una configuración de seguridad reactiva,
- el gateway arranca sin errores,
- el `issuer-uri` apunta al realm correcto,
- y las rutas del sistema siguen respondiendo.

Si eso está bien, ya podemos pasar a proteger el primer conjunto real de endpoints.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a proteger los endpoints de órdenes.

Ese será el primer momento del curso en que NovaMarket realmente empiece a exigir autenticación para una parte del flujo.

---

## Cierre

En esta clase configuramos `api-gateway` como Resource Server.

Con eso, el punto de entrada de NovaMarket ya dejó de ser solo una puerta técnica y pasó a convertirse en una pieza preparada para validar identidad real sobre tokens JWT emitidos por Keycloak.
