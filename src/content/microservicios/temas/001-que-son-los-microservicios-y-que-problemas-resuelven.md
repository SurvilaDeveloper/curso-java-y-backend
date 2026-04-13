---
title: "¿Qué son los microservicios y qué problemas resuelven?"
description: "Introducción a la arquitectura de microservicios, sus objetivos, los problemas que intenta resolver y los costos reales que incorpora frente a un monolito."
order: 1
module: "Módulo 1 · Fundamentos y arquitectura base"
level: "intro"
draft: false
---

# ¿Qué son los microservicios y qué problemas resuelven?

Los microservicios son un estilo de arquitectura en el que una aplicación se divide en varios servicios pequeños, autónomos y especializados, donde cada uno se enfoca en una capacidad concreta del negocio.

En lugar de construir todo el sistema como una única aplicación grande, se separan responsabilidades en piezas independientes que colaboran entre sí a través de la red.

En este curso no vamos a estudiar los microservicios como una idea abstracta ni como una colección de herramientas sueltas. Vamos a construir un sistema llamado **NovaMarket**, una plataforma de pedidos simple, para entender por qué aparece cada problema y por qué ciertas herramientas terminan siendo necesarias.

---

## La idea central detrás de los microservicios

La idea no es “partir por partir”.

La idea es que el sistema pueda evolucionar mejor cuando las responsabilidades están claramente separadas.

Por ejemplo, en NovaMarket vamos a tener servicios con objetivos distintos:

- un servicio para exponer el catálogo,
- un servicio para manejar inventario,
- un servicio para registrar órdenes,
- un gateway como punto de entrada,
- y más adelante servicios de soporte e infraestructura.

Cada servicio tendrá una responsabilidad concreta, un conjunto de datos propio o cercano a su responsabilidad, y una forma de interactuar con otros servicios sin depender de que todo viva dentro del mismo proceso.

---

## Qué problemas intentan resolver

Los microservicios no nacen porque sí. Aparecen como respuesta a ciertos problemas que suelen crecer en aplicaciones grandes.

### 1. Exceso de acoplamiento en una aplicación única

Cuando todo vive dentro del mismo proyecto, distintos módulos empiezan a depender entre sí de forma cada vez más fuerte.

Con el tiempo aparecen síntomas como estos:

- cambios pequeños que rompen partes lejanas del sistema,
- dificultad para entender el impacto de una modificación,
- dependencias circulares o muy difíciles de desarmar,
- equipos que se pisan al trabajar sobre la misma base.

Separar capacidades en servicios ayuda a poner límites más claros.

---

### 2. Dificultad para escalar distintas partes del sistema

No siempre todas las partes de una aplicación reciben la misma carga.

Por ejemplo:

- el catálogo puede recibir muchas consultas,
- el inventario puede tener menos tráfico,
- las notificaciones pueden procesarse en segundo plano,
- la creación de órdenes puede necesitar más cuidado que volumen.

En una arquitectura distribuida, cada servicio puede crecer de forma más específica según su necesidad.

---

### 3. Despliegues más riesgosos

En aplicaciones grandes, a veces un cambio pequeño obliga a volver a desplegar todo.

Eso trae varios problemas:

- más riesgo en cada release,
- más tiempo de build,
- más impacto si algo sale mal,
- menos independencia entre equipos o módulos.

Con servicios separados, el ideal es que una parte del sistema pueda cambiar sin arrastrar innecesariamente a las demás.

---

### 4. Mezcla de responsabilidades técnicas y funcionales

Con el tiempo, una aplicación puede terminar mezclando:

- lógica de negocio,
- autenticación,
- integración con otros sistemas,
- notificaciones,
- acceso a datos,
- configuración,
- observabilidad,
- manejo de errores distribuidos.

Los microservicios no eliminan la complejidad, pero obligan a pensar mejor dónde vive cada responsabilidad.

---

## Qué no resuelven por sí solos

Acá aparece una de las ideas más importantes del curso:

**los microservicios no simplifican automáticamente un sistema**.

De hecho, en muchos casos lo vuelven más complejo.

Dividir una aplicación en servicios no hace desaparecer la complejidad. Lo que hace es **mover parte de esa complejidad al nivel de la arquitectura distribuida**.

Eso significa que empiezan a aparecer problemas nuevos:

- comunicación por red,
- timeouts,
- latencia,
- descubrimiento de servicios,
- seguridad distribuida,
- trazas entre servicios,
- fallas parciales,
- consistencia eventual,
- reintentos,
- mensajería,
- despliegue coordinado.

Por eso un curso serio de microservicios no puede quedarse solo en “crear varios proyectos Spring Boot”. Tiene que enseñar también todo lo que aparece cuando esos proyectos necesitan convivir de verdad.

---

## Monolito vs. microservicios

Una comparación simple ayuda a ubicar la idea.

### Monolito

En una arquitectura monolítica, toda la aplicación vive en una única unidad desplegable.

Eso no significa que todo esté desordenado. Un monolito puede estar bien modularizado.  
Pero sigue ejecutándose como una sola aplicación.

### Microservicios

En una arquitectura de microservicios, el sistema se divide en varias aplicaciones o servicios desplegables por separado, que colaboran entre sí a través de HTTP, mensajería u otros mecanismos.

La diferencia importante no es solo “cantidad de proyectos”, sino **el nivel de autonomía y distribución**.

