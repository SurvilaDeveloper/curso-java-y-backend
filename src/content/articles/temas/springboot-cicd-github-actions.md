---
title: "Spring Boot · Kit base de CI/CD con GitHub Actions"
description: "Este artículo te deja una base práctica para automatizar proyectos Spring Boot con GitHub Actions.
- workflow de CI para compilar y correr tests
- workflow para publicar imagen Docker en GHCR
- variante usando Spring Boot Buildpacks (`spring-boot:build-image`)
- workflow de release simple con artefacto `.jar`
- recomendaciones de secrets, permissions y estructura de ramas
- notas para adaptar a `main`, `develop`, tags y entornos"
order: 9
module: "Spring Boot - GitHub"
level: "intro"
draft: false
---
# Spring Boot · Kit base de CI/CD con GitHub Actions

Este artículo te deja una base práctica para automatizar proyectos Spring Boot con **GitHub Actions**.

## Qué incluye

- workflow de **CI** para compilar y correr tests
- workflow para **publicar imagen Docker en GHCR**
- variante usando **Spring Boot Buildpacks** (`spring-boot:build-image`)
- workflow de **release** simple con artefacto `.jar`
- recomendaciones de **secrets**, **permissions** y estructura de ramas
- notas para adaptar a `main`, `develop`, tags y entornos

---

# 1) Estructura sugerida

```txt
.github/
  workflows/
    ci.yml
    docker-ghcr.yml
    buildpack-ghcr.yml
    release-jar.yml
```

---

# 2) CI básico · compilar y testear con Maven

Archivo: `.github/workflows/ci.yml`

```yml
name: CI

on:
  push:
    branches: ["main", "develop"]
  pull_request:
    branches: ["main", "develop"]

permissions:
  contents: read

jobs:
  build-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven

      - name: Build and test
        run: mvn -B clean verify
```

## Cuándo usarlo

- cuando querés validar que cada push y cada PR compilen bien
- cuando todavía no querés publicar imágenes ni desplegar
- como base mínima para casi cualquier backend Spring Boot con Maven

## Variantes comunes

### Solo tests rápidos

```yml
- name: Test
  run: mvn -B test
```

### Con perfil de integración

```yml
- name: Verify with integration profile
  run: mvn -B clean verify -Pci
```

### Fijando versión de Maven Wrapper

Si tu repo tiene `./mvnw`, podés usar:

```yml
- name: Build and test
  run: ./mvnw -B clean verify
```

---

# 3) CI con matriz de Java

Útil si querés validar, por ejemplo, Java 17 y Java 21.

Archivo: `.github/workflows/ci-matrix.yml`

```yml
name: CI Matrix

on:
  pull_request:
    branches: ["main"]
  push:
    branches: ["main"]

permissions:
  contents: read

jobs:
  build-test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        java: ['17', '21']

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: ${{ matrix.java }}
          cache: maven

      - name: Build and test
        run: mvn -B clean verify
```

---

# 4) Publicar imagen Docker en GHCR con Dockerfile

Este workflow construye una imagen con tu `Dockerfile` y la publica en **GitHub Container Registry**.

Archivo: `.github/workflows/docker-ghcr.yml`

```yml
name: Publish Docker image to GHCR

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  packages: write

jobs:
  docker:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository_owner }}/mi-app
          tags: |
            type=raw,value=latest
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

## Cuándo conviene

- cuando ya tenés un `Dockerfile` armado
- cuando querés controlar la imagen manualmente
- cuando necesitás una construcción muy específica

## Notas

- `packages: write` es importante para publicar en GHCR.
- `GITHUB_TOKEN` suele alcanzar para publicar paquetes asociados al repositorio.
- Si cambiás el nombre de la imagen, ajustá `ghcr.io/${{ github.repository_owner }}/mi-app`.

---

# 5) Publicar imagen con Spring Boot Buildpacks

Si preferís **no mantener un Dockerfile**, Spring Boot puede crear una imagen OCI con `spring-boot:build-image`.

Archivo: `.github/workflows/buildpack-ghcr.yml`

```yml
name: Buildpack image to GHCR

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  packages: write

jobs:
  buildpack:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build jar
        run: mvn -B clean package -DskipTests

      - name: Build OCI image with Spring Boot
        run: |
          mvn -B spring-boot:build-image \
            -Dspring-boot.build-image.imageName=ghcr.io/${{ github.repository_owner }}/mi-app:latest

      - name: Push image
        run: docker push ghcr.io/${{ github.repository_owner }}/mi-app:latest
