---
title: "Refresh tokens"
description: "Cómo pensar refresh tokens en una aplicación Java con Spring Boot y Spring Security. Qué problema resuelven, por qué son tan sensibles, qué lifecycle necesitan y qué errores de diseño vuelven el acceso más difícil de revocar o más fácil de abusar."
order: 35
module: "Sesiones, JWT y control del estado"
level: "base"
draft: false
---

# Refresh tokens

## Objetivo del tema

Entender qué problema resuelven los **refresh tokens** en una aplicación Java + Spring Boot + Spring Security, y por qué son una de las piezas más delicadas de todo el modelo de autenticación basado en tokens.

Este tema importa mucho porque, en muchos sistemas, el access token corto mejora bastante el riesgo inmediato… pero solo a costa de introducir otra credencial con muchísimo poder:

- el refresh token

Si ese refresh token está mal pensado, la app puede terminar con problemas como:

- acceso demasiado persistente
- revocación débil
- logout decorativo
- reutilización peligrosa
- robo de credenciales duraderas
- sesiones difíciles de cortar
- lifecycle confuso de autenticación

En resumen:

> un refresh token no es un detalle técnico menor.  
> Es una credencial sensible que puede prolongar acceso durante mucho tiempo, y por eso necesita un diseño bastante serio.

---

## Idea clave

El refresh token existe para permitir que el usuario siga obteniendo acceso nuevo sin reingresar credenciales primarias todo el tiempo.

En resumen:

> el access token suele ser corto para reducir ventana de abuso.  
> El refresh token existe para renovar ese acceso de forma controlada, sin volver a pedir password en cada expiración corta.

Eso mejora UX y puede mejorar seguridad del access token.
Pero también introduce una nueva superficie muy sensible.

---

## Qué problema intenta resolver

Supongamos que tu sistema quiere:

- access tokens cortos
- menos daño si un access token se roba
- autenticación fluida sin pedir password cada pocos minutos

Ahí aparece el refresh token.

### Modelo básico

- el usuario hace login
- recibe access token + refresh token
- el access token expira relativamente pronto
- el refresh token permite obtener uno nuevo
- el usuario no necesita autenticarse desde cero cada vez

Eso suena bien, pero exige pensar muy bien quién gobierna ese refresh token.

---

## Qué diferencia hay entre access token y refresh token

## Access token
Suele ser:
- más corto
- usado frecuentemente
- presentado en requests autenticados
- de vida relativamente acotada

## Refresh token
Suele ser:
- más durable
- menos usado
- presentado solo para renovar acceso
- más sensible desde el punto de vista del lifecycle

### Idea importante

No conviene tratarlos como si fueran equivalentes.

Un refresh token puede ser incluso más delicado que el access token porque permite seguir creando acceso nuevo.

---

## Error mental clásico

Mucha gente piensa algo como:

- “el refresh token es solo otro token”
- “si el access token es corto, ya resolvimos lo importante”
- “si guardamos refresh token y listo, ya está”
- “si el usuario cierra sesión, el frontend lo borra”
- “siempre que el refresh sea válido, emitimos uno nuevo”

Ese razonamiento suele ser demasiado ingenuo.

Porque el refresh token no es una simple comodidad.
Es una credencial con capacidad de **renovar** acceso.

Y eso la vuelve muy importante para:

- revocación
- logout
- cambio de password
- incidentes
- compromiso de cuenta
- sesiones por dispositivo
- reuse detection

---

## Cuándo tiene sentido usar refresh tokens

Los refresh tokens suelen tener sentido cuando elegiste un modelo con access tokens cortos y querés evitar que el usuario deba loguearse seguido.

Típicamente aparecen cuando:

- usás JWT para access token
- querés reducir duración del token de acceso
- necesitás mantener UX razonable
- aceptás introducir una credencial más duradera pero más controlada

No siempre hacen falta.

Si tu sistema usa sesión server-side tradicional, muchas veces el refresh token ni siquiera es la herramienta natural.
Por eso este tema tiene sentido sobre todo en modelos token-based.

