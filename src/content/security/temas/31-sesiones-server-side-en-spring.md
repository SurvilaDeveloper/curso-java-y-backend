---
title: "Sesiones server-side en Spring"
description: "Cómo pensar sesiones server-side en una aplicación Java con Spring Boot y Spring Security. Qué problema resuelven, qué ventajas y riesgos tienen frente a otros enfoques y qué decisiones importan para manejar identidad, expiración, revocación y seguridad de sesión con más criterio."
order: 31
module: "Sesiones, JWT y control del estado"
level: "base"
draft: false
---

# Sesiones server-side en Spring

## Objetivo del tema

Entender cómo funcionan y cómo conviene pensar las **sesiones server-side** en una aplicación Java + Spring Boot + Spring Security, para no tratarlas como una reliquia “vieja” frente a JWT ni como una caja negra que simplemente aparece cuando el login sale bien.

Este tema importa mucho porque, en la práctica, muchísimos sistemas siguen necesitando resolver algo bastante básico pero muy importante:

- cómo recordar que un usuario ya se autenticó
- cómo mantener ese estado entre requests
- cómo invalidarlo
- cómo controlarlo
- cómo evitar que se convierta en una fuente de secuestro de sesión, sesiones eternas o identidades difíciles de revocar

En resumen:

> una sesión no es solo un detalle de infraestructura.  
> Es la forma concreta en que el backend mantiene y gobierna el estado autenticado de un actor a lo largo del tiempo.

---

## Idea clave

Una sesión server-side significa que el **estado autenticado real vive del lado del servidor**, y el cliente solo conserva un identificador de sesión.

En resumen:

> el navegador o cliente no guarda toda la identidad autenticada.  
> Guarda una referencia a una sesión cuyo estado real controla el backend.

Eso cambia bastante la forma de pensar cosas como:

- revocación
- expiración
- logout
- invalidación
- cambios de permisos
- trazabilidad
- riesgo de robo de sesión

---

## Qué problema resuelven las sesiones

Después del login, el backend necesita evitar que el usuario tenga que mandar email y contraseña en cada request.

Entonces aparece la necesidad de mantener un estado como:

- este actor ya se autenticó
- esta identidad sigue siendo válida
- esta sesión sigue activa
- este request pertenece a ese usuario autenticado

Las sesiones resuelven precisamente eso.

---

## Qué significa “server-side”

Significa que el backend conserva el estado de autenticación en el servidor, normalmente asociado a una sesión identificada por algo como:

- un ID de sesión
- una cookie de sesión
- una entrada en memoria
- una entrada en Redis o store equivalente
- un registro de contexto autenticado

El cliente no lleva consigo toda la “verdad” del estado autenticado.
Lleva una referencia.

---

## Modelo mental básico

Una forma simple de pensarlo es así:

### 1. Login correcto
El usuario presenta credenciales válidas.

### 2. El backend crea o consolida una sesión
Asocia esa sesión a una identidad autenticada.

### 3. El backend entrega un identificador
Normalmente mediante cookie.

### 4. En cada request siguiente
El cliente reenvía ese identificador.

### 5. El backend resuelve la sesión
Y reconstruye o recupera el contexto autenticado.

### 6. Si la sesión expira o se invalida
El acceso deja de ser válido.

---

## Diferencia conceptual con JWT

Esto conviene dejarlo bien claro.

## En sesión server-side
- el estado vive en el servidor
- el cliente guarda una referencia

## En JWT típico
- gran parte del estado de identidad viaja en el token
- el backend valida ese token y reconstruye identidad a partir de él

No significa que uno sea automáticamente mejor que el otro.

Significa que reparten de forma distinta:

- control
- revocación
- dependencia del backend
- riesgo de robo
- lifecycle del acceso

---

## Cuándo suelen ser una muy buena opción

Las sesiones server-side suelen encajar muy bien cuando:

- el backend y el frontend pertenecen al mismo sistema
- el flujo es tipo web app clásica o BFF
- se quiere facilitar revocación
- se quiere mantener más control centralizado del acceso
- se valora un logout real más directo
- el sistema no necesita tanto estilo stateless
- el entorno y el tráfico hacen razonable mantener estado del lado servidor

No son “anticuadas”.
Simplemente responden mejor a ciertos contextos que otros.

---

## Error mental clásico

