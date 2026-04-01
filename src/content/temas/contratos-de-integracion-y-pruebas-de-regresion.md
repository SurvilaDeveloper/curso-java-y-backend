---
title: "Contratos de integración y pruebas de regresión"
description: "Qué significa proteger contratos entre módulos, servicios y consumidores, por qué muchas regresiones no nacen en la lógica interna sino en cambios de acuerdos implícitos o explícitos, y cómo usar pruebas de contrato y regresión para evolucionar un backend sin romper integraciones que dependen de él."
order: 124
module: "Calidad, evolución y mantenibilidad a largo plazo"
level: "intermedio"
draft: false
---

## Introducción

A medida que un backend crece, deja de vivir encerrado en sí mismo.

Empieza a interactuar con:

- frontend
- apps móviles
- otros módulos internos
- servicios propios
- servicios de terceros
- jobs
- consumidores asíncronos
- sistemas legados
- procesos de soporte y backoffice

Y en ese momento aparece una verdad muy importante.

Muchas veces el problema ya no es solo si tu código interno “funciona”.
El problema también es si seguís respetando los acuerdos sobre los que otros ya construyeron encima.

A esos acuerdos los solemos llamar **contratos**.

Y cuando esos contratos cambian de forma accidental o poco controlada, aparecen regresiones que pueden ser muy costosas.

Por eso este tema conecta de forma directa con la lección anterior.

Si el testing era la red de seguridad para evolucionar el sistema, entonces una parte crítica de esa red consiste en proteger aquello que otros esperan de nosotros.

No alcanza con que internamente el código quede lindo.
No alcanza con que la lógica “todavía dé bien”.
No alcanza con que la suite unitaria siga verde.

También hace falta responder una pregunta clave:

**¿seguimos cumpliendo el contrato que nuestros consumidores esperan?**

## Qué es un contrato en backend

Cuando se habla de contratos, mucha gente piensa enseguida en una API HTTP documentada.

Eso es una parte.
Pero el concepto es bastante más amplio.

Un contrato es cualquier acuerdo sobre:

- forma de datos
- campos presentes o ausentes
- tipos esperados
- reglas de validación
- códigos de error
- semántica de estados
- orden de eventos
- significado de una transición
- tiempos esperables
- comportamiento frente a casos borde
- garantías mínimas de una integración

Por ejemplo, hay contratos en:

- una respuesta JSON
- un evento publicado en una cola
- un webhook saliente
- un archivo CSV exportado
- una tabla que otro proceso lee
- una interfaz interna entre módulos
- un flujo donde cierto estado debe existir antes que otro

O sea:

**contrato no es solo formato; también es comportamiento esperado.**

## Por qué este tema importa tanto en sistemas reales

Porque muchas regresiones no nacen en un algoritmo roto.
Nacen en cambios aparentemente razonables que rompen expectativas ajenas.

Por ejemplo:

- renombrar un campo JSON porque “quedaba más prolijo”
- empezar a devolver `null` donde antes había string vacío
- cambiar el orden o significado de estados
- remover un campo “que nadie usa”
- volver obligatorio algo que antes era opcional
- cambiar un enum sin coordinar consumidores
- modificar el formato de un webhook
- devolver 200 con un body distinto en vez de 404
- alterar una regla temporal que otro sistema asumía
- cambiar un cálculo cuyo resultado alimenta facturación, stock o reporting

Desde adentro del equipo que hizo el cambio, a veces eso se ve como una mejora menor.
Pero desde afuera puede ser una ruptura seria.

Y el problema empeora porque muchas de estas regresiones no explotan enseguida en el lugar donde se originan.
Explotan en otra parte.

- en el frontend
- en un worker
- en un sistema tercero
- en un cliente enterprise
- en una integración nocturna
- en reportes
- en operaciones de soporte

Eso vuelve muy fácil romper algo sin enterarse de inmediato.

## La falsa sensación de seguridad de los tests internos

Éste es uno de los errores más comunes.

Un equipo cambia una implementación, corre sus tests unitarios y de integración locales, todo da verde, y concluye:

- “no rompimos nada”

Pero eso no siempre es cierto.

Tal vez no rompieron su lógica interna.
Tal vez no rompieron su base.
Tal vez no rompieron su caso feliz.

Y aun así pudieron haber roto el contrato hacia afuera.

