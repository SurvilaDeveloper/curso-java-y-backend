---
title: "Ejecutar un proyecto con Maven: diferencia entre construir y correr una aplicación"
description: "Décimo tema práctico del curso de Maven: entender la diferencia entre construir un proyecto y ejecutarlo, aprender formas básicas de correr una aplicación Java desde Maven y dejar de confundir build con runtime."
order: 10
module: "Fundamentos de Maven"
level: "intro"
draft: false
---

# Ejecutar un proyecto con Maven: diferencia entre construir y correr una aplicación

## Objetivo del tema

En este décimo tema vas a:

- entender la diferencia entre construir un proyecto y ejecutar una aplicación
- ver qué cosas hace Maven en el build y qué cosas no
- correr tu programa Java desde distintas formas simples
- usar Maven para compilar antes de ejecutar
- dejar de confundir `.jar`, `package` y ejecución real del programa

La idea es que te quede claro que una cosa es generar un artefacto y otra distinta es correr el programa.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- agregar dependencias
- entender el lifecycle básico
- usar `clean`, `compile`, `test`, `package` e `install`
- ubicar el `.jar` dentro de `target`
- inspeccionar el contenido del `.jar`

Si hiciste los temas anteriores, ya estás listo para este paso.

---

## Idea central del tema

Hasta ahora trabajaste mucho con comandos como:

```bash
mvn compile
mvn package
mvn install
```

Todos esos comandos pertenecen al mundo del **build**.

Pero una aplicación también puede necesitar:
- ejecutarse
- mostrar salida en consola
- aceptar argumentos
- usar clases compiladas
- arrancar en una JVM real

Entonces aparece una diferencia muy importante:

> construir no es lo mismo que ejecutar.

---

## Qué significa construir

Construir un proyecto significa, en general:

- compilar
- correr tests
- empaquetar
- instalar artefactos

Eso produce resultados como:

- `.class`
- `.jar`
- reportes
- artefactos instalados en `.m2`

Pero construir no implica automáticamente que tu aplicación se esté ejecutando.

---

## Qué significa ejecutar

Ejecutar significa que la aplicación:
- arranca
- corre su `main`
- usa la JVM
- produce comportamiento real

Por ejemplo, si tenés esto:

```java
package com.gabriel.maven;

public class App {
    public static void main(String[] args) {
        System.out.println("Hola, estoy ejecutando una aplicación.");
    }
}
```

Construir hace que ese código:
- compile
- se empaquete

Ejecutar hace que ese mensaje:
- aparezca realmente en consola

---

## Una intuición muy útil

Podés pensarlo así:

- **build** = preparar, compilar, testear, empaquetar
- **run** = arrancar la aplicación

Esta diferencia es simple, pero central.

---

## Primer experimento: compilar no es ejecutar

Poné en `App.java` algo así:

```java
package com.gabriel.maven;

public class App {
    public static void main(String[] args) {
        System.out.println("Hola desde Maven.");
    }
}
```

Ahora corré:

```bash
mvn compile
```

## Qué deberías observar

Compila.
Pero no aparece:
```text
Hola desde Maven.
```

¿Por qué?
Porque compilaste.
No ejecutaste.

Este es uno de los errores mentales más comunes al empezar.

---

## Segundo experimento: empaquetar no es ejecutar

Corré:

```bash
mvn package
```

## Qué deberías observar

Se genera el `.jar`.
Pero tampoco aparece el mensaje en consola.

Otra vez:
- construiste
- no ejecutaste

Entonces aparece una verdad muy importante:

> ni `compile` ni `package` significan automáticamente “correr la aplicación”.

---

## Primera forma simple de ejecutar: usando `java` directamente

Una vez que compilaste, podés ejecutar la clase principal usando Java.

Primero corré:

```bash
mvn compile
```

Después ejecutá algo como esto:

```bash
java -cp target/classes com.gabriel.maven.App
```

### Qué significa

- `java` → ejecuta la JVM
- `-cp target/classes` → classpath donde están las clases compiladas
- `com.gabriel.maven.App` → clase con el `main`

## Qué deberías ver

Ahora sí debería aparecer:

```text
Hola desde Maven.
```

---

## Qué aprendiste con esto

Que Maven te ayudó a compilar,
pero la ejecución real la está haciendo `java`.

Esto es muy importante para separar responsabilidades.

---

## Tercera forma simple: ejecutar el jar si está preparado para eso

Acá hay que tener cuidado.

Tener un `.jar` no siempre significa que ya podés hacer simplemente:

```bash
java -jar archivo.jar
```

