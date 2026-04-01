---
title: "Cómo pensar colas, throughput asíncrono y backlog desde una mirada más cuantitativa y operativa"
description: "Entender por qué un backend Spring Boot serio no puede mirar mensajería y procesamiento asíncrono solo como tareas 'que se harán después', y cómo pensar mejor colas, backlog, throughput y capacidad real de drenaje del trabajo pendiente."
order: 123
module: "Seguridad, performance y operación avanzada"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- caché
- proyecciones
- materialización de lecturas
- fuente de verdad
- lecturas optimizadas
- frescura del dato
- reconstrucción
- tradeoffs entre latencia, costo y complejidad

Eso ya te dejó una idea muy importante:

> cuando ciertas lecturas del backend se vuelven demasiado frecuentes, costosas o críticas para la experiencia, a veces conviene dejar de resolverlas siempre desde cero y empezar a sostenerlas con estructuras de lectura más deliberadas.

Ahora aparece otro punto muy natural si seguís mirando el backend como un sistema vivo y no solo como request-response:

> ¿qué pasa con todo el trabajo que no se resuelve en el momento, sino que se empuja a colas, consumers, jobs y flujos asíncronos?

Porque al principio es muy fácil mirar lo asíncrono así:

- entra un evento
- se publica un mensaje
- algún consumer lo hará
- listo

Pero, a medida que el sistema crece, aparecen preguntas mucho más serias:

- ¿a qué ritmo entra trabajo?
- ¿a qué ritmo lo drenás?
- ¿cuánto backlog es normal y cuánto ya es preocupante?
- ¿qué pasa si producís más rápido de lo que consumís?
- ¿la cola absorbe picos sanamente o está escondiendo una degradación?
- ¿cuánto tarda realmente una operación en completarse de punta a punta?
- ¿qué tenant está llenando la cola?
- ¿qué pasa si el retry empeora el atasco?
- ¿qué throughput asíncrono es sostenible?
- ¿cuánto tiempo tarda el sistema en ponerse al día si tuvo una ráfaga fuerte?

Ahí aparecen ideas muy importantes como:

- **colas**
- **backlog**
- **throughput asíncrono**
- **tasa de entrada**
- **tasa de drenaje**
- **latencia de cola**
- **retardo hasta procesamiento**
- **consumidores**
- **presión acumulada**
- **capacidad operativa de lo asíncrono**

Este tema es clave porque, en sistemas reales, muchas veces el backend “parece responder” mientras por debajo está acumulando trabajo pendiente que nadie está leyendo con suficiente seriedad.

## El problema de pensar la cola como un lugar neutro donde el trabajo simplemente espera

Cuando uno empieza a usar mensajería o jobs, es muy normal sentir algo así:

- si no lo hago ahora, lo encolo
- la cola lo resolverá después
- total queda desacoplado

Y sí, desacoplar es valioso.
Pero también es muy fácil caer en una trampa mental:

> creer que mover trabajo a una cola equivale a haber resuelto el problema.

En realidad, muchas veces solo cambiaste de lugar la presión.

Porque ahora ese trabajo:

- sigue existiendo
- sigue teniendo costo
- sigue necesitando CPU, I/O, base, red o integraciones
- sigue compitiendo por recursos
- y ahora además puede acumularse, atrasarse o estallar más tarde

Entonces aparece una verdad muy importante:

> una cola no elimina trabajo; solo desacopla el momento y la forma en que ese trabajo se procesa.

Esa diferencia vale muchísimo.

## Qué significa throughput asíncrono

Dicho simple:

> throughput asíncrono es cuánto trabajo útil puede procesar el sistema por unidad de tiempo en sus flujos fuera del request-response.

Por ejemplo:

- mensajes por minuto
- jobs por hora
- webhooks procesados por segundo
- eventos consumidos por unidad de tiempo
- exportaciones completadas por ventana
- documentos generados por minuto

La idea importante es que, aunque el flujo sea asíncrono, sigue habiendo una pregunta de capacidad muy real:

> ¿cuánto puede drenar el sistema sin quedarse atrás?

## Qué significa backlog

Podés pensarlo así:

> backlog es la cantidad de trabajo pendiente que todavía no fue procesado.

Puede ser:

- mensajes en cola
- jobs pendientes
- retries acumulados
- ítems de batch sin procesar
- eventos esperando consumer
- tareas diferidas esperando ventana operativa

El backlog no es automáticamente malo.
A veces es normal que exista un poco.
El problema aparece cuando:

- crece demasiado
- deja de bajar
- se vuelve estructural
- o empieza a afectar la experiencia real del producto

## Una intuición muy útil

Podés pensar así:

- la cola te dice que existe trabajo pendiente
- el backlog te dice cuánto se está acumulando
- el throughput te dice a qué velocidad lo estás resolviendo

Estas tres ideas juntas ordenan muchísimo.

## Qué diferencia hay entre tasa de entrada y tasa de drenaje

Esta es una de las ideas más importantes del tema.

### Tasa de entrada
Cuánto trabajo nuevo entra a la cola o al sistema asíncrono.

Por ejemplo:
- mensajes por segundo publicados
- jobs creados por minuto
- eventos nuevos por hora

### Tasa de drenaje
Cuánto trabajo logra procesar el sistema por unidad de tiempo.

Por ejemplo:
- mensajes consumidos por segundo
- jobs completados por minuto
- tareas resueltas por hora

La comparación entre ambas es central.

Porque si:

- entra más de lo que drenás

entonces el backlog crece.

Y si eso se sostiene demasiado tiempo, el problema ya no es teórico.
Se vuelve una degradación real del sistema.

## Un ejemplo muy claro

Supongamos que producís:

- 1000 mensajes por minuto

Pero tus consumers procesan:

- 800 por minuto

Al principio quizás no “se note” demasiado.
La cola absorbe.

Pero cada minuto acumulás 200 mensajes más.
En una hora, ya tenés 12.000 pendientes.
Y el sistema empieza a arrastrar retraso real.

Esto muestra algo muy importante:

> un sistema asíncrono puede parecer sano por un rato mientras en realidad ya está entrando en deuda de procesamiento.

## Por qué esto importa tanto

Porque muchísimos sistemas no se rompen de golpe.
Más bien hacen algo como:

- responden más o menos bien
- pero empiezan a acumular trabajo
- el backlog sube
- el tiempo hasta resolución final empeora
- aparecen retries
- la cola se ensucia
- ciertos tenants sufren mucho más
- las reconciliaciones llegan tarde
- los estados finales tardan demasiado
- y recién después el problema se vuelve visible para todos

Entonces no alcanza con mirar solo el request inicial.
También conviene mirar cuánto tarda el sistema en completar la historia completa.

## Qué relación tiene esto con latencia asíncrona

Muy fuerte.

En request-response, la latencia suele ser:
- cuánto tarda la respuesta

En flujos asíncronos, conviene pensar también:

- cuánto tarda desde que se produjo el evento
- hasta que realmente quedó procesado

Eso puede incluir:

- espera en cola
- tiempo hasta que lo tome un consumer
- retries
- trabajo posterior
- consistencia eventual
- actualización de proyecciones
- notificaciones derivadas

Entonces una pregunta muy útil pasa a ser:

> ¿cuánto tarda realmente este flujo en completarse, no solo en salir del request inicial?

Esa es una métrica muy madura.

## Qué relación tiene esto con experiencia de usuario

Muchísima.

Porque a veces el usuario ve algo como:

- “tu pedido fue recibido”
- “tu pago está en proceso”
- “tu documento se está generando”
- “tu export fue solicitada”

Y técnicamente eso puede ser cierto.

Pero si después:

- el procesamiento tarda demasiado
- el backlog está alto
- las colas no drenan bien
- el job posterior llega tarde
- la proyección tarda demasiado en actualizarse

entonces la experiencia real del usuario puede ser mala aunque el request inicial haya respondido rápido.

Esto muestra otra verdad muy importante:

> una buena UX asíncrona depende tanto del tiempo de respuesta inicial como del tiempo total de finalización del trabajo.

## Qué relación tiene esto con retries

Absolutamente total.

Los retries pueden ser sanísimos cuando ayudan a recuperarse de fallos transitorios.
Pero también pueden empeorar muchísimo un atasco si:

- aumentan la tasa de entrada efectiva
- reinyectan mensajes demasiado rápido
- compiten con trabajo nuevo
- repiten operaciones costosas
- generan más backlog del que ayudan a resolver

Entonces, en sistemas asíncronos, conviene mirar no solo:
- cuántos mensajes fallan

sino también:
- cuánto reintento está agregando presión al sistema.

A veces el retry deja de ser salvación y se vuelve multiplicador del problema.

## Una intuición muy útil

Podés pensar así:

> un retry también es carga.

Esta frase parece simple, pero vale oro.
Porque muchas veces se olvida que el trabajo reintentado sigue compitiendo por los mismos recursos que el trabajo nuevo.

## Qué relación tiene esto con colas que “amortiguan” picos

Muy fuerte.

Las colas son muy valiosas justamente porque pueden absorber ráfagas o bursts:

- un pico fuerte de tráfico
- muchos eventos juntos
- una tanda de imports
- un burst de webhooks
- una campaña que dispara notificaciones

