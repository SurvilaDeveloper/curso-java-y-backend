---
title: "Cómo pensar onboarding, migraciones y evolución de tenants cuando la plataforma ya tiene clientes vivos"
description: "Entender qué cambia cuando una plataforma multi-tenant necesita incorporar nuevos tenants, migrar clientes existentes o evolucionar configuraciones y modelos de datos sin romper organizaciones que ya están operando sobre el sistema."
order: 110
module: "Microservicios y sistemas distribuidos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- customización por tenant
- configuración
- feature flags
- planes
- capacidades repetibles
- overrides
- variabilidad controlada
- y el riesgo de convertir la plataforma en una suma caótica de excepciones por cliente

Eso ya te dejó una idea muy importante:

> una plataforma multi-tenant madura no puede crecer a base de ifs por cliente; necesita modelar la variación de forma explícita, repetible y operable.

Pero apenas la plataforma ya tiene tenants reales usando el sistema, aparece otra familia de preguntas muy concreta:

> ¿cómo incorporás nuevos tenants, cómo migrás tenants existentes y cómo evolucionás la plataforma sin tratar cada cambio como una intervención manual peligrosa?

Porque una cosa es diseñar multi-tenancy en abstracto.
Y otra muy distinta es convivir con cosas como:

- clientes ya activos
- tenants con datos reales
- configuraciones distintas por organización
- tenants en distintos planes
- flags activados de forma desigual
- onboarding de nuevas cuentas
- cambios de modelo de datos
- upgrades de capacidades
- migraciones de configuración
- tenants que deben pasar por una transición sin dejar de operar

Ahí aparecen ideas muy importantes como:

- **onboarding de tenants**
- **provisioning**
- **bootstrap de organización**
- **migraciones por tenant**
- **evolución gradual**
- **tenants legacy y tenants nuevos**
- **transiciones de configuración**
- **backfill**
- **reconciliación**
- **operación segura sobre clientes vivos**

Este tema es clave porque, cuando la plataforma ya está en producción y atiende clientes reales, el problema ya no es solo “cómo debería ser el diseño ideal”, sino también:

> cómo cambiás esa realidad sin romper a quienes ya confían en el sistema.

## El problema de asumir que todos los tenants nacen iguales y permanecen iguales

Cuando una plataforma recién arranca, es fácil imaginar algo así:

- todos los tenants tienen la misma estructura
- todos se crean igual
- todos usan las mismas features
- todos evolucionan parejo
- y cada cambio nuevo aplica a todos casi al mismo tiempo

Pero en productos reales, muy rápido aparecen diferencias como:

- tenants creados en momentos distintos
- configuraciones heredadas
- planes distintos
- flags distintos
- datos cargados con versiones anteriores
- tenants con integraciones especiales
- clientes enterprise con condiciones propias
- tenants antiguos que aún no pasaron a un flujo nuevo
- tenants recién creados que ya nacen con el modelo actualizado

Entonces aparece una realidad muy importante:

> la plataforma no siempre existe en una única versión lógica uniforme para todos sus tenants al mismo tiempo.

Y eso obliga a pensar evolución de forma bastante más seria.

## Qué significa onboarding de tenants

Dicho simple:

> onboarding de tenants es el proceso mediante el cual una nueva organización, cuenta o cliente entra a la plataforma y queda correctamente provisionada para operar.

Eso puede incluir cosas como:

- creación del tenant
- configuración inicial
- branding o dominio
- usuario owner inicial
- plan o capacidades activadas
- límites
- settings por defecto
- integraciones base
- datos iniciales
- estructuras auxiliares
- flags iniciales
- workflows habilitados

No es solo “insertar un registro”.
En plataformas más serias, el onboarding suele ser un proceso bastante más rico.

## Qué significa provisioning

Podés pensarlo así:

> provisioning es preparar técnica y funcionalmente al tenant para que exista dentro de la plataforma con los recursos, configuraciones y relaciones mínimas que necesita.

Dependiendo del producto, eso podría implicar:

- crear estructuras de datos iniciales
- inicializar configuraciones
- asignar capacidades
- generar espacios o namespaces lógicos
- preparar storage
- crear colas o bindings si existieran
- dar de alta integraciones
- activar el plan correcto
- asociar usuarios fundadores o administradores

La idea importante es que el tenant no aparece mágicamente listo.
Muchas veces hay un proceso de construcción inicial detrás.

## Por qué esto importa tanto

