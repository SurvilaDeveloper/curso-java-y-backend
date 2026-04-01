---
title: "SLO, SLI, error budgets y confiabilidad"
description: "Qué son los SLI y los SLO, por qué la confiabilidad no debería definirse con intuición vaga, cómo usar error budgets para tomar decisiones reales de producto e ingeniería, y cómo convertir la disponibilidad y la calidad de servicio en compromisos operables en backends reales."
order: 146
module: "Seguridad y operación avanzada"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior hablamos de **observabilidad operativa avanzada**.

Ahí vimos que operar bien no significa solamente tener logs, métricas y dashboards, sino desarrollar la capacidad de entender qué está pasando en el sistema mientras cambia, se degrada o se recupera.

Pero observar bien, por sí solo, no resuelve una pregunta clave.

Aunque tengas muy buena visibilidad, igual necesitás definir **qué nivel de servicio considerás aceptable**.

Porque si no hacés eso, aparecen problemas muy comunes.

El equipo dice que “el sistema está bastante bien”, pero no sabe medirlo.
Producto quiere lanzar cambios más rápido, pero nadie sabe cuánto riesgo operativo se está acumulando.
Infraestructura quiere más estabilidad, pero no está claro qué flujo importa más.
Soporte recibe quejas, pero técnicamente el sistema “nunca estuvo caído del todo”.
Las métricas muestran cierta degradación, pero no existe una definición compartida de cuándo algo ya cruzó el límite tolerable.

Y sin esa definición, la conversación entre negocio, producto e ingeniería se vuelve difusa.

Por eso este tema es tan importante.

Los **SLI**, los **SLO** y los **error budgets** sirven para convertir la confiabilidad en algo menos ambiguo.

No son un capricho teórico.
No son una moda de SRE.
No son solo para empresas gigantes.

Son una manera concreta de responder preguntas como:

- ¿qué significa que nuestro servicio funcione bien?
- ¿qué experiencia mínima queremos sostener?
- ¿qué capacidad crítica debe mantenerse sana?
- ¿cuándo estamos degradándonos demasiado?
- ¿cuánto riesgo de cambio podemos asumir sin comprometer el servicio?

En esta lección vamos a estudiar:

- qué es confiabilidad en términos operables
- qué diferencia hay entre SLI, SLO y SLA
- cómo elegir buenos indicadores
- qué errores aparecen al medir lo incorrecto
- cómo funciona el concepto de error budget
- cómo usarlo para priorizar estabilidad o velocidad
- por qué no todo servicio necesita el mismo nivel de exigencia
- cómo aterrizar estos conceptos en backends reales

## Confiabilidad no es perfección

Una de las primeras ideas que conviene corregir es ésta:

**confiabilidad no significa ausencia total de fallos.**

En sistemas reales siempre existe cierta fricción:

- dependencias externas lentas
- picos de carga
- errores transitorios
- despliegues defectuosos
- regiones degradadas
- timeouts
- jobs atrasados
- fallos parciales
- usuarios en condiciones de red malas

Pretender cero fallos absolutos suena noble, pero casi nunca es una meta razonable.

Lo que sí importa es definir algo más útil:

**qué nivel de servicio aceptás como suficientemente bueno para el tipo de producto, flujo y usuario que tenés.**

Eso cambia mucho según el contexto.

No es lo mismo:

- una home pública de marketing
- un dashboard interno de administración
- un checkout de e-commerce
- una API de pagos
- un sistema de autenticación
- una exportación batch que puede tardar minutos

Cada capacidad tiene distintos costos de fallo y distintas expectativas.

## El problema de hablar de confiabilidad de forma vaga

Sin un marco claro, aparecen frases como:

- “anda bastante bien”
- “se cayó poco”
- “la latencia estuvo más o menos normal”
- “no fue tan grave”
- “hubo algunos errores, pero no tantos”

Ese lenguaje no sirve para operar un backend serio.

¿Por qué?

Porque dos personas pueden interpretar lo mismo de formas completamente distintas.

Para soporte, un 2% de fallos en login puede ser gravísimo.
Para un equipo técnico, tal vez parezca bajo.
Para negocio, quizá el problema sea inaceptable justo en campaña.
Para otro flujo menos crítico, ese mismo porcentaje puede ser tolerable por unas horas.

Por eso necesitamos pasar de impresiones a definiciones medibles.

