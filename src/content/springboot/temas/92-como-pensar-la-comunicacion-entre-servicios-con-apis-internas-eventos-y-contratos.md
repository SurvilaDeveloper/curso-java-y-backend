---
title: "Cómo pensar la comunicación entre servicios con APIs internas, eventos y contratos"
description: "Entender qué cambia cuando varios componentes del backend necesitan comunicarse entre sí, y cómo comparar request-respuesta, APIs internas y eventos sin convertir el sistema distribuido en una red caótica de dependencias."
order: 92
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- health
- readiness
- liveness
- checks básicos
- estado operativo real del backend
- diferencias entre “estar vivo” y “estar listo”

Eso ya te dejó una idea muy importante:

> cuando el sistema ya corre en entornos reales, no alcanza con mirar el código; también importa muchísimo cómo convive operativamente con despliegue, balanceo, monitoreo y fallos parciales.

Ahora aparece una pregunta muy natural a medida que el backend sigue creciendo y algunas partes empiezan a tener más independencia:

> cuando varios componentes, módulos o servicios necesitan colaborar, ¿cómo deberían hablarse entre sí?

Porque apenas el sistema sale de la simplicidad de “todo ocurre dentro del mismo proceso”, empiezan a aparecer situaciones como estas:

- un servicio necesita datos de otro
- una operación en orders necesita que payments haga algo
- auth quiere validar o enriquecer identidad con users
- notifications necesita enterarse de un hecho del dominio
- analytics necesita reaccionar sin frenar el flujo principal
- un módulo interno expone datos a otro mediante HTTP
- un evento de negocio dispara reacciones en varias partes

Y ahí aparecen decisiones muy importantes:

- **request-respuesta**
- **APIs internas**
- **eventos**
- **mensajería**
- **contratos entre componentes**
- **acoplamiento temporal**
- **sincronía o asincronía**

Este tema es clave porque, cuando ya hay varias partes del sistema colaborando, la forma de comunicación empieza a afectar muchísimo:

- latencia
- resiliencia
- acoplamiento
- claridad de arquitectura
- debugging
- consistencia
- y experiencia operativa del backend

## El problema de que los componentes empiecen a hablarse sin criterio

Cuando recién aparece la necesidad de comunicar componentes, es fácil caer en una lógica muy lineal:

- “este servicio necesita algo del otro, entonces le pega”
- “esta parte tiene que enterarse, entonces la llamamos”
- “si necesito un dato, hago una request”
- “si necesito disparar algo, llamo directo al otro módulo”

Al principio parece razonable.

Pero cuando eso se repite mucho, pueden empezar a aparecer problemas como:

- cadenas largas de llamadas
- más latencia de la necesaria
- dependencias temporales demasiado rígidas
- fallos en cascada
- módulos que ya no pueden operar sin varios otros respondiendo al instante
- efectos secundarios acoplados al flujo principal
- dificultad para entender quién depende realmente de quién

Entonces la pregunta ya no es solo “cómo hago que una parte llame a la otra”.
La pregunta más madura es:

> ¿qué estilo de comunicación conviene para este tipo de colaboración?

## Qué significa comunicación entre servicios o componentes

Dicho simple:

> significa la forma en que dos partes relativamente separadas del sistema intercambian información o coordinan acciones.

Eso puede ocurrir entre:

- módulos internos bien delimitados dentro de un mismo backend
- procesos distintos
- servicios separados
- consumidores y productores de eventos
- APIs internas dentro de una arquitectura más distribuida

La idea importante es que ya no estás solo en el nivel de llamar un método dentro de la misma clase.
Ahora estás pensando relaciones entre fronteras más serias del sistema.

## Dos grandes estilos mentales

A alto nivel, muchas veces la conversación gira alrededor de dos estilos muy importantes:

### 1. Comunicación síncrona tipo request-respuesta
Una parte le pide algo a otra y espera respuesta ahora.

### 2. Comunicación asíncrona orientada a eventos o mensajería
Una parte publica o envía algo, y otra reacciona después sin que el productor tenga que esperar el resultado completo en ese instante.

No son enemigos absolutos.
Ambos tienen valor.
La clave está en entender qué problema resuelve cada uno.

## Qué significa comunicación síncrona

Significa, conceptualmente:

> A necesita algo de B ahora, así que A hace una llamada y espera que B responda para poder seguir.

Esto puede verse como:

- llamada HTTP interna
- consulta a otro servicio
- API interna
- request directa entre componentes separados

