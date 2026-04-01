---
title: "Elegir entre install, multi-módulo y publicación remota en Maven"
description: "Quincuagésimo cuarto tema práctico del curso de Maven: aprender a decidir cuándo conviene usar install local, una estructura multi-módulo o publicación remota, desarrollando criterio para elegir la estrategia adecuada según el contexto del proyecto y del equipo."
order: 54
module: "Publicación, instalación y consumo de artefactos"
level: "intermedio"
draft: false
---

# Elegir entre `install`, multi-módulo y publicación remota en Maven

## Objetivo del tema

En este quincuagésimo cuarto tema vas a:

- comparar tres estrategias distintas de consumo y circulación de artefactos en Maven
- entender cuándo conviene apoyarte en `install`
- entender cuándo conviene trabajar con una estructura multi-módulo
- entender cuándo empieza a tener sentido pensar en publicación remota
- desarrollar criterio para elegir la estrategia adecuada según el contexto real del proyecto y del equipo

La idea es que no te quedes solo con la parte técnica de cada herramienta, sino que empieces a decidir con más madurez cuál encaja mejor según la situación.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- distinguir entre `package`, `install` y `deploy`
- entender repositorio local y repositorio remoto
- consumir un artefacto instalado localmente desde otro proyecto
- trabajar con estructuras multi-módulo
- entender `distributionManagement`
- conectar conceptualmente `distributionManagement` con `settings.xml`

Si hiciste los temas anteriores, ya estás listo para este paso.

---

## Idea central del tema

Hasta ahora viste varias formas de relacionar proyectos, módulos y artefactos en Maven.

Por ejemplo:

- módulos dentro de una misma raíz multi-módulo
- artefactos instalados localmente con `install`
- publicación remota pensada alrededor de `deploy`

Todas sirven.
Pero no todas convienen siempre.

Entonces aparece una pregunta muchísimo más importante que la sintaxis:

> ¿cuándo conviene cada una?

Ese es justamente el corazón de este tema.

---

## Por qué este tema importa tanto

Porque en Maven no alcanza con saber “cómo” hacer algo.
También necesitás saber:

- cuándo conviene hacerlo
- cuándo es demasiado
- cuándo es insuficiente
- y qué costo de mantenimiento implica cada estrategia

Si no desarrollás este criterio,
podés terminar:

- forzando multi-módulo donde no hacía falta
- publicando remotamente algo que todavía era puro trabajo local
- o apoyándote demasiado en `install` cuando el equipo ya necesitaba algo compartido y más serio

Entonces aparece una idea muy importante:

> la madurez en Maven no está solo en conocer comandos y bloques XML, sino en elegir la estrategia de circulación de artefactos adecuada para el momento del proyecto.

---

## Primera estrategia: install local

Repasemos su esencia.

Con:

```bash
mvn install
```

dejás un artefacto en el repositorio local,
de forma que otros proyectos de tu misma máquina puedan consumirlo por coordenadas.

### Cuándo suele tener mucho sentido
- cuando trabajás vos solo en tu máquina
- cuando querés probar una librería propia rápidamente
- cuando tenés dos proyectos separados y querés conectarlos localmente
- cuando todavía no necesitás una publicación remota
- cuando querés validar el artefacto antes de pensar en compartirlo más allá de tu entorno

### Qué ventaja tiene
- simple
- rápido
- muy útil para desarrollo local
- no exige infraestructura remota

### Qué limitación tiene
- sirve solo para tu entorno local
- no comparte automáticamente con otros desarrolladores o máquinas
- puede generar confusión si el proyecto cambia y olvidás reinstalar

---

## Una intuición muy útil

Podés pensarlo así:

> `install` es excelente para circulación local, pero no escala por sí solo como mecanismo compartido de equipo.

Esa frase vale muchísimo.

---

## Segunda estrategia: multi-módulo

En una estructura multi-módulo:

- varios proyectos viven bajo una raíz común
- pueden compartir parent
- pueden depender entre sí
- y Maven puede construirlos como conjunto

### Cuándo suele tener mucho sentido
- cuando los proyectos están muy relacionados
- cuando querés coordinación de build desde una misma raíz
- cuando hay dependencias internas claras entre piezas del sistema
- cuando buscás coherencia fuerte de versiones y plugins
- cuando querés pensar el sistema como una arquitectura modular unificada

### Qué ventaja tiene
- build coordinado
- herencia compartida
- dependencias internas bien expresadas
- muy buena experiencia para desarrollo conjunto de piezas relacionadas

### Qué limitación tiene
- no siempre conviene si los proyectos están realmente separados
- puede ser demasiado si solo querías probar una librería local aislada
- implica una relación estructural más fuerte entre proyectos

---

## Una intuición muy útil

Podés pensarlo así:

> multi-módulo sirve cuando no querés solo consumir artefactos, sino desarrollar varias piezas juntas como un sistema.

Esa frase vale muchísimo.

---

## Tercera estrategia: publicación remota

