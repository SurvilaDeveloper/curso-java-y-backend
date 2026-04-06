---
title: "Pensamiento adversarial aplicado a una app Spring"
description: "Cómo aprender a mirar una aplicación Java con Spring Boot no solo desde el caso feliz, sino también desde el abuso posible. Qué preguntas conviene hacerse para detectar recorridos peligrosos antes de que aparezcan como incidente."
order: 8
module: "Fundamentos"
level: "intro"
draft: false
---

# Pensamiento adversarial aplicado a una app Spring

## Objetivo del tema

Aprender a mirar una aplicación hecha con Java + Spring no solo desde cómo **debería usarse**, sino también desde cómo podría:

- abusarse
- forzarse
- recorrerse fuera de secuencia
- combinarse de forma dañina
- aprovechar confianza mal ubicada
- crecer hacia algo más sensible

Este tema es importante porque una gran parte de la seguridad backend no depende de memorizar ataques, sino de desarrollar una forma de pensar menos ingenua.

---

## Idea clave

Pensar adversarialmente no significa volverse paranoico.

Significa dejar de mirar el sistema solo desde el flujo ideal.

En resumen:

> Una app Spring bien hecha para el caso feliz puede seguir siendo muy débil si no fue pensada también para el actor equivocado, el request fabricado, la secuencia inesperada o la combinación abusiva de capacidades.

---

## Qué significa “pensamiento adversarial”

Es la capacidad de preguntar:

- ¿qué pasaría si alguien usa esto fuera del flujo previsto?
- ¿qué pasaría si repite esta request?
- ¿qué pasaría si cambia este ID?
- ¿qué pasaría si combina este endpoint con otro?
- ¿qué pasaría si ya viene autenticado pero no debería poder hacer esto?
- ¿qué pasaría si un soporte usa algo pensado para admin?
- ¿qué pasaría si una integración externa manda algo raro?
- ¿qué pasaría si el cliente miente?
- ¿qué pasaría si un actor ya consiguió una pequeña ventaja y ahora intenta crecer?

No es pensar solo en “hackers”.
Es pensar en:

- abuso
- error
- automatización
- escalada
- movimiento lateral
- confianza excesiva
- recorrido de daño

---

## El caso feliz no alcanza

Una app Spring suele diseñarse alrededor del caso feliz:

- el usuario manda lo que corresponde
- la UI guía bien
- el request viene con sentido
- el flujo se sigue en orden
- cada actor usa lo que “le toca”
- las integraciones mandan lo correcto
- los estados cambian como esperamos

Eso está bien para construir funcionalidad.

Pero no alcanza para construir seguridad.

### Ejemplo

Caso feliz:

1. el usuario crea una orden
2. paga
3. la orden pasa a `PAID`
4. soporte la revisa
5. logística la envía

Caso adversarial:

1. el usuario intenta crear varias órdenes iguales
2. altera campos del request
3. prueba IDs ajenos
4. repite pagos o cancela fuera de secuencia
5. fuerza transiciones inválidas
6. intenta usar endpoints de soporte
7. automatiza consultas para extraer contexto

El backend seguro debe pensar también en esa segunda película.

---

## Cómo se ve esto en una app Spring

En Spring, el pensamiento adversarial ayuda a revisar mejor cosas como:

- `@RequestBody`
- `@PathVariable`
- `@RequestParam`
- autenticación
- autorización
- transiciones de estado
- búsquedas y filtros
- servicios internos
- cuentas técnicas
- webhooks
- integraciones
- endpoints admin
- DTOs
- repositorios
- responses

La pregunta no es solo:

- “¿funciona?”

También es:

- “¿cómo podría usarse mal?”

---

## Error mental clásico

Muchos equipos preguntan:

- ¿el endpoint responde bien?
- ¿la validación funciona?
- ¿la UI guía el flujo?
- ¿el token se valida?
- ¿el rol está presente?

Todo eso sirve.

Pero faltan preguntas como:

- ¿qué pasa si alguien se salta la UI?
- ¿qué pasa si manipula el payload?
- ¿qué pasa si adivina IDs?
- ¿qué pasa si usa este endpoint 500 veces?
- ¿qué pasa si prueba estados no previstos?
- ¿qué pasa si encadena esto con otra operación?
- ¿qué pasa si ya tiene una cuenta válida pero demasiado cerca del poder?

Ahí empieza el pensamiento adversarial útil.

---

## Ejemplo 1: request correcto vs request fabricado

Supongamos este endpoint:

```java
@PostMapping("/orders")
public OrderResponse create(
        @Valid @RequestBody CreateOrderRequest request,
        Authentication authentication) {
    return orderService.create(request, authentication.getName());
}
```

Caso feliz:

- `productId` válido
- `quantity` razonable
- usuario autenticado legítimo
- flujo normal

