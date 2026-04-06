---
title: "Cómo pensar métricas de performance, percentiles, capacidad y señales operativas que realmente vale la pena mirar"
description: "Entender por qué un backend Spring Boot serio no puede mirar rendimiento solo con promedios generales, y cómo pensar mejor percentiles, capacidad, saturación y señales operativas para diagnosticar y mejorar performance con más criterio."
order: 119
module: "Seguridad, performance y operación avanzada"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- rendimiento y performance desde una mirada más sistémica
- latencia
- throughput
- costo por operación
- hot paths
- cuellos de botella reales
- presión desigual de tenants o procesos
- diferencia entre síntoma visible y causa sistémica

Eso ya te dejó una idea muy importante:

> en un backend serio, la performance real no suele explicarse bien mirando solo una query o una función aislada; conviene entender cómo se distribuyen tiempo, carga y costo en el flujo completo del sistema.

Ahora aparece una pregunta completamente natural:

> si quiero entender performance de verdad, ¿qué conviene medir y qué señales vale la pena mirar?

Porque mucha gente arranca mirando cosas como:

- tiempo promedio del endpoint
- CPU promedio
- memoria usada
- algún gráfico general de requests
- quizás un par de logs con timestamps

Y eso puede servir un poco.
Pero en sistemas reales, rápidamente aparecen problemas como:

- el promedio se ve bien, pero los usuarios igual sienten lentitud
- una cola parece sana, pero el backlog real se está acumulando
- el throughput global parece aceptable, pero algunos tenants sufren bastante
- la CPU promedio no parece terrible, pero ciertos picos saturan el sistema
- el endpoint “en general” responde bien, pero el percentil alto es muy malo
- la plataforma no se cae, pero opera demasiado cerca del límite

Ahí aparecen ideas muy importantes como:

- **métricas de performance**
- **percentiles**
- **latencia de cola larga**
- **capacidad**
- **saturación**
- **backlog**
- **error rate**
- **señales operativas útiles**
- **distribución en vez de promedio**
- **lectura de salud real del sistema**

Este tema es clave porque no alcanza con querer mejorar performance:
también necesitás poder mirar el sistema de una forma que no te mienta.

## El problema de apoyarse demasiado en promedios

Este es uno de los errores más comunes.

Supongamos que un endpoint tiene esta realidad:

- muchas requests rápidas
- unas pocas requests muy lentas

El promedio podría verse razonable y aun así esconder una experiencia muy mala para una porción importante de usuarios.

Por ejemplo:

- promedio 180 ms
- pero p95 en 900 ms
- y p99 en 2.5 s

Si mirás solo el promedio, podrías decir:

- “está bastante bien”

Pero la experiencia real del sistema es mucho más áspera que eso.

Entonces aparece una verdad muy importante:

> en performance, el promedio puede ocultar justo lo que más te duele.

## Qué significa percentil

Dicho simple:

> un percentil te ayuda a entender cómo se distribuyen los tiempos o valores, en lugar de mirar solo un promedio global.

Por ejemplo:

### p50
El 50% de los casos está en ese valor o por debajo.
Es una especie de “caso medio” más realista que el promedio en muchos contextos.

### p95
El 95% de los casos está en ese valor o por debajo.
Te muestra cómo vienen los casos lentos, sin irte al extremo absoluto.

### p99
El 99% de los casos está en ese valor o por debajo.
Te ayuda a ver la cola más problemática del comportamiento.

No hace falta obsesionarse con todos los percentiles posibles.
Lo importante es esta intuición:

> los percentiles te muestran distribución; el promedio, muchas veces, solo la aplasta.

## Una intuición muy útil

Podés pensar así:

- promedio: “en general, más o menos cuánto da”
- percentil: “qué tan mal se pone esto para la parte lenta del sistema”

Esta diferencia es enorme.

## Por qué p95 y p99 suelen importar tanto

Porque en sistemas reales no te alcanza con saber que “la mayoría anda”.
También importa:

- qué pasa con los casos lentos
- cuánto sufren ciertas requests
- cuánto tarda el sistema cuando entra carga rara
- qué tan mala se vuelve la experiencia cuando algo no sale perfecto
- cuánto se ensancha la cola de latencia cuando aparece presión

