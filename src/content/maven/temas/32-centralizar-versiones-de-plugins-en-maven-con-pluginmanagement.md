---
title: "Centralizar versiones de plugins en Maven con pluginManagement"
description: "Trigésimo segundo tema práctico del curso de Maven: aprender qué es pluginManagement, para qué sirve, cómo centraliza versiones de plugins y por qué es una herramienta clave para escalar el build con más orden y menos repetición."
order: 32
module: "Plugins y build"
level: "base"
draft: false
---

# Centralizar versiones de plugins en Maven con `pluginManagement`

## Objetivo del tema

En este trigésimo segundo tema vas a:

- entender qué es `pluginManagement`
- distinguirlo claramente del bloque `plugins`
- aprender a centralizar versiones de plugins
- evitar repetición innecesaria en el `pom.xml`
- empezar a gobernar varias herramientas del build de una forma más ordenada

La idea es que des un paso similar al que ya diste con `dependencyManagement`, pero ahora aplicado a los plugins del build.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- usar `properties`
- declarar plugins en `build/plugins`
- usar `maven-compiler-plugin`
- usar `exec-maven-plugin`
- entender por qué conviene fijar versiones de plugins
- generar el effective POM

Si hiciste los temas anteriores, ya tenés una base muy buena para este paso.

---

## Idea central del tema

En el tema anterior viste que conviene fijar versiones de plugins explícitamente.

Eso está muy bien.
Pero cuando empezás a tener varios plugins,
puede pasar algo parecido a lo que viste con dependencias:

- muchas versiones repartidas
- repetición
- mantenimiento más pesado
- menos claridad sobre la política general del build

Ahí aparece una herramienta muy importante:

```xml
<pluginManagement>
    ...
</pluginManagement>
```

Dicho simple:

> `pluginManagement` sirve para centralizar y gobernar definiciones de plugins, especialmente sus versiones, sin que eso signifique necesariamente que todos esos plugins queden automáticamente usados de forma activa en el build.

Esta última parte es clave.

---

## Qué relación tiene con dependencyManagement

Muy fuerte.

Ya viste que:

- `dependencyManagement` administra dependencias
- `dependencies` expresa uso real

Acá aparece un paralelo muy útil:

- `pluginManagement` administra plugins
- `plugins` expresa uso real en el build

Entonces aparece una idea muy importante:

> Maven tiene una lógica muy consistente: una cosa es administrar o centralizar, y otra distinta es declarar el uso efectivo.

Esa simetría te ayuda muchísimo a ordenar la cabeza.

---

## Qué hace `plugins`

Si declarás esto:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>exec-maven-plugin</artifactId>
            <version>3.1.0</version>
            <configuration>
                <mainClass>com.gabriel.maven.App</mainClass>
            </configuration>
        </plugin>
    </plugins>
</build>
```

ese plugin entra al build del proyecto como plugin usado explícitamente.

---

## Qué hace `pluginManagement`

Si declarás algo como esto:

```xml
<build>
    <pluginManagement>
        <plugins>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>exec-maven-plugin</artifactId>
                <version>3.1.0</version>
            </plugin>
        </plugins>
    </pluginManagement>
</build>
```

eso no significa por sí solo que el plugin quede automáticamente usado con toda su configuración como parte viva del build del proyecto del mismo modo que cuando está declarado en `plugins`.

Lo que sí hace es:
- centralizar su versión o definición administrada
- dejar una política clara para cuando lo uses

Entonces aparece una verdad importante:

> `pluginManagement` administra; `plugins` activa o declara uso efectivo del plugin en el build.

---

## Una intuición muy útil

Podés pensarlo así:

- `plugins` = herramientas del build que el proyecto usa explícitamente
- `pluginManagement` = catálogo o política centralizada para esas herramientas

Esa imagen vale muchísimo.

---

## Dónde vive pluginManagement

Dentro del bloque `build`, normalmente así:

```xml
<build>
    <pluginManagement>
        <plugins>
            ...
        </plugins>
    </pluginManagement>

    <plugins>
        ...
    </plugins>
