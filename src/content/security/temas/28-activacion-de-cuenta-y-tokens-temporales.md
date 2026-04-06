---
title: "Activación de cuenta y tokens temporales"
description: "Cómo diseñar un flujo seguro de activación de cuenta en una aplicación Java con Spring Boot y Spring Security. Qué papel cumplen los tokens temporales, qué riesgos aparecen si se usan mal y cómo evitar enumeración, reutilización y activaciones inconsistentes."
order: 28
module: "Autenticación"
level: "base"
draft: false
---

# Activación de cuenta y tokens temporales

## Objetivo del tema

Entender cómo diseñar un flujo seguro de **activación de cuenta** en una aplicación Java + Spring Boot + Spring Security, usando tokens temporales sin convertir el onboarding en una superficie fácil de abusar.

Este tema es importante porque muchas aplicaciones necesitan resolver una situación bastante común:

- el usuario se registra
- pero la cuenta todavía no debería operar como una cuenta plenamente habilitada
- hasta que complete alguna verificación adicional, normalmente a través de un email

La activación parece un paso simple, pero si está mal diseñada puede introducir problemas como:

- enumeración de cuentas
- activaciones reutilizables
- tokens demasiado duraderos
- estados inconsistentes
- bypass del flujo de verificación
- exposición innecesaria de información interna

En resumen:

> activar una cuenta no debería ser un trámite cosmético.  
> Debería ser una transición controlada entre “cuenta creada” y “cuenta habilitada”, con tokens temporales bien pensados y con poco margen para abuso.

---

## Idea clave

La activación de cuenta no existe para “decorar” el registro.

Existe para que el sistema pueda exigir una prueba adicional de control sobre un canal o un contexto antes de habilitar realmente a la cuenta para operar.

En resumen:

> un token de activación no debería ser un acceso alternativo a la cuenta.  
> Debería ser una prueba temporal, acotada y de un solo uso para completar una transición de estado específica.

---

## Qué intenta resolver la activación de cuenta

La activación busca responder algo como:

- “¿esta cuenta recién creada realmente completó el paso adicional que el sistema exige antes de quedar habilitada?”

Según el sistema, eso puede significar cosas como:

- confirmar control del email
- evitar registros basura
- reducir creación masiva de cuentas activas
- separar alta inicial de habilitación real
- no permitir login completo hasta validar cierto paso

No todos los sistemas necesitan activación.
Pero si la necesitás, conviene tomársela en serio.

---

## Qué pasos suele tener un flujo sano

Un flujo sano de activación de cuenta suele verse más o menos así:

### 1. Registro inicial
Se crea la cuenta en estado no plenamente habilitado.

### 2. Generación de token temporal
Se genera un token aleatorio asociado a esa cuenta y a esa acción.

### 3. Envío del token o link
Normalmente por email.

### 4. Consumo del token
El usuario vuelve con el token o accede al link.

### 5. Validación del token
El backend verifica:
- existencia
- expiración
- uso previo
- asociación correcta a la cuenta

### 6. Cambio de estado
La cuenta pasa a estado activado o habilitado.

### 7. Invalidación del token y trazabilidad
El token ya no debe volver a servir.

---

## Qué estado conviene tener antes de activar

En una app real, suele ser importante distinguir entre cosas como:

- cuenta creada
- cuenta habilitada
- cuenta bloqueada
- cuenta suspendida
- cuenta pendiente de verificación

No hace falta que todos los sistemas tengan exactamente los mismos flags.
Pero sí conviene que el estado refleje una idea clara.

### Ejemplo conceptual

```java
@Entity
public class User {

    @Id
    @GeneratedValue
    private Long id;

    private String email;
    private String passwordHash;
    private boolean enabled;
    private boolean blocked;
    private boolean emailVerified;
}
```

Acá, por ejemplo:

- `enabled` podría representar habilitación operativa
- `emailVerified` podría representar que el canal ya fue validado

La decisión exacta depende del sistema, pero debería ser explícita y consistente.

---

## Error mental clásico

Mucha gente piensa algo así:

