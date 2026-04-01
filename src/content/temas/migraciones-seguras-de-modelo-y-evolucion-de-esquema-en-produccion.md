---
title: "Migraciones seguras de modelo y evolución de esquema en producción"
description: "Qué significa evolucionar el esquema de una base de datos sin romper el backend ni los consumidores, por qué las migraciones son una parte crítica del cambio seguro, qué riesgos aparecen cuando código, datos y estructura cambian a la vez, y cómo diseñar transiciones seguras en producción usando compatibilidad temporal, secuencias controladas y limpieza posterior."
order: 122
module: "Calidad, evolución y mantenibilidad a largo plazo"
level: "intermedio"
draft: false
---

## Introducción

Cuando un sistema empieza, muchas veces cambiar el modelo de datos parece algo simple.

- agregás una columna
- renombrás un campo
- borrás una tabla que “ya no se usa”
- corrés una migración
- actualizás el código
- seguís adelante

En desarrollo local eso suele funcionar.

Pero en producción la historia cambia bastante.

Porque ahí ya existen:

- datos reales
- versiones desplegadas o en transición
- procesos en curso
- consumidores internos o externos
- jobs que siguen corriendo
- lecturas y escrituras concurrentes
- ventanas donde conviven comportamiento viejo y nuevo

Entonces una migración no es solo “cambiar la base”.
Es cambiar una parte viva del sistema sin romper el resto.

Y por eso este tema es tan importante.

Porque muchos cambios peligrosos no fallan por mala lógica de negocio,
sino por una mala transición entre esquema viejo y esquema nuevo.

## Qué problema intenta resolver una migración segura

Una migración segura busca que el sistema pueda evolucionar sin exigir un salto instantáneo e irreal.

En el mundo ideal, todo cambia a la vez:

- el esquema
- el código backend
- los datos existentes
- los jobs
- los consumidores
- los dashboards
- los procesos operativos

Pero en la práctica eso casi nunca pasa.

Los cambios reales suelen ocurrir en etapas.
Y durante esas etapas aparece una convivencia incómoda:

- código nuevo leyendo datos viejos
- código viejo conviviendo con columnas nuevas
- datos parcialmente migrados
- consumidores todavía usando contratos anteriores
- escrituras que llegan mientras la transición sigue abierta

Entonces el objetivo no es solo “aplicar una migración SQL”.
El objetivo es diseñar una transición segura.

## La base no evoluciona sola

Éste es un punto central.

Cuando hablamos de evolucionar esquema, en realidad solemos estar tocando varias capas al mismo tiempo:

- modelo persistente
- código de aplicación
- consultas
- validaciones
- índices
- contratos internos
- reportes
- procesos batch
- integraciones externas

Por eso una migración rara vez es puramente de base de datos.

Casi siempre implica coordinación entre:

- estructura
- comportamiento
- datos históricos
- operación

Si tratás una migración delicada como si fuera solo un script, el riesgo sube mucho.

## Error frecuente: pensar la migración como un cambio atómico mágico

Un error muy común es imaginar algo así:

1. renombro la columna
2. cambio el código
3. despliego
4. listo

El problema es que en sistemas reales muchas veces no existe ese “instante mágico” donde todo cambia al mismo tiempo.

Por ejemplo:

- puede haber más de una instancia corriendo
- puede haber workers procesando con versión anterior
- puede haber requests en vuelo
- puede haber jobs programados con código viejo
- puede haber réplicas o consumidores leyendo a distinto ritmo
- puede haber datos antiguos que todavía no cumplen el formato nuevo

Entonces las migraciones seguras suelen exigir pensar en **coexistencia temporal**.

## Cambiar esquema no es solo agregar o borrar columnas

Cuando alguien dice “vamos a migrar el modelo”, eso puede significar muchas cosas distintas.

Por ejemplo:

- agregar una columna nueva
- dividir un campo en dos
- mover información a otra tabla
- introducir una relación nueva
- eliminar una restricción vieja
- volver obligatoria una columna que antes era nullable
- cambiar un tipo de dato
- crear índices
- particionar una tabla
- reemplazar una representación vieja por otra nueva

Algunos cambios son relativamente baratos.
Otros son especialmente peligrosos.

En general, cuanto más afecte un cambio a:

- datos históricos
- volumen
- escrituras concurrentes
- compatibilidad con versiones viejas
- contratos externos
- performance

más importante se vuelve diseñarlo en pasos.

## Expand and contract: una idea clave

