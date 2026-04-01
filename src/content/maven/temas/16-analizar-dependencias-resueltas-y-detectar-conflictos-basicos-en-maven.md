---
title: "Analizar dependencias resueltas y detectar conflictos básicos en Maven"
description: "Decimosexto tema práctico del curso de Maven: aprender a leer con más intención cómo Maven resuelve dependencias, detectar conflictos básicos de versión y usar herramientas simples para entender mejor qué librerías terminan ganando en el proyecto."
order: 16
module: "Resolución y control de dependencias"
level: "base"
draft: false
---

# Analizar dependencias resueltas y detectar conflictos básicos en Maven

## Objetivo del tema

En este decimosexto tema vas a:

- empezar a leer la resolución de dependencias con más profundidad
- entender qué significa que dos librerías “compitan” por una versión
- detectar conflictos básicos de dependencias
- ver qué versión termina usando Maven cuando hay más de una candidata
- practicar con herramientas como `dependency:tree` para leer mejor lo que realmente queda en el proyecto

La idea es que dejes de ver las dependencias como una lista plana y empieces a entender que Maven también toma decisiones de resolución cuando hay varias rutas posibles.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- agregar dependencias
- entender scopes básicos
- usar `properties`
- fijar la versión de Java
- leer el árbol de dependencias
- entender dependencias directas, transitivas y exclusiones

Si hiciste los temas anteriores, ya tenés la base ideal para pasar a este nivel.

---

## Por qué este tema importa tanto

Hasta ahora trabajaste mucho con:

- estructura
- lifecycle
- scopes
- artefactos
- tests
- properties
- árbol de dependencias
- exclusiones básicas

Todo eso era una gran base introductoria.

A partir de este punto empezás a mirar algo un poco más fino:
- no solo qué dependencias hay,
- sino cómo Maven decide cuál versión queda realmente cuando la resolución se vuelve más compleja.

Eso ya es un salto desde la pura familiaridad hacia una lectura más técnica del build.

---

## Idea central del tema

Cuando el proyecto crece, puede pasar que dos dependencias distintas quieran traer la misma librería,
pero en versiones diferentes.

Por ejemplo:

- una rama quiere `biblioteca-x:1.0`
- otra rama quiere `biblioteca-x:2.0`

Tu proyecto no puede quedarse “al mismo tiempo” con ambas de cualquier manera dentro de la misma resolución simple.
Entonces Maven necesita decidir qué versión usar.

Dicho simple:

> un conflicto básico de dependencias aparece cuando distintas rutas del árbol empujan versiones distintas de una misma librería.

---

## Qué significa “conflicto” en este contexto

No significa necesariamente que el build explote enseguida.
A veces compila y parece andar.

El conflicto puede ser algo como:

- varias versiones candidatas de una misma librería
- una resolución inesperada
- una versión que gana aunque vos no la viste directamente en el `pom.xml`
- una librería transitiva que termina siendo distinta de la que imaginabas

Entonces aparece una idea importante:

> conflicto no siempre significa error inmediato; muchas veces significa resolución delicada o sorprendente.

---

## Una intuición muy útil

Podés pensarlo así:

- el árbol de dependencias no solo muestra qué entra
- también puede mostrar tensiones entre caminos
- y Maven necesita cerrar esas tensiones con una versión final resuelta

Esta mirada ya es más madura que solo listar dependencias.

---

## Qué herramienta sigue siendo central

La herramienta principal sigue siendo:

```bash
mvn dependency:tree
```

Pero ahora la vas a leer con otra pregunta:

> “¿Hay alguna librería que aparezca por varios caminos o con más de una versión candidata?”

Esa es la diferencia.

---

## Primer ejemplo conceptual

Imaginá este árbol simplificado:

```text
Proyecto
+- LibreriaA
|  \- BibliotecaX:1.0
\- LibreriaB
   \- BibliotecaX:2.0
```

Ahí tenés dos caminos que quieren traer `BibliotecaX`,
pero no con la misma versión.

Eso ya es un conflicto básico de resolución.

---

## Qué hace Maven en estos casos, en un nivel inicial

No vamos a entrar todavía en todos los matices finos de mediación,
pero sí conviene que entiendas esta idea general:

> Maven no se queda con “todo mezclado”; termina resolviendo una versión ganadora.

Esa versión puede depender de cosas como:

- qué dependencia está más cerca del proyecto
- qué camino del árbol la trae
- el orden de ciertas declaraciones en escenarios específicos
- o decisiones explícitas tuyas más adelante con otras herramientas

Por ahora, lo importante es que sepas detectar que **hay una competencia**.

---

## Primer experimento práctico: mirar el árbol con otra intención

