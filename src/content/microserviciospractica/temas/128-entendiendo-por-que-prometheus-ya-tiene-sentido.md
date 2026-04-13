---
title: "Entendiendo por qué Prometheus ya tiene sentido"
description: "Inicio del siguiente refinamiento del bloque de Kubernetes en NovaMarket. Comprensión de por qué, después de consolidar métricas básicas, ya conviene orientar su lectura hacia Prometheus."
order: 128
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Entendiendo por qué Prometheus ya tiene sentido

En las últimas clases del bloque de Kubernetes dimos otro paso importante de madurez:

- entendimos por qué las métricas ya tenían sentido,
- empezamos a leer mejor una pieza importante del sistema desde señales cuantitativas,
- y además consolidamos una primera lectura más rica del entorno combinando estados, salud, troubleshooting y comportamiento medible.

Eso ya tiene muchísimo valor.

Pero ahora aparece una pregunta muy natural:

**si ya empezamos a mirar métricas, cómo las orientamos hacia una forma más estándar y más útil de recolección dentro del ecosistema Kubernetes?**

Ese es el terreno de esta clase.

Porque una cosa es leer métricas básicas de manera puntual.  
Y otra bastante distinta es empezar a pensar esas métricas como algo que:

- puede exponerse de forma consistente,
- puede ser recolectado por una herramienta del entorno,
- y puede convertirse en una base más seria de observación del sistema.

Ahí es donde empieza a importar muchísimo más:

**Prometheus**

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué Prometheus ya tiene sentido en este punto del bloque,
- entendida la diferencia entre “mirar métricas” y “preparar métricas para recolección más estándar”,
- alineado el modelo mental del curso para una integración básica orientada a Prometheus,
- y preparado el terreno para aplicar esta idea a una pieza importante de NovaMarket en las próximas clases.

Todavía no vamos a montar una plataforma gigante.  
La meta de hoy es entender por qué este refinamiento aparece ahora y por qué encaja tan bien con todo lo que ya construimos.

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
- observabilidad operativa básica
- y una primera lectura cuantitativa del sistema

Eso significa que el entorno ya no solo es observable desde señales cualitativas y métricas puntuales.  
Ahora empieza a tener sentido volver más sistemática la forma en que esas métricas pueden ser expuestas y recolectadas.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué limitación tiene una lectura de métricas demasiado puntual o manual,
- entender qué aporta una orientación a Prometheus,
- conectar esta etapa con Actuator y con las métricas que ya empezamos a trabajar,
- y dejar clara la lógica del siguiente tramo del bloque.

---

## Qué problema queremos resolver exactamente

Hasta ahora, mirar métricas básicas ya nos ayudó a enriquecer la observación del sistema.

Eso fue muy valioso.

Pero a medida que el entorno madura, empieza a aparecer otra necesidad:

**que esas métricas no dependan solo de una consulta puntual o de una lectura manual, sino que puedan integrarse mejor a un flujo de observación más estándar dentro del cluster.**

Porque ahora conviene pensar preguntas como:

- ¿cómo expongo estas métricas de una forma compatible con una herramienta conocida del ecosistema?
- ¿cómo dejo preparada una pieza del sistema para ser scrapeada?
- ¿cómo convierto una lectura puntual en una base más reutilizable?

Ese es justamente el tipo de pregunta que abre esta etapa.

---

## Por qué este paso tiene sentido justamente ahora

Porque el bloque ya construyó varias capas previas sin las cuales Prometheus sería mucho menos útil o quedaría demasiado flotando en el aire.

Por ejemplo, ya tenemos:

- Actuator
- métricas básicas
- señales de salud
- piezas importantes dentro del cluster
- y una observación operativa cada vez más rica

Eso significa que ahora Prometheus no aparece como “otra herramienta más”, sino como una evolución bastante natural del camino que venimos recorriendo.

---

## Qué significa orientar el sistema hacia Prometheus en este contexto

Para esta etapa del curso práctico, una forma útil de pensarlo es esta:

**orientar NovaMarket hacia Prometheus significa empezar a exponer métricas de una forma más estándar y preparada para recolección dentro del entorno.**

No estamos diciendo todavía:

- “ya tengo toda la plataforma final de monitoreo montada”

Estamos diciendo algo más concreto y mucho más adecuado para este punto del curso:

- el sistema ya puede hablar en un formato mucho más útil para el ecosistema Kubernetes

Ese cambio vale muchísimo.

---

## Paso 1 · Entender por qué no alcanza con mirar métricas aisladas

Este es uno de los puntos más importantes de la clase.

Hasta ahora, mirar una métrica puntual nos sirvió para entender mejor una pieza importante del sistema.

Eso estuvo muy bien.

Pero ahora queremos algo más rico:

- no solo leer una señal
- sino preparar esa señal para una observación más sistemática

Ese cambio de escala es justamente una de las razones más fuertes para introducir Prometheus ahora.

---

## Paso 2 · Relacionarlo con Spring Boot Actuator y Micrometer

Este punto vale muchísimo.

