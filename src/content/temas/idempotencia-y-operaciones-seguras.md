---
title: "Idempotencia y operaciones seguras"
description: "Qué significa que una operación sea idempotente, por qué importa tanto en backends reales e integraciones, y cómo diseñar endpoints y flujos más seguros frente a reintentos, duplicados y errores de red."
order: 71
module: "Backend real e integraciones"
level: "intermedio"
draft: false
---

## Introducción

Cuando empezás a construir backends más reales, aparece un problema muy importante:

**una misma operación puede ejecutarse más de una vez sin que vos lo quieras.**

Por ejemplo:

- un usuario hace doble clic en “Pagar”
- el frontend reintenta una petición porque tardó demasiado
- una integración externa no recibió la respuesta y vuelve a mandar el mismo request
- un webhook llega duplicado
- una cola reprocesa un mensaje
- una red falla justo después de que el servidor hizo el trabajo, pero antes de que el cliente recibiera la respuesta

En todos esos casos, si tu sistema no está bien diseñado, podés terminar con:

- órdenes duplicadas
- pagos duplicados
- stock descontado dos veces
- emails enviados varias veces
- registros inconsistentes
- acciones difíciles de auditar

Ahí entra un concepto central del backend profesional:

**la idempotencia.**

## Qué significa idempotencia

Una operación es **idempotente** cuando ejecutarla una vez o varias veces produce el mismo efecto final esperado.

La idea no es que siempre devuelva exactamente la misma respuesta textual.  
La idea importante es que **no genere efectos repetidos no deseados**.

Por ejemplo:

- si marcás una orden como “enviada”, hacerlo una vez o varias debería dejarla en “enviada”
- si asociás un usuario a un rol ya existente, repetir la operación no debería crear muchas copias del mismo vínculo
- si una API de pagos recibe dos veces el mismo intento de cobro, no debería cobrar dos veces

## Ejemplo intuitivo

Supongamos este caso:

un cliente manda:

`POST /api/orders`

para crear una orden.

El servidor crea la orden correctamente, pero justo después hay un problema de red y el cliente no recibe la respuesta.

Entonces el cliente piensa:  
“capaz falló”  
y vuelve a mandar la misma petición.

Si tu backend no tiene una estrategia de idempotencia, puede crear:

- orden #1001
- orden #1002

aunque el usuario en realidad quiso hacer una sola compra.

Ese es uno de los problemas más comunes en sistemas reales.

## Por qué esto importa tanto

En sistemas chicos o ejercicios simples, muchas veces se asume que cada request llega una sola vez y se procesa perfecto.

En sistemas reales, eso no es seguro.

Hay:

- timeouts
- reintentos automáticos
- errores de red
- doble envío desde UI
- reprocesamiento en colas
- integraciones externas impredecibles
- usuarios impacientes que vuelven a tocar botones

Por eso, en backend profesional no alcanza con que “funcione si todo sale bien”.

También tiene que comportarse bien cuando:

- algo tarda
- algo se repite
- algo se corta
- algo se reintenta

## Idempotencia no es lo mismo que “no hacer nada”

Un error común es pensar que idempotencia significa “ignorar repeticiones”.

No necesariamente.

A veces la segunda llamada puede:

- devolver el mismo resultado ya generado
- informar que la operación ya había sido procesada
- responder con el recurso existente
- confirmar que el estado final ya es el correcto

Lo importante es que **no vuelva a ejecutar efectos peligrosos**.

## Casos donde la idempotencia es especialmente importante

### 1. Pagos

Si una operación de cobro se procesa dos veces, el impacto puede ser grave.

### 2. Creación de órdenes

No querés generar compras duplicadas por un timeout o un doble clic.

### 3. Descuento de stock

Un mismo evento repetido puede dejar el inventario mal.

### 4. Envío de emails o notificaciones

A veces no es crítico, pero sí genera mala experiencia y ruido.

### 5. Webhooks

Muchos proveedores pueden reenviar eventos ya entregados.

### 6. Consumo de colas o mensajes

Si un mensaje se reintenta, el sistema tiene que tolerarlo.

### 7. Integraciones externas

Cuando dos sistemas se hablan, hay más probabilidad de latencia, retry y fallos parciales.

## Relación con HTTP

HTTP tiene métodos que, por convención, suelen pensarse de forma distinta respecto a idempotencia.

### GET

No debería modificar estado.  
Se espera que sea seguro de repetir.

### PUT

Suele ser idempotente porque reemplaza o deja un estado determinado.  
Si mandás varias veces el mismo contenido, el resultado final debería ser el mismo.

### DELETE

También suele considerarse idempotente:  
borrar una vez o volver a intentar borrar debería dejar el recurso borrado.

### POST

No es idempotente por defecto.  
Se usa mucho para crear recursos o disparar acciones, y ahí es donde más cuidado hay que tener.

Esto no significa que `POST` sea “malo”.  
Significa que muchas veces necesita una estrategia explícita de idempotencia.

