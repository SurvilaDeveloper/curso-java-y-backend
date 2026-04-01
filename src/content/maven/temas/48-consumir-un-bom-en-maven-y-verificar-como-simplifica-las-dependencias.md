---
title: "Consumir un BOM en Maven y verificar cómo simplifica las dependencias"
description: "Cuadragésimo octavo tema práctico del curso de Maven: aprender a importar un BOM en un caso concreto, usar dependencias gobernadas por esa política sin repetir versiones y verificar con effective POM cómo Maven integra esa alineación en el proyecto."
order: 48
module: "Gobernanza de versiones y ecosistemas"
level: "intermedio"
draft: false
---

# Consumir un BOM en Maven y verificar cómo simplifica las dependencias

## Objetivo del tema

En este cuadragésimo octavo tema vas a:

- importar un BOM en un caso concreto
- usar dependencias gobernadas por ese BOM sin repetir versiones
- verificar con `effective POM` cómo Maven integra esa política
- distinguir mejor entre una dependencia normal y una política importada
- ver de forma práctica por qué un BOM simplifica mucho la gestión de versiones

La idea es que el BOM deje de ser una idea conceptual y pase a sentirse como una herramienta práctica que ordena el `pom.xml` y vuelve más coherente el uso de un ecosistema de librerías relacionadas.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- usar `dependencyManagement`
- distinguir entre administración y uso real de dependencias
- entender la relación entre BOM y `dependencyManagement`
- leer el effective POM
- tener una base sólida de proyectos individuales y multi-módulo en Maven

Si hiciste el tema anterior, ya tenés la base perfecta para este paso.

---

## Idea central del tema

En el tema anterior viste que un BOM:

- no entra como dependencia normal del código
- se importa dentro de `dependencyManagement`
- y trae una política de versiones alineadas para un conjunto de librerías relacionadas

Ahora vas a bajar eso a una práctica concreta.

Entonces aparece una idea muy importante:

> el valor real de un BOM se siente cuando empezás a declarar varias dependencias de un mismo ecosistema sin tener que repetir la versión de cada una.

Eso es justamente lo que vas a practicar acá.

---

## Cómo conviene encarar este tema

No hace falta que elijas hoy un ecosistema enorme ni que armes una integración complicada.
Lo importante es entender el patrón práctico.

En esta etapa, el foco está en:

- la sintaxis de importación
- la diferencia entre política y uso
- cómo se simplifican las dependencias hijas
- cómo verificar el resultado con `effective POM`

Eso ya da muchísimo valor.

---

## Recordatorio del patrón de importación

La forma general vuelve a ser esta:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>...</groupId>
            <artifactId>...</artifactId>
            <version>...</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

## Qué significa esto

Le estás diciendo a Maven:

- importá esta política de versiones
- incorporala a mi capa de administración de dependencias
- y después dejame usar las dependencias de ese ecosistema sin repetir versión una por una

---

## Qué vas a verificar en la práctica

Querés sentir tres cosas muy concretas:

### 1. Antes del BOM
Tus dependencias tendrían que declarar versión una por una.

### 2. Después del BOM
Tus dependencias del ecosistema pueden quedar sin versión explícita.

### 3. Verificación
El `effective POM` y el build deberían mostrar que Maven igual sabe con qué versión trabajar.

Eso es exactamente el corazón del tema.

---

## Primer ejemplo conceptual

Imaginá este caso.

### Sin BOM
```xml
<dependencies>
    <dependency>
        <groupId>com.ejemplo</groupId>
        <artifactId>lib-a</artifactId>
        <version>1.7.0</version>
    </dependency>

    <dependency>
        <groupId>com.ejemplo</groupId>
        <artifactId>lib-b</artifactId>
        <version>1.7.0</version>
    </dependency>
</dependencies>
```

### Con BOM
```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.ejemplo</groupId>
            <artifactId>ecosistema-bom</artifactId>
            <version>1.7.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>com.ejemplo</groupId>
        <artifactId>lib-a</artifactId>
    </dependency>

    <dependency>
        <groupId>com.ejemplo</groupId>
        <artifactId>lib-b</artifactId>
    </dependency>
</dependencies>
```

## Qué ganaste

- menos repetición
- más claridad en la política
- más coherencia del ecosistema
- upgrades más simples

---

## Una intuición muy útil

Podés pensarlo así:

- el BOM fija el “tablero” de versiones
- el proyecto solo elige qué piezas de ese tablero realmente usa

Esa frase vale muchísimo.

---

## Estructura de práctica recomendada

Para este tema, podés trabajar sobre un proyecto sencillo o sobre uno de tus módulos hijos si ya estás en una estructura multi-módulo.