Porque si el onboarding es improvisado o muy manual, empiezan a aparecer problemas como:

- tenants creados con configuraciones incompletas
- diferencias accidentales entre clientes
- soporte lleno de arreglos post-onboarding
- jobs o eventos que asumen datos que el tenant no tiene
- features que “deberían estar” y no están
- incoherencia entre lo vendido y lo provisionado
- deuda operativa desde el día uno

Entonces el onboarding deja de ser un detalle comercial y pasa a ser una parte real de la arquitectura del producto.

## Una intuición muy útil

Podés pensar así:

> crear un tenant nuevo es una forma de despliegue de producto sobre un nuevo espacio de negocio.

Esta idea ayuda muchísimo.
Porque te hace ver que el onboarding necesita:

- consistencia
- repetibilidad
- defaults sanos
- validación
- observabilidad
- y a veces rollback o corrección

igual que otras operaciones importantes del sistema.

## Qué tipo de cosas suelen necesitar valores por defecto razonables

Por ejemplo:

- timezone
- moneda
- branding base
- roles iniciales
- límites del plan
- módulos habilitados
- templates
- políticas de retención
- feature flags iniciales
- comportamiento de notificaciones
- configuraciones regionales o fiscales si aplica

No todo tiene que ser configurable desde el primer minuto.
Pero sí conviene que el sistema sepa arrancar un tenant con un estado razonable y coherente.

## Qué problema aparece con tenants viejos y nuevos

Este es uno de los más clásicos.

Supongamos que la plataforma evoluciona y mejora cierto modelo.
Los tenants nuevos podrían crearse directamente con ese modelo actualizado.
Pero los viejos ya existen, tienen datos reales y no siempre podés “rehacerlos” desde cero.

Entonces aparecen preguntas como:

- ¿cómo pasan los tenants antiguos al nuevo esquema?
- ¿todos deben migrar a la vez?
- ¿pueden convivir tenants con estructuras o flags distintas?
- ¿hay backfill de datos?
- ¿qué pasa si un tenant queda a mitad de migración?
- ¿qué parte del sistema tiene que tolerar coexistencia?

Esto convierte la evolución multi-tenant en un problema mucho más real y continuo.

## Qué significa migrar un tenant

Dicho simple:

> migrar un tenant significa llevar a esa organización de un estado viejo o anterior del producto hacia otro más nuevo, ya sea en datos, configuración, capacidades, workflows o comportamiento.

Eso puede ser, por ejemplo:

- mover configuración de un modelo viejo a uno nuevo
- cambiar un workflow de checkout
- pasar de una integración antigua a otra
- recalcular defaults
- introducir nuevos campos o estructuras
- activar un módulo nuevo
- transformar datos legados
- separar settings que antes estaban mezclados
- consolidar varias flags en una capacidad más formal

No toda migración es de base de datos.
Muchas son migraciones de comportamiento o de configuración.

## Qué diferencia hay entre migración global y migración por tenant

Muy importante.

### Migración global
Afecta a toda la plataforma de una forma bastante uniforme.

### Migración por tenant
Puede requerir:
- distinto timing
- distinto plan
- distinta validación
- distinto soporte
- o incluso distinta estrategia según características del tenant

En sistemas multi-tenant reales, muchas veces esta segunda forma aparece más de lo que uno imaginaría al principio.

## Un ejemplo claro

Supongamos que antes el sistema tenía una sola configuración booleana:

- `advancedCheckout = true/false`

Y ahora querés pasar a un modelo más rico con:

- capacidades
- flujos
- variantes
- planes

Los tenants nuevos pueden nacer ya con ese modelo.
Pero los viejos quizá todavía dependan del flag anterior.

Entonces necesitás una transición como:

1. introducir la nueva estructura
2. mapear desde la configuración vieja
3. convivir un tiempo
4. migrar tenants
5. retirar gradualmente el esquema anterior

Eso es mucho más sano que forzar un cambio brusco y simultáneo para todos.

## Qué relación tiene esto con releases seguros

Absolutamente total.

En el tema 103 viste que los releases seguros implicaban:

- compatibilidad temporal
- migraciones graduales
- rollouts
- flags
- convivencia entre versiones

Bueno:
cuando hay tenants vivos, esto se vuelve todavía más cierto.

Porque ahora no solo puede haber convivencia entre versiones de código.
También puede haber convivencia entre:

- tenants antiguos y nuevos
- configuraciones viejas y nuevas
- workflows distintos
- capacidades distintas
- datos pendientes de backfill
- tenants que ya migraron y otros que no

