---
title: "Preparando PostgreSQL y conectando catalog-service a la base commerce_lab"
description: "Agregar PostgreSQL, Spring Data JPA y Flyway a catalog-service, crear la base commerce_lab y dejar el servicio conectado a la base."
order: 11
module: "Módulo 4 · Primer dominio real"
level: "base"
draft: false
---

# Objetivo operativo

Conectar `catalog-service` a PostgreSQL usando JPA y Flyway, y dejar la base `commerce_lab` lista para empezar a guardar productos reales.

---

## Acciones

### 1. Crear la base de datos

Crear una base de datos llamada:

```txt
commerce_lab
```

Si usás `psql`, ejecutar:

```sql
CREATE DATABASE commerce_lab;
```

---

### 2. Agregar dependencias al `pom.xml` de `catalog-service`

Abrir:

```txt
services/catalog-service/pom.xml
```

Agregar estas dependencias dentro de `<dependencies>`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

---

### 3. Abrir la configuración remota de `catalog-service`

Abrir:

```txt
config-repo/catalog-service.yml
```

---

### 4. Reemplazar el contenido por esta versión

Pegar esto:

```yaml
server:
  port: 8081

spring:
  application:
    name: catalog-service
  datasource:
    url: jdbc:postgresql://localhost:5432/commerce_lab
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        format_sql: true
    open-in-view: false
  flyway:
    enabled: true

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka

management:
  endpoints:
    web:
      exposure:
        include: health,info
```

---

### 5. Ajustar usuario y contraseña si hace falta

Si tu usuario o contraseña de PostgreSQL no son `postgres`, cambiar estas dos líneas:

```yaml
username: postgres
password: postgres
```

---

### 6. Crear la carpeta de migraciones

Crear esta carpeta si no existe:

```txt
services/catalog-service/src/main/resources/db/migration/
```

---

### 7. Crear la primera migración

Crear el archivo:

```txt
services/catalog-service/src/main/resources/db/migration/V1__create_product_table.sql
```

Pegar esto:

```sql
CREATE TABLE product (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    stock INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

### 8. Reiniciar `catalog-service`

Detener `catalog-service` si está corriendo.

Volver a ejecutarlo.

---

### 9. Verificar que el servicio arranca con la base conectada

Abrir:

```txt
http://localhost:8081/actuator/health
```

---

### 10. Verificar que la tabla fue creada

Abrir tu cliente SQL y ejecutar:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'product';
```

Debe aparecer la tabla:

```txt
product
```

---

## Verificación rápida

Comprobar que:

- `catalog-service` arranca sin errores
- Flyway corre al iniciar
- existe la base `commerce_lab`
- existe la tabla `product`

---

## Resultado esperado

Tener `catalog-service` conectado a PostgreSQL y con la tabla `product` creada por Flyway.

---

## Siguiente archivo

Seguir con:

```txt
012-creando-la-entidad-product-repository-y-el-primer-endpoint-real-de-catalog-service.md
```
