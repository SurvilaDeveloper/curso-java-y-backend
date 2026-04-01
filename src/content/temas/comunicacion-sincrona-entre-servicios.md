---
title: "Comunicación síncrona entre servicios"
description: "Cómo pensar llamadas síncronas entre servicios, cuándo tienen sentido, qué acoplamientos introducen, qué riesgos operativos traen y cómo diseñarlas sin volver frágil una arquitectura distribuida."
order: 155
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

## Introducción

Una vez que aceptamos que un sistema puede necesitar más de un servicio, aparece una pregunta inevitable:

**¿cómo van a hablar entre sí esas piezas?**

Y una de las primeras respuestas suele ser la más intuitiva:

- un servicio llama a otro
- espera la respuesta
- sigue con su trabajo

Eso es, en esencia, **comunicación síncrona entre servicios**.

Es un modelo muy natural porque se parece mucho a cómo pensamos una llamada local:

- hago una petición
- espero un resultado
- con ese resultado decido qué hacer después

Por eso suele ser la primera forma de integración distribuida que adopta un equipo.
También por eso es una de las más peligrosas cuando se usa sin criterio.

Porque aunque conceptualmente parece simple, en sistemas distribuidos trae varias implicancias importantes:

- dependencia temporal entre servicios
- latencia acumulada
- propagación de fallos
- presión sobre disponibilidad
- contratos remotos más sensibles
- riesgo de transformar una operación de negocio en una cadena frágil de llamadas

Entonces, el punto no es demonizarla.
La comunicación síncrona **sí tiene lugar** en una arquitectura distribuida.

El punto real es otro:

**entender cuándo tiene sentido, qué costo trae, y cómo diseñarla sin convertir el sistema en una red de dependencias rígidas y vulnerables.**

## Qué significa comunicación síncrona

Cuando hablamos de comunicación síncrona entre servicios, hablamos de un patrón donde:

- un servicio emite una solicitud a otro
- queda esperando la respuesta
- y recién con esa respuesta continúa, decide o completa su operación

Eso puede implementarse con distintas tecnologías:

- HTTP/REST
- gRPC
- RPC interno
- request/response sobre otros protocolos

La tecnología cambia.
La idea de fondo no.

Lo importante es esto:

**el emisor necesita una respuesta ahora, dentro del flujo actual, para poder seguir.**

Eso implica una dependencia temporal fuerte.
No alcanza con que el otro servicio exista conceptualmente.
Tiene que estar:

- disponible
- accesible por red
- respondiendo dentro del tiempo esperado
- devolviendo algo interpretable por el llamador

Y todo eso ocurre justo en el medio de una operación viva.

## Por qué resulta tan tentadora

La comunicación síncrona es atractiva por varias razones.

## 1. Se entiende fácil

El flujo mental es directo:

- pedís algo
- obtenés una respuesta
- seguís

No hace falta introducir desde el primer día colas, eventos, compensaciones o consistencia eventual para todo.

## 2. Se parece a una llamada local

Muchos equipos migran desde monolitos.
Entonces pasar de:

- llamar una función interna

a:

- llamar un endpoint remoto

parece una evolución natural.

## 3. Simplifica ciertos casos de negocio

Hay operaciones donde realmente necesitás saber algo en ese momento.
Por ejemplo:

- validar credenciales
- verificar permisos
- consultar una cotización inmediata
- pedir una decisión de scoring en tiempo real
- obtener datos de referencia necesarios para responder al usuario

En estos casos, esperar una respuesta inmediata puede tener bastante sentido.

## 4. Hace más explícita la dependencia

A veces es mejor saber que dependés de otro servicio en línea a ocultarlo detrás de mecanismos más complejos.

Pero que algo sea intuitivo no significa que sea barato.
Y ahí empieza la parte seria del tema.

## El costo principal: dependencia en tiempo real

La característica central de la comunicación síncrona es también su mayor riesgo:

**si el servicio remoto no responde bien, el flujo local queda afectado inmediatamente.**

