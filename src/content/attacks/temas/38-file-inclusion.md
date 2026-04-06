---
title: "File Inclusion"
description: "Qué es File Inclusion, por qué ocurre, qué impacto puede tener sobre la aplicación y qué principios defensivos ayudan a evitar la inclusión de archivos o recursos no previstos."
order: 38
module: "Ataques clásicos a aplicaciones web"
level: "intro"
draft: false
---

# File Inclusion

En el tema anterior vimos **Path Traversal**, donde una aplicación podía terminar accediendo a rutas o archivos fuera del alcance previsto.

Ahora vamos a estudiar una familia muy relacionada, pero con una diferencia importante:  
**File Inclusion**.

La idea general es esta:

> una aplicación incluye, carga o interpreta un archivo o recurso dentro de su propia lógica, pero no controla correctamente qué archivo puede formar parte de ese proceso.

Eso puede volver mucho más grave el problema, porque ya no se trata solo de leer un recurso o apuntar a una ubicación del sistema, sino de hacer que la aplicación **incorpore contenido no previsto dentro de su funcionamiento**.

Por eso File Inclusion es tan importante de entender:  
muestra cómo una decisión insegura sobre qué archivo se usa puede afectar directamente:

- el contenido que muestra la aplicación
- la lógica que ejecuta
- la configuración que carga
- el contexto desde el cual construye una respuesta
- la frontera entre recursos confiables y no confiables

---

## Qué significa “incluir” un archivo

“Incluir” un archivo, en este contexto, significa que la aplicación toma contenido desde un archivo o recurso y lo incorpora dentro de su propio flujo de ejecución o de construcción de respuesta.

Eso puede ocurrir de distintas maneras, por ejemplo cuando la aplicación:

- carga una plantilla
- incorpora una vista
- reutiliza contenido desde un archivo
- toma configuración desde un recurso externo
- ensambla partes de una respuesta a partir de archivos
- delega parte de su lógica en módulos, páginas o componentes que se resuelven dinámicamente

La idea importante es esta:

> el archivo incluido no es solo algo que se “lee”; pasa a formar parte del comportamiento de la aplicación.

Eso es lo que diferencia a File Inclusion de otras vulnerabilidades más centradas en acceso o lectura simple de archivos.

---

## Qué es File Inclusion

Una vulnerabilidad de **File Inclusion** ocurre cuando una aplicación permite que una entrada externa influya indebidamente sobre qué archivo o recurso se incluye, carga o procesa dentro de su propia lógica.

La clave conceptual es esta:

- la aplicación quiere incluir un archivo legítimo y previsto
- pero la entrada externa puede desviar esa decisión
- el sistema termina incorporando algo que no debería formar parte del flujo

Dicho de forma simple:

> la aplicación pierde control sobre qué contenido considera parte válida de sí misma.

Eso puede afectar tanto la integridad funcional como la seguridad general del sistema.

---

## Por qué este problema es especialmente delicado

Es delicado porque el archivo incluido puede tener mucho peso en el comportamiento final de la aplicación.

Dependiendo del contexto, incluir un recurso no previsto puede significar:

- mostrar contenido equivocado
- alterar la estructura de una página
- cargar una plantilla no esperada
- incorporar configuración sensible
- mezclar lógica con recursos no confiables
- ampliar el alcance de otras fallas relacionadas con archivos o rutas

En algunos entornos, este tipo de problema puede escalar mucho más que un simple acceso a un archivo, porque la inclusión afecta la forma en que la aplicación arma o ejecuta parte de su propio flujo.

Por eso la pregunta de seguridad no es solo:

- ¿qué archivo puede leerse?

sino también:

- ¿qué archivo puede ser tratado como parte legítima de la aplicación?

---

## Por qué ocurre

File Inclusion suele aparecer cuando la aplicación decide dinámicamente qué archivo cargar y deja que una entrada externa influya demasiado sobre esa decisión.

A nivel conceptual, puede pasar cuando:

- se usa un parámetro para decidir qué archivo incluir
- se construye una ruta de inclusión con datos no confiables
- se asume que el valor recibido siempre apuntará a archivos previstos
- no se valida con suficiente rigor el conjunto permitido
- se confía en nombres de recursos sin una restricción fuerte
- se mezclan rutas internas con referencias controladas externamente

La raíz del problema vuelve a ser una idea ya conocida en el curso:

> la aplicación deja que el dato externo influya sobre una decisión estructural que debería mantener bajo control estricto.

---

## Diferencia entre File Inclusion y Path Traversal

Estos temas están muy relacionados, pero no son exactamente lo mismo.

### En Path Traversal
El problema principal es que una entrada externa desvíe la ruta hacia ubicaciones fuera del alcance autorizado.

### En File Inclusion
El problema principal es que la aplicación termine **incluyendo o cargando** un archivo no previsto dentro de su propia lógica o construcción de respuesta.

Podría resumirse así:

- **Path Traversal** pone el foco en el acceso indebido a ubicaciones del sistema de archivos
- **File Inclusion** pone el foco en que un archivo no previsto pase a formar parte del funcionamiento de la aplicación

