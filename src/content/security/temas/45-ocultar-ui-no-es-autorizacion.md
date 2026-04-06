---
title: "Ocultar UI no es autorización"
description: "Por qué ocultar botones, rutas o acciones en el frontend no reemplaza la autorización real en una aplicación Java con Spring Boot y Spring Security. Cómo evitar que el backend dependa de la interfaz para proteger recursos, operaciones y datos sensibles."
order: 45
module: "Autorización"
level: "base"
draft: false
---

# Ocultar UI no es autorización

## Objetivo del tema

Entender por qué, en una aplicación Java + Spring Boot + Spring Security, ocultar elementos de la interfaz no equivale a autorizar correctamente en backend.

Este tema importa mucho porque es uno de los errores más comunes y más persistentes en sistemas reales.

Aparece cuando el equipo piensa algo como:

- “si no mostramos el botón, no lo van a intentar”
- “si la opción no aparece en el menú, ya está protegida”
- “si el frontend no renderiza esa acción, no hay riesgo”
- “si la pantalla no expone ese flujo, no se puede usar”
- “si React, Angular o la app mobile no lo deja, entonces backend ya está cubierto”

Ese razonamiento es peligrosísimo.

En resumen:

> la UI puede esconder una acción.  
> Pero solo el backend puede decidir realmente si esa acción está permitida o no.

---

## Idea clave

La interfaz sirve para:

- mejorar experiencia
- ordenar navegación
- mostrar u ocultar opciones
- reducir errores accidentales
- guiar al usuario legítimo

Pero no sirve como frontera real de seguridad.

En resumen:

> ocultar una acción en frontend puede mejorar UX, pero no debería ser jamás la defensa principal que impide su ejecución.

Porque el cliente puede ser:

- manipulado
- imitado
- bypassed
- reemplazado por Postman, curl o scripts
- alterado desde DevTools
- reproducido fuera de la UI prevista

---

## Qué problema intenta resolver este tema

Este tema intenta evitar patrones como:

- endpoints sensibles “protegidos” solo porque la UI no los muestra
- botones ocultos que el backend igual aceptaría si alguien llama el endpoint a mano
- roles o permisos aplicados solo en frontend
- acciones admin que siguen expuestas por API aunque la pantalla no las renderice
- recursos ajenos accesibles si alguien cambia un ID
- flags delicados ocultos en formularios, pero igual aceptados por backend
- falsa sensación de seguridad porque “la interfaz nunca mandaría eso”

Es decir:

> el problema no es ocultar UI.  
> El problema es confiar en que esa ocultación reemplaza la autorización real.

---

## Error mental clásico

Muchas apps caen en una lógica como esta:

- usuario común no ve botón “Eliminar”
- entonces asumimos que no puede borrar
- soporte no ve botón “Refund”
- entonces asumimos que no puede reembolsar
- la UI no muestra `ownerId`
- entonces asumimos que no pueden manipularlo
- el panel no expone cierta ruta
- entonces asumimos que nadie la va a tocar

Todo eso es incorrecto si el backend no valida por sí mismo:

- actor
- permiso
- recurso
- ownership
- tenant
- estado
- acción concreta

---

## La interfaz no controla el protocolo

Esto conviene entenderlo bien.

El frontend no “encierra” mágicamente al usuario dentro de sus botones.

Al final del día, el backend recibe:

- requests HTTP
- headers
- query params
- path params
- JSON bodies
- cookies o tokens

No recibe “intenciones aprobadas por la UI”.

Recibe input externo.

Y ese input puede venir de muchas fuentes distintas a la interfaz normal.

---

## Ejemplo clásico: botón oculto

Supongamos que en la UI solo los admins ven el botón “Reembolsar”.

### Frontend

- si `isAdmin === true`, renderiza botón
- si no, no lo muestra

Y el equipo se queda tranquilo.

### Pero el endpoint existe

```java
@PostMapping("/orders/{id}/refund")
public ResponseEntity<Void> refund(@PathVariable Long id) {
    orderService.refund(id);
    return ResponseEntity.noContent().build();
}
```

Si el backend no valida nada serio, un usuario no admin podría intentar llamar igual esa ruta.

### Conclusión

El hecho de que la UI no lo haya mostrado no tiene ningún peso real para el backend.

---

## Ejemplo con validación floja en controller

```java
@PostMapping("/orders/{id}/refund")
public ResponseEntity<Void> refund(@PathVariable Long id) {
    orderService.refund(id);
    return ResponseEntity.noContent().build();
}
```

Y el service:

```java
public void refund(Long orderId) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    order.refund();
    orderRepository.save(order);
}
```

### Problema

Si la UI ocultaba el botón a usuarios comunes, pero el backend no valida:

- authority
- actor
- tenant
- estado
- recurso

entonces cualquiera que logre llamar el endpoint puede intentar ejecutar la acción.

Eso muestra muy bien por qué ocultar UI no es autorización.

---

## Ejemplo mejor: backend autoriza de verdad

### Controller

