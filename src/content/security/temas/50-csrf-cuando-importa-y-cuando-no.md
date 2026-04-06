---
title: "CSRF: cuándo importa y cuándo no"
description: "Cómo entender CSRF en una aplicación Java con Spring Boot y Spring Security. Cuándo realmente importa, cuándo no es el riesgo principal y cómo decidir si tu arquitectura necesita protección específica contra requests forjadas desde el navegador."
order: 50
module: "Defensa contra abuso"
level: "base"
draft: false
---

# CSRF: cuándo importa y cuándo no

## Objetivo del tema

Entender qué es **CSRF** en una aplicación Java + Spring Boot + Spring Security, cuándo realmente importa y cuándo no conviene repetir defensas por costumbre sin entender bien el modelo de autenticación que usa el sistema.

Este tema importa mucho porque CSRF genera mucha confusión.

A veces aparece tratado como:

- una amenaza universal que siempre está presente
- una casilla que hay que tildar porque “Spring lo trae”
- algo que se desactiva sin pensar porque “estamos usando API”
- un problema que se mezcla mal con JWT, sesiones, cookies y CORS

Y eso produce dos errores muy comunes:

- activar o mantener protección sin entender qué está defendiendo
- desactivarla aunque la arquitectura sí la necesitaba

En resumen:

> CSRF no depende de si tu app es moderna o vieja.  
> Depende sobre todo de cómo se autentica el navegador y de si ese navegador puede enviar automáticamente credenciales a un request no intencional.

---

## Idea clave

CSRF significa, a grandes rasgos, que un sitio o contexto externo logra que el navegador de una víctima autenticada haga una request válida hacia tu sistema sin que la víctima realmente haya querido ejecutar esa acción.

En resumen:

> CSRF aparece cuando el navegador puede mandar automáticamente una credencial válida a tu backend y ese backend acepta la acción sin una prueba adicional de intención legítima.

La palabra clave acá es:

- **automáticamente**

Eso es lo que vuelve tan importante entender:

- cookies
- sesiones
- credenciales que viajan solas
- arquitectura del cliente
- tipo de autenticación

---

## Qué problema intenta resolver la defensa CSRF

La defensa CSRF intenta evitar situaciones como:

- un usuario logueado visita otro sitio malicioso
- ese sitio consigue que el navegador haga una request hacia tu backend
- el navegador manda cookies o credenciales asociadas a tu sistema
- tu backend ve la request como autenticada
- la acción se ejecuta aunque el usuario nunca quiso hacerla conscientemente

### Ejemplos típicos de acciones sensibles

- cambiar email
- cambiar contraseña
- borrar algo
- crear recursos
- ejecutar compras
- cancelar órdenes
- transferir fondos
- actualizar perfil
- deshabilitar seguridad
- aceptar invitaciones
- modificar configuraciones

La idea no es que el atacante “robe” la sesión.
La idea es que use el navegador autenticado de la víctima como vehículo.

---

## Error mental clásico

Mucha gente piensa algo como:

- “si tenemos login, ya está”
- “si usamos HTTPS, no hay CSRF”
- “si usamos Spring Security, lo resolvió el framework”
- “si es API, entonces no importa”
- “si usamos JWT, entonces no existe”
- “si usamos cookies, siempre existe”
- “si el frontend es SPA, ya no aplica”

Todas esas frases pueden ser ciertas, falsas o incompletas según el modelo concreto.

Por eso este tema se centra en la pregunta correcta:

- **¿el navegador puede enviar credenciales válidas automáticamente en una request no intencional hacia tu backend?**

Si la respuesta es sí, CSRF merece atención seria.

---

## Qué hace posible un ataque CSRF

Un ataque CSRF suele necesitar, conceptualmente, varias piezas:

## 1. La víctima ya está autenticada
Tiene una sesión o credencial válida en el navegador.

## 2. El navegador puede enviar esa credencial automáticamente
Por ejemplo mediante cookie.

