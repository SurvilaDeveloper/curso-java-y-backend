---
title: "Keycloak desde cero"
description: "Keycloak es un servidor de identidad y acceso.
  Eso significa que su trabajo principal es ocuparse de preguntas como estas:
- quién es el usuario,
- cómo inicia sesión,
- qué puede hacer,
- qué aplicaciones pueden confiar en esa identidad.
  En lugar de programar desde cero el login, la gestión de usuarios, la recuperación de contraseña, los roles, los permisos y la emisión de tokens, una aplicación puede delegar todo eso en Keycloak.
  Dicho de forma simple:
- tu aplicación se ocupa de la lógica del negocio,
- Keycloak se ocupa de la autenticación y gran parte de la autorización."
order: 19
module: "'Autenticación'"
level: "intro"
draft: false
---
# Keycloak desde cero

## Qué es Keycloak

Keycloak es un **servidor de identidad y acceso**.

Eso significa que su trabajo principal es ocuparse de preguntas como estas:

- **quién es el usuario**,
- **cómo inicia sesión**,
- **qué puede hacer**,
- **qué aplicaciones pueden confiar en esa identidad**.

En lugar de programar desde cero el login, la gestión de usuarios, la recuperación de contraseña, los roles, los permisos y la emisión de tokens, una aplicación puede delegar todo eso en Keycloak.

Dicho de forma simple:

- **tu aplicación** se ocupa de la lógica del negocio,
- **Keycloak** se ocupa de la autenticación y gran parte de la autorización.

---

## Para qué sirve

Keycloak sirve para centralizar la seguridad de una o varias aplicaciones.

Se usa para:

- iniciar sesión,
- registrar usuarios,
- administrar usuarios,
- manejar roles y permisos,
- emitir tokens,
- permitir **Single Sign-On (SSO)**,
- integrar login con Google, GitHub u otros proveedores,
- conectar con LDAP o Active Directory,
- aplicar flujos de seguridad más complejos como verificación de email, cambio obligatorio de contraseña o doble factor.

En la documentación oficial, Keycloak se presenta como un servidor separado que protege aplicaciones usando estándares como **OpenID Connect**, **OAuth 2.0** y **SAML**. También incluye consola de administración, gestión centralizada de usuarios, grupos, roles, sesiones y soporte para login social, federación de usuarios y flujos de autenticación personalizables.

---

## Qué problema resuelve

Cuando una aplicación empieza a crecer, la autenticación deja de ser “solo un formulario de login”.

Aparecen necesidades como estas:

- no guardar contraseñas de manera insegura,
- permitir que un usuario acceda a varias apps con una sola sesión,
- manejar roles como `ADMIN`, `USER`, `MANAGER`,
- saber cuándo expira una sesión,
- revocar accesos,
- permitir recuperación de contraseña,
- emitir tokens para APIs y microservicios,
- integrar inicio de sesión corporativo,
- no repetir la misma lógica de seguridad en cada proyecto.

Keycloak resuelve eso concentrándolo en un solo sistema.

---

## Cómo se usa en una arquitectura real

La idea más importante es esta:

**Keycloak corre como un servidor separado.**

Tu aplicación no “contiene” a Keycloak adentro. En cambio, tu aplicación se comunica con él.

### Flujo mental básico

1. el usuario entra a tu aplicación,
2. tu aplicación lo redirige a Keycloak,
3. Keycloak muestra la pantalla de login,
4. el usuario se autentica,
5. Keycloak devuelve tokens,
6. tu aplicación usa esos tokens,
7. tu backend o tus APIs validan esos tokens y deciden qué permitir.

Eso hace que la aplicación nunca tenga que encargarse directamente de las credenciales del usuario en el flujo estándar de navegador.

---

## Conceptos fundamentales que hay que entender

Antes de usar Keycloak, conviene aprender estos conceptos.

### Autenticación

Es el proceso de comprobar **quién es el usuario**.

Ejemplo: un usuario ingresa email y contraseña y el sistema confirma que son válidos.

