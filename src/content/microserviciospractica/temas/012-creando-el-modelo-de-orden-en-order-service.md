---
title: "Creando el modelo de orden en order-service"
description: "Construcción del modelo inicial de órdenes en order-service. Definición de Order y OrderItem para preparar la creación del flujo principal de NovaMarket."
order: 12
module: "Módulo 2 · Primer flujo funcional del sistema"
level: "base"
draft: false
---

# Creando el modelo de orden en `order-service`

Ya tenemos dos piezas funcionales del dominio en NovaMarket:

- el catálogo,
- y el inventario.

Ahora nos toca empezar a construir el centro del flujo principal del sistema:

**las órdenes.**

En esta clase vamos a crear el modelo base que va a usar `order-service` para representar una orden y sus ítems.

Todavía no vamos a persistir órdenes ni a validar stock con otros servicios.  
Primero queremos definir una estructura clara sobre la que después podamos montar el endpoint `POST /orders` y, más adelante, todo el flujo distribuido del proyecto.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creada la clase `Order`,
- creada la clase `OrderItem`,
- definidos sus campos principales,
- ubicadas en el paquete correcto,
- y listas para ser utilizadas por el endpoint de creación de órdenes en la próxima clase.

---

## Estado de partida

Partimos de este contexto:

- `catalog-service` ya expone productos,
- `inventory-service` ya expone inventario,
- `order-service` existe como proyecto base,
- y la estructura de paquetes ya fue definida.

Dentro de `order-service`, deberíamos tener algo parecido a esto:

```txt
src/main/java/com/novamarket/order/
  OrderServiceApplication.java
  controller/
  service/
  repository/
  model/
  dto/
  config/
```

---

## Qué vamos a construir hoy

En esta clase vamos a:

- pensar cómo representar una orden en NovaMarket,
- definir la clase `Order`,
- definir la clase `OrderItem`,
- ubicar ambas en `model/`,
- y dejar preparado el dominio para el primer endpoint real de órdenes.

---

## Qué representa una orden en NovaMarket

Una orden es la intención de compra enviada por un usuario.

En esta primera etapa, una orden no necesita modelar todavía todos los detalles posibles del negocio.  
No hace falta incluir pagos, envíos, auditoría compleja ni estados distribuidos avanzados.

Lo que sí necesitamos es una estructura lo bastante buena como para:

- recibir productos con cantidades,
- identificar una orden,
- representar un estado inicial,
- y empezar a construir el flujo principal del sistema.

---

## Modelo inicial recomendado

Una primera versión razonable de `Order` podría incluir:

- `id`
- `status`
- `items`

Y una primera versión razonable de `OrderItem` podría incluir:

- `productId`
- `quantity`

Con eso ya podemos empezar a recibir órdenes simples.

Más adelante podremos enriquecer este modelo con:

- precios unitarios,
- totales,
- usuario,
- timestamps,
- estados más detallados,
- y persistencia.

---

## Paso 1 · Crear la clase `OrderItem`

Dentro de `order-service`, creá esta clase en:

```txt
src/main/java/com/novamarket/order/model/OrderItem.java
```

Una primera versión razonable podría ser:

```java
package com.novamarket.order.model;

public class OrderItem {

    private Long productId;
    private Integer quantity;

    public OrderItem() {
    }

    public OrderItem(Long productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
```

---

## Por qué empezamos por `OrderItem`

Porque una orden no tiene sentido sin ítems.

Además, este modelo ya deja claras dos decisiones importantes:

- los productos dentro de una orden se referencian por `productId`,
- y la cantidad solicitada forma parte del flujo desde el primer momento.

Esto encaja perfectamente con el hecho de que catálogo e inventario ya usan ese identificador como referencia principal.

---

## Paso 2 · Crear la clase `Order`

Ahora creá esta clase en:

```txt
src/main/java/com/novamarket/order/model/Order.java
```

Una versión base razonable podría ser:

```java
package com.novamarket.order.model;

import java.util.List;

public class Order {

    private Long id;
    private String status;
    private List<OrderItem> items;

    public Order() {
    }

    public Order(Long id, String status, List<OrderItem> items) {
        this.id = id;
        this.status = status;
        this.items = items;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }
}
```

---

## Por qué usamos `status` como `String` por ahora

