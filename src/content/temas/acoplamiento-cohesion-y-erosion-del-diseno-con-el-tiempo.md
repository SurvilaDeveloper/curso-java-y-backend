---
title: "Acoplamiento, cohesión y erosión del diseño con el tiempo"
description: "Qué significan realmente acoplamiento y cohesión en backend, por qué no conviene analizarlos de forma aislada, cómo el diseño se erosiona gradualmente en sistemas vivos y qué señales muestran que los módulos dejaron de evolucionar de manera sana."
order: 117
module: "Calidad, evolución y mantenibilidad a largo plazo"
level: "intermedio"
draft: false
---

## Introducción

Un backend no se vuelve difícil de mantener de un día para el otro.

Casi nunca pasa eso.

Lo más habitual es algo mucho más silencioso.

El sistema empieza razonablemente ordenado.
Los módulos parecen tener una intención clara.
Las responsabilidades más o menos están separadas.
Agregar funcionalidades todavía se siente manejable.

Pero con el tiempo empiezan a aparecer cambios apurados.
Excepciones de negocio.
Integraciones nuevas.
Parche sobre parche.
Duplicaciones pequeñas.
Dependencias que entran “solo por esta vez”.
Reglas que migran de lugar porque había que resolver algo rápido.

Y entonces empieza la erosión.

No necesariamente se rompe todo.
No siempre hay bugs evidentes.
No siempre el código se ve desastroso a primera vista.

Pero cada vez cuesta más entender qué depende de qué.
Cada vez es más difícil tocar una parte sin afectar otras.
Cada vez los módulos se parecen menos a conceptos claros y más a acumulaciones históricas.

Ahí aparecen dos ideas fundamentales para razonar sobre la salud del diseño:

- **acoplamiento**
- **cohesión**

Y junto con ellas, una tercera que en sistemas reales es decisiva:

- **erosión del diseño con el tiempo**

Esta lección trata justamente de eso.

No desde una definición académica vacía.
Sino desde la mirada que necesitás para leer un backend vivo y entender si su estructura está acompañando el crecimiento del producto o si se está degradando lentamente.

## Qué es el acoplamiento

El acoplamiento describe cuánto dependen unas partes del sistema de otras.

Dicho simple:

**cuanto más necesita una pieza conocer detalles internos de otra para funcionar, más acopladas están.**

El acoplamiento no es malo por existir.

Un sistema real siempre tiene dependencias.
Los módulos no viven aislados en el vacío.
Los casos de uso necesitan colaborar.
Las capas se hablan.
Las integraciones existen.

El problema aparece cuando esa dependencia se vuelve demasiado fuerte, demasiado detallada o demasiado extendida.

Por ejemplo, hay más acoplamiento del deseable cuando:

- un módulo necesita saber demasiadas cosas sobre otro
- una regla de negocio depende del formato interno de una integración externa
- un cambio pequeño en una clase obliga a tocar varias más
- una capa conoce detalles que no debería conocer
- muchas piezas dependen de una clase central que concentra demasiado

En esos casos, el costo de cambio empieza a subir.

## Qué es la cohesión

La cohesión habla de qué tan bien agrupadas están las responsabilidades dentro de una pieza.

Dicho de forma muy práctica:

**una pieza con buena cohesión reúne cosas que realmente pertenecen juntas.**

En cambio, una pieza con baja cohesión mezcla responsabilidades que no deberían convivir.

Por ejemplo, hay baja cohesión cuando una misma clase:

- valida entrada HTTP
- resuelve permisos
- aplica reglas de negocio
- persiste datos
- llama servicios externos
- manda notificaciones
- arma respuestas para la API

Todo eso junto puede funcionar.

Pero no forma una unidad conceptual clara.

La cohesión no trata de que cada archivo tenga pocas líneas.
Trata de que cada módulo, clase o componente tenga una razón de ser entendible.

## La relación entre acoplamiento y cohesión

Estas dos ideas suelen ir juntas.

Una pieza con baja cohesión muchas veces termina generando más acoplamiento.
Y un sistema con mucho acoplamiento suele degradar también la cohesión de sus módulos.

¿Por qué?

Porque cuando las responsabilidades están mal agrupadas:

- cuesta poner límites claros
- las dependencias se desparraman
- se duplican decisiones
- aparecen más puntos de coordinación accidental

Y cuando las dependencias entre piezas son excesivas:

- los módulos empiezan a invadirse
- las reglas quedan repartidas
- la intención de cada pieza se vuelve borrosa
- el sistema pierde bordes claros

Por eso conviene pensar así:

- **cohesión** mira hacia adentro de una pieza
- **acoplamiento** mira la relación de esa pieza con otras

Ambas cosas juntas te ayudan a juzgar si el diseño está sano o si se está erosionando.

## Qué significa que el diseño se erosiona

La erosión del diseño es el deterioro gradual de la estructura del sistema a medida que evoluciona.

No es un evento puntual.
No es una migración concreta.
No es “el día en que la arquitectura dejó de servir”.

Es un proceso acumulativo.

Pasa cuando el backend empieza a desviarse de los límites e intenciones que originalmente tenía.

Por ejemplo:

- módulos que antes eran claros ahora hacen varias cosas mezcladas
- capas que antes estaban separadas ahora se filtran entre sí
- reglas que tenían un dueño claro ahora aparecen repetidas o dispersas
- dependencias que antes eran acotadas ahora se multiplican
- cambios que antes eran locales ahora impactan transversalmente

La erosión suele ser peligrosa porque es gradual.

Como no explota de golpe, el equipo puede acostumbrarse.
Empieza a parecer normal que ciertas partes cuesten.
Empieza a parecer inevitable que tocar un flujo implique miedo.
Empieza a verse como parte del trabajo que haya zonas que nadie entiende del todo.

Y sin embargo, muchas veces lo que está pasando es que el diseño se viene degradando hace meses.

## Por qué este tema importa tanto en backend

En backend, el daño de un mal diseño suele amplificarse.

Porque no solo afecta claridad de código.
También afecta:

- consistencia de datos
- seguridad
- operación
- side effects
- integraciones externas
- observabilidad
- testabilidad
- confiabilidad del negocio

Un frontend puede quedar incómodo.
Un backend además puede volverse riesgoso.

Si el sistema está muy acoplado o tiene muy poca cohesión, suele pasar que:

- una regla nueva tarda demasiado en implementarse
- una corrección aparentemente simple arrastra muchas piezas
- un cambio local genera regresiones lejanas
- las integraciones contaminan el dominio
- los tests se vuelven costosos o frágiles
- el equipo pierde velocidad y confianza

## Acoplamiento sano vs acoplamiento dañino

No todo acoplamiento es un problema.

Hay acoplamientos normales y razonables.

Por ejemplo:

- un caso de uso depende de una abstracción para persistir
- un módulo de checkout depende de uno de pricing
- una capa de aplicación coordina una política de autorización y una operación de dominio

Eso es normal.

El problema aparece cuando la dependencia es demasiado íntima o demasiado extendida.

### Señales de acoplamiento dañino

- una pieza conoce detalles internos de demasiadas otras
- los contratos son inestables y se rompen seguido
- cambiar una estructura obliga a propagar cambios por varias capas
- muchas piezas dependen del mismo módulo “central”
- la lógica del negocio depende del shape exacto de un proveedor externo
- una capa accede a información que debería estar encapsulada en otra

En el fondo, el problema es este:

**el sistema deja de poder cambiar por partes.**

## Cohesión sana vs cohesión débil

Una pieza cohesionada no necesariamente es pequeña.

Puede ser grande.
Puede contener lógica compleja.
Puede coordinar bastante trabajo.

Lo importante es que haya una idea clara que mantenga unidas sus responsabilidades.

Por ejemplo, una pieza puede tener buena cohesión si concentra:

- la política de cálculo de descuentos
- las reglas válidas de transición de estado de una orden
- la coordinación de un caso de uso específico

En cambio, la cohesión es débil cuando la misma pieza parece una mezcla accidental.

### Señales de cohesión débil

- una clase hace cosas de varias capas a la vez
- un módulo contiene lógica de negocio, detalle técnico y armado de respuesta HTTP todo junto
- el nombre de la pieza no representa bien lo que hace
- agregar una nueva funcionalidad “parecida” igual se siente forzado
- el archivo acumula funciones que solo comparten contexto histórico, no intención real

