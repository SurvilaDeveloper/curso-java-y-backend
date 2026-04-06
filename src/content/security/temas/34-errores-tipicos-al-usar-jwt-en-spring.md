---
title: "Errores típicos al usar JWT en Spring"
description: "Qué errores de diseño e implementación aparecen con frecuencia al usar JWT en una aplicación Java con Spring Boot y Spring Security. Cómo reconocerlos, por qué son peligrosos y qué decisiones ayudan a no convertir el token en una fuente de acoplamiento, revocación débil o confianza excesiva."
order: 34
module: "Sesiones, JWT y control del estado"
level: "base"
draft: false
---

# Errores típicos al usar JWT en Spring

## Objetivo del tema

Identificar los errores más comunes que aparecen cuando una aplicación Java + Spring Boot + Spring Security usa JWT, para no quedarse con la idea de que “si el token está firmado, entonces ya está todo resuelto”.

Este tema importa mucho porque JWT suele introducir problemas no por el formato en sí, sino por cómo se lo usa:

- como sustituto de cualquier otra decisión de seguridad
- como contenedor de demasiada información
- como mecanismo de acceso difícil de revocar
- como credencial demasiado larga y demasiado poderosa
- como excusa para no pensar bien el lifecycle del acceso

En resumen:

> muchos problemas con JWT no vienen de que el token exista, sino de que el sistema le delega demasiado poder, demasiada duración o demasiada verdad.

---

## Idea clave

JWT puede funcionar muy bien cuando se usa con criterio.

Pero también puede convertirse en una fuente de deuda importante cuando el equipo lo trata como:

- una sesión mágica
- una mini base de datos firmada
- una credencial eterna
- una forma de evitar pensar revocación, logout y cambios de estado

En resumen:

> el error no es “usar JWT”.  
> El error es usarlo sin una política clara sobre contenido, duración, revocación, almacenamiento y relación con el estado real del sistema.

---

## Error 1: meter demasiada información dentro del token

Este es uno de los errores más comunes.

### Ejemplo mental de token inflado

- id
- email
- nombre
- roles
- permisos finos
- tenant
- estado de cuenta
- configuraciones
- preferencias
- flags internos
- datos de negocio

### ¿Qué problema hay?

Mientras más información cargás en el JWT:

- más se acopla el token al modelo interno
- más cuesta cambiar estructuras
- más difícil se vuelve reflejar cambios de estado rápido
- más tentador es confiar ciegamente en claims viejos
- más contexto regalás si el token se expone

### Regla sana general

Poner lo mínimo razonable.

---

## Error 2: access tokens demasiado largos

Otro clásico.

### Ejemplo de mala idea

- access token válido por días
- o por semanas
- “porque así el usuario no tiene que loguearse seguido”

### Problemas

- si el token se roba, el daño dura más
- revocar se vuelve más importante y más difícil
- cambios de permisos tardan más en reflejarse
- la pérdida de control del backend crece

Un access token suele ser más sano cuando es relativamente corto y el diseño piensa bien el resto del lifecycle.

---

## Error 3: no tener una estrategia clara de refresh token

Muchos sistemas emiten:

- access token
- refresh token

pero tratan al refresh token como un detalle menor.

Eso es peligroso.

### Por qué

El refresh token puede volverse una credencial muy poderosa, porque permite seguir obteniendo acceso nuevo.

Si está mal tratado, puede ser incluso más delicado que el access token.

### Señales de ruido

- refresh token muy largo sin criterio
- sin rotación
- sin revocación
- sin invalidación tras ciertos eventos
- almacenado de forma demasiado expuesta
- sin trazabilidad suficiente

---

## Error 4: logout decorativo

Este error aparece muchísimo con JWT.

### Ejemplo mental

- el frontend borra el token localmente
- pero el backend no invalida nada
- y el token sigue siendo plenamente válido hasta expirar

### Problema

Eso hace que el logout sea más una decisión de cliente que una decisión real del sistema.

Si el token ya fue copiado o robado, sigue sirviendo mientras dure.

Por eso, si el sistema promete logout real, necesita una política más seria de lifecycle y revocación.

---

## Error 5: no pensar qué pasa si cambian permisos o estado de cuenta

Supongamos que el token incluye:

- rol
- authorities
- estados relevantes

Y después ocurre algo como:

- el usuario pierde privilegios
- la cuenta se bloquea
- la cuenta se deshabilita
- cambia el tenant
- se revoca acceso por incidente

### Pregunta crítica

¿Qué pasa con los tokens ya emitidos?

