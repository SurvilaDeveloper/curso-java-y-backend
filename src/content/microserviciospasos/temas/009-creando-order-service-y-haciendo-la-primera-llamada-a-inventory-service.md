---
title: "Creando order-service y haciendo la primera llamada a inventory-service"
description: "Crear order-service, registrarlo en discovery, configurarlo para usar LoadBalancer y hacer la primera llamada real a inventory-service."
order: 9
module: "Módulo 3 · Primer flujo entre servicios"
level: "base"
draft: false
---

# Objetivo operativo

Crear `order-service`, registrarlo en `discovery-server` y hacer una primera llamada real a `inventory-service`.

---

## Acciones

### 1. Crear el proyecto con Spring Initializr

Crear un proyecto nuevo con estos datos:

```txt
Project: Maven
Language: Java
Spring Boot: 4.0.x
Group: com.novamarket
Artifact: order-service
Name: order-service
Package name: com.novamarket.orderservice
Packaging: Jar
Java: 21
```

Agregar estas dependencias:

```txt
Web
Config Client
Eureka Discovery Client
LoadBalancer
Actuator
```

Generar el proyecto.

---

### 2. Mover el proyecto a la carpeta `services`

La estructura debe quedar así:

```txt
novamarket-practico/
└── services/
    ├── config-server/
    ├── discovery-server/
    ├── api-gateway/
    ├── catalog-service/
    ├── inventory-service/
    └── order-service/
```

---

### 3. Configurar `application.properties`

Abrir:

```txt
services/order-service/src/main/resources/application.properties
```

Reemplazar todo el contenido por esto:

```properties
spring.application.name=order-service
spring.config.import=optional:configserver:http://localhost:8888

management.endpoints.web.exposure.include=health,info
```

---

### 4. Crear el archivo remoto de configuración

Crear este archivo:

```txt
config-repo/order-service.yml
```

Pegar esto:

```yaml
server:
  port: 8083

spring:
  application:
    name: order-service

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka

management:
  endpoints:
    web:
      exposure:
        include: health,info
```

---

### 5. Verificar dependencias del `pom.xml`

Abrir:

```txt
services/order-service/pom.xml
```

Verificar que existan estas dependencias dentro de `<dependencies>`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

---

### 6. Agregar el BOM de Spring Cloud si hace falta

Si el proyecto no lo trae, agregar esto dentro de `<dependencyManagement>`:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2025.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

---

### 7. Crear la configuración de `RestClient`

Crear el archivo:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/config/RestClientConfig.java
```

Pegar esto:

```java
package com.novamarket.orderservice.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    @LoadBalanced
    RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }

}
```

---

### 8. Crear el servicio que llama a `inventory-service`

Crear el archivo:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/service/InventoryClientService.java
```

Pegar esto:

```java
package com.novamarket.orderservice.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class InventoryClientService {

    private final RestClient.Builder restClientBuilder;

    public InventoryClientService(RestClient.Builder restClientBuilder) {
        this.restClientBuilder = restClientBuilder;
    }

    public String pingInventory() {
        return restClientBuilder
                .build()
                .get()
                .uri("http://INVENTORY-SERVICE/api/inventory/ping")
                .retrieve()
                .body(String.class);
    }

}
```

---

### 9. Crear el controlador de `order-service`

Crear el archivo:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/controller/OrderController.java
```

Pegar esto:

```java
package com.novamarket.orderservice.controller;

import com.novamarket.orderservice.service.InventoryClientService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrderController {

    private final InventoryClientService inventoryClientService;

    public OrderController(InventoryClientService inventoryClientService) {
        this.inventoryClientService = inventoryClientService;
    }

    @GetMapping("/api/orders/ping")
    public String ping() {
        return "order-service ok";
    }

    @GetMapping("/api/orders/check-inventory")
    public String checkInventory() {
        return inventoryClientService.pingInventory();
    }

}
```

---

### 10. Crear los paquetes si no existen

Crear estas carpetas si hacen falta:

```txt
services/order-service/src/main/java/com/novamarket/orderservice/config/
services/order-service/src/main/java/com/novamarket/orderservice/service/
services/order-service/src/main/java/com/novamarket/orderservice/controller/
```

---

### 11. Ejecutar los servicios en este orden

Ejecutar primero:

1. `config-server`
2. `discovery-server`
3. `api-gateway`
4. `catalog-service`
5. `inventory-service`

Después ejecutar:

6. `order-service`

---

### 12. Verificar `health`

Abrir:

```txt
http://localhost:8083/actuator/health
```

---

### 13. Verificar endpoint base

Abrir:

```txt
http://localhost:8083/api/orders/ping
```

Debe responder:

```txt
order-service ok
```

---

### 14. Verificar la primera llamada entre servicios

Abrir:

```txt
http://localhost:8083/api/orders/check-inventory
```

Debe responder:

```txt
inventory-service ok
```

---

### 15. Verificar el registro en Eureka

Abrir:

```txt
http://localhost:8761
```

Comprobar que aparezca un servicio registrado con nombre:

```txt
ORDER-SERVICE
```

---

## Verificación rápida

Comprobar que:

- `order-service` arranca sin errores
- responde `ping`
- la llamada `/api/orders/check-inventory` devuelve `inventory-service ok`
- aparece registrado en Eureka

---

## Resultado esperado

Tener la primera llamada real de un servicio de negocio a otro usando discovery y load balancer.

---

## Siguiente archivo

El siguiente tramo práctico debería cubrir:

- ruta de `order-service` en `api-gateway`
- primer flujo completo pasando por gateway
- primeras entidades reales del dominio