Mucha gente piensa algo como:

- “las sesiones son inseguras y JWT es moderno”
- “si es server-side, ya está resuelto”
- “si Spring maneja la sesión, no hace falta pensar mucho”
- “logout ya se encarga solo”
- “como el cliente no tiene el token completo, no hay riesgo relevante”

Todo eso es demasiado simplista.

Las sesiones pueden ser una excelente opción, pero igual exigen pensar bien cosas como:

- cookie segura
- fijación de sesión
- expiración
- invalidación
- sesión concurrente
- secuestro de sesión
- rotación o renovación del identificador
- cambios de privilegios o password
- almacenamiento de sesión

---

## Qué suele usar Spring en este modelo

En una arquitectura clásica con Spring Security, la autenticación puede integrarse con sesión usando piezas como:

- `SecurityFilterChain`
- `HttpSession`
- `JSESSIONID`
- `SecurityContext`
- `SecurityContextRepository`
- cookies de sesión
- configuración de session management

No hace falta obsesionarse con todos los nombres internos desde el principio.
Lo importante es entender el flujo.

---

## Qué suele pasar en Spring tras un login exitoso

En un flujo típico con sesiones:

### 1. El usuario se autentica
Por ejemplo con username/password.

### 2. Spring Security establece el `SecurityContext`
Con la identidad autenticada.

### 3. Ese contexto se asocia a la sesión HTTP
Del lado servidor.

### 4. El cliente recibe una cookie de sesión
Por ejemplo `JSESSIONID`.

### 5. En requests siguientes
La cookie vuelve y Spring recupera el contexto autenticado.

Eso da una experiencia continua sin reenviar credenciales primarias cada vez.

---

## La cookie no es la sesión

Esto es importante.

La cookie de sesión no es toda la identidad autenticada.
Es el identificador con el que el servidor encuentra la sesión real.

En resumen:

> robar la cookie puede ser muy grave, pero conceptualmente la cookie no “contiene” toda la verdad del usuario; contiene la referencia para que el servidor la recupere.

Este detalle importa porque cambia cómo pensás:

- revocación
- rotación
- logout
- invalidación global
- cambios de permisos

---

## Qué ventaja grande tienen las sesiones server-side

Una ventaja fuerte es el control centralizado.

Como el estado vive en backend, suele ser más fácil:

- invalidar una sesión concreta
- invalidar todas las sesiones de un usuario
- aplicar cambios de permisos con más control
- hacer logout real
- expirar acceso de forma más inmediata
- revocar sesiones luego de cambio de password o incidente

Eso es algo muy valioso en muchos sistemas.

---

## Qué costo tienen

Nada es gratis.

Las sesiones server-side también traen costos o tensiones como:

- almacenamiento de estado
- escalado y afinidad de sesión si la arquitectura lo requiere
- necesidad de un store compartido si hay múltiples instancias
- complejidad operativa en despliegues distribuidos
- atención especial al lifecycle
- dependencia más explícita de infraestructura de estado

No siempre es un problema, pero sí es una decisión arquitectónica real.

---

## Qué riesgos principales existen con sesiones

Cuando pensás sesiones, algunos riesgos muy importantes son:

- session fixation
- session hijacking
- cookies mal protegidas
- sesiones eternas o demasiado largas
- sesiones no invalidadas
- múltiples sesiones fuera de control
- falta de revocación al cambiar password
- logout cosmético
- exposición de sesión por transporte o frontend inseguro

No alcanza con “tener sesiones”.
Hay que gobernarlas bien.

---

## Session fixation

Este problema aparece cuando un atacante logra que la víctima use un identificador de sesión ya conocido antes del login, y luego esa misma sesión queda autenticada.

### Idea central

Si el identificador de sesión no se renueva adecuadamente cuando ocurre el login, un atacante que ya conocía ese ID podría quedar mejor posicionado para secuestrar la sesión.

### Qué conviene

Tras autenticación exitosa, conviene que el sistema:

- renueve el identificador de sesión
- no conserve sin más el mismo ID previo al login
- use las protecciones adecuadas del framework

Esto es una parte muy importante del lifecycle de sesión.

---

## Session hijacking

Acá el problema es el robo o reutilización del identificador de sesión.

Si alguien obtiene la cookie de sesión por alguna vía, puede intentar presentarse como el usuario mientras esa sesión siga viva y válida.

