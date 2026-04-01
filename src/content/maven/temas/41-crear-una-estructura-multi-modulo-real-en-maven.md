---
title: "Crear una estructura multi-módulo real en Maven"
description: "Cuadragésimo primer tema práctico del curso de Maven: aprender a construir una estructura multi-módulo real con una raíz agregadora, varios módulos hijos y un build conjunto para entender cómo Maven coordina proyectos relacionados dentro de una misma base."
order: 41
module: "Herencia, parents y multi-módulo"
level: "intermedio"
draft: false
---

# Crear una estructura multi-módulo real en Maven

## Objetivo del tema

En este cuadragésimo primer tema vas a:

- construir una estructura multi-módulo real en Maven
- usar una raíz agregadora con `packaging pom`
- declarar módulos con `<modules>`
- entender cómo Maven construye varios proyectos juntos
- ver cómo conviven agregación y herencia en una estructura concreta
- pasar de la idea conceptual de multi-módulo a una práctica real y verificable

La idea es que no te quedes en la teoría de “podría haber varios módulos”, sino que veas una estructura concreta funcionando como conjunto.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear proyectos Maven
- leer y modificar `pom.xml`
- usar `properties`, `dependencyManagement` y `pluginManagement`
- entender qué es un parent POM
- distinguir entre parent y agregador multi-módulo
- leer el effective POM y verificar herencia
- tener una base bastante sólida del build Maven

Si hiciste los temas anteriores, ya estás listo para esta práctica.

---

## Idea central del tema

En el tema anterior viste una distinción clave:

- un parent comparte configuración
- un agregador coordina módulos

Ahora vas a bajar eso a una estructura real donde una raíz:

- lista módulos
- posiblemente también actúa como parent
- y permite construir varios proyectos juntos desde un solo punto

Entonces aparece una idea muy importante:

> una estructura multi-módulo convierte varios proyectos relacionados en un conjunto coordinado, donde Maven puede construirlos como sistema y no solo como piezas aisladas.

---

## Qué estructura vas a construir

Podés imaginar algo así:

```text
mi-sistema/
├── pom.xml
├── modulo-core/
│   ├── pom.xml
│   └── src/
├── modulo-api/
│   ├── pom.xml
│   └── src/
└── modulo-app/
    ├── pom.xml
    └── src/
```

No hace falta que los tres módulos tengan mucha lógica.
Lo importante es la estructura.

Para este tema, incluso con dos módulos ya aprendés muchísimo.
Pero tres te deja ver mejor la idea de sistema.

---

## Qué rol va a cumplir el pom raíz

El `pom.xml` de la raíz va a:

- tener `packaging` `pom`
- declarar módulos
- compartir configuración base
- actuar como punto común de construcción

O sea:
- agregador
- y, si querés, también parent

Esto es justamente el caso más típico y más útil para aprender.

---

## Primer paso: crear la raíz

El `pom.xml` de la raíz podría verse así:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.gabriel.mavencurso</groupId>
    <artifactId>mi-sistema</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <name>Mi Sistema</name>
    <description>Raíz multi-módulo de práctica</description>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <java.version>21</java.version>
        <maven.compiler.source>${java.version}</maven.compiler.source>
        <maven.compiler.target>${java.version}</maven.compiler.target>
        <maven.compiler.plugin.version>3.11.0</maven.compiler.plugin.version>
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

    <modules>
        <module>modulo-core</module>
        <module>modulo-api</module>
        <module>modulo-app</module>
    </modules>
</project>
```

## Qué tiene de importante esta raíz

- `packaging` `pom`
- properties comunes
- management compartido
- modules

Ya es una raíz muy buena para practicar una estructura real.

---

## Qué deberías notar enseguida

Este `pom.xml` raíz ya cumple dos roles:

### Como parent
Comparte configuración.

### Como agregador
Lista módulos.

Este tema justamente te deja ver eso en una estructura viva,
no solo en teoría.

---

## Segundo paso: crear un módulo hijo simple

Por ejemplo, `modulo-core/pom.xml` podría verse así:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.gabriel.mavencurso</groupId>
        <artifactId>mi-sistema</artifactId>
        <version>1.0.0-SNAPSHOT</version>
    </parent>

    <artifactId>modulo-core</artifactId>
    <packaging>jar</packaging>

    <name>Modulo Core</name>
    <description>Modulo base de lógica compartida</description>

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

No hace falta que tenga mucho más para empezar.

---

## Tercer paso: crear otro módulo hijo

Por ejemplo, `modulo-api/pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.gabriel.mavencurso</groupId>
        <artifactId>mi-sistema</artifactId>
        <version>1.0.0-SNAPSHOT</version>
    </parent>

    <artifactId>modulo-api</artifactId>
    <packaging>jar</packaging>

    <name>Modulo API</name>
    <description>Modulo de api de práctica</description>

    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

