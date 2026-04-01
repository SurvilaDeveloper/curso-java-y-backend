---
title: "Crear un parent y un hijo en Maven y verificar la herencia"
description: "Trigésimo noveno tema práctico del curso de Maven: aprender a construir un ejemplo real de parent POM e hijo, verificar qué configuración se hereda y usar el effective POM para comprobar cómo Maven combina padre e hijo en una configuración final."
order: 39
module: "Herencia, parents y multi-módulo"
level: "intermedio"
draft: false
---

# Crear un `parent` y un `hijo` en Maven y verificar la herencia

## Objetivo del tema

En este trigésimo noveno tema vas a:

- construir un ejemplo real de `parent POM` y proyecto hijo
- declarar herencia explícita entre ambos
- mover configuración común al padre
- dejar lo específico en el hijo
- usar el effective POM para comprobar la herencia real
- transformar la idea de herencia Maven en algo concreto y verificable

La idea es que dejes atrás la comprensión puramente conceptual del `parent POM` y empieces a verlo funcionar en una estructura real.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear proyectos Maven
- leer y modificar el `pom.xml`
- usar `properties`
- usar `dependencyManagement`
- usar `pluginManagement`
- entender el effective POM
- comprender qué es un `parent POM` y qué significa herencia básica

Si hiciste el tema anterior, ya estás listo para esta práctica.

---

## Idea central del tema

En el tema anterior viste que un `parent POM` sirve para compartir configuración entre proyectos relacionados.

Ahora vas a construir una práctica real muy simple:

- un proyecto padre
- un proyecto hijo
- herencia declarada
- configuración común en el padre
- configuración específica en el hijo
- verificación con effective POM

Entonces aparece una idea muy importante:

> en Maven la herencia no es una abstracción teórica; es una forma concreta de hacer que varios proyectos partan de una misma política técnica sin duplicarla.

---

## Estructura general que vas a crear

Podés imaginar algo así:

```text
curso-maven-parent/
├── pom.xml

curso-maven-app/
├── pom.xml
└── src/
```

No hace falta todavía que estén dentro de una gran estructura multi-módulo.
Podés practicar incluso con dos proyectos separados pero relacionados.

El punto importante es que uno actúe como padre y el otro como hijo.

---

## Primer paso: crear el parent

El parent puede tener un `pom.xml` como este:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.gabriel.mavencurso</groupId>
    <artifactId>curso-maven-parent</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <name>Curso Maven Parent</name>
    <description>Base compartida para proyectos hijos de práctica</description>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <java.version>21</java.version>
        <maven.compiler.source>${java.version}</maven.compiler.source>
        <maven.compiler.target>${java.version}</maven.compiler.target>
        <junit.version>4.13.2</junit.version>
        <maven.compiler.plugin.version>3.11.0</maven.compiler.plugin.version>
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
</project>
```

## Qué tiene de importante este parent

Este parent concentra:

- identidad base compartida
- `packaging` tipo `pom`
- properties comunes
- `dependencyManagement`
- `pluginManagement`

Es una base bastante limpia y muy buena para practicar.

---

## Qué deberías notar ya

Ese parent no está pensado como aplicación principal.
Está pensado como base de política técnica.

Entonces aparece otra idea importante:

> un parent bien diseñado no necesariamente “hace cosas” como app; más bien organiza y gobierna cómo deberían hacerlas sus hijos.

---

## Segundo paso: crear el hijo

Ahora creá un proyecto hijo con un `pom.xml` como este:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.gabriel.mavencurso</groupId>
        <artifactId>curso-maven-parent</artifactId>
        <version>1.0.0-SNAPSHOT</version>
    </parent>

    <artifactId>curso-maven-app</artifactId>
    <packaging>jar</packaging>

    <name>Curso Maven App</name>
    <description>Aplicación hija que hereda configuración del parent</description>

    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

## Qué es lo lindo de este hijo

El hijo:

- no redefine `groupId`
- no redefine `version`
- no redefine `java.version`
- no redefine la versión de JUnit
- no redefine la versión del compiler plugin

Y aun así debería poder beneficiarse de todo eso si la herencia quedó bien.

Eso justamente demuestra el valor de la estructura.

---

## Qué conviene entender sobre groupId y version en el hijo

En muchos casos, si el hijo no declara explícitamente `groupId` o `version`,
puede heredarlos del padre.

Eso te da un ejemplo muy claro de que el hijo no empieza siempre desde cero.
Parte de su identidad y de su política pueden venir de arriba.

---

## Una intuición muy útil

Podés pensarlo así:

- el padre pone el marco
- el hijo define qué proyecto concreto vive dentro de ese marco

Esa imagen vale muchísimo.

---

## Tercer paso: preparar el parent para que el hijo pueda resolverlo

Para que el hijo pueda heredar del padre,
el parent tiene que estar disponible para Maven.

Una forma simple de hacerlo en esta práctica es:

ubicándote en el proyecto padre y corriendo:

```bash
mvn clean install
```

## Qué significa esto

Estás instalando el parent en tu repositorio local,
para que el hijo pueda encontrarlo por sus coordenadas.

Esto conecta perfecto con lo que ya aprendiste sobre `install`.

---

## Cuarto paso: compilar el hijo

Ahora ubicándote en el proyecto hijo,
corré:

```bash
mvn clean compile
```

## Qué deberías observar

Si todo está bien:

- Maven debería encontrar el parent
- el hijo debería heredar la configuración base
- y la compilación debería funcionar usando las decisiones heredadas

Eso ya transforma la teoría en una práctica real.

---

## Qué aprendiste con esto

Que el parent no es solo “un archivo base”.
Es una pieza realmente resoluble e incorporable por Maven al construir el hijo.

Entonces aparece una verdad importante:

> la herencia en Maven no es simbólica; afecta de verdad el build del hijo cuando el parent está disponible y bien referenciado.

---

## Ejercicio 1 — comprobar qué hereda el hijo

Quiero que hagas esto:

### Paso 1
Instalá el parent:
```bash
mvn clean install
```

### Paso 2
Compilá el hijo:
```bash
mvn clean compile
```

### Paso 3
Anotá qué cosas el hijo no tuvo que volver a escribir.
Por ejemplo:
- versión de JUnit
- versión del compiler plugin
- versión Java
- encoding

### Objetivo
Ver con claridad qué duplicación desapareció gracias al parent.

---

## Qué relación tiene esto con dependencyManagement

Muy fuerte.

En el hijo dejaste:

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <scope>test</scope>
</dependency>
```

