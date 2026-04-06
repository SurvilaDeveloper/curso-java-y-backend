---
title: "MFA y segundo factor en backend Spring"
description: "Cómo pensar MFA y segundo factor en una aplicación Java con Spring Boot y Spring Security. Qué problema resuelve realmente, cuándo aporta valor, qué errores de diseño lo debilitan y cómo integrarlo sin confundirlo con una simple capa cosmética sobre el login."
order: 30
module: "Autenticación"
level: "base"
draft: false
---

# MFA y segundo factor en backend Spring

## Objetivo del tema

Entender qué problema resuelve realmente **MFA** (Multi-Factor Authentication) en una aplicación Java + Spring Boot + Spring Security, y cómo integrarlo sin convertirlo en una capa superficial que “parece más segura” pero deja intactos varios riesgos de fondo.

Este tema importa mucho porque el segundo factor suele verse como un sello de seguridad fuerte, pero en la práctica puede quedar mal planteado si:

- se agrega sin pensar el flujo completo
- se trata como un paso cosmético
- se saltea en escenarios delicados
- se implementa con factores débiles
- no se integra bien con recuperación, sesiones y autenticación

En resumen:

> MFA no reemplaza una buena autenticación primaria.  
> La complementa para reducir el valor de una sola credencial comprometida.

---

## Idea clave

El segundo factor existe para que la autenticación no dependa solamente de algo que el usuario sabe, como una contraseña.

En resumen:

> MFA intenta exigir una prueba adicional de control sobre otro factor distinto, de modo que robar o adivinar la password no alcance por sí solo para obtener acceso completo.

Eso mejora mucho la defensa frente a cosas como:

- credential stuffing
- passwords reutilizadas
- phishing parcial
- contraseñas filtradas
- compromiso de una sola credencial

Pero no resuelve automáticamente:

- mala autorización
- sesiones demasiado largas
- recuperación de cuenta débil
- tokens mal emitidos
- dispositivos o canales comprometidos
- UX confusa o bypasses del flujo

---

## Qué significa “segundo factor”

En autenticación, suele pensarse en factores como:

## Algo que sabés
- password
- PIN

## Algo que tenés
- app autenticadora
- dispositivo registrado
- token físico
- código temporal

## Algo que sos
- biometría

En backend, lo más habitual es trabajar con MFA basada en:

- TOTP (códigos temporales generados por app autenticadora)
- códigos one-time enviados por algún canal
- dispositivos o sesiones marcadas
- a veces WebAuthn o factores más avanzados, aunque eso ya suele ir bastante más allá de un curso introductorio base

Para este nivel del curso, conviene centrar la idea en:

- password + código temporal
- password + confirmación de segundo paso
- password + factor adicional claramente separado

---

## Qué problema resuelve MFA

Supongamos que un atacante consigue:

- una contraseña filtrada
- una contraseña reutilizada
- una contraseña obtenida por phishing
- una contraseña probada con credential stuffing

Si el sistema depende solo de password, eso puede bastar.

Si además exige un segundo factor bien implementado, el atacante todavía necesita:

- controlar el segundo factor
- o romper otro canal adicional

Eso cambia bastante el costo del ataque.

---

## Qué problema no resuelve por sí solo

MFA no arregla por sí solo cosas como:

- permisos mal modelados
- IDOR
- tokens excesivamente duraderos
- recuperación de cuenta floja
- login con demasiada enumeración
- refresh tokens inseguros
- cuentas técnicas sobredimensionadas
- sesiones no revocables
- paneles admin demasiado poderosos

También puede fallar bastante si:

- el segundo factor se saltea en puntos críticos
- el recovery flow permite tomar la cuenta igual de fácil
- el canal del segundo factor está débil o comprometido
- el sistema trata “recordar dispositivo” de forma ingenua

---

## Error mental clásico

Mucha gente piensa algo como:

- “si tiene MFA, ya está”
- “agregamos un código y listo”
- “con enviar un OTP por mail alcanza”
- “si la password fue correcta y después pidió un código, el diseño ya es robusto”
- “MFA reemplaza otros controles del login”

Eso es demasiado optimista.

La pregunta útil no es solo:

- ¿hay segundo factor?

También es:

- ¿cuándo se exige?
- ¿cómo se valida?
- ¿cuándo se saltea?
- ¿qué pasa en recovery?
- ¿qué pasa con sesiones previas?
- ¿qué tan fuerte es realmente ese factor?
- ¿qué superficie nueva introduce?

---

## Cuándo tiene más valor MFA

MFA suele aportar mucho valor especialmente cuando:

- la cuenta tiene capacidades importantes
- el riesgo de credential stuffing es real
- hay datos sensibles
- hay paneles administrativos o backoffice
- el sistema tiene cuentas de soporte
- el daño de una toma de cuenta sería alto
- existe riesgo real de reutilización de contraseñas
- se manejan acciones críticas con impacto financiero u operativo

En cuentas de muy bajo riesgo también puede servir, pero el trade-off con UX suele pesar más.

---

## Dónde ubicar MFA en el flujo

Una forma conceptual sana de pensarlo es esta:

### Paso 1
El usuario presenta credencial primaria:
- email + password

### Paso 2
El backend verifica esa credencial primaria.

### Paso 3
Si la cuenta requiere MFA:
- la autenticación todavía no está plenamente completada
- el sistema pasa a un estado intermedio o challenge pendiente

### Paso 4
El usuario presenta segundo factor:
- código TOTP
- OTP
- verificación adicional equivalente

### Paso 5
Recién ahí el backend emite sesión o tokens plenos.

Esta separación importa mucho.
No conviene tratar la password correcta como acceso completo si todavía falta el segundo factor.

---

## Qué no conviene hacer

Estas cosas suelen ser malas ideas:

- emitir acceso completo antes del segundo factor
- usar el segundo paso solo como “confirmación visual” sin impacto real
- permitir bypass en ciertos endpoints sensibles
- usar un factor demasiado débil sin entender el riesgo
- hacer recovery del MFA con un flujo más débil que el propio MFA
- tratar “recordar dispositivo” como una puerta eterna y ciega
- mezclar MFA con autorización sin un modelo claro

---

## MFA por TOTP: por qué suele ser una buena base conceptual

Un modelo muy razonable para backend es TOTP:

- el usuario registra una app autenticadora
- el backend comparte un secreto inicial de enrolamiento
- la app genera códigos temporales
- el backend valida el código en login o desafío posterior

### Ventajas generales

- no depende del email como canal secundario
- no depende de SMS
- no exige guardar códigos permanentes
- es bastante estándar
- reduce mucho el valor de password robada sola

No hace falta entrar acá en todos los detalles de librerías.
Lo importante es entender el modelo.

---

## Qué papel juega el backend en MFA

En un diseño sano, el backend debería controlar cosas como:

- si la cuenta tiene MFA habilitado
- qué tipo de segundo factor usa
- en qué paso del flujo exigirlo
- cómo validar el código o desafío
- cuándo emitir acceso pleno
- cuándo invalidar el paso intermedio
- cómo registrar los eventos
- cómo manejar recovery y revocación

No debería quedar como algo puramente del frontend.

---

## Qué estados conviene distinguir

Cuando una app incorpora MFA, suele ser útil distinguir estados como:

- credencial primaria válida
- segundo factor pendiente
- autenticación completa
- cuenta con MFA habilitado
- cuenta con MFA no enrolado todavía
- dispositivo recordado o no, si existe ese concepto

Lo importante es que el backend no trate “password correcta” y “login completo” como si fueran lo mismo cuando MFA es obligatorio.

---

## Ejemplo conceptual de flujo en dos etapas

### Paso 1: login inicial

