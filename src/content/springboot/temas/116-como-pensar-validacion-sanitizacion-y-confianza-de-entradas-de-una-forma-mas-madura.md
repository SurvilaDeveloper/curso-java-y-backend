---
title: "Cómo pensar validación, sanitización y confianza de entradas de una forma más madura"
description: "Entender por qué un backend Spring Boot serio no puede tratar toda entrada como si fuera confiable por venir de un usuario autenticado o de otro sistema, y cómo pensar mejor validación, sanitización y fronteras de confianza sobre los datos que ingresan."
order: 116
module: "Seguridad, performance y operación avanzada"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo pensar:

- autorización más fina
- control de acceso
- permisos por recurso
- contexto por tenant
- ownership
- capacidades del plan
- mínimo privilegio aplicado a actores reales dentro del sistema

Eso ya te dejó una idea muy importante:

> en sistemas serios, no alcanza con saber quién es un actor; también importa muchísimo qué intenta hacer, sobre qué recurso, en qué tenant y bajo qué condiciones del dominio.

Pero incluso si ya validaste:

- identidad
- sesión
- permisos
- tenant
- recurso

todavía queda una superficie enorme de riesgo:

> ¿qué pasa con los datos que entran al sistema y qué tanto confiás en ellos?

Porque una cosa es decidir:

- este usuario puede llamar a este endpoint

Y otra muy distinta es asumir que, por eso, su input viene bien formado, es razonable, es seguro o merece confianza suficiente para entrar sin fricción al dominio.

En el backend real entran cosas desde muchos lugares:

- formularios del frontend
- parámetros de búsqueda
- uploads
- JSON de APIs públicas
- webhooks externos
- mensajes de colas
- jobs que reprocesan datos viejos
- integraciones de terceros
- paneles internos
- herramientas de soporte
- imports CSV o batchs
- callbacks
- configuraciones por tenant
- payloads generados por otros servicios

Ahí aparecen ideas muy importantes como:

- **validación**
- **sanitización**
- **confianza de entradas**
- **fronteras de confianza**
- **datos bien formados vs datos seguros**
- **input malicioso o abusivo**
- **normalización**
- **rechazo temprano**
- **protección del dominio frente a basura o ambigüedad**

Este tema es clave porque, en un backend serio, no alcanza con autenticar y autorizar.
También necesitás decidir con criterio:

> qué aceptás, qué rechazás, qué corregís, qué normalizás y qué jamás deberías dar por confiable solo porque “vino del cliente” o “vino de otro sistema”.

## El problema de pensar que la entrada ya viene razonable

Cuando uno empieza, es muy fácil caer en algo así:

- el frontend ya valida
- el usuario está logueado
- el otro servicio es “nuestro”
- el CSV viene de soporte
- el webhook viene del proveedor
- el admin sabe lo que hace
- entonces debería venir todo más o menos bien

Ese razonamiento es peligrosísimo.

Porque mezcla dos cosas distintas:

- **quién envía algo**
- **qué calidad o nivel de confianza merece lo que envía**

Y en sistemas reales, esas dos cosas no van siempre juntas.

Puede pasar que una entrada sea problemática aunque venga de:

- un usuario legítimo
- un admin de tenant
- una integración conocida
- una herramienta interna
- un worker propio
- un batch antiguo
- un webhook “válido” pero mal formado o repetido
- un frontend que tiene un bug
- una sesión vieja con una UI desactualizada

Entonces aparece una verdad muy importante:

> la confianza sobre el actor no elimina la necesidad de validar la entrada.

## Qué significa validar, en este contexto

Dicho simple:

> validar significa comprobar que una entrada cumple las reglas mínimas necesarias para ser aceptada por cierta capa del sistema.

La palabra importante es **cierta capa**.

Porque no toda validación pertenece al mismo nivel.

Por ejemplo, podrías validar:

- formato
- obligatoriedad
- longitud
- rango
- consistencia básica
- pertenencia a cierto tenant
- existencia de una relación
- compatibilidad con el estado del dominio
- semántica del flujo

Entonces validar no es solo “string no vacío”.
Puede haber muchos niveles de validez.

## Qué significa sanitizar

Podés pensarlo así:

> sanitizar significa transformar o limpiar una entrada para quitar o reducir ambigüedad, caracteres problemáticos, formatos no deseados o contenido que no conviene aceptar tal como llegó.

Esto puede implicar cosas como:

- trim de espacios
- normalización de mayúsculas/minúsculas si aplica
- eliminación de caracteres de control
- limpieza de HTML o markup cuando no corresponde
- normalización de formatos de teléfono o documento
- filtrado de campos no permitidos
- canonicalización de ciertas entradas

