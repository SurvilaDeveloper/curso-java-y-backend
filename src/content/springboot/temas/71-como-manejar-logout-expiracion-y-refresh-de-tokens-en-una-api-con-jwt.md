---
title: "Cómo manejar logout, expiración y refresh de tokens en una API con JWT"
description: "Entender qué significa realmente cerrar sesión cuando usás JWT, cómo funciona la expiración del token y por qué los refresh tokens suelen aparecer cuando querés renovar autenticación sin pedir login completo a cada rato."
order: 71
module: "Seguridad con Spring Security"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo construir endpoints como:

- `/me`
- `/mi-cuenta`
- `/mis-recursos`

aprovechando el principal autenticado que Spring Security ya dejó disponible en cada request protegida.

Eso ya te permitió usar la identidad actual de forma muy práctica.

Pero enseguida aparece otra pregunta muy importante:

> si el sistema ya autentica, emite tokens y reconoce al usuario actual, ¿cómo se termina o se renueva esa autenticación en el tiempo?

Porque un backend real no puede pensar la autenticación como algo eterno e inmutable.

Muy rápido aparecen necesidades como:

- que el token venza
- que el usuario tenga que volver a autenticarse en ciertos casos
- que exista una forma razonable de “cerrar sesión”
- que el usuario no tenga que loguearse completo cada dos minutos
- que el sistema pueda renovar acceso sin volver a pedir credenciales siempre

Ahí entran tres ideas muy importantes:

- **logout**
- **expiración**
- **refresh token**

Este tema es clave porque te ayuda a pasar de un sistema que “solo emite JWT” a uno que empieza a pensar el ciclo de vida real de la autenticación.

## El problema de pensar el token como si durara para siempre

Supongamos que tu login devuelve un JWT y listo.

Si no pensás nada más, podrías terminar con una idea implícita muy peligrosa:

- el usuario se logueó una vez
- recibió token
- ese token sirve indefinidamente
- nunca vence
- nunca hay que renovarlo
- nunca hay que cortar acceso salvo que el usuario deje de usar la app

Eso sería una mala base de seguridad.

¿Por qué?

Porque si un token se roba, se filtra o cae en un lugar incorrecto, un token eterno sería un problema gravísimo.

Por eso una de las primeras ideas sanas con JWT es esta:

> el token no debería vivir para siempre.

## Qué significa expiración del token

Significa que el token tiene un tiempo de vida limitado.

Dicho simple:

> después de cierto tiempo, ese token deja de ser válido y ya no debería servir para autenticar requests nuevas.

Esto es una parte muy importante del diseño de seguridad.

Porque convierte la autenticación en algo:

- temporal
- renovable
- controlado
- menos riesgoso que una credencial permanente sin vencimiento

## Por qué la expiración es tan importante

Porque reduce el impacto potencial de que un token quede expuesto.

No lo elimina mágicamente, claro.
Pero sí evita el peor escenario posible de:

- “si alguien consigue este token hoy, podrá usarlo durante años”

La expiración introduce una frontera temporal muy valiosa.

## Un ejemplo mental simple

Podrías pensar algo como:

- el access token dura 15 minutos
- o 30 minutos
- o 1 hora

No importa todavía fijar un número universal.
Lo importante es entender la idea:

> el token de acceso tiene una vida útil limitada.

Ese vencimiento forma parte central del sistema JWT.

## Qué pasa cuando el token vence

Cuando el token vence, el backend debería dejar de aceptarlo como autenticación válida.

Entonces si el cliente intenta hacer una request protegida con un token expirado, la autenticación debería fallar.

Desde el punto de vista del sistema, eso significa algo como:

- el usuario ya no tiene una credencial vigente para esa request
- necesita renovar acceso o volver a autenticarse

Esto conecta directamente con el siguiente concepto importante:
**refresh**.

## Qué problema aparece si el token expira demasiado rápido

Supongamos un token que dura muy poco.

Eso mejora seguridad en algún sentido, pero puede empeorar bastante la experiencia si cada poco tiempo el usuario tiene que volver a:

- poner usuario y contraseña
- hacer login completo
- rehacer el flujo de autenticación desde cero

Entonces aparece una tensión muy clásica:

- tokens largos → más comodidad, más riesgo si se filtran
- tokens cortos → más seguridad, pero peor experiencia si no hay mecanismo de renovación

Ahí es donde aparecen los refresh tokens.

