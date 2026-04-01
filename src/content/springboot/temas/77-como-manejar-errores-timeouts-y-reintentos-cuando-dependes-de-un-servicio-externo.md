---
title: "Cómo manejar errores, timeouts y reintentos cuando dependés de un servicio externo"
description: "Entender qué problemas aparecen cuando una integración externa falla o responde lento, y cómo diseñar un backend Spring Boot que maneje errores, timeouts y reintentos con más criterio y menos fragilidad."
order: 77
module: "Integraciones con servicios externos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo consumir APIs externas desde Spring Boot usando un cliente HTTP y por qué conviene encapsular esas llamadas en componentes o gateways específicos en lugar de desparramarlas por todo el sistema.

Eso ya te dejó una base muy importante:

- tu backend puede actuar como cliente HTTP
- conviene separar contrato externo de dominio interno
- no conviene mezclar detalles del proveedor con la lógica de negocio
- la integración necesita configuración, mapping y diseño

Pero aparece enseguida una de las preguntas más reales de todas:

> ¿qué pasa cuando el servicio externo falla, tarda demasiado o responde de una forma que no esperabas?

Porque en integraciones reales, tarde o temprano pasa de todo:

- el proveedor devuelve `500`
- la red falla
- el servicio tarda demasiado
- la respuesta viene incompleta
- aparece un `429` por rate limit
- el tercero rechaza el request por un problema funcional
- el proveedor está caído durante unos minutos
- tu sistema ya hizo algo local pero la llamada externa falló después

Este tema es clave porque una integración no se vuelve “seria” solo por poder hacer una llamada HTTP.
Se vuelve seria cuando tu backend sabe reaccionar bien cuando esa llamada no sale como imaginabas.

## El problema de asumir que el tercero siempre responde bien

Cuando recién empezás a integrar algo externo, es muy común pensar el flujo feliz:

- hago request
- recibo response
- parseo JSON
- sigo con el caso de uso

Ese flujo existe, claro.
Pero no alcanza.

Porque si todo tu diseño depende implícitamente de que el tercero:

- siempre esté disponible
- siempre responda rápido
- siempre mande JSON válido
- nunca devuelva errores raros
- nunca cambie nada
- nunca se sature

entonces tu backend va a ser mucho más frágil de lo que parece.

Una integración real necesita asumir que los problemas ocurren.

## Qué tipos de fallos suelen aparecer

Conviene distinguir, aunque sea mentalmente, varios tipos de fallo.

Por ejemplo:

### Fallos de red o conectividad
- no se puede abrir conexión
- DNS
- socket
- conexión rechazada

### Timeouts
- el tercero no responde a tiempo
- tarda demasiado en devolver algo útil

### Errores HTTP del tercero
- `400`
- `401`
- `403`
- `404`
- `409`
- `429`
- `500`
- `503`

### Respuesta inválida o inesperada
- body roto
- formato distinto al esperado
- campos faltantes
- datos inconsistentes

### Error funcional del proveedor
- rechaza el pago
- no puede enviar el email
- no reconoce dirección
- no permite operación por regla de negocio propia

No todos estos fallos se manejan igual.
Y esa es una de las ideas más importantes del tema.

## Por qué no conviene tratar todos los fallos como si fueran iguales

Porque no es lo mismo:

- que el proveedor diga “tu request está mal”
- que el proveedor esté caído
- que tarde demasiado
- que el proveedor limite tus requests
- que el JSON no coincida con lo esperado

Cada caso puede pedir una reacción distinta.

Por ejemplo:

- a veces tiene sentido reintentar
- a veces no
- a veces hay que devolver error al cliente
- a veces conviene degradar funcionalidad
- a veces el problema es recuperable
- a veces es un bug de integración o contrato

Entonces la calidad de la integración depende mucho de distinguir estas situaciones con criterio.

## Qué es un timeout y por qué importa tanto

Un timeout significa, en pocas palabras:

> no estoy dispuesto a esperar indefinidamente a que el tercero responda.

Esto es importantísimo.

Porque si no configurás o pensás timeouts razonables, tu backend puede quedarse esperando demasiado por un sistema externo y eso puede afectar:

- la experiencia del usuario
- el consumo de recursos
- el throughput del sistema
- la estabilidad general bajo carga

Es decir, esperar sin límite suele ser una muy mala idea.

## Qué problema trae no pensar timeouts

