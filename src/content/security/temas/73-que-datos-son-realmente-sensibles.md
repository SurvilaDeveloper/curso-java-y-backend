---
title: "Qué datos son realmente sensibles"
description: "Cómo identificar qué datos son realmente sensibles en una aplicación Java con Spring Boot. Qué tipos de información merecen protección reforzada, por qué no todo dato tiene el mismo impacto y cómo pensar sensibilidad según contexto, correlación, negocio, abuso y daño posible."
order: 73
module: "Datos sensibles y base de datos"
level: "base"
draft: false
---

# Qué datos son realmente sensibles

## Objetivo del tema

Entender **qué datos son realmente sensibles** dentro de una aplicación Java + Spring Boot.

La idea es resolver una confusión muy común en proyectos reales:

- algunos equipos llaman “sensible” a casi todo
- otros solo consideran sensible a contraseñas o tarjetas
- otros recién reaccionan cuando ya hubo una fuga
- otros miran solo compliance y no el daño real

Ninguna de esas miradas alcanza por sí sola.

La pregunta útil no es solamente:

- “¿este dato parece importante?”

Sino más bien:

- “¿qué podría pasar si se expone, se altera, se correlaciona, se pierde o se usa fuera de contexto?”

En resumen:

> identificar bien la sensibilidad de los datos es la base para decidir qué proteger más, qué minimizar, qué no loguear, qué no exponer y qué no deberías ni guardar.

---

## Idea clave

No todos los datos tienen el mismo impacto si algo sale mal.

Algunos pueden parecer triviales aislados, pero volverse muy delicados cuando se combinan con otros.
Otros son críticos incluso por sí solos.
Y otros no son especialmente sensibles desde privacidad, pero sí lo son desde negocio, fraude, abuso o seguridad operativa.

La idea central es esta:

> la sensibilidad no depende solo del tipo de dato.  
> También depende del contexto, del actor, del uso, de la combinación y del daño posible.

Eso cambia mucho la forma de revisar un backend.

---

## Qué problema intenta resolver este tema

Este tema busca evitar errores como:

- proteger mucho algunos datos obvios y descuidar otros igual de delicados
- asumir que si un dato no es “secreto” entonces no importa
- no distinguir entre dato público, interno y sensible
- loguear o exponer información de negocio que no parecía crítica
- persistir de más porque el equipo no clasificó bien la información
- mirar solo compliance y no riesgo real
- tratar todos los campos como equivalentes dentro del modelo
- olvidar que la correlación entre datos puede volverlos más delicados

Es decir:

> el problema no es solo no cifrar algo.  
> El problema también es no entender qué cosas realmente merecen más cuidado y por qué.

---

## Error mental clásico

Un error muy común es este:

### “Dato sensible es solo contraseña, tarjeta o documento”

Eso es demasiado limitado.

Sí, esos son datos sensibles o muy delicados.
Pero también pueden serlo, según el sistema:

- emails
- teléfonos
- direcciones
- tokens
- IDs internos
- notas administrativas
- estados de revisión
- flags antifraude
- historiales de actividad
- datos de soporte
- logs de acciones
- pricing interno
- reglas de negocio
- información contractual
- métricas operativas

### Idea importante

La sensibilidad no nace solo de “qué clase de dato parece”.
También nace de:

- qué revela
- qué permite hacer
- a quién afecta
- qué abuso habilita
- qué daño produciría si se filtra o se manipula

---

## Sensible no significa exactamente secreto

Esto también conviene aclararlo.

Hay datos que quizá no son “secretos absolutos”, pero igual merecen tratamiento cuidadoso.

### Ejemplos

Un email puede no ser secreto en sentido estricto.
Pero igual puede ser sensible porque:

- permite enumerar cuentas
- facilita phishing
- expone identidad
- vincula actividad con una persona
- se usa para login o recuperación
- puede correlacionarse con otra información

Lo mismo puede pasar con:

- teléfonos
- direcciones
- order numbers
- referencias de clientes
- IDs externos
- nombres de empresas
- datos de facturación

### Regla útil

No preguntes solo:

- “¿esto es secreto?”

Preguntá también:

- “¿esto merece control adicional porque puede causar daño, abuso o exposición relevante?”

---

## Tipos de sensibilidad que conviene distinguir