Ahí p95 y p99 suelen ser señales muchísimo más útiles que el promedio.

## Un ejemplo muy claro

Imaginá una API con estos tiempos:

- p50: 80 ms
- promedio: 140 ms
- p95: 600 ms
- p99: 1800 ms

Eso te cuenta algo mucho más rico que solo decir:
- “promedio 140 ms”

Te muestra que:

- la mayoría de las requests van bastante bien
- pero existe una cola de requests bastante lenta
- y una parte más extrema es realmente problemática

Eso cambia mucho el diagnóstico.

## Qué relación tiene esto con UX y producto

Muy fuerte.

Porque la gente no “usa el promedio”.
La experiencia de usuario se forma con:

- el caso frecuente
- el caso lento
- el caso raro pero doloroso
- la consistencia o inconsistencia del sistema

Un backend puede tener promedio decente y aun así sentirse poco confiable si:

- a veces responde rápido
- a veces tarda mucho
- y el usuario nunca sabe qué esperar

Entonces mirar percentiles también es una forma de mirar experiencia, no solo operación.

## Qué significa capacidad

Podés pensarlo así:

> capacidad es cuánto trabajo útil puede sostener el sistema bajo ciertas condiciones antes de degradarse más allá de lo aceptable.

La palabra importante es **sostener**.

No se trata solo de:

- cuánto aguantó en un pico raro
- o cuánto hizo una vez

Se trata más bien de:

- cuántas requests por segundo
- cuántos mensajes por minuto
- cuántos jobs por hora
- cuántos tenants activos
- cuántos exports concurrentes
- cuánto backlog tolerable

puede soportar el sistema manteniendo una latencia, error rate y costo razonables.

## Qué relación tiene esto con saturación

Muy fuerte.

La saturación es, intuitivamente, el grado en que un recurso o capacidad está llegando a su límite útil.

Puede pasar en:

- CPU
- memoria
- conexiones a base
- pool de threads
- workers
- cola
- red
- locks
- integraciones externas
- storage
- capacidad de procesamiento batch

Y es importantísima porque muchas veces el sistema no “explota” de golpe.
Más bien empieza a degradarse cuando ciertos recursos se acercan demasiado al borde.

Entonces no alcanza con mirar solo:
- “está caído o no”

También importa:
- “qué tan cerca está del punto donde se va a poner feo”.

## Una intuición muy útil

Podés pensar así:

> capacidad te dice cuánto puede sostener el sistema; saturación te dice qué tan cerca está de no poder sostenerlo bien.

Esta diferencia ordena muchísimo.

## Qué tipo de métricas de performance suele valer la pena mirar

Por ejemplo:

- latencia por endpoint
- percentiles de latencia
- throughput por operación
- error rate
- saturación de recursos
- backlog de colas
- tiempo de consumo de mensajes
- duración de jobs
- tiempo en dependencias externas
- uso de base o pools
- cantidad de retries
- hit/miss de caché
- uso por tenant
- operaciones caras por plan o feature

No hace falta mirar todo al mismo tiempo.
Pero sí conviene empezar a ver que performance real vive en varias capas, no en una sola.

## Qué relación tiene esto con error rate

Muy fuerte.

A veces performance mala no aparece solo como lentitud.
También aparece como:

- timeouts
- 5xx
- retries
- operaciones canceladas
- cola que deja de drenar
- jobs que ya no terminan
- workers que fallan bajo carga

Entonces la performance no debería separarse artificialmente de confiabilidad.
Muchas veces un sistema degradado mezcla ambas cosas.

## Un ejemplo claro

Podrías tener algo así:

- p95 empeora
- luego suben timeouts
- luego suben retries
- luego sube backlog
- luego cae throughput efectivo

Si solo mirás el error final, llegás tarde.
Si mirás la degradación completa, entendés mejor la historia.

## Qué relación tiene esto con colas y mensajería

Absolutamente fuerte.

En sistemas con mensajería no alcanza con mirar:

- requests por segundo

También conviene ver:

- mensajes entrantes por unidad de tiempo
- mensajes procesados por unidad de tiempo
- demora de procesamiento
- backlog
- reintentos
- mensajes en dead letter
- percentiles de tiempo total hasta consumo
- qué tenants producen más carga