Supongamos que tu endpoint tarda normalmente 100 ms.
Pero para completarse depende de un tercero que hoy tarda 12 segundos.

Entonces podrías tener:

- usuarios esperando de más
- requests colgadas
- hilos ocupados
- cascada de lentitud
- timeouts del frontend
- errores difíciles de interpretar

Esto muestra que la latencia del tercero pasa a formar parte de la latencia real de tu sistema.

## Una buena intuición

Podés pensar así:

> cuando llamás a un servicio externo, su tiempo de respuesta se convierte en parte de tu tiempo de respuesta.

Esa frase ordena muchísimo el tema.

## Qué significa manejar bien un timeout

No significa “eliminar el problema”.
Significa más bien:

- definir cuánto estás dispuesto a esperar
- cortar la espera cuando ya no tiene sentido
- reaccionar con una política clara
- no dejar la request colgada indefinidamente
- y transformar el fallo en algo entendible para tu sistema

Eso ya es muchísimo mejor que esperar a ciegas.

## Un ejemplo muy típico

Supongamos que tu backend consulta una cotización externa para mostrar un valor en pantalla.

Si el tercero no responde en un tiempo razonable, quizá tiene sentido:

- cortar la espera
- devolver error controlado
- usar valor fallback si existe
- o informar que la cotización no está disponible por ahora

No todas las integraciones toleran lo mismo, pero el punto es que el timeout debería formar parte del diseño, no ser una sorpresa.

## Qué es un reintento

Un reintento significa, básicamente:

> ante cierto fallo, volver a intentar la llamada en lugar de darla por perdida inmediatamente.

Esto puede ser útil en algunos escenarios, por ejemplo cuando el fallo es:

- transitorio
- intermitente
- de red
- un `503` ocasional
- un timeout puntual razonablemente recuperable

Pero no conviene convertir el retry en un reflejo automático para todo.

## Por qué no conviene reintentar cualquier cosa

Porque hay errores donde reintentar no ayuda y hasta empeora.

Por ejemplo:

- request mal formada
- credenciales inválidas
- datos rechazados funcionalmente
- `400` del proveedor por problema de input
- `401` por autenticación externa incorrecta

En esos casos, reintentar suele repetir el mismo error una y otra vez.

Entonces una de las ideas más importantes es esta:

> no todos los errores merecen retry.

## Cuándo un reintento puede tener sentido

Muchas veces puede tener sentido ante fallos como:

- timeout transitorio
- `503 Service Unavailable`
- fallo momentáneo de red
- `429` si el proveedor indica que conviene reintentar después
- ciertos errores intermitentes no funcionales

Pero incluso ahí conviene tener criterio.
No se trata de reintentar infinito ni sin límites.

## Qué problema trae reintentar mal

Si reintentás sin control, podés generar:

- más carga sobre el tercero
- más demora total para tu usuario
- duplicaciones de operaciones si no eran idempotentes
- cascadas de requests
- comportamientos erráticos difíciles de diagnosticar

Por eso el retry necesita diseño, no solo entusiasmo.

## Qué es una operación idempotente y por qué importa acá

A muy alto nivel, una operación idempotente es una operación donde repetir la misma llamada no genera efectos distintos o duplicados no deseados.

Esto importa muchísimo para reintentos.

Porque no es lo mismo reintentar:

- una lectura o consulta
- una cotización
- una verificación

que reintentar:

- crear un pago
- emitir una orden
- cobrar una tarjeta
- crear un envío real

Ahí el riesgo de duplicación puede ser mucho más serio.

No hace falta ahora hacer un tratado completo sobre idempotencia.
Pero sí conviene quedarte con esta intuición:

> antes de reintentar una operación externa, pensá si repetirla puede generar efectos duplicados peligrosos.

## Un ejemplo muy claro

No es lo mismo reintentar:

```text
GET /rates?base=USD&target=ARS
```

que reintentar:

```text
POST /payments
```

La primera suele ser mucho más segura para retry.
La segunda puede ser mucho más delicada si el proveedor no maneja bien duplicados o si vos no diseñaste el flujo con cuidado.

## Qué conviene hacer con errores externos

Suele ser buena idea transformarlos en algo que tu sistema pueda entender mejor.

Por ejemplo, podrías tener excepciones como:

```java
public class ExternalServiceUnavailableException extends RuntimeException {

    public ExternalServiceUnavailableException(String message) {
        super(message);
    }
}
```

