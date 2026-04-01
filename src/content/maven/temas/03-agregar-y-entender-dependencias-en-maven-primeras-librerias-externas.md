---
title: "Agregar y entender dependencias en Maven: primeras librerías externas"
description: "Tercer tema práctico del curso de Maven: aprender a agregar dependencias, entender para qué sirve el bloque dependencies, usar scopes básicos y comprobar en la práctica cómo Maven descarga y usa librerías externas."
order: 3
module: "Fundamentos de Maven"
level: "intro"
draft: false
---

# Agregar y entender dependencias en Maven: primeras librerías externas

## Objetivo del tema

En este tercer tema vas a:

- entender qué es una dependencia en Maven
- aprender a declarar librerías dentro de `pom.xml`
- usar una dependencia real en el código
- distinguir entre dependencias de producción y de testing
- conocer el scope `test`
- verificar cómo Maven descarga librerías automáticamente

La idea es que veas uno de los mayores poderes de Maven:

> no tener que bajar, copiar y administrar manualmente archivos `.jar`.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- ejecutar `mvn compile`, `mvn test`, `mvn package`
- leer y modificar bloques básicos del `pom.xml`

Si hiciste los temas anteriores, podés seguir usando tu proyecto actual.

---

## Qué es una dependencia

Una dependencia es una librería externa que tu proyecto necesita para funcionar o para testear.

Ejemplos típicos:

- JUnit para tests
- Jackson para JSON
- Lombok
- drivers de base de datos
- frameworks como Spring

En Maven, las dependencias se declaran en el bloque:

```xml
<dependencies>
    ...
</dependencies>
```

Cada dependencia se identifica principalmente por:

- `groupId`
- `artifactId`
- `version`

---

## Idea central del tema

Sin Maven, muchas veces tendrías que:

- buscar la librería
- descargar el `.jar`
- meterlo en una carpeta
- configurarlo en el proyecto
- repetir eso para sus dependencias internas

Con Maven, vos declarás qué querés usar y Maven intenta resolverlo por vos.

Dicho simple:

> en vez de administrar jars a mano, declarás dependencias y Maven se encarga de conseguirlas.

---

## Qué vas a hacer hoy

Hoy vas a hacer dos cosas muy concretas:

1. usar una librería externa en el código principal
2. usar una librería para tests

Así vas a ver dos mundos distintos:
- dependencias para la aplicación
- dependencias solo para testing

---

## Primer paso: mirar el bloque dependencies actual

Abrí tu `pom.xml`.

Probablemente ya tenga algo parecido a esto dentro de `dependencies`:

```xml
<dependencies>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>3.8.1</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

O quizá alguna versión distinta según la plantilla.

No te preocupes por memorizar todo todavía.
Lo importante es empezar a leer la estructura.

---

## Estructura de una dependencia

Una dependencia típica se escribe así:

```xml
<dependency>
    <groupId>grupo.de.la.libreria</groupId>
    <artifactId>nombre-libreria</artifactId>
    <version>x.y.z</version>
</dependency>
```

Y a veces también tiene:

```xml
<scope>test</scope>
```

---

## Qué significa cada parte

### `groupId`
Identifica el grupo o la organización de la librería.

### `artifactId`
Es el nombre técnico del artefacto.

### `version`
Versión de esa librería.

### `scope`
Indica en qué contexto se usa esa dependencia.

---

## Primer caso práctico: agregar una librería externa de verdad

Vamos a usar una dependencia muy simple y conocida:
**Apache Commons Lang**.

Agregá dentro de `dependencies` esto:

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.14.0</version>
</dependency>
```

Si tu bloque actual ya tiene JUnit, debería quedar algo así:

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-lang3</artifactId>
        <version>3.14.0</version>
    </dependency>

    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>3.8.1</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## ¿Qué librería es esta?

`commons-lang3` trae utilidades muy usadas para trabajar con:

- strings
- objetos
- validaciones
- utilidades generales de Java

No importa demasiado aprender la librería hoy.
Lo importante es usarla para entender cómo Maven maneja dependencias.

---

## Volvé a compilar