### Autorización

Es el proceso de decidir **qué puede hacer ese usuario**.

Ejemplo: un usuario autenticado puede ver su perfil, pero solo un administrador puede entrar al panel de gestión.

### Realm

Un **realm** es un espacio aislado dentro de Keycloak.

Cada realm administra sus propios:

- usuarios,
- contraseñas,
- roles,
- grupos,
- clientes,
- sesiones.

Podés pensar un realm como un “universo de autenticación”.

Ejemplo:

- un realm para producción,
- otro para pruebas,
- otro para otra aplicación o cliente.

### User

Es el usuario que inicia sesión.

Un usuario puede tener:

- username,
- email,
- contraseña,
- atributos,
- grupos,
- roles.

### Role

Un **role** representa una categoría de acceso.

Ejemplos:

- `USER`
- `ADMIN`
- `EDITOR`

Las aplicaciones suelen decidir permisos a partir de roles, porque es más cómodo administrar roles que permisos individuales por usuario.

### Group

Un **group** sirve para agrupar usuarios.

A un grupo se le pueden asignar roles. Los usuarios que pertenecen a ese grupo heredan esos roles.

### Client

Un **client** es la aplicación o servicio que quiere usar Keycloak.

Por ejemplo:

- un frontend React,
- una API en Spring Boot,
- un backend Node.js,
- un microservicio.

Keycloak necesita saber qué aplicación le está pidiendo autenticación. Para eso se registra un client.

### Token

Un **token** es una pieza de información firmada digitalmente que representa identidad o permisos.

Los más comunes en el ecosistema OIDC/OAuth2 son:

- **access token**: sirve para acceder a APIs,
- **id token**: contiene información sobre la identidad del usuario,
- **refresh token**: permite obtener nuevos tokens sin volver a loguearse.

---

## Protocolos que usa

Keycloak se basa en estándares abiertos.

Los más importantes son:

### OpenID Connect

Se usa para autenticación moderna en aplicaciones web y móviles.

### OAuth 2.0

Se usa para autorización y acceso delegado entre aplicaciones y servicios.

### SAML

Es un estándar muy usado en entornos corporativos y sistemas empresariales más tradicionales.

Para empezar hoy, lo más normal es trabajar con **OpenID Connect**.

---

## Dónde corre Keycloak

Keycloak puede correr:

- en tu máquina local,
- en Docker,
- en un VPS,
- en una VM,
- en Kubernetes,
- en infraestructura on-premise.

Para aprender, lo más cómodo es levantarlo en **Docker**.

---

## Qué cosas no hace tu aplicación cuando usás Keycloak

Cuando una aplicación delega autenticación a Keycloak, deja de tener que implementar por su cuenta muchas tareas delicadas:

- no necesita crear su propio sistema de login desde cero,
- no necesita gestionar sesiones de forma manual para todos los casos,
- no necesita reinventar la emisión de tokens,
- no necesita mantener pantallas complejas de autenticación,
- no necesita repetir el mismo sistema de roles en cada proyecto.

Esto no significa que Keycloak haga absolutamente toda la seguridad de una aplicación. Tu backend igual sigue necesitando:

- validar permisos,
- proteger endpoints,
- sanitizar datos,
- validar entradas,
- aplicar reglas del negocio,
- cuidar la seguridad general del sistema.

Keycloak resuelve la parte de **identidad y acceso**, no toda la seguridad del software.

---

## Primer escenario mental: una sola app

Supongamos que tenés:

- un frontend,
- una API,
- una base de datos.

Con Keycloak, el flujo sería así:

1. el usuario abre el frontend,
2. el frontend lo redirige al login de Keycloak,
3. Keycloak autentica al usuario,
4. Keycloak entrega tokens,
5. el frontend llama a la API enviando el access token,
6. la API valida el token,
7. la API responde si el usuario tiene permiso.

---

## Segundo escenario mental: varias apps

Ahora imaginá que tenés:

- una app de ventas,
- una app de administración,
- una app de soporte.

