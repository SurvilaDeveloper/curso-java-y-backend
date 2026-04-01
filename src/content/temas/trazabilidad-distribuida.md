---
title: "Trazabilidad distribuida"
description: "Cómo seguir una operación a través de múltiples servicios, por qué la trazabilidad distribuida se vuelve crítica en arquitecturas con varias dependencias y cómo pensar logs, correlación, tracing y contexto sin perder claridad operativa."
order: 159
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

## Introducción

Cuando una aplicación vive en un solo proceso, entender qué pasó durante una operación suele ser relativamente directo.

Un usuario hace una acción.
El backend ejecuta lógica.
Se consulta la base.
Se devuelve una respuesta.
Y si algo falla, muchas veces alcanza con mirar:

- el log de la aplicación
- el stack trace
- la consulta a base de datos
- algún identificador de request

No siempre es fácil, pero al menos el recorrido está bastante concentrado.

En una arquitectura distribuida eso cambia mucho.

Ahora una sola acción de negocio puede involucrar:

- un gateway
- un servicio de autenticación
- un servicio de órdenes
- un servicio de pagos
- un servicio de inventario
- un emisor de eventos
- uno o varios consumidores asíncronos
- caches, colas, brokers y bases distintas

Entonces aparece una dificultad muy concreta:

**aunque cada parte haga algo razonable por separado, entender el recorrido completo de una operación se vuelve mucho más difícil.**

Y ése es justamente el problema que intenta resolver la **trazabilidad distribuida**.

No se trata solo de “tener más logs”.
Se trata de poder reconstruir:

- por dónde pasó una operación
- en qué servicios estuvo
- cuánto tardó cada tramo
- dónde apareció el error
- qué dependencia degradó el flujo
- qué parte del sistema quedó pendiente o incompleta

Porque en sistemas distribuidos, si no podés seguir un flujo de punta a punta, operar el sistema se vuelve muy costoso.

## Qué significa trazabilidad distribuida

La trazabilidad distribuida es la capacidad de seguir una misma operación lógica a través de múltiples componentes del sistema.

Dicho simple:

**queremos poder mirar una acción de negocio y reconstruir su recorrido técnico completo.**

Por ejemplo:

- un usuario confirma una compra
- el request entra por un gateway
- el servicio de órdenes valida datos
- el servicio de pagos intenta autorizar el cobro
- inventario reserva stock
- se publica un evento
- un worker dispara el email de confirmación

Desde el punto de vista del usuario, todo eso puede sentirse como “hice una compra”.
Pero desde el punto de vista del backend, eso puede ser una cadena bastante larga de pasos distribuidos.

La trazabilidad distribuida busca dar visibilidad sobre esa cadena.

## El problema real: cada servicio ve solo su pedazo

En un sistema distribuido, cada componente suele tener visibilidad local.

El gateway sabe:

- cuándo entró el request
- qué ruta recibió
- qué respuesta devolvió

El servicio de órdenes sabe:

- qué validaciones ejecutó
- si escribió en su base
- si llamó a pagos

El servicio de pagos sabe:

- si el proveedor respondió
- cuánto tardó
- si hubo timeout

El worker de notificaciones sabe:

- si consumió el evento
- si el email se envió o no

El problema es que cada uno ve **solo una parte**.

Entonces cuando aparece una pregunta real de operación, como por ejemplo:

- ¿por qué esta orden quedó pendiente?
- ¿por qué el usuario vio error si el pago terminó aprobado?
- ¿por qué esta operación tarda tanto?
- ¿qué dependencia está degradando el flujo?
- ¿dónde se perdió este evento?

...tener logs aislados por servicio no siempre alcanza.

Porque el desafío ya no es mirar un punto aislado.
El desafío es **reconstruir el recorrido completo entre muchos puntos**.

## Por qué la trazabilidad se vuelve crítica cuando crecen las dependencias

Cuantos más servicios, más hops y más componentes participan en una operación, más valor aporta una buena estrategia de trazabilidad.

Porque crecen varias cosas al mismo tiempo:

- la cantidad de saltos de red
- los puntos posibles de falla
- la latencia acumulada
- la cantidad de logs separados
- la complejidad para correlacionar eventos
- la distancia entre causa y efecto

