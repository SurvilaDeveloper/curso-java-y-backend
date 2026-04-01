---
title: "Cómo modelar un usuario del sistema con username, password y roles para Spring Security"
description: "Entender cómo diseñar la entidad o modelo de usuario autenticable en Spring Boot, qué campos mínimos suelen hacer falta y por qué username, password y roles forman una base clave para integrar Spring Security de forma coherente."
order: 65
module: "Seguridad con Spring Security"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo funciona JWT dentro de una API Spring Boot de forma conceptual y práctica:

- login
- emisión de token
- header `Authorization: Bearer ...`
- requests autenticadas
- reconstrucción de la identidad actual
- integración con Spring Security

Eso ya te dio un mapa muy importante del flujo de autenticación moderna en APIs desacopladas.

Pero enseguida aparece una pregunta fundamental:

> ¿qué objeto del sistema representa realmente al usuario que puede autenticarse?

Porque una cosa es entender:

- cómo llega la identidad al backend
- cómo se protege una ruta
- cómo se usa `/me`
- cómo se manda un token

Pero otra cosa, igual de importante, es definir:

- dónde vive ese usuario
- qué campos tiene
- cómo se guarda su password
- cómo se representan sus roles
- y qué lo diferencia de otros datos de perfil o negocio

Este tema es clave porque sin un modelo claro de usuario autenticable, toda la seguridad empieza a quedar apoyada en una base demasiado difusa.

## El problema de no distinguir bien al usuario autenticable

En muchos proyectos al principio aparece una sola idea vaga de “usuario”.

Pero en la práctica suele hacer falta distinguir varias cosas:

- la identidad que puede iniciar sesión
- los datos de perfil
- las preferencias del usuario
- los datos de negocio asociados
- los roles o permisos
- el estado de la cuenta

Si todo eso se mezcla sin criterio en una sola bolsa confusa, después cuesta mucho:

- integrar Spring Security
- entender qué se usa para login
- gestionar permisos
- modelar cuentas activas o bloqueadas
- separar identidad de perfil
- mantener el backend claro

Por eso conviene pensar bien desde el inicio qué significa “usuario” en el contexto de seguridad.

## Qué es un usuario autenticable

Dicho de forma simple:

> un usuario autenticable es la identidad del sistema que puede demostrar quién es y recibir permisos o roles para operar dentro de la aplicación.

Ese usuario suele necesitar, como mínimo, campos como:

- identificador
- username o email de login
- password almacenada de forma segura
- roles
- estado de la cuenta

Eso no siempre significa que ahí deba vivir absolutamente toda la información del perfil humano o del negocio.
Pero sí significa que esa entidad o modelo debe representar la base de la autenticación y la autorización.

## Por qué username, password y roles aparecen tan rápido

Porque resuelven tres preguntas fundamentales:

### Username
¿Con qué identidad se presenta el usuario para ser reconocido?

### Password
¿Cómo demuestra el usuario que esa identidad realmente le pertenece?

### Roles
¿Qué tipo de permisos amplios o categoría de acceso tiene una vez autenticado?

Estas tres piezas ya te permiten construir una base bastante real de seguridad.

## Un primer modelo muy simple

Podrías imaginar algo así:

```java
public class Usuario {

    private Long id;
    private String username;
    private String password;
    private String rol;
}
```

Como primer dibujo mental, esto sirve bastante.

Porque ya aparecen las ideas centrales:

- identidad
- secreto
- permisos generales

Pero para un backend real conviene refinar bastante esta idea.

## Por qué el modelo simple se queda corto

Porque enseguida aparecen preguntas como:

- ¿password se guarda en texto plano?
- ¿un usuario puede tener más de un rol?
- ¿la cuenta está activa o bloqueada?
- ¿username y email son lo mismo o no?
- ¿qué datos son de autenticación y cuáles son solo de perfil?
- ¿qué pasa si querés soft delete o desactivación?
- ¿cómo validás unicidad?

Eso muestra que el usuario autenticable es una pieza de dominio bastante más seria que “una clase con tres strings”.

## Una versión mucho más razonable como entidad

Un punto de partida bastante sano podría verse así:

```java
import java.util.Set;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Usuario {

    @Id
    @GeneratedValue
    private Long id;

    private String username;
    private String passwordHash;
    private boolean activo;

    @ElementCollection
    private Set<String> roles;

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
```

Esto ya se parece mucho más a una base razonable de usuario autenticable.

## Por qué `username` es tan importante

Porque suele ser uno de los identificadores principales del proceso de login.

Podría ser:

- un nombre de usuario clásico
- un email usado como username
- un identificador único equivalente

Lo importante conceptualmente es esto:

> el backend necesita un campo estable y reconocible con el que el usuario pueda autenticarse.

No hace falta que siempre se llame literalmente `username` en todos los sistemas del mundo.
Pero sí hace falta una identidad de login clara.

## ¿Username o email?

Buena pregunta.

En muchos sistemas modernos, el login usa email.
En otros, usa username explícito.
En otros, ambos pueden convivir.

Lo importante no es memorizar una única convención universal.
Lo importante es entender la decisión:

- ¿qué dato usa el usuario para identificarse al loguearse?
- ¿ese dato debe ser único?
- ¿ese dato es estable?
- ¿ese dato tiene sentido como identidad principal del sistema?

Muchas veces usar email como login tiene muchísimo sentido.
Otras veces, username separado también puede ser razonable.

## Por qué la unicidad es crítica

Sea username o email, el identificador de login normalmente debe ser único.

Porque si dos cuentas comparten la misma identidad de autenticación, el login deja de tener sentido.

Por eso suele ser importante modelar y validar muy bien cosas como:

- unicidad de username
- unicidad de email si se usa para login
- normalización razonable del dato
- consistencia del identificador usado por seguridad

## Por qué no conviene guardar la password “como vino”

Esto es una de las ideas más importantes del tema.

La password no debería guardarse en texto plano.

Nunca debería ser simplemente:

```java
private String password;
```

y luego persistir lo mismo que escribió el usuario.

Lo razonable es guardar una representación protegida de esa contraseña, normalmente un hash seguro.

Por eso en el ejemplo aparece:

```java
private String passwordHash;
```

y no simplemente `password`.

## Qué significa guardar un hash

Sin meternos todavía en todos los detalles criptográficos, la idea general es esta:

> en vez de guardar la contraseña original, el sistema guarda una versión transformada y segura que permite verificarla más adelante sin conservarla en texto plano.

Esa diferencia es importantísima.

Porque una cosa es almacenar secretos sin protección, y otra muy distinta es almacenar una forma segura de verificación.

## Por qué esto importa muchísimo

Porque si la base se filtra o se expone, guardar contraseñas en texto plano sería desastroso.

La seguridad básica del backend exige entender desde temprano que el campo de contraseña persistida no representa la password original “tal cual la escribió el usuario”, sino una versión segura para validación posterior.

## Qué papel cumple `passwordHash`

Cumple algo así como:

- lo que realmente persiste el backend
- lo que Spring Security o tu flujo de autenticación compara
- la representación segura del secreto del usuario

Eso hace que el modelo de usuario sea mucho más realista que una clase ingenua con contraseña plana.

## Por qué `activo` o estado de cuenta suele ser importante

Porque no todos los usuarios del sistema que existen deberían poder autenticarse siempre.

Por ejemplo, una cuenta podría estar:

- activa
- desactivada
- bloqueada
- suspendida
- pendiente de verificación
- eliminada lógicamente

Si el modelo no tiene ninguna forma de representar estado, después cuesta mucho expresar reglas del tipo:

- este usuario existe, pero no puede ingresar
- esta cuenta fue desactivada
- este usuario necesita activar su email primero

Por eso un campo como `activo` o una versión más rica del estado suele ser muy útil.

## Un modelo simple con estado booleano

```java
private boolean activo;
```

ya te da una base razonable para expresar algo como:

- `true` → la cuenta está habilitada
- `false` → la cuenta no debería autenticarse normalmente

Más adelante podrías sofisticarlo mucho más.
Pero como punto de partida es una decisión bastante sana.

## Por qué los roles suelen modelarse como colección

Porque un usuario puede necesitar más de un rol.

Por ejemplo:

- `USER`
- `ADMIN`
- `MODERATOR`
- `SELLER`

A veces uno solo alcanza.
Pero modelar roles como conjunto suele ser bastante flexible.

Por ejemplo:

```java
private Set<String> roles;
```

Esto permite casos como:

- usuario común con `USER`
- admin con `ADMIN`
- moderador con `MODERATOR`
- usuario que también es vendedor con `USER` y `SELLER`

No hace falta que tu sistema use múltiples roles desde el primer día.
Pero pensar el diseño con esa posibilidad suele ser bastante razonable.

## ¿Por qué Set y no List?

Porque conceptualmente los roles suelen verse mejor como un conjunto sin duplicados.

No tendría mucho sentido algo como:

- `USER`
- `USER`
- `ADMIN`

Entonces `Set` suele expresar mejor la idea de colección de roles únicos.

No es una regla sagrada del universo, pero conceptualmente suele quedar bastante limpio.

## Un ejemplo más completo y razonable

