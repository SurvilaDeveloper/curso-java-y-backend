---
title: "Producto configurable vs producto fragmentado"
description: "Cómo distinguir entre una plataforma SaaS que permite variaciones sanas por tenant y un producto que se fue rompiendo en excepciones, por qué la configuración no siempre es flexibilidad real, y cómo diseñar backend, modelo de datos, permisos, flags, workflows y operaciones para soportar necesidades distintas sin convertir el sistema en una suma caótica de versiones disfrazadas." 
order: 189
module: "SaaS, billing y producto B2B"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos cómo pensar:

- costos por tenant
- rentabilidad técnica
- consumo diferencial
- costo de infraestructura
- costo operativo humano
- soporte enterprise
- límites de producto
- complejidad por cuenta

Eso nos deja frente a una tensión muy típica del mundo SaaS B2B.

Porque cuando empezás a vender a clientes distintos, casi siempre aparece la misma presión.

Un cliente quiere un flujo especial.
Otro pide un campo extra.
Otro necesita un permiso distinto.
Otro quiere una integración particular.
Otro necesita reglas de facturación algo diferentes.
Otro quiere branding propio.
Otro pide aprobar operaciones con más pasos.

Entonces el equipo empieza a decir:

**“nuestro producto tiene que ser configurable”.**

Y eso, en principio, suena bien.
De hecho, muchas veces es correcto.

El problema es que no toda “configuración” es sana.
A veces lo que parece flexibilidad es en realidad una forma elegante de ocultar una degradación del producto.

Y ahí aparece la pregunta central de este tema:

**¿estamos construyendo un producto configurable o estamos fragmentando el sistema tenant por tenant?**

Porque la diferencia entre una cosa y la otra es enorme.
Una escala.
La otra erosiona el diseño con el tiempo.

## Configurable no significa “cada cliente tiene su propio sistema”

Un producto configurable permite variaciones **previsibles, modeladas y sostenibles**.

Por ejemplo:

- activar o desactivar módulos
- elegir límites por plan
- definir branding
- parametrizar reglas conocidas
- configurar roles
- elegir métodos de autenticación
- ajustar políticas de aprobación dentro de un marco controlado

Eso no rompe necesariamente el producto.

Sigue habiendo una sola plataforma.
Sigue habiendo un modelo entendible.
Sigue habiendo límites.
Sigue habiendo una semántica común.

En cambio, un producto fragmentado empieza a parecerse a esto:

- excepciones por tenant en código
- ramas de flujo especiales
- queries distintas según cliente
- campos que solo existen para algunas cuentas
- integraciones custom que alteran comportamiento central
- permisos inconsistentes
- pantallas que significan cosas distintas según quién entre
- decisiones operativas ad hoc para sostener compromisos viejos

Desde afuera quizá todavía parece “un solo producto”.
Pero por dentro empieza a comportarse como varias versiones superpuestas.

## Por qué el producto se fragmenta aunque nadie lo quiera hacer

La fragmentación no suele aparecer porque un equipo la elija explícitamente.
Casi siempre aparece por acumulación.

Un pedido aislado parece razonable.
Después viene otro.
Después otro.

Y como cada cambio individual parece pequeño, nadie siente que esté rompiendo nada grande.

El problema aparece cuando mirás el sistema completo.

Entonces descubrís que hay:

- demasiadas flags por tenant
- demasiadas ramas condicionales
- demasiadas excepciones comerciales vivas
- demasiadas diferencias ocultas de comportamiento
- demasiadas dependencias de cuentas específicas

Y lo que se rompió no fue una pieza puntual.
Lo que se erosionó fue la **coherencia del producto**.

## La pregunta correcta no es “¿este cliente necesita algo distinto?”

Esa pregunta casi siempre se responde con un sí.

En B2B, los clientes distintos suelen tener realmente necesidades distintas.

La pregunta más útil es otra:

**¿esto que pide el cliente entra dentro de una variación sana del producto o nos obliga a sostener una excepción que fragmenta el sistema?**

Eso cambia completamente la conversación.

Porque ya no discutís solo si el pedido tiene sentido comercial.
También discutís:

- si es generalizable
- si puede modelarse bien
- si tiene semántica estable
- si convivirá sanamente con otros tenants
- si suma una capacidad reusable
- o si introduce deuda estructural

## Cómo se ve una configuración sana

Una configuración sana suele tener varias propiedades.

### 1. Está modelada explícitamente

No vive dispersa en `if` sueltos por todo el código.

Existe una estructura clara para expresar:

- qué se puede configurar
- quién lo puede cambiar
- qué valores son válidos
- qué impacto tiene cada ajuste

### 2. Tiene límites definidos

No todo se puede cambiar.
Y eso está bien.

Un buen producto configurable no promete flexibilidad infinita.
Promete flexibilidad **dentro de un marco sostenible**.

### 3. Mantiene una semántica común

Dos tenants pueden tener variantes, pero siguen usando el mismo producto.
No deberían vivir en universos conceptuales distintos.

### 4. Es observable

Se puede saber:

- qué configuración tiene cada tenant
- cuándo cambió
- quién la cambió
- qué features activas dependen de eso

