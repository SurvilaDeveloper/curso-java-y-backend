---
title: "Priorizar mejoras Maven en un proyecto vivo cuando no podés arreglar todo"
description: "Septuagésimo octavo tema práctico del curso de Maven: aprender a priorizar mejoras en un proyecto Maven vivo cuando hay tiempo limitado, deuda acumulada y varias cosas mejorables, para decidir qué conviene tocar primero y qué conviene dejar para después."
order: 78
module: "Decisiones sobre proyectos vivos y mantenimiento"
level: "intermedio"
draft: false
---

# Priorizar mejoras Maven en un proyecto vivo cuando no podés arreglar todo

## Objetivo del tema

En este septuagésimo octavo tema vas a:

- aprender a priorizar mejoras Maven en proyectos que ya están vivos
- distinguir entre cosas importantes, urgentes y simplemente molestas
- decidir qué conviene tocar primero cuando no podés arreglar todo a la vez
- desarrollar más criterio de mantenimiento sobre proyectos reales
- empezar este nuevo tramo del roadmap con una lógica más cercana a trabajo profesional cotidiano

La idea es que dejes de imaginar mejoras Maven en un laboratorio perfecto y empieces a pensarlas en un contexto mucho más real: hay deuda, hay límites de tiempo, hay cosas mejorables por todos lados y aun así tenés que decidir bien por dónde empezar.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- leer proyectos Maven de forma bastante integral
- separar problemas por capas
- comparar alternativas por costo, claridad y riesgo
- defender una decisión con argumentos
- evaluar si una mejora realmente ayudó
- reconocer patrones sanos y patrones problemáticos
- pensar Maven con un criterio bastante más profesional que al principio

Si venís siguiendo el roadmap, ya tenés muy buena base para este paso.

---

## Idea central del tema

Hasta ahora viste muchas habilidades valiosas:

- diagnosticar
- separar capas
- comparar soluciones
- elegir una razonable
- justificarla
- evaluar su resultado

Ahora aparece una situación todavía más realista:

> el proyecto tiene varias cosas mejorables, pero no tenés tiempo, energía ni contexto para arreglar todo de una sola vez.

Entonces la pregunta ya no es solo:

- “¿qué está mal o mejorable?”

Sino también:

- “¿qué conviene tocar primero?”
- “¿qué puede esperar?”
- “¿qué me daría más valor con menos riesgo?”
- “¿qué ruido puedo tolerar por ahora y qué ya no?”

Ese es el corazón del tema.

---

## Por qué este tema importa tanto

Porque en proyectos vivos casi nunca te dan este escenario ideal:

- proyecto chico
- tiempo infinito
- sin usuarios
- sin otras prioridades
- y con permiso para rediseñar todo

Más bien aparece algo como:

- el build anda, pero está feo
- hay duplicación
- el pipeline es discutible
- la raíz no está del todo bien gobernada
- el versionado es mejorable
- hay publicación medio improvisada
- y además hay otras tareas del producto o del backend que compiten por tiempo

Entonces aparece una verdad importante:

> en proyectos vivos, priorizar bien suele ser más valioso que detectar absolutamente todos los problemas.

Esa frase vale muchísimo.

---

## Una intuición muy útil

Podés pensarlo así:

- un proyecto vivo siempre tiene más mejoras posibles que tiempo disponible
- el criterio profesional aparece cuando sabés elegir las que más valor dan ahora

Esa frase ordena muchísimo.

---

## Qué significa “proyecto vivo” en este contexto

Significa algo como:

- ya existe
- ya se usa
- ya tiene historia
- tal vez ya tiene consumidores internos o externos
- y no está disponible para ser tratado como maqueta académica

O sea:
las decisiones no ocurren en vacío.
Tienen contexto,
costos,
tiempos,
impacto,
y a veces también compromisos con otras partes del sistema.

Eso vuelve la priorización mucho más importante.

---

## Qué no conviene hacer primero

No conviene arrancar desde esta fantasía:

- “ya que estoy, rehago toda la estructura”
- “aprovecho y paso todo a multi-módulo perfecto”
- “ordeno versionado, publicación, plugins, pipeline y perfiles de una sola vez”

