---
title: "Pasar argumentos y propiedades en una ejecución con Maven"
description: "Trigésimo tema práctico del curso de Maven: aprender a pasar argumentos y propiedades al ejecutar una aplicación con Maven, parametrizar mejor el comportamiento del programa y entender cómo se conectan línea de comandos, plugins y entorno."
order: 30
module: "Plugins y build"
level: "base"
draft: false
---

# Pasar argumentos y propiedades en una ejecución con Maven

## Objetivo del tema

En este trigésimo tema vas a:

- aprender a pasar argumentos y propiedades al ejecutar una aplicación con Maven
- reforzar el uso práctico de `exec-maven-plugin`
- distinguir entre argumentos de la aplicación y propiedades del build
- parametrizar mejor el comportamiento de una ejecución
- entender cómo se conectan la línea de comandos, los plugins y el entorno Maven

La idea es que pases de ejecutar una app “siempre igual” a controlar mejor qué información recibe cuando la corrés desde Maven.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- entender la diferencia entre build y runtime
- declarar plugins en `build/plugins`
- usar `exec-maven-plugin`
- ejecutar una clase principal con `mvn exec:java`

Si hiciste el tema anterior, ya estás listo para este paso.

---

## Idea central del tema

En el tema anterior viste que podés ejecutar una clase principal con:

```bash
mvn exec:java
```

Eso ya es muy útil.
Pero en una aplicación real no siempre querés correrla con comportamiento fijo.

Muchas veces querés pasarle algo como:

- un nombre
- una ruta
- un modo
- un entorno
- una bandera
- una propiedad

Entonces aparece una idea muy importante:

> ejecutar una aplicación desde Maven no tiene por qué ser algo rígido; también puede parametrizarse.

---

## Qué tipos de información vas a distinguir hoy

En este tema conviene separar dos ideas que al principio suelen mezclarse:

### 1. Argumentos de la aplicación
Son valores que recibe tu `main(String[] args)`.

### 2. Propiedades del sistema o del build
Son valores que pasás con `-D...` y que pueden influir en Maven, en plugins o en tu programa si lo lee por ese camino.

Esta diferencia es central.

---

## Una intuición muy útil

Podés pensarlo así:

- `args` = argumentos que recibe tu programa
- `-D` = propiedades que recibe la JVM, Maven o el entorno del plugin

Esa distinción vale muchísimo.

---

## Preparar una App simple para probar

Dejá tu clase `App.java` así:

```java
package com.gabriel.maven;

public class App {

    public static void main(String[] args) {
        if (args.length > 0) {
            System.out.println("Hola " + args[0]);
        } else {
            System.out.println("Hola visitante");
        }
    }
}
```

Esta clase te permite ver fácilmente si los argumentos llegaron o no.

---

## Recordatorio de plugin base

Tu `pom.xml` debería tener algo parecido a esto:

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

No hace falta que sea idéntico,
pero sí que el plugin ya esté declarado y funcione.

---

## Primer experimento: ejecución sin argumentos

Corré:

```bash
mvn exec:java
```

## Qué deberías observar

Tu app debería imprimir:

```text
Hola visitante
```

Eso confirma que el `main` corrió,
pero no recibió argumentos.

---

## Segundo experimento: pasar un argumento

Con `exec-maven-plugin`, una forma muy usada de pasar argumentos es usando una propiedad para el goal.

Podés probar algo como:

```bash
mvn exec:java -Dexec.args="Gabriel"
```

## Qué deberías observar

Ahora la aplicación debería imprimir:

```text
Hola Gabriel
```

---

## Qué aprendiste ya

Que el plugin no solo puede ejecutar la app,
sino también pasarle argumentos.

Y eso ya lo vuelve mucho más útil para casos reales.

Entonces aparece una idea importante:

> `exec-maven-plugin` puede funcionar como puente entre la línea de comandos de Maven y los argumentos reales del programa.

---

## Qué significa `-Dexec.args`

En este caso específico,
estás usando una propiedad que el plugin entiende para pasar argumentos a la aplicación.

O sea:

- no estás editando el código
- no estás cambiando el `pom.xml`
- solo estás parametrizando la ejecución desde consola

Eso es una herramienta muy práctica.

---

## Ejercicio 1 — probar varios argumentos

Ahora cambiá tu `App.java` por esto:

```java
package com.gabriel.maven;

public class App {

    public static void main(String[] args) {
        System.out.println("Cantidad de argumentos: " + args.length);

        for (int i = 0; i < args.length; i++) {
            System.out.println("arg[" + i + "] = " + args[i]);
        }
    }
}
```

