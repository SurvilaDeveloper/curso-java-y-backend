---
title: "Chaos engineering básico y validación de resiliencia"
description: "Qué es chaos engineering, por qué no consiste en romper sistemas por diversión, cómo usarlo para validar supuestos de resiliencia, detectar fragilidad operativa antes de un incidente real y diseñar experimentos seguros que fortalezcan un backend en producción." 
order: 149
module: "Seguridad y operación avanzada"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior hablamos de **capacity planning y forecasting técnico**.

Ahí vimos que operar sistemas reales no consiste solamente en reaccionar frente a incidentes, sino también en anticipar:

- crecimiento
- saturación
- cuellos de botella
- backlog
- límites operativos
- costos de capacidad

Eso nos obligó a pensar una idea importante:

**un sistema no se vuelve confiable solo porque hoy parece aguantar.**

Puede tener margen.
Puede mostrar métricas razonables.
Puede atravesar días normales sin problemas.
Y aun así esconder fragilidades severas.

¿Por qué?

Porque una cosa es observar el sistema en condiciones normales.
Y otra muy distinta es entender cómo se comporta cuando algo sale mal.

Y en sistemas reales, algo sale mal tarde o temprano.

Por ejemplo:

- una dependencia externa empieza a responder lento
- un nodo desaparece
- una base replica con lag inesperado
- una cola se atrasa
- una configuración queda mal desplegada
- una caché se vacía por completo
- una región se degrada
- un proveedor devuelve errores intermitentes
- un timeout mal configurado dispara una tormenta de reintentos

En muchos equipos, la resiliencia se da por supuesta.
Se cree que existe porque:

- hay retries
- hay circuit breakers
- hay réplicas
- hay alertas
- hay autoscaling
- hay backups
- hay runbooks

Pero eso no siempre significa que el sistema realmente resista bien.

A veces solo significa que **esperamos** que resista.

Y ahí aparece este tema.

**Chaos engineering** busca poner a prueba esa expectativa.

No para romper por romper.
No para generar miedo.
No para jugar a sabotear producción.

Sino para responder con evidencia preguntas como estas:

- ¿qué pasa de verdad si falla esta dependencia?
- ¿la degradación controlada funciona como creemos?
- ¿nuestros timeouts están bien elegidos?
- ¿el sistema conserva disponibilidad suficiente cuando pierde una parte de su capacidad?
- ¿las alertas saltan como deberían?
- ¿el equipo detecta el problema a tiempo?
- ¿la recuperación automática existe de verdad o solo en diagramas?

En esta lección vamos a ver:

- qué es y qué no es chaos engineering
- por qué sirve para validar resiliencia y no solo para generar fallas
- qué tipo de hipótesis conviene probar
- cómo diseñar experimentos seguros
- qué riesgos evitar
- cómo usar esta práctica sin caer en show técnico ni irresponsabilidad operativa
- cómo conectar caos controlado con observabilidad, SLOs, runbooks y aprendizaje real

## Qué es chaos engineering

**Chaos engineering** es la práctica de introducir fallas o condiciones adversas de manera deliberada, controlada y observable para aprender cómo responde un sistema y validar si su resiliencia es real.

La palabra importante no es “chaos”.
La palabra importante es **engineering**.

Porque no se trata de causar desorden sin criterio.
Se trata de diseñar experimentos.

Es decir:

- partir de una hipótesis
- introducir una perturbación controlada
- observar el comportamiento del sistema
- comparar lo observado con lo esperado
- aprender
- corregir fragilidades

Dicho de otra manera:

chaos engineering no busca preguntar solamente:

- ¿se puede romper?

Eso sería trivial.
Casi todo sistema puede romperse.

La pregunta útil es otra:

- ¿cómo se degrada?
- ¿qué mecanismos de protección realmente funcionan?
- ¿qué supuestos de resiliencia estaban equivocados?
- ¿qué tan rápido detectamos y entendemos la falla?
- ¿el sistema sigue entregando valor suficiente bajo condiciones adversas?

## Qué no es chaos engineering

Conviene despejar varios malentendidos.

### No es romper producción porque sí

No es elegir una pieza al azar y apagarla para ver qué pasa.

### No es una demostración de valentía técnica

No sirve para mostrar que “somos un equipo maduro” si no hay hipótesis, observabilidad ni límites.

