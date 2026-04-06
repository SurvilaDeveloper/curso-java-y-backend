---
title: "Autorización en service vs controller"
description: "Cómo repartir correctamente la autorización entre controller y service en una aplicación Java con Spring Boot y Spring Security. Qué conviene validar en el borde HTTP, qué debería vivir en negocio y por qué dejar todo en un solo lugar suele producir controles débiles o difíciles de mantener."
order: 40
module: "Autorización"
level: "base"
draft: false
---

# Autorización en service vs controller

## Objetivo del tema

Entender cómo repartir la autorización entre **controller** y **service** en una aplicación Java + Spring Boot + Spring Security, para evitar dos errores muy comunes:

- creer que con proteger el endpoint ya alcanza
- meter toda la seguridad en un service sin dejar barreras claras en el borde

Este tema importa mucho porque una gran cantidad de backends termina cayendo en uno de estos extremos:

- controllers “muy protegidos”, pero services ingenuos
- services llenos de reglas, pero controllers completamente abiertos
- lógica de autorización duplicada
- controles importantes repartidos sin criterio
- rutas nuevas que se saltean barreras viejas
- reglas difíciles de auditar porque nadie sabe dónde viven

En resumen:

> la pregunta no es “controller o service”.  
> La pregunta correcta es “qué parte de la autorización conviene resolver en cada capa para que el sistema sea más claro, más fuerte y menos ingenuo”.

---

## Idea clave

Una autorización madura suele necesitar al menos dos niveles:

## Controller
como barrera general y explícita de entrada

## Service
como lugar de decisión real sobre:
- recurso
- contexto
- ownership
- estado
- reglas del negocio

En resumen:

> el controller suele servir bien para la barrera gruesa.  
> El service suele ser mejor para la autorización fina y real del caso de uso.

No porque una capa “no pueda” hacer lo otro, sino porque repartirlo así suele volver el sistema mucho más mantenible y seguro.

---

## Error mental clásico

Muchos equipos piensan una de estas dos cosas:

### Opción A
- “si el endpoint tiene `@PreAuthorize`, ya está resuelto”

### Opción B
- “dejemos todo en business logic y no hace falta marcar nada en controller”

Las dos posturas suelen ser incompletas.

### Si te quedás solo en controller
podés olvidar:
- ownership
- estado
- tenant
- acción concreta
- reglas del dominio

### Si te quedás solo en service
podés perder:
- barreras visibles
- protección temprana
- claridad del contrato de seguridad
- control uniforme del borde

---

## Qué suele resolver bien el controller

El controller suele ser un muy buen lugar para expresar:

- que el actor esté autenticado
- que el actor pertenezca a una categoría general correcta
- que el método no pueda invocarse libremente desde cualquier identidad
- que ciertas operaciones claramente administrativas no corran si el actor ni siquiera está cerca del grupo correcto

### Ejemplos razonables

```java
@PreAuthorize("isAuthenticated()")
```

```java
@PreAuthorize("hasAuthority('order:read')")
```

```java
@PreAuthorize("hasRole('ADMIN')")
```

Eso ayuda mucho porque pone una barrera visible y declarativa en el borde.

---

## Qué no suele resolver bien el controller por sí solo

El controller rara vez es el mejor lugar para resolver completamente cosas como:

- si el recurso le pertenece al actor
- si el actor tiene alcance sobre ese tenant
- si la transición de estado está permitida
- si una orden puede cancelarse en este momento
- si soporte puede operar sobre este recurso puntual
- si el recurso ya pasó por un estado que cambia la decisión
- si hay reglas del negocio combinadas con autorización

Eso suele vivir mucho mejor en service.

---

## Qué suele resolver bien el service

El service suele ser el mejor lugar para responder preguntas como:

- ¿este actor puede operar sobre este recurso concreto?
- ¿el recurso le pertenece?
- ¿está en el tenant correcto?
- ¿el estado actual habilita esta acción?
- ¿la operación fue ya ejecutada?
- ¿hay una regla adicional del negocio que cambia la decisión?
- ¿este actor puede ver todo o solo una parte del recurso?