Cuando la cohesión es baja, el diseño empieza a hacerse difícil de explicar.

Y cuando un diseño cuesta explicarse, muchas veces también cuesta evolucionarlo.

## Cómo empieza la erosión del diseño

La erosión rara vez nace de una sola mala decisión gigante.

Suele aparecer por acumulación de pequeñas decisiones razonables en su contexto.

Por ejemplo:

- “metamos esta validación acá por ahora”
- “llamemos directo al proveedor desde este service porque hay apuro”
- “copiemos esta lógica y después la unificamos”
- “agreguemos una excepción por cliente”
- “usemos este DTO también internamente para no duplicar”
- “dejemos esta transición en el controller y luego la bajamos”

Cada decisión aislada puede parecer defendible.

El problema es la suma.

Después de meses de cambios así, el backend ya no refleja un diseño intencional.
Refleja una secuencia histórica de urgencias.

## Formas comunes de erosión

## 1. Fuga entre capas

Una de las más comunes.

Pasa cuando las capas empiezan a conocer demasiado de otras.

Por ejemplo:

- controllers con reglas de dominio
- servicios de dominio que conocen detalles HTTP
- repositorios que deciden reglas de negocio
- lógica de aplicación acoplada al formato exacto de la base o del proveedor

Al principio parece práctico.
Después los límites se borran.

## 2. Módulos que se expanden sin criterio

Otro patrón clásico.

Se crea una pieza con una intención concreta.
Después empiezan a agregarle cosas relacionadas “más o menos”.
Y finalmente se vuelve una bolsa enorme.

Ejemplos típicos:

- `OrderService`
- `UserManager`
- `PaymentHelper`
- `SystemUtils`

Esas piezas suelen crecer porque se vuelven el lugar fácil para meter cualquier cosa parecida.

## 3. Reglas importantes repartidas

Una regla de negocio empieza teniendo un punto claro.

Con el tiempo:

- una parte queda en validación de entrada
- otra en el caso de uso
- otra en la query
- otra en un listener
- otra en una integración

Cuando eso pasa, el sistema pierde dueños claros de comportamiento.

## 4. Integraciones externas que contaminan el interior

Muy común en backend real.

Pasa cuando tipos, estados o contratos del proveedor se filtran demasiado hacia adentro.

Entonces:

- el dominio empieza a hablar como el proveedor
- el negocio depende de nombres externos
- el cambio de integración se vuelve carísimo

En vez de proteger al sistema del exterior, lo deja expuesto.

## 5. Excepciones especiales acumuladas

Otra fuente enorme de erosión.

Por ejemplo:

- lógica especial por tenant
- reglas distintas por país
- caminos alternativos por cliente legacy
- feature flags metidos sin modelo claro
- bypasses manuales acumulados

Cada excepción puede ser legítima.
Pero si no se encapsulan bien, destruyen la claridad del diseño.

## Cómo se ve la erosión en el trabajo cotidiano

Muchas veces no la detectás mirando un diagrama.
La detectás sintiendo el sistema.

Se nota cuando:

- hay miedo de tocar ciertas zonas
- cada cambio chico abre demasiados frentes
- nadie sabe bien dónde vive una regla
- revisar un PR requiere reconstruir demasiadas dependencias ocultas
- los bugs aparecen en lugares alejados del cambio original
- escribir tests se siente artificialmente difícil
- onboarding lleva demasiado porque el diseño no guía

Éstas no son solo molestias.
Suelen ser síntomas de acoplamiento alto y cohesión baja.

## Ejemplo simple de acoplamiento excesivo

Imaginá un backend de e-commerce donde el cálculo final de una orden depende directamente de:

- el DTO HTTP del request
- una entidad de base de datos
- el contrato textual del gateway de pagos
- un enum de shipping del carrier externo
- una config por tenant leída inline

Si la lógica principal de negocio necesita conocer todo eso junto, el acoplamiento ya es muy alto.

¿Por qué?

Porque demasiadas decisiones del sistema quedaron pegadas a detalles que deberían estar encapsulados.

Si cambia el proveedor de pagos, el contrato del request o la forma de persistir, se empieza a mover una zona que en teoría debería estar más protegida.

## Ejemplo simple de cohesión débil

Imaginá una clase `CheckoutService` que hace todo esto:

- valida parámetros del request
- resuelve permisos del usuario
- calcula promociones
- reserva stock
- invoca pago
- persiste orden
- manda email
- registra auditoría
- arma el response de la API

Puede funcionar.

Pero tiene baja cohesión.

No porque haga “muchas líneas”, sino porque mezcla demasiadas responsabilidades distintas.

Después cualquier cambio en cualquiera de esos aspectos cae sobre la misma pieza.
Y esa clase se vuelve un cuello de entendimiento y evolución.

## Acoplamiento temporal

No todo acoplamiento es estructural entre módulos.

También existe el acoplamiento temporal.

Aparece cuando una operación depende demasiado de que varias cosas ocurran en cierto orden implícito.

Por ejemplo:

- primero hay que llamar una función que prepara estado interno
- después otra que valida
- después otra que persiste
- después otra que limpia cache

Si ese orden no está claro o no está protegido por una coordinación explícita, el sistema se vuelve frágil.

Un cambio pequeño puede romper una secuencia que estaba sostenida por convención informal.

## Acoplamiento a detalles y no a capacidades

Ésta es una idea muy útil.

Un backend sano intenta depender más de capacidades que de detalles.

Por ejemplo, en vez de depender de:

- “el cliente HTTP X con este formato de respuesta exacto”

conviene depender de algo más cercano a:

- “una capacidad para consultar disponibilidad de envío”

En vez de que el dominio dependa del proveedor, depende de una intención del negocio.

Eso no elimina la implementación concreta.
Solo la encapsula mejor.

## Cohesión y lenguaje del dominio

La cohesión mejora mucho cuando las piezas reflejan conceptos reales del negocio.

Cuando un módulo representa una idea entendible, suele ser más fácil agrupar bien responsabilidades.

Por ejemplo:

- política de pricing
- transición de estado de orden
- cálculo de elegibilidad para descuento
- conciliación de pago
- coordinación de despacho

En cambio, cuando las piezas se nombran desde lo genérico o lo histórico:

- helper
- manager
- common
- processData
- utils

la cohesión suele empeorar, porque el diseño no está expresando bien sus conceptos.

## El costo real del acoplamiento alto

A veces se habla del acoplamiento como si fuera un problema “académico”.

No lo es.

En sistemas vivos, el costo es muy concreto.

### 1. Cambios más caros

Una modificación simple arrastra demasiadas piezas.

### 2. Más riesgo de regresión

Porque al tocar una zona se mueven muchas dependencias implícitas.

### 3. Menor capacidad de reemplazo

Cambiar una integración, una estrategia o una implementación se vuelve difícil.

### 4. Menor claridad de ownership

No está claro quién es dueño de qué regla o de qué comportamiento.

### 5. Tests más difíciles

Porque aislar una pieza requiere mockear demasiadas cosas o recrear demasiado contexto.

## El costo real de la baja cohesión

También es muy concreto.

### 1. Piezas difíciles de entender

No queda clara su intención.

### 2. Piezas difíciles de modificar

Porque cambios de distinta naturaleza caen sobre el mismo lugar.

### 3. Piezas que crecen sin límite

Ya que se convierten en el receptor natural de cualquier cosa “relacionada”.

### 4. Piezas difíciles de probar

Porque hacen demasiado y requieren demasiado contexto.

### 5. Pérdida de diseño comunicativo

El sistema deja de explicarse por su estructura.

## Cómo detectar erosión temprano

No hace falta esperar al colapso.

Hay señales bastante claras.

## 1. Cambios locales que ya no son locales

Una de las mejores señales.

Si una regla pequeña exige tocar demasiadas capas o demasiados módulos, algo se está acoplando de más.

## 2. Responsabilidades que migran sin intención

Cuando una lógica empieza en un lugar y termina repartida en tres más, suele haber erosión.

## 3. Dependencias nuevas que entran “por conveniencia”

Cada dependencia agregada debería tener una razón entendible.
Si solo se suma porque “era rápido”, conviene prestar atención.

## 4. Nombres cada vez más genéricos

Cuando el diseño pierde claridad, suelen aparecer nombres borrosos.
Eso también es una señal.

## 5. Miedo operativo a tocar ciertas partes

Si una zona se vuelve tabú, rara vez es solo por casualidad.

