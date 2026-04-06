---
title: "Cómo revisar librerías de terceros que parsean XML por vos"
description: "Cómo revisar librerías de terceros que parsean XML por vos en aplicaciones Java con Spring Boot. Qué preguntas conviene hacerse cuando la superficie XXE no aparece en tu código directamente, sino escondida detrás de dependencias, frameworks o herramientas documentales."
order: 170
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# Cómo revisar librerías de terceros que parsean XML por vos

## Objetivo del tema

Entender cómo revisar **librerías de terceros que parsean XML por vos** en una aplicación Java + Spring Boot, para no perder de vista riesgos de **XXE** que no aparecen de forma obvia en el código de negocio.

La idea de este tema es tocar una situación muy frecuente en equipos reales:

- nadie crea a mano una `DocumentBuilderFactory`
- nadie ve un `SAXParserFactory` en el service principal
- nadie siente que está “trabajando con XML”
- pero, igual, hay una dependencia que parsea XML por debajo
- y esa dependencia puede dejar vivas capacidades peligrosas del parser

Eso vuelve la superficie mucho más traicionera.

Porque en vez de un código explícito como:

- crear parser
- configurar flags
- parsear documento

tenés algo mucho más opaco, por ejemplo:

- una librería de SAML
- un procesador de SVG
- un toolkit SOAP
- un importador documental
- una librería de firma o validación
- un parser encapsulado en otra abstracción

Y ahí aparece el gran problema:

> el hecho de que tu código no instancie el parser de forma visible no significa que la aplicación no tenga superficie XML.  
> Solo significa que esa superficie vive dentro de otra capa y exige una forma distinta de revisión.

En resumen:

> revisar XXE en librerías de terceros implica aprender a mirar más allá de tu código directo, identificar qué dependencia está parseando XML, con qué defaults podría hacerlo y qué margen real tenés para endurecer, aislar o contener ese comportamiento.

---

## Idea clave

La idea central del tema es esta:

> en XML, una parte importante del riesgo no depende de quién escribió el parser, sino de **qué capacidades siguen activas cuando el documento no confiable llega a esa dependencia**.

Eso significa que una librería de terceros puede convertirse en superficie XXE aunque:

- tu código sea pequeño
- tu endpoint no “parezca XML”
- el parser esté escondido
- el equipo nunca haya creado una factory manualmente

### Idea importante

Cuando una librería parsea XML por vos, el problema de seguridad no desaparece.
Solo cambia de lugar:
- desde tu código visible
- hacia una dependencia que quizá nadie del equipo modeló con suficiente detalle.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- asumir que no hay XXE porque no se ve un parser en el código propio
- confiar ciegamente en que la librería “seguro ya lo resuelve”
- no revisar qué dependencias consumen XML
- no entender cómo endurecer o aislar un parser que vive dentro de una dependencia
- tratar el uso de terceros como si eliminara la necesidad de modelar el riesgo XML
- no ver que muchas superficies documentales, de firma o de federación siguen apoyándose en XML

Es decir:

> el problema no es solo usar mal un parser propio.  
> El problema también es usar una dependencia que parsea XML con una postura desconocida, demasiado permisiva o poco revisada para el contexto donde corre.

---

## Error mental clásico

Un error muy común es este:

### “Eso lo maneja la librería”

Esa frase aparece muchísimo.
Y puede ser cierta en un sentido operativo:
sí, la librería parsea por vos.

Pero la pregunta de seguridad no se cierra ahí.

Todavía importan cosas como:

- ¿qué parser usa por debajo?
- ¿con qué defaults?
- ¿qué capacidades XML mantiene activas?
- ¿acepta XML controlado por actores externos?
- ¿podés configurar su hardening?
- ¿qué runtime ejecuta ese parseo?
- ¿qué parte del resultado o del error vuelve hacia afuera?

### Idea importante

Delegar implementación no equivale a delegar responsabilidad de modelar el riesgo.

---

# Parte 1: Por qué esta superficie es tan común

## XML escondido detrás de capas de alto nivel

Muchas apps modernas no “se sienten XML-first”, pero igual tocan XML a través de:

- SAML
- SOAP
- SVG
- Office/documentos
- validadores
- convertidores
- librerías de firma
- frameworks enterprise
- conectores de terceros
- importadores y transformadores

### Idea útil

Eso hace que el equipo piense:
- “nosotros usamos una librería de autenticación”
- “nosotros usamos un importador”
- “nosotros usamos un renderer”

cuando, por debajo, hay un parser XML tomando decisiones sensibles.

