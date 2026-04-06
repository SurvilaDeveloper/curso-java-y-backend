---
title: "Procesamiento de documentos y archivos"
description: "Cómo aparecen riesgos al procesar documentos y archivos en una aplicación Java con Spring Boot. Por qué abrir, convertir, indexar, extraer texto o generar previews sobre contenido subido por usuarios amplía la superficie de ataque, y cómo pensar límites, aislamiento, costo y confianza antes de procesar."
order: 88
module: "Archivos, serialización y procesamiento riesgoso"
level: "base"
draft: false
---

# Procesamiento de documentos y archivos

## Objetivo del tema

Entender qué riesgos aparecen cuando una aplicación Java + Spring Boot **procesa documentos y archivos**, y no solo los recibe o almacena.

La idea es revisar un cambio muy importante de superficie.

Una cosa es:

- aceptar un archivo
- validarlo lo suficiente
- guardarlo

Y otra muy distinta es después:

- abrirlo
- parsearlo
- convertirlo
- generar thumbnail
- extraer texto
- leer metadata
- indexarlo
- comprimirlo
- descomprimirlo
- renderizarlo
- escanearlo con otras herramientas
- enviarlo a un pipeline auxiliar

Cada una de esas acciones crea nuevos puntos de riesgo.

En resumen:

> el upload abre una superficie.  
> El procesamiento abre otra.  
> Y muchas veces esa segunda superficie es más peligrosa que la primera.

---

## Idea clave

Procesar un archivo significa dejar que contenido controlado desde afuera interactúe con:

- parsers
- librerías
- memoria
- CPU
- disco
- temporales
- herramientas externas
- visores
- convertidores
- pipelines de negocio

La idea central es esta:

> un archivo no solo puede ser riesgoso por existir.  
> También puede serlo por lo que obliga al sistema a hacer cuando intenta entenderlo, transformarlo o extraerle valor.

Eso cambia mucho la mirada.
Porque deja de ser solo un problema de “guardar binarios” y pasa a ser un problema de:

- costo
- complejidad
- interpretación
- confianza
- aislamiento
- exposición posterior

---

## Qué problema intenta resolver este tema

Este tema busca evitar patrones como:

- parsear cualquier documento que llegó “porque para eso está la función”
- generar previews automáticos sin límites claros
- extraer metadata o texto antes de validar bien
- usar librerías complejas como si fueran cajas inocentes
- mandar archivos a conversores sin pensar costo ni aislamiento
- procesar documentos muy pesados o complejos en el mismo flujo síncrono
- asumir que si el tipo de archivo está permitido, entonces su procesamiento también lo está
- usar herramientas externas sin pensar qué pasa si fallan o se comportan mal
- olvidar archivos temporales y outputs intermedios
- mezclar negocio, upload y procesamiento intensivo dentro del mismo request

Es decir:

> el problema no es solo recibir archivos.  
> El problema también es dejar que esos archivos conduzcan cómo y cuánto trabaja el sistema.

---

## Error mental clásico

Un error muy común es este:

### “Si aceptamos el archivo, ya podemos procesarlo tranquilos”

Eso es una mala conclusión.

Aceptar un archivo para almacenarlo no implica automáticamente que sea seguro:

- abrirlo
- convertirlo
- indexarlo
- renderizarlo
- leerlo completo
- transformarlo con una librería compleja

### Idea importante

El hecho de que un archivo sea “aceptable” para un flujo no significa que cualquier operación posterior sobre ese archivo también sea aceptable o segura.

---

## El riesgo cambia según lo que hagas con el archivo

No todos los usos posteriores tienen el mismo nivel de riesgo.

### Menor superficie relativa
- guardar
- asociar a un recurso
- servirlo luego como descarga controlada

### Mayor superficie
- parsear internamente
- extraer texto
- generar miniaturas
- leer metadata profunda
- convertir entre formatos
- OCR
- indexación
- descompresión
- abrir con herramientas auxiliares
- enviarlo a motores de terceros

### Idea útil

