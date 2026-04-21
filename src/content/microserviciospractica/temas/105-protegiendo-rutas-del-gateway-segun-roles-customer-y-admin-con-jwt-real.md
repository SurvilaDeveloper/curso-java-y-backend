---
title: "Protegiendo rutas del gateway según roles customer y admin con JWT real"
description: "Primer paso práctico del siguiente subtramo del módulo 10. Mapeo de roles del JWT a authorities útiles y protección de rutas reales del gateway según perfiles customer y admin."
order: 105
module: "Módulo 10 · Seguridad real con Keycloak"
level: "intermedio"
draft: false
---

# Protegiendo rutas del gateway según roles `customer` y `admin` con JWT real

En la clase anterior dejamos algo bastante claro:

- validar un JWT no alcanza por sí solo para autorización fina,
- los roles del token tienen que convertirse en algo utilizable por Spring Security,
- y el siguiente paso lógico ya no es seguir hablando de claims, sino empezar a proteger rutas reales según perfiles concretos del sistema.

Ahora toca el paso concreto:

**proteger rutas del gateway según roles `customer` y `admin` usando JWT real emitido por Keycloak.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la traducción entre roles presentes en el token y authorities útiles dentro del gateway,
- configurado un mapeo razonable para `customer` y `admin`,
- protegidas algunas rutas reales con reglas distintas,
- y NovaMarket mucho más cerca de una autorización real en el borde del sistema.

La meta de hoy no es todavía cerrar toda la seguridad del stack.  
La meta es mucho más concreta: **hacer que el gateway use los roles del JWT para decidir acceso real a rutas concretas del sistema**.

---

## Estado de partida

Partimos de un sistema donde ya:

- Keycloak emite JWT reales,
- `api-gateway` ya actúa como resource server,
- el token ya fue inspeccionado,
- y el módulo ya dejó claro por qué roles y authorities no pueden seguir siendo solo una idea abstracta.

Eso significa que el problema ya no es cómo obtener o validar el JWT.  
Ahora la pregunta útil es otra:

- **cómo convertimos ese contenido en reglas reales de acceso dentro del gateway**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- definir una estrategia simple de mapeo de roles,
- crear o ajustar un convertidor para extraer roles del JWT,
- traducirlos a authorities útiles,
- modificar la `SecurityWebFilterChain`,
- y validar acceso distinto según perfiles `customer` y `admin`.

---

## Qué estrategia conviene usar primero

A esta altura del curso, una decisión muy razonable suele ser algo como:

- tomar roles del token,
- transformarlos a una convención clara,
- y trabajar con reglas simples pero muy visibles.

Por ejemplo, podríamos usar una convención como:

- `ROLE_customer`
- `ROLE_admin`

No hace falta todavía una arquitectura gigantesca de permisos.

Lo importante es que exista una traducción real y consistente entre:

- rol emitido por Keycloak
- y regla utilizable dentro del gateway

Ese criterio es muy sano.

---

## Paso 1 · Definir qué rutas queremos distinguir

Para esta etapa del curso, una separación muy razonable podría verse así:

- rutas públicas:
  - catálogo
  - health
- rutas para autenticados o clientes:
  - operaciones ligadas a órdenes
- rutas administrativas:
  - futuros endpoints de administración o de gestión más sensible

No hace falta que todas existan ya con su versión final.  
La meta es algo más concreta:

- que la política de acceso ya empiece a reflejar perfiles reales del sistema.

---

## Paso 2 · Crear un convertidor de roles del JWT

En Spring Security, una muy buena opción suele ser construir un convertidor que lea el JWT y extraiga roles desde claims como:

- `realm_access.roles`

A partir de ahí, podemos transformarlos a authorities.

Conceptualmente, la idea es:

1. leer la lista de roles del token
2. convertir cada rol en una authority
3. devolver esa colección para que Spring Security la use en la autenticación

No hace falta hacer una solución monstruosa.  
Queremos algo claro, visible y útil.

---

## Paso 3 · Ejemplo de convertidor

Una versión razonable y didáctica podría verse así:

```java
package com.novamarket.gateway.config;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

public class RealmRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess == null || realmAccess.get("roles") == null) {
            return List.of();
        }

        List<String> roles = (List<String>) realmAccess.get("roles");

        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());
    }
}
```

Este código ya tiene muchísimo valor porque hace visible exactamente el puente entre:

- claim del token
- y authority usada por el gateway

Ese es uno de los corazones prácticos de toda la clase.

---

## Paso 4 · Conectar el convertidor con el gateway

Ahora necesitamos que `api-gateway` use ese convertidor al procesar el JWT.

Una forma razonable en WebFlux puede verse así:

```java
package com.novamarket.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;

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
                        .pathMatchers("/order-api/**").hasRole("customer")
                        .pathMatchers("/admin/**").hasRole("admin")
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(grantedAuthoritiesExtractor())))
                .build();
    }

    @Bean
    Converter<Jwt, Mono<AbstractAuthenticationToken>> grantedAuthoritiesExtractor() {
        RealmRoleConverter delegate = new RealmRoleConverter();
        return jwt -> Mono.just(new JwtAuthenticationToken(jwt, delegate.convert(jwt)));
    }
}
```

