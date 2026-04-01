---
title: "Cambiar el repositorio local de Maven con settings.xml"
description: "Vigésimo quinto tema práctico del curso de Maven: aprender qué es el repositorio local de Maven, cómo cambiar su ubicación usando settings.xml y por qué esta configuración pertenece al entorno y no al proyecto."
order: 25
module: "Configuración por contexto y entornos"
level: "base"
draft: false
---

# Cambiar el repositorio local de Maven con `settings.xml`

## Objetivo del tema

En este vigésimo quinto tema vas a:

- entender mejor qué es el repositorio local de Maven
- aprender cómo cambiar su ubicación usando `settings.xml`
- distinguir entre configuración del entorno y configuración del proyecto
- verificar el efecto real de ese cambio
- comprender por qué esta clase de ajuste conviene vivir fuera del `pom.xml`

La idea es que uses `settings.xml` para tocar una configuración concreta y visible del entorno Maven, y así termines de afianzar que Maven no se define solo desde el proyecto.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- entender qué es `settings.xml`
- ubicar la carpeta `.m2`
- distinguir entre configuración del proyecto y configuración del entorno
- usar `profiles` en `pom.xml` y en `settings.xml` en un nivel inicial

Si hiciste los temas anteriores, ya estás listo para este paso.

---

## Idea central del tema

Ya viste que Maven descarga e instala artefactos en un repositorio local.

Normalmente, ese repositorio está en una ruta como:

```text
~/.m2/repository
```

o, en Windows:

```text
C:\Users\TU_USUARIO\.m2\repository
```

Pero esa ubicación no es un mandato intocable.
Maven permite cambiarla.

Y acá aparece una idea muy importante:

> la ubicación del repositorio local es una decisión del entorno Maven de una máquina, no de la identidad del proyecto; por eso tiene sentido configurarla en `settings.xml` y no en el `pom.xml`.

---

## Qué es el repositorio local de Maven

Es la carpeta donde Maven guarda artefactos como:

- dependencias descargadas
- plugins descargados
- artefactos que instalás con `mvn install`
- metadatos relacionados con esas resoluciones

Dicho simple:

> el repositorio local es el almacén local de artefactos que Maven usa en tu máquina.

---

## Qué diferencia hay entre el proyecto y el repositorio local

El proyecto vive en su carpeta, con cosas como:

- `pom.xml`
- `src/`
- `target/`

El repositorio local vive fuera del proyecto y sirve como almacenamiento reutilizable para Maven.

Entonces aparece otra idea importante:

> el repositorio local no pertenece a un solo proyecto; es un recurso compartido por Maven en tu entorno.

---

## Por qué alguien querría cambiarlo

Puede haber muchos motivos prácticos:

- querés moverlo a otro disco
- querés separarlo de tu perfil de usuario por organización
- querés usar una carpeta específica para pruebas
- querés evitar que crezca demasiado en cierto lugar
- querés controlar mejor dónde Maven guarda artefactos

No hace falta que hoy tengas una necesidad enorme.
Lo importante es que entiendas cómo se hace y por qué esta configuración pertenece al entorno.

---

## Una intuición muy útil

Podés pensarlo así:

- `pom.xml` dice qué proyecto tenés
- `settings.xml` puede decir dónde Maven guarda sus cosas en tu máquina

Esta diferencia ya ordena muchísimo.

---

## Dónde se configura el repositorio local

Dentro de `settings.xml`, usando un bloque como este:

```xml
<settings ...>
    <localRepository>C:/ruta/que-vos-quieras/maven-repo</localRepository>
</settings>
```

Ese elemento le dice a Maven:
- usá esta carpeta como repositorio local

---

## Primer ejemplo simple

Supongamos que querés usar algo como:

```text
C:\maven-repo-local
```

Tu `settings.xml` podría tener:

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 https://maven.apache.org/xsd/settings-1.0.0.xsd">

    <localRepository>C:/maven-repo-local</localRepository>