Cuanto más “entendés” o “transformás” el archivo, más superficie abrís.

---

## Procesar no es lo mismo que almacenar

Esto conviene dejarlo muy claro.

Hay muchos sistemas donde el archivo solo necesita:

- subirse
- quedar asociado
- descargarse después con control de acceso

Pero aun así el equipo agrega procesamiento automático porque suena conveniente:

- preview
- thumbnails
- parsing
- indexación
- extracción de texto
- conteo de páginas
- análisis de estructura

Eso puede estar justificado.
Pero nunca debería ser una consecuencia automática de “como ya lo tenemos”.

### Regla sana

Cada procesamiento adicional necesita su propia justificación de seguridad, costo y valor de negocio.

---

## Librerías de parsing: gran utilidad, gran superficie

Muchos procesamientos dependen de librerías que interpretan formatos complejos como:

- PDFs
- imágenes
- documentos de oficina
- XML
- ZIP
- CSV
- formatos multimedia
- archivos con metadata rica

### Problema

Cuanto más compleja es la librería y más complejo el formato, más pueden aparecer:

- fallos inesperados
- consumo excesivo
- parsing frágil
- comportamiento extraño frente a archivos mal formados
- vectores para otras vulnerabilidades
- diferencias entre variantes del formato

### Idea importante

No alcanza con decir “usamos una librería conocida”.
También hay que preguntarse:

- ¿qué le estoy permitiendo hacer sobre input no confiable?
- ¿con qué límites?
- ¿en qué contexto?

---

## Procesamiento costoso: el enemigo silencioso

Muchos problemas no vienen por “ejecución maliciosa” espectacular, sino por costo.

Por ejemplo:

- PDFs enormes
- imágenes gigantes
- documentos comprimidos con expansión grande
- archivos con muchas páginas
- contenido que obliga a parseo profundo
- entradas que disparan OCR o conversiones largas
- lotes de archivos simultáneos

### Riesgos

- saturación de CPU
- consumo excesivo de memoria
- tiempos de respuesta altísimos
- colas bloqueadas
- hilos ocupados
- presión de disco
- caídas parciales del servicio

### Idea útil

Procesar documentos también es una cuestión de disponibilidad.
No solo de confidencialidad o integridad.

---

## Generar previews o thumbnails no es gratis

Una práctica común es generar:

- miniaturas
- previews
- capturas
- primeras páginas renderizadas
- versiones comprimidas

Eso mejora UX.
Pero también crea otra superficie porque implica:

- abrir el archivo
- interpretarlo
- transformarlo
- crear archivos secundarios
- guardar outputs
- decidir qué se expone después

### Regla sana

La preview no debería verse como “detalle visual”.
Es una operación de procesamiento con su propio riesgo y su propio costo.

---

## Extraer texto o metadata también puede ser delicado

A veces el backend quiere:

- indexar contenido
- buscar dentro de documentos
- extraer autor, páginas o dimensiones
- leer encabezados internos
- obtener información EXIF o similar

Eso parece menos riesgoso que convertir.
Pero igual implica:

- abrir el archivo
- confiar en su estructura
- usar librerías
- tocar metadata que puede ser engañosa o innecesaria
- aumentar la cantidad de información derivada que el sistema guarda

### Idea importante

Incluso la extracción “liviana” debe justificarse y limitarse.

---

## El procesamiento puede crear más datos sensibles

Esto se subestima mucho.

Un archivo original quizá era un PDF privado.
Pero al procesarlo el sistema puede generar:

- texto extraído
- thumbnails
- previews
- OCR
- metadata enriquecida
- índices de búsqueda
- copias convertidas
- resultados de moderación o clasificación

### Problema

Ahora no solo existe el archivo original.
Existen además varios derivados que pueden:

- quedar guardados
- salir por responses
- entrar en logs
- aparecer en búsquedas
- quedar en caches
- vivir más tiempo del esperado

### Regla útil

Procesar un archivo muchas veces multiplica la superficie de datos, no la reduce.

---

## Temporales y outputs intermedios

