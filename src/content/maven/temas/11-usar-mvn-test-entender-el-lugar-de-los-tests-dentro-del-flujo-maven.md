---
title: "Usar mvn test: entender el lugar de los tests dentro del flujo Maven"
description: "Undécimo tema práctico del curso de Maven: aprender qué hace mvn test, cómo encajan los tests en el lifecycle, qué diferencia hay entre compilar y testear, y cómo interpretar fallos de prueba dentro del build."
order: 11
module: "Fundamentos de Maven"
level: "intro"
draft: false
---

# Usar `mvn test`: entender el lugar de los tests dentro del flujo Maven

## Objetivo del tema

En este undécimo tema vas a:

- entender qué hace exactamente `mvn test`
- ver cómo Maven compila y ejecuta tests
- distinguir entre código principal y código de prueba
- interpretar mejor fallos de test dentro del build
- entender por qué los tests son parte del flujo normal de Maven y no un agregado raro
- practicar tests simples para sentir cómo encajan en el proyecto

La idea es que `mvn test` deje de ser “un comando más” y pase a sentirse como una parte natural del trabajo con Maven.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- agregar dependencias
- entender el lifecycle básico
- distinguir entre build y ejecución
- usar:
  - `mvn compile`
  - `mvn package`
  - `mvn install`
  - `mvn clean`

Si hiciste los temas anteriores, ya estás listo.

---

## Idea central del tema

Maven no piensa los tests como algo opcional separado del build.
Los integra en el flujo.

Eso significa que cuando ejecutás:

```bash
mvn test
```

Maven no solo “corre tests”.
También se asegura de llegar bien a esa fase.

Y cuando ejecutás:

```bash
mvn package
```

los tests también suelen entrar en juego antes del empaquetado.

Entonces aparece una idea muy importante:

> en Maven, testear no es una actividad completamente aparte; forma parte de la secuencia normal de construcción del proyecto.

---

## Qué hace exactamente `mvn test`

Cuando ejecutás:

```bash
mvn test
```

Maven normalmente hace varias cosas:

1. procesa recursos principales si hace falta
2. compila el código principal
3. procesa recursos de test si hace falta
4. compila el código de test
5. ejecuta los tests

Dicho simple:

> `mvn test` no solo ejecuta tests; también deja listo todo lo necesario para poder ejecutarlos.

---

## Qué diferencia hay entre `compile` y `test`

### `mvn compile`
Compila el código principal.

### `mvn test`
Compila el código principal, compila los tests y después ejecuta los tests.

Entonces:

> `test` incluye más trabajo que `compile`.

---

## Una intuición muy útil

Podés pensarlo así:

- `compile` te deja el proyecto compilado
- `test` te deja el proyecto compilado y además verificado por sus pruebas

Esta diferencia es muy importante en la práctica.

---

## Dónde vive el código de test

En un proyecto Maven estándar, los tests viven normalmente en:

```text
src/test/java
```

Mientras que el código principal vive en:

```text
src/main/java
```

Esto ya te muestra que Maven piensa el proyecto en dos mundos relacionados, pero distintos:

- código principal
- código de prueba

---

## Qué dependencia suele aparecer para tests

En muchos proyectos vas a tener una dependencia como JUnit con:

```xml
<scope>test</scope>
```

Eso significa justamente que la librería está disponible en contexto de test.

Por ejemplo:

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.13.2</version>
    <scope>test</scope>
</dependency>
```

Esto ya encaja perfecto con lo que venís viendo:
- código principal por un lado
- tests por otro

---

## Primer experimento práctico: correr tests existentes

Si tu proyecto ya tiene un test generado por la plantilla, corré:

```bash
mvn test
```

## Qué deberías observar

En la salida vas a ver partes relacionadas con:

- compilación principal
- compilación de test
- ejecución de tests

Y al final, si todo está bien:

```bash
BUILD SUCCESS
```

---

## Qué plugin suele ejecutar los tests

En la salida de Maven normalmente vas a ver algo relacionado con **Surefire**.

Por ejemplo:

```bash
[INFO] --- surefire:...:test (default-test) @ mi-primer-proyecto-maven ---
```

No hace falta que domines plugins todavía.
Solo quedate con esta idea:

> Maven suele usar Surefire para ejecutar tests en este flujo básico.

---

## Segundo experimento práctico: crear un test bien simple

Vamos a crear algo mínimo para sentir el flujo.

Primero, dejá tu `App.java` así:

```java
package com.gabriel.maven;

