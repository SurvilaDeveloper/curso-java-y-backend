---
title: "Cómo revisar una entidad JPA desde seguridad"
description: "Cómo analizar una entidad JPA en una aplicación Java con Spring Boot desde una mirada de seguridad. Qué campos, relaciones, estados y decisiones de persistencia conviene revisar para detectar sobreexposición, datos innecesarios, riesgos de autorización, problemas de serialización y acumulación de sensibilidad en el modelo."
order: 82
module: "Datos sensibles y base de datos"
level: "base"
draft: false
---

# Cómo revisar una entidad JPA desde seguridad

## Objetivo del tema

Entender cómo revisar una **entidad JPA** desde una mirada de seguridad en una aplicación Java + Spring Boot.

La idea es cambiar el enfoque con el que solemos mirar una entidad.

Normalmente se la revisa pensando en cosas como:

- si modela bien el dominio
- si compila
- si las relaciones funcionan
- si persiste correctamente
- si cubre el caso de uso

Todo eso importa.
Pero desde seguridad faltan otras preguntas igual de importantes:

- ¿qué datos concentra esta entidad?
- ¿qué campos son sensibles?
- ¿qué relaciones arrastran más exposición de la necesaria?
- ¿qué capacidades de lectura o modificación habilita?
- ¿qué cosas nunca deberían salir al cliente?
- ¿qué parte del modelo está creciendo sin control?
- ¿qué datos jamás debieron persistirse ahí?

En resumen:

> una entidad JPA no es solo una estructura de persistencia.  
> También es un lugar donde se acumulan decisiones de exposición, acceso, minimización y riesgo.

---

## Idea clave

Cada entidad importante del sistema es una especie de “nodo de concentración” de seguridad.

Porque en ella se juntan cosas como:

- datos del negocio
- datos sensibles
- relaciones
- estados internos
- ownership
- tenant
- auditoría
- flags técnicos
- decisiones de serialización
- reglas de actualización
- ciclo de vida del dato

Entonces revisar una entidad desde seguridad significa preguntarse no solo:

- “¿está bien modelada?”

sino también:

- “¿qué daño podría causar si se lee, se actualiza, se serializa o se reutiliza mal?”

La idea central es esta:

> una buena revisión de seguridad sobre una entidad intenta descubrir qué exceso de poder, qué exceso de dato o qué exceso de confianza quedaron metidos dentro del modelo.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- meter demasiados campos sensibles en una misma entidad sin pensar alcance
- usar la entidad como si fuera también DTO público
- agregar relaciones por conveniencia que luego exponen demasiado
- no distinguir campos visibles de campos internos
- dejar que cualquier actualización toque más de lo que debería
- olvidar tenant, ownership o soft delete en el diseño del modelo
- acumular metadata histórica o técnica sin criterio
- tratar todos los atributos como si tuvieran el mismo nivel de sensibilidad
- hacer crecer la entidad hasta que nadie pueda explicar qué debería salir, qué debería editarse y qué debería quedar interno

Es decir:

> el problema no es que exista una entidad rica.  
> El problema es que muchas veces esa riqueza no está gobernada por límites claros.

---

## Error mental clásico

Un error muy común es este:

### “La entidad es solo persistencia; la seguridad se ve en controllers o services”

Eso es incompleto.

Porque la entidad influye muchísimo en:

- qué datos existen
- cómo se relacionan
- qué arrastra una lectura
- qué puede copiarse o serializarse
- qué puede cambiar por dirty checking
- qué campos terminan expuestos por conveniencia
- qué propiedades parecen “naturales” para búsquedas, filtros o sort
- qué tan fácil es usar mal el modelo en capas superiores

### Idea importante

La entidad no define toda la seguridad.
Pero sí condiciona bastante el terreno sobre el que después operan repositories, services, serializers y endpoints.

---

## Una entidad se revisa como si fuera un mapa de riesgo

Una forma útil de encarar la revisión es pensar la entidad como un pequeño mapa.

### Ese mapa responde preguntas como:

- ¿qué valor guarda?
- ¿qué cosas sensibles junta?
- ¿qué otras entidades toca?
- ¿qué parte del negocio refleja?
- ¿qué estados internos representa?
- ¿qué campos jamás deberían salir?
- ¿qué campos podrían editarse por error?
- ¿qué datos no deberían vivir ahí por mucho tiempo?
- ¿qué cosas parecen inocentes pero facilitan abuso o correlación?

### Regla sana

No revises una entidad solo como estructura técnica.
Revisala como un concentrado de:

- datos
- poder
- relaciones
- exposición posible

