---
title: "Convenciones de código, consistencia y legibilidad a escala"
description: "Por qué las convenciones de código no son un capricho estético, cómo la consistencia reduce fricción en equipos backend, qué vuelve realmente legible a un sistema cuando crece y cómo sostener reglas compartidas sin convertirlas en burocracia inútil."
order: 118
module: "Calidad, evolución y mantenibilidad a largo plazo"
level: "intermedio"
draft: false
---

## Introducción

Cuando un backend es chico, muchas decisiones parecen menores.

Da la sensación de que no importa demasiado si una clase se llama de una forma u otra.
Si una carpeta está organizada de cierta manera o de otra.
Si los métodos devuelven nombres consistentes.
Si las excepciones siguen un criterio uniforme.
Si las validaciones viven siempre en el mismo lugar.
Si el naming de variables y funciones responde a una convención o a la intuición del momento.

Mientras el sistema es pequeño, muchas de esas diferencias parecen tolerables.
A veces incluso parecen irrelevantes.

Pero a medida que el backend crece, eso cambia.

Porque el problema deja de ser solo escribir código.
El problema pasa a ser **leerlo, entenderlo, modificarlo, revisarlo y mantenerlo entre muchas manos y durante mucho tiempo**.

Y ahí las convenciones de código, la consistencia y la legibilidad dejan de ser una cuestión estética.
Pasan a ser una cuestión de costo operativo, velocidad de cambio y salud general del sistema.

Esta lección trata justamente de eso:
**por qué importa tanto sostener convenciones compartidas en un backend real, qué significa realmente que un sistema sea legible a escala y cómo evitar tanto el caos informal como la burocracia técnica excesiva.**

## El error de pensar que las convenciones son puro estilo

Mucha gente escucha “convenciones de código” y piensa enseguida en cosas superficiales.

Por ejemplo:

- si usar tabs o espacios
- dónde poner llaves
- cuánto debe medir una línea
- si los nombres van en camelCase o snake_case
- si un archivo tiene cierto orden visual

Todo eso existe.
Pero no es lo más importante.

En un backend real, las convenciones más valiosas no son solo visuales.
Suelen tener que ver con preguntas como:

- ¿cómo nombramos casos de uso, servicios, repositorios, policies y handlers?
- ¿dónde vive cada tipo de lógica?
- ¿cómo modelamos errores y excepciones?
- ¿qué forma tienen los DTOs y cómo se nombran?
- ¿qué patrón usamos para logging?
- ¿cómo organizamos paquetes, módulos o carpetas?
- ¿qué parte del sistema puede conocer qué detalle técnico?
- ¿cómo se escriben tests para que todos los entiendan rápido?
- ¿qué grado de duplicación toleramos y cuándo se considera un problema?
- ¿cómo se documentan decisiones que afectan a varios equipos?

O sea:

**las convenciones importan porque reducen variación innecesaria.**

Y cuando baja la variación innecesaria, baja la fricción para pensar y cambiar el sistema.

## Qué problema resuelven las convenciones

Las convenciones no existen para controlar personas.
Ni para imponer gustos personales.
Ni para hacer que todo “se vea prolijo”.

Su valor real es otro:

**permiten que menos energía mental se gaste en interpretar la forma y más energía se use en entender el problema real.**

Cuando un backend tiene buenas convenciones compartidas:

- es más fácil orientarse
- hay menos sorpresas gratuitas
- las revisiones son más claras
- el onboarding es más rápido
- el riesgo de interpretar mal una intención disminuye
- el costo de moverse entre módulos baja
- discutir diseño se vuelve más productivo porque no todo arranca desde cero

En cambio, cuando cada parte del sistema responde a criterios distintos:

- leer se vuelve más lento
- revisar exige más contexto implícito
- el equipo discute detalles repetidos una y otra vez
- aparecen inconsistencias que después se convierten en bugs o malos entendidos
- tocar código ajeno se siente más riesgoso

## Consistencia no significa rigidez absoluta

Esto también conviene aclararlo.

A veces se cae en una caricatura.

