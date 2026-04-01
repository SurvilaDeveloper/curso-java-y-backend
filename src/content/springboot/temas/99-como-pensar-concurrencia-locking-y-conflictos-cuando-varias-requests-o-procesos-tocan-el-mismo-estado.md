---
title: "Cómo pensar concurrencia, locking y conflictos cuando varias requests o procesos tocan el mismo estado"
description: "Entender qué problemas aparecen cuando varias requests, jobs o consumidores intentan modificar el mismo dato al mismo tiempo, y cómo pensar concurrencia, locking y resolución de conflictos en un backend Spring Boot que ya creció en volumen y complejidad."
order: 99
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- datos compartidos
- ownership
- límites de base de datos
- fuente de verdad
- lecturas cruzadas
- proyecciones
- acoplamiento por persistencia

Eso ya te dejó una idea muy importante:

> una arquitectura puede parecer modular desde el código, pero seguir completamente enredada por debajo si no está claro quién manda sobre qué datos y cómo se coordinan sus cambios.

Ahora aparece otra pregunta muy natural cuando el sistema ya tiene:

- varias instancias
- varias requests concurrentes
- jobs en segundo plano
- eventos
- webhooks
- consumidores asíncronos
- más de un actor intentando tocar el mismo estado

La pregunta es:

> ¿qué pasa cuando dos o más operaciones intentan modificar la misma información al mismo tiempo?

Porque una cosa es pensar el backend como si las acciones ocurrieran ordenadamente, una detrás de otra.
Y otra muy distinta es la realidad de sistemas con concurrencia, donde puede pasar que:

- dos usuarios compren el último stock al mismo tiempo
- dos requests editen el mismo recurso casi juntas
- un webhook llegue mientras un proceso interno todavía está actualizando
- un job de compensación corra a la vez que una acción manual
- un consumidor procese un mensaje mientras otro ya cambió el estado
- una segunda acción lea un dato todavía no persistido o ya desactualizado

Ahí aparecen ideas muy importantes como:

- **concurrencia**
- **conflictos**
- **pisado de datos**
- **locking**
- **optimistic locking**
- **pessimistic locking**
- **lost updates**
- **condiciones de carrera**

Este tema es clave porque, a medida que el backend deja de ser simple y aislado, ya no alcanza con pensar “qué debería pasar”.
También necesitás pensar:

> qué pasa si dos cosas válidas intentan pasar a la vez.

## El problema de asumir que las operaciones ocurren una por una

Cuando recién empezás, es muy común imaginar el sistema así:

1. entra una request
2. hace su trabajo
3. termina
4. recién después entra la siguiente

Ese modelo sirve muchísimo para entender lógica básica.
Pero se queda corto bastante rápido.

Porque en un sistema real puede haber:

- dos requests simultáneas
- varias instancias del backend
- jobs ejecutando en paralelo
- consumidores asíncronos
- reintentos
- webhooks y operaciones del usuario casi al mismo tiempo

Entonces, muy pronto, la realidad es esta:

> no siempre sos el único actor tocando ese dato en este mismo instante.

Y esa diferencia cambia muchísimo el diseño.

## Qué significa concurrencia en este contexto

Dicho simple:

> concurrencia significa que varias operaciones pueden estar intentando leer, calcular o modificar el mismo estado al mismo tiempo o con solapamiento temporal suficiente como para generar conflictos.

No hace falta que dos hilos choquen en el mismo nanosegundo exacto para que haya un problema.
Alcanza con que el flujo sea algo así:

1. A lee el estado actual
2. B lee el mismo estado actual
3. A calcula un cambio
4. B calcula otro cambio
5. A guarda
6. B guarda encima

Y listo:
ya tenés un conflicto muy real.

## Qué es un conflicto de concurrencia

Es una situación donde el resultado final depende del orden o del solapamiento entre operaciones concurrentes, y puede terminar produciendo un estado incorrecto o no deseado para el negocio.

Por ejemplo:

- stock negativo o mal reservado
- una edición pisada por otra
- un estado que retrocede
- una compensación que se ejecuta sobre información vieja
- un pago marcado de forma incoherente
- una cantidad recalculada con datos obsoletos

Esto no es un detalle técnico menor.
Es una fuente muy real de bugs en sistemas serios.

## Qué es una condición de carrera

Podés pensarlo así:

> una condición de carrera ocurre cuando el resultado correcto depende de qué operación llega antes o escribe antes, y el sistema no estaba diseñado para manejar ese solapamiento de forma segura.

