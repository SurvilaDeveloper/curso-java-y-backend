---
title: "Refresh tokens"
description: "Qué son los refresh tokens, por qué se usan junto con JWT y cómo ayudan a construir una autenticación más cómoda y segura en APIs modernas."
order: 51
module: "Seguridad"
level: "intermedio"
draft: false
---

## Introducción

En las lecciones anteriores viste varias piezas importantes de seguridad:

- Spring Security
- JWT
- protección de endpoints
- roles
- autenticación stateless

Eso ya te permite entender muy bien cómo funciona una API protegida con tokens.

Pero cuando pasás de una implementación básica a una más realista, aparece un problema práctico importante:

**¿qué hacés cuando el access token vence?**

Ahí entran los refresh tokens.

## Qué es un refresh token

Un refresh token es un token especial usado para obtener un nuevo access token sin obligar al usuario a volver a loguearse inmediatamente.

Dicho simple:

- el usuario inicia sesión
- recibe un access token
- también recibe un refresh token
- cuando el access token vence, el cliente usa el refresh token para pedir uno nuevo

## La idea general

Con JWT suele ser sano que el access token tenga una vida corta.

¿Por qué?

Porque si un token robado vive demasiado tiempo, el riesgo aumenta.

Pero si hacés que viva muy poco, aparece otro problema:

- el usuario tendría que volver a loguearse demasiado seguido

Los refresh tokens ayudan a equilibrar:

- seguridad
- experiencia de uso

## Access token vs refresh token

Conviene distinguirlos muy bien.

## Access token

Se usa para acceder a endpoints protegidos.

Suele:

- vivir menos tiempo
- viajar en el header `Authorization`
- ser validado en cada request protegida

## Refresh token

Se usa para obtener un nuevo access token.

Suele:

- vivir más tiempo que el access token
- usarse solo en un flujo específico de renovación
- no mandarse en todas las requests normales

## Diferencia mental útil

Podés pensarlo así:

- access token = llave corta para entrar a la API
- refresh token = llave especial para conseguir una nueva llave corta

## Qué problema resuelve

Los refresh tokens resuelven algo muy importante en autenticación moderna:

permiten que el usuario siga usando la app sin tener que loguearse de nuevo cada vez que vence el access token, pero sin necesidad de dar vida larguísima al token principal.

## Flujo básico con refresh tokens

Un flujo típico es este:

1. el usuario hace login
2. el backend valida credenciales
3. el backend devuelve:
   - access token
   - refresh token
4. el cliente usa el access token para llamadas normales
5. el access token vence
6. el cliente llama a un endpoint de refresh
7. el backend valida el refresh token
8. el backend emite un nuevo access token
9. el cliente sigue operando sin pedir login otra vez

## Qué ventaja tiene esto

Permite una autenticación más cómoda para el usuario, sin depender de access tokens demasiado largos.

## Por qué no usar solo un access token larguísimo

Podrías pensar:
“¿por qué no hago que el access token dure muchísimo y listo?”

Porque eso empeora seguridad.

Si alguien roba ese token, podría usarlo durante mucho tiempo.

Por eso suele ser más sano:

- access token corto
- refresh token controlado

## Ejemplo mental de tiempos

Por ejemplo:

- access token → 15 minutos
- refresh token → 7 días

No es una ley universal.
Es solo una intuición bastante común.

## Dónde se usa cada uno

### Access token

Suele viajar así:

```text
Authorization: Bearer <access-token>
```

### Refresh token

Suele usarse solo en un endpoint de renovación, por ejemplo:

```text
POST /auth/refresh
```

## Ejemplo de login

### Request

```http
POST /auth/login
Content-Type: application/json

{
  "username": "gabriel",
  "password": "1234"
}
```

### Response

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

## Qué hace el cliente después

- guarda ambos tokens
- usa el access token para endpoints protegidos
- usa el refresh token solo cuando necesita renovar

## Endpoint de refresh

Un diseño común es tener algo como:

```text
POST /auth/refresh
```

con un body como:

```json
{
  "refreshToken": "..."
}
```

Y la respuesta podría ser:

```json
{
  "accessToken": "nuevo-access-token"
}
```

A veces también se devuelve un nuevo refresh token, dependiendo de la estrategia.

## Estrategias posibles

Acá hay varias decisiones posibles.

Por ejemplo:

### Estrategia simple

- el refresh token dura bastante
- se reutiliza hasta que venza

### Estrategia rotativa

- cada refresh genera un nuevo refresh token
- el anterior deja de ser válido

La segunda suele ser más robusta, aunque también más compleja.

## Por qué la rotación puede ser mejor

Porque reduce ciertos riesgos.

Si un refresh token es robado y se reutiliza, una estrategia de rotación puede ayudar a detectar o limitar mejor ese problema.

## Refresh token y almacenamiento

