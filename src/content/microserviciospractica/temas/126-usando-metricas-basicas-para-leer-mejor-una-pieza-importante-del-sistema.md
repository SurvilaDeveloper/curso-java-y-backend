---
title: "Usando métricas básicas para leer mejor una pieza importante del sistema"
description: "Primer paso concreto del trabajo con métricas dentro de Kubernetes. Uso de métricas básicas expuestas por Actuator para interpretar mejor una pieza importante de NovaMarket."
order: 126
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Usando métricas básicas para leer mejor una pieza importante del sistema

En la clase anterior abrimos una nueva etapa importante del bloque:

- entendimos por qué las métricas ya tenían sentido,
- y dejamos claro que el sistema ya es lo suficientemente real dentro del cluster como para que una lectura cuantitativa empiece a aportar valor.

Ahora toca el paso concreto:

**usar métricas básicas para leer mejor una pieza importante de NovaMarket dentro de Kubernetes.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- instalada una primera lectura cuantitativa del sistema,
- más claro qué tipo de métricas básicas ya puede exponer una pieza importante de NovaMarket,
- y preparada una base muy útil para enriquecer todavía más la observación operativa del entorno.

Todavía no vamos a montar dashboards ni un stack completo de monitoreo.  
La meta de hoy es mucho más concreta: **aprender a leer mejor una pieza importante del sistema usando métricas básicas**.

---

## Estado de partida

Partimos de un entorno donde varias piezas importantes del sistema ya cuentan con una base operativa rica:

- probes
- recursos
- escalado
- actualizaciones controladas
- troubleshooting básico
- y observabilidad operativa básica

Eso significa que las métricas no llegan a un entorno vacío.  
Llegan a un sistema donde ya sabemos leer bastante, y al que ahora queremos sumar una capa cuantitativa.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir una pieza importante del sistema,
- revisar métricas básicas expuestas por Actuator,
- usarlas para enriquecer la lectura operativa de esa pieza,
- y dejar un patrón simple y útil para el resto del bloque.

---

## Qué pieza conviene elegir primero

Para esta primera experiencia, conviene usar una pieza importante y fácil de justificar, por ejemplo:

- `api-gateway`
- `order-service`
- o `notification-service`

La idea es trabajar con algo suficientemente representativo como para que el valor de las métricas se entienda rápido y no quede como una curiosidad aislada.

Para esta clase, `api-gateway` o `order-service` suelen ser excelentes candidatos.

---

## Paso 1 · Empezar por una métrica sencilla y útil

No hace falta empezar por algo demasiado complejo.

A esta altura del curso, una primera lectura razonable puede apoyarse en métricas simples relacionadas con cosas como:

- uso de memoria
- threads
- actividad HTTP
- o señales básicas del runtime

La idea no es impresionarnos con cantidad, sino aprender a leer algo concreto y útil.

---

## Paso 2 · Entender qué aporta una métrica respecto de health

Este matiz importa muchísimo.

Health nos ayudaba a responder preguntas como:

- ¿está arriba?
- ¿está sano?

Las métricas, en cambio, empiezan a responder preguntas como:

- ¿cuánto está usando?
- ¿qué actividad está mostrando?
- ¿cómo viene comportándose?

Ese cambio de enfoque es una de las ideas más valiosas de toda esta etapa.

---

## Paso 3 · Elegir una o dos señales cuantitativas claras

Para esta primera iteración, conviene elegir muy pocas y leerlas bien.

Por ejemplo:

- una métrica de uso del proceso
- y una métrica ligada a la actividad del servicio

No hace falta abrir veinte cosas a la vez.

La idea es que esta clase enseñe criterio de lectura, no acumulación de datos.

---

## Paso 4 · Relacionar la métrica con el rol del servicio

Este paso es muy importante.

No queremos mirar una métrica aislada del contexto.

Queremos preguntarnos algo como:

- ¿qué me dice esta señal sobre el tipo de pieza que estoy observando?
- ¿tiene sentido el valor viendo el rol de este servicio?
- ¿me ayuda a entender mejor su comportamiento dentro del sistema?

Ese cambio de mirada vuelve la lectura muchísimo más valiosa.

---

## Paso 5 · Cruzar la métrica con lo que ya sabemos del cluster

