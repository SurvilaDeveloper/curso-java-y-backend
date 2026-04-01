---
title: "Cómo registrar usuarios nuevos de forma segura con validación, unicidad y password hashing"
description: "Entender cómo diseñar un registro de usuarios seguro en Spring Boot, qué validaciones suelen hacer falta, por qué la unicidad es importante y cómo integrar el hashing de contraseñas antes de persistir nuevas cuentas."
order: 67
module: "Seguridad con Spring Security"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo integrar tu modelo de usuario con:

- `UserDetails`
- `UserDetailsService`

y cómo eso funciona como uno de los puentes principales entre tu dominio y la forma en que Spring Security entiende a un usuario autenticable.

Eso ya te dio una base muy importante para el login.

Pero enseguida aparece otra necesidad igual de importante:

> ¿cómo se crea una cuenta nueva de forma segura?

Porque una cosa es autenticar usuarios existentes.
Y otra cosa muy distinta es permitir que el sistema cree usuarios nuevos sin cometer errores graves como:

- guardar contraseñas en texto plano
- permitir usernames o emails duplicados
- aceptar datos inválidos
- asignar roles de forma peligrosa
- crear cuentas inconsistentes o mal inicializadas

Este tema es clave porque el registro es una de las puertas de entrada más delicadas del sistema.
Y si esa puerta está mal diseñada, después toda la seguridad queda apoyada sobre una base débil.

## Qué problema resuelve un registro seguro

Supongamos que querés un endpoint como:

```text
POST /auth/register
```

El cliente manda algo como:

```json
{
  "username": "gabriel",
  "email": "gabriel@mail.com",
  "password": "miClave"
}
```

A primera vista podría parecer algo simple:

- recibís datos
- creás usuario
- guardás en la base
- devolvés respuesta

Pero muy rápido aparecen preguntas importantes:

- ¿username es válido?
- ¿email está bien formado?
- ¿ya existe alguien con ese username o email?
- ¿la contraseña cumple mínimos razonables?
- ¿se guarda en texto plano o como hash?
- ¿qué rol inicial recibe el usuario?
- ¿la cuenta arranca activa o pendiente de verificación?
- ¿qué devolvés en la respuesta?

Ese conjunto de preguntas muestra que registrar usuarios no es solo “persistir una entidad más”.

## Qué suele necesitar un registro mínimamente sano

En la mayoría de los sistemas, un registro de usuario necesita al menos:

- validación de entrada
- control de unicidad
- hashing de contraseña
- inicialización consistente de estado de cuenta
- asignación segura de roles por defecto
- respuesta cuidada sin exponer datos sensibles

Estas piezas ya te permiten construir un flujo bastante serio.

## Paso 1: definir un request claro

Un primer DTO razonable podría ser algo como:

```java
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank
    @Size(min = 3, max = 40)
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
```

Esto ya comunica bastante bien:

- qué entra
- qué restricciones mínimas se esperan
- qué campos forman parte del contrato de registro

## Por qué conviene validar desde la entrada

Porque cuanto antes detectes requests inválidas, más claro y seguro se vuelve el flujo.

Por ejemplo:

- username vacío
- email inválido
- password demasiado corta

son problemas que muchas veces conviene rechazar antes de llegar siquiera a la lógica más profunda del service.

Esto no reemplaza otras validaciones de negocio, pero sí mejora muchísimo la higiene del endpoint.

## Qué validaciones suelen ser razonables

Depende del sistema, claro.
Pero muchas veces tiene sentido pensar en cosas como:

### Username
- no vacío
- largo mínimo y máximo
- quizá ciertas restricciones de caracteres

### Email
- no vacío
- formato válido
- unicidad

### Password
- no vacía
- longitud mínima razonable
- eventualmente políticas más fuertes si el sistema lo requiere

No hace falta que conviertas esto en un monstruo de validación desde el primer día.
Pero sí conviene tener un piso razonable.

## Paso 2: definir una respuesta segura

Por ejemplo:

```java
public class RegisterResponse {

    private Long id;
    private String username;
    private String email;
    private boolean activo;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}
```

Fijate que acá no aparece:

- `password`
- `passwordHash`
- roles internos si no querés exponerlos
- datos sensibles innecesarios

Esto es muy importante.
El registro no debería devolver secretos del modelo de seguridad.

## Paso 3: el repository necesita consultas de unicidad

Por ejemplo:

```java
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
```

Esto ya te da una base muy buena para validar conflictos antes de persistir.

## Por qué la unicidad importa tanto

Porque si permitís duplicados en el identificador de login, el proceso de autenticación se vuelve ambiguo o directamente incorrecto.

Por ejemplo:

- dos usuarios con mismo username
- dos cuentas con mismo email si el login usa email
- identidades duplicadas difíciles de resolver

Por eso la unicidad no es solo una cuestión estética o de datos prolijos.
Es una condición central para seguridad y consistencia del sistema.

## Qué conflictos suele haber que revisar

Normalmente, al menos:

- username ya existente
- email ya existente

Y según el sistema, puede que uno de esos dos sea el identificador de login principal y el otro sea dato complementario.
Pero en ambos casos, muchas veces conviene proteger unicidad.