Eso cambia mucho el comportamiento del sistema.

Porque ahora el éxito de una operación no depende solo de:

- la lógica propia
- la base propia
- la infraestructura propia

También depende de:

- disponibilidad del otro servicio
- salud de su base de datos
- latencia de la red
- saturación aguas abajo
- timeouts intermedios
- errores transitorios remotos
- compatibilidad del contrato

En otras palabras:

**cada llamada síncrona agrega una condición nueva para que el flujo pueda terminar bien.**

Si encadenás varias, el problema crece.

## Una llamada remota no es una llamada local con esteroides

Éste es uno de los errores conceptuales más comunes.

Un equipo diseña servicios como si llamar por red fuera casi lo mismo que invocar un método interno.
Pero no lo es.

Una llamada remota introduce cosas que una llamada local normalmente no tiene:

- latencia variable
- fallos parciales
- timeouts
- pérdida de conectividad
- respuestas duplicadas o reintentadas
- ventanas de degradación
- diferencias de versión entre emisor y receptor
- observabilidad más difícil

Además, en una llamada local generalmente tenés bastante certeza de ejecución.
En una llamada remota, a veces aparece una zona gris:

- no sabés si el otro servicio recibió la solicitud
- no sabés si la procesó parcialmente
- no sabés si terminó pero la respuesta no volvió
- no sabés si conviene reintentar o si eso duplicará un efecto

Entonces, diseñar comunicación síncrona exige asumir desde el inicio que:

**la red es parte del problema de negocio, no solo un detalle técnico.**

## Cuándo sí tiene sentido usar comunicación síncrona

No todo debería resolverse con mensajes asincrónicos.
No todo debería esperar una cola.
No todo flujo tolera demora.

La comunicación síncrona suele tener sentido cuando se cumplen varias de estas condiciones.

## 1. Necesitás una respuesta inmediata para completar el flujo actual

Por ejemplo:

- autenticar un request
- autorizar una operación sensible
- obtener una configuración crítica para responder al usuario
- consultar una capacidad disponible antes de ofrecer una acción

Si no podés seguir sin esa respuesta, lo síncrono es una opción razonable.

## 2. La operación remota es relativamente rápida y predecible

Una llamada síncrona sufre mucho si el receptor:

- tarda de forma variable
- depende de muchos sistemas a su vez
- hace trabajo pesado
- se degrada con facilidad bajo carga

Lo síncrono funciona mejor cuando el servicio remoto puede responder con tiempos bastante estables.

## 3. La dependencia es semánticamente legítima

No se trata solo de “puedo llamarlo”.
Se trata de si **tiene sentido de dominio** que ese servicio le pida eso al otro en tiempo real.

Por ejemplo, puede ser lógico que:

- un gateway consulte identidad
- checkout consulte pricing para una cotización vigente
- un servicio de administración consulte permisos

Pero empieza a oler raro si una misma operación necesita recorrer media plataforma para terminar.

## 4. El costo de esperar es aceptable para la experiencia y la operación

Hay flujos donde esperar 100 ms extra es tolerable.
Hay otros donde 2 o 3 segundos destruyen la experiencia.
Hay otros donde bloquear una operación crítica por un servicio secundario no tiene ningún sentido.

La decisión no es solo técnica.
También es de producto y operación.

## Cuándo empieza a ser una mala idea

Hay varias señales de alerta bastante claras.

## 1. Cuando el flujo principal depende de demasiadas llamadas encadenadas

Si para atender una sola petición necesitás:

- servicio A → B
- B → C
- C → D
- D → E

ya no tenés solo lógica distribuida.
Tenés una **cadena de disponibilidad**.

Y el sistema queda expuesto a:

- latencia acumulada
- fallos cascada
- debugging difícil
- timeouts difíciles de calibrar
- presión sobre varios equipos al mismo tiempo

Una regla práctica útil es sospechar de cualquier flujo donde lo básico requiere hablar con demasiados servicios en línea.