Tomá tu proyecto actual y corré:

```bash
mvn dependency:tree
```

Ahora no lo leas solo como:
- directas
- transitivas

Leelo también buscando:

- dependencias repetidas por nombre
- librerías que parezcan venir por más de un camino
- zonas donde el árbol sea más denso
- librerías conocidas que podrían tener varias versiones candidatas

Quizá en tu proyecto todavía no aparezca un conflicto claro.
No pasa nada.
El objetivo es empezar a entrenar la mirada.

---

## Segundo experimento: agregar dependencias con más ecosistema

Para ver mejor estos fenómenos,
suele ayudar usar librerías que arrastren más transitivas.

Podés hacer una prueba con algo como:

- Guava
- Apache HttpClient
- alguna librería JSON
- alguna librería un poco más grande que `commons-lang3`

Por ejemplo:

```xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>33.0.0-jre</version>
</dependency>
```

Después corré:

```bash
mvn dependency:tree
```

No te hace falta entender todas las transitivas.
Solo ver que la red ya empieza a crecer y que la resolución deja de ser tan trivial.

---

## Qué significa “la versión que gana”

Supongamos que detectás que una librería aparece por dos ramas.

Aunque el árbol conceptual diga que había dos candidatas,
en la resolución final Maven va a terminar usando una.

La pregunta práctica entonces es:

- ¿cuál quedó?
- ¿por qué esa?
- ¿coincide con lo que yo esperaba?

Eso ya es una mirada mucho más útil que simplemente:
- “Maven trajo cosas”

---

## Ejercicio 1 — elegir una librería del árbol y rastrear su camino

Quiero que hagas esto:

### Paso 1
Corré:

```bash
mvn dependency:tree
```

### Paso 2
Elegí una dependencia transitiva que no hayas agregado directamente.

### Paso 3
Respondé:
- ¿de qué dependencia directa cuelga?
- ¿qué scope tiene?
- ¿por qué camino llega al proyecto?

### Objetivo
Acostumbrarte a rastrear dependencias por ruta y no solo por presencia.

---

## Qué relación tiene esto con exclusiones

Muchísima.

En el tema anterior viste que una exclusión corta una rama de entrada.

Bueno:
si dos caminos traen algo y uno de ellos no te conviene,
una exclusión puede ayudarte a intervenir esa resolución.

Entonces aparece una idea importante:

> leer conflictos y usar exclusiones empiezan a formar parte del mismo tipo de pensamiento: entender caminos y decidir cuáles querés dejar abiertos.

---

## Qué relación tiene esto con properties de versión

También importa.

Hasta ahora usaste properties para:
- ordenar
- centralizar
- mantener mejor el `pom.xml`

Más adelante vas a ver que también pueden ayudar a hacer explícita una versión que querés sostener.
Pero antes de eso necesitás entender el problema:
- que la resolución puede traer más de una candidata

Este tema te prepara justamente para eso.

---

## Primer escenario típico que conviene imaginar

Supongamos que vos agregás:

- una dependencia A
- una dependencia B

Cada una trae internamente otras librerías.
Y en algún punto ambas quieren una biblioteca común,
pero no la misma versión.

Ahí tu proyecto entra en una zona donde:

- la lectura del árbol importa
- las decisiones de resolución importan
- y más adelante tal vez necesites intervenir

Aunque hoy no resuelvas todavía todos esos casos,
sí conviene que aprendas a **verlos**.

---

## Una intuición muy útil

Podés pensarlo así:

> antes de corregir un conflicto, primero tenés que aprender a notarlo.

Esa frase vale muchísimo.

---

## Cómo se ve un resultado sospechoso

No siempre vas a ver una explosión obvia.
A veces lo sospechoso es algo como:

- una dependencia que sabías que debería venir en cierta versión, pero aparece otra
- una transitiva que entra por varios caminos
- una resolución que no coincide con lo que pensabas
- o un proyecto que compila, pero cuyo árbol ya se ve más complejo de lo esperado

Entonces aparece una verdad importante:

> la lectura madura del árbol no sirve solo para reaccionar a errores; también sirve para detectar complejidad antes de que el problema se vuelva visible.

---

## Error común 1 — pensar que si el build da SUCCESS no hay nada que revisar

No siempre.
Puede haber decisiones de resolución que conviene entender igual,
aunque todavía no rompan el build.

---

## Error común 2 — creer que un conflicto solo existe si Maven muestra una catástrofe

Tampoco.
A veces el conflicto ya está,
solo que Maven resolvió algo y vos todavía no lo viste.

---

## Error común 3 — no volver al árbol cuando una dependencia se comporta raro

