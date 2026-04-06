---
title: "Uploads XML y parseo de archivos: cuando el riesgo entra por documentos"
description: "Cómo pensar uploads XML y parseo de archivos en aplicaciones Java con Spring Boot como puerta de entrada para XXE. Por qué el riesgo no siempre llega por un endpoint XML explícito y qué cambia cuando un documento subido por terceros se parsea, valida, transforma o previsualiza."
order: 172
module: "XML, parsers y procesamiento inseguro de documentos"
level: "base"
draft: false
---

# Uploads XML y parseo de archivos: cuando el riesgo entra por documentos

## Objetivo del tema

Entender por qué los **uploads de archivos** y el **parseo posterior de documentos** son una puerta de entrada muy importante para **XXE** en aplicaciones Java + Spring Boot.

La idea de este tema es seguir aterrizando el bloque en una superficie extremadamente común:

- el usuario sube un archivo
- el backend lo valida
- lo inspecciona
- lo convierte
- extrae metadata
- genera una preview
- o lo pasa a una librería de terceros

Y en ese momento aparece el verdadero riesgo:
no porque el endpoint diga “mandame XML”, sino porque el archivo subido termina activando un parser XML en alguna parte del flujo.

En resumen:

> en muchos sistemas, XXE no entra por una API que se presenta como “consumo de XML”, sino por un pipeline de archivos donde el documento parece pasivo, pero en realidad desencadena parseo, resolución o transformación sobre input controlado por terceros.

---

## Idea clave

La idea central del tema es esta:

> un archivo subido no es solo un blob que el backend guarda.  
> En cuanto el sistema lo parsea, lo valida, lo transforma o lo previsualiza, ese archivo se convierte en **input activo** para el parser o la librería que lo procesa.

Eso cambia completamente la lectura del riesgo.

Porque una cosa es:

- aceptar un archivo y almacenarlo

y otra muy distinta es:

- abrirlo
- interpretarlo
- construir estructuras a partir de él
- resolver referencias
- convertirlo
- extraer información
- o pasarlo por componentes que internamente usan XML

### Idea importante

El peligro no empieza necesariamente en el upload.
Empieza en el momento en que el backend decide **entender** el archivo y no solo conservarlo.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que un upload documental es una superficie meramente de storage
- creer que XXE solo aplica a endpoints XML explícitos
- no revisar el parseo posterior de archivos subidos
- tratar SVG, plantillas, metadatos o formatos documentales como si fueran “solo archivos”
- olvidar que una preview, conversión o validación puede activar un parser con demasiadas capacidades

Es decir:

> el problema no es solo permitir uploads.  
> El problema es qué hace el sistema con esos archivos después, qué componentes usa para interpretarlos y qué libertades conserva el parser durante esa interpretación.

---

## Error mental clásico

Un error muy común es este:

### “Esto es un upload de documento, no un endpoint XML”

Eso suele sonar razonable, pero puede esconder justo el punto crítico.

Porque el riesgo no depende tanto de cómo describís la feature en producto, sino de si el backend termina haciendo cosas como:

- parsear el contenido
- validar su estructura
- extraer campos
- inspeccionar metadatos
- renderizar una preview
- convertir el formato
- pasar el archivo a una librería XML por debajo

### Idea importante

El nombre del feature puede sonar documental, gráfico o administrativo.
La superficie sigue siendo XML si el pipeline activa un parser sobre input no confiable.

---

# Parte 1: El upload es solo la puerta; el parseo es el verdadero salto de riesgo

## Qué cambia entre guardar y procesar

Esta distinción conviene dejarla clarísima.

### Guardar
significa algo como:
- recibir bytes
- almacenarlos
- quizá asociarlos a un registro
- sin interpretarlos demasiado

### Procesar
significa:
- abrir el archivo
- leerlo estructuralmente
- validar contenido
- construir objetos
- generar output derivado
- o llamar a una dependencia que lo hace

### Idea útil

Mientras el archivo está solo guardado, hay un riesgo.
Pero cuando el sistema lo procesa, el riesgo cambia de nivel porque el input empieza a influir directamente el comportamiento del parser.

### Regla sana

En seguridad documental, el momento decisivo no es siempre el upload.
Es el primer parseo significativo que ocurre después.

---