public class App {

    public static int sumar(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        System.out.println("Resultado: " + sumar(2, 3));
    }
}
```

Ahora creá o editá `AppTest.java` dentro de:

```text
src/test/java/com/gabriel/maven
```

Y dejalo así si usás JUnit 4:

```java
package com.gabriel.maven;

import org.junit.Assert;
import org.junit.Test;

public class AppTest {

    @Test
    public void sumarDosNumeros() {
        int resultado = App.sumar(2, 3);
        Assert.assertEquals(5, resultado);
    }
}
```

---

## Ejecutar el test

Ahora corré:

```bash
mvn test
```

## Qué deberías ver

Si todo está bien:

- compila el código
- compila el test
- corre el test
- termina con `BUILD SUCCESS`

---

## Qué aprendiste ya

Que Maven:

- no solo compila tu aplicación
- también compila y ejecuta el código de prueba
- y trata eso como parte seria del build

Esto es importantísimo.

---

## Tercer experimento: provocar un fallo de test

Ahora cambiá el test a propósito para que falle:

```java
package com.gabriel.maven;

import org.junit.Assert;
import org.junit.Test;

public class AppTest {

    @Test
    public void sumarDosNumeros() {
        int resultado = App.sumar(2, 3);
        Assert.assertEquals(6, resultado);
    }
}
```

Corré:

```bash
mvn test
```

## Qué deberías observar

Ahora el build debería fallar.

Vas a ver algo relacionado con:

- test failure
- diferencias entre valor esperado y real
- `BUILD FAILURE`

---

## Qué aprendiste con este fallo

Que una cosa es:
- error de compilación

y otra distinta es:
- test que compila, pero falla al ejecutarse

En este caso:
- tu código compila
- el test compila
- pero la verificación lógica falla

Entonces aparece una idea muy importante:

> un test puede fallar aunque todo compile perfectamente, porque el problema ya no está en la sintaxis sino en el comportamiento esperado.

---

## Diferencia entre test roto y código roto

Esto conviene dejarlo clarísimo.

### Código roto para compilación
El build falla antes, porque el código no compila.

### Test roto por lógica
Todo compila, pero la verificación falla.

### Test roto por sintaxis
El test mismo no compila.

Estas diferencias son buenísimas para leer mejor qué está pasando.

---

## Ejercicio 1 — distinguir tres tipos de fallo

Quiero que pruebes, de a uno, estos tres escenarios:

### Caso A
Rompé `App.java` con un error de sintaxis y corré:

```bash
mvn test
```

### Caso B
Dejá `App.java` bien, pero hacé fallar una aserción del test y corré:

```bash
mvn test
```

### Caso C
Rompé la sintaxis del archivo de test y corré:

```bash
mvn test
```

## Objetivo
Que aprendas a reconocer:
- error en código principal
- error lógico en el test
- error de compilación del test

---

## Qué relación tiene `mvn test` con `package`

Muy fuerte.

Como ya viste en el lifecycle, cuando ejecutás:

```bash
mvn package
```

Maven suele pasar por test antes de empaquetar.

Entonces, si un test falla:
- no llega al empaquetado

Esto muestra que Maven da bastante importancia a los tests dentro del build normal.

---

## Ejercicio 2 — comprobar que un test fallido bloquea package

Dejá un test fallando a propósito y ejecutá:

```bash
mvn package
```

## Qué deberías observar

El build falla antes de generar el `.jar`.

Después corregí el test y volvé a correr:

```bash
mvn package
```

Ahora sí debería funcionar.

## Qué aprendiste

Que `package` depende de que la fase `test` no falle.

---

## Qué genera Maven cuando corrés tests

Además de mostrar resultados en consola, Maven suele dejar reportes o rastros en:

```text
target/surefire-reports
```

Después de correr:

```bash
mvn test
```

fijate si esa carpeta existe.

Ahí suelen aparecer archivos relacionados con los resultados de tests.

No hace falta profundizar demasiado todavía.
Solo reconocer que Maven también deja huella de esta fase.

---

## Una intuición muy útil

Podés pensarlo así:

- `target/classes` → compilación del código principal
- `target/test-classes` → compilación de tests
- `target/surefire-reports` → resultado/reportes de ejecución de tests

Esto te ayuda muchísimo a leer la carpeta `target`.

---

## Qué no conviene hacer

No conviene:

- pensar que los tests son “algo extra” totalmente aparte del proyecto
- meter código de prueba dentro de `src/main/java`
- usar dependencias de test como si fueran dependencias principales
- ni ignorar un fallo de test como si fuera menos importante solo porque el código compila

Maven justamente te enseña otra lógica:
- el build serio incluye verificación

---

## Error común 1 — creer que si compila ya está todo bien

No necesariamente.
Puede compilar y aun así estar fallando en el comportamiento esperado.

Ahí entra el rol de los tests.

---

## Error común 2 — no distinguir entre test que no compila y test que falla

Esto ya lo trabajaste hoy.
Y es una diferencia central para entender mejor los errores.

---

## Error común 3 — pensar que `mvn test` ejecuta tu `main`

No.
`mvn test` ejecuta tests.
No es lo mismo que correr la aplicación principal.

Este error mental se parece mucho al de confundir build con runtime.

---

## Error común 4 — olvidarte de corregir un test roto antes de seguir

Si dejás el test fallando y después intentás hacer `package` o `install`, el build normalmente va a seguir fallando.

---

## Ejercicio 3 — escribir dos tests simples

Quiero que agregues al menos dos tests al proyecto.

Por ejemplo:

```java
package com.gabriel.maven;

