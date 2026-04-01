---
title: "Usar dependencyManagement en la raíz de un sistema multi-módulo Maven"
description: "Cuadragésimo quinto tema práctico del curso de Maven: aprender a usar dependencyManagement desde la raíz de un sistema multi-módulo para centralizar versiones, reducir duplicación y gobernar de forma más consistente las dependencias de varios módulos relacionados."
order: 45
module: "Herencia, parents y multi-módulo"
level: "intermedio"
draft: false
---

# Usar `dependencyManagement` en la raíz de un sistema multi-módulo Maven

## Objetivo del tema

En este cuadragésimo quinto tema vas a:

- usar `dependencyManagement` en la raíz de un sistema multi-módulo
- centralizar versiones de dependencias compartidas entre módulos
- reducir duplicación entre hijos
- entender mejor cómo la raíz gobierna la política técnica del sistema
- reforzar la diferencia entre administrar dependencias y usarlas realmente

La idea es que lleves una herramienta que ya conocías en proyectos individuales a una escala más realista: una raíz compartida gobernando un sistema de varios módulos.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear una raíz multi-módulo con `packaging pom`
- distinguir entre parent y agregador
- declarar módulos hijos
- declarar dependencias entre módulos
- usar un módulo como librería interna reusable
- entender `dependencyManagement` en un proyecto individual
- leer effective POM y `dependency:tree`

Si hiciste los temas anteriores, ya tenés una base muy buena para este paso.

---

## Idea central del tema

Ya viste que una raíz multi-módulo puede:

- actuar como parent
- compartir properties
- compartir `pluginManagement`
- coordinar el build conjunto

Ahora vas a reforzar otra pieza central de esa raíz:

```xml
<dependencyManagement>
    ...
</dependencyManagement>
```

La idea importante es esta:

> en un sistema multi-módulo, `dependencyManagement` de la raíz puede transformarse en la política central que alinea versiones entre varios módulos hijos.

Eso es extremadamente valioso cuando el sistema crece.

---

## Por qué este tema importa tanto

Porque cuando tenés varios módulos hijos,
puede empezar a pasar algo así:

- `modulo-api` usa JUnit
- `modulo-app` usa JUnit
- `modulo-core` quizá usa otra librería común
- varios módulos empiezan a repetir versiones
- la raíz pierde capacidad de gobernar si cada hijo decide todo solo

Entonces aparece una necesidad muy real:

- centralizar
- alinear
- evitar divergencia
- bajar repetición

Y ahí `dependencyManagement` en la raíz se vuelve clave.

---

## Una intuición muy útil

Podés pensarlo así:

- módulo hijo = uso concreto
- raíz = política compartida de versiones

Esa frase vale muchísimo.

---

## Recordatorio: qué hace dependencyManagement

Ya lo viste antes, pero ahora en escala de sistema.

`dependencyManagement`:

- administra versiones y definiciones
- no significa automáticamente “uso real” por sí solo
- permite que los hijos usen dependencias sin repetir la versión

Entonces aparece otra idea importante:

> la raíz puede decidir con qué versión “debería” usarse una dependencia, y los hijos pueden consumir esa decisión sin repetirla.

---

## Primer ejemplo conceptual

Supongamos que querés que todos los módulos del sistema usen la misma versión de JUnit.

En la raíz podrías poner algo como:

```xml
<properties>
    <junit.version>4.13.2</junit.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

Después, en un módulo hijo, podés escribir:

```xml
<dependencies>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

sin repetir la versión.

Eso ya muestra clarísimo el valor de la raíz.

---

## Qué gana el sistema con esto

Varias cosas:

- una sola fuente de verdad para la versión
- menos repetición
- menos riesgo de desalineación entre módulos
- upgrades más simples
- lectura más clara de la política del sistema

Entonces aparece una verdad importante:

> cuanto más módulos tenés, más valioso se vuelve que las versiones vivan arriba y el uso concreto viva abajo.

---

## Qué tipo de dependencias conviene gobernar desde la raíz

En esta etapa, pensá sobre todo en:

- librerías que varios módulos van a usar
- librerías de test comunes
- librerías de infraestructura compartida
- piezas que querés mantener alineadas en todo el sistema

