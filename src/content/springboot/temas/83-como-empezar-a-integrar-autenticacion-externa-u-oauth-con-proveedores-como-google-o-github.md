---
title: "Cómo empezar a integrar autenticación externa u OAuth con proveedores como Google o GitHub"
description: "Entender qué significa delegar parte del login a un proveedor externo mediante OAuth, por qué este flujo es distinto del login clásico con usuario y contraseña propios y qué decisiones de diseño aparecen cuando tu backend convive con identidad externa."
order: 83
module: "Integraciones con servicios externos"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo integrar pagos o checkout externo de forma seria desde Spring Boot, y cómo ese tipo de integración obliga a pensar mucho más que una simple llamada HTTP:

- estados locales
- referencias internas
- webhooks
- consistencia
- idempotencia
- relación entre contrato externo y dominio interno

Eso ya te dejó una idea muy importante:

> cuando un sistema externo participa de un flujo sensible del negocio, tu backend tiene que modelar con mucho cuidado qué delega, qué conserva y cómo reconcilia ambos mundos.

Ahora aparece otro caso muy real y también muy sensible:

- login con Google
- login con GitHub
- login con otro proveedor externo
- autenticación social
- federación de identidad
- OAuth u otros flujos relacionados

Este tema es clave porque acá ya no integrás solo datos, archivos o pagos.
Ahora integrás algo todavía más delicado:

**la identidad del usuario**

Y eso cambia bastante la forma de pensar:

- registro
- login
- cuentas locales
- seguridad
- user model
- vínculo entre usuarios internos y proveedores externos

## Qué significa autenticación externa

Dicho simple:

> significa que tu aplicación permite que la identidad del usuario sea validada total o parcialmente por un proveedor externo en lugar de pedir siempre usuario y contraseña propios del sistema.

Por ejemplo:

- “Continuar con Google”
- “Iniciar sesión con GitHub”
- “Entrar con Microsoft”

En esos casos, el usuario no necesariamente ingresa una contraseña que tu backend haya almacenado.
En lugar de eso, otro sistema participa del proceso de autenticación.

## Por qué esto aparece tanto en aplicaciones reales

Porque ofrece varias ventajas prácticas y de producto, por ejemplo:

- menos fricción al registrarse
- menos contraseñas para recordar
- onboarding más rápido
- identidad ya validada por un proveedor grande
- mejor UX en muchos productos
- reducción de algunas cargas operativas asociadas a contraseñas

No significa que siempre sea obligatorio ni que reemplace todo login local.
Pero sí es uno de los patrones más comunes en apps modernas.

## Qué cambia respecto del login clásico

En el login clásico que viste antes, el flujo era más o menos así:

1. el usuario manda username y password
2. tu backend busca usuario local
3. compara password hash
4. autentica
5. emite JWT o sesión

Ahí toda la validación de credenciales vive más adentro de tu propio sistema.

Con autenticación externa, el flujo cambia bastante.
Ahora puede aparecer algo como:

1. el usuario elige Google o GitHub
2. se redirige al proveedor
3. el proveedor autentica al usuario
4. el proveedor devuelve información o un código a tu sistema
5. tu backend interpreta eso
6. decide si vincula o crea una cuenta local
7. recién entonces crea su propio contexto autenticado

Es decir:

> el proveedor externo participa en la prueba de identidad, pero tu backend igual necesita decidir cómo esa identidad externa se traduce a una cuenta interna del sistema.

Y esa última parte es crucial.

## Qué es OAuth en este contexto

No hace falta convertir este tema en una clase hiperformal de estándares desde el primer minuto.
Lo importante primero es entender la intuición correcta.

Cuando en una app ves algo como:

- “Login con Google”
- “Continuar con GitHub”

muy a menudo detrás hay un flujo tipo OAuth o relacionado, donde:

- el usuario interactúa con el proveedor externo
- el proveedor autoriza o devuelve información a tu app
- tu backend usa ese resultado para autenticar o vincular una identidad local

No hace falta por ahora memorizar todas las variantes ni siglas del ecosistema.
Primero conviene fijar esta idea:

> tu backend no valida directamente la contraseña del usuario, sino que confía en un proveedor externo para parte del proceso de identidad.

## Por qué esto no elimina tu modelo de usuario local

