---
title: "Replicación, lecturas, escrituras y por qué escalar la base de datos es un problema distinto al de escalar la aplicación"
description: "Cómo pensar el crecimiento del lado de la base de datos, por qué no escala igual que la aplicación web y qué tensiones aparecen entre replicación, lecturas, escrituras, consistencia y rendimiento cuando el sistema empieza a crecer en serio."
order: 110
module: "Backend escalable y sistemas más grandes"
level: "intermedio"
draft: false
---

## Introducción

Cuando un backend empieza a crecer, muchas veces aparece una idea bastante intuitiva:

- si falta capacidad en la aplicación, agregamos más instancias
- si falta capacidad en la base, hacemos algo parecido

Pero ahí aparece una diferencia muy importante:

**escalar la base de datos no es lo mismo que escalar la aplicación.**

Y no suele ser ni tan simple, ni tan barato, ni tan lineal.

Mientras que un backend web razonablemente stateless puede multiplicar instancias con bastante naturalidad, la base de datos carga con algo mucho más delicado:

- el estado principal del sistema
- las lecturas
- las escrituras
- la consistencia
- los locks
- las transacciones
- los índices
- la integridad de los datos

Por eso esta lección trabaja una idea muy importante:

**crecer del lado de la base implica problemas distintos a crecer del lado de la aplicación.**

Y dentro de eso aparecen conceptos como:

- **replicación**
- **separación entre lecturas y escrituras**
- **trade-offs de consistencia**
- **límites reales del escalado de datos**

## Por qué este tema importa tanto

Porque en muchísimos sistemas, aunque escalar la aplicación sea relativamente sencillo, la base termina siendo:

- el cuello principal
- el componente más difícil de multiplicar
- la fuente de verdad más sensible
- el punto donde más duele equivocarse

En otras palabras:

**muchas veces es más fácil poner más servidores web que escalar sanamente la parte de datos.**

Y si no entendés esa diferencia, podés tomar decisiones ingenuas como:

- pensar que “más nodos” arreglan todo
- repartir lecturas y escrituras sin entender consistencia
- subestimar la complejidad de replicar
- imaginar que la base crece horizontalmente con la misma facilidad que la app
- generar estados incoherentes por no contemplar retrasos entre nodos

## Qué significa replicación

Replicación significa mantener copias de los datos o de parte de ellos en más de una instancia de base de datos.

La idea general suele ser:

- una base principal recibe ciertas escrituras
- una o varias réplicas reciben copia de esos cambios
- algunas lecturas pueden ir a esas réplicas
- así se reparte parte de la carga

A simple vista parece muy atractivo.
Y a veces lo es.
Pero también introduce tensiones importantes.

## Lecturas y escrituras no pesan igual

Una diferencia clave en bases de datos es esta:

- muchas arquitecturas pueden repartir mejor las lecturas
- pero repartir escrituras suele ser mucho más difícil

¿Por qué?

Porque escribir implica:

- mantener consistencia
- coordinar cambios
- preservar integridad
- respetar transacciones
- evitar conflictos
- decidir qué es la verdad actual

Leer, en cambio, muchas veces admite más flexibilidad.

Por eso, en muchos sistemas, una primera gran estrategia de escalado de base es:

**separar mejor el problema de lectura del problema de escritura.**

## Por qué escalar lecturas suele ser “más fácil”

Porque si tenés réplicas razonablemente actualizadas, muchas lecturas pueden resolverse sin ir siempre al nodo principal.

Eso ayuda a:

- sacar carga del nodo principal
- absorber más tráfico de consulta
- repartir reportes o dashboards
- sostener endpoints de lectura más masivos
- mejorar ciertos patrones de consumo

Pero incluso eso trae matices importantes.

## Por qué escalar escrituras es mucho más delicado

Porque escribir no es solo guardar datos.

Es también:

- decidir el nuevo estado oficial
- proteger integridad
- coordinar transacciones
- asegurar orden razonable de cambios
- manejar conflictos
- sostener invariantes