```

## Cuándo conviene

- cuando querés una imagen más estandarizada
- cuando no querés mantener Dockerfile
- cuando te interesa aprovechar buildpacks y defaults razonables de Spring Boot

## Observación

Si querés tags por commit o por release, podés reemplazar `latest` por `${{ github.sha }}` o por el tag del release.

---

# 6) Publicación por tags

Muy útil si querés publicar una imagen solo cuando creás un tag de versión.

Archivo: `.github/workflows/docker-ghcr-tags.yml`

```yml
name: Publish Docker image on tag

on:
  push:
    tags:
      - 'v*.*.*'

permissions:
  contents: read
  packages: write

jobs:
  docker:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository_owner }}/mi-app
          tags: |
            type=ref,event=tag
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

## Resultado típico

Si pusheás el tag `v1.2.0`, la imagen puede salir con tags tipo:

```txt
ghcr.io/tu-org/mi-app:v1.2.0
ghcr.io/tu-org/mi-app:sha-abcdef1
```

---

# 7) Release simple del jar como artefacto

Si por ahora no querés imágenes Docker, este workflow compila y sube el `.jar` como artefacto descargable del workflow.

Archivo: `.github/workflows/release-jar.yml`

```yml
name: Build JAR artifact

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  package:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven

      - name: Package
        run: mvn -B clean package

      - name: Upload jar artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-jar
          path: target/*.jar
```

---

# 8) Deploy simple por SSH después del build

Esto ya es un paso de CD real. Supone que tu servidor recibe la imagen o el jar y reiniciás el servicio por SSH.

Archivo: `.github/workflows/deploy-ssh.yml`

```yml
name: Deploy via SSH

on:
  workflow_dispatch:
  push:
    branches: ["main"]

permissions:
  contents: read
  packages: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push image
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/mi-app:latest

      - name: Deploy on server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            docker login ghcr.io -u ${{ github.actor }} -p ${{ secrets.GITHUB_TOKEN }}
            docker pull ghcr.io/${{ github.repository_owner }}/mi-app:latest
            docker stop mi-app || true
            docker rm mi-app || true
            docker run -d --name mi-app -p 8080:8080 ghcr.io/${{ github.repository_owner }}/mi-app:latest
```

## Secrets que necesitás

- `SERVER_HOST`
- `SERVER_USER`
- `SERVER_SSH_KEY`

## Importante

En despliegues reales suele convenir que el servidor use un token de lectura propio para GHCR, no depender del token efímero del workflow en el host remoto.

---

# 9) Variables y secrets comunes

## Secrets frecuentes

```txt
GITHUB_TOKEN                # provisto por GitHub Actions
DOCKERHUB_USERNAME          # si publicás en Docker Hub
DOCKERHUB_TOKEN             # si publicás en Docker Hub
SERVER_HOST                 # deploy SSH
SERVER_USER                 # deploy SSH
SERVER_SSH_KEY              # deploy SSH
SPRING_PROD_DB_URL          # si inyectás config en deploys o entornos
SPRING_PROD_DB_USERNAME
SPRING_PROD_DB_PASSWORD
JWT_SECRET                  # solo si realmente vas a inyectarlo desde CI/CD
```

## Variables de repositorio útiles

```txt
IMAGE_NAME=mi-app
JAVA_VERSION=21
```

---

# 10) Permissions mínimas recomendadas

Intentá no dejar permisos amplios por defecto.

## Para CI básico

```yml
permissions:
  contents: read
```

## Para publicar en GHCR

```yml
permissions:
  contents: read
  packages: write
```

## Si además creás releases o tocás issues/PRs

Agregá solo lo necesario, por ejemplo:

```yml
permissions:
  contents: write
```

---

# 11) Cache de Maven

La forma más simple hoy suele ser dejar que `actions/setup-java` maneje `cache: maven`.

```yml
- name: Set up Java
  uses: actions/setup-java@v4
  with:
    distribution: temurin
    java-version: '21'
    cache: maven
```

---

# 12) Integración con tests de base de datos

Si usás PostgreSQL o Mongo para pruebas de integración, tenés dos caminos frecuentes:

## Opción A · Testcontainers

