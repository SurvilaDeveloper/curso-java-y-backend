---
title: "Cómo proteger endpoints en Spring Security y distinguir rutas públicas de privadas"
description: "Entender cómo empezar a proteger endpoints con Spring Security, cómo separar rutas públicas de rutas privadas y por qué esta decisión es uno de los primeros pasos concretos para tener una API realmente segura."
order: 60
module: "Seguridad con Spring Security"
level: "intermedio"
draft: false
---

En el tema anterior viste una idea muy importante:

cuando aparece seguridad con Spring Security, el backend deja de pensar solo en **qué hace** cada endpoint y empieza a pensar también en:

- quién lo llama
- si está autenticado
- si tiene permiso
- bajo qué identidad se ejecuta la operación

Eso cambia bastante la forma de diseñar la API.

Ahora toca dar uno de los primeros pasos concretos de ese mundo:

> decidir qué endpoints son públicos y cuáles deben estar protegidos.

Porque una de las primeras preguntas reales al introducir seguridad es esta:

- ¿qué puede consumir cualquiera?
- ¿qué requiere login?
- ¿qué debería bloquearse por completo si no hay autenticación?

Este tema es clave porque te ayuda a convertir la idea abstracta de seguridad en una política visible y concreta sobre las rutas de la aplicación.

## El problema de una API completamente abierta

Supongamos que tenés endpoints como estos:

- `POST /auth/login`
- `POST /auth/register`
- `GET /productos`
- `POST /productos`
- `GET /pedidos/{id}`
- `GET /usuarios/me`
- `GET /admin/reportes`

Si no existe ninguna política de seguridad clara, la situación implícita puede terminar siendo:

- cualquiera puede leer todo
- cualquiera puede modificar recursos sensibles
- cualquiera puede entrar a endpoints de administración
- cualquiera puede consultar datos que deberían ser privados

Eso, en una aplicación real, es claramente un problema.

Entonces una de las primeras tareas al introducir Spring Security es establecer fronteras de acceso.

## Qué significa que una ruta sea pública

Una ruta pública es una ruta que no requiere autenticación previa.

Es decir:

> cualquier cliente puede invocarla sin haber demostrado identidad.

Ejemplos típicos de rutas públicas:

- registro
- login
- healthcheck
- documentación pública
- catálogo visible
- contenido público del sitio

No significa que todo endpoint público sea inocente o trivial.
Significa que no exige login para ser consumido.

## Qué significa que una ruta sea privada

Una ruta privada es una ruta que sí requiere autenticación.

Es decir:

> para entrar, el cliente primero debe estar identificado de alguna forma válida.

Ejemplos típicos:

- ver mi perfil
- consultar mis pedidos
- actualizar mis datos
- crear contenido privado
- endpoints administrativos
- operaciones sensibles del sistema

Una ruta privada no necesariamente implica que cualquier usuario autenticado pueda hacer cualquier cosa.
Solo significa que **como mínimo** hay un requisito de autenticación.

Después puede venir una capa extra de autorización más fina.

## Por qué esta distinción es tan importante

Porque es una de las primeras formas de convertir la seguridad en decisiones explícitas.

Mientras no definas claramente qué rutas son públicas y cuáles privadas, la API queda en una especie de ambigüedad peligrosa.

Y esa ambigüedad suele traer problemas como:

- endpoints demasiado abiertos
- lógica de acceso dispersa
- protección inconsistente
- reglas difíciles de mantener

Entonces este paso no es menor.
Es uno de los cimientos del backend protegido.

## Qué hace Spring Security en este escenario

Spring Security permite interceptar requests antes de que lleguen libremente al controller y decidir si deben:

- pasar
- ser rechazadas
- requerir autenticación
- aplicar reglas adicionales de acceso

Eso es muy poderoso, porque evita que tengas que meter toda la seguridad manualmente dentro de cada endpoint con bloques repetitivos.

La idea general es:

> definís reglas de acceso y Spring Security las aplica dentro del flujo web de la aplicación.

## Qué cambia al pensar en endpoints públicos y privados

Antes podías pensar una ruta solo así:

```text
GET /productos
```

Ahora tenés que pensar algo más como:

```text
GET /productos → ¿pública o privada?
```

Y para algo como:

```text
POST /productos
```

la pregunta se vuelve todavía más importante:

- ¿debe ser privada?
- ¿solo autenticada?
- ¿solo admin?
- ¿solo ciertos roles?

Este tema se enfoca en la primera capa de esa decisión:
**rutas públicas vs autenticadas**.

## Un ejemplo muy común de clasificación inicial

