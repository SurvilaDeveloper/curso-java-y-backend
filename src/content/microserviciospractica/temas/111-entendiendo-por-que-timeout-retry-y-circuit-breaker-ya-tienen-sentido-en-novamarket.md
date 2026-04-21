---
title: "Entendiendo por qué timeout, retry y circuit breaker ya tienen sentido en NovaMarket"
description: "Inicio del siguiente gran bloque del curso rehecho. Comprensión de por qué, después de consolidar Compose, gateway y seguridad real, ya conviene abrir resiliencia y tolerancia a fallos."
order: 111
module: "Módulo 11 · Resiliencia y tolerancia a fallos"
level: "intermedio"
draft: false
---

# Entendiendo por qué timeout, retry y circuit breaker ya tienen sentido en NovaMarket

En la clase anterior cerramos un bloque muy importante del curso rehecho:

- NovaMarket ya tiene un entorno multicontenedor serio,
- ya tiene gateway fuerte,
- ya tiene identidad centralizada con Keycloak,
- ya emite y valida JWT reales,
- y además ya usa esa identidad para autenticar y autorizar acceso real en el borde del sistema.

Eso ya tiene muchísimo valor.

Pero ahora aparece otra pregunta muy natural:

**si el sistema ya está integrado, autenticado y autorizado, qué pasa cuando una parte falla, responde lento o deja de estar disponible?**

Ese es el terreno de esta clase.

Porque una cosa es que el sistema tenga rutas, identidad y seguridad.

Y otra bastante distinta es que siga comportándose de una forma razonable cuando:

- una dependencia tarda demasiado,
- un servicio se cae,
- un enlace entre servicios falla,
- o un error empieza a propagarse en cadena.

Ese es exactamente el siguiente gran problema que conviene abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué resiliencia ya tiene sentido en este punto del proyecto,
- entendida la diferencia entre “el sistema funciona” y “el sistema resiste fallos razonablemente”,
- alineado el modelo mental para introducir timeout, retry y circuit breaker,
- y preparado el terreno para empezar a simular y contener fallos reales dentro de NovaMarket.

Todavía no vamos a implementar todas las técnicas de resiliencia del bloque.  
La meta de hoy es entender por qué este nuevo frente aparece exactamente ahora.

---

## Estado de partida

Partimos de un sistema donde ya:

- la arquitectura está integrada en Compose,
- el gateway existe y enruta tráfico real,
- la seguridad real ya está bastante mejor resuelta,
- y el sistema ya se parece mucho más a una plataforma viva que a un conjunto de demos aisladas.

Eso significa que el problema ya no es solo:

- “cómo levantar servicios”
- o
- “cómo proteger acceso”

Ahora empieza a importar otra pregunta:

- **cómo reacciona el sistema cuando algo deja de responder bien**

Y esa pregunta cambia muchísimo el nivel del proyecto.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar por qué la resiliencia aparece naturalmente después del bloque de seguridad,
- entender qué tipo de fallos importan en una arquitectura como NovaMarket,
- conectar esta idea con todo lo que ya construimos antes,
- y dejar clara la lógica del siguiente gran bloque del roadmap rehecho.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- el sistema está integrado y protegido de una forma bastante seria.

Eso fue un gran salto.

Pero a medida que el proyecto crece, aparece otra necesidad muy concreta:

**que el sistema no dependa de que todas sus piezas respondan siempre de forma perfecta y rápida para seguir comportándose de una manera razonable.**

Porque ahora conviene hacerse preguntas como:

- ¿qué pasa si `inventory-service` tarda mucho?
- ¿qué pasa si `order-service` depende de algo que empieza a fallar?
- ¿qué pasa si el gateway espera demasiado una respuesta?
- ¿cómo evitamos que un problema puntual se convierta en un problema sistémico?

Ese cambio de enfoque es justamente el corazón de esta etapa.

---

## Por qué este bloque aparece ahora y no antes

Esto también importa mucho.

Si todavía no tuviéramos:

- varios servicios reales,
- un gateway fuerte,
- Compose,
- y tráfico ya más serio entre piezas del sistema,

hablar de resiliencia sería bastante prematuro o artificial.

Pero ahora el proyecto ya tiene suficiente cuerpo como para que los fallos de comunicación entre componentes empiecen a ser un problema realista y didácticamente muy valioso.

Ese orden es muy sano.

---

## Qué significa timeout en este contexto

Para esta etapa del curso, una forma útil de pensarlo es esta:

**un timeout es una forma de limitar cuánto estamos dispuestos a esperar por una respuesta antes de considerar que esa espera ya no es razonable para el sistema.**

Esa idea es central.

Porque en sistemas distribuidos, esperar indefinidamente suele ser una mala idea.

Y eso ya nos obliga a pensar el sistema con otra madurez:

- no solo “que responda”
- sino
- “cuánto tiempo tiene sentido esperar”.

---

## Qué significa retry en este contexto

