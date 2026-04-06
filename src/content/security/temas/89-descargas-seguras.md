---
title: "Descargas seguras"
description: "Cómo diseñar descargas seguras en una aplicación Java con Spring Boot. Qué riesgos aparecen al servir archivos, cómo evitar exposición indebida, path traversal, URLs predecibles y bypass de autorización, y por qué descargar un archivo también es una decisión de seguridad y no solo una respuesta HTTP con bytes."
order: 89
module: "Archivos, serialización y procesamiento riesgoso"
level: "base"
draft: false
---

# Descargas seguras

## Objetivo del tema

Entender cómo diseñar **descargas seguras** en una aplicación Java + Spring Boot.

La idea es revisar un error muy común en sistemas con archivos:

- se piensa mucho el upload
- se piensa algo el storage
- pero la descarga queda reducida a
- “si existe el archivo, lo devolvemos”

Ese enfoque es peligroso.

Porque servir un archivo no es solo mandar bytes por HTTP.
También implica decidir:

- quién puede acceder
- a qué recurso corresponde
- qué nombre verá el cliente
- qué headers se envían
- si el archivo es público o privado
- si el acceso es directo o mediado por backend
- si la URL revela demasiado
- si se está respetando autorización real
- si la respuesta puede exponer más de lo debido

En resumen:

> una descarga no es una operación neutra.  
> Es otra interfaz de acceso a datos, y a veces a datos muy sensibles.

---

## Idea clave

Cuando un backend entrega un archivo, está haciendo algo más que responder una request.

Está permitiendo acceso a:

- contenido
- metadata
- existencia del recurso
- tamaño
- nombre
- tipo
- contexto de negocio
- y, en algunos casos, relaciones entre usuarios, tenants o procesos internos

La idea central es esta:

> una descarga segura no consiste solo en “encontrar el archivo y streamearlo”.  
> Consiste en controlar qué archivo es, para quién es, bajo qué contexto se entrega y qué información adicional queda expuesta en el camino.

---

## Qué problema intenta resolver este tema

Este tema busca evitar patrones como:

- descargar archivos por nombre o path controlado por el cliente
- servir archivos privados desde URLs predecibles
- confiar en que “si tiene el link, ya puede verlo”
- separar archivo y autorización como si fueran problemas distintos
- exponer nombres, tipos o tamaños sin necesidad
- devolver archivos de otro usuario o tenant por lookup demasiado amplio
- usar la misma política para archivos públicos y privados
- olvidar que una descarga también puede filtrar por headers o metadata
- mezclar identificadores lógicos con rutas físicas
- dejar que la capa de archivos bypassée controles de negocio que sí existen en el resto de la API

Es decir:

> el problema no es solo entregar archivos.  
> El problema es tratar la descarga como una operación técnica y no como una decisión de acceso a información.

---

## Error mental clásico

Un error muy común es este:

### “Si el archivo existe en storage, entonces el backend solo tiene que devolverlo”

Eso es una mala base.

Porque la pregunta importante no es:

- “¿existe?”

Sino:

- “¿este actor puede descargarlo?”
- “¿en este contexto?”
- “¿a través de este endpoint?”
- “¿con este nivel de información adicional?”
- “¿sin revelar demasiado si no corresponde?”

### Idea importante

Existencia del archivo no equivale a derecho de acceso.
Igual que en cualquier otro recurso del dominio.

---

## Descargar también es autorización

Este punto es central.

Muchos sistemas modelan bien la autorización sobre:

- órdenes
- usuarios
- tickets
- comentarios
- recursos del negocio

pero, cuando llega el momento de descargar un adjunto, pasan a algo como:

- buscar por nombre
- buscar por ID de archivo
- si existe, devolver

Y ahí se rompe el modelo.

### Porque lo correcto suele ser pensar:

- este archivo pertenece a tal recurso
- ese recurso pertenece a tal usuario o tenant
- el actor actual tiene o no tiene derecho a verlo
- la descarga debe pasar por esa misma lógica

