---
title: "Fijar la versión de Java en Maven: source, target y properties del proyecto"
description: "Decimotercer tema práctico del curso de Maven: aprender a fijar la versión de Java del proyecto usando properties y configuración básica para lograr builds más claros, predecibles y consistentes."
order: 13
module: "Fundamentos de Maven"
level: "intro"
draft: false
---

# Fijar la versión de Java en Maven: `source`, `target` y properties del proyecto

## Objetivo del tema

En este decimotercer tema vas a:

- entender por qué conviene declarar la versión de Java del proyecto
- aprender qué significan `source` y `target`
- usar properties para centralizar la versión de Java
- configurar el compilador de Maven de una forma básica y clara
- evitar uno de los problemas más comunes al empezar: que el proyecto dependa demasiado de la máquina donde corre

La idea es que el build deje de “asumir” una versión de Java y empiece a declararla con intención.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- agregar dependencias
- usar `properties`
- ejecutar `compile`, `test`, `package`, `install` y `clean`
- entender el lifecycle básico

Si venís siguiendo el curso, ya estás listo para este paso.

---

## Idea central del tema

Hasta ahora tu proyecto Maven probablemente compila porque:

- tenés Java instalado
- Maven encuentra el compilador
- y todo más o menos coincide

Pero eso no significa que el proyecto esté bien definido en cuanto a versión de Java.

Y ahí aparece un problema clásico:

- en tu máquina funciona
- en otra máquina puede no funcionar igual
- o cambia el comportamiento según el JDK usado

Entonces aparece una idea muy importante:

> un proyecto serio no debería depender solo de “la versión de Java que justo tengo instalada”, sino declarar con más claridad con qué versión espera compilar.

---

## Qué significa “fijar la versión de Java”

Significa dejar explícito en el `pom.xml` algo como:

- qué nivel de sintaxis Java usa el código fuente
- qué versión de bytecode o compatibilidad genera el compilador
- qué decisión técnica querés que el proyecto sostenga

En esta etapa lo vas a hacer con una configuración simple y bastante clásica.

---

## Qué significan `source` y `target`

Cuando se habla de compilación Java en Maven, aparecen mucho estas dos ideas:

### `source`
Indica con qué nivel de lenguaje Java querés compilar el código fuente.

### `target`
Indica qué versión de bytecode o compatibilidad querés generar.

Dicho simple:

- `source` mira más al lenguaje que escribís
- `target` mira más al resultado compilado que producís

No hace falta profundizar demasiado en matices finos todavía.
Lo importante hoy es que entiendas que:
- ambos ayudan a fijar la intención del build

---

## Primer problema práctico que este tema quiere evitar

Supongamos que vos escribís código usando características de una versión moderna de Java,
pero el proyecto no declara bien su versión.

Entonces puede pasar que:

- compile en tu máquina porque justo tenés un JDK moderno
- falle en otra máquina
- o el build quede ambiguo

Eso no conviene.

Entonces aparece una verdad importante:

> declarar la versión de Java vuelve el proyecto más claro y menos dependiente del azar del entorno.

---

## Una intuición muy útil

Podés pensarlo así:

- sin versión declarada → el build depende más del contexto
- con versión declarada → el build expresa mejor su contrato técnico

Esta diferencia es muy valiosa.

---

## Primer paso: definir una property para la versión de Java

Abrí tu `pom.xml` y dentro de `properties` agregá algo así:

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <java.version>21</java.version>
</properties>
```

Si ya tenés otras properties, simplemente sumala.

Por ejemplo:

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <java.version>21</java.version>
    <commons.lang3.version>3.14.0</commons.lang3.version>
    <junit.version>4.13.2</junit.version>
</properties>
```

---

## Qué valor poner en `java.version`

Poné la versión de Java con la que realmente querés trabajar en el curso o en tu proyecto.

Por ejemplo:

- `17`
- `21`

Si tu entorno actual está en Java 21, podés usar:

```xml
<java.version>21</java.version>
```

---

## Segundo paso: usar esa versión para source y target

Ahora agregá también estas properties:

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <java.version>21</java.version>
    <maven.compiler.source>${java.version}</maven.compiler.source>
    <maven.compiler.target>${java.version}</maven.compiler.target>
