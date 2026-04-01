---
title: "Declarar dependencias entre módulos en un proyecto multi-módulo Maven"
description: "Cuadragésimo segundo tema práctico del curso de Maven: aprender a declarar dependencias entre módulos de una misma estructura multi-módulo, entender cómo Maven resuelve esas relaciones y empezar a pensar el sistema como piezas que no solo conviven, sino que también colaboran entre sí."
order: 42
module: "Herencia, parents y multi-módulo"
level: "intermedio"
draft: false
---

# Declarar dependencias entre módulos en un proyecto multi-módulo Maven

## Objetivo del tema

En este cuadragésimo segundo tema vas a:

- aprender a declarar dependencias entre módulos de una misma estructura Maven
- entender cómo un módulo puede usar clases de otro
- ver cómo Maven resuelve esas relaciones dentro del build multi-módulo
- distinguir entre “estar en la misma raíz” y “depender realmente entre sí”
- empezar a pensar el sistema como una arquitectura de piezas colaborando, no solo coexistiendo

La idea es que pases del multi-módulo como simple coordinación de builds a un multi-módulo donde los módulos ya se usan entre sí como partes de un sistema real.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear una raíz multi-módulo con `packaging pom`
- declarar módulos con `<modules>`
- usar la raíz como parent compartido
- construir el conjunto desde la raíz
- entender la diferencia entre parent y agregador
- leer el effective POM de un módulo

Si hiciste los temas anteriores, ya estás listo para este paso.

---

## Idea central del tema

En el tema anterior viste que varios módulos podían convivir dentro de la misma estructura y construirse juntos desde una raíz.

Pero convivir no siempre significa colaborar.

Podrías tener:

- `modulo-core`
- `modulo-api`
- `modulo-app`

todos dentro de la misma raíz,
y aun así que ninguno use al otro.

Ahora vas a dar el paso importante:

> hacer que un módulo dependa de otro módulo del mismo sistema.

Eso cambia mucho la escala del aprendizaje,
porque ya no estás solo coordinando builds,
sino empezando a construir una arquitectura modular.

---

## Qué significa que un módulo dependa de otro

Significa que un módulo declara como dependencia a otro módulo del sistema para poder usar sus clases, interfaces o utilidades.

Por ejemplo:

- `modulo-app` puede depender de `modulo-core`
- entonces `modulo-app` puede importar clases que viven en `modulo-core`

Dicho simple:

> una dependencia entre módulos hace que un módulo reutilice código de otro dentro de la misma estructura Maven.

---

## Una intuición muy útil

Podés pensarlo así:

- antes: varios módulos lado a lado
- ahora: varios módulos conectados por relaciones de dependencia

Esa diferencia es muy importante.

---

## Qué problema resuelve esto

Muchísimo.

Porque si querés una arquitectura modular,
normalmente no querés un proyecto gigantesco con todo mezclado.

Querés separar responsabilidades.
Por ejemplo:

- un módulo para lógica base
- un módulo para API
- un módulo para aplicación
- quizá otro para persistencia más adelante

Pero si están separados,
necesitan una forma sana de relacionarse.

Ahí entra Maven con dependencias entre módulos.

Entonces aparece una verdad importante:

> el multi-módulo se vuelve realmente poderoso cuando no solo organiza proyectos, sino que también organiza relaciones limpias entre ellos.

---

## Ejemplo conceptual simple

Imaginá esta estructura:

```text
mi-sistema/
├── pom.xml
├── modulo-core/
│   ├── pom.xml
│   └── src/main/java/...
├── modulo-api/
│   ├── pom.xml
│   └── src/main/java/...
└── modulo-app/
    ├── pom.xml
    └── src/main/java/...
```

Supongamos que `modulo-core` contiene:

- una clase `SaludoService`

y querés que `modulo-app` la use.

Entonces `modulo-app` tiene que declarar una dependencia a `modulo-core`.

---

## Cómo se declara la dependencia entre módulos

En el `pom.xml` del módulo consumidor,
por ejemplo `modulo-app`,
agregás algo así:

```xml
<dependencies>
    <dependency>
        <groupId>com.gabriel.mavencurso</groupId>
        <artifactId>modulo-core</artifactId>
        <version>1.0.0-SNAPSHOT</version>
    </dependency>
</dependencies>
```

## Qué significa esto

Le estás diciendo a Maven:
- este módulo necesita al módulo `modulo-core`

Y como ambos forman parte del mismo sistema,
Maven puede resolver esa relación dentro del build conjunto.

---

## Qué conviene notar enseguida

Aunque ambos módulos estén en la misma raíz,
la dependencia no aparece sola “por magia”.
Hay que declararla.

Entonces aparece una idea muy importante:

> estar en la misma estructura multi-módulo no implica automáticamente depender entre sí; la relación de dependencia sigue siendo explícita.

Esa distinción es central.

---

