---
title: "Cómo pensar datos compartidos, ownership y límites de base de datos cuando el sistema ya no vive tan centralizado"
description: "Entender qué cambia cuando varios módulos o servicios necesitan datos relacionados, por qué compartir todo en una sola base puede traer costos ocultos y cómo pensar ownership, límites y coordinación de datos con más criterio."
order: 98
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- escalabilidad horizontal
- varias instancias del backend
- statelessness
- reparto de carga
- menor dependencia del estado local de cada nodo
- coherencia entre varias copias del sistema

Eso ya te dejó una idea muy importante:

> cuando el backend deja de vivir como una sola instancia aislada, empiezan a importar muchísimo más el estado compartido, la forma de coordinar recursos y la capacidad de que varias partes trabajen juntas sin depender de un único nodo.

Pero enseguida aparece otra pregunta igual de central cuando el sistema empieza a tener:

- varios módulos fuertes
- varios servicios
- fronteras de dominio más serias
- contratos internos
- equipos distintos
- componentes más autónomos

La pregunta es:

> ¿quién es realmente dueño de qué datos?

Porque una cosa es pensar en:

- auth
- users
- orders
- payments
- storage
- notifications
- analytics

como módulos o servicios distintos.

Y otra muy distinta es decidir:

- si todos pueden leer y escribir sobre la misma base sin límites
- si cada parte tiene datos propios
- si hay tablas compartidas entre dominios
- cómo se consulta información cruzada
- cómo se coordinan cambios de datos
- qué pasa cuando varios componentes necesitan “la misma” información
- cómo evitar que el acoplamiento por datos destruya la separación lógica que venías construyendo

Ahí aparecen ideas muy importantes como:

- **ownership de datos**
- **límites de base de datos**
- **fuente de verdad**
- **compartir o no compartir tablas**
- **coordinación entre módulos**
- **acoplamiento por persistencia**
- **lectura cruzada vs escritura cruzada**
- **autonomía de datos**

Este tema es clave porque muchos sistemas parecen modularizados por código, pero por debajo siguen completamente enredados porque todos escriben sobre todo y nadie tiene claro quién es dueño de qué.

## El problema de que todos toquen todos los datos

Cuando el sistema todavía es chico, es muy tentador pensar la persistencia así:

- una sola base
- todas las tablas juntas
- cualquier módulo puede leer o escribir lo que necesite
- total, está todo ahí

Mientras el backend es pequeño, eso puede parecer cómodo.
Pero a medida que el sistema crece, esa comodidad empieza a traer costos muy concretos:

- módulos que invaden datos de otros
- lógica de negocio repartida de forma confusa
- dificultad para saber quién manda sobre qué tabla o campo
- cambios que impactan demasiadas áreas
- refactors peligrosos
- separación lógica débil aunque las carpetas se vean lindas
- equipos pisándose
- servicios que parecen separados, pero siguen atados por la base

Entonces aparece una verdad muy importante:

> compartir base no siempre significa compartir responsabilidad.

Y justamente por eso hay que pensar ownership.

## Qué significa ownership de datos

Dicho simple:

> ownership de datos significa definir qué módulo, dominio o servicio es el responsable principal de la verdad y de la escritura sobre cierta información.

Por ejemplo:

- auth puede ser dueño de credenciales
- users puede ser dueño del perfil
- orders puede ser dueño de pedidos
- payments puede ser dueño de intentos de pago y estados de cobro
- storage puede ser dueño de referencias técnicas de archivos
- notifications puede ser dueño del historial de envíos

Esto no significa que nadie más pueda usar esos datos.
Significa algo más importante:

> no todo el mundo debería decidir libremente su estructura, semántica y mutación.

## Por qué esto importa tanto

Porque cuando no hay ownership claro, pasan cosas como:

- varios módulos actualizan el mismo dato con criterios distintos
- una tabla parece pertenecer a todos y en realidad no pertenece a nadie
- las reglas del dominio se diluyen
- refactorizar se vuelve muy riesgoso
- un cambio en una entidad rompe media app
- el sistema parece modular por fuera, pero por dentro sigue totalmente acoplado

En otras palabras:

> sin ownership claro, la base de datos puede convertirse en el lugar donde reaparece todo el acoplamiento que intentaste sacar del código.

## Una intuición muy útil

Podés pensar así:

- **usar un dato** no te vuelve automáticamente dueño de ese dato
- **ser dueño** implica definirlo, validarlo, persistirlo y decidir sus reglas principales

Esta diferencia vale muchísimo.

## Un ejemplo claro con usuarios

Supongamos que tenés estos módulos:

- `auth`
- `users`
- `orders`

Todos necesitan algo del usuario.
Pero no todos deberían ser dueños de la misma parte de la información.

Por ejemplo:

### Auth
Podría ser dueño de:
- password hash
- refresh tokens
- proveedor de login
- credenciales

### Users
Podría ser dueño de:
- nombre visible
- bio
- avatar
- preferencias
- perfil

### Orders
Podría necesitar:
- userId
- email de contacto
- nombre de envío en cierto momento

Fijate lo importante de esto:
orders usa datos del usuario, pero no por eso debería escribir libremente la tabla o el modelo completo de users.

## Qué diferencia hay entre leer datos y mandar sobre esos datos

Otra vez aparece un matiz central.

Una cosa es:

- necesitar consultar un dato

Y otra muy distinta es:

- ser la autoridad que decide cómo se guarda, valida o modifica ese dato

Por ejemplo:

- payments puede necesitar saber el email del comprador
- pero eso no lo vuelve dueño del perfil del usuario

- notifications puede necesitar el nombre del usuario
- pero no debería por eso modificar users como si fuera su dominio

Ese límite evita muchísimo caos.

## Qué significa fuente de verdad

A nivel simple:

> la fuente de verdad es la parte del sistema que se considera autoridad principal sobre una información concreta.

Por ejemplo:

- el estado oficial del pedido quizá vive en orders
- el estado oficial del intento de pago quizá vive en payments
- la referencia oficial del archivo quizá vive en storage metadata
- la credencial oficial quizá vive en auth

Esto no impide copias derivadas, caches o datos replicados.
Pero sí define algo muy importante:

> si hay conflicto o duda, ¿qué parte manda realmente?

Sin esa claridad, el sistema se vuelve mucho más ambiguo.

## El problema de compartir tablas entre dominios

Este es uno de los clásicos.

A veces, por comodidad, varios módulos empiezan a tocar directamente las mismas tablas o entidades centrales.

Al principio parece práctico.
Pero puede traer varios problemas:

- responsabilidades mezcladas
- reglas dispersas
- cambios de esquema con impacto cruzado
- ownership difuso
- dependencia fuerte entre módulos
- falsa separación arquitectónica

Por ejemplo, si orders, auth, users, payments y notifications escriben directamente sobre la misma entidad enorme `User`, probablemente el sistema no esté tan modularizado como parece.

## Una señal muy útil de acoplamiento

Podés sospechar acoplamiento de datos excesivo cuando:

- muchas partes escriben la misma tabla
- una entidad central gigantesca es usada por todos
- el cambio de una columna afecta muchos módulos
- nadie tiene claro qué parte decide el significado de un campo
- las migraciones de base son políticamente delicadas porque tocan demasiados intereses
- los módulos parecen distintos pero todos manipulan las mismas estructuras internas

Eso suele indicar que el ownership todavía no está bien resuelto.

## Qué pasa si hay una sola base pero querés límites sanos igual

Muy buena pregunta.

No hace falta que el sistema esté en mil bases separadas o en microservicios para empezar a pensar mejor ownership.

Aun dentro de una sola base, podés mejorar muchísimo si:

- cada módulo tiene más claro qué tablas o estructuras le pertenecen
- otros módulos consumen datos con más respeto por ese ownership
- evitás escrituras cruzadas innecesarias
- separás semánticas
- reducís el acoplamiento por entidades gigantes compartidas

Es decir:

> los límites sanos de datos pueden empezar incluso antes de separar físicamente la persistencia.

Esto es importantísimo porque mucha gente piensa que ownership solo existe si hay varias bases.
Y no es así.

## Una heurística muy valiosa

Podés preguntarte:

> si mañana cambiara la estructura interna de estos datos, ¿quién debería poder decidirlo y quién debería adaptarse?

La respuesta a esa pregunta suele mostrar bastante bien quién es realmente el dueño.

## Un ejemplo con pedidos y pagos

Supongamos:

- `orders` es dueño del pedido
- `payments` es dueño del intento de pago

Están fuertemente relacionados, sí.
Pero no son lo mismo.

Por ejemplo:

### Orders decide
- items
- subtotal
- dirección
- estado de orden
- lifecycle del pedido

### Payments decide
- externalPaymentId
- provider
- estado del intento de cobro
- referencias del cobro
- reconciliación con el webhook

Si `payments` empieza a escribir arbitrariamente sobre la tabla de orders como si fuera suya, o si `orders` empieza a decidir el detalle interno del intento de pago, el límite se vuelve mucho más borroso y riesgoso.

## Qué relación tiene esto con eventos

Muy fuerte.

Una forma bastante sana de respetar ownership es hacer que otros módulos reaccionen a hechos del módulo dueño, en vez de meterse directamente a modificar sus datos internos.

Por ejemplo:

- orders publica `PedidoCreado`
- payments decide si crea un intento
- notifications reacciona
- analytics reacciona

Eso suele ser más sano que tener a todos escribiendo libremente sobre la misma estructura de datos central.

No resuelve todo, claro.
Pero reduce mucho la invasión directa.

## Qué relación tiene esto con consultas cruzadas

Otra pregunta central.

Muchas veces un módulo necesita datos de otro para mostrar algo o ejecutar un flujo.

Eso es normal.

La pregunta importante es:

> ¿cómo obtiene esos datos sin convertirse en dueño de ellos ni acoplarse brutalmente a su persistencia interna?

Algunas posibilidades conceptuales pueden ser:

- consulta a una API interna
- consumo de una proyección o resumen
- uso de eventos para mantener una vista derivada
- contrato acotado de lectura
- join local en un monolito, pero con bastante criterio y sin confundir ownership

No siempre hay una única solución universal.
Lo importante es entender que:

- consultar
- escribir
- y ser dueño

no son la misma cosa.

## Qué problema trae compartir una entidad gigante

Supongamos una entidad `User` enorme usada por:

- auth
- users
- orders
- payments
- admin
- notifications

Eso puede traer varias consecuencias:

- todos dependen de todo
- el modelo crece como bola de nieve
- nadie sabe qué parte pertenece a qué contexto
- un cambio pequeño genera miedo
- se vuelve difícil separar ownership
- la base se transforma en la trampa que anula la modularidad del código

Esto es una de las razones por las que conviene desconfiar de las entidades todoterreno compartidas por media app.

## Qué relación tiene esto con microservicios

Muy directa.

Cuando el sistema se distribuye más, la pregunta sobre ownership de datos se vuelve todavía más seria.

Porque ya no solo importa quién “debería mandar”.
También importan cosas como:

- quién tiene su propia base o esquema
- quién expone datos a quién
- si hay replicación
- si hay duplicación intencional
- cómo se sincronizan
- qué pasa si no podés hacer joins cómodos entre servicios
- cómo modelás lecturas agregadas

En ese punto, la arquitectura de datos se vuelve completamente central.

## Qué pasa si varios servicios comparten la misma base

Esto puede ocurrir, claro.
Y no es automáticamente pecado.

Pero conviene entender el costo:
si varios servicios separados operativamente comparten la misma base de forma caótica, muchas veces la independencia real queda bastante erosionada.

Porque:

- cambios de esquema impactan a varios
- los límites se vuelven difusos
- el despliegue se acopla más
- el ownership se complica
- la “separación” por servicios puede ser más superficial de lo que parece

Otra vez:
no es blanco o negro.
Pero sí es una tensión muy importante.

## Qué pasa con datos replicados o duplicados intencionalmente

Esto es otro punto muy interesante.

A veces, para reducir acoplamiento o facilitar lecturas, un módulo puede guardar una copia parcial o proyección derivada de datos de otro.

Eso no es automáticamente malo.
Pero conviene tener clarísimo:

- quién es la fuente de verdad
- qué dato es derivado
- cómo se actualiza
- cuánto delay es aceptable
- qué pasa si se desincroniza

Esto conecta muy fuerte con consistencia eventual.

## Un ejemplo claro

Notifications puede guardar un resumen mínimo de contacto del usuario para ciertos envíos.
Pero eso no debería significar que notifications pasó a ser dueño del perfil del usuario.

Es una proyección o dato derivado para un propósito concreto, no la fuente de verdad del dominio original.

Esa distinción vale muchísimo.

## Qué relación tiene esto con reporting y analytics

También muy fuerte.

En muchos sistemas, reporting o analytics consumen datos de varios dominios.
Pero eso no los vuelve dueños del dato original.

