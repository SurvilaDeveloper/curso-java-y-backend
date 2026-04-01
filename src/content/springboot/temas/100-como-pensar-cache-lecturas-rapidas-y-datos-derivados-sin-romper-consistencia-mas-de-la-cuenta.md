---
title: "Cómo pensar caché, lecturas rápidas y datos derivados sin romper consistencia más de la cuenta"
description: "Entender por qué la caché aparece naturalmente cuando el backend crece en lecturas, volumen o latencia, y cómo pensarla con criterio para ganar performance sin perder de vista consistencia, ownership y frescura de los datos."
order: 100
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- concurrencia
- locking
- optimistic locking
- pessimistic locking
- condiciones de carrera
- lost updates
- conflictos cuando varias requests, jobs o consumidores tocan el mismo estado

Eso ya te dejó una idea muy importante:

> cuando varias operaciones interactúan con el mismo dato, el backend no puede asumir ejecución perfectamente ordenada, y necesita proteger tanto la integridad técnica como las reglas del dominio.

Ahora aparece otra pregunta muy natural cuando el sistema empieza a crecer en:

- tráfico
- concurrencia
- lecturas repetidas
- latencia
- composición de datos
- cantidad de instancias
- consultas costosas
- presión sobre la base o sobre servicios internos

La pregunta es:

> ¿cuándo conviene cachear o derivar datos para leer más rápido, y qué costo trae eso sobre la consistencia?

Porque muy pronto en un backend real empiezan a aparecer situaciones como:

- la misma consulta se repite muchísimo
- ciertas pantallas leen datos una y otra vez
- un resumen tarda demasiado en armarse siempre desde cero
- la base está bien, pero las lecturas agregadas ya son caras
- varios clientes piden lo mismo constantemente
- ciertas composiciones son lentas aunque el dato no cambie tanto
- un BFF o una API gateway necesita respuestas rápidas para vistas frecuentes

Ahí aparecen ideas muy importantes como:

- **caché**
- **lecturas rápidas**
- **datos derivados**
- **proyecciones**
- **frescura del dato**
- **invalidez o expiración**
- **consistencia aceptable**
- **tradeoff entre precisión instantánea y performance**

Este tema es clave porque la caché puede ser una herramienta poderosísima, pero también una de las formas más rápidas de volver opaco, inconsistente o engañoso a un sistema si se usa sin criterio.

## El problema de recalcular o releer todo siempre

Cuando el sistema todavía es chico, es natural pensar así:

1. llega request
2. leo la base o los servicios necesarios
3. armo respuesta
4. devuelvo

Y muchas veces eso está perfecto.

Pero a medida que el sistema crece, ciertas lecturas empiezan a pesar más de lo esperado.
Por ejemplo:

- dashboards
- listados populares
- catálogos
- precios o configuraciones relativamente estables
- resúmenes compuestos de varios dominios
- endpoints muy consultados
- datos que cambian poco pero se leen muchísimo

Entonces aparece una tensión muy real:

> leer siempre “la verdad fresca” desde la fuente puede ser correcto, pero a veces ya no es lo más eficiente ni lo más barato en latencia.

Y ahí la idea de caché empieza a volverse tentadora.

## Qué es caché, a nivel simple

Dicho simple:

> una caché es una forma de guardar temporalmente un resultado ya calculado o ya obtenido, para no tener que reconstruirlo o volver a buscarlo cada vez desde la fuente original.

Esa fuente original puede ser:

- base de datos
- otro servicio
- un proveedor externo
- una composición de varios datos
- un cálculo costoso
- una lectura agregada

La idea central es esta:

> sacrificás algo de inmediatez o de simplicidad a cambio de responder más rápido o con menos costo repetido.

## Qué problema intenta resolver la caché

Resuelve preguntas como:

- ¿por qué recalculo esto miles de veces si casi no cambia?
- ¿por qué golpear siempre a la base si el dato se lee muchísimo más de lo que se escribe?
- ¿por qué componer este resumen en cada request si podría reutilizarlo?
- ¿por qué exponer a un proveedor lento si el valor se mantiene razonablemente estable un rato?

No resuelve todo.
Pero cuando el patrón correcto existe, puede mejorar muchísimo:

- latencia
- throughput
- carga sobre la base
- carga sobre servicios internos
- experiencia del usuario
- costo operativo

## Una intuición muy útil

Podés pensar así:

> la caché es una apuesta controlada a que un resultado suficientemente reciente vale más que reconstruirlo siempre desde cero.

Esta frase ayuda mucho porque recuerda algo clave:
la caché siempre introduce una negociación con la frescura o con la complejidad.

## Qué significa “datos derivados”

Los datos derivados son datos que no necesariamente son la fuente primaria de verdad, sino una representación calculada, resumida, transformada o proyectada a partir de otras fuentes.

Por ejemplo:

- cantidad total de pedidos por usuario
- resumen de checkout
- vista compacta de catálogo
- proyección de “mi cuenta”
- conteo precalculado
- timeline ya compuesto
- stock disponible calculado para lectura rápida
- resumen dashboard

No siempre estos datos derivan solo de una tabla.
A veces derivan de varias partes del sistema.

Y ahí la caché y las proyecciones se vuelven muy amigas.

## Por qué esto importa tanto

Porque muchas veces lo que más duele no es leer un dato simple.
Lo que más duele es armar una vista costosa una y otra vez.

Por ejemplo:

- leer usuario
- leer pedidos recientes
- leer estado de pagos
- leer notificaciones
- leer imagen de perfil
- componer todo en una sola respuesta

Si esa composición se hace todo el tiempo, puede empezar a costar bastante.
Ahí una proyección o caché puede aportar muchísimo.

## Qué tipos de cosas suelen ser buenas candidatas para caché

Por ejemplo:

- lecturas muy frecuentes
- datos que cambian poco
- catálogos
- configuraciones
- resúmenes costosos de armar
- resultados de consultas caras
- datos externos relativamente estables
- vistas agregadas para frontend
- respuestas que toleran cierta antigüedad corta

No significa que toda lectura frecuente deba cachearse.
Pero sí que estas son señales fuertes.

## Qué tipo de cosas suelen ser candidatas más delicadas

Por ejemplo:

- saldos extremadamente sensibles
- stock crítico en tiempo real
- estados de pago que cambian justo ahora
- información que no tolera stale data
- decisiones de autorización
- datos muy dependientes de contexto inmediato

Ahí la caché puede ser mucho más riesgosa si se usa mal.

## Qué significa stale data

Es, básicamente, dato desactualizado o no completamente fresco.

Por ejemplo:

- la base ya cambió
- pero la caché todavía refleja el valor anterior

Esto no es necesariamente un desastre siempre.
A veces es aceptable.
Otras veces no.

Y una de las decisiones más importantes del tema es justamente esta:

> ¿cuánta desactualización tolera este caso de uso?

## Un ejemplo donde puede ser aceptable

Supongamos un catálogo público donde una descripción cambia muy poco.
Si un usuario ve durante 30 segundos una versión anterior de un texto o de una imagen de referencia, probablemente no sea gravísimo.

Ahí una caché con cierta expiración puede tener mucho sentido.

## Un ejemplo donde puede ser mucho más delicado

Ahora pensá en:

- stock de la última unidad
- estado definitivo de un pago
- permiso actual de un usuario
- monto disponible de un crédito
- vencimiento crítico de una operación

Ahí el costo de leer algo stale puede ser mucho más alto.

Entonces no alcanza con preguntar “¿esto se puede cachear?”.
Conviene preguntar algo mejor:

> ¿qué costo tiene que este dato esté unos segundos o minutos desactualizado?

Esa pregunta es excelente.

