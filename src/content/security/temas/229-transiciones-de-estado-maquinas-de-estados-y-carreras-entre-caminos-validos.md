---
title: "Transiciones de estado, máquinas de estados y carreras entre caminos válidos"
description: "Cómo entender race conditions en transiciones de estado y máquinas de estados en aplicaciones Java con Spring Boot. Por qué dos caminos válidos por separado pueden volverse incompatibles bajo concurrencia y qué cambia cuando el sistema no protege bien la evolución del estado."
order: 229
module: "Race conditions, TOCTOU y consistencia bajo concurrencia"
level: "base"
draft: false
---

# Transiciones de estado, máquinas de estados y carreras entre caminos válidos

## Objetivo del tema

Entender por qué las **transiciones de estado**, las **máquinas de estados** y las **carreras entre caminos válidos** son una superficie muy importante para pensar **race conditions** y **TOCTOU** en aplicaciones Java + Spring Boot.

La idea de este tema es continuar directamente lo que vimos sobre:

- race conditions
- TOCTOU
- stock, cuotas y recursos exclusivos
- checks de permiso antes de usar el recurso
- idempotencia rota y efectos dobles
- workers, jobs y schedulers compitiendo con requests web

Ahora toca mirar una situación muy frecuente en sistemas de negocio:

- recursos que atraviesan estados
- flujos con approve / reject
- pending / active / cancelled / expired
- draft / published / archived
- requested / accepted / delivered / refunded
- created / paid / shipped / closed
- y en general cualquier entidad cuyo comportamiento dependa de en qué etapa del ciclo de vida se encuentra

Y justo ahí aparece una trampa muy común.

Porque muchas veces el equipo revisa cada transición por separado y concluye:

- “aprobar está permitido desde pending”
- “cancelar está permitido desde pending”
- “archivar está permitido desde active”
- “expirar está permitido desde active”
- “publicar está permitido desde draft”

Todo eso puede ser cierto, localmente.

El problema aparece cuando dos de esos caminos válidos compiten casi al mismo tiempo sobre el mismo recurso.

En ese caso puede pasar algo así:

- ambos leen el mismo estado inicial
- ambos creen que todavía pueden transicionar
- ambos ejecutan su lógica
- y el sistema termina aceptando dos historias incompatibles sobre el mismo objeto

En resumen:

> las transiciones de estado importan porque muchas race conditions no nacen de lógica obviamente incorrecta,  
> sino de que dos caminos perfectamente válidos por separado compiten sobre el mismo estado base y el sistema no protege bien cuál de ellos sigue siendo legítimo cuando el otro ya avanzó.

---

## Idea clave

La idea central del tema es esta:

> en una máquina de estados, el problema no siempre es “qué transición está permitida”,  
> sino “qué pasa si dos transiciones válidas parten del mismo estado y corren a la vez”.

Eso cambia muchísimo la forma de revisar flujos.

Porque una cosa es pensar:

- “desde `PENDING` se puede `APPROVE`”
- “desde `PENDING` se puede `CANCEL`”

Y otra muy distinta es preguntarte:

- “¿qué ocurre si ambos ven `PENDING` al mismo tiempo?”
- “¿qué evita que los dos crean haber ganado?”
- “¿cómo sabe el sistema que la segunda transición ya no parte del mismo mundo que validó?”
- “¿qué pasa si un scheduler expira algo justo mientras un usuario lo confirma?”

### Idea importante

La validez de una transición depende no solo del estado actual que el código leyó, sino también de que ese estado siga siendo el mismo cuando la transición realmente se consolida.

### Regla sana

Cada vez que una entidad tenga más de un camino posible desde el mismo estado, preguntate qué ocurre si dos caminos intentan recorrerla a la vez.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- revisar transiciones de estado de forma aislada
- pensar que una máquina de estados ya es segura solo por tener transiciones bien dibujadas
- no modelar concurrencia entre caminos válidos
- asumir que si cada transición chequea el estado actual ya alcanza
- olvidar que requests, workers y schedulers también pueden competir por cambiar la misma entidad
- tratar inconsistencias de workflow como bugs de negocio menores y no como fallas reales de concurrencia

Es decir:

> el problema no es solo qué transiciones admite la máquina.  
> El problema también es **qué pasa cuando varias transiciones compatibles con el estado viejo intentan materializarse sobre el mismo recurso antes de que el sistema haga visible el primer cambio**.

---

## Error mental clásico

Un error muy común es este:

