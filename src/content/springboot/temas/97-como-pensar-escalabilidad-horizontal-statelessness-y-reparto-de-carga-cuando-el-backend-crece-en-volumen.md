---
title: "Cómo pensar escalabilidad horizontal, statelessness y reparto de carga cuando el backend crece en volumen"
description: "Entender qué cambia cuando un backend Spring Boot necesita crecer en tráfico o concurrencia, por qué varias instancias exigen pensar mejor el estado y cómo se relacionan escalabilidad horizontal, statelessness y balanceo de carga."
order: 97
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- tolerancia a fallos
- degradación razonable
- dependencias críticas y accesorias
- fallos parciales
- evitar cascadas
- seguir siendo útil aunque no todo esté perfecto

Eso ya te dejó una idea muy importante:

> un backend real no se mide solo por cómo funciona en el flujo feliz, sino también por cómo se comporta cuando una parte falla, se pone lenta o deja de responder.

Ahora aparece otra pregunta muy natural cuando el sistema empieza a crecer en uso real:

> ¿qué pasa cuando una sola instancia del backend ya no alcanza o querés distribuir mejor la carga?

Porque hasta cierto punto uno imagina el backend así:

- una app
- un proceso
- una instancia
- una URL
- todo corre en un solo lugar

Pero en sistemas reales, muy rápido puede aparecer la necesidad de:

- atender más tráfico
- soportar más concurrencia
- evitar que todo dependa de una sola instancia
- escalar según demanda
- repartir requests
- desplegar varias copias del backend
- tolerar mejor caídas de nodos individuales

Ahí aparecen ideas muy importantes como:

- **escalabilidad horizontal**
- **statelessness**
- **balanceo o reparto de carga**
- **múltiples instancias**
- **sesiones y estado compartido**
- **coherencia entre nodos**

Este tema es clave porque, apenas el backend deja de vivir como “una sola caja”, cambia bastante la forma correcta de pensar el estado, la autenticación, la operación y la arquitectura general del sistema.

## El problema de asumir siempre una sola instancia

Cuando el sistema todavía es chico, es muy natural imaginar que todo sucede en una sola aplicación corriendo en un solo proceso.

Ese modelo suele implicar supuestos como:

- toda request le pega al mismo backend
- toda memoria local está disponible siempre
- cualquier estado guardado en RAM sirve para próximas requests
- no hay que pensar demasiado quién atiende qué request
- el proceso es la aplicación entera

Eso puede funcionar mientras realmente haya una sola instancia y el tráfico sea moderado.

Pero apenas querés crecer un poco, aparecen preguntas como:

- ¿y si levanto dos instancias?
- ¿y si una cae?
- ¿y si el tráfico se reparte entre varias?
- ¿y si el usuario pega una request a un nodo y la siguiente a otro?
- ¿y si guardé algo en memoria local de una sola instancia?

Ahí es donde muchos supuestos cómodos empiezan a romperse.

## Qué significa escalabilidad horizontal

Dicho simple:

> escalar horizontalmente significa aumentar capacidad agregando más instancias del backend en paralelo, en lugar de confiar solo en hacer cada máquina más grande o más potente.

Es decir, en vez de pensar solo en:

- más CPU
- más RAM
- una máquina más grande

pensás también en:

- más copias del backend
- varias instancias trabajando al mismo tiempo
- carga repartida entre ellas

Esta idea es central en muchísimos sistemas modernos.

## Qué diferencia hay con escalar verticalmente

A muy alto nivel:

### Escalado vertical
Hacés más grande una sola instancia o máquina.

### Escalado horizontal
Agregás más instancias y repartís la carga.

Ambas estrategias pueden coexistir.
No es una guerra religiosa.
Pero para muchos sistemas reales, el escalado horizontal se vuelve muy importante porque:

- reparte riesgo
- reparte carga
- permite mayor elasticidad
- reduce dependencia de una única instancia gigante

## Qué significa reparto o balanceo de carga

Significa, básicamente:

> distribuir requests entre varias instancias disponibles del backend.

La idea es que el tráfico no le pegue siempre a una sola copia del sistema, sino que se reparta entre varias para:

- usar mejor recursos
- soportar más concurrencia
- reducir saturación individual
- tolerar mejor la caída de una instancia

Esto puede ocurrir mediante un balanceador o algún mecanismo de orquestación equivalente.

