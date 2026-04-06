---
title: "SAXParserFactory y XMLInputFactory: paralelos importantes"
description: "Cómo pensar SAXParserFactory y XMLInputFactory frente a XXE en aplicaciones Java con Spring Boot. Qué paralelos comparten con DocumentBuilderFactory y por qué usar SAX o StAX no reemplaza el endurecimiento explícito del parser."
order: 167
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# SAXParserFactory y XMLInputFactory: paralelos importantes

## Objetivo del tema

Entender por qué **`SAXParserFactory`** y **`XMLInputFactory`** importan tanto frente a **XXE** en aplicaciones Java + Spring Boot, y qué paralelos comparten con **`DocumentBuilderFactory`**.

La idea de este tema es continuar el razonamiento del tema anterior.

Ya vimos que, en DOM, una gran parte de la postura de seguridad se juega en:

- cómo se crea la factory
- qué capacidades se deshabilitan
- qué defaults se aceptan o se cuestionan
- y cuánto trabajo “extra” se le deja hacer al parser antes de entregarte el resultado

Ahora toca ver el paralelo natural en los otros modelos más comunes del ecosistema Java:

- **SAX**, con `SAXParserFactory`
- **StAX**, con `XMLInputFactory`

Esto importa porque mucha gente hace algo como:

- “nosotros no usamos DOM”
- “nosotros usamos SAX”
- “nosotros leemos por stream con StAX”
- “acá no construimos el árbol entero, así que debería ser más seguro”

Y ahí aparece una falsa sensación de cierre.

En resumen:

> cambiar de DOM a SAX o StAX cambia cómo consumís el XML,  
> pero no elimina por sí mismo la necesidad de endurecer la factory y controlar qué capacidades XML siguen activas durante el parseo.

---

## Idea clave

La idea central de este tema es esta:

> `SAXParserFactory` y `XMLInputFactory` cumplen, en sus respectivos modelos, un rol muy parecido al que cumple `DocumentBuilderFactory` en DOM: son puntos donde se define una parte importante del comportamiento de seguridad del parser.

Eso significa que, aunque cambie la API de consumo, siguen existiendo preguntas como:

- ¿se permite DTD?
- ¿se permiten entidades externas?
- ¿se resuelven recursos externos?
- ¿qué parser real hay debajo?
- ¿qué defaults trae?
- ¿qué capacidades quedaron activas sin que el flujo las necesite?

### Idea importante

El error de seguridad no desaparece porque el código lea XML “por eventos” o “por stream”.
Desaparece cuando el parser deja de tener capacidades que sobran para ese caso de uso.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- asumir que SAX o StAX vuelven irrelevante a XXE
- revisar solo DOM y olvidarse del resto del stack XML
- no auditar factories distintas con el mismo rigor
- creer que streaming equivale automáticamente a hardening
- no ver que distintas APIs siguen necesitando controles análogos sobre DTD y resolución externa

Es decir:

> el problema no es usar SAX o StAX.  
> El problema es tratarlos como si por diseño ya vinieran inmunes a una clase de riesgo que, en realidad, depende de qué capacidades XML siguen vivas debajo.

---

## Error mental clásico

Un error muy común es este:

### “Como acá usamos SAX/StAX y no construimos un DOM completo, XXE ya no debería ser un tema tan fuerte”

Eso puede dar tranquilidad rápida, pero es conceptualmente flojo.

Porque una cosa es:

- cómo tu código consume el XML

y otra muy distinta es:

- qué parser lo interpretó
- qué capacidades se mantuvieron activas
- qué se resolvió antes o durante el flujo
- y qué entorno vio ese proceso mientras parseaba

### Idea importante

El modelo de consumo no reemplaza la configuración segura del parser.

---

# Parte 1: El paralelo conceptual con `DocumentBuilderFactory`

## La idea más importante del tema

Conviene salir de acá con una relación muy clara:

- **DOM** → `DocumentBuilderFactory`
- **SAX** → `SAXParserFactory`
- **StAX** → `XMLInputFactory`

No porque sean APIs idénticas.
Sino porque, en todos los casos, ahí aparece un punto donde decidís:

- cómo se crea el parser
- qué capacidades XML siguen activas
- qué se rechaza
- y qué libertades del formato se recortan o se dejan pasar

### Regla sana

