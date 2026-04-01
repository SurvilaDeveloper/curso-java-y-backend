---
title: "Backpressure, límites y cómo evitar que el sistema se autoahogue bajo demanda"
description: "Cómo pensar los límites de capacidad de un backend, qué significa backpressure y por qué un sistema escalable no solo necesita procesar más, sino también saber frenar, rechazar o degradar cuando la demanda supera lo razonable."
order: 108
module: "Backend escalable y sistemas más grandes"
level: "intermedio"
draft: false
---

## Introducción

Cuando se habla de escalabilidad, mucha gente imagina algo así:

- más usuarios
- más requests
- más jobs
- más tráfico
- más carga
- más servidores

Y entonces la intuición suele ser:

**“si escala, debería poder aceptar todo”.**

Pero en sistemas reales, esa idea es peligrosa.

Porque un backend sano no solo necesita procesar más cuando puede.
También necesita saber qué hacer cuando **la demanda supera su capacidad razonable**.

Ahí aparece una idea muy importante:

**backpressure**.

Y junto con ella, otras dos decisiones clave:

- **poner límites**
- **evitar que el sistema se autoahogue bajo demanda**

Este tema es fundamental porque muchos sistemas no se rompen solo por una falla externa.
Se rompen porque aceptan más trabajo del que realmente pueden absorber y terminan colapsando por su propio éxito, por mala protección o por mala disciplina interna.

## Qué es backpressure

Backpressure es una forma de decir:

**“el sistema necesita poder empujar hacia atrás cuando recibe más trabajo del que puede procesar sanamente.”**

Es decir:

- no aceptar todo sin límite
- no dejar que las colas crezcan infinitamente
- no seguir recibiendo trabajo como si la capacidad fuera infinita
- no fingir normalidad cuando el sistema ya está saturado

Backpressure no es “ser lento”.
Es una estrategia para **proteger al sistema** frente a una presión de entrada demasiado alta.

## Por qué este tema importa tanto

Porque sin límites razonables, un sistema puede entrar en espiral.

Por ejemplo:

1. llegan demasiadas requests o jobs
2. el sistema intenta procesarlo todo
3. sube la latencia
4. aumentan timeouts
5. los clientes reintentan
6. se genera aún más carga
7. las colas crecen
8. los workers se saturan
9. la base empieza a sufrir
10. el sistema entero se degrada más

Y muchas veces, si no hay un mecanismo de freno, esa degradación sigue creciendo sola.

En otras palabras:

**un sistema sin límites puede ayudarse a destruirse a sí mismo.**

## La falsa idea de “aceptar todo siempre”

A veces se piensa que rechazar trabajo o frenar entrada es una mala señal.

Pero en realidad, muchas veces es al revés.

Un sistema que sabe decir:

- “ahora no”
- “demasiadas requests”
- “tu tarea quedó pendiente”
- “no puedo procesar esto al ritmo que me lo mandás”
- “este endpoint está temporalmente limitado”
- “esta cola ya está llena”

puede ser mucho más sano que uno que intenta aceptar todo y termina rompiéndose por completo.

## Qué problema intenta resolver el backpressure

Intenta resolver, sobre todo, esto:

- que el volumen entrante supere sostenidamente la capacidad de procesamiento
- que la presión se propague y destruya otros componentes
- que la saturación de una parte arrastre al resto
- que el sistema siga acumulando trabajo aunque ya esté claramente excedido

No busca “hacer más rápido”.
Busca **controlar mejor la presión cuando ya no alcanza con ser rápido**.

## Dónde aparece este problema

Aparece en muchos lugares.

Por ejemplo:

- endpoints web bajo carga alta
- colas que reciben más de lo que consumen
- workers saturados
- pools de conexiones agotados
- bases que ya no sostienen más concurrencia
- integraciones externas demasiado lentas
- jobs que se acumulan
- procesamiento batch superpuesto
- streaming o pipelines internos
- servicios internos llamándose entre sí sin límites

Es decir:
no es un problema solo del frontend o del load balancer.
Es un problema sistémico.

## Ejemplo intuitivo

Supongamos que tu backend puede procesar razonablemente:

- 100 jobs por minuto

