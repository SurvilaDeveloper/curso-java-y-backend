---
title: "UserDetails y malas prácticas frecuentes"
description: "Cómo usar UserDetails y UserDetailsService en una aplicación Java con Spring Boot y Spring Security sin convertirlos en una bolsa de datos o en una capa confusa. Qué rol cumplen, qué errores aparecen seguido y cómo modelar mejor la identidad autenticada."
order: 25
module: "Autenticación"
level: "base"
draft: false
---

# UserDetails y malas prácticas frecuentes

## Objetivo del tema

Entender qué papel cumplen `UserDetails` y `UserDetailsService` en una aplicación Java + Spring Boot + Spring Security, y reconocer las malas prácticas más comunes que suelen aparecer cuando el equipo los usa sin una idea clara de su responsabilidad real.

Este tema importa mucho porque `UserDetails` suele quedar en una zona medio incómoda del sistema:

- todos lo usan
- no siempre todos entienden bien para qué sirve
- a veces termina cargando demasiada responsabilidad
- otras veces queda tan pobre que obliga a hacer consultas raras en cualquier lado

La idea central es esta:

> `UserDetails` debería representar de forma razonable a la identidad autenticada para Spring Security, no convertirse ni en una mini base de datos ni en una entidad del dominio expuesta por todos lados.

---

## Idea clave

`UserDetails` no es “el usuario de la aplicación” en sentido completo.

Es una representación de seguridad orientada a responder preguntas como:

- quién es el actor autenticado
- cuál es su identificador principal
- qué authorities tiene
- si la cuenta está habilitada, bloqueada o expirada según el criterio de seguridad configurado

En resumen:

> `UserDetails` pertenece al mundo de autenticación y seguridad.  
> No debería absorber sin criterio toda la lógica del dominio, ni tampoco quedar tan vacío que obligue al sistema a adivinar la identidad real en cada capa.

---

## Qué es `UserDetails`

En Spring Security, `UserDetails` es la interfaz que modela el principal autenticable que el framework usa durante el proceso de autenticación y luego dentro del contexto de seguridad.

### Algunas de sus responsabilidades típicas

- devolver username efectivo
- devolver password hash
- devolver authorities
- indicar si la cuenta está habilitada
- indicar si la cuenta está bloqueada
- indicar si la cuenta está expirada
- indicar si las credenciales están expiradas

### Ejemplo muy simple

```java
public class SecurityUser implements UserDetails {

    private final User user;

    public SecurityUser(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonLocked() {
        return !user.isBlocked();
    }

    @Override
    public boolean isEnabled() {
        return user.isEnabled();
    }
}
```

Esto ya muestra la idea general: el principal de seguridad se apoya en el usuario real, pero no es exactamente lo mismo que la entidad.

---

## Qué es `UserDetailsService`

`UserDetailsService` es la pieza que Spring Security suele usar para cargar la identidad autenticable desde la fuente de datos.

### Su rol central

Tomar un identificador, por ejemplo:

- email
- username

y devolver un `UserDetails` si existe una identidad válida en ese sistema.

### Ejemplo típico

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

El foco acá es claro:

- localizar identidad
- construir principal de seguridad

No debería convertirse en una capa de negocio arbitraria.

---

## Error mental clásico

Mucha gente trata `UserDetails` como si fuera una de estas dos cosas:

### Opción 1: “Mi entidad User pero con otra interfaz”
Entonces meten todo adentro.

### Opción 2: “Una cosa mínima e incómoda que Spring me obliga a tener”
Entonces queda demasiado pobre y obliga a andar reconstruyendo identidad por todos lados.

Las dos aproximaciones suelen traer problemas.

---

## Mala práctica 1: usar la entidad JPA directamente como `UserDetails`

Esto pasa muchísimo.

### Ejemplo riesgoso

```java
@Entity
public class User implements UserDetails {
    // campos de dominio, relaciones, flags, etc.
}
```

### ¿Por qué suele ser mala idea?

Porque mezcla demasiado:

- persistencia
- dominio
- seguridad
- contrato interno de Spring Security

Eso genera varias tensiones:

- la entidad se acopla a preocupaciones del framework
- es más fácil exponer cosas de más
- se vuelve más difícil separar seguridad del modelo de negocio
- puede meter relaciones pesadas o delicadas en el principal autenticado
- hace más tentador reutilizar la entidad en contextos donde no conviene

No siempre explota de inmediato, pero suele ser una decisión floja de diseño.

---

## Mala práctica 2: meter demasiado dentro de `UserDetails`

A veces se construyen principals gigantes con:

- perfil completo
- datos de negocio
- listas de relaciones
- configuraciones internas
- metadata que no hace falta para autenticación
- objetos enteros de otros módulos

### Problemas

- más acoplamiento
- más datos sensibles circulando
- más memoria y complejidad por request
- más dificultad para invalidar o actualizar contexto
- más riesgo de que otras capas usen el principal como atajo para todo

