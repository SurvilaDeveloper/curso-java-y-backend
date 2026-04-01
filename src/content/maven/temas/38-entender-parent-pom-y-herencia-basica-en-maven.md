---
title: "Entender parent POM y herencia básica en Maven"
description: "Trigésimo octavo tema práctico del curso de Maven: aprender qué es un parent POM, cómo funciona la herencia básica en Maven y por qué esta idea es clave para compartir configuración, versiones y política entre proyectos relacionados."
order: 38
module: "Herencia, parents y multi-módulo"
level: "intermedio"
draft: false
---

# Entender `parent POM` y herencia básica en Maven

## Objetivo del tema

En este trigésimo octavo tema vas a:

- entender qué es un `parent POM`
- aprender cómo funciona la herencia básica en Maven
- distinguir entre configuración propia del proyecto y configuración heredada
- ver por qué un parent ayuda a compartir política entre proyectos
- empezar a salir del mundo del proyecto Maven aislado y entrar en una estructura más grande y más realista

La idea es que pases de pensar Maven como “un proyecto, un `pom.xml`” a empezar a verlo también como una herramienta capaz de organizar familias de proyectos relacionados.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- usar `properties`
- usar `dependencyManagement`
- usar `pluginManagement`
- entender `profiles`
- manejar plugins y build
- entender recursos, filtrado y empaquetado
- tener una lectura bastante clara del effective POM

Si venís siguiendo el roadmap, ya estás en condiciones muy buenas para dar este paso.

---

## Por qué este tema ya es intermedio

Hasta ahora trabajaste sobre todo dentro de un único proyecto Maven.

Aunque ya viste cosas bastante serias:
- plugins
- management
- filtrado
- settings
- profiles
- artefactos
- build más explícito

seguías estando, en el fondo, dentro de esta lógica:

- un proyecto
- un `pom.xml`
- una configuración local a ese proyecto

Con `parent POM` cambia bastante la escala mental.

Ahora entrás en cosas como:

- herencia de configuración
- política compartida
- proyectos hijos
- centralización entre varios proyectos o módulos

Entonces aparece una idea muy importante:

> cuando entrás en herencia entre proyectos, ya no estás solo configurando un build; empezás a diseñar estructura Maven entre proyectos relacionados.

Eso ya es un salto claro a nivel intermedio.

---

## Idea central del tema

Imaginá que tenés varios proyectos Maven y querés que compartan cosas como:

- versión de Java
- encoding
- versiones de dependencias
- versiones de plugins
- política del build
- configuraciones comunes

Podrías copiar y pegar todo eso en cada `pom.xml`.
Pero eso sería bastante frágil y repetitivo.

Entonces aparece una herramienta clave:

> el `parent POM` permite que un proyecto hijo herede configuración de un proyecto padre.

Esa es la idea central del tema.

---

## Qué es un parent POM

Un `parent POM` es un `pom.xml` que otro proyecto Maven puede declarar como padre para heredar parte de su configuración.

Dicho simple:

- el padre define política o configuración compartida
- el hijo hereda esa base
- y después agrega lo suyo

Esto hace mucho más fácil mantener coherencia entre proyectos relacionados.

---

## Una intuición muy útil

Podés pensarlo así:

- proyecto padre = base común
- proyecto hijo = proyecto concreto que arranca desde esa base

Esa imagen vale muchísimo.

---

## Qué tipo de cosas puede heredar un hijo

En un nivel inicial, pensalo como herencia de cosas como:

- `properties`
- `dependencyManagement`
- `pluginManagement`
- parte de `build`
- metadata o decisiones compartidas
- y otras piezas del modelo Maven

No hace falta que hoy abras todos los detalles finos de qué hereda exactamente y cómo se fusiona cada cosa.
Lo importante es entender la lógica general:
- el hijo no empieza desde cero

---

## Qué problema resuelve esto

Muchísimos.

Por ejemplo:

- evitar repetir la misma versión de Java en varios proyectos
- evitar repetir management de dependencias
- evitar repetir management de plugins
- imponer una política compartida
- mantener varios proyectos alineados
- preparar estructuras multi-módulo o familias de proyectos

Entonces aparece una verdad importante:

> el parent POM existe para bajar duplicación y subir coherencia entre proyectos relacionados.

---

## Primer ejemplo conceptual

Imaginá un padre que define:

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <java.version>21</java.version>
    <maven.compiler.source>${java.version}</maven.compiler.source>
    <maven.compiler.target>${java.version}</maven.compiler.target>
