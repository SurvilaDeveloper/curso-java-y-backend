---
title: "Usar dependencyManagement para centralizar versiones en Maven"
description: "Decimoséptimo tema práctico del curso de Maven: aprender qué es dependencyManagement, para qué sirve, cómo centraliza versiones y por qué es una herramienta clave para controlar la resolución de dependencias en proyectos Maven más serios."
order: 17
module: "Resolución y control de dependencias"
level: "base"
draft: false
---

# Usar `dependencyManagement` para centralizar versiones en Maven

## Objetivo del tema

En este decimoséptimo tema vas a:

- entender qué es `dependencyManagement`
- distinguirlo claramente del bloque `dependencies`
- aprender a centralizar versiones de dependencias
- ver cómo simplifica el `pom.xml`
- empezar a controlar con más intención la resolución de versiones
- preparar una base muy importante para proyectos más grandes o multi-módulo

La idea es que pases de simplemente declarar dependencias a empezar a gobernar mejor qué versiones querés sostener en el proyecto.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- agregar dependencias
- usar `properties`
- entender scopes básicos
- leer el árbol de dependencias
- detectar dependencias directas y transitivas
- entender conflictos básicos de resolución

Si hiciste los temas anteriores, ya tenés una base muy buena para este paso.

---

## Por qué este tema importa tanto

En Maven, cuando un proyecto empieza a crecer, aparecen problemas como estos:

- varias dependencias con versiones repartidas por distintos lugares
- librerías relacionadas que querés mantener alineadas
- cambios de versión que te obligan a tocar varios bloques
- necesidad de dejar más claro qué versión querés sostener realmente

Y ahí aparece una herramienta muy importante:

```xml
<dependencyManagement>
    ...
</dependencyManagement>
```

Dicho simple:

> `dependencyManagement` sirve para declarar y centralizar versiones o definiciones de dependencias, sin que eso signifique agregarlas automáticamente al proyecto como uso real.

Esta última parte es clave.
Después la vas a ver con claridad.

---

## Idea central del tema

Hasta ahora trabajaste mucho con este bloque:

```xml
<dependencies>
    ...
</dependencies>
```

Ese bloque sirve para decir:
- “esta dependencia forma parte de mi proyecto”

Ahora aparece otro bloque distinto:

```xml
<dependencyManagement>
    ...
</dependencyManagement>
```

Ese bloque sirve más para decir:
- “cuando esta dependencia se use, quiero que su definición quede gobernada así”

Entonces aparece una idea muy importante:

> `dependencies` agrega dependencias al proyecto.
> `dependencyManagement` administra cómo deberían definirse cuando se usen.

Esa diferencia es central.

---

## Qué hace `dependencies`

Si escribís esto:

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-lang3</artifactId>
        <version>3.14.0</version>
    </dependency>
</dependencies>
```

la dependencia entra al proyecto.
Maven la usa realmente.

---

## Qué hace `dependencyManagement`

Si escribís esto:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
            <version>3.14.0</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

eso **no** mete automáticamente `commons-lang3` en el proyecto como dependencia usada.

Lo que hace es:
- dejar registrada su versión y su definición administrada

Después, si la usás en `dependencies`, podés omitir la versión y Maven la toma desde `dependencyManagement`.

---

## Una intuición muy útil

Podés pensarlo así:

- `dependencies` = “quiero esta librería en el proyecto”
- `dependencyManagement` = “si esta librería se usa, quiero gobernar así su versión o su definición”

Esta distinción te va a servir muchísimo.

---

## Primer ejemplo completo

Supongamos que tenés esto:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
            <version>3.14.0</version>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-lang3</artifactId>
    </dependency>
</dependencies>
```

## Qué pasa acá

La dependencia sí entra al proyecto porque está en `dependencies`,
pero la versión se toma desde `dependencyManagement`.

Eso ya te deja ver el poder del enfoque:

- centralizás
- evitás repetir
- dejás más controlada la resolución

---

## Qué problema resuelve esto en la práctica

Muchísimos.

### Caso 1
Querés cambiar una versión en un solo lugar.

### Caso 2
Querés que varias dependencias relacionadas queden administradas de forma coherente.

### Caso 3
Querés preparar un parent POM o una estructura más grande.

### Caso 4
Querés que la versión “oficial” de ciertas dependencias sea visible y centralizada.

