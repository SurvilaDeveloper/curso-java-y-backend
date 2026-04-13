---
title: "Diseño de microservicios y límites de servicio"
description: "Cómo pensar la división de un sistema en microservicios, qué significa definir límites saludables y qué errores evitar al separar responsabilidades dentro de una arquitectura distribuida."
order: 2
module: "Módulo 1 · Fundamentos y arquitectura base"
level: "intro"
draft: false
---

# Diseño de microservicios y límites de servicio

En la clase anterior vimos que los microservicios no son simplemente “muchos proyectos pequeños”, sino una forma de organizar un sistema distribuido alrededor de responsabilidades bien definidas.

Ahora aparece una de las preguntas más importantes de todo el curso:

**¿cómo decidir dónde empieza y dónde termina cada servicio?**

Esa pregunta es clave porque una mala división puede hacer que una arquitectura de microservicios sea más difícil de mantener que un monolito mal diseñado.

En esta clase vamos a trabajar esa idea usando como referencia a **NovaMarket**, el sistema del curso, para entender cómo definir límites razonables y qué errores conviene evitar desde el principio.

---

## Por qué definir bien los límites es tan importante

Cuando un sistema se divide en servicios, cada frontera introduce una separación técnica y funcional.

Eso significa que entre dos servicios ya no hay una simple llamada interna dentro del mismo código. Ahora hay:

- una llamada por red,
- latencia,
- posibles timeouts,
- contratos HTTP o eventos,
- problemas de versionado,
- fallas parciales,
- y responsabilidades que deben mantenerse separadas con cierta disciplina.

Por eso, crear un nuevo microservicio no es gratis.

Cada servicio agrega autonomía, pero también agrega complejidad operativa.

Si los límites están mal elegidos, el sistema empieza a sufrir síntomas como estos:

- demasiadas llamadas entre servicios para completar una operación simple,
- responsabilidades mezcladas,
- duplicación de lógica,
- dependencia excesiva entre servicios,
- cambios que obligan a tocar varios componentes a la vez,
- dificultad para entender quién es dueño de cada dato o decisión.

En otras palabras: una arquitectura distribuida mal partida puede terminar generando más fricción que claridad.

---

## Qué significa definir un límite de servicio

Definir un límite significa decidir qué responsabilidad de negocio le pertenece a un servicio y qué cosas quedan afuera.

Un servicio bien delimitado debería tener:

- un propósito claro,
- una responsabilidad principal reconocible,
- reglas de negocio coherentes con esa responsabilidad,
- control sobre los datos que necesita administrar,
- y una interfaz de comunicación razonable hacia el resto del sistema.

No se trata solo de elegir nombres lindos.

Se trata de responder preguntas como estas:

- ¿qué hace este servicio?
- ¿qué no hace?
- ¿de qué datos es dueño?
- ¿qué decisiones toma por sí mismo?
- ¿qué necesita pedirle a otros?
- ¿qué cambios deberían quedar encapsulados dentro de él?

Cuanto más claras estén esas respuestas, más saludable suele ser la separación.

---

## La idea de responsabilidad principal

Una forma práctica de pensar un servicio es preguntarse:

**¿cuál es su responsabilidad principal dentro del sistema?**

Por ejemplo, en NovaMarket:

- `catalog-service` existe para exponer productos,
- `inventory-service` existe para administrar stock,
- `order-service` existe para registrar y consultar órdenes,
- `notification-service` existe para procesar notificaciones derivadas de eventos.

Cada uno tiene una responsabilidad distinta.

Eso no significa que dentro del servicio solo pueda existir una única clase o una única tabla. Significa que todo lo que vive ahí debería girar alrededor de una misma capacidad de negocio.

---

## Qué señales suelen indicar un buen límite

No existe una regla mágica que siempre funcione, pero sí hay señales que suelen ayudar.

### 1. Coherencia funcional

Las reglas que viven dentro del servicio se sienten relacionadas entre sí.

Por ejemplo, en `inventory-service` tiene sentido que vivan decisiones relacionadas con:

- disponibilidad,
- cantidad disponible,
- reserva de stock,
- liberación de stock,
- validaciones de existencia para una orden.

Todo eso gira alrededor del mismo problema.

---

### 2. Propiedad clara sobre los datos

Un servicio saludable suele ser dueño de sus propios datos o, al menos, de una parte del modelo cuya responsabilidad es clara.

Por ejemplo:

- el catálogo administra sus productos,
- el inventario administra cantidades disponibles,
- las órdenes administran su ciclo de vida,
- las notificaciones administran sus registros o estados de envío.

Eso evita que varios servicios compitan por modificar la misma información sin una frontera definida.

---

### 3. Bajo acoplamiento con otros servicios