La práctica conceptual mínima es:

- importás un BOM en `dependencyManagement`
- declarás dos dependencias del ecosistema sin versión
- generás el effective POM
- verificás que Maven les asignó versión

No hace falta que el ecosistema sea enorme.
La clave es entender el mecanismo.

---

## Primer experimento práctico

Quiero que hagas esta práctica guiada.

### Paso 1
En tu `pom.xml`, agregá un bloque `dependencyManagement` con una importación de BOM siguiendo la forma:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>...</groupId>
            <artifactId>...</artifactId>
            <version>...</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### Paso 2
Después, en `dependencies`, escribí dos dependencias del mismo ecosistema **sin versión**.

### Paso 3
Guardá el archivo.

### Paso 4
Generá:

```bash
mvn help:effective-pom -Doutput=effective-pom.xml
```

## Qué deberías buscar

Dentro del effective POM,
buscá esas dependencias y verificá que Maven ya las haya integrado con versiones concretas.

---

## Qué aprendiste con esto

Que el BOM no es una idea “externa” ni abstracta.
Se integra realmente al modelo efectivo del proyecto.

Y eso es importantísimo,
porque te muestra que la simplificación del `pom.xml` no ocurre por magia:
ocurre porque Maven incorporó la política importada.

---

## Qué relación tiene esto con build real

También muy fuerte.

Después de importar un BOM y declarar dependencias sin versión,
el proyecto debería seguir pudiendo:

- compilar
- resolver dependencias
- construir su modelo
- y mantener una política coherente

Eso te demuestra que el BOM no es solo documentación:
es una pieza activa del build.

Entonces aparece una verdad importante:

> un BOM útil no solo vuelve el `pom.xml` más corto; vuelve el build más gobernado y más coherente.

---

## Ejercicio 1 — comparar antes y después del BOM

Quiero que hagas esto por escrito:

### Antes del BOM
¿Cómo quedarían escritas dos o tres dependencias del ecosistema?
Con versiones repetidas.

### Después del BOM
¿Cómo quedarían?
Sin versión explícita en cada una.

### Preguntas
- ¿qué parte se volvió más limpia?
- ¿qué parte se volvió más centralizada?
- ¿qué parte se volvió más mantenible?

### Objetivo
Sentir la ganancia más allá de la sintaxis.

---

## Qué diferencia hay entre “menos líneas” y “mejor gobernanza”

Conviene que esto no se reduzca solo a ahorrar escritura.

Un BOM no vale solo porque ahorra líneas.
Vale porque:

- expresa política central
- ayuda a mantener coherencia
- reduce errores de mezcla de versiones
- y facilita upgrades del ecosistema como conjunto

Entonces aparece una idea importante:

> el verdadero valor de un BOM no es que escribís menos, sino que gobernás mejor.

Esa frase vale muchísimo.

---

## Qué relación tiene esto con una raíz multi-módulo

Muy fuerte.

Si ya tenés una raíz multi-módulo,
importar un BOM ahí puede ser especialmente valioso,
porque la política ya no se aplica solo a un proyecto,
sino a todo un sistema de módulos hijos.

Entonces la lógica se vuelve todavía más poderosa:

- la raíz importa el BOM
- los hijos consumen dependencias del ecosistema
- sin repetir versiones
- y todo el sistema queda alineado

Eso ya es claramente Maven real.

---

## Ejercicio 2 — pensar el BOM desde una raíz

Respondé esta pregunta:

> Si tuvieras varios módulos usando librerías del mismo ecosistema, ¿dónde te parecería más lógico importar el BOM: en cada módulo por separado o en la raíz compartida? ¿Por qué?

### Objetivo
Empezar a ver cómo esta herramienta encaja naturalmente en una gobernanza de sistema.

---

## Qué relación tiene esto con dependencyManagement manual

Muy fuerte otra vez.

Podés seguir usando `dependencyManagement` manual cuando:

- son pocas dependencias
- vos controlás perfectamente todas las versiones
- el conjunto no es tan grande

Pero cuando el ecosistema es más amplio,
el BOM empieza a dar un valor enorme.

Entonces aparece una distinción muy útil:

> `dependencyManagement` manual es excelente para control fino local; el BOM es excelente para importar una política coherente ya preparada para un ecosistema mayor.

Eso ayuda muchísimo a decidir cuándo usar cada enfoque.

---

## Una intuición muy útil

Podés pensarlo así:

- `dependencyManagement` manual = escribo mi política
- BOM importado = reutilizo una política ya empaquetada

Esa frase es simple y muy útil.

---

