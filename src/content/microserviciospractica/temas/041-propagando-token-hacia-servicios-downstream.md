---
title: "Propagando token hacia servicios downstream"
description: "Continuación del bloque de seguridad en NovaMarket. Propagación del token desde api-gateway hacia los servicios internos para mantener contexto de identidad a lo largo del flujo."
order: 41
module: "Módulo 7 · Seguridad con Keycloak y JWT"
level: "intermedio"
draft: false
---

# Propagando token hacia servicios downstream

En la clase anterior logramos un primer cierre real de acceso en NovaMarket:

- `api-gateway` quedó configurado como **Resource Server**,
- y la ruta de órdenes empezó a exigir autenticación.

Eso ya tiene muchísimo valor, pero todavía nos falta una parte importante para que la seguridad distribuida empiece a parecerse más a una arquitectura real:

**propagar el token hacia los servicios internos cuando corresponda.**

¿Por qué importa esto?

Porque si el gateway valida identidad, pero los servicios internos nunca reciben contexto del usuario, entonces más adelante se vuelve más difícil:

- auditar quién hizo una operación,
- aplicar reglas más finas,
- o permitir que los servicios internos también entiendan la identidad del request.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- el gateway reenviando el token hacia downstream en los flujos protegidos,
- el request manteniendo contexto de identidad hacia los servicios internos,
- y lista la base para que más adelante los microservicios también puedan validar o usar esa identidad.

Todavía no vamos a cerrar todos los servicios internos.  
Primero queremos que el token viaje correctamente desde el punto de entrada hacia adentro.

---

## Estado de partida

Partimos de este contexto:

- Keycloak ya está levantado,
- existe un realm `novamarket`,
- existe un cliente de prueba,
- existe un usuario de prueba,
- `api-gateway` ya valida JWT,
- y la ruta de órdenes ya exige autenticación.

Hoy, sin embargo, lo importante es notar esto:

**el gateway ya controla acceso, pero todavía no necesariamente está reenviando el token al servicio interno de forma explícita y confiable.**

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar el comportamiento actual del gateway,
- configurar el reenvío del header `Authorization`,
- verificar que el token llegue al servicio downstream,
- y dejar listo el entorno para que los microservicios empiecen a comportarse también como Resource Servers.

---

## Qué significa propagar el token

Significa que, después de que el gateway reciba un request con algo como:

```txt
Authorization: Bearer <token>
```

ese mismo contexto de autorización no se pierda al reenviar la request al microservicio de destino.

En otras palabras:

- el cliente manda el token al gateway,
- el gateway lo valida,
- y luego también lo reenvía al servicio interno para que ese servicio pueda conocer o validar la identidad si lo necesita.

---

## Por qué esto importa aunque el gateway ya valide

Podría parecer que si el gateway ya controló el acceso, entonces alcanza.

Pero en sistemas distribuidos reales suele ser importante que los servicios internos también tengan contexto del usuario, por ejemplo para:

- logging enriquecido,
- auditoría,
- autorización más específica,
- trazabilidad del autor de una acción,
- o comportamiento condicionado por claims del token.

Esta clase prepara exactamente esa posibilidad.

---

## Paso 1 · Revisar si el gateway ya está recibiendo el header `Authorization`

Antes de tocar nada, conviene tener claro el flujo actual.

El cliente externo debería estar mandando algo como:

```txt
Authorization: Bearer <jwt>
```

al gateway.

El primer paso práctico de esta clase es confirmar que esa parte del flujo existe y que el gateway está recibiendo el token correctamente cuando una ruta protegida es llamada.

---

## Paso 2 · Incorporar un filtro específico para reenvío o inspección del token

En algunos escenarios, el gateway ya deja pasar el header `Authorization` naturalmente.  
Pero para el curso práctico conviene dejar la intención explícita y observable.

Una opción muy clara es crear un filtro que:

- inspeccione si existe el header `Authorization`,
- y se asegure de que forme parte de la request reenviada.

Podés crear algo como:

```txt
src/main/java/com/novamarket/gateway/filter/AuthHeaderRelayFilter.java
```

Una implementación simple y didáctica podría ser:

```java
package com.novamarket.gateway.filter;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class AuthHeaderRelayFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(org.springframework.web.server.ServerWebExchange exchange,
                             org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {

        String authorization = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authorization == null || authorization.isBlank()) {
            return chain.filter(exchange);
        }

        ServerHttpRequest mutatedRequest = exchange.getRequest()
                .mutate()
                .header(HttpHeaders.AUTHORIZATION, authorization)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        return 1;
    }
}
```

---

## Qué valor tiene este filtro aunque el comportamiento parezca obvio

En algunas configuraciones el reenvío del header puede parecer “natural”, pero para el curso práctico tiene mucho valor dejarlo explícito porque:

- el alumno ve claramente dónde vive la decisión,
- se entiende que el gateway controla el tráfico hacia adentro,
- y queda mejor preparado para variantes futuras como token relay más sofisticado.