En lugar de tener tres logins distintos, todas pueden usar el mismo servidor Keycloak.

Entonces el usuario inicia sesión una sola vez y accede a varias aplicaciones.

Eso es **Single Sign-On**.

---

## Paso a paso para usar Keycloak por primera vez

A continuación tenés un recorrido básico y amigable para empezar desde cero.

---

## Paso 1: levantar Keycloak

La forma más simple para empezar es con Docker.

Ejemplo:

```bash
docker run \
  -p 127.0.0.1:8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin1234 \
  quay.io/keycloak/keycloak:26.6.0 \
  start-dev
```

### Qué hace este comando

- descarga la imagen de Keycloak si no la tenés,
- expone el puerto `8080`,
- crea el usuario administrador inicial,
- arranca Keycloak en modo desarrollo con `start-dev`.

Después podés abrir en el navegador:

```text
http://localhost:8080
```

Y entrar al panel de administración con el usuario y la contraseña configurados.

### Importante

`start-dev` es útil para aprender y hacer pruebas locales. No es la forma adecuada para producción.

En producción, Keycloak espera una configuración más segura, incluyendo hostname y HTTPS/TLS.

---

## Paso 2: entrar al Admin Console

Una vez levantado, entrás al **Admin Console**.

Ese panel es donde administrás:

- realms,
- usuarios,
- clientes,
- roles,
- grupos,
- sesiones,
- proveedores externos,
- flujos de autenticación.

---

## Paso 3: crear un realm

Al principio existe un realm llamado `master`.

Ese realm se usa para administrar el propio Keycloak. No conviene usarlo para tus aplicaciones normales.

Entonces lo habitual es crear un realm nuevo, por ejemplo:

- `myrealm`
- `empresa`
- `novamarket`

### Qué representa ese realm

Ese realm será el espacio aislado donde vivan:

- tus usuarios,
- tus clientes,
- tus roles,
- tu configuración de autenticación.

---

## Paso 4: crear un usuario

Dentro del realm nuevo, creás un usuario.

Ejemplo:

- username: `gabriel`
- email: `gabriel@example.com`

Después le asignás una contraseña desde la sección **Credentials**.

Ahí podés decidir si querés que sea temporal o no.

---

## Paso 5: crear roles

Ahora creás roles dentro del realm, por ejemplo:

- `USER`
- `ADMIN`

Luego se los asignás al usuario.

### Para qué sirve esto

Tu aplicación va a poder mirar esos roles para decidir acceso.

Ejemplo:

- `USER` puede ver su perfil,
- `ADMIN` puede entrar al panel de administración.

---

## Paso 6: crear un client

Ahora registrás la aplicación que va a usar Keycloak.

En la consola:

- entrás a **Clients**,
- creás un nuevo client,
- dejás el tipo en **OpenID Connect**,
- definís un **Client ID**.

Ejemplos de Client ID:

- `frontend-web`
- `spring-api`
- `admin-panel`

### Qué representa ese client

Representa a la aplicación o servicio que confía en Keycloak.

Keycloak necesita diferenciar a cada aplicación que participa del sistema de autenticación.

---

## Paso 7: decidir qué tipo de flujo necesita tu aplicación

No todas las aplicaciones usan Keycloak igual.

### Caso A: aplicación web con navegador

Lo más normal es usar **Authorization Code Flow**.

Flujo resumido:

1. el navegador es redirigido a Keycloak,
2. el usuario inicia sesión allí,
3. Keycloak devuelve un código,
4. la aplicación intercambia ese código por tokens.

Este es el flujo recomendado para la mayoría de aplicaciones web modernas.

### Caso B: servicio que se autentica a sí mismo

Si no hay usuario humano y se trata de comunicación entre servicios, se usa **Client Credentials**.

Ejemplo:

- un servicio backend que necesita llamar a otra API.

### Caso C: pedir usuario y contraseña directamente desde la app

Existe un flujo llamado **Direct Grant** o **Resource Owner Password Credentials**.

