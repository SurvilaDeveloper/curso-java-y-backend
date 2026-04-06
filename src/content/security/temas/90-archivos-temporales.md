---
title: "Archivos temporales"
description: "Cómo aparecen riesgos de seguridad con archivos temporales en una aplicación Java con Spring Boot. Por qué lo temporal no significa inocuo, qué problemas surgen al crear, procesar o limpiar archivos intermedios, y cómo pensar aislamiento, naming, lifecycle y exposición para que los temporales no se vuelvan otra fuente de fuga o abuso."
order: 90
module: "Archivos, serialización y procesamiento riesgoso"
level: "base"
draft: false
---

# Archivos temporales

## Objetivo del tema

Entender qué riesgos aparecen con los **archivos temporales** en una aplicación Java + Spring Boot.

La idea es revisar una superficie muy común y muy subestimada.

En muchos flujos, el equipo piensa algo así:

- “esto va a disco solo un rato”
- “es temporal”
- “después se borra”
- “no forma parte del storage real”
- “no vale la pena pensarlo tanto”

Ese razonamiento suele abrir problemas serios.

Porque los archivos temporales pueden contener:

- uploads recién recibidos
- documentos antes de validarse o convertirse
- previews o thumbnails intermedias
- salidas parciales de procesamiento
- exports
- archivos descomprimidos
- material sensible usado por tareas internas
- resultados que todavía no fueron autorizados ni saneados

En resumen:

> que un archivo sea temporal no lo vuelve inofensivo.  
> Solo significa que su ciclo de vida debería ser más corto, no que merezca menos controles.

---

## Idea clave

Un archivo temporal es un archivo que el sistema crea o usa durante un flujo intermedio y que, en teoría, no debería vivir mucho tiempo.

Pero desde seguridad importa menos la intención de “ser temporal” y más estas preguntas:

- ¿qué contiene?
- ¿dónde vive?
- ¿quién puede tocarlo?
- ¿cómo se nombra?
- ¿cómo se limpia?
- ¿qué pasa si el proceso falla?
- ¿puede mezclarse con temporales de otros usuarios o tenants?
- ¿qué daño produce si no se borra cuando debía?

La idea central es esta:

> lo temporal solo es seguro si tiene límites reales de ubicación, acceso y vida útil.  
> Si no, se convierte en almacenamiento persistente accidental y muchas veces más desordenado que el storage principal.

---

## Qué problema intenta resolver este tema

Este tema busca evitar patrones como:

- crear temporales en rutas compartidas sin control claro
- asumir que el sistema operativo o la librería “ya los borrará”
- dejar archivos sensibles en disco después de errores o abortos
- usar nombres previsibles o colisionables
- mezclar temporales de distintos usuarios o procesos
- no separar temporales públicos, privados y de procesamiento interno
- olvidar que previews, conversiones o descompresiones generan más temporales
- tratar un directorio temporal como si fuera invisible o intrínsecamente seguro
- loguear paths temporales con demasiada información
- olvidar que los temporales también pueden terminar en backups, snapshots o dumps

Es decir:

> el problema no es usar archivos temporales.  
> El problema es tratarlos como si no contaran porque “después se borran”.

---

## Error mental clásico

Un error muy común es este:

### “Como es temporal, no hace falta modelarlo tanto”

Eso es una mala señal.

Porque el riesgo real no depende solo de cuánto tiempo debería vivir el archivo.
También depende de:

- si efectivamente se borra
- si alguien puede verlo mientras existe
- si su nombre o path revelan demasiado
- si se mezcla con otros flujos
- si queda abandonado tras un fallo
- si contiene datos más sensibles que el archivo final

### Idea importante

Un temporal puede ser más delicado que el archivo persistido definitivo.
Por ejemplo, porque todavía no fue validado, sanitizado, recortado o autorizado.

---

## Dónde aparecen archivos temporales en una app Spring real

Los temporales suelen aparecer en flujos como:

- uploads multipart
- conversión de imágenes o PDFs
- generación de thumbnails o previews
- OCR
- descompresión de ZIP
- exportación de CSV o Excel
- generación de reportes
- firma o sellado intermedio de documentos
- parsing de adjuntos
- importaciones
- pipelines batch
- integraciones que primero escriben a disco antes de procesar

### Idea útil

A veces el equipo ni siquiera “decidió” usar temporales de forma explícita.
La librería, el framework o el sistema ya los está usando debajo.
Y eso igual merece revisión.

---

## Temporal no significa privado

Este punto es central.

Hay gente que asume que un archivo temporal, por estar en una carpeta “temporal”, ya está protegido.

Eso es falso por sí solo.

Porque la carpeta temporal puede:

- ser compartida
- tener más visibilidad de la esperada
- ser accesible por otros procesos
- quedar dentro de snapshots
- ser revisada por operadores
- mezclarse con temporales de otros servicios

### Regla sana

Nunca supongas que “temporal” equivale a “aislado” o “privado”.
Eso tiene que diseñarse.

---

## Qué suele contener un temporal

Conviene preguntarse qué tipo de material pasa por esos archivos.

### Ejemplos comunes

- archivo recién subido por el usuario
- documento antes de ser validado
- archivo ya validado pero todavía no autorizado para exposición
- contenido convertido desde otro formato
- resultados parciales con texto extraído
- imágenes reescaladas
- datos listos para exportar
- PDFs intermedios
- material de debugging o soporte

### Idea importante

No todos los temporales tienen la misma sensibilidad.
Pero muchos contienen exactamente lo que no querrías dejar tirado en disco sin control.

---

## El problema no es solo confidencialidad

Los temporales pueden generar riesgos de varios tipos:

### Confidencialidad
- otro actor o proceso puede leerlos
- quedan expuestos más tiempo del debido
- sobreviven a errores o reinicios

### Integridad
- pueden ser reemplazados o mezclados
- un flujo puede consumir un temporal incorrecto
- puede haber colisiones de nombres

### Disponibilidad
- se acumulan
- llenan disco
- degradan rendimiento
- generan cleanup caro
- bloquean procesamiento futuro

### Idea útil

Archivos temporales mal gestionados son una fuente de fuga, corrupción y problemas operativos al mismo tiempo.

---

## Nombres temporales previsibles o reutilizados

Otro error clásico es crear temporales con nombres demasiado predecibles o poco aislados.

### Problemas típicos

- colisiones entre requests
- sobreescritura involuntaria
- mezcla entre usuarios
- mayor facilidad para adivinar ubicaciones
- debugging confuso
- consumo de archivos equivocados por procesos paralelos

### Regla sana

Un temporal no debería depender de nombres fáciles de adivinar ni de convenciones que permitan choques entre flujos concurrentes.

---

## No mezclar identificador visible con nombre físico temporal

A veces el equipo usa cosas como:

- nombre original del archivo
- email del usuario
- ID del recurso
- nombre del cliente

dentro del path o filename temporal.

Eso puede ser cómodo para debugging, pero también puede:

- exponer PII
- revelar contexto de negocio
- volver el path más correlable
- aumentar la superficie si aparece en logs o errores
- facilitar colisiones o suposiciones externas

### Idea importante

El nombre físico temporal no necesita ser “humano” para cumplir su función.
Y muchas veces es mejor que no lo sea.

---

## El cleanup no debería depender solo del camino feliz

Uno de los mayores problemas con temporales aparece cuando el equipo piensa solo en el caso ideal:

- llega el archivo
- se procesa bien
- se genera resultado
- se borra el temporal

Pero en la práctica también hay:

- excepciones
- timeouts
- reinicios
- abortos del cliente
- procesos interrumpidos
- conversiones fallidas
- pipelines a medias

### Regla sana

Una estrategia de cleanup seria tiene que contemplar también:

- errores
- cancelaciones
- caídas parciales
- tareas huérfanas
- archivos viejos no recogidos a tiempo

Temporal sin cleanup fuera del camino feliz suele acabar siendo persistente accidental.

---

## Archivos temporales y procesamiento por lotes

En batchs o pipelines asíncronos, el riesgo puede crecer todavía más.

