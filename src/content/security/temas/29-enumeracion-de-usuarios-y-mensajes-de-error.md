---
title: "Enumeración de usuarios y mensajes de error"
description: "Cómo evitar que una aplicación Java con Spring Boot revele demasiada información sobre la existencia, estado o validez de cuentas a través de mensajes de error, tiempos de respuesta o diferencias de comportamiento en login, registro y recuperación."
order: 29
module: "Autenticación"
level: "base"
draft: false
---

# Enumeración de usuarios y mensajes de error

## Objetivo del tema

Entender qué es la **enumeración de usuarios**, por qué aparece con tanta facilidad en flujos de autenticación y recuperación de cuenta, y cómo reducirla en una aplicación Java + Spring Boot + Spring Security sin volver la experiencia completamente opaca o inútil.

Este tema es importante porque muchas apps no tienen un “bug de login” evidente, pero sí regalan información valiosa a través de:

- mensajes de error
- diferencias de respuesta
- tiempos distintos
- códigos HTTP distintos
- comportamiento desigual entre escenarios

Y esa información puede ayudar muchísimo a alguien que quiera:

- confirmar qué cuentas existen
- distinguir estados internos
- afinar credential stuffing
- automatizar brute force con mejor puntería
- molestar usuarios reales
- preparar ataques posteriores con menos ruido

En resumen:

> la autenticación puede estar técnicamente bien y aun así filtrar demasiado sobre quién existe, qué estado tiene y qué parte del flujo falló.

---

## Idea clave

La enumeración de usuarios ocurre cuando el sistema permite inferir, con un grado útil de confianza, si una cuenta:

- existe
- no existe
- está deshabilitada
- está bloqueada
- está pendiente de activación
- tiene password incorrecta
- ya usó un token
- ya está verificada

En resumen:

> el problema no es solo el mensaje textual.  
> También importan las diferencias de comportamiento, los códigos, la latencia y cualquier señal que permita distinguir escenarios internos.

---

## Qué es enumeración de usuarios

Es la capacidad de descubrir información sobre cuentas válidas o estados de cuenta a partir de cómo responde el backend.

### Ejemplos clásicos

- “No existe usuario con ese email”
- “La contraseña es incorrecta”
- “Tu cuenta está bloqueada”
- “Ese email ya está registrado”
- “La cuenta todavía no fue activada”
- “No encontramos un usuario con ese correo”
- “Ese enlace ya fue usado”
- “El token expiró pero la cuenta existe”

Cada una de esas diferencias puede servir como señal.

---

## Por qué esto importa tanto

Porque un atacante no siempre necesita entrar a la primera.

A veces le alcanza con saber cosas como:

- qué cuentas son reales
- cuáles están activas
- cuáles parecen operativas
- cuáles ya pasaron onboarding
- qué emails tienen cuenta
- qué rutas del flujo responden distinto

Con esa información puede:

- lanzar credential stuffing más preciso
- hacer brute force solo sobre cuentas confirmadas
- probar recuperación de contraseña con más puntería
- generar fraude o phishing mejor dirigido
- molestar usuarios reales con reintentos o resets

La enumeración reduce muchísimo el costo del ataque.

---

## Dónde suele aparecer

La enumeración aparece mucho en:

- login
- registro
- forgot password
- reset password
- activación de cuenta
- reenvío de activación
- cambio de email
- confirmación de acciones sensibles
- endpoints de disponibilidad de username/email
- búsquedas de usuarios
- soporte o backoffice mal expuesto

No es un problema exclusivo del login.

---

## Error mental clásico

Mucha gente piensa algo como:

- “si el usuario se equivocó, conviene decirle exactamente qué pasó”
- “si el email no existe, es mejor avisarlo”
- “si la cuenta está bloqueada, mostremos ese detalle”
- “si el token expiró, digamos exactamente en qué estado quedó”
- “si el email ya está registrado, así ayudamos UX”

Eso puede ser cómodo desde experiencia puntual, pero desde seguridad puede regalar demasiado.

No siempre hay que ocultar absolutamente todo.
Pero sí conviene pensar:

- quién recibe esa señal
- qué utilidad ofensiva tiene
- si realmente hace falta ese nivel de detalle en ese punto

---

## Caso 1: login con mensajes distintos

### Ejemplo riesgoso

```java
@PostMapping("/auth/login")
public ResponseEntity<String> login(@RequestBody LoginRequest request) {
    User user = userRepository.findByEmail(request.getEmail()).orElse(null);

    if (user == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("No existe una cuenta con ese email");
    }

    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("La contraseña es incorrecta");
    }

    if (!user.isEnabled()) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("La cuenta está deshabilitada");
    }

    return ResponseEntity.ok("Login correcto");
}
```

### ¿Qué revela?

- si la cuenta existe
- si la password falló
- si la cuenta está deshabilitada
- posiblemente diferencias de comportamiento explotables

Eso es muy útil para enumeración.

---

## Mejor enfoque general en login

Hacia afuera, suele ser mucho más prudente usar algo como:

- “Credenciales inválidas”

o una respuesta equivalente, estable y poco reveladora.

### Ejemplo conceptual

```java
throw new BadCredentialsException("Credenciales inválidas");
```

Y después manejar:

- logs
- auditoría
- métricas
- soporte
- alertas

con más detalle internamente.

No siempre vas a usar exactamente el mismo texto en todos los casos, pero la idea es reducir diferencias explotables.

---

## Caso 2: forgot password

Este es uno de los puntos más clásicos de enumeración.

### Ejemplo riesgoso

```java
@PostMapping("/auth/forgot-password")
public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
    if (!userRepository.existsByEmail(request.getEmail())) {
        return ResponseEntity.badRequest().body("No existe una cuenta con ese email");
    }

    passwordResetService.sendResetEmail(request.getEmail());
    return ResponseEntity.ok("Te enviamos un mail");
}
```

### Problema

El endpoint confirma de forma muy directa qué emails tienen cuenta.

### Mejor enfoque general

Responder algo como:

- “Si existe una cuenta asociada a ese email, te enviamos instrucciones”

y procesar internamente lo que corresponda.

---

## Caso 3: registro

Acá hay un matiz importante.

En registro, decir “ese email ya está registrado” puede ayudar mucho a UX legítima.
Pero también puede confirmar cuentas existentes.

No siempre hay una única respuesta perfecta.
Depende del sistema y del riesgo.

### Lo importante es entender el trade-off

Más claridad de UX puede significar más capacidad de enumeración.

La decisión no debería ser automática.
Debería ser consciente.

### Ejemplo prudente

- usar mensajes razonables
- pensar rate limiting
- vigilar abuso
- no dejar el registro como una API masiva de confirmación de cuentas

En sistemas con más sensibilidad, a veces conviene ser menos explícito incluso acá.

---

## Caso 4: activación y reenvío de activación

Mensajes como:

- “La cuenta ya fue activada”
- “No encontramos ese email”
- “Esa cuenta todavía no existe”
- “La cuenta existe pero no está activada”
- “Ya enviamos el mail antes”

pueden ayudar a distinguir estados internos.

En estos flujos suele ser más prudente devolver respuestas más uniformes y dejar el detalle real del lifecycle dentro del sistema.

---

## Caso 5: reset de contraseña con token

También hay enumeración en el manejo de tokens.

### Ejemplos de señales problemáticas

- “El token no corresponde a ninguna cuenta”
- “El token era válido pero ya fue usado”
- “El token expiró para el usuario X”
- “La cuenta asociada ya no existe”

Todas esas diferencias pueden regalar demasiado contexto.

Hacia afuera, muchas veces alcanza con algo como:

- “El enlace es inválido o expiró”

y manejar detalle fino adentro.

---

## La enumeración no vive solo en el texto

Esto es muy importante.

Un sistema puede no decir nada explícito y aun así filtrar por:

- código HTTP distinto
- cuerpo de error distinto
- estructura JSON distinta
- headers distintos
- tiempo de respuesta distinto
- cantidad de trabajo interno distinta

### Ejemplo

