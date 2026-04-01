---
title: "Auditoría y trazabilidad de acciones"
description: "Cómo registrar qué pasó en un sistema, quién realizó una acción y cuándo ocurrió, y por qué eso importa tanto en backends reales."
order: 63
module: "Operación y confiabilidad"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya recorriste una parte muy amplia del backend con Java y Spring Boot:

- controllers
- services
- DTOs
- validaciones
- seguridad
- persistencia
- testing
- observabilidad
- arquitectura
- versionado de API
- multitenancy
- búsqueda y filtrado avanzado

Eso ya te permite construir APIs bastante serias.

Pero cuando los sistemas empiezan a crecer y a tener usuarios reales, aparece una pregunta muy importante:

**¿cómo sabés qué pasó dentro del sistema, quién hizo algo y cuándo lo hizo?**

Ahí entra la auditoría y la trazabilidad.

## Qué es auditoría

Auditoría significa registrar acciones relevantes del sistema de forma que luego puedas reconstruir qué ocurrió.

Dicho simple:

es guardar evidencia útil sobre eventos importantes.

## Qué es trazabilidad

Trazabilidad significa poder seguir el rastro de una acción, una operación o un cambio a través del sistema.

Por ejemplo:

- quién creó una orden
- quién cambió un estado
- cuándo se eliminó un recurso
- qué usuario modificó cierto dato
- qué request generó cierto efecto
- qué sistema externo participó en una operación

## La idea general

Un sistema serio no solo debería hacer cosas bien.
También debería poder explicar después qué pasó.

Por ejemplo:

- un admin cambió el precio de un producto
- un usuario canceló una orden
- una integración externa creó un registro
- un proceso automático actualizó un estado
- una operación falló a mitad de camino

Si no tenés trazabilidad, todo eso se vuelve mucho más difícil de entender.

## Qué problema resuelve

La auditoría y la trazabilidad ayudan a resolver preguntas como:

- ¿quién hizo este cambio?
- ¿cuándo ocurrió?
- ¿desde qué contexto pasó?
- ¿qué valor tenía antes y cuál después?
- ¿esta acción fue manual o automática?
- ¿qué request disparó este efecto?
- ¿cómo reconstruyo el historial de este recurso?

## Por qué importa tanto

Porque en sistemas reales estas preguntas aparecen muchísimo.

Por ejemplo en:

- paneles administrativos
- órdenes
- pagos
- permisos
- inventario
- seguridad
- cumplimiento normativo
- soporte a usuarios
- debugging
- incidentes

## Diferencia entre logs y auditoría

Esto conviene distinguirlo.

### Logs

Sirven mucho para observar técnicamente lo que ocurre.
Por ejemplo:

- errores
- arranque
- llamadas externas
- warnings
- timings

### Auditoría

Busca registrar acciones relevantes del sistema con valor histórico o de negocio.

Por ejemplo:

- usuario 15 cambió el estado de la orden 342 de `PENDING` a `SHIPPED`
- admin 3 modificó el stock del producto 18
- usuario 21 eliminó una nota

Ambas cosas se complementan, pero no son lo mismo.

## Qué tipo de acciones conviene auditar

No hace falta auditar absolutamente todo.

Suele tener más sentido auditar cosas como:

- creación de recursos importantes
- cambios de estado
- acciones administrativas
- cambios de permisos
- eliminaciones
- accesos sensibles
- acciones sobre dinero, stock o seguridad
- procesos automáticos relevantes

## Qué no hace falta auditar siempre

Quizá no haga falta registrar con persistencia auditada cosas demasiado triviales o de muy bajo valor, dependiendo del sistema.

Por ejemplo, no todo clic o toda consulta simple merece una auditoría permanente.

## Qué datos suelen auditarse

Depende del sistema, pero suelen aparecer campos como:

- quién hizo la acción
- qué acción fue
- sobre qué recurso
- cuándo ocurrió
- valores anteriores y nuevos, si aplica
- resultado o estado de la acción
- contexto adicional útil

## Ejemplo mental simple

Supongamos que un admin cambia el precio de un producto.

Una auditoría razonable podría registrar algo como:

- actor: admin 7
- acción: `PRODUCT_PRICE_UPDATED`
- recurso: producto 15
- before: 1000
- after: 1200
- fecha: 2026-03-23 15:10:00

## Qué valor tiene esto

Muchísimo.

Porque después podés responder preguntas concretas sin depender de memoria humana.