## Ejemplo simple con PUT

Supongamos:

`PUT /api/users/10/status`

con body:

```json
{
  "status": "ACTIVE"
}
```

Si esa llamada llega dos o tres veces, el usuario sigue quedando con estado `ACTIVE`.

Eso tiende a ser idempotente.

## Ejemplo problemático con POST

Supongamos:

`POST /api/payments`

Si cada request crea un pago nuevo, repetir la llamada puede duplicar la operación.

Por eso en acciones sensibles no alcanza con “usar POST y listo”.  
Hay que diseñar la protección.

## Estrategias comunes para lograr idempotencia

## 1. Diseñar operaciones orientadas a estado, no solo a acciones

En vez de pensar:  
“ejecutar acción una y otra vez”

muchas veces conviene pensar:  
“llevar el recurso a un estado final claro”

Por ejemplo, suele ser más seguro:

- marcar orden como CANCELLED
- marcar factura como PAID
- asignar rol ADMIN

que diseñar acciones ambiguas o acumulativas sin control.

## 2. Usar restricciones únicas en base de datos

La base de datos puede ayudarte muchísimo a evitar duplicados.

Por ejemplo:

- `order_number` único
- `payment_external_id` único
- `email` único
- combinación única entre dos columnas para evitar relaciones repetidas

Esto no resuelve todo, pero es una defensa muy importante.

## 3. Usar claves de idempotencia

Una estrategia muy común es que el cliente envíe una clave única para identificar el intento lógico de operación.

Por ejemplo:

`Idempotency-Key: 7f2a8b18-2d3e-4c12-8c7e-91f4f1c34abc`

La idea es:

- el cliente genera una clave
- el servidor la guarda asociada a esa operación
- si llega otra vez la misma clave, el servidor no repite el efecto
- en cambio, devuelve el resultado ya conocido o informa que esa operación ya fue procesada

Esto es muy usado en pagos, órdenes y APIs integrables.

## 4. Verificar si el efecto ya existe antes de crear uno nuevo

Antes de crear algo, podés buscar si ya hay una operación equivalente procesada.

Por ejemplo:

- si ya existe una orden con cierto identificador externo
- si ya se registró un webhook con ese event id
- si ya se creó un movimiento para ese mensaje

## 5. Registrar eventos procesados

En integraciones y mensajería, una técnica común es guardar:

- `event_id`
- `message_id`
- `external_reference`

Si un mismo evento vuelve a llegar, el sistema detecta:  
“esto ya fue procesado”.

## 6. Diseñar consumidores tolerantes a duplicados

En arquitecturas con colas, muchas veces no podés asumir “exactly once”.  
Entonces conviene diseñar consumidores que soporten reprocesamiento sin romper consistencia.

## Ejemplo conceptual de clave de idempotencia

Supongamos una compra.

El frontend manda:

- carrito
- datos del comprador
- total
- `Idempotency-Key`

El backend hace algo así:

1. busca si esa clave ya fue procesada
2. si no existe:
   - crea la orden
   - guarda la clave
   - responde el resultado
3. si ya existe:
   - no vuelve a crear la orden
   - devuelve la respuesta asociada a la operación original

Así, aunque el request llegue dos veces, el efecto final sigue siendo uno solo.

## Dónde guardar la clave de idempotencia

Depende del sistema, pero algunas opciones comunes son:

- una tabla específica de idempotencia
- una tabla de operaciones procesadas
- la misma entidad de negocio si tiene sentido
- un almacenamiento temporal si la ventana de repetición es acotada

Muchas veces se guarda algo como:

- clave
- endpoint o tipo de operación
- usuario o cliente
- estado de procesamiento
- respuesta generada
- fecha de creación
- fecha de expiración

## Idempotencia y consistencia

Acá se cruza un tema importante:

**evitar duplicados no es solo comodidad.  
También es consistencia de negocio.**

Porque en sistemas reales, dos ejecuciones repetidas pueden impactar en:

- dinero
- stock
- estados de workflows
- auditoría
- reportes
- integraciones con terceros

Por eso la idempotencia suele estar muy relacionada con:

- transacciones
- restricciones únicas
- modelado de estados
- eventos
- trazabilidad

## Idempotencia e integraciones externas

Este tema se vuelve todavía más importante cuando hablás con otros sistemas.

Por ejemplo:

- un proveedor de pagos reenvía notificaciones
- un sistema logístico manda dos veces el mismo callback
- una API externa no confirma si recibió tu request y vos reintentás
- una cola reprocesa un mensaje por timeout

En integraciones reales, asumir que “cada cosa pasa una sola vez” suele ser una mala idea.

Una mentalidad mucho más sana es:

**puede repetirse, ¿cómo diseño el sistema para tolerarlo?**

## Ejemplo con webhooks

Supongamos que recibís un webhook de pago aprobado.

Si el proveedor manda dos veces el mismo evento y tu sistema cada vez:

- marca la orden como paga
- genera un movimiento contable
- manda un email
- descuenta stock

vas a tener problemas.

En cambio, si guardás el `event_id` del proveedor y verificás si ya fue procesado, podés evitar duplicados peligrosos.

## Idempotencia no reemplaza validaciones

Otra confusión común:  
pensar que con idempotencia ya está todo resuelto.

No.

También siguen importando:

- validaciones de negocio
- autorización
- transacciones
- control de concurrencia
- restricciones de base de datos
- manejo de errores
- auditoría

La idempotencia es una pieza importante, no una solución mágica total.

## Idempotencia y concurrencia no son exactamente lo mismo

Están relacionadas, pero no son idénticas.

### Idempotencia

Busca que repetir una misma operación no genere efectos duplicados no deseados.

### Concurrencia

Se ocupa de qué pasa cuando varias operaciones ocurren al mismo tiempo y compiten por el mismo estado.

Por ejemplo:

- dos compras simultáneas sobre el mismo stock
- dos admins editando la misma entidad
- dos procesos intentando cerrar la misma orden

Ambos temas se cruzan mucho, pero no son lo mismo.

## Señales de que te falta pensar idempotencia

Algunas señales típicas:

- “a veces se crean órdenes duplicadas”
- “si refrescan justo después de pagar pasan cosas raras”
- “los webhooks duplicados rompen el flujo”
- “tenemos retries pero no controlamos efectos repetidos”
- “el stock se mueve dos veces ante ciertos fallos”
- “no sabemos si una acción ya fue ejecutada o no”

Cuando aparecen esos síntomas, normalmente hay que revisar el diseño.

## Buenas prácticas iniciales

## 1. Identificar operaciones sensibles

No todas las operaciones necesitan el mismo nivel de protección.

Prestá especial atención a:

- pagos
- creación de órdenes
- movimientos de stock
- integraciones externas
- eventos
- emails críticos
- acciones administrativas importantes

## 2. Tener identificadores únicos de negocio cuando haga falta

Por ejemplo:

- número de orden
- referencia externa
- event id
- transaction id

## 3. Apoyarte en la base de datos

Las restricciones únicas suelen ser una defensa excelente.

## 4. No confiar solo en el frontend

Aunque el botón se deshabilite después de un clic, el backend igual tiene que protegerse.

## 5. Pensar en retries desde el diseño

No diseñes suponiendo que todo llega una sola vez.

## 6. Registrar lo procesado

En integraciones y eventos, esto suele ser clave.

## 7. Hacer la operación observable

Logs, auditoría y trazabilidad ayudan mucho a detectar duplicados y entender qué pasó.

## Errores comunes

### 1. Pensar que el problema es solo del frontend

No.  
El backend tiene que ser robusto aunque haya doble envío, retry o timeout.

### 2. Confiar únicamente en un check previo en memoria

Si hay concurrencia o varias instancias del sistema, eso puede no alcanzar.

### 3. No usar restricciones únicas donde corresponden

Después aparecen duplicados evitables.

### 4. Reprocesar webhooks sin identificar el evento

Eso suele generar efectos repetidos.

### 5. Diseñar acciones peligrosas sin una referencia única

Después es muy difícil saber si esa operación ya ocurrió o no.

### 6. Creer que “si anda en local, ya está”

Muchos problemas de idempotencia aparecen recién en contextos reales, con latencia, fallos y reintentos.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. si un usuario hace doble clic en “confirmar compra”, ¿qué podría duplicarse?
2. si un proveedor reenvía un webhook, ¿cómo detectarías que ya fue procesado?
3. si una petición crea una orden pero el cliente no recibe la respuesta, ¿cómo evitarías crear otra igual en el reintento?
4. qué operaciones de tu sistema actual deberían ser idempotentes o tolerantes a duplicados
5. qué restricciones únicas te convendría tener en base de datos

## Resumen

En esta lección viste que:

- una operación idempotente es aquella que puede repetirse sin generar efectos finales incorrectos o duplicados
- este tema importa mucho en pagos, órdenes, stock, webhooks, colas e integraciones externas
- HTTP da algunas pistas, pero la idempotencia real depende del diseño de la operación
- `POST` no es idempotente por defecto, por eso muchas veces necesita protección extra
- restricciones únicas, claves de idempotencia, registro de eventos procesados y modelado orientado a estado son herramientas muy importantes
- la idempotencia ayuda a que un backend se comporte mejor frente a retries, timeouts, duplicados y fallos parciales
- pensar estos escenarios es parte del salto desde un backend “que funciona” hacia un backend más profesional

## Siguiente tema

Ahora que ya viste cómo evitar efectos duplicados y diseñar operaciones más seguras, el siguiente paso natural es aprender a trabajar con **tareas programadas y procesos batch**, porque muchos sistemas reales también necesitan ejecutar trabajo fuera del request inmediato del usuario.
