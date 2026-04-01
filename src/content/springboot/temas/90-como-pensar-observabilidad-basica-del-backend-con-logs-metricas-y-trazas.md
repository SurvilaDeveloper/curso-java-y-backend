---
title: "Cómo pensar observabilidad básica del backend con logs, métricas y trazas"
description: "Entender por qué un backend Spring Boot en entornos reales necesita algo más que código funcionando, y cómo logs, métricas y trazas ayudan a ver, diagnosticar y operar mejor el sistema cuando aparecen errores, lentitud o comportamientos inesperados."
order: 90
module: "Arquitectura y crecimiento del backend"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo preparar un backend Spring Boot para producción con cosas como:

- configuración por entorno
- secretos
- perfiles
- despliegue
- diferencias entre dev, test y prod
- operación más seria del sistema fuera de local

Eso ya te dejó una idea muy importante:

> un backend real no solo necesita buen diseño interno; también necesita poder ejecutarse de forma más segura, reproducible y controlada en entornos reales.

Pero apenas el sistema empieza a correr de verdad fuera de tu máquina, aparece otra necesidad igual de importante:

> además de correr, el backend tiene que poder **contarte qué está pasando**.

Porque una aplicación real, tarde o temprano, enfrenta cosas como:

- errores raros que no aparecen en local
- requests lentas
- timeouts con terceros
- endpoints que fallan intermitentemente
- webhooks que llegan y no se procesan bien
- jobs que se traban
- picos de tráfico
- integraciones externas que responden mal
- dudas sobre qué paso exacto rompió un flujo

Y si el sistema no te da visibilidad, diagnosticar todo eso se vuelve muchísimo más difícil.

Ahí aparece una dimensión central de los sistemas reales:

- **logs**
- **métricas**
- **trazas**
- y, en general, **observabilidad**

Este tema es clave porque te ayuda a pasar de “la app corre” a “la app se puede entender y operar cuando algo sale mal o empieza a comportarse raro”.

## Qué problema resuelve la observabilidad

Resuelve una pregunta muy concreta:

> ¿cómo sé qué está haciendo el backend y qué le está pasando realmente cuando ya está corriendo en un entorno real?

Porque una vez desplegado, ya no siempre tenés:

- el debugger abierto
- la consola local a mano
- control total sobre el flujo
- facilidad para reproducir exactamente el problema

Entonces necesitás otras formas de mirar el sistema.

Ahí aparecen tres herramientas mentales muy útiles:

### Logs
Te cuentan **eventos** o hechos puntuales que ocurrieron.

### Métricas
Te muestran **mediciones agregadas** del comportamiento del sistema.

### Trazas
Te ayudan a seguir el **recorrido** de una request o flujo a través de varias capas o servicios.

No son lo mismo.
Y entender esa diferencia ayuda muchísimo.

## Qué son los logs

Dicho simple:

> los logs son registros textuales o estructurados de cosas que el sistema fue haciendo o detectando.

Por ejemplo:

- “se inició checkout para pedido X”
- “falló llamada al proveedor Y”
- “webhook recibido con paymentId Z”
- “usuario autenticado”
- “timeout al llamar a storage externo”
- “orden marcada como pagada”

Los logs sirven muchísimo para reconstruir historia y contexto.

## Qué tipo de cosas conviene loguear

Por ejemplo:

- inicio y fin de operaciones importantes
- ids relevantes del dominio
- eventos de integración externa
- fallos técnicos
- validaciones importantes
- estados de workflows sensibles
- reintentos
- errores inesperados
- decisiones relevantes del sistema

No hace falta loguear todo.
Pero sí conviene loguear lo suficiente como para poder entender después qué pasó.

## Qué no conviene hacer con logs

No conviene:

- no loguear nada útil
- loguear demasiado ruido irrelevante
- loguear secretos o datos sensibles
- dejar mensajes ambiguos
- escribir logs imposibles de correlacionar con una entidad o request

La meta no es llenar discos.
La meta es ganar visibilidad útil.

## Un ejemplo de log poco útil

```text
Error al procesar
```

Eso dice muy poco.

## Un ejemplo mucho más útil

```text
Error al iniciar checkout para pedido 1042 con provider MercadoPago: timeout al crear preferencia
```