Por ejemplo, si dos personas intentan reservar la última unidad de un producto y el sistema no protege ese flujo, puede pasar que ambas vean “hay stock” y ambas terminen comprando.

Ese es un ejemplo clarísimo de carrera.

## Un ejemplo muy simple de lost update

Este es uno de los clásicos.

Supongamos un recurso con valor actual:

```text
saldo = 100
```

Dos operaciones concurrentes leen ese valor.

### Operación A
- lee 100
- resta 10
- quiere guardar 90

### Operación B
- lee 100
- resta 20
- quiere guardar 80

Si no hay coordinación adecuada, puede pasar que:
- A guarde 90
- después B guarde 80

Y el resultado final quede en 80, cuando en realidad la secuencia combinada correcta habría implicado 70.

Ahí tenés un clásico **lost update**:
una actualización pisó a la otra sin integrar correctamente ambos cambios.

## Por qué esto importa tanto

Porque muchas veces el código se ve “correcto” en lectura lineal.
Pero el problema no está en la lógica aislada.
El problema aparece cuando esa lógica se ejecuta varias veces con solapamiento.

Por eso los bugs de concurrencia suelen ser especialmente molestos:

- no siempre se reproducen fácil
- a veces aparecen bajo carga
- a veces solo ocurren en producción
- pueden depender de timing
- y muchas veces el código parece razonable a simple vista

## Qué tipo de situaciones suelen ser sensibles a concurrencia

Por ejemplo:

- stock
- saldos
- cupos
- estados de órdenes
- edición de perfil o configuración
- reintentos de procesos
- pagos
- reservas
- aprobación o cancelación de recursos
- conteos agregados
- jobs o consumidores que reingresan sobre el mismo dato

No todo el sistema sufre igual la concurrencia.
Pero ciertos flujos son especialmente delicados.

## Un ejemplo muy real: stock

Supongamos que queda una sola unidad de un producto.

Dos requests llegan casi juntas.

Ambas hacen algo parecido a:

1. leer stock
2. ver que es mayor a 0
3. descontar 1
4. guardar

Sin protección adecuada, ambas pueden creer que la compra era válida.
Y ahí podés terminar vendiendo dos veces la última unidad.

Este es uno de los ejemplos más clásicos de por qué concurrencia importa tanto en backend real.

## Qué es locking, a nivel intuitivo

Podés pensarlo así:

> locking es una forma de evitar que varias operaciones incompatibles modifiquen un mismo estado de manera peligrosa al mismo tiempo.

No hace falta todavía ponerse hiperformal.
La intuición importante es:

- si una operación está trabajando sobre algo delicado
- quizá otra debería esperar, detectar conflicto o fallar de forma controlada

Ese es el corazón del problema.

## Dos grandes enfoques mentales

A muy alto nivel, suelen aparecer dos familias muy importantes:

- **pessimistic locking**
- **optimistic locking**

No hace falta ahora aprenderlos como dogma.
Lo importante es entender qué problema intenta resolver cada uno.

## Qué es pessimistic locking

Podés pensarlo como un enfoque donde el sistema actúa más o menos así:

> como este dato puede generar conflicto serio, lo bloqueo mientras trabajo con él para que otros no lo modifiquen concurrentemente de manera incompatible.

Es decir, asumís que el conflicto es suficientemente probable o peligroso como para preferir exclusión más explícita.

Esto puede ser útil cuando:

- el dato es muy sensible
- el conflicto sería caro
- necesitás más protección fuerte
- hay alta contención sobre el mismo recurso

Pero también trae costos, como más espera o menor concurrencia efectiva.

## Qué es optimistic locking

El enfoque optimista piensa algo más así:

> dejo que varias operaciones intenten trabajar, pero al guardar verifico si alguien cambió el dato en el medio; si pasó, detecto conflicto y reacciono.

Es decir:

- no bloqueás de entrada
- asumís que la mayoría de las veces no habrá choque
- pero si lo hay, lo detectás y evitás pisado silencioso

Esto suele encajar bien cuando:

- los conflictos no son tan frecuentes
- querés mejor concurrencia
- preferís detectar antes que bloquear preventivamente

La idea es muy potente y muy común.

## Una intuición muy útil

Podés pensarlo así:

### Pessimistic
“Bloqueo porque no quiero que nadie más toque esto ahora”

### Optimistic
“No bloqueo de entrada, pero verifico si alguien se metió antes de confirmar mi cambio”

Esta diferencia mental ya ordena muchísimo.

