---
title: "Verificar versiones efectivas con dependencyManagement y dependency:tree"
description: "Decimoctavo tema práctico del curso de Maven: aprender a comprobar si dependencyManagement está gobernando realmente las versiones resueltas del proyecto usando dependency:tree y una lectura más consciente del resultado final."
order: 18
module: "Resolución y control de dependencias"
level: "base"
draft: false
---

# Verificar versiones efectivas con `dependencyManagement` y `dependency:tree`

## Objetivo del tema

En este decimoctavo tema vas a:

- comprobar si la versión que administraste en `dependencyManagement` es la que realmente termina usando el proyecto
- combinar `dependencyManagement` con `mvn dependency:tree`
- aprender a distinguir entre versión declarada y versión efectivamente resuelta
- ver por qué centralizar una versión no alcanza si después no verificás la resolución real
- reforzar una forma más madura de trabajar con Maven: no solo declarar, también comprobar

La idea es que no te quedes con la sensación de que “ya centralicé la versión, así que listo”, sino que aprendas a mirar qué quedó realmente en el árbol final de dependencias.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- usar `properties`
- leer el árbol de dependencias
- detectar directas y transitivas
- entender exclusiones básicas
- usar `dependencyManagement` para centralizar versiones

Si hiciste los temas anteriores, ya tenés una base muy buena para este paso.

---

## Idea central del tema

En el tema anterior viste que `dependencyManagement` sirve para centralizar y gobernar versiones.
Eso está buenísimo.
Pero todavía falta una parte fundamental:

> comprobar que la resolución final del proyecto realmente quedó como vos querías.

Porque una cosa es lo que declarás.
Y otra, ligeramente distinta, es lo que Maven termina resolviendo en el árbol real.

Entonces aparece una idea muy importante:

> en Maven no alcanza con declarar una política de versiones; también conviene verificar la versión efectiva que quedó en el proyecto.

---

## Qué significa “versión efectiva”

Es la versión concreta de una dependencia que Maven termina usando al resolver el proyecto.

No necesariamente es solo “la que vos escribiste en cualquier lugar”.
Es la que quedó después de que Maven combinó:

- dependencias directas
- dependencias transitivas
- manejo de versiones
- `dependencyManagement`
- y reglas de resolución

Dicho simple:

> la versión efectiva es la versión real que quedó viva en el árbol.

---

## Una intuición muy útil

Podés pensarlo así:

- versión declarada = lo que vos escribís
- versión efectiva = lo que Maven realmente usa

Esa diferencia parece chica,
pero es importantísima.

---

## Qué herramienta sigue siendo clave

Otra vez:

```bash
mvn dependency:tree
```

Pero ahora la pregunta cambia un poco.

Antes preguntabas:
- ¿qué dependencias hay?
- ¿de qué rama vienen?

Ahora también vas a preguntar:
- ¿qué versión quedó efectivamente?
- ¿coincide con la que administré?

Esa ya es una lectura más madura.

---

## Primer experimento: administrar una versión simple y verificarla

Supongamos que dejaste algo así:

```xml
<properties>
    <commons.lang3.version>3.14.0</commons.lang3.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.apache.commons</groupId>
            <artifactId>commons-lang3</artifactId>
            <version>${commons.lang3.version}</version>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.apache.commons</groupId>
        <artifactId>commons-lang3</artifactId>
    </dependency>
</dependencies>
```

Ahora corré:

```bash
mvn dependency:tree
```

## Qué deberías ver

Algo parecido a:

```text
[INFO] +- org.apache.commons:commons-lang3:jar:3.14.0:compile
```

## Qué acabás de comprobar

Que la versión efectiva coincide con la que administraste.

Ese paso de verificación ya es muy valioso.

---

## Por qué este paso importa aunque el proyecto sea chico

Porque te forma una costumbre muy buena:

- no asumir
- comprobar

Y eso más adelante te salva muchísimo tiempo cuando el árbol empieza a crecer.

Entonces aparece una verdad importante:

> cuanto más crece el proyecto, más valor tiene la costumbre de verificar la resolución real y no solo confiar en lo que recordás haber declarado.

---

## Segundo experimento: cambiar la versión administrada

Hacé una prueba controlada.

### Paso 1
Si tenés esto:

```xml
<commons.lang3.version>3.14.0</commons.lang3.version>
```

