---
title: "Por qué DOM, SAX y StAX importan en la superficie XXE"
description: "Cómo influyen DOM, SAX y StAX en la superficie XXE dentro de aplicaciones Java con Spring Boot. Por qué no son solo APIs distintas para leer XML, y qué cambia en seguridad según el parser, su configuración y el modelo de procesamiento que usa cada una."
order: 165
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# Por qué DOM, SAX y StAX importan en la superficie XXE

## Objetivo del tema

Entender por qué **DOM, SAX y StAX** importan al analizar la superficie de **XXE** en aplicaciones Java + Spring Boot.

La idea de este tema es empezar a bajar el bloque de XXE al ecosistema concreto de Java, donde es muy común encontrarse con distintas APIs o modelos de parseo XML que a veces se mencionan como si fueran solo estilos técnicos equivalentes.

Pero desde seguridad eso es incompleto.

Porque cuando hablamos de:

- **DOM**
- **SAX**
- **StAX**

no estamos hablando solo de tres maneras distintas de “leer XML”.

También estamos hablando de:

- distintos modelos mentales de parseo
- distintas superficies de configuración
- distintas formas en que se habilitan o heredan capacidades peligrosas
- y distintas maneras en que el equipo puede subestimar lo que realmente está haciendo el parser

En resumen:

> entender DOM, SAX y StAX importa porque XXE no aparece en el vacío: aparece dentro de APIs concretas, con defaults concretos y con equipos concretos que muchas veces usan una de estas opciones sin tener del todo claro qué capacidades siguen activas debajo.

---

## Idea clave

La idea central de este tema es esta:

> aunque DOM, SAX y StAX sean modelos distintos de procesamiento XML, en todos los casos puede existir riesgo si el parser o factory subyacente quedan configurados de forma demasiado permisiva.

Eso significa que no alcanza con decir:

- “nosotros usamos SAX”
- “nosotros usamos DOM”
- “nosotros no cargamos todo en memoria”
- “nosotros hacemos parsing streaming”

Nada de eso, por sí solo, garantiza seguridad frente a XXE.

### Idea importante

La seguridad no viene del nombre de la API.
Viene de:
- qué parser real está interviniendo
- cómo está configurado
- qué capacidades se dejaron activas
- y qué hace el proceso con el documento que recibe.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- creer que cierto modelo de parseo “automáticamente” evita XXE
- pensar DOM, SAX y StAX como opciones puramente de performance o estilo
- no revisar factories y configuraciones concretas
- olvidar que distintas APIs pueden terminar apoyándose en capacidades XML parecidas si nadie las endurece
- asumir que usar streaming reduce por sí mismo toda la superficie de resolución externa

Es decir:

> el problema no es elegir mal entre DOM, SAX o StAX.  
> El problema es creer que la elección de API, por sí sola, reemplaza el análisis de qué libertades concretas conserva el parser.

---

## Error mental clásico

Un error muy común es este:

### “Nosotros usamos X, así que XXE no debería aplicar tanto”

Ese “X” puede ser:

- DOM
- SAX
- StAX
- o alguna librería que envuelve una de esas APIs

Y la frase sigue siendo peligrosa.

Porque la vulnerabilidad no depende solo del estilo de consumo del XML, sino de preguntas como:

- ¿se permiten DTD?
- ¿se resuelven entidades externas?
- ¿hay expansión automática?
- ¿qué parser subyacente opera?
- ¿qué defaults trae?
- ¿quién configuró la factory?
- ¿qué capa de abstracción lo envuelve?

### Idea importante

Cambiar el modelo de lectura no es lo mismo que endurecer la superficie XML.

---

# Parte 1: DOM, SAX y StAX como modelos mentales

Antes de hablar de XXE, conviene tener una intuición corta de qué significa cada uno.

## DOM
Tiende a pensar el XML como un árbol completo en memoria.

## SAX
Tiende a procesarlo como una secuencia de eventos a medida que el parser avanza.

## StAX
También trabaja de forma incremental o streaming, pero con un modelo más orientado a lectura controlada por quien consume el stream.

### Idea útil

