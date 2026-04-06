---
title: "Tenant, scope y límites organizacionales"
description: "Cómo modelar tenant, scope y límites organizacionales en una aplicación Java con Spring Boot y Spring Security. Por qué no alcanza con autenticar y autorizar por rol, y cómo evitar acceso cruzado entre organizaciones, cuentas o espacios lógicos del sistema."
order: 42
module: "Autorización"
level: "base"
draft: false
---

# Tenant, scope y límites organizacionales

## Objetivo del tema

Entender cómo modelar y validar **tenant**, **scope** y **límites organizacionales** en una aplicación Java + Spring Boot + Spring Security, para evitar uno de los fallos más peligrosos en sistemas multiempresa, multiworkspace o multiárea:

- un actor correctamente autenticado
- con permisos aparentemente válidos
- pero operando fuera del universo organizacional que realmente le corresponde

Este tema importa mucho porque muchas apps ya no son simplemente “un usuario y sus datos”.

Muy seguido aparecen modelos como:

- organizaciones
- cuentas empresariales
- workspaces
- sucursales
- equipos
- portfolios
- tiendas
- tenants

Y ahí la pregunta deja de ser solo:

- “¿puede hacer esta acción?”

para pasar a ser también:

- “¿puede hacer esta acción dentro de **qué espacio organizacional**?”

En resumen:

> tener el permiso correcto no alcanza si el recurso vive en el tenant equivocado o fuera del alcance organizacional real del actor.

---

## Idea clave

En sistemas con separación organizacional, autorización real suele depender al menos de estas capas:

- identidad del actor
- rol o permiso general
- recurso concreto
- tenant o espacio organizacional al que pertenece el recurso
- scope real del actor dentro de ese espacio

En resumen:

> no basta con preguntar “¿puede?”.  
> También hay que preguntar “¿puede **acá**?”.

Ese “acá” es exactamente donde entran tenant y scope.

---

## Qué entendemos por tenant

“Tenant” suele representar una frontera organizacional o lógica dentro del sistema.

### Ejemplos típicos

- una empresa cliente de tu SaaS
- una tienda dentro de un marketplace
- una organización dentro de una plataforma B2B
- un workspace
- una institución
- una sucursal
- un espacio lógico con datos separados

### Idea importante

Si el sistema es multi-tenant, dos recursos distintos pueden tener:

- misma estructura
- mismos endpoints
- mismos tipos de actor

pero pertenecer a tenants distintos.

Y eso cambia totalmente la autorización.

---

## Qué entendemos por scope

“Scope” suele representar el **alcance real** del actor dentro de un tenant o sobre un conjunto de recursos.

No responde exactamente:

- qué tipo de actor es

sino más bien:

- sobre qué subconjunto puede operar
- dentro de qué frontera tiene visibilidad
- hasta dónde llega su capacidad

### Ejemplos de scope

- solo su organización
- solo su equipo
- solo su sucursal
- solo sus clientes asignados
- solo ciertos proyectos
- solo cierta región
- global dentro del tenant, pero no fuera de él

---

## Error mental clásico

Muchísimas apps caen en una lógica como esta:

- “si tiene rol ADMIN, puede”
- “si tiene permiso `customer:read`, alcanza”
- “si está autenticado y pertenece a alguna organización, listo”
- “si el frontend manda el tenantId correcto, ya está”
- “si el usuario ve solo su tenant en la UI, no hace falta revisar más”

Ese pensamiento deja huecos muy serios.

Porque todavía faltan preguntas como:

- ¿ese recurso pertenece al tenant actual?
- ¿ese actor opera en ese tenant o en otro?
- ¿el tenant enviado por cliente es confiable?
- ¿el actor tiene scope completo dentro de ese tenant o solo parcial?
- ¿el endpoint permite cruce entre organizaciones por accidente?

Ahí aparece el valor de modelar bien tenant y scope.

---

## Por qué este tema es tan delicado

Porque los errores de tenant o scope suelen tener consecuencias muy graves.

### Ejemplos de impacto

- una empresa ve datos de otra
- soporte de una cuenta accede a recursos de otra organización
- admin local actúa como si fuera global
- exportaciones mezclan información de tenants distintos
- búsquedas cruzan clientes que no corresponden
- reportes incluyen datos fuera del alcance real
- configuraciones de una cuenta afectan otra