### “La máquina de estados está bien porque cada transición valida desde qué estado se permite”

Eso puede ser cierto y aun así insuficiente.

Porque todavía conviene preguntar:

- ¿qué pasa si dos transiciones leen el mismo estado inicial?
- ¿qué pasa si ambas pasan la validación?
- ¿qué pasa si la segunda escribe después de que la primera ya cambió el recurso?
- ¿qué historia final queda grabada?
- ¿qué side effects ejecutó cada una?
- ¿qué actor cree algo distinto sobre el mismo recurso después de la carrera?

### Idea importante

Una transición puede estar bien definida individualmente y aun así ser insegura bajo concurrencia.

---

# Parte 1: Qué es una máquina de estados, vista con esta lente

## La intuición simple

Una máquina de estados, en negocio, suele ser cualquier modelo donde una entidad:

- tiene un estado actual
- solo puede pasar a ciertos estados siguientes
- y cada transición puede disparar reglas, permisos o side effects

Por ejemplo:

- pedido
- factura
- suscripción
- ticket
- publicación
- reserva
- pago
- envío
- documento
- aprobación administrativa

### Idea útil

Desde concurrencia, una máquina de estados no es solo un dibujito bonito.
Es un conjunto de **caminos que compiten por escribir la próxima verdad del recurso**.

### Regla sana

No revises una máquina de estados solo como grafo lógico.
Revisala también como sistema donde varias transiciones pueden intentar imponerse sobre el mismo nodo actual.

---

# Parte 2: Dos caminos válidos pueden ser incompatibles entre sí

Este es uno de los aprendizajes más importantes del tema.

Muchas carreras no ocurren entre:

- una operación válida
y
- una claramente inválida

Sino entre:

- dos operaciones válidas por separado
- ambas autorizadas
- ambas permitidas desde el mismo estado
- ambas razonables según reglas locales

Ejemplos conceptuales:

- aprobar vs rechazar
- confirmar vs cancelar
- publicar vs archivar
- reservar vs expirar
- completar vs revertir
- cerrar vs reabrir
- aceptar vs reasignar

### Idea importante

El problema no es que una de las dos sea “ilegal” en abstracto.
El problema es que ambas no deberían ganar a la vez.

### Regla sana

Cada vez que un estado tenga más de una salida válida, preguntate si el sistema sabe resolver bien la competencia entre esas salidas.

---

# Parte 3: El estado leído puede dejar de existir antes del commit real

Esto conecta directo con TOCTOU.

Un flujo típico puede ser:

1. leo estado actual = `PENDING`
2. verifico que `APPROVE` está permitido desde `PENDING`
3. hago lógica de negocio
4. guardo nuevo estado = `APPROVED`

Mientras tanto, otro flujo puede hacer:

1. leer estado actual = `PENDING`
2. verificar que `CANCEL` está permitido desde `PENDING`
3. hacer su propia lógica
4. guardar nuevo estado = `CANCELLED`

### Idea útil

Ambos actuaron sobre un mismo estado inicial que ya no podía seguir siendo verdad para los dos al mismo tiempo.

### Regla sana

Cada vez que una transición parta de un estado leído antes, preguntate cómo garantiza el sistema que ese estado sigue siendo la base real cuando la transición se persiste.

### Idea importante

La carrera vive en la diferencia entre:
- “esto era cierto cuando lo vi”
y
- “esto sigue siendo el punto de partida legítimo cuando escribo”.

---

# Parte 4: El problema no es solo el estado final; también son los side effects

Otra razón por la que estas carreras son tan delicadas es que no solo cambian una columna `status`.
También pueden disparar:

- emails
- cobros
- reembolsos
- creación de tareas
- eventos hacia otros servicios
- liberación o consumo de stock
- generación de documentos
- cambios de visibilidad
- auditoría
- webhooks
- notificaciones al usuario

### Idea importante

Aunque el estado final “termine” siendo uno solo, los efectos de ambos caminos pueden haber ocurrido.

### Regla sana

No mires solo cuál transición ganó en la tabla.
Mirá también qué side effects ya dejó corriendo cada transición en la realidad del sistema.

### Idea útil

La máquina de estados puede parecer consistente al final y aun así haber producido una historia operativa imposible.

---

# Parte 5: Estados temporales y automáticos complican mucho la carrera

Esto se vuelve más intenso cuando hay procesos automáticos como:

- expiración por tiempo
- auto-cancel
- auto-archive
- cierre nocturno
- reconciliación
- timeout de aprobación
- transición automática a `EXPIRED`
- limpieza de `PENDING` viejos

