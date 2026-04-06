---
title: "DTD, entidades y resolución externa: intuición sin magia"
description: "Cómo entender DTD, entidades y resolución externa en XML desde una intuición clara y útil para razonar XXE en aplicaciones Java con Spring Boot. Una explicación conceptual para dejar de ver XXE como magia del parser y empezar a verla como un problema de capacidades habilitadas."
order: 163
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# DTD, entidades y resolución externa: intuición sin magia

## Objetivo del tema

Entender, de forma intuitiva y sin volver el tema innecesariamente esotérico, qué papel juegan:

- **DTD**
- **entidades**
- **resolución externa**

en el problema de **XXE** dentro de aplicaciones Java + Spring Boot.

La idea de este tema es construir una base mental muy clara antes de pasar a configuraciones concretas de parsers y mitigaciones.

Porque a mucha gente XXE le suena así:

- “algo raro con XML”
- “alguna sintaxis rara del documento”
- “una especie de truco viejo”
- “magia negra de parsers”
- “algo que se arregla copiando flags de Stack Overflow”

Y esa sensación suele tener una causa simple:
no se entiende bien qué está tratando de hacer el parser cuando ve ciertas partes del documento.

En resumen:

> si entendés qué es una DTD, qué es una entidad y qué significa que el parser resuelva algo “externo”, XXE deja de parecer una rareza incomprensible y empieza a verse como un caso bastante lógico de un formato que permite más capacidades de las que el flujo realmente necesitaba.

---

## Idea clave

El punto de partida más útil es este:

> XML no solo permite representar datos estructurados.  
> También puede incluir mecanismos para **declarar cosas sobre el documento** y para **reutilizar o expandir contenido** durante el parseo.

Ahí aparecen dos piezas clave:

- la **DTD**
- las **entidades**

Y sobre esa base aparece una tercera:
- la **resolución externa**

La idea central es esta:

> XXE no nace porque “XML sea malo”.  
> Nace cuando el parser está dispuesto a usar esas capacidades para ir más allá del contenido ya recibido y empezar a consultar o expandir recursos que viven fuera del documento mismo.

### Idea importante

El documento deja de ser solo “algo que el backend lee”.
Pasa a ser algo que también puede influir **cómo** el backend interpreta, expande o busca información durante el parseo.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- ver XXE como una lista de payloads sin entender qué pasa debajo
- memorizar mitigaciones sin comprender por qué sirven
- pensar que DTD y entidades son detalles irrelevantes del formato
- no distinguir entre “datos del XML” y “capacidad de definición o expansión que el parser habilita”
- creer que el problema es una sintaxis rara en vez de una capacidad del parser

Es decir:

> el problema no es no recordar cierta palabra técnica.  
> El problema es no tener una imagen mental simple de por qué un documento XML puede terminar empujando al parser a hacer cosas fuera del texto base.

---

## Error mental clásico

Un error muy común es este:

### “XXE pasa porque el XML trae un payload raro”

Eso describe el síntoma visible, pero no el fondo del problema.

Porque el verdadero problema es otro:

- el documento usa una capacidad del formato
- el parser la acepta
- y esa capacidad le permite ir a buscar, expandir o interpretar algo externo

### Idea importante

El payload puede verse extraño.
Pero la lógica subyacente no es mágica:
- el parser recibió permiso implícito o explícito para hacer más trabajo del que el flujo de negocio necesitaba.

---

## Empecemos por la DTD: qué es, a nivel intuitivo

**DTD** suele expandirse como **Document Type Definition**.

No hace falta meternos en la formalidad completa.
La intuición útil es esta:

> una DTD es una forma de declarar reglas, definiciones o estructura que el parser puede usar para entender mejor el documento XML.

Pensalo como una capa que le dice al parser cosas del tipo:

- qué elementos existen
- cómo se organizan
- qué nombres o piezas se pueden reutilizar
- qué referencias deberían expandirse

### Idea útil

La DTD no es “el dato de negocio” del XML.
Es más bien una capa de metainformación sobre cómo interpretar o estructurar el documento.

