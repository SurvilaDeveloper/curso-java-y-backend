---
title: "Agregando el primer retry controlado a una llamada crítica entre servicios en NovaMarket"
description: "Siguiente paso práctico del módulo 11. Incorporación del primer retry controlado sobre una llamada entre servicios para tolerar fallos transitorios sin insistencia ciega."
order: 116
module: "Módulo 11 · Resiliencia y tolerancia a fallos"
level: "intermedio"
draft: false
---

# Agregando el primer retry controlado a una llamada crítica entre servicios en NovaMarket

En la clase anterior dejamos algo bastante claro:

- timeout no resuelve todo,
- a veces un fallo puntual puede merecer una segunda oportunidad,
- y retry puede aportar valor siempre que se use con límites y criterio.

Ahora toca el paso concreto:

**agregar el primer retry controlado a una llamada crítica entre servicios en NovaMarket.**

Ese es el objetivo de esta clase.

Porque una cosa es decir:

- “si falla, corto rápido”.

Y otra bastante distinta es decir:

- “si falla, corto rápido, pero además decido si vale la pena intentar una vez más antes de dar la operación por perdida”.

Ese es exactamente el tipo de comportamiento que vamos a introducir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregado un primer retry real sobre la llamada crítica del escenario,
- mucho más clara la diferencia entre insistencia ciega y reintento controlado,
- visible el cambio de comportamiento del sistema frente a fallos transitorios,
- y NovaMarket mejor preparado para pasar después a circuit breaker con una base mucho más madura.

La meta de hoy no es todavía cortar llamadas repetidamente fallidas con un breaker.  
La meta es mucho más concreta: **darle al sistema una segunda oportunidad pequeña, visible y controlada frente a ciertos fallos puntuales**.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe un escenario real de lentitud entre `order-service` e `inventory-service`,
- la llamada crítica ya tiene timeout,
- y el módulo ya dejó claro que ahora conviene evaluar si una nueva oportunidad puede ayudar en ciertos casos.

Eso significa que el problema ya no es si limitar la espera era necesario.  
Ahora la pregunta útil es otra:

- **cómo reintentar sin volver ingenuo al sistema**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- seguir usando la misma llamada crítica entre servicios,
- agregar un retry pequeño y controlado,
- volver a ejecutar el escenario del laboratorio,
- observar el nuevo comportamiento,
- y leer qué mejora real aporta este patrón y qué límites sigue teniendo.

---

## Qué llamada conviene seguir usando

A esta altura del curso, conviene seguir exactamente con el mismo escenario:

- `order-service`
- consultando a
- `inventory-service`

Eso importa muchísimo porque nos permite comparar con claridad tres etapas del mismo flujo:

1. antes de timeout
2. con timeout
3. con timeout + retry

Esa continuidad vuelve al bloque mucho más legible.

---

## Qué significa “retry controlado” acá

Para esta etapa del curso, una forma útil de pensarlo es esta:

**retry controlado significa volver a intentar una operación fallida una cantidad pequeña de veces, con reglas claras y sin insistir indefinidamente.**

Esa idea es central.

No queremos algo como:

- reintentar siempre
- ni reintentar muchas veces
- ni convertir una dependencia degradada en una dependencia todavía más golpeada

Queremos algo mucho más sano:

- uno o pocos intentos,
- con criterio,
- y observando bien qué mejora y qué riesgo introduce.

---

## Paso 1 · Ubicar la llamada con timeout

Supongamos que hoy tenemos algo como esto en `order-service`:

```java
InventoryResponse inventory = webClient
        .get()
        .uri("/inventory/{productId}", productId)
        .retrieve()
        .bodyToMono(InventoryResponse.class)
        .timeout(Duration.ofSeconds(2))
        .block();
```

Esto ya está muchísimo mejor que la versión inicial.

Pero ahora queremos darle una nueva capacidad:

- después del fallo por timeout o por un error transitorio compatible,
- reintentar una vez más.

---

## Paso 2 · Agregar un retry simple y visible

Si seguimos con una versión didáctica usando Reactor, una opción razonable puede ser algo como:

```java
InventoryResponse inventory = webClient
        .get()
        .uri("/inventory/{productId}", productId)
        .retrieve()
        .bodyToMono(InventoryResponse.class)
        .timeout(Duration.ofSeconds(2))
        .retry(1)
        .block();
```

No hace falta todavía que esta sea la estrategia final del proyecto.

La meta es mucho más concreta:

- introducir la idea de una segunda oportunidad,
- pequeña,
- visible,
- y muy fácil de comparar con el comportamiento anterior.

Ese matiz es muy importante.

---

## Paso 3 · Entender qué cambia realmente con este paso

Conviene leerlo con calma.

Antes:

- la llamada fallaba una vez
- y ahí terminaba la historia

Ahora:

- si falla en el primer intento,
- el sistema da una oportunidad adicional antes de declarar fracaso final

