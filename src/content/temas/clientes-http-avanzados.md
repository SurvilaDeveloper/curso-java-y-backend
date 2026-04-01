---
title: "Clientes HTTP avanzados"
description: "Cómo pensar el consumo de APIs externas desde un backend real, qué decisiones importan al diseñar clientes HTTP y por qué no alcanza con simplemente hacer una request y esperar que todo salga bien."
order: 81
module: "Integraciones y sistemas reales"
level: "intermedio"
draft: false
---

## Introducción

Muchos backends no solo reciben requests.

También hacen requests hacia afuera.

Por ejemplo, pueden necesitar:

- consultar una API de pagos
- validar datos contra un servicio externo
- pedir cotizaciones
- sincronizar productos
- consumir datos logísticos
- llamar a un servicio de autenticación
- descargar archivos
- hablar con otro sistema interno
- consultar un proveedor de emails o notificaciones
- obtener información desde una API pública o privada

En todos esos casos, tu backend actúa como cliente.

Y ahí aparece un tema muy importante:

**clientes HTTP avanzados.**

Porque consumir una API externa en un proyecto real no es solo “hacer una request”.
También implica pensar en:

- errores
- timeouts
- reintentos
- autenticación
- trazabilidad
- contratos
- observabilidad
- resiliencia
- mantenimiento
- impacto en el resto del sistema

## Qué es un cliente HTTP

Un cliente HTTP es el componente de tu sistema que se encarga de hacer llamadas HTTP a otros sistemas.

En otras palabras:

- tu backend recibe una necesidad de negocio
- para resolverla necesita hablar con otro servicio
- el cliente HTTP encapsula esa comunicación

Por ejemplo:

- `PaymentProviderClient`
- `ShippingApiClient`
- `ExchangeRateClient`
- `NotificationGatewayClient`

La idea no es solo “tener código que haga fetch”.
La idea es tener una forma ordenada de representar una integración externa.

## Por qué este tema importa tanto

Porque una API externa está fuera de tu control.

Y eso cambia mucho las reglas del juego.

Tu base de datos está dentro de tu sistema.
Tu lógica de negocio también.
Pero una API externa puede:

- responder lento
- cambiar comportamiento
- devolver errores inesperados
- estar caída
- tener rate limits
- responder con formatos raros
- requerir autenticación especial
- tener inestabilidad temporal
- comportarse distinto según entorno

Entonces, hablar con sistemas externos exige más cuidado.

## Diferencia entre lógica de negocio y acceso externo

Una buena práctica general es no mezclar demasiado estas cosas.

### Lógica de negocio

Responde preguntas como:

- ¿qué quiero hacer?
- ¿qué significa este flujo para mi dominio?
- ¿qué decisión tomo con la respuesta?

### Cliente HTTP

Responde preguntas como:

- ¿cómo hago la request?
- ¿qué headers uso?
- ¿cómo serializo el body?
- ¿cómo interpreto la respuesta?
- ¿qué hago si hay timeout?
- ¿cómo represento errores técnicos?

Separar estas responsabilidades suele mejorar mucho mantenibilidad.

## Ejemplo intuitivo

Supongamos que tu backend necesita cotizar un envío.

A nivel negocio, querés algo como:

- “obtener opciones de envío para esta orden”

Pero técnicamente, detrás de eso puede haber:

- construir URL
- armar headers
- autenticar
- serializar datos
- interpretar status codes
- mapear respuesta
- manejar timeouts
- registrar errores
- decidir si reintentar

Todo eso no conviene mezclarlo de cualquier manera dentro de un service de negocio.

## El problema de “hacer requests sueltas por todos lados”

Un error bastante común es que el proyecto empiece a hacer llamadas externas desde cualquier parte.

Por ejemplo:

- un controller llama directo a una API externa
- un service arma manualmente la URL
- otro service repite headers
- cada lugar maneja errores distinto
- nadie centraliza autenticación ni timeouts

Eso suele generar:

- duplicación
- inconsistencias
- mantenimiento más difícil
- errores de integración repetidos
- poca claridad
- difícil observabilidad

Por eso conviene encapsular mejor el acceso externo.

## Qué responsabilidades suele tener un cliente HTTP bien pensado

Aunque depende del sistema, normalmente un cliente HTTP bien diseñado se ocupa de cosas como:

- construir requests
- enviar headers correctos
- autenticar
- serializar y deserializar payloads
- mapear respuestas
- interpretar errores técnicos
- aplicar timeouts
- registrar información útil
- exponer una interfaz más clara hacia el negocio

La idea es que el resto del sistema no tenga que lidiar todo el tiempo con detalles bajos de HTTP.

## HTTP exitoso no significa negocio exitoso

