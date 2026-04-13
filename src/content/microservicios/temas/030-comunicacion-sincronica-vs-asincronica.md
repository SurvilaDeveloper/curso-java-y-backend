---
title: "Comunicación sincrónica vs. asincrónica"
description: "Diferencias entre comunicación sincrónica y asincrónica en microservicios, sus trade-offs y cómo aplicarlas en NovaMarket según el tipo de flujo de negocio."
order: 30
module: "Módulo 8 · Comunicación asincrónica"
level: "base"
draft: false
---

# Comunicación sincrónica vs. asincrónica

Hasta este punto del curso, en NovaMarket trabajamos sobre todo con comunicación **sincrónica**. Por ejemplo, cuando `order-service` necesita validar stock, realiza una llamada directa a `inventory-service` y espera una respuesta antes de continuar.

Ese modelo es natural, simple de entender y muy útil en muchos escenarios. Pero no alcanza para todos los casos.

A medida que una arquitectura distribuida crece, empiezan a aparecer necesidades que no encajan tan bien en una cadena de requests HTTP. Ahí entra la comunicación **asincrónica**.

En esta clase vamos a comparar ambos enfoques y a definir con claridad cuándo conviene cada uno dentro del proyecto del curso.

---

## Qué significa comunicación sincrónica

En comunicación sincrónica, un servicio invoca a otro y queda esperando la respuesta para poder continuar.

Es el caso típico de una llamada HTTP entre microservicios.

### Ejemplo en NovaMarket

Cuando un usuario crea una orden:

1. la request entra por `api-gateway`,
2. llega a `order-service`,
3. `order-service` consulta a `inventory-service`,
4. espera la respuesta,
5. decide si la orden puede crearse o no.

Mientras no llega la respuesta de inventario, el flujo no puede seguir.

---

## Qué significa comunicación asincrónica

En comunicación asincrónica, un servicio emite un mensaje o evento sin exigir que el otro servicio responda inmediatamente en la misma operación.

En vez de esperar una respuesta directa, el productor publica algo para que otro componente lo procese más tarde.

### Ejemplo en NovaMarket

Después de crear una orden, `order-service` podría publicar un evento como:

- `OrderCreatedEvent`

Ese evento puede ser consumido por `notification-service` para generar una notificación sin que el usuario tenga que esperar ese paso dentro de la request original.

---

## Primera diferencia importante: acoplamiento temporal

La comunicación sincrónica tiene más **acoplamiento temporal**.

Eso significa que ambos servicios necesitan estar disponibles al mismo tiempo para que la operación complete correctamente.

Si `order-service` llama a `inventory-service` y este último está caído, lento o saturado, el flujo entero se ve afectado.

En cambio, en un enfoque asincrónico, el productor puede publicar el mensaje y desacoplar el procesamiento. El consumidor lo atenderá cuando pueda, según la semántica del sistema y la infraestructura elegida.

---

## Segunda diferencia importante: experiencia de respuesta

En sincrónico, el usuario suele recibir una respuesta inmediata que refleja el resultado completo de la operación.

Eso es muy útil cuando el negocio necesita una confirmación en línea.

Por ejemplo:

- validar stock antes de aceptar una orden,
- autenticar un usuario,
- consultar el detalle de un producto,
- obtener un precio actualizado.

En asincrónico, en cambio, puede ocurrir que el usuario reciba una respuesta parcial o una confirmación de recepción, mientras otras tareas continúan en segundo plano.

Por ejemplo:

- crear una orden y disparar una notificación más tarde,
- registrar una auditoría,
- recalcular estadísticas,
- integrar con sistemas externos sin bloquear la request principal.

---

## Tercera diferencia: manejo de fallas

La comunicación sincrónica obliga a pensar mucho en:

- timeouts,
- retries,
- circuit breakers,
- degradación controlada,
- latencia acumulada.

Todo eso ya lo vimos en los módulos anteriores porque una llamada HTTP encadenada puede romper la experiencia completa del usuario.

La comunicación asincrónica no elimina las fallas, pero cambia el tipo de problema.

En lugar de depender de una respuesta inmediata, empiezan a importar cuestiones como:

- pérdida de mensajes,
- duplicados,
- reentregas,
- orden de procesamiento,
- idempotencia,
- colas saturadas,
- consumidores lentos.

O sea: no simplifica mágicamente el sistema. Cambia las reglas del juego.

---

## Cuándo conviene comunicación sincrónica

La comunicación sincrónica suele ser buena elección cuando:

- el servicio llamador necesita la respuesta para continuar,
- la operación forma parte del camino crítico de una request,
- el usuario espera un resultado inmediato,
- la consulta o validación tiene sentido en tiempo real,
- el acoplamiento temporal es aceptable para el caso.

### Casos claros en NovaMarket

Conviene sincrónico para:

- consultar catálogo,
- consultar detalle de un producto,
- validar stock antes de registrar una orden,
- leer el estado actual de una orden,
- autenticar y autorizar acceso a recursos.

---

