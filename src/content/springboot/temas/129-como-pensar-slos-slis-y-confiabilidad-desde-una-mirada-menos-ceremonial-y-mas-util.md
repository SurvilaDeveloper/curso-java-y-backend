---
title: "Cómo pensar SLOs, SLIs y confiabilidad desde una mirada menos ceremonial y más útil"
description: "Entender por qué un backend Spring Boot serio no debería hablar de confiabilidad solo en términos vagos de 'que ande bien', y cómo pensar SLOs, SLIs y nivel de servicio de una forma útil para operar, priorizar y mejorar un sistema real."
order: 129
module: "Seguridad, performance y operación avanzada"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- postmortems
- aprendizaje operativo
- mejora continua
- causa inmediata
- fragilidad sistémica
- acciones concretas
- follow-up real
- y por qué un incidente valioso no debería convertirse ni en caza de culpables ni en documento muerto

Eso ya te dejó una idea muy importante:

> un backend serio no se vuelve menos frágil solo por sobrevivir incidentes, sino por convertirlos en aprendizaje útil, visibilidad mejor y cambios concretos que reduzcan de verdad el riesgo o el impacto de futuras degradaciones.

Y cuando empezás a cerrar ese ciclo de aprendizaje operativo, aparece una pregunta muy importante:

> ¿qué nivel de servicio querés sostener realmente y cómo sabés, con datos útiles, cuándo te estás alejando de él?

Porque al principio es muy común hablar de confiabilidad así:

- “la API anda bastante bien”
- “la app casi nunca se cae”
- “a veces está lenta”
- “el sistema es estable”
- “tenemos monitoreo”
- “si hay incidentes, vemos”

Ese lenguaje puede servir para conversación informal.
Pero se queda corto muy rápido cuando necesitás:

- priorizar mejoras
- decidir entre velocidad y robustez
- saber si un release empeoró algo importante
- entender si cierta degradación es tolerable o no
- alinear expectativas con producto
- decidir cuánto error o latencia todavía entra dentro de lo aceptable
- ordenar incidentes repetitivos
- y, sobre todo, dejar de discutir confiabilidad como sensación y empezar a discutirla como criterio operativo real

Ahí aparecen ideas muy importantes como:

- **confiabilidad**
- **SLO**
- **SLI**
- **nivel de servicio**
- **error budget**
- **señales útiles**
- **objetivos operativos**
- **promesa realista del sistema**
- **desviación respecto de lo aceptable**
- **medir para decidir, no para decorar**

Este tema es clave porque un backend serio no puede pensar confiabilidad solo como “ojalá ande bien”.
En algún punto conviene empezar a responder con más precisión:

> qué significa “andar bien” para este sistema, para este producto y para esta experiencia.

## El problema de hablar de confiabilidad de forma demasiado vaga

Cuando el sistema todavía es chico, muchas veces alcanza con intuiciones del tipo:

- si responde, está bien
- si no se cayó, está bien
- si la mayoría del tiempo anda, está bien
- si el promedio no es horrible, está bien

Ese tipo de lenguaje empieza a volverse insuficiente cuando el backend ya tiene:

- hot paths críticos
- tenants
- jobs
- colas
- third parties
- incidentes reales
- degradaciones parciales
- usuarios que esperan cierta experiencia
- un producto que promete cosas concretas
- decisiones difíciles entre sacar features nuevas o mejorar robustez

Entonces aparece una verdad muy importante:

> si no definís de alguna forma qué nivel de servicio querés sostener, es muy fácil discutir confiabilidad como intuición, gusto o cansancio del momento.

Y eso vuelve mucho más difícil priorizar con criterio.

## Qué es un SLI

Dicho simple:

> un SLI es un indicador que intenta medir alguna dimensión importante del comportamiento real del sistema desde el punto de vista del servicio que querés sostener.

La palabra importante es **indicador**.

No es cualquier métrica.
Es una métrica o señal elegida porque representa algo importante de la experiencia o del servicio.

Por ejemplo, un SLI podría estar relacionado con:

- disponibilidad
- latencia
- porcentaje de requests exitosas
- tiempo de procesamiento de un flujo crítico
- retraso en una cola importante
- porcentaje de jobs completados a tiempo
- éxito de checkout
- tiempo hasta propagación de un cambio relevante
- consistencia observable de cierta proyección

Un SLI no es “todo lo que podés medir”.
Es una señal que te ayuda a evaluar si el servicio sigue dentro de lo aceptable.

## Qué es un SLO

Podés pensarlo así:

> un SLO es un objetivo explícito sobre un SLI, es decir, una definición concreta del nivel de servicio que querés sostener durante cierto período.

Por ejemplo, no hace falta usar números exactos acá para entender la idea, pero sería algo como:

- cierto porcentaje de requests exitosas en una ventana de tiempo
- cierto percentil de latencia en un endpoint crítico
- cierto tiempo máximo razonable para completar un flujo asíncrono
- cierto nivel de backlog tolerable
- cierto tiempo de recuperación deseado en un tipo de operación

La idea importante es esta:

> el SLI te dice qué señal mirás; el SLO te dice qué valor o rango considerás aceptable para esa señal.

## Una intuición muy útil

Podés pensar así:

- **SLI** = qué observás
- **SLO** = qué querés sostener

Esta diferencia ya ordena muchísimo.

## Por qué esto importa tanto

Porque te obliga a dejar de decir cosas como:

- “anda más o menos bien”
- “a veces va lento”
- “se cayó poco”
- “en general responde”
- “esta release no parece tan mala”

Y te empuja a preguntas mucho más útiles como:

- ¿este hot path sigue dentro del nivel que aceptamos?
- ¿el p95 de checkout ya cruzó el umbral que consideramos razonable?
- ¿esta cola está demorando más de lo permitido para el producto?
- ¿cierta clase de incidentes ya nos está comiendo demasiado presupuesto de confiabilidad?
- ¿la plataforma está gastando demasiado margen operativo en esta zona?
- ¿hace falta priorizar estabilización en vez de seguir agregando features?

Es decir:
te da una forma de discutir confiabilidad con más criterio y menos niebla.

## Qué diferencia hay entre una métrica cualquiera y un SLI útil

Muy importante.

Podés medir muchísimas cosas:

- CPU
- memoria
- requests
- logs
- tamaño del heap
- cantidad de mensajes
- tamaño de payload
- reintentos
- conexiones

Todo eso puede ser útil.
Pero no todo eso es automáticamente un SLI bueno.

Un SLI útil suele tener estas características:

- representa algo importante del servicio
- ayuda a decidir
- se relaciona con experiencia o confiabilidad real
- puede seguirse en el tiempo
- tiene sentido como señal de salud o degradación

Por ejemplo, “CPU promedio” puede ser útil operativamente, pero no siempre es un buen SLI de servicio.
En cambio, “latencia p95 del flujo crítico X” o “porcentaje de requests exitosas del endpoint Y” suelen estar mucho más cerca del nivel de servicio real.

## Qué relación tiene esto con percentiles

Muy fuerte.

Ya viste en temas anteriores que el promedio puede ocultar muchísimo.
Bueno, acá vuelve a pasar lo mismo.

Si querés pensar confiabilidad de una experiencia real, muy seguido tiene más sentido mirar:

- p95
- p99
- distribución
- cola lenta

que quedarte solo con promedios.

Porque desde el punto de vista del usuario o del negocio, muchas veces no importa tanto:
- “el promedio estuvo lindo”

si una parte relevante del tráfico está sufriendo una experiencia muy mala.

Entonces los SLOs serios suelen apoyarse mucho en percentiles, no solo en medias.

## Un ejemplo muy claro

Supongamos una operación crítica como checkout.

Podrías medir:
- promedio de latencia

Pero quizá lo más útil como SLI sea:
- latencia p95
- o porcentaje de checkouts completados correctamente dentro de cierto tiempo

Eso ya se acerca muchísimo más a la pregunta real:
- “¿el producto está sosteniendo una experiencia aceptable donde más importa?”

## Qué relación tiene esto con error rate

Absolutamente total.

La confiabilidad no es solo velocidad.
También es:
- cuántas veces falla
- cuántas veces timeout
- cuántas operaciones quedan incompletas
- cuántos jobs críticos no terminan
- cuántos mensajes quedan demasiado atrasados
- cuántos tenants ven errores relevantes

Entonces un SLO puede apoyarse en cosas como:
- porcentaje de éxito
- disponibilidad observable
- tasa de errores en ciertos flujos
- éxito de procesamiento asíncrono dentro de una ventana razonable

Otra vez:
la clave está en elegir señales que de verdad representen el servicio.

## Qué relación tiene esto con colas y trabajo asíncrono

Muy fuerte.

Si el backend tiene mucho trabajo asíncrono, no alcanza con SLOs pensados solo para HTTP.
También puede importar mucho medir cosas como:

- tiempo total desde evento hasta procesamiento efectivo
- backlog máximo tolerable
- demora de una cola crítica
- porcentaje de jobs completados antes de cierto tiempo
- tiempo de materialización de una proyección
- retraso visible en una integración importante

Esto es clave porque un sistema puede “responder” requests rápido y aun así estar fallando su promesa real si lo asíncrono queda demasiado atrasado.

Entonces la confiabilidad de backend serio no vive solo en request-response.

## Qué relación tiene esto con multi-tenancy

Muy fuerte también.

En plataformas multi-tenant, una pregunta central puede ser:

- ¿este SLI lo miramos globalmente o también por tenant?

Porque una métrica global puede verse aceptable y aun así esconder que:

- algunos tenants grandes degradan a otros
- un segmento premium está sufriendo más
- cierta organización concentra gran parte de los errores
- la fairness real del sistema es peor de lo que su promedio parece

Entonces, a veces, pensar SLOs maduros también exige decidir:
- qué nivel de segmentación importa
- por tenant
- por plan
- por feature
- por flujo

## Qué relación tiene esto con experiencia de producto

Absolutamente total.

Un SLO útil no debería ser puramente “infra”.
Debería estar conectado con algo que el producto realmente quiere preservar.

Por ejemplo:

- que login siga siendo confiable
- que checkout no se vuelva errático
- que el catálogo cargue con cierta fluidez
- que una exportación premium complete dentro de un plazo razonable
- que una proyección importante no quede demasiado vieja
- que onboarding de tenants no tarde mucho más de lo esperable

Esto vuelve a mostrar algo central:

> confiabilidad no es solo uptime; es sostener experiencias y promesas concretas del producto.

## Una intuición muy útil

Podés pensar así:

- una métrica operativa puede decirte “algo está raro”
- un buen SLI te dice “el servicio importante para el producto se está degradando”

Esta diferencia es enorme.

## Qué relación tiene esto con priorización de trabajo

Muy fuerte.

Una vez que tenés ciertos SLOs claros, las conversaciones cambian muchísimo.

Porque ya no es solo:
- “me parece que estaría bueno optimizar esto”

Ahora puede ser:
- “este flujo está quemando demasiado margen de confiabilidad”
- “esta release nos acercó demasiado al borde”
- “este hot path ya no cumple el objetivo que dijimos sostener”
- “este backlog asíncrono ya pasó el umbral aceptable”
- “este tipo de incidente se come demasiado presupuesto operativo”

Eso ayuda muchísimo a decidir:
- qué mejorar primero
- qué posponer
- qué re-arquitectura vale la pena
- qué feature nueva debería esperar

## Qué es el error budget, en sentido intuitivo

Sin entrar en ceremonia excesiva, podés pensarlo así:

> el error budget es la idea de que, si definís un nivel de servicio objetivo, también estás aceptando que existe cierto margen de incumplimiento tolerable antes de considerar que el sistema ya se está desviando demasiado.

Esto es muy valioso porque rompe una ilusión muy poco útil:
- “todo debe estar siempre perfecto”

No.
En la práctica, los sistemas reales viven con cierto margen de fallo, latencia o degradación.
La pregunta madura es:
- cuánto
- dónde
- en qué flujos
- y cuándo ese margen ya se agotó

Esta idea ayuda muchísimo a conversar confiabilidad con más realismo.

## Qué relación tiene esto con postmortems e incidentes

Total.

Un postmortem útil muchas veces termina preguntándose:

- ¿qué SLI nos avisó tarde?
- ¿qué SLO no estaba claro?
- ¿qué promesa del servicio se rompió de verdad?
- ¿qué tan lejos estuvimos de lo aceptable?
- ¿quemamos demasiado margen antes de reaccionar?
- ¿cierta clase de incidente ya está repitiéndose más de lo sano?

Es decir, los SLOs no reemplazan el aprendizaje del incidente.
Lo vuelven más concreto y más accionable.

## Qué relación tiene esto con observabilidad

Absolutamente central.

No podés sostener SLOs útiles si no tenés observabilidad suficiente para:

- medir el SLI correctamente
- segmentarlo si hace falta
- seguirlo en el tiempo
- detectar desviaciones
- correlacionarlo con releases, tenants, colas, jobs o terceros
- entender cuándo el sistema mejora o empeora

Entonces SLO y observabilidad están profundamente unidos.
No como moda, sino como capacidad práctica de leer el servicio real.

## Qué relación tiene esto con equipos y cultura

Muy fuerte.

Una mirada madura de confiabilidad ayuda a que el equipo deje de discutir en términos vagos y pase a preguntas más sanas como:

- ¿qué servicio nos importa sostener de verdad?
- ¿qué degradación ya no es aceptable?
- ¿qué parte del producto merece protección más fuerte?
- ¿qué estamos dispuestos a tolerar temporalmente?
- ¿qué mejora aporta más confiabilidad real y no solo “mejor sensación”?

Esto ordena muchísimo tanto técnica como producto.

## Qué hace que un SLO sea malo o poco útil

Por ejemplo:

- no representa nada importante para el usuario o el producto
- es imposible de medir bien
- se apoya en una métrica engañosa
- nadie lo usa para decidir nada
- es tan aspiracional que siempre se incumple
- o tan flojo que no obliga a proteger nada valioso
- ignora completamente trabajo asíncrono o segmentos importantes
- no está conectado con hot paths reales