Porque una cola puede ser el lugar donde el sistema “absorbe” problemas durante un rato antes de mostrar síntomas más obvios.
Y si no la mirás, podés llegar tarde.

## Qué relación tiene esto con jobs y batch

Muy fuerte también.

Muchos jobs parecen sanos hasta que mirás cosas como:

- duración por ejecución
- variabilidad entre corridas
- cantidad de ítems procesados
- fallos parciales
- ítems pendientes
- competencia con carga online
- ventanas horarias de mayor costo
- tenants que explican la mayor parte del trabajo

Acá también los promedios engañan mucho.
Por ejemplo:

- duración promedio del job aceptable
- pero con algunos runs enormes
- o ciertos tenants disparando tiempos extremos

Entonces los jobs también merecen percentiles, distribuciones y lectura más rica.

## Qué relación tiene esto con multi-tenancy

Absolutamente total.

Ya viste que algunos tenants consumen o tensionan más que otros.
Bueno, eso hace todavía más valioso medir cosas como:

- latencia por tenant
- throughput por tenant
- error rate por tenant
- consumo de jobs por tenant
- storage por tenant
- costo de ciertas features por tenant
- noisy neighbors
- fairness entre organizaciones

Porque un promedio global puede esconder que:

- 95 tenants están bárbaros
- y 3 están sufriendo mucho
- o que 2 tenants explican la mayor parte del costo de una capacidad

Sin esta segmentación, la lectura del sistema queda bastante ciega.

## Qué relación tiene esto con capacidad real del negocio

Muy fuerte.

A veces la pregunta útil no es solo:
- “¿cuánto aguanta el backend?”

Sino también:
- “¿cuántos tenants enterprise puede sostener esta arquitectura?”
- “¿cuántos exports simultáneos aceptamos?”
- “¿qué pasa si duplicamos onboarding?”
- “¿cuántas órdenes por minuto aguanta checkout sin degradar pagos?”
- “¿qué plan premium podemos vender sin rediseñar esta parte?”

Es decir:
las métricas correctas también te ayudan a hablar de producto con mucha más honestidad.

## Qué problema aparece si medís demasiadas cosas sin criterio

Otro clásico.

Podés terminar con:

- cientos de gráficas
- números que nadie entiende
- dashboards enormes
- señales sin prioridad
- métricas sin ownership
- ruido por todos lados

Entonces no se trata de medir todo.
Se trata de medir lo que realmente ayuda a responder preguntas como:

- ¿está bien?
- ¿qué parte se está degradando?
- ¿qué tan cerca estamos del límite?
- ¿quién o qué está empujando el problema?
- ¿esto es síntoma local o sistémico?

## Una intuición muy útil

Podés pensar así:

> una buena métrica no es solo algo medible; es algo que ayuda a tomar una decisión o a diagnosticar mejor.

Esta frase ayuda muchísimo.

## Qué relación tiene esto con SLOs o expectativas operativas

Sin entrar ahora en toda una teoría formal, conviene captar esta idea:

> las métricas empiezan a ser realmente valiosas cuando sabés qué nivel de comportamiento querés sostener.

Por ejemplo:

- p95 de checkout
- tiempo máximo razonable de procesamiento de webhook
- backlog tolerable
- tiempo máximo de onboarding
- tiempo objetivo de export
- error rate aceptable
- demora máxima de un job crítico

Eso convierte la métrica en una señal útil y no solo en un número lindo en un dashboard.

## Qué relación tiene esto con cambios y releases

Muy fuerte.

Las métricas de performance también sirven para responder:

- ¿esta release empeoró algo?
- ¿qué percentil cambió?
- ¿qué endpoint o job fue afectado?
- ¿cierto tenant empezó a sufrir más?
- ¿aumentó la saturación?
- ¿el throughput efectivo bajó?
- ¿la cola se atrasa más que antes?

Entonces performance metrics no son solo para tuning.
También son una herramienta muy poderosa para operar releases con criterio.

## Qué relación tiene esto con costo

Muy fuerte también.

Hay métricas que no te dicen solo “qué tan rápido”.
También te dicen “qué tan caro”.

Por ejemplo:

- cantidad de jobs por feature
- número de llamadas a un proveedor pago
- tasa de cache miss en un endpoint caro
- cantidad de exports generados
- storage consumido por tenant
- mensajes reprocesados
- retries por integración
- CPU o duración de operaciones muy frecuentes