Por eso importa muchísimo:

- proteger la cookie
- usar HTTPS
- usar atributos correctos
- limitar duración
- invalidar cuando corresponda
- evitar exposición del identificador por otros canales

---

## La cookie de sesión merece tratamiento de seguridad real

En una app con sesiones, la cookie de sesión es un activo importante.

Por eso suelen importar atributos como:

- `HttpOnly`
- `Secure`
- `SameSite`

No hace falta desarrollar todo eso en profundidad en este tema porque viene enseguida, pero sí importa dejar claro que:

> una sesión server-side fuerte sigue dependiendo de una cookie bien protegida.

---

## Expiración de sesión

Una sesión no debería durar para siempre.

### Preguntas importantes

- ¿cuánto dura una sesión inactiva?
- ¿cuánto dura una sesión aunque haya actividad?
- ¿qué pasa tras cambio de password?
- ¿qué pasa tras revocación manual?
- ¿qué pasa tras sospecha de compromiso?
- ¿qué pasa con sesiones muy viejas?

Pensar la expiración es parte real de la seguridad, no un detalle de UX solamente.

---

## Idle timeout vs duración absoluta

Conviene distinguir dos cosas:

## Expiración por inactividad
Si el usuario deja de usar la sesión cierto tiempo, se invalida.

## Expiración absoluta
Aunque haya actividad, la sesión no vive indefinidamente.

Las dos pueden ser útiles.
No todos los sistemas necesitan los mismos valores, pero pensar ambas dimensiones suele mejorar bastante el modelo.

---

## Logout real en sesiones

Una ventaja de las sesiones server-side es que el logout puede ser realmente más “real”.

### Porque el backend puede
- invalidar la sesión
- eliminar el contexto autenticado
- destruir la referencia asociada
- cortar el acceso de inmediato para esa sesión

Eso es conceptualmente más directo que en modelos totalmente stateless.

### Pero ojo

No alcanza con que el frontend borre una cookie localmente.
Conviene que el backend invalide también el estado real.

---

## Qué pasa cuando cambia la password

Este es un caso importante.

Si un usuario cambia o resetea la password, conviene pensar:

- ¿las sesiones activas siguen siendo válidas?
- ¿deberían invalidarse todas?
- ¿solo algunas?
- ¿qué pasa con dispositivos recordados?
- ¿qué pasa con sesiones viejas?

En muchos sistemas, invalidar sesiones activas tras cambio de contraseña mejora mucho la contención ante compromiso de cuenta.

---

## Qué pasa cuando cambian roles o permisos

Otro punto que vuelve valiosas a las sesiones server-side es la posibilidad de controlar más centralmente el efecto de cambios de estado.

Preguntas útiles:

- si el usuario pierde un rol, ¿sus sesiones actuales siguen con el viejo contexto?
- si la cuenta es bloqueada, ¿cuánto tarda en reflejarse?
- si soporte desactiva la cuenta, ¿qué pasa con sesiones abiertas?

Como el estado está del lado servidor, suele ser más fácil construir políticas claras de invalidación o refresh del contexto.

---

## Múltiples sesiones concurrentes

Otra decisión importante es si permitís:

- una sola sesión por usuario
- varias sesiones simultáneas
- un límite razonable
- sesiones por dispositivo
- invalidación selectiva

No hay una única respuesta universal.
Pero ignorar el tema puede dejar cosas raras como:

- demasiadas sesiones abiertas
- poca visibilidad de dónde está logueado el usuario
- dificultad para revocar de forma precisa

---

## Dónde se guardan las sesiones

En entornos simples, puede bastar con almacenamiento en memoria local.

Pero en sistemas con múltiples instancias o arquitectura distribuida, esto puede tensionarse bastante.

Ahí suelen aparecer opciones como:

- store compartido
- Redis
- mecanismos equivalentes

La decisión no es solo técnica de infraestructura.
También afecta:

- revocación
- coherencia
- escalado
- observabilidad
- respuesta a incidentes

---

## Ejemplo conceptual de login con sesión

### Controller

```java
@PostMapping("/auth/login")
public ResponseEntity<Void> login(@Valid @RequestBody LoginRequest request) {
    authService.login(request);
    return ResponseEntity.noContent().build();
}
```

### Service conceptual

