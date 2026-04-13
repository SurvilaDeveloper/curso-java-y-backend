---
title: "Probando integración completa con Eureka y Feign"
description: "Checkpoint práctico del bloque de integración profesional. Verificación del registro en Eureka, del consumo por nombre lógico y del flujo de órdenes con OpenFeign en NovaMarket."
order: 31
module: "Módulo 5 · Service Discovery y comunicación profesional"
level: "intermedio"
draft: false
---

# Probando integración completa con Eureka y Feign

En las últimas clases NovaMarket dio un salto importante en la calidad de su comunicación entre servicios.

Logramos:

- crear `discovery-server`,
- registrar los servicios principales en Eureka,
- integrar OpenFeign en `order-service`,
- y reemplazar la URL fija de `inventory-service` por resolución vía nombre lógico.

Eso significa que ahora tenemos una integración mucho más profesional.

Antes de seguir con el roadmap, conviene hacer un checkpoint técnico completo de este bloque.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- `discovery-server` registra correctamente las instancias,
- `order-service` consume a `inventory-service` mediante Feign,
- la resolución se hace por nombre lógico,
- y el flujo principal de creación de órdenes sigue funcionando correctamente.

Además, queremos confirmar que la arquitectura está lista para el siguiente gran bloque del curso.

---

## Estado de partida

En este punto del curso:

- `config-server` ya está operativo,
- `discovery-server` ya está operativo,
- `catalog-service`, `inventory-service` y `order-service` se registran en Eureka,
- y `order-service` ya usa Feign para consultar inventario por nombre lógico.

Eso significa que la infraestructura principal de integración ya está armada.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- levantar el entorno necesario,
- verificar el registro en Eureka,
- probar catálogo e inventario,
- crear órdenes válidas e inválidas,
- revisar el comportamiento del sistema,
- y confirmar que la integración con Feign y Eureka está sana.

---

## Paso 1 · Levantar `config-server`

Como los servicios principales dependen de configuración centralizada, conviene mantener el orden habitual de arranque.

Primero levantá:

- `config-server`

Y verificá que esté disponible.

---

## Paso 2 · Levantar `discovery-server`

Ahora levantá:

- `discovery-server`

Y asegurate de que la consola de Eureka quede disponible en:

```txt
http://localhost:8761
```

---

## Paso 3 · Levantar los servicios principales

Ahora sí levantá:

- `catalog-service`
- `inventory-service`
- `order-service`

Es importante que los tres arranquen normalmente y que no haya errores de conexión ni con Config Server ni con Eureka.

---

## Paso 4 · Revisar Eureka

Entrá a:

```txt
http://localhost:8761
```

La consola debería mostrar registradas al menos estas aplicaciones:

- `CATALOG-SERVICE`
- `INVENTORY-SERVICE`
- `ORDER-SERVICE`

Además, conviene verificar que estén en un estado saludable y no simplemente visibles.

---

## Paso 5 · Probar el catálogo

Antes de probar órdenes, confirmemos que los servicios básicos siguen bien.

Ejecutá:

```bash
curl http://localhost:8081/products
```

Y también:

```bash
curl http://localhost:8081/products/1
```

Esto ayuda a comprobar que el catálogo sigue sano después de todos los cambios de configuración y discovery.

---

## Paso 6 · Probar el inventario

Ahora verificá el servicio de inventario.

Ejecutá:

```bash
curl http://localhost:8082/inventory
```

Y también:

```bash
curl http://localhost:8082/inventory/1
```

La idea es confirmar que:

- el inventario sigue funcionando,
- y el servicio remoto que `order-service` va a consumir realmente está operativo.

---

## Paso 7 · Probar una orden válida

Ahora sí, probemos el flujo principal completo.

Ejecutá:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 2, "quantity": 1 }
    ]
  }'
```

La respuesta esperada debería ser:

- `201 Created`
- una orden persistida
- con estado `CREATED`

Esto confirma varias cosas al mismo tiempo:

- `order-service` está arriba,
- `inventory-service` también,
- el cliente Feign funciona,
- la resolución por nombre lógico funciona,
- y el flujo de negocio sigue sano.

---

## Paso 8 · Probar una orden inválida por falta de stock

Ahora probá un caso de error de negocio.

Ejecutá:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 3, "quantity": 999 }
    ]
  }'
```