Por eso, cuando alguien dice:
“escalemos la base”
muchas veces conviene preguntar primero:

**¿estamos hablando de escalar lecturas o de escalar escrituras?**

Porque no son el mismo problema.

## Ejemplo intuitivo

Supongamos una aplicación con muchísimas lecturas de catálogo y relativamente pocas escrituras de productos.

Ahí una estrategia con réplicas de lectura puede tener bastante sentido.

Ahora imaginá otra con:

- muchísimas escrituras concurrentes
- alta contención sobre el mismo conjunto de datos
- transacciones frecuentes
- fuerte necesidad de consistencia inmediata

Ahí el problema cambia muchísimo.

No alcanza con “copiar la base a más nodos”.
La dificultad real está en coordinar los cambios.

## Nodo principal y réplicas

Una arquitectura bastante común es esta:

- un nodo principal o primario
- una o varias réplicas
- las escrituras van al principal
- ciertas lecturas van a réplicas

Esto puede ser muy útil.
Pero viene con preguntas importantes:

- ¿cuánto tardan en replicarse los cambios?
- ¿qué pasa si leo en una réplica justo después de escribir?
- ¿todas las lecturas toleran ese retraso?
- ¿qué lecturas necesitan frescura fuerte?
- ¿qué pasa si una réplica se atrasa mucho?

Es decir:
la replicación no solo agrega capacidad.
También agrega complejidad de consistencia.

## Retraso de replicación

Este es uno de los puntos más importantes.

Las réplicas no siempre reflejan instantáneamente el último estado del nodo principal.

Puede haber:

- retraso pequeño
- retraso moderado
- retraso importante bajo carga
- diferencias temporales entre nodos

Entonces una lectura hecha en réplica podría ver un estado “viejo” respecto de una escritura recién confirmada en el principal.

Eso puede estar bien en algunos casos.
En otros, puede ser un problema serio.

## Qué tipo de lecturas suelen tolerar mejor réplica

Por ejemplo:

- dashboards no críticos al segundo exacto
- listados públicos o semipúblicos
- catálogos relativamente estables
- reportes
- analítica
- consultas administrativas tolerantes a cierto delay
- algunas vistas agregadas

Estas lecturas muchas veces admiten algo de desfasaje temporal.

## Qué lecturas suelen requerir más cuidado

Por ejemplo:

- leer inmediatamente después de una escritura crítica del mismo usuario
- validar estado transaccional sensible
- flujos donde el usuario espera ver reflejado su cambio al instante
- decisiones que no toleran dato viejo
- operaciones de negocio muy sensibles a frescura inmediata

En estos casos, mandar lecturas a réplica sin criterio puede generar comportamientos confusos.

## Read-after-write

Hay una expectativa muy común en muchos sistemas:

**“acabo de escribir algo, ahora quiero leerlo y ver el cambio”.**

Eso parece natural.
Y muchas veces el usuario lo espera.

Pero cuando hay replicación con retraso, aparece un problema:

- la escritura fue al principal
- la lectura siguiente cae en réplica
- la réplica todavía no recibió el cambio
- el sistema parece inconsistente

A esto suele aludirse con la idea de `read-after-write consistency`, o coherencia de leer después de escribir.

No siempre se garantiza gratis.
Y es un detalle muy importante al escalar lecturas.

## La base no es solo throughput

Otro punto importante:

escalar la base no es solo “más operaciones por segundo”.

También implica cuidar:

- consistencia
- transacciones
- locks
- índices
- recuperación
- backups
- failover
- mantenimiento
- consultas costosas
- integridad

Es decir:
la base no es solo un motor de throughput.
Es el núcleo de coherencia del sistema.

## ¿Por qué no simplemente poner varias bases y escribir en todas?

Porque en cuanto hay múltiples escritores reales sobre los mismos datos, aparecen problemas como:

- conflictos
- orden de cambios
- resolución de divergencias
- integridad
- transacciones distribuidas
- latencia de coordinación
- complejidad operacional enorme

No significa que no existan sistemas que lo hagan.
Significa que **es mucho más difícil** que escalar una capa web stateless.

