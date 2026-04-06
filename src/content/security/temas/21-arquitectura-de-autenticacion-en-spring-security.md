---
title: "Arquitectura de autenticación en Spring Security"
description: "Cómo pensar la arquitectura de autenticación en una aplicación Java con Spring Boot y Spring Security. Qué piezas intervienen, cómo se relacionan entre sí y qué decisiones conviene tomar para que el login, la identidad y el contexto de seguridad queden claros y robustos."
order: 21
module: "Autenticación"
level: "base"
draft: false
---

# Arquitectura de autenticación en Spring Security

## Objetivo del tema

Entender cómo se organiza la autenticación en una aplicación hecha con Java + Spring Boot + Spring Security, para que no quede reducida a una colección de clases “mágicas” que funcionan, pero que el equipo no termina de comprender del todo.

La idea de este tema es responder preguntas como:

- ¿qué piezas participan realmente en autenticación?
- ¿dónde se valida la identidad?
- ¿qué rol cumple cada componente?
- ¿cómo entra una credencial y cómo termina existiendo un actor autenticado en el backend?
- ¿qué decisiones de diseño conviene tomar desde el principio?

Porque una autenticación que “anda” pero no se entiende bien suele terminar siendo:

- difícil de mantener
- difícil de auditar
- fácil de romper con cambios
- incómoda de extender
- demasiado confiada en partes que nadie revisó con criterio

---

## Idea clave

La autenticación en Spring Security no debería pensarse como:

- “un login controller”
- “un filtro JWT”
- “un par de anotaciones”
- “algo que ya resolvió el framework”

Conviene pensarla como una arquitectura con piezas bien separadas.

En resumen:

> La autenticación no es un endpoint aislado.  
> Es el recorrido completo por el cual una credencial entra al sistema, se valida, se traduce en una identidad confiable y queda disponible para el resto del backend.

---

## Qué intenta resolver la autenticación

La autenticación intenta responder una pregunta central:

- **¿quién es este actor?**

No responde todavía:

- qué puede hacer
- qué recursos puede tocar
- qué acciones están permitidas

Eso pertenece a autorización.

La autenticación se enfoca en establecer una identidad suficientemente confiable como para que después el sistema pueda tomar decisiones sobre ella.

---

## Qué piezas suelen aparecer en una arquitectura de autenticación con Spring Security

En una app Spring moderna, estas piezas suelen ser las más importantes:

- endpoints de auth
- DTOs de login o refresh
- service de autenticación
- `AuthenticationManager`
- `UserDetailsService`
- `PasswordEncoder`
- clases de usuario o principal autenticado
- filtros de seguridad
- `SecurityFilterChain`
- tokens, sesiones o cookies
- `SecurityContextHolder`
- manejo de errores de autenticación
- storage o validación de refresh tokens, si existen

No siempre están todas ni exactamente iguales, pero ese es el mapa general.

---

## Vista general del recorrido

Una forma sana de pensar el flujo es esta:

### 1. El cliente envía credenciales
Por ejemplo:
- email y contraseña
- token
- cookie de sesión
- refresh token

### 2. El backend recibe esa intención
Normalmente por:
- login endpoint
- filtro JWT
- cookie de sesión
- mecanismo federado

### 3. El backend valida la identidad
Usando:
- búsqueda de usuario
- comparación de contraseña
- validación de firma
- chequeo de expiración
- estado de la cuenta

### 4. Si la autenticación es válida
El sistema construye un objeto de autenticación confiable.

### 5. Esa identidad queda disponible para el resto del request
A través de:
- `SecurityContext`
- `Authentication`
- principal autenticado

### 6. Recién después entra la autorización
Para decidir qué puede hacer ese actor.

---

## Error mental clásico

Muchos equipos piensan la autenticación así:

- “si el login devuelve token, ya está”
- “si el filtro JWT mete algo en el contexto, listo”
- “si existe `SecurityConfig`, la autenticación ya está resuelta”
- “si Spring Security no tiró error, el actor ya es confiable”

Ese pensamiento suele esconder problemas como:

- credenciales mal modeladas
- acoplamiento raro entre controller y seguridad
- tokens demasiado poderosos
- confusión entre identidad y permisos
- cuentas deshabilitadas que igual siguen entrando
- refresh tokens mal resueltos
- filtros con demasiada lógica
- contexto de seguridad poco claro

---

## La arquitectura debería dejar claras estas responsabilidades

Una arquitectura de autenticación sana suele separar más o menos esto:

## Controller de auth
Recibe requests de login, refresh, logout o activación.

## Service de auth
Orquesta la lógica de autenticación del caso de uso.

## `UserDetailsService`
Carga al usuario o principal desde la fuente de datos.

## `PasswordEncoder`
Compara contraseñas de forma segura.

## `AuthenticationManager`
Ejecuta autenticación basada en credenciales.

