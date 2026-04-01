---
title: "Distinguir parent POM de agregador multi-módulo en Maven"
description: "Cuadragésimo tema práctico del curso de Maven: aprender la diferencia entre un parent POM y un proyecto agregador multi-módulo, entender por qué no son exactamente lo mismo y ver cómo pueden convivir en una misma estructura Maven."
order: 40
module: "Herencia, parents y multi-módulo"
level: "intermedio"
draft: false
---

# Distinguir `parent POM` de agregador multi-módulo en Maven

## Objetivo del tema

En este cuadragésimo tema vas a:

- distinguir claramente entre un `parent POM` y un proyecto agregador multi-módulo
- entender qué problema resuelve cada uno
- ver por qué suelen convivir, pero no son exactamente lo mismo
- aprender la idea básica de `<modules>`
- empezar a pensar Maven no solo como herencia entre proyectos, sino también como coordinación de varios módulos

La idea es que no mezcles dos conceptos que en la práctica aparecen muy juntos, pero que cumplen roles distintos dentro de una estructura Maven más grande.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear proyectos Maven
- leer y modificar `pom.xml`
- usar `properties`, `dependencyManagement` y `pluginManagement`
- entender qué es un `parent POM`
- crear un padre y un hijo
- usar el effective POM para verificar herencia

Si hiciste los temas anteriores, ya tenés una base muy buena para este paso.

---

## Idea central del tema

En los últimos temas viste que un proyecto padre puede compartir configuración con un hijo.

Eso está perfecto.

Pero ahora aparece otra necesidad distinta:

- no solo querés compartir configuración
- también querés construir varios proyectos relacionados desde un punto común

Ahí aparece el concepto de proyecto **agregador** o estructura **multi-módulo**.

Entonces aparece una idea muy importante:

> un `parent POM` sirve principalmente para compartir configuración; un agregador multi-módulo sirve principalmente para coordinar varios módulos dentro de una misma estructura de build.

Esa diferencia es central.

---

## Qué es un parent POM

Repasemos la idea base.

Un `parent POM`:

- actúa como padre de uno o más proyectos hijos
- comparte configuración
- centraliza properties
- centraliza management de dependencias y plugins
- define una política técnica común

Dicho simple:

> el parent está orientado a la **herencia**.

---

## Qué es un agregador multi-módulo

Un agregador multi-módulo es un proyecto Maven, normalmente con:

```xml
<packaging>pom</packaging>
```

que además declara algo como:

```xml
<modules>
    <module>modulo-a</module>
    <module>modulo-b</module>
</modules>
```

Eso le dice a Maven:

- estos proyectos forman parte de una misma estructura
- cuando construyas desde acá, construí también estos módulos

Dicho simple:

> el agregador está orientado a la **coordinación del build de varios módulos**.

---

## Una intuición muy útil

Podés pensarlo así:

- `parent POM` = comparte reglas
- agregador multi-módulo = reúne módulos para construirlos juntos

Esta frase vale muchísimo.

---

## Por qué suelen confundirse

Porque en muchísimos proyectos reales pasa esto:

- un mismo `pom.xml` actúa como parent
- y además actúa como agregador

Entonces la gente termina pensando que ambas cosas son una sola.

Pero conceptualmente no lo son.

Entonces aparece una verdad importante:

> parent y agregador pueden convivir en el mismo archivo, pero sus roles lógicos siguen siendo distintos.

---

## Primer ejemplo conceptual

Imaginá una estructura así:

```text
mi-sistema/
├── pom.xml
├── modulo-api/
│   └── pom.xml
├── modulo-core/
│   └── pom.xml
└── modulo-app/
    └── pom.xml
```

El `pom.xml` raíz podría:

### Como parent
Compartir:
- Java 21
- encoding
- `dependencyManagement`
- `pluginManagement`

### Como agregador
Declarar:

```xml
<modules>
    <module>modulo-api</module>
    <module>modulo-core</module>
    <module>modulo-app</module>
</modules>
```

Mismo archivo.
Dos roles distintos.

---

## Qué hace `<modules>`

Es uno de los elementos clave del agregador.

Por ejemplo:

```xml
<modules>
    <module>modulo-api</module>
    <module>modulo-core</module>
    <module>modulo-app</module>
</modules>
```

Esto le dice a Maven:

- dentro de esta estructura hay varios módulos
- al ejecutar el build desde este nivel, consideralos como parte del conjunto

No hace falta que hoy explores todos los detalles de orden o resolución entre módulos.
Lo importante es entender la idea general de coordinación.

---

