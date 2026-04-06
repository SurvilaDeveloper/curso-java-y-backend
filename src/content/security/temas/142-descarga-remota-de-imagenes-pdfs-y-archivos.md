---
title: "Descarga remota de imágenes, PDFs y archivos"
description: "Cómo pensar la descarga remota de imágenes, PDFs y archivos como superficie de SSRF en una aplicación Java con Spring Boot. Por qué no alcanza con 'bajar un recurso' y qué preguntas conviene hacerse cuando el backend conecta, descarga, guarda o procesa archivos remotos influenciados por el usuario."
order: 142
module: "Consumo saliente, SSRF y conexiones externas"
level: "base"
draft: false
---

# Descarga remota de imágenes, PDFs y archivos

## Objetivo del tema

Entender por qué la **descarga remota de imágenes, PDFs y archivos** es una superficie muy común de **SSRF** en una aplicación Java + Spring Boot.

La idea de este tema es tomar otra feature que en muchos productos parece totalmente razonable:

- “subí el avatar desde una URL”
- “importá el PDF desde este enlace”
- “bajamos la imagen y la guardamos nosotros”
- “traemos el archivo remoto para procesarlo”
- “si nos das una URL, nosotros hacemos el fetch desde backend”

Todo eso puede ser útil desde negocio y UX.
Pero desde seguridad cambia bastante la conversación.

Porque cuando el backend descarga un recurso remoto, no solo:

- se conecta a un destino influenciado por el usuario

También suele decidir:

- cuánto contenido leer
- si sigue redirects
- si guarda el archivo
- si lo transforma
- si lo parsea
- si lo reexpone
- y qué le devuelve al usuario sobre el éxito o fallo de esa descarga

En resumen:

> descargar un archivo remoto no es solo “traer bytes”.  
> Es una capacidad saliente completa del backend que mezcla SSRF, control de destino, tamaño, tipo de contenido, persistencia y, muchas veces, procesamiento posterior.

---

## Idea clave

Una feature de descarga remota suele implicar algo como:

1. el usuario entrega una URL o algo que la representa
2. el backend resuelve y conecta
3. descarga contenido
4. decide si guardarlo, transformarlo o rechazarlo
5. a veces lo procesa después
6. devuelve señales sobre lo ocurrido

La idea central es esta:

> cuando la app “baja un archivo por vos”, el backend se convierte en un cliente privilegiado hacia el destino remoto y, además, en un custodio de lo que ese destino devuelva.

Eso vuelve la superficie más rica que una request saliente simple.

Porque no solo importa:
- adónde conectó

también importa:
- qué consiguió
- cuánto consiguió
- qué hizo con eso
- y qué más activó después.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que una descarga remota es solo una convenience feature
- revisar solo el host y olvidarse del tamaño o tipo de contenido
- asumir que si el archivo parece inocente entonces la request también lo fue
- no ver que una “importación desde URL” sigue siendo una superficie de SSRF
- olvidar que la app puede guardar y reutilizar el contenido descargado
- no distinguir entre conectar, descargar, persistir y procesar
- tratar imágenes y PDFs como si fueran automáticamente menos delicados
- devolver mensajes de error o éxito demasiado ricos sobre reachability o contenido

Es decir:

> el problema no es solo permitir que el backend baje archivos.  
> El problema es no ver que eso abre al mismo tiempo una capacidad de red y una capacidad de ingestión de contenido remoto.

---

## Error mental clásico

Un error muy común es este:

### “Solo descargamos una imagen / un PDF, así que el riesgo es menor”

Eso minimiza demasiado la superficie.

Porque aunque el recurso sea “solo un archivo”, la app sigue:

- haciendo una request saliente
- resolviendo un destino
- potencialmente siguiendo redirects
- alcanzando una red distinta de la del usuario
- recibiendo contenido no confiable
- y a veces procesándolo o guardándolo

### Idea importante

No hay que subestimar un flujo solo porque su resultado funcional sea un archivo y no una respuesta JSON de API.
Desde SSRF, el paso crítico sigue siendo:
- **el backend conectándose a un destino influenciado por el usuario**.

---

## Por qué esta feature aparece tanto en apps reales

La descarga remota es muy común porque resuelve fricciones de producto bastante concretas.

Aparece en cosas como:

- avatares o imágenes de perfil
- catálogos
- ecommerce
- CMS
- importación de documentos
- adjuntos remotos
- sincronización con archivos externos
- backoffices que “traen” material desde otra URL
- paneles donde un admin pega un enlace de imagen o PDF
- migraciones e ingestiones de contenido

### Idea útil

Cuanto más un producto quiera “facilitarte subir algo sin que lo subas manualmente”, más probable es que haya una feature de descarga remota detrás.
Y esa feature merece mirada de SSRF.

---

## No se trata solo del enlace: se trata del pipeline que se activa después

Otro motivo por el que esta superficie importa mucho es que la request saliente suele ser apenas el comienzo.

Después de descargar, la app puede:

- guardar el archivo en storage
- generar thumbnails
- extraer metadata
- leer páginas de un PDF
- verificar tipo MIME
- indexar contenido
- mandar el archivo a otro servicio
- reexponerlo luego a otros usuarios

### Idea importante

La request saliente inicial puede abrir más riesgo porque dispara una cadena de procesamiento posterior sobre contenido no confiable.

---

## Imágenes: parecen inocentes, pero no lo son automáticamente

Las imágenes suelen subestimarse mucho porque parecen “menos peligrosas” que un archivo ejecutable o que una integración compleja.

Sin embargo, una descarga remota de imagen puede seguir implicando:

- SSRF hacia destinos no esperados
- redirects
- tamaños muy grandes
- tipos de archivo engañosos
- recursos secundarios
- transformaciones posteriores
- thumbnails o parsers de imagen

### Regla sana

No confundas “tipo de archivo visualmente inocente” con “flujo de red y de procesamiento inocente”.

---

## PDFs y documentos: más superficie de lo que parece

Con PDFs y documentos pasa algo parecido, a veces aún más delicado.

Porque además de la descarga remota, suelen aparecer expectativas como:

- leer título
- contar páginas
- extraer texto
- generar vista previa
- indexar contenido
- convertir formato
- guardar una copia interna

### Idea importante

Un “importar PDF desde URL” no solo le da al backend capacidad de conectarse.
También le da un motivo de negocio para procesar bastante contenido no confiable después.

---

## Lo que más importa al inicio sigue siendo el destino

Aunque el archivo descargado luego abra otros temas, la base de SSRF sigue igual:

- ¿quién definió la URL?
- ¿qué esquema aceptamos?
- ¿qué host y puerto son válidos?
- ¿hay redirects?
- ¿qué red puede alcanzar el backend?
- ¿puede tocar localhost, red privada o metadata?

### Idea útil

No dejes que la conversación sobre “qué archivo es” tape la conversación sobre “adónde salió el backend para buscarlo”.

---

## La descarga remota también puede servir como canal de reconocimiento

Igual que en previews y callbacks, no hace falta que el usuario obtenga el contenido completo para que la feature ya sea útil desde una perspectiva ofensiva.

A veces basta con recibir señales como:

- si el host respondió
- si el tipo de contenido fue aceptado o rechazado
- si hubo timeout
- si el tamaño era grande
- si el recurso existía
- si hubo redirect
- si el backend logró alcanzarlo

### Idea importante

Una feature que “solo baja archivos” también puede convertirse en una forma de mapear reachability desde la red del backend.

---

## Guardar el archivo no borra el riesgo, lo prolonga

Otro punto importante es que muchas veces el sistema no solo descarga y responde.
También persiste.

Eso significa que un recurso remoto elegido por usuario puede terminar:

- adentro de tu storage
- asociado a una entidad de negocio
- procesado por otros jobs
- visible para otros usuarios
- reusado más tarde

### Regla sana

La decisión de descargar desde un destino remoto puede tener efectos persistentes, no solo instantáneos.

---

## El backend puede transformarse en “importador general” sin querer

Este es un patrón muy común.

Una feature empieza pequeña:

- “dejemos traer una imagen desde URL”

Luego crece:

- PDF también
- DOC también
- ZIP también
- cualquier archivo si pasa validaciones mínimas
- extracción de metadata
- reintentos
- progresos de carga
- importación en background

### Problema

Lo que empezó como conveniencia moderada termina pareciéndose a una capacidad de ingestión remota muy amplia.

### Idea importante

Cuanto más genérica se vuelve la importación por URL, más importante es repensar sus límites salientes y de contenido.

---

## Tamaño y límites importan aunque el tema sea SSRF

Este curso está mirando principalmente la parte SSRF.
Pero en esta superficie conviene recordar que también importa:

- cuánto contenido se descarga
- si hay límites de tamaño
- si se corta temprano o no
- si se descarga completo antes de validar
- si el sistema permite archivos gigantes
- si el backend queda consumiendo tiempo, memoria o ancho de banda de más

### Idea útil

La misma feature puede mezclar:
- alcance de red
y
- consumo de recursos locales.

Y ambas cosas importan.

---

## Tipo de contenido y confianza posterior

Otra zona delicada es qué hace la aplicación con el archivo una vez descargado.

No alcanza con decir:
- “era una imagen”
o
- “era un PDF”

Conviene preguntarse:

- ¿cómo lo sabemos?
- ¿en qué momento lo decidimos?
- ¿qué parte del pipeline confía en ese tipo?
- ¿qué otras librerías lo tocarán después?
- ¿se guarda antes o después de ciertas verificaciones?

### Idea importante

La descarga remota puede ser solo la puerta de entrada de otros problemas si el contenido se procesa con demasiada confianza después.

---

## Redirects vuelven a importar mucho

Una descarga remota suele querer “funcionar bien” con enlaces reales del mundo.
Eso empuja a seguir redirects.

Pero ya vimos por qué eso es peligroso si no se revalida:

- host
- esquema
- puerto
- red alcanzada
- allowlist
- destino final

### Regla sana

Una descarga de archivo que sigue redirects sin demasiada disciplina suele ampliar mucho la superficie de SSRF.

---

## Background jobs y colas: el riesgo no desaparece

Muchas implementaciones hacen esto en segundo plano:

- el usuario pega una URL
- se encola
- un worker descarga luego
- se procesa offline

Eso puede ser bueno para UX.
Pero no cambia la naturaleza del riesgo.

### Idea importante

El hecho de que la descarga ocurra en background no la vuelve más segura.
Solo cambia:
- cuándo ocurre
- en qué proceso
- y quizá qué red o recursos locales tiene disponibles ese worker

---

## Workers y servicios dedicados también merecen revisión propia

Esto es importante porque a veces el componente que descarga no es la app principal, sino:

- un worker
- un job scheduler
- un microservicio de ingestión
- un servicio de thumbnails
- un extractor documental

### Regla sana

No asumas que el riesgo es el mismo o menor.
A veces esos procesos tienen:
- más permisos
- más red
- más recursos
- menos observabilidad

### Idea importante

En descarga remota, la superficie real puede vivir en el worker más que en el controller.

---

## Qué preguntas conviene hacer sobre una feature de descarga remota

Cuando revises una funcionalidad de este tipo, conviene preguntar:

- ¿quién define la URL?
- ¿qué esquemas aceptamos?
- ¿qué hosts y puertos son legítimos?
- ¿seguimos redirects?
- ¿qué red puede alcanzar el backend o el worker?
- ¿hay límites de tamaño?
- ¿qué tipos de contenido aceptamos?
- ¿cuándo validamos eso?
- ¿qué guardamos?
- ¿qué procesamos después?
- ¿qué señales de reachability o de tipo de archivo devolvemos al usuario?

### Regla sana

No pienses la descarga solo como “traer archivo”.
Pensala como:
- **salida de red + ingreso de contenido + procesamiento posterior**.

---

## Qué revisar en una codebase Spring

En una app Spring, esta superficie suele aparecer alrededor de:

- `FileImportService`
- `RemoteImageService`
- `PdfFetchService`
- `AttachmentImportJob`
- `DocumentIngestionService`
- `AvatarDownloadService`
- `StorageImportService`
- uso de `RestTemplate`, `WebClient` o clientes similares para bajar binarios
- pipelines de thumbnails, OCR, parsing o indexación posteriores
- workers async que consumen URLs persistidas

### Idea útil

Si una parte del sistema recibe una URL y termina guardando bytes que vinieron de allí, esa parte merece una revisión muy seria.

---

## Qué vuelve más sana a una feature así

Una implementación más sana suele mostrar:

- menos flexibilidad de destino
- mejor control de redirects
- límites claros de tamaño
- mejor separación entre descarga y procesamiento
- tipos de contenido más acotados
- menos mensajes ricos sobre reachability
- workers y servicios con contrato saliente claro
- menos genericidad de “cualquier archivo desde cualquier URL”

### Idea importante

No se trata de prohibir toda descarga remota.
Se trata de evitar que se convierta en una puerta demasiado amplia hacia destinos y contenidos poco controlados.

