---
title: "Entender el .jar generado por Maven: qué contiene, cómo se crea y cómo revisarlo"
description: "Noveno tema práctico del curso de Maven: entender qué contiene el .jar generado por Maven, cómo se produce con package y cómo inspeccionarlo para dejar de verlo como un archivo misterioso dentro de target."
order: 9
module: "Fundamentos de Maven"
level: "intro"
draft: false
---

# Entender el `.jar` generado por Maven: qué contiene, cómo se crea y cómo revisarlo

## Objetivo del tema

En este noveno tema vas a:

- entender qué es un archivo `.jar`
- ver qué genera Maven cuando ejecutás `package`
- inspeccionar el contenido real del `.jar`
- relacionar el `.jar` con las clases compiladas del proyecto
- dejar de tratar el artefacto generado como “un archivo que aparece” y empezar a verlo como un resultado concreto del build

La idea es que el `.jar` deje de ser una caja cerrada y pase a ser algo que sabés ubicar, generar y revisar.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- entender el `pom.xml`
- agregar dependencias
- correr `compile`, `test`, `package`, `install`
- entender el lifecycle básico
- usar `clean`

Si hiciste los temas anteriores, ya tenés todo lo necesario.

---

## Idea central del tema

Cuando ejecutás:

```bash
mvn package
```

Maven suele generar un archivo `.jar`.

Pero para muchísima gente al principio eso queda como una idea medio vaga:
- “se genera algo en target”

En este tema quiero que entiendas algo más concreto:

> el `.jar` es el artefacto empaquetado del proyecto, y adentro contiene archivos reales, principalmente clases compiladas y metadatos.

---

## Qué es un `.jar`

`JAR` significa:

**Java ARchive**

Es un archivo empaquetado que puede contener:

- clases compiladas `.class`
- recursos
- metadatos
- información del manifest

Dicho simple:

> un `.jar` es una forma de empaquetar partes de un proyecto Java en un único archivo.

---

## Qué relación tiene con Maven

En un proyecto Maven simple con:

```xml
<packaging>jar</packaging>
```

cuando ejecutás:

```bash
mvn package
```

Maven suele generar un `.jar` dentro de:

```text
target
```

Ese `.jar` representa el artefacto principal del proyecto.

---

## Primer experimento práctico: generar el jar

Ubicate en tu proyecto y corré:

```bash
mvn clean package
```

## Qué deberías ver

Dentro de `target` debería aparecer algo como:

```text
mi-primer-proyecto-maven-0.1.0-SNAPSHOT.jar
```

El nombre depende de:

- `artifactId`
- `version`

de tu `pom.xml`.

---

## Qué relación tiene con el pom.xml

Si tu `pom.xml` tiene algo así:

```xml
<artifactId>mi-primer-proyecto-maven</artifactId>
<version>0.1.0-SNAPSHOT</version>
<packaging>jar</packaging>
```

lo normal es que Maven genere algo como:

```text
target/mi-primer-proyecto-maven-0.1.0-SNAPSHOT.jar
```

Entonces ya podés ver una relación muy clara entre:

- identidad del proyecto en el `pom.xml`
- y nombre del artefacto generado

---

## Qué contiene un jar en un proyecto simple

En un proyecto básico como el que venís haciendo, el `.jar` suele contener sobre todo:

- clases compiladas del código principal
- metadatos internos de Maven
- manifest básico

No suele contener:
- código fuente `.java`
- tests
- resultados de pruebas

Y esto es muy importante.

---

## Qué no entra normalmente al jar principal

Por defecto, en este tipo de proyecto simple, el `.jar` generado con `package` no suele incluir:

- clases de test
- archivos de `src/test/java`
- reports de test
- contenido completo de dependencias externas

Esto ya te ayuda muchísimo a no imaginar el `.jar` como “todo el proyecto comprimido”.

---

## Una intuición muy útil

Podés pensarlo así:

- `src/main/java` → código fuente principal
- `target/classes` → clases compiladas
- `.jar` → empaquetado de esas clases y algunos metadatos

Esta secuencia ordena muchísimo.

---

## Segundo experimento: inspeccionar el contenido del jar

Hay varias formas.
La más común en Java es usando el comando `jar`.

Probá esto en terminal, ubicándote dentro del proyecto:

```bash
jar tf target/mi-primer-proyecto-maven-0.1.0-SNAPSHOT.jar
```

Si tu nombre de archivo cambió, adaptalo.

## Qué significa

- `jar` es la herramienta
- `t` significa listar contenido
- `f` significa trabajar sobre un archivo