Este punto es muy importante.

Una respuesta `200 OK` no siempre significa que el flujo de negocio salió bien.

Por ejemplo:

- la API respondió 200 pero el estado de negocio es inválido
- la respuesta vino incompleta
- el proveedor devolvió una estructura “válida” pero con un error lógico
- el recurso existe pero no está listo
- la operación fue aceptada pero quedó pendiente

Entonces, al consumir APIs externas hay que distinguir entre:

- éxito técnico
- éxito funcional o de negocio

No son lo mismo.

## Errores típicos al consumir APIs externas

Cuando tu sistema hace llamadas HTTP pueden pasar muchas cosas.

Por ejemplo:

- timeout
- error de red
- respuesta 400
- respuesta 401 o 403
- respuesta 404
- respuesta 409
- respuesta 429
- respuesta 500
- respuesta vacía o malformada
- payload distinto al esperado
- certificado o autenticación mal configurada
- lentitud extrema
- caída parcial

Diseñar clientes avanzados implica aceptar que esto es normal.

## Timeouts

Uno de los conceptos más importantes es el timeout.

Si tu sistema hace una llamada externa y espera sin límite o con una política mal pensada, puede terminar:

- bloqueando requests internos
- ocupando recursos innecesariamente
- generando latencia enorme
- degradando el resto del sistema

Por eso conviene definir con criterio:

- cuánto esperar
- qué pasa si no responde
- si conviene reintentar
- cómo impacta en el flujo principal

## Reintentos

A veces una falla externa es transitoria.

Por ejemplo:

- un timeout puntual
- una caída corta
- un error temporal de red

En esos casos, reintentar puede tener sentido.

Pero no siempre.

Reintentar sin criterio también puede ser peligroso:

- multiplica carga
- agrava una caída
- duplica operaciones
- genera más latencia
- empeora la experiencia

Entonces hay que pensar:

- qué errores son reintentables
- cuántas veces
- con qué demora
- con qué idempotencia
- con qué trazabilidad

## Autenticación

Muchos clientes HTTP necesitan autenticarse contra la API externa.

Por ejemplo:

- tokens
- API keys
- secrets
- firmas
- OAuth
- credenciales técnicas

Eso implica pensar:

- dónde guardar secretos
- cómo rotarlos
- cómo renovar tokens
- cómo evitar exponer credenciales
- cómo separar configuración por entorno

No es solo “agregar un header”.
También es seguridad operativa.

## Contratos externos

Cuando consumís una API externa, estás dependiendo de un contrato que no controlás del todo.

Ese contrato incluye cosas como:

- endpoints
- formato de request
- formato de response
- status codes
- reglas de autenticación
- límites
- comportamiento ante errores

Por eso conviene tratar esa integración como una frontera importante del sistema.

No asumir que “si hoy funciona, siempre va a funcionar igual”.

## Mapeo de modelos externos a modelos internos

Otro aspecto muy importante es no contaminar todo tu dominio con la forma exacta en que habla un proveedor externo.

Por ejemplo, la API externa puede tener:

- nombres raros
- estados extraños
- formatos que no te convienen
- estructuras demasiado acopladas a su modelo

Muchas veces conviene:

- recibir el modelo externo
- validarlo
- mapearlo
- convertirlo a un modelo interno más sano

Eso desacopla mejor tu aplicación del proveedor.

## Ejemplo conceptual

Supongamos que una API externa devuelve estados como:

- `approved_final`
- `approved_manual_review`
- `denied_risk`
- `in_progress_async`

Tu dominio quizá no quiera trabajar con eso directamente en todos lados.

Tal vez prefieras mapear internamente a algo como:

- `APPROVED`
- `REJECTED`
- `PENDING`

y conservar el detalle externo donde haga falta.

Eso simplifica el resto del sistema.

## Logging y trazabilidad

Cuando una integración falla, necesitás poder investigar.

Por eso conviene registrar cosas útiles como:

- qué cliente se invocó
- a qué endpoint
- en qué momento
- cuánto tardó
- qué resultado devolvió
- si hubo timeout
- si se reintentó
- con qué correlación o contexto

No se trata de loggear todo sin criterio.
Se trata de dejar rastros útiles.

## Observabilidad

Más allá de logs, también importa poder medir:

- latencia por cliente externo
- tasa de error
- cantidad de timeouts
- volumen de requests
- qué endpoints externos fallan más
- qué integraciones son más lentas
- impacto sobre flujos internos

Esto es muy útil para operación real.

## Clientes sin fallback y clientes con fallback

En algunos casos, si la API externa falla, no hay mucho más que hacer.

Pero en otros casos puede haber fallback.

Por ejemplo:

- usar datos cacheados
- usar un proveedor alternativo
- responder de forma degradada
- dejar el proceso pendiente para retry
- mostrar un estado provisional

No siempre es posible, pero cuando lo es, puede mejorar mucho resiliencia.

## Relación con temas anteriores

Este tema conecta con varios de los que ya viste.

### Idempotencia

Porque algunas llamadas externas pueden duplicarse por retries o incertidumbre.

### Jobs y colas

Porque muchas integraciones conviene procesarlas de forma diferida.

### Webhooks

Porque a veces consumís una API externa y además recibís eventos de ella.

### Rate limiting

Porque tanto tu sistema como el proveedor pueden tener límites.

### Feature flags

Porque puede ser útil activar, desactivar o cambiar dinámicamente una integración.

### Diseño para producto real

Porque una integración externa es una parte crítica del sistema, no un detalle técnico menor.

## Cuándo una llamada debería ser síncrona

Puede tener sentido cuando:

- la respuesta es necesaria para continuar
- el usuario no puede avanzar sin ese dato
- el costo y latencia son razonables
- el flujo exige inmediatez

Por ejemplo:

- validar una operación crítica en tiempo real
- obtener una confirmación necesaria para responder

## Cuándo quizá convenga diferirla

Puede tener sentido cuando:

- la llamada puede tardar
- el sistema externo es inestable
- la operación no necesita respuesta inmediata
- puede reintentarse
- querés desacoplar experiencia de usuario del proveedor externo

Por ejemplo:

- sincronización
- notificaciones
- conciliaciones
- procesos no críticos en tiempo real

## Qué debería exponer un buen cliente hacia el resto del sistema

En general, conviene que el resto del sistema vea una interfaz más semántica y menos técnica.

Por ejemplo, en lugar de algo como:

- `post("/provider/v2/shipments", body, headers...)`

podría haber algo como:

- `createShipment(orderData)`
- `getPaymentStatus(externalPaymentId)`
- `requestQuote(quoteInput)`

Eso hace que el negocio lea mejor y que el detalle HTTP quede encapsulado.

## Buenas prácticas iniciales

## 1. Encapsular integraciones externas en clientes claros

No repartir requests sueltas por todo el proyecto.

## 2. Separar detalles HTTP de la lógica de negocio

Mejora claridad y mantenimiento.

## 3. Definir timeouts razonables

Nunca asumir espera infinita o implícita.

## 4. Diseñar manejo de errores con criterio

No todos los errores significan lo mismo.

## 5. Mapear modelos externos a internos cuando haga falta

Evita acoplamiento excesivo.

## 6. Registrar latencia, fallos y contexto útil

Muy importante para operar integraciones reales.

## 7. Pensar si la llamada debe ser síncrona o diferida

No todas las integraciones merecen el mismo tratamiento.

## Errores comunes

### 1. Hacer requests externas desde cualquier parte del código

Después se vuelve inmanejable.

### 2. No definir timeouts

Eso puede degradar seriamente el sistema.

### 3. Tratar cualquier 200 como éxito real

No siempre significa negocio correcto.

### 4. Acoplar todo el dominio al payload externo

Eso vuelve el sistema frágil ante cambios del proveedor.

### 5. Reintentar sin estrategia

Puede duplicar problemas.

### 6. No dejar trazabilidad suficiente

Después investigar incidentes se vuelve muy costoso.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué APIs externas consumiría un e-commerce real?
2. ¿qué integración de tu sistema debería tener timeout especialmente cuidado?
3. ¿qué llamada debería ir en un job en vez de hacerse dentro del request?
4. ¿qué datos de logging te ayudarían a investigar una integración lenta?
5. ¿qué parte del payload externo no te convendría exponer directamente en tu dominio?

## Resumen

En esta lección viste que:

- un cliente HTTP es el componente que encapsula la comunicación de tu backend con sistemas externos
- consumir APIs reales implica mucho más que hacer una request: también hay que pensar en errores, timeouts, autenticación, contratos y observabilidad
- conviene separar lógica de negocio de detalles técnicos de la integración
- una respuesta técnicamente exitosa no siempre significa que el flujo de negocio salió bien
- mapear modelos externos a internos suele ayudar a desacoplar tu sistema
- definir timeouts, manejo de errores y trazabilidad es parte central del diseño de clientes HTTP avanzados

## Siguiente tema

Ahora que ya entendés cómo pensar clientes HTTP más robustos para consumir APIs externas desde un backend real, el siguiente paso natural es aprender sobre **clientes declarativos y abstracciones de integración**, porque muchas aplicaciones necesitan una forma más mantenible y expresiva de representar sus comunicaciones externas sin caer en código repetitivo o demasiado manual.