No hace falta que esta sea la versión final definitiva del curso.  
Lo importante es que:

- el mapeo exista,
- y las reglas de acceso ya empiecen a depender de roles reales emitidos por Keycloak.

---

## Paso 5 · Entender qué está haciendo esta configuración

Conviene leerla con calma:

### `RealmRoleConverter`
Lee roles desde el JWT y los convierte a authorities.

### `hasRole("customer")`
Protege rutas esperando una authority como `ROLE_customer`.

### `hasRole("admin")`
Hace lo mismo para el perfil administrador.

### `jwtAuthenticationConverter(...)`
Hace que el gateway use nuestro criterio de mapeo en vez de quedarse con el procesamiento por defecto sin adaptarlo a lo que nos conviene.

Ese último punto importa muchísimo.

---

## Paso 6 · Levantar nuevamente el gateway

Ahora reconstruí y levantá de nuevo `api-gateway`.

La idea es que el sistema ya no solo valide si el token es correcto, sino también que empiece a usar los roles concretos que trae ese token para decidir acceso.

Ese es uno de los momentos más importantes de la clase.

---

## Paso 7 · Probar una ruta protegida con usuario `customer`

Ahora pedí un token para `cliente.demo` y hacé una request a algo como:

```bash
curl -i http://localhost:8080/order-api/orders \
  -H "Authorization: Bearer TU_TOKEN_CUSTOMER"
```

Lo esperable es que el gateway reconozca el JWT, extraiga el rol `customer` y permita el acceso a esta clase de ruta protegida para ese perfil.

Ese paso importa muchísimo porque muestra por primera vez autorización basada en rol real.

---

## Paso 8 · Probar una ruta administrativa con usuario `customer`

Ahora intentá algo como:

```bash
curl -i http://localhost:8080/admin/health \
  -H "Authorization: Bearer TU_TOKEN_CUSTOMER"
```

Lo importante no es tanto el endpoint exacto, sino el comportamiento esperado:

- `customer` no debería entrar a una ruta que reservamos para `admin`.

Ese contraste es el corazón práctico de la clase.

---

## Paso 9 · Repetir la prueba con `admin`

Ahora obtené un token para `admin.demo` y repetí la prueba sobre la ruta administrativa.

La idea es observar que:

- el mismo gateway,
- con el mismo flujo JWT,
- ya distingue identidades con distinto nivel de acceso según roles emitidos por Keycloak.

Ese momento vale muchísimo porque es una de las primeras pruebas reales de autorización fina dentro de NovaMarket.

---

## Paso 10 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, el gateway ya validaba tokens.

Ahora, en cambio, además ya puede decir algo mucho más fuerte:

- “este token no solo es válido”
- también
- “este usuario tiene este rol y por lo tanto puede o no puede entrar acá”

Ese salto cambia muchísimo la madurez del sistema.

---

## Paso 11 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya cerró toda la autorización del sistema”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene su primera capa real de autorización por roles en el gateway usando JWT emitidos por Keycloak.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase protege rutas del gateway según roles `customer` y `admin` usando JWT real.

Ya no estamos solo validando credenciales.  
Ahora también estamos haciendo que el borde del sistema use los roles del token para tomar decisiones reales de acceso.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos todavía este subbloque con un checkpoint fuerte,
- ni decidimos aún si conviene seguir bajando seguridad a servicios internos o pasar al siguiente gran bloque del roadmap.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**hacer que el gateway pase de autenticación real a autorización real basada en roles emitidos por Keycloak.**

---

## Errores comunes en esta etapa

### 1. Validar JWT pero no mapear bien roles a authorities
Entonces las reglas `hasRole` pueden no reflejar lo que trae el token.

### 2. Escribir reglas por roles sin revisar de dónde salen esos roles en el JWT
La traducción del claim importa muchísimo.

### 3. Probar solo un usuario y no comparar `customer` contra `admin`
La comparación es parte central del valor de la clase.

### 4. Querer resolver toda la matriz de permisos del sistema en esta etapa
Una primera capa clara vale muchísimo más.

### 5. No ver el salto arquitectónico del cambio
Ahora el borde del sistema ya autoriza según identidad real y no solo autentica.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- el gateway ya mapea roles del JWT a authorities útiles,
- algunas rutas ya distinguen entre `customer` y `admin`,
- y NovaMarket ya dio un primer paso serio hacia autorización real en el borde del sistema.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el JWT ya se convierte a authorities útiles,
- las reglas por roles funcionan de forma visible,
- existe una diferencia real entre `customer` y `admin` al acceder a rutas protegidas,
- y sentís que NovaMarket ya dejó de quedarse en autenticación para empezar a trabajar autorización real.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta nueva capa de seguridad del sistema.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de autorización real por roles en el gateway antes de decidir si seguimos con seguridad interna o pasamos al siguiente gran bloque del roadmap rehecho.

---

## Cierre

En esta clase protegimos rutas del gateway según roles `customer` y `admin` usando JWT real emitido por Keycloak.

Con eso, NovaMarket deja de limitar la seguridad del borde a autenticación de tokens válidos y empieza a sostener una autorización real basada en perfiles concretos de usuario, directamente extraídos de la infraestructura de identidad del sistema.
