---
title: "Diseñar un pipeline Maven mínimo de validación y empaquetado"
description: "Quincuagésimo sexto tema práctico del curso de Maven: aprender a diseñar un pipeline Maven mínimo para validación y empaquetado, elegir comandos razonables por etapa y entender cómo convertir el build en un flujo automático claro y profesional."
order: 56
module: "Automatización, CI y flujos profesionales"
level: "intermedio"
draft: false
---

# Diseñar un pipeline Maven mínimo de validación y empaquetado

## Objetivo del tema

En este quincuagésimo sexto tema vas a:

- diseñar un pipeline Maven mínimo y razonable
- distinguir etapas de validación y empaquetado
- elegir comandos Maven adecuados para cada etapa
- pensar el build como un flujo y no solo como una ejecución aislada
- empezar a convertir tus proyectos en algo más listo para automatización real

La idea es que bajes la noción general de CI a una práctica concreta: definir qué pasos automáticos tendría sentido correr primero en un proyecto Maven antes de pensar en pipelines más grandes o sofisticados.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- usar `clean`, `compile`, `test`, `package`, `install` y entender `deploy`
- distinguir entre validación, construcción e instalación
- entender el rol de Maven en CI
- leer el build como algo repetible y automatizable
- tener una base clara de artefactos, tests y flujo Maven

Si hiciste el tema anterior, ya estás listo para este paso.

---

## Idea central del tema

En el tema anterior viste que Maven encaja muy bien dentro de CI porque ofrece comandos claros, repetibles y bastante expresivos para validar y construir proyectos.

Ahora vas a dar el siguiente paso lógico:

> dejar de pensar “qué comando puedo correr” y empezar a pensar “qué secuencia de pasos automáticos tiene sentido para este proyecto”.

Eso ya es diseñar un pipeline, aunque sea uno mínimo.

---

## Qué significa “pipeline mínimo” en este contexto

No significa una solución gigante ni una herramienta específica.
Significa algo mucho más simple y muy útil:

- definir pocas etapas
- que tengan un propósito claro
- que se apoyen en Maven
- y que representen un flujo razonable de validación y construcción

Dicho simple:

> un pipeline mínimo es una secuencia pequeña pero bien pensada de pasos automáticos que te da confianza sobre el estado del proyecto.

---

## Una intuición muy útil

Podés pensarlo así:

- un comando Maven aislado resuelve una necesidad puntual
- un pipeline ordena varias necesidades en una secuencia con sentido

Esa frase vale muchísimo.

---

## Qué etapas mínimas suelen tener mucho sentido

En una primera aproximación, muchas veces un pipeline Maven mínimo puede pensarse así:

1. limpiar estado previo
2. validar que el proyecto compile y pase tests
3. generar el artefacto

Eso ya te da una base muy sólida sin complicarte demasiado.

---

## Primer pipeline conceptual mínimo

Una versión muy razonable podría verse así:

### Etapa 1 — validación
```bash
mvn clean test
```

### Etapa 2 — empaquetado
```bash
mvn clean package
```

## Qué rol tiene cada una

### `clean test`
Te ayuda a responder:
- ¿el proyecto compila?
- ¿los tests pasan?
- ¿el build mínimo es sano desde un estado limpio?

### `clean package`
Te ayuda a responder:
- ¿además de validar, puedo producir el artefacto final?

Esta dupla ya es una base muy útil para muchísimos proyectos.

---

## Qué ventaja tiene separar validación y empaquetado

Muchísima.

Porque no siempre querés tratar todo como una sola masa.

Separar etapas te permite pensar mejor:

- qué estás comprobando
- en qué punto debería fallar el flujo
- qué parte del proyecto quedó validada
- y cuándo tiene sentido avanzar al siguiente paso

Entonces aparece una idea muy importante:

> un pipeline sano no solo corre cosas; también separa responsabilidades entre etapas.

Esa idea vale muchísimo.

---

## Por qué clean sigue apareciendo tanto

Porque en automatización y validación profesional suele ser muy valioso arrancar desde un estado limpio.

Por ejemplo:

```bash
mvn clean test
```

te ayuda a evitar que un resultado previo en `target/` te dé una falsa sensación de seguridad.

Entonces aparece una verdad importante:

> `clean` no es solo prolijidad; en pipelines suele ser una forma de volver más confiable la validación.

---

## Qué podría pasar si no separás etapas

Si todo queda comprimido en una sola idea difusa,
podrías perder claridad sobre cosas como:

- si el problema fue de compilación o de test
- si el artefacto ni siquiera llegó a generarse
- si el proyecto estaba validado antes de empaquetar
- qué parte convendría detener o revisar primero

Por eso, aunque el pipeline sea mínimo,
conviene que tenga intención.

---

## Ejemplo práctico de proyecto pequeño

Imaginá una app sencilla con algunos tests.

Un pipeline mínimo muy razonable podría ser:

1. `mvn clean test`
2. `mvn clean package`

### Por qué
- primero te asegurás de que el proyecto está sano
- después verificás que además puede producir el `.jar`

No hace falta meter `install` todavía si no lo necesitás.
Y no hace falta pensar en `deploy` si todavía no estás en publicación remota.

---

## Ejercicio 1 — diseñar tu pipeline mínimo

Quiero que tomes uno de tus proyectos actuales y respondas:

- ¿qué comando usarías para validarlo?
- ¿qué comando usarías para generar el artefacto?
- ¿qué parte debería fallar primero si algo está mal?
- ¿qué paso no pondrías todavía porque sería prematuro?

### Objetivo
Que empieces a diseñar el flujo según el proyecto y no solo por costumbre.

---

## Qué relación tiene esto con la madurez del proyecto

Muy fuerte.

En proyectos más chicos,
tal vez un pipeline mínimo alcanza perfecto.

En proyectos más grandes,
más adelante podrías sumar cosas como:

- `verify`
- empaquetado más específico
- publicación
- checks extra
- separación de etapas más fina

Pero no conviene arrancar con una máquina gigantesca si todavía no hace falta.

Entonces aparece otra idea importante:

> un buen pipeline no empieza siendo enorme; empieza siendo razonable y crece cuando el proyecto realmente lo necesita.

Esa frase vale muchísimo.

---

## Qué diferencia hay entre test y package como etapas

Conviene dejarlo muy claro.

### Etapa de test
Está más orientada a confianza y validación del proyecto.

### Etapa de package
Está más orientada a producir la salida consumible del build.

Entonces, aunque ambas usen Maven,
cumplen papeles distintos dentro del flujo.

---

## Una intuición muy útil

Podés pensarlo así:

- `test` responde “¿está sano?”
- `package` responde “¿puedo producirlo?”

Esa frase resume muchísimo.

---

## Qué rol puede tener verify más adelante

No hace falta que hoy lo pongas como centro del tema,
pero sí conviene mencionarlo:
en algunos proyectos un pipeline mínimo más serio podría usar también:

```bash
mvn clean verify
```

porque `verify` representa una etapa muy natural de validación más completa dentro del lifecycle.

No hace falta que hoy compliques todo con eso si tu proyecto todavía está en una etapa simple.
Lo importante es que sepas que esa posibilidad existe y puede crecer naturalmente después.

---

## Ejercicio 2 — comparar clean test vs clean package

Quiero que respondas por escrito:

1. ¿Qué te da `mvn clean test` que todavía no te da `mvn clean package` como enfoque mental?
2. ¿Qué agrega `mvn clean package`?
3. ¿Por qué tiene sentido pensar ambas como etapas distintas aunque ambas formen parte del build?

### Objetivo
Separar mentalmente validación y producción de artefacto.

---

## Qué relación tiene esto con multi-módulo

Muy fuerte.

En un sistema multi-módulo,
un pipeline mínimo también puede pensarse desde la raíz.

Por ejemplo:

```bash
mvn clean test
```

desde la raíz ya puede validar el sistema como conjunto.

Y luego:

```bash
mvn clean package
```

puede producir artefactos del sistema.

Entonces la misma lógica escala bastante bien.

---

## Qué relación tiene esto con install

`install` puede tener sentido en ciertos flujos,
pero no siempre debería estar en el pipeline mínimo.

¿Por qué?

Porque muchas veces primero querés:

- validar
- construir
- recién después pensar si querés publicar localmente el artefacto

Entonces aparece una idea importante:

> `install` puede ser una etapa posterior o contextual, pero muchas veces no hace falta meterlo en el pipeline mínimo inicial si el objetivo principal es validar y empaquetar.

Eso te ayuda a no sobredimensionar el flujo.

---

## Qué relación tiene esto con deploy

Lo mismo, pero todavía más fuerte.

`deploy` suele pertenecer a un momento más avanzado del pipeline,
cuando ya tenés:

- validación
- artefacto construido
- criterio de publicación
- destino remoto
- y contexto adecuado

No conviene meter `deploy` “porque sí” en un pipeline mínimo si todavía no corresponde.

