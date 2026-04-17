---
title: "Spring Boot · Dockerfiles base por stack"
description: "Este artículo reúne **Dockerfiles base listos para copiar** para proyectos Spring Boot."
order: 6
module: "Spring Boot - Docker"
level: "intro"
draft: false
---
# Spring Boot · Dockerfiles base por stack

Este artículo reúne **Dockerfiles base listos para copiar** para proyectos Spring Boot.

> Idea clave: en Spring Boot, el **stack de negocio** (MVC, WebFlux, JPA, Mongo, Kafka, GraphQL, etc.) casi no cambia la estructura del `Dockerfile`. Lo que más cambia es **cómo construís el jar**, si querés **capas reutilizables**, y qué **variables de entorno** o servicios acompañan al contenedor.

---

## 1) Criterio recomendado antes de elegir Dockerfile

### Cuándo usar cada enfoque

- **`mvn spring-boot:build-image` / buildpacks**
  - Muy buena opción si querés una imagen lista sin escribir Dockerfile.
  - Suele ser una opción muy cómoda para producción.
- **Dockerfile multi-stage**
  - Buena opción cuando querés control explícito del build.
  - Muy útil si tu CI ya usa Docker para compilar.
- **Dockerfile con jar en capas (`jarmode=tools`)**
  - Conveniente si querés aprovechar mejor la caché de capas de Docker.
  - Muy buena opción cuando reconstruís seguido la app.
- **Dockerfile para desarrollo**
  - Útil para desarrollo containerizado o devcontainers.
  - No suele ser la mejor opción para producción.

### Base de Java sugerida

En estos ejemplos uso **Eclipse Temurin 21**:

- `eclipse-temurin:21-jdk-jammy` para compilar
- `eclipse-temurin:21-jre-jammy` para runtime

Si tu proyecto está en Java 17, podés cambiar ambas imágenes a 17.

---

## 2) `.dockerignore` base recomendado

```gitignore
.target
.git
.gitignore
.idea
.vscode
node_modules
Dockerfile*
docker-compose*
README.md
*.log
```

Si vas a **compilar dentro de Docker**, no ignores `pom.xml`, `.mvn/`, `mvnw` ni `src/`.

---

## 3) Dockerfile mínimo para jar ya compilado

Usalo cuando ya ejecutaste `mvn clean package` afuera de Docker.

```dockerfile
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### Cuándo conviene

- querés algo simple
- el build ya ocurre en CI o en tu máquina
- no necesitás optimizar demasiado las capas

### Ventajas

- simple
- fácil de entender
- rápido de adoptar

### Desventajas

- peor reutilización de caché que una imagen por capas
- depende de que el jar ya exista antes del `docker build`

---

## 4) Dockerfile multi-stage Maven clásico

Este es el más versátil para muchos proyectos Spring Boot.

```dockerfile
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /workspace

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

COPY src/ src/
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=builder /workspace/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### Cuándo conviene

- querés compilar dentro del contenedor
- querés una imagen final más chica
- querés separar build y runtime

### Ajustes comunes

Si usás tests de integración pesados, podés mantener `-DskipTests` en imagen y correr tests antes en CI.

Si no usás wrapper Maven, podés reemplazarlo por algo como:

```dockerfile
RUN apt-get update && apt-get install -y maven
```

aunque normalmente conviene más conservar `mvnw`.

---

## 5) Dockerfile optimizado con capas Spring Boot (`jarmode=tools`)

Este enfoque aprovecha la extracción por capas del jar de Spring Boot.

```dockerfile
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /workspace

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

COPY src/ src/
RUN ./mvnw clean package -DskipTests
RUN java -Djarmode=tools -jar target/*.jar extract --layers --destination extracted

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=builder /workspace/extracted/dependencies/ ./
COPY --from=builder /workspace/extracted/spring-boot-loader/ ./
COPY --from=builder /workspace/extracted/snapshot-dependencies/ ./
COPY --from=builder /workspace/extracted/application/ ./

EXPOSE 8080

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
```

### Cuándo conviene

- reconstruís muchas veces la imagen
- querés mejor caché de Docker
- buscás una base más “productiva” para CI/CD

### Observación

Si tu proyecto no tiene dependencias snapshot, la carpeta `snapshot-dependencies` puede no aportar nada, pero no molesta dejarla.

---

## 6) Dockerfile con usuario no root

Buena práctica para endurecer la imagen cuando manejás tu propio Dockerfile.

```dockerfile
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src/ src/
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

COPY --from=builder /workspace/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### Cuándo conviene

- producción
- despliegues en nube
- entornos con políticas de seguridad más estrictas

---

## 7) Dockerfile para desarrollo con DevTools

No es el ideal para producción. Sirve para desarrollo containerizado.

```dockerfile
FROM eclipse-temurin:21-jdk-jammy

WORKDIR /workspace

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

COPY src/ src/

EXPOSE 8080

CMD ["./mvnw", "spring-boot:run"]
```

### Uso típico

- con bind mount del proyecto
- con `spring-boot-devtools`
- junto con Docker Compose para la base

---

# 8) Dockerfiles por stack

## A. Spring MVC + PostgreSQL + JPA + Flyway

Este stack suele usar el Dockerfile multi-stage clásico.

```dockerfile
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src/ src/
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### Variables de entorno típicas

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/app
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_FLYWAY_ENABLED=true
```

### Cuándo usar este stack

- API REST clásica
- backend CRUD
- auth, validación, relaciones JPA, migraciones SQL

---

## B. Spring MVC + PostgreSQL + jOOQ

El `Dockerfile` es prácticamente igual al de JPA.

```dockerfile
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src/ src/
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### Variables típicas

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/app
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
```

### Cuándo usarlo

- necesitás más control SQL
- querés queries tipadas
- no querés depender tanto de ORM completo

---

## C. Spring WebFlux + PostgreSQL + R2DBC

El contenedor sigue siendo igual; cambia la configuración del runtime.

```dockerfile
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src/ src/
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### Variables de entorno típicas

