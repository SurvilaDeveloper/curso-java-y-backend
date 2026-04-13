---
title: "Protegiendo endpoints de órdenes"
description: "Primer cierre real del acceso en NovaMarket. Configuración del gateway para exigir autenticación en rutas de órdenes y validación del comportamiento con y sin token."
order: 40
module: "Módulo 7 · Seguridad con Keycloak y JWT"
level: "intermedio"
draft: false
---

# Protegiendo endpoints de órdenes

En la clase anterior dejamos a `api-gateway` configurado como **Resource Server**.

Eso significó un paso muy importante: el gateway ya quedó preparado para validar tokens JWT emitidos por Keycloak.

Ahora sí vamos a usar esa capacidad para resolver el primer caso real de acceso controlado dentro de NovaMarket:

**proteger los endpoints de órdenes.**

La lógica detrás de esta decisión es muy razonable:

- consultar catálogo puede ser una operación relativamente abierta en esta etapa,
- consultar inventario también puede seguir abierta por ahora,
- pero **crear órdenes** ya es una acción mucho más natural para exigir autenticación.

Esta clase marca el primer cierre real del acceso al sistema.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- protegida la ruta de órdenes en el gateway,
- permitido el acceso a otras rutas según el diseño actual,
- verificado que sin token no se puede crear una orden,
- y comprobado que con token válido el flujo sí funciona.

---

## Estado de partida

Partimos de este contexto:

- Keycloak ya está levantado,
- existe un realm `novamarket`,
- existe un cliente de prueba,
- existe un usuario de prueba,
- y `api-gateway` ya sabe validar JWT como Resource Server.

Sin embargo, hoy el gateway todavía permite entrar libremente a todas las rutas.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- ajustar la configuración de seguridad del gateway,
- declarar rutas públicas y rutas protegidas,
- bloquear acceso anónimo a órdenes,
- probar el comportamiento sin token,
- y dejar listo el sistema para que en la próxima clase empecemos a trabajar con el flujo autenticado completo.

---

## Qué criterio de protección vamos a usar

Para esta etapa del curso práctico, una decisión muy razonable es esta:

### Rutas que siguen públicas por ahora
- catálogo
- inventario

### Ruta que pasa a estar protegida
- órdenes

Eso nos permite introducir seguridad real sin cerrar todo el sistema de golpe.

Además, tiene bastante sentido desde el punto de vista del negocio:  
no cualquier request anónima debería poder crear órdenes.

---

## Paso 1 · Ajustar la configuración de seguridad del gateway

Ahora vamos a modificar `SecurityConfig` dentro de `api-gateway`.

Una versión razonable para esta etapa podría ser:

```java
package com.novamarket.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchange -> exchange
                        .pathMatchers(HttpMethod.GET, "/products/**").permitAll()
                        .pathMatchers(HttpMethod.GET, "/inventory/**").permitAll()
                        .pathMatchers("/orders/**").authenticated()
                        .anyExchange().permitAll()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt())
                .build();
    }
}
```

---

## Qué expresa esta configuración

Con esta configuración estamos diciendo:

- cualquiera puede consultar productos,
- cualquiera puede consultar inventario,
- pero las rutas de órdenes requieren un usuario autenticado con token válido.

Eso ya representa una política de acceso real dentro del sistema.

---

## Paso 2 · Reiniciar el gateway

Ahora reiniciá `api-gateway`.

Queremos que tome la nueva configuración de seguridad y quede listo para empezar a bloquear el acceso anónimo a órdenes.

Conviene mantener arriba también:

- `config-server`
- `discovery-server`
- Keycloak
- `catalog-service`
- `inventory-service`
- `order-service`

La idea es probar el sistema real, no componentes aislados.

---

## Paso 3 · Verificar que catálogo e inventario sigan públicos

Antes de probar órdenes, confirmemos que no cerramos cosas por error.

Probá:

```bash
curl http://localhost:8080/products
```

Y también:

```bash
curl http://localhost:8080/inventory
```

Ambas rutas deberían seguir respondiendo normalmente sin necesidad de token.

Esto es importante porque confirma que la política de acceso quedó bien delimitada.

---

## Paso 4 · Probar `POST /orders` sin token

Ahora sí, probemos la ruta protegida sin autenticación.

Ejecutá:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

La respuesta esperada ya no debería ser la creación de la orden.

Ahora deberíamos obtener una respuesta de rechazo por falta de autenticación.

El código exacto puede variar según configuración y flujo del entorno, pero conceptualmente el punto importante es este:

