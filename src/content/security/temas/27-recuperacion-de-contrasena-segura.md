---
title: "Recuperación de contraseña segura"
description: "Cómo diseñar un flujo seguro de recuperación de contraseña en una aplicación Java con Spring Boot y Spring Security. Qué riesgos aparecen al resetear credenciales, cómo usar tokens temporales y qué decisiones ayudan a evitar enumeración, abuso y toma de cuentas."
order: 27
module: "Autenticación"
level: "base"
draft: false
---

# Recuperación de contraseña segura

## Objetivo del tema

Entender cómo diseñar un flujo de **recuperación de contraseña segura** en una aplicación Java + Spring Boot + Spring Security, sin convertirlo en una puerta trasera más fácil de abusar que el propio login.

Este tema importa mucho porque, en la práctica, un sistema puede tener:

- buen hashing
- buen login
- buen control de roles
- buena arquitectura de autenticación

y aun así quedar débil si su mecanismo de recuperación:

- revela demasiado
- usa tokens pobres
- no expira bien
- no invalida estados anteriores
- no deja trazabilidad
- permite abuso o enumeración

En resumen:

> recuperar una contraseña no debería ser una forma cómoda de saltear la seguridad del login.  
> Debería ser un flujo excepcional, acotado, verificable y cuidadosamente diseñado.

---

## Idea clave

Un flujo de recuperación de contraseña seguro no intenta “recordar” la contraseña del usuario.

Intenta permitir que la cambie a través de una prueba temporal de control sobre un canal ya asociado a su cuenta.

En resumen:

> el sistema no debería recuperar la contraseña anterior.  
> Debería permitir un reemplazo controlado mediante un token temporal, de un solo uso, con vencimiento y con baja capacidad de abuso.

---

## Qué intenta resolver realmente este flujo

La recuperación de contraseña intenta responder algo como:

- “si no recordás tu contraseña, ¿cómo podés volver a probar que controlás tu cuenta sin debilitar demasiado el sistema?”

No intenta:

- devolver la contraseña vieja
- mostrar datos internos
- confirmar públicamente si la cuenta existe
- permitir reseteos ilimitados
- evitar toda fricción a cualquier costo

El objetivo no es hacer el reseteo “fácil”.
El objetivo es hacerlo **razonablemente seguro y usable**.

---

## Qué pasos suele tener un flujo sano

Un flujo de recuperación de contraseña bien planteado suele tener estas etapas:

### 1. Solicitud de recuperación
El usuario envía algo como su email.

### 2. Generación de un token temporal
Si corresponde, el backend crea un token de recuperación.

### 3. Envío por canal apropiado
Normalmente email.

### 4. Validación del token
El usuario vuelve con ese token.

### 5. Definición de nueva contraseña
El sistema valida la nueva password y actualiza el hash.

### 6. Invalidación del token y del acceso anterior relevante
El token no debe poder reutilizarse.

### 7. Registro del evento
Para auditoría y seguridad.

---

## Error mental clásico

Muchos sistemas arrancan desde ideas muy débiles como:

- “si el email existe, mandamos algo y si no, devolvemos otro mensaje”
- “el token puede durar bastante total es solo para reset”
- “si el usuario hace click ya está autenticado”
- “la contraseña vieja no hace falta invalidar nada”
- “si total el link se usa una vez, no hace falta mucha estructura”
- “esto es un tema de UX, no de seguridad”

Ese tipo de razonamiento suele terminar en flujos muy fáciles de abusar.

---

## Qué nunca debería hacer un flujo de recuperación

Hay varias cosas que deberían prender alarma inmediata.

## 1. Mostrar la contraseña actual
Nunca.

## 2. Guardar contraseñas reversibles para poder “enviarlas”
Nunca.

## 3. Confirmar demasiado claramente si la cuenta existe
Muy riesgoso.

## 4. Usar tokens débiles o predecibles
Muy peligroso.

## 5. Permitir reutilización de tokens
Mala práctica.

## 6. Mantener tokens válidos por demasiado tiempo
Aumenta superficie.

## 7. Cambiar contraseña sin invalidar el token ya usado
Muy flojo.

