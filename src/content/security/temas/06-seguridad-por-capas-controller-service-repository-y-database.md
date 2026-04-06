---
title: "Seguridad por capas: controller, service, repository y database"
description: "Cómo pensar la seguridad de un backend Java Spring por capas. Qué riesgos suelen vivir en controller, cuáles en service, qué errores aparecen en repository y por qué la base de datos también forma parte del diseño defensivo."
order: 6
module: "Fundamentos"
level: "intro"
draft: false
---

# Seguridad por capas: controller, service, repository y database

## Objetivo del tema

Entender cómo revisar y diseñar la seguridad de un backend Java + Spring por capas, sin caer en el error de pensar que “la seguridad está en Spring Security” o “la seguridad está en el controller”.

La idea de este tema es simple:

un backend seguro no depende de **una sola barrera**.

Depende de que cada capa haga bien su parte y no delegue ciegamente cosas que le corresponden.

---

## Idea clave

En una aplicación Spring, la seguridad no vive en un único lugar.

Se reparte, como mínimo, entre estas capas:

- **controller**
- **service**
- **repository**
- **database**

Y además, según el sistema, también toca:

- configuración
- cuentas técnicas
- integraciones
- logs
- colas/eventos
- secretos
- infraestructura y despliegue

En resumen:

> La seguridad madura aparece cuando cada capa hace bien su trabajo, sin confiar demasiado en la capa anterior ni esperar que la siguiente arregle todo.

---

## Error mental muy común

Pensar algo como esto:

- “Ya lo valida el controller.”
- “Eso lo ve Spring Security.”
- “La UI no deja mandar ese campo.”
- “El repository trae lo que haya.”
- “La base solo guarda datos.”

Ese pensamiento genera huecos.

Porque en un backend real:

- el **controller** no alcanza para imponer reglas de negocio
- el **service** no debería confiar ciegamente en cualquier input que le llegue
- el **repository** puede exponer demasiado si no se diseña con criterio
- la **database** también participa en integridad, permisos y daño posible

---

## Qué significa “seguridad por capas”

Significa que cada capa debería responder a preguntas distintas.

## Controller

Preguntas típicas:

- ¿qué request entra?
- ¿qué DTO acepta?
- ¿qué endpoint expone?
- ¿qué actor llega hasta acá?
- ¿qué señal devuelve?

## Service

Preguntas típicas:

- ¿esta operación tiene sentido de negocio?
- ¿este actor puede hacer esto?
- ¿el estado actual lo permite?
- ¿se está abusando una regla del dominio?
- ¿hay que auditar esta acción?

## Repository

Preguntas típicas:

- ¿qué datos trae?
- ¿trae de más?
- ¿falta filtrar por ownership o tenant?
- ¿la query permite abuso?
- ¿puede enumerarse demasiado fácil?

## Database

Preguntas típicas:

- ¿qué cuenta técnica llega?
- ¿con qué permisos?
- ¿hay integridad suficiente?
- ¿la exposición de datos sería grave?
- ¿el acceso está acotado?
- ¿la estructura ayuda o empeora el daño?

---

## Capa 1: Controller

El controller es la puerta HTTP del backend.

Es donde el sistema:

- recibe input
- expone endpoints
- devuelve responses
- enlaza autenticación con la operación
- define qué formato entra y sale

### Qué debería hacer bien un controller

- aceptar DTOs acotados
- validar formato básico
- no bindear entidades directamente
- no aceptar campos internos
- obtener identidad desde el contexto autenticado
- no confiar en datos delicados enviados por el cliente
- delegar la lógica real al service

### Qué no debería hacer un controller

- contener toda la lógica de negocio
- decidir solo por UI-flows
- confiar en `userId` del request
- persistir entidades directamente desde el body
- mezclar validación sintáctica con reglas del dominio profundas

---

## Ejemplo de controller ingenuo