### Problema

Esos procesos compiten con transiciones manuales o interactivas:

- el usuario confirma mientras el scheduler expira
- un admin archiva mientras otro publica
- una conciliación marca fallo mientras el request ya confirmó éxito

### Idea útil

La máquina de estados no solo compite entre requests humanos.
También compite entre caminos humanos y caminos automáticos.

### Regla sana

Cada transición automática merece analizarse como actor real dentro del grafo de concurrencia.

---

# Parte 6: Estados “finales” también pueden pelearse con estados “transitorios”

Otra variante común:
un sistema tiene estados más o menos terminales como:

- `CANCELLED`
- `EXPIRED`
- `ARCHIVED`
- `REJECTED`
- `FAILED`

y estados intermedios o progresivos como:

- `CONFIRMED`
- `PAID`
- `APPROVED`
- `ACTIVE`

A veces el equipo piensa que los terminales “cierran” el recurso.
Pero bajo concurrencia puede pasar que:

- un flujo lo lleve a terminal
- otro lo siga moviendo como si aún estuviera vivo
- ambos lo hayan visto antes del cambio del otro

### Idea importante

La terminalidad lógica del estado no garantiza que todos los actores la hayan visto a tiempo.

### Regla sana

No asumas que porque un estado debería cerrar el flujo, los demás caminos ya lo respetan automáticamente bajo concurrencia.

---

# Parte 7: Los formularios y paneles viejos son máquinas de estados en cámara lenta

Esto también merece una mención aparte.

A veces la carrera no ocurre entre dos APIs automáticas, sino así:

1. el usuario abre pantalla con estado `PENDING`
2. ve botones “aprobar” y “rechazar”
3. mientras piensa, otro actor ya cambió el estado
4. el usuario confirma una transición que ya no parte del mismo mundo

### Idea útil

Eso también es una carrera entre caminos válidos:
- la UI está basada en un snapshot viejo del grafo
- pero el backend debe decidir con estado vivo

### Regla sana

No confundas “el botón estaba visible” con “la transición sigue siendo válida ahora”.

### Idea importante

Una UI de workflow es, muchas veces, una representación temporal del grafo de estados, no una autorización eterna para cualquiera de sus salidas.

---

# Parte 8: Qué síntomas suelen aparecer

No siempre vas a ver corrupción obvia.
A veces aparecen cosas como:

- objetos `APPROVED` que también dispararon lógica de `CANCELLED`
- publicaciones archivadas que igual terminaron visibles
- reservas confirmadas que al mismo tiempo quedaron expiradas
- dos eventos incompatibles emitidos para la misma entidad
- auditorías imposibles de leer
- soporte diciendo “a veces queda en un estado rarísimo”
- procesos downstream que reciben historias contradictorias

### Idea importante

Muchas carreras de workflow se sienten como “casos raros del negocio”, pero en realidad son fallas de concurrencia sobre transiciones.

### Regla sana

Si la historia de un objeto no se puede contar coherentemente en una línea temporal única, sospechá de carreras entre transiciones válidas.

---

# Parte 9: Qué patrones merecen sospecha inmediata

Conviene sospechar especialmente cuando veas:

- `if (status == PENDING) approve()`
- `if (status == PENDING) cancel()`
- múltiples transiciones saliendo del mismo estado con side effects importantes
- validación de estado y persistencia separadas
- schedulers que cambian estado en paralelo a requests
- paneles administrativos y usuarios finales tocando el mismo workflow
- eventos que reabren o compensan estados mientras otro flujo avanza

### Idea útil

La existencia de varias salidas permitidas desde un mismo estado ya no es solo diseño de negocio.
También es una pregunta de concurrencia.

### Regla sana

Cada vez que veas varios caminos posibles desde el mismo nodo, pensá cómo se comportan si dos intentan ejecutarse a la vez.

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises transiciones de estado bajo concurrencia, conviene preguntar:

- ¿qué estados tiene la entidad?
- ¿qué transiciones son válidas desde cada uno?
- ¿qué transiciones compiten entre sí?
- ¿qué pasa si dos leen el mismo estado inicial?
- ¿qué side effects dispara cada camino?
- ¿qué procesos automáticos también participan del grafo?
- ¿el sistema asegura que la transición persiste solo si el estado base sigue siendo el mismo?
- ¿qué historia imposible podría quedar grabada si dos caminos “ganan” parcialmente?