Un servicio no debería necesitar preguntar demasiadas cosas externas para poder hacer casi cualquier tarea.

Que existan dependencias es normal. El problema aparece cuando una sola operación requiere conversar con demasiados componentes para completar algo básico.

Si cada paso depende de múltiples servicios, es probable que el límite no esté del todo bien pensado o que la responsabilidad esté demasiado fragmentada.

---

### 4. Alta cohesión interna

Las piezas internas del servicio deberían sentirse relacionadas entre sí.

Si dentro de un mismo servicio conviven responsabilidades totalmente distintas, suele ser una señal de que el límite es demasiado amplio.

Por ejemplo, mezclar en el mismo servicio:

- productos,
- inventario,
- órdenes,
- autenticación,
- y notificaciones,

puede funcionar al principio como monolito, pero no sería una buena separación si el objetivo es construir varios microservicios con responsabilidades claras.

---

## Qué errores comunes conviene evitar

### Error 1. Dividir por capas técnicas en lugar de dividir por capacidades

Un error frecuente es separar servicios como si fueran capas del mismo sistema:

- servicio de controladores,
- servicio de repositorios,
- servicio de validaciones,
- servicio de utilidades,
- servicio de seguridad compartida para todo.

Eso no crea microservicios saludables. Solo distribuye piezas técnicas sin respetar límites de negocio.

Los servicios deberían separarse por capacidades o dominios funcionales, no por carpetas conceptuales de una arquitectura en capas.

---

### Error 2. Crear microservicios demasiado pequeños

A veces se piensa que “más pequeño” siempre es mejor.

No es así.

Si cada detalle se convierte en un servicio distinto, aparecen problemas rápidamente:

- exceso de llamadas remotas,
- más infraestructura,
- más puntos de falla,
- más contratos que mantener,
- más complejidad para desplegar,
- más dificultad para seguir el flujo de negocio.

Un microservicio no tiene que ser microscópico. Tiene que tener un límite razonable.

---

### Error 3. Separar sin una necesidad real

A veces se parte un sistema porque “suena más profesional” o porque la arquitectura distribuida parece más moderna.

Pero si la separación no responde a un problema real, puede terminar siendo solo complejidad extra.

Antes de separar conviene preguntarse:

- ¿esta frontera nos da claridad?
- ¿encapsula una responsabilidad reconocible?
- ¿permite evolucionar una parte sin romper otra?
- ¿o solo estamos multiplicando proyectos sin ganar nada?

---

### Error 4. Compartir base de datos entre varios servicios sin control

En una arquitectura de microservicios, compartir libremente la misma base entre varios servicios erosiona la autonomía.

Si varios servicios escriben directamente sobre las mismas tablas:

- se diluye la propiedad de los datos,
- aumentan los acoplamientos invisibles,
- se vuelve más difícil cambiar estructuras,
- aparecen dependencias técnicas difíciles de rastrear.

Eso no significa que toda separación de datos deba resolverse de inmediato en la primera clase del curso, pero sí que la idea de “cada servicio dueño de su información” es una referencia importante.

---

### Error 5. Usar nombres de servicios demasiado vagos

Nombres como estos suelen ser señales de diseño poco claro:

- `common-service`
- `general-service`
- `core-service`
- `helper-service`
- `utils-service`

Esos nombres no describen una capacidad de negocio concreta.

En cambio, nombres como `order-service`, `inventory-service` o `catalog-service` comunican mejor qué responsabilidad tiene cada uno.

---

## Cómo se aplica esto en NovaMarket

NovaMarket va a usar un caso de uso central muy claro:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Ese flujo nos ayuda a pensar los límites.

### `catalog-service`

Responsabilidad principal:
exponer productos para consulta.

No debería encargarse de:

- validar stock en tiempo real,
- registrar órdenes,
- autenticar usuarios,
- enviar notificaciones.

Su foco es el catálogo.

---

### `inventory-service`

Responsabilidad principal:
administrar disponibilidad de productos.

No debería encargarse de:

- calcular totales de una orden,
- registrar el historial completo de pedidos,
- exponer autenticación,
- manejar notificaciones.

Su foco es el stock.

---

### `order-service`

Responsabilidad principal:
crear y consultar órdenes.

Este servicio sí coordina una parte importante del flujo del negocio, porque recibe la solicitud de compra y decide si la orden puede registrarse.

Pero incluso acá hay límites.

`order-service` no debería convertirse en un servicio que haga absolutamente todo.

Por ejemplo, puede:

- recibir la orden,
- validar stock consultando a `inventory-service`,
- persistir la orden,
- publicar un evento.

Pero no debería absorber responsabilidades ajenas como administrar productos o comportarse como servicio de identidad.

---

### `notification-service`

Responsabilidad principal:
procesar eventos y generar notificaciones.