## Qué relación tiene esto con consistencia

Muy fuerte.

La caché casi siempre mete un tradeoff entre:

- performance
- simplicidad
- frescura
- consistencia observada por el cliente

No significa que la consistencia desaparezca.
Significa que se vuelve más matizada.

A veces la fuente de verdad ya cambió, pero ciertas lecturas todavía muestran una proyección o un dato derivado algo viejo.
Eso es una forma de consistencia eventual aplicada a lectura.

## Qué relación tiene esto con ownership de datos

También es muy importante.

Si ya venías pensando ownership, la pregunta pasa a ser:

- ¿quién es la fuente de verdad?
- ¿qué es cache o proyección derivada?
- ¿quién invalida o recalcula?
- ¿quién manda si hay diferencia?

La caché no debería volverte ciego sobre la autoridad real del dato.

Una idea muy valiosa es esta:

> caché no es fuente de verdad; es una ayuda para leer mejor o más rápido una verdad que vive en otro lado.

Esa distinción evita muchísimos problemas conceptuales.

## Qué tipos de caché suelen existir a nivel mental

No hace falta todavía clasificar todo el universo, pero sí ayuda pensar al menos en tres ideas simples:

### Caché local en memoria de una instancia
Rápida, simple, pero puede divergir entre nodos si tenés varias instancias.

### Caché compartida
Más coherente entre instancias, pero con su propia complejidad y dependencia.

### Datos derivados persistidos o proyecciones
No son solo un “cachecito”; pueden ser vistas o resúmenes materializados para lectura más rápida.

Estas tres ideas ya ayudan muchísimo a ordenar el tema.

## Qué problema trae la caché local con varias instancias

Muy parecido a lo que viste con state local.

Si tenés:

- backend-1
- backend-2
- backend-3

y cada uno cachea cosas por su lado, puede pasar que:

- uno tenga dato actualizado
- otro tenga dato viejo
- otro recién lo cargue

No siempre esto es grave.
Pero conviene notarlo, porque a medida que el sistema escala horizontalmente, una caché local por nodo introduce más posibilidades de divergencia temporal.

## Qué ventaja tiene la caché local

También tiene ventajas reales:

- muy rápida
- simple
- barata de leer
- puede reducir muchísimo latencia en ciertos casos

Entonces otra vez:
no es buena o mala universalmente.
Depende del uso y del costo de la desalineación.

## Qué significa invalidar caché

Invalidar significa, a grandes rasgos:

> decidir que el valor cacheado ya no debe seguir usándose porque probablemente quedó viejo o incorrecto.

Esto es importantísimo.
Porque la caché no es solo “guardar”.
También es saber cuándo dejar de confiar en lo guardado.

Y acá aparece uno de los grandes dolores del tema.

## Por qué invalidar es tan delicado

Porque si invalidás mal:

- servís datos viejos demasiado tiempo
- invalidás de menos
- invalidás de más y perdés casi todo beneficio
- generás comportamientos intermitentes difíciles de entender
- algunos nodos siguen con un valor, otros no

Entonces la caché no es solo performance.
También es estrategia de invalidez.

## Dos enfoques mentales muy comunes

### Expiración por tiempo
El dato dura cierto tiempo y luego se considera vencido.

### Invalidez por evento o cambio
Cuando algo relevante cambia, se invalida o recalcula la caché relacionada.

Ambos enfoques pueden combinarse.
Y cada uno tiene ventajas y problemas.

## Qué gana la expiración por tiempo

Suele ser más simple conceptualmente.

Por ejemplo:
- esta lista dura 30 segundos
- este resumen dura 5 minutos
- esta configuración dura 1 hora

Eso es fácil de entender y operar.

El costo es que durante ese tiempo podrías servir un valor viejo incluso si la fuente cambió hace un segundo.

## Qué gana la invalidación por cambio