```java
public LoginStepOneResponse login(LoginRequest request) {
    Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    request.getEmail().trim().toLowerCase(),
                    request.getPassword()
            )
    );

    SecurityUser principal = (SecurityUser) authentication.getPrincipal();

    if (principal.isMfaEnabled()) {
        String challengeId = mfaChallengeService.createChallenge(principal.getId());
        return LoginStepOneResponse.mfaRequired(challengeId);
    }

    return LoginStepOneResponse.authenticated(tokenService.issueTokens(principal));
}
```

### Paso 2: confirmación MFA

```java
public AuthResponse verifyMfa(MfaVerifyRequest request) {
    MfaChallenge challenge = mfaChallengeService.validateChallenge(request.getChallengeId());

    User user = userRepository.findById(challenge.getUserId()).orElseThrow();

    if (!totpService.verify(user.getMfaSecret(), request.getCode())) {
        throw new IllegalStateException("Código inválido");
    }

    mfaChallengeService.consume(challenge);

    return tokenService.issueTokens(new SecurityUser(user));
}
```

### Qué ideas muestra esto

- no emitir acceso completo demasiado pronto
- separar challenge de sesión plena
- tratar MFA como parte real del flujo de autenticación
- usar un estado intermedio controlado

---

## Por qué no conviene emitir JWT pleno antes del segundo factor

Si emitís el token definitivo apenas la password fue correcta y luego “pedís un código”, el diseño queda flojo.

Porque el actor ya tiene acceso útil antes de completar MFA.

MFA debería ser una condición real para emitir la identidad plenamente autenticada, no una especie de check visual decorativo.

---

## Qué pasa con “recordar dispositivo”

Este patrón puede ser útil para UX, pero merece muchísimo cuidado.

### Riesgos si se hace ingenuamente

- sesiones demasiado largas sin MFA real
- bypass persistente del segundo factor
- imposibilidad de revocar con claridad
- poca trazabilidad
- confianza excesiva en un dispositivo ya no confiable

Si se implementa algo así, conviene pensar muy bien:

- cuánto dura
- cómo se revoca
- cómo se liga al dispositivo o contexto
- en qué eventos vuelve a exigirse MFA
- qué pasa tras cambio de password o incidente

No debería ser un “desactivar MFA para siempre desde este navegador” sin criterio.

---

## Qué pasa con recovery de MFA

Este es uno de los puntos más delicados.

Un sistema puede tener MFA fuerte y aun así quedar débil si recuperar el segundo factor es demasiado fácil.

### Ejemplos de recovery flojo

- “mandamos un link al mismo canal sin demasiada protección”
- “si sabés el email ya podés resetear MFA fácil”
- “soporte lo desactiva sin proceso serio”
- “cambiar password ya desactiva MFA”

En recuperación de MFA conviene pensar con bastante cuidado, porque si ese flujo es flojo, el segundo factor pierde mucho valor real.

---

## Qué relación tiene esto con sesiones y tokens

MFA no termina cuando el usuario mete bien el código.

Después también importa:

- qué token emitís
- cuánto dura
- si el refresh token conserva el nivel de confianza adecuado
- cuándo volver a exigir MFA
- qué pasa si cambia la password
- qué pasa si se revoca un dispositivo
- qué pasa tras eventos de riesgo o cuenta comprometida

La autenticación completa no es solo “pasó el segundo paso”.
También importa cómo se sostiene el estado autenticado después.

---

## Qué registrar en auditoría

Conviene registrar cosas como:

- MFA habilitado o deshabilitado
- enrolamiento inicial
- intentos fallidos de segundo factor
- desafío MFA creado
- desafío consumido
- éxito de verificación MFA
- recovery o reset de MFA
- revocación de dispositivo o bypass de confianza

Esto ayuda a:

- investigación
- soporte
- monitoreo
- revisión de incidentes
- detección de abuso

---

## Qué errores de UX también importan

MFA no es solo seguridad.
También tiene impacto fuerte en experiencia.