### Regla sana

La autorización de la descarga debería resolverse sobre el recurso de negocio correcto, no solo sobre la existencia física del archivo.

---

## Públicos y privados: la diferencia cambia todo

No es lo mismo descargar:

- una imagen pública de catálogo
- un avatar público
- un brochure abierto

que descargar:

- una factura
- un comprobante
- un contrato
- un documento de soporte
- evidencia de verificación
- adjuntos privados entre usuarios
- archivos internos de operación

### Idea importante

Cuando el archivo es privado o semiprivado, la descarga se parece mucho más a un endpoint sensible de negocio que a un simple recurso estático.

### Regla útil

No mezcles con ligereza la lógica de distribución de contenido público con la de acceso a archivos privados.

---

## URLs predecibles: una fuente clásica de exposición

Un error frecuente es hacer que las descargas dependan de URLs o nombres fáciles de adivinar, por ejemplo:

- nombres consecutivos
- paths con estructura transparente
- nombres originales del archivo
- rutas derivadas del storage
- claves fáciles de enumerar

### Problema

Eso puede facilitar:

- enumeración
- scraping
- acceso horizontal
- descubrimiento de existencia
- correlación entre usuarios o recursos

### Idea importante

Una URL de descarga no debería enseñar más del sistema de lo necesario ni volverse una invitación a probar otros recursos cercanos.

---

## El cliente no debería elegir la ubicación física

Esto conecta con el tema anterior de path traversal.

Una descarga sana no debería basarse en que el cliente mande cosas como:

- path
- filename real
- clave física de storage
- subruta interna
- ubicación del bucket

### Más sano

Que el cliente pida:

- un ID lógico
- un recurso del dominio
- un adjunto asociado

y que el backend resuelva internamente:

- dónde está
- si se puede acceder
- cómo debe servirse

### Regla sana

Menos control del cliente sobre la ubicación real significa menos superficie.

---

## Descargar no siempre debería significar servir directo desde storage

A veces el storage permite acceso directo muy cómodo.
Eso puede ser útil.
Pero no siempre es la mejor decisión para archivos privados.

### Preguntas útiles

- ¿necesito que la descarga pase por autorización del backend?
- ¿el archivo requiere chequeos de negocio al momento de acceso?
- ¿se registran eventos de acceso?
- ¿la URL directa viviría demasiado?
- ¿el enlace expone demasiado sobre el storage?

### Idea importante

La decisión entre servir directo o mediar por backend no es solo de performance.
También es una decisión de control de acceso y trazabilidad.

---

## Si existe un enlace temporal, también es parte del modelo de seguridad

En algunos sistemas aparecen links firmados o temporales para descargar.

Eso puede ser correcto.
Pero no significa “problema resuelto automáticamente”.

Igual conviene pensar:

- cuánto dura
- quién puede generarlo
- si se puede reenviar
- si queda logueado
- si está ligado al actor o solo a la posesión del enlace
- si su TTL es razonable
- qué pasa si el contexto del recurso cambia antes de que expire

### Idea útil

Un link temporal también es una credencial parcial.
Debe tratarse como tal.

---

## La descarga puede filtrar más que el archivo

A veces el archivo en sí no se entrega, pero la respuesta ya filtra información a través de:

- status code
- nombre
- tamaño
- tipo
- timestamps
- headers
- mensajes de error
- diferencias entre “no existe” y “no autorizado”

### Ejemplo mental

Aunque no devuelvas el documento, un endpoint puede confirmar demasiado sobre:

- su existencia
- su tipo
- su pertenencia
- su estado
- si fue generado
- si sigue disponible

### Regla útil

Pensá la descarga completa, incluyendo metadata y errores, como superficie de exposición.

---

## `Content-Disposition` también merece criterio

Al servir archivos, muchas veces el backend define cómo se presenta la descarga, por ejemplo con:

- nombre visible
- inline o attachment
- sugerencia al navegador

Eso parece un detalle menor.
Pero también afecta:

- qué nombre ve el usuario
- si se expone nombre original innecesario
- si el nombre incluye información sensible
- si se filtran IDs o datos internos
- si el archivo se intenta renderizar dentro del navegador

### Idea importante

El nombre visible de descarga no tiene por qué ser el nombre físico, ni necesariamente el nombre original completo que llegó del usuario.

---

## Tipo servido y contexto de consumo

No siempre alcanza con devolver bytes y confiar en que el cliente “sabrá qué hacer”.

Conviene pensar:

- qué `Content-Type` se expone
- si el archivo debe renderizarse inline o descargarse
- si el navegador o el cliente podría interpretarlo de forma no deseada
- si estás sirviendo algo que otros usuarios abrirán desde interfaces comunes

### Idea útil

La forma en que servís un archivo también influye en el riesgo posterior.

---

## Descargas y caché

En algunos contextos, una descarga no debería quedar cacheada del mismo modo que un recurso público.

Especialmente si el archivo es:

- privado
- temporal
- contextual
- sujeto a cambios de autorización
- ligado a una sesión o actor

### Idea importante

No todos los archivos deberían comportarse igual frente a caches intermedios o del cliente.
La estrategia de caching también forma parte de la política de acceso.

---

## Descarga y pertenencia del recurso

Uno de los errores más comunes es separar demasiado:

- el archivo
- y el recurso al que pertenece

Por ejemplo:

- el archivo pertenece a una orden
- la orden pertenece a un usuario
- el usuario autenticado solo debería ver sus órdenes

Si el backend resuelve la descarga solo con el ID del archivo y no vuelve a esa cadena de pertenencia, el riesgo de acceso horizontal sube mucho.

### Regla sana

La autorización debería apoyarse en el ownership o tenant del recurso principal, no quedarse en el “archivo existe y coincide con este ID”.

---

## Listados de archivos y descarga suelen tener el mismo problema

A veces el backend cuida un poco el endpoint de descarga, pero expone listados de adjuntos demasiado ricos.

Por ejemplo, devuelve:

- nombres
- tamaños
- tipos
- estados
- fechas
- IDs
- metadata interna

de archivos que luego no cualquiera debería poder descargar o incluso conocer.

### Idea importante

El modelo de seguridad de las descargas debería ser coherente con el de los listados y metadata asociada.

No sirve esconder el binario si la API igual revela demasiado del recurso.

---

## Descargas y logs

Como en otros flujos, conviene revisar qué se registra cuando alguien descarga.

Porque puede terminar en logs cosas como:

- nombres de archivo
- paths
- URLs firmadas
- IDs correlables
- resultados de autorización
- headers
- metadata sensible

### Regla útil

El flujo de descarga no debería volverse una fuente lateral de fuga por observabilidad excesiva.

---

## Archivos inexistentes, vencidos o revocados

También importa cómo responde el backend cuando el archivo:

- ya no existe
- expiró
- fue eliminado
- fue reemplazado
- ya no debería estar disponible
- dejó de ser visible para ese actor

### Preguntas sanas

- ¿el error enseña demasiado?
- ¿la respuesta confirma existencia histórica?
- ¿el comportamiento es consistente?
- ¿el sistema revela estados internos innecesarios?

### Idea importante

No solo importa la descarga exitosa.
También importa qué aprende un actor en los casos donde no consigue el archivo.

---

## Descargas masivas y scraping

Aunque cada archivo individual sea accesible legítimamente, el canal de descarga también puede usarse para:

- scraping
- extracción masiva
- consumo intensivo
- recorridos automatizados
- descarga de lotes demasiado grandes

### Conviene preguntarse

- ¿hay límites?
- ¿hay monitoreo?
- ¿hay rate limiting?
- ¿hay diferencia entre un uso normal y uno extractivo?
- ¿se pueden pedir muchos archivos muy rápido?

### Idea útil

Una descarga segura también piensa en abuso de volumen, no solo en autorización binaria sí/no.

---

## Nombre visible vs identificador interno

