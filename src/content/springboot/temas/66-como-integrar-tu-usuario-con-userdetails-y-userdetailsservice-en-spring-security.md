---
title: "Cómo integrar tu usuario con UserDetails y UserDetailsService en Spring Security"
description: "Entender qué roles cumplen UserDetails y UserDetailsService dentro de Spring Security, cómo conectan tu modelo de usuario con el framework y por qué son piezas clave para autenticar usuarios reales en una aplicación Spring Boot."
order: 66
module: "Seguridad con Spring Security"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo modelar un usuario autenticable del sistema con cosas como:

- username o email de login
- password guardada de forma segura
- roles
- estado de cuenta

Eso ya te dio una base muy importante para construir seguridad real.

Pero aparece enseguida una pregunta clave:

> ¿cómo hace Spring Security para entender a ese usuario que vos modelaste en tu dominio?

Porque una cosa es tener una entidad `Usuario` propia del proyecto.
Y otra cosa es que Spring Security sepa:

- cómo encontrarlo
- cómo leer su identidad
- cómo interpretar sus roles
- cómo saber si está habilitado
- cómo usarlo dentro del proceso de autenticación

Ahí aparecen dos piezas fundamentales del ecosistema de seguridad de Spring:

- `UserDetails`
- `UserDetailsService`

Este tema es clave porque muestra uno de los puentes más importantes entre:

- tu modelo del dominio
- y la forma en que Spring Security piensa un usuario autenticado

## El problema de tener una entidad Usuario y nada más

Supongamos que ya tenés algo así:

```java
@Entity
public class Usuario {

    @Id
    @GeneratedValue
    private Long id;

    private String username;
    private String email;
    private String passwordHash;
    private boolean activo;

    @ElementCollection
    private Set<String> roles;

    // getters y setters
}
```

Desde el punto de vista del dominio, esto puede estar muy bien.

Pero Spring Security no trabaja directamente con “cualquier clase llamada Usuario” por arte de magia.
Necesita una forma de interactuar con un modelo que exprese cosas como:

- username
- password
- authorities o roles
- si la cuenta está habilitada
- si está bloqueada o no
- si las credenciales siguen vigentes

Es decir:

> Spring Security necesita una representación de usuario que entienda dentro de su propio flujo interno.

Ahí entra `UserDetails`.

## Qué es UserDetails

`UserDetails` es una interfaz de Spring Security que representa un usuario desde el punto de vista del framework.

Podés pensarlo así:

> `UserDetails` es la forma estándar en que Spring Security espera ver una identidad autenticable.

No es necesariamente tu entidad de dominio tal cual.
Es una interfaz que expone la información que Spring Security necesita para autenticar y autorizar.

## Qué tipo de información expresa UserDetails

Conceptualmente, `UserDetails` expresa cosas como:

- cuál es el username
- cuál es la password
- qué authorities o roles tiene
- si la cuenta está habilitada
- si está expirada o no
- si está bloqueada o no
- si las credenciales están vigentes o no

Eso muestra que `UserDetails` no es simplemente un DTO cualquiera.
Es una interfaz muy ligada al proceso de seguridad.

## Por qué esto importa tanto

Porque apenas aparece el login real, Spring Security necesita saber algo como:

- dame el usuario correspondiente a este username
- decime cuál es su password protegida
- decime qué permisos tiene
- decime si la cuenta puede autenticarse

Si tu modelo de usuario no se conecta bien con esas expectativas, la integración se vuelve confusa.

## Qué es UserDetailsService

`UserDetailsService` es otra interfaz muy importante.

Su responsabilidad conceptual es esta:

> dado un username, cargar el usuario que Spring Security necesita para autenticación.

Dicho simple:

- Spring Security recibe una identidad de login
- necesita buscar al usuario correspondiente
- delega esa búsqueda a algo que implemente `UserDetailsService`

Es uno de los puntos más importantes del flujo de autenticación.

## Cómo se conectan ambas piezas

Podés pensarlo así:

### UserDetails
Representa al usuario ya traducido al lenguaje que Spring Security entiende.

### UserDetailsService
Sabe cómo encontrar y devolver ese usuario cuando Spring Security lo necesita.

Esta dupla aparece muchísimo y conviene entenderla muy bien.

## Un ejemplo mental del flujo

Supongamos que el usuario intenta loguearse con:

- username: `gabriel`
- password: `secreta`

