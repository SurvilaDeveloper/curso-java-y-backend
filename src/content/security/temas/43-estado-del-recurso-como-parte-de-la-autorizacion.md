---
title: "Estado del recurso como parte de la autorización"
description: "Cómo incorporar el estado del recurso a la autorización en una aplicación Java con Spring Boot y Spring Security. Por qué no alcanza con rol, permiso u ownership, y cómo evitar operaciones inválidas sobre recursos que existen pero no deberían poder tocarse en ese momento."
order: 43
module: "Autorización"
level: "base"
draft: false
---

# Estado del recurso como parte de la autorización

## Objetivo del tema

Entender por qué, en una aplicación Java + Spring Boot + Spring Security, la autorización no debería decidirse solo por:

- identidad
- rol
- permiso
- ownership
- tenant

sino también por el **estado actual del recurso**.

Este tema importa mucho porque muchas apps hacen una parte importante de la autorización, pero olvidan una pregunta decisiva:

- **aunque este actor sea el correcto y este recurso sea el correcto, ¿debería poder hacer esta acción ahora?**

Y la respuesta muchas veces depende del estado del objeto.

En sistemas reales, eso cambia muchísimo cosas como:

- cancelaciones
- reembolsos
- aprobaciones
- edición
- publicación
- borrado
- reenvíos
- exportaciones
- visibilidad de ciertos datos
- transiciones de workflow

En resumen:

> no alcanza con preguntar “¿quién sos?” y “¿de quién es el recurso?”.  
> También hay que preguntar “¿en qué estado está este recurso y qué acciones habilita ese estado?”.

---

## Idea clave

La autorización madura suele depender al menos de estas capas:

- actor
- recurso
- acción
- contexto
- estado del recurso

En resumen:

> una acción puede estar correctamente autorizada para un actor sobre un recurso y aun así ser inválida porque el recurso está en un estado donde esa acción ya no corresponde.

Ese “ya no corresponde” es exactamente lo que este tema busca modelar.

---

## Qué entendemos por estado del recurso

El estado de un recurso es la situación actual en la que se encuentra dentro del flujo del sistema.

### Ejemplos típicos

- `DRAFT`
- `PENDING`
- `APPROVED`
- `REJECTED`
- `PAID`
- `SHIPPED`
- `CANCELLED`
- `REFUNDED`
- `LOCKED`
- `ARCHIVED`
- `INTERNAL_REVIEW`

Cada uno de esos estados suele implicar cosas distintas sobre lo que puede hacerse después.

### Idea importante

El recurso puede:

- existir
- pertenecer al actor correcto
- estar dentro del tenant correcto
- y aun así **no admitir** la acción que el actor intenta.

---

## Error mental clásico

Muchos sistemas piensan así:

- “si el usuario es el dueño, puede”
- “si tiene permiso `order:cancel`, puede”
- “si tiene rol admin, puede”
- “si tiene authority `invoice:refund`, puede”

Eso suele ser incompleto.

Porque todavía falta algo como:

- ¿esa orden sigue cancelable?
- ¿esa factura sigue reembolsable?
- ¿ese documento ya fue publicado?
- ¿esa solicitud está en revisión?
- ¿ese recurso está bloqueado?
- ¿ese objeto ya está archivado?

La autorización real muchas veces depende del estado del recurso tanto como del actor.

---

## Ejemplo clásico: orden cancelable o no

Supongamos una orden.

Estados posibles:

- `PENDING`
- `PAID`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

### Error común

Modelar la autorización solo así:

```java
@PreAuthorize("hasAuthority('order:cancel')")
@PostMapping("/orders/{id}/cancel")
public ResponseEntity<Void> cancel(@PathVariable Long id, Authentication authentication) {
    orderService.cancel(id, authentication.getName());
    return ResponseEntity.noContent().build();
}
```

Y después en service:

```java
public void cancel(Long orderId, String username) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    User actor = userRepository.findByEmail(username).orElseThrow();

    if (!order.belongsTo(actor)) {
        throw new AccessDeniedException("No autorizado");
    }

    order.setStatus(OrderStatus.CANCELLED);
    orderRepository.save(order);
}
```

### Problema

Se validó:

- actor correcto
- ownership correcto

Pero no se validó:

- si esa orden sigue siendo cancelable

Resultado posible:

- órdenes ya enviadas canceladas de forma incorrecta
- inconsistencia de negocio
- abuso del flujo
- estados imposibles

---

## Ejemplo mejor: actor + recurso + estado

```java
public void cancel(Long orderId, String username) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    User actor = userRepository.findByEmail(username).orElseThrow();

    if (!order.belongsTo(actor)) {
        throw new AccessDeniedException("No autorizado");
    }

    if (!order.canBeCancelled()) {
        throw new IllegalStateException("La orden no puede cancelarse en este estado");
    }

    order.cancel();
    orderRepository.save(order);
}
```

Acá la autorización real no depende solo del actor.
También depende del estado del recurso.

---

## El estado cambia el significado de la misma acción

Una misma acción puede ser válida en un estado e inválida en otro.

### Ejemplo

Acción:
- cancelar

Puede ser válida en:
- `PENDING`
- quizás `PAID`

Pero inválida en:
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

### Otro ejemplo

Acción:
- editar

Puede ser válida en:
- `DRAFT`

Pero inválida en:
- `APPROVED`
- `PUBLISHED`
- `ARCHIVED`

Entonces la autorización no es estática.
Depende del ciclo de vida del objeto.

---

## Estado no es solo validación de negocio “aparte”

A veces se piensa que esto es solo “una validación funcional”.
Pero en muchos casos también es claramente parte de la autorización.

### ¿Por qué?

Porque el backend está respondiendo:

- si ese actor puede o no ejecutar esa acción sobre ese recurso en este momento

Eso es autorización contextual.

No hace falta obsesionarse con separar terminológicamente cada línea entre “negocio” y “seguridad”.
Lo importante es entender que el estado del recurso afecta el permiso real de operar.

---

## Qué pasa si ignorás el estado

Si ignorás el estado del recurso, pueden aparecer cosas como:

- reembolsos duplicados
- publicaciones múltiples indebidas
- ediciones sobre recursos cerrados
- aprobaciones fuera de secuencia
- cancelaciones tardías
- reenvíos sobre elementos ya cerrados
- cambios sobre recursos archivados
- transiciones imposibles o incoherentes

Eso rompe tanto la seguridad como la integridad del sistema.

---

## Estado y workflow

Este tema está muy ligado a la idea de **workflow** o flujo de estados.

Muchos recursos no son simplemente “objetos con campos”.
Son objetos que recorren una secuencia de pasos válidos.

### Ejemplo

Una solicitud puede pasar por:

- `DRAFT`
- `SUBMITTED`
- `UNDER_REVIEW`
- `APPROVED`
- `REJECTED`

Y cada estado habilita o prohíbe acciones distintas.

### Entonces la autorización también responde

- ¿quién puede mover este recurso del estado A al B?
- ¿qué estados puede producir este actor?
- ¿qué estados hacen visible cierta información?
- ¿qué transición es válida en este momento?

---

## Ownership correcto no significa acción válida

Esto conviene repetirlo porque es una fuente enorme de errores.

### Ejemplo

El usuario es dueño de su orden.
Eso no significa que pueda:

- cancelarla siempre
- cambiar el monto
- editar la dirección siempre
- reabrirla
- reembolsarla
- descargar cualquier documento interno

Ownership resuelve parte del acceso.
El estado y la acción resuelven otra parte muy importante.

---

## Admin tampoco debería ignorar siempre el estado

Otro error frecuente es pensar:

- “si es admin, el estado no importa”

Eso a veces puede ser cierto para ciertas operaciones excepcionales.
Pero no debería asumirse automáticamente.

### Ejemplo

Un admin puede tener más capacidad, pero aun así podría requerir:

- flujos especiales
- auditoría
- razones explícitas
- endpoints distintos
- permisos más altos para forzar una transición

Un rol alto no debería borrar mágicamente la lógica del ciclo de vida del recurso.

---

## Soporte y estados intermedios

En muchos sistemas, soporte u operaciones interactúan justamente con recursos en estados intermedios.

### Ejemplo

Soporte puede:

- ver pedidos en `PENDING`
- agregar notas
- reenviar notificaciones

Pero no necesariamente:
- marcarlos como `REFUNDED`
- saltarse revisión
- cambiar ciertos estados críticos
- reabrir casos cerrados sin proceso adecuado

