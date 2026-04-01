---
title: "Procesamiento asíncrono, colas bajo carga y cómo evitar que el sistema web haga todo al mismo tiempo"
description: "Cómo pensar el procesamiento asíncrono cuando la carga crece, por qué las colas ayudan a desacoplar trabajo del request principal y qué problemas aparecen cuando el sistema web intenta hacer demasiado al mismo tiempo."
order: 107
module: "Backend escalable y sistemas más grandes"
level: "intermedio"
draft: false
---

## Introducción

Cuando un backend todavía es chico, muchas veces parece razonable resolver casi todo dentro del mismo request.

Por ejemplo:

- validar datos
- guardar una entidad
- llamar a una integración externa
- enviar un email
- generar un archivo
- actualizar métricas
- disparar notificaciones
- registrar auditoría
- recalcular algo pesado

Todo eso puede quedar pegado a una sola request HTTP y, al principio, quizá no se note demasiado.

Pero a medida que el sistema crece, esa forma de trabajar empieza a mostrar sus límites.

Entonces aparece una pregunta muy importante:

**¿qué pasa cuando el sistema web intenta hacer demasiado al mismo tiempo?**

Ahí aparece una idea central para sistemas que empiezan a escalar:

- **procesamiento asíncrono**
- **colas bajo carga**
- **separar el request principal del trabajo que no necesita resolverse en ese mismo instante**

Este tema es clave porque muchísimos cuellos de botella, latencias innecesarias y degradaciones de backend vienen de un problema bastante simple:

**el request web está cargando con más trabajo del que debería.**

## Qué significa procesamiento asíncrono

Procesamiento asíncrono significa que cierta parte del trabajo no se resuelve completamente dentro del mismo flujo inmediato que originó la acción, sino que se delega para ejecutarse después o en paralelo bajo otra dinámica.

Dicho más simple:

- el usuario o el sistema dispara una acción
- el backend resuelve el núcleo necesario
- y otra parte del trabajo queda pendiente para ejecutarse aparte

No significa “hacer magia”.
Significa **separar tiempos y responsabilidades**.

## Qué es una cola en este contexto

Una cola es un mecanismo para dejar trabajo pendiente de procesamiento.

La idea es:

1. alguien produce una tarea
2. esa tarea queda registrada o encolada
3. otro componente o worker la toma
4. la procesa
5. registra resultado, retry o error si hace falta

Las colas son muy útiles cuando el sistema necesita repartir mejor el trabajo y evitar que el request principal cargue con todo de inmediato.

## Por qué este tema importa tanto

Porque muchos problemas de backend bajo carga no aparecen por algo extremadamente sofisticado.

A veces aparecen por algo tan simple como esto:

- una request web está haciendo demasiado trabajo síncrono
- cada request tarda más de lo que debería
- el servidor queda ocupado esperando cosas
- se acumulan otras requests
- sube la latencia
- aumentan timeouts
- crecen retries
- el sistema entra en degradación

En otras palabras:

**no todo trabajo importante tiene que vivir dentro del request principal.**

Aprender a separar eso suele cambiar muchísimo la escalabilidad práctica de un sistema.

## El problema del request gordo

Una forma simple de nombrar el problema es esta:

**request gordo**.

Es una request que no solo resuelve lo mínimo necesario para responder, sino que además arrastra muchas tareas adicionales.

Por ejemplo:

- persistencia principal
- validaciones
- integraciones externas
- emails
- auditoría
- métricas
- cálculos pesados
- generación de archivos
- publicación de eventos remotos
- sincronizaciones

Todo eso junto puede ser muy costoso.

Y lo peor es que, al crecer la carga, esa decisión se paga cada vez más.

## Qué cosas suele tener sentido sacar del request

Por ejemplo:

- envío de emails
- notificaciones no críticas al instante
- generación de PDFs o archivos
- exportaciones
- procesamiento de imágenes
- analítica
- sincronizaciones secundarias
- proyecciones derivadas
- tareas de reconciliación
- procesos batch
- trabajos costosos que no bloquean la respuesta principal

No significa que siempre deban ir fuera.
Pero muchas veces son candidatas muy claras.

## Qué cosas suelen querer quedarse dentro del request

