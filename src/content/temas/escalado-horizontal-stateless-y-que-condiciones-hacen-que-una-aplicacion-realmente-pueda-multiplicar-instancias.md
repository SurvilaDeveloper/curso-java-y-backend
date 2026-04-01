---
title: "Escalado horizontal, stateless y qué condiciones hacen que una aplicación realmente pueda multiplicar instancias"
description: "Cómo pensar el escalado horizontal de un backend, por qué la idea de stateless es tan importante y qué condiciones reales necesita una aplicación para poder multiplicar instancias sin volverse más frágil o incoherente."
order: 109
module: "Backend escalable y sistemas más grandes"
level: "intermedio"
draft: false
---

## Introducción

Cuando un sistema empieza a crecer y la carga sube, una de las primeras ideas que suele aparecer es esta:

**“pongamos más instancias”.**

La intuición parece bastante razonable:

- si una instancia procesa cierta cantidad
- dos deberían procesar más
- y cuatro más todavía
- y así escalar el backend sin tocar demasiado la lógica

A eso, en general, se lo asocia con una idea muy conocida:

**escalado horizontal.**

Pero hay un problema importante:

**no toda aplicación puede multiplicar instancias de forma sana solo porque alguien lo decida.**

Para que eso funcione bien, la aplicación necesita cumplir ciertas condiciones reales.

Y una de las más importantes es esta:

**ser razonablemente stateless.**

En esta lección vamos a trabajar tres ideas muy importantes:

- **escalado horizontal**
- **stateless**
- **qué condiciones hacen que agregar instancias realmente ayude en vez de traer más incoherencia o más dolor**

## Qué es escalado horizontal

Escalado horizontal significa aumentar capacidad agregando más instancias del mismo servicio o aplicación, en vez de depender solamente de hacer más grande una sola instancia.

Por ejemplo:

- pasar de 1 backend a 2
- de 2 a 4
- de 4 a 10

Cada instancia puede atender parte de la carga total.

La idea es repartir trabajo en varias copias equivalentes del servicio.

## Qué es escalado vertical

Para contrastar:

### Escalado vertical

Es hacer más grande una sola instancia.

Por ejemplo:

- más CPU
- más memoria
- mejor máquina
- más recursos en el mismo nodo

### Escalado horizontal

Es multiplicar instancias en paralelo.

Ambas estrategias existen y pueden combinarse.
Pero el escalado horizontal suele ser muy importante cuando un sistema crece de verdad y querés tener más elasticidad, disponibilidad o capacidad distribuida.

## Por qué este tema importa tanto

Porque mucha gente habla de “escalar horizontalmente” como si fuera solo una decisión de infraestructura.

Pero en realidad también es una decisión de diseño.

Porque para que varias instancias funcionen bien juntas, el sistema necesita ciertas condiciones como:

- no depender demasiado del estado local de una sola instancia
- no guardar cosas críticas solo en memoria de proceso
- no asumir que la próxima request va a caer en el mismo nodo
- no depender de archivos locales efímeros
- no tener sesiones o cachés inconsistentes sin estrategia
- no duplicar trabajo sensible al multiplicarse
- coordinar bien tareas compartidas

Si eso no está resuelto, “agregar instancias” puede empeorar el sistema en vez de mejorarlo.

## Qué significa stateless

Stateless significa, en este contexto, que cada instancia del backend pueda atender una request sin depender fuertemente de haber atendido antes otras requests relacionadas o de guardar en su propia memoria local un estado crítico de continuidad.

Dicho más simple:

- la request trae lo necesario o el sistema sabe buscarlo en un estado compartido confiable
- la instancia no necesita recordar localmente demasiadas cosas importantes para que el flujo funcione

No significa que el sistema no tenga estado.
Claro que lo tiene.

Significa más bien que **el estado importante no vive atado a una instancia individual como única fuente de verdad para seguir operando.**

## Qué NO significa stateless

No significa:

- que no exista base de datos
- que no haya sesiones de usuario
- que no haya caché
- que no haya autenticación
- que no haya operaciones relacionadas entre sí

