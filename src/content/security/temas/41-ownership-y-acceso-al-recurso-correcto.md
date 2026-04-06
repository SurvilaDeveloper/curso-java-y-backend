---
title: "Ownership y acceso al recurso correcto"
description: "Cómo modelar ownership y acceso al recurso correcto en una aplicación Java con Spring Boot y Spring Security. Por qué no alcanza con estar autenticado o tener un rol, y cómo validar que el actor realmente pueda operar sobre ese objeto concreto."
order: 41
module: "Autorización"
level: "base"
draft: false
---

# Ownership y acceso al recurso correcto

## Objetivo del tema

Entender cómo modelar y validar **ownership** en una aplicación Java + Spring Boot + Spring Security, para evitar uno de los errores más comunes en seguridad backend:

- proteger bien el endpoint
- autenticar correctamente al actor
- tener incluso roles razonables
- pero devolver o modificar **el recurso equivocado**

Este tema importa mucho porque muchísimos problemas reales aparecen justo ahí:

- el usuario está autenticado
- el endpoint no es público
- la operación parece “protegida”
- pero el backend no valida si ese recurso realmente corresponde a ese actor

Y ahí aparecen cosas como:

- IDOR
- acceso lateral entre cuentas
- lectura de datos ajenos
- edición de recursos ajenos
- cancelaciones, reembolsos o cambios sobre objetos que no corresponden

En resumen:

> no alcanza con saber quién es el actor.  
> También hay que saber si ese actor puede tocar **ese recurso concreto**.

---

## Idea clave

Ownership, en términos prácticos, significa algo como:

- de quién es este recurso
- quién tiene derecho legítimo sobre él
- qué relación válida existe entre el actor actual y ese objeto concreto

En resumen:

> una autorización madura no solo pregunta “¿quién sos?” o “¿qué rol tenés?”  
> También pregunta “¿qué relación tenés con este recurso puntual?”.

Eso es justamente lo que evita que el backend responda bien a la identidad general, pero mal al objeto específico.

---

## Qué problema intenta resolver ownership

Ownership intenta evitar situaciones como estas:

- un usuario cambia el `id` del path y ve la orden de otra persona
- un actor autenticado descarga una factura ajena
- un usuario actualiza un recurso porque conoce el UUID
- una cuenta de soporte ve demasiado porque no tiene alcance bien limitado
- una cuenta de tenant A toca recursos de tenant B
- un recurso se devuelve “porque existe”, no porque corresponda

Es decir:

> ownership no es un detalle.  
> Es una parte central de la autorización sobre recursos.

---

## Error mental clásico

Muchos sistemas piensan algo como:

- “si está logueado, puede consultar”
- “si tiene rol USER, puede usar este endpoint”
- “si tiene authority `order:read`, puede leer órdenes”
- “si conocemos el id, lo buscamos y listo”

Eso es justamente lo que deja huecos.

Porque todavía falta responder:

- ¿puede leer **esta** orden?
- ¿puede editar **este** perfil?
- ¿puede borrar **este** archivo?
- ¿puede ver **esta** factura?
- ¿puede hacerlo en este tenant?
- ¿puede hacerlo en este estado?

Ahí ownership se vuelve central.

---

## Qué suele ser un recurso

En backend, un recurso puede ser:

- orden
- factura
- perfil
- documento
- comentario
- publicación
- ticket
- archivo
- producto
- cuenta bancaria
- suscripción
- carrito
- dirección
- configuración de tenant

El patrón es siempre parecido:

- alguien pide operar sobre un recurso identificado por ID, slug, UUID o similar
- el backend lo encuentra
- y la pregunta crítica es si debería permitir esa operación para ese actor

---

## Qué NO alcanza para resolver ownership

Varias cosas pueden ayudar, pero por sí solas no alcanzan.

## No alcanza con:
- estar autenticado
- tener un rol general
- tener una authority general
- no mostrar el botón en frontend
- confiar en el `userId` enviado por el cliente
- asumir que si el flujo es “normal”, el actor solo pedirá lo suyo

Ownership exige validación real del recurso y de la relación entre actor y objeto.

---

## Ejemplo clásico de problema

```java
@PreAuthorize("isAuthenticated()")
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id) {
    return orderService.getById(id);
}
```

A simple vista parece bastante razonable.

- autenticado: sí
- endpoint protegido: sí

### Pero falta la pregunta clave

- ¿esa orden le pertenece al actor?

Si el `service` hace esto:

```java
public OrderResponse getById(Long id) {
    Order order = orderRepository.findById(id).orElseThrow();
    return orderMapper.toResponse(order);
}
```

entonces el backend está expuesto a acceso lateral si el actor prueba otros IDs válidos.

---

## Ejemplo mejor con ownership explícito

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

Ahora el backend no solo sabe:

- quién es el actor

También sabe:

- si la orden corresponde a ese actor

Eso ya cambia muchísimo la seguridad real.

---

## Ownership no siempre significa “solo dueño directo”

