---
title: "Observabilidad en cloud y sistemas distribuidos"
description: "Cómo pensar logs, métricas, trazas, correlación y señales operativas en entornos cloud y arquitecturas distribuidas; qué cambia cuando los problemas ya no viven en una sola máquina y por qué observar no es solo recolectar datos sino poder explicar comportamientos reales del sistema."
order: 236
module: "Cloud, despliegue, carrera y proyecto final"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos algo importante:

**no alcanza con poder desplegar un backend; también necesitás poder entender qué está pasando una vez que ese backend corre en ambientes reales.**

Ahí aparece observabilidad.

Y acá conviene despejar una confusión muy común.

Observabilidad no es solamente:

- tener logs
- mirar un dashboard de CPU
- recibir alertas cuando algo cae
- instalar una herramienta conocida del mercado

Todo eso puede existir y, aun así, seguir sin entenderse el sistema.

En cloud y en arquitecturas distribuidas esto se vuelve todavía más evidente.

Porque cuando el backend ya no vive en un único proceso simple, sino en una combinación de:

- múltiples instancias
- contenedores efímeros
- colas
- bases administradas
- balanceadores
- servicios externos
- workers asíncronos
- caches
- pipelines de despliegue

entonces el problema deja de ser “ver si el server está prendido”.

El problema real pasa a ser éste:

**cómo reconstruir el comportamiento del sistema cuando una operación atraviesa muchas piezas, falla parcialmente, degrada el rendimiento o produce efectos inesperados.**

De eso trata este tema.

## Qué significa realmente observabilidad

La idea profunda no es “recolectar datos”.
La idea profunda es:

**poder inferir el estado interno de un sistema a partir de sus señales externas.**

O dicho más en términos prácticos:

si algo sale mal, lento, raro o impredecible, deberías tener suficiente información para responder preguntas útiles sin depender de adivinanzas.

Por ejemplo:

- qué request está fallando realmente
- dónde se está consumiendo el tiempo
- qué dependencia externa está degradada
- qué versión del servicio introdujo el problema
- si el error afecta a todos los clientes o a un subconjunto
- si el problema ocurre solo en cierto ambiente o zona
- si el origen está en aplicación, infraestructura, red, base de datos o integración externa

Eso es mucho más valioso que simplemente “ver mensajes” o “tener muchas métricas”.

## Por qué en cloud cambia tanto el problema

En sistemas simples, muchas veces observar era relativamente directo.

Un proceso corría en una máquina conocida.
Si fallaba, alguien miraba:

- archivo de logs
- consumo de recursos
- estado del proceso
- base local o servicio cercano

Pero en cloud esa intuición deja de alcanzar.

Porque ahora aparecen propiedades que vuelven el sistema mucho menos tangible:

### Infraestructura efímera

Las instancias nacen y mueren.
Un contenedor puede desaparecer junto con sus logs locales.
No podés depender de “entrar a la máquina” como estrategia principal.

### Escalado horizontal

Una misma operación puede pasar por instancias distintas.
El problema no vive necesariamente en una sola réplica.

### Dependencias distribuidas

Un request puede tocar:

- API gateway
- servicio A
- servicio B
- base de datos
- cache
- cola
- worker
- proveedor externo

Si no hay correlación entre señales, la historia se rompe en pedazos.

### Ambientes más complejos

Hay diferencias entre desarrollo, staging y producción.
Puede haber además múltiples regiones, zonas o tenants.

### Fallas parciales

El sistema puede no “caerse” por completo.
Puede seguir arriba mientras una parte responde lento, otra devuelve errores intermitentes y otra consume recursos de forma anómala.

En otras palabras:

**cloud no solo agrega escala; agrega opacidad. Y la observabilidad existe para pelear contra esa opacidad.**

## Las tres señales clásicas: logs, métricas y trazas

Suele hablarse de tres pilares clásicos de observabilidad.
No son toda la historia, pero siguen siendo una base muy útil.

## Logs

Los logs cuentan eventos discretos.
Sirven para registrar hechos:

- se recibió una request
- se disparó una operación importante
- ocurrió una validación fallida
- se produjo una excepción
- se llamó a un proveedor externo
- se ejecutó una tarea batch

Los logs son muy valiosos cuando están bien diseñados.

Pero también son un desastre cuando se los usa sin criterio.

Problemas típicos:

- mensajes sin contexto
- texto inconsistente
- niveles de severidad mal usados
- datos sensibles filtrados
- volumen inmanejable
- ausencia de correlación entre servicios

Un buen log no intenta narrar todo.
Un buen log intenta dejar evidencia útil para investigar comportamientos relevantes.

## Métricas

Las métricas resumen comportamiento agregado en el tiempo.

Sirven para responder preguntas como:

- cuántas requests por segundo entran
- qué latencia p95 tiene cierto endpoint
- cuántos errores 5xx aparecen por minuto
- cuánto tarda una query específica
- cuánta profundidad tiene una cola
- cuánta memoria usa una instancia

Las métricas son esenciales para:

- detectar degradaciones
- construir dashboards
- definir alertas
- medir tendencia y capacidad

Pero también tienen límites.

Las métricas muestran patrones agregados, no la historia detallada de una operación individual.

## Trazas

Las trazas intentan reconstruir el recorrido completo de una operación a través de varias piezas del sistema.

Son especialmente valiosas en arquitecturas distribuidas.

Por ejemplo, una traza puede mostrar:

- entrada por gateway
- paso por servicio de catálogo
- consulta a cache
- fallback a base de datos
- llamada a pricing
- llamada a stock
- publicación de evento
- respuesta final

Eso permite entender:

- dónde se consume el tiempo
- qué dependencia introduce latencia
- qué paso falló
- qué parte se ejecutó varias veces
- cómo se relacionan las operaciones entre sí

En sistemas distribuidos, las trazas suelen ser la diferencia entre “tenemos datos” y “realmente entendemos el incidente”.

## La observabilidad no es solo juntar las tres

Tener logs, métricas y trazas no garantiza observabilidad.

Podés tener:

- logs imposibles de buscar
- métricas sin semántica clara
- trazas incompletas
- dashboards bonitos pero inútiles
- alertas que nadie entiende

La observabilidad real aparece cuando esas señales están conectadas con preguntas operativas y decisiones concretas.

Por ejemplo:

- una alerta de latencia alta debería permitir saltar a métricas más finas
- desde una métrica anómala debería poder llegarse a trazas relevantes
- desde una traza problemática debería poder identificarse el servicio, la versión y el error asociado
- desde un log debería poder recuperarse el contexto del request o del job afectado

El objetivo no es solo almacenar información.
El objetivo es **reducir tiempo para detectar, entender y mitigar problemas reales**.

## Qué preguntas operativas debería poder contestar un backend observable

Una forma útil de diseñar observabilidad es empezar por preguntas.

Por ejemplo:

- qué endpoints concentran más errores
- qué operaciones tienen peor latencia p95 y p99
- qué tenants o clientes están más afectados por una degradación
- qué versión del servicio empezó a fallar después del último deploy
- qué dependencia externa explica los timeouts actuales
- qué cola está creciendo y desde cuándo
- qué workers están procesando más lento de lo normal
- qué porcentaje de requests termina en retry
- qué flujo de negocio está incompleto o trabado

Si la observabilidad no ayuda a responder preguntas como estas, probablemente lo que tenés es telemetría acumulada, no observabilidad útil.

## La importancia de la correlación

En sistemas distribuidos, uno de los mayores problemas es la fragmentación.

Cada componente ve una parte:

- el gateway ve la entrada
- el servicio de autenticación ve otra parte
- el servicio de negocio ve otra
- la base de datos ve consultas
- el worker ve el procesamiento posterior

Sin correlación, cada pieza cuenta una historia incompleta.

Por eso son tan importantes conceptos como:

- request ID
- trace ID
- span ID
- correlation ID
- tenant ID
- versión desplegada
- región o zona

