---
title: "Autenticación vs autorización en Spring"
description: "Cómo distinguir autenticación y autorización en una aplicación Java con Spring Boot y Spring Security. Qué resuelve cada una, dónde suelen confundirse y cómo evitar huecos de seguridad entre ambas."
order: 5
module: "Fundamentos"
level: "intro"
draft: false
---

# Autenticación vs autorización en Spring

## Objetivo del tema

Entender con claridad la diferencia entre **autenticación** y **autorización** en una aplicación hecha con Java + Spring, porque gran parte de los errores de seguridad backend aparecen cuando el sistema responde bien la primera pregunta, pero mal la segunda.

Las dos preguntas son estas:

- **¿Quién sos?**
- **¿Qué podés hacer?**

La primera es autenticación.  
La segunda es autorización.

Parece obvio, pero en la práctica muchísimos backends mezclan ambas cosas.

---

## Idea clave

Un usuario autenticado no es automáticamente un usuario autorizado.

En resumen:

> Autenticación significa identificar al actor.  
> Autorización significa decidir si ese actor puede realizar una acción concreta sobre un recurso concreto, en un contexto concreto.

Ese “contexto concreto” es importantísimo.

Porque una autorización real no depende solo de:

- que el usuario exista
- que tenga sesión
- que tenga token
- que tenga un rol general

También depende de cosas como:

- de quién es el recurso
- en qué estado está
- qué acción intenta ejecutar
- desde qué flujo llega
- si existe una regla especial de negocio
- si la operación ya fue realizada antes
- si esa capacidad corresponde a ese tipo de actor

---

## Qué es autenticación

Autenticación es el proceso por el cual el sistema determina:

- quién es el actor
- si su identidad es válida
- si puede iniciar una sesión o recibir un token
- si las credenciales presentadas son correctas

### Ejemplos de autenticación

- login con email y contraseña
- login con usuario y contraseña
- sesión con cookie
- JWT válido
- refresh token válido
- OAuth / OIDC
- segundo factor
- API key
- cuenta técnica autenticada entre servicios

### En Spring Security, autenticación suele significar

- recibir credenciales
- validarlas
- construir un `Authentication`
- colocarlo en el contexto de seguridad

Ejemplo mental:

```java
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
```

Si el sistema ya sabe quién es el actor, hubo autenticación.

---

## Qué es autorización

Autorización es el proceso por el cual el sistema decide:

- si ese actor puede hacer esa acción
- sobre ese recurso
- bajo esas condiciones

No responde “quién sos”.
Responde:

- ¿podés entrar acá?
- ¿podés ver esto?
- ¿podés modificar esto?
- ¿podés borrar esto?
- ¿podés ejecutar esta operación administrativa?
- ¿podés hacerlo sobre este recurso en particular?

---

## Error mental clásico

Muchos sistemas caen en una lógica como esta:

- “Si está logueado, puede entrar.”
- “Si tiene token, ya está.”
- “Si pasó por Spring Security, entonces está autorizado.”
- “Si tiene rol USER, puede consultar cualquier cosa de usuarios.”
- “Si está autenticado, puede cancelar la orden.”

Eso es un error muy común.

Porque autenticación solo resuelve:

- que la identidad es válida

No resuelve:

- qué puede hacer esa identidad
- sobre qué cosas
- en qué contexto
- con qué límites

---

## Ejemplo simple para fijar la diferencia

Supongamos este endpoint:

```java
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id) {
    return orderService.getById(id);
}
```

Ahora supongamos que el endpoint está protegido con Spring Security y solo admite usuarios logueados.

Eso significa:

- autenticación: sí
- autorización: no necesariamente

¿Por qué?

Porque todavía falta responder:

- ¿esa orden le pertenece?
- ¿es soporte?
- ¿es admin?
- ¿la orden está dentro de su tenant?
- ¿puede ver órdenes archivadas?
- ¿puede ver órdenes canceladas?
- ¿puede ver datos completos o solo parciales?

Entonces, un endpoint puede estar bien autenticado y aun así estar mal autorizado.

---

## La pregunta correcta en cada caso

## Autenticación

Pregunta correcta:

- **¿Quién es esta entidad?**

Ejemplos:

- ¿la contraseña coincide?
- ¿el token es válido?
- ¿la sesión sigue activa?
- ¿la firma del token es correcta?
- ¿la cuenta existe?
- ¿la cuenta está habilitada?

## Autorización

Pregunta correcta:

- **¿Esta entidad puede hacer esto acá y ahora?**

Ejemplos:

- ¿puede leer esta orden?
- ¿puede actualizar este usuario?
- ¿puede cambiar un rol?
- ¿puede cancelar este pedido?
- ¿puede ver este campo?
- ¿puede disparar esta integración?
- ¿puede exportar esta información?

---

## Autenticación sin autorización: backend inseguro

Veamos este ejemplo:

```java
@GetMapping("/users/{id}")
public UserResponse getUser(@PathVariable Long id) {
    return userService.findById(id);
}
```

Y supongamos que solo usuarios autenticados pueden usar este endpoint.