## La aplicación y la base escalan distinto

Esta idea merece quedar muy clara.

### Aplicación web stateless

- puede multiplicar instancias parecidas
- suele ser más fácil balancear
- el estado crítico vive fuera
- cada instancia es más reemplazable

### Base de datos

- concentra estado e integridad
- no es trivial repartir escrituras
- la consistencia pesa mucho
- replicar agrega retrasos y trade-offs
- coordinar nodos es mucho más delicado

Por eso, aunque ambas “formen parte del backend”, su escalado tiene naturaleza distinta.

## Qué problemas aparecen cuando la base se vuelve el límite

Algunos muy típicos son:

- lecturas muy caras
- demasiada carga en el nodo principal
- locks o contención
- replicación atrasada
- consultas mal distribuidas
- endpoints que exigen frescura inmediata desde réplica
- writes que se vuelven el verdadero cuello
- reportes compitiendo con transacciones críticas
- crecimiento de tablas e índices que degrada ciertas operaciones
- mantenimiento cada vez más delicado

## Qué estrategias suelen aparecer antes de “escalar la base”

Antes de llegar a estrategias más pesadas, muchas veces todavía conviene revisar cosas como:

- N+1
- queries malas
- índices faltantes
- separación de lecturas y escrituras
- cache
- proyecciones más baratas
- trabajo asíncrono
- límites de carga
- batchs o reportes rediseñados
- modelo de acceso a datos

Es muy común que una base “no aguante” cuando en realidad el sistema todavía está accediendo muy mal a los datos.

## Réplicas no resuelven malas queries

Esto es clave.

Si una consulta es pésima, mandar esa consulta a una réplica no la vuelve buena.

Quizá:

- reparte carga
- baja un poco la presión sobre el principal

pero el patrón sigue siendo costoso.

Entonces replicación no reemplaza:

- buen modelado
- buen acceso a datos
- buenos índices
- consultas razonables

## Réplicas y reportes

Un caso donde las réplicas suelen ayudar mucho es este:

- reportes
- dashboards
- lecturas administrativas
- consultas analíticas que no necesitan frescura absoluta

Porque eso permite separar mejor:

- operaciones transaccionales críticas
- de lecturas más pesadas o menos sensibles al segundo exacto

Eso suele mejorar muchísimo la salud del sistema principal.

## Réplicas y producto

También importa lo que el usuario espera.

No es lo mismo que un dashboard tarde unos segundos en reflejar un cambio a que:

- el checkout no vea una orden recién creada
- el usuario no vea su cambio de contraseña
- una acción crítica parezca “no haberse guardado”
- un admin tome una decisión con estado viejo sin saberlo

La tolerancia al delay no es solo técnica.
También es de experiencia y de negocio.

## Failover y operación

Replicar también tiene otra dimensión:

- disponibilidad
- recuperación ante caída
- failover
- continuidad del servicio

Pero incluso ahí hay complejidad:

- cuál nodo pasa a ser principal
- cuánto se perdió o no
- si había retraso de réplica
- si el sistema estaba preparado para eso
- cómo vuelven a alinearse los nodos

O sea:
replicación no es solo rendimiento.
También es operación distribuida del dato.

## Qué errores comunes aparecen

Algunos muy frecuentes son:

- pensar que la base escala igual que la app
- mandar lecturas sensibles a réplicas sin contemplar retraso
- usar replicación como parche para consultas malas
- no distinguir problema de lectura vs problema de escritura
- creer que más nodos de datos resuelven todo linealmente
- no pensar en consistencia de lectura después de escritura
- subestimar la complejidad operativa
- confiar ciegamente en que “la réplica ya está igual”

## Qué preguntas conviene hacerse

Cuando aparece la necesidad de crecer del lado de la base, ayudan preguntas como:

1. ¿el problema principal son lecturas o escrituras?
2. ¿qué consultas podrían tolerar cierto retraso?
3. ¿qué flujos requieren frescura inmediata?
4. ¿qué parte del problema todavía se podría resolver mejorando acceso o consultas?
5. ¿qué pasa si una lectura ve estado viejo?
6. ¿qué carga podría moverse fuera del principal sin romper experiencia o consistencia?
7. ¿estamos intentando escalar mal diseño o una necesidad real?

