---
title: "Personalizar el .jar generado con maven-jar-plugin y metadata básica"
description: "Trigésimo tercer tema práctico del curso de Maven: aprender a usar maven-jar-plugin para personalizar metadata básica del .jar, entender mejor el manifest y hacer que el empaquetado del proyecto sea más intencional y visible."
order: 33
module: "Plugins y build"
level: "base"
draft: false
---

# Personalizar el `.jar` generado con `maven-jar-plugin` y metadata básica

## Objetivo del tema

En este trigésimo tercer tema vas a:

- aprender a declarar y configurar `maven-jar-plugin`
- entender mejor qué rol cumple en el empaquetado
- personalizar metadata básica del `.jar`
- mirar el `MANIFEST.MF` con más intención
- hacer que el artefacto generado deje una huella un poco más explícita del build

La idea es que el `.jar` deje de ser solo “el archivo que Maven genera” y pase a ser un artefacto más conscientemente configurado dentro del proyecto.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- entender qué es el `.jar` generado
- usar `build/plugins`
- declarar plugins explícitos
- usar `pluginManagement`
- distinguir entre build, runtime y artefactos
- inspeccionar el contenido de un `.jar`

Si venís siguiendo el curso, ya tenés una base muy buena para este paso.

---

## Idea central del tema

Hace varios temas viste que cuando corrés:

```bash
mvn package
```

Maven suele generar un `.jar`.

También viste que ese `.jar` contiene cosas como:

- clases compiladas
- metadatos
- `META-INF/MANIFEST.MF`

Y en el tema 27 entendiste mejor que detrás de ese empaquetado suele actuar un plugin.

Ahora vas a dar el paso importante:

> dejar de ver el empaquetado como algo totalmente implícito y empezar a configurar de forma explícita una parte visible del `.jar` generado.

---

## Qué plugin vas a usar

El plugin principal de este tema es:

- `maven-jar-plugin`

Normalmente pertenece a:

- `groupId`: `org.apache.maven.plugins`
- `artifactId`: `maven-jar-plugin`

Este plugin está muy ligado a la generación del artefacto `.jar` cuando tu proyecto usa:

```xml
<packaging>jar</packaging>
```

---

## Por qué este tema importa

Porque hasta ahora ya trabajaste bastante la lógica del build:

- compilación
- tests
- plugins
- ejecución
- versiones de plugins
- orden del `pom.xml`

Ahora tocás una parte muy visible del resultado:

- el artefacto final

Eso es muy valioso, porque empieza a conectar:

- configuración del build
con
- forma concreta del archivo generado

Entonces aparece una idea muy importante:

> un build más maduro no solo controla cómo se compila el proyecto, sino también qué identidad y qué metadata deja en el artefacto que produce.

---

## Una intuición muy útil

Podés pensarlo así:

- antes: Maven te daba un `.jar`
- ahora: empezás a decirle a Maven algo más sobre ese `.jar`

Esa pequeña diferencia ya es un salto importante.

---

## Qué vas a personalizar hoy

No hace falta que hoy armes un empaquetado complejo.
En este tema vas a enfocarte en algo más básico y muy valioso:

- metadata del manifest
- información visible dentro del `.jar`
- comprensión del rol de `maven-jar-plugin`

Eso ya te deja un caso práctico muy claro.

---

## Recordatorio: qué es el manifest

Dentro del `.jar` suele existir algo como:

```text
META-INF/MANIFEST.MF
```

Ese archivo contiene metadata básica del artefacto.

No hace falta que hoy memorices todos sus campos posibles.
Lo importante es entender que:

> el manifest es una de las formas más visibles en las que el build deja información dentro del `.jar`.

Y justamente el `maven-jar-plugin` puede influir en eso.

---

## Primer paso: declarar explícitamente el plugin

Podés empezar por algo así:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-jar-plugin</artifactId>
            <version>3.3.0</version>
        </plugin>
    </plugins>
</build>
```

## Qué significa esto

Le estás diciendo a Maven explícitamente:
- quiero gobernar el plugin que participa del empaquetado `.jar`
- y además quiero una versión clara y visible

Esto ya sigue el criterio que venís construyendo:
- no dejar todo completamente implícito si querés más control

---

## Segundo paso: agregar configuración básica de manifest

Ahora vamos a hacer algo visible.

Podés configurar el plugin así:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-jar-plugin</artifactId>
            <version>3.3.0</version>
            <configuration>
                <archive>
                    <manifest>
                        <addDefaultImplementationEntries>true</addDefaultImplementationEntries>
                    </manifest>
                </archive>
            </configuration>
        </plugin>
    </plugins>
</build>
```

