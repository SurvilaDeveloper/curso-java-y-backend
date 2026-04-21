---
title: "Creando discovery-server y conectándolo a config-server"
description: "Crear el microservicio discovery-server con Initializr, conectarlo a config-server y dejar Eureka Server funcionando en el puerto 8761."
order: 3
module: "Módulo 1 · Base del proyecto"
level: "base"
draft: false
---

# Objetivo operativo

Crear `discovery-server`, hacer que lea su configuración desde `config-server` y dejar Eureka Server funcionando.

---

## Acciones

### 1. Crear el proyecto con Spring Initializr

Crear un proyecto nuevo con estos datos:

```txt
Project: Maven
Language: Java
Spring Boot: 4.0.x
Group: com.novamarket
Artifact: discovery-server
Name: discovery-server
Package name: com.novamarket.discoveryserver
Packaging: Jar
Java: 21
```

Agregar estas dependencias:

```txt
Eureka Server
Config Client
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
    └── discovery-server/
```

---

### 3. Agregar la anotación de Eureka Server

Abrir:

```txt
services/discovery-server/src/main/java/com/novamarket/discoveryserver/DiscoveryServerApplication.java
```

Dejar el archivo así:

```java
package com.novamarket.discoveryserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
public class DiscoveryServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServerApplication.class, args);
    }

}
```

---

### 4. Configurar `application.properties`

Abrir:

```txt
services/discovery-server/src/main/resources/application.properties
```

Reemplazar todo el contenido por esto:

```properties
spring.application.name=discovery-server
spring.config.import=optional:configserver:http://localhost:8888

management.endpoints.web.exposure.include=health,info
```

---

### 5. Verificar dependencias del `pom.xml`

Abrir:

```txt
services/discovery-server/pom.xml
```

Verificar que existan estas dependencias dentro de `<dependencies>`:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
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

### 7. Ejecutar primero `config-server`

Antes de arrancar `discovery-server`, ejecutar `ConfigServerApplication`.

Comprobar otra vez:

```txt
http://localhost:8888/discovery-server/default
```

---

### 8. Ejecutar `discovery-server`

Ejecutar `DiscoveryServerApplication`.

---

### 9. Verificar que arranca en el puerto 8761

Abrir en el navegador:

```txt
http://localhost:8761
```

Debería abrir la pantalla de Eureka Server.

---

### 10. Verificar `health`

Abrir:

```txt
http://localhost:8761/actuator/health
```

Debería responder algo equivalente a:

```json
{"status":"UP"}
```

---

## Verificación rápida

Comprobar que:

- `config-server` está ejecutándose
- `discovery-server` arranca
- Eureka abre en `http://localhost:8761`
- `discovery-server` está leyendo su configuración desde `config-server`

---

## Resultado esperado

Tener `config-server` y `discovery-server` funcionando dentro del workspace práctico de NovaMarket.

---

## Siguiente archivo

El siguiente tramo práctico debería cubrir:

- creación de `api-gateway`
- conexión con `discovery-server`
- primeras rutas base
