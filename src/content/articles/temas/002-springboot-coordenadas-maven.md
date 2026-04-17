---
title: "Spring Boot · Coordenadas Maven listas para copiar"
description: "En los starters oficiales de Spring Boot, si usás `spring-boot-starter-parent` o el BOM `spring-boot-dependencies`, normalmente no hace falta poner <version>."
order: 2
module: "Spring Boot - Maven"
level: "intro"
draft: false
---
# Spring Boot · Coordenadas Maven listas para copiar

> Versión de estudio y consulta rápida.
> En los **starters oficiales de Spring Boot**, si usás `spring-boot-starter-parent` o el BOM `spring-boot-dependencies`, normalmente **no hace falta poner `<version>`**.

---

## 1) Base recomendada del `pom.xml`

### Opción A · usando `spring-boot-starter-parent`

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.0.5</version>
    <relativePath/>
</parent>
```

Con esta opción, los starters oficiales se agregan así:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webmvc</artifactId>
</dependency>
```

### Opción B · usando BOM sin parent

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

---

## 2) Plantillas rápidas para copiar

### Starter oficial de Spring Boot

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>REEMPLAZAR_ARTIFACT_ID</artifactId>
</dependency>
```

### Dependencia externa con versión

```xml
<dependency>
    <groupId>REEMPLAZAR_GROUP_ID</groupId>
    <artifactId>REEMPLAZAR_ARTIFACT_ID</artifactId>
    <version>REEMPLAZAR_VERSION</version>
