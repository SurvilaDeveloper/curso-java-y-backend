---
title: "Agregando el primer timeout real a una llamada crítica entre servicios en NovaMarket"
description: "Siguiente paso práctico del módulo 11. Incorporación del primer timeout real sobre una llamada entre servicios para evitar esperas excesivas frente a una dependencia lenta."
order: 113
module: "Módulo 11 · Resiliencia y tolerancia a fallos"
level: "intermedio"
draft: false
---

# Agregando el primer timeout real a una llamada crítica entre servicios en NovaMarket

En la clase anterior hicimos algo muy importante para este nuevo bloque:

- elegimos un escenario concreto de lentitud,
- lo hicimos visible dentro del sistema,
- y mostramos cómo una dependencia lenta empieza a degradar un flujo real de negocio.

Eso ya tiene muchísimo valor.

Pero ahora toca el siguiente paso natural:

**agregar el primer timeout real a una llamada crítica entre servicios en NovaMarket.**

Ese es el objetivo de esta clase.

Porque una cosa es observar que el sistema espera demasiado.

Y otra bastante distinta es decir:

- “hasta acá esperamos”
- y
- “si la dependencia no responde a tiempo, esta espera ya no es razonable para el sistema”.

Ese es exactamente el tipo de decisión que vamos a introducir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregado un primer timeout real sobre una llamada crítica entre servicios,
- mucho más clara la diferencia entre esperar indefinidamente y esperar con límite,
- visible el cambio de comportamiento del flujo bajo degradación,
- y NovaMarket mejor preparado para pasar después a retry o circuit breaker con una base mucho más sana.

La meta de hoy no es todavía cerrar toda la resiliencia del sistema.  
La meta es mucho más concreta: **hacer que NovaMarket deje de esperar indefinidamente una dependencia que se vuelve lenta**.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe una dependencia real entre servicios,
- logramos hacer visible una degradación por lentitud,
- y el módulo ya dejó claro que esa espera excesiva ya no es aceptable como comportamiento del sistema.

Eso significa que el problema ya no es detectar la lentitud.  
Ahora la pregunta útil es otra:

- **cómo ponemos un límite razonable a esa espera**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- ubicar la llamada crítica entre servicios,
- agregar un timeout real del lado del consumidor,
- volver a probar el escenario de lentitud,
- observar el nuevo comportamiento,
- y dejar lista una base mucho más madura para el resto del bloque de resiliencia.

---

## Qué llamada conviene intervenir primero

A esta altura del curso, seguimos con el mismo caso natural:

- `order-service` consulta algo crítico en `inventory-service`

¿Por qué conviene mantener el mismo escenario?

Porque eso nos permite comparar con mucha claridad:

- el comportamiento antes del timeout
- contra
- el comportamiento después del timeout

Esa continuidad importa muchísimo.

---

## Qué significa “poner un timeout” acá

Para esta etapa del curso, una forma útil de pensarlo es esta:

**poner un timeout significa definir un tiempo máximo razonable de espera para una operación remota.**

Si la respuesta no llega dentro de ese tiempo:

- la operación se considera fallida,
- y el sistema puede reaccionar de otra manera en vez de seguir esperando sin límite.

Ese cambio es uno de los más importantes de todo el bloque.

---

## Paso 1 · Ubicar el cliente que usa `order-service`

Supongamos que `order-service` usa algo como:

- `WebClient`
- o un cliente HTTP equivalente

para consultar a `inventory-service`.

Lo importante es ubicar el punto real donde una pieza del sistema está esperando a otra.

Ese es exactamente el lugar donde timeout tiene sentido.

---

## Paso 2 · Agregar un timeout a la llamada

Si estás usando `WebClient`, una forma muy didáctica de introducirlo puede ser algo como:

```java
InventoryResponse inventory = webClient
        .get()
        .uri("/inventory/{productId}", productId)
        .retrieve()
        .bodyToMono(InventoryResponse.class)
        .timeout(Duration.ofSeconds(2))
        .block();
```

No hace falta que esta sea la estrategia final de toda la aplicación.  
La meta es mucho más concreta:

- introducir un límite real de espera,
- visible,
- fácil de probar,
- y directamente conectado con el problema que acabamos de modelar.

Ese matiz es muy importante.

---

## Paso 3 · Entender qué hace realmente este cambio

Conviene leerlo con calma.