No hace falta llenar la raíz de todo sin criterio.
Lo importante es entender el patrón.

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
        <junit.version>4.13.2</junit.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>junit</groupId>
                <artifactId>junit</artifactId>
                <version>${junit.version}</version>
                <scope>test</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <modules>
        <module>modulo-core</module>
        <module>modulo-api</module>
        <module>modulo-app</module>
    </modules>
</project>
```

Esto ya te deja una raíz que gobierna una dependencia compartida.

---

## Segundo paso: usar la dependencia desde varios módulos

Ahora en `modulo-api/pom.xml` podrías tener:

```xml
<dependencies>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

y en `modulo-app/pom.xml` exactamente lo mismo.

## Qué tiene de lindo esto

Los hijos expresan:
- “la necesito”

Pero la raíz sigue expresando:
- “quiero esta versión para todo el sistema”

Esa separación de roles es hermosísima en Maven.

---

## Qué aprendiste ya

Que `dependencyManagement` de la raíz no es una curiosidad.
Es una de las herramientas más importantes para gobernar un sistema multi-módulo.

Eso ya es claramente intermedio y claramente real.

---

## Ejercicio 1 — mover versiones repetidas a la raíz

Quiero que hagas esto:

### Paso 1
Revisá tus módulos hijos.

### Paso 2
Identificá si hay una dependencia repetida en más de un módulo.

### Paso 3
Mové la versión a `dependencyManagement` de la raíz.

### Paso 4
En los hijos, dejá la dependencia sin versión explícita.

### Paso 5
Desde la raíz, corré:

```bash
mvn clean test
```

o:

```bash
mvn clean compile
```

según corresponda.

### Objetivo
Ver en la práctica cómo la raíz reduce duplicación sin quitar claridad en los hijos.

---

## Qué relación tiene esto con la idea de parent

Muy fuerte.

Este tema refuerza clarísimo por qué la raíz no es solo “la carpeta de arriba”:

- como agregador coordina módulos
- como parent comparte política
- como raíz de `dependencyManagement` alinea versiones del sistema

Entonces aparece una idea importante:

> una raíz multi-módulo madura no solo reúne proyectos; también los gobierna técnicamente.

---

## Qué relación tiene esto con effective POM de un hijo

Muy fuerte otra vez.

Si generás el effective POM de `modulo-app`,
deberías poder ver que la configuración heredada incluye la política de dependencias del padre.

Eso ayuda muchísimo a verificar que lo que moviste a la raíz sigue vivo realmente en el sistema.

Podés probar algo como:

```bash
mvn help:effective-pom -Doutput=effective-pom-modulo-app.xml
```

desde el hijo o usando el contexto adecuado.

### Qué deberías buscar
- `junit`
- la versión heredada
- el `scope`
- la forma en que quedó integrada la política del sistema

---

## Ejercicio 2 — verificar la versión heredada en el effective POM

Quiero que hagas esto:

### Paso 1
Mové la versión de una dependencia común a la raíz.

### Paso 2
Quitá la versión en el hijo.

### Paso 3
Generá el effective POM del hijo.

### Paso 4
Buscá la dependencia y verificá que la versión sigue apareciendo correctamente.

### Objetivo
Confirmar que la raíz no solo “declara algo lindo”, sino que gobierna de verdad el modelo efectivo del módulo.

---

## Qué relación tiene esto con dependency:tree

También sigue siendo muy útil.

Porque una vez que un módulo consume una dependencia gobernada por la raíz,
`dependency:tree` te ayuda a ver la dependencia resuelta en el contexto real del módulo.

Eso te da otra verificación complementaria:

- effective POM = cómo quedó configurado el módulo
- dependency:tree = cómo quedó resuelta la dependencia en ese módulo

Esa dupla es muy fuerte.

---

## Una intuición muy útil

Podés pensarlo así:

> la raíz decide la versión; el módulo expresa la necesidad; Maven combina ambas cosas.

Esa frase vale muchísimo.

---

## Qué pasa si varios módulos usan la misma librería pero con versiones distintas

Ahí justamente empieza el dolor que este tema viene a evitar.

Si cada módulo escribe lo suyo por separado,
podés terminar con:

- desalineación
- mantenimiento más difícil
- cambios más costosos
- confusión sobre qué política manda

Entonces aparece otra verdad importante:

> `dependencyManagement` de la raíz no solo ordena el presente; también previene deriva futura entre módulos.

---

