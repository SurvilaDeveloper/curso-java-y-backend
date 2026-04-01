---
title: "Cómo validar el JWT en cada request con un filtro de seguridad en Spring Boot"
description: "Entender cómo funciona el filtro que lee y valida el token JWT en cada request, y por qué esta pieza es fundamental para que Spring Security reconstruya correctamente la autenticación del usuario en rutas protegidas."
order: 69
module: "Seguridad con Spring Security"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo construir el login y devolver un JWT en Spring Boot.

Eso te dio una mitad muy importante del sistema:

- el usuario manda credenciales
- el backend las valida
- si son correctas, genera un token
- el cliente recibe ese token
- y luego lo usa en requests posteriores

Pero ahí aparece una pregunta completamente natural:

> ¿qué hace el backend cuando una request llega con `Authorization: Bearer ...`?

Porque emitir el token en login no alcanza por sí solo.
Ahora hace falta resolver la otra mitad del flujo:

- leer el token en cada request
- validarlo
- decidir si representa una identidad válida
- reconstruir la autenticación actual
- cargar esa autenticación en Spring Security
- y recién entonces dejar pasar la request al resto del sistema

Ahí entra una pieza fundamental de muchas implementaciones con JWT:

**el filtro de seguridad**

Este tema es clave porque te ayuda a entender cómo el backend pasa de “emitir tokens” a “usar realmente esos tokens para autenticar requests protegidas”.

## El problema que resuelve el filtro JWT

Supongamos que el cliente ya hizo login y obtuvo un token así:

```json
{
  "token": "eyJhbGciOi..."
}
```

Después, el cliente hace una request protegida como:

```text
GET /usuarios/me
Authorization: Bearer eyJhbGciOi...
```

La pregunta es:

> ¿quién lee ese header y cómo termina Spring Security sabiendo quién es el usuario actual?

La respuesta no suele ser:

- el controller parsea el header a mano
- cada endpoint hace su propia validación manual
- cada service revisa el token por su cuenta

Eso sería repetitivo, frágil y muy difícil de mantener.

La solución típica es mucho mejor:

> un filtro intercepta la request antes, lee el token, lo valida y prepara el contexto de autenticación para el resto del pipeline.

## Qué es un filtro en este contexto

A muy alto nivel, un filtro es una pieza que se ejecuta durante el procesamiento de una request HTTP, antes de que la request llegue normalmente al controller final.

Podés pensarlo así:

- entra una request
- atraviesa una cadena de procesamiento
- ciertos componentes pueden inspeccionarla o modificar contexto
- luego la request sigue su camino

Dentro de Spring Security, los filtros son una parte muy importante del pipeline de seguridad.

## Qué papel cumple el filtro JWT

El filtro JWT suele encargarse de algo como esto:

1. mirar si existe el header `Authorization`
2. verificar si usa el formato `Bearer ...`
3. extraer el token
4. validar el token
5. obtener la identidad representada por ese token
6. cargar esa identidad dentro del contexto de seguridad
7. dejar seguir la request

Ese flujo es exactamente la otra mitad del sistema JWT.

## Por qué esto es tan importante

Porque si el backend no valida y procesa el token en cada request, entonces el token servido por login no tendría valor práctico dentro del resto de la API.

Es decir:

- login sin filtro JWT → token emitido, pero el backend no sabe usarlo después
- login con filtro JWT → token emitido y luego reutilizado correctamente para autenticar requests futuras

Por eso este tema es tan central.

## Cómo se ve mentalmente el flujo completo

Podés pensar el ciclo así:

### Login
- request con username y password
- backend valida
- backend responde con JWT

### Request protegida posterior
- cliente manda `Authorization: Bearer ...`
- filtro JWT intercepta
- valida token
- reconstruye autenticación
- Spring Security ya sabe quién es el usuario
- controller y service trabajan con ese contexto autenticado

Este mapa conecta perfecto con todo lo que venís viendo.

## Qué debería mirar primero el filtro

Normalmente lo primero es revisar si existe el header `Authorization`.

Por ejemplo, conceptualmente:

```java
String authHeader = request.getHeader("Authorization");
```

Y luego verificar si tiene formato Bearer.

```java
if (authHeader == null || !authHeader.startsWith("Bearer ")) {
    filterChain.doFilter(request, response);
    return;
}
```

Este fragmento expresa una idea muy importante:

> si la request no trae token Bearer, el filtro no fuerza mágicamente una autenticación; simplemente deja seguir la request como venga.

