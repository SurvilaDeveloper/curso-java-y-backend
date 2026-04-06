---
title: "Spring Boot · `docker-compose.yml` base por stack"
description: "Este artículo reúne ejemplos base de `compose.yaml` / `docker-compose.yml` para acompañar proyectos Spring Boot."
order: 5
module: "Spring Boot - Docker"
level: "intro"
draft: false
---
# Spring Boot · `docker-compose.yml` base por stack

Este artículo reúne ejemplos base de `compose.yaml` / `docker-compose.yml` para acompañar proyectos Spring Boot.

> **Idea general**
>
> - Son ejemplos de **desarrollo local**.
> - Usan **tags de referencia** en las imágenes. Conviene fijar versiones concretas en tu proyecto.
> - Podés usar estos archivos tal cual o recortarlos según el stack real de tu backend.
> - Cuando tenga sentido, dejé comentarios con ajustes típicos.

---

## 1) Spring MVC + PostgreSQL + pgAdmin + Mailpit

Buen punto de partida para un backend clásico con:

- `spring-boot-starter-webmvc`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-flyway`
- `spring-boot-starter-mail`
- `spring-boot-starter-security`

### `compose.yaml`

```yaml
services:
  postgres:
    image: postgres:16
    container_name: app-postgres
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d appdb"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:9
    container_name: app-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@local.test
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      - postgres
    volumes:
      - pgadmin_data:/var/lib/pgadmin

  mailpit:
    image: axllent/mailpit:latest
    container_name: app-mailpit
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_data:
  pgadmin_data:
```

### Propiedades típicas de Spring Boot

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/appdb
spring.datasource.username=app
spring.datasource.password=app123
spring.mail.host=localhost
spring.mail.port=1025
```

### URLs útiles

- pgAdmin: `http://localhost:5050`
- Mailpit UI: `http://localhost:8025`
- PostgreSQL: `localhost:5432`

---

## 2) Spring MVC + PostgreSQL solamente

Versión minimalista cuando no querés herramientas auxiliares.

### `compose.yaml`

```yaml
services:
  postgres:
    image: postgres:16
    container_name: app-postgres
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d appdb"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### Propiedades típicas

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/appdb
spring.datasource.username=app
spring.datasource.password=app123
```

---

## 3) Spring WebFlux + MongoDB reactivo

Útil para proyectos con:

- `spring-boot-starter-webflux`
- `spring-boot-starter-data-mongodb-reactive`

### `compose.yaml`

```yaml
services:
  mongo:
    image: mongo:8
    container_name: app-mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: root123
      MONGO_INITDB_DATABASE: appdb
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### URI típica

```properties
spring.data.mongodb.uri=mongodb://root:root123@localhost:27017/appdb?authSource=admin
```

### Observación

Si preferís un usuario de aplicación en lugar de usar el usuario root, podés agregar scripts de inicialización en una carpeta montada en `/docker-entrypoint-initdb.d`.

---

## 4) Redis para cache o sesiones

Útil cuando tu backend usa:

- `spring-boot-starter-data-redis`
- `spring-boot-starter-cache`
- `spring-boot-starter-session-data-redis`

### `compose.yaml`

```yaml
services:
  redis:
    image: redis:8
    container_name: app-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: ["redis-server", "--appendonly", "yes"]

volumes:
  redis_data:
```

### Propiedades típicas

```properties
spring.data.redis.host=localhost
spring.data.redis.port=6379
```

### Observación

Para desarrollo local, esta base suele alcanzar. Si más adelante necesitás password, TLS o configuración custom, podés montar un `redis.conf` propio.

---

## 5) Kafka single-node para desarrollo local

Pensado para:

- `spring-boot-starter-kafka`
- productores y consumidores locales
- pruebas de eventos sin montar una infraestructura compleja

> Este ejemplo es para **desarrollo local**. Un cluster productivo de Kafka se diseña distinto.

### `compose.yaml`

```yaml
services:
  kafka:
    image: bitnami/kafka:4.0
    container_name: app-kafka
    ports:
      - "9094:9094"
    environment:
      KAFKA_ENABLE_KRAFT: "yes"
      KAFKA_CFG_NODE_ID: "1"
      KAFKA_CFG_PROCESS_ROLES: "broker,controller"
      KAFKA_CFG_CONTROLLER_LISTENER_NAMES: "CONTROLLER"
      KAFKA_CFG_LISTENERS: "PLAINTEXT://:9092,CONTROLLER://:9093,EXTERNAL://:9094"
      KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP: "PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT,EXTERNAL:PLAINTEXT"
      KAFKA_CFG_ADVERTISED_LISTENERS: "PLAINTEXT://kafka:9092,EXTERNAL://localhost:9094"
      KAFKA_CFG_CONTROLLER_QUORUM_VOTERS: "1@kafka:9093"
      KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE: "true"
      ALLOW_PLAINTEXT_LISTENER: "yes"
    volumes:
      - kafka_data:/bitnami/kafka

volumes:
  kafka_data:
```

### Propiedad típica

```properties
spring.kafka.bootstrap-servers=localhost:9094
```

### Observaciones

- Uso `9094` como puerto expuesto al host para evitar líos con listeners externos.
- Dentro de la red de Docker el broker queda como `kafka:9092`.
- Para un microservicio Spring Boot corriendo **fuera** de Docker, la conexión típica es `localhost:9094`.

---

## 6) Kafka + Redis + PostgreSQL

Stack útil para un microservicio que combina:

- base relacional
- cache o sesiones
- mensajería/eventos

### `compose.yaml`

```yaml
services:
  postgres:
    image: postgres:16
    container_name: app-postgres
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:8
    container_name: app-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: ["redis-server", "--appendonly", "yes"]

  kafka:
    image: bitnami/kafka:4.0
    container_name: app-kafka
    ports:
      - "9094:9094"
    environment:
      KAFKA_ENABLE_KRAFT: "yes"
      KAFKA_CFG_NODE_ID: "1"
      KAFKA_CFG_PROCESS_ROLES: "broker,controller"
      KAFKA_CFG_CONTROLLER_LISTENER_NAMES: "CONTROLLER"
      KAFKA_CFG_LISTENERS: "PLAINTEXT://:9092,CONTROLLER://:9093,EXTERNAL://:9094"
      KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP: "PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT,EXTERNAL:PLAINTEXT"
      KAFKA_CFG_ADVERTISED_LISTENERS: "PLAINTEXT://kafka:9092,EXTERNAL://localhost:9094"
      KAFKA_CFG_CONTROLLER_QUORUM_VOTERS: "1@kafka:9093"
      KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE: "true"
      ALLOW_PLAINTEXT_LISTENER: "yes"
    volumes:
      - kafka_data:/bitnami/kafka

volumes:
  postgres_data:
  redis_data:
  kafka_data:
```

### Propiedades típicas

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/appdb
spring.datasource.username=app
spring.datasource.password=app123
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.kafka.bootstrap-servers=localhost:9094
```

---

## 7) PostgreSQL + Redis + Mailpit

Muy útil para una API tradicional con:

- persistencia SQL
- envío de mails
- cache / sesiones / rate limits

### `compose.yaml`

```yaml
services:
  postgres:
    image: postgres:16
    container_name: app-postgres
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:8
    container_name: app-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: ["redis-server", "--appendonly", "yes"]

  mailpit:
    image: axllent/mailpit:latest
    container_name: app-mailpit
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_data:
  redis_data:
```

### Propiedades típicas

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/appdb
spring.datasource.username=app
spring.datasource.password=app123
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.mail.host=localhost
spring.mail.port=1025
```

---

## 8) Perfil con servicios opcionales usando `profiles`

Si querés tener un único `compose.yaml` y activar ciertos servicios solo a veces, Docker Compose soporta perfiles.

### `compose.yaml`

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4:9
    profiles: ["tools"]
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@local.test
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"

  mailpit:
    image: axllent/mailpit:latest
    profiles: ["tools"]
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_data:
```

### Ejemplos de uso

```bash
docker compose up -d
docker compose --profile tools up -d
```

---

## 9) Cómo integrarlo con Spring Boot y `spring-boot-docker-compose`

Spring Boot tiene soporte de desarrollo para Docker Compose. Esto puede ayudarte a arrancar y detectar servicios automáticamente en local.

### Dependencia Maven

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-docker-compose</artifactId>
    <optional>true</optional>
</dependency>
```

### Propiedades útiles

```properties
spring.docker.compose.lifecycle-management=start-and-stop
```

O bien:

```properties
spring.docker.compose.lifecycle-management=start-only
```

### Cuándo usar cada una

- `start-and-stop`: cómodo si querés que Boot levante y pare los servicios junto con la app.
- `start-only`: útil si varios proyectos comparten el mismo `compose.yaml`.

---

## 10) Consejos prácticos

### No dependas de `latest` en todo

En desarrollo local puede servir, pero para proyectos medianamente serios conviene fijar tags concretas para evitar cambios inesperados.

### Usá volúmenes nombrados

Así no perdés datos cada vez que recreás contenedores.

### Diferenciá desarrollo de producción

Estos archivos están pensados para **dev local**. En producción:

- las credenciales se manejan distinto
- TLS puede ser obligatorio
- Kafka, Redis y PostgreSQL se configuran con más cuidado
- no conviene exponer todo por puertos públicos

### Si tu app corre dentro de Docker, cambia los hosts

Si el backend Spring Boot también está en Compose, normalmente no vas a conectar a `localhost`, sino al nombre del servicio:

- `postgres`
- `mongo`
- `redis`
- `kafka`

Por ejemplo:

```properties
spring.datasource.url=jdbc:postgresql://postgres:5432/appdb
```

---

## 11) Plantilla mínima reutilizable

Cuando quieras armar tu propio stack desde cero, esta base suele servir:

```yaml
services:
  servicio:
    image: imagen:tag
    container_name: nombre-local
    environment:
      CLAVE: valor
    ports:
      - "1234:1234"
    volumes:
      - volumen_local:/ruta/interna
    healthcheck:
      test: ["CMD", "comando"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  volumen_local:
```

---

## 12) Sugerencia de uso con tus archivos anteriores

Combinación natural con lo que venimos armando:

- `springboot-pom-base-por-stack.md`
- `springboot-config-base-por-stack.md`
- este archivo de `docker-compose.yml`

Traducción rápida:

- elegís el **stack**
- copiás el **pom base**
- copiás la **configuración Spring Boot**
- levantás los servicios con Compose

Y ya tenés una base muy sólida para arrancar un backend real.