Su foco no es decidir si una orden puede existir, ni manejar inventario, ni exponer productos.

Su valor aparece cuando el sistema empieza a incorporar mensajería asincrónica.

---

## Una división razonable para el comienzo del curso

Para que el proyecto sea práctico y manejable, conviene empezar con una arquitectura mínima.

La base inicial de NovaMarket puede ser:

- `catalog-service`
- `inventory-service`
- `order-service`

Con esos tres servicios ya se puede construir un flujo de negocio real sin introducir demasiada complejidad demasiado pronto.

Más adelante se agregan:

- `config-server`
- `discovery-server`
- `api-gateway`
- `notification-service`
- integración con Keycloak
- RabbitMQ
- observabilidad y Docker Compose

Esta progresión es importante desde el punto de vista didáctico.

Primero se entiende el dominio. Después se incorpora infraestructura.

---

## Cómo pensar si una responsabilidad merece su propio servicio

Una guía útil es hacerse estas preguntas.

### ¿Existe una capacidad de negocio clara?

Si la responsabilidad puede nombrarse claramente y tiene un propósito reconocible, hay una buena señal.

---

### ¿Tiene reglas propias?

Si hay lógica de negocio específica, validaciones propias, decisiones propias y cambios frecuentes dentro de ese espacio, eso fortalece la idea de un límite separado.

---

### ¿Sus datos tienen dueño claro?

Si resulta natural pensar que cierta información le pertenece a ese servicio, el límite suele ser más sano.

---

### ¿Podría evolucionar con relativa independencia?

Si esa capacidad puede cambiar sin obligar a rediseñar medio sistema, probablemente hay una buena frontera.

---

### ¿La separación reduce o aumenta fricción?

A veces una división luce elegante en papel, pero en la práctica obliga a hacer demasiadas llamadas entre servicios para tareas mínimas.

Si la frontera agrega más fricción que claridad, conviene revisarla.

---

## El equilibrio entre autonomía y colaboración

Los microservicios no viven aislados. Viven colaborando.

El objetivo no es que un servicio nunca necesite a otro. El objetivo es que esa colaboración tenga sentido y no destruya la autonomía.

En NovaMarket, por ejemplo:

- `order-service` necesita saber si hay stock,
- `inventory-service` administra esa verdad,
- `notification-service` reacciona a eventos,
- el `api-gateway` concentra el acceso externo.

Todos colaboran, pero cada uno conserva una responsabilidad principal identificable.

Ese equilibrio es más importante que cualquier regla demasiado rígida.

---

## Una mala división y una mejor división

### División mala

Imaginemos estos servicios:

- `product-read-service`
- `product-write-service`
- `product-price-service`
- `product-validation-service`
- `product-utils-service`

Aunque suene detallado, esa separación probablemente produciría demasiada fragmentación para un problema que todavía no la necesita.

---

### División mejor para este curso

En cambio, una separación como esta tiene más sentido:

- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`

Acá cada servicio representa una capacidad reconocible del sistema.

No es la única división posible, pero sí una que resulta coherente, didáctica y suficientemente realista para el proyecto del curso.

---

## Qué vamos a buscar en este curso

A lo largo de NovaMarket vamos a sostener estas ideas:

- cada servicio debe tener una responsabilidad central clara,
- la arquitectura debe crecer de forma progresiva,
- no vamos a separar por moda ni por exageración,
- cada nueva pieza técnica debe aparecer porque el sistema la necesita,
- el flujo principal del negocio debe seguir siendo entendible.

Eso nos va a permitir construir un sistema distribuido sin perder el hilo conductor.

---

## Idea clave para llevarse de esta clase

Un microservicio bien diseñado no se define por su tamaño, sino por la claridad de su responsabilidad y por la calidad de su límite.

La pregunta más útil no es:

**“¿Cuántos microservicios debería tener mi sistema?”**

La pregunta más útil es:

**“¿Cómo separo responsabilidades para que cada parte tenga sentido, pueda evolucionar mejor y no convierta al sistema en una maraña de dependencias?”**

Esa es la lógica que vamos a seguir en NovaMarket.

---

## Cierre

Definir límites de servicio es una de las decisiones más importantes en una arquitectura de microservicios.

Una buena separación ayuda a que cada parte del sistema tenga foco, autonomía razonable y reglas bien encapsuladas. Una mala separación, en cambio, multiplica llamados remotos, acoplamientos y complejidad operativa.

En NovaMarket vamos a apoyarnos en una división progresiva y deliberada, donde cada servicio represente una capacidad concreta del negocio.

En la próxima clase vamos a bajar esta idea al proyecto del curso y a presentar la arquitectura base de NovaMarket, viendo qué componentes forman parte del sistema y cómo se conectan conceptualmente.
