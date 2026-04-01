---
title: "Cómo leer sistemas existentes y proponer mejoras"
description: "Cómo analizar un backend ya construido, cómo detectar problemas reales sin caer en crítica superficial, cómo entender restricciones históricas y cómo proponer mejoras con criterio técnico y pragmatismo." 
order: 244
module: "Cloud, despliegue, carrera y proyecto final"
level: "intermedio"
draft: false
---

## Introducción

Una parte enorme del trabajo backend real no consiste en diseñar sistemas desde cero.

Consiste en entrar a sistemas que **ya existen**.

Sistemas con:

- código heredado
- decisiones históricas
- deudas técnicas acumuladas
- integraciones raras
- despliegues delicados
- modelos de datos inconsistentes
- y documentación incompleta o desactualizada

Por eso, una habilidad muy valiosa no es solamente saber inventar una arquitectura ideal.

También es saber:

- leer lo que ya está vivo
- entender por qué llegó a ese estado
- distinguir problemas reales de imperfecciones tolerables
- y proponer mejoras que el sistema pueda absorber sin romperse

Esta habilidad importa muchísimo en entrevistas y también en trabajo real.

Porque una empresa rara vez necesita a alguien que venga a decir “yo lo haría distinto” sin más.

Lo que necesita es a alguien capaz de mirar un sistema existente y responder preguntas como éstas:

- ¿qué partes están sanas y cuáles son frágiles?
- ¿qué duele de verdad y qué solo se ve feo?
- ¿qué problema conviene atacar primero?
- ¿qué mejora reduce riesgo sin disparar una reescritura innecesaria?
- ¿qué decisiones actuales fueron razonables para otra etapa del producto?

De eso trata esta lección.

## El error clásico: juzgar demasiado rápido

Cuando alguien empieza a leer un sistema existente, uno de los errores más comunes es éste:

**confundir diferencia con error.**

Ve algo distinto a lo que habría hecho y concluye enseguida que está mal.

Por ejemplo:

- “esto debería ser microservicios”
- “esto debería usar eventos”
- “esta tabla está mal modelada”
- “esto tendría que estar cacheado”
- “esto es legacy, hay que rehacerlo”

El problema es que sin contexto esas frases valen poco.

Porque un sistema existente no es solo una colección de decisiones técnicas.
También es el resultado de:

- restricciones de negocio
- urgencias pasadas
- tamaño de equipo
- madurez del producto
- incidentes históricos
- integraciones disponibles
- presupuesto
- capacidades operativas
- y trade-offs acumulados en el tiempo

Entonces, antes de criticar, hay que entender.

## Leer un sistema no es solo leer código

Mucha gente asocia “entender el sistema” con abrir el repositorio y empezar a recorrer clases.

Eso ayuda, pero no alcanza.

Para leer de verdad un sistema backend, normalmente necesitás combinar varias capas de observación:

- código
- modelo de datos
- endpoints y contratos
- flujos de negocio
- logs y métricas
- despliegue e infraestructura
- integraciones externas
- incidentes históricos
- documentación disponible
- y dolores actuales del equipo

Porque a veces el problema principal no vive donde primero parece.

Podés encontrar:

- código desordenado pero operación estable
- código bastante prolijo con un modelo operativo desastroso
- endpoints razonables sobre una base con fuerte deuda estructural
- arquitectura elegante con observabilidad casi nula
- o un sistema técnicamente imperfecto pero alineado con la etapa del producto

Leer bien significa conectar todas esas capas.

## La primera pregunta correcta no es “cómo lo mejoro”

La primera pregunta correcta suele ser otra:

**¿qué problema está resolviendo hoy este sistema y dónde está sufriendo realmente?**

Eso cambia completamente la lectura.

Porque una mejora solo tiene sentido si está conectada con un dolor real.

Dolores típicos podrían ser:

- cambios muy caros de hacer
- bugs frecuentes en una zona del dominio
- despliegues riesgosos
- tiempos de respuesta malos en rutas críticas
- inconsistencias de datos
- dificultad para auditar acciones sensibles
- integración externa inestable
- incapacidad para escalar una carga puntual
- dependencia de pocas personas que entienden una parte crítica
- o imposibilidad de evolucionar producto sin romper compatibilidad

