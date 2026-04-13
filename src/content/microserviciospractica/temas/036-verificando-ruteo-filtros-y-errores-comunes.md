---
title: "Verificando ruteo, filtros y errores comunes"
description: "Checkpoint práctico del bloque de API Gateway. Revisión del ruteo, validación de filtros y diagnóstico de problemas frecuentes antes de pasar al bloque de seguridad."
order: 36
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Verificando ruteo, filtros y errores comunes

En las últimas clases NovaMarket incorporó un cambio muy importante en la forma de entrar al sistema:

- creamos `api-gateway`,
- definimos rutas hacia los microservicios,
- validamos el acceso por el gateway,
- y agregamos un primer filtro simple.

Eso ya deja un bloque de gateway bastante interesante.

Antes de pasar al siguiente gran tema del curso, conviene hacer un checkpoint técnico del estado actual del gateway.

Ese es el objetivo de esta clase:

**verificar ruteo, filtros y errores comunes antes de entrar al bloque de seguridad.**

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber confirmado que:

- el gateway enruta correctamente hacia los servicios principales,
- el filtro agregado se ejecuta como esperamos,
- el sistema responde bien entrando por el gateway,
- y sabemos diagnosticar algunos de los problemas más comunes de esta pieza.

---

## Estado de partida

En este punto del curso, NovaMarket ya debería tener:

- `config-server` operativo,
- `discovery-server` operativo,
- `catalog-service`, `inventory-service` y `order-service` funcionales,
- `api-gateway` con rutas hacia esos servicios,
- y al menos un filtro simple ya agregado y visible.

Además, el flujo principal de órdenes ya debería poder ejecutarse entrando por el gateway.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el estado general del entorno,
- probar varias rutas del gateway,
- confirmar el comportamiento del filtro,
- revisar problemas típicos,
- y dejar consolidado el bloque actual antes de pasar a seguridad.

---

## Paso 1 · Levantar el entorno completo necesario

Conviene arrancar con todo el entorno mínimo operativo:

1. `config-server`
2. `discovery-server`
3. `catalog-service`
4. `inventory-service`
5. `order-service`
6. `api-gateway`

La idea es que el checkpoint se haga sobre el sistema real que venimos construyendo, no sobre pruebas aisladas.

---

## Paso 2 · Revisar Eureka antes de entrar por el gateway

Abrí:

```txt
http://localhost:8761
```

Y asegurate de que aparezcan al menos:

- `CATALOG-SERVICE`
- `INVENTORY-SERVICE`
- `ORDER-SERVICE`
- `API-GATEWAY` si lo registraste también

Esto es importante porque el gateway depende de discovery para resolver rutas por nombre lógico.

---

## Paso 3 · Probar el catálogo a través del gateway

Empecemos por lo más simple.

Probá:

```bash
curl -i http://localhost:8080/products
```

Y después:

```bash
curl -i http://localhost:8080/products/1
```

Queremos verificar tres cosas:

- que el ruteo funciona,
- que el servicio responde bien,
- y que el filtro agregado deja una huella visible, por ejemplo el header `X-Trace-Id`.

---

## Paso 4 · Probar el inventario a través del gateway

Ahora repetí sobre inventario:

```bash
curl -i http://localhost:8080/inventory
```

Y también:

```bash
curl -i http://localhost:8080/inventory/1
```

La idea es confirmar que el gateway enruta correctamente no solo a un servicio, sino a varios dominios diferentes.

---

## Paso 5 · Probar el flujo principal de órdenes a través del gateway

Ahora probá una orden válida:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 2, "quantity": 1 }
    ]
  }'
```

Queremos comprobar que:

- el gateway enruta bien,
- el filtro sigue ejecutándose,
- y el flujo principal sigue sano.

Este es el punto más importante de la clase, porque valida el camino más valioso del sistema.

---

## Paso 6 · Probar un error de negocio a través del gateway

Ahora hacé una prueba con stock insuficiente:

```bash
curl -i -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 3, "quantity": 999 }
    ]
  }'
