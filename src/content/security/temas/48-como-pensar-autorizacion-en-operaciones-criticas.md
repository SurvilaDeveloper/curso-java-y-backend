---
title: "Cómo pensar autorización en operaciones críticas"
description: "Cómo diseñar autorización para operaciones críticas en una aplicación Java con Spring Boot y Spring Security. Qué hace que una acción sea especialmente sensible, por qué no alcanza con un rol general y cómo agregar más control, contexto y trazabilidad sin volver el sistema inmanejable."
order: 48
module: "Autorización"
level: "base"
draft: false
---

# Cómo pensar autorización en operaciones críticas

## Objetivo del tema

Entender cómo modelar y reforzar la autorización en **operaciones críticas** dentro de una aplicación Java + Spring Boot + Spring Security.

Este tema importa mucho porque no todas las acciones del sistema tienen el mismo impacto.

No es lo mismo:

- ver una lista
- editar un nombre
- agregar una nota
- cambiar un estado financiero
- reembolsar dinero
- resetear MFA
- cambiar roles
- exportar datos masivos
- borrar definitivamente
- impersonar a otro usuario
- deshabilitar una cuenta

Y sin embargo, muchos backends terminan protegiendo todo con el mismo criterio grueso:

- “si es admin, puede”
- “si tiene tal authority, puede”
- “si el endpoint está autenticado, ya está”
- “si soporte lo necesita, que lo haga”

Eso suele ser insuficiente.

En resumen:

> una operación crítica necesita una autorización más pensada que una operación común, porque el daño potencial de un error, abuso o compromiso también es mucho mayor.

---

## Idea clave

Una operación crítica no debería evaluarse solo con una pregunta simple como:

- “¿tiene permiso general?”

Suele necesitar una evaluación más rica que incluya:

- actor
- recurso
- acción
- tenant o scope
- estado del recurso
- contexto actual
- trazabilidad
- a veces fricción adicional

En resumen:

> cuanto más sensible es una acción, menos conviene resolverla con una autorización gruesa y automática.

---

## Qué entendemos por operación crítica

Una operación crítica es una acción cuyo impacto puede ser alto desde el punto de vista:

- financiero
- operativo
- de privacidad
- de seguridad
- de integridad del negocio
- de cumplimiento o auditoría
- de soporte o continuidad del sistema

### Ejemplos típicos

- reembolsar
- cambiar rol
- deshabilitar usuario
- resetear contraseña o MFA
- exportar datos masivos
- borrar definitivamente
- cambiar owner
- aprobar o rechazar en workflows sensibles
- publicar algo irreversible
- tocar configuraciones de seguridad
- impersonación o acceso delegado
- revelar datos internos o altamente sensibles

No todas las apps tendrán las mismas.
Pero toda app real suele tener algunas.

---

## Error mental clásico

Muchos sistemas tratan una operación crítica igual que cualquier otra:

- mismo tipo de endpoint
- misma lógica de acceso gruesa
- mismo rol admin
- misma ausencia de trazabilidad
- misma falta de fricción
- misma confianza en el actor interno

Eso suele producir varios problemas:

- sobreacceso
- acciones demasiado fáciles de ejecutar
- escasa capacidad de investigar después
- errores humanos con mucho impacto
- cuentas comprometidas con demasiado poder inmediato
- flujos sensibles sin distinción real

---

## Qué hace que una acción sea más crítica que otra

Una forma útil de pensarlo es preguntar:

- ¿esta acción mueve dinero?
- ¿esta acción cambia privilegios?
- ¿esta acción expone o extrae datos sensibles?
- ¿esta acción es irreversible o casi irreversible?
- ¿esta acción puede afectar a muchos usuarios o recursos a la vez?
- ¿esta acción puede romper evidencia o trazabilidad?
- ¿esta acción puede usarse para tomar control de una cuenta?
- ¿esta acción cambia el estado de confianza del sistema?

Si varias respuestas son sí, probablemente sea una operación crítica.

---

## No toda autorización debe tener el mismo nivel de rigor

Una acción común puede necesitar:

- autenticación
- permiso general
- validación de recurso

Una acción crítica puede necesitar además:

- permiso fino
- tenant/scope estricto
- validación de estado
- razón o comentario obligatorio
- auditoría reforzada
- reautenticación o MFA reciente
- revisión adicional
- endpoint separado
- política más restrictiva de quién puede ejecutarla