Este es uno de los puntos más importantes del tema.

Mucha gente al principio piensa algo así:

> “si uso Google o GitHub, entonces ya no necesito modelo de usuario local”.

Y en la mayoría de los sistemas reales, eso no es del todo cierto.

Porque tu aplicación igual necesita saber cosas como:

- quién es este usuario dentro de mi sistema
- qué rol tiene
- qué permisos tiene
- qué datos de perfil me importan
- qué recursos le pertenecen
- qué pedidos hizo
- qué configuraciones tiene
- si su cuenta está activa o bloqueada
- si está vinculada a uno o varios proveedores externos

Es decir:

> el proveedor externo ayuda a autenticar la identidad, pero tu dominio sigue necesitando su propio usuario o cuenta interna.

## Un ejemplo mental muy útil

Podés pensar así:

### Proveedor externo
Dice algo como:
- “esta identidad efectivamente es el usuario de esta cuenta Google/GitHub”

### Tu sistema
Decide cosas como:
- “a esta identidad externa la vinculo con este usuario local”
- “esta cuenta local tiene rol USER”
- “esta cuenta local puede ver sus pedidos”
- “esta cuenta local está activa”
- “este usuario ya existía o hay que crearlo”

Esta distinción vale muchísimo.

## Qué decisiones de diseño aparecen enseguida

Muy rápido vas a necesitar decidir cosas como:

- ¿vas a soportar login local además de login externo?
- ¿una cuenta local puede estar vinculada a más de un proveedor?
- ¿si llega un usuario nuevo de Google se crea automáticamente la cuenta?
- ¿qué campo usás para vincular? ¿email? ¿id externo?
- ¿qué pasa si el email ya existe localmente?
- ¿cómo distinguís auth provider local vs externo?
- ¿el usuario puede luego agregar password local?
- ¿cómo representás esto en la base?

Estas decisiones muestran que la autenticación externa toca el corazón del modelo de identidad.

## Un ejemplo de modelo local razonable

Podrías imaginar algo así:

```java
@Entity
public class Usuario {

    @Id
    @GeneratedValue
    private Long id;

    private String email;
    private String username;
    private String passwordHash;
    private boolean activo;

    @ElementCollection
    private Set<String> roles = new HashSet<>();

    private String authProvider;
    private String externalProviderUserId;

    // getters y setters
}
```

Este modelo es solo un punto de partida conceptual, pero ya muestra algo importante:

- sigue habiendo usuario local
- pero ahora aparece información del proveedor externo

## Qué podría significar `authProvider`

Por ejemplo:

- `LOCAL`
- `GOOGLE`
- `GITHUB`

o algo equivalente.

Esto ayuda a representar de dónde viene la identidad principal o cómo se creó la cuenta.

No significa que este campo resuelva mágicamente todo.
Pero sí muestra que el origen de autenticación empieza a formar parte del modelo.

## Qué podría significar `externalProviderUserId`

Muchos proveedores externos tienen su propio identificador estable del usuario.

Guardar ese identificador puede ser muy útil porque el email, aunque importante, no siempre es la única ni la mejor forma de vincular identidad.

Entonces, además de un email, muchas veces conviene pensar en:

- identificador externo único del proveedor
- nombre del proveedor
- relación con la cuenta local

Esto ordena bastante la integración.

## Qué pasa si el usuario ya existe localmente

Este es uno de los casos más importantes.

Supongamos:

- ya existe una cuenta local con email `gabriel@mail.com`
- ahora el usuario intenta entrar con Google y ese proveedor informa el mismo email

¿Qué hacés?

Algunas posibilidades conceptuales podrían ser:

- vincular automáticamente la cuenta externa a la local
- exigir una confirmación adicional
- rechazar hasta que haya una política clara
- permitir asociación manual desde configuración de cuenta

No hay una única respuesta universal.
Pero sí es un caso que no conviene ignorar.

## Qué pasa si es la primera vez que entra con proveedor externo

Otro caso típico:

- el proveedor externo autentica al usuario
- tu backend ve que no existe cuenta local vinculada
- decide crear una nueva cuenta local

Eso puede ser una buena UX, pero conviene pensar qué datos vas a inicializar:

- email
- username o display name
- roles por defecto
- estado activo
- provider
- provider user id

