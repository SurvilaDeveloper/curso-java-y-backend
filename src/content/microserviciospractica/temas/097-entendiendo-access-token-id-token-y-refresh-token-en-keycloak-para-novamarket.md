---
title: "Entendiendo access token, ID token y refresh token en Keycloak para NovaMarket"
description: "Siguiente paso del módulo 10. Comprensión de los tipos principales de token en Keycloak y de cuál es el que más importa para empezar a proteger NovaMarket."
order: 97
module: "Módulo 10 · Seguridad real con Keycloak"
level: "intermedio"
draft: false
---

# Entendiendo access token, ID token y refresh token en Keycloak para NovaMarket

En la clase anterior cerramos una base mínima muy importante dentro del bloque de Keycloak:

- ya existe un `realm` para NovaMarket,
- ya existe un `client` principal,
- ya existen usuarios de ejemplo,
- y ya existen roles básicos como `customer` y `admin`.

Eso ya tiene muchísimo valor.

Pero ahora aparece una pregunta muy natural:

**si ya tenemos infraestructura de identidad, usuarios y roles, qué tipo de token emite realmente Keycloak y cuál de esos tokens es el que más nos importa para empezar a proteger NovaMarket?**

Ese es el terreno de esta clase.

Porque una cosa es tener usuarios y roles cargados en Keycloak.

Y otra bastante distinta es entender:

- qué credencial emite Keycloak cuando alguien se autentica,
- para qué sirve cada tipo de token,
- y cuál es el que realmente va a usar el gateway o los servicios para decidir acceso.

Ese es exactamente el siguiente problema que conviene abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro qué es un **access token**,
- claro qué es un **ID token**,
- claro qué es un **refresh token**,
- y mucho más visible cuál de ellos nos importa más para empezar a proteger NovaMarket.

La meta de hoy no es todavía conectar Spring Security con el gateway.  
La meta es mucho más concreta: **ordenar el modelo mental de los tokens que emite Keycloak para que la integración posterior tenga sentido real**.

---

## Estado de partida

Partimos de un sistema donde ya:

- Keycloak está funcionando dentro del entorno,
- existe un `realm` `novamarket`,
- existe un `client` principal,
- y ya hay usuarios y roles básicos listos para usarse.

Eso significa que el problema ya no es cómo modelar identidad.  
Ahora la pregunta útil es otra:

- **qué devuelve Keycloak cuando una identidad se autentica y cómo se interpreta eso dentro del sistema**

Y eso es exactamente lo que vamos a resolver en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué tipos de token suelen aparecer en Keycloak,
- entender para qué sirve cada uno,
- conectar esos conceptos con el flujo real de NovaMarket,
- y dejar claro cuál es el token que más nos importa para el siguiente paso.

---

## Qué problema queremos resolver exactamente

Cuando alguien empieza a trabajar con OpenID Connect y Keycloak, es muy común ver varios tokens y sentir que todos son “más o menos lo mismo”.

Eso suele generar un error bastante molesto:

- avanzar con integración sin entender bien qué token debería mirar cada parte del sistema.

En lugar de eso, queremos algo más sano:

- entender qué representa cada token,
- qué papel cumple,
- y cuál nos va a servir realmente para proteger rutas o validar identidad en el borde del sistema.

Ese orden es el corazón de esta clase.

---

## Qué es un access token

Para esta etapa del curso, una forma útil de pensarlo es esta:

**el access token es la credencial principal que una aplicación presenta para acceder a recursos protegidos.**

Esa idea es central.

Cuando un cliente obtiene un access token desde Keycloak, ese token suele incluir cosas como:

- quién es el usuario,
- qué `realm` o contexto lo emitió,
- qué roles o claims relevantes tiene,
- y datos temporales como emisión y expiración.

Ese token es el que más naturalmente se conecta con algo como:

- `api-gateway`
- o una API protegida

porque es el que se usa para decir:

- “esta identidad ya se autenticó y presenta esta credencial para intentar acceder”.

---

## Qué es un ID token

Este punto importa muchísimo porque mucha gente lo confunde con el access token.

El **ID token** está mucho más orientado a describir la identidad autenticada frente al cliente que inició el login.

Dicho de forma más simple:

- el ID token le dice a la aplicación cliente cosas sobre el usuario autenticado,
- pero no es necesariamente el token principal que una API protegida espera como credencial de acceso.

Eso no significa que no sea valioso.  
Significa algo más preciso:

- su función principal no es exactamente la misma que la del access token.

---

## Qué es un refresh token