## 2. Cuando el servicio remoto hace trabajo pesado o incierto

Si la llamada dispara:

- cálculo complejo
- consultas costosas
- integraciones externas lentas
- scraping
- procesamiento intensivo
- operaciones sujetas a alto jitter

probablemente no sea un buen candidato para una integración síncrona directa dentro del flujo crítico.

## 3. Cuando la dependencia remota no es verdaderamente crítica

A veces un servicio bloquea toda una operación por una consulta “conveniente”, no indispensable.

Por ejemplo:

- enriquecer datos secundarios
- traer recomendaciones
- consultar información analítica
- resolver metadata no esencial

Si esa pieza falla y aun así el negocio podría seguir, conviene pensar degradación, caché, precálculo o asincronía.

## 4. Cuando el otro servicio está evolucionando o degradándose con frecuencia

Una llamada síncrona presupone cierta estabilidad operacional.
Si el receptor está en cambio constante, con performance irregular o con incidentes frecuentes, el llamador hereda esa inestabilidad.

## Acoplamiento temporal: el problema menos visible

Una llamada síncrona no solo acopla contratos.
También acopla tiempo.

Eso significa que:

- ambos servicios tienen que estar vivos al mismo tiempo
- ambos tienen que responder dentro de una ventana compatible
- ambos tienen que sostener el ritmo de carga en simultáneo

Ese acoplamiento temporal es muy importante.

Dos servicios pueden estar conceptualmente bien separados a nivel de dominio, pero si se necesitan permanentemente en línea para resolver casi todo, la autonomía real baja mucho.

No es independencia verdadera si:

- no podés desplegar uno sin temer por el otro
- no podés degradar uno sin arrastrar al resto
- no podés absorber carga local sin presionar aguas abajo
- no podés razonar sobre disponibilidad sin mirar toda la cadena

## Disponibilidad compuesta: un sistema fuerte puede volverse frágil por suma de dependencias

Supongamos algo simple:

- servicio A tiene buena disponibilidad
- servicio B también
- servicio C también

Cada uno, por separado, parece sano.

Pero si una operación del usuario depende de que A, B y C respondan bien en línea, la disponibilidad efectiva del flujo completo es menor que la de cada componente individual.

Y cuanto más larga la cadena, peor.

Éste es uno de los motivos por los que muchas arquitecturas parecen robustas en el papel y frágiles en producción.
No porque cada servicio sea malo.
Sino porque la composición síncrona genera un sistema más delicado.

## La comunicación síncrona necesita contratos muy claros

Si un servicio llama a otro en tiempo real, necesita entender muy bien:

- qué pide
- qué recibe
- qué significa cada estado
- qué errores son esperables
- qué errores son reintentables
- qué tiempos de respuesta son razonables
- qué versión del contrato está consumiendo

No alcanza con “tenemos un endpoint”.
Eso es apenas el inicio.

Un contrato sano para llamadas síncronas debería dejar razonablemente claro:

- campos obligatorios y opcionales
- semántica de la respuesta
- códigos de error consistentes
- tratamiento de operaciones no encontradas, inválidas o prohibidas
- límites de tasa y comportamiento ante sobrecarga
- reglas de compatibilidad hacia atrás

La ambigüedad en contratos síncronos duele mucho porque impacta de inmediato sobre el flujo vivo.

## Timeouts: no son un detalle, son parte del diseño

Toda llamada síncrona necesita timeout.
No como parche.
Como decisión explícita.

Sin timeout, el sistema puede:

- bloquear threads o recursos demasiado tiempo
- saturarse esperando respuestas que no llegan
- empeorar una degradación remota
- autoahogarse bajo carga

Pero poner timeout tampoco alcanza por sí solo.
Hay que decidir:

- cuánto esperar
- qué pasa si vence el tiempo
- si se reintenta o no
- si el flujo falla completo
- si se aplica degradación
- si se devuelve respuesta parcial
- si se compensa después

