---
title: "Path Traversal"
description: "Qué es Path Traversal, por qué ocurre, qué impacto puede tener sobre archivos y recursos del sistema, y qué principios defensivos ayudan a evitar accesos fuera del alcance permitido."
order: 37
module: "Ataques clásicos a aplicaciones web"
level: "intro"
draft: false
---

# Path Traversal

En el tema anterior vimos **Command Injection**, donde una entrada externa podía influir indebidamente sobre un comando ejecutado por el sistema.

Ahora vamos a estudiar otra vulnerabilidad clásica, también muy relacionada con el entorno del servidor y con el sistema de archivos: **Path Traversal**.

La idea general es esta:

> una aplicación permite que una persona influya sobre la ruta o ubicación de un recurso en el sistema de archivos y, por una validación insuficiente, termina accediendo a ubicaciones fuera del alcance previsto.

Dicho de forma simple:

- la aplicación quería permitir acceso a ciertos archivos o recursos
- pero no controló bien qué ruta podía recorrerse
- entonces alguien consigue salir del directorio o contexto esperado
- y termina apuntando a otros archivos o ubicaciones del sistema

Por eso esta vulnerabilidad también se conoce muchas veces como **directory traversal**.

Es un tema muy importante porque muestra otra vez una idea central del curso:

> no alcanza con decidir “qué recurso quiero usar”; también hay que controlar con rigor desde dónde puede obtenerse realmente.

---

## Qué significa “path”

En este contexto, **path** significa **ruta** o **camino** dentro del sistema de archivos.

Una ruta sirve para ubicar algo como:

- un archivo
- un directorio
- un recurso almacenado
- una plantilla
- una imagen
- un documento
- un contenido auxiliar

Las aplicaciones suelen trabajar con rutas de distintas maneras.  
Por ejemplo, pueden necesitar:

- leer archivos
- servir contenido
- cargar recursos
- descargar documentos
- mostrar imágenes
- procesar plantillas
- acceder a archivos temporales o internos

Eso es normal.

El problema aparece cuando una persona externa puede influir sobre esa ruta y la aplicación no limita correctamente hasta dónde puede apuntar.

---

## Qué es Path Traversal

Una vulnerabilidad de **Path Traversal** ocurre cuando una aplicación permite que una entrada externa afecte la ubicación de un archivo o recurso y, por falta de control suficiente, termina accediendo a ubicaciones fuera del directorio o conjunto de archivos que debería estar permitido.

La idea clave es esta:

> el sistema esperaba un acceso dentro de un espacio controlado, pero la persona usuaria logra “salirse” de ese espacio.

Eso puede ocurrir en situaciones donde la aplicación:

- recibe nombres o rutas de archivos
- arma ubicaciones dinámicamente
- permite seleccionar recursos
- carga contenido desde el disco
- procesa recursos locales en base a una entrada

El problema no está en trabajar con archivos, sino en no imponer límites claros y fuertes sobre qué rutas son realmente válidas.

---

## Por qué este problema es peligroso

Es peligroso porque los archivos del sistema pueden incluir mucho más que contenido público o inocente.

Dependiendo del entorno, una aplicación podría terminar accediendo a:

- archivos internos
- configuraciones
- plantillas
- credenciales
- logs
- archivos temporales
- recursos del sistema
- documentos de otros usuarios
- información del entorno de ejecución

Eso puede comprometer:

- **confidencialidad**, si se leen archivos indebidos
- **integridad**, si la aplicación permite escritura o reemplazo en rutas no autorizadas
- **operación**, si se alteran recursos necesarios para el funcionamiento
- **seguridad general**, si esos archivos contienen datos sensibles o ayudan a otros ataques posteriores

El impacto depende mucho de qué permisos tenga la aplicación y de qué archivos estén al alcance del proceso.

---

## Qué busca lograr un atacante con Path Traversal

