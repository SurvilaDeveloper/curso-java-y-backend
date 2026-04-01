---
title: "Entender la diferencia entre snapshots y releases en Maven"
description: "Sexagésimo primer tema práctico del curso de Maven: aprender qué diferencia hay entre versiones SNAPSHOT y releases en Maven, por qué esa distinción importa tanto y cómo cambia la forma de construir, instalar y publicar artefactos."
order: 61
module: "Versionado y publicación profesional"
level: "intermedio"
draft: false
---

# Entender la diferencia entre `SNAPSHOT` y `releases` en Maven

## Objetivo del tema

En este sexagésimo primer tema vas a:

- entender qué diferencia hay entre una versión `SNAPSHOT` y una versión release
- ver por qué esa diferencia importa muchísimo en Maven
- conectar el versionado con `install`, `deploy` y consumo de artefactos
- empezar a pensar el artefacto no solo por su contenido, sino también por su estado de madurez
- desarrollar una base mucho más seria para publicación y circulación de versiones

La idea es que dejes de ver la versión como un simple texto del `pom.xml` y empieces a verla como una señal fuerte de intención: qué tan estable es el artefacto, cómo debería circular y qué expectativas deberían tener sus consumidores.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- crear proyectos Maven
- leer y modificar `pom.xml`
- entender coordenadas Maven (`groupId`, `artifactId`, `version`)
- usar `package`, `install` y entender `deploy`
- distinguir repositorio local y repositorio remoto
- pensar flujos de publicación con más criterio
- entender que no todos los pipelines tienen que llegar igual de lejos

Si hiciste los temas anteriores, ya estás listo para este paso.

---

## Idea central del tema

Hasta ahora viste que Maven puede:

- construir artefactos
- instalarlos localmente
- y eventualmente publicarlos remotamente

Pero todavía faltaba una dimensión muy importante:

> no todo artefacto debería comunicar el mismo nivel de estabilidad o madurez.

Ahí aparece una de las distinciones más importantes de Maven:

- versiones `SNAPSHOT`
- versiones `release`

Y esta diferencia no es decorativa.
Afecta mucho cómo pensás:

- desarrollo
- consumo
- publicación
- confianza
- y ciclo de vida del artefacto

---

## Qué es una versión SNAPSHOT

Una versión `SNAPSHOT` suele verse así:

```text
1.0.0-SNAPSHOT
```

Dicho simple:

> una versión SNAPSHOT indica que el artefacto sigue en evolución y que todavía no deberías tratarlo como una versión final o estable cerrada.

No significa que sea inútil.
Ni tampoco que esté siempre roto.
Significa algo más sutil y muy importante:

- que todavía está viva
- que puede cambiar
- que no representa una versión final cerrada del artefacto

---

## Qué es una release

Una versión release suele verse así:

```text
1.0.0
```

sin el sufijo `-SNAPSHOT`.

Dicho simple:

> una release comunica que esa versión del artefacto fue cerrada como una versión estable o al menos intencionalmente publicada como resultado final identificable.

Otra vez:
no significa perfección absoluta.
Pero sí comunica algo distinto de un snapshot:

- más estabilidad esperada
- más intención de cierre
- más claridad para consumidores

---

## Una intuición muy útil

Podés pensarlo así:

- `SNAPSHOT` = trabajo todavía en movimiento
- `release` = versión cerrada para consumo más estable

Esa frase vale muchísimo.

---

## Por qué esta diferencia importa tanto

Porque Maven no trata igual cualquier versión.
Y tampoco debería tratarlas igual tu equipo o tus consumidores.

Si alguien ve:

```text
1.0.0-SNAPSHOT
```

entiende algo como:
- esto todavía puede cambiar
- no es necesariamente una versión definitiva

Si alguien ve:

```text
1.0.0
```

entiende algo como:
- esta versión fue publicada como estado estable o intencionalmente cerrado

Entonces aparece una verdad importante:

> el versionado en Maven no solo identifica artefactos; también comunica expectativas de estabilidad y de cambio.