Ya con esto empezás a ver herencia de management y estructura compartida.

---

## Cuarto paso: crear un tercer módulo

Por ejemplo, `modulo-app/pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.gabriel.mavencurso</groupId>
        <artifactId>mi-sistema</artifactId>
        <version>1.0.0-SNAPSHOT</version>
    </parent>

    <artifactId>modulo-app</artifactId>
    <packaging>jar</packaging>

    <name>Modulo App</name>
    <description>Modulo de app de práctica</description>
</project>
```

No hace falta todavía que estos módulos dependan entre sí.
Eso puede venir después.
Por ahora el foco es que existan como estructura multi-módulo real.

---

## Qué aprendiste ya con solo mirar esto

Que ahora no tenés:
- un proyecto suelto
sino:
- una raíz
- varios hijos
- un build común
- una base compartida

Eso cambia muchísimo la escala mental de Maven.

---

## Cómo se construye el conjunto

Ahora ubicándote en la raíz,
corré:

```bash
mvn clean compile
```

## Qué deberías observar

Maven debería:

- leer el `pom.xml` raíz
- reconocer los módulos
- recorrerlos
- y construir el conjunto como una unidad coordinada

Eso es justamente el corazón práctico del multi-módulo.

---

## Qué tiene de poderoso esto

Muchísimo.

Porque ahora un solo comando desde la raíz puede actuar sobre un conjunto de proyectos relacionados.

Entonces aparece una idea muy importante:

> el multi-módulo convierte varios builds dispersos en un build coordinado desde una raíz común.

---

## Ejercicio 1 — sentir el cambio de escala

Quiero que hagas esto:

### Paso 1
Armá la estructura raíz + dos o tres módulos.

### Paso 2
Desde la raíz, corré:
```bash
mvn clean compile
```

### Paso 3
Observá que Maven no está trabajando ya sobre un solo `pom.xml` aislado,
sino sobre una estructura completa.

### Objetivo
Sentir el cambio de escala entre “proyecto Maven individual” y “sistema Maven multi-módulo”.

---

## Qué relación tiene esto con herencia

Muy fuerte.

Cada módulo hijo puede:

- heredar del parent raíz
- y al mismo tiempo ser agregado por la raíz en `<modules>`

Eso te muestra con total claridad cómo conviven:
- herencia
- agregación

Y ya no como teoría,
sino como práctica.

---

## Una intuición muy útil

Podés pensarlo así:

- el bloque `<parent>` conecta hacia arriba en términos de herencia
- el bloque `<modules>` conecta hacia abajo en términos de estructura agregada

Esa imagen vale muchísimo.

---

## Qué relación tiene esto con effective POM

Muy fuerte otra vez.

Ahora podés generar el effective POM de uno de los módulos hijos y ver:
- lo que heredó de la raíz
- lo que puso el módulo
- cómo quedó combinado

Esto es muy útil porque te muestra que,
aunque el build se coordine desde la raíz,
cada módulo sigue teniendo su propio modelo efectivo concreto.

---

## Ejercicio 2 — effective POM de un módulo

Quiero que te ubiques dentro de uno de los módulos hijos y corras:

```bash
mvn help:effective-pom -Doutput=effective-pom-modulo.xml
```

### Qué deberías buscar
- `java.version`
- `maven.compiler.source`
- `maven.compiler.target`
- `junit`
- `maven-compiler-plugin`

### Objetivo
Ver cómo la raíz se refleja dentro del modelo efectivo del módulo.

---

## Qué diferencia hay con tener varios proyectos sueltos

Muchísima.

Si tuvieras varios proyectos separados sin una raíz común,
tendrías más riesgo de:

- divergencia de configuración
- más repetición
- más mantenimiento manual
- menos coordinación de build

En cambio, una estructura multi-módulo bien diseñada te da:

- coherencia
- construcción conjunta
- base compartida
- y mejor escalabilidad