Eso ya te da:

- contexto
- entidad relevante
- acción
- proveedor
- tipo de fallo

La diferencia es enorme.

## Qué son las métricas

Las métricas son una forma de mirar el sistema más agregadamente.

En vez de contarte un evento puntual, te muestran cosas como:

- cuántas requests llegan
- cuánto tarda cierto endpoint
- cuántos errores hubo
- cuántos webhooks fallaron
- cuántos timeouts hubo contra un proveedor
- cuántos pagos quedaron pendientes
- cuántos jobs se procesaron

Es decir:

> las métricas te ayudan a ver patrones, volúmenes y tendencias, no solo casos aislados.

## Un ejemplo mental muy útil

Podés pensar así:

- un log te cuenta “qué pasó en este caso”
- una métrica te cuenta “qué viene pasando en general”

Ambas son valiosas, pero no reemplazan lo mismo.

## Qué son las trazas

Las trazas son especialmente útiles cuando querés seguir un flujo a través de varios pasos o componentes.

Por ejemplo, una sola request puede atravesar:

- controller
- service
- repository
- gateway externo
- listener
- otro servicio
- webhook posterior
- job asíncrono

La traza ayuda a seguir ese recorrido como una historia más conectada.

Esto se vuelve todavía más importante cuando el sistema crece o se distribuye más.

## Una intuición muy útil

Podés pensar así:

### Log
“Pasó esto”

### Métrica
“Está pasando esto con esta frecuencia o este volumen”

### Traza
“Así fue el recorrido de este flujo a través del sistema”

Esa diferencia vale muchísimo.

## Por qué la observabilidad importa tanto cuando el backend crece

Porque a esta altura del recorrido ya probablemente tenés cosas como:

- auth
- JWT
- frontend real
- payments
- storage
- emails
- webhooks
- integraciones externas
- tareas desacopladas
- varios módulos
- múltiples estados del dominio

Y cuanto más grande y conectado es el backend, más difícil es diagnosticarlo solo “leyendo el código”.

Necesitás poder mirar el sistema en movimiento.

## Qué problema aparece si no tenés buena observabilidad

Pueden pasar cosas como:

- sabés que “falló algo”, pero no dónde
- el usuario dice que checkout quedó colgado y no podés seguir la pista
- payments tiene pendientes raros y no sabés qué webhook faltó
- storage devuelve errores esporádicos y no tenés datos de frecuencia
- un endpoint está lento, pero no sabés si por DB, terceros o lógica interna
- reintentos están ocurriendo, pero nadie lo ve
- un cambio empeoró la latencia y no lo detectás a tiempo

Es decir, el backend se vuelve mucho más opaco.

## Qué relación tiene esto con logs de negocio y logs técnicos

Muy buena pregunta.

No todos los logs cumplen el mismo rol.

### Logs técnicos
Hablan más de:
- errores
- timeouts
- excepciones
- status HTTP
- problemas de infraestructura

### Logs de negocio
Hablan más de:
- pedido creado
- pago aprobado
- webhook recibido
- usuario registrado
- archivo eliminado
- cambio de estado relevante

Ambos son importantes.
Y muchas veces se complementan muy bien.

## Un ejemplo claro

Supongamos un flujo de pago.

Podrías querer logs como:

### Negocio
- “Se inició checkout para pedido 1042”
- “Se recibió webhook payment.updated para externalPaymentId=abc123”
- “Pedido 1042 marcado como PAGADO”

### Técnico
- “Timeout al invocar PaymentGateway”
- “Provider respondió 500”
- “No se pudo deserializar payload del webhook”

Juntos te cuentan mucho mejor lo que pasa.

## Qué conviene incluir en un buen log

Muchas veces ayuda bastante incluir:

- acción
- entidad relevante
- id o referencia útil
- resultado
- error si aplica
- proveedor o integración si aplica
- contexto suficiente para correlacionar

Por ejemplo:

- pedidoId
- paymentAttemptId
- externalPaymentId
- userId
- email no sensible si corresponde y es apropiado
- provider
- nombre del caso de uso

No siempre todo junto, claro.
Pero conviene pensar los logs como piezas para investigar luego.