Otra vez aparece la idea de:

- actor correcto
- recurso correcto
- estado correcto
- acción correcta

---

## Estado también afecta visibilidad

No solo importa para modificar.
También puede importar para ver.

### Ejemplo

Un usuario puede ver:

- su orden `PENDING`
- su orden `SHIPPED`

pero quizá no debería ver:
- notas internas
- flags de fraude
- datos de revisión interna
- ciertos detalles mientras está en `INTERNAL_REVIEW`

O un actor puede ver un recurso solo cuando ya pasó de cierto estado.

Entonces el estado también puede afectar:
- lectura
- detalle visible
- campos expuestos
- respuestas parciales

No solo transiciones.

---

## Ejemplo con documento o publicación

Supongamos un documento con estados:

- `DRAFT`
- `PUBLISHED`
- `ARCHIVED`

### Reglas posibles

- el autor puede editar en `DRAFT`
- no puede editar en `PUBLISHED`
- puede ver en `ARCHIVED`
- quizá solo admin puede restaurarlo desde `ARCHIVED`

Si el backend solo valida:

- que el actor sea el autor

pero no revisa el estado, deja la puerta abierta a cambios incoherentes.

---

## Dónde conviene resolver esto

Como regla práctica, el estado del recurso suele resolverse mucho mejor en **service** o incluso en métodos del propio dominio, porque ahí el backend ya conoce:

- el recurso concreto
- su estado actual
- el actor
- la acción
- la transición propuesta

### Ejemplo sano

```java
public void refund(Long orderId, String username) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    User actor = userRepository.findByEmail(username).orElseThrow();

    if (!actor.hasAuthority("order:refund")) {
        throw new AccessDeniedException("No autorizado");
    }

    if (!order.canBeRefunded()) {
        throw new IllegalStateException("La orden no puede reembolsarse");
    }

    order.refund();
    orderRepository.save(order);
}
```

Esto suele vivir mucho mejor acá que en un `@PreAuthorize` rebuscado.

---

## `@PreAuthorize` y límites con estados

A veces se intenta meter toda la lógica en una anotación.

### Ejemplo sospechoso

```java
@PreAuthorize("hasAuthority('order:refund') and @orderSecurityService.canRefund(#id, authentication)")
```

Esto puede funcionar técnicamente.
Pero si empieza a concentrar demasiada lógica de:
- actor
- recurso
- estado
- transición
- negocio

puede volverse difícil de:

- leer
- auditar
- testear
- mantener

No hace falta prohibirlo.
Pero sí conviene evitar que la autorización compleja quede enterrada en expresiones difíciles de entender.

---

## El estado también necesita nombres claros

Otro problema frecuente es modelar estados ambiguos.

Por ejemplo:

- `ACTIVE`
- `DONE`
- `OK`
- `CLOSED`

sin una semántica clara sobre qué habilitan o prohíben.

Cuando el estado es difuso, la autorización basada en estado se vuelve también difusa.

### Más sano

Estados que expresen mejor el workflow real:

- `DRAFT`
- `SUBMITTED`
- `UNDER_REVIEW`
- `APPROVED`
- `REJECTED`
- `ARCHIVED`

y reglas claras sobre:
- quién puede hacer qué en cada uno

---

## Qué pasa con transiciones inválidas

Muchas veces el verdadero problema no es el estado aislado, sino la **transición**.

### Ejemplo

Puede ser válido pasar de:
- `PENDING` a `CANCELLED`

pero no de:
- `SHIPPED` a `PENDING`
- `REFUNDED` a `PAID`
- `ARCHIVED` a `DRAFT`

Entonces conviene pensar no solo:

- “¿qué estado tiene?”

sino también:

- “¿qué transición intenta hacer?”
- “¿está permitida para este actor?”

Eso vuelve al modelo mucho más robusto.

---

## Ejemplo de transición más clara

```java
public void approve(Long requestId, String username) {
    ReviewRequest request = reviewRequestRepository.findById(requestId).orElseThrow();
    User actor = userRepository.findByEmail(username).orElseThrow();

    if (!actor.hasAuthority("review:approve")) {
        throw new AccessDeniedException("No autorizado");
    }

    if (request.getStatus() != ReviewStatus.UNDER_REVIEW) {
        throw new IllegalStateException("La solicitud no está en estado aprobable");
    }

    request.setStatus(ReviewStatus.APPROVED);
    reviewRequestRepository.save(request);
}
```

