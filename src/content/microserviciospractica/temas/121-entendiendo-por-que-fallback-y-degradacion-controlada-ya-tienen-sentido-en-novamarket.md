---
title: "Entendiendo por qué fallback y degradación controlada ya tienen sentido en NovaMarket"
description: "Siguiente paso del módulo 11. Comprensión de por qué, después de timeout, retry y circuit breaker, ya conviene pensar en fallback como respuesta útil frente a dependencias degradadas."
order: 121
module: "Módulo 11 · Resiliencia y tolerancia a fallos"
level: "intermedio"
draft: false
---

# Entendiendo por qué fallback y degradación controlada ya tienen sentido en NovaMarket

En la clase anterior cerramos un subbloque muy importante dentro del módulo de resiliencia:

- ya modelamos una lentitud real entre servicios,
- ya limitamos espera con timeout,
- ya agregamos retry controlado,
- y además ya incorporamos un primer circuit breaker para dejar de insistir cuando la degradación se vuelve repetida o persistente.

Eso ya tiene muchísimo valor.

Pero ahora aparece una pregunta muy natural:

**si el sistema ya sabe esperar menos, reintentar con criterio y dejar de insistir cuando una dependencia sigue mal, qué le responde finalmente al flujo de negocio cuando esa dependencia no está disponible de forma razonable?**

Ese es el terreno de esta clase.

Porque una cosa es:

- detectar degradación,
- limitar espera,
- cortar presión,
- y proteger al sistema.

Y otra bastante distinta es decidir:

- qué respuesta damos cuando igual necesitamos seguir comportándonos de una forma útil, controlada o al menos comprensible para el resto del flujo.

Ese es exactamente el siguiente problema que conviene abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro qué es un **fallback** en este contexto,
- entendida la diferencia entre “fallar mejor” y “degradar de forma controlada”,
- visible por qué fallback aparece naturalmente después de timeout, retry y circuit breaker,
- y preparado el terreno para aplicar un primer fallback real en la próxima clase.

La meta de hoy no es todavía diseñar todos los fallbacks del sistema.  
La meta es mucho más concreta: **entender por qué, después de protegernos del fallo, también necesitamos pensar cómo responder de una forma útil cuando el fallo persiste**.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe una relación real entre `order-service` e `inventory-service`,
- esa relación ya fue sometida a un escenario de degradación,
- y el sistema ya cuenta con timeout, retry y circuit breaker como capas iniciales de resiliencia.

Eso significa que el problema ya no es si detectamos o contenemos suficientemente bien el fallo.  
Ahora la pregunta útil es otra:

- **qué experiencia o qué respuesta dejamos disponible cuando una dependencia sigue sin poder darnos la información esperada**

Y eso es exactamente lo que vamos a resolver en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué significa fallback en una arquitectura como NovaMarket,
- entender por qué no es lo mismo que retry o breaker,
- conectar esta idea con el laboratorio real que ya venimos usando,
- y dejar clara la lógica del siguiente paso práctico del bloque.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- el sistema dejó de reaccionar de forma ingenua frente a una dependencia degradada.

Eso fue un gran salto.

Pero a medida que el bloque madura, aparece otra necesidad muy concreta:

**que el sistema tenga alguna respuesta controlada o degradada cuando la dependencia sigue fallando y ya no es razonable seguir esperando ni insistiendo.**

Porque ahora conviene hacerse preguntas como:

- si `inventory-service` sigue mal, ¿qué devuelve `order-service`?
- ¿deja de responder por completo?
- ¿devuelve una respuesta genérica?
- ¿marca el estado como indeterminado?
- ¿rechaza la operación con un mensaje más controlado?
- ¿cómo evitamos que el fallo termine en una experiencia completamente caótica o incomprensible?

Ese cambio de enfoque es justamente el corazón de esta etapa.

---

## Qué es fallback en este contexto

Para esta etapa del curso, una forma útil de pensarlo es esta:

**fallback es una respuesta alternativa, controlada y explícita que el sistema utiliza cuando la operación principal no puede completarse de forma normal.**

Esa idea es central.

No estamos hablando necesariamente de “ocultar el error”.  
Tampoco de “inventar una respuesta falsa”.

Estamos hablando de algo más serio:

- decidir qué comportamiento degradado es aceptable,
- hacerlo de forma explícita,
- y dejar claro que la operación principal no pudo resolverse como estaba previsto.

Ese matiz importa muchísimo.

---

## Por qué fallback no es lo mismo que circuit breaker

Este punto vale muchísimo.

A esta altura del módulo conviene fijar algo importante:

### Circuit breaker
Decide cuándo dejar de seguir golpeando una dependencia degradada.

### Fallback
Decide qué respuesta damos una vez que esa llamada principal ya no se va a ejecutar normalmente o ya falló.

Eso significa que breaker y fallback no compiten entre sí.  
Se complementan.

El breaker protege.  
El fallback le da una salida más controlada al flujo.

Ese puente entre ambos patrones es una de las claves del bloque.

---