Sin eso, la mejora se vuelve estética.

Y en sistemas reales, las mejoras estéticas rara vez son prioridad.

## Qué mirar primero cuando entrás a un sistema existente

No existe una única secuencia universal, pero una estrategia muy útil es empezar por estos puntos.

### 1. Entender el dominio y los flujos críticos

Antes de discutir arquitectura, necesitás entender:

- qué hace el sistema
- qué entidades son centrales
- qué flujos generan más valor o más riesgo
- cuáles son los estados importantes
- qué errores son tolerables y cuáles no

No es lo mismo leer:

- un sistema de catálogo
- una API de autenticación
- un backend de pagos
- una plataforma SaaS multi-tenant
- un sistema de reporting
- o un motor de fulfillment

Cada uno tiene tensiones distintas.

### 2. Identificar el camino feliz y los caminos rotos

Muchos sistemas parecen razonables mientras mirás solo el flujo ideal.

La comprensión real aparece cuando preguntás:

- ¿qué pasa si falla una integración externa?
- ¿qué pasa si hay reintentos?
- ¿qué pasa si se corta una operación a mitad de camino?
- ¿qué pasa si llegan eventos duplicados?
- ¿qué pasa si el deploy sale mal?
- ¿qué pasa si dos usuarios compiten por el mismo recurso?

Ahí aparecen las costuras del sistema.

### 3. Ver dónde se concentran los cambios

Una pista muy valiosa es observar dónde el equipo toca cosas todo el tiempo.

Si una zona del sistema cambia seguido y cada cambio duele, probablemente ahí hay una señal fuerte.

Podría haber:

- mal desacople
- lógica duplicada
- invariantes mal ubicadas
- contratos frágiles
- o una mala separación de responsabilidades

### 4. Detectar zonas con alto riesgo operativo

Hay partes del sistema donde quizá no se cambia mucho, pero cuando fallan el impacto es enorme.

Por ejemplo:

- autenticación
- creación de órdenes
- reservas de stock
- generación de facturas
- cobros
- permisos
- pipelines críticos
- integraciones con terceros claves

Una zona de alto riesgo no siempre necesita rediseño inmediato, pero sí lectura cuidadosa.

## Una buena lectura separa síntomas de causas

Este punto es clave.

Muchas veces lo que ves primero es un síntoma, no la causa.

Por ejemplo:

### Síntoma

“esta pantalla tarda mucho”

### Posibles causas

- consulta ineficiente
- falta de índice
- exceso de joins
- N+1 queries
- dependencia externa lenta
- serialización excesiva
- mala estrategia de cache
- mezcla de carga transaccional con analítica

Otro ejemplo:

### Síntoma

“esta parte siempre se rompe al tocarla”

### Posibles causas

- bajo test coverage útil
- alto acoplamiento
- contratos implícitos
- lógica duplicada
- falta de límites de módulo
- side effects escondidos
- datos inconsistentes

Si no separás síntoma de causa, terminás proponiendo arreglos equivocados.

## Qué señales suelen indicar deuda técnica importante

No toda incomodidad es deuda seria.

Pero hay señales que suelen merecer atención.

### 1. Cambios pequeños producen impacto desproporcionado

Si cambiar algo simple requiere tocar cinco capas, revisar múltiples tablas y rezar para que no se rompa nada, hay una señal clara.

### 2. La lógica importante está dispersa

Cuando una regla de negocio central aparece repartida entre controller, service, job, base de datos y consumidor asíncrono, la comprensión se vuelve frágil.

### 3. Nadie puede explicar con claridad ciertas zonas

Cuando una parte crítica depende de conocimiento tribal y nadie puede describir bien cómo funciona, el riesgo sube mucho.

### 4. El sistema necesita “rituales” para operar

Si para desplegar, reconciliar, reprocesar o corregir estados hay que seguir pasos manuales poco confiables, hay deuda operativa seria.

### 5. Los incidentes se repiten con distinto disfraz

A veces no se ve como “el mismo bug”, pero en realidad hay un mismo problema estructural debajo.