```java
@PreAuthorize("hasAuthority('order:refund')")
@PostMapping("/orders/{id}/refund")
public ResponseEntity<Void> refund(@PathVariable Long id, Authentication authentication) {
    orderService.refund(id, authentication.getName());
    return ResponseEntity.noContent().build();
}
```

### Service

```java
public void refund(Long orderId, String username) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    User actor = userRepository.findByEmail(username).orElseThrow();

    if (!actor.canAccessTenant(order.getTenantId())) {
        throw new AccessDeniedException("No autorizado");
    }

    if (!order.canBeRefunded()) {
        throw new IllegalStateException("La orden no puede reembolsarse");
    }

    order.refund();
    orderRepository.save(order);
}
```

### Qué mejora esto

Ahora, aunque la UI mostrara mal u ocultara mal el botón:

- el backend sigue validando permiso general
- sigue validando tenant
- sigue validando estado
- sigue validando la operación real

La seguridad ya no depende de la interfaz.

---

## La UI solo puede ayudar a reducir intentos accidentales

Ocultar una acción en frontend sí puede ser útil para:

- no confundir al usuario
- evitar clicks equivocados
- reducir rutas visibles innecesarias
- mejorar experiencia
- mostrar solo lo que normalmente corresponde

Eso está perfecto.

Pero sigue siendo una mejora de UX o ergonomía.
No una garantía de seguridad.

### Regla práctica

- ocultar UI: bien como UX
- confiar en eso como defensa: mal como seguridad

---

## Caso típico: menús y navegación

Otro error frecuente es pensar que porque alguien no ve una sección del menú, entonces ya no puede acceder a esa funcionalidad.

### Ejemplo

- el menú admin no aparece para usuarios comunes
- pero la ruta `/admin/reports/export` sigue existiendo
- y el backend no valida bien
- o valida solo una barrera gruesa equivocada

Resultado:
- el menú estaba oculto
- la funcionalidad seguía accesible

En backend, el menú nunca debería ser la barrera real.

---

## Caso típico: formularios con campos ocultos

Esto también es muy común.

### Ejemplo

La UI no muestra campos como:

- `role`
- `enabled`
- `ownerId`
- `price`
- `status`
- `approved`

y entonces el equipo siente que ya está protegido.

Pero si el DTO de entrada acepta esos campos, alguien puede enviarlos igual.

### Ejemplo riesgoso

```java
public class UpdateUserRequest {
    private String name;
    private String email;
    private String role;
    private Boolean enabled;
}
```

Aunque la UI no renderice `role`, el backend podría aceptarlo si no valida correctamente.

### Conclusión

Un campo oculto no es un campo protegido.
Es solo un campo no mostrado.

---

## Caso típico: frontend decide el permiso

Otra mala práctica es poner la lógica real de permisos principalmente en frontend.

### Ejemplo

```javascript
if (currentUser.role === "ADMIN") {
  showRefundButton = true;
}
```

Esto puede estar bien para renderizar UI.
Pero si el backend después no exige el mismo control o uno mejor, el sistema queda frágil.

### Forma sana de pensarlo

- frontend usa permisos para mostrar experiencia correcta
- backend usa permisos para decidir acceso real

El backend es la autoridad real.
El frontend solo consume y refleja.

---

## Caso típico: resources por ID

Supongamos que la UI solo muestra “Mis órdenes”.

Pero el endpoint hace esto:

```java
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id) {
    return orderService.getById(id);
}
```

Y el service:

```java
public OrderResponse getById(Long id) {
    Order order = orderRepository.findById(id).orElseThrow();
    return orderMapper.toResponse(order);
}
```

### La UI puede estar perfecta

- lista solo órdenes propias
- no muestra IDs ajenos
- no da links a recursos ajenos

### Pero alguien igual podría probar otro ID

Y si el backend no valida ownership, el acceso lateral sigue existiendo.

Esto muestra muy bien por qué la UI no puede reemplazar autorización.

---

## La UI puede mentir, el backend no debería creerle

Otra forma útil de pensarlo:

- la UI puede estar mal programada
- puede tener un bug
- puede renderizar de más
- puede renderizar de menos
- puede filtrar mal
- puede ser alterada
- puede no existir, porque el request puede venir de otro cliente

Entonces el backend no debería confiar en:

- qué botón se mostró
- qué pantalla se vio
- qué opción se ocultó
- qué valores se suponía que iba a mandar esa UI

El backend debe decidir con sus propias reglas.

---

## Qué relación tiene esto con mass assignment

Muchísima.

Mass assignment aparece justamente cuando el backend acepta campos de más aunque la UI no los mande “normalmente”.

### Ejemplo

La UI no muestra:
- `featured`
- `approved`
- `ownerId`

Pero el DTO o la entidad los acepta.
Entonces alguien puede fabricarlos en el request.

Eso es exactamente el tipo de hueco que aparece cuando el backend confía demasiado en cómo “se ve” la interfaz.

---

## Qué relación tiene esto con IDOR

También muchísima.

IDOR aparece muchas veces cuando la UI:

- solo muestra recursos propios
- navega solo dentro del universo correcto

pero el backend:

- responde a cualquier ID válido

