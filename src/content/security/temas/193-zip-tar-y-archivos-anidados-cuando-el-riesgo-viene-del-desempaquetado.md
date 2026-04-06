---
title: "ZIP, TAR y archivos anidados: cuando el riesgo viene del desempaquetado"
description: "Cómo entender los riesgos de desempaquetar ZIP, TAR y archivos anidados en aplicaciones Java con Spring Boot. Por qué el problema no termina en Zip Slip y qué cambia cuando un paquete comprimido dispara escritura, recursividad, consumo de recursos y procesamiento posterior."
order: 193
module: "Archivos, parsers y formatos activos más allá del upload básico"
level: "base"
draft: false
---

# ZIP, TAR y archivos anidados: cuando el riesgo viene del desempaquetado

## Objetivo del tema

Entender por qué **ZIP, TAR y archivos anidados** son una superficie importante en aplicaciones Java + Spring Boot, y por qué el riesgo no termina en el caso clásico de **Zip Slip**, sino que se amplía cuando el backend:

- desempaqueta
- vuelve a desempaquetar
- recorre directorios creados dinámicamente
- procesa contenido extraído
- o permite que un archivo comprimido actúe como disparador de un pipeline mucho más grande

La idea de este tema es continuar directamente lo que vimos en el tema anterior.

Ya entendimos que:

- cada entry de un archivo comprimido puede comportarse como input de path
- extraer no es solo leer, también es escribir en filesystem
- Zip Slip es, en el fondo, una forma de path traversal durante la extracción
- y el directorio de destino no garantiza nada si no se verifica el path final de cada entry

Ahora toca ampliar la lente.

Porque en sistemas reales, un archivo comprimido no siempre es solo:

- un ZIP plano
- con unos pocos archivos
- que se extraen una sola vez
- y listo

Muy seguido aparece algo más complejo:

- TARs
- archivos anidados
- compresiones dentro de compresiones
- paquetes que contienen otros paquetes
- árboles muy grandes
- pipelines que extraen y luego siguen procesando

En resumen:

> cuando un backend desempaqueta ZIP, TAR o archivos anidados, el riesgo no vive solo en una entry maliciosa,  
> sino en que el archivo comprimido se convierte en un motor de escritura, expansión de superficie, consumo de recursos y procesamiento encadenado que puede superar por mucho lo que el equipo cree estar aceptando cuando ve “solo un paquete”.

---

## Idea clave

La idea central del tema es esta:

> desempaquetar no es una operación simple ni neutral.  
> Es una forma de permitir que un contenedor externo produzca **muchos paths, muchos archivos, mucha estructura y mucho trabajo interno** dentro del sistema.

Eso vuelve delicadas varias dimensiones a la vez:

- **filesystem**: dónde se escribe
- **cantidad**: cuánto se crea
- **profundidad**: cuánta estructura anidada aparece
- **recursividad**: cuántas veces se vuelve a desempaquetar
- **procesamiento posterior**: qué otros parsers o motores se activan después

### Idea importante

El archivo comprimido no es solo un formato.
Es un multiplicador de superficie.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que el único riesgo de desempaquetado es Zip Slip
- tratar ZIP y TAR como si fueran simples contenedores inertes
- no modelar extracción recursiva o anidada
- olvidar el impacto de cantidad de entries, profundidad o expansión de trabajo
- no revisar qué pasa después de la extracción
- no ver que el desempaquetado puede ser el primer paso de una cadena mucho más grande de riesgo

Es decir:

> el problema no es solo una ruta peligrosa.  
> El problema también es cuánto filesystem, cuánto trabajo y cuánto procesamiento posterior puede disparar un paquete comprimido.

---

## Error mental clásico

Un error muy común es este:

### “Si ya resolvimos Zip Slip, el desempaquetado debería estar bastante controlado”

Eso cubre una parte importante.
Pero no cubre todo.

Porque todavía quedan preguntas como:

- ¿cuántos archivos puede crear el paquete?
- ¿qué profundidad de directorios puede producir?
- ¿puede contener otros comprimidos?
- ¿cuántas veces el sistema vuelve a extraer?
- ¿qué parsers o jobs se activan sobre lo extraído?
- ¿qué recursos consume todo eso?
- ¿qué parte del pipeline se dispara automáticamente después?

### Idea importante