¿Por qué?
Porque para eso el `.jar` necesita tener bien definida una clase principal en el manifest.

En un proyecto Maven básico, eso no siempre viene configurado automáticamente.

Entonces, por ahora, no te confundas:

> generar un `.jar` y tener un `.jar` ejecutable no son exactamente lo mismo.

Más adelante podés aprender a generar jars ejecutables con más intención.

---

## Entonces, ¿cómo ejecuto hoy el proyecto de forma simple?

En esta etapa inicial, la manera más directa y clara es:

### Paso 1
Compilar:

```bash
mvn compile
```

### Paso 2
Ejecutar con Java sobre `target/classes`:

```bash
java -cp target/classes com.gabriel.maven.App
```

Eso ya te permite entender perfecto la relación entre:

- Maven
- clases compiladas
- y ejecución real

---

## Qué pasa si tu clase usa dependencias externas

Acá aparece una dificultad nueva.

Si tu clase principal depende de librerías externas, por ejemplo:

- `commons-lang3`
- `guava`
- otras dependencias

entonces ejecutar solo con:

```bash
java -cp target/classes ...
```

puede no alcanzar,
porque también necesitás esas dependencias en el classpath.

Por eso en la vida real ejecutar apps puede requerir más configuración que solo compilar.

En esta etapa no hace falta meterse a resolver todo eso.
Lo importante es que entiendas esta idea:

> compilar es una cosa; ejecutar con todas las dependencias correctas puede requerir classpath más completo.

---

## Ejercicio 1 — ejecutar una clase simple sin dependencias externas

Dejá tu `App.java` lo más simple posible:

```java
package com.gabriel.maven;

public class App {
    public static void main(String[] args) {
        System.out.println("Estoy ejecutando la aplicación correctamente.");
    }
}
```

Ahora hacé esto:

```bash
mvn clean compile
java -cp target/classes com.gabriel.maven.App
```

Tu objetivo es ver claramente:
- una fase de build
- una fase de ejecución

---

## Probar argumentos desde consola

Ahora cambiá `App.java` por esto:

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

Compilá:

```bash
mvn compile
```

Ejecutá sin argumento:

```bash
java -cp target/classes com.gabriel.maven.App
```

Después ejecutá con argumento:

```bash
java -cp target/classes com.gabriel.maven.App Gabriel
```

## Qué aprendés con esto

Que ya podés trabajar una aplicación real:
- con `main`
- con argumentos
- compilada por Maven
- ejecutada por Java

---

## Qué papel cumple Maven acá

Conviene decirlo claro:

Maven:
- organiza
- compila
- empaqueta
- testea
- instala

Java:
- ejecuta la aplicación

Esto no significa que Maven no pueda ayudar a correr cosas en contextos más avanzados,
pero en esta etapa la separación conceptual te ordena muchísimo.

---

## Diferencia entre construir bien y correr bien

Podés tener un proyecto que:

- compila perfecto
- empaqueta perfecto
- y aun así no esté listo para ejecutarse trivialmente como `java -jar`

Y eso no es contradicción.
Son capas distintas del trabajo.

Entonces aparece una verdad muy importante:

> un build exitoso no garantiza por sí solo una estrategia de ejecución lista para cualquier caso.

---

## Error común 1 — creer que `BUILD SUCCESS` significa “mi programa ya corrió”

No.
Significa que el build terminó bien.

No necesariamente que la app:
- arrancó
- mostró salida
- o ejecutó su lógica principal

---

## Error común 2 — creer que `package` ya deja un jar ejecutable

No siempre.
Depende de cómo esté armado el proyecto y de si el manifest y otras configuraciones acompañan.

En este nivel inicial:
- pensá `package` como empaquetado
- no automáticamente como ejecución lista

---

## Error común 3 — confundir `target/classes` con el jar

No son lo mismo.

### `target/classes`
Clases compiladas sueltas.

### `.jar`
Esas clases empaquetadas en un archivo.

Ambos salen del build,
pero cumplen papeles distintos.

---

## Error común 4 — olvidar recompilar después de cambiar el código

Si cambiás `App.java` y después ejecutás con:

```bash
java -cp target/classes ...
```

sin recompilar,
vas a estar corriendo la versión vieja compilada.

Por eso acostumbrate a:

```bash
mvn compile
```

antes de ejecutar cuando cambiaste código.

---

## Una intuición muy útil

Podés pensarlo así:

> el código fuente no corre; corre lo compilado.

Esa frase vale muchísimo.

---

## Ejercicio 2 — provocar este error mental y corregirlo