Un tema importante es dónde guarda el cliente los tokens.

No hace falta entrar en todos los detalles frontend ahora, pero sí entender que:

- access token y refresh token no son “cosas mágicas”
- su almacenamiento influye bastante en seguridad

Por eso, el diseño completo no termina solo en el backend.

## Refresh token en base de datos

En sistemas más serios, muchas veces no alcanza con generar refresh tokens sin más.

A menudo conviene persistirlos o al menos llevar cierto control sobre ellos.

Por ejemplo, podrías guardar cosas como:

- token
- usuario asociado
- fecha de expiración
- revocado o no
- creado en tal fecha

## Por qué guardar refresh tokens

Porque eso permite más control sobre:

- revocación
- logout real
- invalidación selectiva
- rotación
- sesiones múltiples por usuario
- auditoría básica

## Ejemplo conceptual de entidad

```java
public class RefreshToken {
    private Long id;
    private String token;
    private Long userId;
    private LocalDateTime expiresAt;
    private boolean revoked;

    public RefreshToken(Long id, String token, Long userId, LocalDateTime expiresAt, boolean revoked) {
        this.id = id;
        this.token = token;
        this.userId = userId;
        this.expiresAt = expiresAt;
        this.revoked = revoked;
    }

    public Long getId() {
        return id;
    }

    public String getToken() {
        return token;
    }

    public Long getUserId() {
        return userId;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public boolean isRevoked() {
        return revoked;
    }
}
```

## Qué muestra esto

Que un refresh token puede formar parte del modelo persistente del sistema y no solo existir “en el aire”.

## Refresh tokens y logout

Este punto es especialmente importante.

Con JWT simples y stateless, el logout puede ser ambiguo porque el access token sigue siendo válido hasta expirar.

Con refresh tokens persistidos, podés construir mejor un logout real.

Por ejemplo:

- marcar refresh token como revocado
- impedir que vuelva a renovar access tokens
- invalidar cierta sesión

## Qué no resuelve solo

Aunque revoques el refresh token, un access token ya emitido puede seguir vivo hasta vencer.

Por eso sigue siendo importante que el access token no tenga una duración exagerada.

## Refresh token y revocación

Una estrategia madura suele contemplar cosas como:

- refresh token revocado
- refresh token vencido
- refresh token no encontrado
- refresh token reutilizado indebidamente
- cierre de sesión en uno o varios dispositivos

## Flujo conceptual con persistencia

Un flujo más serio podría verse así:

1. login exitoso
2. crear access token corto
3. crear refresh token persistido
4. devolver ambos
5. cliente usa access token
6. cuando vence, manda refresh token
7. backend verifica:
   - existe
   - no venció
   - no está revocado
   - pertenece a un usuario válido
8. backend genera nuevo access token
9. opcionalmente rota refresh token

## Endpoint de refresh conceptual

```java
@RestController
@RequestMapping("/auth")
public class AuthController {

    @PostMapping("/refresh")
    public AuthResponse refresh(@RequestBody RefreshTokenRequest request) {
        // validar refresh token
        // emitir nuevo access token
        return new AuthResponse("nuevo-access-token");
    }
}
```

## DTO de request

```java
public class RefreshTokenRequest {
    private String refreshToken;

    public RefreshTokenRequest() {
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
```

## DTO de response

```java
public class AuthResponse {
    private String accessToken;
    private String refreshToken;

    public AuthResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }
}
```

## Qué podría devolver el refresh endpoint

Depende de la estrategia.

### Opción simple

Solo nuevo access token:

```json
{
  "accessToken": "..."
}
```

### Opción más robusta

Nuevo access token + nuevo refresh token:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

## Qué conviene elegir

Para aprendizaje inicial, una estrategia simple puede ser suficiente.

Para un proyecto más serio, la rotación de refresh tokens suele ser una idea mejor.

## Refresh token y seguridad real

Los refresh tokens suelen ser especialmente sensibles porque permiten prolongar sesiones.

Por eso conviene tratarlos con bastante cuidado.

No deberían manejarse de forma descuidada ni vivir eternamente sin control.

## Cuándo responde error el refresh endpoint

Puede fallar por varias razones:

- token faltante
- token inválido
- token vencido
- token revocado
- token malformado
- usuario ya no válido

En esos casos, lo razonable suele ser algo como:

- `401 Unauthorized`

o según diseño concreto de la API.

## Diferencia entre token vencido y credencial inválida

A nivel de UX y seguridad, conviene que el sistema tenga criterios claros sobre qué hacer cuando:

- el access token venció
- el refresh token venció
- el refresh token fue revocado
- el usuario cambió credenciales
- la sesión ya no debería mantenerse

## Cambios de contraseña y refresh tokens

Un caso interesante es:

**¿qué pasa si el usuario cambia su contraseña?**