# Parte 2: Qué tipos de flujos suelen activar este riesgo

Hay muchos flujos aparentemente normales que pueden disparar XXE si el archivo o formato incluye XML o deriva en él.

Por ejemplo:

- validación de estructura
- extracción de metadata
- render de preview
- conversión entre formatos
- indexación
- firma o verificación
- generación de thumbnails
- inspección de contenido
- importación de plantillas
- lectura de descriptors o manifests

### Idea importante

El riesgo no depende solo del archivo original.
Depende también del pipeline de procesamiento que el equipo le enchufa después.

---

# Parte 3: Archivos que se sienten “inertes” pero pueden no serlo

Este tema conecta directo con el anterior.

Hay muchos archivos que el negocio describe como:

- imagen
- documento
- template
- asset
- importación
- configuración
- metadata

pero que, en la práctica, pueden activar parseo XML en alguna capa.

### Casos típicos
- SVG
- algunos documentos ofimáticos o contenedores
- formatos firmados
- archivos estructurados de integración
- plantillas complejas
- manifiestos o descriptores
- paquetes que incluyen partes XML internamente

### Idea útil

El archivo no tiene que llamarse “.xml” para convertirse en superficie XXE.

### Regla sana

Cuando un archivo es estructurado y una librería lo interpreta, conviene preguntar si XML aparece en el camino aunque no sea obvio en el nombre del formato.

---

# Parte 4: Por qué los uploads son una superficie tan traicionera

Los uploads son traicioneros porque mezclan muchas cosas que hacen más difícil la revisión:

- entran por una feature de UX común
- pasan por storage
- suelen disparar workers o procesos async
- usan librerías grandes y opacas
- pueden incluir conversión o render
- a veces se procesan más de una vez
- el parser no siempre aparece en el código de negocio
- el equipo piensa más en tamaños, extensiones y malware que en XXE

### Idea importante

Como la conversación de seguridad en uploads suele girar en torno a:
- antivirus
- tamaño
- tipo MIME
- extensiones
- scanning

es fácil que el parseo XML quede fuera del radar, aunque sea una de las superficies más relevantes del pipeline.

---

# Parte 5: El riesgo muchas veces vive en el worker, no en el endpoint

Esto importa muchísimo.

El endpoint de upload puede ser relativamente simple:
- recibe
- almacena
- encola una tarea

Y luego el verdadero parseo ocurre en:

- un worker
- un job
- un servicio documental
- una dependencia de conversión
- un proceso de background

### Idea útil

Eso vuelve el análisis más difícil porque el equipo puede revisar el controller y no ver nada especialmente XML.

### Regla sana

Cuando haya uploads, siempre conviene seguir el archivo hasta el primer componente que realmente lo interpreta.

### Idea importante

XXE en uploads muchas veces es un problema del pipeline posterior, no del punto de entrada HTTP.

---

# Parte 6: Qué cambia si el worker tiene mucho poder

Este tema conecta con todo lo que vimos en SSRF y runtime.

Si el worker que procesa el archivo puede ver:

- filesystem rico
- red privada
- metadata cloud
- servicios internos
- rutas temporales
- secretos locales
- storage sensible

entonces el impacto potencial sube mucho.

### Idea importante

El archivo no trae el daño entero dentro de sí.
El daño aparece cuando el parser corre dentro de un proceso que le presta al documento demasiado alcance.

### Regla sana

No audites uploads XML solo por formato.
Auditálos también por:
- qué proceso los abre
- y qué puede ver ese proceso.

---

# Parte 7: Validar “tipo de archivo” no alcanza

Otro error muy común es pensar:

- “ya controlamos extensión”
- “ya validamos MIME”
- “ya sabemos qué archivo es”

Eso puede servir para higiene general, pero no agota el problema.

Porque incluso si el sistema confirma que el archivo “es del tipo esperado”, todavía quedan preguntas como:

- ¿qué parser lo va a leer?
- ¿cómo está configurado?
- ¿qué componentes XML internos puede activar?
- ¿qué hace el pipeline con ese archivo después?

### Idea importante

Validar el tipo del archivo no reemplaza validar la seguridad del parser que lo procesa.

### Regla sana

En uploads, la pregunta madura no es solo:
- “¿qué archivo es?”
sino también:
- “¿qué comportamiento dispara cuando el backend intenta entenderlo?”