```

La respuesta debería seguir siendo un `400 Bad Request` y el filtro debería seguir dejando su header visible.

Esto confirma que el gateway no rompe el manejo normal de errores de negocio.

---

## Paso 7 · Revisar el comportamiento del filtro

A esta altura ya deberías haber visto varias respuestas con el header agregado por el filtro.

Conviene confirmar al menos estas cosas:

- que el header aparece,
- que aparece en distintos endpoints,
- y que cambia por request cuando corresponde.

Este paso es importante porque demuestra que el filtro realmente está corriendo y no es solo una clase cargada sin impacto visible.

---

## Paso 8 · Mirar logs del gateway

Ahora conviene revisar los logs del gateway con cierta atención.

Queremos detectar si:

- alguna ruta no se resolvió bien,
- hay problemas de forwarding,
- el filtro genera errores,
- o el gateway está reaccionando raro frente a ciertos requests.

En una arquitectura con gateway, esta consola se vuelve una de las primeras fuentes de diagnóstico cuando algo falla.

---

## Paso 9 · Mirar también logs de los servicios de destino

Conviene revisar también:

- `catalog-service`
- `inventory-service`
- `order-service`

Queremos validar que:

- las requests realmente llegan a esos servicios,
- no hay inconsistencias raras introducidas por el gateway,
- y el sistema se sigue comportando como esperamos.

---

## Errores comunes que esta clase ayuda a detectar

Esta clase es muy buena para detectar problemas típicos del bloque de gateway.

### 1. Ruta mal definida
Por ejemplo, un `Path` incorrecto en `api-gateway.yml`.

### 2. Nombre lógico mal escrito en `lb://...`
Si el nombre no coincide con Eureka, el gateway no resuelve el servicio.

### 3. Servicio no registrado en Eureka
Entonces el gateway no puede encontrar destino.

### 4. Cambio en el filtro que rompe responses o requests
Especialmente si el filtro modifica headers o estructura del intercambio.

### 5. Olvidar reiniciar el gateway después de cambiar configuración remota
A veces el problema no es el código, sino que el gateway sigue corriendo con una configuración vieja.

---

## Paso 10 · Validar qué parte del bloque ya está cerrada

En este punto conviene reconocer qué cosas ya tenemos bastante consolidadas.

### Ya resuelto en este bloque
- creación del gateway
- definición de rutas
- integración con discovery
- acceso unificado
- primer filtro simple

### Todavía no resuelto en este bloque
- seguridad
- propagación de tokens
- filtros más avanzados
- reglas de acceso

Este mapa es importante porque nos muestra que el gateway ya está funcional, pero todavía no completo.

---

## Qué estamos logrando con esta clase

Esta clase no agrega una tecnología nueva, pero sí hace algo muy valioso:

**convierte lo que venimos construyendo en una pieza mejor entendida y más confiable.**

Después de este checkpoint, el gateway ya no debería sentirse como algo “mágico” o frágil, sino como una parte razonablemente consolidada de la arquitectura.

---

## Qué todavía no estamos haciendo

Todavía no:

- protegemos rutas,
- validamos tokens,
- propagamos identidad,
- ni usamos el gateway como pieza de seguridad distribuida.

Todo eso viene en el siguiente bloque del curso.

La meta de hoy es mucho más concreta:

**cerrar bien el bloque actual de ruteo y filtros.**

---

## Checklist de verificación mínima

Al terminar la clase deberías poder confirmar que:

- `GET /products` funciona por gateway,
- `GET /inventory` funciona por gateway,
- `POST /orders` funciona por gateway,
- el filtro simple se ejecuta,
- el header agregado aparece en las responses,
- y sabés detectar al menos algunos errores comunes del bloque.

Si todo eso funciona, entonces el bloque de gateway básico está listo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `api-gateway` debería sentirse como una pieza estable del sistema:

- enruta,
- aplica lógica transversal simple,
- y sostiene correctamente el flujo principal.

Eso nos deja en una muy buena posición para pasar al próximo gran bloque.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a entrar a **seguridad con Keycloak**.

Ese cambio va a ser grande, porque el gateway va a dejar de ser solo una puerta de entrada técnica para empezar a convertirse también en una pieza central del control de acceso.

---

## Cierre

En esta clase consolidamos el bloque base de gateway.

Verificamos ruteo, filtros y varios puntos de diagnóstico importantes.  
Con eso, NovaMarket ya tiene una entrada central funcional y razonablemente bien entendida antes de avanzar hacia el terreno más sensible de la arquitectura: la seguridad.