¿Qué puede salir mal?

- un usuario autenticado consulta cualquier `id`
- ve datos de otros usuarios
- enumera recursos
- descubre información sensible
- usa el sistema como si autenticación implicara acceso global

Este es el típico caso donde el equipo dice:

- “Pero el endpoint está protegido.”

Sí.  
Está autenticado.  
No necesariamente está autorizado.

---

## Autorización sin contexto: también inseguro

Otro error común es autorizar solo por rol grueso.

Ejemplo:

```java
@PreAuthorize("hasRole('USER')")
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id) {
    return orderService.getById(id);
}
```

Esto sigue siendo insuficiente.

¿Por qué?

Porque `hasRole('USER')` no responde:

- si esa orden le pertenece
- si puede verla en ese estado
- si debería ver todos los campos
- si está en el mismo tenant
- si la acción está permitida bajo la lógica actual del negocio

El rol general puede ser una parte de la autorización, pero rara vez alcanza solo.

---

## Cómo se ve la autenticación en Spring

En Spring Security, la autenticación suele apoyarse en cosas como:

- `UserDetailsService`
- `PasswordEncoder`
- filtros de autenticación
- JWT filters
- `AuthenticationManager`
- cookies de sesión
- contexto de seguridad

### Ejemplo conceptual

```java
@PostMapping("/auth/login")
public AuthResponse login(@RequestBody LoginRequest request) {
    return authService.login(request);
}
```

Ahí se decide:

- si las credenciales son válidas
- si la cuenta existe
- si está habilitada
- si se emite una sesión o token

Eso es autenticación.

---

## Cómo se ve la autorización en Spring

En Spring, la autorización puede aparecer en varios niveles:

- reglas de seguridad HTTP
- `@PreAuthorize`
- `@PostAuthorize`
- validaciones en `service`
- filtros por tenant
- chequeos de ownership
- chequeos por estado del recurso
- políticas por operación

### Ejemplo básico

```java
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/admin/users/{id}")
public void deleteUser(@PathVariable Long id) {
    adminService.deleteUser(id);
}
```

Eso ya es autorización.

Pero todavía puede faltar contexto.

Por ejemplo:

- ¿puede borrar cualquier admin?
- ¿hay admins intocables?
- ¿se puede borrar si ese usuario tiene órdenes activas?
- ¿se audita la acción?

Por eso la autorización real muchas veces no termina en una anotación.

---

## Dónde suelen confundirse en Spring

## 1. Endpoint protegido = endpoint autorizado

Error típico:

- “Si el request llega hasta el controller, ya está controlado.”

No necesariamente.

Puede estar autenticado y aun así faltar validación de ownership, recurso, estado o negocio.

---

## 2. Rol suficiente = autorización suficiente

Error típico:

- “Con `hasRole('USER')` alcanza.”
- “Con `hasRole('ADMIN')` ya resolvimos.”

No siempre.

Los roles suelen ser demasiado gruesos.

En sistemas reales importa además:

- ownership
- ámbito
- tenant
- estado
- recurso
- acción
- contexto temporal
- separación de funciones

---

## 3. Autorización solo en controller

Error típico:

- controller protegido
- service reutilizable sin control real
- otra ruta o job llama ese mismo service sin pasar por la misma barrera

Ejemplo:

```java
@PreAuthorize("hasRole('ADMIN')")
@PatchMapping("/admin/users/{id}/role")
public void updateRole(@PathVariable Long id, @RequestBody UpdateRoleRequest request) {
    adminUserService.updateRole(id, request);
}
```

Si `adminUserService.updateRole(...)` se llama desde otro punto sin el mismo control, el sistema puede quedar incoherente.

En muchas operaciones sensibles conviene que la autorización importante también viva o se revalide en `service`.

---

## 4. Confundir “autenticado” con “dueño”

Error típico:

- usar el `id` del path o del request como si coincidiera naturalmente con el actor actual

Ejemplo riesgoso:

```java
@GetMapping("/users/{id}/orders")
public List<OrderResponse> getOrders(@PathVariable Long id) {
    return orderService.findByUserId(id);
}
```

El backend necesita comparar ese `id` con el actor autenticado o con una regla válida de soporte/admin.

Si no, hay hueco de autorización.

---

## Ejemplo completo: login correcto, autorización mala

Supongamos esta app:

- el login funciona perfecto
- JWT bien emitido
- contraseña hasheada correctamente
- Spring Security valida token
- endpoints protegidos para usuarios autenticados

Pero además existe esto:

```java
@GetMapping("/invoices/{id}")
public InvoiceResponse getInvoice(@PathVariable Long id) {
    return invoiceService.getById(id);
}
```

Si no hay control de ownership:

- autenticación: bien
- autorización: mal

Este ejemplo es muy realista.

Muchas apps parecen seguras porque el login está bien hecho, pero el acceso a recursos está mal controlado.

---

## Autenticación fuerte no compensa autorización débil

Esto es importante.

Podés tener:

- bcrypt correcto
- JWT firmado
- expiración bien configurada
- MFA
- refresh token
- cookies seguras

