---
title: "Introduciendo una primera capa de logs correlacionados en gateway y servicios de NovaMarket"
description: "Primer paso práctico del subtramo de logs dentro del módulo 12. Incorporación de una primera capa de logs correlacionados usando correlation id entre gateway y servicios."
order: 129
module: "Módulo 12 · Observabilidad"
level: "intermedio"
draft: false
---

# Introduciendo una primera capa de logs correlacionados en gateway y servicios de NovaMarket

En la clase anterior dejamos algo bastante claro:

- correlation id ya existe,
- pero su valor todavía puede quedar muy limitado si los mensajes del sistema no lo muestran de forma útil,
- y el siguiente paso lógico ya no es seguir hablando de observabilidad en abstracto, sino empezar a hacer visible ese hilo compartido en los logs del sistema.

Ahora toca el paso concreto:

**introducir una primera capa de logs correlacionados en gateway y servicios de NovaMarket.**

Ese es el objetivo de esta clase.

Porque una cosa es que el id viaje.

Y otra bastante distinta es poder leer algo como:

- “esta request entró por gateway con tal id”
- “llegó a order-service con el mismo id”
- “después pasó por inventory con ese mismo hilo”

Ese es exactamente el primer gran valor práctico que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la relación entre correlation id y logs útiles,
- visible una primera forma consistente de mostrar ese id en gateway y servicios,
- mejorada la legibilidad básica de una request distribuida,
- y NovaMarket mejor preparado para seguir después con trazabilidad más rica u otras herramientas del bloque.

La meta de hoy no es todavía una estrategia final de logging del proyecto.  
La meta es mucho más concreta: **hacer que una misma request ya pueda reconocerse con bastante claridad a través de los mensajes emitidos por varias piezas del sistema**.

---

## Estado de partida

Partimos de un sistema donde ya:

- el gateway puede generar o preservar `X-Correlation-Id`,
- ese header puede viajar hacia servicios internos,
- y el bloque ya dejó claro que ahora hace falta volver mucho más visible y legible esa correlación.

Eso significa que el problema ya no es cómo mover el id.  
Ahora la pregunta útil es otra:

- **cómo hacemos para que los mensajes del sistema realmente aprovechen ese hilo compartido de una forma clara y consistente**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir una forma sencilla y visible de mostrar el correlation id en logs,
- hacer que gateway y servicios lo incluyan de forma consistente,
- volver a ejecutar una request real del sistema,
- y observar cómo mejora la lectura del flujo distribuido.

---

## Qué estrategia conviene usar primero

A esta altura del curso, no hace falta todavía una solución gigantesca.

Lo más sano es algo mucho más simple y útil:

- tomar el correlation id del request,
- ponerlo en un contexto de logging,
- y hacer que los mensajes relevantes lo incluyan de forma visible.

La idea no es perfección total de observabilidad.

La idea es que el sistema ya gane una primera lectura distribuida mucho mejor que la anterior.

---

## Paso 1 · Hacer visible el correlation id en gateway

A esta altura del módulo, una forma muy razonable puede ser que el filtro del gateway:

- lea o genere el `X-Correlation-Id`,
- lo agregue a la request,
- y además emita un log claro con ese valor

Algo conceptualmente así:

```java
log.info("Gateway recibió request {} con correlationId={}", request.getPath(), correlationId);
```

No hace falta todavía diseñar una política completa de logs.

Lo importante es que el borde del sistema ya haga visible el hilo compartido desde el primer punto de entrada.

---

## Paso 2 · Hacer visible el mismo id en `order-service`

Ahora conviene que cuando `order-service` reciba la request o procese la operación relevante, loggee también el mismo id.

Por ejemplo, algo conceptualmente así:

```java
log.info("OrderService procesando creación de orden. correlationId={}", correlationId);
```

No importa todavía si el id te llega por header, por contexto o por alguna ayuda de infraestructura que armes más adelante.

La idea central es otra:

- el mismo hilo técnico ya tiene que empezar a verse también en el servicio consumidor.

Ese paso vale muchísimo.

---

## Paso 3 · Hacer visible el mismo id en `inventory-service`

Ahora repetimos la idea en `inventory-service`.

Por ejemplo:

```java
log.info("InventoryService consultando stock para productId={}. correlationId={}", productId, correlationId);
```

Con eso, una misma request ya deja huellas mucho más fáciles de seguir a través del sistema.

