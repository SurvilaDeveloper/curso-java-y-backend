---
title: "Ejecutar una aplicación con exec-maven-plugin"
description: "Vigésimo noveno tema práctico del curso de Maven: aprender a declarar y usar exec-maven-plugin para ejecutar una aplicación desde Maven, reforzando la diferencia entre construir y correr, y usando un plugin explícito con un caso muy visible."
order: 29
module: "Plugins y build"
level: "base"
draft: false
---

# Ejecutar una aplicación con `exec-maven-plugin`

## Objetivo del tema

En este vigésimo noveno tema vas a:

- aprender a declarar el `exec-maven-plugin`
- usar Maven para ejecutar una aplicación de consola
- reforzar la diferencia entre construir y correr
- entender qué significa ejecutar una app mediante un plugin
- practicar un caso muy visible de configuración explícita dentro del bloque `build`

La idea es que des un paso más con plugins:
ya no solo uno ligado al compilador, sino uno que te permita correr tu aplicación desde Maven de una forma consciente y controlada.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- entender la diferencia entre build y runtime
- usar `mvn compile`, `mvn package`, `mvn install` y `mvn clean`
- declarar un plugin en el `pom.xml`
- entender el rol del bloque `build/plugins`

Si hiciste los temas anteriores, ya tenés la base perfecta para este paso.

---

## Idea central del tema

Hace varios temas viste algo importantísimo:

- construir no es lo mismo que ejecutar

Por ejemplo:

```bash
mvn compile
```

compila,
pero no corre tu aplicación.

Y:

```bash
mvn package
```

empaqueta,
pero tampoco la corre automáticamente.

Hasta ahora, para ejecutar una clase simple, venías usando algo como:

```bash
java -cp target/classes com.gabriel.maven.App
```

Eso está muy bien.
Pero ahora vas a ver otra posibilidad:

> usar un plugin explícito de Maven para ejecutar tu aplicación desde el propio ecosistema Maven.

---

## Qué plugin vas a usar

El plugin más clásico para este caso es:

```text
exec-maven-plugin
```

Más específicamente:

- `groupId`: `org.codehaus.mojo`
- `artifactId`: `exec-maven-plugin`

Este plugin permite ejecutar ciertas cosas desde Maven,
y para este curso lo vas a usar para correr una clase principal (`main class`).

---

## Por qué este tema importa

Porque junta varias ideas que venís construyendo:

- build
- plugins
- bloque `build`
- configuración explícita
- ejecución real
- y diferencia entre proyecto y herramienta

Además, te da una experiencia muy visible:
- configurás algo
- corrés un comando Maven
- y tu aplicación realmente se ejecuta

Eso ayuda muchísimo a fijar conceptos.

---

## Qué diferencia hay con ejecutar usando java directamente

Esto conviene dejarlo clarísimo.

### Con `java -cp ...`
Usás directamente la JVM y el classpath.

### Con `exec-maven-plugin`
Usás Maven como puerta de entrada,
y el plugin se ocupa de lanzar la ejecución de la clase configurada.

Entonces aparece una idea importante:

> Maven no reemplaza a Java, pero un plugin puede ayudarte a orquestar la ejecución desde el flujo Maven.

---

## Una intuición muy útil

Podés pensarlo así:

- `java -cp ...` = ejecución directa manual
- `exec-maven-plugin` = ejecución orquestada desde Maven

Esa diferencia es simple, pero muy útil.

---

## Estructura básica del plugin

La declaración típica se ve así:

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

## Qué significa esto

Le estás diciendo a Maven:

- usá este plugin
- con esta versión
- y cuando lo invoque, la clase principal a ejecutar será `com.gabriel.maven.App`

---

## Primer paso práctico: preparar una clase App simple

Dejá tu clase `App.java` así:

```java
package com.gabriel.maven;

public class App {

    public static void main(String[] args) {
        System.out.println("Hola desde exec-maven-plugin.");
    }
}
```

La idea es usar un ejemplo mínimo y muy visible.

---

## Segundo paso práctico: agregar el plugin

