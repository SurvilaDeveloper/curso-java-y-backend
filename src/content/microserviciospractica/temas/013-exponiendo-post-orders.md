---
title: "Exponiendo POST /orders"
description: "Primer endpoint real de order-service. Implementación de la creación básica de órdenes, servicio simple en memoria y verificación de la ruta POST /orders en NovaMarket."
order: 13
module: "Módulo 2 · Primer flujo funcional del sistema"
level: "base"
draft: false
---

# Exponiendo `POST /orders`

En la clase anterior definimos el modelo base del dominio de órdenes:

- `Order`
- `OrderItem`

Ahora vamos a dar el siguiente paso natural:

**exponer el primer endpoint real de `order-service`.**

Esta clase es importante porque, por primera vez, vamos a tener una request que crea una orden dentro de NovaMarket.

Todavía no vamos a validar stock con `inventory-service`, ni persistir en base de datos, ni calcular totales.  
Primero queremos construir un flujo mínimo y verificable que reciba una orden, la convierta en un objeto del dominio y devuelva una respuesta coherente.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar funcionando en `order-service`:

- `POST /orders`

Además, el servicio debería tener:

- una clase de servicio simple,
- un controlador funcional,
- un request body con ítems,
- una respuesta representando la orden creada,
- y verificación real mediante `curl`, Postman o herramienta equivalente.

---

## Estado de partida

Partimos de `order-service` con esta base:

- el servicio ya arranca correctamente,
- existen las clases `Order` y `OrderItem`,
- y la estructura interna por paquetes ya está definida.

Por ejemplo:

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

---

## Qué vamos a construir hoy

En esta clase vamos a:

- crear un `OrderService`,
- crear un `OrderController`,
- definir cómo recibir una orden vía request body,
- generar una orden simple en memoria,
- devolver la respuesta correspondiente,
- y probar `POST /orders`.

---

## Enfoque recomendado para esta etapa

Como todavía no entramos en persistencia ni integración con inventario, conviene mantener una implementación simple.

Vamos a hacer que `order-service`:

- reciba una lista de ítems,
- cree una orden en memoria,
- le asigne un id simple,
- le ponga estado `CREATED`,
- y devuelva esa orden como respuesta.

Esto nos deja una primera versión funcional del flujo sin agregar demasiadas piezas al mismo tiempo.

---

## Paso 1 · Crear un DTO para la request

Aunque podríamos recibir directamente una lista o incluso una `Order`, conviene separar lo que llega por request de lo que usamos como modelo interno.

Por eso, dentro de `order-service`, creá esta clase en:

```txt
src/main/java/com/novamarket/order/dto/CreateOrderRequest.java
```

Una versión inicial razonable podría ser:

```java
package com.novamarket.order.dto;

import com.novamarket.order.model.OrderItem;

import java.util.List;

public class CreateOrderRequest {

    private List<OrderItem> items;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(List<OrderItem> items) {
        this.items = items;
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

## Por qué usamos un DTO desde ahora

Aunque el proyecto todavía sea simple, usar un DTO ya deja una separación muy sana entre:

- contrato HTTP,
- y modelo del dominio.

Esto ayuda a que más adelante podamos modificar la entrada del endpoint sin ensuciar el modelo interno de `Order`.

Además, fija una buena costumbre para el resto del curso.

---

## Paso 2 · Crear `OrderService`

Ahora creá esta clase en:

```txt
src/main/java/com/novamarket/order/service/OrderService.java
```

Una implementación inicial razonable podría ser:

```java
package com.novamarket.order.service;

import com.novamarket.order.dto.CreateOrderRequest;
import com.novamarket.order.model.Order;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicLong;

@Service
public class OrderService {

    private final AtomicLong idGenerator = new AtomicLong(1);

    public Order createOrder(CreateOrderRequest request) {
        return new Order(
                idGenerator.getAndIncrement(),
                "CREATED",
                request.getItems()
        );
    }
}
```

---

## Qué está haciendo este servicio

Este `OrderService` todavía no guarda la orden en ninguna parte.  
Lo que hace es:

- tomar el request,
- generar un id incremental simple,
- asignar estado `CREATED`,
- y devolver una nueva instancia de `Order`.

Es una implementación mínima, pero suficiente para que el endpoint funcione y podamos validar el comportamiento básico.

---

## Paso 3 · Crear `OrderController`

Ahora creá esta clase en:

```txt
src/main/java/com/novamarket/order/controller/OrderController.java
```

Una implementación inicial razonable podría ser:

```java
package com.novamarket.order.controller;