Ese cambio parece chico, pero conceptualmente es enorme, porque el sistema deja de reaccionar de forma binaria y empieza a ensayar una pequeña elasticidad frente a fallos puntuales.

---

## Paso 4 · Pensar por qué conviene empezar con un solo reintento

Este punto importa muchísimo.

Podríamos querer probar más intentos, pero en esta etapa conviene mucho más mantener algo como:

- `retry(1)`

¿Por qué?

Porque:

- es fácil de observar,
- limita el riesgo de castigar más a la dependencia,
- y deja muy visible el contraste con el comportamiento anterior.

Ese criterio hace que el bloque siga siendo claro y no se vuelva una maraña de ajustes prematuros.

---

## Paso 5 · Volver a ejecutar el laboratorio

Ahora repetí el mismo escenario:

- mantené la lentitud o el fallo controlado en `inventory-service`
- y observá cómo reacciona `order-service`

La idea es comparar:

- si el segundo intento ayuda cuando el fallo era transitorio,
- o si el sistema simplemente tarda más en fallar cuando el problema persiste.

Ese contraste es el corazón práctico de la clase.

---

## Paso 6 · Observar cuándo retry ayuda de verdad

A esta altura del laboratorio, retry puede mostrar valor sobre todo cuando:

- la primera llamada falla por algo breve o inestable,
- pero la segunda logra atravesar el problema

Ahí el sistema gana algo importante:

- no falla tan rápido ante una perturbación pequeña,
- y puede recuperarse solo en ciertos casos sin intervención externa.

Ese es el costado más fuerte del patrón.

---

## Paso 7 · Observar cuándo retry no ayuda

Este punto vale muchísimo.

Si `inventory-service` sigue lenta o sigue degradada de forma persistente, entonces retry puede no ayudar en absoluto.

Incluso puede hacer algo menos deseable:

- alargar un poco el tiempo hasta el fallo final,
- o volver a golpear una dependencia que ya estaba mal.

Ese matiz es central, porque es exactamente lo que va a justificar el siguiente paso del bloque: circuit breaker.

---

## Paso 8 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, el sistema ya no esperaba indefinidamente.

Ahora, en cambio, además puede:

- darle una nueva oportunidad corta y controlada a una operación que falló

Eso hace que NovaMarket empiece a comportarse de una forma bastante más flexible frente a ciertos fallos transitorios.

Ese salto vale muchísimo.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya resolvió la resiliencia de este flujo”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene timeout y un primer retry controlado sobre una llamada crítica, pero todavía necesita una respuesta mejor cuando la degradación deja de ser transitoria.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase agrega el primer retry controlado a una llamada crítica entre servicios en NovaMarket.

Ya no estamos solo limitando la espera.  
Ahora también estamos haciendo que el sistema pueda conceder una pequeña segunda oportunidad a ciertos fallos, sin caer todavía en insistencias ciegas o excesivas.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- abrimos todavía circuit breaker,
- ni consolidamos aún este subbloque con un checkpoint fuerte.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que NovaMarket no reaccione de forma demasiado rígida frente a ciertos fallos puntuales.**

---

## Errores comunes en esta etapa

### 1. Pensar que retry siempre es mejor que fallar rápido
No. Depende mucho del tipo de problema.

### 2. Reintentar demasiadas veces demasiado pronto
Eso puede empeorar una degradación persistente.

### 3. No mantener el mismo laboratorio para comparar el cambio
La continuidad del escenario importa muchísimo.

### 4. Reducir el cambio a “repite una vez más”
El valor real está en cómo cambia la postura del sistema frente a fallos transitorios.

### 5. Creer que timeout + retry ya cierra todo el problema
Todavía falta una respuesta más fuerte para fallos repetidos o persistentes.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- la llamada crítica ya tiene retry controlado,
- el sistema reacciona distinto frente a ciertos fallos transitorios,
- y NovaMarket ya dio un primer paso serio hacia una resiliencia un poco más flexible y un poco más madura.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- la llamada ya no solo tiene timeout, sino también retry,
- entendés cuándo ese retry ayuda y cuándo no,
- ves que el sistema ganó elasticidad, pero todavía no una protección completa,
- y sentís que ya está bastante claro por qué el siguiente gran paso del bloque va a ser circuit breaker.

Si eso está bien, ya podemos pasar a consolidar esta nueva capa de resiliencia y abrir el siguiente frente.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de retry controlado antes de abrir el bloque de circuit breaker como respuesta a fallos repetidos o persistentes.

---

## Cierre

En esta clase agregamos el primer retry controlado a una llamada crítica entre servicios en NovaMarket.

Con eso, el proyecto deja de reaccionar de forma demasiado rígida frente a ciertos fallos puntuales y empieza a sostener una forma de resiliencia un poco más elástica, un poco más inteligente y mucho más conectada con el comportamiento real del sistema distribuido.