**sin token, no debe pasar.**

---

## Paso 5 · Confirmar que el bloqueo ocurre en el gateway

Este detalle es muy importante.

Queremos que el rechazo ocurra en el gateway, no recién dentro de `order-service`.

Eso significa que el punto de entrada ya está asumiendo su nuevo rol de control de acceso.

Desde el punto de vista de arquitectura, esto es muy valioso porque:

- concentra la seguridad,
- evita tráfico innecesario hacia adentro,
- y deja una frontera mucho más clara.

---

## Paso 6 · Revisar logs del gateway

Después de la prueba sin token, mirá la consola de `api-gateway`.

Queremos observar que:

- la request llegó,
- fue interceptada por la seguridad del gateway,
- y no siguió normalmente hacia el servicio interno.

Este paso ayuda mucho a entender dónde está ocurriendo realmente el bloqueo.

---

## Paso 7 · Revisar que `order-service` no procese la request anónima

Si el bloqueo se está haciendo donde corresponde, `order-service` no debería comportarse como si hubiera recibido una orden válida.

Conviene mirar también sus logs para confirmar que la seguridad ya está filtrando antes de llegar a la lógica del servicio.

---

## Paso 8 · Preparar el terreno para la prueba con token

En esta clase todavía no hace falta hacer toda la obtención del token paso a paso si querés dejar ese flujo completo para la siguiente.

Pero sí conviene tener claro que el siguiente paso lógico será:

- autenticarse contra Keycloak,
- obtener un JWT válido,
- y reintentar `POST /orders` incluyendo ese token.

Eso va a cerrar de forma mucho más completa el bloque.

---

## Paso 9 · Qué resultado mínimo queremos al terminar hoy

Para considerar esta clase correcta, necesitamos al menos esto:

- las rutas públicas siguen públicas,
- las rutas de órdenes ahora requieren autenticación,
- y el gateway ya está ejerciendo control real de acceso.

Eso ya es un cambio arquitectónico muy fuerte respecto del estado anterior del proyecto.

---

## Qué estamos logrando con esta clase

Con esta clase, NovaMarket deja de ser un sistema donde el gateway solo enruta y valida “potencialmente” tokens, y pasa a ser un sistema donde el gateway:

- diferencia rutas públicas de rutas privadas,
- impide acceso anónimo a una parte sensible del flujo,
- y empieza a comportarse como frontera real de seguridad.

Ese es uno de los hitos más importantes del curso hasta ahora.

---

## Qué todavía no hicimos

Todavía no:

- mostramos el flujo completo de obtención y uso de token,
- propagamos identidad hacia servicios internos,
- ni configuramos los microservicios como Resource Servers.

Todo eso viene enseguida.

La meta de hoy es más concreta:

**cerrar por primera vez el acceso a una parte real del sistema.**

---

## Errores comunes en esta etapa

### 1. Cerrar más rutas de las que querías
Conviene probar catálogo e inventario para confirmarlo.

### 2. Dejar `/orders` todavía abierta por una regla demasiado permisiva
Hay que revisar bien el orden y la especificidad de los matchers.

### 3. Creer que el rechazo está ocurriendo en `order-service`
El ideal es que se produzca en el gateway.

### 4. No reiniciar el gateway después del cambio
Entonces seguís probando con una política de seguridad vieja.

### 5. Pensar que ya está resuelto todo el bloque de seguridad
Todavía falta el flujo autenticado completo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería tener:

- catálogo e inventario todavía accesibles sin autenticación,
- y órdenes protegidas detrás del gateway.

Eso significa que el sistema ya tiene su primera frontera real de seguridad funcionando.

---

## Punto de control

Antes de seguir, verificá que:

- `GET /products` sigue funcionando sin token,
- `GET /inventory` sigue funcionando sin token,
- `POST /orders` ya no funciona sin token,
- y el bloqueo se produce en el gateway.

Si eso está bien, ya estamos listos para el siguiente paso clave: probar el flujo autenticado real con JWT.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a trabajar con el token de Keycloak y el flujo autenticado completo.

Ese será el momento en que NovaMarket demuestre de verdad que puede proteger el acceso y habilitar operaciones solo para usuarios autenticados.

---

## Cierre

En esta clase protegimos por primera vez una parte real de la arquitectura.

Con eso, `api-gateway` deja de ser solo una puerta de entrada técnica y empieza a convertirse en una frontera efectiva de control de acceso dentro de NovaMarket.
