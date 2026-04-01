---
title: "Code smells en backend y cómo reconocerlos a tiempo"
description: "Qué son los code smells en sistemas backend, por qué no conviene ignorarlos, cómo distinguir señales de deterioro de problemas reales de dominio y qué patrones suelen anticipar deuda técnica, fragilidad y costo creciente de cambio."
order: 116
module: "Calidad, evolución y mantenibilidad a largo plazo"
level: "intermedio"
draft: false
---

## Introducción

Muchos problemas de mantenibilidad no aparecen de golpe.

No suele pasar que un backend un día está sano y al día siguiente se vuelve inmanejable sin aviso.

Lo más común es otra cosa:

empieza a dar señales.

Señales pequeñas.
Patrones raros.
Incomodidades repetidas.
Zonas que "siempre cuestan".
Partes del sistema que nadie quiere tocar.
Métodos que crecen y crecen.
Condiciones especiales que se apilan.
Duplicaciones que todavía "no son tan graves".

A esas señales muchas veces se las llama **code smells**.

No porque el código esté necesariamente roto.
Ni porque haya un bug directo.
Ni porque todo deba rehacerse ya mismo.

Sino porque algo **huele** a deterioro.

Algo sugiere que la estructura se está volviendo menos clara, menos sana o más costosa de evolucionar.

Y cuanto antes aprendas a ver esas señales, mejor.

Porque detectar smells temprano no sirve para obsesionarte con la limpieza estética.
Sirve para intervenir antes de que la deuda técnica se vuelva mucho más cara.

Esta lección trata justamente de eso:
**cómo reconocer code smells en backend y cómo usarlos como señal de diagnóstico, no como excusa para refactorizar por capricho.**

## Qué es un code smell

Un code smell es una señal de posible problema de diseño, estructura o mantenibilidad.

No implica automáticamente que el sistema esté mal.
Tampoco significa que haya que cambiarlo ya mismo.

Pero sí sugiere que conviene mirar más de cerca.

La idea importante es esta:

**un smell no es una prueba definitiva de que algo está mal, pero sí una alerta de que algo puede estar deteriorándose.**

Por eso se habla de "olor" y no de "falla confirmada".

Un smell suele indicar cosas como:

- responsabilidades mal repartidas
- complejidad que crece sin control
- acoplamiento excesivo
- duplicación peligrosa
- reglas importantes mal ubicadas
- flujos difíciles de entender o de probar
- diseño que se vuelve caro de cambiar

## Smell no es lo mismo que bug

Esto conviene dejarlo muy claro.

Un bug es un problema observable de comportamiento.
Algo no funciona como debería.

Un smell, en cambio, puede convivir con un sistema que "funciona".

Por ejemplo:

- una función gigantesca puede seguir funcionando
- un service hiperacoplado puede seguir devolviendo resultados correctos
- una lógica duplicada puede todavía no haber generado inconsistencias
- una integración mal encapsulada puede seguir andando

Pero todo eso puede estar mostrando que el costo futuro va a crecer.

O sea:

- el bug te habla del presente visible
- el smell muchas veces te habla del riesgo futuro

## Smell no es lo mismo que complejidad real del dominio

Ésta es una distinción muy importante.

No toda complejidad es un smell.

A veces un backend es complejo porque el negocio realmente lo es.

Por ejemplo:

- pricing con muchas reglas
- órdenes con múltiples estados válidos
- conciliación de pagos con estados ambiguos
- permisos finos por tenant, rol y recurso
- logística con casos excepcionales reales

Si el dominio es complejo, el código no puede mágicamente volverse trivial.

Entonces conviene distinguir entre:

- **complejidad esencial**: viene del problema real
- **complejidad accidental**: viene de cómo quedó construido el sistema

Los smells suelen apuntar más a la complejidad accidental.

No buscan negar que el dominio sea difícil.
Buscan mostrar cuándo lo estamos haciendo todavía más difícil de lo necesario.

## Por qué este tema importa tanto en backend

En backend, los smells suelen salir caros.

Porque no impactan solo en "qué lindo quedó el código".
Impactan en cosas bastante más serias:

- velocidad de cambio
- riesgo de regresión
- calidad de integraciones
- confiabilidad operativa
- testabilidad
- tiempo de onboarding
- claridad del dominio
- capacidad de escalar el sistema sin desordenarlo todavía más

Una mala estructura en frontend puede doler.

Pero en backend, además, puede afectar:

- datos
- transacciones
- side effects
- consistencia
- seguridad
- integraciones externas
- observabilidad
- operación real del negocio

Por eso aprender a detectar smells en backend es una habilidad muy valiosa.

## El error de usar “code smell” como insulto técnico

A veces este concepto se usa mal.

Alguien ve algo que no le gusta y dice:

- "esto es un smell"
- "esto está horrible"
- "esto hay que refactorizarlo"

Pero sin contexto.
Sin entender por qué existe.
Sin medir costo real.
Sin distinguir urgencia de preferencia.

Eso es un error.

Un smell no debería usarse como arma estética.
Debería usarse como señal para pensar mejor.

La pregunta útil no es:

**¿esto me gusta o no me gusta?**

La pregunta útil es:

**¿esta forma de construir el backend está aumentando riesgo, costo de cambio o fragilidad de una forma que ya vale la pena atender?**

## Smells clásicos en backend

Hay muchos.

Vamos a recorrer varios de los más comunes.

## Método o clase demasiado grande

Éste es de los más visibles.

Se nota cuando una pieza hace demasiadas cosas.

Por ejemplo, un método que:

- valida entrada
- resuelve permisos
- calcula reglas de negocio
- persiste datos
- llama APIs externas
- arma respuesta
- envía emails
- registra auditoría
- captura errores específicos
- y además tiene excepciones por cliente

Eso suele indicar mezcla de responsabilidades.

No siempre significa que haya que partir todo de inmediato.
Pero sí sugiere que esa zona puede estar:

- difícil de entender
- difícil de probar
- difícil de cambiar sin romper algo
- demasiado sensible a cualquier modificación

## Service “dios” o módulo “dios”

Muy típico en backend.

Es esa clase central a la que termina yendo todo.

Por ejemplo:

- `OrderService` que sabe demasiado
- `UserService` que toca autenticación, perfil, facturación y notificaciones
- `PaymentManager` que coordina todo el negocio de pagos y además varias integraciones

Estas piezas se vuelven peligrosas porque concentran demasiado conocimiento y demasiadas dependencias.

Consecuencias frecuentes:

- mucho acoplamiento alrededor
- alta fragilidad
- cambios muy riesgosos
- dificultad para separar responsabilidades reales del dominio
- dependencia excesiva de pocas personas que entienden esa zona

## Duplicación de lógica importante

No toda duplicación es igual.

Copiar dos líneas triviales no siempre importa mucho.

Pero cuando se duplica lógica de negocio relevante, sí aparece un smell fuerte.

Por ejemplo:

- cálculo de descuentos repetido en checkout y backoffice
- validación de estados repetida en varios endpoints
- permisos repetidos en distintos services
- normalización de datos repetida en varias integraciones

El problema no es solo la fealdad.

El problema real es este:

**la próxima vez que la regla cambie, alguna copia puede quedar vieja.**

Y ahí aparecen inconsistencias muy costosas.

## Condicionales que no dejan de crecer

Otro smell clásico.

Aparece cuando una zona del backend empieza a llenarse de:

- `if`
- `else if`
- switches enormes
- banderas especiales
- combinaciones de estado difíciles de seguir

A veces pasa porque el dominio realmente tiene variantes.

Pero muchas otras veces lo que está mostrando es que faltan mejores puntos de modelado.

Por ejemplo:

- reglas por tipo de cliente
- estrategias por proveedor
- comportamiento por canal
- políticas por país
- variantes por método de pago

Si todo eso vive como un bosque de condicionales dispersos, el sistema suele volverse opaco.

## Regla de negocio importante en lugar equivocado

Este smell es muy importante en backend.

A veces la lógica no está mal escrita.
El problema es **dónde vive**.

Por ejemplo:

- regla de precios en un controller
- decisión de autorización enterrada en un repositorio
- transición de estado hecha desde un mapper
- validación de dominio puesta en el DTO de entrada
- comportamiento crítico escondido en una clase de integración externa

Cuando las reglas viven en lugares torpes:

- cuesta encontrarlas
- cuesta reutilizarlas bien
- cuesta probarlas
- cuesta entender la intención del sistema

## Acoplamiento excesivo a infraestructura

Backend real suele tocar muchas cosas externas:

- base de datos
- colas
- archivos
- servicios externos
- cache
- email
- proveedores de pago

El smell aparece cuando la lógica importante queda demasiado mezclada con detalles de infraestructura.

Por ejemplo:

- casos de uso que dependen directo del cliente HTTP concreto
- dominio que conoce demasiado de SQL, Redis o S3
- reglas de negocio acopladas al formato de la API externa
- validaciones condicionadas por cómo responde un proveedor

Eso encarece muchísimo el cambio.

Si mañana cambia una integración, una librería o una estrategia de persistencia, el impacto se derrama por demasiadas partes.

## Nombres que no explican intención

Parece menor, pero en sistemas grandes pesa mucho.

Se nota cuando abundan nombres como:

- `process()`
- `handle()`
- `executeLogic()`
- `data`
- `info`
- `result`
- `manager`
- `helper`
- `utils`

El problema no es puramente estético.

Cuando los nombres no muestran intención:

- cuesta entender responsabilidades
- cuesta descubrir dónde vive una regla
- cuesta revisar cambios
- aumenta la carga mental del equipo

Muchas veces nombres vagos son síntoma de diseño todavía borroso.

## Helpers y utilidades que empiezan a absorber de todo

Otro smell muy común.

Se crean clases o módulos tipo:

- `CommonUtils`
- `BackendHelper`
- `OrderUtils`
- `IntegrationHelper`

Y con el tiempo terminan metiendo ahí cualquier cosa que no se sabe bien dónde poner.

Eso suele indicar que el diseño no está expresando bien sus conceptos.

En vez de mejorar la arquitectura, la utilidad se vuelve un cajón de sastre.

## DTOs, entidades y modelos que se confunden entre sí

En backend esto pasa muchísimo.

Se empieza a reutilizar una misma estructura para todo:

- entrada HTTP
- salida HTTP
- persistencia
- dominio
- integración externa
- eventos internos

Al principio parece práctico.

Después empiezan los problemas:

- campos que sobran en algunos contextos
- validaciones mezcladas
- cambios en una capa que rompen otra
- dependencia accidental entre contratos distintos
- dificultad para evolucionar sin efecto cascada

Cuando todo modelo representa todo, en realidad no representa bien nada.

## Repositorios o queries con demasiada lógica que no les corresponde

También es común ver backends donde la lógica se empieza a hundir en la capa de acceso a datos.

Por ejemplo:

- validaciones de negocio en el repositorio
- decisiones de autorización mezcladas con la query
- reglas de transición de estado aplicadas según lo que devuelve la base
- métodos de acceso a datos que ya casi definen el caso de uso completo

Eso suele producir dos problemas:

- lógica importante escondida donde cuesta verla
- fuerte dependencia entre dominio y forma de persistir

## Controllers que hacen demasiado

Muy típico en APIs que crecieron rápido.

El controller empieza siendo una capa fina.
Después termina haciendo:

- validaciones complejas
- autorización detallada
- armado de reglas de negocio
- llamadas a varios services
- decisiones de flujo
- transformaciones de datos complejas
- manejo especial de errores

Cuando eso pasa, el controller deja de ser borde de entrada y empieza a convertirse en coordinador caótico.

## Side effects escondidos o inesperados

Esto huele mal muy rápido.

Por ejemplo:

- actualizar una orden también manda email sin que se note
- leer un recurso dispara una sincronización externa
- guardar un perfil recalcula límites, audita, notifica y limpia cache en silencio
- una operación aparentemente simple tiene efectos colaterales por varios módulos

Cuanto menos visibles son esos side effects, más difícil se vuelve razonar sobre el sistema.

