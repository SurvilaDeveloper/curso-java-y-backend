---
title: "JWT"
description: "Qué es JWT, cómo funciona y por qué se usa tanto para autenticación stateless en APIs modernas con Spring Boot."
order: 41
module: "Seguridad"
level: "intermedio"
draft: false
---

## Introducción

En la lección anterior viste Spring Security, o sea, el framework que permite proteger rutas, autenticar usuarios y manejar permisos dentro de una aplicación Spring Boot.

Eso te dio una base muy importante para entender seguridad en el backend.

Ahora aparece una tecnología que se usa muchísimo en APIs modernas:

**JWT**

JWT suele aparecer cuando querés autenticación stateless, especialmente en APIs consumidas por:

- frontends desacoplados
- apps móviles
- SPAs
- clientes externos
- microservicios

## Qué es JWT

JWT significa:

**JSON Web Token**

Es un formato de token que permite transportar información firmada entre cliente y servidor.

Dicho simple:

- el usuario se autentica
- el servidor genera un token
- el cliente guarda ese token
- el cliente lo envía en requests posteriores
- el servidor lo valida y decide si permitir acceso

## La idea general

En vez de mantener una sesión clásica del lado del servidor para cada usuario, JWT permite que el cliente lleve consigo un token que representa su autenticación.

Eso encaja muy bien con APIs REST y con la idea de que HTTP sea stateless.

## Qué significa “stateless” en este contexto

Significa que el servidor no necesita recordar una sesión específica del usuario en memoria para cada request.

Cada request puede venir con toda la información necesaria para autenticar al usuario, normalmente a través de un token enviado en headers.

## Flujo básico con JWT

Un flujo típico se ve así:

1. el usuario envía credenciales al backend
2. el backend valida esas credenciales
3. el backend genera un JWT
4. el cliente guarda el token
5. en cada request protegida, el cliente envía el token
6. el backend valida el token
7. si es válido, permite acceso

## Qué problema resuelve JWT

JWT ayuda a resolver varios problemas típicos de autenticación en APIs modernas:

- evitar sesiones tradicionales del lado del servidor
- facilitar autenticación stateless
- permitir que múltiples clientes usen la misma API
- hacer más natural la seguridad en frontends desacoplados
- simplificar ciertos escenarios distribuidos

## Dónde viaja normalmente el token

Lo más común es enviarlo en el header:

```text
Authorization: Bearer <token>
```

Ese formato aparece muchísimo en APIs modernas.

## Qué significa `Bearer`

Significa, básicamente:

“te presento este token como prueba de autenticación”.

No hace falta profundizar filosóficamente en la palabra; lo importante es reconocer el patrón:

```text
Authorization: Bearer eyJ...
```

## Estructura general de un JWT

Un JWT suele tener tres partes:

- header
- payload
- signature

Se ven unidas por puntos.

Ejemplo conceptual:

```text
xxxxx.yyyyy.zzzzz
```

## Header

El header suele indicar cosas como:

- tipo de token
- algoritmo usado para firmarlo

Ejemplo conceptual:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

## Payload

El payload contiene claims, o sea, información sobre el usuario o sobre el token.

Ejemplo conceptual:

```json
{
  "sub": "gabriel",
  "role": "ADMIN",
  "exp": 1712345678
}
```

## Signature

La signature sirve para verificar que el token no fue alterado y que fue emitido con la clave correcta.

Esta parte es esencial para la confianza del token.

## Importante: JWT no significa cifrado automático

Esto conviene aclararlo muy bien.

Un JWT no necesariamente está cifrado.
Normalmente está codificado y firmado.

Eso significa que:

- se puede decodificar su contenido fácilmente
- pero no debería poder modificarse sin invalidar la firma

Por eso, no conviene meter datos sensibles innecesarios dentro del payload.

## Claims

Los claims son los datos que van dentro del payload.

Ejemplos típicos:

- usuario
- roles
- fecha de expiración
- identificador del token
- issuer

## Claims comunes

### `sub`

Subject, o sea, sujeto principal del token.
Suele representar al usuario.

### `exp`

Expiration time.
Indica cuándo expira el token.

### `iat`

Issued at.
Indica cuándo fue emitido.

### `iss`

Issuer.
Indica quién emitió el token.

## Ejemplo conceptual de payload

```json
{
  "sub": "gabriel",
  "roles": ["USER", "ADMIN"],
  "exp": 1712345678
}
```

## Qué ventaja tiene eso

