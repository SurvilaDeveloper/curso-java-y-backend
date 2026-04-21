---
title: "Agregando una primera capa de retries controlados antes de la DLQ en NovaMarket"
description: "Siguiente paso práctico del módulo 13. Incorporación de una primera capa de retries controlados para el consumo de OrderCreated antes del desvío final a la dead letter queue."
order: 147
module: "Módulo 13 · Comunicación asíncrona y eventos"
level: "intermedio"
draft: false
---

# Agregando una primera capa de retries controlados antes de la DLQ en NovaMarket

En la clase anterior dejamos algo bastante claro:

- el primer flujo asíncrono real ya existe,
- la DLQ ya permite separar mensajes problemáticos del flujo principal,
- y el siguiente paso lógico ya no es tratar todos los fallos como equivalentes, sino empezar a introducir retries controlados antes del desvío final.

Ahora toca el paso concreto:

**agregar una primera capa de retries controlados antes de la DLQ en NovaMarket.**

Ese es el objetivo de esta clase.

Porque una cosa es tener:

- un flujo feliz,
- una DLQ,
- y un consumidor real.

Y otra bastante distinta es conseguir que:

- ciertos fallos tengan una o pocas oportunidades extra,
- el sistema no sea excesivamente rígido,
- y al mismo tiempo los casos persistentes sigan saliendo hacia la cola de errores.

Ese es exactamente el primer gran valor práctico que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la relación entre retry y DLQ,
- visible una primera política concreta de retries controlados,
- mejorado el manejo de fallos transitorios del lado consumidor,
- y NovaMarket mejor preparado para seguir consolidando mensajería robusta después.

La meta de hoy no es todavía diseñar toda la confiabilidad final de la arquitectura basada en eventos.  
La meta es mucho más concreta: **hacer que el consumo de `OrderCreated` tolere mejor algunos fallos puntuales antes de derivar definitivamente el mensaje a la DLQ**.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe un flujo real `OrderCreated`,
- `notification-service` lo consume,
- y además existe una DLQ para separar mensajes problemáticos del flujo principal.

Eso significa que el problema ya no es cómo aislar fallos persistentes.  
Ahora la pregunta útil es otra:

- **cómo hacemos para que ciertos fallos transitorios tengan una oportunidad adicional antes del desvío final**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- definir una primera política pequeña de reintentos,
- preparar el consumo de `OrderCreated` para tolerar mejor ciertos fallos,
- volver a ejecutar un escenario controlado de error,
- y dejar visible cómo cambia el comportamiento del sistema antes del desvío final a la DLQ.

---

## Paso 1 · Decidir una política chica y visible de reintentos

A esta altura del curso, no conviene arrancar con algo gigante.

Lo más sano es una política:

- corta,
- visible,
- fácil de probar,
- y suficientemente clara como para comparar comportamiento antes y después.

Por ejemplo:

- uno o dos reintentos extra
- antes del desvío a la DLQ

No hace falta todavía una estrategia hiper refinada.

Ese criterio mejora muchísimo la legibilidad del bloque.

---

## Paso 2 · Entender qué queremos lograr exactamente

La meta no es que el sistema insista por capricho.

La meta es algo más precisa:

- si el fallo fue transitorio,
- el mensaje puede recuperarse sin terminar en la DLQ
- y el flujo principal gana algo de elasticidad

Ese matiz importa muchísimo porque define el valor real del retry.

---

## Paso 3 · Preparar un fallo controlado y recuperable

Para el laboratorio, una opción muy didáctica puede ser algo como:

- hacer que `notification-service` falle la primera vez para un caso de prueba,
- pero que luego pueda procesar bien el mismo mensaje en un intento posterior.

No estamos diciendo que esta sea la lógica final de producción.

La idea es otra:

- construir un escenario visible,
- reproducible,
- y útil para comprobar que los retries realmente aportan valor antes del desvío final.

Ese matiz importa muchísimo.

---

## Paso 4 · Aplicar la lógica de retry

A esta altura del módulo, el mecanismo exacto puede variar según cómo hayas decidido manejar listeners, acknowledge, requeue y configuración del contenedor.

Lo importante para esta clase es fijar la idea central:

- el mensaje no va directo a la DLQ ante el primer fallo recuperable,
- primero recibe una cantidad pequeña y controlada de nuevas oportunidades.

Ese paso ya tiene muchísimo valor.

---