Porque pueden aparecer:

- colas de temporales pendientes
- varios estados intermedios
- archivos procesados a destiempo
- retrys
- temporales viejos que se vuelven input de otro job
- resultados parciales mezclados con nuevos

### Idea útil

Cuanto más distribuido o desacoplado es el procesamiento, más importante es tener claramente definido el ciclo de vida de cada temporal.

---

## Temporales y aislamiento por usuario o tenant

Si tu sistema maneja contenido de múltiples usuarios, clientes o tenants, conviene preguntarte:

- ¿estos temporales se separan por actor o contexto?
- ¿puede un error mezclar archivos de dos usuarios?
- ¿una tarea podría leer el temporal equivocado?
- ¿un operador podría inferir pertenencia mirando nombres o rutas?
- ¿un proceso paralelo podría interferir con otro?

### Idea importante

La separación lógica del negocio también debería reflejarse en cómo se manejan los temporales.

---

## Los temporales también pueden terminar en backups o snapshots

Otro punto muy subestimado:

aunque el archivo sea “temporal”, igual puede ser capturado por:

- snapshots de volumen
- dumps
- backups del sistema
- imágenes de contenedor
- herramientas de forense o debugging
- restauraciones posteriores

### Problema

Eso rompe bastante la intuición de “vive poco, entonces no importa”.

### Regla útil

Si el temporal contiene información sensible, pensá no solo en su vida útil ideal, sino en qué otras copias laterales puede arrastrar mientras existe.

---

## Directorios temporales compartidos: cuidado especial

Muchos sistemas usan el directorio temporal por defecto del sistema operativo o del runtime.

Eso puede ser válido en algunos contextos, pero no debería asumirse como una respuesta completa.

### Conviene revisar

- quién más usa ese espacio
- si queda mezclado con otros procesos
- qué permisos tiene
- qué limpieza automática existe
- qué visibilidad operativa tiene
- si el volumen se comparte con otras apps o contenedores

### Idea importante

Un directorio temporal compartido es una conveniencia técnica, no una política de seguridad.

---

## El temporal también necesita autorización indirecta

Aunque el usuario no acceda directamente al archivo temporal, igual importa quién puede llegar a él por otras vías.

Por ejemplo:

- herramientas internas
- procesos auxiliares
- jobs de soporte
- debugging
- acceso al host
- visores administrativos

### Idea útil

El temporal forma parte del mismo sistema de datos.
No queda fuera de la conversación de acceso solo porque no tenga un endpoint público.

---

## No todo debería pasar por archivo temporal

A veces se usan temporales por costumbre cuando el flujo podría resolverse de otra forma más segura o más simple.

Por ejemplo, conviene preguntarse:

- ¿realmente necesito escribir a disco?
- ¿podría usar stream acotado?
- ¿podría procesar de forma menos persistente?
- ¿necesito conservar el intermedio o solo el resultado?
- ¿vale la pena esta etapa extra?

### Idea importante

La mejor defensa sobre temporales innecesarios muchas veces es no crearlos.

---

## Archivos derivados también son temporales… hasta que dejan de serlo

Hay muchos outputs intermedios que “nacen” como temporales pero luego quedan vivos más de la cuenta.

### Ejemplos

- thumbnails
- previews
- archivos convertidos
- texto extraído
- PDFs intermedios
- ZIP descomprimidos
- crops de imágenes
- reportes generados

### Problema

Nadie cambia explícitamente su estatus, pero siguen ahí.
Y terminan funcionando como storage secundario desordenado.

### Regla sana

Todo derivado temporal necesita una decisión clara:

- se borra
- se promueve a storage estable
- se vuelve a generar bajo demanda
- se retiene con plazo definido

No debería quedar en una zona gris.

---

## Logging y errores pueden empeorar el riesgo

Como en otros temas, también importa qué se registra alrededor de temporales.

### Riesgos comunes

- loguear rutas completas
- incluir nombres con PII
- mostrar estructura del directorio temporal
- exponer errores de acceso o permisos con demasiado detalle
- revelar que cierto archivo temporal existe o existió

### Idea útil

