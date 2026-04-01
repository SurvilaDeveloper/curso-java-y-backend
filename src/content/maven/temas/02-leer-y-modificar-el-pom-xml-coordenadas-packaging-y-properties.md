---
title: "Leer y modificar el pom.xml: coordenadas, packaging y properties"
description: "Segundo tema práctico del curso de Maven: aprender a leer y modificar el pom.xml, entendiendo groupId, artifactId, version, packaging y properties con ejercicios reales sobre un proyecto Maven."
order: 2
module: "Fundamentos de Maven"
level: "intro"
draft: false
---

# Leer y modificar el pom.xml: coordenadas, packaging y properties

## Objetivo del tema

En este segundo tema vas a:

- entender mejor qué representa el `pom.xml`
- leer con criterio sus campos más importantes
- modificar coordenadas básicas del proyecto
- trabajar con `packaging`
- usar `properties`
- volver a compilar y empaquetar para ver cambios reales

La idea es que dejes de ver el `pom.xml` como un archivo raro de configuración y empieces a leerlo como el documento principal que describe tu proyecto Maven.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías tener:

- Java instalado
- Maven funcionando
- un proyecto Maven creado
- experiencia básica con:
  - `mvn compile`
  - `mvn test`
  - `mvn package`
  - `mvn install`

Si hiciste el tema anterior, podés reutilizar el proyecto `hola-maven`.

---

## Idea central del tema

En Maven, el `pom.xml` no es un detalle secundario.

Es el archivo donde definís:

- qué proyecto es este
- cómo se llama
- qué versión tiene
- cómo se empaqueta
- qué dependencias usa
- y parte importante de cómo se construye

Dicho simple:

> si en el tema 1 aprendiste a usar Maven, en este tema empezás a entender qué le estás diciendo realmente a Maven sobre tu proyecto.

---

## Qué significa POM

POM significa:

**Project Object Model**

No hace falta memorizar la sigla si no querés.
Lo importante es entender que el `pom.xml` es la descripción central del proyecto Maven.

---

## Abrí tu proyecto

Entrá a tu proyecto Maven, por ejemplo:

```bash
cd hola-maven
```

Ahora abrí el archivo:

```text
pom.xml
```

Probablemente tenga una estructura parecida a esta:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.gabriel.maven</groupId>
    <artifactId>hola-maven</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>hola-maven</name>
    <url>http://maven.apache.org</url>

    <dependencies>
        ...
    </dependencies>
</project>
```

No importa si cambia un poco según la plantilla.
La lógica central es la misma.

---

## Primer bloque importante: coordenadas

Las coordenadas identifican tu proyecto dentro del ecosistema Maven.

Las principales son:

- `groupId`
- `artifactId`
- `version`

## `groupId`

Suele representar el grupo, dominio invertido, empresa o espacio lógico del proyecto.

Ejemplos:

- `com.gabrielsurvila`
- `com.gabrielsurvila.maven`
- `ar.com.ejemplo`
- `org.demo`

No es solo decoración.
Forma parte de la identidad del artefacto.

## `artifactId`

Es el nombre del proyecto o artefacto.

Ejemplos:

- `hola-maven`
- `calculadora-maven`
- `clientes-api`
- `inventario-backend`

## `version`

Indica la versión actual del proyecto.

Ejemplos:

- `1.0-SNAPSHOT`
- `1.0.0`
- `0.1.0`
- `2.3.1`

### ¿Qué significa `SNAPSHOT`?

Cuando una versión termina en `-SNAPSHOT`, indica que todavía es una versión en desarrollo o no definitiva.

Ejemplo:

```xml
<version>1.0-SNAPSHOT</version>
```

---

## Ejercicio 1 — cambiar coordenadas

Cambiá tu `pom.xml` para que quede parecido a esto:

```xml
<groupId>com.gabriel.mavencurso</groupId>
<artifactId>mi-primer-proyecto-maven</artifactId>
<version>0.1.0-SNAPSHOT</version>
```

Guardá el archivo.

Ahora ejecutá:

```bash
mvn package
```

## Qué deberías ver

Dentro de `target` ahora el `.jar` debería cambiar de nombre, por ejemplo:

```text
target/mi-primer-proyecto-maven-0.1.0-SNAPSHOT.jar
```

## Qué aprendiste acá

Que el nombre del artefacto generado depende de:

- `artifactId`
- `version`

---

## Segundo bloque importante: packaging

El campo `packaging` indica qué tipo de artefacto produce el proyecto.

Ejemplo típico:

```xml
<packaging>jar</packaging>
```

## Valores comunes

### `jar`
Para librerías o aplicaciones Java empaquetadas como JAR.

### `war`
Para aplicaciones web tradicionales desplegables en servidores como Tomcat.

### `pom`
Se usa mucho en proyectos padre o agregadores, especialmente más adelante en multi-módulo.

Para este curso, en esta etapa, lo normal es usar:

```xml
<packaging>jar</packaging>
```

---

## Ejercicio 2 — verificar packaging

Revisá si tu `pom.xml` tiene esto:

```xml
<packaging>jar</packaging>
```

Si no está, agregalo debajo de `version`.

Debería quedar así:

```xml
<groupId>com.gabriel.mavencurso</groupId>
<artifactId>mi-primer-proyecto-maven</artifactId>
<version>0.1.0-SNAPSHOT</version>
<packaging>jar</packaging>
```

Ahora volvé a ejecutar:

```bash
mvn package
```

---

## Tercer bloque importante: `name` y `description`

No son obligatorios para que Maven compile, pero sirven mucho para dejar el proyecto mejor definido.

Agregá esto:

```xml
<name>Mi primer proyecto Maven</name>
<description>Proyecto de práctica para aprender a leer y modificar el pom.xml</description>
```

Podrías dejar el bloque así:

```xml
<groupId>com.gabriel.mavencurso</groupId>
<artifactId>mi-primer-proyecto-maven</artifactId>
<version>0.1.0-SNAPSHOT</version>
<packaging>jar</packaging>