Además, deja el concepto muy claro:  
**la identidad no debería perderse en el borde del sistema.**

---

## Paso 3 · Crear una forma simple de verificar el header en `order-service`

Para probar que el token efectivamente llega, conviene agregar temporalmente una verificación sencilla en `order-service`.

Por ejemplo, en el controlador de órdenes, podés recibir el header `Authorization` y loggearlo o exponerlo de manera controlada para pruebas.

Una versión simple podría ser:

```java
@PostMapping
public ResponseEntity<?> createOrder(
        @Valid @RequestBody CreateOrderRequest request,
        @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {

    System.out.println("Authorization header recibido en order-service: " + authorizationHeader);

    try {
        Order order = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(order));
    } catch (IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}
```

No hace falta que esta impresión quede para siempre en el proyecto.  
En esta clase sirve como mecanismo muy claro de verificación.

---

## Paso 4 · Reiniciar `api-gateway` y `order-service`

Después de agregar el filtro y la verificación, reiniciá:

- `api-gateway`
- `order-service`

Además, asegurate de tener arriba:

- Keycloak
- `config-server`
- `discovery-server`

La idea es que el entorno completo del bloque de seguridad esté listo para la prueba real.

---

## Paso 5 · Obtener un token válido

Para esta clase necesitás un JWT real emitido por Keycloak.

Todavía no hace falta que el curso entre en todos los detalles del flujo de obtención si querés reservar una explicación más cerrada para la siguiente clase, pero sí necesitás contar con un token válido de tu usuario de prueba.

La idea es que el request protegido ya se haga con ese token.

---

## Paso 6 · Llamar a `POST /orders` con token

Ahora ejecutá una orden autenticada pasando el header `Authorization`.

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

La expectativa de esta clase no es solo que el gateway deje pasar la request.  
También queremos ver que el servicio interno reciba el header.

---

## Paso 7 · Revisar logs de `order-service`

Ahora mirá la consola de `order-service`.

Si todo salió bien, deberías ver impreso algo equivalente al header `Authorization` recibido.

No hace falta mostrar el token completo en un entorno serio de logs productivos, pero para esta etapa del curso práctico es una forma muy clara de validar que el contexto de identidad ya está llegando al servicio downstream.

---

## Paso 8 · Confirmar qué parte del flujo ya resolvimos

Después de esta prueba, conviene reconocer qué quedó resuelto:

- el usuario obtiene un token,
- el gateway valida ese token,
- el request autenticado entra al sistema,
- y el token ya no se pierde al cruzar el gateway.

Eso deja mucho mejor preparado el bloque de seguridad para el siguiente paso.

---

## Qué estamos logrando con esta clase

Esta clase convierte a la seguridad del sistema en algo más distribuido y menos concentrado únicamente en el borde.

El gateway sigue siendo la frontera principal, pero ahora además el request protegido ya lleva contexto de identidad hacia adentro.

Ese matiz es muy importante para la arquitectura que estamos construyendo.

---

## Qué todavía no hicimos

Todavía no:

- configuramos `order-service` como Resource Server,
- protegimos servicios internos por sí mismos,
- ni usamos claims del token dentro de los microservicios.

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**que el token ya viaje correctamente desde el gateway hacia los servicios internos.**

---

## Errores comunes en esta etapa

### 1. Probar con un request sin token
En ese caso no vas a poder verificar propagación.

### 2. Creer que validar en el gateway equivale automáticamente a propagar contexto
No siempre conviene asumirlo; esta clase existe justamente para dejarlo claro.

### 3. No reiniciar el gateway después de agregar el filtro
Entonces seguís probando con el comportamiento anterior.

### 4. No revisar logs del servicio downstream
La verificación más clara de esta clase suele aparecer ahí.

### 5. Dejar logs sensibles permanentes
Para esta etapa está bien como herramienta didáctica, pero más adelante conviene limpiar o suavizar esas trazas.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías haber confirmado que:

- el request autenticado entra por el gateway,
- el token es validado,
- y el servicio downstream recibe el header de autorización.

Eso deja preparada la base para endurecer también los microservicios internos.

---

## Punto de control

Antes de seguir, verificá que:

- existe el filtro de relay o una estrategia equivalente,
- `POST /orders` funciona con token válido,
- `order-service` recibe el header `Authorization`,
- y el entorno de seguridad ya se comporta de forma más distribuida.

Si eso está bien, ya podemos pasar a configurar los microservicios como Resource Servers.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a configurar los microservicios internos como Resource Servers.

Ese será un paso importante porque la seguridad dejará de vivir solo en el gateway y empezará a existir también dentro de los servicios.

---

## Cierre

En esta clase propagamos el token hacia los servicios downstream.

Con eso, NovaMarket ya no solo valida identidad en el borde, sino que también empieza a mantener contexto de seguridad a lo largo del flujo interno del sistema.
