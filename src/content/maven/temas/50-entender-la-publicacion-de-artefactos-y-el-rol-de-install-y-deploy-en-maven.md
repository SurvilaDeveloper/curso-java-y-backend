---
title: "Entender la publicación de artefactos y el rol de install y deploy en Maven"
description: "Quincuagésimo tema práctico del curso de Maven: aprender la diferencia entre install y deploy, entender qué significa publicar un artefacto en Maven y empezar a pensar el proyecto no solo como consumidor de dependencias, sino también como productor de artefactos para otros."
order: 50
module: "Publicación, instalación y consumo de artefactos"
level: "intermedio"
draft: false
---

# Entender la publicación de artefactos y el rol de `install` y `deploy` en Maven

## Objetivo del tema

En este quincuagésimo tema vas a:

- entender qué significa publicar un artefacto en Maven
- distinguir claramente entre `install` y `deploy`
- ver la diferencia entre repositorio local y repositorio remoto
- empezar a pensar tus proyectos como productores de artefactos consumibles por otros
- conectar build, empaquetado y publicación en una visión más completa del ciclo de vida Maven

La idea es que dejes de mirar Maven solo desde el lado de “consumir dependencias” y empieces a verlo también desde el lado de “producir y publicar artefactos” para otros proyectos o módulos.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear proyectos Maven
- leer y modificar `pom.xml`
- entender el lifecycle básico
- usar `compile`, `test`, `package`, `install`
- entender artefactos, `.jar`, manifest y módulos reutilizables
- distinguir repositorio local y configuración de entorno
- tener una base clara de proyectos multi-módulo y librerías internas

Si venís siguiendo el roadmap, ya estás muy bien parado para este paso.

---

## Por qué este tema importa tanto

Hasta ahora usaste Maven muchísimo como consumidor:

- consumiste dependencias
- resolviste librerías
- importaste políticas de versiones
- usaste módulos internos como si fueran librerías del sistema

Pero para que eso exista, alguien tuvo que producir y dejar disponible esos artefactos.

Entonces aparece una idea muy importante:

> Maven no solo sirve para usar artefactos; también sirve para construirlos, instalarlos y publicarlos para que otros los consuman.

Ese cambio de perspectiva es clave.

---

## Idea central del tema

Cuando construís un proyecto Maven, obtenés un artefacto como:

- un `.jar`
- un `pom`
- u otro tipo de salida según el packaging

Pero ese artefacto puede quedar en distintos lugares según el comando que uses.

Ahí aparecen dos verbos muy importantes del ciclo Maven:

- `install`
- `deploy`

Y la diferencia entre ambos es fundamental.

---

## Recordatorio: qué hace package

Repasemos primero algo básico.

Cuando corrés:

```bash
mvn package
```

Maven construye el artefacto del proyecto y lo deja normalmente en:

```text
target/
```

Por ejemplo:

```text
target/mi-proyecto-1.0.0-SNAPSHOT.jar
```

Eso significa:
- el artefacto existe
- pero todavía no fue instalado en el repositorio local ni publicado a uno remoto

Entonces aparece una idea importante:

> `package` produce el artefacto, pero no lo publica ni local ni remotamente.

---

## Qué hace install

Cuando corrés:

```bash
mvn install
```

Maven:

- construye el artefacto si hace falta
- y además lo instala en tu repositorio local

O sea, en una ubicación tipo:

```text
~/.m2/repository
```

o la ruta equivalente configurada en tu entorno.

Dicho simple:

> `install` deja el artefacto disponible para tu propia máquina o entorno local Maven.

---

## Una intuición muy útil

Podés pensarlo así:

- `package` = lo construyo
- `install` = lo dejo disponible localmente para ser consumido por otros proyectos en mi entorno

Esa frase vale muchísimo.

---

## Qué hace deploy

Cuando corrés:

```bash
mvn deploy
```

Maven:

- construye el artefacto si hace falta
- puede instalarlo localmente en el proceso
- y además intenta publicarlo en un repositorio remoto configurado

