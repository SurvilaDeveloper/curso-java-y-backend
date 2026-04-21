---
title: "Creando config-server y conectándolo al config-repo local"
description: "Crear el microservicio config-server con Initializr, conectarlo al repositorio local de configuración y dejarlo respondiendo en el puerto 8888."
order: 2
module: "Módulo 1 · Base del proyecto"
level: "base"
draft: false
---

# Objetivo operativo

Crear `config-server`, conectarlo al `config-repo` local y dejarlo funcionando.

---

## Acciones

### 1. Crear el proyecto con Spring Initializr

Crear un proyecto nuevo con estos datos:

```txt
Project: Maven
Language: Java
Spring Boot: 4.0.x
Group: com.novamarket
Artifact: config-server
Name: config-server
Package name: com.novamarket.configserver
Packaging: Jar
Java: 21
```

Agregar estas dependencias:

```txt
Config Server
Actuator
```

Generar el proyecto.

---

### 2. Mover el proyecto a la carpeta `services`

La estructura debe quedar así:

```txt
novamarket-practico/
└── services/
    └── config-server/
```

---

### 3. Abrir el proyecto `config-server` en el IDE

Abrir la carpeta del proyecto dentro del workspace.

---

### 4. Agregar la anotación de Config Server

Abrir:

```txt
services/config-server/src/main/java/com/novamarket/configserver/ConfigServerApplication.java
```

Dejar el archivo así:

```java
package com.novamarket.configserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

@EnableConfigServer
@SpringBootApplication
public class ConfigServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }

}
```

---

### 5. Configurar `application.properties`

Abrir:

```txt
services/config-server/src/main/resources/application.properties
```

Reemplazar todo el contenido por esto:

```properties
spring.application.name=config-server
server.port=8888

spring.profiles.active=native
spring.cloud.config.server.native.search-locations=file:../config-repo,file:../../config-repo

management.endpoints.web.exposure.include=health,info
```

---

### 6. Verificar dependencias en el `pom.xml`

Abrir:

```txt
services/config-server/pom.xml
```

Verificar que exista esta dependencia dentro de `<dependencies>`:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-server</artifactId>
</dependency>
```

---

### 7. Agregar el BOM de Spring Cloud si hace falta

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

### 8. Ejecutar el proyecto

Ejecutar `ConfigServerApplication`.

---

### 9. Verificar que arranca en el puerto 8888

Abrir en el navegador:

```txt
http://localhost:8888/actuator/health
```

Debería responder algo equivalente a:

```json
{"status":"UP"}
```

---

### 10. Verificar que entrega la configuración de `discovery-server`

Abrir en el navegador:

```txt
http://localhost:8888/discovery-server/default
```

Comprobar que responde con propiedades que incluyan:

- `server.port=8761`
- `spring.application.name=discovery-server`

---

## Verificación rápida

Comprobar que:

- el proyecto `config-server` existe dentro de `services`
- arranca sin errores
- responde `health`
- responde la configuración de `discovery-server`

---

## Resultado esperado

Tener `config-server` funcionando y leyendo el contenido del `config-repo` local.

---

## Siguiente archivo

Seguir con:

```txt
003-creando-discovery-server-y-conectandolo-a-config-server.md
```
