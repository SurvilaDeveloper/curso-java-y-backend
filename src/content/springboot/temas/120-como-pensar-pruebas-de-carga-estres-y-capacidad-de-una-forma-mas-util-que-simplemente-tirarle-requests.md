---
title: "Cómo pensar pruebas de carga, estrés y capacidad de una forma más útil que simplemente tirarle requests"
description: "Entender por qué un backend Spring Boot serio no debería hacer pruebas de carga solo para ver si explota, y cómo pensar mejor experimentos de capacidad, estrés y degradación para aprender dónde están los límites reales del sistema."
order: 120
module: "Seguridad, performance y operación avanzada"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- métricas de performance
- percentiles
- capacidad
- saturación
- error rate
- backlog
- costo por operación
- señales operativas que realmente valen la pena mirar

Eso ya te dejó una idea muy importante:

> si querés entender performance de verdad, no alcanza con promedios lindos ni con dashboards decorativos; necesitás señales que te ayuden a ver distribución, capacidad, presión, costo y degradación real del sistema.

Y si ya tenés más claro qué conviene mirar, aparece enseguida una pregunta muy natural:

> ¿cómo descubrís de verdad cómo se comporta el backend cuando lo empujás, cuánto aguanta y qué parte se rompe primero?

Porque mucha gente arranca las pruebas de carga más o menos así:

- le tiro requests
- veo si responde
- si no explota, parece que está bien
- listo

Eso puede dar una intuición mínima.
Pero en sistemas reales se queda bastante corto.

Porque una prueba útil no debería responder solo:

- “¿anda o no anda?”

También debería ayudarte a responder cosas como:

- ¿cuál es el hot path que se degrada primero?
- ¿dónde empieza la saturación?
- ¿qué percentil empeora antes?
- ¿qué tan rápido crece el backlog?
- ¿qué dependencia externa colapsa primero?
- ¿cómo se comporta el sistema bajo uso sostenido?
- ¿qué pasa con jobs, colas o tenants ruidosos durante la carga?
- ¿qué throughput es sostenible y cuál ya no?
- ¿cómo degrada el sistema antes de romperse?
- ¿el problema está en CPU, base, locks, terceros o diseño de flujo?

Ahí aparecen ideas muy importantes como:

- **pruebas de carga**
- **pruebas de estrés**
- **pruebas de capacidad**
- **degradación controlada**
- **comportamiento bajo presión**
- **experimentos útiles**
- **carga realista**
- **sustained load**
- **burst load**
- **hallar límites antes del incidente**

Este tema es clave porque, en un backend serio, probar carga no debería ser solo “pegarle fuerte”, sino aprender algo útil sobre la forma real en que el sistema aguanta, se degrada y falla.

## El problema de hacer load testing como un ritual vacío

Este es uno de los errores más comunes.

A veces alguien corre una herramienta de carga, mira que:

- hubo muchas requests
- el sistema no se cayó
- el promedio quedó más o menos bien

y concluye:

- “aguanta”

Pero quizá no aprendió casi nada importante.

Porque tal vez no sabe:

- si la carga era realista
- si el patrón de tráfico se parecía al producto
- si el percentil malo se disparó
- si la cola empezó a crecer
- si el sistema estaba cerca de saturar base
- si un tenant pesado arruinaría a los demás
- si la degradación es aceptable
- si el throughput medido era sostenible o solo un pico corto
- si el problema vino del código propio o de una dependencia

Entonces aparece una idea muy importante:

> una prueba de carga vale mucho más por lo que te enseña que por la cantidad bruta de requests que tiró.

## Qué significa prueba de carga

Dicho simple:

> una prueba de carga busca observar cómo se comporta el sistema bajo una cantidad esperada o plausible de trabajo concurrente.

La clave está en la palabra **plausible**.

No se trata siempre de romper el sistema.
Muchas veces se trata de responder:

- con la carga que espero en producción, ¿cómo se comporta?
- qué latencia mantiene
- qué throughput sostiene
- qué recursos empiezan a tensionarse
- qué rutas se vuelven más caras
- qué percentiles empeoran
- si la UX seguiría siendo aceptable

Esto ya es muchísimo más útil que “tirar requests a lo loco”.

## Qué significa prueba de estrés

Podés pensarlo así:

> una prueba de estrés busca empujar el sistema más allá de su rango cómodo para descubrir cómo degrada, qué límites tiene y qué falla primero.

Acá la idea ya no es solo medir normalidad.
Es mirar comportamiento cerca del borde o más allá del borde.

Por ejemplo:

- qué pasa si duplicás tráfico
- qué pasa si el backlog se acumula
- qué pasa si una dependencia responde más lento
- qué pasa si un tenant consume muchísimo
- qué pasa si varios jobs pesados coinciden
- qué pasa si la cola deja de drenar al mismo ritmo

La prueba de estrés te ayuda a conocer el sistema cuando deja de ser cómodo.

## Qué significa prueba de capacidad

A nivel intuitivo:

> una prueba de capacidad busca estimar cuánto trabajo puede sostener el sistema antes de degradarse más allá de un nivel aceptable.

Acá la palabra importante es **sostener**.

No es solo:

- “una vez llegó a 2000 req/s”

Sino más bien:

- “con X tráfico sostenido, el p95 sigue aceptable”
- “con Y exports concurrentes, el resto del sistema sigue respirando”
- “con Z mensajes por minuto, la cola no acumula backlog peligroso”
- “con N tenants enterprise pesados, la fairness sigue siendo razonable”

La capacidad útil no es un número teatral.
Es una frontera operativa real.

## Una intuición muy útil

Podés pensar así:

### Carga
¿Cómo se comporta con uso esperado?

### Estrés
¿Cómo se comporta cerca del borde o más allá?

### Capacidad
¿Cuánto puede sostener razonablemente sin degradar de más?

Esta diferencia ya ordena muchísimo.

## Por qué esto importa tanto

Porque en sistemas reales no alcanza con optimizar intuiciones.
Necesitás evidencia sobre cosas como:

- qué throughput es sostenible
- qué tan rápido crece la latencia con el volumen
- en qué punto aparece saturación
- qué recursos limitan primero
- si el sistema degrada con dignidad o con caos
- si el problema es de código, infraestructura, datos o patrón de uso
- qué tan cerca estás de un incidente real
- qué margen operativo tenés antes de vender, lanzar o escalar algo

Todo eso es muchísimo más valioso que una sensación de “parece rápido en local”.

## Qué hace que una prueba sea más útil o más inútil

Una prueba se vuelve más útil cuando:

- representa patrones de uso reales
- mide las señales correctas
- distingue throughput de latencia
- observa percentiles y no solo promedio
- mira también jobs, colas, base y terceros
- modela concurrencia plausible
- considera tenants o features desiguales
- busca responder una pregunta concreta

En cambio, se vuelve bastante más inútil cuando:

- usa tráfico artificial irreconocible
- mira solo promedio
- ignora errores o retries
- no observa dependencias
- no sabe si la carga es sostenible
- solo corre 2 minutos y declara victoria
- o confunde “no se cayó” con “está sano”

## Un ejemplo muy claro

Supongamos una prueba de checkout.

No alcanza con medir:

- promedio del endpoint `/checkout`

También podría importar ver:

- p95 y p99 de inicio de checkout
- tiempo del provider de pagos
- retries
- errores
- backlog de webhook
- jobs de reconciliación posteriores
- presión sobre base
- latencia del flujo completo visible para usuario
- diferencia entre tenants chicos y grandes

Eso ya te da una visión muchísimo más realista.

## Qué relación tiene esto con realismo de la carga

Absolutamente total.

Una prueba puede dar resultados engañosos si no se parece nada al producto real.

Por ejemplo, no es lo mismo probar:

- un único endpoint liviano
- que el mix real de tráfico

Ni es lo mismo:

- requests perfectamente uniformes
- que picos, bursts, horas pico, integraciones ruidosas y jobs corriendo a la vez

Entonces una pregunta muy importante pasa a ser:

> ¿esta carga representa algo que razonablemente podría pasar en la realidad del sistema?

No hace falta que sea perfecta.
Pero cuanto más absurda sea la simulación, menos valen sus conclusiones.

## Qué tipos de patrones de carga puede tener sentido probar

Por ejemplo:

### Carga sostenida
Sirve para ver comportamiento estable durante un período más largo.

### Rampa gradual
Sirve para ver en qué punto empiezan a degradarse latencia, errores o saturación.

### Burst o pico corto
Sirve para ver cómo responde el sistema a subidas bruscas.

### Mezcla realista de endpoints o flujos
Sirve para ver el efecto del uso real, no de una sola operación aislada.

### Carga con background load
Sirve para ver qué pasa cuando además hay jobs, colas o batchs corriendo.

### Carga segmentada por tenant
Sirve para explorar noisy neighbors, fairness o planes distintos.

Cada una responde preguntas distintas.

## Qué relación tiene esto con percentiles

Muy fuerte.

Ya viste que el promedio puede mentir bastante.
En una prueba de carga eso se vuelve todavía más evidente.