</dependency>
```

---

## 3) Starters oficiales de Spring Boot

### 3.1 Núcleo y base

- `org.springframework.boot:spring-boot-starter`
- `org.springframework.boot:spring-boot-starter-classic`
- `org.springframework.boot:spring-boot-starter-actuator`
- `org.springframework.boot:spring-boot-starter-validation`

### 3.2 Web, APIs HTTP y transporte

- `org.springframework.boot:spring-boot-starter-webmvc`
- `org.springframework.boot:spring-boot-starter-web`
- `org.springframework.boot:spring-boot-starter-webflux`
- `org.springframework.boot:spring-boot-starter-websocket`
- `org.springframework.boot:spring-boot-starter-restclient`
- `org.springframework.boot:spring-boot-starter-webclient`
- `org.springframework.boot:spring-boot-starter-jersey`
- `org.springframework.boot:spring-boot-starter-webservices`
- `org.springframework.boot:spring-boot-starter-web-services`
- `org.springframework.boot:spring-boot-starter-hateoas`
- `org.springframework.boot:spring-boot-starter-data-rest`
- `org.springframework.boot:spring-boot-starter-rsocket`
- `org.springframework.boot:spring-boot-starter-graphql`

### 3.3 SQL, JDBC, ORM y migraciones

- `org.springframework.boot:spring-boot-starter-jdbc`
- `org.springframework.boot:spring-boot-starter-data-jdbc`
- `org.springframework.boot:spring-boot-starter-data-jpa`
- `org.springframework.boot:spring-boot-starter-jooq`
- `org.springframework.boot:spring-boot-starter-r2dbc`
- `org.springframework.boot:spring-boot-starter-data-r2dbc`
- `org.springframework.boot:spring-boot-starter-flyway`
- `org.springframework.boot:spring-boot-starter-liquibase`

### 3.4 NoSQL, directorios y stores alternativos

- `org.springframework.boot:spring-boot-starter-cassandra`
- `org.springframework.boot:spring-boot-starter-data-cassandra`
- `org.springframework.boot:spring-boot-starter-data-cassandra-reactive`
- `org.springframework.boot:spring-boot-starter-couchbase`
- `org.springframework.boot:spring-boot-starter-data-couchbase`
- `org.springframework.boot:spring-boot-starter-data-couchbase-reactive`
- `org.springframework.boot:spring-boot-starter-elasticsearch`
- `org.springframework.boot:spring-boot-starter-data-elasticsearch`
- `org.springframework.boot:spring-boot-starter-mongodb`
- `org.springframework.boot:spring-boot-starter-data-mongodb`
- `org.springframework.boot:spring-boot-starter-data-mongodb-reactive`
- `org.springframework.boot:spring-boot-starter-neo4j`
- `org.springframework.boot:spring-boot-starter-data-neo4j`
- `org.springframework.boot:spring-boot-starter-data-redis`
- `org.springframework.boot:spring-boot-starter-data-redis-reactive`
- `org.springframework.boot:spring-boot-starter-ldap`
- `org.springframework.boot:spring-boot-starter-data-ldap`
- `org.springframework.boot:spring-boot-starter-hazelcast`

### 3.5 Seguridad, identidad y federación

- `org.springframework.boot:spring-boot-starter-security`
- `org.springframework.boot:spring-boot-starter-security-oauth2-client`
- `org.springframework.boot:spring-boot-starter-security-oauth2-resource-server`
- `org.springframework.boot:spring-boot-starter-security-oauth2-authorization-server`
- `org.springframework.boot:spring-boot-starter-security-saml2`

#### Nombres legados o deprecados que todavía podés ver en proyectos viejos

- `org.springframework.boot:spring-boot-starter-oauth2-client`
- `org.springframework.boot:spring-boot-starter-oauth2-resource-server`
- `org.springframework.boot:spring-boot-starter-oauth2-authorization-server`

### 3.6 Mensajería e integración

- `org.springframework.boot:spring-boot-starter-amqp`
- `org.springframework.boot:spring-boot-starter-kafka`
- `org.springframework.boot:spring-boot-starter-pulsar`
- `org.springframework.boot:spring-boot-starter-jms`
- `org.springframework.boot:spring-boot-starter-activemq`
- `org.springframework.boot:spring-boot-starter-artemis`
- `org.springframework.boot:spring-boot-starter-integration`

### 3.7 Batch, scheduling, correo, cache y sesiones

- `org.springframework.boot:spring-boot-starter-batch`
- `org.springframework.boot:spring-boot-starter-batch-jdbc`
- `org.springframework.boot:spring-boot-starter-quartz`
- `org.springframework.boot:spring-boot-starter-cache`
- `org.springframework.boot:spring-boot-starter-mail`
- `org.springframework.boot:spring-boot-starter-session-data-redis`
- `org.springframework.boot:spring-boot-starter-session-jdbc`
- `org.springframework.boot:spring-boot-starter-sendgrid`

### 3.8 Serialización, JSON y formatos

- `org.springframework.boot:spring-boot-starter-jackson`
- `org.springframework.boot:spring-boot-starter-json`
- `org.springframework.boot:spring-boot-starter-jsonb`
- `org.springframework.boot:spring-boot-starter-gson`
- `org.springframework.boot:spring-boot-starter-kotlinx-serialization-json`

### 3.9 Templates y vistas del lado servidor

- `org.springframework.boot:spring-boot-starter-thymeleaf`
- `org.springframework.boot:spring-boot-starter-freemarker`
- `org.springframework.boot:spring-boot-starter-mustache`
- `org.springframework.boot:spring-boot-starter-groovy-templates`

### 3.10 Observabilidad, tracing y runtime técnico

- `org.springframework.boot:spring-boot-starter-micrometer-metrics`
- `org.springframework.boot:spring-boot-starter-opentelemetry`
- `org.springframework.boot:spring-boot-starter-zipkin`
- `org.springframework.boot:spring-boot-starter-cloudfoundry`
- `org.springframework.boot:spring-boot-starter-reactor-netty`
- `org.springframework.boot:spring-boot-starter-tomcat`
- `org.springframework.boot:spring-boot-starter-jetty`
- `org.springframework.boot:spring-boot-starter-tomcat-runtime`
- `org.springframework.boot:spring-boot-starter-jetty-runtime`

### 3.11 Logging y documentación técnica

- `org.springframework.boot:spring-boot-starter-logging`
- `org.springframework.boot:spring-boot-starter-logback`
- `org.springframework.boot:spring-boot-starter-log4j2`
- `org.springframework.boot:spring-boot-starter-restdocs`

### 3.12 AOP

- `org.springframework.boot:spring-boot-starter-aspectj`

---

## 4) Starters oficiales de testing

### 4.1 Testing general

- `org.springframework.boot:spring-boot-starter-test`
- `org.springframework.boot:spring-boot-starter-test-classic`
- `org.springframework.boot:spring-boot-starter-security-test`

### 4.2 Test starters por tecnología

- `org.springframework.boot:spring-boot-starter-activemq-test`
- `org.springframework.boot:spring-boot-starter-actuator-test`
- `org.springframework.boot:spring-boot-starter-amqp-test`
- `org.springframework.boot:spring-boot-starter-artemis-test`
- `org.springframework.boot:spring-boot-starter-aspectj-test`
- `org.springframework.boot:spring-boot-starter-batch-test`
- `org.springframework.boot:spring-boot-starter-batch-jdbc-test`
- `org.springframework.boot:spring-boot-starter-cache-test`
- `org.springframework.boot:spring-boot-starter-cassandra-test`
- `org.springframework.boot:spring-boot-starter-cloudfoundry-test`
- `org.springframework.boot:spring-boot-starter-couchbase-test`
- `org.springframework.boot:spring-boot-starter-data-cassandra-test`
- `org.springframework.boot:spring-boot-starter-data-cassandra-reactive-test`
- `org.springframework.boot:spring-boot-starter-data-couchbase-test`
- `org.springframework.boot:spring-boot-starter-data-couchbase-reactive-test`
- `org.springframework.boot:spring-boot-starter-data-elasticsearch-test`
- `org.springframework.boot:spring-boot-starter-data-jdbc-test`
- `org.springframework.boot:spring-boot-starter-data-jpa-test`
- `org.springframework.boot:spring-boot-starter-data-ldap-test`
- `org.springframework.boot:spring-boot-starter-data-mongodb-test`
- `org.springframework.boot:spring-boot-starter-data-mongodb-reactive-test`
- `org.springframework.boot:spring-boot-starter-data-neo4j-test`
- `org.springframework.boot:spring-boot-starter-data-r2dbc-test`
- `org.springframework.boot:spring-boot-starter-data-redis-test`
- `org.springframework.boot:spring-boot-starter-data-redis-reactive-test`
- `org.springframework.boot:spring-boot-starter-data-rest-test`
- `org.springframework.boot:spring-boot-starter-elasticsearch-test`
- `org.springframework.boot:spring-boot-starter-flyway-test`
- `org.springframework.boot:spring-boot-starter-freemarker-test`
- `org.springframework.boot:spring-boot-starter-graphql-test`
- `org.springframework.boot:spring-boot-starter-groovy-templates-test`
- `org.springframework.boot:spring-boot-starter-gson-test`
- `org.springframework.boot:spring-boot-starter-hateoas-test`
- `org.springframework.boot:spring-boot-starter-hazelcast-test`
- `org.springframework.boot:spring-boot-starter-integration-test`
- `org.springframework.boot:spring-boot-starter-jackson-test`
- `org.springframework.boot:spring-boot-starter-jdbc-test`
- `org.springframework.boot:spring-boot-starter-jersey-test`
- `org.springframework.boot:spring-boot-starter-jms-test`
- `org.springframework.boot:spring-boot-starter-jooq-test`
- `org.springframework.boot:spring-boot-starter-jsonb-test`
- `org.springframework.boot:spring-boot-starter-kafka-test`
- `org.springframework.boot:spring-boot-starter-kotlinx-serialization-json-test`
- `org.springframework.boot:spring-boot-starter-ldap-test`
- `org.springframework.boot:spring-boot-starter-liquibase-test`
- `org.springframework.boot:spring-boot-starter-mail-test`
- `org.springframework.boot:spring-boot-starter-micrometer-metrics-test`
- `org.springframework.boot:spring-boot-starter-mongodb-test`
- `org.springframework.boot:spring-boot-starter-mustache-test`
- `org.springframework.boot:spring-boot-starter-neo4j-test`
- `org.springframework.boot:spring-boot-starter-opentelemetry-test`
- `org.springframework.boot:spring-boot-starter-pulsar-test`
- `org.springframework.boot:spring-boot-starter-quartz-test`
- `org.springframework.boot:spring-boot-starter-r2dbc-test`
- `org.springframework.boot:spring-boot-starter-restclient-test`
- `org.springframework.boot:spring-boot-starter-rsocket-test`
- `org.springframework.boot:spring-boot-starter-security-oauth2-authorization-server-test`
- `org.springframework.boot:spring-boot-starter-security-oauth2-client-test`
- `org.springframework.boot:spring-boot-starter-security-oauth2-resource-server-test`
- `org.springframework.boot:spring-boot-starter-security-saml2-test`
- `org.springframework.boot:spring-boot-starter-sendgrid-test`
- `org.springframework.boot:spring-boot-starter-session-data-redis-test`
- `org.springframework.boot:spring-boot-starter-session-jdbc-test`
- `org.springframework.boot:spring-boot-starter-thymeleaf-test`
- `org.springframework.boot:spring-boot-starter-validation-test`
- `org.springframework.boot:spring-boot-starter-webclient-test`
- `org.springframework.boot:spring-boot-starter-webflux-test`
- `org.springframework.boot:spring-boot-starter-webmvc-test`
- `org.springframework.boot:spring-boot-starter-webservices-test`
- `org.springframework.boot:spring-boot-starter-websocket-test`
- `org.springframework.boot:spring-boot-starter-zipkin-test`

---

## 5) Drivers JDBC comunes

> Estos sí suelen llevar versión explícita si no están cubiertos por tu gestión de dependencias.

### PostgreSQL

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>${postgresql.version}</version>
</dependency>
```

