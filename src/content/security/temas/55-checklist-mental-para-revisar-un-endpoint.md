---
title: "Checklist mental para revisar un endpoint"
description: "Cómo revisar un endpoint de una aplicación Java con Spring Boot desde seguridad, usando una lista mental simple para detectar riesgos de autenticación, autorización, validación, abuso funcional, exposición de datos y manejo de errores antes de que se vuelvan incidentes reales."
order: 55
module: "Observabilidad y respuesta"
level: "base"
draft: false
---

# Checklist mental para revisar un endpoint

## Objetivo del tema

Aprender una forma práctica de revisar un endpoint en una aplicación **Java + Spring Boot** sin depender solo de intuición, memoria o una lista improvisada.

La idea es poder mirar cualquier endpoint y preguntarse, de forma rápida y ordenada:

- quién puede llamarlo
- qué datos recibe
- qué decisiones toma
- qué recurso toca
- qué información devuelve
- qué riesgos abre si algo falla

En resumen:

> revisar un endpoint no es mirar solamente si “funciona”.  
> Es verificar si hace exactamente lo que debería, para el actor correcto, sobre el recurso correcto, con el nivel de exposición correcto.

---

## Idea clave

Un endpoint seguro no depende de una sola defensa.

Depende de varias preguntas simples hechas en el orden correcto.

Cuando revisás un endpoint, conviene pensar al menos en estas capas:

1. **entrada**  
2. **identidad**  
3. **autorización**  
4. **reglas del negocio**  
5. **datos expuestos**  
6. **abuso y repetición**  
7. **errores y trazabilidad**

La checklist mental sirve para que no te olvides ninguna.

---

## Qué problema intenta resolver este tema

Muchos endpoints inseguros no nacen de un bug “exótico”.

Nacen de revisiones incompletas como estas:

- “valida el DTO, así que está bien”
- “tiene JWT, así que está protegido”
- “en el frontend no aparece ese botón”
- “solo el admin conoce ese endpoint”
- “si algo sale mal devuelve 500 y listo”
- “en mi máquina funcionó”

El problema es que un endpoint puede:

- aceptar más datos de los debidos
- operar sobre recursos ajenos
- saltarse reglas del dominio
- filtrar información sensible
- permitir abuso por repetición
- exponer demasiado en errores
- quedar correcto funcionalmente pero mal desde seguridad

---

## Error mental clásico

Un error muy común es revisar un endpoint de forma fragmentada.

Por ejemplo:

- alguien revisa solo el DTO
- otro mira solo el `@PreAuthorize`
- otro mira solo la query
- nadie revisa el flujo completo

Y la realidad es que la seguridad del endpoint depende del recorrido entero.

### Ejemplo

Un endpoint puede tener:

- DTO válido
- usuario autenticado
- código prolijo

pero igual ser inseguro porque:

- actualiza una entidad de otro usuario
- devuelve campos internos
- permite repetir una operación crítica
- filtra estados sensibles en el error

Por eso la pregunta correcta no es:

> “¿esta parte está bien?”

Sino:

> “¿el flujo completo del endpoint resiste un uso malicioso o inesperado?”

---

## La checklist mental base

Cada vez que revises un endpoint, recorré estas preguntas.

## 1. ¿Qué actor puede llamar este endpoint?

Preguntate:

- ¿es público, autenticado o administrativo?
- ¿necesita sesión, token o algún contexto especial?
- ¿qué pasa si lo llama un usuario no autenticado?
- ¿qué pasa si lo llama un usuario autenticado pero sin permisos suficientes?

### Señal de alarma

Pensar solo en “requiere login” como si eso resolviera todo.

Autenticación no equivale a autorización.

---

## 2. ¿Qué está intentando hacer realmente?

No te quedes con el verbo HTTP.

Preguntate cuál es la operación real.

### Ejemplos

