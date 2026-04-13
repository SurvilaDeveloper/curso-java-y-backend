---
title: "Consistencia eventual"
description: "Qué significa la consistencia eventual en sistemas distribuidos, por qué aparece en microservicios y cómo interpretarla correctamente dentro del flujo de NovaMarket."
order: 36
module: "Módulo 9 · Datos distribuidos y consistencia"
level: "intermedio"
draft: false
---

# Consistencia eventual

En una arquitectura monolítica tradicional, muchas operaciones de negocio pueden ejecutarse dentro de una misma transacción local.  
Cuando el sistema se divide en microservicios, esa comodidad desaparece muy rápido.

Cada servicio tiene su propia responsabilidad, su propia persistencia y su propio ciclo de vida.  
Eso mejora el desacoplamiento, pero también introduce una consecuencia importante:

**no siempre todos los datos del sistema quedan sincronizados en el mismo instante.**

A esa realidad se la suele describir con un concepto muy importante en arquitecturas distribuidas:

**consistencia eventual**.

En esta clase vamos a entender qué significa de verdad, por qué aparece en microservicios y cómo se manifiesta dentro del proyecto del curso, **NovaMarket**.

---

## Qué significa “consistencia eventual”

La consistencia eventual significa que, después de un cambio, los distintos componentes del sistema **pueden no reflejar el mismo estado inmediatamente**, pero si no ocurren más cambios y el procesamiento pendiente termina correctamente, el sistema **converge** hacia un estado coherente.

La palabra importante no es solo “consistencia”.

La palabra importante es **eventual**.

Eso implica aceptar que:

- puede existir una demora,
- puede haber procesamiento pendiente,
- puede haber mensajes en tránsito,
- y durante un intervalo el sistema puede mostrar estados diferentes según qué servicio se consulte.

No significa que “todo vale”.

No significa que los datos puedan quedar incorrectos para siempre.

Significa que, en sistemas distribuidos, muchas veces la coherencia global no se obtiene en el mismo instante en que ocurre la primera operación.

---

## Por qué aparece en microservicios

La consistencia eventual aparece porque, al separar un sistema en servicios independientes, también se separan:

- las bases de datos,
- las transacciones,
- la lógica de negocio,
- y los tiempos de procesamiento.

Eso hace que una operación compuesta ya no pueda resolverse cómodamente con una sola transacción local.

Por ejemplo, en NovaMarket:

1. `order-service` crea una orden,
2. luego publica un evento,
3. `notification-service` consume ese evento,
4. e `inventory-service` puede actualizar una reserva de stock.

Aunque conceptualmente todo forme parte del mismo flujo de negocio, técnicamente ya no es una sola operación indivisible.

Cada paso puede ocurrir en momentos diferentes.

---

## Un ejemplo concreto en NovaMarket

Supongamos este flujo:

1. un usuario autenticado envía `POST /orders`,
2. `order-service` valida disponibilidad,
3. registra la orden,
4. publica `OrderCreatedEvent`,
5. `notification-service` consume ese evento,
6. genera una notificación o registra un log de auditoría.

Pregunta:

**¿La notificación existe exactamente en el mismo instante en que la orden fue creada?**

No necesariamente.

Puede pasar que:

- la orden ya esté persistida,
- el evento ya haya sido publicado,
- pero la notificación todavía no haya sido procesada.

Durante ese intervalo, el sistema está en un estado transitorio.

Eso no significa que esté roto.  
Significa que todavía no terminó de converger.

---

## Consistencia inmediata vs. consistencia eventual

### Consistencia inmediata

En un modelo ideal de consistencia inmediata, una vez que una operación termina, todos los lectores relevantes ven exactamente el mismo estado actualizado.

Ese modelo es cómodo, pero en microservicios no siempre es viable o deseable.

### Consistencia eventual

En consistencia eventual, distintos componentes pueden reflejar el cambio en momentos diferentes.

El objetivo no es que todo sea instantáneo, sino que el sistema:

- mantenga reglas de negocio importantes,
- evite estados imposibles permanentes,
- y termine convergiendo correctamente.

---

## Por qué no conviene forzar transacciones globales en todo

Una reacción común al ver este problema es querer “recuperar” el comportamiento del monolito mediante una gran transacción que abarque varios servicios.

En la práctica, eso suele traer más problemas que soluciones.

Intentar mantener una transacción distribuida fuerte entre múltiples servicios puede introducir:

- mayor acoplamiento,
- coordinación compleja,
- más puntos de falla,
- menor escalabilidad,
- mayor fragilidad operativa.

Por eso, en arquitecturas de microservicios, suele ser más razonable trabajar con:

- transacciones locales por servicio,
- eventos,
- compensaciones,
- idempotencia,
- reintentos,
- y diseño de estados intermedios.

---

## Qué tipo de estados transitorios pueden aparecer

En NovaMarket pueden existir situaciones como estas:

### Caso 1: la orden ya existe, pero la notificación todavía no
Esto puede ser totalmente aceptable.

### Caso 2: la orden fue creada, pero la reserva de stock todavía no se reflejó en otra vista
Puede ser aceptable si el sistema está diseñado para tolerarlo y converger correctamente.