## SLI: el indicador que intenta representar una propiedad importante del servicio

**SLI** significa *Service Level Indicator*.

Es una métrica que intenta representar alguna dimensión importante de la experiencia o del comportamiento del servicio.

Dicho más simple:

un SLI es **una forma de medir si una capacidad está funcionando como debería**.

### Ejemplos comunes de SLI

- porcentaje de requests exitosas
- latencia p95 de una operación crítica
- porcentaje de jobs procesados dentro de cierto tiempo
- porcentaje de lecturas completadas correctamente
- tiempo de disponibilidad de una API
- porcentaje de checkouts completados sin error
- porcentaje de eventos entregados antes de un límite temporal

El punto importante no es el nombre elegante.
El punto es que el SLI debe capturar algo que de verdad importe.

## Un SLI no es cualquier métrica técnica

Éste es un error muy frecuente.

Tener métricas no implica tener buenos SLI.

Por ejemplo, estas métricas pueden ser útiles operativamente:

- CPU
- memoria
- tamaño de cola
- conexiones abiertas
- uso de disco

Pero muchas veces **no son buenos SLI de servicio**.

¿Por qué?

Porque describen el estado de infraestructura, no necesariamente la calidad percibida o la capacidad funcional que te importa proteger.

Un servicio puede tener CPU sana y aun así romper el flujo de checkout.
Puede tener memoria estable y al mismo tiempo devolver errores en login.
Puede no estar “caído”, pero tardar demasiado en la operación que realmente importa.

Por eso, un buen SLI suele estar más cerca de una capacidad real del sistema que de una señal interna aislada.

## Qué vuelve bueno a un SLI

Un buen SLI suele tener varias características.

### 1. Representa algo importante

No mide una curiosidad técnica.
Mide una propiedad relevante del servicio.

### 2. Está ligado a una experiencia o capacidad concreta

Por ejemplo:

- iniciar sesión
- crear una orden
- cobrar un pago
- responder una API pública
- procesar una importación

### 3. Es medible de forma consistente

No depende de interpretación manual.
Se puede calcular con reglas claras.

### 4. Es accionable

Si empeora, el equipo puede investigar y actuar.

### 5. No está demasiado lejos de lo que importa al usuario o al negocio

Cuanto más indirecto es el indicador, más fácil es que te engañe.

## SLO: el objetivo que definís para ese indicador

**SLO** significa *Service Level Objective*.

Si el SLI es el indicador, el SLO es **la meta que querés cumplir sobre ese indicador**.

Por ejemplo:

- 99,9% de requests exitosas en la API de autenticación durante 30 días
- 95% de checkouts completados en menos de 2 segundos durante 7 días
- 99% de jobs críticos procesados en menos de 5 minutos
- 99,95% de disponibilidad mensual para el endpoint público de pagos

Fijate que el SLO no es una sensación.
Es una definición concreta que combina:

- qué medís
- con qué criterio de éxito
- durante qué ventana temporal
- con qué umbral aceptable

## SLI y SLO no son lo mismo

Conviene dejar esto muy claro.

### SLI

Es el indicador.
La forma de medir.

### SLO

Es el objetivo sobre ese indicador.
La meta esperada.

Ejemplo:

- SLI: porcentaje de requests `POST /checkout` que terminan con respuesta exitosa y orden creada correctamente
- SLO: 99,5% de éxito en ventanas móviles de 30 días

Otro ejemplo:

- SLI: latencia p95 de `POST /login`
- SLO: p95 menor a 500 ms durante el 99% del tiempo semanal

## SLA: otro concepto distinto

También suele aparecer **SLA**, que significa *Service Level Agreement*.

No es lo mismo que SLO.

El SLA suele ser un compromiso formal o contractual con clientes.
Muchas veces incluye:

- disponibilidad comprometida
- definiciones de incumplimiento
- compensaciones
- responsabilidades de soporte
- excepciones

En cambio, el SLO es normalmente una herramienta interna de ingeniería y operación.

De hecho, en muchos contextos conviene que el SLO interno sea un poco más exigente que el SLA externo.

¿Por qué?

Porque si tu objetivo interno coincide exactamente con el contrato mínimo, vas a enterarte del problema cuando ya estés al borde del incumplimiento.

## Elegir el SLI incorrecto lleva a conclusiones peligrosas