En un diseño más maduro, podríamos usar un enum y seguramente más adelante tenga mucho sentido hacerlo.

Pero para esta etapa del curso, usar `String` tiene una ventaja práctica:

- mantiene la implementación simple,
- evita introducir demasiada complejidad al mismo tiempo,
- y nos permite enfocarnos primero en el flujo de creación.

Cuando el curso avance, podremos refinar este punto.

---

## Estado inicial sugerido para una orden

Aunque todavía no exponemos el endpoint, conviene decidir desde ahora qué estado inicial va a tener una orden simple.

Una opción razonable para esta primera versión es:

```txt
CREATED
```

Más adelante van a aparecer otros estados posibles, como por ejemplo:

- `REJECTED`
- `CONFIRMED`
- `CANCELLED`

Pero por ahora, `CREATED` es suficiente para un primer flujo básico.

---

## Paso 3 · Revisar la estructura final de `order-service`

Después de crear estas clases, la estructura debería verse aproximadamente así:

```txt
src/main/java/com/novamarket/order/
  OrderServiceApplication.java
  controller/
  service/
  repository/
  model/
    Order.java
    OrderItem.java
  dto/
  config/
```

Todavía no tenemos `OrderService` ni `OrderController`, y eso es correcto para esta etapa.

---

## Paso 4 · Revisar coherencia con los otros servicios

Es importante verificar que `OrderItem` use `productId` como punto de referencia, porque eso mantiene coherencia con:

- `Product` en `catalog-service`
- `InventoryItem` en `inventory-service`

Esta alineación es muy valiosa, porque nos evita tener que corregir contratos internos del sistema más adelante.

---

## Paso 5 · Levantar nuevamente `order-service`

Ahora conviene volver a arrancar `order-service`.

La idea es verificar que:

- las nuevas clases no introdujeron errores,
- el proyecto sigue compilando,
- y el servicio continúa levantando correctamente.

Todavía no hay endpoint de órdenes, pero queremos mantener la lógica de validación paso a paso.

---

## Qué todavía no hicimos

Todavía no implementamos:

- `OrderService`,
- `OrderController`,
- el endpoint `POST /orders`,
- validaciones,
- integración con inventario,
- persistencia,
- ni cálculo de precio o total.

Todo eso viene a continuación.

Lo importante hoy es dejar el dominio base de órdenes bien definido.

---

## Posibles mejoras futuras ya previstas

Este modelo inicial nos deja listos varios pasos futuros:

- agregar precios unitarios a los ítems,
- calcular total de orden,
- modelar estados con enum,
- persistir la orden,
- validar stock antes de crearla,
- publicar eventos después de su creación.

En otras palabras: aunque el modelo sea simple, está bien orientado para crecer.

---

## Errores comunes en esta etapa

### 1. Querer meter demasiados campos desde ahora
Todavía no hace falta.

### 2. Romper coherencia con los ids de producto
Conviene mantener `productId` como referencia entre servicios.

### 3. Crear las clases fuera de `model/`
El curso ya fijó una estructura y conviene sostenerla.

### 4. Introducir lógica de negocio dentro del modelo demasiado pronto
Todavía no es necesario.

### 5. No volver a compilar ni a levantar el servicio
En este curso, cada paso importante se verifica.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, dentro de `order-service` debería existir:

```txt
src/main/java/com/novamarket/order/model/Order.java
src/main/java/com/novamarket/order/model/OrderItem.java
```

Y ambas clases deberían representar correctamente la estructura básica de una orden simple.

Además, `order-service` debería seguir arrancando sin errores.

---

## Punto de control

Antes de seguir, verificá que:

- existe `Order`,
- existe `OrderItem`,
- ambas clases están en `model/`,
- compilan correctamente,
- y `order-service` sigue levantando bien.

Si eso está listo, ya podemos pasar a exponer el primer endpoint real del servicio de órdenes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a crear `POST /orders`.

Ese endpoint va a ser el primer punto real de entrada para el flujo central de NovaMarket.

---

## Cierre

En esta clase creamos el modelo base de órdenes del sistema.

Con `Order` y `OrderItem`, `order-service` deja preparada la estructura mínima necesaria para empezar a recibir solicitudes reales de creación de órdenes y transformarse, por fin, en el núcleo funcional del proyecto.