Dicho simple:

> `deploy` está orientado a dejar el artefacto disponible más allá de tu máquina, en un repositorio remoto para otros consumidores.

Esa es la gran diferencia con `install`.

---

## Una intuición muy útil

Podés pensarlo así:

- `install` = publico para mí o para mi entorno local
- `deploy` = publico para otros entornos o consumidores remotos

Esa distinción es central.

---

## Qué es “publicar” un artefacto en Maven

Publicar significa dejar un artefacto en un repositorio Maven desde donde otros proyectos puedan resolverlo por coordenadas.

Por ejemplo, si tenés un artefacto con:

- `groupId`
- `artifactId`
- `version`

y está disponible en un repositorio adecuado,
otro proyecto puede declararlo como dependencia y Maven puede resolverlo.

Entonces aparece una verdad importante:

> publicar un artefacto en Maven significa convertir el resultado de tu build en una dependencia consumible por otros.

Eso conecta perfecto con todo lo que venías aprendiendo del lado consumidor.

---

## Qué diferencia hay entre repositorio local y repositorio remoto

Esto conviene dejarlo clarísimo.

### Repositorio local
Es el de tu máquina.
Suele vivir en `.m2/repository` o donde lo hayas configurado.

### Repositorio remoto
Es un repositorio accesible fuera de tu entorno local,
pensado para compartir artefactos con otros proyectos, máquinas o equipos.

Entonces:

- `install` apunta al local
- `deploy` apunta al remoto

Esta diferencia es una de las más importantes de todo Maven.

---

## Primer ejemplo conceptual

Imaginá que construís una librería interna:

- `com.gabriel.libs`
- `utilidades-texto`
- `1.0.0-SNAPSHOT`

### Si corrés `mvn install`
La librería queda disponible para otros proyectos de tu máquina.

### Si corrés `mvn deploy`
La librería podría quedar disponible en un repositorio remoto configurado para que otros entornos también la consuman.

Esa diferencia ya da muchísimo contexto práctico.

---

## Qué relación tiene esto con los módulos reutilizables que ya viste

Muy fuerte.

En los temas anteriores viste que un módulo como `modulo-core` podía actuar como librería interna reutilizable.

Bueno:
ese módulo ya te estaba preparando mentalmente para este tema.

Porque en el fondo,
un módulo empaquetado como `jar`:

- es un artefacto real
- tiene coordenadas reales
- puede ser consumido por otros
- y dependiendo del flujo, puede quedarse en local o publicarse más allá

Entonces aparece otra idea importante:

> una librería interna multi-módulo y un artefacto Maven publicable comparten la misma lógica esencial: son piezas construidas para ser consumidas por otros.

---

## Primer experimento práctico: sentir la diferencia entre package e install

Quiero que hagas esto con un proyecto simple o con uno de tus módulos reutilizables.

### Paso 1
Corré:

```bash
mvn clean package
```

### Paso 2
Verificá el artefacto en `target/`.

### Paso 3
Ahora corré:

```bash
mvn clean install
```

### Paso 4
Buscá el artefacto en el repositorio local, siguiendo la ruta por:
- `groupId`
- `artifactId`
- `version`

## Qué deberías observar

Después de `install`, además del artefacto en `target/`,
debería existir una copia instalada en el repositorio local Maven.

### Objetivo
Ver de forma muy concreta que `install` agrega una nueva “disponibilidad” al artefacto.

---

## Qué aprendiste con esto

Que el artefacto no solo existe como archivo suelto en `target/`,
sino también como pieza resoluble por Maven dentro de tu entorno local.

Eso ya es muy valioso.

---

## Qué relación tiene esto con proyectos consumidores

Muchísima.

Si otro proyecto de tu máquina declara una dependencia con esas coordenadas,
Maven puede encontrarla en el repositorio local si fue instalada correctamente.

Entonces aparece una verdad importante:

> `install` convierte un artefacto construido en una dependencia localmente consumible por otros proyectos.

Eso es el puente perfecto entre producción y consumo.

---

## Segundo experimento práctico: pensar deploy aunque no lo ejecutes todavía

En este tema no hace falta que ya tengas un repositorio remoto real configurado.
Lo importante primero es entender el rol de `deploy`.

Pensalo así:

- `package` deja el artefacto en `target`
- `install` lo deja en local
- `deploy` lo empuja a un repositorio remoto configurado

Esto te da una progresión muy clara del lifecycle desde el punto de vista de publicación.

---

## Qué hace que deploy sea más exigente

Porque para `deploy` ya no alcanza con que el artefacto exista.
También necesitás cosas como:

- un destino remoto
- configuración adecuada
- muchas veces credenciales
- una estrategia de publicación

No hace falta abrir todo eso hoy.
Lo importante es ver que `deploy` implica un salto de responsabilidad.

---

## Una intuición muy útil

Podés pensarlo así:

> cuanto más lejos querés que viaje tu artefacto, más infraestructura y más intención necesita Maven.

Esa frase vale muchísimo.

---

## Qué relación tiene esto con settings.xml

Muy fuerte.

Recordá que en temas anteriores viste `settings.xml` como capa de configuración de entorno.

Bueno:
cuando más adelante trabajes seriamente con publicación remota,
esa capa suele volverse muy importante.

No hace falta profundizar todavía.
Solo quiero que empieces a conectar:

- build produce
- install deja en local
- deploy publica remoto
- y la configuración del entorno también importa

Eso ya te deja un mapa mucho más realista.

---

## Ejercicio 1 — escribir la diferencia con tus palabras

Quiero que hagas esto:

Respondé por escrito:

- ¿Qué hace `package`?
- ¿Qué agrega `install`?
- ¿Qué agrega `deploy`?

### Objetivo
Que la diferencia deje de ser una lista memorizada y pase a ser una idea clara en tu propia cabeza.

---

## Qué relación tiene esto con repositorio local como herramienta de desarrollo

Muchísima.

A veces `install` no es solo “un paso más”:
es la manera concreta de probar cómo otro proyecto consumiría tu artefacto sin haberlo publicado remotamente todavía.

Eso es muy útil en desarrollo local,
en librerías internas
o en pruebas controladas.

Entonces aparece una idea importante:

> el repositorio local también puede funcionar como una etapa intermedia muy útil entre construir tu artefacto y pensar en publicarlo para otros de forma remota.

---

## Qué relación tiene esto con snapshots

No hace falta que hoy abras toda la teoría,
pero sí conviene mencionar algo:
si usás versiones como:

```text
1.0.0-SNAPSHOT
```

estás en un terreno muy típico de desarrollo y evolución del artefacto.

Más adelante esto va a importar todavía más cuando pienses publicación más seria.
Por ahora alcanza con notar que:
- la publicación también se conecta con la estrategia de versionado.

---

## Error común 1 — creer que package e install son casi lo mismo

No.
`install` agrega la instalación en el repositorio local,
y eso cambia muchísimo el rol del artefacto.

---

## Error común 2 — pensar que install ya es publicación remota

No.
Sigue siendo local a tu entorno Maven.

---

## Error común 3 — pensar que deploy es solo “otro build más”

No.
Implica una intención distinta:
poner el artefacto a disposición fuera de tu entorno local.

---

## Error común 4 — no revisar físicamente el repositorio local después de install

En este tema, hacerlo ayuda muchísimo a que la idea se vuelva concreta.

---

## Ejercicio 2 — rastrear el artefacto instalado

Quiero que hagas esto:

### Paso 1
Tomá un proyecto o módulo con coordenadas claras.

### Paso 2
Corré:

```bash
mvn clean install
```

### Paso 3
Buscá en el repositorio local la ruta correspondiente.

Por ejemplo, si el `groupId` fuera algo como:

```text
com.gabriel.mavencurso
```

