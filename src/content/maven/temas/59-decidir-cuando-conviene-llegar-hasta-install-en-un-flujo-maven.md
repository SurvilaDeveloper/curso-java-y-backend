---
title: "Decidir cuándo conviene llegar hasta install en un flujo Maven"
description: "Quincuagésimo noveno tema práctico del curso de Maven: aprender cuándo tiene sentido que un flujo Maven llegue hasta install, cuándo conviene detenerse antes y cómo pensar la diferencia entre validación del build y circulación local del artefacto."
order: 59
module: "Automatización, CI y flujos profesionales"
level: "intermedio"
draft: false
---

# Decidir cuándo conviene llegar hasta `install` en un flujo Maven

## Objetivo del tema

En este quincuagésimo noveno tema vas a:

- pensar con más criterio cuándo tiene sentido llegar hasta `install`
- distinguir mejor entre validación del build y circulación local del artefacto
- entender por qué no todos los flujos necesitan instalar siempre
- ver cuándo `install` aporta valor real y cuándo agrega ruido
- diseñar pipelines Maven más intencionales y menos automáticos por costumbre

La idea es que dejes de pensar `install` como “el siguiente paso obvio” y empieces a verlo como una decisión de flujo: a veces vale mucho la pena, y a veces conviene detenerse antes.

---

## Lo que ya deberías tener

Antes de empezar este tema, deberías poder:

- usar `test`, `package`, `verify`, `install` y distinguirlos
- entender la diferencia entre build local, repositorio local y publicación remota
- consumir artefactos instalados localmente desde otro proyecto
- diseñar un pipeline Maven mínimo
- pensar en feedback temprano y orden de etapas

Si hiciste los temas anteriores, ya estás listo para este paso.

---

## Idea central del tema

En el tema anterior viste que `verify` puede ser una frontera muy sana entre:

- validación seria del build
y
- circulación posterior del artefacto

Ahora aparece una pregunta muy concreta:

> después de verificar bien el build, ¿siempre conviene llegar hasta `install`?

La respuesta madura es:

> no siempre.

Y justamente entender ese “no siempre” es el corazón del tema.

---

## Qué hace install, otra vez, pero desde el punto de vista del flujo

Ya sabés técnicamente que:

```bash
mvn install
```

- construye lo que haga falta según el lifecycle
- y además deja el artefacto en el repositorio local Maven

Pero ahora conviene mirarlo desde otro ángulo:

> `install` no solo valida o construye; también hace circular el artefacto dentro de tu entorno local Maven.

Esa parte es clave.

---

## Una intuición muy útil

Podés pensarlo así:

- `verify` responde “¿confío razonablemente en este build?”
- `install` agrega “¿quiero que este artefacto quede disponible localmente para otros consumidores Maven?”

Esa diferencia vale muchísimo.

---

## Por qué no siempre conviene llegar hasta install

Porque no todos los flujos necesitan que el artefacto circule localmente.

Por ejemplo, a veces solo querés:

- validar que el proyecto compila
- correr tests
- verificar el build
- producir el artefacto en `target/`

y listo.

Si nadie más dentro del entorno local Maven necesita consumir ese artefacto,
`install` puede no aportar demasiado en ese momento.

Entonces aparece una verdad importante:

> `install` tiene mucho valor cuando existe una necesidad real de consumo local posterior; si no, puede ser una etapa extra sin beneficio claro.

---

## Qué tipo de pregunta te ayuda a decidir

Una muy buena pregunta es esta:

> ¿Después de este flujo, quiero que otro proyecto o módulo separado del sistema actual pueda resolver este artefacto desde el repositorio local?

Si la respuesta es sí,
`install` gana muchísimo sentido.

Si la respuesta es no,
tal vez una etapa como `verify` o `package` ya alcance perfecto.

---

## Escenario A — pipeline de validación pura

Imaginá un flujo cuyo objetivo es responder:

- ¿el proyecto sigue sano?
- ¿los tests importantes pasan?
- ¿el build llega a una validación razonable?

En ese caso, algo como:

```bash
mvn clean verify
```

puede ser una frontera muy buena.

### Qué puede pasar con install acá
Puede ser innecesario,
porque el objetivo del flujo no es dejar un artefacto disponible para consumo local,
sino validar el proyecto.

Entonces aparece una idea importante:

> si el objetivo principal del flujo es confianza y validación, muchas veces `verify` ya expresa muy bien el final natural de ese pipeline.

---

## Escenario B — flujo donde otro proyecto local va a consumir el artefacto

Ahora imaginá esto:

- tenés una librería propia
- otro proyecto local separado la necesita
- querés que quede disponible por coordenadas Maven normales

Acá sí tiene muchísimo sentido llegar hasta:

```bash
mvn clean install
```

porque el valor del flujo no termina en validar el build,
sino en dejar el artefacto listo para consumo local.

Entonces aparece otra verdad importante:

> cuando la utilidad del artefacto empieza justo después del build, `install` deja de ser opcional y pasa a ser parte del propósito del flujo.

---