No hace falta dominar todos los detalles técnicos ahora.
Alcanza con entender que:
- DOM suele construir una representación completa
- SAX y StAX suelen trabajar más en flujo o evento

### Idea importante

Esa diferencia importa para performance, memoria y ergonomía.
Pero no elimina automáticamente las preguntas de seguridad sobre entidades externas y resolución.

---

# Parte 2: DOM — por qué importa para XXE

## La intuición principal

Cuando el equipo usa **DOM**, suele imaginar algo así:

- parseo el XML
- obtengo un árbol
- navego nodos
- extraigo datos

Eso hace que DOM parezca un enfoque muy “de estructura”.

### Problema

Esa comodidad puede ocultar que, antes de tener el árbol listo, el parser ya tomó decisiones importantes sobre:

- DTD
- entidades
- expansión
- resolución externa

### Idea importante

El árbol DOM que llega a tu código ya es el resultado de un parser que pudo haber hecho bastante trabajo “invisible” antes.

---

## Por qué DOM puede ser especialmente engañoso

Porque el desarrollador ve algo muy limpio:

- `Document`
- nodos
- elementos
- atributos

y siente que solo está navegando una estructura ya armada.

### Pero debajo hubo
- parseo
- interpretación
- expansión
- posible resolución de entidades
- posible interacción con recursos externos o locales

### Regla sana

Con DOM es especialmente fácil olvidar que la construcción del árbol ya pudo haber activado justo las capacidades que te preocupan en XXE.

---

# Parte 3: SAX — por qué importa para XXE

## La intuición principal

Con **SAX**, el modelo se siente más “streaming” o “event-driven”.

Eso hace que muchas personas piensen:
- “como no construimos el documento completo, esto ya debería ser menos riesgoso”

### Problema

SAX cambia cómo recibís el XML en tu código.
No necesariamente cambia, por sí solo, qué capacidades XML quedaron habilitadas en el parseo.

### Idea importante

Que el consumo sea por eventos no implica que el parser no haya procesado DTD o entidades según su configuración.

---

## Por qué SAX puede dar falsa sensación de control

Como el código suele verse muy procedural:

- arranca el documento
- aparece un elemento
- aparece texto
- se procesan eventos

parece que el desarrollador “ve” todo lo importante.

Pero la superficie de XXE puede seguir estando en:

- la factory usada
- los features habilitados
- el parser subyacente
- la resolución de entidades antes o durante el flujo

### Regla sana

No confundas “procesamiento incremental” con “superficie XML endurecida”.

---

# Parte 4: StAX — por qué importa para XXE

## La intuición principal

**StAX** también suele sentirse moderno o controlado, porque el código consume el stream de forma bastante explícita.

Eso puede llevar a pensar:
- “acá estoy leyendo token por token, así que no debería haber mucha magia”

### Problema

Otra vez, la pregunta de seguridad no es solo cómo consumís el stream, sino qué parser y qué configuración quedaron habilitados para producir ese stream.

### Idea importante

StAX puede hacer que el código parezca aún más “bajo control”, pero eso no vuelve irrelevante la configuración de entidades externas o DTD en la capa que construye el lector XML.

---

## Por qué StAX también entra en el radar de XXE

Porque aunque el estilo sea pull-based y muy explícito, sigue existiendo una fase donde el XML Reader o la factory:

- interpretan el documento
- deciden qué capacidades están activas
- y pueden aceptar o no cierto comportamiento relacionado con entidades y DTD

### Regla sana

Cuando uses StAX, no pienses solo en “yo leo el stream”.
Pensá también en:
- “¿qué libertades tuvo el motor para construir este stream?”

---

# Parte 5: La gran lección — la vulnerabilidad vive en la configuración efectiva

Hasta acá, la lección importante debería ser:

> DOM, SAX y StAX cambian cómo trabajás con el XML, pero el riesgo XXE sigue dependiendo de la configuración efectiva del parser, de la factory y del stack que genera esa representación o ese flujo.

Eso significa que dos equipos pueden decir:
- “ambos usamos DOM”

y aun así tener riesgos muy distintos según:

- cómo instancian la factory
- qué features deshabilitan o no
- qué librerías envuelven el parseo
- qué defaults heredan

