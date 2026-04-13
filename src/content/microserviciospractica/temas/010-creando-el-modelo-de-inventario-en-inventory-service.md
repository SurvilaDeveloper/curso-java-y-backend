---
title: "Creando el modelo de inventario en inventory-service"
description: "Construcción del modelo inicial de inventario en inventory-service. Definición de InventoryItem y de la información mínima necesaria para validar stock dentro del flujo de NovaMarket."
order: 10
module: "Módulo 2 · Primer flujo funcional del sistema"
level: "base"
draft: false
---

# Creando el modelo de inventario en `inventory-service`

Ya tenemos el primer servicio funcional del dominio:

**`catalog-service`** expone productos y nos permite consultar el catálogo.

Ahora vamos a avanzar sobre la segunda pieza clave del flujo principal de NovaMarket:

**el inventario.**

En esta clase todavía no vamos a exponer todos los endpoints de stock ni a integrar órdenes con inventario.  
Primero vamos a definir el modelo base con el que `inventory-service` va a representar la disponibilidad de productos.

El objetivo es simple pero importante:  
dejar claro qué información necesita el sistema para poder responder si un producto tiene o no stock disponible.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creada la clase `InventoryItem` dentro de `inventory-service`,
- definidos sus campos principales,
- ubicada en el paquete correcto,
- y lista para ser usada en la próxima clase por los endpoints de inventario.

Todavía no vamos a persistirla ni a integrar este servicio con `order-service`.

---

## Estado de partida

Partimos de este contexto:

- `catalog-service` ya expone `GET /products` y `GET /products/{id}`,
- `inventory-service` ya existe y arranca correctamente,
- `order-service` también existe como base,
- y la estructura por paquetes ya fue definida en todos los servicios.

Dentro de `inventory-service`, deberíamos tener algo parecido a esto:

```txt
src/main/java/com/novamarket/inventory/
  InventoryServiceApplication.java
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

- pensar cómo representar stock en NovaMarket,
- definir un modelo inicial de inventario,
- crear la clase `InventoryItem`,
- ubicarla dentro de `model/`,
- y dejarla lista para ser utilizada por el servicio y los endpoints en la próxima clase.

---

## Qué representa el inventario en NovaMarket

El inventario es la parte del sistema que responde una pregunta fundamental:

**¿hay unidades disponibles de un producto?**

Para esta etapa del curso no hace falta modelar un sistema logístico complejo.  
No necesitamos depósitos múltiples, reservas avanzadas ni movimientos históricos.

Lo que sí necesitamos es algo suficiente para empezar a trabajar con el flujo de órdenes.

Una representación inicial muy razonable de inventario podría incluir:

- `productId`
- `availableQuantity`

Y opcionalmente podríamos pensar en algo como:

- `reservedQuantity`

Pero para este momento del curso, conviene mantener el modelo lo más simple posible.

---

## Recomendación para esta etapa

La clase inicial puede ser simple y concreta.

Una muy buena primera versión sería:

- identificar a qué producto pertenece el inventario,
- y cuántas unidades hay disponibles.

Eso alcanza perfectamente para las primeras validaciones del flujo de NovaMarket.

---

## Paso 1 · Crear la clase `InventoryItem`

Dentro de `inventory-service`, creá esta clase en:

```txt
src/main/java/com/novamarket/inventory/model/InventoryItem.java
```

Una versión base razonable podría ser esta:

```java
package com.novamarket.inventory.model;

public class InventoryItem {

    private Long productId;
    private Integer availableQuantity;

    public InventoryItem() {
    }