</properties>
```

Esto es una forma muy usada y muy clara de hacerlo al principio.

## Qué hiciste acá

- centralizaste una sola versión base: `java.version`
- y la reutilizaste para `source` y `target`

Eso ya ordena mucho el `pom.xml`.

---

## Qué significan estas properties especiales

### `maven.compiler.source`
Le dice al compilador Maven qué nivel de lenguaje usar.

### `maven.compiler.target`
Le dice qué versión de salida generar.

Maven reconoce estas properties y las usa con el plugin de compilación.

No hace falta que hoy configures el plugin manualmente para este caso básico.
Con estas properties ya estás dando un paso muy bueno.

---

## Primer experimento práctico

Dejá tu bloque `properties` más o menos así:

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <java.version>21</java.version>
    <maven.compiler.source>${java.version}</maven.compiler.source>
    <maven.compiler.target>${java.version}</maven.compiler.target>
    <commons.lang3.version>3.14.0</commons.lang3.version>
    <junit.version>4.13.2</junit.version>
</properties>
```

Ahora corré:

```bash
mvn clean compile
```

## Qué deberías observar

El proyecto debería seguir compilando,
pero ahora con una intención mucho más clara respecto de la versión Java que espera usar.

---

## Qué ventaja tiene centralizarlo así

Muchísima.

Si más adelante querés pasar de Java 17 a 21,
o de 21 a otra versión,
podrías cambiar en un solo lugar:

```xml
<java.version>21</java.version>
```

Y dejar que el resto lo herede.

Entonces aparece una idea importante:

> una property para Java convierte una decisión importante del build en algo visible y fácil de mantener.

---

## Ejercicio 1 — cambiar temporalmente la versión

Hacé esta prueba controlada.

### Paso 1
Dejá:

```xml
<java.version>21</java.version>
```

### Paso 2
Corré:

```bash
mvn clean compile
```

### Paso 3
Ahora cambiá temporalmente a otra versión razonable según tu entorno, por ejemplo:

```xml
<java.version>17</java.version>
```

### Paso 4
Volvé a correr:

```bash
mvn clean compile
```

## Qué objetivo tiene esto

Que sientas que:
- la decisión está en un lugar claro
- y que el build depende de esa definición

### Importante
Dejá finalmente la versión que realmente querés usar en el curso.

---

## Qué puede pasar si la versión no coincide con tu JDK real

Si declarás una versión que tu entorno no soporta bien,
pueden aparecer errores de compilación o problemas del plugin.

Por ejemplo:
- declarar 21 cuando tu entorno efectivo no está listo para eso
- o al revés, usar código demasiado moderno para un target más bajo

No hace falta que abras todos esos casos hoy.
Solo quedate con esta idea:

> la versión declarada tiene que conversar con el JDK real que estás usando.

---

## Cómo verificar con qué Java está corriendo Maven

Ejecutá:

```bash
mvn -version
```

Deberías ver algo como:

```bash
Apache Maven 3.9.x
Java version: 21, vendor: ...
```

Esto te da una pista muy importante:
- con qué Java está funcionando Maven en tu entorno actual

---

## Ejercicio 2 — mirar mvn -version con otros ojos

Corré:

```bash
mvn -version
```

Y anotá:

1. versión de Maven
2. versión de Java
3. vendor
4. sistema operativo

Después comparalo con lo que declaraste en el `pom.xml`.

La idea es que empieces a leer la relación entre:
- entorno real
- intención declarada del proyecto

---

## Qué diferencia hay entre “tener Java instalado” y “tener la versión del proyecto definida”

Muy importante.

### Tener Java instalado
Solo significa que tu máquina puede ejecutar Java y Maven.

### Tener la versión del proyecto definida
Significa que el proyecto expresa qué versión quiere usar para compilar.

Eso es mucho más serio y portable.

---

## Error común 1 — no declarar ninguna versión de Java

Muchos proyectos chicos arrancan así.
Y al principio parece no pasar nada.
Pero a medida que el proyecto crece o cambia de entorno,
empiezan los problemas.

---

## Error común 2 — hardcodear números en varios lugares

Por ejemplo:

```xml
<maven.compiler.source>21</maven.compiler.source>
<maven.compiler.target>21</maven.compiler.target>
```

No está “mal”.
Pero si además repetís la versión en otros lados,
conviene más centralizarla con:

```xml
<java.version>21</java.version>
```

---

## Error común 3 — pensar que `source` y `target` son puro detalle técnico irrelevante

No.
Afectan directamente el build y la compatibilidad de tu proyecto.