Ejecutá:

```bash
mvn compile
```

## Qué debería pasar

Maven va a:

- leer tu `pom.xml`
- detectar la dependencia nueva
- descargarla si no la tenías
- compilar el proyecto

En la terminal probablemente veas líneas de descarga la primera vez.

Después, si todo sale bien:

```bash
BUILD SUCCESS
```

---

## ¿Dónde descargó Maven esa librería?

Maven guarda dependencias en tu repositorio local.

En Windows suele estar en una ruta como:

```text
C:\Users\TU_USUARIO\.m2\repository
```

Ahí vas a encontrar carpetas relacionadas con la dependencia descargada.

No hace falta que explores todo ahora.
Solo quedate con esta idea:

> Maven guarda localmente lo que descarga para no bajarlo otra vez cada vez.

---

## Usar la dependencia en el código

Ahora abrí `App.java`.

Reemplazalo por algo así:

```java
package com.gabriel.maven;

import org.apache.commons.lang3.StringUtils;

public class App {
    public static void main(String[] args) {
        String texto = "   ";

        if (StringUtils.isBlank(texto)) {
            System.out.println("El texto está vacío o en blanco.");
        } else {
            System.out.println("El texto tiene contenido.");
        }
    }
}
```

---

## Volvé a compilar

```bash
mvn compile
```

Si la dependencia está bien declarada, esto debería compilar sin problema.

## Qué acabás de comprobar

Que Maven:

- descargó una librería externa
- la puso a disposición del proyecto
- y te dejó usarla sin gestionar ningún `.jar` manualmente

Eso es una parte central del valor de Maven.

---

## Segundo caso práctico: dependencia para testing

Ahora vamos a mirar la idea de `scope`.

### Caso típico
Hay librerías que necesitás:
- para correr la app

Y otras que necesitás:
- solo para testear

JUnit entra en la segunda categoría.

Por eso suele tener:

```xml
<scope>test</scope>
```

Eso quiere decir que la dependencia está pensada para:
- compilar y ejecutar tests
pero no para el código principal de producción.

---

## Ejercicio 1 — entender el scope test

Dejá la dependencia de JUnit tal como está y ejecutá:

```bash
mvn test
```

Eso debería funcionar.

Ahora pensá esta idea:

> JUnit está disponible para testear, no necesariamente para tu código principal.

---

## Prueba práctica: intentar usar JUnit en `App.java`

Este ejercicio es para que veas el error y lo entiendas.

Agregá algo incorrecto en `App.java`, por ejemplo un import de JUnit:

```java
import junit.framework.TestCase;
```

Después corré:

```bash
mvn compile
```

## Qué debería pasar

Probablemente falle la compilación del código principal.

¿La razón?
Porque JUnit está declarado con:

```xml
<scope>test</scope>
```

Entonces Maven lo considera disponible para tests, no para `src/main/java`.

### Importante
Después de ver el error, borrá ese import incorrecto.

---

## Qué aprendiste con este error

Que no todas las dependencias están disponibles en todos los contextos.

Y eso es buenísimo, porque te obliga a separar mejor:

- código principal
- librerías de producción
- librerías de test

---

## Tercer caso práctico: agregar una dependencia de test más moderna

Si querés, podés reemplazar el viejo JUnit que vino por defecto por una dependencia más actual como JUnit Jupiter.

Podés usar esta:

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.10.2</version>
    <scope>test</scope>