## Error común 1 — meter en la raíz dependencias que en realidad ningún módulo usa

No hace falta.
La raíz debería gobernar con criterio,
no convertirse en una lista caótica.

---

## Error común 2 — dejar las versiones repetidas en los hijos aunque ya las centralizaste arriba

Eso le quita valor a la política compartida
y reintroduce duplicación.

---

## Error común 3 — creer que dependencyManagement vuelve innecesario declarar la dependencia en el hijo

No.
Otra vez:
- la raíz administra
- el hijo usa

Esta diferencia nunca conviene perderla.

---

## Error común 4 — no revisar el effective POM o dependency:tree después de reorganizar

En temas de herencia y multi-módulo,
esas verificaciones valen oro.

---

## Ejercicio 3 — comparar antes y después

Quiero que hagas esta comparación.

### Antes
Cada módulo con su propia versión repetida.

### Después
Versión centralizada en la raíz y uso sin versión explícita en los hijos.

### Preguntas
- ¿qué cambió en claridad?
- ¿qué cambió en mantenimiento?
- ¿qué cambió en capacidad de gobernar el sistema?

### Objetivo
Que sientas el beneficio más allá de la sintaxis.

---

## Qué no conviene olvidar

Este tema no pretende que ya armes una raíz gigantesca con management de veinte librerías.

Lo que sí quiere dejarte es una práctica muy importante y muy profesional:

- detectar lo compartido
- llevar la política de versión arriba
- dejar el uso real abajo
- y gobernar el sistema como sistema

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Tomá tu raíz multi-módulo.

### Ejercicio 2
Agregá `dependencyManagement` si todavía no lo tenés.

### Ejercicio 3
Centralizá la versión de al menos una dependencia compartida.

### Ejercicio 4
Usá esa dependencia desde dos módulos hijos sin repetir la versión.

### Ejercicio 5
Desde la raíz, corré:

```bash
mvn clean test
```

o:

```bash
mvn clean compile
```

### Ejercicio 6
Generá el effective POM de uno de los módulos.

### Ejercicio 7
Mirá también `dependency:tree` de ese módulo.

### Ejercicio 8
Escribí con tus palabras cómo la raíz se volvió una política viva del sistema.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué aporta `dependencyManagement` cuando lo usás en la raíz de un sistema multi-módulo?
2. ¿Qué diferencia hay entre que la raíz administre una dependencia y que un hijo la use?
3. ¿Por qué esto reduce duplicación?
4. ¿Por qué esto mejora la coherencia del sistema?
5. ¿Qué herramientas te ayudan a verificar que la política de la raíz está funcionando en los hijos?

---

## Mini desafío

Hacé una práctica completa:

1. tomá tu sistema multi-módulo
2. elegí una dependencia compartida
3. mové su versión a `dependencyManagement` de la raíz
4. usala desde dos módulos hijos sin repetir la versión
5. construí desde la raíz
6. generá el effective POM de uno de los hijos
7. revisá su `dependency:tree`
8. escribí una nota breve explicando por qué este tema te muestra una raíz más madura: ya no solo coordina módulos, también gobierna política de dependencias del sistema

Tu objetivo es que la raíz deje de parecer solo un organizador de módulos y pase a sentirse como el centro real de alineación técnica del sistema.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este cuadragésimo quinto tema, ya deberías poder:

- usar `dependencyManagement` en la raíz multi-módulo
- centralizar versiones compartidas entre módulos
- distinguir política de uso real
- verificar la herencia efectiva en los hijos
- y gobernar dependencias del sistema con una lógica bastante más madura

---

## Resumen del tema

- `dependencyManagement` en la raíz permite alinear versiones entre varios módulos.
- Los hijos siguen declarando uso real, pero sin repetir la versión.
- Esto reduce duplicación y mejora coherencia a escala de sistema.
- Effective POM y `dependency:tree` ayudan a verificar el resultado.
- La raíz se vuelve una política técnica viva del sistema, no solo un archivo organizador.
- Ya diste otro paso importante hacia un Maven multi-módulo mucho más serio y sostenible.

---

## Próximo tema

En el próximo tema vas a aprender a aplicar la misma lógica a plugins usando `pluginManagement` desde la raíz multi-módulo, porque después de alinear dependencias compartidas a escala de sistema, el siguiente paso natural es alinear también las herramientas del build que usan todos los módulos.