### Idea importante

La seguridad no está en la etiqueta del modelo.
Está en la combinación:
- API
- parser real
- configuración
- librería
- contexto de ejecución

---

# Parte 6: Por qué esto importa tanto en Java

En Java, este tema pesa especialmente porque muchas veces el equipo no usa el parser de forma “manual y desnuda”, sino a través de:

- factories
- builders
- readers
- transformadores
- librerías de terceros
- frameworks
- módulos de seguridad
- conversores de documentos
- utilidades empresariales

### Idea útil

Entonces el desarrollador puede pensar:
- “yo no parseo XML directamente”
cuando en realidad su aplicación sí lo hace, solo que a través de capas más abstraídas.

### Regla sana

Si una librería te entrega un `Document`, un reader o un flujo XML ya armado, seguís necesitando entender qué modelo usa y con qué capacidades lo generó.

---

# Parte 7: Distintas APIs, mismos errores culturales

Hay errores de equipo que se repiten casi igual con DOM, SAX o StAX:

- usar defaults sin revisarlos
- asumir que la librería ya viene segura
- no saber si DTD está habilitada
- no saber si se resuelven entidades externas
- no distinguir parseo seguro de parseo funcional
- creer que el modelo de API reemplaza el hardening del parser

### Idea importante

El bug puede cambiar de forma según la API.
Pero la causa cultural suele ser muy parecida:
- demasiada confianza en defaults y demasiado poco modelado del comportamiento real del parser.

---

# Parte 8: DOM, SAX y StAX también cambian cómo se siente el impacto

Aunque el riesgo base siga viniendo de la configuración, la forma de trabajar con cada API puede influir en:

- cuánto nota el equipo que el parser hizo trabajo extra
- qué tan visible queda la expansión
- qué tan fácil es seguir el flujo mental del documento
- qué tan oculto queda el parser detrás de otra capa

### Ejemplo intuitivo

- con DOM, el árbol ya llegó “resuelto”
- con SAX, el equipo ve eventos y puede sentir más fluidez que control
- con StAX, el consumo parece muy explícito y eso puede reforzar la ilusión de que no hay magia detrás

### Idea importante

Cada modelo esconde el riesgo de una forma distinta.
Y eso importa en revisión y debugging.

---

# Parte 9: El entorno sigue mandando

Igual que en el tema anterior, nada de esto importa aislado del runtime.

Si el parser corre en un proceso que puede ver:

- archivos sensibles
- red privada
- metadata cloud
- servicios internos
- entornos privilegiados

entonces la severidad de XXE sube, independientemente de si la app usa DOM, SAX o StAX.

### Regla sana

El tipo de parser importa.
Pero nunca deberías evaluarlo separado de:
- qué procesa
- quién controla el XML
- y qué puede tocar el proceso que lo parsea.

---

# Parte 10: Qué NO conviene concluir de este tema

Sería un error salir de acá pensando cosas como:

- “DOM es siempre inseguro”
- “SAX te salva”
- “StAX ya resuelve XXE”
- “si usamos streaming, no hace falta revisar entidades”
- “si el parser no carga todo en memoria, el problema desaparece”

### Idea importante

Este tema no busca coronar a un “parser seguro”.
Busca dejar clara una idea más importante:
- **ningún modelo de API reemplaza una configuración segura y una revisión del runtime**

---

# Parte 11: Qué preguntas conviene hacer sobre cada modelo

Cuando veas XML procesado con DOM, SAX o StAX, conviene preguntar:

- ¿qué factory o builder se usa?
- ¿qué parser concreto hay debajo?
- ¿quién configuró sus features?
- ¿DTD está habilitada?
- ¿se permiten entidades externas?
- ¿qué librería envuelve esta capa?
- ¿qué proceso hace el parseo?
- ¿qué acceso a filesystem o red tiene ese proceso?

### Regla sana

La mejor pregunta no es:
- “¿usa DOM o SAX?”

La pregunta madura es:
- “¿qué capacidades XML reales quedaron habilitadas en esta cadena de parseo?”

---

# Parte 12: Cómo reconocer esta superficie en una codebase Spring

En una app Spring o Java, conviene sospechar especialmente cuando veas:

- `DocumentBuilderFactory`
- `SAXParserFactory`
- `XMLInputFactory`
- builders o readers XML creados sin configuración explícita
- librerías que devuelven `Document`, eventos SAX o readers StAX
- transformadores o validadores que aceptan XML externo
- procesamiento documental donde el equipo conoce la API que consume el resultado, pero no la configuración que generó ese resultado

### Idea útil

En revisión real, muchas veces el riesgo no está en la clase final que usa el documento, sino en cómo se construyó el parser varios pasos antes.

---

## Qué revisar en una app Spring

Después de este tema, cuando revises DOM, SAX o StAX en una aplicación Spring, mirá especialmente:

- qué modelo de parseo usa cada componente
- qué factories se instancian
- qué configuración explícita tienen
- qué defaults se están heredando
- si el equipo sabe distinguir modelo de consumo de configuración de seguridad
- si hay librerías de terceros escondiendo el parser real
- qué filesystem o red ve el proceso que hace el parseo

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- factories configuradas explícitamente
- claridad sobre qué modelo usa cada componente
- poca dependencia en defaults
- buen entendimiento de que DOM, SAX y StAX no “resuelven” solos XXE
- revisión de librerías que envuelven el parseo
- procesos menos privilegiados para XML no confiable

### Idea importante

La madurez acá se nota cuando el equipo distingue claramente:
- forma de consumir el XML
de
- superficie de seguridad del parser.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “usamos SAX, así que no debería pasar”
- “StAX es más moderno, así que seguro está bien”
- “DOM solo arma un árbol”
- nadie sabe qué factory se usa
- nadie sabe qué features están activas
- el parser está escondido detrás de una librería y nadie revisó defaults
- el equipo confunde API de consumo con postura de seguridad

### Regla sana

Si la conversación sobre XML se queda solo en DOM vs SAX vs StAX y nunca llega a DTD, entidades o configuración, probablemente todavía falta la parte importante del análisis.

---

## Checklist práctica

Cuando revises XML en Java/Spring, preguntate:

- ¿usa DOM, SAX o StAX?
- ¿qué parser o factory concreta hay debajo?
- ¿cómo está configurada?
- ¿qué libertades XML siguen activas?
- ¿esa API hace sentir al equipo que “solo está leyendo” cuando en realidad hay más capacidad habilitada?
- ¿qué proceso ejecuta el parseo y qué puede ver?

---

## Mini ejercicio de reflexión

Tomá un componente XML de tu app Spring y respondé:

1. ¿Usa DOM, SAX o StAX?
2. ¿Qué factory o parser concreto hay debajo?
3. ¿Está configurado explícitamente?
4. ¿El equipo sabe qué features XML siguen activas?
5. ¿El modelo de API podría estar dando falsa sensación de control?
6. ¿Qué runtime ejecuta el parseo?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

DOM, SAX y StAX importan en la superficie XXE porque no son solo formas distintas de trabajar con XML.
También son puertas de entrada a distintos parsers, factories y configuraciones donde pueden seguir vivas capacidades como:

- DTD
- entidades
- resolución externa

El punto importante no es memorizar cuál API “suena más segura”, sino entender que:

- DOM puede ocultar mucho detrás del árbol ya construido
- SAX puede dar falsa sensación de streaming seguro
- StAX puede dar falsa sensación de control explícito
- y en todos los casos la seguridad real depende de la configuración efectiva del parser y del entorno donde corre

En resumen:

> un backend más maduro no discute DOM, SAX y StAX solo como elecciones de ergonomía o performance, sino también como distintas superficies donde XML puede entrar con más o menos capacidad implícita según cómo se creen y configuren los parsers.  
> Y justamente por eso este tema importa tanto: porque ayuda a romper una falsa equivalencia muy peligrosa, la de creer que elegir cierta API ya resuelve XXE, cuando en realidad el problema sigue viviendo en qué libertades de DTD, entidades y resolución externa continúan activas debajo, y en qué tan rico es el entorno que el proceso le presta al parser para operar más allá del documento mismo.

---

## Próximo tema

**DocumentBuilderFactory y flags críticos contra XXE**