Eso es central.

---

## Primer contraste práctico

Imaginá que producís una librería llamada:

- `com.gabriel.libs`
- `saludos-core`

### Caso A
Versión:

```text
1.0.0-SNAPSHOT
```

### Caso B
Versión:

```text
1.0.0
```

## Qué cambia conceptualmente

En el primer caso estás diciendo:
- sigo evolucionando esta versión
- no la tomes como completamente cerrada

En el segundo estás diciendo:
- este estado quedó publicado como versión concreta y cerrada

Ese cambio de mensaje afecta muchísimo cómo se consume y cómo se publica.

---

## Qué relación tiene esto con install

Muy fuerte.

Durante desarrollo local es muy común trabajar con:

```text
-SNAPSHOT
```

porque te deja iterar mientras el artefacto evoluciona.

Por ejemplo:
- cambiás la librería
- volvés a compilar
- volvés a instalar
- y seguís trabajando con la misma línea de desarrollo del artefacto

Eso tiene muchísimo sentido.

Entonces aparece una idea importante:

> `SNAPSHOT` encaja muy naturalmente con flujos de desarrollo local y evolución continua del artefacto.

---

## Qué relación tiene esto con deploy

Todavía más fuerte.

Cuando pensás en publicación remota más seria,
la diferencia entre `SNAPSHOT` y release se vuelve todavía más importante.

Porque publicar algo como `SNAPSHOT` no comunica lo mismo que publicar algo como:

```text
1.0.0
```

Entonces la publicación remota deja de ser solo una cuestión técnica de “subir algo a un repo”.
También se vuelve una cuestión de:
- qué tipo de versión estás distribuyendo
- con qué nivel de estabilidad
- y con qué expectativa para quien la consume

---

## Una intuición muy útil

Podés pensarlo así:

> la versión no solo nombra el artefacto; también define el tipo de compromiso que asumís al publicarlo.

Esa frase vale muchísimo.

---

## Cuándo suele tener mucho sentido usar SNAPSHOT

En esta etapa del curso, una respuesta bastante sana sería:

- cuando el artefacto todavía está en desarrollo
- cuando vas a hacer cambios frecuentes
- cuando todavía no querés cerrar una versión estable
- cuando productor y consumidor evolucionan juntos
- cuando el build local o remoto todavía refleja una línea activa de trabajo

En esos casos, `SNAPSHOT` suele encajar muy bien.

---

## Cuándo suele tener mucho sentido una release

También conviene decirlo claro.

Una release suele tener mucho sentido cuando:

- querés marcar un estado más estable
- el artefacto ya está listo para consumo más confiable
- querés una referencia cerrada y clara para otros consumidores
- la publicación ya no es puro trabajo en curso
- necesitás que la versión comunique más estabilidad y menos movimiento

Entonces aparece una verdad importante:

> una release tiene sentido cuando querés dejar de decir “esto sigue moviéndose” y pasar a decir “esto es una versión concreta y cerrada del artefacto”.

---

## Primer criterio práctico

Podés usar esta regla:

> si el artefacto todavía está cambiando activamente y no querés comunicar cierre, pensá en `SNAPSHOT`; si querés marcar una versión estable y cerrada, pensá en release.

No resuelve todo el universo,
pero ordena muchísimo.

---

## Ejemplo de evolución natural

Muchos proyectos viven algo así:

1. primero trabajan en:
```text
1.0.0-SNAPSHOT
```

2. cuando el estado se consolida, publican algo como:
```text
1.0.0
```

3. y después vuelven a abrir desarrollo en:
```text
1.1.0-SNAPSHOT
```

No hace falta que hoy profundices toda una estrategia completa de versionado.
Lo importante es que empieces a sentir esta idea de:
- abrir desarrollo
- cerrar release
- volver a abrir desarrollo siguiente

Eso ya te da un mapa muy útil.

---

## Ejercicio 1 — pensar qué comunica cada versión

Quiero que respondas por escrito:

- ¿Qué comunica `1.0.0-SNAPSHOT`?
- ¿Qué comunica `1.0.0`?
- ¿Qué sensación le da cada una a otro desarrollador que quiere consumir tu artefacto?

### Objetivo
Que la diferencia deje de ser sintáctica y pase a sentirse como una señal de madurez del artefacto.

---

## Qué relación tiene esto con consumidores

Muchísima.

Un consumidor no ve solo:
- nombre de dependencia
- versión

También interpreta:
- si esa versión parece estable
- si parece todavía en cambio
- si puede esperarse movimiento
- si conviene adoptarla ya o con más cautela

Entonces la forma en que versionás afecta también la experiencia del otro lado.

Eso vuelve este tema muy importante.

---

## Qué relación tiene esto con pipelines

Muy fuerte.

Recordá que venías pensando:

- cuándo quedarse en `verify`
- cuándo llegar a `install`
- cuándo recién pensar en `deploy`

Ahora sumás otra dimensión:
- **qué tipo de versión** está pasando por ese flujo

Entonces aparece otra idea importante:

> no es lo mismo instalar o desplegar un SNAPSHOT que instalar o desplegar una release, porque el tipo de versión cambia el significado del flujo.

Eso ya es bastante más profesional.

---

## Qué no conviene hacer

No conviene:

- usar releases para artefactos que todavía están muy vivos y cambiantes si eso va a confundir a los consumidores
- ni dejar todo eternamente en `SNAPSHOT` si el proyecto ya necesita puntos claros de estabilidad
- ni pensar la versión como algo puramente cosmético
- ni publicar sin preguntarte qué estás comunicando con esa versión

Entonces aparece una verdad importante:

> versionar bien no es decorar el proyecto; es comunicar madurez y expectativas de consumo.

Esa frase vale muchísimo.

---

## Una intuición muy útil

Podés pensarlo así:

- `SNAPSHOT` = todavía lo estoy moviendo
- `release` = esto ya lo cierro como versión concreta

Simple, pero muy poderosa.

---

## Qué relación tiene esto con multi-módulo

También importa mucho.

En sistemas multi-módulo,
muchas veces la raíz y los módulos comparten una línea de versión.
Entonces decidir entre:
- snapshot
- release

no afecta solo a una pieza,
sino a toda una familia de artefactos relacionados.

Eso vuelve el criterio todavía más importante.

No hace falta bajar toda la complejidad ahora.
Pero sí conviene que veas que esta decisión puede escalar fuerte.

---

## Ejercicio 2 — pensar la frontera del artefacto

Respondé esta pregunta:

> ¿Qué tendría que ser cierto sobre tu proyecto para que dejaras de verlo como “todavía en movimiento” y te sintieras cómodo publicándolo como release?

Podés pensar en:
- estabilidad
- tests
- claridad del comportamiento
- consumidores reales
- confianza del build

### Objetivo
Que la transición de snapshot a release se te vuelva una decisión con sentido, no solo cambio de texto.

---

## Qué papel juega la confianza

Muchísimo.

Si una release comunica más estabilidad,
entonces normalmente vas a querer más confianza antes de marcarla así.

Eso conecta directo con todo lo que venías aprendiendo de:

- tests
- verify
- install
- deploy
- criterio de publicación

Entonces este tema no aparece aislado.
Cierra un montón de piezas del roadmap anterior.

---

## Qué relación tiene esto con repositorio local y remoto

Muy buena también.

Podés usar `SNAPSHOT` localmente,
instalarlo,
probarlo,
y seguir iterando.

Y cuando ya decidís que cierta versión merece un estado más estable,
la lógica de release empieza a tener mucho más sentido,
especialmente si pensás en circulación remota.

Eso te ayuda a ver que:
- el tipo de versión afecta el sentido de la publicación,
no solo el nombre del artefacto.

---

## Error común 1 — pensar que SNAPSHOT significa necesariamente “malo” o “roto”

No.
Significa “todavía en evolución”.
No implica automáticamente mala calidad.

