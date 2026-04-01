---
title: "Eventos internos del dominio y comunicación entre módulos"
description: "Cómo pensar eventos internos del dominio para que distintas partes del backend puedan reaccionar a cambios relevantes sin quedar acopladas de forma rígida, y por qué esto ayuda a diseñar sistemas más expresivos y evolutivos."
order: 96
module: "Arquitectura y organización del backend"
level: "intermedio"
draft: false
---

## Introducción

Cuando un backend empieza a crecer y a organizarse mejor por módulos, aparece una pregunta importante:

**¿cómo se enteran otras partes del sistema de que ocurrió algo relevante?**

Por ejemplo:

- se creó una orden
- se confirmó un pago
- se canceló una compra
- se registró un usuario
- se aprobó un documento
- se agotó un stock
- se venció una reserva
- se generó una devolución

En sistemas chicos, muchas veces la respuesta es simple:

- un service llama directamente a otro
- y después a otro
- y después a otro más

Eso puede funcionar durante un tiempo.

Pero cuando el sistema crece, esa forma de encadenar todo de manera rígida empieza a generar problemas como:

- demasiado acoplamiento
- cascadas difíciles de seguir
- módulos que conocen demasiado entre sí
- dificultad para agregar nuevos comportamientos
- lógica secundaria mezclada con la principal
- miedo a tocar un flujo porque impacta en demasiadas partes

Ahí aparece una idea muy valiosa:

**los eventos internos del dominio.**

## Qué es un evento interno del dominio

Un evento interno del dominio es una forma de representar que dentro del sistema ocurrió algo relevante desde el punto de vista del negocio o del dominio.

Por ejemplo:

- `OrderCreated`
- `PaymentConfirmed`
- `OrderCancelled`
- `UserRegistered`
- `StockReserved`
- `RefundRequested`

La idea no es solo “mandar un mensaje”.
La idea es expresar algo que **ya pasó** y que puede ser importante para otras partes del sistema.

## Por qué esto importa tanto

Porque no todo comportamiento que ocurre después de una acción principal pertenece necesariamente al mismo módulo o a la misma responsabilidad directa.

Por ejemplo, después de confirmar un pago, podrían pasar varias cosas:

- actualizar el estado de una orden
- registrar auditoría
- disparar una notificación
- generar una factura
- actualizar métricas
- iniciar preparación de envío
- alimentar una vista administrativa

Si todo eso queda atado a llamadas directas y rígidas, el sistema se vuelve más difícil de evolucionar.

Los eventos ayudan a decir:

**“pasó esto”**  
y luego otras partes pueden reaccionar con más independencia.

## Evento no es lo mismo que comando

Esta distinción es muy importante.

### Comando

Expresa intención de que algo ocurra.

Por ejemplo:

- confirmar pago
- cancelar orden
- generar factura

### Evento

Expresa que algo ya ocurrió.

Por ejemplo:

- pago confirmado
- orden cancelada
- factura generada

El comando pide una acción.
El evento comunica un hecho.

Entender esto ayuda mucho a diseñar mejor.

## Ejemplo intuitivo

Supongamos este flujo:

1. se crea una orden
2. el sistema registra exitosamente la orden

A partir de ahí, otras partes podrían necesitar enterarse para:

- enviar una notificación
- registrar analytics
- iniciar una validación secundaria
- actualizar una proyección
- generar una tarea en background

En vez de que el módulo de órdenes llame directamente a todo eso uno por uno, podría emitirse algo como:

- `OrderCreated`

Y luego otras partes reaccionan.

## Qué problema intenta resolver

No intenta “hacer el sistema más sofisticado porque sí”.

Intenta resolver problemas muy concretos como:

- reducir acoplamiento directo entre módulos
- separar acción principal de reacciones secundarias
- hacer más claro qué ocurrió en el dominio
- facilitar extensión de comportamiento
- evitar que un módulo tenga que conocer demasiado de otros
- volver el flujo más expresivo

## Cuándo esta idea empieza a ser útil

Empieza a ser especialmente útil cuando:

- un mismo hecho del dominio interesa a varias partes
- querés evitar llamadas rígidas en cadena
- tenés módulos relativamente separados
- necesitás agregar nuevas reacciones con frecuencia
- querés desacoplar la lógica principal de efectos derivados
- el sistema empieza a crecer en complejidad interna

## Ejemplo con órdenes

Imaginemos que se confirma una orden.

Ese hecho podría interesarle a varios módulos o componentes:

- notificaciones
- auditoría
- fulfillment
- facturación
- métricas
- integraciones

Si el módulo de órdenes tiene que llamar explícitamente a todos ellos, queda muy cargado y acoplado.

En cambio, si puede expresar algo como:

- `OrderConfirmed`

otras partes pueden reaccionar con más independencia.

## Comunicación entre módulos

Este tema conecta directamente con la organización modular del backend.

Cuando existen módulos como:

- órdenes
- pagos
- envíos
- notificaciones
- promociones
- auditoría

aparece una tensión natural:

- los módulos necesitan colaborar
- pero no conviene que se conozcan demasiado por dentro

