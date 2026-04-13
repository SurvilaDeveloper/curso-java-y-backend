---
title: "Fallas distribuidas y diseño resiliente"
description: "Introducción a las fallas propias de los sistemas distribuidos y a las decisiones de diseño que permiten que NovaMarket degrade de forma controlada cuando un servicio remoto responde lento, falla o deja de estar disponible."
order: 21
module: "Módulo 6 · Resiliencia y tolerancia a fallas"
level: "base"
draft: false
---

# Fallas distribuidas y diseño resiliente

Hasta este punto del curso, **NovaMarket** ya dejó de ser una simple colección de aplicaciones aisladas. Tenemos varios microservicios colaborando entre sí, un gateway como punto de entrada, seguridad distribuida y un caso de uso principal bien definido:

**consultar catálogo → crear orden → validar stock → registrar orden**

Esa arquitectura nos da flexibilidad, separación de responsabilidades y una base mucho más cercana a un sistema real. Pero también nos mete de lleno en uno de los costos más importantes de los microservicios:

**la red ahora forma parte de la lógica del sistema**.

Y cuando la red forma parte del sistema, las fallas dejan de ser excepciones raras y pasan a ser una condición normal de diseño.

---

## El problema central

En un monolito, una llamada entre componentes suele ser una invocación local en memoria.  
En una arquitectura distribuida, en cambio, cuando `order-service` necesita consultar a `inventory-service`, esa llamada depende de muchos factores externos:

- que exista conectividad,
- que el servicio remoto esté levantado,
- que la instancia correcta responda,
- que no haya saturación,
- que la latencia sea aceptable,
- que no haya timeouts intermedios,
- que la respuesta llegue completa y a tiempo.

Es decir: una operación de negocio aparentemente simple pasa a depender de múltiples elementos que pueden fallar de formas distintas.

---

## Qué significa “falla distribuida”

Una falla distribuida no es solamente “el servicio se cayó”.

También puede ser:

- una respuesta demasiado lenta,
- una conexión que nunca termina de establecerse,
- un error intermitente,
- una instancia sana y otra rota,
- una degradación por saturación,
- una dependencia externa que responde, pero con datos inconsistentes,
- una cola de mensajes que acumula más trabajo del que puede procesar,
- un sistema que sigue “vivo” técnicamente, pero no cumple con tiempos razonables.

En otras palabras: en sistemas distribuidos, fallar no siempre significa apagarse.  
Muchas veces significa **responder mal, tarde, parcialmente o de forma inestable**.

---

## Por qué este tema importa en NovaMarket

Tomemos el flujo principal del curso.

Cuando un usuario autenticado envía una solicitud a:

`POST /api/orders`

el `api-gateway` redirige la request a `order-service`, y este necesita verificar stock contra `inventory-service`.

Ese paso parece sencillo, pero es el lugar ideal para entender la fragilidad de una arquitectura distribuida.

¿Qué pasa si:

- `inventory-service` tarda demasiado,
- responde con error,
- está temporalmente caído,
- una instancia responde y otra no,
- la red tiene una latencia anormal,
- o la dependencia se recupera, pero durante un rato estuvo degradada?

Sin un diseño cuidadoso, ese tipo de falla puede arrastrar al resto del sistema.

---

## El error de pensar en el camino feliz

Uno de los errores más comunes al construir microservicios es diseñar solo para el escenario ideal:

- todos los servicios disponibles,
- respuestas rápidas,
- datos coherentes,
- red estable,
- cero saturación.

El problema es que un sistema distribuido real no vive en ese escenario durante todo el tiempo.

Si la arquitectura solo contempla el camino feliz, tarde o temprano aparece uno de estos síntomas:

- requests colgadas,
- cascadas de error,
- threads bloqueados,
- colas internas saturadas,
- servicios que empiezan a degradarse por esperar demasiado,
- usuarios que no saben si la operación falló o sigue en proceso.

Diseñar con resiliencia significa asumir, desde el principio, que la falla es parte del contexto.

---

## Qué es diseño resiliente

Diseño resiliente no significa “hacer que nada falle”.

Eso no existe.

Diseño resiliente significa:

**permitir que el sistema siga comportándose de forma controlada incluso cuando una parte falla, responde lento o queda temporalmente indisponible**.

