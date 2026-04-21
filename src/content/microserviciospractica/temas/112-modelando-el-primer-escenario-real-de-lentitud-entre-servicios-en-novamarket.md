---
title: "Modelando el primer escenario real de lentitud entre servicios en NovaMarket"
description: "Primer paso práctico del módulo 11. Construcción de un escenario realista de lentitud o degradación entre servicios para que el bloque de resiliencia parta de un problema concreto del sistema."
order: 112
module: "Módulo 11 · Resiliencia y tolerancia a fallos"
level: "intermedio"
draft: false
---

# Modelando el primer escenario real de lentitud entre servicios en NovaMarket

En la clase anterior abrimos el nuevo gran bloque del curso rehecho:

- resiliencia,
- tolerancia a fallos,
- timeout,
- retry,
- y circuit breaker.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer algo muy importante antes de empezar a meter herramientas o configuraciones:

**construir un problema real y visible.**

Porque una cosa es decir:

- “hay que agregar timeout”
- o
- “hay que pensar en circuit breaker”.

Y otra bastante distinta es mostrar:

- qué parte del sistema se vuelve lenta,
- cómo esa lentitud se propaga,
- y por qué el comportamiento actual ya no es razonable.

Ese es exactamente el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- elegido un escenario concreto de lentitud o degradación,
- mucho más clara la dependencia real entre dos piezas del sistema,
- visible por qué este bloque no arranca como teoría aislada sino como respuesta a un problema concreto,
- y NovaMarket mejor preparado para introducir timeout en la próxima clase.

La meta de hoy no es todavía resolver la lentitud.  
La meta es mucho más concreta: **hacerla visible, reproducible y didácticamente útil**.

---

## Estado de partida

Partimos de un sistema donde ya:

- el entorno está integrado en Compose,
- existe `api-gateway`,
- existe seguridad real con Keycloak,
- y además ya hay servicios de negocio que pueden depender unos de otros para completar un flujo importante.

Eso significa que ya estamos en el punto exacto donde tiene sentido dejar de pensar solo en funcionalidades y empezar a pensar también en comportamiento bajo degradación.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir una relación entre servicios que tenga sentido para el dominio,
- convertirla en un escenario de lentitud realista,
- observar cómo impacta en el flujo,
- y dejar listo un problema concreto para que timeout tenga un lugar muy claro en la siguiente clase.

---

## Qué escenario conviene elegir primero

A esta altura del curso, uno de los escenarios más naturales suele ser:

- `order-service` necesita consultar o validar algo en `inventory-service`
- y `inventory-service` empieza a responder demasiado lento

¿Por qué este caso es tan bueno?

Porque:

- toca una relación real entre servicios,
- está muy cerca del flujo central de compra,
- y permite mostrar muy bien por qué una espera excesiva puede arruinar el comportamiento del sistema.

Ese escenario es excelente para inaugurar el bloque.

---

## Qué problema queremos observar exactamente

No queremos todavía “caídas totales” del sistema.  
Queremos empezar con algo muy didáctico:

- una dependencia sigue viva,
- pero responde demasiado lento.

Eso es muy útil porque revela un problema muy real de sistemas distribuidos:

- a veces la dependencia no está muerta,
- pero igual está degradando todo el flujo.

Y eso es exactamente el tipo de situación donde timeout empieza a tener muchísimo sentido.

---

## Paso 1 · Ubicar la llamada crítica entre servicios

Tomemos un caso razonable como este:

- `order-service` recibe una intención de compra,
- necesita consultar disponibilidad o validar stock contra `inventory-service`,
- y hasta que esa llamada no responde, el flujo queda esperando.

Ese detalle importa muchísimo porque hace visible que el problema no está solo “en inventario”.

El problema también aparece:

- en órdenes,
- en la experiencia de usuario,
- y en cualquier componente que espere esa respuesta.

---

## Paso 2 · Simular lentitud en `inventory-service`

A esta altura del curso, una forma simple y muy didáctica de hacerlo puede ser introducir artificialmente una demora en un endpoint de inventario.

Por ejemplo, algo como:

```java
@GetMapping("/inventory/{productId}")
public InventoryResponse getInventory(@PathVariable Long productId) throws InterruptedException {
    Thread.sleep(8000);
    return inventoryService.getInventory(productId);
}
```

No estamos diciendo que esta sea la solución final ni una práctica para producción.

La idea es otra:

- hacer visible el problema,
- controlar la demora,
- y tener un escenario reproducible para el resto del bloque.

Ese matiz es muy importante.

---

## Paso 3 · Entender por qué una demora artificial sirve mucho acá

Este punto importa muchísimo.

