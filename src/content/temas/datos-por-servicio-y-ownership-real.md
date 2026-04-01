---
title: "Datos por servicio y ownership real"
description: "Por qué en una arquitectura distribuida cada servicio debería ser dueño real de sus datos, qué problemas aparecen cuando varios servicios comparten la misma base o escriben donde no deben, y cómo diseñar límites de ownership que permitan evolucionar sin caos." 
order: 165
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

## Introducción

Cuando alguien empieza a pensar en microservicios, suele enfocarse primero en cosas visibles:

- cómo separar repositorios
- cómo exponer APIs
- cómo mandar eventos
- cómo desplegar servicios distintos
- cómo poner un gateway delante

Pero muchas veces el problema más profundo no está ahí.

Está en los datos.

Porque podés tener:

- varios servicios distintos
- distintos procesos corriendo
- distintos pipelines de despliegue
- distintos contenedores

pero si todos leen y escriben el mismo modelo de datos sin límites claros, en el fondo no separaste tanto como parece.

Cambiaste la forma del runtime.
No cambiaste realmente la propiedad del sistema.

Por eso una de las ideas más importantes en arquitectura distribuida es ésta:

**cada servicio debería ser dueño real de su información y de las reglas con las que esa información se modifica.**

A eso apuntan dos conceptos muy ligados:

- **datos por servicio**
- **ownership real**

Esta lección trata de entender por qué eso importa tanto, qué errores aparecen cuando no se respeta, y cómo pensar una separación sana sin caer en dogmas ingenuos.

## Qué significa “datos por servicio”

La idea base es bastante simple:

**cada servicio es responsable de su propio modelo de datos y de su propia persistencia operativa.**

Dicho más concretamente:

- un servicio define qué entidades maneja
- decide cómo se almacenan
- controla sus escrituras
- protege sus invariantes
- expone hacia afuera contratos, no tablas internas

Eso no implica necesariamente que cada servicio tenga que vivir en una tecnología totalmente distinta.

No significa obligatoriamente:

- una base diferente de proveedor distinto por cada servicio
- un cluster separado para todo
- una infraestructura exageradamente fragmentada desde el día uno

Lo que sí significa es algo más importante:

**el límite de propiedad no debería estar dado por “quién puede conectarse”, sino por “quién tiene autoridad para cambiar ese dato y prometer su consistencia”.**

## Qué significa “ownership real”

Ownership real no es ponerle un nombre lindo a un servicio.

Ownership real significa que ese servicio:

- conoce el significado de esos datos
- es la autoridad sobre sus cambios
- decide sus reglas de validación
- protege sus invariantes
- publica la forma correcta de interactuar con ese dominio
- puede evolucionar internamente sin que otros dependan de sus detalles físicos

Por ejemplo, si existe un servicio de `inventory`, ownership real podría significar que:

- solo `inventory` decide cómo se reservan unidades
- solo `inventory` sabe cómo se refleja una reserva, liberación o ajuste
- otros servicios no actualizan tablas de stock directamente
- otros servicios interactúan con `inventory` vía API, comandos o eventos

En otras palabras:

**ownership real no es solo “estos datos viven acá”; es “esta capacidad de negocio se gobierna desde acá”.**

## Por qué este tema importa tanto en microservicios

Porque cuando separás un sistema en servicios, el riesgo grande es crear una ilusión de independencia.

Desde afuera parece que hay varios servicios.
Pero por adentro puede pasar esto:

- todos comparten la misma base
- todos hacen joins sobre tablas ajenas
- varios servicios actualizan la misma entidad
- cada uno interpreta el dominio a su manera
- una migración rompe cosas en lugares inesperados
- nadie sabe realmente quién manda sobre cada dato

Eso produce un resultado bastante feo:

**complejidad distribuida sin autonomía real.**

Es decir:

- sufrís latencia de red
- sufrís coordinación entre servicios
- sufrís despliegues separados
- sufrís observabilidad más difícil

pero no obtenés el beneficio de poder evolucionar límites con claridad.

Te quedás con lo peor de ambos mundos.

## El antipatrón clásico: base compartida con acceso cruzado

