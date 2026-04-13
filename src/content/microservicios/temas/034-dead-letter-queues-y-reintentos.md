---
title: "Dead letter queues y reintentos"
description: "Cómo manejar fallas repetidas en consumidores de mensajes usando estrategias de reintento y dead letter queues sin bloquear ni degradar el sistema."
order: 34
module: "Módulo 8 · Comunicación asincrónica"
level: "intermedio"
draft: false
---

# Dead letter queues y reintentos

Una vez que una arquitectura empieza a usar mensajería, aparece una situación inevitable: algunos mensajes fallan.

A veces fallan por un problema transitorio:

- una dependencia responde lento,
- una base está momentáneamente caída,
- un servicio externo devuelve error,
- el consumidor se reinicia,
- o hay un corte breve de red.

Otras veces fallan por un problema lógico o permanente:

- el mensaje tiene un formato inválido,
- contiene datos imposibles de procesar,
- refiere a una entidad inexistente,
- o el código del consumidor no sabe tratar ese caso.

Si el sistema trata ambos tipos de falla exactamente igual, termina siendo frágil.

En NovaMarket, esto se vuelve concreto cuando `notification-service` consume eventos de `order-service`. Si una notificación falla una vez, probablemente convenga reintentar. Pero si el mismo mensaje falla una y otra vez, no queremos bloquear indefinidamente la cola principal ni degradar todo el flujo del sistema.

Ahí entran dos conceptos fundamentales:

- **reintentos**,
- **dead letter queues**.

---

## Por qué no alcanza con “intentar una vez”

En sistemas distribuidos, asumir que todo va a funcionar al primer intento no es realista.

Muchas fallas son transitorias.

Por ejemplo:

- el servicio externo tarda más de lo habitual,
- la conexión se corta brevemente,
- una dependencia se reinicia,
- el nodo del consumidor cambia,
- o el broker vuelve a entregar el mensaje luego de una interrupción.

Si descartáramos cada mensaje al primer error, perderíamos resiliencia innecesariamente.

Por eso los reintentos tienen valor: dan una nueva oportunidad cuando el problema probablemente no sea permanente.

---

## Qué es un reintento

Un reintento es un nuevo intento de procesar el mismo mensaje luego de un fallo.

Pero reintentar no significa “repetir sin límite”.

Un buen diseño de reintentos debería definir al menos:

- cuántas veces reintentar,
- con qué espera entre intentos,
- qué tipos de error justifican retry,
- cuándo dejar de insistir,
- y qué hacer con el mensaje si ya no puede procesarse razonablemente.

---

## Qué pasa si se reintenta sin estrategia

Reintentar de forma descontrolada puede empeorar el sistema.

Por ejemplo:

- multiplicar la presión sobre una dependencia caída,
- saturar logs con errores repetidos,
- mantener ocupados consumidores con mensajes imposibles,
- bloquear el avance de otros mensajes útiles,
- provocar loops de procesamiento sin salida.

El objetivo no es reintentar siempre. El objetivo es **reintentar con criterio**.

---

## Cuándo conviene reintentar

Tiene sentido reintentar cuando la causa del error parece transitoria.

Ejemplos:

- timeout hacia un servicio externo,
- error temporal de red,
- indisponibilidad momentánea de una dependencia,
- throttling ocasional,
- caída breve de una base o caché.

En cambio, reintentar rara vez ayuda si el problema es estructural o de datos.

Ejemplos:

- JSON inválido,
- campo obligatorio ausente,
- referencia a una orden inexistente,
- violación de una regla de negocio permanente,
- código que nunca podría procesar ese mensaje correctamente.

En esos casos, insistir no resuelve nada.

---

## Dead letter queue

Una **dead letter queue** o **DLQ** es una cola donde terminan los mensajes que no pudieron procesarse correctamente bajo la política definida.

No es una basura inútil. Es un mecanismo de aislamiento y diagnóstico.

Sirve para que:

- la cola principal siga avanzando,
- el mensaje fallido no se reprocese infinitamente,
- el sistema conserve el mensaje para análisis,
- y el equipo pueda inspeccionarlo o reprocesarlo con otra estrategia.

---

## Idea central de una DLQ

La idea es sencilla:

1. el mensaje entra por una cola principal,
2. el consumidor intenta procesarlo,
3. si falla, puede reintentarse según la política,
4. si supera el límite o cae en una condición terminal,
5. se envía a una dead letter queue.

De ese modo, el sistema separa claramente dos cosas:

- mensajes todavía recuperables,
- mensajes que necesitan tratamiento especial.

---

## Aplicación en NovaMarket

Supongamos este escenario:

`order-service` publica `OrderCreatedEvent` y `notification-service` intenta enviar una notificación externa.

### Caso A: falla transitoria

El proveedor de email responde con timeout.

Estrategia razonable:

- reintentar dos o tres veces,
- con una breve espera entre intentos,
- y si luego sigue fallando, enviar a DLQ.

### Caso B: error permanente

El evento llega sin un campo indispensable o con una estructura inválida.

Estrategia razonable:

- no insistir indefinidamente,
- enviar rápido a DLQ,
- registrar el problema,
- y permitir revisión.

---

## Reintentos inmediatos vs diferidos

No todos los reintentos son iguales.

### Reintento inmediato

Se vuelve a intentar casi enseguida.

Ventajas:

- simple,
- útil si el error fue muy breve,
- no requiere tanta infraestructura adicional.