## Filtro
Extrae token o credencial del request y, si corresponde, construye el contexto autenticado.

## `SecurityFilterChain`
Define cómo entra la seguridad al request pipeline.

## `SecurityContext`
Transporta la identidad autenticada a lo largo del request actual.

Cuando todo esto se mezcla en cualquier lado, el backend se vuelve mucho más difícil de leer y defender.

---

## Caso típico 1: autenticación basada en login con email y contraseña

Este es el caso más clásico.

### Paso 1: request de login

```java
public class LoginRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;
}
```

### Paso 2: controller

```java
@PostMapping("/auth/login")
public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
}
```

### Paso 3: service

El service no debería comparar contraseñas “a mano” por costumbre rara, ni resolver todo en controller.

Una forma común es usar `AuthenticationManager`.

```java
public AuthResponse login(LoginRequest request) {
    Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
            )
    );

    SecurityUser principal = (SecurityUser) authentication.getPrincipal();

    return tokenService.issueTokens(principal);
}
```

Esto mantiene más clara la responsabilidad de autenticación.

---

## Qué rol cumple `AuthenticationManager`

`AuthenticationManager` suele ser la pieza que ejecuta la autenticación basada en credenciales.

Su trabajo conceptual es algo así:

- recibir una credencial
- delegar en el proveedor adecuado
- comparar contra la fuente real de identidad
- devolver un `Authentication` válido o fallar

No es magia.
Es una pieza de orquestación.

Pensarlo así ayuda mucho más que tratarlo como una caja negra.

---

## Qué rol cumple `UserDetailsService`

`UserDetailsService` suele encargarse de cargar al usuario desde la fuente de datos que corresponda.

Por ejemplo:

```java
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        return new SecurityUser(user);
    }
}
```

### Idea importante

`UserDetailsService` no debería convertirse en una bolsa de negocio arbitrario.

Su foco principal debería ser:

- localizar la identidad
- traducirla a un principal que Spring Security pueda usar

---

## Qué rol cumple `PasswordEncoder`

Una contraseña no debería compararse con igualdad simple.

`PasswordEncoder` resuelve la comparación segura entre:

- contraseña en texto plano recibida
- hash persistido

Por ejemplo:

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

Y el flujo correcto es algo como:

- el sistema guarda hashes
- el login compara usando encoder
- nunca se guarda la contraseña real

### Error clásico

- guardar contraseña sin hash
- comparar strings “a mano”
- hashear con algoritmos inseguros
- mezclar mal hashing con lógica de login

---

## Caso típico 2: autenticación basada en JWT

Cuando la app usa JWT, la arquitectura cambia un poco.

Ya no siempre hay login por cada request.
Lo común es:

### En login
- se autentica una vez con email y contraseña
- se emite un token firmado

### En requests siguientes
- un filtro extrae el token
- valida firma y expiración
- carga o reconstruye la identidad
- coloca el `Authentication` en el `SecurityContext`

### Ejemplo conceptual de filtro

```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = resolveToken(request);

        if (token != null && jwtService.isValid(token)) {
            String email = jwtService.extractSubject(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            Authentication authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
```

### Lo importante conceptualmente

El filtro no “hace magia”.
Hace algo muy concreto:

- toma credencial
- la valida
- reconstruye identidad
- la pone en el contexto de seguridad

---

## Dónde suele equivocarse la arquitectura JWT

Muchos errores aparecen cuando el filtro JWT empieza a cargar demasiada responsabilidad.

Por ejemplo:

- demasiada lógica de negocio en el filtro
- validaciones raras de permisos ahí mismo
- tokens con demasiada información
- falta de claridad entre identidad y autorización
- tokens que siguen válidos aunque la cuenta ya no debería operar
- contexto autenticado construido de forma demasiado ingenua

Una arquitectura más sana mantiene al filtro enfocado en:

- extraer
- validar
- construir identidad

Y deja otras decisiones a capas más adecuadas.

---

## Qué rol cumple `SecurityContext`

Una vez autenticado el actor, el backend necesita una forma consistente de transportar esa identidad durante el request.

Ahí entra el `SecurityContext`.

### Ejemplo

```java
Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
```

Desde ahí otras partes del sistema pueden preguntar:

- quién es el actor
- qué authorities tiene
- si está autenticado
- qué principal está asociado al request

### Idea importante

El `SecurityContext` no autentica por sí mismo.

Solo contiene el resultado de una autenticación ya resuelta o cargada.

---

## Qué conviene definir temprano en la arquitectura

Cuando diseñás autenticación en Spring, conviene decidir lo antes posible cosas como:

- si usarás sesión o JWT
- cómo vas a representar al principal autenticado
- qué identificador usarás como username efectivo
- cómo cargarás usuarios
- cómo validarás contraseñas
- cómo manejarás cuentas deshabilitadas, bloqueadas o no verificadas
- cómo tratarás refresh tokens
- cómo se revocará acceso
- cómo se distinguirá autenticación de autorización