Por un lado está el caos total:

- “cada uno programa como le quede cómodo”
- “lo importante es que funcione”
- “después vemos la prolijidad”

Y por otro lado está el extremo burocrático:

- reglas para todo
- convenciones innecesariamente rígidas
- discusiones eternas por detalles mínimos
- dificultad para hacer excepciones razonables
- más energía puesta en cumplir el ritual que en resolver el problema

Ninguno de los dos extremos ayuda mucho.

La idea sana es otra:

**consistencia suficiente para reducir fricción, pero con criterio suficiente para no volver el desarrollo torpe.**

No hace falta que todo sea idéntico.
Hace falta que las diferencias importantes respondan a razones claras y no a azar histórico o preferencias aisladas.

## Qué significa legibilidad a escala

Cuando una persona dice “este código es legible”, muchas veces está hablando de una función o de un archivo puntual.

Pero en sistemas grandes hace falta pensar la legibilidad de otra manera.

No alcanza con que un bloque chico se entienda.

Un backend es legible a escala cuando alguien puede:

- encontrar rápido dónde vive una responsabilidad
- entender cómo se conectan las partes principales
- prever más o menos qué patrón va a encontrar al entrar a un módulo
- distinguir con claridad reglas de negocio, coordinación, persistencia e integración
- leer un cambio sin tener que reconstruir mentalmente costumbres distintas en cada carpeta
- entender nombres, errores y flujos sin arqueología innecesaria

O sea:

**la legibilidad a escala no depende solo de que el código esté “bien escrito”; depende también de que el sistema sea predecible.**

Y la predictibilidad viene en gran parte de la consistencia.

## Un sistema inconsistente obliga a releer todo desde cero

Éste es uno de los costos más subestimados.

Cuando un backend no sostiene convenciones, cada zona parece hablar un dialecto distinto.

Por ejemplo:

- en un módulo los casos de uso están en `services`
- en otro están en `handlers`
- en otro están mezclados con controllers
- en una parte los errores de dominio son clases específicas
- en otra se tiran strings
- en otra se usan códigos mágicos
- en una zona los DTOs tienen sufijo `Request` y `Response`
- en otra no tienen sufijo
- en otra mezclan entidades con payloads externos
- en una integración los retries siguen un patrón claro
- en otra están escondidos en helpers sueltos

Nada de eso quizá rompe el sistema hoy.

Pero sí rompe algo muy importante:
la posibilidad de moverse con soltura.

Cada vez que entrás a una parte nueva, tenés que reaprender sus costumbres.
Y eso hace que el backend se vuelva cada vez más caro de leer.

## Convenciones como compresión de conocimiento

Hay una idea muy útil para entender este tema.

Las convenciones son una forma de compresión.

En vez de tener que explicar todo cada vez, el equipo comparte supuestos razonables.

Por ejemplo, si todos saben que:

- los controllers solo adaptan HTTP y no contienen reglas importantes
- los casos de uso orquestan
- las reglas del dominio viven en cierto lugar
- los clients externos se encapsulan detrás de una interfaz o adaptador
- los eventos se nombran de cierta forma
- los tests de integración siguen una estructura consistente

entonces muchas decisiones dejan de tener que discutirse desde cero en cada cambio.

Eso ahorra tiempo.
Y, más importante aún, ahorra ambigüedad.

## Qué tipos de convenciones importan de verdad en backend

No todas pesan igual.

### 1. Convenciones de naming

Muy importantes.

Porque el nombre es la primera interfaz humana del sistema.

Importa, por ejemplo:

- cómo se nombran módulos
- cómo se nombran casos de uso
- cómo se nombran entidades, value objects y DTOs
- cómo se nombran excepciones
- cómo se nombran métodos booleanos
- cómo se nombran eventos, comandos o handlers

Nombres inconsistentes aumentan fricción.
No porque “queden feos”, sino porque vuelven difícil anticipar intención.

### 2. Convenciones de organización

Tienen que ver con dónde vive cada cosa.

Por ejemplo:

- estructura de carpetas o paquetes
- separación por módulo, capa o caso de uso
- ubicación de tests
- ubicación de mappers
- ubicación de clients externos
- criterios para utilidades compartidas

Cuando esto cambia arbitrariamente de una zona a otra, encontrar responsabilidades se vuelve caro.

### 3. Convenciones de diseño

Más profundas.

Por ejemplo:

- qué puede depender de qué
- dónde deberían vivir las reglas de negocio
- qué se considera coordinación y qué se considera decisión
- cómo se aíslan detalles externos
- cuándo crear una abstracción y cuándo no
- cómo se modelan errores recuperables y no recuperables

Estas convenciones suelen ser más valiosas que las puramente visuales.

### 4. Convenciones de testing

También importan mucho.

Por ejemplo:

- cómo se nombran tests
- qué nivel de detalle se espera en cada tipo de prueba
- qué se mockea y qué no
- cuándo corresponde un test unitario, de integración o contrato
- cómo se preparan fixtures
- cómo se evita que los tests se vuelvan ilegibles

Cuando cada persona testea con una lógica distinta, la suite pierde coherencia muy rápido.

### 5. Convenciones operativas y de observabilidad

A veces se subestiman, pero son clave.

Por ejemplo:

- formato de logs
- naming de métricas
- estructura de correlación o tracing
- manejo de errores con información sensible
- políticas de retry y timeout
- forma de exponer health checks o señales operativas

Esto afecta muchísimo la legibilidad del sistema en producción, no solo en el editor.

## Legibilidad no es escribir “bonito”

Esto también merece una distinción.

Hay código visualmente prolijo que sigue siendo difícil de entender.

Y hay código no tan elegante que, sin embargo, se lee bastante bien.

La legibilidad real tiene más que ver con cosas como:

- claridad de intención
- buenos nombres
- responsabilidades bien delimitadas
- bajo ruido incidental
- flujo fácil de seguir
- modelo mental coherente
- decisiones importantes visibles donde corresponde

Un método puede ser corto y aun así ilegible si:

- sus nombres no significan nada
- esconde demasiados side effects
- delega a helpers con nombres vacíos
- depende de contexto implícito por todos lados

Del mismo modo, una pieza relativamente extensa puede seguir siendo legible si su intención está clara y sus pasos tienen sentido.

## La consistencia reduce discusiones de bajo valor

Uno de los mayores beneficios de tener convenciones sanas es que evita gastar energía en debates repetitivos y poco rentables.

Por ejemplo:

- “¿dónde ponemos esto?”
- “¿cómo nombramos este tipo?”
- “¿este endpoint debería hablar con tal capa o con tal otra?”
- “¿cómo devolvemos errores en este módulo?”
- “¿cómo se arma este test?”

Si el sistema ya tiene una forma compartida de resolver esas cuestiones, el equipo puede concentrarse en lo que sí merece discusión real:

- trade-offs de negocio
- consistencia del dominio
- riesgos operativos
- decisiones de arquitectura
- impacto en escalabilidad o seguridad

Sin convenciones, hasta las decisiones más rutinarias se vuelven microdebates.

## Qué pasa cuando el sistema crece y el equipo también

Mientras una sola persona domina casi todo, muchas inconsistencias pueden quedar escondidas.

La misma persona ya sabe “cómo funciona realmente” cada rincón del backend.
Puede traducir internamente sus propias diferencias.

Pero eso no escala bien.

Cuando el equipo crece:

- entra gente nueva
- aparecen cambios en paralelo
- se abren más PRs
- diferentes personas tocan los mismos módulos
- el conocimiento tácito deja de alcanzar

En ese contexto, la consistencia empieza a tener mucho más valor.

No porque el código deba volverse impersonal.
Sino porque el sistema ya no puede depender de memoria privada.

## El costo oculto de la inconsistencia pequeña

Una inconsistencia aislada parece menor.

Dos también.
Diez, quizás todavía parecen tolerables.

Pero en sistemas vivos, las pequeñas inconsistencias se acumulan.