## 6. PRs difíciles de revisar por dependencias ocultas

Cuando entender un cambio exige reconstruir demasiadas relaciones implícitas, el diseño probablemente está erosionado.

## 7. Tests que piden demasiada preparación

A veces el test te muestra antes que nadie dónde se rompió la modularidad.

## Qué NO significa mejorar acoplamiento y cohesión

No significa perseguir una pureza artificial.

No se trata de:

- crear capas vacías solo por formalismo
- partir todo en clases mínimas sin necesidad
- abstraer cada dependencia antes de tiempo
- obsesionarse con patrones por encima del problema real

A veces intentar “mejorar el diseño” de forma rígida genera más complejidad que la que resuelve.

La pregunta útil no es:

**¿esto cumple una forma teórica perfecta?**

La pregunta útil es:

**¿esta estructura ayuda a cambiar el sistema con claridad, seguridad y costo razonable?**

## Mejorar diseño no es desacoplar todo al máximo

Éste es otro error común.

Un sistema totalmente desacoplado en sentido ingenuo no existe.
Y forzar desacoplamiento extremo puede destruir legibilidad.

A veces dos piezas deben conocerse.
A veces una coordinación central tiene sentido.
A veces una regla necesita estar cerca de otra.

La clave no es eliminar dependencias.
La clave es que las dependencias sean:

- claras
- proporcionales
- estables
- razonables para el dominio

## Estrategias sanas para evitar erosión

## 1. Cuidar los límites cuando agregás comportamiento nuevo

Cada funcionalidad nueva debería reforzar o, al menos, no destruir la estructura existente.

Antes de meter una regla en cualquier lado, conviene preguntarse:

- ¿quién debería ser dueño de esto?
- ¿qué módulo expresa mejor esta responsabilidad?
- ¿qué dependencia nueva estoy introduciendo?

## 2. Encapsular detalles externos

Base de datos, providers, formatos de terceros y decisiones de infraestructura deberían contaminar lo menos posible el interior del sistema.

## 3. Reunir juntas las reglas que realmente pertenecen juntas

Eso mejora cohesión y baja dispersión de conocimiento.

## 4. Aprovechar cambios reales para reordenar un poco

No hace falta esperar un gran refactor.
Muchas veces una mejora pequeña y oportuna evita erosión futura.

## 5. Vigilar módulos que crecen demasiado en centralidad

Cuando todo empieza a depender de una misma pieza, conviene mirar con atención.

## 6. Hacer visibles las excepciones especiales

Si hay lógica por tenant, país o cliente, no conviene dejarla dispersa y silenciosa.
Mejor modelarla de forma explícita.

## 7. Usar tests como detector de modularidad rota

Si un test es artificialmente costoso, quizás está revelando un límite mal resuelto.

## Ejemplo intuitivo de erosión progresiva

Imaginá un sistema de órdenes.

Versión inicial:

- `OrderController` recibe request
- `PlaceOrderUseCase` coordina
- `PricingPolicy` calcula totales
- `StockService` reserva stock
- `PaymentPort` procesa pago
- `OrderRepository` persiste

Hasta ahí, bastante claro.

Meses después:

- el controller agrega validaciones especiales
- el caso de uso empieza a consultar configs por tenant inline
- pricing usa directamente respuestas del gateway promocional externo
- stock agrega una excepción por canal dentro del repositorio
- pago devuelve estados textuales que se propagan hacia todo el sistema
- auditoría y email se meten directo en el mismo flujo principal

Nada de eso necesariamente rompe el sistema hoy.

Pero la estructura ya empezó a erosionarse.

Ahora hay:

- más acoplamiento a detalles externos
- menos cohesión en los módulos centrales
- más reglas dispersas
- más dificultad para evolucionar cada parte por separado

## Relación con code smells

La lección anterior hablaba de code smells.

Este tema va más abajo.

Muchos smells son la manifestación visible de un problema más profundo de acoplamiento, cohesión y erosión.

Por ejemplo:

- una clase gigante muchas veces indica baja cohesión
- muchos cambios transversales suelen indicar acoplamiento alto
- side effects escondidos suelen reflejar límites débiles entre módulos
- duplicación de reglas importantes muchas veces muestra falta de ownership claro

