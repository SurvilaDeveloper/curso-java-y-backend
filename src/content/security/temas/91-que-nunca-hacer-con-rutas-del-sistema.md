---
title: "Qué nunca hacer con rutas del sistema"
description: "Qué malas prácticas conviene evitar al trabajar con rutas del sistema en una aplicación Java con Spring Boot. Por qué mezclar input del usuario con paths reales, exponer estructura interna, reutilizar nombres físicos o confiar demasiado en ubicaciones locales rompe aislamiento, complica seguridad y facilita traversal, fuga o sobreescritura."
order: 91
module: "Archivos, serialización y procesamiento riesgoso"
level: "base"
draft: false
---

# Qué nunca hacer con rutas del sistema

## Objetivo del tema

Entender **qué nunca conviene hacer con rutas del sistema** en una aplicación Java + Spring Boot.

La idea de este tema es cerrar el bloque de archivos con una mirada muy práctica.

Ya vimos uploads, validación, contenido real, path traversal, procesamiento, descargas y temporales.
Ahora toca condensar varias de esas lecciones en una pregunta simple:

> ¿qué decisiones con rutas y paths suelen romper el control del backend sobre el storage?

Porque muchas fallas con archivos no aparecen por una librería exótica.
Aparecen por malas prácticas bastante comunes, como:

- usar input externo en paths reales
- exponer ubicación física al cliente
- confiar en nombres originales
- mezclar recursos públicos y privados
- construir rutas por concatenación
- asumir que el filesystem local es un detalle invisible e inofensivo

En resumen:

> una ruta del sistema no debería comportarse como parte del contrato público del backend.  
> Cuanto más cerca esté el cliente de los paths reales, más fácil es perder control sobre acceso, aislamiento y exposición.

---

## Idea clave

El backend debería trabajar con dos planos distintos:

## 1. Plano lógico
Es el que entiende el cliente o el dominio:

- ID de archivo
- ID de adjunto
- recurso asociado
- documento de una orden
- avatar de un usuario
- comprobante de un pago

## 2. Plano físico
Es cómo el sistema resuelve internamente dónde vive ese contenido:

- carpeta
- prefijo
- bucket
- key
- nombre físico
- path temporal
- subdirectorio
- ubicación interna del storage

La idea central es esta:

> muchos problemas nacen cuando esos dos planos se mezclan.  
> El cliente pide o influye en una ruta física cuando debería interactuar solo con un identificador lógico del recurso.

---

## Qué problema intenta resolver este tema

Este tema busca evitar malas prácticas como:

- dejar que el cliente mande paths o casi-paths
- usar nombres físicos como identificadores públicos
- exponer estructura de directorios en respuestas o errores
- concatenar strings para construir rutas
- guardar por nombre original del archivo
- servir archivos privados desde ubicaciones adivinables
- usar rutas absolutas o dependientes del entorno como parte de la lógica de negocio
- reutilizar la misma carpeta para contenidos con sensibilidades distintas
- asumir que porque “funciona local” el diseño ya es sano
- acoplar la API al layout real del storage

Es decir:

> el problema no es usar rutas.  
> El problema es diseñar el sistema como si las rutas del storage fueran una interfaz aceptable para usuarios, clientes o flujos de negocio.

---

## Error mental clásico

Un error muy común es este:

### “Es más simple si el cliente manda el nombre o path y nosotros lo buscamos”

Eso suena cómodo.
Pero suele romper varias cosas a la vez.

Porque el backend empieza a depender de que el cliente conozca o influya en:

- ubicación física
- nombre real
- estructura de carpetas
- forma de almacenamiento
- detalles internos que deberían ser privados

### Idea importante

La simplicidad aparente de “pasame el nombre y te lo devuelvo” suele pagarse con:

- traversal
- exposición
- falta de autorización real
- URLs predecibles
- dependencia del layout interno
- dificultad para migrar storage después

---

## Nunca confundir identificador lógico con path físico

Esta es probablemente la regla más útil del tema.

No es lo mismo:

- `invoiceAttachmentId=123`

que

- `/var/app/uploads/invoices/2026/cliente-77/factura-final.pdf`

El primero pertenece al contrato del dominio.
El segundo pertenece a la implementación interna.

### Qué sale mal si los mezclás

- el cliente aprende detalles internos
- la API se acopla al storage
- se vuelve más fácil intentar traversal o enumeración
- cuesta mover archivos o cambiar proveedor de storage
- la autorización se degrada a “si existe esa ruta, la sirvo”

### Regla sana

El cliente debería hablar con IDs lógicos.
El backend debería resolver paths internos sin exponerlos ni delegarlos.

---

## Nunca construir rutas por concatenación ingenua

Otra mala práctica clásica es armar paths con algo del estilo mental:

- carpeta base
- más parámetro recibido
- más separador
- más nombre original

Eso suele parecer directo y expresivo.
Pero abre la puerta a:

- traversal
- colisiones
- paths ambiguos
- mezcla entre contextos
- bugs difíciles de razonar
- errores de normalización
- comportamientos distintos según SO o storage

### Idea importante

El problema no es solo una secuencia maliciosa concreta.
El problema es que el diseño deja que el input participe demasiado en la ruta real.

---

## Nunca usar el nombre original como nombre físico principal

El nombre original del archivo puede servir como metadata visual.
Pero no debería ser el centro del naming físico en storage.

### Porque puede traer

- caracteres extraños
- PII
- contexto de negocio
- colisiones
- extensiones engañosas
- intentos de traversal
- dependencia de decisiones del cliente
- dificultad para mover o reorganizar storage

### Regla sana

El nombre físico debería ser resuelto por el backend de forma controlada.
El nombre original, si se conserva, debería tratarse como metadata separada.

---

## Nunca dejar que el cliente elija subdirectorios o ubicaciones

Otra mala práctica bastante común es aceptar cosas como:

- carpeta
- subcarpeta
- bucket lógico abierto
- path parcial
- categoría que en realidad termina influyendo directo en storage

### Problema

Eso hace que el cliente no solo suba un archivo o pida una descarga.
También empiece a influir en **dónde vive físicamente**.

Y ese control suele ser mucho mayor del que el backend pretendía ceder.

### Idea útil

Las decisiones de ubicación deberían nacer del backend a partir del caso de uso, no de parámetros casi físicos enviados por el cliente.

---

## Nunca exponer paths reales en errors o responses

Aunque el archivo no se entregue, el sistema puede filtrar mucho a través de:

- rutas en excepciones
- mensajes de error
- logs visibles
- metadata de depuración
- respuestas técnicas
- headers o nombres mal construidos

### Qué enseña eso

- estructura interna
- ubicación de temporales
- layout del storage
- nombres reales
- rutas de sistema operativo
- contexto operativo del servidor

### Regla sana

El cliente no necesita conocer dónde vive el archivo en el host, en el contenedor o en el storage real.

---

## Nunca tratar el filesystem local como si fuera el dominio

En proyectos chicos o al principio, es común que todo gire alrededor de una carpeta local.
Eso puede estar bien como implementación.
Lo que no conviene es dejar que esa implementación defina el contrato del sistema.

### Señales de mal diseño

- la API habla en términos de paths
- el frontend conoce subcarpetas
- los jobs asumen layout fijo fuera del dominio
- las migraciones se vuelven dolorosas porque todo depende del path real
- público y privado se diferencian por “qué carpeta toca” y nada más

### Idea importante

El storage local puede ser un detalle técnico útil.
No debería convertirse en el lenguaje principal del producto.

---

## Nunca mezclar en la misma zona lo público, lo privado y lo temporal

Esta mala práctica aparece muchísimo.

Por comodidad, el sistema usa:

- la misma carpeta
- el mismo bucket
- la misma key space
- la misma política de nombres

para cosas muy distintas, por ejemplo:

- imágenes públicas
- adjuntos privados
- temporales de procesamiento
- exports
- previews
- evidencias sensibles

### Problema

