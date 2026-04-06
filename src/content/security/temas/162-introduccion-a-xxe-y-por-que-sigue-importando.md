---
title: "Introducción a XXE y por qué sigue importando"
description: "Introducción a XXE en aplicaciones Java con Spring Boot. Qué es XML External Entity, por qué sigue importando hoy y cómo entender su impacto real más allá de la idea de que XML es una tecnología vieja o poco usada."
order: 162
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# Introducción a XXE y por qué sigue importando

## Objetivo del tema

Entender qué es **XXE** y por qué sigue siendo una categoría relevante al trabajar con aplicaciones Java + Spring Boot, aunque muchas personas la asocien con tecnologías “viejas” o con sistemas que ya casi no usan XML.

La idea de este tema es abrir un nuevo bloque del curso con una advertencia importante:

- a veces el equipo cree que ya no usa XML
- o cree que XML solo vive en integraciones heredadas
- o piensa que el riesgo quedó atrás porque hoy se habla más de JSON
- o asume que XXE es un problema histórico, interesante para entrevistas pero poco presente en software actual

Ese razonamiento puede ser engañoso.

Porque XML sigue apareciendo en muchos lugares, a veces de forma explícita y a veces bastante oculta, por ejemplo en:

- integraciones legacy
- SOAP
- SAML
- SVG
- algunos formatos de documentos
- librerías de terceros
- parsers internos
- transformaciones XSLT
- validaciones o firmas
- archivos de configuración
- y flujos donde el desarrollador ni siquiera siente que está “trabajando con XML” de forma consciente

En resumen:

> XXE importa porque XML sigue estando más presente de lo que muchos equipos creen, y porque un parser mal configurado puede convertir una operación aparentemente inocente de lectura o transformación en una vía hacia lectura de archivos locales, requests salientes inesperadas, denegación de servicio o exposición de información sensible.

---

## Idea clave

**XXE** viene de **XML External Entity**.

La intuición inicial más útil para arrancar es esta:

> XML no es solo texto con tags.  
> También puede incluir mecanismos de definición y resolución de entidades que le dicen al parser cómo interpretar o expandir partes del documento.

Y ahí aparece el problema.

Si el parser permite resolver entidades externas sin el endurecimiento adecuado, el contenido XML puede empujar al sistema a hacer cosas que el desarrollador nunca quiso habilitar, como:

- leer archivos locales
- resolver recursos remotos
- hacer requests de red
- consumir recursos de forma desmedida
- filtrar información del entorno
- afectar componentes internos del sistema

### Idea importante

XXE no es “el XML está mal escrito”.
XXE es un problema de **cómo el parser interpreta capacidades extra del formato** y qué libertades deja habilitadas durante ese proceso.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que XML ya no importa porque la mayoría de APIs nuevas usan JSON
- creer que XXE solo afecta sistemas muy viejos
- no revisar librerías o componentes que internamente usan parsers XML
- asumir que parsear XML es una operación puramente local y pasiva
- no ver que el parser puede transformarse en una puerta de salida hacia archivos, red o recursos del entorno

Es decir:

> el problema no es solo “recibir XML”.  
> El problema es qué capacidades tiene el parser al procesarlo y qué confianza le estamos dando al documento para influir ese comportamiento.

---

## Error mental clásico

Un error muy común es este:

### “Nosotros casi no usamos XML, así que esto no debería afectarnos”

Eso es más optimista de lo que conviene.

Porque una aplicación puede no exponer un endpoint que diga claramente:
- “mandame XML”

y aun así seguir usando XML en lugares como:

- autenticación federada
- librerías de terceros
- importación de archivos
- SVG o formatos documentales
- transformaciones internas
- conectores empresariales
- conversión de documentos
- componentes heredados del ecosistema Java

### Idea importante

No hace falta que el producto “se sienta XML-heavy” para que XXE siga siendo relevante.

---

## Por qué XML sigue apareciendo en Java más de lo que parece