Si una librería aparece en versión inesperada,
o si algo no te cierra,
el árbol vuelve a ser una de las primeras herramientas que conviene mirar.

---

## Error común 4 — querer resolver conflictos sin antes identificar el camino

Eso suele hacer perder mucho tiempo.

Primero:
- leé el árbol
- ubicá las ramas
- detectá la biblioteca en disputa
- y recién después pensá cómo intervenir

---

## Ejercicio 2 — comparar dos snapshots del árbol

Quiero que hagas esto:

### Paso 1
Corré:

```bash
mvn dependency:tree
```

y guardá el resultado en un archivo o copialo.

### Paso 2
Agregá una nueva dependencia con varias transitivas.

### Paso 3
Corré otra vez:

```bash
mvn dependency:tree
```

### Paso 4
Compará:
- qué ramas crecieron
- qué librerías nuevas aparecieron
- si hay alguna que parece repetirse por nombres o familias

### Objetivo
Empezar a leer el árbol como algo que evoluciona con el `pom.xml`.

---

## Qué rol cumple el `scope` en esta lectura

Mucho.

Porque no es lo mismo encontrar una librería transitiva en:

- `compile`
que en
- `test`

Entonces cuando leas el árbol,
no te fijes solo en el nombre.
Fijate también:

- qué scope tiene
- qué impacto puede tener
- si afecta el código principal o solo el test

Eso te da una lectura mucho más fina.

---

## Ejercicio 3 — rastrear una transitiva de test y una de compile

Quiero que busques en tu árbol:

- una transitiva que viva en `test`
- una transitiva que viva en `compile`

Después respondé:

- ¿de qué dependencia directa viene cada una?
- ¿qué diferencia práctica hay entre esos dos casos?

Este ejercicio te ayuda a conectar resolución y alcance.

---

## Qué no conviene olvidar

Este tema no pretende que ya domines todos los conflictos de versiones de Maven.

Lo que sí quiere dejarte es una base más madura:

- no solo hay dependencias
- no solo hay transitivas
- también hay resolución
- y en la resolución puede haber competencia entre versiones o caminos

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Corré:

```bash
mvn dependency:tree
```

### Ejercicio 2
Agregá una dependencia algo más grande, por ejemplo Guava.

### Ejercicio 3
Volvé a correr el árbol.

### Ejercicio 4
Identificá:
- dos dependencias directas
- dos transitivas
- una transitiva en `compile`
- una transitiva en `test`

### Ejercicio 5
Escribí con tus palabras si ves alguna zona del árbol donde una librería parezca llegar por varios caminos o donde la resolución parezca más compleja.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es un conflicto básico de dependencias en Maven?
2. ¿Por qué una misma librería podría tener más de una versión candidata?
3. ¿Qué herramienta te ayuda a leer estas situaciones?
4. ¿Por qué el árbol de dependencias es importante incluso cuando el build no falla?
5. ¿Qué diferencia hay entre detectar un problema y resolverlo?

---

## Mini desafío

Creá un proyecto nuevo, por ejemplo:

- `resolucion-demo-maven`

Y hacé esto:

1. agregá dos dependencias con varias transitivas
2. corré `mvn dependency:tree`
3. elegí una transitiva y rastreá de qué rama viene
4. intentá encontrar una zona donde el árbol ya se vea menos trivial
5. escribí una nota corta explicando qué te mostró Maven sobre la resolución real del proyecto

Tu objetivo no es resolver todos los conflictos,
sino empezar a **ver** que Maven está resolviendo más cosas de las que vos escribiste explícitamente.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este decimosexto tema, ya deberías poder:

- entender qué es un conflicto básico de dependencias
- leer el árbol con más intención
- rastrear transitivas por camino
- empezar a detectar zonas de resolución más compleja
- y ver a Maven no solo como descargador de librerías, sino como motor de resolución de dependencias

---

## Resumen del tema

- Un conflicto básico aparece cuando varias rutas del árbol empujan versiones distintas de una misma librería.
- Maven termina resolviendo una versión final.
- `mvn dependency:tree` sigue siendo la herramienta principal para leer estas situaciones.
- Detectar el conflicto es un paso distinto de resolverlo.
- El árbol sirve no solo cuando hay errores, sino también para entender complejidad antes de que explote.
- Ya pasaste de mirar dependencias como lista a mirarlas como red resuelta.

---

## Próximo tema

En el próximo tema vas a aprender a fijar versiones con más intención usando `dependencyManagement`, porque después de ver que el árbol puede traer competencia entre versiones y caminos, el siguiente paso natural es aprender una de las herramientas más importantes de Maven para gobernar esa resolución de forma centralizada.