Los eventos internos pueden ser una forma más sana de comunicación cuando lo que importa es que otro módulo se entere de un hecho, no que intervenga directamente en la decisión original.

## Qué significa “interno”

Acá hablamos de eventos **internos** del sistema.

No necesariamente estamos hablando de:

- Kafka
- RabbitMQ
- brokers distribuidos
- eventos públicos para terceros

Puede ser algo completamente interno a la aplicación.

La idea conceptual es útil incluso dentro de un monolito modular.

Es decir:

- no hace falta una arquitectura distribuida para pensar con eventos
- también pueden servir dentro del mismo backend

## Evento no significa asincronía obligatoria

Otro punto importante.

Un evento interno del dominio no significa automáticamente:

- cola
- proceso separado
- ejecución posterior
- infraestructura compleja

Puede ser:

- síncrono
- asincrónico
- en memoria
- diferido
- persistido
- procesado luego

Lo importante, en esta etapa, es entender la idea de **desacoplar la comunicación del hecho**, no atarse a una tecnología específica.

## Hecho relevante, no ruido técnico

No todo debería convertirse en evento.

Conviene que un evento represente algo con significado de dominio.

Por ejemplo:

- `PaymentConfirmed`
- `OrderCancelled`
- `UserRegistered`

suelen comunicar mejor que cosas demasiado técnicas o accidentales como:

- `RowInserted`
- `FieldUpdated`
- `ServiceCalled`

La idea es que el evento diga algo que el negocio o el sistema pueda entender como un hecho relevante.

## Beneficios principales

## 1. Menor acoplamiento directo

Un módulo no necesita conocer íntimamente a todos los demás.

## 2. Más expresividad

El sistema comunica mejor qué pasó.

## 3. Más facilidad para agregar reacciones nuevas

Podés sumar comportamientos sin reescribir tanto la parte original.

## 4. Mejor separación entre flujo principal y efectos derivados

No todo queda mezclado en el mismo método.

## 5. Más alineación con módulos y contexto

Cada área puede reaccionar a hechos relevantes sin invadir tanto a otra.

## Qué cosas suelen reaccionar a eventos

Por ejemplo:

- notificaciones
- auditoría
- actualización de proyecciones o vistas
- métricas
- integraciones externas
- tareas secundarias
- limpieza o compensaciones
- preparación de procesos posteriores

Muchas de estas reacciones no son la esencia del caso de uso principal, pero sí importan.

## Ejemplo con registro de usuario

Supongamos el caso de registrar un usuario.

El hecho principal puede ser:

- el usuario quedó registrado correctamente

Luego podrían reaccionar otras partes para:

- enviar email de bienvenida
- registrar analytics
- crear configuración inicial
- auditar alta
- iniciar onboarding

No todo eso debería necesariamente estar pegado de forma rígida al mismo bloque central de lógica.

## Eventos y caso de uso principal

Esto también es importante:

el evento no reemplaza al caso de uso principal.

Primero hay una acción o decisión principal:

- crear orden
- confirmar pago
- registrar usuario

Luego, como consecuencia, puede surgir un hecho que otras partes observen.

Es decir:

- el caso de uso sigue existiendo
- el evento comunica una consecuencia relevante

## Cuándo conviene una llamada directa en vez de evento

No todo merece volverse event-driven internamente.

A veces conviene llamada directa si:

- la dependencia es realmente central al flujo
- sin esa otra parte la operación no tiene sentido
- no es una reacción secundaria sino parte esencial de la misma acción
- la separación vía evento solo agrega complejidad

Por ejemplo, si un caso de uso necesita una validación crítica para decidir si puede continuar, eso no suele ser “reaccionar a un evento”.
Es parte del flujo principal.

## Eventos para efectos secundarios o derivados

Suelen ser más útiles cuando la acción principal ya ocurrió o quedó definida, y otras cosas pueden reaccionar después sin formar parte del núcleo duro de la decisión.

Por ejemplo:

- enviar notificación
- auditar
- actualizar vista
- disparar exportación
- iniciar un proceso derivado

Ahí el patrón suele encajar muy bien.

## Riesgo de abuso

Como toda idea útil, también puede usarse mal.

Algunos riesgos:

- emitir eventos por cualquier mínima cosa
- volver opaco el flujo
- no saber quién reacciona a qué
- esconder demasiado comportamiento detrás de reacciones implícitas
- transformar el sistema en algo difícil de seguir
- usar eventos donde una llamada clara y directa era mejor

La clave no es “todo por eventos”.
La clave es usar eventos donde agregan claridad y desacople reales.

## Visibilidad del flujo

Cuando usás eventos internos, es importante no perder la capacidad de entender el sistema.

Tiene que seguir siendo posible responder:

- qué hecho ocurrió
- quién lo emitió
- quién reacciona
- qué reacciones son críticas
- cuáles son secundarias
- si el procesamiento fue síncrono o no
- qué pasa si una reacción falla

Si todo esto queda oculto, el diseño puede empeorar.

## Eventos y consistencia

