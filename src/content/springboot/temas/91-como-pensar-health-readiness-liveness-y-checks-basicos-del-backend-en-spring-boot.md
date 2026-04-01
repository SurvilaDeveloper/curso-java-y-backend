---
title: "Cómo pensar health, readiness, liveness y checks básicos del backend en Spring Boot"
description: "Entender qué significa que un backend esté vivo, listo o degradado, y por qué los health checks se vuelven fundamentales cuando la aplicación ya corre en entornos reales y necesita convivir con despliegue, monitoreo y orquestación."
order: 91
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar observabilidad básica del backend con:

- logs
- métricas
- trazas
- visibilidad sobre errores
- latencia
- integraciones
- webhooks
- flujos críticos del sistema

Eso ya te dejó una idea muy importante:

> cuando el backend ya corre fuera de tu máquina, no alcanza con que exista; también necesitás poder ver qué está haciendo y qué le está pasando.

Pero enseguida aparece otra pregunta muy concreta y muy operativa:

> además de observarlo, ¿cómo sabe el entorno si la aplicación está realmente bien para recibir tráfico?

Porque una cosa es que el proceso “esté levantado”.
Y otra bastante distinta es que la app:

- esté viva de verdad
- esté lista para atender requests
- no esté trabada
- no esté a medio arrancar
- no esté degradada por una dependencia crítica
- no necesite reiniciarse
- no esté fallando silenciosamente mientras sigue respondiendo algo

Ahí aparecen conceptos muy importantes:

- **health checks**
- **liveness**
- **readiness**
- **checks básicos del sistema**
- y, más en general, la capacidad del backend de declarar su propio estado operativo**

Este tema es clave porque a medida que un backend se vuelve más real, más desplegable y más observable, también necesita poder decir con cierta claridad:

- si está vivo
- si está listo
- si está roto
- o si está degradado

Y esa diferencia importa muchísimo en producción.

## El problema de confundir “el proceso existe” con “la aplicación está bien”

Este es uno de los errores más comunes al principio.

Supongamos que el proceso Java está levantado y el puerto sigue abierto.
Eso puede hacerte pensar:

- la app está bien
- el backend está arriba
- todo correcto

Pero en la práctica pueden estar pasando cosas como:

- la app sigue arrancando y todavía no cargó todo
- la base de datos crítica no está disponible
- un pool está saturado
- una dependencia esencial no responde
- el hilo principal no cayó, pero la app está inútil
- el backend responde, pero no puede procesar requests reales
- una parte sensible del sistema está degradada
- la aplicación quedó viva pero no saludable

Entonces, muy pronto, la operación real necesita distinguir mejor los estados.

## Qué problema resuelven los health checks

Resuelven una pregunta muy concreta:

> ¿cómo puede otro sistema, una plataforma de despliegue, un balanceador o un operador saber si este backend está en condiciones razonables de seguir vivo o recibir tráfico?

Esto es muy importante porque en producción muchas decisiones operativas dependen de ese diagnóstico.
Por ejemplo:

- enviarle o no tráfico
- sacarlo temporalmente de rotación
- reiniciarlo o no
- considerarlo sano o no
- alertar o no
- declarar una degradación

Entonces los checks no son un capricho técnico.
Son parte real de cómo el backend convive con su entorno.

## Qué significa health de forma general

Dicho simple:

> health es una forma de exponer el estado de salud operativo del backend.

No significa una verdad metafísica absoluta.
Significa una señal útil para responder preguntas como:

- ¿el proceso sigue funcionando?
- ¿la aplicación terminó de arrancar?
- ¿puede atender requests reales?
- ¿sus dependencias críticas están disponibles?
- ¿está en un estado aceptable o no?

No todo esto tiene que comprimirse en una única respuesta monolítica.
Y ahí aparecen justamente distinciones como liveness y readiness.

## Qué es liveness

Podés pensarlo así:

> liveness responde a la pregunta “¿la aplicación sigue viva o quedó en un estado del que probablemente no se va a recuperar sola?”