## Auditoría de negocio vs auditoría técnica

También conviene distinguir esto.

### Auditoría de negocio

Registra hechos relevantes para el comportamiento del sistema o del dominio.

Ejemplo:
`ORDER_STATUS_CHANGED`

### Auditoría técnica

Registra aspectos más operativos o de infraestructura.

Ejemplo:
`USER_AUTH_FAILED_FROM_IP`

Ambas pueden ser útiles, pero no cumplen exactamente el mismo rol.

## En qué nivel registrar auditoría

Una pregunta importante es:
¿dónde debería vivir la auditoría?

La respuesta depende del diseño, pero una regla sana suele ser:

la auditoría relevante de negocio suele estar más cerca del caso de uso o del service que de un controller puramente HTTP.

## Por qué no solo en el controller

Porque el controller ve la request, pero no siempre conoce bien el significado real del cambio de negocio.

Por ejemplo, un controller puede recibir “cambiar estado”, pero la lógica de negocio sabe si eso realmente ocurrió, si fue válido y con qué consecuencias.

## Ejemplo mental

No alcanza con registrar:

- “entró un PATCH /orders/15/status”

Muchas veces importa más registrar algo como:

- “la orden 15 pasó de `PENDING` a `SHIPPED` por el admin 4”

Eso es mucho más útil.

## Auditoría en el modelo de datos

Una forma común de empezar es tener campos básicos de auditoría en entidades.

Por ejemplo:

- `createdAt`
- `updatedAt`
- `createdBy`
- `updatedBy`

## Ejemplo conceptual

```java
public class Product {
    private Long id;
    private String name;
    private double price;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;

    public Product(Long id, String name, double price,
                   LocalDateTime createdAt, LocalDateTime updatedAt,
                   Long createdBy, Long updatedBy) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.createdBy = createdBy;
        this.updatedBy = updatedBy;
    }
}
```

## Qué aporta esto

Aporta una capa básica de auditoría del recurso.

No cuenta toda la historia de cambios, pero ya responde cosas importantes como:

- quién lo creó
- cuándo se actualizó por última vez
- quién lo modificó por última vez

## Limitación de este enfoque

No guarda historial completo.
Solo el estado actual y algunos metadatos.

Si querés trazabilidad más rica, muchas veces necesitás algo más.

## Tabla de auditoría o eventos auditables

Una estrategia bastante común es tener una tabla separada de auditoría.

Por ejemplo:

- `audit_log`
- `audit_event`
- `entity_audit`
- según tu naming

## Qué podría guardar una tabla así

Por ejemplo:

- id
- actorId
- actorType
- action
- resourceType
- resourceId
- timestamp
- beforeValue
- afterValue
- metadata

## Ejemplo mental de fila auditada

| id | actor_id | action | resource_type | resource_id | timestamp | before | after |
|----|----------|--------|---------------|-------------|-----------|--------|-------|
| 1  | 7        | PRODUCT_PRICE_UPDATED | PRODUCT | 15 | 2026-03-23T15:10 | 1000 | 1200 |

## Qué ventaja tiene este enfoque

Que te da una historia de eventos, no solo la foto actual del recurso.

## Qué costo tiene

- más persistencia
- más diseño
- más volumen de datos
- más decisiones sobre qué guardar y cuánto detalle

## Before / after

Guardar valor anterior y valor nuevo puede ser muy poderoso.

Pero también exige cuidado.

Por ejemplo, no siempre conviene guardar objetos completos si:

- son grandes
- contienen datos sensibles
- cambian mucho
- no hace falta tanto detalle

A veces alcanza con auditar:

- campo clave cambiado
- resumen del cambio
- identificadores relevantes

## Ejemplo sano de before/after

```json
{
  "field": "status",
  "before": "PENDING",
  "after": "SHIPPED"
}
```

## Ejemplo más delicado

Guardar un objeto entero con muchísimos datos sensibles quizá no sea buena idea.

Por eso la auditoría también exige criterio de privacidad y seguridad.

## Actor

Otro concepto muy importante es el actor.

El actor puede ser:

- un usuario humano
- un admin
- un sistema automático
- una integración externa
- un job programado

Conviene que la auditoría pueda representar eso con claridad.

## Ejemplo mental

- `actorType = USER`
- `actorId = 15`

o:

- `actorType = SYSTEM`
- `actorId = null`

## Auditoría y Spring Security