Uno de los errores más comunes al empezar una descomposición es éste:

- servicio A tiene su código
- servicio B tiene su código
- servicio C tiene su código
- todos apuntan al mismo esquema o a la misma base
- cada uno lee y escribe donde le conviene

A veces eso se defiende diciendo:

- “es más práctico”
- “así evitamos llamadas remotas”
- “para qué hacer una API si puedo hacer un query”
- “total está todo dentro de la misma empresa”

El problema es que eso destruye rápidamente el ownership.

Porque entonces:

- varios servicios pueden mutar el mismo dato
- los invariantes dejan de tener un único guardián
- un cambio de esquema se vuelve riesgoso para todos
- aparecen dependencias ocultas que nadie declaró
- el servicio dueño deja de poder refactorizar internamente

En ese escenario, la base de datos se convierte en el verdadero punto de integración.
Y eso suele ser más peligroso que una API mal diseñada.

## Compartir lectura no es lo mismo que compartir autoridad

Acá conviene hacer una distinción fina.

No todo acceso indirecto a información ajena implica automáticamente un pecado arquitectónico mortal.

El problema serio aparece cuando se comparte **autoridad** sobre el dato.

Porque leer algo puede resolverse con varias estrategias:

- API síncrona
- eventos y proyecciones locales
- caché de lectura
- vistas derivadas
- read models

Pero escribir sobre el dato de otro servicio es otra historia.

Si varios servicios pueden modificar directamente la misma información de negocio, entonces:

- nadie es dueño real
- los invariantes se rompen fácil
- las migraciones se vuelven delicadas
- el debugging se vuelve confuso

Por eso una regla bastante sana suele ser:

**la lectura puede tener distintos patrones; la escritura debería respetar claramente el ownership.**

## Ejemplo concreto: órdenes, inventario y pagos

Imaginemos un e-commerce distribuido.

Tenemos:

- `orders`
- `inventory`
- `payments`

### Diseño sano

- `orders` es dueño del ciclo de vida de la orden
- `inventory` es dueño del stock y de las reservas
- `payments` es dueño de cobros, autorizaciones y conciliación

Entonces:

- `orders` no descuenta stock directo en tablas de `inventory`
- `inventory` no marca pagos como cobrados en tablas de `payments`
- `payments` no cambia estado de órdenes escribiendo directo en `orders`

Cada servicio expone contratos y publica eventos relevantes.

### Diseño enfermo

- `orders` crea la orden y además actualiza `inventory.stock_available`
- `payments` escribe `orders.status = PAID`
- `inventory` cancela una orden tocando una tabla de `orders`

A corto plazo parece rápido.
A mediano plazo ya nadie entiende:

- dónde se decide cada regla
- qué servicio debería validar qué cosa
- quién rompió una invariante
- por qué un deploy cambió comportamientos colaterales

## Ownership de datos y ownership de comportamiento van juntos

Otro error habitual es pensar ownership solo como almacenamiento.

Pero en realidad el ownership importante es doble:

- ownership del dato
- ownership del comportamiento que lo gobierna

Por ejemplo, tener una tabla `subscriptions` no alcanza para decir que existe un servicio de suscripciones con ownership real.

Hay ownership real recién cuando ese servicio concentra cosas como:

- reglas de alta
- upgrades y downgrades
- estados válidos
- renovaciones
- suspensiones
- vencimientos
- políticas de negocio asociadas

Si otro servicio puede cambiar libremente esos estados porque “solo hace un update”, entonces el ownership es decorativo.

## Qué problemas aparecen cuando el ownership no está claro

## 1. Invariantes repartidos por todos lados

Una regla de negocio importante termina partida entre:

- validaciones en un controlador
- una query suelta en otro servicio
- un job que corrige estados
- una constraint parcial en base
- un consumidor de eventos que parchea cosas después

Eso vuelve casi imposible responder algo tan básico como:

**¿dónde vive realmente la regla que protege este concepto?**

## 2. Cambios de esquema muy riesgosos

Si muchos servicios dependen físicamente de tablas ajenas, cualquier cambio interno:

- renombrar una columna
- partir una tabla
- normalizar un campo
- cambiar un índice
- separar estados

puede romper consumidores invisibles.

Entonces el servicio supuestamente dueño ya no puede evolucionar su modelo con libertad razonable.

## 3. Duplicación de lógica de dominio

Cuando varios servicios leen estructuras internas ajenas, muchas veces terminan reimplementando significados.

Por ejemplo:

- uno interpreta que `PENDING` incluye cierto caso
- otro interpreta que no
- uno considera reservada una unidad cuando existe cierto registro
- otro la considera reservada cuando ve otro flag

El resultado es inconsistencia semántica.

No solo inconsistencia técnica.

## 4. Debugging cada vez más difícil

Cuando un dato puede ser modificado por varios servicios, depurar deja de ser lineal.

La pregunta:

- “¿quién cambió esto?”

se vuelve mucho más difícil de responder.

Y en producción eso importa muchísimo.

## 5. Equipos bloqueándose entre sí

Si varios equipos dependen de la estructura interna de la misma base o del mismo modelo, empiezan a aparecer cuellos organizacionales:

- miedo a tocar tablas compartidas
- cambios que requieren coordinación excesiva
- releases atados entre equipos
- ownership difuso también a nivel humano

La arquitectura termina reflejando una organización trabada.

## Un principio muy útil: API over database

Una formulación muy usada para expresar este problema es:

**integrarse con un servicio por contrato es más sano que integrarse con sus tablas internas.**

Eso no quiere decir que toda interacción tenga que ser necesariamente una llamada HTTP síncrona.

“API” acá hay que leerlo en sentido amplio:

- endpoint
- comando
- evento publicado
- interfaz explícita de integración
- contrato versionado

La idea central es:

**otros consumidores deberían depender de lo que el servicio promete, no de cómo acomoda internamente sus registros.**

## Pero entonces, ¿nunca se comparte una base?

Acá hay que evitar el fanatismo.

En sistemas reales pueden existir transiciones.
Puede haber momentos donde todavía se comparte infraestructura física.
Puede haber una misma instancia de motor para varios esquemas.
Puede haber restricciones operativas o de costo.

Lo importante no es fetichizar la topología física.

Lo importante es proteger estas ideas:

- límites de escritura
- contratos explícitos
- minimización de dependencias físicas cruzadas
- autonomía para evolucionar internamente

Es decir:

**a veces puede compartirse la infraestructura, pero no debería compartirse libremente la autoridad semántica sobre el dato.**

## Base por servicio no es solo una decisión técnica

También es una forma de hacer visible el límite del dominio.

Cuando un servicio tiene su propio modelo de persistencia y nadie más lo toca directamente, queda mucho más claro:

- qué le pertenece
- qué no le pertenece
- qué cambios puede hacer solo
- qué datos expone como producto hacia otros

Eso ayuda tanto a la arquitectura como a la conversación entre equipos.

## Qué pasa con los joins entre dominios

Acá aparece uno de los dolores más típicos.

En un monolito es muy fácil hacer:

- un gran join
- un reporte cruzado
- una consulta que mezcla todo

En microservicios eso cambia.

Porque si los datos viven en límites distintos, ya no deberías depender de joins directos entre tablas de distintos dominios operativos.

Entonces aparecen otras estrategias:

- composición en tiempo de lectura
- materialización de vistas derivadas
- eventos para construir read models
- pipelines analíticos separados
- cachés o índices de búsqueda

Esto es importante entenderlo bien:

**si querés autonomía por servicio, muchas comodidades de lectura global inmediata dejan de ser gratis.**

Y ése es un trade-off real.

## Ownership real exige aceptar cierta redundancia controlada

Mucha gente se incomoda cuando descubre que, para evitar joins operativos entre dominios, a veces conviene duplicar algunos datos de referencia.

Por ejemplo:

- guardar en `orders` una copia del email del cliente al momento de compra
- mantener en un read model el nombre visible del producto
- materializar en búsqueda algunos atributos replicados

Eso puede sonar “menos puro” desde la normalización clásica.

