---
title: "Creando api-gateway y conectándolo a config-server y discovery-server"
description: "Crear api-gateway con Initializr, conectarlo a config-server y discovery-server, y dejarlo registrado en Eureka."
order: 4
module: "Módulo 1 · Base del proyecto"
level: "base"
draft: false
---

# Objetivo operativo

Crear `api-gateway`, conectarlo a `config-server` y `discovery-server`, y dejarlo funcionando en el puerto `8080`.

---

## Acciones

### 1. Crear el proyecto con Spring Initializr

Crear un proyecto nuevo con estos datos:

```txt
Project: Maven
Language: Java
Spring Boot: 4.0.x
Group: com.novamarket
Artifact: api-gateway
Name: api-gateway
Package name: com.novamarket.apigateway
Packaging: Jar
Java: 21
```

Agregar estas dependencias:

```txt
Gateway
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
    └── api-gateway/
```

---

### 3. Configurar `application.properties`

Abrir:

```txt
services/api-gateway/src/main/resources/application.properties
```

Reemplazar todo el contenido por esto:

```properties
spring.application.name=api-gateway
spring.config.import=optional:configserver:http://localhost:8888

management.endpoints.web.exposure.include=health,info,gateway
```

---

### 4. Verificar dependencias del `pom.xml`

Abrir:

```txt
services/api-gateway/pom.xml
```

Verificar que existan estas dependencias dentro de `<dependencies>`:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway-server-webflux</artifactId>
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

### 5. Agregar el BOM de Spring Cloud si hace falta

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

### 6. Completar `config-repo/api-gateway.yml`

Abrir:

```txt
config-repo/api-gateway.yml
```

Reemplazar el contenido por esto:

```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka

management:
  endpoints:
    web:
      exposure:
        include: health,info,gateway
```

---

### 7. Ejecutar los servicios en este orden

Ejecutar primero:

1. `config-server`
2. `discovery-server`

Después ejecutar:

3. `api-gateway`

---

### 8. Verificar `health`

Abrir en el navegador:

```txt
http://localhost:8080/actuator/health
```

Debería responder algo equivalente a:

```json
{"status":"UP"}
```

---

### 9. Verificar el registro en Eureka

Abrir:

```txt
http://localhost:8761
```

Comprobar que aparezca un servicio registrado con nombre:

```txt
API-GATEWAY
```

---

### 10. Verificar que el gateway está leyendo configuración remota

Abrir:

```txt
http://localhost:8888/api-gateway/default
```

Comprobar que la respuesta incluya:

- `server.port=8080`
- `spring.application.name=api-gateway`

---

## Verificación rápida

Comprobar que:

- `api-gateway` arranca sin errores
- responde en `http://localhost:8080`
- aparece registrado en Eureka
- está leyendo configuración desde `config-server`

---

## Resultado esperado

Tener `api-gateway` funcionando, registrado en Eureka y listo para recibir rutas.

---

## Siguiente archivo

Seguir con:

```txt
005-creando-catalog-service-y-registrandolo-en-discovery-server.md
```
