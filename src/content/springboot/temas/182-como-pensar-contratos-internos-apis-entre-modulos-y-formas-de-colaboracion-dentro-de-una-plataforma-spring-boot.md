---
title: "Cómo pensar contratos internos, APIs entre módulos y formas de colaboración dentro de una plataforma Spring Boot grande sin filtrar detalles innecesarios ni obligar a que cada parte conozca demasiado de las demás"
description: "Entender por qué en una plataforma Spring Boot grande no alcanza con separar módulos si después colaboran filtrándose detalles internos, y cómo pensar contratos, APIs internas y formas de interacción con más criterio."
order: 182
module: "Arquitectura y diseño avanzado"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- dependencias
- acoplamiento
- direcciones de cambio
- costo de modificación
- ownership
- relaciones entre módulos
- y por qué una plataforma Spring Boot grande no debería aceptar que cada cambio arrastre medio sistema ni confundir conveniencia momentánea con diseño sano

Eso te dejó una idea muy importante:

> si ya entendiste que buena parte del dolor arquitectónico aparece cuando los módulos dependen mal entre sí, la siguiente pregunta natural es cómo deberían colaborar para no volver a caer en lo mismo por otra puerta.

Y en cuanto aparece esa idea, surge una pregunta muy natural:

> si dos o más partes de la plataforma necesitan interactuar, ¿cómo conviene diseñar esa colaboración para que cada una obtenga lo que necesita sin quedar acoplada al detalle interno, al modelo completo o a las decisiones privadas de la otra?

Porque una cosa es decir:

- “este módulo usa al otro”
- “este service llama al otro”
- “este job necesita estos datos”
- “este flujo consulta esa parte”

Y otra muy distinta es poder responder bien preguntas como:

- ¿qué debería exponer realmente un módulo a los demás?
- ¿qué diferencia hay entre API interna y acceso directo a internals?
- ¿cómo evitamos que todos compartan las mismas entidades?
- ¿qué datos o comportamientos conviene publicar como contrato y cuáles no?
- ¿cómo se expresa una colaboración sin filtrar detalles accidentales?
- ¿qué formato o nivel de abstracción debería tener una respuesta interna?
- ¿cuándo conviene una llamada directa y cuándo una interacción asíncrona?
- ¿cómo se versiona o evoluciona un contrato interno?
- ¿cómo evitar que los módulos colaboren de una forma tan íntima que después no puedan cambiar sin romperse?
- ¿cómo hacer para que una plataforma grande siga cooperando sin convertirse en una telaraña de conocimiento compartido de más?

Ahí aparece una idea clave:

> en una plataforma Spring Boot grande, no alcanza con tener módulos o límites si después la colaboración entre ellos se resuelve filtrando entidades internas, estados implícitos o detalles de implementación; también conviene diseñar contratos y APIs internas que expresen qué necesita realmente cada relación sin propagar conocimiento innecesario.

## Por qué este tema importa tanto

Cuando un sistema todavía es chico, muchas colaboraciones parecen inocentes:

- un service llama a otro
- se comparte una entidad
- se reutiliza un DTO
- se expone un repositorio
- se consulta una tabla ajena
- se arma un método utilitario
- y listo

Ese enfoque puede aguantar un tiempo.
Pero empieza a volverse costoso cuando aparecen cosas como:

- módulos con identidad propia
- equipos distintos tocando partes distintas
- reglas privadas de un subdominio
- integraciones internas cada vez más frecuentes
- lecturas parciales de datos
- workflows que cruzan varios contextos
- entidades que empiezan a viajar por todo el sistema
- contratos implícitos que nadie documentó
- cambios aparentemente chicos que rompen consumidores internos
- múltiples llamados encadenados para reconstruir algo que en realidad necesitaba otro tipo de interfaz
- duplicación de lógica porque la colaboración estaba mal planteada desde el principio

Entonces aparece una verdad muy importante:

> no toda interacción entre módulos es problemática, pero una colaboración mal diseñada suele convertirse muy rápido en una fuente de acoplamiento, filtración semántica y costo de cambio.