El flujo conceptual puede ser algo así:

1. Spring Security recibe el intento de autenticación
2. necesita encontrar al usuario `gabriel`
3. llama a `UserDetailsService`
4. `UserDetailsService` busca en tu repository o fuente de datos
5. devuelve un `UserDetails`
6. Spring Security usa ese `UserDetails` para verificar password, roles y estado de cuenta

Ese flujo es fundamental.

## Primera decisión importante: adaptar tu entidad o crear un wrapper

A la hora de integrar tu modelo con Spring Security, suelen aparecer dos caminos razonables:

1. hacer que tu entidad `Usuario` implemente `UserDetails`
2. crear una clase adaptadora o wrapper que implemente `UserDetails` y envuelva a tu `Usuario`

No existe una única respuesta universal.
Pero conceptualmente conviene entender ambos enfoques.

## Opción 1: que Usuario implemente UserDetails

Ejemplo conceptual:

```java
import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue
    private Long id;

    private String username;
    private String passwordHash;
    private boolean activo;

    @ElementCollection
    private Set<String> roles;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toSet());
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return activo;
    }
}
```

Este ejemplo ya muestra muy claramente qué significa hablar el idioma de Spring Security.

## Cómo leer este ejemplo

La entidad `Usuario` ya no solo sirve para persistencia.
Ahora también implementa la interfaz que Spring Security usa para leer un usuario autenticable.

Eso significa que, al devolver una instancia de `Usuario`, el framework ya puede preguntar cosas como:

- `getUsername()`
- `getPassword()`
- `getAuthorities()`
- `isEnabled()`

y usarlas directamente.

## Qué es GrantedAuthority

Otra pieza importante que aparece acá es `GrantedAuthority`.

No hace falta profundizar todo todavía, pero sí entender la idea:

> `GrantedAuthority` representa una autoridad o permiso que Spring Security puede usar para autorización.

En implementaciones simples, muchas veces los roles terminan convertidos a authorities.

Por ejemplo:

- `USER` → `ROLE_USER`
- `ADMIN` → `ROLE_ADMIN`

Esto conecta directamente con reglas como:

- `hasRole("ADMIN")`
- `hasAnyRole("USER", "ADMIN")`

## Por qué aparece `ROLE_`

En Spring Security, suele ser muy común que internamente los roles se expresen como authorities con prefijo `ROLE_`.

Por ejemplo:

```java
new SimpleGrantedAuthority("ROLE_ADMIN")
```

Eso no significa que vos tengas que guardar literalmente el string `ROLE_ADMIN` en la base si no querés.
Podés guardar `ADMIN` y traducirlo al formato esperado al construir authorities.

Lo importante ahora es captar el concepto, no pelearte con el detalle del naming.

## Qué hace getAuthorities()

En el ejemplo:

```java
@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    return roles.stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
            .collect(Collectors.toSet());
}
```

la idea es:

- tomar los roles del usuario
- transformarlos en authorities entendibles para Spring Security
- devolverlos como colección

Esto permite que luego el framework sepa si el usuario tiene, por ejemplo:

- `ROLE_USER`
- `ROLE_ADMIN`

y aplique autorización en consecuencia.

## Qué hace getPassword()

```java
@Override
public String getPassword() {
    return passwordHash;
}
```

Esto le dice a Spring Security cuál es la password persistida que debe usar para la verificación.

Y otra vez queda clarísimo algo muy importante:
no devolvés una password plana, sino el hash o valor protegido almacenado.

## Qué hace getUsername()

```java
@Override
public String getUsername() {
    return username;
}
```

Esto le dice a Spring Security cuál es la identidad principal con la que debe reconocer a este usuario.

Si tu login usa email, podrías adaptar esto según el diseño.
Lo importante es que el framework tenga un identificador consistente.

## Qué hacen isEnabled(), isAccountNonLocked(), etc.

Estas funciones permiten representar el estado de la cuenta desde la perspectiva de seguridad.

Por ejemplo:

- `isEnabled()` → cuenta habilitada o no
- `isAccountNonLocked()` → cuenta bloqueada o no
- `isCredentialsNonExpired()` → credenciales vigentes o no
- `isAccountNonExpired()` → cuenta vigente o no

No hace falta que tu sistema implemente toda esta riqueza desde el día uno.
Pero Spring Security tiene estos conceptos porque en sistemas reales suelen importar.

## Un punto sano para empezar