Por ejemplo, con más concurrencia podés ver algo así:

- p50 casi no cambia
- promedio sube un poco
- p95 empeora muchísimo
- p99 explota
- error rate todavía no parece enorme

Eso significa que el sistema todavía “responde”, pero la cola lenta ya está sufriendo bastante.

Y eso suele ser una señal mucho más valiosa que el promedio.

## Qué relación tiene esto con saturación

Absolutamente total.

Una prueba de carga útil no debería mirar solo:
- cuánto tardó

También importa mirar:
- qué recurso se acercó primero al límite

Por ejemplo:

- CPU
- conexiones de base
- pool de threads
- locks
- workers de cola
- I/O
- tiempo de terceros
- memoria
- saturación de cierta integración
- pressure sobre storage o red

Porque si no sabés qué se saturó, te cuesta mucho decidir qué optimizar después.

## Una intuición muy útil

Podés pensar así:

> una prueba de carga buena no solo mide que algo va lento; también te dice por qué el sistema empezó a ir lento.

Esta diferencia vale muchísimo.

## Qué relación tiene esto con cuellos de botella reales

Muy fuerte.

A veces la prueba te muestra que el primer cuello no era donde imaginabas.

Por ejemplo:

- pensabas en base, pero era serialización
- pensabas en endpoint, pero era el BFF
- pensabas en código local, pero era el provider externo
- pensabas en CPU, pero era pool de conexiones
- pensabas en HTTP, pero era backlog de jobs
- pensabas en tenant globalmente, pero eran dos enterprise dominando la cola

Eso convierte la prueba en algo útil de verdad:
un experimento para descubrir el cuello real, no para confirmar prejuicios.

## Qué relación tiene esto con integraciones externas

Muy fuerte también.

Muchos tests de carga irreales ignoran terceros o los simulan demasiado bien.
Pero en la práctica:

- pagos
- mail
- storage
- proveedores de identidad
- APIs partner
- webhooks

pueden limitar muchísimo el flujo.

Entonces conviene pensar:

- ¿esta prueba incluye dependencia externa real o simulada?
- ¿si la simulo, estoy ocultando un cuello importante?
- ¿qué pasa si ese proveedor responde más lento?
- ¿qué pasa si aplica rate limit?
- ¿qué pasa si empieza a fallar parcialmente?

La carga útil de un sistema real muchas veces está muy condicionada por esas fronteras.

## Qué relación tiene esto con colas y jobs

Absolutamente fuerte.

Si la arquitectura tiene flujos asíncronos, una prueba de carga madura también debería mirar cosas como:

- backlog de cola
- tasa de producción vs consumo
- retries
- tiempo hasta procesamiento completo
- duración de jobs durante carga
- interferencia entre online y offline
- qué pasa si la cola absorbe presión durante un rato y después revienta

Porque si solo mirás el request inicial, podés creer que el sistema “aguantó”, cuando en realidad solo empujó el problema hacia una cola que quedó debiendo trabajo.

## Un ejemplo claro

Podrías ver algo así:

- `/checkout` responde razonablemente
- pero el backlog de webhook y reconciliación se duplica cada pocos minutos
- y el tiempo real hasta estado final aceptable se degrada fuerte

Eso significa que la carga “se está pagando después”.
Y es importantísimo verlo.

## Qué relación tiene esto con multi-tenancy y fairness

Muy fuerte.

Una prueba madura en plataformas multi-tenant a veces debería preguntarse:

- ¿qué pasa si dos tenants grandes hacen ruido a la vez?
- ¿cómo se comportan tenants chicos durante eso?
- ¿la latencia empeora parejo o de forma injusta?
- ¿la cuota o el rate limit están sirviendo?
- ¿hay recursos compartidos que un solo tenant domina demasiado?
- ¿ciertos planes deberían tener otro tratamiento?

Esto conecta performance con arquitectura de plataforma y con producto.

## Qué relación tiene esto con costo

Muy fuerte también.

Una prueba puede mostrarte no solo:
- hasta dónde llega el sistema

sino también:
- cuánto te cuesta operar cerca de ese límite

Por ejemplo:

- muchas misses de caché
- demasiadas llamadas a un proveedor pago
- jobs muy costosos
- storage temporal grande
- retries caros
- CPU disparada para sostener cierto throughput

Entonces la capacidad útil no es solo técnica.
También puede estar limitada por costo sostenible.

## Qué relación tiene esto con releases y cambios

Muchísima.

Las pruebas de carga pueden ayudarte a responder:

- ¿esta release empeoró p95?
- ¿esta nueva feature cambia el throughput sostenible?
- ¿este BFF nuevo mete más costo por request?
- ¿este cambio de tenant config degrada ciertos hot paths?
- ¿esta nueva versión cachea mejor o peor?
- ¿esta migración empeora jobs o exportaciones?

Eso vuelve las pruebas mucho más valiosas que una ceremonia pre-release vacía.

## Qué no conviene hacer

No conviene:

- tirar requests sin una pregunta clara
- mirar solo promedios
- ignorar percentiles, backlog y saturación
- probar una sola capa y olvidar el flujo real
- usar cargas irreales que no se parecen al producto
- declarar victoria porque “no se cayó”
- no diferenciar picos, carga sostenida y estrés real
- olvidar tenants, jobs o integraciones en un sistema que depende de ellos

Ese tipo de pruebas puede consumir tiempo y dar una confianza bastante falsa.

## Otro error común

Pensar que una prueba de carga sirve solo para “romper el sistema”.
En realidad muchas veces vale más para encontrar el borde sano y entender cómo se degrada antes de romperse.

## Otro error común

No distinguir entre:
- throughput pico
- throughput sostenible
- latencia media aceptable
- cola lenta insoportable
- error rate leve
- saturación peligrosa
- costo operativo excesivo

Todos esos límites pueden ser distintos.

## Otro error común

Hacer pruebas de carga sin mirar el sistema completo:
- base
- colas
- jobs
- terceros
- tenants
- caché
- retry
- errors
- saturación

Eso suele dejarte una foto muy incompleta.

## Una buena heurística

Podés preguntarte:

- ¿qué pregunta concreta quiero responder con esta prueba?
- ¿estoy modelando carga realista o solo volumen bruto?
- ¿qué percentiles me importan más?
- ¿qué recursos podrían saturarse primero?
- ¿qué parte del sistema podría absorber presión un rato y explotar después?
- ¿qué pasa con tenants desiguales o features caras?
- ¿estoy midiendo throughput sostenible o un pico engañoso?
- ¿qué decisión concreta podría tomar después de ver este resultado?

Responder eso te ayuda muchísimo a diseñar pruebas más útiles y menos teatrales.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque en el backend real los problemas de capacidad rara vez se descubren de forma ordenada en producción.
Suelen aparecer como:

- “a veces se pone lento”
- “el release parecía bien pero bajo tráfico sufrió”
- “la API responde, pero después todo se atrasa”
- “los enterprise grandes arrastran a todos”
- “los jobs nocturnos empeoran la mañana”
- “la cola no explota, pero nunca termina de vaciarse”
- “el proveedor no aguanta cuando nosotros sí”

Y una prueba de carga bien pensada puede adelantarte muchísimo de esa historia antes del incidente real.

## Relación con Spring Boot

Spring Boot puede ser una base muy buena para ejecutar y observar este tipo de experimentos, pero el framework no decide por vos:

- qué carga es realista
- qué percentiles importan
- qué throughput es suficiente
- qué tenant o feature merece segmentación
- qué saturación es aceptable
- qué cuello te conviene atacar primero
- qué degradación todavía es digna y cuál ya no

Eso sigue siendo criterio de plataforma, observabilidad y operación.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> una prueba de carga útil no consiste solo en tirarle requests al backend para ver si se cae, sino en diseñar experimentos que te enseñen cómo se comporta el sistema bajo presión realista, qué percentiles se degradan, qué recurso se satura primero, qué throughput es sostenible y cómo se reparte el costo y la degradación entre endpoints, jobs, colas, integraciones y tenants.

## Resumen

- Las pruebas de carga valen más por lo que enseñan que por la cantidad bruta de requests que lanzan.
- Conviene distinguir carga normal, estrés y capacidad sostenida.
- Percentiles, saturación, backlog y throughput sostenible suelen importar más que el promedio.
- Una prueba útil debería parecerse al comportamiento real del producto y no solo empujar volumen artificial.
- Colas, jobs, integraciones y multi-tenancy también deben entrar en la lectura de capacidad del sistema.
- Este tema convierte la performance en experimentación deliberada y no solo en intuición o reacción.
- A partir de acá la conversación queda lista para entrar en optimización más concreta de base, caché, consultas y diseño de hot paths con bastante más contexto.

## Próximo tema

En el próximo tema vas a ver cómo pensar acceso a base de datos, queries, índices y patrones de lectura/escritura con una mirada más madura, porque después de entender mejor capacidad y carga, una de las fuentes más frecuentes de cuellos de botella sigue estando en cómo el backend habla con su persistencia.