Acá ya entrás en una lógica donde el artefacto se publica en un repositorio remoto accesible más allá de tu máquina.

### Cuándo suele tener mucho sentido
- cuando varios desarrolladores o entornos tienen que consumir el artefacto
- cuando querés una distribución más estable y compartida
- cuando la librería o módulo ya no es solo un experimento local
- cuando necesitás un flujo más serio entre productor y consumidores
- cuando el artefacto debe circular entre entornos de CI, builds remotos o equipos

### Qué ventaja tiene
- disponibilidad compartida
- desacople del entorno local de un desarrollador
- mejor integración con flujos de equipo y automatización
- escalabilidad organizacional mucho mayor

### Qué limitación tiene
- requiere más infraestructura
- suele requerir configuración de acceso
- implica más responsabilidad de versionado y publicación
- no siempre vale la pena para pruebas rápidas o cambios muy locales

---

## Una intuición muy útil

Podés pensarlo así:

> la publicación remota tiene mucho sentido cuando el artefacto deja de pertenecer solo a tu flujo local y pasa a formar parte de un circuito compartido.

Esa frase vale muchísimo.

---

## Primer criterio práctico de elección

Podés usar esta regla muy simple:

- si el problema es puramente local, pensá primero en `install`
- si varias piezas se desarrollan juntas como sistema, pensá primero en multi-módulo
- si el artefacto tiene que circular entre varias máquinas, personas o entornos, pensá en publicación remota

No resuelve todos los casos,
pero ordena muchísimo.

---

## Escenario A — dos proyectos tuyos en la misma máquina

Imaginá esto:

- tenés una librería pequeña propia
- tenés otra app local que la quiere usar
- trabajás solo
- querés probar rápido

### Estrategia que suele encajar mejor
`install`

### Por qué
Porque todavía no necesitás:
- una raíz común multi-módulo
- ni infraestructura remota
- ni un circuito de publicación formal

Acá `install` suele ser la solución con mejor relación entre costo y beneficio.

---

## Escenario B — varios módulos de un mismo sistema que evolucionan juntos

Imaginá esto:

- tenés `core`
- `api`
- `app`
- todos evolucionan juntos
- todos comparten política técnica
- y querés construirlos desde una raíz común

### Estrategia que suele encajar mejor
multi-módulo

### Por qué
Porque acá el punto fuerte no es solo “consumir un artefacto”,
sino:
- coordinar el sistema completo
- compartir parent
- expresar dependencias internas
- mantener coherencia del build

---

## Escenario C — una librería que varios proyectos o equipos necesitan consumir

Imaginá esto:

- la librería ya dejó de ser solo tu prueba local
- otros consumidores la necesitan
- distintas máquinas o entornos deben resolverla
- querés un canal compartido y más estable

### Estrategia que suele encajar mejor
publicación remota

### Por qué
Porque depender del `install` local de cada uno sería poco serio y poco escalable.
Y tener todo dentro de una misma raíz multi-módulo tal vez ya no refleje la realidad de equipos o repos separados.

---

## Qué relación hay entre estas estrategias

Esto es importante:
no siempre compiten.
A veces representan etapas distintas.

Por ejemplo:
- empezás con `install` local
- después llevás varias piezas a una raíz multi-módulo
- y más adelante publicás remotamente cuando el artefacto madura o se comparte más

Entonces aparece una verdad importante:

> muchas veces estas estrategias no son enemigas; forman una progresión natural según crece el proyecto.

Esa idea te da muchísimo criterio.

---

## Ejercicio 1 — ubicar cada estrategia en su contexto

Quiero que hagas esto por escrito.

Para cada escenario, elegí la estrategia más razonable:

### Caso 1
Una librería experimental propia que querés probar desde otra app local tuya.

### Caso 2
Tres módulos de una misma solución que comparten build, parent y dependencias internas.

### Caso 3
Una librería que varios proyectos en distintas máquinas deberían consumir de forma repetible.

### Objetivo
Entrenar criterio, no solo memoria.

---

## Qué rol juega el costo de coordinación

Muchísimo.

Una estrategia más potente no siempre es mejor si el problema todavía es chico.

Por ejemplo:

- publicación remota puede ser excesiva para una prueba local
- multi-módulo puede ser demasiado si los proyectos están realmente desacoplados
- `install` puede ser demasiado frágil si ya trabaja más de una persona o más de una máquina

Entonces aparece una idea importante:

> la mejor estrategia no es la más grande ni la más sofisticada; es la que tiene la escala adecuada para el problema real.

Esa frase vale muchísimo.

---

## Qué relación tiene esto con equipos y colaboración

Muy fuerte.

Porque en cuanto pasás de un solo entorno local a:

- varios desarrolladores
- varios repos
- CI
- entornos compartidos

la estrategia también cambia.

Esto vuelve el tema muy realista,
porque Maven no vive solo dentro de un proyecto técnico,
vive dentro de formas de trabajo.

Entonces este tema no es solo sobre comandos:
también es sobre organización.

---

