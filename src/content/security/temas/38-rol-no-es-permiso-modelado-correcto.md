---
title: "Rol no es permiso: modelado correcto"
description: "Cómo distinguir roles, permisos, capacidades y alcance en una aplicación Java con Spring Boot y Spring Security. Por qué un rol no debería usarse como sustituto universal de autorización y cómo modelar mejor el acceso real del sistema."
order: 38
module: "Autorización"
level: "base"
draft: false
---

# Rol no es permiso: modelado correcto

## Objetivo del tema

Entender por qué en una aplicación Java + Spring Boot + Spring Security no conviene tratar **rol** y **permiso** como si fueran exactamente la misma cosa, y cómo un modelado más preciso mejora mucho la seguridad, la mantenibilidad y la claridad del backend.

Este tema importa mucho porque muchas apps empiezan con algo como:

- `USER`
- `ADMIN`

y durante un tiempo parece alcanzar.

Pero a medida que el sistema crece, empiezan a aparecer preguntas como:

- ¿soporte puede ver pero no editar?
- ¿admin de una organización puede administrar solo su tenant?
- ¿un usuario puede cancelar pero no reembolsar?
- ¿alguien puede exportar sin poder aprobar?
- ¿moderación puede revisar pero no borrar definitivamente?
- ¿un rol intermedio puede ver datos internos pero no cambiar estados?

Y ahí se vuelve evidente que un rol general no expresa por sí solo el acceso real del sistema.

---

## Idea clave

Un **rol** describe, en general, qué tipo de actor es alguien dentro del sistema.

Un **permiso** describe, de forma más fina, qué acción puede realizar.

En resumen:

> Un rol suele ser una agrupación o categoría de actor.  
> Un permiso suele ser una capacidad más concreta y más pequeña.

Por eso:

- rol no es lo mismo que permiso
- y usar uno como sustituto automático del otro suele volver la autorización demasiado tosca

---

## Qué problema aparece cuando mezclamos ambos conceptos

Si tratás “rol” y “permiso” como si fueran la misma cosa, suelen pasar varias cosas:

- roles demasiado inflados
- roles demasiado poderosos
- reglas finas metidas a la fuerza en nombres gruesos
- explosión de roles artificiales
- dificultad para representar excepciones
- dificultad para separar acción, recurso y alcance
- soporte y admin mezclados de formas incómodas
- lógica rara repartida en el código

En resumen:

> el sistema empieza a pedir más matices, pero el modelo sigue siendo demasiado grueso.

---

## Qué suele ser un rol

Un rol suele responder algo como:

- ¿qué clase de actor es este?
- ¿en qué zona general del sistema opera?
- ¿qué familia de capacidades tiende a tener?

### Ejemplos comunes

- `ROLE_USER`
- `ROLE_SUPPORT`
- `ROLE_ADMIN`
- `ROLE_MANAGER`
- `ROLE_MODERATOR`

Eso puede servir muy bien como capa general.

### Qué no expresa bien por sí solo

No expresa necesariamente:

- si puede ver o editar un recurso concreto
- si puede actuar solo en su tenant
- si puede exportar pero no borrar
- si puede aprobar pero no publicar
- si puede ver datos sensibles pero no modificarlos

Ahí empiezan a aparecer los permisos o capacidades más finas.

---

## Qué suele ser un permiso

Un permiso suele responder algo como:

- ¿qué acción puede ejecutar este actor?

### Ejemplos

- `order:read`
- `order:cancel`
- `order:refund`
- `user:update`
- `user:change-role`
- `product:approve`
- `invoice:export`
- `report:view-internal`
- `support:add-note`

Estos permisos son más granulares y ayudan a representar mejor la realidad del negocio.

---

## Error mental clásico

Muchas apps modelan así:

- si es `ADMIN`, puede todo
- si es `USER`, puede lo suyo
- si es `SUPPORT`, puede “algo intermedio”