---

## Qué riesgo principal introducen

Si el refresh token se roba y sigue siendo válido, el atacante puede seguir renovando access tokens aunque los access tokens cortos ya hayan expirado.

Eso significa que un refresh token mal gobernado puede volver irrelevante gran parte del beneficio de tener access tokens cortos.

En otras palabras:

> access token corto + refresh token débil puede terminar pareciéndose a una credencial larga mal defendida.

---

## Qué decisiones importantes hay que tomar

Un diseño serio con refresh tokens suele tener que responder preguntas como:

- ¿cuánto dura el refresh token?
- ¿dónde se guarda?
- ¿cómo se revoca?
- ¿se rota en cada uso?
- ¿qué pasa si se reutiliza uno viejo?
- ¿qué pasa al hacer logout?
- ¿qué pasa al cambiar password?
- ¿qué pasa si se bloquea la cuenta?
- ¿hay uno por usuario o por sesión/dispositivo?
- ¿qué trazabilidad deja?

Si estas respuestas no están claras, el sistema probablemente todavía no gobierna bien el acceso prolongado.

---

## Duración del refresh token

El refresh token suele durar más que el access token.
Pero eso no significa que deba durar sin criterio.

### Riesgos de duración excesiva

- acceso renovable por demasiado tiempo
- dificultad para cortar compromiso
- sesiones fantasma muy largas
- mayor superficie si el token se expone

### Idea sana

La duración debería ser:

- suficientemente larga para UX razonable
- no exageradamente larga
- coherente con el riesgo del sistema
- acompañada por revocación e invalidación

No hay un número universal mágico.
Pero sí hay una idea clara:
un refresh token no debería vivir “porque sí” durante meses si el sistema no puede gobernarlo bien.

---

## Dónde guardar el refresh token

Esto es muy importante.

No alcanza con decir “el backend emite uno”.
Hay que pensar dónde queda del lado cliente y qué tan expuesto queda.

### Preguntas útiles

- ¿lo necesita leer JavaScript?
- ¿va en cookie?
- ¿va en storage accesible al frontend?
- ¿qué pasa si el navegador o entorno cliente se compromete?
- ¿qué pasa al cerrar sesión?
- ¿qué pasa si se usa desde otro dispositivo?

No vamos a resolver todos los matices de almacenamiento acá, pero sí conviene dejar muy clara la idea:

> un refresh token es una credencial.  
> Guardarlo sin criterio equivale a guardar acceso prolongado sin criterio.

---

## Qué conviene guardar del lado servidor

Aunque el modelo general sea token-based, muchos diseños sanos vuelven a introducir cierto estado del lado servidor para gobernar refresh tokens.

Por ejemplo, puede tener sentido guardar algo como:

- identificador del refresh token
- userId
- hash del token o representación protegida
- device/session id
- createdAt
- expiresAt
- revokedAt
- replacedBy
- metadata mínima útil

### Ejemplo conceptual

```java
@Entity
public class RefreshTokenRecord {

    @Id
    @GeneratedValue
    private Long id;

    private Long userId;
    private String tokenHash;
    private Instant createdAt;
    private Instant expiresAt;
    private Instant revokedAt;
    private Long replacedById;
}
```

### Qué idea importa acá

Aunque uses JWT o tokens, gobernar refresh suele requerir más estado del que mucha gente imagina al principio.

---

## Rotación de refresh tokens

Este es uno de los conceptos más importantes.

### Qué significa rotar

Cuando el cliente usa un refresh token válido para pedir un nuevo access token, el sistema:

- invalida el refresh token viejo
- emite uno nuevo
- registra la relación entre ambos si el diseño lo requiere

### Por qué importa

Si siempre dejás vivo el mismo refresh token hasta su expiración final, el impacto de robo crece mucho.

La rotación ayuda a:

- acotar reutilización
- detectar reuso sospechoso
- reducir valor de tokens viejos
- mejorar control de sesiones

---

## Reutilización de refresh token

