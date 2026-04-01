---
title: "Elegir entre properties, dependencyManagement y BOM en Maven"
description: "Cuadragésimo noveno tema práctico del curso de Maven: aprender a comparar properties, dependencyManagement manual y BOMs para gobernar versiones con criterio según la escala y el tipo de proyecto."
order: 49
module: "Gobernanza de versiones y ecosistemas"
level: "intermedio"
draft: false
---

# Elegir entre `properties`, `dependencyManagement` y BOM en Maven

## Objetivo del tema

En este cuadragésimo noveno tema vas a:

- comparar tres herramientas clave de gobernanza de versiones en Maven
- entender qué problema resuelve mejor cada una
- distinguir cuándo conviene usar `properties`
- distinguir cuándo conviene usar `dependencyManagement` manual
- distinguir cuándo conviene importar un BOM
- empezar a elegir con criterio en lugar de aplicar siempre la misma solución

La idea es que dejes de ver estas herramientas como piezas aisladas y empieces a decidir cuál encaja mejor según el contexto del proyecto.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- usar `properties`
- usar `dependencyManagement` en proyectos individuales y raíces multi-módulo
- entender qué es un BOM
- importar un BOM dentro de `dependencyManagement`
- leer el effective POM
- verificar resolución con `dependency:tree`

Si hiciste los temas anteriores, ya tenés la base ideal para este paso.

---

## Idea central del tema

Hasta acá ya aprendiste tres maneras importantes de gobernar versiones:

### 1. `properties`
Para centralizar valores reutilizables.

### 2. `dependencyManagement`
Para administrar versiones y definiciones de dependencias.

### 3. BOM
Para importar una política ya alineada de versiones de un ecosistema.

Ahora aparece la pregunta verdaderamente importante:

> ¿cuándo conviene usar cada una?

Porque saber usar una herramienta está buenísimo,
pero elegir bien entre varias herramientas es lo que de verdad te vuelve más sólido.

---

## Por qué este tema importa tanto

Porque en Maven no hay una sola respuesta universal.

A veces alcanza con:

- una property

Otras veces conviene:

- `dependencyManagement` manual

Y otras veces el caso pide claramente:

- importar un BOM

Si no desarrollás criterio,
podés terminar:

- complicando de más un proyecto chico
- o gobernando de menos un proyecto grande

Entonces aparece una idea muy importante:

> en Maven, la madurez no está solo en conocer herramientas, sino en saber cuándo usar cada una con la escala adecuada.

---

## Una intuición muy útil

Podés pensarlo así:

- `properties` = centralización básica de valores
- `dependencyManagement` = política manual y explícita de versiones
- BOM = política importada y alineada para un ecosistema

Esa frase vale muchísimo.

---

## Primer caso: properties

Las `properties` brillan cuando querés centralizar valores concretos y simples.

Por ejemplo:

```xml
<properties>
    <java.version>21</java.version>
    <junit.version>4.13.2</junit.version>
</properties>
```

### Cuándo tienen mucho sentido
- cuando el proyecto es chico o mediano
- cuando querés una centralización simple
- cuando el número de versiones gobernadas no es grande
- cuando querés expresar valores reutilizables en varios lugares del `pom.xml`

### Qué ventaja tienen
- son simples
- visibles
- muy directas
- y fáciles de mantener

### Qué limitación tienen
- por sí solas no reemplazan el rol estructural de `dependencyManagement`
- si el proyecto crece mucho, pueden quedarse cortas como única estrategia

---

## Segundo caso: dependencyManagement manual

`dependencyManagement` manual brilla cuando querés gobernar versiones explícitamente desde tu proyecto o raíz,
sin depender todavía de una política empaquetada externa.

Por ejemplo:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### Cuándo tiene mucho sentido
- cuando vos querés controlar las versiones una por una
- cuando son pocas o moderadas
- cuando el ecosistema no justifica un BOM
- cuando querés una política central propia del proyecto o del sistema multi-módulo
- cuando necesitás control fino sobre dependencias concretas

### Qué ventaja tiene
- control explícito y local
- muy buena legibilidad de política
- excelente para raíces multi-módulo propias

### Qué limitación tiene
- puede volverse más pesado si el ecosistema es grande
- mantener muchas dependencias manualmente puede ser costoso

---

## Tercer caso: BOM

El BOM brilla cuando tenés muchas dependencias relacionadas dentro de un mismo ecosistema y no querés gestionar una por una todas sus versiones.

