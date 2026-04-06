---
title: "Path traversal en backends Java"
description: "Cómo aparece path traversal en una aplicación Java con Spring Boot al leer, guardar o servir archivos usando rutas o nombres influenciados por el usuario. Qué riesgos introduce, por qué normalizar no siempre alcanza y cómo pensar rutas, storage, nombres y autorización de forma más segura."
order: 86
module: "Archivos, serialización y procesamiento riesgoso"
level: "base"
draft: false
---

# Path traversal en backends Java

## Objetivo del tema

Entender cómo aparece **path traversal** en una aplicación Java + Spring Boot cuando el backend:

- recibe nombres de archivo
- arma rutas dinámicamente
- guarda uploads
- sirve descargas
- lee archivos desde disco
- genera paths temporales
- resuelve ubicaciones a partir de parámetros externos

La idea es revisar un error clásico que, aunque suene técnico y viejo, sigue apareciendo muchísimo en proyectos reales.

Porque muchas veces el equipo piensa algo así:

- “solo recibimos un nombre”
- “solo concatenamos una carpeta base”
- “solo buscamos un archivo del usuario”
- “solo devolvemos el recurso pedido”

Y en ese “solo” puede esconderse una falla grave.

En resumen:

> path traversal aparece cuando el usuario influye en una ruta o nombre de forma tal que el backend termina accediendo a archivos fuera del alcance que realmente quería permitir.

---

## Idea clave

El problema de path traversal no es solo “leer otro archivo”.

El problema de fondo es este:

> el backend quería operar dentro de un espacio acotado de archivos,  
> pero el input externo logra escapar de ese espacio.

Eso puede impactar operaciones como:

- lectura
- escritura
- descarga
- reemplazo
- borrado
- generación de temporales
- exposición de recursos
- sobreescritura de contenido

Entonces no es solo un tema de nombres raros o separadores.
Es un problema de **alcance real sobre el sistema de archivos o el storage**.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- concatenar nombres de archivo directamente con una carpeta base
- confiar en el nombre original de un upload
- asumir que normalizar el path ya resuelve todo
- permitir lecturas por nombre sin validar pertenencia o alcance
- servir archivos privados usando rutas construidas desde parámetros externos
- mezclar identificadores lógicos con paths reales del sistema
- escribir archivos en ubicaciones manipulables
- olvidar que el usuario puede intentar salir del directorio esperado
- usar `../` como única imagen mental del problema y no ver variantes más sutiles
- pensar el acceso a archivos solo como lookup técnico y no como un problema de autorización + ubicación

Es decir:

> el problema no es solo que una ruta sea “rara”.  
> El problema es perder el control sobre qué archivo real toca el backend.

---

## Error mental clásico

Un error muy común es este:

### “Como agregamos una carpeta base, el usuario ya no puede salir de ahí”

Eso es una falsa sensación de seguridad.

Por ejemplo, si hacés algo mentalmente equivalente a:

- carpeta base fija
- más nombre recibido del usuario
- más operación de lectura o guardado

todavía necesitás preguntarte:

- ¿ese nombre puede alterar el path final?
- ¿esa ruta resultante sigue dentro del directorio permitido?
- ¿ese archivo realmente pertenece al recurso del usuario?
- ¿estás mezclando un identificador lógico con una ruta física?

### Idea importante

Tener una carpeta base fija no basta si el fragmento variable sigue pudiendo cambiar qué archivo real se termina resolviendo.

---

## Qué es exactamente path traversal

Path traversal aparece cuando una entrada externa controla o influye en una ruta de modo tal que el backend accede a ubicaciones no previstas.

Eso puede implicar cosas como:

- salir del directorio esperado
- alcanzar archivos de otros usuarios
- leer archivos de configuración o del sistema
- sobrescribir recursos sensibles
- borrar o reemplazar cosas fuera del scope correcto
- servir contenido privado o interno

### Idea útil

No siempre hace falta imaginar un “ataque al sistema operativo” gigantesco.
A veces el problema ya es grave si alguien logra pasar de:

- “solo ver su archivo”
a
- “ver el archivo de otro usuario”
o
- “reemplazar un recurso ajeno”
o
- “leer algo fuera de su tenant”

---

## Dónde suele aparecer en un backend Spring

Lo vas a ver mucho en flujos como:

- descarga de comprobantes
- visualización de adjuntos
- uploads con nombre original conservado
- lectura de templates o archivos configurables
- exportaciones o reportes generados a disco
- almacenamiento de imágenes
- previews
- importaciones desde archivo
- endpoints que reciben `filename`, `path`, `resource`, `key` o parámetros parecidos

### Idea importante

No hace falta estar escribiendo una herramienta “de archivos” para caer en esto.
Basta con que el backend transforme input en ruta de forma poco controlada.

---

## El nombre original del archivo no es un path seguro

Este punto es central en uploads.

El nombre original que trae el cliente puede ser útil como metadata visual.
Pero no debería tratarse como si fuera:

- un nombre de storage confiable
- una parte segura del path
- un identificador físico del archivo
- una clave de ubicación sin riesgo

### Porque puede traer

- separadores
- secuencias extrañas
- nombres engañosos
- intentos de colisión
- intento de escapar de la carpeta objetivo
- información innecesaria del entorno del usuario

### Regla sana

El nombre original no debería controlar directamente dónde se guarda el archivo.

---

## Leer por filename es más peligroso de lo que parece

Supongamos un endpoint que recibe algo como:

- `GET /files?name=...`

y luego busca ese nombre en disco o en un storage local.

Eso parece cómodo.
Pero puede mezclar dos cosas que deberían estar separadas:

- el identificador lógico del recurso
- la ubicación física del archivo

### Problema

Si el usuario puede influir en el segundo, ya empezás a perder control de alcance.

### Idea útil

Un usuario debería pedir recursos por identificadores del dominio, no por paths del sistema.

---

## Path traversal no es solo `../`

Mucha gente asocia el problema únicamente con secuencias tipo:

- `../`

Eso ayuda a entender la idea, pero es insuficiente.

Porque el problema real no es una secuencia exacta.
El problema real es:

> que el path resuelto termine apuntando fuera del espacio permitido.

### Entonces conviene pensar más ampliamente en:

- separadores
- normalización
- rutas absolutas o relativas
- encoding
- nombres especiales
- combinaciones inesperadas
- comportamiento del sistema operativo o del storage

### Idea importante

Quedarte solo con “bloquear `../`” suele llevar a defensas pobres.

---

## Normalizar ayuda, pero no siempre alcanza

Otra mala simplificación frecuente es esta:

- “normalizamos el path”
- “entonces ya está”

Normalizar puede ser parte de una defensa útil.
Pero no reemplaza preguntas más importantes como:

- ¿qué entrada debería aceptarse realmente?
- ¿estás usando nombres físicos o IDs lógicos?
- ¿el path resuelto sigue dentro de la base esperada?
- ¿el archivo pertenece al actor o recurso correcto?
- ¿hay colisiones, aliases o referencias indirectas que cambian el alcance?

### Regla práctica

La normalización sirve para comparar y razonar mejor.
No convierte automáticamente en seguro un diseño flojo.

---

## Leer el archivo correcto no es solo un problema de path, también de autorización

Este punto es muy importante.

Supongamos que un usuario logra pedir un archivo de otro porque el sistema busca así:

- directorio general
- nombre recibido
- y si existe, lo devuelve

Aunque no haya “path traversal” clásico hacia el sistema operativo, ya hay un problema serio de alcance.

### Porque el backend olvidó algo clave

No alcanza con que el archivo exista.
Tiene que ser:

- el archivo correcto
- del recurso correcto
- del usuario correcto
- del tenant correcto
- en el contexto correcto

### Idea importante

Muchas veces path traversal se mezcla con IDOR y acceso horizontal.
No siempre son problemas separados.

---

## Escritura insegura también cuenta

Path traversal no es solo lectura.

También puede aparecer cuando el sistema:

- guarda un upload
- escribe un export
- crea un temporal
- reemplaza un archivo existente
- descomprime contenido
- genera un archivo a partir de input externo