Lo que significa es que la aplicación no depende peligrosamente de un estado local exclusivo dentro de una instancia para procesar correctamente el flujo general.

## Por qué stateless ayuda tanto al escalado horizontal

Porque si las instancias son razonablemente equivalentes e intercambiables, entonces es mucho más fácil:

- repartir tráfico
- agregar más nodos
- sacar nodos
- reiniciar instancias
- hacer deploys
- recuperarse de fallos
- balancear carga
- crecer bajo picos

En cambio, si cada instancia guarda parte crítica del estado local y no lo comparte correctamente, agregar nodos se vuelve mucho más frágil.

## Ejemplo intuitivo

Imaginá dos situaciones.

### Escenario A: backend más stateless

- el usuario manda una request autenticada
- la app valida el token o busca lo necesario en un store compartido
- cualquier instancia puede atender esa request
- la siguiente request puede caer en otra instancia y seguir funcionando bien

### Escenario B: backend muy stateful a nivel local

- una instancia guarda en memoria información crítica del usuario o de la operación
- la siguiente request cae en otra instancia
- esa instancia no sabe nada del estado previo
- el flujo falla o queda inconsistente

Ese contraste muestra por qué stateless es tan importante para escalar horizontalmente.

## Qué cosas suelen romper el escalado horizontal

Hay varios patrones clásicos.

## 1. Estado crítico en memoria local

Por ejemplo:

- pasos de flujo guardados solo en memoria
- sesiones importantes sin store compartido
- datos que una instancia “recuerda” y otra no

## 2. Archivos locales que el sistema necesita después

Si una instancia guarda algo en su disco local y otra no lo tiene, el flujo puede romperse al cambiar de nodo.

## 3. Cachés locales sin criterio

A veces el problema no es tener caché local, sino depender de ella como si fuera verdad única y consistente entre nodos.

## 4. Jobs o tareas duplicables sin coordinación

Si al multiplicar instancias todas creen que deben hacer el mismo trabajo, pueden aparecer:

- duplicados
- conflictos
- efectos repetidos

## 5. Dependencia de afinidad rígida

Si una request necesita volver a la misma instancia exacta porque ahí quedó algo importante, el sistema ya no escala horizontalmente con tanta naturalidad.

## La idea de instancias intercambiables

Una buena señal de escalabilidad horizontal es esta:

**si una instancia cae o desaparece, otra puede tomar su lugar sin que el sistema pierda la cabeza.**

Eso implica que las instancias sean, en cierto sentido:

- reemplazables
- parecidas entre sí
- no dueñas exclusivas del estado crítico del sistema

Cuanto más lográs eso, más sano suele ser el escalado horizontal.

## Balanceo de carga

Cuando hay varias instancias, normalmente necesitás alguna forma de repartir tráfico entre ellas.

Eso puede hacerse con balanceadores o mecanismos equivalentes.

La idea es:

- distribuir requests
- evitar concentrar todo en un solo nodo
- usar mejor la capacidad disponible

Pero el balanceo funciona bien solo si las instancias pueden realmente recibir tráfico de manera bastante equivalente.
Ahí vuelve a aparecer la importancia del diseño stateless.

## Sticky sessions y afinidad

A veces se usa afinidad o “sticky sessions” para que un cliente vuelva a la misma instancia.

Eso puede ser útil en algunos contextos puntuales.
Pero como diseño base de escalabilidad horizontal suele ser más frágil que un enfoque realmente stateless.

¿Por qué?

Porque cuanto más dependés de que “la próxima request vuelva al mismo lugar”, más te atás a una topología menos flexible.

No siempre está mal.
Pero conviene verlo como compromiso, no como ideal.

## Estado compartido vs estado local

La pregunta importante no es:
“¿hay estado o no?”

La pregunta más útil es:
“**dónde vive el estado importante?**”

Por ejemplo:

### Estado compartido razonable

- base de datos
- almacenamiento compartido
- store de sesiones o tokens
- cola
- caché compartida bien pensada
- sistema de archivos externo o storage de objetos