Podrías tener algo así:

### Públicas
- `POST /auth/login`
- `POST /auth/register`
- `GET /productos`
- `GET /categorias`

### Privadas
- `GET /usuarios/me`
- `GET /pedidos/mis-pedidos`
- `POST /pedidos`
- `PUT /usuarios/me`

### Más restringidas todavía
- `POST /productos`
- `DELETE /productos/{id}`
- `GET /admin/reportes`

Aunque todavía no estamos entrando a roles finos, ya se ve que la clasificación de acceso es muy importante.

## El primer diseño de seguridad no suele ser “todo o nada”

No se trata solo de dos extremos:

- todo abierto
- todo cerrado

Lo más común en una aplicación real es un mapa mixto donde:

- algunas rutas son públicas
- otras requieren autenticación
- otras requieren además permisos especiales

Por eso este tema es tan importante: te obliga a empezar a dibujar ese mapa.

## Un ejemplo de configuración conceptual

En Spring Security moderno, suele aparecer una configuración donde definís reglas sobre rutas.

Conceptualmente, algo así:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
}
```

Y dentro de esa configuración, se expresan reglas de acceso.

No hace falta que memorices todavía todas las APIs exactas ni cada detalle del DSL.
Lo importante primero es entender el tipo de decisión que estás modelando.

## Un ejemplo muy didáctico

Supongamos una configuración conceptual como esta:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/productos", "/categorias").permitAll()
                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
```

Más allá de que luego profundizarás mucho más en cada parte, este ejemplo ya deja clarísima la idea central.

## Cómo leer esta configuración

```java
.requestMatchers("/auth/**").permitAll()
```

Significa algo como:

> todas las rutas bajo `/auth/` son públicas.

Por ejemplo:

- `/auth/login`
- `/auth/register`

Luego:

```java
.requestMatchers("/productos", "/categorias").permitAll()
```

significa:

> esas rutas concretas también son públicas.

Y finalmente:

```java
.anyRequest().authenticated()
```

significa:

> cualquier request que no haya sido explícitamente marcada como pública requerirá autenticación.

Esta última línea es especialmente importante.

## Por qué `anyRequest().authenticated()` es tan valioso

Porque evita dejar rutas abiertas por accidente cuando olvidaste configurarlas explícitamente como públicas.

Dicho de otro modo:

> todo lo que no declaraste como abierto pasa a exigir autenticación.

Ese enfoque suele ser mucho más seguro que el inverso.

Es una idea muy sana:
cerrar por defecto y abrir solo lo que realmente querés exponer.

## Qué significa `permitAll()`

`permitAll()` significa justamente eso:

> permitir acceso sin requerir autenticación.

Es una forma clara de marcar rutas públicas.

No significa que la ruta no tenga lógica o validación.
Solo significa que Spring Security no exige identidad previa para dejar pasar esa request.

## Qué significa `authenticated()`

`authenticated()` significa:

> esta request requiere un usuario autenticado válido.

Todavía no está diciendo nada sobre roles concretos o permisos finos.
Solo dice que el cliente no puede ser anónimo.

Eso ya es una capa de protección muy importante.

## Un ejemplo concreto de lectura de política

Si tenés algo como esto:

```java
.requestMatchers("/auth/**").permitAll()
.requestMatchers("/productos", "/categorias").permitAll()
.anyRequest().authenticated()
```

el mapa mental sería:

### Públicos
- login
- register
- listado simple de productos
- listado simple de categorías

### Requieren login
- todo lo demás

Este tipo de política es un muy buen primer paso en muchas APIs.

## Qué pasa cuando una ruta protegida recibe una request anónima

Si una ruta está protegida y el cliente no está autenticado, Spring Security puede bloquear la request antes de que llegue normalmente al controller.

Desde el punto de vista HTTP, eso suele traducirse en una respuesta asociada a falta de autenticación, típicamente `401` según el mecanismo y la configuración usada.

La idea importante es esta:

> la protección ocurre como parte del pipeline de seguridad, no como un if manual dentro del método del controller.

Eso vuelve la API mucho más ordenada.

## Por qué esto es mejor que poner ifs manuales por todos lados

Podrías intentar algo así dentro de los controllers:

- si no hay usuario, devolver error
- si la ruta es sensible, bloquear
- repetir lógica similar una y otra vez

Pero eso suele ser:

- repetitivo
- propenso a errores
- difícil de mantener
- fácil de olvidar en un endpoint nuevo

Spring Security existe justamente para que esa protección pueda centralizarse e integrarse mejor al flujo web.

## Un ejemplo típico de rutas públicas

