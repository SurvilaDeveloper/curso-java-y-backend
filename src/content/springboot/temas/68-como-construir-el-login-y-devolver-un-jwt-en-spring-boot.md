---
title: "Cómo construir el login y devolver un JWT en Spring Boot"
description: "Entender cómo diseñar el flujo de login en Spring Boot para validar credenciales y devolver un JWT, y por qué este endpoint conecta registro, autenticación, Spring Security y seguridad basada en tokens."
order: 68
module: "Seguridad con Spring Security"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo registrar usuarios nuevos de forma segura con:

- validación
- unicidad
- password hashing
- roles iniciales razonables
- respuestas limpias sin exponer datos sensibles

Eso te dejó una base muy importante:
ya tenés usuarios bien creados y listos para participar del sistema de seguridad.

Ahora toca el paso siguiente y completamente natural:

> permitir que un usuario existente se autentique correctamente y reciba un JWT para usar en requests posteriores.

Este tema es clave porque conecta varias piezas que venías viendo por separado:

- usuario autenticable
- `UserDetails`
- `UserDetailsService`
- `PasswordEncoder`
- JWT
- endpoint `/auth/login`
- seguridad basada en token

Acá el backend deja de solo “tener usuarios guardados” y pasa a resolver un flujo real de autenticación.

## Qué problema resuelve el login

Supongamos que el usuario ya existe en la base y tiene:

- username o email
- password almacenada como hash
- roles
- estado de cuenta

Ahora quiere usar la API.

La pregunta es:

> ¿cómo demuestra quién es y cómo obtiene una credencial válida para el resto de sus requests?

Eso es exactamente lo que resuelve el login.

En un esquema con JWT, el flujo general es:

1. el usuario manda credenciales
2. el backend valida que sean correctas
3. si son válidas, genera un token
4. devuelve ese token
5. el cliente lo usa en requests posteriores

Ese es el corazón del tema.

## Qué debería recibir un endpoint de login

Como mínimo, el login suele necesitar:

- identidad de acceso
- secreto de acceso

Por ejemplo:

- username + password
- o email + password

Un request razonable podría ser algo como:

```java
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
```

Este DTO ya comunica bastante bien el contrato mínimo de autenticación.

## Por qué conviene tener un DTO específico de login

Porque login no es lo mismo que:

- registro
- actualización de usuario
- response de perfil
- entidad persistida

El login tiene una intención muy concreta:
recibir credenciales.

Entonces conviene que el contrato sea explícito y pequeño.

## Qué debería devolver el login

En un flujo con JWT, normalmente el login exitoso devuelve un token.

Por ejemplo:

```java
public class LoginResponse {

    private String token;
    private String type = "Bearer";

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }
}
```

Otra variante posible podría incluir más cosas, como:

- username
- roles
- expiración
- refresh token en diseños más avanzados

Pero como punto de partida, token + tipo ya es bastante razonable.

## Qué no debería devolver el login

Normalmente no conviene devolver cosas como:

- password
- passwordHash
- datos internos innecesarios
- secretos adicionales del modelo de seguridad
- estado interno del encoder o implementación

La respuesta debería centrarse en lo que el cliente necesita para seguir autenticado.

## Qué validaciones conceptuales tiene que hacer el login

A grandes rasgos, un login serio necesita verificar:

- que exista el usuario
- que la cuenta pueda autenticarse
- que la password enviada coincida con la persistida de forma segura
- que, si todo es válido, se genere el token correcto

Es decir, el login no consiste en “buscar usuario y listo”.
Hay una validación real de credenciales.

## Por qué el login no compara password con equals()

Este punto es importantísimo.

Como la password persistida está almacenada como hash, el backend no debería hacer algo ingenuo como:

```java
if (request.getPassword().equals(usuario.getPasswordHash()))
```

Eso estaría conceptualmente mal.

Lo correcto es usar el mismo mecanismo de verificación compatible con el hash, normalmente a través de `PasswordEncoder`.

Por ejemplo:

```java
passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())
```

Esta idea es central para entender el login correctamente.

## Qué papel cumple PasswordEncoder en el login

En el registro, `PasswordEncoder` transformaba la password antes de guardarla.

En el login, ahora cumple la otra mitad del trabajo:

> comparar la password enviada por el usuario contra el hash persistido sin necesidad de guardar ni usar la password original en texto plano.

Eso muestra por qué registro y login están tan conectados.

## Un ejemplo de servicio de login

Podrías imaginar algo así:

```java
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new CredencialesInvalidasException("Credenciales inválidas"));

        if (!usuario.isActivo()) {
            throw new CuentaInactivaException("La cuenta está inactiva");
        }

        boolean passwordValida = passwordEncoder.matches(
                request.getPassword(),
                usuario.getPasswordHash()
        );

        if (!passwordValida) {
            throw new CredencialesInvalidasException("Credenciales inválidas");
        }

        String token = jwtService.generarToken(usuario);

        LoginResponse response = new LoginResponse();
        response.setToken(token);

        return response;
    }
}
```

