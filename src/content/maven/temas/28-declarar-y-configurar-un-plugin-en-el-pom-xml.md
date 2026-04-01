---
title: "Declarar y configurar un plugin en el pom.xml"
description: "Vigésimo octavo tema práctico del curso de Maven: aprender a declarar un plugin explícitamente en el pom.xml, entender dónde vive dentro del build y hacer una primera configuración consciente para dejar de ver los plugins solo como algo implícito."
order: 28
module: "Plugins y build"
level: "base"
draft: false
---

# Declarar y configurar un plugin en el `pom.xml`

## Objetivo del tema

En este vigésimo octavo tema vas a:

- aprender dónde se declaran los plugins en el `pom.xml`
- entender la diferencia entre usar un plugin de forma implícita y declararlo explícitamente
- hacer una primera configuración real de un plugin
- empezar a ver el bloque `build` como una parte viva del proyecto
- dejar de pensar que los plugins son solo algo que Maven usa “por detrás” y empezar a configurarlos con intención

La idea es que des un paso importante:
pasar de reconocer que los plugins existen a empezar a controlarlos dentro del proyecto.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- usar `properties`
- entender el lifecycle básico
- distinguir dependencias del proyecto y plugins
- leer la salida del build
- generar el effective POM
- entender el rol del bloque `build` en un nivel inicial

Si hiciste el tema anterior, ya estás listo para este paso.

---

## Idea central del tema

En el tema anterior viste que Maven usa plugins como:

- `maven-clean-plugin`
- `maven-compiler-plugin`
- `maven-surefire-plugin`
- `maven-jar-plugin`

Y también viste que muchas veces Maven los usa aunque vos no los declares explícitamente en tu `pom.xml`.

Eso pasa porque Maven tiene mucho comportamiento por defecto.

Pero llega un punto donde querés decir algo más preciso, por ejemplo:

- qué versión del plugin querés usar
- qué configuración concreta querés aplicar
- cómo querés que se comporte cierta parte del build

Ahí aparece una idea muy importante:

> cuando querés gobernar de verdad una parte del build, muchas veces conviene declarar explícitamente el plugin en el `pom.xml`.

---

## Dónde se declaran los plugins

Los plugins suelen declararse dentro de:

```xml
<build>
    <plugins>
        ...
    </plugins>
</build>
```

Ese es el lugar natural donde vive la configuración de plugins del proyecto.

Entonces aparece otra idea clave:

> si las dependencias del proyecto viven en `dependencies`, los plugins del build viven en `build/plugins`.

Esa separación es muy sana y muy importante.

---

## Una intuición muy útil

Podés pensarlo así:

- `dependencies` = qué librerías usa tu proyecto
- `build/plugins` = qué herramientas usa Maven para construirlo

Esa frase vale muchísimo.

---

## Estructura básica de un plugin

La forma general es esta:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>...</groupId>
            <artifactId>...</artifactId>
            <version>...</version>
        </plugin>
    </plugins>
</build>
```

No siempre hace falta configurar todo de una.
Pero esa es la base.

---

## Primer ejemplo concreto: declarar el compiler plugin

Como ya venís trabajando con compilación Java,
un primer caso muy lógico es el `maven-compiler-plugin`.

Podrías declarar algo así:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
        </plugin>
    </plugins>
</build>
```

## Qué significa esto

Le estás diciendo a Maven de forma explícita:
- para la compilación, quiero este plugin
- y además quiero esta versión del plugin

Eso ya es una mejora respecto de dejar todo completamente implícito.

---

## Qué cambia cuando lo declarás explícitamente

Aunque el build quizá ya funcionaba antes,
declararlo explícitamente tiene varias ventajas:

- la versión del plugin deja de quedar tan implícita
- el `pom.xml` expresa mejor qué herramientas usa
- te preparás para configurarlo más
- y ganás más control y más claridad

Entonces aparece una verdad importante:

> declarar explícitamente un plugin no siempre cambia el comportamiento de inmediato, pero sí cambia el nivel de control que tenés sobre el build.

---

## Primer experimento práctico

Agregá este bloque a tu `pom.xml`:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
        </plugin>
    </plugins>