Aunque el archivo temporal no sea accesible directamente, el sistema puede enseñarle demasiado a un atacante o actor curioso a través de logs y errores.

---

## Temporales y concurrencia

En sistemas con múltiples requests o jobs al mismo tiempo, los temporales mal diseñados pueden generar:

- carreras
- colisiones
- consumo del archivo equivocado
- cleanup de un archivo todavía en uso
- resultados cruzados
- errores difíciles de reproducir

### Regla práctica

El diseño de temporales tiene que pensar no solo en un caso aislado, sino en concurrencia real.

---

## Qué conviene revisar en una implementación real

Cuando revises archivos temporales en una app Spring o Java, mirá especialmente:

- dónde se crean
- cómo se nombran
- qué contienen
- cuánto tiempo deberían vivir
- cómo se limpian en caso de éxito
- cómo se limpian en caso de error o caída
- si están aislados por flujo, usuario o tenant
- si el directorio temporal es compartido
- si aparecen en logs, snapshots o backups
- si ciertos derivados quedaron temporales “para siempre”
- si algunos temporales podrían evitarse por completo

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- temporales con propósito claro
- nombres no correlables ni fácilmente colisionables
- menos datos sensibles en paths o filenames
- cleanup contemplado también en fallos
- mejor aislamiento entre flujos
- menor permanencia accidental
- menos dependencia de directorios temporales compartidos sin criterio
- mayor claridad sobre qué se borra, qué se promueve y qué se vuelve a generar

---

## Señales de ruido

Estas señales merecen revisión rápida:

- “después se borra” como única política
- nadie sabe dónde quedan los temporales
- nombres con PII o contexto de negocio
- cleanup solo en el camino feliz
- derivados viejos acumulándose
- directorios temporales compartidos usados por muchos procesos
- logs que muestran paths completos
- archivos temporales capturados por backups sin que nadie lo tenga en mente
- el equipo no puede explicar cuánto viven realmente esos archivos

---

## Checklist práctico

Cuando revises temporales, preguntate:

- ¿qué información contienen?
- ¿realmente hacía falta escribirla a disco?
- ¿dónde viven y con qué aislamiento?
- ¿cómo se nombran?
- ¿qué pasa si el proceso falla antes de borrarlos?
- ¿qué evita colisiones o cruces entre usuarios y jobs?
- ¿cuánto tiempo viven en la práctica, no en teoría?
- ¿qué otros sistemas podrían capturarlos o verlos?
- ¿qué derivados “temporales” en realidad ya son casi permanentes?
- ¿qué simplificaría para que hubiera menos temporales o menos sensibles?

---

## Mini ejercicio de reflexión

Tomá un flujo real de tu proyecto que use archivos temporales, por ejemplo:

- upload con conversión
- preview de PDF
- thumbnail de imagen
- importación de CSV
- export a Excel

y respondé:

1. ¿Qué temporales se crean?
2. ¿Qué contienen?
3. ¿Cómo se nombran?
4. ¿Dónde quedan?
5. ¿Cómo se limpian si todo sale bien?
6. ¿Cómo se limpian si algo falla o el proceso se interrumpe?
7. ¿Qué cambio harías primero para que ese flujo dependiera menos de temporales o los manejara con más aislamiento?

---

## Resumen

Los archivos temporales son una superficie de riesgo real porque suelen contener material sensible, intermedio o todavía no saneado, y muchas veces se manejan con menos rigor que el storage principal.

Los problemas más comunes aparecen cuando:

- se asume que “temporal” equivale a “seguro”
- no hay cleanup robusto
- los nombres o paths revelan demasiado
- hay colisiones o mezcla entre flujos
- se capturan por backups o snapshots
- los derivados intermedios sobreviven sin política clara

En resumen:

> un backend más maduro no trata los temporales como basura técnica inocente.  
> Los trata como datos reales con ubicación, ciclo de vida, aislamiento y cleanup explícitos, porque entiende que lo transitorio mal gobernado suele convertirse en exposición persistente por accidente.

---

## Próximo tema

**Qué nunca hacer con rutas del sistema**