---

## Primera pregunta: ¿qué tipo de dato vive acá?

Antes de entrar en anotaciones o relaciones, conviene hacer una pregunta básica:

> ¿qué clase de información concentra esta entidad?

Por ejemplo, puede concentrar:

- identidad de usuario
- estado de una orden
- datos de pago
- historial de soporte
- información antifraude
- datos administrativos
- contratos o facturación
- tokens o materiales temporales
- metadata técnica

### Por qué importa

Porque no todas las entidades cargan el mismo nivel de riesgo.

No es lo mismo revisar:

- una entidad de catálogo público

que revisar:

- User
- Order
- PaymentMethod
- SupportTicket
- CustomerProfile
- RecoveryToken
- AuditEvent

El tipo de dato ya te dice mucho sobre el rigor que deberías aplicar.

---

## Segunda pregunta: ¿qué campos son sensibles?

Una revisión sana de entidad debería marcar rápido qué campos son:

- públicos
- internos
- sensibles
- críticos

### Ejemplos típicos de campos sensibles o delicados

- email
- teléfono
- dirección
- documento
- notas internas
- flags antifraude
- estado de verificación
- authorities o scopes
- recovery data
- tokens
- referencias contractuales
- metadata de soporte
- campos de auditoría con demasiado contexto

### Idea importante

No todos los campos pesan igual.
Y si la entidad no deja eso claro conceptualmente, el riesgo de usarla mal sube bastante.

---

## Tercera pregunta: ¿qué campos nunca deberían salir en una response?

Esta pregunta es central.

Muchísimas entidades incluyen atributos que jamás deberían exponerse directamente, por ejemplo:

- hashes
- tokens
- secrets
- flags internos
- notas administrativas
- tenantId
- soft delete
- puntajes internos
- estados de revisión
- metadata operativa
- comentarios de soporte
- marcadores de fraude

### Regla sana

Cuando mirás una entidad, conviene poder señalar con rapidez:

- qué campos son potencialmente públicos
- cuáles jamás deberían serializarse
- cuáles podrían mostrarse solo en contextos muy concretos
- cuáles existen solo para lógica interna

Si no podés distinguir eso, la entidad ya está pidiendo revisión.

---

## Cuarta pregunta: ¿qué campos jamás deberían actualizarse libremente?

No todo lo persistido debería poder cambiar por la misma vía.

### Ejemplos de campos delicados para update

- roles
- authorities
- ownership
- tenantId
- estados críticos
- flags de moderación
- valores de pricing interno
- montos liquidados
- referencias de fraude
- createdBy / createdAt
- estado de verificación
- indicadores de seguridad

### Idea importante

Una entidad puede tener campos técnicamente actualizables, pero eso no significa que deban vivir en el mismo flujo de update que datos comunes.

Cuando revises la entidad, conviene preguntarte:

> si alguien copiara input externo sobre este objeto, ¿qué campos podría tocar que jamás debería tocar?

---

## Quinta pregunta: ¿hay datos que no deberían persistirse ahí?

Otra parte fuerte de la revisión es detectar campos que quizá no deberían existir en la entidad en absoluto.

### Sospechas comunes

- payloads completos
- metadata “por si acaso”
- respuestas crudas de terceros
- secretos persistidos completos
- estados temporales que nunca expiran
- campos heredados que nadie usa
- datos duplicados solo por comodidad
- notas larguísimas sin límite ni política clara
- atributos que el equipo no sabe para qué siguen existiendo

### Regla útil

Si un campo no tiene una justificación clara de negocio, operación o cumplimiento, merece sospecha.
Porque todo campo persistido agrega riesgo, no solo almacenamiento.

---

## Sexta pregunta: ¿qué relaciones arrastran demasiada exposición?

Las relaciones son uno de los lugares donde más riesgo se acumula.

### Ejemplos

Una entidad aparentemente simple puede quedar conectada con:

- usuario
- tenant
- direcciones
- historial
- archivos
- pagos
- notas
- auditoría
- comentarios internos

Y eso hace que una lectura o serialización poco controlada termine arrastrando muchísimo más de lo previsto.

### Qué revisar

- relaciones que nadie usa en ese caso de uso
- relaciones bidireccionales complejas
- grafos demasiado profundos
- asociaciones que mezclan dominios con distinta sensibilidad
- vínculos que facilitan sobreexposición por conveniencia

### Idea importante

Cada relación no es solo una decisión de modelo.
También es una puerta potencial a más datos.

---

## Séptima pregunta: ¿esta entidad mezcla demasiados contextos?

