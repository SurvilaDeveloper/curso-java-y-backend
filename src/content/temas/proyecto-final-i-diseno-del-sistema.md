---
title: "Proyecto final I: diseño del sistema"
description: "Cómo encarar el diseño de un sistema backend final con criterio profesional, eligiendo un alcance realista, definiendo módulos, datos, flujos críticos, integraciones, riesgos y decisiones de arquitectura antes de empezar a implementar." 
order: 247
module: "Cloud, despliegue, carrera y proyecto final"
level: "intermedio"
draft: false
---

## Introducción

Llegados a este punto del roadmap, ya no alcanza con entender temas sueltos.

Ya recorriste ideas sobre:

- integraciones
- arquitectura interna
- escalabilidad
- mantenibilidad
- seguridad
- microservicios
- SaaS y producto B2B
- e-commerce
- datos y reporting
- cloud y despliegue
- documentación
- entrevistas
- y justificación de decisiones

Ahora toca hacer algo distinto.

Toca unir todo eso en un sistema coherente.

Ese es el sentido del proyecto final.

No como “trabajo práctico escolar”, sino como ejercicio de nivel profesional.

Un ejercicio donde tenés que pasar de piezas aisladas a una visión completa.

Y esa transición importa mucho.

Porque en backend real, una gran parte del valor no está en escribir código rápido.
Está en poder:

- definir bien el problema
- elegir un alcance razonable
- separar responsabilidades
- anticipar riesgos
- justificar decisiones
- y diseñar un sistema que podría vivir de verdad

De eso trata esta primera parte.

No vamos a implementar todavía.
Primero vamos a diseñar.

Y diseñar bien no es dibujar cajas lindas.
Es transformar una necesidad de producto en un sistema backend defendible.

## Qué significa realmente “diseñar el sistema”

Mucha gente escucha “diseño del sistema” y piensa enseguida en un diagrama con:

- una API
- una base de datos
- una cache
- una cola
- y un par de flechas

Pero eso solo no alcanza.

Diseñar un sistema backend implica tomar decisiones sobre cosas como:

- qué problema exacto resolvés
- qué partes del negocio importan más
- qué flujos son críticos
- qué módulos o límites conviene separar
- cómo se almacenan los datos
- qué consistencia necesita cada operación
- qué integraciones externas participan
- qué fallas esperás
- cómo observás el sistema
- cómo protegés seguridad y permisos
- y cómo harías que el sistema evolucione sin explotar cuando cambie

En otras palabras:

el diseño no es un dibujo.
Es una **estructura de decisiones**.

## El objetivo del proyecto final

El proyecto final no debería intentar demostrar que conocés todas las tecnologías del mundo.

Debería demostrar algo más importante:

que sabés pensar un backend real con criterio.

Eso significa mostrar que podés:

- delimitar alcance
- priorizar lo importante
- evitar complejidad innecesaria
- elegir una arquitectura razonable
- justificar trade-offs
- y preparar una base sólida para implementar después

Un buen proyecto final no necesita ser gigantesco.

De hecho, muchas veces es mejor que sea:

- acotado
- creíble
- coherente
- y bien defendido

antes que enorme, difuso y lleno de features desconectadas.

## Elegir el tipo de sistema: ni demasiado chico ni artificialmente gigante

Una de las primeras decisiones importantes es **qué sistema vas a diseñar**.

Acá hay dos errores comunes.

### Error 1. Elegir algo demasiado simple

Por ejemplo:

- un CRUD sin reglas reales
- una app de notas demasiado básica
- o un sistema donde casi no hay estados, permisos, integraciones ni problemas interesantes

Eso te deja poco espacio para mostrar criterio backend.

### Error 2. Elegir algo absurdamente ambicioso

Por ejemplo:

- “voy a diseñar un Uber + Mercado Libre + Stripe + AWS + IA en un solo proyecto”

Eso suele terminar en humo.

Hay demasiadas piezas, demasiados supuestos y poca profundidad real.

### Qué conviene entonces

Conviene elegir un sistema con suficiente riqueza para obligarte a pensar bien, pero con un alcance que puedas explicar y defender.

Algunos tipos de proyecto que suelen servir mucho son:

- una plataforma SaaS B2B con tenants, roles, billing y configuración por plan
- un e-commerce con catálogo, stock, checkout, órdenes, pagos y backoffice
- un sistema de logística con envíos, tracking, estados, incidentes y eventos
- una plataforma de turnos o reservas con disponibilidad, pagos y notificaciones
- un sistema de soporte o customer operations con tickets, SLAs, auditoría y automatizaciones
- una plataforma interna de gestión para empresas con permisos finos, exportaciones e integraciones

