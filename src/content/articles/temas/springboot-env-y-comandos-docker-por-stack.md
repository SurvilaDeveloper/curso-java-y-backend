---
title: "Spring Boot · `.env` y comandos Docker por stack"
description: "Este artículo reúne ejemplos base de:
  - `.env`
  - `docker build`
  - `docker run`
  - recomendaciones prácticas para desarrollo y producción
  La idea es que puedas copiar estos bloques como punto de partida y ajustarlos a tu proyecto."
order: 7
module: "Spring Boot - Docker"
level: "intro"
draft: false
---
# Spring Boot · `.env` y comandos Docker por stack

Este artículo reúne ejemplos base de:

- `.env`
- `docker build`
- `docker run`
- recomendaciones prácticas para desarrollo y producción

La idea es que puedas copiar estos bloques como punto de partida y ajustarlos a tu proyecto.

---

## 1) Convenciones usadas en este archivo

### Variables frecuentes

- `APP_NAME`: nombre de la imagen o contenedor de tu app
- `APP_PORT`: puerto expuesto por Spring Boot
- `SPRING_PROFILES_ACTIVE`: perfil activo (`dev`, `prod`, etc.)
- `JAVA_OPTS`: flags para la JVM
- `TZ`: zona horaria del contenedor

### Supuestos comunes

- Tu aplicación escucha en el puerto `8080` dentro del contenedor.
- Tu `Dockerfile` ya compila o copia el `.jar` correctamente.
- Tus propiedades de Spring Boot leen variables de entorno con `application.properties` o `application.yml`.

Ejemplo:

```properties
server.port=${APP_PORT:8080}
spring.profiles.active=${SPRING_PROFILES_ACTIVE:dev}
```

---

## 2) `.env` base genérico para Spring Boot

```env
APP_NAME=my-springboot-app
APP_PORT=8080
HOST_PORT=8080
SPRING_PROFILES_ACTIVE=dev
TZ=America/Argentina/Buenos_Aires
JAVA_OPTS=-Xms256m -Xmx512m
LOG_LEVEL=INFO
```

### Build

```bash
docker build -t ${APP_NAME}:latest .
```

### Run

```bash
docker run --rm \
  --name ${APP_NAME} \
  --env-file .env \
  -e SERVER_PORT=${APP_PORT} \
  -e SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE} \
  -e TZ=${TZ} \
  -e JAVA_OPTS="${JAVA_OPTS}" \
  -p ${HOST_PORT}:${APP_PORT} \
  ${APP_NAME}:latest
```

### Variante simple sin `.env`

```bash
docker build -t my-springboot-app:latest .

docker run --rm \
  --name my-springboot-app \
  -e SERVER_PORT=8080 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -p 8080:8080 \
  my-springboot-app:latest
```

---

## 3) Stack: Spring MVC + PostgreSQL + JPA + Flyway

### `.env`

```env
APP_NAME=orders-api
APP_PORT=8080
HOST_PORT=8080
SPRING_PROFILES_ACTIVE=dev
TZ=America/Argentina/Buenos_Aires
JAVA_OPTS=-Xms256m -Xmx768m

DB_HOST=host.docker.internal
DB_PORT=5432
DB_NAME=ordersdb
DB_USER=postgres
DB_PASSWORD=postgres

SPRING_DATASOURCE_URL=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
SPRING_DATASOURCE_USERNAME=${DB_USER}
SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_JPA_SHOW_SQL=true
SPRING_FLYWAY_ENABLED=true
```

### `application.properties` típico

```properties
server.port=${APP_PORT:8080}
spring.profiles.active=${SPRING_PROFILES_ACTIVE:dev}

spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}

spring.jpa.hibernate.ddl-auto=${SPRING_JPA_HIBERNATE_DDL_AUTO:validate}
spring.jpa.show-sql=${SPRING_JPA_SHOW_SQL:false}

spring.flyway.enabled=${SPRING_FLYWAY_ENABLED:true}
```

### Build

```bash
docker build -t orders-api:latest .
```

