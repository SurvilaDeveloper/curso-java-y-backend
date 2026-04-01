---
title: "Usar mirrors en Maven con settings.xml"
description: "Vigésimo sexto tema práctico del curso de Maven: aprender qué es un mirror en Maven, para qué sirve, cómo se configura en settings.xml y por qué esta pieza es importante para controlar desde dónde Maven intenta obtener artefactos."
order: 26
module: "Configuración por contexto y entornos"
level: "base"
draft: false
---

# Usar `mirrors` en Maven con `settings.xml`

## Objetivo del tema

En este vigésimo sexto tema vas a:

- entender qué es un `mirror` en Maven
- ver qué problema resuelve
- aprender la estructura básica de configuración en `settings.xml`
- distinguir entre el repositorio original y el mirror que Maven termina usando
- reforzar la idea de que parte importante del comportamiento de Maven se controla fuera del `pom.xml`

La idea es que empieces a entender no solo dónde Maven guarda artefactos localmente, sino también cómo puede decidir desde dónde intentar obtenerlos en tu entorno.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear un proyecto Maven
- leer y modificar el `pom.xml`
- entender qué es `settings.xml`
- ubicar `.m2`
- distinguir entre configuración del proyecto y configuración del entorno
- trabajar con profiles en `settings.xml`
- cambiar el repositorio local de Maven

Si hiciste los temas anteriores, ya estás listo para este paso.

---

## Idea central del tema

Hasta ahora viste dos ideas muy importantes:

- Maven guarda artefactos en un repositorio local
- `settings.xml` permite cambiar parte del comportamiento del entorno Maven

Ahora aparece otra pieza muy relevante:

```xml
<mirrors>
    ...
</mirrors>
```

Esto sirve para decirle a Maven algo como:

- “cuando quieras ir a cierto repositorio, en realidad usá este otro como espejo”

Dicho simple:

> un `mirror` en Maven es una forma de redirigir desde dónde Maven intenta descargar artefactos.

---

## Qué es un mirror

Un mirror es un repositorio alternativo que Maven usa como reemplazo o espejo de otro repositorio.

No significa que el repositorio original “deje de existir”.
Significa que Maven, en tu entorno, puede decidir usar el mirror en lugar del repositorio original al resolver artefactos.

Entonces aparece una idea muy importante:

> el mirror no cambia la identidad del proyecto; cambia la ruta por la que Maven intenta llegar a los artefactos desde tu entorno.

---

## Una intuición muy útil

Podés pensarlo así:

- el proyecto necesita ciertas dependencias
- Maven sabe de qué repositorios podrían venir
- el mirror le dice: “en vez de ir directo ahí, pasá por este otro lugar”

Esa imagen ordena muchísimo.

---

## Por qué alguien usaría mirrors

Puede haber varios motivos prácticos:

- acelerar descargas usando una infraestructura más cercana o controlada
- centralizar resolución dentro de una organización
- reducir dependencias directas de ciertos repositorios externos
- aplicar una política de acceso a artefactos
- trabajar con infraestructura corporativa o controlada

No hace falta que hoy uses un mirror real de trabajo.
Lo importante es entender la lógica y la sintaxis.

---

## Dónde se configura un mirror

Los mirrors se configuran en:

```text
settings.xml
```

Esto tiene muchísimo sentido,
porque otra vez estamos hablando de una decisión del entorno Maven,
no de la identidad del proyecto.

Entonces aparece una verdad importante:

> si el proyecto debería seguir siendo portable, pero cada entorno puede decidir por dónde resolver artefactos, entonces `settings.xml` es el lugar lógico para los mirrors.

---

## Estructura básica de un mirror

La forma general es así:

```xml
<settings ...>
    <mirrors>
        <mirror>
            <id>mi-mirror</id>
            <name>Mirror de ejemplo</name>
            <url>https://repo.ejemplo.com/maven2</url>
            <mirrorOf>central</mirrorOf>
        </mirror>
    </mirrors>
</settings>
```

---

## Qué significa cada parte

### `id`
Identifica al mirror.

### `name`
Nombre descriptivo, humano.

### `url`
Dirección del repositorio espejo que Maven debería usar.

### `mirrorOf`
Indica a qué repositorio o repositorios está espejando.

Esta última es la clave conceptual.

---

## Qué significa `mirrorOf`

Es el campo que le dice a Maven:

- qué repositorio original debería quedar cubierto por este mirror

Por ejemplo:

```xml
<mirrorOf>central</mirrorOf>
```

significa:
- usá este mirror cuando lo que normalmente se resolvería contra `central` tenga que descargarse

