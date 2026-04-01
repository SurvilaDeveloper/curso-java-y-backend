---
title: "Usar pluginManagement en la raíz de un sistema multi-módulo Maven"
description: "Cuadragésimo sexto tema práctico del curso de Maven: aprender a usar pluginManagement en la raíz de un sistema multi-módulo para alinear versiones de plugins, reducir duplicación y gobernar de forma consistente las herramientas del build de varios módulos relacionados."
order: 46
module: "Herencia, parents y multi-módulo"
level: "intermedio"
draft: false
---

# Usar `pluginManagement` en la raíz de un sistema multi-módulo Maven

## Objetivo del tema

En este cuadragésimo sexto tema vas a:

- usar `pluginManagement` en la raíz de un sistema multi-módulo
- centralizar versiones de plugins compartidos entre módulos
- reducir repetición en los `pom.xml` hijos
- alinear la política del build a escala de sistema
- reforzar la diferencia entre administrar plugins y usarlos realmente

La idea es que lleves al build multi-módulo la misma madurez que ya venís construyendo con dependencias: una raíz que no solo coordina módulos, sino que también gobierna de forma central las herramientas de construcción del sistema.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear una raíz multi-módulo con `packaging pom`
- distinguir entre parent y agregador
- declarar módulos hijos
- usar `dependencyManagement` en la raíz
- declarar plugins en un proyecto individual
- usar `pluginManagement` en un proyecto individual
- entender effective POM y `dependency:tree`

Si hiciste los temas anteriores, ya estás listo para este paso.

---

## Idea central del tema

En el tema anterior viste que la raíz puede usar:

```xml
<dependencyManagement>
    ...
</dependencyManagement>
```

para alinear versiones de dependencias en todos los módulos del sistema.

Ahora vas a aplicar la misma lógica,
pero a otra capa muy importante:

- las herramientas del build

Ahí aparece:

```xml
<pluginManagement>
    ...
</pluginManagement>
```

Entonces aparece una idea muy importante:

> en un sistema multi-módulo, `pluginManagement` de la raíz permite alinear versiones y política de plugins entre varios módulos hijos, igual que `dependencyManagement` alinea dependencias.

Esa simetría es muy potente.

---

## Por qué este tema importa tanto

Porque cuando tenés varios módulos hijos,
puede empezar a pasar algo como esto:

- todos compilan con `maven-compiler-plugin`
- uno usa cierta versión
- otro repite otra
- otro lo deja demasiado implícito
- el build del sistema pierde coherencia

Y eso no conviene.

Si ya te importó alinear dependencias,
también debería importarte alinear herramientas del build.

Entonces aparece una verdad importante:

> en sistemas multi-módulo maduros, la raíz no solo gobierna qué librerías se usan; también gobierna con qué herramientas del build se trabaja.

---

## Una intuición muy útil

Podés pensarlo así:

- `dependencyManagement` = política de librerías
- `pluginManagement` = política de herramientas del build

Esa frase vale muchísimo.

---

## Recordatorio: qué hace pluginManagement

Ya lo viste en proyectos individuales, pero ahora en escala de sistema.

`pluginManagement`:

- centraliza versiones y definiciones de plugins
- no significa automáticamente “uso real” por sí solo
- permite que los hijos usen plugins sin repetir la versión explícita

Entonces aparece otra idea importante:

> la raíz puede decidir con qué versión deberían usarse los plugins del sistema, y los hijos pueden apoyarse en esa decisión sin repetirla.

---

## Primer ejemplo conceptual

Supongamos que querés que todos los módulos del sistema usen el mismo `maven-compiler-plugin`.

En la raíz podrías tener algo así:

```xml
<properties>
    <maven.compiler.plugin.version>3.11.0</maven.compiler.plugin.version>
</properties>

<build>
    <pluginManagement>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>${maven.compiler.plugin.version}</version>
            </plugin>
        </plugins>
    </pluginManagement>
</build>
```

Después, en un hijo:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

sin repetir la versión.

Eso ya muestra clarísimo el valor de la raíz.

---

## Qué gana el sistema con esto

Varias cosas:

- una sola fuente de verdad para la versión del plugin
- menos repetición
- menos divergencia entre módulos
- upgrades más simples
- build más consistente
- raíz más expresiva como política técnica

Entonces aparece una idea importante:

> cuanto más módulos y más plugins compartidos tenés, más valioso se vuelve que las versiones vivan arriba y el uso concreto viva abajo.

---

## Qué plugins conviene gobernar desde la raíz

En esta etapa, pensá sobre todo en plugins como:

- `maven-compiler-plugin`
- `maven-surefire-plugin`
- `maven-jar-plugin`
- otros plugins que varios módulos vayan a usar

