---
title: "Leer el árbol de dependencias en Maven: dependencias directas y transitivas"
description: "Decimocuarto tema práctico del curso de Maven: aprender a inspeccionar el árbol de dependencias, distinguir dependencias directas y transitivas y entender mejor qué librerías resuelve Maven por detrás."
order: 14
module: "Fundamentos de Maven"
level: "intro"
draft: false
---

# Leer el árbol de dependencias en Maven: dependencias directas y transitivas

## Objetivo del tema

En este decimocuarto tema vas a:

- entender qué diferencia hay entre una dependencia directa y una dependencia transitiva
- aprender a usar el árbol de dependencias de Maven
- ver cómo una librería puede traer otras librerías
- empezar a leer mejor de dónde salen dependencias que vos no agregaste explícitamente
- interpretar un resultado muy común del día a día con Maven

La idea es que dejes de pensar que en el proyecto solo existen las dependencias que escribiste a mano en el `pom.xml`.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- agregar dependencias
- entender scopes básicos
- usar `properties`
- fijar la versión de Java
- ejecutar `compile`, `test`, `package`, `install` y `clean`

Si venís siguiendo el curso, ya tenés la base perfecta.

---

## Idea central del tema

Cuando agregás una dependencia en Maven, muchas veces no entra sola.

Puede traer otras librerías que ella necesita para funcionar.

Por ejemplo:

- vos agregás una sola dependencia
- Maven termina resolviendo varias más

Eso no significa que Maven “inventó cosas”.
Significa que está resolviendo una red de dependencias.

Entonces aparece una idea muy importante:

> en Maven, no todo lo que usa tu proyecto está declarado directamente por vos; también existen dependencias transitivas.

---

## Qué es una dependencia directa

Es una dependencia que vos escribís explícitamente en el `pom.xml`.

