---
title: "IDOR y acceso horizontal entre usuarios"
description: "Cómo entender y prevenir IDOR en una aplicación Java con Spring Boot y Spring Security. Por qué no alcanza con autenticar al actor y proteger el endpoint, y cómo evitar acceso horizontal entre usuarios sobre recursos que existen pero no les corresponden."
order: 46
module: "Autorización"
level: "base"
draft: false
---

# IDOR y acceso horizontal entre usuarios

## Objetivo del tema

Entender qué es **IDOR** y por qué aparece con tanta facilidad en backends hechos con Java + Spring Boot + Spring Security, incluso cuando el sistema:

- autentica bien
- tiene roles
- protege endpoints
- usa JWT o sesiones
- y parece “cerrado”

Este tema importa mucho porque IDOR no suele aparecer como una falla espectacular en la arquitectura general.

Más bien aparece en lugares muy concretos y muy comunes:

- endpoints con `/{id}`
- descargas de archivos
- perfiles
- órdenes
- facturas
- comentarios
- tickets
- documentos
- recursos por UUID o slug

En resumen:

> IDOR aparece cuando el backend responde correctamente a la identidad general del actor, pero no valida correctamente si ese actor puede tocar **ese recurso concreto**.

---

## Idea clave

IDOR significa, en la práctica, que un actor autenticado puede acceder o actuar sobre un objeto que existe, pero que no le corresponde.

En resumen:

> el problema no es que el recurso sea público.  
> El problema es que el recurso existe, el endpoint está protegido, pero la autorización sobre el objeto puntual está mal resuelta.

Por eso IDOR suele estar mucho más cerca de:

- ownership
- tenant
- scope
- recurso correcto
- acceso horizontal

que de autenticación básica.

---

## Qué significa “acceso horizontal”

“Horizontal” quiere decir, a grandes rasgos:

- un usuario común accede a recursos de otro usuario común
- una cuenta del mismo nivel accede lateralmente a otra cuenta del mismo nivel
- un actor autenticado cruza hacia datos ajenos sin necesidad de volverse admin

No es necesariamente un privilegio vertical tipo “de USER a ADMIN”.
Es más bien:

- de un usuario a otro usuario
- de un cliente a otro cliente
- de una cuenta a otra cuenta del mismo nivel

Y justamente por eso se subestima mucho.

---

## Ejemplo clásico de IDOR

Supongamos este endpoint:

```java
@PreAuthorize("isAuthenticated()")
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id) {
    return orderService.getById(id);
}
```

Y en el service:

```java
public OrderResponse getById(Long id) {
    Order order = orderRepository.findById(id).orElseThrow();
    return orderMapper.toResponse(order);
}
```

### ¿Qué pasa si el usuario prueba otro ID?

Si el backend no valida ownership ni tenant ni relación actor-recurso, puede devolver una orden ajena.

Eso es exactamente el tipo de problema que IDOR describe.

### Importante

- el endpoint no era público
- el actor estaba autenticado
- el sistema “tenía seguridad”
- pero igual había acceso horizontal indebido

---

## Error mental clásico

Muchísimos equipos piensan algo como:

- “si está logueado, ya no es grave”
- “si el endpoint no es público, ya está protegido”
- “si los IDs no están en la UI, no los van a probar”
- “si usamos UUID, ya no hay problema”
- “si la tabla solo muestra lo suyo, no hace falta mucho más”
- “si el recurso existe y el actor tiene permiso general de lectura, puede verlo”

Todo eso es insuficiente.

Porque todavía falta la pregunta más importante:

- **¿este recurso puntual corresponde realmente a este actor?**

---

## IDOR no depende del tipo de identificador

Esto es importante.

IDOR puede ocurrir con:

- enteros secuenciales
- UUID
- slugs
- hashes cortos
- referencias compuestas
- IDs opacos

### Los IDs secuenciales suelen empeorarlo

Porque facilitan enumeración.