</build>
```

Esa estructura ya te deja ver una división muy sana entre:

- administración
- uso real

---

## Primer ejemplo completo

Supongamos que querés centralizar versiones para dos plugins:

- `maven-compiler-plugin`
- `exec-maven-plugin`

Podrías hacer algo así:

```xml
<properties>
    <maven.compiler.plugin.version>3.11.0</maven.compiler.plugin.version>
    <exec.maven.plugin.version>3.1.0</exec.maven.plugin.version>
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
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>exec-maven-plugin</artifactId>
                <version>${exec.maven.plugin.version}</version>
            </plugin>
        </plugins>
    </pluginManagement>

    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <configuration>
                <source>${maven.compiler.source}</source>
                <target>${maven.compiler.target}</target>
            </configuration>
        </plugin>

        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>exec-maven-plugin</artifactId>
            <configuration>
                <mainClass>com.gabriel.maven.App</mainClass>
            </configuration>
        </plugin>
    </plugins>
</build>
```

---

## Qué tiene de bueno esto

Mucho.

- las versiones quedaron centralizadas
- el bloque `plugins` quedó más limpio
- el build expresa mejor qué parte es política general y qué parte es uso concreto
- y si querés actualizar una versión, tocás un lugar más claro

Entonces aparece una idea importante:

> `pluginManagement` te permite dejar menos “ruido de versión” en los plugins usados realmente y mover esa política a una zona más limpia del `pom.xml`.

---

## Qué relación tiene esto con properties

Muy fuerte.

Igual que con dependencias,
lo más sano suele ser combinar:

- `properties`
- `pluginManagement`

Por ejemplo:

```xml
<properties>
    <maven.compiler.plugin.version>3.11.0</maven.compiler.plugin.version>
    <exec.maven.plugin.version>3.1.0</exec.maven.plugin.version>
