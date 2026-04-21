---
title: "Creando inventory-service y registrándolo en discovery-server"
description: "Crear inventory-service con Initializr, conectarlo a config-server y discovery-server, y dejar un endpoint base respondiendo."
order: 7
module: "Módulo 2 · Primeros servicios de negocio"
level: "base"
draft: false
---

# Objetivo operativo

Crear `inventory-service`, conectarlo a `config-server` y `discovery-server`, y dejar un endpoint base funcionando.

---

## Acciones

### 1. Crear el proyecto con Spring Initializr

Crear un proyecto nuevo con estos datos:

```txt
Project: Maven
Language: Java
Spring Boot: 4.0.x
Group: com.novamarket
Artifact: inventory-service
Name: inventory-service
Package name: com.novamarket.inventoryservice
Packaging: Jar
Java: 21
```

Agregar estas dependencias:

```txt
Web
Config Client
Eureka Discovery Client
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
    └── inventory-service/
```

---

### 3. Configurar `application.properties`

Abrir:

```txt
services/inventory-service/src/main/resources/application.properties
```

Reemplazar todo el contenido por esto:

```properties
spring.application.name=inventory-service
spring.config.import=optional:configserver:http://localhost:8888

management.endpoints.web.exposure.include=health,info
```

---

### 4. Crear el archivo remoto de configuración

Crear este archivo:

```txt
config-repo/inventory-service.yml
```

Pegar esto:

```yaml
server:
  port: 8082

spring:
  application:
    name: inventory-service

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
services/inventory-service/pom.xml
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

### 7. Crear el controlador base

Crear el archivo:

```txt
services/inventory-service/src/main/java/com/novamarket/inventoryservice/controller/InventoryController.java
```

Pegar esto:

```java
package com.novamarket.inventoryservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class InventoryController {

    @GetMapping("/api/inventory/ping")
    public String ping() {
        return "inventory-service ok";
    }

}
```

---

### 8. Crear el paquete del controlador si no existe

Crear manualmente esta carpeta si hace falta:

```txt
services/inventory-service/src/main/java/com/novamarket/inventoryservice/controller/
```

---

### 9. Ejecutar los servicios en este orden

Ejecutar primero:

1. `config-server`
2. `discovery-server`
3. `api-gateway`
4. `catalog-service`

Después ejecutar:

5. `inventory-service`

---

### 10. Verificar `health`

Abrir:

```txt
http://localhost:8082/actuator/health
```

---

### 11. Verificar el endpoint base del servicio

Abrir:

```txt
http://localhost:8082/api/inventory/ping
```

Debe responder:

```txt
inventory-service ok
```

---

### 12. Verificar el registro en Eureka

Abrir:

```txt
http://localhost:8761
```

Comprobar que aparezca un servicio registrado con nombre:

```txt
INVENTORY-SERVICE
```

---

## Verificación rápida

Comprobar que:

- `inventory-service` arranca sin errores
- responde en `http://localhost:8082/api/inventory/ping`
- aparece registrado en Eureka
- lee configuración desde `config-server`

---

## Resultado esperado

Tener `inventory-service` funcionando y registrado en discovery.

---

## Siguiente archivo

Seguir con:

```txt
008-agregando-la-ruta-de-inventory-service-en-api-gateway.md
```