### 5. Es testeable

No depende de conocimiento tribal.
Puede validarse con tests, fixtures y ambientes de prueba realistas.

## Cómo se ve la fragmentación disfrazada de configuración

También hay señales bastante claras.

### Señal 1: el comportamiento cambia demasiado según el tenant

No hablamos de diferencias pequeñas.
Hablamos de lógicas enteras que mutan según la cuenta.

### Señal 2: nadie sabe bien todas las excepciones que existen

Producto cree una cosa.
Soporte conoce otra.
Ingeniería sabe otra.
Operación parcheó otras más.

### Señal 3: cada cambio importante obliga a preguntar “¿a qué clientes puede romper?”

Eso va a pasar a veces en cualquier sistema.
Pero si pasa todo el tiempo por diferencias acumuladas entre tenants, hay fragmentación.

### Señal 4: aparecen campos, tablas o reglas que solo tienen sentido para uno o dos clientes

Eso no siempre está mal.
Pero si se vuelve patrón, el modelo empieza a perder universalidad.

### Señal 5: vender una cuenta nueva implica prometer más excepciones

Cuando la venta depende sistemáticamente de aceptar desvíos, el producto deja de escalar como producto.

## La fragmentación castiga a muchas capas al mismo tiempo

No afecta solo a backend.

### Castiga al producto

Porque cuesta entender qué es realmente “la plataforma”.

### Castiga a ingeniería

Porque cada cambio tiene más riesgo, más ramas y más combinaciones posibles.

### Castiga a soporte

Porque cada cuenta parece tener reglas particulares difíciles de recordar.

### Castiga a ventas y customer success

Porque se vuelve difícil saber qué está soportado de verdad y qué depende de arreglos especiales.

### Castiga a la rentabilidad técnica

Porque sostener diferencias poco reutilizables cuesta tiempo, foco y dinero.

## Qué cosas suelen ser buenas candidatas a configuración

No toda variación es peligrosa.
De hecho, muchas son muy razonables.

Por ejemplo:

- límites por plan
- branding
- dominios personalizados
- políticas de acceso conocidas
- roles y permisos dentro de un marco estable
- umbrales, ventanas y parámetros operativos
- catálogos configurables
- activación de módulos bien diseñados
- integraciones opcionales con contratos claros

Todas esas cosas pueden formar parte de un producto sano si están pensadas como capacidades generales.

## Qué cosas suelen empujar a la fragmentación

Hay ciertos pedidos que conviene mirar con mucha más cautela.

Por ejemplo:

- workflows completamente distintos según cliente
- significados distintos para la misma entidad
- campos especiales que alteran lógica central
- reglas comerciales muy particulares embebidas en backend
- permisos que rompen el modelo general
- pantallas que muestran conceptos distintos según la cuenta
- integraciones custom que modifican el core y no solo agregan conectividad
- decisiones históricas que quedan “solo por este cliente” y nunca se revisan

No quiere decir que nunca puedan aceptarse.
Pero si se aceptan, debería quedar claro que tienen costo estructural.

## La trampa de las feature flags eternas

Las flags son útiles.
Muchísimo.

Pero en SaaS B2B a veces se convierten en el escondite perfecto de la fragmentación.

Porque con una flag es muy fácil decir:

- este cliente ve esto
- este otro no
- este tiene una variante de la lógica
- este tiene el flujo viejo
- este todavía usa la integración heredada

Al principio parece prolijo.
Después de un tiempo nadie entiende:

- qué flags siguen activas
- cuáles ya deberían morir
- cuáles se combinan entre sí
- cuáles alteran comportamiento crítico
- cuáles convierten el sistema en una matriz inmanejable

La flag sana acompaña un rollout o una variación acotada.
La flag eterna muchas veces es una excepción que no se animó a llamarse por su nombre.

## Backend necesita un modelo de configuración, no un océano de condicionales

Cuando una plataforma madura, no alcanza con tener settings desordenados.

Conviene pensar explícitamente:

- configuración global
- configuración por plan
- configuración por tenant
- overrides excepcionales
- defaults
- precedencia entre capas
- auditoría de cambios
- validación de combinaciones inválidas

Porque si eso no está modelado, el comportamiento se dispersa en:

- código de aplicación
- tablas improvisadas
- variables sueltas
- reglas ocultas en integraciones
- decisiones manuales de operación

Y ahí la plataforma pierde legibilidad.

## No todo pedido enterprise debería transformarse en capacidad de producto

Esta es una decisión muy importante.

A veces un cliente grande pide algo real y valioso.
Y aun así no conviene transformarlo automáticamente en parte estable del producto.

Puede ser mejor resolverlo de otra manera:

- proceso operativo temporal
- servicio profesional separado
- integración externa acotada
- workaround reversible
- contrato enterprise explícito y excepcional

El error es incorporar cualquier necesidad puntual como si fuera evolución natural del core.

Porque cada cosa que entra al producto después hay que:

- mantenerla
- testearla
- documentarla
- explicarla
- monitorearla
- soportarla
- hacerla convivir con el resto

## Generalizar demasiado pronto también puede ser un error

Hay que decirlo.

