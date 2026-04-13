---
title: "Integración de seguridad con Keycloak"
description: "Configuración de Keycloak como Identity Provider para NovaMarket, manejo de realms, clientes, usuarios, emisión de tokens y vínculo con Spring Cloud Gateway."
order: 18
module: "Módulo 5 · Seguridad en microservicios"
level: "base"
draft: false
---

# Integración de seguridad con Keycloak

En la clase anterior vimos los fundamentos de la seguridad distribuida y la diferencia entre autenticación, autorización, tokens y resource servers. En esta clase vamos a dar un paso decisivo dentro de **NovaMarket**: incorporar un proveedor de identidad real para que el sistema deje de depender de supuestos teóricos y empiece a funcionar con tokens emitidos por una plataforma de autenticación.

La herramienta elegida para el curso es **Keycloak**.

No la usamos porque sea la única opción posible, sino porque nos permite construir un flujo de seguridad realista sin obligarnos a programar desde cero un sistema completo de login, emisión de tokens, gestión de usuarios, roles y clientes OAuth2.

La idea es simple:

- Keycloak autentica usuarios,
- emite tokens,
- representa la identidad y los permisos,
- y el resto de la arquitectura confía en esos tokens para decidir qué permitir y qué bloquear.

En una arquitectura distribuida, este enfoque tiene muchísimo valor porque evita que cada microservicio tenga que reinventar su propia autenticación.

---

## Por qué no conviene construir autenticación propia para este curso

Cuando alguien empieza con microservicios, muchas veces intenta resolver todo dentro del mismo ecosistema de servicios del proyecto:

- un servicio de usuarios,
- un endpoint de login propio,
- generación manual de JWT,
- refresh tokens hechos a mano,
- control de expiración casero,
- y lógica de autorización repartida entre varias clases.

Eso puede servir para experimentar, pero en un curso cuyo eje principal es la **arquitectura de microservicios**, esa decisión suele desviar el foco.

Si construyéramos toda la autenticación manualmente, pasaríamos demasiado tiempo resolviendo problemas colaterales:

- almacenamiento seguro de credenciales,
- hash de contraseñas,
- invalidación de sesiones,
- refresh tokens,
- revocación,
- administración de clientes,
- claims,
- scopes,
- y compatibilidad con OAuth2/OIDC.

Nada de eso es irrelevante, pero no es el centro de este curso.

Por eso en NovaMarket vamos a delegar esa responsabilidad a Keycloak y vamos a concentrarnos en lo que sí queremos aprender dentro del sistema distribuido:

- cómo se autentica un usuario,
- cómo se emite un token,
- cómo lo recibe el gateway,
- cómo se propaga a otros servicios,
- y cómo cada microservicio protege sus endpoints.

---

## Qué es Keycloak

Keycloak es un **Identity Provider** y un **Authorization Server** que permite manejar:

- autenticación de usuarios,
- autorización basada en roles o claims,
- clientes OAuth2,
- emisión de access tokens,
- integración con OpenID Connect,
- administración de usuarios y credenciales,
- login centralizado.

Para nuestro curso lo vamos a usar como el componente que emite los tokens JWT que van a circular dentro de NovaMarket.

En otras palabras:

- el usuario se autentica contra Keycloak,
- Keycloak devuelve un token,
- el cliente usa ese token al llamar al gateway,
- el gateway lo valida,
- y más adelante los microservicios internos también lo validan.

---

## Dónde encaja Keycloak dentro de NovaMarket

Hasta ahora NovaMarket ya tiene varios componentes importantes:

- `config-server`
- `discovery-server`
- `api-gateway`
- `catalog-service`
- `inventory-service`
- `order-service`

A partir de esta clase, Keycloak pasa a formar parte de la arquitectura como infraestructura de identidad.

La foto conceptual del flujo de seguridad empieza a verse así:

1. el usuario solicita autenticación,
2. Keycloak valida credenciales,
3. Keycloak emite un access token,
4. el cliente llama a `api-gateway` enviando ese token,
5. el gateway valida el JWT,
6. el request autenticado puede continuar,
7. más adelante el token podrá propagarse a servicios internos.

Esto cambia por completo el sistema, porque a partir de acá ya no hablamos de “usuarios imaginarios” ni de rutas protegidas de forma puramente local: hablamos de una identidad distribuida y verificable.