## 3. El atacante logra disparar una request desde otro contexto
Por ejemplo:
- un sitio malicioso
- una página comprometida
- contenido embebido
- formularios o requests disparadas indirectamente

## 4. El backend no exige una señal adicional de intención legítima
Acepta la request solo porque la credencial llegó válida.

Ahí aparece el problema.

---

## La autenticación con cookies es la zona más clásica de CSRF

CSRF importa especialmente cuando la autenticación depende de cookies que el navegador adjunta automáticamente.

### Ejemplo típico

- el usuario hace login
- el servidor crea sesión
- el navegador guarda cookie de sesión
- luego cualquier request al backend puede incluir esa cookie si se dan las condiciones adecuadas

Si tu backend acepta una acción sensible solo con esa cookie, entonces CSRF se vuelve una amenaza real.

### Idea importante

No porque la cookie sea “mala”.
Sino porque el navegador la maneja automáticamente y eso puede ser explotado si no hay otra validación de intención.

---

## Sesiones server-side y CSRF

En aplicaciones con:

- sesión server-side
- cookie tipo `JSESSIONID`
- formularios o endpoints mutativos

CSRF suele importar bastante.

### ¿Por qué?

Porque el backend puede ver la request como autenticada solo por la cookie de sesión.

Si un sitio externo logra hacer que el navegador mande esa request, el servidor podría ejecutarla creyendo que vino legítimamente del usuario.

Por eso en aplicaciones clásicas basadas en sesión, las defensas CSRF suelen ser muy relevantes.

---

## JWT y CSRF: no siempre, no nunca

Acá aparece mucha confusión.

### Caso 1: JWT en header `Authorization` manejado explícitamente por el cliente
Si el navegador no manda ese token automáticamente a requests cross-site, el escenario clásico de CSRF se reduce mucho.

En ese caso, CSRF suele no ser el problema principal del mismo modo que en sesiones por cookie.

### Caso 2: JWT guardado en cookie y enviado automáticamente
Ahí la historia puede parecerse mucho más al caso clásico, porque el navegador vuelve a mandar la credencial automáticamente.

Entonces:

- JWT por sí solo no elimina automáticamente CSRF
- y “usar JWT” no responde la pregunta completa
- importa **dónde viaja** y **cómo se envía**

---

## Regla práctica bastante útil

Preguntate esto:

> ¿el navegador, por sí solo, puede enviar una credencial válida a mi backend en una request disparada desde otro origen o contexto?

### Si la respuesta es sí
CSRF probablemente importe.

### Si la respuesta es no
CSRF clásico puede no ser la amenaza principal en esa arquitectura.

Eso simplifica muchísimo el razonamiento.

---

## Qué tipo de endpoints son especialmente sensibles

CSRF importa sobre todo en endpoints que:

- cambian estado
- crean
- editan
- borran
- confirman acciones
- disparan operaciones críticas

### Ejemplos

- `POST /profile/email`
- `POST /orders/{id}/cancel`
- `PATCH /users/me`
- `POST /billing/refund`
- `DELETE /addresses/{id}`
- `POST /security/reset-mfa`

### Menos importante en general para
- lecturas puras
- endpoints idempotentes sin impacto
- consultas sin cambio de estado

Aunque igual conviene que el diseño HTTP sea coherente y no use `GET` para acciones mutativas.

---

## GET no debería mutar

Este punto es importante porque se relaciona mucho con CSRF.

Si tu app hace cosas como:

```java
@GetMapping("/orders/{id}/cancel")
public ResponseEntity<Void> cancel(@PathVariable Long id) { ... }
```

el problema ya es serio por sí mismo.

### ¿Por qué?

Porque `GET` debería ser seguro y no mutativo.
Si usás `GET` para cambiar estado:

- aumentás muchísimo riesgo de ejecuciones accidentales
- complicás caching y semántica HTTP
- abrís una puerta más fácil para requests no intencionales