## Qué diferencia práctica hay entonces

Conviene decirlo muy directo.

### Parent POM
Responde más a la pregunta:
- “¿qué configuración compartimos?”

### Agregador multi-módulo
Responde más a la pregunta:
- “¿qué proyectos construimos juntos desde esta raíz?”

Esta distinción es excelente para ordenar ideas.

---

## Primer ejemplo de parent puro

Podrías tener un proyecto que solo actúe como parent:

- comparte properties
- comparte management
- no declara módulos

Por ejemplo:

```xml
<packaging>pom</packaging>
```

pero sin:

```xml
<modules>...</modules>
```

Eso seguiría siendo perfectamente válido como parent.

Entonces aparece una idea importante:

> se puede ser parent sin ser agregador.

---

## Primer ejemplo de agregador puro

También podrías imaginar un caso donde un proyecto solo coordina módulos,
pero no necesariamente está pensado como base rica de herencia.

No es el caso más pedagógico para empezar,
pero conceptualmente existe.

Entonces también aparece la otra mitad de la verdad:

> se puede agregar módulos sin que el foco principal sea actuar como parent de configuración compleja.

---

## Qué suele pasar en la práctica real

En muchísimos proyectos medianos y grandes,
el `pom.xml` raíz hace las dos cosas a la vez:

- hereda configuración a los hijos
- agrega módulos para construirlos juntos

Y por eso esta distinción cuesta al principio.

Pero entenderla bien te da mucha más claridad para leer estructuras Maven reales.

---

## Ejercicio 1 — distinguir roles por escrito

Quiero que hagas esto:

### Escribí dos definiciones cortas:
1. Qué hace un parent
2. Qué hace un agregador

### Después respondé:
- ¿pueden vivir en el mismo archivo?
- ¿siguen siendo conceptos distintos?

### Objetivo
Separar con lenguaje propio dos ideas que suelen mezclarse.

---

## Qué relación tiene esto con packaging pom

Muy fuerte.

Tanto un parent como un agregador suelen usar:

```xml
<packaging>pom</packaging>
```

Pero ojo:
eso no te dice por sí solo qué rol está cumpliendo exactamente.

Entonces aparece otra idea muy importante:

> `packaging pom` es una pista fuerte de estructura Maven, pero no alcanza por sí solo para distinguir si ese proyecto está actuando como parent, como agregador o como ambas cosas.

---

## Qué conviene mirar para distinguirlos

Muy simple:

### Si querés detectar rol de parent
Buscá:
- properties compartidas
- `dependencyManagement`
- `pluginManagement`
- proyectos hijos que lo referencian en `<parent>`

### Si querés detectar rol de agregador
Buscá:
- `<modules>`

Esto te da una forma muy práctica de leer proyectos reales.

---

## Ejercicio 2 — leer un pom raíz con dos lentes

Quiero que imagines o armes un `pom.xml` raíz y lo leas dos veces:

### Primera lectura
Como parent:
- ¿qué comparte?
- ¿qué política centraliza?

### Segunda lectura
Como agregador:
- ¿qué módulos lista?
- ¿qué está coordinando?

### Objetivo
Entrenar una lectura estructural de Maven más madura.

---

## Primer ejemplo de raíz combinada

Un `pom.xml` raíz bastante típico podría verse así:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.gabriel.mavencurso</groupId>
    <artifactId>mi-sistema-parent</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <name>Mi Sistema Parent</name>
    <description>Raíz compartida para varios módulos</description>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <java.version>21</java.version>
        <maven.compiler.source>${java.version}</maven.compiler.source>
        <maven.compiler.target>${java.version}</maven.compiler.target>
    </properties>

    <modules>
        <module>modulo-api</module>
        <module>modulo-core</module>
        <module>modulo-app</module>
    </modules>