En un monolito, si una operación tarda 900 ms, probablemente mirás un perfilador, algunos logs y una query lenta.

En microservicios, esos 900 ms pueden repartirse así:

- 60 ms en gateway
- 90 ms en auth
- 120 ms en orders
- 410 ms en payments
- 70 ms en inventory
- 150 ms en retries de una dependencia

Sin trazabilidad distribuida, muchas veces solo ves el síntoma final:

- “la API tarda demasiado”

Con trazabilidad distribuida, podés empezar a ver el recorrido real:

- qué tramo consumió más tiempo
- qué servicio empujó latencia al resto
- qué dependencia externa fue el cuello de botella
- qué parte de la operación quedó fuera del request principal

## Trazabilidad no es solo tracing

Acá conviene hacer una distinción importante.

Muchas veces se habla de trazabilidad distribuida y enseguida se piensa solo en **distributed tracing**.
Pero en realidad la visibilidad de un sistema distribuido suele apoyarse en varias piezas combinadas:

- logs
- métricas
- traces
- identificadores de correlación
- eventos de auditoría
- contexto propagado entre servicios

El tracing es una parte muy importante, pero no toda la historia.

Porque una buena observabilidad distribuida suele necesitar responder preguntas distintas.

## Logs

Sirven para entender detalles concretos de ejecución.

Por ejemplo:

- qué payload resumido llegó
- qué validación falló
- qué excepción ocurrió
- qué decisión tomó una regla

## Métricas

Sirven para ver comportamiento agregado.

Por ejemplo:

- tasa de error por endpoint
- latencia p95 de un servicio
- throughput por cola
- cantidad de retries

## Traces

Sirven para seguir el recorrido de una operación individual entre múltiples servicios.

Por ejemplo:

- qué servicios participaron
- en qué orden
- cuánto tardó cada tramo
- dónde falló la cadena

## Auditoría o eventos de negocio

Sirven para entender el estado de una operación desde la perspectiva del negocio.

Por ejemplo:

- orden creada
- pago autorizado
- stock reservado
- factura emitida

Todo eso junto arma una visión más completa.

## Qué es un trace

Un trace representa el recorrido completo de una operación a través de distintos componentes.

Ese recorrido suele estar compuesto por varias unidades menores llamadas **spans**.

Dicho en términos simples:

- el **trace** es la historia completa
- cada **span** es un paso o tramo dentro de esa historia

Por ejemplo, en una compra online podría haber:

- span del gateway
- span del servicio de órdenes
- span de la llamada a pagos
- span de la reserva de stock
- span de la publicación del evento

Cada span puede registrar cosas como:

- inicio y fin
- duración
- servicio responsable
- operación ejecutada
- tags o atributos útiles
- error o éxito

La idea es que, al ver todos los spans conectados, puedas reconstruir el flujo end-to-end.

## La clave: propagación de contexto

Nada de esto funciona bien si cada servicio inventa su propio identificador aislado.

La base de la trazabilidad distribuida es la **propagación de contexto**.

Eso significa que cuando una operación entra al sistema, se genera o se recibe un contexto identificable, y ese contexto viaja con la operación cuando pasa de un componente a otro.

Ese contexto puede incluir, entre otras cosas:

- trace id
- span id
- parent span id
- request id
- tenant id
- user id técnico o anonimizado según corresponda
- correlación con mensaje o evento

La idea central es esta:

**todos los componentes que participan del mismo flujo deberían poder referirse a la misma operación de forma correlacionable.**

Si no propagás contexto, cada servicio queda como una isla.
Y después diagnosticar problemas se vuelve muchísimo más lento.

## Correlation ID vs Trace ID

Estas dos ideas se parecen, pero no son exactamente lo mismo.

## Correlation ID

Es un identificador que ayuda a asociar varios logs o eventos con una misma operación de negocio o request.

Muchas veces alcanza para preguntas como:

- buscame todos los logs relacionados con esta operación
- uní estos eventos dispersos
- seguí este request entre servicios

## Trace ID

Es un identificador propio del modelo de tracing distribuido.
Permite agrupar todos los spans que pertenecen al mismo recorrido.

En la práctica, muchas arquitecturas usan ambos conceptos de forma cercana o incluso los alinean.
Lo importante no es discutir el nombre perfecto, sino garantizar que exista una forma consistente de correlacionar información entre componentes.