Una defensa madura contra CSRF empieza también por respetar mejor el diseño de métodos HTTP.

---

## Qué papel juega Spring Security

Spring Security tiene soporte muy conocido para CSRF, especialmente en aplicaciones que usan sesión y formularios o cookies de sesión.

Eso es útil.
Pero no conviene tratarlo como magia.

### Preguntas que igual tenés que poder responder

- ¿qué credencial se manda automáticamente?
- ¿desde dónde?
- ¿qué endpoints cambian estado?
- ¿qué cliente consume esta API?
- ¿hay navegador involucrado?
- ¿hay cookies sensibles?
- ¿el sistema necesita realmente protección CSRF en este flujo?

Es decir:
- Spring ayuda
- pero vos tenés que entender el modelo

---

## ¿Cuándo importa claramente?

CSRF suele importar claramente cuando tenés algo así:

- navegador
- usuario autenticado
- sesión o cookie sensible
- requests mutativas
- backend que acepta la acción solo por esa cookie

### Ejemplo típico

- app web tradicional
- backend Spring MVC / Spring Security
- login con sesión
- formularios y acciones en navegador

Ahí desactivar CSRF “porque sí” suele ser una mala idea.

---

## ¿Cuándo suele importar menos o no ser el principal problema?

Suele importar mucho menos en escenarios donde:

- el cliente no depende de cookies automáticas para autenticarse
- el token va en header `Authorization`
- el cliente lo adjunta explícitamente
- el navegador no puede disparar fácilmente una request autenticada válida solo por contexto

### Ejemplo típico

- API consumida por clientes que envían bearer token explícito
- frontend desacoplado que no depende de cookie automática para auth

Ahí otras amenazas pueden pesar más que CSRF clásico.

### Pero ojo

Eso no significa:
- “no hay riesgos”
- “ya está todo resuelto”

Solo significa que el vector clásico de CSRF puede perder relevancia frente a otros.

---

## SameSite ayuda, pero no debería ser tu único modelo mental

Las cookies con atributos como `SameSite` ayudan bastante a reducir ciertos escenarios de envío automático en contextos cross-site.

Eso es valioso.

Pero no conviene pensar solo:

- “como tengo SameSite, ya no existe CSRF”

Más sano es pensarlo así:

- `SameSite` puede reducir superficie
- pero sigue siendo importante entender el modelo de autenticación
- y seguir usando defensas coherentes con tu arquitectura

---

## CORS no es defensa CSRF por sí sola

Este es otro punto de mucha confusión.

### Error frecuente

- “como tengo CORS configurado, ya estoy cubierto”

CORS y CSRF no son lo mismo.

CORS regula ciertas interacciones cross-origin y lectura desde navegador.
No reemplaza por sí solo la defensa contra requests autenticadas no intencionales si el navegador puede mandar credenciales automáticamente.

Entonces:
- CORS importa
- pero no deberías usarlo como respuesta simplista a CSRF

---

## Qué es una señal adicional de intención legítima

Conceptualmente, una defensa CSRF agrega algo que un sitio externo no puede adivinar o reutilizar tan fácilmente solo por lograr que el navegador haga la request.

Eso puede tomar distintas formas según arquitectura, pero la idea central es:

- no aceptar una request mutativa solo porque la cookie viajó
- exigir una prueba adicional que ligue la acción a un cliente legítimo

Ahí es donde aparecen los tokens CSRF o mecanismos equivalentes.

---

## Qué no conviene hacer

Estas cosas suelen ser malas ideas:

- desactivar CSRF sin entender el modelo
- dejar habilitado por costumbre sin saber qué protege
- usar `GET` para acciones mutativas
- asumir que JWT elimina CSRF automáticamente
- asumir que CORS lo resuelve todo
- asumir que frontend “de confianza” hace innecesaria la defensa
- asumir que estar detrás de HTTPS ya alcanza

---

## Ejemplo de razonamiento sano

### Caso A: sesión server-side con navegador
- cookie automática
- endpoints mutativos
- aplicación web
- usuario interactúa desde browser