No hace falta llenar la raíz de veinte plugins si todavía no los necesitás.
Lo importante es aprender el patrón.

---

## Primer ejemplo práctico en una raíz multi-módulo

Supongamos que tu raíz `mi-sistema/pom.xml` tiene algo así:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.gabriel.mavencurso</groupId>
    <artifactId>mi-sistema</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <java.version>21</java.version>
        <maven.compiler.source>${java.version}</maven.compiler.source>
        <maven.compiler.target>${java.version}</maven.compiler.target>
        <maven.compiler.plugin.version>3.11.0</maven.compiler.plugin.version>
        <maven.surefire.plugin.version>3.2.5</maven.surefire.plugin.version>
    </properties>

    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>${maven.compiler.plugin.version}</version>
                </plugin>

                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-surefire-plugin</artifactId>
                    <version>${maven.surefire.plugin.version}</version>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>

    <modules>
        <module>modulo-core</module>
        <module>modulo-api</module>
        <module>modulo-app</module>
    </modules>
</project>
```

Esto ya te deja una raíz que gobierna herramientas compartidas del build.

---

## Segundo paso: usar los plugins desde los módulos hijos

Ahora en un hijo, por ejemplo `modulo-core/pom.xml`, podrías tener:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

Y en otro hijo, por ejemplo `modulo-app/pom.xml`, quizá:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
        </plugin>

        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```

## Qué tiene de lindo esto

Los hijos expresan:
- “uso este plugin”

Pero la raíz expresa:
- “esta es la versión del plugin que quiero para el sistema”

Esa separación de roles es muy sana.

---

## Qué aprendiste ya

Que `pluginManagement` de la raíz es una de las herramientas más fuertes para alinear el build del sistema multi-módulo.

Y eso ya es claramente una habilidad de Maven bastante seria.

---

## Ejercicio 1 — mover versiones repetidas de plugins a la raíz

Quiero que hagas esto:

### Paso 1
Revisá dos o más módulos hijos.

### Paso 2
Identificá si hay plugins repetidos en varios módulos, especialmente:
- `maven-compiler-plugin`
- otros plugins que ya estés usando

### Paso 3
Mové sus versiones a `pluginManagement` de la raíz.

### Paso 4
En los hijos, dejá solo el uso real del plugin, sin versión.

### Paso 5
Desde la raíz, corré:

```bash
mvn clean compile
```

o, si tenés tests:

```bash
mvn clean test
```

### Objetivo
Ver en la práctica cómo la raíz reduce duplicación también en la capa de build.

---

## Qué relación tiene esto con el parent compartido

Muy fuerte.

Esto vuelve a mostrar que la raíz,
cuando también actúa como parent,
puede centralizar:

- properties
- `dependencyManagement`
- `pluginManagement`

y entonces convertirse en un verdadero centro de política técnica del sistema.

Entonces aparece una verdad importante:

> una raíz multi-módulo madura no solo organiza qué módulos existen; también organiza cómo deberían construirse.

---

## Qué relación tiene esto con effective POM de un hijo

Muy fuerte otra vez.

Si generás el effective POM de `modulo-app`,
podés verificar que la versión del plugin aparece correctamente aunque el hijo no la haya escrito explícitamente.

Por ejemplo:

```bash
mvn help:effective-pom -Doutput=effective-pom-modulo-app.xml
```

### Qué deberías buscar
- `maven-compiler-plugin`
- `maven-surefire-plugin`
- la versión heredada desde la raíz
- el bloque final de `build`

Esto te ayuda a confirmar que la política de la raíz está viva de verdad en el hijo.

---

## Ejercicio 2 — verificar la versión del plugin en el effective POM

Quiero que hagas esto:

### Paso 1
Mové la versión de un plugin a la raíz.

### Paso 2
Quitá la versión en el hijo.

### Paso 3
Generá el effective POM del hijo.

### Paso 4
Buscá el plugin y verificá que la versión sigue apareciendo correctamente.

### Objetivo
Confirmar que la raíz gobierna también la capa del build y no solo las dependencias.

---

## Qué relación tiene esto con el build real del sistema

Total.

Cuando la raíz alinea plugins,
el sistema gana en consistencia.

Por ejemplo:
- todos compilan con la misma versión del compilador Maven
- varios módulos testean con la misma versión de Surefire
- y el build conjunto se vuelve mucho más predecible

Entonces aparece otra idea importante:

> alinear plugins a escala de sistema es una forma de volver más uniforme y más confiable la experiencia de build de todos los módulos.

---

## Una intuición muy útil

Podés pensarlo así:

> la raíz decide con qué herramientas del build querés trabajar; los hijos dicen cuáles de esas herramientas necesitan usar realmente.

Esa frase vale muchísimo.

---

## Qué pasa si cada hijo maneja plugins por su cuenta