A veces ambas cosas pueden estar conectadas.  
Pero conceptualmente conviene distinguirlas.

---

## Qué busca lograr un atacante con esta vulnerabilidad

El atacante puede tener distintos objetivos, según cómo use la aplicación los archivos incluidos.

### Alterar el contenido o la estructura de la respuesta

Si la aplicación incluye vistas, plantillas o fragmentos, un archivo no previsto puede cambiar el resultado final.

### Forzar a la aplicación a cargar recursos indebidos

Eso puede abrir acceso a contenido interno o provocar comportamientos no deseados.

### Aprovechar información sensible

Si el sistema termina incorporando archivos que contienen configuraciones o datos internos, el impacto puede ser importante.

### Escalar desde otras debilidades

Una debilidad en inclusión puede combinarse con problemas de rutas, archivos, configuración o contenido mal aislado.

La idea importante es esta:

> el atacante quiere decidir qué entra dentro del flujo interno de la aplicación, en lugar de dejar que lo decida solo el diseño legítimo.

---

## Dónde puede aparecer

File Inclusion suele estar asociado a funciones donde la aplicación carga recursos de forma dinámica.

### Plantillas y vistas

Cuando el sistema elige qué archivo de presentación usar según parámetros o contexto.

### Módulos o componentes

Cuando una parte del flujo depende de archivos auxiliares seleccionados de forma dinámica.

### Carga de contenido configurable

Cuando la aplicación arma respuestas o lógica a partir de recursos cuya selección no está bien limitada.

### Herramientas internas o heredadas

Paneles o funciones antiguas pueden resolver archivos de forma más flexible y menos segura.

### Sistemas con mucha composición dinámica

Cuanto más se apoye una aplicación en armar comportamiento a partir de archivos, más importante se vuelve controlar rigurosamente qué archivos son válidos.

---

## Qué impacto puede tener

El impacto depende de qué rol cumpla el archivo dentro de la aplicación y de qué tan sensible sea el entorno.

### Sobre confidencialidad

Puede exponer archivos o configuraciones que la aplicación no debería incorporar.

### Sobre integridad

Puede alterar cómo la aplicación construye respuestas o carga partes de su lógica.

### Sobre comportamiento interno

Puede cambiar qué recursos intervienen en el flujo normal del sistema.

### Sobre seguridad general

Puede ampliar el alcance de otras fallas, especialmente si la aplicación trata el archivo incluido como un componente confiable de sí misma.

Esto es lo que vuelve a File Inclusion especialmente peligroso:  
la aplicación puede terminar **confiando** en algo que no debería haber sido parte del flujo.

---

## Qué relación tiene con recursos confiables y no confiables

Este tema enseña una lección muy importante:

> no todo archivo accesible debería ser tratable como un archivo confiable para la lógica interna de la aplicación.

Una cosa es que un recurso exista.  
Otra muy distinta es que deba:

- ser cargado
- ser interpretado
- formar parte de una plantilla
- afectar el comportamiento interno
- ser incorporado en una respuesta

Si la aplicación no distingue con claridad entre recursos confiables y no confiables, el riesgo crece mucho.

---

## Ejemplo conceptual simple

Imaginá una aplicación que arma una vista según un parámetro y, para eso, elige qué archivo cargar desde el sistema.

Hasta ahí, eso podría ser legítimo.

Ahora imaginá que esa decisión depende demasiado de un valor externo y que la aplicación no restringe con suficiente rigor qué archivos pueden formar parte de ese proceso.

Entonces, la aplicación deja de decidir con precisión qué componente interno está usando.  
Empieza a depender de una referencia externa que puede desviarla.

Ese es el corazón de File Inclusion:

> la aplicación incorpora dentro de su lógica un archivo que nunca debió ser elegido desde ese contexto.

---

## Qué señales pueden sugerir este problema

Detectarlo no siempre es simple desde el uso cotidiano, pero algunas situaciones deberían hacer sospechar.

### Ejemplos conceptuales

- lógica que decide qué archivo cargar a partir de parámetros externos
- construcción dinámica de vistas o módulos sin lista estricta de opciones válidas
- uso de rutas o nombres de archivo controlados por entrada externa
- funciones que “eligen plantillas” o “cargan componentes” sin restricción fuerte
- revisión de código donde recursos internos dependen de valores poco controlados
- comportamientos extraños cuando cambia el archivo o recurso seleccionado

Muchas veces el hallazgo aparece durante revisión de diseño o código, no solo por síntomas visibles en producción.

---

## Por qué no se resuelve solo “filtrando strings”

Como en otras vulnerabilidades del curso, la defensa sólida no depende solamente de mirar si un valor contiene algo sospechoso.

La pregunta más importante no es:

- ¿qué texto me mandaron?

sino:

- ¿la aplicación tiene claramente definido qué archivos sí puede incluir?
- ¿esa decisión depende de una lista controlada o de una referencia externa demasiado flexible?
- ¿la ruta o el nombre final están realmente bajo control de la aplicación?

La raíz del problema no es un carácter puntual.  
La raíz es que la aplicación no fija con suficiente claridad el universo de archivos permitidos.

