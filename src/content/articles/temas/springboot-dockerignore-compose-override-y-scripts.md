---
title: "Spring Boot · `.dockerignore`, `compose.override.yml` y scripts Maven/Docker de uso diario"
description: "Este artículo reúne plantillas prácticas para acompañar un backend Spring Boot en desarrollo y en un flujo local con Docker.
  Incluye:
  - `.dockerignore` base
  - `compose.override.yml` para desarrollo
  - scripts y alias de uso diario
  - comandos Maven y Docker frecuentes
  - variantes para distintos stacks
  - notas para evitar errores comunes"
order: 8
module: "Spring Boot - Docker"
level: "intro"
draft: false
---
# Spring Boot · `.dockerignore`, `compose.override.yml` y scripts Maven/Docker de uso diario

Este artículo reúne plantillas prácticas para acompañar un backend Spring Boot en desarrollo y en un flujo local con Docker.

Incluye:

- `.dockerignore` base
- `compose.override.yml` para desarrollo
- scripts y alias de uso diario
- comandos Maven y Docker frecuentes
- variantes para distintos stacks
- notas para evitar errores comunes

---

## 1) `.dockerignore` base para Spring Boot

> Úsalo junto a tu `Dockerfile` para no enviar archivos innecesarios al contexto de build.

```dockerignore
# Git
.git
.gitignore

# IDEs / editores
.idea
.vscode
*.iml

# Maven / Gradle outputs
.target
build
out

# Maven wrapper logs / temp
.mvn/wrapper/maven-wrapper.jar.backup

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs

# Local env files
.env
.env.*
!.env.example

# Node / frontend auxiliares si conviven en el repo
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Docker extras opcionales
docker-data
*.pid

# Test / reports
coverage
surefire-reports
failsafe-reports

# Archivos temporales
*.tmp
*.swp
*~
```

### Variante si usás Maven Wrapper

Si tu imagen construye el proyecto dentro del contenedor usando `./mvnw`, **no ignores** estos archivos:

- `.mvn/`
- `mvnw`
- `mvnw.cmd`

En ese caso, esta parte del `.dockerignore` está bien así:

```dockerignore
# mantener wrapper si el build ocurre dentro del contenedor
!.mvn/
!mvnw
!mvnw.cmd
```

### Variante si hacés `jar` afuera y sólo copiás el artefacto

Si primero corrés `mvn clean package` en tu máquina y después copiás el `.jar` a la imagen, podés usar un `.dockerignore` más agresivo:

```dockerignore
*
!target/*.jar
!Dockerfile
!docker/
!compose.yml
!compose.override.yml
```

---

## 2) `compose.override.yml` para desarrollo local

Docker Compose aplica automáticamente `compose.yml` + `compose.override.yml` cuando ejecutás `docker compose up` en la carpeta del proyecto.

La idea es:

- dejar `compose.yml` más neutral
- usar `compose.override.yml` para desarrollo local
- montar código, activar perfiles `dev`, abrir puertos extra y facilitar debugging

---

## 3) Ejemplo base de `compose.yml`

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    image: miapp:dev
    container_name: miapp-app
    environment:
      SPRING_PROFILES_ACTIVE: prod
    ports:
      - "8080:8080"
    depends_on:
      - postgres

  postgres:
    image: postgres:17
    container_name: miapp-postgres
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: appsecret
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 4) `compose.override.yml` para desarrollo · Spring MVC + PostgreSQL

```yaml
services:
  app:
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/appdb
      SPRING_DATASOURCE_USERNAME: appuser
      SPRING_DATASOURCE_PASSWORD: appsecret
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
      SPRING_FLYWAY_ENABLED: true
      SERVER_PORT: 8080
      JAVA_TOOL_OPTIONS: >-
        -XX:MaxRAMPercentage=75.0
        -Duser.timezone=America/Argentina/Buenos_Aires
    ports:
      - "8080:8080"
      - "5005:5005"
    command: >
      java
      -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
      -jar /app/app.jar
```