o algo más específico:

```java
public class ShippingProviderTimeoutException extends RuntimeException {

    public ShippingProviderTimeoutException(String message) {
        super(message);
    }
}
```

```java
public class PaymentProviderRejectedException extends RuntimeException {

    public PaymentProviderRejectedException(String message) {
        super(message);
    }
}
```

La idea es importante:
tu backend no debería vivir completamente dominado por errores crudos del proveedor.

## Por qué conviene traducir errores externos

Porque el resto de tu sistema necesita reaccionar con semántica propia.

Por ejemplo:

- “el proveedor está caído”
- “la operación fue rechazada por regla funcional”
- “hubo timeout”
- “la integración respondió en formato inválido”

Eso es mucho más útil que propagar una excepción genérica sin contexto o mensajes caóticos del tercero.

## Un ejemplo de reacción distinta según error

Podrías pensar algo así:

### Error funcional del proveedor
- devolver conflicto o rechazo controlado al cliente

### Timeout o caída del proveedor
- devolver un error temporal
- o marcar operación pendiente si tu negocio lo permite

### Parsing inesperado
- tratarlo como error de integración
- loguearlo bien
- no fingir que fue un problema funcional del usuario

Esa diferenciación vale muchísimo.

## Qué relación tiene esto con el dominio

Muy fuerte.

Porque no todas las integraciones tienen el mismo peso dentro del negocio.

Por ejemplo:

### Integración complementaria
- enviar email de bienvenida

Si falla, quizá el registro igual debe quedar exitoso.

### Integración crítica
- crear pago externo

Si falla, el flujo del checkout puede cambiar por completo.

Entonces antes de decidir retries, timeouts o errores, conviene preguntarte:

> ¿qué tan crítica es esta integración para el caso de uso?

Esa pregunta ordena muchísimo.

## Un ejemplo muy importante: email de bienvenida

Supongamos:

- se registra el usuario
- el usuario queda guardado correctamente
- falla el proveedor de email

¿Qué hacés?

Muchas veces tendría sentido:

- no romper el registro
- loguear el problema
- quizá reintentar luego
- quizá marcar un evento pendiente
- pero no decir que el registro entero falló

Eso muestra una idea muy importante:
no toda integración externa tiene el mismo peso transaccional dentro del caso de uso.

## Otro ejemplo: pago externo

Ahora supongamos:

- se crea una orden local
- se intenta crear pago externo
- el proveedor de pagos falla

Acá la decisión puede ser mucho más delicada:

- ¿la orden queda pendiente?
- ¿se revierte?
- ¿el usuario ve un error?
- ¿se puede reintentar?
- ¿ya quedó algo a medio crear en el proveedor?

Este tipo de caso muestra por qué integración, consistencia y manejo de errores van tan juntos.

## Qué pasa con los logs

Cuando dependés de un tercero, los logs se vuelven todavía más importantes.

Conviene poder entender cosas como:

- a qué proveedor llamaste
- con qué operación
- cuánto tardó
- qué status devolvió
- si hubo timeout
- si hubo retry
- qué entidad local estaba involucrada
- si hubo correlación con pedido, usuario o acción concreta

Porque cuando la integración falla, casi siempre necesitás más visibilidad que en un simple error local.

## Qué conviene loguear

Sin exagerar ni filtrar secretos sensibles, suele ser útil tener visibilidad sobre:

- endpoint externo llamado
- método HTTP
- status recibido
- duración
- si hubo retry
- identificador funcional local
- tipo de error
- mensaje contextual

Esto hace muchísimo más fácil diagnosticar problemas reales.

## Qué relación tiene esto con observabilidad

También muy fuerte.

A medida que el sistema crece, se vuelve mucho más importante saber:

- qué integración está fallando más
- cuáles responden más lento
- cuántos timeouts hay
- qué porcentaje de errores viene del tercero
- cuántos retries están ocurriendo

Esto ya empieza a acercarte mucho a backend más profesional de verdad.

## Qué relación tiene esto con configuración

Los timeouts y parámetros de retry no conviene dejarlos como números mágicos perdidos en el código.

Muchas veces tiene más sentido configurarlos por entorno o por integración.

Por ejemplo, conceptualmente:

```properties
external.shipping.timeout-ms=2000
external.shipping.max-retries=2
external.email.timeout-ms=1500
```