Pero en sistemas distribuidos esa duplicación controlada puede ser más sana que depender todo el tiempo de lecturas acopladas sobre el dueño original.

La clave está en distinguir:

- duplicación deliberada, acotada y entendida
- duplicación caótica, opaca y contradictoria

No son lo mismo.

## El concepto de fuente de verdad

Acá aparece otra noción muy útil.

Puede haber copias, proyecciones, cachés o read models.
Pero aun así debería estar claro:

**¿cuál es la fuente de verdad operativa para cada dato?**

Por ejemplo:

- `inventory` es la fuente de verdad del stock disponible y reservado
- `payments` es la fuente de verdad del estado del cobro y su conciliación
- `orders` es la fuente de verdad del estado de la orden

Otros servicios pueden tener representaciones derivadas.
Pero no deberían competir por el significado canónico.

## Un error frecuente: confundir referencia con ownership

Que un servicio guarde el `userId` de un usuario no significa que sea dueño del usuario.

Que una orden guarde `productId` no significa que `orders` sea dueño del catálogo.

Muchos vínculos entre dominios se expresan por referencias.
Eso está bien.

Lo importante es no confundir:

- **referir a una entidad de otro dominio**

con:

- **ser dueño de la información y reglas de esa entidad**

Esta distinción evita errores muy comunes al modelar límites.

## Cómo interactuar con datos de otro servicio sin romper ownership

Hay varias estrategias razonables.

## 1. Consulta síncrona al servicio dueño

Útil cuando necesitás información fresca y el costo de acoplamiento temporal es aceptable.

Ejemplo:

- `orders` consulta a `pricing` el precio vigente antes de confirmar una operación

Ventajas:

- dato actualizado
- ownership claro

Desventajas:

- dependencia en tiempo real
- más latencia
- posibilidad de cascadas o fallos por dependencia

## 2. Eventos para construir proyecciones locales

Un servicio publica cambios relevantes y otros construyen una vista local de lectura.

Ejemplo:

- `catalog` publica cambios de nombre o atributos de producto
- `search` arma su propio índice de búsqueda

Ventajas:

- menor acoplamiento temporal
- consultas rápidas locales

Desventajas:

- consistencia eventual
- necesidad de procesar eventos bien
- operación más compleja

## 3. Cachés o snapshots controlados

En algunos casos se copia cierta información puntual para usarla dentro de un flujo.

Ejemplo:

- capturar la dirección de envío usada en una orden
- persistir el precio aplicado al momento del checkout

Esto no rompe ownership si está claro que se trata de un snapshot necesario del contexto de negocio, no de una apropiación del dominio ajeno.

## Ownership real también implica responsabilidad operativa

No alcanza con decir “este servicio es dueño” si después no asume la carga operativa correspondiente.

Ser dueño también implica:

- monitorear salud de ese dominio
- auditar cambios sensibles
- definir migraciones seguras
- versionar contratos
- explicar estados de negocio
- responder incidentes ligados a ese dato

Si un servicio reclama ownership pero en la práctica otros tienen que arreglarle los problemas o corregirle estados por afuera, el ownership está incompleto.

## Cómo se ve un límite sano

Un límite sano entre servicios suele mostrar varias señales.

## 1. Está claro quién puede escribir qué

No hay ambigüedad sobre qué servicio tiene autoridad de modificación.

## 2. Los contratos de integración son explícitos

Otros servicios saben cómo pedir algo o reaccionar a algo sin meterse en la persistencia interna.

## 3. Las reglas importantes están cerca del dueño

Las invariantes principales no están desperdigadas.

## 4. El servicio puede evolucionar internamente con cierto margen

Puede refactorizar su modelo físico sin romper medio sistema.

## 5. El modelo organizacional acompaña el ownership técnico

Hay equipo o responsables claros para ese dominio.

## Cómo detectar que el ownership es falso o débil

Hay señales bastante claras.

## 1. Varios servicios escriben la misma tabla

Ésta suele ser de las más evidentes.

## 2. Muchos consumidores dependen de columnas internas específicas

Cada refactor de esquema genera miedo generalizado.

## 3. Nadie sabe quién valida realmente una regla

