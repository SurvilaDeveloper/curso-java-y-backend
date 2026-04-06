---
title: "Workers, jobs y schedulers compitiendo con requests web"
description: "Cómo entender race conditions entre workers, jobs, schedulers y requests web en aplicaciones Java con Spring Boot. Por qué la concurrencia no viene solo de usuarios simultáneos y qué cambia cuando procesos automáticos y requests normales tocan el mismo estado al mismo tiempo."
order: 228
module: "Race conditions, TOCTOU y consistencia bajo concurrencia"
level: "base"
draft: false
---

# Workers, jobs y schedulers compitiendo con requests web

## Objetivo del tema

Entender por qué **workers**, **jobs**, **schedulers** y otros procesos automáticos pueden convertirse en una fuente muy importante de **race conditions** en aplicaciones Java + Spring Boot, incluso cuando el equipo suele pensar la concurrencia casi únicamente en términos de:

- dos usuarios apretando al mismo tiempo
- dos requests HTTP simultáneas
- mucho tráfico de frontend
- o cargas altas del sistema

La idea de este tema es continuar directamente lo que vimos sobre:

- race conditions
- TOCTOU
- stock, cuotas y recursos exclusivos
- checks de permiso antes de usar un recurso
- idempotencia rota
- retries y efectos dobles

Ahora toca ampliar la mirada.

Porque en sistemas modernos, la concurrencia no viene solo de actores humanos.
También viene de componentes automáticos que operan sobre el mismo estado que toca la app de cara al usuario, por ejemplo:

- workers
- consumers de colas
- schedulers
- cron jobs
- jobs de conciliación
- tareas de limpieza
- procesos de refresh
- reintentos automáticos
- reconcilers
- compensations
- flujos de mantenimiento
- pipelines de backoffice

Y eso cambia bastante la superficie del problema.

Porque una cosa es pensar:

- “¿qué pasa si dos usuarios llegan juntos?”

Y otra muy distinta es preguntarte:

- “¿qué pasa si un usuario está editando algo mientras un scheduler lo archiva?”
- “¿qué pasa si un worker reintenta un mensaje mientras un request ya procesó ese recurso?”
- “¿qué pasa si una tarea nocturna recalcula estado al mismo tiempo que una operación manual?”
- “¿qué pasa si la app y su automatización no comparten el mismo modelo de exclusividad temporal?”

En resumen:

> workers, jobs y schedulers importan porque una parte muy grande de la concurrencia real de una aplicación no nace de usuarios simultáneos, sino de procesos automáticos que compiten por el mismo estado al mismo tiempo que los flujos web, muchas veces sin que el equipo los modele como actores de primera clase dentro del problema.

---

## Idea clave

La idea central del tema es esta:

> en sistemas modernos, la aplicación no compite solo con usuarios; también compite consigo misma a través de sus propios procesos automáticos.

Eso cambia muchísimo la revisión de consistencia.

Porque una cosa es pensar:

- “hay un request que modifica el recurso”

Y otra muy distinta es aceptar que también puede haber a la vez:

- un job que recalcula estado
- un retry que vuelve a tocar el mismo registro
- un scheduler que vence reservas
- un worker que reconsume una tarea
- una compensación que intenta revertir
- un proceso que limpia, sincroniza o reindexa

### Idea importante

La concurrencia no es solo horizontal entre clientes.
También es vertical entre capas operativas del sistema.

### Regla sana

Cada vez que un recurso pueda ser tocado por requests y por automatizaciones, asumí que ya no tenés un solo flujo de negocio, sino varios actores compitiendo por la misma verdad.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- revisar races solo entre requests HTTP
- olvidar jobs, workers o cron tasks que operan sobre los mismos datos
- asumir que lo automático y lo interactivo nunca chocan
- no modelar que tareas de mantenimiento también cambian estado sensible
- tratar procesos batch o de fondo como “infraestructura” y no como actores de negocio
- no ver que la app puede romper consistencia sin ataque externo, solo por competir consigo misma

Es decir:

> el problema no es solo que dos usuarios hagan lo mismo a la vez.  
> El problema también es que **la propia plataforma** puede estar ejecutando otras transiciones sobre el mismo recurso mientras el request web todavía cree ser el único actor relevante.

