---
title: "Entender package, install y el repositorio local de Maven"
description: "Sexto tema práctico del curso de Maven: entender la diferencia entre package e install, qué es el repositorio local de Maven y cómo comprobar en la práctica dónde quedan los artefactos generados."
order: 6
module: "Fundamentos de Maven"
level: "intro"
draft: false
---

# Entender `package`, `install` y el repositorio local de Maven

## Objetivo del tema

En este sexto tema vas a:

- entender bien la diferencia entre `mvn package` y `mvn install`
- aprender qué es el repositorio local de Maven
- ver dónde guarda Maven los artefactos
- comprobar en la práctica qué cambia cuando ejecutás `install`
- entender por qué `install` puede servirle a otros proyectos Maven en tu máquina

La idea es que dejes de ejecutar `install` por costumbre sin saber bien qué agrega respecto de `package`.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- agregar dependencias
- entender la lógica general del lifecycle
- ejecutar:
  - `mvn compile`
  - `mvn test`
  - `mvn package`
  - `mvn install`

Si hiciste los temas anteriores, ya estás listo para entender este paso con más profundidad.

---

## Idea central del tema

Mucha gente al principio usa:

```bash
mvn install
```

para todo.

Y aunque eso a veces funciona, no siempre es necesario.

La diferencia importante es esta:

> `package` construye el artefacto para este proyecto.
> `install` además lo copia al repositorio local de Maven para que otros proyectos de tu máquina puedan usarlo como dependencia.

Esa es la idea clave del tema.

---

## Qué hace `mvn package`

Cuando ejecutás:

```bash
mvn package
```

Maven lleva el proyecto hasta la fase `package`.

Eso normalmente implica:

- compilar
- correr tests
- generar el artefacto, por ejemplo un `.jar`

En un proyecto simple como el tuyo, el resultado importante suele quedar en:

```text
target/nombre-del-artefacto-version.jar
```

Ejemplo:

```text
target/mi-primer-proyecto-maven-0.1.0-SNAPSHOT.jar
```

---

## Qué hace `mvn install`

Cuando ejecutás:

```bash
mvn install
```

Maven hace todo lo anterior:

- compila
- testea
- empaqueta

Y además:

- instala el artefacto en tu repositorio local de Maven

Ese repositorio local es una carpeta especial donde Maven guarda:

- dependencias descargadas
- plugins descargados
- artefactos generados por tus propios proyectos cuando hacés `install`

---

## Resumen rápido

### `package`
Genera el artefacto dentro del proyecto actual.

### `install`
Genera el artefacto y lo instala en el repositorio local.

---

## Qué es el repositorio local

Es una carpeta en tu máquina donde Maven guarda artefactos para reutilizarlos.

En Windows suele estar en una ruta como:

```text
C:\Users\TU_USUARIO\.m2\repository
```

Ahí Maven almacena cosas organizadas por:

- `groupId`
- `artifactId`
- `version`

O sea, no es una carpeta desordenada.
Tiene una estructura relacionada con las coordenadas Maven.

---

## Una intuición muy útil

Podés pensarlo así:

- `target` es el resultado local del build dentro del proyecto
- `.m2/repository` es el almacén local general de Maven para tu máquina

Esta diferencia ordena muchísimo.

---

## Primer experimento práctico: mirar qué deja `package`

Ubicate en tu proyecto y ejecutá:

```bash
mvn package
```

Cuando termine, mirá dentro de `target`.

Deberías ver algo parecido a:

```text
target/
├── classes/
├── test-classes/
├── maven-status/
├── surefire-reports/
└── mi-primer-proyecto-maven-0.1.0-SNAPSHOT.jar
```

## Qué tenés que observar

El `.jar` queda dentro del proyecto,
en `target`.

Todavía no estás mirando el repositorio local.

---

## Segundo experimento práctico: ejecutar `install`

Ahora corré:

```bash
mvn install
```

Cuando termine, volvé a mirar `target`.

Probablemente se vea casi igual.
Porque el `.jar` sigue estando ahí.

Entonces podrías preguntarte:
- “¿qué cambió?”

La diferencia no está principalmente en `target`.
La diferencia importante está en:
- el repositorio local

---

## Cómo encontrar tu artefacto en el repositorio local