Entonces aparece una verdad importante:

> `dependencyManagement` es una herramienta de gobierno y consistencia, no simplemente otra manera de escribir dependencias.

---

## Primer experimento práctico

Tomá una dependencia que ya uses, por ejemplo `commons-lang3`.

Si hoy la tenés así:

```xml
<properties>
    <commons.lang3.version>3.14.0</commons.lang3.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-lang3</artifactId>
        <version>${commons.lang3.version}</version>
    </dependency>
</dependencies>
```

Podés pasar a una forma más administrada así:

```xml
<properties>
    <commons.lang3.version>3.14.0</commons.lang3.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
            <version>${commons.lang3.version}</version>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-lang3</artifactId>
    </dependency>
</dependencies>
```

---

## Qué ganaste con este cambio

Ganaste varias cosas:

- la versión quedó más centralizada
- el bloque de uso real quedó más limpio
- el proyecto empieza a parecerse más a una estructura Maven más seria
- y preparás terreno para casos más grandes donde esto se vuelve muy valioso

---

## Ejercicio 1 — hacer el cambio real

Quiero que hagas esto en tu proyecto:

### Paso 1
Elegí una dependencia que ya uses, por ejemplo:
- `commons-lang3`
o
- `junit`

### Paso 2
Mové su versión a `dependencyManagement`.

### Paso 3
En `dependencies`, dejá la dependencia sin `<version>`.

### Paso 4
Corré:

```bash
mvn clean test
```

o:

```bash
mvn clean package
```

## Qué deberías observar

El proyecto debería seguir funcionando,
pero con una estructura más controlada.

---

## Qué relación tiene esto con properties

Muy fuerte.

Lo más sano suele ser combinar ambas cosas:

- `properties` para centralizar valores reutilizables
- `dependencyManagement` para centralizar la administración de dependencias

Por ejemplo:

```xml
<properties>
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
```

Y después usar:

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

---

## Atención con el scope

En muchos casos conviene dejar también claro el `scope` cuando haga falta.

En esta etapa inicial, una forma práctica y clara es:
- administrar versión en `dependencyManagement`
- y no perder claridad del scope en la dependencia usada o en el management si tu caso lo requiere

Lo importante del tema hoy es entender la diferencia de rol entre bloques,
no obsesionarte todavía con todas las variantes posibles.

---

## Qué pasa si una dependencia está solo en dependencyManagement

Esta es una de las preguntas más importantes del tema.

Supongamos que hacés esto:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
            <version>3.14.0</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

Y **no** la agregás en `dependencies`.

## Resultado

La librería no entra como dependencia real del proyecto.

Esto es crucial.

Entonces aparece una verdad importante:

> `dependencyManagement` administra; no activa por sí solo el uso real de la dependencia en tu proyecto actual.

---

## Una intuición muy útil

Podés pensarlo así:

> `dependencyManagement` define la política; `dependencies` define el uso real.

Esa frase vale muchísimo.

---

## Error común 1 — pensar que dependencyManagement reemplaza completamente a dependencies

No.
La dependencia usada en el proyecto sigue teniendo que aparecer en `dependencies`
si querés que realmente entre.

---

## Error común 2 — creer que dependencyManagement “agrega” librerías

No las agrega por sí mismo.
Las administra.

---

## Error común 3 — duplicar todo innecesariamente

No conviene dejar algo así sin pensar:

```xml
<dependencyManagement>
    ...
    <version>3.14.0</version>
</dependencyManagement>

<dependencies>
    ...
    <version>3.14.0</version>
</dependencies>
```

Si ya administraste la versión,
la gracia suele ser no repetirla abajo.

---

## Error común 4 — usar dependencyManagement sin entender qué mejora

Si el proyecto es muy chico, puede parecer que “complica”.
Pero este tema es importante porque te prepara para:

- proyectos medianos
- estructuras grandes
- parents
- multi-módulo
- control más serio de versiones

Aunque hoy el beneficio parezca moderado,
más adelante se vuelve muy fuerte.

---

## Ejercicio 2 — probar qué pasa si sacás la dependencia usada

Hacé esta prueba controlada.

### Paso 1
Dejá una dependencia en `dependencyManagement`.

### Paso 2
Sacala del bloque `dependencies`.

