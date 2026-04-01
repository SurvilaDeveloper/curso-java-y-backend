---
title: "Performance y profiling básico en backend Java"
description: "Cómo empezar a detectar cuellos de botella en un backend Java, qué métricas mirar y qué herramientas y hábitos ayudan a mejorar rendimiento con criterio."
order: 68
module: "Operación y rendimiento"
level: "intermedio"
draft: false
---

## Introducción

Hasta ahora ya recorriste una parte muy amplia del backend con Java y Spring Boot:

- controllers
- services
- DTOs
- validaciones
- persistencia
- seguridad
- testing
- observabilidad
- cache
- integraciones externas
- resiliencia
- transacciones
- Testcontainers

Eso ya te permite construir sistemas bastante serios.

Pero cuando una aplicación empieza a tener más datos, más usuarios o más tráfico, aparece una pregunta muy importante:

**¿cómo sabés qué parte del sistema está lenta y cómo mejorás rendimiento sin romper nada ni optimizar a ciegas?**

Ahí entra performance y profiling.

## La idea general

Hablar de rendimiento no significa solamente “hacer que todo vuele”.

Significa, sobre todo:

- entender cómo se comporta la aplicación
- detectar cuellos de botella reales
- medir antes de cambiar
- optimizar con criterio
- evitar cambios impulsivos que complican el diseño sin aportar valor

## Qué es performance

Performance es el comportamiento del sistema respecto a cosas como:

- tiempo de respuesta
- uso de CPU
- uso de memoria
- throughput
- carga soportada
- latencia bajo estrés
- eficiencia de consultas y operaciones

## Qué es profiling

Profiling es el análisis del comportamiento interno de la aplicación para entender en qué está gastando tiempo o recursos.

Dicho simple:

el profiling te ayuda a responder preguntas como:

- ¿qué método consume más tiempo?
- ¿qué operación está alocando demasiada memoria?
- ¿qué parte del flujo se repite demasiado?
- ¿qué llamada externa está frenando todo?
- ¿qué consulta a base es la verdadera culpable?

## Qué problema resuelve

Performance y profiling ayudan a resolver uno de los errores más comunes al crecer un backend:

**optimizar lo equivocado**

Muchas veces alguien ve que “la app está lenta” y empieza a tocar cualquier cosa:

- refactor raro
- cache prematura
- concurrencia innecesaria
- microoptimizaciones insignificantes

sin saber dónde está el problema real.

## Por qué esto importa tanto

Porque en backend los cuellos de botella pueden vivir en muchos lugares distintos:

- SQL lento
- N+1 queries
- serialización pesada
- loops innecesarios
- integración externa lenta
- locks o contención
- falta de índices
- exceso de logs
- demasiados objetos en memoria
- mal uso de cache

Si no medís, es muy fácil culpar a la parte equivocada.

## Regla mental importantísima

Antes de optimizar:

**medí**

Y antes de medir:

**definí qué significa “lento” para ese caso**

## Qué significa “lento”

No siempre significa lo mismo.

Por ejemplo:

- un login que tarda 200 ms quizás está perfecto
- una búsqueda que tarda 8 segundos quizá es inaceptable
- un reporte pesado que tarda 2 segundos tal vez sea razonable
- una llamada a una API crítica que tarda 10 segundos probablemente no lo sea

Necesitás contexto.

## Qué conviene mirar primero

Una primera capa bastante sana de análisis de rendimiento suele mirar:

- latencia
- throughput
- uso de memoria
- uso de CPU
- tiempos de queries
- llamadas externas
- frecuencia de errores o timeouts

## Latencia

Latencia es cuánto tarda una operación en completarse.

Por ejemplo:

- cuánto tarda `GET /products`
- cuánto tarda `POST /orders`
- cuánto tarda una llamada a la base
- cuánto tarda una integración externa

## Throughput

Throughput es cuánto trabajo puede procesar el sistema en cierto tiempo.

Por ejemplo:

- requests por segundo
- órdenes procesadas por minuto
- mensajes consumidos por segundo

## Uso de memoria

Importa para detectar cosas como:

- consumo excesivo
- objetos retenidos innecesariamente
- presión de GC
- riesgo de out of memory

## Uso de CPU