Ahí ya estás en autorización real, no solo en acceso grueso al endpoint.

---

## Ejemplo típico: controller solo

### Controller

```java
@PreAuthorize("hasRole('USER')")
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id) {
    return orderService.getById(id);
}
```

### Problema

El controller protege de forma gruesa:
- solo usuarios con cierto rol general

Pero no protege realmente:
- si la orden es de ese usuario
- si el id corresponde a un recurso ajeno
- si el actor tiene alcance real sobre ese objeto

Resultado:
- endpoint protegido
- autorización fina ausente

Este es uno de los patrones más comunes detrás de IDOR.

---

## Ejemplo mejor: controller + service

### Controller

```java
@PreAuthorize("hasAuthority('order:read')")
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id, Authentication authentication) {
    return orderService.getVisibleOrder(id, authentication.getName());
}
```

### Service

```java
public OrderResponse getVisibleOrder(Long orderId, String username) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    User actor = userRepository.findByEmail(username).orElseThrow();

    if (!order.belongsTo(actor) && !actor.hasRole("SUPPORT")) {
        throw new AccessDeniedException("No autorizado");
    }

    return orderMapper.toResponse(order);
}
```

### Qué mejora esto

El controller dice:
- este endpoint no es libre
- hace falta una capacidad general mínima

El service dice:
- además, este recurso concreto debe ser visible para este actor

Esa combinación suele ser mucho más fuerte.

---

## Por qué conviene que el controller exprese una barrera general

Aunque el service pueda validar todo, dejar el controller totalmente libre suele tener varios problemas:

- hace menos visible la intención de seguridad
- permite que lleguen demasiado lejos requests claramente fuera de alcance
- obliga a que la defensa real recién ocurra más adentro
- puede volver más fácil olvidar barreras generales en endpoints nuevos
- dificulta revisar la superficie expuesta

### Ejemplo

Si una operación es claramente administrativa, poner una barrera en controller ayuda muchísimo:

```java
@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/admin/users/{id}")
public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    adminUserService.deleteUser(id);
    return ResponseEntity.noContent().build();
}
```

Eso no necesariamente resuelve todo, pero ya deja clarísimo que el endpoint no es para cualquiera.

---

## Por qué conviene que el service valide el recurso real

Porque el service suele tener acceso natural a:

- la entidad o agregado
- el estado actual
- el actor actual
- el tenant
- relaciones del dominio
- reglas operativas

Y eso le permite decidir mejor si la acción realmente corresponde.

### Ejemplo

No alcanza con que alguien tenga authority `order:cancel`.

También puede importar:

- si esa orden le pertenece
- si está en estado `PENDING`
- si no fue ya reembolsada
- si no hay una excepción operativa
- si la ventana temporal sigue abierta

Eso vive mucho mejor en service que en una anotación o en el controller puro.

---

## Qué pasa si toda la autorización vive solo en controller

Cuando todo vive en controller, suelen aparecer problemas como:

- lógica de negocio mezclada con HTTP
- controladores gigantes
- duplicación entre endpoints
- huecos cuando otro flujo llama el mismo service
- dificultad para reutilizar lógica con seguridad consistente
- poca claridad de negocio real

### Ejemplo de problema típico

Tenés:

- endpoint A protegido y con lógica de autorización en controller
- endpoint B nuevo que llama el mismo service pero olvidó una parte del control

Resultado:
- la misma operación ya no está protegida igual

Si la autorización importante vive también en service, el sistema resiste mejor estos desvíos.

---

## Qué pasa si toda la autorización vive solo en service

También hay problemas si el controller no expresa nada.

Pueden aparecer cosas como:

- endpoints que parecen públicos hasta que uno lee mucho más adentro
- falta de barreras declarativas
- requests claramente inválidos llegando más lejos de lo necesario
- menor legibilidad de la superficie de seguridad
- mayor riesgo de olvidar autenticación general en algún borde nuevo

No es que sea imposible hacerlo funcionar.
Es que suele quedar menos claro y menos defendible.