Y esa acumulación produce efectos como:

- más tiempo para revisar cambios
- más errores de interpretación
- más dificultad para detectar anomalías reales
- menor capacidad de refactorizar con seguridad
- menor reutilización de patrones sanos
- más copy-paste con variaciones confusas

Lo peligroso no es cada inconsistencia por separado.
Es el paisaje que forman en conjunto.

## Qué vuelve legible a un backend en la práctica

Vamos a bajar esto a señales concretas.

### Un backend suele leerse mejor cuando...

- los nombres describen intención y no detalle incidental
- los módulos tienen fronteras reconocibles
- los archivos no mezclan capas sin necesidad
- los flujos principales se pueden seguir sin saltos excesivos
- las decisiones importantes están explícitas
- los errores se modelan con una lógica estable
- las integraciones externas no ensucian todo el dominio
- el código comparte patrones repetibles entre módulos
- las excepciones al patrón son pocas y justificadas

### Un backend suele leerse peor cuando...

- cada módulo inventa su propia forma de organizarse
- el naming cambia según quién tocó esa parte
- hay demasiadas utilidades genéricas con nombres vagos
- la lógica importante está distribuida entre helpers, mappers y callbacks perdidos
- las capas se mezclan de forma arbitraria
- los errores se manejan distinto en cada endpoint
- el sistema depende demasiado de conocimiento oral

## Consistencia no es copiar el mismo patrón en cualquier lado

Acá hay otra trampa.

A veces se entiende “consistencia” como repetir ciegamente la misma estructura aunque el problema no sea el mismo.

Eso también es un error.

Porque una buena convención debería ayudar a expresar mejor la intención del sistema, no forzar moldes vacíos.

Por ejemplo:

- no todo necesita el mismo tipo de service
- no toda lógica merece la misma abstracción
- no todo módulo requiere la misma profundidad estructural
- no todo caso de uso necesita una ceremonia pesada

La consistencia sana no borra diferencias reales del dominio.
Ordena las diferencias para que se entiendan mejor.

## La relación entre consistencia y diseño

Este tema puede parecer “menor” comparado con arquitectura, módulos o límites de contexto.
Pero en realidad está muy conectado con todo eso.

Porque muchas veces el diseño se erosiona no por una gran decisión equivocada, sino porque se pierde la disciplina cotidiana de sostener formas compartidas.

Cuando eso pasa:

- el naming se vuelve errático
- los límites se hacen borrosos
- las excepciones se multiplican
- aparecen atajos locales que nadie corrige
- cada módulo deriva hacia su propia cultura interna

Entonces la consistencia no reemplaza al buen diseño.
Pero sí ayuda mucho a sostenerlo en el tiempo.

## Convenciones útiles vs convenciones burocráticas

No toda regla compartida vale la pena.

Una convención útil suele tener estas características:

- resuelve una fricción repetida
- hace más fácil leer o cambiar el sistema
- reduce errores frecuentes
- es simple de aplicar
- admite excepciones razonables
- puede explicarse con claridad

En cambio, una convención burocrática suele sentirse así:

- existe pero nadie entiende bien por qué
- obliga a pasos que no aportan valor claro
- genera discusiones más que resolverlas
- dificulta el trabajo sin mejorar mucho la comprensión
- se cumple por miedo o costumbre, no por utilidad

La pregunta sana no es “¿tenemos reglas?”
La pregunta sana es:

**¿nuestras reglas compartidas reducen fricción o la aumentan?**

## Ejemplos de convenciones sanas

### Ejemplo 1: naming estable para casos de uso

Si el equipo usa una convención clara para nombrar acciones del backend, leer cambia mucho.

Por ejemplo:

- `CreateOrder`
- `CancelOrder`
- `ConfirmPayment`
- `RetryShipmentBooking`

Eso suele leerse mejor que una mezcla aleatoria de:

- `OrderManager`
- `OrderProcessor`
- `ExecuteOrderCreationService`
- `ThingThatHandlesPaymentConfirmation`

No porque una palabra sea siempre perfecta, sino porque la familia de nombres ayuda a orientarse.

