---
title: "Exponiendo endpoints de inventario"
description: "Implementación de los primeros endpoints funcionales de inventory-service. Creación de un servicio simple en memoria, exposición de consultas de stock y verificación de disponibilidad por producto."
order: 11
module: "Módulo 2 · Primer flujo funcional del sistema"
level: "base"
draft: false
---

# Exponiendo endpoints de inventario

En la clase anterior creamos el modelo `InventoryItem` dentro de `inventory-service`.

Ahora toca convertir ese modelo en algo útil para el sistema:

**una API real de inventario.**

Todavía no vamos a usar base de datos ni integración con `order-service`.  
Primero queremos que `inventory-service` pueda responder consultas simples y verificables sobre disponibilidad de productos.

Igual que hicimos con el catálogo, en esta etapa conviene ir por una implementación sencilla en memoria.  
Eso nos permite avanzar rápido, validar el comportamiento del servicio y dejar lista una base muy clara para cuando más adelante conectemos órdenes con inventario.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar funcionando en `inventory-service`:

- `GET /inventory`
- `GET /inventory/{productId}`

Además, el servicio debería tener:

- una clase de servicio simple,
- datos en memoria para disponibilidad,
- un controlador funcional,
- y respuestas verificables mediante navegador, Postman o `curl`.

---

## Estado de partida

Partimos de `inventory-service` con esta base:

- el servicio ya arranca correctamente,
- existe la clase `InventoryItem`,
- y la estructura interna por paquetes ya está definida.

Por ejemplo:

```txt
src/main/java/com/novamarket/inventory/
  InventoryServiceApplication.java
  controller/
  service/
  repository/
  model/
    InventoryItem.java
  dto/
  config/
```

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear un `InventoryService`,
- cargar algunos datos de stock en memoria,
- crear un `InventoryController`,
- exponer `GET /inventory`,
- exponer `GET /inventory/{productId}`,
- y probar ambas rutas.

---

## Enfoque recomendado para esta etapa

Todavía no estamos en la fase de persistencia, así que la opción más práctica es usar una lista en memoria.

Eso nos deja varias ventajas:

- implementación directa,
- muy poca fricción,
- fácil verificación manual,
- y posibilidad de avanzar rápido hacia la integración con órdenes.

Más adelante, cuando llegue JPA, vamos a reemplazar esta estrategia por una implementación persistente.

---

## Paso 1 · Crear `InventoryService`

Dentro de `inventory-service`, creá la clase:

```txt
src/main/java/com/novamarket/inventory/service/InventoryService.java
```

Una implementación inicial razonable podría ser esta:

```java
package com.novamarket.inventory.service;

import com.novamarket.inventory.model.InventoryItem;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryService {

    private final List<InventoryItem> inventory = List.of(
        new InventoryItem(1L, 15),
        new InventoryItem(2L, 40),
        new InventoryItem(3L, 8)
    );

    public List<InventoryItem> findAll() {
        return inventory;
    }

    public InventoryItem findByProductId(Long productId) {
        return inventory.stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .orElse(null);
    }
}
```

---

## Qué representa esta lista en memoria

Cada entrada representa stock disponible para un producto del catálogo.

Por ejemplo:

- producto `1` tiene `15` unidades,
- producto `2` tiene `40`,
- producto `3` tiene `8`.

No importa tanto que los números sean definitivos.  
Lo importante es que existan datos suficientes para probar el flujo del sistema.

Además, elegimos `productId` compatibles con los ids que definimos en `catalog-service` para mantener coherencia entre los dos dominios.

---

## Paso 2 · Crear `InventoryController`

Ahora creá esta clase en:

```txt
src/main/java/com/novamarket/inventory/controller/InventoryController.java
```

Una versión inicial razonable podría ser:

```java
package com.novamarket.inventory.controller;

import com.novamarket.inventory.model.InventoryItem;
import com.novamarket.inventory.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<InventoryItem> findAll() {
        return inventoryService.findAll();
    }

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryItem> findByProductId(@PathVariable Long productId) {
        InventoryItem item = inventoryService.findByProductId(productId);

        if (item == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(item);
    }
}
```

---

## Qué expone este controlador

### `GET /inventory`
Devuelve todo el stock cargado en memoria.

### `GET /inventory/{productId}`
Busca una entrada de inventario por id de producto y:

- devuelve `200 OK` si existe,
- devuelve `404 Not Found` si no existe.

Esto ya nos deja el servicio preparado para que más adelante `order-service` pueda consultar disponibilidad real de productos.

---