## Qué relación tiene esto con IDs de correlación

Muy fuerte.

Una de las cosas más útiles cuando el sistema crece es poder asociar varios logs a la misma request o flujo.

Por ejemplo:

- entra request HTTP
- pasa por auth
- pasa por checkout
- llama a proveedor externo
- falla o responde
- se registra error

Si todos esos logs comparten una referencia común, seguir el hilo se vuelve muchísimo más fácil.

No hace falta en este tema meternos a implementar todo un sistema de correlation IDs.
Pero sí conviene entender su enorme valor.

## Qué relación tiene esto con integraciones externas

Absolutamente central.

Porque muchas veces lo más difícil de diagnosticar en producción no es la lógica local pura, sino cosas como:

- cuándo le pegaste al proveedor
- con qué duración
- con qué resultado
- cuántos timeouts hubo
- si hubo retry
- si el webhook llegó
- si el proveedor contestó raro

Acá la observabilidad se vuelve una herramienta de supervivencia.

## Un ejemplo muy claro con pagos

Supongamos que un usuario dice:
“me cobraron pero la orden quedó pendiente”.

Sin buena observabilidad, esa frase puede ser una pesadilla.

Con mejor visibilidad podrías reconstruir algo como:

- se inició checkout
- el provider devolvió referencia tal
- llegó webhook tal
- falló procesamiento por tal motivo
- el retry ocurrió dos veces
- la orden quedó pendiente porque faltó confirmar tal paso

Fijate la diferencia enorme entre:

- adivinar
- y poder reconstruir historia real

## Qué relación tiene esto con webhooks

También muy fuerte.

Los webhooks son especialmente sensibles porque:

- llegan desde afuera
- pueden repetirse
- pueden fallar
- actualizan estado interno
- a veces traen poco contexto

Entonces conviene muchísimo loguear cosas como:

- qué webhook llegó
- qué proveedor lo mandó
- con qué id externo
- si pasó validación de autenticidad
- si se procesó o se descartó
- si era repetido
- qué entidad local tocó

Eso hace una diferencia enorme para debugging.

## Qué relación tiene esto con métricas de performance

Muy importante.

Porque no alcanza con saber si “el backend funciona”.
También importa saber:

- cuánto tarda
- qué endpoints son más lentos
- si la latencia subió
- cuántos errores por minuto hay
- qué proveedor externo está degradando
- cuántos requests por segundo tenés
- cuántos jobs o webhooks se procesan

Estas métricas te ayudan a detectar problemas antes de que todo explote o se haga muy visible para usuarios.

## Un ejemplo mental de métricas útiles

Por ejemplo:

- cantidad de requests por endpoint
- latencia promedio o percentiles
- cantidad de errores 5xx
- cantidad de 401/403 si auth es importante
- timeouts de integraciones externas
- cantidad de webhooks recibidos y fallidos
- cantidad de pagos pendientes demasiado tiempo
- cantidad de reintentos

No hace falta instrumentar mil cosas el primer día.
Pero sí conviene empezar con unas pocas bien elegidas.

## Qué relación tiene esto con trazas cuando el sistema todavía no está súper distribuido

Mucha gente piensa que las trazas solo importan con microservicios.
Pero incluso en un backend monolítico ya puede ayudarte mucho pensar en el recorrido de un flujo:

- request
- auth
- dominio
- gateway externo
- persistencia
- notificación
- respuesta

La mentalidad de seguir flujos completos ya aporta valor aunque todavía no tengas 20 servicios distribuidos.

## Qué relación tiene esto con errores inesperados

Muy fuerte.

Cuando algo explota en producción, normalmente querés saber:

- en qué endpoint o flujo fue
- con qué entidad
- bajo qué contexto
- con qué excepción
- si fue aislado o repetido
- qué venía pasando antes

Sin logs razonables, el error puede quedar reducido a:

- “500 en prod”

Y eso casi nunca alcanza.

## Qué relación tiene esto con observabilidad de negocio

También es una dimensión muy valiosa.

No solo importa el estado técnico del sistema.
A veces también importan preguntas como:

- cuántos pedidos se crean
- cuántos pagos quedan pendientes
- cuántos registros se completan
- cuántas recuperaciones de contraseña fallan
- cuántas imágenes se suben
- cuántos emails se intentan y cuántos fallan

