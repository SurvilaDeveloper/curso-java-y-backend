---
title: "Combinar profiles y recursos filtrados en Maven"
description: "Trigésimo séptimo tema práctico del curso de Maven: aprender a combinar profiles con recursos filtrados para generar variantes del build según el contexto, usando propiedades distintas para producir archivos de configuración diferentes sin duplicar el proyecto."
order: 37
module: "Plugins y build"
level: "base"
draft: false
---

# Combinar `profiles` y recursos filtrados en Maven

## Objetivo del tema

En este trigésimo séptimo tema vas a:

- combinar `profiles` con filtrado de recursos
- generar recursos distintos según el contexto del build
- entender cómo una misma plantilla puede producir salidas diferentes
- reforzar la relación entre `properties`, `profiles`, `resources` y artefacto final
- practicar una de las combinaciones más útiles y reales dentro de Maven

La idea es que des un paso muy importante:
usar la flexibilidad de los profiles para cambiar valores que después Maven inyecta en archivos de recursos durante el build.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- usar `properties`
- usar `profiles`
- manejar recursos en `src/main/resources`
- habilitar filtrado de recursos
- entender cómo los recursos filtrados llegan a `target/classes` y al `.jar`

Si hiciste los temas anteriores, ya tenés una base excelente para este paso.

---

## Idea central del tema

En el tema anterior viste que un recurso puede contener placeholders como:

```properties
app.name=${app.nombre}
app.version=${project.version}
```

y que Maven puede reemplazarlos usando propiedades del proyecto.

También viste antes que los `profiles` pueden cambiar propiedades según el contexto.

Ahora vas a unir ambas ideas.

Entonces aparece una idea muy importante:

> si un profile cambia una property, y un recurso usa esa property, entonces el recurso filtrado puede variar según el profile activo.

Esa combinación es muy poderosa.

---

## Qué problema resuelve esto

Muchísimas veces una app necesita archivos de configuración distintos según el entorno.

Por ejemplo:

- desarrollo
- testing
- producción
- QA
- local

Pero no querés duplicar el proyecto entero,
ni necesariamente mantener archivos totalmente distintos para todo si solo cambian algunos valores.

Entonces aparece una solución elegante:

- un recurso plantilla
- properties variables
- profiles que cambian esas properties
- build que genera la versión adecuada

Dicho simple:

> profiles + recursos filtrados te permiten producir configuraciones distintas sin duplicar el proyecto.

---

## Una intuición muy útil

Podés pensarlo así:

- el recurso es la plantilla
- las properties son los valores
- el profile decide qué valores usar
- el build genera el archivo final

Esa cadena vale muchísimo.

---

## Primer ejemplo conceptual

Supongamos que querés que un archivo de configuración tenga algo así:

```properties
app.name=${app.nombre}
app.entorno=${app.entorno}
app.url=${app.url}
```

Y en tu `pom.xml` definís una base:

```xml
<properties>
    <app.nombre>Mi App Maven</app.nombre>
    <app.entorno>base</app.entorno>
    <app.url>http://localhost</app.url>
</properties>
```

Después agregás profiles:

```xml
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <app.entorno>desarrollo</app.entorno>
            <app.url>http://localhost:8080</app.url>
        </properties>
    </profile>

    <profile>
        <id>prod</id>
        <properties>
            <app.entorno>produccion</app.entorno>
            <app.url>https://api.miapp.com</app.url>
        </properties>
    </profile>
</profiles>
```

Y filtrás `src/main/resources/app.properties`.

## Qué significa esto

El mismo archivo fuente puede producir resultados distintos según el profile activo.

---

## Preparar el recurso

Creá en:

```text
src/main/resources/app.properties
```

algo así:

```properties
app.name=${app.nombre}
app.entorno=${app.entorno}
app.url=${app.url}
app.version=${project.version}
```

Este archivo va a funcionar como plantilla del build.

---

## Preparar el pom.xml

Asegurate de tener algo así en `properties`:

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <java.version>21</java.version>
    <app.nombre>Mi App Maven</app.nombre>
    <app.entorno>base</app.entorno>
    <app.url>http://localhost</app.url>
