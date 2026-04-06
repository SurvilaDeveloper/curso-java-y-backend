---
title: "Spring Boot · `application.properties` y `application.yml` base por stack"
description: "Este artículo complementa el de `pom.xml` base por stack. La idea es que puedas copiar una base realista para empezar y después ajustar nombres, puertos, credenciales y URLs."
order: 4
module: "Spring Boot"
level: "intro"
draft: false
---
# Spring Boot · `application.properties` y `application.yml` base por stack

Este artículo complementa el de `pom.xml` base por stack. La idea es que puedas copiar una base realista para empezar y después ajustar nombres, puertos, credenciales y URLs.

## Cómo usar estos ejemplos

- Elegí **una sola variante** por proyecto: `application.properties` **o** `application.yml`.
- Reemplazá los valores de ejemplo (`appdb`, `usuario`, `password`, dominios, puertos, etc.).
- Si usás varios entornos, mové lo sensible a variables de entorno o archivos por perfil (`application-dev.yml`, `application-prod.yml`).
- Cuando uses **Flyway** o **Liquibase**, evitá `ddl-auto=create` o `update` en producción.
- En general, para proyectos serios conviene usar `ddl-auto=validate` o directamente no setearlo si ya controlás el esquema por migraciones.

---

## 1) API REST clásica · Spring MVC + PostgreSQL + JPA + Flyway + Security JWT + Actuator

### application.properties

```properties
spring.application.name=api-rest-postgres-jpa
server.port=8080

# Datasource
spring.datasource.url=jdbc:postgresql://localhost:5432/appdb
spring.datasource.username=usuario
spring.datasource.password=password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.time_zone=UTC

# Flyway
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true

# Security JWT Resource Server
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:9000/realms/demo

# Actuator
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=when_authorized
management.info.env.enabled=true

# Info
info.app.name=API REST PostgreSQL JPA
info.app.description=Base Spring MVC + JPA + Flyway + JWT
info.app.version=1.0.0

# Logging
logging.level.org.springframework.security=INFO
logging.level.org.hibernate.SQL=INFO
```

### application.yml

```yml
spring:
  application:
    name: api-rest-postgres-jpa
  datasource:
    url: jdbc:postgresql://localhost:5432/appdb
    username: usuario
    password: password
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        jdbc:
          time_zone: UTC
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:9000/realms/demo

server:
  port: 8080

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when_authorized
  info:
    env:
      enabled: true

info:
  app:
    name: API REST PostgreSQL JPA
    description: Base Spring MVC + JPA + Flyway + JWT
    version: 1.0.0

logging:
  level:
    org.springframework.security: INFO
    org.hibernate.SQL: INFO
```

### Cuándo partir de esta base

- CRUD clásico con controllers REST.
- Backend con relaciones JPA/Hibernate.
- APIs protegidas con JWT.
- Proyectos donde querés migraciones SQL controladas con Flyway.

---

## 2) API reactiva · WebFlux + PostgreSQL R2DBC + JWT + Actuator

### application.properties

```properties
spring.application.name=api-reactiva-r2dbc
server.port=8080

# R2DBC
spring.r2dbc.url=r2dbc:postgresql://localhost:5432/appdb
spring.r2dbc.username=usuario
spring.r2dbc.password=password

# SQL init (opcional para scripts schema.sql / data.sql)
spring.sql.init.mode=never

# Security JWT Resource Server
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:9000/realms/demo

# Actuator
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=when_authorized

# Logging
logging.level.org.springframework.r2dbc=INFO
logging.level.org.springframework.security=INFO
```

### application.yml

```yml
spring:
  application:
    name: api-reactiva-r2dbc
  r2dbc:
    url: r2dbc:postgresql://localhost:5432/appdb
    username: usuario
    password: password
  sql:
    init:
      mode: never
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:9000/realms/demo

server:
  port: 8080

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when_authorized

logging:
  level:
    org.springframework.r2dbc: INFO
    org.springframework.security: INFO
```

### Cuándo partir de esta base

- APIs reactivas con `Mono` y `Flux`.
- Integración reactiva de punta a punta.
- Proyectos donde no querés JPA/Hibernate.

---

## 3) API reactiva · WebFlux + MongoDB reactivo + JWT + Actuator

### application.properties

```properties
spring.application.name=api-reactiva-mongo
server.port=8080

# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/appdb
spring.data.mongodb.auto-index-creation=true

# Security JWT Resource Server
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:9000/realms/demo

# Actuator
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=when_authorized

# Logging
logging.level.org.springframework.data.mongodb.core.ReactiveMongoTemplate=INFO
logging.level.org.springframework.security=INFO
```

### application.yml

```yml
spring:
  application:
    name: api-reactiva-mongo
  data:
    mongodb:
      uri: mongodb://localhost:27017/appdb
      auto-index-creation: true
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:9000/realms/demo

server:
  port: 8080

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when_authorized

logging:
  level:
    org.springframework.data.mongodb.core.ReactiveMongoTemplate: INFO
    org.springframework.security: INFO
```

### Cuándo partir de esta base