En el ecosistema Java esto importa todavía más por una razón práctica: históricamente Java tuvo muchísimo tooling, bibliotecas y estándares construidos alrededor de XML.

Eso deja una huella grande que todavía aparece en:

- APIs viejas y nuevas conviviendo
- stacks enterprise
- frameworks de seguridad
- documentos firmados
- transformaciones de plantillas
- librerías de serialización o validación
- parsers DOM, SAX, StAX y derivados
- configuraciones o formatos auxiliares

### Idea útil

Aunque el negocio hoy piense más en JSON, el runtime y las librerías pueden seguir hablando XML en varios rincones del sistema.

---

## XXE no es solo “leer /etc/passwd”

Esa imagen aparece mucho en ejemplos y demos.
Sirve para entender la idea básica, pero se queda corta si te quedás solo con eso.

Sí, uno de los impactos clásicos de XXE es la lectura de archivos locales.
Pero también puede haber otros efectos como:

- requests salientes inesperadas
- exfiltración indirecta de información
- SSRF
- consumo excesivo de recursos
- fallas de disponibilidad
- lectura de archivos de configuración
- exposición de secretos del runtime
- interacción no esperada con componentes internos

### Idea importante

XXE no es un truco puntual para leer un archivo famoso.
Es una categoría de riesgo donde el parser se convierte en ejecutor de decisiones que el documento no debería poder tomar con tanta libertad.

---

## Por qué XXE conecta tan bien con el bloque anterior

Este nuevo bloque empieza justo después del bloque de SSRF por una buena razón.

Porque XXE, en muchos casos, comparte una lógica parecida:

- el backend procesa input no confiable
- una librería toma decisiones más “activas” de lo que el equipo imaginaba
- el sistema termina tocando recursos del entorno
- la superficie real depende del runtime, del parser y de la configuración

### Idea útil

Si en SSRF aprendimos a desconfiar de features que dejan al backend salir a la red, en XXE vamos a desconfiar de parsers que dejan al documento empujar al sistema a resolver recursos externos o locales.

### Regla sana

Podés pensar a XXE como otra forma de recordar que:
- un formato de datos no siempre es tan pasivo como parece
- y un parser no siempre es tan “solo lector” como el equipo supone.

---

## Qué es una entidad, a nivel intuitivo

Sin meternos todavía en sintaxis específica, conviene quedarnos con una intuición simple.

Una **entidad** en XML es, a grandes rasgos, una forma de definir una referencia que luego puede expandirse o reemplazarse durante el parseo.

Eso puede ser útil para:

- reutilizar fragmentos
- estructurar documentos
- manejar ciertas abstracciones del formato

El problema aparece cuando esa capacidad se combina con entidades **externas**.

### ¿Qué implica “externa” en este contexto?

Que el parser no se limita a mirar el texto ya recibido, sino que puede intentar resolver algo fuera del documento mismo.

### Idea importante

Ahí es donde XML deja de parecer un archivo cerrado sobre sí mismo y empieza a depender de recursos que viven en otro lado.

---

## Por qué eso es peligroso

Porque si el parser resuelve recursos externos sin controles suficientes, el documento puede empujar al sistema a interactuar con cosas como:

- archivos locales
- rutas del filesystem
- recursos de red
- endpoints internos
- metadata del entorno
- otras fuentes disponibles desde el runtime

### Idea útil

El riesgo no está en que el documento “contenga más datos”.
Está en que el documento **dispare comportamiento** sobre recursos que no estaban pensados como parte del input.

---

## XXE es una cuestión de parser y configuración, no solo de formato

Esto conviene remarcarlo fuerte desde el principio.

No alcanza con decir:
- “hay XML, entonces hay XXE”

ni tampoco:
- “hay XML, pero seguro no pasa nada”

La pregunta correcta es:

- ¿qué parser está interviniendo?
- ¿cómo está configurado?
- ¿qué capacidades tiene habilitadas?
- ¿qué librería envuelve a qué otra?
- ¿quién controla el documento?
- ¿qué recursos puede alcanzar ese proceso?

