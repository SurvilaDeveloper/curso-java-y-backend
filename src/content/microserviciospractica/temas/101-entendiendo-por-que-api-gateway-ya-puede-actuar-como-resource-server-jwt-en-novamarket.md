---
title: "Entendiendo por qué api-gateway ya puede actuar como resource server JWT en NovaMarket"
description: "Inicio del siguiente subtramo del módulo 10. Comprensión de por qué, después de modelar identidad y trabajar con tokens reales, ya conviene integrar api-gateway como resource server JWT."
order: 101
module: "Módulo 10 · Seguridad real con Keycloak"
level: "intermedio"
draft: false
---

# Entendiendo por qué `api-gateway` ya puede actuar como resource server JWT en NovaMarket

En la clase anterior cerramos algo muy importante dentro del bloque de Keycloak:

- ya existe infraestructura real de identidad,
- ya existen usuarios y roles,
- ya existe un access token real de NovaMarket,
- y además ya sabemos leer sus claims principales.

Eso ya tiene muchísimo valor.

Pero ahora aparece otra pregunta muy natural:

**si ya tenemos tokens reales, cuál es la primera pieza del sistema que más naturalmente debería empezar a validarlos para proteger el acceso?**

Ese es el terreno de esta clase.

Porque una cosa es tener un token emitido por Keycloak.

Y otra bastante distinta es tener una pieza del sistema que diga:

- “este token lo valido”,
- “esta identidad la reconozco”,
- y “según este JWT, dejo pasar o no dejo pasar hacia las rutas del sistema”.

Ese es exactamente el siguiente problema que conviene abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué `api-gateway` es el mejor primer candidato para validar JWT,
- entendida la idea de **resource server** dentro de NovaMarket,
- visible la diferencia entre emitir tokens y proteger recursos con esos tokens,
- y preparado el terreno para aplicar la integración real en la próxima clase.

Todavía no vamos a cerrar toda la seguridad de todos los servicios.  
La meta de hoy es entender por qué el siguiente paso lógico es convertir al gateway en un **resource server JWT**.

---

## Estado de partida

Partimos de un sistema donde ya:

- Keycloak corre dentro del entorno,
- el `realm` y el `client` están modelados,
- existen usuarios y roles,
- y el access token ya dejó de ser una teoría para convertirse en una credencial real y legible.

Eso significa que el problema ya no es cómo obtener un JWT.  
Ahora la pregunta útil es otra:

- **qué pieza del sistema tiene más sentido para empezar a validarlo**

Y eso es exactamente lo que vamos a resolver en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué significa que una aplicación actúe como resource server,
- entender por qué el gateway es el primer lugar natural para esta integración,
- conectar esta idea con todo lo que ya construimos antes,
- y dejar clara la lógica del siguiente paso práctico del bloque.

---

## Qué significa “resource server” en este contexto

Para esta etapa del curso, una forma útil de pensarlo es esta:

**un resource server es una aplicación que protege recursos y valida el bearer token que recibe para decidir si deja pasar o no una request.**

Esa idea es central.

No emite tokens.  
No administra usuarios.  
No reemplaza a Keycloak.

Hace otra cosa:

- confía en la infraestructura de identidad,
- valida los JWT emitidos por ella,
- y a partir de eso protege recursos propios o rutas que representa.

Ese matiz importa muchísimo.

---

## Por qué `api-gateway` es el primer candidato natural

A esta altura del proyecto, el primer lugar más lógico para esta integración es:

- `api-gateway`

¿Por qué?

Porque:

- es el borde del sistema,
- concentra entrada,
- ya enruta tráfico,
- ya tiene lógica de seguridad simple previa,
- y es el lugar más natural para transformar el sistema de “rutas abiertas con ejemplos” a “rutas protegidas con credenciales reales”.

Eso vuelve al gateway el gran protagonista del siguiente tramo.

---

## Qué cambia cuando el gateway valida JWT

Este punto importa muchísimo.

Hasta ahora, el gateway ya tenía valor como:

- enrutador,
- punto de entrada,
- filtro,
- capa visible del borde,
- y lugar para una primera seguridad simple.

Pero si ahora empieza a validar JWT, gana una capacidad muchísimo más fuerte:

- deja de proteger rutas solo con reglas locales o barreras didácticas,
- y empieza a apoyarse en una identidad real emitida por una infraestructura centralizada.

Ese salto cambia muchísimo la madurez del sistema.

---

## Qué hace Spring Security como resource server JWT

A esta altura del bloque, conviene fijar algo importante:

cuando una aplicación Spring actúa como resource server JWT, su trabajo principal es algo como:

- leer el header `Authorization: Bearer ...`
- validar la firma del JWT con claves públicas del emisor,
- validar tiempos como expiración,
- validar issuer,
- y construir una autenticación a partir del token.

Eso es justamente lo que vuelve tan natural este paso dentro del gateway.

---

## Por qué este paso encaja tan bien con el bloque anterior

Esto también importa mucho.

Si todavía no hubiéramos:

- modelado usuarios y roles,
- emitido un access token real,
- e inspeccionado claims,

integrar el gateway con JWT sería mucho más opaco.

Pero ahora el terreno ya está bastante preparado.

Eso significa que este paso aparece en un momento didácticamente muy sano:

- primero entendimos identidad,
- después entendimos credenciales,
- ahora toca usar esas credenciales en el borde del sistema.

Ese orden es excelente.

---

## Qué rutas nos conviene imaginar primero

A esta altura del curso, una primera estrategia muy razonable suele ser algo como:

- dejar algunas rutas públicas,
- exigir autenticación en otras,
- y más adelante distinguir incluso roles como `customer` y `admin`

No hace falta hoy cerrar toda la matriz de acceso.

La meta es algo más concreta:

- entender que el gateway ya puede empezar a pasar de “abierto vs cerrado de ejemplo” a “acceso real mediado por JWT”.

Ese cambio es el corazón del subbloque.

---

## Qué gana NovaMarket con esta integración

Aunque todavía no la apliquemos en esta clase, el valor ya se puede ver con claridad.

A partir de un gateway como resource server JWT, NovaMarket puede empezar a ganar cosas como:

- validación real de tokens en el borde,
- rechazo automático de credenciales inválidas o vencidas,
- y una base mucho más seria para autorización basada en claims o roles.

Eso vuelve al proyecto bastante más profesional desde el punto de vista de seguridad.

---

## Qué todavía no estamos haciendo en esta etapa

Conviene dejar esto muy claro.

En este punto todavía no estamos:

- agregando todavía dependencias concretas al gateway,
- ni configurando aún `issuer-uri`,
- ni creando todavía la `SecurityWebFilterChain`,
- ni protegiendo aún rutas reales con reglas específicas.

La meta actual es mucho más concreta:

**abrir correctamente el bloque de `api-gateway` como resource server JWT.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no modifica todavía el gateway, pero hace algo muy importante:

**abre explícitamente el siguiente frente lógico del módulo 10: convertir al borde del sistema en un consumidor real de identidad emitida por Keycloak.**

Eso importa muchísimo, porque NovaMarket deja de madurar solo desde el modelado de identidad y el trabajo con tokens y empieza a prepararse para otra mejora clave: que el acceso al sistema ya se decida usando JWT reales en el punto de entrada.

---

## Qué todavía no hicimos

Todavía no:

- configuramos todavía el gateway como resource server,
- ni validamos aún JWT reales en requests al borde del sistema.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué `api-gateway` ya puede actuar como resource server JWT en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que emitir un token ya resuelve la seguridad del sistema
Falta que alguien lo valide y lo use.

### 2. No ver por qué el gateway es el primer lugar natural para esta integración
En NovaMarket, el borde del sistema tiene muchísimo sentido como primera capa de validación.

### 3. Confundir Keycloak con resource server
Keycloak emite identidad; el gateway protege recursos confiando en esa identidad.

### 4. Querer proteger todos los servicios al mismo tiempo
En esta etapa, empezar por el gateway es muchísimo más claro.

### 5. No conectar el JWT con las decisiones reales de acceso
Ese es justamente el corazón del paso que viene.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué `api-gateway` es el primer gran candidato para validar JWT reales y por qué este paso aparece ahora como siguiente evolución natural del bloque de Keycloak en NovaMarket.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué significa resource server,
- ves por qué el gateway es el lugar natural para empezar,
- entendés qué valor tiene validar JWT en el borde del sistema,
- y sentís que el proyecto ya está listo para el primer paso práctico de esta integración.

Si eso está bien, ya podemos pasar a configurar de verdad el gateway para trabajar con JWT.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a agregar soporte de resource server JWT a `api-gateway`, configurando dependencias, `issuer-uri` y una primera `SecurityWebFilterChain` para empezar a proteger rutas reales de NovaMarket.

---

## Cierre

En esta clase entendimos por qué `api-gateway` ya puede actuar como resource server JWT en NovaMarket.

Con eso, el proyecto deja de limitar la seguridad real a la infraestructura de identidad y empieza a preparar al borde del sistema para que valide credenciales reales, emitidas por Keycloak, como parte concreta de la protección de rutas y del acceso al sistema.