## Paso 3 · Revisar la estructura final de `inventory-service`

Después de agregar estas clases, la estructura debería verse aproximadamente así:

```txt
src/main/java/com/novamarket/inventory/
  InventoryServiceApplication.java
  controller/
    InventoryController.java
  service/
    InventoryService.java
  repository/
  model/
    InventoryItem.java
  dto/
  config/
```

Todavía no usamos `repository`, `dto` ni `config` para esta funcionalidad, y eso es totalmente correcto para esta etapa.

---

## Paso 4 · Levantar `inventory-service`

Ahora toca volver a arrancar el servicio.

Queremos verificar que:

- el proyecto compile,
- Spring detecte controller y service,
- y la aplicación quede arriba en el puerto configurado.

Si venías usando `8082`, entonces el servicio debería seguir escuchando ahí.

---

## Paso 5 · Probar `GET /inventory`

Una vez levantado el servicio, probá:

```txt
http://localhost:8082/inventory
```

O con `curl`:

```bash
curl http://localhost:8082/inventory
```

La respuesta esperada debería ser una lista JSON con las entradas de inventario cargadas en memoria.

Algo parecido a:

```json
[
  {
    "productId": 1,
    "availableQuantity": 15
  },
  {
    "productId": 2,
    "availableQuantity": 40
  }
]
```

---

## Paso 6 · Probar `GET /inventory/{productId}`

Ahora probá una consulta puntual.

Por ejemplo:

```txt
http://localhost:8082/inventory/1
```

O con `curl`:

```bash
curl http://localhost:8082/inventory/1
```

La respuesta esperada debería ser el inventario del producto `1`.

También conviene probar un id inexistente:

```txt
http://localhost:8082/inventory/99
```

En ese caso, la respuesta debería ser `404 Not Found`.

---

## Qué estamos logrando con esta clase

Después de esta clase, NovaMarket ya tiene dos servicios funcionales del dominio:

- `catalog-service`
- `inventory-service`

Y ambos responden información real del sistema, aunque todavía lo hagan desde listas en memoria.

Esto ya empieza a acercarnos mucho al punto donde `order-service` va a poder apoyarse en ellos para tomar decisiones.

---

## Qué todavía no hicimos

Todavía no implementamos:

- validación explícita de “hay stock suficiente para cantidad X”,
- integración con órdenes,
- persistencia,
- seguridad,
- ni eventos.

Eso viene después.

Por ahora, el objetivo es que el servicio de inventario ya tenga una API usable y verificable.

---

## Detalle importante para el futuro

Fijate que elegimos exponer el inventario por `productId`.

Eso encaja muy bien con el diseño general porque:

- `catalog-service` identifica productos por `id`,
- `inventory-service` responde stock para ese mismo `id`,
- y `order-service` más adelante va a enviar ítems usando ese identificador.

Este tipo de coherencia simplifica mucho la construcción progresiva del sistema.

---

## Errores comunes en esta etapa

### 1. Usar ids de inventario que no coinciden con productos del catálogo
Conviene mantener coherencia entre los datos de ejemplo.

### 2. Crear el controller en el paquete equivocado
Debería vivir en `controller/`.

### 3. No manejar el caso inexistente
Para ids que no existan, devolver `404` es lo más sano en esta etapa.

### 4. No volver a levantar el servicio después de agregar las clases
En este curso, cada paso importante se valida.

### 5. Mezclar ya lógica avanzada de stock
Todavía no hace falta validar cantidades solicitadas ni reservas.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `inventory-service` debería exponer correctamente:

- `GET /inventory`
- `GET /inventory/{productId}`

Y deberías poder consultar disponibilidad real para productos del sistema.

Esto deja listo el segundo servicio funcional importante de NovaMarket.

---

## Punto de control

Antes de seguir, verificá que:

- existe `InventoryService`,
- existe `InventoryController`,
- `GET /inventory` devuelve la lista,
- `GET /inventory/{productId}` devuelve una entrada válida,
- y los ids usados mantienen coherencia con `catalog-service`.

Si eso está bien, ya podemos pasar al dominio de órdenes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a construir el modelo de orden en `order-service`.

Ese es el paso que nos va a permitir preparar el endpoint de creación de órdenes y, más adelante, conectar el sistema completo.

---

## Cierre

En esta clase convertimos `inventory-service` en una API funcional real.

Con eso, NovaMarket ya tiene catálogo e inventario operativos, y queda preparado para que el próximo gran paso del curso sea construir el dominio de órdenes sobre servicios que ya exponen información verificable.
