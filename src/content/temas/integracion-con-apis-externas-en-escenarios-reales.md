---
title: "Integración con APIs externas en escenarios reales"
description: "Cómo pensar integraciones con APIs externas cuando aparecen credenciales, contratos cambiantes, errores inesperados, sincronización, límites y comportamiento no ideal del sistema remoto."
order: 83
module: "Integraciones y sistemas reales"
level: "intermedio"
draft: false
---

## Introducción

Consumir una API externa en un proyecto chico puede parecer relativamente simple.

A veces alcanza con:

- conocer un endpoint
- mandar una request
- recibir una respuesta
- mapear algunos datos

Pero cuando una integración pasa a formar parte de un sistema real, la situación cambia bastante.

Empiezan a aparecer preguntas como:

- ¿qué pasa si el proveedor cambia el contrato?
- ¿qué hacemos si responde lento?
- ¿qué pasa si un dato llega incompleto?
- ¿cómo manejamos credenciales?
- ¿qué hacemos si el sistema remoto está caído?
- ¿cómo se sincronizan estados entre ambos lados?
- ¿qué pasa si el otro sistema acepta algo pero lo procesa más tarde?
- ¿cómo investigamos errores de integración?
- ¿qué parte depende de tiempo real y qué parte puede esperar?

Ahí es donde deja de alcanzar la idea de “hacer requests a una API” y empieza a importar el diseño de una integración real.

## Qué cambia cuando la integración es real

Lo que cambia no es solo el volumen de código.

Lo que cambia es que la integración empieza a tener impacto concreto en:

- la operación del sistema
- la experiencia del usuario
- la consistencia del negocio
- la observabilidad
- el soporte
- la seguridad
- la evolución del producto

O sea:

**una integración real no es una simple dependencia técnica.  
Es una parte viva del comportamiento del sistema.**

## La API externa está fuera de tu control

Este es uno de los hechos más importantes de todos.

Cuando integrás con otro sistema, aceptás convivir con algo que no controlás del todo.

Ese sistema puede:

- cambiar comportamientos
- agregar restricciones
- responder distinto según el entorno
- caer
- degradarse
- devolver errores ambiguos
- tardar demasiado
- tener documentación incompleta
- enviar datos extraños
- sufrir inconsistencias temporales

Entonces, el diseño de integración madura cuando asumís que el sistema remoto no es perfecto.

## Integración no es solo request/response

En muchos casos, una integración real no es simplemente:

1. mando request
2. recibo respuesta
3. terminó

A veces hay:

- respuestas asincrónicas
- estados intermedios
- webhooks posteriores
- conciliación
- reprocesos
- aceptación inicial sin procesamiento final inmediato
- operaciones que quedan pendientes
- sincronizaciones por lotes
- confirmaciones diferidas

Entonces una integración real muchas veces es un flujo más amplio, no solo una llamada puntual.

## Ejemplo intuitivo

Supongamos una integración con una pasarela de pagos.

Tu sistema puede:

1. crear una intención de pago
2. recibir una respuesta técnica de aceptación
3. quedar esperando confirmación final
4. recibir luego un webhook
5. consultar el estado real del pago
6. actualizar la orden

Eso no es una sola request resuelta de punta a punta.
Es un flujo distribuido en el tiempo.

## Credenciales y secretos

Cuando una API externa requiere autenticación, aparece un tema operativo muy importante:

**las credenciales.**

Por ejemplo:

- API keys
- client secrets
- tokens
- certificados
- firmas
- credenciales por entorno

Esto obliga a pensar:

- dónde se guardan
- cómo se inyectan
- cómo se rotan
- quién puede verlas
- cómo se separan entre desarrollo, staging y producción
- qué pasa si vencen
- qué pasa si se filtran

Las credenciales no son un detalle menor.
Son parte central del diseño seguro de integración.

## Entornos y diferencias entre sandbox y producción

Muchas APIs externas ofrecen entornos distintos.

Por ejemplo:

- sandbox
- testing
- staging
- producción

Y uno de los problemas clásicos es asumir que el comportamiento será idéntico en todos.

No siempre pasa.

A veces el sandbox:

- tiene datos ficticios
- devuelve menos casos reales
- tiene menos restricciones
- se comporta distinto
- no refleja toda la latencia o carga
- simula parcialmente algunos flujos

Por eso conviene diseñar y probar con la conciencia de que producción puede traer sorpresas.

## Contratos cambiantes

Aunque una API externa esté documentada, eso no garantiza estabilidad perfecta.

Puede cambiar:

- formato de respuesta
- campos opcionales
- status codes
- políticas de autenticación
- límites
- semántica de ciertos estados
- precisión de ciertos datos
- tiempos de procesamiento

