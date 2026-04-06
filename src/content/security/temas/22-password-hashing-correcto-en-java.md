---
title: "Password hashing correcto en Java"
description: "Cómo almacenar contraseñas de forma correcta en una aplicación Java con Spring Boot. Qué significa hashear bien, por qué no alcanza con algoritmos rápidos y cómo usar PasswordEncoder y BCrypt de forma segura y mantenible."
order: 22
module: "Autenticación"
level: "base"
draft: false
---

# Password hashing correcto en Java

## Objetivo del tema

Entender cómo almacenar contraseñas de forma correcta en una aplicación Java + Spring Boot, para que el backend no convierta una filtración de base de datos en una catástrofe inmediata.

Este tema es importante porque muchas fallas graves de seguridad no aparecen cuando alguien “rompe el login”, sino cuando el sistema ya guardó mal las contraseñas desde el principio.

La idea central es esta:

> una contraseña no debe guardarse para poder leerse después.  
> Debe guardarse de forma que el sistema pueda verificarla sin recuperar nunca el valor original.

---

## Idea clave

Guardar contraseñas “seguro” no significa:

- cifrarlas reversible
- esconderlas un poco
- hashearlas con cualquier algoritmo
- aplicar SHA-256 y listo
- confiar en que la base “no se va a filtrar”

Guardar contraseñas correctamente significa:

- usar un algoritmo lento y pensado para passwords
- incluir sal automáticamente
- dificultar ataques de fuerza bruta offline
- comparar de forma segura al autenticar
- permitir evolución futura del costo o del algoritmo

En resumen:

> El hashing de contraseñas no busca ocultar elegantemente la password.  
> Busca volver carísimo recuperar o probar contraseñas si la base cae en manos equivocadas.

---

## Qué es hashing de contraseñas

Hashing es transformar un dato en una salida aparentemente irrevertible.

Pero en passwords no sirve cualquier hash.

### Importante

Los algoritmos rápidos pensados para integridad general, como:

- SHA-256
- SHA-512
- MD5
- SHA-1

no son una buena elección para almacenar contraseñas.

¿Por qué?

Porque son demasiado rápidos.

Y justamente en passwords queremos lo contrario:

- que verificar una contraseña válida sea razonable para tu app
- pero que probar millones de combinaciones sea caro para un atacante

---

## Error mental clásico

Mucha gente piensa algo como:

- “si está hasheada, ya está bien”
- “si no se guarda en texto plano, ya alcanza”
- “si usamos SHA-256 es seguro porque es fuerte”
- “si además le agregamos una sal a mano, listo”

No.

En contraseñas importa mucho **el tipo de algoritmo**.

Un algoritmo criptográficamente fuerte no necesariamente es un buen algoritmo para passwords.

Porque si es demasiado rápido, ayuda muchísimo a un atacante que ya robó la base.

---

## Qué propiedades buscamos en un buen password hashing

Cuando almacenás contraseñas, querés que el algoritmo tenga varias propiedades:

## 1. Que sea lento a propósito
Para que adivinar o probar contraseñas masivamente salga caro.

## 2. Que use sal
Para que dos usuarios con la misma password no tengan el mismo hash y para romper tablas precomputadas.

## 3. Que sea fácil de verificar
Para tu backend, en login.

## 4. Que sea difícil de revertir
No debe permitir “desencriptar” la password original.

## 5. Que pueda aumentar su costo
Para adaptarse a hardware más potente con el tiempo.

---

## Algoritmos adecuados para passwords

En Java y Spring, los nombres que más conviene tener claros son:

- **BCrypt**
- **Argon2**
- **PBKDF2**

En la práctica, para muchísimas apps Spring Boot, **BCrypt** sigue siendo una elección muy razonable y simple de operar bien.

### Importante

No hace falta “inventar” tu sistema de hashing.
Conviene apoyarse en implementaciones serias y mantenidas.

---

## Qué pasa si guardás la password en texto plano

Esto es directamente grave.

### Ejemplo pésimo

```java
user.setPassword(request.getPassword());
```

Si después eso termina persistido así, cualquier filtración de base expone:

- todas las contraseñas tal cual
- posibilidad de reutilización en otros sitios
- daño inmediato para usuarios
- responsabilidad enorme para el sistema

Nunca debería ocurrir.

---

## Qué pasa si “cifrás” la password reversible

También suele ser una mala idea para almacenamiento de passwords.

¿Por qué?

Porque si el sistema puede recuperar la contraseña original, entonces:

- existe una clave que, si se compromete, expone todo
- el backend tiene más poder del necesario
- se pierde la ventaja conceptual del hash irreversible

Para passwords, normalmente no necesitás recuperar la original.
Solo necesitás verificar si la enviada coincide con la que el usuario eligió.