Una forma práctica de pensar esto es separar distintas clases de sensibilidad.

## 1. Sensibilidad de autenticación o acceso
Datos cuyo compromiso ayuda a entrar o mantener acceso.

### Ejemplos
- contraseñas
- hashes
- tokens de sesión
- refresh tokens
- recovery tokens
- códigos MFA
- API keys
- secretos de integración

Estos suelen ser extremadamente delicados.

---

## 2. Sensibilidad personal o de privacidad
Datos que identifican, describen o exponen a una persona.

### Ejemplos
- nombre completo
- email
- teléfono
- dirección
- documento
- fecha de nacimiento
- historial de uso
- preferencias
- actividad de cuenta
- datos de facturación

No todos tienen igual peso, pero en conjunto pueden ser muy delicados.

---

## 3. Sensibilidad de negocio
Datos que no necesariamente exponen privacidad, pero sí afectan al negocio si se filtran o alteran.

### Ejemplos
- pricing interno
- márgenes
- descuentos no públicos
- reglas antifraude
- estados internos de aprobación
- scoring
- contratos
- acuerdos comerciales
- roadmap operativo
- condiciones especiales de clientes

Esto a veces se subestima mucho porque no “parece dato personal”, pero puede ser muy sensible.

---

## 4. Sensibilidad operativa o de seguridad
Datos que ayudan a entender demasiado del sistema o facilitan ataque.

### Ejemplos
- nombres internos de servicios
- topology interna
- flags técnicos
- IDs de tenant
- estados internos de revisión
- metadata de auditoría
- trazas con contexto sensible
- configuración
- rutas internas
- nombres de tablas o columnas
- detalles de infraestructura

Aunque no sean datos del usuario, pueden ser muy útiles para un atacante.

---

## 5. Sensibilidad contextual
Datos que aislados parecen menores, pero combinados cambian mucho de nivel.

### Ejemplos
- nombre + email
- email + empresa
- order number + estado + fecha
- usuario + tenant + rol
- historial de acciones + ubicación temporal
- identificadores internos + metadata operativa

Este punto es clave porque muchas fugas ocurren no por un único campo extremadamente sensible, sino por la correlación entre varios.

---

## La combinación de datos puede ser peor que cada dato por separado

Este es uno de los puntos más importantes del tema.

A veces un equipo analiza campo por campo y concluye:

- “esto solo no parece grave”
- “esto tampoco”
- “esto tampoco”

Pero cuando todo viaja junto, el conjunto ya es mucho más delicado.

### Ejemplos

No es lo mismo exponer solo:

- un nombre

que exponer:

- nombre
- email
- teléfono
- empresa
- estado de cuenta
- historial reciente
- rol
- tenant
- notas de soporte

### Idea clave

La sensibilidad también se evalúa a nivel de **conjunto**, no solo de campo individual.

---

## Qué hace sensible a un dato

Podés usar preguntas como estas:

- ¿permite identificar a una persona?
- ¿permite entrar al sistema o recuperar acceso?
- ¿ayuda a atacar cuentas o recursos?
- ¿revela algo interno del negocio?
- ¿facilita fraude o abuso?
- ¿su alteración rompe reglas del sistema?
- ¿ayuda a enumerar?
- ¿cambia mucho su riesgo si se combina con otros datos?
- ¿su exposición generaría daño reputacional, legal, económico u operativo?
- ¿el usuario esperaría razonablemente que esto se mantenga más protegido?

Estas preguntas son más útiles que una lista rígida aislada del contexto.

---

## Datos que suelen ser obviamente delicados

Hay una categoría que casi siempre merece cuidado reforzado:

- contraseñas y hashes
- tokens
- secretos
- credenciales
- datos de pago
- documentos personales
- recovery flows
- códigos MFA
- claves de terceros
- información financiera directa
- datos de autenticación o autorización

En estos casos no suele haber mucha discusión:
merecen una protección especialmente fuerte y una exposición mínima o nula.

---

## Datos que muchos equipos subestiman

Acá es donde suelen aparecer los problemas reales.

Muchos equipos subestiman datos como:

- email
- teléfono
- dirección
- historial de pedidos
- flags internos
- notas administrativas
- estado de cuenta
- score o riesgo interno
- datos de soporte
- motivos de bloqueo
- nombres internos de roles o authorities
- datos de auditoría
- identificadores correlables