```bash
SPRING_R2DBC_URL=r2dbc:postgresql://postgres:5432/app
SPRING_R2DBC_USERNAME=postgres
SPRING_R2DBC_PASSWORD=postgres
```

### Observación

Si además necesitás Flyway, normalmente Flyway seguirá usando una conexión JDBC aparte para las migraciones.

---

## D. Spring WebFlux + MongoDB reactivo

```dockerfile
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src/ src/
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### Variables de entorno típicas

```bash
SPRING_DATA_MONGODB_URI=mongodb://mongo:27017/app
```

### Cuándo usarlo

- documentos JSON
- modelo flexible
- repos reactivos
- APIs reactivas completas

---

## E. Microservicio con Kafka

El `Dockerfile` base no cambia demasiado. Lo importante son las variables del broker.

```dockerfile
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src/ src/
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### Variables de entorno típicas

```bash
SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:9092
SPRING_KAFKA_CONSUMER_GROUP_ID=my-group
SPRING_KAFKA_CONSUMER_AUTO_OFFSET_RESET=earliest
```

### Cuándo usarlo

- eventos
- integración asíncrona
- procesamiento desacoplado

---

## F. Spring GraphQL + PostgreSQL

El runtime suele ser exactamente el mismo que una app MVC o WebFlux según el transporte elegido.

```dockerfile
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src/ src/
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### Variables típicas

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/app
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
```

### Observación

Si GraphQL está montado sobre MVC, pensalo como stack servlet.
Si está montado sobre WebFlux, pensalo como stack reactivo.

---

## G. Spring Session / Cache con Redis

Si tu backend usa Redis para cache o sesiones, el contenedor de la app no necesita cambios especiales.

```dockerfile
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src/ src/
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### Variables típicas

```bash
SPRING_DATA_REDIS_HOST=redis
SPRING_DATA_REDIS_PORT=6379
```

---

## H. Spring Batch + PostgreSQL

```dockerfile
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src/ src/
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### Variables típicas

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/app
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_BATCH_JDBC_INITIALIZE_SCHEMA=always
```

### Observación

En Batch a veces el contenedor no expone HTTP porque corre jobs y termina. En esos casos podés quitar `EXPOSE 8080`.

---

# 9) Dockerfile con parámetros JVM útiles para producción

A veces conviene fijar algunos flags base.

```dockerfile
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src/ src/
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT [
  "java",
  "-XX:+UseContainerSupport",
  "-XX:MaxRAMPercentage=75.0",
  "-Djava.security.egd=file:/dev/./urandom",
  "-jar",
  "/app/app.jar"
]
```

### Cuándo usarlo

- entornos con límites de memoria
- contenedores pequeños
- despliegues repetibles en nube

---

# 10) Dockerfile para native image (cuando el binario ya está construido)

Si tu pipeline ya generó el ejecutable nativo, el runtime puede ser muchísimo más chico.

```dockerfile
FROM ubuntu:24.04

WORKDIR /app

COPY target/app /app/app

EXPOSE 8080

ENTRYPOINT ["/app/app"]
```

### Ojo

Para Spring Boot nativo, muchas veces conviene más usar **Buildpacks** que escribir todo el pipeline manual a mano.

---

# 11) Plantilla con `ARG` para reutilizar en varios proyectos

```dockerfile
ARG JAVA_VERSION=21

FROM eclipse-temurin:${JAVA_VERSION}-jdk-jammy AS builder
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY src/ src/
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:${JAVA_VERSION}-jre-jammy
WORKDIR /app
COPY --from=builder /workspace/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

Build:

```bash
docker build --build-arg JAVA_VERSION=21 -t mi-app:latest .
```

---

# 12) Comandos base de uso

## Build

```bash
docker build -t mi-app:latest .
```

## Run simple

```bash
docker run --rm -p 8080:8080 mi-app:latest
```

## Run con variables

```bash
docker run --rm -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/app \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  mi-app:latest
```

---

# 13) Qué elegiría yo según el caso

## Para empezar rápido

- **Dockerfile multi-stage Maven clásico**

## Para producción general

- **multi-stage** o **jar en capas**
- si querés menos mantenimiento manual: **`mvn spring-boot:build-image`**

## Para desarrollo local con servicios auxiliares

- app local o containerizada
- **Docker Compose** para Postgres / Mongo / Redis / Kafka
- opcionalmente **`spring-boot-docker-compose`**

## Para imágenes más pulidas y con menos trabajo manual

- **Buildpacks**

---

# 14) Bonus: cuándo conviene Buildpacks en vez de Dockerfile

En Spring Boot, Buildpacks son una alternativa oficial para crear imágenes OCI sin escribir Dockerfile.

Te pueden convenir si querés:

- imagen lista con menos mantenimiento
- comportamiento más estandarizado
- imágenes que se ejecutan como usuario no root por defecto
- mejor experiencia general en equipos que no quieren mantener Dockerfiles manuales

---

# 15) Resumen corto

Si querés una sola recomendación práctica:

- **proyecto común Spring Boot**: usá el **Dockerfile multi-stage Maven clásico**
- **si reconstruís muy seguido y te importa la caché**: usá **jar en capas**
- **si querés la solución más simple y estándar posible**: evaluá **`mvn spring-boot:build-image`**

