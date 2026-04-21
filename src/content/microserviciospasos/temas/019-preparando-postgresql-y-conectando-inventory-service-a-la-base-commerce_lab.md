---
title: "Preparando PostgreSQL y conectando inventory-service a la base commerce_lab"
description: "Agregar PostgreSQL, Spring Data JPA y Flyway a inventory-service, y dejar el servicio conectado a la base commerce_lab."
order: 19
module: "Módulo 4 · Primer dominio real"
level: "base"
draft: false
---

# Objetivo operativo

Conectar `inventory-service` a PostgreSQL usando JPA y Flyway, y dejar la base `commerce_lab` lista para empezar a guardar stock real por producto.

---

## Acciones

### 1. Verificar que la base `commerce_lab` existe

Si todavía no existe, crearla:

```sql
CREATE DATABASE commerce_lab;
```

Si ya existe porque se usó con `catalog-service` y `order-service`, no crearla otra vez.

---

### 2. Agregar dependencias al `pom.xml` de `inventory-service`

Abrir:

```txt
services/inventory-service/pom.xml
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

### 3. Abrir la configuración remota de `inventory-service`

Abrir:

```txt
config-repo/inventory-service.yml
```

---

### 4. Reemplazar el contenido por esta versión

Pegar esto:

```yaml
server:
  port: 8082

spring:
  application:
    name: inventory-service
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
services/inventory-service/src/main/resources/db/migration/
```

---

### 7. Crear la primera migración de `inventory-service`

Crear el archivo:

```txt
services/inventory-service/src/main/resources/db/migration/V1__create_stock_item_table.sql
```

Pegar esto:

```sql
CREATE TABLE stock_item (
    id BIGSERIAL PRIMARY KEY,
    product_slug VARCHAR(160) NOT NULL UNIQUE,
    available_quantity INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

### 8. Reiniciar `inventory-service`

Detener `inventory-service` si está corriendo.

Volver a ejecutarlo.

---

### 9. Verificar que el servicio arranca con la base conectada

Abrir:

```txt
http://localhost:8082/actuator/health
```

---

### 10. Verificar que la tabla fue creada

Abrir tu cliente SQL y ejecutar:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'stock_item';
```

Debe aparecer la tabla:

```txt
stock_item
```

---

## Verificación rápida

Comprobar que:

- `inventory-service` arranca sin errores
- Flyway corre al iniciar
- existe la tabla `stock_item`

---

## Resultado esperado

Tener `inventory-service` conectado a PostgreSQL y con la tabla `stock_item` creada por Flyway.

---

## Siguiente archivo

Seguir con:

```txt
020-creando-la-entidad-stockitem-repository-y-los-endpoints-reales-de-inventory-service.md
```