Otra pregunta importante es:

**si una reacción a un evento falla, qué significa eso para el flujo principal?**

No todas las reacciones tienen el mismo peso.

Por ejemplo:

- fallar en analytics quizá no debería romper la creación de una orden
- fallar en auditoría puede ser importante pero tratable
- fallar en una acción crítica quizá requiera otra estrategia

Esto conecta con la distinción entre:

- flujo principal
- reacciones derivadas
- trabajo crítico
- trabajo secundario

## Eventos y modularidad

Los eventos internos encajan muy bien con un monolito modular porque permiten una comunicación más expresiva entre partes del sistema sin forzar tanto acoplamiento directo.

Por ejemplo:

- pagos puede emitir `PaymentConfirmed`
- órdenes puede reaccionar y actualizar su estado
- notificaciones puede enviar un mensaje
- auditoría puede registrar el hecho

Todo eso sin que pagos tenga que conocer los detalles internos de cada módulo.

## Eventos y observabilidad

Cuando un sistema usa eventos internos, también importa poder observar:

- qué eventos se emitieron
- cuándo
- por qué entidad o referencia
- qué handlers o reacciones corrieron
- qué falló
- qué quedó pendiente
- qué reacción era crítica o secundaria

La observabilidad sigue siendo clave para no perder comprensión del sistema.

## Eventos y evolución futura

Pensar así también prepara terreno para temas más avanzados.

Por ejemplo:

- eventos internos más estructurados
- integración entre módulos
- eventos persistidos
- arquitectura orientada a eventos
- eventual separación de módulos
- publicación hacia sistemas externos

No hace falta llegar ahí todavía.
Pero este tema abre una forma de pensar muy valiosa.

## Qué errores comunes aparecen

Algunos frecuentes son:

- usar eventos para todo indiscriminadamente
- emitir eventos demasiado técnicos y poco significativos
- ocultar demasiado flujo importante
- no distinguir lo principal de lo derivado
- no saber qué módulo reacciona a qué
- mezclar evento interno con integración externa sin claridad
- crear un sistema “mágico” difícil de seguir
- usar eventos solo por moda

## Buenas prácticas iniciales

## 1. Emitir eventos para hechos de dominio realmente significativos

No para cualquier detalle técnico menor.

## 2. Diferenciar bien comando de evento

Uno pide acción, el otro comunica un hecho ocurrido.

## 3. Usar eventos donde ayuden a desacoplar reacciones secundarias o derivadas

No para esconder dependencias centrales del flujo.

## 4. Mantener claridad sobre quién emite y quién reacciona

La modularidad no debería volver opaco el sistema.

## 5. Dar nombres que expresen hechos del dominio

Eso mejora mucho la legibilidad.

## 6. Pensar qué pasa si una reacción falla

No todas las reacciones pesan igual.

## 7. No usar eventos como excusa para no diseñar bien límites y responsabilidades

Los eventos ayudan, pero no resuelven todo solos.

## Errores comunes

### 1. Convertir cualquier cambio técnico en un “evento”

Eso mete ruido y baja expresividad.

### 2. Reemplazar llamadas claras por eventos donde la dependencia era realmente directa

A veces complica sin aportar valor.

### 3. No saber qué módulos reaccionan a qué

Eso vuelve muy difícil mantener el sistema.

### 4. Hacer que demasiado comportamiento quede implícito

El flujo se vuelve opaco.

### 5. No observar los eventos ni sus reacciones

Después investigar problemas cuesta más.

### 6. Pensar que usar eventos automáticamente hace al sistema “más avanzado”

La calidad depende del criterio, no del nombre del patrón.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué hechos relevantes ocurren hoy en tu sistema que podrían expresarse como eventos internos?
2. ¿qué reacciones secundarias hoy están demasiado pegadas al flujo principal?
3. ¿qué módulo podría enterarse de algo sin necesidad de quedar acoplado directamente?
4. ¿qué caso actual en tu proyecto sería mejor con una llamada directa y no con evento?
5. ¿cómo nombrarías un evento importante de órdenes, pagos o usuarios en tu sistema?

## Resumen

En esta lección viste que:

- un evento interno del dominio expresa que ocurrió un hecho relevante dentro del sistema
- los eventos pueden ayudar a desacoplar módulos y separar mejor el flujo principal de reacciones derivadas
- no todo debería convertirse en evento: conviene usarlos cuando agregan claridad y desacople reales
- distinguir comandos de eventos ayuda mucho a diseñar mejor
- esta idea puede ser muy valiosa incluso dentro de un monolito modular, sin necesidad de infraestructura distribuida
- la clave sigue siendo mantener visibilidad, criterio y comprensión del flujo general del sistema

## Siguiente tema

Ahora que ya entendés cómo usar eventos internos del dominio para comunicar hechos relevantes entre módulos sin acoplar demasiado el backend, el siguiente paso natural es aprender sobre **orquestación, coordinación y límites entre módulos**, porque a medida que el sistema crece, también se vuelve importante decidir quién coordina una acción, quién reacciona y quién no debería saber demasiado del resto.