La palabra importante acá es:
**transformar antes de confiar o persistir**.

Pero ojo:
sanitizar no reemplaza validar.
Son herramientas distintas.

## Una intuición muy útil

Podés pensar así:

- **validar** responde “¿esto se puede aceptar?”
- **sanitizar** responde “¿esto conviene transformarlo antes de usarlo o guardarlo?”

Esta diferencia ayuda muchísimo.

## Qué tipos de validación suelen existir

A muy alto nivel, conviene distinguir varias capas mentales:

### Validación sintáctica
¿La forma básica es correcta?

Por ejemplo:
- email con forma válida
- número parseable
- fecha válida
- JSON bien formado
- enum permitido
- longitud máxima

### Validación semántica
¿El contenido tiene sentido para el caso de uso?

Por ejemplo:
- la fecha de fin no puede ser anterior al inicio
- el descuento no puede superar el subtotal
- no se puede pagar una orden cancelada
- el tenant actual debe coincidir con el recurso

### Validación contextual
¿Esto tiene sentido en este estado, para este actor y en este flujo?

Por ejemplo:
- el usuario puede modificar este recurso
- el recurso pertenece a su tenant
- el estado actual admite esta acción
- el plan del tenant permite esta operación

Estas capas muchas veces se mezclan en la práctica, pero distinguirlas mentalmente ayuda mucho.

## Qué problema aparece cuando toda la validación se deja al frontend

Muy clásico.

El frontend puede validar muchísimo y debería hacerlo por UX.
Eso ayuda a:

- evitar errores tontos
- guiar al usuario
- reducir fricción
- dar feedback rápido

Pero el backend no puede apoyarse solo en eso.

Porque el backend no controla totalmente:

- si el frontend tiene bugs
- si la request se envía manualmente
- si un script externo llama a la API
- si una versión vieja del cliente sigue viva
- si alguien modifica el payload
- si un partner consume la API distinto
- si un panel interno omite reglas
- si una integración manda algo inesperado

Entonces una idea muy importante es esta:

> la validación del frontend mejora experiencia; la validación del backend protege integridad.

Las dos son útiles, pero no cumplen el mismo rol.

## Qué relación tiene esto con fronteras de confianza

Absolutamente total.

En el tema anterior viste fronteras de confianza dentro del threat modeling.
Este tema las vuelve muchísimo más concretas.

Cada vez que algo entra al sistema desde otro contexto, conviene preguntarte:

- ¿qué tan confiable es esta entrada realmente?
- ¿qué supuestos no conviene hacer?
- ¿qué parte del sistema la debe validar?
- ¿qué daño podría causar si se acepta mal?

Por ejemplo, fronteras típicas pueden ser:

- navegador → API
- tenant → plataforma
- servicio externo → webhook
- cola → consumer
- CSV → batch import
- tool interna → dominio
- servicio interno → otro servicio
- admin panel → operación sensible

No todas merecen el mismo nivel de paranoia, pero ninguna debería asumirse ciegamente confiable.

## Un ejemplo muy claro

Supongamos un webhook.

Aunque venga de un proveedor legítimo, todavía podría traer problemas como:

- payload repetido
- orden raro
- campo faltante
- formato cambiado
- valores inesperados
- estado incompatible
- referencia desconocida
- firma válida sobre un contenido que igual no tiene sentido para tu dominio

Entonces incluso una entrada “confiable” en origen necesita validación y juicio del lado del backend.

## Qué relación tiene esto con el dominio

Muy fuerte.

Una entrada puede ser sintácticamente válida y aun así ser inválida para el dominio.

Por ejemplo:

- `"status": "APPROVED"` puede existir como string válido
- pero quizá no tiene sentido aplicarlo a este recurso en este momento

O:

- `amount = 1000` puede ser un número correcto
- pero quizá no coincide con el total permitido del pedido

Esto muestra algo clave:

> no toda validación importante ocurre antes del dominio; mucha vive exactamente en las reglas del dominio.

Entonces conviene no reducir “validación” a anotaciones superficiales de DTO solamente.

## Qué relación tiene esto con multi-tenancy

También es muy fuerte.

Muchas entradas deben validar no solo forma y contenido, sino también contexto organizacional.

Por ejemplo:

- este `orderId` ¿pertenece al tenant actual?
- este `userId` ¿es de esta organización?
- esta configuración ¿puede tocarse desde este tenant?
- este upload ¿debe quedar bajo qué namespace?
- este mensaje de cola ¿trae tenant claro y coherente?

