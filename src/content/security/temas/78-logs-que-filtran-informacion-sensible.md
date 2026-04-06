---
title: "Logs que filtran información sensible"
description: "Cómo detectar y evitar que una aplicación Java con Spring Boot filtre información sensible a través de logs, errores, trazas y debugging. Qué tipos de datos no deberían registrarse, por qué los logs suelen volverse una vía lateral de fuga y cómo pensar utilidad operativa sin convertir observabilidad en exposición permanente."
order: 78
module: "Datos sensibles y base de datos"
level: "base"
draft: false
---

# Logs que filtran información sensible

## Objetivo del tema

Entender cómo una aplicación Java + Spring Boot puede terminar **filtrando información sensible a través de logs**, incluso cuando la API principal parece razonablemente segura.

La idea es mirar un problema muy común en sistemas reales:

- el endpoint no devuelve el dato
- la UI no lo muestra
- la base está razonablemente cuidada
- el flujo principal parece correcto

pero, aun así, la información termina apareciendo en:

- logs de aplicación
- errores
- stack traces
- request logs
- response logs
- trazas distribuidas
- APM
- debugging temporal
- auditoría sobredetallada
- logs de proxy, gateway o balanceador

En resumen:

> muchas fugas no ocurren por la respuesta “oficial” del backend.  
> Ocurren por canales laterales de observabilidad que terminan acumulando demasiado detalle.

---

## Idea clave

Un log no es un basurero técnico donde puede caer cualquier cosa “porque total es interno”.

Un log es también un **store persistente o semipersistente de información** que puede:

- consultarse
- exportarse
- replicarse
- indexarse
- retenerse mucho tiempo
- circular por herramientas externas
- ser accedido por operadores, soporte, analítica o seguridad
- terminar en sistemas con controles distintos al backend original

La idea central es esta:

> si logueás un dato sensible, muchas veces acabás creando una copia adicional, persistente y ampliamente distribuida de algo que justamente querías proteger.

---

## Qué problema intenta resolver este tema

Este tema busca evitar patrones como:

- loguear request bodies completos
- registrar tokens, passwords o secrets “solo para debug”
- escribir excepciones con payloads sensibles
- dejar que frameworks serialicen objetos completos al log
- imprimir entidades o DTOs con demasiados campos
- usar logs de acceso que capturan headers o queries peligrosas
- confiar en que “después se borra”
- exponer datos personales en trazas o métricas
- usar auditoría como excusa para almacenar más detalle del necesario
- olvidar que los logs suelen viajar a múltiples destinos

Es decir:

> el problema no es hacer observabilidad.  
> El problema es convertir la observabilidad en otra vía de acumulación y fuga de información delicada.

---

## Error mental clásico

Un error muy común es este:

### “No importa loguearlo porque es solo interno”

Eso es una mala señal por varios motivos.

Porque “interno” no significa automáticamente:

- poco accesible
- poco replicado
- poco retenido
- poco exportable
- poco riesgoso

De hecho, los logs suelen tener propiedades que los vuelven especialmente delicados:

- se guardan mucho tiempo
- los ve mucha gente
- se centralizan
- se indexan
- se usan para búsquedas y alertas
- se replican a terceros o SaaS de observabilidad
- quedan fuera del contrato original de acceso a datos

### Idea importante

Un valor sensible en logs puede terminar más expuesto que en la base principal.

---

## Loguear no es inocente aunque el valor no vuelva al cliente

A veces un equipo razona así:

- “no lo exponemos por API”
- “solo lo mandamos al log”
- “eso no lo ve el usuario”

Eso no alcanza.

Porque una vez en logs, ese dato puede:

- quedar accesible a otros roles internos
- viajar a plataformas externas
- aparecer en dashboards
- quedar en tickets o screenshots
- ser buscado por operadores
- sobrevivir mucho más de lo previsto
- reaparecer en incidentes o migraciones

### Regla sana

Si un dato es delicado para una response, también merece revisión seria antes de aparecer en logs.

---

## Qué tipo de cosas suelen filtrarse

Hay ciertas categorías que aparecen una y otra vez.

