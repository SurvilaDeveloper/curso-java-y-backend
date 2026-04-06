---
title: "JAXB, unmarshalling y objetos: cuando XML ya viene envuelto en clases"
description: "Cómo pensar JAXB y el unmarshalling XML a objetos en aplicaciones Java con Spring Boot. Por qué el hecho de obtener clases de dominio no elimina la superficie XXE y qué cambia cuando el parser queda escondido detrás de una abstracción más cómoda."
order: 178
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# JAXB, unmarshalling y objetos: cuando XML ya viene envuelto en clases

## Objetivo del tema

Entender por qué **JAXB** y el proceso de **unmarshalling** siguen siendo relevantes para **XXE** y para el hardening XML en aplicaciones Java + Spring Boot, aunque el XML ya no se vea como texto ni como árbol, sino como **objetos Java**.

La idea de este tema es tocar una situación muy típica del ecosistema Java:

- el equipo no ve `DocumentBuilderFactory`
- no ve `SAXParserFactory`
- no ve `XMLInputFactory`
- no siente que está “parseando XML”
- solo ve algo como:
  - “deserializar”
  - “unmarshal”
  - “mapear a clases”
  - “obtener un objeto bonito y tipado”

Y eso puede bajar demasiado la guardia.

Porque, aunque el resultado final sea un objeto cómodo de usar, el XML no desapareció.
Lo que pasó es otra cosa:

> el parseo quedó oculto detrás de una abstracción más amigable.

En resumen:

> JAXB puede hacer que XML se sienta como clases de dominio y no como parseo estructurado,  
> pero esa comodidad no elimina la superficie XML; solo la vuelve menos visible para el equipo, y por eso mismo más fácil de subestimar.

---

## Idea clave

La idea central del tema es esta:

> **unmarshalling no reemplaza parseo**.  
> Lo presupone.

Es decir, para que un XML termine convertido en un objeto Java, antes tuvo que ocurrir algo como:

- lectura del documento
- interpretación de su estructura
- parseo con alguna infraestructura XML subyacente
- construcción de una representación interna suficiente
- mapeo de elementos, atributos o contenido hacia clases y campos

### Idea importante

El hecho de que el resultado final sea una clase de negocio no vuelve inocente al camino que llevó hasta ella.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que JAXB ya no entra en la conversación de XXE porque “esto no es parseo manual”
- confundir unmarshalling con deserialización segura por definición
- asumir que el mapeo a objetos reemplaza el hardening del parser
- no revisar qué infraestructura XML usa JAXB por debajo
- olvidar que el XML puede seguir trayendo DTD, entidades o complejidad innecesaria aunque el código consuma solo objetos

Es decir:

> el problema no es convertir XML a objetos.  
> El problema es olvidar que, antes de llegar a esos objetos, sigue existiendo una superficie XML completa con decisiones de parser, configuración y runtime que importan mucho para seguridad.

---

## Error mental clásico

Un error muy común es este:

### “Acá ya no tratamos con XML; JAXB nos da objetos”

Eso puede ser verdad desde la ergonomía del código.
Pero no desde la seguridad del flujo.

Porque todavía importan preguntas como:

- ¿qué parser participa debajo?
- ¿cómo está configurado?
- ¿se acepta `DOCTYPE`?
- ¿hay entidades externas?
- ¿qué parte del procesamiento XML ocurre antes del objeto final?
- ¿qué input controla el atacante o tercero?
- ¿qué runtime ejecuta el unmarshalling?

### Idea importante

El XML no dejó de existir.
Solo quedó escondido detrás de clases, annotations y APIs más cómodas.

---

# Parte 1: Qué es JAXB, a nivel intuitivo

## La intuición simple

JAXB suele usarse para mapear XML a objetos Java y viceversa.

Desde la experiencia del desarrollador, eso se siente así:

- defino clases
- marco campos o estructura
- hago unmarshal
- obtengo objetos
- trabajo con ellos como con cualquier otro modelo del sistema