```java
@PostMapping("/orders")
public Order create(@RequestBody Order order) {
    return orderRepository.save(order);
}
```

## Problemas

- bind directo a entidad
- demasiados campos controlados por cliente
- mezcla HTTP con persistencia
- el controller ya está tomando una decisión demasiado grande
- no hay frontera clara entre request, negocio y almacenamiento

Versión mejor:

```java
@PostMapping("/orders")
public OrderResponse create(
        @Valid @RequestBody CreateOrderRequest request,
        Authentication authentication) {
    return orderService.create(request, authentication.getName());
}
```

Acá el controller:

- recibe
- valida formato básico
- toma identidad
- delega

Eso es mucho más sano.

---

## Qué riesgos suelen vivir en controller

- endpoints demasiado generosos
- mass assignment
- DTOs mal diseñados
- parámetros peligrosos
- IDs confiados de más
- exposición excesiva en responses
- errores que filtran contexto
- endpoints admin demasiado cerca de usuario común
- cuerpos que aceptan más de lo que deberían

---

## Capa 2: Service

El service es, en la mayoría de las apps Spring bien diseñadas, el lugar donde debería vivir la parte más importante de la seguridad de negocio.

Porque ahí es donde el sistema puede responder:

- ¿esto tiene sentido?
- ¿esta acción está permitida?
- ¿el recurso pertenece al actor?
- ¿el estado actual permite este cambio?
- ¿la operación puede repetirse?
- ¿hay que dejar auditoría?
- ¿hay que recalcular algo crítico?

---

## El service como capa de verdad

Si el controller dice:

- “llegó esta intención”

el service debería decidir:

- “si esa intención puede convertirse en una acción válida”

### Ejemplo

```java
public OrderResponse cancel(Long orderId, String username) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    User user = userRepository.findByEmail(username).orElseThrow();

    if (!order.getUser().getId().equals(user.getId())) {
        throw new AccessDeniedException("No autorizado");
    }

    if (!order.canBeCancelled()) {
        throw new IllegalStateException("La orden no puede cancelarse");
    }

    order.cancel();
    orderRepository.save(order);

    return mapper.toResponse(order);
}
```

Acá el service está haciendo trabajo de seguridad real:

- ownership
- transición válida
- contexto del actor
- aplicación de reglas del dominio

Eso no debería depender solo del controller.

---

## Qué riesgos suelen vivir en service

- reglas de negocio ausentes
- ownership incompleto
- estados inválidos aceptados
- abuso de secuencias
- operaciones críticas sin auditoría
- lógica reutilizable llamada sin suficiente control
- confianza excesiva en lo ya validado antes
- recalcular mal o no recalcular datos sensibles
- no considerar concurrencia o repetición

---

## Señal de diseño sano

Si una operación es sensible, debería ser difícil ejecutarla sin pasar por una capa de service que:

- entienda el actor
- entienda el recurso
- entienda la regla
- entienda el estado
- entienda el daño posible

---

## Capa 3: Repository

Muchos equipos piensan que el repository “solo trae datos”.

Pero el repository también participa en seguridad.

¿Por qué?

Porque según cómo consultes, filtres o proyectes datos, podés:

- exponer demasiado
- permitir enumeración
- mezclar tenants
- saltarte ownership
- consultar recursos ajenos
- traer campos innecesarios
- habilitar abuso de búsqueda
- volver más rentable una cadena ofensiva

---

