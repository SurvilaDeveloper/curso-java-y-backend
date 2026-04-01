---
title: "Cómo pensar versionado y compatibilidad entre servicios o contratos internos cuando el sistema ya está más distribuido"
description: "Entender por qué los contratos internos entre servicios, eventos o APIs dejan de ser triviales cuando el sistema se distribuye más, y cómo pensar compatibilidad y evolución sin romper consumidores internos cada vez que algo cambia."
order: 95
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- API gateway
- edge layer
- Backend for Frontend
- puertas de entrada al sistema
- composición para clientes
- exposición de un backend que ya tiene varios módulos o servicios detrás

Eso ya te dejó una idea muy importante:

> cuando el sistema deja de ser un único backend simple, también cambia la forma sana de exponerlo hacia afuera, porque el cliente no debería cargar con toda la complejidad interna.

Pero apenas varias partes del sistema empiezan a comunicarse entre sí de manera más explícita, aparece otra pregunta igual de importante:

> ¿qué pasa cuando uno de esos contratos internos cambia?

Porque una cosa es tener:

- `orders` hablando con `payments`
- `auth` hablando con `users`
- consumidores de eventos
- webhooks internos
- BFFs
- gateways
- APIs internas entre componentes

Y otra muy distinta es lograr que todo eso pueda **evolucionar** sin que cada cambio rompa medio sistema.

Ahí aparecen conceptos muy importantes como:

- **compatibilidad**
- **versionado interno**
- **evolución de contratos**
- **consumidores y productores**
- **breaking changes internos**
- **migración gradual**
- **coexistencia de formas viejas y nuevas**

Este tema es clave porque, cuando el sistema ya está más distribuido o más desacoplado, los contratos internos empiezan a importar casi tanto como los contratos públicos.

## El problema de pensar que “como es interno, lo puedo cambiar cuando quiera”

Este es uno de los errores más comunes.

Mientras todo vive muy cerca y dentro de la misma app, es fácil sentir que si cambiás algo:

- refactorizás
- recompilás
- corrés tests
- y listo

Pero cuando ya tenés:

- varios módulos con fronteras más serias
- APIs internas
- mensajes
- eventos
- consumidores asíncronos
- BFFs
- servicios separados
- jobs o procesos que dependen de ciertos payloads

la cosa cambia bastante.

Porque ahora un contrato interno puede estar siendo consumido por:

- otro servicio
- otro proceso
- otro equipo
- un consumidor asíncrono
- un frontend específico vía BFF
- un job que procesa mensajes después
- una integración interna menos visible

Entonces aparece una verdad muy importante:

> que algo sea “interno” no significa que sea libre de romperse sin costo.

## Qué significa contrato interno

Dicho simple:

> un contrato interno es cualquier acuerdo técnico entre partes del sistema sobre cómo se intercambian datos, comandos, requests, eventos o respuestas.

Por ejemplo:

- endpoint HTTP entre servicios
- evento publicado a otros consumidores
- payload de una cola
- request/response de un servicio interno
- forma de un mensaje de webhook interno
- estructura esperada por un BFF al consumir un servicio

La idea clave es esta:

> si otra parte del sistema depende de esa forma o semántica, ya hay contrato.

No importa tanto si es público para internet o “solo interno”.
Sigue siendo un contrato.

## Por qué estos contratos se vuelven tan importantes

Porque a medida que el sistema se distribuye más, esas relaciones dejan de resolverse todas por simple compilación conjunta o por cercanía dentro del mismo módulo.

Entonces pueden aparecer cosas como:

- un servicio se deploya antes que otro
- un consumidor viejo sigue escuchando un evento viejo
- un BFF todavía espera cierto campo
- un job interno procesa mensajes con forma anterior
- un equipo cambió un contrato sin coordinar
- un productor ya emite la forma nueva, pero un consumidor aún no migró

Esto muestra muy bien por qué compatibilidad y evolución importan tanto.

## Qué tipo de cambios suelen romper contratos internos

Muy parecido a lo que pasa con APIs públicas, pero con la trampa de que muchas veces se subestima el impacto.

Por ejemplo:

- renombrar campos
- eliminar campos
- cambiar tipos
- cambiar semántica de valores
- alterar estructura JSON
- cambiar nombres de eventos
- cambiar significado de estados
- volver obligatoria una propiedad que antes no existía
- cambiar códigos o respuestas esperadas
- cambiar el orden o timing lógico de un flujo

No todos los cambios rompen.
Pero algunos sí.
Y hay que aprender a distinguirlos.

## Una intuición muy útil

Podés pensar así:

### Cambio compatible
Los consumidores viejos siguen funcionando razonablemente aunque no conozcan la novedad.

### Cambio incompatible
Los consumidores viejos dejan de funcionar o interpretan mal lo que reciben.

Esta distinción sigue siendo igual de valiosa dentro del sistema.

## Un ejemplo simple con JSON interno

Supongamos que un servicio devuelve:

```json
{
  "orderId": 1042,
  "status": "PENDING"
}
```

y otro consumidor interno depende de eso.

Si mañana agregás un campo nuevo:

```json
{
  "orderId": 1042,
  "status": "PENDING",
  "currency": "ARS"
}
```

muchas veces eso puede ser compatible.

Pero si cambiás:

```json
{
  "id": 1042,
  "state": "PENDING"
}
```

ahí podés romper fácilmente al consumidor anterior.

Este patrón vale tanto para APIs internas como para eventos.

## Qué pasa con eventos y mensajería

Acá el tema se vuelve todavía más interesante.

Porque con eventos muchas veces ni siquiera tenés una respuesta inmediata que te deje ver rápido que algo rompió.
Podés tener:

- consumidores atrasados
- mensajes en cola
- consumidores que procesan horas después
- múltiples consumidores con distintas versiones

Entonces cambiar un evento sin pensar compatibilidad puede causar problemas mucho más silenciosos o tardíos.

## Un ejemplo con evento

Supongamos un evento así:

```json
{
  "eventType": "PedidoCreado",
  "orderId": 1042,
  "customerEmail": "gabriel@mail.com"
}
```

y varios consumidores reaccionan a él.

Si mañana decidís reemplazarlo por:

```json
{
  "type": "OrderCreated",
  "id": 1042,
  "email": "gabriel@mail.com"
}
```

puede que varios consumidores queden rotos si todavía esperaban la forma anterior.

Entonces los eventos también necesitan estrategia de evolución.
No son “más libres” solo porque son asíncronos.

## Qué problema aparece con consumidores múltiples

Cuando un productor tiene más de un consumidor, la evolución se vuelve todavía más delicada.

Porque quizás:

- consumidor A puede migrar hoy
- consumidor B recién la semana que viene
- consumidor C ni siquiera está a tu cargo
- consumidor D procesa en batch y no fue actualizado

Entonces la evolución del contrato ya no depende solo de “cambiar y listo”.
Necesita convivencia o transición.

## Una estrategia muy sana: expandir antes de reemplazar

Este patrón suele ser valiosísimo.

En vez de:

- sacar lo viejo y poner lo nuevo de golpe

muchas veces conviene:

1. agregar la nueva forma
2. mantener la anterior un tiempo
3. migrar consumidores
4. deprecar
5. recién después retirar lo viejo si corresponde

Esto baja muchísimo el riesgo de romper flujos internos.

## Un ejemplo práctico

Hoy tenés:

```json
{
  "orderId": 1042,
  "status": "PENDING"
}
```

Y querés pasar a algo más rico:

```json
{
  "orderId": 1042,
  "status": "PENDING",
  "statusDetail": {
    "code": "PENDING",
    "source": "PAYMENTS"
  }
}
```

Muchas veces conviene primero **agregar** `statusDetail` y mantener `status`, en lugar de eliminar `status` enseguida.

Eso permite una migración mucho más sana.

## Qué significa deprecación en contratos internos

Muy parecido a lo público:

> sigue existiendo por ahora, pero ya no es la forma preferida y se planea retirarlo más adelante.

Esto puede aplicarse a:

- campos
- eventos
- endpoints internos
- versiones de payload
- semánticas viejas

Deprecar no es lo mismo que abandonar sin aviso.
Es una herramienta de transición.