En cambio, conviene que dentro del request principal quede lo que realmente define si la operación se pudo realizar o no desde el punto de vista del negocio inmediato.

Por ejemplo:

- validación principal
- persistencia mínima coherente
- transición crítica de estado
- respuesta necesaria para continuar
- creación de una entidad o registro principal
- confirmación local del núcleo del caso de uso

Lo importante es distinguir entre:

- núcleo inmediato
- y trabajo derivado o diferible

## Ejemplo intuitivo

Supongamos una compra.

Dentro del request principal probablemente tenga sentido:

- validar compra
- crear orden
- dejar estado coherente
- registrar lo mínimo indispensable

Pero quizá no tenga sentido bloquear esa misma request para:

- enviar email
- actualizar dashboards
- recalcular estadísticas
- llamar a sistemas secundarios
- generar comprobantes pesados
- disparar tareas no críticas al instante

Si todo eso ocurre en línea, la compra “anda”, pero escala mucho peor.

## Por qué las colas ayudan tanto

Las colas ayudan porque permiten:

- desacoplar trabajo
- repartir carga
- evitar que el request principal cargue con todo
- absorber picos
- procesar al ritmo que permiten los workers
- reintentar tareas sin bloquear al usuario
- escalar ciertas tareas de forma distinta al backend web

En otras palabras:

**te ayudan a separar interacción inmediata de trabajo interno posterior.**

## Bajo carga, esto se vuelve todavía más importante

Con poca carga, una request pesada puede parecer aceptable.

Pero bajo carga sucede esto:

- cada request consume más tiempo
- más requests quedan esperando
- más threads o workers web se ocupan
- más conexiones quedan abiertas
- aumenta la latencia
- más clientes reintentan
- la presión general sube
- el sistema se degrada en cadena

Sacar trabajo innecesario del request suele ser una de las decisiones con mejor retorno cuando la carga empieza a crecer.

## Cola no significa “problema resuelto”

También es muy importante aclararlo.

Mover trabajo a una cola no elimina el problema.
Lo transforma.

Ahora aparecen preguntas como:

- ¿cuánto backlog se acumula?
- ¿qué pasa si los workers no alcanzan?
- ¿qué pasa si falla el job?
- ¿cómo reintento?
- ¿cómo observo la cola?
- ¿cuál es el tiempo razonable de procesamiento?
- ¿qué ve el usuario mientras tanto?
- ¿qué hago si una tarea queda muy retrasada?

La cola mejora mucho el diseño en muchos casos, pero no es gratis.

## Qué significa backlog

El backlog es la cantidad de trabajo pendiente acumulado en una cola o sistema de procesamiento.

Si la producción de tareas supera al ritmo de consumo, el backlog crece.

Y cuando crece demasiado, aparecen problemas como:

- demoras largas
- trabajos viejos todavía pendientes
- usuarios esperando demasiado
- latencias de procesamiento internas cada vez mayores
- jobs que pierden sentido temporal
- presión creciente sobre workers y almacenamiento

Por eso no alcanza con “tener cola”.
También hay que pensar si el sistema puede consumirla razonablemente bajo carga.

## Cuándo una cola ayuda muchísimo

Suele ayudar mucho cuando:

- el trabajo no necesita completarse antes de responder
- el costo del trabajo es alto
- el trabajo puede reintentarse
- el resultado final puede llegar después
- el sistema necesita absorber picos
- hay tareas independientes del request principal
- querés escalar workers distinto de la API web

## Cuándo una cola quizá no sea la respuesta

No todo conviene mandarlo a cola.

Puede no ser ideal cuando:

- el usuario necesita el resultado inmediatamente
- la operación no tiene sentido si ese paso no se completa ahora
- la latencia total del flujo ya sería inaceptable
- la complejidad añadida supera el beneficio
- el trabajo es demasiado trivial como para justificar el desacople

La pregunta no es:
“¿cola sí o no?”
La pregunta es:
“**qué trabajo merece realmente otro tiempo de procesamiento?**”

## Diferencia entre más servidores web y más workers

Este punto es muy valioso para pensar escalabilidad.

Si todo ocurre dentro del request, para crecer quizá sientas que necesitás solo:

- más instancias web
- más threads
- más CPU para el backend principal

Pero si separás trabajo, podés escalar distinto:

- la capa web para responder requests
- los workers para procesar tareas internas
- la cola para absorber picos

Eso te da mucho más control sobre dónde invertir recursos.

## Ejemplo conceptual

Supongamos un sistema que recibe muchas altas de órdenes.

Si cada alta además:

- manda email
- genera PDF
- notifica a terceros
- recalcula métricas
- guarda mucha auditoría

todo dentro del request, el throughput del sistema web cae rápido.

En cambio, si el request solo:

- crea la orden
- deja referencias claras
- encola trabajo derivado

entonces:

- la API responde más rápido
- la cola absorbe picos
- los workers procesan después
- podés ajustar ambos lados por separado

## Asincronía y experiencia de usuario

Mover trabajo fuera del request cambia también la experiencia del usuario.

La pregunta deja de ser solo:
“¿qué tan rápido responde?”
y pasa a ser también:
“**qué entiende el usuario sobre lo que ya pasó y lo que todavía está pendiente?**”

Por ejemplo, el sistema puede mostrar:

- “orden creada”
- “tu archivo se está generando”
- “estamos procesando tu solicitud”
- “recibirás una notificación cuando termine”

Esto conecta muchísimo con modelar bien estados pendientes y expectativas.

## Qué cosas conviene dejar explícitas

Cuando un flujo usa procesamiento asíncrono, conviene que el sistema exprese cosas como:

- qué ya quedó confirmado
- qué quedó pendiente
- qué tarea se delegó
- qué puede tardar
- qué se reintentará si falla
- qué parte ve el usuario y cuál no
- qué hace soporte si algo se atrasa demasiado

Sin esa claridad, la asincronía puede volverse opaca y frustrante.

## Colas y presión sobre la base o integraciones

Otra ventaja importante es que una cola puede ayudar a amortiguar presión sobre otros recursos.

Por ejemplo:

- base de datos
- proveedores externos
- storage
- sistemas de notificación

En vez de disparar todo en paralelo desde requests web en el pico más alto, podés procesar a un ritmo más controlado.

Eso reduce muchas veces:

- spikes
- retries simultáneos
- saturación
- timeouts en cascada

## Qué problemas aparecen bajo carga en colas

No todo es beneficio.
También aparecen riesgos como:

- crecimiento de backlog
- jobs demasiado lentos
- reintentos masivos
- workers insuficientes
- tareas que ya no tienen sentido cuando finalmente corren
- trabajo duplicado
- falta de prioridad
- poca observabilidad
- dependencia excesiva de que “la cola lo arregla después”

Por eso este diseño requiere criterio, no solo infraestructura.

## Jobs lentos y throughput interno

Así como existe throughput en la API web, también existe throughput en el procesamiento de jobs.

Si cada job tarda demasiado, la cola puede llenarse incluso con tráfico moderado.

Entonces conviene pensar:

- cuánto tarda cada tarea
- qué tan costosa es
- si puede dividirse
- si necesita prioridad distinta
- si vale la pena procesarla en otro formato
- si el trabajo podría hacerse más liviano

No todo problema de colas se resuelve con más workers.

## Colas y prioridad

No todas las tareas internas importan igual.

Por ejemplo:

- reintentar una integración crítica
- confirmar una operación pendiente
- generar una métrica secundaria
- refrescar una vista auxiliar

No tienen el mismo peso.

Si todo entra en el mismo saco sin criterio, bajo carga las tareas valiosas pueden quedar atrapadas detrás de trabajo menos importante.

Aunque no hace falta profundizar todavía en estrategias avanzadas, sí conviene entender que **bajo carga, la prioridad importa muchísimo**.

## Colas y observabilidad

Si usás procesamiento asíncrono, conviene poder responder preguntas como:

- cuántos jobs pendientes hay
- cuánto tardan en promedio y en picos
- cuántos fallan
- cuántos se reintentan
- qué cola se atrasa más
- qué tipo de tarea está dominando el sistema
- qué jobs llevan demasiado tiempo esperando
- qué tasa de producción vs consumo tenés

Sin esa visibilidad, la cola puede estar degradándose y no te enterás hasta que el problema ya impactó fuerte.

## Qué errores comunes aparecen

Algunos muy frecuentes son:

- mandar a cola cualquier cosa sin distinguir criticidad
- usar la cola como basurero universal del diseño
- no modelar estados pendientes
- no medir backlog
- no mirar throughput de workers
- dejar jobs demasiado pesados
- ocultar al usuario que parte del trabajo sigue pendiente
- asumir que “si está encolado, ya está resuelto”
- no revisar si una tarea todavía tiene sentido cuando finalmente se ejecuta

## Relación con rendimiento general

Este tema conecta directamente con rendimiento y cuellos de botella.

Porque muchas veces el backend web no necesita “ser más rápido” tanto como necesita **hacer menos dentro del request**.

Mover bien el trabajo puede mejorar muchísimo:

- latencia
- throughput
- estabilidad bajo carga
- aprovechamiento de recursos
- resiliencia

## Relación con integraciones y eventos

También conecta con todo lo que viste antes sobre:

- jobs
- retries
- eventos internos
- degradación controlada
- consistencia eventual
- reconciliación

El procesamiento asíncrono no es solo escalabilidad.
También es una forma de diseñar mejor flujos que no necesitan completarse instantáneamente.

## Buenas prácticas iniciales

## 1. Preguntarte qué parte del flujo realmente necesita resolverse dentro del request

Esa suele ser la pregunta más valiosa.

## 2. Mover fuera del request tareas costosas, repetibles o secundarias cuando tenga sentido

Eso suele mejorar mucho la escalabilidad práctica.

## 3. No usar colas como solución universal sin pensar en backlog, prioridad y observabilidad

La cola también necesita diseño.

## 4. Hacer explícitos los estados pendientes y lo que el usuario debería entender

La asincronía sin claridad genera confusión.

## 5. Medir throughput y latencia también del procesamiento interno, no solo de la API web

El sistema no termina en el request.

## 6. Revisar si ciertos jobs son demasiado pesados y podrían dividirse o simplificarse

No todo backlog se resuelve agregando workers.

## 7. Distinguir bien núcleo inmediato de trabajo derivado

Eso ordena muchísimo el diseño.

## Errores comunes

### 1. Intentar que el request web haga todo al mismo tiempo

Bajo carga eso suele romperse rápido.

### 2. Mandar a cola cosas críticas sin modelar bien qué significa “pendiente”

Eso puede dejar el sistema opaco.

### 3. No mirar backlog ni tiempos de espera de jobs

Entonces el problema se acumula sin visibilidad.

### 4. Usar más workers para tapar jobs mal diseñados

A veces la solución es rediseñar la tarea.

### 5. Mezclar tareas muy distintas en el mismo tratamiento sin criterio de prioridad

Eso puede perjudicar mucho a lo importante.

### 6. Creer que asincronía siempre mejora la experiencia sin pensar cómo se comunica el estado

No siempre es así.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué parte de tu backend actual está haciendo demasiado dentro del request?
2. ¿qué tarea secundaria moverías a un procesamiento asíncrono primero?
3. ¿qué le mostrarías al usuario mientras ese trabajo sigue pendiente?
4. ¿qué métrica te gustaría mirar para saber si una cola empieza a degradarse?
5. ¿qué job actual sospechás que bajo carga se volvería backlog rápidamente?

## Resumen

En esta lección viste que:

- el procesamiento asíncrono permite separar el request principal de trabajo que puede resolverse después
- las colas ayudan a desacoplar, absorber picos y repartir mejor carga, pero no eliminan el problema: lo transforman
- bajo carga, intentar hacer demasiado dentro del request suele empeorar latencia, throughput y estabilidad general
- mover trabajo a cola tiene mucho sentido cuando ese trabajo no necesita completarse antes de responder
- backlog, throughput de workers, prioridad y observabilidad son claves para que la asincronía realmente ayude
- pensar qué ya quedó confirmado y qué sigue pendiente es central para no volver opaco el sistema

## Siguiente tema

Ahora que ya entendés mejor cómo el procesamiento asíncrono y las colas pueden ayudar a que el sistema web no cargue con todo al mismo tiempo cuando la carga crece, el siguiente paso natural es aprender sobre **backpressure, límites y cómo evitar que el sistema se autoahogue bajo demanda**, porque escalar no es solo procesar más: también es saber hasta dónde aceptar trabajo y cómo reaccionar cuando la demanda supera lo razonable.
