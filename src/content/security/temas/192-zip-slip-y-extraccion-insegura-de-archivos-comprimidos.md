---
title: "Zip Slip y extracción insegura de archivos comprimidos"
description: "Cómo entender Zip Slip y la extracción insegura de archivos comprimidos en aplicaciones Java con Spring Boot. Por qué es una forma concreta de path traversal durante el desempaquetado y qué cambia cuando el nombre de una entrada del archivo comprimido termina influyendo rutas reales del filesystem."
order: 192
module: "Archivos, parsers y formatos activos más allá del upload básico"
level: "base"
draft: false
---

# Zip Slip y extracción insegura de archivos comprimidos

## Objetivo del tema

Entender qué es **Zip Slip** y por qué la **extracción insegura de archivos comprimidos** en aplicaciones Java + Spring Boot es, en el fondo, una forma muy concreta de **path traversal** dentro de procesos de desempaquetado.

La idea de este tema es continuar directamente lo que vimos en el tema anterior.

Ya entendimos que:

- el path traversal no se reduce a buscar `../`
- el problema real vive en la ruta efectiva que el sistema termina resolviendo
- los joins y la normalización no son una política de seguridad por sí solos
- y el input puede hablar demasiado el idioma del filesystem si el backend no controla bien el path final

Ahora toca ver una superficie donde esa lección aparece de manera muy práctica y muy frecuente:

- archivos comprimidos
- extracción de ZIPs
- desempaquetado automático
- procesos de importación
- jobs documentales
- pipelines que “desarman” archivos subidos o recibidos desde terceros

En esos flujos, el backend puede pensar que está haciendo algo rutinario:

- abrir el ZIP
- iterar entradas
- crear carpetas
- escribir archivos
- continuar con el procesamiento

Y ahí aparece el problema:

> si el sistema confía demasiado en el nombre de cada entrada del ZIP, ese nombre puede terminar comportándose como un path traversal dentro del propio proceso de extracción.

En resumen:

> Zip Slip importa porque demuestra que el riesgo no está solo en el archivo comprimido como contenedor,  
> sino en que cada entrada del archivo puede convertirse en una ruta real del filesystem si el backend la resuelve y la escribe sin verificar correctamente que quedó confinada dentro del directorio de extracción esperado.

---

## Idea clave

La idea central del tema es esta:

> **extraer un archivo comprimido también es construir rutas**.

Eso parece obvio, pero muchas veces no se modela así.

Porque el equipo piensa:

- “estoy desempaquetando”
- “estoy iterando entries”
- “estoy guardando contenido”

y no siempre activa la misma alerta mental que sí activaría si viera un endpoint que recibe un path directamente.

### Idea importante

Cada nombre de entrada dentro de un ZIP es, desde seguridad, un candidato a convertirse en un path real.

### Regla sana

Cuando desempaquetás, no estás solo leyendo archivos.
También estás dejando que nombres de entradas participen en la construcción de rutas sobre tu filesystem.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar Zip Slip como un bug especial de ZIP y no como traversal durante extracción
- confiar en que “el archivo comprimido ya viene armado”
- iterar entradas y escribirlas sin verificar el path final
- asumir que el directorio de extracción alcanza por sí solo
- no aplicar al desempaquetado la misma disciplina mental que al manejo directo de rutas
- tratar la librería de compresión como si resolviera mágicamente la seguridad del path

Es decir:

> el problema no es solo que un ZIP traiga muchos archivos.  
> El problema es que el nombre de cada entrada puede influir demasiado en dónde termina escribiendo el sistema cuando extrae.

---

## Error mental clásico

Un error muy común es este:

### “Como estamos extrayendo dentro de una carpeta temporal o de trabajo, todo debería quedar ahí adentro”

Eso puede ser cierto si el proceso está bien diseñado.
Pero no basta con asumirlo.

Porque todavía importan preguntas como:

- ¿cómo se arma el path final para cada entrada?
- ¿se normaliza?
- ¿se verifica después de resolverlo?
- ¿el nombre de la entrada puede salir del directorio esperado?
- ¿qué pasa con directorios anidados?
- ¿qué pasa si la entry ya viene con una ruta peligrosa?

