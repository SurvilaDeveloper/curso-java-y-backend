---
title: "Usar properties en Maven: centralizar versiones y valores del pom.xml"
description: "Duodécimo tema práctico del curso de Maven: aprender a usar properties para centralizar valores del pom.xml, evitar repeticiones y dejar una configuración más clara y mantenible."
order: 12
module: "Fundamentos de Maven"
level: "intro"
draft: false
---

# Usar `properties` en Maven: centralizar versiones y valores del `pom.xml`

## Objetivo del tema

En este duodécimo tema vas a:

- entender qué es el bloque `properties` en Maven
- aprender a definir propiedades propias
- usar properties dentro del `pom.xml`
- centralizar valores repetidos como versiones o textos
- dejar tu configuración más clara y menos duplicada
- empezar a pensar el `pom.xml` con más orden y mantenibilidad

La idea es que dejes de escribir valores repetidos en distintos lugares del `pom.xml` y empieces a usar una herramienta básica, pero muy útil, para organizar mejor la configuración.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer el `pom.xml`
- modificar coordenadas básicas
- agregar dependencias
- entender scopes básicos
- ejecutar `compile`, `test`, `package`, `install` y `clean`
- interpretar la salida de Maven

Si venís siguiendo el curso, ya tenés la base perfecta para este paso.

---

## Idea central del tema

A medida que un `pom.xml` crece, pueden empezar a repetirse valores como:

- versiones de dependencias
- nombres descriptivos
- configuraciones generales
- encoding
- versión de Java
- otros parámetros del proyecto

Cuando eso pasa, empezar a centralizar valores ayuda muchísimo.

Para eso sirve el bloque:

```xml
<properties>
    ...
</properties>
```

Dicho simple:

> una property en Maven es una forma de guardar un valor con nombre para poder reutilizarlo dentro del `pom.xml`.

---

## Qué es una property

Una property es un valor nombrado.

Por ejemplo:

```xml
<properties>
    <proyecto.autor>Gabriel</proyecto.autor>
</properties>
```

Después ese valor se puede reutilizar así:

```xml
${proyecto.autor}
```

O sea:

- definís una vez
- reutilizás donde haga falta

---

## Primer ejemplo simple

Supongamos que tenés esto:

```xml
<properties>
    <mi.version>1.0.0</mi.version>
</properties>
```

Después podrías usarlo en otro lugar del `pom.xml` así:

```xml
<version>${mi.version}</version>
```

La idea ya es muy poderosa:
- no escribís el valor directamente
- escribís una referencia a la property

---

## Una intuición muy útil

Podés pensarlo así:

- escribir el valor directo = valor fijo “pegado” en un lugar
- usar property = valor centralizado y reutilizable

Esta distinción te va a servir muchísimo más adelante.

---

## Dónde va el bloque properties

Normalmente lo vas a poner dentro del `project`, en una zona parecida a esta:

```xml
<project ...>
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.gabriel.mavencurso</groupId>
    <artifactId>mi-primer-proyecto-maven</artifactId>
    <version>0.1.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>Mi primer proyecto Maven</name>
    <description>Proyecto de práctica</description>

    <properties>
        <proyecto.autor>Gabriel</proyecto.autor>
        <proyecto.entorno>practica</proyecto.entorno>
    </properties>

    <dependencies>
        ...
    </dependencies>
</project>
```

No hay que memorizar una posición “mágica”, pero sí conviene que quede en una zona clara y visible.

---

## Primer experimento práctico: crear properties tuyas

Abrí tu `pom.xml` y agregá algo como esto:

```xml
<properties>
    <proyecto.autor>Gabriel</proyecto.autor>
    <proyecto.entorno>curso</proyecto.entorno>
    <proyecto.version.base>0.1.0-SNAPSHOT</proyecto.version.base>
</properties>
```

Por ahora no importa que todavía no se usen todas.
El objetivo es empezar a trabajar con la estructura.

---

## Qué nombres conviene usar

Las properties no tienen por qué llamarse de una sola manera,
pero conviene que sean:

- claras
- consistentes
- legibles

Por ejemplo:

### Buenos ejemplos
```xml
<java.version>21</java.version>
<junit.version>4.13.2</junit.version>
<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
```

### Menos claros
```xml
<v1>21</v1>
<datax>4.13.2</datax>
```

La idea es que el `pom.xml` se lea bien.

