---
title: "Spring Boot · `pom.xml` base por stack"
description: "Pensados para Spring Boot 4.0.5, Java 17+ y Maven 3.6.3+.
 Si trabajás con Spring Boot 3.x, casi todo te va a servir igual, pero en documentación nueva vas a ver que `spring-boot-starter-web` quedó reemplazado por `spring-boot-starter-webmvc`."
order: 3
module: "Spring Boot - Maven"
level: "intro"
draft: false
---
# Spring Boot · `pom.xml` base por stack

> Ejemplos listos para copiar y adaptar.
> 
> Pensados para **Spring Boot 4.0.5**, **Java 17+** y **Maven 3.6.3+**.
> Si trabajás con Spring Boot 3.x, casi todo te va a servir igual, pero en documentación nueva vas a ver que `spring-boot-starter-web` quedó reemplazado por `spring-boot-starter-webmvc`.

---

## 1) Plantilla base recomendada con `spring-boot-starter-parent`

Esta es la base más cómoda para la mayoría de los proyectos Maven con Spring Boot.

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.0.5</version>
        <relativePath/>
    </parent>

    <groupId>com.ejemplo</groupId>
    <artifactId>mi-app</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>mi-app</name>
    <description>Proyecto base con Spring Boot</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <!-- Tus dependencias -->
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 2) API REST clásica · Spring MVC + PostgreSQL + JPA + Security + Flyway

### Cuándo conviene

Usala para:

- CRUDs clásicos
- APIs REST de negocio
- backends administrativos
- aplicaciones donde JPA/Hibernate te simplifica mucho el modelado

### `pom.xml` completo

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.0.5</version>
        <relativePath/>
    </parent>

    <groupId>com.ejemplo</groupId>
    <artifactId>api-rest-postgres-jpa</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>api-rest-postgres-jpa</name>
    <description>API REST clásica con PostgreSQL, JPA, Security y Flyway</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-flyway</artifactId>
        </dependency>

        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### Variante JWT / Resource Server

Si tu API valida tokens JWT emitidos por otro sistema, agregá además:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security-oauth2-resource-server</artifactId>
</dependency>
```

### Extras frecuentes para este stack

#### Lombok

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

#### springdoc-openapi

> Esta sí suele requerir versión explícita, porque no forma parte del set oficial gestionado por Spring Boot.
>
> Para **Spring Boot 4.x**, la compatibilidad publicada por springdoc apunta a la línea **3.x.x**. Un ejemplo actual sería:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>3.0.2</version>
</dependency>
```

#### Testcontainers para PostgreSQL

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-testcontainers</artifactId>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
```

---

## 3) API reactiva · WebFlux + MongoDB reactivo + Security

### Cuándo conviene

Usala para:

- APIs reactivas
- backends que consumen streams o eventos
- apps donde querés pipeline reactivo de punta a punta
- casos con mucha concurrencia I/O-bound

### `pom.xml` completo

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.0.5</version>
        <relativePath/>
    </parent>

    <groupId>com.ejemplo</groupId>
    <artifactId>api-webflux-mongo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>api-webflux-mongo</name>
    <description>API reactiva con WebFlux y MongoDB</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-mongodb-reactive</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### Variante JWT / Resource Server reactivo

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security-oauth2-resource-server</artifactId>
</dependency>
```

### Extras frecuentes para este stack

#### springdoc-openapi para WebFlux

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webflux-ui</artifactId>
    <version>3.0.2</version>
</dependency>
```

#### Testcontainers para MongoDB

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-testcontainers</artifactId>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>mongodb</artifactId>
    <scope>test</scope>
</dependency>
```

---

## 4) Microservicio orientado a eventos · Kafka + Actuator + Validation

### Cuándo conviene

Usalo para:

- productores/consumidores Kafka
- integración entre microservicios
- procesamiento de eventos
- colas y pipelines asíncronos