Muy cómoda si tu proyecto ya está preparado para eso.

```xml
<dependency>
  <groupId>org.testcontainers</groupId>
  <artifactId>junit-jupiter</artifactId>
  <scope>test</scope>
</dependency>
```

## Opción B · Service containers de GitHub Actions

Ejemplo con PostgreSQL:

```yml
jobs:
  build-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_DB: appdb
          POSTGRES_USER: appuser
          POSTGRES_PASSWORD: secret
        ports:
          - 5432:5432
        options: >-
          --health-cmd="pg_isready -U appuser -d appdb"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven

      - name: Build and test
        run: mvn -B clean verify
        env:
          SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/appdb
          SPRING_DATASOURCE_USERNAME: appuser
          SPRING_DATASOURCE_PASSWORD: secret
```

---

# 13) Pipeline sugerido según nivel

## Nivel 1 · mínimo sano

- `ci.yml`

## Nivel 2 · ya distribuís contenedores

- `ci.yml`
- `docker-ghcr.yml`

## Nivel 3 · release más prolijo

- `ci.yml`
- `docker-ghcr-tags.yml`
- `release-jar.yml`

## Nivel 4 · entrega continua simple

- `ci.yml`
- `docker-ghcr.yml`
- `deploy-ssh.yml`

---

# 14) Flujo recomendado para una app Spring Boot típica

## Repositorio pequeño o mediano

1. En cada PR: correr `CI`
2. En cada push a `main`: construir y publicar imagen
3. En tags `v*.*.*`: publicar imagen versionada
4. Opcional: desplegar manualmente con `workflow_dispatch`

## Ejemplo simple de estrategia

```txt
pull_request  -> test
push main     -> test + build image + push ghcr
push tag      -> test + build image + push tagged image
manual        -> deploy
```

---

# 15) Errores comunes

## 1. No declarar `packages: write`

Resultado: falla al publicar a GHCR.

## 2. Usar mal el nombre de la imagen

Chequeá siempre algo como:

```txt
ghcr.io/OWNER/NOMBRE
```

## 3. Olvidarte del `cache: maven`

No rompe nada, pero hace más lentos los builds.

## 4. Mezclar CI y deploy demasiado pronto

Primero estabilizá el build y los tests. Después agregá publicación y recién luego despliegue.

## 5. Exponer secrets innecesarios

No metas secretos en el repo ni en archivos versionados.

---

# 16) Plantilla mínima recomendada si querés arrancar ya

Si querés algo directo y razonable para un proyecto Spring Boot con Docker:

- `ci.yml`
- `docker-ghcr.yml`

Con eso ya tenés:

- validación automática
- build reproducible
- imagen lista para usar en servidor, VPS o plataforma cloud

---

# 17) Snippets rápidos reutilizables

## Trigger manual

```yml
on:
  workflow_dispatch:
```

## Trigger por push a main

```yml
on:
  push:
    branches: ["main"]
```

## Trigger por tags semánticos

```yml
on:
  push:
    tags:
      - 'v*.*.*'
```

## Setup Java + cache Maven

```yml
- uses: actions/setup-java@v4
  with:
    distribution: temurin
    java-version: '21'
    cache: maven
```

## Login a GHCR

```yml
- uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

## Build Maven

```yml
- run: mvn -B clean verify
```

## Build y push Docker

```yml
- uses: docker/build-push-action@v6
  with:
    context: .
    file: ./Dockerfile
    push: true
    tags: ghcr.io/${{ github.repository_owner }}/mi-app:latest
```

---

# 18) Qué te conviene elegir

## Elegí Dockerfile si:

- querés control total de la imagen
- necesitás pasos específicos del sistema operativo
- ya venís usando Docker manualmente

## Elegí Buildpacks si:

- querés simplificar mantenimiento
- no necesitás un Dockerfile custom
- te sirve una imagen OCI generada por Spring Boot

## Elegí deploy manual primero si:

- todavía estás ajustando infraestructura
- querés evitar que cada push toque producción

---

# 19) Siguiente paso lógico

Después de este archivo, el kit que mejor encaja es:

- **deploys por proveedor**: Render, Railway, Fly.io, VPS, EC2, Azure, GCP
- o un archivo con **GitHub Actions + PostgreSQL/Mongo/Redis/Kafka en tests reales**
- o una versión con **monorepo / múltiples servicios Spring Boot**