- “creamos la cuenta y después ya veremos si confirma el mail”
- “si no activa, total igual puede entrar”
- “el token puede durar mucho porque no pasa nada”
- “si reusa el link, total ya está activada”
- “si el email no existe, devolvemos un error más claro”
- “si el frontend muestra que la cuenta existe, no pasa nada”

Ese tipo de decisiones suele dejar el flujo demasiado débil o demasiado incoherente.

---

## Qué nunca debería hacer este flujo

Hay varias cosas que deberían prender alarma.

## 1. Activar una cuenta sin token realmente fuerte
Muy riesgoso.

## 2. Permitir reutilizar el mismo token
Mala práctica.

## 3. Dejar el token válido durante demasiado tiempo
Aumenta superficie.

## 4. No distinguir bien el estado de cuenta antes y después
Genera incoherencias.

## 5. Exponer demasiado sobre si la cuenta existe o ya fue activada
Facilita enumeración o exploración.

## 6. Usar el token como si fuera una especie de login alternativo permanente
Error conceptual importante.

---

## Registro inicial: qué conviene hacer

Cuando se registra una cuenta que necesita activación, suele tener sentido hacer algo así:

- persistir cuenta en estado no plenamente habilitado
- generar token de activación temporal
- almacenar lifecycle del token
- enviar mail con link o código
- responder al cliente sin revelar más de la cuenta de lo necesario

### Ejemplo conceptual

```java
public void register(RegisterRequest request) {
    String normalizedEmail = request.getEmail().trim().toLowerCase();

    if (userRepository.existsByEmail(normalizedEmail)) {
        throw new IllegalStateException("No se pudo completar el registro");
    }

    User user = new User();
    user.setEmail(normalizedEmail);
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setEnabled(false);
    user.setEmailVerified(false);

    userRepository.save(user);

    String rawToken = activationTokenService.generateSecureToken();
    accountActivationTokenService.createToken(user, rawToken);

    mailService.sendActivationEmail(user.getEmail(), rawToken);
}
```

### Qué ideas muestra esto

- cuenta creada pero no habilitada plenamente
- token separado
- mail disparado luego
- transición pendiente clara

---

## Qué características debería tener un token de activación

Un token de activación debería ser:

- aleatorio
- impredecible
- suficientemente largo
- temporal
- de un solo uso
- asociado a una cuenta concreta
- invalidable
- trazable

No debería ser:

- predecible
- reutilizable
- eterno
- derivable del email o del id sin entropía fuerte
- una credencial general de acceso

---

## Mala idea: token estructuralmente débil

### Ejemplo flojo

```java
String token = Base64.getEncoder().encodeToString((user.getEmail() + ":" + user.getId()).getBytes());
```

Esto suele ser mala idea porque:

- revela estructura
- es predecible o semipredecible
- mezcla datos identificables
- no está pensado como token seguro
- no resuelve expiración ni lifecycle real

### Mejor enfoque

Generar un valor aleatorio fuerte y tratarlo como token temporal de negocio, no como simple string decorativo.

---

## Dónde guardar el token

Como en reset password, suele ser mejor tener un lifecycle claro del token.

Una estrategia razonable puede ser:

- generar valor aleatorio
- enviar valor crudo al usuario
- guardar en backend una representación protegida o hash del token
- asociarlo a la cuenta
- registrar creación, expiración y uso

### Ejemplo conceptual