En tu `pom.xml`, dentro de `build/plugins`, agregá algo así:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
            <configuration>
                <source>${maven.compiler.source}</source>
                <target>${maven.compiler.target}</target>
            </configuration>
        </plugin>

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

No hace falta que tengas exactamente esta combinación,
pero sí que el `exec-maven-plugin` quede bien declarado.

---

## Cómo se ejecuta este plugin

Una vez declarado, podés correr:

```bash
mvn exec:java
```

## Qué deberías observar

Tu aplicación debería ejecutarse
y mostrar algo como:

```text
Hola desde exec-maven-plugin.
```

---

## Qué aprendiste ya

Que un plugin puede servir no solo para compilar o testear,
sino también para ejecutar tu aplicación desde Maven.

Eso ya te muestra que el ecosistema de plugins es muy amplio y muy práctico.

---

## Qué relación tiene esto con el build

Acá conviene ser preciso.

`exec:java` no es exactamente lo mismo que una fase estándar como:

- `compile`
- `test`
- `package`

En este caso estás invocando un **goal** concreto del plugin.

Esto conecta perfecto con algo que viste antes:

- Maven trabaja con lifecycles y phases
- pero los plugins también exponen goals concretos

Entonces aparece una idea muy importante:

> `mvn exec:java` es una gran forma de sentir que Maven no solo ejecuta fases del lifecycle, sino también goals específicos de plugins.

---

## Una intuición muy útil

Podés pensarlo así:

- `mvn package` = “llevá el proyecto hasta esta fase”
- `mvn exec:java` = “ejecutá este goal del plugin”

Esta distinción ya es bastante más madura.

---

## Ejercicio 1 — correr la app con exec:java

Quiero que hagas esto:

### Paso 1
Asegurate de tener una clase `App` con `main`.

### Paso 2
Declarà el `exec-maven-plugin`.

### Paso 3
Corré:

```bash
mvn exec:java
```

### Paso 4
Verificá que aparezca el mensaje de consola.

### Objetivo
Experimentar la ejecución real de una app usando un plugin Maven explícito.

---

## Qué pasa si la clase principal está mal escrita

Si en la configuración del plugin ponés algo incorrecto como:

```xml
<mainClass>com.gabriel.maven.AppX</mainClass>
```

cuando en realidad la clase es `App`,
la ejecución va a fallar.

Y eso está buenísimo para aprender,
porque te muestra que el plugin depende de la clase principal configurada de manera correcta.

---

## Ejercicio 2 — provocar un error controlado

Hacé esto:

### Paso 1
Cambiá temporalmente el `mainClass` a un nombre incorrecto.

### Paso 2
Corré:

```bash
mvn exec:java
```

### Paso 3
Leé el error.

### Paso 4
Corregilo.

### Objetivo
Perderle el miedo a errores de configuración del plugin y entender bien qué pieza está fallando.

---

## Qué relación tiene esto con el effective POM

Muy fuerte.

Después de declarar el plugin,
podés generar:

```bash
mvn help:effective-pom -Doutput=effective-pom.xml
```

y buscar:

- `exec-maven-plugin`

## Qué deberías observar

El plugin debería aparecer dentro del modelo efectivo del proyecto,
con su configuración.

Eso te ayuda a reforzar otra vez el ciclo completo:

- declaraste
- usaste
- verificaste en el modelo efectivo

---

## Ejercicio 3 — verificar el plugin en el effective POM

Quiero que hagas esto:

### Paso 1
Generá el effective POM.

### Paso 2
Buscá `exec-maven-plugin`.

### Paso 3
Verificá que aparezca el `mainClass`.

### Objetivo
Ver que la configuración del plugin ya forma parte explícita del proyecto efectivo.

---

## Qué ventaja tiene esto sobre ejecutar siempre a mano

Varias.

- deja más explícita la clase principal dentro del proyecto
- te evita reescribir siempre el comando `java -cp ...`
- centraliza un poco mejor la intención de ejecución
- y refuerza el uso de Maven como orquestador de tareas relacionadas al proyecto

No significa que siempre sea mejor para todo.
Pero sí es muy útil y muy formativo.