Lo importante no es el nombre del sistema.
Lo importante es que tenga:

- reglas de negocio
- estados
- roles o permisos
- alguna integración
- operaciones críticas
- y decisiones de arquitectura interesantes

## Cómo elegir bien el alcance del proyecto

Una buena forma de acotar el sistema es pensar en términos de **núcleo** y **bordes**.

### El núcleo

Es el corazón del producto.
Lo que realmente resuelve valor.

### Los bordes

Son capacidades útiles, pero no esenciales para demostrar el sistema.

Por ejemplo, en un e-commerce:

- núcleo: catálogo, carrito, checkout, órdenes, stock, pagos
- bordes: recomendaciones, afiliados, cupones complejísimos, marketplace multi-seller global, etc.

En un SaaS B2B:

- núcleo: tenant, usuarios, roles, plan, acceso por plan, billing, auditoría
- bordes: SSO empresarial avanzado, workflows visuales, marketplace de extensiones, IA, etc.

Esto es importante porque un buen proyecto final no intenta resolver todo.
Intenta definir claramente **qué sí entra** y **qué queda fuera**.

Eso también es diseño.

## Primera capa del diseño: entender el producto y sus actores

Antes de hablar de módulos, bases o eventos, conviene entender el producto.

Preguntas útiles:

- ¿quién usa el sistema?
- ¿qué tipo de actores hay?
- ¿qué objetivos tiene cada actor?
- ¿qué operaciones generan valor?
- ¿qué operaciones son más sensibles?
- ¿qué estados importan para el negocio?
- ¿qué restricciones o reglas son críticas?

En esta etapa suele servir identificar:

- usuarios principales
- administradores
- operadores internos
- integraciones externas
- procesos automáticos

Eso te ayuda a no diseñar desde infraestructura hacia arriba.
Te obliga a diseñar desde el negocio hacia abajo.

## Segunda capa: definir los flujos críticos

Una vez que entendés el producto, conviene identificar los flujos que más importan.

No todos los flujos pesan igual.

En casi cualquier sistema hay:

- un flujo principal de generación de valor
- flujos secundarios de soporte
- y flujos administrativos u operativos

Por ejemplo, en un SaaS B2B:

- alta de tenant y organización
- invitación y gestión de usuarios
- asignación de roles
- suscripción o cambio de plan
- acceso a funcionalidades según entitlements
- auditoría de acciones sensibles

En un e-commerce:

- exploración de catálogo
- reserva o validación de stock
- checkout
- creación de orden
- intento de pago
- confirmación o compensación
- fulfillment y tracking

Tener bien definidos estos flujos cambia todo.

Porque el diseño backend debería optimizar primero el camino crítico.
No los casos exóticos.

## Tercera capa: definir módulos, límites y responsabilidades

Recién ahí empieza a tener sentido hablar de arquitectura interna.

Una buena pregunta no es:

> ¿Uso microservicios o monolito?

Una mejor pregunta es:

> ¿Qué responsabilidades distintas existen en este sistema y qué límites conviene marcar desde el diseño?

Muchas veces, para un proyecto final, un **monolito modular** bien pensado es una excelente decisión.

Porque te permite mostrar:

- separación de responsabilidades
- contratos internos claros
- ownership conceptual
- y posibilidades de evolución futura

sin pagar el costo operativo de una arquitectura distribuida desde el día uno.

Podés pensar en módulos como:

- identidad y acceso
- catálogo
- inventario
- pricing
- checkout
- órdenes
- pagos
- notificaciones
- reporting
- administración

O, en un SaaS:

- tenants
- organizaciones
- usuarios y roles
- suscripciones
- billing
- entitlements
- auditoría
- soporte
- integraciones

Lo importante no es dibujar muchos módulos.
Lo importante es que cada módulo tenga una responsabilidad clara.

## Cuarta capa: decidir modelo de datos y consistencia

Acá es donde muchos diseños se vuelven flojos si no prestan atención.

Porque una gran parte de los problemas backend reales no viene de controladores o endpoints.
Viene de:

- mal modelado
- límites confusos
- ownership poco claro
- reglas críticas no representadas bien
- y decisiones de consistencia mal pensadas

Preguntas útiles en esta capa:

- ¿qué entidades principales existen?
- ¿qué relaciones importan de verdad?
- ¿qué datos son fuente de verdad?
- ¿qué datos pueden derivarse?
- ¿qué operaciones necesitan transacción fuerte?
- ¿qué operaciones toleran consistencia eventual?
- ¿qué estados deben modelarse explícitamente?
- ¿qué eventos conviene registrar?

Por ejemplo, en órdenes y pagos:

- no es lo mismo “pago intentado” que “pago confirmado”
- no es lo mismo “orden creada” que “orden lista para fulfillment”
- no es lo mismo “stock disponible visualmente” que “stock comprometido para una compra”

Diseñar el sistema implica capturar estas diferencias.

## Quinta capa: decidir qué es síncrono y qué es asíncrono

No todo debería resolverse en la misma transacción o en el mismo request.

Una parte importante del diseño consiste en decidir:

- qué necesita respuesta inmediata
- qué puede dispararse después
- qué acciones toleran cola o delay
- qué procesos requieren reintentos
- y qué eventos conviene emitir para desacoplar flujos

Por ejemplo:

- confirmar creación de una orden puede ser síncrono
- enviar email puede ser asíncrono
- recalcular proyecciones para reporting puede ser asíncrono
- disparar webhooks a terceros también puede ser asíncrono
- reintentar una conciliación o una sincronización suele ser asíncrono

Esto muestra madurez.

Porque un diseño backend profesional no mete todo adentro del request web por comodidad.

## Sexta capa: definir integraciones externas y sus riesgos

Si tu sistema toca el mundo real, casi seguro depende de integraciones.

Pueden ser:

- pagos
- email
- almacenamiento
- ERP
- carriers
- proveedores externos
- identidad
- analítica
- facturación

Y cada integración trae preguntas de diseño:

- ¿qué pasa si está caída?
- ¿qué timeouts tengo?
- ¿cómo reintento?
- ¿qué hago si la operación queda ambigua?
- ¿cómo idempotentizo?
- ¿cómo observo esas llamadas?
- ¿cómo versiono contratos?

Un muy buen proyecto final no ignora esto.
Aunque no implemente todos los detalles, deja claro **cómo pensaría esos riesgos**.

## Séptima capa: seguridad, permisos y acciones sensibles

Un sistema final serio no puede hablar solo de funcionalidad.

También tiene que responder:

- ¿quién puede hacer qué?
- ¿qué permisos existen?
- ¿hay roles globales y roles por tenant u organización?
- ¿qué acciones requieren auditoría?
- ¿qué datos son sensibles?
- ¿qué accesos deben quedar trazados?
- ¿qué riesgos de abuso o fraude existen?

Aunque tu proyecto no sea específicamente de seguridad, incluir esta capa mejora muchísimo la credibilidad del diseño.

Porque muestra que entendés que backend real también es:

- control de acceso
- trazabilidad
- protección de datos
- y defensa ante uso incorrecto o malicioso

## Octava capa: operación y observabilidad desde el diseño

Muchos diseños se quedan en:

- endpoints
- tablas
- y módulos

Pero un sistema backend real también necesita poder operarse.

Por eso, en el diseño final conviene dejar claro:

- qué métricas serían importantes
- qué eventos o logs querés registrar
- qué flujos querés trazar
- qué alertas tendrían sentido
- qué dashboards ayudarían a operar
- qué fallas serían críticas
- y qué tareas manuales necesitaría eventualmente el equipo

Por ejemplo:

- tasa de errores por operación crítica
- latencia del checkout o del alta de tenant
- pagos ambiguos o pendientes de conciliación
- jobs retrasados
- colas acumuladas
- fallos de integración externa
- exportaciones pesadas en curso

Esto eleva muchísimo el nivel del proyecto.

## Novena capa: evolución futura del sistema

Una gran señal de madurez es mostrar que tu diseño no solo resuelve el presente.
También piensa en cómo podría crecer.

Eso no significa sobre-ingeniería.

Significa poder responder preguntas como:

- si crece el volumen, ¿qué parte sería cuello de botella?
- si aparecen más tenants o más organizaciones, ¿qué cambia?
- si una integración se vuelve crítica, ¿qué reforzarías?
- si el catálogo o el tráfico crecieran mucho, ¿qué modularizarías primero?
- si una parte necesitara ownership separado, ¿qué límite ya quedó preparado?

Un buen diseño final no tiene que implementar ese futuro.
Pero sí debería mostrar una evolución razonable posible.

## Qué entregables conviene producir en esta fase

Aunque el curso esté en Markdown y el proyecto no tenga que ser formalmente corporativo, sirve mucho pensar en entregables concretos.