Puede darte datos más frescos, porque reaccionás cuando algo realmente cambió.

Por ejemplo:
- se actualizó producto
- se invalida caché de catálogo
- se aprobó pago
- se invalida resumen de checkout
- cambió perfil
- se invalida vista de mi cuenta

El costo es que:
- tenés que detectar bien el cambio
- saber qué cachés afecta
- evitar olvidar invalidaciones
- manejar sistemas distribuidos y timings

No siempre es trivial.

## Un ejemplo muy claro

Supongamos una pantalla “Mis pedidos”.

Podrías cachear el resumen por usuario durante unos segundos.
Eso quizá funcione muy bien.

Pero si justo se crea un pedido nuevo o cambia un estado importante, tenés que pensar:
- ¿aceptás que el usuario lo vea unos segundos después?
- ¿o querés invalidar al instante?

La respuesta depende del valor del caso de uso y del costo de complejidad que aceptás.

## Qué relación tiene esto con BFF y composición de vistas

Muy fuerte.

En los temas anteriores viste cómo un BFF puede componer datos de varios servicios.
Eso a menudo hace aparecer el deseo de cachear resultados ya compuestos para que una pantalla cargue mejor.

Por ejemplo:

- resumen de cuenta
- home personalizada
- dashboard admin
- resumen de checkout
- datos de cabecera para frontend

Estas composiciones suelen ser candidatas muy naturales para caché o proyecciones, porque armar la vista completa una y otra vez puede costar bastante.

## Qué relación tiene esto con eventos y proyecciones

También es muy fuerte.

A veces, en vez de recalcular una lectura compleja cada vez, podés mantener una proyección actualizada a partir de eventos.

Por ejemplo:

- `PedidoCreado`
- `PagoAprobado`
- `PerfilActualizado`

y con eso actualizás una vista derivada que después se lee rápido.

Eso puede ser muy potente.
Pero también te mete más de lleno en:

- consistencia eventual
- reintentos
- idempotencia
- sincronización de proyecciones

No es magia.
Es otra negociación.

## Qué relación tiene esto con concurrencia

También importa bastante.

Si varias operaciones cambian el dato fuente mientras otras leen una caché o una proyección, aparecen preguntas como:

- cuándo se invalida
- qué versión gana
- quién recalcula
- si podés servir un valor parcialmente viejo
- qué pasa si dos actualizaciones se pisan en la proyección

Esto muestra que caché no vive aislada.
Está completamente conectada con concurrencia y consistencia.

## Qué relación tiene esto con datos externos

Muy interesante también.

A veces cachear respuestas de terceros puede ser excelente si:

- son lentos
- el dato cambia poco
- el costo de volver a consultar siempre es alto
- una pequeña desactualización es aceptable

Por ejemplo:

- cotizaciones no críticas
- catálogos externos
- geocoding
- metadata auxiliar
- configuraciones

Pero, otra vez, no todo dato externo tolera eso igual.

## Qué no conviene cachear a ciegas

No conviene cachear por reflejo todo lo que parece lento.

Conviene primero entender:

- por qué es lento
- quién lo lee
- cuánto cambia
- cuánto duele si está viejo
- quién lo invalida
- qué pasa si la caché falla o se desincroniza

Sin esas respuestas, la caché puede convertirse en un parche que agrega más opacidad que valor.

## Qué relación tiene esto con debugging

Muy fuerte.

Porque una vez que hay caché, empiezan a aparecer preguntas más molestas como:

- ¿el valor viejo venía de la base o del cache?
- ¿ya venció?
- ¿se invalidó?
- ¿este nodo tiene otro valor?
- ¿la proyección se actualizó?
- ¿qué parte del pipeline quedó atrasada?

Si no lo pensás bien, la caché puede volverse una fuente tremenda de confusión.

Por eso observabilidad vuelve a importar mucho acá.

## Qué relación tiene esto con métricas

También muy fuerte.