## Unas excepciones de negocio razonables

```java
public class UsernameDuplicadoException extends RuntimeException {

    public UsernameDuplicadoException(String message) {
        super(message);
    }
}
```

```java
public class EmailDuplicadoException extends RuntimeException {

    public EmailDuplicadoException(String message) {
        super(message);
    }
}
```

Esto vuelve mucho más expresivo el flujo que usar excepciones genéricas vagas.

## Paso 4: usar un password encoder

Acá aparece una de las piezas más importantes del tema.

En Spring Security es muy común usar un `PasswordEncoder` para transformar la contraseña antes de guardarla.

Conceptualmente:

> el usuario manda la password en el request de registro, pero el backend nunca debería persistirla tal cual; debería codificarla o hashearla antes de guardarla.

Por ejemplo, podrías tener una dependencia así:

```java
import org.springframework.security.crypto.password.PasswordEncoder;
```

Y dentro del service usar algo como:

```java
String hash = passwordEncoder.encode(request.getPassword());
```

Ese paso es absolutamente central.

## Por qué esto es tan importante

Porque sin hashing de password, el sistema estaría guardando secretos extremadamente sensibles en forma insegura.

El registro seguro exige que el secreto original del usuario no quede persistido como texto plano.

## Un modelo de usuario razonable

Supongamos algo así:

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

Este modelo encaja muy bien con el flujo de registro seguro.

## Paso 5: construir el service de registro

Acá es donde se ve la pieza completa.

```java
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new UsernameDuplicadoException("Ya existe un usuario con ese username");
        }

        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new EmailDuplicadoException("Ya existe un usuario con ese email");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setEmail(request.getEmail());
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuario.setActivo(true);
        usuario.getRoles().add("USER");

        Usuario guardado = usuarioRepository.save(usuario);

        RegisterResponse response = new RegisterResponse();
        response.setId(guardado.getId());
        response.setUsername(guardado.getUsername());
        response.setEmail(guardado.getEmail());
        response.setActivo(guardado.isActivo());

        return response;
    }
}
```

Este flujo ya se parece muchísimo a un registro real y sano.

## Cómo leer este service

Podés leerlo así:

1. valida duplicado de username
2. valida duplicado de email
3. crea usuario nuevo
4. transforma password en hash
5. inicializa estado activo
6. asigna rol por defecto
7. guarda
8. devuelve response segura

Esta secuencia resume muy bien lo que esperás de un registro serio.

## Por qué asignar `USER` por defecto suele tener sentido

Porque normalmente un usuario nuevo no debería decidir libremente su rol administrativo en el momento del registro.

En la enorme mayoría de los sistemas, eso sería peligrosísimo.

Lo más razonable suele ser algo como:

- al registrarse, recibe rol `USER`
- roles más altos como `ADMIN` o `MODERATOR` se asignan por procesos internos, seeds o administración controlada

Este punto es muy importante.
El registro no debería ser una puerta de autoescalamiento de privilegios.

## Qué no debería mandar normalmente el cliente en el register

Por ejemplo, en la mayoría de los casos no conviene que el request de registro permita algo como:

```json
{
  "username": "gabriel",
  "email": "gabriel@mail.com",
  "password": "12345678",
  "roles": ["ADMIN"]
}
```

Eso sería un diseño muy riesgoso si no está hipercontrolado.

Para un registro común, lo habitual es que los roles administrativos no vengan del cliente.

## Un controller razonable

```java
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.status(201).body(response);
    }
}
```

Este controller queda bastante limpio y claro:

- recibe request
- valida
- delega al service
- devuelve `201 Created`

## Qué papel juega `PasswordEncoder` concretamente

Es la pieza que encapsula la transformación segura de la password.

En lugar de hacer algo manual o improvisado, delegás esta responsabilidad en un componente diseñado para ese propósito.

Eso hace el código mucho más seguro y más alineado con Spring Security.

## Un ejemplo de configuración conceptual

Más adelante verás más detalle, pero conceptualmente suele aparecer algo como:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityBeansConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

Lo importante por ahora no es memorizar la clase exacta solamente, sino entender que:

> el hashing de password no debería quedar hardcodeado a mano en cualquier parte; suele definirse como componente reutilizable del sistema.

## Qué relación tiene esto con el login

Total.

Porque después, cuando el usuario intente autenticarse, Spring Security comparará la password enviada en login contra el hash persistido.

Eso significa que:

- registrar bien la password
- y verificar bien la password

son dos caras del mismo sistema.

Si registrás mal, el login también queda mal.

## Qué relación tiene esto con JWT

Muy directa.

En un flujo típico con JWT:

1. el usuario se registra
2. queda persistido correctamente con password hasheada y rol seguro
3. luego puede hacer login
4. login autentica contra ese usuario
5. si todo da bien, se emite el token

Es decir, el registro es una de las bases sobre las que después funciona toda la autenticación tokenizada.

## Qué relación tiene esto con validación de negocio adicional

Muy fuerte.

Además de validaciones básicas del DTO, podrías necesitar cosas como:

- longitud mínima real del username
- restricciones de caracteres
- normalización de email
- políticas mínimas de password
- verificación de email obligatoria antes de activar cuenta
- aceptación de términos
- bloqueo de dominios o usernames reservados

No hace falta meter todo desde el primer día.
Pero sí conviene entender que el registro es un punto donde suelen vivir varias reglas sensibles.

## Un primer enfoque sano

Podés empezar razonablemente con:

- `@Valid` para forma básica de entrada
- unicidad de username y email
- password hashing
- rol `USER` por defecto
- cuenta activa o pendiente según tu diseño
- response sin datos sensibles

Eso ya es una base muy buena.

## Qué pasa con cuentas pendientes de verificación

En algunos sistemas, registrarse no significa quedar activo de inmediato.

Podría existir un flujo donde:

- se crea la cuenta
- queda inactiva o pendiente
- recién al verificar email pasa a activa

No hace falta que lo implementes ya mismo, pero conviene ver que el diseño del registro puede dialogar con el estado de cuenta.

Por eso `activo` o estado similar es tan importante en el modelo del usuario.

## Qué relación tiene esto con tests

Muchísima.

Un registro seguro da lugar a tests muy valiosos como:

- username duplicado → conflicto
- email duplicado → conflicto
- request inválido → `400`
- registro exitoso → `201`
- password persistida no coincide con texto plano
- rol inicial asignado correctamente
- no se exponen datos sensibles en la respuesta

Esto muestra otra vez que seguridad también atraviesa el testing.

## Un ejemplo conceptual de test útil de service

Podrías querer verificar algo como:

- si el username ya existe, no guarda
- si el email ya existe, no guarda
- si todo sale bien, llama a `passwordEncoder.encode(...)`
- asigna rol `USER`
- persiste usuario activo

Es decir, el registro también es una feature de negocio y seguridad al mismo tiempo.

## Qué no conviene hacer

No conviene:

- guardar password en texto plano
- permitir que el cliente elija roles peligrosos en el register
- devolver password o hash en la response
- no validar duplicados
- mezclar demasiado el register con concerns que no le pertenecen

Es un endpoint sensible.
Merece bastante más cuidado que una simple creación genérica de recurso.

## Otro error común

Creer que porque el DTO valida `@Size(min = 8)` ya está resuelto todo el tema de seguridad de la password.

Eso ayuda, sí.
Pero no reemplaza:

- hashing
- manejo correcto del login
- protección del flujo completo
- no exponer información sensible

Conviene ver la validación como una pieza, no como toda la solución.

## Otro error común

Usar el mismo DTO de registro como entidad o como response.

Eso mezcla demasiadas responsabilidades y aumenta el riesgo de filtrar campos sensibles o de acoplar mal el diseño.

## Otro error común

No pensar la unicidad como parte central del modelo de seguridad.

Si el sistema autentica por username o email, esos datos no son “solo datos comunes”.
Son parte de la identidad del usuario.

## Una buena heurística

Podés preguntarte:

- ¿qué datos debe poder mandar alguien que se registra?
- ¿qué datos nunca debería poder decidir el cliente?
- ¿qué campos deben ser únicos?
- ¿cómo convierto la password en una forma segura de persistencia?
- ¿qué rol inicial tiene sentido?
- ¿la cuenta queda activa o pendiente?

Responder eso te ordena muchísimo el diseño del register.

## Qué relación tiene esto con el dominio real

Muy fuerte.

Porque el registro no es solo un formulario técnico.
Es el momento en que una nueva identidad entra al sistema.

Y eso afecta luego:

- autenticación
- autorización
- ownership
- `/me`
- JWT
- auditoría
- trazabilidad de usuario

Por eso esta pieza merece un diseño cuidado.

## Relación con Spring Security

Spring Security no resuelve automáticamente por vos todo el flujo de registro, porque registrar una cuenta nueva es más una responsabilidad de la aplicación que del mecanismo puro de autenticación del framework.

Pero sí te da piezas fundamentales para hacerlo bien, como:

- `PasswordEncoder`
- integración posterior con `UserDetailsService`
- roles
- flujo coherente con autenticación y autorización

Eso hace que registro y seguridad queden fuertemente conectados.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> registrar usuarios nuevos de forma segura implica mucho más que guardar un username y una password: requiere validar entrada, proteger unicidad, hashear la contraseña antes de persistir, asignar roles iniciales seguros y devolver una respuesta limpia que no exponga datos sensibles del modelo de autenticación.

## Resumen

- El registro es una de las puertas más sensibles del sistema.
- Un request de registro suele necesitar validación de forma y de negocio.
- Username y email suelen requerir unicidad.
- La password debe convertirse a hash antes de persistirse.
- El cliente no debería poder autoasignarse roles peligrosos como ADMIN.
- La respuesta del register no debería exponer secretos ni hashes.
- Este tema conecta de forma muy fuerte el modelo de usuario con una creación de cuentas realmente segura.

## Próximo tema

En el próximo tema vas a ver cómo construir el login propiamente dicho y devolver un JWT, que es el paso natural después de tener usuarios registrados correctamente y listos para autenticarse.
