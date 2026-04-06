---
title: "Estados inválidos y transiciones ilegales"
description: "Cómo pensar y defender en Spring Boot las reglas de estado de un dominio para evitar operaciones fuera de secuencia, cambios inconsistentes y abuso funcional. Qué significa modelar bien transiciones válidas, dónde validar, qué errores devolver y cómo impedir que un recurso termine en un estado imposible."
order: 60
module: "Lógica de negocio y abuso funcional"
level: "base"
draft: false
---

# Estados inválidos y transiciones ilegales

## Objetivo del tema

Entender por qué muchas fallas de seguridad y de integridad no aparecen porque alguien “rompió el login” o “inyectó SQL”, sino porque el backend permite **cambios de estado que nunca debieron ser posibles**.

La idea es aprender a revisar si una aplicación Spring Boot:

- modela correctamente los estados de un recurso
- define qué transiciones son válidas y cuáles no
- impide saltos ilegales entre etapas del proceso
- valida esas reglas en el backend y no en la UI
- evita inconsistencias cuando varias operaciones compiten
- responde de forma clara sin exponer de más

En resumen:

> proteger un backend también es impedir que el negocio termine en estados imposibles.

---

## Idea clave

Muchos recursos del dominio no son “datos sueltos”.
Son cosas que **atraviesan un ciclo de vida**.

Por ejemplo:

- una orden puede pasar de `CREATED` a `PAID`
- un pago puede pasar de `PENDING` a `CONFIRMED`
- un envío puede pasar de `READY` a `SHIPPED`
- una devolución puede pasar de `REQUESTED` a `APPROVED` o `REJECTED`
- una cuenta puede pasar de `PENDING_ACTIVATION` a `ACTIVE`

El problema aparece cuando el backend permite cosas como:

- cancelar algo ya entregado
- reenviar algo ya cerrado
- aprobar una devolución ya rechazada
- marcar como pagada una orden cancelada
- ejecutar una acción sin que exista el estado previo necesario

Eso no siempre parece una vulnerabilidad “clásica”, pero sí puede convertirse en:

- abuso funcional
- fraude
- corrupción de datos
- inconsistencias operativas
- evasión de controles
- ruptura de auditoría

---

## Qué problema intenta resolver este tema

Este tema intenta evitar que el backend acepte operaciones válidas técnicamente, pero inválidas para el negocio.

Porque muchas veces el endpoint existe, la autenticación funciona y el usuario incluso tiene permisos, pero la operación igual debería ser rechazada porque:

- llega fuera de secuencia
- el recurso ya avanzó a otra etapa
- falta una condición previa
- el cambio contradice una regla del dominio
- el recurso quedó en un estado terminal
- la transición solo está permitida para ciertos actores o contextos

En otras palabras:

> no alcanza con saber quién hace la operación. También hay que validar si el recurso está en un estado desde el cual esa operación tiene sentido.

---

## Error mental clásico

Un error común es pensar algo así:

- “si el usuario está autenticado, que haga la acción”
- “si el usuario tiene el rol correcto, alcanza”
- “si el botón aparece solo cuando corresponde, ya está controlado”

Eso suele ser falso.

La UI puede ocultar botones.
El frontend puede intentar guiar el flujo.
Pero el backend debe ser quien realmente imponga:

- el estado actual del recurso
- qué transición está permitida
- qué transición está prohibida
- qué precondiciones deben cumplirse

La regla sana es:

> la secuencia válida del negocio vive en el backend, no en la pantalla.

---

## Pensar en estados cambia cómo revisás un endpoint

Supongamos este endpoint:

```http
POST /orders/{id}/cancel
```

A primera vista, podrías revisar:

- autenticación
- autorización
- ownership
- validación del `id`

Todo eso está bien.
Pero falta una pregunta crítica:

- ¿en qué estado está la orden?

Porque cancelar puede tener sentido si la orden está:

- `CREATED`
- `PENDING_PAYMENT`

pero quizá ya no debería permitirse si está:

- `SHIPPED`
- `DELIVERED`
- `REFUNDED`
- `CANCELLED`

