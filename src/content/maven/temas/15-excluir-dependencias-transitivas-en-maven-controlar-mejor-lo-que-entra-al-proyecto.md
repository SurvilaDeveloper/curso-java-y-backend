---
title: "Excluir dependencias transitivas en Maven: controlar mejor lo que entra al proyecto"
description: "Decimoquinto tema práctico del curso de Maven: aprender a excluir dependencias transitivas, entender cuándo conviene hacerlo y empezar a controlar con más precisión qué librerías entran realmente al proyecto."
order: 15
module: "Fundamentos de Maven"
level: "intro"
draft: false
---

# Excluir dependencias transitivas en Maven: controlar mejor lo que entra al proyecto

## Objetivo del tema

En este decimoquinto tema vas a:

- entender qué significa excluir una dependencia transitiva
- aprender la sintaxis básica de `exclusions`
- ver cuándo tiene sentido usar exclusiones
- practicar cómo cortar una parte de la cadena de dependencias
- empezar a pasar de “Maven resuelve por mí” a “Maven resuelve, pero yo también controlo”

La idea es que no solo entiendas cómo llegan dependencias transitivas al proyecto, sino también cómo evitar que ciertas librerías entren cuando no te conviene.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- agregar dependencias
- entender dependencias directas y transitivas
- usar `mvn dependency:tree`
- distinguir scopes básicos
- ejecutar el flujo normal de build

Si hiciste el tema anterior, ya estás perfecto para este paso.

---

## Idea central del tema

En el tema anterior viste algo muy importante:

- agregás una dependencia directa
- Maven trae también dependencias transitivas

Eso suele ser útil.
Pero no siempre querés quedarte con absolutamente todo lo que esa cadena trae.

A veces puede pasar que:

- una dependencia transitiva no te sirve
- te genera ruido
- entra una librería que querés evitar
- querés usar otra versión por otro camino
- o simplemente querés controlar mejor el grafo de dependencias

Ahí aparece una herramienta clave:

```xml
<exclusions>
    ...
</exclusions>
```

Dicho simple:

> excluir una dependencia transitiva significa decirle a Maven que, aunque una dependencia la traiga, vos no querés que esa librería entre al proyecto por ese camino.

---

## Qué es una exclusión

Una exclusión corta una dependencia transitiva específica dentro de una dependencia directa.

Importante:
- no excluís “cualquier cosa del proyecto”
- excluís una dependencia transitiva en el contexto de otra dependencia

Eso es muy importante conceptualmente.

---

## Una intuición muy útil

Podés pensarlo así:

- la dependencia directa abre una puerta
- la transitiva entra por esa puerta
- la exclusión pone un filtro en esa puerta concreta

Esta imagen ordena muchísimo.

---

## Sintaxis básica de una exclusión

Se escribe dentro de la dependencia que querés controlar.

Ejemplo general:

```xml
<dependency>
    <groupId>grupo.principal</groupId>
    <artifactId>artefacto-principal</artifactId>
    <version>1.0.0</version>

    <exclusions>
        <exclusion>
            <groupId>grupo.a.excluir</groupId>
            <artifactId>artefacto-a-excluir</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### Qué significa esto

Le estás diciendo a Maven:

- agregá esta dependencia principal
- pero no me traigas esta dependencia transitiva específica por este camino

---

## Primer ejemplo conceptual

Supongamos que tenés una dependencia A,
y A trae transitivamente a B.

Si vos querés A pero no querés B,
podrías hacer:

```xml
<dependency>
    <groupId>grupo.a</groupId>
    <artifactId>artefacto-a</artifactId>
    <version>1.0.0</version>

    <exclusions>
        <exclusion>
            <groupId>grupo.b</groupId>
            <artifactId>artefacto-b</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

---

## Qué problema resuelve esto

Te permite decir:

- “quiero esta librería”
- “pero no quiero todo lo que arrastra”
- “o al menos no esta parte puntual”

Entonces aparece una verdad importante:

> las exclusiones te permiten afinar el control sobre la resolución de dependencias sin tener que abandonar por completo la comodidad de Maven.

---

## Cómo saber qué excluir

Acá el árbol de dependencias vuelve a ser clave.

Normalmente el flujo es este:

1. corrés:
   ```bash
   mvn dependency:tree
   ```
