---
title: "Aplicando una primera protección simple sobre order-api en api-gateway"
description: "Primer paso práctico del nuevo subtramo del módulo 6. Implementación de una protección simple y visible sobre order-api en api-gateway para introducir una primera capa de seguridad en el borde del sistema."
order: 53
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Aplicando una primera protección simple sobre `order-api` en `api-gateway`

En la clase anterior dejamos algo bastante claro:

- el gateway ya está listo para una primera capa de seguridad,
- no hace falta todavía saltar a una solución completa de identidad,
- y lo más sano ahora es arrancar por una protección simple, visible y muy entendible.

Ahora toca el paso concreto:

**aplicar una primera protección simple sobre `order-api` en `api-gateway`.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- protegida la ruta de órdenes con una validación simple en el gateway,
- visible que no todas las rutas del sistema quedan igual de expuestas,
- mucho más claro que el borde ya puede decidir qué deja pasar y qué no,
- y NovaMarket con una primera mejora real de seguridad en el punto de entrada del sistema.

La meta de hoy no es construir seguridad final.  
La meta es mucho más concreta: **dejar una primera señal clara de que el gateway ya puede proteger una parte sensible del tráfico**.

---

## Estado de partida

Partimos de un sistema donde ya:

- `api-gateway` enruta correctamente,
- discovery y balanceo ya están bien integrados,
- existe una primera capa de filtros y trazabilidad visible,
- y el módulo ya dejó claro que el borde del sistema no debería seguir completamente ingenuo.

Eso significa que el problema ya no es si el gateway puede intervenir.  
Ahora la pregunta útil es otra:

- **cómo usamos esa capacidad para bloquear tráfico que no cumple una condición mínima**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir una protección simple y muy visible,
- aplicarla específicamente sobre `order-api`,
- devolver una respuesta clara cuando la validación falla,
- probar requests permitidas y bloqueadas,
- y validar qué nueva postura gana el sistema después de ese cambio.

---

## Qué tipo de protección conviene usar en esta etapa

Para este punto del curso, una gran opción didáctica es:

- exigir un header simple, por ejemplo:

```txt
X-Order-Api-Key
```

con un valor esperado conocido en la configuración.

Eso tiene varias ventajas:

- es fácil de probar,
- se entiende rápido,
- deja clarísimo qué request pasa y cuál no,
- no obliga todavía a introducir un sistema completo de identidad,
- y encaja muy bien con el estado actual de NovaMarket.

Conviene leerlo como una **primera barrera del borde**, no como la solución final del sistema.

---

## Por qué conviene proteger `order-api` y no catálogo

Este punto importa mucho.

Catálogo suele representar una superficie más naturalmente pública o menos sensible dentro del flujo actual del proyecto.

Órdenes, en cambio, ya tiene otro peso funcional:

- crea entidades,
- modifica estado,
- y representa una zona más delicada del sistema.

Por eso tiene muchísimo sentido usar `order-api` como primera ruta protegida del gateway.

Eso deja el ejemplo mucho mejor alineado con la arquitectura real.

---

## Paso 1 · Elegir dónde implementar la validación

Como esta protección debería aplicar solo sobre órdenes, no conviene implementarla como filtro global.

Lo más sano en esta etapa es hacerla como:

- un filtro específico de la ruta de `order-api`,
- o una pieza equivalente que viva conceptualmente pegada a esa ruta.

Esto vuelve el ejemplo mucho más claro:

- catálogo sigue libre
- inventario sigue igual
- órdenes ya no

Ese contraste es parte central del valor didáctico de la clase.

---

## Paso 2 · Definir la regla mínima

La regla simple puede ser esta:

- si la request que entra a `order-api` trae el header esperado con el valor correcto, la dejamos pasar
- si no lo trae, o lo trae mal, respondemos con error

Eso ya es suficiente para mostrar con muchísima claridad la nueva capacidad del gateway.

No hace falta todavía meter roles, usuarios ni sesiones.

---

## Paso 3 · Crear un filtro específico para `order-api`

Podés crear una clase como:

```txt
src/main/java/com/novamarket/gateway/filter/OrderApiKeyFilter.java
```

Una versión conceptual simple podría verse así:

```java
package com.novamarket.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class OrderApiKeyFilter {

    private static final String HEADER_NAME = "X-Order-Api-Key";
    private static final String EXPECTED_VALUE = "novamarket-order-secret";

    public GatewayFilter apply() {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String value = request.getHeaders().getFirst(HEADER_NAME);

            if (value == null || !EXPECTED_VALUE.equals(value)) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            return chain.filter(exchange);
        };
    }
}
```

No hace falta todavía obsesionarse con inyección desde config o diseño más sofisticado.

La meta de hoy es que la barrera sea muy clara y muy visible.

---

## Paso 4 · Asociar el filtro solo a la ruta de órdenes

Ahora, en la configuración de la ruta `order-api`, la idea es aplicar este filtro solo ahí.

La representación exacta depende de cómo decidas integrarlo, pero conceptualmente lo importante es esto:

- `catalog-service` no usa esta validación
- `inventory-service` no usa esta validación
- `order-service`, expuesto como `order-api`, sí la usa

Ese contraste es exactamente lo que queremos demostrar.

---

