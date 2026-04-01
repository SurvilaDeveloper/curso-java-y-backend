---
title: "Subida y gestión de archivos"
description: "Cómo pensar la carga, almacenamiento y administración de archivos en un backend real, qué decisiones de diseño hay que tomar y qué riesgos aparecen al trabajar con imágenes, documentos y otros recursos."
order: 73
module: "Backend real e integraciones"
level: "intermedio"
draft: false
---

## Introducción

En muchos proyectos reales, tarde o temprano aparece esta necesidad:

el sistema tiene que manejar archivos.

Por ejemplo:

- imágenes de productos
- fotos de perfil
- comprobantes
- PDFs
- archivos adjuntos
- exportaciones
- documentos internos
- planillas
- contratos
- reportes generados

A primera vista puede parecer algo simple:
“subo un archivo y listo”.

Pero en la práctica, trabajar con archivos abre muchas preguntas importantes:

- ¿dónde se guardan?
- ¿en la base de datos o fuera de ella?
- ¿cómo se nombran?
- ¿quién puede descargarlos?
- ¿cómo se validan?
- ¿qué tamaño máximo se permite?
- ¿qué pasa si alguien sube algo peligroso?
- ¿cómo se eliminan?
- ¿cómo se reemplazan?
- ¿cómo se relacionan con las entidades del sistema?

Por eso, la subida y gestión de archivos es un tema muy real de backend.

## Qué significa gestionar archivos

No se trata solo de “recibir un archivo”.

Gestionar archivos implica pensar todo su ciclo de vida:

- recepción
- validación
- almacenamiento
- asociación con datos del negocio
- acceso
- descarga
- reemplazo
- borrado
- auditoría
- seguridad

En otras palabras:

**trabajar con archivos no es solo una cuestión técnica de upload.  
También es una cuestión de diseño, seguridad y operación.**

## Casos de uso comunes

### 1. Imágenes de productos

Un e-commerce puede necesitar asociar varias imágenes a cada producto.

### 2. Avatares o fotos de perfil

Un usuario sube una imagen que después el sistema muestra en distintas pantallas.

### 3. Comprobantes o documentos

Por ejemplo:

- constancias
- facturas
- certificados
- contratos
- archivos de validación

### 4. Archivos adjuntos en procesos internos

Un sistema administrativo puede guardar documentos relacionados con un trámite.

### 5. Exportaciones

El backend puede generar:

- CSV
- Excel
- PDF
- reportes descargables

### 6. Importaciones

El usuario o un admin puede subir archivos para cargar datos masivamente.

## Pregunta central: ¿dónde guardar los archivos?

Esta es una de las decisiones más importantes.

A grandes rasgos, suele haber tres posibilidades:

- guardar archivos en disco local
- guardar archivos en almacenamiento externo
- guardar contenido en base de datos

## Guardar en disco local

Es la opción más intuitiva.

El backend recibe el archivo y lo guarda en una carpeta del servidor.

### Ventajas

- simple de entender
- fácil de implementar al principio
- práctico en entornos locales o proyectos chicos

### Problemas

- si cambiás de servidor, podés perder el contenido si no hay persistencia correcta
- escalar varias instancias se vuelve más complejo
- en ciertos despliegues modernos no conviene depender del disco local
- backups, replicación y disponibilidad se vuelven un tema más delicado

Por eso, aunque puede servir en ciertos casos, no siempre es buena idea para sistemas más serios o desplegados en la nube.

## Guardar en almacenamiento externo

Acá el backend sube el archivo a un servicio especializado, por ejemplo:

- object storage
- servicios tipo S3
- soluciones equivalentes
- plataformas especializadas en imágenes o media

El backend suele guardar en la base de datos solo metadata o referencias, por ejemplo:

- URL
- key
- path
- nombre original
- tamaño
- tipo MIME
- fecha de subida

### Ventajas

- mejor separación entre aplicación y archivos
- más fácil de escalar
- más razonable para despliegues reales
- mejor compatibilidad con múltiples instancias
- suele simplificar backups y disponibilidad

### Desafíos

- hay que integrar un servicio externo
- aparecen temas de permisos, URLs, expiración y costos
- el flujo de subida y borrado puede ser más complejo

En proyectos reales, esta suele ser una estrategia muy común.

## Guardar archivos en la base de datos

También existe esta posibilidad, por ejemplo guardando blobs o contenido binario.

### Posibles ventajas

- todo queda centralizado en el mismo sistema de persistencia
- puede ser útil en algunos casos específicos

### Problemas frecuentes

- la base puede crecer demasiado
- puede impactar en performance
- complica backups y manejo general
- muchas veces no es la opción más cómoda para archivos grandes o numerosos