### Por qué los subestiman

Porque no siempre “gritan sensibilidad” a primera vista.

Pero pueden ser muy valiosos para:

- phishing
- fraude
- ingeniería social
- abuso funcional
- enumeración
- extorsión
- presión reputacional
- comprensión del funcionamiento interno del sistema

---

## Sensibilidad según actor

No todos los datos tienen el mismo nivel de sensibilidad frente a todos los actores.

Por ejemplo:

- un usuario puede ver su propio email, pero no el de todos
- soporte puede ver cierta metadata, pero no notas antifraude completas
- un admin puede ver más, pero no necesariamente todo
- un servicio interno puede necesitar un ID técnico, pero el frontend no
- una integración externa puede requerir un subconjunto muy acotado

### Idea importante

La pregunta no es solo:

- “¿este dato es sensible?”

También es:

- “¿sensible frente a quién?”
- “¿para qué caso de uso?”
- “¿en qué canal?”
- “¿con qué nivel de detalle?”

Eso ayuda mucho a no caer en “todo o nada”.

---

## Sensibilidad según acción: ver no siempre implica editar

Otro punto clave:

un dato puede ser visible en cierto contexto, pero eso no implica que deba ser:

- editable
- exportable
- logueable
- indexable
- searchable
- retornado por API pública

### Ejemplo

Quizá un operador puede ver cierto campo sensible para resolver un caso.
Eso no significa que deba poder:

- modificarlo
- descargarlo masivamente
- buscar por ese campo
- ordenarlo
- usarlo como filtro amplio

La sensibilidad no solo afecta lectura.
También afecta las **capacidades** alrededor del dato.

---

## Sensibilidad y ciclo de vida

La misma información puede cambiar de sensibilidad según el momento.

### Ejemplos

- un token temporal es extremadamente delicado mientras está vigente
- un enlace de recuperación es crítico hasta que expira o se usa
- datos archivados pueden seguir siendo sensibles aunque ya no estén activos
- una orden en proceso puede exponer más riesgo operativo que una histórica
- un estado antifraude activo puede ser más delicado que un estado cerrado

### Idea útil

No mires los datos como objetos estáticos.
Mirá también su ciclo de vida y ventana de riesgo.

---

## Sensibilidad y logs

Muchos datos se filtran no en la entidad principal, sino en lugares secundarios como:

- logs
- errores
- auditoría
- eventos
- métricas
- trazas
- debugging temporal

### Punto importante

Que un dato esté justificado en la base no significa que también lo esté en logs o respuestas de error.

Un buen criterio de sensibilidad ayuda a decidir:

- qué nunca loguear
- qué truncar
- qué enmascarar
- qué reservar solo para canales muy controlados

---

## Sensibilidad y persistencia

Clasificar bien la sensibilidad también cambia la decisión de almacenamiento.

Porque una vez que entendés qué campos son especialmente delicados, podés preguntarte:

- ¿realmente necesito guardar esto?
- ¿durante cuánto tiempo?
- ¿con qué nivel de detalle?
- ¿en texto claro?
- ¿en una tabla separada?
- ¿accesible por qué componentes?
- ¿debería minimizarlo o tokenizarlo?
- ¿debería directamente no persistirlo?

Esto conecta el tema actual con el siguiente de forma natural.

---

## No todo lo sensible lo es por privacidad

Este punto conviene remarcarlo porque ayuda mucho a equipos técnicos.

Hay datos muy delicados aunque no sean “datos personales” en sentido clásico.

### Ejemplos

- reglas antifraude
- scores internos
- estrategia de pricing
- flags de revisión manual
- authorities internas
- llaves de negocio
- lógica de aprobación
- información de socios o proveedores
- notas de soporte con contexto operativo
- decisiones internas del flujo

Si se filtran, pueden permitir:

- abuso del negocio
- bypass de controles
- evasión de revisión
- explotación de procesos internos

---

## Sensibilidad y compliance no son sinónimos, aunque se tocan

A veces un equipo decide sensibilidad solo según normas o compliance.
Eso puede ayudar, pero no alcanza.

Porque también puede haber datos muy delicados desde negocio o seguridad aunque no estén “gritando regulación” a primera vista.