### Idea importante

Y ahí ya aparece la primera frontera relevante:
- el documento no solo trae datos
- también puede traer instrucciones o definiciones sobre cómo procesarlos

---

## Las entidades: referencias que el parser puede expandir

Ahora viene la segunda pieza.

Una **entidad** puede pensarse, a nivel intuitivo, como una referencia con nombre que luego el parser puede reemplazar o expandir por algún contenido.

La idea básica sería algo así:

- se define una referencia
- luego se la usa
- y el parser la reemplaza por su valor

### Analogía simple

Es como si el documento dijera:

- “cada vez que veas esta referencia, poné acá este contenido”

### Idea importante

Mientras esa expansión se mantenga totalmente dentro del documento y bajo un contrato razonable, puede parecer solo una capacidad de composición.
El problema aparece cuando esa entidad deja de depender solo del documento y empieza a depender de algo externo.

---

## La palabra “externa” es la clave del bloque

Acá está el punto más importante del tema.

Hasta ahora podrías pensar:
- bueno, una DTD define cosas
- una entidad reemplaza cosas
- suena técnico, pero no necesariamente peligroso

Lo que cambia mucho la gravedad es cuando entra en juego lo **externo**.

### ¿Qué significa externo acá?

Que el parser no se limita a expandir algo que ya estaba completamente dentro del documento.
En cambio, puede intentar obtenerlo desde otro lugar, por ejemplo:

- fuera del texto principal
- fuera del documento recibido
- fuera del contexto que el negocio creía estar procesando

### Idea útil

En ese momento, el parser deja de ser solo un lector estructurado y se convierte en un componente con capacidad de **resolver dependencias o recursos** que no estaban “ya presentes” en el input base.

---

## Resolver externamente: qué significa de forma concreta

“Resolver externamente” quiere decir, en la intuición más simple:

> el parser ve una referencia y, en vez de limitarse al contenido inmediato del documento, intenta buscar lo necesario en otro lugar.

Ese “otro lugar” puede ser algo como:

- otro recurso
- una ruta del entorno
- una ubicación accesible desde el runtime
- un recurso que el proceso puede intentar leer o consultar

### Idea importante

No hace falta todavía pensar en sintaxis exacta.
La intuición útil es esta:
- el documento le pide al parser que no se quede quieto
- que vaya a buscar algo más
- y el parser obedece si está configurado para permitirlo

---

## Por qué eso rompe la idea de “parsear es pasivo”

Muchos equipos imaginan el parseo así:

- llega un documento
- el parser lo interpreta
- produce una estructura en memoria
- listo

Eso sería un modelo bastante pasivo.

Pero cuando hay DTD, entidades y resolución externa habilitada, el modelo cambia:

- llega un documento
- el parser ve definiciones
- el parser ve referencias
- el parser intenta expandirlas
- para expandirlas puede necesitar consultar algo fuera del texto
- y recién entonces produce la estructura final

### Idea importante

El parseo deja de ser una operación puramente local sobre bytes recibidos.
Se vuelve una operación con potencial de **interacción con el entorno**.

---

## Ahí nace XXE de forma natural

Con esta intuición, XXE ya no debería sonar tan misterioso.

Se llama **XML External Entity** porque el problema aparece cuando:

- el documento define o usa entidades
- esas entidades dependen de recursos externos
- y el parser está dispuesto a resolverlas

### Regla sana

XXE no es “una cosa rara que aparece en XML”.
Es la consecuencia lógica de habilitar que un documento haga que el parser consulte o expanda referencias externas.

### Idea importante

Una vez que entendés eso, las mitigaciones empiezan a tener sentido:
- cortar DTD donde no hace falta
- deshabilitar entidades externas
- evitar que el parser resuelva recursos que el flujo no necesita

---

## DTD y entidades no son “malas” por sí mismas

Esto también conviene decirlo claramente.

La DTD y las entidades existen por razones del formato.
No son una “feature maliciosa”.

El problema aparece cuando esa capacidad:

- no es necesaria para el caso de uso
- pero igual queda habilitada
- y el input no es plenamente confiable
- y el runtime tiene acceso a recursos que el documento jamás debería poder influir

### Idea útil

La pregunta de seguridad no es:
- “¿DTD = malo?”

La pregunta útil es:
- “¿esta feature realmente necesita esta capacidad del parser?”

---

## XML puede traer más poder del que el negocio necesita

Esta es una lección muy parecida a la del bloque de SSRF.

En SSRF vimos que muchas features eran demasiado poderosas:
- cliente genérico
- redirects
- demasiada red
- demasiado privilegio

Acá aparece una versión parecida:
- parser con demasiadas capacidades
- documento con más poder del necesario
- expansión y resolución que el caso de uso jamás pidió

### Idea importante

En ambos casos, el error de fondo es el mismo:
- dejar habilitado más comportamiento del que la feature realmente necesita.

---

## Qué relación hay entre DTD y estructura del documento

Otra intuición útil:
la DTD puede verse como una forma de “acompañar” al documento con definiciones sobre cómo debería entenderse cierta parte de su estructura.

Eso no siempre implica riesgo grave por sí solo.
Pero sí crea un lugar donde el parser puede encontrar:

- reglas
- definiciones
- entidades
- referencias que expandir

### Regla sana

Cuando una feature procesa XML no confiable, cualquier cosa que aumente lo que el parser puede “hacer” más allá de leer el árbol básico merece revisión.

---

## Entidades internas vs entidades externas: la intuición importante

Sin entrar todavía en detalle fino, conviene quedarnos con una distinción simple:

### Entidades internas
Se resuelven dentro del material ya definido en el propio documento o en su estructura inmediata.

### Entidades externas
Empujan al parser a mirar más allá del documento base.

### Idea importante

Para XXE, lo que vuelve especialmente delicado el escenario no es solo “hay entidades”, sino:
- **hay entidades que pueden sacar al parser del documento y llevarlo al entorno**

---

## Por qué el entorno del parser importa tanto

Acá volvemos a una idea muy conocida del bloque anterior:
el impacto real depende del runtime.

Porque si el parser corre en un proceso que puede ver:

- filesystem local
- rutas sensibles
- red interna
- metadata cloud
- servicios cercanos
- recursos del contenedor o del host

entonces la resolución externa puede transformarse en una interacción con recursos mucho más valiosos.

### Idea útil

El documento no trae el impacto completo dentro de sí mismo.
El impacto aparece al combinar:
- documento
- parser
- configuración
- y entorno alcanzable

---

## Qué lo hace especialmente traicionero en equipos modernos

XXE sigue sorprendiendo porque mucha gente ya no piensa activamente en XML.
Entonces aparece un sesgo peligroso:

- no se revisa tan a fondo el parser
- no se discuten tanto sus defaults
- se delega más confianza a librerías
- y el problema queda fuera del radar hasta que alguien lo encuentra

### Idea importante

Un riesgo menos “de moda” no es un riesgo desaparecido.
A veces es un riesgo menos presente en la conversación y por eso más subestimado.

---

## Cómo saber si ya estás entendiendo bien la intuición

Si este tema quedó claro, deberías poder pensar XXE más o menos así:

> “Tengo un documento XML. Ese documento puede incluir definiciones y referencias. Si el parser acepta resolver referencias externas, entonces el documento puede hacer que el proceso busque o expanda recursos fuera del texto base. El problema no es solo el documento, sino que el parser tenga esa capacidad habilitada sin que el caso de uso la necesite.”

### Idea importante

Si podés decirlo así, ya dejaste atrás la parte de “magia rara del parser”.
Y eso es exactamente el objetivo del tema.

---

## Qué preguntas conviene hacer desde ahora

A partir de esta intuición, cada vez que veas XML conviene preguntar:

- ¿hay DTD en juego?
- ¿hay entidades?
- ¿el parser podría resolver algo externo?
- ¿esa capacidad es necesaria?
- ¿quién controla el documento?
- ¿qué entorno ve el proceso que parsea?
- ¿qué impacto tendría que el parser consultara recursos fuera del documento base?

