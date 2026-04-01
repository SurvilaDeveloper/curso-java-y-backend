---
title: "Consumir desde otro proyecto un artefacto instalado localmente en Maven"
description: "Quincuagésimo primer tema práctico del curso de Maven: aprender a consumir desde otro proyecto un artefacto que instalaste localmente con Maven, verificar que install funciona como puente real entre productor y consumidor y entender mejor el rol del repositorio local."
order: 51
module: "Publicación, instalación y consumo de artefactos"
level: "intermedio"
draft: false
---

# Consumir desde otro proyecto un artefacto instalado localmente en Maven

## Objetivo del tema

En este quincuagésimo primer tema vas a:

- consumir desde otro proyecto un artefacto que vos mismo instalaste localmente
- comprobar en la práctica qué cambia después de `mvn install`
- usar el repositorio local como puente real entre un proyecto productor y un proyecto consumidor
- entender mejor cómo Maven resuelve artefactos propios sin necesidad de publicación remota
- reforzar la perspectiva de Maven del lado productor y del lado consumidor al mismo tiempo

La idea es que veas de forma concreta que `install` no es un detalle técnico menor: convierte el resultado de tu build en algo consumible por otros proyectos de tu entorno.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear proyectos Maven
- leer y modificar `pom.xml`
- entender coordenadas Maven (`groupId`, `artifactId`, `version`)
- usar `package`, `install` y distinguirlos de `deploy`
- identificar el repositorio local de Maven
- construir módulos o proyectos reutilizables como `jar`

Si hiciste el tema anterior, ya tenés la base perfecta para esta práctica.

---

## Idea central del tema

En el tema anterior viste algo muy importante:

- `package` deja el artefacto en `target/`
- `install` además lo deja disponible en el repositorio local
- `deploy` apunta a publicación remota

Ahora vas a comprobar una consecuencia clave de eso:

> si un artefacto fue instalado localmente, otro proyecto de tu máquina puede consumirlo como dependencia Maven normal.

Esta es una de las prácticas más útiles para desarrollo local,
bibliotecas propias,
módulos extraídos
o validación de artefactos antes de publicarlos remotamente.

---

## Qué vas a construir

Vas a trabajar con dos proyectos separados o conceptualmente separados:

### Proyecto productor
Genera un artefacto reutilizable, por ejemplo una librería.

### Proyecto consumidor
Declara ese artefacto como dependencia y usa sus clases.

La secuencia general será:

1. construir e instalar el productor
2. declarar la dependencia en el consumidor
3. compilar o ejecutar el consumidor
4. verificar que Maven resolvió el artefacto desde el repositorio local

---

## Una intuición muy útil

Podés pensarlo así:

- el productor fabrica la pieza
- `install` la deja en el almacén local de Maven
- el consumidor la retira de ese almacén por coordenadas

Esa imagen vale muchísimo.

---

## Primer proyecto: el productor

Podés crear un proyecto simple tipo librería con algo así:

```xml
<groupId>com.gabriel.libs</groupId>
<artifactId>saludos-core</artifactId>
<version>1.0.0-SNAPSHOT</version>
<packaging>jar</packaging>
```

Y una clase simple:

```java
package com.gabriel.libs;

public class SaludoUtil {

    public static String saludar(String nombre) {
        return "Hola " + nombre;
    }
}
```

Este proyecto no hace falta que sea complejo.
Lo importante es que produzca un `.jar` reutilizable.

---

## Primer paso práctico: instalar el productor

Ubicate en el proyecto productor y corré:

```bash
mvn clean install
```

## Qué deberías observar

Además del `.jar` en `target/`,
el artefacto debería quedar instalado en tu repositorio local,
siguiendo una ruta basada en:

- `groupId`
- `artifactId`
- `version`

Por ejemplo, algo conceptualmente parecido a:

```text
.m2/repository/com/gabriel/libs/saludos-core/1.0.0-SNAPSHOT/
```

Eso deja el artefacto listo para ser consumido por otros proyectos locales.

---

## Qué aprendiste con eso

Que el proyecto productor ya no solo “tiene un jar”,
sino que además dejó una unidad Maven resoluble por coordenadas en tu entorno.

Eso ya es muy valioso.

---

## Segundo proyecto: el consumidor

Ahora prepará otro proyecto Maven distinto,
por ejemplo:

```xml
<groupId>com.gabriel.apps</groupId>
<artifactId>app-consumidora</artifactId>
<version>1.0.0-SNAPSHOT</version>
<packaging>jar</packaging>
```

Y en su `pom.xml` agregá la dependencia al artefacto instalado localmente:

```xml
<dependencies>
    <dependency>
        <groupId>com.gabriel.libs</groupId>
        <artifactId>saludos-core</artifactId>
        <version>1.0.0-SNAPSHOT</version>
    </dependency>
</dependencies>
```

## Qué significa esto