## Ejemplo de repository ingenuo

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
}
```

Y luego en service:

```java
public OrderResponse getById(Long id) {
    Order order = orderRepository.findById(id).orElseThrow();
    return mapper.toResponse(order);
}
```

Esto puede ser correcto o peligrosísimo, según lo que falte después.

Si el service no valida ownership, el repository está colaborando con una superficie muy rentable:

- basta conocer el `id`
- el sistema trae la orden completa
- después solo falta devolverla

Ahora comparemos con algo más orientado a seguridad:

```java
Optional<Order> findByIdAndUserEmail(Long id, String email);
```

o:

```java
@Query("select o from Order o where o.id = :id and o.user.email = :email")
Optional<Order> findVisibleOrder(@Param("id") Long id, @Param("email") String email);
```

Esto no reemplaza toda la lógica del service, pero ayuda a que el acceso ya venga más acotado.

---

## Qué riesgos suelen vivir en repository

- traer por ID sin filtrar ownership
- exponer entidades completas cuando no hace falta
- búsquedas dinámicas demasiado abiertas
- ordenamientos arbitrarios
- paginaciones sin límite
- consultas pesadas fáciles de abusar
- native queries inseguras
- JPQL mal construido
- filtrado insuficiente por tenant o por actor
- devolver más campos de los necesarios

---

## Repository seguro no significa repository “inteligente de más”

No significa meter toda la lógica del negocio adentro.

Significa diseñar consultas con criterio.

Ejemplos útiles:

- traer lo justo
- filtrar por actor cuando corresponde
- proyectar solo campos necesarios
- evitar búsquedas demasiado libres
- reducir superficie de exposición de datos

---

## Capa 4: Database

La base de datos no es una caja neutra.

También forma parte del modelo defensivo.

Porque la base concentra:

- datos valiosos
- relaciones de ownership
- historia operativa
- trazabilidad
- estados
- integridad
- secretos indirectos
- impacto fuerte si se consulta o modifica mal

---

## Qué preguntas de seguridad toca la database

- ¿qué cuenta técnica se conecta?
- ¿con qué permisos?
- ¿esa cuenta puede hacer demasiado?
- ¿hay separación entre lectura y escritura?
- ¿hay constraints que protejan integridad?
- ¿qué pasa si se filtran backups?
- ¿qué datos deberían minimizarse?
- ¿qué tablas son más delicadas?
- ¿qué exposición tendría una query muy amplia?
- ¿qué tanto daño puede causar una modificación indebida?

---

## Ejemplo de error clásico de diseño

Aplicación entera conectada con una cuenta que puede:

- leer todo
- escribir todo
- borrar todo
- alterar todo

Eso es cómodo.
Pero desde seguridad es malísimo.

Porque una sola credencial comprometida o una sola capa mal diseñada puede tener alcance desproporcionado.

---

## La database también ayuda a integridad

Aunque no toda regla debe ponerse en base, la base puede ayudar con:

- constraints
- unicidad
- claves foráneas
- estados consistentes
- límites de integridad
- defaults razonables

Ejemplo:

- evitar duplicados lógicos
- evitar referencias rotas
- limitar imposibles evidentes
- reforzar ciertas invariantes

La base no reemplaza al service, pero puede ayudar a que el sistema falle menos de formas absurdas o peligrosas.

---

## Cómo se conectan las capas entre sí

Una app sana suele seguir una lógica como esta:

### Controller
recibe intención

### Service
decide si esa intención es válida

### Repository
trae o persiste con alcance razonable

### Database
guarda y protege integridad básica con el menor poder necesario

Cuando esa cadena se rompe, aparecen problemas como:

- controller con demasiado poder
- service vacío o cosmético
- repository demasiado abierto
- database demasiado permisiva
- lógica crítica distribuida sin dueño claro

---

## Ejemplo completo de capas bien separadas

### Controller

```java
@PostMapping("/orders/{id}/cancel")
public ResponseEntity<Void> cancel(
        @PathVariable Long id,
        Authentication authentication) {
    orderService.cancel(id, authentication.getName());
    return ResponseEntity.noContent().build();
}
```

### Service

```java
public void cancel(Long orderId, String username) {
    Order order = orderRepository.findById(orderId).orElseThrow();
    User user = userRepository.findByEmail(username).orElseThrow();

    if (!order.belongsTo(user)) {
        throw new AccessDeniedException("No autorizado");
    }

    if (!order.canBeCancelled()) {
        throw new IllegalStateException("La orden no puede cancelarse");
    }

    order.cancel();
    orderRepository.save(order);
    auditService.recordOrderCancelled(orderId, username);
}
```

### Repository

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
}
```

