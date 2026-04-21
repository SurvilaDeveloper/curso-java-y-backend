---
title: "Integrando api-gateway como resource server JWT con Keycloak en NovaMarket"
description: "Primer paso práctico del siguiente subtramo del módulo 10. Configuración de api-gateway como resource server JWT para empezar a validar tokens reales emitidos por Keycloak."
order: 102
module: "Módulo 10 · Seguridad real con Keycloak"
level: "intermedio"
draft: false
---

# Integrando `api-gateway` como resource server JWT con Keycloak en NovaMarket

En la clase anterior dejamos algo bastante claro:

- el access token ya existe,
- el gateway es el primer gran candidato para validarlo,
- y el siguiente paso lógico ya no es seguir explicando teoría de JWT, sino empezar a hacer que el borde del sistema confíe de verdad en la infraestructura de identidad.

Ahora toca el paso concreto:

**integrar `api-gateway` como resource server JWT con Keycloak.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregado soporte de resource server JWT al gateway,
- configurada una primera conexión real con el issuer de Keycloak,
- creada una `SecurityWebFilterChain` razonable para este punto del proyecto,
- y NovaMarket mucho más cerca de proteger rutas reales con tokens emitidos por su infraestructura de identidad.

La meta de hoy no es todavía diseñar una política final de acceso para todo el sistema.  
La meta es mucho más concreta: **hacer que `api-gateway` deje de ser un borde que solo enruta y empiece a ser también un borde que valida JWT reales**.

---

## Estado de partida

Partimos de un sistema donde ya:

- Keycloak está funcionando dentro del entorno,
- existen usuarios, roles y tokens reales,
- y el módulo ya dejó claro por qué el gateway es el primer lugar natural para esta integración.

Eso significa que el problema ya no es conceptual.  
Ahora la pregunta útil es otra:

- **qué necesita exactamente `api-gateway` para actuar como resource server JWT dentro de NovaMarket**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- agregar la dependencia adecuada al gateway,
- configurar el `issuer-uri`,
- crear una primera `SecurityWebFilterChain`,
- levantar el servicio actualizado,
- y validar que el borde del sistema ya puede empezar a trabajar con tokens reales.

---

## Paso 1 · Agregar la dependencia correcta

Como `api-gateway` es una aplicación reactiva basada en WebFlux, una muy buena base para este paso es agregar la dependencia de **OAuth2 Resource Server**.

En Spring Boot, la forma más común y cómoda de arrancar es con:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

Ese starter es una pieza central del paso porque habilita el soporte necesario para que el gateway se comporte como un resource server JWT.

---

## Paso 2 · Entender qué más necesita el soporte JWT

Este punto importa muchísimo.

En el caso reactivo, el soporte de resource server para JWT también se apoya en la parte JOSE de Spring Security.

Lo importante para el curso es fijar esta idea:

- el gateway necesita la capacidad de **decodificar y verificar JWT**, no solo de leer un header.

Ese matiz es justamente lo que vuelve seria esta integración.

---

## Paso 3 · Configurar el `issuer-uri`

Ahora conviene decirle al gateway cuál es el emisor de confianza de los tokens.

Una forma muy natural de expresarlo puede ser algo como:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://keycloak:8080/realms/novamarket
```

O, si preferís seguir la línea que ya venís construyendo en el proyecto, algo parametrizado por variable de entorno, por ejemplo:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${KEYCLOAK_ISSUER_URI:http://localhost:8085/realms/novamarket}
```

La idea central de este paso es muy importante:

- el gateway necesita saber **de qué emisor acepta tokens**.

Ese es el corazón de la integración inicial.

---

## Paso 4 · Entender por qué `issuer-uri` importa tanto

Este punto vale muchísimo.

No estamos configurando una URL porque sí.

El `issuer-uri` cumple un rol fuerte porque ayuda a que el resource server:

- descubra configuración del emisor,
- ubique claves públicas para verificar firmas,
- y valide el `iss` claim de los JWT recibidos.

Ese matiz es uno de los más importantes de toda la clase, porque conecta directamente el contenido del token con la confianza del gateway en Keycloak.

---

## Paso 5 · Crear una primera `SecurityWebFilterChain`

Como `api-gateway` es reactivo, una configuración inicial razonable puede verse así:

```java
package com.novamarket.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
                        .pathMatchers("/actuator/health").permitAll()
                        .pathMatchers("/catalog/**").permitAll()
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt())
                .build();
    }
}
```

No hace falta que esta política sea la final del curso.

La meta de hoy es mucho más concreta:

- dejar algunas rutas abiertas si nos conviene,
- y empezar a exigir JWT real en el resto.

Ese primer recorte ya aporta muchísimo valor.

---

## Paso 6 · Entender qué está haciendo esta configuración

Conviene leerla con calma:

### `csrf().disable()`
En este punto del proyecto suele ser razonable si estamos pensando el gateway sobre APIs y bearer tokens.

### `authorizeExchange`
Define qué rutas quedan públicas y cuáles requieren autenticación.