La idea importante es esta:

- no te dice necesariamente si está lista para servir tráfico útil
- te dice más bien si el proceso o la app siguen teniendo sentido como proceso vivo

Un check de liveness suele usarse para detectar cosas como:

- proceso colgado
- estado corrupto irrecuperable
- app que debería reiniciarse
- backend que ya no tiene sentido mantener vivo tal como está

## Qué es readiness

Readiness responde a otra pregunta:

> ¿esta instancia está lista para recibir tráfico real en este momento?

Acá la lógica es distinta.

Una app puede estar viva, pero no lista.
Por ejemplo:

- está arrancando todavía
- no conectó la base
- no terminó de cargar algo crítico
- una dependencia esencial está caída
- está en modo degradado que no soporta tráfico normal
- necesita quedar fuera del balanceador por un rato

Entonces readiness no es sobre “si el proceso existe”.
Es sobre “si debería recibir requests reales ahora”.

## Una diferencia muy importante

Podés pensarlo así:

### Liveness
¿Este backend sigue vivo o conviene reiniciarlo?

### Readiness
¿Este backend puede recibir tráfico útil ahora mismo?

Esa diferencia parece simple, pero operativamente es enorme.

## Qué pasa si no distinguís ambas cosas

Podés terminar con decisiones operativas malas.

Por ejemplo:

- una app todavía arrancando recibe tráfico demasiado pronto
- una app degradada sigue en el balanceador aunque no puede resolver requests bien
- una instancia con dependencia crítica caída se considera “ok” solo porque el proceso sigue corriendo
- una orquestación reinicia cosas que quizá estaban vivas pero no listas
- un sistema sigue mandando tráfico a nodos que ya no deberían atenderlo

Por eso esta separación se volvió tan importante en sistemas reales.

## Un ejemplo muy claro

Supongamos:

- el backend arrancó
- el proceso Java está arriba
- el endpoint HTTP básico responde
- pero la conexión a la base crítica todavía no está lista

En ese caso:

- **liveness** podría seguir siendo positiva
- pero **readiness** probablemente no

Porque el sistema sigue vivo, pero todavía no está listo para trabajar de verdad.

## Otro ejemplo

Ahora imaginá:

- la app quedó bloqueada en un estado raro
- no procesa nada bien
- ya no sale sola de ese estado

Ahí sí puede tener sentido que la señal de liveness falle, para que el entorno entienda que conviene reiniciar la instancia.

Esto muestra muy bien que liveness y readiness no son lo mismo.

## Qué es un health endpoint

A nivel práctico, muchas aplicaciones exponen algún endpoint o mecanismo que devuelve información de salud.

Conceptualmente, algo tipo:

```text
GET /health
```

o variantes equivalentes.

Lo importante no es memorizar un path universal, sino entender que:

> el backend necesita exponer alguna forma clara y consumible de informar su estado operativo.

Ese endpoint o check puede devolver:

- simple ok/fail
- estado más detallado
- subcomponentes
- estado general
- información resumida de dependencias

Y ahí también conviene tener bastante criterio.

## Qué no conviene hacer con un health check

No conviene que sea:

- tan superficial que siempre diga “ok” aunque media app esté inútil
- tan pesado que termine afectando demasiado al sistema
- tan verboso que exponga detalles sensibles innecesarios
- tan frágil que cualquier cosa menor lo vuelva inútil
- tan mal pensado que mezcle readiness y liveness sin criterio

Otra vez, la clave está en entender qué pregunta querés responder con cada check.

## Qué tipo de cosas puede mirar un health general

Por ejemplo:

- estado del proceso
- disponibilidad de base de datos
- colas o jobs críticos
- integración esencial
- storage requerido para operar
- disponibilidad de un componente interno importante

No siempre todas las dependencias deben pesar igual.
Y este matiz es muy importante.

## Qué diferencia hay entre dependencia crítica y dependencia accesoria

Supongamos que tu backend depende de:

- base de datos principal
- proveedor de emails
- servicio de analytics
- storage externo para archivos secundarios

No todo eso tiene el mismo peso operativo.

Por ejemplo:

### Crítica
Si la base cae, quizá la app no puede atender casi nada.
Eso puede afectar readiness de forma fuerte.

### Accesoria
Si analytics cae, tal vez la app puede seguir operando.
No necesariamente querés marcar toda la instancia como no lista por eso.

Esto muestra que los checks de salud no son solo técnicos.
También son decisiones de producto y operación.

## Un error muy común

Pensar que cualquier dependencia externa caída debe automáticamente volver “muerta” a toda la app.

No siempre.

A veces el sistema puede seguir operativo aunque degradado.

Entonces conviene preguntarte:

> ¿esta dependencia es necesaria para recibir tráfico útil o solo afecta una parte secundaria?

Esa diferencia vale muchísimo.

## Qué significa estado degradado

A veces la app no está completamente rota, pero tampoco está completamente bien.

Por ejemplo:

- la funcionalidad principal sigue viva
- pero fallan notificaciones
- o falla analytics
- o falla un proveedor complementario
- o ciertos jobs están atrasados

Eso puede ser importante para métricas, alertas o dashboards, aunque no siempre signifique que la instancia deba salir del balanceador.

Es decir:

> salud no siempre es solo binaria entre “ok” y “muerto”.

## Qué relación tiene esto con producción

Absolutamente total.

En desarrollo local, quizás no te importe tanto.
Pero en producción empiezan a importar muchísimo cosas como:

- si la instancia entra o no a recibir tráfico
- si se reinicia sola
- si el balanceador la considera lista
- si las alertas saltan
- si una degradación pasa inadvertida
- si el sistema se recupera o queda colgado

Ahí los checks dejan de ser un detalle y pasan a ser parte real de la operación del backend.

## Qué relación tiene esto con despliegues

También muy fuerte.

Imaginá un deploy donde la nueva versión tarda un poco en arrancar.

Si no tenés una forma clara de decir “todavía no estoy lista”, puede pasar que:

- el balanceador empiece a mandar tráfico demasiado pronto
- entren requests antes de que la app haya terminado su inicialización
- el rollout salga mal por timing y no por lógica de negocio

Entonces readiness tiene muchísimo valor también durante despliegues y arranques.

## Qué relación tiene esto con reinicios automáticos

Muy fuerte otra vez.

Si una plataforma o entorno necesita decidir si reinicia una instancia, la señal de liveness suele ser importante.

Porque no es lo mismo:

- una app todavía viva pero no lista un rato
- que una app trabada o rota que ya no debería seguir

Confundir esos casos puede hacer que reinicies mal o no reinicies cuando sí deberías.

## Un ejemplo muy intuitivo

Podés pensar así:

### Caso 1
La app está arrancando, no recibió todo aún.
- viva: sí
- lista: no

### Caso 2
La app quedó colgada.
- viva: probablemente no
- lista: tampoco

### Caso 3
La app opera, pero falla una integración secundaria.
- viva: sí
- lista: depende del peso real de esa integración
- salud general: quizá degradada

Esta forma de pensar ordena muchísimo.

## Qué relación tiene esto con microservicios y sistemas distribuidos

Muy directa.

A medida que el sistema se vuelve más distribuido o más modular operativamente, estas señales son todavía más importantes porque otras piezas del sistema necesitan saber si una instancia o servicio:

- puede recibir requests
- puede participar del flujo
- debe salir de rotación
- debe reiniciarse
- o está degradado

Por eso es lógico que este tema aparezca justo ahora en el recorrido.

## Qué relación tiene esto con observabilidad

Muy fuerte.

Podés pensar health checks como una parte específica de la observabilidad operativa.

No reemplazan:

- logs
- métricas
- trazas

pero los complementan con una pregunta muy concreta:

> ¿el sistema declara que está bien, vivo o listo?

