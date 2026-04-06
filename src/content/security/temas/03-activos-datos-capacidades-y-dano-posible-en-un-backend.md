---
title: "Activos, datos, capacidades y daño posible en un backend"
description: "Cómo identificar qué vale realmente dentro de un backend hecho con Java y Spring Boot. Qué datos, capacidades y flujos deberían preocupar más, y por qué pensar en daño posible mejora mucho la forma de diseñar y revisar un sistema."
order: 3
module: "Fundamentos"
level: "intro"
draft: false
---

# Activos, datos, capacidades y daño posible en un backend

## Objetivo del tema

Aprender a identificar **qué parte del backend vale más**, qué capacidades concentran más riesgo y qué tipos de daño realmente importan al revisar una app hecha con Java + Spring Boot.

Este tema es importante porque una gran parte de los errores de seguridad aparecen cuando el equipo protege cosas visibles, pero no necesariamente las más valiosas.

---

## Idea clave

No todo en un backend vale lo mismo.

Y no todo lo valioso es “dato sensible”.

En un sistema real pueden ser críticos:

- datos
- permisos
- flujos de negocio
- secretos
- cuentas técnicas
- integraciones
- procesos automáticos
- trazabilidad
- continuidad operativa

En resumen:

> La seguridad mejora muchísimo cuando primero entendemos qué sería realmente costoso perder, filtrar, alterar, abusar o dejar caer.

---

## Qué significa “activo” en seguridad backend

Un activo es cualquier cosa cuyo compromiso tendría un costo relevante para:

- el negocio
- los usuarios
- la operación
- la integridad del sistema
- la confianza
- la continuidad

Un activo no es solo una tabla de base de datos.

También puede ser:

- una cuenta admin
- una API key
- una orden de compra
- un flujo de reembolso
- una integración de pagos
- un token de recuperación
- una cola de eventos
- una credencial de despliegue
- un endpoint interno
- una acción de soporte
- un secreto de configuración
- una política de autorización
- la capacidad de cancelar operaciones
- la posibilidad de emitir facturas o descuentos

---

## Error común: pensar solo en “datos personales”

Muchas veces cuando se habla de seguridad, el equipo piensa enseguida en:

- emails
- contraseñas
- documentos
- tarjetas
- direcciones

Sí, todo eso importa.

Pero en backend también pueden ser mucho más peligrosas cosas como:

- poder cambiar roles
- poder generar órdenes sin pagar
- poder reembolsar dinero
- poder consultar pedidos ajenos
- poder emitir tokens válidos
- poder alterar estados internos
- poder ejecutar acciones administrativas
- poder usar una integración con demasiado alcance

Entonces:

**dato sensible** no es la única categoría importante.  
A veces la **capacidad** es todavía más crítica que el dato.

---

## Datos, capacidades y flujos: tres formas de mirar el valor

## 1. Datos

Lo que el sistema guarda o procesa.

Ejemplos:

- contraseñas hasheadas
- emails
- teléfonos
- direcciones
- historial de órdenes
- datos de pago tokenizados
- logs
- auditoría
- información comercial
- datos internos de soporte

## 2. Capacidades

Lo que el sistema puede hacer.

Ejemplos:

- crear usuarios
- cambiar roles
- cancelar órdenes
- aprobar operaciones
- resetear contraseñas
- emitir descuentos
- generar credenciales
- desplegar cambios
- consultar datos de terceros
- procesar pagos
- disparar integraciones

## 3. Flujos críticos

Secuencias donde el valor no está en un único objeto, sino en el recorrido completo.

Ejemplos:

- login
- checkout
- reembolso
- recuperación de contraseña
- onboarding de usuarios
- publicación de productos
- aprobación administrativa
- exportación de datos
- activación de cuenta
- cambio de email

A veces el activo principal no es una tabla.
Es el **flujo**.

---

## Cómo pensar el daño posible

No alcanza con preguntar “qué activo hay”.

También hay que preguntar:

- ¿qué pasaría si alguien lo ve?
- ¿qué pasaría si alguien lo cambia?
- ¿qué pasaría si alguien lo borra?
- ¿qué pasaría si alguien lo usa fuera de contexto?
- ¿qué pasaría si se filtra?
- ¿qué pasaría si deja de estar disponible?
- ¿qué pasaría si una cuenta equivocada lo controla?

Ese análisis nos lleva al daño posible.