Eso es correcto porque puede haber rutas públicas o requests anónimas legítimas.

## Cómo leer esa lógica

Podés leerla así:

- no todas las requests tienen que traer token
- si no hay token, no significa automáticamente “error”
- puede ser una ruta pública
- puede ser una request anónima
- entonces el filtro deja seguir y Spring Security resolverá el resto según las reglas configuradas

Esta idea es muy sana y evita malentendidos.

## Cómo se extrae el token

Una vez verificado que el header empieza con `Bearer `, normalmente se extrae la parte del token así:

```java
String jwt = authHeader.substring(7);
```

¿Por qué 7?
Porque `"Bearer "` tiene siete caracteres contando el espacio.

No hace falta obsesionarse con ese detalle.
Lo importante es entender la lógica:

- el header viene con una convención
- el filtro separa el prefijo del token real
- el token real se usa para la validación

## Qué hace el filtro con el token extraído

Después suele pasar algo como esto:

- extraer username o identidad del token
- validar que el token sea correcto
- cargar al usuario correspondiente
- construir un objeto de autenticación
- ponerlo en el contexto de seguridad

No todas las implementaciones lo hacen exactamente igual, pero conceptualmente esa es la historia.

## Un ejemplo de JwtService útil para este punto

Supongamos que ya tenés un `JwtService` con cosas como:

```java
public class JwtService {

    public String extractUsername(String token) {
        // extraer username del token
        return "...";
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        // validar token y verificar que corresponde al usuario
        return true;
    }
}
```

No hace falta que implementemos ahora toda la parte criptográfica.
Lo importante es que el filtro se apoya en un servicio especializado para:

- leer claims
- validar firma
- validar expiración
- verificar consistencia

Eso mantiene más limpio el código.

## Un ejemplo conceptual de filtro JWT

Una implementación típica puede verse así:

```java
import java.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);
        String username = jwtService.extractUsername(jwt);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
```

Este ejemplo es bastante representativo del flujo conceptual.

## Qué es OncePerRequestFilter

`OncePerRequestFilter` es una base muy usada para filtros personalizados en Spring.

La idea principal es simple:

> asegura que la lógica del filtro se ejecute una sola vez por request.

Eso suele ser bastante apropiado para un filtro JWT, porque querés procesar el token una vez por request y dejar listo el contexto de seguridad.

## Cómo leer el cuerpo del filtro

Podés leer el filtro completo así:

1. leo `Authorization`
2. si no hay Bearer, dejo seguir
3. extraigo token
4. le pido al `JwtService` que me diga qué username representa
5. si todavía no hay autenticación cargada en el contexto, busco el usuario
6. valido que el token realmente sea correcto para ese usuario
7. si todo da bien, construyo autenticación
8. la guardo en `SecurityContextHolder`
9. dejo seguir la request

Este flujo es exactamente el núcleo del tema.

## Qué es SecurityContextHolder

Es una pieza muy importante dentro de Spring Security.

Podés pensarlo así:

> es el lugar donde Spring Security mantiene la autenticación actual asociada al procesamiento de la request.

Cuando el filtro hace algo como:

```java
SecurityContextHolder.getContext().setAuthentication(authToken);
```

lo que está haciendo es decirle a Spring Security:

> esta request ya tiene una identidad autenticada válida; trabajá con esto como contexto actual.

Eso permite luego que controllers, services y anotaciones de seguridad vean al usuario actual.

## Por qué se chequea que no haya ya una autenticación

En el filtro aparece esto:

```java
SecurityContextHolder.getContext().getAuthentication() == null
```

La idea es evitar pisar o recrear inútilmente una autenticación si ya existe una cargada.

Podés pensarlo como una defensa razonable para no duplicar trabajo o no alterar un contexto ya establecido.

## Qué es UsernamePasswordAuthenticationToken en este contexto

Aunque el nombre suene raro para JWT, esta clase se usa mucho para representar una autenticación dentro de Spring Security.

En este caso, no significa que la request actual haya venido con username y password directos.
Significa que el backend construye un objeto de autenticación con:

- el usuario ya cargado
- sin credencial directa en ese punto
- authorities o roles del usuario

Es decir, es una forma estándar de decir:

> esta request ya está autenticada con este principal y estas authorities.

## Qué hacen las authorities acá

Cuando el filtro carga el `UserDetails` y usa:

```java
userDetails.getAuthorities()
```

está preservando la información de roles o permisos para que luego Spring Security pueda aplicar reglas como:

- `hasRole("ADMIN")`
- `authenticated()`
- checks sobre roles del usuario actual