En resumen:

> no todas las operaciones deberían tener la misma fricción ni el mismo modelo de autorización.

---

## Ejemplo clásico: refund

Supongamos un endpoint así:

```java
@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/orders/{id}/refund")
public ResponseEntity<Void> refund(@PathVariable Long id) {
    orderService.refund(id);
    return ResponseEntity.noContent().build();
}
```

A simple vista parece razonable.

Pero faltan varias preguntas:

- ¿admin de qué tenant?
- ¿cualquier admin puede reembolsar?
- ¿la orden está en estado reembolsable?
- ¿ya fue reembolsada?
- ¿se exige motivo?
- ¿hay tope de monto?
- ¿debería quedar trazabilidad reforzada?
- ¿soporte tiene el mismo alcance que finanzas?
- ¿esta operación debería requerir un permiso más fino que admin genérico?

Este es un ejemplo perfecto de operación crítica tratada con demasiada simpleza.

---

## Ejemplo mejor: autorización más rica

### Controller

```java
@PreAuthorize("hasAuthority('order:refund')")
@PostMapping("/orders/{id}/refund")
public ResponseEntity<Void> refund(
        @PathVariable Long id,
        @Valid @RequestBody RefundRequest request,
        Authentication authentication) {
    orderService.refund(id, request, authentication.getName());
    return ResponseEntity.noContent().build();
}
```

### Service

```java
public void refund(Long orderId, RefundRequest request, String username) {
    User actor = userRepository.findByEmail(username).orElseThrow();
    Order order = orderRepository.findById(orderId).orElseThrow();

    if (!actor.canAccessTenant(order.getTenantId())) {
        throw new AccessDeniedException("No autorizado");
    }

    if (!order.canBeRefunded()) {
        throw new IllegalStateException("La orden no puede reembolsarse");
    }

    if (!refundPolicy.canRefund(actor, order, request.getReason())) {
        throw new AccessDeniedException("No autorizado");
    }

    order.refund(request.getReason());
    orderRepository.save(order);

    auditService.recordRefund(actor.getId(), order.getId(), request.getReason());
}
```

### Qué mejora esto

- permiso fino
- tenant/scope real
- estado del recurso
- política de negocio específica
- trazabilidad

Eso ya se parece mucho más a una operación crítica bien tratada.

---

## Las operaciones críticas merecen permisos más finos

Este es uno de los aprendizajes más importantes.

No conviene esconder acciones críticas detrás de roles demasiado gruesos como:

- `ADMIN`
- `SUPPORT`
- `MANAGER`

Suele ser mucho más sano tener permisos más concretos como:

- `order:refund`
- `user:change-role`
- `user:disable`
- `security:reset-mfa`
- `customer:export`
- `audit:view-sensitive`
- `config:update-security`

Eso deja más claro:

- quién puede qué
- qué acción es realmente sensible
- qué capacidades no deberían viajar juntas

---

## Operación crítica no significa “solo admin”

Otro error frecuente es pensar que toda operación crítica debe caer simplemente en admin.

A veces conviene distinguir funciones como:

- soporte
- finanzas
- compliance
- seguridad
- operaciones
- admin local
- admin global

### Ejemplo

Reembolsar no tiene por qué ser exactamente la misma capacidad que:

- cambiar roles
- resetear MFA
- exportar auditoría
- deshabilitar usuarios

Separarlas reduce muchísimo el sobreacceso.

---

## El recurso y su estado siguen importando

Aunque la acción sea crítica, no alcanza con el permiso general.

### Ejemplo

Tener `order:refund` no alcanza si:

- la orden es de otro tenant
- ya fue reembolsada
- está en revisión interna
- el monto supera cierta política
- la operación ya no corresponde por workflow

Esto refuerza una idea central del módulo:

- actor
- recurso
- tenant
- estado
- acción

siguen siendo las piezas base, incluso más aún en acciones críticas.

---

## A veces conviene exigir razón o contexto explícito

En operaciones comunes, puede no hacer falta.

En operaciones críticas, a veces tiene mucho sentido pedir:

- motivo
- comentario
- ticket de referencia
- justificación mínima
- contexto del cambio

### Ejemplo

```java
public class DisableUserRequest {

    @NotBlank
    @Size(max = 300)
    private String reason;
}
```