```java
import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Usuario {

    @Id
    @GeneratedValue
    private Long id;

    private String username;
    private String email;
    private String passwordHash;
    private boolean activo = true;

    @ElementCollection
    private Set<String> roles = new HashSet<>();

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
```

Este modelo ya sirve muchísimo mejor para un backend real.

## Qué diferencia hay entre email y username acá

En este diseño ambos conviven.
Y eso puede tener sentido si:

- el login se hace por username
- email sirve para contacto y comunicación
- o viceversa, si después decidís usar email como identidad principal

La clave es que tu diseño exprese con claridad qué campo es la identidad de login y qué campo es solo perfil o contacto.

## Qué no conviene mezclar sin criterio

No conviene mezclar demasiado rápido:

- usuario autenticable
- perfil público
- preferencias visuales
- datos de negocio
- métricas
- relaciones secundarias

No significa que jamás puedan convivir en la misma entidad.
Pero sí conviene pensar con cuidado qué campos son centrales para seguridad y cuáles pertenecen a otras preocupaciones del sistema.

## Un ejemplo de perfil separado conceptualmente

A veces podés tener algo como:

### Usuario
- id
- username
- email
- passwordHash
- activo
- roles

### PerfilUsuario
- nombre visible
- apellido
- bio
- avatar
- preferencias

No siempre hace falta separar así desde el minuto cero.
Pero entender la diferencia conceptual ayuda muchísimo a no convertir el usuario autenticable en una bolsa de todo.

## Qué relación tiene esto con JWT

Muy fuerte.

Porque si trabajás con JWT, cuando el usuario hace login y se genera el token, normalmente la información base sale de este modelo:

- username
- id
- roles
- estado de cuenta

Es decir, el modelo de usuario autenticable es una de las fuentes principales de la identidad que luego termina representada en el contexto de seguridad.

## Qué relación tiene esto con roles y autorización

Total.

Si el usuario no modela roles de forma clara, después Spring Security no tiene una base limpia para decidir cosas como:

- `hasRole("ADMIN")`
- `hasAnyRole("ADMIN", "MODERATOR")`

Por eso el diseño del usuario afecta directamente la capa de autorización.

## Qué relación tiene esto con login

También total.

En el login, el backend necesita:

- buscar al usuario por username o email
- recuperar la password hash
- verificar credenciales
- decidir si la cuenta está activa
- conocer sus roles
- eventualmente emitir un token

Eso significa que el modelo de usuario es una de las piezas más centrales del flujo de autenticación.

## Un ejemplo conceptual de login

Podrías imaginar algo así:

```java
public LoginResponse login(LoginRequest request) {
    Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new CredencialesInvalidasException("Credenciales inválidas"));

    if (!usuario.isActivo()) {
        throw new CuentaInactivaException("La cuenta está inactiva");
    }

    // verificar password contra passwordHash
    // generar token
    // devolver response
}
```

Este ejemplo deja clarísimo por qué el usuario autenticable necesita más que un simple nombre.

## Qué relación tiene esto con `/me`

Muy directa.

Cuando después hacés algo como:

```text
GET /usuarios/me
```

lo que el backend devuelve suele salir del usuario autenticado del sistema.

Eso hace que el modelo de usuario no solo sirva para login.
También sirva para construir mucha parte del backend autenticado.

## Qué cambia en los DTOs

También es muy importante no confundir:

- entidad de usuario autenticable
- request de registro
- request de login
- response de usuario
- response pública o privada del perfil

Por ejemplo:

### Registro
Podría recibir:
- username
- email
- password

### Login
Podría recibir:
- username o email
- password

### Response
No debería exponer:
- passwordHash

Esto parece obvio, pero es fundamental.

## Un ejemplo sano de request de registro

```java
public class RegisterRequest {

    private String username;
    private String email;
    private String password;

    // getters y setters
}
```

Y después el service haría algo como:

- validar unicidad
- hashear password
- crear `Usuario`
- asignar roles iniciales
- guardar

Este flujo muestra muy bien por qué conviene separar entrada y entidad persistida.

## Un ejemplo de response sano

```java
public class UsuarioResponse {

    private Long id;
    private String username;
    private String email;
    private boolean activo;
    private Set<String> roles;

    // getters y setters
}
```

Acá ya se ve muy bien que `passwordHash` queda fuera del contrato de salida.

Eso es exactamente lo que debería pasar.

## Por qué `passwordHash` nunca debería salir en la API

Porque es un dato interno extremadamente sensible del modelo de seguridad.

Aunque no sea la contraseña en texto plano, sigue siendo una pieza interna que no debería exponerse por error en responses públicas o administrativas salvo casos muy específicos de infraestructura que no son el caso aquí.