Eso es distinto a simplemente tener logs o gráficas.
Es una señal operativa directa.

## Qué pasa si un health endpoint miente

Este es un punto muy importante.

Si el health siempre devuelve “ok” aunque el sistema esté prácticamente inutilizable, entonces deja de servir.

Pero si cualquier detalle menor lo vuelve “down”, también deja de servir bien operativamente.

Entonces los checks tienen que ser **honestos, útiles y proporcionados**.

No perfectos, pero sí razonables.

## Un ejemplo de check demasiado superficial

```text
200 OK
{"status":"UP"}
```

aunque:

- la base está caída
- no se puede autenticar nadie
- el checkout no funciona
- no hay conexión a nada crítico

Ese check da una falsa sensación de salud.

## Un ejemplo de check demasiado severo

```text
DOWN
```

porque falló una integración totalmente secundaria que no impide servir tráfico principal.

Eso también puede disparar decisiones operativas incorrectas.

Otra vez:
la clave está en distinguir qué es realmente crítico.

## Qué tipo de checks básicos suele tener sentido pensar

Por ejemplo:

- proceso vivo
- app terminando de arrancar o no
- base principal disponible
- dependencias críticas mínimas
- capacidad de recibir requests razonables
- estado de ciertos componentes internos importantes

No hace falta instrumentar cien checks el primer día.
Pero sí conviene empezar con algunos que tengan sentido de verdad.

## Qué relación tiene esto con base de datos

Muy fuerte.

En muchísimos backends, la base principal es una dependencia tan central que su indisponibilidad afecta directamente la readiness.

Porque si la app no puede leer o escribir lo mínimo necesario para operar, probablemente no debería recibir tráfico normal.

Este suele ser uno de los checks más evidentes y valiosos.

## Qué relación tiene esto con integraciones externas

También importante, pero con más matices.

Por ejemplo:

- si falla el proveedor de pagos, ¿toda la app deja de estar lista?
- si falla el proveedor de emails, ¿la app deja de estar lista?
- si falla storage, ¿todo el backend está fuera o solo cierta funcionalidad?

La respuesta depende del peso de esa integración en el producto real.

Y esa es justamente una de las razones por las que health checks también son decisiones de arquitectura y negocio.

## Qué relación tiene esto con readiness durante degradación

A veces, aunque una dependencia crítica parcial falle, podés decidir algo como:

- sacar la instancia del tráfico general
- o mantenerla si todavía hay suficiente funcionalidad útil
- o distinguir estados más finos

No hace falta que resuelvas una taxonomía perfecta ahora.
Lo importante es entender que readiness no siempre se reduce a una sola regla trivial.

## Qué pasa con jobs, colas o tareas asíncronas

También puede importar.

Por ejemplo, si una parte muy importante del sistema depende de que ciertos consumidores o jobs estén operando, quizá quieras observar o declarar también algo sobre eso.

No siempre será parte del readiness principal.
Pero en algunos sistemas sí puede ser una señal útil.

Esto muestra otra vez que la salud del backend no siempre se limita al request-response básico.

## Qué relación tiene esto con operadores y alertas

Muy fuerte.

Un health check razonable ayuda a:

- detectar instancias malas
- investigar degradaciones
- activar alertas
- entender si el problema es de readiness o liveness
- reducir adivinanza operativa

Es decir, no solo sirve a máquinas o plataformas.
También sirve a personas que operan el sistema.

## Qué relación tiene esto con debugging

También aporta mucho.

Porque si una instancia empieza a fallar, al menos tenés una señal rápida sobre si:

- está viva
- está lista
- perdió una dependencia crítica
- sigue respondiendo pero no en condiciones reales

Eso ya orienta bastante mejor la investigación.

## Qué no conviene exponer de más

Otro punto importante.

Un endpoint de salud no debería convertirse en una filtración de detalles sensibles innecesarios.

No conviene exponer alegremente:

- secrets
- estructuras internas completas
- credenciales
- detalles excesivos del sistema
- topología o infraestructura sensible si no hace falta

