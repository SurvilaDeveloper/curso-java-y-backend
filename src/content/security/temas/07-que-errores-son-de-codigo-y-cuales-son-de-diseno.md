---
title: "Qué errores son de código y cuáles son de diseño"
description: "Cómo distinguir fallos de implementación de fallos de diseño en un backend Java Spring. Qué problemas se arreglan con una corrección puntual y cuáles exigen repensar permisos, flujos, separación, confianza y arquitectura."
order: 7
module: "Fundamentos"
level: "intro"
draft: false
---

# Qué errores son de código y cuáles son de diseño

## Objetivo del tema

Aprender a diferenciar entre:

- **errores de código**
- **errores de diseño**

en un backend hecho con Java + Spring.

Esta diferencia es muy importante porque no todos los problemas de seguridad se corrigen de la misma forma.

Algunos se arreglan con:

- una validación mejor
- una query parametrizada
- un DTO más acotado
- una anotación de seguridad

Pero otros no se arreglan “parchando una línea”.

Porque el problema no está en una línea.
Está en la forma en que el sistema fue pensado.

---

## Idea clave

Un error de código suele ser una implementación mala de una idea razonable.

Un error de diseño suele ser una idea mala o incompleta, aunque esté implementada prolijamente.

En resumen:

> Hay sistemas inseguros por bugs.  
> Y hay sistemas inseguros aunque no tengan un bug evidente, porque fueron diseñados con demasiada confianza, demasiado poder concentrado o muy poca maniobra defensiva.

---

## Qué es un error de código

Un error de código es un problema donde:

- la intención general puede ser correcta
- pero la implementación concreta está mal

### Ejemplos típicos

- una query armada con concatenación
- una contraseña guardada sin hash
- un endpoint que devuelve campos sensibles de más
- un DTO que acepta un campo interno
- una validación olvidada
- un `@PreAuthorize` ausente
- un `size` sin límite
- un token mal firmado
- una excepción que filtra información interna
- una deserialización insegura

En muchos de estos casos, la corrección puede ser:

- puntual
- local
- técnica
- relativamente acotada

---

## Qué es un error de diseño

Un error de diseño es un problema donde:

- la implementación puede estar “bien hecha”
- pero la idea de fondo ya era riesgosa

### Ejemplos típicos

- confiar en que el frontend controla lo importante
- usar una cuenta técnica con permisos excesivos
- diseñar un flujo que acepta estados arbitrarios
- permitir que un rol intermedio haga demasiado
- exponer una operación crítica como un `PATCH` genérico
- centralizar demasiado poder en un panel interno
- no separar bien admin, soporte y usuario común
- depender de un tercero sin buena maniobra de salida
- diseñar solo para el caso feliz
- no tener puntos de corte razonables si algo sale mal

En estos casos, no alcanza con parchear una línea.

Hace falta revisar:

- flujos
- responsabilidades
- privilegios
- separación
- ownership
- arquitectura
- contrato entre capas
- modelo mental del sistema

---

## Regla práctica

Si el problema se arregla bien con una corrección puntual y el resto del sistema sigue teniendo sentido, probablemente sea más de código.

Si al arreglarlo aparece esta sensación:

- “en realidad esto está mal planteado desde el principio”
- “aunque corrija esto, el sistema sigue regalado”
- “esta operación nunca debió diseñarse así”
- “hay demasiadas piezas confiando mal entre sí”

entonces probablemente sea más de diseño.

---

## Ejemplo 1: SQL Injection

```java
@Query(value = "select * from users where email = '" + email + "'", nativeQuery = true)
User findByEmail(String email);
```

Esto es un error de código.

¿Por qué?

Porque la intención general puede ser válida:

- buscar un usuario por email

Pero la implementación concreta está mal:

- concatena input
- no parametriza
- abre puerta a inyección

La idea no está necesariamente mal.
La implementación sí.

Versión corregida:

```java
Optional<User> findByEmail(String email);
```

o una query parametrizada bien construida.

---

## Ejemplo 2: aceptar el total desde el frontend

Supongamos este request:

```json
{
  "productId": 12,
  "quantity": 2,
  "total": 100
}
```

Y después algo como esto:

```java
public Order create(CreateOrderRequest request) {
    Order order = new Order();
    order.setProductId(request.getProductId());
    order.setQuantity(request.getQuantity());
    order.setTotal(request.getTotal());
    return orderRepository.save(order);
}
```

Esto ya no es solo un error de código.

Es un error de diseño.

¿Por qué?

Porque el problema de fondo es haber decidido que:

- el cliente puede mandar como verdad un valor crítico del negocio

Aunque cambies nombres de variables o pongas un `if`, la idea sigue siendo débil.

La corrección real no es solo “validar mejor”.
La corrección real es rediseñar la responsabilidad:

- el backend calcula
- el cliente propone una intención
- el backend define el monto real

---