## Paso 5 · Ejecutar el flujo y observar qué cambia

Ahora volvé a disparar el flujo `OrderCreated` con el escenario controlado donde el consumidor falla primero, pero podría recuperarse después.

La idea es observar algo muy concreto:

- el sistema no deriva enseguida el mensaje,
- existe uno o pocos nuevos intentos,
- y en algunos casos el consumo finalmente se recupera sin pasar por la DLQ.

Ese recorrido es el corazón práctico de toda la clase.

---

## Paso 6 · Verificar cuándo el mensaje se recupera y cuándo no

Este punto importa muchísimo.

Queremos leer dos situaciones distintas:

### Caso recuperable
- falla al principio
- retry entra en juego
- el mensaje termina procesándose

### Caso persistente
- sigue fallando
- los intentos se agotan
- y entonces recién ahí aparece la DLQ

Ese contraste vale muchísimo porque hace visible el verdadero valor de combinar ambos mecanismos.

---

## Paso 7 · Entender qué cambia realmente con este paso

Conviene leerlo con calma.

Antes:

- el flujo principal tenía una salida sana
- y una salida de error separada
- pero todavía era bastante rígido entre ambos extremos

Ahora, en cambio, además existe una franja intermedia mucho más madura:

- uno o pocos reintentos controlados
- antes del desvío definitivo

Ese cambio parece chico, pero conceptualmente es enorme.

---

## Paso 8 · Pensar por qué esto mejora muchísimo la robustez del sistema

A esta altura del módulo, conviene hacer una lectura muy concreta:

si todo fallo va directo a la DLQ, la arquitectura puede volverse demasiado rígida.

Si todo fallo se reintenta sin límite, la arquitectura se vuelve inestable.

Con retries controlados antes de la DLQ, en cambio:

- el sistema gana elasticidad frente a fallos transitorios,
- pero sigue teniendo una salida firme para casos persistentes.

Ese equilibrio vale muchísimo.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene toda su estrategia de mensajería robusta final resuelta”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una primera capa real de retries controlados antes del desvío final a la DLQ.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase agrega una primera capa de retries controlados antes de la DLQ en NovaMarket.

Ya no estamos solo publicando, consumiendo y separando mensajes fallidos.  
Ahora también estamos haciendo que el sistema tolere mejor ciertos fallos transitorios del lado consumidor sin perder la disciplina de aislar los casos persistentemente problemáticos.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos todavía este subbloque con un checkpoint fuerte,
- ni decidimos aún si seguir profundizando eventos o pasar al siguiente gran bloque del roadmap.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que NovaMarket no reaccione de forma demasiado rígida frente a ciertos fallos del lado consumidor antes del desvío final a la DLQ.**

---

## Errores comunes en esta etapa

### 1. Pensar que retry y DLQ se excluyen
En realidad se complementan muchísimo.

### 2. Reintentar demasiadas veces demasiado pronto
Eso puede empeorar mucho el sistema.

### 3. No construir un fallo controlado que muestre recuperación
Entonces se pierde el valor didáctico del cambio.

### 4. Reducir el paso a “ahora intenta otra vez”
El valor real está en la nueva franja intermedia entre flujo sano y desvío final.

### 5. Creer que esto ya cierra toda la confiabilidad de mensajería
Todavía puede profundizarse bastante más.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- el consumo de `OrderCreated` ya tiene retries controlados,
- algunos fallos transitorios ya pueden recuperarse sin ir a la DLQ,
- y NovaMarket ya dio un primer paso serio hacia una mensajería asíncrona más robusta y más flexible.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- la política de retry ya existe,
- entendés cuándo un mensaje se recupera y cuándo termina derivado a la DLQ,
- ves la nueva elasticidad que gana el sistema,
- y sentís que NovaMarket ya dejó de tener una mensajería binaria para empezar a sostener una mensajería más madura frente a fallos.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta nueva capa del módulo 13.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de retries controlados antes de decidir cómo seguir profundizando mensajería basada en eventos dentro de NovaMarket.

---

## Cierre

En esta clase agregamos una primera capa de retries controlados antes de la DLQ en NovaMarket.

Con eso, el proyecto deja de tratar los fallos del consumidor como un problema demasiado rígido entre éxito inmediato o desvío final y empieza a sostener una forma mucho más flexible, mucho más robusta y mucho más madura de manejar errores transitorios en su arquitectura basada en eventos.