No hace falta entrar ya en productos concretos.
Lo importante es entender el problema que resuelve.

## Un ejemplo muy simple

Imaginá tres instancias del backend:

- backend-1
- backend-2
- backend-3

Y un balanceador delante.

Cuando llega tráfico, el balanceador puede repartir requests entre esas tres instancias.

Eso parece sencillo.
Pero enseguida trae una consecuencia muy importante:

> no podés asumir que la próxima request del mismo usuario le va a pegar al mismo nodo que la anterior.

Y ahí aparece uno de los conceptos más importantes del tema:
**statelessness**.

## Qué significa statelessness

Dicho simple:

> significa que cada request debería poder procesarse con la información necesaria sin depender de estado volátil guardado únicamente en la memoria local de una instancia concreta.

Esa definición es muy importante.

No significa que el sistema no tenga estado en absoluto.
Claro que tiene estado:

- usuarios
- pedidos
- pagos
- archivos
- roles
- tokens
- configuraciones

Lo que significa es:

> la instancia del backend no debería depender demasiado de guardar información crítica de continuidad solo en su RAM local esperando que la próxima request vuelva al mismo lugar.

## Una intuición muy útil

Podés pensar así:

- el **sistema** puede tener estado
- pero la **instancia HTTP** idealmente no debería guardar demasiado estado local imprescindible entre requests si querés escalar y repartir carga bien

Esta diferencia es central.

## Por qué el statelessness ayuda tanto

Porque si cada request puede resolverse sin depender de la memoria privada de una instancia específica, entonces:

- cualquier instancia puede atenderla
- el balanceador puede repartir tráfico con más libertad
- si una instancia cae, otra puede seguir atendiendo
- el escalado horizontal se vuelve mucho más natural
- el sistema se acopla menos a nodos individuales

Eso mejora muchísimo la operabilidad.

## Un ejemplo de mala suposición

Supongamos que una instancia guarda en memoria local algo crítico de autenticación o de continuidad de un flujo, y espera que la próxima request vuelva a esa misma instancia.

Si la próxima request va a otra, podés tener cosas como:

- sesión no encontrada
- paso siguiente roto
- flujo inconsistente
- comportamiento errático difícil de reproducir

Eso muestra muy bien por qué el estado pegado a una sola instancia puede ser problemático.

## Qué relación tiene esto con JWT

Muy fuerte.

Una de las razones por las que JWT fue tan atractivo en muchas APIs es justamente que ayuda bastante a un modelo más stateless del lado HTTP.

Porque, a grandes rasgos:

- el cliente trae su token
- la request trae información suficiente para reconstruir autenticación
- no dependés tanto de una sesión guardada solo en una instancia particular

No significa que JWT resuelva todo el universo.
Pero sí encaja bastante bien con sistemas que quieren atender requests desde múltiples instancias sin depender de memoria local específica.

## Qué pasa con sesiones del lado servidor

También se puede trabajar con sesiones, claro.
Pero cuando el sistema escala horizontalmente, si la sesión vive solo en memoria local de una instancia, aparece un problema.

Porque:

- request 1 va al nodo A
- sesión se guarda en A
- request 2 va al nodo B
- B no sabe nada de esa sesión

Entonces, si querés mantener ese modelo, necesitás pensar cosas como:

- afinidad de sesión
- almacenamiento compartido de sesión
- una estrategia operativa más compleja

Esto no significa que esté prohibido.
Solo muestra por qué el statelessness suele ser tan valioso.

## Qué es afinidad o “sticky sessions”

A alto nivel, implica intentar que un mismo cliente siga cayendo en la misma instancia para aprovechar estado local.

Eso puede ser útil en algunos contextos, pero también trae costos:

- más acoplamiento a nodos individuales
- peor distribución flexible
- más fragilidad ante caídas
- más complejidad operativa

Por eso, cuando el sistema puede evitar depender de eso, muchas veces gana bastante.

## Qué tipo de estado sí suele vivir fuera de la instancia

Por ejemplo:

- base de datos
- cache compartida
- storage externo
- colas
- sistema de sesión compartido si existiera
- proveedores externos
- eventos persistidos
- configuración externa

Es decir, el sistema puede seguir teniendo estado, pero en componentes más apropiados y compartidos, no solo en la RAM privada de una sola instancia.

## Un ejemplo muy claro

Supongamos un flujo donde querés saber si una orden está pagada.