### Ejemplo 2: errores de dominio con patrón reconocible

Si todos los módulos expresan errores importantes de una forma similar, se vuelve más fácil entender qué salió mal y cómo manejarlo.

Por ejemplo:

- errores de validación de negocio
- errores de conflicto de estado
- errores de autorización
- errores transitorios de infraestructura

Cuando cada uno lanza cosas distintas sin criterio compartido, el sistema se vuelve más difícil de operar y testear.

### Ejemplo 3: controllers delgados de verdad

No alcanza con decir “los controllers deben ser finos”.
Eso se vuelve convención útil cuando realmente se cumple en la mayoría de módulos.

Entonces, al abrir un controller, el lector ya espera encontrar:

- adaptación HTTP
- validación superficial del request
- delegación al caso de uso
- traducción de respuesta o error

Esa expectativa compartida mejora mucho la legibilidad.

## Ejemplos de inconsistencia dañina

### 1. Helpers genéricos que nadie entiende bien

Archivos con nombres como:

- `CommonUtils`
- `BackendHelper`
- `GenericService`
- `AppFunctions`

suelen ser síntoma de convenciones débiles.

Porque cuando no hay criterios claros de ubicación ni responsabilidad, muchas cosas terminan escondidas en bolsas genéricas.

### 2. Tipos con nombres que cambian según el humor del módulo

Por ejemplo:

- en una carpeta hay `CreateUserRequest`
- en otra `CreateUserDTO`
- en otra `NewUserPayload`
- en otra `UserInput`

Puede parecer menor.
Pero en un sistema grande, esa variación constante aumenta ruido innecesario.

### 3. Flujos equivalentes resueltos de formas distintas

Si tres módulos hacen algo parecido pero cada uno organiza el caso de uso de una manera completamente distinta, el costo de mantenimiento sube.

No porque todo deba ser idéntico.
Sino porque el lector deja de tener un mapa común.

## Cómo sostener consistencia sin matar autonomía

Éste es el equilibrio delicado.

Un equipo necesita cierta libertad para resolver problemas reales.
Pero también necesita bordes compartidos.

Algunas ideas útiles:

### 1. Definir pocas convenciones, pero importantes

Mejor pocas reglas claras y valiosas que un manual enorme que nadie usa.

### 2. Documentar decisiones que afectan a varios módulos

No hace falta burocracia extrema.
Pero sí conviene registrar criterios que después van a repetirse.

### 3. Usar code review para reforzar el lenguaje común

La revisión no debería ser solo para cazar errores.
También sirve para sostener formas sanas de construir el backend.

### 4. Ajustar convenciones cuando la realidad las desmiente

Una convención no debería volverse intocable.
Si ya no ayuda, se revisa.

### 5. Alinear herramientas automáticas con el criterio humano

Linters, formatters y templates pueden ayudar mucho.
Pero no reemplazan conversaciones de diseño.

## Herramientas que ayudan, pero no resuelven todo

Hay herramientas útiles para sostener consistencia.

Por ejemplo:

- formatters
- linters
- análisis estático
- reglas de arquitectura
- plantillas de proyecto
- snippets compartidos
- convenciones de PR

Todo eso ayuda.

Pero tiene límites.

Una herramienta puede detectar formato.
Puede incluso detectar ciertas dependencias indebidas.

Lo que no puede resolver sola es si:

- el naming comunica intención real
- la estructura expresa bien el dominio
- una abstracción agrega claridad o solo ceremonia
- el flujo se entiende fácil
- la convención todavía tiene sentido para el sistema actual

Por eso conviene ver las herramientas como apoyo, no como sustituto del criterio.

## Code review como mecanismo de legibilidad compartida

La revisión de código es uno de los lugares donde más se juega este tema.

Porque ahí el equipo decide, una y otra vez, qué considera claro, consistente y mantenible.

Un buen code review no se limita a decir:

- “esto compila”
- “falta un test”
- “cambiá este nombre”

También puede preguntar cosas como:

- ¿este nombre expresa la responsabilidad real?
- ¿esta lógica debería vivir acá?
- ¿estamos repitiendo una variación que ya complica otros módulos?
- ¿esta excepción al patrón está justificada?
- ¿el flujo principal se puede leer sin contexto oculto?

Ese tipo de revisión construye cultura técnica.

## La legibilidad también impacta la operación

No parece obvio al principio, pero sí.

Un backend legible no ayuda solo a escribir features.
También ayuda a operar el sistema.

Porque cuando algo falla en producción, necesitás poder:

- encontrar rápido el flujo responsable
- entender qué decisión tomó el sistema
- seguir la lógica de errores
- identificar dónde se inyectó un detalle externo problemático
- corregir sin empeorar la situación

Si el sistema es inconsistente y opaco, incidentes que ya son difíciles se vuelven todavía más caros.

## Señales de que te está faltando consistencia

Algunas señales frecuentes:

- cada PR abre discusiones básicas sobre naming u organización
- cuesta encontrar dónde agregar una regla nueva
- módulos parecidos se sienten escritos por culturas distintas
- las personas nuevas tardan demasiado en orientarse
- el equipo necesita mucha explicación oral para entender patrones básicos
- aparecen utilidades genéricas porque nadie sabe dónde poner las cosas
- leer código ajeno se siente más costoso de lo razonable
- los cambios chicos disparan dudas estructurales una y otra vez

## Señales de que quizás te pasaste de rigidez

También existen.

- reglas tan numerosas que nadie las recuerda
- resistencia a excepciones incluso cuando el problema lo justifica
- reviews demasiado centradas en rituales menores
- más energía puesta en cumplir moldes que en expresar bien el dominio
- estructuras copiadas aunque no aporten claridad
- diseño inflado para “respetar la plantilla”

Si pasa eso, la convención dejó de servir al sistema y el sistema pasó a servir a la convención.

## Qué conviene priorizar primero en un backend real

Si tu sistema hoy es inconsistente, no hace falta arreglar todo de golpe.

Suele rendir más empezar por lo que más impacto tiene en lectura y cambio.

Por ejemplo:

## 1. Naming de conceptos principales

Que el lenguaje del dominio y de los casos de uso sea claro y estable.

## 2. Ubicación de responsabilidades

Que sea razonablemente predecible dónde vive cada cosa.

## 3. Reglas sobre mezcla de capas

Especialmente para evitar que HTTP, persistencia e integración contaminen toda la lógica.

## 4. Manejo de errores

Un backend se vuelve mucho más legible cuando el error sigue patrones reconocibles.

## 5. Estructura de tests

Porque los tests también comunican cómo se piensa el sistema.

## Mini ejemplo mental

Imaginá dos backends del mismo tamaño.

En el primero:

- los nombres son irregulares
- cada módulo organiza distinto sus casos de uso
- los errores se manejan de forma desigual
- los tests no siguen una estructura común
- hay helpers genéricos por todos lados

En el segundo:

- los nombres son bastante estables
- las responsabilidades suelen vivir en lugares previsibles
- las integraciones siguen patrones compartidos
- los errores tienen taxonomía razonable
- los tests se leen con estructura repetible

Aunque ambos “funcionen”, el segundo probablemente va a cambiar más rápido, onboarding mejor y producir menos fricción cotidiana.

Ahí está el valor real de este tema.

## Relación con el tema anterior

La lección anterior habló de acoplamiento, cohesión y erosión del diseño.

Este tema baja esa idea a la práctica cotidiana.

Porque muchas erosiones grandes se vuelven posibles cuando se pierde consistencia chica.

Por ejemplo:

- naming errático que esconde ownership difuso
- organización irregular que vuelve borrosos los límites
- manejo desigual de errores que rompe predictibilidad
- estilos distintos de coordinación que aumentan acoplamiento accidental

O sea:

- la erosión estructural se ve en grande
- pero muchas veces se alimenta de inconsistencias pequeñas repetidas durante mucho tiempo

## Relación con mantenibilidad a largo plazo