---

## Regla práctica bastante sana

Una forma útil de pensarlo es así:

### Controller
responde:
- ¿este actor pertenece siquiera al grupo general que puede intentar esta operación?

### Service
responde:
- ¿este actor puede ejecutar esta operación sobre este recurso y en este contexto real?

No es una ley universal, pero funciona muy bien como guía.

---

## Ejemplo: editar perfil propio

### Controller

```java
@PreAuthorize("isAuthenticated()")
@PatchMapping("/users/me/profile")
public UserResponse updateProfile(
        @Valid @RequestBody UpdateProfileRequest request,
        Authentication authentication) {
    return userService.updateProfile(authentication.getName(), request);
}
```

### Service

```java
public UserResponse updateProfile(String username, UpdateProfileRequest request) {
    User user = userRepository.findByEmail(username).orElseThrow();

    if (!user.isEnabled()) {
        throw new IllegalStateException("La cuenta no puede editar el perfil");
    }

    user.setName(request.getName());
    userRepository.save(user);

    return userMapper.toResponse(user);
}
```

### Qué muestra esto

- controller exige actor autenticado
- service decide si esa cuenta en ese estado puede ejecutar realmente la operación

---

## Ejemplo: operación administrativa delicada

### Controller

```java
@PreAuthorize("hasAuthority('user:change-role')")
@PatchMapping("/admin/users/{id}/role")
public ResponseEntity<Void> changeRole(
        @PathVariable Long id,
        @Valid @RequestBody UpdateUserRoleRequest request,
        Authentication authentication) {
    adminUserService.changeRole(id, request, authentication.getName());
    return ResponseEntity.noContent().build();
}
```

### Service

```java
public void changeRole(Long targetUserId, UpdateUserRoleRequest request, String username) {
    User actor = userRepository.findByEmail(username).orElseThrow();
    User target = userRepository.findById(targetUserId).orElseThrow();

    if (!actor.canManage(target)) {
        throw new AccessDeniedException("No autorizado");
    }

    if (!rolePolicy.canAssign(actor, request.getRole())) {
        throw new AccessDeniedException("No autorizado");
    }

    target.setRole(request.getRole());
    userRepository.save(target);
}
```

### Qué mejora esto

La authority general sola no alcanza.
El service todavía decide:
- si puede gestionar a ese objetivo
- si puede asignar ese rol
- si hay restricciones de negocio o jerarquía

Eso es muchísimo más realista.

---

## Qué papel juega multi-tenant

En entornos multi-tenant esta separación se vuelve todavía más importante.

### Controller
puede exigir:
- autenticado
- authority general del módulo

### Service
puede decidir:
- si actor y recurso pertenecen al mismo tenant
- si el actor tiene alcance dentro de esa organización
- si hay permisos cruzados válidos o no
- si soporte tiene scope parcial o total

Si intentás meter eso solo en anotaciones, rápido se vuelve poco claro o demasiado frágil.

---

## Qué papel juega el estado del recurso

El estado del recurso también hace que service sea clave.

### Ejemplo

Una authority como `order:refund` puede ser correcta.
Pero todavía falta saber si:

- la orden está pagada
- no fue ya reembolsada
- no está en revisión interna
- la política de negocio permite el reembolso ahora

Eso es autorización contextual y de negocio.
Difícilmente viva bien solo en controller.

---

## Qué pasa con queries y repositorios

Otra observación útil:

a veces la mejor autorización no es solo “verificar después”, sino también:

- consultar ya con alcance correcto
- traer solo lo visible
- no cargar recursos que el actor no debería tocar

### Ejemplo

En vez de:

```java
Order order = orderRepository.findById(id).orElseThrow();
```

a veces conviene algo como:

```java
Optional<Order> findByIdAndUserEmail(Long id, String email);
```

o variantes por tenant/alcance.

Eso no reemplaza toda la lógica del service, pero ayuda a que la autorización esté mejor alineada con el acceso a datos.

---

## Señales de que el controller está cargando demasiado