---

## Error común 2 — pensar que una release garantiza perfección absoluta

Tampoco.
Comunica cierre y estabilidad relativa mayor,
no perfección mágica.

---

## Error común 3 — usar siempre snapshots por comodidad aunque el proyecto ya necesite puntos de estabilidad claros

Eso puede dificultar el consumo y la comunicación.

---

## Error común 4 — tratar la versión como algo separado del flujo de build y publicación

En Maven están muy conectados.
Y conviene pensarlos juntos.

---

## Ejercicio 3 — clasificar casos

Quiero que tomes tres escenarios y decidas si suena más razonable `SNAPSHOT` o release.

### Caso 1
Una librería local que todavía cambiás todos los días.

### Caso 2
Un artefacto que varios proyectos del equipo van a consumir como referencia estable.

### Caso 3
Una línea de desarrollo nueva que todavía no querés cerrar.

### Objetivo
Desarrollar criterio práctico y no solo definición abstracta.

---

## Qué no conviene olvidar

Este tema no pretende convertirte hoy en experto en estrategias completas de versionado semántico ni de releases corporativas.

Lo que sí quiere dejarte es una base muy fuerte:

- `SNAPSHOT` y release no son lo mismo
- esa diferencia importa muchísimo
- y afecta cómo construís, instalás, publicás y comunicás tus artefactos

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Tomá uno de tus proyectos o módulos y mirá su versión actual.

### Ejercicio 2
Respondé si hoy te parece más lógico tratarlo como:
- `SNAPSHOT`
- o release

### Ejercicio 3
Justificá por qué.

### Ejercicio 4
Escribí qué expectativas tendría un consumidor en cada caso.

### Ejercicio 5
Explicá con tus palabras cómo cambia el sentido de `install` o `deploy` cuando la versión es `SNAPSHOT` o cuando es release.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué comunica una versión `SNAPSHOT`?
2. ¿Qué comunica una versión release?
3. ¿Por qué esta diferencia importa tanto en Maven?
4. ¿Cómo se conecta esto con `install` y `deploy`?
5. ¿Por qué la versión forma parte de la comunicación profesional del artefacto?

---

## Mini desafío

Hacé una práctica conceptual:

1. elegí un proyecto o módulo Maven tuyo
2. imaginá su estado actual como `SNAPSHOT`
3. escribí qué tendría que pasar para sentirte cómodo publicándolo como release
4. después imaginá cuál sería la siguiente línea de desarrollo abierta
5. redactá una nota breve explicando cómo este tema te ayudó a ver la versión no como texto, sino como señal de madurez y de intención de publicación

Tu objetivo es que la versión deje de parecer un campo más del `pom.xml` y pase a sentirse como una pieza clave de cómo Maven comunica el estado y el destino esperado del artefacto.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este sexagésimo primer tema, ya deberías poder:

- distinguir claramente entre `SNAPSHOT` y release
- entender qué comunica cada una
- conectar esa diferencia con build, instalación y publicación
- pensar el versionado como parte del flujo profesional del artefacto
- y leer Maven con una noción mucho más madura de estabilidad y circulación

---

## Resumen del tema

- `SNAPSHOT` y release comunican estados distintos del artefacto.
- `SNAPSHOT` expresa evolución abierta; release expresa cierre y mayor estabilidad esperada.
- Esta diferencia afecta cómo pensás `install`, `deploy` y consumo de artefactos.
- Versionar bien también es comunicar expectativas al consumidor.
- El tipo de versión cambia el sentido del flujo de build y publicación.
- Ya diste otro paso importante hacia un Maven mucho más profesional y consciente del ciclo de vida del artefacto.

---

## Próximo tema

En el próximo tema vas a aprender a pensar mejor el paso de una versión `SNAPSHOT` a una release y qué decisiones previas conviene tomar antes de cerrar una versión, porque después de entender qué comunica cada tipo de versión, el siguiente paso natural es pensar el momento de transición entre ambas con más criterio.
