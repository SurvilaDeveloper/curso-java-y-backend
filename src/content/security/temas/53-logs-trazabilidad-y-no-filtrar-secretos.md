---
title: "Logs, trazabilidad y no filtrar secretos"
description: "Cómo diseñar logs y trazabilidad en una aplicación Java con Spring Boot sin convertirlos en una fuente de fuga de secretos, datos sensibles o ruido inútil. Qué conviene registrar, qué no y cómo equilibrar observabilidad, debugging y seguridad."
order: 53
module: "Observabilidad y respuesta"
level: "base"
draft: false
---

# Logs, trazabilidad y no filtrar secretos

## Objetivo del tema

Entender cómo diseñar **logs y trazabilidad** en una aplicación Java + Spring Boot para que ayuden realmente a:

- entender qué pasó
- investigar errores
- reconstruir incidentes
- seguir operaciones sensibles
- detectar abuso

sin convertir al sistema de logging en una nueva fuente de problemas como:

- fuga de secretos
- exposición de tokens
- exposición de contraseñas
- exposición de datos personales
- ruido inmanejable
- información útil para atacantes
- trazabilidad insuficiente justo cuando más se la necesita

En resumen:

> loguear más no siempre significa observar mejor.  
> Muchas veces significa exponer demasiado o enterrar lo importante bajo toneladas de ruido.

---

## Idea clave

Los logs cumplen una función muy valiosa:

- observabilidad
- soporte
- debugging
- auditoría técnica
- investigación de incidentes
- análisis de abuso

Pero no deberían transformarse en:

- un espejo completo de requests sensibles
- un depósito de contraseñas, tokens o secretos
- una copia paralela de la base de datos
- una salida indiscriminada de objetos enteros

En resumen:

> un buen log ayuda a entender eventos importantes sin volverse una fuga secundaria de información sensible.

---

## Qué problema intenta resolver este tema

Este tema intenta evitar patrones como:

- loguear bodies completos de login
- imprimir headers con tokens
- loguear DTOs enteros sin filtrar
- guardar contraseñas o refresh tokens “solo para debug”
- registrar respuestas con datos de más
- loguear excepciones con contexto sensible sin control
- no registrar nada útil en operaciones críticas
- mezclar observabilidad con exfiltración accidental

Es decir:

> el problema no es tener logs.  
> El problema es loguear mal: demasiado, demasiado poco o lo incorrecto.

---

## Qué hace valiosos a los logs

Los logs son valiosos cuando ayudan a responder preguntas como:

- ¿qué request ocurrió?
- ¿quién la hizo?
- ¿sobre qué recurso?
- ¿en qué tenant?
- ¿con qué resultado?
- ¿qué error apareció?
- ¿qué operación sensible se ejecutó?
- ¿se detectó abuso?
- ¿cuál fue la secuencia del incidente?

Esa utilidad crece muchísimo cuando el sistema necesita:

- investigar soporte
- revisar fraude
- responder a incidentes
- entender errores intermitentes
- reconstruir acciones administrativas

---

## Error mental clásico

Muchas apps caen en uno de estos dos extremos:

### Extremo 1
- “logueemos todo, después vemos”

### Extremo 2
- “mejor no loguear casi nada por seguridad”

Los dos extremos suelen ser malos.

### Si logueás todo
podés terminar con:
- secretos expuestos
- tokens en texto claro
- datos personales innecesarios
- ruido insoportable
- logs imposibles de revisar
- mayor impacto si el sistema de logs se compromete

### Si no logueás casi nada
podés terminar con:
- incidentes imposibles de investigar
- operaciones críticas sin trazabilidad
- soporte a ciegas
- imposibilidad de reconstruir abuso o errores

La meta sana es otra:
- **registrar lo importante, sin exponer lo que no deberías.**

---

## No todo debería ir a logs

Esto conviene dejarlo muy claro.

Hay cosas que no deberían quedar en logs o deberían tratarse con muchísimo cuidado.

### Ejemplos clásicos de alto riesgo

- contraseñas
- tokens de acceso
- refresh tokens
- cookies de sesión
- secretos de integración
- claves API
- códigos MFA
- enlaces de recuperación
- datos completos de tarjeta
- documentos sensibles completos
- payloads enteros de autenticación o reset
- archivos o adjuntos crudos

