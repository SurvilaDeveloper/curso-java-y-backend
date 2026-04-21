---
title: "Agregando circuit breaker en order-service para la consulta a inventory-service"
description: "Agregar Resilience4j a order-service, configurar un circuit breaker para inventory-service y dejar un endpoint de prueba de disponibilidad con fallback."
order: 25
module: "Módulo 6 · Resiliencia"
level: "base"
draft: false
---

# Objetivo operativo

Agregar un `circuit breaker` en `order-service` para la consulta a `inventory-service` y dejar un endpoint simple para probar disponibilidad con fallback.

---

## Acciones

### 1. Agregar dependencias al `pom.xml` de `order-service`

Abrir:

```txt
services/order-service/pom.xml
```

Agregar estas dependencias dentro de `<dependencies>`:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

---

### 2. Abrir la configuración remota de `order-service`

Abrir:

```txt
config-repo/order-service.yml
```

---

### 3. Reemplazar el contenido por esta versión

Pegar esto:

```yaml
server:
  port: 8083

spring:
  application:
    name: order-service
  datasource:
    url: jdbc:postgresql://localhost:5432/commerce_lab
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true
    open-in-view: false
  flyway:
    enabled: true

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka

resilience4j:
  circuitbreaker:
    instances:
      inventoryService:
        slidingWindowSize: 5
        minimumNumberOfCalls: 3
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
        permittedNumberOfCallsInHalfOpenState: 2

management:
  endpoints:
    web:
      exposure:
        include: health,info
```

---

### 4. Reemplazar `InventoryClientService`

Abrir:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/service/InventoryClientService.java
```

Reemplazar todo el contenido por esto:

```java
package com.novamarket.orderservice.service;

import com.novamarket.orderservice.dto.StockCheckResponse;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class InventoryClientService {

    private final RestClient.Builder restClientBuilder;
    private final CircuitBreakerFactory<?, ?> circuitBreakerFactory;

    public InventoryClientService(
            RestClient.Builder restClientBuilder,
            CircuitBreakerFactory<?, ?> circuitBreakerFactory
    ) {
        this.restClientBuilder = restClientBuilder;
        this.circuitBreakerFactory = circuitBreakerFactory;
    }

    public String pingInventory() {
        return restClientBuilder
                .build()
                .get()
                .uri("http://INVENTORY-SERVICE/api/inventory/ping")
                .retrieve()
                .body(String.class);
    }

    public boolean canCreateOrder(String productSlug, Integer quantity) {
        return circuitBreakerFactory.create("inventoryService").run(
                () -> fetchStockAvailability(productSlug, quantity),
                throwable -> false
        );
    }

    private boolean fetchStockAvailability(String productSlug, Integer quantity) {
        StockCheckResponse response = restClientBuilder
                .build()
                .get()
                .uri(
                        "http://INVENTORY-SERVICE/api/inventory/check?productSlug={productSlug}&quantity={quantity}",
                        productSlug,
                        quantity
                )
                .retrieve()
                .body(StockCheckResponse.class);

        return response != null && Boolean.TRUE.equals(response.getAvailable());
    }
}
```

---

### 5. Agregar un endpoint simple de verificación resiliente

Abrir:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/controller/OrderController.java
```

Agregar este método dentro de la clase:

```java
@GetMapping("/api/orders/check-stock")
public Boolean checkStock(
        @RequestParam String productSlug,
        @RequestParam Integer quantity
) {
    return inventoryClientService.canCreateOrder(productSlug, quantity);
}
```

---

### 6. Verificar imports en `OrderController`

Si faltan, agregar estos imports:

```java
import org.springframework.web.bind.annotation.RequestParam;
```

---

### 7. Reiniciar `order-service`

Detener `order-service` si está corriendo.

Volver a ejecutarlo.

---

### 8. Verificar el endpoint resiliente directo

Abrir:

```txt
http://localhost:8083/api/orders/check-stock?productSlug=mouse-inalambrico&quantity=2
```

Debe responder:

```txt
true
```

---

### 9. Verificar el endpoint resiliente a través del gateway con token

Usar un token válido de Keycloak.

#### Git Bash / Linux / macOS

```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/api/orders/check-stock?productSlug=mouse-inalambrico&quantity=2"
```

#### PowerShell

```powershell
curl -Headers @{Authorization="Bearer $TOKEN"} "http://localhost:8080/api/orders/check-stock?productSlug=mouse-inalambrico&quantity=2"
```

Debe responder:

```txt
true
```

---

## Verificación rápida

Comprobar que:

- `order-service` arranca con Resilience4j
- el endpoint `/api/orders/check-stock` responde
- el endpoint funciona directo y también a través del gateway con token

---

## Resultado esperado

Tener `order-service` consultando stock con un `circuit breaker` configurado para `inventory-service`.

---

## Siguiente archivo

Seguir con:

```txt
026-simulando-la-caida-de-inventory-service-y-verificando-el-fallback-en-order-service.md
```