Ahí aparece una idea central:

> casi toda operación sensible debería revisarse también como una transición de estado.

---

## Ejemplos de estados inválidos

Algunos ejemplos típicos:

### En e-commerce
- pagar una orden ya cancelada
- cancelar una orden ya enviada
- enviar una orden no pagada
- reembolsar dos veces el mismo pago

### En cuentas de usuario
- activar una cuenta ya activa
- resetear password con un token ya usado
- cambiar email sin confirmar el nuevo correo
- dar acceso total a una cuenta suspendida

### En aprobaciones internas
- aprobar un gasto ya rechazado
- rechazar una solicitud ya ejecutada
- editar un documento ya firmado
- reabrir algo cerrado sin privilegios especiales

### En soporte o administración
- borrar auditoría desde una entidad ya archivada
- reprocesar una operación ya conciliada
- volver a emitir credenciales sin invalidar las anteriores

Cada uno de esos casos refleja lo mismo:

- el actor puede existir
- el endpoint puede existir
- la request puede ser sintácticamente válida

pero la operación igual debería ser rechazada.

---

## El backend no debería permitir “saltos” arbitrarios

Si un recurso sigue un flujo, no conviene permitir que pase de cualquier estado a cualquier otro.

### Ejemplo inseguro

```java
order.setStatus(request.getStatus());
orderRepository.save(order);
```

Este patrón parece simple, pero es muy peligroso.

Porque permite que alguien intente mandar algo como:

```json
{
  "status": "DELIVERED"
}
```

sin haber pasado por:

- pago confirmado
- preparación
- despacho
- logística real

El problema acá no es solo técnico.
Es de diseño.

### Más sano

El backend debería exponer operaciones de negocio concretas:

- `confirmPayment()`
- `cancelOrder()`
- `markAsShipped()`
- `approveRefund()`

Y cada una debería validar:

- estado actual
- actor
- precondiciones
- efectos colaterales permitidos

Eso reduce muchísimo la chance de transiciones ilegales.

---

## No conviene modelar el estado como un campo libre de edición

Cuando el estado entra o sale del sistema como un dato demasiado editable, suelen aparecer problemas como:

- mass assignment
- flujos inconsistentes
- bypass de reglas del negocio
- endpoints genéricos que aceptan demasiado
- lógica repartida entre frontend y backend

### Señal de ruido

Si una entidad crítica admite algo como “actualizar cualquier campo”, hay que revisar con mucha atención si `status`, `approved`, `paid`, `verified`, `role`, `active` o campos similares están demasiado expuestos.

### Idea sana

Los estados más delicados no deberían cambiarse mediante un update genérico.
Deberían cambiarse mediante operaciones específicas, con reglas específicas.

---

## Dónde debería vivir esta validación

En general, las reglas de transición deberían vivir en el backend, cerca de la lógica del dominio.

Eso suele significar:

- en services
- en métodos del dominio si el diseño lo permite
- en reglas bien centralizadas

No conviene depender solo de:

- el controller
- validaciones del frontend
- checks dispersos en varios lugares
- convenciones informales que nadie fuerza realmente

### Por qué

Porque el controller puede verificar cosas básicas.
Pero la regla de negocio real suele depender de:

- estado actual del recurso
- datos relacionados
- actor que ejecuta
- momento del flujo
- recursos secundarios
- efectos previos ya ocurridos

Todo eso encaja mucho más en la capa de negocio que en la de entrada HTTP.

---

## Ejemplo conceptual en Spring

### Enfoque riesgoso

```java
public void updateOrderStatus(Long orderId, OrderStatus newStatus) {
    Order order = findOrder(orderId);
    order.setStatus(newStatus);
    orderRepository.save(order);
}
```

### Enfoque más sano

```java
public void cancelOrder(Long orderId, UserPrincipal actor) {
    Order order = findOrder(orderId);

    if (!order.canBeCancelledBy(actor)) {
        throw new BusinessRuleException("La orden no puede cancelarse en el estado actual");
    }

    order.cancel();
    orderRepository.save(order);
}
```

