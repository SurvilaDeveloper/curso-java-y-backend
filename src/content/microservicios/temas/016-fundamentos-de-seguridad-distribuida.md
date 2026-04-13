---
title: "Fundamentos de seguridad distribuida"
description: "Introducción a la seguridad en arquitecturas de microservicios: autenticación, autorización, tokens, JWT y el rol del proveedor de identidad en NovaMarket."
order: 16
module: "Módulo 5 · Seguridad en microservicios"
level: "base"
draft: false
---

# Fundamentos de seguridad distribuida

Hasta este punto, **NovaMarket** ya dejó de ser una aplicación simple. Tenemos varios servicios, un gateway, descubrimiento de servicios, configuración centralizada e invocaciones entre componentes.

Ese crecimiento trae beneficios, pero también hace que la seguridad se vuelva bastante más desafiante.

En un sistema monolítico, muchas veces toda la aplicación comparte el mismo contexto de seguridad dentro de un único proceso. En cambio, cuando la arquitectura se distribuye, empiezan a aparecer nuevas preguntas:

- ¿dónde se autentica el usuario?
- ¿quién valida el token?
- ¿cómo viaja la identidad entre servicios?
- ¿cómo evitamos que cualquier servicio llame a otro sin control?
- ¿qué significa autorizar una operación cuando la request atraviesa varias capas?

En esta clase vamos a construir la base conceptual para el resto del módulo.

---

## Qué cambia cuando el sistema se distribuye

Cuando una aplicación vive en un único proceso, el contexto de seguridad suele ser más fácil de mantener.

Por ejemplo:

- el usuario inicia sesión,
- la aplicación conoce su identidad,
- una parte interna llama a otra sin salir del mismo proceso,
- y las reglas de autorización suelen evaluarse dentro de una misma frontera técnica.

En microservicios eso ya no ocurre así.

Una request puede atravesar este recorrido:

1. cliente externo,
2. API Gateway,
3. `order-service`,
4. `inventory-service`,
5. mensajería o procesos posteriores.

Ahora la identidad no puede depender de una simple variable interna. Tiene que viajar o ser validada de alguna manera compatible con la distribución del sistema.

---

## Dos conceptos centrales: autenticación y autorización

Antes de avanzar, conviene separar muy bien dos ideas.

### Autenticación
Es el proceso de comprobar **quién es** el usuario o cliente que intenta acceder.

Ejemplos:

- validar credenciales,
- verificar un login,
- aceptar un token emitido por una fuente confiable.

### Autorización
Es el proceso de decidir **qué puede hacer** ese usuario o cliente autenticado.

Ejemplos:

- si puede crear órdenes,
- si puede ver inventario,
- si puede acceder a endpoints administrativos.

En sistemas distribuidos, ambas siguen siendo necesarias, pero ya no suelen resolverse del mismo modo que en una aplicación centralizada.

---

## Por qué la sesión clásica pierde protagonismo

En aplicaciones tradicionales era común trabajar con sesiones del lado servidor.

Ese enfoque no desapareció del mundo, pero en arquitecturas con microservicios muchas veces se vuelve menos conveniente porque:

- requiere compartir estado,
- complica el escalado horizontal,
- puede generar más acoplamiento entre componentes,
- no encaja tan naturalmente cuando distintos servicios necesitan validar identidad.

Por eso suelen aparecer enfoques basados en **tokens**, especialmente cuando hablamos de APIs y microservicios.

---

## El rol de los tokens

Un token es una credencial que representa identidad y, según el caso, también permisos o claims adicionales.

En un sistema como NovaMarket, un flujo típico puede ser:

1. el usuario se autentica ante un proveedor de identidad,
2. obtiene un access token,
3. envía ese token al gateway,
4. el gateway y/o los microservicios validan el token,
5. la operación continúa si la identidad y permisos son válidos.

Esto permite desacoplar la autenticación de cada microservicio individual.

---

## OAuth2 y OpenID Connect

En arquitecturas modernas, dos nombres aparecen muy seguido:

### OAuth2
Es un framework de autorización ampliamente usado para delegar acceso seguro.

### OpenID Connect
Es una capa construida sobre OAuth2 para trabajar con identidad del usuario.

En la práctica, cuando armamos un sistema con login moderno, tokens y validación de identidad, estos conceptos suelen aparecer juntos.

Para este curso no necesitamos empezar con toda la teoría formal de especificaciones. Lo importante es entender qué papel cumplen dentro de la arquitectura.

---

## Access token

El **access token** es la credencial que el cliente presenta para acceder a recursos protegidos.

En NovaMarket, por ejemplo, lo usaremos para que un usuario autenticado pueda:

- consultar sus órdenes,
- crear una orden,
- y, según el rol, acceder o no a ciertos endpoints.

Ese token puede incluir información como:

- identidad del usuario,
- roles,
- scopes,
- expiración,
- emisor.

---

## JWT

Uno de los formatos más comunes de token en este tipo de arquitecturas es **JWT**.

JWT significa **JSON Web Token**.

No es sinónimo automático de seguridad correcta, pero sí es una forma muy usada de transportar claims firmados de manera compacta.

Lo importante desde el punto de vista conceptual es que un JWT puede permitir a distintos componentes del sistema validar información sobre la identidad sin tener que depender de una sesión compartida tradicional.

---

## Claims, roles y scopes

Cuando un token incluye información adicional, esa información suele aparecer como claims.

Dentro de esos claims pueden viajar cosas como:

- identificador del usuario,
- roles,
- permisos,
- scopes,
- metadatos de la sesión o del cliente.

### Roles
Sirven para expresar perfiles o categorías de acceso.

Ejemplos en NovaMarket:

- `ROLE_USER`
- `ROLE_ADMIN`

### Scopes
Suelen representar alcances más específicos de autorización.

Dependiendo del diseño del sistema, se pueden usar para indicar qué recursos o acciones están permitidos.

---

## El proveedor de identidad

En lugar de construir desde cero toda la autenticación del curso, vamos a apoyarnos en un **Identity Provider**.

En NovaMarket, el proveedor elegido es **Keycloak**.

¿Por qué esto tiene sentido didáctico?

Porque permite concentrarnos en cómo encaja la seguridad dentro de una arquitectura distribuida sin desviar demasiado el foco hacia la implementación completa de un sistema de login propio.

El proveedor de identidad se encarga de:

- autenticar usuarios,
- emitir tokens,
- representar roles y permisos,
- ofrecer un punto confiable de identidad para el resto del sistema.

---

## Qué significa resource server

Cuando un servicio protege recursos y valida tokens para decidir si una request puede acceder, ese servicio actúa como **Resource Server**.

En nuestro curso, esto aparece en dos niveles:

- el **API Gateway** puede actuar como resource server,
- cada microservicio también puede actuar como resource server.

Más adelante vamos a comparar ambos enfoques, porque no resuelven exactamente el mismo problema.

---

## Seguridad en el borde y seguridad interna

En una arquitectura distribuida conviene distinguir dos planos.

### 1. Seguridad en el borde
Se refiere al punto donde el sistema recibe tráfico externo.

En NovaMarket, ese punto natural es el **API Gateway**.

Ahí podemos:

- exigir autenticación,
- validar tokens,
- cortar requests inválidas antes de entrar,
- centralizar parte de la política de acceso.

### 2. Seguridad interna
Se refiere a cómo se protegen los servicios detrás del gateway.

Esto es importante porque no alcanza con asumir que “si pasó por gateway ya está todo bien”.

Los microservicios también necesitan reglas claras sobre qué aceptan y qué identidad reciben.

---

## Un error frecuente: confiar ciegamente en la red interna

Un anti-patrón muy común es asumir que todo lo interno es automáticamente confiable.

Ese enfoque es peligroso por varias razones:

- el tráfico interno también puede ser invocado incorrectamente,
- un error de configuración puede exponer endpoints,
- un servicio comprometido podría llamar a otro,
- la arquitectura pierde defensa en profundidad.

Por eso, incluso si el gateway valida tokens, sigue siendo importante pensar cómo se protegen los servicios downstream.

---

## Propagación de identidad

Una vez que un usuario fue autenticado, aparece otra pregunta importante:

**¿cómo llega esa identidad a los demás servicios?**

Ese es uno de los puntos más delicados en seguridad distribuida.

Por ejemplo, si el gateway recibe un token válido y luego deriva la request a `order-service`, necesitamos decidir:

- si el token se reenvía,
- si el servicio downstream valida el token también,
- si se transforman ciertos datos de identidad,
- qué claims se usan para autorización.

Más adelante veremos esto en detalle con **Token Relay** y con microservicios configurados como resource servers.

---

## Seguridad y el caso de uso principal del curso

Nuestro flujo central sigue siendo:

**consultar catálogo → crear orden → validar stock → registrar orden → publicar evento → notificar**

Con seguridad distribuida, este flujo cambia:

- ya no cualquier cliente puede crear órdenes,
- el usuario debe autenticarse,
- el gateway necesita tratar identidad,
- `order-service` necesita saber quién intenta crear la orden,
- ciertas operaciones administrativas deben restringirse.

Esto hace que el sistema se parezca mucho más a un escenario real.

---

## Qué endpoints podrían protegerse en NovaMarket

### Públicos o menos restrictivos al principio
- `GET /products`

### Protegidos para usuarios autenticados
- `POST /orders`
- `GET /orders/{id}`
- `GET /orders`

### Protegidos para administradores
- endpoints internos de inventario,
- operaciones de mantenimiento,
- vistas globales o administrativas.

Este tipo de separación nos da una base muy buena para enseñar autorización en un contexto realista.

---

## Qué problemas de seguridad evita este enfoque

Trabajar con un proveedor de identidad, tokens y validación distribuida ayuda a enfrentar varios problemas:

- endpoints sin autenticación,
- servicios que confían demasiado en el perímetro,
- autorización inconsistente,
- lógica de seguridad duplicada y desordenada,
- falta de trazabilidad sobre quién hizo qué.

No resuelve mágicamente toda la seguridad del sistema, pero sí establece una base mucho más profesional.

---

## Qué vamos a hacer en las próximas clases

Esta clase fue conceptual, porque necesitábamos ordenar el mapa.

A continuación vamos a trabajar sobre dos preguntas más concretas:

1. **¿Qué significa que el gateway actúe como cliente o como resource server?**
2. **¿Cómo integramos Keycloak y cómo propagamos seguridad hacia los microservicios?**

Esas decisiones cambian mucho la arquitectura del sistema y la forma de proteger los endpoints.

---

## Cierre

La seguridad en microservicios no consiste solo en “poner login”.

Cuando el sistema se distribuye, también se distribuyen los problemas de identidad, autorización y confianza entre componentes.

Por eso necesitamos una base clara sobre:

- autenticación,
- autorización,
- tokens,
- proveedor de identidad,
- resource servers,
- y propagación segura de identidad.

En NovaMarket vamos a usar **Keycloak**, **JWT** y una estrategia compatible con API Gateway y microservicios protegidos para construir una seguridad más realista y coherente con una arquitectura distribuida.

En la próxima clase vamos a comparar dos enfoques clave para el gateway: **actuar como cliente OAuth2** o **actuar como resource server**, y vamos a ver por qué esa diferencia importa tanto.
