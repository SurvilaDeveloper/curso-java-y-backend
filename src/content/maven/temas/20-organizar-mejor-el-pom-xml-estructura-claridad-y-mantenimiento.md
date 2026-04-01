---
title: "Organizar mejor el pom.xml: estructura, claridad y mantenimiento"
description: "Vigésimo tema práctico del curso de Maven: aprender a ordenar el pom.xml con una estructura más clara, consistente y mantenible para que el proyecto sea más legible y más profesional a medida que crece."
order: 20
module: "Resolución y control de dependencias"
level: "base"
draft: false
---

# Organizar mejor el `pom.xml`: estructura, claridad y mantenimiento

## Objetivo del tema

En este vigésimo tema vas a:

- aprender a ordenar mejor el `pom.xml`
- distinguir secciones conceptuales dentro del archivo
- dejar las properties, dependencias y bloques de build en una estructura más clara
- mejorar la legibilidad y el mantenimiento del proyecto
- escribir un `pom.xml` que no solo funcione, sino que también se entienda mejor

La idea es que empieces a tratar el `pom.xml` no solo como un archivo que “hay que tocar para que Maven ande”, sino como una pieza importante de diseño y comunicación del proyecto.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- usar `properties`
- usar `dependencyManagement`
- leer el árbol de dependencias
- generar el effective POM
- entender scopes, build, tests y artefactos básicos

Si venís siguiendo el curso, ya tenés la base perfecta para este paso.

---

## Idea central del tema

A medida que un proyecto Maven crece, el `pom.xml` puede empezar a volverse:

- largo
- repetitivo
- desordenado
- difícil de leer
- difícil de mantener

Y eso no siempre rompe el build,
pero sí empeora muchísimo la claridad del proyecto.

Entonces aparece una idea muy importante:

> un buen `pom.xml` no solo tiene que compilar; también debería ser legible, consistente y fácil de mantener.

---

## Por qué este tema importa

Porque en Maven una parte grande del trabajo real está en el `pom.xml`.

Ahí terminás concentrando cosas como:

- identidad del proyecto
- versión
- packaging
- properties
- dependencias
- manejo de versiones
- configuración de compilación
- plugins
- perfiles más adelante
- y bastante parte de la lógica del build

Si todo eso queda mezclado,
el archivo puede “andar”,
pero cuesta mucho más trabajar con él.

---

## Qué significa organizar mejor el pom

No significa hacer algo rebuscado.
Significa algo bastante más práctico:

- agrupar cosas relacionadas
- evitar repeticiones innecesarias
- mantener una estructura estable
- usar nombres claros
- dejar bloques reconocibles
- y ordenar el archivo para que otra persona —o vos mismo después— lo entienda rápido

Dicho simple:

> organizar bien el `pom.xml` es una forma de bajar ruido y subir claridad.

---

## Una intuición muy útil

Podés pensarlo así:

- un `pom.xml` desordenado te obliga a buscar demasiado
- un `pom.xml` ordenado te deja leer por secciones

Esta diferencia parece chica,
pero en proyectos reales pesa mucho.

---

## Una estructura bastante sana para esta etapa

En el nivel donde estás ahora,
una estructura razonable del `pom.xml` podría verse así:

```xml
<project ...>
    <modelVersion>4.0.0</modelVersion>

    <!-- identidad del proyecto -->
    <groupId>...</groupId>
    <artifactId>...</artifactId>
    <version>...</version>
    <packaging>jar</packaging>

    <!-- metadata descriptiva -->
    <name>...</name>
    <description>...</description>

    <!-- valores reutilizables -->
    <properties>
        ...
    </properties>

    <!-- administración centralizada -->
    <dependencyManagement>
        <dependencies>
            ...
        </dependencies>
    </dependencyManagement>

    <!-- dependencias usadas realmente -->
    <dependencies>
        ...
    </dependencies>

    <!-- configuración de build -->
    <build>
        ...
    </build>
</project>
```

No hace falta que siempre sea exactamente así,
pero esta lógica ya ordena muchísimo.

---

## Primer bloque: identidad del proyecto

Este bloque debería quedar bien visible y limpio:

```xml
<groupId>com.gabriel.mavencurso</groupId>
<artifactId>mi-primer-proyecto-maven</artifactId>
<version>0.1.0-SNAPSHOT</version>
<packaging>jar</packaging>
```

### Por qué conviene tenerlo arriba
Porque define la identidad técnica del proyecto.
Es una de las primeras cosas que conviene ver al abrir el `pom.xml`.

---

## Segundo bloque: metadata descriptiva

Después suele tener sentido dejar:

```xml
<name>Mi primer proyecto Maven</name>
<description>Proyecto de práctica para aprender Maven</description>
```

Esto no es lo más “técnico” del build,
pero sí ayuda mucho a la claridad del proyecto.

---

## Tercer bloque: properties

Acá conviene centralizar valores que:

- se repiten
- querés dejar visibles
- o tienen sentido como decisiones de configuración

