---
title: "Aplicando un primer filtro global simple en api-gateway"
description: "Primer paso práctico del nuevo tramo del módulo 6. Implementación de un filtro global simple y visible en api-gateway para dejar una huella clara del paso por el gateway."
order: 45
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Aplicando un primer filtro global simple en `api-gateway`

En la clase anterior dejamos algo bastante claro:

- el gateway ya no es solo un punto de ruteo,
- el módulo ya está listo para empezar a trabajar con filtros,
- y lo más sano ahora es arrancar por algo **simple, visible y didáctico**.

Ahora toca el paso concreto:

**aplicar un primer filtro global simple en `api-gateway`.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- implementado un primer filtro global dentro de `api-gateway`,
- visible que toda request que atraviesa el gateway pasa por esa pieza,
- más claro el rol del gateway como punto de procesamiento transversal,
- y el proyecto listo para seguir avanzando con filtros un poco más ricos después.

La meta de hoy no es construir una capa compleja de seguridad o auditoría.  
La meta es mucho más concreta: **hacer visible que el gateway ya puede intervenir activamente en el tráfico que atraviesa el sistema**.

---

## Estado de partida

Partimos de un sistema que ya:

- tiene `api-gateway`,
- enruta correctamente hacia `catalog-service`, `inventory-service` y `order-service`,
- usa discovery y balanceo,
- y ya dejó atrás el modelo de acceso por puertos internos fijos.

Eso significa que el problema ya no es si el gateway funciona.

Ahora la pregunta útil es otra:

- **cómo empezamos a hacerlo participar de forma visible en el procesamiento del tráfico**

Y esa pregunta es justamente la que vamos a convertir en una mejora real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir un primer filtro muy simple,
- implementarlo como filtro global,
- hacer que deje una señal visible en la response,
- probarlo entrando por el gateway,
- y confirmar que su comportamiento es transversal a las rutas que ya existen.

---

## Qué filtro conviene elegir como primer paso

Para esta etapa del curso, una gran primera opción es algo como esto:

- **agregar un header de respuesta indicando que la request pasó por `api-gateway`**

¿Por qué conviene esto?

Porque es:

- fácil de implementar,
- fácil de observar,
- no rompe lógica de negocio,
- no depende del contrato interno de cada servicio,
- y deja una huella muy clara del papel del gateway.

Ese equilibrio lo vuelve ideal para inaugurar el bloque de filtros.

---

## Qué significa que sea un filtro global

Este punto importa mucho.

Un filtro global no se aplica a una sola ruta específica.  
Se aplica de forma transversal al tráfico que pasa por el gateway.

Eso significa que, una vez activo, debería afectar de forma equivalente a requests como:

- `/catalog/products`
- `/inventory/inventory`
- `/order-api/orders`

Ese carácter transversal es justamente parte del valor de trabajar con el gateway.

---

## Paso 1 · Crear una clase para el filtro

Dentro de `api-gateway`, podés crear una clase como:

```txt
src/main/java/com/novamarket/gateway/filter/GatewayTraceFilter.java
```

El nombre exacto puede variar, pero conviene que deje bastante claro su propósito.

La idea es que el código del gateway siga ordenado y que el bloque de filtros empiece a vivir en su propio paquete.

---

## Paso 2 · Implementar una versión simple del filtro

Una versión razonable y muy didáctica de este primer filtro puede hacer dos cosas:

1. dejar un log simple cuando entra la request
2. agregar un header en la response antes de devolverla

Por ejemplo, una versión conceptual podría verse así:

```java
package com.novamarket.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class GatewayTraceFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(GatewayTraceFilter.class);

    @Override
    public Mono<Void> filter(org.springframework.web.server.ServerWebExchange exchange,
                             org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {

        ServerHttpRequest request = exchange.getRequest();
        log.info("Gateway recibió {} {}", request.getMethod(), request.getURI().getPath());

        return chain.filter(exchange)
                .then(Mono.fromRunnable(() ->
                        exchange.getResponse()
                                .getHeaders()
                                .add("X-NovaMarket-Gateway", "api-gateway")));
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
```

No hace falta obsesionarse con sofisticación en esta primera versión.  
Lo importante es que:

- el filtro exista,
- sea claramente visible,
- y participe en todas las requests.

---

## Paso 3 · Entender qué hace este filtro

Este primer filtro global hace algo muy simple pero muy valioso:

### Antes del ruteo
- observa la request
- registra método y path

### Después del ruteo
- agrega un header a la response

Eso ya deja dos señales concretas de que el gateway está participando activamente:

- una en logs
- otra en la respuesta HTTP

Ese doble efecto es ideal para una primera clase práctica de filtros.

---

## Paso 4 · Levantar la infraestructura en orden

Como siempre, conviene mantener el orden:

1. `config-server`
2. `discovery-server`
3. `catalog-service`
4. `inventory-service`
5. `order-service`
6. `api-gateway`

No porque el filtro dependa directamente de todos, sino porque queremos probarlo en el entorno real donde el gateway ya enruta.

---

## Paso 5 · Probar catálogo entrando por el gateway

Ahora hacé una request como:

```bash
curl -i http://localhost:8080/catalog/products
```

Conviene usar `-i` para ver también los headers de la response.

Lo que queremos observar es que, además de la respuesta habitual del catálogo, aparezca algo como:

```txt
X-NovaMarket-Gateway: api-gateway
```

Ese es uno de los mejores momentos de toda la clase, porque deja visible de inmediato que el filtro está funcionando.

---

## Paso 6 · Probar inventario entrando por el gateway

Ahora repetí con inventario:

```bash
curl -i http://localhost:8080/inventory/inventory
```

La respuesta debería seguir funcionando como antes, pero ahora también debería incluir el header agregado por el filtro.

Esto confirma que el filtro es realmente global y no algo pegado a una sola ruta.

---

## Paso 7 · Probar órdenes entrando por el gateway

Ahora hacé lo mismo con una request de creación de orden:

```bash
curl -i -X POST http://localhost:8080/order-api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

La idea es confirmar que:

- el flujo de negocio sigue sano,
- el gateway sigue enroutando,
- y además la response lleva la marca del filtro.

Eso vuelve al rol del gateway muchísimo más visible.

---

## Paso 8 · Revisar logs del gateway

Ahora mirá la consola de `api-gateway`.

Lo esperable es ver líneas que indiquen algo como:

- método HTTP
- path recibido
- y una señal de que la request fue observada por el filtro

No hace falta todavía una estrategia rica de logging.  
La meta es solo dejar claro que el filtro corre de verdad y lo hace antes de que la request siga su viaje.

---

## Paso 9 · Entender qué gana NovaMarket con este primer filtro

A esta altura conviene fijar algo importante:

este filtro no resuelve un gran problema de negocio, pero sí cambia bastante la madurez del gateway.

¿Por qué?

Porque a partir de ahora el punto de entrada ya no solo:

- recibe,
- enruta,
- y responde

Ahora también:

- observa,
- registra,
- y deja una huella explícita de su participación

Ese cambio es uno de los más importantes del bloque nuevo.

---

## Paso 10 · Entender qué todavía no resolvimos

También conviene ser muy honestos.

Después de esta clase, todavía no deberíamos decir:

- “ya tenemos una estrategia completa de filtros”
- o
- “ya resolvimos todo el procesamiento del borde del sistema”

Eso sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene su **primer filtro global simple**, visible y útil para inaugurar esta capa del gateway.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase aplica la primera mejora real del nuevo tramo del módulo 6.

Ya no estamos solo diciendo que los filtros del gateway también importan.  
Ahora también estamos convirtiendo esa idea en una pieza concreta, observable y transversal dentro de NovaMarket.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- comparamos filtros globales con filtros por ruta,
- no trabajamos con modificación de headers más rica,
- ni abrimos todavía un frente más serio de seguridad en el borde.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**dejar un primer filtro global simple funcionando en `api-gateway`.**

---

## Errores comunes en esta etapa

### 1. Hacer un primer filtro demasiado complejo
Conviene empezar por algo simple y visible.

### 2. No probar con `curl -i`
Entonces perdés la mejor forma de ver rápidamente el header agregado.

### 3. Mirar solo la response y no los logs
Las dos señales juntas hacen mucho más clara la clase.

### 4. Pensar que el filtro es una “decoración”
En realidad inaugura una capacidad central del gateway.

### 5. No verificar varias rutas
Conviene confirmar que el filtro es realmente global y no accidental.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- las requests que pasan por `api-gateway` dejan huella,
- el gateway agrega un header visible en la response,
- los logs muestran que el filtro corre,
- y el punto de entrada del sistema ya no solo enruta, sino que también procesa tráfico de forma transversal.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el filtro está implementado como componente global,
- el header aparece en respuestas que pasan por el gateway,
- los logs muestran la ejecución del filtro,
- y el sistema sigue funcionando correctamente en catálogo, inventario y órdenes.

Si eso está bien, ya podemos pasar al siguiente tema y seguir refinando el bloque de filtros del gateway.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a entender mejor la diferencia entre filtros globales y filtros por ruta para decidir con más criterio cuándo conviene usar cada uno dentro de NovaMarket.

---

## Cierre

En esta clase aplicamos un primer filtro global simple en `api-gateway`.

Con eso, NovaMarket deja de tratar al gateway solo como un enroutador y empieza a usarlo también como una pieza activa del borde del sistema, capaz de observar tráfico y dejar una huella visible de su participación en cada request.