---

## Qué pasa si usás SHA-256 directo

Ejemplo peligroso:

```java
String hash = DigestUtils.sha256Hex(password);
```

A primera vista parece mejor que guardar en claro.
Y sí, es mejor que texto plano.

Pero sigue siendo un diseño flojo para passwords porque:

- es muy rápido
- facilita ataques offline
- obliga a resolver mal o manualmente otras cosas
- queda lejos de las buenas prácticas actuales para credenciales de usuario

La rapidez, que en otros contextos puede ser una virtud, acá es un problema.

---

## Cómo se ve bien en Spring Boot

La forma más habitual y sana de hacerlo en Spring es usar un `PasswordEncoder`.

### Ejemplo básico

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

Y después en registro:

```java
public UserResponse register(RegisterRequest request) {
    User user = new User();
    user.setEmail(request.getEmail().trim().toLowerCase());
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

    userRepository.save(user);

    return userMapper.toResponse(user);
}
```

Y en login, a través de Spring Security, el encoder participa en la comparación segura.

---

## Por qué `PasswordEncoder` es una buena idea

Porque evita que el equipo:

- compare strings a mano
- invente hashing casero
- mezcle lógica de auth con detalles criptográficos
- dependa de una implementación improvisada
- rompa compatibilidad futura al cambiar algoritmo

También hace más claro el contrato:

- `encode(...)` para guardar
- `matches(...)` para verificar

---

## Ejemplo conceptual de verificación

```java
boolean valid = passwordEncoder.matches(rawPassword, storedHash);
```

### Qué hace esto

- toma la password ingresada en texto plano
- la verifica contra el hash guardado
- no necesita recuperar la original
- no compara texto plano con texto plano
- no requiere que el backend conozca la contraseña real del usuario

---

## Qué hace bien BCrypt

BCrypt tiene varias ventajas prácticas para este caso:

- es lento a propósito
- incluye sal
- está muy integrado en Spring
- es conocido y auditado
- su costo puede ajustarse

### Importante

Cuando usás BCrypt bien, no hace falta que inventes tu manejo manual de sal para el caso típico.

El algoritmo ya contempla esa necesidad.

---

## El factor de costo

BCrypt permite definir un costo de trabajo.

A mayor costo:

- más lento el hashing
- más caro un ataque masivo
- más caro también el login legítimo

Por eso hay que elegir un valor razonable para tu contexto.