Lo sano no sería depender de que una instancia “se acuerde” porque lo vio recién.

Lo sano suele ser consultar o reconstruir eso desde una fuente compartida y consistente del sistema:

- la base
- el estado local persistido
- una cache compartida si aplica
- etcétera

Eso permite que cualquier instancia llegue a la misma respuesta razonablemente.

## Qué relación tiene esto con cache

Muy interesante.

El cache puede ayudar muchísimo al rendimiento.
Pero también puede complicar bastante el modelo si no se piensa bien.

Por ejemplo:

- cache local por instancia puede divergir entre nodos
- cache compartida puede resolver parte del problema, pero introduce otros tradeoffs

No hace falta en este tema resolver toda la ingeniería de cache.
Lo importante es notar que:

> a medida que hay varias instancias, todo estado derivado o cacheado también necesita pensarse con más cuidado.

## Qué relación tiene esto con uploads y archivos temporales

Muy fuerte.

Si una instancia guarda algo temporal solo en su disco local y luego otra instancia debe continuar el flujo, puede aparecer inconsistencia.

Por eso, cuando el sistema escala o distribuye carga, muchas veces conviene que esos recursos vivan en:

- storage compartido
- proveedor externo
- algún mecanismo accesible para todas las instancias relevantes

Otra vez se ve muy clara la misma idea:
**no depender demasiado de un nodo individual**.

## Qué relación tiene esto con tareas asíncronas

También importa mucho.

Si varias instancias pueden producir eventos, procesar jobs o recibir webhooks, necesitás pensar:

- cómo se reparte trabajo
- cómo evitar duplicados
- qué nodo procesa qué
- qué estado se comparte
- cómo se coordinan reintentos

Esto se conecta bastante con los temas anteriores de idempotencia, eventos y consistencia eventual.

## Qué gana el sistema con varias instancias

Muchísimo, si está bien diseñado.

Por ejemplo:

- más capacidad agregada
- mejor tolerancia a caída de un nodo
- posibilidad de crecer con demanda
- mejor reparto de tráfico
- menos dependencia de una sola máquina
- despliegues potencialmente más flexibles
- mejor resiliencia general

Pero esto no aparece por magia.
Se apoya en decisiones de diseño bastante concretas.

## Qué problemas aparecen si el sistema no estaba preparado

Si levantás varias instancias sin pensar bien el estado y el reparto de carga, podés ver cosas como:

- requests inconsistentes
- sesiones perdidas
- pasos de flujo que a veces funcionan y a veces no
- comportamiento distinto según nodo
- archivos temporales no encontrados
- caches desalineadas
- errores intermitentes difíciles de reproducir
- operaciones duplicadas

Entonces la escalabilidad horizontal no es solo “copiar la app varias veces”.
Es también preparar el backend para que eso tenga sentido.

## Qué relación tiene esto con base de datos

Muy fuerte.

En muchísimos casos, la base termina siendo una pieza compartida central entre varias instancias.

Eso es útil, pero también significa que el backend puede escalar horizontalmente más fácil que su persistencia si no se piensa bien la arquitectura completa.

No hace falta resolver ahora la ingeniería profunda de bases a gran escala.
Pero conviene notar que:

> tener muchas instancias de backend no elimina automáticamente otros cuellos de botella.

Esto es una observación muy sana.

## Qué relación tiene esto con balanceadores y health checks

Muy directa.

Si querés varias instancias detrás de un balanceador, se vuelve importantísimo saber:

- cuáles están listas
- cuáles están vivas
- cuáles deben recibir tráfico
- cuáles están degradadas
- qué pasa si una cae

Esto conecta perfecto con el tema anterior sobre liveness y readiness.

## Qué relación tiene esto con despliegue gradual

También muy fuerte.

Tener varias instancias puede permitir cosas como:

- sacar una del tráfico
- desplegar otra
- validar readiness
- ir renovando instancias sin apagar todo de golpe

Eso mejora mucho la operación.
Pero, otra vez, solo si el sistema no depende ciegamente de estado pegado a una sola instancia.

## Qué relación tiene esto con auth y sesiones del usuario

Muy importante.

Si el usuario puede caer en distintas instancias entre requests, entonces la autenticación debería poder reconstruirse o validarse desde información accesible y coherente.

Por eso ayudan tanto cosas como:

- JWT
- store compartido si usás sesiones
- no depender de memoria local de un nodo