### `pom.xml` completo

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.0.5</version>
        <relativePath/>
    </parent>

    <groupId>com.ejemplo</groupId>
    <artifactId>microservicio-kafka</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>microservicio-kafka</name>
    <description>Microservicio orientado a eventos con Kafka</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-kafka</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-kafka-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### Variante si también exponés endpoints HTTP

Agregá uno de estos dos:

#### Opción MVC

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webmvc</artifactId>
</dependency>
```

#### Opción reactiva

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

### Extras frecuentes para Kafka

#### Spring Security

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

#### Testcontainers para Kafka

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-testcontainers</artifactId>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>kafka</artifactId>
    <scope>test</scope>
</dependency>
```

---

## 5) Variante SQL sin JPA · JDBC o jOOQ

A veces no querés Hibernate ni entidades pesadas. En esos casos:

### Con JDBC

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>

<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

### Con jOOQ

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jooq</artifactId>
</dependency>

<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

### Cuándo elegir cada uno

- **JPA**: cuando querés productividad alta con entidades y repositorios.
- **JDBC**: cuando querés control más directo y consultas simples.
- **jOOQ**: cuando querés SQL fuerte, expresivo y tipado.

---

## 6) Variante reactiva SQL · WebFlux + R2DBC + PostgreSQL

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.0.5</version>
        <relativePath/>
    </parent>

    <groupId>com.ejemplo</groupId>
    <artifactId>api-webflux-r2dbc-postgres</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-r2dbc</artifactId>
        </dependency>

        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>r2dbc-postgresql</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 7) Si no querés usar `spring-boot-starter-parent`

Podés gestionar versiones con el BOM de Spring Boot dentro de `dependencyManagement`.

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>4.0.5</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

Después declarás las dependencias normalmente, sin versión, siempre que estén gestionadas por Boot.

---

## 8) Recomendaciones rápidas

### Para aprender Spring Boot backend en serio

Arrancaría en este orden:

1. **Web MVC + Validation**
2. **Data JPA + PostgreSQL**
3. **Security**
4. **Flyway**
5. **Actuator**
6. **Tests**
7. **Kafka o WebFlux**, según tu foco

### Stack más equilibrado para la mayoría de proyectos

Si hoy tuvieras que empezar un backend “generalista”, el combo más sólido sería:

- `spring-boot-starter-webmvc`
- `spring-boot-starter-validation`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-security`
- `spring-boot-starter-actuator`
- `spring-boot-starter-flyway`
- `org.postgresql:postgresql`
- `spring-boot-starter-test`

---

## 9) Nota importante sobre versiones

En estos ejemplos:

- **no** puse versión en starters oficiales de Spring Boot
- **no** puse versión en PostgreSQL ni en `r2dbc-postgresql`
- **no** puse versión en muchas librerías gestionadas por Boot

Eso funciona porque el `parent` o el BOM de Spring Boot se encarga de fijarlas.

En cambio, librerías externas como `springdoc-openapi` suelen declararse con versión explícita.

---

## 10) Checklist mental para elegir stack

### Elegí **Web MVC + JPA** si:

- querés productividad rápida
- tu backend es CRUD o negocio tradicional
- no necesitás programación reactiva real

### Elegí **WebFlux + Mongo / R2DBC** si:

- querés un pipeline reactivo real
- tu equipo ya entiende Reactor
- la app gana valor real con ese modelo

### Elegí **Kafka** si:

- vas a integrar servicios por eventos
- necesitás comunicación asíncrona
- querés desacoplar procesos

---

## 11) Archivo pensado para copiar rápido

La idea de este documento no es ser “teórico”, sino darte una base reutilizable.

Podés:

- copiar el `pom.xml` completo de un stack
- o mezclar bloques concretos según tu caso

Por ejemplo:

- REST + JPA + PostgreSQL + JWT
- WebFlux + Mongo + OpenAPI
- Kafka + Actuator + Security + endpoints HTTP