---

## Qué puede hacer una organización para prevenir este problema

Desde una mirada defensiva, algunas ideas clave son:

- evitar que entradas externas decidan directamente qué archivo incluir
- definir explícitamente qué recursos son válidos y cuáles no
- trabajar con listas permitidas en lugar de referencias abiertas
- separar con claridad contenido interno confiable de entradas no confiables
- revisar módulos dinámicos, vistas, plantillas y herramientas heredadas
- aplicar mínimo privilegio al proceso y al acceso a archivos
- tratar las decisiones de inclusión como parte crítica de la arquitectura, no como un detalle de implementación

La idea importante es que la aplicación debería elegir entre opciones seguras ya conocidas, no construir libremente una inclusión a partir de datos externos.

---

## Diferencia entre “usar un archivo” y “dejar decidir qué archivo usar”

Este matiz es clave.

No hay nada malo en que la aplicación use archivos, plantillas o recursos internos.

El problema aparece cuando la decisión sobre **qué archivo entra en el flujo** deja de estar firmemente controlada por el sistema.

Podría resumirse así:

- usar archivos es normal
- dejar que la entrada externa decida de forma insegura qué archivo se incorpora, no

Esa diferencia conceptual ayuda mucho a detectar este problema en revisiones de diseño.

---

## Error común: pensar que si la ruta parece “interna” ya está segura

No necesariamente.

Una ruta o referencia puede apuntar a algo interno y aun así estar controlada o influida de forma insegura por entrada externa.

La seguridad no depende de que el archivo “sea interno”, sino de que la aplicación controle realmente si corresponde incluirlo o no.

---

## Error común: creer que solo importa si el archivo contiene código

No siempre.

Claro que hay contextos donde el riesgo puede ser mayor si el archivo incluido tiene más capacidad de influir en el comportamiento del sistema.

Pero incluso sin pensar en eso, la inclusión insegura ya puede ser grave si altera:

- la estructura de la respuesta
- la carga de recursos
- la configuración
- la presentación de contenido
- la exposición de información interna

Por eso conviene ver File Inclusion como un problema de **confianza indebida en un archivo no previsto**, no solo como una cuestión ligada a “código ejecutable”.

---

## Idea clave del tema

File Inclusion ocurre cuando una aplicación permite que una entrada externa influya indebidamente sobre qué archivo o recurso se incluye dentro de su propio flujo, respuesta o lógica interna.

Este tema enseña que:

- no basta con controlar qué archivo puede leerse; también importa controlar qué archivo puede formar parte del funcionamiento de la aplicación
- la diferencia entre recurso existente y recurso confiable es fundamental
- la prevención depende de restringir fuertemente el conjunto permitido y de evitar decisiones de inclusión abiertas a datos externos

---

## Resumen

En este tema vimos que:

- File Inclusion es una vulnerabilidad donde la aplicación incluye o carga un archivo no previsto dentro de su lógica o construcción de respuesta
- se diferencia de Path Traversal porque el foco está en la inclusión, no solo en el acceso a la ruta
- puede afectar confidencialidad, integridad y comportamiento interno de la aplicación
- la raíz del problema está en dejar que una entrada externa influya demasiado sobre qué archivo se incorpora
- la defensa requiere listas permitidas, control estricto del conjunto válido y separación clara entre recursos confiables y no confiables

---

## Ejercicio de reflexión

Pensá en una aplicación que:

- usa plantillas dinámicas
- carga vistas o módulos según contexto
- muestra distintos recursos según parámetros
- tiene panel administrativo
- incluye componentes auxiliares o heredados

Intentá responder:

1. ¿qué partes del sistema deciden qué archivo o recurso cargar?
2. ¿cuáles serían más delicadas si una entrada externa influyera sobre esa decisión?
3. ¿qué diferencia hay entre “archivo disponible” y “archivo autorizado para inclusión”?
4. ¿por qué una lista permitida es más segura que una referencia abierta?
5. ¿qué revisarías primero en una auditoría de este tema?

---

## Autoevaluación rápida

### 1. ¿Qué es File Inclusion?

Es una vulnerabilidad donde una aplicación permite que una entrada externa influya indebidamente sobre qué archivo o recurso se incluye dentro de su flujo interno o respuesta.

### 2. ¿En qué se diferencia de Path Traversal?

En que Path Traversal se centra en el acceso indebido a rutas, mientras que File Inclusion se centra en incorporar un archivo no previsto dentro de la lógica o presentación de la aplicación.

### 3. ¿Por qué puede ser grave?

Porque puede hacer que la aplicación confíe en recursos no previstos, alterando contenido, comportamiento interno o exposición de información.

### 4. ¿Qué defensa ayuda mucho a prevenirlo?

Definir explícitamente qué archivos son válidos, usar listas permitidas y evitar que entradas externas decidan libremente qué recurso se incluye.

---

## Próximo tema

En el siguiente tema vamos a estudiar el **Open Redirect**, una vulnerabilidad clásica donde la aplicación permite redirigir a las personas hacia destinos no previstos, debilitando la confianza en los flujos del sitio y facilitando engaños o cadenas de ataque.