Por ejemplo:

- el endpoint sigue respondiendo, pero faltan campos
- el evento sigue publicándose, pero cambió el schema
- el módulo interno sigue compilando, pero alteró una precondición que otro módulo dependía
- el cálculo sigue siendo válido técnicamente, pero cambió una convención que otro flujo esperaba

Entonces aparece una idea importante:

**los tests internos protegen implementación y lógica local; las pruebas de contrato y regresión ayudan a proteger acuerdos e historia de comportamiento.**

## Qué es una regresión en este contexto

Una regresión es un comportamiento que antes funcionaba como se esperaba y que, después de un cambio, deja de hacerlo.

Pero en integraciones la regresión no siempre es un crash evidente.
A veces es una ruptura silenciosa.

Por ejemplo:

- un consumidor deja de poder parsear una respuesta
- un job ignora un evento porque cambió una clave
- una app móvil vieja falla porque un campo cambió de tipo
- un cliente no recibe un webhook por una condición nueva no documentada
- un proceso downstream toma decisiones incorrectas por un pequeño cambio semántico

Por eso las regresiones de contrato pueden ser especialmente peligrosas.

No siempre generan excepciones ruidosas.
A veces generan datos malos, estados inconsistentes o fallas diferidas.

## Tipos de contratos que conviene proteger

No todos los contratos son iguales.
Y no todos necesitan exactamente la misma clase de prueba.

## 1. Contratos HTTP

Son los más visibles.
Incluyen cosas como:

- shape del JSON
- nombres de campos
- tipos
- headers importantes
- códigos de estado
- errores posibles
- reglas de paginación
- filtros aceptados
- compatibilidad de parámetros

## 2. Contratos de eventos o mensajería

Acá importa mucho:

- nombre del evento
- payload
- versión
- significado de cada campo
- cuándo se emite
- en qué orden relativo
- si puede duplicarse
- qué garantías temporales ofrece

## 3. Contratos entre módulos internos

Aunque no cruces red, también puede haber contratos relevantes.
Por ejemplo:

- métodos que esperan invariantes concretas
- interfaces internas entre capas
- adapters usados por múltiples casos de uso
- módulos que dependen de cierto orden operativo

Muchas veces estos contratos internos no están documentados formalmente.
Pero existen igual.
Y romperlos también duele.

## 4. Contratos de datos persistidos o exportados

Ejemplos:

- estructura de archivos CSV o Excel
- tablas consumidas por BI
- snapshots de datos
- esquemas leídos por procesos batch
- estructuras serializadas

## 5. Contratos de comportamiento

Éstos son más sutiles.
No se limitan a forma de datos, sino a significado.

Por ejemplo:

- qué significa `PAID`
- cuándo una orden pasa a `FULFILLED`
- si una cancelación revierte stock automáticamente o no
- si un retry puede duplicar efectos
- si cierto endpoint es idempotente o no

A veces la forma externa no cambió, pero el contrato semántico sí.
Y eso también puede ser una regresión.

## Qué son las pruebas de contrato

Las pruebas de contrato intentan validar que un productor y un consumidor sigan entendiendo lo mismo.

Dicho simple:

- el productor promete algo
- el consumidor espera algo
- la prueba busca detectar si esa promesa y esa expectativa dejaron de coincidir

No siempre se implementan igual.
Hay distintas formas.

## Enfoque 1: tests del lado del productor

El productor verifica que sigue emitiendo o respondiendo con el contrato esperado.

Por ejemplo:

- respuesta con ciertos campos obligatorios
- tipos correctos
- errores con estructura consistente
- eventos con payload compatible

Esto ayuda bastante, pero tiene un límite.
El productor puede pensar que protege bien el contrato y aun así pasar por alto cosas que un consumidor real necesita.

## Enfoque 2: tests del lado del consumidor

El consumidor expresa qué espera realmente.

Por ejemplo:

- qué campos necesita
- qué estructura mínima tolera
- qué casos de error soporta
- qué variantes considera válidas

Esto hace más explícita la expectativa real del otro lado.

## Enfoque 3: contract testing productor-consumidor

Acá se modela el acuerdo entre ambos.
El consumidor declara expectativas y el productor las verifica.

La idea es muy valiosa porque:

- evita depender solo de documentación estática
- baja el riesgo de romper consumidores sin enterarse
- permite evolucionar con feedback más concreto