### Pero usar UUID no lo arregla por sí solo

Si el backend sigue devolviendo cualquier recurso cuyo UUID le manden, el problema sigue existiendo.

UUID puede volver menos trivial adivinar recursos.
Pero no reemplaza autorización.

### Regla sana

- identificador menos predecible: ayuda un poco
- autorización real del recurso: imprescindible

---

## Qué tipo de recursos suelen sufrir IDOR

Este problema aparece muchísimo sobre recursos como:

- órdenes
- facturas
- tickets
- perfiles
- archivos
- mensajes
- comentarios
- direcciones
- favoritos
- historiales
- documentos
- suscripciones
- clientes
- reportes
- exportaciones por ID

En general, cualquier cosa que se consulte o modifique por:

- `/{id}`
- `/{uuid}`
- `?id=...`
- `download/{fileId}`

merece revisión seria.

---

## IDOR no es solo lectura

Otro error frecuente es pensar que IDOR solo aplica a ver datos ajenos.

También puede aparecer al:

- editar
- cancelar
- borrar
- descargar
- aprobar
- cambiar estado
- reembolsar
- exportar
- adjuntar notas
- reasignar

### Ejemplo

```java
@PatchMapping("/addresses/{id}")
public AddressResponse update(@PathVariable Long id, @RequestBody UpdateAddressRequest request) {
    return addressService.update(id, request);
}
```

Si el backend no valida ownership, el usuario podría modificar la dirección de otra persona.

Eso también es acceso horizontal indebido.

---

## Ejemplo típico con perfiles

```java
@PreAuthorize("isAuthenticated()")
@GetMapping("/users/{id}/profile")
public UserProfileResponse getProfile(@PathVariable Long id) {
    return userService.getProfile(id);
}
```

### Problema potencial

Aunque el usuario solo vea su perfil en la UI, si cambia el `id` y el backend responde, puede ver el perfil de otra cuenta.

### Más sano

```java
@GetMapping("/users/me/profile")
public UserProfileResponse getMyProfile(Authentication authentication) {
    return userService.getProfileByUsername(authentication.getName());
}
```

Cuando el caso de uso es “mi recurso”, suele ser mucho mejor no aceptar un identificador manipulable del cliente.

---

## “Mis recursos” debería salir del contexto autenticado

Esta es una regla muy útil.

Si el caso de uso es:

- mis órdenes
- mi perfil
- mis direcciones
- mis tickets
- mis favoritos

entonces el backend normalmente ya debería poder derivar la identidad desde:

- sesión
- JWT
- `Authentication`
- principal autenticado

No conviene pedirle al cliente que confirme:

- `userId`
- `ownerId`
- `accountId`

si eso puede deducirse del contexto autenticado.

Porque ese parámetro agregado suele volverse una superficie de abuso.

---