En muchas APIs reales, es común dejar públicas rutas como:

- `/auth/login`
- `/auth/register`
- `/health`
- `/actuator/health` en ciertos contextos
- documentación pública
- `/productos` para catálogo visible
- `/productos/{slug}` o variantes de lectura pública

Esto depende del sistema, claro.
Pero conceptualmente es muy frecuente que el acceso público se concentre en autenticación y contenido de lectura pública.

## Un ejemplo típico de rutas privadas

También es muy común que sean privadas cosas como:

- `/usuarios/me`
- `/pedidos/**`
- `/carrito/**`
- `/favoritos/**`
- endpoints de configuración personal
- endpoints de operaciones sensibles

La idea no es memorizar una lista universal.
Es entender el tipo de criterio que suele aplicarse.

## Qué cambia cuando el endpoint pertenece al usuario autenticado

Supongamos:

```text
GET /usuarios/me
```

Esa ruta casi no tiene sentido como pública.
Necesita identidad.

Porque el backend debe responder a la pregunta:

- ¿quién es “me”?

Eso hace que muchas rutas ligadas al usuario actual sean claramente privadas desde el diseño mismo.

## Qué pasa con un endpoint administrativo

Supongamos:

```text
GET /admin/reportes
```

Esa ruta ni siquiera debería estar en el mismo grupo que “rutas privadas genéricas”.
Probablemente requiera algo más fino que simple autenticación.

Pero incluso antes de entrar a roles, ya se entiende que:

- claramente no puede ser pública
- claramente necesita protección
- probablemente necesite una regla más fuerte

Eso muestra cómo la seguridad empieza con público/privado, pero no termina ahí.

## Una muy buena primera política

En muchísimas APIs, un primer enfoque sano es:

- abrir explícitamente solo lo necesario
- exigir autenticación para el resto

Eso suele verse muy parecido a:

```java
.requestMatchers(...).permitAll()
.anyRequest().authenticated()
```

Es una política bastante robusta para arrancar porque reduce el riesgo de dejar cosas abiertas por olvido.

## Qué relación tiene esto con login y registro

Muy fuerte.

Si tu aplicación tiene autenticación propia, rutas como:

- registro
- login

normalmente necesitan ser públicas.
De lo contrario, el usuario no podría ni entrar al sistema ni crear cuenta.

Eso hace que el módulo de auth sea uno de los primeros lugares donde esta distinción se vuelve evidente.

## Qué relación tiene esto con el catálogo o lectura pública

También muy común.

En muchos sistemas, leer el catálogo sí puede ser público, mientras que comprar, guardar favoritos o ver pedidos requiere autenticación.

Por ejemplo:

### Público
- `GET /productos`
- `GET /productos/{id}`

### Privado
- `POST /pedidos`
- `GET /pedidos/mis-pedidos`

Este tipo de mapa aparece muchísimo en apps reales.

## Qué cambia en el testing

Muchísimo.

Cuando las rutas dejan de ser abiertas, los tests web ya no solo preguntan:

- ¿responde 200?
- ¿valida bien el body?

Ahora también preguntan:

- ¿esta ruta pública realmente deja pasar sin autenticación?
- ¿esta ruta privada bloquea si no hay usuario?
- ¿la respuesta es 401 cuando corresponde?
- ¿la request autenticada sí entra?

Es decir, seguridad también pasa a formar parte del contrato de la API.

## Un ejemplo conceptual de test de ruta pública

Si `/productos` es pública, un test web podría verificar algo como:

- sin autenticación
- `GET /productos`
- responde `200 OK`

Eso te da confianza en que el mapa de rutas públicas quedó bien configurado.

## Un ejemplo conceptual de test de ruta privada

Si `/usuarios/me` es privada, un test podría verificar algo como:

- sin autenticación
- `GET /usuarios/me`
- responde con rechazo de acceso

Ese tipo de test empieza a volverse muy valioso apenas introducís seguridad.

## Qué relación tiene esto con el controller

El controller ya no controla solo casos de uso funcionales.
También vive dentro de un sistema de acceso donde algunas requests ni siquiera deberían llegar normalmente al método si no cumplen las reglas previas.

Eso cambia bastante la manera de pensar la capa web.

## Qué relación tiene esto con el service

Aunque mucha protección puede empezar a nivel de rutas, el service muchas veces sigue necesitando lógica adicional basada en identidad y permisos.

Por ejemplo:

- una ruta privada deja pasar solo usuarios autenticados
- pero después el service debe decidir si ese usuario puede actuar sobre un recurso concreto