Ayuda a entender si la app está gastando demasiado procesamiento en algo que quizás podría optimizarse.

## Qué señales típicas indican problemas de rendimiento

Por ejemplo:

- endpoints lentos
- carga de CPU alta
- consumo de memoria creciente
- muchas queries SQL por request
- timeouts frecuentes
- GC excesivo
- picos de latencia
- degradación con pocos usuarios concurrentes

## Performance y observabilidad

Esto conecta fuertemente con la lección de observabilidad.

Porque antes de profiling profundo, muchas veces ya podés detectar pistas con:

- logs
- métricas
- Actuator
- tiempos de response
- métricas de base
- errores de integración

## Qué gana tu sistema si ya tiene observabilidad

Muchísimo.

Porque el primer diagnóstico de performance rara vez empieza directamente con un profiler sofisticado.

Muchas veces empieza con algo como:

- “este endpoint pasó de 120 ms a 1800 ms”
- “esta query aparece 250 veces por request”
- “la memoria sube cada hora”
- “el servicio de shipping tarda 3 segundos promedio”

## SQL y performance

Uno de los lugares donde más seguido aparece el problema real en backend es la base de datos.

Especialmente con:

- queries mal pensadas
- joins costosos
- falta de índices
- filtros débiles
- N+1 queries
- traer más datos de los necesarios

## N+1

Ya lo mencionamos indirectamente antes, pero acá conviene volver a remarcarlo.

N+1 es cuando una operación que parecía simple termina haciendo muchas queries extra.

Por ejemplo:

1. traés una lista de órdenes
2. por cada orden, se consulta aparte el usuario o los items
3. el total de queries explota

Eso puede matar performance rápidamente.

## Ejemplo mental

Querías cargar 20 órdenes.

Pero en realidad terminaste haciendo:

- 1 query para órdenes
- 20 queries para items
- 20 queries para usuarios

Total:
41 queries

Eso ya es una pista clarísima.

## Por qué esto importa tanto

Porque muchas veces “Java está lento” no es cierto.

Lo que está lento es:

- la estrategia de acceso a datos
- el modelado de relaciones
- la consulta SQL generada

## Qué conviene revisar primero en persistencia

- cuántas queries se ejecutan
- cuánto tardan
- qué datos traen
- si hay índices
- si hay eager/lazy mal usados
- si un filtro podría resolverse mejor en base

## Performance y serialización

A veces el problema no está solo en base, sino también en:

- respuestas JSON muy grandes
- DTOs excesivos
- relaciones anidadas gigantes
- serialización de estructuras innecesarias

Por eso devolver solo lo necesario sigue siendo muy importante.

## Performance y cache

También conecta con Redis y cache.

A veces una operación lenta puede mejorar mucho si:

- el dato se consulta muchísimo
- cambia poco
- el costo de recomputarlo es alto

Pero otra vez:
primero conviene medir y entender el cuello de botella real.

## Performance e integraciones externas

Otro lugar muy frecuente de lentitud.

Por ejemplo:

- proveedor de pagos
- API de logística
- email
- facturación externa
- otros microservicios

Si una integración tarda 4 segundos, ese puede ser el cuello de botella real, no tu código interno.

## Qué conviene medir ahí

- tiempo total de llamada
- cantidad de timeouts
- porcentaje de errores
- retries
- circuit breaker openings
- fallback usage

## Profiling de CPU

A nivel conceptual, un profiler de CPU ayuda a ver en qué métodos o flujos la aplicación gasta más tiempo de ejecución.

Esto es útil para detectar:

- algoritmos costosos
- loops innecesarios
- llamadas repetidas
- partes inesperadamente pesadas

## Profiling de memoria

Un profiler de memoria ayuda a ver:

- qué objetos se crean mucho
- qué objetos se retienen demasiado
- dónde hay presión de memoria
- posibles leaks o retenciones no deseadas

## Qué no conviene asumir

No conviene asumir que el problema siempre es:

- Java
- Spring
- Hibernate
- “la JVM”

Muchas veces el verdadero problema está en diseño, consultas, payloads, integración externa o decisiones concretas del código.

## Microoptimizaciones

Otro tema importante.

No conviene perder muchísimo tiempo en microoptimizaciones irrelevantes si el problema real está en una query que tarda 3 segundos.