La lógica temporal es clara:

1. A llama
2. B procesa
3. B responde
4. A recién entonces sigue

Este modelo es muy natural y muy útil en muchos casos.

## Cuándo suele tener mucho sentido la comunicación síncrona

Por ejemplo, cuando:

- necesitás un dato ahora mismo para responder
- necesitás validar algo antes de continuar
- el flujo requiere una decisión inmediata
- el usuario no puede seguir si no llega esa respuesta
- la operación tiene semántica fuerte de request-respuesta
- querés una experiencia más directa y explícita

Ejemplos típicos:

- consultar disponibilidad actual
- obtener perfil o datos de usuario necesarios para un flujo actual
- validar si una entidad existe
- pedir una cotización en tiempo real
- consultar el estado actual de algo que necesitás ya

En estos casos, la sincronía puede ser la opción más natural.

## Qué ventajas suele tener la comunicación síncrona

Entre las más comunes:

- modelo mental simple
- request y respuesta claros
- feedback inmediato
- flujo fácil de seguir conceptualmente
- semántica directa
- debugging inicial más intuitivo

Por eso, no conviene demonizarla.
Suele ser muy útil cuando la necesitás de verdad.

## Qué costos trae la comunicación síncrona

También trae varios costos.

Por ejemplo:

- A depende de que B responda ahora
- la latencia de B pasa a ser parte de la latencia de A
- si B falla, A puede fallar
- si la cadena se hace larga, el sistema se vuelve más frágil
- aparecen fallos en cascada
- el throughput puede empeorar
- el acoplamiento temporal se vuelve más fuerte

Este último punto es muy importante:

> A no solo depende funcionalmente de B; depende de que B esté disponible en ese mismo momento.

Eso vuelve al sistema más rígido temporalmente.

## Qué significa comunicación por eventos

Ahora pensemos el otro estilo.

La idea básica es algo así:

> una parte del sistema publica el hecho de que algo ocurrió, y otras partes pueden reaccionar sin que el productor tenga que esperar sus resultados en el mismo flujo inmediato.

Por ejemplo:

- `PedidoCreado`
- `PagoAprobado`
- `UsuarioRegistrado`
- `ArchivoSubido`
- `WebhookProcesado`

En vez de decirle directamente a otro servicio “hacé esto ahora y respondeme”, una parte del sistema dice:

> “pasó esto”

Y otras partes, si les importa, actúan en consecuencia.

## Qué ventajas trae esto

Muy a menudo:

- menos acoplamiento temporal
- menor necesidad de esperar
- mejor desacople entre productor y consumidores
- posibilidad de múltiples reacciones sin inflar el flujo principal
- mejor encaje con tareas secundarias o derivadas
- más resiliencia en ciertos escenarios

Por eso los eventos aparecen muchísimo cuando el sistema crece o cuando hay varias consecuencias derivadas de un mismo hecho.

## Qué costos trae

También trae costos reales:

- más complejidad para seguir el flujo
- consistencia más eventual
- debugging más difícil
- más necesidad de observabilidad
- posibilidad de duplicados o reintentos
- necesidad de idempotencia
- más dificultad para entender el estado global inmediatamente
- mayor complejidad operativa si hay colas o brokers reales

Otra vez:
no hay almuerzo gratis.

## Una intuición muy útil

Podés pensar así:

### Request-respuesta
“Necesito esto ahora para seguir”

### Evento
“Quiero contar que esto pasó; si a otros les importa, reaccionarán”

Esta distinción mental ordena muchísimo.

## Un ejemplo donde request-respuesta tiene sentido

Supongamos un checkout que necesita conocer el monto total actualizado del pedido antes de iniciar el pago.

Ahí puede tener sentido algo como:

- payments consulta a orders
- recibe monto, moneda y estado
- recién entonces sigue

Porque necesita ese dato ahora mismo.
No tendría mucho sentido reemplazar eso por un evento si lo que necesitás es una respuesta inmediata para continuar.

## Un ejemplo donde eventos tienen más sentido

Ahora imaginá que, cuando un pago se aprueba, querés:

- enviar email
- registrar auditoría
- actualizar analytics
- emitir notificación
- disparar onboarding post-compra

Ahí muchas veces es más sano pensar en:

- `PagoAprobado`
- y que varios consumidores reaccionen

en lugar de que el módulo de pagos llame síncronamente a todos esos bloques y espere por todos.

Esto reduce muchísimo el acoplamiento del flujo principal.

## Qué es una API interna