Y aun así, si la autorización está mal, el sistema sigue siendo inseguro.

Porque un usuario perfectamente autenticado todavía puede:

- consultar recursos ajenos
- cambiar datos que no debería
- abusar operaciones críticas
- aprovechar flujos administrativos mal delimitados

En resumen:

> una autenticación fuerte no arregla una autorización floja

---

## Cómo pensar mejor la autorización

Una autorización madura suele responder varias capas a la vez:

## 1. Identidad

- ¿quién es?

## 2. Rol o tipo de actor

- ¿es USER?
- ¿es ADMIN?
- ¿es SUPPORT?
- ¿es cuenta técnica?

## 3. Recurso

- ¿sobre qué objeto intenta actuar?

## 4. Ownership o ámbito

- ¿le pertenece?
- ¿está en su tenant?
- ¿está dentro de su alcance?

## 5. Acción

- ¿ver?
- ¿editar?
- ¿cancelar?
- ¿aprobar?
- ¿exportar?

## 6. Estado o contexto

- ¿se puede hacer en este momento?
- ¿ese recurso está en un estado válido?
- ¿esta transición es legal?
- ¿ya se hizo antes?

Si solo resolvés una de esas capas, la autorización suele quedar incompleta.

---

## Ejemplo mejor orientado a autorización real

```java
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id, Authentication authentication) {
    return orderService.getVisibleOrder(id, authentication.getName());
}
```

Y después en `service`:

```java
public OrderResponse getVisibleOrder(Long orderId, String username) {
    Order order = orderRepository.findById(orderId).orElseThrow();

    User user = userRepository.findByEmail(username).orElseThrow();

    if (!order.getUser().getId().equals(user.getId()) && !user.hasRole("SUPPORT")) {
        throw new AccessDeniedException("No autorizado");
    }

    return mapper.toResponse(order);
}
```

Acá ya estamos respondiendo mejor:

- quién es el actor
- qué recurso quiere
- si ese actor puede ver ese recurso específico

---

## Autorización por endpoint vs autorización por negocio

Otra distinción útil:

## Autorización por endpoint

Ejemplo:

- solo admins acceden a `/admin/**`

Eso está bien, pero es una capa gruesa.

## Autorización por negocio

Ejemplo:

- un usuario puede cancelar solo su orden
- solo si está en `PENDING`
- solo dentro de cierta ventana
- solo si no hubo reembolso previo
- y la acción debe quedar auditada

Eso ya es autorización mucho más realista.

Muchas apps tienen la primera, pero no la segunda.

---

## Señales de que autenticación y autorización están mal separadas

Estas son señales muy comunes:

- cualquier usuario autenticado puede consultar por ID recursos ajenos
- la app usa mucho `hasRole()` pero poco ownership
- el backend confía en `userId` enviado por el cliente
- la lógica sensible vive solo en controller
- los services hacen operaciones críticas sin contexto del actor
- existen endpoints “protegidos” pero no “restringidos” de verdad
- el equipo habla mucho de login, pero poco de permisos por recurso
- cambiar de rol o estado depende demasiado de la UI
- soporte y admin comparten demasiado poder
- el sistema sabe quién sos, pero no decide bien qué podés hacer

---

## Checklist práctico

Cuando revises una app Spring, preguntate:

- ¿qué mecanismos de autenticación usa?
- ¿están bien separados de la autorización?
- ¿qué endpoints confunden “logueado” con “autorizado”?
- ¿qué recursos pueden consultarse solo con conocer un ID?
- ¿qué operaciones dependen solo de un rol general?
- ¿qué services sensibles no reciben contexto del actor?
- ¿qué acciones necesitan ownership además de rol?
- ¿qué validaciones deberían vivir en negocio y no solo en anotaciones?
- ¿qué cuenta técnica o integración tiene permisos demasiado amplios?
- ¿qué flujo parece seguro porque el login está bien, pero sigue teniendo huecos de acceso?

---

## Mini ejercicio de reflexión

Tomá tres endpoints de tu backend y clasificá cada uno así:

1. ¿Qué parte de la lógica es autenticación?
2. ¿Qué parte de la lógica es autorización?
3. ¿La autorización depende solo de rol o también de recurso y contexto?
4. ¿Qué pasaría si otro usuario autenticado prueba el mismo endpoint con otro ID?
5. ¿Qué pasaría si una cuenta con rol parecido intenta usarlo fuera del flujo previsto?

Si varias respuestas dependen demasiado del cliente o de la UI, probablemente tenés huecos de autorización.

---

## Resumen

Autenticación y autorización no son lo mismo.

## Autenticación responde:

- quién es el actor

## Autorización responde:

- qué puede hacer ese actor
- sobre qué recurso
- en qué contexto
- con qué límites

En Spring, ambas pueden convivir dentro del mismo request, pero conceptualmente son distintas.

En resumen:

> Un backend seguro no solo reconoce identidades.
> También decide bien qué puede hacer cada una, sobre qué objeto y bajo qué condiciones reales.

---

## Próximo tema

**Seguridad por capas: controller, service, repository y database**