### Idea importante

La buena review no termina en:
- “la máquina de estados está bien dibujada”
Sigue hasta:
- “¿qué pasa cuando dos flechas salen del mismo nodo al mismo tiempo?”

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- enums de estado con muchos cambios posibles
- services tipo `approve`, `cancel`, `expire`, `publish`, `archive`, `complete`
- transiciones automáticas con `@Scheduled`
- acciones administrativas y de usuario sobre el mismo recurso
- side effects fuertes asociados a cambios de estado
- validación del estado antes del `save`
- múltiples caminos válidos desde el mismo estado inicial

### Idea útil

Si una entidad vive en un workflow real, la concurrencia ya forma parte del diseño del grafo aunque el código no lo diga explícitamente.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- conciencia clara de qué transiciones compiten entre sí
- menor separación entre validación del estado y persistencia del cambio
- mejor modelado de side effects incompatibles
- inclusión de jobs y schedulers dentro del análisis del workflow
- equipos que entienden que una máquina de estados también necesita coherencia temporal y no solo semántica

### Idea importante

La madurez aquí se nota cuando el sistema no solo sabe qué flechas son válidas, sino también cómo evitar que dos flechas incompatibles crean salir del mismo nodo a la vez.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- la máquina de estados se revisó solo como negocio, no como concurrencia
- varias transiciones válidas desde el mismo estado sin análisis temporal
- side effects importantes disparados por caminos incompatibles
- schedulers que participan del workflow pero se piensan “fuera del modelo”
- el equipo cree que chequear `status` antes del `save` ya resuelve todo
- aparecen objetos con historias difíciles o imposibles de explicar

### Regla sana

Si una entidad puede ser llevada por varios caminos válidos desde el mismo estado y nadie puede explicar qué pasa cuando dos corren a la vez, probablemente todavía no está bien cerrada la concurrencia del workflow.

---

## Checklist práctica

Para revisar transiciones de estado y carreras entre caminos válidos, preguntate:

- ¿qué salidas tiene cada estado?
- ¿cuáles podrían competir?
- ¿qué side effects dispara cada una?
- ¿qué actores humanos y automáticos participan?
- ¿qué pasa si dos leen el mismo estado base?
- ¿qué historia imposible podría emerger?
- ¿qué parte del sistema sigue asumiendo un grafo secuencial en un mundo concurrente?

---

## Mini ejercicio de reflexión

Tomá una entidad real de tu app Spring y respondé:

1. ¿Qué estados tiene?
2. ¿Qué transiciones válidas salen del mismo estado?
3. ¿Qué actores pueden dispararlas?
4. ¿Qué side effects incompatibles podrían ocurrir?
5. ¿Qué proceso automático participa del mismo workflow?
6. ¿Qué historia imposible te preocuparía más ver en producción?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Las transiciones de estado, las máquinas de estados y las carreras entre caminos válidos importan porque muchas race conditions no nacen de lógica obviamente mala, sino de que dos transiciones perfectamente válidas por separado compiten sobre el mismo estado base y el sistema no decide bien cuál de ellas sigue siendo legítima cuando la otra ya avanzó.

La gran intuición del tema es esta:

- la máquina de estados no solo necesita transiciones válidas
- también necesita transiciones temporalmente coherentes
- dos caminos correctos por separado pueden volverse incompatibles bajo concurrencia
- el estado final no cuenta toda la historia si ambos dispararon efectos
- y jobs, schedulers y UIs viejas también compiten por recorrer el mismo grafo

En resumen:

> un backend más maduro no trata las máquinas de estados como simples mapas de negocio donde basta con enumerar qué transición se permite desde cada nodo, sino como estructuras que viven bajo concurrencia y donde varias flechas válidas pueden competir por imponer la próxima verdad del recurso.  
> Entiende que la pregunta importante no es solo si cada transición está bien definida, sino qué ocurre cuando dos caminos parten del mismo estado y ambos creen tener derecho a avanzar antes de que el sistema haga visible cuál cambió primero el mundo real.  
> Y justamente por eso este tema importa tanto: porque muestra una de las formas más traicioneras de race conditions en aplicaciones de negocio, la de workflows bien diseñados en papel pero mal defendidos en el tiempo, donde el problema no es que una transición sea inválida, sino que dos válidas se vuelven incompatibles cuando intentan ejecutarse a la vez.

---

## Próximo tema

**Cierre del bloque: principios duraderos para concurrencia y TOCTOU**