</settings>
```

En Windows suele ser más cómodo usar barras `/` dentro del XML,
aunque conceptualmente la ruta sea la misma.

---

## Qué conviene entender antes de probarlo

Cuando cambies la ubicación del repositorio local,
Maven puede empezar a usar esa nueva carpeta como si fuera su repositorio principal.

Eso significa que:

- si la carpeta está vacía,
  Maven tendrá que volver a descargar dependencias y plugins que antes ya tenía en `.m2/repository`
- el cambio es visible y real
- y afecta a tu entorno Maven, no al contenido del proyecto en sí

Entonces aparece una verdad importante:

> cambiar el repositorio local no cambia el proyecto; cambia dónde Maven guarda y busca artefactos en tu máquina.

---

## Primer experimento práctico

Quiero que hagas esto de forma controlada.

### Paso 1
Elegí una carpeta nueva para probar.
Por ejemplo:

```text
C:/maven-repo-prueba
```

### Paso 2
Abrí tu `settings.xml`.

### Paso 3
Agregá:

```xml
<localRepository>C:/maven-repo-prueba</localRepository>
```

### Paso 4
Guardá el archivo.

### Paso 5
Volvé a tu proyecto y corré algo como:

```bash
mvn clean test
```

## Qué deberías observar

Si la carpeta nueva estaba vacía,
Maven probablemente vuelva a descargar cosas.

Eso te confirma que está usando la nueva ubicación.

---

## Cómo verificar el efecto del cambio

Podés verificarlo de varias formas.

### Forma 1
Mirando si la carpeta nueva empieza a llenarse de artefactos.

### Forma 2
Observando que Maven vuelve a descargar cosas que antes ya estaban cacheadas en otra ubicación.

### Forma 3
Más conceptualmente:
si corriste `mvn install`, ver si el artefacto se instala en la nueva carpeta.

Estas señales ya son bastante claras.

---

## Ejercicio 1 — ver el cambio en acción

Quiero que hagas esto:

### Paso 1
Anotá dónde está tu repositorio local habitual.

### Paso 2
Configurá una carpeta nueva en `settings.xml`.

### Paso 3
Corré un build como:

```bash
mvn clean package
```

o

```bash
mvn clean test
```

### Paso 4
Mirá si esa carpeta nueva se llenó de contenido Maven.

### Objetivo
Comprobar con tus propios ojos que el cambio realmente afectó el comportamiento de Maven.

---

## Qué relación tiene esto con settings.xml

Total.

Este es justamente uno de los mejores ejemplos de algo que **debería** vivir en `settings.xml` y no en el `pom.xml`.

¿Por qué?
Porque la ubicación del repositorio local:

- depende de tu máquina
- depende de tu entorno
- no define la naturaleza del proyecto
- no debería forzar a otras personas a usar la misma carpeta

Entonces aparece una idea muy importante:

> la ubicación del repositorio local es una decisión local de Maven, no una decisión que el proyecto deba imponerle a todo el mundo.

---

## Qué no conviene hacer

No conviene:

- intentar meter esta clase de decisión en el `pom.xml`
- asumir que todas las personas del equipo deberían compartir la misma ruta local
- cambiar el repositorio local sin entender que Maven puede volver a descargar bastante cosa
- olvidarte después de que hiciste el cambio y sorprenderte porque `.m2/repository` dejó de crecer

---

## Error común 1 — creer que cambiar el repositorio local modifica el proyecto

No.
El proyecto sigue siendo el mismo.

Lo que cambia es:
- el lugar donde Maven guarda y busca artefactos localmente.

---

## Error común 2 — no entender por qué Maven vuelve a descargar cosas

Si cambiaste el repositorio a una carpeta nueva y vacía,
eso es normal.

Maven no “perdió la memoria”.
Simplemente está usando otro almacén local.

---

## Error común 3 — olvidar revertir la configuración si era solo una prueba

Si hiciste esto para aprender o para una práctica puntual,
conviene que después decidas conscientemente:

- dejarlo así
o
- volver al comportamiento anterior

No lo dejes “porque sí” sin saber qué quedó activo en tu entorno.

---

## Error común 4 — pensar que `.m2/repository` es obligatorio e inmutable

Es la ubicación habitual por defecto,
pero no la única posible.

Y este tema justamente te lo demuestra.

---

## Una intuición muy útil

Podés pensarlo así:

> el repositorio local es una pieza del entorno Maven, no una parte fija e inseparable del proyecto.

Esa frase vale muchísimo.

---

## Ejercicio 2 — instalar un artefacto y ver dónde queda

Este ejercicio es muy bueno para cerrar el concepto.

### Paso 1
Con la nueva ubicación configurada,
corré:

```bash
mvn clean install
```

### Paso 2
Buscá dentro de la nueva carpeta del repositorio local el artefacto de tu proyecto,
siguiendo la ruta por:

- `groupId`
- `artifactId`
- `version`

### Objetivo
Ver que no solo las dependencias descargadas van ahí,
sino también los artefactos que vos instalás localmente.

---

## Qué relación tiene esto con lo que ya aprendiste sobre install

Muy fuerte.

En temas anteriores viste que:

```bash
mvn install
```

pone tu artefacto en el repositorio local.

Bueno:
ahora terminás de entender mejor qué significa eso,
porque ya sabés que ese repositorio local:

- es configurable
- vive fuera del proyecto
- y pertenece a la capa de entorno Maven

Eso conecta perfecto los temas.

---

## Qué relación tiene esto con equipos reales

Muchísima.

Aunque cada persona puede tener su propia configuración local,
el proyecto sigue siendo el mismo.

Esa separación es muy sana:

- el proyecto se mantiene portable
- el entorno local sigue siendo ajustable

Por eso este tema no es solo técnico.
También es una lección de arquitectura de configuración.

---

## Ejercicio 3 — pensar el criterio de ubicación

Respondé esto por escrito:

> ¿Por qué tendría sentido que cada persona o máquina pueda tener un repositorio local distinto sin que eso cambie el proyecto Maven en sí?

La idea es que no te quedes solo con la mecánica,
sino también con la lógica.

---

## Qué no conviene olvidar

Este tema no pretende que cambies para siempre tu repositorio local si no lo necesitás.

Lo que sí quiere dejarte es una comprensión muy fuerte:

- el repositorio local pertenece al entorno
- `settings.xml` es el lugar lógico para esa clase de cambio
- y Maven está pensado para permitir ese tipo de ajuste sin tocar la identidad del proyecto

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Ubicá tu repositorio local actual.

### Ejercicio 2
Elegí una carpeta nueva de prueba.

### Ejercicio 3
Configurala en `settings.xml` con `localRepository`.

### Ejercicio 4
Corré:

```bash
mvn clean test
```

o:

```bash
mvn clean package
```

### Ejercicio 5
Verificá que la nueva carpeta se empiece a llenar.

### Ejercicio 6
Corré:

```bash
mvn clean install
```

### Ejercicio 7
Buscá el artefacto de tu proyecto dentro del nuevo repositorio.

### Ejercicio 8
Escribí con tus palabras por qué este cambio pertenece al entorno y no al proyecto.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es el repositorio local de Maven?
2. ¿Dónde suele estar por defecto?
3. ¿Cómo se cambia su ubicación?
4. ¿Por qué esta configuración conviene en `settings.xml` y no en `pom.xml`?
5. ¿Qué señal práctica muestra que Maven realmente empezó a usar el nuevo repositorio?

---

## Mini desafío

Hacé una práctica completa y controlada:

1. elegí una carpeta nueva de prueba
2. configurala en `settings.xml`
3. corré `mvn clean install` en un proyecto
4. verificá que se descarguen dependencias o que se instale el artefacto ahí
5. escribí una nota breve explicando:
   - qué cambió
   - qué no cambió
   - y por qué eso demuestra que el repositorio local es parte del entorno Maven

Tu objetivo es que `settings.xml` deje de ser un archivo “posible” y pase a sentirse como una herramienta real para gobernar tu entorno local.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este vigésimo quinto tema, ya deberías poder:

- entender qué es el repositorio local de Maven
- cambiar su ubicación desde `settings.xml`
- verificar el efecto real del cambio
- distinguir con mucha más claridad entre entorno Maven y proyecto Maven
- y usar una de las configuraciones locales más visibles de toda la herramienta

---

## Resumen del tema

- El repositorio local de Maven es el almacén local de artefactos en tu máquina.
- Por defecto suele vivir en `.m2/repository`, pero puede cambiarse.
- La ubicación del repositorio local pertenece al entorno, no al proyecto.
- `settings.xml` es el lugar lógico para ese tipo de configuración.
- Cambiar el repositorio local no cambia el proyecto; cambia dónde Maven guarda y busca artefactos.
- Ya usaste `settings.xml` para una modificación concreta y muy visible del comportamiento local de Maven.

---

## Próximo tema

En el próximo tema vas a aprender a trabajar con mirrors en un nivel inicial, porque después de entender cómo `settings.xml` puede cambiar dónde Maven guarda cosas localmente, el siguiente paso natural es ver cómo también puede influir en desde dónde intenta obtener artefactos hacia tu entorno.