---

## Qué señales de ruido deberían prenderte alarmas

Estas señales merecen revisión rápida:

- “pegá cualquier URL y te lo bajamos”
- follow redirects automático
- pocos límites de tamaño
- mucha variedad de tipos aceptados
- cliente HTTP genérico
- workers con alta conectividad
- el sistema guarda o procesa el archivo antes de controles más fuertes
- mensajes muy detallados sobre por qué el backend no pudo bajar el recurso
- nadie separó mentalmente SSRF, descarga y procesamiento posterior

### Regla sana

Cuanto más “importador universal” se siente la feature, más fuerte debería ser tu sospecha.

---

## Qué conviene revisar en una app Spring

Cuando revises descarga remota de imágenes, PDFs y archivos en una aplicación Spring, mirá especialmente:

- qué inputs definen el destino remoto
- qué cliente HTTP o worker hace la descarga
- qué redirects se siguen
- qué límites de tamaño existen
- qué tipos de contenido se aceptan
- qué información se devuelve al usuario
- qué almacenamiento o procesamiento posterior ocurre
- si el destino puede llegar a localhost, red privada o metadata
- si hay separación clara entre feature de negocio y capacidad saliente
- cuánto poder real tiene ese pipeline una vez que empieza a descargar

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- descargas más acotadas
- mejor validación de destino
- menos flexibilidad gratuita
- límites de tamaño y comportamiento más claros
- procesamiento posterior mejor desacoplado
- menos genericidad de importación
- mejor alineación entre UX y política saliente real

---

## Señales de ruido

Estas señales merecen revisión rápida:

- cualquier URL sirve
- redirects libres
- límites de tamaño poco claros
- cliente o worker muy poderoso
- muchos tipos de archivo
- poco control sobre el destino real
- almacenamiento o parsing inmediato sin demasiada separación
- el equipo trata esto como simple comodidad y no como superficie seria de red

---

## Checklist práctico

Cuando revises una feature de descarga remota, preguntate:

- ¿quién define el destino?
- ¿qué host, esquema y puerto aceptamos?
- ¿seguimos redirects?
- ¿qué red ve el backend o el worker?
- ¿qué tamaño máximo toleramos?
- ¿qué tipos de contenido aceptamos de verdad?
- ¿qué guardamos y qué procesamos después?
- ¿qué mensajes o señales devolvemos al usuario?
- ¿qué parte del pipeline existe por conveniencia más que por necesidad real?
- ¿qué restringirías primero para que la feature deje de parecer un importador demasiado libre?

---

## Mini ejercicio de reflexión

Tomá una app Spring tuya y respondé:

1. ¿Existe alguna feature de descarga remota de imagen, PDF o archivo?
2. ¿Quién define la URL?
3. ¿Qué límites de destino y de tamaño tiene hoy?
4. ¿Se siguen redirects?
5. ¿Qué guarda el sistema y qué procesa después?
6. ¿Qué worker o servicio hace el fetch real?
7. ¿Qué cambio harías primero para reducir la superficie SSRF de ese flujo?

---

## Resumen

La descarga remota de imágenes, PDFs y archivos es una superficie muy clara de SSRF porque combina:

- una request saliente hacia un destino influenciado por usuario
- capacidad del backend para alcanzar redes privilegiadas
- ingestión de contenido no confiable
- y, muchas veces, persistencia o procesamiento posterior

No es solo “bajar un archivo”.
Es una decisión sobre:

- adónde se conecta el backend
- qué acepta descargar
- cuánto lee
- qué guarda
- qué transforma
- y qué señales devuelve

En resumen:

> un backend más maduro no ve la importación remota de archivos como una simple comodidad de carga ni como una mejora menor de UX.  
> La ve como una capacidad compuesta de salida de red e ingestión de contenido, porque entiende que cada vez que promete “nosotros te lo bajamos desde la URL”, también está prometiendo que el servidor resolverá, conectará, descargará y quizá procesará un recurso elegido o influido por otro actor desde una posición de red privilegiada, y que la seguridad real de esa promesa depende tanto del control del destino y del recorrido como de los límites que impongas sobre el tamaño, el tipo, el almacenamiento y el pipeline posterior del contenido que acabás de meter adentro de tu sistema.

---

## Próximo tema

**Pruebas de conectividad y botones de ‘test connection’**
