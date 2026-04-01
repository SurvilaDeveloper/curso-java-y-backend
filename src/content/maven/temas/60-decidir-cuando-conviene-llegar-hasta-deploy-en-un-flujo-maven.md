---
title: "Decidir cuándo conviene llegar hasta deploy en un flujo Maven"
description: "Sexagésimo tema práctico del curso de Maven: aprender cuándo tiene sentido que un flujo Maven llegue hasta deploy, cuándo conviene detenerse antes y cómo distinguir validación, instalación local y publicación remota con criterio profesional."
order: 60
module: "Automatización, CI y flujos profesionales"
level: "intermedio"
draft: false
---

# Decidir cuándo conviene llegar hasta `deploy` en un flujo Maven

## Objetivo del tema

En este sexagésimo tema vas a:

- pensar con más criterio cuándo tiene sentido llegar hasta `deploy`
- distinguir mejor entre validación, instalación local y publicación remota
- entender por qué no todos los pipelines deberían publicar remotamente
- ver cuándo `deploy` agrega valor real y cuándo agrega riesgo o ruido
- diseñar flujos Maven más maduros, donde la publicación remota sea una decisión consciente y no un reflejo automático

La idea es que dejes de ver `deploy` como “el último escalón obvio” y empieces a verlo como una frontera muy seria del flujo: la que decide si el artefacto ya está listo para circular fuera de tu entorno local.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- usar `test`, `package`, `verify`, `install` y distinguirlos
- entender la diferencia entre repositorio local y repositorio remoto
- conocer `distributionManagement` y su relación con `settings.xml`
- pensar pipelines Maven por etapas y con feedback temprano
- decidir mejor cuándo un flujo debería llegar hasta `install`

Si hiciste los temas anteriores, ya estás listo para este paso.

---

## Idea central del tema

En el tema anterior viste que no siempre conviene llegar hasta `install`.
Ahora aparece una pregunta todavía más exigente:

> si `install` ya pone a circular el artefacto localmente, ¿cuándo tendría sentido llegar todavía más lejos, hasta `deploy`?

La respuesta madura es:

> solo cuando el flujo realmente necesita publicación remota y cuando el nivel de confianza sobre el artefacto justifica dejarlo disponible fuera del entorno local.

Ese es el corazón del tema.

---

## Qué agrega deploy respecto de install

Ya sabés técnicamente que:

- `install` deja el artefacto en el repositorio local
- `deploy` apunta a publicarlo en un repositorio remoto

Pero ahora conviene verlo desde el punto de vista del alcance:

> `deploy` no solo construye ni valida; amplía el alcance del artefacto hacia otros entornos, otras máquinas, otros consumidores y, muchas veces, otros equipos.

Eso lo vuelve una decisión mucho más seria que `install`.

---

## Una intuición muy útil

Podés pensarlo así:

- `verify` = confío bastante en el build
- `install` = quiero circulación local
- `deploy` = quiero circulación remota y compartida

Esa frase vale muchísimo.

---

## Por qué no todos los pipelines deberían llegar hasta deploy

Porque publicar remotamente no es una validación cualquiera.
Es una decisión de distribución.

Y cuando distribuís remotamente, pueden pasar cosas como:

- otros proyectos empiezan a consumir ese artefacto
- otros entornos lo ven como disponible
- el impacto de una versión defectuosa crece mucho
- revertir o corregir puede volverse más costoso

Entonces aparece una verdad importante:

> cuanto más lejos circula un artefacto, más importante es que el pipeline no publique “porque sí”, sino porque el contexto realmente lo justifica.

---

## Qué pregunta te ayuda a decidir

Una muy buena pregunta es esta:

> ¿Después de este flujo quiero que el artefacto quede disponible para consumidores fuera de este entorno local o fuera de este build puntual?

Si la respuesta es sí,
`deploy` puede empezar a tener sentido.

Si la respuesta es no,
muchas veces conviene quedarse en:

- `verify`
o
- `install`

según el caso.

---

## Escenario A — pipeline de validación pura

Imaginá un pipeline cuyo objetivo es simplemente responder:

- ¿el proyecto está sano?
- ¿compila?
- ¿pasan tests?
- ¿el build llegó a una validación seria?

Acá suele tener mucho más sentido terminar en:

```bash
mvn clean verify
```

que en `deploy`.

### Por qué
Porque el propósito del flujo no es distribuir nada.
Es validar.

Entonces `deploy` sería una etapa innecesaria,
e incluso potencialmente riesgosa o confusa.

---

## Escenario B — flujo de consumo local entre proyectos

Imaginá que tenés:

- una librería propia
- otro proyecto de tu máquina que la necesita
- todavía no querés compartir nada más allá del entorno local

Acá suele tener más sentido llegar hasta:

```bash
mvn clean install
```

que hasta `deploy`.

### Por qué
Porque el valor del flujo está en dejar el artefacto disponible localmente,
no en publicarlo remotamente.

Otra vez, `deploy` sería demasiado para el problema real.

---

## Escenario C — artefacto compartido entre varios entornos o equipos

Ahora imaginá algo distinto:

- varios consumidores externos al build actual
- varios desarrolladores
- varios entornos
- CI que necesita dejar artefactos disponibles más allá de la máquina que corre el pipeline
- flujo más formal de distribución

Acá sí empieza a tener mucho sentido pensar en:

```bash
mvn deploy
```

### Por qué
Porque el objetivo del flujo ya no es solo validar ni solo instalar localmente.
El objetivo es hacer circular el artefacto en un repositorio remoto compartido.

Entonces aparece una idea importante:

> `deploy` tiene sentido cuando el pipeline no termina en el build mismo, sino en la disponibilidad remota del artefacto para otros consumidores.

---

## Qué relación tiene esto con confianza del build

Muchísima.

Si `install` ya merecía una frontera razonable,
`deploy` merece una frontera todavía más seria.

Entonces, antes de pensar en publicación remota,
conviene poder responder cosas como:

- ¿el proyecto fue validado seriamente?
- ¿pasó las etapas de calidad que importan?
- ¿el artefacto realmente está listo para circular?
- ¿el flujo tiene sentido para este contexto?

Entonces aparece una verdad importante:

> `deploy` no es tanto una fase “más larga” del lifecycle como una decisión de confianza y de alcance.

Esa frase vale muchísimo.

---

## Una intuición muy útil

Podés pensarlo así:

> publicar remotamente un artefacto significa comprometerte más con su calidad y con su impacto.

Esa frase ordena muchísimo.

---

## Qué relación tiene esto con CI

Muy fuerte.

En automatización, muchas veces tiene muchísimo sentido que existan pipelines que:

- validen
- verifiquen
- empaqueten
- quizás instalen

sin necesariamente publicar.

¿Por qué?
Porque no todo pipeline tiene que terminar en distribución remota.

Entonces aparece otra idea importante:

> en CI, `deploy` suele tener sentido en flujos o etapas específicas de publicación, no necesariamente en cada ejecución automática del proyecto.

Eso te ayuda muchísimo a diseñar pipelines más sanos.

---

## Qué relación tiene esto con settings.xml y distributionManagement

Muy fuerte también.

Recordá que para `deploy` ya entran en juego cosas como:

- `distributionManagement`
- `settings.xml`
- `id` del repositorio
- credenciales del entorno
- acceso real al destino remoto

Eso significa que `deploy` no solo requiere más confianza funcional en el artefacto,
sino también más preparación de infraestructura y entorno.

Entonces otra vez:
no conviene meterlo livianamente.

---

## Ejercicio 1 — distinguir intención de cada frontera

Quiero que hagas esto por escrito:

- ¿Qué pregunta responde `verify`?
- ¿Qué pregunta responde `install`?
- ¿Qué pregunta responde `deploy`?