No hace falta que hoy abras todos los patrones posibles.
Lo importante es entender la idea básica:
- el mirror no existe “en el aire”
- refleja o reemplaza a algo identificado por `mirrorOf`

---

## Primer ejemplo simple

Supongamos que querés definir un mirror de ejemplo para `central`.

Tu `settings.xml` podría tener algo como:

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 https://maven.apache.org/xsd/settings-1.0.0.xsd">

    <mirrors>
        <mirror>
            <id>mi-mirror-central</id>
            <name>Mirror de ejemplo para central</name>
            <url>https://repo.ejemplo.com/maven2</url>
            <mirrorOf>central</mirrorOf>
        </mirror>
    </mirrors>

</settings>
```

### Atención
La URL de ejemplo no es para que la uses tal cual.
Es solo para entender la estructura.

---

## Qué conviene entender antes de probar en serio

Un mirror mal configurado puede hacer que Maven no pueda resolver dependencias correctamente.

Por eso, en este tema, el foco principal está en:

- entender la estructura
- entender el rol
- entender por qué vive en `settings.xml`

Si querés probar con una URL real de tu entorno, perfecto.
Si no, igual el aprendizaje conceptual ya vale muchísimo.

---

## Qué relación tiene esto con central

En muchos proyectos Maven, una gran parte de las dependencias terminan resolviéndose desde el repositorio central.

Entonces cuando ves algo como:

```xml
<mirrorOf>central</mirrorOf>
```

estás tocando una parte muy importante del comportamiento habitual de Maven.

No hace falta profundizar todavía en todos los repositorios posibles.
Por ahora alcanza con entender que “central” es una referencia muy frecuente en el ecosistema Maven.

---

## Primer ejercicio conceptual importante

Quiero que respondas esto con tus palabras:

> Si configurás un mirror para `central`, ¿qué estás cambiando exactamente: el proyecto, el entorno o ambos?

La respuesta importante que quiero que empieces a ver es:
- cambia el comportamiento del entorno Maven
- no la identidad del proyecto en sí

---

## Ejercicio 1 — agregar un bloque mirrors al settings.xml

Quiero que hagas esto:

### Paso 1
Abrí tu `settings.xml`.

### Paso 2
Agregá un bloque `mirrors` con estructura correcta,
aunque uses una URL de ejemplo solo para practicar estructura.

Por ejemplo:

```xml
<mirrors>
    <mirror>
        <id>mi-mirror-central</id>
        <name>Mirror de ejemplo para central</name>
        <url>https://repo.ejemplo.com/maven2</url>
        <mirrorOf>central</mirrorOf>
    </mirror>
