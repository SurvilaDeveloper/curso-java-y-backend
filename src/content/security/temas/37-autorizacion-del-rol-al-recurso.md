---
title: "Autorización: del rol al recurso"
description: "Cómo pasar de una autorización pensada solo en roles a una autorización centrada en recursos, contexto y reglas reales de negocio en una aplicación Java con Spring Boot y Spring Security."
order: 37
module: "Autorización"
level: "base"
draft: false
---

# Autorización: del rol al recurso

## Objetivo del tema

Entender por qué una aplicación Java + Spring Boot + Spring Security no debería quedarse en una autorización pensada solo como:

- “si tiene rol, entra”
- “si está autenticado, puede usarlo”
- “si es admin, ve todo”
- “si es user, ve lo suyo”

La idea de este tema es empezar a mover la mirada desde una autorización basada únicamente en **roles generales** hacia una autorización basada también en:

- recurso
- ownership
- contexto
- estado
- acción concreta
- reglas reales del negocio

Porque en backend real, una gran parte de los fallos no aparece por ausencia total de autorización, sino por una autorización **demasiado gruesa**.

---

## Idea clave

Autenticar responde:

- **quién es el actor**

Autorizar responde:

- **qué puede hacer ese actor**
- **sobre qué recurso**
- **en qué contexto**
- **bajo qué condiciones**

En resumen:

> Un rol general rara vez alcanza por sí solo para decidir acceso real sobre recursos concretos.

Tener `ROLE_USER` o `ROLE_ADMIN` puede ser parte de la respuesta, pero casi nunca debería ser toda la respuesta.

---

## Qué significa “pasar del rol al recurso”

Significa dejar de pensar la autorización solo como:

- “tiene tal rol”
- “no tiene tal rol”

y empezar a pensarla también como:

- “¿este recurso le pertenece?”
- “¿puede tocar este recurso específico?”
- “¿puede hacerlo en este estado?”
- “¿puede ver todos los campos o solo algunos?”
- “¿puede ejecutar esta transición ahora?”
- “¿su rol alcanza o además hace falta ownership o contexto?”

Eso vuelve al backend mucho menos ingenuo.

---

## Error mental clásico

Muchísimas apps caen en algo como esto:

```java
@PreAuthorize("hasRole('USER')")
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id) {
    return orderService.getById(id);
}
```

Y el equipo piensa:

- “ya está protegido”
- “solo usuarios logueados pueden entrar”
- “tiene rol USER, entonces puede usar ese endpoint”

Pero eso no responde la pregunta importante:

- ¿puede ver **esa** orden?

Porque una autorización real sobre recursos debería preguntarse:

- ¿esa orden le pertenece?
- ¿es de su tenant?
- ¿es soporte con alcance válido?
- ¿está en un estado visible para ese actor?
- ¿hay campos que no debería ver?

Ahí empieza la diferencia entre autorización gruesa y autorización real.

---

## Roles: útiles, pero insuficientes

Los roles siguen siendo útiles.

Sirven bien para expresar cosas como:

- tipo general de actor
- área de responsabilidad
- acceso grueso a ciertos módulos
- capacidad general de entrar a una zona del sistema

### Ejemplos razonables

- `ROLE_USER`
- `ROLE_SUPPORT`
- `ROLE_ADMIN`

Eso está bien.

El problema aparece cuando el sistema pretende que esos roles alcancen para decidir todas las operaciones finas del negocio.

### Ejemplo

- `ROLE_USER` puede significar “usuario común”
- pero no alcanza para decidir si puede ver **esta factura**, **esta orden**, **este documento** o **este perfil**

El rol dice algo del actor.  
No dice automáticamente todo sobre cada recurso.

---

## Qué es autorización basada en recurso

Es una autorización que considera:

- qué actor intenta operar
- qué recurso concreto quiere tocar
- qué acción intenta hacer
- qué relación existe entre ese actor y ese recurso

### Ejemplo clásico

No alcanza con saber que alguien es un usuario autenticado.

También importa si:

- esa orden es suya
- ese comentario le pertenece
- esa factura corresponde a su cuenta
- ese producto es de su tienda
- ese recurso está dentro de su tenant

---

## Ownership

Uno de los conceptos más importantes en autorización real es el **ownership**.

Ownership significa, a grandes rasgos:

- de quién es este recurso
- quién tiene derecho legítimo sobre él
- quién puede verlo, editarlo, cancelarlo o administrarlo

### Ejemplo

```java
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id, Authentication authentication) {
    return orderService.getVisibleOrder(id, authentication.getName());
}
```

Y en service:

```java
public OrderResponse getVisibleOrder(Long orderId, String username) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    User user = userRepository.findByEmail(username).orElseThrow();

    if (!order.getUser().getId().equals(user.getId())) {
        throw new AccessDeniedException("No autorizado");
    }

    return mapper.toResponse(order);
}
```

Acá la autorización no depende solo del rol.
Depende de la relación entre actor y recurso.

---

## Contexto

Además del recurso, muchas veces importa el **contexto**.