Eso conecta el token no solo con identidad, sino también con autorización.

## Qué pasa si el token no es válido

Si `jwtService.isTokenValid(...)` devuelve false, entonces el filtro no debería cargar una autenticación válida en el contexto.

En ese caso, la request seguirá sin una autenticación legítima.
Y si la ruta exige autenticación, Spring Security terminará rechazándola según la política configurada.

Esto es muy importante:
un token inválido no debería traducirse en un “usuario más o menos autenticado”.
Simplemente no debe producir autenticación válida.

## Qué pasa si el token está vencido

Conceptualmente entra en el mismo grupo de problema:

- el token no es válido para autenticar la request actual

Entonces el filtro no debería poblar el contexto como si todo estuviera bien.

Esto muestra por qué la validación del token no es solo “parsearlo”.
Hay que decidir si realmente sigue siendo aceptable para seguridad.

## Qué pasa si no hay token pero la ruta es pública

No pasa nada malo.
El filtro deja seguir la request.
Y como la ruta es pública, la request puede llegar al controller sin necesidad de autenticación.

Esto refuerza una idea importante:

> el filtro JWT no existe para obligar autenticación universal, sino para procesar correctamente el token cuando aparece.

## Qué pasa si no hay token y la ruta es privada

El filtro deja seguir la request, pero la request no tendrá autenticación válida en el contexto.

Entonces, cuando la política de seguridad exija autenticación, Spring Security la rechazará.

Otra vez, eso muestra cómo el filtro y la política de rutas trabajan juntos:

- el filtro prepara autenticación si puede
- la política decide si esa autenticación era necesaria o no

## Por qué no conviene validar JWT directamente en el controller

Porque eso te llevaría a repetir cosas como:

- leer Authorization
- cortar Bearer
- validar token
- cargar usuario
- chequear expiración

en muchos endpoints distintos.

Eso sería muy repetitivo y muy fácil de hacer mal.

El filtro existe justamente para centralizar esa lógica de seguridad request por request.

## Qué relación tiene esto con /me

Muy directa.

Supongamos esta request:

```text
GET /usuarios/me
Authorization: Bearer eyJhbGciOi...
```

Si el filtro funciona bien, cuando la request llegue al controller, Spring Security ya tendrá cargado el usuario autenticado actual.

Eso hace posible cosas como:

- `Authentication authentication`
- principal actual
- user actual
- `/me`
- ownership

Sin el filtro, el backend no podría reconstruir bien esa identidad a partir del token.

## Qué relación tiene esto con UserDetailsService

También es central.

En el filtro viste esto:

```java
UserDetails userDetails = userDetailsService.loadUserByUsername(username);
```

Eso muestra otra vez por qué `UserDetailsService` era tan importante en el tema 66.

El token puede darte un username, pero Spring Security sigue necesitando cargar al usuario real con sus authorities y estado.

Entonces el filtro y el `UserDetailsService` trabajan muy juntos.

## Qué relación tiene esto con JWTService

Muy fuerte.

El filtro no debería saber todos los detalles criptográficos del token.
Por eso se apoya en un componente dedicado como:

- `extractUsername(...)`
- `isTokenValid(...)`

Esto mantiene la responsabilidad más limpia y ayuda mucho al diseño.

## Qué relación tiene esto con la configuración de seguridad

Para que el filtro entre en juego, normalmente hay que registrarlo dentro de la cadena de filtros de Spring Security.

Conceptualmente, algo así:

```java
http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
```

No hace falta que ahora profundices todo el DSL completo.
Lo importante es captar la idea:

> el filtro JWT forma parte de la cadena de seguridad y debe ubicarse en el lugar correcto del pipeline.

Eso permite que procese la request antes de que el resto del sistema tome decisiones basadas en autenticación.

## Qué significa addFilterBefore(...)

Podés leerlo así:

> ejecutá mi filtro JWT antes del filtro estándar que normalmente procesaría autenticación por username y password.

Esto suele tener mucho sentido en APIs con JWT, porque querés reconstruir la autenticación desde el token antes de que la request siga.

## Qué gana el backend con este diseño

Muchísimo.

Porque ahora el pipeline queda bastante limpio:

- login emite token
- request posterior manda Bearer token
- filtro lo valida
- contexto de seguridad queda poblado
- rutas protegidas pueden usar autenticación actual
- controllers y services no parsean headers manualmente

Eso vuelve toda la seguridad mucho más coherente.

## Un ejemplo completo del flujo

