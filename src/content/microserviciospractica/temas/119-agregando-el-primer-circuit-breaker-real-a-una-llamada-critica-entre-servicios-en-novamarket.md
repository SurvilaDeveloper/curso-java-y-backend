---
title: "Agregando el primer circuit breaker real a una llamada crítica entre servicios en NovaMarket"
description: "Siguiente paso práctico del módulo 11. Incorporación del primer circuit breaker real sobre una llamada entre servicios para dejar de insistir frente a fallos repetidos o persistentes."
order: 119
module: "Módulo 11 · Resiliencia y tolerancia a fallos"
level: "intermedio"
draft: false
---

# Agregando el primer circuit breaker real a una llamada crítica entre servicios en NovaMarket

En la clase anterior dejamos algo bastante claro:

- timeout pone un límite,
- retry da una pequeña segunda oportunidad,
- pero cuando el fallo deja de ser transitorio y empieza a repetirse, seguir llamando exactamente igual ya no es una respuesta razonable.

Ahora toca el paso concreto:

**agregar el primer circuit breaker real a una llamada crítica entre servicios en NovaMarket.**

Ese es el objetivo de esta clase.

Porque una cosa es decir:

- “voy a esperar menos”
- y
- “voy a intentar una vez más”.

Y otra bastante distinta es decir:

- “si ya tengo suficiente evidencia de que esta dependencia sigue mal, dejo de golpearla temporalmente y protejo al resto del sistema”.

Ese es exactamente el tipo de comportamiento que vamos a introducir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- agregado un primer circuit breaker real sobre la llamada crítica del laboratorio,
- mucho más clara la diferencia entre retry y breaker,
- visible el cambio de comportamiento cuando la dependencia sigue fallando repetidamente,
- y NovaMarket mejor preparado para pensar después en fallback, observabilidad o extensión del patrón a otros puntos del sistema.

La meta de hoy no es todavía diseñar toda la política de resiliencia del proyecto.  
La meta es mucho más concreta: **hacer que NovaMarket deje de insistir automáticamente sobre una dependencia que ya mostró degradación persistente**.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe un escenario real de lentitud o fallo persistente entre `order-service` e `inventory-service`,
- la llamada crítica ya tiene timeout,
- y además ya existe un retry pequeño y controlado.

Eso significa que el problema ya no es si el sistema tiene alguna reacción frente a fallos.  
Ahora la pregunta útil es otra:

- **cómo dejamos de insistir cuando el patrón de error ya se repite lo suficiente como para que seguir llamando de la misma manera sea contraproducente**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir una librería razonable para aplicar el patrón,
- envolver la llamada crítica con un circuit breaker,
- definir una configuración inicial simple,
- volver a ejecutar el laboratorio,
- y observar cómo cambia el comportamiento del sistema cuando la dependencia persiste en fallar.

---

## Qué librería conviene usar primero

A esta altura del curso, una opción muy razonable suele ser **Resilience4j**.

¿Por qué?

Porque:

- está muy difundida en el ecosistema Spring,
- modela muy bien circuit breaker, retry y otros patrones del bloque,
- y permite trabajar con una configuración bastante legible para un curso práctico como NovaMarket.

No hace falta hoy entrar en todo el catálogo de la librería.  
La meta es introducirla de forma clara y útil en un escenario real.

---

## Paso 1 · Agregar la dependencia adecuada

Una base razonable puede ser incorporar la dependencia correspondiente a circuit breaker.

Por ejemplo, algo como:

```xml
<dependency>
    <groupId>io.github.resilience4j</groupId>
    <artifactId>resilience4j-spring-boot3</artifactId>
</dependency>
```

Según cómo tengas armado el servicio, puede variar un poco la combinación exacta de módulos, pero la idea central es esta:

- sumar una pieza real para gestionar el breaker sobre la llamada crítica.

---

## Paso 2 · Elegir un nombre para el breaker

Conviene asignarle un nombre claro y ligado al problema que estamos tratando.

Por ejemplo:

```txt
inventoryServiceCircuitBreaker
```

o un nombre similar.

Esto importa mucho porque después nos ayuda a:

- configurar el patrón,
- observarlo,
- y entender que no estamos rompiendo “el sistema entero”, sino protegiendo una dependencia concreta dentro del flujo.

Ese detalle mejora muchísimo la claridad del bloque.

---

## Paso 3 · Aplicar el breaker a la llamada crítica

Una forma bastante clara de mostrar la idea puede ser usar una anotación o una envoltura programática.

Si vas por una vía didáctica y directa, podrías pensar algo conceptualmente así:

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

No hace falta todavía que esta sea la versión final definitiva de la aplicación.

La idea es otra:

- hacer visible el patrón,
- ligarlo a la llamada crítica,
- y dejar claro qué comportamiento nuevo estamos introduciendo.

Ese matiz es muy importante.

---

## Paso 4 · Entender por qué aparece un fallback en el ejemplo

Este punto vale muchísimo.

