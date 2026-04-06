---
title: "Checks de permiso antes de usar el recurso: TOCTOU en ownership y autorización"
description: "Cómo entender TOCTOU en ownership y autorización en aplicaciones Java con Spring Boot. Por qué no alcanza con verificar permisos antes de usar un recurso y qué cambia cuando ownership, visibilidad o estado pueden cambiar entre el check y la acción real."
order: 226
module: "Race conditions, TOCTOU y consistencia bajo concurrencia"
level: "base"
draft: false
---

# Checks de permiso antes de usar el recurso: TOCTOU en ownership y autorización

## Objetivo del tema

Entender por qué los **checks de permiso previos** pueden no alcanzar en aplicaciones Java + Spring Boot cuando existe una ventana entre:

- verificar que un actor puede operar sobre un recurso
- y usar o modificar ese recurso de verdad

La idea de este tema es continuar directamente lo que vimos sobre:

- race conditions
- TOCTOU
- stock, cuotas y recursos exclusivos
- y la diferencia entre verificar algo y convertir esa verificación en una acción realmente protegida

Ahora toca mirar una superficie muy importante y muy subestimada:

- ownership
- autorización
- visibilidad
- permisos por recurso
- checks tipo `canEdit`, `canDelete`, `canView`
- reglas como “todavía pertenece a este usuario”, “todavía está publicado”, “todavía sigue bajo este tenant”, “todavía no fue revocado”

Y justo ahí aparece una trampa muy común.

Porque el equipo ve algo como:

- cargar recurso
- verificar que el usuario puede operar
- seguir con la acción
- guardar cambios

Y siente que la seguridad está resuelta porque “el permiso se chequeó”.

Pero eso puede ser insuficiente si entre el check y el uso real cambian cosas como:

- el owner
- la visibilidad
- el tenant
- el estado del recurso
- la relación entre actor y objeto
- una membresía
- una revocación
- una moderación
- o cualquier condición que sostenía la autorización original

En resumen:

> TOCTOU en ownership y autorización importa porque el sistema puede verificar correctamente un permiso en un instante y luego usar esa conclusión como si siguiera siendo verdad, aunque el recurso o su relación con el actor ya hayan cambiado antes de la operación real.

---

## Idea clave

La idea central del tema es esta:

> un permiso correcto en T1 no garantiza una acción legítima en T2 si entre ambos momentos cambia el recurso, su ownership o la regla que justificaba el acceso.

Eso cambia bastante la forma de revisar lógica de autorización.

Porque una cosa es pensar:

- “antes de editar, verificamos que es owner”
- “antes de borrar, verificamos que puede borrar”
- “antes de descargar, verificamos que sigue habilitado”

Y otra muy distinta es preguntarte:

- “¿sigue siendo owner cuando realmente se hace el update?”
- “¿qué pasa si el recurso cambió de visibilidad?”
- “¿qué pasa si otro flujo lo movió de tenant?”
- “¿qué pasa si se revocó la membresía entre el check y la acción?”
- “¿qué impide que la acción use un permiso ya viejo?”

### Idea importante

El problema no siempre es un permiso mal calculado.
Muchas veces es un permiso bien calculado **demasiado temprano**.

### Regla sana

Cada vez que el sistema haga `check-then-use` sobre un recurso protegido, preguntate qué condiciones de autorización podrían cambiar entre ambos pasos.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- asumir que un `canX()` previo ya cierra la seguridad del flujo
- no modelar que ownership y visibilidad también cambian concurrentemente
- separar demasiado lectura de recurso, check de permiso y operación real
- olvidar que otros requests, jobs o admins pueden cambiar el recurso en el medio
- creer que TOCTOU es solo un problema de stock o de contadores
- no ver que una ventana pequeña también puede romper autorización real

Es decir:

> el problema no es solo si el usuario podía operar cuando lo verificaste.  
> El problema también es si esa misma conclusión sigue siendo válida cuando el recurso se usa o modifica de verdad.

---

## Error mental clásico

Un error muy común es este:

### “La autorización está bien porque hacemos el check antes del update”

Eso puede sonar correcto.
Pero todavía conviene preguntar:

- ¿qué pasa si el recurso cambia entre ambos pasos?
- ¿qué pasa si el owner ya no es el mismo?
- ¿qué pasa si el permiso dependía de una membresía que se revocó?
- ¿qué pasa si el estado del objeto cambió y ya no debería poder tocarse?
- ¿qué pasa si otro flujo reubica, archiva, modera o reasigna el recurso en el medio?

### Idea importante

“Chequeamos antes” no alcanza si el uso real ocurre después sobre un estado que ya pudo cambiar.

---

# Parte 1: Qué significa TOCTOU aplicado a autorización

## La intuición simple

Podés pensar este problema así:

1. el sistema carga un recurso o una vista del recurso
2. decide que el actor puede operar
3. entre ese momento y la acción real, algo cambia
4. aun así, la acción sigue adelante con una autorización que ya estaba vieja

### Idea útil

La race no siempre compite por stock o por unicidad.
A veces compite por la **validez temporal del permiso**.

### Regla sana

Cada vez que una autorización dependa del estado actual del recurso, asumí que puede volverse vieja si el sistema tarda en usarla.

---

# Parte 2: Ownership no es una propiedad inmutable

Otro error frecuente es pensar ownership como algo casi estático:

- “si es del usuario, puede editar”
- “si pertenece a su tenant, puede verlo”
- “si es suyo, puede descargarlo”

Eso es razonable como regla.
Pero no implica que la relación siga intacta durante todo el flujo.

Porque ownership puede cambiar por:

- transferencia
- reasignación
- moderación
- merge
- archivado
- cambio de tenant
- apropiación administrativa
- sincronización con otro sistema
- acción concurrente de otro actor legítimo

### Idea importante

El ownership no solo importa para autorización.
También importa su **estabilidad temporal** entre el check y la acción.

### Regla sana

No trates la propiedad del recurso como si quedara congelada solo porque ya la miraste una vez.

---

# Parte 3: Autorización por estado también sufre TOCTOU

Muchas veces el permiso depende de algo más que del usuario y del recurso.
Depende también del estado del recurso, por ejemplo:

- publicado / no publicado
- activo / archivado
- pendiente / aprobado
- visible / oculto
- bloqueado / libre
- vencido / vigente
- en revisión / habilitado

### Idea útil

Si el permiso se apoya en uno de esos estados y el sistema verifica primero para actuar después, ya hay una ventana de TOCTOU.

### Regla sana

Cada vez que una policy diga “puede hacer X solo si el recurso sigue en estado Y”, preguntate qué impide que el estado cambie antes de la acción real.

### Idea importante

Un permiso puede expirar aunque el actor no haya cambiado.
A veces cambia solo el objeto.

---

# Parte 4: Miembros, roles y grants también cambian en el medio

La autorización no siempre depende de ownership directo.
A veces depende de:

- membresía a grupo
- rol dentro de tenant
- grant temporal
- aprobación administrativa
- invitación vigente
- asociación a proyecto
- vínculo activo con una cuenta

### Problema

Ese vínculo también puede cambiar entre:

- el check
- y el uso real del recurso

### Idea útil

Una membresía revocada, una invitación vencida o un rol quitado pueden volver inválida una acción que hace milisegundos parecía autorizada.

### Regla sana

No modeles permisos derivados de relaciones dinámicas como si fueran estáticos durante todo el flujo.

---

# Parte 5: Read-then-authorize-then-update es más frágil de lo que parece

Este patrón aparece muchísimo en apps Spring:

1. busco entidad
2. hago check de ownership o permiso
3. transformo el objeto
4. guardo

Leyéndolo en el código, parece correcto.
Pero afuera del método pueden ocurrir cosas como:

- otro request cambia owner
- otro proceso archiva el recurso
- un admin revoca acceso
- una policy cambia el estado visible
- otro servicio mueve el objeto de tenant
- una tarea automática lo bloquea o lo invalida

