---
title: "Cómo pensar límites de contexto y dependencias entre módulos para que el backend no se acople de más"
description: "Entender por qué auth, usuarios, pagos, storage y otros módulos del backend necesitan límites más claros a medida que el proyecto crece, y cómo pensar mejor sus dependencias para evitar que todo termine conociendo demasiado de todo."
order: 86
module: "Arquitectura y crecimiento del backend"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo separar mejor:

- dominio
- aplicación
- infraestructura

sin caer en una arquitectura inflada o artificial.

Eso ya te dejó una idea muy importante:

> no todo en el backend pertenece al mismo nivel, y mezclar reglas del negocio, casos de uso y detalles técnicos dentro de las mismas clases vuelve el sistema cada vez más difícil de entender.

Pero incluso si ya empezaste a separar mejor esas responsabilidades, todavía queda otra pregunta muy importante cuando el proyecto sigue creciendo:

> ¿cómo evitás que los módulos del sistema empiecen a conocerse demasiado entre sí?

Porque una cosa es modularizar un backend en carpetas como:

- `auth`
- `users`
- `payments`
- `orders`
- `storage`
- `notifications`

Y otra muy distinta es que esos módulos tengan realmente límites sanos.

A veces, aunque el árbol del proyecto se vea prolijo, por debajo termina pasando algo así:

- auth conoce demasiado de users
- users conoce detalles internos de payments
- payments toca directamente orders, notifications y storage
- storage depende de auth
- todos llaman métodos internos de todos
- y el proyecto se vuelve una red difícil de razonar

Ahí aparece una idea muy importante:

- **límites de contexto**
- **fronteras entre módulos**
- **dependencias sanas**
- **acoplamiento controlado**

Este tema es clave porque un backend grande no se vuelve inmanejable solo por tener muchas clases.
Se vuelve inmanejable sobre todo cuando **todo depende de todo**.

## El problema de que todos los módulos se conozcan demasiado

Supongamos que ya separaste el proyecto en módulos funcionales.

Eso ya es un gran paso.
Pero todavía puede pasar algo como esto:

- `PaymentService` consulta directamente detalles internos de `UserEntity`
- `AuthService` modifica cosas internas de `Order`
- `StorageService` decide lógica del dominio de `Product`
- `NotificationService` conoce demasiados estados internos de `PaymentAttempt`
- `WebhookService` toca medio sistema sin fronteras claras

En esa situación, aunque haya carpetas distintas, el sistema sigue estando muy acoplado.

Y cuando el acoplamiento crece así, aparecen problemas como:

- cambios que impactan demasiadas áreas
- refactors muy costosos
- tests frágiles
- dificultad para entender alcance real de una modificación
- más riesgo de efectos colaterales
- mayor dificultad para repartir trabajo entre personas

Entonces el problema no es solo “cómo agrupo archivos”, sino también:

> cómo se relacionan entre sí las partes del backend.

## Qué significa pensar límites de contexto

Dicho de forma simple:

> significa reconocer que distintos módulos del sistema tienen responsabilidades, lenguaje y reglas propias, y que no conviene que cualquier parte del backend pueda meterse libremente en los detalles internos de cualquier otra.

Esto no implica aislar todo de forma absoluta ni convertir el backend en microservicios.
Primero significa algo más práctico:

- saber qué le pertenece a cada módulo
- saber qué debería exponer
- saber qué debería permanecer interno
- y evitar dependencias innecesarias o demasiado profundas

## Qué es un contexto en este sentido

No hace falta convertir esto ya mismo en una teoría gigantesca.
Acá alcanza con una intuición muy útil:

> un contexto es una parte del sistema donde ciertos conceptos tienen un significado propio y coherente.

Por ejemplo:

### Auth
Habla de:
- login
- token
- proveedor de identidad
- credenciales
- refresh
- logout

### Orders
Habla de:
- pedido
- carrito
- checkout
- monto
- estado de orden

### Payments
Habla de:
- intento de pago
- aprobación
- rechazo
- provider
- webhook de pago