Eso no reemplaza autorización, pero mejora mucho:

- trazabilidad
- revisión posterior
- disciplina operativa
- costo del abuso casual

Porque hace más visible que la acción no es trivial.

---

## La trazabilidad importa más en operaciones críticas

Cuanto más sensible es una acción, más importante suele ser registrar:

- quién la hizo
- sobre qué recurso
- en qué tenant
- cuándo
- con qué motivo
- qué cambió exactamente
- desde qué contexto

### Ejemplos de eventos a registrar

- refund ejecutado
- rol cambiado
- cuenta deshabilitada
- MFA reseteado
- exportación masiva
- borrado definitivo
- impersonación iniciada
- setting crítico modificado

Sin esta trazabilidad, las operaciones críticas quedan demasiado opacas.

---

## Reautenticación o MFA reciente

No todas las apps lo necesitan para todo.
Pero hay operaciones donde puede tener mucho sentido pedir una señal de confianza reciente, por ejemplo:

- reingresar password
- exigir sesión fresca
- exigir MFA reciente
- requerir challenge adicional

### Casos donde puede aportar

- cambio de password
- cambio de email
- exportación muy sensible
- reset de MFA
- cambio de rol
- operaciones financieras delicadas

La idea no es meter fricción por deporte.
La idea es que algunas acciones merecen una confirmación más fuerte.

---

## Endpoint separado vs update genérico

Las operaciones críticas suelen modelarse mejor como acciones explícitas que como updates genéricos.

### Más riesgoso

```java
@PatchMapping("/users/{id}")
public UserResponse update(@PathVariable Long id, @RequestBody UpdateUserRequest request)
```

si `UpdateUserRequest` puede tocar cosas como:

- role
- enabled
- status
- ownerId

### Más sano

- `/users/{id}/disable`
- `/users/{id}/change-role`
- `/orders/{id}/refund`
- `/users/{id}/reset-mfa`

Eso mejora muchísimo:

- claridad
- autorización
- trazabilidad
- validación de estado
- separación de responsabilidades

---

## Operaciones críticas y blast radius

Otra pregunta muy útil es:

- ¿qué daño produce esta acción si la ejecuta la persona equivocada o la cuenta equivocada?

Si el blast radius es alto, conviene endurecer más el modelo.

### Ejemplos de blast radius alto

- exportar miles de registros
- deshabilitar usuarios en masa
- resetear MFA de cuentas privilegiadas
- reembolsar montos altos
- cambiar configuración global
- revocar seguridad o auditoría

Esto ayuda a decidir mejor dónde poner más control y menos automatismo.

---

## Qué hacer con acciones irreversibles o casi irreversibles

Cuando la acción es muy difícil de deshacer, conviene ser todavía más cuidadoso.

### Ejemplos

- borrado definitivo
- purga de logs
- cierre irreversible de cuenta
- anulación de datos
- revocación crítica de acceso
- cambios de configuración de seguridad

En esos casos puede tener sentido sumar capas como:

- confirmación explícita
- permiso fino
- motivo obligatorio
- trazabilidad reforzada
- segunda revisión en algunos contextos
- endpoint separado

No porque la app quiera “molestar”.
Sino porque el costo de error es mucho mayor.

---

## Operaciones internas no son automáticamente seguras

Otra trampa frecuente es pensar:

- “esto solo lo usa soporte”
- “esto solo está en backoffice”
- “esto solo lo toca gente interna”
- “esto es una herramienta admin”

Eso no elimina la necesidad de modelar autorización fina.

De hecho, muchas operaciones críticas viven justamente en tooling interno.
Y por eso necesitan más cuidado, no menos.

---

## Qué relación tiene esto con separación de funciones

Separar funciones ayuda muchísimo a que operaciones críticas no queden concentradas en una sola identidad.

### Ejemplo

No necesariamente conviene que la misma cuenta pueda:

- reembolsar
- cambiar roles
- resetear MFA
- exportar datos masivos
- borrar auditoría

Concentrar demasiadas capacidades críticas en una sola identidad vuelve el sistema mucho más frágil.

---

## Qué relación tiene esto con admin

Este tema conecta directamente con el anterior:

- admin no debería significar acceso ilimitado

Las operaciones críticas son justamente donde más conviene no apoyarse solo en:

```java
hasRole('ADMIN')
```

