---
title: "Compatibilidad hacia atrás en código, contratos y flujos"
description: "Qué significa compatibilidad hacia atrás en un backend real, por qué no se limita a no cambiar una API, qué tipos de ruptura suelen aparecer en código, datos y recorridos operativos, y cómo evolucionar sistemas vivos sin romper consumidores, integraciones ni procesos que todavía dependen del comportamiento anterior."
order: 120
module: "Calidad, evolución y mantenibilidad a largo plazo"
level: "intermedio"
draft: false
---

## Introducción

Una de las formas más comunes de romper un sistema sin querer es creer que compatibilidad hacia atrás significa solamente “no cambiar el endpoint”.

Pero en un backend real la compatibilidad es bastante más amplia.

Porque no solo existen consumidores de una API HTTP.
También existen:

- otros módulos internos
- jobs programados
- integraciones externas
- frontends con despliegues desfasados
- procesos operativos
- scripts de soporte
- dashboards
- exporters
- datos viejos que siguen circulando
- usuarios que todavía recorren caminos heredados del producto

Entonces, cuando un backend evoluciona, el problema no es solamente si el código nuevo funciona.
El problema también es si **todo lo que todavía depende del comportamiento anterior** puede seguir funcionando durante la transición.

Y eso importa muchísimo.

Porque muchos incidentes en producción no aparecen por un bug lógico nuevo, sino por una ruptura de compatibilidad que parecía menor:

- un campo que dejó de venir
- un estado nuevo que nadie contemplaba
- un formato que cambió silenciosamente
- una validación más estricta que invalida casos históricos
- un flujo que asumía un orden viejo de eventos
- una migración que rompió coexistencia entre versión vieja y nueva

Por eso, entender compatibilidad hacia atrás no es un detalle de prolijidad.
Es una parte central de cómo mantener un backend vivo mientras sigue cambiando.

## Qué significa realmente compatibilidad hacia atrás

Compatibilidad hacia atrás significa que una versión nueva del sistema puede convivir razonablemente con consumidores, datos o flujos que todavía esperan comportamiento anterior.

Dicho más simple:

**el sistema evoluciona sin exigir que todo el mundo cambie al mismo tiempo.**

Eso no significa prometer compatibilidad eterna.
Tampoco significa que nunca se pueda romper nada.

Significa otra cosa:

**cuando cambiás algo que ya está en uso, pensás explícitamente cómo va a afectar a quienes todavía dependen de la versión anterior de ese comportamiento.**

## Por qué este tema es tan importante en sistemas reales

En proyectos pequeños o de laboratorio, muchas veces podés cambiar varias piezas juntas y listo.

Pero en sistemas reales rara vez tenés ese lujo.

Porque:

- distintos componentes despliegan en momentos diferentes
- no controlás todos los consumidores externos
- hay integraciones que migran lento
- los datos viejos no desaparecen mágicamente
- existen pantallas, reportes o automatizaciones construidas sobre supuestos históricos
- algunas migraciones necesitan convivencia temporal entre viejo y nuevo

Entonces, si cada cambio exige sincronización perfecta, el sistema se vuelve frágil.

La compatibilidad hacia atrás, en el fondo, es una forma de desacoplar evolución de sincronización total.

## Compatibilidad no es solo APIs

Éste es un punto clave.

Mucha gente asocia compatibilidad hacia atrás solamente con contratos HTTP.
Pero en backend hay varios niveles donde puede romperse.

## 1. Compatibilidad de código

Puede pasar incluso dentro del mismo repositorio o dentro del mismo sistema.

Ejemplos:

- una función cambia su semántica aunque mantenga la firma
- un método empieza a lanzar una excepción nueva que antes no aparecía
- una clase deja de aceptar cierto caso borde que antes toleraba
- un módulo empieza a requerir un dato que antes era opcional

No rompiste una API pública necesariamente.
Pero sí rompiste consumidores internos.

## 2. Compatibilidad de contrato

Acá entran:

- APIs REST
- GraphQL
- eventos publicados
- mensajes en cola
- webhooks
- archivos CSV o Excel exportados
- integraciones batch

Es la compatibilidad más visible, pero no la única.

## 3. Compatibilidad de datos

El sistema nuevo tiene que convivir con datos que fueron creados bajo reglas viejas.

Ejemplos:

- registros con campos nulos históricos
- estados que ya no deberían existir, pero existen
- formatos anteriores todavía persistidos
- datos derivados calculados con lógica vieja
- relaciones incompletas toleradas por versiones previas

## 4. Compatibilidad de flujos

A veces lo que rompe no es un campo ni una firma.
Rompe el recorrido.

Por ejemplo:

- un proceso operativo asumía que un email salía antes de cierto cambio de estado
- un frontend esperaba que ciertos pasos siempre ocurrieran en determinado orden
- una integración externa leía primero un recurso y después otro asumiendo timing viejo
- un job nocturno esperaba encontrar registros en una etapa intermedia que ya no existe

O sea:

**también hay compatibilidad en la secuencia, no solo en la forma del dato.**

## Formas típicas de romper compatibilidad sin darte cuenta

Muchas rupturas no vienen de cambios espectaculares.
Vienen de pequeñas decisiones aparentemente razonables.

## 1. Hacer más estricta una validación

Parece una mejora sana.
Pero puede romper:

- datos históricos
- integraciones viejas
- scripts internos
- formularios todavía no actualizados

Ejemplo:

antes aceptabas `phone` vacío en ciertos pedidos invitados.
Ahora lo volvés obligatorio.
El código nuevo parece mejor.
Pero si hay frontends viejos o procesos automáticos que todavía no lo envían, rompiste compatibilidad.

## 2. Renombrar o quitar campos

Caso clásico.

Aunque el significado siga siendo el mismo, cambiar:

- nombre
- nulabilidad
- formato
- casing
- presencia condicional

puede romper consumidores que dependían del contrato exacto.

## 3. Cambiar significado sin cambiar forma

Esto es muy peligroso porque cuesta más detectarlo.

Ejemplo:

un campo `status` sigue existiendo, pero ahora incluye nuevos valores o cambia la interpretación de algunos existentes.

Desde afuera parece compatible.
Semánticamente tal vez no lo sea.

## 4. Eliminar estados o pasos intermedios

A veces un flujo viejo tenía un estado transitorio que parecía innecesario.
Lo eliminás para simplificar.

Pero:

- dashboards lo contaban
- procesos operativos lo usaban
- integraciones se enganchaban ahí
- reglas de reconciliación dependían de esa marca

El problema no era el estado en sí.
Era todo lo que colgaba de él.

## 5. Suponer despliegue simultáneo

En un sistema real puede convivir por un tiempo:

- backend nuevo con frontend viejo
- servicio A nuevo con servicio B viejo
- consumidor viejo con productor nuevo
- job viejo con tabla nueva

Si el cambio solo funciona cuando todo despliega sincronizado, el sistema queda innecesariamente frágil.

## 6. Hacer migraciones destructivas demasiado pronto

Eliminar columnas, formatos o caminos anteriores antes de validar que ya nadie los usa es una de las maneras más comunes de provocar incidentes evitables.

## Compatibilidad hacia atrás en código

A veces pensamos en compatibilidad solo entre sistemas, pero también existe dentro de la base de código.

Cuando una pieza es muy usada, cambiarla exige cuidado aunque no sea pública.

### Ejemplo: cambiar semántica sin cambiar firma

Supongamos un método:

`calculateDiscount(order)`

Antes devolvía `0` cuando no había descuento.
Ahora decide devolver `null` para diferenciar “sin descuento” de “no evaluado”.

Tal vez conceptualmente tenga sentido.
Pero cualquier consumidor que asumía un número puede romperse.

La firma no cambió.
La compatibilidad sí.

### Ejemplo: endurecer precondiciones

Antes un servicio aceptaba listas vacías y devolvía resultado vacío.
Ahora lanza excepción porque “una lista vacía no tiene sentido”.

Eso puede estar mejor desde cierta pureza de diseño.
Pero si múltiples caminos del sistema usaban ese comportamiento tolerante, rompiste compatibilidad de uso.

### Qué conviene mirar

Cuando tocás código muy usado, preguntate:

- ¿cambia solo implementación o cambia comportamiento observable?
- ¿cambia manejo de nulos, vacíos o errores?
- ¿cambia timing?
- ¿cambia si una operación es idempotente o no?
- ¿cambia si devuelve valor por defecto o falla?

Muchas rupturas nacen en esos detalles.

## Compatibilidad hacia atrás en contratos