```java
@Entity
public class AccountActivationToken {

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

Esto hace mucho más claro:

- cuándo nació
- cuánto dura
- si ya se consumió
- a quién pertenece

---

## Activación por link o por código

Ambos modelos pueden existir.

## Link
Suele ser más cómodo en UX.

## Código
Puede ser útil si querés separar mejor navegación y consumo del token.

Lo importante no es solo el formato.
Lo importante es que el backend trate el token como:

- temporal
- de un solo uso
- acotado a esa transición de estado

---

## Consumo del token

Cuando el usuario vuelve con el token, el backend debería verificar:

- que exista una representación válida
- que no esté expirado
- que no haya sido usado
- que corresponda a una cuenta real
- que la cuenta siga en estado coherente para activarse

### Ejemplo conceptual

```java
public void activateAccount(String rawToken) {
    AccountActivationToken token = accountActivationTokenService.consumeValidToken(rawToken);

    User user = userRepository.findById(token.getUserId()).orElseThrow();

    if (user.isEmailVerified()) {
        throw new IllegalStateException("La cuenta ya fue activada");
    }

    user.setEmailVerified(true);
    user.setEnabled(true);

    userRepository.save(user);

    accountActivationTokenService.markAsUsed(token);
}
```

### Qué ideas importa rescatar

- validación del token
- verificación de coherencia del estado
- transición explícita
- invalidación posterior

---

## Un solo uso

Esto es clave.

Un token de activación no debería servir varias veces.

Incluso si la cuenta ya está activada, seguir aceptando el mismo token suele ser una mala señal porque:

- mantiene superficie abierta sin necesidad
- hace más confuso el lifecycle
- dificulta razonar el flujo
- da falsa sensación de “da lo mismo reutilizarlo”

Más sano:

- una vez usado, deja de servir
- si la cuenta ya está activada, la respuesta hacia afuera puede seguir siendo prudente, pero el backend no debería considerar ese token como todavía válido

---

## Expiración del token

Los tokens de activación tampoco deberían vivir demasiado.

### Por qué importa

Cuanto más tiempo dura el token:

- más superficie queda abierta
- más tiempo hay para que se filtre o reutilice
- más difícil es razonar estados “pendientes” eternos

No hay un número universal mágico, pero sí una idea general sana:

- duración razonable
- suficiente para UX normal
- no excesiva

Además, si expiró, el sistema debería tener una política clara:

- permitir regeneración
- volver a enviar uno nuevo si corresponde
- no reciclar silenciosamente el viejo

---

## Qué pasa con reenvío de activación

Muchos sistemas necesitan reenvío de mail de activación.

Eso está bien, pero conviene decidir con claridad:

- si invalidás tokens anteriores al emitir uno nuevo
- cuánto reenvío permitís
- cómo evitás abuso del canal
- qué respuestas devolvés
- cómo trazás esos eventos

No hace falta prohibir el reenvío.
Hace falta que tenga política.

---

## Qué no debería pasar antes de activar

Esto depende del negocio, pero conviene definirlo de forma clara.

Por ejemplo:

- ¿la cuenta puede loguear antes de activar?
- ¿puede navegar parcialmente?
- ¿puede usar algunos recursos pero no otros?
- ¿debe quedar completamente bloqueada?

Lo importante no es elegir una única respuesta universal.
Lo importante es que el comportamiento sea coherente.

### Mala señal

- una cuenta “pendiente” que igual puede autenticarse casi como si estuviera activa
- o una cuenta con flags ambiguos que nadie entiende bien

---

## Qué mensajes conviene devolver

Como en otros flujos sensibles, conviene ser prudente.

### Ejemplos útiles

- “No se pudo completar la activación”
- “El enlace es inválido o expiró”
- “Si la cuenta requiere activación, te enviaremos instrucciones”

No hace falta volverlo incomprensible para usuarios legítimos, pero sí evitar respuestas que regalen demasiado contexto sobre:

- existencia de cuenta
- estado interno preciso
- validez detallada del token
- diferencias muy explotables entre escenarios

---

## Qué relación tiene esto con enumeración

Bastante.

Si el flujo de registro, reenvío o activación responde de forma demasiado informativa, puede ayudar a:

- confirmar si el email ya existe
- confirmar si ya está activado
- distinguir cuentas pendientes
- afinar abusos posteriores

Por eso la activación no debería pensarse como un mero detalle de onboarding.
También es una superficie de seguridad.

---

## Qué registrar en auditoría

Conviene registrar cosas como:

- cuenta creada
- token de activación emitido
- reenvío de activación
- token inválido usado
- token expirado
- activación exitosa
- intentos anómalos

Esto ayuda a:

- soporte
- investigación
- detección de abuso
- revisión de onboarding
- respuesta ante campañas o patrones raros

---

## Qué pasa con cuentas ya activadas

Acá conviene tener una política clara.

Por ejemplo:

- si ya está activada, no debería “reactivarse” nada
- el token viejo no debería seguir siendo válido
- la respuesta hacia afuera puede ser prudente y estable
- pero el backend debe mantener coherencia interna

La activación debería ser una transición real de estado, no una operación difusa que da igual repetir.

---

## Ejemplo de diseño flojo

```java
@GetMapping("/auth/activate")
public ResponseEntity<String> activate(@RequestParam String token) {
    User user = userRepository.findByActivationToken(token).orElseThrow();
    user.setEnabled(true);
    userRepository.save(user);
    return ResponseEntity.ok("Cuenta activada");
}
```

### Qué hace ruido

- token en claro y lookup directo simplista
- no se ve expiración
- no se ve single-use
- no se ve lifecycle
- no se ve trazabilidad
- no se ve distinción entre enabled y otros estados
- no se ve invalidación posterior

No alcanza para un flujo importante.

---

## Ejemplo más sano

### Token entity conceptual

```java
@Entity
public class AccountActivationToken {

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

### Controller

```java
@PostMapping("/auth/activate")
public ResponseEntity<Void> activate(@Valid @RequestBody ActivateAccountRequest request) {
    accountActivationService.activate(request);
    return ResponseEntity.noContent().build();
}
```

### DTO

```java
public class ActivateAccountRequest {

    @NotBlank
    private String token;
}
```

### Service conceptual

```java
public void activate(ActivateAccountRequest request) {
    AccountActivationToken token = accountActivationTokenService.consumeValidToken(request.getToken());

    User user = userRepository.findById(token.getUserId()).orElseThrow();

    user.setEmailVerified(true);
    user.setEnabled(true);
    userRepository.save(user);

    accountActivationTokenService.markAsUsed(token);
}
```

### Qué mejora esto

- token tratado como recurso temporal
- lifecycle claro
- invalidación explícita
- transición de estado clara
- controller delgado
- espacio natural para trazabilidad

---

## Señales de diseño sano

Un flujo más sano suele mostrar:

- cuenta pendiente claramente modelada
- token fuerte y temporal
- un solo uso
- expiración razonable
- reenvío controlado
- transición de estado explícita
- trazabilidad útil
- respuestas prudentes
- poca mezcla entre activación y login normal

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- token estructuralmente predecible
- token sin expiración
- reutilización aceptada
- activación ambigua o repetible sin criterio
- cuentas “pendientes” que igual operan casi completas
- reenvíos sin política
- mensajes demasiado informativos
- controller con toda la lógica
- inexistencia de lifecycle del token

---

## Checklist práctico

Cuando revises activación de cuenta en una app Spring, preguntate:

- ¿la cuenta tiene un estado claro antes de activarse?
- ¿cómo se genera el token?
- ¿es aleatorio y suficientemente fuerte?
- ¿dónde se guarda y cómo se valida?
- ¿cuánto dura?
- ¿es de un solo uso?
- ¿qué pasa si el token expiró?
- ¿qué pasa si ya fue usado?
- ¿qué pasa con cuentas ya activadas?
- ¿cómo funciona el reenvío?
- ¿qué trazabilidad deja el flujo?
- ¿qué puede inferir un atacante desde las respuestas?

---

## Mini ejercicio de reflexión

Tomá tu flujo actual de activación y respondé:

1. ¿Qué estado tiene la cuenta antes de activarse?
2. ¿Qué puede hacer esa cuenta mientras espera activación?
3. ¿Cómo se genera el token?
4. ¿Qué pasa si el token se reutiliza?
5. ¿Qué pasa si expira?
6. ¿Cómo se reenvía?
7. ¿Qué revela el sistema hacia afuera?
8. ¿Qué parte del flujo te parece más frágil o más improvisada?

Ese ejercicio ayuda mucho a detectar si la activación está pensada como una transición de seguridad o solo como un paso decorativo del onboarding.

---

## Resumen

La activación de cuenta debería diseñarse como una transición controlada entre:

- cuenta creada
- cuenta realmente habilitada

Y eso exige, como mínimo:

- token temporal
- token fuerte
- un solo uso
- expiración clara
- estado de cuenta coherente
- reenvío controlado
- trazabilidad
- respuestas prudentes

En resumen:

> Un buen flujo de activación no solo manda un link por email.  
> También define claramente cuándo una cuenta pasa a ser realmente usable y cómo evitar que ese paso se convierta en una superficie barata de abuso.

---

## Próximo tema

**Enumeración de usuarios y mensajes de error**