Eso puede sonar tentador,
pero muchas veces es una mala primera jugada.

Entonces aparece una idea muy importante:

> en proyectos vivos, la pregunta no es “qué sería lo ideal en abstracto”, sino “qué mejora concreta vale más la pena ahora sin desordenar demasiado el sistema”.

---

## Primer criterio: impacto real

Una mejora gana prioridad cuando tiene impacto real sobre cosas como:

- errores frecuentes
- mantenimiento repetitivo
- claridad del equipo
- riesgo del build
- fricción cotidiana
- costo de cambios futuros

Entonces conviene preguntarte:

> ¿qué parte del proyecto me está costando de verdad hoy?

Esto ayuda mucho a salir de mejoras “lindas” pero poco urgentes.

---

## Segundo criterio: frecuencia del dolor

Otra pregunta muy útil es:

> ¿esto molesta una vez cada tanto o aparece todo el tiempo?

Porque una mejora pequeña que elimina una molestia recurrente puede valer mucho más que una mejora más sofisticada que ataca algo raro.

Por ejemplo:
- una versión repetida en muchos módulos
- un plugin duplicado en varios hijos
- una frontera del pipeline que todos ejecutan a diario y no tiene mucho sentido

Eso puede dar muchísimo valor muy rápido.

Entonces aparece una verdad importante:

> cuando el dolor es frecuente, incluso una mejora pequeña puede ser una prioridad alta.

---

## Tercer criterio: riesgo del área tocada

No toda mejora de alto valor conviene hacerla inmediatamente si toca una zona muy delicada.

Por ejemplo, no es lo mismo:

- ordenar una propiedad repetida
que
- tocar la herencia completa
o
- cambiar la publicación remota
o
- reestructurar una raíz multi-módulo con consumidores activos

Entonces conviene cruzar dos preguntas:

- ¿qué tanto valor tiene?
- ¿qué tanto riesgo trae tocarlo ahora?

Esto es muy importante,
porque en proyectos vivos la estabilidad pesa muchísimo.

---

## Una intuición muy útil

Podés pensarlo así:

- alto valor + bajo riesgo = candidato excelente
- alto valor + alto riesgo = quizá importante, pero necesita mejor timing
- bajo valor + alto riesgo = suele esperar
- bajo valor + bajo riesgo = puede entrar si limpia mucho y no distrae

Esa clasificación ayuda muchísimo.

---

## Cuarto criterio: visibilidad del beneficio

A veces una mejora es técnicamente correcta,
pero su beneficio es difícil de percibir.
Y otras veces una mejora vuelve mucho más claro algo que el equipo usa todo el tiempo.

Por ejemplo:

- centralizar dos versiones repetidas puede ser un beneficio visible y fácil de sostener
- cambiar la lógica de publicación remota sin necesidad inmediata puede ser correcto, pero de beneficio poco visible hoy

Entonces conviene pensar:

> ¿esta mejora le hace la vida mejor a alguien en el corto plazo, o solo satisface una prolijidad abstracta?

No es que lo segundo nunca importe,
pero en proyectos vivos suele ganar mucho peso lo primero.

---

## Ejercicio 1 — distinguir importante, urgente y molesto

Quiero que hagas esto por escrito con un proyecto real o imaginario.

Tomá cuatro o cinco problemas Maven y clasificá cada uno como:

- urgente
- importante pero no urgente
- molesto frecuente
- mejora estética o de prolijidad

### Objetivo
Entrenar un lenguaje de prioridad más fino que “está mal / no está mal”.

---

## Qué tipos de mejoras suelen ser buenas primeras prioridades

En esta etapa del curso,
muchas veces son buenos primeros candidatos cosas como:

- duplicación clara de dependencias o plugins
- versión mal centralizada que aparece en varios lados
- pipeline sobredimensionado para el uso real
- `pom.xml` raíz difícil de leer por desorden acumulado moderado
- uso poco claro entre management y uso real
- pequeñas incoherencias que todos tocan seguido

¿Por qué?
Porque suelen combinar:
- valor real
- riesgo relativamente controlable
- mejora visible
- y verificación razonable