---

## Qué no conviene olvidar

Este plugin no cambia la verdad central que ya aprendiste:

> construir no es lo mismo que ejecutar

Lo que hace es darte una forma más integrada de ejecutar desde Maven,
pero sigue siendo ejecución,
no simplemente “compilar”.

Eso conviene no perderlo nunca.

---

## Error común 1 — creer que porque corrés `mvn exec:java`, ya no hace falta entender Java o classpath

No.
El plugin te simplifica parte de la experiencia,
pero no reemplaza la comprensión del fondo.

---

## Error común 2 — mezclar este plugin con dependencias del proyecto

Otra vez:
el plugin vive en `build/plugins`,
no en `dependencies`.

---

## Error común 3 — pensar que exec:java es una phase estándar

No.
Acá estás invocando un goal específico del plugin.

Esto es muy importante para seguir profundizando en Maven después.

---

## Error común 4 — configurar mal la clase principal y no mirar el mensaje de error

Este es un caso donde la salida del build vuelve a ser una gran aliada.
Conviene leerla con calma y detectar:
- qué plugin falló
- qué goal estabas corriendo
- qué parte de la configuración parece mal

---

## Qué relación tiene esto con apps más reales

Muchísima.

Aunque hoy lo uses con una app de consola simple,
este tipo de práctica te empieza a entrenar para ver Maven como algo que puede:

- compilar
- empaquetar
- ejecutar
- y orquestar tareas del proyecto con plugins específicos

Esa visión es muy valiosa.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Prepará una clase `App` con `main`.

### Ejercicio 2
Declarà el `exec-maven-plugin`.

### Ejercicio 3
Configurá `mainClass`.

### Ejercicio 4
Corré:

```bash
mvn exec:java
```

### Ejercicio 5
Verificá la salida en consola.

### Ejercicio 6
Cambiá temporalmente `mainClass` a un valor incorrecto, observá el error y corregilo.

### Ejercicio 7
Generá el effective POM y verificá que el plugin aparezca.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué hace `exec-maven-plugin` en este caso práctico?
2. ¿Qué diferencia hay entre ejecutar con `java -cp ...` y ejecutar con `mvn exec:java`?
3. ¿Dónde se declara este plugin?
4. ¿Qué significa `mainClass` dentro de su configuración?
5. ¿Por qué `mvn exec:java` no es lo mismo que una phase estándar como `package`?

---

## Mini desafío

Hacé una práctica completa:

1. tomá tu proyecto actual
2. agregá `exec-maven-plugin`
3. configurá `mainClass`
4. corré `mvn exec:java`
5. hacé que la app reciba y use argumentos si te animás a explorar más
6. generá el effective POM
7. escribí una nota breve explicando cómo este plugin refuerza la diferencia entre:
   - construir
   - y ejecutar

Tu objetivo es que un plugin deje de parecer una pieza abstracta del build y pase a sentirse como una herramienta real, visible y controlable desde el proyecto.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este vigésimo noveno tema, ya deberías poder:

- declarar y usar `exec-maven-plugin`
- ejecutar una app desde Maven
- entender que `exec:java` es un goal de plugin y no una phase estándar
- verificar su presencia en el effective POM
- y ver a los plugins como herramientas concretas y configurables del proyecto

---

## Resumen del tema

- `exec-maven-plugin` permite ejecutar una clase principal desde Maven.
- Se declara en `build/plugins`.
- `mvn exec:java` invoca un goal del plugin.
- Esto no reemplaza la distinción entre build y runtime, pero la vuelve más visible y práctica.
- El effective POM vuelve a servir para verificar la configuración real.
- Ya avanzaste bastante en Maven real: ahora no solo entendés plugins, también empezaste a usarlos con una utilidad muy concreta.

---

## Próximo tema

En el próximo tema vas a aprender a pasar argumentos a una ejecución y a un plugin de forma más consciente, porque después de correr una aplicación desde Maven, el siguiente paso natural es ver cómo controlar mejor esa ejecución y cómo parametrizarla desde el propio entorno o desde la línea de comandos.