## 8. Omitir trazabilidad
Te deja ciego en incidentes.

---

## Caso 1: enumeración de cuentas

Este es uno de los problemas más comunes.

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

### ¿Qué revela?

- si una cuenta existe o no
- qué correos están registrados
- una excelente superficie para enumeración

### Mejor enfoque general

Responder algo uniforme, por ejemplo:

- “Si existe una cuenta asociada a ese email, te enviamos instrucciones”

Y manejar el detalle real internamente.

---

## DTO típico de solicitud

```java
public class ForgotPasswordRequest {

    @NotBlank
    @Email
    private String email;
}
```

Y en controller:

```java
@PostMapping("/auth/forgot-password")
public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    passwordResetService.startReset(request);
    return ResponseEntity.noContent().build();
}
```

Lo importante no es solo el DTO.
Importa sobre todo cómo responde el sistema y qué hace por detrás.

---

## Qué hacer en el service al iniciar el reset

En el service, un flujo sano suele hacer algo así:

- normalizar email
- buscar cuenta si existe
- si existe y corresponde, generar token
- almacenar o registrar su huella de forma segura
- enviar link o código
- responder hacia afuera de forma consistente
- registrar el evento útil

### Ejemplo conceptual

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

### Idea importante

Aunque el usuario no exista, la respuesta externa puede ser la misma.

---

## Qué características debería tener un token de reset

Un token de recuperación debería ser:

- aleatorio
- impredecible
- suficientemente largo
- temporal
- de un solo uso
- asociado a una cuenta concreta
- invalidable
- trazable

No debería ser:

- derivable del email
- derivable del timestamp con poca entropía
- un JWT eterno “porque es cómodo”
- un valor corto fácil de adivinar
- reutilizable indefinidamente

---

## Mala idea: token predecible

### Ejemplo flojo

```java
String token = Base64.getEncoder().encodeToString((email + ":" + System.currentTimeMillis()).getBytes());
```

Esto suele ser una mala idea porque:

- no está pensado como token seguro
- puede ser predecible o estructuralmente débil
- mezcla datos identificables
- puede dar pistas innecesarias

### Mejor enfoque

Usar generación aleatoria fuerte, por ejemplo con `SecureRandom`, o una librería confiable equivalente.

---

## Dónde guardar el token

Una buena práctica general suele ser no guardar el token “en claro” si no hace falta.

Una estrategia razonable puede ser:

- generar token aleatorio
- enviar el valor crudo al usuario
- guardar en backend una huella segura del token o una representación suficientemente protegida
- luego, al validar, comparar contra esa representación

No hace falta convertir esto en algo criptográficamente barroco, pero sí conviene evitar un diseño donde cualquiera con acceso interno vea tokens activos listos para usar.

---

## Qué atributos conviene guardar de un token de recuperación

Una entidad o estructura de reset suele necesitar cosas como:

- id
- userId
- tokenHash o equivalente
- expiresAt
- usedAt
- createdAt
- maybe requestedFrom o metadata mínima útil si el diseño lo requiere

### Ejemplo conceptual

```java
@Entity
public class PasswordResetToken {

    @Id
    @GeneratedValue
    private Long id;

    private Long userId;
    private String tokenHash;
    private Instant createdAt;
    private Instant expiresAt;
    private Instant usedAt;
}
```

Esto es mucho mejor que un valor flotando sin lifecycle claro.

---

## Vencimiento del token

Los tokens de recuperación no deberían vivir demasiado.

### Por qué importa

Cuanto más tiempo dura un token:

- más tiempo hay para interceptarlo o reutilizarlo
- más superficie queda abierta
- más difícil es razonar validez real

No existe un número mágico universal, pero sí una idea sana:

- duración corta
- suficiente para uso normal
- no excesiva

Además, una vez usado, el token debe invalidarse.

---

## Un solo uso

Esta regla es importantísima.

Si el usuario usa el token y cambia la contraseña, ese token no debería volver a servir.

### Señal de diseño flojo

- token reusable
- token que sigue válido hasta expirar aunque ya se haya consumido
- reset múltiple con el mismo enlace