## Primer ejemplo práctico

Supongamos que en `modulo-core` creás una clase así:

```java
package com.gabriel.core;

public class SaludoService {

    public String saludar(String nombre) {
        return "Hola " + nombre;
    }
}
```

Y en `modulo-app` querés algo así:

```java
package com.gabriel.app;

import com.gabriel.core.SaludoService;

public class App {

    public static void main(String[] args) {
        SaludoService service = new SaludoService();
        System.out.println(service.saludar("Gabriel"));
    }
}
```

Para que eso compile,
`modulo-app` necesita declarar la dependencia a `modulo-core`.

---

## Primer experimento práctico

Hacé esto:

### Paso 1
En `modulo-core`, agregá una clase simple reutilizable.

### Paso 2
En `modulo-app`, intentá importarla.

### Paso 3
Antes de declarar la dependencia, observá mentalmente que eso no debería resolver bien.

### Paso 4
Ahora agregá la dependencia de `modulo-app` hacia `modulo-core`.

### Paso 5
Desde la raíz, corré:

```bash
mvn clean compile
```

## Qué deberías observar

Ahora Maven debería poder construir el sistema completo y permitir que `modulo-app` use clases de `modulo-core`.

---

## Qué aprendiste con esto

Que el multi-módulo real no solo se trata de compilar varias piezas juntas,
sino de dejar que ciertas piezas se apoyen en otras de forma explícita y ordenada.

Eso ya es un salto muy importante.

---

## Qué relación tiene esto con coordinates normales de Maven

Muy fuerte.

La dependencia entre módulos se declara con la misma lógica general que cualquier otra dependencia Maven:

- `groupId`
- `artifactId`
- `version`

La diferencia es que ahora el artefacto no viene de una librería externa cualquiera,
sino de otro módulo de tu mismo sistema.

Entonces aparece una idea importante:

> para Maven, un módulo del mismo sistema sigue siendo un artefacto identificable por coordenadas, igual que cualquier otra dependencia.

Eso te ayuda muchísimo a unificar modelo mental.

---

## Una intuición muy útil

Podés pensarlo así:

- afuera o adentro del sistema,
- para Maven una dependencia sigue siendo una dependencia

Lo que cambia es de dónde se resuelve y cómo participa en el build conjunto.

---

## Qué relación tiene esto con el build desde la raíz

Total.

Una de las grandes ventajas del multi-módulo es justamente esta:

si construís desde la raíz,
Maven conoce la estructura completa y puede ordenar la construcción de módulos relacionados.

Entonces aparece una verdad importante:

> cuando Maven ve una dependencia entre módulos dentro de una misma raíz multi-módulo, puede coordinar el orden de construcción para que el sistema tenga sentido como conjunto.

No hace falta que profundices todavía en todos los detalles internos de ese orden.
Lo importante es entender que:
- la raíz ya no solo agrupa
- también permite coordinar relaciones de construcción

---

## Ejercicio 1 — distinguir convivencia de dependencia

Quiero que hagas este ejercicio por escrito.

Tomá dos módulos:
- `modulo-core`
- `modulo-app`

y respondé:

1. ¿Qué significa que ambos estén en la misma raíz?
2. ¿Qué significa además que `modulo-app` dependa de `modulo-core`?
3. ¿Por qué no son exactamente lo mismo?

### Objetivo
Que no confundas cercanía estructural con relación de dependencia.

---

## Qué relación tiene esto con arquitectura

Muchísima.

Porque a partir de acá ya no estás solo usando Maven para organizar carpetas,
sino para expresar una arquitectura.

Por ejemplo:

- `core` puede ser base compartida
- `api` puede exponer contratos
- `app` puede consumir o ensamblar
- después podrían aparecer capas más específicas

Entonces Maven empieza a ayudarte a representar relaciones reales entre piezas de software.

Eso ya es muy valioso.

---

## Qué pasa si invertís mal dependencias

No hace falta que hoy armes toda una teoría de arquitectura,
pero sí conviene empezar a sentir esto:

no da lo mismo cualquier dirección de dependencia.

Por ejemplo, muchas veces tiene más sentido que:
- `app` dependa de `core`

que al revés.

Entonces el multi-módulo también te obliga a pensar un poco mejor la dirección de las relaciones.

Eso ya es claramente intermedio.

---

## Ejercicio 2 — pensar la dirección de dependencia

Quiero que respondas:

> Si `modulo-core` es una base reutilizable y `modulo-app` es una aplicación concreta, ¿cuál parece más lógico que dependa de cuál? ¿Por qué?

### Objetivo
Empezar a conectar Maven con decisiones de diseño, no solo de sintaxis.

---

## Qué relación tiene esto con install

También importa.

Si no construyeras el sistema desde la raíz,
muchas veces el módulo consumidor necesitaría resolver el artefacto del módulo productor desde el repositorio local.

