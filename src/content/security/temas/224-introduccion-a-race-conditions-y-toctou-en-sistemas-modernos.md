---
title: "Introducción a race conditions y TOCTOU en sistemas modernos"
description: "Introducción a race conditions y TOCTOU en aplicaciones Java con Spring Boot. Qué significa realmente esta categoría, por qué no se reduce a bugs raros de concurrencia y cómo aparece cuando el sistema verifica algo en un momento y actúa después como si el estado no pudiera cambiar."
order: 224
module: "Race conditions, TOCTOU y consistencia bajo concurrencia"
level: "base"
draft: false
---

# Introducción a race conditions y TOCTOU en sistemas modernos

## Objetivo del tema

Entender qué significan realmente las **race conditions** y los problemas de **TOCTOU** en aplicaciones Java + Spring Boot, y por qué esta categoría no debería pensarse como una rareza de bajo nivel o como un problema que solo aparece en sistemas muy exóticos o muy concurrentes.

La idea de este tema es abrir un nuevo bloque con una advertencia muy útil:

- no todo bug importante viene de una validación ausente
- no todo problema nace de una lógica “incorrecta” en una sola línea
- no todo fallo de seguridad o de consistencia requiere un atacante muy sofisticado
- y muchas veces el sistema hace algo que parece perfectamente razonable, salvo por un detalle:
  - verifica una condición en un momento
  - actúa más tarde
  - y en el medio el mundo cambia

Ahí empieza esta familia de problemas.

Porque una cosa es pensar un flujo como si fuera:

- leo estado
- valido
- decido
- actúo
- guardo

Y otra muy distinta es aceptar que, en sistemas reales:

- hay múltiples requests al mismo tiempo
- hay workers
- hay colas
- hay jobs
- hay transacciones separadas
- hay nodos distintos
- hay caches
- hay eventos
- y el estado que parecía cierto al principio puede dejar de serlo antes de que la acción termine

En resumen:

> race conditions y TOCTOU importan porque el sistema no vive congelado mientras decide,  
> y el riesgo aparece cuando una verificación hecha en un instante se usa después como si siguiera representando la verdad actual del sistema, aunque ya no sea así.

---

## Idea clave

La idea central del tema es esta:

> una decisión correcta en T1 puede volverse incorrecta en T2 si entre ambas cosas el estado cambia y el sistema no modela bien esa posibilidad.

Eso cambia mucho la manera de revisar lógica de negocio.

Porque una cosa es ver un flujo y pensar:

- “esto valida antes de actuar, así que está bien”

Y otra muy distinta es preguntarte:

- “¿sigue siendo cierta esa validación cuando la acción realmente ocurre?”
- “¿qué otras requests o procesos pueden tocar el mismo estado en el medio?”
- “¿qué suposición temporal está haciendo este código?”
- “¿qué pasa si dos actores llegan casi al mismo tiempo?”

### Idea importante

El problema no siempre está en la validación en sí.
Muchas veces está en la **distancia temporal y operativa** entre verificar y actuar.

### Regla sana

Cada vez que un flujo dependa de “primero miro y después hago”, preguntate qué cosas podrían cambiar entre ambos pasos.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que race conditions son solo bugs raros de multithreading
- creer que TOCTOU es un problema académico o de sistemas operativos
- no modelar concurrencia entre requests normales de producto
- asumir que una verificación previa alcanza aunque la acción venga después
- no distinguir consistencia lógica de consistencia temporal
- olvidar que workers, eventos, retries y jobs también compiten por el mismo estado

Es decir:

> el problema no es solo que el sistema valide mal.  
> El problema también es que puede validar bien **en el momento equivocado** y después actuar como si esa verdad siguiera intacta.

---

## Error mental clásico

Un error muy común es este:

### “Esto está protegido porque primero chequeamos y después recién actualizamos”

Eso puede sonar correcto.
Pero puede ser una defensa demasiado optimista.

Porque todavía conviene preguntar:

- ¿qué pasa si otro request cambia ese estado entre el check y el update?
- ¿qué pasa si dos requests leen lo mismo y ambas creen que pueden actuar?
- ¿qué pasa si el sistema separa la verificación y la escritura en pasos distintos?
- ¿qué pasa si la acción depende de un snapshot que ya quedó viejo?
- ¿qué pasa si la consistencia vive en la cabeza del developer, pero no en el mecanismo real de ejecución?

