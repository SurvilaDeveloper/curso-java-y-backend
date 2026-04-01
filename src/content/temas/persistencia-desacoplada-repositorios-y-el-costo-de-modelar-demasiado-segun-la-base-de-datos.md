---
title: "Persistencia desacoplada, repositorios y el costo de modelar demasiado según la base de datos"
description: "Cómo pensar la persistencia sin dejar que la base de datos domine por completo el diseño del backend, y por qué los repositorios y un desacople razonable ayudan a proteger mejor el dominio y los casos de uso."
order: 99
module: "Arquitectura y organización del backend"
level: "intermedio"
draft: false
---

## Introducción

En muchos proyectos backend, la base de datos empieza teniendo un rol tan fuerte que, casi sin querer, termina dominando todo el diseño del sistema.

Entonces aparecen cosas como estas:

- las entidades del dominio se parecen demasiado a las tablas
- las decisiones del negocio quedan subordinadas al ORM
- los casos de uso se piensan según cómo conviene persistir y no según el problema real
- los nombres del dominio empiezan a contaminarse con criterios puramente de almacenamiento
- cambios de estructura en la base impactan demasiado en el centro del sistema

Esto no significa que la base de datos no importe.
Claro que importa muchísimo.

Pero sí plantea una pregunta muy valiosa:

**¿cómo hacemos para que la persistencia sea importante sin que se vuelva la dueña del diseño?**

Ahí aparecen tres ideas muy útiles:

- **persistencia desacoplada**
- **repositorios**
- **el costo de modelar demasiado según la base de datos**

## Por qué este tema importa tanto

Porque casi todos los sistemas reales necesitan persistir información.

Y como persistir es tan central, es muy fácil que el proyecto empiece a girar alrededor de:

- tablas
- joins
- entidades ORM
- ids
- relaciones de base
- conveniencias de query
- formatos de almacenamiento

Si eso ocurre sin criterio, el backend puede terminar expresando más la estructura de la base que la lógica del negocio.

Entonces el problema no es usar base de datos.
El problema es **dejar que el modelo de persistencia absorba completamente al modelo del sistema**.

## Qué significa persistencia desacoplada

Persistencia desacoplada no significa que el dominio “ignore mágicamente” que existe una base de datos.

Significa algo más razonable:

**que la forma de guardar y recuperar datos no debería definir por completo la forma en que pensamos el negocio, los casos de uso y las reglas importantes del sistema.**

En otras palabras:

- la persistencia sirve al sistema
- pero no debería mandar sobre todo lo demás

## Qué es un repositorio

Un repositorio es una abstracción que representa acceso a datos desde la perspectiva del dominio o del caso de uso, sin obligar a exponer directamente todos los detalles técnicos de la persistencia.

Dicho más simple:

es una forma de decir:

- necesito guardar esto
- necesito obtener esto
- necesito buscar esto por cierto criterio

sin que la capa que usa esa operación tenga que pensar directamente en:

- SQL
- ORM
- session
- entity manager
- implementación técnica concreta
- detalles específicos de almacenamiento

El repositorio no reemplaza la base.
La encapsula mejor desde el punto de vista del sistema.

## Qué problema intenta resolver un repositorio

Intenta resolver varios problemas comunes:

- que el dominio dependa demasiado de detalles de almacenamiento
- que los casos de uso conozcan demasiado del ORM
- que las consultas queden desperdigadas por cualquier parte del código
- que la persistencia invada la lógica de negocio
- que cambiar ciertos detalles técnicos tenga impacto excesivo

No siempre todo eso se resuelve perfectamente.
Pero un repositorio bien pensado puede ayudar bastante.

## Modelar demasiado según la base de datos

Esta frase apunta a un problema muy frecuente:

**cuando el sistema empieza a pensarse principalmente desde cómo se ve en la base, en vez de desde cómo se comporta en el dominio.**

Por ejemplo:

- una entidad se diseña solo por comodidad del ORM
- una relación se fuerza porque “queda más fácil en la tabla”
- un flujo de negocio se simplifica de una forma artificial para que entre cómodo en cierta estructura
- el lenguaje del sistema se vuelve lenguaje de persistencia
- los casos de uso empiezan a depender de cómo se hace el join y no de qué acción real se quiere resolver

Eso suele traer consecuencias a mediano plazo.

## Ejemplo intuitivo

Supongamos un sistema de órdenes.

Podrías pensar la orden solo como:

- una tabla con columnas
- relaciones con usuario
- relaciones con ítems
- un estado
- timestamps

Eso está bien como parte del almacenamiento.

Pero una orden, desde el dominio, también puede implicar:

- transiciones válidas
- invariantes
- cancelación
- confirmación
- condiciones de pago
- relación con envíos
- eventos internos
- reglas de consistencia

Si tu diseño solo refleja la tabla, todo eso corre riesgo de quedar difuso o disperso.

## La base ve estructura; el dominio ve significado

Esta distinción ayuda mucho.

### Base de datos

Ve cosas como:

- filas
- columnas
- relaciones
- claves
- índices
- restricciones
- queries

### Dominio

Ve cosas como:

- orden
- cancelación
- pago
- confirmación
- reserva
- devolución
- usuario habilitado
- operación válida o inválida

Ambas miradas son necesarias.
El problema aparece cuando la primera borra a la segunda.

## Qué pasa cuando la persistencia domina demasiado

Suelen aparecer síntomas como:

- entidades llenas de detalles del ORM pero pobres en comportamiento
- servicios gigantes que contienen toda la lógica porque las entidades “solo persisten”
- cambios de base que afectan mucho al negocio
- lenguaje del sistema contaminado por criterios de almacenamiento
- dificultad para distinguir qué regla es del dominio y qué detalle es técnico
- pruebas incómodas porque todo depende enseguida de persistencia real
- diseño empujado por conveniencia de query más que por claridad del sistema

## La base de datos importa, pero no debería ser el centro de todas las decisiones

Esto no es una guerra contra la base de datos.

De hecho, una buena base de datos es fundamental.

La idea es otra:

- reconocer su importancia
- sin convertirla en el molde único de todo el backend

Un sistema sano intenta equilibrar:

- expresividad del dominio
- claridad del caso de uso
- realidad técnica de la persistencia
- performance y constraints
- mantenibilidad

No se trata de ignorar la base.
Se trata de no rendirse totalmente ante ella.

## Qué hace bien un repositorio

Un repositorio bien pensado suele aportar cosas como:

- un punto más claro de acceso a persistencia
- mejor separación entre caso de uso y almacenamiento
- lenguaje más cercano al dominio
- menor dispersión de consultas
- menos dependencia directa del ORM en capas altas
- más claridad sobre qué datos necesita realmente un flujo

No hace magia.
Pero puede ordenar bastante el diseño.

## Repositorio no significa “wrapper trivial del ORM”

Este es un error bastante común.

A veces se crea un repositorio que no aporta nada más que repetir métodos genéricos del framework o del ORM sin ninguna intención de diseño.

Por ejemplo, si el repositorio solo es:

- otro archivo con lo mismo
- sin mejor lenguaje
- sin mejor frontera
- sin mejor responsabilidad

entonces quizá no está agregando valor real.

La pregunta útil es:

**¿este repositorio expresa una necesidad del sistema o es solo una capa cosmética?**

## Repositorio como contrato útil

Tiene más sentido cuando el repositorio expresa cosas como:

- obtener una orden por cierta referencia relevante
- guardar cambios importantes de una entidad o agregado
- buscar pendientes que necesitan reconciliación
- obtener operaciones por criterio del dominio

Es decir, cuando su interfaz habla más del sistema y menos de la tecnología.

## Ejemplo conceptual