---

## Tipos de daño en un backend

## 1. Daño por exposición

Ejemplos:

- ver datos personales
- ver órdenes ajenas
- filtrar tokens
- exponer secretos
- revelar estructura interna
- mostrar datos de soporte o administración

## 2. Daño por modificación

Ejemplos:

- cambiar roles
- alterar precios
- editar estados
- tocar inventario
- modificar montos
- aprobar operaciones inválidas
- cambiar ownership

## 3. Daño por abuso de capacidad

Ejemplos:

- usar un endpoint legítimo para algo no previsto
- explotar un flujo de cupones
- generar órdenes repetidas
- automatizar cancelaciones
- abusar una integración de reembolso
- enviar webhooks falsos

## 4. Daño por indisponibilidad

Ejemplos:

- bloquear login
- saturar búsquedas pesadas
- romper checkout
- dejar inaccesible soporte
- afectar colas o procesamiento de eventos
- tirar abajo una integración crítica

## 5. Daño por pérdida de integridad

Ejemplos:

- estados inconsistentes
- auditorías incompletas
- datos inválidos persistidos
- transiciones que nunca debieron ocurrir
- decisiones de negocio tomadas sobre información falsa

---

## En backend, la integridad suele importar muchísimo

Muchos equipos piensan primero en confidencialidad.

Pero en muchos sistemas backend, la **integridad** puede ser todavía más importante.

Ejemplos:

- que el total de una orden sea correcto
- que solo se facture lo debido
- que un pago no se procese dos veces
- que un rol no cambie sin control
- que un reembolso no salga fuera de secuencia
- que una orden no cambie de usuario
- que una cuenta bloqueada no vuelva a operar

A veces el peor daño no es “que vean algo”.  
Es “que el sistema acepte algo falso como verdadero”.

---

## Ejemplo simple: qué activo vale más de lo que parece

Supongamos esta entidad:

```java
@Entity
public class Order {
    @Id
    @GeneratedValue
    private Long id;

    private BigDecimal total;
    private String status;
    private Long userId;
}
```

A simple vista, alguien podría pensar:

- el activo importante es la orden
- el dato importante es el total
- el endpoint importante es ver la orden

Pero al mirar mejor, los activos reales pueden ser:

- la integridad del `total`
- la integridad del `status`
- la relación entre `userId` y la orden
- la transición válida entre estados
- la autorización para cancelar o reembolsar
- la trazabilidad de quién modificó qué

El valor real muchas veces está en la **regla**, no en la fila.

---

## Ejemplo: capacidad más crítica que el dato

Veamos este endpoint:

```java
@PostMapping("/admin/users/{id}/role")
public ResponseEntity<Void> updateRole(
        @PathVariable Long id,
        @RequestBody UpdateRoleRequest request) {
    adminUserService.updateRole(id, request);
    return ResponseEntity.noContent().build();
}
```

¿Qué es más crítico acá?

- ¿el nombre del rol actual?
- ¿el email del usuario?
- ¿o la capacidad de cambiar el rol?

Claramente, la capacidad de cambiar privilegios es muchísimo más delicada que gran parte de los datos visibles del usuario.

Este es un buen ejemplo de por qué un backend debe proteger también **capacidades**.

---

## Cómo identificar los activos de un backend Spring

Una forma muy práctica es revisar el sistema por preguntas.

## Pregunta 1: ¿Qué cosas no debería ver cualquiera?

Eso apunta a:

- datos sensibles
- datos privados de negocio
- métricas internas
- configuraciones
- auditorías
- datos de soporte
- detalles de usuarios ajenos

## Pregunta 2: ¿Qué cosas no debería poder hacer cualquiera?

Eso apunta a:

- crear
- aprobar
- borrar
- cancelar
- exportar
- reasignar
- reembolsar
- cambiar roles
- emitir tokens
- disparar integraciones

## Pregunta 3: ¿Qué cosas, si salen mal, serían caras de explicar?

Eso apunta a:

- pagos duplicados
- descuentos inválidos
- cuentas elevadas de rol
- órdenes ajenas visibles
- recuperaciones de contraseña mal resueltas
- estados inconsistentes
- auditoría incompleta
- operaciones sin trazabilidad

## Pregunta 4: ¿Qué parte del sistema concentraría más daño si una cuenta se compromete?

Eso apunta a:

- panel admin
- soporte
- cuentas técnicas
- integraciones
- pipelines
- bases con permisos amplios
- servicios internos sobredimensionados

---

## Qué activos suelen aparecer en una app Java + Spring

En una app típica con Spring Boot suelen existir activos como:

- credenciales de usuarios
- refresh tokens
- tokens de recuperación
- sesiones
- entidades de negocio
- relaciones de ownership
- paneles administrativos
- cuentas técnicas
- variables de entorno
- secretos de integraciones
- datos exportables
- endpoints internos
- logs
- auditoría
- reglas de autorización
- pipelines de despliegue
- configuraciones de seguridad
- colas o eventos
- integraciones con pagos, email o terceros

No todos tienen el mismo valor.
Pero todos deberían estar en el mapa mental del backend.

---

## Señal de diseño ingenuo

Una app suele estar pensada de forma ingenua cuando:

- protege login pero no flujos críticos
- protege datos visibles pero no capacidades
- protege endpoints públicos pero no paneles internos
- protege el recurso, pero no la transición
- protege la contraseña, pero no el reset
- protege el usuario final, pero no la cuenta técnica
- protege lectura, pero no modificación
- protege acceso, pero no integridad

---

## Cómo cambia el diseño cuando pensamos bien los activos

Cuando el equipo identifica bien qué vale más, empieza a tomar mejores decisiones como:

- usar DTOs más acotados
- endurecer validaciones de service
- separar mejor admin de usuario común
- agregar auditoría en acciones críticas
- reducir permisos de cuentas técnicas
- poner fricción útil en operaciones sensibles
- evitar binds directos a entidades
- filtrar mejor responses
- limitar qué campos pueden cambiarse
- revisar ownership y reglas del dominio
- proteger mejor integraciones y secretos

---

## Ejemplo práctico de lectura defensiva

Supongamos esta clase:

```java
@Service
public class RefundService {

    public void refund(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        order.setStatus("REFUNDED");
        orderRepository.save(order);
    }
}
```

Una lectura ingenua diría:

- busca la orden
- cambia estado
- guarda

Una lectura orientada a seguridad preguntaría:

- ¿quién puede llamar esto?
- ¿la orden ya estaba pagada?
- ¿ya fue reembolsada?
- ¿hay validación de ownership o rol?
- ¿se deja auditoría?
- ¿se avisa al sistema de pagos?
- ¿hay control de concurrencia?
- ¿puede repetirse?
- ¿es reversible?
- ¿qué daño causaría usarlo sobre cualquier orden?

Eso es pensar en activos, capacidades y daño posible.

---

## Checklist práctico

Cuando revises un backend Spring, preguntate:

- ¿qué datos son realmente sensibles?
- ¿qué operaciones son realmente críticas?
- ¿qué cuenta o rol tiene demasiado poder?
- ¿qué endpoint cambia cosas importantes?
- ¿qué capacidad sería más cara de abusar?
- ¿qué flujo sería más costoso romper?
- ¿qué regla de negocio no puede salir mal?
- ¿qué parte del sistema haría más daño si se comprometiera?
- ¿qué cosas hoy tienen poco control y mucho impacto?
- ¿qué acciones sensibles no dejan auditoría?

---

## Mini ejercicio de reflexión

Tomá una app backend real o imaginaria y armá estas 4 listas:

### 1. Tus 5 datos más sensibles
### 2. Tus 5 capacidades más peligrosas
### 3. Tus 5 flujos más críticos
### 4. Tus 5 daños más costosos

Después respondé:

- ¿lo que más protegés hoy coincide con esas listas?
- ¿o estás protegiendo mejor lo visible que lo realmente importante?

Ese contraste suele mostrar muy rápido dónde está la ingenuidad del diseño.

---

## Resumen

En seguridad backend no alcanza con pensar en “tablas sensibles”.

También hay que pensar en:

- qué capacidades concentran riesgo
- qué reglas de negocio no deberían romperse
- qué flujos serían caros de abusar
- qué cuentas o integraciones harían más daño
- qué tipos de daño importan más: exposición, modificación, abuso, indisponibilidad o pérdida de integridad

En resumen:

> Un backend mejora mucho cuando deja de proteger solo objetos visibles y empieza a proteger también capacidades, transiciones, reglas y daño posible.

---

## Próximo tema

**Qué debe proteger realmente el backend y qué no puede delegar al frontend**
