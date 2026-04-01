---
title: "Entender los scopes de dependencias en Maven: compile, test y runtime"
description: "Séptimo tema práctico del curso de Maven: aprender qué es el scope de una dependencia y entender en la práctica cómo cambian compile, test y runtime dentro de un proyecto Maven."
order: 7
module: "Fundamentos de Maven"
level: "intro"
draft: false
---

# Entender los scopes de dependencias en Maven: compile, test y runtime

## Objetivo del tema

En este séptimo tema vas a:

- entender qué significa `scope` en una dependencia Maven
- distinguir entre `compile`, `test` y `runtime`
- ver cómo cambia el comportamiento de una librería según su scope
- comprobar en la práctica cuándo una dependencia está disponible y cuándo no
- evitar uno de los errores más comunes al empezar con Maven: meter todas las librerías “sin contexto”

La idea es que no solo sepas declarar dependencias, sino también ubicarlas correctamente según para qué las necesitás.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer el `pom.xml`
- agregar dependencias
- entender la diferencia entre `package` e `install`
- saber que Maven distingue entre código principal y tests

Si hiciste los temas anteriores, ya tenés la base perfecta para este paso.

---

## Idea central del tema

No todas las dependencias se usan igual.

Algunas las necesitás:

- para compilar el código principal
- otras solo para testear
- otras para ejecutar la aplicación, pero no necesariamente para compilar

Maven resuelve eso con el campo:

```xml
<scope>...</scope>
```

Dicho simple:

> el `scope` le dice a Maven en qué contexto tiene sentido usar una dependencia.

---

## Qué es un scope

El `scope` define el alcance de una dependencia dentro del proyecto.

Eso afecta cosas como:

- si está disponible en `src/main/java`
- si está disponible en `src/test/java`
- si participa del build principal
- si se usa solo en test
- si se necesita más en ejecución que en compilación

---

## Scopes que hoy te importan más

En este tema te voy a hacer foco en tres:

- `compile`
- `test`
- `runtime`

Más adelante existen otros como `provided`, pero por ahora no hace falta abrir más frentes.

---

## Scope `compile`

Es el scope más común.
De hecho, si no escribís ningún scope, Maven normalmente interpreta `compile`.

Ejemplo:

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.14.0</version>
</dependency>
```

Esto equivale, conceptualmente, a algo como:

```xml
<scope>compile</scope>
```

## Qué significa

La dependencia está disponible para:

- compilar el código principal
- ejecutar el proyecto
- compilar tests
- correr tests

Es el caso “normal” de una librería que realmente forma parte del proyecto principal.

---

## Scope `test`

Ejemplo típico:

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.13.2</version>
    <scope>test</scope>
</dependency>
```

## Qué significa

La dependencia está disponible para:

- compilar tests
- correr tests

Pero no para:

- el código principal de `src/main/java`

---

## Scope `runtime`

Este suele costar más al principio.

Ejemplo típico:
un driver de base de datos.

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <version>2.2.224</version>
    <scope>runtime</scope>
</dependency>
```

## Qué significa

La dependencia no es necesaria para compilar el código fuente principal en todos los casos,
pero sí para ejecutar la aplicación o correr algo en runtime.

No vamos a profundizar demasiado todavía en escenarios complejos.
Lo importante ahora es que entiendas la idea:

> `runtime` apunta más al momento de ejecución que al momento de compilación.

---

## Una intuición muy útil

Podés pensarlo así:

### `compile`
La necesito para construir normalmente mi proyecto.

### `test`
La necesito solo para testear.

### `runtime`
La necesito cuando el proyecto corre, aunque no sea tan central en compilación.

Esta distinción ya te ordena muchísimo.

---

## Primer experimento: dependencia con scope compile

Si ya agregaste `commons-lang3`, perfecto.
Si no, agregala ahora:

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.14.0</version>
</dependency>
```

O si querés ser explícito:

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.14.0</version>
    <scope>compile</scope>
</dependency>
```

Ahora usala en `App.java`:

```java
package com.gabriel.maven;

