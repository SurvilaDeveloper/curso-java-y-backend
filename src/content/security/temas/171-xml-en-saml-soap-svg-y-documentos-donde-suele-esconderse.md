---
title: "XML en SAML, SOAP, SVG y documentos: dónde suele esconderse"
description: "Cómo reconocer dónde suele esconderse XML en aplicaciones Java con Spring Boot, especialmente en SAML, SOAP, SVG y formatos documentales. Por qué XXE sigue importando aunque el equipo no sienta que trabaja directamente con XML."
order: 171
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# XML en SAML, SOAP, SVG y documentos: dónde suele esconderse

## Objetivo del tema

Entender **dónde suele esconderse XML** en aplicaciones Java + Spring Boot, especialmente en superficies como:

- **SAML**
- **SOAP**
- **SVG**
- **documentos y formatos derivados**

La idea de este tema es bajar a tierra una observación muy importante del bloque:

> muchos equipos creen que “ya casi no usan XML”, pero siguen procesándolo en varios flujos donde ya no lo perciben como XML, sino como autenticación, gráficos, interoperabilidad o documentos.

Eso importa muchísimo para **XXE**.

Porque si el equipo imagina XML solo como:

- un body explícito con `application/xml`
- un parser manual en una clase de utilidades
- o una integración vieja muy obvia

entonces se le van a escapar justo las superficies más traicioneras:
las que viven detrás de dependencias, protocolos o formatos que se sienten “de otra categoría”.

En resumen:

> XML sigue importando no solo cuando el producto “habla XML” de forma visible, sino también cuando usa estándares, librerías y formatos que internamente dependen de parsearlo aunque el equipo ya no piense activamente en eso.

---

## Idea clave

La idea central de este tema es esta:

> XXE suele esconderse mejor cuando XML llega envuelto en una abstracción más amigable o más de negocio.

Eso puede ser algo como:

- “login corporativo”
- “integración enterprise”
- “subida de logo en SVG”
- “firma digital”
- “conversión de documento”
- “importación de plantilla”
- “metadatos de un archivo”

En todos esos casos, el equipo puede sentir que está trabajando con:

- identidad
- interoperabilidad
- assets
- documentos
- validaciones
- renderizado

cuando, en el fondo, todavía hay un parser XML tomando decisiones que importan mucho para seguridad.

### Idea importante

La superficie XML no desaparece cuando cambia el nombre del feature.
Solo se vuelve más fácil de olvidar.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- asumir que XML solo entra por endpoints obviamente XML
- olvidar que SAML, SOAP o SVG siguen siendo XML o dependen de XML
- no revisar parsers escondidos dentro de librerías de identidad, gráficos o documentos
- tratar formatos documentales como si fueran solo archivos inertes
- no conectar XXE con flujos donde el equipo piensa en negocio, no en parseo

Es decir:

> el problema no es solo recibir “XML puro”.  
> El problema es recibir cualquier formato o protocolo que internamente haga que una dependencia XML procese input no confiable con más capacidades de las necesarias.

---

## Error mental clásico

Un error muy común es este:

### “Nosotros no usamos XML salvo alguna cosa aislada”

Esa frase suele sonar tranquilizadora, pero muchas veces significa algo así:

- sí usan SAML
- sí usan SOAP
- sí aceptan SVG
- sí convierten o validan documentos
- sí usan librerías empresariales que parsean XML
- solo que ya no piensan en todo eso como “trabajar con XML”

### Idea importante

No hace falta que el equipo ame XML para que XML siga siendo parte del sistema.

---

# Parte 1: XML en SAML

## Por qué SAML importa tanto

SAML es un caso muy importante porque suele aparecer en contextos como:

- SSO corporativo
- autenticación federada
- integraciones enterprise
- plataformas B2B
- login con proveedores de identidad

Y eso hace que el equipo piense primero en:

- sesiones
- tokens
- assertions
- firmas
- IdP y SP
- flujos de login

pero no siempre en:
- parseo XML

### Idea útil

SAML suele entrar al radar como seguridad de identidad.
Y, sin embargo, también trae superficie XML muy real.

---

## Por qué esto es traicionero

Porque el equipo puede sentir que la “seguridad ya está” en manos de una librería especializada.
Y eso baja el reflejo de revisar:

- cómo se parsea la respuesta SAML
- qué parser usa la librería
- si hay DTD o entidades
- qué configuración XML trae
- qué versión se usa
- qué runtime procesa ese material

### Idea importante

Cuanto más “alta” suena la abstracción del protocolo, más fácil es olvidar el parser que vive debajo.

---

## Qué conviene revisar en SAML

Cuando una app Spring usa SAML, conviene mirar:

- qué librería procesa assertions o metadata
- qué versión usa
- si documenta hardening XML
- si la librería permite endurecer factories o resolvers
- qué input externo llega al parser
- qué parte del flujo corre en procesos privilegiados o muy expuestos

### Regla sana

SAML merece doble atención porque mezcla:
- XML
- identidad
- librerías complejas
- y una gran tendencia cultural a asumir que “esto ya debe venir bien resuelto”.

---

# Parte 2: XML en SOAP

## Por qué SOAP sigue apareciendo

Aunque en muchos equipos el foco actual esté en REST o JSON, SOAP sigue existiendo bastante en:

- integraciones enterprise
- sistemas bancarios
- ERPs
- gobierno
- telecom
- salud
- conectores con terceros
- ecosistemas grandes con larga vida útil

### Idea útil

SOAP puede parecer “un tema viejo”, pero en muchos sistemas sigue siendo una puerta real a parseo XML de input externo.

---

## Qué lo vuelve importante para XXE

Porque el negocio suele verlo como:
- una integración ya definida por contrato

Pero desde seguridad sigue habiendo preguntas como:

- qué parser usa la librería SOAP
- cómo se configura
- qué DTD o entidades podrían seguir activas
- cuánto control tenés sobre factories o resolvers
- qué output o errores vuelven
- qué runtime hace el parseo

### Idea importante

Una integración enterprise madura no deja de ser superficie XXE por el hecho de usar un protocolo formal.

---

## Qué conviene revisar en SOAP

Cuando veas SOAP en una app Java/Spring, conviene preguntar:

- qué stack SOAP se usa
- cómo parsea XML
- qué defaults hereda
- si acepta configuración segura explícita
- si corre en procesos con mucho filesystem o red
- qué tanto confía el equipo en que “la librería ya lo maneja”

### Regla sana

Cada integración SOAP debería revisarse también como flujo XML, no solo como contrato de negocio.

---

# Parte 3: XML en SVG

## Por qué SVG entra en esta conversación

SVG muchas veces se percibe como:

- una imagen
- un asset gráfico
- un logo
- un archivo para renderizar
- algo “parecido a imagen”

Pero en realidad SVG es XML.

### Idea importante

Cuando la app acepta, analiza, renderiza, transforma o extrae cosas de un SVG, puede estar metiendo un parser XML en juego aunque el feature se sienta gráfico y no documental.

---

## Por qué esto engaña tanto a equipos web

Porque el desarrollador suele pensar:
- “es una imagen”
y no:
- “es una estructura XML con parser potencialmente peligroso”

Entonces bajan las defensas conceptuales que sí se activarían si el archivo se llamara claramente `.xml`.

### Idea útil

SVG es uno de los mejores ejemplos de cómo XML puede esconderse detrás de algo que el producto y el equipo describen con otro lenguaje.

---

## Qué conviene revisar en SVG

Si una app acepta SVG, conviene mirar:

- si lo parsea o inspecciona del lado backend
- si lo convierte
- si extrae metadata
- si genera thumbnails o previews
- qué librería usa para procesarlo
- qué parser hay debajo
- qué runtime hace ese trabajo
- qué tanto del archivo lo controla el usuario o un tercero

### Regla sana

Si el sistema trata SVG como “solo una imagen”, ya hay una buena chance de que subestime parte de la superficie XML involucrada.

---

# Parte 4: XML en documentos y formatos derivados

## La gran zona gris

Otra superficie muy importante aparece con:

- documentos ofimáticos
- plantillas
- archivos firmados
- formatos documentales complejos
- validadores o convertidores
- metadatos estructurados
- importadores y extractores

### Idea útil

No todos estos formatos son XML puro y plano, pero muchos pueden incluirlo, depender de él o activar componentes que lo parsean.