Uno de los patrones más útiles para pensar migraciones seguras es **expand and contract**.

La lógica general es:

## 1. Expandir

Primero agregás lo nuevo sin romper lo viejo.

Por ejemplo:

- agregás columna nueva
- agregás tabla nueva
- permitís ambos formatos
- hacés compatible lectura y escritura

## 2. Migrar uso

Después movés progresivamente el comportamiento hacia el camino nuevo.

Por ejemplo:

- empezás a escribir en la columna nueva
- leés de ambas temporalmente
- hacés backfill de datos históricos
- actualizás consumidores

## 3. Contraer

Cuando ya nadie depende de lo viejo, recién ahí retirás:

- columna vieja
- camino legacy
- lógica dual
- compatibilidades temporales

Esta idea parece más lenta que el cambio brusco.
Y a veces lo es.

Pero también suele ser muchísimo más segura.

## Ejemplo simple: separar un campo `full_name`

Supongamos que hoy tenés una columna:

- `full_name`

Y querés pasar a:

- `first_name`
- `last_name`

Un enfoque riesgoso sería:

- borrar `full_name`
- crear `first_name` y `last_name`
- cambiar todo el código de una vez

Un enfoque más seguro sería:

1. agregar `first_name` y `last_name`
2. mantener `full_name`
3. adaptar escritura para poblar ambas representaciones por un tiempo
4. hacer backfill desde datos existentes
5. adaptar lectura para priorizar campos nuevos donde corresponda
6. actualizar consumidores
7. verificar que ya no se dependa de `full_name`
8. recién ahí eliminar `full_name`

Eso es más trabajo.
Pero también reduce muchísimo la chance de dejar el sistema en un estado intermedio roto.

## Compatibilidad hacia atrás aplicada a migraciones

La lección anterior trató sobre **branching, releases y estrategia de cambios en equipos reales**.
Y antes de eso vimos **compatibilidad hacia atrás en código, contratos y flujos**.

Acá ambas ideas se vuelven muy concretas.

Porque una migración segura casi siempre depende de que durante un tiempo el sistema soporte convivencia.

Eso puede implicar:

- leer formato viejo y nuevo
- escribir en doble camino temporalmente
- aceptar valores opcionales por un tiempo
- evitar asumir que toda la base ya quedó transformada
- mantener contratos compatibles mientras otros componentes se actualizan

Sin compatibilidad temporal, muchas migraciones se vuelven todo-o-nada.
Y eso en producción suele ser peligroso.

## Tipos de cambios especialmente sensibles

Hay ciertos cambios que merecen más cuidado que otros.

## 1. Renombres

Los renombres parecen inocentes,
pero muchas herramientas los ejecutan como “crear nuevo + borrar viejo”.

Eso puede romper código, consultas, reportes o integraciones antes de que el resto del sistema se adapte.

## 2. Cambios de nulabilidad

Pasar una columna de nullable a not null parece razonable.
Pero si hay datos viejos incompletos o caminos que todavía escriben nulos, el cambio puede fallar o romper escrituras.

## 3. Cambios de tipo

Cambiar `int` por `bigint`, `string` por enum, `json` por columnas estructuradas o similares puede tener efectos en:

- conversiones
- índices
- consultas
- serialización
- integraciones

## 4. Eliminaciones

Borrar una columna, tabla o índice demasiado pronto puede romper consumidores que todavía no migraron.

## 5. Backfills grandes

Actualizar millones de filas en una sola operación puede generar:

- locks largos
- consumo excesivo
- degradación de performance
- timeouts
- impacto en producción

## 6. Índices y restricciones nuevas

Aunque agreguen seguridad o performance, también pueden introducir costo de escritura, bloqueo temporal o fallas si los datos existentes no cumplen las reglas.

## Código y esquema deben poder convivir

Una regla muy útil es ésta:

**cada paso de la transición debería dejar el sistema en un estado válido y operable.**

Eso significa que no conviene diseñar cambios que solo funcionan si todo sale perfecto y al mismo tiempo.

Conviene pensar en una secuencia donde:

- primero el esquema admite coexistencia
- después el código escribe o lee de forma compatible
- después se migran datos
- después se verifica
- después se limpia lo legacy

Cuando cada paso deja el sistema utilizable, el riesgo operativo baja mucho.

## Migraciones “forward-compatible” y “backward-compatible”

Aunque no siempre se use esta terminología formalmente, pensar así ayuda mucho.

### Backward-compatible