cambialo, por ejemplo, a:

```xml
<commons.lang3.version>3.13.0</commons.lang3.version>
```

### Paso 2
Corré:

```bash
mvn dependency:tree
```

## Qué deberías observar

La versión efectiva de `commons-lang3` debería reflejar el cambio,
siempre que no haya otra intervención rara en el proyecto.

Eso confirma algo muy importante:

- cambiaste la política central
- y el árbol real respondió

---

## Qué aprendiste con esto

Que `dependencyManagement` no es solo un bloque “bonito”.
Puede afectar realmente la resolución efectiva.
Pero justamente por eso conviene verificar siempre que el árbol haya quedado como esperabas.

---

## Qué pasa si no verificás

Podría pasar que:

- pienses que una versión quedó gobernada
- pero en realidad haya otra situación en el árbol
- o hayas dejado una declaración que no está actuando como suponías
- o una dependencia siga viniendo por otro camino

Entonces aparece otra idea importante:

> sin verificación, `dependencyManagement` puede darte una sensación de control mayor de la que realmente tenés.

---

## Primer ejercicio práctico importante

Quiero que hagas esto:

### Paso 1
Elegí una dependencia que hayas puesto en `dependencyManagement`.

### Paso 2
Corré:

```bash
mvn dependency:tree
```

### Paso 3
Buscá esa dependencia en la salida.

### Paso 4
Anotá:
- la versión administrada
- la versión efectiva que aparece en el árbol

### Objetivo
Confirmar explícitamente que ambas coinciden.

---

## Qué relación tiene esto con conflictos de versiones

Muchísima.

En el tema 16 viste que pueden existir varias versiones candidatas o al menos zonas del árbol donde la resolución se vuelve menos trivial.

Bueno:
`dependencyManagement` aparece justamente como una herramienta para decir:

- “quiero gobernar esta versión”

Y `dependency:tree` aparece como la herramienta para verificar:

- “efectivamente quedó esta versión”

O sea:

> una herramienta declara la política y la otra te muestra si la política se plasmó en la resolución real.

Esa dupla es central en Maven.

---

## Una intuición muy útil

Podés pensarlo así:

- `dependencyManagement` = intención de control
- `dependency:tree` = evidencia de control

Esa frase vale muchísimo.

---

## Qué pasa con dependencias transitivas

Acá el tema se vuelve todavía más interesante.

Porque no solo podés centralizar dependencias que agregás vos directamente.
También, en muchos casos, querés gobernar versiones de cosas que podrían aparecer transitivamente.

No hace falta abrir todavía todos los matices más pesados de esto.
Lo importante por ahora es entender que:

- la resolución real puede involucrar librerías que vos no declaraste como uso directo
- y que justamente por eso el árbol sigue siendo indispensable

---

## Ejercicio 2 — elegir una dependencia transitiva visible y observarla

Quiero que hagas esto:

### Paso 1
Corré:

```bash
mvn dependency:tree
```

### Paso 2
Elegí una dependencia transitiva que aparezca claramente.

### Paso 3
Anotá:
- de qué rama viene
- qué versión aparece
- si esa versión te parece coherente con la política general del proyecto

No hace falta que todavía la administres.
La idea es que empieces a pensar ya en términos de:
- versión efectiva
- no solo presencia

---

## Qué significa que una versión “gane”

En este nivel inicial,
cuando decimos que una versión “gana” queremos decir:

- esa es la que terminó viva en la resolución final
- esa es la que aparece en el árbol real
- esa es la que tu proyecto efectivamente usa en ese punto de la resolución

No hace falta todavía abrir todos los detalles internos de mediación.
Por ahora, alcanza con poder responder:
- “¿qué versión quedó finalmente?”

---

## Error común 1 — creer que centralizar es sinónimo de confirmar

No.
Centralizar ayuda muchísimo,
pero confirmar requiere mirar la resolución real.

---

## Error común 2 — no volver al árbol después de tocar dependencyManagement

Ese es justamente uno de los hábitos más importantes que quiero que te lleves de este tema.

---

## Error común 3 — leer el árbol solo como lista de librerías

A esta altura ya conviene leerlo también como:
- mapa de versiones resueltas
- evidencia del estado real del proyecto

---

