---
title: "Configurando microservicios como Resource Servers"
description: "Profundización del bloque de seguridad en NovaMarket. Configuración de servicios internos para validar JWT y no depender únicamente del gateway como frontera de seguridad."
order: 42
module: "Módulo 7 · Seguridad con Keycloak y JWT"
level: "intermedio"
draft: false
---

# Configurando microservicios como Resource Servers

En la clase anterior logramos algo muy importante:

- el gateway ya valida tokens,
- y el token ya se propaga hacia downstream.

Ahora toca dar un paso más profundo en la seguridad de NovaMarket:

**hacer que los microservicios internos también entiendan y validen identidad.**

Hasta ahora, la seguridad vive principalmente en el gateway.  
Eso tiene mucho sentido como primera línea de defensa, pero en una arquitectura distribuida es muy valioso que los servicios sensibles no dependan exclusivamente de que el borde haya hecho todo bien.

En esta clase vamos a empezar por el servicio más importante del flujo actual:

**`order-service`**

La idea es configurarlo como **Resource Server** para que también pueda validar JWT emitidos por Keycloak.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- `order-service` configurado como Resource Server,
- con capacidad de validar tokens JWT,
- y listo para empezar a apoyarse en identidad real más allá del gateway.

No hace falta todavía cerrar todas sus rutas internas.  
La meta es preparar el servicio y demostrar que ya puede entender el contexto de seguridad.

---

## Estado de partida

Partimos de este contexto:

- Keycloak está operativo,
- el gateway ya valida JWT,
- la ruta de órdenes ya está protegida en el gateway,
- y el token ya llega a `order-service`.

Pero hoy `order-service` todavía no está configurado formalmente como Resource Server.  
Eso significa que recibe el contexto, pero todavía no lo trata como una identidad validada propia.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- agregar dependencias de seguridad a `order-service`,
- configurar el issuer de Keycloak,
- crear una configuración básica de seguridad,
- y verificar que el servicio ya queda listo para participar activamente en el modelo de seguridad distribuida.

---

## Por qué conviene hacer esto

Si el gateway es la primera frontera, los microservicios sensibles pueden funcionar como una segunda capa de confianza.

Esto aporta valor porque:

- reduce dependencia absoluta de una sola pieza,
- mejora la robustez del sistema,
- permite usar claims o identidad desde adentro,
- y prepara mejor a la arquitectura para escenarios más complejos.

Para NovaMarket, el primer candidato natural es `order-service`, porque es el servicio que hoy maneja la operación más sensible del flujo principal.

---

## Paso 1 · Agregar dependencias de seguridad en `order-service`

Dentro de `order-service`, agregá las dependencias necesarias para trabajar con JWT como Resource Server.

Como base, necesitás:

- **Spring Security**
- soporte de **OAuth2 Resource Server**

El objetivo es que el servicio ya pueda validar por sí mismo tokens emitidos por Keycloak.

---

## Paso 2 · Llevar configuración de seguridad a `config-repo`

Como `order-service` ya consume configuración centralizada, lo más razonable es agregar la configuración de JWT en:

```txt
novamarket/config-repo/order-service.yml
```

Una base conceptual razonable podría ser:

```yaml
spring:
  application:
    name: order-service
  datasource:
    url: jdbc:h2:mem:orderdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8084/realms/novamarket

server:
  port: 8083

order:
  validation:
    stock-required: true

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka
```

El `issuer-uri` debería apuntar al mismo realm que ya venía usando el gateway.

---

## Paso 3 · Crear una configuración de seguridad básica en `order-service`

Ahora conviene agregar una clase de configuración propia del servicio.

Por ejemplo:

```txt
src/main/java/com/novamarket/order/config/SecurityConfig.java
```

Una base razonable para esta etapa podría ser:

```java
package com.novamarket.order.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));

        return http.build();
    }
}
```

Esta configuración es intencionalmente transicional.

¿Por qué?

Porque queremos:

- habilitar la capacidad de validar JWT,
- pero todavía no romper el flujo interno si el gateway ya viene protegiendo la ruta.

Más adelante, si querés, podrías endurecer también esta capa.

---

## Paso 4 · Verificar el estilo de seguridad usado en `order-service`

A diferencia del gateway, `order-service` está montado como aplicación web tradicional de Spring Boot.

