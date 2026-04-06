---
title: "Nunca confiar en el cliente en una app Spring"
description: "Por qué el backend hecho con Java y Spring Boot no puede tomar al cliente como fuente de verdad. Qué cosas puede sugerir el frontend, qué cosas debe decidir el backend y cómo detectar confianza mal ubicada en requests, IDs, estados, montos y permisos."
order: 11
module: "Fundamentos"
level: "intro"
draft: false
---

# Nunca confiar en el cliente en una app Spring

## Objetivo del tema

Entender por qué un backend hecho con Java + Spring Boot no puede tratar al cliente como si fuera una fuente confiable de verdad, aunque:

- la UI esté bien hecha
- el flujo parezca cerrado
- haya validaciones en frontend
- el usuario esté autenticado
- el request “tenga sentido”

La idea de este tema es sencilla:

> el cliente puede proponer una intención, pero el backend debe decidir qué parte de esa intención es válida y qué parte no.

---

## Idea clave

Desde seguridad backend, el cliente debe considerarse siempre una fuente **potencialmente mentirosa, incompleta, manipulable o abusiva**.

Eso no significa que el usuario siempre sea malicioso.

Significa que el backend debe asumir que el request puede venir:

- alterado
- incompleto
- fabricado
- repetido
- automatizado
- fuera del flujo previsto
- enviado por otra herramienta
- combinado con otros requests
- armado por alguien que ya conoce bastante del sistema

En resumen:

> El backend no debe confiar en lo que el cliente dice. Debe verificar, recalcular, limitar y decidir.

---

## Qué entendemos por “cliente”

Cuando hablamos de cliente no hablamos solo del frontend web bonito.

Cliente puede ser:

- una SPA
- una app mobile
- Postman
- un script
- curl
- una integración externa
- un bot
- una herramienta interna
- otra API consumiendo la tuya
- una UI adulterada en el navegador

En todos esos casos, desde el backend, la regla es la misma:

- lo que llega por HTTP no es verdad por defecto
- es solo una propuesta de input

---

## Error mental clásico

Muchísimas apps caen en ideas como estas:

- “Como la UI no deja tocar ese campo, estamos bien.”
- “Como el botón no aparece, el usuario no puede hacerlo.”
- “Como el frontend calcula el total, ya está.”
- “Como el wizard guía el flujo, no puede saltarse pasos.”
- “Como el combo solo permite ciertos estados, no van a mandar otros.”
- “Como la pantalla de soporte no expone eso, nadie lo va a usar.”

Todo eso es inseguro si el backend lo cree sin verificar.

---

## Qué sí puede hacer el cliente

El cliente puede:

- sugerir datos
- proponer una operación
- indicar qué recurso quiere
- mandar una intención de cambio
- ayudar a ordenar la UX
- validar formato para mejorar experiencia
- enviar información contextual útil

Eso está perfecto.

Lo que no puede hacer es **definir solo**:

- la identidad real
- el ownership real
- el permiso real
- el total real
- el estado válido
- la transición válida
- el rol efectivo
- la verdad del negocio

---

## Qué no puede delegarse al cliente

En una app Spring, el backend no debería delegar nunca al cliente decisiones sobre:

- autenticación real
- autorización real
- ownership de recursos
- precios y montos finales
- descuentos válidos
- estados y transiciones
- campos internos
- flags de moderación o aprobación
- visibilidad real
- capacidades administrativas
- integridad de operaciones críticas

---

## Caso 1: confiar en IDs enviados por el cliente

Ejemplo riesgoso:

```java
@GetMapping("/orders")
public List<OrderResponse> findByUser(@RequestParam Long userId) {
    return orderService.findByUser(userId);
}
```

## ¿Qué puede salir mal?

Si el backend toma `userId` como verdad:

- un usuario autenticado puede consultar órdenes ajenas
- puede enumerar IDs
- puede aprender estructura del sistema
- puede automatizar requests

Versión mejor:

```java
@GetMapping("/orders/me")
public List<OrderResponse> myOrders(Authentication authentication) {
    return orderService.findByCurrentUser(authentication.getName());
}
```

O, si el endpoint sigue usando un ID de recurso:

```java
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id, Authentication authentication) {
    return orderService.getVisibleOrder(id, authentication.getName());
}
```

La regla es:

- el cliente puede decir “quiero esta orden”
- el backend decide si puede verla

---

## Caso 2: confiar en montos, precios o totales

Ejemplo riesgoso:

```java
public class CreateOrderRequest {
    private Long productId;
    private Integer quantity;
    private BigDecimal total;
}
```

