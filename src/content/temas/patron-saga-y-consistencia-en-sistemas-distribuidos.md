---
title: "Patrón Saga y consistencia en sistemas distribuidos"
description: "Qué es el patrón Saga, por qué aparece cuando una operación cruza varios servicios y cómo pensar consistencia sin una transacción única global."
order: 66
module: "Operación y confiabilidad"
level: "intermedio"
draft: false
---

## Introducción

En la lección anterior viste transacciones y consistencia en operaciones complejas.

Eso te dio una base muy importante:

cuando una operación modifica varias cosas relacionadas dentro de una misma aplicación y una misma base, muchas veces conviene tratarlas como una unidad transaccional.

Pero ahora aparece una pregunta más difícil:

**¿qué pasa cuando una operación ya no vive dentro de una sola base ni de un solo servicio?**

Por ejemplo:

- un servicio crea una orden
- otro reserva stock
- otro autoriza un pago
- otro genera envío
- otro registra auditoría o notificación

Ahí una transacción local clásica ya no alcanza.
Y aparece un problema central de sistemas distribuidos:

**cómo mantener consistencia sin una única transacción global sencilla**

Ahí entra el patrón Saga.

## La idea general

Supongamos que una compra real en un sistema distribuido involucra varios servicios:

- Orders
- Inventory
- Payments
- Shipping

Cada uno tiene:

- su propia lógica
- quizás su propia base
- sus propios tiempos
- sus propios fallos posibles

No podés asumir cómodamente que todo va a vivir dentro de un único `@Transactional` local.

Entonces necesitás otra estrategia.

## Qué es una Saga

Una Saga es un patrón para coordinar una operación de negocio distribuida como una secuencia de pasos locales, donde cada paso puede:

- confirmar una parte del trabajo
- y, si algo falla después, disparar acciones compensatorias

Dicho simple:

en vez de una gran transacción única,
tenés varias transacciones locales coordinadas.

## Qué problema resuelve

Resuelve la necesidad de mantener cierta coherencia de negocio cuando una operación cruza varios servicios o límites donde no existe una transacción única compartida.

Ayuda a responder:

- ¿cómo avanzo paso a paso?
- ¿qué hago si el paso 3 falla después de que el paso 1 y 2 salieron bien?
- ¿cómo revierto o compenso?
- ¿cómo evito dejar el sistema incoherente?

## Por qué importa tanto

Porque cuando la arquitectura se distribuye, la consistencia se vuelve mucho más difícil.

Sin una estrategia clara, pueden pasar cosas como:

- orden creada pero pago rechazado
- stock reservado pero orden cancelada
- pago aprobado pero envío nunca generado
- un servicio cree que todo salió bien y otro no

La Saga aparece como una forma de modelar mejor ese problema.

## Qué cambia respecto de una transacción local

En una transacción local clásica, la intuición era:

- todo o nada
- rollback automático si algo falla

En una Saga, la intuición cambia a algo más parecido a:

- avanzar por pasos locales
- si algo falla después, compensar lo anterior de forma explícita

Ese matiz es muy importante.

## Compensación

La compensación es una acción que intenta deshacer o neutralizar el efecto de un paso anterior que ya se confirmó.

No siempre significa “volver exactamente al estado anterior bit a bit”.
Muchas veces significa aplicar una operación de negocio opuesta o correctiva.

## Ejemplo mental simple

Caso:
crear orden distribuida.

Pasos:

1. Orders crea orden en estado `PENDING`
2. Inventory reserva stock
3. Payments intenta autorizar pago
4. Shipping prepara envío

Si el paso 3 falla, quizá necesites:

- cancelar la orden
- liberar stock reservado

Eso sería una compensación.

## Diferencia entre rollback y compensación

Conviene distinguirlos muy bien.

### Rollback

Suele pertenecer a una transacción local y revierte cambios que todavía no se confirmaron de forma definitiva fuera de ese contexto.

### Compensación

Actúa después de que ciertos pasos ya se comprometieron localmente, y necesita enviar acciones correctivas hacia otros servicios o contextos.

## Qué significa esto en términos prácticos

Que en sistemas distribuidos no podés confiar simplemente en “si falla, rollback automático global”.