No hace falta obsesionarse con herramientas específicas para entender la idea.
Lo importante es el principio:

**si otros consumen algo que producís, conviene validar explícitamente que seguís siendo compatible con sus expectativas reales.**

## Qué son las pruebas de regresión

Las pruebas de regresión no se limitan a contratos externos formales.
Su función es capturar comportamientos que ya demostraron ser importantes o frágiles y evitar que se rompan otra vez.

Pueden cubrir:

- bugs históricos
- flujos críticos
- combinaciones borde
- integraciones que ya fallaron antes
- semánticas delicadas
- formatos que no se deben alterar sin intención explícita

Una regla muy útil es esta:

**cada bug serio o repetido puede convertirse en una oportunidad para agregar una prueba de regresión.**

Así el sistema no solo se corrige.
También aprende.

## Contrato y regresión no son exactamente lo mismo

Están muy relacionados, pero conviene distinguirlos.

Las pruebas de contrato suelen enfocarse en acuerdos entre partes.
Las pruebas de regresión suelen enfocarse en proteger comportamientos previamente correctos o incidentes ya vividos.

A veces una misma prueba cumple ambas funciones.
Pero no siempre.

Ejemplo:

- proteger que el JSON conserve ciertos campos obligatorios es muy de contrato
- proteger que un bug raro de rounding no reaparezca es muy de regresión
- proteger que un webhook siga enviándose con cierto contenido luego de un fix puede ser ambas cosas a la vez

## Por qué esto es clave para evolucionar un sistema

En esta etapa del roadmap estamos hablando de mantenibilidad a largo plazo.
Y eso incluye poder cambiar el backend sin convertir cada release en ruleta rusa.

Las pruebas de contrato y regresión ayudan a:

- cambiar implementación interna sin romper acuerdos externos
- refactorizar con más seguridad
- detectar efectos colaterales antes de producción
- versionar mejor una API o un evento
- coordinar cambios entre equipos con menos fricción
- bajar miedo en releases
- documentar qué comportamientos son realmente intocables

En otras palabras:

**no solo ayudan a detectar errores; ayudan a sostener evolución con memoria.**

## Ejemplo intuitivo

Supongamos que tenés un endpoint de órdenes que devuelve algo así:

- `orderNumber`
- `status`
- `paymentStatus`
- `grandTotal`
- `items`

Y el frontend usa `paymentStatus` para mostrar un badge.

Un día alguien decide simplificar y lo cambia a:

- `payment`

Internamente todo parece perfecto.
El backend compila.
Los tests unitarios pasan.
La consulta a base sigue bien.

Pero el frontend rompe.

Desde el punto de vista del backend, el cambio fue pequeño.
Desde el punto de vista del contrato, fue una ruptura.

Ahora imaginá otra variante.
No cambiaste el nombre del campo, pero cambiaste los valores posibles:

- antes: `PENDING`, `PAID`, `FAILED`
- ahora: `WAITING`, `SUCCESS`, `ERROR`

Eso también puede romper consumidores aunque la forma general del JSON siga parecida.

Y una tercera variante.
No cambiaste ni nombre ni enum.
Pero empezaste a omitir `paymentStatus` cuando todavía no hay intento de cobro.

De nuevo: puede romper consumidores.

Este ejemplo muestra algo importante.

**los contratos no se rompen solo cuando cae el endpoint; también se rompen cuando cambia una expectativa que otros daban por estable.**

## Compatibilidad hacia atrás y contratos

Esto conecta directo con la lección anterior.

Compatibilidad hacia atrás significa, entre otras cosas, que un cambio nuevo no obligue a todos los consumidores a actualizarse inmediatamente para que todo siga funcionando.

En contratos eso suele implicar criterios como:

- agregar campos suele ser más seguro que removerlos
- volver opcional algo suele ser más seguro que volverlo obligatorio
- introducir nuevas versiones puede ser mejor que mutar una semántica crítica en silencio
- deprecar con aviso suele ser mejor que cortar de golpe
- documentar transiciones y ventanas de soporte reduce sorpresas

Las pruebas de contrato ayudan a verificar si realmente seguís siendo backward compatible o si solo lo asumís.

## Contratos explícitos vs contratos implícitos

Idealmente, los contratos importantes deberían estar explicitados.

Por ejemplo:

- OpenAPI
- schema de eventos
- documentación viva
- interfaces claras
- ejemplos de request y response
- políticas de versionado

Pero en sistemas reales abundan también los contratos implícitos.

- “este campo siempre viene”
- “este valor nunca es null”
- “este evento sale solo después de persistir”
- “si hay error de validación el body tiene tal forma”
- “si una orden está cancelada ya no descuenta stock”

Muchas veces esos acuerdos viven:

- en código del consumidor
- en dashboards
- en playbooks
- en jobs históricos
- en conocimiento tribal del equipo

Eso los vuelve frágiles.

Una de las mayores utilidades de estas pruebas es hacer visible lo implícito antes de que explote.

## Señales de que te falta protección de contratos

Algunas señales bastante típicas:

- cambios aparentemente chicos rompen otros equipos
- el frontend se entera tarde de modificaciones
- aparecen bugs después de releases aunque la suite local daba verde
- se rompen webhooks o integraciones con terceros sin explicación rápida
- nadie sabe bien qué campos son realmente obligatorios
- hay mucho miedo al tocar endpoints o eventos usados por varios consumidores
- la documentación dice una cosa y la realidad otra
- los incidentes se repiten alrededor de los mismos acuerdos frágiles

## Qué conviene probar de un contrato

No siempre hace falta testear absolutamente cada detalle.
Pero sí conviene proteger lo que de verdad importa.

Por ejemplo:

- campos obligatorios
- tipos y formatos relevantes
- enums o estados permitidos
- estructura de errores
- compatibilidad con consumidores existentes
- presencia de valores críticos
- semánticas que no deben cambiar silenciosamente
- casos borde conocidos
- eventos disparados en condiciones clave

La idea no es congelar para siempre toda evolución.
La idea es volver explícito qué cambios necesitan coordinación y cuáles no.

## El peligro de tests demasiado rígidos

Acá también hay un equilibrio.

Una mala estrategia sería escribir pruebas tan rígidas que cualquier cambio inocuo obligue a romper todo.

Por ejemplo:

- exigir igualdad exacta de payload completo cuando el consumidor solo usa tres campos
- acoplar el test a orden irrelevante de propiedades
- validar detalles cosméticos sin valor de negocio
- congelar respuestas enteras cuando solo importa una parte estable

Eso genera ruido.
Y cuando la suite hace ruido innecesario, el equipo deja de confiar en ella o empieza a pelear contra ella.

Entonces el criterio importa mucho.

**un buen test de contrato protege lo esencial del acuerdo, no cada detalle accidental de implementación.**

## El peligro contrario: tests demasiado débiles

El otro extremo también es malo.

Por ejemplo:

- validar solo que el endpoint responde 200
- chequear que existe “algún body”
- verificar que el evento sale, pero no su contenido mínimo
- mirar solo presencia de JSON sin importar tipos ni significado

Eso da falsa tranquilidad.

La protección útil necesita suficiente precisión como para detectar rupturas reales.

## Herramientas, sí; criterio primero

Existen herramientas específicas para contract testing, schemas, snapshots, validaciones automáticas y compatibilidad.

Son valiosas.
Pero antes de hablar de herramientas, hay que entender la intención.

Si no tenés claro:

- quién consume
- qué espera
- qué parte del acuerdo es crítica
- qué cambios son compatibles y cuáles no

ninguna herramienta te salva por sí sola.

Primero hace falta modelar bien el problema.
Después elegir cómo automatizarlo.

## Relación con incidentes reales

Una práctica muy útil es revisar incidentes pasados y preguntarse:

- ¿se rompió un contrato?
- ¿hubo un cambio semántico no coordinado?
- ¿faltó una prueba de regresión?
- ¿la documentación estaba desalineada?
- ¿qué expectativa del consumidor no estaba siendo verificada?

Muchas veces los incidentes más molestos dejan una enseñanza repetida:

**el sistema no estaba protegiendo acuerdos que ya eran importantes.**

Convertir esos incidentes en pruebas es una forma concreta de madurez.

## Contratos en integraciones internas también

A veces se piensa que esto solo aplica a APIs públicas o a terceros.
No.

En monolitos modulares, servicios internos o módulos compartidos también existen contratos.

Por ejemplo:

- un módulo de pagos depende de cierta semántica de órdenes
- auditoría espera ciertos eventos internos
- reporting depende de ciertos cambios de estado
- fulfillment asume determinado orden de operaciones