Ésta es la capa más evidente y una de las más sensibles.

Cuando un contrato ya tiene consumidores, la compatibilidad deja de ser una cuestión estética.
Pasa a ser una responsabilidad operativa.

### Cambios usualmente más seguros

En general suelen ser más seguros:

- agregar campos opcionales
- agregar nuevos endpoints sin eliminar viejos
- introducir una nueva versión de payload manteniendo la anterior por un tiempo
- aceptar formatos viejo y nuevo durante transición

### Cambios típicamente riesgosos

Suelen ser riesgosos:

- quitar campos
- renombrar campos existentes
- volver obligatorio algo que antes era opcional
- cambiar tipos
- cambiar semántica sin avisar
- modificar orden o estructura de un archivo consumido automáticamente
- introducir nuevos valores sin verificar consumidores

### Ojo con los enums y estados

Uno de los errores más frecuentes es asumir que agregar un valor nuevo a un enum es un cambio “no rompiente”.

No siempre.

Si un consumidor hace:

- `switch` exhaustivo
- validación cerrada
- mapeo a UI o reportes
- reglas de negocio según conjunto fijo de estados

entonces un valor nuevo puede romperlo aunque no hayas quitado nada.

## Compatibilidad de datos: el pasado también ejecuta

Muchos cambios fallan porque se diseña pensando solo en los datos futuros.

Pero en producción ya existe pasado.
Y ese pasado sigue participando del sistema.

Por eso conviene recordar algo importante:

**los datos históricos también son una interfaz.**

Si el código nuevo no sabe convivir con ellos, el sistema puede romper aunque compile perfecto.

### Casos típicos

- registros con campos que antes eran opcionales y ahora no
- timestamps faltantes en órdenes viejas
- monedas o formatos antiguos todavía persistidos
- referencias huérfanas que antes se toleraban
- datos parcialmente migrados
- valores legacy que nunca se limpiaron del todo

### Qué hacer

Antes de endurecer reglas o asumir nuevos invariantes, conviene mirar:

- qué datos reales ya existen
- qué tan sucios o mixtos están
- si necesitás migración previa
- si necesitás lectura compatible
- si necesitás tolerancia temporal para casos heredados

## Compatibilidad de flujos y timing

Hay cambios que no rompen estructura ni datos, pero sí el orden de ocurrencia.

Y eso también importa mucho.

### Ejemplo

Antes, al confirmar una orden:

1. se persistía la orden
2. se enviaba email
3. se publicaba evento

Ahora cambiás a:

1. se persistía la orden
2. se publica evento
3. se envía email

Quizá desde adentro parezca irrelevante.
Pero tal vez:

- otro sistema esperaba que el email ya existiera al consumir el evento
- soporte leía una marca que se generaba después del email
- una auditoría se correlacionaba según ese orden

El contrato no era solo el payload.
También era la secuencia observable.

## La compatibilidad como estrategia de transición

Una idea central es ésta:

**compatibilidad no es inmovilismo; es una herramienta para migrar con control.**

No se trata de conservar lo viejo para siempre.
Se trata de permitir que el sistema cruce de una versión a otra sin exigir salto instantáneo.

Por eso muchas estrategias de cambio seguro dependen de compatibilidad temporal.

## Estrategias muy útiles

## 1. Expand and contract

Primero agregás sin romper.
Después convivís.
Después migrás.
Recién al final retirás lo viejo.

Ejemplos:

- agregar columna nueva sin borrar la anterior
- aceptar dos formatos de request durante un tiempo
- exponer versión nueva de endpoint mientras la vieja sigue viva
- escribir en esquema viejo y nuevo antes de cortar definitivamente

## 2. Lectura compatible, escritura progresiva

Muchas veces conviene que el sistema:

- lea ambos formatos
- escriba el nuevo
- pueda seguir interpretando el viejo

Eso reduce la necesidad de migraciones instantáneas.

## 3. Versionado explícito

A veces la mejor forma de evolucionar un contrato es versionarlo de manera clara.

Pero ojo:
versionar no reemplaza pensar compatibilidad.
Solo organiza mejor la transición.

## 4. Feature flags y activación gradual

Sirven para introducir comportamiento nuevo por segmentos:

- entorno
- tenant
- tipo de cliente
- porcentaje de tráfico
- operación específica

Eso permite validar antes de generalizar.