### `.oauth2ResourceServer(oauth2 -> oauth2.jwt())`
Hace que el gateway empiece a tratar los bearer tokens como JWT que deben validarse.

Ese último punto es el corazón real de la clase.

---

## Paso 7 · Pensar bien las rutas públicas iniciales

A esta altura del curso, una política muy razonable puede ser algo como:

- dejar `actuator/health` público,
- dejar catálogo público si todavía queremos esa experiencia,
- y empezar a exigir autenticación en rutas más sensibles como órdenes.

No hace falta hoy cerrar toda la estrategia final de autorización.

Lo importante es que el gateway ya cambie de naturaleza:

- de borde que solo enruta
- a borde que además valida identidad real

Ese salto vale muchísimo.

---

## Paso 8 · Levantar nuevamente el gateway

Ahora reconstruí y levantá `api-gateway`.

Si forma parte del Compose, actualizá la imagen y levantá de nuevo el entorno correspondiente.

La idea es validar que el gateway ya no solo arranca con rutas, filtros y balanceo, sino también con soporte real de JWT.

Ese es uno de los momentos más importantes de la clase.

---

## Paso 9 · Probar una ruta protegida sin token

Ahora hacé una request a una ruta que decidiste dejar protegida.

Por ejemplo:

```bash
curl -i http://localhost:8080/order-api/orders
```

Lo esperable es que sin un bearer token válido el acceso no sea aceptado.

Este paso importa muchísimo porque muestra que el gateway ya dejó de ser ingenuo respecto de la autenticación.

---

## Paso 10 · Probar la misma ruta con un access token real

Ahora repetí la prueba usando el token obtenido desde Keycloak:

```bash
curl -i http://localhost:8080/order-api/orders \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

La respuesta exacta dependerá también de la lógica de la ruta y del método HTTP, pero lo importante es observar que:

- el gateway ya puede procesar el bearer token,
- el JWT ya no es un objeto teórico,
- y la identidad emitida por Keycloak ya empieza a influir en el borde del sistema.

Ese contraste entre request sin token y request con token es el corazón práctico de toda la clase.

---

## Paso 11 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, Keycloak ya emitía identidad real.

Ahora, en cambio, además existe una pieza muy importante del sistema que la reconoce y la valida:

- `api-gateway`

Eso cambia muchísimo la madurez del proyecto, porque la seguridad ya no vive solo en la infraestructura de identidad.  
Empieza a vivir también en el punto de entrada del sistema.

---

## Paso 12 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya cerró toda su seguridad real”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene su primer borde validando JWT reales emitidos por Keycloak.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase integra `api-gateway` como resource server JWT con Keycloak.

Ya no estamos solo emitiendo tokens ni leyendo claims.  
Ahora también estamos haciendo que el borde del sistema empiece a confiar de verdad en esa infraestructura de identidad y a usarla para proteger acceso real.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- distinguimos todavía acceso por roles concretos como `customer` y `admin`,
- ni propagamos aún identidad a otros servicios,
- ni consolidamos todavía este subbloque con un checkpoint fuerte.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**hacer que el gateway deje de ser solo un punto de entrada técnico y empiece a ser también una primera capa real de validación JWT.**

---

## Errores comunes en esta etapa

### 1. Configurar Keycloak y el gateway sin alinear bien el `issuer-uri`
Eso rompe una parte central de la validación.

### 2. Agregar la dependencia pero no la configuración de security
Entonces el gateway no cambia realmente de naturaleza.

### 3. Proteger todo de una sola vez sin dejar un recorte inicial claro
En esta etapa, una primera política simple y entendible vale muchísimo más.

### 4. No probar el contraste entre request sin token y con token
Ese es el corazón práctico de la clase.

### 5. Pensar que esto ya resuelve autorización fina por roles
Todavía estamos en una primera capa de validación e identidad autenticada.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- `api-gateway` ya actúa como resource server JWT,
- conoce el `issuer-uri` de Keycloak,
- puede exigir token en rutas protegidas,
- y NovaMarket ya dio un primer paso real hacia seguridad integrada en el borde del sistema.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el gateway ya tiene la dependencia y la configuración necesarias,
- existe una `SecurityWebFilterChain` razonable,
- las rutas protegidas reaccionan distinto con y sin token,
- y sentís que la identidad ya dejó de estar solo “en Keycloak” para empezar a influir de verdad en el acceso al sistema.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta primera integración real entre Keycloak y el borde del sistema.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera integración de `api-gateway` con JWT antes de pasar a autorización más fina basada en roles dentro de NovaMarket.

---

## Cierre

En esta clase integramos `api-gateway` como resource server JWT con Keycloak.

Con eso, NovaMarket deja de limitar la seguridad real a la emisión de tokens y empieza a hacer que el borde del sistema valide de verdad esas credenciales, convirtiendo la identidad emitida por Keycloak en una parte concreta y activa de la protección de rutas y del acceso al sistema.