Y luego:

```java
public OrderResponse create(CreateOrderRequest request, String username) {
    Order order = new Order();
    order.setProductId(request.getProductId());
    order.setQuantity(request.getQuantity());
    order.setTotal(request.getTotal());
    return mapper.toResponse(orderRepository.save(order));
}
```

## ¿Qué está mal?

El cliente está enviando como verdad un valor crítico del negocio.

Eso es peligrosísimo.

El backend debería:

- buscar precio real
- validar stock
- aplicar descuentos válidos
- recalcular subtotal
- recalcular impuestos
- construir el total final

Versión mental correcta:

- el cliente propone qué quiere comprar
- el backend decide cuánto cuesta realmente

---

## Caso 3: confiar en estados enviados por el cliente

Ejemplo riesgoso:

```java
public class UpdateOrderRequest {
    private String status;
}
```

Y luego:

```java
@PatchMapping("/orders/{id}")
public OrderResponse update(@PathVariable Long id, @RequestBody UpdateOrderRequest request) {
    return orderService.update(id, request);
}
```

## Problema

Si el backend acepta un estado arbitrario del cliente, podrían intentarse cosas como:

- `PENDING -> DELIVERED`
- `CANCELLED -> PAID`
- `REFUNDED -> SHIPPED`

La solución más sana suele ser no dejar que el cliente “elija estado” libremente.

Mejor exponer operaciones específicas:

- `/cancel`
- `/pay`
- `/approve`
- `/refund`
- `/ship`

Y que el backend valide si esa transición tiene sentido.

---

## Caso 4: confiar en campos internos

Ejemplo riesgoso:

```java
public class UpdateUserRequest {
    private String name;
    private String email;
    private String role;
    private Boolean enabled;
    private Long ownerId;
}
```

Aunque la UI no muestre todos esos campos, el cliente igual podría enviarlos.

Por eso el backend debe decidir:

- qué campos acepta de verdad
- qué campos ignora
- qué campos controla él mismo
- qué cambios requieren otra operación más sensible

Campos típicos que no deberían quedar en manos del cliente salvo casos muy justificados:

- `role`
- `enabled`
- `deleted`
- `approved`
- `visibility`
- `ownerId`
- `total`
- `price`
- `status`
- `internalNotes`

---

## Caso 5: confiar en que el frontend ya validó

El frontend puede validar cosas como:

- email con formato válido
- longitud mínima
- campos vacíos
- regex simples
- UX de formularios

Eso está bien para experiencia de usuario.

Pero el backend igual debe validar.

¿Por qué?

Porque el request puede venir:

- desde otra herramienta
- manipulado en el navegador
- alterado por script
- fabricado sin pasar por la UI

Ejemplo sano:

```java
public class CreateUserRequest {
    @NotBlank
    private String name;

    @Email
    private String email;

    @NotBlank
    private String password;
}
```

Y además en service:

- unicidad
- reglas de negocio
- estado de la cuenta
- consistencia del contexto
- restricciones del dominio

---

## Caso 6: confiar en el flujo feliz

Este error es muy común.

El backend a veces asume cosas como:

- si llegó acá, ya pasó por la pantalla anterior
- si está en este paso, ya validó el anterior
- si el botón estaba oculto, no pudo intentar la acción
- si el wizard lo guía, no puede desordenar el flujo

Pero el cliente puede:

- saltarse pantallas
- llamar endpoints fuera de secuencia
- repetir pasos
- ejecutar solo partes del flujo
- combinar endpoints de forma rara

Por eso el backend tiene que validar:

- secuencia real
- estado previo
- permisos actuales
- contexto actual

---

## Caso 7: confiar en roles “visibles” desde la UI

Ejemplo de pensamiento ingenuo:

- “el frontend ya sabe si el usuario es admin”
- “si no ve el botón, no puede usar la operación”
- “la pantalla de soporte no permite hacer eso”

Nada de eso alcanza.

El backend debe decidir:

- si ese actor tiene ese permiso
- si puede hacerlo sobre ese recurso
- si puede hacerlo en este momento
- si la acción debe auditarse
- si necesita fricción adicional

---

## Qué parte sí puede aportar el cliente

Es importante no irse al otro extremo.

El cliente sí puede ser útil para:

- proponer datos
- guiar el flujo
- reducir errores accidentales
- validar rápido por UX
- evitar roundtrips innecesarios
- pedir confirmaciones
- enviar intención y contexto

Eso no está mal.

Lo que está mal es convertir esa ayuda en una fuente de verdad sin control posterior.

---