### No reemplaza testing tradicional

No sustituye:

- unit tests
- integration tests
- contract tests
- performance tests
- disaster recovery drills

Lo complementa.

### No empieza por el experimento más agresivo

Un enfoque serio suele arrancar chico:

- en ambientes controlados
- con radio de impacto limitado
- con rollback claro
- con métricas definidas

### No es magia de resiliencia

No vuelve robusto a un sistema por el solo hecho de practicarlo.

Lo que vuelve más robusto al sistema es lo que hacés **después** de descubrir la fragilidad.

## Por qué sirve

Muchos equipos diseñan mecanismos de resiliencia que nunca validan de manera realista.

Por ejemplo:

- creen que un circuit breaker abrirá a tiempo, pero no se dispara como esperaban
- creen que un timeout protege, pero en realidad es tan alto que el sistema se ahoga antes
- creen que el autoscaling compensa una degradación, pero tarda demasiado
- creen que el failover es automático, pero requiere pasos manuales no documentados
- creen que las alertas alcanzan, pero llegan tarde o son ambiguas
- creen que la degradación parcial conserva el servicio, pero la interfaz principal depende de una ruta frágil

Chaos engineering sirve justamente para transformar supuestos en evidencia.

Y eso vale muchísimo.

Porque en resiliencia, los errores de diagnóstico más caros suelen ser errores de confianza injustificada.

No es que “no sabíamos nada”.
Es que creíamos que algo estaba resuelto y no lo estaba.

## La idea central: validar hipótesis de resiliencia

Un experimento de caos serio suele empezar con una hipótesis explícita.

Por ejemplo:

- si la dependencia de emails falla durante 20 minutos, el checkout principal debería seguir funcionando
- si una instancia de workers cae, la cola debería seguir drenando dentro de un umbral aceptable
- si Redis se vuelve más lento, el sistema debería degradar latencia pero no perder disponibilidad total
- si un proveedor externo devuelve 5xx, el circuit breaker debería abrir y evitar tormenta de retries
- si se pierde una zona, el tráfico debería redistribuirse sin violar el SLO de disponibilidad crítica

Fijate el cambio mental.

No empezamos diciendo:

- “vamos a apagar algo”

Empezamos diciendo:

- “creemos que el sistema reaccionará de esta manera ante esta falla”

Eso vuelve el ejercicio muchísimo más útil.

Porque ahora podemos evaluar:

- si la hipótesis estaba bien formulada
- si la instrumentación permite observar el efecto
- si la respuesta del sistema coincide con lo esperado
- si el impacto fue mayor, menor o distinto a lo previsto

## Resiliencia no es invulnerabilidad

Un error conceptual frecuente es pensar que un sistema resiliente es un sistema que nunca se degrada.

Eso casi nunca es realista.

En la práctica, resiliencia suele significar algo más matizado:

- degradar de manera controlada
- mantener funciones críticas
- aislar fallas
- recuperarse razonablemente rápido
- evitar propagación descontrolada
- conservar suficiente calidad de servicio

Por eso, muchos experimentos de caos no buscan que “todo siga idéntico”.

Buscan validar cosas como:

- qué funcionalidades sobreviven
- cuáles se degradan aceptablemente
- cuáles son demasiado frágiles
- si la recuperación ocurre dentro de lo tolerable

Es decir:

**la resiliencia real no se mide solo por ausencia de caída, sino por la calidad de la degradación y la capacidad de recuperación.**

## Tipos de fallas que suele tener sentido simular

No todas las fallas sirven al mismo tiempo.

Un enfoque sano empieza por perturbaciones frecuentes, plausibles y bien observables.

### 1. Caída de una instancia o nodo

Sirve para validar:

- redistribución de carga
- health checks
- reemplazo automático
- impacto sobre latencia o throughput

### 2. Latencia artificial en una dependencia

Muy útil porque muchas veces el problema real no es la caída total, sino la lentitud parcial.

Sirve para validar:

- timeouts
- bulkheads
- retries
- circuit breakers
- comportamiento del pool de conexiones

### 3. Errores intermitentes de un proveedor externo

Sirve para observar:

- manejo de errores
- backoff
- impacto sobre colas
- calidad de la degradación funcional

### 4. Pérdida de caché o caída del layer de cache

Sirve para descubrir:

- presión sobre base de datos
- fragilidad de rutas calientes
- comportamiento del warming
- riesgo de thundering herd

### 5. Saturación parcial de recursos

Por ejemplo:

- CPU alta
- memoria restringida
- I/O degradado
- límite de threads

Sirve para ver cómo se comporta el sistema bajo estrés sin necesidad de apagarlo por completo.

### 6. Retraso o detención temporal de consumidores asíncronos

Sirve para validar:

- crecimiento de backlog
- velocidad de recuperación
- visibilidad operativa
- impacto en procesos downstream

### 7. Fallas de red o pérdida de conectividad parcial

Éste es un caso muy interesante porque muchos sistemas toleran mejor caídas explícitas que conectividad degradada o intermitente.

## Latencia y errores parciales suelen enseñar más que la caída total

Esto merece una mención aparte.

En la imaginación del equipo, muchas veces el escenario dramático es:

- “el servicio X se cae por completo”

Pero en la realidad operativa, los problemas más incómodos suelen venir de estados intermedios:

- respuestas lentas
- errores intermitentes
- timeouts parciales
- degradación por percentiles altos
- comportamiento no determinístico

¿Por qué importa tanto esto?

Porque los estados intermedios disparan muchos efectos secundarios peligrosos:

- acumulación de requests activas
- saturación de threads
- agotamiento de pools
- retries en cascada
- circuit breakers mal calibrados
- colas que crecen lento pero sostenidamente

Por eso, en chaos engineering, simular lentitud suele ser tan o más valioso que simular caída total.

## Dónde conviene empezar

No hace falta ni conviene arrancar en el entorno más crítico.

Un recorrido razonable suele ser:

### 1. Validación en desarrollo o laboratorio

Para comprobar que la mecánica del experimento funciona y que se observa algo útil.

### 2. Ambientes de staging o preproducción

Para ensayar sobre una topología más parecida a la real.

### 3. Producción con radio de impacto mínimo

Cuando el equipo ya entiende:

- qué quiere validar
- qué métricas observar
- cómo cortar el experimento
- qué riesgos asumibles existen

La clave no es “hacer caos en producción cuanto antes”.
La clave es **ganar confianza metodológica**.

## El concepto de blast radius

En seguridad y resiliencia aparece mucho la idea de **blast radius**: el radio de impacto posible de una falla o experimento.

En chaos engineering esto es central.

Antes de introducir una perturbación conviene definir:

- qué parte del sistema puede afectarse
- qué usuarios o tenants podrían verse alcanzados
- qué métricas marcarían que el experimento debe detenerse
- qué umbral de impacto es aceptable

Ejemplos de reducción de blast radius:

- atacar una sola instancia y no todo el cluster
- aplicar latencia solo a una ruta concreta
- experimentar fuera de horarios de máximo riesgo
- excluir tenants sensibles
- limitar duración a pocos minutos
- tener kill switch explícito

Un equipo serio no demuestra madurez por asumir impacto ilimitado.
La demuestra por diseñar aprendizaje con control.

## Qué necesita un experimento antes de empezar

Hay varias condiciones mínimas.

### Hipótesis clara

No basta con “veamos qué pasa”.

Hay que explicitar:

- qué falla simulamos
- qué esperamos observar
- qué funcionalidad debería conservarse
- qué degradación sería aceptable

### Observabilidad suficiente

Si no podés mirar bien el experimento, aprendés poco.

Conviene tener al menos:

- métricas relevantes
- dashboards a mano
- logs útiles
- trazas si aplica
- alertas relevantes
- visión del impacto sobre usuario o negocio

### Criterio de abortar

Hay que saber antes de empezar:

- cuándo cortar
- quién puede cortar
- qué señal indica que el costo del aprendizaje ya es demasiado alto

### Contención operacional

Tiene que estar claro:

- quién participa
- qué ventana se usa
- cómo se comunica
- qué runbook aplica si algo sale peor de lo esperado

### Aprendizaje esperado

No todos los experimentos valen la pena.

Conviene preguntarse:

- ¿qué decisión mejoraría si este experimento nos sale bien o mal?
- ¿qué incertidumbre real estamos reduciendo?

## Qué mirar durante el experimento

No alcanza con verificar si “siguió vivo”.

Conviene observar varias capas.

### Señales técnicas