El proyecto consumidor está diciendo:

- necesito esta librería
- y la voy a resolver por sus coordenadas Maven normales

Si el productor fue instalado correctamente,
Maven debería encontrarla en el repositorio local.

---

## Tercer paso práctico: usar la librería desde el consumidor

En el proyecto consumidor podés crear algo así:

```java
package com.gabriel.apps;

import com.gabriel.libs.SaludoUtil;

public class App {

    public static void main(String[] args) {
        System.out.println(SaludoUtil.saludar("Gabriel"));
    }
}
```

Esto deja la práctica muy visible:
- si la dependencia se resolvió bien, compila
- si no, falla

---

## Cuarto paso práctico: compilar el consumidor

Ahora, ubicado en el proyecto consumidor, corré:

```bash
mvn clean compile
```

## Qué deberías observar

Si el productor fue instalado correctamente,
el proyecto consumidor debería compilar sin problemas.

Eso confirma algo muy importante:

> el artefacto instalado localmente ya funciona como dependencia real para otro proyecto Maven.

---

## Qué aprendiste con esto

Que el repositorio local no es solo un “cache” de cosas ajenas.
También puede ser el lugar donde vos publicás localmente tus propias piezas para consumirlas desde otros proyectos.

Eso cambia mucho la forma de entender Maven.

---

## Una intuición muy útil

Podés pensarlo así:

> `install` convierte tu proyecto en una dependencia local de verdad.

Esa frase vale muchísimo.

---

## Ejercicio 1 — verificar el flujo completo

Quiero que hagas esto:

### Paso 1
Creá o usá un proyecto productor sencillo.

### Paso 2
Instalalo con:

```bash
mvn clean install
```

### Paso 3
Creá un proyecto consumidor aparte.

### Paso 4
Declará la dependencia al artefacto del productor.

### Paso 5
Usá una clase del productor dentro del consumidor.

### Paso 6
Corré:

```bash
mvn clean compile
```

### Objetivo
Ver completo el puente entre producción local e incorporación como dependencia real.

---

## Qué relación tiene esto con el tema anterior

Muy fuerte.

En el tema anterior entendiste la teoría:

- `install` publica en local

Ahora comprobás la consecuencia práctica:

- otro proyecto realmente puede consumir ese artefacto

Entonces aparece una verdad importante:

> este tema convierte la diferencia entre `package` e `install` en una experiencia visible y comprobable.

---

## Qué diferencia habría si solo hubieras hecho package

Esto es central.

Si en el proyecto productor solo hubieras corrido:

```bash
mvn clean package
```

tendrías el `.jar` en `target/`,
pero el consumidor no podría resolverlo automáticamente por coordenadas Maven normales desde el repositorio local.

Entonces aparece otra idea importante:

> tener un `.jar` en `target/` no es lo mismo que tener un artefacto instalado como dependencia Maven consumible.

Esa diferencia conviene que te quede grabadísima.

---

## Ejercicio 2 — probar mentalmente el caso sin install

Quiero que respondas:

> ¿Qué cambiaría si el proyecto productor tuviera el `.jar` en `target/` pero nunca hubiera pasado por `mvn install`?

### Objetivo
Que refuerces la diferencia entre archivo construido y artefacto publicado localmente.

---

## Qué relación tiene esto con módulos internos y proyectos separados

También es muy importante.

En multi-módulo,
muchas veces construís todo desde una misma raíz y Maven coordina relaciones entre módulos.

Pero fuera de una misma raíz,
`install` te permite trabajar con proyectos separados y aun así consumir un artefacto propio.

Entonces aparece una idea importante:

> `install` es especialmente útil cuando productor y consumidor no están coordinados dentro de la misma estructura multi-módulo, pero sí comparten el mismo entorno local Maven.

Esto lo vuelve muy útil en desarrollo real.

---

## Qué relación tiene esto con snapshots

Muy fuerte.

Si tu artefacto usa una versión como:

```text
1.0.0-SNAPSHOT
```

eso te da una forma natural de iterar localmente mientras evolucionás la librería y el consumidor.

No hace falta abrir toda la teoría de snapshots todavía.
Pero ya podés sentir por qué esto aparece tanto en desarrollo local.

---

## Qué herramientas conviene usar para verificar

En este tema hay varias muy útiles:

### Revisar el repositorio local
Para confirmar que el productor quedó instalado.

### `mvn clean compile`
En el consumidor, para ver si resuelve correctamente.

### `mvn dependency:tree`
En el consumidor, para ver la dependencia resuelta.

Esta última herramienta vuelve a ser especialmente valiosa.

---

## Ejercicio 3 — usar dependency:tree en el consumidor

Ubicate en el proyecto consumidor y corré:

```bash
mvn dependency:tree
```

### Qué deberías buscar
El artefacto del productor,
por ejemplo:

- `com.gabriel.libs:saludos-core:1.0.0-SNAPSHOT`

### Objetivo
Ver que la dependencia no solo está escrita en el `pom.xml`,
sino resuelta efectivamente por Maven en el consumidor.

---

## Qué relación tiene esto con deploy

Este tema también te prepara mentalmente para entender mejor `deploy`.

Porque ahora ya ves una progresión muy clara:

- `package` = artefacto construido
- `install` = artefacto consumible localmente
- `deploy` = artefacto consumible remotamente

Entonces el sistema conceptual ya empieza a quedar muy sólido.

---

## Una intuición muy útil

Podés pensarlo así:

- `package` deja listo el producto
- `install` lo pone en la góndola local
- `deploy` lo pondría en una góndola compartida o remota

Esa imagen ayuda muchísimo.

---

## Error común 1 — creer que el consumidor puede resolver automáticamente cualquier jar suelto que exista en target

No.
Maven resuelve por coordenadas y repositorios,
no por “magia” mirando tu carpeta `target` de otro proyecto.

---

## Error común 2 — cambiar el código del productor pero olvidarte de reinstalarlo

Si cambiaste la librería y no volviste a correr `mvn install`,
el consumidor puede seguir usando la versión previamente instalada.
Eso es importantísimo.

---

## Error común 3 — pensar que instalar localmente ya equivale a compartir con otros desarrolladores

No.
Sigue siendo una publicación local a tu entorno.

---

## Error común 4 — no usar dependency:tree para confirmar que el consumidor está viendo realmente lo que creés que ve

En este tema, esa verificación vale oro.

---

## Qué no conviene olvidar

Este tema no pretende que todavía publiques a repositorios remotos reales.
Todavía no hace falta.

Lo que sí quiere dejarte es una comprensión muy fuerte y práctica:

- un proyecto puede producir un artefacto
- `install` lo vuelve consumible localmente
- otro proyecto puede resolverlo como dependencia Maven normal
- y eso convierte el repositorio local en un puente real entre productor y consumidor

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Creá o usá un proyecto productor simple con una clase reutilizable.

### Ejercicio 2
Corré en él:

```bash
mvn clean install
```

### Ejercicio 3
Creá o usá un proyecto consumidor separado.

### Ejercicio 4
Agregá la dependencia al artefacto instalado localmente.

### Ejercicio 5
Usá una clase del productor en el consumidor.

### Ejercicio 6
Corré en el consumidor:

```bash
mvn clean compile
```

### Ejercicio 7
Corré también:

```bash
mvn dependency:tree
```

### Ejercicio 8
Escribí con tus palabras qué te mostró este tema sobre el rol real de `install`.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué cambió después de correr `mvn install` en el proyecto productor?
2. ¿Por qué el consumidor puede resolver la dependencia después de eso?
3. ¿Qué diferencia hay entre un jar en `target/` y un artefacto instalado localmente?
4. ¿Qué te muestra `dependency:tree` en el consumidor?
5. ¿Por qué este tema ayuda a entender Maven del lado productor y consumidor al mismo tiempo?

---

## Mini desafío

Hacé una práctica completa:

1. creá un productor con una clase reutilizable
2. instalalo localmente
3. creá un consumidor aparte
4. consumí la librería por coordenadas Maven
5. compilá el consumidor
6. revisá su `dependency:tree`
7. escribí una nota breve explicando cómo este tema convierte el repositorio local en una pieza central del flujo real entre proyectos

Tu objetivo es que `install` deje de sentirse como “otro comando más” y pase a verse como un puente concreto entre construir artefactos y hacer que otros proyectos los consuman de verdad.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este quincuagésimo primer tema, ya deberías poder:

- instalar un artefacto propio en el repositorio local
- consumirlo desde otro proyecto Maven
- distinguir con claridad entre artefacto construido y artefacto publicado localmente
- verificar la dependencia resuelta en el consumidor
- y entender el rol del repositorio local como puente real entre productor y consumidor

---

## Resumen del tema

- `mvn install` no solo construye; también deja el artefacto disponible para otros proyectos locales.
- Otro proyecto puede consumirlo como dependencia Maven normal usando sus coordenadas.
- Un `.jar` en `target/` no equivale a una publicación local resoluble por Maven.
- `dependency:tree` ayuda a verificar que el consumidor realmente está usando el artefacto instalado.
- Este tema refuerza la lógica completa entre producción y consumo de artefactos en Maven.
- Ya diste otro paso importante hacia una comprensión mucho más práctica y profesional de Maven.

---

## Próximo tema

En el próximo tema vas a aprender a empezar a configurar `distributionManagement` y a entender qué rol cumple cuando querés pensar publicación remota más seriamente, porque después de comprobar cómo funciona la publicación local con `install`, el siguiente paso natural es entender qué pieza del `pom.xml` entra en juego cuando querés ir hacia `deploy`.