Un reset token sano debería dejar una marca clara de uso y dejar de ser aceptable.

---

## Validación del token

Cuando el usuario vuelve con el token, el backend debería verificar varias cosas:

- que exista una representación válida asociada
- que no esté vencido
- que no haya sido usado
- que corresponda a una cuenta válida
- que el flujo siga teniendo sentido

### DTO típico

```java
public class ResetPasswordRequest {

    @NotBlank
    private String token;

    @NotBlank
    @Size(min = 8, max = 100)
    private String newPassword;
}
```

### Controller

```java
@PostMapping("/auth/reset-password")
public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    passwordResetService.resetPassword(request);
    return ResponseEntity.noContent().build();
}
```

---

## Qué debería hacer el reset real

Cuando llega el token y la nueva contraseña, el backend debería:

- validar token
- validar nueva password
- cargar la cuenta asociada
- hashear la nueva password correctamente
- persistir el nuevo hash
- marcar token como usado o invalidarlo
- invalidar otros tokens de reset activos si corresponde
- considerar invalidación de sesiones o refresh tokens, según el diseño
- registrar el evento

### Ejemplo conceptual

```java
public void resetPassword(ResetPasswordRequest request) {
    PasswordResetToken token = passwordResetTokenService.consumeValidToken(request.getToken());

    User user = userRepository.findById(token.getUserId()).orElseThrow();

    user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);

    passwordResetTokenService.markAsUsed(token);
    sessionSecurityService.invalidateUserSessionsIfNeeded(user.getId());
}
```

---

## Qué pasa con sesiones y tokens existentes

Este punto es muy importante y muchas apps lo olvidan.

Si una cuenta cambia su contraseña porque tuvo que recuperar acceso, conviene pensar:

- ¿las sesiones activas siguen válidas?
- ¿los refresh tokens previos siguen sirviendo?
- ¿deberían invalidarse?
- ¿el usuario debería reautenticarse?

No siempre hay una única política correcta, pero ignorar esta pregunta suele ser una mala idea.

Porque si el problema era compromiso de cuenta, dejar sesiones antiguas intactas puede mantener acceso indebido aunque la contraseña haya cambiado.

---

## Qué canal usar para recuperación

En la mayoría de los sistemas, el canal típico es email.

Lo importante no es solo “mandar un mail”, sino asumir que ese canal:

- puede retrasarse
- puede ser reenviado
- puede ser interceptado en ciertas circunstancias
- no debería cargar un token eterno o reutilizable

El backend debe tratar ese canal como útil, no mágico.

---

## Qué no deberías meter en el link de recuperación

Conviene evitar poner en el link cosas como:

- demasiada información de usuario
- datos internos de cuenta
- estados sensibles
- claims innecesarios
- estructuras complejas que revelen demasiado

Lo ideal es que el link tenga básicamente el identificador temporal necesario para reanudar el flujo, y no mucho más.

---

## Qué mensajes conviene devolver

En la primera etapa, conviene evitar mensajes que enumeren cuentas.

En la etapa de reset, conviene evitar mensajes que den demasiado detalle estructural del token o del estado interno.

### Ejemplos sanos

- “Si existe una cuenta asociada, te enviamos instrucciones”
- “El enlace es inválido o expiró”
- “No se pudo completar el restablecimiento”

No hace falta volver todo opaco e inútil, pero sí evitar respuestas demasiado informativas para quien está explorando el flujo desde afuera.

---

## Qué registrar en auditoría

Un flujo de recuperación debería dejar señales útiles como:

- solicitud de reset
- token emitido
- token inválido usado
- token expirado
- reset exitoso
- invalidación de sesiones
- anomalías o volumen extraño

Esto ayuda a:

- investigar abuso
- detectar campañas
- asistir soporte
- responder a incidentes
- revisar si una cuenta fue objetivo de recuperación maliciosa

---

## Qué relación tiene esto con brute force y enumeración

Muchísima.

Porque un flujo de recuperación mal diseñado puede servir para:

- enumerar cuentas
- molestar usuarios
- saturar emails
- probar tokens
- tomar control de cuentas si el token es flojo
- abusar del canal de comunicación