## Qué hace esta configuración

Le indica al plugin que agregue ciertas entradas de implementación por defecto al manifest.

No hace falta que hoy profundices en cada campo interno.
Lo importante es que:
- el `.jar` va a quedar con más metadata útil y visible

---

## Qué aprendiste ya

Que el `.jar` no tiene por qué ser un producto totalmente opaco del build.
Podés empezar a moldear parte de su metadata.

Y eso ya es muy valioso.

---

## Primer experimento práctico

Agregá el `maven-jar-plugin` con la configuración anterior.
Después corré:

```bash
mvn clean package
```

Ahora inspeccioná el contenido del `.jar`:

```bash
jar tf target/TU-ARCHIVO.jar
```

y después, si querés profundizar más, abrí o inspeccioná el manifest.

## Objetivo
Ver que la configuración del plugin afecta algo real del artefacto generado.

---

## Cómo inspeccionar el manifest

Tenés varias opciones.
Una simple es extraer o abrir el contenido del `.jar` con una herramienta adecuada.

El objetivo no es complicarte con tooling extra,
sino verificar que:

- `META-INF/MANIFEST.MF` existe
- y que el plugin puede influir en lo que queda ahí

Si querés una práctica más manual, podés desempaquetar el `.jar` o usar herramientas de compresión que permitan mirar el contenido.

---

## Qué tipo de entradas conviene esperar

Con configuración como:

```xml
<addDefaultImplementationEntries>true</addDefaultImplementationEntries>
```

podés encontrar entradas relacionadas con identidad y versión del artefacto,
dependiendo de cómo quede armado el manifest.

No hace falta que memorices nombres exactos hoy.
Lo importante es entender la idea general:

> el plugin puede enriquecer el manifest con metadata útil del proyecto.

---

## Una intuición muy útil

Podés pensarlo así:

- el código compilado vive en las clases
- la identidad mínima del artefacto también puede dejarse en el manifest

Esa combinación vuelve al `.jar` un artefacto más expresivo.

---

## Ejercicio 1 — declarar y usar maven-jar-plugin

Quiero que hagas esto:

### Paso 1
Agregá `maven-jar-plugin` a tu `pom.xml`.

### Paso 2
Fijá su versión.

### Paso 3
Agregá la configuración:

```xml
<archive>
    <manifest>
        <addDefaultImplementationEntries>true</addDefaultImplementationEntries>
    </manifest>
</archive>
```

### Paso 4
Corré:

```bash
mvn clean package
```

### Paso 5
Inspeccioná el `.jar` y su manifest.

### Objetivo
Conectar configuración explícita del plugin con resultado real en el artefacto.

---

## Qué diferencia hay con un jar completamente por default

Cuando no tocás el plugin,
Maven sigue pudiendo generar el `.jar`.

Pero cuando lo declarás y configurás,
pasan varias cosas:

- la herramienta del empaquetado queda más visible
- la política del build queda más clara
- el manifest puede enriquecerse
- y el proyecto expresa mejor cómo quiere producir su artefacto

Entonces aparece una idea importante:

> no se trata solo de “que el `.jar` exista”, sino de empezar a decidir un poco mejor cómo querés que exista.

---

## Qué relación tiene esto con el effective POM

Muy fuerte.

Después de declarar el plugin,
generá:

```bash
mvn help:effective-pom -Doutput=effective-pom.xml
```

y buscá:

- `maven-jar-plugin`

## Qué deberías observar

Debería aparecer:

- el plugin
- su versión
- y la configuración de `archive/manifest`

Eso te vuelve a mostrar una práctica muy sana:
- declarar
- ejecutar
- verificar en el modelo efectivo

---

## Ejercicio 2 — verificar el jar plugin en el effective POM

Quiero que hagas esto:

### Paso 1
Generá el effective POM.

### Paso 2
Buscá `maven-jar-plugin`.

### Paso 3
Verificá que aparezca la configuración que agregaste.

### Objetivo
Ver que el build efectivo incorpora la decisión que tomaste sobre el empaquetado.

---

## Qué relación tiene esto con plugins y artifacts

Este tema es muy lindo porque junta dos mundos del curso:

- plugins del build
- artefactos producidos por el build

Hasta ahora trabajaste bastante ambos,
pero por separado.

Ahora los unís:
- un plugin concreto influye sobre el `.jar` concreto que produce el proyecto

Eso ya es bastante maduro dentro de Maven.

---

## Error común 1 — pensar que el `.jar` es completamente fijo y no configurable

No.
Tiene bastante margen de configuración,
y este tema te muestra una parte muy visible de eso.