### Regla práctica

Si perder ese dato en logs empeora mucho el incidente, probablemente no deberías registrarlo así.

---

## Logs y requests HTTP: zona de cuidado

Uno de los errores más comunes es loguear requests completos por comodidad.

### Ejemplo riesgoso

- método
- URL
- headers
- body entero
- cookies
- auth header

Eso puede exponer de golpe:

- `Authorization: Bearer ...`
- `Cookie: JSESSIONID=...`
- passwords en login
- tokens de reset
- datos privados de formularios
- identificadores sensibles

### Más sano

Registrar de forma más selectiva:

- método
- ruta
- correlación
- actor si existe
- resultado
- duración
- quizás algunos parámetros no sensibles
- sin volcar credenciales crudas

---

## Loguear DTOs enteros suele ser una mala costumbre

Ejemplo tentador:

```java
log.info("Request recibido: {}", request);
```

Eso parece cómodo.
Pero si `request` tiene cosas como:

- password
- email
- phone
- token
- flags internos
- datos fiscales
- notas privadas

terminás mandando demasiado a logs sin querer.

### Más sano

Loguear explícitamente solo lo que realmente aporta.

Ejemplo conceptual:

```java
log.info("Alta de usuario solicitada para email={}", normalizedEmail);
```

o incluso menos según el caso.

La idea es:
- **intencionalidad**
- no dumping automático de objetos.

---

## Contraseñas no deberían aparecer nunca en logs

Esto merece decirse sin vueltas.

### Nunca conviene loguear

- password recibida
- password vieja
- password nueva
- hashes si no hay motivo muy excepcional y controlado
- comparación de credenciales con valores visibles

### Ejemplo pésimo

```java
log.warn("Intento de login para {} con password {}", email, password);
```

Esto es una muy mala idea incluso en entornos de desarrollo compartidos, staging o debugging improvisado.

---

## Tokens y cookies también merecen mucho cuidado

Los tokens son credenciales.

### Ejemplos que no conviene loguear crudos

- access token
- refresh token
- CSRF token si aplica
- session id
- cookie de auth
- token de activación
- token de reset password
- MFA challenge sensible

Porque si aparecen en logs, un incidente en observabilidad o acceso indebido a logs se transforma también en incidente de acceso.

### Más sano

Si hace falta correlacionar o diagnosticar, pensar en:
- identificadores parciales
- fingerprints
- hashes
- sufijos muy acotados
- o directamente no registrar el valor

---

## No todo dato personal aporta valor de debugging

Otro error frecuente es asumir que registrar más PII ayuda siempre.

### Ejemplos de datos que muchas veces no hace falta loguear completos

- teléfono
- documento
- dirección completa
- email completo
- nombre completo
- fecha de nacimiento
- metadata privada extensa

A veces alcanza con:
- ID interno
- tenant
- userId
- requestId
- orderId
- actorId
- estado de la operación

La mejor trazabilidad muchas veces se logra con referencias útiles, no con volcados completos de datos sensibles.

---

## Qué conviene sí registrar

Los logs son más útiles cuando registran cosas como:

- timestamp
- nivel (`INFO`, `WARN`, `ERROR`)
- request id / correlation id
- actor o principal técnico, si aplica
- tenant o scope, si aplica
- endpoint o acción
- recurso afectado
- resultado
- motivo de rechazo
- excepción resumida
- duración
- decisiones relevantes de flujo

### Ejemplo útil

```java
log.info("Refund ejecutado actorId={} tenantId={} orderId={} reason={}",
        actorId, tenantId, orderId, reason);
```

Eso da bastante trazabilidad sin necesitar exponer un mundo de datos.

---

## Logs técnicos vs auditoría no son exactamente lo mismo

Esto también importa.

## Logs técnicos
Ayudan a:
- debugging
- errores
- observabilidad
- rendimiento
- fallos operativos

## Auditoría
Ayuda a:
- quién hizo qué
- sobre qué recurso
- cuándo
- con qué resultado
- en qué tenant
- a veces con qué justificación

