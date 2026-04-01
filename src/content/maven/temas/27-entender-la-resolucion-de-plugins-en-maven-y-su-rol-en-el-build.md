---
title: "Entender la resolución de plugins en Maven y su rol en el build"
description: "Vigésimo séptimo tema práctico del curso de Maven: aprender qué son los plugins en Maven, por qué también se descargan desde repositorios, cómo se diferencian de las dependencias del proyecto y qué papel cumplen dentro del build."
order: 27
module: "Plugins y build"
level: "base"
draft: false
---

# Entender la resolución de plugins en Maven y su rol en el build

## Objetivo del tema

En este vigésimo séptimo tema vas a:

- entender qué es un plugin en Maven
- distinguir claramente entre una dependencia del proyecto y un plugin del build
- ver por qué Maven también descarga plugins
- empezar a leer la resolución de plugins con más criterio
- comprender mejor qué está pasando detrás de comandos como `compile`, `test`, `package` o `clean`

La idea es que dejes de pensar que todo lo que Maven descarga son librerías de tu proyecto y empieces a ver que una parte importante de lo que resuelve pertenece al propio mecanismo del build.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- usar el lifecycle básico
- entender `compile`, `test`, `package`, `install` y `clean`
- leer mejor `dependency:tree`
- distinguir entre dependencias del proyecto y configuración del entorno
- entender `settings.xml`, repositorio local y mirrors en un nivel inicial

Si hiciste los temas anteriores, ya tenés una base muy buena para este paso.

---

## Idea central del tema

Hasta ahora trabajaste mucho con dependencias del proyecto.
Por ejemplo:

- JUnit
- Commons Lang
- Guava
- otras librerías que tu código necesita

Pero Maven también usa otra clase de artefactos para poder hacer su trabajo como herramienta de build.

Por ejemplo, para:

- compilar
- correr tests
- limpiar
- empaquetar

Maven se apoya en **plugins**.

Entonces aparece una idea muy importante:

> no todo lo que Maven descarga son dependencias de negocio o del código del proyecto; también descarga plugins que necesita para ejecutar el build.

---

## Qué es un plugin en Maven

Un plugin es un componente que le agrega a Maven la capacidad de ejecutar tareas concretas dentro del build.

Por ejemplo, hay plugins para:

- compilar código Java
- ejecutar tests
- generar un `.jar`
- limpiar el directorio `target`
- generar documentación
- correr análisis
- ejecutar aplicaciones
- y muchas otras cosas

Dicho simple:

> Maven organiza el proceso en fases, pero usa plugins para realizar las acciones concretas de cada fase.

---

## Una intuición muy útil

Podés pensarlo así:

- lifecycle = la secuencia lógica
- phase = una etapa de esa secuencia
- plugin = la herramienta concreta que hace el trabajo en esa etapa

Esta imagen conecta perfecto con lo que ya aprendiste antes.

---

## Qué diferencia hay entre dependencia y plugin

Esto es central.

### Dependencia
Es una librería que tu proyecto usa o necesita.

Ejemplos:
- JUnit
- Commons Lang
- Guava

### Plugin
Es una herramienta que Maven usa para construir, testear, limpiar o empaquetar el proyecto.

Ejemplos:
- compiler plugin
- surefire plugin
- jar plugin
- clean plugin

Entonces aparece una verdad importante:

> las dependencias sirven al código del proyecto; los plugins sirven al proceso de build de Maven.

---

## Primer ejemplo concreto

Cuando corrés:

```bash
mvn compile
```

Maven no compila “por arte de magia”.
Normalmente usa algo como el **maven-compiler-plugin**.

Cuando corrés:

```bash
mvn test
```

Maven suele usar algo como el **maven-surefire-plugin** para ejecutar los tests.

Cuando corrés:

```bash
mvn clean
```

Maven usa el **maven-clean-plugin**.

Y cuando corrés:

```bash
mvn package
```

si el packaging es `jar`, suele intervenir el **maven-jar-plugin**.

---

## Qué aprendiste ya

Que los plugins no son decoración.
Son parte muy real de cómo Maven cumple lo que vos le pedís.

Entonces ya no alcanza con pensar:

- “Maven compila”
- “Maven testea”

Ahora conviene pensar algo un poco más preciso:

- “Maven organiza fases y usa plugins para ejecutarlas”

---

## Qué significa que Maven descargue plugins

Si en algún momento viste que Maven descargaba cosas aunque vos no hubieras agregado nuevas dependencias del proyecto,
puede haber sido porque estaba resolviendo plugins o artefactos relacionados con plugins.

Eso es totalmente normal.

