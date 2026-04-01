---
title: "Interpretar la salida de Maven: qué está haciendo realmente cuando compilás, testeás y empaquetás"
description: "Cuarto tema práctico del curso de Maven: aprender a leer la salida de Maven, interpretar mensajes de build, entender qué hace en cada comando y perderle el miedo a los logs básicos."
order: 4
module: "Fundamentos de Maven"
level: "intro"
draft: false
---

# Interpretar la salida de Maven: qué está haciendo realmente cuando compilás, testeás y empaquetás

## Objetivo del tema

En este cuarto tema vas a:

- aprender a leer la salida de Maven en terminal
- entender qué está haciendo Maven cuando ejecutás comandos como `compile`, `test` y `package`
- reconocer mensajes importantes de éxito, descarga, compilación y error
- distinguir lo esencial de lo accesorio en el log
- perderle el miedo a la salida de consola de Maven

La idea es que Maven deje de sentirse como una caja negra que “corre cosas” y empiece a sentirse como una herramienta que podés observar y entender.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- modificar el `pom.xml`
- agregar dependencias
- ejecutar:
  - `mvn compile`
  - `mvn test`
  - `mvn package`

Si hiciste los temas anteriores, podés seguir usando tu proyecto actual.

---

## Idea central del tema

Cuando ejecutás un comando Maven, no alcanza con mirar solo si terminó bien o mal.

También conviene aprender a leer:

- qué fase está ejecutando
- qué plugin está usando
- si está compilando o testeando
- si está descargando dependencias
- y dónde apareció realmente el error cuando algo falla

Dicho simple:

> leer mejor la salida de Maven te da mucha más autonomía para entender el build y para detectar problemas sin entrar en pánico.

---

## Qué vas a hacer hoy

Hoy no vas a aprender una parte “nueva” del `pom.xml`.
Vas a hacer algo más importante para el día a día:

1. ejecutar comandos Maven
2. mirar la salida con criterio
3. identificar qué partes importan
4. provocar errores chicos para aprender a interpretarlos
5. distinguir éxito, advertencia y falla

---

## Primer experimento: correr `mvn compile`

Ejecutá en tu proyecto:

```bash
mvn compile
```

Probablemente veas una salida parecida a esta:

```bash
[INFO] Scanning for projects...
[INFO]
[INFO] ----------------< com.gabriel.mavencurso:mi-primer-proyecto-maven >----------------
[INFO] Building Mi primer proyecto Maven 0.1.0-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:...:resources (default-resources) @ mi-primer-proyecto-maven ---
[INFO] skip non existing resourceDirectory ...
[INFO]
[INFO] --- compiler:...:compile (default-compile) @ mi-primer-proyecto-maven ---
[INFO] Nothing to compile - all classes are up to date
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

No importa si cambia un poco.
La lógica general es la misma.

---

## Bloques importantes de la salida

## 1. `Scanning for projects...`

Ejemplo:

```bash
[INFO] Scanning for projects...
```

Maven está leyendo el proyecto actual y buscando el `pom.xml`.

---

## 2. Identificación del proyecto

Ejemplo:

```bash
[INFO] ----------------< com.gabriel.mavencurso:mi-primer-proyecto-maven >----------------
[INFO] Building Mi primer proyecto Maven 0.1.0-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
```

Esto te dice:

- qué proyecto está construyendo
- qué versión está usando
- qué packaging tiene

O sea:
- Maven te confirma el contexto del build

---

## 3. Ejecución de plugins

Ejemplo:

```bash
[INFO] --- compiler:...:compile (default-compile) @ mi-primer-proyecto-maven ---
```

Acá hay una idea importantísima.

Maven ejecuta fases,
pero para hacer cosas concretas usa **plugins**.

En este caso, el plugin de compilación se está encargando de compilar.

No hace falta dominar plugins todavía.
Sí hace falta que te vayas acostumbrando a leer que Maven suele mostrar:

- qué plugin está usando
- qué goal está ejecutando
- en qué proyecto lo está haciendo

---

## 4. Resultado final

Ejemplo:

```bash
[INFO] BUILD SUCCESS
```

Esto significa:
- el comando terminó bien

Si hubiera un error grave, verías algo como:

```bash
[ERROR] BUILD FAILURE
```

---

## Primer aprendizaje práctico

No leas la salida de Maven como un bloque gigante.
Leela por capas:

1. ¿Qué proyecto está construyendo?
2. ¿Qué parte está ejecutando?
3. ¿Qué plugin aparece?
4. ¿Terminó en `BUILD SUCCESS` o `BUILD FAILURE`?

Solo con eso ya entendés muchísimo más.

---

## Segundo experimento: correr `mvn test`

Ejecutá:

```bash
mvn test
```

Ahora la salida va a ser un poco más larga porque Maven:

- compila el código principal
- compila los tests
- ejecuta los tests

Podrías ver fragmentos como estos:

```bash
[INFO] --- compiler:...:compile (default-compile) @ mi-primer-proyecto-maven ---
[INFO] --- resources:...:testResources (default-testResources) @ mi-primer-proyecto-maven ---
[INFO] --- compiler:...:testCompile (default-testCompile) @ mi-primer-proyecto-maven ---
[INFO] --- surefire:...:test (default-test) @ mi-primer-proyecto-maven ---
```

---

## Qué significa cada uno

### `compile`
Compila el código de `src/main/java`.

### `testResources`
Procesa recursos de test si existen.

### `testCompile`
Compila el código de `src/test/java`.

### `surefire:test`
Ejecuta los tests.

Acá aparece algo clave:

> Maven no hace “magia”. Va mostrando qué parte del trabajo está haciendo.

---

## Qué plugin corre los tests

En la mayoría de los proyectos básicos, Maven usa el plugin **Surefire** para ejecutar tests.

Por eso aparece algo como:

```bash
[INFO] --- surefire:...:test (default-test) @ mi-primer-proyecto-maven ---
```

No hace falta profundizar hoy en configuración de plugins.
Sí conviene que te quede esta idea:

- compilar suele pasar por el plugin de compilación
- testear suele pasar por Surefire

---

## Tercer experimento: correr `mvn package`

Ejecutá:

```bash
mvn package
```

Ahora Maven va a pasar por más pasos.
Además de compilar y testear, debería llegar a empaquetar el proyecto.

Podrías ver algo como:

```bash
[INFO] --- jar:...:jar (default-jar) @ mi-primer-proyecto-maven ---
[INFO] Building jar: .../target/mi-primer-proyecto-maven-0.1.0-SNAPSHOT.jar
```

## Qué significa esto

Acá Maven te está diciendo que está construyendo el `.jar`.

O sea:
- si corrés `package`, prestá especial atención a la parte donde aparece `jar:...:jar`

---

## Qué significa `Nothing to compile`

A veces Maven muestra:

```bash
[INFO] Nothing to compile - all classes are up to date
```

Eso no es error.
Significa:
- no detectó cambios desde la última compilación

Es una señal normal.

---

## Qué significa `skip non existing resourceDirectory`

A veces aparece algo como:

```bash
[INFO] skip non existing resourceDirectory ...
```

Tampoco es error.
Solo significa que no existe cierta carpeta de recursos, por ejemplo:

```text
src/main/resources
```

Si no la necesitás todavía, no pasa nada.

---

## Diferencia entre `[INFO]`, `[WARNING]` y `[ERROR]`

Maven marca la salida con distintos niveles.

### `[INFO]`
Información normal del proceso.

### `[WARNING]`
Hay algo que conviene mirar, pero no necesariamente rompe el build.

### `[ERROR]`
Hubo un error real y el build falló.

Esta distinción te ayuda muchísimo a no reaccionar igual frente a todo.

---

## Ejercicio 1 — aprender a leer un build exitoso

Corré estos comandos y mirá qué partes aparecen:

```bash
mvn compile
mvn test
mvn package
```

En cada uno tratá de identificar:

1. el nombre del proyecto
2. el packaging
3. el plugin que aparece
4. la parte final del build
5. si compila, testea o empaqueta

No hace falta que entiendas cada línea.
Sí hace falta que ya no veas la salida como ruido total.

---

## Ejercicio 2 — provocar un error de compilación

Abrí `App.java` y rompé el código a propósito.
Por ejemplo, dejá algo así:

```java
package com.gabriel.maven;