Supongamos que tu `pom.xml` tiene esto:

```xml
<groupId>com.gabriel.mavencurso</groupId>
<artifactId>mi-primer-proyecto-maven</artifactId>
<version>0.1.0-SNAPSHOT</version>
```

Entonces Maven va a guardar ese artefacto en una ruta parecida a esta:

```text
C:\Users\TU_USUARIO\.m2\repository\com\gabriel\mavencurso\mi-primer-proyecto-maven\0.1.0-SNAPSHOT
```

Entrá a esa carpeta y fijate qué aparece.

Deberías encontrar archivos como:

```text
mi-primer-proyecto-maven-0.1.0-SNAPSHOT.jar
mi-primer-proyecto-maven-0.1.0-SNAPSHOT.pom
```

A veces puede haber archivos extra según el caso.

---

## Qué aprendiste con esto

Que después de `install`, Maven no solo deja el artefacto en `target`,
sino también en el repositorio local,
en una estructura organizada por coordenadas.

Eso es importantísimo.

---

## ¿Para qué sirve instalarlo en el repositorio local?

Sirve para que otro proyecto Maven de tu máquina pueda depender de ese artefacto como si fuera una librería más.

Dicho simple:

> `install` vuelve tu proyecto reutilizable por otros proyectos locales sin tener que copiar jars a mano.

---

## Ejemplo mental muy importante

Imaginá que tenés dos proyectos:

### Proyecto A
Una librería propia, por ejemplo:
- utilidades
- validaciones
- reglas de negocio
- helpers

### Proyecto B
Una aplicación que quiere usar esa librería.

Si hacés `mvn install` en el Proyecto A,
después el Proyecto B podría declararlo como dependencia,
si usa las mismas coordenadas.

Ese es uno de los grandes sentidos de `install`.

---

## Qué pasa si solo hacés `package`

Si hacés solo:

```bash
mvn package
```

el `.jar` existe dentro de `target`,
pero no queda instalado formalmente en el repositorio local de Maven.

Entonces otros proyectos no lo van a resolver automáticamente como dependencia Maven local,
salvo que hagas pasos extra manuales.

Entonces aparece una idea clave:

> `package` alcanza para construir el artefacto del proyecto actual.
> `install` agrega reutilización local dentro del ecosistema Maven de tu máquina.

---

## Ejercicio 1 — comprobar la diferencia real

### Paso 1
Corré:

```bash
mvn package
```

### Paso 2
Verificá que el `.jar` exista en `target`.

### Paso 3
Corré:

```bash
mvn install
```

### Paso 4
Buscá tu artefacto en:

```text
C:\Users\TU_USUARIO\.m2\repository
```

según sus coordenadas.

### Objetivo
Ver con tus propios ojos que `install` deja una copia organizada en el repositorio local.

---

## ¿Qué guarda Maven además del jar?

Además del `.jar`, Maven suele guardar también el `.pom`.

Eso importa porque Maven no trabaja solo con binarios.
También necesita información del proyecto:

- coordenadas
- dependencias
- metadatos básicos

Por eso el `.pom` también forma parte del artefacto instalado localmente.

---

## Qué relación hay entre `groupId` y carpetas

Esta parte es buenísima para entender Maven de verdad.

Si tu `groupId` es:

```xml
com.gabriel.mavencurso
```

Maven lo convierte en carpetas así:

```text
com/gabriel/mavencurso
```

Después agrega:

- `artifactId`
- `version`

Por eso la estructura final del repositorio local refleja exactamente las coordenadas.

---

## Tercer experimento práctico: cambiar versión y reinstalar

Abrí el `pom.xml` y cambiá la versión.

Por ejemplo:

```xml
<version>0.2.0-SNAPSHOT</version>
```

Ahora corré:

```bash
mvn install
```

Después buscá el artefacto en `.m2/repository`.

## Qué deberías observar

Ahora debería aparecer otra carpeta de versión, por ejemplo:

```text
...\mi-primer-proyecto-maven\0.2.0-SNAPSHOT
```

## Qué aprendiste acá

Que Maven trata cada versión como una identidad distinta.

Eso también es parte central de su lógica.

---

## Cuándo conviene usar `package`

