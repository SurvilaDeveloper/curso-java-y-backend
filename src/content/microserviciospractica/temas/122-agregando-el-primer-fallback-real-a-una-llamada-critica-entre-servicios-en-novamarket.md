---
title: "Agregando el primer fallback real a una llamada crítica entre servicios en NovaMarket"
description: "Siguiente paso práctico del módulo 11. Incorporación del primer fallback real sobre una llamada entre servicios para responder de forma controlada cuando la operación principal no puede completarse."
order: 122
module: "Módulo 11 · Resiliencia y tolerancia a fallos"
level: "intermedio"
draft: false
---

# Agregando el primer fallback real a una llamada crítica entre servicios en NovaMarket

En la clase anterior dejamos algo bastante claro:

- timeout, retry y circuit breaker ya ayudan a contener y limitar el daño,
- pero todavía faltaba otra pieza muy importante,
- decidir qué respuesta damos cuando la operación principal sigue sin poder completarse de forma normal.

Ahora toca el paso concreto:

**agregar el primer fallback real a una llamada crítica entre servicios en NovaMarket.**

Ese es el objetivo de esta clase.

Porque una cosa es:

- cortar espera,
- reintentar una vez,
- y dejar de insistir cuando la evidencia de degradación ya es suficiente.

Y otra bastante distinta es:

- responder de una forma útil, controlada y explícita cuando todo eso aun así no permite completar la operación principal.

Ese es exactamente el tipo de comportamiento que vamos a introducir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregado un primer fallback real sobre la llamada crítica del laboratorio,
- mucho más clara la diferencia entre protegerse del fallo y responder mejor frente al fallo,
- visible una primera forma de degradación controlada dentro de NovaMarket,
- y el sistema mejor preparado para seguir profundizando resiliencia o pasar al siguiente gran bloque del roadmap.

La meta de hoy no es todavía diseñar todos los fallbacks del sistema.  
La meta es mucho más concreta: **darle al flujo crítico una salida controlada y comprensible cuando la llamada principal no puede resolverse normalmente**.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe un laboratorio real de degradación entre `order-service` e `inventory-service`,
- la llamada crítica ya tiene timeout,
- ya existe retry controlado,
- y además ya existe un primer circuit breaker sobre esa dependencia.

Eso significa que el problema ya no es si el sistema sabe detectar y contener degradación.  
Ahora la pregunta útil es otra:

- **qué respuesta concreta dejamos disponible cuando la operación principal sigue sin poder completarse**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- definir una respuesta degradada razonable para el flujo,
- asociarla a la llamada crítica,
- volver a ejecutar el laboratorio,
- observar cómo cambia la salida del sistema,
- y dejar lista una base mucho más madura para cerrar este tramo de resiliencia.

---

## Qué tipo de fallback conviene elegir primero

A esta altura del curso, no conviene elegir algo demasiado sofisticado.

Lo más sano es una respuesta:

- clara,
- controlada,
- honesta,
- y visible.

Por ejemplo, en el caso de `order-service`, podríamos devolver algo como:

- “no se pudo validar stock en este momento”
- o una respuesta de negocio degradada que deje explícito que la verificación no fue posible.

No hace falta todavía fingir una operación exitosa ni inventar datos.

Ese criterio importa muchísimo.

---

## Paso 1 · Ubicar la operación que necesita fallback

Seguimos con el mismo escenario:

- `order-service` consulta a `inventory-service`
- y esa operación puede fallar aun después de timeout, retry y breaker

Ese es exactamente el punto donde el fallback ya tiene sentido.

Lo importante es que el fallback no está reemplazando toda la lógica del servicio.  
Está cubriendo una llamada crítica específica cuando el camino normal ya no se pudo completar.

---

## Paso 2 · Definir una salida degradada razonable

Una opción muy didáctica podría ser devolver una respuesta explícita y controlada.

Por ejemplo, algo conceptualmente así:

```java
public InventoryResponse inventoryFallback(Long productId, Throwable ex) {
    return new InventoryResponse(
            productId,
            false,
            "stock-unavailable-temporarily"
    );
}
```

No importa todavía si tu DTO real tiene exactamente esa firma.

La idea central es esta:

- en vez de dejar que todo explote de forma poco clara,
- devolvemos una respuesta degradada que refleja honestamente que la verificación principal no pudo completarse.

Ese es uno de los corazones prácticos de toda la clase.

---

## Paso 3 · Conectar el fallback a la llamada protegida

Si ya venías usando anotaciones o una integración como la de la clase anterior, podrías dejar algo conceptualmente así:

```java
@CircuitBreaker(name = "inventoryServiceCircuitBreaker", fallbackMethod = "inventoryFallback")
public InventoryResponse fetchInventory(Long productId) {
    return webClient
            .get()
            .uri("/inventory/{productId}", productId)
            .retrieve()
            .bodyToMono(InventoryResponse.class)
            .timeout(Duration.ofSeconds(2))
            .retry(1)
            .block();
}
```