A veces alguien ve un `sleep` y piensa que es una mala práctica.  
Y efectivamente lo sería si lo tratáramos como implementación real del sistema.

Pero en esta etapa estamos usando esa demora como herramienta didáctica.

¿Por qué?

Porque nos permite construir un laboratorio muy claro:

- sabemos qué servicio se vuelve lento,
- sabemos cuánto tarda,
- y podemos observar el efecto en el resto del flujo.

Eso vuelve al bloque muchísimo más entendible.

---

## Paso 4 · Probar el flujo desde `order-service`

Ahora conviene ejecutar algo que dependa de esa consulta lenta.

Por ejemplo:

- una creación de orden,
- o cualquier endpoint de `order-service` que requiera validar stock antes de continuar.

Lo importante es observar algo muy concreto:

- el problema de lentitud en `inventory-service`
- empieza a sentirse en `order-service`

Ese paso es central porque deja visible la propagación del problema entre servicios.

---

## Paso 5 · Observar el síntoma real

Lo que queremos ver acá no es solo “tarda más”.

Queremos empezar a pensar como arquitectura.

Por ejemplo:

- el usuario espera demasiado,
- el hilo o la request quedan ocupados más tiempo,
- y una dependencia lenta empieza a degradar a otra pieza que quizá, por sí sola, estaba bien.

Ese cambio de mirada es uno de los más importantes de toda la clase.

---

## Paso 6 · Entender por qué esto ya justifica hablar de timeout

Este punto vale muchísimo.

Hasta ahora, timeout era una idea razonable del roadmap.

Pero ahora ya tenemos algo mucho más fuerte:

- un caso concreto,
- visible,
- reproducible,
- y directamente conectado con una dependencia real del sistema.

Eso significa que timeout ya no entra como “tema de teoría”.  
Entra como respuesta natural a un problema real que acabamos de observar.

Ese cambio es exactamente el corazón de la clase.

---

## Paso 7 · Pensar qué pasaría si varias requests hicieran lo mismo

A esta altura del módulo, conviene hacer una lectura simple pero poderosa:

si una sola request tarda demasiado, ya hay un problema de experiencia.

Pero si varias empiezan a acumularse esperando una dependencia lenta, el problema puede crecer mucho más.

No hace falta todavía abrir toda la teoría de saturación.  
La meta es más concreta:

- empezar a sentir que “esperar sin límite” no escala bien en un sistema real.

Ese matiz prepara muchísimo la siguiente clase.

---

## Paso 8 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene resiliencia”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene un primer escenario real y útil de lentitud entre servicios sobre el que vamos a empezar a trabajar resiliencia.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase modela el primer escenario real de lentitud entre servicios en NovaMarket.

Ya no estamos hablando de timeout, retry o circuit breaker como conceptos flotando en el aire.  
Ahora también estamos dejando explícito el problema concreto del sistema que esas técnicas vienen a resolver.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- aplicamos todavía un timeout real,
- ni cortamos la espera,
- ni construimos aún retry o circuit breaker.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**darle al bloque de resiliencia un problema real y visible desde el cual empezar a trabajar.**

---

## Errores comunes en esta etapa

### 1. Querer hablar de resiliencia sin un escenario concreto
Eso vuelve abstracto todo el bloque.

### 2. Empezar directamente por circuit breaker
Conviene ver antes un problema simple de espera excesiva.

### 3. Pensar que si un servicio sigue respondiendo entonces no hay problema
La lentitud también puede degradar muchísimo al sistema.

### 4. Reducir el problema a “anda lento”
Lo importante es cómo esa lentitud impacta en otras piezas.

### 5. Querer resolver todo en la misma clase
Acá lo importante es hacer visible el problema.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder señalar un escenario concreto donde la lentitud de `inventory-service` afecta a `order-service` y explicar por qué ese problema justifica de forma muy clara el siguiente paso del bloque: introducir timeout.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- elegiste una dependencia real del sistema,
- lograste hacer visible la lentitud,
- viste cómo impacta en otra pieza del flujo,
- y sentís que timeout ya no es teoría, sino una respuesta natural a un problema muy concreto.

Si eso está bien, ya podemos pasar a introducir el primer timeout real dentro de NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a agregar un timeout real a una llamada crítica entre servicios para que NovaMarket deje de esperar indefinidamente una dependencia lenta.

---

## Cierre

En esta clase modelamos el primer escenario real de lentitud entre servicios en NovaMarket.

Con eso, el bloque de resiliencia deja de arrancar desde teoría aislada y empieza a construirse sobre un problema concreto, visible y directamente conectado con el flujo real del sistema que ya venimos desarrollando.
