---
title: "Probando el flujo resiliente a través de api-gateway con token"
description: "Probar el flujo resiliente de order-service a través de api-gateway usando JWT, tanto con inventory-service disponible como con inventory-service caído."
order: 27
module: "Módulo 6 · Resiliencia"
level: "base"
draft: false
---

# Objetivo operativo

Probar el flujo resiliente de `order-service` a través de `api-gateway` usando JWT:

- con `inventory-service` disponible
- y con `inventory-service` caído

---

## Acciones

### 1. Obtener un token válido desde Keycloak

Ejecutar:

#### Git Bash / Linux / macOS

```bash
curl -X POST "http://localhost:9090/realms/novamarket/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=api-gateway" \
  -d "username=gabriel" \
  -d "password=gabriel123" \
  -d "grant_type=password"
```

#### PowerShell

```powershell
curl -X POST "http://localhost:9090/realms/novamarket/protocol/openid-connect/token" ^
  -H "Content-Type: application/x-www-form-urlencoded" ^
  -d "client_id=api-gateway" ^
  -d "username=gabriel" ^
  -d "password=gabriel123" ^
  -d "grant_type=password"
```

Guardar el `access_token`.

---

### 2. Probar el endpoint resiliente con `inventory-service` activo

#### Git Bash / Linux / macOS

```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/api/orders/check-stock?productSlug=mouse-inalambrico&quantity=2"
```

#### PowerShell

```powershell
curl -Headers @{Authorization="Bearer $TOKEN"} "http://localhost:8080/api/orders/check-stock?productSlug=mouse-inalambrico&quantity=2"
```

Debe responder:

```txt
true
```

---

### 3. Probar creación de orden con token y stock disponible

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

### 4. Detener `inventory-service`

Detener `InventoryServiceApplication` en el IDE.

---

### 5. Probar el endpoint resiliente a través del gateway con token

#### Git Bash / Linux / macOS

```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/api/orders/check-stock?productSlug=mouse-inalambrico&quantity=2"
```

#### PowerShell

```powershell
curl -Headers @{Authorization="Bearer $TOKEN"} "http://localhost:8080/api/orders/check-stock?productSlug=mouse-inalambrico&quantity=2"
```

Debe responder:

```txt
false
```

---

### 6. Probar creación de orden con token mientras inventory está caído

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

Debe fallar y no guardar una orden nueva.

---

### 7. Verificar que el gateway sigue sano

Abrir:

```txt
http://localhost:8080/actuator/health
```

Debe responder correctamente.

---

### 8. Volver a levantar `inventory-service`

Ejecutar nuevamente `InventoryServiceApplication`.

---

### 9. Esperar unos segundos

Esperar al menos:

```txt
10 segundos
```

---

### 10. Probar otra vez el endpoint resiliente por gateway

#### Git Bash / Linux / macOS

```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8080/api/orders/check-stock?productSlug=mouse-inalambrico&quantity=2"
```

#### PowerShell

```powershell
curl -Headers @{Authorization="Bearer $TOKEN"} "http://localhost:8080/api/orders/check-stock?productSlug=mouse-inalambrico&quantity=2"
```

Debe volver a responder:

```txt
true
```

---

### 11. Verificar las órdenes guardadas

Consultar con token:

#### Git Bash / Linux / macOS

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/orders
```

#### PowerShell

```powershell
curl -Headers @{Authorization="Bearer $TOKEN"} http://localhost:8080/api/orders
```

Comprobar que la orden fallida con `inventory-service` caído no fue guardada.

---

## Verificación rápida

Comprobar que:

- con token, el flujo funciona a través del gateway cuando `inventory-service` está activo
- con `inventory-service` caído, el endpoint resiliente devuelve `false`
- el gateway no se cae
- la orden fallida no se guarda
- al volver `inventory-service`, el flujo se recupera

---

## Resultado esperado

Tener probado el flujo resiliente completo pasando por `api-gateway` y protegido con JWT.

---

## Siguiente archivo

El siguiente tramo práctico debería cubrir:

- observabilidad
- correlation id
- y trazas distribuidas