---

## Error común 2 — confundir metadata del manifest con dependencias del proyecto

No son lo mismo.
El manifest vive dentro del artefacto generado y expresa metadata del empaquetado,
no la red completa de dependencias.

---

## Error común 3 — declarar el plugin pero no mirar nunca el resultado del `.jar`

En este tema es especialmente importante mirar el artefacto de verdad.
Si no, todo queda demasiado abstracto.

---

## Error común 4 — querer hacer un empaquetado súper complejo demasiado pronto

No hace falta.
Con personalizar una parte del manifest ya estás aprendiendo muchísimo de forma sana.

---

## Qué relación tiene esto con ejecución y jars ejecutables

Conviene una aclaración.

Este tema no está centrado todavía en hacer un “fat jar” o un jar autoejecutable súper completo.
Está centrado en:

- entender el rol del `maven-jar-plugin`
- tocar metadata del artefacto
- y volver más visible el resultado del empaquetado

Más adelante podrías profundizar en casos más avanzados de empaquetado.
Pero por ahora este paso es perfecto.

---

## Ejercicio 3 — comparar before/after del jar

Quiero que hagas esta práctica:

### Paso 1
Generá un `.jar` sin configuración explícita del `maven-jar-plugin` y observá su estructura básica.

### Paso 2
Después agregá el plugin con configuración de manifest.

### Paso 3
Volvé a generar el `.jar`.

### Paso 4
Compará qué parte del proceso dejó de ser completamente implícita y qué metadata ahora sabés que el build está agregando con intención.

### Objetivo
Entender mejor el valor de pasar de default puro a configuración explícita.

---

## Qué no conviene olvidar

Este tema no pretende que todavía domines todos los rincones del `maven-jar-plugin`.

Lo que sí quiere dejarte es una comprensión muy valiosa:

- el empaquetado también se gobierna
- el `.jar` también puede configurarse
- y el build puede dejar una huella más intencional en el artefacto final

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Declará el `maven-jar-plugin`.

### Ejercicio 2
Fijá su versión explícitamente.

### Ejercicio 3
Agregá configuración básica de `archive/manifest`.

### Ejercicio 4
Corré:

```bash
mvn clean package
```

### Ejercicio 5
Inspeccioná el `.jar`.

### Ejercicio 6
Ubicá `META-INF/MANIFEST.MF`.

### Ejercicio 7
Generá el effective POM y verificá que el plugin quedó incorporado.

### Ejercicio 8
Escribí con tus palabras qué parte del artefacto se volvió más intencional gracias a esta configuración.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué hace `maven-jar-plugin` en este contexto?
2. ¿Qué relación tiene con el `.jar` generado por Maven?
3. ¿Qué es el manifest?
4. ¿Por qué tiene valor empezar a configurar metadata del artefacto?
5. ¿Qué herramienta te ayuda a verificar que el plugin quedó realmente integrado al build efectivo?

---

## Mini desafío

Hacé una práctica completa:

1. tomá tu proyecto actual
2. agregá `maven-jar-plugin`
3. configurá `addDefaultImplementationEntries`
4. corré `mvn clean package`
5. inspeccioná el `.jar`
6. buscá el manifest
7. generá el effective POM
8. escribí una nota breve explicando cómo este tema conecta:
   - plugins
   - build
   - y artefacto final

Tu objetivo es que el empaquetado del proyecto deje de sentirse como un efecto secundario automático y pase a verse como una parte configurable y visible del build.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este trigésimo tercer tema, ya deberías poder:

- declarar y configurar `maven-jar-plugin`
- entender mejor el rol del manifest
- relacionar una configuración del build con el `.jar` generado
- verificar el resultado en el effective POM
- y ver el artefacto final como algo más gobernable y más expresivo

---

## Resumen del tema

- `maven-jar-plugin` permite gobernar parte del empaquetado `.jar`.
- El manifest es una pieza importante de metadata dentro del artefacto.
- Declarar el plugin y configurar su archive/manifest vuelve el empaquetado más visible e intencional.
- Build, plugin y artefacto final quedan más claramente conectados.
- Effective POM vuelve a ser una herramienta clave de verificación.
- Ya diste otro paso muy concreto hacia un Maven más serio, donde el resultado del build también se configura conscientemente.

---

## Próximo tema

En el próximo tema vas a aprender a agregar una entrada de clase principal al manifest y a entender mejor qué diferencia hay entre un `.jar` común y uno preparado para ejecución más directa, porque después de empezar a personalizar metadata del artefacto, el siguiente paso natural es usar esa metadata para acercarte a un empaquetado más orientado a ejecución.