### Ejemplo

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
}
```

No hay un único número mágico eterno.
Importa:

- tu infraestructura
- volumen de logins
- tolerancia de latencia
- evolución del hardware

La idea es que sea suficientemente costoso sin romper la experiencia normal del sistema.

---

## Error común: hashear dos veces sin saber por qué

A veces aparecen diseños raros como:

- hashear en frontend
- volver a hashear en backend
- mezclar hashing de transporte con hashing de almacenamiento
- encadenar algoritmos porque “suena más seguro”

Eso suele complicar más de lo que ayuda.

Para almacenamiento de passwords, lo importante es:

- que el backend reciba la credencial de forma segura en tránsito
- que la almacene con un algoritmo adecuado de password hashing

No hace falta inventar una coreografía extraña si no tenés un motivo muy claro y sólido.

---

## Error común: querer “desencriptar” la password

Esto delata un mal modelo mental.

Preguntas como:

- “¿cómo recupero la password del usuario?”
- “¿dónde guardo la clave para desencriptarla?”
- “¿cómo veo la password original?”

señalan un problema conceptual.

La password no debería recuperarse.

Si el usuario la olvidó, el flujo correcto no es:

- desencriptarla y mostrarla

Sino:

- resetearla con un mecanismo seguro

---

## Qué deberías guardar realmente

En una app Spring típica, deberías guardar algo como:

- email normalizado
- password hash
- estado de cuenta
- timestamps de seguridad que hagan falta
- flags operativos razonables

Pero no:

- la password original
- una versión reversible
- pistas peligrosas de la password
- respuestas secretas débiles o datos equivalentes que reduzcan demasiado el esfuerzo de ataque

---

## Qué relación tiene esto con filtraciones de base

Este es el punto más importante del tema.

Supongamos que alguien obtiene un dump de tu base.

### Si guardaste passwords en claro
el daño es inmediato.

### Si guardaste con algoritmo rápido
el daño sigue pudiendo crecer rápido en ataques offline.

### Si guardaste con password hashing correcto
seguís teniendo un incidente grave, pero le hacés muchísimo más costoso al atacante convertir ese dump en credenciales reales reutilizables.

No elimina el problema.
Lo amortigua muchísimo.

---

## Caso práctico: registro sano

### DTO

```java
public class RegisterRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;
}
```

### Service

```java
public UserResponse register(RegisterRequest request) {
    String normalizedEmail = request.getEmail().trim().toLowerCase();

    if (userRepository.existsByEmail(normalizedEmail)) {
        throw new IllegalStateException("El email ya está registrado");
    }

    User user = new User();
    user.setEmail(normalizedEmail);
    user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
    user.setEnabled(true);
    user.setRole("USER");

    userRepository.save(user);

    return userMapper.toResponse(user);
}
```

### Qué está bien acá

- email normalizado
- unicidad controlada
- password hasheada con encoder
- rol y estado decididos por backend
- nada de password en claro persistida

---

## Caso práctico: comparación sana en login

Si usás Spring Security con `AuthenticationManager` y `UserDetailsService`, gran parte de la verificación puede integrarse naturalmente.

Pero conceptualmente, el recorrido es:

- el usuario manda password
- el backend busca al usuario
- toma el hash guardado
- compara con `PasswordEncoder`
- si coincide, autentica

No:

- desencripta nada
- compara contraseñas almacenadas en claro
- usa hash rápido “porque es más fácil”

---

## Qué pasa con usuarios viejos o migraciones

En sistemas reales a veces pasa que hay hashes viejos o una migración pendiente.

Acá lo importante es:

- no seguir emitiendo nuevos hashes con estrategia débil
- diseñar una transición razonable
- rehashear cuando el usuario vuelve a autenticarse, si el diseño lo justifica
- no mezclar estados inseguros indefinidamente “porque ya funciona”

La arquitectura debería permitir evolucionar.

---

## Qué lugar ocupa Argon2

Argon2 también es una opción moderna muy buena para password hashing.

En algunos equipos puede ser preferible.

Pero para este curso, si el objetivo es construir criterio sólido y práctico con Java + Spring, **BCrypt** sigue siendo un punto de partida excelente porque:

- está ampliamente soportado
- está muy integrado
- es fácil de usar bien
- evita que la app termine usando algo claramente peor por exceso de ambición mal resuelta

Más adelante se puede ampliar el análisis.

---

## Errores frecuentes que deberías poder detectar rápido

Estas cosas deberían prender alarma inmediata:

- campo `password` persistido tal cual
- uso de SHA-256 o MD5 para passwords
- comparación de strings a mano
- falta de `PasswordEncoder`
- querer recuperar la password original
- encoder mezclado raro con lógica casera
- contraseñas hasheadas en frontend como sustituto de hashing correcto en backend
- reutilizar la misma lógica para secrets que para passwords sin distinguir contexto

---

## Qué gana la app si resuelve bien esto

Cuando el backend maneja bien el hashing de passwords, gana:

- menor daño ante filtración de base
- arquitectura de auth más clara
- menos improvisación criptográfica
- mejor integración con Spring Security
- menos riesgo de errores graves y silenciosos
- más posibilidad de evolucionar costo o estrategia en el tiempo

No es solo “cumplir una práctica”.
Es una de las decisiones más importantes de todo el módulo de autenticación.

---

## Checklist práctico

Cuando revises una app Spring, preguntate:

- ¿las passwords se guardan en texto plano?
- ¿se usa `PasswordEncoder`?
- ¿qué algoritmo se está usando?
- ¿es un algoritmo pensado para passwords o uno rápido genérico?
- ¿la comparación se hace con `matches(...)`?
- ¿hay evidencia de hashing casero o improvisado?
- ¿se está intentando recuperar la password original?
- ¿el backend rehashea correctamente al registrar usuarios?
- ¿el diseño permitiría aumentar el costo más adelante?
- ¿qué pasaría si mañana se filtrara la tabla de usuarios?

---

## Mini ejercicio de reflexión

Tomá el flujo de registro/login de tu backend y respondé:

1. ¿Dónde se hashea la password?
2. ¿Con qué algoritmo?
3. ¿Quién compara la password en login?
4. ¿El sistema podría recuperar la contraseña original?
5. ¿Qué daño habría si mañana se filtrara la tabla de usuarios?
6. ¿Tu diseño está pensado como “esconder contraseñas” o como “hacer carísimo recuperarlas”?

La última pregunta suele ordenar muy bien el modelo mental.

---

## Resumen

Guardar contraseñas correctamente en Java + Spring implica:

- no guardar texto plano
- no usar hashing rápido genérico
- usar `PasswordEncoder`
- elegir un algoritmo apto para passwords, como BCrypt
- comparar con `matches(...)`
- diseñar el flujo sabiendo que la password original no debe recuperarse

En resumen:

> El objetivo del password hashing no es decorar la contraseña antes de guardarla.  
> Es hacer que una filtración de base sea muchísimo menos útil para quien intente convertirla en acceso real.

---

## Próximo tema

**Flujo de login seguro**