En sistemas SaaS o B2B, esto suele ser de los fallos más caros y más sensibles.

---

## Tenant no es rol

Esto es clave.

Un actor puede ser:

- `ROLE_ADMIN`

y aun así no poder operar en cualquier tenant.

### Ejemplo

- Admin de empresa A
- Admin de empresa B
- Admin interno global
- Soporte con acceso restringido
- Manager regional

Todos pueden tener “roles altos”, pero no necesariamente el mismo alcance.

Por eso:

- rol dice algo del tipo de actor
- tenant y scope dicen dónde y hasta dónde puede operar

---

## Tenant no es ownership

Tampoco conviene confundir estas cosas.

## Ownership
responde:
- ¿de quién es este recurso?

## Tenant
responde:
- ¿a qué organización o frontera lógica pertenece?

### Ejemplo

Una orden puede:
- pertenecer al tenant Empresa A
- y además pertenecer al usuario Juan dentro de Empresa A

Entonces una autorización madura puede necesitar:
- tenant correcto
- ownership correcto
- acción correcta
- estado correcto

No alcanza con una sola capa.

---

## Scope no es permiso

Otro punto importante.

## Permiso
responde:
- ¿qué acción puede intentar?

## Scope
responde:
- ¿sobre qué universo puede aplicar esa acción?

### Ejemplo

Permiso:
- `customer:read`

Scopes posibles:
- solo clientes asignados
- todos los clientes del tenant
- clientes de una región
- clientes globales

Entonces dos actores pueden tener el mismo permiso, pero scopes distintos.
Y eso cambia muchísimo la autorización real.

---

## Ejemplo clásico de fallo multi-tenant

Supongamos esto:

```java
@PreAuthorize("hasAuthority('invoice:read')")
@GetMapping("/invoices/{id}")
public InvoiceResponse getInvoice(@PathVariable Long id) {
    return invoiceService.getById(id);
}
```

Y luego:

```java
public InvoiceResponse getById(Long id) {
    Invoice invoice = invoiceRepository.findById(id).orElseThrow();
    return invoiceMapper.toResponse(invoice);
}
```

### ¿Qué problema puede haber?

Si el actor tiene permiso `invoice:read`, pero el backend no valida:

- a qué tenant pertenece esa factura
- si el actor pertenece a ese tenant
- si su scope le permite verla

entonces puede aparecer acceso cruzado entre organizaciones.

Eso es gravísimo aunque el endpoint “esté protegido”.

---

## Ejemplo mejor con tenant explícito

### Service

```java
public InvoiceResponse getVisibleInvoice(Long invoiceId, SecurityUser actor) {
    Invoice invoice = invoiceRepository.findById(invoiceId).orElseThrow();

    if (!invoice.getTenantId().equals(actor.getTenantId())) {
        throw new AccessDeniedException("No autorizado");
    }

    return invoiceMapper.toResponse(invoice);
}
```

Esto ya mejora mucho porque valida frontera organizacional básica.

### Pero todavía puede no alcanzar

Si dentro del mismo tenant hay scopes distintos, puede faltar además validar:

- equipo
- cartera
- sucursal
- tipo de acceso
- ownership o asignación interna

---

## TenantId enviado por cliente: mala idea frecuente

Un patrón muy riesgoso es confiar en algo como:

```java
@GetMapping("/customers")
public Page<CustomerResponse> list(
        @RequestParam Long tenantId,
        @RequestParam int page,
        @RequestParam int size) {
    return customerService.list(tenantId, page, size);
}
```

Si el backend cree demasiado en ese `tenantId`, el actor podría:

- probar otro tenant
- explorar estructura organizacional
- listar recursos de otras cuentas
- abusar filtros o exportaciones

### Regla práctica

Si el backend ya conoce el tenant efectivo del actor autenticado, no conviene confiar ciegamente en uno enviado por el cliente.

---

## Más sano: tenant derivado del contexto autenticado

### Ejemplo

```java
@GetMapping("/customers")
public Page<CustomerResponse> list(
        @RequestParam int page,
        @RequestParam int size,
        Authentication authentication) {
    return customerService.listVisibleCustomers(authentication.getName(), page, size);
}
```