### Estado local riesgoso para escalar

- memoria exclusiva de una instancia
- archivo local no compartido
- jobs sin coordinación entre nodos
- información crítica que no sobrevive reinicios o cambios de nodo

Eso ayuda mucho a razonar qué tan escalable horizontalmente es una aplicación.

## Escalar horizontalmente no elimina todos los cuellos

Esto también es clave.

Agregar instancias web puede ayudar bastante si el cuello estaba en:

- CPU del backend web
- concurrencia de requests
- throughput del servicio web

Pero no va a resolver por sí solo problemas como:

- base de datos saturada
- integración externa lenta
- cola colapsada
- lock contention
- query pésima
- almacenamiento central lento
- dependencia compartida saturada

Es decir:
**escalar horizontalmente sirve solo si el cuello era realmente multiplicable con instancias.**

## Ejemplo intuitivo

Supongamos que tu backend responde lento porque cada request espera una API externa de pagos.

Agregar más instancias web quizá aumente algo la capacidad, pero si el verdadero cuello sigue siendo:

- la latencia del proveedor
- el timeout externo
- la dependencia remota

el beneficio será limitado.

Esto muestra por qué no alcanza con “poner más nodos”.

## Escalado horizontal y jobs

Este tema no aplica solo a endpoints web.

También importa mucho en workers y procesamiento en background.

Por ejemplo:

- varios workers pueden procesar colas
- pero necesitan coordinación razonable
- no deberían duplicar tareas críticas
- deben compartir cierta visión del estado relevante
- pueden requerir límites y partición de trabajo

Es decir:
escalar workers también exige condiciones de diseño, no solo “más procesos”.

## Qué cosas suelen ir bien con escalado horizontal

Por ejemplo:

- APIs web stateless
- validaciones y transformaciones que no dependen de memoria local exclusiva
- request processing con acceso a estado compartido confiable
- workers coordinados por cola
- integraciones desacopladas razonablemente
- archivos servidos desde storage compartido o externo
- autenticación basada en credenciales o tokens verificables sin afinidad rígida

## Qué cosas suelen requerir más cuidado

Por ejemplo:

- sesiones complejas en memoria local
- trabajo sensible duplicable
- cachés locales asumidas como fuente de verdad
- locks distribuidos mal resueltos
- tareas cron corriendo en todas las instancias sin coordinación
- operaciones que dependen de archivos locales efímeros
- flujos que esperan “volver al mismo nodo”

Estas cosas suelen aparecer como trampas al querer escalar.

## Cron jobs y múltiples instancias

Este es un caso muy clásico.

Tenías una sola instancia y un cron interno funcionaba bien.
Después ponés 5 instancias.

¿Qué pasa?

Si no lo pensaste, quizá ahora:

- el mismo job corre 5 veces
- procesa duplicado
- manda 5 emails
- recalcula 5 veces
- pisa estados
- genera caos

Esto muestra clarísimo que escalar horizontalmente no es solo multiplicar procesos.
También exige pensar coordinación.

## Despliegues y reinicios

Otro beneficio fuerte de un backend más stateless es que tolera mejor:

- reinicios
- despliegues rolling
- reemplazo de nodos
- autoscaling
- fallos parciales

Porque si una instancia desaparece, las otras pueden seguir atendiendo sin perder un estado crítico local.

Eso mejora mucho la operación real del sistema.

## Escalado horizontal y consistencia

No todo se vuelve fácil automáticamente.

Cuando hay varias instancias, también conviene pensar:

- qué estado está compartido
- qué caché puede quedar desalineada
- qué operaciones compiten
- qué tareas podrían ejecutarse dos veces
- qué parte del sistema necesita coordinación extra

O sea:
la horizontalidad da capacidad, pero también exige más disciplina en coherencia.

## Qué errores comunes aparecen

Algunos muy frecuentes son:

- creer que “stateless” significa “sin estado” en sentido absoluto
- guardar cosas importantes en memoria local y luego intentar escalar
- usar disco local como si fuera almacenamiento compartido
- multiplicar instancias sin revisar jobs o tareas internas
- pensar que más nodos resuelven cualquier cuello de botella
- olvidar que algunas dependencias siguen siendo centrales y compartidas
- no revisar cómo se autentican o continúan los flujos entre requests

## Cómo darte cuenta de que tu backend no está listo para escalar horizontalmente

Algunas señales:

- una request necesita volver a la misma instancia
- hay datos importantes solo en memoria local
- ciertos archivos viven solo en un nodo
- los jobs se duplicarían al agregar instancias
- una caché local se usa como verdad principal
- reiniciar una instancia rompe flujos activos
- el backend depende demasiado de afinidad
- no está claro cómo coordinar trabajo entre nodos

## Buenas prácticas iniciales

## 1. Hacer que el estado importante viva en mecanismos compartidos y no en memoria exclusiva de una instancia

Eso suele ser central para escalar bien.

## 2. Diseñar requests que puedan ser atendidas por cualquier nodo razonablemente equivalente

Mejora mucho la flexibilidad del sistema.

## 3. Evitar depender del disco local para cosas que el sistema necesita de forma continua entre instancias

Suele traer problemas al crecer.

## 4. Revisar jobs, cron y tareas internas antes de multiplicar procesos

Los duplicados son una trampa muy común.

## 5. No asumir que más instancias arreglan cuellos de base, red o integraciones externas

A veces el cuello está en otro lado.

## 6. Usar el concepto de stateless como guía práctica de diseño, no como dogma vacío

Se trata de intercambiabilidad y robustez operativa.

## 7. Pensar escalado horizontal como tema de arquitectura y operación, no solo de infraestructura

Eso mejora muchísimo las decisiones.

## Errores comunes

### 1. Querer escalar horizontalmente una aplicación muy atada a estado local

Suele traer comportamientos raros o frágiles.

### 2. Guardar sesiones, archivos o flujo crítico solo en una instancia

Eso rompe intercambiabilidad.

### 3. No coordinar tareas internas al multiplicar nodos

Muy típico y muy peligroso.

### 4. Asumir que stateless significa que nunca hay estado en ningún lado

No.
El estado existe; la pregunta es dónde vive y cómo se comparte.

### 5. Poner más instancias sin haber identificado el cuello real

Se puede gastar mucho y mejorar poco.

### 6. No pensar en consistencia ni en duplicación al pasar a múltiples nodos

Eso puede romper más de lo que arregla.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué parte de tu backend actual depende demasiado de estado local como para escalar cómodamente a varias instancias?
2. ¿qué job o tarea interna sospechás que se duplicaría si hoy multiplicaras el número de nodos?
3. ¿qué cosas de tu sistema podrían vivir en un estado compartido y no atado a una sola instancia?
4. ¿qué cuello de botella actual no se resolvería aunque pongas el doble de servidores web?
5. ¿qué entenderías distinto ahora cuando escuches “esta app es stateless”?

## Resumen

En esta lección viste que:

- el escalado horizontal consiste en aumentar capacidad agregando más instancias del servicio
- para que eso funcione bien, una aplicación necesita ser razonablemente stateless, es decir, no depender fuertemente de estado crítico local exclusivo de una sola instancia
- multiplicar nodos no resuelve cualquier cuello de botella y puede incluso empeorar problemas si no se pensaron sesiones, archivos, jobs o coordinación
- el estado importante debería vivir en mecanismos compartidos y las instancias deberían ser más intercambiables
- escalar horizontalmente es tanto un tema de diseño y operación como de infraestructura

## Siguiente tema

Ahora que ya entendés mejor qué condiciones reales necesita un backend para poder escalar horizontalmente sin depender peligrosamente del estado local de una sola instancia, el siguiente paso natural es aprender sobre **replicación, lecturas, escrituras y por qué escalar la base de datos es un problema distinto al de escalar la aplicación**, porque muchas veces agregar nodos web es fácil comparado con decidir cómo crecer del lado de los datos sin romper consistencia ni rendimiento.
