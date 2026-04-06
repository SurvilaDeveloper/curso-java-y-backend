---
title: "Idempotencia rota, retries y efectos dobles: cuando reintentar no es inocente"
description: "Cómo entender idempotencia rota, retries y efectos dobles en aplicaciones Java con Spring Boot. Por qué reintentar una operación no siempre es inocente y qué cambia cuando el sistema ejecuta dos veces algo que el negocio esperaba que ocurriera una sola vez."
order: 227
module: "Race conditions, TOCTOU y consistencia bajo concurrencia"
level: "base"
draft: false
---

# Idempotencia rota, retries y efectos dobles: cuando reintentar no es inocente

## Objetivo del tema

Entender por qué la **idempotencia rota**, los **retries** y los **efectos dobles** son una superficie muy importante en aplicaciones Java + Spring Boot, y por qué no alcanza con pensar los reintentos como una mejora inocente de resiliencia o confiabilidad.

La idea de este tema es continuar directamente lo que vimos sobre:

- race conditions
- TOCTOU
- stock, cuotas y recursos exclusivos
- checks de permiso antes de usar el recurso
- y la diferencia entre una validación correcta y una acción que realmente ocurre una sola vez

Ahora toca mirar otra variante muy moderna y muy frecuente del mismo problema:

- retries automáticos
- reenvíos manuales
- doble click del usuario
- reejecución tras timeout
- redelivery de colas
- jobs que vuelven a correr
- callbacks repetidos
- requests repetidas por problemas de red
- procesos que no saben si la operación anterior llegó a completar o no

Y justo ahí aparece una trampa muy común.

Porque el equipo siente:

- “si falla, reintentamos”
- “si no estamos seguros, volvemos a mandar”
- “si el cliente repitió la request, debería ser lo mismo”
- “si el worker reconsume el mensaje, no debería pasar nada raro”

Eso suena muy razonable.
Pero solo es verdad si la operación realmente es **idempotente** o si el sistema tiene mecanismos reales para evitar duplicar efectos.

En resumen:

> idempotencia rota y efectos dobles importan porque una operación que el negocio esperaba que ocurriera una sola vez puede ejecutarse dos veces por retries, repeticiones o incertidumbre de red, y entonces el problema ya no depende solo de dos actores compitiendo, sino de que el mismo flujo se repita sin saber si todavía está produciendo el primer efecto o ya está generando uno nuevo.

---

## Idea clave

La idea central del tema es esta:

> reintentar una operación no es inocente si el sistema no puede garantizar que un segundo intento represente el mismo efecto lógico que el primero.

Eso cambia bastante la manera de diseñar y revisar flujos.

Porque una cosa es pensar:

- “si no responde, mandalo de nuevo”
- “si el worker duda, reintenta”
- “si el usuario no sabe si salió, puede volver a apretar”

Y otra muy distinta es preguntarte:

- “¿qué pasa si el primer intento sí produjo el efecto?”
- “¿qué pasa si el segundo llega cuando el primero todavía está cerrando?”
- “¿qué parte del sistema distingue duplicación legítima de ejecución nueva?”
- “¿qué evidencia existe de que este efecto ya ocurrió?”

### Idea importante

El retry no es solo una estrategia de fiabilidad.
También es una fuente de concurrencia y de duplicación lógica.

### Regla sana

Cada vez que una operación pueda repetirse, preguntate no solo:
- “¿puedo volver a llamarla?”
sino también:
- “¿qué evita que la segunda vez produzca un segundo efecto real?”

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- pensar que retry siempre mejora resiliencia sin costo lógico
- asumir que una operación que “se parece” a la anterior ya es automáticamente idempotente
- no distinguir requests repetidas de operaciones nuevas
- olvidar timeouts, redeliveries y doble submit del mismo actor
- no modelar que una operación puede quedar en estado ambiguo entre “no sé si pasó” y “sí pasó parcialmente”
- tratar efectos dobles como bugs operativos aislados y no como fallas reales de concurrencia y de diseño

Es decir:

> el problema no es solo repetir una llamada.  
> El problema es **qué pasa cuando repetir la llamada vuelve a ejecutar efectos que solo debían ocurrir una vez**.

---

## Error mental clásico

Un error muy común es este:

### “Si algo falla o no responde, lo reintentamos; peor sería no hacerlo”

