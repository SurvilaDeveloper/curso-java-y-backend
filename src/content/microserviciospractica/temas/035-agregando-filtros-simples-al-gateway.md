---
title: "Agregando filtros simples al gateway"
description: "Primer trabajo con lógica transversal en api-gateway. Incorporación de filtros simples para inspeccionar y enriquecer requests y responses en el punto de entrada de NovaMarket."
order: 35
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Agregando filtros simples al gateway

En las clases anteriores logramos algo muy importante:

- creamos `api-gateway`,
- definimos rutas hacia los microservicios principales,
- y validamos que NovaMarket ya puede usarse entrando por un único punto.

Ahora vamos a dar el siguiente paso natural dentro del gateway:

**agregar filtros simples.**

Hasta ahora, `api-gateway` funcionó como un router central.  
Eso ya tiene mucho valor, pero uno de los motivos principales por los que un gateway se vuelve tan útil en arquitecturas de microservicios es que también permite aplicar **lógica transversal**.

En esta clase vamos a introducir esa idea de forma práctica y controlada.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- al menos un filtro simple agregado al gateway,
- visible su efecto sobre requests o responses,
- comprobado que el gateway sigue enruntando correctamente,
- y entendida la idea de lógica transversal aplicada en el punto de entrada.

Todavía no vamos a meter seguridad.  
Primero queremos entender bien qué significa modificar o inspeccionar tráfico desde el gateway.

---

## Estado de partida

En este punto del curso deberíamos tener:

- `config-server` operativo,
- `discovery-server` operativo,
- `catalog-service`, `inventory-service` y `order-service` funcionando,
- `api-gateway` enruntando correctamente hacia ellos.

Además, ya deberíamos haber probado:

- `GET /products`
- `GET /inventory`
- `POST /orders`

entrando por el gateway.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear o configurar filtros simples en `api-gateway`,
- aplicar lógica técnica antes o después del reenvío,
- observar headers o datos agregados,
- y verificar que el sistema siga funcionando correctamente.

---

## Qué problema resuelven los filtros del gateway

Un gateway no sirve solo para redirigir requests.  
También es un lugar ideal para lógica transversal, por ejemplo:

- agregar headers,
- registrar información técnica,
- propagar metadata,
- normalizar ciertos comportamientos,
- o intervenir requests y responses de forma centralizada.

Eso es muy valioso porque evita repartir ciertas responsabilidades pequeñas en todos los microservicios.

---

## Qué tipo de filtro conviene agregar primero

Para esta etapa del curso práctico, conviene arrancar por algo simple y visible.

Una muy buena opción es agregar un header en la respuesta o en la request, porque:

- es fácil de implementar,
- fácil de verificar,
- y no rompe el comportamiento funcional del sistema.

Otra opción razonable sería loggear el path entrante, pero el header suele ser todavía más tangible para el alumno.

---

## Paso 1 · Elegir si vas a usar filtros declarativos o un filtro global simple

En Spring Cloud Gateway existen varias formas de trabajar con filtros.

Para esta primera introducción práctica, una buena opción es comenzar con un filtro global simple programático, porque deja muy claro:

- dónde vive la lógica,
- cuándo se ejecuta,
- y cómo impacta en el flujo.

Más adelante podrías explorar filtros declarativos por ruta, pero para esta clase el enfoque programático suele ser más didáctico.

---

## Paso 2 · Crear un filtro global simple

Dentro de `api-gateway`, podés crear una clase como esta:

```txt
src/main/java/com/novamarket/gateway/filter/RequestTraceFilter.java
```

Una implementación base razonable podría ser:

```java
package com.novamarket.gateway.filter;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class RequestTraceFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(org.springframework.web.server.ServerWebExchange exchange,
                             org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {

        String traceId = UUID.randomUUID().toString();

        ServerHttpRequest mutatedRequest = exchange.getRequest()
                .mutate()
                .header("X-Trace-Id", traceId)
                .build();

        exchange.getResponse().getHeaders().add("X-Trace-Id", traceId);

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
```

---

## Qué hace este filtro

Este filtro agrega un identificador simple de traza en dos lugares:

- como header de la request reenviada,
- y como header de la response devuelta al cliente.

Eso tiene mucho valor didáctico porque nos deja ver claramente que el gateway puede:

- interceptar tráfico,
- enriquecerlo,
- y devolver información adicional sin tocar directamente la lógica de los microservicios.

---

## Paso 3 · Revisar el paquete y la detección del filtro

Asegurate de que la clase quede dentro de un paquete escaneado por Spring Boot.