El cambio nuevo todavía puede convivir con partes viejas del sistema.

Por ejemplo:

- agregar columna nullable
- permitir ambos formatos
- mantener lectura compatible

### Forward-compatible

La versión anterior del código tampoco se rompe inmediatamente si el esquema ya cambió.

Por ejemplo:

- agregar algo nuevo sin borrar lo anterior
- evitar que el código viejo dependa de una estructura que ya no existe

En despliegues reales, esta doble compatibilidad temporal vale oro.

## El problema del backfill

Muchas migraciones no terminan cuando agregaste una estructura nueva.

Falta poblar datos históricos.
Y eso puede ser una parte grande del riesgo.

El backfill puede parecer “solo una actualización masiva”,
pero en producción hay que pensar varias cosas:

- cuánto volumen de datos hay
- si conviene hacerlo por lotes
- qué impacto tiene en la base
- cómo medir avance
- qué pasa con registros nuevos que llegan mientras corre el proceso
- si necesitás reintentar partes
- cómo validar consistencia final

Un error frecuente es pensar el backfill como detalle secundario.
En cambios grandes, muchas veces es el corazón de la migración.

## Escritura dual: útil, pero con costo

A veces, para transicionar entre modelo viejo y nuevo, el sistema escribe en dos lugares a la vez.

Por ejemplo:

- columna vieja y columna nueva
- tabla anterior y tabla nueva
- evento con formato viejo y nuevo

Eso puede ayudar mucho a una transición segura.

Pero no es gratis.

Introduce complejidad como:

- riesgo de desalineación
- necesidad de definir fuente de verdad temporal
- mayor costo de pruebas
- más lógica para limpiar después

Entonces no conviene usar escritura dual porque sí.
Conviene usarla cuando realmente reduce riesgo de transición.

## Lectura compatible durante la transición

Otra estrategia muy común es hacer la lectura tolerante.

Por ejemplo:

- si existe el campo nuevo, usarlo
- si todavía no existe o no está poblado, caer al viejo
- combinar ambas fuentes temporalmente

Esto sirve mucho para evitar que el sistema dependa de que el backfill esté terminado al 100% antes de desplegar código nuevo.

Pero, de nuevo, esa tolerancia temporal debe tener fecha de salida.
Si no se limpia, se transforma en deuda estructural.

## Migraciones pequeñas vs migraciones grandes

En general, cuando una migración es muy grande y cambia demasiadas cosas juntas, el riesgo sube por varios motivos:

- cuesta entender el estado intermedio
- cuesta hacer rollback
- cuesta validar
- cuesta aislar fallas
- aumenta el impacto sobre operación

Por eso suele ser más sano separar:

- cambio estructural
- ajuste de escritura
- backfill
- cambio de lectura
- eliminación legacy

No siempre se puede partir perfectamente.
Pero pensar en etapas suele mejorar mucho la seguridad.

## Qué cosas conviene observar durante una migración

Una migración segura no es solo “ejecutar y rezar”.
Conviene observar.

Por ejemplo:

- errores de aplicación después del deploy
- fallas de escritura o lectura
- crecimiento de latencia
- locks o degradación en base de datos
- filas pendientes de backfill
- divergencia entre representación vieja y nueva
- uso residual del camino legacy
- impacto en jobs o integraciones

Si no medís nada, muchas migraciones parecen sanas hasta que el problema aparece horas o días después.

## El rol del rollback

Rollback no siempre significa “deshacer completamente la migración”.

A veces se puede.
A veces no conviene.
Y a veces directamente no es realista, especialmente si ya hubo:

- escrituras nuevas
- cambios irreversibles de datos
- procesos parciales
- eliminación de estructuras viejas

Por eso una buena práctica es no depender ciegamente de rollback total como única estrategia.

Muchas veces conviene más diseñar la transición para que permita:

- desactivar uso del camino nuevo
- volver temporalmente a lectura vieja
- frenar backfill
- mitigar por configuración
- avanzar con un forward fix seguro

O sea:

**una migración madura no se apoya solo en la esperanza de “si sale mal, volvemos atrás”.**

## Cambios de esquema y branching

Este tema se conecta muy fuerte con la lección anterior.

Porque una migración no vive aislada del proceso de integración y release.

Si usás ramas largas y cambios grandes, el riesgo sube porque:

- la migración se aleja de la realidad actual
- cuesta coordinar el orden de despliegue
- es más difícil mantener compatibilidad temporal
- el merge final mezcla demasiadas cosas