Después corré:

```bash
mvn exec:java -Dexec.args="uno dos tres"
```

## Qué deberías observar

Algo como:

```text
Cantidad de argumentos: 3
arg[0] = uno
arg[1] = dos
arg[2] = tres
```

### Objetivo
Ver que no estás limitado a un único valor.
La app puede recibir varios argumentos.

---

## Qué diferencia hay entre esto y usar properties de Java

Ahora viene una parte muy importante.

Los argumentos de `args` se leen desde:

```java
public static void main(String[] args)
```

Pero si usás propiedades del sistema,
la lectura suele ir por otro lado,
por ejemplo:

```java
System.getProperty("nombre.propiedad")
```

Eso no es lo mismo.

Entonces aparece una verdad importante:

> pasar argumentos a `args` y pasar propiedades con `-D` no son exactamente la misma cosa, aunque ambos vengan desde la línea de comandos.

---

## Tercer experimento: leer una propiedad del sistema

Ahora probá esta versión de `App.java`:

```java
package com.gabriel.maven;

public class App {

    public static void main(String[] args) {
        String entorno = System.getProperty("app.entorno", "no-definido");
        System.out.println("Entorno: " + entorno);
    }
}
```

### Qué hace esto
Lee una propiedad del sistema llamada:

- `app.entorno`

y si no existe,
usa por defecto:

- `no-definido`

---

## Cómo ejecutarla

Probá primero:

```bash
mvn exec:java
```

## Resultado esperado

```text
Entorno: no-definido
```

Ahora probá con una propiedad:

```bash
mvn exec:java -Dapp.entorno=desarrollo
```

## Resultado esperado

En muchos entornos esta propiedad puede quedar disponible para la ejecución y la aplicación debería mostrar:

```text
Entorno: desarrollo
```

### Importante
El punto conceptual es este:
- acá no usaste `args`
- usaste una propiedad del sistema

---

## Qué aprendiste con esto

Que la línea de comandos te permite influir en la ejecución por caminos distintos:

- argumentos del programa
- propiedades del sistema
- y también propiedades que ciertos plugins interpretan

Eso ya es bastante más maduro.

---

## Una intuición muy útil

Podés pensarlo así:

- `args` = datos que el programa recibe como entrada posicional
- `System.getProperty(...)` = configuración o contexto nombrado que el programa consulta

Esta distinción suele ser muy útil en apps reales.

---

## Ejercicio 2 — combinar argumentos y propiedad

Podés probar una App un poco más completa:

```java
package com.gabriel.maven;

public class App {

    public static void main(String[] args) {
        String entorno = System.getProperty("app.entorno", "no-definido");

        System.out.println("Entorno: " + entorno);

        if (args.length > 0) {
            System.out.println("Usuario: " + args[0]);
        } else {
            System.out.println("Usuario: visitante");
        }
    }
}
```

Ahora corré algo como:

```bash
mvn exec:java -Dexec.args="Gabriel" -Dapp.entorno=desarrollo
```

## Qué deberías observar

Algo como:

```text
Entorno: desarrollo
Usuario: Gabriel
```

### Objetivo
Ver que podés combinar varias formas de parametrizar la ejecución.

---

## Qué relación tiene esto con Maven real

Muchísima.

En escenarios reales, muchas veces una ejecución necesita:

- argumentos
- flags
- propiedades
- modos
- rutas
- entornos
- opciones de configuración

Este tema te empieza a mostrar cómo usar Maven como vehículo de esa parametrización,
en lugar de verlo solo como compilador o empaquetador.

---

## Qué relación tiene esto con profiles

También importa.

Recordá que un profile podía cambiar propiedades del proyecto o del entorno Maven.

Ahora ves otra capa:
- también podés parametrizar una ejecución puntual desde la línea de comandos

Entonces aparece una idea importante:

> profile y parámetros de ejecución no son lo mismo, pero ambos participan de la flexibilidad con la que manejás el proyecto y su contexto.

---

## Error común 1 — creer que `-Dexec.args` y `-Dmi.propiedad` significan lo mismo

No.
En un caso estás usando una propiedad que el plugin interpreta para poblar `args`.
En el otro caso podés estar definiendo una propiedad del sistema o del entorno de ejecución.

---

## Error común 2 — mezclar args con System.getProperty

El programa puede usar ambos,
pero no conviene tratarlos como si fueran idénticos.

---

## Error común 3 — escribir mal las comillas o el formato de los argumentos

Cuando pasás varios argumentos,
muchas veces conviene agruparlos así:

```bash
-Dexec.args="uno dos tres"
```

Si te equivocás en el formato,
la ejecución puede comportarse distinto de lo esperado.

---

## Error común 4 — pensar que toda parametrización debería ir al pom

No.
Una de las ventajas de este enfoque es justamente que:
- parte de la parametrización queda en la ejecución
- no necesariamente codificada dentro del `pom.xml`

Eso te da flexibilidad sin tocar el proyecto cada vez.

---

## Ejercicio 3 — hacer una app un poco más “real”

Quiero que hagas una prueba con una App que:

- lea un nombre desde `args`
- lea un entorno desde `System.getProperty`
- y muestre un mensaje final usando ambas cosas

Por ejemplo:

```java
package com.gabriel.maven;

public class App {

    public static void main(String[] args) {
        String entorno = System.getProperty("app.entorno", "local");
        String usuario = args.length > 0 ? args[0] : "visitante";

        System.out.println("Hola " + usuario + " desde el entorno " + entorno);
    }
}
```

Después corré:

```bash
mvn exec:java -Dexec.args="Gabriel" -Dapp.entorno=qa
```

### Objetivo
Usar la ejecución con Maven de una forma que ya se parezca más a una app parametrizable real.

---

## Qué relación tiene esto con plugins explícitos

Muy fuerte.

Este tema refuerza por qué vale tanto la pena declarar un plugin explícitamente:

- deja visible la herramienta
- te permite configurarla
- te deja usarla conscientemente
- y vuelve el proyecto más expresivo

Eso sigue empujando el `pom.xml` hacia una forma más madura.

---

## Qué no conviene olvidar

Este tema no dice que siempre debas ejecutar todo con Maven.
Lo que sí muestra es que:

- Maven puede ser una gran puerta de entrada para ciertas ejecuciones
- y los plugins pueden ayudarte a controlar esa ejecución con bastante claridad

Eso ya es muy valioso.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Prepará una clase `App` que use `args`.

### Ejercicio 2
Corré:

```bash
mvn exec:java -Dexec.args="uno dos tres"
```

### Ejercicio 3
Modificá la clase para que también lea una propiedad con `System.getProperty`.

### Ejercicio 4
Corré algo como:

```bash
mvn exec:java -Dexec.args="Gabriel" -Dapp.entorno=desarrollo
```

### Ejercicio 5
Escribí con tus palabras qué parte vino por argumentos y qué parte vino por propiedad.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué hace `-Dexec.args` en este contexto?
2. ¿Qué diferencia hay entre `args` y `System.getProperty(...)`?
3. ¿Qué ventaja tiene ejecutar una app parametrizada desde Maven?
4. ¿Por qué esto no elimina la diferencia entre build y runtime?
5. ¿Qué papel cumple el plugin en toda esta orquestación?

---

## Mini desafío

Hacé una práctica completa:

1. tomá tu proyecto actual
2. usá `exec-maven-plugin`
3. prepará una App que reciba:
   - un argumento de nombre
   - una propiedad de entorno
4. corré la app varias veces cambiando:
   - `-Dexec.args`
   - `-Dapp.entorno`
5. observá cómo cambia la salida
6. escribí una nota breve explicando qué parte de la parametrización quedó en el código y cuál quedó en la línea de comandos

Tu objetivo es que la ejecución vía Maven deje de sentirse estática y pase a verse como una herramienta controlable y bastante flexible.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este trigésimo tema, ya deberías poder:

- pasar argumentos a una app ejecutada con Maven
- distinguir entre argumentos del programa y propiedades del sistema
- parametrizar mejor la ejecución
- entender mejor cómo se conectan línea de comandos, plugin y aplicación
- y usar `exec-maven-plugin` de una forma mucho más rica que en el tema anterior

---

## Resumen del tema

- `exec-maven-plugin` no solo ejecuta una app; también permite parametrizarla.
- `-Dexec.args` sirve para poblar `main(String[] args)`.
- `System.getProperty(...)` permite leer propiedades pasadas por línea de comandos.
- Argumentos y propiedades no son lo mismo.
- Maven puede servir como una puerta de entrada bastante útil para ejecutar apps de consola parametrizadas.
- Ya diste un paso importante desde la ejecución básica hacia la ejecución controlada y flexible.

---

## Próximo tema

En el próximo tema vas a aprender a fijar y entender versiones de plugins con más criterio, porque después de usar uno o dos plugins explícitos de forma práctica, el siguiente paso natural es empezar a gobernar mejor qué versiones de herramientas del build querés sostener y por qué eso importa tanto como gobernar las dependencias del proyecto.