Esto pasa muchísimo.

### Caso 1: medir solo disponibilidad HTTP

Imaginá que una API responde `200 OK`, pero entrega datos viejos, incompletos o inconsistentes.
Desde una métrica superficial puede parecer disponible.
Desde la perspectiva del usuario o del negocio, no lo está.

### Caso 2: medir promedio de latencia

El promedio puede verse razonable mientras el p95 o p99 ya está destruyendo la experiencia de una parte importante de usuarios.

### Caso 3: medir éxito técnico y no éxito funcional

Una request puede terminar sin error de servidor, pero no concretar la acción esperada.
Por ejemplo:

- la orden no queda persistida
- el email nunca sale
- el pago queda ambiguo
- el job no produce el efecto final

### Caso 4: medir sistema completo sin segmentar

Tal vez el indicador global está sano, pero cierto tenant, cierta región o cierto flujo crítico está muy degradado.

## La ventana temporal importa mucho

Un SLO siempre vive dentro de una ventana.

Ejemplos:

- 30 días
- 7 días
- 24 horas
- rolling window por hora
- calendario mensual

La ventana afecta muchísimo la interpretación.

### Ventanas largas

Sirven para ver confiabilidad sostenida.
Pero pueden ocultar incidentes cortos muy intensos.

### Ventanas cortas

Capturan mejor problemas agudos.
Pero pueden generar más variabilidad y ruido.

No existe una única respuesta universal.
La elección depende del tipo de servicio y del uso que le querés dar.

En general, conviene pensar:

- qué tan rápido querés detectar deterioro
- qué tan estable querés que sea la medición
- qué patrón de consumo tiene el servicio
- qué capacidad concreta estás protegiendo

## Disponibilidad no es el único tipo de objetivo

Cuando se habla de SLO, mucha gente piensa solo en uptime.

Pero los objetivos pueden cubrir varias dimensiones.

### Disponibilidad

¿El servicio responde o está accesible?

### Correctitud

¿La operación produce el resultado correcto?

### Latencia

¿Responde dentro de un tiempo aceptable?

### Frescura

¿Los datos están actualizados dentro de la tolerancia esperada?

### Completitud

¿La operación devuelve todo lo que debe devolver?

### Tiempo de procesamiento

¿Un job o evento se resuelve dentro de una ventana razonable?

### Éxito de flujo crítico

¿El usuario realmente logra completar la tarea importante?

Esta variedad es importante porque muchos productos no fallan por “caída total”, sino por degradación funcional.

## Error budget: la idea que conecta confiabilidad con velocidad de cambio

Éste es uno de los conceptos más poderosos del tema.

Si definís un SLO, también estás definiendo implícitamente cuánto fallo tolerás.

Ese margen tolerado es el **error budget**.

Ejemplo:

Si tu SLO dice:

- 99,9% de éxito mensual

Entonces estás aceptando implícitamente que hasta un 0,1% del servicio puede fallar dentro de esa ventana sin violar el objetivo.

Ese 0,1% es parte de tu presupuesto de error.

La idea es muy útil porque vuelve explícito algo que de otro modo queda difuso:

**no existe servicio perfecto; existe un nivel de fallo tolerado que hay que administrar con criterio.**

## Por qué el error budget es tan valioso

Porque transforma una discusión abstracta en una conversación operable.

En lugar de pelear entre:

- “hay que mover más rápido”
- “hay que ser más conservadores”

podés mirar el presupuesto.

### Si el error budget está sano

Quizá el sistema está cumpliendo holgadamente sus objetivos.
En ese caso, puede haber espacio para:

- lanzar cambios
- experimentar más
- avanzar con migraciones
- aumentar velocidad de entrega

### Si el error budget se está consumiendo rápido

Eso sugiere que el sistema ya está pagando demasiado costo operativo.
Entonces tal vez conviene:

- frenar lanzamientos riesgosos
- priorizar estabilidad
- corregir regresiones
- reforzar observabilidad
- revisar dependencias

### Si el error budget se agotó

Eso no significa que el mundo termina.
Pero sí indica que el servicio ya falló más de lo que se consideró aceptable.
En muchos equipos, eso dispara una señal clara: por un tiempo, la prioridad cambia desde nuevas features hacia confiabilidad.

## El error budget no es una licencia para romper todo

Éste también es un malentendido común.