### 1. Credenciales y secretos
Por ejemplo:

- contraseñas
- API keys
- bearer tokens
- refresh tokens
- recovery tokens
- códigos MFA
- client secrets
- cookies de sesión

Estos son especialmente peligrosos porque no solo revelan información.
También pueden otorgar acceso.

---

### 2. Datos personales o identificatorios
Por ejemplo:

- email
- teléfono
- dirección
- documento
- fecha de nacimiento
- nombre completo
- historial de actividad
- datos de facturación

A veces el equipo no los percibe como secretos, pero igual pueden causar mucho daño si terminan ampliamente logueados.

---

### 3. Datos del negocio o internos
Por ejemplo:

- pricing interno
- scores
- flags antifraude
- estados de revisión
- notas administrativas
- decisiones internas
- márgenes
- razones de bloqueo
- authorities o permisos finos

No siempre son datos personales, pero igual pueden ser muy sensibles.

---

### 4. Contexto técnico ofensivamente útil
Por ejemplo:

- nombres internos de tablas
- columnas
- rutas de archivos
- nombres de servicios
- detalles de infraestructura
- configuración
- stack traces con demasiado contexto
- consultas SQL completas con datos incrustados

Eso puede ayudar mucho a un atacante o a un abuso interno.

---

## Request logging: uno de los mayores focos de riesgo

Uno de los errores más comunes es loguear requests completos, especialmente en:

- login
- recuperación de contraseña
- pagos
- formularios extensos
- callbacks de terceros
- webhooks
- endpoints administrativos
- perfiles con muchos datos sensibles

### Problema

Un request body puede traer:

- passwords
- tokens
- direcciones
- datos de pago
- metadata de terceros
- documentos
- IDs sensibles
- datos que el backend ni siquiera pensaba persistir

Si logueás el body entero, creás otra copia de toda esa superficie.

### Idea importante

No deberías tratar el request completo como material seguro “por defecto” para loguear.

---

## Response logging: mismo problema, a veces peor

Loguear responses completas también suele ser mala idea.

Porque una response puede incluir:

- datos del usuario
- información agregada
- IDs internos
- detalles operativos
- mensajes de error
- campos que luego cambian de nivel de sensibilidad

Y si alguien activa logs de responses “para ver qué pasa”, puede terminar generando una fuga masiva silenciosa.

### Regla sana

Loguear responses completas debería ser una excepción muy justificada y extremadamente acotada, no una práctica normal.

---

## Excepciones y stack traces: otra vía clásica de fuga

Muchas fugas vienen no de logs diseñados, sino de errores.

Por ejemplo:

- `e.getMessage()`
- stack traces crudos
- errores de base
- mensajes de librerías
- serialización de excepciones con contexto interno
- logs automáticos de frameworks

### Qué pueden incluir

- SQL
- nombres de tablas
- datos del request
- rutas internas
- IDs
- valores sensibles
- headers
- contextos operativos

### Idea útil

El manejo sano de errores no solo piensa qué ve el cliente.
También piensa qué termina registrado internamente y con cuánto detalle.

---

## Objetos completos en logs: peligro silencioso

Otro patrón típico es loguear objetos enteros:

- entidades JPA
- DTOs
- `Map<String, Object>`
- respuestas de terceros
- payloads serializados a JSON
- sesiones o principal del usuario

### Ejemplo mental

Alguien hace algo como:

```java
log.info("Request recibido: {}", dto);
```

y cree que está siendo práctico.

Pero si `dto.toString()` o la serialización incluye:

- email
- teléfono
- tokens
- documentos
- notes
- flags internos

acabás exponiendo mucho más de lo previsto.

### Regla sana

En logs, los objetos completos suelen ser sospechosos.
Mejor loguear contexto mínimo y explícito.

---

## Headers también pueden ser sensibles

A veces se piensa solo en body y response.
Pero los headers también importan mucho.

### Ejemplos delicados

- `Authorization`
- cookies
- session IDs
- headers de tracing con identificadores correlables
- IP real
- metadata de proveedores
- firmas de webhook
- tokens de acceso técnicos