Pero recibe:

- 500 jobs por minuto

Si el sistema no hace nada especial, probablemente pase algo así:

- el backlog crece
- cada job espera más
- muchos jobs llegan tarde
- aumentan reintentos
- los workers viven atrasados
- el almacenamiento de cola crece
- el sistema entra en estrés permanente

Aceptar todo sin límites no resolvió nada.
Solo escondió la saturación por un rato.

## Qué significa “poner límites”

Poner límites significa reconocer que la capacidad no es infinita y hacer explícitas ciertas fronteras.

Por ejemplo:

- límite de requests por usuario
- límite de jobs en cola
- límite de workers simultáneos
- límite de conexiones
- límite por tenant
- límite por endpoint
- límite por tipo de tarea
- límite de tamaño de payload
- límite de concurrencia en ciertas operaciones pesadas

No todos los límites son iguales.
Pero la idea común es esta:

**el sistema necesita saber hasta dónde puede aceptar trabajo sin destruir su propio comportamiento.**

## Tipos de límites útiles

## 1. Límite de entrada

Cuánto tráfico o cuántas requests aceptás.

## 2. Límite de concurrencia

Cuántas operaciones al mismo tiempo dejás correr.

## 3. Límite de cola o backlog

Cuánto trabajo pendiente estás dispuesto a acumular.

## 4. Límite por cliente o tenant

Para que un actor no monopolice recursos.

## 5. Límite por operación costosa

Para proteger endpoints o tareas pesadas.

## 6. Límite de tamaño

Para payloads, archivos o lotes excesivos.

Estos límites suelen combinarse entre sí.

## Por qué limitar también mejora fairness

Los límites no solo protegen al sistema.
También ayudan a repartir capacidad de forma más justa.

Por ejemplo, sin límites puede pasar que:

- un cliente pesado se lleve la mayoría del throughput
- una integración mal implementada monopolice recursos
- un tenant grande perjudique a todos los demás
- un endpoint costoso ahogue operaciones más importantes

Poner límites también ayuda a que el sistema sea más previsible y menos injusto para el resto.

## Qué pasa cuando no hay backpressure

Sin backpressure real, suelen aparecer síntomas como:

- colas creciendo sin control
- timeouts cada vez más frecuentes
- reintentos en cascada
- memoria creciendo por acumulación
- workers siempre atrasados
- latencia general disparada
- componente lento arrastrando a otros
- pool de threads o conexiones agotado
- requests aceptadas que en realidad nunca podrán procesarse a tiempo

Es decir:
el sistema sigue “diciendo que sí” aunque ya no está en condiciones sanas de cumplir.

## A veces rechazar es mejor que aceptar tarde

Esta es una idea muy importante.

Puede ser mejor:

- rechazar rápidamente una operación no crítica
- o ponerla explícitamente en espera
- o degradar con claridad

que:

- aceptarla igual
- dejarla pendiente durante demasiado tiempo
- saturar el sistema
- empeorar todo lo demás

Un rechazo claro o una espera explícita puede ser mucho más sana que una falsa aceptación que termina en timeout, inconsistencia o degradación general.

## Backpressure en sistemas web

En sistemas web, esta idea suele aparecer en cosas como:

- rate limits
- límites de concurrencia
- protección de endpoints costosos
- colas intermedias
- timeouts razonables
- respuestas rápidas de “demasiada carga”
- degradación de funciones no críticas

No siempre se llama igual.
Pero el principio es el mismo:
**no dejes que el sistema se trague más de lo que realmente puede digerir.**

## Backpressure en colas y procesamiento asíncrono

Este punto conecta directamente con la lección anterior.

Una cola puede ser muy útil para absorber picos.
Pero si no existe ningún límite, puede convertirse en un pozo sin fondo.

Por ejemplo:

- la API sigue encolando trabajo
- los workers no alcanzan
- el backlog crece sin freno
- los jobs llegan a ejecutarse demasiado tarde
- tareas pierden valor temporal
- otras partes del sistema empiezan a sufrir

Entonces también en colas hay que pensar:

- cuánto backlog aceptás
- qué prioridad tiene cada tarea
- cuándo conviene rechazar, pausar o degradar
- qué pasa si el consumidor no da abasto