Por ejemplo:

- tenant actual
- organización activa
- región
- dispositivo o canal
- entorno operativo
- ventana temporal
- estado del negocio
- acción específica

### Ejemplo

Un usuario puede:

- ver su orden
- pero no cancelarla si ya está enviada
- o puede verla, pero no acceder al detalle interno de fraude
- o soporte puede verla, pero no editarla
- o admin puede editarla, pero no en cualquier estado

Eso significa que la autorización depende también del contexto de la operación.

---

## Estado del recurso

Este punto se subestima mucho.

No alcanza con:

- actor correcto
- recurso correcto

A veces también importa:

- si el recurso está en el estado adecuado para permitir esa acción

### Ejemplo

Una orden podría:

- verse en estado `PENDING`
- cancelarse en estado `PENDING`
- no cancelarse en estado `SHIPPED`
- requerir otro permiso si está `REFUNDED`
- ocultar ciertos datos si está `INTERNAL_REVIEW`

Entonces la autorización no depende solo de rol ni solo de ownership.

También depende del **estado**.

---

## Acción concreta

Otro error común es pensar autorización de forma demasiado abstracta.

No es lo mismo poder:

- ver
- editar
- borrar
- aprobar
- cancelar
- reembolsar
- exportar
- cambiar rol
- reasignar ownership

sobre el mismo recurso.

### Ejemplo

Un usuario puede:
- ver su perfil
- editar su nombre

pero no necesariamente:
- cambiar su rol
- habilitar su cuenta
- cambiar ownership
- editar flags internos

Eso significa que una autorización madura distingue mejor la **acción**.

---

## Ejemplo comparado: rol vs recurso

## Autorización solo por rol

```java
@PreAuthorize("hasRole('USER')")
@GetMapping("/invoices/{id}")
public InvoiceResponse getInvoice(@PathVariable Long id) {
    return invoiceService.getById(id);
}
```

Esto sigue siendo débil si cualquier `USER` puede consultar cualquier `id`.

## Autorización por recurso

```java
@GetMapping("/invoices/{id}")
public InvoiceResponse getInvoice(@PathVariable Long id, Authentication authentication) {
    return invoiceService.getVisibleInvoice(id, authentication.getName());
}
```

Y en service:

- busca invoice
- busca actor
- valida ownership o alcance
- decide qué campos o resultado devolver

Esto ya es mucho más sólido.

---

## Dónde suele romperse la autorización en apps reales

Suele romperse cuando el sistema piensa algo como:

- “si está autenticado, puede entrar”
- “si tiene rol USER, entonces puede ver”
- “si tiene rol ADMIN, entonces puede hacer cualquier cosa”
- “si no mostramos el botón, no va a intentarlo”
- “si el controller tiene `@PreAuthorize`, ya resolvimos”

Eso deja huecos como:

- IDOR
- acceso lateral entre cuentas
- abuso de soporte
- admin demasiado poderoso
- transiciones de negocio sin control fino
- exposición de recursos ajenos por ID

---

## El rol no desaparece: se vuelve una capa, no toda la solución

Es importante no irse al otro extremo.

No se trata de eliminar roles.

Se trata de ubicarlos mejor.

### Forma sana de pensarlo

El rol puede responder algo como:

- ¿este actor pertenece al grupo general correcto para esta zona del sistema?

Y luego, otras capas responden:

- ¿puede tocar este recurso?
- ¿puede hacer esta acción?
- ¿puede hacerlo en este estado?
- ¿qué campos debería ver?

En ese modelo, el rol sigue sirviendo.
Pero deja de ser la única barrera.

---

## Ejemplo típico de soporte vs usuario vs admin

Supongamos una orden.

### Usuario común
Puede:
- ver su orden
- cancelar su orden si está en cierto estado

### Soporte
Puede:
- ver órdenes de usuarios
- quizá reenviar notificaciones
- quizá agregar notas internas

### Admin
Puede:
- ver más contexto
- ejecutar acciones más delicadas
- revisar fraude
- exportar datos

Si modelás todo solo con un `hasRole()`, probablemente termines con algo demasiado tosco.

La autorización real suele necesitar:

- rol
- recurso
- acción
- estado
- alcance

---

## Qué papel juega Spring Security acá

Spring Security ayuda muchísimo, pero no debería usarse como si una anotación resolviera toda la realidad del negocio.

### Cosas útiles de Spring

- `@PreAuthorize`
- expresiones por rol
- autoridades
- acceso al principal autenticado
- integración con método y request security

### Pero el framework no adivina solo

No sabe automáticamente:

- de quién es la orden
- si el actor pertenece al tenant correcto
- si el recurso está en el estado adecuado
- si soporte tiene alcance sobre ese recurso puntual
- si esa transición de negocio está permitida

Eso lo tiene que decidir tu backend.

---

## Controller vs service en autorización

Una autorización madura suele repartir mejor responsabilidades.

### Controller
Puede:
- marcar una barrera general
- exigir actor autenticado
- exigir rol grueso si corresponde