Una mala señal frecuente es cuando una misma entidad intenta representar demasiadas cosas a la vez.

Por ejemplo:

- dato público y dato interno
- información del usuario y criterios antifraude
- datos transaccionales y metadata operativa
- estado visible y estado interno del workflow
- contrato principal y trazabilidad histórica
- dominio del negocio y detalles de integración externa

### Problema

Cuanto más contexto mezcla una entidad, más difícil se vuelve:

- exponerla sin filtrar de más
- actualizarla sin tocar cosas indebidas
- reutilizarla sin generar fugas
- entender su sensibilidad real

### Idea útil

No toda complejidad debe resolverse partiendo la entidad.
Pero si la mezcla conceptual es muy grande, ya es señal de revisión seria.

---

## Octava pregunta: ¿cómo se comporta el ciclo de vida del dato?

No alcanza con mirar campos estáticos.
También hay que pensar:

- qué nace ahí
- qué expira
- qué debería borrarse
- qué se vuelve histórico
- qué se archiva
- qué nunca debería permanecer mucho tiempo

### Ejemplos

- tokens de verificación
- estados temporales
- archivos asociados
- flags transitorios
- notas operativas
- datos intermedios de revisión

### Regla práctica

Si la entidad contiene datos temporales, debería ser evidente:

- cuánto viven
- cómo se invalidan
- quién los limpia
- qué pasa cuando dejan de servir

Entidad con temporalidad implícita y sin cleanup claro es riesgo acumulado.

---

## Novena pregunta: ¿cómo impacta en búsquedas y filtros?

Hay campos que, por existir en la entidad, luego se vuelven tentadores para:

- buscar
- filtrar
- ordenar
- exportar
- listar

Y eso no siempre es sano.

### Ejemplos delicados

- flags internos
- tenantId
- reviewState
- notas
- campos de soporte
- indicadores de riesgo
- metadata operativa
- atributos altamente correlables

### Idea importante

Que un campo exista en la entidad no significa que deba existir como criterio funcional expuesto.
Revisar la entidad también es anticipar qué cosas podrían terminar mal usadas en queries o APIs.

---

## Décima pregunta: ¿qué tan fácil sería serializarla mal?

Aunque no se devuelva directamente hoy, conviene pensar:

- si alguien hiciera `return entity;`
- si un mapper copiara casi todo
- si una excepción incluyera el objeto
- si un `toString()` apareciera en logs
- si un debug imprimiera el estado completo

### ¿Qué saldría?

- PII
- campos internos
- flags
- relaciones
- IDs sensibles
- metadata técnica
- secretos o referencias indebidas

### Regla útil

Una buena revisión de seguridad también se pregunta:
**¿qué pasa si mañana alguien usa esta entidad de forma torpe pero plausible?**

---

## Décimo primera pregunta: ¿qué dice esta entidad sobre ownership y tenant?

En muchas entidades, parte importante del riesgo viene de no modelar bien:

- pertenencia a usuario
- pertenencia a tenant
- organización
- ámbito visible
- estados que afectan autorización

### Qué revisar

- si existe un ownership claro
- si tenant está presente cuando debería
- si la visibilidad depende de estados no modelados explícitamente
- si la entidad puede leerse sin su contexto de seguridad
- si el modelo invita a `findById()` universales sin filtros de alcance

### Idea importante

Una entidad que no refleja bien su ámbito de pertenencia tiende a facilitar IDOR, fuga horizontal o errores multi-tenant.

---

## Décimo segunda pregunta: ¿qué dice esta entidad sobre auditoría y trazabilidad?

Muchas entidades suman campos como:

- createdAt
- updatedAt
- createdBy
- updatedBy
- deletedAt
- reviewedBy
- approvedBy

Eso puede ser valioso.
Pero también puede exponer demasiado o vivir sin una política clara.

### Qué revisar

- si esos campos son realmente necesarios
- si están mezclando demasiado detalle de operador
- si podrían salir por responses o logs
- si su presencia favorece correlación indebida
- si ayudan a trazabilidad real o solo acumulan información sensible adicional

No toda auditoría es mala.
Pero tampoco todo campo histórico está automáticamente justificado.

---

## Revisar una entidad también es revisar naming y semántica

A veces el riesgo aparece porque ciertos nombres de campos o estados ya muestran demasiado del funcionamiento interno.

### Ejemplos conceptuales

- `fraudScore`
- `manualReviewReason`
- `isShadowBanned`
- `adminComment`
- `riskDecision`
- `systemOverride`
- `rootTenantId`

