---
title: "Usar profiles en Maven: cambiar configuración según el contexto"
description: "Vigésimo primer tema práctico del curso de Maven: aprender qué es un profile, para qué sirve, cómo activarlo y cómo usarlo para variar configuración según el contexto sin duplicar proyectos ni desordenar el pom.xml."
order: 21
module: "Configuración por contexto y entornos"
level: "base"
draft: false
---

# Usar `profiles` en Maven: cambiar configuración según el contexto

## Objetivo del tema

En este vigésimo primer tema vas a:

- entender qué es un `profile` en Maven
- aprender para qué sirve y qué problema resuelve
- ver cómo se define un profile dentro del `pom.xml`
- activarlo desde línea de comandos
- cambiar configuración según el contexto sin duplicar proyectos
- empezar a trabajar con una de las herramientas más útiles de Maven cuando el proyecto necesita comportarse distinto según el entorno

La idea es que dejes de pensar el proyecto como algo completamente rígido y empieces a ver que Maven también permite cambiar ciertas partes del build o de la configuración según el contexto.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- usar `properties`
- usar `dependencyManagement`
- entender scopes básicos
- leer el árbol de dependencias
- reorganizar el `pom.xml` con más claridad
- ejecutar el flujo normal de build

Si venís siguiendo el curso, ya tenés una base muy buena para este paso.

---

## Idea central del tema

Hay situaciones donde un proyecto necesita comportarse distinto según el contexto.

Por ejemplo:

- una propiedad cambia entre desarrollo y producción
- una dependencia extra se usa solo en una variante
- un build tiene un nombre distinto según el entorno
- querés activar algo especial solo en ciertos casos
- no querés mantener dos proyectos casi iguales solo para una diferencia de configuración

Ahí aparece una herramienta muy importante de Maven:

```xml
<profiles>
    ...
</profiles>
```

Dicho simple:

> un profile te permite definir una variante de configuración que Maven puede activar solo cuando hace falta.

---

## Qué es un profile

Un `profile` es un bloque de configuración opcional que se puede activar bajo ciertas condiciones o manualmente.

Cuando se activa, Maven incorpora esa parte al proyecto efectivo.

Entonces aparece una idea muy importante:

> un profile no reemplaza al proyecto principal; agrega o ajusta configuración cuando se cumple cierto contexto.

---

## Una intuición muy útil

Podés pensarlo así:

- el `pom.xml` base define el proyecto normal
- el `profile` define un ajuste o variante que se suma cuando lo activás

Esta imagen ordena muchísimo.

---

## Qué problema resuelve un profile

Evita cosas como:

- duplicar proyectos
- copiar y pegar configuraciones enteras
- tener un `pom.xml` estático para situaciones que en realidad cambian
- meter configuraciones de todos los contextos mezcladas sin control

Entonces aparece una verdad importante:

> `profiles` existe para dar flexibilidad sin romper la unidad del proyecto.

---

## Dónde se define un profile

Dentro del `pom.xml`, suele aparecer un bloque como este:

```xml
<profiles>
    <profile>
        <id>dev</id>
        ...
    </profile>

    <profile>
        <id>prod</id>
        ...
    </profile>
</profiles>
```

Cada `profile` tiene un identificador único dentro del proyecto.

---

## Qué es el `id` de un profile

Es el nombre con el que lo identificás y activás.

Por ejemplo:

```xml
<id>dev</id>
```

o:

```xml
<id>prod</id>
```

Más adelante, cuando quieras activarlo, vas a usar justamente ese `id`.

---

## Primer ejemplo simple

Vamos a hacer algo bien concreto y sencillo:
usar un profile para cambiar una propiedad.

Supongamos que tu `pom.xml` tiene esto:

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <java.version>21</java.version>
    <entorno.nombre>base</entorno.nombre>
</properties>
```

Ahora agregá esto al final del proyecto:

```xml
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <entorno.nombre>desarrollo</entorno.nombre>
        </properties>
    </profile>

    <profile>
        <id>prod</id>
        <properties>
            <entorno.nombre>produccion</entorno.nombre>
        </properties>
    </profile>
