---
title: "Cómo pensar tolerancia a fallos y degradación razonable cuando el sistema depende de varias partes"
description: "Entender qué significa diseñar un backend para seguir siendo útil cuando alguna dependencia falla, y cómo pensar tolerancia a fallos, degradación y comportamiento razonable en sistemas con varios servicios, eventos o integraciones."
order: 96
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- versionado interno
- compatibilidad entre servicios
- evolución de contratos
- deprecación
- cambios incompatibles
- consumidores y productores internos
- cuidado de la semántica además del formato

Eso ya te dejó una idea muy importante:

> cuando varias partes del sistema se comunican entre sí, los contratos internos dejan de ser un detalle invisible y pasan a necesitar casi tanto cuidado como los contratos públicos.

Pero apenas el backend empieza a depender de:

- varios módulos
- varios servicios
- terceros externos
- colas
- webhooks
- APIs internas
- storage
- pagos
- notificaciones
- auth
- jobs o procesos desacoplados

aparece una realidad todavía más cruda:

> tarde o temprano, algo va a fallar.

Y la pregunta importante ya no es si el fallo va a existir o no.
La pregunta más madura pasa a ser:

> ¿cómo querés que se comporte el sistema cuando eso ocurra?

Ahí aparecen ideas centrales como:

- **tolerancia a fallos**
- **degradación razonable**
- **fallos parciales**
- **evitar cascadas**
- **seguir siendo útil aunque no todo esté perfecto**
- **decidir qué parte del flujo debe caer y cuál no**

Este tema es clave porque un backend real no se mide solo por cómo funciona cuando todo sale bien, sino también por cómo responde cuando alguna parte deja de estar disponible o empieza a comportarse mal.

## El problema de diseñar como si nada fuera a fallar

Cuando uno empieza, es muy fácil escribir el backend con una suposición implícita:

- base responde
- proveedor responde
- cola funciona
- webhook llega
- email sale
- storage está arriba
- servicio vecino contesta rápido
- todo se confirma al instante

Ese flujo feliz es útil para empezar.
Pero si el sistema queda diseñado solo para eso, se vuelve frágil muy rápido.

Porque en producción real pueden pasar cosas como:

- una integración externa cae
- una API interna responde lento
- una cola se atrasa
- un webhook no llega enseguida
- la base tiene problemas temporales
- un servicio vecino se degrada
- una dependencia crítica no está lista
- un proveedor devuelve timeouts intermitentes

Entonces el sistema necesita algo más que lógica feliz:
necesita criterio frente al fallo.

## Qué significa tolerancia a fallos

Dicho simple:

> significa diseñar el sistema para que ciertos fallos no destruyan automáticamente todo el flujo ni vuelvan inútil a toda la aplicación cuando todavía existe alguna forma razonable de seguir operando.

No significa que el sistema sea invencible.
No significa que jamás falle.
Significa algo más realista:

- detectar mejor el fallo
- acotar su impacto
- decidir qué se degrada
- evitar cascadas innecesarias
- y seguir prestando el mayor valor posible cuando tenga sentido hacerlo

## Qué significa degradación razonable

Podés pensarlo así:

> degradación razonable es aceptar que, ante la caída o lentitud de alguna parte, el sistema puede seguir funcionando con menos capacidad o con algunas funciones deshabilitadas, en lugar de colapsar por completo sin necesidad.

Esto es muy importante.

Porque no todas las fallas merecen el mismo nivel de colapso.
A veces el sistema puede seguir siendo útil aunque no esté al 100%.

## Un ejemplo muy claro

Supongamos que falla el proveedor de emails.

La pregunta no debería ser automáticamente:

- ¿todo el backend debe caer?

Muchas veces, no.

Quizá lo razonable sea:

- el registro sigue funcionando
- pero el email de bienvenida queda pendiente
- se loguea el problema
- se reintenta luego
- la app sigue viva y útil

Eso es degradación razonable.

## Otro ejemplo

Ahora supongamos que cae la base principal de datos.

Ahí probablemente el panorama cambia mucho más, porque quizás el backend ya no pueda atender casi nada relevante.