O sea:

- el smell es la señal visible
- el problema de diseño suele estar más abajo

## Relación con mantenibilidad a largo plazo

Mantener un backend vivo no depende solo de escribir código que funcione hoy.

Depende de que el diseño siga sirviendo mañana.

Un sistema mantenible suele permitir:

- entender dónde vive cada responsabilidad
- cambiar reglas frecuentes sin tocar medio backend
- reemplazar detalles técnicos sin contaminar el dominio
- probar piezas importantes sin montar el mundo entero
- incorporar gente nueva sin arqueología excesiva

Todo eso depende mucho de acoplamiento y cohesión.

## Buenas prácticas iniciales

## 1. Mirar el costo de cambio, no solo la forma del código

El mejor detector de diseño erosionado suele ser cuánto duele cambiar algo.

## 2. Distinguir dependencias necesarias de dependencias innecesarias

No todo acoplamiento es malo, pero sí conviene vigilar el que expone demasiados detalles.

## 3. Favorecer módulos con intención clara

Cuando una pieza representa una idea concreta del negocio o del sistema, la cohesión mejora.

## 4. Evitar que detalles externos se filtren demasiado hacia adentro

Eso protege la evolución futura.

## 5. Prestar atención a las excepciones acumuladas

Muchas erosiones serias empiezan por casos especiales mal encapsulados.

## 6. Usar la dificultad de testing y revisión como señal estructural

A veces ahí se ve antes que en el código quieto.

## 7. Mejorar de forma incremental

No hace falta rediseñar todo para empezar a bajar acoplamiento o mejorar cohesión en una zona problemática.

## Errores comunes

### 1. Pensar que toda dependencia es mala

Un sistema sin dependencias no existe.

### 2. Medir cohesión solo por tamaño de archivos o clases

Una pieza pequeña también puede tener cohesión pésima.

### 3. Confundir desacoplar con agregar abstracciones innecesarias

A veces se esconde la complejidad en vez de resolverla.

### 4. Ignorar la erosión porque “todavía funciona”

Muchas degradaciones graves no fallan al principio; encarecen el futuro.

### 5. Arreglar la superficie sin revisar ownership y límites

Mover funciones de lugar sin resolver quién debería decidir qué cambia poco.

### 6. Hacer refactors masivos sin foco

Conviene intervenir donde el costo real de evolución ya se siente.

## Mini ejercicio mental

Pensá estas preguntas:

1. ¿qué módulo de tu backend hoy concentra más dependencias de las que debería?
2. ¿qué clase o service mezcla responsabilidades que en realidad pertenecen a capas distintas?
3. ¿qué cambio pequeño te obligó recientemente a tocar demasiados archivos?
4. ¿hay alguna integración externa cuyos tipos o estados estén demasiado filtrados dentro del sistema?
5. ¿qué mejora chica podría aumentar cohesión o bajar acoplamiento en una zona concreta sin rediseñar todo?

## Resumen

En esta lección viste que:

- el acoplamiento describe cuánto dependen unas piezas de otras y se vuelve problemático cuando las dependencias son excesivas, inestables o demasiado detalladas
- la cohesión describe qué tan bien agrupadas están las responsabilidades dentro de una pieza y mejora cuando el módulo expresa una intención clara
- la erosión del diseño es el deterioro gradual de la estructura del backend a medida que se acumulan excepciones, dependencias impropias y responsabilidades mal ubicadas
- en backend, acoplamiento alto y cohesión baja encarecen cambios, aumentan regresiones, dificultan testing y reducen claridad de ownership
- muchas señales cotidianas de dolor del equipo, cambios transversales y miedo a tocar ciertas zonas suelen reflejar erosión estructural real
- mejorar estas cosas no implica perseguir pureza teórica, sino cuidar límites, encapsular detalles y sostener una evolución más segura y entendible

## Siguiente tema

Ahora que ya entendés mejor cómo se degradan los límites internos de un sistema y por qué eso vuelve más caro cada cambio, el siguiente paso natural es profundizar en **convenciones de código, consistencia y legibilidad a escala**, porque una parte importante de evitar erosión no depende solo de grandes decisiones de arquitectura, sino también de sostener formas compartidas de nombrar, organizar y leer el backend cuando el equipo y el código crecen.
