---
title: "Probando NovaMarket a través del gateway"
description: "Checkpoint práctico del bloque de API Gateway. Verificación del acceso a catálogo, inventario y órdenes entrando exclusivamente por api-gateway."
order: 34
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Probando NovaMarket a través del gateway

En la clase anterior configuramos las primeras rutas en `api-gateway`.

Eso significa que NovaMarket ya tiene:

- un punto de entrada central,
- rutas hacia los microservicios principales,
- y resolución por nombre lógico apoyada en Eureka.

Ahora toca hacer una pausa muy útil:

**probar el sistema entrando exclusivamente por el gateway.**

Esta clase funciona como un checkpoint del bloque de API Gateway antes de seguir con filtros y, más adelante, seguridad.

La idea es confirmar que el gateway realmente ya puede considerarse la puerta de entrada operativa de NovaMarket.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- el catálogo responde entrando por el gateway,
- el inventario responde entrando por el gateway,
- la creación de órdenes funciona entrando por el gateway,
- y el sistema puede ser usado sin depender directamente de los puertos individuales de cada microservicio.

---

## Estado de partida

En este punto del curso deberíamos tener arriba:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `api-gateway`

Además:

- los servicios principales deberían aparecer registrados en Eureka,
- y el gateway ya debería tener rutas hacia ellos.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- verificar la infraestructura base,
- probar el catálogo a través del gateway,
- probar el inventario a través del gateway,
- probar la creación de órdenes a través del gateway,
- y confirmar que el punto de entrada unificado ya funciona correctamente.

---

## Paso 1 · Levantar todo el entorno necesario

Conviene respetar el orden habitual:

1. `config-server`
2. `discovery-server`
3. `catalog-service`
4. `inventory-service`
5. `order-service`
6. `api-gateway`

La idea es que el gateway arranque con la infraestructura disponible y con los servicios ya registrados o en proceso de registro.

---

## Paso 2 · Revisar Eureka antes de probar

Abrí:

```txt
http://localhost:8761
```

Y confirmá que aparezcan al menos:

- `CATALOG-SERVICE`
- `INVENTORY-SERVICE`
- `ORDER-SERVICE`
- `API-GATEWAY` si ya lo tenés registrado también

Este paso es importante porque el gateway depende de discovery para resolver sus rutas por nombre lógico.

---

## Paso 3 · Confirmar que no vamos a entrar por los puertos individuales

En esta clase queremos cambiar el hábito de prueba.

En vez de entrar a:

- `http://localhost:8081`
- `http://localhost:8082`
- `http://localhost:8083`

vamos a entrar por:

- `http://localhost:8080`

Ese detalle es el corazón del ejercicio.

No se trata solo de probar que “la respuesta existe”, sino de validar que el nuevo punto de entrada del sistema ya funciona como punto de acceso real.

---

## Paso 4 · Probar el catálogo por gateway

Ejecutá:

```bash
curl http://localhost:8080/products
```

La respuesta debería ser equivalente a la que antes obtenías llamando directamente a `catalog-service`.

Después probá también:

```bash
curl http://localhost:8080/products/1
```

Y un caso inexistente:

```bash
curl http://localhost:8080/products/999
```

Queremos confirmar que el gateway:

- enruta correctamente,
- no rompe el contrato del servicio,
- y deja pasar también el comportamiento normal de errores.

---

## Paso 5 · Probar el inventario por gateway

Ahora probá:

```bash
curl http://localhost:8080/inventory
```

Y también:

```bash
curl http://localhost:8080/inventory/1
```

Y un caso inexistente:

```bash
curl http://localhost:8080/inventory/999
```

Acá queremos verificar que el gateway no solo enrute al catálogo, sino también a otro servicio distinto del dominio.

---

## Paso 6 · Probar una orden válida por gateway

Ahora sí, vamos al flujo más importante.

Ejecutá:

```bash
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 2, "quantity": 1 }
    ]
  }'
```

La respuesta esperada debería seguir siendo:

- `201 Created`
- una orden persistida
- con estado `CREATED`