### Idea importante

El directorio de extracción esperado no garantiza confinamiento si el nombre de la entrada sigue teniendo demasiado poder.

---

# Parte 1: Qué es Zip Slip, a nivel intuitivo

## La intuición simple

Zip Slip puede pensarse así:

> el backend toma el nombre de una entrada del archivo comprimido, la combina con un directorio de extracción, y termina escribiendo un archivo fuera de la zona prevista.

La lógica de fondo es la misma del traversal que ya vimos:

- hay una base esperada
- hay un input que participa en la ruta
- la resolución final queda mal controlada
- y el sistema toca un path que no debía

### Idea útil

Lo especial acá no es que sea “ZIP”.
Lo especial es que el traversal está escondido dentro de un flujo de extracción.

### Regla sana

Cada vez que desempaquetes, pensá:
- “cada entry es un input de path”

---

# Parte 2: Por qué esto no es solo “problema del formato ZIP”

El nombre Zip Slip es útil, pero puede confundir si parece algo demasiado específico del formato.

Porque la lógica de seguridad es más general:

- tenés un contenedor
- cada entrada trae un nombre
- ese nombre se usa para construir una ruta
- el backend escribe en disco
- y el confinamiento real depende de cómo se resuelve ese path

### Idea importante

La lección útil no es “cuidado con ZIP”.
La lección útil es:
- “cuidado con cualquier extracción donde el nombre de entrada decide demasiado del path final”.

### Regla sana

No estudies Zip Slip como curiosidad histórica.
Estudialo como un caso muy concreto de traversal durante extracción.

---

# Parte 3: Por qué esta superficie engaña tanto

Engaña porque el equipo suele pensar en el ZIP como:

- archivo
- paquete
- contenedor
- lote de documentos
- importación

y no como:

- un conjunto de paths que el backend va a resolver y escribir

### Idea útil

Eso hace que la revisión se concentre en cosas como:

- tamaño del archivo
- cantidad de entries
- malware
- formato válido
- virus
- contenido permitido

y deje un poco de lado la pregunta crítica:
- “¿dónde va a escribir cada entry?”

### Regla sana

Cuando extraigas, mirá cada nombre de entry como mirarías un path recibido desde el usuario.

---

# Parte 4: El join vuelve a ser el corazón del problema

Esto conecta de forma directa con el tema 191.

En extracción insegura, casi siempre aparece una operación conceptual como esta:

- tengo un directorio de destino
- tomo el nombre de la entry
- los uno
- y escribo el archivo

Esa operación parece trivial.
Pero ahí mismo vive la frontera crítica.

### Idea importante

El join entre:
- directorio de extracción
y
- nombre de entrada  
es exactamente el punto donde el traversal puede ganar o perder.

### Regla sana

La extracción segura no consiste solo en “descomprimir bien”.
Consiste también en **resolver bien el path final de cada entry**.

---

# Parte 5: El problema real no es la string rara, sino la ruta resuelta

Igual que en traversal común, no alcanza con pensar:
- “si veo algo raro en el nombre, lo bloqueo”

Eso puede ayudar un poco.
Pero el control fuerte sigue estando en otra parte:

- resolver contra la base
- normalizar
- verificar que el path final siga dentro del directorio permitido
- y recién ahí escribir

### Idea útil

La pregunta importante no es:
- “¿el nombre de la entry me gusta?”
Sino:
- “¿dónde termina apuntando realmente después de resolverlo?”

### Regla sana

Nunca escribas al filesystem a partir del nombre de una entry sin revisar el path final ya resuelto.

---

# Parte 6: El directorio temporal no te salva solo

Otra falsa tranquilidad muy común es esta:

- “extraemos en `/tmp`”
- “extraemos en una carpeta temporal”
- “extraemos en una carpeta por request”

Eso puede ayudar operativamente.
Pero no resuelve solo el problema.

Porque si el nombre de la entry sigue pudiendo escapar de esa base, el daño puede existir igual.

### Idea importante

La temporalidad del directorio no sustituye el confinamiento real del path.

### Regla sana

Una carpeta temporal puede reducir impacto en algunos escenarios.
No reemplaza verificar que cada entry quede efectivamente adentro.