Ese comportamiento controlado puede tomar distintas formas:

- rechazar la operación rápido,
- devolver un error claro,
- reintentar con criterio,
- cortar temporalmente llamadas a una dependencia inestable,
- degradar funcionalidad no crítica,
- pasar una tarea a procesamiento asincrónico,
- proteger recursos internos para que la falla de un servicio no consuma todo el sistema.

La clave es que el sistema no reaccione de forma caótica.

---

## Fallas típicas en una arquitectura distribuida

### 1. Timeout

El servicio remoto no responde dentro del tiempo esperado.

Esto puede ocurrir porque:

- está saturado,
- la red está lenta,
- hay una dependencia interna todavía más lenta,
- o nunca llegó a procesar realmente la solicitud.

El gran problema de no manejar bien un timeout es que los recursos del servicio llamador pueden quedar esperando demasiado.

---

### 2. Error transitorio

A veces el servicio falla en una llamada puntual, pero vuelve a funcionar enseguida.

Ejemplos:

- un reinicio reciente,
- una instancia que todavía no terminó de inicializar,
- una interrupción momentánea de red,
- una base de datos que respondió mal en un instante puntual.

Este tipo de fallas a veces justifica un retry, pero no siempre.  
Reintentar sin criterio también puede empeorar la situación.

---

### 3. Saturación

Un servicio sigue “levantado”, pero está tan exigido que empieza a degradarse.

Síntomas frecuentes:

- aumenta la latencia,
- cae el throughput,
- crecen los timeouts,
- las instancias responden cada vez peor,
- aparecen errores secundarios.

En estos casos, insistir con más llamadas puede acelerar el colapso.

---

### 4. Falla parcial

Una parte del sistema anda y otra no.

Por ejemplo:

- una instancia de `inventory-service` funciona,
- otra devuelve errores,
- Eureka todavía la muestra,
- el LoadBalancer la sigue considerando durante un rato,
- y el comportamiento general se vuelve inconsistente.

Las fallas distribuidas rara vez son “todo o nada”.  
Muchas veces son parciales, intermitentes y difíciles de reproducir.

---

### 5. Cascada de fallas

Este es uno de los escenarios más peligrosos.

Supongamos:

1. `inventory-service` empieza a responder lento,
2. `order-service` acumula requests esperando,
3. se consumen threads y conexiones,
4. el gateway empieza a retrasarse,
5. el sistema entero parece roto, aunque la falla original estaba en una sola pieza.

Una dependencia lenta puede convertirse en una degradación general si no hay límites bien definidos.

---

## Pensar la operación desde el punto de vista del negocio

Diseñar resiliencia no es solo un problema técnico.

También es una pregunta de negocio:

**¿qué debería pasar si una dependencia crítica falla en medio de una operación?**

En NovaMarket, si `inventory-service` no puede confirmar stock, hay varias posibilidades:

- rechazar la creación de la orden con un error claro,
- dejar la orden como pendiente,
- aceptar la solicitud pero marcarla para validación posterior,
- aplicar una estrategia temporal solo para entornos controlados.

No hay una única respuesta universal.  
Lo importante es que la decisión sea explícita y consistente con el modelo de negocio que se está enseñando.

Para este curso, la estrategia más clara en una primera etapa será:

**si no se puede validar stock de forma confiable, la orden no se confirma**.

Eso simplifica el flujo y permite enseñar resiliencia sin introducir demasiadas variantes al mismo tiempo.

---

## Principios básicos de diseño resiliente

### Falla rápido

Si una dependencia no responde bien, muchas veces conviene cortar antes que esperar indefinidamente.

Esperar demasiado:

- consume recursos,
- empeora la experiencia,
- y puede dañar servicios que en realidad estaban sanos.

---

### No reintentes ciegamente

Un retry puede ayudar frente a errores transitorios.  
Pero si la dependencia está saturada o caída, reintentar muchas veces solo multiplica el problema.

---

### Aislá las dependencias

No conviene que una dependencia lenta consuma todos los recursos del servicio llamador.

La arquitectura debe impedir que un problema remoto secuestre la capacidad local.

---

### Degradá de forma explícita