En caché suelen importar cosas como:

- hit rate
- miss rate
- tiempo de construcción del valor
- cantidad de invalidaciones
- latencia con y sin caché
- errores de recomputación
- cuántas veces se sirvió dato fallback

No hace falta que ahora implementes todo eso.
Pero es importante captar que una caché seria también se observa.

## Qué no conviene hacer

No conviene:

- asumir que cachear siempre mejora el sistema
- olvidar la fuente de verdad
- ignorar cuánto stale data tolera el negocio
- usar caché local sin pensar múltiples instancias
- cachear datos extremadamente sensibles sin entender el costo
- invalidar de forma caótica o no invalidar nunca
- meter cache para esconder consultas mal diseñadas sin revisar el problema base

Ese tipo de decisiones suele traer bugs bastante molestos.

## Otro error común

Pensar que caché es solo un detalle de infraestructura y no una decisión de dominio o de UX.
En realidad, el costo de servir un dato viejo depende mucho del significado del dato para el negocio y para el usuario.

## Otro error común

Confundir proyección derivada con fuente de verdad.
Una proyección puede ser útil, rápida y valiosa, pero no necesariamente manda sobre la semántica del sistema.

## Otro error común

Querer consistencia perfecta, cero latencia y complejidad mínima al mismo tiempo.
La caché suele existir justamente porque hay que negociar entre esas cosas.

## Una buena heurística

Podés preguntarte:

- ¿este dato se lee mucho más de lo que se escribe?
- ¿qué costo tiene reconstruirlo siempre?
- ¿qué costo tiene servirlo un poco viejo?
- ¿quién es la fuente de verdad?
- ¿cómo lo invalidaría o actualizaría?
- ¿esto conviene cache local, compartida o como proyección derivada?
- ¿estoy optimizando un problema real o agregando complejidad por ansiedad?

Responder eso te ayuda muchísimo a usar caché con más criterio.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque apenas el backend empieza a tener:

- más tráfico
- dashboards
- vistas compuestas
- varios clientes
- BFF
- servicios internos
- integraciones lentas
- costos de lectura altos

la tentación de cachear aparece muy fuerte.
Y la diferencia entre una caché útil y una caótica depende mucho más del criterio arquitectónico que de la herramienta puntual.

## Relación con Spring Boot

Spring Boot puede convivir muy bien con cachés, proyecciones y lecturas optimizadas.
Pero el framework no decide por vos:

- qué dato tolera stale data
- qué TTL tiene sentido
- quién invalida
- qué es fuente de verdad
- cuándo una proyección ya merece existir

Eso sigue siendo diseño del backend y del dominio.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando el backend crece en volumen y lecturas, la caché y los datos derivados pueden aportar muchísimo valor, pero conviene usarlos entendiendo siempre quién es la fuente de verdad, cuánto dato viejo tolera el caso de uso y cómo vas a invalidar, recalcular u observar esas lecturas rápidas sin romper consistencia más de la cuenta.

## Resumen

- La caché aparece naturalmente cuando ciertas lecturas se repiten mucho o son costosas.
- Cachear no es gratis: casi siempre introduce un tradeoff con frescura, consistencia o complejidad.
- No todo dato tolera el mismo nivel de stale data.
- Ownership y fuente de verdad siguen siendo claves incluso cuando hay proyecciones o cachés.
- Expiración por tiempo e invalidación por cambios son estrategias útiles pero con costos distintos.
- Varias instancias, concurrencia y BFF vuelven este tema todavía más relevante.
- Este tema te ayuda a pensar performance sin perder de vista la coherencia del sistema.

## Próximo tema

En el próximo tema vas a ver cómo empezar a pensar mensajería más robusta, colas y brokers cuando los eventos y tareas desacopladas ya no son algo ocasional, sino una parte importante del sistema, porque a partir de ahí la coordinación asíncrona gana todavía más protagonismo.
