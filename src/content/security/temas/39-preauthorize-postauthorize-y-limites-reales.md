---
title: "@PreAuthorize, @PostAuthorize y límites reales"
description: "Cómo usar @PreAuthorize y @PostAuthorize en una aplicación Java con Spring Boot y Spring Security sin creer que una anotación por sí sola resuelve toda la autorización. Qué aportan, dónde ayudan de verdad y cuáles son sus límites frente a recurso, contexto y reglas de negocio."
order: 39
module: "Autorización"
level: "base"
draft: false
---

# `@PreAuthorize`, `@PostAuthorize` y límites reales

## Objetivo del tema

Entender qué aportan realmente `@PreAuthorize` y `@PostAuthorize` en una aplicación Java + Spring Boot + Spring Security, y por qué conviene usarlas con criterio en vez de tratarlas como una solución mágica que ya resuelve toda la autorización del backend.

Este tema importa mucho porque estas anotaciones son muy útiles, pero también muy fáciles de sobredimensionar.

Muchas apps caen en ideas como:

- “si ya tiene `@PreAuthorize`, está seguro”
- “si el método compila con una expresión SpEL, ya está bien autorizado”
- “si el endpoint tiene la anotación, no hace falta revisar el recurso”
- “si `@PostAuthorize` filtra después, alcanza”

Y en la práctica eso suele dejar huecos cuando la autorización real depende también de:

- recurso concreto
- ownership
- tenant
- estado
- acción
- reglas del negocio
- datos que el método todavía no conoce o conoce demasiado tarde

En resumen:

> `@PreAuthorize` y `@PostAuthorize` son herramientas valiosas.  
> Pero siguen siendo solo una parte del modelo de autorización, no su reemplazo total.

---

## Idea clave

Estas anotaciones ayudan mucho a poner **barreras declarativas** en torno a métodos.

## `@PreAuthorize`
Decide si se puede entrar **antes** de ejecutar el método.

## `@PostAuthorize`
Decide si el resultado puede entregarse **después** de ejecutar el método.

En resumen:

> Sirven muy bien para ciertos controles generales y ciertas comprobaciones simples.  
> Pero no eliminan la necesidad de pensar autorización real sobre recurso, contexto, estado y negocio.

---

## Qué resuelve bien `@PreAuthorize`

`@PreAuthorize` suele servir bien para cosas como:

- exigir autenticación
- exigir rol general
- exigir authority concreta
- hacer validaciones sencillas con parámetros del método
- poner una barrera declarativa visible en el borde del método

### Ejemplos típicos

```java
@PreAuthorize("isAuthenticated()")
```

```java
@PreAuthorize("hasRole('ADMIN')")
```

```java
@PreAuthorize("hasAuthority('order:refund')")
```

```java
@PreAuthorize("#userId == authentication.principal.id")
```

Todo eso puede ser útil.

---

## Qué resuelve bien `@PostAuthorize`

`@PostAuthorize` evalúa una condición **después** de ejecutar el método y suele servir para casos como:

- validar el recurso devuelto
- chequear ownership sobre el resultado
- permitir o negar la entrega según el objeto retornado

### Ejemplo típico

```java
@PostAuthorize("returnObject.userId == authentication.principal.id")
public OrderResponse getOrder(Long id) {
    return orderService.getById(id);
}
```

La idea es:

- el método obtiene el recurso
- luego se revisa si el actor debería recibir ese resultado

Conceptualmente es interesante, pero también tiene límites importantes.

---

## Error mental clásico

Muchos equipos piensan así:

- “si el controller tiene `@PreAuthorize`, ya resolvimos”
- “si uso `hasRole('USER')`, el recurso ya quedó protegido”
- “si `@PostAuthorize` valida el `returnObject`, no necesito revisar más nada”
- “si lo pude escribir en SpEL, entonces ya está bien modelado”

Eso es demasiado optimista.

Porque una anotación puede ayudar a expresar una parte del control, pero no siempre puede representar con claridad ni con seguridad todo lo que el negocio necesita.

---

## `@PreAuthorize`: útil, pero no omnipotente

Veamos un ejemplo típico.