Otro concepto muy importante.

Si rotás refresh tokens, puede pasar algo así:

- el refresh token A se usa
- el backend emite B y revoca A
- luego alguien intenta volver a usar A

Eso es una señal muy interesante.

Puede significar:

- token viejo robado
- replay
- sesión comprometida
- cliente fuera de sync
- intento malicioso

Muchos diseños serios tratan la reutilización de un refresh token ya invalidado como un evento relevante y, según el criterio, pueden:

- revocar la cadena asociada
- invalidar toda la sesión/dispositivo
- requerir login completo
- registrar alerta

---

## Error común: refresh token eterno y reusable

Este es uno de los errores más peligrosos.

### Ejemplo mental flojo

- refresh token válido por mucho tiempo
- siempre igual
- nunca rota
- solo expira cuando pasa mucho tiempo
- no hay revocación real

### Problemas

- si se roba, sirve muchísimo tiempo
- logout pierde fuerza
- cambio de password puede no cortar bien acceso
- no hay forma buena de detectar reuse
- el lifecycle real del acceso queda flojo

---

## Qué debería pasar al hacer refresh

Un flujo sano de refresh debería hacer cosas como:

- recibir refresh token
- validarlo
- comprobar que no esté expirado
- comprobar que no esté revocado
- comprobar que corresponde a una sesión o cadena válida
- emitir nuevo access token
- según la política, rotar y emitir nuevo refresh token
- registrar el evento

### Ejemplo conceptual

```java
public AuthResponse refresh(RefreshRequest request) {
    RefreshTokenRecord tokenRecord = refreshTokenService.validateUsableToken(request.getRefreshToken());

    User user = userRepository.findById(tokenRecord.getUserId()).orElseThrow();

    RefreshTokenRecord newRefresh = refreshTokenService.rotate(tokenRecord);

    String accessToken = jwtService.issueAccessToken(user);
    String refreshToken = refreshTokenService.issueRawToken(newRefresh);

    return new AuthResponse(accessToken, refreshToken);
}
```

### Qué importa conceptualmente

- el refresh no es un simple “si coincide, emití”
- hay lifecycle
- hay validación
- hay potencial rotación
- hay gobierno de la credencial

---

## Qué pasa en logout

Si tu sistema usa refresh tokens, el logout no debería ser solo:

- borrar token del frontend

Idealmente también debería:

- revocar el refresh token actual
- invalidar la sesión o cadena correspondiente
- impedir futuros refresh sobre esa credencial
- dejar trazabilidad

Si no, el logout puede volverse bastante decorativo.

---

## Qué pasa con cambio de password

Este es un caso importantísimo.

Preguntas útiles:

- ¿los refresh tokens ya emitidos siguen sirviendo?
- ¿deberían invalidarse todos?
- ¿solo los del dispositivo actual?
- ¿qué pasa con sesiones activas?

En muchos sistemas, un cambio o reset de password debería cortar los refresh tokens activos, especialmente si el motivo fue sospecha de compromiso.

---

## Qué pasa si se bloquea o deshabilita la cuenta

Lo mismo aplica acá.

Si la cuenta cambia a estado no habilitado, conviene decidir:

- ¿los refresh tokens siguen permitiendo generar access tokens?
- ¿o se invalida ese acceso renovable?

Ignorar esto deja una incoherencia fuerte entre estado real de cuenta y lifecycle de acceso.

---

## Un refresh token por usuario vs por dispositivo o sesión

Otra decisión importante.

## Uno por usuario
Más simple mentalmente, pero más bruto para revocar.

## Uno por sesión o dispositivo
Más granular, más gobernable, más coherente con seguridad real.

Esto afecta bastante cosas como:

- logout parcial
- revocación por dispositivo
- investigación de incidentes
- reuse detection
- experiencia multi-dispositivo

No siempre hace falta complejidad máxima, pero conviene decidirlo conscientemente.

---

## Qué relación tiene esto con JWT

Muchas veces el access token es un JWT y el refresh token es solo un valor opaco o token de negocio controlado por backend.