recordá que suele mapear a carpetas.

### Paso 4
Verificá que están:
- el `.jar`
- el `.pom`
- y otros archivos relacionados si aparecen

### Objetivo
Ver con tus propios ojos que el artefacto quedó instalado como unidad Maven completa.

---

## Qué relación tiene esto con multi-módulo

También importa mucho.

En sistemas multi-módulo,
la publicación de artefactos y la posibilidad de consumirlos localmente o remotamente vuelve todavía más real la idea de módulos como piezas reutilizables.

Entonces el multi-módulo ya no es solo arquitectura interna.
También puede conectarse con cómo esas piezas podrían circular más allá de la raíz actual.

Eso es un paso grande en madurez.

---

## Ejercicio 3 — pensar desde el lado del consumidor

Respondé esta pregunta:

> Si vos fueras otro proyecto Maven en la misma máquina, ¿qué diferencia habría entre que una librería esté solo en `target/` y que además haya pasado por `mvn install`?

### Objetivo
Ver el artefacto desde el punto de vista de quien lo quiere consumir.

---

## Qué no conviene olvidar

Este tema no pretende que hoy ya publiques a un repositorio remoto real.
Todavía no hace falta.

Lo que sí quiere dejarte es una base muy sólida:

- construir no es publicar
- `install` no es `deploy`
- y un artefacto Maven puede ir ganando niveles de disponibilidad

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Tomá un proyecto o módulo empaquetable como `jar`.

### Ejercicio 2
Corré:

```bash
mvn clean package
```

### Ejercicio 3
Verificá el artefacto en `target/`.

### Ejercicio 4
Corré:

```bash
mvn clean install
```

### Ejercicio 5
Buscá el artefacto en el repositorio local.

### Ejercicio 6
Escribí con tus palabras qué cambió entre `package` e `install`.

### Ejercicio 7
Explicá también qué agregaría `deploy` aunque todavía no lo ejecutes.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué significa publicar un artefacto en Maven?
2. ¿Qué hace `package`?
3. ¿Qué hace `install` que `package` no hace?
4. ¿Qué hace `deploy` que `install` no hace?
5. ¿Por qué esta diferencia es tan importante para entender Maven del lado productor y no solo del lado consumidor?

---

## Mini desafío

Hacé una práctica completa:

1. elegí un proyecto o módulo reutilizable
2. corré `mvn clean package`
3. revisá `target/`
4. corré `mvn clean install`
5. revisá el repositorio local
6. escribí una nota breve explicando:
   - qué era el artefacto antes de `install`
   - qué pasó después de `install`
   - y qué significaría un paso adicional hacia `deploy`

Tu objetivo es que Maven deje de parecerte solo una herramienta para usar librerías ajenas y pase a sentirse también como una herramienta para preparar y publicar artefactos propios.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este quincuagésimo tema, ya deberías poder:

- distinguir claramente entre `package`, `install` y `deploy`
- entender qué significa publicar un artefacto
- ver el repositorio local como etapa real de publicación local
- pensar tus proyectos o módulos como productores de piezas consumibles
- y leer Maven con una perspectiva mucho más completa y profesional

---

## Resumen del tema

- `package` produce el artefacto en `target/`.
- `install` además lo deja disponible en el repositorio local.
- `deploy` apunta a publicarlo en un repositorio remoto.
- Publicar un artefacto significa volverlo consumible por otros proyectos Maven.
- Este tema cambia mucho la perspectiva: ya no solo consumís artefactos, también empezás a pensar cómo producirlos y disponibilizarlos.
- Ya diste un paso importante hacia el Maven del lado productor, no solo del lado consumidor.

---

## Próximo tema

En el próximo tema vas a aprender a consumir desde otro proyecto un artefacto que vos mismo instalaste localmente, porque después de entender qué cambia con `install`, el siguiente paso natural es comprobar del lado consumidor que esa publicación local realmente funciona como puente entre dos proyectos Maven.