Cerrar traversal en la ruta de una entry no equivale a cerrar el riesgo total del desempaquetado.

---

# Parte 1: ZIP y TAR como generadores de estructura

## La intuición útil

Un ZIP o un TAR puede pensarse como una instrucción externa que le dice al sistema:

- creá este árbol
- en estas ubicaciones
- con estos nombres
- con esta profundidad
- con esta cantidad de archivos
- y con este contenido

### Idea importante

Eso significa que el archivo comprimido no solo transporta bytes.
También transporta una **propuesta de estructura** para tu filesystem temporal o de trabajo.

### Regla sana

Cada vez que desempaquetes, preguntate no solo:
- “¿qué contenido trae?”
sino también:
- “¿qué estructura está intentando imponer?”

---

# Parte 2: Por qué TAR merece la misma atención que ZIP

A veces el nombre Zip Slip hace que el equipo piense más en ZIP.
Pero conceptualmente el problema es más amplio.

Si el backend toma un contenedor archivado y:

- itera entradas
- construye paths
- crea directorios
- escribe archivos

entonces la familia de riesgo es muy parecida aunque cambie el formato concreto.

### Idea útil

La lección útil no es “el ZIP es peligroso”.
La lección útil es:
- “el desempaquetado es una operación poderosa sobre el filesystem”.

### Regla sana

Cuando cambie el formato, mantené la misma disciplina mental:
- cada entrada sigue siendo input de path y de estructura.

---

# Parte 3: El riesgo de archivos anidados

## Qué significa intuitivamente

Un archivo anidado es, por ejemplo, algo como:

- un ZIP que contiene otro ZIP
- un TAR que contiene otros paquetes
- una estructura donde, al extraer, aparecen nuevos contenedores que el sistema decide seguir abriendo

Eso puede parecer natural en algunos flujos de importación o herramientas administrativas.
Pero cambia muchísimo el riesgo.

### Idea importante

En ese momento el sistema deja de hacer una sola extracción y pasa a ejecutar un pipeline potencialmente recursivo o multiplicativo.

### Regla sana

Cada vez que el backend “extrae y luego vuelve a extraer”, la superficie crece muy rápido.

---

# Parte 4: Recursividad y expansión del trabajo

Esto conecta con las lecciones de DoS que ya vimos en otros bloques.

Porque aunque no haya traversal, el desempaquetado puede seguir siendo riesgoso si permite:

- muchísimas entries
- estructuras profundas
- contenedores anidados
- expansión muy grande respecto del archivo original
- trabajo repetido de escritura y lectura
- nuevos parsers activados sobre lo extraído

### Idea útil

El paquete no solo ocupa espacio.
También puede comprar muchísimo tiempo de CPU, IO y trabajo del pipeline.

### Regla sana

No midas un archivo comprimido solo por su tamaño de entrada.
Medilo también por lo que puede hacer crecer adentro.

---

# Parte 5: El pipeline posterior suele ser igual de importante

Otro error común es revisar solo la extracción y olvidarse de lo que viene después.

En muchísimos sistemas, después de desempaquetar, el backend hace cosas como:

- indexar archivos
- generar previews
- extraer metadata
- convertir formatos
- parsear XML, SVG o documentos
- leer manifests
- procesar scripts o plantillas
- recorrer directorios automáticamente

### Idea importante

Un archivo comprimido puede no ser el riesgo final.
Puede ser la **llave** que activa varios riesgos posteriores.

### Regla sana

No revises solo “cómo extraemos”.
Revisá también:
- “qué hacemos automáticamente con todo lo que aparece después de extraer”.

---

# Parte 6: El problema de la confianza implícita después de extraer

Esto pasa muchísimo.

Una vez que los archivos ya están en el working dir o en la carpeta temporal, el sistema empieza a tratarlos como si fueran:

- archivos normales
- archivos internos
- archivos ya “nuestros”
- material listo para seguir procesando

### Problema

Ese salto de confianza es peligrosísimo.

Porque lo extraído sigue viniendo, conceptualmente, del paquete original controlado por un tercero o por una fuente no totalmente confiable.

### Idea útil

La extracción no desinfecta el contenido.
Solo lo materializa en disco.

### Regla sana

Todo lo que aparezca tras desempaquetar debería conservar la etiqueta mental de “input no confiable” hasta que el diseño diga lo contrario con razones muy claras.

---