Y en service:

- busca actor
- obtiene tenant efectivo
- aplica scope real
- consulta con ese alcance

Eso reduce muchísimo la superficie de abuso.

---

## Cuando un actor puede operar en más de un tenant

Esto también pasa.

Por ejemplo:

- usuario interno con acceso a varios tenants
- soporte de plataforma
- consultor con acceso delegado
- admin global interno

En esos casos, el sistema sigue necesitando validar muy bien:

- qué tenant está actuando ahora
- si tiene alcance sobre ese tenant
- qué capacidades tiene dentro de él
- si el cambio de contexto está controlado o el cliente lo puede forzar demasiado

No es “más fácil” porque exista multi-tenant flexible.
Al contrario: exige más claridad.

---

## Tenant activo vs tenant permitido

En algunos sistemas el actor puede tener varios tenants posibles, pero uno activo en el contexto actual.

Eso introduce dos preguntas distintas:

## Tenant permitido
¿en qué tenants puede operar esta identidad?

## Tenant activo
¿en cuál está operando en esta request o sesión?

Un diseño sano no debería asumir que cualquier tenant pedido por cliente es automáticamente válido.
Debería validar que:

- el actor tiene acceso a ese tenant
- ese tenant activo es coherente con el contexto
- la operación corresponde dentro de ese universo

---

## Scope parcial dentro del tenant

Estar en el tenant correcto tampoco siempre alcanza.

### Ejemplo

Dentro del mismo tenant, un actor puede tener scope solo sobre:

- su equipo
- su región
- sus clientes asignados
- sus órdenes
- sus sucursales

Entonces una validación solo por tenant puede seguir siendo demasiado gruesa.

### Ejemplo realista

- pertenece al tenant correcto
- tiene permiso `customer:read`
- pero solo debería ver clientes asignados a su cartera

Si el backend devuelve todos los clientes del tenant, sigue habiendo sobreacceso.

---

## Qué papel juega el repository

En modelos con tenant y scope, conviene muchísimo pensar bien cómo consultás.

### Riesgo clásico

```java
findById(id)
```

o

```java
findAll()
```

sin tenant ni alcance.

### Más sano, cuando aplica

```java
findByIdAndTenantId(id, tenantId)
```

o

```java
findByTenantIdAndAssignedUserId(tenantId, userId, pageable)
```

o variantes equivalentes según el dominio.

### Qué mejora esto

- reduce exposición
- alinea acceso a datos con autorización
- evita traer cosas de más
- refuerza límites organizacionales desde la consulta

No reemplaza toda la autorización, pero ayuda muchísimo.

---

## Ejemplo de consulta con tenant y scope

```java
public Page<CustomerResponse> listVisibleCustomers(SecurityUser actor, int page, int size) {
    Page<Customer> customers;

    if (actor.hasAuthority("customer:read:all")) {
        customers = customerRepository.findByTenantId(
                actor.getTenantId(),
                PageRequest.of(page, size)
        );
    } else {
        customers = customerRepository.findByTenantIdAndAssignedUserId(
                actor.getTenantId(),
                actor.getId(),
                PageRequest.of(page, size)
        );
    }

    return customers.map(customerMapper::toResponse);
}
```

### Qué muestra esto

- mismo tenant
- scope distinto según authority/capacidad
- query ya acotada
- menos confianza en filtro tardío

Esto suele ser mucho más sano que traer todo y filtrar después.

---

## Qué pasa con soporte y roles internos

Este es uno de los puntos más delicados.

Si tenés actores internos como:

- soporte
- operaciones
- admin global
- compliance
- auditoría

necesitás decidir con mucha claridad:

- qué tenants pueden tocar
- qué acciones pueden hacer en cada tenant
- qué datos pueden ver
- qué campos no deberían ver
- si su acceso es total, parcial, temporal o justificado

Un “support can see everything” sin modelo claro suele ser una mala idea.

---

## Exportaciones y búsquedas: zona de mucho riesgo

Tenant y scope suelen romperse muchísimo en:

- exports
- búsquedas globales
- reportes
- dashboards
- listados administrativos
- filtros avanzados

Porque el sistema piensa:

- “solo es lectura”
- “es para tabla interna”
- “el frontend ya manda el tenant”
- “ya tiene permiso de lectura”