### Service
Suele ser mejor lugar para:
- ownership
- estado
- relación actor-recurso
- reglas finas del negocio
- permisos contextuales

### Ejemplo

```java
@PreAuthorize("hasAnyRole('USER','SUPPORT','ADMIN')")
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id, Authentication authentication) {
    return orderService.getVisibleOrder(id, authentication.getName());
}
```

Y luego el service resuelve:

- si ese user puede verla
- si soporte tiene alcance
- si admin puede verla completa
- qué datos devolver

Eso suele ser mucho más realista.

---

## Qué relación tiene esto con IDOR

Muchísima.

IDOR aparece justamente cuando el sistema protege el endpoint de forma gruesa, pero no valida bien el recurso concreto.

### Ejemplo típico

- actor autenticado
- endpoint protegido
- recurso pedido por ID
- backend devuelve sin validar ownership

Eso muestra muy bien por qué la autorización debe pasar del rol al recurso.

---

## Qué relación tiene esto con multi-tenant

En sistemas multi-tenant, esta idea se vuelve todavía más importante.

Porque no alcanza con:

- autenticado
- rol correcto

También importa:

- si el recurso pertenece al mismo tenant
- si el actor tiene alcance dentro de ese tenant
- si soporte/admin tiene scope global o parcial

Sin autorización por recurso y contexto, los errores multi-tenant se vuelven muy peligrosos.

---

## Qué señales muestran una autorización demasiado gruesa

Estas cosas suelen hacer ruido rápido:

- mucho `hasRole()` y poco ownership
- acceso por ID sin validación fuerte del recurso
- services que no reciben actor o contexto
- support y admin tratados casi igual
- endpoints “protegidos” pero no realmente restringidos por recurso
- transitions del negocio sin chequeo fino
- lógica de autorización demasiado pegada a la UI

---

## Ejemplo sano de evolución

### Antes

```java
@PreAuthorize("hasRole('USER')")
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id) {
    return orderService.getById(id);
}
```

### Después

```java
@PreAuthorize("isAuthenticated()")
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id, Authentication authentication) {
    return orderService.getVisibleOrder(id, authentication.getName());
}
```

Y en service:

- actor actual
- recurso buscado
- ownership
- excepciones razonables
- visibilidad real

Esto refleja bastante bien el paso del rol al recurso.

---

## Qué gana el backend con este cambio mental

Cuando la autorización deja de estar pensada solo en roles, el backend gana:

- menos IDOR
- menos acceso lateral
- mejor soporte a reglas de negocio reales
- mejor separación entre actor, recurso y acción
- menor sobreconfianza en roles gruesos
- más claridad sobre permisos reales
- mejor base para auditar casos delicados

No es solo una mejora técnica.
Es una mejora muy real del modelo de seguridad.

---

## Señales de diseño sano

Una autorización más sana suele mostrar:

- roles usados como capa general
- ownership claro
- validación por recurso
- consideración del estado
- distinción entre acciones
- services que entienden actor + recurso + contexto
- menos confianza en IDs enviados por cliente
- menos endpoints “protegidos” pero permisivos

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- `hasRole()` como solución universal
- recurso devuelto directo por ID
- ausencia de actor en service
- soporte y admin sin límites claros
- reglas finas solo en frontend
- autorización que no distingue ver vs editar vs cancelar
- backend que responde más a la pregunta “qué rol tiene” que a “qué puede hacer sobre este recurso”

---

## Checklist práctico

Cuando revises autorización en una app Spring, preguntate:

- ¿el rol alcanza realmente para decidir este acceso?
- ¿qué recurso concreto está en juego?
- ¿hay ownership?
- ¿hay tenant o contexto?
- ¿qué acción se intenta hacer?
- ¿importa el estado del recurso?
- ¿el service conoce al actor actual?
- ¿la validación vive solo en controller o también en negocio?
- ¿este endpoint está protegido o realmente restringido?
- ¿si cambio el ID del recurso, el backend sigue respondiendo bien?

---

## Mini ejercicio de reflexión

Tomá tres endpoints de tu backend y respondé para cada uno:

1. ¿Qué rol exige hoy?
2. ¿Qué recurso toca realmente?
3. ¿Quién debería poder tocar ese recurso?
4. ¿Importa ownership?
5. ¿Importa tenant o contexto?
6. ¿Importa el estado?
7. ¿Qué pasaría si otro usuario autenticado prueba el mismo ID?

Si el rol responde poco de esas preguntas, entonces la autorización probablemente todavía esté demasiado gruesa.

---

## Resumen

Pasar del rol al recurso significa dejar de pensar autorización solo como:

- autenticado o no
- user o admin

y empezar a pensarla también como:

- actor
- recurso
- acción
- ownership
- estado
- contexto

En resumen:

> Una autorización madura no solo pregunta “qué rol tiene este actor”.  
> También pregunta “qué intenta hacer exactamente sobre qué recurso y bajo qué condiciones reales”.

---

## Próximo tema

**Rol no es permiso: modelado correcto**
