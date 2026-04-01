---
title: "Fijar versiones de plugins en Maven y entender por qué importa"
description: "Trigésimo primer tema práctico del curso de Maven: aprender por qué conviene fijar versiones de plugins, cómo declararlas con más criterio y por qué gobernar herramientas del build es tan importante como gobernar dependencias del proyecto."
order: 31
module: "Plugins y build"
level: "base"
draft: false
---

# Fijar versiones de plugins en Maven y entender por qué importa

## Objetivo del tema

En este trigésimo primer tema vas a:

- entender por qué conviene fijar versiones de plugins en Maven
- ver qué diferencia hay entre dejar una versión implícita y declararla explícitamente
- empezar a gobernar herramientas del build con más criterio
- relacionar versiones de plugins con estabilidad, claridad y mantenimiento
- reforzar una práctica muy importante para proyectos Maven más serios

La idea es que dejes de pensar que solo importa versionar dependencias del proyecto y empieces a ver que las herramientas del build también forman parte de la salud técnica del proyecto.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- usar `properties`
- entender el lifecycle básico
- distinguir dependencias del proyecto y plugins
- declarar plugins explícitos en `build/plugins`
- ejecutar una aplicación con `exec-maven-plugin`
- pasar argumentos y propiedades desde Maven

Si hiciste los temas anteriores, ya tenés una base muy buena para este paso.

---

## Idea central del tema

Hasta ahora viste algo muy importante:

- Maven usa plugins para compilar, testear, limpiar y empaquetar
- esos plugins pueden usarse de forma implícita
- y también podés declararlos explícitamente en el `pom.xml`

Ahora aparece una pregunta más fina:

> si ya voy a usar un plugin explícitamente, ¿conviene fijar su versión o dejarla implícita?

La respuesta práctica y madura suele ir bastante en una dirección clara:

> sí, conviene fijar la versión del plugin cuando querés más control, más reproducibilidad y menos ambigüedad en el build.

---

## Por qué este tema importa tanto

Porque cuando trabajás con Maven no solo te importa:

- qué librerías usa tu proyecto
- qué versiones de dependencias tiene

También te importa:

- con qué herramientas del build se compila
- con qué herramienta se ejecutan tests
- con qué herramienta se genera el `.jar`
- con qué plugin ejecutás ciertas tareas especiales

Y si esas herramientas quedan demasiado implícitas o flotantes, perdés bastante claridad.

Entonces aparece una idea muy importante:

> gobernar versiones de plugins es una forma de gobernar el comportamiento del build.

---

## Una intuición muy útil

Podés pensarlo así:

- dependencias del proyecto = herramientas que usa tu código
- plugins del build = herramientas que usa Maven para trabajar sobre tu proyecto

Si te importa versionar bien una capa,
también debería importarte versionar bien la otra.

Esa simetría vale muchísimo.

---

## Qué significa “fijar” la versión de un plugin

Significa declarar explícitamente algo como esto:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.11.0</version>
</plugin>
```

En vez de dejar que la versión quede solamente implícita o resuelta por defaults que no están tan visibles en tu `pom.xml`.

---

## Qué ventaja tiene dejarla explícita

Varias.

### 1. Más claridad
Se ve qué herramienta concreta del build querés usar.

### 2. Más reproducibilidad
Reducís la ambigüedad sobre con qué versión debería trabajar el proyecto.

### 3. Más mantenimiento
Cuando quieras actualizar, sabés dónde tocar.

### 4. Más lectura técnica del proyecto
El `pom.xml` deja más visible qué parte del build está gobernada intencionalmente.

Entonces aparece una verdad importante:

> fijar la versión de un plugin no es solo detalle administrativo; es parte de hacer el build más confiable y más entendible.

---

## Primer contraste conceptual

Supongamos estos dos casos.

### Caso A — plugin sin versión explícita
```xml
<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>exec-maven-plugin</artifactId>
</plugin>
```

### Caso B — plugin con versión explícita
```xml
<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>exec-maven-plugin</artifactId>
    <version>3.1.0</version>