Esto te da una mirada más cercana al producto y no solo a la infraestructura.

## Qué no conviene loguear

Este punto es muy importante.

No conviene loguear:

- passwords
- JWTs completos
- secrets
- API keys
- datos extremadamente sensibles sin necesidad
- información personal que no haga falta
- payloads completos si contienen material sensible

La observabilidad no debería romper la seguridad ni la privacidad.

Este equilibrio es clave.

## Un error muy común

Pensar que “más logs = mejor”.

No necesariamente.

Si logueás sin criterio, podés terminar con:

- muchísimo ruido
- difícil lectura
- costos innecesarios
- señales valiosas enterradas
- mayor riesgo de exponer datos que no deberías

La meta es **visibilidad útil**, no ruido masivo.

## Otro error común

No loguear nada importante por miedo a ensuciar.
Eso después deja al sistema casi ciego cuando algo falla.

Otra vez:
la clave está en el criterio.

## Otro error común

Depender solo de logs y no mirar métricas.
Los logs cuentan historias puntuales, pero las métricas te muestran tendencias y volumen.
Ambas cosas se necesitan.

## Otro error común

No relacionar logs con entidades o ids relevantes.
Eso vuelve casi imposible reconstruir flujos reales.

## Una buena heurística

Podés preguntarte:

- si este flujo falla en producción, ¿qué me gustaría ver?
- si este endpoint se pone lento, ¿cómo lo sabría?
- si el proveedor externo empieza a fallar, ¿cómo lo detecto?
- si llega un webhook duplicado, ¿cómo lo reconstruyo?
- ¿qué identificador usaría para seguir esta operación de punta a punta?

Responder estas preguntas te guía muchísimo sobre qué instrumentar.

## Qué relación tiene esto con Spring Boot

Muy fuerte.

Spring Boot encaja muy bien con una evolución gradual hacia mejor observabilidad porque te permite:

- trabajar bien con logging
- estructurar mejor componentes instrumentables
- exponer o pensar métricas
- organizar mejor la operación del backend

No hace falta que el salto sea gigantesco de un día para el otro.
Podés empezar por una observabilidad básica pero muy útil.

## Qué significa “observabilidad básica” en este tema

No significa tener desde mañana una plataforma monstruosa.

Significa algo mucho más sano y gradual:

- logs razonables y útiles
- algunas métricas importantes
- capacidad de seguir flujos críticos
- visibilidad sobre integraciones sensibles
- señales para detectar errores o lentitud

Con eso ya podés mejorar muchísimo la operabilidad del backend.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque en una aplicación real el sistema no se evalúa solo por cómo se ve el código.
También importa mucho:

- si podés operarlo
- si podés entenderlo cuando falla
- si detectás degradaciones
- si distinguís problemas de DB, auth o integraciones externas
- si podés reconstruir un caso del usuario con datos reales

Ahí la observabilidad deja de ser opcional.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando un backend Spring Boot ya corre en entornos reales, logs, métricas y trazas dejan de ser adornos y pasan a ser herramientas clave para entender qué está haciendo el sistema, detectar lentitud o fallos y poder operar integraciones, webhooks, pagos y flujos críticos con mucha más visibilidad y mucho menos adivinanza.

## Resumen

- La observabilidad ayuda a ver qué está haciendo el backend una vez que ya corre en serio fuera de local.
- Logs, métricas y trazas resuelven problemas distintos y se complementan.
- Logs útiles necesitan contexto, ids relevantes y mensajes claros.
- Las métricas ayudan a ver volumen, latencia, errores y tendencias.
- Integraciones externas, pagos y webhooks hacen que la observabilidad sea todavía más importante.
- No conviene ni no loguear nada importante ni loguear todo sin criterio.
- Este tema marca un paso fundamental hacia un backend que no solo funciona, sino que también puede ser entendido y operado cuando algo sale mal.

## Próximo tema

En el próximo tema vas a ver cómo pensar salud, readiness, liveness y checks básicos del backend, porque una vez que ya querés observar el sistema, también necesitás que el sistema pueda declarar razonablemente si está vivo, listo o degradado.