### Idea importante

Acá el riesgo se vuelve especialmente traicionero porque el equipo siente que está trabajando con “archivos” o “documentos”, no con parseo XML de input no confiable.

---

## Por qué esta zona importa tanto

Porque estos flujos suelen venir acompañados de cosas como:

- uploads
- workers
- conversión
- indexing
- extracción de texto
- renderizado
- validación
- almacenamiento temporal
- librerías de terceros grandes y opacas

Todo eso hace que el riesgo de parser se mezcle con:

- procesos privilegiados
- budgets generosos
- poca visibilidad
- y muchas capas de abstracción

### Regla sana

Cuanto más complejo y “documental” es el flujo, más conviene preguntar si hay XML escondido y cómo se procesa realmente.

---

# Parte 5: Dónde más se suele esconder XML sin que el equipo lo note

Además de SAML, SOAP, SVG y documentos, XML puede esconderse en lugares como:

- metadata de integraciones
- descriptors
- configuraciones importadas
- formatos internos de terceros
- reportes
- validadores
- transformaciones XSLT
- flujos de firma y verificación
- paquetes o contenedores que incluyen archivos XML internamente

### Idea útil

No hace falta memorizar una lista cerrada.
La pregunta buena es:
- “¿este formato o protocolo probablemente use XML por debajo?”

### Idea importante

Si la respuesta es “sí, probablemente”, entonces XXE ya merece aparecer en el mapa mental del flujo.

---

# Parte 6: Qué tienen en común todas estas superficies

Aunque parezcan cosas distintas, todas comparten un patrón:

- llega un input o formato estructurado
- una librería o parser lo interpreta
- el equipo piensa más en el negocio o en el renderizado que en XML
- y, si nadie lo endurece, el parser puede seguir teniendo capacidades que el flujo no necesita

### Regla sana

La familia completa se puede resumir así:
- XML escondido detrás de una abstracción útil.

### Idea importante

Y cuanto más útil o cotidiana parece la abstracción, más fácil es que el parser quede fuera del radar.

---

# Parte 7: Por qué esto complica la revisión

Cuando el endpoint o la clase no dicen claramente “parse XML”, la revisión se vuelve más difícil.

El reviewer ve:

- login SSO
- importación de documento
- render de imagen
- verificación de firma
- integración SOAP
- conversión de archivo

y puede no activar la checklist mental de XXE.

### Idea útil

En estos casos, la revisión madura necesita entrenarse para reconocer no solo nombres de clases, sino **familias de formato** y **dependencias** que tradicionalmente arrastran XML.

### Regla sana

No revises solo tecnologías visibles.
Revisá también los formatos y protocolos que traen parsers escondidos.

---

# Parte 8: Qué preguntas conviene hacer cuando XML no es obvio

Cuando la superficie XML está escondida detrás de otra abstracción, conviene preguntar:

- ¿este formato o protocolo usa XML internamente?
- ¿qué librería lo procesa?
- ¿qué parser usa por debajo?
- ¿qué input controla el actor externo?
- ¿puedo endurecer la configuración?
- ¿qué proceso hace el parseo?
- ¿qué red y filesystem ve?
- ¿qué output o errores produce el flujo?
- ¿qué tan opaco se volvió el parser para el equipo?

### Idea importante

La mejor defensa contra XML “escondido” es hacer visibles esas preguntas antes de que llegue un incidente.

---

# Parte 9: Qué revisar primero según el caso

## Si ves SAML
pensá primero en:
- librería de identidad
- parser interno
- config XML
- versiones y defaults

## Si ves SOAP
pensá primero en:
- stack SOAP
- factories o parsers subyacentes
- input externo
- endurecimiento del cliente/servidor SOAP

## Si ves SVG
pensá primero en:
- si el backend lo parsea o transforma
- qué librería usa
- qué capacidad XML queda viva
- qué runtime procesa el archivo

## Si ves documentos
pensá primero en:
- qué motor los convierte o analiza
- si incluyen XML o dependen de él
- qué worker o proceso lo ejecuta
- y cuánta opacidad trae la dependencia

### Regla sana

Cada familia cambia dónde mirar primero, pero no cambia la necesidad de preguntarte si hay un parser XML tomando decisiones por debajo.

---