### Qué mejora

- no se acepta cualquier estado arbitrario
- la operación representa intención de negocio
- la transición se valida explícitamente
- el backend conserva control del ciclo de vida

---

## Estado válido no significa transición válida

Este punto es muy importante.

A veces un estado puede ser legítimo en sí mismo, pero la transición desde el estado actual no lo es.

Por ejemplo:

- `APPROVED` puede ser un estado válido
- `REJECTED` también puede ser válido

Pero quizá una solicitud no deba pasar de `REJECTED` a `APPROVED` sin reapertura formal.

Entonces no alcanza con validar:

- “¿el valor enviado pertenece al enum?”

También hay que validar:

- “¿el cambio desde este estado al nuevo está permitido?”

En resumen:

> validar el valor no es lo mismo que validar la transición.

---

## Estados terminales merecen especial atención

Un estado terminal es uno desde el cual, en condiciones normales, ya no debería haber nuevas transiciones.

Ejemplos:

- `CANCELLED`
- `DELIVERED`
- `EXPIRED`
- `REJECTED`
- `ARCHIVED`
- `DELETED`

Cuando el backend no trata estos estados con cuidado, aparecen cosas como:

- reaperturas accidentales
- ediciones que rompen auditoría
- doble procesamiento
- resurrección de recursos que debían quedar cerrados

### Pregunta útil

Cada vez que veas un estado terminal, preguntate:

- ¿realmente puede volver atrás?
- ¿quién podría hacerlo?
- ¿queda auditado?
- ¿hay casos excepcionales explícitos o se permite de forma implícita?

---

## No todas las transiciones son solo cuestión de estado

A veces el cambio depende además de otras condiciones.

Por ejemplo:

- una orden solo puede enviarse si está pagada **y** tiene stock reservado
- una devolución solo puede aprobarse si no fue liquidada antes
- una cuenta solo puede activarse si el email fue verificado
- una factura solo puede anularse antes del cierre contable

Eso muestra otra idea importante:

> la transición de estado rara vez depende de una sola variable.

Por eso, un buen modelado no debería reducir todo a:

- “si el nuevo enum es válido, guardar”

Sino a:

- “si esta acción tiene sentido en este contexto, recién entonces ejecutar la transición”

---

## Qué pasa si dos requests compiten

Este tema se conecta directamente con race conditions e idempotencia.

Aunque la transición esté bien pensada, si dos requests llegan casi al mismo tiempo pueden intentar:

- confirmar dos veces
- cancelar mientras otro flujo procesa
- reembolsar y cerrar al mismo tiempo
- aprobar y rechazar simultáneamente

Entonces no alcanza con decir:

- “yo validé el estado”

porque entre la validación y el guardado podría haber cambiado.

### Esto obliga a pensar también en

- transacciones
- locking cuando corresponda
- optimistic locking
- validación atómica
- relectura del estado real
- idempotencia en operaciones críticas

Una transición de negocio segura no es solo una regla conceptual.
También tiene que sostenerse bajo concurrencia.

---

## Qué errores conviene devolver

Cuando una transición no está permitida, conviene devolver un error claro pero controlado.

### Ejemplos razonables

- “La operación no es válida en el estado actual”
- “La orden ya no puede cancelarse”
- “El recurso ya fue procesado”
- “Debes refrescar el estado antes de reintentar”

### Qué conviene evitar

- mensajes internos demasiado técnicos
- exponer toda la máquina de estados si no hace falta
- detallar reglas sensibles que puedan ayudar a abuso
- devolver excepciones crudas

En general, estos escenarios suelen mapear bien a códigos como:

- `409 Conflict`
- `422 Unprocessable Entity`
- en algunos casos `400 Bad Request`

Lo importante es que haya consistencia.

---

## Cuidado con autorizar sin validar el estado

Un patrón peligroso es este:

- el usuario está autenticado
- tiene el permiso correcto
- es owner del recurso
- entonces la operación se ejecuta

Pero falta una cuarta validación:

- ¿el recurso está en una etapa donde esa operación corresponde?