Loguear headers indiscriminadamente puede ser gravísimo.

---

## Query params también merecen atención

Hay endpoints que reciben información delicada en query params, a veces por mal diseño heredado o integraciones externas.

Si además existe access logging amplio, esos valores pueden quedar en:

- logs de aplicación
- logs de proxy
- logs del gateway
- métricas o trazas automáticas

### Idea útil

Los query params pueden parecer menos “peligrosos” porque vienen en URL.
Pero justamente por eso suelen terminar más difundidos.

---

## Trazas distribuidas y APM: el riesgo se multiplica

En sistemas modernos, observabilidad no es solo el archivo local de logs.

También están:

- tracing distribuido
- herramientas APM
- métricas enriquecidas
- logs centralizados
- plataformas SaaS

### Problema

Un dato sensible registrado en una capa puede terminar replicado en muchas otras.

Entonces un valor que parecía “solo un log más” termina siendo:

- indexado
- searchable
- retenido
- compartido entre equipos
- visible en múltiples paneles

### Idea clave

Cuanto más madura es la observabilidad, más importante es controlar qué entra ahí.

---

## Auditoría no significa capturar todo

A veces alguien justifica logs excesivos diciendo:

- “es por auditoría”
- “necesitamos trazabilidad”
- “seguridad lo pidió”

Eso puede ser cierto en parte.
Pero auditoría útil no significa guardar:

- request body entero
- response completa
- todos los datos sensibles
- todos los headers
- toda la entidad

### Una auditoría sana suele responder cosas como:

- quién hizo qué
- cuándo
- sobre qué recurso
- con qué resultado
- desde qué contexto relevante

No necesita necesariamente convertirse en un espejo detallado de toda la operación.

---

## Logs y retención: guardar detalle por mucho tiempo empeora el riesgo

No solo importa **qué** logueás.
También importa **cuánto tiempo** lo guardás.

Porque un dato sensible en logs retenidos por meses o años:

- amplía el impacto de una fuga
- complica cumplimiento
- facilita exploración histórica
- vuelve más difícil saneamiento
- multiplica copias y backups

### Regla sana

Cuanto más delicado es el dato, menos sentido tiene que viva mucho tiempo en sistemas de logging generalistas.

---

## Logs estructurados: gran utilidad, gran responsabilidad

Los logs estructurados ayudan muchísimo para operar mejor.
Pero también pueden volver más fácil buscar, filtrar y exportar datos sensibles si se usan mal.

### Ejemplo

No es lo mismo dejar un valor perdido en texto libre que convertirlo en un campo indexable como:

- `email`
- `phone`
- `token`
- `documentNumber`
- `customerName`

### Idea importante

Lo estructurado mejora operación.
Pero también mejora la capacidad de explotar una mala práctica si los campos sensibles entran ahí.

---

## “Solo en debug” es una trampa frecuente

Muchos equipos aceptan prácticas peligrosas con la idea de que solo se activan:

- en debug
- en staging
- para un incidente puntual
- mientras se investiga un bug

El problema es que:

- a veces queda activado
- a veces se copia a otro entorno
- a veces el dump ya salió a una plataforma central
- a veces ese incidente ocurre sobre datos reales

### Regla útil

Las excepciones temporales en logging suelen durar más y circular más de lo previsto.

---

## Enmascarar, truncar y excluir

No todo el mundo necesita el mismo nivel de detalle.
A veces la salida sana no es “no loguear nada”, sino aplicar criterios como:

- excluir totalmente ciertos campos
- truncar valores
- enmascarar parcialmente
- registrar solo metadata útil
- usar hashes o referencias
- conservar IDs internos no sensibles en vez del valor real delicado

### Idea importante

La meta no es dejar al equipo ciego.
La meta es mantener utilidad operativa sin convertir el log en una copia del dato sensible.

---

## Qué cosas sí suele tener sentido loguear

Un buen log de seguridad u operación suele enfocarse más en:

- tipo de evento
- resultado
- actor o principal según contexto
- requestId / traceId
- recurso o operación afectada
- razón general del fallo
- código de error
- timestamps
- contexto técnico mínimo necesario
- métricas de comportamiento