Entonces la degradación tolerable no siempre existe del mismo modo.

Esto muestra una idea muy importante:

> no todas las dependencias pesan igual y no todas las fallas merecen la misma reacción.

## Qué diferencia hay entre dependencia crítica y dependencia accesoria

Esta distinción es una de las más importantes del tema.

### Dependencia crítica
Si falla, el sistema pierde la capacidad de cumplir su función principal o una gran parte de ella.

Por ejemplo, muchas veces:
- base de datos principal
- sistema central de auth
- provider esencial del flujo de cobro
- dependencia sin la cual no podés responder correctamente el core del producto

### Dependencia accesoria o secundaria
Si falla, el sistema pierde una parte valiosa pero no necesariamente su capacidad principal de seguir siendo útil.

Por ejemplo, muchas veces:
- analytics
- email de bienvenida
- una notificación secundaria
- enriquecimiento de datos no esencial
- cierto dashboard interno no crítico

Esta diferencia ordena muchísimo cómo pensar el fallo.

## Qué pasa cuando no hacés esta distinción

El sistema puede terminar reaccionando mal en ambos extremos.

Por ejemplo:

- colapsa por la caída de algo que no era tan esencial
- o sigue fingiendo normalidad cuando cayó algo totalmente crítico

Ninguna de las dos cosas es buena.

Entonces conviene preguntarte siempre:

> si esta dependencia falla, ¿qué parte real del valor del sistema se pierde?

Esa pregunta es muy poderosa.

## Qué significa fallo parcial

Un fallo parcial ocurre cuando una parte del sistema o del flujo falla, pero no necesariamente todo está roto.

Por ejemplo:

- el pedido se crea, pero la notificación no salió
- el usuario se registra, pero el proveedor de CRM no respondió
- el checkout se inició, pero el analytics no recibió el evento
- el backend puede servir lectura, pero no puede procesar uploads
- el perfil se puede ver, pero la foto externa no carga
- el pago sigue pendiente, aunque el pedido ya existe

Estos escenarios son mucho más comunes que el colapso absoluto.
Y el backend real necesita estar preparado para convivir con ellos.

## Por qué el fallo parcial es tan importante

Porque en sistemas con varias dependencias, muchas veces la realidad no es:

- todo ok
- todo roto

La realidad suele ser bastante más matizada.

Y si el backend solo sabe pensar en blanco o negro, toma malas decisiones:

- o falla demasiado pronto
- o esconde degradaciones importantes
- o deja estados raros sin modelarlos

En cambio, si acepta el fallo parcial como parte del mundo real, puede responder mucho mejor.

## Un ejemplo muy claro con checkout

Supongamos un flujo de compra con:

- orders
- payments
- notifications
- analytics

Si analytics falla, probablemente no querés romper el checkout entero.

Si notifications falla, probablemente tampoco.

Pero si payments falla antes de iniciar realmente el cobro, ahí tal vez sí cambia mucho más la experiencia del usuario.

Esto muestra muy bien que:

> la gravedad del fallo depende de qué parte del flujo se vio afectada y del peso que esa parte tenga para el caso de uso.

## Qué es una cascada de fallos

Una cascada ocurre cuando el problema de una parte empieza a propagarse y arrastra a otras.

Por ejemplo:

1. un proveedor externo se pone lento
2. un servicio empieza a esperar demasiado
3. se acumulan requests
4. se ocupan recursos
5. otros flujos se degradan
6. más componentes empiezan a fallar
7. el sistema entero se vuelve inestable

Esto es especialmente peligroso en sistemas con mucha dependencia síncrona.

Y por eso pensar tolerancia a fallos no es solo cuestión de “manejar excepciones”.
También es cuestión de evitar que una falla local se vuelva sistémica.

## Qué relación tiene esto con latencia

Muy fuerte.

No hace falta que una dependencia “caiga” del todo para hacer daño.
A veces alcanza con que se ponga muy lenta.

Porque si el sistema sigue esperando indefinidamente o casi indefinidamente, esa lentitud puede propagarse y afectar mucho más de lo que parecía.

Entonces tolerancia a fallos también implica pensar:

- cuánto espero
- qué hago si tarda demasiado
- qué parte del flujo abandono
- qué parte puedo resolver después
- qué parte degrado

## Qué relación tiene esto con timeouts

Total.

Los timeouts son una de las herramientas más básicas para evitar que el sistema quede rehén de una dependencia lenta.

Porque muchas veces lo peor no es el fallo explícito.
Lo peor es quedarse esperando demasiado.

Entonces un timeout bien pensado puede ser una forma sana de decir:

> hasta acá espero; después tomo una decisión de degradación o fallo controlado.

No resuelve todo, claro.
Pero ayuda muchísimo.

## Qué relación tiene esto con retries

También importante.

A veces un retry ayuda si el fallo es:

- transitorio
- de red
- momentáneo
- una saturación pasajera

Pero también puede empeorar si:

- repetís una operación no idempotente
- insistís contra un sistema ya saturado
- agregás más carga sobre algo que ya está lento
- duplicás efectos del negocio

Entonces tolerancia a fallos no significa “reintentar todo”.
Significa decidir con criterio cuándo eso ayuda y cuándo empeora.

## Qué relación tiene esto con circuit breakers o patrones similares

Sin meternos ahora en una clase de patrones formales, conviene captar la intuición:

> a veces el sistema necesita dejar de insistirle temporalmente a una dependencia que está claramente fallando o lenta, para protegerse a sí mismo y evitar una cascada peor.

Esa idea aparece muchísimo en sistemas reales.
No hace falta memorizar el patrón antes de entender el problema que resuelve.

## Qué relación tiene esto con consistencia eventual

Muy fuerte.

A veces la forma de tolerar un fallo sin colapsar es aceptar que cierta parte del sistema se va a alinear más tarde.

Por ejemplo:

- guardo pedido ahora
- la notificación se reintenta luego
- el CRM se sincroniza después
- analytics se recompone más tarde
- el webhook termina de cerrar el pago más adelante

Eso es una forma de degradar razonablemente sin perder el núcleo del valor del flujo principal.

## Qué relación tiene esto con UX

También es importantísima.

Porque la degradación razonable no es solo técnica.
También se refleja en la experiencia del usuario.

Por ejemplo:

- “tu pedido fue recibido, estamos confirmando el pago”
- “tu cuenta fue creada, la confirmación por email puede demorarse”
- “algunas funciones están temporalmente no disponibles”
- “tu archivo fue recibido, seguimos procesándolo”

Estas respuestas suelen ser muchísimo mejores que:

- fingir éxito total donde no lo hay
- o caer por completo cuando quizá no hacía falta

La UX honesta y bien modelada forma parte del diseño tolerante a fallos.

## Qué relación tiene esto con health y readiness

Muy fuerte otra vez.

Si una dependencia crítica cae, tal vez el sistema ya no debería declararse listo.

Si una dependencia secundaria cae, quizá sigue listo, pero degradado.

Esto conecta directamente con el tema anterior:
los checks de salud también deberían reflejar qué tan operativamente útil sigue siendo la app cuando algo falla.

## Qué relación tiene esto con logs y observabilidad

Absolutamente central.

Cuando el sistema degrada o tolera fallos, necesitás poder ver cosas como:

- qué dependencia falló
- cuántas veces
- cuánto tardó
- qué flujos quedaron degradados
- qué fallback o decisión se tomó
- cuántos retries hubo
- si el problema es aislado o sistémico

Sin observabilidad, la degradación puede volverse invisible o parecer caos.

## Qué relación tiene esto con diseño de dominio

También es muy importante.

Porque no siempre tolerar fallos significa solo poner más infraestructura alrededor.
Muchas veces significa modelar mejor:

- estados
- pendientes
- expiraciones
- reintentos
- reconciliaciones
- tareas secundarias
- compensaciones

Es decir, el dominio tiene que saber convivir con la imperfección temporal del sistema real.

## Un ejemplo de dominio más maduro

En lugar de solo tener:

- `PAGADO`
- `NO_PAGADO`

quizá necesitás:

- `PENDIENTE`
- `EN_PROCESO`
- `PAGADO`
- `RECHAZADO`
- `EXPIRADO`

Esto no es burocracia.
Es hacerle espacio en el modelo a lo que realmente pasa en sistemas distribuidos.

## Qué no conviene hacer

No conviene:

- asumir que todas las dependencias deben estar perfectas para que la app haga cualquier cosa
- colapsar el sistema entero por fallos secundarios
- esconder fallos críticos como si nada pasara
- reintentar indiscriminadamente
- ignorar latencia como forma de fallo
- no decidir qué parte del flujo merece degradación y cuál no

Ese tipo de decisiones vuelve al backend mucho más frágil o mucho más confuso.

## Otro error común

Creer que tolerancia a fallos significa “tragarse errores”.
No.
Significa decidir mejor qué hacer con ellos.

A veces será:
- fallar rápido y claro

Otras veces:
- degradar
- reintentar
- dejar pendiente
- compensar después

La clave está en la decisión, no en ocultar el problema.

## Otro error común

No distinguir entre tolerancia razonable y corrupción silenciosa.
Aceptar consistencia eventual o degradación no significa aceptar estados mal diseñados o incoherentes sin control.

## Otro error común

Modelar el sistema como si toda dependencia secundaria pudiera caer sin costo alguno.
Algunas no rompen el flujo principal, pero igual importan mucho y necesitan observabilidad, alertas o recuperación posterior.

## Una buena heurística

Podés preguntarte:

- ¿qué dependencias son realmente críticas?
- ¿qué puede degradarse sin destruir el valor principal del sistema?
- ¿qué falla debería sacar la instancia de rotación y cuál no?
- ¿qué pasa si esta dependencia se pone lenta, no solo si se cae?
- ¿qué experiencia quiero que tenga el usuario cuando esta parte falle?
- ¿cómo evito que esta falla arrastre a otras?
- ¿qué parte puedo reintentar, compensar o resolver después?

Responder eso ayuda muchísimo a madurar la arquitectura.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque apenas el sistema tiene:

- varios servicios
- varios módulos
- terceros
- webhooks
- storage
- pagos
- jobs
- eventos
- contratos internos

la tolerancia a fallos deja de ser una preocupación opcional y se vuelve parte central del diseño.

En sistemas reales no gana el backend que solo brilla en el demo feliz.
Gana el que también sabe comportarse con cierta dignidad cuando algo falla.

## Relación con Spring Boot

Spring Boot puede darte muchas herramientas útiles alrededor de esta clase de problemas.
Pero, otra vez, lo decisivo no es el framework.
Lo decisivo es el criterio con el que decidís:

- qué parte del sistema debe seguir viva
- qué parte debe degradarse
- qué falla es aceptable temporalmente
- qué dependencia es demasiado crítica
- y qué comportamiento querés como producto y como operación

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> en sistemas con varias dependencias, tolerancia a fallos no significa evitar que algo falle, sino decidir de forma consciente qué debe colapsar, qué puede degradarse y cómo impedir que una lentitud o caída parcial arrastre innecesariamente al resto del backend, manteniendo al sistema lo más útil y coherente posible.

## Resumen

- En sistemas con varias dependencias, algo va a fallar tarde o temprano.
- No todas las dependencias son igual de críticas y no todas las fallas merecen el mismo nivel de colapso.
- La degradación razonable permite seguir siendo útil aunque una parte del sistema esté caída o lenta.
- Latencia, fallos parciales, retries y timeouts forman parte real del problema.
- Tolerancia a fallos se conecta con health, observabilidad, consistencia eventual y diseño del dominio.
- No conviene ni tragarse errores a ciegas ni hacer caer todo por problemas secundarios.
- Este tema te ayuda a pensar uno de los rasgos más maduros del backend real: cómo se comporta cuando el mundo deja de responder perfecto.

## Próximo tema

En el próximo tema vas a ver cómo pensar escalabilidad horizontal, statelessness y reparto de carga cuando el sistema ya necesita crecer en volumen, porque después de tolerar fallos y dependencias, otra gran pregunta natural es cómo hacer que varias instancias del backend trabajen bien juntas.