Si no hacés esa validación contextual, una entrada técnicamente bien formada puede convertirse en fuga de tenant o corrupción de estado.

## Qué relación tiene esto con overposting y campos inesperados

Muy importante.

A veces el problema no es que falte un campo.
A veces es que viene **de más**.

Por ejemplo:

- el cliente manda campos que no debería poder controlar
- mete flags internas
- intenta setear un estado administrativamente sensible
- pasa IDs o relaciones ajenas
- incluye datos que el backend nunca debería tomar desde esa request

Esto es una fuente clásica de problemas.

Entonces otra pregunta importante pasa a ser:

> ¿qué campos de este payload son realmente aceptables como input y cuáles nunca deberían venir controlados por el cliente?

Eso mejora muchísimo seguridad e integridad.

## Un ejemplo muy claro

Supongamos un request para actualizar un perfil.
Si permitís que el cliente envíe cosas como:

- `role`
- `tenantId`
- `isAdmin`
- `billingStatus`

junto con campos comunes de perfil, y luego hacés un mapeo ingenuo, podés abrir problemas serios.

Entonces validar también es:

- restringir la forma del input
- no aceptar atributos que no deberían venir
- separar claramente DTOs de entrada y modelos internos

## Qué relación tiene esto con sanitización de texto libre

También importa bastante.

Hay entradas donde el usuario puede mandar texto libre:

- comentarios
- notas internas
- descripciones
- contenido enriquecido
- templates
- nombres visibles
- mensajes

Ahí conviene pensar:

- ¿aceptás HTML o no?
- ¿guardás texto crudo o limpiado?
- ¿hay caracteres de control raros?
- ¿puede romper renderizado en otra capa?
- ¿puede contaminar logs, exports o vistas?
- ¿necesitás escapar, limpiar o restringir?

No todo texto libre es inocuo solo porque “es solo texto”.

## Qué relación tiene esto con archivos y uploads

Muy fuerte.

Los uploads son una de las entradas más delicadas del backend porque pueden traer problemas como:

- tamaño excesivo
- tipo inesperado
- contenido malicioso
- nombre de archivo problemático
- path tricks
- uso excesivo de storage
- archivos no procesables
- contenido que rompe flujos posteriores

Entonces una política madura de validación de entradas también incluye:

- límites
- tipos aceptados
- nombres saneados
- tratamiento del contenido
- escaneo o verificaciones según el caso
- aislamiento de procesamiento

Esto ya muestra que input validation va muchísimo más allá de formularios JSON.

## Qué relación tiene esto con rendimiento y abuso

Muy fuerte también.

No toda entrada peligrosa busca “hackear”.
A veces basta con que fuerce demasiado trabajo.

Por ejemplo:

- filtros gigantes
- exports enormes
- paginaciones absurdas
- uploads masivos
- búsquedas demasiado amplias
- payloads enormes
- listas interminables de IDs
- regexes o patrones costosos si el sistema los acepta
- combinaciones que fuerzan queries muy caras

Entonces validar entradas también protege:

- disponibilidad
- costos
- fairness entre tenants
- resistencia a abuso o mal uso

Es decir:
la validación también es una herramienta de performance y operación.

## Qué relación tiene esto con jobs, colas y reprocesos

Absolutamente fuerte.

Muchas veces un mensaje o item que entra a una cola es tratado como si ya estuviera “internalizado” y por eso se relajara la validación.

Eso es un error peligroso.

Porque un consumer puede recibir:

- payload viejo
- mensaje duplicado
- contenido incompleto
- contrato cambiado
- referencia inexistente
- combinación imposible
- tenant inconsistente
- estado ya obsoleto

Entonces también conviene validar entradas en consumidores y jobs, no solo en endpoints públicos.

## Qué relación tiene esto con normalización

Muy importante.

A veces dos entradas parecen distintas pero deberían representar lo mismo.
Por ejemplo:

- emails con distinto casing
- teléfonos con o sin símbolos
- nombres con espacios extra
- dominios o slugs
- documentos con formatos variados

Normalizar ayuda a que el sistema:

- compare mejor
- reduzca duplicados
- aplique reglas más coherentes
- evite ambigüedades
- no termine con múltiples variantes del “mismo” dato

Pero también hay que hacerlo con criterio, porque no todo debe normalizarse igual.

## Una intuición muy útil

Podés pensar así:

> una entrada útil para el dominio no siempre es la entrada cruda que llegó; a veces necesita limpieza, validación y traducción antes de merecer confianza.

Esta frase ayuda muchísimo.

## Qué relación tiene esto con errores y feedback

También es muy importante.

Validar bien no es solo rechazar.
También es comunicar con cierta claridad:

- qué está mal
- qué falta
- qué formato no sirve
- qué acción no aplica en este contexto
- qué límite se superó
- qué relación es inválida

Esto mejora mucho:

- UX
- integraciones
- soporte
- debugging
- confianza en la API

Pero, otra vez, sin filtrar más información sensible de la necesaria.

## Qué no conviene hacer

No conviene:

- asumir que el frontend ya validó suficiente
- confiar demasiado en payloads “internos”
- aceptar campos extra por comodidad
- mapear request a entidades internas sin filtro
- pensar validación solo como anotaciones superficiales de DTO
- ignorar tenant, ownership o estado del dominio al validar
- olvidar que inputs enormes o costosos también son una forma de riesgo
- tratar uploads o imports como si fueran inputs comunes y simples

Ese tipo de decisiones suele abrir grietas de integridad, seguridad y operación.

## Otro error común

Pensar que sanitizar siempre es mejor que rechazar.
No siempre.
A veces una entrada debería:
- rechazarse
- otras veces limpiarse
- otras normalizarse
- otras pasar a revisión

La decisión depende del caso de uso y del riesgo.

## Otro error común

No distinguir entre:
- dato mal formado
- dato bien formado pero fuera de política
- dato sintácticamente correcto pero inválido para el dominio
- dato potencialmente malicioso
- dato demasiado costoso de procesar
- dato obsoleto o inconsistente con el tenant

Todo eso puede requerir respuestas distintas.

## Otro error común

Pensar que, porque una entrada viene de un sistema propio, ya merece confianza plena.
Los sistemas propios también cambian, fallan, se desincronizan y mandan basura.

## Una buena heurística

Podés preguntarte:

- ¿de qué frontera de confianza viene esta entrada?
- ¿qué parte de ella puedo tratar como no confiable?
- ¿qué reglas son sintácticas, cuáles semánticas y cuáles contextuales?
- ¿qué campos nunca debería aceptar desde este actor?
- ¿qué pasa si esto se manda enorme, repetido o malicioso?
- ¿necesito limpiar, normalizar o rechazar?
- ¿qué daño haría esta entrada si la acepto ingenuamente?
- ¿qué parte del dominio debería validar esto de verdad?

Responder eso te ayuda muchísimo a madurar la protección del backend frente a entradas problemáticas.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque en el backend real entran datos desde muchísimos lugares y con distintos niveles de confianza:

- UI
- mobile
- partners
- admin panels
- soporte
- imports
- eventos
- colas
- jobs
- webhooks
- integraciones
- herramientas internas

Y una parte muy grande de la robustez del sistema depende de qué tanto sabés recibir esos datos sin tragarte basura, ambigüedad, abuso o incoherencia.

## Relación con Spring Boot

Spring Boot puede ayudarte muchísimo con validación estructural y capas de entrada.
Pero el framework no decide por vos:

- qué debe rechazarse
- qué debe normalizarse
- qué campos nunca acepta cierto actor
- qué valida el DTO y qué valida el dominio
- qué límites protegen performance
- qué sanitización tiene sentido
- qué inputs internos siguen siendo no confiables

Eso sigue siendo criterio de backend, seguridad y diseño de dominio.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> en un backend serio, validar entradas no es solo revisar que un JSON tenga formato correcto, sino decidir con mucha más conciencia qué datos, desde qué frontera de confianza, bajo qué contexto y con qué costo merecen ser aceptados, normalizados o rechazados, para proteger no solo la sintaxis de la API sino también la integridad del dominio, el aislamiento entre tenants y la estabilidad operativa del sistema.

## Resumen

- La confianza en el actor no elimina la necesidad de validar la entrada.
- Validación y sanitización no son lo mismo y ambas tienen valor distinto.
- No toda validación importante vive en DTOs; muchas reglas clave pertenecen al dominio y al contexto.
- Inputs enormes, inesperados o fuera de tenant también son riesgos de seguridad y performance.
- Overposting, uploads, imports, jobs y mensajes internos también necesitan control serio.
- Este tema amplía la seguridad del backend hacia una de sus superficies más inevitables: todo lo que entra al sistema.
- A partir de acá la conversación está lista para meterse todavía más en performance, robustez y operación avanzada del backend real.

## Próximo tema

En el próximo tema vas a ver cómo pensar rate limiting, cuotas y protección frente a abuso o uso desmedido, porque después de mirar qué entra al sistema y cómo validarlo, otra pregunta fuerte es cuánto dejás entrar, con qué ritmo y qué pasa cuando alguien o algo empieza a consumir mucho más de lo sano.