## Relación con stateless y aplicación web

Esta lección conecta muy bien con la anterior.

Porque podés tener una app web perfectamente escalable horizontalmente…
y aun así seguir limitado por una base que no escala igual.

Eso muestra que “poner más nodos web” y “resolver el crecimiento total del sistema” no son la misma cosa.

## Relación con consistencia eventual

También conecta con todo lo que viste sobre consistencia eventual.

La replicación y la separación de lecturas/escrituras introducen justamente la posibilidad de:

- leer estados viejos
- converger después
- aceptar ciertos delays
- necesitar criterio para decidir qué puede tolerarlo y qué no

## Buenas prácticas iniciales

## 1. Distinguir claramente problema de lectura y problema de escritura

No se escalan igual.

## 2. No asumir que la base puede multiplicarse como una app stateless

El estado hace toda la diferencia.

## 3. Usar réplicas donde el patrón de lectura realmente lo justifique y el delay sea tolerable

Eso suele ser mucho más sano.

## 4. Tener cuidado con flujos de read-after-write

No todas las lecturas toleran réplica.

## 5. No usar replicación como excusa para ignorar malas consultas

Primero conviene arreglar el acceso.

## 6. Pensar también en operación y consistencia, no solo en throughput

La base es más delicada que la capa web.

## 7. Recordar que crecer del lado de datos suele exigir mucho más criterio que solo “agregar nodos”

Ahí vive buena parte del dolor real.

## Errores comunes

### 1. Querer resolver todo con réplicas sin entender el patrón real de acceso

Puede traer problemas nuevos.

### 2. Mezclar lecturas críticas con réplicas atrasadas

Eso puede romper expectativas del negocio.

### 3. Creer que el cuello de escritura se arregla igual que uno de lectura

No funciona así.

### 4. No pensar en failover ni operación

La replicación también es una responsabilidad operativa.

### 5. Confiar demasiado en que el retraso siempre será pequeño

Bajo carga puede no serlo.

### 6. Tratar el escalado de datos como una decisión puramente de infraestructura

También es profundamente arquitectónica y funcional.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿en tu proyecto actual el dolor potencial más grande del lado de la base estaría en lecturas o en escrituras?
2. ¿qué consulta sí podría ir razonablemente a una réplica?
3. ¿qué lectura no mandarías jamás a una réplica si necesitás ver el último cambio inmediatamente?
4. ¿qué parte de tu sistema hoy parece “escalable web”, pero seguiría limitada por la base aunque dupliques instancias?
5. ¿qué esperás ahora distinto cuando escuches “escalemos la base”?

## Resumen

En esta lección viste que:

- escalar la base de datos es un problema diferente y más delicado que escalar la aplicación web
- la replicación permite repartir parte de las lecturas, pero introduce trade-offs de consistencia y retraso
- separar lecturas y escrituras ayuda a pensar mejor el crecimiento, porque no tienen el mismo tipo de dificultad
- las réplicas pueden ser muy valiosas para reportes, dashboards y lecturas menos sensibles a frescura inmediata
- no todas las consultas toleran leer desde una réplica, especialmente cuando hay expectativa de read-after-write
- replicación no reemplaza buenas consultas, buen modelado ni buen acceso a datos
- escalar del lado de la base implica no solo rendimiento, sino también consistencia, operación y criterio arquitectónico

## Siguiente tema

Ahora que ya entendés mejor por qué escalar la base de datos es un problema distinto al de escalar la aplicación y qué tensiones aparecen entre replicación, lecturas, escrituras y consistencia, el siguiente paso natural es aprender sobre **particionado, sharding y cuándo el volumen obliga a pensar la distribución de datos de otra manera**, porque ahí el sistema deja de pelear solo con una base más grande y empieza a preguntarse cómo repartir el dato sin romper el negocio.