## Qué no conviene hacer al proponer mejoras

Hay varios errores muy comunes.

### 1. Proponer reescritura demasiado rápido

Reescribir puede parecer atractivo, pero suele:

- subestimar complejidad acumulada
- perder casos borde ya absorbidos por el sistema viejo
- demorar entrega de valor
- abrir un segundo sistema en paralelo difícil de sostener
- y esconder la falta de entendimiento detrás de una promesa de limpieza

### 2. Atacar demasiados problemas a la vez

Un sistema vivo casi nunca tolera una reforma total sin costo enorme.

Las mejoras buenas suelen tener foco.

### 3. Confundir deuda con preferencias personales

Que algo no te guste no significa que sea el principal problema.

### 4. Ignorar la capacidad real del equipo

Una mejora técnicamente correcta puede ser inviable si:

- el equipo no puede operarla
- no hay tiempo para estabilizarla
- no hay observabilidad suficiente
- o la organización no está lista para ese cambio

## Una mejora útil tiene estas características

Cuando una propuesta es buena, normalmente cumple varias de estas cosas:

- ataca un dolor real
- reduce riesgo o costo futuro
- tiene alcance claro
- puede implementarse de forma incremental
- mejora comprensión además de comportamiento
- es operable por el equipo real
- y deja al sistema en una posición mejor para seguir evolucionando

Eso importa mucho.

Porque la mejora no debería ser solo “más elegante”.
Debería ser **más útil para el sistema vivo**.

## Cómo pensar mejoras de forma incremental

Una forma muy sana de proponer mejoras es pensar en términos de pasos.

Por ejemplo:

### Paso 1

Hacer visible el problema.

Eso puede implicar:

- agregar métricas
- mejorar logs
- explicitar estados
- documentar contratos
- identificar ownership
- cubrir con tests una zona crítica

### Paso 2

Reducir fragilidad sin cambiar todo.

Por ejemplo:

- encapsular lógica duplicada
- definir una API interna más clara
- separar un módulo dentro del monolito
- aislar una integración externa detrás de una abstracción
- limpiar una tabla o un flujo puntual

### Paso 3

Recién ahí evaluar una transformación mayor.

Como:

- extraer un servicio
- cambiar un modelo de persistencia
- introducir eventos en una frontera concreta
- mover un workload a procesamiento asíncrono

Este orden suele ser mejor que saltar directo a la parte más ambiciosa.

## Cómo presentar una mejora sin sonar dogmático

Cuando proponés mejoras, la forma de comunicar importa muchísimo.

Suele sonar más fuerte decir algo como:

> Hoy veo que el mayor dolor está en la creación de órdenes porque mezcla demasiadas responsabilidades, tiene baja trazabilidad y cualquier cambio impacta stock, pago y notificaciones al mismo tiempo. Antes de pensar en separar servicios, propondría explicitar estados, encapsular las transiciones y aislar mejor la integración de pagos. Eso ya bajaría riesgo de cambio y nos daría una base más clara para evaluar separaciones futuras.

Que decir algo como:

> Esto hay que pasarlo a microservicios.

La primera respuesta:

- identifica un dolor real
- muestra comprensión del dominio
- propone pasos
- y evita sobreingeniería prematura

La segunda suena más superficial.

## Qué valoran mucho en entrevistas cuando hablás de sistemas existentes

En entrevistas, este tipo de tema suele aparecer cuando te preguntan:

- cómo entrarías a un sistema legado
- cómo detectarías mejoras prioritarias
- cómo decidirías qué refactorizar
- cómo leerías una arquitectura que no diseñaste vos
- o cómo propondrías una evolución sin reescribir todo

Lo que suele destacar muy bien es mostrar que sabés:

- observar antes de opinar
- preguntar por dolor real y no por estética
- priorizar impacto
- diferenciar síntoma de causa
- pensar incrementalmente
- y conectar arquitectura con operación y negocio

Eso transmite mucha madurez profesional.

## Ejemplo de lectura pobre vs lectura fuerte

### Lectura pobre

> Veo mucho código mezclado. Lo ideal sería separar backend en varios servicios, usar eventos y rehacer el modelo.