Ahora conviene combinar esta nueva lectura cuantitativa con lo que ya veníamos usando en el bloque.

Por ejemplo:

- probes
- estado del Pod
- señales básicas del recurso
- o información general del servicio dentro del cluster

La idea es no tratar la métrica como una verdad flotando en el vacío, sino como una pieza más dentro de una lectura operativa más rica.

---

## Paso 6 · Entender qué tipo de preguntas empiezan a ser posibles

Después de esta clase, ya debería empezar a sentirse natural hacer preguntas como:

- ¿esta pieza solo está sana o también se está comportando razonablemente?
- ¿esa señal cuantitativa acompaña lo que esperábamos del servicio?
- ¿el uso que muestra tiene sentido con su rol actual en el sistema?
- ¿hay algo raro que no sea todavía un error duro, pero sí una pista interesante?

Ese tipo de preguntas es justamente el valor que trae esta nueva capa.

---

## Paso 7 · No convertir esto todavía en una plataforma compleja

Conviene dejarlo muy claro.

En esta etapa no estamos todavía:

- construyendo dashboards grandes
- ni montando series temporales completas
- ni resolviendo una plataforma final de monitoreo

La meta es mucho más concreta:

**aprender a usar unas pocas métricas básicas para leer mejor una pieza importante del sistema.**

Eso ya aporta muchísimo valor.

---

## Paso 8 · Pensar por qué esto mejora todo el resto del bloque

A partir de ahora, cada nuevo refinamiento del entorno puede apoyarse también en una lectura cuantitativa más rica.

Eso significa que las métricas no solo sirven para esta clase.

También mejoran:

- observabilidad operativa
- troubleshooting
- lectura de escalado
- e interpretación general del comportamiento del sistema

Ese valor transversal es enorme.

---

## Paso 9 · Dejar el patrón explícito

A esta altura conviene fijar una idea simple:

1. elegir una pieza importante  
2. mirar una o dos métricas básicas  
3. relacionarlas con el rol del servicio  
4. cruzarlas con señales del cluster  
5. recién después construir una lectura más rica del comportamiento  

Este patrón puede parecer pequeño, pero tiene muchísimo valor práctico para el resto del curso.

---

## Qué estamos logrando con esta clase

Esta clase instala una primera lectura cuantitativa real dentro del bloque de Kubernetes.

Ya no estamos solo observando el sistema desde salud, logs y estados.  
Ahora también empezamos a sumarle una lectura basada en métricas.

Eso es un salto importante de madurez.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos esta nueva lectura cuantitativa como checkpoint del bloque
- ni la conectamos todavía a una estrategia más amplia de observación del entorno

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**aprender a usar métricas básicas para leer mejor una pieza importante del sistema.**

---

## Errores comunes en esta etapa

### 1. Querer mirar demasiadas métricas de una sola vez
Conviene empezar con pocas y leerlas bien.

### 2. Tratar la métrica como un dato aislado del contexto
El valor aparece cuando la relacionamos con el rol de la pieza.

### 3. Comparar métricas sin criterio
Primero hay que entender qué pregunta estamos intentando responder.

### 4. Creer que esto reemplaza health o troubleshooting
En realidad se suma a todo lo anterior.

### 5. Esperar una plataforma enorme antes de empezar a sacar valor
Para este curso, lo básico bien leído ya aporta muchísimo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una forma más rica de leer una pieza importante de NovaMarket dentro del cluster apoyándote en métricas básicas y no solo en estados o síntomas.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- ya no mirás el sistema solo desde health y logs,
- entendés qué tipo de pregunta responde una métrica,
- podés cruzar una señal cuantitativa con el contexto del servicio,
- y sentís que la lectura del entorno ya ganó una dimensión más rica.

Si eso está bien, ya podemos consolidar esta nueva etapa del bloque.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a consolidar esta lectura cuantitativa básica de NovaMarket dentro de Kubernetes y dejarla integrada al resto de refinamientos del entorno.

---

## Cierre

En esta clase usamos métricas básicas para leer mejor una pieza importante del sistema.

Con eso, NovaMarket ya no solo vive, escala, se deja diagnosticar y observar mejor dentro del cluster: también empieza a ser un entorno que sabemos leer cuantitativamente de una forma mucho más útil y mucho más madura.