### Run contra PostgreSQL ya existente en tu máquina

```bash
docker run --rm \
  --name orders-api \
  --env-file .env \
  -p 8080:8080 \
  orders-api:latest
```

### Run conectando a un contenedor PostgreSQL en la misma red

Primero creá una red:

```bash
docker network create spring-net
```

Levantá PostgreSQL:

```bash
docker run -d \
  --name postgres-db \
  --network spring-net \
  -e POSTGRES_DB=ordersdb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16
```

Luego ejecutá la app:

```bash
docker run --rm \
  --name orders-api \
  --network spring-net \
  -e SERVER_PORT=8080 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-db:5432/ordersdb \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  -e SPRING_JPA_HIBERNATE_DDL_AUTO=validate \
  -e SPRING_FLYWAY_ENABLED=true \
  -p 8080:8080 \
  orders-api:latest
```

### Observaciones

- En Docker Desktop sobre Windows suele ser útil `host.docker.internal` para hablar con servicios del host.
- En producción conviene no hardcodear credenciales en `.env` versionado.
- Con Flyway, lo normal es usar `ddl-auto=validate` y dejar el esquema bajo migraciones.

---

## 4) Stack: Spring WebFlux + R2DBC + PostgreSQL

### `.env`

```env
APP_NAME=reactive-orders-api
APP_PORT=8080
HOST_PORT=8080
SPRING_PROFILES_ACTIVE=dev
TZ=America/Argentina/Buenos_Aires
JAVA_OPTS=-Xms256m -Xmx768m

R2DBC_HOST=host.docker.internal
R2DBC_PORT=5432
R2DBC_DB=ordersdb
R2DBC_USER=postgres
R2DBC_PASSWORD=postgres

SPRING_R2DBC_URL=r2dbc:postgresql://${R2DBC_HOST}:${R2DBC_PORT}/${R2DBC_DB}
SPRING_R2DBC_USERNAME=${R2DBC_USER}
SPRING_R2DBC_PASSWORD=${R2DBC_PASSWORD}
```

### Build

```bash
docker build -t reactive-orders-api:latest .
```

### Run

```bash
docker run --rm \
  --name reactive-orders-api \
  --env-file .env \
  -p 8080:8080 \
  reactive-orders-api:latest
```

### Run con PostgreSQL en red Docker

```bash
docker network create spring-net

docker run -d \
  --name postgres-db \
  --network spring-net \
  -e POSTGRES_DB=ordersdb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  postgres:16

docker run --rm \
  --name reactive-orders-api \
  --network spring-net \
  -e SERVER_PORT=8080 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e SPRING_R2DBC_URL=r2dbc:postgresql://postgres-db:5432/ordersdb \
  -e SPRING_R2DBC_USERNAME=postgres \
  -e SPRING_R2DBC_PASSWORD=postgres \
  -p 8080:8080 \
  reactive-orders-api:latest
```

### Observaciones

- Si además usás Flyway, muchas veces se agrega también una conexión JDBC separada para migraciones.
- R2DBC no reemplaza mágicamente todo el ecosistema JDBC; elegilo si realmente vas con stack reactivo.

---

## 5) Stack: Spring WebFlux + MongoDB reactivo

### `.env`

```env
APP_NAME=reactive-catalog-api
APP_PORT=8080
HOST_PORT=8080
SPRING_PROFILES_ACTIVE=dev
TZ=America/Argentina/Buenos_Aires
JAVA_OPTS=-Xms256m -Xmx768m

MONGO_HOST=host.docker.internal
MONGO_PORT=27017
MONGO_DB=catalogdb
MONGO_USER=root
MONGO_PASSWORD=root

SPRING_DATA_MONGODB_URI=mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin
```

### Build

```bash
docker build -t reactive-catalog-api:latest .
```

### Run con Mongo del host

```bash
docker run --rm \
  --name reactive-catalog-api \
  --env-file .env \
  -p 8080:8080 \
  reactive-catalog-api:latest
```

### Run con Mongo en la misma red Docker