Eso conecta perfecto con `mvn install`.

Pero cuando estás trabajando en la estructura multi-módulo completa,
la raíz y el build conjunto te dan una experiencia mucho más fluida.

No hace falta abrir más todavía ese frente.
Solo ver que:
- multi-módulo y repositorio local también se conectan.

---

## Qué relación tiene esto con effective POM

Sigue siendo fuerte.

El effective POM de `modulo-app` te ayuda a ver:
- qué hereda
- qué dependencias concretas declara
- y cómo quedó su modelo final

Además, `dependency:tree` puede volverse muy útil para ver la relación con `modulo-core`.

Entonces ahora ya empezás a tener dos herramientas complementarias:

- `effective-pom` para ver configuración final
- `dependency:tree` para ver relaciones de dependencia

Eso es muy valioso.

---

## Ejercicio 3 — mirar el árbol del módulo consumidor

Ubicate en `modulo-app` y corré:

```bash
mvn dependency:tree
```

### Qué deberías buscar
- `modulo-core` como dependencia del módulo consumidor

### Objetivo
Ver que la relación no solo existe en el `pom.xml`, sino también en la resolución real del módulo.

---

## Error común 1 — creer que por estar en la misma raíz ya se pueden importar clases entre módulos sin declarar dependencia

No.
La dependencia sigue siendo explícita.

---

## Error común 2 — pensar que todos los módulos deberían depender de todos

No.
Eso volvería la arquitectura más desordenada y frágil.

---

## Error común 3 — no pensar la dirección de dependencia

Esto es importante.
Maven te deja declarar dependencias,
pero vos tenés que pensar si esa relación tiene sentido.

---

## Error común 4 — no probar la compilación desde la raíz

Si querés entender multi-módulo real,
eso es una de las mejores partes del experimento.

---

## Qué no conviene olvidar

Este tema no pretende que todavía armes una red enorme de módulos con arquitectura sofisticada.

Lo que sí quiere dejarte es una base muy potente:

- los módulos pueden depender entre sí
- esas dependencias se declaran explícitamente
- Maven puede coordinarlas en una raíz multi-módulo
- y eso ya convierte la estructura en un sistema modular real

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
En `modulo-core`, creá una clase simple reutilizable.

### Ejercicio 2
En `modulo-app`, intentá usar esa clase.

### Ejercicio 3
Declarà la dependencia de `modulo-app` hacia `modulo-core`.

### Ejercicio 4
Desde la raíz, corré:

```bash
mvn clean compile
```

### Ejercicio 5
Ubicate en `modulo-app` y corré:

```bash
mvn dependency:tree
```

### Ejercicio 6
Escribí con tus palabras qué diferencia viste entre:
- compartir raíz
- depender realmente de otro módulo

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué significa que un módulo dependa de otro dentro de una estructura multi-módulo?
2. ¿Qué diferencia hay entre estar en la misma raíz y tener una dependencia explícita?
3. ¿Cómo se declara esa dependencia?
4. ¿Por qué esto vuelve más real la arquitectura del sistema?
5. ¿Qué herramientas te ayudan a verificar la relación?

---

## Mini desafío

Hacé una práctica completa:

1. armá una raíz multi-módulo
2. creá al menos dos módulos
3. en uno, definí una clase reutilizable
4. en otro, usala
5. declarà la dependencia entre módulos
6. construí todo desde la raíz
7. mirá el `dependency:tree` del módulo consumidor
8. escribí una nota breve explicando cómo este tema cambia tu visión del multi-módulo: de convivencia estructural a colaboración real entre piezas

Tu objetivo es que Maven deje de parecerte solo una forma de agrupar proyectos y pase a verse como una forma de expresar arquitectura modular viva.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este cuadragésimo segundo tema, ya deberías poder:

- declarar dependencias entre módulos del mismo sistema
- entender cómo se relacionan dentro del build multi-módulo
- distinguir estructura común de dependencia real
- usar `dependency:tree` para verificar la relación
- y pensar Maven como herramienta de arquitectura modular, no solo de coordinación de builds

---

## Resumen del tema

- Estar en la misma raíz multi-módulo no implica automáticamente depender entre sí.
- Las dependencias entre módulos siguen siendo explícitas.
- Maven puede resolver y coordinar esas relaciones dentro del build conjunto.
- Esto vuelve la estructura multi-módulo mucho más real y arquitectónica.
- `dependency:tree` y el build desde la raíz ayudan a verificar la relación.
- Ya diste otro paso importante hacia un Maven claramente orientado a sistemas modulares reales.

---

## Próximo tema

En el próximo tema vas a aprender a controlar mejor el orden lógico y las relaciones entre módulos dentro del sistema, porque después de declarar dependencias reales entre ellos, el siguiente paso natural es entender mejor cómo Maven organiza el build conjunto y por qué ciertas relaciones afectan el flujo de construcción.