O sea, incluso el “login con Google” muchas veces termina implicando una forma de registro implícito o provisioning local de cuenta.

## Por qué esto se parece a registro y login al mismo tiempo

Porque, conceptualmente, puede mezclar ambas cosas:

- si la cuenta local ya existe → más parecido a login
- si no existe y la creás → más parecido a registro/provisioning

Eso hace que el flujo sea bastante interesante y que no convenga pensarlo como solo un botón simpático de UI.

## Qué relación tiene esto con JWT

Muy fuerte.

Aunque la autenticación original venga de Google, GitHub u otro proveedor, tu backend muchas veces sigue necesitando crear su propio contexto autenticado interno para el resto de la aplicación.

Por ejemplo:

1. el proveedor confirma identidad
2. tu backend la traduce a un `Usuario` local
3. tu backend genera su propio JWT
4. el frontend usa ese JWT con tu API

Esto es muy común y muy importante.

Porque significa que:

> el proveedor externo puede participar en el login, pero tu backend sigue manejando su propia sesión lógica o token interno para operar con el resto de sus endpoints.

## Un ejemplo mental del flujo

Podés pensarlo así:

1. usuario hace click en “Continuar con Google”
2. frontend o backend redirige al proveedor
3. proveedor autentica al usuario
4. proveedor devuelve resultado a tu backend
5. backend obtiene identidad externa
6. backend busca o crea usuario local
7. backend genera JWT propio
8. frontend usa ese JWT contra tu API

Este flujo resume muchísimo del tema.

## Por qué esto no equivale a “ya no necesito seguridad local”

Porque tu backend sigue necesitando:

- roles
- autorización
- ownership
- `/me`
- cuentas activas o inactivas
- relación con recursos del dominio
- tracking local de usuarios

Es decir, autenticación externa no reemplaza toda tu capa de seguridad.
Se integra con ella.

## Qué pasa con passwordHash si el usuario es externo

Buena pregunta.

En algunos diseños, una cuenta creada solo con proveedor externo puede no tener password local al principio.

Eso significa que tu modelo podría permitir:

- `passwordHash` presente para cuentas locales
- `passwordHash` ausente o irrelevante para ciertas cuentas externas

O podrías tener políticas más ricas donde luego el usuario vincula una contraseña local también.

Lo importante es entender que:
**no todas las cuentas del sistema tienen por qué autenticarse del mismo modo**.

## Qué relación tiene esto con el frontend

Muy directa.

Porque el frontend suele ver algo como:

- botón “Continuar con Google”
- botón “Entrar con GitHub”

pero detrás necesita coordinarse con backend y proveedor para luego quedar autenticado dentro de tu sistema real.

Y después de eso igual necesita saber:

- cuál es el JWT interno
- quién es el usuario actual
- qué roles tiene
- qué endpoints puede consumir

O sea, el flujo cambia, pero el frontend sigue necesitando integrarse bien con tu propia API.

## Qué relación tiene esto con seguridad del producto

Muy fuerte.

Porque autenticación externa introduce nuevas preguntas como:

- ¿en qué proveedores confío?
- ¿qué datos del proveedor considero válidos?
- ¿qué hago si falta email?
- ¿qué claims o datos externos uso?
- ¿cómo evito vinculaciones incorrectas?
- ¿cómo trato cuentas desactivadas localmente aunque el proveedor autentique bien?
- ¿cómo manejo logout en un sistema mixto?

Esto muestra que no es solo “activar un plugin”.
Hay bastante diseño detrás.

## Qué pasa con logout

Muy buena pregunta.

Aunque el usuario haya entrado con Google o GitHub, tu backend sigue teniendo que decidir qué significa cerrar sesión en tu propia aplicación.

Muchas veces el logout práctico del lado de tu API sigue implicando:

- invalidar o borrar tu JWT interno
- limpiar estado de sesión en frontend
- decidir si además querés o no cerrar sesión contra el proveedor externo

Esto último no siempre es lo mismo ni siempre es necesario.

Lo importante es entender que logout local y sesión del proveedor pueden no ser exactamente la misma cosa.

## Qué pasa con roles del proveedor y roles del sistema

Otro punto importante.