Eso puede ser razonable para disponibilidad.
Pero puede ser peligroso para consistencia si la operación no tolera duplicación.

Porque todavía conviene preguntar:

- ¿qué pasa si el primer intento sí llegó a persistir?
- ¿qué pasa si el segundo descuento se vuelve real?
- ¿qué pasa si se manda dos veces el webhook?
- ¿qué pasa si el cupón se consume dos veces?
- ¿qué pasa si la segunda ejecución crea otro recurso?
- ¿qué parte del flujo sabe distinguir retry de nueva intención?

### Idea importante

La incertidumbre de red no justifica automáticamente repetir efectos de negocio sin control.

---

# Parte 1: Qué significa “idempotencia”, a nivel intuitivo

## La intuición simple

Podés pensar **idempotencia** como la propiedad de una operación donde repetir el mismo intento lógico no debería cambiar el resultado final más allá del primer efecto válido.

En lenguaje de producto, algo parecido a:

- “si mando esto dos veces por accidente, no quiero dos compras”
- “si el worker procesa el mismo mensaje dos veces, no quiero dos reservas”
- “si el webhook se reenvía, no quiero dos cobros”
- “si el usuario refresca, no quiero dos altas del mismo recurso”

### Idea útil

No hace falta una definición formal sofisticada.
La pregunta práctica es:
- “¿qué pasa si esta operación se ejecuta otra vez con la misma intención lógica?”

### Regla sana

Cada operación sensible debería tener una respuesta clara a:
- “¿qué pasa si se repite?”

---

# Parte 2: Retry no siempre significa duplicación maliciosa

Otra idea importante: no hace falta un atacante para que esto pase.
Las repeticiones salen de muchos lugares normales:

- doble click del usuario
- refresh del navegador
- timeout del cliente
- proxy que reenvía
- load balancer que reintenta
- worker que no confirma a tiempo
- cola que redelivera
- job que vuelve a correr
- servicio externo que no sabe si la entrega anterior se procesó

### Idea útil

La duplicación no es un caso extremo.
Es parte natural de sistemas distribuidos y de interacción real de usuarios.

### Regla sana

No diseñes operaciones críticas bajo la suposición de “esto se llama una sola vez”.

### Idea importante

Lo que parece retry benigno desde infraestructura puede ser doble efecto desde negocio.

---

# Parte 3: Qué tipos de operaciones suelen ser especialmente sensibles

Conviene sospechar más cuando la operación hace cosas como:

- cobrar
- descontar saldo
- consumir stock
- reservar cupo
- crear entidad única
- emitir comprobante
- asignar recurso exclusivo
- activar suscripción
- canjear cupón
- registrar uso único
- mandar comunicación que no debería duplicarse
- cambiar estado con costo real

### Idea útil

Cuanto más irreversibles o caros son los efectos, más crítica se vuelve la idempotencia real del flujo.

### Regla sana

Si el negocio no tolera que pase dos veces, el sistema no puede tratar el retry como detalle secundario.

---

# Parte 4: La gran trampa: no saber si el primer intento llegó o no

Este es uno de los corazones del problema.

Muy seguido el sistema queda en un estado ambiguo:

- el cliente hizo la llamada
- no recibió confirmación clara
- o el worker no sabe si el otro lado procesó
- o la red cortó en el medio
- o el commit ocurrió pero la respuesta no volvió
- o el mensaje se ejecutó pero no quedó marcado como procesado

Entonces el sistema razona:
- “por las dudas, reintentemos”

### Problema

Ese “por las dudas” puede convertirse en:
- segundo cobro
- segundo descuento
- segunda reserva
- segundo alta
- segundo evento irreversible

### Idea importante

La incertidumbre de entrega es una de las fuentes más comunes de efectos dobles.

### Regla sana

Cada vez que el sistema no pueda distinguir entre “no pasó” y “pasó pero no lo sé”, el riesgo de duplicación crece muchísimo.

---

# Parte 5: El mismo actor puede competir consigo mismo

Esto conecta fuerte con el bloque de race conditions.

A veces pensamos concurrencia como:
- dos usuarios distintos
- dos requests de actores distintos

Pero acá también puede haber competencia entre:

- el primer intento y su retry
- una request original y un doble click
- un worker y su redelivery
- un callback y su reenvío
- una operación manual y su replay automático

### Idea útil

