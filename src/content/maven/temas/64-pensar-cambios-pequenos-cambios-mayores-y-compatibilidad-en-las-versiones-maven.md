---
title: "Pensar cambios pequeños, cambios mayores y compatibilidad en las versiones Maven"
description: "Sexagésimo cuarto tema práctico del curso de Maven: aprender a pensar qué tipo de cambio estás comunicando con una versión, distinguir cambios pequeños y mayores y empezar a relacionar el versionado con expectativas de compatibilidad."
order: 64
module: "Versionado y publicación profesional"
level: "intermedio"
draft: false
---

# Pensar cambios pequeños, cambios mayores y compatibilidad en las versiones Maven

## Objetivo del tema

En este sexagésimo cuarto tema vas a:

- pensar qué tipo de cambio comunica una nueva versión
- distinguir mejor entre cambios pequeños y cambios mayores
- relacionar el versionado con expectativas de compatibilidad
- dejar de cambiar números “porque sí” y empezar a versionar con más intención
- desarrollar una base más profesional para la evolución de tus artefactos Maven

La idea es que la versión deje de ser solo una secuencia numérica y pase a convertirse en una señal útil sobre cuánto cambió el artefacto y qué puede esperar quien lo consume.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- entender la diferencia entre `SNAPSHOT` y release
- decidir cuándo cerrar una versión
- pensar la siguiente línea `SNAPSHOT` después de una release
- relacionar versionado con publicación, consumo y confianza
- leer la versión como parte de la comunicación profesional del artefacto

Si hiciste los temas anteriores, ya estás listo para este paso.

---

## Idea central del tema

En el tema anterior viste que una release cierra una etapa y que después conviene abrir una nueva línea `SNAPSHOT`.

Ahora aparece una pregunta todavía más fina:

> cuando abrís una nueva versión o cerrás una release, ¿qué te hace elegir un número y no otro?

La respuesta madura empieza a mirar esto:

- qué cambió realmente
- cuánto cambió
- qué tan compatible sigue siendo el artefacto
- qué expectativa razonable debería tener el consumidor

Ese es el corazón del tema.

---

## Por qué este tema importa tanto

Porque no es lo mismo cambiar una versión cuando:

- corregiste algo pequeño
- agregaste una mejora compatible
- o rompiste una expectativa importante para quien consume el artefacto

Si tratás todos esos casos igual,
la versión comunica poco.
Y si la versión comunica poco,
el consumidor queda más ciego frente al cambio.

Entonces aparece una verdad importante:

> versionar bien también es comunicar el tipo de cambio y el nivel de impacto que ese cambio puede tener sobre quien consume tu artefacto.

Esa frase vale muchísimo.

---

## Una intuición muy útil

Podés pensarlo así:

- cambios chicos suelen pedir una señal más chica
- cambios más amplios suelen pedir una señal más visible
- cambios que rompen expectativas suelen pedir una señal todavía más fuerte

Esa idea simple ordena muchísimo.

---

## Qué significa hablar de compatibilidad

En esta etapa no hace falta convertir esto en teoría académica pesada.
Alcanza con una idea práctica:

> compatibilidad es qué tanto puede seguir usando tu artefacto alguien que ya venía consumiéndolo sin tener que rehacer cosas importantes.

Por ejemplo, preguntarte:

- ¿el consumidor puede seguir usando lo que ya usaba?
- ¿sus imports, llamadas o expectativas básicas siguen funcionando parecido?
- ¿el cambio fue más bien aditivo, pequeño o más disruptivo?

Eso ya te da una base muy buena.

---

## Primer contraste conceptual

Imaginá una librería propia.

### Caso A
Solo corregiste un detalle menor interno.

### Caso B
Agregaste una capacidad nueva, pero sin romper lo que ya existía.

### Caso C
Cambiaste algo importante del comportamiento o de la forma en que se consume.

Aunque hoy no quieras convertir esto en una teoría rígida,
es bastante razonable sentir que esos tres casos no merecen comunicar exactamente lo mismo.

Entonces aparece una idea muy importante:

> el versionado útil no solo cuenta que hubo cambio; sugiere qué clase de cambio hubo.

---

## Qué gana el consumidor con eso

Muchísimo.

Porque cuando ve una nueva versión,
puede interpretar algo como:

- esto parece un ajuste pequeño
- esto parece una evolución compatible
- esto parece un cambio más fuerte y conviene mirarlo mejor

No hace falta prometer precisión matemática absoluta.
Pero sí conviene dar señales razonables.

Entonces aparece otra verdad importante:

> una buena versión le ahorra ambigüedad al consumidor.

---

## Una intuición muy útil