### Regla sana

Si una dependencia acepta o transforma formatos que pueden contener XML, ya tenés motivo para preguntar cómo parsea.

---

## Por qué esto es más traicionero que el parser explícito

Cuando el parser lo instancia tu equipo, al menos existe una línea visible para revisar.
Con una librería de terceros, en cambio:

- puede no verse la factory
- puede no verse la configuración
- puede no verse el parser real
- puede no estar claro si usa DOM, SAX o StAX
- puede no estar claro si se puede endurecer desde afuera

### Idea importante

La opacidad aumenta la necesidad de revisión, no la disminuye.

---

# Parte 2: Qué tipo de dependencias conviene mirar con sospecha sana

No hace falta desconfiar de todo ciegamente.
Pero sí conviene activar revisión cuando una librería hace cosas como:

- parsear SAML
- consumir SOAP
- procesar SVG
- validar XML firmados
- transformar documentos
- importar plantillas o descriptores
- convertir formatos
- analizar metadata basada en XML
- renderizar o inspeccionar archivos complejos

### Idea útil

El patrón común no es “se llama XML”.
El patrón común es:
- **recibe o transforma estructuras que probablemente involucren parseo XML en alguna capa**.

### Regla sana

Si una dependencia manipula formatos tradicionalmente apoyados en XML, conviene asumir que el tema existe hasta demostrar lo contrario.

---

# Parte 3: Qué preguntas conviene hacer primero

Cuando una librería parsea XML por vos, las preguntas iniciales más útiles suelen ser:

- ¿qué input externo termina entrando a esa librería?
- ¿ese input puede ser controlado por usuario, tenant, partner o archivo subido?
- ¿qué parser o familia de parser usa por debajo?
- ¿hay documentación sobre DTD, entidades externas o resolución?
- ¿existen opciones de configuración para endurecerla?
- ¿la librería tiene historial o documentación sobre XXE?
- ¿qué runtime ejecuta ese parseo?

### Idea importante

Antes de pensar en “exploit”, conviene mapear:
- quién controla el input
- quién parsea
- y con qué margen de configuración contás.

---

# Parte 4: No toda revisión arranca leyendo código fuente de la dependencia

A veces el equipo cree que revisar una librería implica abrir todo su código.
Eso puede ayudar, pero no siempre es el primer paso más eficiente.

Muchas veces conviene arrancar por:

- documentación oficial
- ejemplos de configuración
- issues conocidos
- notas de seguridad
- formas de inyectar tu propia factory o resolver
- comportamiento por default
- changelogs o breaking changes de seguridad
- discusiones de la comunidad sobre XXE en esa librería

### Idea útil

El objetivo inicial no es auditar toda la dependencia.
Es responder:
- “¿esta librería parsea XML?”
- “¿cómo?”
- “¿puedo endurecerla?”
- “¿qué tengo que aislar si no puedo?”

### Regla sana

Revisar bien una dependencia no siempre significa leerla entera.
Significa entender rápidamente qué parte del riesgo te transfiere y qué controles te deja ejercer.

---

# Parte 5: Lo que más importa: si podés o no podés configurar

Una distinción clave en librerías de terceros es esta:

## Caso A: la dependencia permite configurar el parser
Por ejemplo, deja:
- pasar factories
- pasar resolvers
- activar flags
- endurecer el comportamiento

## Caso B: la dependencia encapsula casi todo
Y deja poca o nula capacidad de control.

### Idea importante

Esa diferencia cambia mucho la estrategia.

- si podés configurar, el foco va a estar en endurecer y verificar consistencia
- si no podés configurar, el foco va a estar más en:
  - aislar
  - contener
  - limitar input
  - revisar versionado
  - o incluso cambiar de librería si el riesgo es alto

### Regla sana

No todas las dependencias se revisan igual.
Una parte de la revisión consiste justamente en descubrir cuánto control real tenés sobre su superficie XML.

---

# Parte 6: Cuando la librería permite configurar, qué conviene mirar

Si la dependencia sí te deja intervenir, conviene revisar:

- qué parser usa
- qué factory acepta
- qué flags recomienda
- si admite custom resolvers
- qué defaults mantiene si no configurás nada
- si la configuración aplica a todos los flujos o solo a uno
- si queda clara la diferencia entre uso funcional y uso endurecido

### Idea útil

Muchas librerías permiten endurecer, pero solo si el equipo sabe que debe hacerlo.
Si nadie activa esa configuración, el riesgo sigue siendo bastante tuyo.

