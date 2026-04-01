---
title: "Activar profiles en Maven por propiedades, JDK y condiciones del entorno"
description: "Vigésimo segundo tema práctico del curso de Maven: aprender distintas formas de activar profiles además de -P, entender activación por propiedades y JDK, y usar estas opciones con criterio sin volver opaca la configuración del proyecto."
order: 22
module: "Configuración por contexto y entornos"
level: "base"
draft: false
---

# Activar `profiles` en Maven por propiedades, JDK y condiciones del entorno

## Objetivo del tema

En este vigésimo segundo tema vas a:

- aprender que los `profiles` no solo se activan con `-P`
- ver formas de activación por propiedades
- entender activación por JDK en un nivel inicial
- empezar a pensar cómo Maven puede adaptar configuración al entorno
- usar estas posibilidades con criterio, sin volver opaco el proyecto

La idea es que amplíes la noción de `profile`: ya no solo como algo que activás manualmente, sino también como algo que Maven puede activar según ciertas condiciones.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- usar `properties`
- generar el effective POM
- definir y activar profiles con `-P`
- entender que un profile modifica o complementa la configuración base

Si hiciste el tema anterior, ya estás listo para este paso.

---

## Idea central del tema

En el tema anterior viste la forma más simple y explícita de usar un profile:

```bash
mvn clean package -Pdev
```

Eso está perfecto.
Pero Maven también permite activar profiles según condiciones.

Por ejemplo:

- si se pasa una propiedad
- si el JDK coincide con cierto patrón
- y, más adelante, incluso por otras condiciones del entorno

Entonces aparece una idea muy importante:

> un profile puede activarse manualmente o por condiciones, y eso vuelve al proyecto más flexible, pero también exige más claridad y más cuidado.

---

## Por qué hace falta este tema

Porque si no conocés estas otras formas de activación, te puede pasar una de dos cosas:

- usar siempre `-P` aunque el caso pida algo más natural
- o encontrarte con un proyecto que activa cosas “solo” y no entender por qué

Este tema apunta justamente a darte control conceptual sobre eso.

---

## Una intuición muy útil

Podés pensarlo así:

- activación manual = “yo decido explícitamente”
- activación por condición = “Maven decide si se cumple esta regla”

Esta diferencia ordena muchísimo.

---

## Dónde vive la activación dentro del profile

En Maven, un profile puede tener un bloque como este:

```xml
<profile>
    <id>dev</id>
    <activation>
        ...
    </activation>
    ...
</profile>
```

Ese bloque le dice a Maven cuándo conviene activar ese profile.

---

## Primer tipo: activación manual con -P

Ya lo viste, pero conviene dejarlo como referencia:

```bash
mvn clean package -Pdev
```

Esto sigue siendo la forma más clara y explícita en muchísimos casos.

De hecho, en proyectos reales suele ser preferible cuando querés que el comportamiento especial sea visible y deliberado.

---

## Segundo tipo: activación por propiedad

Este es uno de los mecanismos más útiles y simples para empezar.

Podés definir algo así:

```xml
<profiles>
    <profile>
        <id>dev</id>
        <activation>
            <property>
                <name>entorno</name>
                <value>dev</value>
            </property>
        </activation>
        <properties>
            <entorno.nombre>desarrollo</entorno.nombre>
        </properties>
    </profile>
</profiles>
```

## Qué significa esto

Maven va a activar ese profile si le pasás una propiedad llamada:

- `entorno`

con valor:

- `dev`

---

## Cómo activar ese profile desde consola

Por ejemplo:

```bash
mvn clean package -Dentorno=dev
```

### Qué significa `-D`
Pasa una propiedad al build.

Entonces acá no usaste `-Pdev`.
En cambio, activaste el profile porque la condición de activación se cumplió.

---

## Primer experimento práctico

Agregá este profile a tu proyecto:

```xml
<profile>
    <id>dev</id>
    <activation>
        <property>
            <name>entorno</name>
            <value>dev</value>
        </property>
    </activation>
    <properties>
        <entorno.nombre>desarrollo</entorno.nombre>
    </properties>
</profile>
```

Y dejá en la base algo así:

```xml
<properties>
    <entorno.nombre>base</entorno.nombre>
</properties>
```

Ahora corré:

```bash
mvn help:effective-pom -Dentorno=dev -Doutput=effective-pom-dev.xml
```

## Qué deberías observar

En el effective POM, la property:

- `entorno.nombre`

debería quedar como:

- `desarrollo`

Eso confirma que el profile se activó por propiedad.

---

## Qué diferencia hay con -P

Las dos formas pueden lograr una activación,
pero conceptualmente no son iguales.

### Con `-Pdev`
Le decís a Maven de forma directa:
- activá este profile por nombre

### Con `-Dentorno=dev`
No nombrás el profile directamente.
Le das una condición,
y Maven activa el profile cuya regla coincide.

Entonces aparece una idea importante:

> `-P` activa por identidad; `-D` puede activar por condición.

---

## Tercer tipo: activación por JDK

También podés definir un profile que se active según la versión de Java.

Ejemplo básico:

```xml
<profile>
    <id>jdk21</id>
    <activation>
        <jdk>21</jdk>
    </activation>
    <properties>
        <entorno.java>java-21</entorno.java>
    </properties>
</profile>
```

## Qué significa esto

Si Maven se está ejecutando con un JDK que coincide con esa activación,
ese profile puede entrar automáticamente.

No hace falta que profundices todavía en todos los formatos posibles.
Lo importante es entender la idea:
- el JDK también puede participar en la activación

---

## Qué herramienta te conviene usar acá

Otra vez, el effective POM.

Si definiste un profile por JDK, podés generar:

```bash
mvn help:effective-pom -Doutput=effective-pom-jdk.xml
```

y verificar si apareció la propiedad del profile.

Además conviene revisar:

```bash
mvn -version
```

para ver con qué Java está corriendo Maven.

---

## Ejercicio 1 — profile por propiedad

Quiero que hagas esto:

### Paso 1
Definí una property base:

```xml
<entorno.nombre>base</entorno.nombre>
```

### Paso 2
Creá un profile que se active por:

```xml
<property>
    <name>entorno</name>
    <value>dev</value>
</property>
```

### Paso 3
Hacé que ese profile cambie la property a:
- `desarrollo`

### Paso 4
Corré:

```bash
mvn help:effective-pom -Dentorno=dev -Doutput=effective-pom-dev.xml
```

### Paso 5
Verificá el cambio.

### Objetivo
Entender activación por propiedad como mecanismo real y no teórico.

---

## Ejercicio 2 — profile por JDK

Ahora probá algo así:

```xml
<profile>
    <id>jdk21</id>
    <activation>
        <jdk>21</jdk>
    </activation>
    <properties>
        <java.contexto>jdk21-activo</java.contexto>
    </properties>
</profile>
```

Después corré:

```bash
mvn -version
mvn help:effective-pom -Doutput=effective-pom-jdk.xml
```

Y buscá:
- `java.contexto`

## Qué objetivo tiene

Que veas si el profile se activó según el JDK real con el que Maven está corriendo en tu máquina.

---

## Qué ventaja tiene la activación por propiedad

Tiene varias:

- permite cambiar comportamiento sin tener que nombrar directamente el profile
- puede ser muy práctica en scripts o entornos controlados
- se integra bien con variables que querés pasar desde línea de comandos
- deja cierta flexibilidad contextual

Pero también tiene un costo:
- puede volver menos evidente por qué algo se activó

Por eso hay que usarla con criterio.

---

## Qué ventaja tiene la activación por JDK

Puede servir cuando querés que cierta configuración se adapte al Java real con el que corre Maven.

Por ejemplo:
- comportamiento distinto por versión del entorno
- ajustes de compatibilidad
- señales contextuales del build

No hace falta que hoy armes escenarios complejos.
Solo entender que Maven tiene esa capacidad.

---

## Una intuición muy útil

Podés pensarlo así:

> cuanto más automática es la activación, más importante se vuelve poder inspeccionar después qué quedó activo realmente.

Esa frase vale muchísimo.

---

## Qué herramienta vuelve a ser clave

Otra vez:

- `mvn help:effective-pom`
- `mvn -version`

Con profiles por condición, estas herramientas se vuelven todavía más importantes,
porque la activación deja de ser completamente visible como cuando usás solo `-P`.

---

## Error común 1 — abusar de perfiles automáticos

Si llenás el proyecto de activaciones automáticas,
puede volverse difícil de entender:

- qué profile está activo
- por qué
- en qué contexto
- y qué parte cambió realmente

Entonces aparece una verdad importante:

> los profiles automáticos son útiles, pero cuanto más automáticos sean, más disciplina necesitás para mantener claridad.

---

## Error común 2 — no verificar el effective POM

