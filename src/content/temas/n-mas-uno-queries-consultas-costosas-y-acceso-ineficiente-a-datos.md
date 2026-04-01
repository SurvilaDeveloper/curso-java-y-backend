---
title: "N+1 queries, consultas costosas y acceso ineficiente a datos"
description: "Cómo detectar y entender problemas de acceso a datos que degradan mucho el rendimiento, por qué el patrón N+1 es tan peligroso y qué decisiones de modelado y consulta ayudan a que la base no se vuelva un cuello de botella prematuro."
order: 104
module: "Backend escalable y sistemas más grandes"
level: "intermedio"
draft: false
---

## Introducción

En muchísimos backends reales, el primer gran límite cuando el sistema empieza a crecer no está en el lenguaje, ni en el servidor, ni en la cantidad de clases.

Suele estar en algo mucho más concreto:

**cómo se accede a los datos.**

Y dentro de ese problema, hay un patrón particularmente famoso y peligroso:

**el N+1.**

A simple vista, muchas veces no se nota.
El sistema “anda”.
Los endpoints responden.
Los tests pasan.
En local parece todo razonable.

Pero cuando el volumen crece, ese tipo de acceso a datos empieza a mostrar su costo real:

- demasiadas consultas
- latencias acumuladas
- carga innecesaria sobre la base
- respuestas cada vez más lentas
- escalado pobre
- dificultad para entender por qué algo aparentemente simple tarda tanto

En esta lección vamos a trabajar tres ideas muy importantes:

- **N+1 queries**
- **consultas costosas**
- **acceso ineficiente a datos**

## Por qué este tema importa tanto

Porque la base de datos suele ser uno de los primeros lugares donde un sistema grande empieza a sufrir.

Y no solo por falta de infraestructura.

Muchas veces el problema es que el backend le pide los datos de una forma poco inteligente o demasiado costosa.

Por ejemplo:

- hace demasiadas consultas pequeñas
- trae más información de la que necesita
- resuelve relaciones en cascada sin control
- dispara consultas repetidas
- filtra en memoria lo que debería filtrar en base
- pagina mal
- hace joins o agregaciones innecesariamente pesadas
- usa el ORM de forma cómoda pero ineficiente

Y todo eso se acumula muy rápido bajo carga.

## Qué es el problema N+1

El problema N+1 aparece cuando el sistema hace:

- una consulta inicial para obtener una lista de elementos
- y luego una consulta adicional por cada uno de esos elementos

Es decir:

- 1 consulta para obtener N registros
- más N consultas para obtener datos relacionados
- total: N+1 consultas

Por eso se llama así.

## Ejemplo intuitivo

Supongamos que querés listar órdenes con su cliente.

Tu backend hace algo como:

1. consultar 100 órdenes
2. por cada orden, consultar el cliente asociado

Entonces terminás con:

- 1 consulta para órdenes
- 100 consultas para clientes

Total:
**101 consultas** para resolver algo que conceptualmente parecía “un listado”.

Eso es un clásico N+1.

## Por qué esto es tan peligroso

Porque al principio puede no doler mucho.

Si tenés:

- 3 registros
- 5 registros
- base local rápida
- poca latencia

quizá ni lo notes.

Pero cuando pasás a:

- 100 registros
- 500 registros
- más concurrencia
- más relaciones
- tráfico real

el costo explota.

Y lo peor es que a veces el endpoint no parece complejo.
Solo “lista cosas”.

Por eso el N+1 suele ser tan traicionero.

## Dónde aparece mucho

Aparece muchísimo en sistemas que usan ORM, relaciones navegables y carga diferida o cómoda sin observar bien qué queries se están ejecutando.

Por ejemplo:

- órdenes y clientes
- órdenes e ítems
- productos y categorías
- usuarios y roles
- posts y comentarios
- entidades con varias relaciones
- listados administrativos
- exportaciones
- serialización de respuestas que tocan relaciones sin querer

Es decir:
aparece en lugares muy comunes.

## El ORM ayuda, pero también puede esconder el problema

Este tema aparece muchísimo con JPA/Hibernate y herramientas similares.