## El problema de “más workers” como única respuesta

A veces, cuando una cola se satura, la reacción automática es:

- “sumemos más workers”

Eso a veces ayuda.
Pero no siempre resuelve.

Porque el cuello puede estar en:

- base de datos
- integración externa
- lock compartido
- jobs demasiado pesados
- mal diseño de tarea
- throughput aguas abajo
- contención en otro recurso

Entonces agregar workers sin criterio puede incluso empeorar ciertas saturaciones.

## Backpressure y diseño del flujo

No todo se resuelve con infraestructura.
A veces hace falta rediseñar el flujo.

Por ejemplo:

- dividir jobs grandes
- bajar trabajo síncrono
- mover tareas no críticas fuera del camino principal
- separar prioridades
- evitar retries agresivos
- desacoplar mejor módulos
- reducir costo por operación
- agrupar o batchar mejor ciertas tareas

Esto muestra que backpressure también es arquitectura y modelado, no solo “limitar requests”.

## Qué hace un sistema sano bajo presión

Un sistema sano bajo presión suele intentar algo como:

- proteger su núcleo crítico
- frenar trabajo no esencial
- priorizar operaciones importantes
- no aceptar infinito backlog
- hacer visible que está saturado
- degradar con criterio
- evitar cascadas de reintentos
- dar respuestas más honestas sobre su capacidad real

No siempre puede sostener todo.
Pero sí puede evitar hundirse de forma descontrolada.

## Prioridad: no todo vale lo mismo

Esto es central.

Bajo presión, no todas las tareas deberían recibir el mismo tratamiento.

Por ejemplo:

- confirmar una operación crítica
- reintentar una tarea secundaria
- regenerar una proyección
- recalcular una métrica
- mandar una notificación poco urgente

No valen lo mismo.

Si el sistema no distingue prioridades, bajo carga puede terminar gastando recursos escasos en lo menos importante mientras lo esencial se atrasa.

## Qué cosas conviene proteger primero

Depende del sistema, pero suelen merecer más cuidado:

- operaciones críticas del negocio
- transiciones de estado importantes
- seguridad y autenticación
- confirmaciones sensibles
- datos que no toleran gran demora
- flujos directamente visibles por el usuario
- tareas que desbloquean otras

En cambio, otras cosas podrían:

- degradarse
- esperar más
- reintentarse después
- suspenderse temporalmente

## Qué papel juegan los timeouts

Los timeouts también son una forma de límite y, en cierto sentido, de backpressure.

Porque ayudan a evitar que una parte del sistema quede esperando indefinidamente a otra.

Eso protege:

- threads
- conexiones
- latencia
- acumulación de trabajo bloqueado

Un timeout razonable no es “ser impaciente”.
Es evitar que un componente lento infecte al resto.

## Backpressure y reintentos

Este tema también conecta mucho con retries.

Porque si un sistema bajo presión además recibe:

- reintentos automáticos masivos
- clientes agresivos
- integraciones mal configuradas

la situación empeora mucho.

Sin límites, los retries pueden transformarse en multiplicadores de desastre.

Por eso backpressure también implica pensar:

- cuándo reintentar
- cuántas veces
- con qué demora
- cuándo no reintentar más

## Backpressure y experiencia de usuario

Puede sonar contradictorio, pero a veces proteger el sistema mejora la experiencia general aunque implique limitar o rechazar ciertas cosas.

¿Por qué?

Porque es preferible:

- que una parte menos importante quede limitada
- a que todo el sistema se vuelva inutilizable

Por ejemplo:

- degradar recomendaciones
- frenar exportaciones pesadas
- retrasar tareas secundarias
- limitar ciertos reportes

para sostener bien:

- login
- checkout
- pagos
- confirmaciones críticas

Eso suele ser una decisión mucho más sana.

## Qué errores comunes aparecen

Algunos muy frecuentes son:

- aceptar trabajo sin límite “porque ya veremos”
- dejar crecer backlog indefinidamente
- no diferenciar prioridades
- usar más infraestructura para tapar mala presión de entrada
- no saber cuándo rechazar
- considerar rechazo o límite como fracaso en vez de mecanismo de protección
- no observar saturación hasta que el sistema ya está ahogado
- dejar que los retries agraven todo