import org.apache.commons.lang3.StringUtils;

public class App {
    public static void main(String[] args) {
        String nombre = "Gabriel";

        if (StringUtils.isNotBlank(nombre)) {
            System.out.println("Hola " + nombre);
        }
    }
}
```

Corré:

```bash
mvn compile
```

## Qué deberías observar

Compila bien.
Porque la dependencia está disponible para el código principal.

---

## Segundo experimento: dependencia con scope test

Asegurate de tener una dependencia de test, por ejemplo:

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.13.2</version>
    <scope>test</scope>
</dependency>
```

Ahora hacé esta prueba:

### Paso 1
Intentá usar JUnit en `App.java`:

```java
import org.junit.Test;
```

### Paso 2
Corré:

```bash
mvn compile
```

## Qué debería pasar

Falla.
Porque esa dependencia está en scope `test`,
y `App.java` pertenece al código principal.

### Importante
Después borrá ese import incorrecto.

---

## Qué acabás de comprobar

Que una dependencia con `scope test`:

- no sirve para `src/main/java`
- sí sirve para `src/test/java`

Esto es central.

---

## Tercer experimento: usar la dependencia de test donde sí corresponde

Abrí o creá un archivo de test en:

```text
src/test/java
```

Por ejemplo, algo así:

```java
package com.gabriel.maven;

import org.junit.Test;

public class AppTest {

    @Test
    public void testBasico() {
        System.out.println("Test ejecutado correctamente.");
    }
}
```

Ahora corré:

```bash
mvn test
```

## Qué deberías ver

El test corre bien,
porque JUnit está disponible en contexto de test.

---

## Qué pasaría si una dependencia importante estuviera mal scopeada

Muchos errores de Maven o de proyecto vienen de esto.

Por ejemplo:

- una librería que el código principal usa,
  pero que quedó en `test`
- una dependencia que debería participar del runtime,
  pero quedó mal declarada
- una librería de test puesta como `compile`,
  ensuciando innecesariamente el proyecto

Entonces aparece una verdad muy importante:

> declarar bien el scope no es detalle administrativo; afecta directamente qué código compila, qué tests corren y qué dependencias ensucian o no el proyecto.

---

## Primer mini resumen práctico

### Dependencia sin scope
Normalmente actúa como `compile`.

### Dependencia con `scope test`
Solo para tests.

### Dependencia con `scope runtime`
Más orientada a ejecución que a compilación principal.

---

## Ejercicio 1 — comparar compile y test

Quiero que hagas esto:

### Paso 1
Dejá `commons-lang3` en `compile` o sin scope.

### Paso 2
Usala en `App.java`.

### Paso 3
Verificá que `mvn compile` funcione.

### Paso 4
Después cambiá temporalmente esa misma dependencia a:

```xml
<scope>test</scope>
```

### Paso 5
Volvé a correr:

```bash
mvn compile
```

## Qué deberías observar

Ahora debería fallar si `App.java` depende de esa librería.

### Paso 6
Volvé a dejarla como estaba.

Este ejercicio te hace sentir de forma muy concreta el valor del scope.

---

## Ejercicio 2 — agregar una dependencia runtime

Agregá esta dependencia:

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <version>2.2.224</version>
    <scope>runtime</scope>
