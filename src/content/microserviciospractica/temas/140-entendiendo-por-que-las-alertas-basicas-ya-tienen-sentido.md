---
title: "Entendiendo por qué las alertas básicas ya tienen sentido"
description: "Inicio del siguiente refinamiento del bloque de Kubernetes en NovaMarket. Comprensión de por qué, después de consolidar una primera visualización útil con Grafana, ya conviene empezar a pensar en alertas básicas del entorno."
order: 140
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Entendiendo por qué las alertas básicas ya tienen sentido

En las últimas clases del bloque de Kubernetes llevamos la observación cuantitativa de NovaMarket a un punto bastante más maduro:

- entendimos por qué Grafana ya tenía sentido,
- desplegamos una instancia básica conectada a Prometheus,
- construimos un primer dashboard útil,
- y además consolidamos una primera capa de visualización cuantitativa realmente práctica dentro del entorno.

Eso ya tiene muchísimo valor.

Pero ahora aparece otra pregunta muy natural:

**si ya podemos ver mejor el sistema, cómo dejamos de depender solo de que alguien mire un dashboard justo a tiempo?**

Ese es el terreno de esta clase.

Porque una cosa es tener:

- métricas
- scraping
- y visualización

Y otra bastante distinta es empezar a definir situaciones donde el entorno debería levantar una señal más explícita para decirnos:

- “acá hay algo que conviene mirar”
- “esta pieza se está comportando raro”
- o “este estado ya dejó de ser simplemente informativo y merece atención”

Ahí es donde empieza a importar muchísimo más:

**la alerta**

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué las alertas básicas ya tienen sentido en este punto del bloque,
- entendida la diferencia entre observar un sistema y reaccionar a señales importantes del sistema,
- alineado el modelo mental del curso para trabajar una primera capa de alertas simples,
- y preparado el terreno para aplicarlo a NovaMarket en las próximas clases.

Todavía no vamos a montar una estrategia completa de alerting de producción.  
La meta de hoy es entender por qué este refinamiento aparece ahora y por qué encaja tan bien con todo lo que ya construimos antes.

---

## Estado de partida

Partimos de un cluster donde ya existe una reconstrucción bastante rica de NovaMarket:

- servicios importantes desplegados
- entrada madura
- configuración externalizada
- probes
- recursos
- escalado
- actualizaciones controladas
- troubleshooting básico
- observabilidad operativa
- métricas básicas
- exposición orientada a Prometheus
- scraping real con Prometheus
- y una primera visualización útil con Grafana

Eso significa que el entorno ya no solo puede medirse y visualizarse.  
Ahora empieza a tener sentido que algunas situaciones importantes no dependan exclusivamente de que alguien las vea por casualidad.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué limitación tiene una observación basada solo en dashboards,
- entender qué aporta una primera capa de alertas,
- conectarla con Prometheus, Grafana y con todo lo que ya construimos antes,
- y dejar clara la lógica del siguiente tramo del bloque.

---

## Qué problema queremos resolver exactamente

Hasta ahora, llegar a dashboards básicos ya fue un gran paso.

Pero cuando el entorno madura, empieza a aparecer otra necesidad:

**que ciertas señales importantes no queden únicamente disponibles para ser vistas, sino también para ser destacadas cuando cruzan un umbral razonable.**

Porque ahora conviene pensar preguntas como:

- ¿qué pasa si una métrica importante se degrada y nadie está mirando el tablero?
- ¿qué estados del sistema vale la pena elevar explícitamente?
- ¿cómo paso de una observación pasiva a una reacción básica del entorno?

Ese es justamente el tipo de pregunta que abre esta etapa.

---

## Por qué este paso tiene sentido justamente ahora

Porque el bloque ya construyó varias capas previas sin las cuales hablar de alertas tendría mucho menos valor:

- Actuator
- métricas básicas
- Prometheus
- scraping real
- Grafana
- y una primera visualización útil

Eso significa que la alerta no aparece como un tema aislado ni apresurado.

Aparece justo cuando el sistema ya tiene señales suficientemente ricas como para empezar a destacar algunas de forma más explícita.

---

## Qué significa una alerta básica en este contexto

Para esta etapa del curso práctico, una forma útil de pensarlo es esta:

**una alerta básica es una regla simple que identifica una situación del sistema que vale la pena destacar porque deja de ser solo informativa y empieza a requerir atención.**

No estamos hablando todavía de un centro de operaciones gigante.

Estamos hablando de algo mucho más concreto:

- elegir una señal importante
- definir un criterio simple
- y tratarla como algo que el entorno debería destacar

Ese cambio vale muchísimo.

---

## Paso 1 · Entender por qué no alcanza con “tener dashboards”

Este es uno de los puntos más importantes de la clase.

Hasta ahora, tener Grafana ya fue un gran avance.

Pero a esta altura del bloque conviene notar algo muy claro:

- poder ver una señal no significa que el sistema vaya a advertirnos cuando esa señal entre en una zona problemática