## Qué conviene poder observar

Si querés manejar bien este tema, conviene poder responder preguntas como:

- cuántas requests o jobs entran por segundo
- cuánta concurrencia real hay
- cuánto backlog se acumula
- cuánto tardan las colas en vaciarse
- qué tareas están dominando recursos
- qué porcentaje de trabajo se rechaza o degrada
- qué tenants o clientes están generando más presión
- qué parte del sistema se satura primero
- qué tan seguido se activan límites

Sin esa visibilidad, los límites suelen ponerse tarde o mal.

## Relación con escalabilidad real

Este tema conecta con una idea muy importante:

**escalar no es solo agregar capacidad.  
También es gobernar mejor la presión.**

Un sistema que solo sabe crecer sumando recursos, pero no sabe poner límites ni proteger su núcleo, puede seguir siendo frágil.

La escalabilidad real incluye:

- throughput
- latencia
- estabilidad
- fairness
- límites
- resiliencia bajo demanda alta

## Buenas prácticas iniciales

## 1. Aceptar que la capacidad es finita y que el sistema necesita límites explícitos

Negarlo solo posterga el problema.

## 2. Pensar backpressure tanto para requests web como para colas y procesamiento interno

La presión entra por varios lugares.

## 3. Distinguir qué trabajo es crítico y qué trabajo puede esperar, degradarse o rechazarse

Eso ordena muchísimo las decisiones.

## 4. No dejar backlog crecer sin política clara

La acumulación infinita no suele ser una solución.

## 5. Usar timeouts, límites de concurrencia y restricciones de entrada como mecanismos de protección, no como castigo

Protegen al sistema.

## 6. Medir saturación, colas, rechazos y throughput real

Sin observabilidad, todo esto queda difuso.

## 7. Recordar que más workers o más servidores no siempre resuelven presión mal distribuida

A veces el diseño del flujo es el problema.

## Errores comunes

### 1. Intentar aceptar todo siempre

Eso suele romper peor al sistema.

### 2. Ver los rechazos como señal de fracaso y no como defensa controlada

A veces rechazar es lo más sano.

### 3. No distinguir tareas importantes de tareas secundarias

Bajo presión eso es carísimo.

### 4. Dejar que la cola crezca indefinidamente “porque total se procesa después”

Puede volverse ingobernable.

### 5. Ignorar el efecto multiplicador de los retries

Muy peligroso bajo saturación.

### 6. Poner límites sin observar cómo se comporta realmente el sistema

Entonces se configuran a ciegas.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué parte de tu sistema actual podría autoahogarse si recibe demasiada demanda?
2. ¿qué trabajo aceptarías siempre y qué trabajo limitarías o degradarías primero?
3. ¿qué backlog te parecería ya una señal de problema y no solo de “pico tolerable”?
4. ¿qué señal te mostraría que más workers no están resolviendo el cuello real?
5. ¿qué preferís para cierto flujo secundario: rechazar rápido, degradar o dejar esperar? ¿Por qué?

## Resumen

En esta lección viste que:

- backpressure es la capacidad del sistema de empujar hacia atrás o limitar entrada cuando la demanda supera lo razonable
- un backend escalable no solo necesita procesar más, sino también saber frenar, degradar o rechazar de forma controlada
- sin límites, el sistema puede autoahogarse por backlog, timeouts, reintentos y saturación en cascada
- requests web, colas y procesamiento interno necesitan mecanismos de protección, no solo más capacidad
- distinguir tareas críticas de tareas secundarias ayuda mucho a priorizar bajo presión
- escalar bien implica también gobernar la demanda, no solo agregar hardware o workers

## Siguiente tema

Ahora que ya entendés mejor qué significa backpressure y por qué un sistema escalable necesita límites además de capacidad, el siguiente paso natural es aprender sobre **escalado horizontal, stateless y qué condiciones hacen que una aplicación realmente pueda multiplicar instancias**, porque no alcanza con querer “poner más servidores”: primero hay que entender qué tipo de backend puede crecer así de verdad y cuál no.