---

# Parte 7: Qué daños puede generar una extracción insegura

Otra simplificación común es pensar solo en:
- “leer archivos”

Pero acá la operación dominante suele ser otra:
- **escritura**

Y eso amplía bastante el mapa de daño posible, por ejemplo:

- sobrescribir archivos
- dejar contenido donde no debía
- contaminar directorios de trabajo
- modificar archivos usados por procesos posteriores
- afectar templates, configs o assets
- preparar terreno para otros bugs del pipeline

### Idea importante

Zip Slip no es solo un problema de acceso indebido.
También puede ser un problema serio de **escritura indebida sobre el filesystem**.

### Regla sana

Cuando revises extracción, pensá en:
- “¿qué puede sobrescribirse o depositarse fuera de la zona esperada?”

---

# Parte 8: Por qué esto aparece mucho en importaciones y pipelines documentales

Esta superficie es muy común en:

- importación de paquetes
- templates empaquetadas
- reportes
- export/import de proyectos
- archivos subidos por usuarios
- adjuntos comprimidos
- herramientas administrativas
- jobs que descomprimen contenido antes de procesarlo

### Idea útil

Como el ZIP suele ser un paso intermedio del pipeline, el equipo a veces no lo mira con la misma atención que el controller o el parser final.

### Regla sana

Cada vez que un flujo “descomprime y luego procesa”, conviene auditar la extracción como frontera propia, no como simple paso técnico.

---

# Parte 9: Qué bypasses mentales aparecen acá

Zip Slip viene acompañado de varios bypasses mentales muy parecidos a los del traversal común:

### “Es una librería estándar, seguro ya está bien”
No alcanza.

### “Extraemos bajo una carpeta base”
No alcanza.

### “El nombre de la entry se ve normal”
No alcanza.

### “Después procesamos solo los archivos esperados”
El daño puede haber ocurrido antes, durante la escritura.

### “Esto es interno/administrativo”
No elimina la necesidad de modelar el path final.

### Idea importante

El problema no suele ser solo falta total de controles.
A veces es tener controles parciales y pensar que con eso ya se resolvió todo.

### Regla sana

Cada tranquilidad parcial debería llevar a la pregunta:
- “¿verificamos el confinamiento del path final o solo asumimos que quedó bien?”

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises extracción de ZIPs o archivos comprimidos, conviene preguntar:

- ¿qué API itera las entries?
- ¿cómo se construye el path final de cada una?
- ¿se usa el nombre de la entry como input de path?
- ¿se resuelve contra una base?
- ¿se normaliza?
- ¿se verifica el path final ya resuelto?
- ¿qué pasa si la entry intenta salir del directorio esperado?
- ¿qué operaciones posteriores dependen de lo extraído?

### Idea importante

La review buena no termina en “usa ZIP”.
Sigue hasta:
- “¿cómo se convierte cada nombre de entry en una ruta real del filesystem?”

---

# Parte 11: Qué señales indican una postura más sana

Una postura más sana suele mostrar:

- directorio de extracción explícito
- join controlado
- normalización antes de escribir
- verificación del path final ya resuelto
- rechazo de entries que salen de la base
- menos confianza en checks superficiales sobre el nombre
- reviewers que entienden que cada entry es una frontera de path

### Regla sana

La madurez aquí se nota cuando el sistema trata cada entry como input de filesystem y no solo como “otro archivo dentro del ZIP”.

---

# Parte 12: Qué señales indican una postura floja

Estas señales merecen revisión fuerte:

- usar el nombre de la entry casi directo para escribir
- concatenación simple con carpeta base
- ausencia de verificación del path final
- confianza excesiva en que la carpeta temporal alcanza
- revisión centrada solo en tamaño o tipo de archivo
- la extracción ocurre “antes de lo importante”, así que nadie la audita bien
- el equipo modela ZIP como contenedor y no como conjunto de paths

### Idea importante

Una postura floja no siempre es “extraer todo sin pensar”.
A veces es extraer con cierta prolijidad operativa, pero sin una política real de confinamiento por entry.

---

# Parte 13: Cómo reconocer esta superficie en una codebase Spring

