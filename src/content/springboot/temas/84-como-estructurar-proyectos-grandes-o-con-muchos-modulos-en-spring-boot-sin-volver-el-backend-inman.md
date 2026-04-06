---
title: "Cómo estructurar proyectos grandes o con muchos módulos en Spring Boot sin volver el backend inmanejable"
description: "Entender cómo empezar a organizar un backend Spring Boot cuando crece en tamaño y complejidad, y por qué seguridad, integraciones, frontend, pagos y distintos dominios obligan a pensar la estructura del proyecto con mucho más criterio."
order: 84
module: "Arquitectura y crecimiento del backend"
level: "intermedio"
draft: false
---

En el tema anterior viste cómo empezar a integrar autenticación externa u OAuth con proveedores como Google o GitHub, y eso te dejó una idea muy importante:

> a medida que el backend se vuelve más real, deja de tener solo controllers, services y repositories simples, y empieza a convivir con seguridad, identidad, frontend, pagos, storage, webhooks, integraciones externas y varios subdominios al mismo tiempo.

Eso cambia bastante el panorama.

Porque una cosa es un proyecto chico con:

- unas pocas entidades
- algunos endpoints
- un service principal
- uno o dos repositorios

Y otra cosa muy distinta es un backend que ya empieza a tener:

- auth local y auth externa
- JWT
- frontend consumiendo la API
- pagos
- storage de archivos
- emails y notificaciones
- webhooks
- integraciones con terceros
- varios dominios funcionales
- estados intermedios
- tareas desacopladas
- distintos equipos o áreas tocando el mismo sistema

Ahí aparece una preocupación muy seria:

> ¿cómo estructuro todo esto para que el proyecto siga siendo entendible y mantenible?

Este tema es clave porque, cuando el backend crece, una mala estructura empieza a costar muchísimo en:

- legibilidad
- velocidad de desarrollo
- onboarding
- testing
- refactors
- separación de responsabilidades
- y capacidad de seguir evolucionando sin caos

## El problema de seguir con una estructura pensada para un proyecto chico

Cuando el proyecto recién empieza, muchas veces alcanza con algo así:

```text
controller/
service/
repository/
entity/
dto/
config/
```

Y durante bastante tiempo puede funcionar.

Pero cuando el sistema ya empieza a mezclar:

- auth
- pedidos
- pagos
- productos
- archivos
- usuarios
- integraciones
- admin
- webhooks
- tareas async

esa estructura puede empezar a quedarse corta.

No porque “esté prohibida”.
Sino porque puede dejar de expresar bien el sistema real que ya construiste.

Entonces aparece una pregunta más profunda:

> ¿la estructura actual me ayuda a entender el backend o solo refleja cómo era cuando todavía era pequeño?

Esa pregunta vale muchísimo.

## Qué señales muestran que el proyecto ya está creciendo de verdad

Por ejemplo:

- cada carpeta tiene demasiadas clases
- `service/` parece un depósito gigante
- `dto/` ya es una selva
- `config/` mezcla seguridad, storage, beans, terceros y de todo
- te cuesta encontrar dónde vive una feature completa
- para tocar una funcionalidad tenés que saltar por demasiados lugares
- no está claro qué clases pertenecen a qué subdominio
- onboarding de otra persona se vuelve lento
- los cambios parecen tocar siempre “todo”

Cuando eso empieza a pasar, la estructura ya dejó de ser una cuestión estética y pasó a ser una cuestión arquitectónica.

## Qué cambia cuando el backend tiene varios dominios

Hasta cierto punto, un backend chico puede organizarse casi solo por capas técnicas:

- controllers
- services
- repositories
- DTOs

Pero cuando aparecen subdominios claros, muchas veces tu proyecto empieza a hablar más naturalmente en términos como:

- auth
- usuarios
- catálogo
- pedidos
- pagos
- checkout
- storage
- notificaciones
- admin
- integraciones
- webhooks

Y ahí una estructura puramente técnica puede empezar a contar peor la historia del sistema que una estructura más orientada por dominios o módulos.

## Una idea central del tema

Podés pensar así:

> cuanto más crece el backend, más importante se vuelve que la estructura del proyecto exprese también el dominio y no solo el tipo técnico de las clases.

Esta frase resume muchísimo.

## Qué significa “módulo” en este contexto

No hace falta pensar de entrada en un sistema multi-repo o en una arquitectura distribuida para hablar de módulos.

