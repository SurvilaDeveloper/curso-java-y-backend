---
title: "Entitlements y feature access por plan"
description: "Cómo modelar en un SaaS qué capacidades tiene realmente cada cliente, separando plan comercial, suscripción, flags, límites y reglas de acceso para poder habilitar, restringir y auditar features sin llenar el backend de ifs frágiles ni romper contratos comerciales." 
order: 176
module: "SaaS, billing y producto B2B"
level: "intermedio"
draft: false
---

## Introducción

En el tema anterior vimos que en un SaaS real no alcanza con cobrar bien.
También hay que medir bien.

Porque si el sistema no separa correctamente:

- evento técnico
- métrica de uso
- agregación
- pricing
- invoice

termina siendo imposible explicar después por qué se cobró cierto monto.

Ahora aparece otra capa igual de importante.

Porque aunque midas y factures bien, todavía falta responder preguntas como:

- ¿qué puede usar realmente cada cliente?
- ¿qué features están incluidas en su plan?
- ¿qué límites aplican?
- ¿qué cosas están habilitadas por contrato y cuáles no?
- ¿qué pasa si una empresa tiene una excepción comercial?
- ¿qué pasa si el plan cambia a mitad de ciclo?
- ¿cómo evitás llenar el sistema de `if plan == ...` por todos lados?

Y ahí entramos en un tema central en cualquier producto SaaS serio:

**entitlements y feature access por plan.**

Porque una cosa es vender planes.
Otra, mucho más importante, es hacer que el backend sepa con claridad qué capacidades corresponden a cada tenant en cada momento.

## El error más común: creer que el plan ya resuelve el acceso

Muchos sistemas empiezan así:

- `FREE`
- `PRO`
- `BUSINESS`
- `ENTERPRISE`

Y después en el código aparecen cosas como:

- si el plan es `PRO`, dejar exportar CSV
- si el plan es `BUSINESS`, habilitar API
- si el plan es `ENTERPRISE`, permitir SSO
- si el plan es `FREE`, limitar cantidad de usuarios

Al principio parece suficiente.
Pero con el tiempo empieza a romperse.

Porque en un SaaS real aparecen enseguida situaciones como:

- un cliente `BUSINESS` tiene una excepción y recibe una feature enterprise
- un cliente `PRO` conserva temporalmente una capability vieja por compatibilidad
- una feature entra en beta solo para algunos tenants
- hay límites distintos por región o contrato
- una misma capability depende de varias condiciones y no solo del nombre del plan
- producto quiere hacer rollout progresivo sin cambiar toda la oferta comercial

Entonces el problema aparece muy rápido.

**el nombre del plan no debería ser la única fuente de verdad para decidir acceso.**

## Qué son realmente los entitlements

Cuando hablamos de entitlements no hablamos solo de “features prendidas o apagadas”.
Hablamos del conjunto de derechos operativos que un tenant tiene dentro del producto.

Por ejemplo, un entitlement puede expresar cosas como:

- puede usar SSO
- puede crear hasta 20 workspaces
- puede exportar reportes
- puede acceder a API pública
- puede usar auditoría avanzada
- puede activar retención extendida
- puede tener soporte prioritario
- puede invitar usuarios externos
- puede usar cierto módulo del producto

En otras palabras:

**entitlement = capacidad o permiso de producto concedido a un cliente bajo ciertas reglas.**

Y esas reglas pueden provenir de varias fuentes:

- plan comercial
- add-on comprado
- contrato enterprise
- promo temporal
- beta o rollout progresivo
- override manual autorizado

## Plan, suscripción, entitlement y acceso no son lo mismo

Ésta es una separación muy importante.

### Plan

Es la oferta comercial.
Por ejemplo:

- Starter
- Pro
- Business
- Enterprise

### Suscripción

Es la relación concreta entre un tenant y un plan en cierto período.

Incluye cosas como:

- plan actual
- ciclo de billing
- estado
- fecha de inicio
- fecha de renovación
- transición programada