Compará estas dos ideas:

### Más técnica

- `findAll`
- `save`
- `delete`
- `findById`

### Más cercana al problema

- buscar órdenes pendientes de confirmación
- obtener orden por referencia externa
- guardar cambio de estado relevante
- recuperar pagos que requieren reconciliación

La segunda forma suele acercarse más al lenguaje del caso de uso.

## Cuándo conviene desacoplar más la persistencia

Suele ser especialmente útil cuando:

- el dominio tiene reglas relevantes
- hay varios casos de uso importantes
- querés proteger mejor al núcleo del sistema
- las consultas o escrituras ya tienen intención de negocio
- querés combinar arquitectura por capas o hexagonal con más claridad
- no querés que todo dependa del framework o del ORM

## Cuándo no conviene exagerar

Como siempre, tampoco hace falta sobreactuar.

No todo necesita una abstracción enorme ni una pureza extrema.

Si una parte del sistema es muy simple, a veces una solución más directa puede estar bien.

El objetivo no es volver el código artificialmente complejo.
El objetivo es ganar claridad donde de verdad importa.

## ORM, entidades y realidad práctica

En Java y Spring esto aparece mucho con JPA/Hibernate.

Es fácil que el modelo del sistema termine absorbido por:

- anotaciones
- relaciones perezosas o ansiosas
- conveniencias del mapeo
- estructuras pensadas para el ORM
- decisiones orientadas al framework más que al negocio

Eso no significa que usar ORM esté mal.
Pero sí que conviene preguntarse:

- ¿esta decisión la estoy tomando por el dominio o por el mapeo?
- ¿esta entidad expresa el negocio o solo la tabla?
- ¿esta relación realmente es parte clara del modelo o la hice por comodidad técnica?
- ¿este caso de uso necesita esto así o el ORM me está empujando?

## Persistencia y casos de uso

Los casos de uso necesitan persistencia, sí.
Pero idealmente no deberían pensar demasiado en cómo se guardan las cosas internamente.

Más bien deberían pensar en cosas como:

- qué necesito leer
- qué necesito modificar
- qué estado necesito sostener
- qué criterios importan para este flujo

Y luego usar repositorios o contratos adecuados para lograrlo.

Eso ayuda mucho a que el caso de uso se mantenga más enfocado en la acción del sistema y no tanto en la mecánica técnica.

## Relación con arquitectura hexagonal

Este tema conecta muy fuerte con la lección anterior.

En una mirada hexagonal:

- el núcleo expresa necesidades de persistencia mediante puertos
- los adaptadores concretos resuelven eso con JPA, SQL u otra tecnología

Eso protege bastante al centro del sistema.

No siempre hace falta llevarlo al extremo.
Pero la dirección conceptual es muy valiosa.

## Relación con reglas de negocio e invariantes

Si el dominio tiene invariantes importantes, apoyarse solo en entidades pensadas como reflejo de tabla puede ser insuficiente.

Porque muchas decisiones importantes del sistema no son simplemente:

- columnas
- relaciones
- constraints

también son:

- transiciones válidas
- consistencia de estados
- decisiones del negocio
- restricciones contextuales

Si el modelo está demasiado colonizado por la persistencia, expresar eso se vuelve más difícil.

## Relación con monolito modular

En un monolito modular, este tema también importa mucho.

Porque si todos los módulos acceden a la base de forma difusa, o si las entidades de persistencia se usan como moneda universal por todo el sistema, la modularidad se erosiona.

Los repositorios pueden ayudar a que cada módulo tenga:

- acceso más claro a sus datos
- menos filtración de detalles técnicos
- mejores fronteras internas

## Qué errores comunes aparecen

Algunos muy frecuentes son:

- diseñar todo según comodidad del ORM
- creer que la entidad persistida ya representa perfectamente el dominio
- dejar que cualquier parte consulte o modifique datos sin frontera clara
- usar repositorios como wrappers triviales sin valor real
- llenar el sistema de métodos genéricos sin intención
- acoplar demasiado los casos de uso a la base
- tomar decisiones de negocio por conveniencia de query
- confundir estructura de almacenamiento con modelo conceptual del sistema

## Cómo darte cuenta de que la base domina demasiado tu diseño

Algunas señales:

- hablás más en términos de tablas que de negocio
- un cambio de persistencia te obliga a tocar mucha lógica central
- el sistema parece una proyección del ORM más que del dominio
- cuesta leer un caso de uso sin atravesar detalles de base
- las entidades tienen muchos getters y setters pero poco significado
- las reglas importantes viven afuera, dispersas
- los repositorios no expresan intención, solo operaciones técnicas

## Buenas prácticas iniciales

## 1. Recordar que persistir bien no es lo mismo que modelar bien el dominio

Ambas cosas importan, pero no son idénticas.

## 2. Usar repositorios cuando ayuden a expresar mejor necesidades del sistema

No solo por costumbre.

## 3. Evitar que el caso de uso piense demasiado en detalles técnicos de almacenamiento

Eso mejora claridad del flujo.

## 4. No dejar que el ORM decida por completo el modelo del backend

Sus conveniencias no deberían mandar sobre todo.

## 5. Diseñar contratos de persistencia con algo de lenguaje del dominio

Eso suele ser más valioso que métodos genéricos universales.

## 6. Apoyarte en la base para constraints importantes, pero sin delegar ahí sola toda la expresividad del sistema

La base ayuda, pero no cuenta toda la historia.

## 7. Revisar si tus entidades expresan realmente algo o solo reflejan tablas

Esa pregunta revela bastante.

## Errores comunes

### 1. Diseñar el backend como reflejo directo del esquema relacional

Eso suele empobrecer el dominio.

### 2. Creer que desacoplar persistencia significa ignorar performance o realidad técnica

No.
Hay que equilibrar ambas cosas.

### 3. Crear repositorios que no agregan ninguna claridad real

Eso suma ruido.

### 4. Permitir acceso difuso a la base desde cualquier lugar

La modularidad se debilita mucho.

### 5. Dejar que el ORM contamine demasiado los casos de uso y el dominio

Muy común si no se observa conscientemente.

### 6. Modelar por comodidad técnica lo que debería decidirse por sentido del negocio

Eso se paga más adelante.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué parte de tu modelo actual sentís demasiado diseñada según la base y poco según el dominio?
2. ¿qué repositorio podría expresar mejor una necesidad real del sistema en vez de métodos genéricos?
3. ¿qué caso de uso de tu proyecto actual se ve demasiado contaminado por consultas o detalles de persistencia?
4. ¿qué regla importante del negocio hoy no queda bien reflejada si solo mirás las tablas?
5. ¿qué cambiaría en tu proyecto si el acceso a datos estuviera un poco más ordenado por intención?

## Resumen

En esta lección viste que:

- la persistencia es fundamental, pero no debería dominar por completo el diseño del backend
- modelar demasiado según la base de datos puede empobrecer el dominio y volver más frágiles los casos de uso
- los repositorios pueden ayudar a desacoplar mejor el acceso a datos cuando expresan necesidades reales del sistema
- no se trata de negar la realidad técnica del ORM o de la base, sino de equilibrarla con la expresividad del negocio
- una buena frontera de persistencia ayuda a proteger mejor el núcleo del sistema, los módulos y los casos de uso

## Siguiente tema

Ahora que ya entendés mejor cómo desacoplar razonablemente la persistencia y evitar que la base domine por completo el diseño del backend, el siguiente paso natural es aprender sobre **transacciones, consistencia y límites de una operación de negocio**, porque ahí se vuelve clave decidir qué cosas deben ocurrir juntas, qué puede quedar pendiente y dónde conviene cortar el alcance de una acción.