Muchas veces el sistema ya hizo cosas reales en otros lados y ahora necesita responder con pasos compensatorios.

## Ejemplo completo mental

Supongamos este flujo:

1. Orders crea orden
2. Inventory reserva stock
3. Payments falla
4. entonces:
   - Inventory libera stock
   - Orders marca orden como `CANCELLED`

Esto ya muestra bastante bien el corazón del patrón.

## Por qué una Saga no es magia

La Saga ayuda muchísimo, pero no resuelve mágicamente toda la complejidad.

También trae preguntas importantes como:

- qué pasa si falla una compensación
- cómo coordinar estados
- cómo saber qué paso iba
- cómo evitar duplicados
- cómo manejar reintentos
- cómo observar todo el flujo

Por eso conviene entenderla con calma.

## Orquestación vs coreografía

En el mundo Saga suelen aparecer dos estilos muy conocidos:

- orquestación
- coreografía

## Saga por orquestación

Hay un componente central, un orquestador, que decide:

- qué paso sigue
- qué servicio llamar
- qué hacer si falla algo
- qué compensaciones disparar

## Qué ventaja tiene

El flujo suele ser más explícito y más fácil de visualizar centralmente.

## Qué desventaja tiene

Ese orquestador se vuelve una pieza importante y puede concentrar bastante lógica de coordinación.

## Ejemplo mental de orquestación

Un componente `OrderSagaOrchestrator` podría hacer algo así:

1. pedir a Orders que cree la orden
2. pedir a Inventory que reserve stock
3. pedir a Payments que autorice pago
4. si falla pago:
   - pedir a Inventory que libere stock
   - pedir a Orders que cancele orden

## Saga por coreografía

No hay un orquestador central que diga cada paso.
En cambio, los servicios reaccionan a eventos publicados por otros servicios.

## Qué ventaja tiene

Puede dar más desacople entre participantes.

## Qué desventaja tiene

El flujo global puede quedar más disperso y ser más difícil de entender o depurar.

## Ejemplo mental de coreografía

1. Orders publica `OrderCreated`
2. Inventory escucha `OrderCreated` y reserva stock
3. Inventory publica `StockReserved`
4. Payments escucha `StockReserved` y autoriza pago
5. Payments publica `PaymentFailed`
6. Orders e Inventory reaccionan a `PaymentFailed` y compensan

## Qué cambia entre ambos estilos

### Orquestación

Un cerebro central coordina.

### Coreografía

Los servicios “bailan” reaccionando a eventos.

## Qué conviene entender primero

Para una primera comprensión, mucha gente encuentra más simple arrancar pensando la Saga por orquestación, porque el flujo se ve más explícito.

Después tiene sentido comparar con coreografía.

## Ejemplo conceptual de pasos de una Saga

Imaginemos estos servicios:

- OrderService
- InventoryService
- PaymentService

Y la operación:
**confirmar compra**

Flujo:

1. crear orden
2. reservar stock
3. cobrar
4. si todo sale bien, confirmar orden
5. si falla cobro:
   - liberar stock
   - cancelar orden

## Qué demuestra esto

Que la consistencia se construye por acuerdos y pasos compensatorios, no por una única transacción de base.

## Estados intermedios

En una Saga suele ser bastante útil trabajar con estados explícitos.

Por ejemplo, una orden podría pasar por:

- `PENDING`
- `STOCK_RESERVED`
- `PAYMENT_APPROVED`
- `CONFIRMED`
- `CANCELLED`

Eso ayuda muchísimo a:

- entender el progreso
- depurar
- compensar
- observar el sistema

## Por qué importan tanto los estados

Porque una Saga no es instantánea ni atómica como una sola transacción local.

Puede durar varios pasos y pasar por estados intermedios.

El modelo del dominio tiene que tolerar eso.

## Ejemplo conceptual de estado

```java
public enum OrderStatus {
    PENDING,
    STOCK_RESERVED,
    PAYMENT_APPROVED,
    CONFIRMED,
    CANCELLED
}
```

## Qué valor tiene esto

Que el sistema puede reflejar mejor dónde está una operación compleja distribuida.

## Idempotencia

Otra vez aparece una idea muy importante:
la idempotencia.