### Idea importante

“Primero chequeamos” no alcanza si el chequeo y la acción no forman una unidad suficientemente consistente.

---

# Parte 1: Qué significa “race condition” a nivel intuitivo

## La intuición simple

Podés pensar una **race condition** como una situación donde el resultado del sistema depende del orden o del timing con el que ocurren dos o más acciones que compiten o interactúan sobre el mismo estado.

Eso puede involucrar:

- dos requests HTTP
- un request y un worker
- dos jobs
- una transacción y otra transacción
- un proceso de lectura y otro de escritura
- un evento que llega “justo en el medio”
- un retry que corre mientras otro flujo ya está actuando

### Idea útil

El nombre “race” no significa que haya hilos corriendo a toda velocidad en un laboratorio.
Significa que dos o más actores están “corriendo” por decidir o modificar algo antes que el otro.

### Regla sana

Cada vez que varios flujos pueden tocar el mismo estado, asumí que el orden de llegada ya forma parte del diseño, no solo de la ejecución.

---

# Parte 2: Qué significa “TOCTOU”

## La intuición útil

**TOCTOU** viene de:

- **Time Of Check**
- **Time Of Use**

La idea es muy simple y muy poderosa:

1. el sistema chequea algo
2. después usa esa conclusión
3. pero entre ambas cosas el mundo pudo haber cambiado

### Idea importante

TOCTOU es una forma especialmente clara de race condition:
- la validación ocurre en un tiempo
- el uso ocurre en otro
- y el sistema asume que nada importante pasó entre ambos

### Regla sana

Cada vez que una verificación y una acción no ocurran como una unidad suficientemente fuerte, preguntate si no hay un gap de TOCTOU escondido.

---

# Parte 3: Por qué esto no es solo concurrencia “de bajo nivel”

Mucha gente aprende estos temas pensando en:

- mutexes
- threads
- locks
- memoria compartida
- sistemas operativos

Todo eso existe.
Pero en aplicaciones web modernas el problema aparece de formas mucho más cotidianas, por ejemplo:

- dos usuarios compran el último cupo
- dos requests reclaman el mismo recurso
- dos operaciones hacen check de saldo antes de descontar
- un worker procesa algo que otro ya invalidó
- una validación de ownership se hace antes de un cambio que llega después
- una revocación no alcanza a frenar una acción ya lanzada

### Idea útil

No hace falta programar threads manualmente para tener race conditions.
Alcanza con tener un sistema donde varios flujos tocan el mismo estado en tiempos cercanos.

### Regla sana

En backend moderno, concurrencia no es un tema de especialistas del scheduler.
Es un tema normal de producto, negocio y consistencia.

---

# Parte 4: El sistema suele verse secuencial en el código, pero no en la realidad

Esta tensión es una de las más importantes del bloque.

El código muchas veces se lee así:

- busco entidad
- verifico estado
- verifico permiso
- actualizo
- guardo
- listo

En la cabeza del developer, todo eso parece una línea única de realidad.
Pero afuera del método pueden estar ocurriendo cosas como:

- otro request lee la misma entidad
- otro request la modifica
- un worker la invalida
- otro nodo actualiza stock
- cambia una membership
- expira una reserva
- se revoca un permiso
- entra una cancelación

### Idea importante

El código puede verse lineal aunque el sistema sea concurrente.
Y esa diferencia es justo donde nacen muchas race conditions.

### Regla sana

No revises solo la secuencia interna del método.
Revisá también qué otros flujos pueden atravesar el mismo estado al mismo tiempo.

---

# Parte 5: “Verificar antes de actuar” no siempre alcanza

Esta es una de las lecciones más importantes del tema.

Muchísimos sistemas hacen cosas razonables como:

- verificar que hay stock
- verificar que el recurso sigue libre
- verificar que el usuario puede operar
- verificar que el balance alcanza
- verificar que no existe otra reserva
- verificar que el estado permite la transición

Eso parece bien.
Y muchas veces lo está, localmente.

### Problema

Si después de verificar:

- no se reserva el estado de forma suficiente
- no se actualiza de manera consistente
- o se deja una ventana donde otros flujos pueden actuar igual

entonces la validación previa puede no sostener la seguridad ni la correctitud.

### Idea importante

Validar antes de actuar sirve solo si el sistema también protege el vínculo entre la validación y la acción real.

### Regla sana

No preguntes solo:
- “¿se valida?”
Preguntá también:
- “¿cómo evita el sistema que esa validación quede vieja antes de usarse?”

---

# Parte 6: Qué cosas suelen competir por el mismo estado

En sistemas modernos, muchos actores pueden competir por los mismos recursos o decisiones:

- requests del mismo usuario
- requests de usuarios distintos
- jobs asíncronos
- reintentos automáticos
- workers
- servicios distintos
- flujos manuales y automáticos a la vez
- callbacks externos
- procesos de conciliación
- tareas administrativas

### Idea útil

El riesgo no aparece solo donde hay “mucho tráfico”.
A veces aparece porque simplemente hay **dos caminos distintos** que creen ser los dueños de la misma verdad.

### Regla sana

Cada vez que un estado tenga más de un productor o más de un actor con capacidad de cambiarlo, la concurrencia ya importa.

---

# Parte 7: Race condition no siempre significa corrupción total

Otra trampa mental es pensar que si hubiera un problema de concurrencia ya veríamos algo espectacular:

- datos rotos
- excepciones
- crashes
- contadores absurdos

No siempre pasa eso.

Muchas veces los síntomas son más sutiles:

- doble uso de un cupo
- una transición indebida
- una operación permitida una vez de más
- un permiso revocado que sigue funcionando un instante
- una reserva duplicada
- una ventana de acceso indebido
- una validación que “a veces falla”
- resultados inconsistentes entre nodos

### Idea importante

Una race condition puede dañar seguridad o negocio aunque todo “parezca funcionar” la mayor parte del tiempo.

### Regla sana

No descartes concurrencia solo porque no hay corrupción visible.
A veces el problema es una pequeña ventana que igual alcanza para romper invariantes importantes.

---

# Parte 8: Qué tipos de flujos merecen sospecha inmediata

Conviene sospechar especialmente cuando veas lógica tipo:

- check-and-act
- find-then-update
- read-modify-write
- if-not-exists-then-create
- validate-then-transfer
- verify-permission-then-perform
- reserve-then-confirm
- check-balance-then-debit
- ensure-free-then-assign

### Idea útil

Esos patrones no están mal por sí mismos.
Pero casi siempre merecen una pregunta extra:
- “¿qué pasa si dos actores llegan acá casi al mismo tiempo?”

### Regla sana

Cada flujo con estructura “primero verifico y después hago” merece una revisión explícita de TOCTOU.

---

# Parte 9: Por qué esto importa mucho para seguridad y no solo para consistencia

A veces se enseña concurrencia como tema de integridad de datos nada más.
Pero muchas races también afectan seguridad, por ejemplo cuando permiten:

- saltar límites de stock o cuota
- usar dos veces una autorización
- operar tras una revocación
- reclamar recursos exclusivos
- pasar validaciones de ownership
- duplicar efectos económicos
- explotar ventanas donde una policy todavía parece válida

### Idea importante

No toda race condition es “solo un bug raro”.
Muchas son fallas de enforcement.

### Regla sana

Cada vez que el flujo proteja:
- dinero
- permisos
- cuotas
- unicidad
- exclusividad
- ownership
- o estados sensibles
tratá la concurrencia como un tema de seguridad real.

---

# Parte 10: Qué preguntas conviene hacer desde el inicio del bloque

Cada vez que veas un flujo de negocio importante en una app Spring, conviene empezar a preguntarte:

- ¿qué estado lee antes de actuar?
- ¿qué otros flujos pueden cambiar ese mismo estado?
- ¿cuánto tiempo pasa entre check y use?
- ¿hay más de un actor compitiendo por el mismo recurso?
- ¿hay requests, jobs o workers que corren al mismo tiempo?
- ¿qué pasaría si dos operaciones llegan casi juntas?
- ¿el código se ve secuencial pero la realidad del sistema no lo es?

### Idea importante