</profiles>
```

## Qué significa esto

Por defecto el entorno es:
- `base`

Pero si activás:
- `dev`, pasa a ser `desarrollo`
- `prod`, pasa a ser `produccion`

---

## Qué aprendiste ya

Que un profile puede redefinir una parte de la configuración base sin necesidad de copiar todo el proyecto.

Eso ya es el corazón conceptual del tema.

---

## Cómo se activa un profile desde consola

La forma más común y simple es:

```bash
mvn clean package -Pdev
```

o:

```bash
mvn clean package -Pprod
```

### Qué significa `-P`
Le dice a Maven qué profile querés activar.

---

## Primer experimento práctico

Agregá al proyecto los profiles `dev` y `prod` del ejemplo anterior.

Después corré:

```bash
mvn help:effective-pom -Pdev -Doutput=effective-pom-dev.xml
```

y también:

```bash
mvn help:effective-pom -Pprod -Doutput=effective-pom-prod.xml
```

## Qué deberías observar

En ambos archivos efectivos,
la property `entorno.nombre` debería quedar distinta.

### En `dev`
Debería reflejar:
- `desarrollo`

### En `prod`
Debería reflejar:
- `produccion`

## Qué aprendiste con esto

Que el profile no es una idea abstracta:
realmente cambia la configuración efectiva del proyecto.

---

## Por qué conviene usar effective POM acá

Porque con profiles aparece todavía más la diferencia entre:

- `pom.xml` base
- y proyecto efectivo final

Entonces el comando:

```bash
mvn help:effective-pom
```

se vuelve todavía más útil para verificar:
- qué quedó realmente activo

---

## Qué cosas puede cambiar un profile

En esta etapa inicial no hace falta que cambies veinte cosas.
Pero sí conviene saber que un profile puede tocar, por ejemplo:

- `properties`
- dependencias
- plugins
- build
- repositorios
- y otras partes del proyecto

Hoy vas a enfocarte sobre todo en `properties`, porque es el caso más claro y seguro para aprender.

---

## Ejercicio 1 — crear dos profiles reales

Quiero que hagas esto:

### Paso 1
Agregá una property base:

```xml
<entorno.nombre>base</entorno.nombre>
```

### Paso 2
Creá un profile `dev` que la cambie a:
- `desarrollo`

### Paso 3
Creá un profile `prod` que la cambie a:
- `produccion`

### Paso 4
Generá el effective POM con cada uno:

```bash
mvn help:effective-pom -Pdev -Doutput=effective-pom-dev.xml
mvn help:effective-pom -Pprod -Doutput=effective-pom-prod.xml
```

### Paso 5
Compará ambos archivos.

### Objetivo
Sentir con claridad que el profile cambia el proyecto efectivo.

---

## Qué pasa si no activás ningún profile

Si no activás ninguno,
queda la configuración base del `pom.xml`.

Por eso en el ejemplo pusimos:

```xml
<entorno.nombre>base</entorno.nombre>
```

Eso funciona como valor normal del proyecto.

Entonces aparece otra idea importante:

> el profile modifica o complementa la base, pero si no se activa, la base sigue siendo la referencia principal.

---

## Una intuición muy útil

Podés pensarlo así:

- base = configuración normal
- profile = ajuste opcional sobre la base

Esa distinción es central.

---

## Segundo experimento: usar un profile para agregar una propiedad nueva

Además de reemplazar una propiedad existente, un profile puede agregar una propiedad que no estaba en la base.

Por ejemplo:

```xml
<profiles>
    <profile>
        <id>qa</id>
        <properties>
            <deploy.tipo>prueba-controlada</deploy.tipo>
        </properties>
    </profile>