Y después empiezan a meter excepciones como:

- `SUPPORT` puede ver órdenes pero no reembolsarlas
- `ADMIN` de tenant A no debería ver tenant B
- `USER` puede editar perfil pero no email en ciertos estados
- `MANAGER` puede exportar pero no cambiar precios
- `MODERATOR` puede ocultar, pero no borrar

Como el modelo era demasiado tosco, aparecen soluciones raras como:

- roles nuevos para cada matiz
- ifs desperdigados por todo el backend
- permisos “escondidos” en services sin nombre claro
- nombres de roles cada vez más artificiales

Eso suele ser señal de que rol y permiso están mal diferenciados.

---

## Rol como agrupación, permiso como capacidad

Una forma sana de pensarlo es esta:

## El rol
te ubica en una categoría general.

## El permiso
te da capacidad concreta.

### Ejemplo

Rol:
- `SUPPORT`

Permisos:
- `order:read`
- `order:add-note`
- `customer:read`
- no necesariamente `order:refund`
- no necesariamente `user:change-role`

Eso permite expresar mejor una realidad más fina.

---

## Por qué un rol demasiado poderoso es un problema

Cuando un rol se vuelve el contenedor de “todo”, pasan cosas como:

- demasiadas personas con demasiado acceso
- dificultad para delegar capacidades parciales
- imposibilidad de hacer separación sana de funciones
- soporte demasiado cerca de admin
- mayor daño si una cuenta se compromete
- más superficie para abuso interno o accidental

En seguridad real, un rol demasiado inflado no es solo un problema de prolijidad.
Es un problema de poder mal distribuido.

---

## El otro extremo: demasiados roles

La otra mala salida es crear roles para cada detalle.

Por ejemplo:

- `ADMIN`
- `ADMIN_READONLY`
- `ADMIN_EXPORT_ONLY`
- `ADMIN_BILLING`
- `ADMIN_BILLING_EXPORT`
- `SUPPORT_LEVEL_1`
- `SUPPORT_LEVEL_2`
- `SUPPORT_LEVEL_2_CAN_REFUND`
- etc.

Eso suele terminar mal porque:

- crece sin límite
- cuesta entenderlo
- cuesta mantenerlo
- los nombres se vuelven poco expresivos
- el sistema empieza a esconder permisos reales dentro de nombres arbitrarios de roles

No es sano usar roles como reemplazo de un modelo de capacidades.

---

## Qué suele pasar en apps pequeñas

En una app muy simple, usar solo roles puede estar bien al principio.

Por ejemplo:

- `USER`
- `ADMIN`

y nada más.

Eso no es automáticamente incorrecto.

Lo importante es no convertir ese comienzo simple en una prisión mental.

A medida que el sistema crece, conviene detectar cuándo ya necesitás separar mejor:

- rol
- permiso
- recurso
- alcance
- estado
- acción

---

## Permiso tampoco es toda la autorización

Esto también es importante.

Separar rol de permiso ayuda mucho, pero todavía no resuelve todo.

Porque autorización real suele depender también de:

- recurso
- ownership
- tenant
- estado
- contexto
- acción específica

### Ejemplo

Tener permiso `order:read` no significa automáticamente que el actor pueda leer **cualquier** orden.

También puede importar:

- si esa orden le pertenece
- si está en su tenant
- si es soporte con alcance válido
- si el estado permite ver cierto detalle

Por eso el modelado sano no termina en “permisos”.
Solo mejora mucho una parte del problema.

---

## Ejemplo comparado: rol solo vs permiso más fino

## Modelo tosco

```java
@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/orders/{id}/refund")
public ResponseEntity<Void> refund(@PathVariable Long id) {
    orderService.refund(id);
    return ResponseEntity.noContent().build();
}
```

Esto mete demasiado dentro de `ADMIN`.

## Modelo un poco mejor