Desventajas:

- si la dependencia sigue caída, solo repetís el problema,
- puede aumentar presión sobre el sistema,
- puede hacer que el consumidor quede “pegado” a un mensaje problemático.

### Reintento diferido

Se espera un tiempo antes del nuevo intento.

Ventajas:

- da margen a que se recupere la dependencia,
- reduce tormentas de reintentos,
- permite políticas más controladas.

Desventajas:

- requiere diseñar mejor la topología o la lógica de reprogramación.

---

## Backoff

Una técnica muy útil es el **backoff**, es decir, aumentar progresivamente la espera entre reintentos.

Ejemplo:

- primer retry a los 2 segundos,
- segundo retry a los 10 segundos,
- tercero a los 30 segundos.

Eso ayuda a no castigar constantemente a una dependencia que ya está fallando.

---

## Por qué la DLQ no reemplaza la observabilidad

Mandar un mensaje a dead letter queue no resuelve el problema de fondo. Solo evita que el problema se propague y quede oculto dentro del flujo principal.

Si usás DLQ, también necesitás:

- logs claros,
- métricas sobre mensajes fallidos,
- contexto de error,
- datos suficientes para analizar qué pasó,
- y una estrategia humana o automatizada para revisar esos mensajes.

Una DLQ sin visibilidad termina siendo un depósito silencioso de errores.

---

## Qué información conviene conservar

Cuando un mensaje termina en DLQ, conviene poder recuperar:

- payload original,
- identificador de evento,
- cola de origen,
- cantidad de intentos,
- timestamp,
- tipo de excepción,
- mensaje técnico del error,
- y metadatos útiles para correlacionar con logs y trazas.

Eso facilita muchísimo el diagnóstico posterior.

---

## Reintentos e idempotencia

Los reintentos solo son seguros si el procesamiento está bien pensado frente a repetición.

Por eso este tema está íntimamente conectado con la clase anterior.

Si el consumidor no es idempotente, un retry puede duplicar efectos del negocio.

Por ejemplo:

- enviar dos notificaciones,
- registrar dos auditorías,
- disparar dos integraciones externas,
- o dejar el sistema en un estado ambiguo.

Entonces, el orden lógico de pensamiento es:

1. diseñar idempotencia,
2. definir estrategia de retry,
3. decidir cuándo derivar a DLQ.

---

## Cuándo derivar a DLQ

No hay un número universal de intentos. Depende del dominio y de la criticidad del flujo.

Pero sí conviene decidir explícitamente criterios como:

- cantidad máxima de reintentos,
- errores recuperables y no recuperables,
- tiempo máximo razonable de insistencia,
- impacto sobre la cola principal,
- urgencia del procesamiento.

En NovaMarket, una notificación fallida puede tolerar algún retraso. En cambio, un mensaje central para reserva de stock o compensación de una saga podría requerir una estrategia mucho más cuidada.

---

## Anti-patrones comunes

### Reintento infinito

Si un mensaje nunca puede procesarse, el sistema queda atrapado.

### Una única política para todos los errores

No tiene sentido tratar igual un timeout transitorio y un mensaje malformado.

### Ocultar silenciosamente el fallo

Mandar a DLQ sin registrar contexto hace muy difícil operar el sistema.

### Bloquear el flujo principal por un mensaje problemático

Una cola principal no debería quedar paralizada por un caso patológico sin tratamiento.

### No pensar cómo se reanalizan los mensajes en DLQ

Si nadie revisa ni reprocesa, la DLQ se vuelve un cementerio de mensajes.

---

## Estrategia didáctica para NovaMarket

En el proyecto del curso, una estrategia razonable sería:

- `order-service` publica `OrderCreatedEvent`,
- `notification-service` consume el mensaje,
- si el procesamiento falla por un problema transitorio, se reintenta,
- si supera el límite, el mensaje va a DLQ,
- el flujo principal de órdenes no queda bloqueado,
- y el error queda observable para revisión posterior.

Eso deja un escenario muy realista para explicar:

- robustez,
- aislamiento de fallas,
- observabilidad,
- idempotencia,
- y operación posterior al error.

---

## Relación con la confiabilidad del sistema

Una arquitectura madura no se mide por la cantidad de mensajes que procesa en el camino feliz, sino por cómo se comporta cuando algo sale mal.

Los reintentos aportan tolerancia a fallas transitorias.

Las dead letter queues aportan aislamiento, diagnóstico y continuidad operativa cuando el problema no puede resolverse automáticamente.

Juntas, estas dos herramientas ayudan a que la mensajería no sea solo “asincronía”, sino una parte realmente robusta de la arquitectura.

---

## Cierre

En sistemas distribuidos, algunos mensajes fallan y eso es normal. Lo importante no es fingir que no va a pasar, sino diseñar una estrategia clara para reaccionar.

Los **reintentos** sirven para dar una nueva oportunidad a errores recuperables.

Las **dead letter queues** sirven para sacar de circulación mensajes que ya no conviene seguir intentando en la cola principal, sin perderlos ni volver el sistema opaco.

En NovaMarket, estas piezas van a ser fundamentales para que la comunicación asincrónica siga siendo operable y segura incluso cuando `notification-service` no pueda procesar siempre los eventos a la primera.

En la próxima clase vamos a pasar a otro tema clave de arquitectura distribuida: por qué en microservicios conviene pensar en **una base de datos por servicio** en lugar de centralizar todo en un único esquema compartido.