### Storage
Habla de:
- archivos
- imágenes
- URLs
- externalId
- visibilidad del recurso

Cada contexto tiene su propio lenguaje y sus propios problemas.

## Por qué esto importa tanto

Porque si no respetás esos límites, los conceptos se empiezan a mezclar de maneras incómodas.

Por ejemplo:

- auth empieza a decidir cosas que son del dominio de usuarios
- payments se vuelve el lugar donde también se manejan notificaciones
- orders se acopla a detalles internos del proveedor de pago
- storage se convierte en dueño semántico de reglas que son de catálogo o perfil de usuario

Y eso hace que el backend cuente peor la historia del sistema.

## Una intuición muy valiosa

Podés pensar así:

> modularizar no es solo poner clases de una feature en la misma carpeta; también es hacer que esa feature no necesite conocer demasiado de la cocina interna de las demás.

Esta frase resume muchísimo del tema.

## Un ejemplo muy clásico

Supongamos que tenés un módulo `payments` y otro `orders`.

Es natural que estén relacionados.
Pero una cosa es que `payments` necesite conocer cierta información del pedido.
Y otra distinta es que `payments` dependa directamente de media estructura interna de `orders`.

Por ejemplo:

- estado interno detallado
- reglas privadas
- entidades enteras con media lógica adentro
- DTOs internos que no eran públicos
- métodos utilitarios pensados solo para orders

Eso ya muestra una diferencia muy importante entre:

- **dependencia razonable**
- **dependencia invasiva**

## Qué sería una dependencia razonable

Por ejemplo:

- payments recibe un `orderId`
- o ciertos datos necesarios del pedido
- o usa una abstracción clara para consultar si puede iniciar checkout
- o reacciona a un evento del dominio de orders

Eso es mucho más sano que acceder sin filtro a toda la internals del otro módulo.

## Qué sería una dependencia invasiva

Algo así como:

- payments importa entidades internas de orders llenas de detalles
- modifica estados internos que no le correspondían
- depende de helpers privados del otro módulo
- rompe si orders cambia algo que en teoría no era contrato público
- obliga a coordinar demasiados cambios entre ambos módulos

Ese tipo de relación vuelve muy frágil al sistema.

## Una pregunta muy útil

Podés preguntarte:

> ¿este módulo necesita realmente conocer tanto del otro, o solo necesita una pequeña parte bien definida?

Muchas veces, esa sola pregunta ya muestra exceso de acoplamiento.

## Un ejemplo con auth y users

Este caso aparece muchísimo.

A veces `auth` y `users` están tan mezclados que ya no se entiende dónde termina uno y empieza el otro.

Pero conceptualmente no son exactamente lo mismo.

### Auth
Se enfoca más en:
- credenciales
- login
- tokens
- proveedores de identidad
- seguridad operativa

### Users
Se enfoca más en:
- perfil
- preferencias
- cuenta
- datos propios del usuario dentro del dominio
- relación con recursos del sistema

Están relacionados, sí.
Pero no conviene que se conviertan en el mismo bloque amorfo sin límites.

## Un ejemplo con payments y notifications

También muy clásico.

Tiene sentido que cuando un pago se aprueba, el sistema quiera notificar al usuario.
Pero eso no significa necesariamente que `payments` deba conocer todos los detalles internos del sistema de notificaciones.

A veces puede ser más sano algo como:

- payments publica o dispara un hecho relevante
- notifications reacciona

en vez de:

- payments arma directamente templates
- payments conoce canales
- payments decide demasiado sobre email/SMS/push
- payments se vuelve dueño de notificaciones

Esto reduce muchísimo el acoplamiento.

## Qué relación tiene esto con eventos

Muy fuerte.

Los eventos suelen ser una herramienta muy útil para reducir acoplamiento entre módulos.

Por ejemplo:

- `PagoAprobado`
- `UsuarioRegistrado`
- `PedidoCreado`

Entonces, en vez de que un módulo llame directamente detalles internos de otro, puede pasar algo como:

1. ocurre un hecho del dominio
2. se publica ese hecho
3. otro módulo reacciona si le interesa