O sea, proteger endpoints es importantísimo, pero no agota toda la seguridad de la aplicación.

## Una intuición importante

Podés pensar así:

### Proteger rutas
Responde a una pregunta gruesa:
> ¿quién puede entrar a este endpoint?

### Autorizar un caso de uso más fino
Responde a una pregunta más precisa:
> ¿este usuario concreto puede hacer esta acción concreta sobre este recurso concreto?

Este tema se enfoca sobre todo en la primera.

## Qué todavía no estás resolviendo por completo

Con rutas públicas y privadas ya estás avanzando muchísimo, pero todavía no estás entrando a fondo en:

- roles
- authorities
- `hasRole(...)`
- `hasAuthority(...)`
- ownership del recurso
- método por método con autorización más fina
- JWT
- filtros custom
- sesiones

Y está perfecto que así sea.

Primero conviene consolidar muy bien la distinción básica entre:

- endpoints abiertos
- endpoints que exigen autenticación

Esa base te va a ordenar todo lo demás.

## Un ejemplo de error de diseño muy común

Dejar público algo sensible “solo para probar” y olvidarte de cerrarlo después.

Eso pasa más de lo que parece.
Por eso una política como:

```java
.anyRequest().authenticated()
```

suele ser tan valiosa.
Reduce bastante el riesgo de exposición accidental.

## Otro error común

Abrir demasiadas rutas por comodidad:

- “después vemos”
- “por ahora lo dejo público”
- “más adelante lo cierro”

Eso puede funcionar durante unos minutos de desarrollo, pero si se convierte en costumbre puede dejar huecos peligrosos.

## Otro error común

Pensar que “privado” significa siempre “ya está todo resuelto”.

No.
Privado significa que como mínimo se exige autenticación.
Pero después puede haber reglas más finas según:

- rol
- ownership
- tenant
- estado del recurso
- permisos adicionales

Este tema es el primer escalón, no el final.

## Un buen criterio práctico

Podés preguntarte endpoint por endpoint:

- ¿debe poder entrar cualquier persona anónima?
- ¿o ya necesito una identidad válida?
- si requiere identidad, ¿es suficiente con eso o luego habrá reglas más finas?

Ese análisis ya mejora muchísimo el diseño del backend.

## Qué relación tiene esto con el frontend

Muy directa.

El frontend puede ocultar o mostrar botones según el estado de autenticación, pero la decisión real sobre acceso no puede depender del frontend.

El backend debe seguir aplicando sus propias reglas.

Eso significa que aunque una ruta “parezca privada” desde la interfaz, si el backend no la protege de verdad, sigue siendo un problema.

## Qué relación tiene esto con diseño de API

También es importante.

A veces la simple existencia de un endpoint ya te obliga a pensar su nivel de exposición.

Por ejemplo:

- `GET /me` sugiere autenticación
- `GET /admin/...` sugiere una restricción fuerte
- `POST /auth/login` sugiere acceso público
- `GET /productos` puede ser público o privado según el producto

Es decir, seguridad también afecta cómo diseñás la forma misma de la API.

## Relación con Spring Security

Spring Security hace muy natural expresar este primer mapa de acceso porque te permite declarar políticas de rutas públicas y privadas dentro de una configuración centralizada.

Eso evita:

- ifs repetitivos
- protección dispersa
- decisiones inconsistentes
- endpoints olvidados sin controlar

Y por eso es un paso tan importante apenas empezás a asegurar la aplicación.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> proteger endpoints con Spring Security empieza por decidir explícitamente qué rutas son públicas y cuáles requieren autenticación, convirtiendo la seguridad en una política visible del backend y evitando que el acceso quede librado a decisiones dispersas o implícitas.

## Resumen

- Uno de los primeros pasos concretos en Spring Security es distinguir rutas públicas de rutas privadas.
- `permitAll()` se usa para rutas abiertas; `authenticated()` exige identidad válida.
- Una política como `anyRequest().authenticated()` ayuda mucho a cerrar por defecto lo que no abriste explícitamente.
- Login, registro y contenido realmente público suelen ir entre las rutas abiertas.
- Perfil, pedidos, operaciones sensibles y paneles internos suelen requerir autenticación.
- Proteger rutas es una capa fundamental, aunque luego puedan venir reglas más finas por rol o ownership.
- Este tema convierte la idea general de seguridad en decisiones concretas sobre el mapa real de endpoints.

## Próximo tema

En el próximo tema vas a ver cómo restringir acciones por rol con reglas como admin vs user, que es el paso natural después de distinguir rutas públicas de rutas autenticadas.