## Error común 4 — pensar que la versión que aparece en properties ya es automáticamente la verdad final

No necesariamente.
La verdad final práctica es la que el árbol resuelto te muestra.

---

## Ejercicio 3 — probar antes y después de un cambio real

Hacé este flujo completo:

### Paso 1
Dejá una dependencia administrada en `dependencyManagement`.

### Paso 2
Corré:

```bash
mvn dependency:tree
```

y guardá la versión que aparece.

### Paso 3
Cambiá la property o la versión centralizada.

### Paso 4
Volvé a correr:

```bash
mvn dependency:tree
```

### Paso 5
Compará ambas salidas.

### Objetivo
Sentir con claridad la diferencia entre:
- política vieja
- política nueva
- versión efectiva antes
- versión efectiva después

---

## Qué relación tiene esto con un pom más serio

Muy fuerte.

A esta altura tu `pom.xml` ya puede empezar a parecerse más a uno de proyecto real si tiene:

- `properties`
- versión Java centralizada
- versiones de dependencias centralizadas
- `dependencyManagement`
- y uso real en `dependencies`

Pero un `pom.xml` serio no es solo uno “lindo”.
También es uno donde:
- lo declarado coincide con lo resuelto

Y esta verificación ayuda justamente a eso.

---

## Una intuición muy útil

Podés pensarlo así:

> un buen `pom.xml` no solo expresa intención; también produce el árbol que esperabas.

Esa frase vale muchísimo.

---

## Qué no conviene olvidar

No hace falta que elijas veinte dependencias para practicar esto.
Con una o dos ya alcanza muy bien.

Lo importante es formar el hábito:
1. centralizar
2. usar
3. verificar en el árbol

Ese mini ciclo vale muchísimo más que leer teoría sin practicar.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Elegí una dependencia administrada en `dependencyManagement`.

### Ejercicio 2
Corré:

```bash
mvn dependency:tree
```

### Ejercicio 3
Ubicá su versión efectiva.

### Ejercicio 4
Cambiá la versión centralizada.

### Ejercicio 5
Volvé a correr:

```bash
mvn dependency:tree
```

### Ejercicio 6
Compará el antes y el después.

### Ejercicio 7
Escribí con tus palabras por qué no alcanza con declarar una versión si después no verificás la resolución final.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es una versión efectiva en Maven?
2. ¿Qué diferencia hay entre versión declarada y versión efectiva?
3. ¿Qué herramienta usás para comprobar qué versión quedó realmente?
4. ¿Qué relación hay entre `dependencyManagement` y `dependency:tree`?
5. ¿Por qué conviene verificar el árbol después de cambiar una versión centralizada?

---

## Mini desafío

Creá un proyecto nuevo, por ejemplo:

- `version-efectiva-demo`

Y hacé esto:

1. agregá una dependencia
2. administrá su versión en `dependencyManagement`
3. usala en `dependencies`
4. corré `mvn dependency:tree`
5. anotá la versión efectiva
6. cambiá la versión centralizada
7. corré otra vez el árbol
8. escribí una nota breve explicando qué cambió realmente

Tu objetivo es que la relación entre:
- política de versiones
- y árbol resuelto

te quede completamente clara.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este decimoctavo tema, ya deberías poder:

- entender qué es una versión efectiva
- comprobar si `dependencyManagement` está gobernando realmente una dependencia
- usar `dependency:tree` como herramienta de verificación y no solo de inspección general
- leer con más intención la resolución final del proyecto
- y trabajar con Maven de una forma bastante más seria y consciente

---

## Resumen del tema

- `dependencyManagement` centraliza y gobierna versiones.
- `dependency:tree` permite comprobar qué versión quedó realmente en el proyecto.
- La versión declarada y la efectiva no conviene tratarlas como si fueran exactamente lo mismo sin verificar.
- El hábito sano es: centralizar, usar y comprobar.
- Esta forma de trabajo te da mucho más control sobre la resolución real.
- Ya empezaste a usar Maven no solo para declarar dependencias, sino también para validar que la resolución final coincida con tu intención.

---

## Próximo tema

En el próximo tema vas a aprender a generar el effective POM, porque después de trabajar con properties, dependencyManagement y resolución real, el siguiente paso natural es ver la versión expandida y efectiva del `pom.xml` que Maven está usando realmente detrás de escena.