No importa ahora si luego lo hacés con properties, yaml o beans dedicados.
La idea es importante:
estos valores forman parte del diseño de la integración y conviene poder manejarlos con criterio.

## Qué relación tiene esto con testing

Muy fuerte.

Porque una integración seria no debería probar solo la rama feliz.
También conviene pensar cosas como:

- qué pasa si el tercero responde 500
- qué pasa si hay timeout
- qué pasa si la respuesta viene mal formada
- qué pasa si hay retry
- qué pasa si la operación es rechazada funcionalmente
- qué hace tu service de negocio frente a cada caso

Esto vuelve el testing de integraciones muchísimo más rico y útil.

## Un ejemplo mental de preguntas de test

Para una integración de cotización:

- si responde bien, ¿mapeo correcto?
- si responde timeout, ¿lanzo excepción correcta?
- si responde 500, ¿lo traduzco bien?
- si responde 400 por request mal formado, ¿lo trato como error funcional o técnico?

Este tipo de pruebas ayuda muchísimo a madurar la integración.

## Qué no conviene hacer

No conviene:

- asumir que el tercero siempre responde
- reintentar todo indiscriminadamente
- ignorar el riesgo de duplicados
- propagar errores externos crudos por todo el sistema
- dejar timeouts implícitos o mágicos
- no distinguir integración crítica de integración accesoria

Ese tipo de decisiones suele doler bastante en producción.

## Otro error común

Creer que “si falla el tercero, mala suerte” y no modelar ninguna estrategia.

A veces eso puede ser aceptable en casos muy secundarios, pero muchas veces el negocio necesita algo bastante más pensado que un simple colapso.

## Otro error común

Meter retries automáticos sin entender si la operación es segura de repetir.

Eso puede producir efectos duplicados o inconsistencias graves.

## Otro error común

Tratar todos los errores del proveedor como `500` genéricos de tu sistema.
Eso suele empobrecer muchísimo la semántica y complica tanto el debugging como la experiencia del cliente.

## Una buena heurística

Podés preguntarte:

- ¿qué pasa si el tercero tarda demasiado?
- ¿qué pasa si responde 500?
- ¿qué pasa si rechaza funcionalmente la operación?
- ¿qué errores conviene reintentar?
- ¿qué operaciones no conviene repetir?
- ¿qué impacto tiene este fallo sobre mi caso de uso?
- ¿esta integración es crítica o complementaria?

Responder esto aclara muchísimo el diseño.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque casi cualquier integración real termina enfrentándote a:

- caídas del proveedor
- lentitud
- cambios de contrato
- errores raros
- intermitencias
- y decisiones difíciles sobre qué hacer cuando tu sistema depende de otro

Entonces esta parte no es un detalle avanzado “por si acaso”.
Es parte central del backend real cuando salís de tu propio código y te conectás con el mundo externo.

## Relación con Spring Boot

Spring Boot te da herramientas muy útiles para estructurar clientes, configuración, manejo de errores y testing.
Pero la parte más importante sigue siendo el criterio de diseño:

- qué error significa qué
- cuándo esperar
- cuándo cortar
- cuándo reintentar
- cuándo degradar
- y cómo traducir todo eso al lenguaje de tu sistema

Ese criterio es justamente lo que este tema te entrena a pensar.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando dependés de un servicio externo, una integración sana no consiste solo en poder llamarlo, sino en saber qué hacer cuando tarda, falla o responde raro, distinguiendo timeouts, errores funcionales y fallos transitorios para aplicar con criterio logs, traducción de errores y reintentos solo donde realmente tenga sentido.

## Resumen

- Un servicio externo puede fallar de muchas maneras distintas y no conviene tratarlas todas igual.
- Los timeouts son fundamentales para no quedar esperando indefinidamente.
- Los reintentos pueden ayudar, pero no en cualquier error ni en cualquier operación.
- Idempotencia importa mucho antes de repetir llamadas que generan efectos externos.
- Traducir errores del proveedor a excepciones o resultados más propios del sistema suele mejorar mucho el diseño.
- Integraciones críticas y complementarias no siempre deben reaccionar igual ante fallos.
- Este tema te da una base mucho más realista para diseñar integraciones que sigan siendo útiles aun cuando el tercero se comporta mal.

## Próximo tema

En el próximo tema vas a ver cómo recibir webhooks o callbacks externos en Spring Boot, que es el otro gran patrón de integración: no solo cuando vos llamás al tercero, sino cuando el tercero te llama a vos.