Si el diseño no responde bien eso, puede quedar un período incómodo donde el token sigue diciendo una cosa y el backend ya debería tratar al actor de otra forma.

Este es uno de los trade-offs más importantes de JWT.

---

## Error 6: usar JWT para cualquier cosa “porque ya está implementado”

Otra mala práctica común es usar JWT por inercia en contextos donde no aporta suficiente valor.

Por ejemplo:

- app web clásica con backend centralizado
- necesidad fuerte de revocación y logout real
- poco beneficio real del stateless
- equipo que ya necesita reintroducir bastante estado alrededor del token

Ahí JWT puede terminar siendo más complejidad que solución.

No es un error técnico puntual.
Es un error de elección arquitectónica.

---

## Error 7: validar mal el token o confiar demasiado en un parseo flojo

Otro riesgo típico es implementar el filtro JWT con demasiada ingenuidad.

### Qué debería verificarse conceptualmente

- firma válida
- formato válido
- expiración
- emisor, si el diseño lo requiere
- subject coherente
- claims esperados
- que no sea un token claramente inválido o fuera de contexto

### Mala idea

- parsear “lo que haya”
- asumir que si vino algo parecido a un token ya alcanza
- no centralizar bien la validación
- meter lógica rara o incompleta en el filtro

El filtro JWT debería ser bastante estricto y claro sobre qué considera un token aceptable.

---

## Error 8: hacer del filtro JWT una bolsa de lógica

Esto también aparece mucho.

### Ejemplo de problemas típicos

- el filtro valida token
- además hace consultas de negocio
- además decide permisos finos
- además maneja errores con demasiada lógica
- además resuelve cosas que deberían vivir en service o autorización

### Por qué es mala idea

El filtro debería enfocarse en:

- extraer token
- validarlo
- reconstruir identidad
- poblar contexto de seguridad

Mientras más negocio metés ahí, más difícil queda de mantener, testear y endurecer.

---

## Error 9: almacenar el token del lado cliente de forma demasiado expuesta

JWT no es inseguro “por ir del lado cliente”.
Pero dónde y cómo lo guarda el cliente importa muchísimo.

Si el sistema guarda tokens de forma demasiado expuesta o con demasiado poder, el riesgo crece bastante.

No hace falta resolver todo ese tema acá, pero sí conviene dejar clara la idea:

> un JWT útil para autenticación es una credencial.  
> Y una credencial mal guardada del lado cliente sigue siendo una credencial robable.

Por eso no alcanza con decir “es un token firmado”.
También importa el lifecycle completo.

---

## Error 10: usar JWT como sustituto de autorización real

A veces el sistema mete roles y permissions en claims y después actúa como si eso ya resolviera toda la autorización.

Eso es peligroso porque:

- el token puede estar desactualizado
- la autorización real depende también de recurso y contexto
- ownership y estado siguen importando
- no todo permiso cabe bien como claim estático

JWT puede ayudar a transportar identidad o algo de contexto, pero no reemplaza el razonamiento completo de autorización.

---

## Error 11: creer que “stateless” elimina la necesidad de estado de seguridad

Aunque JWT reduzca la dependencia de sesión clásica por request, siguen existiendo preguntas de estado como:

- refresh tokens válidos
- revocación
- logout
- recuperación de cuenta
- sesiones de dispositivo
- MFA
- cuenta bloqueada
- password cambiada

Si el equipo adopta JWT para “evitar todo estado”, suele terminar improvisando tarde y mal alrededor de esos problemas.

---

## Error 12: no poder explicar el lifecycle completo

Este error es muy revelador.

Si el equipo no puede explicar claramente:

- cómo se emite el token
- cuánto dura
- qué contiene
- cómo se valida
- dónde se guarda
- cómo se renueva
- cómo se revoca
- qué pasa al hacer logout
- qué pasa tras cambio de password
- qué pasa si el usuario pierde permisos

entonces el problema no es solo técnico.
También es de comprensión arquitectónica.

Y en seguridad, lo que no se entiende bien se gobierna mal.

---

## Ejemplo de diseño ingenuo

```java
public AuthResponse login(LoginRequest request) {
    Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
            )
    );

    SecurityUser principal = (SecurityUser) authentication.getPrincipal();

    String token = jwtService.generateToken(principal); // largo, con muchos claims, sin estrategia clara

    return new AuthResponse(token);
}
```

### Qué hace ruido potencialmente

- no se ve duración razonable
- no se ve refresh
- no se ve política de revocación
- no se ve criterio sobre claims
- no se ve qué pasa tras logout o incidentes
- se trata al token como producto final, sin lifecycle claro

El problema no es la línea en sí.
Es la falta de modelo alrededor.