### Idea importante

XXE no se entiende bien mirando solo el archivo.
Se entiende mirando:
- documento
- parser
- configuración
- runtime
- y entorno alcanzable.

---

## Qué hace que este problema sea especialmente traicionero

XXE es traicionero porque muchas veces aparece en lugares donde el equipo no siente que está abriendo una gran superficie de ataque.

Por ejemplo:

- “solo validamos un XML”
- “solo lo parseamos para extraer algunos campos”
- “solo convertimos este documento”
- “solo generamos una vista previa”
- “solo verificamos una firma o un descriptor”

### Problema

Ese “solo” es muy parecido al que vimos en SSRF.
Oculta que el parser puede tener mucho más poder del que el flujo de negocio necesita.

### Regla sana

Cada vez que un componente “solo parsea XML”, conviene preguntar:
- “¿y qué más puede intentar resolver o expandir durante ese parseo?”

---

## Qué clases de impacto conviene tener en mente desde ya

Sin entrar todavía en detalle técnico de explotación, es útil que desde esta introducción ya queden presentes cuatro familias de impacto:

### 1. Lectura local
El parser puede terminar leyendo archivos o rutas del entorno.

### 2. Salida de red
El parser puede resolver recursos externos y disparar requests inesperadas.

### 3. Exposición del entorno
Puede filtrarse información sobre el runtime, configuraciones o componentes cercanos.

### 4. Denegación de servicio
Un documento especialmente diseñado puede consumir recursos de forma desmedida.

### Idea importante

XXE no es una sola consecuencia.
Es una puerta hacia varias familias de problema según el parser, el contexto y el entorno.

---

## Por qué hoy sigue valiendo la pena estudiar XXE

Porque aunque algunas apps modernas toquen menos XML que antes, los costos de ignorarlo siguen siendo altos cuando aparece en lugares como:

- integraciones enterprise
- autenticación federada
- importación de documentos
- librerías que vienen “ya hechas”
- componentes heredados
- validadores o transformadores
- pipelines de procesamiento no tan visibles

### Idea útil

XXE es uno de esos temas donde la frecuencia puede parecer menor que hace años, pero el valor de entenderlo sigue siendo alto porque cuando aparece suele agarrar a equipos poco atentos y con demasiada confianza en el parser.

---

## No hace falta que el atacante “vea el XML” para que importe

Otro punto importante es que a veces la superficie no está dada por una API pública obvia, sino por flujos como:

- upload de un archivo
- importación de un documento
- procesamiento en background
- autenticación con documentos firmados
- librerías internas que convierten formatos
- servicios que aceptan SVG, XML o derivados como parte de otro feature

### Idea importante

La superficie real puede estar a varios pasos de donde el equipo “siente” que trabaja con XML.

---

## Qué preguntas conviene hacer desde el inicio del bloque

A partir de este punto, cuando veas XML en una aplicación Java, conviene empezar a preguntarte cosas como:

- ¿qué parser usa?
- ¿qué defaults trae?
- ¿qué capacidades de entidades externas están habilitadas?
- ¿qué proceso hace el parseo?
- ¿qué red o filesystem ve?
- ¿qué librerías de terceros envuelven este comportamiento?
- ¿quién controla el documento?
- ¿se parsea para leer, validar, transformar o convertir?
- ¿qué impacto tendría si ese parser resolviera recursos externos o locales?

### Regla sana

La forma más útil de arrancar el bloque es dejar de ver XML como “solo otro formato” y empezar a verlo como un formato que puede traer capacidades de resolución y expansión que no siempre conviene dejar activas.

---

## Qué revisar en una app Spring

En una app Spring o en el ecosistema Java más amplio, conviene sospechar especialmente cuando veas:

- procesamiento de XML recibido externamente
- soporte de SOAP
- SAML
- manejo de SVG
- uploads o imports documentales
- transformaciones XSLT
- parsers DOM, SAX o StAX usados sin claridad sobre su configuración
- librerías de terceros que internamente parsean XML
- workers o procesos con acceso a red, filesystem o metadata del entorno