No significa que estén mal por existir.
Pero sí conviene preguntarse:

- ¿deben existir así?
- ¿quién puede conocerlos?
- ¿qué pasaría si un endpoint los expone por accidente?
- ¿qué tan cómodos resultan para abuso interno o externo?

### Idea útil

La semántica del modelo también forma parte de la superficie.

---

## Una entidad JPA no debería ser “el contrato del sistema”

Este punto merece repetirse.

Cuando una entidad se vuelve:

- estructura de base
- objeto de negocio
- DTO público
- carga de logs
- material de debugging
- entrada de updates
- salida de responses

todo al mismo tiempo, el riesgo se dispara.

### Porque desaparecen las fronteras

Y cuando desaparecen las fronteras, se vuelve más probable:

- exponer de más
- persistir de más
- actualizar de más
- buscar de más
- loguear de más

### Regla sana

Una entidad debería poder ser rica por dentro sin que eso te obligue a exponerla o reutilizarla indiscriminadamente por fuera.

---

## Qué conviene revisar en una entidad concreta

Si querés hacer una revisión práctica, mirá al menos:

- campos sensibles
- campos críticos
- campos temporales
- campos innecesarios
- ownership / tenant
- relaciones
- estados internos
- metadata operativa
- atributos que nunca deberían serializarse
- atributos que nunca deberían editarse libremente
- atributos que no deberían usarse para búsquedas o sort
- signos de que la entidad está cargando demasiados contextos

---

## Señales de diseño sano

Una entidad más sana suele mostrar:

- propósito claro
- separación razonable entre dato visible e interno
- menos mezcla de contextos
- campos sensibles identificables
- ownership o tenant bien modelados cuando corresponde
- menos relaciones innecesarias
- temporalidad más explícita
- menor tentación de usarla como DTO universal
- mejor capacidad de explicar por qué cada campo existe

---

## Señales de ruido

Estas señales merecen revisión rápida:

- nadie puede explicar varios campos
- la entidad creció “por agregados” sin criterio compartido
- mezcla datos públicos, internos y críticos sin distinción
- incluye payloads o metadata “por si acaso”
- relaciones profundas que nadie controla bien
- contiene campos que jamás deberían serializarse pero podrían salir fácil
- contiene campos que jamás deberían actualizarse pero no están claramente aislados
- modela mal tenant, ownership o visibilidad
- nadie sabe cuánto deberían vivir ciertos atributos temporales
- se usa como entidad, DTO, log object y response object a la vez

---

## Checklist práctico

Cuando revises una entidad JPA desde seguridad, preguntate:

- ¿qué datos sensibles vive acá?
- ¿qué campos nunca deberían salir al cliente?
- ¿qué campos nunca deberían actualizarse libremente?
- ¿qué datos quizá no deberían persistirse en absoluto?
- ¿qué relaciones amplían demasiado la superficie?
- ¿qué parte del modelo refleja ownership, tenant o visibilidad?
- ¿qué atributos son temporales y cómo expiran?
- ¿qué campos podrían terminar usados en búsquedas o sort de forma riesgosa?
- ¿qué pasaría si mañana alguien serializa esta entidad sin cuidado?
- ¿esta entidad está cargando demasiados contextos o responsabilidades?

---

## Mini ejercicio de reflexión

Tomá una entidad real de tu proyecto, por ejemplo:

- User
- Order
- Invoice
- SupportTicket
- ProductListing
- PaymentIntent

y respondé:

1. ¿Cuál es su propósito principal?
2. ¿Qué campos son públicos, internos, sensibles y críticos?
3. ¿Qué campos nunca deberían salir en una response?
4. ¿Qué campos nunca deberían editarse vía input normal?
5. ¿Qué relaciones arrastran más riesgo?
6. ¿Qué atributo parece estar ahí “por costumbre” y no por necesidad clara?
7. ¿Qué cambio harías primero para que esa entidad fuera más segura de usar mal?

---

## Resumen

Revisar una entidad JPA desde seguridad significa verla como mucho más que una tabla con anotaciones.

Significa preguntarse:

- qué valor concentra
- qué sensibilidad acumula
- qué relaciones abre
- qué capacidades de lectura o escritura podría habilitar mal
- qué parte nunca debería salir
- qué parte quizá nunca debió existir
- qué tan fácil sería usarla de forma peligrosa desde otras capas

En resumen:

> una entidad más madura no es solo la que modela bien el dominio.  
> También es la que deja más claros sus límites de exposición, actualización, relación y permanencia.

---

## Próximo tema

**Uploads inseguros en Spring**