Esto conecta muy fuerte con seguridad.

Muchas veces el actor actual se obtiene del usuario autenticado en el contexto de seguridad.

Por eso, si tu API ya trabaja con autenticación y roles, estás bastante bien parado para enriquecer auditoría con identidad del actor.

## Ejemplo conceptual

Si un usuario autenticado crea una orden, el sistema puede registrar:

- actor = usuario autenticado
- acción = `ORDER_CREATED`
- recurso = orden 500
- timestamp = ahora

## Auditoría de cambios de estado

Uno de los casos más valiosos de auditoría suele ser el cambio de estado.

Por ejemplo:

- orden de `PENDING` a `PAID`
- orden de `PAID` a `SHIPPED`
- usuario de `ACTIVE` a `BLOCKED`
- producto de `VISIBLE` a `HIDDEN`

Esos cambios suelen tener mucho valor de negocio y de soporte.

## Qué ayuda a responder

Después podés responder preguntas como:

- ¿quién lo cambió?
- ¿cuándo?
- ¿qué estado tenía antes?
- ¿qué estado tiene ahora?
- ¿fue usuario o sistema?

## Auditoría y compliance

En algunos sistemas, la auditoría no es solo una comodidad.
Puede ser un requisito importante.

Por ejemplo en dominios como:

- finanzas
- salud
- administración
- facturación
- seguridad
- sistemas empresariales sensibles

No hace falta entrar en normativa específica ahora, pero conviene saber que la auditoría puede ser muy relevante incluso legalmente o contractualmente.

## Trazabilidad de request

Otra dimensión interesante es poder seguir una request o flujo a través del sistema.

Por ejemplo:

- request id
- correlation id
- tenant
- usuario
- recurso afectado

Eso ayuda a unir:

- logs
- auditoría
- integraciones
- observabilidad

## Qué es un correlation id

Es un identificador que permite seguir una misma operación a través de distintos componentes o logs.

Por ejemplo, si una orden:

- entra por HTTP
- dispara integración externa
- publica evento
- genera auditoría

tener un `correlationId` común puede ayudar muchísimo a reconstruir el flujo.

## Auditoría y multitenancy

Esto conecta también con multitenancy.

Si el sistema tiene múltiples tenants, conviene que la auditoría también preserve ese contexto.

Por ejemplo:

- `tenantId`
- actor
- recurso
- acción

Así evitás mezclar historiales entre clientes y podés hacer búsquedas o análisis correctos.

## Auditoría y búsquedas

Cuando la auditoría crece, también aparece la necesidad de poder buscarla bien.

Por ejemplo, buscar por:

- actor
- acción
- recurso
- fecha
- tenant
- estado

Eso convierte la trazabilidad en algo realmente útil y no solo en una tabla que junta polvo.

## Ejemplo conceptual de evento auditado

```java
public class AuditEvent {
    private final String action;
    private final String resourceType;
    private final String resourceId;
    private final Long actorId;
    private final String actorType;
    private final LocalDateTime occurredAt;

    public AuditEvent(String action, String resourceType, String resourceId,
                      Long actorId, String actorType, LocalDateTime occurredAt) {
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.actorId = actorId;
        this.actorType = actorType;
        this.occurredAt = occurredAt;
    }

    public String getAction() {
        return action;
    }

    public String getResourceType() {
        return resourceType;
    }

    public String getResourceId() {
        return resourceId;
    }

    public Long getActorId() {
        return actorId;
    }

    public String getActorType() {
        return actorType;
    }

    public LocalDateTime getOccurredAt() {
        return occurredAt;
    }
}
```

## Qué muestra esto

Que podés modelar la auditoría como algo explícito del sistema, no solo como líneas sueltas en logs.

## Dónde persistir auditoría

Puede variar según el sistema.

Algunas opciones típicas pueden ser:

- tabla propia en la base principal
- base separada
- stream/event store
- sistema de logs estructurados
- combinación de varios enfoques

Para empezar, una tabla de auditoría clara suele ser una opción bastante comprensible.

## Qué no conviene hacer

No conviene:

- auditar sin criterio datos sensibles
- confiar solo en logs técnicos para historia de negocio
- no guardar actor ni timestamp
- dejar auditoría tan vaga que no sirva para nada
- hacer una auditoría tan pesada que complique todo sin necesidad

## Ejemplo mental sano

Caso:
admin cambia el stock de un producto.