Una funcionalidad degradada pero controlada suele ser mejor que una experiencia errática.

Por ejemplo:

- rechazar la operación con mensaje claro,
- deshabilitar temporalmente una capacidad,
- o mover parte del trabajo a un flujo asincrónico.

---

### Observá lo que pasa

Sin métricas, logs y trazas, la resiliencia se vuelve muy difícil de operar.

No alcanza con implementar mecanismos defensivos.  
También hay que poder entender cuándo se activan y por qué.

---

## Qué mecanismos vamos a incorporar en el curso

Este módulo no se va a quedar en teoría.  
Sobre el flujo real de NovaMarket vamos a incorporar progresivamente:

- **timeouts**,
- **retry**,
- **circuit breaker**,
- **fallbacks controlados**,
- **métricas y estado observable con Actuator**.

Más adelante también vamos a conectarlo con trazas, logs y métricas para ver cómo se comporta el sistema cuando una dependencia falla o se degrada.

---

## Un ejemplo concreto en NovaMarket

Imaginemos esta secuencia:

1. el usuario llama al gateway para crear una orden,
2. `order-service` recibe la solicitud,
3. `order-service` llama a `inventory-service`,
4. `inventory-service` tarda demasiado.

¿Qué opciones tiene `order-service`?

### Opción mala
Esperar indefinidamente.

Consecuencias:

- la request queda colgada,
- se consumen threads,
- aumenta la latencia general,
- pueden empezar a fallar otras operaciones.

### Opción mejor
Definir un timeout y responder con un error controlado.

Consecuencias:

- la operación falla, pero falla rápido,
- el servicio se protege mejor,
- el usuario recibe una respuesta consistente.

### Opción todavía más madura
Agregar timeout, circuit breaker y observabilidad.

Consecuencias:

- la dependencia problemática queda contenida,
- se corta la cascada,
- se puede monitorear cuándo el sistema entra en modo degradado.

Ese es el camino que vamos a recorrer.

---

## Resiliencia no es esconder errores

Otro error común es pensar que ser resiliente significa “hacer como si nada hubiera pasado”.

No siempre.

A veces la respuesta correcta es:

- fallar rápido,
- ser explícitos,
- registrar el evento,
- y dejar en claro que la operación no pudo completarse.

Resiliencia no es maquillarlo todo.  
Resiliencia es **administrar bien la falla**.

---

## Qué conviene evitar

### 1. Timeouts inexistentes o demasiado largos
Son una receta para saturación y mala experiencia.

### 2. Retries sin límites
Pueden multiplicar la carga sobre un servicio ya inestable.

### 3. Fallbacks engañosos
No conviene devolver una respuesta “válida” si en realidad se perdió una validación crítica.

### 4. Ignorar la observabilidad
Si no podés ver el comportamiento real del sistema, no podés mejorar su resiliencia.

### 5. Diseñar todo como si las dependencias fueran locales
Ese es uno de los errores más costosos al empezar con microservicios.

---

## Cómo se conecta esto con lo que ya construimos

Hasta ahora vimos:

- configuración centralizada,
- discovery,
- OpenFeign,
- gateway,
- seguridad con tokens,
- servicios protegidos.

Todo eso hizo que NovaMarket se pareciera mucho más a una arquitectura profesional.  
Ahora toca el siguiente paso lógico:

**hacer que esa arquitectura soporte mejor la inestabilidad inevitable de un sistema distribuido**.

Este módulo marca justamente esa transición.  
Ya no alcanza con que el sistema funcione.  
Ahora tiene que **seguir comportándose de forma razonable cuando algo sale mal**.

---

## Cierre

En microservicios, la falla no es una anomalía remota.  
Es un dato estructural del sistema.

Diseñar resiliencia significa aceptar esa realidad y tomar decisiones para que una dependencia lenta, caída o inestable no destruya el comportamiento general de la aplicación.

En NovaMarket, ese aprendizaje va a girar alrededor del flujo de creación de órdenes y la dependencia con `inventory-service`, que es el lugar ideal para observar cómo una falla remota puede afectar el negocio y cómo una arquitectura bien diseñada puede contener ese impacto.

En la próxima clase vamos a entrar en uno de los patrones más importantes para este problema: el **Circuit Breaker**.