### MySQL

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>${mysql.version}</version>
</dependency>
```

### MariaDB

```xml
<dependency>
    <groupId>org.mariadb.jdbc</groupId>
    <artifactId>mariadb-java-client</artifactId>
    <version>${mariadb.version}</version>
</dependency>
```

### SQL Server

```xml
<dependency>
    <groupId>com.microsoft.sqlserver</groupId>
    <artifactId>mssql-jdbc</artifactId>
    <version>${mssql.version}</version>
</dependency>
```

---

## 6) Dependencias muy usadas junto con Spring Boot

### Lombok

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.44</version>
    <scope>provided</scope>
</dependency>
```

#### Lombok como annotation processor

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>1.18.44</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

### MapStruct

```xml
<properties>
    <org.mapstruct.version>1.6.3</org.mapstruct.version>
</properties>

<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>${org.mapstruct.version}</version>
</dependency>
```

#### MapStruct processor

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.8.1</version>
    <configuration>
        <annotationProcessorPaths>
            <path>
                <groupId>org.mapstruct</groupId>
                <artifactId>mapstruct-processor</artifactId>
                <version>${org.mapstruct.version}</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

### OpenAPI / Swagger UI con springdoc

#### Spring MVC + Swagger UI

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.16</version>
</dependency>
```

#### Spring MVC solo endpoints OpenAPI

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-api</artifactId>
    <version>2.8.16</version>
</dependency>
```

