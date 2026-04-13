---
title: "Probando el primer flujo completo de creación de orden"
description: "Verificación integral del primer flujo funcional de NovaMarket usando catalog-service, inventory-service y order-service antes de pasar al bloque de persistencia."
order: 15
module: "Módulo 2 · Primer flujo funcional del sistema"
level: "intermedio"
draft: false
---

# Probando el primer flujo completo de creación de orden

Llegamos a un punto importante del curso práctico.

Ya construimos:

- `catalog-service` con endpoints de productos,
- `inventory-service` con endpoints de stock,
- `order-service` con `POST /orders`,
- y una integración simple entre órdenes e inventario.

Eso significa que NovaMarket ya tiene un **primer flujo funcional distribuido**.

Antes de seguir hacia persistencia, conviene hacer una pausa y verificar que la base actual realmente funciona como sistema mínimo.

Ese es el objetivo de esta clase:

**probar de punta a punta el primer flujo de creación de orden.**

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- el catálogo responde,
- el inventario responde,
- `order-service` consulta stock antes de crear la orden,
- las órdenes válidas se crean,
- y las órdenes inválidas se rechazan.

Además, esta clase nos va a servir para detectar cualquier inconsistencia antes de entrar al siguiente bloque del curso.

---

## Estado de partida

En este punto deberíamos tener funcionando al menos estas rutas:

### `catalog-service`
- `GET /products`
- `GET /products/{id}`

### `inventory-service`
- `GET /inventory`
- `GET /inventory/{productId}`

### `order-service`
- `POST /orders`

Y además, `order-service` ya debería estar consultando a `inventory-service` por HTTP.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- levantar los tres servicios base,
- revisar que sus datos en memoria sean coherentes,
- probar el catálogo,
- probar el inventario,
- crear órdenes válidas,
- crear órdenes inválidas,
- y confirmar que el flujo distribuido actual está sano.

---

## Paso 1 · Levantar los tres servicios

Antes de probar nada, asegurate de levantar:

- `catalog-service`
- `inventory-service`
- `order-service`

Idealmente, cada uno en su puerto configurado.

Por ejemplo:

- `catalog-service` → `8081`
- `inventory-service` → `8082`
- `order-service` → `8083`

La primera verificación básica es simplemente confirmar que los tres arrancan sin errores.

---

## Paso 2 · Verificar el catálogo

Empecemos por el punto más simple: el catálogo.

Probá:

```bash
curl http://localhost:8081/products
```

La respuesta esperada debería incluir los productos cargados en memoria.

Después probá también una consulta puntual:

```bash
curl http://localhost:8081/products/1
```

Y un caso inexistente:

```bash
curl http://localhost:8081/products/99
```

Acá queremos comprobar que:

- el catálogo responde,
- los ids definidos están claros,
- y el contrato del servicio funciona como esperábamos.

---

## Paso 3 · Verificar el inventario

Ahora probemos stock.

Primero:

```bash
curl http://localhost:8082/inventory
```

Después, una consulta puntual:

```bash
curl http://localhost:8082/inventory/1
```

Y también un caso inexistente:

```bash
curl http://localhost:8082/inventory/99
```

En esta etapa es importante revisar que los `productId` usados por inventario tengan sentido respecto del catálogo.

No estamos comprobando consistencia automática entre servicios, pero sí necesitamos coherencia manual entre los datos de ejemplo.

---

## Paso 4 · Revisar coherencia entre catálogo e inventario

Antes de probar órdenes, conviene mirar si los datos que usamos en memoria realmente están alineados.

Por ejemplo:

- si `catalog-service` expone productos con ids `1`, `2`, `3`,
- entonces `inventory-service` debería tener entradas razonables para esos mismos productos.

Este detalle es clave para que el flujo de órdenes tenga sentido.

---

## Paso 5 · Probar una orden válida simple

Ahora sí, vamos al flujo principal.

Probá crear una orden con stock suficiente.

Por ejemplo:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 2 }
    ]
  }'
```

La respuesta esperada debería ser:

- `201 Created`
- una orden con estado `CREATED`

Esto valida el camino feliz mínimo del sistema.

---

## Paso 6 · Probar una orden válida con varios ítems

Ahora conviene probar algo un poco más representativo.

Por ejemplo:

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

Acá queremos verificar que `order-service` no valide solo el primer ítem, sino todos.

La orden debería crearse correctamente solo si todos los productos tienen disponibilidad suficiente.

---

## Paso 7 · Probar una orden inválida por falta de stock

Ahora probá un caso donde el pedido supera el stock disponible.

Por ejemplo, si el producto `3` tiene `8` unidades:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 3, "quantity": 20 }
    ]
  }'
```