## Por qué la transición importa tanto

Porque en sistemas distribuidos o más desacoplados, “todo el mundo se actualiza al mismo tiempo” muchas veces no es verdad.

Y cuanto más asíncrono o más separado esté el sistema, menos conviene asumir despliegue simultáneo perfecto.

Entonces la compatibilidad temporal gana muchísimo valor.

## Qué pasa con versionado interno

Muy buena pregunta.

A veces no alcanza con una transición suave dentro del mismo contrato.
En algunos casos, puede tener sentido una forma más explícita de versionado interno.

Por ejemplo:

- evento `v1` y `v2`
- endpoint interno `/internal/v1/...`
- payloads con `schemaVersion`
- contratos diferenciados en consumidores

No siempre hace falta.
Pero cuando el cambio es grande o claramente incompatible, puede ser una herramienta muy sana.

## Cuándo podría tener sentido versionar

Por ejemplo, cuando:

- el cambio rompe de forma fuerte a consumidores actuales
- hay varios consumidores con ritmos de migración distintos
- la semántica cambió bastante
- coexistir un tiempo es necesario
- no podés coordinar cambio atómico

Otra vez:
no es para usar por deporte.
Es una herramienta cuando el problema real lo pide.

## Qué relación tiene esto con equipos

Muy fuerte.

Si hay varios equipos tocando partes distintas del sistema, la necesidad de claridad y compatibilidad entre contratos internos crece muchísimo.

Porque el productor y el consumidor pueden tener:

- roadmaps distintos
- ritmos de deploy distintos
- ownership distintos
- visibilidad parcial uno del otro

Entonces la compatibilidad deja de ser una cortesía técnica y pasa a ser una necesidad operativa real.

## Qué relación tiene esto con ownership

También importa mucho definir quién es responsable de un contrato interno.

Por ejemplo:

- quién puede cambiarlo
- quién debe avisar
- quién mantiene backward compatibility
- quién define el timeline de deprecación
- quiénes son consumidores conocidos

Si esto no está claro, los contratos internos suelen volverse más frágiles.

## Qué relación tiene esto con el código compartido

A veces el problema de compatibilidad se intenta resolver compartiendo clases o DTOs entre varios servicios o módulos.

Eso puede ayudar en ciertos contextos, pero también puede ocultar el problema o aumentar acoplamiento si no se usa con criterio.

Porque compartir una clase no elimina automáticamente la necesidad de:

- coordinar cambios
- pensar versionado
- entender impacto en consumidores
- distinguir ownership del contrato

Es decir, el problema arquitectónico sigue existiendo aunque la clase sea “la misma”.

## Qué relación tiene esto con la semántica y no solo con la forma

Esto es importantísimo.

A veces no rompés el contrato por renombrar campos, sino por cambiar lo que significan.

Por ejemplo:

- antes `PENDING` quería decir “esperando pago”
- ahora `PENDING` quiere decir “en revisión antifraude”

La estructura JSON puede ser la misma, pero semánticamente cambió muchísimo.

Entonces compatibilidad no es solo formato.
También es significado.

## Un ejemplo muy importante

Supongamos que un consumidor interpreta:

- `APPROVED` = “ya puedo emitir comprobante”

Pero vos cambiaste internamente el significado y ahora `APPROVED` ya no garantiza eso de la misma forma.

Aunque el contrato textual parezca igual, acabás de introducir una incompatibilidad semántica muy seria.

Por eso también conviene documentar muy bien estos cambios.

## Qué relación tiene esto con testing de contrato

Muy fuerte.

A medida que el sistema se distribuye más, empieza a tener muchísimo valor probar no solo lógica interna, sino también que:

- el productor sigue emitiendo lo esperado
- el consumidor sigue entendiendo lo esperado
- los cambios compatibles realmente lo son
- las transiciones no rompen payloads usados

No hace falta meterte ya en toda una teoría formal.
Lo importante es la idea:

> los contratos internos también se testean como contratos, no solo como implementación accidental.

## Qué relación tiene esto con observabilidad

También mucho.

Cuando algo rompe entre servicios o consumidores, necesitás poder ver:

- qué versión o forma de payload se emitió
- quién lo consumió
- qué falló
- desde cuándo
- cuántos eventos quedaron rechazados
- qué integración interna dejó de entender algo

Sin buena visibilidad, las roturas de contratos internos pueden ser difíciles de detectar y localizar.

## Qué relación tiene esto con documentación de decisiones

Muy directa.

A veces vale muchísimo dejar explícito algo como:

- este evento se considera contrato estable para estos consumidores
- este endpoint interno está deprecado
- este campo se mantendrá hasta migrar a todos los consumidores
- esta semántica cambió en tal fecha por tal motivo

Eso evita rediscusiones y ayuda mucho a la evolución del sistema.

## Qué no conviene hacer

No conviene:

- cambiar contratos internos como si nadie dependiera de ellos
- asumir despliegue simultáneo perfecto siempre
- eliminar campos o cambiar semántica sin transición
- usar eventos sin pensar evolución de payloads
- llamar “interno” a algo para justificar romperlo arbitrariamente

Ese tipo de decisiones suele costar bastante cuando el sistema ya tiene varias partes vivas.

## Otro error común

Versionar todo compulsivamente desde el primer día, incluso cambios mínimos compatibles.
Eso también puede sobrecargar el sistema innecesariamente.

## Otro error común

No versionar ni transicionar nunca aunque los cambios sean claramente incompatibles.
Eso suele producir roturas silenciosas o migraciones traumáticas.

## Otro error común

Pensar solo en compatibilidad técnica de formato y olvidar compatibilidad semántica de significado.
Y muchas veces esta segunda es incluso más importante.

## Una buena heurística

Podés preguntarte:

- ¿qué consumidores existen de este contrato?
- ¿qué tan coordinado es su despliegue con el mío?
- ¿este cambio agrega o reemplaza?
- ¿rompe forma, significado o ambos?
- ¿conviene transición, deprecación o versión nueva?
- ¿este contrato interno es más estable de lo que parecía?
- ¿estoy cuidando a los consumidores o asumiendo demasiado?

Responder eso te ayuda muchísimo a madurar la evolución interna del sistema.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque apenas el backend empieza a tener:

- varios servicios
- eventos
- BFFs
- APIs internas
- jobs
- colas
- equipos distintos
- despliegues desacoplados

los contratos internos dejan de ser un detalle invisible y pasan a ser una parte central de la arquitectura viva.

## Relación con Spring Boot

Spring Boot no impide ni resuelve por sí solo estos problemas.
Podés construir contratos internos muy sanos o muy frágiles usando exactamente el mismo framework.

Por eso lo importante acá no es tanto la herramienta, sino el criterio de evolución:

- compatibilidad
- versionado cuando haga falta
- transiciones sanas
- ownership
- tests y visibilidad

Eso es lo que de verdad vuelve más maduro a un backend distribuido.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando varias partes del sistema ya se comunican mediante APIs internas, eventos o mensajes, los contratos internos dejan de ser algo “libre de cambiar” y pasan a necesitar el mismo cuidado básico que un contrato público: compatibilidad razonable, transiciones sanas, deprecación cuando haga falta y atención no solo a la forma del payload, sino también a su semántica real.

## Resumen

- Los contratos internos también son contratos y pueden romper consumidores reales del sistema.
- No conviene asumir que “como es interno” se puede cambiar arbitrariamente sin costo.
- Compatibilidad, deprecación y transición gradual suelen ser mucho más sanas que reemplazo brusco.
- Versionar puede tener sentido cuando el cambio es realmente incompatible y no hay migración atómica.
- La semántica del contrato importa tanto como el formato.
- Testing, observabilidad y ownership ayudan mucho a que estos contratos evolucionen mejor.
- Este tema profundiza una de las madureces clave de sistemas distribuidos: cuidar no solo la comunicación, sino también la evolución de esa comunicación en el tiempo.

## Próximo tema

En el próximo tema vas a ver cómo pensar tolerancia a fallos y degradación razonable en sistemas con varias dependencias, porque una vez que ya hay múltiples contratos y servicios conversando, la pregunta ya no es si algo va a fallar, sino cómo querés que el sistema se comporte cuando eso ocurra.