## Escenario C — multi-módulo dentro de una misma raíz

En un sistema multi-módulo, muchas veces los módulos ya se resuelven como parte del build conjunto desde la raíz.

En ese contexto, puede pasar que para ciertas validaciones o builds de sistema:

- `install` no sea lo más importante
- porque el conjunto ya se coordina internamente

Entonces el valor de `install` puede ser menor que en el caso de proyectos totalmente separados.

No siempre, pero muchas veces sí.

Entonces aparece una idea útil:

> cuanto más vive todo dentro de una misma raíz multi-módulo coordinada, menos urgente suele ser usar `install` como puente entre piezas que ya conviven dentro del mismo flujo.

---

## Primer criterio práctico

Podés usar esta regla:

> si el artefacto necesita circular dentro del repositorio local para ser consumido después, pensá en `install`; si el objetivo es solo validar o construir, pensá primero si `verify` o `package` ya alcanzan.

Esa regla no resuelve todo,
pero orienta muchísimo.

---

## Qué costo tiene instalar “porque sí”

No es que `install` sea malo.
Pero meterlo por inercia puede tener algunos problemas de criterio:

- agrega una acción de circulación local aunque todavía no la necesites
- puede dejar artefactos instalados que nadie usa
- puede hacer menos claro el propósito del flujo
- puede mezclar validación con disponibilidad local sin necesidad

Entonces aparece una verdad importante:

> un flujo más maduro no llega más lejos “por reflejo”, sino por propósito.

Esa frase vale muchísimo.

---

## Una intuición muy útil

Podés pensarlo así:

- `package` produce
- `verify` valida más seriamente
- `install` además pone a circular localmente

Cada etapa agrega algo distinto.
No siempre necesitás todas.

---

## Ejercicio 1 — distinguir valor real de install

Quiero que respondas por escrito:

1. ¿Qué agrega `install` respecto de `verify`?
2. ¿En qué tipo de proyecto o flujo eso tiene valor real?
3. ¿En qué tipo de flujo podría no aportar demasiado?

### Objetivo
Que `install` deje de ser una fase “obvia” y pase a ser una decisión con contexto.

---

## Qué relación tiene esto con CI

Muy fuerte.

En un flujo automatizado de CI,
muchas veces el objetivo principal es:

- validar
- verificar
- construir

No siempre:
- instalar localmente
- ni mucho menos publicar remotamente

Entonces en muchos pipelines de CI iniciales o intermedios,
cerrar en:

```bash
mvn clean verify
```

puede tener muchísimo sentido.

Mientras que `install` puede reservarse para otros contextos o etapas.

Entonces aparece otra idea importante:

> en CI, llegar hasta `install` tiene sentido cuando realmente necesitás esa disponibilidad local dentro del entorno del pipeline o del flujo posterior; si no, no siempre hace falta.

---

## Qué relación tiene esto con productores y consumidores locales

Cuando productor y consumidor son proyectos separados en tu entorno local,
`install` tiene muchísimo más peso.

Porque justamente vuelve al artefacto resoluble por otro proyecto.

Este es uno de los casos donde más claramente se justifica.

Entonces este tema te ayuda a conectar contexto con herramienta:
- proyecto aislado que quiere validación
vs
- librería local que otro proyecto quiere usar

No es la misma necesidad.

---

## Ejercicio 2 — pensar desde el consumidor

Respondé esta pregunta:

> Si ningún otro proyecto va a consumir el artefacto desde el repositorio local, ¿qué valor extra te da realmente `install` en este flujo?

### Objetivo
Separar claramente “circulación local” de “simple validación”.

---

## Qué relación tiene esto con deploy

Muy buena para reforzar el mapa.

Si ya viste que `verify` puede ser una frontera sana antes de `install`,
también podés ver que `install` puede ser una frontera sana antes de `deploy`.

O sea:

- `verify` valida seriamente
- `install` hace circular localmente
- `deploy` hace circular remotamente

Entonces el flujo va ganando niveles de alcance.

Eso te ayuda muchísimo a decidir hasta dónde querés llegar en cada contexto.

---

## Una intuición muy útil

Podés pensarlo así:

> cada fase más “lejana” del lifecycle no solo hace más cosas; también amplía el alcance del artefacto.

Esa frase vale muchísimo.

---

## Cuándo sí suele tener bastante sentido llegar hasta install

En esta etapa del curso, una respuesta bastante sana sería:

- cuando querés probar consumo local desde otro proyecto
- cuando trabajás con librerías propias fuera de una misma raíz multi-módulo
- cuando el repositorio local es parte real del flujo
- cuando el artefacto necesita quedar listo para otro build local posterior

En esos casos, `install` no es un lujo.
Es parte del propósito del flujo.

---

## Cuándo puede ser mejor detenerse antes

También conviene decirlo muy claro.

Muchas veces tiene sentido detenerse antes cuando:

- solo querés validar el proyecto
- querés feedback temprano y serio
- no necesitás que el artefacto quede disponible para otros consumidores locales
- el build multi-módulo ya resolvió internamente sus relaciones
- el objetivo del pipeline no es todavía circulación del artefacto