La respuesta esperada debería ser:

- `400 Bad Request`
- un mensaje de error claro

Esto confirma que el servicio está aplicando la regla de negocio que agregamos en la clase anterior.

---

## Paso 8 · Probar una orden inválida con producto inexistente

También conviene probar un producto que no tenga inventario asociado.

Por ejemplo:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 99, "quantity": 1 }
    ]
  }'
```

La respuesta debería ser un error controlado indicando que no se pudo obtener inventario.

Este caso es importante porque valida un escenario distribuido real:  
el servicio remoto no tiene datos para el id solicitado.

---

## Paso 9 · Revisar los logs de `order-service`

Durante estas pruebas, conviene mirar la consola de `order-service`.

Aunque todavía no hay logs especialmente trabajados, ya se pueden detectar cosas útiles como:

- si la request entró,
- si hubo error en integración,
- si la llamada a inventario generó un problema,
- o si el servicio respondió como esperábamos.

Mirar logs desde ahora es una buena costumbre para el resto del curso.

---

## Paso 10 · Revisar los logs de `inventory-service`

También conviene mirar `inventory-service`.

Queremos comprobar que:

- efectivamente está recibiendo requests desde `order-service`,
- responde cuando corresponde,
- y no hay errores inesperados de mapeo o de endpoint.

Este paso refuerza una idea muy importante del curso práctico:

cuando un flujo involucra varios servicios, conviene observar ambos lados.

---

## Qué estamos validando de verdad en esta clase

No se trata solo de “hacer requests y ver si responden”.

Lo que estamos validando es esto:

### 1. Que el catálogo tiene datos utilizables
### 2. Que el inventario es consultable
### 3. Que `order-service` integra correctamente con inventario
### 4. Que el sistema distingue entre órdenes válidas e inválidas
### 5. Que el primer flujo distribuido de NovaMarket ya existe

Eso es muchísimo valor para este punto del proyecto.

---

## Qué todavía no estamos resolviendo

Todavía no tenemos:

- persistencia real,
- descuento de stock,
- seguridad,
- discovery,
- Feign,
- gateway,
- ni eventos.

Pero eso no le quita valor a lo que ya construimos.

De hecho, esta verificación es muy importante justamente porque estamos a punto de entrar en un nuevo bloque del curso y necesitamos saber que la base actual está sana.

---

## Qué hacer si algo falla

Si en esta clase algo no funciona, conviene no seguir al siguiente bloque hasta resolverlo.

Las fallas más comunes en este punto suelen ser:

- puertos mal configurados,
- `inventory-service` apagado,
- ids inconsistentes entre catálogo e inventario,
- mapeo incorrecto del DTO remoto,
- o errores de package/import.

La ventaja de hacer esta clase de verificación ahora es justamente detectar esos problemas antes de que el sistema siga creciendo.

---

## Checklist de verificación mínima

Al finalizar la clase, deberías poder confirmar esto:

- `GET /products` funciona,
- `GET /products/{id}` funciona,
- `GET /inventory` funciona,
- `GET /inventory/{productId}` funciona,
- `POST /orders` crea una orden válida,
- `POST /orders` rechaza una orden sin stock,
- `POST /orders` rechaza una orden con producto inexistente.

Si todo eso funciona, entonces NovaMarket ya tiene un primer flujo distribuido sólido para esta etapa.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener confianza en que el sistema mínimo actual funciona.

Eso significa que ya tenemos una base suficientemente sana para entrar al siguiente gran bloque del curso:

**la persistencia real con JPA.**

---

## Qué sigue en la próxima clase

En la próxima clase vamos a dejar atrás las listas en memoria y a empezar a agregar persistencia real.

Vamos a arrancar por `catalog-service`, integrando Spring Data JPA y una base de datos para los productos.

---

## Cierre

Esta clase funcionó como un checkpoint técnico del proyecto.

Nos permitió verificar que NovaMarket ya puede:

- exponer catálogo,
- exponer inventario,
- recibir órdenes,
- validar stock,
- y responder con criterio en casos válidos e inválidos.

Ese primer flujo completo es una base muy valiosa.  
Ahora sí podemos hacer evolucionar el proyecto con más confianza.
