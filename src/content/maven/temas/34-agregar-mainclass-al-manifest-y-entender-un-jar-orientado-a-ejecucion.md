---
title: "Agregar Main-Class al manifest y entender un .jar orientado a ejecución"
description: "Trigésimo cuarto tema práctico del curso de Maven: aprender a agregar Main-Class al manifest con maven-jar-plugin, entender qué cambia en el artefacto generado y distinguir mejor entre un .jar común y uno preparado para una ejecución más directa."
order: 34
module: "Plugins y build"
level: "base"
draft: false
---

# Agregar `Main-Class` al manifest y entender un `.jar` orientado a ejecución

## Objetivo del tema

En este trigésimo cuarto tema vas a:

- aprender a agregar `Main-Class` al manifest del `.jar`
- usar `maven-jar-plugin` para dejar más preparado el artefacto para ejecución
- entender qué diferencia hay entre un `.jar` común y uno orientado a ejecución más directa
- reforzar la relación entre metadata del artefacto y comportamiento posterior
- ver una aplicación muy concreta del manifest que ya empezaste a estudiar

La idea es que pases de personalizar metadata básica del `.jar` a usar esa metadata para un fin muy visible: indicarle al artefacto cuál es su clase principal.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- entender qué es el `.jar` generado
- inspeccionar el contenido de un `.jar`
- usar `build/plugins`
- declarar y configurar `maven-jar-plugin`
- entender el rol del `MANIFEST.MF`
- distinguir entre build y ejecución

Si hiciste el tema anterior, ya tenés la base perfecta para este paso.

---

## Idea central del tema

En el tema anterior viste que el `.jar` generado por Maven contiene un manifest y que ese manifest puede recibir metadata útil del build.

Ahora vas a usar esa idea para algo muy concreto y muy importante:

- indicarle al `.jar` cuál es la clase principal

Esto se traduce en una entrada del manifest llamada:

```text
Main-Class
```

Entonces aparece una idea muy importante:

> el manifest no solo sirve para metadata descriptiva; también puede dejar información que orienta cómo se ejecuta el artefacto.

---

## Qué es `Main-Class`

`Main-Class` es una entrada del manifest que indica cuál es la clase principal del programa.

Por ejemplo, si tu clase principal es:

```java
com.gabriel.maven.App
```

entonces el manifest puede incluir algo equivalente a:

```text
Main-Class: com.gabriel.maven.App
```

Eso le deja una pista muy clara a la JVM sobre qué clase debería arrancar cuando el `.jar` está preparado para ese tipo de ejecución.

---

## Qué relación tiene esto con java -jar

Cuando antes hablaste de ejecutar un `.jar`, apareció una idea importante:

- tener un `.jar` no siempre significa que ya esté listo para una ejecución directa con `java -jar`

Una de las razones posibles es justamente esta:
- que el manifest todavía no tenga bien declarada la clase principal

Entonces aparece una verdad importante:

> agregar `Main-Class` no convierte mágicamente cualquier `.jar` en una solución completa para todos los casos, pero sí da un paso muy importante hacia un artefacto más orientado a ejecución directa.

---

## Una intuición muy útil

Podés pensarlo así:

- un `.jar` común empaqueta clases
- un `.jar` con `Main-Class` además declara cuál de esas clases debería ser el punto de entrada

Esa diferencia es muy valiosa.

---

## Preparar una clase principal simple

Asegurate de tener algo como esto:

```java
package com.gabriel.maven;

public class App {

    public static void main(String[] args) {
        System.out.println("Hola desde un jar con Main-Class.");
    }
}
```

La idea es usar un ejemplo mínimo para que el foco esté en el empaquetado y no en otra complejidad.

---

## Cómo se configura Main-Class con maven-jar-plugin

Dentro del plugin, una forma común es esta:

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
                        <mainClass>com.gabriel.maven.App</mainClass>
                        <addDefaultImplementationEntries>true</addDefaultImplementationEntries>
                    </manifest>
                </archive>
            </configuration>
        </plugin>
    </plugins>