</dependency>
```

No hace falta usarla todavía.
La idea es que:

- veas una dependencia de tipo distinto
- te acostumbres a leer el `pom.xml` con contextos diferentes

Después corré:

```bash
mvn compile
```

y también:

```bash
mvn package
```

---

## ¿Por qué un driver de base puede ser runtime?

Porque muchas veces tu código compila contra interfaces, configuraciones o frameworks,
pero el driver específico se necesita fuertemente cuando la aplicación corre y abre la conexión real.

No hace falta que domines este caso hoy.
Solo quedate con esta idea:

> `runtime` suele aparecer mucho en piezas ligadas a ejecución real del sistema, como ciertos drivers.

---

## Error común 1 — no poner scope y meter todo como compile

Eso funciona a veces,
pero ensucia.
No toda dependencia tiene que vivir como dependencia principal.

Conviene preguntarte siempre:
- ¿la necesito para el código principal?
- ¿la necesito solo para test?
- ¿la necesito más para runtime?

---

## Error común 2 — poner una dependencia útil del código principal en `test`

Eso rompe compilación o produce errores que al principio parecen raros.

---

## Error común 3 — pensar que `runtime` y `test` son casi lo mismo

No.
Los dos son más específicos que `compile`,
pero no cumplen el mismo rol.

### `test`
Apunta al mundo de pruebas.

### `runtime`
Apunta al mundo de ejecución.

---

## Error común 4 — no revisar el contexto donde usás una clase

Antes de decir:
- “Maven no anda”

preguntate:
- ¿esta librería está declarada con el scope correcto para donde la estoy usando?

Eso ahorra mucho tiempo.

---

## Ejercicio 3 — identificar scopes en tu propio `pom.xml`

Mirá tu `pom.xml` y hacé una mini clasificación de cada dependencia:

- ¿esta es de `compile`?
- ¿es de `test`?
- ¿es de `runtime`?

Aunque hoy tengas pocas dependencias,
quiero que empieces a entrenar la cabeza en esa pregunta.

---

## Qué relación tiene esto con la limpieza del proyecto

Muchísima.

Un `pom.xml` bien scopeado:

- comunica mejor para qué está cada librería
- evita ensuciar el código principal con dependencias de test
- te da más claridad
- y te prepara para proyectos más grandes

O sea:

> Maven no solo te ayuda a descargar dependencias; también te ayuda a ordenarlas con intención.

---

## Una intuición muy útil

Podés pensar el scope como una pregunta:

> “¿En qué momento de la vida del proyecto necesito realmente esta dependencia?”

Eso te da una forma muy clara de decidir.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Usá una dependencia `compile` real en `App.java`.

### Ejercicio 2
Intentá usar una dependencia `test` en `App.java` y observá el error.

### Ejercicio 3
Usá una dependencia `test` correctamente en un archivo dentro de `src/test/java`.

### Ejercicio 4
Agregá una dependencia `runtime`.

### Ejercicio 5
Escribí con tus palabras qué diferencia hay entre:
- `compile`
- `test`
- `runtime`

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es el `scope` de una dependencia?
2. ¿Qué significa `compile`?
3. ¿Qué significa `test`?
4. ¿Qué significa `runtime` en un nivel inicial?
5. ¿Por qué una dependencia de test no debería usarse normalmente en `src/main/java`?
6. ¿Qué ventaja da declarar correctamente los scopes?

---

## Mini desafío

Creá un proyecto nuevo, por ejemplo:

- `scopes-practica-maven`

Y hacé esto:

- agregá una dependencia `compile`
- agregá una dependencia `test`
- agregá una dependencia `runtime`
- usá bien al menos una de ellas en código principal
- usá bien otra en tests
- provocá un error de scope y corregilo

Esto te va a dejar el concepto muchísimo más firme.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este séptimo tema, ya deberías poder:

- entender qué es el `scope` de una dependencia
- distinguir `compile`, `test` y `runtime`
- usar dependencias en el contexto correcto
- identificar errores simples de scope
- y escribir dependencias Maven con más intención y menos inercia

---

## Resumen del tema

- El `scope` define en qué contexto usa Maven una dependencia.
- `compile` es el scope normal del código principal.
- `test` es para pruebas.
- `runtime` apunta más al momento de ejecución.
- Elegir bien el scope mejora claridad, orden y comportamiento del proyecto.
- Ya comprobaste en la práctica que el contexto de una dependencia realmente importa.

---

## Próximo tema

En el próximo tema vas a aprender a limpiar mejor el proyecto con `mvn clean` y a entender qué rol cumple esa fase dentro del workflow real, porque después de entender cómo compilar, testear, empaquetar e instalar, el siguiente paso natural es saber cómo resetear correctamente lo generado por Maven cuando necesitás reconstruir desde cero.