Si todavía no tenés toda esa complejidad, un comienzo razonable puede ser:

- `isEnabled()` ligado a `activo`
- las demás devolver `true`

Eso ya te permite empezar sin inventar estados que tu sistema todavía no necesita.

## Opción 2: usar un adaptador separado

En lugar de hacer que la entidad implemente `UserDetails`, otra opción muy razonable es crear una clase aparte.

Por ejemplo:

```java
import java.util.Collection;
import java.util.stream.Collectors;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class UsuarioSecurityDetails implements UserDetails {

    private final Usuario usuario;

    public UsuarioSecurityDetails(Usuario usuario) {
        this.usuario = usuario;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return usuario.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toSet());
    }

    @Override
    public String getPassword() {
        return usuario.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return usuario.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return usuario.isActivo();
    }

    public Usuario getUsuario() {
        return usuario;
    }
}
```

Este enfoque también es muy usado y tiene ventajas claras.

## Qué gana el enfoque con wrapper

Principalmente, que tu entidad de dominio queda menos acoplada directamente a la interfaz de Spring Security.

Eso puede hacer el diseño un poco más limpio si querés separar:

- modelo del dominio
- adaptación al framework de seguridad

No significa que sea obligatoriamente mejor siempre.
Pero sí es una opción muy sana y bastante elegante en muchos proyectos.

## Qué rol cumple UserDetailsService en cualquiera de los dos enfoques

Independientemente de si usás la entidad directamente o un wrapper, `UserDetailsService` sigue siendo la pieza que sabe cargar el usuario desde tu fuente de datos.

Ejemplo conceptual:

```java
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("No existe el usuario " + username));

        return usuario;
    }
}
```

Si la entidad implementa `UserDetails`, devolver `usuario` ya alcanza.

## Un ejemplo usando wrapper

Si en cambio usás una clase adaptadora:

```java
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("No existe el usuario " + username));

        return new UsuarioSecurityDetails(usuario);
    }
}
```

La idea es exactamente la misma.
Solo cambia la forma en que traducís tu modelo al lenguaje de Spring Security.

## Cómo leer loadUserByUsername(...)

Este método es uno de los corazones del flujo.

Podés leerlo así:

> dado un username de login, devolveme el usuario autenticable que Spring Security necesita para continuar el proceso.

Eso es exactamente lo que hace.

Si no encuentra al usuario, lanza una excepción acorde.
Si lo encuentra, devuelve un `UserDetails`.

## Por qué UsernameNotFoundException es importante

Porque expresa claramente que el problema está en el proceso de autenticación ligado a la identidad solicitada.

No es una excepción de negocio genérica cualquiera.
Está muy conectada al contrato que Spring Security espera cuando no existe un usuario para ese username.

Eso hace que integrarte con el framework sea mucho más limpio.

## Qué relación tiene esto con login

Total.

Cuando el usuario intenta loguearse, Spring Security necesita:

- encontrarlo
- recuperar password hash
- recuperar roles
- saber si está habilitado

Y toda esa información entra normalmente a través del objeto `UserDetails` devuelto por `UserDetailsService`.

Eso significa que esta integración es una de las piezas más centrales de toda la autenticación.

## Qué relación tiene esto con JWT

También muy fuerte.

Incluso si luego emitís un JWT, antes hubo que autenticar correctamente al usuario.

Y para autenticarlo, Spring Security necesita entenderlo como `UserDetails`.

Después, al generar el token, muchas veces usarás datos provenientes de ese mismo modelo:

- username
- id
- roles

Es decir:

- `UserDetails` ayuda a autenticar
- luego esa autenticación puede terminar derivando en un JWT

## Qué relación tiene esto con roles

Total también.

Si `getAuthorities()` está bien implementado, Spring Security puede luego aplicar reglas como:

- `hasRole("ADMIN")`
- `hasAnyRole("USER", "MODERATOR")`

Entonces la autorización del sistema descansa fuertemente sobre cómo construiste las authorities del usuario.

## Un ejemplo conceptual completo

Imaginá este flujo:

1. el usuario manda login con username y password
2. Spring Security llama a `loadUserByUsername(username)`
3. `CustomUserDetailsService` busca al usuario en la base
4. devuelve un `UserDetails`
5. Spring Security usa `getPassword()` para validar credenciales
6. usa `getAuthorities()` para conocer roles
7. usa `isEnabled()` para saber si la cuenta puede autenticarse
8. si todo da bien, el usuario queda autenticado