import org.junit.Assert;
import org.junit.Test;

public class AppTest {

    @Test
    public void sumarDosMasTres() {
        Assert.assertEquals(5, App.sumar(2, 3));
    }

    @Test
    public void sumarCeroMasCuatro() {
        Assert.assertEquals(4, App.sumar(0, 4));
    }
}
```

Ahora corré:

```bash
mvn test
```

La idea es que ya no sea solo “un test de ejemplo”, sino que empieces a usar tests como parte natural del proyecto.

---

## Qué relación tiene esto con Maven como herramienta profesional

Muchísima.

Una gran parte del valor de Maven no está solo en compilar.
Está en que integra dentro del flujo normal:

- compilación
- pruebas
- empaquetado
- instalación

Entonces no te enseña solo a “producir artefactos”.
También te enseña a construir con una verificación mínima integrada.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Creá una función simple en `App.java`, por ejemplo `sumar`.

### Ejercicio 2
Creá un test que valide esa función.

### Ejercicio 3
Corré:

```bash
mvn test
```

### Ejercicio 4
Hacé fallar el test a propósito.

### Ejercicio 5
Corré otra vez:

```bash
mvn test
```

y observá el fallo.

### Ejercicio 6
Corregilo y verificá que vuelva a pasar.

### Ejercicio 7
Probá después:

```bash
mvn package
```

para comprobar que el test forma parte del flujo hacia el empaquetado.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué hace `mvn test`?
2. ¿Qué diferencia hay entre `compile` y `test`?
3. ¿Qué diferencia hay entre un error de compilación y un test que falla?
4. ¿Qué carpeta suele contener reportes de tests?
5. ¿Por qué un test fallido puede impedir que `package` termine bien?
6. ¿Qué plugin suele aparecer en la salida cuando Maven ejecuta tests?

---

## Mini desafío

Creá un proyecto nuevo, por ejemplo:

- `calculadora-test-maven`

Y hacé esto:

1. creá una función simple
2. escribí dos o tres tests
3. corré `mvn test`
4. rompé uno a propósito
5. observá el fallo
6. corregilo
7. corré `mvn package`

Tu objetivo es naturalizar el flujo:
- escribir
- testear
- corregir
- volver a testear
- empaquetar

---

## Qué deberías saber al terminar este tema

Si terminaste bien este undécimo tema, ya deberías poder:

- entender qué hace `mvn test`
- distinguir entre compilar y testear
- crear tests simples dentro de `src/test/java`
- interpretar fallos de test
- entender que los tests forman parte del lifecycle normal
- y ver el build Maven como algo más serio y más completo

---

## Resumen del tema

- `mvn test` compila el código principal, compila los tests y ejecuta los tests.
- Los tests viven normalmente en `src/test/java`.
- Maven los trata como una parte real del build.
- Un test puede fallar aunque todo compile bien.
- Si los tests fallan, `package` también puede quedar bloqueado.
- Ya empezaste a usar el flujo de pruebas como parte natural del trabajo con Maven.

---

## Próximo tema

En el próximo tema vas a aprender a usar mejor `properties` para centralizar información útil del proyecto, porque después de trabajar build, artefactos y tests, el siguiente paso natural es empezar a ordenar mejor valores repetidos dentro del `pom.xml` y hacer que tu configuración sea un poco más limpia y mantenible.