Este punto es importantísimo:
seguridad también significa no exponer estructuras internas innecesarias.

## Qué pasa con `enabled`, `locked`, `expired` y variantes

Más adelante podrías modelar más estados de cuenta, por ejemplo:

- habilitada o no
- bloqueada o no
- credenciales vencidas o no
- cuenta vencida o no

No hace falta meter toda esa complejidad de golpe.
Pero conviene saber que el booleano `activo` puede ser el primer paso de algo que luego se vuelva más rico.

## Qué pasa con roles como enum

También es bastante razonable modelar roles con enum en vez de strings sueltos.

Por ejemplo:

```java
public enum Role {
    USER,
    ADMIN,
    MODERATOR
}
```

Y luego:

```java
private Set<Role> roles;
```

Esto puede dar más seguridad de tipos y reducir errores de strings escritos a mano.

No es obligatorio empezar así, pero sí es una opción muy sana para proyectos que quieren más claridad.

## Qué gana un enum para roles

Varias cosas:

- menos errores tipográficos
- más expresividad
- mejor autocompletado
- más claridad del dominio
- restricciones más fuertes sobre valores válidos

Entonces, si el proyecto va creciendo, esta opción puede volverse muy atractiva.

## Qué relación tiene esto con Spring Security concretamente

Spring Security necesita alguna forma de traducir tu modelo de usuario a una identidad utilizable para autenticación y autorización.

Eso significa que tu entidad `Usuario` o modelo equivalente es la materia prima que luego se integra con conceptos como:

- principal
- authorities
- roles
- autenticación actual

Por eso modelar bien esta clase no es un detalle.
Es una base estructural de toda la seguridad.

## Qué no conviene hacer

No conviene tener una entidad de usuario con cosas como:

- password plana
- roles ambiguos
- sin unicidad clara de login
- sin estado de cuenta
- mezclando 50 preocupaciones distintas sin criterio

Porque después cada paso de seguridad se vuelve más difícil de diseñar, entender y mantener.

## Otro error común

Usar `password` como campo persistido y tratarlo como si fuera el secreto original del usuario guardado tal cual.

Eso es una muy mala práctica.
La contraseña original no debería conservarse de esa manera.

## Otro error común

No separar el dato de login del dato de perfil.

A veces eso termina haciendo que el usuario autenticable crezca sin foco y se vuelva una entidad muy confusa.

## Otro error común

Modelar roles de una forma demasiado improvisada, por ejemplo con strings sueltos sin convención ni claridad.

Si el sistema ya depende de roles para autorización, conviene tratarlos con bastante más intención.

## Una buena heurística

Podés preguntarte:

- ¿qué dato usa el usuario para loguearse?
- ¿ese dato es único?
- ¿cómo voy a guardar la password de forma segura?
- ¿qué roles mínimos necesito?
- ¿cómo sé si la cuenta está activa?
- ¿qué parte de esta entidad es seguridad y qué parte es perfil?

Responder eso ordena muchísimo el modelo.

## Qué relación tiene esto con una API real

Muy directa.

Porque tarde o temprano una API real necesita algo como:

- registro
- login
- usuario actual
- roles
- permisos
- cuentas activas/inactivas
- dueños de recursos
- trazabilidad de autor

Y casi todo eso se apoya en un modelo de usuario bien pensado.

## Relación con Spring Boot

Spring Boot y Spring Security hacen muy natural que este modelo se integre con el resto del backend, pero esa integración solo va a sentirse limpia si la base conceptual del usuario autenticable está bien diseñada.

Por eso este tema no es accesorio.
Es una de las piezas centrales del backend seguro.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> modelar un usuario autenticable con campos claros como username o email de login, password guardada de forma segura, roles y estado de cuenta le da a Spring Security una base coherente para login, autorización, JWT y casos de uso centrados en la identidad real del usuario.

## Resumen

- El usuario autenticable es una pieza central del backend seguro.
- Username o email de login, password protegida, roles y estado de cuenta suelen ser campos fundamentales.
- La password no debería guardarse en texto plano, sino como hash seguro.
- Los roles ayudan a integrar autorización con Spring Security.
- Muchas veces conviene distinguir identidad autenticable de perfil u otros datos secundarios.
- DTOs de registro, login y respuesta no deberían confundirse con la entidad persistida.
- Este tema prepara el terreno para integrar mejor el modelo de usuario con login, JWT y autorización real.

## Próximo tema

En el próximo tema vas a ver cómo integrar ese usuario con `UserDetails` y `UserDetailsService`, que es uno de los puentes más importantes entre tu modelo del dominio y la forma en que Spring Security entiende a un usuario autenticado.