Eso vuelve mucho más probable:

- exposición accidental
- confusión entre políticas
- descargas indebidas
- cleanup incompleto
- errores de autorización
- sobreescritura o colisión entre mundos distintos

### Regla sana

Diferenciá claramente los espacios de storage según:

- visibilidad
- ciclo de vida
- sensibilidad
- forma de acceso
- propósito del flujo

---

## Nunca asumir que “si está dentro del contenedor/servidor ya está a salvo”

Otra simplificación peligrosa es pensar:

- “es un path interno”
- “nadie lo ve”
- “está adentro del host”
- “solo la app accede”

Eso no siempre es cierto.

Porque igual puede haber:

- operadores
- procesos auxiliares
- logs
- snapshots
- backups
- jobs paralelos
- errores que exponen la ruta
- restauraciones en otros entornos

### Idea importante

Una ruta interna no es automáticamente una ruta segura.
Sigue siendo una decisión de almacenamiento que merece diseño.

---

## Nunca usar rutas absolutas rígidas como centro del diseño

Poner una ruta absoluta fija en el corazón del flujo suele generar varios problemas:

- dependencia del entorno
- diferencias entre local, staging y producción
- más exposición accidental en logs o errores
- dificultad para rotar storage
- acoplamiento fuerte al host o contenedor
- malas prácticas al mover archivos entre entornos

### Regla sana

El backend puede resolver ubicaciones internas, pero no conviene que la lógica de negocio dependa rígidamente de un path concreto del sistema como si fuera parte estable del diseño.

---

## Nunca devolver archivos privados por ruta “porque total no está enlazada”

A veces el equipo confía en obscuridad:

- “nadie sabe la URL”
- “no está en la UI”
- “el path es largo”
- “el nombre no es trivial”

Eso no es un modelo de seguridad.

### Problema

Si el archivo es privado, la protección no debería depender de:

- que la ruta no se conozca
- que la URL sea larga
- que nadie la descubra
- que no esté documentada

### Regla sana

La descarga privada debería estar protegida por autorización real, no por opacidad del path.

---

## Nunca asumir que un rename o normalización ya “sanitizó” el problema entero

A veces el equipo hace una mejora parcial, por ejemplo:

- limpiar caracteres raros
- cambiar espacios por guiones
- normalizar el path
- cortar ciertos símbolos

Eso puede ayudar.
Pero no resuelve por sí solo preguntas más profundas como:

- ¿quién controla el naming?
- ¿quién resuelve la ubicación?
- ¿qué archivo real se toca?
- ¿qué separa el dominio del storage?
- ¿qué pasa entre usuarios y tenants?
- ¿qué se expone en errores o descargas?

### Idea importante

Sanear un string no reemplaza diseñar bien la política de rutas.

---

## Nunca pensar rutas sin pensar ownership y tenant

Una ruta segura no es solo una ruta técnicamente válida.
También tiene que corresponder al recurso correcto.

Por ejemplo:

- ese archivo pertenece a esta orden
- esta orden pertenece a este usuario
- este usuario pertenece a este tenant

Si el backend se queda en:

- “path correcto”
- “archivo encontrado”

pero no vuelve a la pertenencia del recurso, sigue habiendo riesgo serio.

### Regla sana

La seguridad de archivos no termina en el path.
Incluye siempre:

- ownership
- tenant
- contexto de negocio
- autorización real

---

## Nunca reutilizar claves o rutas físicas como si fueran nombres públicos permanentes

Cuando el storage físico se convierte en identificador público, el sistema pierde flexibilidad y gana superficie.

### Problemas típicos

- no podés mover archivos sin romper enlaces
- el cliente aprende demasiado del layout
- los logs y responses arrastran detalles internos
- crece el riesgo de enumeración
- cambia de proveedor o infraestructura y todo se rompe

### Idea útil

Un identificador lógico estable es mucho más sano que exponer la key física real como contrato público.

---

## Nunca olvidar que una ruta también es información sensible contextual

Aunque el archivo no sea sensible, la ruta a veces sí revela demasiado.