### Idea importante

La secuencia local del método puede estar bien escrita y aun así depender de una suposición falsa:
- que el recurso no cambiará mientras lo uso.

### Regla sana

No revises solo si el `if (canEdit)` existe.
Revisá también si la acción real sigue atada a la misma verdad cuando se ejecuta el `save`.

---

# Parte 6: Ver no siempre implica seguir pudiendo tocar

Otra variante engañosa es esta:

- el usuario ve el recurso
- entonces el sistema asume que todavía podrá editarlo, borrarlo o descargarlo un instante después

Eso puede fallar si entre ambas cosas cambia algo relevante:

- la visibilidad
- el owner
- la política
- el estado
- el tenant
- la sesión efectiva
- el grant que habilitaba la acción

### Idea útil

No siempre hay una continuidad fuerte entre “verlo” y “poder actuar sobre él”.

### Regla sana

No heredes permisos de una fase anterior del flujo si la acción actual exige que el recurso siga cumpliendo condiciones presentes.

### Idea importante

Las pantallas y los formularios suelen trabajar con snapshots.
La autorización real trabaja con estado vivo.

---

# Parte 7: Los formularios viejos también son TOCTOU en cámara lenta

Este matiz es muy útil.

A veces la race no ocurre en milisegundos.
Ocurre así:

1. el usuario abre pantalla de edición
2. el sistema le muestra el recurso como editable
3. pasan segundos o minutos
4. mientras tanto, algo cambia
5. el usuario envía el formulario
6. el backend actúa apoyado en una foto vieja del mundo

### Idea útil

Eso también es TOCTOU:
- el check existió
- el uso vino después
- y el recurso ya no era el mismo.

### Regla sana

No pienses TOCTOU solo como simultaneidad extrema.
También puede haber ventanas largas entre vista previa y operación final.

### Idea importante

Una UI de edición es muchas veces una autorización temporal implícita, y eso no siempre resiste el paso del tiempo.

---

# Parte 8: Qué tipos de daño pueden aparecer

Este problema no siempre termina en “crash”.
Puede producir cosas como:

- edición de recurso ya transferido
- borrado de objeto ya no visible para ese actor
- descarga de contenido que cambió de régimen de acceso
- actualización sobre un recurso ya archivado
- acción permitida tras revocación
- modificación de un objeto que ya cambió de tenant
- uso de grants expirados
- inconsistencias donde un actor “todavía pudo una vez más”

### Idea importante

A veces el daño es una sola operación indebida.
Pero una sola puede alcanzar si el recurso era sensible.

### Regla sana

No minimices estas ventanas por ser pequeñas.
En autorización, una sola acción fuera de regla ya puede ser suficiente.

---

# Parte 9: Qué patrones merecen sospecha inmediata

Conviene sospechar especialmente cuando veas cosas como:

- `findById` y luego `canEdit(entity, user)` y luego `save`
- validación de owner en capa service y mutación posterior separada
- formularios de edición largos sobre recursos dinámicos
- checks de acceso hechos al cargar la página pero no al confirmar
- operaciones destructivas basadas en snapshots viejos
- request principal y admin/worker pudiendo tocar el mismo objeto
- recursos que cambian de estado, tenant u owner con relativa frecuencia

### Idea útil

El patrón no necesita ser raro.
Basta con que el sistema se apoye en una verdad que puede dejar de ser cierta antes del uso real.

### Regla sana

Cada vez que un permiso dependa de una propiedad mutable del recurso, ya hay una pregunta seria de TOCTOU.

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises ownership y autorización bajo concurrencia, conviene preguntar:

- ¿de qué depende exactamente el permiso?
- ¿qué parte de esa verdad puede cambiar antes de la acción real?
- ¿qué otros flujos pueden tocar el mismo recurso?
- ¿hay formularios, jobs o procesos largos entre check y use?
- ¿qué pasa si ownership cambia entre la lectura y el guardado?
- ¿qué pasa si una membresía o grant se revoca en el medio?
- ¿el sistema vuelve a atar la acción al estado vivo del recurso o usa una foto vieja?