Pero hoy no se recomienda como flujo normal, porque expone más a la aplicación al manejo de credenciales del usuario y deja afuera varias ventajas del login redirigido.

Para aprender puede servir como experimento local, pero no conviene adoptarlo como patrón principal.

---

## Paso 8: obtener tokens

Una vez que el usuario se autentica, Keycloak entrega tokens.

En una app web real, eso ocurre a través del flujo de redirección del navegador.

En pruebas simples o automatizaciones, algunos tokens también pueden obtenerse llamando al endpoint de token.

Ejemplo de endpoint OIDC del realm:

```text
http://localhost:8080/realms/myrealm/protocol/openid-connect/token
```

Ese endpoint se usa en distintos grants según el caso.

---

## Paso 9: hacer que tu aplicación confíe en Keycloak

Acá aparece la segunda mitad de la integración.

No alcanza con que Keycloak exista: tu aplicación también tiene que saber confiar en los tokens emitidos por Keycloak.

En general, eso implica:

- configurar el `issuer` del realm,
- usar OpenID Connect u OAuth 2.0,
- validar firma, expiración y claims del token,
- leer roles o permisos desde el token.

### Ejemplo mental con Spring Boot

En un backend Spring Boot, normalmente configurás la API para que actúe como **Resource Server** y valide JWTs emitidos por Keycloak.

Entonces el backend recibe un token y decide:

- si el token es válido,
- quién es el usuario,
- qué roles tiene,
- si puede o no entrar a un endpoint.

---

## Paso 10: proteger endpoints con roles

Una vez que los roles viajan en el token, tu aplicación puede hacer reglas como estas:

- `/perfil` requiere usuario autenticado,
- `/admin` requiere rol `ADMIN`,
- `/reportes` requiere rol `MANAGER`.

Esto ya no depende de que cada app invente un sistema casero. La identidad viene centralizada desde Keycloak.

---

## Qué es lo mínimo que hay que configurar para arrancar

Para una primera prueba real, el núcleo es este:

1. levantar Keycloak,
2. entrar al Admin Console,
3. crear un realm,
4. crear un usuario,
5. asignarle contraseña,
6. crear roles,
7. asignarle roles,
8. crear un client,
9. configurar tu aplicación para confiar en el realm,
10. probar login y acceso a endpoints.

---

## Ejemplo completo en palabras simples

Imaginá una app de cursos.

Querés que:

- cualquier usuario autenticado vea su perfil,
- solo los administradores creen cursos,
- los editores modifiquen contenido.

Con Keycloak podrías hacer esto:

### En Keycloak

- crear el realm `cursos`,
- crear roles `USER`, `EDITOR`, `ADMIN`,
- crear usuarios,
- asignar roles,
- registrar el frontend,
- registrar la API.

### En la aplicación

- redirigir el login a Keycloak,
- recibir tokens,
- enviar el access token al backend,
- validar el token,
- permitir o denegar acceso según roles.

Resultado:

- el login queda centralizado,
- los permisos quedan organizados,
- varias apps podrían compartir la misma identidad.

---

## Diferencia entre usuarios, roles y permisos

Es muy común confundir estos conceptos al principio.

### Usuario

Es la persona o cuenta que inicia sesión.

### Rol

Es una categoría de acceso.

Ejemplo:

- `ADMIN`
- `USER`
- `SUPPORT`

### Permiso

Es una acción o acceso concreto.

Ejemplo:

- crear productos,
- ver reportes,
- borrar usuarios.

Muchas aplicaciones usan roles para derivar permisos.

---

## Qué ventajas tiene usar Keycloak

### 1. Centralización

Toda la identidad queda en un lugar.

### 2. Menos código sensible en tu aplicación

No tenés que reinventar el sistema de autenticación.

### 3. Soporte de estándares

No dependés de un mecanismo inventado para un solo proyecto.

### 4. Escala mejor cuando hay varias apps

Una sola infraestructura de identidad puede servir para varios sistemas.

### 5. Roles, grupos y flujos más robustos