## Tests demasiado difíciles de escribir

Éste es un smell excelente porque no depende de gusto.

Cuando una pieza del backend es muy difícil de testear, muchas veces está mostrando problemas reales de diseño.

Por ejemplo:

- demasiadas dependencias
- falta de límites claros
- mezcla de responsabilidades
- side effects desordenados
- acoplamiento a infraestructura
- estado oculto

No siempre el problema está en el test.
A veces el test difícil está revelando que el diseño ya se volvió incómodo.

## Cambios pequeños que requieren tocar demasiados archivos

Esto también dice mucho.

Si para cambiar una regla simple tenés que tocar:

- controller
- service
- helper
- repositorio
- mapper
- listener
- config
- y además dos integraciones

probablemente hay un problema de distribución de responsabilidades o de acoplamiento.

Un buen diseño no elimina todo impacto transversal.
Pero sí evita que cada cambio mínimo se convierta en una expedición.

## Conocimiento crítico disperso

A veces una regla importante del negocio está partida en cinco lugares.

Por ejemplo:

- una parte en validación de entrada
- otra en el service
- otra en la base
- otra en un listener
- otra en una integración externa

Cada fragmento parece razonable por separado.

Pero el conjunto queda difícil de reconstruir.

Eso es un smell porque entender una regla importante requiere arqueología.

## Parámetros y estructuras confusas

Otra señal frecuente:

- métodos con demasiados parámetros
- booleanos que cambian comportamiento sin claridad
- estructuras genéricas que sirven para demasiadas cosas
- flags como `isInternal`, `isManual`, `skipValidation`, `force`, `mode`

Esas cosas suelen indicar que el modelo todavía no está encontrando buenas abstracciones.

## Manejo de errores inconsistente

Backend real necesita tratar errores con criterio.

Cuando cada módulo maneja errores de una manera distinta, aparece un smell.

Por ejemplo:

- algunos devuelven `null`
- otros lanzan excepciones genéricas
- otros usan códigos mágicos
- otros silencian errores
- otros mezclan error técnico y error de negocio sin distinguir

Eso vuelve muy difícil:

- razonar sobre fallas
- recuperar correctamente
- observar el sistema
- responder de forma consistente hacia afuera

## Integraciones externas “filtradas” por todo el sistema

Otro smell fuerte.

Por ejemplo:

- tipos del proveedor usados por muchas capas internas
- nombres de estados del sistema externo repetidos por todos lados
- decisiones del dominio atadas al contrato textual de una API externa
- lógica de fallback dispersa en múltiples lugares

Cuando pasa eso, tu backend deja de protegerse del exterior.
Y cualquier cambio del proveedor empieza a romper demasiadas capas.

## Configuración, flags y excepciones por cliente apiladas sin orden

Muy habitual en sistemas vivos.

Aparecen cosas como:

- `if tenant == X`
- `if featureY enabled`
- `if country == ...`
- `if legacyMode`
- `if manualOverride`

Una cantidad moderada puede ser inevitable.

Pero cuando esas excepciones se acumulan sin un modelo claro, el sistema se vuelve impredecible.

## Cómo reconocer smells a tiempo

La habilidad importante no es memorizar una lista.
La habilidad importante es entrenar cierta mirada.

## 1. Escuchar el dolor repetido del equipo

Si siempre aparecen comentarios como:

- "esa parte da miedo"
- "tocar eso rompe otra cosa"
- "nadie entiende bien ese flujo"
- "cada cambio ahí tarda el triple"
- "para testear esto hay que hacer magia"

eso suele indicar smells reales.

## 2. Observar dónde se frena el cambio

Un smell importante muchas veces no se ve por lectura estética, sino por fricción operativa.

Preguntas útiles:

- ¿qué módulos ralentizan siempre?
- ¿qué partes generan más regresiones?
- ¿dónde cuesta más agregar reglas nuevas?
- ¿qué zonas se llenan de parches?

## 3. Prestar atención al tamaño y a la mezcla de responsabilidades

Cuando algo crece mucho y además mezcla demasiadas decisiones, suele haber olor.