### Riesgos

- sobrescribir archivos ajenos
- escribir fuera del directorio esperado
- reemplazar contenido importante
- dejar material en ubicaciones peligrosas
- mezclar archivos de distintos usuarios o tenants

### Idea útil

Toda operación que construye una ruta desde input merece revisión, no solo las descargas.

---

## Guardar por nombre visible suele ser mala idea

A veces el backend usa algo como:

- carpeta del módulo
- más nombre original del archivo
- más operación de guardado

Eso puede parecer amigable y práctico.
Pero suele introducir varios problemas a la vez:

- colisiones
- nombres peligrosos
- rutas manipulables
- fuga de información
- mezcla de concerns visuales con storage físico

### Regla sana

El nombre visible para el usuario y el identificador físico en storage no deberían ser la misma cosa por defecto.

---

## IDs lógicos mejor que rutas físicas

Una práctica mucho más sana suele ser esta:

- el usuario interactúa con un ID lógico del recurso
- el backend resuelve internamente dónde vive ese archivo
- el cliente no controla el path físico
- la autorización se evalúa sobre el recurso, no sobre la ruta

### Qué mejora eso

- menos exposición del layout de storage
- menos dependencia del nombre del archivo
- menos superficie para traversal
- menos acoplamiento entre API y filesystem
- mejor capacidad de mover el storage sin romper contratos

### Idea importante

Cuanto más directo es el control del cliente sobre rutas reales, más delicado se vuelve el diseño.

---

## Directorios base acotados

Otro principio útil es que toda operación de archivos debería nacer desde un directorio o ubicación base explícitamente acotada al caso de uso.

Por ejemplo, pensar en cosas separadas como:

- uploads públicos
- adjuntos privados
- temporales
- exportes
- procesamientos internos

### En vez de

usar un espacio general ambiguo donde todo cae junto.

### Idea útil

Menos amplitud en el espacio permitido significa menos superficie si algo sale mal.

---

## Públicos y privados no deberían resolverse igual

Un archivo que será público no tiene el mismo perfil de riesgo que uno que:

- pertenece a un usuario
- contiene evidencia
- está ligado a soporte
- es un documento interno
- solo debería ver un operador

Si ambos viven o se sirven con la misma lógica de path, el riesgo sube muchísimo.

### Regla sana

El modelo de acceso a archivos debería distinguir claramente:

- qué es público
- qué es privado
- qué requiere autorización contextual
- qué jamás debería exponerse por ruta directa

---

## Temporales y directorios auxiliares también importan

Muchos problemas nacen no en el storage final, sino en lugares como:

- directorios temporales
- staging folders
- carpetas de descompresión
- ubicaciones de conversión
- rutas intermedias para preview o procesamiento

### Porque ahí a veces el equipo baja la guardia

- “es temporal”
- “es solo interno”
- “luego se borra”

Y termina construyendo rutas con input demasiado directo o sin cleanup claro.

### Idea importante

Temporal no significa menos riesgoso.
Solo cambia el tipo de impacto.

---

## Logging y errores pueden empeorar el problema

Si además de tener un flujo de archivos poco controlado el backend:

- loguea paths reales
- imprime rutas internas
- devuelve mensajes técnicos
- expone `file not found` con demasiado detalle
- muestra estructura del directorio

entonces el atacante o usuario curioso aprende todavía más del sistema.

### Regla útil

La respuesta pública y el logging interno también forman parte del control sobre archivos.

---

## Storage externo no elimina el problema, solo lo cambia

Aunque no uses filesystem local, una idea parecida puede aparecer con:

- object storage
- claves de objetos
- prefijos
- buckets
- rutas lógicas
- keys generadas desde input externo

### Porque el problema de fondo sigue siendo el mismo

¿Puede el usuario influir en la ubicación real de algo más de lo que debería?

### Idea importante

No te quedes con la palabra “path” solo como carpeta del sistema operativo.
Pensá más ampliamente en cualquier mecanismo de ubicación o clave de almacenamiento.

---

