---
title: "Usar un módulo como librería interna reutilizable en Maven"
description: "Cuadragésimo cuarto tema práctico del curso de Maven: aprender a tratar un módulo como librería interna reutilizable dentro de una estructura multi-módulo, reforzar la idea de separación de responsabilidades y entender mejor cómo Maven empaqueta y reutiliza piezas del sistema."
order: 44
module: "Herencia, parents y multi-módulo"
level: "intermedio"
draft: false
---

# Usar un módulo como librería interna reutilizable en Maven

## Objetivo del tema

En este cuadragésimo cuarto tema vas a:

- tratar un módulo como librería interna reutilizable dentro de un sistema Maven
- reforzar la idea de separar responsabilidades entre módulos
- entender mejor cómo un módulo puede convertirse en pieza reusable del sistema
- ver cómo Maven empaqueta y reutiliza esa pieza en otros módulos
- seguir conectando multi-módulo con diseño de arquitectura y no solo con estructura de carpetas

La idea es que dejes de ver los módulos solo como “subproyectos” y empieces a ver que uno de ellos puede cumplir un rol muy claro: ser una librería interna reutilizable para el resto del sistema.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear una raíz multi-módulo
- distinguir entre parent y agregador
- declarar módulos hijos
- declarar dependencias entre módulos
- construir el sistema desde la raíz
- entender que las dependencias entre módulos afectan el build conjunto
- leer `dependency:tree` de un módulo consumidor

Si hiciste los temas anteriores, ya estás listo para este paso.

---

## Idea central del tema

En el tema anterior viste que un módulo puede depender de otro dentro de la misma estructura.

Ahora vas a dar un paso más conceptual y más arquitectónico:

> pensar un módulo no solo como “otro módulo”, sino como una librería interna del sistema.

Esto cambia bastante la forma de mirar la estructura,
porque ya no se trata solo de que un módulo use a otro,
sino de reconocer que ciertas piezas están más orientadas a ser reutilizadas.

---

## Qué significa “módulo como librería interna”

Significa que un módulo:

- tiene una responsabilidad más basal o reutilizable
- expone clases, servicios, utilidades o contratos
- no necesariamente es una aplicación final por sí mismo
- y está pensado para ser consumido por otros módulos

Por ejemplo, un `modulo-core` podría contener:

- utilidades compartidas
- lógica de dominio
- servicios básicos
- validaciones
- constantes
- DTOs
- interfaces

Eso ya lo convierte en una especie de librería interna del sistema.

---

## Una intuición muy útil

Podés pensarlo así:

- módulo librería = pieza reusable
- módulo app = pieza ensambladora o consumidora

Esa diferencia vale muchísimo.

---

## Qué problema resuelve esto

Muchísimo.

Porque en lugar de repetir lógica en varios módulos,
podés concentrarla en una pieza interna reusable.

Entonces ganás cosas como:

- menos duplicación
- más coherencia
- responsabilidades más claras
- mejor separación arquitectónica
- y un sistema más fácil de sostener

Entonces aparece una verdad importante:

> cuando un módulo actúa como librería interna, el multi-módulo deja de ser solo organización y pasa a ser una forma concreta de reutilización dentro del sistema.

---

## Ejemplo conceptual simple

Imaginá esta estructura:

```text
mi-sistema/
├── pom.xml
├── modulo-core/
├── modulo-api/
└── modulo-app/
```

Podrías pensar algo así:

### `modulo-core`
- lógica compartida
- utilidades comunes
- servicios base

### `modulo-api`
- contratos, interfaces, quizá endpoints o DTOs

### `modulo-app`
- app concreta que usa `core` y/o `api`

En este tema el foco va a estar en `modulo-core` como librería interna.

---

## Qué packaging suele tener esa librería interna

Muy frecuentemente:

```xml
<packaging>jar</packaging>
```

Eso tiene muchísimo sentido,
porque la librería interna se empaqueta como un `.jar`
que otros módulos del sistema pueden consumir.

Entonces aparece una idea importante:

> un módulo librería sigue siendo un proyecto Maven real y normalmente se empaqueta como `jar`, igual que una librería reutilizable tradicional.

---

## Primer ejemplo práctico

Supongamos que `modulo-core` tiene este `pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.gabriel.mavencurso</groupId>
        <artifactId>mi-sistema</artifactId>
        <version>1.0.0-SNAPSHOT</version>
    </parent>

    <artifactId>modulo-core</artifactId>
    <packaging>jar</packaging>

    <name>Modulo Core</name>
    <description>Biblioteca interna reutilizable del sistema</description>
</project>
```

## Qué comunica esto