Entonces migrar tenants es, en muchos sentidos, una versión aún más concreta de un release gradual.

## Qué relación tiene esto con feature flags

Muy fuerte.

A veces una migración por tenant se apoya en flags para poder hacer algo como:

- desplegar soporte nuevo
- dejarlo apagado por defecto
- migrar un tenant piloto
- observar
- corregir
- expandir después
- mantener compatibilidad con tenants no migrados mientras tanto

Esto puede ser extremadamente útil.

Pero también conviene evitar que la migración quede eternamente sostenida por flags viejos sin limpieza.
Otra vez aparece la importancia de gobierno y retiro posterior.

## Qué relación tiene esto con datos y backfill

Muy fuerte también.

A veces el nuevo modelo necesita datos que antes no existían explícitamente, o necesita recomputar cosas como:

- campos derivados
- configuraciones nuevas
- proyecciones
- límites
- preferencias
- relaciones
- ownership explícito
- estructuras auxiliares

Entonces aparece el concepto de **backfill**, que, en sentido intuitivo, es completar o recalcular hacia atrás datos necesarios para que el modelo nuevo funcione bien sobre tenants existentes.

Esto puede ser muy delicado, porque:

- puede tomar tiempo
- puede requerir jobs
- puede fallar parcialmente
- puede necesitar reintentos
- puede correr por tenant, por lotes o por ventanas
- y necesita observabilidad seria

## Qué relación tiene esto con jobs y batch

Absolutamente total.

Muchas migraciones por tenant no se resuelven en una sola request ni en una sola migración SQL.
A veces necesitan:

- jobs programados
- procesamiento batch
- recorridas por tenant
- reintentos controlados
- cortes por volumen
- marcadores de progreso
- reconciliación posterior

Por ejemplo:

- recalcular settings para miles de tenants
- regenerar vistas derivadas
- reindexar recursos
- mover archivos o referencias
- migrar configuraciones antiguas a un esquema nuevo

Esto muestra que onboarding y evolución de tenants están muy conectados con todo lo que ya viste sobre jobs, batch y observabilidad.

## Qué relación tiene esto con idempotencia

Muy fuerte.

Si un proceso de onboarding o migración corre dos veces, no debería:

- duplicar estructuras
- romper configuraciones
- volver a crear usuarios owner
- reactivar cosas incorrectamente
- dejar al tenant en un estado peor

Lo mismo con migraciones:
si una etapa se reintenta, conviene que sea lo más idempotente posible.

Eso reduce muchísimo el costo de fallos parciales o reruns operativos.

## Qué relación tiene esto con observabilidad

Total.

No alcanza con “lanzar la migración”.
Después necesitás poder responder cosas como:

- qué tenants ya migraron
- cuáles no
- cuáles fallaron
- en qué paso fallaron
- cuánto falta
- qué jobs siguen pendientes
- si un tenant quedó en estado intermedio
- si los nuevos tenants ya nacen con el modelo correcto
- si la métrica o latencia cambió después del onboarding/migración

Sin eso, la evolución multi-tenant se vuelve extremadamente opaca.

## Qué relación tiene esto con soporte y éxito del cliente

También muy fuerte.

A veces una migración no es solo técnica.
También requiere coordinación con:

- soporte
- customer success
- operaciones
- el cliente mismo
- el equipo de producto

Por ejemplo:

- migrar una configuración
- cambiar una integración
- pasar a un workflow nuevo
- habilitar una capacidad premium
- corregir defaults históricos

Entonces el backend no vive aislado.
La forma de evolucionar tenants impacta directamente la relación con clientes reales.

## Qué relación tiene esto con tiers o planes

Muy interesante también.

A veces la evolución de tenants está conectada a cosas como:

- upgrade de plan
- downgrade
- nueva capacidad contratada
- tenant enterprise migrado a infraestructura diferente
- tenant beta que pasa a comportamiento general
- tenant legacy que por fin entra al modelo estándar

Eso significa que el ciclo de vida de un tenant no es fijo.
Puede cambiar con el producto y con el negocio.
Y el backend tiene que soportar esa evolución con cierta dignidad.

## Qué relación tiene esto con arquitectura futura

Muy fuerte.

Si observás que:

- cierto grupo de tenants necesita otro tratamiento
- cierto onboarding ya no escala
- cierto tipo de migración es demasiado doloroso
- cierto tenant enterprise merece más aislamiento
- cierto modelo de configuración ya no soporta la realidad