### Cuándo usarlo

- querés levantar la app con perfil `dev`
- querés debug remoto desde IntelliJ o VS Code
- querés sobreescribir variables sin tocar el compose base

---

## 5) `compose.override.yml` con montaje de código para desarrollo rápido

Esto sirve más cuando usás una imagen preparada para desarrollo o un contenedor que ejecuta Maven adentro.

```yaml
services:
  app:
    image: maven:3.9.11-eclipse-temurin-21
    working_dir: /workspace
    volumes:
      - ./:/workspace
      - maven_cache:/root/.m2
    command: ./mvnw spring-boot:run
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/appdb
      SPRING_DATASOURCE_USERNAME: appuser
      SPRING_DATASOURCE_PASSWORD: appsecret
    ports:
      - "8080:8080"
      - "5005:5005"
    depends_on:
      - postgres

volumes:
  maven_cache:
```

### Ventajas

- no necesitás rebuild de imagen por cada cambio
- reutilizás caché de Maven
- ideal para desarrollo local rápido

### Desventajas

- arranque más lento que correr el `.jar`
- menos parecido a producción

---

## 6) `compose.override.yml` · WebFlux + PostgreSQL R2DBC

```yaml
services:
  app:
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_R2DBC_URL: r2dbc:postgresql://postgres:5432/appdb
      SPRING_R2DBC_USERNAME: appuser
      SPRING_R2DBC_PASSWORD: appsecret
      SPRING_FLYWAY_ENABLED: true
      SPRING_FLYWAY_URL: jdbc:postgresql://postgres:5432/appdb
      SPRING_FLYWAY_USER: appuser
      SPRING_FLYWAY_PASSWORD: appsecret
    ports:
      - "8080:8080"
```

> Recordá: **Flyway sigue necesitando JDBC**, aunque tu acceso principal a datos sea con R2DBC.

---

## 7) `compose.override.yml` · WebFlux + MongoDB reactivo

```yaml
services:
  app:
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATA_MONGODB_URI: mongodb://root:secret@mongo:27017/appdb?authSource=admin
    depends_on:
      - mongo
    ports:
      - "8080:8080"

  mongo:
    image: mongo:8
    container_name: miapp-mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: secret
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

## 8) `compose.override.yml` · Kafka para desarrollo

```yaml
services:
  app:
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:9092
    depends_on:
      - kafka
    ports:
      - "8080:8080"

  kafka:
    image: apache/kafka:4.1.0
    container_name: miapp-kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
```

---

## 9) `compose.override.yml` · Redis para cache o sesiones

```yaml
services:
  app:
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATA_REDIS_HOST: redis
      SPRING_DATA_REDIS_PORT: 6379
    depends_on:
      - redis

  redis:
    image: redis:8
    container_name: miapp-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

---

## 10) `compose.override.yml` · Mailpit para pruebas de email

```yaml
services:
  app:
    environment:
      SPRING_MAIL_HOST: mailpit
      SPRING_MAIL_PORT: 1025
    depends_on:
      - mailpit

  mailpit:
    image: axllent/mailpit:latest
    container_name: miapp-mailpit
    ports:
      - "1025:1025"
      - "8025:8025"
```

Interfaz web de Mailpit:

- http://localhost:8025

---

## 11) `compose.override.yml` · pgAdmin opcional

```yaml
services:
  pgadmin:
    image: dpage/pgadmin4:9
    container_name: miapp-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@local.test
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
```

---

## 12) Scripts Maven de uso diario

Podés guardarlos en una carpeta `scripts/`.

---

### `scripts/dev-build.sh`

```bash
#!/usr/bin/env bash
set -e

./mvnw clean package -DskipTests
```

---

### `scripts/dev-test.sh`

```bash
#!/usr/bin/env bash
set -e

./mvnw test
```

---

### `scripts/dev-verify.sh`

```bash
#!/usr/bin/env bash
set -e

./mvnw clean verify
```

---