Estas señales suelen hacer ruido:

- muchos ifs de negocio en controller
- ownership resuelto ahí mismo
- estado del recurso chequeado en HTTP layer
- lógica repetida entre endpoints
- services demasiado finos o casi vacíos
- controller mezclando seguridad real con mapping y transporte

Eso suele indicar que parte del trabajo debería bajar a service.

---

## Señales de que el service está cargando demasiado solo

Estas también hacen ruido:

- controllers sin ninguna barrera visible
- endpoints que parecen abiertos hasta leer mucho más adentro
- requests claramente fuera de grupo correcto llegando profundo
- poca claridad sobre qué endpoints son sensibles
- falta de declaratividad de seguridad en el borde

Eso suele indicar que el controller debería expresar al menos la barrera general.

---

## Qué relación tiene esto con testeabilidad

Repartir bien la autorización también mejora tests.

### Controller / integración
te ayuda a probar:
- autenticación
- barreras generales
- roles o authorities mínimas

### Service / unit o integration más fina
te ayuda a probar:
- ownership
- estado
- contexto
- tenant
- reglas reales del negocio

Si todo vive en un solo lugar, la suite suele quedar más incómoda y menos expresiva.

---

## Qué gana el backend con este reparto

Cuando la autorización está mejor repartida entre controller y service, el backend gana:

- barreras visibles en el borde
- reglas reales más cerca del negocio
- menos duplicación
- menos fe ciega en anotaciones
- menor riesgo de huecos por endpoints nuevos
- mejor legibilidad de seguridad
- mejor mantenibilidad

No es un capricho arquitectónico.
Es una forma de reducir errores reales.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- controllers con barreras declarativas claras
- services que entienden actor + recurso + contexto
- poca lógica de negocio fina en controller
- poca ingenuidad en services
- separación razonable entre acceso general y autorización real
- menos duplicación entre endpoints

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- controller “muy inteligente” y service casi vacío
- controller “muy vacío” y endpoints sin barreras visibles
- services reutilizados sin controles consistentes
- `hasRole()` como única defensa
- ownership ausente
- lógica de tenant repartida caóticamente
- nadie sabe bien qué parte de la autorización vive dónde

---

## Checklist práctico

Cuando revises una app Spring, preguntate:

- ¿qué barrera general expresa el controller?
- ¿qué autorización fina vive en service?
- ¿el service conoce al actor y al recurso?
- ¿hay ownership?
- ¿hay tenant o contexto?
- ¿importa el estado del recurso?
- ¿el controller está mezclando demasiado negocio?
- ¿el service está cargando controles que el borde debería declarar mejor?
- ¿si se agrega otro endpoint que llama el mismo service, la autorización sigue siendo consistente?
- ¿el equipo puede explicar con claridad qué parte del control vive en cada capa?

---

## Mini ejercicio de reflexión

Tomá tres operaciones reales de tu backend y respondé:

1. ¿Qué debería exigir el controller como barrera general?
2. ¿Qué debería decidir el service sobre el recurso real?
3. ¿Qué parte depende del actor?
4. ¿Qué parte depende del estado?
5. ¿Qué parte depende del tenant o contexto?
6. ¿Qué pasaría si otra ruta reutiliza el mismo service?
7. ¿Hoy la autorización está demasiado arriba, demasiado abajo o razonablemente repartida?

Ese ejercicio ayuda mucho a ordenar mejor el modelo y a detectar dónde hoy tu autorización está demasiado tosca o demasiado dispersa.

---

## Resumen

No conviene pensar autorización como:

- solo en controller
- o solo en service

Lo sano suele ser:

## Controller
- barrera general
- actor mínimo correcto
- capacidad gruesa visible

## Service
- recurso concreto
- ownership
- estado
- tenant
- reglas reales del negocio

En resumen:

> Un backend más fuerte no elige entre controller o service como si fueran opciones excluyentes.  
> Reparte mejor la autorización para que el borde filtre temprano y el negocio decida de verdad.

---

## Próximo tema

**Ownership y acceso al recurso correcto**