Un principal demasiado inflado suele transformarse en una bolsa de información que nadie gobierna bien.

---

## Mala práctica 3: dejar `UserDetails` demasiado pobre

La otra punta también duele.

Por ejemplo, si el principal solo tiene:

- username
- authorities mínimas

y después todo el sistema necesita saber:

- id real del usuario
- tenant
- estado de cuenta
- flags importantes de seguridad

entonces empiezan cosas como:

- consultas repetidas a base
- services que reconstruyen identidad una y otra vez
- lógica duplicada
- atajos raros para volver a buscar al usuario completo
- capas que no saben bien con qué criterio trabajar

La idea no es inflarlo sin control, pero tampoco dejarlo inútil.

---

## Enfoque sano: principal de seguridad específico

Una buena solución intermedia suele ser crear una clase propia, por ejemplo:

- `SecurityUser`
- `AuthenticatedUser`
- `SecurityPrincipal`

que tenga lo necesario para seguridad y para el resto mínimo razonable del backend.

### Ejemplo

```java
public class SecurityUser implements UserDetails {

    private final Long id;
    private final String email;
    private final String passwordHash;
    private final boolean enabled;
    private final boolean blocked;
    private final String role;

    public SecurityUser(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.passwordHash = user.getPasswordHash();
        this.enabled = user.isEnabled();
        this.blocked = user.isBlocked();
        this.role = user.getRole();
    }

    public Long getId() {
        return id;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public boolean isAccountNonLocked() {
        return !blocked;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
```

Esto deja bastante más claro qué parte del usuario entra al mundo de seguridad.

---

## Mala práctica 4: usar `UserDetailsService` para hacer negocio

A veces `UserDetailsService` empieza a crecer con responsabilidades como:

- registrar auditoría compleja
- disparar side effects
- resolver lógica de perfiles
- calcular permisos de negocio muy dinámicos
- tomar decisiones operativas que no son de autenticación

### Por qué suele ser mala idea

Porque `UserDetailsService` debería mantenerse bastante enfocado en:

- cargar identidad
- traducirla al principal de seguridad

Si se convierte en un service “general de usuario”, perdés claridad arquitectónica.

---

## Mala práctica 5: authorities mal modeladas

Otro error común es construir authorities sin criterio claro.

### Ejemplos flojos

- meter strings arbitrarios sin convención
- mezclar permisos de negocio finos con cualquier cosa en el principal
- roles inconsistentes
- authorities que no reflejan bien lo que después usa la autorización

### Ejemplo sano y simple

```java
@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + role));
}
```

No siempre alcanza para todo el sistema, pero es bastante más claro que un conjunto improvisado de labels sin convención.

---

## Mala práctica 6: no considerar bien estados de cuenta

Spring Security permite modelar estados como:

- cuenta bloqueada
- cuenta expirada
- credenciales expiradas
- cuenta habilitada o no

Si todo eso se deja en valores por defecto sin pensar, se pierde una oportunidad importante de integrar autenticación con seguridad real de la cuenta.

### Ejemplo

```java
@Override
public boolean isAccountNonLocked() {
    return !blocked;
}

@Override
public boolean isEnabled() {
    return enabled;
}
```

Eso ya expresa algo importante de forma clara.

---

## Mala práctica 7: cargar relaciones pesadas o sensibles dentro del principal

Ejemplos peligrosos:

- colecciones enormes
- entidades relacionadas completas
- datos de facturación
- configuraciones sensibles
- historial de actividad
- objetos que después pueden disparar lazy loading en momentos raros

### Problemas

- más complejidad
- más costo por request
- más riesgo de exposición accidental
- principals difíciles de serializar o testear
- mayor acoplamiento entre seguridad y dominio

El principal no debería arrastrar media aplicación.

---

## Mala práctica 8: depender en todo el sistema de castear raro el principal

A veces todo el backend vive haciendo cosas como:

```java
SecurityUser principal = (SecurityUser) SecurityContextHolder.getContext()
        .getAuthentication()
        .getPrincipal();
```

Eso puede ser normal hasta cierto punto.

Pero si cada capa lo hace a su manera y después vuelve a preguntar otras cosas distintas, la app se vuelve frágil y repetitiva.

Más sano suele ser encapsular mejor el acceso al actor actual, por ejemplo con una utilidad o servicio pequeño de contexto, si el proyecto lo necesita.

---

## Mala práctica 9: exponer `UserDetails` fuera del contexto de seguridad

A veces el principal empieza a viajar a capas o respuestas donde no debería.

Por ejemplo:

- devolverlo en responses
- mezclarlo con DTOs públicos
- usarlo como modelo de negocio
- propagarlo a lugares donde el dominio debería trabajar con otra abstracción

El principal de seguridad debería quedarse razonablemente en el mundo de auth/security y servir como identidad del actor, no convertirse en el contrato universal del sistema.

---