En esos casos, `verify` puede ser un final excelente.

---

## Ejercicio 3 — decidir tu frontera actual

Quiero que tomes uno de tus proyectos o sistemas y respondas:

> Hoy, para este caso concreto, ¿tu frontera natural de pipeline debería ser `verify` o `install`? ¿Por qué?

### Objetivo
Que empieces a tomar esta decisión en proyectos reales y no solo en teoría.

---

## Qué no conviene hacer

No conviene:

- llegar hasta `install` por reflejo si nadie va a consumir el artefacto localmente
- ni detenerte siempre en `verify` si el valor real del flujo empieza con un consumo local posterior
- ni pensar que una misma respuesta sirve para todos los proyectos
- ni mezclar validación seria con circulación local sin saber por qué

Entonces aparece una verdad importante:

> decidir hasta dónde llega el pipeline es parte del diseño del flujo, no un detalle menor.

---

## Error común 1 — pensar que install siempre es “mejor” que verify porque llega más lejos

No.
Llega más lejos,
pero eso no significa que siempre aporte más valor en ese contexto.

---

## Error común 2 — pensar que verify siempre alcanza

Tampoco.
Si el artefacto tiene que ser consumido localmente después,
`install` puede ser exactamente lo que falta.

---

## Error común 3 — no distinguir entre proyecto aislado, proyectos separados y multi-módulo

Ese contexto cambia muchísimo la decisión.

---

## Error común 4 — diseñar el pipeline por costumbre y no por el destino real del artefacto

Esto es muy común y conviene evitarlo.

---

## Qué no conviene olvidar

Este tema no pretende darte una receta universal.
Siempre va a haber matices.

Lo que sí quiere dejarte es una brújula muy fuerte:

- si querés validación seria, `verify` suele tener mucho sentido
- si además querés circulación local real del artefacto, `install` puede ser la frontera correcta
- elegir bien depende del propósito del flujo y del tipo de consumidor que existe después

Eso ya es muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas esto sí o sí:

### Ejercicio 1
Tomá un proyecto o sistema Maven actual.

### Ejercicio 2
Escribí qué objetivo tendría tu pipeline en ese caso:
- validar
- producir
- dejar disponible localmente
- o varias de esas cosas

### Ejercicio 3
Respondé si tu frontera natural debería ser:
- `verify`
- o `install`

### Ejercicio 4
Justificá por qué.

### Ejercicio 5
Escribí qué consumidor real existiría después del pipeline:
- ninguno
- otro proyecto local
- módulos ya coordinados
- u otro caso

### Ejercicio 6
Explicá con tus palabras por qué esa respuesta cambia el valor de `install`.

---

## Ejercicio escrito

Respondé con tus palabras:

1. ¿Qué agrega `install` respecto de `verify`?
2. ¿Cuándo tiene mucho sentido llegar hasta `install`?
3. ¿Cuándo puede ser mejor detenerse antes?
4. ¿Por qué multi-módulo y proyectos separados pueden llevar a decisiones distintas?
5. ¿Por qué llegar más lejos en el lifecycle no siempre significa tomar una mejor decisión?

---

## Mini desafío

Hacé una práctica conceptual:

1. imaginá tres casos:
   - proyecto individual que solo querés validar
   - librería que otro proyecto local va a consumir
   - sistema multi-módulo coordinado desde una raíz
2. decidí en cada uno si la frontera natural sería `verify` o `install`
3. justificá por qué
4. escribí una nota breve explicando cómo este tema te ayudó a dejar de ver `install` como un paso automático y a empezar a verlo como una decisión de flujo

Tu objetivo es que el lifecycle deje de parecer una escalera que siempre hay que subir completa y pase a verse como un conjunto de fronteras posibles según el propósito real del build.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este quincuagésimo noveno tema, ya deberías poder:

- decidir mejor cuándo tiene sentido llegar hasta `install`
- distinguir con más claridad validación seria y circulación local
- entender por qué no todos los pipelines necesitan instalar
- reconocer cuándo `install` sí agrega valor real
- y diseñar flujos Maven mucho más intencionales y profesionales

---

## Resumen del tema

- `verify` y `install` no compiten siempre; responden a necesidades distintas.
- `verify` suele ser una gran frontera de validación seria.
- `install` agrega circulación local del artefacto.
- Llegar hasta `install` tiene mucho sentido cuando otro consumidor local realmente lo necesita.
- No siempre conviene avanzar más en el lifecycle si el flujo ya cumplió su propósito.
- Ya diste otro paso importante hacia un Maven pensado con criterio de flujo y no solo de comando.

---

## Próximo tema

En el próximo tema vas a aprender a pensar mejor cuándo recién ahí conviene hablar de `deploy` en un flujo automatizado y por qué no siempre tiene sentido incluir publicación remota en cada pipeline, porque después de afinar la frontera entre validación e instalación local, el siguiente paso natural es hacer lo mismo con la frontera entre instalación local y publicación remota.
