---
title: "Agregados, raíces de agregado y consistencia local del dominio"
description: "Qué son los agregados y las raíces de agregado, por qué ayudan a decidir límites de consistencia dentro del dominio y cómo pensar mejor qué cosas deben mantenerse juntas sin mezclar todo el sistema."
order: 101
module: "Arquitectura y organización del backend"
level: "intermedio"
draft: false
---

## Introducción

Cuando un backend empieza a expresar mejor su dominio, sus invariantes y sus transacciones, aparece una pregunta muy importante:

**¿qué cosas deberían tratarse como una unidad coherente dentro del modelo?**

No siempre conviene pensar el sistema solo como:

- tablas relacionadas
- entidades sueltas
- listas de objetos
- servicios que tocan cualquier cosa

A veces hace falta una unidad conceptual más fuerte que ayude a responder preguntas como:

- ¿qué cosas deben mantenerse consistentes entre sí?
- ¿qué cambios deberían pasar juntos?
- ¿qué parte del dominio debería proteger ciertas invariantes?
- ¿desde dónde se debería modificar cierto conjunto de datos?
- ¿qué cosas están demasiado mezcladas y cuáles deberían tener frontera?

Ahí aparecen tres ideas muy importantes:

- **agregados**
- **raíces de agregado**
- **consistencia local del dominio**

Este tema es muy valioso porque ayuda a pasar de una mirada de “objetos relacionados” a una mirada de **límites de consistencia y comportamiento**.

## Qué es un agregado

Un agregado es un conjunto de objetos del dominio que conviene tratar como una unidad de consistencia dentro del sistema.

Dicho más simple:

**es una frontera dentro del modelo donde ciertas cosas deben mantenerse coherentes entre sí y suelen modificarse bajo una autoridad más clara.**

Un agregado no es simplemente “todo lo que está relacionado”.
Tampoco es “todo lo que está cerca en la base”.

Es una decisión de modelado sobre:

- qué cosas forman una unidad razonable
- qué invariantes deben protegerse juntas
- qué cambios deberían entrar por un punto principal
- qué consistencia es local a esa parte del dominio

## Qué es una raíz de agregado

La raíz de agregado es la entidad principal que actúa como punto de entrada o referencia externa hacia ese agregado.

Es decir:

- desde afuera, el agregado se trata a través de su raíz
- la raíz ayuda a proteger reglas internas
- la raíz representa la identidad principal de esa unidad

Por ejemplo, si una orden y sus ítems forman una unidad coherente, muchas veces la orden podría ser la raíz.

La idea es que no cualquier parte del sistema modifique arbitrariamente cosas internas sin pasar por una frontera más clara.

## Qué significa consistencia local del dominio

La consistencia local del dominio es la coherencia que querés proteger dentro de los límites de un agregado o de una unidad concreta del modelo.

No significa que todo el sistema deba mantenerse instantáneamente consistente en cada rincón al mismo tiempo.

Significa más bien:

**dentro de esta unidad, ciertas reglas no deberían romperse.**

Por ejemplo:

- una orden y sus ítems esenciales deberían mantener cierto total válido
- una reserva no debería existir con cantidades contradictorias
- una suscripción no debería quedar simultáneamente en estados incompatibles
- un carrito no debería reflejar una estructura imposible según sus propias reglas

Esto ayuda a decidir dónde sí exigir consistencia fuerte y dónde aceptar algo más eventual.

## Por qué este tema importa tanto

Porque muchos sistemas sufren por dos extremos.

### Extremo 1: todo suelto

Cualquier parte modifica cualquier entidad relacionada sin una frontera clara.

Eso genera:

- invariantes frágiles
- reglas dispersas
- acoplamiento
- mutaciones peligrosas
- dificultad para saber dónde se protege qué

### Extremo 2: agregados gigantes

Se mete demasiado dentro de una sola unidad conceptual.

Eso puede generar:

- objetos enormes
- demasiada contención
- transacciones demasiado grandes
- dificultad para escalar o evolucionar
- exceso de acoplamiento interno

El diseño de agregados busca un equilibrio mejor.

## Un agregado no es lo mismo que una tabla ni que un grafo completo

Este punto es muy importante.

En modelos basados en ORM o base relacional, es muy fácil pensar:

- “si hay relación, todo pertenece junto”
- “si una tabla referencia a otra, eso debe ser parte del mismo agregado”
- “si se puede navegar, entonces todo es una sola unidad”

Eso no necesariamente es cierto.

Los agregados no se definen solo por relaciones técnicas.
Se definen más bien por:

- invariantes
- consistencia
- autoridad del cambio
- límites razonables del dominio

## Ejemplo intuitivo

Supongamos una orden.

Podrías pensar que dentro de una misma unidad coherente viven cosas como:

- la orden
- sus ítems
- su estado principal
- ciertos totales o condiciones internas relevantes

Pero quizá no convenga meter en ese mismo agregado, como si fuera una sola unidad indivisible:

- el usuario completo
- todo el inventario afectado
- el historial entero de pagos externos
- el sistema logístico
- las notificaciones
- métricas analíticas

Aunque estén relacionados, no necesariamente forman una única unidad de consistencia local.

## Qué problema intenta resolver un agregado

Intenta ayudar a responder:

- dónde se protegen ciertas invariantes
- desde dónde conviene modificar algo
- qué cambios deben quedar juntos
- qué parte del modelo tiene una frontera más clara
- qué no debería tocarse arbitrariamente desde cualquier lado

En otras palabras, ayuda a volver el dominio más gobernable.

## Ejemplo con orden e ítems

Imaginemos una orden con ítems.

Podría tener sentido que ciertas reglas se protejan dentro de una misma unidad:

- una orden no puede quedar sin sentido respecto a sus ítems
- el total no debería contradecir lineamientos internos válidos
- ciertas transiciones del estado de la orden dependen de su propio contenido
- los ítems no deberían mutarse arbitrariamente desde cualquier lado sin pasar por una autoridad coherente

Ahí la orden puede funcionar como raíz del agregado.

## La raíz protege el acceso

La idea de la raíz no es decorar el modelo.
Es proteger mejor la coherencia.

Desde afuera, otras partes del sistema deberían relacionarse principalmente con la raíz del agregado, en vez de modificar directamente cualquier parte interna como si no existieran límites.

Eso ayuda a que:

- las reglas tengan un punto más claro de protección
- el flujo de cambios sea más sano
- el agregado no quede abierto por todos lados

## Por qué esto mejora el diseño

Porque obliga a pensar preguntas muy sanas:

- ¿quién debería poder cambiar esto?
- ¿qué cosas deben cambiar juntas?
- ¿qué regla se protege acá?
- ¿de verdad esto pertenece a la misma unidad?
- ¿estoy metiendo demasiado dentro del mismo agregado?
- ¿estoy dejando demasiado suelto afuera?

Esas preguntas mejoran mucho la calidad del modelo.

## Agregado no significa “objeto enorme”

Este error es bastante común.

Mucha gente, cuando descubre la idea, empieza a meter demasiadas cosas dentro de una misma unidad, como si cuanto más grande el agregado, más “correcto” fuera.

Pero no.

Un agregado demasiado grande puede traer problemas como:

- demasiada carga conceptual
- demasiadas reglas mezcladas
- más acoplamiento
- mayor contención transaccional
- necesidad de cargar demasiado estado
- dificultad para mantenerlo

La clave no es agrandar.
La clave es **delimitar con sentido**.

## Agregado y transacción

Este tema conecta muy fuerte con la lección anterior.

Muchas veces, un agregado ayuda a pensar cuál es una unidad razonable de consistencia fuerte dentro de una transacción local.

Es decir:

- dentro del agregado querés proteger ciertas invariantes juntas
- fuera de ese agregado, otras cosas quizá se resuelven con coordinación, eventos o consistencia eventual