## Qué es un refresh token

Podés pensarlo así:

> es una credencial separada del access token, pensada específicamente para obtener un nuevo access token sin pedir login completo cada vez.

La idea general suele ser:

- el login devuelve un access token y un refresh token
- el access token dura poco
- el refresh token dura más
- cuando el access token vence, el cliente usa el refresh token para pedir uno nuevo
- así el usuario no tiene que reingresar sus credenciales a cada rato

Este patrón es muy común en sistemas con JWT.

## Qué diferencia hay entre access token y refresh token

Esta distinción es central.

### Access token
Se usa para autenticar requests normales a la API.
Suele tener vida corta.

### Refresh token
No se usa para llamar a todos los endpoints del sistema.
Se usa principalmente para pedir un nuevo access token.
Suele tener vida más larga.

Podés resumirlo así:

- access token → acceso operativo a endpoints protegidos
- refresh token → renovación del acceso sin login completo

## Un flujo conceptual típico

Podrías imaginar algo así:

1. usuario hace login
2. backend valida credenciales
3. backend devuelve:
   - access token
   - refresh token
4. cliente usa access token en requests protegidas
5. access token vence
6. cliente manda refresh token a un endpoint de refresh
7. backend valida refresh token
8. backend emite un nuevo access token
9. cliente sigue operando sin pedir login completo otra vez

Este flujo es uno de los más comunes cuando querés combinar seguridad razonable con buena experiencia de uso.

## Por qué no conviene usar solo refresh token para todo

Porque entonces perderías parte de la gracia de separar credenciales por propósito y duración.

La idea sana suele ser:

- access token corto y frecuente
- refresh token más duradero y más cuidado

Así podés limitar mejor el alcance del token que circula en requests normales.

## Qué relación tiene esto con logout

Muy fuerte.

Porque una vez que el sistema maneja tokens, la pregunta “cerrar sesión” deja de sentirse exactamente igual que en una sesión clásica del lado servidor.

Con sesión tradicional, logout suele sentirse como:

- destruir o invalidar la sesión del lado servidor

Con JWT, la cosa puede ser más sutil.

Porque si el access token ya fue emitido y el cliente lo tiene, el concepto de logout depende bastante de cómo diseñaste el sistema.

## Qué significa logout conceptualmente con JWT

A nivel conceptual, logout suele significar algo como:

- el cliente deja de usar y elimina sus tokens
- el sistema corta o invalida mecanismos de renovación
- eventualmente se invalida el refresh token según la estrategia elegida

La idea central es:

> el logout no siempre consiste en “borrar una sesión clásica del servidor”, sino en terminar correctamente la validez práctica de la autenticación basada en tokens.

## El punto más importante sobre logout en JWT

El access token ya emitido, especialmente si el modelo es stateless, puede seguir siendo técnicamente válido hasta vencer, salvo que tengas una estrategia adicional de revocación o lista de bloqueo.

Por eso, conceptualmente, muchas veces el logout se apoya en dos cosas:

- borrar tokens del lado cliente
- invalidar o dejar inutilizable el refresh token

Esto es muy importante de entender.
Porque muestra que logout en JWT no se siente igual que logout en sesión clásica.

## Qué papel juega el cliente en el logout

Muy fuerte.

Porque si el cliente sigue conservando y enviando tokens válidos, el backend seguirá viendo una request autenticada mientras esos tokens sean aceptables.

Entonces parte del logout suele implicar que el cliente:

- borre access token
- borre refresh token
- deje de enviar credenciales

Esto hace que frontend y backend estén muy conectados también en esta parte del flujo.

## Un ejemplo de login más rico

En lugar de devolver solo esto:

```json
{
  "token": "..."
}
```

podrías tener algo como:

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "type": "Bearer"
}
```

Esto ya prepara el sistema para una estrategia más realista de renovación.

## Un ejemplo de response DTO

```java
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private String type = "Bearer";

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getType() {
        return type;
    }
}
```

Esto ya comunica mejor la existencia de dos credenciales distintas con propósitos distintos.

## Qué endpoint suele aparecer para refresh

Muy comúnmente, algo como:

```text
POST /auth/refresh
```

Ese endpoint recibe el refresh token y, si es válido, devuelve un nuevo access token.

Por ejemplo, conceptualmente:

```java
public class RefreshRequest {

