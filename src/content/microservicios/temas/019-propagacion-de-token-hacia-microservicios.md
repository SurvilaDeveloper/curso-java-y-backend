---
title: "Propagación de token hacia microservicios"
description: "Cómo hacer que la identidad autenticada viaje desde el gateway hacia los servicios internos de NovaMarket, qué resuelve el token relay y qué riesgos aparecen al propagar tokens entre componentes distribuidos."
order: 19
module: "Módulo 5 · Seguridad en microservicios"
level: "intermedio"
draft: false
---

# Propagación de token hacia microservicios

En la clase anterior incorporamos **Keycloak** a la arquitectura de NovaMarket y dejamos al gateway en una posición central para validar tokens emitidos por un proveedor de identidad real.

Pero aparece una pregunta importante casi de inmediato:

**¿qué pasa con la identidad del usuario después de que el request entra al gateway?**

Si el gateway autentica el request y luego llama a otros servicios internos, esos servicios necesitan saber si:

- hay un usuario autenticado,
- quién es,
- qué roles o permisos tiene,
- y si deben confiar o no en esa identidad.

Eso nos lleva a un tema clave de la seguridad distribuida: la **propagación del token**.

---

## Qué significa propagar un token

Propagar un token significa que el token que llegó con el request original no se queda solo en el primer componente que lo recibe, sino que puede acompañar la llamada hacia servicios internos.

Un ejemplo típico en NovaMarket sería este:

1. el cliente llama a `api-gateway`,
2. el request incluye un `Authorization: Bearer ...`,
3. el gateway valida el token,
4. el gateway reenvía la llamada a `order-service`,
5. `order-service` puede recibir también el token del usuario.

En ese caso, la identidad viaja con la request a través de varias capas del sistema.

---

## Por qué esto importa tanto

Porque en una arquitectura distribuida no alcanza con saber que “el request pasó por el gateway”.

Los microservicios internos pueden necesitar información de identidad para varias cosas:

- registrar qué usuario creó una orden,
- aplicar autorización basada en roles,
- llamar a otros servicios conservando contexto,
- registrar auditoría,
- o tomar decisiones de negocio relacionadas con el actor autenticado.

Si el token no se propaga y tampoco existe otro mecanismo claro de identidad, los servicios internos quedan ciegos frente al usuario real.

---

## Qué problema resuelve el token relay

Una estrategia común es usar **token relay**.

La idea es simple:

- el gateway recibe el token,
- lo valida,
- y al reenviar la request hacia un servicio downstream, también reenvía el token.

Eso evita que el gateway tenga que inventar una identidad nueva o reemplazar el contexto del usuario por algo artificial.

En otras palabras, el token relay permite conservar el **contexto de autenticación original** cuando el tráfico se mueve dentro del sistema.

---

## Un ejemplo dentro de NovaMarket

Supongamos este flujo:

1. un usuario autenticado envía `POST /api/orders`,
2. la request entra al `api-gateway`,
3. el gateway valida el JWT emitido por Keycloak,
4. la request se enruta a `order-service`.

Ahora hay dos posibilidades.

### Escenario A: no se propaga el token

`order-service` recibe la request sin la cabecera `Authorization`.

Entonces podría pasar que:

- no sepa quién hizo la operación,
- no pueda aplicar reglas basadas en roles,
- no tenga cómo validar contexto de seguridad,
- o dependa de que el gateway le agregue datos alternativos poco confiables.

### Escenario B: sí se propaga el token

`order-service` recibe el JWT original.

Entonces puede:

- validar identidad,
- leer claims,
- aplicar autorización,
- registrar el `userId` o el `preferred_username`,
- y seguir operando con contexto real del usuario.

Ese es el escenario que nos interesa consolidar en el curso.

---

## Propagación no significa confiar ciegamente

Acá hay una advertencia muy importante.

El hecho de que el gateway reenvíe el token no significa que los servicios internos deban aceptarlo sin cuestionarlo.

De hecho, una arquitectura madura asume que:

- cada servicio importante debe poder validar el token por sí mismo,
- o al menos operar bajo reglas de confianza claramente definidas.