Por eso, en muchos sistemas de aplicación general, lo más habitual es guardar metadata en base de datos y el archivo real fuera de ella.

## Archivo real vs metadata

Esta distinción es muy importante.

### Archivo real

Es el contenido binario:

- imagen
- PDF
- planilla
- documento

### Metadata

Es la información sobre ese archivo:

- id
- nombre original
- nombre interno
- tamaño
- tipo
- ubicación
- usuario que lo subió
- fecha
- estado
- entidad asociada

Muchas veces el backend trabaja mucho más con metadata que con el binario en sí.

## Subir un archivo no es solo “aceptar cualquier cosa”

Uno de los errores más comunes es dejar que el sistema reciba archivos sin suficientes controles.

Eso puede traer problemas de:

- seguridad
- almacenamiento
- abuso
- rendimiento
- consistencia

Por eso conviene pensar validaciones desde el principio.

## Validaciones importantes

## 1. Tamaño máximo

No querés que alguien suba archivos gigantes sin control.

## 2. Tipo de archivo permitido

Por ejemplo:

- imágenes
- PDF
- CSV

según el caso de uso.

## 3. Extensión

No alcanza solo con mirar el nombre del archivo, pero también puede ser un filtro útil.

## 4. Tipo MIME

Conviene validar qué tipo de archivo dice ser el contenido recibido.

## 5. Cantidad de archivos

A veces una operación debería permitir uno solo.
Otras veces, varios pero con límite.

## 6. Contexto de negocio

No cualquier usuario debería poder subir cualquier archivo en cualquier lugar.

## Seguridad al manejar archivos

Este punto es clave.

Cuando un sistema permite uploads, aparecen riesgos como:

- archivos maliciosos
- contenido no esperado
- abuso de almacenamiento
- nombres problemáticos
- accesos no autorizados
- exposición pública accidental
- reemplazos indebidos
- path traversal en implementaciones inseguras

Por eso el tema de archivos no es “solo infraestructura”.
También es seguridad.

## Riesgos comunes

### 1. Confiar ciegamente en el nombre del archivo

Un nombre puede ser engañoso.

### 2. Exponer archivos sensibles con URLs públicas sin control

No todos los archivos deberían ser públicos.

### 3. Permitir tamaños enormes

Eso puede romper recursos del sistema.

### 4. No validar permisos de acceso

Subir un archivo puede estar controlado, pero también hay que controlar quién lo ve o lo descarga.

### 5. Reemplazar archivos sin criterio

A veces hay que versionar, auditar o limpiar anteriores.

### 6. No limpiar archivos huérfanos

Puede pasar que una entidad se borre o cambie y el archivo quede perdido ocupando espacio.

## Nombres internos y organización

Otro tema importante es cómo nombrar y organizar los archivos.

No suele ser buena idea depender solo del nombre original que mandó el usuario.

¿Por qué?

Porque puede haber:

- colisiones
- caracteres problemáticos
- nombres demasiado largos
- nombres poco seguros
- falta de unicidad

En general, suele convenir usar identificadores internos más controlados.

Por ejemplo:

- UUID
- prefijos por entidad
- carpetas lógicas
- claves internas generadas por el sistema

Y guardar aparte el nombre original si hace falta mostrarlo al usuario.

## Ejemplo conceptual

Supongamos que un usuario sube:

`factura-marzo.pdf`

El sistema podría guardar:

- nombre original: `factura-marzo.pdf`
- nombre interno: `a4f2d1c8-archivo.pdf`
- tipo MIME: `application/pdf`
- tamaño: `248391`
- entidad asociada: `invoice`
- entidad id: `245`
- storage key: `invoices/2026/03/a4f2d1c8-archivo.pdf`

Así evitás depender del nombre original para la persistencia real.

## Asociación con entidades del negocio

En sistemas reales, los archivos casi siempre están relacionados con algo.

Por ejemplo:

- una imagen pertenece a un producto
- un comprobante pertenece a una orden
- un contrato pertenece a un cliente
- una exportación pertenece a un usuario que la pidió

Eso significa que no alcanza con guardar el archivo “suelto”.

Hay que pensar su relación con el modelo de datos.

Preguntas típicas:

- ¿un producto puede tener muchas imágenes?
- ¿una orden puede tener un solo comprobante o varios?
- ¿si se elimina la entidad, qué pasa con los archivos?
- ¿el archivo forma parte crítica del negocio o es solo accesorio?

## Archivos públicos vs privados

Esta decisión es muy importante.

### Archivos públicos

Pueden verse sin autenticación fuerte o con acceso abierto.

Ejemplo:

- imágenes públicas de catálogo

### Archivos privados

Requieren autorización.

Ejemplo:

- comprobantes
- contratos
- documentos internos
- reportes privados
- archivos subidos por un usuario autenticado