</mirrors>
```

### Paso 3
Guardá el archivo.

### Objetivo
Familiarizarte con la sintaxis y con el lugar correcto donde vive esta configuración.

---

## Qué diferencia hay entre repositorio local y mirror

Esto conviene dejarlo clarísimo.

### Repositorio local
Es donde Maven guarda artefactos en tu máquina.

### Mirror
Es una configuración que puede cambiar desde dónde Maven intenta obtener artefactos antes de guardarlos localmente.

Dicho simple:

- localRepository = dónde se guardan
- mirror = por dónde se intentan obtener

Esta diferencia es muy importante.

---

## Una intuición muy útil

Podés pensarlo así:

> el repositorio local mira “hacia adentro” de tu máquina; el mirror cambia “hacia dónde mira” Maven cuando sale a buscar artefactos.

Esa frase vale muchísimo.

---

## Qué relación tiene esto con el pom.xml

Muy fuerte.

Otra vez aparece la misma lógica sana que venís construyendo:

- si una configuración pertenece al entorno,
  no conviene enterrarla dentro del proyecto

El `pom.xml` debería seguir contando:
- qué es el proyecto
- qué usa
- cómo se construye

`settings.xml` debería seguir contando:
- cómo se comporta Maven en tu entorno para resolver o gestionar ciertas cosas

Entonces aparece una verdad importante:

> un mirror bien pensado es una decisión de infraestructura o entorno, no una característica esencial del proyecto.

---

## Qué no conviene hacer

No conviene:

- meter mirrors en el `pom.xml` solo porque querés que “ande en tu máquina”
- usar URLs inventadas en serio sin saber que pueden romper resolución
- olvidar que los mirrors pueden afectar muchas resoluciones del build
- ni tocar esta configuración sin entender que modifica el comportamiento del entorno Maven

---

## Error común 1 — creer que mirror y repositorio local son lo mismo

No.
Cumplen funciones distintas.

---

## Error común 2 — asumir que cambiar un mirror cambia el proyecto

No.
Lo que cambia es cómo tu Maven intenta resolver dependencias en tu entorno.

---

## Error común 3 — no entender el rol de mirrorOf

`mirrorOf` es la pieza clave para saber qué repositorio está siendo espejado o reemplazado en la práctica.

Si no entendés eso,
el bloque pierde mucho sentido.

---

## Error común 4 — probar mirrors reales sin control y sorprenderte si falla el build

Si vas a probar algo real,
hacelo sabiendo que podrías afectar la resolución de dependencias.
En este tema inicial no hace falta forzar una configuración productiva para aprender la idea.

---

## Ejercicio 2 — comparar conceptos clave

Quiero que armes una mini tabla o lista con estas entradas:

- `pom.xml`
- `settings.xml`
- `localRepository`
- `mirror`
- `mirrorOf`

Y al lado escribas con tus palabras qué representa cada una.

### Objetivo
Ordenar mejor el mapa mental de la configuración Maven.

---

## Qué relación tiene esto con entornos corporativos o más avanzados

Muchísima.

En muchos contextos reales,
los mirrors se usan para que el equipo o la organización no dependa directamente de ciertos repositorios externos.

No hace falta abrir toda esa complejidad hoy.
Pero sí conviene que sepas que este tema no es decorativo:
- es muy real
- y muy usado en entornos serios

---

## Ejercicio 3 — pensar un caso práctico

Respondé esta pregunta:

> Si una organización quiere controlar desde dónde sus desarrolladores obtienen artefactos Maven, ¿te suena más lógico resolver eso en el `pom.xml` o en `settings.xml`? ¿Por qué?

Este ejercicio te ayuda a ver que la lógica de infraestructura y entorno tiene muchísimo más sentido fuera del proyecto.

---

## Qué no conviene olvidar

Este tema no pretende que ya domines toda la política de repositorios de Maven.

Lo que sí quiere dejarte es una base fuerte:

- qué es un mirror
- qué problema resuelve
- dónde se configura
- por qué pertenece al entorno
- y en qué se diferencia del repositorio local

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Abrí `settings.xml`.

### Ejercicio 2
Agregá un bloque `mirrors` con sintaxis correcta.

### Ejercicio 3
Definí:
- `id`
- `name`
- `url`
- `mirrorOf`

### Ejercicio 4
Escribí con tus palabras qué función cumple cada una de esas partes.

### Ejercicio 5
Respondé por qué esta configuración vive en `settings.xml` y no en el `pom.xml`.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es un mirror en Maven?
2. ¿Qué problema resuelve?
3. ¿Dónde se configura?
4. ¿Qué significa `mirrorOf`?
5. ¿Qué diferencia hay entre un mirror y el repositorio local?

---

## Mini desafío

Hacé una práctica completa y conceptual:

1. abrí o creá tu `settings.xml`
2. agregá un mirror de ejemplo para `central`
3. dejá la sintaxis bien formada
4. escribí una nota breve explicando:
   - qué estaría cambiando Maven si ese mirror fuera real
   - qué no estaría cambiando del proyecto
   - y por qué eso demuestra que la resolución de artefactos también pertenece al entorno

Tu objetivo es que `mirrors` deje de parecer una palabra rara y pase a ser una pieza comprensible dentro del mapa de configuración de Maven.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este vigésimo sexto tema, ya deberías poder:

- entender qué es un mirror
- escribir un bloque `mirrors` válido en `settings.xml`
- distinguirlo claramente del repositorio local
- explicar qué hace `mirrorOf`
- y ver una parte importante de cómo Maven controla la resolución desde la capa de entorno

---

## Resumen del tema

- Un mirror en Maven redirige desde dónde se intentan obtener artefactos.
- Se configura en `settings.xml`, porque pertenece al entorno.
- `mirrorOf` indica qué repositorio está siendo espejado.
- No es lo mismo que el repositorio local.
- Esta configuración no cambia la identidad del proyecto, sino el comportamiento del entorno Maven.
- Ya entendiste una pieza muy importante de cómo Maven puede controlar la resolución de artefactos fuera del `pom.xml`.

---

## Próximo tema

En el próximo tema vas a aprender a entender mejor la resolución de plugins en Maven y por qué a veces también se descargan artefactos que no son dependencias de tu proyecto, porque después de ver cómo Maven busca dependencias desde distintos lugares, el siguiente paso natural es distinguir que no todo lo que descarga son librerías de negocio: también hay plugins que forman parte del build.