### Database

- cuenta técnica con permisos acotados
- constraints razonables
- datos sensibles no expuestos innecesariamente
- trazabilidad y backups pensados con criterio

Este flujo no es perfecto por sí solo, pero muestra una distribución mucho más sana de responsabilidades.

---

## Qué pasa cuando una capa intenta “resolver todo”

## Si controller intenta resolver todo

Aparecen:

- controladores gigantes
- reglas de negocio pegadas a HTTP
- huecos cuando otro flujo reutiliza la misma lógica
- seguridad frágil y duplicada

## Si service no resuelve casi nada

Aparecen:

- lógica crítica dependiendo de controller o frontend
- reglas inconsistentes
- acciones sensibles sin criterio uniforme

## Si repository se diseña sin pensar seguridad

Aparecen:

- recursos ajenos visibles
- datos de más
- enumeración fácil
- queries rentables para abuso

## Si database tiene demasiado poder y poca integridad

Aparecen:

- gran impacto ante un error o compromiso
- poca contención
- daño masivo con una sola cuenta
- inconsistencias costosas

---

## Señales de diseño maduro por capas

Un backend más maduro suele mostrar cosas como:

- DTOs claros
- services que concentran reglas reales
- repositories pensados con alcance razonable
- cuentas técnicas menos amplias
- constraints útiles
- ownership bien resuelto
- menos confianza heredada entre capas
- auditoría en operaciones sensibles
- menos campos críticos controlados por el cliente

---

## Checklist práctico

Cuando revises una app Spring por capas, preguntate:

### Controller
- ¿acepta demasiado?
- ¿usa DTOs correctos?
- ¿expone más de lo necesario?
- ¿confía demasiado en el request?

### Service
- ¿vive acá la regla real?
- ¿se valida ownership?
- ¿se validan estados?
- ¿hay auditoría donde corresponde?
- ¿se recalculan valores críticos?

### Repository
- ¿trae demasiado?
- ¿filtra bien por actor o tenant?
- ¿permite consultas demasiado abiertas?
- ¿proyecta solo lo necesario?

### Database
- ¿qué permisos tiene la cuenta técnica?
- ¿hay constraints razonables?
- ¿qué tanto daño causaría una mala query o una credencial comprometida?
- ¿los datos más delicados están siendo tratados como tales?

---

## Mini ejercicio de reflexión

Tomá una operación sensible de tu backend, por ejemplo:

- cancelar orden
- cambiar rol
- resetear contraseña
- aprobar un recurso
- emitir reembolso

Y respondé:

1. ¿Qué parte controla el controller?
2. ¿Qué parte controla el service?
3. ¿Qué parte deja liberada el repository?
4. ¿Qué parte depende de la database?
5. ¿Hay alguna regla importante que hoy no tiene dueño claro?
6. ¿Hay una capa confiando demasiado en otra?

Si encontrás una regla crítica que “está medio repartida”, ahí probablemente haya una deuda importante.

---

## Resumen

La seguridad backend no vive en una sola capa.

## El controller debería:
- recibir bien
- exponer con criterio
- no confiar de más

## El service debería:
- decidir la verdad del negocio
- validar contexto, actor, recurso y estado

## El repository debería:
- consultar con criterio
- no exponer más de la cuenta

## La database debería:
- ayudar a integridad
- limitar daño
- operar con menos privilegio

En resumen:

> Un backend más seguro no es el que tiene una sola barrera fuerte.
> Es el que reparte mejor la responsabilidad defensiva entre sus capas.

---

## Próximo tema

**Qué errores son de código y cuáles son de diseño**