### Caso 3: una proyección de lectura todavía muestra información vieja
También puede ser normal en un modelo distribuido.

La clave no es eliminar cualquier retraso, sino distinguir entre:

- **demoras aceptables**, y
- **inconsistencias de negocio inaceptables**.

---

## Qué cosas sí deben seguir protegidas

Aceptar consistencia eventual no significa renunciar al control.

Hay invariantes que igual deben cuidarse.

Por ejemplo:

- no registrar una orden en un estado imposible,
- no permitir que una compensación deje datos incoherentes,
- no procesar infinitamente el mismo evento sin control,
- no perder mensajes críticos sin detección,
- no generar efectos duplicados sin idempotencia.

La consistencia eventual es una estrategia de diseño, no una excusa para desordenar el sistema.

---

## El error conceptual más común

Un error frecuente es pensar:

**“Si hay consistencia eventual, entonces en algún momento los datos pueden estar mal.”**

La idea correcta es más precisa:

**“Durante un intervalo pueden existir vistas parciales o desfasadas, pero el sistema debe estar diseñado para converger hacia un estado válido.”**

Es decir:

- puede haber retraso,
- puede haber asincronía,
- puede haber estados intermedios,

pero no debería haber arbitrariedad.

---

## Cómo se relaciona con la experiencia de usuario

Este tema no es solo técnico.  
También afecta cómo se comunica el estado del sistema.

En NovaMarket, por ejemplo, tal vez no convenga mostrar que una operación “ya terminó por completo” si todavía hay pasos asincrónicos pendientes.

En algunos casos, el sistema puede reflejar estados intermedios como:

- `CREATED`
- `PENDING_CONFIRMATION`
- `PROCESSING`
- `NOTIFIED`

Eso ayuda a modelar mejor el negocio y evita promesas engañosas.

Muchas veces, la mejor forma de convivir con consistencia eventual no es ocultarla, sino **modelarla explícitamente**.

---

## Qué herramientas suelen acompañar este enfoque

La consistencia eventual suele ir de la mano con otros mecanismos que vamos a ver en el curso:

- mensajería asincrónica,
- idempotencia,
- reintentos,
- dead letter queues,
- outbox pattern,
- sagas,
- observabilidad para seguir procesos distribuidos.

No se trata de un concepto aislado.  
Es parte de una forma distinta de construir sistemas.

---

## Una versión didáctica del problema

Imaginemos este escenario en NovaMarket:

1. `order-service` crea una orden `#101`,
2. la responde al cliente como creada,
3. publica `OrderCreatedEvent`,
4. `notification-service` todavía no procesó el mensaje,
5. un panel interno consulta notificaciones y no ve nada aún.

Pregunta:

**¿Está mal el sistema?**

No necesariamente.

Puede estar perfectamente dentro del comportamiento esperado, siempre que:

- el evento no se haya perdido,
- el procesamiento siga pendiente,
- y el sistema tenga una forma confiable de terminar el flujo.

---

## Cuándo la consistencia eventual puede volverse un problema

Se vuelve problemática cuando el sistema no está preparado para manejarla.

Por ejemplo, si:

- no hay idempotencia,
- no hay reintentos razonables,
- no hay forma de detectar fallas,
- no se modelan estados intermedios,
- no se sabe qué pasó con una operación,
- o se asume falsamente que todo ya está sincronizado.

En esos casos, la inconsistencia temporal deja de ser una característica controlada y pasa a ser una fuente de errores difíciles de rastrear.

---

## Qué nos interesa aprender en el curso

En NovaMarket no vamos a tratar este tema solo como teoría.

Nos interesa que quede claro que:

- una orden puede crearse en un servicio,
- sus efectos pueden propagarse después,
- y esa propagación debe ser observable, confiable y coherente.

Eso prepara el terreno para dos temas muy importantes del módulo:

- **Outbox pattern**, para publicar eventos de manera más confiable,
- **Sagas**, para coordinar procesos distribuidos de varios pasos.

---

## Una idea práctica para llevarse

En microservicios, muchas veces la pregunta no es:

**“¿Cómo hago para que todo quede sincronizado en el mismo milisegundo?”**

La pregunta más útil es:

**“¿Qué retrasos puedo aceptar, qué invariantes no puedo romper y cómo diseño el sistema para converger correctamente?”**

Esa mirada es mucho más realista.

---

## Cierre

La consistencia eventual es una consecuencia natural de separar un sistema en componentes autónomos que colaboran entre sí.

No es un error de implementación ni una señal automática de mala arquitectura.  
Es un trade-off frecuente cuando se busca desacoplamiento, escalabilidad y evolución independiente.

En NovaMarket, este concepto aparece cuando una operación iniciada en un servicio necesita propagarse hacia otros componentes en momentos distintos. Entenderlo bien es fundamental para diseñar sistemas distribuidos que no solo funcionen, sino que también puedan operar de manera confiable.

En la próxima clase vamos a ver un patrón clave para reforzar esa confiabilidad: **Outbox pattern**.
