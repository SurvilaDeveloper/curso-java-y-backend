---
title: "Probando el primer flujo protegido con token a través de api-gateway"
description: "Obtener un token desde Keycloak y usarlo para consultar y crear órdenes a través de api-gateway mientras el catálogo sigue público."
order: 24
module: "Módulo 5 · Seguridad"
level: "base"
draft: false
---

# Objetivo operativo

Probar el primer flujo protegido con token a través de `api-gateway`, dejando:

- catálogo público
- órdenes protegidas con JWT

---

## Acciones

### 1. Obtener un token desde Keycloak

Ejecutar este `curl`:

```bash
curl -X POST "http://localhost:9090/realms/novamarket/protocol/openid-connect/token" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "client_id=api-gateway" ^
  -d "username=gabriel" ^
  -d "password=gabriel123" ^
  -d "grant_type=password"
```

Si estás en Git Bash o Linux/macOS, usar:

```bash
curl -X POST "http://localhost:9090/realms/novamarket/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=api-gateway" \
  -d "username=gabriel" \
  -d "password=gabriel123" \
  -d "grant_type=password"
```

---

### 2. Copiar el valor de `access_token`

Guardar el token completo en una variable o copiarlo manualmente.

Si querés usar variable en terminal:

#### Git Bash / Linux / macOS

```bash
TOKEN="PEGAR_AQUI_EL_ACCESS_TOKEN"
```

#### PowerShell

```powershell
$TOKEN="PEGAR_AQUI_EL_ACCESS_TOKEN"
```

---

### 3. Verificar que catálogo sigue siendo público

Abrir:

```txt
http://localhost:8080/api/catalog/products
```

Debe seguir respondiendo sin token.

---

### 4. Verificar que órdenes siguen protegidas sin token

Abrir:

```txt
http://localhost:8080/api/orders
```

Debe responder `401 Unauthorized` o equivalente.

---

### 5. Consultar órdenes con token

#### Git Bash / Linux / macOS

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/orders
```

#### PowerShell

```powershell
curl -Headers @{Authorization="Bearer $TOKEN"} http://localhost:8080/api/orders
```

Debe devolver la lista JSON de órdenes.

---

### 6. Crear una orden con token a través del gateway

#### Git Bash / Linux / macOS

```bash
curl -X POST "http://localhost:8080/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productSlug":"mouse-inalambrico","quantity":1}'
```

#### PowerShell

```powershell
curl -Method POST "http://localhost:8080/api/orders" `
  -Headers @{Authorization="Bearer $TOKEN"; "Content-Type"="application/json"} `
  -Body '{"productSlug":"mouse-inalambrico","quantity":1}'
```

Debe devolver una orden guardada.

---

### 7. Probar creación de orden sin token

Hacer el mismo `POST` anterior pero sin el header `Authorization`.

Debe fallar con `401 Unauthorized`.

---

### 8. Verificar que la orden quedó guardada

Volver a consultar con token:

#### Git Bash / Linux / macOS

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/orders
```

#### PowerShell

```powershell
curl -Headers @{Authorization="Bearer $TOKEN"} http://localhost:8080/api/orders
```

Comprobar que la nueva orden aparece en la lista.

---

### 9. Verificar la base de datos

Ejecutar en PostgreSQL:

```sql
SELECT id, product_slug, quantity, status, created_at
FROM customer_order
ORDER BY id;
```

Comprobar que la nueva orden protegida quedó insertada.

---

### 10. Dejar corriendo estos servicios

Dejar ejecutándose:

1. `config-server`
2. `discovery-server`
3. `api-gateway`
4. `catalog-service`
5. `inventory-service`
6. `order-service`
7. `keycloak`

---

## Verificación rápida

Comprobar que:

- catálogo sigue siendo público
- órdenes requieren token
- con token se puede consultar órdenes
- con token se puede crear una orden
- sin token no se puede crear una orden

---

## Resultado esperado

Tener el primer flujo real protegido con JWT a través de `api-gateway`, usando Keycloak como emisor del token.

---

## Siguiente archivo

El siguiente tramo práctico debería cubrir:

- endurecer más la seguridad
- o empezar el bloque de resiliencia sobre el flujo real ya protegido