Podés pensarlo así:

1. usuario hace login
2. backend genera JWT
3. cliente guarda token
4. cliente manda request protegida con `Authorization: Bearer ...`
5. filtro lee el header
6. extrae token
7. obtiene username
8. carga usuario con `UserDetailsService`
9. valida token
10. pone autenticación en `SecurityContextHolder`
11. request sigue
12. controller puede usar el usuario actual

Ese flujo resume casi todo el corazón del backend con JWT.

## Qué relación tiene esto con roles y autorización

Una vez que el filtro carga el `UserDetails` con authorities, la request ya puede ser evaluada por reglas como:

- `authenticated()`
- `hasRole("ADMIN")`
- `hasAnyRole("USER", "MODERATOR")`

Eso significa que el filtro no solo resuelve identidad.
También habilita la autorización posterior del sistema.

## Qué relación tiene esto con testing

Muchísima.

Aparecen preguntas como:

- ¿una request con token válido deja pasar?
- ¿una request sin token se rechaza en ruta privada?
- ¿una request con token inválido no carga autenticación?
- ¿un token de admin permite acceder a rutas admin?
- ¿el usuario actual queda disponible correctamente?

Esto hace que los tests de seguridad sean mucho más interesantes y realistas.

## Qué no conviene hacer

No conviene:

- parsear JWT manualmente en cada controller
- mezclar lógica de validación de token dentro del service de negocio
- meter toda la criptografía del token dentro del filtro mismo
- poblar el contexto sin validar correctamente el token
- tratar un token vencido o mal formado como si fuera aceptable

El filtro JWT es una pieza sensible.
Conviene mantenerla clara y bien acotada.

## Otro error común

Pensar que “si el token existe, ya alcanza”.

No.
Tiene que:

- estar bien formado
- ser auténtico
- no estar vencido
- corresponder al usuario correcto
- pasar validaciones reales

La existencia de un string no es autenticación suficiente.

## Otro error común

No entender la diferencia entre:

- emitir token
- validar token

Son dos mitades distintas del sistema.

El tema 68 te dio la primera mitad.
Este tema te da la segunda.

## Otro error común

Creer que el filtro “hace toda la seguridad”.

No exactamente.
El filtro prepara la autenticación.
Después todavía intervienen:

- reglas de rutas
- roles
- ownership
- services
- políticas más finas del sistema

Conviene verlo como una pieza central, pero no como la única.

## Una buena heurística

Podés preguntarte:

- ¿quién lee el header Authorization?
- ¿quién extrae Bearer token?
- ¿quién valida expiración y validez?
- ¿quién carga el usuario actual en el contexto?
- ¿estoy centralizando esto en un filtro o lo estoy desparramando por el backend?

Responder eso ordena muchísimo el diseño de seguridad.

## Qué relación tiene esto con una API real

Muy directa.

Porque en casi cualquier backend con JWT llega un momento donde esta pieza deja de ser opcional:
si querés que las requests protegidas realmente funcionen, necesitás un mecanismo equivalente a este filtro.

No es un detalle.
Es una de las columnas vertebrales del sistema.

## Relación con Spring Security

Spring Security hace muy natural integrar este filtro dentro del pipeline general del framework, que es justamente lo que permite que el JWT no quede como “un token suelto”, sino como una autenticación realmente entendida por todo el sistema.

Y esa es una de las grandes claves de trabajar con Spring Security bien integrado.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> el filtro JWT es la pieza que lee el `Authorization: Bearer ...` en cada request, valida el token y carga la autenticación en el contexto de Spring Security, permitiendo que el backend reconozca correctamente al usuario actual en rutas protegidas.

## Resumen

- Emitir un JWT en login no alcanza; también hay que validarlo en cada request protegida.
- Un filtro JWT centraliza la lectura del header Authorization y la validación del token.
- Si el token es válido, el filtro carga la autenticación en `SecurityContextHolder`.
- Esto permite que Spring Security reconozca al usuario actual y aplique reglas de acceso.
- El filtro suele trabajar muy de cerca con `JwtService` y `UserDetailsService`.
- No conviene desparramar esta lógica en controllers o services de negocio.
- Este tema completa la segunda mitad esencial del flujo de seguridad basado en JWT.

## Próximo tema

En el próximo tema vas a ver cómo construir endpoints como `/me`, `/mi-cuenta` o `/mis-recursos` usando el principal autenticado, para aprovechar de forma práctica todo el contexto de seguridad que ya quedó poblado por el filtro JWT.