Entonces aparece una verdad importante:

> el multi-módulo no solo ordena carpetas; ordena la evolución técnica de un conjunto de proyectos relacionados.

---

## Error común 1 — creer que multi-módulo es solo una cuestión de carpetas

No.
La estructura física importa,
pero el corazón del asunto está en:
- `<modules>`
- herencia
- build coordinado
- política compartida

---

## Error común 2 — pensar que todos los módulos tienen que ser idénticos

No.
Comparten base,
pero cada uno puede tener su propio propósito.

---

## Error común 3 — olvidar que los módulos siguen siendo proyectos Maven reales

Cada módulo sigue teniendo:
- su `pom.xml`
- su identidad concreta
- su código
- su output

No desaparecen dentro de la raíz.
Se coordinan desde ella.

---

## Error común 4 — no probar el build desde la raíz

En un tema multi-módulo, eso sería perder una de las partes más importantes de la experiencia.

---

## Ejercicio 3 — leer la raíz como sistema

Quiero que hagas esta lectura de tu raíz:

### Como parent
- ¿qué comparte?

### Como agregador
- ¿qué módulos coordina?

### Como punto de build
- ¿qué pasa cuando corrés Maven desde ahí?

### Objetivo
Que la raíz deje de verse como “otro `pom.xml`” y pase a sentirse como centro estructural del sistema.

---

## Qué no conviene olvidar

Este tema no pretende que todavía armes dependencias complejas entre módulos ni publicaciones sofisticadas.
Eso puede venir después.

Lo que sí quiere dejarte es una práctica muy importante y muy real:

- raíz con `packaging pom`
- módulos declarados
- herencia compartida
- build conjunto desde una sola entrada

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Creá una raíz con:
- `packaging pom`
- properties comunes
- `modules`

### Ejercicio 2
Creá al menos dos módulos hijos.

### Ejercicio 3
Hacé que ambos declaren a la raíz como `parent`.

### Ejercicio 4
Desde la raíz, corré:
```bash
mvn clean compile
```

### Ejercicio 5
Generá el effective POM de uno de los módulos.

### Ejercicio 6
Escribí con tus palabras qué parte de la estructura corresponde a:
- herencia
- agregación
- build conjunto

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué agrega el bloque `<modules>` a una estructura Maven?
2. ¿Qué diferencia hay entre tener varios módulos coordinados y tener varios proyectos sueltos?
3. ¿Qué rol cumple la raíz en esta práctica?
4. ¿Qué rol cumple cada módulo hijo?
5. ¿Por qué esta estructura cambia la escala mental de Maven?

---

## Mini desafío

Hacé una práctica completa:

1. creá una raíz multi-módulo
2. agregá dos o tres módulos hijos
3. usá la raíz como parent compartido
4. definí properties comunes
5. construí todo desde la raíz
6. generá el effective POM de un módulo
7. escribí una nota breve explicando:
   - cómo conviven herencia y agregación
   - qué ventajas te dio la raíz
   - y por qué esta estructura ya se parece mucho más a un sistema real que a un proyecto aislado

Tu objetivo es que el multi-módulo deje de parecer una idea abstracta y pase a sentirse como una estructura concreta, práctica y muy poderosa de Maven.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este cuadragésimo primer tema, ya deberías poder:

- crear una estructura multi-módulo real
- usar una raíz con `packaging pom`
- declarar módulos con `<modules>`
- construir el conjunto desde la raíz
- verificar la herencia en un módulo hijo con effective POM
- y pensar Maven en escala de sistema, no solo de proyecto individual

---

## Resumen del tema

- Una raíz multi-módulo puede coordinar varios proyectos relacionados.
- Los módulos siguen siendo proyectos Maven reales, pero se construyen como conjunto.
- Herencia y agregación pueden convivir muy bien en la misma estructura.
- Construir desde la raíz cambia la escala de uso de Maven.
- Effective POM sigue siendo clave para entender la configuración real de cada módulo.
- Ya diste un paso muy importante hacia un Maven claramente más estructural y profesional.

---

## Próximo tema

En el próximo tema vas a aprender a declarar dependencias entre módulos de un mismo sistema Maven, porque después de construir varios módulos juntos, el siguiente paso natural es hacer que no solo convivan lado a lado, sino que también se usen entre sí como piezas de una misma arquitectura.