Por ejemplo:

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.14.0</version>
</dependency>
```

Eso es una dependencia directa,
porque la agregaste vos.

---

## Qué es una dependencia transitiva

Es una dependencia que llega al proyecto porque otra dependencia la necesita.

O sea:

- vos no la escribiste directamente
- pero igual aparece en el proyecto porque forma parte de la cadena de resolución

Dicho simple:

> una dependencia transitiva es una dependencia de una dependencia.

---

## Una intuición muy útil

Podés pensarlo así:

- dependencia directa = la puerta que abrís vos
- dependencia transitiva = lo que viene detrás de esa puerta

Esta imagen ordena muchísimo.

---

## Qué problema resuelve Maven acá

Sin Maven, manejar estas cadenas a mano sería bastante pesado.

Tendrías que:

- saber qué librerías necesita cada librería
- bajarlas una por una
- verificar versiones
- ordenar compatibilidades

Maven hace buena parte de ese trabajo por vos.

Entonces aparece una verdad importante:

> parte del valor de Maven no está solo en bajar dependencias, sino en resolver la red de dependencias que ellas traen consigo.

---

## Qué herramienta vas a aprender hoy

La herramienta principal del tema es este comando:

```bash
mvn dependency:tree
```

Este comando muestra el árbol de dependencias del proyecto.

No hace falta que lo entiendas todo de una.
La idea es empezar a leerlo con criterio.

---

## Primer experimento práctico: ejecutar el árbol de dependencias

Ubicate dentro de tu proyecto y corré:

```bash
mvn dependency:tree
```

## Qué deberías ver

Vas a ver una salida parecida a esta:

```text
[INFO] com.gabriel.mavencurso:mi-primer-proyecto-maven:jar:0.1.0-SNAPSHOT
[INFO] +- org.apache.commons:commons-lang3:jar:3.14.0:compile
[INFO] \- junit:junit:jar:4.13.2:test
[INFO]    \- org.hamcrest:hamcrest-core:jar:1.3:test
```

La salida exacta puede variar según tus dependencias,
pero la lógica es esta.

---

## Cómo leer esa salida

Tomemos esta parte:

```text
[INFO] +- org.apache.commons:commons-lang3:jar:3.14.0:compile
```

Te dice:

- dependencia: `commons-lang3`
- tipo: `jar`
- versión: `3.14.0`
- scope: `compile`

Y esta otra:

```text
[INFO] \- junit:junit:jar:4.13.2:test
[INFO]    \- org.hamcrest:hamcrest-core:jar:1.3:test
```

Acá se ve algo muy importante:

- vos agregaste `junit`
- pero `junit` trae `hamcrest-core`

Entonces:
- `junit` = directa
- `hamcrest-core` = transitiva

Eso ya es una comprensión muy valiosa.

---

## Primer aprendizaje fuerte del tema

Quiero que te quedes con esto:

> si ves una dependencia que no recordás haber agregado, no significa necesariamente que esté “mal”; puede ser transitiva.

---

## Segundo experimento: agregar una dependencia con más peso

Para sentir mejor el concepto, agregá una dependencia que tienda a traer más cosas.

Por ejemplo, Guava:

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

## Qué deberías observar

Seguramente el árbol ahora sea más largo,
porque Guava suele traer otras dependencias relacionadas.

No hace falta estudiar todas una por una.
Lo importante es que sientas este fenómeno:

- agregaste una
- Maven resolvió varias

---

## Qué significa que el árbol sea “árbol”

Se llama árbol porque muestra relaciones jerárquicas.

Algo así como:

- proyecto
  - dependencia A
    - transitiva A1
    - transitiva A2
  - dependencia B
    - transitiva B1

Es una forma de visualizar:
- quién depende de quién

---

## Ejercicio 1 — encontrar dependencias directas y transitivas

Quiero que hagas esto con tu proyecto real.

### Paso 1
Corré:

```bash
mvn dependency:tree
```

### Paso 2
Anotá al menos:
- dos dependencias directas
- una o dos transitivas

### Paso 3
Respondé:
- ¿de qué dependencia directa cuelga cada transitiva que encontraste?

El objetivo es empezar a leer relaciones,
no solo nombres sueltos.

---

## Qué relación tiene esto con scopes

Muy fuerte.

En el árbol no solo ves nombres y versiones.
También ves scopes.

Por ejemplo:

```text
...:compile
...:test
```

Eso te permite empezar a conectar dos cosas que ya aprendiste:

- qué dependencias existen
- en qué contexto viven

Entonces aparece otra idea importante:

> el árbol de dependencias también te ayuda a ver no solo qué llega al proyecto, sino bajo qué alcance lo hace.

---

## Qué utilidad práctica tiene este comando

Muchísima.

Sirve para cosas como:

- entender de dónde salió una librería que no agregaste explícitamente
- detectar si una dependencia trae demasiado
- revisar scopes
- investigar conflictos
- entender mejor qué está entrando realmente al proyecto

En este nivel inicial, ya con lo primero alcanza bastante:
- saber de dónde salen librerías inesperadas

---

## Error común 1 — creer que todo lo que aparece en el árbol fue escrito por vos

No.
Justamente el valor del árbol es mostrarte también lo transitivo.

---

## Error común 2 — asustarte si aparecen más dependencias de las que esperabas

No siempre es un problema.
Muchas veces es simplemente la resolución normal de Maven.

La pregunta útil no es:
- “¿por qué hay tantas?”
sino:
- “¿de cuál dependen y en qué scope están?”

---

## Error común 3 — no usar nunca el árbol cuando algo no cierra

Si ves una dependencia rara,
o si el proyecto trae más cosas de las que pensabas,
el árbol es una de las primeras herramientas que conviene mirar.

---

## Error común 4 — mirar el árbol como una pared de texto incomprensible

No hace falta leer todo al detalle.
Podés leerlo de forma práctica:

1. proyecto raíz
2. dependencias directas
3. algunas transitivas visibles
4. scopes
5. relaciones importantes

Eso ya da muchísimo valor.

---

## Una intuición muy útil

Podés pensarlo así:

> `mvn dependency:tree` no te muestra solo “qué hay”, sino “cómo llegó cada cosa”.

Esa frase vale muchísimo.

---

## Ejercicio 2 — comparar antes y después

Hacé esta práctica:

### Paso 1
Corré:

```bash
mvn dependency:tree
```

y guardá mentalmente o por escrito el resultado general.

### Paso 2
Agregá una nueva dependencia, por ejemplo Guava.

### Paso 3
Corré otra vez:

```bash
mvn dependency:tree
```

### Paso 4
Compará:
- qué dependencias nuevas aparecieron
- cuáles parecen directas
- cuáles parecen transitivas

Este ejercicio te ayuda a ver el árbol como algo dinámico y no estático.

---

## Qué relación tiene esto con el repositorio local

También importa.

Recordá que Maven descarga artefactos al repositorio local.
Bueno:
muchas de las cosas que ves en el árbol son artefactos que Maven tuvo que resolver y traer también a `.m2/repository`.

Entonces el árbol y el repositorio local están muy relacionados:

- uno te muestra la red lógica
- el otro contiene los archivos reales descargados

---

## Qué relación tiene esto con problemas futuros más avanzados

Muchísima.

Más adelante, cuando veas cosas como:

- conflictos de versión
- exclusiones
- `dependencyManagement`
- multi-módulo

el árbol de dependencias va a ser todavía más importante.

Por ahora, este tema te prepara muy bien,
porque ya te acostumbra a preguntar:

- ¿esto es directo o transitivo?
- ¿de dónde viene?
- ¿en qué scope está?

---

## Ejercicio 3 — identificar una transitiva del test

Si tenés JUnit en tu proyecto,
corré:

```bash
mvn dependency:tree
```

Y tratá de ubicar una dependencia transitiva que cuelgue de JUnit.

Por ejemplo, algo como `hamcrest-core`.

Después respondé:

- ¿la agregaste vos directamente?
- ¿o llegó porque JUnit la necesitaba?

Ese ejercicio te deja el concepto clarísimo.

---

## Qué no conviene olvidar

No hace falta que memorices árboles enormes.
Lo importante es formar esta costumbre:

> cuando quieras entender de dónde sale una dependencia, corré el árbol.

Eso ya cambia muchísimo tu relación con Maven.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Corré:

```bash
mvn dependency:tree
```

### Ejercicio 2
Identificá:
- dos dependencias directas
- una dependencia transitiva

### Ejercicio 3
Agregá Guava o una dependencia parecida.

### Ejercicio 4
Volvé a correr:

```bash
mvn dependency:tree
```

### Ejercicio 5
Compará el antes y el después.

### Ejercicio 6
Escribí con tus palabras qué diferencia hay entre dependencia directa y transitiva.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es una dependencia directa?
2. ¿Qué es una dependencia transitiva?
3. ¿Para qué sirve `mvn dependency:tree`?
4. ¿Qué información importante te muestra además del nombre de la librería?
5. ¿Por qué pueden aparecer dependencias que vos no escribiste explícitamente en el `pom.xml`?

---

## Mini desafío

Creá un proyecto nuevo, por ejemplo:

- `dependencias-arbol-maven`

Y hacé esto:

1. agregá una dependencia simple
2. corré `mvn dependency:tree`
3. agregá otra más “pesada”
4. corré otra vez el árbol
5. identificá cuáles dependencias nuevas son directas y cuáles transitivas

Tu objetivo es que el árbol de dependencias ya te resulte una herramienta normal y no algo raro.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este decimocuarto tema, ya deberías poder:

- entender qué es una dependencia directa
- entender qué es una dependencia transitiva
- usar `mvn dependency:tree`
- leer el resultado de forma básica pero útil
- ubicar librerías que llegaron por otras dependencias
- y ver a Maven con mucha más profundidad que al comienzo

---

## Resumen del tema

- En Maven no todo lo que usa tu proyecto está declarado directamente por vos.
- También existen dependencias transitivas.
- `mvn dependency:tree` permite ver de dónde sale cada dependencia.
- El árbol muestra relaciones, versiones y scopes.
- Es una herramienta muy útil para entender mejor qué está resolviendo Maven por detrás.
- Ya empezaste a mirar el ecosistema de dependencias de una forma más madura.

---

## Próximo tema

En el próximo tema vas a aprender a excluir dependencias transitivas cuando haga falta, porque después de entender cómo aparece una librería por la cadena de resolución, el siguiente paso natural es saber cómo cortar conscientemente una parte de esa cadena cuando no te conviene que cierta dependencia entre al proyecto.