El objetivo varía según el contexto, pero conceptualmente un atacante puede intentar:

- leer archivos que no deberían estar disponibles
- acceder a contenido interno del sistema
- salir del directorio previsto por la aplicación
- alcanzar recursos sensibles o confidenciales
- descubrir estructura del entorno
- usar la información obtenida para preparar otros ataques

En algunos escenarios, si la aplicación también permite operaciones de escritura o reemplazo sobre rutas mal controladas, el impacto puede ser todavía mayor.

La idea importante es esta:

> el atacante busca romper el límite entre “los archivos que la aplicación quería exponer” y “los archivos que existen realmente en el entorno”.

---

## Por qué ocurre

Path Traversal suele aparecer cuando una aplicación recibe una entrada relacionada con archivos o rutas y la utiliza sin imponer controles suficientemente fuertes sobre el alcance real del acceso.

A nivel conceptual, puede pasar cuando:

- se toma un valor externo como parte de una ruta
- se arma una ubicación a partir de datos no confiables
- se valida solo superficialmente el nombre del archivo
- se asume que el usuario solo pedirá recursos “normales”
- se concatenan directorios base con entrada externa sin una restricción real del resultado final
- se confía en que el recurso quedará siempre dentro del espacio previsto

La raíz del problema es una vez más una falla de separación entre:

- lo que la aplicación quiere permitir
- y lo que la entrada externa termina señalando realmente

---

## Dónde puede aparecer

Este problema puede aparecer en muchas funciones relacionadas con archivos o recursos locales.

### Descarga de archivos

Por ejemplo, cuando una aplicación permite bajar documentos, reportes o adjuntos.

### Visualización de recursos

Como imágenes, PDFs, plantillas o contenido estático o semiestático.

### Carga de contenido dinámico desde disco

Por ejemplo, páginas, vistas, temas o archivos auxiliares.

### Herramientas internas o administrativas

Paneles de soporte, exportaciones, reportes o utilidades que trabajan con nombres de archivos.

### APIs relacionadas con almacenamiento

Cuando el sistema expone endpoints para recuperar o procesar recursos ubicados en el filesystem o en estructuras equivalentes.

No hace falta que el sistema permita “explorar carpetas” para que exista el problema.  
Alcanza con que una entrada externa termine influyendo de forma insegura sobre la ubicación final de un recurso.

---

## Qué diferencia hay entre un archivo permitido y un acceso inseguro

Este punto es muy importante.

No toda referencia a archivos es peligrosa.  
Muchas aplicaciones necesitan servir o procesar recursos legítimos.

La cuestión no es si existe acceso a archivos, sino si la aplicación controla realmente:

- qué base de archivos están permitidos
- qué ubicaciones quedan fuera de alcance
- qué nombre o referencia puede usarse
- cómo se resuelve la ruta final
- si el resultado sigue dentro del espacio autorizado

Podría resumirse así:

> trabajar con archivos es normal; perder control sobre la ruta efectiva no lo es.

---

## Relación con el sistema de archivos

Path Traversal enseña una lección muy importante sobre cómo una aplicación se relaciona con su entorno.

La aplicación no vive aislada.  
Corre dentro de un sistema que tiene:

- carpetas
- archivos
- configuraciones
- temporales
- recursos internos
- elementos del sistema operativo
- datos de otros módulos

Si una aplicación expone acceso a archivos sin aislar bien el alcance, entonces la persona atacante deja de interactuar solo con la lógica web y empieza a asomarse al entorno subyacente.

Eso vuelve a esta vulnerabilidad especialmente delicada.

---

## Qué impacto puede tener

El impacto depende de:

- qué archivos puede alcanzar la aplicación
- con qué permisos corre el proceso
- si el acceso es solo lectura o también escritura
- qué información contiene el entorno
- qué parte del sistema depende de esos archivos

### Sobre confidencialidad

Puede exponer:

- documentos internos
- archivos de configuración
- registros
- datos de otros usuarios
- detalles del entorno
- información sensible del sistema o de la aplicación

### Sobre integridad

Si el flujo permite escritura o reemplazo, podría afectar:

- archivos de trabajo
- configuraciones
- plantillas
- recursos compartidos
- contenido operativo

### Sobre disponibilidad

Puede dañar funcionamiento si el acceso indebido afecta recursos críticos o si el sistema procesa rutas no previstas que alteran su comportamiento.

### Sobre seguridad general

Los archivos alcanzados pueden servir como fuente de información valiosa para otros ataques posteriores.

---

## Ejemplo conceptual simple

Imaginá una aplicación que permite descargar un archivo desde un conjunto de documentos previstos.

Hasta ahí, eso es normal.

Ahora imaginá que la forma en que determina qué archivo entregar depende de una entrada que la persona usuaria puede influir y que la aplicación no limita correctamente al directorio autorizado.

Entonces la aplicación ya no está controlando realmente qué archivo se sirve.  
Está dejando que la ruta efectiva se desvíe fuera del espacio previsto.

Ese es el corazón de Path Traversal:

> el sistema quería apuntar a “un archivo de este conjunto”, pero termina accediendo a otra ubicación distinta y no autorizada.

---

## Qué señales pueden sugerir este problema

Detectarlo no siempre es trivial, pero algunas situaciones deberían hacer sospechar.

### Ejemplos conceptuales

- funciones que leen archivos según valores externos
- lógica que arma rutas dinámicamente a partir de parámetros
- endpoints de descarga o visualización sin control claro del alcance
- uso de nombres de archivos sin restricciones fuertes
- revisiones de código donde se concatena un directorio base con entrada del usuario
- comportamiento extraño cuando se piden recursos no esperados
- acceso a archivos que no encajan con la función visible de la aplicación

Muchas veces el hallazgo aparece en revisión de diseño o código, antes de que exista un incidente visible.

---

## Diferencia con Command Injection

Conviene distinguir bien ambos temas porque los dos tocan el entorno del sistema, pero no son lo mismo.

### En Command Injection
La entrada influye sobre una instrucción que el sistema ejecuta.

### En Path Traversal
La entrada influye sobre la ubicación de un archivo o recurso que la aplicación accede.

En ambos casos el atacante intenta romper límites entre:

- dato externo
- y operación sensible del entorno

Pero la superficie concreta cambia:

- en uno, el foco está en comandos
- en el otro, en rutas y recursos del sistema de archivos

---

## Por qué no se resuelve solo “bloqueando ciertos caracteres”

Como en otras familias de vulnerabilidades, ese enfoque suele ser insuficiente.

La defensa sólida no debería depender únicamente de “detectar algo raro” en el input, sino de diseñar la lógica de acceso a archivos de forma que:

- el conjunto permitido esté claramente definido
- la ruta final no pueda escapar del espacio previsto
- la aplicación no dependa de la buena voluntad de la entrada
- el entorno tenga permisos mínimos

La raíz del problema no es un carácter aislado.  
La raíz es que el sistema no controla con suficiente rigor qué ubicación final está aceptando realmente.

---

## Qué puede hacer una organización para prevenir este problema

Desde una mirada defensiva, algunas ideas clave son:

- evitar que la persona usuaria influya directamente sobre rutas del sistema sin controles fuertes
- definir claramente qué archivos o recursos pueden ser accesibles
- validar el acceso contra un conjunto permitido y no solo contra patrones superficiales
- revisar cuidadosamente flujos de descarga, visualización y carga de recursos
- aplicar mínimo privilegio al proceso y al entorno donde corre la aplicación
- aislar tanto como sea posible los recursos públicos de los internos o sensibles
- tratar el acceso a archivos como una decisión de seguridad, no solo como una operación técnica