</build>
```

Después corré:

```bash
mvn clean compile
```

## Qué deberías observar

El proyecto debería seguir compilando.
Quizá no notes un cambio espectacular inmediato.
Pero ahora el plugin de compilación quedó declarado explícitamente en el proyecto.

---

## Qué aprendiste con esto

Que una parte del build que antes Maven resolvía de forma más implícita,
ahora quedó escrita con intención dentro del `pom.xml`.

Y eso ya es muy valioso.

---

## Segundo paso: agregar configuración al plugin

Ahora vamos a dar el paso realmente interesante:
no solo declararlo,
sino configurarlo.

Por ejemplo, podrías decirle explícitamente que use la versión Java a través de tus properties.

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
            <configuration>
                <source>${maven.compiler.source}</source>
                <target>${maven.compiler.target}</target>
            </configuration>
        </plugin>
    </plugins>
</build>
```

## Qué significa esto

Ya no solo declaraste el plugin.
También le estás pasando configuración concreta.

Eso ya es un salto mucho más fuerte.

---

## Qué relación tiene esto con las properties que ya venís usando

Muy fuerte.

Si ya tenés algo así:

```xml
<properties>
    <java.version>21</java.version>
    <maven.compiler.source>${java.version}</maven.compiler.source>
    <maven.compiler.target>${java.version}</maven.compiler.target>
</properties>
```

entonces el plugin puede tomar esos valores desde ahí.

Eso conecta perfecto dos capas que ya venías aprendiendo:

- properties para centralizar decisiones
- plugins para aplicar esas decisiones al build

Entonces aparece una idea muy importante:

> un `pom.xml` más maduro no solo declara valores; también conecta esos valores con la herramienta del build que realmente los usa.

---

## Ejercicio 1 — declarar el compiler plugin con configuración

Quiero que hagas esto:

### Paso 1
Asegurate de tener en `properties`:

```xml
<java.version>21</java.version>
<maven.compiler.source>${java.version}</maven.compiler.source>
<maven.compiler.target>${java.version}</maven.compiler.target>
```

### Paso 2
Agregá el `maven-compiler-plugin` en `build/plugins`.

### Paso 3
Dentro, configurá:

```xml
<source>${maven.compiler.source}</source>
<target>${maven.compiler.target}</target>
```

### Paso 4
Corré:

```bash
mvn clean compile
```

### Objetivo
Conectar una property del proyecto con una herramienta concreta del build.

---

## Qué ventaja tiene hacer esto explícito

Varias.

- deja más claro el build
- vuelve visible la configuración del compilador
- hace menos dependiente el proyecto de defaults implícitos
- y te prepara para configuraciones más avanzadas después

En otras palabras:

> el build deja de ser una caja negra un poco menos cada vez.

---

## Qué relación tiene esto con el effective POM

Muy fuerte.

Después de declarar el plugin,
podés generar:

```bash
mvn help:effective-pom -Doutput=effective-pom.xml
```

y buscar:

- `maven-compiler-plugin`

## Qué deberías observar

Ahora el plugin debería aparecer en el effective POM de forma mucho más explícita y coherente con lo que vos definiste.

Esto te ayuda a cerrar el círculo:

- declaraste el plugin
- configuraste el plugin
- verificaste el resultado efectivo

---

## Ejercicio 2 — verificar el plugin en el effective POM

Quiero que hagas esto:

### Paso 1
Declará el compiler plugin en `build/plugins`.

### Paso 2
Corré:

```bash
mvn help:effective-pom -Doutput=effective-pom.xml
```

### Paso 3
Buscá:
- `maven-compiler-plugin`

### Paso 4
Verificá si aparece la configuración que agregaste.

### Objetivo
Ver que el plugin declarado pasa a formar parte explícita del modelo efectivo del proyecto.

---

## Qué diferencia hay entre declarar un plugin y usarlo por default

Esto conviene dejarlo clarísimo.

### Uso implícito por default
Maven usa el plugin porque forma parte del comportamiento esperado del lifecycle.

### Declaración explícita
Vos escribís en el `pom.xml`:
- qué plugin querés
- qué versión
- y eventualmente qué configuración

Entonces aparece una verdad importante:

> el uso implícito alcanza para empezar; la declaración explícita aparece cuando querés gobernar el build con más precisión.

---

## Error común 1 — creer que si Maven ya lo usa por default, declararlo no sirve para nada

No.
Sirve muchísimo cuando querés:

- controlar versión
- hacer visible la herramienta
- configurar su comportamiento
- y reducir ambigüedad

---

## Error común 2 — mezclar plugins dentro de dependencies

No.
Los plugins no van ahí.
Van en:

```xml
<build>
    <plugins>
        ...
    </plugins>
</build>
```

