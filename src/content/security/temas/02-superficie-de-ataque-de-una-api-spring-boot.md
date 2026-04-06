---
title: "Superficie de ataque de una API Spring Boot"
description: "Cómo identificar por dónde puede empezar un problema en un backend hecho con Java y Spring Boot. Qué endpoints, configuraciones, integraciones, cuentas y componentes amplían la superficie real de ataque."
order: 2
module: "Fundamentos"
level: "intro"
draft: false
---

# Superficie de ataque de una API Spring Boot

## Objetivo del tema

Entender qué significa realmente la **superficie de ataque** en un backend hecho con Java + Spring Boot y aprender a identificar por dónde puede empezar un problema, incluso cuando el sistema “parece” ordenado o bien estructurado.

---

## Idea clave

La superficie de ataque no es solo “los endpoints públicos”.

Es el conjunto de lugares desde donde un actor puede:

- enviar datos
- observar comportamiento
- provocar errores
- forzar rutas no previstas
- obtener contexto
- tocar recursos
- abusar lógica de negocio
- escalar hacia algo más sensible

En otras palabras:

> La superficie de ataque es todo lo que le da al actor una oportunidad real de interactuar con el sistema de una forma útil para producir daño.

---

## Qué es la superficie de ataque en una API Spring Boot

En una app Spring Boot, la superficie de ataque incluye mucho más que un `@RestController`.

Incluye, por ejemplo:

- endpoints REST públicos
- endpoints internos mal expuestos
- parámetros de búsqueda, filtros y paginación
- requests con `@RequestBody`
- subida de archivos
- autenticación y recuperación de contraseña
- paneles administrativos
- endpoints de Actuator
- documentación Swagger/OpenAPI
- integraciones externas
- webhooks
- cuentas técnicas
- servicios internos confiados de más
- configuraciones inseguras
- manejo de errores
- logs, trazas y mensajes de validación

### Ejemplo mental útil

Una API puede tener solo 15 endpoints y aun así tener una superficie de ataque grande si:

- acepta demasiados campos
- expone información de más
- tiene panel admin cerca del resto
- confía demasiado en IDs del cliente
- usa filtros dinámicos peligrosos
- publica Actuator sin cuidado
- deja rutas “internas” disponibles
- entrega mucha señal en errores

Entonces:

**pocos endpoints** no significa **poca superficie de ataque**

---

## Primer error común: creer que la superficie es solo la parte pública “bonita”

Cuando pensamos en API, solemos imaginar:

- `POST /auth/login`
- `GET /products`
- `POST /orders`

Pero en una app real también importan mucho cosas como:

- `/actuator`
- `/actuator/health`
- `/actuator/env`
- `/swagger-ui`
- `/v3/api-docs`
- `/admin/**`
- endpoints de soporte
- endpoints de importación/exportación
- webhooks
- callbacks de terceros
- endpoints “temporales”
- endpoints viejos que nadie limpió

Muchas veces el problema no empieza en el endpoint más importante, sino en uno **secundario** que estaba demasiado cerca de algo sensible.

---

## Superficie visible vs superficie real

## Superficie visible

Es la que el equipo suele tener más presente:

- controladores públicos
- login
- registro
- CRUD principal

## Superficie real

Es la visible **más**:

- configuraciones expuestas
- rutas auxiliares
- herramientas de observabilidad
- endpoints de testing que quedaron
- integraciones
- tareas administrativas
- automatizaciones
- mecanismos de error y validación
- objetos que se pueden consultar por ID
- parámetros manipulables

La superficie real casi siempre es más grande que la superficie mental del equipo.

---

## Cómo aparece la superficie de ataque en Spring Boot

## 1. Endpoints HTTP

La superficie más evidente.