### Puede revelar

- nombres de clientes
- IDs internos
- organización por tenant
- tipo de documento
- entorno
- fechas
- workflow interno
- estructura operativa

### Idea importante

Un path puede filtrar valor de negocio u organización interna incluso si no entrega el contenido del archivo.

---

## Qué conviene revisar en una implementación real

Cuando revises rutas del sistema en una app Spring o Java, mirá especialmente:

- si el cliente manda filename, path, key o subpath
- si los paths se construyen por concatenación
- si el nombre original se usa en storage físico
- si público, privado y temporal comparten zona
- si errores o logs muestran rutas reales
- si el contrato público depende de nombres físicos
- si la autorización ocurre sobre el recurso correcto
- si el equipo distingue entre ID lógico y ubicación física
- si la organización del storage revela demasiado del negocio
- si ciertas rutas rígidas están acopladas al entorno o a una infraestructura concreta

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- IDs lógicos en vez de paths públicos
- resolución interna de ubicación
- menos input externo participando en nombres físicos
- separación clara entre zonas públicas, privadas y temporales
- menor exposición del layout real de storage
- mejor desacople entre dominio y filesystem
- más facilidad para cambiar storage sin romper contratos
- autorización atada al recurso de negocio y no a la mera existencia del archivo

---

## Señales de ruido

Estas señales merecen revisión rápida:

- cliente enviando paths o casi-paths
- nombres físicos visibles en URLs públicas
- uso del nombre original como nombre de storage
- concatenación manual de rutas con input externo
- errores que muestran directorios reales
- la misma carpeta para archivos sensibles y temporales
- opacidad del path usada como “seguridad”
- nadie puede explicar dónde termina el plano lógico y dónde empieza el físico

---

## Checklist práctico

Cuando revises rutas del sistema, preguntate:

- ¿el cliente interactúa con IDs lógicos o con ubicaciones físicas?
- ¿qué parte del path real depende de input externo?
- ¿el nombre original del archivo influye demasiado?
- ¿público, privado y temporal están bien separados?
- ¿qué revelan hoy los errores, logs y headers sobre las rutas reales?
- ¿el contrato del backend depende del layout interno del storage?
- ¿qué pasaría si mañana cambio de proveedor o de estructura física?
- ¿la autorización se resuelve sobre el recurso correcto o sobre la mera ruta?
- ¿qué nombre o path hoy contiene información innecesaria del negocio?
- ¿qué rediseñaría primero para separar mejor dominio y storage?

---

## Mini ejercicio de reflexión

Tomá un flujo real de archivos de tu sistema y respondé:

1. ¿Qué dato usa hoy el cliente para pedir o guardar el archivo?
2. ¿Eso es un ID lógico o una referencia física disfrazada?
3. ¿Qué parte del nombre o path controla el usuario?
4. ¿Qué parte revela demasiado del storage o del negocio?
5. ¿Cómo se separan hoy archivos públicos, privados y temporales?
6. ¿Qué ocurriría si mañana quisieras mover ese storage a otro backend?
7. ¿Qué cambio harías primero para quitar paths reales del contrato público?

---

## Resumen

Trabajar mal con rutas del sistema suele romper varias capas a la vez:

- control del storage
- autorización real
- aislamiento entre recursos
- exposición mínima
- flexibilidad del diseño

Las peores prácticas suelen aparecer cuando:

- el cliente influye demasiado en paths reales
- el nombre original gobierna el storage
- el layout físico se vuelve parte del contrato
- público, privado y temporal se mezclan
- la opacidad del path se usa como seguridad
- el recurso de negocio se reemplaza por una ruta apenas maquillada

En resumen:

> un backend más maduro no usa rutas del sistema como interfaz pública ni deja que el usuario oriente el acceso real al storage.  
> Separa con claridad el mundo lógico del recurso y el mundo físico de la ubicación, porque entiende que ahí se juega buena parte del aislamiento y la seguridad del flujo de archivos.

---

## Próximo tema

**Hardening básico de manejo de archivos**