La race no siempre es entre personas distintas.
A veces es entre dos versiones de la misma intención lógica corriendo casi juntas o sin una frontera clara entre ellas.

### Regla sana

No modeles duplicación solo como conflicto entre actores.
Modelala también como conflicto entre **repeticiones del mismo flujo**.

### Idea importante

El sistema puede terminar corriéndose a sí mismo desde atrás.

---

# Parte 6: Reintentos automáticos también son policy de negocio, no solo infraestructura

Muchas veces retries viven “abajo”:

- en clients HTTP
- en colas
- en schedulers
- en wrappers de resiliencia
- en gateways
- en SDKs
- en herramientas de mensajería

Y el equipo de negocio casi ni los ve.

### Problema

Eso no les quita impacto.
Un retry de infraestructura puede volver a ejecutar:

- un cobro
- una reserva
- una escritura sensible
- una transición de estado
- una notificación única
- una integración lateral

### Idea importante

La política de retries forma parte del comportamiento del negocio, aunque se configure en capas técnicas.

### Regla sana

Cada vez que una operación sensible tenga retries automáticos, tratá esa policy como parte del diseño funcional, no solo técnico.

---

# Parte 7: Redelivery y colas: “al menos una vez” no es gratis

En mensajería, esta lección es muy importante.

Muchos sistemas aceptan modelos del tipo:

- at least once delivery
- redelivery
- retry on failure
- replay manual

Eso puede ser perfectamente razonable.
Pero exige algo a cambio:

- que el consumidor soporte repeticiones
- o que el efecto de negocio se proteja contra duplicación

### Idea útil

El “al menos una vez” es un contrato de transporte.
No es una garantía de que el negocio soporte ese comportamiento por sí solo.

### Regla sana

Si tu mensajería permite redelivery, la idempotencia deja de ser “nice to have”.
Pasa a ser parte del correctness del sistema.

### Idea importante

Una cola confiable no arregla automáticamente un efecto no idempotente.

---

# Parte 8: Idempotencia rota no siempre significa crear dos filas idénticas

Otra simplificación peligrosa es pensar que duplicación solo significa:

- dos inserts iguales
- dos registros clonados

No siempre es así.
También puede verse como:

- un contador que baja dos veces
- dos mails distintos disparados por la misma intención
- un estado que avanza dos pasos
- dos eventos downstream
- un recurso marcado dos veces de forma incoherente
- una transición irreversible repetida
- un side effect externo multiplicado

### Idea útil

A veces el efecto doble no se ve como duplicado “visible”, pero igual rompe negocio.

### Regla sana

No midas la idempotencia solo por si hay dos filas en la base.
Medila por si la misma intención lógica produce más de un efecto material.

---

# Parte 9: Qué señales indican que un flujo es poco idempotente

Conviene sospechar más cuando veas cosas como:

- POST sensible sin una noción clara de operación única
- workers que reintentan sin marcar bien procesamiento previo
- callbacks que pueden llegar más de una vez
- conciliaciones manuales que vuelven a correr efectos
- lógica “si falla, repetí” sobre operaciones irreversibles
- ausencia de correlación entre intención del negocio y ejecución concreta
- equipos que hablan de retries pero no de duplicación de efectos

### Idea útil

El problema no siempre es que falten transacciones.
A veces falta un modelo claro de “esta intención ya fue consumida”.

### Regla sana

Si el sistema no tiene forma clara de reconocer que un efecto ya ocurrió, probablemente los retries ya son una amenaza.

---

# Parte 10: Qué preguntas conviene hacer en una review

Cuando revises idempotencia, retries y efectos dobles, conviene preguntar:

- ¿qué operación del negocio no debería ocurrir dos veces?
- ¿qué pasa si el request se repite?
- ¿qué pasa si el primer intento sí ejecutó, pero el cliente no lo sabe?
- ¿hay retries automáticos o redelivery?
- ¿qué capa decide reintentar?
- ¿qué evidencia tiene el sistema de que esta intención ya produjo efecto?
- ¿qué síntomas verías si la misma intención corriera dos veces?

### Idea importante

La review buena no termina en:
- “tenemos retry”
Sigue hasta:
- “¿qué protege a esta operación de ejecutarse dos veces bajo incertidumbre?”

---

# Parte 11: Qué revisar en una app Spring

En una app Spring, conviene sospechar especialmente cuando veas:

- endpoints de creación o consumo con efectos irreversibles
- integración con colas o mensajería con redelivery
- wrappers de retry en operaciones de negocio
- jobs que reejecutan tareas sin un modelo claro de deduplicación
- callbacks o webhooks procesados varias veces
- operaciones de pago, stock, saldo, cupones o reservas
- lógica que asume que el request se verá solo una vez

### Idea útil

Si la app puede volver a ver la misma intención lógica más de una vez, ya necesita un modelo serio de idempotencia aunque el código se vea “normal”.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- claridad sobre qué operaciones deben ocurrir una sola vez
- conciencia explícita de retries y redelivery
- menor entusiasmo por reintentar a ciegas efectos irreversibles
- equipos que distinguen transporte repetible de negocio no duplicable
- trazabilidad mejor entre intención lógica y ejecución material

### Idea importante

La madurez aquí se nota cuando el sistema no supone que repetir una llamada es siempre barato o inocente.

---

## Señales de ruido

Estas señales merecen revisión fuerte:

- “si falla, reintentá” como única estrategia
- nadie sabe qué pasa si el primer intento sí llegó
- mensajería con redelivery sobre efectos irreversibles sin diseño claro
- operaciones sensibles que no distinguen retry de solicitud nueva
- el equipo habla de resiliencia, pero no de doble ejecución
- duplicaciones corregidas a mano por soporte o backoffice

### Regla sana

Si el sistema no puede explicar qué evita que la misma intención produzca dos efectos, probablemente todavía no tiene bien resuelta la idempotencia.

---

## Checklist práctica

Para revisar idempotencia rota y retries, preguntate:

- ¿qué intención del negocio no debería ocurrir dos veces?
- ¿qué pasa si la request o el mensaje se repite?
- ¿quién puede reintentar: usuario, cliente HTTP, cola, job, callback?
- ¿qué incertidumbre existe sobre el primer intento?
- ¿qué efecto material podría duplicarse?
- ¿qué parte del flujo trata retry como si fuera gratuito?
- ¿qué evidencia tiene el sistema para reconocer “esto ya pasó”?

---

## Mini ejercicio de reflexión

Tomá un flujo real de tu app Spring y respondé:

1. ¿Qué operación no debería ejecutarse dos veces?
2. ¿Qué actores o capas podrían repetirla?
3. ¿Qué pasa si el primer intento quedó en estado ambiguo?
4. ¿Qué efecto material se duplicaría?
5. ¿Qué parte del equipo sigue viendo esto como “solo resiliencia”?
6. ¿Qué síntoma verías en producción si el efecto doble ya estuviera ocurriendo?
7. ¿Qué revisarías primero después de este tema?

---

## Resumen

La idempotencia rota, los retries y los efectos dobles importan porque en sistemas modernos las operaciones críticas pueden repetirse por causas totalmente normales, y si el backend no distingue bien entre repetir una intención lógica y ejecutar un segundo efecto real, la resiliencia se convierte en duplicación de negocio.

La gran intuición del tema es esta:

- retry no siempre es inocente
- el mismo flujo puede competir consigo mismo
- la incertidumbre sobre el primer intento es una fuente central de duplicación
- “al menos una vez” en transporte no resuelve por sí solo el negocio
- y el problema real no es solo repetir llamadas, sino repetir efectos que debían ocurrir una sola vez

En resumen:

> un backend más maduro no trata los retries, redeliveries y reintentos de usuarios o workers como simples detalles de confiabilidad que pueden agregarse sin más alrededor de cualquier operación, sino como una fuerza que puede romper con mucha facilidad las suposiciones de unicidad, exclusividad o irreversibilidad del negocio si la operación no está preparada para distinguir repetición lógica de ejecución nueva.  
> Entiende que la pregunta importante no es solo si el sistema puede volver a intentar, sino qué impide que ese nuevo intento produzca un segundo efecto material cuando el primero ya ocurrió o todavía está ocurriendo.  
> Y justamente por eso este tema importa tanto: porque muestra otra cara muy moderna de las race conditions, donde la competencia no se da solo entre dos usuarios distintos, sino entre una operación y sus propios reintentos, que es una de las formas más comunes y más traicioneras de romper consistencia sin necesidad de código “visiblemente roto”.

---

## Próximo tema

**Workers, jobs y schedulers compitiendo con requests web**