Cuando se trabaja con circuit breaker, suele aparecer muy naturalmente la idea de **fallback**.

No siempre significa devolver una respuesta final perfecta.  
A veces simplemente significa:

- cortar mejor,
- responder de una forma más controlada,
- o dejar explícito que la dependencia está degradada.

En esta etapa del curso, no hace falta aún diseñar el fallback ideal del negocio.

Lo importante es ver que el breaker no solo corta llamadas: también necesita una salida razonable para el flujo.

---

## Paso 5 · Definir una configuración inicial simple

No necesitamos todavía una configuración hiper sofisticada.

Lo importante es una primera base clara, por ejemplo:

- una ventana de observación pequeña,
- un porcentaje de fallos a partir del cual el circuito se abre,
- y un tiempo de espera razonable antes de volver a probar.

En propiedades podría verse conceptualmente algo así:

```yaml
resilience4j:
  circuitbreaker:
    instances:
      inventoryServiceCircuitBreaker:
        slidingWindowSize: 5
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
        permittedNumberOfCallsInHalfOpenState: 2
```

No hace falta que esta configuración sea perfecta desde el primer día.

La meta es algo más concreta:

- ver el patrón actuar,
- no discutir todavía afinado fino de producción.

---

## Paso 6 · Volver a ejecutar el laboratorio

Ahora repetí el escenario donde `inventory-service` sigue lenta o sigue fallando.

La idea es observar qué pasa después de varias llamadas problemáticas consecutivas.

Este paso es central porque ahí el bloque cambia de nivel:

- ya no estamos solo viendo una llamada individual,
- estamos viendo cómo el sistema **aprende** del historial reciente de fallos.

Ese salto es uno de los más importantes de toda la clase.

---

## Paso 7 · Observar el nuevo comportamiento

Lo que queremos ver ahora no es solo “falla”.

Queremos leer algo más fuerte:

- al principio, el sistema intenta,
- después acumula evidencia de que la dependencia sigue mal,
- y finalmente deja de seguir golpeándola de la misma manera por un tiempo.

Ese cambio importa muchísimo porque muestra una resiliencia más madura y más protectora.

---

## Paso 8 · Entender qué gana el sistema con el circuito abierto

Este punto vale muchísimo.

Cuando el circuito se abre, el sistema gana varias cosas importantes:

- deja de insistir inútilmente,
- protege a la dependencia degradada,
- protege también al consumidor y a sus recursos,
- y convierte un fallo repetido en una respuesta más controlada y menos destructiva.

Ese cambio es exactamente el corazón del patrón.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene resiliencia completa”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene una primera capa real de circuit breaker sobre una llamada crítica que venía mostrando degradación persistente.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase agrega el primer circuit breaker real a una llamada crítica entre servicios en NovaMarket.

Ya no estamos solo limitando espera o reintentando una vez.  
Ahora también estamos haciendo que el sistema deje de insistir automáticamente cuando ya existe suficiente evidencia de que una dependencia sigue degradada.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos todavía este subbloque con un checkpoint fuerte,
- ni discutimos aún fallback más rico o visibilidad operativa del breaker.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que NovaMarket deje de tratar fallos persistentes como si fueran siempre solo fallos puntuales.**

---

## Errores comunes en esta etapa

### 1. Pensar que circuit breaker es solo “otro retry”
No. Cambia radicalmente cómo responde el sistema frente a fallos repetidos.

### 2. Querer afinar todos los parámetros desde el primer minuto
En esta etapa, lo importante es ver el patrón en acción.

### 3. Meter breaker sin un escenario real de degradación persistente
Eso vuelve artificial todo el bloque.

### 4. No observar el comportamiento tras varias llamadas malas consecutivas
Ese es justamente el corazón del patrón.

### 5. Creer que esto ya resuelve toda la resiliencia
Todavía pueden venir mejoras como fallback más rico y observabilidad.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- la llamada crítica ya está protegida por un circuit breaker,
- el sistema deja de insistir de la misma forma cuando los fallos se repiten,
- y NovaMarket ya dio un primer paso serio hacia resiliencia frente a degradación persistente.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el breaker ya está aplicado,
- entendés cuándo se abre y por qué,
- ves que el comportamiento cambia de forma visible frente a fallos repetidos,
- y sentís que el proyecto ya dejó atrás una resiliencia puramente reactiva para empezar a protegerse de forma más inteligente.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta nueva capa del bloque de resiliencia.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de circuit breaker en NovaMarket antes de decidir cómo seguir con fallback, observabilidad o extensión del patrón a otros flujos.

---

## Cierre

En esta clase agregamos el primer circuit breaker real a una llamada crítica entre servicios en NovaMarket.

Con eso, el proyecto deja de tratar fallos repetidos o persistentes como si fueran simplemente “otra llamada que vale la pena intentar igual” y empieza a sostener una forma mucho más madura, mucho más protectora y mucho más inteligente de reaccionar frente a degradación real del sistema distribuido.