## Un ejemplo conceptual de optimistic locking

Supongamos que un registro tiene además una versión:

```text
id = 42
stock = 5
version = 7
```

Dos operaciones leen la misma versión 7.

La primera actualiza y deja:

```text
stock = 4
version = 8
```

La segunda intenta guardar su cambio todavía creyendo que trabajaba sobre versión 7.

Ahí el sistema puede detectar:

- “esto cambió desde que lo leíste”
- “tu actualización ya no es válida sin revisar de nuevo”

Ese es el espíritu del optimistic locking.

## Qué gana este enfoque

Que no necesitás bloquear preventivamente siempre.
Pero sí evitás el problema de que dos cambios incompatibles se pisen silenciosamente.

En vez de sobrescribir como si nada, el sistema detecta conflicto y puede:

- fallar de forma controlada
- pedir reintento
- volver a cargar datos
- reejecutar lógica
- informar al usuario o al proceso

Esto es muchísimo más sano que perder actualizaciones sin enterarte.

## Qué relación tiene esto con edición de recursos

Muy fuerte.

Imaginá una pantalla admin donde dos personas editan el mismo producto.

Ambas abren el formulario con los datos actuales.
Una guarda cambios.
La otra, minutos después, guarda su versión vieja encima.

Sin una estrategia de concurrencia, la segunda puede pisar cambios válidos sin darse cuenta.

Ahí el optimistic locking suele ser especialmente útil porque permite detectar:

- “alguien modificó este recurso desde que lo abriste”

Y evitar el pisado silencioso.

## Qué relación tiene esto con flujos automáticos

También importa mucho.

La concurrencia no ocurre solo entre usuarios humanos.
También puede aparecer entre:

- un usuario
- un job
- un webhook
- un consumidor de eventos
- un proceso de compensación
- un reintento automático

Por eso este tema no es solo de “dos personas editando el mismo formulario”.
Es mucho más general.

## Un ejemplo muy real con pagos

Supongamos:

- un webhook marca el intento como `APPROVED`
- al mismo tiempo un proceso interno revisa expiraciones pendientes
- ambos tocan el mismo `PaymentAttempt`

Si no pensaste bien concurrencia y transiciones válidas, podrías terminar con cosas como:

- un estado que vuelve atrás
- una expiración aplicada tarde
- un procesamiento incoherente
- una acción compensatoria disparada sobre un dato ya confirmado

Esto muestra que concurrencia y consistencia están muy conectadas.

## Qué relación tiene esto con transiciones de estado

Muy fuerte.

Una forma muy sana de protegerse no es solo técnica, sino también semántica.

Por ejemplo, definir cosas como:

- desde `PENDIENTE` puedo pasar a `PAGADO`
- desde `PAGADO` no vuelvo a `PENDIENTE`
- desde `CANCELADO` no debería iniciarse checkout
- desde `EXPIRADO` no debería acreditarse sin validación adicional

Estas reglas no reemplazan locking o control técnico.
Pero ayudan muchísimo a que, aun si hay concurrencia, el sistema rechace transiciones absurdas.

## Qué relación tiene esto con atomicidad local

También es importante.

Dentro de una operación local sobre una base, muchas veces querés que:

- leer
- validar
- cambiar
- persistir

formen una unidad razonable y coherente.

No siempre alcanza con tener una transacción si el conflicto viene de lectura vieja o de otra operación concurrente.
Pero sigue siendo una pieza importante del rompecabezas.

## Qué pasa si no resolvés bien los conflictos

Podés ver cosas como:

- stock sobrevendido
- cambios pisados
- estados imposibles
- datos inconsistentes
- contadores mal calculados
- reservas duplicadas
- decisiones automáticas sobre información vieja
- resultados que dependen del azar del timing

Y estos bugs suelen ser especialmente traicioneros porque no siempre explotan enseguida.

## Qué relación tiene esto con UX

Muy fuerte también.

A veces una buena estrategia de concurrencia no solo protege al sistema, sino que mejora la honestidad de la experiencia.

Por ejemplo, en vez de dejar que alguien pise silenciosamente cambios ajenos, podés detectar:

- “este recurso cambió mientras lo estabas editando”

o:

- “ya no queda stock”
- “este pedido ya fue procesado”
- “este estado ya cambió, recargá la pantalla”

Eso evita que el usuario opere sobre una ficción desactualizada.

## Qué relación tiene esto con retries

También importa bastante.

Si una operación falla por conflicto de concurrencia, a veces lo correcto puede ser:

- recargar estado
- reintentar con nueva información
- rechazar la acción
- pedir intervención humana
- o dejar claro que el recurso ya cambió

No siempre el retry automático es la solución correcta.
Depende mucho del flujo y del significado del conflicto.

## Qué relación tiene esto con sistemas distribuidos

Muy directa.

Cuanto más distribuido o concurrente es el sistema, más probable es que:

- varios actores toquen el mismo estado
- la información llegue en tiempos distintos
- un consumidor procese tarde
- una compensación llegue tarde
- haya reintentos y duplicados
- distintos nodos operen sobre la misma base o el mismo recurso lógico

Por eso concurrencia no es un tema aislado de base de datos.
Es una parte muy central del pensamiento de sistemas.

## Qué no conviene hacer

No conviene:

- asumir que leer y escribir sin más ya es seguro
- confiar en que “casi nunca” habrá dos operaciones al mismo tiempo
- ignorar lost updates
- depender solo del orden feliz
- dejar que cualquier transición de estado se aplique sin validar contexto actual
- usar locking fuerte por todos lados sin criterio
- ignorar que jobs, webhooks y reintentos también compiten por el mismo estado

Ese tipo de decisiones suele traer bugs muy molestos.

## Otro error común

Pensar que concurrencia es solo un problema de alto tráfico extremo.
A veces aparece incluso con poco volumen, si el flujo es suficientemente sensible.

## Otro error común

Creer que una transacción por sí sola resuelve cualquier carrera.
No siempre.
Depende de qué se lee, cuándo se valida, qué otro proceso cambia y cómo detectás conflicto.

## Otro error común

No distinguir entre:
- protección técnica del dato
- y reglas del dominio sobre qué transición es válida

Ambas cosas suelen necesitarse juntas.

## Una buena heurística

Podés preguntarte:

- ¿qué pasa si dos operaciones tocan esto al mismo tiempo?
- ¿qué valor o estado podría quedar pisado?
- ¿este flujo soporta optimistic locking?
- ¿necesito una exclusión más fuerte?
- ¿qué transición ya no debería aceptarse si el estado cambió?
- ¿cómo detecto que estoy trabajando sobre información vieja?
- ¿qué le digo al usuario o al proceso cuando detecto conflicto?

Responder eso te ayuda muchísimo a diseñar estados y persistencia más robustos.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque apenas el sistema tiene:

- múltiples usuarios
- múltiples instancias
- jobs
- consumidores
- webhooks
- reintentos
- pagos
- reservas
- stock
- cambios concurrentes

la concurrencia deja de ser una curiosidad académica y pasa a ser una fuente muy concreta de bugs de negocio.

## Relación con Spring Boot

Spring Boot te da una base muy buena para trabajar con persistencia, transacciones y estados.
Pero el framework no elimina por sí solo los problemas de concurrencia.

La parte más importante sigue siendo el criterio de diseño:

- qué puede chocar
- cómo detectás conflicto
- cuándo bloqueás
- cuándo confiás en optimistic locking
- qué transición es válida
- y qué consecuencias querés cuando el conflicto aparece

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando varias requests, jobs o consumidores pueden tocar el mismo estado, el backend ya no puede asumir ejecución ordenada y aislada, y necesita pensar explícitamente concurrencia, locking y conflictos para evitar lost updates, estados incoherentes y transiciones inválidas, combinando protección técnica y reglas claras del dominio.

## Resumen

- La concurrencia aparece cuando varias operaciones pueden leer o modificar el mismo estado con solapamiento real.
- Lost updates y condiciones de carrera son problemas muy concretos de backend real.
- Pessimistic y optimistic locking resuelven el mismo problema desde estrategias distintas.
- Los conflictos no ocurren solo entre usuarios humanos, sino también entre jobs, webhooks, eventos y procesos automáticos.
- Las reglas del dominio sobre estados válidos también ayudan muchísimo a proteger el sistema.
- No conviene asumir que la transacción o el bajo tráfico alcanzan para evitar estos problemas.
- Este tema te mete en una de las preguntas más reales y molestas del backend serio: qué pasa cuando dos cosas válidas intentan cambiar lo mismo al mismo tiempo.

## Próximo tema

En el próximo tema vas a ver cómo pensar caché, lecturas rápidas y datos derivados sin romper consistencia más de la cuenta, porque una vez que ya te preocupan volumen, concurrencia y múltiples lecturas del mismo estado, la tentación de cachear aparece muy fuerte y también trae tradeoffs importantes.