</properties>
```

y además define versiones comunes de dependencias y plugins.

Después, un proyecto hijo puede heredar todo eso sin volver a escribirlo.

Eso ya te da un caso mental bastante claro del valor de la herencia.

---

## Qué tiene un parent POM en lo básico

Un parent POM sigue siendo un proyecto Maven,
pero normalmente su propósito principal no es “ser una app”,
sino ser una base de configuración compartida.

Por eso muy frecuentemente su packaging es:

```xml
<packaging>pom</packaging>
```

Eso indica que no está orientado a producir un `.jar` como artefacto de aplicación normal,
sino a funcionar como POM de coordinación, política o estructura.

---

## Primer concepto clave: packaging pom

Esto conviene fijarlo bien.

Cuando un proyecto tiene:

```xml
<packaging>pom</packaging>
```

eso suele significar que está orientado a ser:

- padre
- agregador
- o base estructural

No necesariamente una aplicación empaquetable como `jar`.

Entonces aparece una idea importante:

> muchos parent POM usan `packaging` igual a `pom` porque su trabajo principal es estructurar y compartir configuración, no producir una app ejecutable.

---

## Estructura básica de un parent sencillo

Podría verse así:

```xml
<project ...>
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.gabriel.mavencurso</groupId>
    <artifactId>maven-parent-base</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <name>Maven Parent Base</name>
    <description>Base compartida para proyectos relacionados</description>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <java.version>21</java.version>
        <maven.compiler.source>${java.version}</maven.compiler.source>
        <maven.compiler.target>${java.version}</maven.compiler.target>
    </properties>
</project>
```

No hace falta que hoy tenga veinte cosas.
Con esta idea ya alcanza para empezar.

---

## Cómo declara un hijo a su parent

Un proyecto hijo agrega un bloque como este:

```xml
<parent>
    <groupId>com.gabriel.mavencurso</groupId>
    <artifactId>maven-parent-base</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</parent>
```

Ese bloque le dice a Maven:
- este proyecto hereda de ese padre

Después el hijo puede tener su propia identidad:

```xml
<artifactId>mi-app-hija</artifactId>
<packaging>jar</packaging>
```

y seguir siendo un proyecto concreto.

---

## Primer experimento conceptual completo

Imaginá esto:

### Padre
Define:
- encoding
- Java 21
- compiler properties

### Hijo
No vuelve a declarar nada de eso,
pero sí declara:
- su `artifactId`
- sus dependencias
- su código

Si Maven resuelve bien la herencia,
el hijo debería compilar con la base heredada.

Ese es justamente el valor.

---

## Ejercicio 1 — pensar qué te gustaría heredar

Quiero que antes de tocar archivos hagas este ejercicio.

Anotá qué cosas de tu proyecto actual te parecería lógico mover a un padre si tuvieras varios proyectos relacionados.

Por ejemplo:
- `project.build.sourceEncoding`
- `java.version`
- `maven.compiler.source`
- `maven.compiler.target`
- versiones comunes de plugins
- versions comunes de dependencias

### Objetivo
Entrenar la cabeza en separar:
- política compartida
de
- configuración específica de un proyecto hijo

---

## Qué conviene dejar en el padre

En general, en este nivel inicial, tiene mucho sentido dejar en el parent cosas como:

- properties comunes
- `dependencyManagement`
- `pluginManagement`
- política de versiones
- decisiones estructurales compartidas

Porque justamente ahí es donde la herencia más valor aporta.

---

## Qué conviene dejar en el hijo

En cambio, suele tener sentido que el hijo conserve cosas más específicas como:

- su `artifactId`
- sus dependencias concretas de uso real
- su código
- su naturaleza de aplicación o librería
- detalles particulares que no aplican a todos los demás

Entonces aparece una idea muy importante:

> el parent debería concentrar lo común; el hijo debería conservar lo específico.

Esa frase vale muchísimo.

---

## Primer ejemplo práctico que podrías construir

Podrías imaginar una estructura así:

```text
maven-parent-base/
├── pom.xml   (padre con packaging pom)