Por eso una integración madura no asume fragilidad cero.
Asume que los contratos pueden moverse.

## Validación defensiva

Cuando llega información desde otro sistema, no conviene tratarla como si fuera siempre perfecta.

A veces hace falta validar:

- campos obligatorios
- tipos esperados
- rangos razonables
- estados válidos
- coherencia entre atributos
- timestamps
- identificadores externos

No porque el proveedor “sea malo”, sino porque en sistemas reales ocurren errores, cambios, bugs y datos inesperados.

## Estados remotos vs estados internos

Otro punto muy importante es no asumir que el lenguaje del proveedor tiene que ser idéntico al tuyo.

Tu sistema puede tener estados internos como:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`

Mientras que el proveedor puede usar estados más complejos o distintos.

Por ejemplo:

- `awaiting_confirmation`
- `authorized_pending_capture`
- `reversed_after_manual_review`
- `partially_completed_async`

Conviene pensar cómo traducir eso de forma sana al modelo interno.

## Sincronización entre sistemas

En integraciones reales aparece mucho una pregunta:

**¿cómo mantenemos sincronizado nuestro estado con el del sistema externo?**

No siempre hay una única respuesta.

A veces se usa:

- consulta directa en tiempo real
- polling
- webhooks
- batch de reconciliación
- jobs de reparación
- consultas manuales de soporte

La clave es entender que sincronizar dos sistemas es un problema en sí mismo.

## Consistencia temporal

Dos sistemas pueden no estar perfectamente alineados en el mismo instante.

Por ejemplo:

- tu sistema cree que una orden sigue pendiente
- pero el proveedor ya la aprobó y todavía no llegó el webhook
- o llegó el webhook, pero el job interno aún no terminó
- o tu sistema consultó demasiado pronto y vio un estado intermedio

Eso quiere decir que muchas integraciones reales trabajan con cierto grado de consistencia eventual.

Lo importante es diseñar cómo se ve y se maneja ese período de transición.

## Qué ve el usuario mientras tanto

Esto también es parte del diseño.

Por ejemplo, si un pago todavía no está confirmado, ¿el usuario ve:

- “pendiente”
- “procesando”
- “esperando confirmación”
- “intentar nuevamente”
- “ya aprobado”

No es solo un tema técnico.
También impacta experiencia y soporte.

## Integraciones síncronas y sensibles a latencia

Algunas integraciones están en el camino crítico del request.

Por ejemplo:

- cotización en tiempo real
- validación externa antes de una acción
- cálculo dependiente de proveedor

Ahí la latencia importa muchísimo.

Cuanto más crítica es la llamada para responder al usuario, más importante es pensar:

- timeout
- fallback
- comportamiento degradado
- mensaje al usuario
- capacidad de reintento

## Integraciones diferidas

Otras veces la integración puede correrse del request principal.

Por ejemplo:

- sincronización de stock
- envío de notificación
- importación externa
- confirmación secundaria
- conciliación

Ahí conviene mucho más pensar en:

- jobs
- colas
- reintentos
- estados pendientes
- trazabilidad
- auditoría

## Manejo de errores reales

En una integración madura no alcanza con capturar excepciones genéricas.

Conviene pensar clases de error.

Por ejemplo:

- error de autenticación
- timeout
- respuesta inválida
- recurso no encontrado
- conflicto
- rate limit
- error transitorio
- error permanente
- inconsistencia de datos
- proveedor caído

No porque haya que complicarlo todo artificialmente.
Sino porque distintas fallas requieren reacciones distintas.

## Qué hacer cuando el proveedor está caído

Este escenario siempre hay que contemplarlo.

Preguntas útiles:

- ¿se puede reintentar?
- ¿el usuario puede seguir igual?
- ¿se puede dejar pendiente?
- ¿hay fallback?
- ¿hay que bloquear la operación?
- ¿hay que alertar a alguien?
- ¿hay que cambiar de proveedor?
- ¿se puede reanudar después?

No todas las integraciones tienen el mismo impacto.
Pero todas deberían tener una estrategia mínima.

## Qué hacer cuando la respuesta es técnicamente válida pero funcionalmente rara

Este caso aparece más de lo que parece.

Por ejemplo:

- llegó `200 OK`, pero faltan campos
- el estado no coincide con lo esperado
- el importe no cierra
- el recurso existe pero viene incompleto
- el proveedor devuelve algo “válido” pero absurdo para tu negocio

Ahí la validación y el criterio de negocio importan mucho.

## Trazabilidad para soporte e investigación

Cuando una integración falla, soporte o desarrollo pueden necesitar responder preguntas como:

- ¿qué request se hizo?
- ¿a qué proveedor?
- ¿con qué referencia?
- ¿qué respondió?
- ¿cuánto tardó?
- ¿qué reintentos hubo?
- ¿qué estado quedó en nuestro sistema?
- ¿se recibió un webhook después?
- ¿el problema fue nuestro o del proveedor?

Sin trazabilidad, esto se vuelve muy difícil.

## Observabilidad

Además de logs, conviene medir cosas como:

- latencia por proveedor
- tasa de error
- timeouts
- volumen por operación
- frecuencia de retries
- backlog de tareas asociadas
- divergencias entre estado interno y externo
- endpoints externos más problemáticos

Esto ayuda a operar mejor la integración.

## Reconciliación

Una idea muy importante en integraciones reales es la reconciliación.

Significa revisar periódicamente si el estado interno y el estado externo siguen alineados.

Esto puede servir cuando:

- un webhook se perdió
- hubo una falla parcial
- una confirmación no llegó
- un job quedó a medias
- el proveedor tuvo demora
- hubo un error temporal

No siempre alcanza con confiar en el flujo ideal.
A veces hace falta una estrategia de reparación o verificación periódica.

## Integración acoplada al proveedor vs integración centrada en tu dominio

Si el diseño está demasiado acoplado al proveedor, cualquier cambio externo impacta fuerte en todo el sistema.

En cambio, si la integración está pensada como frontera y traducción, podés absorber mejor cambios y rarezas.

Esto implica:

- traducir estados
- encapsular credenciales
- mapear modelos externos
- aislar detalles del contrato
- no repartir el payload externo por todo el dominio

## Relación con temas anteriores

Este tema conecta con varios de los que ya viste.

### Clientes HTTP avanzados

Porque son la base técnica del consumo externo.

### Clientes declarativos y abstracciones

Porque ayudan a representar mejor la integración dentro del sistema.

### Webhooks

Porque muchas integraciones reales combinan request saliente más evento entrante.

### Jobs y colas

Porque muchas operaciones de integración conviene procesarlas en segundo plano.

### Idempotencia

Porque los retries y la incertidumbre pueden duplicar operaciones.

### Diseño para producto real

Porque una integración no es solo una librería, sino parte del producto operable.

## Buenas prácticas iniciales

## 1. Tratar la integración como una frontera importante del sistema

No como un detalle menor.

## 2. Manejar credenciales de forma segura y separada por entorno

La operación real depende mucho de esto.

## 3. Validar respuestas externas con criterio defensivo

No asumir perfección del otro lado.

## 4. Traducir estados y modelos externos cuando haga falta

Eso protege tu dominio.

## 5. Diseñar qué pasa cuando el proveedor falla

Antes de que pase de verdad.

## 6. Pensar en sincronización y reconciliación

Especialmente si hay estados diferidos.

## 7. Registrar trazabilidad suficiente

Sin eso, soporte e investigación se vuelven muy costosos.

## Errores comunes

### 1. Suponer que la documentación externa siempre refleja el comportamiento real

No siempre pasa.

### 2. Confiar ciegamente en cualquier 200 OK

Puede ocultar errores funcionales.

### 3. Acoplar el dominio completo al lenguaje del proveedor

Eso vuelve frágil el sistema.

### 4. No pensar en estados pendientes o eventualidad

Después aparecen inconsistencias difíciles de explicar.

### 5. No diseñar escenarios de caída del proveedor

Eso deja al sistema sin estrategia cuando más la necesita.

### 6. No tener reconciliación ni trazabilidad

Entonces cualquier desvío es difícil de reparar.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué proveedores externos tendría un e-commerce real además del pago?
2. ¿qué harías si un proveedor responde lento pero tu endpoint no puede esperar demasiado?
3. ¿cómo representarías internamente un estado externo muy específico y raro?
4. ¿qué credenciales o secretos necesitaría cuidar especialmente una integración?
5. ¿cómo detectarías que tu sistema y el proveedor quedaron desincronizados?

## Resumen

En esta lección viste que:

- una integración real con APIs externas implica mucho más que request y response
- aparecen credenciales, contratos cambiantes, latencia, errores inesperados y estados diferidos
- la API externa está fuera de tu control, así que hay que diseñar de forma defensiva
- sincronizar estados entre sistemas es un problema importante y muchas veces requiere reconciliación
- una respuesta técnicamente correcta no siempre significa que el negocio quedó bien resuelto
- traducir modelos externos y registrar trazabilidad ayuda mucho a proteger el dominio y operar mejor la integración

## Siguiente tema

Ahora que ya entendés cómo pensar integraciones con APIs externas cuando el otro sistema no siempre se comporta de forma ideal, el siguiente paso natural es aprender sobre **sincronización entre sistemas y consistencia eventual**, porque cuando varios sistemas participan de un mismo flujo, mantener estados alineados y comprensibles se vuelve uno de los desafíos más importantes.