Este flujo es uno de los más importantes de toda la integración de seguridad.

## Qué cambia en tu repository

Para que esto funcione bien, normalmente necesitás un método como:

```java
Optional<Usuario> findByUsername(String username);
```

o tal vez:

```java
Optional<Usuario> findByEmail(String email);
```

según cómo diseñaste el login.

Esto muestra otra vez por qué el usuario autenticable necesita un identificador claro y único.

## Qué pasa si el login usa email

No hay problema conceptual.
Podrías simplemente adaptar:

- el método del repository
- el criterio de búsqueda
- y lo que entendés por username dentro de la integración

Por ejemplo:

```java
Usuario usuario = usuarioRepository.findByEmail(username)
        .orElseThrow(() -> new UsernameNotFoundException(...));
```

Lo importante es mantener una idea consistente:

> cuál es el dato de login con el que Spring Security va a buscar al usuario.

## Qué no conviene hacer

No conviene que `UserDetailsService` termine resolviendo demasiadas responsabilidades extrañas que no pertenecen al proceso de autenticación.

Su trabajo principal debería seguir siendo:

- encontrar al usuario
- traducirlo a `UserDetails`

No debería convertirse en un service gigantesco de negocio general.

## Otro error común

No pensar bien cómo se traducen los roles a authorities.

Si el sistema depende de autorización por rol, conviene ser muy claro y consistente en esa conversión.

Porque si esa base está mal, después toda la seguridad por rol queda confusa.

## Otro error común

Acoplar todo tanto a Spring Security que el modelo de dominio se vuelva ilegible.

Esto puede pasar si hacés implementaciones rápidas sin pensar.
Por eso el enfoque con wrapper a veces resulta atractivo: separa mejor dominio e infraestructura.

## Otro error común

Olvidarse del estado de cuenta y devolver usuarios inactivos como si fueran autenticables normales.

Si tu modelo tiene noción de cuenta activa o no, conviene integrarla correctamente al flujo de seguridad.

## Una buena heurística

Podés preguntarte:

- ¿mi entidad Usuario ya contiene lo necesario para autenticación?
- ¿quiero que implemente `UserDetails` directamente o prefiero un wrapper?
- ¿qué dato uso para login?
- ¿cómo traduzco roles a authorities?
- ¿cómo represento si la cuenta está habilitada?

Responder esto ordena muchísimo la integración.

## Qué relación tiene esto con el resto del backend

Muy fuerte.

Porque esta integración no se queda encerrada solo en el login.
Afecta luego también:

- el principal actual
- roles disponibles
- endpoints protegidos
- `/me`
- ownership
- JWT
- tests de seguridad

Es decir, `UserDetails` y `UserDetailsService` son una de las bisagras grandes entre el modelo del usuario y toda la infraestructura de seguridad.

## Relación con Spring Security

Spring Security usa estas interfaces justamente para no depender de una única forma rígida de modelar usuarios en todos los proyectos del mundo.

Eso te da mucha flexibilidad:
vos podés tener tu propia entidad, tu propio repository y tu propio diseño.
Solo hace falta construir el puente correcto hacia el lenguaje que el framework necesita.

Y ese puente es, justamente, este tema.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> `UserDetails` y `UserDetailsService` son el puente entre tu modelo real de usuario y la forma en que Spring Security necesita cargar, interpretar y autenticar identidades, convirtiendo datos como username, password hash, roles y estado de cuenta en una autenticación usable por el framework.

## Resumen

- Spring Security no trabaja mágicamente con cualquier entidad Usuario; necesita una representación compatible.
- `UserDetails` representa al usuario desde la perspectiva del framework.
- `UserDetailsService` sabe cargar ese usuario a partir del username de login.
- Tu entidad puede implementar `UserDetails` o podés usar un wrapper adaptador.
- Roles suelen traducirse a `GrantedAuthority`.
- `loadUserByUsername(...)` es una pieza central del proceso de autenticación.
- Este tema conecta el modelo del dominio con la maquinaria real de Spring Security.

## Próximo tema

En el próximo tema vas a ver cómo registrar usuarios nuevos de forma segura, incluyendo validación, unicidad y password hashing, porque una vez que ya sabés cómo se autentica un usuario existente, aparece naturalmente la necesidad de crear cuentas nuevas correctamente.