## Ejemplo 3: `@PreAuthorize` faltante

Supongamos esto:

```java
@DeleteMapping("/admin/users/{id}")
public void deleteUser(@PathVariable Long id) {
    adminService.deleteUser(id);
}
```

Si faltó una restricción obvia, eso puede parecer un error de código.

Pero ahora imaginemos que el problema real es más profundo:

- soporte y admin comparten demasiado poder
- el service puede llamarse desde varios lugares sin contexto
- no hay separación real entre gestión operativa y acciones críticas
- borrar usuarios es una operación demasiado directa
- no hay auditoría ni doble control

Entonces hay dos capas del problema:

- **código**: faltó un control puntual
- **diseño**: la operación misma está demasiado cómoda y poderosa

Esto es común en seguridad real:
un bug puntual revela una arquitectura débil detrás.

---

## Ejemplo 4: exponer entidades directas

```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    return userRepository.findById(id).orElseThrow();
}
```

Acá puede haber un error de código si:

- devolvés campos que no querías exponer

Pero muchas veces también hay un error de diseño:

- no existe una frontera clara entre persistencia y exposición
- el sistema no distingue entidad interna de contrato externo
- se diseñó la API pensando “mostrar lo que hay” y no “exponer lo necesario”

El problema puntual puede ser una response demasiado amplia.
Pero la raíz puede ser una arquitectura mal pensada entre capas.

---

## Cómo se ven los errores de código en Spring

Suelen aparecer como cosas concretas y localizadas:

- `@RequestBody` directo a entidad
- falta de `@Valid`
- falta de `@PreAuthorize`
- mala query JPQL o SQL
- no limitar paginación
- no filtrar un campo sensible
- no validar ownership
- loguear tokens
- no usar `PasswordEncoder`
- exponer `/actuator` de más

### Características típicas

- visibles en archivos concretos
- corregibles localmente
- más fáciles de testear de forma puntual
- suelen parecer “bugs”
- a veces tienen fix relativamente rápido

---

## Cómo se ven los errores de diseño en Spring

Suelen aparecer como patrones que atraviesan varias clases o varias capas.

### Ejemplos

- controllers demasiado poderosos
- services vacíos o cosméticos
- lógica crítica repartida sin dueño claro
- repositorios demasiado abiertos
- cuentas técnicas universales
- paneles internos sin suficiente separación
- reglas importantes dependiendo de la UI
- flujos sensibles resueltos solo con un rol grueso
- ausencia de ownership como concepto
- diseño orientado al caso feliz

### Características típicas

- no viven en una sola línea
- aparecen repetidos en distintas partes
- requieren revisar flujos y límites
- suelen costar más de corregir
- a veces el bug visible es solo el síntoma

---

## Señal muy útil para distinguirlos

Preguntate:

### ¿El problema está en “cómo se hizo”?
Eso apunta más a **código**.

### ¿El problema está en “cómo se pensó”?
Eso apunta más a **diseño**.

---

## Otra regla útil

### Error de código
“Esto estaba bien planteado, pero mal implementado.”

### Error de diseño
“Aunque lo implemente prolijo, la idea sigue siendo peligrosa.”

---

## Ejemplos comparados

## Caso A — Más de código

```java
public boolean isValidPassword(String password) {
    return password.length() > 3;
}
```

Problema:

- validación mala
- implementación pobre

La idea general sigue siendo razonable:
validar contraseña.

## Caso B — Más de diseño

```java
public void updateUser(Long id, UpdateUserRequest request) {
    user.setRole(request.getRole());
    user.setEnabled(request.isEnabled());
    user.setOwnerId(request.getOwnerId());
}
```

Problema:

- el cliente está controlando campos internos
- el flujo está mal planteado
- se mezclan responsabilidades
- faltan fronteras conceptuales

Aunque pongas más validaciones, el diseño sigue siendo muy débil si el contrato ya nació demasiado abierto.

---

## Por qué esta diferencia importa tanto

Porque si confundís un error de diseño con uno de código, vas a subestimar el problema.

Y vas a hacer cosas como:

- agregar un `if`
- sumar una anotación
- esconder un campo
- endurecer una pantalla
- meter una validación aislada

...sin corregir la raíz.

Resultado:

- el bug puntual baja
- pero el sistema sigue siendo abusable por otro camino parecido

---

## Qué suele pasar en equipos reales

Muchos equipos corrigen primero lo visible.

Eso es normal.

Pero en seguridad madura conviene preguntarse siempre:

- ¿esto es solo un bug puntual?
- ¿o me está mostrando un patrón más grande?
- ¿es una excepción?
- ¿o es la forma habitual en que estamos diseñando este tipo de flujos?

Esa pregunta cambia muchísimo la calidad del aprendizaje.

---

## Ejemplos de síntomas que suelen esconder problemas de diseño