En muchos sistemas, eso puede implicar invalidar refresh tokens existentes para obligar a una nueva autenticación limpia.

Eso es una decisión de seguridad bastante razonable en muchos escenarios.

## Múltiples dispositivos

Otro tema importante:

¿querés permitir varias sesiones a la vez en distintos dispositivos?

Si sí, entonces probablemente necesites modelar refresh tokens de forma que puedas tener varios activos por usuario.

Si no, podrías invalidar el anterior al crear uno nuevo.

Ambas estrategias son válidas según el tipo de producto.

## Refresh token y cookies

En ciertos diseños, el refresh token se manda o guarda en cookies seguras en lugar de exponerlo como JSON crudo al cliente.

No hace falta profundizar todo eso ahora, pero conviene saber que el diseño puede variar bastante según frontend, seguridad y arquitectura elegida.

## Refresh tokens y Spring Security

Refresh tokens no reemplazan Spring Security.

Se integran con él.

Spring Security sigue protegiendo endpoints, mientras tu lógica de autenticación maneja:

- login
- emisión de tokens
- verificación
- renovación

## Qué piezas reales suele haber

En una implementación real suelen aparecer cosas como:

- `JwtService`
- `AuthService`
- `RefreshTokenService`
- `AuthController`
- entidad o almacenamiento de refresh token
- filtros de seguridad
- repositorio para refresh tokens

## Ejemplo conceptual de service

```java
@Service
public class RefreshTokenService {

    public boolean isValid(RefreshToken token) {
        return !token.isRevoked() && token.getExpiresAt().isAfter(LocalDateTime.now());
    }
}
```

## Qué demuestra este ejemplo

Que la lógica de refresh token no es solo “generar strings”.

También implica reglas de negocio y de seguridad.

## Refresh token y experiencia de usuario

Desde la perspectiva del usuario, los refresh tokens ayudan a que la sesión se sienta continua.

Desde la perspectiva del backend, ayudan a no depender de access tokens larguísimos.

Esa combinación es justamente lo valioso del patrón.

## Buenas prácticas iniciales

## 1. No hacer que el access token viva demasiado

Mejor mantenerlo relativamente corto.

## 2. No dejar refresh tokens sin expiración razonable

También deben tener límites.

## 3. Considerar persistencia y revocación

Especialmente en proyectos serios.

## 4. Pensar si querés rotación

Puede mejorar bastante la seguridad.

## 5. Integrarlo con logout y cambios de credenciales

Eso lo vuelve mucho más realista.

## Comparación con otros lenguajes

### Si venís de JavaScript

Probablemente ya viste flows de access token + refresh token en backends Node o frontends SPA. En Spring Boot el patrón es el mismo, pero suele integrarse con servicios, persistencia y filtros de seguridad más explícitos.

### Si venís de Python

Puede que ya hayas visto autenticación con tokens renovables en APIs. En Java y Spring Boot, la diferencia suele estar en cómo se integra con Spring Security, el modelado de persistencia y una estructura por capas bastante marcada.

## Errores comunes

### 1. Usar refresh tokens sin expiración

Eso puede volverse muy riesgoso.

### 2. No distinguir claramente access token y refresh token

Cumplen roles distintos.

### 3. Guardar o exponer refresh tokens sin cuidado

Son muy sensibles.

### 4. No pensar logout y revocación

Después la seguridad queda incompleta.

### 5. Hacer access tokens demasiado largos “para simplificar”

Eso empeora bastante el modelo de seguridad.

## Mini ejercicio

Diseñá conceptualmente una autenticación con refresh tokens para una API que tenga:

1. `POST /auth/login`
2. `POST /auth/refresh`
3. `POST /auth/logout`

Definí:

- qué devuelve login
- qué recibe refresh
- qué debería pasar en logout
- cuánto viviría el access token
- cuánto viviría el refresh token
- si guardarías refresh tokens en base o no

## Ejemplo posible

- login devuelve `accessToken` + `refreshToken`
- refresh recibe `refreshToken`
- refresh devuelve nuevo `accessToken`
- logout revoca el refresh token
- access token vive 15 minutos
- refresh token vive 7 días
- refresh token se guarda en base para poder revocarlo

## Resumen

En esta lección viste que:

- los refresh tokens se usan junto con JWT para renovar access tokens sin pedir login constante
- ayudan a combinar mejor seguridad y experiencia de usuario
- access token y refresh token cumplen roles distintos
- en proyectos serios conviene pensar en persistencia, expiración, revocación y logout
- integrar refresh tokens mejora bastante la madurez de una autenticación basada en JWT

## Siguiente tema

La siguiente natural es **observabilidad básica: logs, métricas y health checks**, porque después de construir una API bastante seria en términos de seguridad, persistencia y diseño, el siguiente paso muy valioso es aprender a mirar qué está pasando realmente cuando la aplicación corre.