porque ahí se acumula poder sin suficiente modelado.

---

## Qué señales muestran que una operación crítica está floja

Estas cosas suelen hacer mucho ruido:

- protegida solo con `ADMIN`
- sin permiso fino
- sin validar tenant/scope
- sin validar estado del recurso
- sin trazabilidad
- sin motivo en acciones delicadas
- modelada como update genérico
- sin separación de funciones
- sin distinguir lectura de exportación o cambio
- nadie puede explicar por qué esa acción está tan abierta

---

## Qué gana el backend si piensa mejor estas operaciones

Cuando el backend modela mejor las operaciones críticas, gana:

- menos sobreacceso
- menos blast radius
- mejor auditoría
- mejor separación de funciones
- menos errores humanos graves
- mejor respuesta a incidentes
- más claridad sobre qué acciones merecen más control

No es complejidad gratuita.
Es seguridad donde el impacto lo justifica.

---

## Ejemplo: cambio de rol

### Modelo tosco

```java
@PreAuthorize("hasRole('ADMIN')")
@PatchMapping("/users/{id}/role")
public ResponseEntity<Void> changeRole(@PathVariable Long id, @RequestBody ChangeRoleRequest request) {
    userService.changeRole(id, request);
    return ResponseEntity.noContent().build();
}
```

### Modelo más sano

```java
@PreAuthorize("hasAuthority('user:change-role')")
@PatchMapping("/users/{id}/role")
public ResponseEntity<Void> changeRole(
        @PathVariable Long id,
        @Valid @RequestBody ChangeRoleRequest request,
        Authentication authentication) {
    userService.changeRole(id, request, authentication.getName());
    return ResponseEntity.noContent().build();
}
```

Y en service todavía validar:

- tenant
- jerarquía
- si el actor puede asignar ese rol
- si el objetivo pertenece a su alcance
- auditoría del cambio

Eso ya refleja mucho mejor que se trata de una operación crítica.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- permisos finos para acciones críticas
- endpoints explícitos
- validación de actor + recurso + estado + tenant
- trazabilidad reforzada
- a veces razón obligatoria
- menos dependencia de roles gruesos
- separación de funciones
- más claridad sobre qué acciones merecen control adicional

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- toda excepción cae en admin
- acciones críticas mezcladas en updates genéricos
- sin auditoría
- sin validar estado o alcance
- soporte con capacidades demasiado amplias
- exportaciones masivas tratadas como simple lectura
- acciones irreversibles sin fricción ni motivo
- demasiada confianza en actores internos

---

## Checklist práctico

Cuando revises operaciones críticas en una app Spring, preguntate:

- ¿qué hace que esta operación sea sensible?
- ¿qué daño produciría si se usa mal?
- ¿qué permiso fino debería exigir?
- ¿importa tenant o scope?
- ¿importa el estado del recurso?
- ¿requiere motivo o trazabilidad reforzada?
- ¿debería modelarse como endpoint separado?
- ¿requiere fricción adicional?
- ¿está demasiado concentrada en admin?
- ¿el equipo puede explicar claramente por qué esta acción está protegida así y no de otra manera?

---

## Mini ejercicio de reflexión

Tomá cinco operaciones sensibles de tu backend y respondé:

1. ¿Por qué son críticas?
2. ¿Quién puede ejecutarlas hoy?
3. ¿Qué permiso fino deberían requerir?
4. ¿Qué estado del recurso importa?
5. ¿Qué tenant o scope importa?
6. ¿Dejan trazabilidad suficiente?
7. ¿Requieren razón, MFA reciente o alguna confirmación extra?
8. ¿Cuál de esas cinco está hoy más abierta de lo que debería?

Ese ejercicio ayuda muchísimo a dejar de tratar todas las acciones importantes igual y empezar a concentrar rigor donde realmente hace falta.

---

## Resumen

Las operaciones críticas merecen una autorización más rica que una acción común.

Suele importar más cuidadosamente:

- actor
- permiso fino
- recurso
- tenant/scope
- estado
- trazabilidad
- separación de funciones
- a veces fricción adicional

En resumen:

> Un backend más maduro no protege una acción delicada igual que cualquier otra.  
> Reconoce su impacto, reduce el sobreacceso y diseña la autorización con más contexto, más control y más capacidad de investigación posterior.

---

## Próximo tema

**Rate limiting y abuso desde backend**