2. detectás una transitiva que no querés
3. identificás de qué dependencia directa cuelga
4. agregás una exclusión sobre esa dependencia directa
5. corrés de nuevo el árbol para confirmar

Esa secuencia es muy sana y muy práctica.

---

## Primer experimento: elegir una dependencia con transitivas

Si ya agregaste Guava u otra dependencia que traiga varias transitivas, podés usarla para observar el fenómeno.

Primero corré:

```bash
mvn dependency:tree
```

Mirá qué transitivas aparecen debajo de esa dependencia.

No hace falta que entiendas todavía si conviene excluirlas o no.
Primero hay que identificar bien la relación.

---

## Importante: no excluir por deporte

No conviene salir a excluir dependencias transitivas solo para practicar sin entender lo que hacés.

¿Por qué?
Porque podés romper el proyecto o dejar a una librería sin algo que realmente necesitaba.

Entonces aparece otra idea importante:

> excluir no es “limpiar por limpiar”; es intervenir conscientemente en la cadena de dependencias.

---

## Ejemplo práctico razonable con JUnit y transitivas

Si en tu árbol aparece algo como:

```text
junit:junit:jar:4.13.2:test
\- org.hamcrest:hamcrest-core:jar:1.3:test
```

podrías ver que `hamcrest-core` llega porque `junit` lo trae.

No hace falta que lo excluyas realmente en este proyecto inicial,
pero sí podés usarlo para entender la lógica:

- `junit` = directa
- `hamcrest-core` = transitiva
- la exclusión iría dentro de la dependencia de `junit`

Ejemplo conceptual:

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>${junit.version}</version>
    <scope>test</scope>
    <exclusions>
        <exclusion>
            <groupId>org.hamcrest</groupId>
            <artifactId>hamcrest-core</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### Atención
No te recomiendo dejar esto así en tu proyecto de práctica si no sabés para qué lo hacés.
Usalo como ejemplo estructural.

---

## Primer ejercicio práctico controlado

Quiero que hagas esto:

### Paso 1
Corré:

```bash
mvn dependency:tree
```

### Paso 2
Identificá una dependencia transitiva real.

### Paso 3
Anotá:
- dependencia directa de la que cuelga
- `groupId`
- `artifactId`

### Paso 4
Escribí cómo sería su exclusión, aunque no la apliques todavía.

El objetivo es practicar la lectura y la sintaxis sin romper innecesariamente el proyecto.

---

## Segundo experimento: exclusión real y verificación

Si querés hacer una prueba real,
hacelo con mucho cuidado y sobre una dependencia que no te rompa demasiado el caso de práctica.

El flujo sería:

### Paso 1
Corré:

```bash
mvn dependency:tree
```

### Paso 2
Elegí una dependencia transitiva.

### Paso 3
Agregá la exclusión dentro de la dependencia directa correspondiente.

### Paso 4
Volvé a correr:

```bash
mvn dependency:tree
```

### Paso 5
Verificá que la transitiva ya no aparezca por ese camino.

Ese último paso es fundamental.
La exclusión no se da por hecha:
- se comprueba en el árbol

---

## Qué relación tiene esto con el árbol de dependencias

Total.

Sin el árbol, excluir sería casi ciego.

Con el árbol, podés ver:

- quién trae a quién
- por qué camino llegó la dependencia
- dónde conviene intervenir
- y si la exclusión funcionó o no

Entonces aparece una verdad importante:

> `mvn dependency:tree` y `exclusions` se entienden muchísimo mejor juntos que por separado.

---

## Qué limitación importante conviene entender

Excluir una dependencia dentro de una rama no significa necesariamente que desaparezca del proyecto entero si también entra por otra rama.

Por ejemplo:

- A trae B
- C también trae B

Si excluís B dentro de A,
pero C sigue trayéndola,
B puede seguir apareciendo en el proyecto.

Esto es muy importante conceptualmente.

Entonces aparece otra idea clave:

> una exclusión corta un camino de entrada, no borra mágicamente toda presencia global de la dependencia si existen otros caminos.

---

## Una intuición muy útil

Podés pensarlo así:

> excluir una dependencia no es “prohibirla universalmente”; es cerrar una puerta específica por la que estaba entrando.

Esa frase vale muchísimo.

---

## Error común 1 — excluir sin mirar el árbol

Eso suele generar más confusión que claridad.

Siempre que puedas, primero:
- mirá el árbol
- entendé el camino
- y recién después excluí

---