- latencia p50, p95, p99
- tasa de errores
- consumo de CPU y memoria
- saturación de pools
- backlog en colas
- throughput
- apertura de circuit breakers
- retries
- timeouts

### Señales funcionales

- qué operación de negocio quedó degradada
- si el usuario puede completar el flujo crítico
- si existe fallback real y usable
- qué función secundaria puede omitirse sin romper lo principal

### Señales operativas

- si la alerta llegó
- cuánto tardó
- si el equipo entendió rápido la situación
- si los dashboards ayudaron o confundieron
- si el runbook alcanzó

### Señales de negocio

- caída en conversión
- retraso en órdenes
- pérdida temporal de eventos
- impacto por tenant
- degradación en SLA comprometido

## Algunos ejemplos concretos de hipótesis útiles

### Ejemplo 1: dependencia no crítica

Hipótesis:

- si el proveedor de email falla, el sistema debe seguir permitiendo registro y checkout, dejando el envío para reintento asíncrono

Qué validar:

- desacople real entre flujo principal y notificación
- visibilidad del backlog
- capacidad de reintento posterior

### Ejemplo 2: caché compartida

Hipótesis:

- si Redis se degrada durante 5 minutos, la API principal debería aumentar latencia, pero no superar cierto umbral de error

Qué validar:

- presión sobre base
- eficacia de timeouts
- uso de fallback
- riesgo de cascada

### Ejemplo 3: workers de procesamiento

Hipótesis:

- si se pierde 30% de workers, la cola debería acumularse pero vaciarse dentro de una ventana razonable una vez recuperada la capacidad

Qué validar:

- backlog tolerable
- recuperación
- elasticidad del procesamiento

### Ejemplo 4: proveedor externo crítico

Hipótesis:

- si el gateway de pagos responde con 5xx intermitente, el sistema debe evitar retries agresivos y exponer un error controlado al usuario

Qué validar:

- no saturación del proveedor
- no tormenta de reintentos
- buena semántica de error
- no duplicación de operaciones sensibles

## Qué suele descubrir un equipo cuando empieza a practicarlo

Los hallazgos más comunes no siempre son los que uno espera.

Muchas veces aparecen problemas como:

- dashboards que no muestran justo la métrica importante
- alertas que llegan demasiado tarde
- documentación incompleta
- timeouts inconsistentes entre servicios
- retries sin jitter ni backoff
- dependencias “opcionales” que en realidad son obligatorias
- jobs que no recuperan bien tras backlog
- circuit breakers presentes pero mal configurados
- mecanismos de fallback que existen en teoría, pero no están conectados en la ruta real
- demasiado acoplamiento entre caminos críticos y secundarios

Fijate que esto lo vuelve muy valioso.

No solo enseña sobre infraestructura.
También revela:

- problemas de diseño
- problemas de operación
- problemas de observabilidad
- problemas de coordinación del equipo

## La diferencia entre experimento útil y show técnico

Hay una frontera importante.

Un experimento útil:

- parte de una hipótesis concreta
- tiene métricas definidas
- reduce incertidumbre real
- deja aprendizaje accionable
- produce correcciones posteriores

Un show técnico:

- busca impresionar
- introduce fallas grandes sin objetivo claro
- no tiene umbrales ni contención
- no deja mejoras concretas
- se vuelve una anécdota y no una práctica de ingeniería

En otras palabras:

**si no cambia ninguna decisión ni mejora ninguna protección, probablemente no fue un buen experimento.**

## Qué riesgos evitar

### 1. Empezar demasiado grande

Apagar demasiado, demasiado pronto, suele enseñar menos y arriesgar más.

### 2. Hacerlo sin observabilidad suficiente

Sin buenos datos, solo generás ruido.

### 3. No definir criterios de stop

Eso convierte el experimento en improvisación peligrosa.

### 4. Confundir resiliencia con heroísmo operativo

Si cada experimento exige salvar todo manualmente, estás validando dependencia del esfuerzo humano, no resiliencia sistémica.

### 5. No corregir nada después

Sin follow-up, el ejercicio pierde gran parte de su valor.

### 6. Elegir escenarios irrelevantes

Conviene priorizar fallas plausibles y costosas, no rarezas exóticas que casi nunca ocurren.

## Frecuencia y madurez

No todos los equipos necesitan el mismo nivel de formalidad.

Una progresión razonable podría verse así:

### Etapa 1: experimentos manuales y pequeños

- una hipótesis puntual
- una perturbación acotada
- observación intensiva
- aprendizaje rápido

### Etapa 2: práctica periódica

- escenarios recurrentes
- playbooks de experimentación
- métricas ya preparadas
- seguimiento posterior

### Etapa 3: automatización parcial

- experimentos repetibles
- ventanas predefinidas
- integración con tooling de plataforma
- validación continua de resiliencia

No hace falta ir a la etapa 3 para obtener valor.
Muchos equipos mejoran muchísimo ya en la etapa 1 o 2.

## Relación con SLOs y error budgets

Este tema conecta directamente con **SLO, SLI, error budgets y confiabilidad**.

¿Por qué?

Porque un experimento de caos no se evalúa en abstracto.
Se evalúa contra un nivel de servicio esperado.

Preguntas útiles:

- ¿la perturbación hizo que crucemos el umbral del SLO?
- ¿cuánto error budget consumimos?
- ¿esa degradación era aceptable para la criticidad del sistema?
- ¿la recuperación ocurrió dentro de lo tolerable?

Sin esa conexión, el análisis queda demasiado vago.

## Relación con runbooks y operación de incidentes

También conecta fuertemente con **runbooks, on-call y operación de incidentes**.

Porque muchos experimentos sirven para validar no solo el sistema, sino la preparación operativa del equipo.

Por ejemplo:

- ¿el runbook era entendible?
- ¿los pasos estaban actualizados?
- ¿quién debía intervenir estaba claro?
- ¿las alertas conducían a la acción correcta?
- ¿la escalación era razonable?

A veces el sistema técnico responde aceptablemente, pero la operación humana falla.
Y eso también es una fragilidad importante.

## Relación con incidentes reales

Una buena fuente de experimentos útiles son los postmortems.

Si un incidente real mostró que:

- una dependencia lenta propagó latencia
- un backlog tardó horas en recuperarse
- una alerta llegó tarde
- un fallback no funcionó

Entonces aparece una oportunidad excelente:

convertir esa lección en un experimento repetible.

Eso evita que el aprendizaje quede solo como documento histórico.
Lo transforma en validación continua.

## Qué deberías llevarte de esta lección

Si tuvieras que quedarte con una sola idea, que sea ésta:

**chaos engineering no consiste en romper sistemas para ver si sobreviven, sino en validar con evidencia si la resiliencia que creemos tener existe de verdad y en qué condiciones deja de alcanzar.**

Eso implica aprender a pensar en:

- hipótesis explícitas
- degradación controlada
- radio de impacto limitado
- observabilidad suficiente
- abortar a tiempo si el costo crece demasiado
- aprendizaje accionable después del experimento

También implica aceptar algo importante:

muchas veces la primera victoria de esta práctica no es descubrir una gran fortaleza, sino descubrir una fragilidad que todavía estábamos a tiempo de corregir.

Y eso ya vale muchísimo.

## Cierre

Los sistemas complejos suelen parecer robustos… hasta que una condición incómoda revela que varias protecciones eran más teóricas que reales.

Un timeout demasiado largo.
Un retry mal calibrado.
Un fallback que nadie había probado.
Una alerta que no orienta.
Una dependencia “secundaria” que en realidad es crítica.

Chaos engineering básico aporta una disciplina muy valiosa porque obliga a salir del optimismo arquitectónico.

En vez de preguntar solamente:

- ¿qué diseñamos para resistir?

Pasa a preguntar:

- ¿qué evidencia tenemos de que realmente resiste?
- ¿cómo se degrada cuando el mundo no coopera?
- ¿qué parte del sistema sigue siendo confiable y cuál no?
- ¿qué deberíamos fortalecer antes del próximo incidente real?

Cuando esa mentalidad aparece, la resiliencia deja de ser una palabra linda en una presentación y empieza a convertirse en una propiedad validada del sistema.

Y desde ahí, el siguiente paso natural es cerrar la etapa.

Porque después de recorrer autenticación, autorización, hardening, secretos, auditoría, incidentes, backups, observabilidad, confiabilidad, runbooks, capacity planning y validación de resiliencia, ya estamos en condiciones de sintetizar todo lo aprendido.

Ahí entramos en el próximo tema: **cierre de etapa: seguridad y operación como parte del producto**.