En Sagas, los pasos y compensaciones pueden necesitar reintentos.

Si no son idempotentes, podés terminar con:

- doble cancelación
- doble liberación de stock
- doble cobro
- doble creación de eventos

Por eso es central diseñar operaciones que soporten bien reintentos o duplicados razonables.

## Ejemplo mental

Si ya liberaste stock y vuelve a llegar el mensaje de compensación, el sistema debería manejarlo con cuidado y no romperse.

## Observabilidad en una Saga

Esto conecta muy fuerte con observabilidad y auditoría.

Porque cuando una operación distribuida pasa por muchos pasos, conviene poder seguir:

- el estado actual
- qué pasos ya ocurrieron
- qué evento falló
- qué compensaciones se dispararon
- qué `correlationId` une todo el flujo

Sin eso, diagnosticar una Saga puede volverse muy difícil.

## Correlation ID

Es muy útil que todos los pasos relacionados de una Saga compartan un identificador común.

Por ejemplo:

- creación de orden
- reserva de stock
- autorización de pago
- cancelación o compensación

todo atado por un mismo `correlationId`.

Eso ayuda muchísimo a reconstruir el flujo en logs, auditoría y métricas.

## Qué pasa si falla una compensación

Este es uno de los puntos más difíciles del patrón.

La compensación también puede fallar.

Por ejemplo:

- intentás liberar stock y ese servicio está caído
- intentás cancelar orden y hay un error temporal

Por eso las compensaciones también deben pensarse con:

- retries
- observabilidad
- estados claros
- capacidad de reproceso
- monitoreo operativo

## Qué NO promete una Saga

No promete la misma atomicidad fuerte e instantánea que una única transacción local de base.

Lo que ofrece es una forma razonable de coordinar consistencia de negocio en un entorno distribuido.

Eso es muy distinto.

## Consistencia eventual

En muchos sistemas distribuidos aparece la idea de consistencia eventual.

Eso significa que el sistema puede no estar instantáneamente en su estado final correcto en todos lados al mismo tiempo, pero converge hacia ese estado con el paso de los eventos y compensaciones.

## Ejemplo mental

Durante unos instantes podría existir:

- orden en estado `PENDING`
- stock reservado todavía no confirmado
- pago en proceso

Y luego, según cómo termine la Saga, el sistema converge a:

- `CONFIRMED`
- o `CANCELLED`

## Cuándo tiene sentido pensar en Saga

Tiene sentido sobre todo cuando:

- una operación cruza varios servicios
- cada servicio tiene su propia base
- no hay una transacción global simple
- necesitás mantener coherencia de negocio entre pasos distribuidos

## Cuándo NO hace falta todavía

No hace falta meter Saga si:

- todo vive dentro de una sola app y una sola base
- una transacción local alcanza
- todavía no existe la complejidad distribuida real

No conviene sobrediseñar el sistema antes de tiempo.

## Relación con arquitectura hexagonal

La Saga encaja bien con puertos y adaptadores.

Por ejemplo, el caso de uso puede depender de puertos para:

- crear orden
- reservar stock
- cobrar
- compensar

Y la coordinación puede vivir en una capa de aplicación bastante explícita.

## Ejemplo mental de puerto

```java
public interface ReserveStockPort {
    void reserveStock(ReserveStockCommand command);
}
```

Y otro:

```java
public interface ReleaseStockPort {
    void releaseStock(ReleaseStockCommand command);
}
```

## Qué muestra esto

Que incluso las compensaciones pueden modelarse de forma explícita y clara.

## Ejemplo conceptual de orquestador

```java
public class CreateOrderSaga {

    public void execute(CreateOrderCommand command) {
        // 1. crear orden
        // 2. reservar stock
        // 3. cobrar
        // 4. confirmar o compensar
    }
}
```

## Qué demuestra este ejemplo

Que la coordinación de la Saga puede ser una pieza del sistema con responsabilidad explícita.

## Ventajas del patrón Saga

## 1. Permite coordinar operaciones distribuidas sin una única transacción global

## 2. Hace explícitos pasos y compensaciones

## 3. Ayuda a mantener consistencia de negocio en arquitecturas distribuidas