En una app Spring o Java, conviene sospechar especialmente cuando veas:

- uploads de ZIP o formatos comprimidos
- jobs que descomprimen antes de analizar
- importadores de proyectos o paquetes
- herramientas administrativas que aceptan archivos comprimidos
- bucles sobre entries con escritura a disco
- directorios temporales de extracción
- pipelines documentales que empiezan con “unzip” y recién después validan

### Idea útil

En revisión real, muchas veces la extracción queda tan temprano en el pipeline que nadie la modela como parte central de la seguridad.
Y justo por eso conviene mirarla con más cuidado.

---

## Qué revisar en una app Spring

Cuando revises Zip Slip y extracción insegura en una aplicación Spring, mirá especialmente:

- qué flujos aceptan archivos comprimidos
- cómo se itera cada entry
- cómo se arma el path de salida
- si se normaliza y se verifica antes de escribir
- qué directorio se intenta proteger
- qué daño permitiría escribir fuera de él
- qué procesamiento posterior depende de lo extraído
- si el equipo trata la extracción como frontera de seguridad o solo como plumbing técnico

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- extracción a una base bien controlada
- validación por entry del path final
- poca confianza en checks textuales superficiales
- menor poder del nombre de la entry sobre el filesystem
- separación clara entre extraer y luego procesar
- reviewers que entienden Zip Slip como traversal durante escritura

### Idea importante

La madurez aquí se nota cuando el equipo no mira solo el contenido del ZIP, sino también cómo cada entry se convierte en path real.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- `new File(baseDir, entryName)` o equivalente sin verificación posterior suficiente
- confianza en la carpeta temporal como defensa principal
- ausencia de control por entry
- nombres de archivos usados casi directamente
- extracción previa a validaciones más serias
- foco excesivo en antivirus/tamaño y poco en rutas de salida
- ZIP tratado como simple contenedor neutro

### Regla sana

Si el sistema escribe entries a disco sin verificar cuidadosamente la ruta resuelta de cada una, probablemente sigue habiendo una forma concreta de traversal en el pipeline.

---

## Checklist práctica

Cuando revises extracción de archivos comprimidos, preguntate:

- ¿qué parte del nombre de la entry decide la ruta de salida?
- ¿cómo se hace el join con la base?
- ¿se normaliza?
- ¿se verifica el path final antes de escribir?
- ¿qué operaciones posteriores dependen de esos archivos?
- ¿qué puede sobrescribirse si el confinamiento falla?
- ¿qué control actual es real y cuál solo tranquilizador?

---

## Mini ejercicio de reflexión

Tomá un flujo real de importación o upload con ZIP en tu app Spring y respondé:

1. ¿Dónde se itera cada entry?
2. ¿Cómo se construye la ruta final?
3. ¿Qué verificación existe antes de escribir?
4. ¿Qué directorio o zona intenta proteger el sistema?
5. ¿Qué daño sería peor: sobrescritura, contaminación de working dir o preparación de otro bug?
6. ¿Qué parte del flujo se siente demasiado “rutinaria” y por eso se audita menos?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Zip Slip y la extracción insegura de archivos comprimidos importan porque muestran que el desempaquetado no es solo manejo de archivos, sino también resolución de rutas sobre el filesystem.

La gran intuición del tema es esta:

- cada entry trae un nombre
- ese nombre participa en la construcción del path de salida
- el directorio base no garantiza confinamiento por sí solo
- y la seguridad real depende de qué ruta final efectiva se termina escribiendo después de resolver y normalizar

En resumen:

> un backend más maduro no trata la extracción de ZIPs como una operación puramente mecánica ni como un detalle de infraestructura menor, sino como una frontera donde nombres de entries no confiables pueden convertirse en paths reales del filesystem si nadie verifica bien el resultado final.  
> Entiende que Zip Slip no es una rareza del formato, sino una forma muy concreta de path traversal durante la escritura, y que justamente por eso la pregunta más importante no es si el ZIP “parece válido”, sino dónde termina escribiendo de verdad cada una de sus entradas una vez que el sistema decide extraerlas.

---

## Próximo tema

**ZIP, TAR y archivos anidados: cuando el riesgo viene del desempaquetado**