Que `modulo-core` es un módulo concreto,
pero además empaquetable como artefacto reutilizable.

---

## Qué tipo de código conviene poner ahí

Para la práctica,
podés crear algo simple como esto:

```java
package com.gabriel.core;

public class SaludoService {

    public String saludar(String nombre) {
        return "Hola " + nombre;
    }
}
```

Esto es perfecto para entender el rol de librería:
- ofrece algo reutilizable
- otros módulos lo pueden consumir

---

## Segundo paso: usar esa librería desde otro módulo

Ahora en `modulo-app`,
declarás la dependencia:

```xml
<dependencies>
    <dependency>
        <groupId>com.gabriel.mavencurso</groupId>
        <artifactId>modulo-core</artifactId>
        <version>1.0.0-SNAPSHOT</version>
    </dependency>
</dependencies>
```

Y después usás su código:

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

## Qué valor tiene esto

Que ahora `modulo-app` no repite esa lógica.
La reutiliza desde una librería interna del sistema.

Eso ya es muy real arquitectónicamente.

---

## Qué aprendiste ya

Que un módulo Maven puede cumplir un rol muy parecido al de una librería reutilizable,
solo que dentro de tu propia estructura multi-módulo.

Entonces aparece una idea muy importante:

> un sistema multi-módulo bien pensado te permite construir tus propias “librerías internas” de forma ordenada y versionada.

Esa idea es muy poderosa.

---

## Ejercicio 1 — reforzar el rol del módulo librería

Quiero que hagas esto:

### Paso 1
Tomá `modulo-core`.

### Paso 2
Asegurate de que tenga `packaging` `jar`.

### Paso 3
Poné dentro una o dos clases pequeñas reutilizables.

### Paso 4
En `modulo-app`, consumí esas clases.

### Paso 5
Desde la raíz, corré:

```bash
mvn clean compile
```

### Objetivo
Ver con claridad que `modulo-core` está funcionando como librería interna del sistema.

---

## Qué relación tiene esto con install y artifacts

Muy fuerte.

Porque `modulo-core` no es solo un conjunto de clases.
También es un artefacto Maven identificable por:

- `groupId`
- `artifactId`
- `version`

Eso significa que también puede:

- compilarse
- empaquetarse
- instalarse
- y resolverse como cualquier otra pieza Maven

Entonces aparece una verdad importante:

> una librería interna multi-módulo no es una idea “especial”; para Maven sigue siendo un artefacto con coordenadas reales y ciclo de build real.

Eso conecta perfecto con todo lo que aprendiste antes sobre artefactos.

---

## Qué relación tiene esto con el jar del módulo

Muy directa.

Si `modulo-core` tiene `packaging jar`,
entonces al correr:

```bash
mvn package
```

ese módulo produce su propio `.jar`.

Eso ya te deja ver algo muy concreto:

- no solo estás organizando módulos
- también estás produciendo artefactos internos reutilizables

Y eso es muy valioso.

---

## Ejercicio 2 — inspeccionar el artefacto del módulo librería

Quiero que hagas esto:

### Paso 1
Desde la raíz, corré:

```bash
mvn clean package
```

### Paso 2
Buscá el `.jar` generado por `modulo-core` dentro de su carpeta `target`.

### Paso 3
Inspeccionalo con:

```bash
jar tf ruta/al/modulo-core/target/modulo-core-1.0.0-SNAPSHOT.jar
```

### Paso 4
Verificá que contiene la clase reutilizable que creaste.

### Objetivo
Entender que la librería interna no es solo una abstracción modular,
sino también un artefacto real del sistema.

---

## Qué relación tiene esto con arquitectura limpia

Sin meternos todavía en teorías pesadas,
sí conviene que empieces a sentir esta idea:

cuando un módulo se vuelve librería interna,
estás obligándote a pensar:

- qué pertenece a la base
- qué pertenece a la app
- qué lógica vale la pena reutilizar
- qué dependencias conviene evitar en la base

Eso ya empieza a mejorar la arquitectura del sistema.

---

## Una intuición muy útil

Podés pensarlo así:

> si una pieza del sistema puede vivir por sí misma como artefacto reusable, probablemente estás logrando una modularidad más sana.

Esa frase vale muchísimo.

---

## Qué no conviene meter demasiado pronto en el módulo librería

No hace falta volverlo pesado o meter toda la app ahí.
En esta etapa conviene que tenga cosas como:

- utilidades simples
- servicios compartidos pequeños
- lógica básica reusable

Todavía no hace falta que resuelva todo el dominio del mundo.
Lo importante es entender el patrón.

---

## Error común 1 — usar un módulo como librería, pero llenarlo de cosas demasiado específicas de la app

Eso le quita valor como pieza reusable.