Y después agregá:

- ¿Qué tipo de consumidor aparece después de cada una?

### Objetivo
Que veas cómo cada frontera amplía el alcance del artefacto.

---

## Qué costo tiene publicar remotamente “porque sí”

No es solo una cuestión técnica.
También puede generar problemas de flujo y mantenimiento:

- artefactos publicados sin necesidad
- ruido en repositorios remotos
- versiones disponibles demasiado pronto
- confusión sobre qué está realmente listo para consumo compartido
- más trabajo para corregir o reemplazar una publicación innecesaria

Entonces aparece una idea importante:

> un pipeline más maduro no publica remotamente por inercia; publica remotamente cuando hay una necesidad concreta y un nivel de confianza acorde.

---

## Cuándo sí suele tener bastante sentido llegar hasta deploy

En esta etapa del curso, una respuesta sana sería:

- cuando el artefacto debe quedar disponible para otros entornos o consumidores remotos
- cuando el flujo ya no es solo local ni solo interno a una raíz multi-módulo
- cuando el proyecto tiene una política clara de publicación
- cuando infraestructura, credenciales y destino remoto están realmente preparados
- cuando el nivel de confianza del build justifica distribución remota

En esos casos, `deploy` deja de ser una exageración y pasa a ser parte natural del flujo.

---

## Cuándo suele ser mejor detenerse antes

También conviene decirlo claramente.

Muchas veces tiene más sentido detenerse antes cuando:

- el pipeline solo busca validación
- el consumo es solo local
- el artefacto todavía está en una etapa muy temprana
- la publicación remota todavía no agrega valor real
- no hay consumidores remotos concretos
- el equipo todavía no necesita ese nivel de circulación

En esos casos, llegar hasta `deploy` puede ser más costo que beneficio.

---

## Ejercicio 2 — pensar desde el consumidor remoto

Respondé esta pregunta:

> ¿Qué tendría que ser cierto sobre tu artefacto para que te sintieras cómodo dejándolo disponible en un repositorio remoto compartido?

Podés pensar en:
- validación
- estabilidad
- intención de uso
- consumidores reales
- confianza del build

### Objetivo
Que `deploy` se te vuelva una decisión con responsabilidad, no solo un comando.

---

## Qué relación tiene esto con etapas de madurez

Muy fuerte.

Muchas veces el camino natural de un artefacto es algo así:

1. primero solo lo validás
2. después lo instalás localmente
3. más adelante, cuando el contexto lo pide, lo publicás remotamente

Entonces estas tres estrategias no siempre compiten.
Muchas veces representan madurez creciente del flujo y del artefacto.

Entonces aparece una verdad importante:

> `deploy` suele tener más sentido cuando el artefacto y el contexto ya maduraron lo suficiente como para justificar circulación compartida.

---

## Una intuición muy útil

Podés pensarlo así:

- `verify` = todavía estoy evaluando
- `install` = ya lo uso localmente
- `deploy` = ya lo ofrezco más allá de mi entorno

Esa frase vale muchísimo.

---

## Qué no conviene hacer

No conviene:

- meter `deploy` en todo pipeline por reflejo
- ni asumir que “siempre conviene llegar al final del lifecycle”
- ni publicar remotamente algo que todavía no tiene consumidores reales
- ni mezclar validación seria con distribución compartida sin una frontera clara

Entonces aparece otra idea importante:

> en Maven, la publicación remota no es una validación más; es un cambio de alcance del artefacto.

Esa frase conviene que te quede grabada.

---

## Error común 1 — pensar que deploy es simplemente install “pero más lejos”

Hay una relación,
sí,
pero el salto de impacto, infraestructura y responsabilidad es mucho más grande.

---

## Error común 2 — pensar que un pipeline serio siempre termina en deploy

No.
Un pipeline puede ser muy serio y no publicar remotamente en absoluto.

---

