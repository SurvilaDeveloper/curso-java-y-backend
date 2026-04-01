---
title: "Entender cuándo conviene usar verify en Maven y cómo se ubica en el pipeline"
description: "Quincuagésimo octavo tema práctico del curso de Maven: aprender qué rol cumple verify dentro del lifecycle, cuándo conviene usarlo frente a test o package y cómo ubicarlo con criterio dentro de un pipeline Maven más profesional."
order: 58
module: "Automatización, CI y flujos profesionales"
level: "intermedio"
draft: false
---

# Entender cuándo conviene usar `verify` en Maven y cómo se ubica en el pipeline

## Objetivo del tema

En este quincuagésimo octavo tema vas a:

- entender mejor qué representa `verify` dentro del lifecycle Maven
- distinguirlo de `test` y de `package`
- pensar cuándo conviene usarlo dentro de un pipeline
- ubicarlo mejor como etapa de validación seria
- desarrollar más criterio para elegir qué comando expresa mejor la confianza que querés obtener del proyecto

La idea es que `verify` deje de parecer una fase lejana o poco clara y pase a sentirse como una etapa lógica cuando querés una validación más completa antes de considerar el build realmente confiable.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- usar `compile`, `test`, `package`, `install` y entender `deploy`
- entender el lifecycle básico de Maven
- diseñar un pipeline Maven mínimo
- pensar en feedback temprano y orden de etapas
- distinguir validación, empaquetado e instalación dentro de un flujo profesional

Si hiciste los temas anteriores, ya estás listo para este paso.

---

## Idea central del tema

En los últimos temas pensaste bastante el pipeline en términos de:

- validar temprano
- producir artefactos después
- no publicar demasiado pronto
- ordenar etapas con intención

Ahora aparece una fase del lifecycle que muchas veces genera dudas:

```bash
mvn verify
```

La pregunta importante es:

> si ya existe `test`, y ya existe `package`, ¿qué lugar tiene `verify`?

La respuesta corta es esta:

> `verify` representa muy bien la idea de “quiero llegar a una validación más completa del build antes de considerarlo realmente aceptable”.

Ese es el corazón del tema.

---

## Qué lugar ocupa verify en el lifecycle

Sin entrar en toda la lista completa de fases otra vez, conviene recordar algo:

- `test` valida la ejecución de pruebas en el punto correspondiente
- `package` produce el artefacto empaquetado
- `verify` viene después de `package` y está pensado para verificar que el paquete es válido y que el build está en condiciones aceptables

Dicho simple:

> `verify` vive en una zona del lifecycle donde ya no solo te importa compilar o correr tests aislados, sino revisar que el build completo llegó a un estado razonablemente sano.

---

## Una intuición muy útil

Podés pensarlo así:

- `test` responde mucho a “¿pasan los tests?”
- `package` responde mucho a “¿puedo producir el artefacto?”
- `verify` responde más a “¿el build llegó a un estado verificablemente aceptable antes de seguir?”

Esa diferencia vale muchísimo.

---

## Por qué verify genera dudas

Porque al principio es fácil pensar:

- “si ya corrí `test`, listo”
o
- “si ya corrí `package`, ya está”

Pero `verify` introduce una idea más madura:

- no solo corrí cosas
- quiero una señal de validación más completa del build antes de seguir

Entonces aparece una verdad importante:

> `verify` tiene valor cuando no querés quedarte ni en la validación más temprana ni solo en la producción del artefacto, sino en una noción más completa de confianza del build.

---

## Qué ventaja conceptual tiene verify

Te ayuda a pensar el proyecto así:

- no solo lo probé
- no solo lo empaqueté
- además llegué a una etapa donde el build completo pasó por un umbral de verificación más serio

Esa diferencia es muy útil en pipelines,
porque expresa mejor una intención de calidad intermedia entre:

- validación básica
y
- distribución o publicación

---

## Primer contraste útil: test vs verify

### `mvn clean test`
Muy bueno para feedback temprano.
Te ayuda a responder:
- ¿compila?
- ¿pasan los tests?

### `mvn clean verify`
Te ayuda a responder algo más amplio:
- ¿el build, llevado más adelante en el lifecycle, llegó a una validación más completa y aceptable?

Entonces aparece una idea importante:

> `test` suele ser excelente para un filtro temprano; `verify` suele ser excelente para una validación más fuerte antes de considerar el build realmente listo para pasos posteriores.

---

## Segundo contraste útil: package vs verify

### `mvn clean package`
Responde:
- ¿puedo generar el artefacto?

### `mvn clean verify`
Responde algo más rico:
- ¿puedo generar el artefacto y además completar una etapa de verificación más fuerte antes de seguir?