No por una regla rígida de cantidad de líneas, sino porque la intención ya se vuelve borrosa.

## 4. Ver si la misma regla aparece varias veces

La repetición de lógica importante es uno de los mejores detectores de smells.

Porque anticipa inconsistencias futuras.

## 5. Mirar qué tan visible es la intención del diseño

Cuando no está claro:

- dónde vive una regla
- quién decide qué
- qué módulo es dueño de qué
- qué depende de qué

el backend suele estar empezando a erosionarse.

## 6. Mirar la experiencia de testing

Si escribir tests se vuelve desproporcionadamente costoso, muchas veces el diseño ya está dando señales.

## 7. Mirar el comportamiento de los cambios en producción

Otra pista útil:

- pequeñas modificaciones generan incidentes
- releases simples traen regresiones raras
- arreglar una cosa rompe otra alejada
- revertir se vuelve difícil

Eso muchas veces no es "mala suerte".
Suele haber smells estructurales abajo.

## Smells que todavía no son urgentes y smells que ya duelen

Ésta es una distinción importante.

No todos los smells tienen la misma prioridad.

Hay smells tolerables.
Y hay smells que ya están afectando seriamente el ritmo del sistema.

Conviene pensar cosas como:

- ¿esto encarece cambios frecuentes o cambios raros?
- ¿afecta una zona central o periférica?
- ¿está generando bugs, demoras o fragilidad?
- ¿hay riesgo operativo real?
- ¿esta deuda sigue creciendo rápido?

Porque detectar un smell no obliga automáticamente a refactorizar ya.

A veces alcanza con:

- registrarlo
- entenderlo
- no empeorarlo
- esperar el momento correcto para intervenir

## Un smell aislado no siempre condena una pieza

También hay que evitar el pensamiento rígido.

Un método largo no siempre implica mal diseño.
Un switch no siempre es un error.
Una duplicación pequeña no siempre justifica abstracción.
Una clase central no siempre está mal.

Lo importante es mirar el patrón completo.

Por ejemplo:

- ¿ese método largo además mezcla demasiadas cosas?
- ¿ese switch sigue creciendo cada mes?
- ¿esa duplicación ya provocó diferencias peligrosas?
- ¿esa clase central está frenando la evolución?

El olor no está solo en la forma.
Está en la combinación entre forma, contexto y costo.

## Qué hacer cuando detectás un smell

Detectarlo no significa entrar en modo demolición.

Muchas veces el mejor movimiento es más medido.

Por ejemplo:

- nombrarlo y hacerlo visible
- documentar por qué preocupa
- observar si sigue creciendo
- agregar tests alrededor de esa zona
- aprovechar el próximo cambio real para mejorar un poco
- separar una responsabilidad puntual
- extraer una regla importante mal ubicada
- reducir acoplamiento en un borde concreto

La idea no es "limpiar por limpiar".
La idea es bajar costo futuro y riesgo real.

## Smells y refactoring con criterio

Este tema conecta directamente con la lección anterior.

Refactorizar con criterio exigía saber:

- qué tocar
- por qué tocarlo
- hasta dónde llegar
- cómo no inflar el alcance

Bueno:

los smells te ayudan justamente a identificar **dónde puede estar el deterioro que vale la pena mirar primero**.

O sea:

- la deuda técnica te da el problema general
- los smells te muestran señales más concretas
- el refactor con criterio te ayuda a intervenir sin romperlo todo

## Ejemplo intuitivo

Imaginá un backend de e-commerce donde el flujo de checkout tiene:

- un controller muy grande
- un service que calcula precios, valida stock, aplica descuentos y además llama al gateway de pago
- condicionales por canal de venta, país y tipo de cliente
- duplicación de reglas entre carrito y orden
- side effects escondidos de email y auditoría

Tal vez todo "funciona".

Pero ya hay varios smells juntos:

- demasiada responsabilidad concentrada
- reglas duplicadas
- acoplamiento alto
- side effects poco visibles
- crecimiento desordenado del flujo

Eso no te dice automáticamente:

- "rehacé checkout entero"

Pero sí te dice algo importante:

**ésta probablemente sea una de las zonas donde más va a costar seguir cambiando el sistema.**

## Relación con evolución y mantenibilidad

Un backend no se vuelve inmanejable solo por tener bugs.

Se vuelve inmanejable cuando:

- cada cambio cuesta demasiado
- el diseño deja de guiar y empieza a confundir
- el equipo pierde confianza en tocar ciertas partes
- las reglas importantes quedan escondidas
- la estructura ya no acompaña el crecimiento del producto

Los smells son una de las formas más útiles de detectar ese deterioro antes de llegar al colapso.

## Buenas prácticas iniciales

## 1. Usar los smells como señal de diagnóstico y no como juicio estético

La idea es entender riesgo y costo, no señalar imperfecciones para discutir gustos.

## 2. Priorizar smells que afectan zonas centrales y cambios frecuentes

No todo olor merece la misma atención.

## 3. Mirar patrones repetidos y no casos aislados sin contexto

Lo importante es la tendencia de deterioro.

## 4. Distinguir complejidad del dominio de complejidad accidental

No intentes "simplificar" lo que en realidad refleja una regla de negocio compleja pero legítima.

## 5. Observar la experiencia real de cambio, testing y operación

Muchas veces el smell más importante no salta leyendo código quieto, sino viendo dónde duele trabajar.

## 6. Aprovechar cambios reales para mejorar un poco las zonas con mal olor

Suele ser más efectivo que lanzar refactors enormes desconectados del trabajo concreto.

## 7. Evitar abstraer demasiado pronto solo por miedo a la duplicación

Algunas abstracciones prematuras también se vuelven smells.

## Errores comunes

### 1. Confundir cualquier cosa que no me gusta con un code smell

Eso vuelve el concepto inútil.

### 2. Detectar smells y proponer de inmediato una reescritura completa

Ver el olor no implica que la solución sea demoler todo.

### 3. No distinguir bug, deuda técnica, smell y complejidad de dominio

Son cosas relacionadas, pero no iguales.

### 4. Ignorar señales repetidas porque “todavía funciona”

Muchas zonas peligrosas siguen funcionando hasta que el costo explota.

### 5. Atacar smells periféricos mientras se ignoran los que frenan el sistema de verdad

Conviene priorizar por impacto, no por visibilidad superficial.

### 6. Crear abstracciones apuradas para “resolver” duplicación menor

A veces eso agrega más complejidad de la que elimina.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué parte de tu backend hoy te resulta más incómoda de tocar y por qué?
2. ¿ese problema parece venir de un bug puntual o de un olor estructural más profundo?
3. ¿hay lógica importante duplicada o muy dispersa en esa zona?
4. ¿qué señal concreta te hace pensar que ahí hay un smell real?
5. ¿podrías nombrar una mejora pequeña que reduzca ese olor sin reescribir todo?

## Resumen

En esta lección viste que:

- un code smell es una señal de posible deterioro en diseño, estructura o mantenibilidad, no una prueba automática de que el sistema esté mal
- smell no es lo mismo que bug, ni lo mismo que complejidad real del dominio
- en backend, los smells importan mucho porque afectan velocidad de cambio, riesgo, testabilidad, operación e integraciones
- algunos smells frecuentes son clases o métodos gigantes, duplicación de lógica importante, condicionales crecientes, side effects ocultos, acoplamiento excesivo y reglas mal ubicadas
- reconocer smells a tiempo permite intervenir antes de que la deuda técnica se vuelva mucho más cara
- detectar un smell no obliga a reescribir; muchas veces conviene observar, priorizar y mejorar de forma pequeña, concreta y progresiva

## Siguiente tema

Ahora que ya entendés mejor cómo detectar señales tempranas de deterioro estructural en un backend, el siguiente paso natural es profundizar en **acoplamiento, cohesión y erosión del diseño con el tiempo**, porque muchos code smells no aparecen aislados: suelen ser la manifestación visible de relaciones mal resueltas entre módulos, responsabilidades que se mezclan y una arquitectura que empieza a perder claridad a medida que el sistema evoluciona.