Que el backend puede reconstruir cierta información de autenticación a partir del token, siempre que la firma sea válida y el token no esté vencido.

## JWT y login

Un escenario típico es este:

### Request de login

```http
POST /auth/login
Content-Type: application/json

{
  "username": "gabriel",
  "password": "1234"
}
```

### Response exitosa

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI..."
}
```

## Qué hace el cliente después

El cliente guarda ese token y lo usa en requests futuras.

Por ejemplo:

```http
GET /profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...
```

## JWT y Spring Security

JWT no reemplaza a Spring Security.

Más bien, suele integrarse con Spring Security.

La idea típica es:

- Spring Security protege la aplicación
- un filtro especial lee el token JWT
- valida firma y expiración
- reconstruye autenticación
- deja al usuario autenticado dentro del contexto de seguridad

## Qué hace falta conceptualmente para usar JWT

En una implementación típica necesitás varias piezas:

- endpoint de login
- validación de credenciales
- servicio para generar tokens
- servicio para validar tokens
- filtro que lea el header Authorization
- integración con Spring Security

## Generación del token

Después de validar usuario y contraseña, el backend genera un JWT firmado.

Ese token suele contener al menos:

- identidad del usuario
- expiración
- quizás roles o claims útiles

## Validación del token

Cuando llega una request protegida con el token, el backend normalmente comprueba:

- que el token exista
- que tenga formato correcto
- que la firma sea válida
- que no esté vencido
- que represente un usuario legítimo

## Por qué la firma importa tanto

La firma impide que cualquiera modifique el payload libremente sin ser detectado.

Por ejemplo, alguien no debería poder cambiar un rol de `USER` a `ADMIN` simplemente editando el texto del token.

La firma hace que ese intento invalide el token.

## JWT y expiración

Un token no debería vivir para siempre.

Por eso es normal que tenga expiración.

Ejemplo conceptual:

```json
{
  "sub": "gabriel",
  "exp": 1712345678
}
```

## Qué pasa cuando vence

Cuando el token está vencido, el backend debería rechazarlo.

Eso normalmente termina en algo como:

- `401 Unauthorized`

y el cliente debe volver a autenticarse o renovar el token si el sistema tiene refresh tokens.

## Refresh tokens

En sistemas más completos, a veces se usan dos tipos de tokens:

- access token
- refresh token

### Access token

Vive menos tiempo y se usa para acceder a endpoints.

### Refresh token

Sirve para pedir un nuevo access token sin obligar al usuario a loguearse de nuevo inmediatamente.

No hace falta profundizar a fondo ahora, pero conviene saber que existe este patrón.

## JWT y roles

Un uso muy común es incluir roles o authorities en el token.

Por ejemplo:

```json
{
  "sub": "gabriel",
  "roles": ["ADMIN"]
}
```

Después, al validar el token, el backend puede reconstruir la autorización del usuario.

## Cuidado con meter demasiada información

Aunque técnicamente podés incluir varias cosas en un JWT, conviene evitar meter:

- información sensible innecesaria
- payloads demasiado grandes
- datos que cambian constantemente
- cosas que después te complican la invalidación

El token debería ser útil, pero también razonablemente compacto y seguro.

## JWT y logout

Este es un punto interesante.

Con sesiones tradicionales, cerrar sesión del lado servidor puede ser más directo.

Con JWT stateless, el logout puede ser más sutil porque el token sigue siendo válido hasta su expiración, a menos que implementes mecanismos extra.

Por eso, en diseños reales, el manejo de logout y revocación puede requerir más estrategia.

## Ventajas de JWT

## 1. Stateless

Encaja muy bien con APIs REST.

## 2. Escalabilidad

Puede simplificar ciertos escenarios distribuidos.

## 3. Integración natural con frontends desacoplados

Muy común en SPA y apps móviles.

## 4. Transporte simple por header

Fácil de incluir en cada request.

## Desventajas o desafíos

JWT no es mágico ni perfecto.

También tiene desafíos como:

- revocación más compleja
- manejo de expiración
- necesidad de proteger bien la clave de firma
- riesgo de mala implementación
- tentación de meter demasiada información en el token

## Ejemplo conceptual de implementación en Spring Boot

No hace falta construir todo ahora, pero conceptualmente suele haber piezas como estas:

### Controlador de autenticación

```java
@RestController
@RequestMapping("/auth")
public class AuthController {

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        // validar usuario
        // generar JWT
        // devolver token
        return new AuthResponse("token-aqui");
    }
}
```

### DTO de login

```java
public class LoginRequest {
    private String username;
    private String password;