## Error común 3 — no diferenciar entre necesidad de publicación y capacidad técnica de publicar

Que algo se pueda hacer no significa que convenga hacerlo en ese flujo.

---

## Error común 4 — no pensar en el repositorio remoto como una superficie compartida que conviene cuidar

Esto es muy importante en equipos y entornos profesionales.

---

## Ejercicio 3 — decidir tu frontera máxima actual

Quiero que tomes uno de tus proyectos o sistemas y respondas:

> Hoy, para este caso real, ¿tu frontera máxima razonable debería ser `verify`, `install` o `deploy`? ¿Por qué?

### Objetivo
Que transformes lo aprendido en criterio concreto de decisión.

---

## Qué no conviene olvidar

Este tema no pretende que todos tus proyectos terminen alguna vez en `deploy`,
ni que ahora tengas que configurar publicación remota real.

Lo que sí quiere dejarte es una brújula muy fuerte:

- `verify` para validación seria
- `install` para circulación local
- `deploy` para circulación remota compartida

Y la elección depende del propósito, del contexto, del consumidor y del nivel de confianza que realmente tengas.

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Tomá un proyecto o sistema Maven actual.

### Ejercicio 2
Escribí cuál sería su frontera máxima razonable hoy:
- `verify`
- `install`
- o `deploy`

### Ejercicio 3
Justificá la decisión en función de:
- objetivo del flujo
- tipo de consumidor
- necesidad de circulación
- confianza del build

### Ejercicio 4
Explicá por qué las otras fronteras serían demasiado poco o demasiado mucho para este caso.

### Ejercicio 5
Escribí con tus palabras por qué `deploy` no conviene tratarlo como una etapa automática por defecto.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué agrega `deploy` respecto de `install`?
2. ¿Cuándo tiene mucho sentido llegar hasta `deploy`?
3. ¿Cuándo conviene claramente detenerse antes?
4. ¿Por qué `deploy` implica una responsabilidad mayor sobre el artefacto?
5. ¿Por qué un pipeline profesional no siempre tiene que publicar remotamente?

---

## Mini desafío

Hacé una práctica conceptual:

1. imaginá tres casos:
   - pipeline de validación
   - flujo con consumo local
   - flujo con consumidores remotos compartidos
2. decidí en cada uno si la frontera natural sería `verify`, `install` o `deploy`
3. justificá por qué
4. escribí una nota breve explicando cómo este tema te ayudó a dejar de ver `deploy` como “el final automático” y a empezar a verlo como una decisión seria de distribución

Tu objetivo es que el lifecycle deje de parecer una escalera que siempre hay que subir completa y pase a verse como un conjunto de fronteras posibles según el alcance real que querés darle al artefacto.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este sexagésimo tema, ya deberías poder:

- decidir mejor cuándo tiene sentido llegar hasta `deploy`
- distinguir con más claridad validación, circulación local y circulación remota
- entender por qué no todos los pipelines deberían publicar remotamente
- reconocer cuándo `deploy` sí agrega valor real
- y diseñar flujos Maven mucho más maduros y más profesionales

---

## Resumen del tema

- `deploy` agrega circulación remota compartida del artefacto.
- No todos los proyectos ni todos los pipelines necesitan llegar hasta ahí.
- `verify`, `install` y `deploy` representan fronteras de alcance distintas.
- Publicar remotamente implica más impacto, más preparación y más responsabilidad.
- Un pipeline más profesional no publica por inercia; publica cuando el contexto lo justifica.
- Ya diste otro paso importante hacia un Maven pensado con criterio de distribución y no solo de ejecución de comandos.

---

## Próximo tema

En el próximo tema vas a aprender a empezar a pensar el versionado con más criterio en Maven, especialmente la diferencia entre snapshots y releases y cómo eso cambia mucho la forma de construir, instalar y publicar artefactos, porque después de afinar las fronteras del flujo, el siguiente paso natural es entender cómo el tipo de versión afecta todo el circuito.