```bash
docker network create spring-net

docker run -d \
  --name mongo-db \
  --network spring-net \
  -e MONGO_INITDB_ROOT_USERNAME=root \
  -e MONGO_INITDB_ROOT_PASSWORD=root \
  -p 27017:27017 \
  mongo:7

docker run --rm \
  --name reactive-catalog-api \
  --network spring-net \
  -e SERVER_PORT=8080 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e SPRING_DATA_MONGODB_URI=mongodb://root:root@mongo-db:27017/catalogdb?authSource=admin \
  -p 8080:8080 \
  reactive-catalog-api:latest
```

### Observaciones

- Si no necesitás autenticación en local, podés simplificar la URI.
- Para desarrollo, conviene que el nombre del servicio Docker coincida con el host que usás en la URI.

---

## 6) Stack: microservicio con Kafka

### `.env`

```env
APP_NAME=events-api
APP_PORT=8080
HOST_PORT=8080
SPRING_PROFILES_ACTIVE=dev
TZ=America/Argentina/Buenos_Aires
JAVA_OPTS=-Xms256m -Xmx768m

KAFKA_BOOTSTRAP_SERVERS=host.docker.internal:9092
SPRING_KAFKA_BOOTSTRAP_SERVERS=${KAFKA_BOOTSTRAP_SERVERS}
```

### Build

```bash
docker build -t events-api:latest .
```

### Run contra Kafka existente

```bash
docker run --rm \
  --name events-api \
  --env-file .env \
  -p 8080:8080 \
  events-api:latest
```

### Run con Kafka en red Docker

Este ejemplo asume que ya tenés Kafka corriendo en una red compartida y accesible como `kafka:9092`.

```bash
docker network create spring-net

docker run --rm \
  --name events-api \
  --network spring-net \
  -e SERVER_PORT=8080 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:9092 \
  -p 8080:8080 \
  events-api:latest
```

### Observaciones

- Para Kafka, suele ser más cómodo usar `docker compose` porque la configuración de listeners puede ser más sensible.
- Si tu app sólo consume eventos y no expone HTTP, incluso podrías no mapear puertos.

---

## 7) Stack: Spring Boot + Redis para cache

### `.env`

```env
APP_NAME=cache-api
APP_PORT=8080
HOST_PORT=8080
SPRING_PROFILES_ACTIVE=dev
TZ=America/Argentina/Buenos_Aires
JAVA_OPTS=-Xms256m -Xmx512m

REDIS_HOST=host.docker.internal
REDIS_PORT=6379
SPRING_DATA_REDIS_HOST=${REDIS_HOST}
SPRING_DATA_REDIS_PORT=${REDIS_PORT}
```

### Build

```bash
docker build -t cache-api:latest .
```

### Run con Redis en red Docker

```bash
docker network create spring-net

docker run -d \
  --name redis-cache \
  --network spring-net \
  -p 6379:6379 \
  redis:7

docker run --rm \
  --name cache-api \
  --network spring-net \
  -e SERVER_PORT=8080 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e SPRING_DATA_REDIS_HOST=redis-cache \
  -e SPRING_DATA_REDIS_PORT=6379 \
  -p 8080:8080 \
  cache-api:latest
```

### Observaciones

- Para sesiones con Spring Session + Redis, normalmente además definís `spring.session.store-type=redis`.
- En local, Redis suele usarse sin password; en entornos reales, mejor protegerlo.

---

## 8) Stack: Spring Boot + JWT / Resource Server

### `.env`

```env
APP_NAME=secure-api
APP_PORT=8080
HOST_PORT=8080
SPRING_PROFILES_ACTIVE=dev
TZ=America/Argentina/Buenos_Aires
JAVA_OPTS=-Xms256m -Xmx512m

SPRING_SECURITY_OAUTH2_RESOURCESERVER_JWT_ISSUER_URI=http://host.docker.internal:9000/realms/demo
```

### Build

```bash
docker build -t secure-api:latest .
```

### Run

```bash
docker run --rm \
  --name secure-api \
  --env-file .env \
  -p 8080:8080 \
  secure-api:latest
```