## Ejercicio 2 — pensar desde el costo de mantenimiento

Respondé esta pregunta:

> ¿Qué estrategia te parecería más costosa de sostener si todos los desarrolladores de un equipo tuvieran que instalar manualmente cada artefacto localmente en su máquina para poder trabajar?

### Objetivo
Ver por qué algunas soluciones sirven muy bien en local,
pero ya no tanto cuando el trabajo se comparte.

---

## Qué no conviene hacer

No conviene:

- usar publicación remota por reflejo si el problema sigue siendo puramente local
- meter todo en multi-módulo si los proyectos no evolucionan realmente juntos
- apoyarte solo en `install` cuando el artefacto ya tiene consumidores más allá de tu máquina
- elegir por moda en vez de elegir por contexto

Entonces aparece otra verdad importante:

> en Maven, una mala elección de estrategia no suele romper solo el build; puede romper la experiencia de trabajo del equipo.

Eso conviene tenerlo muy presente.

---

## Una intuición muy útil

Podés pensarlo así:

- `install` resuelve circulación local
- multi-módulo resuelve desarrollo conjunto
- publicación remota resuelve circulación compartida

Esa frase resume muchísimo.

---

## Error común 1 — pensar que multi-módulo reemplaza siempre a install

No.
Son estrategias distintas para problemas distintos.

---

## Error común 2 — pensar que install alcanza siempre mientras “yo lo pueda hacer funcionar”

No necesariamente.
Eso puede no escalar nada bien a equipo o CI.

---

## Error común 3 — pensar que deploy es el paso natural inmediato para cualquier proyecto chico

No.
A veces todavía no hace falta.

---

## Error común 4 — no revisar si los proyectos realmente evolucionan juntos

Eso es una de las claves para decidir si multi-módulo tiene sentido o no.

---

## Ejercicio 3 — escribir tu propia regla de decisión

Quiero que escribas una regla personal de tres líneas, algo así:

- “Si el consumo es solo mío y local, primero pienso en…”
- “Si varias piezas evolucionan juntas, primero pienso en…”
- “Si el artefacto debe compartirse entre varios entornos, pienso en…”

### Objetivo
Convertir teoría en criterio operativo personal.

---

## Qué no conviene olvidar

Este tema no pretende que haya una fórmula universal.
Siempre hay matices.

Pero sí quiere dejarte una brújula muy fuerte:

- local y rápido: `install`
- sistema conjunto: multi-módulo
- circulación compartida: publicación remota

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Tomá tres escenarios reales o imaginarios:
- uno local
- uno de sistema multi-módulo
- uno compartido entre varios consumidores

### Ejercicio 2
Elegí para cada uno:
- `install`
- multi-módulo
- publicación remota

### Ejercicio 3
Justificá por qué.

### Ejercicio 4
Escribí una comparación breve entre costo, escala y mantenimiento de las tres estrategias.

### Ejercicio 5
Armá tu propia regla de decisión para futuros proyectos.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Cuándo conviene `install`?
2. ¿Cuándo conviene multi-módulo?
3. ¿Cuándo empieza a tener sentido publicación remota?
4. ¿Por qué estas estrategias no siempre compiten entre sí?
5. ¿Por qué elegir con criterio importa tanto como saber usar técnicamente cada una?

---

## Mini desafío

Hacé una práctica conceptual:

1. imaginá una librería tuya en tres etapas:
   - etapa local
   - etapa integrada en un sistema mayor
   - etapa compartida por varios consumidores
2. elegí para cada etapa la estrategia más razonable
3. escribí una nota breve explicando cómo fue cambiando la mejor elección a medida que cambió la escala del problema

Tu objetivo es que estas tres estrategias de Maven dejen de ser temas separados y pasen a formar parte de una forma de decidir mucho más madura y contextual.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este quincuagésimo cuarto tema, ya deberías poder:

- distinguir cuándo conviene `install`
- distinguir cuándo conviene multi-módulo
- distinguir cuándo empieza a tener sentido publicación remota
- evaluar costo, escala y mantenimiento de cada estrategia
- y tomar decisiones mucho más maduras sobre circulación de artefactos en Maven

---

## Resumen del tema

- `install`, multi-módulo y publicación remota sirven para problemas distintos.
- `install` es muy bueno para consumo local.
- multi-módulo es muy bueno para desarrollo conjunto de piezas relacionadas.
- publicación remota es muy valiosa cuando el artefacto debe circular más allá del entorno local.
- Muchas veces estas estrategias representan etapas de madurez más que opciones enemigas.
- Ya diste otro paso importante hacia una forma mucho más profesional de decidir cómo mover artefactos dentro del mundo Maven.

---

## Próximo tema

En el próximo tema vas a aprender a empezar a pensar Maven junto con automatización y CI en un nivel inicial, porque después de entender mejor cómo circulan los artefactos y cuándo conviene cada estrategia, el siguiente paso natural es ver cómo estas decisiones se conectan con builds automáticos y flujos más profesionales.