Por ejemplo:

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <java.version>21</java.version>
    <maven.compiler.source>${java.version}</maven.compiler.source>
    <maven.compiler.target>${java.version}</maven.compiler.target>
    <commons.lang3.version>3.14.0</commons.lang3.version>
    <junit.version>4.13.2</junit.version>
</properties>
```

### Qué conviene hacer acá
Ordenarlas más o menos por grupos lógicos:

1. configuración general
2. Java
3. versiones de dependencias

No es obligatorio,
pero ayuda mucho a leer.

---

## Cuarto bloque: dependencyManagement

Si ya estás usando `dependencyManagement`,
conviene dejarlo bien separado de `dependencies`.

Por ejemplo:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
            <version>${commons.lang3.version}</version>
        </dependency>

        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### Por qué conviene separarlo visualmente
Porque cumple un rol distinto:
- no agrega uso real
- administra definición

Entonces si lo dejás mezclado con `dependencies`,
bajás claridad.

---

## Quinto bloque: dependencies

Acá deberían quedar las librerías realmente usadas por el proyecto.

Por ejemplo:

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-lang3</artifactId>
    </dependency>

    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Qué conviene cuidar acá
Que se lea rápido:
- qué dependencias usa realmente el proyecto
- cuáles son de compile
- cuáles son de test

---

## Sexto bloque: build

Si ya necesitás algo de build explícito,
conviene dejarlo más abajo y bien separado.

Por ejemplo, si más adelante configurás plugins o algo de compilación más visible.

En esta etapa puede que tu bloque `build` todavía sea pequeño o incluso no haga falta tocarlo mucho.
Pero ya conviene pensar que tiene su lugar propio.

---

## Qué problema resuelve este orden

Muchos.

Por ejemplo:

- no tener properties perdidas abajo de todo
- no mezclar `dependencyManagement` con `dependencies`
- no esconder la identidad del proyecto entre otras cosas
- no obligarte a escanear el archivo entero cada vez

Entonces aparece una verdad importante:

> un `pom.xml` ordenado baja la carga mental de trabajar con Maven.

---

## Ejercicio 1 — comparar tu pom actual con una estructura más clara

Quiero que hagas esto:

### Paso 1
Abrí tu `pom.xml` actual.

### Paso 2
Marcá con comentarios mentales o en un papel:
- identidad
- metadata
- properties
- dependencyManagement
- dependencies
- build

### Paso 3
Preguntate:
- ¿están bien agrupados?
- ¿hay algo mezclado?
- ¿hay bloques que cueste encontrar?

### Objetivo
Empezar a leer el archivo por secciones conceptuales y no como un bloque único.

---

## Primer criterio práctico de orden

Cuando tengas dudas,
podés usar esta regla:

> lo que define “quién es el proyecto” debería estar arriba; lo que define “cómo se construye o qué usa” debería ir después.

Eso te ordena mucho.

---

## Segundo criterio práctico de orden

Otra regla útil:

> primero centralizá decisiones, después mostrás uso real.

Por eso suele tener mucho sentido que:

- `properties`
- `dependencyManagement`

vayan antes de:

- `dependencies`

porque primero dejás definidas políticas o valores,
y después mostrás qué usa el proyecto realmente.

---

## Tercer criterio práctico de orden

Otra idea muy útil:

> cosas del mismo tipo deberían vivir juntas.

Por ejemplo:

- todas las versions properties juntas
- todas las dependencias administradas juntas
- todas las dependencias usadas juntas

Eso evita una lectura fragmentada.

---

## Ejercicio 2 — reordenar tu pom sin cambiar funcionalidad

Quiero que hagas esto:

### Paso 1
Tomá tu `pom.xml`.

### Paso 2
Reordenalo para que tenga una estructura más limpia.

### Paso 3
No cambies todavía:
- dependencias
- versiones
- lógica del build

Solo reordená y mejorá claridad.

### Paso 4
Corré:

```bash
mvn clean test
```

o

```bash
mvn clean package
```

## Qué objetivo tiene

Demostrarte que muchas veces podés mejorar mucho la legibilidad sin cambiar la funcionalidad.

---

## Qué relación tiene esto con el effective POM

Muy fuerte.

En el tema anterior viste que Maven arma un proyecto efectivo bastante más rico que tu `pom.xml`.

Bueno:
justamente por eso conviene que el `pom.xml` que vos sí escribís esté lo más claro posible.

Porque si el effective POM ya es grande,
tu archivo fuente debería ayudarte a:

- orientarte
- comunicar intención
- y mantener control

Entonces aparece una idea importante:

> cuanto más complejo es lo que Maven arma detrás, más valor tiene que tu `pom.xml` fuente esté bien ordenado adelante.

---

## Qué relación tiene esto con el mantenimiento

Muchísima.

Un `pom.xml` desordenado hace más difícil cosas como:

- encontrar una versión
- mover una dependencia a management
- revisar scopes
- detectar repeticiones
- comparar cambios
- preparar un parent o multi-módulo más adelante

En cambio, un `pom.xml` limpio escala mucho mejor.

---

## Una intuición muy útil

Podés pensarlo así:

> ordenar el `pom.xml` no cambia solo cómo se ve; cambia cuánto cuesta trabajar con él.

Esa frase vale muchísimo.

---

## Qué no conviene hacer

No conviene:

- mezclar bloques por comodidad momentánea
- meter properties en cualquier parte
- dejar versiones repetidas si ya centralizaste
- esconder decisiones importantes entre dependencias sueltas
- ni convertir el archivo en una pared de XML sin jerarquía visual

Todo eso hace que el proyecto sea más cansador de mantener.

---

## Error común 1 — pensar que mientras compile, el orden da igual

No.
A corto plazo puede parecer que sí.
Pero a medida que el proyecto crece,
el orden del `pom.xml` afecta mucho la mantenibilidad.

---

## Error común 2 — duplicar bloques conceptuales

Por ejemplo:
- algunas properties arriba y otras abajo
- algunas dependencias administradas mezcladas con dependencias de uso real
- versiones repetidas en varios lados

Eso baja mucho la claridad.

---

## Error común 3 — querer un “orden perfecto universal”

Tampoco hace falta obsesionarse.
Lo importante es que el archivo sea:

- claro
- consistente
- fácil de recorrer

No que siga una estética rígida absoluta.

---

## Error común 4 — reorganizar tanto que cambiás semántica sin darte cuenta

Cuando reordenes,
hacelo con cuidado.
Y después siempre corré algo como:

```bash
mvn clean test
```

para verificar que no rompiste nada.

---

## Ejercicio 3 — dejar un pom base más profesional

Quiero que tu `pom.xml` termine pareciéndose más o menos a esto:

```xml
<project ...>
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.gabriel.mavencurso</groupId>
    <artifactId>mi-primer-proyecto-maven</artifactId>
    <version>0.1.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>Mi primer proyecto Maven</name>
    <description>Proyecto de práctica para aprender Maven</description>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <java.version>21</java.version>
        <maven.compiler.source>${java.version}</maven.compiler.source>
        <maven.compiler.target>${java.version}</maven.compiler.target>
        <commons.lang3.version>3.14.0</commons.lang3.version>
        <junit.version>4.13.2</junit.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.apache.commons</groupId>
                <artifactId>commons-lang3</artifactId>
                <version>${commons.lang3.version}</version>
            </dependency>

            <dependency>
                <groupId>junit</groupId>
                <artifactId>junit</artifactId>
                <version>${junit.version}</version>
                <scope>test</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
        </dependency>

        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