Si un servicio acepta cualquier request solo porque “vino del gateway”, la seguridad queda demasiado concentrada en un único punto.

Eso puede ser útil en prototipos muy simples, pero es frágil para una arquitectura más seria.

Por eso esta clase se conecta directamente con la siguiente, donde vamos a convertir microservicios en **resource servers**.

---

## Cuándo conviene propagar el token original

En NovaMarket, propagar el token original tiene mucho sentido cuando queremos mantener el contexto del usuario.

Por ejemplo:

- `order-service` necesita saber quién creó la orden,
- `inventory-service` podría auditar qué actor ejecutó una reserva manual,
- endpoints administrativos pueden depender de roles presentes en el JWT.

En todos esos casos, el token del usuario es información útil y relevante.

---

## Cuándo hay que tener cuidado

No toda llamada interna debería hacer circular el token del usuario automáticamente sin reflexión.

Algunos casos merecen atención especial.

### 1. Llamadas técnicas entre servicios

A veces un servicio llama a otro no en nombre del usuario, sino como parte de una tarea interna.

Por ejemplo:

- reprocesos,
- tareas programadas,
- reintentos automáticos,
- consumo de eventos asincrónicos.

En esos escenarios, quizá no tenga sentido propagar el token original del usuario porque la acción ya no representa una interacción directa del cliente.

### 2. Exposición innecesaria de credenciales

Mientras más componentes vean el token, mayor es la superficie donde podría filtrarse por error.

Por eso conviene:

- no loguearlo,
- no almacenarlo innecesariamente,
- no incluirlo en eventos,
- no enviarlo a servicios que no lo necesitan.

### 3. Confusión entre identidad del usuario e identidad del sistema

No es lo mismo:

- “el usuario pidió crear una orden”
- que “notification-service está procesando un evento interno”.

En el primer caso tiene sentido que viaje la identidad del usuario.
En el segundo, quizá conviene otro modelo de autenticación o directamente no propagar el JWT original.

---

## Qué información útil puede aprovechar un microservicio cuando recibe el token

Si el token llega correctamente a `order-service`, ese servicio puede usarlo para:

- saber quién ejecutó la operación,
- poblar un campo `userId` en la orden,
- distinguir si el usuario es admin o usuario común,
- restringir consultas a recursos propios,
- registrar auditoría funcional.

Por ejemplo, una orden puede quedar asociada al usuario autenticado sin necesidad de que el cliente envíe manualmente un `userId` en el body.

Eso es muy valioso, porque evita confiar en datos que el cliente podría intentar falsificar.

---

## Un error muy común: reenviar identidad por headers inventados

Cuando alguien no quiere trabajar con JWT entre servicios, a veces intenta resolverlo con algo como esto:

- el gateway lee el token,
- extrae el username,
- agrega un header tipo `X-User: gabriel.user`,
- y el servicio interno confía en ese header.

Eso puede parecer práctico, pero introduce problemas importantes.

### Problema 1

Ese header no es una credencial fuerte por sí mismo.

### Problema 2

El servicio downstream ya no tiene la firma ni las garantías del token emitido por Keycloak.

### Problema 3

La validación de identidad queda demasiado implícita y frágil.

Los headers derivados pueden usarse en casos muy específicos y controlados, pero no deberían reemplazar de manera ingenua a la identidad firmada y verificable.

---

## Diferencia entre propagación síncrona y asincrónica

Hasta ahora estamos hablando de requests HTTP entre servicios.

Ahí la propagación del token es relativamente natural: entra en la request, se reenvía en la request siguiente.

Pero cuando entremos en mensajería asincrónica con RabbitMQ, la situación cambia.

Un evento no siempre debería transportar el JWT del usuario. De hecho, muchas veces **no conviene** hacerlo.

¿Por qué?

Porque:

- el evento puede durar más que la vida útil del token,
- el consumidor puede procesarlo mucho después,
- y el contexto de negocio del evento puede no requerir la credencial completa del usuario.

Por eso es importante separar dos ideas:

- identidad para requests sincrónicas,
- contexto funcional para eventos asincrónicos.

---

## Qué pasa si `order-service` llama a `inventory-service`

Este caso es excelente para pensar la propagación con un poco más de profundidad.

Supongamos el flujo:

1. el usuario llama al gateway,
2. el gateway reenvía a `order-service` con el token,
3. `order-service` llama a `inventory-service`.

Acá surgen preguntas interesantes:

- ¿`inventory-service` necesita conocer al usuario?
- ¿esa llamada representa al usuario o al sistema?
- ¿conviene propagar el mismo token una vez más?

La respuesta depende del diseño.

### Opción 1: sí, se propaga

Tiene sentido si `inventory-service` necesita aplicar reglas basadas en identidad o registrar auditoría del actor final.

### Opción 2: no necesariamente

Tiene sentido si `inventory-service` solo cumple una validación técnica interna y no necesita operar en nombre directo del usuario.

En el curso, lo más didáctico es empezar con una regla clara:

- el gateway puede propagar el token hacia el servicio que atiende la request principal,
- y luego evaluamos con cuidado si conviene seguir propagándolo a otras capas.

---

## Beneficios reales de la propagación correcta

### 1. Trazabilidad de actor

Se puede saber quién hizo qué dentro del sistema.

### 2. Menos datos sensibles enviados por el cliente

El cliente no necesita mandar manualmente identificadores del usuario para que el backend los crea.

### 3. Autorización más consistente

Los servicios pueden leer roles y claims directamente del token.

### 4. Mejor alineación con una arquitectura segura

La identidad no se reinventa en cada componente, sino que se conserva y se valida.

---

## Riesgos reales de una propagación mal diseñada

### 1. Token forwarding indiscriminado

Reenviar el token a cualquier servicio aunque no lo necesite.

### 2. Filtrado accidental por logs

Registrar headers completos o tokens enteros en logs.

### 3. Confusión de contexto

No distinguir cuándo una acción representa al usuario y cuándo representa a un proceso interno.

### 4. Dependencia excesiva del gateway

Asumir que, porque el gateway validó el token, ya no hace falta seguridad propia en los servicios.

---

## Cómo se conecta esto con NovaMarket

Dentro del proyecto del curso, esta clase tiene una consecuencia muy concreta.

A partir de ahora, cuando un usuario autenticado cree una orden:

- la identidad no debería perderse al pasar por el gateway,
- `order-service` debería poder saber quién ejecutó la operación,
- y el diseño del sistema debería preservar el contexto del request de forma consistente.

Eso no solo mejora la seguridad. También mejora el modelo funcional.

Porque una orden ya no es “algo creado por un cliente anónimo que manda datos arbitrarios”, sino una operación asociada a una identidad verificable.

---

## Qué vamos a hacer en la siguiente clase

Ya entendimos por qué importa propagar el token. Ahora necesitamos consolidar la otra mitad del modelo:

**hacer que los microservicios internos sepan validar ese token por sí mismos.**

Eso nos lleva al concepto de **resource server** dentro de cada microservicio.

Cuando `order-service` y otros servicios puedan validar JWT emitidos por Keycloak:

- la arquitectura gana autonomía,
- la seguridad deja de depender solo del gateway,
- y cada servicio puede proteger sus propios recursos con más claridad.

---

## Cierre

La propagación de token es una pieza clave de la seguridad distribuida porque evita que la identidad del usuario se pierda al atravesar varios componentes del sistema.

En NovaMarket, esto nos permite pasar de un gateway que simplemente “deja pasar” requests autenticados a una arquitectura donde la identidad puede seguir acompañando el flujo funcional.

Pero propagar no es lo mismo que resolver todo.

Hay que hacerlo con criterio:

- solo cuando aporte valor,
- sin exponer credenciales innecesariamente,
- sin reemplazar JWT por headers improvisados,
- y sin convertir al gateway en el único punto de confianza del sistema.

La siguiente evolución natural es convertir a los microservicios en participantes activos del modelo de seguridad. Eso es exactamente lo que vamos a ver en la próxima clase.