La respuesta debería seguir siendo:

- `400 Bad Request`
- un mensaje claro de stock insuficiente

Esto confirma que la mejora técnica de integración no rompió la lógica funcional del sistema.

---

## Paso 9 · Probar un producto inexistente

Ahora probá un caso donde el producto no tenga inventario asociado.

Por ejemplo:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 999, "quantity": 1 }
    ]
  }'
```

La respuesta debería ser un error controlado indicando que no se pudo obtener inventario.

Este caso es muy bueno porque obliga a comprobar que el cliente Feign no solo resuelve el servicio, sino que además maneja correctamente un caso de negocio inválido.

---

## Paso 10 · Observar logs de `order-service`

Durante estas pruebas, conviene mirar la consola de `order-service`.

Queremos tener alguna pista de que:

- el servicio está recibiendo la request,
- el cliente Feign ejecuta la llamada remota,
- y no hay errores inesperados en la integración.

Aunque todavía no hay trazas distribuidas ni observabilidad avanzada, los logs ya son una muy buena fuente de información.

---

## Paso 11 · Observar logs de `inventory-service`

También conviene mirar `inventory-service`.

Queremos confirmar que:

- realmente está recibiendo las llamadas desde `order-service`,
- responde como se espera,
- y no hay problemas de contrato o mapeo.

En microservicios, mirar ambos extremos de una integración es una costumbre muy sana.

---

## Qué estamos validando realmente en esta clase

No se trata solo de “hacer un par de requests”.

Lo que estamos validando es esto:

### 1. Que Eureka está vivo y reflejando la arquitectura actual
### 2. Que los servicios principales están registrados correctamente
### 3. Que Feign consume al servicio remoto correcto
### 4. Que la resolución por nombre lógico funciona
### 5. Que el flujo principal sigue comportándose como esperamos

Eso es muchísimo valor para el punto del proyecto en el que estamos.

---

## Qué todavía no estamos haciendo

Todavía no hablamos de:

- balanceo de carga explícito,
- múltiples instancias del mismo servicio,
- circuit breaker sobre Feign,
- ni integración con gateway.

Todo eso puede venir después.

La meta de hoy es más concreta:

**dejar completamente verificado el bloque de Eureka + Feign.**

---

## Qué hacer si algo falla

Si en esta clase algo no funciona, conviene revisar primero:

- que `discovery-server` esté arriba,
- que `inventory-service` esté registrado en Eureka,
- que el nombre usado en `@FeignClient` coincida con `spring.application.name`,
- que `order-service` tenga Feign habilitado,
- y que los servicios estén cargando bien su configuración desde Config Server.

Esta clase existe justamente para detectar esas inconsistencias antes de seguir.

---

## Checklist de verificación mínima

Al finalizar la clase deberías poder confirmar que:

- `discovery-server` está operativo,
- los tres servicios aparecen registrados,
- `catalog-service` funciona,
- `inventory-service` funciona,
- `order-service` puede crear órdenes válidas,
- y las órdenes inválidas siguen rechazándose correctamente.

Si todo eso funciona, el bloque de integración profesional quedó bien consolidado.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería sentirse claramente más maduro que al inicio del curso:

- ya tiene configuración centralizada,
- ya tiene discovery,
- ya usa Feign,
- y la comunicación principal del sistema dejó atrás la URL fija.

Eso es un salto arquitectónico muy importante.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a entrar a otro bloque grande del roadmap: **API Gateway**.

Eso va a cambiar otra vez la forma en que se entra y se organiza el acceso al sistema.

---

## Cierre

Esta clase funcionó como checkpoint del bloque de Eureka y Feign.

Nos permitió verificar que NovaMarket ya puede registrar servicios, resolverlos por nombre lógico y sostener el flujo principal de órdenes sobre una integración más profesional.

Con eso, la arquitectura queda lista para seguir creciendo hacia el punto de entrada unificado que vamos a construir a continuación.
