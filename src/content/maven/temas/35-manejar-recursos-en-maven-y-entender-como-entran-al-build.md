---
title: "Manejar recursos en Maven y entender cómo entran al build"
description: "Trigésimo quinto tema práctico del curso de Maven: aprender qué son los recursos en Maven, dónde se ubican, cómo se procesan, cómo entran al artefacto final y por qué forman parte importante del build más allá del código Java."
order: 35
module: "Plugins y build"
level: "base"
draft: false
---

# Manejar recursos en Maven y entender cómo entran al build

## Objetivo del tema

En este trigésimo quinto tema vas a:

- entender qué son los recursos dentro de un proyecto Maven
- ver dónde suelen ubicarse
- aprender cómo Maven los procesa dentro del build
- comprobar cómo entran al `.jar` final
- distinguir mejor entre código fuente, clases compiladas y recursos
- reforzar la idea de que el build no trabaja solo con `.java`

La idea es que dejes de pensar el proyecto solo como código Java y empieces a ver que el build también transporta y empaqueta archivos que no son clases, pero que igual forman parte real de la aplicación.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- entender el lifecycle básico
- usar `clean`, `compile`, `test`, `package` e `install`
- inspeccionar el `.jar` generado
- configurar plugins básicos del build
- entender el rol del manifest y del artefacto final

Si venís siguiendo el curso, ya tenés una base muy buena para este paso.

---

## Idea central del tema

Hasta ahora venís trabajando mucho con:

- código fuente en `src/main/java`
- tests en `src/test/java`
- clases compiladas en `target/classes`
- artefactos empaquetados en `target/*.jar`

Pero una aplicación real muchas veces también necesita archivos como:

- `.properties`
- `.txt`
- `.json`
- `.xml`
- plantillas
- configuraciones
- archivos estáticos o datos auxiliares

Esos archivos no son clases Java.
Y sin embargo, también forman parte del build.

Entonces aparece una idea muy importante:

> en Maven, el build no trabaja solo con código Java; también procesa y empaqueta recursos que la aplicación puede necesitar.

---

## Qué es un recurso en Maven

Un recurso es un archivo no fuente que forma parte del proyecto y que Maven puede copiar, procesar y llevar al output del build.

Dicho simple:

> un recurso es algo que tu proyecto necesita, pero que no está escrito como clase Java.

Esto puede incluir desde un archivo de configuración hasta un JSON o un texto simple.

---

## Dónde viven los recursos principales

En la estructura estándar de Maven, los recursos principales suelen vivir en:

```text
src/main/resources
```

Mientras que los recursos de tests suelen vivir en:

```text
src/test/resources
```

Esta estructura mantiene la misma lógica que ya venías viendo con Java:

- `main` = parte principal del proyecto
- `test` = parte de pruebas

---

## Una intuición muy útil

Podés pensarlo así:

- `src/main/java` = código fuente principal
- `src/main/resources` = archivos de apoyo para la aplicación principal
- `src/test/java` = código de pruebas
- `src/test/resources` = archivos de apoyo para las pruebas

Esta simetría vale muchísimo y ordena mucho la cabeza.

---

## Qué hace Maven con los recursos

Cuando corrés fases como:

```bash
mvn compile
```

o:

```bash
mvn package
```

Maven suele procesar también los recursos.

Eso significa, en lo más básico, que:

- los copia desde `src/main/resources`
- hacia el output del build, normalmente en `target/classes`

Entonces aparece una verdad importante:

> para Maven, los recursos principales terminan viajando junto con las clases compiladas dentro del output principal del proyecto.

---

## Primer experimento práctico: crear un recurso real

Quiero que hagas esto:

### Paso 1
Dentro de tu proyecto, creá la carpeta:

```text
src/main/resources
```

si todavía no existe.

### Paso 2
Adentro, creá un archivo llamado por ejemplo:

```text
mensaje.txt
```

### Paso 3
Poné dentro algo simple, por ejemplo:

```text
Este es un recurso del proyecto Maven.
```

### Paso 4
Corré:

```bash
mvn clean compile
```

## Qué deberías observar

Después de compilar, buscá en:

```text
target/classes
```

Debería aparecer:

```text
target/classes/mensaje.txt
```

Eso confirma que Maven procesó y copió el recurso.

---

## Qué aprendiste con esto

Que el build no solo genera `.class`.
También copia recursos hacia el output principal.

Y eso es importantísimo.

---

## Qué relación hay entre target/classes y el jar

Ya viste antes que:

- `target/classes` contiene las clases compiladas
- el `.jar` empaqueta lo que corresponde del output principal

Bueno:
eso también alcanza a los recursos.

Entonces aparece otra idea importante:

> si un recurso terminó en `target/classes`, es muy probable que también termine entrando al `.jar` final cuando empaquetás el proyecto.

---

## Segundo experimento práctico: verificar el recurso dentro del jar

Después de crear `mensaje.txt` y correr:

```bash
mvn clean package
```

listá el contenido del `.jar`:

```bash
jar tf target/TU-ARCHIVO.jar
```

## Qué deberías buscar

Buscá si aparece algo como:

```text
mensaje.txt
```

o la ruta que corresponda si el recurso está dentro de subcarpetas.

### Qué objetivo tiene
Ver que el recurso no solo se copió a `target/classes`,
sino que además viajó al artefacto final.

---

## Qué aprendiste con esto

Que los recursos forman parte real del empaquetado del proyecto.

Esto ya es muy valioso,
porque te muestra que el `.jar` no contiene solo clases y metadata,
sino también archivos de apoyo de la aplicación.

---

## Qué tipos de recursos son muy comunes

En proyectos Java/Maven suelen aparecer mucho cosas como:

- `application.properties`
- archivos `.properties`
- `config.json`
- archivos `.sql`
- `logback.xml`
- mensajes, textos o plantillas
- recursos usados por pruebas
- archivos estáticos o datos embebidos

No hace falta profundizar en todos hoy.
Lo importante es ver que Maven ya tiene una estructura natural para ellos.

---

## Una intuición muy útil

Podés pensarlo así:

> los recursos son parte del “equipaje” de la aplicación.

No son el código principal,
pero la aplicación puede necesitarlos para funcionar o comportarse correctamente.

Esa imagen vale muchísimo.

---

## Ejercicio 1 — comparar clase compilada y recurso

Quiero que hagas esto:

### Paso 1
Compilá tu proyecto con:

```bash
mvn clean compile
```

### Paso 2
Buscá en `target/classes`:
- una clase `.class`
- el archivo `mensaje.txt`

### Paso 3
Compará:
- uno viene de `src/main/java`
- el otro viene de `src/main/resources`

### Objetivo
Ver que ambos confluyen en el output principal,
aunque tengan naturaleza distinta.

---

## Qué diferencia hay entre un recurso principal y uno de test

Conviene dejarlo claro.

### Recurso principal
Vive en:

```text
src/main/resources
```

y se asocia al output principal del proyecto.

### Recurso de test
Vive en:

```text
src/test/resources
```

y se asocia al contexto de test.

Esto ya se parece muchísimo a lo que viste con código Java.
Y eso no es casualidad:
Maven busca mantener consistencia en la estructura.

---

## Tercer experimento práctico: recurso de test

Ahora probá esto.

### Paso 1
Creá:

```text
src/test/resources
```

### Paso 2
Adentro, un archivo como:

```text
datos-test.txt
```

con contenido simple.

### Paso 3
Corré:

```bash
mvn test
```

### Paso 4
Buscá en:

```text
target/test-classes
```

## Qué deberías observar

Debería aparecer:

```text
target/test-classes/datos-test.txt
```

## Qué aprendiste

Que Maven aplica la misma lógica también al mundo de pruebas:

- código de test
- recursos de test
- output de test

Eso ya te da un modelo bastante completo.

---

## Qué relación tiene esto con la salida del build

Si recordás temas anteriores,
en la salida de Maven a veces aparecían líneas como estas:

```text
resources:...:resources
resources:...:testResources
```

Ahora ya podés leerlas con otro nivel de comprensión.

Esas líneas no eran “ruido”.
Estaban señalando que Maven estaba procesando recursos.

Entonces aparece una idea importante:

> ahora podés leer mejor la salida del build porque ya entendés que recursos y testResources también son parte real del trabajo que Maven hace.

---

## Ejercicio 2 — volver a leer la salida con otros ojos

Quiero que corras:

```bash
mvn clean test
```

y busques líneas relacionadas con:

- `resources`
- `testResources`

### Objetivo
Reconocer que Maven no solo compila y testea,
también procesa recursos de forma estructurada.

---

## Qué relación tiene esto con el plugin de resources

Aunque todavía no hace falta configurarlo a fondo,
conviene que ya sepas que hay una pieza del build dedicada a recursos.

No hace falta abrir ese frente todavía.
Por ahora alcanza con entender la lógica funcional:

- los recursos existen
- tienen ubicación estándar
- Maven los procesa
- y el build los transporta al output correcto

Más adelante, si querés, podés profundizar en configuración más fina de esa parte.

---

## Error común 1 — meter recursos dentro de src/main/java

No conviene.
Eso rompe la separación conceptual del proyecto.

Los recursos tienen su lugar:
- `src/main/resources`

---

## Error común 2 — olvidar que los recursos también entran al jar

Muchísima gente piensa en el `.jar` solo como clases compiladas.
Este tema justamente quiere corregir eso.

---

## Error común 3 — no distinguir recursos de test y recursos principales

Conviene mantener la frontera clara,
igual que con código Java.

---

## Error común 4 — ver líneas de resources en el build como si fueran secundarias o irrelevantes

No lo son.
Forman parte real del proceso de construcción del proyecto.

---

## Qué relación tiene esto con apps más reales

Muchísima.

En proyectos reales, recursos como archivos de configuración, SQL, plantillas o mensajes son moneda corriente.

Entonces este tema no es decorativo:
te está dando una parte muy real del uso profesional de Maven y de la estructura estándar de un proyecto Java.

---

## Ejercicio 3 — crear una app que lea un recurso

Si querés hacer una práctica un poco más rica, probá esto.

Creá un recurso simple en:

```text
src/main/resources/mensaje.txt
```

y después escribí una clase que intente leerlo desde el classpath.

No hace falta que este tema te fuerce a profundizar demasiado en APIs de lectura todavía,
pero si te animás, es una gran práctica para sentir que:

- el recurso no solo entra al build
- también puede ser consumido por la aplicación

---

## Una intuición muy útil

Podés pensarlo así:

> los recursos no solo se copian; se preparan para estar disponibles como parte de la aplicación construida.

Esa frase vale muchísimo.

---

## Qué no conviene olvidar

Este tema no pretende que hoy configures procesamiento avanzado de recursos.

Lo que sí quiere dejarte es una comprensión muy importante:

- dónde van
- cómo viajan
- cómo entran al output
- cómo entran al jar
- y cómo conviven con clases y tests en el build

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Creá `src/main/resources/mensaje.txt`.

### Ejercicio 2
Corré:

```bash
mvn clean compile
```

### Ejercicio 3
Verificá que aparezca en `target/classes`.

### Ejercicio 4
Corré:

```bash
mvn clean package
```

### Ejercicio 5
Inspeccioná el `.jar` y verificá que el recurso entró al artefacto.

### Ejercicio 6
Creá además un recurso de test en `src/test/resources`.

### Ejercicio 7
Corré:

```bash
mvn test
```

### Ejercicio 8
Verificá que aparezca en `target/test-classes`.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es un recurso en Maven?
2. ¿Dónde viven los recursos principales?
3. ¿Dónde viven los recursos de test?
4. ¿Qué relación tienen con `target/classes` y `target/test-classes`?
5. ¿Por qué un `.jar` puede contener algo más que clases compiladas?

---

## Mini desafío

Hacé una práctica completa:

1. creá un recurso principal
2. creá un recurso de test
3. corré `mvn clean test`
4. corré `mvn clean package`
5. verificá:
   - `target/classes`
   - `target/test-classes`
   - el `.jar`
6. escribí una nota breve explicando cómo este tema amplió tu idea de lo que realmente construye Maven

Tu objetivo es que el build deje de parecerte solo un traductor de `.java` a `.class` y pase a verse como un proceso que también organiza, transporta y empaqueta recursos reales del proyecto.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este trigésimo quinto tema, ya deberías poder:

- entender qué es un recurso en Maven
- ubicar recursos principales y de test
- verificar cómo Maven los copia al output
- comprobar cómo entran al `.jar`
- y leer el build con una comprensión bastante más rica que antes

---

## Resumen del tema

- Maven no trabaja solo con código Java; también procesa recursos.
- Los recursos principales viven en `src/main/resources`.
- Los recursos de test viven en `src/test/resources`.
- Maven los copia a `target/classes` y `target/test-classes`.
- Los recursos principales también pueden entrar al `.jar` final.
- Ya sumaste otra capa muy importante a tu comprensión del build real de Maven.

---

## Próximo tema

En el próximo tema vas a aprender a filtrar recursos con propiedades de Maven en un nivel inicial, porque después de entender cómo los archivos de recursos entran al build, el siguiente paso natural es ver cómo algunos de esos recursos pueden incorporar valores del proyecto o del entorno en el momento de la construcción.