```java
@PreAuthorize("hasAuthority('order:refund')")
@PostMapping("/orders/{id}/refund")
public ResponseEntity<Void> refund(@PathVariable Long id, Authentication authentication) {
    orderService.refund(id, authentication.getName());
    return ResponseEntity.noContent().build();
}
```

Y luego el service todavía podría validar:

- tenant
- estado de la orden
- alcance del actor
- restricciones adicionales

Esto ya representa mucho mejor la realidad.

---

## Qué preguntas ayuda a responder un modelo con permisos

Un modelo más fino ayuda a responder mejor cosas como:

- ¿puede leer pero no editar?
- ¿puede editar pero no aprobar?
- ¿puede aprobar pero no publicar?
- ¿puede exportar sin ver todo?
- ¿puede ver datos internos sin reembolsar?
- ¿puede gestionar usuarios sin cambiar roles?
- ¿puede cambiar precios sin administrar el catálogo completo?

Todas esas preguntas son difíciles de modelar bien con roles muy gruesos.

---

## Alcance y permiso no son lo mismo

Otro punto importante.

A veces un actor tiene el permiso correcto, pero no el alcance correcto.

### Ejemplo

Permiso:
- `customer:read`

Alcance:
- solo clientes de su tenant
- o solo clientes asignados
- o solo clientes de su región
- o solo clientes de su cartera

Entonces:

- permiso dice **qué acción**
- alcance dice **sobre qué universo puede aplicarla**

Si esto no se separa bien, empiezan errores de sobrealcance.

---

## Ejemplo realista: soporte

Rol:
- `SUPPORT`

Permisos:
- `order:read`
- `customer:read`
- `support:add-note`

Alcance:
- solo órdenes del tenant del operador
- o solo clientes asignados a su equipo

Restricciones adicionales:
- no reembolsar
- no cambiar precios
- no tocar roles

Esto se modela mucho mejor si distinguís:

- rol general
- permisos finos
- alcance real

---

## Qué suele pasar en Spring Security

En Spring Security aparecen dos ideas muy frecuentes:

- `hasRole(...)`
- `hasAuthority(...)`

### Idea útil

- `hasRole(...)` suele encajar mejor para categorías generales
- `hasAuthority(...)` puede servir mejor para permisos más finos

No significa que siempre debas usar ambos.
Significa que conceptualmente conviene saber que no representan exactamente lo mismo.

---

## Ejemplo conceptual con authorities

Supongamos un principal autenticado con authorities como:

- `ROLE_SUPPORT`
- `order:read`
- `support:add-note`

Entonces podrías tener algo así:

```java
@PreAuthorize("hasAuthority('order:read')")
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id, Authentication authentication) {
    return orderService.getVisibleOrder(id, authentication.getName());
}
```

Y después el `service` resuelve ownership, alcance o tenant.

Esto ya es más expresivo que depender solo de un `hasRole('SUPPORT')`.

---

## El peligro de meter todo en roles “por simplicidad”

La simplicidad inicial puede salir cara después.

### Señales típicas

- un rol puede demasiado
- aparecen excepciones por todos lados
- soporte termina con privilegios innecesarios
- admin concentra todo el poder
- cuesta delegar tareas parciales
- hay ifs raros de “si además de admin viene de tal tenant” o “si support pero no esto”

Eso suele ser señal de que el modelo necesita más granularidad.

---

## Qué relación tiene esto con separación de funciones

Separar roles y permisos también ayuda a evitar concentraciones peligrosas de poder.

### Ejemplo

No necesariamente conviene que la misma cuenta pueda:

- aprobar reembolsos
- cambiar roles
- exportar todo
- borrar evidencias
- modificar flags de auditoría

Un modelo más fino ayuda a repartir mejor esas capacidades.

Eso es importante tanto para seguridad externa como interna.

---

## Cómo empezar a modelarlo mejor sin complicar todo de golpe

No hace falta pasar de dos roles a un sistema hiper sofisticado en un día.

Una evolución razonable suele ser:

### Paso 1
Mantener roles generales claros.

### Paso 2
Identificar acciones críticas que el rol no expresa bien.

### Paso 3
Modelar permisos finos para esas acciones.

### Paso 4
Separar alcance y contexto.

### Paso 5
Mover validación real al service cuando hace falta recurso + estado + actor.

Eso ya mejora muchísimo sin volver el sistema inmanejable.

---

## Qué errores aparecen si no hacés esta distinción

Estos problemas suelen aparecer bastante:

- admins sobredimensionados
- roles intermedios ambiguos
- permisos escondidos en lógica ad hoc
- dificultad para auditar qué puede hacer quién
- dificultad para delegar funciones parciales
- sobreacceso por tenant o recurso
- demasiados ifs de excepción
- explosión artificial de roles

No siempre aparecen todos juntos, pero si ves varios, suele ser buena señal de que el modelo está pidiendo una separación mejor.

---

## Qué gana el backend con este cambio

Cuando distinguís mejor rol, permiso y alcance, el backend gana:

- más claridad
- menos sobreacceso
- menos roles inflados
- mejor capacidad de delegación
- mejor auditoría mental y técnica
- mejor base para autorización por recurso
- menos excepciones caóticas repartidas en el código

No es solo teoría.  
Hace el sistema realmente más controlable.

---

## Señales de diseño sano

Un modelo más sano suele mostrar:

- pocos roles generales y comprensibles
- permisos más finos donde el negocio lo necesita
- alcance separado de permiso
- services que todavía validan recurso y contexto
- menos “super roles” innecesarios
- menos explosión de nombres raros

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- `ADMIN` para todo
- `SUPPORT` con demasiados privilegios
- decenas de roles por combinaciones artificiales
- authorities sin criterio claro
- permisos metidos a mano en ifs por todo el backend
- nadie puede explicar exactamente qué puede hacer cada rol
- recurso, contexto y tenant ignorados porque “tiene el rol”

---

## Checklist práctico

Cuando revises autorización en una app Spring, preguntate:

- ¿este rol describe una categoría o está reemplazando permisos finos?
- ¿hay acciones que el sistema no puede modelar bien solo con roles?
- ¿están separados rol, permiso y alcance?
- ¿hay roles inflados con demasiado poder?
- ¿hay explosión de roles artificiales?
- ¿el sistema usa `hasRole()` donde en realidad necesitaría capacidades más finas?
- ¿qué permisos concretos importan más que el rol general?
- ¿qué parte de la autorización sigue dependiendo además de recurso y contexto?
- ¿si una cuenta se compromete, el rol concentra demasiado daño?
- ¿el equipo puede explicar claramente la diferencia entre rol y permiso en su propio sistema?

---

## Mini ejercicio de reflexión

Tomá tres roles reales o imaginarios de tu backend y para cada uno respondé:

1. ¿Qué tipo de actor representa?
2. ¿Qué permisos concretos debería tener?
3. ¿Qué permisos concretos no debería tener?
4. ¿Qué alcance tiene?
5. ¿Qué parte del acceso todavía depende del recurso o del estado?
6. ¿Ese rol está demasiado inflado o demasiado ambiguo?

Ese ejercicio ayuda mucho a dejar de usar “rol” como palabra mágica y empezar a modelar mejor el acceso real.

---

## Resumen

Rol y permiso no son lo mismo.

## Rol
- describe un tipo general de actor
- ayuda a acceso grueso o categórico

## Permiso
- describe una capacidad más concreta
- ayuda a expresar acciones reales del sistema

Y además todavía importa:

- recurso
- alcance
- contexto
- estado

En resumen:

> Un backend más maduro no pretende meter toda la autorización dentro de nombres de roles.  
> Distingue mejor entre quién es el actor, qué capacidad tiene y sobre qué universo puede aplicarla.

---

## Próximo tema

**@PreAuthorize, @PostAuthorize y límites reales**