---

## Qué deberías ver

Algo parecido a esto:

```text
META-INF/
META-INF/MANIFEST.MF
com/
com/gabriel/
com/gabriel/maven/
com/gabriel/maven/App.class
META-INF/maven/
META-INF/maven/com.gabriel.mavencurso/
META-INF/maven/com.gabriel.mavencurso/mi-primer-proyecto-maven/
META-INF/maven/com.gabriel.mavencurso/mi-primer-proyecto-maven/pom.xml
META-INF/maven/com.gabriel.mavencurso/mi-primer-proyecto-maven/pom.properties
```

No hace falta que sea idéntico.
La estructura general importa más que el detalle exacto.

---

## Qué significa cada parte importante

### `META-INF/`
Carpeta de metadatos.

### `MANIFEST.MF`
Archivo de manifest.
Contiene información básica del artefacto.

### `com/gabriel/.../App.class`
Tu clase compilada.

### `META-INF/maven/...`
Metadatos Maven del proyecto empaquetado.

---

## Qué aprendiste con esto

Que el `.jar`:

- no es misterioso
- tiene estructura interna
- contiene tus `.class`
- y guarda información del proyecto

Eso ya es un salto enorme en claridad.

---

## Tercer experimento: comparar `target/classes` con el jar

Mirá primero tu carpeta:

```text
target/classes
```

Ahí deberías encontrar algo como:

```text
target/classes/com/gabriel/maven/App.class
```

Ahora comparalo con lo que viste dentro del `.jar`.

## Idea clave

Lo que Maven hace al empaquetar no es inventar clases nuevas.
En gran parte está tomando el resultado compilado y empaquetándolo.

Entonces aparece una verdad muy importante:

> el `.jar` está fuertemente relacionado con `target/classes`: empaqueta lo que ya fue compilado.

---

## Ejercicio 1 — ubicar la clase compilada en ambos lugares

Quiero que busques tu clase principal:

- en `target/classes`
- y dentro del `.jar`

Tu objetivo es ver la misma lógica en dos formatos distintos:

- archivo suelto compilado
- archivo empaquetado dentro del `.jar`

---

## Qué diferencia hay entre compilar y empaquetar

Esto es buenísimo para afianzar conceptos.

### `mvn compile`
Genera clases compiladas.

### `mvn package`
Genera clases compiladas y además las empaqueta.

Entonces:

> compilar no es lo mismo que empaquetar.

---

## Qué pasa si modificás el código y volvés a empaquetar

Hacé una prueba.

### Paso 1
Cambiá el texto en `App.java`.

Por ejemplo:

```java
System.out.println("Este jar fue generado por Maven.");
```

### Paso 2
Corré:

```bash
mvn clean package
```

### Paso 3
Volvé a inspeccionar el `.jar`.

No vas a “ver” el texto directamente como en el `.java`,
porque adentro está la clase compilada,
no el código fuente.
Pero sí sabés que el artefacto ahora contiene la nueva versión compilada de tu clase.

---

## Qué significa que el jar sea un artefacto

En Maven se habla mucho de **artefacto**.

No te compliques demasiado:
en este contexto, pensalo como:

> el resultado empaquetado e identificable que el proyecto produce.

En tu caso, ese artefacto principal es el `.jar`.

Y se identifica por:

- `groupId`
- `artifactId`
- `version`
- `packaging`

---

## Qué no deberías imaginar sobre el jar

No conviene pensar que el `.jar` generado por un proyecto simple Maven ya es necesariamente:

- un ejecutable completo listo para cualquier contexto
- una app autoejecutable con todas las dependencias
- todo el proyecto entero
- o una “copia mágica” exacta de la carpeta del proyecto

Por ahora pensalo así:

> es el artefacto empaquetado principal del proyecto, generado a partir del código compilado y sus metadatos.

Más adelante, si querés, podés aprender sobre jars ejecutables, shaded jars o fat jars.
Pero ahora no hace falta mezclar eso.

---

## Ejercicio 2 — cambiar el artifactId y ver el nuevo jar

Abrí el `pom.xml` y cambiá:

```xml
<artifactId>mi-primer-proyecto-maven</artifactId>
```

por algo como:

```xml
<artifactId>mi-primer-jar-maven</artifactId>
```

Ahora ejecutá:

```bash
mvn clean package
```

## Qué deberías observar

El nombre del `.jar` cambia.

Esto te refuerza una idea muy importante:
- el artefacto generado responde directamente a la identidad definida en el `pom.xml`

