---
title: "Qué debe proteger realmente el backend y qué no puede delegar al frontend"
description: "Cómo distinguir qué controles deben vivir obligatoriamente en el backend de una app Java Spring. Qué cosas puede ayudar a ordenar el frontend y qué decisiones nunca deberían depender del cliente."
order: 4
module: "Fundamentos"
level: "intro"
draft: false
---

# Qué debe proteger realmente el backend y qué no puede delegar al frontend

## Objetivo del tema

Entender con claridad qué decisiones de seguridad tienen que vivir **sí o sí en el backend** de una app hecha con Java + Spring, y por qué confiar en el frontend como barrera de seguridad termina produciendo sistemas fáciles de abusar.

Este tema es central porque una enorme cantidad de fallos backend no aparecen por una vulnerabilidad sofisticada, sino por una idea equivocada muy común:

> “Como en la interfaz no se puede hacer eso, entonces ya está protegido.”

No.  
Si el backend no lo controla, **no está protegido**.

---

## Idea clave

El frontend puede ayudar a:

- ordenar la experiencia
- guiar al usuario
- ocultar complejidad
- reducir errores accidentales
- hacer validaciones rápidas de UX

Pero el frontend **no define la verdad del sistema**.

La verdad la define el backend.

En resumen:

> El backend debe decidir quién puede hacer qué, sobre qué recurso, en qué momento, bajo qué condiciones y con qué límites.

---

## Regla práctica

Todo lo que tenga impacto real sobre:

- permisos
- identidad
- ownership
- datos
- estados
- montos
- transiciones
- operaciones sensibles
- integraciones
- auditoría

debe ser validado y decidido en el backend.

Aunque el frontend también lo valide.  
Aunque el botón esté oculto.  
Aunque el flujo “normal” no permita llegar ahí.

---

## Qué sí puede hacer el frontend

El frontend puede ser útil para:

- mostrar u ocultar botones
- validar formato de email
- validar longitud mínima de un texto
- prevenir submits accidentales
- pedir confirmación visual
- mejorar mensajes de error
- guiar al usuario por un flujo correcto
- evitar requests innecesarias
- limitar interacciones por UX

Todo eso está bien.

Pero eso no reemplaza al backend.

### Ejemplo

El frontend puede ocultar el botón “Eliminar usuario”.

Eso mejora la interfaz.

Pero si el endpoint existe así:

```java
@DeleteMapping("/admin/users/{id}")
public void deleteUser(@PathVariable Long id) {
    adminService.deleteUser(id);
}
```

y el backend no valida bien quién puede llamar eso, entonces el botón oculto no sirve como defensa real.

---

## Qué nunca debe delegarse al frontend

Vamos a verlo claro y directo.

## 1. Autorización

El frontend **nunca** debe decidir quién puede acceder a un recurso o ejecutar una operación.

Ejemplo incorrecto de idea mental:

- “No mostramos la pantalla admin si no tiene rol ADMIN.”
- “El frontend ya sabe si el usuario puede editar.”
- “Desde la UI no se puede llamar ese flujo.”

Eso puede mejorar la UX, pero no protege nada por sí solo.

### La autorización real debe vivir en backend

Ejemplo:

```java
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id) {
    return orderService.getVisibleOrder(id);
}
```

La pregunta importante no es si el frontend muestra un link a esa orden.

La pregunta importante es:

- ¿el usuario autenticado realmente puede ver esa orden?
- ¿es suya?
- ¿tiene rol de soporte?
- ¿hay reglas adicionales por estado o tenant?

Eso se decide en backend.

---

## 2. Ownership de recursos

El backend no puede confiar en IDs enviados por el cliente para decidir pertenencia.

Ejemplo riesgoso:

```java
@GetMapping("/orders")
public List<OrderResponse> findByUser(@RequestParam Long userId) {
    return orderService.findByUser(userId);
}
```

## ¿Qué está mal?

Si el `userId` viene del cliente, el actor podría intentar consultar datos de otro usuario.

Versión mejor:

```java
@GetMapping("/orders/me")
public List<OrderResponse> myOrders(Authentication authentication) {
    return orderService.findByCurrentUser(authentication.getName());
}
```

O, si usás IDs internos:

```java
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id, Authentication authentication) {
    return orderService.getOwnedOrder(id, authentication.getName());
}
```

El ownership lo define el backend, no el parámetro que mande el cliente.

---

## 3. Integridad de montos, precios y totales

El frontend jamás debería ser fuente de verdad para valores críticos de negocio.

Ejemplo peligroso:

```java
@PostMapping("/orders")
public OrderResponse create(@RequestBody CreateOrderRequest request) {
    return orderService.create(request);
}
```

Y el request trae algo así:

```json
{
  "productId": 12,
  "quantity": 2,
  "total": 199.99
}
```

## Problema

Si el backend confía en `total`, el cliente puede intentar modificarlo.

El backend debe recalcular:

- precio unitario
- subtotal
- descuentos válidos
- impuestos
- total final

Nunca debería aceptar como verdad el monto final calculado por el cliente.

---

## 4. Reglas de negocio

El frontend puede acompañar un flujo, pero no debería imponer la regla real.

Ejemplos de reglas que deben vivir en backend:

- una orden solo puede cancelarse si está en cierto estado
- un reembolso no puede emitirse dos veces
- un cupón no puede aplicarse fuera de condiciones válidas
- un usuario bloqueado no puede operar
- una cuenta no puede cambiar su email sin validación previa
- un soporte no puede elevar privilegios libremente
- una operación solo puede hacerse dentro de una ventana de tiempo

### Error clásico

Pensar:

- “Como la UI no muestra el botón, no puede pasar.”
- “Como el wizard no deja avanzar, el estado está controlado.”
- “Como la pantalla hace validación, ya está.”

La regla válida tiene que ejecutarse en el backend.

---

## 5. Estados y transiciones

Una gran fuente de abuso aparece cuando el frontend manda directamente el estado deseado.

Ejemplo riesgoso:

```java
@PatchMapping("/orders/{id}")
public OrderResponse update(@PathVariable Long id, @RequestBody UpdateOrderRequest request) {
    return orderService.update(id, request);
}
```

Y el DTO permite:

```java
public class UpdateOrderRequest {
    private String status;
}
```

## Problema

Si el cliente puede mandar estados libremente, podría intentar transiciones inválidas:

- de `PENDING` a `DELIVERED`
- de `CANCELLED` a `PAID`
- de `REFUNDED` a `SHIPPED`

Versión mejor:

- el cliente no manda el estado arbitrariamente
- el backend expone operaciones específicas:
  - cancelar
  - pagar
  - marcar como enviado
  - aprobar
- cada operación valida si esa transición es legal

Ejemplo:

```java
@PostMapping("/orders/{id}/cancel")
public ResponseEntity<Void> cancel(@PathVariable Long id, Authentication authentication) {
    orderService.cancel(id, authentication.getName());
    return ResponseEntity.noContent().build();
}
```

Esto reduce muchísimo la superficie de abuso.

---

## 6. Campos internos

El backend no debería aceptar desde el cliente campos como:

- `role`
- `enabled`
- `deleted`
- `approved`
- `ownerId`
- `createdAt`
- `updatedAt`
- `status`
- `price`
- `total`
- `isAdmin`
- `visibility`
- `internalNotes`

si esos campos no corresponden realmente al actor y al flujo.

### Ejemplo clásico de error

```java
@PostMapping("/users")
public User create(@RequestBody User user) {
    return userRepository.save(user);
}
```

Eso le da demasiado control al cliente.

Versión mejor:

```java
@PostMapping("/users")
public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
    return userService.create(request);
}
```

Con un DTO mucho más acotado:

```java
public class CreateUserRequest {
    @NotBlank
    private String name;

    @Email
    private String email;

    @NotBlank
    private String password;
}
```

Los campos internos los decide el backend.

---

## 7. Roles y privilegios

El frontend puede mostrar opciones según el rol visible del usuario.

Pero el backend debe definir:

- qué permisos reales tiene
- qué endpoint puede usar
- qué acciones puede ejecutar
- qué recursos puede tocar
- qué operaciones puede combinar

Ejemplo riesgoso de pensamiento:

- “La UI de soporte no muestra el botón para cambiar roles.”
- “La UI de usuario común no tiene acceso a /admin.”

Eso no alcanza.

El backend debe validar explícitamente.

Ejemplo:

```java
@PreAuthorize("hasRole('ADMIN')")
@PatchMapping("/admin/users/{id}/role")
public ResponseEntity<Void> updateRole(@PathVariable Long id, @RequestBody UpdateRoleRequest request) {
    adminUserService.updateRole(id, request);
    return ResponseEntity.noContent().build();
}
```

Y además, muchas veces conviene repetir validación importante en `service`, no solo en controller.

---

## 8. Validación semántica

El frontend puede validar:

- formato
- campos vacíos
- longitud
- regex
- valores simples

Pero el backend debe validar la **semántica**.

### Ejemplos de validación semántica

- si la orden existe
- si le pertenece al actor
- si el cupón está vigente
- si el stock alcanza
- si el cambio de estado es válido
- si el reembolso corresponde
- si el usuario está habilitado
- si la operación no fue ejecutada ya
- si la integración externa confirmó algo consistente

Ese tipo de validación no puede vivir solo en frontend.

---

## 9. Acciones sensibles y auditoría

El frontend puede mostrar confirmaciones:

- “¿Seguro que querés cancelar?”
- “Esta acción no se puede deshacer.”
- “Confirmá con tu contraseña.”

Eso ayuda.

Pero el backend debe decidir además:

- si realmente puede hacerse
- quién la hizo
- cuándo la hizo
- sobre qué recurso
- con qué resultado
- si la acción debe quedar auditada