## 5. Doble publicación o doble escritura

En ciertos cambios, durante una etapa transitoria se publica o persiste en dos formatos.

Tiene costo.
Pero a veces es el precio razonable para migrar sin romper consumidores.

## Cuándo vale la pena mantener compatibilidad y cuándo no

No toda compatibilidad merece mantenerse para siempre.

Eso también hay que decirlo.

Mantener compatibilidad tiene costos:

- más complejidad
- más ramas de código
- más tests
- más ambigüedad temporal
- más deuda si nunca se limpia

Entonces la pregunta no es “¿siempre compatibilidad sí o no?”.
La pregunta correcta es:

**¿qué compatibilidad necesitamos mantener durante cuánto tiempo y para permitir qué transición?**

Eso obliga a pensar:

- quién consume eso
- cuán costoso es migrarlo
- cuánto daño hace romperlo
- cuánto cuesta sostener coexistencia
- cuál es el plan concreto de retiro

## Una buena regla práctica

La compatibilidad temporal debería tener:

- motivo claro
- alcance claro
- criterio de salida claro

Si no, puede transformarse en compatibilidad eterna por omisión.

## Señales de que estás rompiendo compatibilidad de manera peligrosa

- “esto es interno, nadie depende” sin evidencia
- “solo cambié un enum”
- “el frontend se actualiza rápido” como supuesto universal
- “después migramos datos” sin plan concreto
- “nadie usa ese campo” sin métricas ni verificación
- “si falla, hacemos rollback” aunque haya side effects irreversibles
- “el contrato sigue igual” aunque la semántica haya cambiado

Estas frases suelen esconder transiciones mal pensadas.

## Ejemplo: agregar un nuevo estado de pago

Supongamos que agregás `PARTIALLY_REFUNDED`.

A simple vista parece un cambio aditivo.

Pero conviene revisar:

- backoffice
- filtros de admin
- emails transaccionales
- dashboards financieros
- conciliación contable
- integraciones con ERP
- reportes históricos
- reglas de devolución

El cambio puede ser compatible para algunos consumidores y rompiente para otros.

Por eso no alcanza con mirar la tabla o el endpoint.
Hay que mirar el ecosistema.

## Ejemplo: endurecer validaciones en checkout

Querés mejorar calidad de datos y volvés obligatorio un campo fiscal.

Pregunta correcta:

- ¿todos los frontends lo envían ya?
- ¿los checkouts guest también?
- ¿las órdenes generadas por soporte también?
- ¿los scripts de carga manual también?
- ¿hay marketplaces o integraciones que todavía no lo mandan?

Tal vez el cambio sea correcto.
Pero quizá necesite transición:

- campo opcional con warning primero
- observabilidad de presencia real
- activación gradual
- obligatoriedad definitiva recién después

## Ejemplo: cambiar formato de un webhook

Aunque “solo” consuman sistemas externos, el costo de romperlos puede ser alto.

Una transición más segura podría ser:

1. agregar campos nuevos sin quitar los viejos
2. comunicar deprecación
3. ofrecer nueva versión del webhook
4. monitorear adopción
5. retirar versión vieja recién con evidencia suficiente

## Qué rol tienen tests y contratos en todo esto

Los tests ayudan mucho, pero hay que entender qué protegen.

### Tests útiles para compatibilidad

- tests de contrato
- tests de integración entre productor y consumidor
- tests de caracterización del comportamiento actual
- fixtures con datos históricos reales o representativos
- pruebas sobre casos borde heredados

### Lo que no alcanza

No alcanza con:

- tests unitarios aislados
- cobertura alta sin escenarios legacy
- asumir que CI verde implica compatibilidad garantizada

La compatibilidad muchas veces falla en la interacción entre versiones, datos y flujos, no solo en la corrección local de una función.

## Observabilidad de compatibilidad

En cambios sensibles, conviene observar explícitamente la transición.

Por ejemplo:

- qué porcentaje de tráfico sigue usando contrato viejo
- cuántos requests llegan con formato anterior
- cuántos registros siguen dependiendo de columnas legacy
- qué consumidores todavía procesan solo estados viejos
- dónde aparecen errores por valores desconocidos

Eso permite retirar compatibilidad con evidencia, no por intuición.

## Error común: compatibilidad infinita

A veces el equipo aprende a no romper nada y termina dejando todas las rutas viejas para siempre.