- APIs reactivas con documentos.
- Casos donde MongoDB encaja mejor que SQL.
- Proyectos con lectura/escritura flexible y modelos no tan relacionales.

---

## 4) Microservicio con eventos · Spring MVC/WebFlux + Kafka + PostgreSQL + Actuator

> Podés usar esta configuración tanto con `spring-boot-starter-webmvc` como con `spring-boot-starter-webflux`.

### application.properties

```properties
spring.application.name=orders-service
server.port=8081

# Datasource
spring.datasource.url=jdbc:postgresql://localhost:5432/ordersdb
spring.datasource.username=usuario
spring.datasource.password=password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false
spring.jpa.show-sql=false

# Flyway
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration

# Kafka
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=orders-service-group
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer
spring.kafka.consumer.properties.spring.json.trusted.packages=*

spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer

# Actuator
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=always

# Logging
logging.level.org.springframework.kafka=INFO
```

### application.yml

```yml
spring:
  application:
    name: orders-service
  datasource:
    url: jdbc:postgresql://localhost:5432/ordersdb
    username: usuario
    password: password
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
    show-sql: false
  flyway:
    enabled: true
    locations: classpath:db/migration
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: orders-service-group
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring:
          json:
            trusted:
              packages: "*"
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

server:
  port: 8081

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always

logging:
  level:
    org.springframework.kafka: INFO
```

### Cuándo partir de esta base

- Microservicios que publican y consumen eventos.
- Sistemas con integración asíncrona.
- Casos donde querés desacoplar servicios por mensajería.

---

## 5) API con Redis para cache y sesión

### application.properties

```properties
spring.application.name=api-cache-redis
server.port=8080

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.timeout=5s

# Cache
spring.cache.type=redis

# Session (si usás spring-session-data-redis)
spring.session.store-type=redis
spring.session.timeout=30m

# Actuator
management.endpoints.web.exposure.include=health,info,metrics,prometheus
```

### application.yml

```yml
spring:
  application:
    name: api-cache-redis
  data:
    redis:
      host: localhost
      port: 6379
      timeout: 5s
  cache:
    type: redis
  session:
    store-type: redis
    timeout: 30m

server:
  port: 8080

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
```

### Cuándo partir de esta base

- Backends que necesitan cachear resultados.
- Apps con sesiones compartidas entre instancias.
- Casos donde querés bajar latencia en lecturas frecuentes.

---

## 6) API con correo saliente

### application.properties

```properties
spring.application.name=api-mail
server.port=8080

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=tu-correo@gmail.com
spring.mail.password=tu-password-o-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=3000
spring.mail.properties.mail.smtp.writetimeout=5000
```

### application.yml

```yml
spring:
  application:
    name: api-mail
  mail:
    host: smtp.gmail.com
    port: 587
    username: tu-correo@gmail.com
    password: tu-password-o-app-password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
          connectiontimeout: 5000
          timeout: 3000
          writetimeout: 5000

server:
  port: 8080
```

### Cuándo partir de esta base

- Notificaciones por correo.
- Recuperación de contraseña.
- Confirmaciones de registro o eventos del sistema.

---

## 7) API con archivos por perfil

### application.yml

```yml
spring:
  application:
    name: app-con-perfiles
  profiles:
    active: dev
```

### application-dev.yml

```yml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/appdb_dev
    username: devuser
    password: devpass
  jpa:
    hibernate:
      ddl-auto: validate

logging:
  level:
    root: INFO
```

### application-prod.yml

```yml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate

management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
  endpoint:
    health:
      show-details: never

logging:
  level:
    root: WARN
```

### Cuándo partir de esta base

- Cuando querés separar desarrollo, test y producción.
- Cuando necesitás dejar credenciales fuera del repo.
- Cuando querés cambiar logging y observabilidad según entorno.

---

## Recomendaciones rápidas

### Para desarrollo

```properties
spring.devtools.restart.enabled=true
spring.devtools.livereload.enabled=true
```

> Esto solo tiene sentido si agregaste `spring-boot-devtools`.

### Para producción

- No hardcodees credenciales en `application.yml`.
- Exponé solo los endpoints de actuator que realmente necesitás.
- Usá `issuer-uri` o `jwk-set-uri` reales para JWT.
- Preferí variables de entorno para secretos.
- Si usás Flyway o Liquibase, dejá el esquema bajo migración, no bajo generación automática.

## Qué stack elegir rápido

- **CRUD clásico empresarial**: MVC + PostgreSQL + JPA + Flyway.
- **API reactiva**: WebFlux + R2DBC o Mongo reactivo.
- **Microservicio orientado a eventos**: Kafka + Actuator + DB propia.
- **App con login distribuido o cache fuerte**: Redis.
- **App con notificaciones**: Mail.

## Nota final

Estas bases están pensadas para arrancar bien, no para cubrir todos los flags posibles. Spring Boot tiene muchísimas propiedades más; la referencia oficial documenta que la configuración puede venir de archivos `.properties`, `.yml`, variables de entorno y argumentos de línea de comandos, y además mantiene un apéndice con propiedades comunes y módulos auto-configurados. Si un stack tuyo combina varias piezas, normalmente vas a mezclar bloques de este archivo.