## Qué significa pensar contratos internos de forma más madura

Dicho simple:

> significa dejar de pensar la colaboración entre módulos como “acceso al código ajeno” y empezar a verla como un acuerdo explícito sobre qué se ofrece, con qué semántica, bajo qué nivel de detalle y con qué expectativas de evolución.

La palabra importante es **acuerdo**.

Porque cuando una parte del sistema expone algo a otra, idealmente no solo debería estar diciendo:
- “acá tenés una clase o un método”

También debería estar diciendo algo como:
- “ésta es la capacidad que te ofrezco”
- “éste es el nivel de información que te devuelvo”
- “esto sí podés asumir”
- “esto no deberías conocer”
- “y estos cambios sí o no deberían impactarte”

Entonces otra idea importante es esta:

> un contrato sano no solo da acceso; también limita, protege y aclara el tipo de conocimiento que circula entre partes del sistema.

## Una intuición muy útil

Podés pensarlo así:

- dependencia responde “necesito algo de vos”
- contrato responde “qué te doy y en qué términos”
- colaboración sana responde “cómo interactuamos sin conocernos más de lo necesario”

Esta secuencia ordena muchísimo.

## Qué diferencia hay entre usar un módulo y conocer demasiado de él

Muy importante.

No es lo mismo que un módulo diga:

- “necesito saber si esta orden puede cancelarse”

a que diga, implícitamente:

- “necesito la entidad completa de order”
- “sus estados internos”
- “sus transiciones”
- “sus flags”
- “sus excepciones”
- “y además voy a reconstruir yo mismo la regla”

En el primer caso, la colaboración puede ser relativamente sana.
En el segundo, el consumidor ya está absorbiendo conocimiento privado del otro módulo.

Entonces otra verdad importante es esta:

> una mala colaboración no siempre se ve como una llamada de más; muchas veces se ve como conocimiento de más.

## Un error clásico

Creer que compartir la misma entidad o el mismo modelo entre módulos siempre simplifica.

A veces simplifica al principio.
Pero muchas veces termina trayendo cosas como:

- semántica mezclada
- acoplamiento a estructura interna
- campos que unos usan y otros no
- dependencia accidental de detalles
- miedo a cambiar una entidad porque “la usa todo el mundo”
- y límites del dominio cada vez más borrosos

Entonces otra verdad importante es esta:

> reutilizar el mismo modelo en todos lados puede parecer práctico, pero muchas veces hace más caro cambiarlo, entenderlo o protegerlo.

## Qué relación tiene esto con APIs internas

Absolutamente total.

Las APIs internas no necesitan ser HTTP necesariamente.
Pueden ser simplemente formas explícitas de colaboración entre módulos.
Lo importante no es el protocolo.
Lo importante es que expresen mejor:

- capacidad
- intención
- semántica
- contrato
- y borde de responsabilidad

Por ejemplo, una API interna sana suele ayudar más cuando:

- nombra una intención del dominio
- expone lo mínimo útil
- oculta internals innecesarios
- evita acoplarse al storage o a la entidad interna
- da resultados que el consumidor realmente necesita
- y deja más claro quién es dueño de qué

Entonces otra idea importante es esta:

> muchas veces una API interna sana vale más por lo que protege que por lo que expone.

## Qué relación tiene esto con query vs acción

Muy importante.

No toda colaboración entre módulos es del mismo tipo.
A veces una parte necesita:

### Hacer una pregunta
Por ejemplo:
- obtener ciertos datos
- saber si algo es posible
- leer una vista
- consultar estado resumido

### Pedir una acción
Por ejemplo:
- cancelar algo
- reservar algo
- emitir una decisión
- abrir un caso
- registrar un evento
- iniciar un flujo

Mezclar estas dos cosas suele volver la interfaz más confusa.
Porque no es lo mismo preguntar:
- “¿puede cancelarse?”

que pedir:
- “cancelá”

Entonces otra verdad importante es esta:

> distinguir entre consultas y comandos ayuda muchísimo a que los contratos sean más claros y a que cada parte del sistema sepa mejor qué responsabilidad asume al colaborar.

## Una intuición muy útil

Podés pensarlo así:

- una query intenta entender
- una acción intenta cambiar
- y una buena colaboración deja claro cuál de las dos está ocurriendo

Esa frase vale muchísimo.

## Qué relación tiene esto con colaboración síncrona y asíncrona

Muy fuerte.

No toda interacción necesita la misma forma de coordinación.

### Síncrona
Suele servir cuando:
- la respuesta inmediata importa
- el flujo necesita confirmación ya
- el caso de uso depende directamente de ese dato o esa acción

### Asíncrona
Suele servir mejor cuando:
- la reacción puede ocurrir después
- el acoplamiento temporal conviene reducirlo
- varias partes quieren observar un hecho
- el tiempo de respuesta no necesita ser inmediato
- el sistema gana robustez evitando cadenas bloqueantes

Entonces otra idea importante es esta:

> elegir bien cómo colaboran los módulos también implica decidir cuánto acoplamiento temporal estás dispuesto a aceptar.

No siempre conviene síncrono.
No siempre conviene asíncrono.
Lo importante es no decidirlo por reflejo.

## Qué relación tiene esto con eventos internos

Muy fuerte, pero con cuidado.

Los eventos pueden ser una forma poderosa de colaboración si expresan bien algo como:

- “esto ocurrió”
- “esta parte del sistema ya lo decidió”
- “otras partes pueden reaccionar si les importa”

Pero si se usan mal, pueden terminar:

- filtrando demasiados detalles
- funcionando como llamadas indirectas difíciles de rastrear
- escondiendo dependencias obligatorias como si fueran opcionales
- o llevando semántica borrosa que nadie posee con claridad

Entonces otra verdad importante es esta:

> un evento interno sano debería expresar un hecho suficientemente estable para otros, no la implementación privada o el paso técnico de un flujo.

## Qué relación tiene esto con composición de workflows

Central.

Muchas veces un flujo atraviesa varios módulos.
Por ejemplo:

- orders
- payments
- inventory
- support
- fraud
- payouts
- notifications

Ahí suele aparecer una pregunta importante:

- ¿quién orquesta?
- ¿cada módulo decide una parte?
- ¿qué información necesita el orquestador?
- ¿qué debería pedir y qué no?
- ¿dónde termina la coordinación y dónde empieza la invasión de lógica ajena?

Entonces otra idea importante es esta:

> coordinar módulos no debería equivaler a absorber toda su lógica interna en un “service orquestador” que sabe demasiado de todos.

A veces hace falta orquestación, sí.
Pero conviene que no se convierta en un punto donde todo el conocimiento del sistema se acumula sin control.

## Qué relación tiene esto con lectura parcial y vistas adaptadas

Muy importante.

Muchos problemas de colaboración aparecen porque un módulo A necesita solo una pequeña porción de información de B, pero como no existe una interfaz sana termina:

- importando la entidad completa
- leyendo tablas ajenas
- recreando joins internos
- o usando un repositorio que no le pertenece

A veces mejora muchísimo crear una vista o contrato más adaptado a la necesidad real.
Por ejemplo:
- “resumen de seller”
- “estado cancelable de una orden”
- “capacidad de payout”
- “snapshot de reputación”
- “vista de fulfillment para soporte”

Entonces otra verdad importante es esta:

> no siempre hace falta exponer más; muchas veces hace falta exponer mejor y más cerca de la necesidad concreta del consumidor.

## Un ejemplo muy claro

Imaginá que soporte necesita saber si una orden puede modificarse.
Hay varias maneras de resolverlo.

### Diseño pobre
- soporte importa el modelo interno de orders
- lee flags
- interpreta estados
- reimplementa reglas
- decide por su cuenta

### Diseño mejor
- orders expone una capacidad o vista tipo:
  - `canModify(orderId)`
  - o una vista resumen con restricciones relevantes