Este ejemplo ya junta muchas piezas importantes del bloque de seguridad.

## Cómo leer este service

Podés leerlo así:

1. buscar usuario por identidad de login
2. si no existe, rechazar
3. si está inactivo, rechazar
4. validar password usando encoder
5. si es incorrecta, rechazar
6. generar JWT
7. devolver response con token

Ese flujo es exactamente lo que esperás de un login básico serio con JWT.

## Por qué el mensaje “credenciales inválidas” suele ser una buena idea

Muchas veces conviene no distinguir demasiado entre:

- “no existe ese usuario”
- “la password es incorrecta”

porque dar demasiado detalle puede ayudar a un atacante a inferir información sobre cuentas existentes.

Entonces, desde el punto de vista del contrato público, una respuesta genérica como:

- credenciales inválidas

suele ser una decisión bastante sana.

No significa que internamente no sepas qué pasó.
Significa que no exponés más de la cuenta.

## Qué pasa si la cuenta está inactiva

Ese es otro caso importante.

Podrías tener una regla como:

- el usuario existe
- la password es correcta
- pero la cuenta no está habilitada

En ese caso, el login no debería tratarse como exitoso.

Este punto muestra por qué modelar `activo` o estado de cuenta en el usuario era tan importante en temas anteriores.

## Qué papel cumple JwtService acá

`JwtService` o componente equivalente encapsula la lógica específica del token.

Por ejemplo, podría tener algo como:

```java
public class JwtService {

    public String generarToken(Usuario usuario) {
        // construir token con datos del usuario
        return "...";
    }
}
```

Más adelante podrás profundizar más en claims, expiración y firma.
Pero en este tema alcanza con fijar esta idea:

> el login, una vez autenticado el usuario, delega en un componente específico la construcción del token.

Eso mantiene más limpio el service.

## Por qué conviene separar la generación del token

Porque si mezclás demasiada lógica JWT dentro del login, el código se vuelve más difícil de leer, testear y mantener.

Separarlo en algo como `JwtService` ayuda a que el flujo del login se entienda mejor:

- validar credenciales
- generar token
- responder

Esa separación suele ser bastante sana.

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

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
```

Este controller es muy limpio:

- recibe credenciales
- valida forma básica
- delega al service
- devuelve token

Eso es exactamente lo que querés.

## Qué código HTTP suele devolver un login exitoso

Normalmente:

- `200 OK`

porque el recurso principal que estás devolviendo es el resultado de una autenticación exitosa.

No estás creando una entidad de dominio persistente nueva como en register.
Estás devolviendo una credencial usable para futuras requests.

## Qué pasa después de un login exitoso

Si el login fue bien, el cliente ahora tiene algo así:

```json
{
  "token": "eyJhbGciOi...",
  "type": "Bearer"
}
```

Entonces, para la próxima request protegida, el cliente mandará algo como:

```text
Authorization: Bearer eyJhbGciOi...
```

Y ahí entra en juego todo el flujo JWT que viste en el tema anterior.

Esto muestra cómo login y requests autenticadas están completamente conectados.

## Qué relación tiene esto con UserDetailsService

Muy fuerte.

En una implementación más integrada con Spring Security, el proceso de login puede apoyarse en:

- `UserDetailsService`
- `UserDetails`
- `PasswordEncoder`
- `AuthenticationManager` o flujo equivalente según el diseño

No hace falta que ahora metas todas esas piezas a la vez en un solo mensaje mental.
Lo importante primero es entender el caso de uso:

> autenticar credenciales y devolver token.

Después, a medida que avances, verás distintas formas de integrarlo más profundamente con la maquinaria del framework.

## Qué relación tiene esto con roles

También muy fuerte.

Porque al generar el token, muchas veces el backend necesita conocer:

- username
- roles
- id
- u otra identidad relevante

Eso significa que el login no solo autentica.
También prepara el contexto que luego permitirá reglas como:

- `hasRole("ADMIN")`
- `hasAnyRole("USER", "MODERATOR")`

Por eso el usuario autenticable y sus roles estaban tan bien posicionados en los temas anteriores.

## Un ejemplo de flujo completo

Podés pensar el caso completo así:

1. usuario se registró previamente
2. su password quedó hasheada
3. su cuenta existe con rol `USER`
4. manda login con username y password
5. el backend busca al usuario
6. compara password contra hash
7. si es válido, genera JWT
8. cliente guarda el token
9. cliente lo manda en requests futuras
10. el backend lo usa para reconstruir autenticación

Este flujo ya representa una API con autenticación real bastante seria.

## Qué pasa si el usuario no existe

En ese caso, el login debería rechazar la autenticación.

Una excepción razonable podría ser:

```java
public class CredencialesInvalidasException extends RuntimeException {

