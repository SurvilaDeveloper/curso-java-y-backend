---
title: "Reintentos, circuit breakers y resiliencia entre servicios"
description: "Cómo pensar los reintentos entre servicios, por qué a veces ayudan y a veces empeoran el problema, qué resuelve un circuit breaker, y cómo diseñar resiliencia sin convertir el sistema distribuido en una máquina de amplificar fallos." 
order: 164
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

## Introducción

Cuando un servicio llama a otro en una arquitectura distribuida, casi nunca vive en un mundo perfectamente estable.

Puede pasar que:

- la red tenga latencia anormal
- el servicio remoto responda lento
- una dependencia interna falle
- una base externa se sature
- un gateway devuelva errores temporales
- un timeout corte la operación antes de saber qué pasó realmente

Y ahí aparece una de las preguntas más comunes en sistemas distribuidos:

**si una llamada falla, ¿conviene reintentar o conviene fallar rápido?**

La respuesta correcta no es “siempre reintentá”.
Tampoco es “nunca reintentes”.

Porque en el mundo real, un reintento puede:

- recuperar una falla transitoria
- duplicar una operación delicada
- aumentar presión sobre un servicio ya degradado
- ocultar problemas de fondo
- convertir una pequeña inestabilidad en una tormenta de tráfico

Por eso, cuando hablamos de resiliencia entre servicios, hay tres ideas que hay que entender juntas:

- **timeouts**
- **reintentos**
- **circuit breakers**

Y alrededor de ellas aparece una pregunta todavía más importante:

**¿cómo evitamos que una falla parcial se propague y termine dañando a todo el sistema?**

Ese es el corazón de esta lección.

## El problema real: las fallas distribuidas no son binarias

En un programa local, a veces una operación simplemente funciona o no funciona.

En sistemas distribuidos, la cosa es bastante más incómoda.

Puede pasar que:

- el servicio remoto recibió la petición pero la respuesta no volvió
- el servicio remoto ejecutó la operación parcialmente
- la operación terminó bien, pero la conexión se cortó antes de confirmarlo
- la operación todavía no terminó, pero tu timeout expiró
- el balanceador devolvió error aunque una instancia estaba sana
- una dependencia intermedia falló solo por unos segundos

Eso significa que muchas veces no estamos ante un “sí” o “no” limpio.
Estamos ante **incertidumbre**.

Y cuando aparece incertidumbre, las decisiones automáticas mal pensadas empeoran muchísimo las cosas.

## Qué problema intentan resolver los reintentos

La idea más básica de un retry es simple:

- si una llamada falló por una condición transitoria
- probamos otra vez
- y quizás la siguiente funcione

Eso tiene sentido porque muchas fallas distribuidas son efectivamente temporales.

Por ejemplo:

- una pequeña pérdida de paquetes
- un pico de latencia corto
- una instancia reiniciándose
- un lock transitorio en una dependencia
- un error momentáneo del proveedor externo

En esos casos, un reintento bien diseñado puede mejorar mucho la tasa de éxito.

## El gran problema: reintentar no siempre es gratis

Acá aparece la trampa.

Cada retry agrega:

- más tráfico
- más carga
- más tiempo total de espera
- más complejidad de diagnóstico
- más riesgo de duplicación si la operación no era segura

Y lo más importante:

**si el servicio remoto ya está bajo presión, los retries pueden convertirse en combustible para el incendio.**

Imaginá esto:

- 1000 requests llegan a un servicio degradado
- cada una falla por timeout
- cada cliente hace 3 retries

Ahora ya no son 1000 intentos.
Pueden ser 3000 o 4000.

O sea:

la estrategia que se suponía resiliente termina amplificando la caída.

## Primera regla: no reintentar todo

Ésta es una regla central.

No toda falla debería disparar un retry.

Conviene distinguir al menos entre:

## 1. Errores transitorios

Suelen ser buenos candidatos a retry.

Por ejemplo:

- timeout corto
- `503 Service Unavailable`
- `502 Bad Gateway`
- fallo momentáneo de red
- rate limit temporal con indicación de retry posterior

## 2. Errores permanentes o semánticos

No conviene reintentarlos automáticamente.

Por ejemplo:

- `400 Bad Request`
- validación inválida
- credenciales incorrectas
- recurso inexistente
- regla de negocio que impide la operación