## Paso 5 · Levantar el entorno en orden

Como siempre, conviene sostener el entorno completo:

1. `config-server`
2. `discovery-server`
3. `catalog-service`
4. `inventory-service`
5. `order-service`
6. `api-gateway`

Queremos probar la nueva barrera del gateway sobre el entorno real donde el sistema ya enruta y balancea.

---

## Paso 6 · Probar una request a órdenes sin el header

Ahora probá una request como esta, sin incluir `X-Order-Api-Key`:

```bash
curl -i -X POST http://localhost:8080/order-api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

Lo esperable es que la respuesta sea algo como:

```txt
HTTP/1.1 401 Unauthorized
```

o una variante equivalente según cómo cierres la response.

Este es uno de los momentos más importantes de la clase, porque vuelve visible de inmediato que el gateway ya dejó de ser completamente permisivo sobre esa ruta.

---

## Paso 7 · Probar la misma request con el header correcto

Ahora repetí la request, pero agregando el header esperado:

```bash
curl -i -X POST http://localhost:8080/order-api/orders \
  -H "Content-Type: application/json" \
  -H "X-Order-Api-Key: novamarket-order-secret" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 1 }
    ]
  }'
```

Lo esperable ahora es que:

- la request pase,
- el gateway la enrute,
- y la orden se cree normalmente.

Ese contraste entre request bloqueada y request permitida es el corazón de toda la clase.

---

## Paso 8 · Confirmar que catálogo sigue abierto

Ahora probá algo como:

```bash
curl -i http://localhost:8080/catalog/products
```

Lo importante es confirmar que:

- catálogo sigue funcionando sin esa cabecera,
- no todo el sistema quedó endurecido de la misma forma,
- y la nueva barrera realmente está aplicada solo sobre la parte sensible elegida.

Este paso es clave para no perder el valor didáctico del ejemplo.

---

## Paso 9 · Confirmar que inventario sigue igual

Repetí la verificación con inventario:

```bash
curl -i http://localhost:8080/inventory/inventory
```

Otra vez, lo esperable es que:

- la ruta siga funcionando,
- no haga falta la cabecera,
- y la diferencia entre abierto y protegido quede todavía más clara.

Esto termina de mostrar que el gateway ya puede hacer tratamiento diferencial serio sobre distintas zonas del sistema.

---

## Paso 10 · Entender qué acabamos de demostrar

Lo que esta clase demuestra no es simplemente que “se puede leer un header”.

Demuestra algo mucho más importante:

- el gateway ya puede actuar como primer guardián del borde,
- puede bloquear requests antes de que lleguen al microservicio,
- y puede hacerlo solo sobre las rutas que realmente quiere proteger.

Ese salto de madurez es enorme.

---

## Paso 11 · Entender por qué esta solución sigue siendo inicial

Conviene dejar esto muy claro.

Aunque el ejemplo ya muestra una mejora real, todavía no deberíamos decir:

- “NovaMarket ya resolvió toda la seguridad del gateway”

Eso sería exagerado.

Lo correcto es algo más honesto:

- NovaMarket ya tiene una **primera barrera simple y visible** sobre una ruta más sensible del sistema.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase aplica la primera mejora real del nuevo subtramo de seguridad en el borde.

Ya no estamos solo diciendo que el gateway también puede proteger tráfico.  
Ahora también estamos convirtiendo esa idea en una barrera concreta, observable y fácil de probar dentro de NovaMarket.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- validamos con calma la convivencia entre rutas abiertas y rutas protegidas,
- ni consolidamos todavía una primera capa ordenada de seguridad en el gateway.

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**aplicar una primera protección simple sobre `order-api` en `api-gateway`.**

---

## Errores comunes en esta etapa

### 1. Hacer la protección global en vez de específica
Eso rompería el valor didáctico del ejemplo.

### 2. No probar la request sin header y con header
El contraste es parte esencial de la clase.

### 3. No verificar que catálogo e inventario sigan abiertos
Ese contraste también es clave.

### 4. Confundir esta barrera simple con la seguridad final del sistema
Todavía estamos en una primera capa, no en la solución completa.

### 5. Elegir una primera protección demasiado compleja
En esta etapa, lo simple y visible vale muchísimo más.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- `order-api` ya no está completamente abierta,
- el gateway puede bloquear requests antes de llegar al microservicio,
- las rutas menos sensibles siguen funcionando sin esa barrera,
- y el borde del sistema ya ganó una primera capa concreta de protección.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- la request sin header a órdenes queda bloqueada,
- la request con header correcto pasa,
- catálogo e inventario siguen sin esa exigencia,
- y sentís que el gateway ya dejó de ser completamente ingenuo en una zona sensible del sistema.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta primera capa de seguridad en el borde del sistema.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de seguridad en el gateway, leyendo con más claridad qué nueva postura ganó NovaMarket después de introducir una barrera simple sobre una ruta sensible.

---

## Cierre

En esta clase aplicamos una primera protección simple sobre `order-api` en `api-gateway`.

Con eso, NovaMarket deja de tratar todas las rutas del sistema como igualmente abiertas y empieza a mostrar, de forma concreta y muy visible, que el borde del sistema ya puede decidir qué requests sensibles deja pasar y cuáles no.