### `scripts/dev-run.sh`

```bash
#!/usr/bin/env bash
set -e

./mvnw spring-boot:run
```

---

### `scripts/dev-run-profile.sh`

```bash
#!/usr/bin/env bash
set -e

PROFILE="${1:-dev}"
./mvnw spring-boot:run -Dspring-boot.run.profiles="$PROFILE"
```

Uso:

```bash
bash scripts/dev-run-profile.sh dev
bash scripts/dev-run-profile.sh prod
```

---

### `scripts/dev-native-testcontainers.sh`

```bash
#!/usr/bin/env bash
set -e

./mvnw test -Dspring.profiles.active=test
```

---

## 13) Scripts Docker de uso diario

---

### `scripts/docker-build.sh`

```bash
#!/usr/bin/env bash
set -e

IMAGE_NAME="${1:-miapp}"
IMAGE_TAG="${2:-dev}"

docker build -t "$IMAGE_NAME:$IMAGE_TAG" .
```

---

### `scripts/docker-run.sh`

```bash
#!/usr/bin/env bash
set -e

IMAGE_NAME="${1:-miapp}"
IMAGE_TAG="${2:-dev}"
PORT="${3:-8080}"

docker run --rm -p "$PORT:8080" "$IMAGE_NAME:$IMAGE_TAG"
```

---

### `scripts/docker-run-env.sh`

```bash
#!/usr/bin/env bash
set -e

IMAGE_NAME="${1:-miapp}"
IMAGE_TAG="${2:-dev}"

docker run --rm \
  --env-file .env \
  -p 8080:8080 \
  "$IMAGE_NAME:$IMAGE_TAG"
```

---

### `scripts/compose-up.sh`

```bash
#!/usr/bin/env bash
set -e

docker compose up -d --build
```

---

### `scripts/compose-down.sh`

```bash
#!/usr/bin/env bash
set -e

docker compose down
```

---

### `scripts/compose-reset.sh`

```bash
#!/usr/bin/env bash
set -e

docker compose down -v

docker compose up -d --build
```

> Úsalo con cuidado porque elimina volúmenes.

---

### `scripts/compose-logs.sh`

```bash
#!/usr/bin/env bash
set -e

SERVICE="${1:-app}"
docker compose logs -f "$SERVICE"
```

---

## 14) Alias útiles para tu terminal

Podés agregarlos a tu `.bashrc`, `.zshrc` o al profile de Git Bash.

```bash
alias mvnrun='./mvnw spring-boot:run'
alias mvntest='./mvnw test'
alias mvnverify='./mvnw clean verify'
alias mvnpackage='./mvnw clean package -DskipTests'
alias dcb='docker compose build'
alias dcu='docker compose up -d'
alias dcub='docker compose up -d --build'
alias dcd='docker compose down'
alias dcl='docker compose logs -f app'
alias dps='docker ps'
alias di='docker images'
```

---

## 15) Comandos Maven más usados en Spring Boot

### Compilar y empaquetar

```bash
./mvnw clean package
```

### Empaquetar sin tests

```bash
./mvnw clean package -DskipTests
```

### Ejecutar tests

```bash
./mvnw test
```

### Pipeline local bastante completo

```bash
./mvnw clean verify
```

### Ejecutar la app

```bash
./mvnw spring-boot:run
```

### Ejecutar con perfil

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Generar imagen OCI con buildpacks

```bash
./mvnw spring-boot:build-image
```

### Generar imagen con nombre custom

```bash
./mvnw spring-boot:build-image -Dspring-boot.build-image.imageName=miapp:dev
```

---

## 16) Comandos Docker más usados

### Build de imagen

```bash
docker build -t miapp:dev .
```

### Ejecutar imagen

```bash
docker run --rm -p 8080:8080 miapp:dev
```

### Ejecutar con `.env`

```bash
docker run --rm --env-file .env -p 8080:8080 miapp:dev
```

### Ver logs

```bash
docker logs -f <container>
```

### Entrar al contenedor