public class App {
    public static void main(String[] args) {
        System.out.println("Hola Maven")
    }
}
```

Falta el `;`.

Ahora ejecutá:

```bash
mvn compile
```

---

## Qué deberías observar

Seguramente aparezca algo como:

```bash
[ERROR] COMPILATION ERROR :
[ERROR] ...
[ERROR] ';' expected
[ERROR] ...
[INFO] BUILD FAILURE
```

## Qué tenés que aprender de esto

Cuando Maven falla, no hace falta leer todo desesperadamente.
Buscá:

- dónde aparece `ERROR`
- qué tipo de error dice
- en qué archivo
- en qué línea o zona

Después corregí el archivo y volvé a correr:

```bash
mvn compile
```

---

## Ejercicio 3 — provocar un error en el `pom.xml`

Rompé a propósito una etiqueta del `pom.xml`.

Por ejemplo:

```xml
<artifactId>mi-primer-proyecto-maven
```

Sin cierre correcto.

Ahora corré:

```bash
mvn compile
```

## Qué deberías ver

Maven probablemente falle antes de empezar a compilar.
Eso ya te enseña algo importante:

> si el `pom.xml` está mal, Maven ni siquiera puede interpretar correctamente el proyecto.

Después corregilo.

---

## Cómo leer un error sin ahogarte

Cuando Maven falla, hacé esto:

### Paso 1
Buscá `BUILD FAILURE`

### Paso 2
Buscá las primeras líneas con `[ERROR]`

### Paso 3
Preguntate:
- ¿es error del código Java?
- ¿es error del `pom.xml`?
- ¿es una dependencia?
- ¿es un test?

### Paso 4
Ubicá:
- archivo
- línea
- mensaje central

### Paso 5
Corregí una cosa por vez

Esto vale muchísimo más que leer toda la terminal de forma caótica.

---

## Error de compilación vs error de test

Conviene distinguirlos.

### Error de compilación
Pasa antes.
Maven ni siquiera logra compilar el código.

### Error de test
El código principal compila,
pero los tests fallan.

Eso se ve distinto en la salida.

---

## Ejercicio 4 — provocar un fallo de test

Si tenés un test simple, podrías modificarlo para que falle a propósito.

Por ejemplo, si usa una aserción, hacela incorrecta.

Después corré:

```bash
mvn test
```

## Qué deberías notar

Ahora el fallo no es de compilación.
Es de test.

Maven va a marcar algo relacionado con ejecución de tests,
y el `BUILD FAILURE` vendrá después de esa parte.

Esto te ayuda a distinguir:
- “mi código no compila”
de
- “mi test no pasó”

---

## Qué significa que Maven descargue cosas durante el build

Si agregaste dependencias o es la primera vez que usás ciertos plugins,
podés ver descargas.

Eso significa que Maven está resolviendo:

- dependencias del proyecto
- plugins necesarios para el build
- artefactos relacionados

No es raro.
Es parte normal del proceso.

---

## Qué no hace falta leer línea por línea

No hace falta entender:

- cada número de versión
- cada plugin al detalle
- cada línea de recursos
- cada mensaje repetido

En esta etapa, el objetivo es más simple:

> aprender a orientarte en el log y a detectar qué está pasando a grandes rasgos.

---

## Resumen mental de lectura rápida

Cuando corras un comando Maven, tratá de mirar esto:

### 1. Qué comando ejecutaste
- `compile`
- `test`
- `package`

### 2. Qué proyecto está leyendo
- nombre
- versión
- packaging

### 3. Qué plugins aparecen
- compiler
- surefire
- jar

### 4. Qué resultado final hubo
- `BUILD SUCCESS`
- `BUILD FAILURE`

### 5. Si falló, qué tipo de error fue
- código Java
- tests
- `pom.xml`
- dependencia

Esto ya te da mucha autonomía.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Corré:

```bash
mvn compile
```

Y anotá:
- nombre del proyecto
- packaging
- plugin que compila

### Ejercicio 2
Corré:

```bash
mvn test
```

Y anotá:
- qué parte compila tests
- qué parte ejecuta tests

### Ejercicio 3
Corré:

```bash
mvn package
```

Y anotá:
- en qué línea o zona se genera el `.jar`

### Ejercicio 4
Provocá un error de compilación en `App.java` y corregilo.

### Ejercicio 5
Provocá un error pequeño en `pom.xml` y corregilo.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué significa `BUILD SUCCESS`?
2. ¿Qué significa `BUILD FAILURE`?
3. ¿Qué diferencia hay entre error de compilación y error de test?
4. ¿Qué parte de la salida mirarías primero si algo falla?
5. ¿Qué plugin suele aparecer cuando Maven ejecuta tests?
6. ¿Qué plugin o parte mirarías cuando empaqueta un `.jar`?

---

## Mini desafío

Creá un proyecto nuevo o usá el mismo y hacé este recorrido:

1. compilá
2. testeá
3. empaquetá
4. rompé el código
5. leé el error
6. corregí
7. rompé el `pom.xml`
8. leé el error
9. corregí
10. volvé a empaquetar

Tu objetivo no es solo que “ande”, sino aprender a mirar qué está pasando.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este cuarto tema, ya deberías poder:

- leer la salida básica de Maven sin miedo
- ubicar proyecto, versión y packaging en el log
- reconocer compile, test y package en la salida
- distinguir éxito y error
- diferenciar errores de compilación, tests y `pom.xml`
- y sentir que ya no estás ejecutando Maven completamente a ciegas

---

## Resumen del tema

- Maven muestra bastante información útil en la terminal.
- No hace falta leer todo, pero sí aprender a orientarte.
- Los mensajes clave suelen ser:
  - identificación del proyecto
  - plugins en ejecución
  - `BUILD SUCCESS`
  - `BUILD FAILURE`
- Los errores más comunes pueden venir del código, los tests o el `pom.xml`.
- Leer mejor la salida de Maven te da mucha más autonomía.
- Ya empezaste a usar Maven no solo como herramienta, sino también como proceso observable.

---

## Próximo tema

En el próximo tema vas a aprender mejor cómo funciona el ciclo de vida de Maven, porque después de empezar a leer la salida de sus comandos, el siguiente paso natural es entender por qué `compile`, `test` y `package` se comportan como se comportan y qué significa realmente que Maven trabaje por fases.