sin versión.

Eso funciona porque la versión está gobernada en el `dependencyManagement` del padre.

Entonces aparece una idea importante:

> el valor de `dependencyManagement` crece muchísimo cuando ya no se usa solo dentro de un proyecto, sino como política heredada entre proyectos.

---

## Qué relación tiene esto con pluginManagement

También muy fuerte.

En el hijo dejaste:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
</plugin>
```

sin versión.

Eso puede apoyarse en el `pluginManagement` del padre.

Entonces otra vez ves la misma lógica:

- el padre administra
- el hijo usa concretamente

Y eso vuelve la estructura mucho más potente.

---

## Una intuición muy útil

Podés pensarlo así:

> heredar un parent no es solo heredar texto; es heredar políticas vivas de dependencias, plugins y build.

Esa frase vale muchísimo.

---

## Quinto paso: verificar con effective POM del hijo

Ahora viene la parte más importante para cerrar el aprendizaje.

Ubicado en el hijo, corré:

```bash
mvn help:effective-pom -Doutput=effective-pom-hijo.xml
```

Después abrí el archivo generado.

## Qué deberías buscar

Buscá:

- `project.build.sourceEncoding`
- `java.version`
- `maven.compiler.source`
- `maven.compiler.target`
- `junit`
- `maven-compiler-plugin`

## Qué objetivo tiene

Ver en el modelo efectivo del hijo la combinación real entre:
- lo que escribió el padre
- lo que escribió el hijo

Eso te muestra la herencia funcionando de verdad.

---

## Qué aprendiste con el effective POM del hijo

Que lo heredado no queda “flotando” en el aire:
queda integrado en la configuración real del proyecto hijo.

Y esto es una de las cosas más valiosas de todo este tramo del curso.

Entonces aparece una verdad importante:

> el effective POM del hijo es una de las pruebas más claras de que la herencia Maven no es solo conceptual, sino una parte real del modelo efectivo del proyecto.

---

## Ejercicio 2 — rastrear el origen de la configuración

Quiero que, mirando el effective POM del hijo, te hagas estas preguntas:

- ¿esto vino del hijo o del padre?
- ¿esta versión está explícita en el hijo o heredada?
- ¿esta property la escribió el hijo o venía del parent?

### Objetivo
Empezar a leer el effective POM no solo como XML expandido,
sino como resultado de varias capas de configuración.

---

## Qué pasa si cambiás algo en el padre

Hacé este razonamiento práctico:

Si cambiás en el padre algo como:

```xml
<java.version>21</java.version>
```

por otro valor,
y después volvés a instalar el parent,
el hijo puede verse afectado sin cambiar su `pom.xml`.

Esto muestra algo muy importante:

> el parent no solo reduce duplicación; también centraliza control.

Y con eso viene poder,
pero también responsabilidad.

---

## Error común 1 — olvidar instalar o hacer resoluble el parent

Si Maven no puede encontrar el parent,
el hijo no va a heredar nada correctamente.

Por eso, en esta práctica, `mvn install` sobre el padre es una parte muy importante.

---

## Error común 2 — querer meter toda la identidad del hijo en el padre

No.
El hijo tiene que seguir pudiendo ser un proyecto concreto.

Conviene que conserve:
- su `artifactId`
- su naturaleza específica
- su código
- y sus decisiones particulares

---

## Error común 3 — pensar que el hijo ya no necesita declarar nada

Tampoco.
Hereda mucho,
pero sigue necesitando expresar lo suyo.

---

## Error común 4 — no usar effective POM para ver qué pasó realmente

En este tema, sería perder una de las mejores partes del aprendizaje.

---

## Qué no conviene olvidar

Este tema no pretende que todavía armes un ecosistema grande con varios hijos y un parent complejo.
Con un ejemplo padre-hijo ya se aprende muchísimo.

Lo importante es que te quede clara la lógica viva de:

- parent
- hijo
- herencia
- management heredado
- effective POM como verificación

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Creá un proyecto parent con:
- `packaging` `pom`
- properties comunes
- `dependencyManagement`
- `pluginManagement`

### Ejercicio 2
Instalá el parent con:
```bash
mvn clean install
```

### Ejercicio 3
Creá un proyecto hijo que lo declare en `<parent>`.

### Ejercicio 4
En el hijo, usá:
- una dependencia sin versión explícita
- un plugin sin versión explícita

### Ejercicio 5
Compilá el hijo con:
```bash
mvn clean compile
```

### Ejercicio 6
Generá el effective POM del hijo.

### Ejercicio 7
Buscá en ese effective POM la configuración heredada.

### Ejercicio 8
Escribí con tus palabras qué parte vino del padre y qué parte siguió siendo propia del hijo.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué rol cumple el proyecto padre en esta práctica?
2. ¿Qué rol cumple el proyecto hijo?
3. ¿Por qué conviene instalar el parent antes de compilar el hijo?
4. ¿Qué tipo de cosas heredó el hijo?
5. ¿Por qué el effective POM del hijo es tan importante para este tema?
6. ¿Qué ventaja aporta esta estructura frente a copiar y pegar configuración entre proyectos?

---

## Mini desafío

Hacé una práctica completa:

1. construí un parent mínimo y limpio
2. construí un hijo que herede de él
3. definí en el padre:
   - Java
   - encoding
   - management de una dependencia
   - management de un plugin
4. dejá al hijo usar esa base sin repetir versiones
5. instalá el parent
6. compilá el hijo
7. generá el effective POM del hijo
8. escribí una nota breve explicando cómo este tema cambió tu forma de pensar Maven: de proyecto aislado a estructura compartida

Tu objetivo es que la herencia deje de ser una idea abstracta y pase a sentirse como una herramienta real de diseño y mantenimiento entre proyectos Maven.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este trigésimo noveno tema, ya deberías poder:

- crear un parent real con `packaging pom`
- crear un hijo que herede de él
- entender cómo el hijo aprovecha `dependencyManagement` y `pluginManagement` heredados
- usar `mvn install` para volver resoluble al parent
- verificar la herencia con el effective POM del hijo
- y leer Maven como una estructura de configuración compartida, no solo como builds aislados

---

## Resumen del tema

- El parent POM puede convertirse en una base real para proyectos hijos.
- El hijo hereda política técnica sin tener que repetirla.
- `dependencyManagement` y `pluginManagement` se vuelven especialmente poderosos en esta estructura.
- Instalar el parent permite que el hijo lo resuelva localmente.
- Effective POM del hijo es la herramienta clave para verificar la herencia real.
- Ya convertiste la teoría de herencia Maven en una práctica concreta y funcional.

---

## Próximo tema

En el próximo tema vas a aprender a distinguir mejor entre parent POM y proyecto agregador multi-módulo, porque después de entender la herencia básica entre padre e hijo, el siguiente paso natural es separar con claridad la idea de compartir configuración de la idea de coordinar y construir varios módulos juntos desde una estructura común.