Acá, al menos inicialmente, “módulo” puede significar algo bastante práctico:

> una agrupación coherente de clases, responsabilidades y casos de uso alrededor de un subdominio o funcionalidad importante.

Por ejemplo:

- módulo `auth`
- módulo `payments`
- módulo `orders`
- módulo `catalog`
- módulo `storage`

No hace falta convertir cada módulo en un sistema independiente desde el día uno.
Primero conviene entender la idea de **fronteras internas** dentro del mismo backend.

## Un ejemplo de estructura que se empieza a quedar chica

```text
src/main/java/com/ejemplo/app
  controller/
  service/
  repository/
  entity/
  dto/
  config/
  exception/
```

Si adentro de cada carpeta ya hay decenas de clases de dominios totalmente distintos, el proyecto se vuelve bastante más difícil de navegar.

Por ejemplo:

- `PaymentController`
- `AuthController`
- `ProductController`
- `WebhookController`
- `StorageController`

todos juntos en el mismo lugar técnico pueden empezar a contar poco sobre el dominio.

## Una estructura más orientada por módulos o features

Podrías empezar a pensar algo así:

```text
src/main/java/com/ejemplo/app
  auth/
  users/
  products/
  orders/
  payments/
  storage/
  notifications/
  integrations/
  common/
```

Y dentro de cada módulo, recién después, ordenar sus capas internas si hace falta.

Por ejemplo:

```text
payments/
  controller/
  service/
  repository/
  dto/
  entity/
  gateway/
  webhook/
```

Esto ya le cuenta mucho más claramente al proyecto de qué parte del sistema se trata.

## Por qué este enfoque ayuda tanto

Porque reduce el costo mental de navegar funcionalidades.

Si querés trabajar en pagos, vas a `payments/`.
Si querés auth, vas a `auth/`.
Si querés storage, vas a `storage/`.

En lugar de recorrer medio árbol técnico buscando piezas dispersas.

Cuando el backend crece, eso vale muchísimo.

## Qué pasa con integraciones externas

Este punto es especialmente importante.

Porque integraciones como:

- pagos
- email
- storage
- OAuth
- geocoding
- APIs internas

pueden desordenarte muchísimo la estructura si no las ubicás con criterio.

Por ejemplo, muchas veces conviene diferenciar entre:

- dominio principal del sistema
- adaptadores o gateways a terceros
- config compartida
- infraestructura transversal

Esto ayuda a que el contrato externo no contamine todo sin control.

## Un ejemplo muy práctico

Dentro de `payments/` podrías tener algo así:

```text
payments/
  controller/
    CheckoutController.java
    PaymentWebhookController.java
  service/
    CheckoutService.java
    PaymentWebhookService.java
  entity/
    PaymentAttempt.java
  repository/
    PaymentAttemptRepository.java
  gateway/
    PaymentGateway.java
    ExternalPaymentHttpClient.java
  dto/
    CheckoutResponse.java
    PaymentWebhookRequest.java
```

Esto ya expresa muchísimo mejor el subdominio que tirar esas clases dispersas en carpetas globales por capa.

## Qué papel cumple `common/` o `shared/`

También es importante.

No todo pertenece claramente a un único módulo.
Hay cosas transversales, por ejemplo:

- errores comunes
- respuestas de error
- config general
- utilidades muy justificadas
- seguridad base compartida
- componentes de infraestructura transversal
- abstractions genéricas realmente compartidas

Eso suele vivir mejor en algo tipo:

- `common/`
- `shared/`
- `infra/`
- `platform/`

según el estilo del proyecto.

La clave es no convertir esa carpeta en un basurero de “cosas que no sé dónde meter”.

## Qué no conviene meter en `common/`

No conviene que `common/` termine conteniendo toda la lógica importante del sistema solo porque no supiste dónde ubicarla.

Por ejemplo, si pagos tiene un mapper o una excepción claramente de pagos, muchas veces debería vivir en `payments/`, no en `common/`.

La carpeta compartida debería ser realmente compartida, no un cajón de sastre.

## Qué pasa con seguridad en proyectos grandes

Muy pronto deja de ser solo “una config”.

Aparecen cosas como:

- login
- JWT
- filtros
- providers
- user details
- OAuth
- endpoints `/auth`
- refresh
- logout
- vinculación de cuentas externas
- guards y roles