No todos los archivos deberían manejarse igual.

## Subida síncrona vs procesamiento posterior

A veces subir un archivo no termina en el momento del upload.

Después puede haber tareas adicionales, como:

- generar miniaturas
- comprimir imágenes
- escanear contenido
- convertir formatos
- extraer metadata
- moverlo a otro almacenamiento
- asociarlo a un flujo de negocio

Eso conecta este tema con lo que ya viste sobre:

- trabajo diferido
- tareas automáticas
- procesos batch
- integraciones

## Qué pasa al reemplazar un archivo

Otro caso real:

un usuario cambia su foto de perfil  
o un admin actualiza un documento.

Ahí aparecen preguntas importantes:

- ¿se reemplaza el archivo anterior?
- ¿se conserva historial?
- ¿se borra inmediatamente?
- ¿se marca como inactivo?
- ¿se audita el cambio?
- ¿qué pasa si el nuevo archivo falla a mitad de proceso?

Estas decisiones dependen del negocio.

## Qué pasa al borrar un archivo

Eliminar archivos también requiere criterio.

A veces querés:

- borrar físicamente
- hacer soft delete de metadata
- desasociar pero conservar
- archivar
- impedir el borrado si el archivo tiene valor legal o de auditoría

No siempre “eliminar” significa exactamente lo mismo.

## Archivos huérfanos

Este es un problema muy común.

Un archivo queda huérfano cuando existe en storage, pero ya no tiene una referencia útil en el sistema.

Por ejemplo:

- el upload falló después de guardar el archivo pero antes de registrar metadata
- una entidad se borró y nadie limpió los archivos
- hubo un reemplazo y el archivo anterior quedó olvidado

Si esto no se controla, el sistema acumula basura con el tiempo.

## Observabilidad y trazabilidad

Trabajar con archivos también requiere visibilidad.

Conviene poder responder preguntas como:

- quién subió este archivo
- cuándo
- para qué entidad
- con qué tamaño
- dónde quedó guardado
- si fue reemplazado
- si fue eliminado
- si la subida falló
- si el procesamiento posterior falló

Eso ayuda muchísimo en soporte y operación.

## Buenas prácticas iniciales

## 1. Separar archivo real de metadata

Suele ser un diseño más sano.

## 2. Validar tipo, tamaño y permisos

Nunca asumir que cualquier archivo es aceptable.

## 3. Usar nombres internos controlados

Evita colisiones y problemas de seguridad.

## 4. Pensar si el archivo será público o privado

Eso afecta almacenamiento y acceso.

## 5. Diseñar el ciclo de vida

Subida, reemplazo, descarga, borrado y limpieza.

## 6. Registrar trazabilidad básica

Especialmente en sistemas importantes.

## 7. No meter archivos grandes en la base de datos sin una razón clara

Muchas veces no es la mejor opción.

## 8. Pensar en limpieza de huérfanos

Importa más de lo que parece.

## Errores comunes

### 1. Guardar todo en disco local sin pensar en despliegue real

Puede funcionar al principio y complicarse mucho después.

### 2. No validar qué se está subiendo

Eso abre problemas de seguridad y abuso.

### 3. Exponer todo como público

Mala idea si hay archivos sensibles.

### 4. Usar nombres originales como clave única real

Puede generar conflictos y desorden.

### 5. Olvidarse del borrado o reemplazo

Después aparecen archivos duplicados o basura persistente.

### 6. Tratar archivos como si no fueran parte del modelo de negocio

En muchos sistemas sí lo son.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué archivos necesitaría manejar un e-commerce real?
2. ¿cuáles deberían ser públicos y cuáles privados?
3. ¿qué validarías antes de aceptar una imagen?
4. ¿guardarías el binario en base de datos, en disco o en storage externo?
5. ¿qué harías con un archivo viejo cuando se reemplaza por uno nuevo?

## Resumen

En esta lección viste que:

- manejar archivos en backend implica mucho más que recibir un upload
- hay que pensar almacenamiento, validación, seguridad, acceso y ciclo de vida
- en muchos sistemas conviene separar el archivo real de su metadata
- guardar archivos fuera de la base de datos suele ser una estrategia habitual en proyectos reales
- los archivos pueden ser públicos o privados, y eso cambia mucho su tratamiento
- los nombres internos, los permisos y la limpieza de huérfanos son decisiones importantes
- trabajar bien con archivos requiere diseño, no solo código de subida

## Siguiente tema

Ahora que ya entendés cómo pensar la carga, almacenamiento y administración de archivos en un backend real, el siguiente paso natural es aprender sobre **almacenamiento externo: S3 y servicios equivalentes**, porque muchas aplicaciones serias necesitan persistir archivos fuera del servidor local de forma más escalable y profesional.
