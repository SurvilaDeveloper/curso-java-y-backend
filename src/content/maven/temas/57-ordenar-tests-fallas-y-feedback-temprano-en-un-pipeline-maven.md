---
title: "Ordenar tests, fallas y feedback temprano en un pipeline Maven"
description: "Quincuagésimo séptimo tema práctico del curso de Maven: aprender por qué conviene ubicar validaciones y tests temprano dentro de un pipeline Maven, entender el valor del feedback rápido y diseñar un flujo que falle antes cuando algo está mal."
order: 57
module: "Automatización, CI y flujos profesionales"
level: "intermedio"
draft: false
---

# Ordenar tests, fallas y feedback temprano en un pipeline Maven

## Objetivo del tema

En este quincuagésimo séptimo tema vas a:

- entender por qué importa mucho el orden de las etapas dentro de un pipeline Maven
- pensar mejor dónde conviene ubicar tests y validaciones
- ver por qué el feedback temprano mejora muchísimo el flujo
- diseñar pipelines que fallen antes cuando algo está mal
- reforzar una mentalidad más profesional sobre automatización y calidad del build

La idea es que dejes de pensar el pipeline solo como una secuencia de comandos y empieces a verlo también como una estrategia de validación: qué chequeás primero, qué dejás para después y dónde querés enterarte rápido de que algo está roto.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- usar `clean`, `compile`, `test`, `package`, `install` y entender `deploy`
- entender el rol de Maven en CI
- diseñar un pipeline Maven mínimo de validación y empaquetado
- pensar el build como un flujo automatizable y no solo como una ejecución manual
- tener una base clara de artefactos, tests y etapas del lifecycle

Si hiciste el tema anterior, ya estás listo para este paso.

---

## Idea central del tema

En el tema anterior diseñaste un pipeline mínimo y razonable.
Pero ahora aparece una pregunta todavía más fina:

> aunque ya sepas qué pasos querés correr, ¿en qué orden conviene ponerlos?

Esto importa muchísimo.

Porque no da lo mismo enterarte:

- al principio
- en el medio
- o al final

de que el proyecto tiene un problema.

Entonces aparece una idea muy importante:

> un buen pipeline no solo valida; también está pensado para darte feedback útil lo antes posible.

Esa es la idea central del tema.

---

## Qué significa feedback temprano

Significa recibir una señal rápida y clara de que algo está mal antes de seguir gastando tiempo, recursos o complejidad en etapas posteriores.

Por ejemplo, si el proyecto:

- no compila
- o tiene tests fallando

conviene enterarte antes de:

- empaquetar
- instalar
- publicar
- o seguir ejecutando etapas más costosas

Dicho simple:

> feedback temprano es fallar pronto cuando algo básico o importante ya está roto.

---

## Una intuición muy útil

Podés pensarlo así:

- primero conviene validar lo más esencial
- después recién avanzar hacia lo más costoso o más final

Esa frase vale muchísimo.

---

## Por qué este tema importa tanto

Porque un pipeline mal ordenado puede hacer cosas como:

- perder tiempo ejecutando pasos innecesarios
- generar artefactos que no deberían existir
- ocultar por más tiempo un error básico
- dar un flujo más lento y más frustrante

En cambio, un pipeline mejor pensado:

- falla antes
- da señales más claras
- reduce trabajo inútil
- y mejora mucho la experiencia de desarrollo

Entonces aparece una verdad importante:

> ordenar bien un pipeline no es detalle estético; es parte de la calidad del proceso.

---

## Primer criterio básico de orden

Podés usar esta regla general:

> primero validá lo más barato y esencial, después avanzá hacia lo más costoso o más final.

No resuelve todos los casos del mundo,
pero ordena muchísimo.

---

## Qué suele ser “más esencial” al principio

En una primera aproximación:

- que el proyecto compile
- que los tests relevantes pasen
- que el build base esté sano

Eso suele ser más importante al principio que, por ejemplo:

- instalar localmente
- publicar remotamente
- correr pasos finales de distribución

Entonces ya aparece una lógica bastante clara del flujo.

---

## Primer ejemplo mental de pipeline bien ordenado

Imaginá esto:

1. `mvn clean test`
2. `mvn clean package`

## Qué tiene de bueno

Primero respondés:
- ¿el proyecto está sano?

Después respondés:
- ¿además puedo producir el artefacto?

Eso da un feedback bastante razonable y temprano.

---

## Primer ejemplo mental de pipeline peor ordenado

Imaginá esto:

1. `mvn clean package`
2. recién después revisás si el proyecto realmente estaba bien validado en el sentido que te importaba

Aunque Maven ya hace varias cosas dentro del lifecycle,
como estrategia mental puede ser menos claro que separar bien:

- validación
- producción de artefacto

Entonces aparece una idea importante:

> incluso cuando el lifecycle haga varias cosas por vos, pensar el pipeline por etapas sigue siendo muy útil para diseñar feedback más claro.

---

## Qué tipo de fallas conviene detectar pronto

En general:

- errores de compilación
- tests que rompen el comportamiento esperado
- problemas básicos del proyecto que invalidan todo lo demás

Porque si esas capas ya están rotas,
seguir hacia:
- package
- install
- deploy

suele tener mucho menos sentido.

---

## Una intuición muy útil

Podés pensarlo así:

> si lo básico está roto, lo avanzado todavía no merece ejecutarse.

Esa frase vale muchísimo.

---

## Ejercicio 1 — pensar el costo de fallar tarde

Quiero que respondas:

> ¿Qué problema tendría enterarte recién al final del pipeline de algo que podrías haber detectado mucho antes con una validación básica?

Podés pensar en:
- tiempo perdido
- artefactos innecesarios
- ruido
- confusión

### Objetivo
Que veas el valor del orden del pipeline, no solo del contenido.

---

## Qué relación tiene esto con clean test

Muy fuerte.

`mvn clean test` suele ser una etapa muy valiosa para feedback temprano porque:

- parte limpio
- compila
- ejecuta tests
- y corta bastante rápido si lo importante ya está mal

Por eso tantas veces aparece como base de validación automática.

No significa que sea la única forma posible,
pero sí que tiene muchísimo sentido como primer gran filtro.

---

## Qué relación tiene esto con package

`package` sigue siendo importante,
pero suele ser una etapa posterior respecto del primer filtro de salud del proyecto.

Porque producir el artefacto final tiene más sentido cuando ya sabés que:

- el código compila
- los tests que te importan en esa fase están pasando

Entonces aparece otra verdad importante:

> producir artefactos vale más cuando ya pasaste una validación razonable previa.

---

## Ejercicio 2 — decidir qué querés saber primero

Tomá uno de tus proyectos y respondé:

1. ¿Qué querrías saber primero si alguien hace un cambio?
2. ¿Que el `.jar` existe?
3. ¿O que el proyecto sigue sano y los tests importantes pasan?

### Objetivo
Que el orden del pipeline salga de una prioridad real y no de una costumbre sin pensar.

---

## Qué relación tiene esto con install y deploy

Muchísima.

Si ya pensabas que `install` y sobre todo `deploy` no siempre tenían que estar en el pipeline mínimo,
ahora la razón queda todavía más fuerte.

Porque ambos suelen tener más sentido después de que pasó una validación sólida.

Por ejemplo:

- primero validás
- después empaquetás
- después, si corresponde, instalás o publicás

Esto ordena muchísimo la cabeza.

---

## Una intuición muy útil

Podés pensarlo así:

- validar temprano
- producir después
- publicar todavía después

Esa secuencia resume un criterio muy sano.

---

## Qué relación tiene esto con confianza del equipo

Muy fuerte.

Cuando el pipeline da feedback temprano,
el equipo gana cosas como:

- más claridad
- menos tiempo perdido
- menos builds largos que terminan fracasando por algo básico
- mejor lectura de qué se rompió realmente

Entonces este tema no es solo “de orden técnico”.
También es de calidad de trabajo.

---

## Ejemplo de preguntas que cada etapa debería responder

Esto es muy útil.

### Etapa temprana
- ¿el proyecto sigue sano?
- ¿los cambios rompieron algo básico?
- ¿vale la pena seguir?

### Etapa posterior
- ¿puedo producir el artefacto?
- ¿tiene sentido instalarlo o publicarlo?
- ¿está listo para circular?

Pensar así te ayuda muchísimo a diseñar mejor.

---

## Ejercicio 3 — escribir preguntas por etapa

Quiero que tomes un pipeline mínimo de dos o tres pasos y le asignes a cada paso una pregunta.

Por ejemplo:

- Paso 1: ¿qué valida?
- Paso 2: ¿qué produce?
- Paso 3: ¿qué habilita?

### Objetivo
Que cada comando deje de ser “un paso técnico” y pase a tener una razón explícita.

---

## Qué no conviene hacer

No conviene:

- poner muy tarde validaciones básicas
- producir artefactos si todavía no sabés si lo fundamental está bien
- mezclar etapas con objetivos distintos sin claridad
- ni pensar que cualquier orden da lo mismo