Esto no resuelve todo mágicamente, pero sí puede ayudar muchísimo a que las dependencias sean menos invasivas.

## Un ejemplo conceptual

En vez de:

```java
paymentService.aprobarPago(...);
notificationService.enviarConfirmacion(...);
storageService.generarComprobante(...);
```

todo mezclado dentro del mismo módulo, podría pasar algo más parecido a:

- payments confirma el hecho `PagoAprobado`
- notifications decide si manda email
- otro componente decide si genera comprobante
- analytics decide si cuenta una métrica

Esto hace que payments no sea dueño de todos los efectos secundarios del universo.

## Qué relación tiene esto con interfaces o puertos

También muy fuerte.

A veces, para evitar que un módulo dependa demasiado del detalle concreto de otro, conviene depender de una capacidad más abstracta.

Por ejemplo:

```java
public interface UserLookup {
    Optional<UserSummary> findById(Long id);
}
```

o:

```java
public interface OrderCheckoutInfoProvider {
    CheckoutOrderInfo getCheckoutInfo(Long orderId);
}
```

Esto puede ayudar a que un módulo no quede totalmente pegado a clases internas enormes del otro.

No significa que haya que crear interfaces por deporte.
Pero sí puede ser una herramienta muy sana cuando el acoplamiento empieza a crecer.

## Qué diferencia hay entre usar un dato y conocer una internals

Este matiz es importantísimo.

Una cosa es que `payments` necesite saber:

- id del pedido
- monto
- moneda
- email del comprador

Y otra muy distinta es que `payments` dependa de:

- toda la entidad `Pedido`
- media lógica privada del módulo orders
- repositorios internos
- estados que no eran contrato
- helpers o clases pensadas solo para órdenes

La primera situación suele ser razonable.
La segunda suele ser mucho más riesgosa.

## Qué pasa cuando un módulo expone demasiado

También es un problema.

Si cada módulo deja “todo público” dentro del proyecto, entonces cualquier otro módulo puede engancharse a cualquier detalle interno.

Eso suele traer:

- dependencia accidental
- acoplamiento cada vez mayor
- dificultad para refactorizar
- pérdida de fronteras claras

Por eso, además de pensar qué módulos existen, conviene pensar:

> qué parte de cada módulo es realmente pública para los demás y qué parte debería quedar interna.

## Qué relación tiene esto con DTOs y modelos compartidos

Muy importante.

A veces el acoplamiento crece porque todos los módulos comparten las mismas clases gigantes o DTOs multiuso.

Por ejemplo:

- un `UserResponse` usado para todo
- una entidad enorme pasada por todos lados
- un DTO de provider externo reutilizado fuera de su módulo
- request/response HTTP convertidos en pseudo-modelo global del sistema

Eso suele ser una mala señal.

No porque compartir algo esté siempre mal, sino porque muchas veces indica que los límites ya se diluyeron demasiado.

## Qué relación tiene esto con módulos grandes y crecimiento

A medida que el sistema crece, no alcanza con saber “qué módulo hace qué”.
También empieza a importar mucho:

- quién depende de quién
- cuánto depende
- a qué nivel depende
- y si esa dependencia es razonable o excesiva

Ese mapa de dependencias es parte real de la arquitectura del backend.

## Un ejemplo mental bastante útil

Podés pensar así:

### Sano
- módulo A necesita una pequeña capacidad bien definida de módulo B

### Riesgoso
- módulo A necesita media implementación interna de módulo B

La diferencia parece sutil, pero arquitectónicamente es enorme.

## Qué relación tiene esto con refactorizar

Muy directa.

Cuando las dependencias entre módulos están mejor pensadas:

- cambiar una parte rompe menos
- mover lógica cuesta menos
- reemplazar proveedor o implementación cuesta menos
- entender el impacto de un cambio es más fácil

En cambio, si todo está hiperacoplado, cada refactor se vuelve más peligroso.

## Qué relación tiene esto con testing

También muy fuerte.