Suelen trabajar más sobre:

- proyecciones
- copias analíticas
- resúmenes
- pipelines
- vistas derivadas

Esto también ayuda a no confundir el sistema transaccional con el analítico.

## Qué relación tiene esto con migraciones y evolución

Muchísima.

Cuando el ownership está claro:

- sabés mejor quién cambia qué
- sabés quién debe coordinar una migración
- el impacto de un cambio es más visible
- la evolución de datos es menos caótica

En cambio, si una tabla o entidad es de todos y de nadie a la vez, cada migración se vuelve mucho más riesgosa.

## Qué no conviene hacer

No conviene:

- asumir que todos pueden escribir todo porque “está en la misma base”
- compartir entidades gigantes como moneda universal
- perder de vista quién es la autoridad real de cada dato
- mezclar lectura cruzada con ownership
- duplicar datos sin definir fuente de verdad
- separar servicios pero dejar una persistencia totalmente caótica por debajo

Ese tipo de decisiones suele minar la arquitectura desde abajo.

## Otro error común

Pensar que el ownership de datos es solo una preocupación de microservicios muy grandes.
No.
También importa muchísimo en monolitos modulares que quieren crecer sin enredarse.

## Otro error común

No distinguir entre:
- usar un dato
- derivar un dato
- escribir un dato
- mandar sobre un dato

Cada una de esas acciones implica un nivel distinto de responsabilidad.

## Otro error común

Reducir toda la discusión a “una base o muchas bases”.
La realidad es más rica.
El punto central no es la cantidad de bases, sino la claridad de ownership y la calidad de los límites.

## Una buena heurística

Podés preguntarte:

- ¿quién es dueño real de este dato?
- ¿quién debería poder cambiar su estructura o semántica?
- ¿este módulo necesita leer, escribir o solo derivar?
- ¿estoy compartiendo una entidad por comodidad y pagando acoplamiento sin verlo?
- ¿esta copia es fuente de verdad o solo proyección?
- ¿qué pasaría si mañana quisiera separar más estos módulos?

Responder eso te ayuda muchísimo a madurar la arquitectura de datos.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque apenas el sistema crece y aparecen varios dominios fuertes, el acoplamiento ya no vive solo en código o contratos HTTP.
Muchas veces vive sobre todo en:

- entidades compartidas
- tablas tocadas por todos
- ownership difuso
- escrituras cruzadas
- dependencias ocultas en la base

Por eso este tema es tan importante.
Te ayuda a ver la arquitectura también desde la persistencia, no solo desde las carpetas o los endpoints.

## Relación con Spring Boot

Spring Boot no impone ownership ni buenos límites de datos.
Podés construir un backend muy claro o muy caótico usando exactamente el mismo stack.

Por eso el valor de este tema está en el criterio:
cómo decidir quién manda sobre qué, cómo se usan datos de otros módulos y cómo evitar que la base de datos se convierta en el lugar donde tu arquitectura se desarma silenciosamente.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando varias partes del sistema ya no viven tan centralizadas, conviene pensar con mucha más claridad quién es dueño de qué datos, distinguiendo fuente de verdad, lecturas cruzadas, proyecciones y escrituras, porque una arquitectura puede parecer modular en el código y seguir totalmente acoplada por debajo si todos comparten y modifican las mismas estructuras sin límites claros.

## Resumen

- El ownership de datos define quién es la autoridad principal sobre cierta información.
- Compartir datos no es lo mismo que compartir responsabilidad sobre esos datos.
- Aun con una sola base, conviene pensar límites sanos entre módulos y evitar escrituras cruzadas innecesarias.
- Entidades gigantes compartidas suelen ser una fuente fuerte de acoplamiento.
- Proyecciones o copias derivadas pueden ser útiles, siempre que la fuente de verdad siga clara.
- Este tema ayuda a mirar la arquitectura también desde la persistencia y no solo desde el código.
- A partir de acá el backend gana una visión mucho más madura sobre cómo crecer sin enredarse por debajo.

## Próximo tema

En el próximo tema vas a ver cómo pensar concurrencia, locking y conflictos cuando varias requests o procesos pueden tocar el mismo estado al mismo tiempo, porque una vez que ya hay varios nodos, eventos o consumidores alrededor de los mismos datos, esa pregunta se vuelve muy real.