Por ejemplo, a veces alguien optimiza:

- una concatenación mínima
- una lambda
- una colección puntual

cuando el cuello real es:

- SQL
- red
- serialización
- I/O
- un endpoint mal diseñado

## Regla sana

Primero:
identificá el cuello real.

Después:
optimizá la parte que realmente impacta.

## Performance bajo carga

Una app puede funcionar bien con:

- 1 usuario
- 5 requests manuales

y degradarse mal con:

- 100 requests concurrentes
- operaciones repetidas
- mayor volumen de datos

Por eso también conviene pensar performance no solo en reposo, sino bajo cierta carga.

## Qué preguntarte

- ¿cómo se comporta con más usuarios?
- ¿qué endpoint escala peor?
- ¿qué recurso se satura primero?
- ¿base, CPU, memoria o dependencia externa?

## Performance y dominio

No todo “más rápido” es automáticamente “mejor”.

A veces una optimización que rompe claridad o reglas de negocio puede ser una mala decisión.

Conviene buscar equilibrio entre:

- corrección
- claridad
- mantenibilidad
- rendimiento

## Ejemplo mental

No vale la pena complicar todo el dominio con una arquitectura rarísima para ahorrar 5 ms en una operación irrelevante.

Pero sí vale la pena repensar una query o una carga de datos si eso te ahorra 3 segundos en un endpoint crítico.

## Herramientas mentales básicas de profiling

No hace falta empezar con una mega suite avanzada.

Una buena progresión puede ser:

1. mirar métricas y logs
2. identificar endpoint o flujo lento
3. medir tiempos internos
4. revisar SQL
5. observar llamadas externas
6. usar profiler si hace falta ir más profundo

## Timing manual razonable

Incluso antes de profiling profundo, a veces podés detectar bastante valor midiendo tiempos en zonas críticas.

Por ejemplo:

- cuánto tarda query
- cuánto tarda mapping
- cuánto tarda integración externa
- cuánto tarda serialización o armado de respuesta

Siempre con criterio y sin llenar el código de ruido permanente.

## Performance y Actuator

Actuator y métricas pueden ayudarte a ver cosas como:

- tiempos de request
- memoria
- threads
- comportamiento general del runtime

Eso ya da una base muy útil.

## Qué métricas suelen ser especialmente útiles

- latencia por endpoint
- errores por endpoint
- JVM memory usage
- GC activity
- conexiones activas
- tiempos de respuesta de integraciones
- tamaño o frecuencia de queries problemáticas, si las medís

## Performance y tests

También hay que ser realistas:

los tests funcionales no reemplazan pruebas de rendimiento.

Un test que pasa no significa que la app escale bien o responda rápido.

Performance necesita observación y, a veces, escenarios específicos de carga.

## Qué optimizaciones suelen dar mucho valor

En backend real, muy seguido dan mucho valor cosas como:

- mejorar queries
- agregar índices
- paginar
- reducir payloads
- cachear con criterio
- evitar N+1
- separar procesos lentos
- hacer asíncronas tareas no críticas
- mejorar integraciones externas

## Qué optimizaciones no conviene idolatrar

No conviene obsesionarse con:

- microdetalles sintácticos
- cambiar de colección sin evidencia
- refactors complicadísimos sin medición
- tuning prematuro sin cuello identificado

## Ejemplo mental realista

Caso:
`GET /orders/me` está lento.

Investigación razonable:

1. medir tiempo total
2. ver cuántas queries hace
3. detectar si hay N+1 en items
4. revisar si trae demasiados datos
5. ver si está serializando objetos enormes
6. revisar si hay joins o filtros sin índice
7. recién después optimizar

Ese camino suele ser mucho más sano que “probar cosas al azar”.

## Performance y concurrencia

A veces el problema aparece porque varias requests compiten por recursos.

Por ejemplo:

- locks
- recursos compartidos
- base saturada
- pool de conexiones chico
- threads bloqueados esperando integraciones

Esto muestra que el rendimiento no siempre vive solo dentro de un método aislado.

## Performance y garbage collection

No hace falta profundizar muchísimo ahora, pero conviene saber que la JVM gestiona memoria y eso también influye en rendimiento.

