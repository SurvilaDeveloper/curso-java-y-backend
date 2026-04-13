---
title: "Qué es Keycloak y cómo usarlo paso a paso"
description: "Keycloak es una solución de Identity and Access Management (IAM) de código abierto.  
  Su objetivo es resolver de forma centralizada problemas como:
- autenticación,
- autorización,
- inicio de sesión único (SSO),
- gestión de usuarios,
- roles y permisos,
- federación de identidad,
- y emisión de tokens para aplicaciones y APIs."
order: 20
module: "'Autenticación'"
level: "intro"
draft: false
---
# Qué es Keycloak y cómo usarlo paso a paso

## Introducción

**Keycloak** es una solución de **Identity and Access Management (IAM)** de código abierto.  
Su objetivo es resolver de forma centralizada problemas como:

- autenticación,
- autorización,
- inicio de sesión único (**SSO**),
- gestión de usuarios,
- roles y permisos,
- federación de identidad,
- y emisión de tokens para aplicaciones y APIs.

En vez de que cada aplicación tenga su propio sistema de login, sus propios usuarios y sus propias contraseñas, las aplicaciones delegan esa responsabilidad en **Keycloak**.

Eso te permite:

- no guardar contraseñas en cada sistema,
- centralizar usuarios y credenciales,
- usar estándares como **OpenID Connect (OIDC)** y **SAML**,
- emitir **access tokens**, **refresh tokens** e **ID tokens**,
- y separar mejor la lógica de negocio de la seguridad.

---

## La idea central de Keycloak

La idea es simple:

1. Tu aplicación redirige al usuario a **Keycloak**.
2. El usuario se autentica en Keycloak.
3. Keycloak devuelve tokens a tu aplicación.
4. Tu aplicación usa esos tokens para:
   - saber quién es el usuario,
   - validar su sesión,
   - y decidir qué puede hacer.

En otras palabras:

- **Keycloak autentica**
- **tu aplicación confía en esa autenticación**
- y **tu backend usa los tokens para proteger recursos**

---

## Conceptos clave antes del paso a paso

### 1. Realm

Un **realm** es como un espacio aislado dentro de Keycloak.

Cada realm tiene su propio:

- conjunto de usuarios,
- clientes,
- roles,
- configuración,
- login,
- y políticas.

Podés pensarlo como un **tenant** o un “universo” separado.

Ejemplo:

- `master`: realm administrativo de Keycloak.
- `miempresa`: realm para tus apps reales.
- `curso-backend`: realm de pruebas para un proyecto.

**Importante:** el realm `master` conviene usarlo solo para administrar Keycloak, no para tus aplicaciones.

---

### 2. Client

Un **client** representa una aplicación o servicio que usa Keycloak.

Puede ser, por ejemplo:

- una app web,
- un backend,
- una SPA,
- una app mobile,
- o un servicio server-to-server.

Ejemplos de clients:

- `frontend-web`
- `api-gateway`
- `spring-backend`
- `mi-app-react`

---

### 3. Usuario

Son los usuarios que van a autenticarse.

Keycloak puede administrarlos internamente o federarlos desde otros proveedores/directorios.

---

### 4. Roles

Los **roles** permiten definir permisos de alto nivel.

Ejemplos:

- `admin`
- `user`
- `editor`

Después tu backend puede leer esos roles desde el token y tomar decisiones.

---

### 5. Token

Cuando un usuario se autentica correctamente, Keycloak puede emitir:

- **ID Token**: información del usuario autenticado.
- **Access Token**: sirve para acceder a APIs protegidas.
- **Refresh Token**: sirve para renovar el access token.

---

### 6. OpenID Connect

Es el protocolo más común para integrar Keycloak con aplicaciones modernas.

En la práctica, para la mayoría de proyectos web/backend actuales, lo más habitual es usar **OIDC**.

---

## ¿Cuándo conviene usar Keycloak?

Keycloak tiene mucho sentido cuando:

- tenés varias aplicaciones,
- necesitás centralizar autenticación,
- querés SSO,
- querés separar seguridad del código de negocio,
- necesitás roles y claims en tokens,
- o querés integrar login social, SAML, LDAP, etc.

Para una app muy chica y aislada podría ser demasiado.  
Pero para proyectos medianos o grandes, o para una arquitectura de microservicios, puede ahorrar muchísimo trabajo.

---

# Paso a paso: usar Keycloak desde cero

## Objetivo práctico

Vamos a hacer un flujo simple:

1. Levantar Keycloak.
2. Entrar al panel admin.
3. Crear un realm.
4. Crear un client.
5. Crear un usuario.
6. Asignarle una contraseña.
7. Probar login.
8. Ver cómo se conectaría una aplicación.
9. Entender qué deberías hacer después en un backend real.

---

## Paso 1: levantar Keycloak rápido con Docker

La forma más simple para aprender es usar Docker en modo desarrollo.

```bash
docker run -p 127.0.0.1:8080:8080 ^
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin ^
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin ^
  quay.io/keycloak/keycloak:26.6.0 start-dev
```

En Linux o macOS sería así:

```bash
docker run -p 127.0.0.1:8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:26.6.0 start-dev
```

### Qué hace este comando

- expone Keycloak en `http://localhost:8080`
- crea un usuario administrador inicial
- arranca en **modo desarrollo**

### Importante

`start-dev` es ideal para aprender y probar localmente.  
No es la forma correcta de preparar un entorno serio de producción.

---

## Paso 2: entrar al Admin Console

Abrí en el navegador:

```text
http://localhost:8080
```

Entrá al **Admin Console** e iniciá sesión con:

- usuario: `admin`
- contraseña: `admin`

---

## Paso 3: crear un realm

Una vez dentro:

1. Abrí la administración de realms.
2. Elegí **Create realm**.
3. Poné un nombre, por ejemplo:

```text
novamarket
```

4. Confirmá la creación.

### Qué acabás de hacer

Creaste el espacio aislado donde van a vivir:

- tus usuarios,
- tus clientes,
- tus roles,
- y tus políticas.

A partir de ahora, trabajá dentro de ese realm y no dentro de `master`.

---

## Paso 4: crear un client para tu aplicación

Ahora vamos a registrar una aplicación.

1. Entrá en **Clients**
2. Elegí **Create client**
3. Seleccioná:

- **Client type**: `OpenID Connect`
- **Client ID**: por ejemplo:

```text
novamarket-web
```

4. Continuá el asistente

### Según el tipo de app, cambiás la configuración

#### Caso A: SPA / frontend en navegador
Usá un **public client**.

#### Caso B: backend tradicional o app server-side
Usá un **confidential client**.

---

## Paso 5: configurar el client según tu caso

### Opción 1: aplicación web server-side o backend con login
Usá un **confidential client**.

Configuraciones típicas:

- Client authentication: **On**
- Authorization: según necesidad
- Standard flow: **On**

También vas a definir tus **redirect URIs** válidas.

Ejemplo:

```text
http://localhost:3000/*
```

o mejor, más específico:

```text
http://localhost:3000/login/oauth2/code/keycloak
```

#### Recomendación importante
Cuanto más específicas sean las redirect URIs, mejor.  
No conviene usar comodines amplios si no son realmente necesarios.

---

### Opción 2: SPA en React/Vue/Angular
Usá un **public client**.

¿Por qué?  
Porque una app que corre en el navegador no puede guardar de forma segura un client secret.

Configuraciones típicas:

- Client authentication: **Off**
- Standard flow: **On**
- PKCE: **recomendado**
- Valid redirect URIs: lo más específicas posible

Ejemplo:

```text
http://localhost:5173/*
```

o mejor:

```text
http://localhost:5173/callback
```

---

## Paso 6: crear un usuario

Ahora vamos a crear un usuario de prueba.

1. Entrá en **Users**
2. Elegí **Create new user**
3. Completá, por ejemplo:

- Username: `gabriel`
- First name: `Gabriel`
- Last name: `Survila`
- Email: `gabriel@example.com`

4. Guardá

---

## Paso 7: asignar contraseña al usuario

Después de crear el usuario:

1. Abrí su perfil
2. Andá a la sección de credenciales o contraseña
3. Definí una contraseña
4. Si querés simplificar las pruebas, desactivá el cambio obligatorio en el primer login

Ejemplo:

```text
Clave123456!
```

Solo para pruebas locales.  
En entornos reales, usá contraseñas fuertes y políticas apropiadas.

---

## Paso 8: probar el login

Ya tenés:

- Keycloak levantado
- realm creado
- client creado
- usuario creado

Ahora tenés dos formas simples de probar:

### Forma A: desde una aplicación integrada
Es la forma real.

### Forma B: usando el endpoint well-known y/o herramientas OIDC
Sirve para verificar configuración.

El endpoint más importante para entender una integración OIDC es:

```text
http://localhost:8080/realms/novamarket/.well-known/openid-configuration
```

Ese endpoint publica:

- authorization endpoint
- token endpoint
- userinfo endpoint
- logout endpoint
- jwks endpoint
- issuer
- y otros metadatos del realm

Si ese endpoint responde bien, ya tenés una base muy importante para integrar tu app.

---

# Cómo usar Keycloak desde una aplicación

## Flujo mental básico

Tu app no “habla” con usuario y contraseña directamente.

El flujo correcto es:

1. Tu app redirige al usuario a Keycloak
2. Keycloak autentica
3. Keycloak devuelve un **authorization code**
4. Tu app intercambia ese code por tokens
5. Tu app usa el **access token**
6. Tu backend valida el token o usa la firma pública del realm

---

## Ejemplo conceptual con backend

Supongamos una app web con backend.

### Qué configurás en el backend

- issuer URI
- client ID
- client secret si es confidential
- redirect URI
- validación del token JWT

### Qué hace el backend

- redirige al login de Keycloak
- recibe el code
- obtiene tokens
- crea sesión o usa el token para llamadas
- protege rutas según autenticación y roles

---

## Ejemplo mental con Spring Boot

Si usaras Spring Security con OAuth2 Login / Resource Server, normalmente tendrías algo de este estilo conceptual:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          keycloak:
            client-id: novamarket-web
            client-secret: TU_SECRET
            authorization-grant-type: authorization_code
            scope: openid,profile,email
        provider:
          keycloak:
            issuer-uri: http://localhost:8080/realms/novamarket
```

Y si el backend expone API protegida por JWT:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8080/realms/novamarket
```

Esto es conceptual.  
La configuración exacta depende del stack, pero la idea central es esa.

---

# Roles y autorización

## Paso 9: crear un rol

Ahora podemos agregar autorización básica.

1. Entrá en **Realm roles**
2. Elegí **Create role**
3. Creá, por ejemplo:

```text
admin
```

o

```text
user
```

---

## Paso 10: asignar el rol a un usuario

1. Volvé al usuario
2. Entrá a su sección de asignación de roles
3. Asignale el rol correspondiente

Ahora, cuando ese usuario se autentique, el token podrá incluir ese rol.

Después tu backend puede hacer cosas como:

- permitir `/admin` solo a quienes tengan `admin`
- permitir `/profile` a usuarios autenticados
- diferenciar permisos de negocio

---

# Qué deberías hacer en un proyecto real

## 1. Separar autenticación de autorización

Keycloak autentica muy bien.  
Pero muchas veces la autorización de negocio fina sigue viviendo en tu backend.

Ejemplo:

- Keycloak dice: “este usuario es admin”
- Tu sistema decide: “este admin puede ver estos recursos, pero no estos otros”

---

## 2. Usar realms con criterio

No conviene crear realms porque sí.

Un realm es útil cuando realmente querés aislamiento fuerte.  
Para muchos proyectos, un solo realm con buenos roles, grupos y clients alcanza.

---

## 3. Cuidar muchísimo las redirect URIs