</dependency>
```

## Pero atención

Si hacés eso, el test generado por la plantilla vieja probablemente ya no te funcione igual.
Para este tema inicial, está bien que:

- o mantengas el JUnit original de la plantilla
- o cambies a JUnit 5 y aceptes que después vas a tener que adaptar el test

Como hoy estamos aprendiendo Maven,
no hace falta abrir todavía el frente de migrar testing.

---

## Ejercicio 2 — agregar una segunda dependencia útil

Agregá otra dependencia externa.
Por ejemplo Guava:

```xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>33.0.0-jre</version>
</dependency>
```

Después corré:

```bash
mvn compile
```

No hace falta usarla todavía en el código.
La idea es que te acostumbres a:

- declarar
- compilar
- verificar que Maven resuelve la librería

---

## Qué pasa si declarás mal una dependencia

Por ejemplo, si escribís mal un `artifactId` o una `version`, Maven puede fallar intentando resolverla.

Esto también es una buena señal:
- Maven te avisa que no pudo encontrar lo que pediste.

No es magia.
Depende de que las coordenadas estén bien escritas.

---

## Error común 1: creer que cualquier dependencia funciona sin versión

En la mayoría de los casos, si no estás usando mecanismos más avanzados, necesitás indicar la versión.

Ejemplo correcto:

```xml
<version>3.14.0</version>
```

---

## Error común 2: meter dependencias sin saber para qué están

Agregar muchas dependencias “por si acaso” ensucia el proyecto.

Conviene preguntar siempre:
- ¿para qué la necesito?
- ¿la uso en producción o solo en test?

---

## Error común 3: no distinguir código principal y tests

Este tema justamente quiere que te quede clara esa separación:

- `src/main/java` → código principal
- `src/test/java` → tests

Y las dependencias pueden acompañar esa diferencia con `scope`.

---

## Error común 4: tocar dependencias y no recompilar

Cada vez que cambies `pom.xml`, acostumbrate a correr algo como:

```bash
mvn compile
```

o

```bash
mvn test
```

Así verificás enseguida si lo que declaraste tiene sentido.

---

## Mini análisis del flujo real

Con este tema ya deberías empezar a ver algo muy importante:

Maven no es solo “comandos”.
También es:

- resolución de dependencias
- contexto de uso
- orden del build
- estructura estándar
- identidad del proyecto

Eso ya lo vuelve mucho más valioso que un simple script de compilación.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Agregá `commons-lang3` al `pom.xml`.

### Ejercicio 2
Usá `StringUtils.isBlank()` en `App.java`.

### Ejercicio 3
Ejecutá:

```bash
mvn compile
```

### Ejercicio 4
Probá correr:

```bash
mvn test
```

### Ejercicio 5
Intentá usar una clase de JUnit dentro de `App.java`, observá el error y después corregilo.

### Ejercicio 6
Agregá una segunda dependencia externa de producción, por ejemplo `guava`, y verificá que Maven la resuelva.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es una dependencia?
2. ¿Qué función cumple el bloque `dependencies`?
3. ¿Qué significa `scope: test`?
4. ¿Por qué JUnit no debería usarse normalmente en `src/main/java` si está en scope `test`?
5. ¿Qué ventaja te da Maven frente a bajar jars a mano?

---

## Mini desafío

Creá un proyecto nuevo llamado, por ejemplo:

- `texto-utilidades-maven`

Y hacé esto:

- agregá `commons-lang3`
- usá una función de esa librería dentro de `main`
- corré `mvn compile`
- corré `mvn package`

Tu objetivo es repetir el flujo completo sin depender del proyecto anterior.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tercer tema, ya deberías poder:

- entender qué es una dependencia en Maven
- declarar dependencias en `pom.xml`
- diferenciar dependencia de producción y de test
- usar una librería externa en tu código
- entender para qué sirve `scope`
- y confiar un poco más en que Maven te resuelve trabajo real del proyecto

---

## Resumen del tema

- Las dependencias son librerías externas que el proyecto necesita.
- Se declaran dentro del bloque `dependencies`.
- Cada dependencia usa:
  - `groupId`
  - `artifactId`
  - `version`
- `scope` indica en qué contexto se usa una librería.
- `test` significa que la dependencia está pensada para tests.
- Ya usaste una dependencia real en tu código principal.
- Ya viste que Maven descarga y gestiona librerías automáticamente.

---

## Próximo tema

En el próximo tema vas a aprender mejor cómo leer el resultado de los comandos de Maven y cómo entender qué está haciendo realmente cuando compilás, testeás o empaquetás, porque después de empezar a usar dependencias externas, el siguiente paso natural es interpretar mejor la salida de Maven y no verlo solo como una caja negra que “corre cosas”.