Entonces aparece una idea importante:

> el orden de un pipeline expresa prioridades de calidad.

Esa frase vale muchísimo.

---

## Qué relación tiene esto con multi-módulo

También importa mucho.

En sistemas multi-módulo,
fallar tarde puede ser todavía más costoso,
porque el build conjunto puede ser más grande y más pesado.

Entonces recibir feedback temprano sobre problemas básicos puede ser todavía más valioso.

Esto hace que el criterio de orden sea incluso más importante cuando el sistema crece.

---

## Qué no conviene olvidar sobre verify

No hace falta volver a ponerlo en el centro,
pero sí recordar que en algunos contextos:

```bash
mvn clean verify
```

puede representar una etapa muy natural de validación más seria.

Lo importante no es meterlo porque sí,
sino entender qué pregunta querés que responda el pipeline en esa fase.

---

## Error común 1 — pensar que mientras el pipeline haga todo, el orden no importa

Sí importa.
Muchísimo.

---

## Error común 2 — producir o publicar demasiado temprano

Eso puede generar ruido y trabajo innecesario.

---

## Error común 3 — no pensar en el costo de cada etapa

Cuanto más tarde detectás algo básico, peor experiencia suele dar el flujo.

---

## Error común 4 — diseñar el pipeline solo desde la herramienta y no desde el tipo de feedback que querés obtener

Esto es muy común y conviene evitarlo.

---

## Qué no conviene olvidar

Este tema no pretende que haya un único orden universal para todos los proyectos.

Lo que sí quiere dejarte es un criterio muy fuerte:

- primero buscá feedback temprano
- después avanzá hacia etapas más finales
- y hacé que cada paso del pipeline tenga una pregunta clara que responder

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Tomá el pipeline mínimo que diseñaste en el tema anterior.

### Ejercicio 2
Revisá si el orden actual te da feedback temprano o demasiado tarde.

### Ejercicio 3
Escribí qué conviene saber primero:
- salud básica del proyecto
- artefacto empaquetado
- instalación
- publicación

### Ejercicio 4
Reordená el pipeline si hace falta.

### Ejercicio 5
Asignale a cada etapa una pregunta explícita que deba responder.

### Ejercicio 6
Escribí con tus palabras por qué el nuevo orden te parece mejor.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué significa feedback temprano en un pipeline Maven?
2. ¿Por qué conviene detectar pronto errores de compilación o de tests?
3. ¿Qué suele tener más sentido primero: validar o empaquetar? ¿Por qué?
4. ¿Por qué `install` y `deploy` suelen quedar después de etapas de validación?
5. ¿Por qué el orden del pipeline forma parte de la calidad del proceso?

---

## Mini desafío

Hacé una práctica conceptual:

1. tomá un pipeline Maven de dos o tres pasos
2. escribí el orden actual
3. escribí qué feedback da cada paso
4. revisá si alguna validación importante quedó demasiado tarde
5. reordenalo si hace falta
6. redactá una nota breve explicando cómo cambió la calidad del flujo al pensar mejor el feedback temprano

Tu objetivo es que el pipeline deje de parecer una lista de comandos y pase a verse como una estrategia intencional para encontrar problemas lo antes posible y avanzar con más confianza.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este quincuagésimo séptimo tema, ya deberías poder:

- entender el valor del feedback temprano en un pipeline Maven
- ordenar mejor etapas de validación y producción
- justificar por qué ciertas fallas conviene detectarlas antes
- diseñar flujos más claros y más útiles para el equipo
- y pensar el pipeline como una estrategia de calidad, no solo como automatización técnica

---

## Resumen del tema

- El orden de las etapas del pipeline importa muchísimo.
- Conviene detectar pronto fallas básicas como compilación o tests rotos.
- Validar temprano suele ser más sano que producir o publicar demasiado pronto.
- Cada etapa debería responder una pregunta clara sobre el estado del proyecto.
- El pipeline no solo automatiza; también organiza el tipo de feedback que recibe el equipo.
- Ya diste otro paso importante hacia un Maven pensado como proceso profesional de validación y confianza.

---

## Próximo tema

En el próximo tema vas a aprender a pensar mejor cuándo conviene usar `verify` dentro de un flujo Maven y qué lugar puede ocupar respecto de `test` y `package`, porque después de ordenar mejor el pipeline por feedback temprano, el siguiente paso natural es afinar una etapa muy propia del lifecycle que suele generar dudas pero puede ser muy valiosa cuando la entendés bien.