Por ejemplo:

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
```

### Cuándo tiene mucho sentido
- cuando usás varias librerías del mismo ecosistema
- cuando la compatibilidad entre ellas importa mucho
- cuando querés alinear muchas versiones de una sola vez
- cuando el ecosistema ya ofrece una política madura empaquetada como BOM

### Qué ventaja tiene
- menos repetición
- más coherencia
- upgrades del ecosistema más simples
- menos riesgo de mezclar versiones incompatibles

### Qué limitación tiene
- dependés de una política empaquetada que no controlás totalmente
- no siempre sirve para todo el proyecto si tenés piezas muy heterogéneas
- sigue sin reemplazar la necesidad de declarar qué dependencias usás realmente

---

## Primer criterio práctico de decisión

Podés usar esta regla simple:

> si el problema es pequeño y local, probablemente alcance con `properties`; si el problema es una política propia de varias dependencias, pensá en `dependencyManagement`; si el problema es un ecosistema grande y alineado, pensá en BOM.

Esta regla no resuelve todo,
pero ordena muchísimo.

---

## Ejemplo comparativo simple

Imaginá estos tres escenarios.

### Escenario A
Tenés una app pequeña con:
- JUnit
- Commons Lang
- una o dos librerías más

Acá muchas veces alcanza con:
- `properties`
- y quizá algo de `dependencyManagement` si querés más prolijidad

### Escenario B
Tenés una raíz multi-módulo con varios hijos que comparten:
- JUnit
- algunas librerías comunes
- política propia del sistema

Acá suele tener mucho sentido:
- `dependencyManagement` manual en la raíz
- y `properties` para apoyar las versiones

### Escenario C
Usás un ecosistema grande con muchas librerías que deberían ir coordinadas

Acá el candidato más fuerte suele ser:
- BOM importado en `dependencyManagement`

Ese contraste ya te da muchísimo criterio práctico.

---

## Una intuición muy útil

Podés pensarlo así:

- `properties` te ayudan a nombrar y centralizar
- `dependencyManagement` te ayuda a gobernar explícitamente
- el BOM te ayuda a importar gobernanza ya alineada

Esa diferencia vale muchísimo.

---

## Qué relación hay entre estas herramientas

Esto es importante:
no son excluyentes.

De hecho, muchas veces conviven muy bien.

Por ejemplo:

- usás `properties` para nombrar una versión de BOM
- importás el BOM en `dependencyManagement`
- además agregás unas pocas dependencias propias en `dependencyManagement` manual
- y después los módulos hijos expresan uso real

Entonces aparece una verdad importante:

> en Maven maduro, muchas veces no elegís una única herramienta; elegís la combinación correcta según el tipo de problema.

---

## Ejercicio 1 — clasificar casos

Quiero que hagas esto por escrito.

Para cada caso, decidí qué te parece más lógico usar:

### Caso A
Solo querés centralizar `java.version` y dos versiones simples.

### Caso B
Tenés una raíz multi-módulo y querés alinear tres dependencias comunes entre varios hijos.

### Caso C
Tenés diez librerías de un mismo ecosistema ya pensado para trabajar con un BOM.

### Objetivo
Entrenar criterio,
no solo memoria.

---

## Qué papel sigue teniendo effective POM

Muchísimo.

Sea cual sea la estrategia que elijas:

- `properties`
- `dependencyManagement`
- BOM

el effective POM sigue siendo una gran herramienta para verificar cómo quedó integrado el modelo real del proyecto.

Entonces el patrón sano sigue siendo:

- decidir
- declarar
- verificar

Eso no cambia.

---

## Qué papel sigue teniendo dependency:tree

También fuerte.

Porque una cosa es cómo gobernás versiones,
y otra es cómo quedó resuelta la dependencia real dentro del módulo o proyecto.

Entonces:

- effective POM = política integrada
- dependency:tree = resolución concreta

Esa dupla sigue siendo muy valiosa.

---

## Ejercicio 2 — pensar desde mantenimiento

Respondé esta pregunta:

> ¿Qué te parecería más mantenible a largo plazo en un ecosistema grande: escribir todas las versiones a mano una por una o apoyarte en un BOM bien diseñado? ¿Y en un proyecto chico, seguiría siendo igual de claro?

### Objetivo
Que no elijas solo por poder técnico,
sino también por costo de mantenimiento.

---

## Qué no conviene hacer

No conviene:

- usar BOM por moda si el problema es mínimo
- insistir con puro manejo manual cuando el ecosistema ya pide claramente un BOM
- usar solo properties cuando el sistema ya necesita una política más estructural
- o importar BOMs sin entender qué problema concreto te están resolviendo

Entonces aparece una idea importante:

> la mejor herramienta no es la más sofisticada; es la que tiene la escala correcta para el problema real.

Esa frase vale muchísimo.

---

## Error común 1 — creer que BOM siempre es “más profesional”

No necesariamente.
A veces es mejor.
A veces es innecesario.
Depende del contexto.

---

## Error común 2 — creer que properties ya resuelven toda la gobernanza de versiones

No.
Ayudan muchísimo,
pero no reemplazan todas las necesidades de administración estructural.

---

## Error común 3 — usar dependencyManagement manual para un ecosistema enorme que ya ofrece un BOM sólido

Se puede,
pero muchas veces te obliga a mantener de más algo que ya venía resuelto elegantemente.

---

## Error común 4 — querer elegir una sola herramienta para todos los escenarios

No hace falta.
Maven permite combinar enfoques con bastante naturalidad.

---

## Ejercicio 3 — armar tu propia regla de decisión

Quiero que escribas una regla personal de tres líneas, algo como:

- “Si pasa X, uso properties.”
- “Si pasa Y, uso dependencyManagement manual.”
- “Si pasa Z, pienso en BOM.”

### Objetivo
Que empieces a convertir lo aprendido en criterio operativo propio.

---

## Qué no conviene olvidar

Este tema no pretende que exista una receta matemática universal.
Siempre va a haber matices.

Lo que sí quiere dejarte es una brújula bastante buena:

- no todo se resuelve igual
- Maven ofrece varias capas de gobernanza
- y elegir bien depende de tamaño, contexto, ecosistema y mantenimiento

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Tomá tres escenarios distintos:
- uno chico
- uno multi-módulo propio
- uno de ecosistema grande

### Ejercicio 2
Decidí en cada uno:
- `properties`
- `dependencyManagement` manual
- BOM

### Ejercicio 3
Justificá por qué.

### Ejercicio 4
Escribí una comparación breve entre:
- centralizar valores
- administrar política manual
- importar política empaquetada

### Ejercicio 5
Escribí una regla personal de decisión para futuros proyectos.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué problema resuelven mejor las `properties`?
2. ¿Qué problema resuelve mejor `dependencyManagement` manual?
3. ¿Qué problema resuelve mejor un BOM?
4. ¿Por qué estas herramientas no compiten necesariamente entre sí?
5. ¿Por qué elegir con criterio es más importante que memorizar una sola receta?

---

## Mini desafío

Hacé una práctica conceptual:

1. imaginá tres proyectos distintos
2. elegí para cada uno una estrategia de gobernanza de versiones
3. explicá por qué esa estrategia es la más razonable
4. escribí una nota breve comparando:
   - simplicidad
   - control
   - coherencia
   - mantenimiento

Tu objetivo es que estas tres herramientas dejen de ser temas separados y pasen a formar parte de una caja de decisiones técnica mucho más madura.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este cuadragésimo noveno tema, ya deberías poder:

- comparar `properties`, `dependencyManagement` manual y BOM
- entender qué problema resuelve mejor cada una
- elegir con bastante más criterio según escala y contexto
- combinar herramientas cuando haga falta
- y pensar la gobernanza de versiones en Maven con una lógica mucho más madura

---

## Resumen del tema

- `properties`, `dependencyManagement` y BOM no son lo mismo.
- Cada herramienta brilla en problemas de distinta escala.
- `properties` centralizan valores; `dependencyManagement` gobierna política manual; el BOM importa política empaquetada.
- En muchos casos, la mejor solución es combinar varias de estas herramientas.
- El criterio de elección depende del tamaño del proyecto, del ecosistema y del costo de mantenimiento.
- Ya diste otro paso importante hacia una toma de decisiones más profesional dentro de Maven.

---

## Próximo tema

En el próximo tema vas a aprender a empezar a trabajar con publicación e instalación de artefactos en un nivel más serio, porque después de construir bastante bien proyectos, módulos y gobernanza de versiones, el siguiente paso natural es pensar no solo en consumir artefactos, sino también en prepararlos y publicarlos para otros consumidores.