La review madura no mira solo si la lógica “tiene sentido”.
Mira también si sigue teniendo sentido **bajo concurrencia real**.

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- servicios que leen y luego actualizan estado sensible
- operaciones financieras o de stock
- reservas, reclamos o asignaciones exclusivas
- validaciones previas a escrituras
- transiciones de estado importantes
- combinaciones request + worker sobre el mismo recurso
- entidades donde varias rutas pueden cambiar el mismo campo
- lógica que depende de “si todavía está libre”, “si todavía existe”, “si todavía puede”, “si todavía no fue usado”

### Idea útil

Si el sistema tiene un “todavía”, probablemente ya hay una pregunta temporal que merece modelado explícito.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- conciencia clara de que la verificación y la acción no son lo mismo
- menor distancia temporal entre check y use
- menos supuestos implícitos sobre orden de ejecución
- modelado explícito de recursos exclusivos o estados revocables
- equipos que hablan de concurrencia como parte del diseño y no como accidente raro

### Idea importante

La madurez aquí se nota cuando el sistema no asume que el mundo se queda quieto mientras decide.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “primero chequeamos y después actualizamos” como defensa suficiente
- código muy lineal sobre estados compartidos
- varios flujos tocando el mismo recurso sin modelo claro
- el equipo piensa en requests individuales, pero no en interacciones entre ellas
- decisiones sensibles basadas en snapshots frágiles
- nadie puede explicar qué pasa si dos operaciones llegan casi al mismo tiempo

### Regla sana

Si el sistema no sabe responder bien al escenario “dos actores llegan juntos”, probablemente todavía no tiene bien cerrada esta superficie.

---

## Checklist práctica

Para arrancar este bloque, cuando veas un flujo sensible preguntate:

- ¿qué verifica?
- ¿qué usa después de verificar?
- ¿qué puede cambiar en el medio?
- ¿quién más puede tocar ese estado?
- ¿qué pasa si dos requests o procesos llegan juntos?
- ¿qué parte del flujo depende de que la realidad no cambie?
- ¿qué invariante de negocio o seguridad se rompería si esa suposición falla?

---

## Mini ejercicio de reflexión

Tomá un flujo real de tu app Spring y respondé:

1. ¿Qué estado lee antes de actuar?
2. ¿Qué decisión toma a partir de ese estado?
3. ¿Qué otros flujos podrían cambiarlo al mismo tiempo?
4. ¿Qué parte del código se ve secuencial pero depende de concurrencia real?
5. ¿Qué daño sería peor si dos operaciones “ganaran” a la vez?
6. ¿Qué parte del equipo sigue viendo esto como “solo consistencia” y no como seguridad?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

Las race conditions y los problemas de TOCTOU importan porque muchas veces el sistema toma decisiones correctas para un instante y luego actúa como si el mundo no pudiera cambiar entre esa verificación y el uso real de esa conclusión.

La gran intuición de este inicio es esta:

- no hace falta un bug extraño de threads para tener concurrencia problemática
- el código puede verse secuencial aunque la realidad no lo sea
- validar antes de actuar no siempre alcanza
- dos flujos normales de producto pueden competir por la misma verdad
- y una pequeña ventana temporal puede bastar para romper invariantes de negocio o seguridad

En resumen:

> un backend más maduro no trata las race conditions y los TOCTOU como rarezas de bajo nivel reservadas para sistemas muy especiales, sino como una consecuencia natural de tener múltiples actores, procesos y momentos compitiendo sobre el mismo estado en aplicaciones modernas.  
> Entiende que la pregunta importante no es solo si la lógica parece correcta al leerla en una sola línea temporal, sino si sigue siéndolo cuando otros requests, jobs, workers o eventos pueden intervenir entre el check y la acción real.  
> Y justamente por eso este tema importa tanto: porque abre un bloque donde la atención deja de estar solo en qué valida el sistema y pasa también a cuándo lo valida, cuánto tarda en usar esa validación y qué puede ocurrir mientras tanto, que es uno de los lugares donde más fácilmente se rompen, sin ruido aparente, las suposiciones de seguridad y de consistencia de una aplicación.

---

## Próximo tema

**Stock, cuotas y recursos exclusivos: cuando dos requests creen que ganaron**