Pueden superponerse, pero no son idénticos.

### Regla útil

No siempre conviene usar los logs generales como sustituto de un rastro de auditoría para acciones sensibles.

---

## Operaciones críticas merecen trazabilidad reforzada

Acciones como:

- refund
- cambio de rol
- reset de MFA
- deshabilitar usuario
- exportación sensible
- borrado definitivo
- impersonación
- cambios de configuración de seguridad

merecen normalmente mejor trazabilidad que una request común.

### Conviene registrar al menos

- quién
- qué acción
- sobre qué recurso
- en qué tenant
- cuándo
- con qué resultado
- quizá con qué motivo

Eso ayuda muchísimo a:
- investigar
- responder a incidentes
- revisar abuso interno
- entender errores humanos

---

## Logs de error: útiles, pero con cuidado

Otro lugar donde se filtra demasiado es el manejo de errores.

### Problemas frecuentes

- stack trace con payload sensible incrustado
- excepción armada con secretos o tokens
- logs de error que incluyen request body entero
- mensajes de librerías que se imprimen sin filtrar contexto

### Regla sana

- registrar suficiente contexto para investigar
- no meter secretos en mensajes de excepción
- no usar logs de error como dumping de request completa

---

## Correlation ID o request ID ayuda muchísimo

Una gran mejora para observabilidad es poder correlacionar eventos de la misma request o flujo sin loguear todo el contenido sensible.

### Ejemplo

- request llega con `requestId`
- se propaga internamente
- errores y eventos relevantes lo incluyen

Entonces podés reconstruir:
- qué pasó
- en qué secuencia
- sin necesidad de copiar todo el body o todos los headers a cada log

Esto es muy superior a compensar la falta de correlación con sobrelogging.

---

## Logging estructurado suele ayudar más que textos caóticos

Cuando el sistema crece, ayuda muchísimo que los logs tengan campos consistentes como:

- actorId
- tenantId
- orderId
- requestId
- action
- outcome
- durationMs

Eso mejora:
- búsqueda
- análisis
- alertas
- dashboards
- investigación

Y reduce la necesidad de meter mensajes larguísimos o volcar objetos enteros.

---

## Headers y params: cuidado con qué registrás

No todos los headers son iguales.

### Riesgo alto de loguear sin filtro

- `Authorization`
- `Cookie`
- tokens de proxy
- claves de integración
- headers internos sensibles

Y también algunos query params pueden ser delicados, por ejemplo si llevan:
- tokens
- enlaces de activación
- reset tokens
- filtros con datos sensibles

Conviene revisar qué se registra automáticamente en filtros HTTP o access logs.

---

## Qué pasa en ambientes no productivos

Otro error frecuente es pensar:

- “como es dev / QA / staging, podemos loguear todo”

Eso puede ser peligroso porque:

- también hay credenciales reales a veces
- también hay equipos compartidos
- también hay dumps y pantallazos
- también puede haber accesos más laxos al stack de observabilidad

No hace falta tratar dev idéntico a producción, pero sí conviene no normalizar malas prácticas como:
- imprimir passwords
- volcar tokens
- loguear bodies completos sin filtro

---

## Ruido también es un problema de seguridad

Mucho ruido degrada la utilidad de los logs.

### Cuando hay demasiado ruido
- se pierden eventos importantes
- cuesta detectar abuso real
- nadie encuentra la señal útil
- las alertas se vuelven menos confiables
- el equipo termina ignorando el sistema de logs

Entonces loguear demasiado no solo expone más.
También puede hacer peor la capacidad de detectar lo realmente importante.

---

## Qué papel juegan las librerías y filtros automáticos

Conviene revisar con cuidado cosas como:

- filtros HTTP que registran requests/responses
- access logs del contenedor
- interceptors
- herramientas APM
- librerías que serializan objetos al log
- proxies o gateways que dejan trazas

Porque muchas fugas no nacen de un `log.info(...)` manual.
Nacen de:
- automatismos
- defaults
- observabilidad mal configurada
- middleware demasiado verboso

---

## Ejemplo conceptual sano

### En vez de esto

```java
log.info("Login request headers={} body={}", headers, request);
```