Un uso de memoria poco sano puede provocar más presión de GC y degradar tiempos de respuesta.

## Qué conviene sacar de esta etapa

No hace falta convertirte ahora en especialista en tuning profundo de JVM.

Lo más valioso de esta etapa es aprender a pensar así:

- medir
- observar
- localizar cuello
- entender causa
- optimizar con criterio
- volver a medir

## Performance y regresiones

Otra idea importante:
una optimización no debería evaluarse solo por intuición.

Conviene medir antes y después para saber si realmente mejoró algo.

Si no, podés introducir complejidad sin ganancia real.

## Buenas prácticas iniciales

## 1. Medir antes de optimizar

Siempre que puedas.

## 2. Buscar primero cuellos de botella grandes y reales

No microdetalles irrelevantes.

## 3. Revisar SQL y acceso a datos muy seriamente

Es una fuente frecuente de problemas.

## 4. Observar integraciones externas y payloads

No todo cuello está dentro de tu service.

## 5. Optimizar con cambios claros y luego volver a medir

Eso da aprendizaje real.

## Ejemplo conceptual de checklist

Si un endpoint está lento, podrías revisar:

- ¿cuánto tarda total?
- ¿cuántas queries hace?
- ¿hay N+1?
- ¿usa paginación?
- ¿devuelve demasiado JSON?
- ¿llama a integraciones lentas?
- ¿está cacheado donde tiene sentido?
- ¿hay índices?
- ¿CPU o memoria muestran algo raro?

## Comparación con otros lenguajes

### Si venís de JavaScript

Probablemente ya viste que un backend puede parecer “lento” por muchas razones distintas: queries, payloads, APIs externas, concurrencia. En Java y Spring Boot pasa exactamente lo mismo. La diferencia es que el ecosistema te da muy buenas herramientas para observar la JVM, el SQL y el comportamiento interno si sabés dónde mirar.

### Si venís de Python

Puede recordarte a la necesidad de perfilar antes de optimizar y a descubrir que muchas veces el verdadero problema no está donde primero imaginabas. En Java, esto se vuelve especialmente importante porque el stack puede involucrar JPA, serialización, GC, pools de conexiones e integraciones externas al mismo tiempo.

## Errores comunes

### 1. Optimizar sin medir

Es probablemente el error más clásico.

### 2. Culpar al framework sin evidencia

Muchas veces el problema real está en otro lado.

### 3. Ignorar SQL y acceso a datos

En backend eso suele costar caro.

### 4. Obsesionarse con microoptimizaciones irrelevantes

Mientras el cuello real sigue intacto.

### 5. No volver a medir después del cambio

Entonces no sabés si mejoraste o solo complicaste.

## Mini ejercicio

Tomá un endpoint importante de tu proyecto integrador y armá un plan de análisis de performance.

Definí:

1. qué síntomas de lentitud te preocuparían
2. qué métricas mirarías primero
3. qué parte sospecharías revisar:
   - SQL
   - serialización
   - integración externa
   - cache
   - CPU / memoria
4. qué cambios probarías primero
5. cómo verificarías si realmente mejoró

## Ejemplo posible

Endpoint:
`GET /orders/me`

- síntomas:
  - tarda más de 2 segundos
- mirar:
  - tiempo total
  - cantidad de queries
  - tamaño de response
- sospecha:
  - N+1 en items
  - demasiados datos
- cambio:
  - mejorar fetch / DTO / paginación
- verificar:
  - medir antes y después

## Resumen

En esta lección viste que:

- performance consiste en entender y mejorar cómo responde y escala el sistema
- profiling ayuda a detectar dónde se consumen tiempo y recursos
- conviene medir antes de optimizar
- en backend los cuellos de botella suelen aparecer mucho en SQL, integraciones externas, payloads y acceso a datos
- logs, métricas, observabilidad y análisis cuidadoso son la base de una mejora seria de rendimiento
- optimizar con criterio y volver a medir es una de las habilidades más valiosas en sistemas reales

## Siguiente tema

La siguiente natural es **seguridad avanzada: hardening, headers y defensa en profundidad**, porque después de haber recorrido arquitectura, testing, consistencia y rendimiento, otro paso muy valioso en un backend serio es fortalecer aún más la superficie de seguridad más allá de la autenticación básica.