## Qué problemas resuelve una buena trazabilidad distribuida

## 1. Diagnóstico de errores complejos

Cuando una operación falla después de atravesar varios servicios, la trazabilidad ayuda a ubicar:

- dónde empezó el problema
- qué dependencia devolvió error
- qué parte reintentó
- qué tramo nunca llegó a ejecutarse

## 2. Análisis de latencia end-to-end

No alcanza con saber que “la API tarda”.
Necesitás saber **quién consume el tiempo**.

## 3. Entender cascadas de fallos

A veces el error visible aparece en un servicio, pero la causa real estaba antes.
Por ejemplo:

- auth lento
- timeout en orders
- retries en gateway
- saturación general posterior

La trazabilidad ayuda a reconstruir esa cadena.

## 4. Operar incidentes con menos intuición y más evidencia

En incidentes reales, una buena visibilidad reduce muchísimo el tiempo de diagnóstico.

## 5. Distinguir problemas técnicos de problemas de negocio

No es lo mismo que una request falle por timeout en la red, que una orden quede pendiente porque el pago quedó en revisión manual.

Los sistemas sanos intentan dar visibilidad en ambos niveles.

## Qué pasa con la trazabilidad en flujos asíncronos

Acá aparece una parte especialmente importante.

En un request síncrono, el recorrido suele ser más lineal.
Pero en flujos asíncronos la operación puede fragmentarse.

Por ejemplo:

- una API acepta un pedido
- publica un evento
- tres consumidores distintos reaccionan
- uno reintenta
- otro procesa más tarde
- otro falla y manda a DLQ

La pregunta entonces es:

**¿cómo seguimos una operación cuando ya no viaja como un solo request lineal?**

La respuesta es que también ahí hace falta correlación.

Conviene poder unir:

- el request inicial
- el mensaje publicado
- los consumidores que reaccionaron
- los reintentos
- el estado final del flujo

Si cada tramo asíncrono pierde la referencia al origen, el sistema se vuelve muy difícil de seguir.

Por eso en arquitecturas con eventos o colas, propagar contexto en mensajes es tan importante como hacerlo en headers HTTP.

## Errores comunes al implementar trazabilidad distribuida

## 1. Tener logs, pero sin correlación

Cada servicio loguea cosas, pero no comparten un identificador común.
Resultado: mucha información, poca capacidad real de reconstrucción.

## 2. Registrar demasiado ruido y muy poca señal

No toda línea de log ayuda.
Si todo emite demasiados datos irrelevantes, encontrar lo importante se vuelve difícil.

## 3. No propagar contexto a llamadas salientes

Se genera un request id al entrar, pero después no viaja a los servicios downstream.
Entonces la cadena se corta justo donde más se necesita.

## 4. Olvidarse del mundo asíncrono

Muchos equipos instrumentan bien HTTP, pero pierden contexto en colas, eventos, jobs o workers.
Ahí se rompe buena parte de la historia real.

## 5. Pensar solo en debugging técnico y no en flujos de negocio

A veces los traces muestran spans muy lindos, pero no ayudan a responder la pregunta real:

- ¿qué pasó con esta orden?
- ¿en qué estado quedó este cobro?
- ¿qué etapa falta completar?

## 6. Exponer datos sensibles en logs o traces

La trazabilidad no justifica registrar cualquier cosa.
Hay que tener muchísimo cuidado con:

- tokens
- credenciales
- datos bancarios
- información personal sensible
- payloads completos innecesarios

## Una tensión inevitable: visibilidad vs costo

Instrumentar mejor tiene beneficios enormes, pero también tiene costo.

Costo en:

- performance
- almacenamiento
- procesamiento
- complejidad operativa
- volumen de datos
- trabajo de observabilidad

Por eso conviene pensar la trazabilidad con criterio.

No todo necesita el mismo nivel de detalle.
Algunos flujos críticos merecen muchísima más instrumentación que otros.

La pregunta sana no es “¿registramos todo?”, sino:

**¿qué información necesitamos realmente para operar, diagnosticar y mejorar este sistema?**

## Qué cosas conviene poder responder con la trazabilidad