Aunque el proveedor externo autentique identidad, los roles de tu sistema siguen siendo tuyos.

Por ejemplo, Google no debería decidir por sí solo si el usuario es:

- `ADMIN`
- `USER`
- `MODERATOR`

Eso pertenece a tu dominio.

Entonces, incluso con login externo, tu backend sigue necesitando administrar su propia autorización.

Esto es una idea central del tema.

## Un ejemplo muy importante

Podrías tener usuarios que entran con Google, pero igual dentro de tu sistema:

- uno tiene rol `USER`
- otro tiene rol `ADMIN`
- otro está inactivo
- otro tiene acceso restringido a cierta organización

Eso muestra clarísimo que proveedor externo e identidad local no son lo mismo.

## Qué no conviene hacer

No conviene asumir que el proveedor externo reemplaza por completo tu modelo de usuario y tus reglas del dominio.

Tampoco conviene vincular cuentas a ciegas sin una política clara.
Ni delegar roles de negocio al proveedor sin pensar bien qué significa eso para tu sistema.

Ese tipo de decisiones puede volverse riesgoso muy rápido.

## Otro error común

Pensar que “login con Google” es solo un detalle visual del frontend.

No.
Toca:

- flujo de auth
- backend
- modelo de usuario
- vinculación de cuentas
- seguridad
- JWT
- logout
- onboarding

Es un cambio bastante más profundo.

## Otro error común

No pensar qué pasa con usuarios existentes.
Ahí es donde suelen aparecer muchos de los problemas reales de vinculación o duplicación de cuentas.

## Otro error común

Querer meter todo el contrato del proveedor externo dentro del dominio interno sin adaptación.
Igual que en otras integraciones, conviene separar bastante bien ambas cosas.

## Una buena heurística

Podés preguntarte:

- ¿sigo necesitando cuenta local? casi seguro sí
- ¿cómo vinculo identidad externa con usuario interno?
- ¿qué hago si el usuario ya existe?
- ¿qué hago si es la primera vez?
- ¿qué datos del proveedor me importan de verdad?
- ¿mi backend generará luego su propio JWT?
- ¿cómo conservo roles y estado local?

Responder eso te ordena muchísimo el diseño.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque autenticación externa aparece en muchísimas apps reales por motivos de UX, onboarding y conveniencia.
Y, aunque desde afuera parezca un botón, por dentro toca una parte muy profunda del sistema:
la identidad.

Por eso este tema no es una curiosidad.
Es una integración de altísima relevancia práctica.

## Relación con Spring Boot

Spring Boot y el ecosistema Spring te ofrecen muy buenas herramientas para trabajar estos flujos, pero lo más importante no es solo conocer la pieza técnica del framework.

Lo más importante primero es entender bien la arquitectura del problema:

- proveedor externo autentica
- tu backend interpreta y vincula
- tu sistema conserva su propio usuario local
- tu sistema conserva su propia autorización
- y luego sigue operando con sus propios contratos internos

Ese mapa mental vale muchísimo.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> integrar autenticación externa u OAuth con proveedores como Google o GitHub no significa reemplazar tu modelo local de usuario, sino hacer que una identidad validada por un tercero pueda traducirse de forma segura y coherente a una cuenta interna de tu sistema, que sigue necesitando roles, estado, ownership y una forma propia de autenticación operativa frente al resto de tu API.

## Resumen

- La autenticación externa delega parte del login a un proveedor como Google o GitHub.
- Eso no elimina la necesidad de un usuario local dentro de tu dominio.
- Tu backend sigue necesitando roles, estado de cuenta y relación con recursos del sistema.
- Hay que decidir cómo vincular identidad externa con cuenta interna existente o nueva.
- Muchas veces el proveedor participa en el login, pero tu backend luego emite su propio JWT.
- Logout, vinculación de cuentas y onboarding cambian bastante con este modelo.
- Este tema abre otro caso muy real de integración externa donde se combinan identidad, seguridad y contratos fuera de tu control directo.

## Próximo tema

En el próximo tema vas a ver cómo estructurar mejor proyectos grandes o con muchos módulos cuando ya aparecen varias integraciones, seguridad, frontend, pagos y distintos dominios conviviendo en el mismo backend, porque a esta altura la organización del sistema empieza a volverse todavía más importante.