Eso también es un problema.

Porque el sistema acumula:

- flags eternos
- columnas duplicadas
- formatos múltiples sin limpieza
- ramas viejas imposibles de entender
- código para consumidores que ya ni existen

La buena práctica no es sostener todo para siempre.
La buena práctica es sostener lo necesario durante la transición y después limpiar con criterio.

## Relación con el tema anterior

La lección anterior trató sobre **diseño para cambio seguro**.

Este tema es una continuación directa.

Porque una gran parte de cambiar de forma segura consiste en preservar compatibilidad mientras el sistema atraviesa una transición.

Diseño para cambio seguro te hacía preguntar:

- qué puede romperse
- cómo reducir radio de impacto
- cómo migrar gradualmente

Compatibilidad hacia atrás te obliga a profundizar una dimensión concreta de ese problema:

- quién sigue dependiendo del comportamiento anterior
- cuánto tiempo va a convivir con lo nuevo
- qué tolerancia o coexistencia necesitás sostener durante ese período

## Relación con mantenibilidad a largo plazo

Un backend mantenible no es solo uno donde el código se entiende.
También es uno donde los cambios no exigen coordinación imposible entre todos los actores del sistema.

Cuando una arquitectura tolera compatibilidad razonable:

- los despliegues son menos frágiles
- las migraciones son más controlables
- las integraciones viven mejor
- los cambios de producto duelen menos
- los incidentes por transición bajan mucho

Por eso compatibilidad hacia atrás no es solo un detalle de API design.
Es una propiedad clave de sistemas que maduran.

## Buenas prácticas iniciales

## 1. Antes de cambiar, identificar consumidores reales

No asumir. Verificar.

## 2. Diferenciar cambios aditivos de cambios rompientes

Y no subestimar cambios semánticos aunque la forma parezca igual.

## 3. Pensar compatibilidad en código, contratos, datos y flujos

No limitar el análisis solo a endpoints.

## 4. Preferir transiciones graduales cuando el cambio es sensible

Expand and contract, lectura compatible, escritura dual o versionado pueden ser muy útiles.

## 5. Observar adopción y uso real antes de retirar lo viejo

Retirar con evidencia, no por deseo.

## 6. Definir fecha o criterio de limpieza

Compatibilidad temporal sin plan de salida se transforma en deuda permanente.

## 7. Tratar datos históricos como parte del problema

El sistema nuevo tiene que saber convivir con el pasado.

## Mini ejercicio mental

Pensá estas preguntas:

1. ¿qué cambio reciente en tu backend parecía inocente pero podía romper consumidores o flujos viejos?
2. ¿el riesgo estaba en el contrato, en los datos históricos o en la secuencia del proceso?
3. ¿qué parte de ese cambio necesitaba convivencia temporal entre viejo y nuevo?
4. ¿tenías forma de medir quién seguía usando el comportamiento anterior?
5. ¿qué compatibilidad estás sosteniendo hoy que ya deberías planificar retirar?

## Resumen

En esta lección viste que:

- compatibilidad hacia atrás significa permitir que el sistema evolucione sin exigir que todos los consumidores, datos y flujos cambien al mismo tiempo
- la compatibilidad no aplica solo a APIs, sino también a código interno, contratos, datos históricos y secuencias operativas observables
- muchas rupturas aparecen por endurecer validaciones, cambiar semántica sin cambiar forma, agregar estados nuevos sin revisar consumidores o asumir despliegue sincronizado
- estrategias como expand and contract, lectura compatible, escritura progresiva, versionado y activación gradual ayudan a migrar con menos riesgo
- sostener compatibilidad tiene costo, por lo que conviene tratarla como herramienta temporal con motivo y criterio de salida claros
- la compatibilidad bien gestionada reduce fragilidad operativa y es una parte clave de la mantenibilidad real de un backend vivo

## Siguiente tema

Ahora que ya entendés cómo evolucionar un backend sin romper consumidores, datos y recorridos que todavía dependen del comportamiento anterior, el siguiente paso natural es meterse en **branching, releases y estrategia de cambios en equipos reales**, porque no alcanza con diseñar bien un cambio: también hace falta saber cómo organizarlo, integrarlo, desplegarlo y coordinarlo en contextos donde varias personas y varias entregas conviven al mismo tiempo.