---

## Conceptos de Keycloak que necesitamos dominar

No hace falta aprender toda la plataforma de una vez. Para el curso, los conceptos mínimos que necesitamos son estos.

### Realm

Un **realm** es un espacio aislado de administración de identidad.

Dentro de un realm viven:

- usuarios,
- clientes,
- roles,
- configuraciones de autenticación,
- y políticas relacionadas.

Para NovaMarket conviene crear un realm específico, por ejemplo:

- `novamarket`

Eso nos permite separar claramente la configuración del proyecto de cualquier otra cosa.

---

### User

Es la identidad de una persona o cuenta que puede autenticarse.

Para el curso podemos empezar con usuarios simples, por ejemplo:

- `gabriel.user`
- `admin.user`

No nos interesa todavía construir alta de usuarios desde nuestros microservicios. Lo importante es contar con identidades reales para poder probar el sistema.

---

### Client

Un **client** representa una aplicación que interactúa con Keycloak.

En OAuth2, un client puede ser:

- una app frontend,
- una SPA,
- una app backend,
- o un componente servidor que participa del flujo.

Dentro de NovaMarket nos interesa especialmente pensar qué cliente representa al sistema que habla con el gateway.

Por ejemplo, podemos definir un cliente como:

- `novamarket-gateway-client`

Más adelante veremos que el nombre exacto puede variar según la estrategia elegida, pero conceptualmente lo importante es entender que el cliente representa a la aplicación que solicita y usa el token.

---

### Roles

Los **roles** modelan permisos o grupos de permisos.

En NovaMarket podemos empezar con algo muy simple:

- `ROLE_USER`
- `ROLE_ADMIN`

Y después usar esos roles para expresar reglas como:

- un usuario común puede consultar productos y crear órdenes,
- un administrador puede consultar inventario o gestionar recursos internos.

---

### Token

El token es la pieza central del flujo.

Cuando el usuario se autentica correctamente, Keycloak emite un JWT con información útil para el sistema, por ejemplo:

- identidad del usuario,
- fecha de expiración,
- roles,
- audiencia,
- emisor,
- claims adicionales.

Nuestros servicios no necesitan confiar “a ciegas” en lo que diga el cliente. Necesitan confiar en un token emitido por una autoridad reconocida: Keycloak.

---

## Qué parte del sistema valida el token

Acá aparece una decisión de arquitectura que importa mucho.

En este punto del curso, el primer componente que va a validar el token será el **gateway**.

Eso tiene mucho sentido porque:

- es la puerta de entrada del sistema,
- centraliza gran parte del tráfico,
- permite bloquear requests antes de que lleguen a servicios internos,
- y ayuda a concentrar reglas comunes de seguridad.

Más adelante vamos a endurecer todavía más el sistema haciendo que también los microservicios validen JWT por su cuenta. Pero primero conviene consolidar la primera capa de defensa en el gateway.

---

## Flujo básico de autenticación en NovaMarket

Una forma sencilla de pensarlo es la siguiente.

### Paso 1: el usuario se autentica

El usuario interactúa con Keycloak y envía sus credenciales.

### Paso 2: Keycloak emite un access token

Si las credenciales son válidas, Keycloak devuelve un JWT.

### Paso 3: el cliente llama al gateway

El cliente envía una request como esta:

```http
GET /api/products
Authorization: Bearer eyJ...
```

### Paso 4: el gateway valida el token

El gateway verifica que:

- el token haya sido emitido por el emisor esperado,
- no esté expirado,
- tenga firma válida,
- y cumpla los criterios definidos por la aplicación.

### Paso 5: el request continúa

Si el token es válido, el request sigue su recorrido.

Si el token es inválido, el gateway rechaza la llamada.

---

## Qué endpoints conviene proteger primero

No todo tiene que quedar protegido desde el primer minuto.

Para que el curso mantenga una progresión didáctica saludable, conviene empezar con una separación simple.

### Públicos o menos sensibles

Podríamos dejar inicialmente accesibles:

- `GET /api/products`
- algunos endpoints técnicos de desarrollo

### Protegidos

Deberían protegerse rápidamente:

- `POST /api/orders`
- `GET /api/orders/**`
- endpoints internos de inventario
- operaciones administrativas

Esto nos permite introducir seguridad de forma incremental sin congelar el avance del proyecto.

---

## Qué información útil puede traer el JWT

Aunque en esta clase no vamos a exprimir cada claim, ya conviene saber qué clase de información puede transportar el token.

Por ejemplo:

- identificador del usuario,
- username,
- roles,
- scopes,
- emisor,
- audiencia,
- expiración,
- instante de emisión.

Esa información después se puede usar para:

- identificar al usuario que crea una orden,
- decidir si puede acceder a un endpoint,
- registrar auditoría,
- aplicar reglas de negocio dependientes de permisos.

Pero una advertencia importante:

**el token no debe convertirse en un contenedor gigante de datos de negocio**.

El token transporta identidad y autorización, no todo el estado funcional del sistema.

---

## Configuración conceptual del realm para el curso

Sin entrar todavía en comandos ni pantallas específicas, la configuración mínima razonable para NovaMarket podría ser esta.

### Realm

- `novamarket`

### Roles

- `ROLE_USER`
- `ROLE_ADMIN`

### Usuarios de prueba

- usuario estándar con rol `ROLE_USER`
- usuario administrador con rol `ROLE_ADMIN`

### Cliente principal

- cliente para representar la aplicación que consume el gateway

### Emisor de tokens

- Keycloak como issuer reconocido por el gateway

Con esta base ya podemos probar autenticación real sin perdernos en una configuración excesiva.

---

## Qué gana NovaMarket al integrar Keycloak

La integración con Keycloak no es solo una mejora de seguridad. También mejora la claridad de la arquitectura.

### 1. Separación de responsabilidades

Nuestros microservicios dejan de encargarse de autenticar usuarios directamente.

### 2. Consistencia de identidad

Todos los servicios pueden confiar en la misma fuente de identidad.

### 3. Menos lógica casera

No necesitamos inventar un mecanismo propio de emisión y validación de tokens.

### 4. Mejor proyección profesional

El sistema se parece más a una arquitectura real, donde la identidad suele centralizarse.

---

## Riesgos de integrar seguridad de forma superficial

También conviene evitar algunos errores muy comunes.

### Error 1: asumir que “si hay token, ya está todo resuelto”

No. Hay que definir:

- qué valida cada componente,
- qué rutas se protegen,
- qué roles se usan,
- y cómo se controla el acceso interno.

### Error 2: confiar solo en el gateway para todo

El gateway es importante, pero no debería ser la única defensa. Más adelante veremos por qué cada microservicio también puede necesitar validar el JWT.

### Error 3: propagar identidad sin entenderla

Reenviar un token automáticamente no siempre es suficiente. Hay que saber qué representa, quién lo emitió y qué permisos expresa.

### Error 4: mezclar autenticación con autorización de negocio

Autenticar a un usuario y saber quién es no equivale automáticamente a decidir si puede hacer una operación concreta dentro de una regla funcional específica.

---

## Cómo se conecta esta clase con la siguiente

A partir de acá ya tenemos la pieza central de identidad incorporada: Keycloak.

El paso siguiente es entender algo crucial en una arquitectura distribuida:

**qué hacemos con el token una vez que entra por el gateway**.

Porque una cosa es autenticar el request al entrar al sistema, y otra distinta es decidir cómo viaja esa identidad entre servicios.

Ese es el tema de la próxima clase: la **propagación de token hacia microservicios**.

---

## Cierre

Integrar Keycloak en NovaMarket nos permite pasar de una seguridad conceptual a una seguridad basada en un proveedor de identidad real.

A partir de esta decisión:

- el usuario ya no es una abstracción suelta,
- los tokens pasan a formar parte del flujo real,
- el gateway puede validar identidad de manera consistente,
- y el sistema empieza a adquirir una forma más profesional.

El objetivo de esta clase no fue aprender cada rincón de Keycloak, sino ubicarlo correctamente dentro de la arquitectura y entender por qué cumple un papel clave en el curso.

Desde ahora, cada paso de seguridad que agreguemos en NovaMarket va a girar alrededor de esta idea: **una identidad centralizada, tokens verificables y servicios capaces de actuar sobre esa identidad de forma controlada**.