## Mala práctica 10: no poder explicar qué datos mínimos necesita el principal

Esta es una señal muy útil.

Si el equipo no puede responder con claridad:

- qué datos necesita realmente el principal
- por qué esos y no otros
- qué estados de cuenta importan
- qué authorities debe traer
- qué cosas conviene dejar fuera

entonces probablemente el diseño del principal todavía esté bastante improvisado.

---

## Ejemplo de diseño flojo

```java
@Entity
public class User implements UserDetails {

    @Id
    private Long id;

    private String email;
    private String passwordHash;
    private String role;
    private Boolean enabled;

    @OneToMany(mappedBy = "user")
    private List<Order> orders;

    @OneToMany(mappedBy = "user")
    private List<Address> addresses;

    private String internalNotes;

    // métodos de UserDetails
}
```

### Qué hace ruido

- la entidad es también principal de seguridad
- arrastra relaciones de negocio
- mezcla seguridad con persistencia
- puede exponer demasiado contexto
- queda muy acoplada al framework

---

## Ejemplo más sano

### Entidad

```java
@Entity
public class User {

    @Id
    private Long id;

    private String email;
    private String passwordHash;
    private String role;
    private boolean enabled;
    private boolean blocked;
}
```

### Principal de seguridad

```java
public class SecurityUser implements UserDetails {

    private final Long id;
    private final String email;
    private final String passwordHash;
    private final boolean enabled;
    private final boolean blocked;
    private final String role;

    public SecurityUser(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.passwordHash = user.getPasswordHash();
        this.enabled = user.isEnabled();
        this.blocked = user.isBlocked();
        this.role = user.getRole();
    }

    public Long getId() {
        return id;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public boolean isAccountNonLocked() {
        return !blocked;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
```

### Qué mejora esto

- seguridad separada del modelo persistente
- principal más claro
- menos acoplamiento
- menos exposición accidental
- responsabilidades mejor delimitadas

---

## Qué debería poder hacer bien el equipo

Después de este tema, el equipo debería poder responder con claridad:

- qué representa `UserDetails` en esta app
- qué datos mínimos necesita
- qué estados de cuenta importan
- qué authorities se construyen
- dónde se carga el principal
- qué parte pertenece a seguridad y qué parte pertenece al dominio

Si eso está claro, la autenticación suele estar bastante mejor asentada.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- principal de seguridad específico
- `UserDetailsService` enfocado
- pocas relaciones pesadas en el principal
- authorities claras
- estados de cuenta explícitos
- separación razonable entre entidad y principal
- menos acoplamiento raro con el framework

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- entidad JPA implementando `UserDetails`
- principal gigante
- principal inútil que obliga a consultas por todos lados
- `UserDetailsService` haciendo de todo
- authorities improvisadas
- estado de cuenta ignorado
- principal usado como contrato universal
- demasiada dependencia de casts dispersos en todo el backend

---

## Checklist práctico

Cuando revises `UserDetails` y `UserDetailsService` en una app Spring, preguntate:

- ¿la entidad JPA implementa `UserDetails`?
- ¿el principal de seguridad tiene solo lo razonablemente necesario?
- ¿le faltan datos importantes para seguridad o le sobran demasiados?
- ¿`UserDetailsService` se enfoca en cargar identidad o hace negocio raro?
- ¿las authorities están claras?
- ¿el estado de cuenta está bien reflejado?
- ¿hay relaciones pesadas o sensibles dentro del principal?
- ¿el resto de la app depende demasiado de castear el principal en cualquier lado?
- ¿hay una frontera razonable entre seguridad y dominio?
- ¿el equipo puede explicar por qué el principal tiene exactamente esos campos?

---

## Mini ejercicio de reflexión

Tomá tu implementación actual y respondé:

1. ¿Qué clase representa hoy al principal autenticado?
2. ¿Es una entidad, una clase específica o una mezcla?
3. ¿Qué campos tiene?
4. ¿Cuáles son realmente necesarios para seguridad?
5. ¿Qué campos sobran y deberían salir?
6. ¿Qué campos faltan y hoy obligan a consultas raras?
7. ¿`UserDetailsService` está haciendo solo carga de identidad o bastante más?

Ese ejercicio ayuda mucho a ver si la arquitectura está clara o si se fue deformando por comodidad.

---

## Resumen

`UserDetails` y `UserDetailsService` son piezas centrales de autenticación en Spring Security, pero conviene usarlas con criterio.

Lo sano suele ser:

- principal de seguridad específico
- entidad de dominio separada
- `UserDetailsService` enfocado
- authorities claras
- estado de cuenta explícito
- poca mezcla entre seguridad y negocio

En resumen:

> `UserDetails` debería ser una representación razonable de la identidad autenticada para el sistema de seguridad, no una entidad reciclada ni una bolsa de datos sin frontera clara.

---

## Próximo tema

**Bloqueo, throttling y defensa contra brute force**
