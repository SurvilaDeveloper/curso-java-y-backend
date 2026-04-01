---
title: "Filtrar recursos con propiedades en Maven"
description: "Trigésimo sexto tema práctico del curso de Maven: aprender a filtrar recursos con propiedades de Maven, entender cómo se reemplazan valores durante el build y usar esta capacidad de forma controlada dentro de archivos de configuración o recursos del proyecto."
order: 36
module: "Plugins y build"
level: "base"
draft: false
---

# Filtrar recursos con propiedades en Maven

## Objetivo del tema

En este trigésimo sexto tema vas a:

- entender qué significa filtrar recursos en Maven
- usar propiedades del proyecto dentro de archivos de recursos
- ver cómo Maven reemplaza valores durante el build
- distinguir entre un recurso copiado “tal cual” y uno procesado con filtrado
- practicar una capacidad muy útil para archivos de configuración y recursos parametrizables

La idea es que des un paso más allá del simple copiado de recursos y empieces a ver que Maven también puede **procesarlos** incorporando valores del proyecto o del entorno al momento de construir.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- usar `properties`
- entender el lifecycle básico
- usar `clean`, `compile`, `test` y `package`
- manejar recursos en `src/main/resources` y `src/test/resources`
- inspeccionar `target/classes` y el `.jar` generado

Si hiciste el tema anterior, ya estás listo para este paso.

---

## Idea central del tema

En el tema anterior viste que Maven puede tomar recursos desde:

```text
src/main/resources
```

y copiarlos hacia:

```text
target/classes
```

y después al `.jar`.

Pero ese copiado puede ser de dos tipos:

### 1. Copiado directo
Maven lleva el archivo tal cual.

### 2. Copiado con filtrado
Maven reemplaza ciertos marcadores o placeholders por valores del proyecto.

Entonces aparece una idea muy importante:

> un recurso no siempre tiene que viajar intacto; Maven también puede transformarlo reemplazando propiedades durante el build.

---

## Qué significa filtrar un recurso

Significa que Maven toma un archivo de recursos,
busca expresiones especiales dentro de él
y las reemplaza por valores disponibles en el proyecto.

Por ejemplo, si en un recurso escribís algo como:

```text
Versión: ${project.version}
```

y el filtrado está activo,
Maven puede generar una salida donde esa parte quede reemplazada por la versión real del proyecto.

Dicho simple:

> filtrar un recurso es convertir un archivo con placeholders en un archivo concreto usando valores del build.

---

## Una intuición muy útil

Podés pensarlo así:

- recurso sin filtrar = archivo literal
- recurso filtrado = archivo plantilla + valores del proyecto

Esa distinción vale muchísimo.

---

## Qué tipo de cosas suele filtrar Maven

Muy comúnmente:

- `project.version`
- `project.artifactId`
- `project.groupId`
- properties propias
- valores definidos en profiles
- y otras propiedades disponibles en el modelo Maven

No hace falta que hoy explores todas.
Con unas pocas ya vas a entender perfecto el mecanismo.

---

## Primer ejemplo simple

Supongamos que tenés en tu `pom.xml` algo así:

```xml
<properties>
    <app.nombre>Mi App Maven</app.nombre>
</properties>
```

Y después creás un recurso como este:

```text
nombre=${app.nombre}
version=${project.version}
artifact=${project.artifactId}
```

Si el recurso se filtra,
el archivo copiado al output ya no debería quedar con los placeholders,
sino con valores reales.

---

## Dónde se habilita el filtrado

Dentro de la configuración de recursos en el `pom.xml`.

Por ejemplo:

```xml
<build>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>
        </resource>
    </resources>
</build>
```

## Qué significa esto

Le estás diciendo a Maven:
- tomá los recursos desde `src/main/resources`
- y no los copies simplemente tal cual
- sino aplicando filtrado

---

## Primer experimento práctico

Hacé esto paso por paso.

### Paso 1
Agregá una property al `pom.xml`, por ejemplo:

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <java.version>21</java.version>
    <app.nombre>Mi App Maven</app.nombre>
</properties>
```

### Paso 2
En `src/main/resources`, creá un archivo llamado:

```text
app.properties
```

con contenido como este:

```properties
app.name=${app.nombre}
app.version=${project.version}
app.artifact=${project.artifactId}
```

### Paso 3
En el `pom.xml`, agregá o adaptá el bloque:

```xml
<build>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>
        </resource>
    </resources>