Por eso la recuperación de contraseña no debería pensarse aparte de seguridad general de autenticación.

---

## Ejemplo de diseño flojo

```java
@PostMapping("/auth/forgot-password")
public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
    User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
    String token = UUID.randomUUID().toString();
    mailService.sendPasswordResetEmail(user.getEmail(), token);
    return ResponseEntity.ok("Email enviado");
}
```

### Qué hace ruido

- si no existe usuario, cambia comportamiento
- no está claro cómo se persiste y valida el token
- no hay lifecycle del token
- no se ve expiración
- no se ve single-use
- no se ve invalidación posterior
- no se ve trazabilidad

No es suficiente para un flujo tan delicado.

---

## Ejemplo más sano

### Solicitud

```java
public class ForgotPasswordRequest {

    @NotBlank
    @Email
    private String email;
}
```

### Reset

```java
public class ResetPasswordRequest {

    @NotBlank
    private String token;

    @NotBlank
    @Size(min = 8, max = 100)
    private String newPassword;
}
```

### Controller

```java
@PostMapping("/auth/forgot-password")
public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    passwordResetService.startReset(request);
    return ResponseEntity.noContent().build();
}

@PostMapping("/auth/reset-password")
public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    passwordResetService.resetPassword(request);
    return ResponseEntity.noContent().build();
}
```

### Qué mejora esto

- contratos claros
- controller delgado
- flujo explícito
- separación entre inicio y consumo
- espacio claro para expiración, one-time use y auditoría

---

## Señales de diseño sano

Un flujo más sano suele mostrar:

- respuestas prudentes
- tokens aleatorios y temporales
- un solo uso
- expiración clara
- hashing o protección razonable del token almacenado
- services separados para iniciar y consumir el flujo
- invalidación posterior adecuada
- trazabilidad útil
- baja enumeración

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- mensajes distintos según exista o no la cuenta
- tokens predecibles
- tokens largos pero sin lifecycle claro
- reset sin expiración
- token reusable
- password vieja recuperable
- falta de trazabilidad
- sesiones previas intactas sin criterio
- controller haciendo toda la lógica
- dependencia excesiva del canal email como si fuera infalible

---

## Checklist práctico

Cuando revises recuperación de contraseña en una app Spring, preguntate:

- ¿el flujo enumera cuentas?
- ¿cómo se genera el token?
- ¿es suficientemente aleatorio?
- ¿dónde se guarda y cómo se valida?
- ¿cuánto dura?
- ¿es de un solo uso?
- ¿qué pasa si el token ya fue usado o expiró?
- ¿qué pasa con sesiones o refresh tokens previos?
- ¿qué mensajes se devuelven?
- ¿qué trazabilidad deja el flujo?
- ¿el equipo podría explicar claramente todo el lifecycle del token?

---

## Mini ejercicio de reflexión

Tomá tu flujo actual y respondé:

1. ¿Qué pasa si alguien prueba miles de emails?
2. ¿Qué pasa si alguien intercepta un token viejo?
3. ¿Qué pasa si un token se usa dos veces?
4. ¿Qué pasa con las sesiones ya abiertas después del cambio de password?
5. ¿Qué información revela el sistema en cada paso?
6. ¿Qué parte del flujo es la más débil hoy?
7. ¿Qué cambio haría más difícil abusarlo sin romper mucho la UX?

Ese ejercicio suele mostrar rápido si el reset está bien pensado o si solo “manda un mail y listo”.

---

## Resumen

Una recuperación de contraseña segura debería incluir, como mínimo:

- baja enumeración
- tokens temporales
- tokens de un solo uso
- vencimiento claro
- actualización segura del password hash
- invalidación razonable posterior
- trazabilidad útil
- respuestas prudentes

En resumen:

> El reset de contraseña no es un trámite secundario.  
> Es una de las operaciones más sensibles de toda la autenticación, y si está mal diseñada puede abrir una vía de toma de cuenta más sencilla que el propio login.

---

## Próximo tema

**Activación de cuenta y tokens temporales**