---

## Error mental clásico

Un error muy común es este:

### “La lógica del request está bien; el resto son procesos internos controlados”

Eso suele ser demasiado optimista.

Porque todavía conviene preguntar:

- ¿qué jobs tocan este recurso?
- ¿qué workers consumen eventos relacionados?
- ¿qué schedulers vencen, limpian o recalculan cosas?
- ¿qué retries automáticos pueden reejecutar trabajo?
- ¿qué compensaciones o conciliaciones actúan después?
- ¿qué procesos batch corren sobre los mismos registros?
- ¿qué pasa si alguno de ellos coincide con el request web?

### Idea importante

“Es interno” no significa “no compite”.
A veces significa justo lo contrario: que compite más seguido y con menos visibilidad.

---

# Parte 1: Qué significa “competir” entre procesos internos y requests web

## La intuición simple

Podés pensar esta competencia así:

- el request web cree que tiene el recurso en cierto estado
- mientras tanto, un proceso automático también toma decisiones sobre ese mismo recurso
- ambos actúan con información que puede quedar vieja para el otro
- y el resultado final depende del orden, del timing o de quién persiste primero

### Idea útil

No hace falta que ambos flujos hagan exactamente lo mismo.
Alcanza con que uno cambie un supuesto importante que el otro estaba usando.

### Regla sana

Cada vez que un request dependa de un estado “todavía vigente”, preguntate qué procesos automáticos podrían volver falsa esa suposición.

---

# Parte 2: Jobs y schedulers también son actores de negocio

Otro error común es pensar que un cron o un scheduler son solo mecanismos técnicos.

Pero muchos hacen cosas como:

- expirar reservas
- liberar cupos
- archivar recursos
- recalcular precios
- cerrar sesiones
- vencer tokens
- rotar estados
- marcar overdue
- consolidar pagos
- conciliar resultados
- borrar temporales
- mover ownership
- activar o desactivar cosas según tiempo

### Idea importante

Eso no es “solo mantenimiento”.
Es lógica real de negocio ejecutándose automáticamente.

### Regla sana

Modelá jobs y schedulers como actores que toman decisiones sobre el estado, no como ruido de fondo de infraestructura.

---

# Parte 3: Workers y colas: la concurrencia puede venir diferida

Esto conecta con el bloque de SSRF moderno y también con idempotencia.

Cuando un request publica un evento o deja una tarea en cola, puede sentir:
- “mi trabajo terminó”

Pero el sistema no terminó.
Más tarde, un worker puede:

- completar el flujo
- reintentar algo
- actualizar un estado
- consumir el mismo recurso
- enviar algo irreversible
- compensar
- sincronizar con otro sistema

### Idea útil

La concurrencia no siempre es simultánea al milisegundo.
También puede ser asimétrica y diferida:
- el request actúa ahora
- el worker vuelve después
- y aun así ambos compiten por la misma verdad.

### Regla sana

No revises solo lo que pasa durante el request.
Revisá también qué otros componentes vuelven a tocar esa entidad o ese proceso después.

---

# Parte 4: El scheduler que “limpia” también puede romper invariantes

Esta es una fuente muy subestimada de problemas.

Muchos sistemas tienen tareas que parecen inocentes:

- limpiar pendientes viejos
- cerrar reservas expiradas
- borrar drafts
- recalcular estados
- expirar tokens
- liberar locks o slots
- consolidar movimientos

Eso suele verse como housekeeping.
Pero desde concurrencia conviene preguntarse:

- ¿qué pasa si justo mientras el scheduler limpia, un request todavía está operando?
- ¿qué pasa si el job decide que algo ya venció mientras el usuario está terminando el flujo?
- ¿qué pasa si el cleanup y la acción manual no comparten la misma noción temporal?

### Idea importante

El mantenimiento también compite por la verdad del sistema.

### Regla sana

Cada vez que haya un proceso que “regulariza” estados por tiempo, asumí que puede chocar con operaciones activas de usuarios o integraciones.

---

# Parte 5: Conciliaciones y reintentos automáticos complican muchísimo el modelo

Otra fuente importante de competencia viene de procesos como:

- reconciliaciones
- retriers
- compensations
- retries batch
- reprocesamiento de eventos fallidos
- recargas automáticas
- reenvíos

### Idea útil

Estos procesos suelen nacer para volver el sistema más robusto.
Pero al mismo tiempo agregan nuevos actores sobre el mismo estado.

### Regla sana

Toda capa de resiliencia que vuelve a tocar un recurso también agranda la superficie de concurrencia.

### Idea importante

La robustez operativa mal modelada puede volverse una fuente propia de races.

---

# Parte 6: El request suele tener una foto vieja del mundo

Esto pasa mucho cuando:

1. el usuario carga una pantalla o dispara una operación
2. el backend lee estado
3. mientras tanto, un proceso automático cambia ese mismo estado
4. el request sigue adelante con la foto anterior

### Ejemplos conceptuales
- un pago se confirma mientras un scheduler ya venció la reserva
- una edición llega mientras un job archivó el recurso
- una renovación se procesa mientras una limpieza lo marcó como expirado
- una descarga se autoriza mientras un proceso administrativo ya cambió la visibilidad

### Idea útil

El problema no es solo “otro usuario llegó antes”.
También puede ser:
- “otro proceso del sistema hizo algo relevante mientras este request seguía vivo”.

### Regla sana

Cada vez que un request dure lo suficiente como para convivir con jobs o automatizaciones, asumí que la foto inicial ya puede quedar vieja.

---

# Parte 7: El sistema puede pelearse consigo mismo con toda legitimidad

Esto es muy importante conceptualmente.

No hace falta que haya un actor malicioso ni siquiera un actor equivocado.
Puede pasar que:

- el request web haga lo correcto según su lógica
- el worker haga lo correcto según la suya
- el scheduler haga lo correcto según su propia regla temporal

Y aun así, en conjunto, el sistema rompa una invariante.

### Idea importante

La race condition puede nacer de la suma de varios comportamientos localmente razonables.

### Regla sana

No revises solo si cada componente “hace lo suyo”.
Revisá también si sus supuestos temporales son compatibles entre sí.

---

# Parte 8: Qué tipos de daño suelen aparecer

No siempre vas a ver crashes o grandes corrupciones.
A veces aparecen cosas como:

- reservas expirada y luego igualmente confirmadas
- reintentos que pisan estados nuevos
- recursos archivados que todavía se modifican una vez más
- operaciones que corren sobre objetos ya invalidados
- cierres automáticos que chocan con acciones manuales
- dobles efectos entre request y worker
- inconsistencias difíciles de reproducir porque dependen de ventanas temporales chicas

### Idea importante

Muchas veces el síntoma es “a veces pasa algo rarísimo”.
Y justamente eso suele ser señal de concurrencia mal modelada.

### Regla sana

No minimices bugs intermitentes si involucran jobs y estado compartido.
Esa combinación suele esconder races reales.

---

# Parte 9: Qué patrones merecen sospecha inmediata

Conviene sospechar especialmente cuando veas:

- request que actualiza recursos también tocados por schedulers
- jobs que expiran o archivan cosas editables desde UI
- workers que consumen mensajes sobre entidades todavía activas en flujos web
- retries automáticos sobre operaciones que también pueden dispararse manualmente
- tareas batch que recalculan o corrigen estados durante horario normal de uso
- lógica que dice “si sigue vigente” mientras otro proceso puede cambiar esa vigencia

### Idea útil

No hace falta un sistema enorme.
Basta con que un mismo recurso tenga varios dueños temporales.

### Regla sana

Cada vez que un mismo estado tenga un camino web y uno automático, ya merece una revisión explícita de concurrencia.

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises workers, jobs y schedulers frente a requests web, conviene preguntar:

- ¿qué otros procesos tocan este recurso además del request principal?
- ¿qué decisiones automáticas toman?
- ¿qué timing tienen?
- ¿qué pasa si coinciden con una acción manual?
- ¿qué estado asume el request que podría cambiar en el medio?
- ¿qué síntomas aparecerían si request y job actuaran casi juntos?
- ¿cada actor tiene una lógica local correcta pero una lógica global incompatible?

### Idea importante