    private String refreshToken;

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
```

Y una respuesta tipo:

```java
public class RefreshResponse {

    private String accessToken;
    private String type = "Bearer";

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getType() {
        return type;
    }
}
```

## Cómo se ve conceptualmente el service de refresh

Algo bastante simple a nivel mental sería:

```java
public RefreshResponse refresh(RefreshRequest request) {
    // validar refresh token
    // verificar que no esté vencido o revocado
    // identificar al usuario
    // generar nuevo access token
    // devolver response
}
```

No hace falta implementar todavía toda la criptografía o persistencia adicional.
Lo importante ahora es fijar el caso de uso.

## Qué diferencia hay entre login y refresh

### Login
Recibe credenciales primarias:
- username
- password

y autentica desde cero.

### Refresh
Recibe refresh token:
- no pide usuario y contraseña otra vez
- no autentica desde cero
- renueva el acceso en base a una credencial de renovación válida

Esta diferencia es muy importante.

## Qué relación tiene esto con la experiencia del usuario

Muchísima.

Porque sin refresh token, si el access token dura poco, el usuario podría verse obligado a loguearse completo muy seguido.

Con refresh token, podés lograr una experiencia más cómoda manteniendo a la vez access tokens más cortos.

Eso es una de las razones por las que este patrón es tan usado.

## Qué relación tiene esto con seguridad real

También muy fuerte.

Porque permite algo bastante sano:

- access token corto para limitar exposición
- refresh token más controlado para renovar acceso
- posibilidad de diseñar mejor el logout y la persistencia de autenticación

No resuelve mágicamente todos los problemas del universo.
Pero sí da herramientas mucho más serias que simplemente emitir un token eterno.

## Qué significa revocar o invalidar refresh tokens

Conceptualmente, significa hacer que un refresh token ya no pueda usarse para obtener nuevos access tokens.

Esto es muy importante para logout y para otros escenarios como:

- cambio de credenciales
- sospecha de compromiso de cuenta
- cierre de sesión desde otro dispositivo
- invalidación de acceso prolongado

No hace falta resolver ahora todos los mecanismos concretos de revocación.
Lo importante es entender el rol que cumple en el diseño.

## Por qué el refresh token suele ser más sensible de lo que parece

Porque si alguien obtiene un refresh token válido, podría seguir renovando acceso aunque el access token venza.

Por eso suele requerir bastante cuidado:

- duración
- almacenamiento
- transmisión
- invalidación
- política de rotación si el sistema la necesita

No conviene tratarlo como un detalle menor.

## Qué relación tiene esto con frontend

Muy fuerte.

Porque el frontend suele tener que manejar cosas como:

- guardar access token
- guardar refresh token
- saber cuándo un access token venció
- llamar a `/auth/refresh`
- actualizar el token de acceso que usa para requests normales
- limpiar ambos tokens al hacer logout

Eso muestra que este tema no es solo del backend.
Es un contrato entre backend y cliente.

## Un ejemplo conceptual de logout endpoint

Algunos sistemas exponen algo como:

```text
POST /auth/logout
```

El trabajo conceptual podría ser:

- recibir refresh token actual o identificar la sesión/token renovable
- invalidarlo o revocarlo según el diseño
- responder ok
- el cliente además borra sus tokens locales

No todos los sistemas lo hacen exactamente igual.
Pero como idea de arquitectura es muy útil entender que logout puede necesitar más que “el frontend borra una variable”.

## Qué pasa si no implementás refresh

No es obligatorio desde el minuto uno.

Podés tener un sistema inicial más simple donde:

- el access token dura cierto tiempo
- cuando vence, el usuario tiene que volver a hacer login

Eso puede ser aceptable en algunos proyectos o primeras versiones.

Lo importante es que esa sea una decisión consciente, no una omisión accidental.

## Cuándo suele tener sentido sumar refresh

Por ejemplo, cuando:

- la app necesita una experiencia más cómoda
- el login frecuente sería demasiado molesto
- querés access tokens cortos pero sin fricción excesiva
- el producto se parece más a una app real de uso continuo

Ahí el refresh token suele empezar a aportar bastante valor.

## Qué relación tiene esto con el filtro JWT

Muy directa.

El filtro JWT normalmente trabaja sobre el access token que viene en requests protegidas normales.

No suele ser el mismo flujo que el refresh endpoint.

Podés pensarlo así:

- access token → autenticación request por request
- refresh token → renovación puntual del access token

El filtro sigue siendo fundamental, pero ahora el sistema completo gana una segunda capa temporal.

## Qué relación tiene esto con `/me` y recursos propios

Total.

Porque todos esos endpoints dependen de que el access token siga siendo válido.

Si el token vence y no se renueva, el backend ya no podrá reconstruir la identidad para:

- `/me`
- `/mis-pedidos`
- `/mi-cuenta`

Entonces expiración y refresh están completamente conectados con el resto de la API autenticada.

## Qué relación tiene esto con testing

Muchísima.

Aparecen preguntas como:

- ¿el login devuelve access y refresh token?
- ¿el refresh endpoint devuelve nuevo access token si el refresh es válido?
- ¿rechaza refresh vencido o inválido?
- ¿una request con access token expirado se bloquea?
- ¿logout invalida correctamente la renovación?
- ¿el cliente dejaría de poder renovar acceso después del logout?

Esto hace que el testing de seguridad siga creciendo en riqueza.

## Qué no conviene hacer

No conviene:

- emitir access tokens sin expiración
- tratar logout como si fuera idéntico a una sesión clásica sin pensar el modelo JWT
- usar refresh token sin entender para qué sirve
- almacenar o manejar refresh token sin una política clara
- mezclar login y refresh como si fueran el mismo endpoint o el mismo problema

Cada pieza cumple un rol distinto.

## Otro error común

Pensar que “logout” en JWT significa automáticamente que ningún token previo podrá usarse jamás a partir de ese instante.

Eso depende del diseño concreto de revocación, del tiempo de vida de los tokens y de cómo manejás la invalidez.

Conviene no asumir un comportamiento mágico que no implementaste.

## Otro error común

Hacer access tokens demasiado largos porque “así no molesta al usuario”.

Eso puede aliviar UX, pero también aumentar bastante el riesgo si el token se filtra.

## Otro error común

Hacer access tokens ultra cortos sin un refresh razonable, generando una UX insoportable.

Como en muchas cosas de backend, acá también hay tradeoffs.

## Una buena heurística

Podés preguntarte:

- ¿cuánto debería durar el access token?
- ¿la app necesita refresh token o puede vivir con re-login?
- ¿cómo se hace logout en este modelo?
- ¿qué pasa si se roba un token?
- ¿qué rol juega el frontend en almacenar y borrar credenciales?
- ¿el sistema necesita revocación más explícita?

Responder esto ordena muchísimo el diseño.

## Qué relación tiene esto con una API real

Muy directa.

Porque una API seria con autenticación por JWT tarde o temprano necesita pensar:

- duración del token
- renovación
- logout
- expiración
- UX vs seguridad
- contratos de refresh
- invalidación razonable

No es un detalle de “último toque”.
Es parte central del ciclo de vida de la autenticación.

## Relación con Spring Security

Spring Security te ayuda mucho a integrar autenticación y autorización request por request, pero la política temporal del token —cuánto dura, cómo se renueva, cómo se deja de usar— también forma parte del diseño del backend seguro.

Este tema te ayuda justamente a pensar esa dimensión temporal, que muchas veces se olvida cuando uno recién descubre JWT.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> en una API con JWT no alcanza con emitir un token en login: también hay que pensar cuánto dura, cómo se renueva mediante refresh tokens y qué significa realmente hacer logout, porque la seguridad real depende del ciclo de vida completo de esas credenciales y no solo de su creación inicial.

## Resumen

- El access token no debería durar para siempre; la expiración es una parte central del diseño.
- Los refresh tokens permiten renovar acceso sin pedir login completo en cada vencimiento.
- Logout en JWT no se siente igual que en una sesión clásica y suele involucrar al cliente y la invalidez de mecanismos de renovación.
- Access token y refresh token cumplen roles distintos.
- Seguridad y experiencia de usuario se equilibran mucho en esta parte del sistema.
- Este tema completa una visión mucho más realista del ciclo de vida de la autenticación con JWT.
- Expiración, refresh y logout son piezas clave para que la seguridad basada en tokens funcione bien en una aplicación real.

## Próximo tema

En el próximo tema vas a ver cómo empezar a documentar y probar una API segura con login y JWT, porque una vez que el backend ya protege rutas, autentica usuarios y maneja tokens, se vuelve muy importante poder explicarlo y verificarlo bien desde afuera.