</plugin>
```

## Qué diferencia práctica hay

En el segundo caso,
el `pom.xml` comunica mucho mejor qué versión querés sostener.

En el primero,
parte de esa información queda menos visible o más implícita.

---

## Qué relación tiene esto con lo que ya aprendiste de dependencias

Muy fuerte.

Ya viste que con dependencias del proyecto conviene:

- centralizar versiones
- hacerlas visibles
- verificarlas
- evitar ambigüedad

Bueno:
con plugins empieza a pasar algo parecido.

Entonces aparece una idea importante:

> una vez que tu uso de Maven madura, ya no alcanza con gobernar las dependencias del proyecto; también conviene gobernar las herramientas del build.

---

## Primer ejemplo práctico: revisar tus plugins actuales

Abrí tu `pom.xml` y buscá el bloque `build/plugins`.

Fijate si tenés algo como:

- `maven-compiler-plugin`
- `exec-maven-plugin`

Ahora respondé:

- ¿todos tienen `version`?
- ¿alguno quedó sin versión explícita?
- ¿el bloque comunica claramente qué herramientas usa el proyecto?

Este mini chequeo ya es muy valioso.

---

## Ejercicio 1 — asegurar versiones explícitas

Quiero que hagas esto:

### Paso 1
Revisá tus plugins declarados actualmente.

### Paso 2
Si alguno no tiene `<version>`, agregásela.

### Paso 3
Corré:

```bash
mvn clean compile
```

o, si corresponde:

```bash
mvn exec:java
```

### Objetivo
Verificar que el build sigue funcionando, pero ahora con plugins más claramente gobernados.

---

## Qué pasa si Maven ya usaba un plugin sin que vos lo declararas

Esto también es importante.

Maven puede usar plugins por default.
Eso ya lo viste.

Pero en cuanto querés más control,
declararlo explícitamente con versión hace una gran diferencia.
No porque Maven “no pudiera” funcionar antes,
sino porque:

- el proyecto queda más expresivo
- el build queda más legible
- y el mantenimiento mejora

Entonces aparece otra idea importante:

> el problema de dejar cosas implícitas no siempre es que falle hoy; muchas veces es que cuesta más entender, mantener y reproducir mañana.

---

## Una intuición muy útil

Podés pensarlo así:

> hacer explícita la versión de un plugin es convertir una herramienta implícita del build en una decisión visible del proyecto.

Esa frase vale muchísimo.

---

## Qué plugins conviene fijar primero

En esta etapa, con que empieces por los que ya estás usando explícitamente está perfecto.

Por ejemplo:

### `maven-compiler-plugin`
Porque afecta directamente compilación.

### `exec-maven-plugin`
Porque lo estás usando para ejecutar una app.

Y más adelante, cuando aparezcan otros plugins declarados explícitamente, aplicarás la misma lógica.

---

## Ejemplo concreto de un build más claro

Algo así ya empieza a verse bastante sano:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
            <configuration>
                <source>${maven.compiler.source}</source>
                <target>${maven.compiler.target}</target>
            </configuration>
        </plugin>

        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>exec-maven-plugin</artifactId>
            <version>3.1.0</version>
            <configuration>
                <mainClass>com.gabriel.maven.App</mainClass>
            </configuration>
        </plugin>
    </plugins>
</build>
```

## Qué tiene de bueno esto

- se ve qué herramientas del build estás gobernando
- se ve con qué versión
- y se ve qué configuración importante aplicaste

Eso sube muchísimo la calidad de lectura del proyecto.

---

## Qué relación tiene esto con el effective POM

Muy fuerte.

Después de fijar versiones explícitas,
podés generar:

```bash
mvn help:effective-pom -Doutput=effective-pom.xml
```

y buscar los plugins.

La idea no es solo ver que aparecen,
sino también comprobar que:

- la versión está ahí
- la configuración quedó integrada
- el proyecto efectivo refleja lo que declaraste

Esto vuelve a cerrar el circuito sano:

- declarar
- ejecutar
- verificar

---

## Ejercicio 2 — verificar un plugin en el effective POM

Quiero que hagas esto:

### Paso 1
Dejá un plugin con versión explícita en el `pom.xml`.

### Paso 2
Generá el effective POM.

### Paso 3
Buscá el plugin y su versión.

### Paso 4
Verificá que coincida con lo que declaraste.

### Objetivo
Reforzar que la versión no quede solo “escrita”, sino incorporada al modelo efectivo.

---

## Qué relación tiene esto con warnings y buenas prácticas

A medida que Maven madura en un proyecto,
las versiones explícitas de plugins suelen verse como una buena práctica de claridad y estabilidad.

No hace falta que conviertas esto en dogma rígido hoy.
Pero sí conviene que lo empieces a incorporar como criterio sano.

---

## Error común 1 — pensar que versionar plugins es menos importante que versionar dependencias