### Regla sana

La capacidad de endurecer solo vale cuando se usa de forma explícita y consistente.

---

# Parte 7: Cuando la librería no permite configurar, qué conviene mirar

Este es un escenario más incómodo, pero bastante real.

Si la dependencia parsea XML internamente y no te deja endurecer el comportamiento con claridad, conviene revisar cosas como:

- qué input le llega
- qué tanto control externo existe sobre ese input
- en qué proceso corre
- qué red y filesystem ve
- qué resultados expone
- si hay límites de tamaño o presupuesto
- si la librería tiene alternativas o versiones más seguras
- si el flujo puede moverse a un runtime más contenido

### Idea importante

Cuando no podés arreglar el parser, tu margen de defensa se mueve hacia:
- contención
- aislamiento
- reducción del input
- y arquitectura.

### Regla sana

No poder tocar la configuración no elimina el riesgo.
Solo cambia dónde tenés que contenerlo.

---

# Parte 8: Versiones viejas, forks y examples heredados

Otra fuente fuerte de riesgo aparece cuando el equipo usa:

- versiones viejas
- configuraciones heredadas
- forks internos
- ejemplos de hace años
- wrappers propios sobre librerías XML

### Problema

La organización puede sentir que “esto ya está resuelto hace tiempo”, pero en realidad estar apoyándose en:

- defaults históricos
- prácticas anteriores al hardening moderno
- snippets internos nunca revisados
- dependencias que ya tenían advertencias conocidas

### Idea útil

La superficie XML de terceros no se revisa una sola vez para siempre.
También depende de versión, wrapper y contexto actual.

### Regla sana

Si la dependencia es vieja y parsea XML, merece una revisión más activa, no menos.

---

# Parte 9: Librería segura en teoría, runtime peligroso en práctica

Este es otro punto clave.

Aun si la dependencia trae cierto hardening razonable, sigue importando:

- dónde corre
- qué puede ver
- qué archivos locales tiene cerca
- si ve metadata cloud
- si está en un worker con mucha reachability
- qué errores devuelve
- qué output filtra

### Idea importante

El riesgo no lo decide solo la librería.
También lo decide el entorno que le presta el proceso donde corre.

### Regla sana

Una dependencia relativamente sana en un runtime muy rico puede seguir justificar prioridad alta si el XML controlado por terceros llega hasta ahí.

---

# Parte 10: Qué buscar en la documentación de una librería

Cuando una dependencia parsea XML, hay ciertas cosas muy valiosas para revisar en su documentación o en su ecosistema:

- si menciona XXE
- si documenta hardening explícito
- si habla de DTD o entidades externas
- si recomienda ciertas factories
- si permite `EntityResolver` o `XMLResolver`
- si expone propiedades de parser
- si hubo issues pasados de seguridad
- si cambió defaults en versiones nuevas
- si hay notas sobre processing seguro de input no confiable

### Idea útil

La ausencia total de documentación de seguridad no prueba vulnerabilidad.
Pero sí te obliga a desconfiar un poco más y a revisar mejor.

---

# Parte 11: Qué señales rojas merecen revisión fuerte

Hay ciertos olores que deberían prender la alarma rápido cuando una librería parsea XML:

- nadie sabe qué parser usa por debajo
- nadie sabe si admite DTD
- nadie sabe si resuelve entidades externas
- no hay forma clara de configurarla
- la librería corre en un worker o servicio con mucha reachability
- acepta input controlado por usuario o partner
- los errores o resultados vuelven de forma visible
- la dependencia es vieja y poco auditada
- el equipo repite “lo maneja la librería” como única respuesta

### Regla sana

Cuanto menos entendés cómo parsea, más fuerte debería ser la revisión del contexto donde la usás.

---

# Parte 12: Qué hacer si no tenés claridad total

A veces la revisión no te deja con certeza completa.
Eso puede pasar cuando:

- la dependencia es grande
- la documentación es floja
- la configuración está muy escondida
- hay capas internas del framework que tapan la implementación real

En esos casos, conviene no inventar tranquilidad.
Mejor decir:

- “esta superficie XML existe”
- “la configuración efectiva del parser no está suficientemente clara”
- “el input no confiable llega a esta dependencia”
- “conviene endurecer, aislar o revisar más a fondo antes de asumir seguridad”

### Idea importante

La incertidumbre honesta es mejor que la falsa certeza heredada.

---

# Parte 13: Qué preguntas conviene hacer en revisión de arquitectura

Cuando una dependencia parsea XML por vos, conviene preguntar:

- ¿qué feature del producto depende de esta librería?
- ¿qué actor controla el input?
- ¿qué parser o familia usa debajo?
- ¿puedo configurarla?
- ¿puedo endurecerla?
- ¿puedo aislarla?
- ¿qué pasa si mañana aparece un hallazgo XXE en esa dependencia?
- ¿qué tan costoso sería mover ese flujo a un proceso más contenido?
- ¿hay una alternativa más explícita o más auditable?
- ¿qué parte de la seguridad depende hoy solo de fe en la dependencia?

### Regla sana

Una librería de terceros siempre debería poder ubicarse en un mapa claro de:
- input
- parser
- runtime
- mitigación
- contención.

---

## Qué revisar en una app Spring

Cuando revises librerías de terceros que parsean XML por vos en una aplicación Spring, mirá especialmente:

- endpoints o workers que les entregan input XML o formatos derivados
- dependencias de SAML, SOAP, SVG, validación documental o transformación
- si hay forma de pasar factories, resolvers o flags
- si la dependencia documenta XXE o secure processing
- qué proceso usa la librería
- qué red y filesystem ve ese proceso
- qué output o errores expone el sistema después del parseo
- si el equipo sabe realmente cómo está defendido ese flujo

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- claridad sobre qué dependencia parsea XML
- capacidad explícita de endurecer o configurar
- documentación revisada
- pocas suposiciones ciegas sobre defaults
- runtime más contenido para flujos XML opacos
- reviewers capaces de explicar dónde vive el riesgo aunque el parser no esté en el código propio

### Idea importante

La madurez acá se nota cuando el equipo deja de decir “eso lo hace la librería” y empieza a decir “esta dependencia parsea XML así, en este proceso, con este margen de control”.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- dependencia que parsea XML y nadie sabe cómo
- input no confiable entrando a la librería
- nula capacidad de configuración
- runtime poderoso
- documentación muda sobre XXE
- versión vieja o wrapper heredado
- sensación de seguridad basada solo en abstracción
- nadie sabe qué contención existe si el parser resulta demasiado permisivo

### Regla sana

Si la dependencia oculta demasiado del parseo, entonces el entorno y la contención importan todavía más.

---

## Checklist práctica

Cuando una librería parsea XML por vos, preguntate:

- ¿qué input externo le llega?
- ¿qué parser usa debajo?
- ¿lo puedo configurar?
- ¿lo puedo endurecer?
- ¿qué runtime ejecuta ese parseo?
- ¿qué puede ver ese proceso?
- ¿qué output o errores vuelven?
- ¿qué pasa si la librería resulta más permisiva de lo que creemos?
- ¿qué parte del riesgo puedo contener aunque no controle el parser directamente?

---

## Mini ejercicio de reflexión

Tomá una dependencia XML de tu app Spring y respondé:

1. ¿Qué feature del producto usa?
2. ¿Qué input no confiable le llega?
3. ¿Sabés qué parser usa por debajo?
4. ¿Podés configurarlo?
5. ¿Qué runtime ejecuta el parseo?
6. ¿Qué contención tenés si la dependencia fuera demasiado permisiva?
7. ¿Qué revisarías primero para dejar de depender solo de suposiciones?

---

## Resumen

Revisar librerías de terceros que parsean XML por vos es clave porque una gran parte de la superficie XXE moderna ya no vive siempre en el código que crea parsers explícitamente, sino en dependencias que reciben, validan, transforman o renderizan formatos basados en XML.

Eso obliga a cambiar la forma de auditar:

- entender qué dependencia parsea
- qué input externo le llega
- qué margen de configuración tenés
- qué runtime ejecuta ese parseo
- y qué contención existe si la librería resulta más permisiva de lo esperado

En resumen:

> un backend más maduro no deja que la abstracción de una librería de terceros lo haga olvidar que sigue existiendo un parser XML con capacidades concretas corriendo dentro de su propio entorno.  
> También se pregunta qué puede configurar, qué no, qué documentación respalda esa confianza y qué tan dañino sería que esa dependencia aceptara más de lo que el flujo necesitaba.  
> Y justamente por eso este tema importa tanto: porque enseña a mover la revisión desde “yo no escribí el parser, así que el problema no debería ser mío” hacia una postura mucho más realista, donde delegar implementación no elimina el riesgo, sino que exige entender mejor la dependencia y reforzar mejor el entorno donde la estás dejando operar.

---

## Próximo tema

**XML en SAML, SOAP, SVG y documentos: dónde suele esconderse**
