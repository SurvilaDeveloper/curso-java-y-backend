---
title: "Entendiendo por qué circuit breaker ya tiene sentido en NovaMarket"
description: "Siguiente paso del módulo 11. Comprensión de por qué, después de timeout y retry, ya conviene introducir circuit breaker como respuesta a fallos repetidos o persistentes entre servicios."
order: 118
module: "Módulo 11 · Resiliencia y tolerancia a fallos"
level: "intermedio"
draft: false
---

# Entendiendo por qué circuit breaker ya tiene sentido en NovaMarket

En la clase anterior cerramos otra etapa importante del bloque de resiliencia:

- ya modelamos un escenario real de lentitud entre servicios,
- ya limitamos la espera con timeout,
- y además agregamos un retry pequeño y controlado para tolerar ciertos fallos transitorios.

Eso ya tiene muchísimo valor.

Pero ahora aparece una pregunta muy natural:

**si una dependencia sigue fallando una y otra vez, tiene sentido seguir llamándola cada vez como si nada pasara?**

Ese es el terreno de esta clase.

Porque una cosa es decir:

- “voy a esperar menos”
- y también
- “voy a darle una segunda oportunidad”.

Y otra bastante distinta es decir:

- “si ya tengo evidencia suficiente de que esta dependencia sigue degradada, dejar de golpearla por un tiempo también puede ser una forma de proteger al sistema”.

Ese es exactamente el siguiente problema que conviene abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro qué es un **circuit breaker** en este contexto,
- entendida la diferencia entre timeout, retry y circuit breaker,
- visible por qué este patrón tiene sentido cuando los fallos dejan de ser puntuales para volverse repetidos o persistentes,
- y preparado el terreno para aplicar un primer circuit breaker real en la próxima clase.

La meta de hoy no es todavía implementar toda la configuración del patrón.  
La meta es mucho más concreta: **entender por qué circuit breaker aparece naturalmente después de timeout y retry**.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe una dependencia real entre `order-service` e `inventory-service`,
- la llamada crítica ya tiene timeout,
- y además ya existe una pequeña segunda oportunidad con retry.

Eso significa que el problema ya no es solo cuánto esperar ni si reintentar alguna vez ayuda.  
Ahora la pregunta útil es otra:

- **qué hacemos cuando el fallo deja de ser algo puntual y empieza a repetirse de una forma que ya no justifica seguir insistiendo igual**

Y eso es exactamente lo que vamos a resolver en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué significa circuit breaker dentro de una arquitectura como NovaMarket,
- entender por qué retry no alcanza siempre,
- conectar esta idea con el laboratorio que ya venimos usando,
- y dejar clara la lógica del siguiente paso práctico del bloque.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- el sistema no espera indefinidamente,
- y además puede intentar una vez más cuando el fallo parece transitorio.

Eso fue un gran salto.

Pero a medida que el bloque madura, aparece otra necesidad muy concreta:

**que el sistema reconozca cuándo ya tiene suficiente evidencia de que una dependencia está degradada y deje de seguir empujando llamadas inútiles hacia ella.**

Porque ahora conviene hacerse preguntas como:

- ¿qué pasa si `inventory-service` falla repetidamente?
- ¿tiene sentido seguir llamándolo de la misma forma en cada request?
- ¿cómo protegemos a `order-service` y al resto del sistema de una dependencia que ya mostró comportamiento persistentemente malo?
- ¿cómo evitamos que retry se convierta en presión extra sobre algo que ya está mal?

Ese cambio de enfoque es justamente el corazón de esta etapa.

---

## Qué es circuit breaker en este contexto

Para esta etapa del curso, una forma útil de pensarlo es esta:

**circuit breaker es un patrón que detecta una cantidad o proporción significativa de fallos en una dependencia y, durante un tiempo, deja de enviarle nuevas llamadas para evitar seguir empeorando la degradación.**

Esa idea es central.

No estamos hablando de “fallar porque sí”.  
Estamos hablando de algo mucho más valioso:

- detectar degradación repetida,
- cortar temporalmente nuevas llamadas,
- y proteger al consumidor y al sistema en general.

Ese matiz importa muchísimo.

---

## Por qué circuit breaker no es lo mismo que retry

Este punto vale muchísimo.

A esta altura del módulo conviene fijar algo importante:

### Retry
Intenta una vez más porque todavía piensa que puede haber una chance razonable de recuperación inmediata.

### Circuit breaker
Dice algo más fuerte:
- “ya vi suficientes fallos como para considerar que insistir igual dejó de ser razonable”.

Eso significa que retry y circuit breaker no compiten entre sí.  
Resuelven problemas distintos.

Ese puente entre ambos patrones es una de las claves del bloque.

---

## Qué significa “abrir el circuito”

Cuando se habla de circuit breaker, una de las ideas más importantes es esta:

- mientras el circuito está “cerrado”, la llamada pasa normalmente
- cuando el sistema detecta demasiados fallos, el circuito se “abre”
- y entonces nuevas llamadas ni siquiera intentan ir a la dependencia problemática durante un tiempo

Ese concepto vale muchísimo porque muestra el corazón del patrón:

- no seguir golpeando a ciegas una dependencia que ya viene fallando repetidamente

---

## Cómo se traduce esto a NovaMarket

A esta altura del curso, el escenario sigue siendo muy claro:

- `order-service` depende de `inventory-service`
- ya vimos lentitud
- ya vimos timeout
- y ya introdujimos retry

Ahora la nueva pregunta es:

- si `inventory-service` sigue fallando varias veces seguidas, ¿tiene sentido que `order-service` siga insistiendo exactamente igual en cada request?

La respuesta que empieza a aparecer naturalmente es:

- **no siempre**
- y ahí entra circuit breaker.

---

## Qué gana NovaMarket con circuit breaker

Aunque todavía no lo apliquemos en esta clase, el valor ya se puede ver con claridad.

A partir de circuit breaker, NovaMarket puede ganar cosas como:

- menos presión innecesaria sobre una dependencia ya degradada,
- menor propagación de fallos repetidos,
- una respuesta más inteligente del consumidor,
- y una arquitectura bastante más madura frente a errores persistentes.

Eso vuelve al proyecto más serio desde el punto de vista de resiliencia.

---

## Por qué este paso aparece justo ahora

Esto también importa mucho.

Si todavía no hubiéramos trabajado timeout y retry, circuit breaker se sentiría un poco prematuro o demasiado mágico.

Pero ahora ya tenemos el contexto correcto:

- un problema real,
- una espera limitada,
- una segunda oportunidad pequeña,
- y la evidencia de que todavía falta una respuesta más fuerte cuando la degradación persiste.

Ese orden es excelente.

---

## Qué tipo de estados suele tener un circuit breaker

No hace falta todavía entrar en detalle total de la librería, pero sí conviene conocer la intuición básica:

- **cerrado**: la llamada circula normalmente
- **abierto**: nuevas llamadas se cortan temporalmente
- **half-open**: se prueba si la dependencia ya mejoró

No hace falta hoy explotar cada transición.  
La meta es más concreta:

- entender que el patrón no es simplemente “permitir o negar” de forma estática
- sino una forma dinámica de reaccionar a la salud reciente de la dependencia

Ese matiz importa muchísimo.

---

## Qué todavía no estamos haciendo en esta etapa

Conviene dejar esto muy claro.

En este punto todavía no estamos:

- configurando todavía una librería concreta como Resilience4j,
- ni definiendo aún umbrales de fallo,
- ni cortando todavía llamadas de verdad dentro del laboratorio.

La meta actual es mucho más concreta:

**abrir correctamente el bloque de circuit breaker como respuesta a fallos repetidos o persistentes.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no aplica todavía un circuit breaker real, pero hace algo muy importante:

**abre explícitamente el siguiente frente lógico del módulo 11: dejar de insistir indefinidamente sobre una dependencia que ya mostró suficiente evidencia de degradación.**

Eso importa muchísimo, porque NovaMarket deja de madurar solo desde espera controlada y reintentos puntuales y empieza a prepararse para otra mejora clave: protegerse activamente de fallos repetidos en una dependencia.

---

## Qué todavía no hicimos

Todavía no:

- elegimos todavía la librería concreta,
- ni configuramos aún umbrales o estados del breaker,
- ni vimos todavía el comportamiento del sistema con el circuito abierto.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué circuit breaker ya tiene sentido en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que circuit breaker es lo mismo que retry
No. Retry insiste; circuit breaker aprende que ya no conviene insistir igual.

### 2. Querer usar breaker sin un escenario real de fallos repetidos
Eso vuelve artificial todo el bloque.

### 3. Suponer que más intentos siempre equivalen a más resiliencia
A veces más intentos solo empeoran el problema.

### 4. Ver el patrón como algo “mágico”
Su valor real está en reaccionar con criterio a evidencia acumulada de fallos.

### 5. Abrir la implementación antes de entender el problema que resuelve
Este orden conceptual importa muchísimo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro qué es un circuit breaker, por qué no es lo mismo que timeout o retry, y por qué en NovaMarket aparece naturalmente como siguiente paso cuando los fallos entre servicios dejan de ser puntuales para volverse repetidos o persistentes.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué problema nuevo resuelve circuit breaker,
- ves por qué retry ya no alcanza en todos los casos,
- entendés que el patrón protege tanto al consumidor como a la dependencia degradada,
- y sentís que el proyecto ya está listo para aplicar un primer breaker real sobre el laboratorio que venimos usando.

Si eso está bien, ya podemos pasar a integrarlo en la llamada crítica de NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a agregar un primer circuit breaker real a la llamada crítica entre `order-service` e `inventory-service` para observar cómo cambia el comportamiento del sistema cuando los fallos dejan de ser puntuales y pasan a repetirse.

---

## Cierre

En esta clase entendimos por qué circuit breaker ya tiene sentido en NovaMarket.

Con eso, el proyecto deja de reaccionar a la degradación solo con límites de espera y reintentos puntuales y empieza a prepararse para otra mejora muy valiosa: dejar de golpear una dependencia repetidamente fallida cuando ya existe evidencia suficiente de que insistir de la misma manera dejó de ser razonable.