Podés terminar con:

- versiones distintas
- comportamiento menos predecible
- más repetición
- upgrades más costosos
- más dificultad para mantener coherencia

Y todo eso justamente es lo que este tema viene a corregir.

---

## Error común 1 — meter en la raíz plugins que ningún módulo usa

No hace falta.
Conviene centralizar con criterio.

---

## Error común 2 — dejar versiones repetidas en los hijos aunque ya las centralizaste

Eso le quita mucho valor al enfoque.

---

## Error común 3 — creer que pluginManagement vuelve innecesario declarar el plugin en el hijo cuando realmente se usa explícitamente

No.
Otra vez:
- la raíz administra
- el hijo usa

Esta diferencia no conviene perderla nunca.

---

## Error común 4 — no revisar el effective POM después de reorganizar el build

En temas de herencia multi-módulo, esa verificación es especialmente valiosa.

---

## Ejercicio 3 — comparar antes y después

Quiero que hagas esta comparación.

### Antes
Cada módulo con versiones de plugins repetidas.

### Después
Versiones alineadas en `pluginManagement` de la raíz y uso real en los hijos sin repetir versión.

### Preguntas
- ¿qué cambió en claridad?
- ¿qué cambió en mantenimiento?
- ¿qué cambió en capacidad de gobernar el build del sistema?

### Objetivo
Que no lo veas solo como cambio de sintaxis, sino como mejora estructural real.

---

## Qué no conviene olvidar

Este tema no pretende que conviertas la raíz en un catálogo infinito de plugins.

Lo que sí quiere dejarte es una práctica muy profesional:

- detectar herramientas del build compartidas
- llevar la política de versión arriba
- dejar el uso real abajo
- y gobernar el sistema también en su capa de construcción

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Tomá tu raíz multi-módulo.

### Ejercicio 2
Agregá `pluginManagement` si todavía no lo tenés.

### Ejercicio 3
Centralizá la versión de al menos un plugin compartido.

### Ejercicio 4
Usá ese plugin desde dos módulos hijos sin repetir la versión.

### Ejercicio 5
Desde la raíz, corré:

```bash
mvn clean compile
```

o:

```bash
mvn clean test
```

### Ejercicio 6
Generá el effective POM de uno de los módulos.

### Ejercicio 7
Buscá el plugin y verificá la versión heredada.

### Ejercicio 8
Escribí con tus palabras cómo la raíz se volvió una política viva del build del sistema.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué aporta `pluginManagement` cuando lo usás en la raíz de un sistema multi-módulo?
2. ¿Qué diferencia hay entre que la raíz administre un plugin y que un hijo lo use?
3. ¿Por qué esto reduce duplicación?
4. ¿Por qué esto mejora la coherencia del build?
5. ¿Qué herramienta te ayuda a verificar que la política de la raíz está funcionando en los hijos?

---

## Mini desafío

Hacé una práctica completa:

1. tomá tu sistema multi-módulo
2. elegí un plugin compartido entre varios módulos
3. mové su versión a `pluginManagement` de la raíz
4. usalo desde dos módulos hijos sin repetir la versión
5. construí desde la raíz
6. generá el effective POM de uno de los hijos
7. verificá la versión del plugin
8. escribí una nota breve explicando por qué este tema te muestra una raíz todavía más madura: ya no solo alinea dependencias, también alinea herramientas del build del sistema

Tu objetivo es que la raíz deje de parecer solo un organizador de módulos y pase a sentirse como el centro real de gobernanza técnica de todo el sistema Maven.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este cuadragésimo sexto tema, ya deberías poder:

- usar `pluginManagement` en la raíz multi-módulo
- centralizar versiones de plugins compartidos entre módulos
- distinguir política de uso real en la capa del build
- verificar la herencia efectiva en los hijos
- y gobernar herramientas del build del sistema con una lógica bastante más madura

---

## Resumen del tema

- `pluginManagement` en la raíz permite alinear herramientas del build entre varios módulos.
- Los hijos siguen declarando uso real, pero sin repetir la versión.
- Esto reduce duplicación y mejora coherencia a escala de sistema.
- Effective POM ayuda a verificar que la política de la raíz está funcionando en los módulos hijos.
- La raíz se vuelve una política técnica viva del build del sistema, no solo de sus dependencias.
- Ya diste otro paso importante hacia un Maven multi-módulo mucho más serio y sostenible.

---

## Próximo tema

En el próximo tema vas a aprender a empezar a usar un BOM en un nivel inicial y a entender su relación con `dependencyManagement`, porque después de alinear dependencias y plugins en una raíz multi-módulo, el siguiente paso natural es ver otra herramienta muy importante de gobierno de versiones que aparece muchísimo en ecosistemas Maven reales.