---

## Error común 2 — pensar que porque está “adentro del sistema”, ya no hace falta tratarlo como artefacto serio

No.
Justamente conviene tratarlo como una librería real:
- con packaging
- con identidad
- con responsabilidades más claras

---

## Error común 3 — mezclar responsabilidades de módulo base y módulo app

Si `modulo-core` empieza a depender conceptualmente de demasiadas cosas específicas de `modulo-app`,
la modularidad se vuelve menos sana.

---

## Error común 4 — no inspeccionar el jar del módulo

En este tema, hacerlo ayuda muchísimo a cerrar el concepto de “librería interna” como artefacto real.

---

## Qué relación tiene esto con dependency:tree

Sigue siendo muy útil.

Si te ubicás en `modulo-app` y corrés:

```bash
mvn dependency:tree
```

deberías poder ver `modulo-core` como dependencia.

Eso te muestra que la librería interna participa de la resolución del módulo consumidor igual que cualquier otra dependencia.

---

## Ejercicio 3 — mirar el árbol del módulo consumidor

Quiero que hagas esto:

### Paso 1
Ubicate en `modulo-app`.

### Paso 2
Corré:

```bash
mvn dependency:tree
```

### Paso 3
Verificá que aparece `modulo-core`.

### Paso 4
Escribí con tus palabras qué te muestra eso sobre el rol de `modulo-core`.

### Objetivo
Ver que la idea de librería interna está representada también en la resolución real del módulo consumidor.

---

## Qué no conviene olvidar

Este tema no pretende que todavía armes una gran jerarquía de módulos reutilizables.

Lo que sí quiere dejarte es una comprensión muy importante:

- un módulo puede empaquetarse como jar
- puede ser consumido por otros módulos
- puede actuar como librería interna
- y eso vuelve mucho más real la modularidad del sistema

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Tomá `modulo-core` y dejalo con `packaging` `jar`.

### Ejercicio 2
Creá dentro una clase reutilizable simple.

### Ejercicio 3
En `modulo-app`, declarà la dependencia a `modulo-core`.

### Ejercicio 4
Usá la clase reutilizable desde `modulo-app`.

### Ejercicio 5
Desde la raíz, corré:

```bash
mvn clean package
```

### Ejercicio 6
Inspeccioná el `.jar` generado por `modulo-core`.

### Ejercicio 7
Corré en `modulo-app`:

```bash
mvn dependency:tree
```

### Ejercicio 8
Escribí con tus palabras por qué `modulo-core` ya se comporta como una librería interna del sistema.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué significa tratar un módulo como librería interna?
2. ¿Por qué `packaging jar` tiene sentido para ese módulo?
3. ¿Qué valor tiene separar una pieza reusable de una app concreta?
4. ¿Qué te muestra el `.jar` del módulo base?
5. ¿Qué te muestra `dependency:tree` del módulo consumidor?

---

## Mini desafío

Hacé una práctica completa:

1. tomá tu sistema multi-módulo
2. elegí un módulo base
3. convertí ese módulo en librería interna reusable
4. poné una o dos clases simples reutilizables
5. consumilas desde otro módulo
6. empaquetá el sistema
7. inspeccioná el `.jar` del módulo base
8. mirá el árbol de dependencias del módulo consumidor
9. escribí una nota breve explicando cómo este tema cambió tu forma de ver los módulos: de subproyectos a artefactos internos reutilizables

Tu objetivo es que el multi-módulo deje de sentirse como estructura administrativa y pase a verse como arquitectura modular concreta y reusable.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este cuadragésimo cuarto tema, ya deberías poder:

- tratar un módulo como librería interna reusable
- entender por qué `packaging jar` tiene sentido en ese caso
- consumirlo desde otro módulo
- verificar su artefacto generado
- y ver el sistema multi-módulo como una arquitectura de piezas reutilizables reales

---

## Resumen del tema

- Un módulo puede cumplir el rol de librería interna del sistema.
- `packaging jar` lo convierte en un artefacto reusable claro.
- Otros módulos pueden depender de él igual que de cualquier otra dependencia Maven.
- El `.jar` del módulo base vuelve visible esa reutilización.
- `dependency:tree` muestra la relación desde el módulo consumidor.
- Ya diste otro paso importante hacia una comprensión más arquitectónica y reutilizable del multi-módulo Maven.

---

## Próximo tema

En el próximo tema vas a aprender a empezar a usar `dependencyManagement` de la raíz para alinear mejor versiones y relaciones en sistemas multi-módulo más grandes, porque después de ver módulos reutilizables reales, el siguiente paso natural es fortalecer todavía más la gobernanza central del sistema compartido.