La buena review no termina en:
- “el endpoint está bien”
Sigue hasta:
- “¿con qué otros actores del sistema está compitiendo este endpoint sin saberlo?”

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- `@Scheduled`
- jobs de cleanup o expiración
- workers consumidores de cola
- retriers automáticos
- procesos batch que recalculan estado
- requests web y backoffice sobre el mismo recurso
- tareas de conciliación o compensación
- entidades con muchos caminos de mutación distintos

### Idea útil

Si un recurso tiene más de un mecanismo que puede cambiarlo, la concurrencia ya no es teoría: es arquitectura.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- conciencia clara de qué procesos automáticos tocan qué estado
- menos supuestos implícitos de “solo este request cambia esto”
- mejor alineación temporal entre jobs y flujos web
- equipos que incluyen workers y schedulers en el modelo de concurrencia del negocio
- menor sorpresa cuando se analiza un recurso desde todos sus productores reales

### Idea importante

La madurez aquí se nota cuando la app ya no se piensa solo como request-response, sino como un sistema con varios actores simultáneos sobre la misma verdad.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- nadie sabe qué jobs tocan realmente una entidad
- lógica web y lógica batch evolucionaron por separado
- schedulers que “arreglan” estados sin modelar requests en curso
- el equipo piensa la concurrencia solo entre usuarios
- los procesos internos se tratan como neutrales o invisibles
- hay bugs raros que solo aparecen en ciertos horarios o durante tareas automáticas

### Regla sana

Si el sistema no puede explicar bien qué actores automáticos compiten con cada flujo sensible, probablemente todavía no tiene bien mapeada su concurrencia real.

---

## Checklist práctica

Para revisar workers, jobs y schedulers compitiendo con requests web, preguntate:

- ¿qué recursos toca este endpoint?
- ¿qué workers o jobs tocan los mismos?
- ¿qué estados pueden cambiar en el medio?
- ¿qué timing tienen esas tareas automáticas?
- ¿qué pasaría si corrieran justo durante la acción web?
- ¿qué lógica local razonable se vuelve incompatible a nivel global?
- ¿qué revisarías si asumieras que la app también compite consigo misma?

---

## Mini ejercicio de reflexión

Tomá un recurso real de tu app Spring y respondé:

1. ¿Qué requests web lo modifican?
2. ¿Qué jobs, workers o schedulers también lo tocan?
3. ¿Qué estados o propiedades podrían cambiar en el medio?
4. ¿Qué bug raro aparecería si coincidieran?
5. ¿Qué parte del equipo sigue viendo esos procesos como “infra” y no como actores?
6. ¿Qué invariante del negocio podría romperse?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Workers, jobs y schedulers compitiendo con requests web importan porque en sistemas modernos una parte muy grande de la concurrencia real no viene solo de usuarios simultáneos, sino de procesos automáticos que operan sobre el mismo estado al mismo tiempo que los flujos interactivos.

La gran intuición del tema es esta:

- la app no compite solo con usuarios
- también compite consigo misma
- jobs y schedulers son actores de negocio, no simple fondo operativo
- una lógica local correcta puede volverse globalmente incorrecta si otro proceso cambia el mismo estado
- y muchos bugs “raros” nacen de ignorar que la verdad del recurso tiene más de un productor concurrente

En resumen:

> un backend más maduro no trata workers, jobs y schedulers como detalles técnicos separados del modelo de concurrencia de la aplicación, sino como actores reales que pueden modificar, expirar, reconciliar, compensar o recalcular el mismo estado que tocan los requests web de usuarios y admins.  
> Entiende que la pregunta importante no es solo si cada flujo parece correcto por separado, sino si siguen siendo compatibles cuando corren al mismo tiempo sobre la misma entidad o el mismo proceso de negocio.  
> Y justamente por eso este tema importa tanto: porque muestra una de las fuentes más frecuentes y menos intuitivas de races en producción, la de sistemas que no fallan porque un usuario hizo algo raro, sino porque sus propios mecanismos automáticos se cruzan con sus flujos interactivos sin un modelo claro de exclusividad temporal, prioridad o consistencia compartida.

---

## Próximo tema

**Transiciones de estado, máquinas de estados y carreras entre caminos válidos**