## 4. Encaja bien con mensajería, eventos y servicios separados

## Costos del patrón Saga

## 1. Más complejidad de diseño

## 2. Más estados intermedios

## 3. Más observabilidad necesaria

## 4. Compensaciones delicadas

## 5. Necesidad fuerte de idempotencia y retries sanos

## Ejemplo mental realista de e-commerce

Flujo:

1. Orders crea orden `PENDING`
2. Inventory reserva stock
3. Payments intenta cobrar
4. si pago aprueba:
   - Orders marca `CONFIRMED`
5. si pago falla:
   - Inventory libera stock
   - Orders marca `CANCELLED`

Eso ya es casi el ejemplo canónico para entender Saga.

## Qué no conviene hacer

No conviene:

- usar Saga por moda si una transacción local alcanza
- olvidar compensaciones
- ignorar estados intermedios
- no pensar idempotencia
- no observar el flujo distribuido
- asumir que la compensación siempre sale bien al primer intento

## Buenas prácticas iniciales

## 1. Entender muy bien primero la consistencia local

La Saga viene después de eso.

## 2. Modelar claramente pasos y compensaciones

Que el flujo se entienda.

## 3. Usar estados explícitos del dominio cuando haga falta

Ayudan muchísimo.

## 4. Diseñar pensando en reintentos e idempotencia

Es fundamental.

## 5. Agregar observabilidad seria al flujo distribuido

Sin eso, la operación se vuelve opaca.

## Comparación con otros lenguajes

### Si venís de JavaScript

Puede recordarte a flujos distribuidos donde varias APIs o microservicios cooperan sin una transacción única global. En Java y Spring Boot el patrón Saga aparece muchísimo en sistemas más grandes porque el ecosistema empresarial suele enfrentarse bastante a este tipo de coordinación entre servicios.

### Si venís de Python

Puede hacerte pensar en coordinación de operaciones entre varios servicios, workers o integraciones donde no alcanza con una única transacción local. En Java, Saga se vuelve un patrón muy natural cuando la arquitectura distribuida crece y la consistencia del negocio sigue importando muchísimo.

## Errores comunes

### 1. Querer usar una Saga sin entender bien transacciones locales primero

La base sigue siendo esa.

### 2. No diseñar compensaciones reales

Entonces la consistencia distribuida queda incompleta.

### 3. Ignorar idempotencia y reintentos

Eso suele explotar rápido.

### 4. No modelar estados intermedios

Después nadie entiende en qué etapa está la operación.

### 5. No tener observabilidad del flujo completo

Eso vuelve el sistema muy difícil de operar.

## Mini ejercicio

Tomá una operación distribuida imaginaria o real, por ejemplo:

- crear orden
- reservar stock
- cobrar
- generar envío

Y definí:

1. qué pasos tendría la Saga
2. qué servicio participa en cada paso
3. qué pasa si falla cada paso importante
4. qué compensación aplicarías
5. qué estado intermedio tendrías
6. qué `correlationId` o trazabilidad te gustaría conservar

## Ejemplo posible

Caso:
compra de e-commerce

- paso 1: Orders crea orden `PENDING`
- paso 2: Inventory reserva stock
- paso 3: Payments cobra
- paso 4: Orders confirma

Si falla paso 3:
- Inventory libera stock
- Orders cancela

Estados:
- `PENDING`
- `STOCK_RESERVED`
- `CONFIRMED`
- `CANCELLED`

## Resumen

En esta lección viste que:

- una Saga coordina una operación distribuida como una secuencia de pasos locales con posibles compensaciones
- aparece cuando una sola transacción local ya no alcanza
- la compensación no es lo mismo que un rollback clásico
- orquestación y coreografía son dos estilos muy conocidos para implementar Sagas
- estados intermedios, idempotencia y observabilidad son claves en este patrón
- entender Saga ayuda mucho a pensar consistencia de negocio en arquitecturas distribuidas

## Siguiente tema

La siguiente natural es **testing de integración más profundo y Testcontainers**, porque después de recorrer arquitectura, resiliencia, consistencia distribuida y operación realista, el siguiente paso muy valioso es aprender a probar todo eso de una forma más cercana al entorno real.