Cuando audites XML en Java, no pienses:
- “qué API usa mi código final”

Pensá:
- “¿qué factory creó la superficie XML real que está procesando este input?”

### Idea importante

La factory es el punto donde el parseo deja de ser un detalle de implementación y se vuelve una decisión de seguridad.

---

# Parte 2: `SAXParserFactory` — por qué importa

## Qué hace, a nivel intuitivo

A nivel conceptual, `SAXParserFactory` existe para crear parsers SAX, es decir, parsers que van recorriendo el documento y emitiendo eventos a medida que avanzan.

Eso hace que el código de consumo se vea muy distinto de DOM:

- no navega un árbol ya armado
- recibe eventos
- procesa tags y contenido a medida que aparecen
- parece más incremental y más controlado

### Problema

Ese estilo más “streaming” o “event-driven” no elimina por sí mismo la pregunta crítica:
- **¿qué libertades XML tuvo el parser mientras producía esos eventos?**

### Idea importante

`SAXParserFactory` importa porque es uno de los lugares donde se decide si el flujo SAX viene de un parser endurecido o de uno demasiado permisivo.

---

## Por qué SAX puede engañar a nivel seguridad

SAX suele dar sensación de ligereza y control porque el código se ve muy procedural:

- empieza el documento
- arranca un elemento
- aparece texto
- termina un elemento

Eso puede hacer pensar:
- “acá no hay mucha magia, solo eventos”

Pero el hecho de que tu código consuma eventos no significa que el parser no haya tenido, antes o durante ese proceso, capacidades para:

- aceptar DTD
- interpretar entidades
- resolver recursos externos
- o expandir más de la cuenta

### Regla sana

No audites SAX solo desde el handler de eventos.
Auditá cómo se creó y configuró el parser que alimenta esos eventos.

---

# Parte 3: `XMLInputFactory` — por qué importa

## Qué hace, a nivel intuitivo

`XMLInputFactory` aparece del lado de **StAX**, que suele sentirse incluso más explícito que SAX porque el consumidor del stream controla bastante el ritmo en que va leyendo el XML.

Eso puede reforzar una idea como:
- “acá sí que el control está en mi código”

### Problema

Otra vez, una cosa es el modelo de lectura.
Otra es qué libertades XML quedaron activas en la capa que construyó ese `XMLStreamReader` o esa secuencia de eventos.

### Idea importante

`XMLInputFactory` importa porque ahí también se define cuánto del poder del formato XML seguís dejando disponible, aunque luego el código consuma el stream de forma muy ordenada.

---

## Por qué StAX también puede dar falsa sensación de seguridad

Como el consumo se siente “pull-based” y muy explícito, mucha gente asocia StAX con:

- modernidad
- mayor control
- menos magia
- menos superficie

Pero desde XXE la pregunta sigue siendo la misma:

- ¿qué features XML estaban activas?
- ¿DTD sigue permitida?
- ¿hay resolución de entidades externas?
- ¿se consulta algo fuera del documento base?
- ¿el parser podría interactuar con recursos que el flujo no necesita?

### Regla sana

No dejes que la ergonomía del stream tape la configuración real de seguridad.

---

# Parte 4: Mismo problema, distinta puerta de entrada

Una buena forma de pensar este tema es esta:

### Con DOM
la puerta principal es `DocumentBuilderFactory`.

### Con SAX
la puerta principal es `SAXParserFactory`.

### Con StAX
la puerta principal es `XMLInputFactory`.

### Idea importante

Cambian las clases.
No cambia la necesidad de preguntarte:
- qué está habilitado
- qué sobra
- y qué parte del entorno queda al alcance del parser si algo no está endurecido.

---

# Parte 5: Qué familias de controles siguen importando igual

Sin meternos todavía en detalle fino de APIs, conviene ver que las familias de preocupación siguen siendo parecidas:

## A. DTD
¿se acepta o no se acepta?

## B. Entidades externas
¿se permiten o no?

## C. Resolución de recursos externos
¿el parser podría ir a buscar algo fuera del documento?

## D. Expansión o comportamiento que el caso de uso no necesita
¿hay más capacidad viva de la necesaria?

### Idea útil

Aunque la forma exacta de configurar cambie entre factories, la lógica defensiva que estás buscando sigue siendo muy parecida.

### Regla sana