- varios endpoints con IDOR
- varias entidades bindeadas directo desde request
- muchos roles demasiado gruesos
- varios services sin validación real de negocio
- lógica crítica repartida entre controller y frontend
- operaciones administrativas demasiado directas
- demasiadas cuentas técnicas con permisos amplios
- paneles internos muy cerca del poder total
- integraciones externas demasiado confiadas
- falta de puntos de corte razonables en incidentes

Si lo mismo aparece varias veces, ya no parece un bug aislado.
Parece un problema de diseño.

---

## Qué se corrige con código y qué con diseño

## Se corrige más con código cuando:

- falta una validación concreta
- hay un bug local
- hay una query mal escrita
- hay una response con campos de más
- una anotación está mal puesta
- falta limitar un parámetro
- hay una serialización peligrosa puntual

## Se corrige más con diseño cuando:

- el cliente decide demasiado
- el actor correcto no está bien modelado
- la autorización es demasiado gruesa
- los flujos permiten transiciones arbitrarias
- los límites entre capas están mal
- la separación entre roles es floja
- hay demasiada confianza heredada
- el sistema no tiene buena maniobra de contención
- el poder está demasiado concentrado

---

## Cómo mirar una codebase Spring con esta idea

Cuando revises una app, tratá de clasificar cada problema así:

### 1. ¿Qué veo?
Ejemplo:
- endpoint sin ownership
- DTO abierto
- query demasiado libre

### 2. ¿Esto es puntual o repetido?
- ¿pasa solo acá?
- ¿o está en varios lados?

### 3. ¿Es un bug o una forma de diseñar?
- ¿faltó una línea?
- ¿o el flujo entero está mal pensado?

### 4. ¿Qué exige la corrección?
- ¿un patch?
- ¿un refactor?
- ¿un rediseño de contrato?
- ¿una separación nueva de responsabilidades?

---

## Ejemplo completo de análisis

Supongamos este controller:

```java
@PatchMapping("/users/{id}")
public UserResponse update(
        @PathVariable Long id,
        @RequestBody UpdateUserRequest request) {
    return userService.update(id, request);
}
```

Y el request permite:

- nombre
- email
- role
- enabled
- ownerId

### Lectura superficial
“Hay que validar mejor los campos.”

### Lectura más madura
“En realidad este endpoint está diseñado demasiado abierto.”

Entonces:

- sí, hay errores de código
- pero también hay error de diseño

Porque probablemente esto debería separarse en varias operaciones:

- actualizar perfil
- cambiar email
- bloquear usuario
- cambiar rol
- reasignar ownership

Cada una con:
- autorización distinta
- validación distinta
- auditoría distinta
- riesgo distinto

---

## Qué hacer cuando detectás un error de diseño

No alcanza con marcar el bug.

Conviene dejar explicitado:

- cuál es la idea peligrosa de fondo
- qué otras partes pueden repetirla
- por qué un parche local no alcanza
- qué principio convendría reforzar

Por ejemplo:

- reducir poder del cliente
- mover reglas a service
- separar operaciones críticas
- mejorar ownership
- usar DTOs más pequeños
- cortar privilegios excesivos
- agregar puntos de control más finos

---

## Checklist práctico

Cuando detectes un problema en tu backend Spring, preguntate:

- ¿esto está mal implementado o mal pensado?
- ¿lo mismo aparece en otros endpoints?
- ¿el cliente controla demasiado?
- ¿la operación ya nació demasiado poderosa?
- ¿el problema está en una línea o en el flujo completo?
- ¿el parche local realmente resuelve el riesgo?
- ¿la responsabilidad de cada capa está clara?
- ¿estamos corrigiendo el síntoma o el patrón?
- ¿esto revela demasiada confianza, demasiado poder o muy poca separación?
- ¿si arreglo este caso, el sistema sigue teniendo el mismo problema con otra forma?

---

## Mini ejercicio de reflexión

Tomá 5 problemas reales o imaginarios de una app Spring y clasificálos así:

1. **Error de código**
2. **Error de diseño**
3. **Mixto: bug puntual que revela diseño débil**

Después, para cada uno, respondé:

- ¿qué cambio mínimo lo corrige?
- ¿qué cambio estructural evitaría que reaparezca?
- ¿qué otra parte del sistema podría tener el mismo patrón?

Ese ejercicio sirve muchísimo para empezar a pensar con más criterio y menos reflejo de parche.

---

## Resumen

## Error de código
- implementación mala de una idea razonable
- suele corregirse de forma local
- suele verse como bug concreto

## Error de diseño
- idea peligrosa o incompleta aunque esté prolija
- suele repetirse en varias partes
- exige repensar responsabilidades, poder, confianza o flujos

En resumen:

> Los bugs importan.  
> Pero en seguridad backend madura también importa muchísimo detectar cuándo el bug visible es solo la punta de un diseño ingenuo.

---

## Próximo tema

**Pensamiento adversarial aplicado a una app Spring**