## Cuándo conviene comunicación asincrónica

La comunicación asincrónica suele ser buena elección cuando:

- la tarea no necesita resolverse dentro de la misma request,
- el procesamiento puede continuar en segundo plano,
- conviene desacoplar productor y consumidor,
- hay procesos que podrían reintentarse luego,
- se quiere absorber picos de carga,
- el flujo de negocio tolera cierto retraso.

### Casos claros en NovaMarket

Conviene asincrónico para:

- enviar una notificación después de crear una orden,
- registrar auditoría,
- actualizar proyecciones o estadísticas,
- disparar integraciones secundarias,
- iniciar tareas que no deben bloquear al usuario.

---

## Un error común: pensar que asincrónico reemplaza siempre a sincrónico

No.

En una arquitectura real, lo normal no es elegir un único estilo para todo, sino combinar ambos.

Eso es justamente lo que vamos a hacer en NovaMarket.

### Parte sincrónica del flujo

Para crear una orden, `order-service` necesita saber si hay stock. Esa validación pertenece al flujo crítico y necesita una respuesta inmediata.

Entonces ahí tiene sentido seguir con una llamada sincrónica.

### Parte asincrónica del flujo

Una vez creada la orden, enviar una notificación no necesita bloquear la respuesta al usuario.

Entonces ahí tiene sentido publicar un evento y dejar que otro servicio procese la tarea después.

---

## NovaMarket como ejemplo de arquitectura híbrida

A partir de este módulo, NovaMarket va a evolucionar hacia una arquitectura **híbrida**.

Eso significa que va a combinar:

- llamadas REST entre servicios para validaciones y consultas inmediatas,
- mensajería asincrónica para procesos desacoplados.

### Flujo actualizado

1. el usuario autenticado crea una orden,
2. `order-service` valida stock con `inventory-service` en forma sincrónica,
3. si la validación es correcta, registra la orden,
4. luego publica un `OrderCreatedEvent`,
5. `notification-service` consume el evento y genera una notificación.

Con este cambio, el usuario recibe respuesta cuando la orden queda registrada, sin esperar todo el trabajo posterior.

---

## Ventajas de la comunicación sincrónica

- modelo simple de entender,
- request y response claros,
- feedback inmediato,
- buena opción para validaciones online,
- fácil de probar en escenarios básicos.

## Costos de la comunicación sincrónica

- mayor acoplamiento temporal,
- sensibilidad a la latencia,
- dependencia directa entre servicios,
- más riesgo de cascada de fallos,
- acumulación de tiempos cuando hay varias llamadas encadenadas.

---

## Ventajas de la comunicación asincrónica

- mayor desacoplamiento entre productor y consumidor,
- mejor capacidad para absorber picos,
- posibilidad de procesar en segundo plano,
- integración más flexible entre servicios,
- reducción del trabajo dentro de la request principal.

## Costos de la comunicación asincrónica

- mayor complejidad operativa,
- debugging menos directo,
- necesidad de idempotencia,
- posibilidad de reentregas y duplicados,
- consistencia no necesariamente inmediata,
- monitoreo más exigente.

---

## Qué preguntas conviene hacerse antes de elegir

Cuando diseñes un flujo, estas preguntas ayudan mucho:

### 1. ¿La operación necesita una respuesta inmediata?
Si sí, probablemente necesites comunicación sincrónica.

### 2. ¿La tarea forma parte del camino crítico del negocio?
Si sí, lo normal es que no quieras patearla a segundo plano sin una razón clara.

### 3. ¿El consumidor necesita estar disponible en el mismo momento?
Si no, la asincronía puede darte más desacoplamiento.

### 4. ¿El sistema tolera consistencia eventual?
Si sí, hay más espacio para eventos y colas.

### 5. ¿Un reintento posterior sería aceptable?
Si sí, la mensajería gana mucho valor.

---

## Qué vamos a hacer a partir de ahora

En las próximas clases vamos a incorporar mensajería asincrónica a NovaMarket usando **RabbitMQ**.

No lo vamos a hacer como una demo aislada, sino sobre un problema concreto del proyecto:

**desacoplar el procesamiento posterior a la creación de una orden**.

Primero vamos a introducir el broker y los conceptos de colas, exchanges y routing keys. Después vamos a integrarlo con Spring Boot y a publicar nuestro primer evento del dominio.

---

## Cierre

La comunicación sincrónica y la asincrónica no compiten como si una fuera siempre mejor que la otra.

Cada una resuelve necesidades distintas.

La comunicación sincrónica es ideal cuando el flujo necesita una respuesta inmediata y el resultado forma parte directa de la operación actual. La comunicación asincrónica es especialmente valiosa cuando conviene desacoplar procesos, absorber carga y continuar tareas fuera del request principal.

En NovaMarket vamos a usar ambas, porque eso refleja mejor cómo se construye un sistema distribuido real.

En la próxima clase vamos a introducir RabbitMQ y a ver cómo encaja como broker de mensajes dentro de la arquitectura del proyecto.