Falta otra capa:

- una que transforme observación en atención priorizada

Ese es justamente el valor de una alerta básica.

---

## Paso 2 · Relacionarlo con NovaMarket

NovaMarket ya tiene dentro del cluster piezas lo suficientemente importantes como para que algunas señales merezcan un tratamiento especial.

Por ejemplo:

- `api-gateway`
- `order-service`
- `notification-service`

No hace falta alertar sobre todo.

Lo importante es entender que el sistema ya es suficientemente real como para que empezar a destacar algunas condiciones importantes deje de ser un lujo y pase a ser un refinamiento muy razonable.

---

## Paso 3 · Entender qué aporta una alerta respecto de la etapa anterior

A esta altura del bloque, una forma útil de resumirlo sería esta:

- antes logramos medir, recolectar y visualizar
- ahora queremos empezar a reaccionar de forma básica ante ciertas condiciones relevantes

Ese cambio puede parecer pequeño, pero en realidad es muy importante.

Porque nos mueve desde una lógica de observación puramente pasiva hacia una observación un poco más activa.

---

## Paso 4 · Pensar qué conviene alertar primero

No hace falta intentar cubrir todo NovaMarket de una sola vez.

Para una primera iteración, tiene mucho sentido pensar en algo como:

- una condición de disponibilidad
- una degradación sostenida
- o una señal cuantitativa claramente anómala en una pieza importante

La idea es empezar con algo fácil de justificar, visible y útil.

---

## Paso 5 · Entender qué NO estamos haciendo todavía

Conviene dejar esto muy claro.

En esta etapa todavía no estamos:

- diseñando una estrategia completa de alerting de producción
- ni resolviendo severidades avanzadas
- ni armando flujos complejos de notificación

La meta actual es mucho más concreta:

**entender y construir una primera capa de alertas simples pero valiosas para el entorno.**

Y eso ya aporta muchísimo valor.

---

## Paso 6 · Entender por qué esto mejora todo lo que sigue

A partir de ahora, cualquier refinamiento posterior sobre observación y monitoreo va a ser mucho más fácil de sostener si ya existe una primera lógica de alertas dentro del entorno.

Eso significa que esta etapa no solo vale por sí misma.

También prepara muy bien:

- una lectura más accionable del sistema
- una observación menos dependiente de vigilancia constante
- y una operación más madura del entorno

Ese efecto transversal vale muchísimo.

---

## Paso 7 · Diferenciar visualización y alerta

Este matiz importa bastante.

### Visualización
Permite ver mejor el sistema.

### Alerta
Permite destacar una condición del sistema que merece atención.

No son lo mismo.

La segunda es una evolución bastante natural de la primera, y justamente por eso este tema aparece ahora.

---

## Qué estamos logrando con esta clase

Esta clase no define todavía una regla concreta, pero hace algo muy importante:

**abre explícitamente la etapa de alertas básicas dentro del bloque de Kubernetes.**

Eso importa muchísimo, porque el entorno deja de apoyarse solo en observación pasiva y empieza a prepararse para una reacción más explícita frente a señales importantes.

---

## Qué todavía no hicimos

Todavía no:

- definimos una regla concreta de alerta
- ni consolidamos una primera capa real de alerting dentro del entorno

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué las alertas básicas ya tienen sentido ahora.**

---

## Errores comunes en esta etapa

### 1. Pensar que con dashboards ya toda la observación estaba resuelta
Todavía faltaba una forma más activa de destacar condiciones importantes.

### 2. Creer que alertar exige desde el primer día una estrategia gigante
Para esta etapa, una capa simple y razonable es mejor.

### 3. Querer alertar sobre demasiadas cosas de una sola vez
Conviene empezar con pocas condiciones bien justificadas.

### 4. Tratar este paso como algo aislado de Prometheus y Grafana
En realidad es su evolución más natural.

### 5. No pensar el valor operativo de la alerta
La regla tiene que responder a una necesidad real del entorno.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para empezar a trabajar alertas básicas dentro de Kubernetes y por qué este tema aparece ahora, y no antes, dentro del bloque.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés la diferencia entre observar y alertar,
- ves por qué una primera capa de alertas ya tiene sentido ahora,
- entendés qué tipo de condiciones conviene elegir primero,
- y sentís que el sistema ya está listo para una primera reacción explícita dentro del entorno.

Si eso está bien, ya podemos pasar a definir una primera alerta simple para NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a definir una primera alerta básica para una pieza importante de NovaMarket dentro del entorno.

Ese será el primer paso concreto de alerting dentro del bloque.

---

## Cierre

En esta clase entendimos por qué las alertas básicas ya tienen sentido en NovaMarket dentro de Kubernetes.

Con eso, el bloque queda listo para dar otro salto importante de madurez: no solo medir, recolectar y visualizar el sistema, sino también empezar a destacar activamente las condiciones que realmente merecen atención.
