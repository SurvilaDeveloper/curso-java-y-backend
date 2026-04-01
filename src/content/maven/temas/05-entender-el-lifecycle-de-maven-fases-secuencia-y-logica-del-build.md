---
title: "Entender el lifecycle de Maven: fases, secuencia y lógica del build"
description: "Quinto tema práctico del curso de Maven: entender el lifecycle, las fases principales y la lógica secuencial del build para dejar de usar comandos aislados y empezar a ver cómo trabaja realmente Maven."
order: 5
module: "Fundamentos de Maven"
level: "intro"
draft: false
---

# Entender el lifecycle de Maven: fases, secuencia y lógica del build

## Objetivo del tema

En este quinto tema vas a:

- entender qué significa lifecycle en Maven
- distinguir entre lifecycle, phase y goal
- comprender por qué `compile`, `test` y `package` no son comandos aislados
- ver cómo Maven ejecuta una secuencia de trabajo
- practicar la idea de que una fase arrastra a las anteriores

La idea es que dejes de pensar Maven como una lista suelta de comandos y empieces a entender su lógica interna.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- agregar dependencias
- correr:
  - `mvn compile`
  - `mvn test`
  - `mvn package`
- leer la salida básica de Maven en consola

Si hiciste los temas anteriores, ya estás listo.

---

## Idea central del tema

Maven trabaja sobre una idea muy importante:

> el build no se piensa como una colección caótica de acciones separadas, sino como una secuencia ordenada de fases.

Eso significa que cuando pedís una fase como:

```bash
mvn package
```

Maven no hace solo “package”.
Hace todo lo necesario para llegar hasta esa fase.

---

## Qué es un lifecycle

Un **lifecycle** es una secuencia ordenada de fases que representa el proceso de construcción de un proyecto.

Maven tiene varios lifecycles built-in, pero por ahora el que más te importa es el principal:
- el lifecycle de build normal

No hace falta memorizar nombres raros todavía.
Lo importante es entender la idea:

> Maven organiza el trabajo en etapas ordenadas.

---

## Qué es una phase

Una **phase** es una etapa dentro del lifecycle.

Ejemplos muy conocidos:

- `compile`
- `test`
- `package`
- `install`

Cada una representa un momento del build.

---

## Qué es un goal

Un **goal** es una tarea concreta ejecutada normalmente por un plugin.

Todavía no hace falta profundizar demasiado.
Por ahora quedate con esta idea:

- el lifecycle te da la secuencia
- las phases son las etapas
- los plugins ejecutan goals concretos dentro de esas etapas

Dicho simple:

> Maven piensa en fases, y usa plugins para realizar las tareas concretas dentro de esas fases.

---

## Una intuición muy útil

Podés pensarlo así:

- el lifecycle es el recorrido completo
- la phase es una parada de ese recorrido
- el goal es la acción concreta que se realiza en una parada

Esta imagen ordena muchísimo.

---

## Primer ejemplo mental

Imaginá esta secuencia simplificada:

1. validar
2. compilar
3. testear
4. empaquetar
5. instalar

Si vos ejecutás:

```bash
mvn package
```

Maven no puede empaquetar algo que no compiló.
Tampoco debería empaquetar algo que no pasó por test.

Entonces primero recorre lo necesario y después llega a `package`.

---

## Regla clave del tema

Quiero que te quedes con esto:

> cuando ejecutás una fase, Maven ejecuta también todas las fases anteriores necesarias.

Esta regla explica muchísimo de su comportamiento.

---

## Primer experimento práctico

Ejecutá:

```bash
mvn compile
```

## Qué esperás

Que Maven llegue hasta la fase de compilación.

No debería testear ni empaquetar todavía.

---

## Segundo experimento práctico

Ejecutá:

```bash
mvn test
```

## Qué esperás

Que Maven:

- compile el código principal
- compile los tests
- ejecute los tests

O sea:
`test` necesita haber pasado por `compile`.

---

## Tercer experimento práctico

Ejecutá:

```bash
mvn package
```

## Qué esperás

Que Maven:

- compile
- testee
- empaquete

O sea:
`package` arrastra las anteriores.

---

## Cuarto experimento práctico

Ejecutá:

```bash
mvn install
```

## Qué esperás

Que Maven:

- compile
- testee
- empaquete
- e instale el artefacto en tu repositorio local

Eso ya te deja ver una jerarquía bastante clara.

---

## Tabla mental básica de fases que más te importan hoy

No hace falta estudiar todavía todas las fases del mundo.
Estas son las importantes al comienzo:

### `validate`
Verifica que el proyecto esté bien estructurado o que haya información mínima válida.

### `compile`
Compila el código principal.

### `test`
Compila y ejecuta los tests.

### `package`
Genera el artefacto, por ejemplo un `.jar`.

### `install`
Instala el artefacto en el repositorio local de Maven.

---

## Mini resumen visual

Podés pensarlo así:

```text
validate -> compile -> test -> package -> install
```

No es todo el lifecycle completo,
pero para esta etapa te ordena muchísimo.

---

## Ejercicio 1 — leer la secuencia en la práctica

Corré estos comandos por separado:

```bash
mvn compile
mvn test
mvn package
mvn install
```

Y para cada uno respondé:

1. ¿Hasta qué fase llega?
2. ¿Qué parece ejecutar antes?
3. ¿Qué resultado concreto deja?

No hace falta que uses lenguaje perfecto.
Hace falta que entiendas la lógica.

---

## Por qué esto importa tanto

Porque si no entendés el lifecycle, Maven puede sentirse arbitrario.

Podrías pensar:
- “¿por qué corre tests si yo pedí package?”
- “¿por qué compila si yo pedí test?”
- “¿por qué instala si ya había generado el jar?”

La respuesta general es:
- porque Maven trabaja por fases secuenciales,
  no por comandos totalmente aislados

Entonces aparece una verdad muy importante:

> entender el lifecycle te da una explicación estructural de por qué Maven hace varias cosas cuando vos pedís una sola fase.

---

## Qué significa “usar Maven por fases”

Significa que en vez de pensar:

- “quiero correr esta herramienta”

pensás más bien:

- “quiero llevar el proyecto hasta esta etapa del build”

Eso cambia bastante la cabeza.

Por ejemplo:

### `mvn compile`
Llevá el proyecto hasta compilación.

### `mvn test`
Llevá el proyecto hasta test.

### `mvn package`
Llevá el proyecto hasta empaquetado.

### `mvn install`
Llevá el proyecto hasta instalación local.

Esa forma de pensarlo suele ordenar muchísimo.

---

## Diferencia entre “phase” y “comando”

En el uso diario decimos:
- “corré `mvn package`”

Pero conceptualmente, lo que estás haciendo es:
- invocar una **phase** del lifecycle

Esto te va a servir muchísimo más adelante cuando veas plugins, goals y configuraciones más finas.

---

## Ejercicio 2 — observar la salida con ojos nuevos

Ahora corré:

```bash
mvn package
```

Pero esta vez no mires solo si termina en `BUILD SUCCESS`.

Intentá detectar en la salida cosas como:

- parte de compilación
- parte de tests
- parte de empaquetado

La idea es que veas la secuencia actuando.

---

## Un error mental muy común

Pensar que:

```bash
mvn package
```

“solo hace package”.

No.
Hace todo lo necesario para llegar hasta ahí.

Este error mental es muy común al principio,
y corregirlo te vuelve mucho más claro el comportamiento de Maven.

---

## Qué pasa si una fase anterior falla

Esto también es clave.

Si ejecutás:

```bash
mvn package
```

y hay un error de compilación,
Maven no va a empaquetar nada.

¿Por qué?
Porque no puede avanzar a una fase posterior si una anterior falló.

Entonces aparece otra verdad muy importante:

> Maven respeta la secuencia también cuando algo falla: si una etapa previa cae, las siguientes no deberían ejecutarse.

---

## Ejercicio 3 — comprobar que una fase previa bloquea a otra

Rompé a propósito `App.java`.
Por ejemplo:

```java
package com.gabriel.maven;

public class App {
    public static void main(String[] args) {
        System.out.println("Hola Maven")
    }
}
```

Ahora corré:

```bash
mvn package
```

## Qué deberías observar

El error aparece en compilación,
y Maven no llega a generar el `.jar`.

Después corregilo.

---

## Otra idea importante: no todo build necesita llegar siempre hasta install

En el trabajo diario, según lo que quieras hacer, puede alcanzar con una fase más corta.

Por ejemplo:

### Si solo querés ver si compila
```bash
mvn compile
```

### Si querés validar tests
```bash
mvn test
```

### Si querés el `.jar`
```bash
mvn package
```

### Si además querés instalarlo localmente
```bash
mvn install
```

Esto te ayuda a elegir mejor qué pedirle a Maven según el objetivo.

---

## Error común 1 — usar siempre install por costumbre

Muchos principiantes terminan usando:

```bash
mvn install
```

para todo.

No está “mal” siempre,
pero a veces es más de lo que necesitás.

Si solo querés compilar o correr tests, puede bastar con una fase anterior.

---

## Error común 2 — no entender por qué test corre antes de package

Ahora ya deberías verlo mejor:

- `package` depende del trabajo anterior del lifecycle
- por eso el test aparece en el proceso

---

## Error común 3 — creer que phases y plugins son lo mismo

No.

- la phase es la etapa lógica del build
- el plugin ejecuta tareas concretas para cumplir esa etapa

Todavía no hace falta profundizar más,
pero la distinción conviene que te vaya quedando.

---

## Mini mapa conceptual del tema

Podés resumir Maven así:

```text
Lifecycle -> organiza el proceso
Phases -> etapas del proceso
Plugins/Goals -> acciones concretas dentro de esas etapas
```

Esto te va a servir muchísimo más adelante.

---

## Ejercicio 4 — explicar el lifecycle con tus palabras

Quiero que escribas con tus palabras algo así como:

- qué es un lifecycle
- qué es una phase
- por qué `package` no es una acción aislada
- por qué una fase posterior depende de las anteriores

No hace falta que suene académico.
Hace falta que realmente lo entiendas.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Corré:

```bash
mvn compile
```

y explicá qué deja listo.

### Ejercicio 2
Corré:

```bash
mvn test
```

y explicá por qué necesita pasar por compilación.

### Ejercicio 3
Corré:

```bash
mvn package
```

y verificá que genera un `.jar`.

### Ejercicio 4
Corré:

```bash
mvn install
```

y explicá qué agrega respecto de `package`.

### Ejercicio 5
Provocá un error de compilación y comprobá que `package` no puede completarse.

---

## Mini desafío

Armá una tabla en un `.md` o en un `.txt` con estas columnas:

- Fase
- Qué hace
- Qué deja listo
- Cuándo la usarías

Y completala al menos para:

- `compile`
- `test`
- `package`
- `install`

Esto te va a ordenar muchísimo.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este quinto tema, ya deberías poder:

- entender qué es el lifecycle de Maven
- distinguir entre lifecycle, phase y goal en un nivel inicial
- ver `compile`, `test`, `package` e `install` como parte de una secuencia
- entender que una fase arrastra las anteriores necesarias
- y usar Maven con una lógica más clara y menos mecánica

---

## Resumen del tema

- Maven trabaja por secuencias ordenadas llamadas lifecycles.
- Cada lifecycle tiene phases.
- `compile`, `test`, `package` e `install` son fases muy importantes del build.
- Cuando ejecutás una fase, Maven corre las fases anteriores necesarias.
- Si una fase previa falla, las posteriores no deberían completarse.
- Entender esto hace que Maven deje de sentirse arbitrario y mucho más lógico.

---

## Próximo tema

En el próximo tema vas a aprender mejor la diferencia entre `package` e `install`, y también qué significa exactamente el repositorio local de Maven, porque después de entender la lógica del lifecycle, el siguiente paso natural es comprender mejor dónde termina cada artefacto y por qué `install` deja algo distinto a `package`.