Casi todo procesamiento serio genera cosas intermedias:

- archivos temporales
- streams
- carpetas de trabajo
- salidas parciales
- resultados fallidos
- versiones convertidas

### Riesgos

- falta de cleanup
- exposición de archivos temporales
- mezcla entre usuarios o tenants
- outputs sensibles olvidados
- rutas peligrosas
- reutilización accidental
- crecimiento silencioso de storage

### Idea importante

La seguridad del procesamiento también depende de qué hacés con lo que va quedando en el medio.

---

## Sincronía vs asincronía: decisión importante

Otro punto importante es **cuándo** ocurre el procesamiento.

Si lo hacés:

- dentro del request principal
- en el mismo thread
- de forma síncrona

un archivo costoso puede impactar directo en:

- latencia
- timeouts
- disponibilidad
- experiencia de usuario
- uso de recursos del nodo web

### En cambio

Mover ciertas tareas a procesos asíncronos puede ayudar operativamente.
Pero no elimina el riesgo.
Solo cambia dónde y cómo lo absorbés.

### Idea útil

La arquitectura de procesamiento también es parte de la defensa.

---

## El parser o conversor no debería tener más poder del necesario

Aunque no entremos todavía en aislamiento técnico fino, sí conviene fijar una idea general:

> cuanto más riesgoso o costoso es el procesamiento, menos sentido tiene ejecutarlo con demasiado privilegio o demasiado cerca del corazón del sistema.

### Porque si algo sale mal

preferís que el daño afecte:

- un componente acotado
- una tarea aislada
- un proceso limitado

y no:

- el request principal
- el nodo entero
- el storage compartido
- el mismo proceso que sirve la API pública

---

## Archivos de terceros y confianza parcial

No todo archivo lo sube un usuario final.

A veces llega desde:

- integraciones
- proveedores
- otros servicios
- partners
- sistemas internos

Eso puede bajar algo el riesgo en algunos casos, pero no lo elimina.

### Porque igual puede haber

- errores
- formatos raros
- contenido inesperado
- archivos corruptos
- desacoples entre sistemas
- abuso interno
- compromiso de la fuente

### Regla sana

“No viene del usuario” no equivale automáticamente a “es seguro de procesar sin límites”.

---

## Procesamiento y reglas del negocio

No todo el análisis es técnico.
También hay preguntas funcionales sanas como:

- ¿realmente necesitamos procesar este tipo de archivo?
- ¿qué gana el producto con eso?
- ¿el beneficio compensa la superficie?
- ¿hace falta hacerlo siempre?
- ¿se puede procesar bajo demanda?
- ¿se puede limitar a ciertos roles o flujos?
- ¿se puede generar solo para contenido aprobado o verificado?

### Idea importante

El mejor procesamiento inseguro es el que nunca necesitaste hacer.

---

## Fallos de procesamiento y responses

Cuando el procesamiento falla, también importa qué hace el backend.

Un mal diseño puede terminar exponiendo:

- detalles del parser
- rutas temporales
- stack traces
- nombres de herramientas internas
- metadata del archivo
- partes del contenido

### Regla útil

El manejo de errores de procesamiento debe ser tan cuidado como el de cualquier otra operación sensible.

---

## Procesar antes de validar a fondo es mala idea

Esto conecta con el tema anterior.

No tiene sentido:

- convertir
- abrir profundo
- generar preview
- extraer texto

antes de haber hecho validaciones razonables sobre:

- tipo permitido
- tamaño
- cantidad
- coherencia general
- contexto del actor
- propósito del flujo

### Idea importante

Primero reducís incertidumbre barata.
Después decidís si vale la pena abrir la parte cara y más riesgosa.

---

## Servir el resultado procesado también es otra decisión

A veces el sistema no sirve el original, sino un derivado:

- thumbnail
- preview
- PDF reempacado
- texto extraído
- representación HTML
- imagen renderizada

Eso puede estar bien.
Pero también exige pensar:

- quién ve ese derivado
- si revela más o menos que el original
- cuánto tiempo vive
- si se limpia
- si es más fácil de exponer por accidente
- si se vuelve parte del contrato del sistema

### Idea útil

Los archivos derivados también son activos que merecen política, no solo subproductos.

---

## Qué conviene revisar en una implementación real

Cuando revises procesamiento de documentos y archivos, mirá especialmente:

- dónde se abre o parsea el archivo
- qué librerías participan
- qué operaciones se hacen automáticamente
- qué límites de tamaño y complejidad existen
- si el procesamiento es síncrono o asíncrono
- qué temporales se generan
- qué outputs se guardan
- qué datos derivados nacen del archivo
- quién accede al original y a los derivados
- qué errores o logs aparecen cuando el procesamiento falla
- si el procesamiento realmente aporta valor al caso de uso

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- menos procesamiento automático por inercia
- validación suficiente antes de abrir parsers complejos
- límites razonables de costo y tamaño
- mejor separación entre upload y procesamiento pesado
- outputs derivados más controlados
- temporales con cleanup claro
- menos confianza ciega en librerías o herramientas auxiliares
- mejor alineación entre valor de negocio y superficie agregada

---

## Señales de ruido

Estas señales merecen revisión rápida:

- cualquier archivo aceptado se procesa igual
- previews o conversiones por defecto sin justificación fuerte
- OCR, parsing o thumbnails dentro del request principal sin límites claros
- derivados almacenados sin política de vida útil
- temporales olvidados
- errores del parser expuestos tal cual
- nadie sabe exactamente qué se genera a partir del archivo original
- el sistema acumula más valor en derivados que en el archivo inicial
- el equipo da por hecho que “si es PDF o imagen, procesarlo es rutinario y seguro”

---

## Checklist práctico

Cuando revises procesamiento de documentos y archivos, preguntate:

- ¿qué procesamiento hacemos realmente sobre cada tipo de archivo?
- ¿qué valor de negocio aporta cada paso?
- ¿qué validación ocurre antes de ese procesamiento?
- ¿qué costo en CPU, memoria, disco o tiempo puede introducir?
- ¿qué librerías o herramientas participan?
- ¿qué temporales y derivados se generan?
- ¿quién puede ver esos derivados?
- ¿qué pasa si el procesamiento falla o tarda demasiado?
- ¿se está ejecutando demasiado cerca del request principal o del núcleo del sistema?
- ¿qué paso eliminaría primero si quisiera reducir superficie sin romper demasiado valor?

---

## Mini ejercicio de reflexión

Tomá un flujo real de tu sistema que procese archivos, por ejemplo:

- avatar con thumbnail
- PDF con preview
- OCR de documentos
- importación desde CSV
- extracción de metadata

y respondé:

1. ¿Qué operaciones hace el sistema sobre el archivo?
2. ¿Cuáles son realmente necesarias?
3. ¿Qué validación ocurre antes?
4. ¿Qué librerías o herramientas quedan expuestas al input?
5. ¿Qué outputs intermedios o finales se generan?
6. ¿Qué parte del flujo costaría más si alguien lo abusara?
7. ¿Qué simplificarías primero para bajar superficie?

---

## Resumen

Procesar documentos y archivos es mucho más que guardar binarios.

Cada vez que el backend:

- abre
- interpreta
- convierte
- indexa
- extrae
- renderiza
- o genera derivados

está ampliando la superficie de ataque y el costo operativo del flujo.

Por eso conviene pensar siempre:

- qué valor aporta el procesamiento
- qué validación ocurre antes
- qué límites de costo existen
- qué derivados y temporales deja
- qué parte debería aislarse más
- qué podrías dejar de hacer sin perder demasiado valor

En resumen:

> un backend más maduro no procesa archivos “porque puede” ni porque la librería lo hace fácil.  
> Procesa solo lo necesario, con validación previa, límites claros y conciencia de que cada parser, conversor o preview añade otra frontera de seguridad que ahora también hay que gobernar.

---

## Próximo tema

**Descargas seguras**