### Entitlement

Es la capacidad efectiva derivada de esa suscripción y otras reglas.

Por ejemplo:

- `api_access = true`
- `max_users = 50`
- `sso = false`
- `audit_logs = true`
- `data_retention_days = 365`

### Access enforcement

Es el punto del sistema donde realmente se decide:

- permitir
- denegar
- degradar
- limitar
- mostrar aviso
- ocultar funcionalidad

Si estas capas se mezclan, el producto se vuelve muy difícil de evolucionar.

## El backend no debería preguntar “qué plan tiene”, sino “qué derecho tiene”

Éste es un cambio mental importante.

En vez de escribir lógica como:

- `if plan == ENTERPRISE`
- `if plan in [PRO, BUSINESS]`
- `if plan != FREE`

conviene tender hacia algo más expresivo como:

- `hasEntitlement("sso")`
- `getLimit("max_projects")`
- `canUse("advanced_audit")`
- `isFeatureEnabledForTenant("api_tokens")`

¿Por qué?

Porque eso desacopla el código de aplicación del catálogo comercial puntual.

Si mañana cambian los planes, querés tocar:

- mapeos comerciales
- configuración de catálogo
- reglas de entitlement

pero no reescribir veinte servicios distintos.

## Tipos comunes de entitlement

No todos los entitlements son booleanos.

Ésta es una distinción clave.

### Booleanos

- tiene o no tiene una capability
- ejemplo: SSO habilitado

### Cuantitativos

- definen un límite o capacidad máxima
- ejemplo: máximo 25 usuarios

### Cualitativos

- habilitan un nivel de servicio o modo especial
- ejemplo: soporte priority, región dedicada, retención extendida

### Condicionales

- valen solo bajo ciertas condiciones
- ejemplo: acceso beta solo para ciertos tenants durante una ventana

### Temporales

- cambian según fecha efectiva
- ejemplo: feature activa desde el próximo ciclo

### Compuestos

- dependen de más de una cosa
- ejemplo: puede usar API premium si tiene módulo X y además región soportada

Si el sistema trata todos los entitlements como un simple `true/false`, tarde o temprano queda corto.

## Un modelo sano suele separar catálogo comercial de catálogo de capacidades

En muchos productos ayuda pensar dos catálogos relacionados, pero distintos.

### Catálogo comercial

Describe lo que ventas y billing venden.
Por ejemplo:

- planes
- add-ons
- bundles
- precios
- ciclos
- vigencias

### Catálogo de capacidades

Describe lo que el producto entiende como capacidades operativas.
Por ejemplo:

- `feature.api_access`
- `feature.sso`
- `limit.max_users`
- `limit.max_storage_gb`
- `feature.audit_logs`
- `service.priority_support`

Después hay un mapeo entre ambos.

Por ejemplo:

- plan `PRO` otorga `api_access`, `export_csv`, `max_users = 20`
- add-on `Advanced Security` agrega `sso`, `audit_logs`
- contrato enterprise aplica `retention_days = 365`

Esta separación vuelve muchísimo más estable al backend.

## El error de hardcodear acceso en muchos lugares

Otro problema muy común es éste:

- frontend oculta un botón según plan
- backend A permite la operación según plan
- backend B usa otra regla parecida pero no igual
- dashboard muestra límites calculados con otra lógica
- soporte consulta una tabla distinta

Resultado:

- la UI dice una cosa
- la API dice otra
- el cliente ve inconsistencias
- producto no sabe cuál es la regla real

Por eso conviene que exista una fuente de verdad clara para resolver entitlements.

No significa que todo deba depender de un único servicio remoto desde el día uno.
Pero sí que la lógica de acceso no quede dispersa y duplicada sin control.

## Feature flags y entitlements no son exactamente lo mismo

Este punto suele generar confusión.

Una **feature flag** suele servir para:

- rollout progresivo
- testing interno
- beta controlada
- apagar o prender comportamiento
- experimentar sin desplegar de nuevo