Eso ya suele ameritar un módulo o subárbol mucho más claro que simplemente una carpeta genérica `config/`.

Por ejemplo:

```text
auth/
  controller/
  service/
  dto/
  security/
  token/
  oauth/
```

o variantes parecidas.

Esto hace una gran diferencia cuando el bloque de seguridad crece.

## Qué pasa con webhooks

También es interesante.

Podrías meter todos los webhooks del mundo en una sola carpeta global.
Pero si el proyecto ya tiene varios dominios, muchas veces tiene más sentido que el webhook viva cerca del subdominio que actualiza.

Por ejemplo:

- webhook de pago dentro de `payments/`
- webhook de storage dentro de `storage/`
- webhook de notificaciones dentro de `notifications/`

Eso suele expresar mejor la lógica del sistema.

## Qué pasa con frontend y backend acoplados por contrato

A esta altura del proyecto, probablemente ya tengas cosas como:

- DTOs públicos
- endpoints consumidos por frontend
- rutas admin
- rutas de usuario autenticado
- endpoints `/me`
- contratos de pago
- contratos de upload

Eso vuelve todavía más importante que cada módulo tenga claras sus fronteras públicas:

- qué expone
- qué consume
- qué estados maneja
- qué DTOs publica
- qué no debería conocer del resto

Sin eso, el proyecto se llena muy rápido de acoplamientos cruzados.

## Qué problema aparece cuando todo depende de todo

Este es uno de los peores síntomas de un backend que creció sin estructura.

Por ejemplo:

- pagos conoce demasiado de usuarios
- auth conoce demasiado de storage
- productos conoce detalles internos de notificaciones
- webhooks tocan directamente demasiadas capas ajenas
- emails dependen de media app
- DTOs se reutilizan caóticamente entre dominios distintos

Cuando eso pasa, el sistema se vuelve mucho más difícil de refactorizar.

Entonces una muy buena meta estructural es esta:

> que cada módulo dependa lo menos posible de detalles internos de otros módulos.

No siempre vas a lograr pureza perfecta.
Pero apuntar a eso ayuda muchísimo.

## Qué relación tiene esto con arquitectura por capas vs por feature

Muy directa.

Ya habías visto que organizar por capa puede servir mucho al comienzo.
Pero cuando el sistema crece, organizar por feature o módulo suele ganar bastante fuerza porque refleja mejor la realidad del backend.

En proyectos grandes, muchas veces una estructura híbrida funciona muy bien:

- módulo por dominio arriba
- subcapas adentro

Por ejemplo:

```text
orders/
  controller/
  service/
  repository/
  dto/
  entity/
```

Eso combina lo mejor de ambos mundos.

## Qué relación tiene esto con testing

Muy fuerte.

Cuando el proyecto está bien modularizado, también suele ser más claro:

- qué tests pertenecen a auth
- qué tests pertenecen a payments
- qué fixtures pertenecen a storage
- qué dobles o mocks necesita cada módulo
- qué integraciones testea cada bloque

La estructura del código influye mucho en la claridad de los tests.

## Qué relación tiene esto con equipos o colaboración

También muy fuerte.

Cuando varias personas tocan el proyecto, una buena estructura ayuda muchísimo a:

- dividir ownership
- revisar PRs
- ubicar cambios
- evitar pisarse
- entender rápidamente el alcance de una feature
- detectar responsabilidades

Esto se vuelve todavía más importante cuando el backend ya tiene muchos dominios activos.

## Qué relación tiene esto con refactorizar

Muy directa.

Si el sistema está bien estructurado, refactorizar suele ser menos doloroso porque:

- encontrás antes lo que toca cambiar
- entendés mejor el módulo afectado
- el impacto lateral está más contenido
- las dependencias son más visibles
- los límites del subdominio son más claros

Eso reduce muchísimo el costo mental del cambio.

## Un ejemplo de estructura bastante razonable

Podrías imaginar algo así:

```text
src/main/java/com/ejemplo/app
  auth/
    controller/
    service/
    dto/
    security/
    oauth/
  users/
    controller/
    service/
    repository/
    entity/
    dto/
  products/
    controller/
    service/
    repository/
    entity/
    dto/
  orders/
    controller/
    service/
    repository/
    entity/
    dto/
  payments/
    controller/
    service/
    repository/
    entity/
    dto/
    gateway/
    webhook/
  storage/
    controller/
    service/
    dto/
    gateway/
  notifications/
    service/
    gateway/
    template/
  integrations/
    geocoding/
    erp/
    crm/
  common/
    config/
    exception/
    response/
```