### Lo importante

Un log útil rara vez necesita el valor completo de:

- password
- token
- documento
- request body entero
- respuesta completa
- secreto técnico

---

## Logs y roles internos

Otro punto muy importante:

aunque la información no salga al usuario final, loguearla puede ampliar acceso para otros roles internos que no deberían verla.

Por ejemplo:

- soporte
- operaciones
- analítica
- observabilidad
- data engineers
- terceros que gestionan plataforma
- personal de incident response

### Idea útil

El backend puede estar controlando bien la API, pero si los logs expanden el acceso real a los datos, ya perdiste parte de ese control.

---

## Qué conviene revisar en una codebase o despliegue

Cuando revises logs que filtran información sensible, mirá especialmente:

- filtros o interceptors que loguean bodies
- manejo global de errores
- `log.info/debug/error` con DTOs completos
- serialización automática en mensajes de log
- headers registrados por proxies o middlewares
- access logs del servidor o gateway
- trazas APM con atributos ricos
- auditoría sobredetallada
- logs de autenticación
- endpoints de recuperación, pagos, webhooks o admin
- retención y destinos de logs

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- criterio claro sobre qué no se loguea nunca
- menos cuerpos completos en logs
- menor presencia de secretos y PII
- requestId o traceId para investigar sin exponer tanto
- errores con contexto útil pero prudente
- masking o truncado donde aporta
- auditoría más enfocada en evento y actor que en payload completo
- mejor conciencia de que observabilidad también es superficie de riesgo

---

## Señales de ruido

Estas señales merecen revisión rápida:

- `log.debug("request={}", bodyCompleto)`
- responses completas en logs
- passwords, tokens o cookies visibles en debugging
- stack traces con payloads incrustados
- DTOs o entidades enteras enviadas al log
- headers completos registrados sin filtro
- APM enriquecido con datos de usuario delicados
- auditoría que parece una copia total de la operación
- “es solo interno” como justificación
- nadie puede decir con certeza qué datos sensibles terminan hoy en los logs

---

## Checklist práctico

Cuando revises logging, preguntate:

- ¿qué datos nunca deberían llegar a logs?
- ¿hay request o response bodies completos registrados?
- ¿tokens, secretos o cookies aparecen en algún lado?
- ¿errores o excepciones están incluyendo demasiado contexto?
- ¿headers y query params se registran sin filtro?
- ¿logs, trazas y APM replican el mismo dato sensible en varios sistemas?
- ¿la auditoría está capturando más detalle del necesario?
- ¿qué roles internos pueden buscar hoy estos logs?
- ¿cuánto tiempo se retienen?
- ¿cómo mantendrías utilidad operativa reduciendo exposición?

---

## Mini ejercicio de reflexión

Tomá tres logs reales o imaginarios de tu sistema y respondé:

1. ¿Qué intentan aportar operativamente?
2. ¿Qué datos sensibles contienen hoy?
3. ¿Esos datos son realmente necesarios para el objetivo del log?
4. ¿Podrían reemplazarse por IDs, estados o referencias menos delicadas?
5. ¿Qué pasaría si ese log se exportara o quedara en un incidente?
6. ¿Quién podría verlo dentro de la organización?
7. ¿Qué reducirías primero sin perder trazabilidad útil?

---

## Resumen

Los logs pueden ser una herramienta excelente de operación, debugging y seguridad.
Pero también pueden convertirse en una fuente silenciosa de fuga si capturan demasiado.

Los riesgos más comunes aparecen cuando:

- se loguean payloads completos
- se registran secretos o tokens
- errores y trazas arrastran demasiado contexto
- la observabilidad replica datos sensibles a muchos sistemas
- se confunde auditoría con guardar todo
- se usa el “solo interno” como excusa

En resumen:

> un backend más maduro no trata el log como depósito de todo lo que pasó.  
> Diseña sus registros para conservar valor operativo real con el mínimo detalle sensible razonable.

---

## Próximo tema

**Exposición accidental en responses**