</project>
```

## Qué roles cumple este ejemplo

### Como parent
Comparte properties.

### Como agregador
Lista módulos.

Mismo archivo.
Dos funciones.

---

## Qué relación tiene esto con el build real

Muchísima.

Si corrés Maven desde la raíz de un agregador multi-módulo,
Maven puede construir el conjunto de módulos según esa estructura.

Esto cambia mucho la escala de lo que entendés por “proyecto Maven”.

Hasta acá venías pensando mucho en:
- un proyecto
- un build

Ahora empezás a pensar también en:
- una familia de módulos
- una raíz común
- un build coordinado

Eso ya es muy intermedio.

---

## Una intuición muy útil

Podés pensarlo así:

> el parent organiza la política; el agregador organiza la construcción conjunta.

Esa frase vale muchísimo.

---

## Qué relación tiene esto con el effective POM

Muy fuerte otra vez.

### Para el rol de parent
El effective POM de un hijo te deja ver lo heredado.

### Para el rol de agregador
La estructura de módulos te ayuda a entender qué proyectos entran en el build conjunto.

Entonces aparecen dos herramientas mentales distintas:
- effective POM para herencia
- modules para agregación

Esto te ayuda muchísimo a no mezclar planos.

---

## Error común 1 — creer que `<packaging>pom</packaging>` significa automáticamente “es parent y listo”

No necesariamente.
Puede ser parent,
agregador,
o ambas cosas.

---

## Error común 2 — creer que `<modules>` sirve para heredar configuración

No.
`<modules>` sirve para agregar y coordinar módulos.
La herencia va por otro camino:
- el bloque `<parent>` en los hijos

---

## Error común 3 — creer que si un proyecto hereda de un padre, automáticamente ya forma parte de un build multi-módulo

Tampoco.
Heredar no es lo mismo que estar agregado dentro de una raíz multi-módulo.

Esa diferencia conviene dejarla clarísima.

---

## Error común 4 — leer un pom raíz solo con un lente

Muchos archivos raíz cumplen más de una función.
Conviene preguntarse siempre:
- ¿qué comparte?
- ¿qué agrega?

---

## Ejercicio 3 — construir una tabla comparativa

Quiero que armes una tabla con estas columnas:

- Concepto
- Qué problema resuelve
- Indicador principal en el `pom.xml`
- Relación con otros proyectos

Y completala para:

- Parent POM
- Agregador multi-módulo

### Objetivo
Fijar de forma visual la diferencia.

---

## Qué no conviene olvidar

Este tema no pretende que todavía construyas ya un multi-módulo completo.
Todavía no hace falta.

Lo que sí quiere dejarte es una distinción fundamental para seguir avanzando con claridad:

- heredar no es igual a agregar módulos
- compartir configuración no es lo mismo que coordinar un conjunto de builds
- y Maven puede hacer ambas cosas, incluso desde la misma raíz

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Escribí con tus palabras qué hace un parent.

### Ejercicio 2
Escribí con tus palabras qué hace un agregador multi-módulo.

### Ejercicio 3
Tomá un ejemplo de `pom.xml` raíz y marcá:
- qué parte cumple rol de parent
- qué parte cumple rol de agregador

### Ejercicio 4
Explicá por qué `<modules>` no reemplaza al bloque `<parent>`.

### Ejercicio 5
Explicá por qué `packaging pom` no alcanza por sí solo para distinguir el rol exacto.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué diferencia hay entre un parent POM y un agregador?
2. ¿Qué hace el bloque `<modules>`?
3. ¿Qué hace el bloque `<parent>` en un hijo?
4. ¿Pueden parent y agregador convivir en el mismo archivo?
5. ¿Por qué esta distinción es importante para leer estructuras Maven reales?

---

## Mini desafío

Armá una práctica conceptual con una raíz como esta:

- un `pom.xml` raíz con `packaging pom`
- algunas properties compartidas
- una lista de módulos

Después escribí una nota breve explicando:
- qué parte de esa raíz actúa como parent
- qué parte actúa como agregador
- y qué tendría que hacer un módulo hijo para heredar de esa raíz

Tu objetivo es que esta distinción deje de ser una sutileza teórica y pase a ser una herramienta concreta para leer mejor proyectos Maven más grandes.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este cuadragésimo tema, ya deberías poder:

- distinguir claramente entre parent y agregador
- entender qué papel cumple `<modules>`
- entender qué papel cumple `<parent>`
- reconocer cuándo un mismo `pom.xml` cumple ambos roles
- y leer estructuras Maven de varios proyectos con bastante más claridad que antes

---

## Resumen del tema

- Parent POM y agregador multi-módulo no son exactamente lo mismo.
- El parent comparte configuración; el agregador coordina módulos.
- Ambos pueden convivir en el mismo `pom.xml`.
- `packaging pom` no alcanza por sí solo para distinguir el rol exacto.
- `<parent>` y `<modules>` cumplen funciones distintas y complementarias.
- Ya diste otro paso importante hacia una comprensión más estructural e intermedia de Maven.

---

## Próximo tema

En el próximo tema vas a aprender a construir un ejemplo real de multi-módulo con una raíz agregadora y varios módulos hijos, porque después de distinguir conceptualmente parent y agregador, el siguiente paso natural es ver una estructura multi-módulo funcionando de verdad y entender cómo Maven la construye como conjunto.