mi-app-hija/
├── pom.xml   (hijo que declara al padre)
└── src/...
```

No hace falta que todavía armes algo súper complejo.
Con dos proyectos separados ya podés entender muchísimo.

---

## Qué relación tiene esto con effective POM

Muchísima.

Este tema conecta de forma hermosísima con algo que ya venís aprendiendo:

- el `pom.xml` escrito
- el modelo efectivo que Maven realmente usa

Cuando hay herencia,
el effective POM se vuelve todavía más útil,
porque te deja ver:

- qué vino del padre
- qué puso el hijo
- cómo quedó combinada la configuración final

Entonces aparece una verdad importante:

> el effective POM es una de las mejores herramientas para entender herencia en Maven, porque te muestra el resultado combinado real entre padre e hijo.

---

## Ejercicio 2 — pensar el effective POM del hijo

Aunque todavía no armes todo,
quiero que te hagas esta pregunta:

> si el padre define `java.version=21` y el hijo no dice nada sobre eso, ¿dónde debería verse finalmente esa decisión?

La respuesta conceptual importante es:
- en el modelo efectivo del hijo

Eso ya te prepara muy bien.

---

## Qué relación tiene esto con dependencyManagement y pluginManagement

Total.

Este tema no aparece aislado.
En realidad, le da todavía más sentido a lo que ya aprendiste.

Porque ahora podés imaginar:

- un padre que centraliza `dependencyManagement`
- un padre que centraliza `pluginManagement`
- y varios hijos que consumen esa política

Entonces aparece una idea muy importante:

> muchas de las herramientas que ya aprendiste cobran todavía más valor cuando dejan de usarse solo en un proyecto y pasan a formar parte de una base compartida entre varios.

---

## Una intuición muy útil

Podés pensarlo así:

- antes aprendías herramientas de orden
- ahora empezás a aprender dónde viven mejor esas herramientas cuando ya no hay un solo proyecto

Esa transición es muy propia del nivel intermedio.

---

## Error común 1 — creer que parent POM y multi-módulo son exactamente lo mismo

No necesariamente.

Están muy relacionados,
pero no son idénticos.

Hoy estás trabajando sobre todo la idea de:
- herencia padre-hijo

Más adelante vas a profundizar mejor la parte de módulos y agregación.

---

## Error común 2 — querer meter todo en el parent

No.
Si llevás al padre cosas demasiado específicas,
el hijo pierde identidad y flexibilidad.

Conviene recordar esta regla:
- el padre comparte
- el hijo concreta

---

## Error común 3 — creer que el hijo deja de necesitar su propio pom

Tampoco.
El hijo sigue teniendo su `pom.xml`.
Solo que ya no empieza desde cero,
sino desde una base heredada.

---

## Error común 4 — no usar el effective POM para entender la herencia

Sería una pena,
porque justamente esta es una de las situaciones donde más valor tiene esa herramienta.

---

## Qué no conviene olvidar

Este tema no pretende que hoy ya armes una arquitectura gigante con cinco módulos y parent corporativo.

Lo que sí quiere dejarte es una base muy clara:

- qué es un parent
- qué hereda un hijo en idea general
- por qué existe
- y por qué esto cambia la escala mental de Maven

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Escribí un `pom.xml` mental o real de un parent con:
- `packaging` = `pom`
- properties comunes
- nombre y descripción

### Ejercicio 2
Escribí un `pom.xml` mental o real de un hijo que declare al parent.

### Ejercicio 3
Anotá qué cosas moverías al padre y cuáles dejarías en el hijo.

### Ejercicio 4
Escribí con tus palabras por qué esto evita duplicación entre proyectos relacionados.

### Ejercicio 5
Respondé cómo usarías el effective POM para verificar herencia.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es un `parent POM`?
2. ¿Qué significa que un proyecto hijo herede de un padre?
3. ¿Por qué muchos padres usan `packaging` igual a `pom`?
4. ¿Qué tipo de cosas conviene poner en el padre?
5. ¿Qué tipo de cosas conviene dejar en el hijo?
6. ¿Por qué el effective POM es tan útil en este tema?

---

## Mini desafío

Armá una práctica conceptual o real con dos proyectos:

1. un parent con:
   - `packaging` `pom`
   - properties comunes
   - quizá una base de management simple
2. un hijo que declare ese parent
3. escribí una nota breve explicando:
   - qué heredaría el hijo
   - qué seguiría siendo propio del hijo
   - y por qué esto vuelve más sana la estructura si tuvieras varios proyectos parecidos

Tu objetivo es que Maven deje de verse solo como una herramienta de build por proyecto individual y empiece a sentirse como una herramienta de organización entre proyectos.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este trigésimo octavo tema, ya deberías poder:

- entender qué es un parent POM
- entender la lógica básica de herencia entre padre e hijo
- distinguir mejor entre política compartida y configuración específica
- ver por qué `packaging pom` es tan importante en este contexto
- y reconocer que ya entraste en una capa de Maven claramente más estructural y más intermedia

---

## Resumen del tema

- Un parent POM permite compartir configuración entre proyectos relacionados.
- Un proyecto hijo puede heredar parte importante de esa base.
- `packaging pom` suele ser central en proyectos padres.
- El padre concentra política común; el hijo conserva identidad y uso concreto.
- Herramientas como `dependencyManagement`, `pluginManagement` y `properties` cobran todavía más valor en esta estructura.
- Effective POM se vuelve una herramienta clave para entender cómo queda la herencia combinada.
- Ya diste un paso claro desde Maven de proyecto aislado hacia Maven de estructura compartida.

---

## Próximo tema

En el próximo tema vas a aprender a crear un ejemplo real de padre e hijo y a verificar la herencia con el effective POM, porque después de entender la idea conceptual de parent POM, el siguiente paso natural es bajarla a una práctica concreta donde la herencia ya no sea solo teoría sino estructura funcionando.