---

## Segundo experimento: usar properties en una dependencia

Este es uno de los usos más comunes.

Supongamos que hoy tenés una dependencia así:

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.14.0</version>
</dependency>
```

Ahora agregá esta property:

```xml
<properties>
    <commons.lang3.version>3.14.0</commons.lang3.version>
</properties>
```

Y cambiá la dependencia para que quede así:

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>${commons.lang3.version}</version>
</dependency>
```

---

## Qué aprendiste con esto

Que una property puede centralizar la versión de una dependencia.

Esto te da una ventaja enorme:

> si querés cambiar la versión después, la cambiás en un solo lugar.

---

## Tercer experimento: usar properties para JUnit

Si tenés JUnit declarado así:

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.13.2</version>
    <scope>test</scope>
</dependency>
```

Podés agregar una property:

```xml
<properties>
    <junit.version>4.13.2</junit.version>
</properties>
```

Y cambiar la dependencia a:

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>${junit.version}</version>
    <scope>test</scope>
</dependency>
```

---

## Qué tiene de valioso esto

En este proyecto chico puede parecer poco.
Pero en proyectos más grandes:

- repetís versiones
- repetís configuraciones
- repetís decisiones

Y ahí las properties te ahorran bastante desorden.

Entonces aparece una verdad importante:

> las properties no son solo comodidad; ayudan a que el `pom.xml` escale mejor cuando el proyecto crece.

---

## Primer ejercicio práctico importante

Quiero que tu `pom.xml` tenga al menos estas properties:

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <commons.lang3.version>3.14.0</commons.lang3.version>
    <junit.version>4.13.2</junit.version>
    <proyecto.autor>Gabriel</proyecto.autor>
</properties>
```

Después quiero que uses:
- `commons.lang3.version`
- `junit.version`

dentro de sus dependencias reales.

---

## Qué es `project.build.sourceEncoding`

Esta es una property bastante usada en Maven:

```xml
<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
```

Sirve para declarar el encoding del proyecto.

No hace falta que hoy profundices en encoding,
pero sí conviene que empieces a verla como una property muy común y bastante estándar.

---

## Qué pasa si cambiás una property

Hacé una prueba.

Si tenés esto:

```xml
<commons.lang3.version>3.14.0</commons.lang3.version>
```

y la dependencia usa:

```xml
<version>${commons.lang3.version}</version>
```

entonces, al cambiar la property, cambia la versión usada en esa dependencia.

No hace falta que cambies a cualquier número al azar.
La idea es que entiendas la relación.

---

## Ejercicio 1 — comprobar que el pom sigue funcionando

Después de mover versiones a properties, corré:

```bash
mvn clean test
```

o también:

```bash
mvn clean package
```

## Qué deberías observar

El build debería seguir funcionando igual,
pero con un `pom.xml` más limpio.

---

## Qué relación tiene esto con la legibilidad del pom

Muy fuerte.

Compará mentalmente estos dos estilos.

### Sin properties

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.14.0</version>
</dependency>

<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.13.2</version>
    <scope>test</scope>
</dependency>
```

### Con properties

```xml
<properties>
    <commons.lang3.version>3.14.0</commons.lang3.version>
    <junit.version>4.13.2</junit.version>
</properties>

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
```

En proyectos chicos la diferencia parece menor.
En proyectos medianos o grandes, cambia muchísimo.

---

## Cuándo conviene usar properties

Suele convenir cuando:

- un valor puede repetirse
- una versión podría cambiar
- querés centralizar configuración
- querés que el `pom.xml` sea más mantenible
- querés dejar decisiones importantes más visibles

---

## Cuándo no hace falta exagerar

Tampoco conviene convertir absolutamente todo en property sin criterio.

Por ejemplo, si un valor aparece una sola vez y no agrega claridad moverlo,
quizá no hace falta.

Entonces aparece otra idea importante:

> las properties ayudan cuando simplifican y centralizan; no cuando agregan abstracción innecesaria.

---

## Error común 1 — escribir mal la referencia a la property

Una property se usa así:

```xml
${nombre.property}
```

No así:

```xml
{nombre.property}
$nombre.property
```

o inventando otra sintaxis.

---

## Error común 2 — declarar la property, pero no usarla

A veces alguien crea un bloque `properties`,
pero deja las dependencias con la versión hardcodeada.

En ese caso, la property todavía no aporta nada real.