Este punto es muy importante.

No uses redirect URIs demasiado abiertas si no hace falta.

Mejor:

```text
http://localhost:3000/callback
```

que:

```text
http://localhost:3000/*
```

Y en producción, siempre con HTTPS.

---

## 4. Entender public vs confidential client

### Public client
Para apps en navegador o mobile donde no podés guardar un secret de forma segura.

### Confidential client
Para backend o apps server-side donde sí podés guardar un client secret del lado servidor.

---

## 5. Usar PKCE cuando corresponda

Especialmente para apps públicas o basadas en navegador.  
PKCE agrega protección importante al Authorization Code Flow.

---

# Ejemplo de paso a paso resumido

## Paso a paso mínimo realista

### Paso 1
Levantás Keycloak con Docker.

### Paso 2
Entrás al panel admin.

### Paso 3
Creás un realm, por ejemplo `novamarket`.

### Paso 4
Creás un client OIDC.

### Paso 5
Definís redirect URIs válidas.

### Paso 6
Creás un usuario de prueba.

### Paso 7
Le asignás contraseña.

### Paso 8
Creás roles.

### Paso 9
Asignás roles a usuarios.

### Paso 10
Configurás tu app para usar el issuer URI del realm.

### Paso 11
Probás el login.

### Paso 12
Protegés rutas o endpoints usando el token y los roles.

---

# Errores comunes

## 1. Usar el realm `master` para la app
Conviene usar `master` solo para administración.

## 2. Configurar mal las redirect URIs
Si están mal, el login falla o queda inseguro.

## 3. Guardar secretos donde no corresponde
Los secrets van del lado servidor, no en frontend público.

## 4. No distinguir autenticación de autorización
Keycloak autentica; tu negocio puede necesitar reglas más finas.

## 5. Pensar que Keycloak reemplaza toda la lógica de seguridad
No reemplaza:
- validaciones de negocio,
- permisos finos del dominio,
- auditoría propia,
- ni seguridad general de tu backend.

---

# Qué cambia entre desarrollo y producción

## En desarrollo

Podés usar:

- `start-dev`
- credenciales simples
- base embebida
- HTTP local
- configuración mínima

## En producción

Deberías pensar en:

- base de datos externa
- HTTPS
- credenciales fuertes
- backups
- monitoreo
- configuración de hostname
- políticas de clientes más estrictas
- redirect URIs bien cerradas
- y un despliegue más serio

---

# Cuándo Keycloak encaja muy bien

Keycloak encaja especialmente bien cuando:

- tenés varias apps,
- querés SSO,
- querés separar login del resto del sistema,
- necesitás OAuth2 / OIDC,
- querés manejar roles y usuarios desde una consola central,
- o estás construyendo microservicios y necesitás tokens firmados.

---

# Resumen final

**Keycloak** es un servidor de identidad y acceso que centraliza autenticación, autorización básica y emisión de tokens usando estándares como **OpenID Connect** y **SAML**.

La forma más simple de empezar es:

1. levantarlo,
2. crear un realm,
3. registrar un client,
4. crear un usuario,
5. asignar roles,
6. y configurar tu aplicación para autenticarse contra ese realm.

El gran valor de Keycloak es que te permite sacar del código de cada aplicación:

- login,
- gestión de credenciales,
- SSO,
- emisión de tokens,
- y parte de la administración de usuarios.

Así, tus aplicaciones pueden enfocarse más en su lógica de negocio y menos en reinventar autenticación.

---

# Fuentes oficiales consultadas

- Keycloak Documentation: https://www.keycloak.org/documentation
- Getting started with Docker: https://www.keycloak.org/getting-started/getting-started-docker
- Getting started with OpenJDK: https://www.keycloak.org/getting-started/getting-started-zip
- Securing applications overview: https://www.keycloak.org/securing-apps/overview
- OIDC endpoints: https://www.keycloak.org/securing-apps/oidc-layers
- Server Administration Guide: https://www.keycloak.org/docs/latest/server_admin/