Mantener un backend vivo no depende solo de tomar grandes decisiones de arquitectura una vez.

Depende también de sostener un lenguaje común cuando el sistema cambia todos los meses.

La consistencia y la legibilidad a escala ayudan a:

- reducir carga cognitiva
- mantener velocidad de cambio
- bajar errores de interpretación
- facilitar revisiones y refactors
- evitar que cada zona del backend derive a su propia lógica local

No reemplazan diseño, testing ni observabilidad.
Pero los potencian muchísimo.

## Buenas prácticas iniciales

## 1. Acordar convenciones sobre lo que más impacto tiene

Primero naming, ubicación de responsabilidades, errores, tests y límites entre capas.

## 2. Evitar nombres vagos o demasiado genéricos

Los nombres deberían ayudar a leer intención, no esconderla.

## 3. Hacer que el camino normal sea claro y repetible

Cuando un patrón es sano, conviene que sea fácil seguirlo.

## 4. Permitir excepciones justificadas

La consistencia sirve al sistema; no debería aplastar diferencias reales del problema.

## 5. Usar herramientas automáticas para lo mecánico

Eso libera energía humana para discutir cosas de más valor.

## 6. Tratar la review como parte del diseño compartido

La legibilidad se negocia y se sostiene también ahí.

## 7. Mejorar incrementalmente

No hace falta normalizar todo el backend de una vez para empezar a reducir fricción.

## Errores comunes

### 1. Creer que la consistencia es un tema cosmético

En realidad afecta velocidad, onboarding, riesgo y costo de cambio.

### 2. Intentar resolver legibilidad solo con formato automático

El formato ayuda, pero naming, estructura y responsabilidad pesan mucho más.

### 3. Copiar patrones sin entender el problema

Eso produce consistencia superficial y rigidez inútil.

### 4. Dejar que cada módulo derive sin guía compartida

Al principio parece ágil; a largo plazo sale caro.

### 5. Definir reglas que nadie entiende ni puede explicar

Las buenas convenciones deberían tener motivo claro.

### 6. No revisar nunca las convenciones existentes

Lo que servía hace un año quizás hoy ya no ayuda tanto.

## Mini ejercicio mental

Pensá estas preguntas:

1. ¿qué parte de tu backend hoy cuesta leer no por complejidad del negocio, sino por inconsistencia de estilo, naming u organización?
2. ¿hay conceptos importantes que reciben nombres distintos según el módulo?
3. ¿si una persona nueva entra al proyecto, podría anticipar dónde vive la lógica principal de un caso de uso?
4. ¿qué convenciones actuales del proyecto realmente ayudan y cuáles son más bien costumbre vacía?
5. ¿qué pequeña regla compartida podría bajar bastante la fricción cotidiana del equipo?

## Resumen

En esta lección viste que:

- las convenciones de código no son solo una cuestión estética, sino una forma de reducir variación innecesaria y carga cognitiva en un backend real
- la consistencia ayuda a que el sistema sea más predecible, más fácil de revisar y más barato de cambiar cuando el código y el equipo crecen
- la legibilidad a escala depende no solo de funciones claras, sino también de naming estable, ubicación predecible de responsabilidades y patrones compartidos entre módulos
- no toda regla compartida vale la pena: las convenciones útiles reducen fricción, mientras que las burocráticas agregan costo sin mejorar comprensión
- herramientas como linters y formatters ayudan, pero no reemplazan el criterio sobre naming, diseño, límites y claridad de intención
- sostener consistencia no significa volver todo idéntico, sino construir un lenguaje común que deje visibles las diferencias reales del dominio sin añadir ruido accidental

## Siguiente tema

Ahora que ya entendés por qué la consistencia diaria y la legibilidad compartida son parte central de la mantenibilidad, el siguiente paso natural es profundizar en **diseño para cambio seguro: cómo tocar el sistema sin romperlo todo**, porque no alcanza con que un backend sea legible si después cada modificación sigue siendo riesgosa, difícil de aislar o demasiado frágil frente a cambios reales.