## Qué herramientas conviene usar para verificar

Acá las más valiosas son:

### `mvn help:effective-pom`
Para ver la política efectiva integrada.

### `mvn dependency:tree`
Para ver cómo las dependencias quedaron resueltas dentro del módulo o proyecto.

Eso te da dos ángulos muy complementarios:
- política
- resolución

---

## Ejercicio 3 — revisar también dependency:tree

Después de importar el BOM y declarar dependencias sin versión,
corré también:

```bash
mvn dependency:tree
```

### Qué deberías buscar
Las dependencias del ecosistema con sus versiones resueltas.

### Objetivo
Ver que la política importada no solo aparece en el effective POM,
sino también en la resolución real del proyecto.

---

## Qué no conviene olvidar

Este tema no pretende que ya domines todos los BOMs de todos los ecosistemas.

Tampoco hace falta que armes un caso enorme.

Lo que sí quiere dejarte es una comprensión práctica muy fuerte:

- cómo se importa
- cómo simplifica dependencias
- cómo se verifica
- y por qué esto es muchísimo más que un ahorro de sintaxis

Eso ya es muchísimo.

---

## Error común 1 — pensar que importar el BOM ya mete automáticamente todas las dependencias del ecosistema al proyecto

No.
Otra vez:
- el BOM gobierna
- el proyecto sigue decidiendo qué dependencias usa realmente

---

## Error común 2 — tratar el BOM como si fuera una dependencia normal del código

No.
No lo importás para usar sus clases.
Lo importás para usar su política de versiones.

---

## Error común 3 — no revisar el effective POM después de importar un BOM

Sería perder una de las mejores herramientas para verificar que la política quedó realmente integrada.

---

## Error común 4 — creer que si el `pom.xml` quedó más limpio ya no hace falta entender qué pasó

Al revés:
cuanto más elegante queda la simplificación,
más importante es entender qué mecanismo la hizo posible.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Escribí un bloque de importación de BOM en `dependencyManagement`.

### Ejercicio 2
Declará dos dependencias del ecosistema sin versión explícita.

### Ejercicio 3
Generá:

```bash
mvn help:effective-pom -Doutput=effective-pom.xml
```

### Ejercicio 4
Buscá esas dependencias y verificá sus versiones.

### Ejercicio 5
Corré también:

```bash
mvn dependency:tree
```

### Ejercicio 6
Escribí con tus palabras qué parte del proyecto expresó el uso y qué parte expresó la política de versiones.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué cambia en un `pom.xml` cuando usás un BOM de forma correcta?
2. ¿Qué sigue haciendo el proyecto o módulo aunque importes un BOM?
3. ¿Qué parte hace el BOM y qué parte hace `dependencies`?
4. ¿Por qué el effective POM es tan útil en este tema?
5. ¿Por qué `dependency:tree` sigue siendo valioso acá?

---

## Mini desafío

Hacé una práctica conceptual o real:

1. importá un BOM en `dependencyManagement`
2. declará dos dependencias del ecosistema sin versión
3. generá el effective POM
4. corré `dependency:tree`
5. compará con cómo habría quedado el `pom.xml` si hubieras escrito todas las versiones manualmente
6. escribí una nota breve explicando cómo este tema te mostró una gobernanza de versiones más elegante y más robusta

Tu objetivo es que el BOM deje de ser una idea teórica y pase a sentirse como una herramienta concreta que simplifica el proyecto y fortalece la coherencia del build.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este cuadragésimo octavo tema, ya deberías poder:

- importar un BOM en un caso concreto
- declarar dependencias del ecosistema sin repetir versión
- verificar la política efectiva con `effective POM`
- ver la resolución real con `dependency:tree`
- y entender con bastante claridad por qué los BOMs son tan valiosos en Maven real

---

## Resumen del tema

- Un BOM se consume dentro de `dependencyManagement`.
- Permite declarar dependencias del ecosistema sin repetir versión una por una.
- El `pom.xml` se vuelve más limpio, pero sobre todo más gobernado.
- Effective POM y `dependency:tree` ayudan a verificar que la política realmente está funcionando.
- El valor real del BOM está en la coherencia y mantenimiento del ecosistema, no solo en ahorrar escritura.
- Ya diste otro paso importante hacia una gobernanza de versiones claramente profesional en Maven.

---

## Próximo tema

En el próximo tema vas a aprender a comparar mejor cuándo conviene usar properties, dependencyManagement manual o un BOM, porque después de conocer estas tres herramientas de gobierno de versiones, el siguiente paso natural es aprender a elegir con criterio cuál encaja mejor según la escala y el tipo de proyecto.