No es la única forma posible.
Pero sí muestra una organización mucho más alineada con un backend real que ya creció bastante.

## Qué relación tiene esto con build y módulos reales

En proyectos todavía más grandes, podría llegar un punto donde el concepto de módulo ya no sea solo de carpetas internas, sino también de:

- submódulos del build
- librerías internas
- paquetes separados
- bounded contexts más explícitos

No hace falta saltar a eso de inmediato.
Primero conviene dominar la organización interna del backend monolítico o semi-modular.

Después, si el sistema lo pide, esa evolución puede venir.

## Qué no conviene hacer

No conviene esperar a que el proyecto sea un caos absoluto para recién ahí empezar a pensar estructura.

Tampoco conviene hiper-modularizar desde el día uno sin necesidad real.

La clave suele estar en acompañar el crecimiento del sistema con una estructura que lo siga representando cada vez mejor.

## Otro error común

Crear carpetas como:

- `util`
- `helpers`
- `misc`
- `stuff`
- `general`

y usarlas como vertedero arquitectónico.

Esas carpetas suelen ser síntoma de que el proyecto ya no está expresando bien sus responsabilidades.

## Otro error común

Mover todo de lugar compulsivamente cada semana sin una razón clara.
La estructura tiene que evolucionar con sentido, no por ansiedad arquitectónica.

## Otro error común

No distinguir entre:

- dominio del sistema
- infraestructura externa
- contratos públicos
- configuración compartida

Cuando esas capas se mezclan sin criterio, la estructura empieza a perder claridad muy rápido.

## Una buena heurística

Podés preguntarte:

- ¿este backend ya tiene subdominios claros?
- ¿mis carpetas actuales cuentan bien la historia del sistema?
- ¿dónde buscaría una feature completa?
- ¿qué cosas son transversales y cuáles claramente de un módulo?
- ¿qué integraciones externas merecen un lugar propio?
- ¿qué partes del sistema están demasiado acopladas hoy?
- ¿la estructura me ayuda o me frena?

Responder esto suele mostrar bastante rápido si el proyecto ya necesita una organización más madura.

## Qué relación tiene esto con una aplicación real

Absolutamente directa.

Porque apenas el backend empieza a mezclar:

- auth
- frontend real
- pagos
- storage
- notificaciones
- webhooks
- integraciones externas
- varios subdominios

la estructura deja de ser una cuestión secundaria y pasa a ser una parte muy concreta de la mantenibilidad del producto.

## Relación con Spring Boot

Spring Boot te deja bastante libertad organizativa, y eso es una ventaja enorme.
Pero justamente por esa libertad, si no tomás decisiones conscientes, el proyecto puede crecer por inercia y volverse mucho más confuso de lo necesario.

Este tema te entrena justamente para usar esa libertad con bastante más criterio.

## Idea clave para llevarte

Si tuvieras que resumir este tema en una sola idea, sería esta:

> cuando un backend Spring Boot ya reúne seguridad, frontend, pagos, storage, notificaciones e integraciones externas, seguir tratándolo como un proyecto chico suele volverlo inmanejable, y por eso conviene estructurarlo en módulos o features que expresen mejor sus dominios reales, manteniendo separadas las responsabilidades transversales y reduciendo el acoplamiento entre partes del sistema.

## Resumen

- La estructura del backend se vuelve mucho más importante cuando el proyecto crece de verdad.
- Organizar por módulos o features suele ganar mucho valor cuando ya hay varios subdominios claros.
- Seguridad, pagos, storage, webhooks e integraciones externas suelen merecer fronteras más visibles.
- No todo debe ir a `common/`, y menos aún a carpetas genéricas tipo `util` o `misc`.
- Una estructura mejor suele mejorar legibilidad, testing, colaboración y refactorización.
- No hace falta hiper-modularizar por deporte, pero sí acompañar el crecimiento real del sistema.
- Este tema marca una transición muy importante hacia una visión más madura de arquitectura interna del backend.

## Próximo tema

En el próximo tema vas a ver cómo empezar a separar responsabilidades entre dominio, aplicación e infraestructura sin caer todavía en sobreingeniería, que es un paso muy natural después de empezar a modularizar un backend más grande.