### Idea útil

Si el documento XML entra a un proceso con bastante reachability o acceso local, XXE empieza a importar más, no menos.

---

## Qué cambia respecto del bloque anterior

Este bloque nuevo comparte espíritu con el anterior, pero ahora el punto de entrada ya no es:
- una URL
- un callback
- un preview
- una feature explícita de red

Ahora el punto de entrada suele ser:
- un documento
- un parser
- una librería
- un formato estructurado

### Idea importante

Lo que cambia es la superficie.
Lo que no cambia es la lección de fondo:
- no subestimar capacidades implícitas del runtime o del componente que procesa input no confiable.

---

## Señales de diseño sano al empezar este bloque

Un sistema más sano suele mostrar cosas como:

- parsers XML endurecidos
- claridad sobre qué componentes usan XML
- menos confianza en defaults de librería
- separación entre parseo, validación y transformación
- menos workers potentes procesando documentos no confiables
- mejor conciencia de que XML todavía existe aunque el negocio hable más de JSON

### Idea importante

La madurez acá empieza por reconocer dónde vive XML hoy en tu sistema.
No por asumir que “seguro casi no lo usamos”.

---

## Señales de ruido

Estas señales merecen revisión fuerte desde ya:

- “eso es legacy, no importa”
- “el parser lo maneja la librería”
- “solo convertimos el archivo”
- “solo usamos XML en una integración aislada”
- nadie sabe qué parser usa qué componente
- el equipo no sabe si hay entidades externas habilitadas
- uploads o documentos XML procesados por workers con mucho acceso a red o filesystem

### Regla sana

Si XML aparece y nadie puede explicar bien cómo se procesa, ya hay motivo suficiente para mirar más de cerca.

---

## Checklist práctica

Para arrancar este bloque, cuando veas XML en una app Spring, preguntate:

- ¿dónde entra el XML?
- ¿quién lo controla?
- ¿qué parser lo procesa?
- ¿cómo está configurado?
- ¿ese parser podría resolver recursos externos o locales?
- ¿qué proceso hace el parseo?
- ¿qué filesystem o red ve ese proceso?
- ¿qué librería de terceros participa?
- ¿qué clase de impacto tendría si el parser fuera demasiado permisivo?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Dónde hay XML hoy, aunque sea indirectamente?
2. ¿Qué librerías o features lo usan?
3. ¿Qué parser interviene?
4. ¿Ese parser fue configurado explícitamente o vive con defaults?
5. ¿Qué acceso a red o filesystem tiene el proceso que lo ejecuta?
6. ¿El equipo sería capaz de explicar rápido si hay riesgo de XXE?
7. ¿Qué componente mirarías primero después de este tema?

---

## Resumen

XXE sigue importando porque XML sigue estando presente más de lo que muchos equipos creen, especialmente en ecosistemas Java, integraciones empresariales, librerías heredadas y procesamiento documental.

El problema no es solo “usar XML”.
El problema es permitir que un parser con demasiadas capacidades procese input no confiable y termine resolviendo recursos externos o locales desde el contexto del backend.

En resumen:

> un backend más maduro no descarta XXE como una rareza vieja asociada a sistemas que ya nadie toca, sino que la entiende como una advertencia vigente sobre parsers demasiado poderosos y sobre la confianza excesiva que solemos depositar en componentes de procesamiento estructurado.  
> Y justamente por eso este bloque empieza acá: porque antes de aprender mitigaciones específicas conviene recuperar una intuición básica pero muy valiosa, que es que XML no siempre es solo un formato pasivo, y que cuando el sistema deja que el parser interprete más de la cuenta, lo que parecía un simple documento puede convertirse en una vía hacia archivos locales, red interna, metadata del entorno o consumo de recursos que la aplicación nunca quiso poner al alcance de ese input.

---

## Próximo tema

**DTD, entidades y resolución externa: intuición sin magia**
