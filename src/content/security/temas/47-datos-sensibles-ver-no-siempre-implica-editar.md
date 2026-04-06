---
title: "Datos sensibles: ver no siempre implica editar"
description: "Cómo distinguir lectura, edición y exposición parcial de datos sensibles en una aplicación Java con Spring Boot y Spring Security. Por qué ver un recurso no significa poder modificarlo ni ver todos sus campos, y cómo modelar mejor esa separación en backend."
order: 47
module: "Autorización"
level: "base"
draft: false
---

# Datos sensibles: ver no siempre implica editar

## Objetivo del tema

Entender por qué, en una aplicación Java + Spring Boot + Spring Security, permitir que un actor **vea** un recurso no significa automáticamente que también deba poder:

- editarlo
- borrar partes
- cambiar su estado
- exportarlo
- ver todos sus campos
- ver su versión interna o completa

Este tema importa mucho porque muchas apps tratan el acceso a los datos de forma demasiado binaria:

- o puede acceder
- o no puede acceder

Pero en backend real, la autorización suele ser mucho más fina.

A veces alguien puede:

- ver parcialmente
- ver sin editar
- editar solo algunos campos
- ver un resumen, pero no el detalle completo
- ver el recurso, pero no ciertos metadatos internos
- exportar menos de lo que puede consultar en pantalla

En resumen:

> acceso a un recurso no significa acceso uniforme a todas las acciones ni a todos los datos de ese recurso.

---

## Idea clave

La autorización no debería decidirse solo a nivel de:

- endpoint completo
- recurso completo
- actor sí o no

También puede necesitar decidir:

- qué campos ve
- qué campos modifica
- qué acciones ejecuta
- qué versión del recurso obtiene
- qué profundidad de acceso tiene

En resumen:

> “puede ver” no equivale a “puede editar”,  
> y “puede editar algo” tampoco equivale a “puede tocar cualquier campo”.

Esta distinción es crucial para proteger datos sensibles y para evitar sobreacceso accidental o abuso funcional.

---

## Qué problema intenta resolver este tema

Este tema intenta evitar patrones como:

- si puede leer el usuario, también puede editarlo
- si puede abrir el recurso, también puede descargarlo completo
- si puede ver la orden, puede ver todas las notas internas
- si puede editar el perfil, puede cambiar campos sensibles
- si puede actualizar el objeto, puede tocar cualquier propiedad
- si el admin puede consultar, entonces también puede exportar masivamente
- si soporte puede ver, entonces también puede modificar estados

En otras palabras:

> el problema aparece cuando el backend no distingue bien entre tipos de acceso sobre el mismo recurso.

---

## Qué significa “dato sensible” en este contexto

No hace falta que sea un secreto extremo para que un dato sea sensible en autorización.

Puede ser sensible porque:

- revela demasiado del negocio
- afecta privacidad
- afecta fraude
- habilita abuso
- cambia estados importantes
- expone información interna
- tiene impacto operativo o financiero
- no corresponde al actor aunque vea el recurso general

### Ejemplos

- notas internas
- flags de fraude
- costo interno
- margen
- email real de contacto
- teléfono completo
- documento fiscal
- historial de auditoría
- estado interno de moderación
- role/permissions
- tenantId o ownerId
- refund metadata
- datos de integración
- trazas operativas

---

## Error mental clásico

Muchos sistemas piensan algo como:

- “si puede abrir la orden, puede ver todo lo de la orden”
- “si puede editar el perfil, puede editar cualquier campo”
- “si soporte puede ver clientes, puede ver todos los detalles”
- “si admin puede leer, puede exportar”
- “si el frontend no muestra los campos sensibles, no pasa nada”

Eso suele ser falso.

Porque siguen faltando preguntas como:

- ¿qué parte del recurso debería ver realmente?
- ¿qué parte es solo interna?
- ¿qué acción concreta se intenta?
- ¿qué campos son editables por este actor?
- ¿hay campos visibles pero no exportables?
- ¿hay campos visibles solo para ciertos roles o scopes?

---

## Ver, editar y exportar son permisos distintos