## Ejemplo mejor con actor explícito

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

    if (!order.getUser().getId().equals(actor.getId())) {
        throw new AccessDeniedException("No autorizado");
    }

    return orderMapper.toResponse(order);
}
```

### Qué mejora esto

Ahora el backend valida:

- actor correcto
- recurso correcto
- relación válida entre ambos

Eso es precisamente lo que frena el acceso horizontal.

---

## Validar después de traer vs consultar ya con ownership

A veces el backend hace:

```java
Order order = orderRepository.findById(id).orElseThrow();
```

y luego valida ownership.

Eso puede estar bien como primer paso.

Pero muchas veces es incluso mejor consultar ya con el alcance correcto.

### Ejemplo

```java
Optional<Order> findByIdAndUserEmail(Long id, String email);
```

Y luego:

```java
public OrderResponse getVisibleOrder(Long orderId, String username) {
    Order order = orderRepository.findByIdAndUserEmail(orderId, username)
            .orElseThrow(() -> new AccessDeniedException("No autorizado"));

    return orderMapper.toResponse(order);
}
```

### Qué ventaja tiene

- el acceso a datos ya respeta ownership
- se reduce exposición accidental
- se alinea consulta con autorización
- se evita traer recursos ajenos para recién luego descartarlos

No siempre reemplaza toda la lógica, pero ayuda muchísimo.

---

## IDOR y multi-tenant

En sistemas multi-tenant, IDOR puede combinarse con fallos de tenant o scope.

### Ejemplo

- el actor tiene permiso `invoice:read`
- pertenece al tenant A
- consulta una factura del tenant B
- el backend solo verifica que la factura exista

Eso no es solo un fallo de tenant.
También es un acceso horizontal entre organizaciones.

### Entonces la validación real puede necesitar:

- ownership
- o tenant correcto
- o scope correcto
- o una combinación de los tres

---

## Soporte y actores internos también pueden sufrir IDOR

No solo los usuarios finales.

Actores internos como:

- soporte
- operaciones
- admin local

también pueden quedar con acceso horizontal indebido si el sistema no modela bien:

- qué tenant pueden tocar
- qué recursos pueden ver
- qué profundidad de acceso tienen
- si pueden leer pero no editar
- si pueden ver ciertos campos pero no otros

A veces el problema no es “usuario común vs otro usuario”.
A veces es “actor interno con alcance demasiado amplio y poco controlado”.

---

## Qué pasa con archivos y descargas

Esta es una zona de muchísimo riesgo.

### Ejemplo

```java
@GetMapping("/files/{id}/download")
public ResponseEntity<Resource> download(@PathVariable Long id) {
    return fileService.download(id);
}
```

Si el backend resuelve el archivo por ID y lo devuelve, pero no valida:

- ownership
- tenant
- alcance
- relación real actor-archivo

puede exponer documentos ajenos de forma muy seria.

### Descargas son especialmente sensibles

Porque muchas veces el impacto de leer un archivo ajeno es altísimo y la interfaz suele ocultar muy bien estos casos hasta que alguien prueba manualmente la URL.

---

## Qué pasa con acciones de cambio

Ejemplo:

```java
@PostMapping("/orders/{id}/cancel")
public ResponseEntity<Void> cancel(@PathVariable Long id, Authentication authentication) {
    orderService.cancel(id, authentication.getName());
    return ResponseEntity.noContent().build();
}
```

Y en service:

```java
public void cancel(Long orderId, String username) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    order.cancel();
    orderRepository.save(order);
}
```

### Problema

Aunque el usuario esté autenticado, si el backend no valida que esa orden le corresponde, puede cancelar una orden ajena.

Eso muestra muy bien que IDOR no es solo ver.
También es actuar lateralmente sobre recursos que no corresponden.

---

## Por qué la UI suele esconder este problema

La UI normalmente:

- lista solo recursos visibles
- no expone IDs ajenos
- no muestra botones sobre recursos ajenos
- ordena la navegación “correcta”

Eso hace que el sistema parezca seguro mientras se usa normalmente.

Pero la seguridad real no se prueba solo con el flujo feliz de la interfaz.
Se prueba preguntando:

- ¿qué pasa si cambian el ID?
- ¿qué pasa si llaman directo el endpoint?
- ¿qué pasa si fabrican el request?

Ahí es donde el backend muestra si realmente autoriza el recurso correcto o no.

---

## Qué señales muestran riesgo de IDOR

Estas cosas suelen hacer muchísimo ruido:

- `findById()` por todos lados
- `@PreAuthorize("isAuthenticated()")` como única defensa
- endpoints con `/{id}` sin actor en service
- confianza en que “la UI solo muestra lo propio”
- `userId` en request para operaciones propias
- queries que traen cualquier recurso por ID y devuelven directo
- soporte/admin local sin validación de tenant o scope
- archivos descargables por id sin ownership

---

## Qué ayuda a prevenir IDOR

Varias prácticas ayudan bastante:

## 1. Derivar identidad del contexto autenticado
No confiar en `userId` enviado por cliente si no hace falta.

## 2. Validar actor + recurso
No solo actor general.

## 3. Consultar ya con alcance correcto
Por ejemplo `findByIdAndOwner...`, `findByIdAndTenant...`.

## 4. Separar bien permisos generales y ownership
Tener authority de lectura no reemplaza la validación del objeto concreto.

## 5. Revisar especialmente endpoints con IDs
Ahí suele esconderse mucho de este problema.

## 6. No confiar en la UI
Ocultar o mostrar cosas no reemplaza autorización real.

---

## Qué relación tiene esto con 403 vs 404

Cuando el recurso no corresponde al actor, algunos sistemas prefieren:

- `403 Forbidden`
- otros `404 Not Found`

No hay una única respuesta universal para todos los casos.

Lo importante es ser consistente y consciente de qué señal querés dar.

### Lo central

Más importante que el código exacto es que el backend:

- no devuelva el recurso
- no actúe sobre él
- no revele más de la cuenta
- no permita acceso lateral

---

## Qué gana el backend si previene bien IDOR

Cuando el backend modela bien esto, gana:

- menos acceso horizontal
- menos fugas entre usuarios
- menos fugas entre tenants
- más coherencia entre autenticación y autorización real
- menos dependencia de UI
- menos endpoints “protegidos” pero vulnerables
- más seguridad sobre recursos concretos

Es una mejora muy real, no un detalle fino.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- actor explícito en service
- validación real sobre el recurso
- queries con ownership o tenant cuando tiene sentido
- menos `userId` manipulable desde cliente
- más endpoints tipo `/me` cuando corresponde
- descargas y acciones por ID con validación fuerte

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- endpoint protegido solo por autenticación
- `findById()` + response directa
- recursos ajenos accesibles si conocés el ID
- formularios o acciones que dependen de que la UI no muestre lo ajeno
- soporte/admin sin límites claros
- queries sin tenant ni ownership en sistemas organizacionales

---

## Checklist práctico

Cuando revises una app Spring en busca de IDOR, preguntate:

- ¿qué endpoints usan `/{id}` o identificadores similares?
- ¿cómo valida el backend que el recurso corresponde al actor?
- ¿el actor se toma del contexto autenticado o del request?
- ¿se valida ownership?
- ¿se valida tenant o scope?
- ¿la query ya trae el recurso acotado o trae cualquiera?
- ¿qué pasa si otro usuario autenticado cambia el ID?
- ¿qué pasa con archivos, exportaciones y descargas?
- ¿qué acciones laterales podría ejecutar hoy alguien del mismo nivel?
- ¿la seguridad real depende en parte de que la UI no exponga esos IDs?

---

## Mini ejercicio de reflexión

Tomá cinco endpoints de tu backend con identificadores de recurso y respondé:

1. ¿Qué recurso exponen?
2. ¿Quién debería poder verlo o modificarlo?
3. ¿Cómo valida hoy el backend esa relación?
4. ¿La validación depende de ownership, tenant o scope?
5. ¿Se podría reforzar desde repository?
6. ¿Qué pasaría si un actor del mismo nivel cambia el ID manualmente?
7. ¿Qué endpoint te parece hoy más propenso a acceso horizontal?

Ese ejercicio es excelente para detectar rápido dónde tu backend todavía confunde “estar autenticado” con “poder tocar ese objeto”.

---

## Resumen

IDOR aparece cuando un actor autenticado puede acceder o actuar sobre un recurso ajeno porque el backend no valida bien la relación entre:

- actor
- recurso
- acción
- ownership
- tenant
- scope

No alcanza con:

- estar logueado
- proteger el endpoint
- usar UUID
- ocultar la UI

En resumen:

> Un backend más seguro no responde “sí” solo porque el recurso existe y el actor está autenticado.  
> También exige que exista una relación válida entre ese actor y ese objeto concreto, y justamente ahí es donde IDOR deja de tener espacio.

---

## Próximo tema

**Datos sensibles: ver no siempre implica editar**