Reintentar esto no ayuda.
Solo agrega ruido.

## 3. Errores ambiguos

Acá hay que pensar más fino.

Por ejemplo:

- timeout después de enviar una orden de pago
- corte de conexión luego de crear un recurso remoto
- error al confirmar si la operación ya se aplicó o no

Éstos no son simples errores técnicos.
Pueden esconder una operación que sí ocurrió.

Y ahí la resiliencia ya no depende solo del retry.
Depende también de:

- idempotencia
- claves de operación
- consultas de estado
- compensaciones
- reconciliación posterior

## La relación entre retries e idempotencia

Acá vuelve fuerte el tema anterior.

Si vas a reintentar una operación que puede tener efecto de negocio, tenés que preguntarte:

**si esta misma petición llega dos o tres veces, ¿el sistema queda bien o queda roto?**

Ejemplos:

- crear una orden sin idempotencia puede duplicar compras
- cobrar un pago sin protección puede duplicar cargos
- reservar stock varias veces puede bloquear inventario de más
- enviar un email varias veces puede generar mala experiencia, aunque no rompa datos

Entonces:

**los retries agresivos sin idempotencia son una receta clásica para producir efectos duplicados.**

Por eso, en operaciones sensibles, lo correcto suele ser combinar:

- retry controlado
- identificador idempotente
- posibilidad de consultar estado
- registro claro de la operación original

## Qué es un timeout y por qué no puede faltar

Un timeout es el límite máximo que estás dispuesto a esperar por una respuesta.

Sin timeout, un cliente puede quedarse colgado indefinidamente.
Eso ya es malo.

Pero además, en cascada, un mal manejo de timeouts puede consumir:

- hilos
- conexiones
- memoria
- slots del pool
- capacidad de atender nuevas requests

O sea:

**un timeout no es solo una comodidad; es un límite defensivo de recursos.**

## Un error clásico: timeouts demasiado largos

Mucha gente configura timeouts gigantes “para que no falle”.

Eso suele empeorar el problema.

Si una dependencia está lenta o semicaída, esperar demasiado significa:

- más requests apiladas
- más recursos retenidos
- más latencia para usuarios
- mayor posibilidad de colapso en cascada

A veces, fallar antes es más sano que insistir demasiado.

## Otro error clásico: timeouts inconsistentes en cadena

Imaginá esta secuencia:

- API Gateway espera 30 segundos
- servicio A espera 25 segundos a B
- servicio B espera 20 segundos a C
- servicio C espera 15 segundos a D

En teoría suena ordenado.
Pero si no está bien pensado, puede pasar que:

- capas superiores ya den la request por perdida
- capas internas sigan trabajando igual
- el sistema haga trabajo inútil que nadie espera ya
- aparezcan duplicados cuando el cliente vuelve a intentar

La gestión de timeouts tiene que pensarse a nivel de flujo completo, no llamada por llamada de forma aislada.

## Cómo deberían ser los retries razonables

No hay una cifra universal, pero en general un retry sano suele ser:

- limitado en cantidad
- selectivo por tipo de error
- acompañado por backoff
- sensible al contexto de negocio
- compatible con idempotencia

No debería ser:

- infinito
- inmediato siempre
- igual para todos los endpoints
- ciego al tipo de operación

## Qué es backoff

Backoff significa que no reintentás instantáneamente todas las veces.

Dejás pasar un tiempo entre intentos.

Por ejemplo:

- intento 1: inmediato
- intento 2: esperar 200 ms
- intento 3: esperar 500 ms
- intento 4: esperar 1 s

La idea es dar oportunidad a que la falla transitoria se recupere sin golpear a la dependencia una y otra vez de manera brutal.

## Qué es exponential backoff

Es una forma de aumentar la espera entre retries de manera progresiva.

Por ejemplo:

- 100 ms
- 200 ms
- 400 ms
- 800 ms

Eso suele ayudar bastante más que disparar retries pegados.

## Qué es jitter y por qué importa

Si miles de clientes hacen backoff exactamente igual, pueden volver a golpear todos juntos al mismo tiempo.

Eso genera picos sincronizados.

Para evitarlo, se suele agregar **jitter**, o sea una pequeña variación aleatoria en los tiempos de espera.

Así los retries se distribuyen mejor en el tiempo.

Parece un detalle menor.
No lo es.

En sistemas grandes, puede marcar mucha diferencia.