No memorices nombres aislados.
Entendé qué clase de capacidad querés apagar.

---

# Parte 6: Por qué las librerías de terceros complican esto

En Java, no siempre creás estas factories “a mano” en el código más visible.
Muchas veces aparecen a través de:

- librerías
- frameworks
- adapters
- toolkits empresariales
- módulos de seguridad
- parsers encapsulados
- convertidores o importadores documentales

### Problema

El equipo puede saber que consume:

- eventos SAX
- un `Document`
- un stream StAX

pero no tener claro:
- quién creó la factory
- con qué flags
- y con qué defaults

### Idea importante

Para auditar XXE de verdad, a veces tenés que mirar una capa antes de la que tu código usa directamente.

---

# Parte 7: La diferencia entre “modelo de API” y “postura de seguridad”

Este es probablemente el concepto más importante del tema.

Una cosa es:
- **el modelo de API**
  - DOM
  - SAX
  - StAX

Otra cosa es:
- **la postura de seguridad del parser**
  - DTD sí/no
  - entidades externas sí/no
  - resolución externa sí/no
  - expansión sí/no
  - recursos permitidos sí/no

### Regla sana

Nunca confundas esas dos cosas.

### Idea importante

Un equipo puede elegir SAX por performance, StAX por ergonomía o DOM por simplicidad.
Nada de eso decide automáticamente la postura frente a XXE.

---

# Parte 8: Qué cambia en revisión según la API

Este tema también ayuda a revisar mejor.

## Si ves DOM
tu atención va rápido a:
- `DocumentBuilderFactory`
- `DocumentBuilder`
- construcción del árbol

## Si ves SAX
tu atención va a:
- `SAXParserFactory`
- parser
- handlers
- features activas antes del stream de eventos

## Si ves StAX
tu atención va a:
- `XMLInputFactory`
- creación del reader
- capacidades XML activas antes del consumo del stream

### Idea útil

Cada API cambia dónde queda visible el parseo, pero no elimina la necesidad de auditar cómo se creó.

---

# Parte 9: El runtime sigue siendo decisivo

Igual que en los temas anteriores, no alcanza con mirar la factory sola.
Siempre importa también:

- quién controla el XML
- qué proceso lo parsea
- qué filesystem ve
- qué red ve
- qué servicios internos alcanza
- qué identidad usa ese proceso
- qué se hace con el resultado del parseo

### Idea importante

Una `SAXParserFactory` o `XMLInputFactory` mal endurecida no existe en el vacío.
Su gravedad depende del entorno que la rodea.

---

# Parte 10: Qué NO conviene concluir

Este tema no busca dejar frases como:

- “SAX es peor”
- “StAX es mejor”
- “DOM es el único peligroso”
- “streaming evita XXE”
- “si no hay árbol completo, no hay riesgo”

Todo eso sería demasiado simplista.

### Regla sana

La conclusión correcta es otra:
- **en los tres modelos, la factory importa y la configuración importa**

### Idea importante

La API elegida cambia el estilo de trabajo.
La superficie XXE sigue dependiendo del parser efectivo y de las capacidades activas.

---

# Parte 11: Qué preguntas conviene hacer sobre `SAXParserFactory`

Cuando veas `SAXParserFactory`, conviene preguntar:

- ¿está configurada explícitamente?
- ¿qué capacidades XML quedaron activas?
- ¿se acepta DTD?
- ¿se permiten entidades externas?
- ¿qué parser real hay debajo?
- ¿qué librería la envuelve?
- ¿qué proceso ejecuta ese parseo?
- ¿qué podría tocar ese proceso si la configuración quedara abierta?

### Idea importante

Si no podés responder eso, el hecho de que “sea SAX” no te dice casi nada útil sobre la seguridad real.

---

# Parte 12: Qué preguntas conviene hacer sobre `XMLInputFactory`

Cuando veas `XMLInputFactory`, conviene preguntar:

- ¿cómo se crea?
- ¿qué flags o propiedades se configuran?
- ¿DTD sigue habilitada?
- ¿hay soporte o resolución de entidades externas?
- ¿qué reader o stream se expone al código superior?
- ¿qué parser real opera debajo?
- ¿quién controla el XML?
- ¿qué runtime lo procesa?

### Regla sana

Con StAX, la falsa sensación de control puede ser más alta.
Por eso conviene ser especialmente explícito revisando la factory.