### Idea útil

Eso es muy útil para productividad y legibilidad.
Pero justamente por eso puede esconder la parte incómoda:
- el XML tuvo que ser interpretado antes.

### Regla sana

Cuando veas JAXB, pensá:
- “estoy consumiendo objetos”
pero también:
- “hay un parser XML trabajando para producirlos”.

---

# Parte 2: Por qué JAXB baja la guardia del equipo

JAXB baja la guardia porque el código final se ve muy “de negocio”.

El reviewer o el developer ve:

- clases
- campos
- bindings
- annotations
- unmarshalling
- objetos tipados

Y eso se siente mucho menos amenazante que:

- factories
- flags XML
- DTD
- resolvers
- entidades externas

### Idea importante

Cuanto más alto es el nivel de abstracción, más fácil es que el equipo olvide la superficie técnica que quedó debajo.

### Regla sana

En seguridad, una API cómoda no debería hacerte olvidar el motor incómodo que la sostiene.

---

# Parte 3: Qué significa “unmarshal” desde seguridad

Desde negocio o desarrollo, “unmarshal” suele sonar a:
- convertir formato a objeto

Desde seguridad conviene pensarlo así:

> tomar input XML, parsearlo y confiar lo suficiente en su estructura como para materializarlo en objetos que luego el sistema tratará como datos ya interpretados.

Eso ya marca una frontera importante.

Porque el objeto resultante:
- puede parecer limpio
- puede parecer validado
- puede parecer de dominio

pero sigue viniendo de un parser que pudo haber aceptado más capacidades XML de las necesarias.

### Idea útil

El riesgo no desaparece porque el output sea elegante.

---

# Parte 4: Qué partes del problema siguen existiendo con JAXB

Aunque uses JAXB, siguen importando preguntas sobre:

- DTD
- entidades externas
- resolución externa
- complejidad XML innecesaria
- tamaño y costo del parseo
- librerías subyacentes
- defaults heredados
- runtime que hace el trabajo

### Idea importante

JAXB cambia el punto donde el equipo mira el XML.
No cambia automáticamente la superficie XML que hay que defender.

### Regla sana

Si el input no es plenamente confiable, JAXB sigue mereciendo la misma disciplina mental que cualquier otro parseo XML.

---

# Parte 5: JAXB y el problema de “objetos confiables por accidente”

Otro efecto traicionero es este:

una vez que el XML ya se convirtió en objeto, el sistema puede empezar a tratarlo como si fuera:

- estructura legítima
- datos ya depurados
- modelo interno razonable
- algo casi equivalente a input validado

### Problema

Eso mezcla dos cosas distintas:

- el éxito técnico del unmarshalling
- y la seguridad del parseo y del contenido que lo produjo

### Idea importante

Que JAXB pueda construir el objeto no significa que el camino hasta ese objeto haya sido seguro ni que la complejidad del input estuviera justificada.

### Regla sana

Objeto creado no equivale a flujo seguro.

---

# Parte 6: Dónde suele esconderse JAXB en apps reales

JAXB puede aparecer en cosas como:

- integraciones XML
- SOAP
- SAML en ciertas capas o bindings
- importación de documentos estructurados
- deserialización de payloads XML
- conectores enterprise
- librerías internas o heredadas
- frameworks que transforman XML a clases sin demasiada visibilidad

### Idea útil

Por eso, aunque el producto no diga “usamos JAXB”, puede seguir habiéndolo en varios rincones del sistema.

### Regla sana

Si ves XML convertido a clases con poco código visible de parseo, sospechá de unmarshaller o herramientas equivalentes debajo.

---

# Parte 7: Por qué JAXB puede esconder diferencias importantes de parser

Otra trampa es pensar que JAXB es “la” capa importante y que todo lo demás deja de importar.

Pero debajo sigue habiendo preguntas como:

- ¿qué fuente XML alimenta el unmarshaller?
- ¿qué parser o reader la interpreta?
- ¿cómo se creó?
- ¿qué configuración heredó?
- ¿hay `DOCTYPE`?
- ¿entidades externas?
- ¿secure processing?
- ¿resolvers?

### Idea importante

JAXB no reemplaza la discusión de factories o parsers.
Solo la mueve un poco más abajo en la pila.

### Regla sana

Cuando veas unmarshalling, preguntate siempre:
- “¿qué infraestructura XML real lo está alimentando?”

---

# Parte 8: JAXB y XXE: por qué siguen conectados

La conexión con XXE sigue siendo directa por una razón simple:

si el unmarshaller o el parser que lo alimenta aceptan más capacidad XML de la necesaria, el input puede seguir empujando al sistema hacia cosas como:

- lectura local
- resolución externa
- SSRF
- exposición del entorno
- complejidad innecesaria
- DoS por expansión

### Idea útil

El hecho de que el código consuma un objeto de dominio no cambia la raíz del problema:
- el documento tuvo demasiado poder sobre el parser.

### Regla sana

El mapa de impactos de XXE sigue vigente aunque el XML termine envuelto en clases bonitas.

---

# Parte 9: JAXB y DoS: un riesgo muy fácil de subestimar

Cuando el equipo ve solo objetos, puede olvidar por completo el costo de producirlos.

Pero antes del objeto, el sistema pudo haber hecho:

- parseo costoso
- expansión innecesaria
- construcción de estructuras grandes
- trabajo excesivo sobre input pequeño
- consumo de recursos en workers o requests

### Idea importante

En JAXB, el objeto final puede ocultar muy bien el costo operativo del parseo que hubo antes.

### Regla sana

No midas el riesgo XML solo por la simplicidad del objeto final.
Medilo también por el costo del camino hasta él.

---

# Parte 10: Qué preguntas conviene hacer cuando veas JAXB

Cuando veas JAXB o unmarshalling, conviene preguntar:

- ¿qué input XML llega hasta acá?
- ¿quién lo controla?
- ¿qué parser lo alimenta?
- ¿qué configuración XML tiene?
- ¿el flujo necesita DTD?
- ¿hay entidades externas habilitadas?
- ¿qué runtime hace este trabajo?
- ¿qué recursos puede ver?
- ¿el equipo está tratando el objeto final como más confiable de lo que debería?

### Idea útil

La calidad de estas respuestas suele separar muy bien un uso razonable de JAXB de una superficie XML opaca y subestimada.

---

# Parte 11: Qué señales indican un uso sano

Hay buenas señales cuando:

- el equipo sabe que JAXB sigue implicando parseo XML
- el parser subyacente está endurecido explícitamente
- `DOCTYPE` está fuera cuando no hace falta
- entidades externas están fuera
- el runtime que procesa ese XML está razonablemente contenido
- el objeto resultante no se trata como “confiable por nacimiento”
- reviewers pueden explicar dónde vive el riesgo aunque el código vea solo clases

### Idea importante

La madurez aquí se nota cuando el equipo entiende la pila completa:
- XML → parser → unmarshalling → objeto  
y no solo el último paso.

---

# Parte 12: Qué señales indican una postura floja

Estas señales merecen revisión fuerte:

- “esto ya son objetos, no XML”
- nadie sabe qué parser usa JAXB debajo
- el equipo asume seguridad por la comodidad de la API
- `DOCTYPE` o entidades externas nunca se revisaron
- el runtime sigue siendo poderoso y no entra en la conversación
- el objeto final se trata como si eso demostrara parseo seguro
- el flujo usa librerías heredadas y nadie revisó defaults

### Regla sana

Si JAXB tranquiliza demasiado al equipo, probablemente está escondiendo la parte importante del análisis.

---

# Parte 13: Qué revisar en una codebase Spring

En una app Spring o Java, conviene sospechar especialmente cuando veas:

- `JAXBContext`
- `Unmarshaller`
- clases con annotations JAXB
- mapeo XML→objeto en integraciones
- librerías de terceros que hacen binding automático
- unmarshalling en workers documentales o servicios enterprise
- poca claridad sobre qué parser alimenta el unmarshaller
- ningún hardening visible antes del paso a objetos

### Idea útil

En revisión real, muchas veces el riesgo no está en la clase anotada, sino varios niveles abajo, en cómo se parseó el XML antes de construirla.

---

## Qué revisar en una app Spring

Cuando revises JAXB y unmarshalling en una aplicación Spring, mirá especialmente:

- dónde se hace unmarshal
- qué input externo lo alimenta
- qué parser o source está debajo
- si hay hardening explícito antes del binding
- si `DOCTYPE` y entidades externas se revisaron
- qué runtime ejecuta el parseo
- qué uso posterior se da a los objetos resultantes
- si el equipo está confundiendo comodidad del binding con seguridad del parseo

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- parser endurecido antes del unmarshalling
- claridad sobre qué XML entra y de dónde viene
- menor confianza implícita en el objeto resultante
- reviewers capaces de explicar qué parte del riesgo XML sigue existiendo bajo JAXB
- menos magia entre input y objeto final
- runtimes más contenidos para flujos XML no confiables

### Idea importante

La madurez aquí se nota cuando JAXB deja de ser “la caja que convierte todo mágicamente” y pasa a ser una capa más de un flujo XML bien modelado.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- JAXB aparece y nadie habla de parser
- el objeto final se trata como prueba de seguridad
- no hay claridad sobre DTD o entidades externas
- el hardening vive en folklore o no vive
- el input es controlado por terceros y el equipo sigue pensando “esto solo deserializa”
- workers ricos hacen unmarshalling y nadie modela XXE o DoS

### Regla sana

Si el equipo habla de binding y clases pero no puede hablar del parser subyacente, todavía no tiene bien cerrada la superficie XML.

---

## Checklist práctica

Cuando veas JAXB o unmarshalling, preguntate:

- ¿de dónde sale el XML?
- ¿qué parser lo alimenta?
- ¿qué capacidad XML sigue viva?
- ¿`DOCTYPE` hace falta?
- ¿entidades externas están fuera?
- ¿qué runtime hace el parseo?
- ¿qué parte del riesgo queda escondida por la comodidad de trabajar con objetos?
- ¿el objeto final está recibiendo más confianza de la que debería?

---

## Mini ejercicio de reflexión

Tomá un flujo JAXB de tu app Spring y respondé:

1. ¿Qué input XML llega al unmarshaller?
2. ¿Quién lo controla?
3. ¿Qué parser o source alimenta ese unmarshalling?
4. ¿`DOCTYPE` sigue viva?
5. ¿Entidades externas siguen siendo una posibilidad?
6. ¿Qué worker o proceso hace el trabajo?
7. ¿Qué parte del riesgo estaba más escondida para vos antes de este tema?

---

## Resumen

JAXB y el unmarshalling siguen siendo parte de la superficie XXE porque convertir XML a objetos no elimina la necesidad de parsearlo con seguridad.

La gran trampa es que la abstracción a clases hace que el XML parezca desaparecer.
Pero debajo siguen importando:

- el parser
- la configuración
- DTD
- entidades externas
- complejidad innecesaria
- runtime
- y el costo de producir esos objetos

En resumen:

> un backend más maduro no deja que la comodidad de JAXB o del binding XML a objetos le tape la parte más importante del flujo, que es que el documento tuvo que pasar primero por un parser con capacidades concretas dentro de un runtime concreto.  
> Entiende que el hecho de terminar con clases tipadas no vuelve segura la cadena que las produjo, y por eso sigue preguntando qué XML llegó, cómo se parseó, qué se permitió durante ese parseo y qué parte del riesgo de XXE, SSRF o DoS podría seguir viva aunque el código de negocio ya solo vea objetos aparentemente tranquilos y bien formados.

---

## Próximo tema

**Transformers, XSLT y `Source`: otra superficie XML fácil de olvidar**