Auditoría útil:

- actor: admin 4
- acción: `PRODUCT_STOCK_UPDATED`
- recurso: product 18
- before: 30
- after: 25
- timestamp
- tenant si aplica

Eso ya es muy valioso.

## Qué no siempre hace falta

Quizá no hace falta guardar el producto entero serializado, el request crudo completo y veinte detalles más si no aportan valor real.

La auditoría debe ser útil, no solo abundante.

## Buenas prácticas iniciales

## 1. Empezar auditando acciones de alto valor

Cambios de estado, permisos, stock, órdenes, etc.

## 2. Registrar actor, recurso, acción y timestamp

Esa base ya ayuda muchísimo.

## 3. Distinguir logs técnicos de auditoría de negocio

Ambos sirven, pero no para lo mismo.

## 4. Cuidar datos sensibles

La trazabilidad no justifica exponer secretos.

## 5. Pensar en búsqueda y explotación futura de la auditoría

No solo en guardar datos por guardar.

## Ejemplo conceptual de service con auditoría

```java
@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final AuditService auditService;

    public OrderService(OrderRepository orderRepository, AuditService auditService) {
        this.orderRepository = orderRepository;
        this.auditService = auditService;
    }

    public void markAsShipped(Long orderId, Long actorId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada"));

        OrderStatus previous = order.getStatus();
        order.setStatus(OrderStatus.SHIPPED);

        orderRepository.save(order);

        auditService.record(
                "ORDER_STATUS_CHANGED",
                "ORDER",
                orderId.toString(),
                actorId,
                "USER",
                "before=" + previous + ", after=" + order.getStatus()
        );
    }
}
```

## Qué demuestra este ejemplo

Demuestra la idea central:

- ocurre una acción relevante
- el sistema persiste el cambio real
- además registra una huella auditada útil

## Comparación con otros lenguajes

### Si venís de JavaScript

Quizás ya viste sistemas donde logs y audit logs se mezclan o donde cuesta reconstruir qué pasó en una acción crítica. En Java y Spring Boot, este tema suele tomar mucha fuerza porque muchos sistemas empresariales exigen historia clara, actores identificables y operaciones trazables.

### Si venís de Python

Puede recordarte a la necesidad de registrar cambios importantes más allá del simple logging técnico. En Java, la trazabilidad suele formalizarse bastante bien porque el ecosistema empresarial valora mucho poder reconstruir acciones sobre recursos sensibles.

## Errores comunes

### 1. Confiar solo en logs para auditoría de negocio

No suelen alcanzar bien para eso.

### 2. No registrar actor ni timestamp

La auditoría pierde mucho valor.

### 3. Auditar sin criterio información sensible

Eso puede volverse un riesgo.

### 4. No cruzar auditoría con tenant, seguridad o contexto

Entonces se vuelve mucho menos útil en sistemas reales.

### 5. Registrar cosas demasiado vagas

Después no se puede reconstruir realmente qué pasó.

## Mini ejercicio

Tomá una acción importante de tu proyecto integrador, por ejemplo:

- cambiar estado de orden
- modificar precio
- actualizar stock
- bloquear usuario

Y definí:

1. qué acción auditada registrarías
2. quién sería el actor
3. qué recurso se afecta
4. qué datos before/after guardarías
5. si el tenant debería incluirse
6. cómo buscarías luego ese historial

## Ejemplo posible

Caso:
cambiar precio de producto

- acción: `PRODUCT_PRICE_UPDATED`
- actor: admin autenticado
- recurso: producto 15
- before/after: `1000 -> 1200`
- tenant: sí, si aplica
- búsqueda futura:
  - por producto
  - por actor
  - por rango de fechas

## Resumen

En esta lección viste que:

- la auditoría registra acciones relevantes del sistema
- la trazabilidad permite reconstruir quién hizo qué y cuándo
- logs y auditoría no son lo mismo, aunque se complementan
- actor, recurso, acción y timestamp son piezas muy importantes
- auditoría se conecta con seguridad, multitenancy, observabilidad y soporte operativo
- diseñarla bien vuelve al sistema mucho más explicable, mantenible y profesional

## Siguiente tema

La siguiente natural es **soft delete, archivado y estrategias de borrado**, porque después de pensar en trazabilidad y cambios relevantes, otro paso muy valioso en sistemas reales es decidir qué significa realmente “eliminar” un dato y cómo conservar historial sin romper el dominio.