Pero ahí es exactamente donde más se mezclan:

- grandes volúmenes
- filtros libres
- tenantId manipulable
- scopes parciales olvidados
- datos cruzados

Conviene revisar estas superficies con lupa.

---

## Qué señales muestran límites organizacionales mal resueltos

Estas cosas suelen hacer ruido rápido:

- tenantId en request sin validación real
- `findById()` por todos lados en sistema multi-tenant
- listados sin filtro por tenant
- soporte o admin con acceso ambiguo
- exportaciones globales poco controladas
- scope solo en frontend
- actor autenticado sin tenant efectivo claro
- queries que traen todo y recortan tarde
- nadie puede explicar exactamente qué actor puede tocar qué tenant

---

## Qué relación tiene esto con auditoría

En multi-tenant, la trazabilidad también importa mucho.

Conviene poder responder cosas como:

- ¿en qué tenant actuó?
- ¿con qué scope?
- ¿desde qué rol o capacidad?
- ¿accedió a datos de una o varias organizaciones?
- ¿se produjo cruce entre tenants?
- ¿qué exportaciones ocurrieron?
- ¿qué actor interno operó sobre qué cuenta?

Si esto no está claro, investigar incidentes o sobreaccesos se vuelve mucho más difícil.

---

## Qué gana el backend si modela bien tenant y scope

Cuando el backend modela bien tenant y scope, gana:

- menos acceso cruzado
- menos sobreacceso interno
- mejor soporte para SaaS real
- mejor aislamiento organizacional
- queries más seguras
- menos confianza en el cliente
- mejor capacidad para auditoría y cumplimiento

No es un lujo arquitectónico.
Es parte central de la seguridad en sistemas multi-tenant.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- tenant efectivo claro por actor o contexto
- scope explícito
- validaciones por tenant en service y/o repository
- queries acotadas
- poco tenant confiado desde request
- exportaciones y búsquedas con alcance claro
- roles internos con límites definidos
- separación entre permiso, tenant y scope

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- permisos correctos pero tenant incorrecto
- tenantId manipulable desde cliente
- admin local tratado como global
- soporte con demasiado acceso
- scope definido solo por UI
- listados o reportes sin acotación organizacional
- filtros que cruzan cuentas
- equipo que no distingue tenant, scope y ownership

---

## Checklist práctico

Cuando revises tenant y scope en una app Spring, preguntate:

- ¿qué frontera organizacional existe en el sistema?
- ¿cómo se representa el tenant?
- ¿el tenant efectivo sale del contexto autenticado o del request?
- ¿qué actors pueden operar en más de un tenant?
- ¿cómo se valida eso?
- ¿hay scope parcial dentro del tenant?
- ¿las queries están acotadas por tenant/scope?
- ¿qué pasa en exportaciones y búsquedas?
- ¿qué puede hacer soporte?
- ¿qué puede hacer admin local?
- ¿si cambio tenantId en la request, el backend sigue respondiendo correctamente?

---

## Mini ejercicio de reflexión

Tomá tres operaciones de tu backend que toquen datos organizacionales y respondé:

1. ¿A qué tenant pertenece el recurso?
2. ¿Cómo sabe el backend cuál es el tenant efectivo del actor?
3. ¿El actor tiene acceso total o parcial dentro de ese tenant?
4. ¿El tenant viene del cliente o del contexto autenticado?
5. ¿La query ya está acotada?
6. ¿Qué pasaría si un actor de otra organización prueba el mismo ID?
7. ¿Qué actor interno podría hoy ver de más por falta de límites organizacionales claros?

Ese ejercicio suele mostrar muy rápido si tu multi-tenant está realmente modelado o solo asumido.

---

## Resumen

En sistemas con fronteras organizacionales, la autorización real no depende solo de:

- rol
- permiso
- autenticación

También depende de:

- tenant correcto
- scope correcto
- recurso correcto
- acción correcta
- contexto correcto

En resumen:

> Un backend seguro en entornos multi-tenant no solo pregunta “¿puede hacer esto?”.  
> También pregunta “¿puede hacerlo dentro de esta organización, con este alcance y sobre este recurso concreto?”.

---

## Próximo tema

**Estado del recurso como parte de la autorización**
