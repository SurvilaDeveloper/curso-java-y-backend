---
title: "Persistiendo órdenes en order-service"
description: "Migración de order-service desde creación en memoria hacia persistencia real con Spring Data JPA, manteniendo operativo el flujo de creación de órdenes en NovaMarket."
order: 18
module: "Módulo 3 · Persistencia real con JPA"
level: "intermedio"
draft: false
---

# Persistiendo órdenes en `order-service`

Hasta este punto, NovaMarket ya tiene:

- catálogo persistente,
- inventario persistente,
- y un flujo de creación de órdenes que valida stock antes de aceptar la operación.

Pero todavía hay una pieza importante que sigue incompleta:

**las órdenes no quedan guardadas en ningún lado.**

`order-service` recibe la request, valida stock y devuelve una orden creada, pero esa orden no persiste realmente en el sistema.

En esta clase vamos a resolver eso.

La idea es que `order-service` pase de una implementación en memoria a una implementación con **Spring Data JPA**, de forma que las órdenes ya queden registradas de verdad.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregada persistencia JPA a `order-service`,
- configurada una base de datos de trabajo,
- adaptados `Order` y `OrderItem` para persistencia,
- creado el repositorio de órdenes,
- modificado `OrderService` para guardar la orden,
- y mantenido operativo:
  - `POST /orders`

---

## Estado de partida

Partimos de este contexto:

- `catalog-service` ya usa persistencia,
- `inventory-service` ya usa persistencia,
- `order-service` ya valida stock,
- pero `order-service` todavía genera y devuelve órdenes sin almacenarlas realmente.

Eso significa que si reiniciamos el servicio, no existe ningún registro de las órdenes creadas previamente.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- agregar dependencias de persistencia,
- configurar datasource y JPA en `order-service`,
- adaptar `Order`,
- adaptar `OrderItem`,
- crear `OrderRepository`,
- modificar `OrderService`,
- y verificar que `POST /orders` siga funcionando ahora con persistencia real.

---

## Decisión práctica para esta etapa

Igual que en `catalog-service` e `inventory-service`, una muy buena opción para esta fase del curso es usar **H2** como base de trabajo.

Eso nos permite:

- mantener coherencia entre servicios,
- avanzar rápido,
- centrarnos en JPA,
- y validar el flujo completo sin meter todavía una infraestructura de bases externas más pesada.

Más adelante podremos mover el sistema a una base distinta si el curso lo necesita.

---

## Paso 1 · Agregar dependencias necesarias

Dentro de `order-service`, asegurate de incluir en el `pom.xml` las dependencias necesarias para trabajar con persistencia.

Como mínimo:

- **Spring Data JPA**
- **H2 Database** si estás usando H2 en esta etapa

El objetivo es dejar el servicio listo para gestionar órdenes con entidades reales.

---

## Paso 2 · Configurar la base en `application.yml`

Ahora agregá configuración de datasource y JPA en `order-service`.

Una base razonable para esta etapa podría verse conceptualmente así:

```yaml
spring:
  application:
    name: order-service
  datasource:
    url: jdbc:h2:mem:orderdb
    driver-class-name: org.h2.Driver
    username: sa
    password:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

server:
  port: 8083
```

Esto deja al servicio listo para persistir órdenes en una base en memoria de trabajo administrada por JPA.

---

## Paso 3 · Adaptar `OrderItem` como embebible

Como `OrderItem` forma parte de una orden y no lo estamos modelando todavía como entidad independiente, una forma razonable de trabajar en esta etapa es tratarlo como una colección embebida.

Una versión posible podría quedar así:

```java
package com.novamarket.order.model;

import jakarta.persistence.Embeddable;

@Embeddable
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

## Paso 4 · Adaptar `Order` como entidad

Ahora transformemos `Order` en una entidad persistente.

Una versión razonable para esta etapa podría ser:

```java
package com.novamarket.order.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String status;

    @ElementCollection
    @CollectionTable(name = "order_items", joinColumns = @JoinColumn(name = "order_id"))
    private List<OrderItem> items;

    public Order() {
    }

    public Order(Long id, String status, List<OrderItem> items) {
        this.id = id;
        this.status = status;
        this.items = items;
    }

    public Order(String status, List<OrderItem> items) {
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

## Por qué cambiamos la generación del id

Hasta ahora veníamos usando un `AtomicLong` para generar ids en memoria.

Ahora que la orden va a persistirse, tiene mucho más sentido dejar que la base gestione el identificador mediante `@GeneratedValue`.

Esto simplifica bastante la lógica del servicio y hace más realista el comportamiento del sistema.

---

## Paso 5 · Crear `OrderRepository`

Dentro de `order-service`, creá:

```txt
src/main/java/com/novamarket/order/repository/OrderRepository.java
```

Una implementación mínima razonable podría ser:

```java
package com.novamarket.order.repository;

import com.novamarket.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
```

Esto ya nos da operaciones persistentes básicas sobre órdenes.

---

## Paso 6 · Modificar `OrderService`

Ahora toca adaptar el servicio para que, después de validar stock, guarde la orden de verdad.

Una versión razonable podría quedar así:

```java
package com.novamarket.order.service;

import com.novamarket.order.dto.CreateOrderRequest;
import com.novamarket.order.dto.InventoryItemResponse;
import com.novamarket.order.model.Order;
import com.novamarket.order.model.OrderItem;
import com.novamarket.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private final InventoryClient inventoryClient;
    private final OrderRepository orderRepository;

    public OrderService(InventoryClient inventoryClient, OrderRepository orderRepository) {
        this.inventoryClient = inventoryClient;
        this.orderRepository = orderRepository;
    }

    public Order createOrder(CreateOrderRequest request) {
        for (OrderItem item : request.getItems()) {
            InventoryItemResponse inventory = inventoryClient.findByProductId(item.getProductId());

            if (inventory == null || inventory.getAvailableQuantity() == null) {
                throw new IllegalArgumentException("No se pudo obtener inventario para el producto " + item.getProductId());
            }

            if (inventory.getAvailableQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Stock insuficiente para el producto " + item.getProductId());
            }
        }

        Order order = new Order("CREATED", request.getItems());
        return orderRepository.save(order);
    }
}
```

Fijate que desaparece la necesidad del `AtomicLong`.  
Ahora el id surge del persistir la orden.

---

## Paso 7 · Levantar `order-service`

Ahora toca volver a arrancar `order-service`.

En este punto conviene revisar:

- que JPA levante correctamente,
- que no haya errores con `@ElementCollection`,
- que se creen las tablas esperadas,
- y que la aplicación siga pudiendo integrarse con `inventory-service`.

Como `order-service` sigue dependiendo de inventario, conviene tener también levantado `inventory-service` durante las pruebas.

---

## Paso 8 · Probar `POST /orders` otra vez

Ahora repetí una orden válida:

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

La respuesta esperada debería seguir siendo una orden con:

- `status = CREATED`
- lista de ítems
- y ahora un `id` generado por persistencia

Eso significa que, desde afuera, el endpoint mantiene su intención funcional, pero por dentro ya pasó a operar sobre almacenamiento real.

---

## Paso 9 · Verificar que los ids realmente vienen de la base

Repetí el mismo request una o dos veces más.

La idea es comprobar que:

- cada orden recibe un id persistente distinto,
- y el sistema ya no depende del generador en memoria.

Esto es importante porque marca un cambio real de arquitectura interna.

---

## Paso 10 · Considerar exponer una consulta más adelante

En esta clase no hace falta todavía crear `GET /orders`.

Pero vale la pena notar que, ahora que las órdenes son persistentes, ya tendría sentido sumar un endpoint así en otro momento del curso si quisiéramos inspeccionarlas directamente.

Por ahora, el foco sigue estando en dejar el flujo principal persistente.

---

## Qué estamos logrando con esta clase

Esta clase completa un hito importante:

**los tres dominios principales del sistema ya no dependen solo de listas en memoria.**

Ahora tenemos:

- catálogo persistente,
- inventario persistente,
- órdenes persistentes.

Eso hace que NovaMarket ya se comporte mucho más como una aplicación real.

---

## Qué todavía no hicimos

Todavía no estamos:

- descontando stock,
- reservando unidades,
- persistiendo precios históricos dentro de la orden,
- ni modelando estados más avanzados.

Tampoco creamos todavía endpoints de consulta de órdenes.

Todo eso puede venir más adelante.

La meta de hoy es más precisa:

**que `POST /orders` ya cree órdenes persistentes.**

---

## Errores comunes en esta etapa

### 1. No marcar `Order` como entidad
Entonces JPA no puede persistir la orden.

### 2. Modelar mal la colección de ítems
Sin `@ElementCollection`, esta versión del diseño no va a funcionar como esperamos.

### 3. Mantener el `AtomicLong` innecesariamente
Ahora ya no hace falta.

### 4. No tener levantado `inventory-service`
La validación de stock sigue siendo parte del flujo.

### 5. No probar varias creaciones de orden
Eso ayuda a confirmar que la persistencia realmente está generando ids distintos.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `order-service` debería:

- usar JPA,
- persistir las órdenes creadas,
- seguir validando stock antes de guardarlas,
- y responder correctamente a `POST /orders`.

Eso deja al núcleo del flujo principal ya funcionando sobre persistencia real.

---

## Punto de control

Antes de seguir, verificá que:

- `Order` es entidad JPA,
- `OrderItem` está correctamente mapeado,
- existe `OrderRepository`,
- `OrderService` guarda la orden,
- `POST /orders` sigue funcionando,
- y los ids ya no dependen de un generador en memoria.

Si todo eso está bien, el siguiente paso lógico es revisar el estado actual del sistema y sus datos persistentes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a hacer un checkpoint práctico del bloque de persistencia:

- revisar datos iniciales,
- verificar que la persistencia quedó sana,
- y confirmar el comportamiento del sistema después de estos cambios.

---

## Cierre

En esta clase migramos `order-service` hacia persistencia real con JPA.

Con eso, NovaMarket ya no solo valida stock y crea órdenes: ahora también las registra de verdad en el sistema.

Este es uno de los saltos más importantes del proyecto hasta ahora, porque consolida el flujo principal sobre una base mucho más seria y sostenible.