Una estrategia útil de trazabilidad distribuida debería acercarte a responder preguntas como estas.

## 1. ¿Qué recorrido hizo esta operación?

Qué servicios, componentes o colas participaron.

## 2. ¿Dónde falló?

En qué tramo exacto apareció el error o el timeout.

## 3. ¿Dónde estuvo la mayor latencia?

Qué dependencia o paso consumió más tiempo.

## 4. ¿Qué parte no llegó a ejecutarse?

Muy útil cuando el flujo se corta antes de completarse.

## 5. ¿Hubo reintentos, retries o compensaciones?

Porque eso cambia mucho la lectura del incidente.

## 6. ¿Qué pasó con esta entidad de negocio específica?

Por ejemplo:

- una orden
- una factura
- una suscripción
- un envío

## 7. ¿Este problema es aislado o sistémico?

Ahí se combinan traces individuales con métricas agregadas.

## Trazabilidad técnica vs trazabilidad de negocio

Ésta es una distinción muy importante.

## Trazabilidad técnica

Busca responder cosas como:

- qué endpoint se llamó
- qué dependencia tardó más
- qué excepción ocurrió
- qué span falló

## Trazabilidad de negocio

Busca responder cosas como:

- qué pasó con esta orden
- por qué este cobro sigue pendiente
- en qué etapa quedó este onboarding
- cuál fue la secuencia de eventos relevantes

Las dos importan.

Si tenés solo trazabilidad técnica, quizá entiendas el error de infraestructura pero no el impacto funcional.
Si tenés solo trazabilidad de negocio, quizá entiendas el estado visible pero no la causa técnica.

Los sistemas bien operados intentan conectar ambas miradas.

## Buenas prácticas conceptuales

## 1. Definir identificadores de correlación claros

No dejarlo librado a que cada equipo haga algo distinto.

## 2. Propagar contexto por defecto

Tanto en llamadas síncronas como asíncronas.

## 3. Estandarizar estructura de logs

Eso vuelve muchísimo más útil la búsqueda y correlación.

## 4. Instrumentar primero los flujos críticos

Checkout, pagos, login, creación de órdenes, provisioning, facturación.

## 5. Vincular observabilidad con entidades de negocio importantes

Orden, tenant, subscription, invoice, shipment, etc.

## 6. Medir sin exponer información sensible

Trazabilidad sí, fuga de datos no.

## 7. Hacer que la visibilidad sirva para operar, no solo para “tener dashboard”

Si la información no ayuda a responder preguntas reales, probablemente la instrumentación esté desalineada.

## Preguntas que conviene hacerse

## 1. ¿Podemos seguir una operación de punta a punta entre servicios?

Si no, ya hay una debilidad clara.

## 2. ¿Perdemos contexto cuando salimos del request síncrono?

Suele pasar mucho más de lo que parece.

## 3. ¿Podemos correlacionar una entidad de negocio con los eventos técnicos relevantes?

Ésta suele ser una diferencia enorme en incidentes reales.

## 4. ¿Nuestros logs ayudan a explicar decisiones o solo registran ruido?

No es lo mismo volumen que utilidad.

## 5. ¿Podemos detectar rápido qué dependencia introduce latencia?

Si no, cada problema de performance se vuelve una investigación larga.

## 6. ¿La observabilidad actual permite actuar o solo mirar?

Buena trazabilidad debería mejorar la operación, no solo decorar tableros.

## Idea final

En arquitecturas distribuidas, la complejidad no solo está en dividir servicios.
También está en poder entender qué está pasando cuando una operación cruza múltiples límites técnicos.

Ahí la trazabilidad distribuida se vuelve fundamental.

No porque sea una moda de observabilidad, sino porque resuelve una necesidad muy concreta:

**si el sistema está repartido, la capacidad de reconstruir su comportamiento también tiene que estarlo.**

Una buena estrategia de trazabilidad ayuda a:

- diagnosticar errores
- ubicar latencias
- seguir operaciones críticas
- entender flujos asíncronos
- operar incidentes con menos incertidumbre
- conectar señales técnicas con impacto de negocio

Sin eso, cada servicio puede parecer razonable por separado, pero el sistema completo se vuelve opaco.

Y en microservicios, un sistema opaco casi siempre termina siendo un sistema caro de mantener.