Por ejemplo:
- primera vez que corrés un goal
- primera vez que usás cierto plugin
- repositorio local nuevo o vacío
- cambio de entorno
- nueva resolución de una parte del build

Entonces aparece una idea importante:

> el build de Maven también depende de artefactos descargables, y muchos de ellos pertenecen a plugins, no a tu código.

---

## Dónde suelen verse los plugins en acción

Una de las mejores formas de verlos es en la salida de Maven.

Por ejemplo, al correr:

```bash
mvn compile
```

podés ver algo parecido a:

```text
[INFO] --- compiler:...:compile (default-compile) @ mi-primer-proyecto-maven ---
```

Al correr:

```bash
mvn test
```

podés ver algo parecido a:

```text
[INFO] --- surefire:...:test (default-test) @ mi-primer-proyecto-maven ---
```

Al correr:

```bash
mvn clean
```

algo como:

```text
[INFO] --- clean:...:clean (default-clean) @ mi-primer-proyecto-maven ---
```

Esto ya te deja ver que Maven te está mostrando explícitamente qué plugin interviene.

---

## Ejercicio 1 — observar plugins en la salida real

Quiero que hagas esto:

### Paso 1
Corré:

```bash
mvn clean
```

### Paso 2
Corré:

```bash
mvn compile
```

### Paso 3
Corré:

```bash
mvn test
```

### Paso 4
Corré:

```bash
mvn package
```

### Paso 5
En cada salida, buscá la línea donde aparece el plugin principal que interviene.

### Objetivo
Ver que el build no es solo “fases abstractas”, sino fases ejecutadas por plugins concretos.

---

## Qué plugins básicos conviene que ya conozcas

En este nivel, con reconocer estos ya estás muy bien:

### `maven-clean-plugin`
Limpia lo generado por el build.

### `maven-compiler-plugin`
Compila el código Java.

### `maven-surefire-plugin`
Ejecuta tests.

### `maven-jar-plugin`
Genera el artefacto `.jar` cuando corresponde.

No hace falta todavía configurarlos en profundidad.
Por ahora, el objetivo es entender su rol.

---

## Qué relación tienen los plugins con el effective POM

Muy fuerte.

Ya viste que el effective POM te muestra una versión expandida del proyecto.
Bueno:
ahí también puede aparecer configuración efectiva de plugins.

Eso es muy útil porque te permite ver que Maven no solo resuelve dependencias del proyecto,
sino también una parte del comportamiento del build.

Entonces aparece otra idea importante:

> el effective POM y la salida del build son dos lugares muy buenos para ver que los plugins forman parte real del modelo Maven.

---

## Primer experimento con effective POM

Corré:

```bash
mvn help:effective-pom -Doutput=effective-pom.xml
```

Después abrí el archivo y buscá:

```xml
<plugins>
```

## Qué deberías observar

No hace falta entender todo el bloque.
Solo quiero que notes esto:

- en el effective POM aparecen plugins
- eso confirma que el modelo efectivo de Maven incluye configuración de build, no solo dependencias

---

## Qué diferencia hay con dependency:tree

Esto también conviene dejarlo clarísimo.

### `mvn dependency:tree`
Te muestra la red de dependencias del proyecto.

### Plugins del build
No son simplemente lo mismo que las dependencias que ves en `dependency:tree`.

Entonces aparece una verdad importante:

> el árbol de dependencias del proyecto y la resolución de plugins son dos capas distintas del funcionamiento de Maven.

Esa diferencia es central.

---

## Una intuición muy útil

Podés pensarlo así:

- `dependency:tree` te ayuda a entender qué usa el proyecto
- la salida del build y el effective POM te ayudan a entender qué usa Maven para construir el proyecto

Esa frase vale muchísimo.

---

## Qué problema resuelve entender esto

Muchísimos.

Por ejemplo:

- dejar de asustarte si Maven descarga cosas que vos no agregaste como dependencias
- entender por qué aparecen nombres raros ligados a `compiler`, `surefire`, `jar` o `clean`
- distinguir problemas de proyecto de problemas del build
- y prepararte para configurar plugins más adelante con mejor criterio

Entonces aparece una idea importante:

> entender plugins te da una lectura más completa de Maven como herramienta, no solo como descargador de librerías del proyecto.

---

## Error común 1 — pensar que todo lo descargado pertenece al proyecto

No.
Una parte puede pertenecer al build.

---

## Error común 2 — creer que los plugins son “dependencias normales”

No exactamente.
Son artefactos del ecosistema Maven, sí, pero cumplen un rol distinto:
- sirven al build
- no al código de negocio del proyecto

---

## Error común 3 — no mirar la salida del build cuando algo raro pasa