El timeout correcto depende del contexto.
No existe un número universal.
Lo importante es entender que:

**el timeout define cuánto dolor remoto estás dispuesto a absorber dentro de tu propio flujo.**

## Reintentos: útiles, pero peligrosos

Una reacción común ante fallos transitorios es reintentar.
Y a veces está bien.

Pero reintentar mal puede empeorar el problema.

Por ejemplo:

- multiplicás tráfico hacia un servicio ya saturado
- duplicás operaciones no idempotentes
- extendés todavía más la latencia total
- generás tormentas de retries entre varios servicios

Entonces, los reintentos deben ser:

- selectivos
- limitados
- con backoff
- conscientes del tipo de error
- compatibles con la idempotencia de la operación

No todo error remoto debería reintentarse.
Y no toda operación soporta reintentos seguros.

## Circuit breakers y degradación controlada

Cuando una dependencia síncrona empieza a fallar o a degradarse, a veces lo correcto no es insistir más.
Es cortar temprano.

Ahí aparecen patrones como:

- circuit breaker
- fail fast
- fallback
- respuesta degradada
- caché temporal

La idea no es “ocultar” el problema.
La idea es evitar que una dependencia enferma arrastre al llamador y a sus usuarios de manera desproporcionada.

Por ejemplo, si un servicio secundario está lento, quizá convenga:

- responder sin enriquecimiento opcional
- usar un valor de caché reciente
- mostrar una experiencia reducida
- rechazar temprano con un error claro

Eso depende del dominio.
Lo importante es que las llamadas síncronas críticas deberían pensarse junto con una estrategia de degradación razonable.

## Fan-out síncrono: una fuente clásica de fragilidad

Se llama fan-out cuando un servicio, para responder una sola petición, dispara múltiples llamadas a otros servicios.

Por ejemplo:

- llama a perfil
- llama a billing
- llama a inventario
- llama a promociones
- llama a recomendaciones
- llama a analytics

Y luego intenta recomponer todo.

Esto puede parecer elegante porque concentra la composición en un punto.
Pero también puede convertirse en un foco de problemas:

- más latencia total
- más chance de que algo falle
- más complejidad de timeouts
- más manejo de parciales
- más variabilidad de rendimiento

El fan-out síncrono no siempre es incorrecto.
Pero debería justificarse bien.
Y conviene distinguir entre:

- dependencias centrales realmente necesarias
- enriquecimientos opcionales que deberían resolverse de otra manera

## HTTP o gRPC no resuelven el problema por sí solos

A veces la discusión se desordena porque se enfoca demasiado en el protocolo.

- “usemos REST”
- “usemos gRPC”
- “usemos JSON”
- “usemos Protobuf”

Es una decisión importante, sí.
Pero no reemplaza las preguntas arquitectónicas fundamentales.

Da igual el protocolo si seguís teniendo:

- demasiadas dependencias en línea
- contratos ambiguos
- timeouts mal diseñados
- reintentos peligrosos
- cascadas de fallos
- ownership confuso

La tecnología de transporte puede mejorar:

- eficiencia
- tipado
- tooling
- compatibilidad interna

Pero no arregla por sí sola un mal modelo de interacción.

## Autenticación, autorización y trazabilidad en llamadas internas

Otro error frecuente es pensar que, por ser tráfico interno entre servicios, no hace falta tomarse demasiado en serio la seguridad o la trazabilidad.

Sí hace falta.

Una llamada síncrona entre servicios debería contemplar al menos:

- identidad del emisor
- autenticación entre servicios
- autorización sobre qué puede pedir cada servicio
- propagación de contexto de trazabilidad
- correlation IDs o trace IDs
- logs con suficiente contexto para reconstruir el flujo

Si no hacés esto, después aparecen problemas como:

- llamadas internas difíciles de auditar
- acciones sensibles sin autoría clara
- debugging distribuido muy costoso
- imposibilidad de reconstruir incidentes con precisión