El ORM hace muy fácil escribir algo que conceptualmente se ve limpio:

- obtener entidades
- recorrerlas
- acceder a relaciones
- serializar respuesta

Pero esa comodidad puede esconder un detalle muy importante:

**cada acceso a una relación puede disparar nuevas consultas.**

Entonces, a nivel de código, el flujo parece simple.
Pero a nivel de base, la cantidad de queries puede crecer muchísimo.

## Lazy loading y costo invisible

Uno de los motivos por los que el N+1 sorprende tanto es que muchas veces el acceso costoso no está explícito.

Por ejemplo:

- recorres una lista
- tocás una propiedad relacionada
- el ORM hace otra query
- repetís eso muchas veces
- sin darte cuenta ya multiplicaste el tráfico a la base

Eso vuelve muy importante observar no solo el código Java o TypeScript, sino **qué está pasando realmente en SQL o en acceso a datos**.

## N+1 no siempre es solo una relación

A veces el problema es todavía peor.

Puede pasar algo como:

- 1 consulta de órdenes
- N consultas de clientes
- N consultas de ítems
- N consultas de pagos
- N consultas de estado logístico

Y entonces el endpoint no tiene N+1, sino algo todavía más explosivo.

Por eso conviene mirar el patrón de acceso completo, no solo una relación aislada.

## Consultas costosas

Más allá del N+1, también hay consultas que son costosas por su propia naturaleza.

Por ejemplo:

- joins muy pesados
- agregaciones grandes
- filtros sin índices adecuados
- scans completos innecesarios
- ordenamientos caros
- búsquedas poco selectivas
- subconsultas mal planteadas
- consultas sobre tablas enormes sin criterio
- paginación profunda ineficiente
- reportes ejecutados como si fueran lecturas triviales

No todo problema de base es N+1.
A veces la query en sí ya es el cuello.

## Acceso ineficiente a datos

Este concepto es más amplio.

Acceso ineficiente significa cualquier forma de pedir datos que hace trabajar de más al sistema o a la base sin necesidad.

Por ejemplo:

- traer columnas que no necesitás
- cargar entidades enteras para una lectura mínima
- hacer muchas consultas pequeñas donde una mejor estrategia alcanzaba
- filtrar en memoria en vez de filtrar en base
- recorrer listas enormes cuando el problema pedía una consulta específica
- recalcular o reconsultar datos repetidos
- serializar estructuras enormes innecesariamente

No siempre hace falta una query “rota” para tener ineficiencia.
A veces la ineficiencia está en cómo se planteó el acceso.

## Ejemplo conceptual

Supongamos una pantalla administrativa que lista órdenes con:

- número
- fecha
- total
- cliente
- estado
- cantidad de ítems

Una implementación ingenua podría:

- traer la orden completa
- tocar el cliente
- recorrer los ítems
- calcular en memoria
- tocar otras relaciones
- repetir eso por cada fila del listado

Eso puede generar un acceso muchísimo más caro de lo que el caso realmente necesitaba.

Tal vez el problema pedía más bien:

- una lectura optimizada
- con exactamente los datos necesarios
- y no navegar todo el modelo completo para una lista

## Cuándo duele más

El acceso ineficiente a datos duele especialmente cuando hay:

- listados grandes
- endpoints muy usados
- alta concurrencia
- tablas grandes
- relaciones múltiples
- paneles administrativos
- reportes
- exportaciones
- endpoints que parecen simples pero se usan mucho
- respuestas enriquecidas con demasiada información

Es decir:
en zonas muy normales del backend.

## Señales de que podés tener N+1 o acceso ineficiente

Algunas pistas típicas son:

- un endpoint “simple” tarda demasiado
- la latencia crece raro al aumentar la cantidad de registros
- el uso de base sube mucho con listados
- aparecen muchas queries en logs
- la base trabaja demasiado aunque el negocio no parezca complejo
- serializar una respuesta dispara consultas inesperadas
- el rendimiento empeora mucho entre 10 y 100 registros
- ciertos listados administrativos se vuelven lentísimos

## El problema de “traer todo por comodidad”

Otro patrón muy común es este:

- “traigo la entidad completa por si acaso”
- “después veo qué campos uso”
- “me llevo todo y filtro en código”
- “cargamos relaciones por si el frontend las necesita”

Eso puede ser cómodo para escribir rápido.
Pero muy caro para operar.

En sistemas que crecen, traer de más casi siempre termina costando:

- memoria
- tiempo
- I/O
- serialización
- queries extra
- presión sobre la base

## Lecturas de negocio vs modelo de escritura

A veces una lectura no necesita el mismo modelo rico que una operación de escritura o modificación.

Por ejemplo:

- para modificar una orden quizá sí necesitás cierta unidad coherente del dominio
- pero para listarla en una grilla quizá no necesitás toda la entidad navegable con todas sus relaciones

Confundir ambos casos puede llevar a endpoints de lectura muy pesados.

Este punto conecta con una idea importante:
**no toda lectura necesita cargar el dominio completo.**

## DTOs, proyecciones y lecturas específicas

A veces tiene mucho más sentido hacer lecturas más específicas para devolver solo lo necesario.

Por ejemplo:

- resumen de orden
- vista de listado
- detalle de dashboard
- resultado agregado
- proyección administrativa

Eso puede evitar:

- cargar entidades enteras
- disparar relaciones innecesarias
- recorrer objetos de más
- hacer cálculos tontos en memoria

No siempre es la respuesta a todo, pero suele ayudar bastante.

## Costo acumulado bajo concurrencia

Otra cosa importante:

una consulta “medio mala” puede parecer tolerable cuando hay una sola request.
Pero bajo concurrencia el costo se multiplica.

Por ejemplo:

- 1 request hace 100 queries
- 20 requests concurrentes hacen 2000
- la base empieza a sufrir
- se acumulan esperas
- sube la latencia general
- el sistema entero se degrada

Por eso no alcanza con que “en local ande”.

## Observar la base, no solo el código

Para detectar estos problemas, mirar el código no siempre alcanza.

También importa ver:

- cuántas consultas se ejecutan
- cuánto tardan
- qué joins hacen
- qué índices usan o no
- si aparecen scans completos
- si la cantidad de queries crece con N
- si la serialización dispara accesos extra

Sin mirar eso, muchas veces el problema permanece invisible.

## Problemas clásicos relacionados

Además del N+1, hay varios patrones relacionados que también conviene vigilar.

Por ejemplo:

- consultas repetidas para lo mismo dentro del mismo flujo
- paginación que en realidad trae demasiado
- ordenamientos costosos sin índice
- filtros hechos después de traer miles de filas
- endpoints que usan el modelo de escritura para lecturas masivas
- reportes complejos ejecutados como si fueran lecturas triviales
- joins innecesarios por estructura poco pensada

Todos estos pueden convertirse en cuellos de botella.

## Qué NO conviene hacer primero

Si sospechás un problema de datos, muchas veces no conviene arrancar por:

- cambiar todo el framework
- poner caché en todos lados
- tunear infraestructura sin entender la consulta
- reescribir el módulo completo
- asumir que “Hibernate es lento” como explicación mágica

Primero conviene entender:

- qué se consulta
- cuántas veces
- cuánto tarda
- qué volumen mueve
- qué parte realmente duele

## Qué sí conviene hacer primero

Suele ser más útil empezar por:

- identificar el endpoint o flujo lento
- contar cuántas queries dispara
- revisar si crece linealmente con N
- ver si hay relaciones cargadas de más
- entender si la lectura necesita realmente todo ese modelo
- mirar si la query usa bien índices y filtros
- revisar si el problema está en muchas queries o en una query pésima

Eso ya suele dar muchísima claridad.

## Relación con arquitectura interna

Este tema conecta mucho con la arquitectura que viste antes.

Porque un backend mejor organizado puede distinguir mejor entre:

- modelo de dominio para reglas e invariantes
- lecturas específicas para vistas o listados
- casos de uso de escritura
- acceso a datos orientado a intención

Cuando todo se resuelve con las mismas entidades y relaciones para cualquier cosa, el costo suele crecer antes.

## Relación con persistencia desacoplada