No siempre es exacto ni mecánico.
Pero la relación conceptual es muy útil.

## Agregado y consistencia eventual

No todo lo que se relaciona en el negocio tiene que vivir en el mismo agregado.

A veces dos agregados distintos se conectan de forma más laxa y convergen a través de:

- eventos internos
- coordinación de casos de uso
- procesos posteriores
- reconciliación
- consistencia eventual

Eso suele ser mucho más sano que intentar hacer una mega unidad transaccional de todo.

## Ejemplo con orden y pago

Una orden y un pago claramente están relacionados.

Pero eso no significa automáticamente que deban formar el mismo agregado gigantesco.

A veces conviene que:

- la orden sea una unidad coherente con sus propias reglas
- el pago sea otra unidad con su propio ciclo
- y ambos se coordinen mediante estados, referencias, eventos o casos de uso

Eso puede dar un diseño mucho más sano.

## El agregado protege invariantes, no relaciones arbitrarias

Otra forma muy útil de pensarlo es esta:

no agrupás cosas solo porque “se hablan” o “están relacionadas”.

Las agrupás cuando tiene sentido proteger ciertas invariantes dentro de un mismo límite.

Si no hay una invariante fuerte compartida, quizás no haga falta que vivan en el mismo agregado.

## Qué preguntas ayudan a detectar un agregado razonable

Por ejemplo:

- ¿qué cosas deben ser consistentes juntas?
- ¿qué cambios deberían pasar a través de una misma autoridad?
- ¿qué parte del modelo tiene reglas propias y bien definidas?
- ¿qué cosas no deberían mutarse desde cualquier lado?
- ¿qué contradicción sería grave dentro de esta unidad?
- ¿estoy agrupando por negocio o solo por comodidad técnica?

Estas preguntas ayudan mucho más que mirar solo el esquema relacional.

## Qué señales muestran un agregado mal delimitado

Algunas señales:

- cualquier parte cambia cualquier cosa del modelo
- no está claro quién protege una regla importante
- el agregado parece una bolsa gigante de conceptos distintos
- la raíz casi no aporta nada
- el cambio de una parte obliga a cargar demasiadas otras
- las transacciones se vuelven enormes
- reglas que deberían ser locales terminan dispersas
- o, al revés, demasiadas cosas quedan sueltas sin un centro claro

## Agregados y repositorios

Esto conecta con la persistencia desacoplada.

Muchas veces, si pensás bien un agregado, el repositorio tiene más sentido cuando trabaja alrededor de esa unidad.

Por ejemplo:

- recuperar una orden como unidad coherente de trabajo
- persistir cambios relevantes sobre esa raíz
- no tratar cada detalle interno como si fuera totalmente independiente desde afuera

Eso vuelve más consistente la relación entre dominio y persistencia.

## Agregado y casos de uso

Los casos de uso suelen interactuar con agregados para:

- cargar el estado necesario
- ejecutar una operación válida
- dejar la unidad en un estado coherente
- persistir cambios
- luego coordinar otros pasos si hace falta

Eso es mucho más sano que tener casos de uso que mutan pedazos dispersos sin una frontera clara.

## Agregado y eventos internos

Cuando cambia algo importante dentro de un agregado, puede surgir un hecho relevante del dominio.

Por ejemplo:

- `OrderCancelled`
- `PaymentConfirmed`
- `StockReservationExpired`

Eso no significa que el agregado “haga todo”.
Puede dejar su parte coherente y luego el sistema reaccionar alrededor.

Esta relación entre:

- consistencia local fuerte
- y reacciones más desacopladas

es muy poderosa.

## No hace falta obsesionarse con pureza absoluta

Como siempre, no se trata de convertir esto en religión.

No hace falta:

- discutir horas por cada entidad mínima
- transformar todo en teoría rígida
- forzar agregados artificiosos
- hacer el modelo imposible de trabajar

Lo importante es usar la idea para mejorar decisiones reales de diseño.