## Cómo se ve esto por capas en Spring

## Controller

No debería:

- bindear entidades completas
- aceptar campos internos
- confiar en IDs o estados sin más
- convertir directo request en persistencia

Sí debería:

- aceptar DTOs acotados
- tomar identidad del contexto autenticado
- validar formato básico
- delegar lógica real al service

## Service

Debería ser el lugar donde se pregunta:

- ¿esto tiene sentido?
- ¿este actor puede hacerlo?
- ¿este recurso le corresponde?
- ¿este cambio es válido?
- ¿este total es correcto?
- ¿esta transición está permitida?

## Repository

No debería abrir demasiado la puerta a consultas por ID o listados sin ownership o sin filtros razonables.

## Database

No debería recibir escritura de cualquier cosa a través de una cuenta universal ni depender de datos que el cliente ya definió como verdad sin control.

---

## Ejemplo completo: lectura sana del request

Supongamos este endpoint:

```java
@PostMapping("/orders")
public OrderResponse create(
        @Valid @RequestBody CreateOrderRequest request,
        Authentication authentication) {
    return orderService.create(request, authentication.getName());
}
```

Una lectura segura del request sería:

### El cliente puede proponer:
- `productId`
- `quantity`

### El backend debe decidir:
- quién es el usuario real
- si puede operar
- si el producto existe
- cuál es el precio real
- si hay stock
- si hay descuentos válidos
- cuál es el total real
- qué estado inicial corresponde
- qué auditoría dejar

Esa diferencia es exactamente “no confiar en el cliente”.

---

## Señales de que una app confía demasiado en el cliente

Estas señales aparecen muchísimo:

- `userId` en requests de operaciones propias
- `ownerId` controlable por cliente
- `role`, `enabled` o `status` dentro de DTOs amplios
- frontend calculando total y backend aceptándolo
- binds directos a entidades
- `PATCH` genéricos sobre recursos sensibles
- lógica de negocio apoyada en el orden de pantallas
- ausencia de recalculo en backend
- ausencia de ownership real
- demasiada confianza en datos “que no se muestran en la UI”

---

## Cómo empezar a corregir este problema

## 1. Reducí DTOs
Aceptá solo campos que realmente correspondan al actor y al flujo.

## 2. Recalculá valores críticos
Totales, descuentos, ownership, estado y permisos no deberían venir definidos por el cliente.

## 3. Tomá identidad del contexto autenticado
No del request.

## 4. Exponé operaciones específicas
Mejor un `/cancel` que un `PATCH` genérico a `status`.

## 5. Mové reglas reales a service
No las dejes repartidas entre UI, controller y frontend.

## 6. Auditá acciones sensibles
Especialmente cuando cambian estados, permisos, dinero o ownership.

---

## Checklist práctico

Cuando revises un backend Spring, preguntate:

- ¿qué campos del request nunca deberían venir del cliente?
- ¿qué parte del request se está usando como verdad sin suficiente verificación?
- ¿qué IDs deberían salir del contexto autenticado y no del body o query param?
- ¿qué montos o estados se están confiando de más?
- ¿qué regla de negocio hoy vive demasiado en la UI?
- ¿qué endpoint depende demasiado del flujo feliz?
- ¿qué operación crítica puede probarse desde Postman con otro payload?
- ¿qué DTO acepta más de lo que debería?
- ¿qué campo interno podría manipularse aunque la UI no lo muestre?
- ¿qué acción parece segura solo porque la pantalla la oculta?

---

## Mini ejercicio de reflexión

Elegí tres endpoints de tu backend y respondé:

1. ¿Qué parte del request viene del cliente?
2. ¿Qué parte de eso debería ser solo una sugerencia y no una verdad?
3. ¿Qué debería recalcular el backend?
4. ¿Qué debería ignorar aunque el cliente lo mande?
5. ¿Qué validación existe hoy solo en frontend?
6. ¿Qué pasaría si alguien llama ese endpoint con un request fabricado?

Si esa última pregunta cambia mucho el resultado, tu backend probablemente esté confiando de más.

---

## Resumen

Nunca confiar en el cliente no significa rechazar todo.

Significa entender bien esta diferencia:

## El cliente puede:
- sugerir
- proponer
- pedir
- guiar
- ayudar a la UX

## El backend debe:
- verificar
- recalcular
- autorizar
- limitar
- decidir
- auditar
- imponer la verdad del sistema

En resumen:

> Un backend sano trata al request como una intención a evaluar, no como una verdad a aceptar.

---

## Próximo tema

**Validación con Bean Validation**