---

# Parte 8: Preview y extracción de metadata: dos puntos especialmente peligrosos

Hay dos lugares donde esto aparece una y otra vez:

## Preview
Porque obliga al sistema a abrir, interpretar y derivar algo visible del archivo.

## Extracción de metadata
Porque parece una operación “ligera”, pero igual suele requerir parseo estructural.

### Idea útil

Ambas operaciones tienden a bajar la guardia del equipo porque suenan inocentes.
Pero son justamente de las más propensas a activar librerías XML detrás de escena.

### Regla sana

Cada vez que una feature promete “solo mostrar una preview” o “solo leer metadatos”, conviene preguntar qué parser o motor documental hace el trabajo real.

---

# Parte 9: Conversión y transformación: cuando el riesgo se vuelve opaco

Otra zona delicada aparece cuando el sistema:

- transforma formatos
- convierte documentos
- renderiza internamente
- genera otra salida derivada
- aplica una cadena de procesamiento

### Problema

Cuanto más larga es la cadena, más difícil se vuelve ver en qué punto exacto hubo parseo XML y con qué configuración.

### Idea importante

La opacidad del pipeline no reduce riesgo.
Solo lo vuelve más difícil de modelar.

### Regla sana

Cuando una dependencia “convierte” o “renderiza”, conviene preguntar qué formatos intermedios y qué parsers participan, aunque el código del negocio no los muestre.

---

# Parte 10: Archivos subidos por usuarios internos también importan

Otra confusión común es esta:

- “esto no lo sube cualquier usuario”
- “solo lo importa admin”
- “es una herramienta de backoffice”

Eso puede bajar exposición, pero no elimina el problema.

Porque si el pipeline sigue siendo:

- flexible
- opaco
- con parseo poderoso
- en un worker rico
- y con mala contención

entonces el riesgo sigue existiendo, aunque cambie el actor que mete el archivo.

### Idea importante

Control de acceso no reemplaza revisión del parser.

### Regla sana

Un flujo documental interno sigue mereciendo modelado fuerte si termina activando parseo XML sobre input no plenamente confiable.

---

# Parte 11: Qué preguntas conviene hacer en uploads XML o documentales

Cuando revises un flujo de upload, conviene preguntar:

- ¿qué formatos acepta?
- ¿cuáles de esos formatos pueden involucrar XML directa o indirectamente?
- ¿qué librería los parsea o convierte?
- ¿qué parser usa por debajo?
- ¿hay forma de endurecerlo?
- ¿qué proceso o worker hace ese parseo?
- ¿qué red y filesystem ve?
- ¿qué salida o errores produce el pipeline?
- ¿qué parte del riesgo está en el archivo y qué parte en el entorno?

### Idea importante

En uploads, la revisión buena no termina en el controller.
Empieza ahí, pero sigue hasta el parser real.

---

# Parte 12: Qué revisar primero cuando el pipeline es muy opaco

Si el flujo documental está muy abstraído y no tenés claridad total, un buen primer mapa suele ser este:

1. **Qué archivo entra**
2. **Qué componente lo abre primero**
3. **Qué dependencia lo interpreta**
4. **Qué proceso ejecuta eso**
5. **Qué capacidad XML o de resolución podría activarse**
6. **Qué impacto tendría en ese runtime**

### Regla sana

No hace falta entender toda la cadena a la perfección desde el minuto uno.
Hace falta ubicar rápido:
- el primer parseo real
- y el runtime donde ocurre.

---

# Parte 13: Qué señales rojas merecen revisión fuerte

Hay ciertos olores muy típicos:

- el equipo dice “solo es un upload”
- nadie sabe qué librería parsea el archivo
- preview o metadata se hacen en background sin mucha visibilidad
- el worker que procesa documentos tiene mucho acceso a red o filesystem
- SVG o documentos complejos se tratan como assets inertes
- el pipeline usa conversores viejos o heredados
- reviewers miran extensión y tamaño, pero no el parser

### Idea útil

En uploads, muchas veces el mayor olor no es el archivo.
Es la falta de claridad sobre quién lo interpreta realmente.

---

# Parte 14: Qué mitigaciones suelen mover más la aguja

Todavía no estamos en un tema específico de fixes, pero ya conviene entender algo:

en uploads XML o documentales suelen mover mucho la aguja cosas como:

- endurecer el parser o la dependencia que hace el parseo
- aislar el worker que procesa archivos
- reducir reachability de red y acceso al filesystem
- limitar budgets de tiempo y recursos
- no tratar previews y metadata como operaciones “gratis”
- revisar qué formatos realmente vale la pena aceptar

### Idea importante

Cuando el parser está escondido, a veces la mejor mitigación inicial no es solo configurar flags, sino también contener mejor el runtime que procesa esos documentos.

---

## Qué revisar en una app Spring

Cuando revises uploads XML y parseo de archivos en una aplicación Spring, mirá especialmente:

- qué formatos se aceptan
- qué features hacen preview, metadata, conversión o validación
- qué librerías procesan esos archivos
- qué workers o jobs lo hacen
- qué filesystem o red ve el proceso
- si el equipo identifica esos formatos como superficie XML o no
- qué tan opaco es el pipeline
- qué parte del riesgo se puede endurecer y qué parte conviene contener por arquitectura

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- claridad sobre qué archivo activa qué parser
- workers documentales más acotados
- menor reachability y menor acceso local en procesos que abren archivos de terceros
- revisión explícita de SVG, plantillas y formatos complejos
- menor dependencia en que el upload “parezca solo un archivo”
- mejor conciencia de que parsear documentos no es una operación pasiva

### Idea importante

La madurez acá se nota cuando el equipo deja de pensar en uploads solo como storage y empieza a pensarlos también como pipelines de interpretación.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “solo es un archivo”
- “solo hacemos preview”
- “solo extraemos metadata”
- nadie sabe qué parser usa la dependencia
- el parseo ocurre en un worker con demasiado poder
- XML aparece dentro de formatos que el equipo no modela como XML
- el pipeline documental es opaco y heredado
- la revisión se limita a MIME, extensión y tamaño

### Regla sana

Si un archivo subido se abre, se interpreta o se transforma, tratá ese flujo como superficie de parser hasta demostrar lo contrario.

---

## Checklist práctica

Cuando revises uploads y parseo de archivos, preguntate:

- ¿qué archivo entra realmente?
- ¿qué componente lo abre primero?
- ¿qué parser o librería lo interpreta?
- ¿ese formato puede involucrar XML?
- ¿qué worker o proceso hace el trabajo?
- ¿qué filesystem o red ve?
- ¿qué output o error produce el pipeline?
- ¿qué parte del riesgo viene del parser y cuál del runtime?

---

## Mini ejercicio de reflexión

Tomá un flujo de upload real de tu app Spring y respondé:

1. ¿Qué formatos acepta?
2. ¿Cuáles podrían involucrar XML directa o indirectamente?
3. ¿Qué dependencia los procesa?
4. ¿Qué worker o proceso hace ese trabajo?
5. ¿Qué acceso local o de red tiene ese proceso?
6. ¿Dónde está hoy la parte más opaca del pipeline?
7. ¿Qué mirarías primero después de este tema?

---

## Resumen

Los uploads XML y el parseo de archivos importan mucho para XXE porque el riesgo no siempre entra por un endpoint XML evidente, sino por documentos y formatos que el backend:

- valida
- inspecciona
- previsualiza
- transforma
- o pasa a librerías de terceros

El punto crítico no es solo el upload, sino el momento en que el archivo deja de ser un blob almacenado y se convierte en input activo para un parser o motor documental.

En resumen:

> un backend más maduro no se queda tranquilo con que una feature sea “solo de archivos” ni con que el punto de entrada no diga explícitamente XML, sino que sigue el recorrido del documento hasta el primer componente que realmente lo abre, lo interpreta o lo transforma.  
> Entiende que ahí es donde el archivo deja de ser algo pasivo y empieza a influir el comportamiento del sistema, y que si ese componente usa parsers XML o dependencias documentales demasiado permisivas dentro de un runtime con mucho alcance, entonces el riesgo de XXE ya no está en la teoría del formato, sino en una cadena muy real de parseo, librerías y contexto de ejecución que puede convertirse en lectura local, SSRF o consumo excesivo de recursos sin que el equipo lo haya modelado así al principio.

---

## Próximo tema

**Secure processing: qué promete y qué NO promete**