No hace falta que quede idéntico.
Sí hace falta que se note una estructura mucho más clara.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Abrí tu `pom.xml` actual.

### Ejercicio 2
Reorganizá el archivo por bloques lógicos:
- identidad
- metadata
- properties
- dependencyManagement
- dependencies
- build

### Ejercicio 3
Evitá repetir versiones si ya están centralizadas.

### Ejercicio 4
Dejá las properties agrupadas de forma coherente.

### Ejercicio 5
Corré:

```bash
mvn clean test
```

o:

```bash
mvn clean package
```

### Ejercicio 6
Escribí con tus palabras qué mejoró en legibilidad respecto del archivo anterior.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Por qué conviene ordenar el `pom.xml` aunque el proyecto ya compile?
2. ¿Qué bloques conceptuales conviene distinguir dentro del archivo?
3. ¿Por qué tiene sentido separar `dependencyManagement` de `dependencies`?
4. ¿Qué ventaja da agrupar bien las properties?
5. ¿Cómo sabés si una reorganización fue sana?

---

## Mini desafío

Creá un proyecto nuevo, por ejemplo:

- `pom-ordenado-demo`

Y hacé esto:

1. generá un `pom.xml` funcional
2. agregá properties
3. agregá `dependencyManagement`
4. agregá dos dependencias reales
5. reorganizá el archivo para que quede más profesional
6. corré `mvn clean package`
7. escribí una nota breve explicando por qué ese `pom.xml` ahora se lee mejor

Tu objetivo es que ordenar el `pom.xml` deje de parecer una cuestión estética y pase a sentirse como una mejora real de mantenimiento.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este vigésimo tema, ya deberías poder:

- organizar mejor el `pom.xml`
- distinguir bloques conceptuales dentro del archivo
- separar mejor política, uso real y configuración general
- mejorar claridad sin romper funcionalidad
- y escribir un `pom.xml` bastante más mantenible que al comienzo del curso

---

## Resumen del tema

- Un `pom.xml` no solo tiene que funcionar; también tiene que poder leerse bien.
- Conviene organizarlo por bloques conceptuales.
- La identidad del proyecto, las properties, el dependencyManagement y las dependencias reales deberían verse claramente separados.
- Reordenar bien el archivo mejora muchísimo el mantenimiento.
- No hace falta obsesionarse con un orden perfecto, pero sí construir una estructura consistente y clara.
- Ya empezaste a escribir `pom.xml` más profesionales y no solo funcionales.

---

## Próximo tema

En el próximo tema vas a aprender a usar perfiles (`profiles`) de Maven en un nivel inicial, porque después de ordenar mejor el `pom.xml`, el siguiente paso natural es empezar a ver cómo cambiar cierta configuración según contexto sin duplicar proyectos ni romper la estructura principal.