Y después sumar el método fallback asociado.

La idea no es forzar una única forma exacta de implementación.

Lo importante es que:

- la llamada crítica ya tiene una salida alternativa clara,
- conectada al mismo punto donde el flujo principal deja de poder completarse normalmente.

---

## Paso 4 · Entender qué cambia realmente con este paso

Conviene leerlo con calma.

Antes:

- el sistema detectaba el fallo,
- lo cortaba,
- y dejaba más visible que algo salió mal.

Ahora, en cambio, además puede:

- responder de una forma controlada,
- devolver una salida degradada,
- y dejar el flujo en un estado más comprensible que una simple ruptura abrupta.

Ese cambio parece chico, pero conceptualmente es enorme.

---

## Paso 5 · Volver a ejecutar el laboratorio

Ahora repetí el mismo escenario donde `inventory-service` sigue lenta o sigue degradada.

Lo importante es observar qué devuelve `order-service` cuando la operación principal ya no puede completarse normalmente.

Este paso es central porque convierte fallback en algo visible y no solo en una idea de diseño.

---

## Paso 6 · Observar el nuevo comportamiento

Lo que queremos ver ahora no es solo “falló distinto”.

Queremos leer algo más interesante:

- el sistema sigue reconociendo que la dependencia está mal,
- pero ya no devuelve una salida completamente descontrolada,
- y en su lugar entrega una respuesta más explícita, más acotada y más fácil de procesar por el resto del flujo.

Ese cambio importa muchísimo.

---

## Paso 7 · Entender por qué esto no significa “ocultar el error”

Este punto vale muchísimo.

Fallback no debería convertirse en una trampa para fingir normalidad.

Lo valioso de un fallback bien pensado es otra cosa:

- reconocer el problema,
- evitar que el flujo explote de forma caótica,
- y responder de una manera más útil y más controlada.

Ese matiz es exactamente lo que diferencia degradación controlada de maquillaje del error.

---

## Paso 8 · Pensar por qué esto mejora mucho al sistema

A esta altura del módulo, conviene hacer una lectura muy concreta:

si el sistema solo corta o falla, ya mejora respecto del caos inicial.

Pero si además puede responder de una forma degradada pero comprensible, entonces gana una nueva madurez:

- no solo resiste mejor,
- también se comunica mejor consigo mismo y con quien consume la operación.

Ese cambio vale muchísimo.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene toda su estrategia de fallback resuelta”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene un primer fallback real sobre una llamada crítica y una primera forma visible de degradación controlada dentro del laboratorio.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase agrega el primer fallback real a una llamada crítica entre servicios en NovaMarket.

Ya no estamos solo detectando, limitando o cortando fallos.  
Ahora también estamos haciendo que el sistema responda de una forma más útil y más controlada cuando el camino principal ya no puede completarse normalmente.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos todavía este subbloque con un checkpoint fuerte,
- ni decidimos aún si seguimos profundizando resiliencia o si ya pasamos al siguiente gran bloque del roadmap.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que NovaMarket no solo se proteja mejor del fallo, sino que también responda mejor cuando el fallo persiste.**

---

## Errores comunes en esta etapa

### 1. Usar fallback para fingir que todo salió bien
Eso vuelve opaco el comportamiento del sistema.

### 2. Devolver cualquier dato degradado sin criterio
La salida tiene que ser clara y honesta.

### 3. Pensar que fallback reemplaza timeout, retry o breaker
En realidad se apoya en lo que ya construimos antes.

### 4. No mantener el mismo laboratorio para comparar el cambio
La continuidad del escenario importa muchísimo.

### 5. Creer que esto ya cierra toda la resiliencia
Todavía pueden venir más refinamientos.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- la llamada crítica ya tiene un fallback real,
- el sistema responde de forma más controlada cuando la operación principal falla,
- y NovaMarket ya dio un primer paso serio hacia degradación controlada dentro de su arquitectura.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el fallback ya existe,
- entendés qué respuesta alternativa está dando el sistema,
- ves que el comportamiento ya no es simplemente “explota o no explota”,
- y sentís que NovaMarket ya ganó una nueva capa concreta de madurez desde respuesta degradada pero controlada.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar este nuevo subbloque del módulo 11.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de fallback y degradación controlada antes de decidir si seguimos profundizando resiliencia o si ya tiene más sentido pasar al siguiente gran bloque del roadmap rehecho.

---

## Cierre

En esta clase agregamos el primer fallback real a una llamada crítica entre servicios en NovaMarket.

Con eso, el proyecto deja de trabajar la resiliencia solo desde espera limitada, reintento o corte de llamadas y empieza a sostener una forma mucho más útil, mucho más honesta y mucho más madura de responder cuando una dependencia sigue sin poder completar la operación principal.