### Idea útil

Compliance puede ser una guía.
Pero el análisis real debería incluir también:

- abuso
- fraude
- daño operativo
- correlación
- reputación
- seguridad del sistema
- expectativas razonables del usuario

---

## Una clasificación útil para el día a día

Sin volver el tema burocrático, suele ayudar pensar categorías simples como:

### Público
Puede mostrarse o circular con bajo riesgo.

### Interno
No debería exponerse públicamente, pero no todo lo interno tiene el mismo peso.

### Sensible
Requiere más restricciones de acceso, menor exposición y más cuidado en logs, búsquedas y responses.

### Crítico
Su exposición o alteración puede causar daño serio y merece controles reforzados, almacenamiento cuidadoso y circulación muy limitada.

### Lo importante

No hace falta obsesionarse con etiquetas perfectas.
Lo importante es que el equipo tenga un criterio compartido y usable.

---

## Qué conviene revisar en una codebase o modelo

Cuando revises qué datos son realmente sensibles, mirá especialmente:

- entidades con campos de autenticación o acceso
- datos personales acumulados en perfiles
- tablas de soporte o notas administrativas
- flags antifraude
- estados internos no visibles al usuario
- pricing y reglas comerciales
- auditoría con demasiada información
- respuestas API que mezclan datos públicos con internos
- logs que capturan payloads completos
- búsquedas o filtros sobre campos que quizá nunca debieron exponerse

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- criterio claro sobre qué campos son delicados
- distinción entre público, interno y sensible
- menos datos circulando “porque sí”
- mejor cuidado en logs y responses
- decisiones de almacenamiento más intencionales
- campos sensibles menos disponibles por defecto
- mejor separación entre datos del negocio y datos de seguridad
- más claridad sobre qué canales pueden ver qué información

---

## Señales de ruido

Estas señales merecen revisión rápida:

- el equipo no puede explicar qué campos considera sensibles
- solo se protege lo obvio y se ignora lo contextual
- todo se trata igual aunque el impacto sea muy distinto
- datos internos se exponen porque “no parecían graves”
- logs o errores incluyen demasiado
- soporte, admin y frontend consumen casi el mismo nivel de detalle
- búsquedas permiten usar campos muy delicados sin necesidad
- nadie piensa en correlación entre datos
- la clasificación existe en un documento, pero no influye en el diseño real

---

## Checklist práctico

Cuando evalúes si un dato es realmente sensible, preguntate:

- ¿identifica a una persona o cuenta?
- ¿ayuda a autenticarse, recuperar acceso o mantener sesión?
- ¿facilita fraude, phishing o abuso?
- ¿revela demasiado del negocio o del sistema?
- ¿sería dañino si se filtra, altera o correlaciona?
- ¿el usuario esperaría que esto se proteja con más cuidado?
- ¿es sensible para todos o solo para ciertos actores?
- ¿verlo implica también poder editarlo, exportarlo o buscarlo?
- ¿debería persistirse tal como está?
- ¿qué otros campos lo vuelven más delicado al combinarse?

---

## Mini ejercicio de reflexión

Tomá una entidad importante de tu proyecto, por ejemplo:

- User
- Order
- Customer
- Invoice
- Ticket

y respondé:

1. ¿Qué campos son públicos?
2. ¿Qué campos son internos?
3. ¿Qué campos son sensibles?
4. ¿Qué campos se vuelven mucho más delicados si se combinan?
5. ¿Qué campos hoy circulan por más capas de las necesarias?
6. ¿Qué campos nunca deberían estar en logs o respuestas comunes?
7. ¿Qué dato estabas subestimando hasta ahora?

---

## Resumen

Saber qué datos son realmente sensibles es una de las decisiones más importantes del diseño seguro de un backend.

Porque de esa clasificación dependen muchas otras:

- qué exponer
- qué no exponer
- qué guardar
- qué no guardar
- qué cifrar
- qué minimizar
- qué loguear
- qué buscar
- qué exportar
- qué restringir por actor y contexto

En resumen:

> un backend más maduro no trata todos los datos como si valieran lo mismo.  
> Entiende qué daño puede producir cada tipo de información, sola o combinada, y diseña sus límites en consecuencia.

---

## Próximo tema

**Qué no debería persistirse**