Entonces aparece una idea importante:

> en proyectos vivos, las mejores primeras mejoras suelen ser las que limpian fricción real sin exigir cirugía mayor.

---

## Qué cosas suelen merecer más paciencia

También hay mejoras que pueden ser buenas,
pero que muchas veces conviene dejar para una etapa más preparada:

- reestructuración multi-módulo fuerte
- cambio de estrategia de publicación
- rediseño grande de parent y agregación
- cambios profundos de versionado en un sistema compartido
- mezcla de varias refactorizaciones estructurales a la vez

No porque estén mal,
sino porque suelen pedir:
- más contexto
- más validación
- más alineación
- y mejor timing

---

## Ejercicio 2 — elegir una primera mejora razonable

Tomá un proyecto Maven tuyo o imaginario y respondé:

1. ¿Cuál sería una mejora de buen impacto y riesgo controlable?
2. ¿Por qué la priorizarías antes que otras?
3. ¿Qué mejora dejarías para más adelante aunque también te parezca buena?
4. ¿Qué justifica esa diferencia de timing?

### Objetivo
Practicar priorización real, no solo inventario de mejoras.

---

## Qué no conviene confundir

No conviene confundir estas cosas:

### “Importante”
Puede ser algo muy relevante,
pero no necesariamente lo primero que conviene tocar.

### “Urgente”
Puede requerir atención ya,
aunque no sea el problema más profundo del sistema.

### “Molesto”
Puede parecer menor,
pero si aparece todos los días puede merecer prioridad alta.

### “Ideal”
Puede ser correcto en abstracto,
pero no necesariamente proporcional para este momento del proyecto.

Entonces aparece una verdad importante:

> priorizar Maven en proyectos vivos también exige distinguir entre profundidad del problema y conveniencia del momento.

Esa frase vale muchísimo.

---

## Una intuición muy útil

Podés pensarlo así:

- lo más importante no siempre entra primero
- entra primero lo que más conviene ahora dadas las restricciones reales

Esa frase es muy profesional.

---

## Qué papel tiene la verificación en la prioridad

Muy fuerte.

Una mejora es mejor candidata si además sabés cómo verificarla sin demasiado caos.

Por ejemplo:

- una duplicación de dependencia se puede verificar con `clean test`, `effective-pom` o `dependency:tree`
- una frontera de pipeline se puede revisar con `clean verify` y propósito del flujo
- una reestructuración más grande puede requerir validaciones mucho más delicadas

Entonces otra pregunta útil es:

> ¿puedo comprobar rápido y con confianza que esta mejora salió bien?

Si la respuesta es sí,
gana prioridad.

---

## Qué relación tiene esto con confianza del equipo

Muchísima.

En proyectos vivos también importa que las mejoras:

- no generen susto innecesario
- no rompan hábitos sanos sin beneficio claro
- no compliquen el trabajo diario
- y puedan explicarse fácilmente al resto

Esto hace que la priorización no sea solo técnica.
También es una forma de cuidar cómo evoluciona el proyecto en la práctica.

---

## Ejercicio 3 — construir una mini matriz de prioridad

Quiero que tomes tres mejoras posibles y las compares con una matriz simple:

| Mejora | Impacto | Frecuencia del dolor | Riesgo | Facilidad de verificar | ¿La priorizo ahora? |
|-------|---------|----------------------|--------|------------------------|---------------------|

No hace falta precisión matemática.
Lo importante es que ordenes la decisión.

### Objetivo
Practicar un criterio más visible y menos impulsivo.

---

## Qué no conviene hacer

No conviene:

- priorizar solo por lo que más molesta emocionalmente
- elegir siempre la mejora más grande para “aprovechar”
- dejarse llevar por soluciones teóricamente elegantes pero poco oportunas
- ni postergar eternamente todo lo importante por miedo a tocar el proyecto

Entonces aparece otra verdad importante:

> priorizar bien no es ni correr a reescribir todo ni congelarse; es encontrar mejoras de valor con el mejor timing posible.

---

## Qué relación tiene esto con trabajo profesional

Muchísima.

Porque una gran parte del trabajo real con Maven no consiste en:
- empezar proyectos nuevos desde cero