Por eso acá usamos una configuración con `SecurityFilterChain` y `HttpSecurity`, no las variantes reactivas del gateway.

Este detalle es muy importante porque evita confundir dos estilos distintos dentro del mismo sistema.

---

## Paso 5 · Reiniciar `order-service`

Ahora reiniciá `order-service`.

Conviene tener arriba también:

- Keycloak
- `config-server`
- `discovery-server`
- `inventory-service`
- y `api-gateway`

Queremos verificar que:

- el servicio arranque bien,
- el `issuer-uri` esté bien resuelto,
- y no haya problemas con la carga del Resource Server.

---

## Paso 6 · Confirmar que el flujo principal sigue funcionando

Ahora probá nuevamente una orden autenticada entrando por el gateway.

Conceptualmente:

```bash
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

La expectativa es que:

- el gateway siga validando el token,
- `order-service` también quede preparado para entender JWT,
- y el flujo siga funcionando.

---

## Paso 7 · Revisar que el servicio puede ya apoyarse en contexto autenticado

En esta etapa del curso no hace falta todavía construir una lógica compleja basada en claims.

Pero sí conviene reconocer algo importante:

`order-service` ya no es solamente un consumidor pasivo de una request que vino autenticada desde el gateway.

Ahora también puede convertirse en un servicio que:

- valida identidad,
- interpreta el token,
- y más adelante podría usar información del usuario autenticado de manera explícita.

Ese es el verdadero valor de esta clase.

---

## Paso 8 · Pensar la extensión al resto de los servicios

Aunque en esta clase el foco esté puesto en `order-service`, el mismo patrón podría aplicarse después a otros servicios si el sistema lo requiere.

Por ejemplo:

- servicios sensibles,
- endpoints administrativos,
- o componentes que necesiten identidad más rica.

No hace falta hacerlo todo hoy.  
Lo importante es consolidar primero el caso más valioso del flujo actual.

---

## Qué estamos logrando con esta clase

Esta clase profundiza la seguridad distribuida de NovaMarket.

Ahora ya no tenemos solamente:

- autenticación en el borde,
- y propagación del token,

sino también un servicio interno relevante capaz de participar activamente en la validación de identidad.

Eso fortalece bastante la arquitectura.

---

## Qué todavía no hicimos

Todavía no:

- configuramos reglas de acceso internas más finas,
- usamos claims del token para lógica de negocio,
- ni endurecemos todos los servicios internos.

Todo eso puede venir después.

La meta de hoy es más concreta:

**que `order-service` ya sea técnicamente un Resource Server.**

---

## Errores comunes en esta etapa

### 1. Reutilizar la configuración reactiva del gateway en un servicio MVC
Conviene separar bien ambos estilos.

### 2. Configurar mal el `issuer-uri`
Entonces el servicio no puede validar JWT correctamente.

### 3. Creer que el servicio ya está completamente cerrado
Por ahora estamos habilitando la capacidad, no cerrando toda la superficie de golpe.

### 4. No reiniciar el servicio después de mover configuración a `config-repo`
Entonces seguís probando con un estado anterior.

### 5. No probar el flujo autenticado de punta a punta
Siempre conviene validar que el sistema siga comportándose correctamente.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `order-service` debería:

- tener dependencias de seguridad,
- conocer el issuer de Keycloak,
- estar configurado como Resource Server,
- y seguir funcionando dentro del flujo autenticado actual.

Eso deja a NovaMarket mucho mejor preparado para usar identidad también dentro de sus servicios internos.

---

## Punto de control

Antes de seguir, verificá que:

- agregaste las dependencias correctas en `order-service`,
- el `issuer-uri` está configurado,
- existe `SecurityConfig`,
- el servicio arranca correctamente,
- y el flujo autenticado sigue funcionando.

Si eso está bien, ya podemos cerrar el bloque inicial de seguridad con una prueba completa de login, token y acceso.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a probar el flujo autenticado completo:

- autenticación en Keycloak,
- obtención del token,
- acceso al gateway,
- y creación de orden autenticada.

Ese será el verdadero cierre práctico de este tramo del bloque de seguridad.

---

## Cierre

En esta clase configuramos `order-service` como Resource Server.

Con eso, NovaMarket dejó de apoyarse únicamente en la seguridad del gateway y empezó a construir una arquitectura más sólida, donde también los servicios internos relevantes entienden y validan identidad real.