Entonces el problema no es que la UI esté mal.
Es que el backend creyó que la UI ya resolvía acceso al recurso correcto.

---

## Qué relación tiene esto con roles y admin

Otro clásico es pensar:

- “esta pantalla solo la ve admin”
- entonces el endpoint ya no necesita más control

Eso también es flojo.

Incluso para admin pueden seguir importando:

- tenant
- scope
- acción
- recurso concreto
- estado
- trazabilidad

Ocultar o mostrar la pantalla correcta mejora experiencia.
No reemplaza la autorización real del lado servidor.

---

## Qué hacer correctamente

La regla sana suele ser esta:

### En frontend
- mostrar lo que razonablemente corresponde
- ocultar lo que no debería usarse normalmente
- reducir fricción y confusión

### En backend
- validar siempre actor
- permiso o authority
- recurso
- ownership
- tenant
- estado
- acción
- reglas del negocio

Ambas capas pueden alinearse.
Pero no cumplen la misma función.

---

## Ejemplo sano de alineación frontend/backend

### Frontend
- solo muestra botón “Cancelar” si la orden parece cancelable y el usuario parece tener acceso

### Backend
- valida que el actor sea dueño o tenga alcance
- valida que la orden esté en estado cancelable
- valida tenant
- valida permiso general si corresponde

### Resultado

Si el frontend se equivoca:
- el backend igual protege

Si el frontend acierta:
- la UX es mejor

Ese es el equilibrio correcto.

---

## Qué señales muestran que la app depende demasiado de la UI

Estas cosas suelen hacer ruido rápido:

- “esto no pasa porque la pantalla no lo deja”
- “ese campo no se puede tocar porque no está en el form”
- “esa acción está segura porque el botón no se ve”
- “ese endpoint no importa porque nadie llega desde el menú”
- “si el usuario común no tiene esa vista, ya no hace falta validar más”
- DTOs que aceptan más de lo que la UI muestra
- controllers que confían en el flujo visual
- backend que asume que los requests siempre vienen de la UI oficial

Si escuchás varias de esas frases, probablemente hay sobreconfianza en la interfaz.

---

## Qué gana el backend si deja de confiar en la UI

Cuando el backend deja de tratar la UI como barrera real, gana:

- menos IDOR
- menos mass assignment
- menos sobreconfianza en frontend
- endpoints más fuertes
- mejor seguridad ante clientes alternativos
- menor daño por bugs de interfaz
- mejor alineación entre UX y autorización real

No significa duplicar todo sin pensar.
Significa dejar claro quién decide realmente el acceso.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- frontend que oculta acciones por UX
- backend que igual valida todo lo importante
- DTOs acotados
- endpoints con barreras reales
- services que entienden actor + recurso + estado
- poca confianza en que la UI siempre enviará “lo correcto”

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- backend que acepta cosas “porque la UI nunca las mandaría”
- endpoints sensibles sin control porque la pantalla no los muestra
- campos internos aceptados aunque no estén en el formulario
- recursos por ID sin ownership porque la tabla solo lista los propios
- menús ocultos tratados como si fueran seguridad real
- lógica de permisos fuerte en frontend y débil en backend

---

## Checklist práctico

Cuando revises una app Spring, preguntate:

- ¿qué parte de esta “protección” depende solo de que la UI no muestre algo?
- ¿el backend acepta igual la acción si alguien llama el endpoint a mano?
- ¿el DTO permite campos que el form no renderiza?
- ¿el endpoint por ID valida ownership?
- ¿la autoridad real está en backend o en una condición de renderizado?
- ¿el tenant sale del contexto o de lo que manda la UI?
- ¿el estado del recurso se valida del lado servidor?
- ¿qué pasaría si un usuario usa Postman en vez del frontend?
- ¿qué bug de interfaz hoy abriría demasiado acceso porque el backend confía en la pantalla?
- ¿el equipo distingue bien entre UX y autorización?

---

## Mini ejercicio de reflexión

Tomá tres acciones que hoy la UI oculta para ciertos usuarios y respondé:

1. ¿Qué endpoint ejecutan?
2. ¿Qué validación real hace el backend?
3. ¿Qué pasaría si alguien llama el endpoint manualmente?
4. ¿Qué campos no visibles acepta igual el request?
5. ¿Qué ownership, tenant o estado se valida en servidor?
6. ¿La protección real vive en backend o en renderizado?
7. ¿Qué daño haría un bug de frontend en esa pantalla?

Ese ejercicio suele mostrar muy rápido dónde hoy la seguridad está demasiado apoyada en la interfaz.

---

## Resumen

Ocultar UI no es autorización.

La interfaz puede:

- ordenar
- esconder
- simplificar
- guiar

Pero el backend debe:

- decidir
- validar
- restringir
- rechazar
- proteger recursos y acciones reales

En resumen:

> Un sistema más maduro usa la UI para mejorar la experiencia, no para reemplazar la seguridad.  
> La autorización real siempre debería poder sostenerse aunque el cliente muestre de más, muestre de menos o directamente no exista.

---

## Próximo tema

**IDOR y acceso horizontal entre usuarios**
