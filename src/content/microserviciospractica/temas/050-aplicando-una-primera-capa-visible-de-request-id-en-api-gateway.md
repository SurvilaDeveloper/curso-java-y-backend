---
title: "Aplicando una primera capa visible de Request ID en api-gateway"
description: "Primer paso práctico del nuevo subtramo del módulo 6. Implementación de una mejora simple de trazabilidad visible en el gateway mediante un identificador por request."
order: 50
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Aplicando una primera capa visible de Request ID en `api-gateway`

En la clase anterior dejamos algo bastante claro:

- el gateway ya está listo para una primera capa de trazabilidad visible,
- no hace falta todavía saltar a una solución gigante de tracing distribuido,
- y lo más sano ahora es arrancar por una mejora simple, clara y muy observable.

Ahora toca el paso concreto:

**aplicar una primera capa visible de Request ID en `api-gateway`.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregado un identificador visible por request dentro del gateway,
- mucho más clara la relación entre request, logs y response,
- `api-gateway` mejor preparado para observabilidad básica,
- y NovaMarket con una primera mejora real de trazabilidad visible en el borde del sistema.

La meta de hoy no es construir tracing distribuido completo.  
La meta es mucho más concreta: **dejar una huella simple y reconocible para cada request que atraviesa el gateway**.

---

## Estado de partida

Partimos de un sistema donde ya:

- `api-gateway` enruta correctamente,
- balancea entre instancias cuando corresponde,
- tiene una primera capa de filtros,
- y ya puede observar y modificar tráfico tanto globalmente como por ruta.

Eso significa que el problema ya no es si el gateway puede intervenir.  
Ahora la pregunta útil es otra:

- **cómo usamos esa capacidad para hacer que cada request sea más reconocible y más fácil de seguir**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir una estrategia simple de identificación por request,
- implementarla en el gateway,
- dejar visible ese identificador en logs y en la response,
- probarlo contra distintas rutas,
- y validar qué nueva claridad gana el sistema después de esa mejora.

---

## Qué Request ID conviene usar en esta etapa

Para este punto del curso, una gran opción es:

- generar un identificador sencillo por request en el gateway,
- y devolverlo en un header de response, por ejemplo:

```txt
X-Request-Id
```

Ese nombre es suficientemente claro, ampliamente reconocible y muy fácil de probar con herramientas simples como `curl -i`.

También permite conectar muy bien esta primera mejora con una futura evolución más seria de trazabilidad.

---

## Paso 1 · Elegir dónde implementar esta lógica

Como queremos que el identificador se aplique de forma transversal a todo lo que entra por el gateway, lo más razonable es usar un **filtro global**.

Eso encaja perfecto con la idea de esta mejora:

- toda request debería quedar identificada
- no solo una ruta concreta

Este punto es importante porque conecta muy bien con la lógica del bloque anterior de filtros.

---

## Paso 2 · Crear o extender un filtro global para generar el Request ID

Podés crear una clase nueva o extender la ya existente si preferís mantener el gateway compacto.

Una opción bastante clara sería algo como:

```txt
src/main/java/com/novamarket/gateway/filter/RequestIdFilter.java
```

La idea es que el filtro:

1. genere un identificador simple
2. lo asocie a la request actual
3. lo loguee
4. y lo agregue a la response

---

## Paso 3 · Implementar una versión simple y visible

Una versión conceptual razonable podría verse así:

```java
package com.novamarket.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class RequestIdFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(RequestIdFilter.class);

    @Override
    public Mono<Void> filter(org.springframework.web.server.ServerWebExchange exchange,
                             org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {

        String requestId = UUID.randomUUID().toString();

        exchange.getAttributes().put("requestId", requestId);

        log.info("Gateway recibió requestId={} method={} path={}",
                requestId,
                exchange.getRequest().getMethod(),
                exchange.getRequest().getURI().getPath());

        return chain.filter(exchange)
                .then(Mono.fromRunnable(() ->
                        exchange.getResponse()
                                .getHeaders()
                                .add("X-Request-Id", requestId)));
    }

    @Override
    public int getOrder() {
        return -10;
    }
}
```

No hace falta sofisticarlo demasiado por ahora.

Lo importante es que:

- el Request ID exista,
- quede visible,
- y conecte request, logs y response.

---

## Paso 4 · Entender qué hace esta primera versión

Este filtro deja varias cosas muy valiosas:

### Antes de enrutar
- genera un ID
- lo registra en logs
- y lo asocia al intercambio actual

### Después de enrutar
- devuelve ese mismo ID en la response

Eso hace que ya puedas mirar una request y decir:

- “esta llamada pasó por el gateway con este identificador”

Ese cambio parece pequeño, pero vale muchísimo.

---

## Paso 5 · Levantar el entorno en orden

Como siempre, conviene sostener el entorno completo:

1. `config-server`
2. `discovery-server`
3. `catalog-service`
4. `inventory-service`
5. `order-service`
6. `api-gateway`

Queremos validar el filtro sobre el sistema real y no en una versión simplificada.

---

## Paso 6 · Probar catálogo y observar el Request ID

Ahora hacé una request como:

```bash
curl -i http://localhost:8080/catalog/products
```

Lo esperable es que en la response aparezca algo como:

```txt
X-Request-Id: 8c4b2d8f-...
```

No importa el valor exacto, sino que:

- exista,
- sea visible,
- y cambie entre una request y otra.

Ese es uno de los mejores momentos de la clase, porque vuelve observable de inmediato el nuevo rol del gateway.

---

## Paso 7 · Probar inventario y confirmar el mismo comportamiento

Ahora repetí con inventario:

```bash
curl -i http://localhost:8080/inventory/inventory
```

La response debería incluir también `X-Request-Id`.

Eso confirma que:

- la lógica es global,
- y cualquier request que atraviesa el gateway ya queda identificada con una marca visible.

---

## Paso 8 · Probar órdenes y validar que la mejora no rompe nada

Ahora probá una request de órdenes:

```bash
curl -i -X POST http://localhost:8080/order-api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

Lo esperable es que:

- la orden siga funcionando,
- el sistema no se rompa,
- y la response también incluya un `X-Request-Id`.

Esto confirma que la trazabilidad visible no interfiere con la lógica funcional del sistema.

---

## Paso 9 · Mirar los logs del gateway

Ahora mirá la consola de `api-gateway`.

Lo ideal es que veas líneas que indiquen algo como:

- `requestId=...`
- método HTTP
- path

Ese punto es muy importante, porque conecta por primera vez de manera explícita:

- request
- logs
- response

Esa conexión es justamente el corazón de la mejora que estamos construyendo.

---

## Paso 10 · Repetir una misma request y ver IDs distintos

Conviene hacer una prueba más:

```bash
curl -i http://localhost:8080/catalog/products
curl -i http://localhost:8080/catalog/products
```

Lo esperable es que cada request tenga un `X-Request-Id` distinto.

Eso confirma que:

- el identificador es por request,
- no es una constante global,
- y realmente está sirviendo como huella individual de cada paso por el gateway.

---

## Qué estamos logrando con esta clase

Esta clase hace un cambio pequeño en código, pero enorme en observabilidad básica.

Hasta acá el gateway ya enroutaba, balanceaba y filtraba.  
Ahora además empieza a dejar una huella visible y reutilizable de cada request.

Eso es un salto muy importante de madurez dentro del módulo.

---

## Qué todavía no hicimos

Todavía no:

- propagamos este Request ID hacia servicios downstream,
- ni lo conectamos con una estrategia más rica de logs,
- ni abrimos todavía un frente serio de tracing distribuido.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**dejar una primera capa visible de Request ID funcionando dentro de `api-gateway`.**

---

## Errores comunes en esta etapa

### 1. Generar el ID pero no devolverlo en la response
Entonces perdés la mejor parte visible de la mejora.

### 2. Devolver el header pero no loguearlo
Entonces request y logs no quedan bien conectados.

### 3. Usar un valor fijo en vez de uno por request
Eso vacía completamente el valor del ejemplo.

### 4. No probar más de una ruta
Conviene confirmar que el comportamiento es realmente global.

### 5. Confundir Request ID visible con trazabilidad distribuida completa
Este es un primer paso muy valioso, pero todavía inicial.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- cada request que entra por `api-gateway` recibe un identificador visible,
- ese identificador aparece en la response,
- también aparece en los logs del gateway,
- y el sistema ya ganó una primera capa concreta de trazabilidad visible en el borde.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el filtro genera un `X-Request-Id` nuevo por request,
- ese header aparece en distintas rutas del sistema,
- los logs muestran el mismo identificador,
- y la lógica funcional de NovaMarket sigue sana.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta primera capa de trazabilidad visible dentro del gateway.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de trazabilidad visible, leyendo con más claridad qué nueva postura ganó el gateway después de empezar a identificar requests de forma explícita.

---

## Cierre

En esta clase aplicamos una primera capa visible de Request ID en `api-gateway`.

Con eso, NovaMarket deja de tratar las requests del borde del sistema como tráfico anónimo y empieza a volverlas más identificables, más observables y mucho más fáciles de relacionar con logs y responses.