## Error común 2 — excluir algo que la librería realmente necesita

Eso puede romper compilación,
tests o ejecución.

Por eso conviene tener una razón clara para excluir,
y después volver a probar el proyecto.

---

## Error común 3 — pensar que exclusión y scope son lo mismo

No.

### `scope`
Define en qué contexto vive una dependencia.

### `exclusion`
Evita que una dependencia transitiva entre por cierto camino.

Son cosas distintas.

---

## Error común 4 — creer que una exclusión globaliza todo

Como ya viste:
- si la dependencia entra por otro camino,
  puede seguir estando

Entonces la lectura del árbol sigue siendo central.

---

## Ejercicio 2 — practicar sintaxis de exclusión

Quiero que escribas en un archivo aparte, aunque no lo apliques todavía, al menos dos exclusiones correctas usando dependencias reales que veas en tu árbol.

Por ejemplo:

```xml
<exclusions>
    <exclusion>
        <groupId>org.hamcrest</groupId>
        <artifactId>hamcrest-core</artifactId>
    </exclusion>
</exclusions>
```

El objetivo es que la sintaxis te salga natural.

---

## Qué relación tiene esto con el control del proyecto

Muy fuerte.

Al principio Maven te da mucha comodidad:
- declarás una dependencia
- él resuelve el resto

Eso está buenísimo.

Pero con el tiempo también necesitás control.
Las exclusiones son una de las primeras herramientas para empezar a intervenir conscientemente en esa resolución.

Entonces aparece una verdad importante:

> excluir transitivas es una forma muy concreta de pasar de usar Maven pasivamente a empezar a gobernarlo un poco mejor.

---

## Ejercicio 3 — verificar que el proyecto siga sano

Si hacés una exclusión real, después obligatoriamente corré algo como:

```bash
mvn clean test
```

o

```bash
mvn clean package
```

No alcanza con mirar el árbol.
También hay que ver si el proyecto sigue funcionando bien.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Corré:

```bash
mvn dependency:tree
```

### Ejercicio 2
Identificá una dependencia transitiva real.

### Ejercicio 3
Escribí la exclusión correspondiente sobre la dependencia directa que la trae.

### Ejercicio 4
Si te animás a hacer la prueba real, aplicala y después corré otra vez:

```bash
mvn dependency:tree
```

### Ejercicio 5
Verificá si el proyecto sigue sano con:

```bash
mvn clean test
```

o

```bash
mvn clean package
```

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué significa excluir una dependencia transitiva?
2. ¿Dónde se escribe una exclusión?
3. ¿Qué comando conviene usar antes de excluir algo?
4. ¿Qué comando conviene usar después de excluir algo?
5. ¿Por qué excluir una dependencia en una rama no significa necesariamente que desaparezca del proyecto entero?

---

## Mini desafío

Creá un proyecto nuevo, por ejemplo:

- `exclusiones-demo-maven`

Y hacé esto:

1. agregá una dependencia que traiga transitivas
2. corré `mvn dependency:tree`
3. identificá una transitiva concreta
4. escribí su exclusión
5. volvé a correr el árbol
6. verificá el build con `mvn test` o `mvn package`

Tu objetivo es empezar a controlar no solo qué dependencias agregás, sino también parte de lo que arrastran.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este decimoquinto tema, ya deberías poder:

- entender qué es una exclusión en Maven
- escribir una exclusión con la sintaxis correcta
- usar el árbol de dependencias para decidir mejor
- verificar si la exclusión tuvo efecto
- y empezar a controlar con más intención qué librerías entran al proyecto

---

## Resumen del tema

- Las exclusiones sirven para evitar que una dependencia transitiva entre por un camino específico.
- Se escriben dentro de la dependencia directa que trae esa transitiva.
- El árbol de dependencias es la herramienta clave para decidir y verificar exclusiones.
- Excluir una dependencia en una rama no significa necesariamente eliminarla del proyecto entero.
- No conviene excluir por deporte ni sin entender qué se está cortando.
- Ya empezaste a intervenir conscientemente en la resolución de dependencias de Maven.

---

## Próximo tema

En el próximo tema vas a aprender a usar `dependency:tree` y otras herramientas de resolución con más intención para detectar conflictos o sorpresas, porque después de entender exclusiones, el siguiente paso natural es leer el ecosistema de dependencias con un poco más de criterio y no solo como una lista de librerías presentes.