El **refresh token** sirve para pedir nuevos tokens sin obligar al usuario a autenticarse desde cero cada vez que vence el access token.

Esa idea es muy importante.

Porque en sistemas reales, el access token suele tener una vida limitada.  
Y si todo dependiera de volver a loguearse cada vez, la experiencia sería bastante torpe.

Entonces el refresh token actúa más como:

- una credencial para renovar la sesión de autenticación,
- no como el token que normalmente mandamos a una API protegida en cada request.

Ese matiz es muy valioso.

---

## Cómo se traduce esto a NovaMarket

A esta altura del bloque, conviene fijar algo muy importante:

### Access token
Es el que más nos va a importar para proteger rutas en `api-gateway` o en servicios.

### ID token
Nos puede servir para información de identidad del usuario autenticado en el cliente que hizo login.

### Refresh token
Nos sirve para renovar la autenticación sin pedir credenciales otra vez inmediatamente.

Si tuviéramos que elegir cuál es el más importante para el siguiente paso del curso, la respuesta es muy clara:

- **el access token**

Ese es el corazón práctico de esta clase.

---

## Por qué el access token es el que más nos importa ahora

Este punto importa muchísimo.

El siguiente gran paso del bloque va a ser algo como:

- pedir un token real,
- enviarlo contra el borde del sistema,
- y empezar a validar acceso usando una credencial emitida por Keycloak.

Ahí el token protagonista no va a ser el refresh token ni el ID token.

El que más naturalmente entra en juego es:

- **el access token**

Porque es el que el sistema presenta para intentar consumir recursos protegidos.

Ese matiz deja muchísimo más claro lo que viene después.

---

## Qué suelen contener estos tokens

No hace falta hoy hacer una anatomía completa de todos los claims posibles.

Pero sí conviene saber que en especial el access token suele incluir información como:

- sujeto o usuario autenticado,
- audiencia o cliente relacionado,
- roles,
- tiempos de emisión y expiración,
- y otros claims relevantes para autorización.

Ese punto nos importa mucho porque más adelante vamos a mirar justamente ese contenido para decidir acceso.

---

## Por qué esta clase importa tanto aunque todavía no pidamos un token

A primera vista, esta clase puede parecer conceptual.

Pero en realidad vale muchísimo porque evita uno de los peores problemas del bloque:

- integrar tokens “a ciegas”, sin saber realmente qué estamos usando.

Ese valor de claridad conceptual importa muchísimo más que avanzar rápido pero de forma confusa.

---

## Qué estamos logrando con esta clase

Esta clase ordena el modelo mental de access token, ID token y refresh token para NovaMarket.

Ya no estamos solo modelando usuarios y roles dentro de Keycloak.  
Ahora también estamos entendiendo qué tipo de credenciales va a emitir esa infraestructura y cuál de ellas nos importa de verdad para empezar a proteger el sistema.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- pedimos todavía un token real,
- ni inspeccionamos todavía claims concretos,
- ni integramos aún el gateway con validación JWT.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender qué token nos importa más y por qué dentro del flujo de seguridad de NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que access token, ID token y refresh token son intercambiables
No. Cumplen funciones distintas.

### 2. Usar el ID token como si fuera automáticamente la credencial principal para una API
En este bloque, lo que más nos va a importar es el access token.

### 3. Ver el refresh token como si fuera el token normal de acceso
Su papel es otro: renovar autenticación.

### 4. No conectar esta teoría con el siguiente paso del curso
El valor real está en preparar la emisión y lectura de tokens reales.

### 5. Reducir la clase a terminología
En realidad ordena todo el bloque de integración posterior.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder explicar con bastante claridad qué es un access token, qué es un ID token, qué es un refresh token y cuál de ellos es el protagonista principal para empezar a proteger NovaMarket.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué representa cada token,
- ves por qué el access token es el más importante para el siguiente paso,
- entendés que los otros tokens no son “inútiles”, sino distintos,
- y sentís que ya existe una base conceptual suficientemente clara para pasar a pedir y leer tokens reales.

Si eso está bien, ya podemos pasar al siguiente tema y obtener el primer token real del sistema.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a pedir el primer access token real desde Keycloak usando un usuario de NovaMarket y a inspeccionar su contenido para preparar la integración posterior con el gateway.

---

## Cierre

En esta clase entendimos qué son access token, ID token y refresh token en Keycloak para NovaMarket.

Con eso, la identidad del sistema deja de estar modelada solo en términos de usuarios y roles y empieza a conectarse con credenciales reales, emitidas por Keycloak, que después van a sostener la autenticación y autorización del sistema de una forma mucho más seria.