- `POST /orders/{id}/cancel` no es “solo un POST”: cancela una orden
- `PATCH /users/{id}` no es “solo una actualización”: modifica datos sensibles de identidad
- `POST /refunds` no es “solo crear un recurso”: puede mover dinero o disparar fraude

La operación real te dice qué tan sensible es el endpoint.

---

## 3. ¿Qué datos entran y cuáles deberían entrar?

Revisá:

- body
- path variables
- query params
- headers
- cookies
- contexto autenticado

Y preguntate:

- ¿entra algo de más?
- ¿hay campos que nunca deberían venir del cliente?
- ¿hay parámetros que alteran demasiado la operación?
- ¿se puede forzar estado, owner, tenant, price, role o flags internos?

### Ejemplo inseguro

```java
public record UpdateUserRequest(
    String fullName,
    String role,
    Boolean active,
    Long organizationId
) {}
```

Si ese DTO entra desde un usuario común, ya hay un problema potencial.

### Más sano

```java
public record UpdateProfileRequest(
    @NotBlank String fullName
) {}
```

La pregunta sana siempre es:

> ¿este campo realmente debería poder venir del cliente en este endpoint?

---

## 4. ¿La validación cubre solo formato o también significado?

Muchos endpoints validan:

- `@NotBlank`
- `@Email`
- `@Size`

Eso está bien, pero no alcanza.

También conviene revisar validación semántica:

- ¿el recurso está en un estado válido para esta acción?
- ¿ese valor tiene sentido en este contexto?
- ¿esa fecha no viola una regla del dominio?
- ¿esa transición está permitida?

### Idea útil

Bean Validation ayuda a proteger el contrato.

La lógica del negocio protege la operación real.

---

## 5. ¿El endpoint opera sobre el recurso correcto?

Acá aparece una de las preguntas más importantes de todas.

Si llega un `id`, preguntate:

- ¿quién eligió ese `id`?
- ¿cómo se verifica ownership?
- ¿puede un usuario probar IDs ajenos?
- ¿la query trae solo lo suyo o trae “por id” y después decide tarde?

### Ejemplo riesgoso

```java
Order order = orderRepository.findById(orderId)
    .orElseThrow(() -> new NotFoundException("Orden no encontrada"));

if (!order.getUser().getId().equals(currentUserId)) {
    throw new ForbiddenException("No tienes permisos");
}
```

Puede funcionar, pero ya distingue demasiado y además primero confirma existencia.

### Mejor enfoque

```java
Order order = orderRepository
    .findByIdAndUserId(orderId, currentUserId)
    .orElseThrow(() -> new NotFoundException("Orden no encontrada"));
```

No solo importa **qué** chequeás.
Importa también **cuándo** y **cómo** lo chequeás.

---

## 6. ¿La autorización vive en el lugar correcto?

Revisá si la autorización está:

- solo en el frontend
- solo en el controller
- mezclada de forma inconsistente
- ausente en operaciones internas del service

### Señal de ruido

Confiar en que porque el endpoint tiene `@PreAuthorize`, toda llamada interna ya quedó protegida.

Muchas veces la decisión sensible vive en el `service`, no en la capa HTTP.

### Pregunta sana

> si mañana este mismo service es reutilizado por otro endpoint, un job o una integración, ¿la operación seguiría protegida?

---

## 7. ¿Hay reglas del negocio que impidan abuso funcional?

No todo ataque es técnico.

A veces el problema es que el endpoint permite hacer algo válido desde el punto de vista técnico, pero dañino desde negocio.

### Ejemplos

- aplicar dos veces un descuento
- cancelar una orden ya enviada
- aprobar un recurso sin doble control
- cambiar un email sin reverificación
- disparar múltiples retiros o reembolsos

La revisión debería preguntar:

- ¿hay precondiciones claras?
- ¿hay estados permitidos y estados prohibidos?
- ¿se previenen repeticiones?
- ¿la operación debería ser idempotente?

---