En cambio, cuando el cambio se piensa como secuencia y se integra con criterio, suele ser más fácil hacer:

- despliegues intermedios seguros
- activación gradual
- validación por etapas
- limpieza ordenada después

## Señales de que una migración está mal diseñada

Hay varias señales bastante claras.

- exige que todo cambie al mismo tiempo
- no admite convivencia temporal
- no contempla datos existentes
- supone que el backfill será instantáneo
- mezcla cambio estructural, cambio de comportamiento y limpieza en un solo paso
- no tiene estrategia para monitorear impacto
- no deja claro qué hacer si algo queda a mitad de camino
- elimina lo viejo antes de demostrar que lo nuevo ya funciona

Cuando ves varias de esas juntas, conviene frenar y rediseñar la transición.

## Buenas prácticas iniciales

## 1. Preferir cambios en etapas seguras

Primero coexistencia, después migración de uso, después limpieza.

## 2. Agregar antes de reemplazar

Agregar estructura nueva suele ser mucho más seguro que modificar o borrar de golpe.

## 3. Diseñar lectura y escritura compatibles temporalmente

Especialmente cuando habrá más de una versión del sistema conviviendo.

## 4. Separar backfill del cambio estructural cuando sea posible

Eso mejora control, observabilidad y posibilidad de mitigar.

## 5. Validar con datos reales o representativos

Muchas migraciones “correctas” fallan por casos de datos históricos que nadie pensó.

## 6. Medir uso residual de lo legacy antes de eliminarlo

No alcanza con asumir que “seguro ya nadie lo usa”.

## 7. Limpiar compatibilidades temporales cuando la transición termina

La migración segura de hoy no debe convertirse en complejidad permanente mañana.

## Errores comunes

### 1. Tratar la base como si pudiera cambiar instantáneamente sin convivencia

Eso ignora cómo funciona realmente un sistema en producción.

### 2. Renombrar o borrar demasiado pronto

Lo viejo conviene retirarlo cuando ya no sea necesario de verdad, no cuando molesta visualmente.

### 3. Hacer backfills enormes sin estrategia operativa

Eso puede degradar producción o dejar procesos a mitad de camino.

### 4. Mezclar demasiados cambios en una sola migración

Cuanto más cosas cambian juntas, más difícil es entender y controlar el riesgo.

### 5. Asumir que rollback total siempre será posible

No siempre lo es, y planear como si sí puede dejarte sin salida real.

### 6. Olvidar jobs, integraciones o procesos no interactivos

A veces no rompe el request web, pero sí un worker que seguía usando el esquema viejo.

### 7. No retirar caminos legacy después de la transición

Lo temporal sin limpieza posterior se convierte en deuda técnica.

## Mini ejercicio mental

Pensá estas preguntas:

1. ¿cómo cambiarías hoy un campo muy usado sin exigir que todo el sistema se actualice al mismo tiempo?
2. ¿tu proyecto toleraría convivencia temporal entre formato viejo y nuevo, o depende de cambios bruscos?
3. ¿cómo harías un backfill grande sin bloquear la base ni perder visibilidad?
4. ¿qué cosas podrían seguir usando el esquema viejo aunque el request principal ya funcione bien?
5. ¿cómo sabrías que ya es seguro retirar la estructura legacy?

## Resumen

En esta lección viste que:

- una migración segura no es solo un script SQL, sino una transición controlada entre esquema, código y datos
- en producción rara vez todo cambia al mismo tiempo, por lo que la coexistencia temporal suele ser una necesidad real
- el patrón expand and contract ayuda a agregar, migrar y retirar de forma más segura que los cambios bruscos
- renombres, cambios de nulabilidad, cambios de tipo, eliminaciones y backfills grandes merecen especial cuidado
- lectura compatible, escritura dual y backfills por etapas pueden reducir riesgo, aunque también agregan complejidad temporal
- observar impacto, validar datos reales y pensar mitigaciones es tan importante como aplicar la migración en sí
- una migración bien diseñada busca dejar el sistema operable en cada paso, en lugar de depender de un salto perfecto y atómico

## Siguiente tema

Ahora que ya entendés mejor cómo evolucionar estructura y datos sin romper producción, el siguiente paso natural es meterse en **testing como red de seguridad de la evolución**, porque ninguna estrategia de migración, refactor o release se sostiene de verdad si el sistema no tiene una red de validación confiable que ayude a detectar regresiones antes, durante y después del cambio.