Ese es uno de los corazones prácticos de toda la clase.

---

## Paso 4 · Entender que no se trata solo de “poner el id en todos lados”

Este punto importa muchísimo.

No queremos que el correlation id aparezca como un ruido más dentro de logs caóticos.

Queremos algo bastante más valioso:

- mensajes claros,
- específicos,
- con el mismo id compartido,
- y suficientes como para reconstruir bien el recorrido sin ahogar al sistema en ruido innecesario.

Ese matiz importa mucho más que la cantidad de logs.

---

## Paso 5 · Probar una request real

Ahora ejecutá una request que atraviese varias piezas.  
Por ejemplo, una operación que:

- entre por gateway,
- toque `order-service`,
- y dependa de `inventory-service`

La idea es observar si, en los logs, ya se puede seguir mucho mejor el hilo técnico de esa operación.

Este paso es central porque convierte el cambio en algo visible y no solo en una intención de diseño.

---

## Paso 6 · Observar el nuevo comportamiento

Lo que queremos ver ahora no es solo “hay más mensajes”.

Queremos leer algo mucho más valioso:

- existe un id compartido,
- aparece en varios puntos del sistema,
- y permite reconstruir el recorrido de la request de una forma muchísimo más comprensible que antes.

Ese cambio importa muchísimo porque es la primera gran ganancia concreta del bloque de observabilidad.

---

## Paso 7 · Entender por qué esto sigue siendo una capa inicial

A esta altura del curso, conviene dejar algo claro:

esto todavía no es trazabilidad distribuida completa.

Pero sí es una mejora enorme porque:

- deja mucho más legible el sistema,
- vuelve mucho más fácil relacionar eventos,
- y prepara muy bien pasos posteriores más ricos.

Ese matiz es muy sano.

---

## Paso 8 · Entender qué acabamos de ganar

Este punto vale muchísimo.

Hasta ahora, una request distribuida ya tenía un id compartido, pero su lectura todavía podía seguir siendo bastante opaca.

Ahora, en cambio, además ya tiene:

- mensajes visibles,
- coherentes,
- y correlacionables

en varias piezas del sistema.

Ese salto cambia muchísimo la utilidad real del bloque de observabilidad.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene observabilidad completa”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una primera capa real de logs correlacionados entre gateway y servicios.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase introduce una primera capa de logs correlacionados en gateway y servicios de NovaMarket.

Ya no estamos solo moviendo un header de correlación.  
Ahora también estamos haciendo que una misma request deje un rastro mucho más legible y mucho más útil a través del sistema distribuido.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos todavía este subbloque con un checkpoint fuerte,
- ni abrimos aún trazabilidad más rica o herramientas mayores del bloque de observabilidad.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**hacer que el correlation id ya no sea solo un dato técnico que viaja, sino una señal visible y útil dentro de los logs del sistema.**

---

## Errores comunes en esta etapa

### 1. Agregar el id pero mantener logs poco claros
La legibilidad del mensaje sigue siendo central.

### 2. Loggear demasiado y generar ruido
No se trata de cantidad, sino de utilidad.

### 3. Mostrar el id solo en el gateway
El valor distribuido aparece cuando también se ve en servicios internos.

### 4. Pensar que este paso ya reemplaza trazabilidad distribuida completa
Todavía es una primera capa.

### 5. No probar una request que atraviese varias piezas
La comparación es parte central del valor de la clase.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- gateway y servicios ya muestran un correlation id visible,
- una misma request deja un hilo mucho más legible en los logs,
- y NovaMarket ya dio un primer paso serio hacia una observabilidad distribuida más útil y mucho más clara.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el correlation id ya aparece de forma visible en logs relevantes,
- podés seguir mejor una misma request entre piezas del sistema,
- entendés qué hace valioso a un log correlacionado,
- y sentís que NovaMarket ya ganó una nueva capa concreta de madurez desde observabilidad básica distribuida.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta nueva capa del módulo 12.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de logs correlacionados antes de decidir si seguimos con trazabilidad más rica o con otro subtramo del bloque de observabilidad.

---

## Cierre

En esta clase introdujimos una primera capa de logs correlacionados en gateway y servicios de NovaMarket.

Con eso, el proyecto deja de transportar un correlation id como si fuera solo un detalle técnico del request y empieza a convertirlo en una señal realmente útil para leer, seguir y entender mucho mejor el comportamiento distribuido del sistema.
