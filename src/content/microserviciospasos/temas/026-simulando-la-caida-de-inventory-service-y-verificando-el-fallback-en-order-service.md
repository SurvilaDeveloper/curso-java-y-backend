---
title: "Simulando la caída de inventory-service y verificando el fallback en order-service"
description: "Detener inventory-service, probar la consulta resiliente desde order-service y verificar que el fallback evita que el flujo explote con error técnico."
order: 26
module: "Módulo 6 · Resiliencia"
level: "base"
draft: false
---

# Objetivo operativo

Simular la caída de `inventory-service` y comprobar que `order-service` responde usando el fallback del `circuit breaker`.

---

## Acciones

### 1. Verificar el estado normal antes de la prueba

Abrir:

```txt
http://localhost:8083/api/orders/check-stock?productSlug=mouse-inalambrico&quantity=2
```

Debe responder:

```txt
true
```

---

### 2. Detener `inventory-service`

Detener la aplicación `InventoryServiceApplication` en el IDE.

---

### 3. Verificar que `inventory-service` ya no responde

Abrir:

```txt
http://localhost:8082/api/inventory/ping
```

Debe fallar.

---

### 4. Consultar el endpoint resiliente directo en `order-service`

Abrir:

```txt
http://localhost:8083/api/orders/check-stock?productSlug=mouse-inalambrico&quantity=2
```

Ahora debe responder:

```txt
false
```

No debe caerse `order-service`.

---

### 5. Repetir la llamada varias veces

Volver a abrir varias veces:

```txt
http://localhost:8083/api/orders/check-stock?productSlug=mouse-inalambrico&quantity=2
```

Hacer la prueba por lo menos 3 veces.

---

### 6. Verificar que `order-service` sigue vivo

Abrir:

```txt
http://localhost:8083/actuator/health
```

Debe responder correctamente.

---

### 7. Probar creación de orden mientras `inventory-service` está caído

Hacer un `POST` a:

```txt
http://localhost:8083/api/orders
```

Con este JSON:

```json
{
  "productSlug": "mouse-inalambrico",
  "quantity": 1
}
```

Debe fallar porque el fallback devuelve `false` y el servicio no guarda la orden.

---

### 8. Verificar en la base que no se insertó una orden nueva por esta prueba

Ejecutar:

```sql
SELECT id, product_slug, quantity, status, created_at
FROM customer_order
ORDER BY id DESC;
```

Comprobar que no apareció una nueva orden generada por la prueba con `inventory-service` caído.

---

### 9. Volver a levantar `inventory-service`

Ejecutar nuevamente `InventoryServiceApplication`.

---

### 10. Esperar unos segundos

Esperar al menos:

```txt
10 segundos
```

Esto deja pasar la ventana configurada de `waitDurationInOpenState`.

---

### 11. Probar de nuevo el endpoint resiliente

Abrir:

```txt
http://localhost:8083/api/orders/check-stock?productSlug=mouse-inalambrico&quantity=2
```

Debe volver a responder:

```txt
true
```

---

## Verificación rápida

Comprobar que:

- con `inventory-service` caído, `order-service` no se cae
- el endpoint resiliente devuelve `false`
- la orden no se guarda si no hay disponibilidad
- al volver `inventory-service`, la consulta vuelve a responder `true`

---

## Resultado esperado

Tener una prueba real de fallback y resiliencia con `inventory-service` caído.

---

## Siguiente archivo

Seguir con:

```txt
027-probando-el-flujo-resiliente-a-traves-de-api-gateway-con-token.md
```