Podés pensarlo así:

> la versión también funciona como un pequeño resumen del impacto esperado del cambio.

Esa frase vale muchísimo.

---

## Cambios pequeños

En esta etapa podés pensar como “cambios pequeños” cosas como:

- correcciones acotadas
- ajustes menores
- mejoras internas chicas
- cambios que no alteran mucho la experiencia esperada del consumidor

No hace falta cerrar hoy una convención exacta universal.
Lo importante es que empieces a distinguir que hay cambios cuyo impacto esperado es bajo.

Y si el impacto esperado es bajo,
la señal de versión no debería parecer gigantesca sin razón.

---

## Cambios más visibles pero todavía compatibles

También puede pasar que:

- agregues una mejora útil
- sumes una capacidad nueva
- amplíes algo
- pero sin romper demasiado lo anterior

Acá también tiene sentido que la versión lo refleje como algo más visible que un ajuste mínimo, pero no necesariamente como una ruptura fuerte.

Esa zona intermedia es muy importante para pensar el crecimiento ordenado del proyecto.

---

## Cambios mayores o más disruptivos

Y después existen cambios donde sentís algo como:

- esto ya no se comporta igual
- esto obliga a revisar cómo se consume
- esto puede romper expectativas previas
- esto conviene comunicarlo como algo más fuerte

No hace falta que hoy tengas todas las reglas exactas.
Lo importante es que empieces a respetar esta intuición:
- hay cambios que piden una señal de versión más fuerte porque su impacto también lo es.

---

## Ejercicio 1 — clasificar cambios

Quiero que hagas esto por escrito con uno de tus proyectos:

Tomá tres cambios imaginarios o reales:

1. una corrección pequeña
2. una mejora compatible
3. un cambio más disruptivo

Y respondé:
- ¿sentís que los tres deberían comunicar lo mismo en la versión?
- ¿cuál parece más chico?
- ¿cuál parece más importante de señalar?

### Objetivo
Desarrollar criterio de impacto antes de hablar de reglas más formales.

---

## Qué relación tiene esto con la confianza del build

También importa mucho.

No alcanza con que el número cambie.
También importa si el cambio:
- fue validado
- está probado
- y merece el nivel de confianza que la nueva versión sugiere

Entonces versionado y calidad no viven separados.
Se apoyan mutuamente.

Si querés comunicar estabilidad razonable,
conviene que el build también esté a la altura de esa señal.

---

## Qué relación tiene esto con releases

Muy fuerte.

Cuando cerrás una release,
no solo estás diciendo:
- “cierro una etapa”

También estás diciendo algo sobre:
- qué tan importante fue el cambio respecto de la etapa anterior
- y qué debería esperar quien venga desde una versión previa

Entonces el versionado ya no es solo transición de `SNAPSHOT` a release.
También es una narrativa del tipo de evolución del artefacto.

---

## Una intuición muy útil

Podés pensarlo así:

- cerrar una versión no solo marca madurez
- también marca magnitud e impacto del cambio frente a la versión anterior

Esa frase vale muchísimo.

---

## Qué no conviene hacer

No conviene:

- cambiar versiones como si todos los cambios fueran equivalentes
- usar saltos grandes de versión para cambios mínimos sin una razón clara
- minimizar en la versión un cambio que en realidad rompe expectativas importantes
- o tratar el versionado como un trámite aislado del impacto real del artefacto

Entonces aparece una verdad importante:

> versionar sin mirar el impacto del cambio es perder una de las utilidades más fuertes que tiene la versión para el consumidor.

---

## Qué no hace falta decidir todavía con rigidez

No hace falta que hoy cierres una política matemática perfecta de versionado.
Eso puede venir más adelante.

Lo importante por ahora es que construyas una mirada sana:

- cambio chico
- cambio intermedio
- cambio mayor
- compatibilidad más conservada o más afectada

Esa base conceptual ya es muy valiosa.

---

## Ejercicio 2 — pensar desde el consumidor

Respondé esta pregunta:

> Si vos consumieras tu propia librería desde otro proyecto, ¿qué te gustaría entender cuando ves que una versión cambió: solo que “hay algo nuevo”, o también qué tan grande e invasivo puede ser ese cambio?

### Objetivo
Que la versión deje de verse solo desde el productor y empiece a verse también desde quien la recibe.

---

## Qué relación tiene esto con equipos

Muy fuerte.

En trabajo compartido,
la versión ayuda a coordinar expectativas entre personas distintas.

Si el versionado comunica mejor:
- el equipo revisa mejor
- los consumidores deciden mejor cuándo adoptar
- y las migraciones o cambios se entienden con menos fricción