# Parte 7: Qué daños conviene imaginar además de traversal

Además de Zip Slip, conviene pensar en:

- sobrescritura de archivos dentro del árbol de trabajo
- creación masiva de archivos o directorios
- estructuras profundas que complican el recorrido
- consumo alto de espacio
- consumo alto de IO
- activación de parsers posteriores
- contaminación de directorios temporales
- interacción con jobs o procesos que miran esa carpeta
- dificultad operativa para limpiar o revertir

### Idea importante

El desempaquetado inseguro no es una sola familia de bug.
Es una familia de **ampliación de superficie**.

### Regla sana

Cuando audites extracción, pensá en:
- ruta,
- volumen,
- profundidad,
- y procesamiento posterior.

---

# Parte 8: Por qué esto aparece tanto en importaciones “normales”

Esta superficie es muy frecuente en cosas como:

- importación de proyectos
- backups y restores
- plantillas empaquetadas
- documentos ofimáticos o paquetes estructurados
- adjuntos administrativos
- integraciones con terceros
- datasets o catálogos comprimidos
- artefactos que un usuario o partner sube para “procesar”

### Idea útil

Como estas features suelen tener una justificación de negocio fuerte, el equipo a veces prioriza que el flujo funcione “con muchos formatos” y deja la revisión del desempaquetado demasiado superficial.

### Regla sana

Cuanto más flexible sea una importación basada en paquetes comprimidos, más merece modelado explícito del desempaquetado.

---

# Parte 9: Por qué “solo descomprimimos” es una frase peligrosa

Es una frase muy parecida a:

- “solo transformamos XML”
- “solo hacemos preview”
- “solo extraemos metadata”

Parece acotada, pero puede esconder muchísimo.

Porque “solo descomprimir” puede significar en realidad:

- crear cientos o miles de archivos
- alterar el working dir
- disparar más extracción
- preparar entrada para parsers posteriores
- consumir mucho más disco e IO de lo esperado
- activar jobs o recorridos automáticos

### Idea importante

La palabra “solo” suele ser un mal indicador de seguridad cuando hay desempaquetado de por medio.

### Regla sana

Cada vez que escuches “solo descomprimimos”, traducilo a:
- “¿qué estructura, qué paths y qué pipeline posterior estamos aceptando exactamente?”

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises ZIP, TAR o archivos anidados, conviene preguntar:

- ¿qué formatos se aceptan?
- ¿se extrae una sola vez o hay recursividad?
- ¿qué límites hay sobre cantidad de entries?
- ¿qué límites hay sobre profundidad de directorios?
- ¿qué controles hay sobre el path de cada entry?
- ¿qué pasa si aparecen otros archivos comprimidos adentro?
- ¿qué procesamiento posterior se activa automáticamente?
- ¿qué recursos puede consumir todo esto?

### Idea importante

La review madura no termina en traversal por entry.
Sigue también hacia:
- estructura total,
- recursividad,
- y consecuencias posteriores.

---

# Parte 11: Qué señales indican una postura más sana

Una postura más sana suele mostrar:

- formatos aceptados bien definidos
- extracción no recursiva salvo necesidad explícita
- límites de cantidad, profundidad y tamaño expandido
- verificación de path por entry
- separación clara entre extraer y luego procesar
- tratamiento de lo extraído como input no confiable
- reviewers que entienden el paquete como generador de estructura, no solo como archivo

### Regla sana

La madurez aquí se nota cuando el sistema controla no solo adónde escribe, sino también cuánto, qué tan profundo y qué hace después con lo escrito.

---

# Parte 12: Qué señales indican una postura floja

Estas señales merecen revisión fuerte:

- descompresión recursiva implícita
- ausencia de límites claros
- foco exclusivo en Zip Slip y nada más
- trust automático sobre lo extraído
- pipelines que procesan todo lo desempaquetado sin demasiadas preguntas
- “carpeta temporal” usada como defensa principal
- el equipo no sabe cuántos archivos o qué profundidad real puede producir un paquete

### Idea importante

Una postura floja no es solo escribir fuera del directorio.
También es dejar que un paquete haga crecer demasiado el trabajo o la superficie del sistema.

---

# Parte 13: Cómo reconocer esta superficie en una codebase Spring

En una app Spring o Java, conviene sospechar especialmente cuando veas:

- uploads de ZIP/TAR
- importadores de proyectos o paquetes
- jobs que “unpack and process”
- archivos comprimidos tratados como paso previo a parsing documental
- herramientas de restore
- bucles que detectan comprimidos y vuelven a abrirlos
- recorridos automáticos de directorios extraídos
- working dirs o carpetas temporales que luego otros componentes consumen

### Idea útil

En revisión real, la extracción suele ser el primer eslabón de una cadena.
Y muchas veces el equipo solo audita el eslabón final.

---

## Qué revisar en una app Spring

Cuando revises ZIP, TAR y archivos anidados en una aplicación Spring, mirá especialmente:

- qué formatos comprimidos se aceptan
- si la extracción puede ser recursiva
- cómo se controla el path de cada entry
- qué límites existen sobre cantidad y profundidad
- qué procesos corren después sobre lo extraído
- qué workers o jobs consumen esa carpeta
- qué daño operativo podría causar un paquete muy expansivo
- si el equipo sigue tratando lo extraído como input no confiable o si ya lo “internaliza” demasiado pronto

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- extracción bien delimitada
- no recursividad por default
- límites claros
- control de paths y volumen
- separación entre desempaquetar y procesar
- menor confianza en lo extraído
- reviewers que piensan en filesystem, recursos y pipeline posterior al mismo tiempo

### Idea importante

La madurez aquí se nota cuando el equipo deja de ver el paquete como contenedor y empieza a verlo como un productor de estructura, trabajo y superficie.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- extracción recursiva sin mucha explicación
- directorios temporales tratados como espacio seguro por sí mismo
- foco exclusivo en traversal y no en expansión de superficie
- ausencia de límites operativos
- procesamiento automático de todo lo desempaquetado
- poca claridad sobre qué puede aparecer dentro de lo extraído

### Regla sana

Si el sistema no sabe bien qué estructura, cuánto volumen y qué trabajo posterior puede generar un paquete comprimido, probablemente todavía está subestimando el desempaquetado.

---

## Checklist práctica

Cuando revises ZIP, TAR o archivos anidados, preguntate:

- ¿qué estructura puede producir este paquete?
- ¿cuántos archivos puede crear?
- ¿qué profundidad puede alcanzar?
- ¿puede contener otros comprimidos?
- ¿qué límites existen?
- ¿qué procesamiento posterior se activa?
- ¿lo extraído sigue tratándose como input no confiable?
- ¿qué parte del riesgo no está cubierta solo por cerrar Zip Slip?

---

## Mini ejercicio de reflexión

Tomá un flujo real de importación o procesamiento de paquetes en tu app Spring y respondé:

1. ¿Qué formatos comprimidos acepta?
2. ¿Puede haber recursividad o anidamiento?
3. ¿Qué límites hay hoy sobre cantidad y profundidad?
4. ¿Qué procesamiento posterior se dispara sobre lo extraído?
5. ¿Qué parte del flujo asume demasiada confianza después de descomprimir?
6. ¿Qué daño operativo sería más costoso acá: traversal, volumen o pipeline posterior?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

ZIP, TAR y archivos anidados importan porque el desempaquetado no solo extrae contenido: también materializa estructura, crea rutas, multiplica archivos, puede disparar recursividad y prepara terreno para mucho procesamiento posterior.

La gran intuición del tema es esta:

- un paquete comprimido es un generador de filesystem
- cada entry sigue siendo input de path
- el riesgo no termina en Zip Slip
- también importan cantidad, profundidad, recursividad y procesamiento posterior
- y lo extraído no debería recibir confianza automática solo por haber sido escrito a disco

En resumen:

> un backend más maduro no trata ZIP, TAR o paquetes anidados como simples contenedores operativos que se abren al principio del pipeline y se olvidan enseguida, sino como una frontera donde el sistema permite que un input externo proponga mucha estructura, mucho trabajo y mucha superficie posterior de procesamiento.  
> Entiende que la seguridad del desempaquetado no termina cuando cada entry queda dentro de una carpeta esperada, sino cuando además sabemos cuánto puede expandirse ese árbol, cuántas veces puede volver a abrirse, qué recursos consume y qué otros parsers, jobs o componentes van a empezar a confiar demasiado pronto en lo que acaba de aparecer dentro del working dir.

---

## Próximo tema

**Archivos que activan parsers: imágenes, SVG, documentos y metadata**