Por ejemplo:

### 1. Resumen del producto

Qué sistema es, a quién sirve y qué problema resuelve.

### 2. Alcance

Qué entra y qué queda fuera.

### 3. Actores y roles

Quiénes interactúan con el sistema.

### 4. Flujos críticos

Cuáles son las operaciones centrales del negocio.

### 5. Mapa de módulos

Qué responsabilidades existen y dónde vive cada una.

### 6. Modelo de datos conceptual

Entidades principales, relaciones, ownership y estados importantes.

### 7. Integraciones externas

Con qué servicios terceros hablás y qué riesgos tienen.

### 8. Procesos asíncronos y eventos

Qué se desacopla del request principal y por qué.

### 9. Seguridad y permisos

Qué acciones sensibles existen y cómo se controlarían.

### 10. Observabilidad y operación

Qué señales necesitarías para operar el sistema.

### 11. Riesgos y trade-offs

Qué decisiones tomaste y qué costo aceptaste.

### 12. Plan de evolución

Cómo crecería el sistema si aumentaran volumen, criticidad o complejidad.

## Un template mental muy útil para presentar tu diseño

Cuando tengas que explicarlo, puede servirte esta secuencia:

### 1. Problema y contexto

Qué hace el producto y para quién.

### 2. Alcance elegido

Qué resolvés en esta versión del sistema.

### 3. Flujos críticos

Cuáles son los recorridos que más importan.

### 4. Arquitectura general

Qué módulos definiste y por qué.

### 5. Datos y consistencia

Cómo modelaste entidades, estados y operaciones sensibles.

### 6. Integraciones y asincronía

Qué depende de terceros y qué desacoplaste.

### 7. Seguridad y operación

Cómo protegés y observás el sistema.

### 8. Riesgos y evolución

Qué cosas dejarías preparadas para crecer después.

Esa estructura te ayuda a no perderte y a defender el proyecto con claridad.

## Qué errores aparecen mucho en esta etapa

### 1. Empezar por tecnología en lugar de empezar por problema

“Voy a hacer microservicios con Kafka y Kubernetes” no es una definición de sistema.

### 2. Querer meter todo

Un proyecto final demasiado grande suele quedar superficial.

### 3. No definir límites

Si todo parece mezclado, el diseño pierde fuerza.

### 4. Ignorar consistencia y estados

En backend, eso suele romper el corazón del sistema.

### 5. No pensar en operación

Un sistema que no se puede observar ni operar está incompleto.

### 6. No explicitar trade-offs

Las mejores decisiones suelen ser defendibles justamente porque reconocen su costo.

### 7. Diseñar una arquitectura espectacular para un problema que todavía no la necesita

Eso suele sonar menos profesional, no más.

## Una señal de muy buen nivel: saber justificar por qué algo todavía no lo harías

Esto merece una sección aparte.

Muchas veces, un gran proyecto final no impresiona porque tenga todo.
Impresiona porque sabe decir:

- esto hoy lo dejaría dentro de un monolito modular
- esta proyección sería eventual, no transaccional
- esta integración la pondría detrás de un puerto claro
- esta auditoría sería obligatoria desde el principio
- esto lo instrumentaría con métricas antes de optimizarlo
- y esta separación en servicios recién la haría si creciera esta parte específica

Eso muestra criterio.

Porque demuestra que no estás diseñando para una fantasía tecnológica.
Estás diseñando para una realidad evolutiva.

## Cierre

El proyecto final empieza mucho antes de escribir código.

Empieza cuando sos capaz de transformar conocimientos sueltos en una propuesta de sistema coherente.

Diseñar el sistema significa:

- elegir bien el problema
- acotar el alcance
- entender actores y flujos
- separar módulos con criterio
- modelar datos y estados importantes
- decidir qué requiere consistencia fuerte y qué tolera asincronía
- pensar integraciones, seguridad y operación
- y dejar clara una ruta de evolución razonable

Si hacés bien esta parte, la implementación después deja de ser una suma de archivos.
Empieza a convertirse en la materialización de decisiones conscientes.

Y eso ya es trabajar mucho más cerca de cómo piensa un backend engineer profesional.

## Próximo paso

En la próxima lección vamos a pasar de la arquitectura pensada a la arquitectura materializada:

**proyecto final II: implementación guiada**, donde vamos a bajar este diseño a componentes concretos, definir qué construir primero y cómo convertir una buena idea de sistema en una implementación ordenada y defendible.