### Regla sana

La pregunta más valiosa no es:
- “¿hay XML?”

La pregunta madura es:
- “¿qué libertades de interpretación y resolución le estamos dejando al parser para este caso de uso concreto?”

---

## Qué revisar en una app Spring

En una app Spring o Java, después de este tema conviene mirar especialmente:

- parsers DOM, SAX o StAX
- transformaciones XSLT
- procesamiento de SAML o SOAP
- manejo de SVG o documentos XML subidos por usuarios
- librerías que envuelven parsers XML por debajo
- configuraciones donde no está claro si DTD o entidades externas quedaron activas
- workers con acceso a red o filesystem que procesan XML no confiable

### Idea útil

Si el sistema usa XML y nadie puede decir rápido si el parser resuelve entidades externas o no, ya hay una muy buena pregunta pendiente.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- parsers configurados de forma explícita
- poca o nula necesidad de DTD en input no confiable
- claridad sobre qué librerías parsean XML
- menos dependencia en defaults históricos
- mejor separación entre simple lectura y transformaciones más potentes
- procesos menos privilegiados para manejar documentos externos

### Idea importante

La madurez acá empieza por entender qué capacidades del parser realmente necesitás y cuáles sobran.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- nadie sabe si se permite DTD
- nadie sabe si se resuelven entidades externas
- el parser se usa “como viene”
- el equipo asume que parsear XML es pasivo
- XML entra a procesos con acceso a filesystem o red interna
- librerías de terceros parsean XML y nadie revisó sus defaults
- XXE todavía se percibe como una rareza teórica y no como una consecuencia técnica bastante lógica

### Regla sana

Si el equipo no puede explicar bien la diferencia entre entidad y resolución externa, probablemente todavía le esté regalando demasiada confianza al parser.

---

## Checklist práctica

Después de este tema, cuando veas XML preguntate:

- ¿el documento puede traer DTD?
- ¿hay entidades en juego?
- ¿el parser podría expandir referencias externas?
- ¿esa capacidad hace falta para este flujo?
- ¿quién controla el XML?
- ¿qué entorno ve el proceso que lo parsea?
- ¿qué cambiaría si el parser se limitara a leer el contenido base sin resolver nada externo?

---

## Mini ejercicio de reflexión

Tomá un componente XML de tu app Spring o de una librería que uses y respondé:

1. ¿Qué parser interviene?
2. ¿El equipo sabe si admite DTD?
3. ¿El equipo sabe si puede resolver entidades externas?
4. ¿Ese flujo realmente necesita esas capacidades?
5. ¿Qué filesystem o red ve el proceso?
6. ¿Qué parte de la intuición de XXE ya te queda más clara?
7. ¿Qué componente mirarías primero con esta nueva lente?

---

## Resumen

DTD, entidades y resolución externa son las piezas conceptuales que vuelven entendible a XXE.

La intuición más importante es esta:

- la DTD permite definir cosas sobre el documento
- las entidades permiten referencias que el parser puede expandir
- y cuando esa expansión depende de recursos externos, el parser deja de trabajar solo con el texto base y empieza a interactuar con el entorno

En resumen:

> un backend más maduro no ve XXE como una colección rara de payloads ni como una magia oscura del parser, sino como una consecuencia bastante natural de dejar que un formato estructurado traiga consigo más capacidad de interpretación y resolución de la que el flujo realmente necesitaba.  
> Y justamente por eso este tema importa tanto: porque cuando entendés la lógica simple detrás de DTD, entidades y resolución externa, las mitigaciones posteriores dejan de sentirse arbitrarias y pasan a verse como lo que realmente son: una forma de devolverle al parser un rol más modesto, más predecible y mucho más alineado con la idea de que un documento externo debería ser solo datos a procesar, no una invitación a que el runtime vaya a buscar, expandir o consultar cosas fuera de ese contexto.

---

## Próximo tema

**XXE como lectura local, SSRF y DoS: mapa de impactos**