Con activación por condición esto es todavía más grave.

Si no verificás:
- podrías creer que un profile se activó cuando no lo hizo
- o al revés, que no se activó cuando sí lo hizo

---

## Error común 3 — usar activación por JDK sin revisar con qué JDK corre Maven

Siempre que uses eso, mirá:

```bash
mvn -version
```

porque el JDK relevante es el que Maven está usando realmente.

---

## Error común 4 — confundir `-P` con `-D`

No son lo mismo.

### `-P`
Activa profiles por nombre.

### `-D`
Pasa propiedades, que pueden influir en activaciones o configuraciones.

Esta diferencia conviene que ya te quede muy clara.

---

## Qué relación tiene esto con entornos reales

Muchísima.

En proyectos reales puede pasar que:

- ciertos builds se disparen con propiedades
- el JDK condicione ajustes
- el entorno de CI inyecte propiedades
- algunos perfiles no se activen manualmente, sino por contexto

Por eso este tema es importante:
te prepara para entender por qué Maven a veces parece “hacer cosas solo”.

---

## Ejercicio 3 — comparar activación manual vs activación por propiedad

Quiero que armes dos profiles simples:

### Uno activado manualmente
```xml
<id>manual</id>
```

### Otro activado por propiedad
```xml
<property>
    <name>modo</name>
    <value>auto</value>
</property>
```

Hacé que cada uno cambie una property distinta.
Después generá effective POM en ambos casos:

```bash
mvn help:effective-pom -Pmanual -Doutput=effective-pom-manual.xml
mvn help:effective-pom -Dmodo=auto -Doutput=effective-pom-auto.xml
```

### Objetivo
Comparar ambas lógicas de activación con algo concreto.

---

## Qué no conviene olvidar

Este tema no pretende que abandones `-P`.
De hecho, muchas veces sigue siendo la opción más clara.

Lo que sí quiere dejarte es una idea más completa:

- los profiles pueden activarse de varias formas
- esas formas tienen costos y beneficios
- y cuanto menos explícita sea la activación, más conviene inspeccionar el resultado efectivo

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Creá un profile activado por propiedad.

### Ejercicio 2
Activá ese profile con `-D...`.

### Ejercicio 3
Verificá el resultado con `help:effective-pom`.

### Ejercicio 4
Creá un profile activado por JDK.

### Ejercicio 5
Revisá con `mvn -version` qué JDK está usando Maven.

### Ejercicio 6
Verificá en el effective POM si el profile por JDK quedó activo.

### Ejercicio 7
Escribí con tus palabras qué diferencia viste entre activación manual y activación por condición.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué diferencia hay entre activar un profile con `-P` y activarlo por propiedad?
2. ¿Qué hace `-D` en Maven?
3. ¿Qué significa activar un profile por JDK?
4. ¿Por qué el effective POM es especialmente útil cuando hay activación automática?
5. ¿Qué riesgo tiene abusar de profiles activados por condiciones?

---

## Mini desafío

Creá un proyecto nuevo, por ejemplo:

- `profiles-activacion-demo`

Y hacé esto:

1. profile base manual
2. profile activado por propiedad
3. profile activado por JDK
4. effective POM para cada caso
5. nota breve explicando:
   - cuál se activó manualmente
   - cuál por condición
   - cuál dependió del JDK real

Tu objetivo es que la activación de profiles deje de ser algo binario y pase a ser una parte más rica de tu modelo mental de Maven.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este vigésimo segundo tema, ya deberías poder:

- entender que los profiles pueden activarse de distintas maneras
- usar activación por propiedad
- entender activación por JDK en un nivel inicial
- verificar resultados con effective POM
- y manejar esta flexibilidad con bastante más criterio y menos sorpresa

---

## Resumen del tema

- Los profiles no solo se activan con `-P`.
- También pueden activarse por propiedades o por JDK.
- La activación por condición vuelve al proyecto más flexible, pero también puede volverlo menos transparente si no se verifica.
- `mvn help:effective-pom` y `mvn -version` son herramientas clave para entender qué quedó realmente activo.
- Ya sumaste una capa importante de madurez en la forma de pensar configuración por contexto en Maven.

---

## Próximo tema

En el próximo tema vas a aprender a usar `settings.xml` en un nivel inicial, porque después de trabajar bastante la configuración dentro del `pom.xml`, el siguiente paso natural es entender que Maven también tiene configuración fuera del proyecto y que no todo conviene vivir dentro del mismo `pom`.