En el segundo caso:
- support sabe menos de internals
- orders mantiene ownership de su regla
- y el cambio futuro viaja menos

Eso muestra por qué contratos internos importan tanto.

## Qué relación tiene esto con versionado y evolución

Muy fuerte también.

Aunque una API sea interna, puede terminar siendo usada por muchos consumidores.
Entonces otra pregunta clave es:

- ¿cómo cambia esto sin romper a todos?

No siempre hace falta un versionado formal pesado.
Pero sí suele ayudar pensar:

- qué cambios son compatibles
- qué supuestos están implícitos
- qué partes conviene mantener más estables
- qué naming o forma de respuesta ya quedó “contractual”
- qué consumer depende de qué comportamiento

Otra verdad importante es esta:

> lo interno no siempre significa libre de contrato; muchas veces solo significa contrato más cercano, pero contrato al fin.

## Qué relación tiene esto con testing

Muy fuerte.

Cuando la colaboración entre módulos está mejor expresada, suele volverse más fácil:

- testear contratos
- probar casos de uso
- aislar bordes
- detectar cuándo un cambio rompe a un consumidor
- y construir confianza sobre integraciones internas

En cambio, cuando la colaboración ocurre por:

- entidades compartidas
- acceso a internals
- queries cruzadas
- utilidades ambiguas
- o supuestos informales

los tests suelen volverse:
- más frágiles
- más opacos
- o menos útiles para detectar el daño real

Entonces otra idea importante es esta:

> un buen contrato interno no solo desacopla mejor; también hace más testeable la colaboración.

## Qué relación tiene esto con ownership y límites del dominio

Absolutamente total.

Los contratos internos más sanos suelen aparecer cuando está mejor claro:

- quién posee qué regla
- quién posee qué dato
- quién decide qué cambio de estado
- qué módulo debería ser consultado
- qué parte puede ofrecer una vista
- y qué parte no debería exponer sus tripas

Si el ownership es borroso, los contratos internos también tienden a serlo.
Y entonces aparece:
- acoplamiento
- duplicación
- dependencia cruzada
- y mucha semántica filtrada

## Qué no conviene hacer

No conviene:

- compartir entidades internas como si fueran contratos universales
- resolver colaboración leyendo tablas ajenas por comodidad
- reimplementar reglas de otro módulo porque “era más rápido”
- esconder acoplamiento detrás de interfaces vacías
- usar eventos para todo sin cuidar semántica
- construir orquestadores que saben demasiado de todos los módulos
- mezclar queries y acciones en contratos borrosos
- asumir que lo interno no necesita estabilidad ni claridad
- crear APIs genéricas que no expresan intención real del dominio
- dejar que cada consumidor arme su propia interpretación de lo que otro módulo “quiso decir”

Ese tipo de enfoque suele terminar en:
- acoplamiento alto
- ownership borroso
- cambios caros
- y colaboración difícil de mantener.

## Otro error común

Querer diseñar contratos perfectos y definitivos desde el día uno.

Tampoco conviene eso.
La pregunta útil es:

- ¿qué colaboraciones hoy están más dolorosas?
- ¿qué módulo conoce demasiado del otro?
- ¿qué lectura o acción aparece repetida desde varios lados?
- ¿qué contrato pequeño podría reducir más filtración de detalles?
- ¿dónde conviene exponer una capacidad en vez de una estructura interna?

A veces con:
- unas pocas vistas más sanas
- algunas acciones más explícitas
- mejor separación entre query y command
- menos entidades viajando
- y mejores nombres

ya podés mejorar muchísimo.

## Otro error común

Pensar que los contratos internos son “solo detalle de implementación”.

No.
Con el tiempo, muchas veces son parte central de cómo el sistema evoluciona.
Un contrato interno mal diseñado puede:

- encarecer refactors
- bloquear cambios de estructura
- multiplicar consumidores rotos
- y hacer que el conocimiento privado de un módulo se derrame por toda la plataforma

Entonces este tema es bastante más arquitectónico de lo que parece.