### Idea importante

La buena review no termina en:
- “el permiso se chequea”
Sigue hasta:
- “¿sigue siendo cierto cuando realmente se usa el recurso?”

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- servicios que cargan entidad, chequean permiso y luego la modifican
- ownership mutable
- recursos multi-tenant con reasignación
- grants o memberships revocables
- formularios largos de edición
- acciones destructivas que dependen de estado actual
- combinación de request principal + worker/admin sobre el mismo recurso
- verificaciones hechas muy temprano en el flujo y uso mucho más tarde

### Idea útil

Si el permiso depende de estado vivo del recurso, la autorización no puede confiar demasiado en snapshots viejos.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- menor distancia entre check y acción real
- conciencia de que ownership y visibilidad también cambian concurrentemente
- menos confianza en formularios o snapshots viejos
- mejor modelado de grants revocables
- equipos que entienden que autorización y concurrencia están conectadas

### Idea importante

La madurez aquí se nota cuando el sistema no confunde permiso chequeado una vez con permiso garantizado hasta el final del flujo.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “hacemos el check antes del save” como defensa completa
- formularios que asumen editabilidad persistente
- ownership o visibilidad mutable sin revisión temporal
- recursos sensibles tocados por varios actores sin modelo claro
- revocaciones que todavía dejan pasar una operación más
- el equipo piensa la authZ como lógica estática, no como verdad temporal

### Regla sana

Si una operación depende de que nada relevante cambie entre el permiso y el uso, probablemente todavía hay una ventana de TOCTOU sin modelar.

---

## Checklist práctica

Para revisar TOCTOU en ownership y autorización, preguntate:

- ¿de qué depende el permiso?
- ¿qué puede cambiar en el recurso entre check y use?
- ¿quién más puede tocar ese objeto?
- ¿hay formularios o procesos largos?
- ¿hay grants o memberships revocables?
- ¿qué daño causaría una última operación indebida?
- ¿el sistema usa estado vivo o snapshots viejos para decidir?

---

## Mini ejercicio de reflexión

Tomá un flujo real de tu app Spring y respondé:

1. ¿Qué recurso protege?
2. ¿Qué check de permiso hace?
3. ¿De qué estado del recurso depende ese check?
4. ¿Qué otros flujos pueden cambiar ese estado?
5. ¿Qué pasa si ownership, visibilidad o grant cambian en el medio?
6. ¿Qué parte del equipo sigue viendo esto como “authZ normal” y no como concurrencia?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Los checks de permiso antes de usar el recurso importan porque una autorización correcta en un instante puede dejar de ser legítima antes de que la acción real ocurra si el recurso, su ownership, su visibilidad o la relación con el actor cambian entre ambos momentos.

La gran intuición del tema es esta:

- un permiso bien calculado puede llegar demasiado temprano
- ownership y estado del recurso también compiten bajo concurrencia
- formularios y snapshots viejos son TOCTOU en cámara lenta
- verificación previa no equivale a legitimidad futura
- y una sola operación “todavía permitida” puede bastar para romper la policy real del sistema

En resumen:

> un backend más maduro no trata los checks de permiso como si bastara con hacerlos una vez al principio del flujo y luego continuar confiando en esa foto del recurso, sino como decisiones que dependen de un estado vivo que puede cambiar mientras el sistema todavía está actuando.  
> Entiende que la pregunta importante no es solo si el actor podía operar cuando se hizo el check, sino si seguía pudiendo hacerlo en el momento exacto en que el recurso se modificó, se borró o se entregó.  
> Y justamente por eso este tema importa tanto: porque muestra con claridad una de las variantes más peligrosas y más fáciles de subestimar de TOCTOU, la de autorizaciones aparentemente bien implementadas que igual quedan viejas antes del uso real, rompiendo ownership, visibilidad o grants sin que el código “parezca inseguro” a primera vista.

---

## Próximo tema

**Idempotencia rota, retries y efectos dobles: cuando reintentar no es inocente**