Suele convenir cuando:

- querés verificar que el proyecto construye bien
- necesitás generar el `.jar`
- no necesitás que otro proyecto lo use todavía
- solo querés empaquetar el artefacto actual

---

## Cuándo conviene usar `install`

Suele convenir cuando:

- querés dejar el artefacto disponible en el repositorio local
- otro proyecto Maven lo va a usar
- querés trabajar con varios proyectos relacionados
- querés dejar instalada una versión local reutilizable

---

## Una intuición muy útil

Podés pensarlo así:

- `package` = “construime el artefacto”
- `install` = “construime el artefacto y dejámelo disponible para otros proyectos locales”

Esta formulación es súper práctica.

---

## Error común 1 — usar `install` para todo sin saber por qué

Es muy común.
A veces no pasa nada grave.
Pero igual conviene que entiendas que `install` no siempre hace falta.

Si tu objetivo es solo obtener el `.jar`,
muchas veces alcanza con:

```bash
mvn package
```

---

## Error común 2 — pensar que `target` y `.m2/repository` son lo mismo

No.

### `target`
Pertenece al proyecto actual.

### `.m2/repository`
Es el repositorio local general de Maven para toda tu máquina.

---

## Error común 3 — no entender por qué otro proyecto no encuentra tu librería

Si otro proyecto quiere usar tu artefacto local y vos solo corriste:

```bash
mvn package
```

puede que no lo encuentre como dependencia Maven.

Ahí muchas veces lo que faltaba era:

```bash
mvn install
```

---

## Error común 4 — no mirar las coordenadas

Si el otro proyecto va a usar tu artefacto,
las coordenadas tienen que coincidir:

- `groupId`
- `artifactId`
- `version`

Si algo no coincide,
Maven no va a resolverlo correctamente.

---

## Ejercicio 2 — instalar una versión local “nueva”

Quiero que hagas esto:

### Paso 1
Poné en tu `pom.xml` una versión nueva, por ejemplo:

```xml
<version>0.3.0-SNAPSHOT</version>
```

### Paso 2
Ejecutá:

```bash
mvn install
```

### Paso 3
Buscá esa versión en `.m2/repository`.

### Paso 4
Respondé:
- ¿qué archivos dejó Maven?
- ¿cómo cambió la ruta respecto de la versión anterior?

---

## Mini ejercicio conceptual

Completá con tus palabras:

### `package`
Sirve para...

### `install`
Sirve para...

### `target`
Es...

### `.m2/repository`
Es...

Esto te ordena muchísimo la cabeza.

---

## Mini desafío

Si querés hacer una práctica muy buena, armá dos proyectos.

### Proyecto 1
Una librería simple Maven.
Por ejemplo:
- `saludos-lib`

Con una clase utilitaria.

### Proyecto 2
Otra app Maven.
Por ejemplo:
- `app-que-usa-saludos`

Primero hacé:

```bash
mvn install
```

en el proyecto de librería.

Después declaralo como dependencia en el segundo proyecto.

No hace falta que te salga perfecto ya.
Pero es una práctica excelente para entender de verdad el sentido de `install`.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este sexto tema, ya deberías poder:

- distinguir claramente entre `package` e `install`
- ubicar el `.jar` dentro de `target`
- entender qué es `.m2/repository`
- encontrar tu artefacto local usando sus coordenadas
- comprender por qué `install` vuelve tu proyecto reutilizable para otros proyectos Maven locales
- y dejar de usar `install` solo por costumbre

---

## Resumen del tema

- `package` genera el artefacto del proyecto actual.
- `install` además lo instala en el repositorio local de Maven.
- `target` y `.m2/repository` no son lo mismo.
- El repositorio local organiza artefactos según:
  - `groupId`
  - `artifactId`
  - `version`
- `install` es especialmente útil cuando otros proyectos locales van a usar tu artefacto.
- Ya entendiste una de las diferencias prácticas más importantes del lifecycle básico de Maven.

---

## Próximo tema

En el próximo tema vas a aprender qué es el `scope` de una dependencia con más claridad, porque después de entender cómo Maven construye e instala artefactos, el siguiente paso natural es comprender mejor cómo decide en qué contexto usar cada librería: compilación, runtime o testing.