## 8. ¿Se puede abusar por repetición, automatización o volumen?

Incluso si la lógica es correcta, conviene pensar:

- ¿se puede spamear el endpoint?
- ¿se puede automatizar fácil?
- ¿hay rate limiting, throttling o fricción útil?
- ¿qué pasa si se repite la request muchas veces?
- ¿hay riesgo de doble submit?

### Ejemplos típicos

- login
- forgot password
- generación de códigos
- envíos de email
- checkout
- cancelaciones
- operaciones administrativas

Un endpoint puede ser correcto una vez y peligroso mil veces seguidas.

---

## 9. ¿Qué datos devuelve y si realmente debería devolverlos?

Esta revisión también es crítica.

Preguntate:

- ¿la response expone entidades de más?
- ¿devuelve campos internos?
- ¿filtra flags, IDs internos o relaciones sensibles?
- ¿expone datos de otros usuarios por accidente?
- ¿devuelve más de lo mínimo necesario?

### Ejemplo inseguro

```java
return ResponseEntity.ok(user);
```

Eso puede terminar exponiendo:

- hashes
- flags internos
- timestamps innecesarios
- relaciones sensibles
- datos administrativos

### Más sano

```java
return ResponseEntity.ok(new UserProfileResponse(
    user.getId(),
    user.getFullName(),
    user.getEmail()
));
```

Una buena revisión siempre mira la salida, no solo la entrada.

---

## 10. ¿Los errores ayudan a un usuario legítimo o también al atacante?

Conectando con el tema anterior, conviene revisar:

- qué `status code` devuelve
- qué mensaje muestra
- cuánto detalle expone
- si revela existencia, ownership o estado interno
- si devuelve excepciones crudas

### Ejemplos riesgosos

- “Ese recurso existe pero pertenece a otro usuario”
- “La cuenta existe pero aún no activó el email”
- “La columna `tenant_id` no existe”
- `e.getMessage()` directo al cliente

### Más sano

- mensaje estable
- detalle interno a logs
- `requestId` o `traceId`
- consistencia en respuestas sensibles

---

## 11. ¿Queda trazabilidad útil para investigar?

No alcanza con bloquear o rechazar.

También importa poder entender después qué pasó.

Preguntate:

- ¿se registra la acción sensible?
- ¿se ve quién la intentó?
- ¿queda el recurso afectado?
- ¿hay correlación con requestId o traceId?
- ¿se puede investigar abuso o incidente después?

### Ojo

Loguear útil no significa loguear de más.

La trazabilidad tiene que existir sin filtrar secretos, tokens, contraseñas o datos innecesarios.

---

## 12. ¿Qué pasaría si alguien usa este endpoint con mentalidad adversarial?

Esta pregunta resume todas las anteriores.

Probá pensar como atacante:

- ¿qué probaría cambiar?
- ¿qué IDs intentaría adivinar?
- ¿qué parámetros extra mandaría?
- ¿qué repetiría muchas veces?
- ¿qué diferencia de errores intentaría medir?
- ¿qué datos querría extraer de la response?

Esa mirada suele encontrar cosas que una revisión “feliz” no ve.

---

## Ejemplo práctico de revisión rápida

Supongamos este endpoint:

```java
@PatchMapping("/orders/{id}/status")
public ResponseEntity<OrderResponse> updateStatus(
    @PathVariable Long id,
    @RequestBody UpdateOrderStatusRequest request
) {
    return ResponseEntity.ok(orderService.updateStatus(id, request));
}
```

Y el DTO:

```java
public record UpdateOrderStatusRequest(String status) {}
```

A simple vista parece normal.

Pero la checklist mental debería disparar preguntas:

### Identidad
- ¿quién puede llamarlo?
- ¿solo admin, soporte o también cualquier usuario autenticado?

### Recurso
- ¿puede cambiar estado de cualquier orden o solo de las suyas?

