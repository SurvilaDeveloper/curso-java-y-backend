---
title: "Índices, planes de ejecución y cómo razonar sobre consultas desde la base"
description: "Cómo pensar los índices, qué muestran los planes de ejecución y por qué aprender a mirar las consultas desde la base de datos ayuda muchísimo a detectar cuellos de botella antes de que el sistema escale mal."
order: 105
module: "Backend escalable y sistemas más grandes"
level: "intermedio"
draft: false
---

## Introducción

Cuando un backend empieza a sufrir por acceso a datos, muchas veces el problema ya no está solo en el código que dispara la consulta.

Empieza a estar también en algo más profundo:

**cómo la base de datos decide ejecutar esa consulta.**

Y ahí aparecen tres ideas fundamentales:

- **índices**
- **planes de ejecución**
- **aprender a razonar desde la base y no solo desde el ORM o desde el código**

Este tema es importantísimo porque muchas queries “parecen normales” cuando las mirás desde Java o desde un repository, pero cambian totalmente cuando las mirás desde la base.

Por ejemplo:

- un filtro simple puede terminar en un scan enorme
- un ordenamiento puede volverse muy costoso
- un join aparentemente inocente puede disparar muchísimo trabajo
- una paginación puede escalar mal
- una búsqueda puede ignorar por completo el índice que esperabas
- una consulta puede volverse lenta solo con cierto volumen o distribución de datos

Si no entendés un poco qué está viendo la base, te queda muy difícil optimizar con criterio.

## Por qué este tema importa tanto

Porque una gran parte del rendimiento real de un backend depende de algo muy concreto:

**qué tan bien se llevan tus consultas con la base de datos real que las ejecuta.**

Y eso no siempre se deduce bien leyendo solo:

- el código Java
- el repository
- la anotación del ORM
- el método del service
- la intuición del desarrollador

Podés escribir una consulta que “se vea bien” en código y que aun así sea pésima para la base.

Por eso aprender a mirar el problema desde abajo suele ser un salto de madurez muy grande.

## Qué es un índice

Un índice es una estructura que ayuda a la base de datos a encontrar o recorrer datos de forma más eficiente para ciertos patrones de consulta.

La idea intuitiva es parecida a un índice de un libro:

- en vez de revisar todas las páginas una por una
- tenés una estructura auxiliar que te acerca más rápido a lo que buscás

En una base, los índices pueden ayudar a cosas como:

- búsquedas por igualdad
- filtros por rango
- ordenamientos
- joins
- combinaciones de filtros
- consultas por claves o campos muy usados

## Qué problema resuelve un índice

Sin índice, muchas consultas obligan a la base a revisar mucho más dato del necesario.

Por ejemplo:

- recorrer todas las filas de una tabla
- ordenar una gran cantidad de datos en memoria o en disco
- filtrar tarde
- hacer joins costosos sin acceso eficiente

Un índice no resuelve todo, pero muchas veces reduce muchísimo el trabajo necesario.

## Qué NO es un índice

No es magia.

No significa que:

- cualquier consulta será rápida
- cuantos más índices, mejor
- toda columna merece índice
- la base siempre elegirá el índice que imaginaste
- el ORM “ya se encarga”

Los índices ayudan mucho, pero también tienen costo y límites.

## El costo de un índice

Esto es importante.

Un índice no es gratis.

Agregar índices puede impactar en:

- espacio en disco
- costo de escritura
- updates
- inserts
- deletes
- mantenimiento
- complejidad del modelo

¿Por qué?

Porque cada vez que cambian ciertos datos, la base también tiene que mantener actualizados esos índices.

Por eso no conviene pensar:

- “siempre agreguemos índices a todo”

Hay que pensar en el patrón real de acceso.

## Qué tipos de consultas suelen beneficiarse mucho

Por ejemplo:

- búsquedas por `id`
- búsquedas por campos únicos o muy consultados
- filtros frecuentes por `status`, `createdAt`, `userId`, etc.
- joins por claves relevantes
- combinaciones frecuentes de filtros
- ordenamientos sobre campos consultados mucho
- paginaciones basadas en columnas concretas

Pero siempre depende del uso real y del motor de base.

## Qué pasa cuando falta un índice importante

Suelen aparecer síntomas como:

- consultas que tardan demasiado
- latencia que empeora mucho al crecer la tabla
- scans completos innecesarios
- picos de CPU o I/O en la base
- endpoints que escalan mal con volumen
- jobs o reportes que se vuelven lentísimos
- filtros aparentemente simples que hacen trabajar muchísimo al sistema

Muchas veces, un índice razonable cambia muchísimo el resultado.

## Qué pasa cuando hay índices mal pensados

También puede haber problemas del otro lado.

Por ejemplo:

- demasiados índices sobre escrituras intensas
- índices en columnas casi inútiles
- índices que no ayudan al patrón real
- confiar en un índice que la consulta no termina usando
- creer que existe cobertura cuando la consulta real pide otra cosa
- índices redundantes o desalineados con el acceso real

O sea:
tener índices tampoco garantiza que el diseño esté bien.

## Qué es un plan de ejecución

Un plan de ejecución es la forma en que la base de datos explica o determina cómo va a resolver una consulta.

Dicho más simple:

es como el “plan de ataque” de la base para responder esa query.

Por ejemplo, puede mostrar cosas como:

- si va a usar un índice o no
- si va a hacer un scan completo
- qué join va a usar
- en qué orden va a procesar tablas
- si va a ordenar
- si va a filtrar temprano o tarde
- cuánto estima que costará cada paso

Leer un plan de ejecución ayuda muchísimo a dejar de adivinar.

## Por qué el plan de ejecución importa tanto

Porque dos consultas que a simple vista parecen parecidas pueden ejecutarse de formas muy distintas.

Y una misma consulta puede cambiar de comportamiento según:

- volumen de datos
- índices disponibles
- selectividad de filtros
- estadísticas de la base
- forma exacta del predicado
- combinación de joins y ordenamientos

El plan de ejecución te muestra qué está viendo la base realmente.

## Ejemplo intuitivo

Supongamos que tenés una tabla de órdenes enorme.

Hacés una consulta por:

- `status = 'PENDING'`
- ordenada por `created_at`

A simple vista puede parecer trivial.

Pero la base puede decidir cosas muy distintas:

- usar un índice útil
- hacer un scan completo
- filtrar una gran cantidad de filas
- ordenar después
- combinar varias estrategias

Sin mirar el plan, es muy fácil equivocarte sobre dónde está el problema real.

## Scan completo vs acceso por índice

Una distinción muy importante.

### Scan completo

La base recorre toda la tabla o una parte muy grande para encontrar lo necesario.

A veces eso es inevitable.
Otras veces es una mala señal.

### Acceso por índice

La base usa la estructura auxiliar para acotar mucho más rápido qué filas o rangos necesita.

No siempre el acceso por índice es obligatorio ni siempre conviene.
Pero muchas veces hace una diferencia enorme.

## No toda consulta lenta necesita un índice

Este punto también es clave.

A veces el problema no es “falta un índice”.

Puede ser:

- la consulta pide demasiados datos
- hay joins innecesarios
- el filtro no es selectivo
- la paginación es mala
- el ordenamiento es costoso
- el volumen es muy grande y la estrategia de lectura es incorrecta
- el patrón de acceso no tiene sentido para ese caso
- el reporte debería resolverse de otra forma

Por eso aprender a mirar el plan ayuda a no caer en la obsesión de “más índices para todo”.

## Selectividad

Una idea muy útil al pensar índices es la selectividad.

En términos simples:

- cuánto reduce realmente el conjunto de datos un filtro

Por ejemplo, no es lo mismo filtrar por:

- `id = 123`
- que por `activo = true` cuando casi toda la tabla está activa

Cuanto más específico y útil sea el filtro para reducir filas, más valor suele tener un índice en ese contexto.

## Índices compuestos

A veces una consulta no filtra solo por una columna, sino por varias.

Por ejemplo:

- `user_id`
- `status`
- `created_at`

En esos casos, puede importar mucho pensar índices compuestos o combinados que acompañen mejor el patrón real de consulta.

No alcanza siempre con tener índices sueltos en columnas aisladas.
Depende mucho del acceso.

## Orden de columnas en un índice

Este es un punto más técnico, pero muy importante conceptualmente:

en un índice compuesto, el orden de las columnas suele importar.

¿Por qué?