Entonces aparece otra idea importante:

> `package` se enfoca mucho en producir; `verify` se enfoca mucho en validar el resultado del build ya más adelante en el lifecycle.

---

## Una intuición muy útil

Podés pensarlo así:

- `test` = salud temprana
- `package` = producción del artefacto
- `verify` = confianza más completa antes de avanzar a instalación o publicación

Esa frase ordena muchísimo.

---

## Cuándo suele tener mucho sentido usar verify

En esta etapa del curso, una respuesta bastante sana sería:

- cuando querés una validación más fuerte que `test`
- cuando el pipeline ya no es tan mínimo
- cuando querés una etapa previa razonable antes de `install` o `deploy`
- cuando te importa expresar mejor que el build completo pasó una barrera de confianza más seria

No hace falta usarlo siempre porque sí.
Lo importante es entender qué problema te resuelve.

---

## Cuándo puede no ser imprescindible

También conviene decirlo con claridad.

En proyectos muy simples o en validaciones muy tempranas,
muchas veces:

```bash
mvn clean test
```

ya cumple muy bien el papel de feedback temprano.

Entonces no conviene convertir `verify` en una moda automática.
Conviene usarlo cuando realmente aporta una etapa más expresiva de verificación.

Entonces aparece una verdad importante:

> `verify` no siempre reemplaza a `test`; muchas veces conviven muy bien porque cumplen papeles distintos dentro del flujo.

---

## Primer ejemplo mental de pipeline con verify

Podés imaginar algo así:

1. validación temprana:
```bash
mvn clean test
```

2. validación más completa y preparación seria del build:
```bash
mvn clean verify
```

3. y recién después, si hace falta, pensar en:
```bash
mvn install
```
o
```bash
mvn deploy
```

No hace falta que todos los proyectos usen exactamente este orden.
Lo importante es ver que `verify` puede funcionar muy bien como bisagra entre validar y publicar.

---

## Ejercicio 1 — ubicar verify en tu flujo mental

Quiero que respondas por escrito:

- ¿Qué te da `test`?
- ¿Qué te da `package`?
- ¿Qué te da `verify` que te ayude a pensar el build con más confianza?

### Objetivo
Que `verify` deje de ser una palabra del lifecycle y pase a tener significado real en tu cabeza.

---

## Qué relación tiene esto con feedback temprano

Muy buena pregunta.

A primera vista podría parecer que `verify` llega “más tarde” que `test`, y eso es cierto.
Pero eso no le quita valor.
Lo que pasa es que cumple otro papel:

- `test` es muy bueno para fallar temprano
- `verify` es muy bueno para dar una confianza más completa antes de seguir con etapas de circulación del artefacto

Entonces aparece una idea importante:

> feedback temprano y verify no compiten; uno te ayuda a fallar rápido y el otro te ayuda a exigir una validación más fuerte antes de avanzar.

Esa combinación puede ser muy sana.

---

## Qué relación tiene esto con install

Muy fuerte.

Muchas veces tiene mucho sentido pensar así:

- primero verifico mejor
- después, si todo eso pasó, recién instalo

Porque `install` ya empieza a poner el artefacto en un lugar donde otros proyectos de tu entorno podrían consumirlo.

Entonces la pregunta razonable es:
- ¿quiero instalar algo que todavía no pasó una verificación más seria?

Ahí `verify` empieza a mostrar muchísimo valor.

---

## Qué relación tiene esto con deploy

Todavía más fuerte.

Si `deploy` apunta a publicación remota,
entonces suele ser aún más razonable querer una etapa de verificación sólida antes.

Entonces aparece una verdad importante:

> cuanto más lejos va a circular el artefacto, más sentido suele tener una validación seria previa; y ahí `verify` encaja muy bien conceptualmente.

---

## Una intuición muy útil

Podés pensarlo así:

> `verify` es una muy buena frontera mental entre “todavía estoy validando el build” y “ya estoy por dejar que este artefacto circule”.

Esa frase vale muchísimo.

---

## Qué relación tiene esto con multi-módulo

También puede ser muy valioso.

En sistemas multi-módulo,
`verify` desde la raíz puede ayudarte a pensar no solo en:
- “¿compila el sistema?”
sino también en:
- “¿el sistema, llevado a una etapa más seria del lifecycle, sigue estando bien?”

Eso puede ser muy útil cuando el proyecto ya tiene un poco más de complejidad y querés una señal más fuerte antes de seguir.

---

## Ejercicio 2 — decidir si verify ya te aporta

Quiero que tomes uno de tus proyectos y respondas:

> ¿En este momento te alcanzaría con `clean test` para validación temprana, o ya te aportaría tener una etapa explícita con `clean verify` antes de instalar o publicar? ¿Por qué?