También conecta con la persistencia desacoplada.

Justamente uno de los riesgos de modelar demasiado según el ORM es que después cualquier lectura se resuelve navegando objetos como si eso fuera gratis.

Y no lo es.

A veces una lectura necesita otra estrategia distinta, más enfocada y más barata.

## Relación con rendimiento general

En muchos sistemas, resolver bien N+1 y lecturas costosas da mejoras enormes sin tocar:

- lenguaje
- framework
- arquitectura distribuida
- infraestructura

Por eso este tema suele ser de los más rentables a nivel optimización real.

## Qué errores comunes aparecen

Algunos muy frecuentes son:

- asumir que una lista pequeña en local representa producción
- serializar entidades completas con relaciones sin control
- recorrer relaciones en loops sin mirar queries
- usar siempre la misma entidad rica para cualquier lectura
- filtrar o agrupar en memoria lo que la base debería hacer mejor
- no revisar índices
- creer que el problema es la base “porque sí” y no la forma de acceder
- meter caché sobre un patrón ineficiente sin arreglar el origen

## Buenas prácticas iniciales

## 1. Medir cuántas queries se ejecutan en flujos importantes

No suponerlo.

## 2. Sospechar de listados y serialización de relaciones

Son zonas clásicas de N+1.

## 3. Diferenciar lecturas simples, listados y operaciones de dominio más ricas

No todas necesitan el mismo modelo.

## 4. Traer solo la información necesaria cuando el caso lo permita

Eso suele ahorrar muchísimo.

## 5. Revisar si la cantidad de consultas crece con el tamaño de la respuesta

Muy buena señal de N+1.

## 6. Mirar también índices, joins y filtros

No todo problema es cantidad de queries; a veces es calidad de la consulta.

## 7. Resolver primero el acceso ineficiente antes de esconderlo con infraestructura o caché

Eso suele ser mucho más sano.

## Errores comunes

### 1. Ignorar cuántas queries dispara realmente el endpoint

Entonces el problema queda invisible.

### 2. Cargar el grafo entero por comodidad

Eso suele salir caro.

### 3. Reutilizar el mismo modelo pesado para cualquier lectura

No siempre tiene sentido.

### 4. Culpar a la base sin mirar el patrón de acceso

Muchas veces el diseño de acceso era el verdadero problema.

### 5. Optimizar sin medir volumen y crecimiento

Se puede tocar mucho y mejorar poco.

### 6. Usar caché para tapar N+1 sin arreglar el origen

Eso suele complicar más el sistema.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué endpoint de tu proyecto actual podría estar escondiendo un N+1 sin que todavía lo notes?
2. ¿qué listado hoy se resolvería mejor con una lectura específica en vez de cargar entidades completas?
3. ¿qué relación entre módulos o entidades te parece más peligrosa para disparar consultas extras?
4. ¿qué señales usarías para distinguir entre “muchas queries” y “una query muy costosa”?
5. ¿qué optimización harías distinto si pensás primero en patrón de acceso y no solo en código Java?

## Resumen

En esta lección viste que:

- el patrón N+1 aparece cuando una lista inicial dispara una consulta adicional por cada elemento relacionado
- este problema suele pasar desapercibido al principio, pero escala muy mal con volumen y concurrencia
- además del N+1, existen consultas costosas y patrones de acceso ineficiente que castigan mucho a la base
- no toda lectura necesita cargar el modelo completo del dominio; a veces conviene una lectura más específica y liviana
- medir consultas, revisar índices y entender el patrón real de acceso suele ser mucho más útil que optimizar por intuición
- en muchísimos sistemas, mejorar el acceso a datos da ganancias enormes antes de tocar infraestructura o arquitectura distribuida

## Siguiente tema

Ahora que ya entendés por qué el acceso ineficiente a datos, el N+1 y las consultas costosas pueden convertirse muy rápido en el primer gran límite de un backend que crece, el siguiente paso natural es aprender sobre **índices, planes de ejecución y cómo razonar sobre consultas desde la base**, porque ahí vas a poder mirar más de cerca por qué ciertas queries escalan mal aunque a simple vista “parezcan normales”.