Si eso no se decide bien, la arquitectura suele quedar improvisada.

---

## Señal de diseño sano

Una arquitectura de autenticación sana suele mostrar:

- controller de auth bastante delgado
- DTOs claros de login/refresh
- `AuthenticationManager` o mecanismo equivalente bien ubicado
- `UserDetailsService` claro
- `PasswordEncoder` explícito
- filtro JWT enfocado si hay JWT
- principal autenticado bien definido
- `SecurityConfig` entendible
- poca lógica de negocio mezclada dentro de filtros o config
- separación razonable entre autenticación, emisión de tokens y autorización

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- lógica de login metida en controller
- contraseñas comparadas a mano
- filtros gigantes haciendo de todo
- tokens que reemplazan demasiado al backend
- contexto autenticado armado con datos insuficientes
- account status no considerado
- mezcla confusa entre login y autorización
- `SecurityConfig` difícil de entender incluso para el propio equipo
- falta de una representación clara del usuario autenticado

---

## Qué debería entender el equipo aunque use framework

Spring Security ayuda muchísimo, pero no debería volverse una zona oscura del sistema.

El equipo debería poder explicar, al menos de forma clara:

- cómo entra una credencial
- quién la valida
- cómo se carga al usuario
- cómo se construye el principal
- dónde queda disponible la identidad
- cómo se emite o valida un token
- qué pasa si la cuenta está bloqueada o deshabilitada
- qué parte del request pipeline depende de autenticación

Si nadie puede explicar eso con claridad, la arquitectura probablemente esté demasiado “mágica”.

---

## Ejemplo de lectura arquitectónica rápida

Cuando abrís una codebase y querés entender autenticación, una secuencia útil es esta:

### 1. Buscar `SecurityConfig`
- qué rutas están abiertas
- qué filtros existen
- qué estrategia usa

### 2. Buscar endpoints de auth
- login
- refresh
- logout
- reset password
- activación

### 3. Buscar `UserDetailsService`
- cómo carga usuarios
- qué atributos considera

### 4. Buscar `PasswordEncoder`
- qué algoritmo usa
- dónde se aplica

### 5. Buscar filtros JWT si existen
- cómo extraen token
- cómo validan
- cómo construyen `Authentication`

### 6. Buscar cómo se emiten tokens
- claims
- expiración
- refresh
- revocación o estrategia equivalente

Esa lectura ordena mucho el mapa mental.

---

## Relación con seguridad real

Pensar bien la arquitectura de autenticación mejora mucho cosas como:

- claridad de identidad
- menor confianza ingenua
- mejor mantenimiento
- menos acoplamiento raro
- menos bugs de auth
- mejor integración con autorización
- mejor manejo de cuentas bloqueadas o deshabilitadas
- menor riesgo de errores al extender el sistema

No es solo prolijidad técnica.
Es seguridad real.

---

## Checklist práctico

Cuando revises la arquitectura de autenticación de una app Spring, preguntate:

- ¿usa sesión, JWT o ambos?
- ¿cómo entra la credencial al sistema?
- ¿quién la valida realmente?
- ¿qué rol cumple `AuthenticationManager`?
- ¿cómo se carga el usuario o principal?
- ¿qué rol cumple `UserDetailsService`?
- ¿cómo se comparan contraseñas?
- ¿qué contiene el principal autenticado?
- ¿cómo se construye el `SecurityContext`?
- ¿qué hace exactamente el filtro JWT si existe?
- ¿qué pasa si la cuenta está deshabilitada o bloqueada?
- ¿está bien separada la autenticación de la autorización?

---

## Mini ejercicio de reflexión

Tomá tu backend Spring y respondé:

1. ¿Cuál es el recorrido exacto del login?
2. ¿Qué clase valida las credenciales?
3. ¿Qué clase carga al usuario?
4. ¿Qué objeto representa al principal autenticado?
5. ¿Qué pasa en cada request si usás JWT?
6. ¿Dónde queda la identidad disponible para el resto del sistema?
7. ¿Qué parte de la arquitectura te cuesta explicar con claridad?

Ese último punto suele mostrar muy rápido dónde la arquitectura todavía está demasiado confusa.

---

## Resumen

La autenticación en Spring Security conviene pensarla como una arquitectura, no como un par de piezas sueltas.

Normalmente intervienen:

- endpoints de auth
- DTOs
- service de auth
- `AuthenticationManager`
- `UserDetailsService`
- `PasswordEncoder`
- filtros
- `SecurityFilterChain`
- `SecurityContext`

En resumen:

> Una buena arquitectura de autenticación no solo valida credenciales.  
> También deja claro cómo se construye una identidad confiable y cómo esa identidad llega al resto del backend de forma entendible y mantenible.

---

## Próximo tema

**Password hashing correcto en Java**