El problema no es solo aceptar excepciones.
A veces el error opuesto es intentar construir un sistema hiper genérico desde demasiado temprano.

Entonces el equipo crea:

- motores de reglas abstractos
- configuradores enormes
- modelos súper flexibles
- pipelines paramétricos para todo

Y termina con una plataforma difícil de entender, incluso antes de tener evidencia real de qué variaciones necesitaba.

Por eso conviene evitar dos extremos:

- hardcodear excepciones por cliente
- sobrediseñar un meta-producto abstracto sin necesidad

La clave está en modelar **variaciones recurrentes y valiosas**, no todas las variaciones imaginables.

## Cómo evaluar un pedido sin caer en discusiones vagas

Una forma útil es pasar cada pedido por preguntas concretas.

Por ejemplo:

- este cambio sirve solo para un tenant o podría servir para varios
- expresa una necesidad recurrente o una rareza puntual
- puede resolverse como configuración dentro de un marco claro
- altera semántica central del producto
- introduce una excepción difícil de testear
- aumenta mucho la carga operativa
- obliga a sostenerlo por tiempo indefinido
- genera precedente comercial peligroso
- mejora el producto o solo evita perder una venta puntual

No todas las respuestas tienen que ser perfectas.
Pero ayudan a bajar la discusión a un terreno más sano.

## El rol de planes y packaging en evitar la fragmentación

Muchas veces la fragmentación crece porque el producto no definió bien qué ofrece cada capa.

Entonces todo se negocia caso por caso.

Eso es peligroso.

Un mejor packaging puede ayudar mucho.

Por ejemplo:

- plan estándar con capacidades cerradas
- plan avanzado con límites mayores
- plan enterprise con ciertas opciones de configuración adicionales
- servicios profesionales para adaptaciones no core
- integraciones premium separadas

Esto ordena expectativas.
Y evita que cada negociación termine modificando el corazón del sistema.

## Configurar no es esconder complejidad, es domesticarla

Una buena plataforma configurable no elimina la complejidad.
La vuelve explícita, gobernable y sostenible.

Eso implica:

- límites claros
- modelo entendible
- defaults razonables
- visibilidad
- auditoría
- testing
- documentación
- revisión periódica de excepciones

Sin eso, la “flexibilidad” es solo complejidad sin nombre.

## Qué prácticas ayudan a evitar la fragmentación

## 1. Definir qué capas admiten configuración y cuáles no

No todo debería ser configurable.

## 2. Tener un modelo explícito de settings, flags y overrides

La configuración no debería vivir desperdigada.

## 3. Revisar periódicamente excepciones por tenant

Lo excepcional que queda para siempre deja de ser excepcional.

## 4. Distinguir producto de servicio profesional

No todo pedido debe entrar al core.

## 5. Diseñar planes y límites que absorban diferencias recurrentes

Eso reduce negociaciones destructivas caso por caso.

## 6. Medir costo técnico y operativo de las variaciones

Para no decidir solo por presión comercial.

## 7. Matar flags, ramas y compatibilidades que ya no tienen sentido

La limpieza es parte de la estrategia de producto.

## Mini ejercicio mental

Imaginá un SaaS B2B donde cinco clientes grandes piden lo siguiente:

- uno quiere branding completo y dominio custom
- otro necesita un flujo adicional de aprobación
- otro pide campos especiales que cambian el significado de una orden
- otro quiere permisos más finos para ciertos roles
- otro necesita una integración heredada que altera parte del procesamiento

Preguntas para pensar:

- cuáles de esos pedidos parecen configuración sana
- cuáles parecen excepciones que fragmentan el producto
- cuáles merecen entrar al core y cuáles deberían ir por otro carril
- qué parte resolverías con settings o planes
- qué parte exigiría rediseño más profundo
- qué señales mostrarían que el sistema ya está acumulando demasiadas diferencias entre tenants

## Resumen

En SaaS B2B, la presión por adaptarse a clientes distintos es completamente real.
Y por eso la configuración no es un lujo.
Suele ser una capacidad central del producto.

Pero configurable no significa aceptar cualquier diferencia.

Un producto configurable mantiene:

- una semántica común
- límites claros
- variaciones modeladas
- observabilidad
- testabilidad
- sostenibilidad operativa

En cambio, un producto fragmentado acumula:

- excepciones por tenant
- flags eternas
- workflows divergentes
- reglas difíciles de entender
- alto costo de cambio
- soporte confuso
- erosión del diseño

La idea central es esta:

la flexibilidad sana amplía el producto.
La fragmentación lo rompe desde adentro.

Por eso un equipo maduro necesita aprender a distinguir entre:

- variaciones reutilizables
- adaptaciones razonables
- excepciones costosas
- y compromisos que deberían quedarse fuera del core

Porque escalar un SaaS no es solo vender a clientes distintos.
También es lograr que esas diferencias no destruyan la coherencia del sistema.

Y además esto nos prepara para el cierre de la etapa, donde vamos a integrar todo lo visto en este módulo y mirar cómo se conectan tenants, planes, billing, soporte enterprise, configuración, rentabilidad y operación en la construcción de un SaaS real.