Si el flujo queda mal diseñado, puede generar:

- abandono
- tickets de soporte
- confusión sobre qué paso falta
- errores en enrolamiento
- frustración con códigos expirados
- gente evitando activar MFA

Por eso conviene que el flujo sea:

- claro
- consistente
- con mensajes prudentes pero comprensibles
- con lifecycle explícito
- con recovery pensado

Seguridad y UX no son enemigos acá; tienen que convivir.

---

## Qué señales hacen ruido rápido

Estas cosas suelen prender alarma:

- el login ya emite token pleno antes de MFA
- el segundo factor se puede saltear sin criterio claro
- recovery de MFA flojo
- no hay trazabilidad
- el sistema no distingue bien estados intermedios
- “recordar dispositivo” casi desactiva MFA en la práctica
- MFA habilitado pero irrelevante en endpoints sensibles
- el equipo no puede explicar cuándo realmente considera “autenticado” al usuario

---

## Qué gana la app si resuelve bien esto

Una app que integra MFA con criterio gana:

- menos valor ofensivo de una sola credencial robada
- mejor defensa frente a stuffing y reuse
- mayor protección para cuentas críticas
- mejor claridad del flujo de autenticación
- mejor base para endurecer operaciones sensibles
- mejor trazabilidad
- más margen de defensa si una password se compromete

No reemplaza otras capas, pero suma bastante si está bien pensada.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- MFA tratado como parte real de autenticación
- challenge temporal claro
- acceso pleno emitido solo al final
- segundo factor fuerte y acotado
- estados explícitos
- recovery pensado
- trazabilidad útil
- reglas claras sobre cuándo se exige y cuándo se vuelve a exigir

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- MFA cosmético
- bypass fácil
- recovery débil
- sesiones eternas con “dispositivo recordado”
- segundo factor por canales débiles sin criterio
- controller mezclando todo el flujo
- poca separación entre password ok y auth completa
- equipo sin modelo mental claro del lifecycle del segundo factor

---

## Checklist práctico

Cuando revises MFA en una app Spring, preguntate:

- ¿qué tipo de segundo factor usa?
- ¿cuándo se exige realmente?
- ¿qué pasa después de la password correcta?
- ¿se emite acceso pleno antes o después del segundo factor?
- ¿hay un challenge temporal claro?
- ¿cómo se valida el código o prueba?
- ¿qué pasa si falla varias veces?
- ¿qué pasa con recovery de MFA?
- ¿qué pasa con sesiones y refresh tokens posteriores?
- ¿qué significa exactamente “recordar dispositivo” en este sistema?
- ¿qué trazabilidad deja el flujo?

---

## Mini ejercicio de reflexión

Tomá tu diseño actual o imaginario de MFA y respondé:

1. ¿Cuál es el primer factor?
2. ¿Cuál es el segundo?
3. ¿Cuándo considera el backend que la autenticación está completa?
4. ¿Qué pasa si la password fue correcta pero el segundo factor falla?
5. ¿Qué pasa si el usuario pierde el segundo factor?
6. ¿Qué sesiones o tokens permanecen válidos después?
7. ¿Qué parte del flujo podría usarse como bypass o recovery demasiado cómodo?

Ese ejercicio ayuda mucho a detectar si MFA está realmente integrado o solo agregado encima.

---

## Resumen

MFA en backend Spring debería pensarse como una parte real del flujo de autenticación, no como un adorno.

Conviene que tenga, como mínimo:

- segundo factor claro
- challenge temporal
- acceso pleno solo después de completarlo
- recovery bien pensado
- trazabilidad
- reglas claras sobre revocación, sesiones y reexigencia

En resumen:

> El segundo factor aporta valor cuando realmente cambia el costo de una credencial comprometida.  
> Si solo se agrega como paso decorativo o se puede saltear fácil, ese valor se desinfla muy rápido.

---

## Próximo tema

**Sesiones server-side en Spring**