Una API interna es, conceptualmente, una API que no está pensada para consumidores públicos generales, sino para otros componentes o servicios de tu propio ecosistema.

Por ejemplo:

- `orders` expone un endpoint interno
- `payments` lo consume
- o `auth` consulta un endpoint interno de `users`

La idea importante es esta:

> aunque sea “interna”, sigue siendo un contrato.
Y por eso también necesita criterio.

No conviene pensar que, por ser interna, puede diseñarse sin cuidado.

## Por qué los contratos internos importan tanto

Porque si una API interna es desprolija, frágil o cambia arbitrariamente, los servicios o módulos que dependen de ella van a sufrir igual que cualquier cliente externo.

Entonces también importan cosas como:

- estabilidad razonable
- semántica clara
- versionado si hiciera falta
- errores comprensibles
- payloads bien pensados
- ownership del contrato

Es decir, lo interno también merece diseño.

## Qué diferencia hay entre depender de datos y depender de workflow

Esto es muy importante.

A veces una comunicación existe porque A necesita:

### Solo datos
Por ejemplo:
- monto
- email
- estado actual
- configuración

Y otras veces A necesita:

### Que otro haga una acción
Por ejemplo:
- emitir una notificación
- generar un documento
- procesar una tarea
- reconciliar una orden

No siempre conviene tratar ambos tipos de colaboración igual.

Muchas veces:

- consulta de datos → request-respuesta puede tener mucho sentido
- reacción a hechos o trabajo derivado → eventos puede tener más sentido

No es una regla absoluta, pero ayuda muchísimo a pensar.

## Qué relación tiene esto con acoplamiento temporal

Muy fuerte.

La comunicación síncrona suele traer más acoplamiento temporal porque:

- A necesita que B esté bien ahora

Los eventos desacoplan un poco más ese tiempo porque:

- A puede seguir después de publicar el hecho
- B puede procesarlo luego

Esto no elimina la relación funcional, pero sí cambia mucho la dependencia temporal.

Y esa diferencia es clave para resiliencia y latencia.

## Qué relación tiene esto con experiencia del usuario

También importa muchísimo.

Si una request del usuario depende síncronamente de demasiadas cosas, el tiempo de respuesta puede empeorar bastante.

Por ejemplo:

- usuario confirma checkout
- checkout llama a payments
- payments llama a notifications
- notifications llama a email
- email llama a template service
- todo en cadena

Eso puede hacer el flujo mucho más lento y frágil.

En cambio, si el request principal se queda con lo estrictamente necesario y deja ciertas reacciones para eventos o procesamiento desacoplado, la experiencia puede mejorar muchísimo.

## Qué relación tiene esto con consistencia

Muy fuerte.

Cuando usás request-respuesta, muchas veces buscás una coordinación más inmediata.

Cuando usás eventos, muchas veces aceptás que algunas cosas se alineen después.

Por ejemplo:

- el pago queda aprobado ya
- pero la notificación llega después
- o analytics se actualiza después
- o cierta sincronización externa ocurre más tarde

Eso es consistencia eventual en varias partes del sistema.
Y muchas veces está perfectamente bien, siempre que esté bien modelada.

## Qué relación tiene esto con fallos parciales

También es central.

Con comunicación síncrona, si B falla, A muchas veces queda afectado inmediatamente.

Con eventos, A puede a veces seguir, aunque luego B procese más tarde o falle de otra manera.

Esto puede ser una gran ventaja para ciertos flujos.
Pero también exige mejor manejo de retries, idempotencia, trazabilidad y observabilidad.

## Un ejemplo mental muy claro

Imaginá un pedido creado.

### Opción muy síncrona
- orders crea pedido
- llama a notifications
- llama a analytics
- llama a billing
- espera todo

### Opción más desacoplada
- orders crea pedido
- publica `PedidoCreado`
- notifications reacciona
- analytics reacciona
- billing reacciona si corresponde

La segunda opción suele soportar mejor la evolución del sistema si realmente hay varias consecuencias derivadas.
Pero también introduce más necesidad de visibilidad y consistencia eventual.

## Qué relación tiene esto con idempotencia

Muy fuerte.

Apenas usás eventos o comunicación más asíncrona, suelen crecer muchísimo preguntas como:

- ¿qué pasa si el mensaje se procesa dos veces?
- ¿qué pasa si llega repetido?
- ¿qué pasa si el consumidor reinicia?
- ¿qué pasa si hay retry?

Entonces la idempotencia deja de ser una rareza y pasa a ser una parte muy importante del diseño.