## La observabilidad no es opcional

Cuanto más usás comunicación síncrona, más importante se vuelve observar:

- latencia por dependencia
- tasa de error por endpoint o método
- timeouts
- retries
- circuit breaker open/close
- volumen de tráfico entre servicios
- percentiles de respuesta
- impacto aguas arriba de una degradación

Si no medís esto, es muy difícil responder preguntas como:

- cuál dependencia está degradando el flujo
- cuánto aporta cada llamada al tiempo total
- dónde se generan las fallas en cascada
- qué contrato es más inestable
- qué servicio necesita aislamiento o rediseño

## Un principio muy útil: síncrono para consulta crítica, cuidado extremo para efectos remotos

No es una ley absoluta, pero sirve como heurística.

La comunicación síncrona suele ser más natural para:

- consultas necesarias en tiempo real
- validaciones inmediatas
- decisiones que deben conocerse ahora

Se vuelve más delicada cuando la usamos para:

- producir efectos remotos importantes
- coordinar múltiples escrituras distribuidas
- depender de confirmaciones encadenadas para completar una operación central

Cuantos más efectos remotos y estados distribuidos involucre el flujo, más cuidadoso hay que ser con el diseño.

## Ejemplo intuitivo: checkout

Imaginemos un checkout distribuido.

Podría parecer razonable que el servicio de checkout llame en línea a:

- identidad
- pricing
- promociones
- inventario
- pagos
- envíos
- notificaciones

Todo durante la misma operación.

Pero eso puede volver el flujo extremadamente frágil.

Tal vez tenga más sentido distinguir:

### Dependencias síncronas realmente críticas

- validar identidad o sesión
- obtener cotización vigente
- confirmar posibilidad de reserva inmediata
- iniciar autorización de pago

### Dependencias no necesariamente críticas en línea

- analytics
- email de confirmación
- notificaciones internas
- enriquecimientos secundarios
- proyecciones de reporting

No todo tiene que ocurrir dentro del mismo request síncrono.
Y mezclar lo crítico con lo accesorio suele romper performance y resiliencia.

## Preguntas que conviene hacerse antes de agregar una llamada síncrona

## 1. ¿Necesito realmente la respuesta ahora para seguir?

Si la respuesta puede llegar después, quizá lo síncrono no sea necesario.

## 2. ¿Qué pasa si el otro servicio tarda o falla?

No a nivel teórico.
En el flujo concreto del negocio.

## 3. ¿Esta dependencia es central o es solo un enriquecimiento conveniente?

No conviene bloquear lo crítico por algo secundario.

## 4. ¿La operación remota es idempotente o reintentable?

Esto cambia por completo la estrategia ante fallos.

## 5. ¿Cuánta latencia total le estoy agregando al flujo?

No solo el promedio.
También los percentiles altos.

## 6. ¿Estoy creando una cadena de disponibilidad demasiado larga?

Cuantos más saltos, más fragilidad.

## 7. ¿Tengo observabilidad suficiente para entender esta dependencia en producción?

Sin eso, el problema aparece primero como confusión.

## Idea final

La comunicación síncrona entre servicios no es un error arquitectónico.
Muchas veces es necesaria y perfectamente válida.

El problema aparece cuando se usa como reflejo automático, como sustituto trivial de una llamada local, o como mecanismo universal para coordinar cualquier cosa.

Diseñarla bien exige aceptar algo fundamental:

**una llamada síncrona no solo conecta dos servicios; también conecta su disponibilidad, su latencia, su ritmo operativo y parte de su fragilidad.**

Por eso conviene usarla cuando:

- la respuesta inmediata es realmente necesaria
- la dependencia remota está bien justificada
- el contrato es claro
- el timeout está pensado
- la degradación está contemplada
- la observabilidad está resuelta
- la cadena de dependencias sigue siendo razonable

Dicho simple:

**lo síncrono sirve, pero cada llamada en línea debería sentirse como una decisión seria, no como un hábito automático.**