No se trata de “tenemos margen, así que podemos fallar tranquilos”.

La idea no es celebrar el error.
La idea es evitar dos extremos dañinos:

- exigir perfección imposible
- ignorar el costo del fallo hasta que explote

El error budget introduce una forma de gobernar el riesgo.
No lo elimina.
No lo romantiza.
Lo vuelve visible.

## Todos los servicios no deberían tener el mismo SLO

Esto es clave.

Un error frecuente es intentar imponer el mismo estándar a todo.

Pero las capacidades no son iguales.

### Ejemplos de distinta criticidad

#### Muy alta criticidad

- autenticación central
- pagos
- checkout
- autorización de acceso sensible

#### Criticidad media

- panel administrativo
- búsquedas internas
- sincronización no inmediata

#### Criticidad más baja o diferida

- reportes batch
- notificaciones no urgentes
- dashboards secundarios
- tareas de limpieza nocturna

Si tratás todo como misión crítica, terminás gastando demasiado.
Si tratás todo como secundario, rompés flujos centrales.

La confiabilidad madura exige priorización.

## Elegir números “bonitos” sin contexto es mala práctica

A veces aparecen decisiones como:

- “pongamos 99,99% porque suena profesional”
- “nuestro competidor dice 99,9%, copiemos eso”
- “si no es cinco nueves, no sirve”

Eso es pobre ingeniería.

Cada decimal adicional encarece muchísimo la operación.
Y muchas veces el negocio ni siquiera necesita ese nivel.

Conviene razonar cosas como:

- impacto real del fallo
- frecuencia de uso
- costo de mejorar confiabilidad
- arquitectura disponible
- dependencia de terceros
- valor económico del flujo
- tolerancia del usuario

No toda capacidad merece el mismo nivel de obsesión operativa.

## Confiabilidad parcial: a veces lo importante no es todo el sistema, sino el flujo clave

Otra idea útil es ésta:

muchas veces no necesitás definir objetivos enormes sobre “la plataforma” como una masa indiferenciada.

Puede ser mejor empezar por algunos flujos importantes.

Por ejemplo:

- login
- creación de orden
- cobro aprobado
- generación de factura
- exportación completa
- ingestión de eventos

Esto ayuda porque vuelve el trabajo mucho más concreto.

En lugar de una declaración vaga como:

- “el sistema debe ser confiable”

pasás a algo medible, como:

- “el 99,5% de los checkouts debe completarse exitosamente en menos de 2 segundos durante 30 días”

Eso ya permite diseñar observabilidad, alertas, investigación y prioridades alrededor de una capacidad específica.

## Buenas prácticas para empezar sin complicarse de más

Un error frecuente es querer definir veinte SLO perfectos de entrada.

Eso suele terminar mal.

Conviene empezar más chico.

### 1. Elegí pocos flujos críticos

No arranques por todo el sistema.
Elegí las capacidades que más importa proteger.

### 2. Definí indicadores que realmente representen éxito

No te quedes en métricas cómodas si no expresan la experiencia o la capacidad real.

### 3. Usá ventanas razonables

Ni hiperreactivas sin sentido, ni tan largas que oculten problemas graves.

### 4. Acordá los objetivos con contexto de negocio y producto

La confiabilidad no es solo una decisión de infraestructura.
Implica costo, riesgo y valor.

### 5. Revisá periódicamente si el objetivo sigue teniendo sentido

Un SLO viejo puede dejar de reflejar la realidad del producto.

### 6. No conviertas todo incumplimiento en pánico instantáneo

Los SLO sirven para gobernar, aprender y priorizar, no para teatralizar cada desvío.

## Qué errores son muy comunes al implementar SLO

### 1. Definir SLI que no representan al usuario ni al flujo real

Entonces el tablero se ve bien mientras el problema importante sigue vivo.

### 2. Poner objetivos imposibles de sostener

Eso desgasta al equipo y vuelve inútil la medición.

### 3. No vincular los objetivos con decisiones reales

Si nadie cambia prioridades cuando el error budget se agota, el sistema de objetivos queda decorativo.

### 4. Medir solo uptime global

Y perder fallos funcionales, degradaciones parciales o problemas concentrados en un flujo clave.

### 5. No segmentar cuando hace falta

Ciertos tenants, regiones o versiones pueden sufrir muchísimo más que el promedio general.