#### WebFlux + Swagger UI

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webflux-ui</artifactId>
    <version>2.8.16</version>
</dependency>
```

### Testcontainers

#### Core

```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers</artifactId>
    <version>2.0.4</version>
    <scope>test</scope>
</dependency>
```

#### JUnit Jupiter

```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers-junit-jupiter</artifactId>
    <version>2.0.4</version>
    <scope>test</scope>
</dependency>
```

#### PostgreSQL module

```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers-postgresql</artifactId>
    <version>2.0.4</version>
    <scope>test</scope>
</dependency>
```

### Resilience4j para Spring Boot 3+

```xml
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot3</artifactId>
    <version>${resilience4j.version}</version>
</dependency>
```

#### Extras frecuentes con Resilience4j

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

#### Si usás WebFlux

```xml
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-reactor</artifactId>
    <version>${resilience4j.version}</version>
</dependency>
```

---

## 7) Combos típicos listos para copiar

### API REST clásica con PostgreSQL

```xml
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
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <version>${postgresql.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-flyway</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### API con JWT bearer token

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security-oauth2-resource-server</artifactId>
</dependency>
```

### Documentación Swagger / OpenAPI sobre MVC

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.16</version>
</dependency>
```

### Testing de integración con Testcontainers + PostgreSQL

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers</artifactId>
    <version>2.0.4</version>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers-junit-jupiter</artifactId>
    <version>2.0.4</version>
    <scope>test</scope>
</dependency>

<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers-postgresql</artifactId>
    <version>2.0.4</version>
    <scope>test</scope>
</dependency>
```

---

## 8) Observaciones útiles

- En proyectos nuevos, preferí `spring-boot-starter-webmvc` antes que `spring-boot-starter-web`, porque la documentación actual marca `web` como deprecado en favor de `webmvc`.
- Para OAuth2, preferí los nuevos starters `spring-boot-starter-security-oauth2-*`.
- Si usás Spring Boot con Maven, la forma más cómoda sigue siendo `spring-boot-starter-parent`.
- En librerías externas como Lombok, MapStruct, springdoc o Testcontainers sí suele ser normal declarar versión explícita.

---

## 9) Mini índice mental

- **REST clásico** → `webmvc`
- **Reactivo** → `webflux`
- **JPA / Hibernate** → `data-jpa`
- **JDBC directo** → `jdbc`
- **SQL tipado** → `jooq`
- **Migraciones** → `flyway` o `liquibase`
- **Seguridad** → `security`
- **JWT** → `security-oauth2-resource-server`
- **OAuth2 login** → `security-oauth2-client`
- **Docs OpenAPI** → `springdoc-openapi-starter-webmvc-ui`
- **Batch** → `batch`
- **Kafka** → `kafka`
- **RabbitMQ** → `amqp`
- **Redis** → `data-redis`
- **MongoDB** → `data-mongodb`
- **Tests generales** → `starter-test`
- **Integración real con contenedores** → `testcontainers`