### Algo más sano sería

```java
log.info("Intento de login email={} requestId={}", normalizedEmail, requestId);
```

y si el login falla:

```java
log.warn("Login fallido email={} requestId={} reason={}",
        normalizedEmail, requestId, "bad_credentials");
```

### Qué mejora esto

- contexto útil
- correlación
- menos exposición
- menos dumping indiscriminado

Y aún así conviene evaluar si incluso el email completo es necesario según el caso.

---

## Qué conviene revisar especialmente

Estas superficies merecen bastante cuidado en logs:

- login
- forgot password
- reset password
- MFA
- activación
- cambio de password
- endpoints con tokens
- uploads
- exportaciones
- integraciones con secretos
- operaciones admin
- headers de autenticación
- bodies con datos personales

---

## Qué señales muestran un sistema de logs flojo

Estas cosas suelen hacer mucho ruido:

- tokens visibles en logs
- contraseñas visibles
- requests completas de auth volcadas sin filtro
- DTOs enteros logueados por costumbre
- cero correlation id
- auditoría débil en operaciones críticas
- logs caóticos, poco consistentes
- demasiado ruido en INFO
- nadie sabe qué datos sensibles terminan en observabilidad

---

## Qué gana el backend si trata bien los logs

Cuando los logs están mejor diseñados, el backend gana:

- mejor investigación
- menos fuga de secretos
- más trazabilidad útil
- mejor respuesta a incidentes
- menos ruido
- mejor soporte
- más capacidad de detectar abuso o errores reales
- mejor auditoría sobre acciones críticas

No es solo prolijidad operativa.
Es seguridad concreta.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- logs con contexto útil
- correlation/request id
- pocos secretos expuestos
- DTOs no volcados enteros por costumbre
- eventos sensibles con trazabilidad reforzada
- diferencia razonable entre log técnico y auditoría
- consistencia en campos y mensajes
- revisión consciente de filtros automáticos

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- “logueemos todo por si acaso”
- bodies completos en endpoints sensibles
- tokens en texto claro
- cookies de sesión visibles
- headers de auth volcados
- contraseñas en WARN/ERROR
- logs tan ruidosos que nadie ve nada importante
- ausencia de actor, tenant o requestId en eventos críticos

---

## Checklist práctico

Cuando revises logs en una app Spring, preguntate:

- ¿qué información registran los endpoints sensibles?
- ¿aparecen contraseñas, tokens o cookies?
- ¿qué parte del request se loguea automáticamente?
- ¿hay correlation id o request id?
- ¿las operaciones críticas dejan trazabilidad suficiente?
- ¿qué datos personales realmente hacen falta en logs?
- ¿hay DTOs enteros volcados por comodidad?
- ¿se distingue bien entre debugging técnico y auditoría?
- ¿los errores incluyen secretos o payloads de más?
- ¿el equipo puede explicar claramente qué nunca debería aparecer en logs?

---

## Mini ejercicio de reflexión

Tomá cinco eventos de tu backend y respondé:

1. ¿Qué se loguea hoy?
2. ¿Qué parte de eso realmente ayuda?
3. ¿Qué parte expone de más?
4. ¿Qué secreto o dato sensible podría filtrarse?
5. ¿Hay requestId, actorId, tenantId o recurso afectado?
6. ¿Ese evento debería ser log técnico, auditoría o ambos?
7. ¿Cuál de los cinco logs actuales te daría más vergüenza si mañana se filtrara?

Ese ejercicio ayuda muchísimo a bajar fuga accidental sin perder capacidad de investigar.

---

## Resumen

Los logs son esenciales para:

- debugging
- observabilidad
- soporte
- incidentes
- auditoría técnica

Pero no deberían convertirse en una fuente de:

- contraseñas
- tokens
- cookies
- secretos
- datos personales innecesarios
- ruido inmanejable

En resumen:

> Un backend más maduro no elige entre loguear todo o no loguear nada.  
> Elige registrar lo que realmente ayuda a entender el sistema, sin convertir a la observabilidad en una fuga paralela de información sensible.

---

## Próximo tema

**Errores seguros: qué decir y qué no decir**