---

## Ejemplo más sano, conceptualmente

Un diseño más sano suele pensar JWT así:

- access token corto
- claims mínimos
- refresh token tratado con más cuidado
- filtro JWT enfocado en validación e identidad
- política clara de revocación y logout
- decisiones explícitas sobre cambios de password, bloqueo y permisos

No hace falta mostrar toda la implementación para ver la diferencia conceptual.

---

## Claims mínimos razonables

Una idea sana para un access token suele ser incluir cosas como:

- `sub`
- `exp`
- `iat`
- quizá `iss`
- quizá un identificador técnico básico si el diseño lo necesita

Y poco más, salvo necesidad real.

Mientras más claims agregás, más cargás el token de verdad contextual que puede quedar vieja, expuesta o difícil de invalidar.

---

## Qué relación tiene esto con expiración corta

Muchos errores de JWT se amortiguan un poco cuando el access token es corto.

¿Por qué?

Porque si un token:

- roba menos tiempo útil
- caduca antes
- necesita refresh controlado

entonces:

- se reduce la ventana de abuso
- se reduce el costo de permisos desactualizados
- se mejora un poco la capacidad de respuesta

No resuelve todo, pero ayuda muchísimo.

---

## Qué relación tiene esto con refresh token

Justamente porque el access token corto mejora bastante el modelo, suele aparecer la necesidad de refresh token.

Pero ahí hay que ser serio con:

- duración
- almacenamiento
- rotación
- revocación
- invalidación al cambiar password
- invalidación al cerrar sesión
- trazabilidad

JWT bien usado rara vez significa “solo un token y listo”.
Suele implicar un pequeño ecosistema de lifecycle.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- JWT elegido por una razón clara
- access token acotado
- claims mínimos
- filtro enfocado
- lifecycle entendible
- refresh token tratado como credencial sensible
- estrategia clara para logout y revocación
- poca confianza ingenua en claims viejos
- equipo que entiende bien el modelo

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- access token largo
- claims inflados
- permisos completos embebidos sin necesidad
- logout decorativo
- cero revocación
- refresh token flojo
- filtro JWT con demasiada lógica
- tokens usados como sustituto de cualquier consulta o decisión
- nadie sabe explicar cómo se corta acceso en un incidente

---

## Qué gana la app si evita estos errores

Cuando JWT se usa con más criterio, la app gana:

- menor superficie de error
- lifecycle más gobernable
- menos acoplamiento
- menor riesgo al robar tokens
- mejor ajuste entre identidad transportada y estado real
- menos decisiones “modernas” tomadas por moda
- más claridad para operar incidentes o cambios de cuenta

No es solo una mejora técnica.
Es una mejora real de control sobre acceso.

---

## Checklist práctico

Cuando revises JWT en una app Spring, preguntate:

- ¿el access token dura demasiado?
- ¿qué claims contiene?
- ¿hay cosas que sobran dentro del token?
- ¿existe refresh token y cómo se maneja?
- ¿cómo funciona el logout?
- ¿cómo funciona la revocación?
- ¿qué pasa si cambian permisos o estado de cuenta?
- ¿qué hace exactamente el filtro JWT?
- ¿dónde se almacena el token del lado cliente?
- ¿el equipo puede explicar el lifecycle completo de punta a punta?

---

## Mini ejercicio de reflexión

Tomá tu implementación actual o imaginaria y respondé:

1. ¿Qué lleva hoy tu JWT?
2. ¿Cuánto dura?
3. ¿Qué problema concreto resolvió elegirlo?
4. ¿Qué pasa si el token se roba?
5. ¿Qué pasa si el usuario pierde un permiso mientras su token sigue vigente?
6. ¿Qué pasa al hacer logout?
7. ¿Qué parte del diseño te parece más floja hoy: claims, duración, refresh, revocación o almacenamiento?

Ese ejercicio suele mostrar muy rápido si el sistema usa JWT con criterio o solo porque “así se hace ahora”.

---

## Resumen

Los errores típicos al usar JWT suelen aparecer cuando el sistema:

- mete demasiada información en el token
- le da demasiada duración
- ignora revocación y logout
- trata refresh token sin suficiente cuidado
- confía demasiado en claims
- mezcla demasiado negocio en el filtro
- adopta JWT sin necesidad real

En resumen:

> JWT puede funcionar muy bien, pero solo si el backend no lo trata como una sesión mágica y eterna.  
> Necesita límites, lifecycle y una política clara de qué transporta, cuánto dura y cómo deja de valer.

---

## Próximo tema

**Refresh tokens**