### Objetivo
Empezar a elegir `verify` por necesidad real y no por inercia.

---

## Qué no conviene hacer

No conviene:

- usar `verify` solo porque suena más profesional si no sabés qué pregunta responde
- ni descartarlo solo porque “ya existe test”
- ni meterlo en el pipeline sin pensar qué lugar ocupa
- ni confundirlo con publicación

Entonces aparece otra idea importante:

> `verify` tiene valor cuando expresa una intención clara de validación más completa; sin esa intención, se vuelve solo un nombre más del lifecycle.

---

## Error común 1 — pensar que verify es simplemente “otro nombre para test”

No.
Está más adelante en el lifecycle y expresa otra intención.

---

## Error común 2 — pensar que verify ya implica instalación o publicación

No.
Sigue estando del lado de validación,
no del lado de circulación final del artefacto.

---

## Error común 3 — creer que si package funcionó entonces verify no aporta nada

No necesariamente.
Depende de qué nivel de confianza querés pedir antes de seguir.

---

## Error común 4 — no ubicar verify dentro de una lógica de pipeline

Este tema se entiende mucho mejor si lo pensás dentro de etapas y decisiones.

---

## Ejercicio 3 — escribir preguntas por etapa

Quiero que armes una tabla o lista así:

- `test`: ¿qué pregunta responde?
- `package`: ¿qué pregunta responde?
- `verify`: ¿qué pregunta responde?
- `install`: ¿qué pregunta responde?
- `deploy`: ¿qué pregunta responde?

### Objetivo
Que cada comando deje de ser solo sintaxis y pase a representar una intención clara dentro del flujo.

---

## Qué no conviene olvidar

Este tema no pretende que desde ahora todos tus pipelines tengan que usar `verify`.

Lo que sí quiere dejarte es criterio real:

- `test` sirve muchísimo para feedback temprano
- `package` sirve muchísimo para producir el artefacto
- `verify` sirve muchísimo cuando querés una validación más completa antes de seguir con circulación o publicación

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Tomá tu pipeline actual o el que diseñaste en los temas anteriores.

### Ejercicio 2
Agregá `verify` como posible etapa conceptual.

### Ejercicio 3
Escribí qué rol tendría respecto de:
- `test`
- `package`
- `install`

### Ejercicio 4
Respondé si en tu proyecto actual tiene sentido usarlo ya o si todavía sería innecesario.

### Ejercicio 5
Escribí con tus palabras qué ganás cuando `verify` se usa con intención y no solo por costumbre.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué diferencia conceptual hay entre `test`, `package` y `verify`?
2. ¿Qué tipo de confianza extra puede representar `verify`?
3. ¿Por qué puede ser una buena etapa antes de `install` o `deploy`?
4. ¿Por qué no conviene usarlo de forma automática sin pensar?
5. ¿Qué lugar podría ocupar en un pipeline más profesional?

---

## Mini desafío

Hacé una práctica conceptual:

1. tomá uno de tus proyectos Maven
2. escribí un pipeline de tres o cuatro pasos
3. incluí `verify` en una posición razonable
4. justificá por qué lo pusiste ahí
5. redactá una nota breve explicando cómo este tema te ayudó a distinguir mejor entre validar temprano, producir artefactos y exigir una verificación más completa antes de circularlos

Tu objetivo es que `verify` deje de parecer una fase abstracta del lifecycle y pase a sentirse como una herramienta útil para diseñar pipelines Maven con más intención y más confianza.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este quincuagésimo octavo tema, ya deberías poder:

- entender qué papel cumple `verify`
- distinguirlo mejor de `test` y `package`
- ubicarlo con más criterio dentro de un pipeline
- decidir cuándo aporta y cuándo todavía no hace falta
- y pensar el lifecycle Maven con una lógica bastante más madura y profesional

---

## Resumen del tema

- `verify` representa una etapa de validación más completa dentro del lifecycle.
- No es lo mismo que `test`, ni lo mismo que `package`.
- Puede tener mucho valor como frontera antes de `install` o `deploy`.
- Conviene usarlo con intención, no por costumbre.
- Este tema te ayuda a pensar mejor la confianza que querés exigirle al build antes de dejar circular el artefacto.
- Ya diste otro paso importante hacia pipelines Maven más claros y más profesionales.

---

## Próximo tema

En el próximo tema vas a aprender a pensar cuándo conviene llegar hasta `install` en un flujo automatizado y cuándo conviene detenerse antes, porque después de ubicar mejor `verify`, el siguiente paso natural es afinar todavía más la frontera entre validación seria y circulación local del artefacto.