### Regla de negocio
- ¿cualquier estado puede pasar a cualquier otro?
- ¿se puede pasar de `DELIVERED` a `PENDING`?

### Abuso
- ¿qué pasa si se manda muchas veces?
- ¿qué pasa si dos operadores lo cambian al mismo tiempo?

### Salida
- ¿la respuesta expone datos de más?

### Errores
- ¿devuelve mensajes que revelan demasiado?

### Auditoría
- ¿queda registrado quién cambió el estado y cuándo?

Esa es la diferencia entre mirar un endpoint y **revisarlo de verdad**.

---

## Orden recomendado para revisar un endpoint

Si querés una secuencia simple y repetible, podés usar esta:

1. **qué hace realmente**  
2. **quién puede invocarlo**  
3. **qué entrada acepta**  
4. **qué recurso toca**  
5. **qué autorización aplica**  
6. **qué reglas del negocio limitan la acción**  
7. **qué abuso por repetición permite**  
8. **qué devuelve**  
9. **qué errores expone**  
10. **qué trazabilidad deja**

Es una lista muy corta, pero bien aplicada encuentra muchísimos problemas reales.

---

## Qué señales suelen indicar que un endpoint merece atención especial

Prestá atención extra si el endpoint:

- toca dinero
- cambia estado
- maneja identidad o credenciales
- opera por `id`
- usa filtros o búsquedas complejas
- exporta datos
- permite acciones administrativas
- afecta recursos de terceros
- envía emails, códigos o enlaces temporales
- dispara procesos asíncronos o irreversibles

Cuanto más poder tiene la operación, más profunda debe ser la revisión.

---

## Qué gana el backend al revisar endpoints con esta mentalidad

El backend gana:

- menos IDOR
- menos mass assignment
- menos abuso funcional
- menos fuga de datos
- menos errores improvisados
- más consistencia entre endpoints
- revisiones más rápidas y menos dependientes de memoria

No es solo una lista para “cumplir”.

Es una forma de pensar mejor el diseño real de la API.

---

## Checklist corta de bolsillo

Si querés una versión ultrarrápida, podés usar esta:

- ¿quién puede llamar este endpoint?
- ¿qué intenta hacer realmente?
- ¿qué entrada acepta y qué sobra?
- ¿cómo verifica ownership o alcance?
- ¿qué regla del negocio limita la operación?
- ¿se puede abusar por repetición?
- ¿devuelve más datos de los necesarios?
- ¿el error expone demasiado?
- ¿queda trazabilidad útil?

Si alguna de esas preguntas no tiene respuesta clara, el endpoint merece revisión.

---

## Mini ejercicio de reflexión

Tomá un endpoint real de tu proyecto y respondé:

1. ¿Qué actor debería poder usarlo realmente?
2. ¿Qué parte de la request viene del cliente y cuál debería derivarse del contexto autenticado?
3. ¿Cómo verifica que el recurso corresponde al actor correcto?
4. ¿Qué estados o reglas del negocio limitan la acción?
5. ¿Qué campos de la response podrían sobrar?
6. ¿Qué error actual revela más de lo necesario?
7. ¿Qué pasaría si alguien repite esa request 50 veces?
8. ¿Qué evidencia quedaría para investigar ese uso?

Si no podés contestar esas ocho preguntas con claridad, probablemente el endpoint todavía no está del todo maduro.

---

## Resumen

Revisar un endpoint bien no es leer una anotación y seguir de largo.

Es recorrer mentalmente una serie de preguntas simples:

- actor
- operación
- entrada
- recurso
- autorización
- reglas del negocio
- abuso
- salida
- errores
- trazabilidad

En resumen:

> un endpoint seguro no es el que “anda”.  
> Es el que sigue siendo correcto cuando lo usa el actor equivocado, con datos inesperados, en el momento menos conveniente y con intención adversarial.

---

## Próximo tema

**Race conditions en operaciones críticas**