</properties>
```

y después referenciarlas desde `pluginManagement`.

Eso te da una estructura muy ordenada y mantenible.

---

## Ejercicio 1 — pasar plugins a pluginManagement

Quiero que hagas esto:

### Paso 1
Revisá tu bloque `build/plugins`.

### Paso 2
Elegí al menos dos plugins que ya estés usando explícitamente.

### Paso 3
Creá un bloque `pluginManagement`.

### Paso 4
Mové sus versiones ahí.

### Paso 5
Dejá en `plugins` el uso real y la configuración concreta.

### Paso 6
Corré:

```bash
mvn clean compile
```

y, si corresponde:

```bash
mvn exec:java
```

### Objetivo
Ver que el proyecto sigue funcionando, pero con una estructura más madura del build.

---

## Qué aprendiste con esto

Que no hace falta repetir siempre la versión del plugin justo donde lo usás,
si ya existe una capa de administración pensada para eso.

Eso ya es un gran salto de claridad.

---

## Qué diferencia hay con dejar todo en plugins

Dejar todo directamente en `plugins` no está “mal”.
De hecho, en proyectos chicos puede alcanzar bastante.

Pero a medida que el build crece,
mezclar en el mismo lugar:

- versión
- política general
- configuración concreta
- uso real

puede volver más pesado el archivo.

Entonces aparece otra idea importante:

> `pluginManagement` no existe para complicar, sino para separar responsabilidades dentro del build cuando el proyecto empieza a necesitar más orden.

---

## Qué relación tiene esto con proyectos multi-módulo

Muchísima.

Igual que `dependencyManagement`,
`pluginManagement` se vuelve especialmente valioso cuando más adelante trabajás con:

- parent POM
- varios módulos
- build compartido
- políticas comunes de plugins

No hace falta abrir ese frente todavía.
Pero este tema te está preparando clarísimo para eso.

---

## Una intuición muy útil

Podés pensarlo así:

> si `plugins` es la ejecución del build, `pluginManagement` es la política del build.

Esa frase vale muchísimo.

---

## Qué pasa si un plugin está solo en pluginManagement

Esto conviene dejarlo claro en esta etapa.

Si un plugin queda solo administrado ahí,
pero no aparece como uso real en `plugins` cuando corresponde,
no deberías asumir automáticamente que ya lo estás usando explícitamente de la misma manera que si estuviera en el bloque `plugins`.

Eso conecta perfecto con lo que ya aprendiste de dependencias:
- administrar no es igual a usar

Entonces aparece una verdad importante:

> `pluginManagement` no reemplaza por completo la idea de declarar el plugin donde realmente forma parte del build usado.

---

## Ejercicio 2 — comprobar la diferencia

Hacé esta prueba controlada.

### Paso 1
Mové la versión de un plugin a `pluginManagement`.

### Paso 2
Dejá el plugin usado en `plugins`.

### Paso 3
Verificá que todo siga funcionando.

### Paso 4
Ahora, de forma controlada, probá entender qué parte quedó en:
- administración
- uso real

### Objetivo
No solo copiar estructura, sino comprender la diferencia de rol.

---

## Qué relación tiene esto con el effective POM

Muy fuerte.

Después de reorganizar el build,
generá:

```bash
mvn help:effective-pom -Doutput=effective-pom.xml
```

y buscá:

- `pluginManagement`
- `plugins`
- los plugins que moviste

## Qué deberías observar

Que el modelo efectivo refleja esta estructura y que el build queda representado de una forma más rica y más explícita.

Esto vuelve a cerrar el circuito sano:

- centralizar
- usar
- verificar

---

## Ejercicio 3 — verificar en effective POM

Quiero que hagas esto:

### Paso 1
Generá el effective POM.

### Paso 2
Buscá el bloque de `pluginManagement`.

### Paso 3
Buscá también el bloque de `plugins`.

### Paso 4
Observá cómo aparecen los plugins que reorganizaste.

### Objetivo
Ver que no es solo una decisión estética del `pom.xml`, sino una estructura real del modelo Maven.

---

## Error común 1 — creer que pluginManagement reemplaza totalmente a plugins

No.
Cumplen roles distintos.

---

## Error común 2 — meter versión y configuración concreta del uso real siempre en el mismo lugar aunque el build ya haya crecido

Eso puede volverse más difícil de mantener.

---

## Error común 3 — no usar properties para las versiones de plugins

No es obligatorio siempre,
pero suele dar mucha claridad y consistencia.

---

## Error común 4 — reorganizar el build y no volver a probar nada

Siempre que cambies esta estructura, después:
- corré el build real
- y si querés más claridad, mirá el effective POM

---

## Qué no conviene olvidar

Este tema no pretende que ahora conviertas cualquier proyecto mínimo en una arquitectura gigantesca.

Lo que sí quiere dejarte es una herramienta muy importante para pensar builds más sanos:

- separar política de plugins
- separar uso real
- evitar repetición
- y preparar una mejor escalabilidad del `pom.xml`

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Creá properties para al menos dos versiones de plugins.

### Ejercicio 2
Agregá un bloque `pluginManagement` dentro de `build`.

### Ejercicio 3
Mové ahí las versiones de:
- `maven-compiler-plugin`
- `exec-maven-plugin`

### Ejercicio 4
Dejá en `plugins` la configuración real que usa el proyecto.

### Ejercicio 5
Corré:

```bash
mvn clean compile
mvn exec:java
```

### Ejercicio 6
Generá el effective POM y verificá la estructura.

### Ejercicio 7
Escribí con tus palabras la diferencia entre:
- `pluginManagement`
- `plugins`

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es `pluginManagement`?
2. ¿En qué se diferencia de `plugins`?
3. ¿Qué ventaja tiene centralizar versiones de plugins?
4. ¿Qué relación tiene esto con properties?
5. ¿Por qué esta estructura mejora el mantenimiento del build?

---

## Mini desafío

Hacé una práctica completa:

1. tomá tu proyecto actual
2. identificá dos plugins que ya uses
3. creá properties para sus versiones
4. mové la política a `pluginManagement`
5. dejá el uso real en `plugins`
6. corré el build real
7. generá el effective POM
8. escribí una nota breve explicando qué parte del build se volvió más ordenada y por qué eso prepara mejor al proyecto para crecer

Tu objetivo es que el build del proyecto empiece a parecerse menos a una suma de bloques y más a una estructura con responsabilidades claras.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este trigésimo segundo tema, ya deberías poder:

- entender qué es `pluginManagement`
- distinguirlo de `plugins`
- centralizar versiones de plugins con más criterio
- combinarlo con `properties`
- y estructurar el build de una forma mucho más ordenada y escalable

---

## Resumen del tema

- `pluginManagement` administra plugins; `plugins` expresa uso real en el build.
- Centralizar versiones de plugins mejora claridad y mantenimiento.
- Esta lógica se parece mucho a la de `dependencyManagement` y `dependencies`.
- Combinar `pluginManagement` con `properties` da una estructura muy sana.
- Effective POM y build real ayudan a verificar que la reorganización sigue viva.
- Ya diste otro paso importante hacia un Maven mucho más serio y mantenible.

---

## Próximo tema

En el próximo tema vas a aprender a usar un plugin para modificar el empaquetado o la metadata del `.jar`, porque después de ordenar bastante el build y la gestión de plugins, el siguiente paso natural es tocar de forma visible el resultado empaquetado del proyecto y hacer que el build deje una huella más intencional en el artefacto generado.