<name>Mi primer proyecto Maven</name>
<description>Proyecto de práctica para aprender a leer y modificar el pom.xml</description>
```

Esto no cambia el `.jar`, pero sí mejora la definición del proyecto.

---

## Cuarto bloque importante: properties

Las `properties` sirven para centralizar valores reutilizables dentro del `pom.xml`.

Más adelante las vas a usar mucho.
Ahora vas a ver la idea base.

Agregá este bloque:

```xml
<properties>
    <proyecto.autor>Gabriel</proyecto.autor>
    <proyecto.entorno>practica</proyecto.entorno>
</properties>
```

El `pom.xml` quedaría más o menos así:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.gabriel.mavencurso</groupId>
    <artifactId>mi-primer-proyecto-maven</artifactId>
    <version>0.1.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>Mi primer proyecto Maven</name>
    <description>Proyecto de práctica para aprender a leer y modificar el pom.xml</description>

    <properties>
        <proyecto.autor>Gabriel</proyecto.autor>
        <proyecto.entorno>practica</proyecto.entorno>
    </properties>

    <dependencies>
        ...
    </dependencies>
</project>
```

---

## Qué es importante entender sobre properties

Aunque hoy no las uses mucho, la idea clave es esta:

> si un valor importante aparece varias veces o querés dejarlo centralizado, una property te ayuda a no repetirlo.

Más adelante vas a usar `properties` para cosas mucho más comunes como:

- versión de Java
- versión de dependencias
- encoding
- configuración general

---

## Ejercicio 3 — agregar properties propias

Agregá al menos dos properties tuyas.
Por ejemplo:

```xml
<properties>
    <proyecto.autor>Gabriel</proyecto.autor>
    <proyecto.entorno>practica</proyecto.entorno>
    <proyecto.tipo>curso</proyecto.tipo>
    <proyecto.lenguaje>java</proyecto.lenguaje>
</properties>
```

No importa si todavía no afectan nada del build.
El objetivo es que te acostumbres a la estructura.

---

## Quinto bloque importante: dependencies

En este tema no vamos a profundizar todavía.
Eso lo vas a ver mejor después.

Pero ya conviene entender esto:

```xml
<dependencies>
    ...
</dependencies>
```

Ahí se declaran las librerías que el proyecto necesita.

Por ejemplo:
- JUnit
- Mockito
- Spring
- drivers de base de datos
- etc.

En el proyecto generado automáticamente seguramente ya vino alguna dependencia de testing.

Por ahora, no la toques demasiado.
Solo entendé que ese bloque existe para declarar dependencias externas.

---

## Primer mini-análisis del archivo completo

Tu `pom.xml` ya empieza a decir varias cosas:

- cuál es el modelo POM
- cómo se identifica el proyecto
- cómo se empaqueta
- cómo se llama
- qué descripción tiene
- qué propiedades personalizadas guarda
- qué dependencias usa

O sea:

> el `pom.xml` no es solo un archivo “para que Maven ande”, sino una descripción bastante seria del proyecto.

---

## Ejercicio 4 — romper y corregir

Este ejercicio es muy bueno para aprender.

### Paso 1
Quitá temporalmente una etiqueta de cierre del XML, por ejemplo una de `description`.

Ejemplo mal cerrado:

```xml
<description>Proyecto de práctica
```

### Paso 2
Ejecutá:

```bash
mvn compile
```

### Paso 3
Mirá el error.

### Paso 4
Corregilo.

### Objetivo
Perderle el miedo a los errores del `pom.xml`.

---

## Qué errores comunes conviene evitar

## Error 1 — escribir mal el XML

El `pom.xml` es XML.
Si abrís una etiqueta, tenés que cerrarla bien.

## Error 2 — cambiar cosas sin entender qué representan

No cambies `groupId`, `artifactId`, `version` o `packaging` como si fueran texto cualquiera.
Cada uno tiene una función real.

## Error 3 — pensar que `name` y `artifactId` son lo mismo

No necesariamente.

- `artifactId` forma parte de la identidad técnica del artefacto
- `name` es más descriptivo o humano

## Error 4 — llenar de properties sin criterio

Las properties son útiles.
Pero no se trata de meter todo ahí porque sí.
Se usan cuando aportan claridad o reutilización.

---

## Práctica guiada completa

Quiero que tu `pom.xml` termine con algo parecido a esto:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.gabriel.mavencurso</groupId>
    <artifactId>mi-primer-proyecto-maven</artifactId>
    <version>0.1.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>Mi primer proyecto Maven</name>
    <description>Proyecto de práctica para aprender a leer y modificar el pom.xml</description>

    <properties>
        <proyecto.autor>Gabriel</proyecto.autor>
        <proyecto.entorno>practica</proyecto.entorno>
        <proyecto.tipo>curso</proyecto.tipo>
    </properties>

    <dependencies>
        ...
    </dependencies>
</project>
```

No hace falta que quede idéntico.
Sí hace falta que vos entiendas qué representa cada bloque.

---

## Volvé a ejecutar el flujo base

Después de modificar el `pom.xml`, corré esto:

```bash
mvn compile
mvn test
mvn package
```

Si todo está bien, debería seguir funcionando.

Eso ya muestra una idea muy importante:

> podés modificar el corazón declarativo del proyecto sin romper el flujo, siempre que entiendas qué estás tocando.

---

## Mini desafío

Creá un segundo proyecto Maven y definile:

- un `groupId` distinto
- un `artifactId` distinto
- una `version` distinta
- un `name`
- una `description`
- tres `properties`

Después ejecutá:

```bash
mvn package
```

Y verificá que el `.jar` generado tenga el nombre correcto.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué representa `groupId`?
2. ¿Qué representa `artifactId`?
3. ¿Qué representa `version`?
4. ¿Qué indica `packaging`?
5. ¿Para qué sirven las `properties`?
6. ¿Qué diferencia hay entre `artifactId` y `name`?

No hace falta que uses definiciones perfectas.
Hace falta que se note que lo entendiste.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este segundo tema, ya deberías poder:

- abrir y leer un `pom.xml`
- identificar sus bloques más importantes
- modificar coordenadas del proyecto
- entender qué hace `packaging`
- agregar `name` y `description`
- usar `properties`
- corregir errores básicos del XML
- y sentir que el `pom.xml` ya no es una caja negra

---

## Resumen del tema

- El `pom.xml` describe el proyecto Maven.
- Las coordenadas principales son:
  - `groupId`
  - `artifactId`
  - `version`
- `packaging` define cómo se empaqueta el proyecto.
- `name` y `description` mejoran la definición general.
- `properties` ayudan a centralizar valores.
- Ya empezaste a modificar el proyecto con intención y no solo a ejecutar comandos.

---

## Próximo tema

En el próximo tema vas a aprender cómo funcionan mejor las dependencias en Maven, porque después de entender qué describe al proyecto en el `pom.xml`, el siguiente paso natural es ver cómo declarar librerías externas y cómo empezar a entender qué está descargando Maven y por qué.