entonces onboarding y migraciones también te ayudan a ver **dónde la arquitectura necesita evolucionar**.

No son solo procesos administrativos.
Son señales del diseño real de la plataforma.

## Qué no conviene hacer

No conviene:

- crear tenants nuevos mediante procesos demasiado manuales e inconsistentes
- meter migraciones por tenant como scripts artesanales sin modelo ni observabilidad
- asumir que todos los tenants van a tolerar el mismo cambio al mismo tiempo
- dejar tenants legacy eternamente sin plan de salida
- usar flags como muleta permanente para sostener modelos viejos
- mezclar onboarding, upgrade y migración como si fueran la misma cosa
- no saber qué tenants están en qué versión lógica del producto

Ese tipo de decisiones suele generar una deuda operativa muy seria.

## Otro error común

Pensar que el onboarding es solo una tarea comercial o de UI.
En plataformas serias, es también una operación técnica muy sensible.

## Otro error común

No distinguir entre:
- crear un tenant nuevo
- activar capacidades
- migrar configuración
- migrar datos
- cambiar workflow
- hacer backfill

Cada una de esas cosas puede necesitar estrategia distinta.

## Otro error común

No retirar modelos viejos después de una migración exitosa.
Eso deja a la plataforma acumulando compatibilidad histórica infinita y complejidad innecesaria.

## Una buena heurística

Podés preguntarte:

- ¿cómo nace un tenant nuevo y con qué defaults?
- ¿este cambio aplica a todos los tenants o requiere migración gradual?
- ¿qué tenants siguen en modelo viejo y cómo lo sé?
- ¿necesito backfill o recalcular datos históricos?
- ¿qué parte de esta evolución debería ser idempotente y reintentable?
- ¿cómo observo progreso, fallos y estado final?
- ¿estoy resolviendo una transición de producto o improvisando una cirugía por cliente?

Responder eso te ayuda muchísimo a volver la plataforma más evolucionable y menos artesanal.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque apenas una plataforma multi-tenant tiene clientes vivos, ya no podés cambiarla como si fuera un proyecto vacío.
Cada cambio importante empieza a convivir con:

- tenants existentes
- datos históricos
- configuraciones reales
- planes distintos
- expectativas de clientes
- compatibilidad operativa
- tiempos de rollout

Y ahí onboarding, upgrades y migraciones dejan de ser detalles laterales y pasan a ser una parte central del backend como producto vivo.

## Relación con Spring Boot

Spring Boot puede ser una muy buena base para automatizar y estructurar onboarding, migraciones y procesos por tenant.
Pero el framework no decide por vos:

- cómo nace un tenant
- cómo migra
- cómo convivís con modelos viejos y nuevos
- qué backfill necesitás
- qué observabilidad hace falta
- cuándo una transición ya quedó demasiado larga
- cómo evitar que la evolución multi-tenant se vuelva deuda permanente

Eso sigue siendo criterio de plataforma, operación y producto.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando una plataforma multi-tenant ya tiene clientes vivos, onboarding, migraciones y evolución de tenants dejan de ser tareas auxiliares y pasan a ser parte central de la arquitectura: conviene tratarlas como procesos repetibles, observables, idempotentes y graduales, porque cambiar el producto ya no significa solo escribir código nuevo, sino mover organizaciones reales entre estados vivos sin romper su operación.

## Resumen

- El onboarding de tenants es una operación técnica y funcional importante, no solo la creación de un registro.
- Los tenants no siempre evolucionan todos al mismo tiempo ni parten del mismo estado histórico.
- Las migraciones por tenant pueden incluir configuración, datos, capacidades, workflows y backfill.
- Jobs, flags, releases seguros e idempotencia se conectan fuertemente con esta parte de la plataforma.
- No conviene sostener eternamente modelos viejos ni hacer migraciones artesanales sin observabilidad.
- Este tema vuelve mucho más realista la idea de backend como plataforma viva con clientes reales adentro.
- A partir de acá la arquitectura multi-tenant gana una dimensión todavía más madura: no solo aislar y configurar, sino evolucionar clientes existentes con seguridad operativa.

## Próximo tema

En el próximo tema vas a ver cómo cerrar este gran bloque pensando el backend ya no solo como aplicación técnica, sino como plataforma evolutiva con decisiones de producto, operación y arquitectura cada vez más entrelazadas, porque a esta altura el sistema ya se parece mucho más a una pieza de negocio viva que a una simple API.