Este punto es importante.

A veces ownership es simple:

- el recurso pertenece a un usuario específico

Pero otras veces puede ser más complejo.

### Ejemplos

- soporte puede ver recursos ajenos, pero no todos
- admin puede ver recursos de su tenant, no globalmente
- manager puede ver recursos de su equipo
- cuenta técnica puede operar sobre cierto tipo de recursos, no sobre todos
- el actor puede editar solo si creó el recurso, pero leer si pertenece a la misma organización

Entonces ownership puede implicar:

- dueño directo
- misma organización
- mismo tenant
- mismo equipo
- relación funcional válida
- alcance delegado

Lo importante es que el backend lo modele explícitamente.

---

## Ownership y tenant no son lo mismo

A veces se mezclan, pero no son exactamente iguales.

## Ownership
responde:
- ¿de quién es este recurso?

## Tenant / scope
responde:
- ¿en qué universo organizacional vive este recurso?
- ¿este actor tiene alcance dentro de ese universo?

### Ejemplo

Un actor puede pertenecer al mismo tenant que un recurso, pero igual no ser su dueño directo.

O puede tener alcance de soporte sobre ese tenant, pero no permiso para editar.

Por eso conviene separar:

- ownership
- scope
- rol
- permiso
- estado

---

## Ownership y acción tampoco son lo mismo

Otro error común es pensar que si alguien tiene ownership, puede hacer cualquier cosa.

No necesariamente.

### Ejemplo

Un usuario puede ser dueño de una orden y:

- verla
- descargar su factura

pero no necesariamente:

- reembolsarla
- reabrirla
- cambiar ciertos estados
- acceder a notas internas
- editarla después de cierto momento

Entonces la autorización real puede requerir:

- recurso correcto
- actor correcto
- acción correcta
- estado correcto

Ownership ayuda mucho, pero no reemplaza todo el resto.

---

## Cómo pensar ownership sanamente

Una forma útil de pensarlo es esta:

### 1. Identidad del actor
¿quién es?

### 2. Recurso concreto
¿qué objeto pidió?

### 3. Relación actor-recurso
¿es suyo? ¿tiene alcance? ¿tiene delegación válida?

### 4. Acción
¿quiere ver, editar, borrar, exportar, aprobar?

### 5. Estado/contexto
¿en este momento y bajo estas condiciones corresponde?

Ese esquema ordena muchísimo la autorización real.

---

## Evitar confiar en IDs enviados por el cliente

Un patrón muy riesgoso es aceptar cosas como:

```java
@GetMapping("/orders")
public List<OrderResponse> findByUser(@RequestParam Long userId) {
    return orderService.findByUser(userId);
}
```

Si el caso de uso es “mis órdenes”, el backend no debería confiar en ese `userId` del request.

Más sano:

```java
@GetMapping("/orders/me")
public List<OrderResponse> myOrders(Authentication authentication) {
    return orderService.findByCurrentUser(authentication.getName());
}
```

Eso reduce muchísimo la superficie.

### Regla práctica

Si el backend ya puede deducir la identidad del actor desde autenticación, no conviene pedirle al cliente que la “reconfirme” con un parámetro manipulable.

---

## Ownership y consultas desde repository

A veces la mejor forma de reforzar ownership no es solo validar después, sino consultar con alcance correcto desde el principio.

### En vez de esto

```java
Optional<Order> findById(Long id);
```

### A veces conviene algo así

```java
Optional<Order> findByIdAndUserEmail(Long id, String email);
```

o

```java
Optional<Order> findByIdAndTenantId(Long id, Long tenantId);
```

o combinaciones equivalentes según el dominio.

### Qué ventaja tiene

- trae menos de más
- reduce exposición accidental
- alinea acceso a datos con autorización
- evita cierta lógica ingenua de “traigo y después veo”

Esto no reemplaza toda la lógica de negocio, pero ayuda mucho.

---

## Ejemplo por consulta acotada

### Service

```java
public OrderResponse getVisibleOrder(Long orderId, String username) {
    Order order = orderRepository.findByIdAndUserEmail(orderId, username)
            .orElseThrow(() -> new AccessDeniedException("No autorizado"));

    return orderMapper.toResponse(order);
}
```

### Qué mejora

- el recurso ya viene con ownership aplicado
- el sistema no necesita cargar una orden ajena para después descartarla
- la consulta refleja mejor la política de acceso

No siempre alcanza para todo, pero es un patrón muy sano cuando aplica.

---

## Qué pasa con soporte y admin

Este es un punto delicado.

Ownership no significa que solo el dueño directo pueda ver algo.
Pero tampoco significa que soporte y admin puedan ver todo sin límites.

### Ejemplo

Soporte puede:
- ver la orden de un usuario
- agregar una nota

Pero no necesariamente:
- reembolsar
- cambiar precio
- ver todos los datos internos
- cruzar tenants

Entonces el backend puede necesitar reglas como:

- dueño directo: acceso completo a ciertas vistas propias
- soporte: acceso de lectura parcial
- admin de tenant: acceso amplio dentro del tenant
- admin global: acceso más alto, pero no infinito por defecto

Ownership sigue importando porque ayuda a ordenar quién toca qué y con qué profundidad.

---

## Qué pasa con recursos no encontrados

Acá hay una decisión de diseño y seguridad interesante.

Supongamos que el actor pide un recurso ajeno.

Podés responder con:

- `403 Forbidden`
- o `404 Not Found`

según la política del sistema.

Lo importante no es memorizar una única respuesta correcta universal.

Lo importante es decidir con criterio:

- cuánto querés revelar
- qué señal externa das
- cómo se comporta la API en estos casos
- si preferís ocultar existencia del recurso o expresar acceso denegado

Ownership y enumeración muchas veces se tocan en este punto.

---

## Qué relación tiene esto con IDOR

Directísima.

IDOR suele aparecer cuando el backend:

- recibe un identificador
- encuentra el recurso
- no valida bien la relación actor-recurso
- responde o actúa igual

Eso es exactamente un fallo de ownership o de autorización sobre el objeto concreto.

Por eso aprender ownership bien es una de las mejores defensas conceptuales contra IDOR.

---

## Qué señales muestran que ownership está mal resuelto

Estas cosas suelen hacer mucho ruido:

- mucho acceso por ID y poca validación real
- `findById()` seguido de response directa
- confianza en `userId` o `ownerId` del request
- services que no reciben al actor
- roles gruesos usados como sustituto del recurso correcto
- support/admin con alcance ambiguo
- queries que traen datos ajenos y filtran tarde
- frontend sosteniendo parte de la “seguridad” con lo que muestra u oculta

---

## Qué papel juega el estado del recurso

Aunque ownership sea correcto, el estado puede cambiar la decisión.

### Ejemplo

El dueño de una orden puede:

- verla siempre

pero no necesariamente:

- cancelarla siempre
- editar la dirección siempre
- descargar ciertos documentos internos
- modificarla si ya pasó a `SHIPPED`

Entonces autorización madura sobre recursos suele ser algo como:

- ownership correcto
- acción correcta
- estado correcto

No solo uno de esos elementos.

---

## Qué gana el backend si modela ownership bien

Cuando ownership está bien resuelto, el backend gana:

- menos acceso lateral
- menos IDOR
- mejor alineación entre autenticación y autorización real
- queries más sanas
- menos confianza en el cliente
- menos necesidad de depender de la UI para “limitar”
- mejor base para multi-tenant y soporte

No es una mejora cosmética.
Es una mejora fuerte de seguridad real.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- actor explícito en service
- validación real actor-recurso
- queries acotadas cuando tiene sentido
- menos dependencia en IDs enviados por cliente
- soporte y admin con alcance definido
- ownership combinado con estado y acción cuando corresponde

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- `findById` por todos lados
- endpoints “protegidos” pero no restringidos por recurso
- `userId` o `ownerId` en requests donde no deberían estar
- services que no saben quién es el actor
- sobreconfianza en roles gruesos
- respuesta positiva si el recurso existe, aunque no corresponda
- nadie puede explicar bien quién puede tocar qué objeto concreto

---

## Checklist práctico

Cuando revises ownership en una app Spring, preguntate:

- ¿qué recurso concreto está en juego?
- ¿quién debería poder tocarlo?
- ¿cómo se valida la relación actor-recurso?
- ¿se usa el actor del contexto autenticado o se confía en IDs del request?
- ¿el repository trae ya con alcance acotado o trae de más?
- ¿hay tenant o scope adicional?
- ¿qué puede hacer soporte?
- ¿qué puede hacer admin?
- ¿importa el estado del recurso?
- ¿si cambio el ID del path, el backend sigue respondiendo correctamente?

---

## Mini ejercicio de reflexión

Tomá tres endpoints de tu backend que usen `/{id}` y respondé:

1. ¿Qué recurso están trayendo?
2. ¿Quién debería poder acceder a él?
3. ¿Cómo valida hoy el backend que ese recurso corresponde al actor?
4. ¿Depende de rol, ownership o ambos?
5. ¿Podría resolverse mejor desde repository?
6. ¿Qué pasaría si otro usuario autenticado prueba ese mismo ID?
7. ¿Qué parte del control hoy depende demasiado de una suposición del frontend?

Ese ejercicio es excelente para detectar rápido huecos reales de autorización.

---

## Resumen

Ownership significa validar la relación real entre:

- actor
- recurso
- acción
- contexto

No alcanza con:

- estar autenticado
- tener rol
- tener permiso general
- conocer un ID válido

En resumen:

> Un backend más seguro no entrega ni modifica recursos solo porque existen y el actor está logueado.  
> También exige que exista una relación válida entre ese actor y ese objeto concreto.

---

## Próximo tema

**Tenant, scope y límites organizacionales**