Eso suele ser una idea bastante sana.

¿Por qué?

Porque el refresh token no necesariamente necesita cargar claims firmados portables como un JWT.
Muchas veces conviene que sea simplemente una credencial rotativa gobernada del lado servidor.

No todo token tiene que ser JWT.

---

## Qué errores suelen aparecer en implementaciones Spring

Estas cosas suelen hacer ruido rápido:

- refresh token sin store ni lifecycle claro
- refresh token demasiado largo
- sin rotación
- sin revocación en logout
- sin invalidación tras password reset
- sin control por dispositivo o sesión
- reuse no detectado
- tratar refresh como si fuera un access token largo
- frontend y backend sin una política clara de qué hacer cuando expira o falla el refresh

---

## Qué registrar en auditoría

Conviene registrar cosas como:

- emisión de refresh token
- refresh exitoso
- refresh rechazado
- token expirado
- token revocado
- reuse detectado
- logout con revocación
- invalidación masiva tras cambio de password o incidente

Esto ayuda mucho a:

- soporte
- investigación
- detección de compromiso
- revisión de lifecycle
- respuesta a incidentes

---

## Qué gana la app si lo resuelve bien

Cuando el refresh token está bien diseñado, la app gana:

- access tokens más cortos sin destruir UX
- mejor control del acceso prolongado
- revocación más clara
- mejor logout
- mejor respuesta a compromiso
- trazabilidad más útil
- menor daño ante robo de access token aislado

Pero esto solo pasa si el refresh token está realmente gobernado, no si queda como “un token más”.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- refresh tratado como credencial sensible
- duración razonable
- store o lifecycle claro
- rotación
- revocación explícita
- reuse detection o al menos una política clara ante reuso
- vínculo razonable con dispositivo o sesión
- invalidación tras eventos sensibles

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- refresh eterno
- refresh reusable siempre igual
- logout que no revoca
- sin store ni trazabilidad
- sin invalidación tras cambio de password
- sin política ante robo
- equipo que no puede explicar qué pasa con un refresh comprometido

---

## Checklist práctico

Cuando revises refresh tokens en una app Spring, preguntate:

- ¿cuánto duran?
- ¿dónde se guardan?
- ¿qué pasa si se roban?
- ¿se rotan?
- ¿se revocan en logout?
- ¿qué pasa si el usuario cambia password?
- ¿qué pasa si la cuenta se bloquea?
- ¿hay uno por usuario o por sesión/dispositivo?
- ¿se detecta reutilización de tokens viejos?
- ¿qué trazabilidad deja el flujo?
- ¿el equipo entiende claramente el lifecycle completo?

---

## Mini ejercicio de reflexión

Tomá tu diseño actual o imaginario y respondé:

1. ¿Qué relación hay entre access token y refresh token?
2. ¿Cuánto dura cada uno?
3. ¿Qué pasa si se roba el access token?
4. ¿Qué pasa si se roba el refresh token?
5. ¿Qué ocurre al usar refresh dos veces con el mismo token viejo?
6. ¿Qué pasa al hacer logout?
7. ¿Qué pasa tras cambio de password?
8. ¿Qué parte del lifecycle del refresh hoy está menos gobernada?

Ese ejercicio suele mostrar muy rápido si el refresh token realmente mejora el modelo o si solo agrega complejidad sin suficiente control.

---

## Resumen

Los refresh tokens existen para permitir access tokens cortos sin obligar a login continuo.

Pero justamente por eso son una credencial muy sensible.

Conviene que tengan, como mínimo:

- duración razonable
- lifecycle claro
- revocación
- idealmente rotación
- respuesta a reuse
- invalidación tras eventos sensibles
- trazabilidad

En resumen:

> Un refresh token bien diseñado extiende acceso de forma controlada.  
> Un refresh token flojo convierte el acceso prolongado en una superficie difícil de revocar y muy valiosa para quien logre robarla.

---

## Próximo tema

**Revocación y logout real**