La respuesta a “dónde vive esta invariante” cambia según a quién le preguntes.

## 4. Se corrigen datos con jobs compensatorios constantemente

Eso muchas veces indica que el límite de autoridad está roto.

## 5. Los incidentes terminan con frases como:

- “pensé que lo actualizaba el otro servicio”
- “yo no sabía que esto también lo tocaban desde allá”
- “ese campo lo usamos todos, así que nadie quiso cambiarlo”

Eso no es solo desorden técnico.
Es ownership débil.

## Separar por servicio no significa duplicar todo caprichosamente

Tampoco se trata de partir el sistema en mil fragmentos artificiales.

El criterio no debería ser:

- “una entidad, un servicio”

ni tampoco:

- “una tabla, un microservicio”

La separación sana suele nacer de:

- capacidades de negocio
- límites de contexto
- reglas que cambian juntas
- equipos responsables
- necesidad real de autonomía

Por eso “datos por servicio” tiene sentido cuando se apoya en bounded contexts razonables, no cuando se usa como receta mecánica.

## Migrar hacia ownership real suele ser gradual

En sistemas vivos muchas veces no podés pasar de golpe de:

- base compartida caótica

a:

- ownership limpio perfecto

Entonces el camino suele ser incremental.

Por ejemplo:

1. identificar el servicio que realmente debería ser dueño
2. prohibir nuevas escrituras cruzadas
3. crear contratos explícitos para interacción
4. mover lógica de negocio al dueño correcto
5. introducir eventos o APIs para reemplazar accesos directos
6. retirar dependencias físicas viejas
7. separar almacenamiento cuando tenga sentido operativo

Este punto es importante:

**muchas veces primero se separa el ownership lógico, y recién después se termina de separar por completo la infraestructura física.**

## Qué preguntas conviene hacerse

## 1. ¿Quién es la fuente de verdad de este dato?

Si la respuesta es difusa, el ownership probablemente también lo sea.

## 2. ¿Quién puede modificarlo y bajo qué reglas?

No solo quién tiene acceso técnico.
Quién tiene autoridad de negocio.

## 3. ¿Qué rompe si el servicio dueño cambia su esquema interno?

Si la respuesta es “media plataforma”, hay demasiado acoplamiento físico.

## 4. ¿Los demás servicios dependen del contrato o de la implementación interna?

Esa diferencia define mucho de la salud del sistema.

## 5. ¿Qué parte de la información necesito realmente local y cuál puedo consultar o proyectar?

Esto ayuda a decidir entre sync calls, eventos o snapshots.

## Un criterio maduro

En microservicios, la verdadera separación no ocurre cuando tenés varios deployments.

La verdadera separación empieza cuando cada servicio puede decir con claridad:

- qué capacidad de negocio gobierna
- qué datos le pertenecen
- qué reglas protege
- cómo otros deben interactuar con ese dominio

Si eso no está claro, probablemente todavía no tengas microservicios con ownership real.
Tal vez solo tengas un sistema repartido en varias piezas.

Y eso no es lo mismo.

## Cierre

La idea de **datos por servicio y ownership real** existe para proteger algo mucho más profundo que una preferencia de infraestructura.

Protege:

- la claridad del dominio
- la consistencia de las reglas
- la autonomía de evolución
- la capacidad de operar sin caos
- la posibilidad de escalar equipos sin pisarse

Cuando el ownership está bien definido:

- cada servicio sabe qué le toca
- los contratos son más claros
- los cambios internos son menos peligrosos
- las invariantes tienen guardianes reales
- la arquitectura se vuelve más entendible

Cuando el ownership está roto:

- los límites son decorativos
- la base se vuelve campo de batalla compartido
- la evolución se vuelve cara
- los incidentes se vuelven confusos
- nadie sabe del todo quién manda

En sistemas distribuidos, separar servicios sin separar bien la propiedad del dato suele ser una victoria aparente.

La descomposición madura no consiste solo en repartir procesos.
Consiste en repartir responsabilidades reales.

Y en esa repartición, **ser dueño del dato y del comportamiento que lo gobierna** es una de las piezas más importantes de todas.