Antes, el flujo seguía esperando mientras la dependencia tardara.

Ahora, en cambio, existe una decisión explícita:

- si en 2 segundos no hay respuesta,
- el sistema deja de esperar y considera que ese comportamiento ya no es razonable.

Ese cambio parece chico, pero cambia muchísimo la postura del sistema frente a fallos de lentitud.

---

## Paso 4 · Volver a ejecutar el escenario lento

Ahora repetí exactamente el mismo escenario de la clase anterior:

- `inventory-service` sigue respondiendo lento
- y `order-service` vuelve a consultar

La diferencia importante es que ahora la espera ya no debería extenderse tanto como antes.

Este paso es central porque convierte la teoría de timeout en una reacción visible del sistema.

---

## Paso 5 · Observar el nuevo síntoma

Lo que queremos ver ahora no es solo “falló más rápido”.

Queremos leer algo más interesante:

- el sistema dejó de quedar colgado esperando indefinidamente,
- y empezó a reconocer que una dependencia lenta no merece consumir más tiempo del razonable.

Ese cambio importa muchísimo porque inaugura una nueva madurez operativa del sistema.

---

## Paso 6 · Entender que timeout no “arregla” la dependencia lenta

Este punto vale muchísimo.

Agregar timeout no hace que `inventory-service` deje de ser lenta.

Lo que cambia es otra cosa:

- **cómo reacciona `order-service` frente a esa lentitud**

Ese matiz es central, porque nos enseña algo muy importante sobre resiliencia:

- muchas veces no controlamos el fallo,
- pero sí podemos controlar cómo lo soportamos.

Ese aprendizaje atraviesa todo el bloque.

---

## Paso 7 · Pensar por qué esto ya mejora mucho al sistema

A esta altura del módulo, conviene hacer una lectura muy concreta:

si una dependencia está lenta y yo espero indefinidamente, el problema puede crecer y arrastrar más partes del sistema.

Con timeout, en cambio:

- la espera se acota,
- el fallo se reconoce antes,
- y el sistema deja de quedarse pasivamente atrapado en una dependencia degradada.

Ese cambio vale muchísimo.

---

## Paso 8 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya resolvió la resiliencia”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una primera capa real de timeout sobre una llamada crítica entre servicios.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase agrega el primer timeout real a una llamada crítica entre servicios en NovaMarket.

Ya no estamos solo observando una dependencia lenta.  
Ahora también estamos haciendo que el sistema reaccione de una forma bastante más madura frente a esa lentitud, dejando de esperar sin límite y empezando a poner una frontera razonable.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- decidimos todavía si conviene reintentar,
- ni cortamos todavía el flujo con circuit breaker,
- ni consolidamos aún este subbloque con un checkpoint fuerte.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que NovaMarket deje de esperar indefinidamente una dependencia degradada.**

---

## Errores comunes en esta etapa

### 1. Pensar que timeout arregla el servicio lento
No. Cambia cómo reacciona el consumidor.

### 2. Poner un timeout sin haber modelado antes el problema
Eso vuelve abstracta la mejora.

### 3. Elegir un tiempo sin criterio
En esta etapa lo importante es que sea visible y razonable para el laboratorio.

### 4. Reducir el cambio a que “falla más rápido”
El valor real está en acotar la degradación.

### 5. Querer meter retry o circuit breaker al mismo tiempo
Conviene consolidar primero timeout.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- una llamada crítica ya tiene timeout real,
- el sistema dejó de esperar indefinidamente en ese punto,
- y NovaMarket ya dio un primer paso serio hacia una reacción más madura frente a la lentitud entre servicios.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el escenario lento sigue existiendo,
- la llamada ahora tiene un límite explícito,
- el comportamiento cambió de forma visible,
- y sentís que timeout ya dejó de ser teoría para convertirse en una respuesta real a un problema concreto del sistema.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta nueva capa de resiliencia.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de timeout controlado en NovaMarket antes de decidir si el siguiente paso natural es retry, fallback o circuit breaker.

---

## Cierre

En esta clase agregamos el primer timeout real a una llamada crítica entre servicios en NovaMarket.

Con eso, el proyecto deja de aceptar esperas indefinidas frente a dependencias lentas y empieza a sostener un comportamiento mucho más razonable, mucho más explícito y mucho más alineado con una arquitectura seria de microservicios.
