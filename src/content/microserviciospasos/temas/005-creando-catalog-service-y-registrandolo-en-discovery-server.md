---
title: "Creando catalog-service y registrándolo en discovery-server"
description: "Crear catalog-service con Initializr, conectarlo a config-server y discovery-server, y dejar un endpoint base respondiendo."
order: 5
module: "Módulo 2 · Primer servicio de negocio"
level: "base"
draft: false
---

# Objetivo operativo

Crear `catalog-service`, conectarlo a `config-server` y `discovery-server`, y dejar un endpoint base funcionando.

---

## Acciones

### 1. Crear el proyecto con Spring Initializr

Crear un proyecto nuevo con estos datos:

```txt
Project: Maven
Language: Java
Spring Boot: 4.0.x
Group: com.novamarket
Artifact: catalog-service
Name: catalog-service
Package name: com.novamarket.catalogservice
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
    └── catalog-service/
```

---

### 3. Configurar `application.properties`

Abrir:

```txt
services/catalog-service/src/main/resources/application.properties
```

Reemplazar todo el contenido por esto:

```properties
spring.application.name=catalog-service
spring.config.import=optional:configserver:http://localhost:8888

management.endpoints.web.exposure.include=health,info
```

---

### 4. Crear el archivo de configuración remota

Crear este archivo:

```txt
config-repo/catalog-service.yml
```

Pegar esto:

```yaml
server:
  port: 8081

spring:
  application:
    name: catalog-service

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
services/catalog-service/pom.xml
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
services/catalog-service/src/main/java/com/novamarket/catalogservice/controller/CatalogController.java
```

Pegar esto:

```java
package com.novamarket.catalogservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CatalogController {

    @GetMapping("/api/catalog/ping")
    public String ping() {
        return "catalog-service ok";
    }

}
```

---

### 8. Crear el paquete del controlador si no existe

Crear manualmente esta carpeta si hace falta:

```txt
services/catalog-service/src/main/java/com/novamarket/catalogservice/controller/
```

---

### 9. Ejecutar los servicios en este orden

Ejecutar primero:

1. `config-server`
2. `discovery-server`
3. `api-gateway`

Después ejecutar:

4. `catalog-service`

---

### 10. Verificar `health`

Abrir:

```txt
http://localhost:8081/actuator/health
```

---

### 11. Verificar el endpoint base del servicio

Abrir:

```txt
http://localhost:8081/api/catalog/ping
```

Debe responder:

```txt
catalog-service ok
```

---

### 12. Verificar el registro en Eureka

Abrir:

```txt
http://localhost:8761
```

Comprobar que aparezca un servicio registrado con nombre:

```txt
CATALOG-SERVICE
```

---

## Verificación rápida

Comprobar que:

- `catalog-service` arranca sin errores
- responde en `http://localhost:8081/api/catalog/ping`
- aparece registrado en Eureka
- lee configuración desde `config-server`

---

## Resultado esperado

Tener el primer servicio de negocio funcionando y registrado en discovery.

---

## Siguiente archivo

Seguir con:

```txt
006-agregando-la-primera-ruta-real-en-api-gateway-hacia-catalog-service.md
```