</build>
```

### Paso 4
Corré:

```bash
mvn clean compile
```

## Qué deberías observar

Después buscá en:

```text
target/classes/app.properties
```

El archivo debería aparecer con valores concretos,
no con los placeholders originales.

---

## Qué aprendiste con esto

Que Maven no solo copia recursos:
también puede prepararlos usando información del proyecto.

Eso ya es una capacidad muy poderosa.

---

## Cómo debería verse el resultado

Si tu proyecto tuviera por ejemplo:

- `app.nombre = Mi App Maven`
- `project.version = 0.1.0-SNAPSHOT`
- `project.artifactId = mi-primer-proyecto-maven`

el archivo copiado podría quedar así:

```properties
app.name=Mi App Maven
app.version=0.1.0-SNAPSHOT
app.artifact=mi-primer-proyecto-maven
```

Eso te deja ver con total claridad el efecto del filtrado.

---

## Qué relación tiene esto con resources del tema anterior

Muy fuerte.

En el tema anterior viste:
- dónde viven
- a dónde se copian
- cómo entran al jar

Ahora agregás una capa nueva:
- algunos recursos, además, pueden procesarse antes de llegar al output

Entonces aparece una idea importante:

> el flujo de recursos en Maven no es solo transporte; también puede ser transformación.

---

## Qué relación tiene esto con properties

Total.

El filtrado se vuelve especialmente útil porque ya venís trabajando con:

- properties del proyecto
- properties de plugins
- properties de profiles
- properties del entorno

Ahora ves una aplicación muy concreta de todo eso:
usar esas propiedades dentro de archivos de recursos.

Eso conecta perfecto varias partes del roadmap.

---

## Una intuición muy útil

Podés pensarlo así:

> las properties dejan de vivir solo en el `pom.xml` y empiezan a “bajar” a archivos reales del build.

Esa frase vale muchísimo.

---

## Ejercicio 1 — verificar antes y después

Quiero que hagas esto:

### Paso 1
Creá `app.properties` con placeholders.

### Paso 2
Mirá su contenido en `src/main/resources`.

### Paso 3
Corré:

```bash
mvn clean compile
```

### Paso 4
Abrí el archivo correspondiente en:

```text
target/classes/app.properties
```

### Paso 5
Compará:
- el archivo fuente
- el archivo procesado

### Objetivo
Ver con claridad la diferencia entre plantilla y resultado filtrado.

---

## Qué tipo de archivos suelen usar esto

Muy comúnmente:

- `.properties`
- `.txt`
- algunos `.xml`
- algunos `.yml`
- archivos de configuración o metadatos del build

No conviene aplicar filtrado a cualquier cosa sin pensar,
pero para ciertos recursos de configuración es muy útil.

---

## Qué relación tiene esto con el jar final

La lógica sigue siendo:

- recurso fuente en `src/main/resources`
- recurso procesado en `target/classes`
- recurso empaquetado en el `.jar`

Entonces, si el archivo filtrado quedó bien en `target/classes`,
lo normal es que también entre ya filtrado al artefacto final.

Ese punto es muy importante:
- lo que entra al `.jar` no es el placeholder original,
- sino la versión ya procesada por el build.

---

## Ejercicio 2 — verificar el recurso filtrado dentro del jar

Después de correr:

```bash
mvn clean package
```

inspeccioná el `.jar` y verificá que `app.properties` esté presente.

Si lo extraés o lo abrís,
deberías ver la versión ya reemplazada del archivo.

### Objetivo
Confirmar que el build empaqueta el recurso ya transformado.

---

## Qué diferencia hay entre usar project.version y una property propia

Ambas pueden servir,
pero conceptualmente no son lo mismo.

### `project.version`
Es un valor estructural del proyecto Maven.

### `app.nombre`
Es una property propia que vos definiste.

Esto es muy valioso porque te muestra que el filtrado puede trabajar tanto con:
- información estructural de Maven
como con
- valores personalizados tuyos

---

## Error común 1 — creer que el filtrado se aplica automáticamente siempre

No necesariamente.
Si no lo habilitás correctamente en recursos,
el archivo puede copiarse tal cual.

---

## Error común 2 — confundir el archivo fuente con el archivo resultante

El archivo en `src/main/resources` sigue teniendo placeholders.
El reemplazo ocurre en el output del build.

Esa diferencia conviene que te quede clarísima.

---

## Error común 3 — querer filtrar todo sin criterio

No todos los recursos necesitan filtrado.
Conviene usarlo cuando realmente aporta valor,
sobre todo en archivos de configuración o metadatos.

---

## Error común 4 — olvidarte de revisar target/classes

En este tema, esa carpeta vuelve a ser uno de los mejores lugares para comprobar qué hizo Maven de verdad.

---

## Qué relación tiene esto con profiles

Muy fuerte.

Si más adelante una property cambia según un profile,
entonces el recurso filtrado también podría cambiar según el contexto del build.

No hace falta que hoy armes todo ese escenario complejo.
Pero sí conviene que veas la conexión:

- profiles cambian properties
- properties alimentan recursos filtrados
- recursos filtrados entran al build final

Eso ya te muestra un Maven bastante rico.

---

## Ejercicio 3 — usar una property propia y una del proyecto

Quiero que tu archivo `app.properties` tenga al menos:

```properties
app.name=${app.nombre}
app.version=${project.version}
```

Y que después verifiques en `target/classes` que ambas quedaron resueltas.

### Objetivo
Ver juntos:
- un valor propio
- un valor estructural del proyecto

---

## Qué no conviene olvidar

Este tema no pretende que todavía te metas en procesamiento súper avanzado de recursos,
ni en todas las variantes de delimitadores o casos edge.

Lo que sí quiere dejarte es una comprensión muy valiosa:

- Maven puede filtrar recursos
- ese filtrado usa propiedades reales del build
- y el resultado termina entrando al output y al artefacto final

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Agregá una property propia en el `pom.xml`, por ejemplo:
- `app.nombre`

### Ejercicio 2
Creá `src/main/resources/app.properties` con placeholders.

### Ejercicio 3
Configurá `build/resources` con `filtering=true`.

### Ejercicio 4
Corré:

```bash
mvn clean compile
```

### Ejercicio 5
Abrí `target/classes/app.properties`.

### Ejercicio 6
Verificá que los placeholders se hayan reemplazado.

### Ejercicio 7
Corré:

```bash
mvn clean package
```

### Ejercicio 8
Inspeccioná el `.jar` y verificá que el recurso filtrado entró al artefacto.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué significa filtrar un recurso en Maven?
2. ¿Qué diferencia hay entre el archivo en `src/main/resources` y el que termina en `target/classes`?
3. ¿Dónde se habilita el filtrado?
4. ¿Qué tipo de valores puede usar el filtrado?
5. ¿Por qué esto vuelve al build más poderoso que un simple copiado de archivos?

---

## Mini desafío

Hacé una práctica completa:

1. agregá una property propia en el proyecto
2. creá un recurso con placeholders
3. habilitá filtrado
4. corré `mvn clean compile`
5. compará el archivo fuente con el archivo de `target/classes`
6. corré `mvn clean package`
7. verificá el recurso dentro del `.jar`
8. escribí una nota breve explicando cómo este tema une:
   - properties
   - resources
   - build
   - artefacto final

Tu objetivo es que los recursos dejen de parecer archivos estáticos y empiecen a sentirse como parte viva y parametrizable del proceso de construcción.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este trigésimo sexto tema, ya deberías poder:

- entender qué es el filtrado de recursos
- habilitarlo en `build/resources`
- usar properties del proyecto dentro de recursos
- verificar el resultado en `target/classes`
- comprobar que el recurso filtrado entra al `.jar`
- y ver otra capa más de cómo Maven transforma el proyecto durante el build

---

## Resumen del tema

- Maven puede filtrar recursos usando propiedades del proyecto.
- El archivo fuente puede tener placeholders, mientras que el output del build tiene valores concretos.
- El filtrado se configura en `build/resources`.
- Los recursos filtrados pasan por `target/classes` y pueden entrar al `.jar`.
- Esto conecta properties, recursos y empaquetado en un flujo muy potente.
- Ya diste otro paso muy importante hacia un build más expresivo y más consciente.

---

## Próximo tema

En el próximo tema vas a aprender a usar perfiles junto con recursos filtrados para generar variantes del build según contexto, porque después de entender el filtrado básico, el siguiente paso natural es combinarlo con profiles y ver cómo un mismo proyecto puede producir recursos distintos según el entorno de construcción.