---

## Error común 3 — usar nombres poco claros

Si el nombre no comunica bien qué guarda,
perdés parte del valor de tener properties.

---

## Error común 4 — pensar que properties son solo para dependencias

No.
También sirven para:

- encoding
- versión de Java
- configuración general
- parámetros reutilizables
- otros valores del build

Hoy empezaste por dependencias porque es el caso más fácil de sentir.

---

## Ejercicio 2 — romper y corregir una property

Hacé esta prueba:

### Paso 1
Escribí mal el nombre de una property en una dependencia.

Por ejemplo:

```xml
<version>${commons.lang.version}</version>
```

cuando en realidad la property era:

```xml
<commons.lang3.version>3.14.0</commons.lang3.version>
```

### Paso 2
Corré:

```bash
mvn test
```

o

```bash
mvn package
```

### Paso 3
Observá el error o el problema.

### Paso 4
Corregilo.

## Qué objetivo tiene esto

Perderle el miedo a los errores de referencia y entender que:
- si una property está mal escrita,
  Maven no puede resolver ese valor correctamente.

---

## Ejercicio 3 — crear properties propias no técnicas

Agregá dos properties personalizadas, por ejemplo:

```xml
<properties>
    <proyecto.autor>Gabriel</proyecto.autor>
    <proyecto.tipo>curso-practico</proyecto.tipo>
</properties>
```

Aunque hoy no las use el build directamente,
te sirven para entrenarte en la estructura y para acostumbrarte a pensar el `pom.xml` como un documento organizado.

---

## Qué relación tiene esto con proyectos más grandes

Muchísima.

En proyectos más grandes vas a ver cosas como:

- muchas versiones centralizadas
- propiedades de compilación
- encoding
- configuración de plugins
- valores heredados
- propiedades compartidas entre módulos

Por eso este tema, aunque hoy parezca simple, es muy importante como base.

---

## Una intuición muy útil

Podés pensarlo así:

> las properties convierten valores dispersos en decisiones visibles.

Esa frase vale muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Creá un bloque `properties` en tu `pom.xml`.

### Ejercicio 2
Agregá al menos:
- `project.build.sourceEncoding`
- una property para `commons-lang3`
- una property para `junit`

### Ejercicio 3
Usá esas properties en las dependencias.

### Ejercicio 4
Corré:

```bash
mvn clean test
```

### Ejercicio 5
Escribí mal una property a propósito, observá el error y corregilo.

### Ejercicio 6
Agregá dos properties tuyas no técnicas.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es una property en Maven?
2. ¿Para qué sirve el bloque `properties`?
3. ¿Qué ventaja tiene usar properties para las versiones de dependencias?
4. ¿Cómo se referencia una property dentro del `pom.xml`?
5. ¿Cuándo conviene usar properties y cuándo no hace falta exagerar?

---

## Mini desafío

Creá un proyecto nuevo, por ejemplo:

- `properties-demo-maven`

Y hacé esto:

1. agregá dos dependencias
2. centralizá sus versiones con properties
3. agregá `project.build.sourceEncoding`
4. agregá dos properties personalizadas
5. corré `mvn clean package`

Tu objetivo es que el `pom.xml` ya empiece a verse más ordenado y menos literal.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este duodécimo tema, ya deberías poder:

- entender qué es una property en Maven
- crear el bloque `properties`
- referenciar properties correctamente con `${...}`
- centralizar versiones de dependencias
- dejar un `pom.xml` más limpio y más mantenible
- y ver que Maven no solo organiza builds, sino también configuración

---

## Resumen del tema

- Las properties sirven para centralizar valores reutilizables dentro del `pom.xml`.
- Son muy útiles para versiones de dependencias, encoding y configuración general.
- Se definen una vez y se referencian con `${...}`.
- Ayudan a que el `pom.xml` sea más claro y mantenible.
- No hace falta exagerar, pero sí conviene usarlas cuando ordenan de verdad.
- Ya empezaste a tratar el `pom.xml` como un documento más serio y más organizado.

---

## Próximo tema

En el próximo tema vas a aprender a fijar mejor la versión de Java del proyecto, porque después de empezar a usar properties para ordenar el `pom.xml`, el siguiente paso natural es usar esa misma idea para centralizar y controlar con más intención una de las decisiones más importantes del build: con qué versión de Java compila tu proyecto.