En el mundo Spring Boot, Actuator y Micrometer ya nos dejan muy bien posicionados para esta etapa.

Eso significa que no estamos inventando una integración desde cero.

En realidad, el sistema ya tiene bastante de la base necesaria para:

- exponer métricas
- y hacerlo en una forma mucho más compatible con Prometheus

Esa continuidad técnica es una de las mejores cosas de este tramo del curso.

---

## Paso 3 · Entender qué aporta Prometheus respecto de la etapa anterior

A esta altura del bloque, una forma útil de resumirlo sería esta:

- antes empezamos a **leer mejor métricas**
- ahora queremos empezar a **exponerlas mejor para que puedan ser recolectadas**

Ese cambio puede parecer pequeño, pero es muy importante.

Porque nos mueve desde una lógica más puntual y manual hacia una lógica mucho más reusable dentro del entorno.

---

## Paso 4 · Pensar qué pieza conviene usar primero

No hace falta preparar todo NovaMarket de una sola vez.

Para una primera iteración, un candidato muy razonable puede ser:

- `api-gateway`
- `order-service`
- o `notification-service`

La idea es trabajar con una pieza importante, representativa y lo suficientemente clara como para que el valor de esta orientación se entienda rápido.

---

## Paso 5 · Entender qué NO estamos haciendo todavía

Conviene dejarlo claro.

En este punto del bloque no estamos todavía:

- montando un Prometheus completo con toda su configuración final
- ni armando dashboards complejos
- ni resolviendo una plataforma total de producción

La meta actual es mucho más concreta:

**preparar una integración básica orientada a Prometheus sobre una pieza importante del sistema.**

Y eso ya aporta muchísimo valor práctico.

---

## Paso 6 · Entender por qué esto mejora todo lo que sigue

A partir de ahora, cualquier refinamiento futuro sobre métricas y observabilidad va a ser mucho más fácil de sostener si ya empezamos a hablar el lenguaje que Prometheus espera.

Eso significa que esta etapa no vale solo por sí misma.

También prepara muy bien:

- monitoreo más serio
- scraping más ordenado
- y una observación cuantitativa mucho más sostenible

Ese efecto transversal vale muchísimo.

---

## Paso 7 · Diferenciar métricas básicas de integración orientada a Prometheus

Este matiz importa bastante.

### Métricas básicas
Nos ayudaron a enriquecer una lectura cuantitativa del sistema.

### Orientación a Prometheus
Empieza a preparar esas métricas para una recolección más estándar y más reutilizable dentro del cluster.

No son temas aislados.  
El segundo es una evolución bastante natural del primero.

Ese encastre es una de las ideas más valiosas de esta etapa.

---

## Qué estamos logrando con esta clase

Esta clase no expone todavía un endpoint concreto de Prometheus ni monta una plataforma completa, pero hace algo muy importante:

**abre explícitamente la etapa “Prometheus-oriented” del bloque de Kubernetes.**

Eso importa muchísimo, porque las métricas dejan de ser solo algo que leemos puntualmente y empiezan a orientarse hacia una forma mucho más estándar de observación dentro del entorno.

---

## Qué todavía no hicimos

Todavía no:

- expusimos métricas en formato Prometheus
- ni consolidamos una integración básica real sobre una pieza importante del sistema

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué Prometheus ya tiene sentido ahora.**

---

## Errores comunes en esta etapa

### 1. Pensar que Prometheus solo vale si ya montamos una plataforma enorme
En realidad ya aporta valor desde una integración mucho más básica.

### 2. Creer que esto no tiene relación con lo que hicimos antes
En realidad es una evolución muy natural de Actuator y métricas básicas.

### 3. Querer avanzar directo a dashboards sin preparar primero la exposición correcta
Conviene respetar la secuencia del bloque.

### 4. Tratar este tema como una herramienta aislada
En realidad mejora mucho la observación cuantitativa del sistema.

### 5. Esperar perfección de producción desde la primera iteración
Para esta etapa, una orientación simple y razonable es más que suficiente.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para empezar a trabajar una integración básica orientada a Prometheus dentro de Kubernetes y por qué este tema aparece ahora, y no antes, dentro del bloque.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés la diferencia entre leer métricas y prepararlas para recolección más estándar,
- ves la relación con Actuator y Micrometer,
- entendés por qué Prometheus ya tiene sentido ahora,
- y sentís que el sistema ya está listo para una primera integración básica en esa dirección.

Si eso está bien, ya podemos pasar a exponer métricas en un formato más útil para Prometheus.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a exponer métricas en formato Prometheus para una pieza importante de NovaMarket dentro del cluster.

Ese será el primer paso concreto de esta nueva etapa del bloque.

---

## Cierre

En esta clase entendimos por qué Prometheus ya tiene sentido en NovaMarket dentro de Kubernetes.

Con eso, el bloque queda listo para dar otro salto importante de madurez: no solo mirar métricas básicas, sino empezar a prepararlas para una observación más estándar, más reusable y mucho más alineada con el ecosistema real de Kubernetes.