En esos casos, el SLO se vuelve más ceremonia que herramienta.

## Qué hace que un SLO sea más útil

Suele pasar cuando:

- mide una experiencia o capacidad realmente importante
- está bien conectado con el comportamiento observable del sistema
- ayuda a tomar decisiones
- tiene sentido para operación y producto
- puede compararse con releases, incidentes y degradaciones
- tiene ownership claro
- y se revisa con honestidad en vez de tratarlo como adorno

## Qué no conviene hacer

No conviene:

- hablar de confiabilidad solo como sensación vaga
- convertir SLOs en burocracia desconectada del producto
- elegir SLIs que nadie entiende o que no representan servicio real
- mirar solo disponibilidad global e ignorar latencia, cola o tiempo total de flujos críticos
- no segmentar cuando multi-tenancy o planes lo exigen
- fijar objetivos sin relación con la capacidad real del sistema
- medir cosas lindas sin que eso cambie ninguna decisión

Ese tipo de enfoque suele generar mucha ceremonia y poco aprendizaje.

## Otro error común

Pensar que SLOs son solo para empresas enormes.
En realidad, incluso una versión simple y pragmática de esta forma de pensar ya mejora muchísimo la claridad operativa en sistemas medianos.

## Otro error común

No distinguir entre:
- métrica técnica
- señal de servicio
- objetivo de servicio
- margen de incumplimiento
- síntoma operacional
- y promesa real del producto

Todas se parecen un poco, pero no son lo mismo.

## Otro error común

Hacer SLOs solo para request-response y olvidarte de:
- colas
- jobs
- materializaciones
- integraciones
- tiempos de finalización reales
- tenants desiguales

Eso suele dejar afuera una parte enorme de la experiencia real del sistema.

## Una buena heurística

Podés preguntarte:

- ¿qué significa “andar bien” para este flujo de producto?
- ¿qué señal observable lo representa mejor?
- ¿ese indicador refleja experiencia real o solo una comodidad técnica?
- ¿qué percentil o tasa importa más?
- ¿debería mirarlo globalmente, por tenant o por feature?
- ¿qué margen de degradación estamos dispuestos a tolerar de verdad?
- ¿qué decisión concreta podríamos tomar si este SLI empeora?
- ¿estamos midiendo confiabilidad o solo juntando números?

Responder eso te ayuda muchísimo a pensar SLOs con más criterio.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque en el backend real las discusiones suelen sonar así:

- “no está caído, pero igual anda mal”
- “los usuarios se quejan aunque el promedio no es terrible”
- “la API responde, pero la cola está muy atrasada”
- “ciertos tenants premium están sufriendo más”
- “el release parece estable, pero el checkout quedó más errático”
- “no sabemos si esta degradación amerita frenar otras cosas o no”

Y una mirada útil de SLOs y SLIs ayuda muchísimo a convertir esa niebla en decisiones más concretas.

## Relación con Spring Boot

Spring Boot puede ser una muy buena base para instrumentar estas señales, pero el framework no decide por vos:

- qué servicio importa más
- qué experiencia querés proteger
- qué percentil o tasa representa mejor esa promesa
- cuánto margen tolerás
- cómo segmentar por tenant o por feature
- qué objetivos son realistas y útiles
- qué decisiones querés tomar cuando te alejás de ellos

Eso sigue siendo criterio de backend, operación y producto.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> en un backend serio, confiabilidad deja de ser una sensación vaga de “que ande bien” y pasa a ser una conversación más concreta sobre qué servicio querés sostener realmente, qué señales representan esa promesa, qué nivel considerás aceptable y cómo usar esas mediciones para priorizar, aprender y operar el sistema con bastante más honestidad y menos intuición difusa.

## Resumen

- Un SLI es una señal útil del servicio; un SLO es el objetivo que querés sostener sobre esa señal.
- Confiabilidad real no debería discutirse solo con intuiciones vagas o promedios lindos.
- Latencia, error rate, colas, tiempo total de procesamiento y segmentación por tenant pueden entrar en esta mirada.
- Los SLOs útiles conectan observabilidad, operación, producto y priorización de trabajo.
- El error budget ayuda a pensar confiabilidad con más realismo y menos perfeccionismo abstracto.
- Este tema convierte la confiabilidad del backend en algo medible, discutible y accionable.
- A partir de acá el bloque queda listo para entrar todavía más en plataforma, operación madura y diseño pensando en confiabilidad sostenida a largo plazo.

## Próximo tema

En el próximo tema vas a ver cómo pensar capacidad, escalado y planificación de crecimiento sin caer en puro overprovisioning o en optimismo ingenuo, porque después de definir mejor qué nivel de servicio querés sostener, la siguiente pregunta natural es cómo preparás al sistema para crecer sin vivir siempre al borde.