La idea central es que la aplicación debería decidir **qué archivo está permitido**, no limitarse a aceptar una ruta y esperar que no apunte a algo indebido.

---

## Error común: pensar que si el archivo “existe” entonces puede servirse

No.

La existencia del archivo no implica autorización para acceder a él.

Este error conceptual se parece mucho a lo que vimos con IDOR:

- que el recurso exista no significa que deba estar al alcance de esa solicitud

En Path Traversal, el sistema puede caer en el error de servir cualquier archivo alcanzable solo porque la ruta resolvió correctamente, sin preguntarse si **debía** estar disponible.

---

## Error común: creer que este problema solo afecta funciones de descarga

No necesariamente.

Puede aparecer en cualquier flujo donde la aplicación:

- lea
- cargue
- visualice
- procese
- seleccione
- incluya

archivos o recursos basados en entradas externas.

Eso incluye:

- imágenes
- plantillas
- contenido auxiliar
- exportes
- reportes
- archivos temporales
- módulos internos

La descarga es solo una de las superficies posibles.

---

## Idea clave del tema

Path Traversal ocurre cuando una aplicación permite que una entrada externa influya indebidamente sobre la ruta de un archivo o recurso y termina accediendo a ubicaciones fuera del alcance permitido.

Este tema enseña que:

- el problema no es trabajar con archivos, sino perder control sobre la ruta efectiva
- la aplicación debe decidir claramente qué recursos están permitidos
- el impacto puede alcanzar archivos internos, configuraciones y otros recursos sensibles
- la prevención depende de diseño seguro, restricción fuerte del alcance y mínimo privilegio

---

## Resumen

En este tema vimos que:

- Path Traversal es una vulnerabilidad de acceso inseguro a archivos o rutas
- aparece cuando la entrada externa puede desviar la ubicación del recurso fuera del espacio previsto
- puede comprometer confidencialidad, integridad, disponibilidad y seguridad general
- no se limita a descargas: también puede afectar visualización, carga y procesamiento de recursos
- la raíz del problema está en no controlar bien la ruta final y el alcance permitido
- la defensa requiere restricción fuerte del conjunto accesible y tratamiento cuidadoso del acceso a archivos

---

## Ejercicio de reflexión

Pensá en una aplicación que:

- permite descargar documentos
- muestra imágenes
- carga plantillas
- genera reportes
- usa archivos auxiliares
- tiene panel administrativo y módulos internos

Intentá responder:

1. ¿qué funciones interactúan con rutas o archivos?
2. ¿cuáles serían más delicadas si una entrada externa pudiera influir sobre la ubicación final?
3. ¿qué diferencia hay entre “archivo existente” y “archivo permitido”?
4. ¿por qué mínimo privilegio reduce mucho el impacto?
5. ¿qué principio aplicarías para que la aplicación no dependa de rutas externas inseguras?

---

## Autoevaluación rápida

### 1. ¿Qué es Path Traversal?

Es una vulnerabilidad donde una entrada externa influye indebidamente sobre la ruta de un archivo o recurso y permite acceder a ubicaciones fuera del alcance permitido.

### 2. ¿Por qué puede ser grave?

Porque puede exponer archivos internos, configuraciones, documentos sensibles u otros recursos del sistema.

### 3. ¿Cuál es la raíz conceptual del problema?

La pérdida de control sobre la ruta efectiva y sobre el conjunto real de archivos que la aplicación permite alcanzar.

### 4. ¿Qué defensa ayuda mucho a prevenirlo?

Restringir con fuerza qué recursos pueden accederse, tratar las rutas como una superficie sensible y aplicar mínimo privilegio en el entorno.

---

## Próximo tema

En el siguiente tema vamos a estudiar el **File Inclusion**, una familia relacionada con rutas y recursos, pero centrada en cómo una aplicación puede terminar incluyendo o cargando contenido no previsto dentro de su propia lógica si no controla bien el origen o la ubicación de los archivos.