Un **entitlement** suele servir para:

- definir qué derecho tiene un cliente
- expresar contrato comercial
- aplicar límites de producto
- sostener decisiones de acceso estables en el tiempo

A veces se combinan.
Pero no son la misma cosa.

Ejemplo:

- una feature puede estar habilitada por entitlement para enterprise
- pero además protegida por feature flag porque todavía está en beta

En ese caso, para usarla se necesitan ambas condiciones:

- derecho comercial
- activación operativa o rollout

## Límites también son parte del acceso

Una capability no siempre se expresa como “sí” o “no”.
Muchas veces se expresa como cuánto.

Por ejemplo:

- cantidad máxima de usuarios
- cantidad de proyectos
- espacio de almacenamiento
- cantidad de dashboards
- número de tokens API
- frecuencia máxima de ejecuciones

Entonces acceso y límites están relacionados.

Porque el sistema no solo debe responder:

- “¿puede crear un proyecto?”

También debe responder:

- “¿puede crear uno más?”
- “¿qué pasa al llegar al límite?”
- “¿bloqueamos, degradamos o vendemos excedente?”

Por eso, en muchos SaaS, el entitlement model incluye tanto:

- features booleanas
- límites cuantitativos

## Overrides: la realidad enterprise siempre rompe los modelos rígidos

En producto real aparecen excepciones.
Y no son raras.

Por ejemplo:

- un cliente estratégico recibe una feature antes del lanzamiento general
- un tenant conserva un límite viejo por contrato histórico
- una empresa compra un add-on custom
- se otorga una ampliación temporal por soporte
- un partner recibe capacidades especiales

Si el diseño no contempla overrides, la reacción típica es peligrosa:

- tocar datos a mano
- meter ifs por tenant en código
- parchear una tabla sin historia ni auditoría

Eso degrada muchísimo el sistema.

Conviene aceptar desde temprano que existirán excepciones controladas.
Y que esas excepciones deberían ser:

- explícitas
- auditables
- reversibles
- con vigencia clara
- limitadas a procesos autorizados

## Temporalidad: el entitlement correcto depende del momento

Otra trampa común es olvidar el tiempo.

Porque el acceso correcto no siempre es “lo que el cliente tiene hoy”.
A veces importa:

- lo que tenía ayer
- lo que tendrá el próximo ciclo
- lo que tenía al emitirse cierta factura
- lo que estaba vigente cuando ocurrió una acción

Ejemplos:

- downgrade programado para fin de período
- upgrade inmediato con acceso instantáneo
- cancelación efectiva al cierre del ciclo
- add-on temporal por promoción
- feature habilitada desde cierta fecha contractual

Entonces en sistemas más serios conviene poder responder:

- qué entitlements tiene el tenant ahora
- qué entitlements tendrá después
- qué entitlements tuvo en cierto momento histórico

Sin esta dimensión temporal, soporte, billing y auditoría terminan discutiendo sobre estados pasados imposibles de reconstruir.

## Acceso no siempre significa bloquear: a veces significa degradar o avisar

Cuando un tenant no tiene un entitlement, la respuesta no siempre debe ser un simple `403`.

Según el caso, el sistema podría:

- bloquear la operación
- dejar ver pero no editar
- permitir un uso parcial
- mostrar aviso de upgrade
- permitir trial limitado
- permitir sobreuso temporal
- encolar acceso hasta aprobación

Esto importa mucho porque acceso y experiencia de producto van juntos.

Por ejemplo:

- no tener exportación avanzada puede mostrar CTA comercial
- superar cierto límite puede permitir compra de add-on
- no tener SSO puede bloquear configuración pero no romper el resto del workspace

Entonces la capa de entitlements debería ayudar no solo a negar, sino también a expresar el tipo de respuesta adecuada.

## Qué conviene auditar

Cuando el acceso depende de reglas comerciales y overrides, conviene poder reconstruir:

- por qué el tenant tenía cierta capability
- desde cuándo la tenía
- qué plan o add-on la otorgó
- qué override la modificó
- quién aplicó ese override
- cuándo vencía
- qué regla se evaluó al momento de una acción

Esto es valioso para:

- soporte
- ventas
- customer success
- auditoría interna
- disputas comerciales
- debugging de permisos

Si nadie puede explicar por qué un cliente tuvo acceso a algo, tarde o temprano aparece un problema operativo.

## Un ejemplo conceptual sano

Imaginá un SaaS de colaboración con estos planes:

- Starter
- Pro
- Enterprise

Y estas capacidades posibles:

- `feature.api_access`
- `feature.audit_logs`
- `feature.sso`
- `limit.max_users`
- `limit.max_projects`

Podrías modelar algo así:

1. el catálogo comercial define que `Pro` incluye `api_access` y ciertos límites
2. `Enterprise` agrega `sso`, `audit_logs` y límites más altos
3. el tenant contrata `Pro`
4. la suscripción vigente se resuelve contra el catálogo de capacidades
5. el sistema genera o calcula el conjunto efectivo de entitlements
6. un add-on de seguridad agrega `audit_logs`
7. una feature nueva sigue detrás de una flag beta
8. cuando el backend recibe una acción, consulta si el tenant tiene el entitlement y, si corresponde, el límite restante
9. si soporte agrega un override temporal, esa excepción queda auditada con fecha de expiración
10. el frontend consulta la misma resolución efectiva para mostrar correctamente qué puede usar el cliente

Fijate que ahí quedan separadas varias cosas:

- oferta comercial
- suscripción vigente
- derechos efectivos
- rollout operativo
- enforcement técnico
- historial de cambios

Y esa separación es la que vuelve al sistema mantenible.

## Qué conviene decidir explícitamente antes de implementar

Antes de tocar código, ayuda mucho responder preguntas como éstas:

1. ¿qué capacidades de producto vamos a modelar como entitlements?
2. ¿cuáles son booleanas y cuáles cuantitativas?
3. ¿qué parte depende del plan y qué parte de add-ons o contratos?
4. ¿cómo se resuelven overrides excepcionales?
5. ¿cómo representamos vigencia temporal?
6. ¿qué capa del sistema hace enforcement real?
7. ¿cómo evitamos duplicar reglas entre frontend y backend?
8. ¿qué diferencias habrá entre feature flags y entitlements?
9. ¿cómo se audita el acceso efectivo de un tenant?
10. ¿cómo reconstruiríamos por qué un cliente tuvo o no tuvo acceso a una feature en una fecha pasada?

Estas decisiones evitan que el producto termine sostenido por:

- `if` dispersos por plan
- tablas ambiguas
- excepciones manuales sin historia
- límites calculados distinto en cada servicio
- discusiones eternas entre ventas, producto y backend

## Señales de que el modelo de entitlements está mal diseñado

- el código pregunta por nombre de plan en muchos lugares distintos
- frontend y backend toman decisiones de acceso diferentes
- una excepción enterprise obliga a tocar código
- no existe forma limpia de modelar add-ons
- los límites del producto están hardcodeados
- nadie sabe si una capability viene del plan, de una promo o de un parche manual
- un cambio comercial obliga a reescribir lógica en varios servicios
- soporte no puede explicar por qué un tenant tuvo acceso a algo
- no existe historia temporal de cambios de acceso
- feature flags y reglas comerciales están mezcladas sin criterio

Si eso pasa, el problema no es solo de permisos.
Es que el SaaS todavía no separó bien catálogo, suscripción, capacidades efectivas y enforcement.

## Lo que deberías llevarte de esta lección

Si tuvieras que quedarte con una sola idea, que sea ésta:

**en un SaaS real, el acceso por plan no debería depender del nombre comercial del plan, sino de un modelo explícito de entitlements que permita resolver capacidades, límites, excepciones y vigencias con trazabilidad, consistencia y espacio para evolucionar sin romper el producto.**