### Observaciones

- Si el issuer también corre en Docker, conviene usar la misma red y resolverlo por nombre de servicio.
- El caso más común es Keycloak, Auth0 o un Authorization Server propio.

---

## 9) Ejemplo de `docker run` con muchas variables inline

A veces para pruebas rápidas no querés usar `.env`.

```bash
docker run --rm \
  --name demo-api \
  -e SERVER_PORT=8080 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/appdb \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  -e SPRING_JPA_HIBERNATE_DDL_AUTO=validate \
  -e LOGGING_LEVEL_ROOT=INFO \
  -p 8080:8080 \
  demo-api:latest
```

---

## 10) Ejemplo de `docker build` con argumentos

Si tu `Dockerfile` soporta `ARG`, podés pasar valores en build time:

```dockerfile
ARG JAR_FILE=target/app.jar
COPY ${JAR_FILE} app.jar
```

Build:

```bash
docker build \
  --build-arg JAR_FILE=target/my-app-0.0.1-SNAPSHOT.jar \
  -t my-app:latest .
```

### Cuándo usar `ARG` y cuándo `ENV`

- **`ARG`**: para construir la imagen.
- **`ENV`** o `-e` en `docker run`: para configurar la app cuando el contenedor arranca.

---

## 11) Archivo `.env.example` recomendado

Conviene versionar un `.env.example` y ignorar `.env` real.

### `.env.example`

```env
APP_NAME=my-app
APP_PORT=8080
HOST_PORT=8080
SPRING_PROFILES_ACTIVE=dev
TZ=America/Argentina/Buenos_Aires
JAVA_OPTS=-Xms256m -Xmx512m

DB_HOST=localhost
DB_PORT=5432
DB_NAME=appdb
DB_USER=postgres
DB_PASSWORD=change-me

SPRING_DATASOURCE_URL=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
SPRING_DATASOURCE_USERNAME=${DB_USER}
SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD}
```

### `.gitignore`

```gitignore
.env
```

---

## 12) Comandos útiles de operación

### Ver logs

```bash
docker logs -f orders-api
```

### Entrar al contenedor

```bash
docker exec -it orders-api sh
```

### Ver variables cargadas

```bash
docker exec -it orders-api env
```

### Inspeccionar red

```bash
docker network inspect spring-net
```

### Borrar contenedor parado

```bash
docker rm orders-api
```

### Borrar imagen

```bash
docker rmi orders-api:latest
```

---

## 13) Recomendaciones prácticas

### Para desarrollo

- Usá `--rm` para no acumular contenedores temporales.
- Preferí `.env` o `docker compose` cuando el comando empieza a crecer mucho.
- Si dependés de Postgres, Mongo, Redis o Kafka, casi siempre conviene una red Docker dedicada.

### Para producción

- No metas secretos reales en `.env` versionado.
- Limitá memoria y CPU del contenedor según el entorno.
- Definí health checks y logs claros.
- Usá imágenes versionadas, no solamente `latest`.

Ejemplo con límites básicos:

```bash
docker run -d \
  --name orders-api \
  --memory=768m \
  --cpus=1.0 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -p 8080:8080 \
  orders-api:1.0.0
```

---

## 14) Plantilla corta reutilizable

```bash
docker build -t <nombre-app>:latest .

docker run --rm \
  --name <nombre-contenedor> \
  --env-file .env \
  -p <puerto-host>:<puerto-app> \
  <nombre-app>:latest
```

---

## 15) Idea de estructura sugerida

```text
mi-proyecto/
├─ Dockerfile
├─ .dockerignore
├─ .env.example
├─ .env
├─ docker-compose.yml
├─ pom.xml
└─ src/
```

---

## 16) Cierre

Si estás empezando, la combinación más cómoda suele ser:

- `.env.example` versionado
- `.env` local ignorado
- `Dockerfile` para tu app
- `docker compose` para base de datos y servicios auxiliares
- `docker run` directo sólo para pruebas rápidas o casos simples