Acá la acción depende claramente del estado.

---

## Qué relación tiene esto con multi-tenant y ownership

Se relaciona muchísimo.

Porque autorización madura suele necesitar combinar:

- actor
- permiso
- tenant
- ownership
- estado

### Ejemplo realista

Un actor puede:
- pertenecer al tenant correcto
- ser dueño del recurso
- tener permiso general de edición

y aun así:
- no poder editar porque el recurso está bloqueado o archivado

Eso muestra muy bien por qué el estado es una capa más, no un detalle menor.

---

## Qué señales muestran que el estado está siendo ignorado

Estas cosas suelen hacer ruido rápido:

- métodos que cambian estado sin mirar estado previo
- endpoints de cancelación, aprobación o refund sin chequeo contextual
- roles altos que saltan todo por defecto
- edición permitida solo por ownership sin mirar workflow
- services que actúan sobre recursos existentes como si cualquier estado fuera equivalente
- lógica de frontend sosteniendo restricciones que backend no revalida

---

## Qué gana el backend si incorpora bien el estado

Cuando el backend incorpora el estado del recurso a la autorización, gana:

- menos transiciones inválidas
- menos abuso de workflow
- más consistencia de negocio
- menos acciones tardías o incoherentes
- mejor separación entre “existe” y “es operable”
- mejor defensa frente a actores legítimos usando mal el sistema
- mejor alineación entre autorización y ciclo de vida real

No es solo seguridad “contra atacantes externos”.
También es seguridad contra abuso funcional y errores de lógica.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- estados con semántica clara
- acciones ligadas a estados válidos
- service que valida actor + recurso + estado
- poco reliance en frontend para frenar transiciones indebidas
- métodos del dominio o políticas claras como `canBeCancelled()`, `canBeRefunded()`, etc.
- menos ifs caóticos dispersos sin criterio

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- cualquier dueño puede hacer cualquier cosa siempre
- cualquier admin puede forzar cualquier transición sin proceso
- estados ambiguos
- transitions sin validación previa
- `PATCH` genéricos a `status`
- services que ignoran completamente el estado del recurso
- autorización pensada solo en actor y nunca en lifecycle del objeto

---

## Checklist práctico

Cuando revises autorización en una app Spring, preguntate:

- ¿qué estado tiene este recurso?
- ¿qué acciones habilita ese estado?
- ¿qué acciones prohíbe?
- ¿la acción intenta cambiar de un estado a otro?
- ¿esa transición es válida?
- ¿el actor correcto podría igual estar fuera de tiempo o fuera de estado?
- ¿el service valida esto o depende del frontend?
- ¿los estados tienen semántica clara?
- ¿hay métodos o políticas claras como `canX()`?
- ¿si el recurso ya pasó a otro estado, el backend sigue aceptando operaciones que ya no corresponden?

---

## Mini ejercicio de reflexión

Tomá tres recursos de tu backend que tengan estados y respondé:

1. ¿Qué estados posibles tienen?
2. ¿Qué acciones permite cada estado?
3. ¿Qué actor puede ejecutar cada acción?
4. ¿Qué transición sería claramente inválida?
5. ¿Dónde valida hoy el backend esa transición?
6. ¿Qué parte depende del frontend?
7. ¿Qué operación podría hoy ejecutarse fuera de estado si alguien fabrica la request a mano?

Ese ejercicio ayuda muchísimo a detectar huecos reales de autorización contextual.

---

## Resumen

El estado del recurso es una parte real de la autorización.

No alcanza con:

- actor correcto
- permiso correcto
- recurso correcto
- tenant correcto

También importa:

- si ese recurso está en el estado adecuado para la acción intentada

En resumen:

> Un backend más maduro no trata todos los recursos existentes como igualmente operables.  
> Entiende que el ciclo de vida del objeto cambia qué acciones tienen sentido y cuáles deberían rechazarse aunque el actor sea legítimo.

---

## Próximo tema

**Admin no debe significar acceso ilimitado**