Problemas de esta lectura:

- no explica el dolor principal
- no identifica riesgos concretos
- no prioriza
- no propone un camino realista
- y parece partir de una solución prefabricada

### Lectura fuerte

> Lo primero que intentaría entender es dónde están hoy los mayores costos de cambio y riesgo operativo. Si descubro que el flujo más sensible es checkout y que cualquier modificación toca inventario, pagos y notificaciones al mismo tiempo, probablemente ahí hay una mala concentración de responsabilidades. Antes de pensar en una descomposición grande, propondría explicitar límites internos, mejorar trazabilidad de estados, cubrir regresión de los caminos críticos y aislar integraciones externas detrás de interfaces más claras. Si después sigue habiendo presión de escala o ownership separado, reevaluaría separar capacidades.

Acá ya aparece una forma mucho más profesional de pensar.

## Cómo leer un sistema sin documentación perfecta

Esto pasa todo el tiempo.

No siempre vas a tener diagramas impecables, ADRs actualizados o manuales operativos completos.

Entonces conviene apoyarte en señales como:

- rutas principales del código
- handlers o controllers más usados
- tablas más centrales
- colas o topics existentes
- jobs críticos
- dashboards y alertas
- incidentes pasados
- scripts operativos frecuentes
- commits en zonas calientes
- personas que cargan más contexto del sistema

La documentación ayuda, pero el sistema real también “habla” a través de su comportamiento y sus puntos de dolor.

## Leer un sistema también es entender su etapa

Una misma arquitectura puede ser razonable o mala según la etapa del producto.

Por ejemplo:

- algo muy manual puede ser aceptable en etapa temprana
- algo muy centralizado puede ser correcto si el equipo es chico
- algo poco elegante puede haber priorizado time-to-market con buen criterio
- algo muy sofisticado puede ser exceso para el problema actual

Entonces, cuando proponés mejoras, conviene pensar siempre:

- ¿esto fue una mala decisión desde el inicio?
- ¿o fue una decisión razonable para otra etapa y ahora quedó desfasada?

Esa diferencia cambia muchísimo el tono y la calidad del análisis.

## Una forma práctica de estructurar tu análisis

Cuando tengas que leer un sistema existente y proponer mejoras, esta estructura mental ayuda mucho:

### 1. Entender objetivo y flujos críticos

¿Qué hace el sistema y qué parte duele más si falla?

### 2. Identificar restricciones actuales

Escala, equipo, operación, compliance, integraciones, time-to-market.

### 3. Detectar síntomas visibles

Latencia, bugs, incidentes, cambios costosos, mala trazabilidad, despliegues frágiles.

### 4. Buscar causas probables

Acoplamiento, mala separación, carencia de observabilidad, modelo inconsistente, operación manual, dependencia externa frágil.

### 5. Priorizar

¿Qué conviene atacar primero por impacto y viabilidad?

### 6. Proponer una secuencia de mejora

No solo una idea final, sino un camino realista.

Esa forma de pensar hace que tu propuesta tenga mucho más valor.

## Cierre

Leer sistemas existentes y proponer mejoras es una habilidad central del trabajo backend real.

No se trata de mirar código viejo y criticarlo desde una arquitectura ideal.

Se trata de:

- entender contexto
- detectar dolor real
- separar síntomas de causas
- priorizar con criterio
- respetar restricciones del sistema vivo
- y proponer mejoras que reduzcan riesgo, costo o fragilidad sin caer automáticamente en la reescritura

Cuando desarrollás esta capacidad, dejás de pensar solo como alguien que diseña cosas nuevas.

Y empezás a pensar como alguien que puede entrar a sistemas reales, entenderlos, mejorarlos y moverlos hacia un estado más sano.

## Próximo paso

En la próxima lección vamos a cerrar la parte más orientada a carrera con un tema muy importante para posicionarte profesionalmente:

**perfil profesional backend: qué se espera de un semi-senior / senior**, para entender cómo cambia la vara cuando dejás de ser alguien que solo implementa y empezás a ser alguien que también decide, coordina y eleva el nivel del sistema.