### Paso 3
Corré:

```bash
mvn clean compile
```

o:

```bash
mvn clean test
```

si esa dependencia se usa en tests.

## Qué objetivo tiene

Que veas con tus propios ojos que administrar no es lo mismo que usar.

### Importante
Después devolvé la dependencia al lugar correcto.

---

## Qué relación tiene esto con conflictos de versiones

Muchísima.

En el tema anterior empezaste a ver que:

- puede haber varias rutas
- puede haber versiones candidatas distintas
- Maven resuelve una final

Bueno:
`dependencyManagement` es una de las herramientas más importantes para empezar a decir:

- “esta es la versión que quiero sostener”

Todavía no estás resolviendo todos los casos complejos,
pero ya estás entrando a una herramienta central del control de resolución.

---

## Qué relación tiene esto con multi-módulo

Muy fuerte.

En proyectos multi-módulo o con parent POM,
`dependencyManagement` se vuelve una pieza muy habitual,
porque te permite:

- centralizar versiones
- evitar repetición entre módulos
- mantener coherencia
- y controlar mejor qué se usa en todo el conjunto

Por ahora no hace falta abrir ese frente completo,
pero sí conviene que sepas que este tema te está preparando para eso.

---

## Ejercicio 3 — dejar un pom un poco más serio

Quiero que reestructures tu `pom.xml` para que tenga una forma parecida a esta:

```xml
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
```

No hace falta que quede idéntico.
Sí hace falta que entiendas el rol de cada bloque.

---

## Qué no conviene olvidar

Este tema no dice:
- “ahora usá dependencyManagement para todo”

Lo que sí dice es algo más preciso:
- empezá a usarlo cuando tenga sentido centralizar versiones y controlar mejor la resolución

Eso ya te deja una base muy buena para Maven real.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Elegí al menos una dependencia de tu proyecto.

### Ejercicio 2
Pasá su versión a `dependencyManagement`.

### Ejercicio 3
Dejá la dependencia usada en `dependencies`, pero sin versión.

### Ejercicio 4
Corré:

```bash
mvn clean test
```

o:

```bash
mvn clean package
```

### Ejercicio 5
Probá temporalmente sacar la dependencia de `dependencies` y comprobá qué pasa.

### Ejercicio 6
Escribí con tus palabras la diferencia entre:
- `dependencies`
- `dependencyManagement`

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es `dependencyManagement`?
2. ¿En qué se diferencia de `dependencies`?
3. ¿Qué ventaja tiene centralizar versiones ahí?
4. ¿Por qué una dependencia en `dependencyManagement` no entra sola al proyecto?
5. ¿Qué relación tiene esto con controlar mejor conflictos de versiones?

---

## Mini desafío

Creá un proyecto nuevo, por ejemplo:

- `dependency-management-demo`

Y hacé esto:

1. agregá dos dependencias
2. poné sus versiones en `dependencyManagement`
3. usalas en `dependencies` sin versión
4. corré `mvn clean test`
5. comprobá que el proyecto sigue funcionando
6. escribí una nota corta explicando qué mejoró en la estructura del `pom.xml`

Tu objetivo es que `dependencyManagement` deje de ser un bloque misterioso y pase a ser una herramienta concreta de orden y control.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este decimoséptimo tema, ya deberías poder:

- entender qué es `dependencyManagement`
- distinguirlo claramente de `dependencies`
- usarlo para centralizar versiones
- combinarlo con `properties`
- evitar repetir versiones innecesariamente
- y ver una de las herramientas más importantes de control en Maven con mucha más claridad

---

## Resumen del tema

- `dependencies` agrega dependencias al proyecto.
- `dependencyManagement` administra cómo deberían definirse cuando se usen.
- Es especialmente útil para centralizar versiones.
- No activa por sí solo dependencias reales en el proyecto.
- Combinado con `properties`, da una estructura mucho más limpia y controlada.
- Ya entraste en una parte muy importante de Maven real: gobernar la resolución y no solo declararla.

---

## Próximo tema

En el próximo tema vas a aprender a usar `dependencyManagement` junto con el árbol de dependencias para ver qué versión termina ganando realmente, porque después de centralizar versiones, el siguiente paso natural es comprobar en la resolución real del proyecto si Maven está usando exactamente la versión que vos querías gobernar.