Permite modelar seguridad de manera más ordenada.

### 6. Integraciones

Puede conectarse con proveedores sociales, otros IDP, LDAP y Active Directory.

---

## Qué desventajas o costos tiene

También hay que decirlo con honestidad: Keycloak no siempre es la mejor opción para todo.

### 1. Tiene una curva de aprendizaje

Al principio aparecen muchos conceptos juntos.

### 2. Suma infraestructura

Ahora tenés otro servicio que levantar, configurar y mantener.

### 3. Para proyectos muy chicos puede resultar demasiado

Si la app es mínima, tal vez un sistema más simple alcance.

### 4. En producción requiere una configuración seria

No basta con levantarlo y listo. Hay que considerar:

- HTTPS,
- hostname,
- persistencia,
- base de datos,
- respaldos,
- monitoreo,
- actualizaciones.

---

## Errores comunes de quien empieza

### Pensar que Keycloak reemplaza toda la seguridad

No. Resuelve identidad y acceso, pero el resto de la seguridad sigue siendo responsabilidad de la aplicación.

### Usar el realm `master` para la app

No es lo ideal. Conviene crear realms específicos.

### Querer entender todo junto de una vez

Es mejor empezar por una ruta simple:

- realm,
- usuario,
- rol,
- client,
- login,
- token,
- endpoint protegido.

### Confundir autenticación con autorización

Una cosa es saber quién es el usuario y otra es decidir qué puede hacer.

### Usar Direct Grant como flujo principal

Para pruebas puede ayudar, pero no es el camino recomendado para aplicaciones web modernas.

---

## Qué conviene aprender después de esta primera lectura

Una vez que entiendas esta base, el siguiente orden de estudio suele ser muy bueno:

1. realm, user, role, client,
2. OpenID Connect,
3. Authorization Code Flow,
4. access token, id token, refresh token,
5. integración con una API,
6. roles y autorización por endpoint,
7. login social o federación,
8. despliegue seguro en producción.

---

## Resumen corto

Keycloak es un servidor que centraliza la autenticación y parte de la autorización de una o varias aplicaciones.

Sirve para:

- manejar login,
- usuarios,
- roles,
- grupos,
- sesiones,
- tokens,
- SSO,
- integración con proveedores externos.

Se usa registrando aplicaciones como **clients**, organizando usuarios dentro de un **realm**, asignando **roles** y haciendo que las aplicaciones confíen en los **tokens** emitidos por Keycloak.

Para empezar, el camino más simple es:

- levantar Keycloak en Docker,
- crear un realm,
- crear un usuario,
- asignar roles,
- crear un client,
- integrar una aplicación con OpenID Connect.

---

## Glosario rápido

- **Keycloak**: servidor de identidad y acceso.
- **Realm**: espacio aislado con usuarios, roles y clientes.
- **Client**: aplicación o servicio que usa Keycloak.
- **User**: usuario que inicia sesión.
- **Role**: categoría de acceso.
- **Group**: agrupación de usuarios.
- **Authentication**: validar quién es el usuario.
- **Authorization**: decidir qué puede hacer.
- **OIDC**: protocolo moderno de autenticación.
- **OAuth 2.0**: marco de autorización.
- **Access Token**: token para acceder a APIs.
- **ID Token**: token con datos de identidad.
- **Refresh Token**: token para renovar otros tokens.
- **SSO**: una sesión para varias aplicaciones.

---

## Fuentes oficiales consultadas

- [Keycloak · Documentación oficial](https://www.keycloak.org/documentation)
- [Server Administration Guide](https://www.keycloak.org/docs/latest/server_admin/index.html)
- [Getting Started with Docker](https://www.keycloak.org/getting-started/getting-started-docker)
- [Configuring Keycloak](https://www.keycloak.org/server/configuration)
- [Securing applications and services with OpenID Connect](https://www.keycloak.org/securing-apps/oidc-layers)
- [Sitio oficial de Keycloak](https://www.keycloak.org/)