Por ejemplo:

```txt
com.novamarket.gateway.filter
```

Como la clase principal del gateway debería estar en el paquete raíz correspondiente, el filtro debería detectarse correctamente si está anotado con `@Component`.

---

## Paso 4 · Levantar `api-gateway`

Ahora toca reiniciar el gateway para que el nuevo filtro se cargue.

Conviene levantar antes, como siempre:

- `config-server`
- `discovery-server`
- y los servicios de negocio

y después arrancar `api-gateway`.

Queremos verificar que:

- el gateway siga levantando correctamente,
- el filtro no rompa el arranque,
- y el ruteo continúe operativo.

---

## Paso 5 · Probar una request simple y revisar headers

Ahora probá, por ejemplo:

```bash
curl -i http://localhost:8080/products
```

El uso de `-i` es importante porque queremos ver los headers de la respuesta.

La idea es comprobar que aparece algo como:

```txt
X-Trace-Id: ...
```

El valor exacto va a cambiar en cada request, y eso es correcto.

---

## Paso 6 · Probar otra request y verificar que el valor cambia

Probá otra vez:

```bash
curl -i http://localhost:8080/products/1
```

La idea es confirmar que el header vuelve a existir, pero con otro valor.

Eso refuerza la idea de que:

- el filtro se ejecuta por request,
- y el gateway puede inyectar metadata técnica de forma centralizada.

---

## Paso 7 · Probar también el flujo de órdenes

Ahora probá algo más representativo:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

Queremos comprobar dos cosas al mismo tiempo:

- que `POST /orders` sigue funcionando,
- y que el filtro también participa en ese flujo.

Si el header aparece y la orden se crea, la prueba es muy buena.

---

## Paso 8 · Mirar los logs del gateway

Aunque este filtro no imprime logs todavía, igual conviene mirar la consola del gateway después de introducir lógica transversal.

Queremos comprobar que:

- no aparezcan errores extraños,
- el filtro no rompa el flujo reactivo del gateway,
- y el componente se comporte de forma estable.

Este tipo de observación se vuelve importante a medida que el gateway va acumulando más responsabilidad.

---

## Qué estamos logrando con esta clase

Esta clase deja de forma muy visible una idea central:

**el gateway no solo enruta; también puede intervenir transversalmente sobre el tráfico.**

Ese concepto es muy importante porque después va a sostener cosas como:

- propagación de metadata,
- seguridad,
- observabilidad,
- o reglas técnicas de entrada.

Aunque el ejemplo de hoy sea simple, la idea de fondo es muy poderosa.

---

## Qué todavía no estamos haciendo

Todavía no:

- aplicamos filtros condicionados por ruta,
- hacemos reescritura de paths,
- propagamos tokens,
- ni usamos filtros para seguridad.

Todo eso puede venir después.

La meta de hoy es más concreta:

**entender y probar que el gateway ya puede agregar lógica transversal sin romper el sistema.**

---

## Errores comunes en esta etapa

### 1. Crear el filtro fuera del paquete escaneado
Entonces Spring no lo detecta.

### 2. Modificar la request o response de forma incorrecta
En un gateway reactivo, conviene hacerlo con cuidado para no romper el flujo.

### 3. No reiniciar el gateway después del cambio
Entonces el filtro no llega a cargarse.

### 4. Probar solo una ruta
Conviene verificar tanto lecturas como el flujo principal de órdenes.

### 5. Pensar que el header agregado “no sirve”
En realidad, sirve mucho como primer ejemplo práctico de lógica transversal.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `api-gateway` debería:

- seguir enruntando correctamente,
- ejecutar un filtro simple sobre cada request,
- y exponer una señal visible de esa lógica transversal, como un header agregado.

Eso deja bastante mejor preparado el bloque de gateway.

---

## Punto de control

Antes de seguir, verificá que:

- existe el filtro global,
- el gateway arranca correctamente con él,
- el header se ve en las responses,
- `GET /products` sigue funcionando,
- y `POST /orders` también sigue funcionando.

Si eso está bien, ya podemos hacer una verificación más fina del gateway y sus errores comunes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a revisar ruteo, filtros y problemas frecuentes del gateway.

La idea es consolidar bien este bloque antes de pasar a seguridad con Keycloak.

---

## Cierre

En esta clase agregamos el primer filtro simple al gateway.

Con eso, NovaMarket deja de tener un gateway que solo enruta y pasa a tener un gateway que ya empieza a aplicar lógica transversal visible sobre el tráfico.

Ese es un paso muy importante para lo que viene.
