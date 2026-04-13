---
title: "Integrando OpenFeign en order-service"
description: "Primer paso hacia una comunicación más profesional entre microservicios en NovaMarket. Incorporación de OpenFeign en order-service para preparar el reemplazo de la llamada HTTP manual."
order: 29
module: "Módulo 5 · Service Discovery y comunicación profesional"
level: "intermedio"
draft: false
---

# Integrando OpenFeign en `order-service`

Hasta acá, `order-service` ya consulta a `inventory-service`, pero lo hace mediante una llamada HTTP manual y rígida.

Eso nos sirvió mucho para entender la primera integración entre servicios, pero ya llegamos a un punto donde conviene profesionalizar ese mecanismo.

La herramienta que vamos a usar para eso es **OpenFeign**.

OpenFeign nos permite declarar clientes HTTP de una forma mucho más expresiva y mantenible.  
En vez de construir manualmente la llamada con una URL fija, vamos a definir una interfaz que represente el contrato del servicio remoto.

En esta clase todavía no vamos a reemplazar completamente la llamada por nombre lógico.  
Primero vamos a integrar Feign en `order-service` y dejarlo listo para que en la próxima clase lo combinemos con Eureka.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregada la dependencia de OpenFeign en `order-service`,
- habilitado Feign en la aplicación,
- creado un cliente declarativo para inventario,
- y lista la base para dejar atrás el cliente manual actual.

Todavía no vamos a eliminar la URL fija del todo.  
La meta de hoy es preparar correctamente el terreno.

---

## Estado de partida

En este punto del curso:

- `discovery-server` ya existe,
- los servicios principales ya están registrados en Eureka,
- `order-service` ya consulta a `inventory-service`,
- pero esa consulta todavía se apoya en un cliente manual con `RestTemplate` y una URL fija.

Es decir: ya tenemos discovery, pero todavía no estamos aprovechándolo en la integración real.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- agregar la dependencia de OpenFeign a `order-service`,
- habilitar Feign en la aplicación,
- crear una interfaz cliente para inventario,
- y adaptar parcialmente la estructura del servicio para prepararlo para el siguiente paso.

---

## Qué problema resuelve OpenFeign

El problema principal es que la integración actual está demasiado atada al detalle técnico de la llamada.

Por ejemplo:

- hay una URL explícita dentro del código,
- el cliente manual necesita más infraestructura imperativa,
- y el contrato con el servicio remoto no está expresado de forma especialmente clara.

OpenFeign permite modelar mejor esa frontera.

En vez de decir “hacé una llamada a esta URL”, vamos a decir algo más cercano a:

**“quiero un cliente que consulte inventario por producto”.**

Eso vuelve la integración más legible y más fácil de evolucionar.

---

## Paso 1 · Agregar la dependencia de OpenFeign

Dentro de `order-service`, agregá en el `pom.xml` la dependencia correspondiente a:

- **OpenFeign**

Asegurate de usar la variante que sea coherente con el stack de Spring Cloud que ya venís usando en el proyecto.

La idea es que `order-service` gane la capacidad de declarar clientes HTTP mediante interfaces.

---

## Paso 2 · Habilitar Feign en la aplicación

Ahora vamos a marcar `order-service` como una aplicación que puede usar clientes Feign.

En la clase principal de `order-service`, agregá la anotación correspondiente.

Una versión razonable podría quedar así:

```java
package com.novamarket.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class OrderServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
```

Con esto, Spring ya va a poder detectar e instanciar interfaces Feign.

---

## Paso 3 · Crear el cliente Feign para inventario

Ahora creá una interfaz específica para consultar `inventory-service`.

Podés ubicarla en:

```txt
src/main/java/com/novamarket/order/service/InventoryFeignClient.java
```

En esta etapa todavía vamos a usar una versión transicional, así que una opción razonable es dejar explícita la URL primero y después reemplazarla por nombre lógico en la próxima clase.

Una primera versión podría ser:

```java
package com.novamarket.order.service;

import com.novamarket.order.dto.InventoryItemResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "inventory-client", url = "http://localhost:8082")
public interface InventoryFeignClient {

    @GetMapping("/inventory/{productId}")
    InventoryItemResponse findByProductId(@PathVariable("productId") Long productId);
}
```

Esta versión ya nos deja varias mejoras respecto del cliente manual:

- contrato más expresivo,
- menos código imperativo,
- y una frontera remota más clara.

---

## Por qué arrancamos con una versión transicional

Podríamos intentar saltar directamente a Feign + Eureka en una sola clase, pero pedagógicamente conviene separar las cosas.

Primero queremos que quede claro:

- qué aporta Feign por sí mismo,
- cómo se define el cliente,
- y cómo se integra con el servicio.

Después, en la próxima clase, vamos a quitar la URL fija y apoyarnos en el nombre lógico de Eureka.

Ese orden hace el curso mucho más claro.

---

## Paso 4 · Adaptar `OrderService` para usar Feign

Ahora vamos a reemplazar el uso del cliente manual por el cliente declarativo nuevo.

Una versión razonable de `OrderService` podría quedar así:

```java
package com.novamarket.order.service;

import com.novamarket.order.dto.CreateOrderItemRequest;
import com.novamarket.order.dto.CreateOrderRequest;
import com.novamarket.order.dto.InventoryItemResponse;
import com.novamarket.order.model.Order;
import com.novamarket.order.model.OrderItem;
import com.novamarket.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final InventoryFeignClient inventoryFeignClient;
    private final OrderRepository orderRepository;

    public OrderService(InventoryFeignClient inventoryFeignClient, OrderRepository orderRepository) {
        this.inventoryFeignClient = inventoryFeignClient;
        this.orderRepository = orderRepository;
    }

    public Order createOrder(CreateOrderRequest request) {
        List<OrderItem> items = request.getItems().stream()
                .map(this::toOrderItem)
                .toList();

        for (OrderItem item : items) {
            InventoryItemResponse inventory = inventoryFeignClient.findByProductId(item.getProductId());

            if (inventory == null || inventory.getAvailableQuantity() == null) {
                throw new IllegalArgumentException("No se pudo obtener inventario para el producto " + item.getProductId());
            }

            if (inventory.getAvailableQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Stock insuficiente para el producto " + item.getProductId());
            }
        }

        Order order = new Order("CREATED", items);
        return orderRepository.save(order);
    }

    private OrderItem toOrderItem(CreateOrderItemRequest item) {
        return new OrderItem(item.getProductId(), item.getQuantity());
    }
}
```

---

## Paso 5 · Conservar temporalmente el cliente manual o retirarlo

En este punto tenés dos opciones razonables:

### Opción 1
Dejar el cliente manual en el proyecto un rato más, pero sin usarlo.

### Opción 2
Eliminarlo ya mismo para evitar confusión.

Para el curso práctico, suele ser más limpio eliminarlo una vez que confirmamos que Feign ya quedó integrado.

Lo importante es que no queden dos caminos de integración activos al mismo tiempo sin necesidad.

---

## Paso 6 · Levantar `inventory-service` y `order-service`

Ahora toca probar el cambio.

Levantá:

- `inventory-service`
- `order-service`

Todavía no estamos usando Eureka para resolver el servicio remoto, pero sí queremos verificar que Feign ya reemplazó correctamente al cliente manual.

---

## Paso 7 · Probar una orden válida

Probá el flujo normal:

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

La respuesta esperada debería seguir siendo una orden válida con:

- `201 Created`
- estado `CREATED`
- y los ítems enviados

Desde afuera, el comportamiento no cambia.  
La mejora está en la forma en que el servicio implementa la integración.

---

## Paso 8 · Probar una orden inválida

También conviene probar:

- falta de stock
- o producto inexistente

Por ejemplo:

```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 3, "quantity": 999 }
    ]
  }'
```

La respuesta debería seguir siendo un error controlado.

Esto confirma que el cambio de cliente no rompió la lógica del flujo.

---

## Qué estamos logrando con esta clase

Esta clase mejora mucho la calidad interna de la integración entre servicios.

Todavía no estamos aprovechando Eureka para resolver la ubicación del servicio remoto, pero sí estamos haciendo algo muy importante:

**pasamos de un cliente manual a un cliente declarativo.**

Eso ya deja a `order-service` bastante mejor preparado para lo que viene.

---

## Qué todavía no hicimos

Todavía no:

- reemplazamos la URL fija por el nombre lógico del servicio,
- usamos balanceo por discovery,
- ni verificamos el consumo real apoyado en Eureka.

Todo eso viene en la próxima clase.

La meta de hoy es más concreta:

**integrar Feign correctamente.**

---

## Errores comunes en esta etapa

### 1. Olvidar `@EnableFeignClients`
Entonces Spring no detecta la interfaz declarativa.

### 2. No agregar la dependencia correcta
El proyecto no va a instanciar el cliente.

### 3. Definir mal el mapping del endpoint remoto
El contrato de Feign tiene que reflejar el endpoint real de `inventory-service`.

### 4. Dejar activo el cliente anterior y no saber cuál se está usando
Conviene mantener un solo camino claro.

### 5. No probar el flujo completo después del cambio
Siempre hay que validar que la integración siga sana.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `order-service` debería:

- tener OpenFeign integrado,
- usar un cliente declarativo para consultar inventario,
- y seguir creando órdenes correctamente cuando hay stock.

Eso deja lista la base para el siguiente paso importante:  
quitar la URL fija y pasar a descubrimiento real por nombre lógico.

---

## Punto de control

Antes de seguir, verificá que:

- la dependencia de Feign está agregada,
- `OrderServiceApplication` tiene `@EnableFeignClients`,
- existe `InventoryFeignClient`,
- `OrderService` ya lo usa,
- y `POST /orders` sigue funcionando correctamente.

Si eso está bien, ya podemos reemplazar la URL fija por el nombre del servicio registrado en Eureka.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a conectar `order-service` con `inventory-service` por nombre lógico usando Eureka y Feign.

Ese va a ser el verdadero salto desde una integración rígida hacia una integración más profesional y dinámica.

---

## Cierre

En esta clase integramos OpenFeign en `order-service`.

Con eso, la llamada a inventario ya dejó de estar modelada como una llamada HTTP manual y pasó a representarse como un cliente declarativo mucho más claro y mantenible.

Ahora sí estamos listos para aprovechar discovery de verdad.