### Paso 1
Dejá un mensaje en `App.java`, por ejemplo:

```java
System.out.println("Versión 1");
```

### Paso 2
Corré:

```bash
mvn compile
java -cp target/classes com.gabriel.maven.App
```

### Paso 3
Ahora cambiá el código a:

```java
System.out.println("Versión 2");
```

### Paso 4
Ejecutá otra vez directamente:

```bash
java -cp target/classes com.gabriel.maven.App
```

## Qué deberías observar

Seguramente siga mostrando:
```text
Versión 1
```

Porque no recompilaste.

### Paso 5
Ahora corré:

```bash
mvn compile
java -cp target/classes com.gabriel.maven.App
```

Ahora sí debería aparecer:
```text
Versión 2
```

## Qué aprendiste

Que ejecutar depende de lo compilado actual,
no del código fuente sin más.

---

## Qué relación tiene esto con Maven en proyectos reales

Muchísima.

En proyectos reales Maven te ayuda a:

- tener orden
- compilar bien
- testear
- empaquetar
- reproducir builds

Después, según el tipo de proyecto, la ejecución real puede variar mucho:

- app de consola
- API
- app web
- servicio
- batch
- microservicio

Por eso conviene que primero te quede clarísima esta base:

> build y ejecución son cosas relacionadas, pero no idénticas.

---

## Ejercicio 3 — mirar el build y después ejecutar

Hacé este flujo completo:

```bash
mvn clean compile
java -cp target/classes com.gabriel.maven.App
mvn package
```

Después respondé:

1. ¿Qué parte fue build?
2. ¿Qué parte fue ejecución real?
3. ¿Qué diferencia conceptual viste entre ambas?

---

## Qué no conviene olvidar

Este tema no dice:
- “Maven no sirve para ejecutar nada”

Lo que dice es algo más preciso:
- primero entendé la diferencia entre construir y correr
- después más adelante vas a poder usar herramientas o plugins adicionales con más claridad

Eso te da mucha mejor base que mezclar todo demasiado pronto.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Creá o dejá una clase `App` con `main`.

### Ejercicio 2
Corré:

```bash
mvn compile
```

### Ejercicio 3
Ejecutá la clase con:

```bash
java -cp target/classes com.gabriel.maven.App
```

### Ejercicio 4
Agregá argumentos y probá otra vez.

### Ejercicio 5
Modificá el código sin recompilar, ejecutá, observá el resultado y después corregilo recompilando.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué diferencia hay entre construir y ejecutar?
2. ¿Qué hace `mvn compile`?
3. ¿Qué hace `java -cp target/classes ...`?
4. ¿Por qué `package` no significa necesariamente “correr la aplicación”?
5. ¿Qué relación hay entre `target/classes` y el código que realmente ejecutás?
6. ¿Qué error puede pasar si cambiás código y no recompilás?

---

## Mini desafío

Creá un proyecto nuevo, por ejemplo:

- `app-consola-maven`

Y hacé esto:

1. generá el proyecto
2. escribí una clase principal que reciba argumentos
3. compilá con Maven
4. ejecutá con Java usando `target/classes`
5. modificá el mensaje
6. observá qué pasa si no recompilás
7. corregilo recompilando

Este ejercicio te deja clarísima la relación entre:
- código fuente
- compilación
- clases generadas
- ejecución real

---

## Qué deberías saber al terminar este tema

Si terminaste bien este décimo tema, ya deberías poder:

- distinguir claramente entre build y runtime
- entender que compilar no es ejecutar
- entender que empaquetar no es ejecutar
- correr una clase Java simple usando lo compilado por Maven
- usar argumentos en una app de consola básica
- y evitar uno de los malentendidos más comunes al empezar con Maven

---

## Resumen del tema

- Maven organiza y ejecuta el build del proyecto.
- Ejecutar la aplicación es otra cosa distinta.
- `compile` y `package` no significan automáticamente “correr la app”.
- Una forma simple de ejecutar es usar `java -cp target/classes ...`.
- Lo que se ejecuta es el código compilado, no el fuente directamente.
- Ya empezaste a entender mucho mejor la frontera entre construir un proyecto y correrlo.

---

## Próximo tema

En el próximo tema vas a aprender a usar mejor `mvn test` y a entender el lugar real de los tests dentro del flujo Maven, porque después de distinguir build y ejecución, el siguiente paso natural es ver cómo encajan las pruebas automatizadas dentro de ese proceso y por qué Maven las trata como una parte tan importante del ciclo de construcción.