---

## Error común 4 — declarar una versión que no coincide con lo que realmente usás

Eso puede dejar un `pom.xml` prolijo,
pero desconectado de la realidad del proyecto.

Conviene que la configuración sea clara **y** verdadera.

---

## Una intuición muy útil

Podés pensarlo así:

> la versión de Java del proyecto no debería ser una sorpresa; debería estar escrita.

Esa frase vale muchísimo.

---

## Qué relación tiene esto con properties

Este tema es una continuación muy natural del anterior.

Ya viste que `properties` sirven para:

- versiones de dependencias
- encoding
- valores reutilizables

Ahora ves que también sirven para una de las decisiones más importantes del build:
- la versión de Java

Eso muestra algo muy bueno:
- el `pom.xml` cada vez se vuelve más expresivo y más ordenado

---

## Qué relación tiene esto con proyectos reales

Muchísima.

En proyectos reales es muy común encontrar un bloque de `properties` donde aparecen cosas como:

```xml
<java.version>17</java.version>
<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
```

porque esas decisiones conviene tenerlas:

- visibles
- centralizadas
- fáciles de mantener

Y este tema te empieza a acostumbrar a esa forma de trabajar.

---

## Ejercicio 3 — dejar tu bloque properties mejor armado

Quiero que tu bloque `properties` quede razonablemente ordenado.

Por ejemplo:

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <java.version>21</java.version>
    <maven.compiler.source>${java.version}</maven.compiler.source>
    <maven.compiler.target>${java.version}</maven.compiler.target>
    <commons.lang3.version>3.14.0</commons.lang3.version>
    <junit.version>4.13.2</junit.version>
</properties>
```

No hace falta que esté exactamente igual,
pero sí que se note:

- encoding
- Java
- versiones importantes

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Agregá `java.version` a tu `pom.xml`.

### Ejercicio 2
Agregá:
- `maven.compiler.source`
- `maven.compiler.target`

usando `${java.version}`.

### Ejercicio 3
Corré:

```bash
mvn clean compile
```

### Ejercicio 4
Corré:

```bash
mvn -version
```

### Ejercicio 5
Compará la versión Java del entorno con la versión declarada en el `pom.xml`.

### Ejercicio 6
Escribí con tus palabras por qué conviene declarar la versión de Java del proyecto.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Por qué conviene fijar la versión de Java en un proyecto Maven?
2. ¿Qué representan `maven.compiler.source` y `maven.compiler.target` en un nivel inicial?
3. ¿Qué ventaja tiene usar `java.version` como property central?
4. ¿Qué diferencia hay entre “tener Java instalado” y “tener la versión del proyecto declarada”?
5. ¿Qué comando te permite ver con qué Java está corriendo Maven?

---

## Mini desafío

Creá un proyecto nuevo, por ejemplo:

- `java-version-demo-maven`

Y hacé esto:

1. agregá `java.version`
2. agregá `maven.compiler.source`
3. agregá `maven.compiler.target`
4. corré `mvn clean compile`
5. corré `mvn -version`
6. escribí una nota breve explicando qué versión de Java espera usar ese proyecto

Tu objetivo es acostumbrarte a declarar esta decisión de forma explícita.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este decimotercer tema, ya deberías poder:

- entender por qué conviene fijar la versión de Java del proyecto
- usar `java.version` como property central
- configurar `maven.compiler.source` y `maven.compiler.target`
- relacionar la configuración del proyecto con el entorno real de Maven
- y dejar el build un poco más serio, claro y predecible

---

## Resumen del tema

- La versión de Java del proyecto conviene declararla explícitamente.
- `source` y `target` ayudan a expresar cómo querés compilar.
- Centralizar esa decisión con `java.version` ordena mucho el `pom.xml`.
- `mvn -version` te ayuda a ver con qué Java está corriendo Maven en tu entorno.
- Un proyecto más claro no debería depender demasiado del azar de la máquina donde se compila.
- Ya empezaste a controlar una de las decisiones más importantes del build.

---

## Próximo tema

En el próximo tema vas a aprender a mirar mejor el árbol de dependencias de Maven y a entender de dónde salen algunas librerías que no agregaste directamente, porque después de ordenar el `pom.xml` con properties y versión de Java, el siguiente paso natural es empezar a ver cómo Maven resuelve dependencias de forma más profunda y no solo las que declarás vos explícitamente.