La salud debe ser útil, pero no ingenua desde el punto de vista de seguridad.

## Qué relación tiene esto con seguridad

Muy fuerte también.

Porque algunos checks pueden ser:

- públicos
- internos
- parciales
- con distinto nivel de detalle según entorno o protección

No toda señal de salud necesita estar igual de expuesta hacia todo el mundo.

Este es otro punto donde operación y seguridad se cruzan.

## Qué no conviene hacer

No conviene:

- no tener ninguna señal razonable de salud
- usar un “ok” vacío para todo
- marcar down por cualquier cosa irrelevante
- mezclar readiness y liveness sin criterio
- exponer demasiada información sensible
- olvidar que ciertas dependencias importan distinto según el caso

Ese tipo de decisiones hace que el health check sea poco útil o incluso contraproducente.

## Otro error común

Creer que health checks son solo para Kubernetes o para sistemas gigantes.

En realidad, incluso antes de entrar a una orquestación sofisticada, pensar bien estas señales ya mejora mucho la madurez del backend.

## Otro error común

Pensar solo en “si la app arranca” y no en “si está lista para trabajar”.
La diferencia entre ambas preguntas es una de las claves del tema.

## Otro error común

No revisar con el tiempo qué dependencias son realmente críticas para la readiness.
A veces el backend evoluciona y los checks deberían evolucionar con él.

## Una buena heurística

Podés preguntarte:

- ¿qué significa que esta app esté realmente lista?
- ¿qué dependencia, si cae, la deja sin capacidad real de atender tráfico?
- ¿qué falla implica reiniciar y qué falla solo implica sacar de rotación?
- ¿qué parte del sistema puede estar degradada sin que toda la instancia quede inutilizable?
- ¿este check me ayuda a operar mejor o solo da una ilusión de control?

Responder esto te ayuda muchísimo a diseñar checks más útiles.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque a esta altura del backend ya no estás pensando en un programa local cualquiera.
Estás pensando en una aplicación que:

- corre en entornos reales
- recibe tráfico
- depende de integraciones
- tiene estados
- puede degradarse
- y necesita convivir con despliegue, monitoreo y operación

En ese escenario, poder declarar si está viva o lista ya no es una cuestión secundaria.

## Relación con Spring Boot

Spring Boot encaja muy bien con esta preocupación porque su ecosistema facilita muchísimo trabajar este tipo de capacidades operativas.
Pero incluso antes de usar cualquier herramienta concreta, lo más importante es entender la lógica de fondo:

- vivo no es lo mismo que listo
- listo no es lo mismo que perfecto
- una dependencia crítica no pesa igual que una accesoria
- y un health check útil es una herramienta operativa, no un adorno

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> pensar health, readiness y liveness en un backend Spring Boot significa dejar de confundir “el proceso está arriba” con “la aplicación está realmente en condiciones de operar”, definiendo checks útiles que distingan si la instancia sigue viva, si está lista para recibir tráfico y si ciertas dependencias críticas la vuelven operativamente sana o no.

## Resumen

- No alcanza con que el proceso exista; el backend también puede necesitar declarar si está listo o degradado.
- Liveness y readiness responden preguntas distintas y conviene no mezclarlas.
- Un health check útil debe ser honesto, proporcional y operativamente relevante.
- Las dependencias críticas y las accesorias no pesan igual en la salud del sistema.
- Producción, despliegue, reinicios y balanceo hacen que estos checks sean muy valiosos.
- Seguridad y observabilidad también se cruzan con esta parte de la operación.
- Este tema suma una capa muy importante de madurez para que el backend no solo funcione, sino que también pueda operar mejor en entornos reales.

## Próximo tema

En el próximo tema vas a ver cómo pensar la comunicación entre servicios y el uso de APIs internas o eventos cuando ya existen varios componentes o módulos con vida más independiente, porque a partir de acá empieza a tomar todavía más fuerza la lógica de sistemas distribuidos.