</properties>
```

Y en `build/resources`:

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

Después agregá los profiles `dev` y `prod` con sus properties específicas.

---

## Primer experimento práctico: build sin profile

Primero corré:

```bash
mvn clean compile
```

## Qué deberías observar

Abrí:

```text
target/classes/app.properties
```

y deberías ver algo parecido a:

```properties
app.name=Mi App Maven
app.entorno=base
app.url=http://localhost
app.version=0.1.0-SNAPSHOT
```

Eso corresponde a la configuración base,
sin profile activo.

---

## Segundo experimento práctico: build con profile dev

Ahora corré:

```bash
mvn clean compile -Pdev
```

## Qué deberías observar

Volvé a abrir:

```text
target/classes/app.properties
```

Ahora debería verse algo más parecido a:

```properties
app.name=Mi App Maven
app.entorno=desarrollo
app.url=http://localhost:8080
app.version=0.1.0-SNAPSHOT
```

## Qué aprendiste con esto

Que el mismo recurso fuente produjo una salida distinta según el profile activo.

Eso ya es una de las combinaciones más útiles de Maven.

---

## Tercer experimento práctico: build con profile prod

Probá ahora:

```bash
mvn clean compile -Pprod
```

y revisá otra vez:

```text
target/classes/app.properties
```

## Qué deberías observar

Ahora el archivo debería reflejar los valores del profile de producción,
por ejemplo:

```properties
app.name=Mi App Maven
app.entorno=produccion
app.url=https://api.miapp.com
app.version=0.1.0-SNAPSHOT
```

---

## Qué aprendiste ya

Que un mismo proyecto Maven puede generar configuraciones distintas según el contexto del build,
sin duplicar el proyecto
y sin tener que editar a mano el archivo fuente cada vez.

Entonces aparece una verdad importante:

> esta combinación vuelve al build mucho más expresivo y mucho más cercano a necesidades reales de configuración por entorno.

---

## Qué relación tiene esto con el effective POM

Muy fuerte.

Si querés verificar qué properties quedaron activas realmente,
podés usar:

```bash
mvn help:effective-pom -Pdev -Doutput=effective-pom-dev.xml
```

o:

```bash
mvn help:effective-pom -Pprod -Doutput=effective-pom-prod.xml
```

y buscar:

- `app.entorno`
- `app.url`

Esto te ayuda a conectar:

- policy de profiles
- modelo efectivo
- recurso filtrado
- output del build

---

## Ejercicio 1 — comprobar el flujo completo

Quiero que hagas esto:

### Paso 1
Definí:
- una property base
- un recurso con placeholders
- `filtering=true`

### Paso 2
Agregá al menos dos profiles que cambien propiedades usadas por ese recurso.

### Paso 3
Corré:
```bash
mvn clean compile
mvn clean compile -Pdev
mvn clean compile -Pprod
```

### Paso 4
Compará el contenido de:
```text
target/classes/app.properties
```
en cada caso.

### Objetivo
Ver con total claridad cómo cambia el resultado final del build según el profile.

---

## Qué relación tiene esto con apps reales

Muchísima.

Este patrón aparece muchísimo en la práctica,
porque permite manejar cosas como:

- URLs distintas
- nombres de entorno
- flags de comportamiento
- rutas
- claves no sensibles de configuración
- diferencias de contexto entre desarrollo, QA y producción

No hace falta irte todavía a escenarios complejísimos.
Con entender esta base ya estás aprendiendo algo muy real.

---

## Una intuición muy útil

Podés pensarlo así:

> el profile no cambia el recurso directamente; cambia las properties que después el filtrado usa para construir el recurso final.

Esa frase vale muchísimo.

---

## Qué diferencia hay con tener varios archivos separados

Podrías tener varios archivos distintos,
sí.
Pero eso muchas veces implica:

- duplicación
- más mantenimiento
- riesgo de inconsistencias
- más ruido en el proyecto

En cambio, con un recurso filtrado y perfiles,
podés mantener:

- una plantilla central
- una política clara de valores
- varias salidas posibles del build

Entonces aparece otra idea importante:

> perfiles + filtrado no siempre reemplazan todos los archivos separados del mundo, pero son una herramienta excelente cuando la estructura base del archivo es la misma y solo cambian valores.

---

## Error común 1 — pensar que el profile “edita” el archivo fuente

No.
El archivo en `src/main/resources` sigue siendo una plantilla con placeholders.

El cambio ocurre en:
- el output del build
- usando las properties activas

---

## Error común 2 — olvidar que el profile debe cambiar propiedades usadas realmente por el recurso

Si el profile modifica cosas que el recurso no consume,
no vas a ver efecto en el archivo filtrado.

---

## Error común 3 — no hacer clean entre builds distintos

Cuando comparás variantes por profile,
conviene usar:

```bash
mvn clean compile -P...
```

para evitar confusiones con outputs previos.

---

## Error común 4 — no revisar target/classes

En este tema, como en el anterior,
`target/classes` sigue siendo uno de los mejores lugares para entender qué hizo Maven de verdad.

---

## Ejercicio 2 — verificar también el jar

Después de probar el compilado,
corré también:

```bash
mvn clean package -Pdev
```

o:

```bash
mvn clean package -Pprod
```

Después inspeccioná el `.jar`
y verificá que `app.properties` entró con la variante correspondiente al profile usado.

### Objetivo
Confirmar que la variación no se queda solo en el output intermedio,
sino que llega al artefacto final.

---

## Qué relación tiene esto con todo lo que venís aprendiendo

Este tema conecta muchísimas piezas del roadmap:

- properties
- profiles
- resources
- build
- output
- jar final

Y eso lo vuelve muy valioso,
porque ya no estás viendo piezas aisladas,
sino cómo varias partes de Maven trabajan juntas.

Entonces aparece una verdad importante:

> una de las señales de que ya estás entrando en un Maven más real es que empezás a usar varias piezas juntas para producir resultados distintos de forma controlada.

---

## Ejercicio 3 — comparar base, dev y prod por escrito

Quiero que armes una pequeña tabla o nota donde compares:

- build base
- build con `-Pdev`
- build con `-Pprod`

Y respondas:
- ¿qué se mantuvo igual?
- ¿qué cambió?
- ¿de dónde vino el cambio exactamente?

### Objetivo
Que no solo lo veas funcionar,
sino que lo entiendas de forma causal.

---

## Qué no conviene olvidar

Este tema no pretende que resuelvas toda la configuración de entornos del mundo con Maven.

Lo que sí quiere dejarte es una práctica muy potente y muy real:

- template de recurso
- properties base
- profiles que cambian valores
- build que produce una salida concreta según el contexto

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Creá `src/main/resources/app.properties` con placeholders.

### Ejercicio 2
Definí properties base en el `pom.xml`.

### Ejercicio 3
Habilitá `filtering=true`.

### Ejercicio 4
Creá al menos dos profiles:
- `dev`
- `prod`

### Ejercicio 5
Hacé que cambien propiedades usadas por el recurso.

### Ejercicio 6
Corré:
```bash
mvn clean compile
mvn clean compile -Pdev
mvn clean compile -Pprod
```

### Ejercicio 7
Compará `target/classes/app.properties` en cada caso.

### Ejercicio 8
Corré también un `package` con uno de los profiles y verificá el recurso dentro del `.jar`.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué pasa cuando combinás profiles con recursos filtrados?
2. ¿Qué parte cambia el profile y qué parte cambia el filtrado?
3. ¿Qué diferencia hay entre el archivo fuente y el archivo final generado?
4. ¿Por qué esto puede evitar duplicación?
5. ¿Qué carpeta conviene revisar primero para ver el resultado real del filtrado?

---

## Mini desafío

Hacé una práctica completa:

1. definí una plantilla de recurso
2. definí properties base
3. creá profiles `dev` y `prod`
4. filtrá el recurso
5. corré builds con cada variante
6. compará los resultados en `target/classes`
7. empaquetá al menos una variante
8. escribí una nota breve explicando cómo este tema te mostró un Maven más composable, donde varias piezas trabajan juntas

Tu objetivo es que perfiles y filtrado de recursos dejen de sentirse como dos temas separados y pasen a formar una estrategia concreta de build por contexto.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este trigésimo séptimo tema, ya deberías poder:

- combinar profiles con recursos filtrados
- producir variantes del build según contexto
- entender la diferencia entre plantilla, properties activas y salida final
- verificar el resultado en `target/classes` y en el `.jar`
- y usar Maven de una forma bastante más realista para manejo de configuración por entorno

---

## Resumen del tema

- Un recurso filtrado puede cambiar según las properties activas del build.
- Los profiles permiten variar esas properties según contexto.
- Juntos, profiles y filtrado de recursos permiten producir configuraciones distintas sin duplicar el proyecto.
- El resultado real se ve en `target/classes` y puede entrar al `.jar`.
- Este tema conecta varias piezas importantes del roadmap en una práctica muy real.
- Ya estás usando Maven de una forma bastante más potente que al comienzo del curso.

---

## Próximo tema

En el próximo tema vas a aprender a empezar a trabajar con parent POMs en un nivel inicial, porque después de ordenar bastante la configuración de un proyecto individual, el siguiente paso natural es ver cómo compartir política y estructura entre varios proyectos o entre una base común y sus hijos.