Ejemplo:

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @GetMapping
    public List<ProductResponse> findAll() {
        return productService.findAll();
    }

    @GetMapping("/{id}")
    public ProductResponse findById(@PathVariable Long id) {
        return productService.findById(id);
    }

    @PostMapping
    public ProductResponse create(@RequestBody CreateProductRequest request) {
        return productService.create(request);
    }
}
```

Cada endpoint abre preguntas como:

- ¿quién puede usarlo?
- ¿qué recibe?
- ¿qué devuelve?
- ¿qué pasa si cambian el payload?
- ¿qué pasa si prueban IDs ajenos?
- ¿qué pasa si repiten la request?
- ¿qué pasa si mandan valores extremos?

---

## 2. Parámetros y query strings

Una gran parte de la superficie vive en parámetros aparentemente normales:

- `page`
- `size`
- `sort`
- `status`
- `userId`
- `role`
- `from`
- `to`
- `includeDeleted`

Ejemplo:

```java
@GetMapping
public Page<OrderResponse> search(
        @RequestParam String status,
        @RequestParam Long userId,
        @RequestParam int page,
        @RequestParam int size) {
    return orderService.search(status, userId, page, size);
}
```

Este endpoint puede ser peligroso si:

- el `userId` viene del cliente y no del contexto autenticado
- `size` no tiene límite
- `sort` acepta cualquier campo
- `status` se usa para abrir consultas más amplias de lo debido

A veces el ataque no está en “romper” el backend, sino en hacerlo consultar más, devolver más o dejar ver cosas que no debería.

---

## 3. `@RequestBody` demasiado confiado

Cada request body es una superficie de ataque muy fuerte.

Ejemplo riesgoso:

```java
@PostMapping("/users")
public User create(@RequestBody User user) {
    return userRepository.save(user);
}
```

## Problemas

- bind directo a entidad
- demasiados campos controlados por el cliente
- posibilidad de mass assignment
- campos internos manipulables
- falta de frontera clara entre HTTP y dominio

Versión mejor:

```java
@PostMapping("/users")
public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
    return userService.create(request);
}
```

La superficie sigue existiendo, pero ahora está **más acotada**.

---

## 4. IDs y referencias a recursos

En backend, una gran parte de la superficie aparece cada vez que el cliente puede señalar un recurso:

- `/{id}`
- `/{userId}`
- `/{orderId}`
- `/{invoiceId}`

Ejemplo:

```java
@GetMapping("/orders/{id}")
public OrderResponse getOrder(@PathVariable Long id) {
    return orderService.getOrder(id);
}
```

Preguntas clave:

- ¿cualquier usuario autenticado puede consultar cualquier `id`?
- ¿hay validación de ownership?
- ¿qué señal da si el recurso existe pero no me pertenece?
- ¿permite enumeración?

Un endpoint simple puede abrir una superficie enorme si la relación entre actor y recurso está mal resuelta.

---

## 5. Autenticación y recuperación de cuenta

La superficie de ataque también incluye flujos como:

- login
- registro
- activación
- recuperación de contraseña
- refresh token
- logout
- MFA

Ejemplo:

```java
@PostMapping("/auth/login")
public AuthResponse login(@RequestBody LoginRequest request) {
    return authService.login(request);
}
```

No es solo un endpoint de acceso.
También es superficie para:

- brute force
- enumeración de usuarios
- abuso de mensajes de error
- timing differences
- replay
- automatización masiva

---

## 6. Endpoints de administración

A veces el punto más delicado no es público, pero sí está expuesto dentro del mismo backend.

Ejemplo:

```java
@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    @PatchMapping("/{id}/role")
    public void updateRole(@PathVariable Long id, @RequestBody UpdateRoleRequest request) {
        adminUserService.updateRole(id, request);
    }
}
```

Esto amplía muchísimo la superficie, porque ahora el sistema tiene rutas que:

- cambian roles
- bloquean usuarios
- fuerzan estados
- exportan datos
- disparan acciones sensibles

La pregunta nunca es solo “¿hay autenticación?”  
También es:

- ¿quién puede llegar acá?
- ¿qué tan cerca está esto de otros roles?
- ¿qué pasa si un rol intermedio llega por error?
- ¿deja auditoría?
- ¿qué tan fácil es abusarlo?

---

## 7. Actuator y observabilidad expuesta

Spring Boot puede agregar superficie sin que el equipo la piense como “API de negocio”.

Ejemplos comunes:

- `/actuator/health`
- `/actuator/info`
- `/actuator/metrics`
- `/actuator/mappings`
- `/actuator/env`
- `/actuator/beans`

Aunque algunos endpoints parezcan inocentes, pueden dar:

- información de entorno
- nombres internos
- mappings completos
- pistas sobre configuración
- contexto útil para atacar mejor

### Idea práctica

No todo lo observable debería ser públicamente observable.

---

## 8. Swagger / OpenAPI

La documentación es útil, pero también expone bastante contexto:

- endpoints disponibles
- payloads
- modelos
- flujos esperados
- nombres internos
- operaciones sensibles

Eso no significa “nunca documentar”.

Significa:

- decidir quién accede
- no confiar en que “si está documentado está bien”
- no usar Swagger como excusa para exponer demasiado

---

## 9. Integraciones y webhooks

La superficie no solo entra desde usuarios.

También entra desde:

- servicios de pago
- sistemas de email
- ERP
- logística
- webhooks
- autenticación externa
- proveedores SaaS

Ejemplo:

```java
@PostMapping("/webhooks/payment")
public ResponseEntity<Void> receivePaymentWebhook(@RequestBody PaymentWebhookRequest request) {
    paymentWebhookService.process(request);
    return ResponseEntity.ok().build();
}
```

Ese endpoint puede ser una superficie crítica si:

- no valida origen
- no valida firma
- acepta eventos repetidos
- procesa estados inconsistentes
- confía demasiado en payload externo

---

## 10. Manejo de errores

La forma en que el backend falla también forma parte de la superficie.

Ejemplo malo:

```java
throw new RuntimeException("User not found with email " + email);
```

## Problemas posibles

- enumeración
- filtrado de información
- exposición de estructura interna
- diferencia entre usuario existente y no existente

La superficie también incluye las señales que da el sistema cuando algo sale mal.

---

## Superficie técnica vs superficie de negocio

Hay dos grandes planos.

## Superficie técnica

- endpoints
- parámetros
- body
- headers
- uploads
- tokens
- sesiones
- errores
- Actuator
- Swagger
- integraciones

## Superficie de negocio

- descuento aplicable
- cambio de estado
- cancelación de orden
- reembolso
- actualización de rol
- uso de cupones
- aprobación manual
- exportación de datos
- reasignación de ownership

A veces la superficie más peligrosa no es la más técnica, sino la que permite **abusar una regla del negocio**.

---

## Ejemplo práctico completo

Supongamos este endpoint:

```java
@PostMapping("/orders/{id}/cancel")
public ResponseEntity<Void> cancelOrder(@PathVariable Long id) {
    orderService.cancel(id);
    return ResponseEntity.noContent().build();
}
```

Parece simple.

Pero la superficie real incluye preguntas como:

- ¿cualquier usuario autenticado puede cancelar?
- ¿solo el dueño de la orden?
- ¿solo si está en cierto estado?
- ¿puede repetirse?
- ¿deja auditoría?
- ¿hay ventana temporal?
- ¿se valida contra pagos ya capturados?
- ¿hay lógica de compensación?
- ¿soporte puede usarlo sobre cualquier orden?
- ¿existe un endpoint admin parecido más poderoso?

Eso es superficie de ataque real.

---

## Cómo reconocer una superficie peligrosa

Una superficie suele ser más peligrosa cuando combina varias de estas cosas:

- está cerca de datos sensibles
- cambia estados importantes
- acepta muchos parámetros
- confía en IDs enviados por cliente
- toca permisos o roles
- interactúa con terceros
- usa cuentas técnicas
- está poco auditada
- tiene mucha lógica “implícita”
- está mal separada de otros contextos
- ofrece mucha señal en errores
- es fácil de automatizar

---

## Cómo achicar la superficie de ataque

No siempre se trata de “cerrar endpoints”.
Muchas veces se trata de hacerlos menos rentables para el actor equivocado.

## Formas concretas de reducir superficie

- usar DTOs en vez de entidades directas
- validar entrada con límites claros
- no aceptar campos innecesarios
- no exponer más datos de los necesarios
- restringir bien ownership
- separar mejor admin de usuario común
- endurecer flujos sensibles
- exigir contexto de negocio en service
- limitar filtros, sort y paginación
- proteger Actuator
- revisar Swagger expuesto
- validar webhooks e integraciones
- reducir privilegios de cuentas técnicas
- mejorar trazabilidad y auditoría

---

## Señal de diseño maduro

Un backend más maduro no es el que tiene “menos rutas” solamente.

Es el que:

- sabe cuáles son sus superficies más críticas
- entiende qué actor puede tocar cada una
- reduce el poder de cada punto de entrada
- evita que una superficie pequeña se convierta en un buen pivote
- deja menos espacio para crecer dentro del sistema

---

## Checklist práctico

Cuando revises una API Spring Boot, preguntate:

- ¿Cuáles son sus endpoints más sensibles?
- ¿Qué rutas auxiliares existen además del CRUD principal?
- ¿Qué body acepta de más?
- ¿Qué parámetros pueden abusarse?
- ¿Dónde se usan IDs del cliente sin suficiente validación?
- ¿Qué endpoint cambia estados importantes?
- ¿Qué rutas admin están demasiado cerca del resto?
- ¿Qué integra con terceros?
- ¿Qué endpoints técnicos están expuestos?
- ¿Qué errores o respuestas filtran demasiado contexto?
- ¿Qué parte podría automatizarse fácilmente para abusar el sistema?

---

## Mini ejercicio de reflexión

Tomá una API Spring real o imaginaria y armá esta lista:

1. Sus 10 endpoints más importantes
2. Sus 3 endpoints más sensibles
3. Sus 3 endpoints más fáciles de automatizar
4. Sus 3 superficies “secundarias” que más contexto podrían filtrar
5. Una ruta que no parece grave pero que podría servir como pivote
6. Una operación de negocio que podría abusarse aunque no haya bug técnico clásico

Si hacés bien este ejercicio, ya empezás a pensar como alguien que revisa seguridad backend de verdad.

---

## Resumen

La superficie de ataque de una API Spring Boot no es solo lo que recibe tráfico público.

Incluye todo lo que:

- recibe input
- devuelve señal
- toca reglas importantes
- conecta con piezas sensibles
- puede servir de escalón hacia algo peor

En resumen:

> La superficie de ataque no es solamente por dónde pueden entrar.
> También es por dónde pueden aprender, probar, crecer y acercarse a algo más valioso.

---

## Próximo tema

**Activos, datos, capacidades y daño posible en un backend**