Acá CSRF importa claramente.

### Caso B: access token bearer enviado explícitamente en header
- no depende de cookie automática
- cliente adjunta credencial de forma explícita
- API desacoplada

Acá CSRF clásico puede no ser el problema principal.

### Lo importante

La decisión sale del modelo de autenticación y transporte real.
No de slogans.

---

## Qué señales muestran que deberías revisar esto con más cuidado

Estas cosas suelen hacer ruido rápido:

- uso de sesión con navegador y CSRF desactivado “porque sí”
- cookies sensibles con endpoints mutativos
- `GET` usado para cambiar estado
- equipo que dice “tenemos JWT” pero no sabe cómo viaja
- mezcla confusa entre SPA, cookies y auth
- uso de CORS como respuesta mágica
- nadie puede explicar por qué CSRF está habilitado o deshabilitado

---

## Qué gana el backend si entiende bien cuándo importa

Cuando el backend entiende bien CSRF, gana:

- menos defensas mal aplicadas
- menos configuración ritual sin sentido
- menos huecos reales en apps basadas en cookie
- mejor criterio para elegir arquitectura de auth
- mejor diseño de endpoints mutativos
- menos confusión entre cookie, JWT, header y navegador

No es solo un tema de “activar o desactivar una bandera”.
Es un tema de entender fronteras de confianza del navegador.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- comprensión clara del modelo de autenticación
- protección CSRF donde la arquitectura la necesita
- menos superstición alrededor de JWT
- métodos HTTP bien usados
- cookies tratadas con cuidado
- equipo capaz de explicar qué vector se está mitigando

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- “siempre desactivamos CSRF”
- “siempre lo dejamos porque sí”
- “como es API no importa” sin más análisis
- “como usamos JWT no existe” sin saber cómo viaja
- endpoints mutativos por `GET`
- nadie sabe por qué la protección está configurada así

---

## Checklist práctico

Cuando revises CSRF en una app Spring, preguntate:

- ¿hay navegador involucrado?
- ¿la autenticación depende de cookies automáticas?
- ¿qué endpoints cambian estado?
- ¿se usan correctamente `POST`, `PATCH`, `DELETE`, etc.?
- ¿las cookies sensibles pueden viajar automáticamente en requests no intencionales?
- ¿el sistema usa header bearer explícito o cookie?
- ¿Spring Security tiene CSRF habilitado o deshabilitado?
- ¿esa decisión está razonada o es solo costumbre?
- ¿el equipo entiende claramente el vector que está mitigando?
- ¿qué otra protección se está confundiendo con CSRF, como CORS o SameSite?

---

## Mini ejercicio de reflexión

Tomá tu arquitectura actual o imaginaria y respondé:

1. ¿Cómo se autentica el navegador?
2. ¿Qué credencial viaja automáticamente?
3. ¿Qué endpoints mutativos existen?
4. ¿Un sitio externo podría disparar una request que llegue autenticada?
5. ¿Qué parte de la defensa actual realmente mitiga eso?
6. ¿CSRF importa mucho, poco o no es el vector principal?
7. ¿La respuesta anterior está basada en فهم del modelo o solo en costumbre?

Ese ejercicio suele aclarar muchísimo más que discutir la palabra “CSRF” en abstracto.

---

## Resumen

CSRF importa especialmente cuando:

- hay navegador
- hay cookies o credenciales automáticas
- hay endpoints mutativos
- el backend acepta la acción solo por esa credencial

Suele importar menos como amenaza principal cuando:

- el token no viaja automáticamente
- el cliente lo envía explícitamente en header

En resumen:

> CSRF no se entiende mirando solo el framework o el nombre del token.  
> Se entiende mirando cómo viaja la credencial, quién la envía automáticamente y si el backend acepta acciones sensibles solo con esa presencia automática.

---

## Próximo tema

**Archivos subidos por usuarios: riesgos básicos**