Esto conviene separarlo muy bien.

### Ver
Implica que el actor puede obtener cierta representación del recurso.

### Editar
Implica que el actor puede modificar alguna parte del recurso.

### Exportar
Implica que el actor puede extraer información fuera del flujo interactivo normal, muchas veces con más impacto.

### Borrar o cambiar estado
Implica otro nivel de capacidad todavía.

### Idea importante

No conviene asumir que estas capacidades viajan juntas.

---

## Ejemplo simple: perfil de usuario

Supongamos un perfil con datos como:

- nombre
- email
- teléfono
- rol
- enabled
- flags internos
- notas de soporte

### Usuario dueño del perfil
Podría:
- ver nombre y email
- editar nombre
- quizá cambiar password
- quizá cambiar teléfono

Pero no necesariamente:
- ver sus flags internos
- cambiar su rol
- habilitarse/deshabilitarse
- editar notas de soporte
- ver historial de auditoría

Entonces el backend no debería tratar “mi perfil” como un recurso homogéneo donde todo es igualmente visible y editable.

---

## Ejemplo: orden con datos internos

Supongamos una orden con:

- subtotal
- total
- items
- shipping address
- customer note
- internal note
- fraud flag
- review status
- refund metadata

### Usuario cliente
Podría:
- ver items
- ver total
- ver dirección
- ver su propia nota

Pero no necesariamente:
- ver nota interna
- ver fraud flag
- ver review status interno
- ver metadata operativa de refund

### Soporte
Podría:
- ver más que el usuario
- ver nota interna
- quizás agregar una nota

Pero no necesariamente:
- cambiar refund metadata
- borrar flags internos
- editar monto
- cambiar owner

Esto muestra muy bien que la autorización no solo decide “puede ver la orden”.
También decide **qué parte de la orden** puede ver o modificar.

---

## La respuesta del backend también es autorización

Este punto es muy importante.

Mucha gente piensa autorización solo como:

- dejar entrar o no a un endpoint

Pero el backend también autoriza cuando decide:

- qué DTO devolver
- qué campos incluir
- qué versión del recurso exponer
- qué colecciones adjuntar
- qué datos internos ocultar

En resumen:

> elegir la forma de la respuesta también es parte de la seguridad.

No todo recurso debería serializarse igual para todos los actores.

---

## DTOs distintos según visibilidad

Una forma muy sana de modelar esto es usar DTOs distintos según actor o contexto.

### Ejemplo

- `OrderResponse`
- `SupportOrderResponse`
- `AdminOrderResponse`

o:

- `UserProfileResponse`
- `AdminUserResponse`

No porque quieras complicar por deporte, sino porque distintos actores pueden necesitar ver cosas distintas.

### Qué mejora esto

- evita exponer campos de más
- deja más claro qué ve cada actor
- reduce riesgo de “ya que estaba devolví toda la entidad”
- separa mejor visibilidad externa de estructura interna

---

## Ejemplo riesgoso: devolver entidad completa

```java
@GetMapping("/orders/{id}")
public Order getOrder(@PathVariable Long id) {
    return orderRepository.findById(id).orElseThrow();
}
```

### Problemas

- expone estructura interna
- puede incluir campos sensibles sin querer
- mezcla persistencia con contrato externo
- dificulta separar visibilidad por actor
- hace más fácil que “ver una orden” implique ver demasiado

### Mucho más sano

Usar mapping explícito a DTOs según contexto.

---

## Ver no implica editar

Otra fuente muy común de sobreacceso aparece cuando el sistema asume que si alguien puede leer un recurso, entonces también puede actualizarlo.

### Ejemplo

```java
@PreAuthorize("hasAuthority('customer:read')")
@PatchMapping("/customers/{id}")
public CustomerResponse update(@PathVariable Long id, @RequestBody UpdateCustomerRequest request) {
    return customerService.update(id, request);
}
```

### Problema

El permiso usado para leer no alcanza necesariamente para editar.

Leer y editar son capacidades distintas.
Incluso dentro de edición, puede haber:

- edición de datos básicos
- edición de contacto
- edición de estado
- edición administrativa
- edición de campos internos

Todo eso merece separación.

---

## Editar no implica editar cualquier campo

Este punto es importantísimo.

Supongamos:

```java
public class UpdateCustomerRequest {
    private String name;
    private String email;
    private String status;
    private String internalRiskLevel;
    private Long ownerId;
}
```

Aunque el actor tenga permiso de editar ciertos datos del cliente, no necesariamente debería poder modificar:

- `status`
- `internalRiskLevel`
- `ownerId`

### Problema clásico

Se define un endpoint “editar cliente” y se mete todo junto.

### Más sano

Separar por intención:

- `UpdateCustomerBasicInfoRequest`
- `ChangeCustomerStatusRequest`
- `ReassignCustomerOwnerRequest`

Cada uno con su autorización específica.

---

## Exportar no debería darse por sentado

La exportación suele ser más sensible que la lectura interactiva normal.

### ¿Por qué?

Porque exportar permite:

- sacar volumen
- persistir datos fuera del sistema
- compartirlos
- analizarlos fuera del contexto normal
- generar más impacto de filtración

Entonces alguien podría:

- ver una lista en pantalla
- pero no necesariamente exportarla completa

O podría:
- ver ciertos campos en pantalla
- pero no exportar los más sensibles

Esto se modela mucho mejor si “ver” y “exportar” no se tratan como la misma capacidad.

---

## Ejemplo: soporte con acceso parcial

Supongamos una cuenta de soporte.

Puede:
- ver órdenes
- ver ciertos datos del cliente
- agregar una nota interna

Pero no debería:
- ver documento fiscal completo
- exportar datos financieros en masa
- cambiar fraud flags
- reasignar ownership
- tocar refund metadata crítica

Si el backend colapsa todo en “support can view order”, termina dando demasiado.

---

## Qué papel juegan los mappers y DTOs

Muchísimo.

Un mapper o ensamblador de respuesta puede convertirse en una pieza importante para autorización fina de lectura.

No porque deba decidirlo todo solo, sino porque ayuda a materializar decisiones como:

- qué campos se incluyen
- qué campos se ocultan
- qué representación corresponde para este actor
- si hace falta una versión resumida o extendida

### Ejemplo mental sano

- service decide nivel de acceso
- mapper devuelve DTO acorde a ese nivel

Eso es mucho más seguro que devolver una entidad cruda o un DTO único universal.

---

## Qué papel juegan los services en edición fina

También en modificación el service es clave para separar:

- qué campos son editables
- por quién
- en qué estado
- sobre qué recurso
- con qué contexto

No conviene dejar que esto lo decida solo:

- el frontend
- el shape del formulario
- el hecho de que “ese campo vino en el JSON”

El backend debe mapear explícitamente qué acepta cambiar en cada caso.

---

## Ejemplo sano: perfil propio

### DTO de lectura

```java
public class UserProfileResponse {
    private String name;
    private String email;
    private String phone;
}
```

### DTO de actualización

```java
public class UpdateProfileRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 30)
    private String phone;
}
```

### Qué queda fuera

- role
- enabled
- internal flags
- audit notes
- risk markers

Eso muestra que:
- ver el perfil no implica ver todo
- editar el perfil no implica tocar cualquier campo

---

## Ejemplo sano: orden para cliente vs soporte

### Cliente

```java
public class OrderResponse {
    private Long id;
    private BigDecimal total;
    private String status;
    private List<OrderItemResponse> items;
}
```

### Soporte

```java
public class SupportOrderResponse {
    private Long id;
    private BigDecimal total;
    private String status;
    private List<OrderItemResponse> items;
    private String internalNote;
}
```

### Aún así soporte podría no ver

- fraud signals completas
- refund controls avanzados
- pricing internals
- auditoría completa

Eso muestra que ni siquiera “soporte ve más” significa “soporte ve todo”.

---

## Qué relación tiene esto con mass assignment

Muchísima.

Si el backend no separa bien qué campos son editables, el sistema puede aceptar cambios de más “porque total la UI no los manda”.

Ahí aparecen huecos como:

- `role`
- `enabled`
- `ownerId`
- `status`
- `approved`
- `visibility`
- `internalRiskLevel`

Por eso distinguir “puede editar algo” de “puede editar este campo” es clave tanto para autorización como para defensa contra mass assignment.

---

## Qué relación tiene esto con privacidad y minimización

También importa mucho desde privacidad.

Porque a veces el problema no es que un actor vea un recurso completamente ajeno.
A veces el problema es que ve demasiado detalle sobre un recurso que sí puede consultar parcialmente.

### Ejemplo

Puede ser legítimo que soporte vea una orden.
Pero no que vea:
- datos completos de documento
- información de pago innecesaria
- metadata sensible interna
- notas privadas de otro flujo

Por eso “mínima visibilidad necesaria” también es una muy buena regla de autorización.

---

## Qué señales muestran que la app está dando demasiado

Estas cosas suelen hacer ruido rápido:

- entidades expuestas directo
- un solo DTO universal para todos los actores
- permisos de lectura usados también para edición
- endpoints de update que aceptan campos internos
- exportación dada por sentada a cualquier actor que puede listar
- soporte o admin viendo demasiados campos por default
- falta de distinción entre lectura parcial y lectura completa
- nadie puede explicar qué campos ve exactamente cada tipo de actor

---

## Qué gana el backend si modela esto bien

Cuando el backend separa mejor lectura, edición y visibilidad parcial, gana:

- menos sobreacceso
- menos exposición de datos internos
- menos mass assignment
- mejor privacidad
- mejor separación de funciones
- respuestas más alineadas con el negocio real
- menor daño ante cuentas comprometidas o mal usadas

No es solo prolijidad de DTOs.
Es seguridad concreta.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- permisos separados para leer, editar, exportar y administrar
- DTOs distintos según contexto
- servicios que deciden campos editables reales
- mappers explícitos
- menos entidades devueltas directo
- campos internos fuera del request externo
- soporte y admin con visibilidad no universal por defecto

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- “si puede ver, puede editar”
- “si puede abrir, puede exportar”
- un solo DTO para todo
- update genérico con campos sensibles mezclados
- entidades retornadas directo
- lógica de visibilidad solo en frontend
- endpoints que devuelven demasiado detalle “porque ya estaba en el objeto”

---

## Checklist práctico

Cuando revises autorización sobre datos sensibles en una app Spring, preguntate:

- ¿qué puede ver este actor exactamente?
- ¿qué no debería ver?
- ¿qué puede editar?
- ¿qué campos no debería tocar?
- ¿ver implica exportar?
- ¿el DTO está separado por actor o contexto?
- ¿se está devolviendo una entidad cruda?
- ¿el request acepta más campos de los que debería?
- ¿la UI está ocultando cosas que el backend igual aceptaría o devolvería?
- ¿el equipo distingue bien entre lectura parcial, lectura completa, edición y exportación?

---

## Mini ejercicio de reflexión

Tomá tres recursos reales de tu backend y respondé:

1. ¿Quién puede verlos?
2. ¿Qué parte puede ver cada actor?
3. ¿Quién puede editarlos?
4. ¿Qué campos puede editar cada actor?
5. ¿Quién puede exportarlos?
6. ¿Qué campos no deberían salir nunca a ciertos actores?
7. ¿Qué respuesta o DTO hoy está devolviendo más de lo necesario?

Ese ejercicio ayuda muchísimo a detectar sobreacceso que no siempre se ve como “vulnerabilidad obvia”, pero que sí expone demasiado.

---

## Resumen

En autorización real:

- ver no significa editar
- editar no significa editar cualquier campo
- ver no significa ver todo
- ver no significa exportar
- tener acceso al recurso no significa acceso uniforme a toda su representación

En resumen:

> Un backend más maduro no trata los recursos como bloques indivisibles de acceso.  
> Distingue mejor entre lectura, edición, exportación y visibilidad parcial para que cada actor vea y toque solo lo que realmente le corresponde.

---

## Próximo tema

**Cómo pensar autorización en operaciones críticas**