# Parte 10: La gran lección del tema

La gran lección es muy simple:

> XML no siempre entra con un cartel que diga XML.

A veces entra como:

- login empresarial
- integración legacy
- imagen vectorial
- documento firmado
- archivo de plantilla
- metadata de un tercero

### Idea importante

Y por eso XXE sigue importando:
porque el riesgo ya no depende solo de si el equipo “usa XML explícitamente”, sino de si procesa formatos y protocolos que lo llevan adentro.

---

## Qué revisar en una app Spring

Cuando revises dónde suele esconderse XML en una app Spring, mirá especialmente:

- módulos de SAML o federación
- integraciones SOAP
- uploads o procesamiento de SVG
- librerías de documentos, conversión o validación
- componentes de firma o verificación
- dependencias que acepten formatos estructurados complejos
- workers que manejan archivos o metadata de terceros
- cualquier dependencia cuyo input “no parezca XML” pero pueda disparar parseo XML internamente

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- visibilidad sobre qué features dependen de XML
- menos sorpresa sobre parsers escondidos
- revisión de dependencias críticas de SAML, SOAP, SVG y documentos
- capacidad de endurecer o contener esos flujos
- menos confianza implícita en abstracciones de alto nivel
- mejor modelado de runtime para procesos que manejan formatos complejos

### Idea importante

La madurez acá se nota cuando el equipo puede nombrar dónde vive XML aunque el producto lo describa con otras palabras.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “no usamos XML”, pero sí hay SAML/SOAP/SVG/documentos complejos
- nadie sabe qué dependencia parsea por debajo
- el equipo no conecta esos flujos con XXE
- el parser vive dentro de librerías opacas y nadie las auditó
- workers con mucho poder procesan formatos complejos
- la revisión se queda en el negocio del feature y no mira el parser que arrastra

### Regla sana

Si el formato parece “otra cosa” pero internamente puede activar XML, tratá el flujo como superficie XML hasta probar lo contrario.

---

## Checklist práctica

Cuando veas SAML, SOAP, SVG o documentos en una app Spring, preguntate:

- ¿hay XML aquí, aunque no sea obvio?
- ¿qué librería lo parsea?
- ¿puedo configurarla o endurecerla?
- ¿qué input controla un tercero?
- ¿qué runtime ejecuta el parseo?
- ¿qué filesystem o red ve?
- ¿qué output o errores pueden volver?
- ¿qué parte del equipo todavía no está pensando este flujo como superficie XML?

---

## Mini ejercicio de reflexión

Tomá una feature real de tu app Spring y respondé:

1. ¿Es SAML, SOAP, SVG o un flujo documental?
2. ¿Qué parte usa XML por debajo?
3. ¿Qué librería lo procesa?
4. ¿El equipo lo modela hoy como superficie XXE o no?
5. ¿Qué proceso hace el parseo?
6. ¿Qué riesgo te preocupa más en ese contexto?
7. ¿Qué componente mirarías primero después de este tema?

---

## Resumen

XML suele esconderse en superficies que el equipo no siempre percibe como XML, especialmente en:

- SAML
- SOAP
- SVG
- documentos y formatos derivados

Eso vuelve a XXE una categoría todavía relevante porque el parser puede quedar enterrado detrás de:

- autenticación
- integraciones enterprise
- renderizado gráfico
- validación
- conversión documental
- librerías complejas de terceros

En resumen:

> un backend más maduro no espera ver un endpoint llamado “parseXML” para activar la revisión de XXE, sino que aprende a reconocer dónde XML sigue viviendo debajo de flujos que el producto y el equipo describen con otras palabras.  
> Y justamente por eso este tema importa tanto: porque ayuda a sacar a XML de ese rincón mental donde solo parecía existir como formato explícito y viejo, para volver a verlo donde realmente sigue importando hoy, que es dentro de protocolos, assets y documentos que siguen siendo muy comunes en sistemas Java y que, si se procesan con parsers demasiado permisivos o librerías poco revisadas, pueden abrir superficies de lectura local, SSRF o DoS sin que el equipo siquiera sienta que estaba “trabajando con XML” en primer lugar.

---

## Próximo tema

**Uploads XML y parseo de archivos: cuando el riesgo entra por documentos**