---

# Parte 13: Cómo reconocer esta superficie en una codebase Spring

En una app Spring o Java, conviene sospechar especialmente cuando veas:

- `SAXParserFactory.newInstance()`
- `XMLInputFactory.newFactory()` o equivalentes
- factories creadas sin configuración visible
- handlers SAX o readers StAX que parecen limpios, pero no muestran cómo se creó el parser
- librerías de terceros que entregan eventos o readers XML sin dejar clara la configuración
- workers o procesos con acceso a red o filesystem parseando XML no confiable

### Idea útil

En revisión real, muchas veces el punto débil no está en el handler o en el loop que consume el stream, sino en la factory unas líneas —o unas capas— más arriba.

---

## Qué revisar en una app Spring

Cuando revises `SAXParserFactory` y `XMLInputFactory` en una aplicación Spring, mirá especialmente:

- dónde se crean
- si se configuran explícitamente
- si el equipo sabe qué capacidades XML siguen activas
- si hay defaults heredados
- si el parser está encapsulado en una librería de terceros
- qué proceso hace el parseo
- qué filesystem o red ve ese proceso
- qué impacto tendría que la configuración fuera demasiado permisiva

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- factories explícitamente endurecidas
- claridad sobre qué modelo usa cada flujo
- comprensión del equipo sobre que DOM, SAX y StAX no eliminan XXE por nombre
- poca dependencia en defaults
- revisión del runtime además del parser
- menos parsers ocultos detrás de capas que nadie audita

### Idea importante

La madurez acá se nota cuando el equipo sabe que cambiar de API no sustituye el endurecimiento del parseo.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “como usamos SAX/StAX, ya no hace falta mirar XXE”
- factory sin configuración visible
- nadie sabe si hay DTD o entidades externas activas
- el parser real está escondido en otra capa
- el equipo confunde estilo streaming con postura segura
- el runtime que procesa XML ve demasiado filesystem o demasiada red
- la review se concentra en el handler y no en cómo se creó el parser

### Regla sana

Si la conversación sobre XML se queda solo en cómo se consume el stream y no en qué libertades tuvo el parser para producirlo, todavía no llegaste al corazón del problema.

---

## Checklist práctica

Cuando revises SAX o StAX en Java/Spring, preguntate:

- ¿usa `SAXParserFactory` o `XMLInputFactory`?
- ¿la factory está configurada explícitamente?
- ¿qué capacidades XML siguen activas?
- ¿el equipo sabe qué parser real hay debajo?
- ¿hay DTD o entidades externas permitidas?
- ¿quién controla el XML?
- ¿qué proceso lo parsea y qué puede ver?

---

## Mini ejercicio de reflexión

Tomá un flujo XML de tu app Spring y respondé:

1. ¿Usa SAX o StAX?
2. ¿Dónde se crea la factory?
3. ¿Está endurecida de forma explícita?
4. ¿El equipo conoce el parser real que opera debajo?
5. ¿Qué sensación de “control” da la API elegida?
6. ¿Qué runtime ejecuta el parseo?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

`SAXParserFactory` y `XMLInputFactory` importan porque cumplen, en sus respectivos modelos, un rol muy parecido al de `DocumentBuilderFactory` en DOM: son puntos donde se define gran parte de la superficie de seguridad del parseo XML.

Eso significa que, aunque cambie la forma de consumir el XML:

- DOM con árbol
- SAX con eventos
- StAX con stream controlado

siguen importando muchísimo preguntas como:

- si se acepta DTD
- si se permiten entidades externas
- si se resuelven recursos externos
- qué parser hay debajo
- y qué entorno ve el proceso que hace el parseo

En resumen:

> un backend más maduro no deja que DOM, SAX o StAX se conviertan en etiquetas tranquilizadoras, como si el simple hecho de elegir una API distinta ya resolviera la superficie XXE.  
> También revisa las factories concretas y sus capacidades activas, porque entiende que la diferencia verdadera entre un parseo razonablemente seguro y uno demasiado permisivo no está en si el resultado llega como árbol, evento o stream, sino en si el parser tuvo permiso para interpretar, expandir o resolver más de lo que el caso de uso necesitaba mientras producía esa representación.

---

## Próximo tema

**EntityResolver y XMLResolver: cuándo ayudan y cuándo confunden**