</profiles>
```

Después, al activar `qa`, esa propiedad aparece en el effective POM.

Esto te muestra que un profile puede:
- redefinir
- o sumar

---

## Qué relación tiene esto con el orden del pom

Muchísima.

Ahora que ya venís ordenando mejor el `pom.xml`,
conviene que el bloque `profiles` quede también en una zona clara,
normalmente hacia la parte baja del archivo,
después de los bloques principales como:

- properties
- dependencyManagement
- dependencies
- build

No es una ley rígida,
pero suele ayudar muchísimo a la legibilidad.

---

## Error común 1 — usar profiles para todo

Los profiles son muy útiles,
pero tampoco conviene meter cualquier pequeña diferencia ahí sin criterio.

Si algo no cambia según contexto,
no hace falta volverlo profile.

Entonces aparece una verdad importante:

> `profiles` sirven cuando hay una variación real de contexto, no solo porque sí.

---

## Error común 2 — mezclar demasiadas cosas distintas dentro de un mismo profile

Si un profile toca demasiadas áreas sin orden,
puede volverse difícil de entender.

En esta etapa conviene que los uses de forma controlada y clara.

---

## Error común 3 — olvidar verificar el resultado efectivo

Con profiles esto es especialmente importante.

No alcanza con escribir el bloque.
Conviene siempre verificar con algo como:

```bash
mvn help:effective-pom -Pdev -Doutput=effective-pom-dev.xml
```

o incluso correr el build correspondiente.

---

## Error común 4 — pensar que el profile “reemplaza” al pom

No.
El proyecto base sigue existiendo.
El profile solo se suma o ajusta cuando se activa.

---

## Ejercicio 2 — profile y build real

Después de crear tus profiles,
corré:

```bash
mvn clean package -Pdev
```

y después:

```bash
mvn clean package -Pprod
```

Aunque el resultado visible no siempre cambie mucho en este ejemplo simple,
la idea es que te acostumbres a trabajar con:
- build base
- build con profile

---

## Qué relación tiene esto con Maven real

Muchísima.

En proyectos reales los profiles se usan para cosas como:

- diferencias entre desarrollo y producción
- variantes de testing
- ajustes de packaging
- activación de ciertas herramientas
- builds especiales para ciertos contextos

No hace falta abrir todos esos escenarios hoy.
Lo importante es que entiendas la mecánica y el rol.

---

## Ejercicio 3 — comparar base vs profile

Quiero que hagas esta práctica:

### Paso 1
Generá un effective POM sin profile:

```bash
mvn help:effective-pom -Doutput=effective-pom-base.xml
```

### Paso 2
Generá uno con `dev`:

```bash
mvn help:effective-pom -Pdev -Doutput=effective-pom-dev.xml
```

### Paso 3
Compará:
- `effective-pom-base.xml`
- `effective-pom-dev.xml`

### Objetivo
Ver de forma concreta qué parte cambió al activar el profile.

---

## Qué no conviene olvidar

Este tema no pretende que ya armes sistemas enormes de perfiles.
Lo que sí quiere dejarte es una base muy clara:

- qué es un profile
- cómo se activa
- cómo modifica la configuración efectiva
- y por qué sirve para trabajar con contexto sin duplicar el proyecto

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Agregá una property base:
- `entorno.nombre=base`

### Ejercicio 2
Creá dos profiles:
- `dev`
- `prod`

### Ejercicio 3
Hacé que cada uno cambie `entorno.nombre`.

### Ejercicio 4
Generá el effective POM con cada uno.

### Ejercicio 5
Corré al menos un build con `-Pdev`.

### Ejercicio 6
Escribí con tus palabras qué diferencia viste entre el proyecto base y el proyecto con profile activo.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es un profile en Maven?
2. ¿Qué problema resuelve?
3. ¿Cómo se activa desde consola?
4. ¿Qué diferencia hay entre la base del proyecto y un profile?
5. ¿Por qué conviene verificar el effective POM cuando usás profiles?

---

## Mini desafío

Creá un proyecto nuevo, por ejemplo:

- `profiles-demo-maven`

Y hacé esto:

1. definí una configuración base
2. agregá un profile `dev`
3. agregá un profile `prod`
4. hacé que cambien una property
5. generá effective POM para los tres casos:
   - base
   - dev
   - prod
6. escribí una nota corta explicando qué se mantiene y qué cambia

Tu objetivo es que `profiles` deje de ser una idea difusa y pase a sentirse como una herramienta concreta de variación controlada.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este vigésimo primer tema, ya deberías poder:

- entender qué es un profile
- activarlo desde línea de comandos
- usarlo para modificar propiedades según el contexto
- verificar su efecto en el effective POM
- y empezar a usar Maven con una lógica más flexible y más realista según entorno

---

## Resumen del tema

- Un profile es una variante de configuración activable en Maven.
- No reemplaza al proyecto base; se suma o lo ajusta cuando se activa.
- Se activa normalmente con `-PnombreDelProfile`.
- Es muy útil para cambiar comportamiento según contexto.
- El effective POM vuelve a ser una herramienta clave para verificar qué cambió realmente.
- Ya diste un paso importante hacia configuraciones Maven más flexibles y más cercanas a proyectos reales.

---

## Próximo tema

En el próximo tema vas a aprender a activar profiles de distintas maneras además de `-P`, porque después de entender el uso manual básico, el siguiente paso natural es ver cómo Maven puede activar perfiles también por condiciones del entorno o del sistema, y qué cuidado conviene tener con eso.