Eso está buenísimo.

El problema aparece cuando confundís:

- “la cola absorbió el pico”

con

- “el sistema lo resolvió bien”

A veces la cola solo escondió temporalmente el problema.
Por eso conviene mirar:

- cuánto creció el backlog
- cuánto tardó en volver a valores normales
- si el tiempo total de procesamiento siguió siendo aceptable
- si el sistema recuperó equilibrio o quedó arrastrando retraso

## Qué relación tiene esto con throughput sostenible

Muy fuerte.

No alcanza con saber:
- “una vez procesamos muchísimo”

Conviene más saber:

> ¿qué volumen sostenido podemos procesar sin que el backlog crezca indefinidamente ni se dispare la latencia total del flujo?

Esto es muchísimo más útil operativamente.

Porque separa:

- throughput pico
- de throughput sostenible

Y esa diferencia es crítica cuando planificás:
- crecimiento
- capacidad
- releases
- onboarding de tenants grandes
- campañas
- jobs masivos
- migraciones

## Qué relación tiene esto con jobs y batch

Absolutamente fuerte.

Lo asíncrono no vive solo en colas de mensajes.
También vive en:

- jobs programados
- backfills
- reconciliaciones
- reprocesos
- batches
- exportaciones
- regeneración de proyecciones

En todos esos casos aparecen las mismas preguntas:

- cuánto trabajo entra
- cuánto drena
- cuánto se acumula
- cuánto tarda
- qué pasa si corre junto con carga online
- qué tenants explican más volumen
- si el sistema se pone al día o se atrasa cada vez más

Entonces backlog y throughput son ideas más amplias que “mensajes en broker”.

## Qué relación tiene esto con multi-tenancy

Muy fuerte.

Ya viste antes que algunos tenants se convierten en noisy neighbors.
Bueno, en lo asíncrono eso puede verse clarísimo.

Por ejemplo:

- un tenant genera muchísimos eventos
- otro pide exportaciones enormes
- otro dispara integraciones frecuentes
- uno domina la cola compartida
- uno concentra la mayoría de retries
- uno genera jobs más costosos

Entonces conviene poder mirar cosas como:

- backlog por tenant
- throughput consumido por tenant
- tasa de producción por tenant
- tiempo de procesamiento por tenant
- fairness entre organizaciones
- si los tenants chicos quedan enterrados por unos pocos grandes

Esto vuelve la operación muchísimo más madura.

## Qué relación tiene esto con costo

Muy fuerte también.

Una cola con backlog alto no solo es una señal de latencia futura.
También puede ser una señal de costo creciente por:

- workers de más
- más retries
- más storage temporal
- más tiempo de jobs
- más presión en base y terceros
- más horas de compute
- más complejidad operativa

Entonces mirar backlog y throughput también es mirar sostenibilidad económica, no solo performance.

## Qué relación tiene esto con observabilidad

Absolutamente central.

Conviene poder ver cosas como:

- tasa de entrada
- tasa de drenaje
- backlog actual
- tiempo de espera en cola
- tiempo total hasta procesamiento completo
- retries
- dead letters
- consumers lentos
- throughput por cola
- throughput por tenant
- percentiles de procesamiento
- crecimiento o decrecimiento del backlog en el tiempo

Sin eso, podés tener un sistema asíncrono que:
- responde bonito al comienzo
- y se pudre silenciosamente por debajo

## Un ejemplo claro

Podrías ver algo así:

- el request inicial sigue en 150 ms
- pero el tiempo hasta notificación final subió de 20 s a 8 min
- la cola creció
- el retry rate subió
- dos tenants grandes están produciendo 70% del volumen

Eso cuenta una historia muchísimo más útil que:
- “la API pública anda”

## Qué relación tiene esto con capacity planning

Muy fuerte.

Si querés planificar crecimiento o lanzamientos, necesitás responder preguntas como:

- ¿cuánta tasa de entrada nueva podemos absorber?
- ¿qué pasa si duplicamos ciertos eventos?
- ¿cuántos workers más harían falta?
- ¿el cuello está en consumers, base, tercero o jobs posteriores?
- ¿qué tenant enterprise nuevo entra sin romper fairness?
- ¿cuánto tiempo tardamos en vaciar backlog después de un burst fuerte?

Sin esta mirada, la planificación de capacidad se vuelve mucho más ciega.

## Qué relación tiene esto con diseño del sistema

También muy fuerte.

A veces, cuando el backlog duele, no se arregla solo agregando consumers.
Puede que el problema real sea:

- trabajo demasiado pesado por mensaje
- payload mal diseñado
- demasiada granularidad
- retries agresivos
- falta de batch inteligente
- demasiada dependencia externa
- mala separación entre colas
- tenant ruidoso sin límites
- jobs compitiendo con tráfico online

Entonces medir throughput y backlog también te ayuda a rediseñar la arquitectura, no solo a escalarla linealmente.

## Qué no conviene hacer

No conviene:

- pensar que “encolar” equivale a “resolver”
- mirar solo si la API responde rápido y olvidar el tiempo total del flujo
- no comparar tasa de entrada vs tasa de drenaje
- ignorar backlog porque “la cola aguanta”
- dejar retries sin mirar qué presión agregan
- no segmentar por tenant en plataformas compartidas
- confundir throughput pico con throughput sostenible

Ese tipo de decisiones suele ocultar degradaciones hasta que ya son bastante incómodas.

## Otro error común

Pensar que el backlog siempre es malo.
A veces un poco de backlog es normal y útil.
La clave está en:
- cuánto
- cuánto tiempo
- si crece
- si drena
- y si el producto tolera ese delay

## Otro error común

No distinguir entre:
- trabajo pendiente sano
- atraso creciente
- cola estable
- cola que vive en deuda
- burst bien absorbido
- saturación estructural

No todo backlog significa lo mismo.

## Otro error común

No medir el tiempo total desde producción hasta consumo efectivo.
Eso hace que el sistema asíncrono parezca mucho más sano de lo que en realidad se siente para el usuario o para el dominio.

## Una buena heurística

Podés preguntarte:

- ¿qué tasa de entrada tiene este flujo asíncrono?
- ¿qué tasa de drenaje real sostenemos?
- ¿qué backlog es normal y cuál ya es una señal de deuda?
- ¿cuánto tarda el trabajo en completarse de punta a punta?
- ¿qué parte del tiempo está en cola y qué parte en procesamiento?
- ¿qué pasa si el retry rate sube?
- ¿qué tenants producen o consumen de forma desigual?
- ¿este problema se arregla con más workers o con otro diseño del trabajo?

Responder eso te ayuda muchísimo a mirar lo asíncrono con bastante más criterio.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque en el backend real los síntomas suelen sonar así:

- “la API contesta, pero las notificaciones llegan tardísimo”
- “los exports arrancan bien, pero terminan demasiado tarde”
- “los jobs se acumulan de madrugada y arrastran el resto del día”
- “el backlog sube con cada campaña y nunca vuelve a cero”
- “dos tenants enterprise están llenando la cola”
- “los retries nos comen vivos”
- “en teoría desacoplamos, pero en la práctica estamos pateando deuda para después”

Y para entender eso bien, necesitás una mirada mucho más cuantitativa de lo asíncrono.

## Relación con Spring Boot

Spring Boot puede ser una buena base para trabajar con flujos asíncronos, pero el framework no decide por vos:

- qué backlog es aceptable
- qué throughput es sostenible
- cómo medir tiempo total de procesamiento
- qué retry ya es contraproducente
- qué tenant está dominando una cola
- si el problema se arregla con más consumers o con rediseño
- cuánto delay tolera realmente el producto

Eso sigue siendo criterio de plataforma, operación y arquitectura.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> en un backend serio, las colas y los flujos asíncronos no deberían mirarse solo como “trabajo que se hará después”, sino como sistemas con tasa de entrada, tasa de drenaje, backlog, latencia total y costo operativo propios, donde conviene medir cuánto entra, cuánto sale, cuánto se acumula y cuánto tarda en resolverse realmente para no confundir desacople temporal con salud real del sistema.

## Resumen

- Encolar trabajo no equivale automáticamente a haberlo resuelto.
- Backlog, throughput y latencia total de procesamiento son señales centrales de la salud asíncrona.
- La comparación entre tasa de entrada y tasa de drenaje es una de las claves más importantes del tema.
- Retries, bursts, jobs y tenants desiguales pueden empeorar mucho la presión sobre colas compartidas.
- Conviene mirar no solo el request inicial, sino el tiempo real hasta que el trabajo queda efectivamente completado.
- Este tema lleva la lectura del backend asíncrono a una capa mucho más operativa y cuantitativa.
- A partir de acá la conversación queda lista para seguir entrando todavía más fino en degradación, JVM, pools, memoria y decisiones de capacidad avanzada.

## Próximo tema

En el próximo tema vas a ver cómo pensar threads, pools, concurrencia práctica y límites de ejecución dentro del backend, porque después de entender mejor cómo se acumula y drena el trabajo, la siguiente pregunta natural es cuántas cosas puede intentar hacer el sistema al mismo tiempo antes de empezar a estorbarse a sí mismo.