Un sistema con dependencias más claras entre módulos suele permitir tests más razonables porque:

- no necesitás levantar medio mundo para probar algo
- las colaboraciones son más explícitas
- las responsabilidades están más acotadas
- es más fácil doblar o simular ciertas capacidades

Cuando todo conoce todo, hasta testear una cosa simple puede volverse incómodo.

## Un ejemplo de estructura que ayuda

Por ejemplo:

```text
orders/
  domain/
  application/
  infrastructure/

payments/
  domain/
  application/
  infrastructure/

notifications/
  domain/
  application/
  infrastructure/
```

Y después, en vez de que se importen internals libremente, intentás que las relaciones pasen más por:

- eventos
- servicios/puertos acotados
- datos bien definidos
- contratos mínimos

Esto ya hace una diferencia enorme.

## Qué no conviene hacer

No conviene obsesionarse con aislamiento perfecto imposible dentro de un mismo backend si eso te complica artificialmente todo.

Pero tampoco conviene resignarse a que todos los módulos se metan en los detalles internos de todos.

La clave está otra vez en el criterio:
**reducir el acoplamiento innecesario**.

## Otro error común

Usar entidades gigantes como moneda universal entre módulos.

Eso suele hacer que todos dependan de todo lo que la entidad arrastra.

## Otro error común

Crear “módulos” que en realidad son solo carpetas, pero no tienen ningún tipo de frontera práctica.
El árbol se ve ordenado, pero las dependencias siguen totalmente caóticas.

## Otro error común

No distinguir entre:
- una colaboración legítima entre módulos
- y una invasión de detalles internos

Ese matiz es uno de los grandes aprendizajes de este tema.

## Una buena heurística

Podés preguntarte:

- ¿este módulo necesita un dato o necesita medio módulo ajeno?
- ¿estoy usando un contrato claro o una internal enorme?
- ¿esto podría resolverse con un evento o una capacidad más acotada?
- ¿este módulo está decidiendo cosas que en realidad pertenecen a otro?
- ¿qué se rompería si refactorizo internals del otro módulo?

Responder eso ayuda muchísimo a detectar acoplamiento excesivo.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque a esta altura del backend ya probablemente tengas:

- auth
- users
- orders
- payments
- notifications
- storage
- webhooks
- integraciones externas
- frontend consumiendo la API

Y si todos esos módulos se conocen demasiado, el backend empieza a volverse una telaraña difícil de sostener.

Por eso pensar límites de contexto y dependencias no es lujo teórico.
Es una necesidad práctica cuando el proyecto ya se volvió serio.

## Relación con Spring Boot

Spring Boot no te impone estos límites.
La responsabilidad de pensarlos sigue siendo tuya.

Y justamente por eso conviene entrenar este criterio:
para que la libertad del framework no termine convirtiéndose en un backend donde cualquier clase puede hablar con cualquier otra de cualquier forma.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando un backend Spring Boot ya tiene varios módulos fuertes, no alcanza con separarlos en carpetas: también hace falta cuidar sus límites de contexto y sus dependencias, para que auth, users, payments, storage y demás colaboren de forma clara sin quedar acoplados a los detalles internos unos de otros.

## Resumen

- Los módulos del backend pueden estar ordenados en carpetas y aun así seguir demasiado acoplados.
- Pensar límites de contexto ayuda a reconocer qué le pertenece realmente a cada parte del sistema.
- No es lo mismo depender de una capacidad acotada que de media implementación interna ajena.
- Eventos, contratos mínimos y puertos pueden ayudar a reducir acoplamiento.
- Compartir entidades gigantes o DTOs universales suele ser una mala señal.
- Esta separación mejora refactorización, testing y claridad del proyecto.
- Este tema profundiza la madurez arquitectónica del backend más allá de la simple modularización visual.

## Próximo tema

En el próximo tema vas a ver cómo pensar tradeoffs entre monolito modular, microservicios y otras formas de crecimiento, para entender cuándo conviene seguir fortaleciendo un solo backend y cuándo recién empieza a tener sentido separar más drásticamente.