## Qué errores comunes aparecen

Algunos muy frecuentes son:

- confundir agregado con grafo de relaciones completo
- meter demasiadas cosas juntas
- dejar demasiadas cosas completamente sueltas
- no tener una raíz que proteja nada realmente
- diseñar según el ORM en vez de según invariantes
- usar la palabra “agregado” pero seguir permitiendo mutaciones arbitrarias por todos lados
- no distinguir consistencia local de coordinación entre partes

## Cómo darte cuenta de que esta idea te ayudaría

Algunas señales:

- no sabés bien dónde proteger ciertas invariantes
- varias partes del sistema mutan la misma cosa de formas desordenadas
- el modelo está demasiado guiado por la base
- te cuesta decidir qué debería quedar junto en una transacción
- tus entidades son o demasiado anémicas o demasiado gigantes
- no está claro qué unidad representa una operación coherente del dominio

## Buenas prácticas iniciales

## 1. Pensar agregados como límites de consistencia, no como conjuntos de relaciones técnicas

Eso cambia mucho la calidad del modelado.

## 2. Usar una raíz de agregado como punto de entrada más claro

Ayuda a proteger mejor reglas e invariantes.

## 3. No meter todo lo relacionado en el mismo agregado

La relación no implica misma unidad.

## 4. Preguntarte qué cosas realmente deben mantenerse coherentes juntas

Esa pregunta suele orientar bien el diseño.

## 5. Dejar que otras partes se coordinen mediante casos de uso, eventos o consistencia eventual cuando tenga más sentido

No todo debe ser localmente fuerte al mismo tiempo.

## 6. Revisar si tus límites están guiados por negocio o solo por el ORM

Muy importante.

## 7. Usar esta idea para mejorar claridad, no para agregar jerga vacía

La utilidad práctica es lo que importa.

## Errores comunes

### 1. Convertir cualquier relación entre entidades en un solo agregado

Eso suele inflarlo demasiado.

### 2. Diseñar agregados según la base y no según las invariantes

Muy habitual.

### 3. Tener raíces de agregado que no protegen nada realmente

Entonces la frontera es más decorativa que útil.

### 4. Tratar objetos internos como si fueran totalmente libres desde cualquier parte

Eso debilita consistencia local.

### 5. Usar agregados como excusa para cargar medio sistema en cada operación

Pésima señal.

### 6. Volver esto una teoría rígida sin conexión con el problema real

Eso también le quita valor.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué parte de tu sistema actual parece necesitar una unidad de consistencia más clara?
2. ¿qué entidad podría actuar como raíz de esa unidad?
3. ¿qué cosas hoy están demasiado juntas dentro de un mismo modelo y quizá no deberían?
4. ¿qué invariantes importantes te ayudaría proteger mejor si pensás en agregados?
5. ¿qué relación de tu sistema hoy parece fuerte en negocio y cuál solo es cercanía técnica de base de datos?

## Resumen

En esta lección viste que:

- un agregado es una unidad del dominio que conviene tratar como límite de consistencia local
- una raíz de agregado es el punto principal de acceso y protección de esa unidad
- los agregados ayudan a decidir qué cosas deben mantenerse coherentes juntas y qué cosas pueden coordinarse de otra manera
- no se definen solo por relaciones técnicas o tablas, sino por invariantes, reglas y autoridad del cambio
- esta idea se relaciona fuertemente con transacciones, casos de uso, persistencia desacoplada y eventos internos
- pensar agregados con criterio puede hacer que el backend exprese mejor su dominio sin mezclar todo indiscriminadamente

## Siguiente tema

Ahora que ya entendés mejor qué son los agregados, las raíces de agregado y cómo ayudan a decidir límites de consistencia local dentro del dominio, el siguiente paso natural es aprender sobre **cierre de etapa: arquitectura interna sana para backends reales**, porque ahí se juntan módulos, casos de uso, reglas, puertos, persistencia y consistencia en una visión más completa y práctica.