## Qué tipos de fallback podrían existir en NovaMarket

A esta altura del curso, algunos ejemplos muy razonables podrían ser:

- devolver una respuesta explícita que indique que el stock no pudo verificarse en este momento,
- responder con un estado degradado en vez de reventar toda la operación,
- o cortar la creación de la orden de forma más clara y más comprensible para el consumidor.

No hace falta hoy elegir todos los casos posibles.

Lo importante es ver que fallback no tiene por qué ser siempre:

- “devolver cualquier cosa”
- ni
- “seguir como si nada”.

Puede ser algo mucho más honesto y útil.

---

## Cómo se traduce esto al laboratorio que ya tenemos

A esta altura del bloque, seguimos trabajando con el mismo escenario:

- `order-service` depende de `inventory-service`
- ya vimos lentitud
- ya limitamos la espera
- ya reintentamos una vez
- y ya cortamos insistencia con un breaker

Ahora la nueva pregunta es:

- cuando todo eso ya no alcanza para obtener la respuesta real de inventario, ¿qué salida controlada le damos a `order-service`?

Esa pregunta ya no es teórica.  
Está directamente conectada con el flujo real del sistema.

---

## Qué gana NovaMarket con fallback bien pensado

Aunque todavía no lo apliquemos en esta clase, el valor ya se puede ver con claridad.

A partir de un fallback razonable, NovaMarket puede ganar cosas como:

- respuestas más controladas,
- degradación menos caótica,
- mejor comunicación del problema hacia arriba,
- y una arquitectura más madura frente a situaciones donde la operación principal ya no puede completarse normalmente.

Eso vuelve al proyecto mucho más serio desde el punto de vista de resiliencia.

---

## Por qué este paso aparece justo ahora

Esto también importa mucho.

Si todavía no hubiéramos trabajado timeout, retry y circuit breaker, hablar de fallback sería raro.

¿Por qué?

Porque primero convenía responder estas preguntas:

- ¿cuánto esperamos?
- ¿reintentamos?
- ¿cuándo dejamos de insistir?

Ahora que esas preguntas ya tienen primeras respuestas, sí tiene muchísimo sentido abrir esta otra:

- **cuando la operación principal ya no va a salir, qué respuesta alternativa razonable dejamos disponible**

Ese orden es excelente.

---

## Qué todavía no estamos haciendo en esta etapa

Conviene dejar esto muy claro.

En este punto todavía no estamos:

- implementando todavía el fallback concreto,
- ni definiendo una política final para todos los flujos del sistema,
- ni resolviendo aún todos los casos de degradación posible.

La meta actual es mucho más concreta:

**abrir correctamente el bloque de fallback y degradación controlada.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no aplica todavía un fallback real, pero hace algo muy importante:

**abre explícitamente el siguiente frente lógico del módulo 11: no solo proteger al sistema del fallo, sino también responder de una forma más útil y controlada cuando la operación principal no puede completarse.**

Eso importa muchísimo, porque NovaMarket deja de madurar solo desde corte y contención del fallo y empieza a prepararse para otra mejora clave: comportarse mejor también del lado de la respuesta cuando una dependencia sigue degradada.

---

## Qué todavía no hicimos

Todavía no:

- elegimos todavía la forma exacta del fallback,
- ni lo conectamos aún al laboratorio real.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué fallback y degradación controlada ya tienen sentido en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que fallback siempre significa “inventar datos”
No. Puede significar una respuesta degradada, honesta y útil.

### 2. Confundir fallback con retry o circuit breaker
Cada patrón resuelve una parte distinta del problema.

### 3. Usar fallback para ocultar un fallo real
Eso puede volver opaco el comportamiento del sistema.

### 4. Abrir este frente demasiado pronto
Antes de timeout, retry y breaker, habría quedado prematuro.

### 5. No ver el valor del cambio
El sistema no solo necesita protegerse; también necesita responder mejor cuando algo sigue mal.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro qué es fallback, por qué aparece naturalmente después de timeout, retry y circuit breaker, y por qué en NovaMarket puede ser la siguiente mejora lógica para responder mejor ante dependencias degradadas.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué problema nuevo resuelve fallback,
- ves por qué no es lo mismo que timeout, retry o breaker,
- entendés que puede ser una respuesta degradada pero controlada,
- y sentís que el proyecto ya está listo para aplicar un primer fallback real sobre el laboratorio que venimos usando.

Si eso está bien, ya podemos pasar a integrarlo en el flujo crítico de NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a agregar un primer fallback real sobre la llamada crítica entre `order-service` e `inventory-service` para que el sistema responda de una forma más controlada cuando la operación principal no pueda completarse normalmente.

---

## Cierre

En esta clase entendimos por qué fallback y degradación controlada ya tienen sentido en NovaMarket.

Con eso, el proyecto deja de trabajar la resiliencia solo desde protección, corte o reintento y empieza a prepararse para otra mejora muy valiosa: responder de una forma más clara, más controlada y más útil cuando una dependencia sigue sin poder cumplir su función principal.
