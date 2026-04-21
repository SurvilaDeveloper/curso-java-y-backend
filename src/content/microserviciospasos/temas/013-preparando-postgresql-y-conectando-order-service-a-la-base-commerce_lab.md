---
title: "Preparando PostgreSQL y conectando order-service a la base commerce_lab"
description: "Agregar PostgreSQL, Spring Data JPA y Flyway a order-service, y dejar el servicio conectado a la base commerce_lab."
order: 13
module: "Módulo 4 · Primer dominio real"
level: "base"
draft: false
---

# Objetivo operativo

Conectar `order-service` a PostgreSQL usando JPA y Flyway, y dejar la base `commerce_lab` lista para empezar a guardar órdenes reales.

---

## Acciones

### 1. Verificar que la base `commerce_lab` existe

Si todavía no existe, crearla:

```sql
CREATE DATABASE commerce_lab;
```

Si ya existe porque se usó con `catalog-service`, no crearla otra vez.

---

### 2. Agregar dependencias al `pom.xml` de `order-service`

Abrir:

```txt
services/order-service/pom.xml
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

### 3. Abrir la configuración remota de `order-service`

Abrir:

```txt
config-repo/order-service.yml
```

---

### 4. Reemplazar el contenido por esta versión

Pegar esto:

```yaml
server:
  port: 8083

spring:
  application:
    name: order-service
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
services/order-service/src/main/resources/db/migration/
```

---

### 7. Crear la primera migración de `order-service`

Crear el archivo:

```txt
services/order-service/src/main/resources/db/migration/V1__create_customer_order_table.sql
```

Pegar esto:

```sql
CREATE TABLE customer_order (
    id BIGSERIAL PRIMARY KEY,
    product_slug VARCHAR(160) NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP NOT NULL
);
```

---

### 8. Reiniciar `order-service`

Detener `order-service` si está corriendo.

Volver a ejecutarlo.

---

### 9. Verificar que el servicio arranca con la base conectada

Abrir:

```txt
http://localhost:8083/actuator/health
```

---

### 10. Verificar que la tabla fue creada

Abrir tu cliente SQL y ejecutar:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'customer_order';
```

Debe aparecer la tabla:

```txt
customer_order
```

---

## Verificación rápida

Comprobar que:

- `order-service` arranca sin errores
- Flyway corre al iniciar
- existe la tabla `customer_order`

---

## Resultado esperado

Tener `order-service` conectado a PostgreSQL y con la tabla `customer_order` creada por Flyway.

---

## Siguiente archivo

Seguir con:

```txt
014-creando-la-entidad-customerorder-repository-y-los-endpoints-base-de-order-service.md
```