    public InventoryItem(Long productId, Integer availableQuantity) {
        this.productId = productId;
        this.availableQuantity = availableQuantity;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }
}
```

---

## Por qué este modelo es suficiente por ahora

Con esta clase ya podemos responder lo esencial:

- qué producto estamos evaluando,
- y cuántas unidades hay disponibles.

Más adelante podremos enriquecer el modelo si realmente hace falta, por ejemplo para:

- reservas,
- estados intermedios,
- movimientos,
- auditoría,
- o estrategias más avanzadas de consistencia.

Pero por ahora conviene no adelantarse.

---

## Paso 2 · Revisar si el nombre del modelo tiene sentido

El nombre `InventoryItem` es una buena elección porque no representa “todo el inventario del sistema”, sino una entrada concreta del inventario asociada a un producto.

Eso ayuda bastante a que el diseño quede más expresivo y menos ambiguo.

---

## Paso 3 · Pensar la relación con el catálogo

Aunque todavía no hay integración técnica entre servicios, conceptualmente este modelo ya está relacionado con `catalog-service`.

La relación es sencilla:

- `catalog-service` conoce productos,
- `inventory-service` conoce disponibilidad por `productId`.

Ese desacoplamiento es importante.

Fijate que `inventory-service` no necesita duplicar toda la información del producto.  
Le alcanza con saber a qué producto corresponde el stock.

Eso ya va introduciendo una idea sana de responsabilidades separadas.

---

## Paso 4 · Verificar imports y compilación

Después de crear la clase, conviene revisar:

- package declaration,
- imports,
- y compilación general del servicio.

Aunque sea un paso simple, ayuda a mantener el proyecto sano antes de seguir con más construcción.

---

## Paso 5 · Levantar nuevamente `inventory-service`

Ahora conviene volver a arrancar `inventory-service`.

La idea es verificar que:

- el nuevo modelo no introdujo errores,
- el paquete está bien ubicado,
- y el servicio sigue levantando correctamente.

Todavía no existe un endpoint usando `InventoryItem`, pero ya queremos dejar el modelo incorporado y validado.

---

## Qué todavía no hicimos

Todavía no implementamos:

- un `InventoryService`,
- un `InventoryController`,
- carga en memoria de stock,
- validación de disponibilidad,
- integración con `order-service`,
- ni persistencia.

Todo eso viene después.

El objetivo de hoy es solamente dejar el modelo inicial bien definido.

---

## Qué decisiones estamos preparando para el futuro

Con esta clase ya dejamos lista la base para que en la próxima podamos construir rutas como:

- consultar stock por producto,
- o validar disponibilidad para un producto específico.

También queda preparado el terreno para que más adelante `order-service` pueda apoyarse en este servicio para decidir si una orden puede crearse.

---

## Posible extensión futura del modelo

Más adelante, si el curso lo necesita, `InventoryItem` podría crecer con campos como:

- `reservedQuantity`
- `warehouseCode`
- `updatedAt`

Pero en esta etapa conviene no sobrecargar el diseño.

Lo mejor es avanzar con un modelo que sirva al flujo actual del proyecto.

---

## Errores comunes en esta etapa

### 1. Meter demasiada complejidad en el modelo
Todavía no hace falta.

### 2. Duplicar información innecesaria del producto
`inventory-service` no necesita conocer todo el catálogo.

### 3. Crear la clase fuera de `model/`
Conviene seguir el patrón de estructura fijado en el curso.

### 4. No recompilar o no volver a levantar el servicio
La verificación continua sigue siendo una parte central del método de trabajo.

### 5. Confundir responsabilidad de catálogo con responsabilidad de inventario
Un producto y su stock no son exactamente lo mismo, aunque estén relacionados.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, dentro de `inventory-service` debería existir:

```txt
src/main/java/com/novamarket/inventory/model/InventoryItem.java
```

Y esa clase debería representar de forma clara la disponibilidad de un producto a través de:

- `productId`
- `availableQuantity`

Además, `inventory-service` debería seguir arrancando sin errores.

---

## Punto de control

Antes de seguir, verificá que:

- existe la clase `InventoryItem`,
- está ubicada en `model/`,
- compila correctamente,
- el servicio sigue levantando,
- y el diseño del modelo te resulta suficiente para empezar a exponer inventario.

Si eso está listo, en la próxima clase ya vamos a poder construir la API básica de stock.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a exponer los primeros endpoints de inventario.

Eso significa que `inventory-service` va a empezar a responder datos útiles del dominio, igual que ya lo hace `catalog-service`.

---

## Cierre

En esta clase creamos `InventoryItem`, el modelo inicial del servicio de inventario de NovaMarket.

Con esto, `inventory-service` deja preparada su base de dominio y ya queda listo para transformarse, en la próxima clase, en una API funcional capaz de responder disponibilidad de productos.