La salida muchas veces ya te dice:
- qué plugin está actuando
- en qué fase
- y eso ayuda muchísimo a entender de qué capa viene el problema

---

## Error común 4 — pensar que Maven “hace cosas” sin herramientas concretas

No.
Justamente los plugins son una gran parte de esas herramientas concretas.

---

## Ejercicio 2 — clasificar artefactos mentalmente

Quiero que hagas una lista con estos nombres:

- JUnit
- Commons Lang
- Guava
- maven-compiler-plugin
- maven-surefire-plugin
- maven-clean-plugin
- maven-jar-plugin

Y que al lado pongas:
- “dependencia del proyecto”
o
- “plugin de Maven”

### Objetivo
Fijar muy bien la diferencia entre ambas capas.

---

## Qué relación tiene esto con el repositorio local

Muy fuerte.

Así como el repositorio local guarda dependencias del proyecto,
también puede guardar artefactos ligados a los plugins que Maven necesitó resolver.

Por eso, cuando cambiás repositorio local o cuando usás uno vacío,
puede parecer que Maven “baja demasiado”.
Y parte de eso puede ser justamente la capa de plugins.

---

## Qué relación tiene esto con mirrors y settings.xml

También importante.

Si los mirrors afectan desde dónde Maven intenta obtener artefactos,
eso puede impactar tanto:

- dependencias del proyecto
como
- plugins del build

Entonces este tema también te ayuda a entender mejor por qué la configuración del entorno influye en más de una capa.

---

## Ejercicio 3 — buscar plugins en el effective POM

Quiero que hagas esto:

### Paso 1
Generá:

```bash
mvn help:effective-pom -Doutput=effective-pom.xml
```

### Paso 2
Buscá:
- `maven-compiler-plugin`
- `maven-surefire-plugin`
- `maven-jar-plugin`

### Paso 3
Anotá si aparecen y en qué contexto general.

### Objetivo
Ver que el effective POM te muestra una parte real del modelo de build y no solo dependencias.

---

## Qué no conviene olvidar

Este tema no pretende que todavía configures plugins complejos.
Todavía no hace falta.

Lo que sí quiere dejarte es una base conceptual muy importante:

- Maven usa plugins
- esos plugins también son artefactos
- también se resuelven y descargan
- y cumplen un rol distinto al de las dependencias del proyecto

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Corré:
```bash
mvn clean
mvn compile
mvn test
mvn package
```

### Ejercicio 2
En cada salida, identificá qué plugin principal aparece.

### Ejercicio 3
Generá el effective POM.

### Ejercicio 4
Buscá el bloque de plugins.

### Ejercicio 5
Escribí con tus palabras la diferencia entre:
- dependencia del proyecto
- plugin del build

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es un plugin en Maven?
2. ¿Qué diferencia hay entre una dependencia del proyecto y un plugin?
3. ¿Por qué Maven también descarga plugins?
4. ¿Qué herramienta o lugar te ayuda a ver plugins en acción durante el build?
5. ¿Por qué entender esto mejora tu lectura real de Maven?

---

## Mini desafío

Hacé una práctica concreta:

1. corré `mvn clean`, `mvn compile`, `mvn test` y `mvn package`
2. anotá qué plugin aparece en cada caso
3. generá el effective POM
4. buscá los plugins ahí
5. escribí una nota breve explicando cómo se relacionan:
   - lifecycle
   - phase
   - plugin

Tu objetivo es que Maven deje de parecer una caja negra todavía más y pase a verse como una orquestación de fases y herramientas concretas.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este vigésimo sexto tema, ya deberías poder:

- entender qué es un plugin en Maven
- distinguirlo claramente de una dependencia del proyecto
- reconocer plugins básicos del build
- leer mejor la salida de Maven
- y entender por qué una parte de los artefactos descargados pertenece al proceso de build y no al código del proyecto

---

## Resumen del tema

- Maven no solo resuelve dependencias del proyecto; también usa plugins para ejecutar el build.
- Los plugins cumplen tareas concretas dentro de las fases.
- La salida del build y el effective POM ayudan a verlos.
- No conviene confundir dependencias del proyecto con herramientas del build.
- Entender esto vuelve mucho más clara la arquitectura real de Maven.
- Ya empezaste a ver el build como una combinación de fases lógicas y plugins concretos.

---

## Próximo tema

En el próximo tema vas a aprender a declarar y configurar explícitamente un plugin en el `pom.xml`, porque después de entender que los plugins son una capa real del build, el siguiente paso natural es dejar de verlos solo como algo implícito y empezar a configurarlos de forma consciente dentro del proyecto.