import com.novamarket.order.dto.CreateOrderRequest;
import com.novamarket.order.model.Order;
import com.novamarket.order.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Order createOrder(@RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }
}
```

---

## Qué expone este controlador

El endpoint es:

```txt
POST /orders
```

Y espera un body con esta forma conceptual:

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

La respuesta debería ser una orden creada con:

- un id,
- el estado `CREATED`,
- y los ítems recibidos.

---

## Paso 4 · Revisar la estructura final de `order-service`

Después de agregar estas clases, la estructura debería verse aproximadamente así:

```txt
src/main/java/com/novamarket/order/
  OrderServiceApplication.java
  controller/
    OrderController.java
  service/
    OrderService.java
  repository/
  model/
    Order.java
    OrderItem.java
  dto/
    CreateOrderRequest.java
  config/
```

Esta ya es una estructura bastante representativa de cómo va a crecer `order-service`.

---

## Paso 5 · Levantar `order-service`

Ahora toca volver a arrancar el servicio.

Queremos verificar que:

- compile correctamente,
- Spring detecte el controller y el service,
- y el endpoint quede disponible en el puerto configurado.

Si venías usando `8083`, entonces el endpoint debería estar accesible desde ahí.

---

## Paso 6 · Probar `POST /orders`

Ahora sí, hagamos la primera prueba real del flujo de órdenes.

Podés usar `curl`:

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

La respuesta esperada debería ser algo parecido a esto:

```json
{
  "id": 1,
  "status": "CREATED",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ]
}
```

Además, el status HTTP esperado debería ser:

```txt
201 Created
```

---

## Paso 7 · Repetir la prueba para verificar ids

Conviene repetir el request una segunda vez.

La idea es comprobar que el `AtomicLong` está generando ids distintos para cada orden creada.

Si hacés un segundo POST, lo esperable es que la orden tenga `id = 2`.

Esto nos ayuda a verificar que el flujo básico no solo responde, sino que también genera órdenes diferenciadas.

---

## Qué todavía no estamos validando

Este punto es muy importante.

Aunque el endpoint ya funciona, todavía no estamos verificando:

- si los productos existen en el catálogo,
- si hay stock suficiente,
- si la cantidad es válida,
- si la orden se guarda en base,
- ni si hay seguridad o eventos.

Y eso está bien.

La meta de esta clase es construir un primer `POST /orders` simple y verificable sobre el que después vamos a agregar capas de comportamiento.

---

## Qué valor tiene esta clase en el flujo del curso

Esta clase marca un cambio importante en NovaMarket.

Antes teníamos:

- catálogo funcional,
- inventario funcional,
- y estructura de órdenes definida.

Ahora ya tenemos:

- un endpoint que permite crear una orden de verdad.

Eso significa que el flujo principal del sistema empieza a existir operativamente, aunque todavía sea una versión simple.

---

## Posibles mejoras futuras ya preparadas

Esta implementación deja listo el terreno para varios pasos próximos:

- validar stock antes de crear la orden,
- consultar inventario desde `order-service`,
- rechazar órdenes sin disponibilidad,
- persistir la orden,
- agregar DTOs de respuesta,
- publicar eventos,
- proteger la ruta con seguridad.

Es decir: aunque el endpoint sea básico, está bien orientado para crecer.

---

## Errores comunes en esta etapa

### 1. Recibir directamente `Order` en el controller
Conviene mantener separado el contrato HTTP con un DTO.

### 2. No usar `@RequestBody`
Sin eso, Spring no va a mapear el JSON como esperamos.

### 3. Olvidar `@ResponseStatus(HttpStatus.CREATED)`
No es obligatorio para que funcione, pero sí es una muy buena práctica para este endpoint.

### 4. No probar varias veces la creación
Repetir el request ayuda a validar ids y comportamiento.

### 5. Creer que ya está terminado el flujo de órdenes
En realidad, esta es solo la primera versión funcional.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, `order-service` debería exponer correctamente:

- `POST /orders`

Y deberías poder crear órdenes simples en memoria, obteniendo:

- id,
- estado `CREATED`,
- y los ítems enviados.

Eso ya convierte a `order-service` en un servicio funcional del flujo principal de NovaMarket.

---

## Punto de control

Antes de seguir, verificá que:

- existe `CreateOrderRequest`,
- existe `OrderService`,
- existe `OrderController`,
- `POST /orders` responde correctamente,
- devuelve `201 Created`,
- y genera órdenes con ids distintos.

Si eso está bien, en la próxima clase vamos a empezar a conectar órdenes con inventario.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a hacer que `order-service` empiece a consultar `inventory-service` usando una llamada simple.

Ese va a ser el primer paso real de integración entre microservicios dentro de NovaMarket.

---

## Cierre

En esta clase expusimos `POST /orders`, el primer endpoint real del servicio de órdenes.

Con esto, NovaMarket ya tiene una primera versión funcional del flujo principal del negocio: el sistema puede recibir una orden.

Todavía es una versión simple, pero ya es una base muy valiosa sobre la que vamos a construir la integración distribuida que viene a continuación.