## Qué es un circuit breaker

Un circuit breaker es un mecanismo que deja de intentar llamadas a una dependencia cuando detecta que esa dependencia está fallando de manera sostenida.

La lógica general suele ser:

- si la dependencia responde bien, dejamos pasar tráfico
- si empieza a fallar mucho, “abrimos” el circuito
- mientras está abierto, fallamos rápido sin llamar realmente a la dependencia
- después de un tiempo, probamos con algunas llamadas controladas
- si la dependencia mejoró, cerramos otra vez

La idea es muy poderosa.

**si una dependencia está claramente rota, insistir sin parar no es resiliencia; es desperdicio y amplificación del daño.**

## Estados típicos de un circuit breaker

## 1. Closed

Todo funciona normal.
Las llamadas pasan.

## 2. Open

El circuito detectó demasiadas fallas.
Las llamadas dejan de pasar hacia la dependencia.
Se falla rápido.

## 3. Half-open

Después de un período de espera, se dejan pasar algunas llamadas de prueba.

Si esas llamadas salen bien:

- el circuito puede cerrarse otra vez

Si siguen saliendo mal:

- el circuito vuelve a abrirse

## Qué problema resuelve un circuit breaker

Resuelve varios a la vez.

## 1. Evita seguir castigando una dependencia caída

Si ya sabés que algo está muy mal, no tiene sentido insistir con todo el tráfico.

## 2. Reduce consumo inútil de recursos locales

Cada llamada remota implica costo.
Si sabés que va a fallar casi seguro, fallar rápido protege al sistema llamador.

## 3. Ayuda a evitar cascadas

Una dependencia lenta puede bloquear pools, threads o workers del servicio cliente.
Si eso ocurre en varios niveles, la caída se propaga.

## 4. Mejora tiempos de respuesta percibidos

A veces es preferible responder rápido con una degradación controlada que esperar muchísimo para terminar igual en error.

## Pero un circuit breaker no resuelve todo

También puede ser mal usado.

Problemas típicos:

- thresholds mal calibrados
- abrir demasiado rápido por picos pequeños
- permanecer abierto demasiado tiempo
- no distinguir tipos de error
- esconder fallas reales bajo una capa confusa de resiliencia

Además, si no tenés una estrategia de fallback o degradación, el circuit breaker solo cambia el tipo de fallo.
No necesariamente mejora la experiencia final.

## Retries y circuit breakers no son enemigos

De hecho, suelen convivir.

Una estrategia madura puede ser:

- poner timeouts razonables
- hacer pocos retries con backoff para fallas transitorias
- abrir circuit breaker cuando la dependencia está claramente degradada
- aplicar fallback cuando el negocio lo permite

El punto no es elegir una sola herramienta.
El punto es que trabajen juntas sin generar comportamientos absurdos.

## Qué es fallback

Fallback es una respuesta alternativa cuando la dependencia principal no está disponible.

Por ejemplo:

- mostrar datos cacheados
- devolver estado parcial
- degradar una funcionalidad no crítica
- postergar una operación para procesamiento asíncrono
- usar un proveedor secundario

No siempre existe un fallback válido.
Pero cuando existe, puede transformar una caída dura en una degradación tolerable.

## Ejemplo concreto: catálogo y recomendaciones

Imaginá un e-commerce.

El frontend llama a un backend que arma la página de producto.
Ese backend depende de:

- catálogo
- stock
- pricing
- recomendaciones

Si recomendaciones falla, quizás no querés romper toda la página.

Tal vez el comportamiento correcto sea:

- renderizar producto, precio y stock
- omitir carrusel de sugerencias
- registrar métrica de degradación

Eso es resiliencia con criterio.

No tratar todas las dependencias como si tuvieran la misma criticidad.

## Ejemplo concreto: pagos

Ahora pensemos en pagos.

Si el servicio que confirma autorización falla con timeout, la situación es mucho más delicada.

No alcanza con decir:

- “reintentemos cinco veces y listo”

Porque el riesgo no es solo técnico.
Puede haber:

- cargo aplicado pero no confirmado
- respuesta perdida
- estado incierto

Acá la estrategia madura suele requerir:

- idempotency key
- consulta posterior de estado
- reconciliación con el proveedor
- tal vez procesamiento manual en casos dudosos

Éste es un buen recordatorio de algo muy importante:

**resiliencia no es solo infraestructura; también es modelado correcto del negocio bajo incertidumbre.**

## Un error muy común: retries en cadena sin coordinación

Supongamos:

- servicio A reintenta 3 veces a B
- servicio B reintenta 3 veces a C
- servicio C reintenta 3 veces a D

Una sola petición inicial puede convertirse en muchísimos intentos reales.

El crecimiento puede ser explosivo.

Eso produce:

- tráfico extra enorme
- más latencia total
- más presión justo donde ya había problemas

Por eso, en cadenas de servicios, los retries no deberían configurarse ciegamente en todas las capas al mismo tiempo.

## Qué conviene decidir explícitamente

En cada integración entre servicios conviene definir al menos esto:

## 1. ¿Qué errores son retryables?

No todos.
Y eso tiene que estar claro.

## 2. ¿Cuántos retries máximos permitimos?

Pocos y pensados.
No infinitos.

## 3. ¿Qué backoff usamos?

Fijo, exponencial, con jitter, según el caso.

## 4. ¿Cuál es el timeout correcto?

No el más grande posible.
El más sano para el flujo.

## 5. ¿La operación es idempotente?

Si no lo es, hay que extremar cuidado.

## 6. ¿Existe fallback válido?

A veces sí.
A veces no.

## 7. ¿Cuándo conviene abrir circuito?

Tiene que estar gobernado por señales concretas.

## 8. ¿Qué observabilidad tenemos?

Sin métricas, logs y tracing, la capa de resiliencia se vuelve opaca.

## Métricas importantes para esta clase de problemas

Conviene observar al menos:

- tasa de éxito
- tasa de error por tipo
- latencia
- timeouts
- cantidad de retries
- aperturas del circuit breaker
- tiempo en estado open
- uso de fallback
- operaciones ambiguas o reconciliadas después

Si no medís esto, podés creer que tu sistema es resiliente cuando en realidad solo está escondiendo dolor debajo de la alfombra.

## Señales de que tus retries están mal diseñados

## 1. El tráfico se multiplica brutalmente durante incidentes

Mala señal clarísima.

## 2. La latencia promedio mejora poco, pero la cola de requests empeora mucho

Probablemente estás insistiendo demasiado.

## 3. Hay duplicados de operaciones de negocio

Eso suele indicar mala combinación entre retry e idempotencia.

## 4. Los incidentes son difíciles de reconstruir

Falta observabilidad de intentos, timeouts y degradación.

## 5. El sistema “parece robusto” hasta que una dependencia realmente cae

Muchas estrategias sobreviven a fallas pequeñas pero colapsan mal bajo una caída sostenida.

## Qué conviene recordar sobre resiliencia distribuida

Una arquitectura distribuida sana no asume que la red es confiable ni que los servicios vecinos siempre van a responder bien.

Asume lo contrario.

Y por eso diseña defensas.

Pero esas defensas no deberían ser impulsivas.

Porque una defensa mal pensada puede:

- empeorar la saturación
- multiplicar efectos duplicados
- esconder incertidumbre real
- volver opaco el diagnóstico

La meta no es “hacer muchísimos retries”.
La meta es:

- recuperarse cuando la falla es transitoria
- contener el daño cuando la falla persiste
- proteger recursos locales
- evitar cascadas
- mantener claridad operativa

## Idea final

Entre servicios, fallar una vez no siempre significa que la operación esté perdida.
Pero tampoco significa que repetir automáticamente sea siempre correcto.

Los **reintentos** sirven para absorber fallas transitorias.
Los **timeouts** protegen recursos y acotan la espera.
Los **circuit breakers** ayudan a dejar de insistir cuando una dependencia está claramente degradada.

Juntos pueden formar una estrategia de resiliencia madura.

Pero esa estrategia solo funciona bien cuando está apoyada en:

- idempotencia
- observabilidad
- entendimiento del negocio
- diferenciación entre errores transitorios, permanentes y ambiguos
- degradación controlada cuando corresponde

En sistemas distribuidos, la resiliencia no consiste en “aguantar todo a cualquier costo”.

Consiste en saber:

- cuándo insistir
- cuándo parar
- cuándo degradar
- y cómo evitar que una falla parcial termine derramándose sobre todo lo demás

Ésa es la diferencia entre un sistema que sobrevive a la inestabilidad y uno que la multiplica.