Porque el patrón real de consulta puede aprovechar mejor o peor ese índice según:

- cómo filtra
- cómo ordena
- en qué secuencia usa esas columnas

No hace falta profundizar ahora en detalles de motores específicos.
Lo importante es entender que “tener las columnas” no siempre es lo mismo que “tener el índice correcto”.

## Plan de ejecución y estimaciones

Los planes de ejecución suelen incluir estimaciones de costo y cantidad de filas.

Eso sirve mucho para pensar:

- si la base está esperando pocas o muchas filas
- si cree que un índice será útil o no
- si la estrategia elegida tiene sentido
- si una parte del plan está claramente dominando el costo

No siempre la estimación es perfecta.
Pero ya da muchísima información valiosa.

## Qué cosas conviene mirar en un plan

Sin entrar en detalles específicos de un motor concreto, en general ayuda mirar:

- si hay scans completos
- si se usan índices o no
- qué joins aparecen
- si hay ordenamientos costosos
- cuántas filas se estiman en cada paso
- qué parte parece concentrar el mayor costo
- si la consulta crece de forma razonable o explosiva

Aprender a hacerse esas preguntas ya mejora muchísimo el diagnóstico.

## El ORM no reemplaza entender la base

Otra idea clave.

Usar JPA, Hibernate o cualquier ORM puede ayudar a desarrollar más rápido.
Pero no reemplaza entender cómo la base está resolviendo las consultas reales.

A veces el repository se ve elegante.
Pero por debajo:

- hace joins inesperados
- trae demasiado
- ignora índices
- dispara scans
- resuelve paginación costosa
- crea un acceso mucho más caro del que parecía

Por eso, cuando el rendimiento importa, hay que mirar más abajo.

## Ejemplo con paginación

Supongamos una tabla muy grande y una consulta paginada.

A simple vista puede parecer:
“estamos trayendo solo 20 registros”.

Pero la base igual puede estar haciendo muchísimo trabajo si:

- el ordenamiento es caro
- el filtro no está bien acompañado por índice
- la paginación requiere saltarse muchísimas filas
- la combinación de `WHERE` y `ORDER BY` no está bien resuelta

Eso muestra que “poquitos resultados” no siempre significa “consulta barata”.

## Ejemplo con reportes o dashboards

Otro caso muy común.

Un dashboard puede pedir:

- conteos
- agrupaciones
- filtros por fecha
- métricas por estado
- joins con varias tablas

Visualmente parece una pantalla simple.
Pero la carga sobre la base puede ser muy alta si las consultas están mal planteadas o no tienen buen soporte de índices.

## Cuándo conviene sospechar de índices o planes

Por ejemplo, cuando:

- un endpoint escala mal con el volumen
- una query tarda mucho más en producción que en local
- la base usa mucho CPU o I/O
- aparecen scans donde no los esperabas
- un filtro simple tarda demasiado
- ordenar o paginar se vuelve caro
- ciertos jobs se vuelven lentísimos al crecer la tabla
- un reporte castiga demasiado a la base

## Índices y escrituras

También hay que recordar algo importante:

cada índice que ayuda a leer también puede encarecer escrituras.

Entonces, en sistemas con muchas inserciones o actualizaciones, conviene pensar bien:

- qué índices realmente valen la pena
- qué lectura justifica ese costo
- qué consultas son críticas
- si hay índices obsoletos o redundantes
- cómo equilibrar lectura y escritura según el negocio

## Qué errores comunes aparecen

Algunos muy frecuentes son:

- agregar índices sin entender el patrón de acceso
- no revisar planes de ejecución
- culpar al ORM o al lenguaje sin mirar SQL real
- asumir que “una query simple” es barata
- ignorar el orden de columnas en índices compuestos
- pensar solo en lecturas y olvidarse del costo en escrituras
- no mirar selectividad
- optimizar a ciegas sin saber si la base usa o no lo que creaste

## Qué NO hacer primero

Si tenés una consulta lenta, muchas veces no conviene empezar por:

- agregar índices al azar
- reescribir todo el módulo
- echarle la culpa a la infraestructura
- partir a microservicios
- meter caché inmediatamente
- tunear la JVM
- cambiar de ORM

Primero conviene entender:

- qué hace realmente la consulta
- cómo la ejecuta la base
- si el problema es cantidad de filas, falta de índice, join, ordenamiento, selectividad o diseño

## Qué sí conviene hacer primero

Suele ser mejor empezar por:

- identificar la consulta problemática
- medir cuánto tarda
- revisar su plan de ejecución
- ver si usa índice o scan
- revisar volumen, filtros y ordenamientos
- entender si el patrón de acceso tiene sentido
- recién después decidir si conviene tocar query, índice, modelo o flujo

## Relación con N+1 y acceso ineficiente

Este tema conecta muy fuerte con la lección anterior.

Porque una parte del problema puede ser:

- demasiadas queries

pero otra parte puede ser:

- una consulta mala o mal soportada por la base

Ambas cosas importan.

No alcanza con decir:
“evitemos N+1”.
También hace falta aprender a pensar:
“¿cómo está ejecutando la base lo que sí le pedimos?”

## Relación con rendimiento general

Muchísimos cuellos de botella de backend vienen de consultas que:

- parecían normales
- pero no escalan bien

Entender índices y planes de ejecución suele ser una de las mejoras más rentables para un desarrollador backend que quiere subir de nivel.

## Buenas prácticas iniciales

## 1. Pensar los índices según patrones reales de consulta

No ponerlos por costumbre ni intuición vaga.

## 2. Revisar planes de ejecución en queries importantes o lentas

Eso da información muchísimo más concreta.

## 3. Mirar si la base está haciendo scans, joins u ordenamientos costosos

Ahí suelen esconderse muchos problemas.

## 4. Recordar que una consulta “simple” en código puede ser costosa en la base

Nunca asumirlo sin mirar.

## 5. Considerar selectividad, volumen y orden de columnas

Especialmente en filtros y ordenamientos importantes.

## 6. Equilibrar mejora de lectura con costo de escritura

Los índices también se pagan.

## 7. Aprender a razonar desde SQL y desde la base, no solo desde el ORM

Eso da mucha más potencia de diagnóstico.

## Errores comunes

### 1. Agregar índices al azar

Eso puede ayudar poco y costar bastante.

### 2. No mirar el plan de ejecución nunca

Entonces se optimiza casi a ciegas.

### 3. Confiar demasiado en la intuición del código

La base puede estar viendo otra realidad.

### 4. Ignorar el costo en escrituras

No todo es lectura.

### 5. Pensar que el problema siempre es “falta de índice”

A veces el problema es el diseño de la consulta o del flujo.

### 6. Querer resolver con caché lo que primero debería entenderse en la base

Eso puede esconder el problema sin solucionarlo bien.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué consulta de tu proyecto actual te gustaría poder mirar con plan de ejecución?
2. ¿qué filtro u ordenamiento sospechás que hoy podría necesitar mejor soporte de índice?
3. ¿qué query “simple” en código quizá sea mucho más cara en la base de lo que parece?
4. ¿qué costo extra podría tener agregar muchos índices en una tabla de escrituras frecuentes?
5. ¿qué cambiaría en tu forma de optimizar si empezás a mirar más la base y menos solo el repository?

## Resumen

En esta lección viste que:

- los índices ayudan a que la base encuentre o recorra datos de forma más eficiente para ciertos patrones de acceso
- no son magia ni son gratis: también tienen costo en escrituras y mantenimiento
- los planes de ejecución muestran cómo la base decide resolver una consulta y son una herramienta clave para diagnosticar rendimiento
- muchas queries que parecen normales desde el código pueden ser malas desde la base
- aprender a mirar scans, uso de índices, joins, ordenamientos y estimaciones te vuelve mucho más preciso para optimizar
- este tema complementa muy bien la detección de N+1 y acceso ineficiente, porque no solo importa cuántas queries hacés, sino también cómo se ejecutan las que sí hacés

## Siguiente tema

Ahora que ya entendés mejor qué hacen los índices, cómo mirar un plan de ejecución y por qué una consulta puede comportarse muy distinto en la base que en el código, el siguiente paso natural es aprender sobre **caché: cuándo ayuda, cuándo complica y qué problemas sí vale la pena cachear**, porque muchas veces, después de mejorar consultas y acceso a datos, aparece la pregunta de qué conviene seguir resolviendo desde origen y qué conviene servir más cerca.