Igual que en uploads, conviene separar:

- el nombre que el usuario ve
- el identificador del recurso
- la ubicación física
- la clave de storage

### Porque cuando todo se mezcla

aparecen problemas como:

- filtración de paths
- nombres correlables
- acoplamiento entre API y storage
- dificultad para rotar o mover archivos
- exposición innecesaria del layout interno

### Regla sana

La descarga debería apoyarse en contratos lógicos, no en detalles físicos del almacenamiento.

---

## Qué conviene revisar en una implementación real

Cuando revises descargas en una app Spring, mirá especialmente:

- endpoints que reciben filename, path o key
- autorización sobre el recurso de negocio asociado
- URLs predecibles
- uso de nombres originales
- diferencias entre público y privado
- headers como `Content-Disposition` y `Content-Type`
- caching de contenido sensible
- manejo de errores de “no encontrado” o “no autorizado”
- logs del flujo de descarga
- uso de enlaces temporales
- capacidad de descarga masiva o scraping

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- más uso de IDs lógicos que de rutas físicas
- autorización resuelta sobre el recurso correcto
- mejor separación entre archivos públicos y privados
- menos URLs fácilmente enumerables
- nombre visible controlado con criterio
- menor exposición de metadata innecesaria
- mejor coherencia entre listado, metadata y descarga real
- menos confianza en que “tener el enlace” equivale automáticamente a estar autorizado
- más atención a volumen y abuso

---

## Señales de ruido

Estas señales merecen revisión rápida:

- descargar por path o filename casi directo
- el backend sirve lo que existe sin mirar ownership o tenant
- URLs o nombres fácilmente adivinables
- archivos privados tratados como si fueran estáticos públicos
- errores que confirman demasiado
- nombres originales o paths filtrados en headers
- listados que revelan mucho aunque la descarga esté más cuidada
- ausencia total de límites frente a scraping o descarga masiva
- nadie puede explicar qué control real se evalúa antes de servir los bytes

---

## Checklist práctico

Cuando revises un flujo de descarga, preguntate:

- ¿el cliente pide un ID lógico o una ubicación física?
- ¿la autorización se evalúa sobre el recurso correcto?
- ¿público y privado están claramente separados?
- ¿la URL enseña demasiado o es fácilmente enumerable?
- ¿el nombre visible expone información innecesaria?
- ¿qué metadata se revela aunque el archivo no se entregue?
- ¿qué pasa si el archivo expiró o ya no debería estar visible?
- ¿hay diferencias problemáticas entre listado y descarga?
- ¿qué volumen de descargas puede hacer un actor sin fricción?
- ¿qué rediseñaría primero para que la descarga deje de depender tanto del storage físico?

---

## Mini ejercicio de reflexión

Tomá un endpoint real de descarga de tu proyecto y respondé:

1. ¿Cómo se identifica el archivo hoy?
2. ¿La descarga se autoriza por existencia del archivo o por el recurso de negocio asociado?
3. ¿Qué metadata se expone aunque no entregues el contenido?
4. ¿La URL o el nombre son previsibles?
5. ¿Qué headers podrían revelar demasiado?
6. ¿Qué actor podría intentar enumerar o descargar en masa?
7. ¿Qué cambio harías primero para que la descarga sea más controlada y menos “directa al storage”?

---

## Resumen

Descargar archivos de forma segura significa tratar la descarga como una decisión de acceso a información y no como un simple stream de bytes.

Los riesgos más comunes aparecen cuando:

- el cliente controla demasiado la ubicación
- la autorización no pasa por el recurso correcto
- público y privado se mezclan
- las URLs son predecibles
- headers y errores revelan demasiado
- se asume que tener el link alcanza
- no se piensa en scraping o extracción masiva

En resumen:

> un backend más maduro no descarga archivos porque “ahí están”.  
> Los entrega solo cuando el actor, el recurso, el contexto y la forma de exposición encajan con una política clara de acceso y mínima revelación.

---

## Próximo tema

**Archivos temporales**