El **retry** aparece cuando queremos darle a una operación una nueva oportunidad ante ciertos fallos o respuestas transitorias.

Eso puede ser útil, pero también peligroso si se usa sin criterio.

¿Por qué?

Porque reintentar indiscriminadamente puede incluso empeorar una situación de carga o degradación.

Ese matiz es muy importante y va a atravesar todo el bloque.

---

## Qué significa circuit breaker en este contexto

Este punto importa muchísimo.

Para esta etapa del curso, una forma útil de pensarlo es esta:

**un circuit breaker es una forma de detectar que una dependencia está fallando repetidamente y cortar temporalmente nuevas llamadas para evitar seguir empeorando el problema.**

Esa idea es central.

No es solo “reintentar mejor”.  
Es algo bastante más fuerte:

- reconocer degradación,
- cortar o reducir llamadas,
- y proteger al sistema de una cadena de fallos más grande.

Ese es justamente el gran corazón del bloque de resiliencia.

---

## Cómo se traduce esto a NovaMarket

A esta altura del curso, uno de los escenarios más naturales suele ser pensar algo como:

- `order-service` depende de `inventory-service`
- o el gateway depende de respuestas de servicios internos
- y queremos ver qué pasa cuando una de esas piezas falla, responde lento o deja de estar disponible

No hace falta todavía cerrar todos los escenarios posibles.

Lo importante ahora es ver que la arquitectura ya permite ensayar problemas reales de resiliencia, no solo imaginarlos.

---

## Qué gana NovaMarket con este cambio

Aunque todavía no apliquemos las técnicas concretas, el valor ya se puede ver con claridad.

A partir de timeout, retry y circuit breaker, NovaMarket puede empezar a ganar cosas como:

- mayor control sobre fallos,
- menor propagación de errores en cadena,
- una lectura mucho más seria de las dependencias entre servicios,
- y un comportamiento bastante más profesional frente a problemas de comunicación.

Eso vuelve al proyecto mucho más maduro desde el punto de vista arquitectónico.

---

## Qué todavía no estamos haciendo en esta etapa

Conviene dejar esto muy claro.

En este punto todavía no estamos:

- configurando todavía timeouts concretos,
- ni agregando aún retries,
- ni integrando todavía circuit breaker con una librería real,
- ni simulando aún fallos específicos del sistema.

La meta actual es mucho más concreta:

**abrir correctamente el bloque de resiliencia y tolerancia a fallos.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no implementa todavía timeout, retry ni circuit breaker, pero hace algo muy importante:

**abre explícitamente el siguiente gran bloque del curso rehecho: resiliencia real sobre una arquitectura ya integrada y ya protegida.**

Eso importa muchísimo, porque NovaMarket deja de madurar solo desde infraestructura, gateway y seguridad y empieza a prepararse para otra mejora clave: que el sistema también pueda reaccionar de forma razonable cuando las cosas dejan de salir bien.

---

## Qué todavía no hicimos

Todavía no:

- elegimos todavía qué escenario de fallo conviene modelar primero,
- ni aplicamos todavía una técnica concreta de resiliencia.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué timeout, retry y circuit breaker ya tienen sentido como siguiente gran bloque de NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que si el sistema ya funciona y está protegido, la resiliencia puede esperar demasiado
En microservicios, el fallo entre piezas es un tema central.

### 2. Querer hablar de circuit breaker sin una arquitectura suficientemente integrada
Antes de Compose fuerte y gateway real, habría quedado mucho más artificial.

### 3. Confundir resiliencia con “hacer reintentos porque sí”
El bloque va a requerir criterio, no recetas ciegas.

### 4. Esperar resolver todos los fallos del sistema de una sola vez
Este bloque también necesita una progresión propia.

### 5. No ver el valor del cambio
Después de seguridad real, resiliencia es uno de los siguientes escalones más naturales del curso.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para abrir el bloque de resiliencia y por qué timeout, retry y circuit breaker aparecen ahora como siguiente evolución natural del proyecto.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés por qué un sistema integrado necesita pensar también en fallos,
- ves qué tipo de problemas abre este bloque,
- entendés que timeout, retry y circuit breaker no son lo mismo,
- y sentís que el proyecto ya está listo para empezar a modelar y contener fallos reales.

Si eso está bien, ya podemos pasar al siguiente tema y construir el primer escenario práctico de resiliencia en NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a modelar un primer escenario real de fallo o lentitud entre servicios de NovaMarket para que timeout, retry y circuit breaker no arranquen como teoría aislada sino como respuesta a un problema concreto del sistema.

---

## Cierre

En esta clase entendimos por qué timeout, retry y circuit breaker ya tienen sentido en NovaMarket.

Con eso, el proyecto deja de madurar solo desde infraestructura, gateway y seguridad real y empieza a prepararse para otra mejora muy valiosa: que el sistema ya no solo funcione y se proteja bien, sino que también pueda resistir fallos de una forma mucho más razonable y profesional.