No.
Cumplen roles distintos,
pero ambos afectan la salud del proyecto.

---

## Error común 2 — declarar plugins explícitos y olvidar la versión

Eso deja una parte importante de la herramienta todavía flotante o menos visible de lo ideal.

---

## Error común 3 — agregar una versión sin después verificar nada

Siempre que puedas:
- corré el build real
- mirá la salida
- y si hace falta, revisá el effective POM

---

## Error común 4 — creer que esto es puro formalismo

No lo es.

Más claridad de versiones en plugins significa:
- más comprensión
- más mantenimiento
- menos sorpresa
- y mejor base para crecer después

---

## Qué relación tiene esto con la evolución del build

Muy fuerte.

Hoy estás trabajando con uno o dos plugins explícitos.
Mañana podrías tener más.

Si desde ahora ya tenés una cultura de:

- declarar
- fijar versión
- configurar
- verificar

el proyecto crece mucho más sano.

Entonces aparece una verdad importante:

> la disciplina con plugins no empieza cuando el proyecto ya es grande; conviene empezar a construirla temprano.

---

## Ejercicio 3 — comparar antes y después

Quiero que hagas este ejercicio mental y práctico.

### Antes
Imaginá el plugin sin versión explícita.

### Después
Dejalo con versión.

### Preguntas
- ¿qué parte del build se volvió más visible?
- ¿qué parte quedó más gobernada?
- ¿qué parte sería más fácil de mantener después?

El objetivo es que no lo veas solo como “agregar una línea más”,
sino como mejora real de legibilidad y control.

---

## Qué no conviene olvidar

Este tema no pretende que ya armes una estrategia ultra avanzada de versiones de plugins.

Lo que sí quiere dejarte es una práctica de base muy buena:

- si declarás un plugin explícitamente,
- conviene que también gobiernes su versión explícitamente,
- y que esa decisión quede visible en el proyecto.

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Revisá los plugins de tu `pom.xml`.

### Ejercicio 2
Asegurate de que `maven-compiler-plugin` tenga `version`.

### Ejercicio 3
Asegurate de que `exec-maven-plugin` tenga `version`.

### Ejercicio 4
Corré:
```bash
mvn clean compile
mvn exec:java
```

### Ejercicio 5
Generá el effective POM.

### Ejercicio 6
Buscá ambos plugins y verificá que la versión aparezca.

### Ejercicio 7
Escribí con tus palabras por qué conviene gobernar versiones de plugins y no solo dependencias.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Por qué conviene fijar versiones de plugins?
2. ¿Qué diferencia hay entre usar un plugin por default y declararlo explícitamente con versión?
3. ¿Qué relación tiene esto con la reproducibilidad del build?
4. ¿Qué herramienta te ayuda a verificar la configuración efectiva del plugin?
5. ¿Por qué este criterio también mejora el mantenimiento del proyecto?

---

## Mini desafío

Hacé una práctica completa:

1. tomá tu proyecto actual
2. revisá todos los plugins declarados
3. agregá versión explícita a cada uno
4. corré el build correspondiente
5. generá el effective POM
6. verificá las versiones efectivas
7. escribí una nota breve explicando cómo cambió tu nivel de control sobre el build

Tu objetivo es que la gobernanza de versiones deje de parecer algo solo de dependencias y pase a formar parte también de tu forma de pensar los plugins.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este trigésimo primer tema, ya deberías poder:

- entender por qué conviene fijar versiones de plugins
- revisar y mejorar el bloque `build/plugins`
- relacionar versiones explícitas con claridad y estabilidad
- verificar el resultado en el effective POM
- y tratar herramientas del build con un criterio mucho más maduro

---

## Resumen del tema

- Los plugins también forman parte importante del comportamiento del proyecto.
- Declararlos explícitamente con versión mejora claridad, mantenimiento y control.
- Gobernar versiones de plugins es tan sano como gobernar versiones de dependencias.
- Effective POM y build real ayudan a verificar que la configuración quedó viva.
- Ya diste un paso importante hacia un Maven más serio, donde el build también queda versionado y visible.
- Esta práctica te prepara muy bien para seguir creciendo en configuración de plugins.

---

## Próximo tema

En el próximo tema vas a aprender a centralizar versiones de plugins con más criterio, porque después de empezar a fijarlas explícitamente una por una, el siguiente paso natural es ver cómo evitar repetición y cómo preparar una estrategia más ordenada para gobernar varias herramientas del build a la vez.