### Importante
Si querés, después podés volver a dejar el nombre anterior.

---

## Qué relación tiene esto con install

Muy fuerte.

Ya aprendiste que:

```bash
mvn install
```

instala el artefacto en el repositorio local.

Bueno:
ese artefacto es justamente el `.jar` empaquetado.

O sea:

- `package` lo genera en `target`
- `install` además lo copia al repositorio local de Maven

Esto conecta muy bien temas anteriores.

---

## Qué relación tiene esto con dependencias

También importa.

Cuando otro proyecto depende de tu proyecto Maven,
lo que en gran parte va a resolver es ese artefacto empaquetado.

Entonces otra idea clave es esta:

> el `.jar` es la forma empaquetada en que tu proyecto puede pasar de ser “algo que vive en esta carpeta” a “algo reutilizable por otros proyectos”.

---

## Error común 1 — pensar que el jar incluye tests

En este tipo de proyecto básico, no.
Los tests van por otro camino y no suelen terminar dentro del artefacto principal.

---

## Error común 2 — no mirar nunca el contenido del jar

Muchísima gente usa Maven durante bastante tiempo sin inspeccionar nunca qué generó realmente.

Hacerlo aunque sea una vez te ordena muchísimo la cabeza.

---

## Error común 3 — confundir código fuente con artefacto

No es lo mismo:

- `.java` → fuente
- `.class` → compilado
- `.jar` → empaquetado

Esta cadena es central.

---

## Error común 4 — pensar que package e install generan artefactos distintos

No.
La diferencia principal no está en qué artefacto se crea,
sino en:
- dónde queda disponible después

---

## Ejercicio 3 — mirar el manifest

Usando el comando de listado ya viste que existe:

```text
META-INF/MANIFEST.MF
```

No hace falta profundizar mucho todavía,
pero conviene saber que el `.jar` tiene un manifest,
y que ahí puede haber metadatos importantes.

Por ahora alcanza con reconocer su existencia.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Corré:

```bash
mvn clean package
```

### Ejercicio 2
Ubicá el `.jar` dentro de `target`.

### Ejercicio 3
Listá su contenido con:

```bash
jar tf target/TU-ARCHIVO.jar
```

### Ejercicio 4
Identificá dentro del `.jar`:
- `META-INF`
- `MANIFEST.MF`
- tu clase `.class`
- la carpeta `META-INF/maven`

### Ejercicio 5
Compará una clase dentro de `target/classes` con esa misma clase empaquetada en el `.jar`.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es un `.jar`?
2. ¿Qué relación tiene con `mvn package`?
3. ¿Qué diferencia hay entre `target/classes` y el `.jar`?
4. ¿Qué tipo de cosas suele contener el `.jar`?
5. ¿Qué no suele incluir en este tipo de proyecto simple?
6. ¿Qué relación tiene `install` con el `.jar` generado?

---

## Mini desafío

Creá un proyecto nuevo, por ejemplo:

- `jar-demo-maven`

Y hacé esto:

1. generá el proyecto
2. corré `mvn clean package`
3. inspeccioná el `.jar`
4. cambiá el `artifactId`
5. volvé a empaquetar
6. comprobá que cambió el nombre del artefacto

Tu objetivo es dominar la relación entre:
- pom
- target
- classes
- jar

---

## Qué deberías saber al terminar este tema

Si terminaste bien este noveno tema, ya deberías poder:

- entender qué es un `.jar` dentro del mundo Maven
- generar el artefacto con `mvn package`
- ubicarlo en `target`
- inspeccionar su contenido
- relacionarlo con las clases compiladas
- y ver el build con mucha más claridad que antes

---

## Resumen del tema

- El `.jar` es el artefacto empaquetado principal de un proyecto Maven con `packaging jar`.
- Maven lo genera normalmente con `mvn package`.
- El `.jar` contiene clases compiladas y metadatos, no simplemente una copia del código fuente.
- `target/classes` y el `.jar` están muy relacionados: uno contiene compilados sueltos y el otro los empaqueta.
- `install` usa ese artefacto para dejarlo disponible en el repositorio local.
- Ya empezaste a mirar el resultado del build de una forma mucho más concreta.

---

## Próximo tema

En el próximo tema vas a aprender a ejecutar mejor el proyecto desde Maven y a distinguir entre construir un artefacto y correr una aplicación, porque después de entender qué genera realmente `package`, el siguiente paso natural es ver cómo se relaciona Maven con la ejecución del programa y no solo con el build.