Pensamiento adversarial:

- ¿qué pasa si manda `quantity = 1000000`?
- ¿qué pasa si repite el mismo request muchas veces?
- ¿qué pasa si intenta mandar campos extra?
- ¿qué pasa si el producto ya no existe?
- ¿qué pasa si el stock cambió?
- ¿qué pasa si automatiza intentos con muchos productos?
- ¿qué pasa si intenta provocar un estado intermedio incoherente?

La diferencia entre una app funcional y una app más segura suele empezar ahí.

---

## Ejemplo 2: autenticado pero abusando

Supongamos este endpoint:

```java
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id, Authentication authentication) {
    return orderService.getVisibleOrder(id, authentication.getName());
}
```

Caso ingenuo:

- “como está logueado, puede consultar”

Pensamiento adversarial:

- ¿qué pasa si prueba IDs consecutivos?
- ¿qué señal recibe si la orden existe pero no es suya?
- ¿puede distinguir entre “no existe” y “no autorizado”?
- ¿qué campos ve si la orden sí le pertenece?
- ¿y si es soporte?
- ¿y si es una cuenta técnica mal ubicada?

Pensar adversarialmente es dejar de mirar solo el endpoint y mirar el **recorrido posible** que habilita.

---

## Qué preguntas conviene hacerse siempre

Estas preguntas funcionan como checklist mental.

## 1. ¿Qué vale realmente acá?

- ¿dato?
- ¿capacidad?
- ¿flujo?
- ¿estado?
- ¿secreto?
- ¿integración?

## 2. ¿Quién puede tocar esto hoy?

- usuario común
- soporte
- admin
- cuenta técnica
- integración externa
- pipeline
- servicio interno

## 3. ¿Qué estamos confiando demasiado?

- un ID del cliente
- un estado del request
- una validación de frontend
- un token bien firmado pero demasiado poderoso
- una cuenta interna
- un tercero
- una transición implícita

## 4. ¿Cómo podría crecer el problema?

- escalada
- movimiento lateral
- pivote
- persistencia
- repetición
- automatización
- abuso de negocio

## 5. ¿Qué tan fácil sería verlo y cortarlo?

- ¿hay logs útiles?
- ¿hay auditoría?
- ¿hay ownership claro?
- ¿hay forma de revocar?
- ¿hay puntos de corte razonables?
- ¿o recién nos enteramos cuando el daño ya es grande?

---

## Pensamiento adversarial no es pensar solo en bugs técnicos

Esto es muy importante.

No se limita a cosas como:

- SQL Injection
- deserialización insegura
- path traversal
- exposición de secrets

También incluye:

- abuso de lógica de negocio
- autorizaciones demasiado gruesas
- transiciones inválidas
- dependencias de confianza mal ubicadas
- flujos que pueden recorrerse fuera de orden
- operaciones demasiado cómodas para actores intermedios
- integraciones con demasiado poder
- paneles internos demasiado cerca de todo

En backend real, muchas veces el problema más caro no es un bug “espectacular”.
Es un diseño demasiado cómodo para el actor equivocado.

---

## Ejemplo 3: operación legítima, uso ilegítimo

Supongamos este endpoint:

```java
@PostMapping("/orders/{id}/cancel")
public ResponseEntity<Void> cancel(@PathVariable Long id, Authentication authentication) {
    orderService.cancel(id, authentication.getName());
    return ResponseEntity.noContent().build();
}
```

Caso feliz:

- el usuario cancela una orden propia
- está en estado válido
- se audita la acción

Pensamiento adversarial:

- ¿puede cancelar cualquier orden si conoce el ID?
- ¿puede repetir la operación?
- ¿puede usarlo después del pago?
- ¿puede generarse una carrera entre envío y cancelación?
- ¿soporte puede abusar este endpoint?
- ¿qué pasa si se automatiza?
- ¿qué pasa si el recurso ya cambió de estado mientras llegaba la request?

Ese cambio de mirada es el corazón del tema.

---

## Pensar en secuencias, no solo en endpoints

Muchos problemas no viven en un endpoint aislado.

Viven en una secuencia.

Por ejemplo:

1. actor obtiene una cuenta válida
2. consulta recursos ajenos por ID
3. encuentra un pivote útil
4. gana más contexto
5. llega a una operación administrativa
6. altera estados sensibles
7. conserva una forma de volver

Si revisás cada endpoint por separado, tal vez ninguno parezca “catastrófico”.

Pero la secuencia completa sí puede serlo.

Pensamiento adversarial también significa preguntar:

- ¿qué cadena hace plausible este sistema?

---

## Qué cambia cuando pensás así

Cuando el equipo empieza a pensar de esta forma, suele mejorar cosas como:

- DTOs más chicos
- operaciones más específicas
- menos `PATCH` genéricos
- ownership mejor controlado
- services con más criterio de negocio
- roles menos gruesos
- auditoría mejor ubicada
- integraciones más desconfiadas
- menos poder para cuentas técnicas
- puntos de corte más claros
- menos confianza en el caso feliz

---

## Señales de que una app no fue pensada adversarialmente

Estas señales aparecen muchísimo:

- confiar en que la UI limita lo suficiente
- endpoints que aceptan demasiado
- campos internos controlados por el cliente
- operaciones críticas muy directas
- cambios de estado sin suficiente contexto
- exceso de `hasRole()` sin ownership real
- paneles o tooling con demasiado poder
- queries demasiado abiertas
- responses demasiado generosas
- falta de auditoría en acciones delicadas
- demasiada confianza en integraciones
- poco pensamiento sobre repetición, abuso o secuencia

---

## Cómo practicar pensamiento adversarial en Spring

Una forma muy útil es agarrar cualquier endpoint y hacerse este mini ejercicio:

### Endpoint
¿Qué hace?

### Actor
¿Quién puede usarlo?

### Recurso
¿Sobre qué objeto opera?

### Verdad
¿Qué está confiando del request?

### Poder
¿Qué daño directo puede causar?

### Recorrido
¿A qué otro lugar o capacidad podría acercar?

### Escalada
¿Podría servir como escalón?

### Corte
¿Cómo lo detectarías y cortarías si se empieza a abusar?

Con solo ese ejercicio, ya empezás a leer mucho mejor una app.

---

## Ejemplo completo de lectura adversarial

Supongamos esto:

```java
@PatchMapping("/users/{id}")
public UserResponse update(
        @PathVariable Long id,
        @RequestBody UpdateUserRequest request,
        Authentication authentication) {
    return userService.update(id, request, authentication.getName());
}
```

Lectura funcional:

- actualiza usuario

Lectura adversarial:

- ¿quién puede actualizar?
- ¿cualquier usuario o solo el dueño?
- ¿qué campos deja tocar?
- ¿puede cambiar email?
- ¿puede cambiar role?
- ¿puede cambiar enabled?
- ¿puede cambiar ownerId?
- ¿qué pasa si prueba otro `id`?
- ¿qué pasa si manda campos que la UI no expone?
- ¿qué pasa si una cuenta de soporte lo usa?
- ¿qué pasa si se automatiza sobre muchos IDs?
- ¿qué pasa si se combina con otro endpoint que expone más contexto?

Eso es pensar mucho mejor el sistema sin necesidad de “adivinar un ataque exótico”.

---

## Lo que este tema no propone

No propone:

- diseñar con paranoia total
- bloquear cualquier flexibilidad
- volver todo imposible de usar
- imaginar solo atacantes cinematográficos
- llenar el sistema de fricción inútil

Propone algo más simple y más útil:

- dejar de suponer cooperación perfecta
- desconfiar de la comodidad excesiva
- revisar recorridos plausibles de abuso
- entender mejor cómo crece el daño

---

## Checklist práctico

Cuando revises una app Spring, preguntate:

- ¿qué request fabricado cambiaría mucho este flujo?
- ¿qué actor autenticado podría abusar algo fuera de lo previsto?
- ¿qué endpoint parece normal pero conecta demasiado?
- ¿qué operación crítica es demasiado directa?
- ¿qué regla existe solo en la UI?
- ¿qué transición de estado podría forzarse?
- ¿qué query o búsqueda podría automatizarse?
- ¿qué cuenta técnica o panel tiene demasiado alcance?
- ¿qué combinación de dos endpoints sería peligrosa?
- ¿qué parte del sistema está diseñada solo para el caso feliz?

---

## Mini ejercicio de reflexión

Elegí tres endpoints de tu backend y para cada uno respondé:

1. ¿Cuál es el caso feliz?
2. ¿Cuál sería el uso adversarial más plausible?
3. ¿Qué está confiando de más el backend?
4. ¿Qué daño directo podría producir?
5. ¿Qué daño indirecto podría habilitar después?
6. ¿Qué control falta para volverlo menos rentable de abusar?

Ese ejercicio, hecho con constancia, cambia mucho la calidad con la que leés seguridad backend.

---

## Resumen

Pensamiento adversarial aplicado a Spring significa:

- no mirar solo funcionalidad
- no mirar solo el flujo feliz
- no confiar demasiado en la UI
- no limitar el análisis a bugs puntuales
- pensar también en abuso, secuencia, crecimiento y daño

En resumen:

> Una app Spring más segura no es solo la que funciona bien.
> Es la que también fue pensada para que usarla mal resulte más difícil, menos rentable y más visible.

---

## Próximo tema

**Cómo leer una codebase Spring desde la seguridad**