No hace falta memorizar terminología para entender lo importante:

**cuando una operación atraviesa muchas piezas, necesitás una forma consistente de unir su rastro.**

Si no, cada incidente termina siendo una investigación manual artesanal.

## Observabilidad técnica vs observabilidad de negocio

Otro error frecuente es observar solo infraestructura.

Por ejemplo:

- CPU
- memoria
- disco
- red
- errores HTTP

Todo eso importa, pero no alcanza.

Un backend real también necesita señales de negocio u operación funcional.

Por ejemplo:

- pagos iniciados vs pagos confirmados
- órdenes creadas vs órdenes fallidas
- reintentos de webhooks por proveedor
- jobs pendientes por tipo
- cantidad de devoluciones en proceso
- tasa de checkout abandonado por paso
- porcentaje de sincronizaciones incompletas

¿Por qué esto es importante?

Porque el sistema puede verse “saludable” desde infraestructura y, sin embargo, estar rompiendo un flujo clave de negocio.

La observabilidad madura mezcla ambas capas:

- salud técnica
- comportamiento funcional

## El problema del exceso de ruido

Una de las trampas más comunes es pensar que más datos siempre ayudan.

No necesariamente.

De hecho, en cloud es muy fácil caer en:

- logs excesivos
- métricas duplicadas
- dashboards infinitos
- alertas ruidosas
- costos altos de almacenamiento y consulta
- equipos que dejan de mirar las señales porque todo parece urgente

La sobreinstrumentación sin criterio genera otra forma de ceguera.

Por eso conviene recordar algo importante:

**la observabilidad útil no maximiza volumen; maximiza capacidad de explicación.**

La pregunta correcta no es “qué más puedo medir”.
La pregunta correcta es:

**qué señales me ayudan a entender mejor el comportamiento del sistema y a actuar más rápido cuando algo importa.**

## Qué cosas suele valer la pena instrumentar primero

Cuando un sistema todavía no tiene buena observabilidad, conviene empezar por señales de alto impacto.

### 1. Requests principales

Medir:

- volumen
- latencia
- tasa de error
- rutas más críticas

### 2. Dependencias externas

Medir:

- tiempo de respuesta
- errores
- timeouts
- retries
- circuit breaker openings si existen

### 3. Base de datos y colas

Mirar:

- latencia de queries relevantes
- cantidad de conexiones
- locks o saturación
- backlog de colas
- tiempo en cola vs tiempo de procesamiento

### 4. Jobs y procesos asíncronos

Tener claro:

- cuántos se ejecutan
- cuántos fallan
- cuánto tardan
- cuántos quedan pendientes
- cuántos reintentos consumen

### 5. Flujos de negocio críticos

Por ejemplo:

- checkout
- login
- creación de orden
- emisión de factura
- sincronización con ERP
- renovación de suscripción

### 6. Eventos de despliegue

Poder relacionar cambios de versión con degradaciones o incidentes.

## Alertas: qué problema intentan resolver de verdad

Una alerta útil no existe para informar que “algo cambió”.
Existe para llamar la atención sobre algo que requiere acción o evaluación humana.

Alertas pobres:

- saltan demasiado seguido
- están mal calibradas
- no distinguen severidad
- no explican contexto
- no indican impacto
- despiertan al equipo por ruido

Alertas mejores:

- se apoyan en síntomas relevantes
- conectan con impacto real
- ayudan a priorizar
- permiten investigar rápido

En cloud y sistemas distribuidos, esto importa mucho, porque el volumen de señales crece rápido.

Si todo alerta, nada alerta.

## Observabilidad y despliegues

Una relación importante:

**cuanto más frecuente y madura sea tu capacidad de desplegar, más importante se vuelve la observabilidad.**

¿Por qué?

Porque cambiar seguido sin ver consecuencias rápido aumenta el riesgo.

Después de un deploy, debería poder observarse con claridad:

- errores por versión
- latencia por versión
- consumo de recursos por versión
- impacto sobre flujos críticos
- diferencias entre regiones o grupos de usuarios