</build>
```

## Qué significa esto

Le estás diciendo al plugin:

- este `.jar` debería registrar esta clase principal
- además, seguí agregando metadata básica de implementación

Esto conecta muy bien con el tema anterior.

---

## Primer experimento práctico

Agregá o adaptá tu bloque `maven-jar-plugin` para que quede con:

- `version`
- `archive`
- `manifest`
- `mainClass`
- `addDefaultImplementationEntries`

Después corré:

```bash
mvn clean package
```

## Qué deberías observar

Se vuelve a generar el `.jar`,
pero ahora con un manifest más intencional y más orientado a ejecución.

---

## Cómo verificar que el Main-Class quedó en el manifest

Podés hacerlo inspeccionando el `.jar` y buscando el archivo:

```text
META-INF/MANIFEST.MF
```

La idea es abrirlo o extraerlo y verificar si aparece una línea equivalente a:

```text
Main-Class: com.gabriel.maven.App
```

No hace falta que el formato sea idéntico a ojo según la herramienta,
pero sí que puedas detectar que el `Main-Class` quedó incorporado.

---

## Ejercicio 1 — verificar el manifest real

Quiero que hagas esto:

### Paso 1
Configurá `Main-Class` en `maven-jar-plugin`.

### Paso 2
Corré:

```bash
mvn clean package
```

### Paso 3
Abrí el `.jar` o inspeccioná el manifest.

### Paso 4
Buscá:
- `Main-Class`
- metadata de implementación si también dejaste `addDefaultImplementationEntries`

### Objetivo
Ver con tus propios ojos que la configuración del plugin llega de verdad al artefacto.

---

## Qué diferencia hay entre esto y exec-maven-plugin

Esto conviene dejarlo clarísimo.

### `exec-maven-plugin`
Te ayuda a ejecutar una app desde Maven.

### `Main-Class` en el manifest
Hace que el artefacto `.jar` cargue una metadata útil para ejecución más directa del propio artefacto.

Entonces aparece una idea importante:

> `exec-maven-plugin` y `Main-Class` resuelven problemas relacionados con ejecución, pero no son lo mismo ni viven en la misma capa.

Uno vive en:
- el flujo Maven de ejecución

El otro vive en:
- el artefacto empaquetado final

---

## Qué aprendiste ya

Que el build puede dejar información no solo para compilar o empaquetar,
sino también para orientar cómo se interpreta el artefacto una vez generado.

Eso ya es una comprensión bastante madura.

---

## Segundo experimento: intentar ejecución más directa del jar

Después de agregar `Main-Class`, podés probar algo como:

```bash
java -jar target/TU-ARCHIVO.jar
```

## Qué conviene entender antes de probar

En este tipo de proyecto simple, esto puede acercarte mucho más a una ejecución directa que antes.

Pero también conviene recordar algo importante:
- si tu aplicación necesitara dependencias externas empaquetadas de cierta manera, eso ya puede abrir otros temas más adelante

En este punto del curso, lo importante es esta diferencia:

> agregar `Main-Class` mejora la preparación del `.jar` para ejecución directa, aunque no agota por sí solo todos los escenarios de empaquetado ejecutable más complejos.

---

## Qué relación tiene esto con el tema 9

Muy fuerte.

En el tema 9 viste qué contenía un `.jar`.
Ahora volvés a ese mundo,
pero con otro nivel de intención:

- ya no solo inspeccionás el artefacto
- ahora también lo configurás para que cargue metadata de entrada principal

Eso muestra muy bien cómo fue creciendo tu manejo del build.

---

## Una intuición muy útil

Podés pensarlo así:

> antes mirabas el `.jar` como resultado; ahora empezás a decidir qué debería decir ese resultado sobre sí mismo.

Esa frase vale muchísimo.

---

## Ejercicio 2 — comparar un jar sin y con Main-Class

Quiero que hagas esta práctica:

### Paso 1
Generá un `.jar` sin `Main-Class` explícito.

### Paso 2
Inspeccioná su manifest.

### Paso 3
Después agregá `mainClass` en `maven-jar-plugin`.

### Paso 4
Volvé a correr:

```bash
mvn clean package
```

### Paso 5
Volvé a inspeccionar el manifest.

### Objetivo
Ver de forma muy concreta qué parte del artefacto cambió por tu configuración.

---

## Qué relación tiene esto con la idea de “build más serio”

Muchísima.

Un build más serio no solo busca:
- que compile
- que testee
- que empaquete

También empieza a cuidar:
- cómo queda el artefacto
- qué metadata lleva
- qué tan expresivo y útil resulta ese producto final

Entonces aparece una verdad importante:

> parte de la madurez en Maven también está en empezar a pensar el artefacto como una salida diseñada, no solo generada.

---

## Error común 1 — creer que agregar Main-Class equivale a resolver todo el problema de ejecutabilidad

No necesariamente.
Es un paso muy importante,
pero no reemplaza todos los escenarios posibles de empaquetado.

---

## Error común 2 — confundir metadata del `.jar` con configuración de ejecución desde Maven

Otra vez:
- `exec-maven-plugin` sirve a la ejecución desde Maven
- `Main-Class` vive dentro del artefacto generado

No conviene mezclarlos.

---

## Error común 3 — configurar el plugin y no mirar nunca el manifest

En este tema es especialmente importante mirar el resultado concreto.

---

## Error común 4 — escribir mal la clase principal

Si tu clase real es:

```java
com.gabriel.maven.App
```

y ponés otra cosa,
el manifest va a quedar mal orientado para ese punto de entrada.

---

## Qué relación tiene esto con el effective POM

Muy fuerte.

Después de configurar el plugin,
generá:

```bash
mvn help:effective-pom -Doutput=effective-pom.xml
```

y buscá:

- `maven-jar-plugin`
- `archive`
- `manifest`
- `mainClass`

## Qué deberías observar

Que el modelo efectivo del proyecto ya refleja esa decisión de build.

Esto vuelve a cerrar el circuito sano:

- declarar
- empaquetar
- inspeccionar
- verificar en el modelo efectivo

---

## Ejercicio 3 — verificar el plugin y su configuración en el effective POM

Quiero que hagas esto:

### Paso 1
Generá el effective POM.

### Paso 2
Buscá `maven-jar-plugin`.

### Paso 3
Verificá que aparezca la configuración:
- `mainClass`
- `addDefaultImplementationEntries`

### Objetivo
Ver que la personalización del artefacto está realmente integrada al build efectivo.

---

## Qué no conviene olvidar

Este tema no pretende que todavía entres en empaquetados “fat jar”, sombreado, ensamblado o distribución compleja.

Lo que sí quiere dejarte es una comprensión muy importante:

- el manifest no es decorativo
- `Main-Class` es una metadata muy útil
- y el build puede empezar a dejar artefactos más orientados a uso real

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Asegurate de tener una clase `App` con `main`.

### Ejercicio 2
Configurá `maven-jar-plugin` con:
- `mainClass`
- `addDefaultImplementationEntries`

### Ejercicio 3
Corré:

```bash
mvn clean package
```

### Ejercicio 4
Inspeccioná el `.jar`.

### Ejercicio 5
Abrí el manifest y verificá que aparezca `Main-Class`.

### Ejercicio 6
Probá, si querés, una ejecución con:

```bash
java -jar target/TU-ARCHIVO.jar
```

### Ejercicio 7
Generá el effective POM y verificá la configuración del plugin.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es `Main-Class` dentro del manifest?
2. ¿Qué diferencia hay entre un `.jar` común y uno con `Main-Class` configurado?
3. ¿Qué relación tiene esto con `maven-jar-plugin`?
4. ¿Por qué `Main-Class` no es lo mismo que `exec-maven-plugin`?
5. ¿Qué herramienta te ayuda a verificar que la configuración quedó integrada al proyecto efectivo?

---

## Mini desafío

Hacé una práctica completa:

1. tomá tu proyecto actual
2. agregá `Main-Class` al `maven-jar-plugin`
3. corré `mvn clean package`
4. inspeccioná el `.jar`
5. buscá el `MANIFEST.MF`
6. verificá la entrada `Main-Class`
7. probá una ejecución más directa del `.jar`
8. escribí una nota breve explicando qué parte del artefacto se volvió más orientada a ejecución gracias a esta configuración

Tu objetivo es que el `.jar` deje de ser solo un empaquetado de clases y pase a verse como un artefacto cada vez más consciente de su propio punto de entrada.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este trigésimo cuarto tema, ya deberías poder:

- configurar `Main-Class` en el manifest del `.jar`
- usar `maven-jar-plugin` para dejar un artefacto más orientado a ejecución
- distinguir mejor entre ejecución desde Maven y metadata del artefacto
- inspeccionar el resultado real dentro del `.jar`
- y ver el empaquetado con mucha más intención que al comienzo del curso

---

## Resumen del tema

- El manifest puede contener `Main-Class`, que señala la clase principal del artefacto.
- `maven-jar-plugin` permite configurar esa metadata.
- Esto vuelve al `.jar` más orientado a ejecución directa.
- No es lo mismo que ejecutar la app desde Maven con `exec-maven-plugin`.
- Build, metadata y artefacto quedan todavía mejor conectados.
- Ya diste otro paso muy concreto hacia un empaquetado más consciente y más útil.

---

## Próximo tema

En el próximo tema vas a aprender a manejar recursos dentro de un proyecto Maven y cómo entran al artefacto final, porque después de empezar a configurar mejor el `.jar`, el siguiente paso natural es ver no solo clases y manifest, sino también cómo viajan archivos de recursos desde `src/main/resources` hasta el build y el empaquetado.