Eso vuelve muchísimo más tangible el costo real de ciertas decisiones del backend.

## Qué no conviene hacer

No conviene:

- mirar solo promedios
- medir solo requests HTTP y olvidar jobs, colas o terceros
- juntar mil métricas sin saber para qué sirven
- no segmentar por tenant cuando la plataforma es multi-tenant
- no distinguir entre síntoma y recurso saturado
- creer que “más dashboards” equivale a “más comprensión”
- olvidar que performance y costo suelen ir muy de la mano

Ese tipo de decisiones puede dejarte con mucha información y muy poco diagnóstico.

## Otro error común

Pensar que p95 y p99 son “demasiado avanzados” para un proyecto real.
En muchos sistemas medianos ya aportan muchísimo más que el promedio.

## Otro error común

No distinguir entre:
- una métrica que ayuda a ver experiencia
- una métrica que ayuda a ver capacidad
- una métrica que ayuda a ver costo
- una métrica que ayuda a ver fairness
- una métrica que ayuda a ver saturación

No todas responden la misma pregunta.

## Otro error común

Mirar CPU y memoria como si fueran toda la performance del sistema.
A veces el problema principal vive en:
- base
- colas
- dependencia externa
- locks
- backlogs
- timeouts
- jobs
- storage
- red
- unfair use por tenant

## Una buena heurística

Podés preguntarte:

- ¿qué percentiles importan más para esta operación?
- ¿qué métricas me muestran capacidad y cuáles me muestran saturación?
- ¿qué señales me ayudan a ver costo por operación?
- ¿qué parte del sistema está invisible si solo miro HTTP?
- ¿qué métricas globales deberían poder descomponerse por tenant o por feature?
- ¿qué gráfico me ayudaría a detectar antes una degradación real?
- ¿qué número me ayuda a decidir, no solo a decorar un dashboard?

Responder eso te ayuda muchísimo a medir performance con más inteligencia.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque en el backend real, los problemas de rendimiento rara vez se presentan ordenadamente.
Suelen aparecer como:

- sensación de lentitud
- incidentes intermitentes
- tenants que se quejan
- colas que crecen
- jobs que tardan más
- releases que empeoran algo
- costos que suben sin una causa obvia
- usuarios que “a veces” sufren bastante

Y si no tenés métricas más ricas, terminás navegando a ciegas.

## Relación con Spring Boot

Spring Boot puede ser una buena base para exponer y organizar métricas útiles, pero el framework no decide por vos:

- qué percentiles mirar
- qué backlog es tolerable
- qué endpoint merece segmentación por tenant
- qué jobs importan más
- qué costo te interesa medir
- qué nivel de saturación te empieza a preocupar
- qué señales de performance realmente ayudan al negocio y a operación

Eso sigue siendo criterio de backend, observabilidad y plataforma.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando el backend ya se mira desde una performance más sistémica, conviene dejar de depender de promedios y empezar a observar percentiles, capacidad, saturación, error rate, backlog, costo por operación y segmentación por tenant o feature, porque solo así las métricas dejan de ser decoración y se convierten en señales útiles para diagnosticar, decidir y sostener el sistema con criterio.

## Resumen

- Los promedios por sí solos suelen ocultar justo los casos lentos o caros que más duelen.
- Percentiles como p95 y p99 ayudan mucho a entender la cola de latencia real.
- Capacidad y saturación son dimensiones distintas y ambas importan muchísimo.
- HTTP no alcanza: también conviene medir colas, jobs, integraciones, caches y comportamiento por tenant.
- Las buenas métricas ayudan a diagnosticar, decidir y operar; no solo a llenar dashboards.
- Este tema baja la performance sistémica a una práctica concreta: qué mirar de verdad para no optimizar a ciegas.
- A partir de acá el bloque queda listo para entrar en pruebas de carga, capacidad y experimentación más deliberada sobre el sistema real.

## Próximo tema

En el próximo tema vas a ver cómo pensar pruebas de carga, estrés y capacidad de una forma más útil que simplemente “tirarle requests”, porque una vez que ya sabés qué señales importan, el paso siguiente es diseñar experimentos que te digan cómo se comporta el sistema cuando lo empujás de verdad.