Si eso no está protegido, el hecho de “estar dentro del mismo sistema” no evita regresiones.
A veces incluso las vuelve más invisibles.

## Estrategia sana para empezar

Si un sistema todavía no tiene casi nada de esto, no hace falta intentar formalizar todo de golpe.

Conviene empezar por zonas de alto valor.

Por ejemplo:

- endpoints más consumidos
- webhooks importantes
- eventos críticos
- flujos con historial de incidentes
- integraciones con terceros costosos de coordinar
- contratos usados por varios equipos

Ahí suele estar el mejor retorno inicial.

## Buenas prácticas iniciales

## 1. Identificar quién consume qué

No podés proteger bien un contrato que ni siquiera tenés bien mapeado.

## 2. Hacer explícitos los acuerdos críticos

Aunque sea con documentación simple, ejemplos o schemas mínimos.

## 3. Proteger campos, errores y semánticas que realmente importan

No se trata de congelar ruido, sino de resguardar valor.

## 4. Convertir bugs o incidentes repetidos en pruebas de regresión

Cada dolor importante puede transformarse en protección futura.

## 5. Diferenciar cambios compatibles de rupturas reales

No todo cambio requiere la misma coordinación.

## 6. Usar versionado, deprecación y transición cuando haga falta

Es mejor gestionar una evolución que forzar una sorpresa.

## 7. Revisar periódicamente si la documentación y la realidad siguen alineadas

Un contrato descripto pero no verificado se degrada rápido.

## Errores comunes

### 1. Creer que si los tests internos pasan entonces el contrato está protegido

No necesariamente.

### 2. Pensar contrato solo como “formato JSON”

La semántica y el comportamiento también importan.

### 3. Cambiar nombres, enums o reglas con liviandad porque “es un detalle”

Para el consumidor puede no ser ningún detalle.

### 4. Escribir pruebas tan rígidas que impiden cualquier evolución razonable

Eso vuelve la protección contraproducente.

### 5. Escribir pruebas tan flojas que no detectan rupturas reales

Eso produce falsa confianza.

### 6. No aprender de incidentes pasados

Perdés oportunidades concretas de endurecer el sistema.

### 7. Ignorar contratos internos por no cruzar red

Las dependencias internas también se rompen.

## Mini ejercicio mental

Pensá estas preguntas:

1. ¿qué endpoint, evento o integración de tu backend tiene más consumidores y más riesgo de romper a otros?
2. ¿sabés con claridad qué parte de ese contrato es verdaderamente estable y cuál podría cambiar sin problema?
3. ¿hubo algún bug reciente que en realidad fue una regresión de contrato o de comportamiento esperado?
4. ¿qué acuerdos importantes en tu sistema hoy existen más en la cabeza del equipo que en pruebas o documentación?
5. ¿si mañana cambiaras un payload o un estado crítico, qué validación automática te avisaría que rompiste a alguien?

## Resumen

En esta lección viste que:

- un contrato en backend no es solo la forma de una API, sino también los acuerdos de datos, errores, estados y comportamiento que otros consumidores esperan
- muchas regresiones importantes no nacen en la lógica interna sino en cambios de expectativas externas o compartidas que se alteran sin control
- los tests internos pueden pasar y aun así dejar roto un contrato hacia afuera
- las pruebas de contrato ayudan a proteger acuerdos entre productores y consumidores, mientras que las de regresión ayudan a evitar que comportamientos ya correctos vuelvan a romperse
- contratos explícitos e implícitos existen tanto en APIs públicas como en eventos, webhooks, módulos internos y procesos de datos
- una buena estrategia protege lo esencial del acuerdo, evitando tanto la rigidez excesiva como la validación superficial
- convertir incidentes y bugs reales en pruebas es una forma concreta de construir memoria técnica y evolución segura

## Siguiente tema

Ahora que ya entendés mejor cómo proteger acuerdos e integraciones para que el sistema no rompa a sus consumidores cuando evoluciona, el siguiente paso natural es meterse en **datos de prueba, fixtures y ambientes confiables**, porque incluso una buena estrategia de testing y contratos pierde muchísimo valor si las pruebas corren sobre datos irreales, ambientes inconsistentes o setups que no representan de forma confiable los escenarios que querés validar.