Esta diferencia estructural es central.

---

## Error común 3 — declarar el plugin pero no verificar nada

Siempre que puedas, después:

- corré el build
- mirá la salida
- y/o revisá el effective POM

Eso te ayuda a confirmar que la configuración quedó viva de verdad.

---

## Error común 4 — empezar configurando diez plugins a la vez

No hace falta.
Este tema es mucho más sano si lo hacés con un solo plugin bien entendido.

Por eso el `maven-compiler-plugin` es un gran primer paso.

---

## Una intuición muy útil

Podés pensarlo así:

> declarar un plugin explícitamente es convertir una pieza implícita del build en una decisión visible del proyecto.

Esa frase vale muchísimo.

---

## Qué relación tiene esto con el orden del pom

Muchísima.

Ahora tu `pom.xml` empieza a tener de verdad un bloque `build` con sentido real.

Entonces conviene que el archivo siga bien ordenado:

- identidad
- metadata
- properties
- dependencyManagement
- dependencies
- build
- profiles si corresponde

Eso vuelve más legible el proyecto completo.

---

## Ejercicio 3 — dejar tu build más serio

Quiero que al menos tu `pom.xml` tenga algo parecido a esto:

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <java.version>21</java.version>
    <maven.compiler.source>${java.version}</maven.compiler.source>
    <maven.compiler.target>${java.version}</maven.compiler.target>
</properties>

<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
            <configuration>
                <source>${maven.compiler.source}</source>
                <target>${maven.compiler.target}</target>
            </configuration>
        </plugin>
    </plugins>
</build>
```

No hace falta que sea idéntico.
Sí hace falta que:
- el plugin esté explícitamente declarado
- y que el bloque `build` empiece a sentirse real dentro del proyecto

---

## Qué no conviene olvidar

Este tema no pretende que todavía domines todos los plugins de Maven.

Lo que sí quiere dejarte es una base muy importante:

- dónde viven
- cómo se declaran
- cómo se configuran
- cómo se relacionan con properties y effective POM

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Declará el `maven-compiler-plugin` en tu `pom.xml`.

### Ejercicio 2
Agregá una configuración explícita para `source` y `target`.

### Ejercicio 3
Corré:

```bash
mvn clean compile
```

### Ejercicio 4
Generá el effective POM.

### Ejercicio 5
Buscá el plugin y verificá que quedó incorporado.

### Ejercicio 6
Escribí con tus palabras qué diferencia hay entre dejar un plugin implícito y declararlo explícitamente.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Dónde se declaran los plugins en Maven?
2. ¿Qué diferencia hay entre una dependencia y un plugin?
3. ¿Por qué puede servir declarar explícitamente un plugin que Maven ya usa por default?
4. ¿Qué relación tiene esto con el bloque `build`?
5. ¿Qué herramienta te ayuda a verificar la configuración efectiva del plugin?

---

## Mini desafío

Hacé una práctica completa:

1. tomá tu proyecto actual
2. agregá el `maven-compiler-plugin`
3. configurá `source` y `target`
4. corré `mvn clean compile`
5. generá el effective POM
6. buscá el plugin en el effective POM
7. escribí una nota breve explicando qué parte del build dejó de estar tan implícita gracias a esta configuración

Tu objetivo es que el bloque `build` deje de ser una zona vacía o abstracta y pase a sentirse como una parte concreta del proyecto Maven.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este vigésimo octavo tema, ya deberías poder:

- declarar un plugin en el `pom.xml`
- ubicarlo correctamente dentro del bloque `build`
- hacer una configuración simple pero real
- relacionarlo con `properties`
- y verificar su efecto en el effective POM y en el build real

---

## Resumen del tema

- Los plugins viven en `build/plugins`.
- No son dependencias del proyecto; son herramientas del build.
- Declararlos explícitamente te da más control, más claridad y más capacidad de configuración.
- El `maven-compiler-plugin` es un excelente primer caso para aprender esto.
- Effective POM y build real te ayudan a verificar lo que configuraste.
- Ya empezaste a pasar de usar plugins implícitos a gobernar conscientemente una parte del build.

---

## Próximo tema

En el próximo tema vas a aprender a declarar y configurar otro plugin muy útil, orientado a ejecutar una aplicación desde Maven, porque después de entender cómo declarar un plugin de build básico, el siguiente paso natural es ver un caso práctico todavía más visible: usar un plugin para correr tu aplicación y reforzar la diferencia entre construir y ejecutar.