Este punto es muy importante porque no solo prueba el gateway:  
prueba que el gateway enruta correctamente hacia el servicio que, a su vez, sigue integrando con otro servicio por Feign y Eureka.

Es decir, valida varios niveles de la arquitectura al mismo tiempo.

---

## Paso 7 · Probar una orden inválida por gateway

Ahora probá una orden con stock insuficiente:

```bash
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 3, "quantity": 999 }
    ]
  }'
```

La respuesta debería seguir siendo un `400 Bad Request` con un mensaje claro.

Esto confirma que el gateway no rompe el manejo funcional del error de negocio.

---

## Paso 8 · Probar un producto inexistente en la orden por gateway

Ahora probá:

```bash
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 999, "quantity": 1 }
    ]
  }'
```

La respuesta debería seguir siendo un error controlado.

Acá queremos verificar que el comportamiento de negocio del sistema sigue siendo consistente aunque el ingreso ocurra por el gateway.

---

## Paso 9 · Mirar logs del gateway

Durante estas pruebas, conviene mirar la consola de `api-gateway`.

Queremos observar:

- que las requests efectivamente entran al gateway,
- que no hay errores de ruteo,
- y que el servicio realmente participa en el flujo.

En esta etapa todavía no agregamos filtros propios, pero los logs ya pueden ayudarte a confirmar que el tráfico está pasando por el componente correcto.

---

## Paso 10 · Mirar también logs de los servicios de destino

Además del gateway, conviene observar:

- `catalog-service`
- `inventory-service`
- `order-service`

La idea es verificar que:

- las requests llegan a destino,
- cada servicio sigue comportándose como se espera,
- y el gateway no está introduciendo un comportamiento inesperado en el contrato.

---

## Qué estamos validando de verdad en esta clase

No se trata solo de confirmar que existe un componente llamado `api-gateway`.

Lo que estamos validando es esto:

### 1. Que el sistema ya tiene un punto de entrada central
### 2. Que ese punto puede enrutar hacia varios dominios distintos
### 3. Que el flujo principal de órdenes sigue funcionando pasando por ese nuevo punto
### 4. Que la arquitectura interna queda mejor escondida detrás de una única puerta de acceso

Ese es un cambio muy importante en la forma de usar NovaMarket.

---

## Qué todavía no estamos haciendo

Todavía no:

- aplicamos filtros custom,
- protegemos rutas,
- propagamos tokens,
- ni refinamos path rewriting.

Todo eso viene después.

La meta de hoy es mucho más concreta:

**dejar claro que el gateway ya funciona como entrada real del sistema.**

---

## Qué hacer si algo falla

Si alguna prueba falla, conviene revisar primero:

- que `api-gateway` esté arriba,
- que las rutas en `api-gateway.yml` estén bien definidas,
- que los servicios aparezcan en Eureka,
- que el gateway pueda resolverlos por nombre lógico,
- y que los servicios de destino sigan funcionando individualmente.

Esta clase existe justamente para detectar esas inconsistencias antes de agregar más complejidad al gateway.

---

## Checklist de verificación mínima

Al finalizar la clase deberías poder confirmar que:

- `GET /products` funciona por gateway,
- `GET /products/{id}` funciona por gateway,
- `GET /inventory` funciona por gateway,
- `GET /inventory/{productId}` funciona por gateway,
- `POST /orders` funciona por gateway,
- y los errores de negocio siguen respondiéndose correctamente.

Si todo eso funciona, el bloque base de gateway quedó sólido.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería poder usarse razonablemente entrando solo por `api-gateway`.

Eso hace que la arquitectura se sienta mucho más ordenada y más cercana a una aplicación distribuida real.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a agregar filtros simples en el gateway.

Ese va a ser el primer paso para empezar a introducir lógica transversal en el punto de entrada del sistema.

---

## Cierre

En esta clase verificamos que NovaMarket ya puede usarse entrando por un único punto de acceso.

Con eso, `api-gateway` deja de ser solo un servicio más del monorepo y pasa a convertirse realmente en la puerta de entrada de la arquitectura.