### Ejemplo

Cambiar un rol, cancelar una orden, resetear una contraseña o emitir un reembolso son acciones que el backend debe:

- autorizar
- validar
- registrar

No basta con una confirmación visual en la interfaz.

---

## 10. Integraciones externas

El backend tampoco puede delegar seguridad a la “buena fe” de un tercero.

Ejemplo:

```java
@PostMapping("/webhooks/payment")
public ResponseEntity<Void> receiveWebhook(@RequestBody PaymentWebhookRequest request) {
    paymentService.processWebhook(request);
    return ResponseEntity.ok().build();
}
```

Si el backend no valida:

- firma
- origen
- idempotencia
- consistencia del evento
- transición válida

entonces el sistema está confiando de más en algo externo.

El frontend ni participa ahí.
Todo ese criterio debe vivir en backend.

---

## Qué pasa cuando delegamos mal al frontend

Cuando el backend delega demasiado, empiezan a aparecer problemas como:

- IDOR
- mass assignment
- abuso de flujos
- cambios de estado inválidos
- precios manipulados
- roles alterados
- endpoints llamados fuera del flujo previsto
- automatización de acciones sensibles
- datos ajenos visibles
- validaciones que “solo existían en la UI”

En la práctica, muchos sistemas caen no porque alguien rompió una gran barrera, sino porque el backend estaba aceptando demasiada verdad desde el cliente.

---

## Ejemplo completo: error típico de diseño ingenuo

Supongamos este request:

```json
{
  "userId": 45,
  "productId": 12,
  "quantity": 2,
  "unitPrice": 99.99,
  "total": 199.98,
  "status": "PAID"
}
```

Si el backend acepta todo eso como válido, está delegando demasiado.

### ¿Qué debería decidir el backend?

- quién es el usuario real
- si puede comprar ese producto
- el precio real
- si hay stock
- el total real
- el estado inicial correcto
- la transición futura
- la auditoría

El cliente puede pedir una intención.
El backend decide la verdad.

---

## Cómo diseñar mejor en Spring

## 1. Usar DTOs acotados

No bindear entidades directas.

## 2. Llevar la lógica de negocio al service

No confiar en que controller + frontend ya “encapsulan” el flujo.

## 3. Tomar identidad desde el contexto autenticado

No desde parámetros enviados por el cliente.

## 4. Recalcular en backend todo valor crítico

Totales, descuentos, ownership, permisos, transiciones.

## 5. Exponer operaciones específicas

Mejor:

- `/cancel`
- `/approve`
- `/refund`

que un `PATCH` genérico con campos arbitrarios.

## 6. Auditar acciones sensibles

Especialmente admin, soporte, permisos, pagos, recuperaciones y estados críticos.

---

## Señal de diseño maduro

Un backend más maduro no pregunta solo:

- “¿la UI lo permite?”

Pregunta:

- “aunque me manden una request fabricada, ¿igual lo estoy controlando bien?”

Esa es una pregunta muchísimo más útil.

---

## Checklist práctico

Cuando revises una app Spring, preguntate:

- ¿qué está asumiendo el backend que ya viene validado por el frontend?
- ¿qué campos del request nunca deberían venir del cliente?
- ¿qué decisiones críticas está tomando hoy la UI?
- ¿qué reglas de negocio no están realmente en service?
- ¿qué endpoint confía demasiado en IDs, roles o estados enviados?
- ¿qué operación sensible depende solo de que el botón esté oculto?
- ¿qué monto, total o descuento podría manipularse?
- ¿qué acción crítica no deja auditoría?
- ¿qué flujo importante funcionaría mal si alguien se salta la interfaz?
- ¿qué parte del sistema hoy acepta como verdad algo que debería recalcular sola?

---

## Mini ejercicio de reflexión

Tomá un endpoint de tu backend y respondé:

1. ¿Qué parte del request está confiando demasiado?
2. ¿Qué dato debería ignorar y recalcular el backend?
3. ¿Qué autorización real debería ejecutarse?
4. ¿Qué regla de negocio vive hoy demasiado en la UI?
5. ¿Qué pasaría si alguien llama ese endpoint con Postman o con un script y no desde tu frontend?

Si esa última pregunta cambia mucho el resultado, entonces tu backend todavía está delegando demasiado.

---

## Resumen

El frontend puede:

- guiar
- ordenar
- validar UX
- ocultar complejidad
- mejorar la experiencia

Pero el backend debe:

- autenticar
- autorizar
- validar negocio
- imponer ownership
- recalcular valores críticos
- controlar estados
- decidir permisos
- auditar acciones
- proteger integraciones
- definir la verdad del sistema

En resumen:

> Todo lo que sea importante para seguridad, integridad o negocio debe quedar decidido en backend, aunque el frontend también lo acompañe.

---

## Próximo tema

**Autenticación vs autorización en Spring**