```bash
docker exec -it <container> sh
```

### Compose con rebuild

```bash
docker compose up -d --build
```

### Bajar servicios

```bash
docker compose down
```

### Bajar servicios y borrar volúmenes

```bash
docker compose down -v
```

---

## 17) Plantilla de `.env.example`

```env
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080

POSTGRES_DB=appdb
POSTGRES_USER=appuser
POSTGRES_PASSWORD=appsecret
POSTGRES_PORT=5432

MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=secret
MONGO_PORT=27017

REDIS_PORT=6379

MAIL_HOST=mailpit
MAIL_PORT=1025

JWT_ISSUER_URI=http://localhost:9000
JWT_JWK_SET_URI=http://localhost:9000/oauth2/jwks
```

> Conviene versionar `.env.example` pero no el `.env` real con secretos.

---

## 18) Estructura de carpetas sugerida

```text
.
├── Dockerfile
├── compose.yml
├── compose.override.yml
├── .dockerignore
├── .env
├── .env.example
├── scripts/
│   ├── dev-build.sh
│   ├── dev-run.sh
│   ├── dev-test.sh
│   ├── docker-build.sh
│   ├── docker-run.sh
│   ├── compose-up.sh
│   └── compose-down.sh
├── src/
├── pom.xml
└── mvnw
```

---

## 19) Rutina práctica de uso diario

### Opción A · desarrollo sin contenedor para la app

1. Levantás dependencias:

```bash
docker compose up -d postgres redis mailpit
```

2. Corrés la app local:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Ventajas

- hot reload más directo
- debugging más cómodo
- menos fricción para iterar

---

### Opción B · dependencias + app dentro de Docker Compose

```bash
docker compose up -d --build
```

### Ventajas

- entorno más uniforme
- más parecido a cómo corre en infraestructura

### Desventajas

- feedback más lento si rebuildás mucho

---

## 20) Errores comunes que conviene evitar

### Ignorar `target/` cuando tu Dockerfile necesita el `.jar`

Si tu Dockerfile hace algo como:

```dockerfile
COPY target/*.jar app.jar
```

entonces **no podés ignorar `target/`** si el `.jar` se genera afuera del contenedor.

---

### Montar el proyecto entero encima de `/app` y “pisar” el `.jar`

Si tu imagen trae `/app/app.jar` y además montás `.:/app`, podés tapar el archivo copiado en build.

---

### Usar `localhost` dentro de contenedores

Dentro del contenedor, `localhost` apunta a ese mismo contenedor, no a PostgreSQL, Mongo o Redis del compose. Tenés que usar el **nombre del servicio**, por ejemplo:

- `postgres`
- `mongo`
- `redis`
- `kafka`

---

### No separar `dev` y `prod`

Conviene que el compose override tenga:

- perfil `dev`
- puertos extra
- herramientas de inspección
- opciones de debug

Y que producción use otra configuración más mínima y estricta.

---

## 21) Plantilla mínima reutilizable para cualquier stack

### `.dockerignore`

```dockerignore
.git
.idea
.vscode
target
build
node_modules
*.log
.env
.env.*
!.env.example
```

### `compose.override.yml`

```yaml
services:
  app:
    environment:
      SPRING_PROFILES_ACTIVE: dev
    ports:
      - "8080:8080"
```

### scripts rápidos

```bash
./mvnw clean verify
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
docker compose up -d --build
docker compose logs -f app
```

---

## 22) Recomendación final de flujo

Para proyectos Spring Boot chicos o medianos, suele funcionar muy bien este esquema:

- **app corriendo local con Maven**
- **dependencias en Docker Compose**
- **Dockerfile sólo para empaquetado y despliegue**

Y cuando necesitás probar una imagen real:

- `./mvnw clean package`
- `docker build -t miapp:dev .`
- `docker run --rm -p 8080:8080 --env-file .env miapp:dev`

Ese flujo suele ser el más cómodo para desarrollar sin perder el camino a producción.