### 6. Tratar los SLO como una herramienta solo de infraestructura

Cuando en realidad impactan producto, releases, roadmap y soporte.

### 7. No revisar si los umbrales siguen alineados con el producto actual

Un objetivo razonable hoy puede ser absurdo seis meses después.

## Relación entre observabilidad y SLO

Este tema se apoya directamente en el anterior.

Sin observabilidad suficiente, los SLO quedan en PowerPoint.

Necesitás métricas y señales confiables para poder responder:

- cuánto éxito hubo realmente
- cuál fue la latencia percibida
- qué flujo falló
- cuánto error budget queda
- qué región o versión está consumiéndolo

Dicho simple:

- la observabilidad te permite ver
- los SLO te ayudan a decidir qué significa “estar bien”

Una cosa sin la otra queda incompleta.

## Ejemplo conceptual: un e-commerce real

Imaginá un e-commerce con estas capacidades:

- navegación de catálogo
- login
- checkout
- panel interno de administración
- emails post-compra

No tendría mucho sentido aplicar el mismo objetivo a todo.

Podrías pensar algo así:

### Checkout

Muy crítico.
Necesita un objetivo fuerte de éxito y latencia.

### Login

Crítico.
Si se rompe, bloquea usuarios registrados.

### Catálogo público

Importante, pero quizá con tolerancias distintas según el tipo de consulta.

### Panel admin

Importante para operación, pero no necesariamente con el mismo nivel que pagos.

### Emails post-compra

Valiosos, pero quizá admisibles con demora moderada si la orden quedó bien registrada.

Este tipo de diferenciación permite invertir esfuerzo donde realmente importa.

## SLO también ayuda a tener conversaciones más maduras con producto

Muchas tensiones entre ingeniería y producto mejoran cuando existe un lenguaje compartido.

En lugar de discutir en abstracto:

- “no podemos seguir lanzando tan rápido”
- “necesitamos movernos más”

podés decir algo más concreto:

- “el error budget del flujo de checkout se consumió un 80% en una semana”
- “la nueva versión elevó el p95 y empeoró el porcentaje de éxito”
- “si seguimos agregando cambios sobre este estado, el riesgo operativo crece mucho”

Eso hace que la conversación se vuelva más adulta.

No garantiza acuerdo automático.
Pero mejora mucho el terreno donde se decide.

## Qué deberías llevarte de esta lección

Si tuvieras que quedarte con una idea, que sea ésta:

**la confiabilidad útil no se gestiona con intuición vaga, sino con indicadores y objetivos que expresan qué nivel de servicio querés sostener realmente.**

Eso implica aprender a pensar en:

- SLI como indicador representativo de una capacidad importante
- SLO como objetivo concreto sobre ese indicador
- SLA como compromiso contractual distinto
- error budget como margen de fallo tolerado
- confiabilidad como equilibrio entre estabilidad, costo y velocidad de cambio
- criticidad distinta según flujo, producto y contexto
- necesidad de elegir bien qué medir y no solo medir lo cómodo

Un backend maduro no solo implementa features.
También define qué calidad de servicio considera aceptable y cómo va a defenderla.

## Cierre

Cuando un equipo no define objetivos claros de servicio, la confiabilidad queda a merced de sensaciones, discusiones parciales y urgencias cambiantes.

Cuando sí los define bien, pasa algo mucho más valioso.

El sistema deja de evaluarse solo por percepciones vagas.
Empieza a medirse contra expectativas explícitas.
El riesgo se vuelve más visible.
Las tensiones entre estabilidad y velocidad se vuelven negociables con más criterio.
Y la operación gana una brújula mejor.

Eso no elimina incidentes.
No evita toda degradación.
No reemplaza arquitectura, testing ni observabilidad.

Pero sí aporta algo fundamental:

**una forma concreta de decidir cuándo el servicio está cumpliendo, cuándo está fallando demasiado y cómo actuar frente a eso.**

Y en ese punto aparece el siguiente paso natural.

Porque una vez que definís confiabilidad de manera explícita, necesitás saber cómo responder cuando igual ocurre el incidente:

quién actúa, con qué procedimientos, cómo se escala, cómo se documenta, cómo se reduce improvisación y cómo se opera bajo presión sin depender de memoria heroica.

Ahí entramos en el próximo tema: **runbooks, on-call y operación de incidentes**.