## Qué relación tiene esto con observabilidad

Total.

En sistemas con varias comunicaciones entre componentes, necesitás todavía más:

- logs con contexto
- métricas
- trazas
- ids de correlación
- eventos visibles
- tiempos de respuesta por comunicación
- estado de retries

Porque si no, rápidamente perdés el hilo de por qué una operación quedó a medio hacer o por qué un flujo completo salió mal.

## Qué relación tiene esto con microservicios

Muy directa.

Este tema es uno de los grandes puentes hacia pensamiento distribuido.

Porque, incluso antes de ir a microservicios completos, ya te obliga a pensar cosas como:

- cómo se comunican componentes separados
- cuándo conviene pedir y esperar
- cuándo conviene publicar y reaccionar
- qué contratos internos existen
- qué latencia o fallos parciales introducís

Es decir, ya estás entrando en lógica de sistemas distribuidos de una manera muy real.

## Qué no conviene hacer

No conviene:

- resolver todo con request-respuesta por costumbre
- resolver todo con eventos por moda
- usar HTTP interno para cualquier efecto secundario
- disparar eventos para cosas que requieren respuesta inmediata y fuerte
- ignorar el costo de debugging y operación de sistemas más asíncronos

Otra vez:
la clave está en el criterio, no en una bandera.

## Otro error común

Usar eventos para ocultar diseño confuso.
Si un módulo no sabe bien qué hechos produce o qué responsabilidades tienen los demás, tirar eventos por todos lados no arregla el problema.
A veces solo lo esconde.

## Otro error común

Hacer cadenas síncronas demasiado largas, donde una request del usuario termina dependiendo de muchos eslabones que deben responder todos bien al instante.

Eso vuelve el sistema bastante frágil.

## Otro error común

No pensar los contratos internos con cuidado solo porque “son internos”.
Lo interno también evoluciona, rompe y genera dependencia real.

## Una buena heurística

Podés preguntarte:

- ¿necesito una respuesta ahora o solo necesito contar que algo pasó?
- ¿esta colaboración es consulta inmediata o reacción derivada?
- ¿qué pasa si el otro componente no responde?
- ¿estoy agregando latencia innecesaria al request principal?
- ¿esta dependencia temporal es aceptable o demasiado rígida?
- ¿el contrato interno está claro o es improvisado?

Responder eso aclara muchísimo el tipo de comunicación que te conviene.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque apenas un backend serio empieza a tener:

- pagos
- orders
- auth
- notifications
- storage
- webhooks
- jobs
- integraciones
- distintos módulos o servicios

la comunicación entre partes deja de ser un detalle técnico y pasa a ser una parte central de la arquitectura.

## Relación con Spring Boot

Spring Boot puede vivir muy bien tanto con request-respuesta como con enfoques más orientados a eventos.
Pero, otra vez, el framework no decide por vos cuál conviene en cada relación.

La decisión sigue siendo arquitectónica y depende de:

- sincronía necesaria
- latencia
- resiliencia
- acoplamiento
- complejidad operativa
- y necesidades reales del flujo

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando varios componentes o servicios del backend necesitan colaborar, no conviene pensar toda comunicación de la misma forma: las APIs internas y el request-respuesta sirven muy bien cuando hace falta una respuesta inmediata, mientras que eventos y mensajería suelen aportar más desacople para reacciones derivadas, y entender ese tradeoff es central para diseñar sistemas distribuidos más sanos.

## Resumen

- La comunicación entre componentes puede ser síncrona o más orientada a eventos, y no resuelven el mismo problema.
- Request-respuesta es muy útil cuando necesitás una respuesta inmediata para seguir.
- Eventos sirven mucho para desacoplar reacciones derivadas y reducir acoplamiento temporal.
- Las APIs internas también son contratos y merecen diseño cuidadoso.
- Latencia, consistencia eventual, fallos parciales e idempotencia pesan mucho en esta decisión.
- No conviene ni resolver todo con HTTP síncrono ni todo con eventos por moda.
- Este tema te mete de lleno en una de las preguntas más importantes de sistemas distribuidos: cómo hacer colaborar partes distintas sin volver el backend una red frágil y opaca.

## Próximo tema

En el próximo tema vas a ver cómo pensar consistencia eventual, duplicados y compensaciones cuando ya hay varios pasos, eventos o servicios involucrados, porque una vez que la comunicación deja de ser completamente inmediata, esas preguntas se vuelven centrales.