```java
public void login(LoginRequest request) {
    authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                    request.getEmail().trim().toLowerCase(),
                    request.getPassword()
            )
    );
}
```

En un modelo integrado con Spring Security, luego del éxito de autenticación el framework puede asociar el contexto autenticado a la sesión HTTP y devolver la cookie de sesión correspondiente.

### Qué importa conceptualmente

- password se valida
- identidad se establece
- sesión se vuelve el portador de continuidad
- la cookie referencia esa sesión

---

## Qué decisiones conviene dejar claras en la arquitectura

Si elegís sesiones server-side, conviene definir desde el principio cosas como:

- cuánto dura la sesión
- cuándo rota el ID
- cuándo se invalida
- qué logout significa realmente
- qué pasa con sesiones paralelas
- qué pasa tras cambio de password
- qué pasa tras bloqueo de cuenta
- cómo se almacenan en producción
- qué observabilidad existe sobre sesiones activas

Si eso no está claro, la sesión suele quedar “funcionando” pero mal gobernada.

---

## Señales de diseño sano

Una implementación más sana suele mostrar:

- identidad bien asociada a sesión
- rotación o protección frente a fixation
- expiración razonable
- invalidación real en logout
- política clara sobre cambio de password y revocación
- buena protección de cookie
- visión clara sobre sesiones concurrentes
- almacenamiento coherente con la arquitectura del despliegue

---

## Señales de ruido

Estas cosas suelen hacer ruido rápido:

- sesiones eternas
- logout que solo borra frontend
- cookie poco protegida
- ninguna política de invalidación
- cambio de password que deja todo igual
- nadie sabe cuántas sesiones activas puede tener un usuario
- session store improvisado para producción
- el equipo trata la sesión como “algo que hace Spring” sin pensar el lifecycle

---

## Qué relación tienen las sesiones con autorización

La sesión resuelve continuidad de identidad, no reemplaza autorización real.

Es decir:

- una sesión válida dice quién es el actor actual
- pero no resuelve por sí sola qué puede hacer en cada recurso y contexto

Eso sigue perteneciendo a autorización.

La ventaja es que, al controlar mejor la identidad desde backend, suele resultar más sencillo revocar y recalcular ese acceso cuando cambian estados importantes.

---

## Checklist práctico

Cuando revises sesiones server-side en una app Spring, preguntate:

- ¿dónde vive realmente el estado autenticado?
- ¿qué guarda el cliente y qué guarda el servidor?
- ¿qué pasa con el ID de sesión después del login?
- ¿qué protección hay contra session fixation?
- ¿cómo se protege la cookie?
- ¿cuánto dura la sesión?
- ¿hay expiración por inactividad y/o absoluta?
- ¿qué hace realmente el logout?
- ¿qué pasa con sesiones abiertas tras cambio de password o bloqueo de cuenta?
- ¿cuántas sesiones simultáneas permite el sistema?
- ¿cómo se almacenan las sesiones en producción?

---

## Mini ejercicio de reflexión

Tomá tu arquitectura actual o imaginaria con sesiones y respondé:

1. ¿Qué se guarda del lado cliente?
2. ¿Qué se guarda del lado servidor?
3. ¿Qué pasa exactamente al hacer login?
4. ¿Qué pasa exactamente al hacer logout?
5. ¿Qué pasa si alguien roba la cookie de sesión?
6. ¿Qué pasa si el usuario cambia su password?
7. ¿Qué parte del lifecycle de sesión hoy está menos pensada?

Ese ejercicio suele mostrar muy rápido si el sistema realmente gobierna sus sesiones o solo las tolera porque “así viene por defecto”.

---

## Resumen

Las sesiones server-side son una forma muy válida de manejar estado autenticado en Spring.

Su idea central es:

- el servidor conserva el estado real
- el cliente conserva una referencia

Eso suele dar ventajas importantes en:

- revocación
- logout real
- invalidación
- control centralizado

Pero también exige pensar bien:

- cookies
- expiración
- fixation
- hijacking
- sesiones concurrentes
- lifecycle completo

En resumen:

> Las sesiones server-side no son viejas ni mágicas.  
> Son una decisión arquitectónica concreta para mantener identidad autenticada con más control del lado servidor, y ese control solo vale si el backend lo gobierna bien.

---

## Próximo tema

**Cookies seguras y backend Java**