- email no existente responde muy rápido
- email existente pero password incorrecta responde más lento
- cuenta bloqueada responde con otro código

Eso también es señal.

No siempre se puede igualar absolutamente todo, pero sí conviene reducir diferencias innecesarias.

---

## Latencias y comportamiento diferencial

No hace falta obsesionarse con hacer todos los escenarios idénticos a nivel microscópico.
Pero sí conviene evitar diferencias groseras y sistemáticas.

### Señales comunes de ruido

- si no existe usuario, devolvés instantáneamente
- si existe, hacés password check y tardás más
- si está bloqueado, devolvés otro código
- si necesita activación, mandás otra estructura

Todo eso puede ayudar a distinguir estados.

Una arquitectura más prudente tiende a responder de forma más uniforme en lo visible.

---

## Qué significa “uniformar” sin volver todo inútil

No significa:

- mentir de forma absurda
- romper toda UX
- impedir a soporte entender nada
- negar cualquier mensaje útil

Significa algo más simple:

- dar menos detalle hacia afuera
- conservar más detalle adentro
- reservar información fina para canales legítimos o ya autenticados
- hacer que la señal ofensiva valga menos

---

## Diferenciar UX legítima de seguridad externa

Este es el punto difícil.

A veces el usuario real agradecería que el sistema le diga exactamente:

- “tu cuenta existe pero no activaste el mail”
- “ese correo no está registrado”
- “te equivocaste solo en la contraseña”

Pero el backend no sabe con certeza si quien está preguntando es un usuario legítimo confundido o alguien explorando cuentas.

Por eso conviene ser más prudente en endpoints públicos y reservar más precisión para:

- sesiones ya autenticadas
- paneles de soporte
- flujos posteriores más controlados
- canales seguros

---

## Ejemplo conceptual de respuesta uniforme en forgot password

### DTO

```java
public class ForgotPasswordRequest {

    @NotBlank
    @Email
    private String email;
}
```

### Controller

```java
@PostMapping("/auth/forgot-password")
public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    passwordResetService.startReset(request);
    return ResponseEntity.noContent().build();
}
```

### Service

```java
public void startReset(ForgotPasswordRequest request) {
    String normalizedEmail = request.getEmail().trim().toLowerCase();

    userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
        String rawToken = resetTokenService.generateSecureToken();
        passwordResetTokenService.createToken(user, rawToken);
        mailService.sendPasswordResetEmail(user.getEmail(), rawToken);
    });
}
```

### Qué logra esto

- si existe cuenta, actúa
- si no existe, no revela nada especial
- la respuesta externa puede ser igual en ambos casos

---

## Qué decisiones ayudan a reducir enumeración

## 1. Mensajes más uniformes
No diferenciar demasiado entre escenarios sensibles.

## 2. Códigos HTTP prudentes
No usar códigos demasiado distintos si la diferencia revela estado interno sensible.

## 3. Respuestas con estructura estable
Evitar formatos de error radicalmente distintos según caso.

## 4. Menor diferencia de comportamiento visible
Reducir señales obvias por tiempo o flujo.

## 5. Rate limiting y observabilidad
Si un endpoint sirve para probar muchas cuentas, vigilarlo y limitarlo.

## 6. Reservar detalle para canales más seguros
No dar en endpoints públicos todo el detalle que soporte o auditoría sí pueden necesitar.

---

## Qué no hacer por “comodidad”

Estas cosas suelen ser malas ideas:

- mensajes textuales súper específicos en login o reset
- `existsByEmail` con respuesta directa al cliente
- endpoints de “chequeo de disponibilidad” sin pensar abuso
- códigos HTTP distintos para cada estado interno sensible
- tiempos groseramente distintos entre cuenta existente e inexistente
- respuestas JSON con distinto shape según estado de la cuenta
- usar la API de auth como si fuera una interfaz de diagnóstico para usuarios anónimos

---

## Relación con brute force y credential stuffing

La enumeración hace mucho más útiles los intentos masivos.

Porque si el atacante ya sabe:

- qué cuentas existen
- cuáles parecen activas
- cuáles ya están verificadas