    public CredencialesInvalidasException(String message) {
        super(message);
    }
}
```

Y muchas veces, como ya vimos, conviene usar el mismo mensaje general también para password incorrecta.

## Qué pasa si la password es incorrecta

El resultado debería ser también autenticación fallida.

No debería generarse token.
No debería tratarse la request como exitosa.
No debería filtrarse demasiada información sobre cuál fue exactamente el fallo.

## Qué pasa si la cuenta está bloqueada o inactiva

También debería fallar el login.

Esto es importante porque la autenticación no depende solo de “conocer bien username y password”.
También depende del estado de la cuenta.

## Qué relación tiene esto con `/me`

Muy directa.

Porque solo después de tener login exitoso y token válido, el cliente puede hacer algo como:

```text
GET /usuarios/me
Authorization: Bearer ...
```

Eso muestra que `/me`, ownership y usuario actual dependen completamente de que el login y el token estén bien resueltos.

## Qué relación tiene esto con testing

Muchísima.

Un flujo de login serio da lugar a tests muy importantes como:

- request inválido → `400`
- usuario inexistente → rechazo
- password incorrecta → rechazo
- cuenta inactiva → rechazo
- credenciales válidas → `200` y token
- response no expone campos indebidos

También podrías probar a nivel de service cosas como:

- se llama a `passwordEncoder.matches(...)`
- no se genera token si la password falla
- sí se genera token cuando todo es correcto

Esto hace del login una feature excelente para practicar testing con seguridad.

## Qué no conviene hacer

No conviene:

- comparar password hasheada con `equals()` de forma ingenua
- devolver demasiada información sobre si falló username o password
- devolver datos sensibles extra en la response
- generar token aunque la cuenta esté inactiva
- mezclar el login con otras responsabilidades irrelevantes

El endpoint de login tiene una responsabilidad muy concreta.
Conviene mantenerla clara.

## Otro error común

Pensar que el login “busca usuario y listo”.

No.
Lo importante es verificar correctamente la identidad y el estado de la cuenta antes de emitir el token.

## Otro error común

No encapsular la generación de JWT y terminar con controllers o services repletos de detalles técnicos del token.

Separar esa responsabilidad suele ser una decisión bastante sana.

## Otro error común

No usar validación mínima en el request de login.

Aunque la lógica fuerte del login está en credenciales y token, igual conviene que el DTO tenga una forma razonable y que el endpoint no acepte cuerpos absurdamente incompletos sin control.

## Una buena heurística

Podés preguntarte:

- ¿cómo identifico al usuario en login?
- ¿cómo verifico la password contra el hash?
- ¿qué pasa si la cuenta no está activa?
- ¿qué componente genera el token?
- ¿qué devuelvo al cliente?
- ¿qué información conviene no revelar en errores?

Responder eso te ordena muchísimo el diseño del login.

## Qué relación tiene esto con una API real

Muy fuerte.

Porque una API protegida con JWT casi siempre necesita un endpoint de login que haga exactamente este trabajo.

No es una pieza ornamental.
Es una de las puertas más centrales de todo el backend seguro.

## Relación con Spring Security

Spring Security te da las herramientas fundamentales para que este flujo se construya bien, especialmente en cosas como:

- verificación de password con encoder
- integración con usuarios autenticables
- carga de identidad y roles
- posterior uso del token dentro del pipeline de seguridad

Este tema es una bisagra enorme entre “tener seguridad modelada” y “tener un acceso real funcionando”.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> construir el login con JWT en Spring Boot implica recibir credenciales, validar usuario, estado de cuenta y password de forma segura, y recién entonces emitir un token que el cliente usará en requests posteriores para autenticarse frente al backend.

## Resumen

- El login resuelve cómo un usuario existente obtiene una credencial válida para seguir usando la API.
- Un flujo sano de login busca al usuario, valida estado de cuenta y compara la password con `PasswordEncoder`.
- Si todo sale bien, genera un JWT y lo devuelve al cliente.
- Ese token se usará luego en el header `Authorization: Bearer ...`.
- Conviene separar la lógica de generación del token en un servicio dedicado.
- La respuesta del login debe ser clara y no exponer datos sensibles innecesarios.
- Este tema conecta registro, usuario autenticable, Spring Security y JWT en un caso de uso real de autenticación.

## Próximo tema

En el próximo tema vas a ver cómo se valida el JWT en cada request usando un filtro de seguridad, que es la otra mitad del sistema: no solo emitir el token, sino leerlo correctamente cuando el cliente vuelve con él.