Por eso este tema ya no es solo técnico.
También es de comunicación entre personas.

---

## Qué relación tiene esto con la siguiente línea SNAPSHOT

Muy buena también.

Cuando abrís una nueva línea después de una release,
el número que elegís ya puede empezar a sugerir algo sobre:
- cuánto esperás cambiar
- qué magnitud de evolución viene
- y cómo querés que eso se lea

Entonces este tema encaja perfecto con el anterior:
- no solo importa abrir una nueva snapshot
- también importa cómo la nombrás y qué clase de cambio querés comunicar

---

## Ejercicio 3 — elegir la señal de cambio

Quiero que tomes la release anterior de uno de tus proyectos y respondas:

> Si ahora fueras a abrir una nueva línea SNAPSHOT, ¿querés comunicar un ajuste pequeño, una evolución compatible más visible o una etapa más disruptiva? ¿Por qué?

### Objetivo
Que la elección de la próxima versión tenga intención comunicativa.

---

## Error común 1 — pensar que la versión solo sirve para identificar el artefacto

No.
También ayuda a comunicar impacto esperado.

---

## Error común 2 — tratar todos los cambios igual

Eso empobrece mucho el valor del versionado.

---

## Error común 3 — exagerar versiones por entusiasmo o minimizarlas por comodidad

Ambos casos pueden confundir al consumidor.

---

## Error común 4 — olvidar que la compatibilidad importa muchísimo para quien consume el artefacto

Este es uno de los puntos más importantes de todo el tema.

---

## Qué no conviene olvidar

Este tema no pretende que hoy memorices una teoría completa de versionado formal.
Lo que sí quiere dejarte es una base muy fuerte:

- no todos los cambios son iguales
- la versión puede comunicar magnitud e impacto
- la compatibilidad importa
- y versionar bien es también ayudar al consumidor a interpretar mejor la evolución del artefacto

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Tomá uno de tus proyectos o módulos Maven.

### Ejercicio 2
Escribí tres tipos de cambio posibles:
- uno pequeño
- uno intermedio
- uno mayor

### Ejercicio 3
Explicá por qué no te parece razonable comunicar los tres con la misma señal de versión.

### Ejercicio 4
Respondé qué te gustaría que pudiera inferir un consumidor al ver una nueva versión.

### Ejercicio 5
Escribí con tus palabras qué papel juega la compatibilidad en esa decisión.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Por qué la versión debería comunicar algo sobre el tipo de cambio?
2. ¿Qué diferencia conceptual hay entre un cambio pequeño y uno mayor?
3. ¿Por qué la compatibilidad importa tanto al pensar una nueva versión?
4. ¿Qué gana el consumidor cuando el versionado comunica mejor el impacto esperado?
5. ¿Por qué versionar bien también es una forma de comunicación profesional?

---

## Mini desafío

Hacé una práctica conceptual:

1. elegí un proyecto Maven tuyo
2. imaginá una release cerrada
3. pensá tres evoluciones posibles:
   - una corrección menor
   - una mejora compatible
   - una ruptura o cambio fuerte
4. escribí cómo te gustaría que cada una “sonara” al consumidor en términos de versión
5. redactá una nota breve explicando cómo este tema te ayudó a ver las versiones como señales de impacto y no solo como identificadores

Tu objetivo es que el versionado deje de parecer una subida arbitraria de números y pase a sentirse como una herramienta para comunicar magnitud de cambio, compatibilidad y expectativas reales de consumo.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este sexagésimo cuarto tema, ya deberías poder:

- pensar mejor la diferencia entre cambios pequeños, intermedios y mayores
- relacionar la versión con expectativas de compatibilidad
- usar el versionado como señal de impacto esperado
- mirar la evolución del artefacto con más criterio profesional
- y ver que versionar bien también es ayudar a otros a consumir mejor tu trabajo

---

## Resumen del tema

- No todos los cambios merecen comunicar lo mismo en la versión.
- Pensar compatibilidad ayuda muchísimo a elegir mejor cómo evoluciona una línea de versiones.
- La versión puede funcionar como señal de magnitud e impacto esperado del cambio.
- Esto ayuda tanto al productor como al consumidor del artefacto.
- Versionar bien también es comunicar mejor.
- Ya diste otro paso importante hacia un uso más profesional, más claro y más responsable del versionado en Maven.

---

## Próximo tema

En el próximo tema vas a aprender a empezar a ordenar una estrategia de versionado más consistente para tus propios proyectos, porque después de entender que la versión también comunica tipo de cambio y compatibilidad, el siguiente paso natural es convertir esa intuición en una política más estable y repetible para tu forma de trabajar.