entonces puede invertir intentos solo donde valen más.

Por eso reducir enumeración mejora también:

- defensa contra brute force
- defensa contra credential stuffing
- defensa contra phishing dirigido
- protección general de cuentas

---

## Señales de diseño sano

Una app más sana suele mostrar:

- mensajes prudentes
- respuestas bastante uniformes
- poco detalle externo en endpoints sensibles
- más detalle en logs y auditoría interna
- menor diferencia visible entre escenarios
- vigilancia sobre endpoints propensos a enumeración
- decisiones conscientes sobre trade-offs de UX

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- “usuario no existe” vs “password incorrecta”
- “cuenta bloqueada” revelada en login público
- forgot-password que confirma existencia
- reset que distingue demasiado estados del token
- activación que revela si una cuenta está pendiente
- registro que se usa fácil para confirmar emails masivamente
- respuestas muy distintas en tiempo, texto o código

---

## Qué mirar en una codebase Spring

Cuando revises autenticación, fijate especialmente en:

- login controller
- forgot password
- reset password
- activación de cuenta
- reenvío de activación
- validación de email disponible/ocupado
- mensajes globales de error
- handlers de `AuthenticationException`
- diferencias de status code
- latencias muy distintas según path lógico

---

## Ejemplo de enfoque más prudente en login

### Controller

```java
@PostMapping("/auth/login")
public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
}
```

### Manejo de error conceptual

```java
@ExceptionHandler(AuthenticationException.class)
public ResponseEntity<Map<String, String>> handleAuthenticationError(AuthenticationException ex) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("message", "Credenciales inválidas"));
}
```

### Qué mejora esto

- menos detalle externo
- respuesta más uniforme
- lógica de auth menos ruidosa hacia afuera
- espacio para registrar detalle interno por otro canal

---

## Importante: no todo tiene que ser 100% indistinguible

En sistemas reales puede haber límites prácticos.

No siempre vas a lograr:

- misma latencia exacta
- misma ruta interna
- mismo costo computacional

Y tampoco siempre conviene destruir toda UX legítima.

Lo importante es reducir diferencias **útiles para un atacante**, no perseguir una perfección teatral.

---

## Checklist práctico

Cuando revises enumeración de usuarios en una app Spring, preguntate:

- ¿el login distingue entre usuario inexistente y password incorrecta?
- ¿forgot-password confirma si existe el email?
- ¿la activación revela estados internos de cuenta?
- ¿el reset revela demasiado sobre el token o la cuenta?
- ¿hay endpoints de disponibilidad de email/username expuestos sin mucho control?
- ¿los códigos HTTP cambian demasiado según escenario?
- ¿la estructura de error cambia demasiado?
- ¿las latencias son groseramente distintas?
- ¿el detalle que hoy se muestra afuera realmente hace falta?
- ¿qué parte del feedback convendría mover a logs o soporte en vez de exponerla públicamente?

---

## Mini ejercicio de reflexión

Tomá estos flujos de tu backend:

1. login  
2. forgot password  
3. reset password  
4. activación de cuenta  

Y para cada uno respondé:

- ¿qué diferencia visible hay entre cuenta existente e inexistente?
- ¿qué diferencia visible hay entre estados internos?
- ¿qué parte del mensaje ayuda más al usuario legítimo?
- ¿qué parte ayuda más a un atacante?
- ¿qué podrías uniformar sin romper demasiado la UX?

Ese ejercicio ayuda mucho a bajar la superficie de enumeración sin caer en extremos.

---

## Resumen

La enumeración de usuarios aparece cuando el sistema deja inferir demasiado sobre:

- existencia de cuentas
- estado de las cuentas
- validez de tokens
- etapas del flujo de autenticación

Y no solo a través de mensajes textuales, sino también mediante:

- códigos
- tiempos
- estructuras de respuesta
- diferencias de comportamiento

En resumen:

> Un backend más prudente no usa sus endpoints de autenticación como si fueran una interfaz pública de diagnóstico sobre el estado interno de las cuentas.

---

## Próximo tema

**MFA y segundo factor en backend Spring**