---

## Ejercicio 3 — decidir qué NO meter todavía

Quiero que escribas:

> ¿Qué comando Maven no incluirías todavía en tu pipeline mínimo y por qué?

Puede ser:
- `install`
- `deploy`
- otro paso más grande

### Objetivo
Entender que diseñar un pipeline también implica saber qué dejar afuera al principio.

---

## Qué no conviene hacer

No conviene:

- meter demasiadas etapas desde el día uno
- usar `deploy` por reflejo sin necesidad real
- mezclar validación y publicación como si fueran lo mismo
- ni dejar el pipeline tan mínimo que no valide nada útil

Entonces aparece una verdad importante:

> un pipeline mínimo bien diseñado encuentra un equilibrio: valida bastante, construye algo útil y evita complejidad innecesaria.

---

## Error común 1 — creer que un solo comando gigante siempre resuelve mejor todo

No necesariamente.
A veces separar da más claridad y mejor lectura del flujo.

---

## Error común 2 — pensar que el pipeline mínimo tiene que llegar hasta publicación

No.
Depende del contexto.
Muchas veces todavía no hace falta.

---

## Error común 3 — diseñar el pipeline según costumbre y no según lo que el proyecto necesita validar

Esto es muy común y conviene evitarlo.

---

## Error común 4 — olvidar que las etapas del pipeline representan decisiones de confianza

Cada paso responde una pregunta distinta sobre el proyecto.
Eso conviene sentirlo.

---

## Qué no conviene olvidar

Este tema no pretende que hoy ya armes un pipeline gigante ni que uses una plataforma concreta.

Lo que sí quiere dejarte es una base muy sólida:

- un pipeline mínimo puede ser pequeño
- pero tiene que tener intención
- conviene separar validación y empaquetado
- y Maven ofrece comandos muy buenos para representar esas etapas

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Tomá uno de tus proyectos Maven.

### Ejercicio 2
Diseñá un pipeline mínimo con dos etapas:
- validación
- empaquetado

### Ejercicio 3
Elegí un comando Maven para cada una.

### Ejercicio 4
Explicá qué pregunta responde cada etapa.

### Ejercicio 5
Explicá qué comando dejarías afuera por ahora y por qué.

### Ejercicio 6
Escribí con tus palabras por qué este pipeline ya sería útil aunque todavía no tenga publicación.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué es un pipeline Maven mínimo?
2. ¿Por qué tiene sentido separar validación y empaquetado?
3. ¿Qué rol puede cumplir `mvn clean test`?
4. ¿Qué rol puede cumplir `mvn clean package`?
5. ¿Por qué no siempre conviene meter `install` o `deploy` desde el primer diseño del pipeline?

---

## Mini desafío

Hacé una práctica conceptual:

1. elegí un proyecto Maven tuyo
2. diseñá un pipeline mínimo de dos o tres pasos
3. escribí el comando Maven de cada paso
4. explicá qué valida o produce cada uno
5. escribí una nota breve explicando por qué ese flujo es razonable para el estado actual del proyecto y qué podrías agregar más adelante si el proyecto creciera

Tu objetivo es que Maven deje de sentirse como una colección de comandos sueltos y pase a verse como un lenguaje de etapas para diseñar un flujo automático claro y profesional.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este quincuagésimo sexto tema, ya deberías poder:

- diseñar un pipeline Maven mínimo de validación y empaquetado
- distinguir mejor etapas del flujo
- elegir comandos razonables según el objetivo
- evitar meter complejidad innecesaria demasiado pronto
- y pensar el build Maven con una lógica mucho más profesional y orientada a automatización

---

## Resumen del tema

- Un pipeline mínimo no tiene que ser enorme, pero sí tener intención clara.
- Separar validación y empaquetado suele dar un flujo mucho más legible.
- `mvn clean test` y `mvn clean package` suelen ser una muy buena base.
- No siempre conviene meter `install` o `deploy` desde el principio.
- Diseñar el pipeline implica decidir qué validar, qué producir y qué dejar para más adelante.
- Ya diste otro paso importante hacia un Maven pensado como flujo automático y no solo como ejecución manual.

---

## Próximo tema

En el próximo tema vas a aprender a pensar mejor el lugar de tests, fallas y feedback temprano dentro de un pipeline Maven, porque después de diseñar un flujo mínimo, el siguiente paso natural es entender por qué ciertas etapas conviene ubicarlas antes que otras y cómo eso mejora muchísimo la calidad del proceso.