```java
@PreAuthorize("hasRole('USER')")
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id) {
    return orderService.getById(id);
}
```

### ¿Qué resuelve?

- exige usuario autenticado con cierto rol general

### ¿Qué no resuelve?

- si esa orden le pertenece
- si está en el tenant correcto
- si el estado permite verla
- si debería ver todos los campos
- si soporte y admin tienen reglas distintas
- si el recurso existe pero no corresponde

Entonces:

- la anotación ayuda
- pero la autorización real sigue incompleta

---

## `@PreAuthorize` con parámetros del método

Una mejora común es usar expresiones que comparen parámetros.

### Ejemplo

```java
@PreAuthorize("#userId == authentication.principal.id")
@GetMapping("/users/{userId}/profile")
public UserProfileResponse getProfile(@PathVariable Long userId) {
    return userService.getProfile(userId);
}
```

Esto puede estar bien para algunos casos simples.

### Qué mejora

- ya no depende solo de rol
- incorpora una relación actor-parámetro

### Qué sigue sin resolver necesariamente

- si el parámetro es suficiente para representar el recurso real
- si el contexto importa
- si el tenant importa
- si la acción depende del estado del recurso
- si el perfil tiene partes visibles y otras no
- si el negocio exige condiciones adicionales

Es decir, sirve, pero no convierte la autorización en un problema trivial.

---

## `@PostAuthorize`: cuándo parece atractiva

`@PostAuthorize` resulta tentadora porque permite pensar algo como:

- “primero traigo el recurso”
- “después veo si se lo puedo entregar”

### Ejemplo

```java
@PostAuthorize("returnObject.ownerId == authentication.principal.id")
public DocumentResponse getDocument(Long id) {
    return documentService.getById(id);
}
```

Esto puede parecer elegante.

### Pero tiene varias preguntas delicadas

- ¿vale la pena cargar el recurso completo antes de autorizar?
- ¿qué pasa si trae datos sensibles de más?
- ¿qué pasa si el método tiene side effects?
- ¿qué pasa con performance?
- ¿qué pasa si el recurso no debería ni ser consultado en ese contexto?

Por eso `@PostAuthorize` tiene casos útiles, pero no siempre es la opción más sana.

---

## Límite importante: autorizar después de cargar

Con `@PostAuthorize`, el método ya ejecutó.

Eso implica que el backend ya pudo haber:

- leído datos de base
- construido objetos
- recorrido relaciones
- consumido recursos de infraestructura
- tomado decisiones que quizá no querías ejecutar para un actor no autorizado

Por eso conviene hacerse esta pregunta:

> ¿realmente quiero traer este recurso y recién después decidir si puedo entregarlo?

A veces sí.
Muchas veces no.

---

## Otro límite importante: side effects

`@PostAuthorize` solo tiene sentido razonable si el método es efectivamente seguro de ejecutar antes de decidir la entrega.

### Mala idea conceptual

```java
@PostAuthorize("returnObject.ownerId == authentication.principal.id")
public ExportResult exportInvoice(Long id) {
    auditService.recordExportAttempt(id);
    return exportService.generateExport(id);
}
```

Si el método:

- genera archivos
- deja trazas operativas
- dispara side effects
- toca sistemas externos

entonces autorizar después puede ser una mala idea.

No querés que el backend “haga cosas” y después decida que en realidad no debía entregarlas.

---

## `@PreAuthorize` suele encajar mejor para barreras generales

En la mayoría de las apps, `@PreAuthorize` suele ser más útil como:

- barrera gruesa
- requisito de autenticación
- requisito de rol o authority
- precondición simple

### Ejemplo sano

```java
@PreAuthorize("hasAuthority('order:read')")
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id, Authentication authentication) {
    return orderService.getVisibleOrder(id, authentication.getName());
}
```

### Qué hace bien

- exige capacidad general de leer órdenes
- deja que el service resuelva:
  - ownership
  - tenant
  - estado
  - visibilidad real del recurso

Esto suele ser una combinación bastante sana.

---

## El service sigue siendo importante

Este tema no es “usar o no usar anotaciones”.

Es más bien:

- usarlas para lo que sirven
- no pedirles lo que no resuelven bien

Una autorización madura suele hacer algo así:

### Controller / método
- `@PreAuthorize` como barrera declarativa visible

### Service
- validación real del recurso
- ownership
- tenant
- estado
- reglas del negocio
- decisiones finas de visibilidad o acción

Esa combinación suele funcionar mucho mejor que cualquiera de las dos partes por separado.

---

## Ejemplo comparado

## Modelo ingenuo

```java
@PreAuthorize("hasRole('USER')")
@GetMapping("/invoices/{id}")
public InvoiceResponse getInvoice(@PathVariable Long id) {
    return invoiceService.getById(id);
}
```

### Problema
Cualquier `USER` con el id correcto podría intentar acceder.

## Modelo un poco mejor

```java
@PreAuthorize("hasAuthority('invoice:read')")
@GetMapping("/invoices/{id}")
public InvoiceResponse getInvoice(@PathVariable Long id, Authentication authentication) {
    return invoiceService.getVisibleInvoice(id, authentication.getName());
}
```

Y en `service`:

```java
public InvoiceResponse getVisibleInvoice(Long invoiceId, String username) {
    Invoice invoice = invoiceRepository.findById(invoiceId).orElseThrow();
    User actor = userRepository.findByEmail(username).orElseThrow();

    if (!invoice.belongsTo(actor) && !actor.hasRole("SUPPORT")) {
        throw new AccessDeniedException("No autorizado");
    }

    return invoiceMapper.toResponse(invoice);
}
```

### Qué mejora esto

- la anotación expresa una capacidad general
- el service resuelve el recurso concreto
- la autorización ya no depende solo de rol grueso

---

## SpEL: potente, pero fácil de abusar

Las expresiones de Spring Security pueden ser muy potentes.
Pero eso también trae un riesgo:

- intentar meter demasiada lógica adentro

### Ejemplo sospechoso

```java
@PreAuthorize("hasRole('ADMIN') or (#orderId != null and @orderSecurityService.canRefund(#orderId, authentication))")
```

Esto puede funcionar.
Pero si el código empieza a llenarse de expresiones cada vez más largas, puede volverse:

- difícil de leer
- difícil de mantener
- difícil de auditar
- difícil de testear
- poco expresivo para reglas de negocio complejas

### Regla sana

Si la expresión empieza a parecer una mini aplicación adentro de la anotación, probablemente convenga simplificar.

---

## Cuándo usar una anotación ayuda mucho

Estas situaciones suelen beneficiarse bastante de `@PreAuthorize`:

- exigir autenticación
- exigir authority clara
- restringir endpoints admin
- marcar explícitamente operaciones delicadas
- dejar visible el requisito general del método
- evitar que el método corra si el actor ni siquiera pertenece al grupo general correcto

Es especialmente útil como barrera temprana y legible.

---

## Cuándo la anotación sola no alcanza

Estas situaciones suelen pedir más que una anotación:

- ownership complejo
- multi-tenant real
- visibilidad parcial por campos
- estado del recurso
- permisos que dependen de workflow
- separación fina entre soporte, admin y usuario
- recursos relacionados
- transiciones de negocio
- acciones que dependen de tiempo, contexto o historial

Ahí el service o dominio siguen siendo claves.

---

## `@PostAuthorize`: casos donde puede tener sentido

No hay que descartarla por completo.

Puede ser útil cuando:

- el método es de lectura
- no tiene side effects
- el resultado es necesario para decidir acceso
- la regla es clara y razonablemente simple
- el costo de traer el recurso antes de decidir es aceptable

### Ejemplo razonable

```java
@PostAuthorize("returnObject.ownerId == authentication.principal.id")
public ProfileResponse getMyProfile(Long id) {
    return profileService.loadProfile(id);
}
```

Aun así, conviene preguntarse si una query o un service mejor diseñado no resolverían lo mismo de forma más directa.

---

## Otro límite: visibilidad de colección y listados

Autorización sobre un objeto puntual ya es delicada.
Sobre colecciones o listados, se vuelve aún más importante pensar bien.

### Mala idea mental

- traer una lista grande
- confiar en anotaciones posteriores para “filtrar”

En muchos casos conviene mucho más:

- consultar ya con alcance correcto
- limitar desde repository/service
- no traer de más
- no depender de una capa posterior para recortar exposición

La mejor autorización muchas veces evita consultar o construir cosas que el actor no debería ver desde el principio.

---

## Qué relación tiene esto con performance

Autorización no es solo seguridad.
También toca eficiencia.

Si el backend:

- trae recursos de más
- filtra demasiado tarde
- hace validaciones complejas en cada resultado
- depende de lógica costosa en anotaciones

puede terminar con un diseño que además de frágil es ineficiente.

Autorización madura suele alinearse bastante bien con consultas y recorridos más razonables.

---

## Qué relación tiene esto con testeabilidad

Las anotaciones declarativas ayudan a hacer explícita cierta parte del contrato de seguridad.

Eso está bueno.

Pero si metés demasiada lógica en expresiones o dependés solo de ellas, después cuesta más testear:

- reglas finas de negocio
- combinaciones de contexto
- estados del recurso
- alcance multi-tenant
- ownership real

Por eso conviene mantener una frontera sana:

- anotación expresa barrera general
- service expresa autorización real del caso de uso

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- `@PreAuthorize` para barreras generales claras
- expresiones relativamente simples
- services que validan recurso, contexto y estado
- poco side effect antes de autorizar
- bajo uso de `@PostAuthorize` solo donde realmente aporta
- poca lógica de negocio enterrada dentro de SpEL

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- `hasRole()` usado como solución universal
- expresiones larguísimas y difíciles de leer
- `@PostAuthorize` sobre métodos con side effects
- controllers “protegidos” pero services ingenuos
- anotaciones que parecen resolver demasiado y services que no revisan casi nada
- queries que traen demasiado y filtran tarde
- nadie sabe explicar qué parte de la autorización vive en anotación y cuál en negocio

---

## Qué gana el backend si usa estas anotaciones con criterio

Cuando el backend usa `@PreAuthorize` y `@PostAuthorize` con criterio, gana:

- visibilidad de barreras generales
- menor riesgo de ejecutar métodos claramente fuera de alcance
- mejor legibilidad de seguridad
- mejor combinación entre framework y negocio
- menos fe ciega en roles gruesos
- más claridad sobre qué parte se resuelve declarativamente y cuál no

No se trata de evitarlas.
Se trata de no pedirles magia.

---

## Checklist práctico

Cuando revises `@PreAuthorize` y `@PostAuthorize` en una app Spring, preguntate:

- ¿esta anotación expresa una barrera general o intenta resolver toda la autorización?
- ¿la expresión es razonablemente simple?
- ¿la autorización depende del recurso concreto?
- ¿esa parte ya está validada en service?
- ¿hay ownership?
- ¿hay tenant o contexto?
- ¿importa el estado del recurso?
- ¿`@PostAuthorize` está evaluando después de side effects?
- ¿el método trae demasiado antes de decidir?
- ¿la anotación ayuda de verdad o está ocultando un diseño más flojo?

---

## Mini ejercicio de reflexión

Tomá tres métodos de tu backend anotados con seguridad y respondé:

1. ¿Qué resuelve la anotación?
2. ¿Qué no resuelve?
3. ¿La autorización depende de rol, permiso, recurso o estado?
4. ¿Qué parte vive en service?
5. ¿Hay algo que la anotación está intentando hacer y que sería más claro en negocio?
6. ¿Si saco la anotación, qué riesgo aparece?  
7. ¿Si dejo solo la anotación, qué riesgo queda?

Ese ejercicio ayuda muchísimo a ubicar mejor el rol real de estas herramientas.

---

## Resumen

`@PreAuthorize` y `@PostAuthorize` son herramientas muy útiles en Spring Security.

## `@PreAuthorize`
- decide antes de ejecutar
- sirve bien para barreras generales

## `@PostAuthorize`
- decide después de ejecutar
- puede servir en ciertos casos puntuales de lectura

Pero ambas tienen límites.

En resumen:

> Una anotación puede expresar muy bien una parte del control.  
> La autorización madura, en cambio, casi siempre necesita además entender recurso, contexto, estado y reglas reales del negocio.

---

## Próximo tema

**Autorización en service vs controller**