Eso pasa mucho con acciones como:

- cancelar
- aprobar
- rechazar
- reenviar
- cerrar
- reabrir
- confirmar
- publicar
- archivar

La seguridad no está completa hasta que esa pregunta también se responde.

---

## La UI puede mostrar un flujo correcto y el backend igual estar mal

Esto es muy común.

La interfaz quizá:

- deshabilita botones
- muestra pasos en orden
- oculta acciones ilegales
- guía al usuario por el camino feliz

Pero un atacante, un script o incluso un bug del frontend puede invocar el endpoint igual.

Entonces la pregunta real no es:

- “¿la UI deja hacerlo?”

sino:

- “¿el backend lo impide aunque la UI falle?”

---

## Modelar bien reduce abuso funcional

Cuando el backend modela bien las transiciones:

- cuesta más saltear pasos
- cuesta más reintentar operaciones ya cerradas
- se evita reusar recursos fuera de contexto
- aparecen menos estados imposibles
- la auditoría tiene más sentido
- la lógica del dominio queda más clara

Esto mejora no solo la seguridad, sino también:

- mantenibilidad
- legibilidad
- testabilidad
- confiabilidad operativa

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- operaciones expresadas como acciones del negocio
- validación explícita del estado actual
- restricciones claras para estados terminales
- transiciones permitidas bien definidas
- poca edición libre de campos críticos
- reglas en service o dominio, no solo en frontend
- consistencia bajo concurrencia
- errores claros y controlados
- buena auditoría de cambios sensibles

---

## Señales de ruido

Estas cosas suelen indicar problemas:

- endpoints genéricos que aceptan cualquier `status`
- `PATCH` o `PUT` demasiado amplios en recursos críticos
- cambios de estado hechos desde DTOs masivos
- lógica distinta según cada pantalla
- validaciones repetidas y dispersas
- estados terminales que igual se pueden editar
- “si el rol alcanza, ya está”
- ausencia total de chequeo del estado actual
- transiciones que solo existen como convención humana

---

## Checklist práctico

Cuando revises un endpoint o servicio que modifica un recurso, preguntate:

- ¿qué estados puede tener este recurso?
- ¿qué transiciones son válidas?
- ¿cuáles deberían estar prohibidas?
- ¿hay estados terminales?
- ¿la operación valida el estado actual antes de actuar?
- ¿se puede saltar de un estado a otro sin pasar por pasos previos?
- ¿la transición depende también de otras precondiciones?
- ¿la UI impone la regla o el backend la impone de verdad?
- ¿hay concurrencia que pueda romper la validación?
- ¿el error devuelto es claro pero prudente?
- ¿el cambio queda auditado?

---

## Mini ejercicio de reflexión

Pensá en una entidad real o imaginaria de tu sistema:

- orden
- pago
- envío
- ticket
- cuenta
- solicitud

Y respondé:

1. ¿Qué estados tiene?
2. ¿Cuáles son iniciales, intermedios y terminales?
3. ¿Qué transiciones deberían existir?
4. ¿Cuáles nunca deberían permitirse?
5. ¿Quién puede ejecutar cada transición?
6. ¿Qué condiciones previas hacen falta?
7. ¿Qué pasa si llegan dos requests al mismo tiempo?
8. ¿Hoy el backend lo controla o solo lo sugiere la UI?

Ese ejercicio suele revelar muy rápido huecos de diseño que no se ven mirando solo autenticación y roles.

---

## Resumen

Muchos problemas serios no nacen porque alguien “rompió” una barrera técnica, sino porque el backend dejó avanzar el negocio por un camino que nunca debió existir.

Por eso, revisar seguridad también implica revisar:

- estados del dominio
- transiciones permitidas
- estados terminales
- precondiciones reales
- consistencia bajo concurrencia
- operaciones específicas en lugar de updates genéricos

En resumen:

> un backend más sólido no solo valida quién sos y qué permiso tenés. También valida si esta acción tiene sentido ahora, sobre este recurso y en este punto del flujo.

---

## Próximo tema

**Operaciones administrativas peligrosas**