Esto hace que el usuario experimente el sistema como un único backend coherente aunque por detrás haya varias instancias.

## Qué relación tiene esto con sistemas distribuidos

Muy directa.

Este tema es una puerta de entrada muy concreta al pensamiento distribuido.
Porque aunque todavía no tengas veinte microservicios, ya estás enfrentando preguntas típicas de sistemas distribuidos como:

- varias instancias
- reparto de tráfico
- estado compartido
- dependencia menor del nodo individual
- coherencia entre copias
- fallos parciales
- escalado

Es decir, ya no estás pensando solo en una app aislada.
Estás pensando en un sistema.

## Qué no conviene hacer

No conviene:

- asumir que varias instancias van a comportarse bien sin revisar el manejo del estado
- depender demasiado de RAM local entre requests
- usar sticky sessions como excusa para no pensar el problema de fondo
- ignorar caches, archivos o sesiones locales como fuentes de inconsistencia
- creer que “más instancias” arregla cualquier cuello de botella automáticamente

Ese tipo de suposiciones suele traer problemas bastante molestos.

## Otro error común

Confundir “stateless” con “el sistema no tiene estado”.
Sí tiene estado.
La clave es dónde vive y de qué depende cada request.

## Otro error común

Pensar que escalar horizontalmente es solo infraestructura.
No.
También exige decisiones de diseño de aplicación y de dominio.

## Otro error común

No distinguir entre:
- capacidad de levantar más copias
- y capacidad real de que esas copias trabajen bien juntas

La segunda es la que de verdad importa.

## Una buena heurística

Podés preguntarte:

- ¿esta request necesita depender de memoria local de una instancia específica?
- ¿si el siguiente request cae en otro nodo, sigue funcionando?
- ¿qué parte del estado vive en recursos compartidos y qué parte solo en RAM local?
- ¿qué pasa si una instancia cae en medio del tráfico?
- ¿el balanceador puede tratar estas instancias como razonablemente intercambiables?
- ¿qué autenticación o continuidad del flujo depende hoy demasiado de un solo nodo?

Responder eso te ayuda muchísimo a madurar el backend para escalar mejor.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque apenas el sistema crece un poco en tráfico, disponibilidad esperada o necesidad de resiliencia, empieza a importar muchísimo que:

- varias instancias puedan existir
- el tráfico se reparta
- el usuario no dependa de un nodo único
- una caída parcial no tire todo abajo
- el backend se comporte como un servicio, no como un proceso individual irrepetible

Ese es un paso muy importante de madurez operativa.

## Relación con Spring Boot

Spring Boot funciona muy bien en este escenario si la aplicación está bien pensada para ello.
Pero el framework no vuelve automáticamente stateless a tu backend.

La clave sigue siendo tu diseño:

- dónde vive el estado
- cómo reconstruís autenticación
- cómo compartís recursos importantes
- cómo evitás acoplar el flujo a un nodo concreto
- y cómo preparás el sistema para que varias instancias trabajen bien juntas

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando un backend Spring Boot empieza a crecer en tráfico o resiliencia, escalar horizontalmente no significa solo levantar más copias, sino diseñar el sistema para que varias instancias puedan atender requests de forma coherente, con poco acoplamiento al estado local de cada nodo, apoyándose en recursos compartidos y en un modelo más cercano al statelessness.

## Resumen

- Escalar horizontalmente implica agregar más instancias y repartir carga entre ellas.
- Eso vuelve mucho más importante no depender excesivamente de estado guardado solo en la memoria local de un nodo.
- Statelessness no significa ausencia total de estado, sino menor dependencia del estado volátil de cada instancia entre requests.
- JWT, storage compartido, bases y otros recursos comunes ayudan mucho en este modelo.
- Varias instancias mal pensadas pueden producir inconsistencias, sesiones perdidas o errores difíciles de reproducir.
- Balanceo de carga, health checks y readiness se conectan fuertemente con este tema.
- Este tema marca otro gran paso desde “una app corriendo” hacia “un backend que se comporta como sistema operable y escalable”.

## Próximo tema

En el próximo tema vas a ver cómo pensar datos compartidos, ownership y límites de base de datos cuando varias partes del sistema ya no viven de forma tan centralizada, porque después de repartir instancias y carga, aparece muy fuerte la pregunta de quién es dueño de qué datos y cómo se coordinan.