    public LoginRequest() {
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }
}
```

### DTO de respuesta

```java
public class AuthResponse {
    private String token;

    public AuthResponse(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }
}
```

## Qué falta en ese ejemplo

Falta mucho del trabajo real:

- validar credenciales
- generar el token con firma
- configurar filtro JWT
- conectar con Spring Security

Pero sirve para entender el flujo general.

## JWT y filtro de seguridad

En una implementación real, suele haber un filtro que:

1. lee el header Authorization
2. extrae el token
3. lo valida
4. obtiene identidad y roles
5. coloca esa autenticación dentro del contexto de Spring Security

Así, cuando la request sigue su camino, la aplicación ya “sabe” quién es el usuario.

## JWT y `401` / `403`

Esto sigue siendo importante.

### `401 Unauthorized`

Cuando el token falta, es inválido o está vencido.

### `403 Forbidden`

Cuando el usuario autenticado no tiene permiso suficiente para el recurso.

## Relación con lo anterior

JWT se apoya directamente en conceptos que ya viste:

- HTTP → headers y requests
- JSON → estructura del login y muchas respuestas
- Spring Security → protección de endpoints
- roles y autorización → permisos por usuario
- stateless → diseño de APIs modernas

Por eso aparece justo ahora en el roadmap.

## Ejemplo de header de request protegida

```http
GET /orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI...
```

## Qué debería pasar

- si el token es válido → la request puede seguir
- si el token es inválido o vencido → la request se rechaza

## Buenas prácticas iniciales

## 1. No meter datos sensibles innecesarios en el payload

Recordá que el token se puede decodificar.

## 2. Usar expiración razonable

No conviene que viva para siempre.

## 3. Proteger bien la clave de firma

Es crítica para la seguridad del sistema.

## 4. Entender primero el flujo antes de copiar código

JWT mal implementado puede dar una falsa sensación de seguridad.

## 5. Integrarlo bien con Spring Security

No como algo separado y desordenado.

## Comparación con otros lenguajes

### Si venís de JavaScript

Probablemente ya viste JWT en frontends o backends Node. En Java con Spring Boot el concepto es el mismo, pero la integración suele apoyarse mucho en filtros y en el ecosistema Spring Security.

### Si venís de Python

Puede que ya lo hayas visto con frameworks web y autenticación basada en tokens. En Spring Boot, la idea general se mantiene, pero el diseño suele pasar fuertemente por el contexto de seguridad y la cadena de filtros de Spring.

## Errores comunes

### 1. Pensar que JWT cifra todo automáticamente

No.
Normalmente firma, pero no cifra por sí mismo.

### 2. Meter demasiada información en el token

Eso puede ser inseguro o innecesario.

### 3. No manejar bien expiración y renovación

Eso hace la experiencia más frágil o insegura.

### 4. Ir directo a implementar sin entender autenticación y autorización básicas

JWT no reemplaza entender la base.

### 5. Tratarlo como solución mágica universal

Es muy útil, pero no resuelve solo todos los problemas de seguridad.

## Mini ejercicio

Diseñá conceptualmente una autenticación JWT para una API con:

1. endpoint `POST /auth/login`
2. request con `username` y `password`
3. response con `token`
4. protección de `/profile`
5. protección de `/admin/**` con rol `ADMIN`

No hace falta implementarlo completo todavía.
La idea es ordenar mentalmente el flujo.

## Ejemplo posible

- login valida credenciales
- backend genera JWT
- cliente guarda token
- cliente lo envía con `Authorization: Bearer ...`
- backend valida token en cada request protegida
- `/profile` requiere autenticación
- `/admin/**` requiere autenticación + rol `ADMIN`

## Resumen

En esta lección viste que:

- JWT significa JSON Web Token
- se usa muchísimo para autenticación stateless en APIs modernas
- suele viajar en el header `Authorization: Bearer ...`
- contiene header, payload y signature
- permite transportar identidad y ciertos claims firmados
- se integra muy bien con Spring Security
- entender JWT te prepara para construir autenticación moderna en Spring Boot

## Siguiente tema

En la próxima lección conviene pasar a **despliegue**, porque después de recorrer lenguaje, backend, persistencia, testing y seguridad, el siguiente paso natural es aprender cómo llevar una aplicación Java real a un entorno accesible fuera de tu máquina.