Sino en:
- entrar a proyectos vivos
- tolerar cierta deuda
- decidir qué conviene mejorar ahora
- y dejar el sistema un poco mejor sin convertir cada intervención en una revolución

Este tema te entrena mucho para eso.

---

## Una intuición muy útil

Podés pensarlo así:

> el criterio profesional en proyectos vivos no elimina los compromisos; te ayuda a navegar mejor entre ellos.

Esa frase vale muchísimo.

---

## Qué no conviene olvidar

Este tema no pretende que exista una fórmula perfecta de prioridad.
Siempre va a haber contexto, matices y restricciones reales.

Lo que sí quiere dejarte es una brújula muy útil:

- impacto
- frecuencia
- riesgo
- visibilidad del beneficio
- facilidad de verificación
- y timing

Eso ya te da muchísimo más criterio que “esto me gusta más”.

---

## Error común 1 — creer que la mejora más estructural siempre debe ir primero

No necesariamente.
Puede ser demasiado riesgosa para el momento.

---

## Error común 2 — subestimar molestias frecuentes porque “no son profundas”

A veces son las mejores primeras prioridades.

---

## Error común 3 — elegir solo por gusto de prolijidad

Eso puede alejarte del valor real.

---

## Error común 4 — no considerar si el cambio se puede verificar con claridad

Eso debilita mucho una prioridad.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Tomá un proyecto Maven real o imaginario.

### Ejercicio 2
Listá al menos cinco mejoras posibles.

### Ejercicio 3
Evaluá cada una según:
- impacto
- frecuencia del dolor
- riesgo
- facilidad de verificación

### Ejercicio 4
Elegí una mejora prioritaria.

### Ejercicio 5
Justificá por qué esa y no otra.

### Ejercicio 6
Escribí qué dejarías para una segunda etapa y por qué.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Por qué no alcanza con listar mejoras posibles en un proyecto vivo?
2. ¿Qué criterios te ayudan a decidir qué conviene tocar primero?
3. ¿Por qué algo molesto y frecuente puede merecer prioridad alta?
4. ¿Por qué una mejora importante no siempre es la primera que conviene hacer?
5. ¿Qué te aporta pensar prioridad como una combinación de valor y timing?

---

## Mini desafío

Hacé una práctica conceptual o real:

1. elegí un proyecto Maven vivo o imaginario
2. escribí cinco mejoras posibles
3. construí una mini matriz de prioridad
4. elegí la primera mejora
5. justificá la elección
6. redactá una nota breve explicando cómo este tema te ayudó a pasar de “veo muchas cosas mejorables” a “sé elegir qué conviene tocar ahora”

Tu objetivo es que Maven deje de sentirse como un conjunto de mejoras infinitas y pase a verse como un espacio donde también podés priorizar con bastante más criterio profesional, incluso cuando el proyecto ya está vivo y no permite arreglar todo al mismo tiempo.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este septuagésimo octavo tema, ya deberías poder:

- priorizar mejoras Maven en proyectos vivos
- distinguir entre urgente, importante, molesto y estético
- elegir una primera mejora razonable según impacto y riesgo
- justificar mejor el timing de tus decisiones
- y moverte con bastante más criterio en contextos reales de mantenimiento

---

## Resumen del tema

- En proyectos vivos siempre hay más mejoras posibles que tiempo disponible.
- Priorizar bien suele valer más que detectar todo.
- Impacto, frecuencia, riesgo, visibilidad del beneficio y facilidad de verificación ayudan mucho a decidir.
- No siempre conviene tocar primero lo más grande ni lo más “ideal”.
- Este tema te acerca mucho a un Maven pensado dentro de mantenimiento y evolución real.
- Ya diste otro paso importante hacia decisiones más maduras y más útiles sobre proyectos que ya están en marcha.

---

## Próximo tema

En el próximo tema vas a aprender a manejar mejor pequeñas restricciones reales —como poco tiempo, poco contexto o miedo a romper el build— sin quedarte paralizado, porque después de aprender a priorizar, el siguiente paso natural es ver cómo decidir incluso cuando el contexto es imperfecto y el margen de maniobra es limitado.