Esto es clave para detectar regresiones temprano y decidir:

- continuar rollout
- frenar despliegue
- revertir
- aislar impacto

CI/CD y observabilidad están muy conectadas.
Una entrega madura necesita visibilidad posterior al cambio.

## Observabilidad y ownership

En sistemas distribuidos, otro punto importante es el ownership.

Si nadie sabe quién mira qué, aparecen dos extremos malos:

- nadie se hace cargo de una señal crítica
- todos reciben ruido que no pueden interpretar

La observabilidad útil suele estar alineada con ownership real:

- cada servicio tiene responsables claros
- cada flujo crítico tiene señales definidas
- cada alerta importante tiene destinatarios razonables
- cada dashboard existe para una pregunta concreta

No se trata solo de instrumentar sistemas.
También se trata de organizar responsabilidad alrededor de ellos.

## Qué errores conceptuales conviene evitar

### Error 1: creer que observabilidad es una herramienta

La herramienta ayuda, pero el problema es de diseño operativo.

### Error 2: depender solo de logs

Los logs son valiosos, pero solos no alcanzan para entender comportamiento agregado ni recorridos distribuidos.

### Error 3: medir solo infraestructura

Un backend puede estar “arriba” mientras un flujo de negocio importante está roto.

### Error 4: alertar por todo

El ruido destruye la atención operativa.

### Error 5: no correlacionar señales

Sin IDs, contexto y trazabilidad transversal, cada incidente se investiga a ciegas.

### Error 6: instrumentar tarde

Cuanto más crece el sistema, más caro resulta agregar observabilidad correctamente sobre piezas ya caóticas.

### Error 7: no mirar costo

En cloud, almacenar, indexar y consultar telemetría también cuesta dinero.
No toda señal merece el mismo nivel de detalle o retención.

## Una forma útil de pensar la madurez

Podés imaginar una evolución por etapas.

### Etapa 1

Señales básicas:

- logs estructurados
- métricas de requests
- errores visibles

### Etapa 2

Dashboards útiles para servicios y dependencias críticas.

### Etapa 3

Trazas distribuidas y correlación real entre componentes.

### Etapa 4

Alertas mejor calibradas, relación clara con despliegues y mejor visibilidad de flujos de negocio.

### Etapa 5

Observabilidad tratada como capacidad estratégica del sistema:

- con ownership claro
- con costo controlado
- con telemetría orientada a decisiones
- con soporte real para incidentes y evolución del producto

No hace falta tener todo resuelto desde el primer día.
Pero sí conviene diseñar en esa dirección.

## Una conexión importante con lo que sigue

Este tema prepara directamente varios de los próximos.

Porque una vez que entendés observabilidad en cloud y sistemas distribuidos, se vuelve más natural entrar en:

- costos en cloud y decisiones de arquitectura con impacto económico
- infraestructura como código
- entornos efímeros
- estrategias de despliegue avanzadas
- cómo justificar decisiones técnicas con criterio profesional

En otras palabras:

**no alcanza con correr sistemas en cloud; hay que poder entenderlos, operarlos y decidir sobre ellos con evidencia.**

## Lo que deberías llevarte de esta lección

Si tuvieras que quedarte con una sola idea, que sea ésta:

**observabilidad en cloud y sistemas distribuidos no significa acumular logs, métricas y trazas, sino construir una capacidad real para explicar el comportamiento del sistema, correlacionar señales entre muchas piezas y reducir el tiempo necesario para detectar, entender y mitigar problemas relevantes.**

Cuando esto está bien pensado, el backend gana:

- menor opacidad operativa
- mejor diagnóstico de incidentes
- más claridad después de cada deploy
- mejor entendimiento de dependencias y cuellos de botella
- alertas más útiles
- mejor relación entre señales técnicas y flujos de negocio
- más capacidad de escalar sin operar a ciegas

Y eso, en cloud, no es accesorio.
Es parte central de construir sistemas profesionales.