---

## Cuándo puede tener sentido usar microservicios

Los microservicios empiezan a tener sentido cuando el sistema necesita alguna combinación de estas cosas:

- separación clara de dominios o capacidades,
- evolución independiente de distintas partes,
- necesidad de escalar componentes de forma distinta,
- despliegues más desacoplados,
- equipos trabajando sobre áreas separadas,
- integración con distintas tecnologías o ritmos de cambio.

No hace falta que todas estén presentes al mismo tiempo, pero sí tiene que existir una razón real.

---

## Cuándo no conviene apurarse

No todo sistema necesita microservicios.

Muchas veces conviene empezar con:

- un monolito bien diseñado,
- módulos claros,
- límites internos saludables,
- y una arquitectura fácil de entender y desplegar.

Pasar a microservicios demasiado pronto puede introducir costos innecesarios:

- más infraestructura,
- más dificultad para debuggear,
- más tiempo de configuración,
- más complejidad en seguridad,
- más esfuerzo de testing,
- más superficie de error.

En otras palabras:

**si el sistema todavía no tiene un problema real de distribución, dividirlo prematuramente puede empeorarlo**.

---

## Qué vamos a construir en este curso

Para aprender con un hilo conductor claro, el curso se va a apoyar en un proyecto llamado **NovaMarket**.

NovaMarket es una plataforma simple de pedidos donde un usuario autenticado puede:

- consultar productos,
- crear una orden,
- validar disponibilidad de stock,
- registrar la operación,
- disparar eventos,
- y observar el recorrido completo entre servicios.

Nuestro flujo principal será:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Ese flujo va a servir como columna vertebral de casi todo el curso.

---

## Por qué este proyecto es bueno para aprender microservicios

Porque obliga a trabajar con problemas reales de arquitectura distribuida.

A medida que NovaMarket crezca, van a aparecer necesidades concretas:

- externalizar configuración,
- registrar y descubrir servicios,
- dejar de usar URLs hardcodeadas,
- centralizar el acceso con un gateway,
- proteger endpoints con tokens,
- tolerar fallas entre servicios,
- seguir requests entre varios componentes,
- desacoplar procesos con mensajería,
- levantar todo el sistema con Docker.

Eso hace que cada herramienta aparezca por una necesidad del sistema, no como un tema aislado.

---

## Una primera foto de la arquitectura

Más adelante la vamos a construir paso a paso, pero desde ahora conviene tener una visión general.

NovaMarket va a girar alrededor de estos componentes principales:

- **catalog-service**: expone el catálogo de productos,
- **inventory-service**: administra disponibilidad y stock,
- **order-service**: recibe y registra órdenes,
- **api-gateway**: punto de entrada único al sistema,
- **config-server**: centraliza configuración,
- **discovery-server**: permite descubrir servicios,
- **notification-service**: consume eventos y genera notificaciones,
- **Keycloak**: proveedor de identidad para autenticación y autorización.

No vamos a empezar construyendo todo junto.  
Vamos a avanzar de forma progresiva, manteniendo siempre el mismo sistema como referencia.

---

## La principal dificultad de una arquitectura distribuida

Cuando todo está dentro de una sola aplicación, una llamada interna suele ser simplemente una invocación en memoria.

En cambio, cuando una operación depende de otro servicio:

- la red puede fallar,
- el servicio puede responder lento,
- una instancia puede caerse,
- puede haber varias instancias,
- puede haber datos desactualizados,
- puede fallar un paso y no otro.

Eso cambia por completo la forma de diseñar, probar y operar el sistema.

Por eso en este curso no vamos a estudiar solamente el “camino feliz”, sino también los problemas reales que aparecen entre servicios.

---

## Qué capacidades vamos a incorporar a lo largo del curso

Durante el recorrido de NovaMarket vamos a incorporar, entre otras, estas capacidades:

- configuración centralizada,
- service discovery,
- comunicación REST declarativa,
- balanceo de carga,
- API Gateway,
- seguridad con OAuth2 y JWT,
- circuit breaker y retry,
- métricas y trazas,
- mensajería asincrónica con RabbitMQ,
- idempotencia y consistencia eventual,
- testing distribuido,
- Docker Compose para levantar el sistema completo.

Esta lista ya muestra algo importante: trabajar con microservicios no es solo dividir código. Es construir un sistema distribuido capaz de operar con cierto nivel de robustez.

---

## Una idea clave para llevarse desde esta primera clase

La pregunta correcta no es:

**“¿Cómo hago varios microservicios?”**

La pregunta correcta es:

**“¿Qué problemas reales aparecen cuando un sistema se distribuye, y cómo diseño una arquitectura que los soporte?”**

Ese enfoque es el que va a guiar todo el curso.

---

## Cierre

Los microservicios son una forma de organizar sistemas complejos a través de servicios especializados y autónomos, pero esa autonomía tiene un costo técnico importante.

No son una solución mágica ni una mejora automática frente a un monolito. Tienen sentido cuando resuelven problemas concretos y cuando se diseñan con cuidado.

En este curso vamos a trabajar sobre **NovaMarket** para aprender microservicios de forma práctica, incremental y coherente, construyendo un sistema que nos permita ver tanto sus ventajas como sus desafíos reales.

En la próxima clase vamos a profundizar en cómo pensar los límites de los servicios y cómo evitar una división arbitraria del sistema.