## Una buena heurística

Podés preguntarte:

- ¿qué necesita realmente este consumidor del otro módulo?
- ¿está pidiendo una acción o solo una lectura?
- ¿está recibiendo exactamente lo que necesita o demasiado detalle interno?
- ¿quién debería poseer esta regla o esta decisión?
- ¿qué partes del contrato deberían ser más estables?
- ¿esta colaboración exige sincronía real o solo inercia técnica?
- ¿estoy exponiendo intención o solo estructura?
- ¿qué consumer va a doler más si este módulo cambia?
- ¿este contrato reduce acoplamiento o solo lo disfraza?
- ¿la colaboración entre estas partes ayuda a la evolución del sistema o está filtrando conocimiento de más?

Responder eso ayuda muchísimo más que pensar solo:
- “hagamos una interfaz entre módulos”

## Qué relación tiene esto con Spring Boot

Directísima.

Spring Boot te da una base muy buena para expresar mejor estas colaboraciones porque te permite construir con bastante claridad:

- services de aplicación
- vistas específicas
- adaptadores
- eventos internos
- listeners
- capas de lectura
- endpoints internos
- jobs coordinados
- contratos más explícitos entre módulos
- testeo de integración
- seguridad y límites de acceso

Pero Spring Boot no decide por vos:

- qué debería exponerse como contrato
- qué parte pertenece a una vista y qué parte al dominio interno
- qué colaboración debería ser síncrona o asíncrona
- qué detalles conviene ocultar
- qué nivel de estabilidad necesita una API interna
- qué ownership debe quedar preservado
- qué módulo está conociendo demasiado del otro

Eso sigue siendo criterio arquitectónico del sistema, no del framework.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque en un proyecto real aparecen preguntas como:

- “¿support debería conocer estados internos de orders?”
- “¿analytics puede leer estas tablas directo o necesita otra vista?”
- “¿fraud decide esto o solo observa un hecho del dominio?”
- “¿catalog debería exponer el producto completo o solo una vista para pricing?”
- “¿conviene llamada directa o evento?”
- “¿este orquestador ya sabe demasiado?”
- “¿por qué este cambio rompió tres consumidores internos?”
- “¿qué parte del contrato se volvió de facto pública?”
- “¿cómo evitamos seguir filtrando entidades por todo el sistema?”
- “¿qué colaboración duele más hoy y por qué?”

Y responder eso bien exige mucho más que tener classes bien nombradas o paquetes prolijos.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> en una plataforma Spring Boot grande, los módulos no deberían colaborar filtrándose entidades, estados o decisiones privadas más allá de lo necesario, sino a través de contratos internos y APIs que expresen intención, protejan ownership, limiten conocimiento compartido y hagan posible que cada parte siga evolucionando sin obligar a las demás a conocer demasiado de su mundo interno.

## Resumen

- Separar módulos no alcanza si después colaboran de forma demasiado íntima.
- Un contrato interno sano expone intención útil y protege detalles innecesarios.
- Compartir entidades internas suele parecer simple, pero muchas veces encarece el cambio.
- Distinguir entre queries y acciones ayuda muchísimo a aclarar la colaboración.
- Síncrono, asíncrono y eventos internos sirven para cosas distintas y conviene elegir con criterio.
- Las vistas adaptadas suelen ser mejores que obligar a un consumidor a entender todo el modelo ajeno.
- Lo interno también necesita contratos y cierta estabilidad, aunque no sean públicos.
- Spring Boot ayuda mucho a implementar estas colaboraciones, pero no define por sí solo qué debe saber cada módulo del otro.

## Próximo tema

En el próximo tema vas a ver cómo pensar invariantes, reglas críticas y protección del núcleo del dominio dentro de una plataforma Spring Boot grande, porque después de entender mejor cómo colaboran los módulos, la siguiente pregunta natural es cómo evitar que las reglas más sensibles del negocio queden dispersas, duplicadas o demasiado expuestas a capas externas que no deberían decidir sobre ellas.