## Qué suele tener sentido aceptar del cliente

En general, tiene más sentido que el cliente aporte cosas como:

- el archivo en sí
- un identificador lógico de recurso relacionado
- quizá un nombre visible controlado

y no cosas como:

- rutas
- subrutas
- nombres físicos de storage
- paths de descarga
- ubicaciones completas
- claves de objeto arbitrarias

### Regla sana

Cuanto menos se parezca el input del cliente a una ruta real del sistema, mejor.

---

## Qué conviene revisar en una implementación real

Cuando revises path traversal en una app Spring o Java, mirá especialmente:

- endpoints que reciben `filename`, `path`, `file`, `resource` o similares
- uso del nombre original del upload para guardar
- concatenación de strings para construir rutas
- distinción entre ID lógico y ubicación física
- directorios base compartidos o ambiguos
- separación entre contenido público y privado
- validación del path final resuelto
- autorización sobre el recurso asociado
- temporales y carpetas intermedias
- errores y logs que muestran demasiado del layout interno

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- menos control del cliente sobre ubicaciones físicas
- más uso de IDs lógicos
- storage resuelto internamente
- separación clara entre nombres visibles y nombres físicos
- directorios o espacios acotados por caso de uso
- mejor distinción entre archivos públicos y privados
- menor exposición del layout interno
- más claridad sobre pertenencia del archivo a usuario, tenant o recurso

---

## Señales de ruido

Estas señales merecen revisión rápida:

- path armado por concatenación con input externo
- uso directo del nombre original para guardar o leer
- cliente enviando rutas o casi-rutas
- el mismo directorio para cosas públicas, privadas y temporales
- autorización débil o ausente en descargas
- normalización usada como excusa para no rediseñar
- mensajes de error que muestran rutas internas
- nadie puede explicar qué archivo real podría tocar un usuario con un parámetro dado

---

## Checklist práctico

Cuando revises un flujo de archivos, preguntate:

- ¿el cliente está controlando un ID lógico o una ubicación real?
- ¿usamos el nombre original del archivo como parte del path físico?
- ¿el path final puede salir del espacio permitido?
- ¿qué pasa si el archivo existe pero pertenece a otro usuario o tenant?
- ¿la autorización se evalúa sobre el recurso correcto?
- ¿público, privado y temporal están bien separados?
- ¿qué logs o errores revelan sobre la estructura interna?
- ¿estamos bloqueando solo cadenas obvias o controlando de verdad el alcance?
- ¿el mismo problema podría existir en escritura, no solo en lectura?
- ¿qué cambio reduciría más el poder del input externo sobre la ubicación real?

---

## Mini ejercicio de reflexión

Tomá un flujo real de tu sistema donde se lea, sirva o guarde un archivo y respondé:

1. ¿Qué dato externo influye hoy en la ubicación del archivo?
2. ¿Ese dato es un ID lógico o se parece demasiado a una ruta real?
3. ¿Cómo se construye el path final?
4. ¿Qué impediría salir del directorio esperado?
5. ¿Qué impediría acceder al archivo de otro usuario o tenant?
6. ¿Qué información interna revelan hoy los errores?
7. ¿Qué rediseñarías primero para que el cliente deje de influir tanto en la ubicación física?

---

## Resumen

Path traversal en backends Java aparece cuando el backend pierde control sobre qué archivo real se está leyendo, escribiendo o sirviendo.

No es solo un tema de bloquear ciertas secuencias.
Es un tema de diseñar bien:

- qué input acepta el cliente
- cómo se resuelve la ubicación real
- qué directorio o espacio está permitido
- qué archivo pertenece a quién
- qué diferencia hay entre nombre visible e identificador físico
- qué parte del sistema de archivos o storage queda realmente expuesta

En resumen:

> un backend más maduro no deja que el usuario “apunte” a archivos reales a través de nombres o rutas apenas maquilladas.  
> Resuelve internamente la ubicación, limita el alcance y evalúa autorización sobre el recurso correcto antes de tocar el storage.

---

## Próximo tema

**Deserialización insegura: idea general**
