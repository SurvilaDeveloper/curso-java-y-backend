---
title: "Inspeccionando el primer access token de NovaMarket y leyendo sus claims principales"
description: "Siguiente paso práctico del módulo 10. Inspección del contenido del primer access token real emitido por Keycloak para entender claims, identidad y roles dentro de NovaMarket."
order: 99
module: "Módulo 10 · Seguridad real con Keycloak"
level: "intermedio"
draft: false
---

# Inspeccionando el primer access token de NovaMarket y leyendo sus claims principales

En la clase anterior dimos un paso muy importante dentro del bloque de Keycloak:

- obtuvimos el primer access token real de NovaMarket,
- vimos la respuesta general emitida por Keycloak,
- y ya dejamos de trabajar solo con usuarios y roles “cargados” para pasar a una credencial concreta emitida por la infraestructura de identidad.

Eso ya tiene muchísimo valor.

Pero ahora toca el siguiente paso natural:

**inspeccionar el contenido de ese access token y leer sus claims principales.**

Ese es el objetivo de esta clase.

Porque una cosa es tener el token.

Y otra bastante distinta es entender:

- qué dice ese token,
- cómo representa la identidad del usuario,
- dónde aparecen roles o datos útiles,
- y por qué esa información es la que después nos va a permitir tomar decisiones reales de acceso.

Ese es exactamente el siguiente problema que conviene resolver ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más claro qué contiene un access token real,
- identificados algunos claims principales emitidos por Keycloak,
- visible la relación entre usuario, roles y contenido del token,
- y lista una base muy fuerte para la integración posterior con `api-gateway`.

La meta de hoy no es todavía validar el JWT dentro de Spring Security.  
La meta es mucho más concreta: **dejar de ver el token como una cadena opaca y empezar a leerlo como un objeto con significado real para NovaMarket**.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe un access token real para un usuario de NovaMarket,
- Keycloak está funcionando como infraestructura de identidad,
- y el módulo ya dejó claro que este token es la credencial principal para el siguiente tramo del bloque.

Eso significa que el problema ya no es cómo obtener el token.  
Ahora la pregunta útil es otra:

- **qué información contiene exactamente y cómo se relaciona con el sistema**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- tomar el access token obtenido,
- decodificarlo o inspeccionarlo,
- leer algunos claims principales,
- conectar esos claims con usuarios y roles del `realm`,
- y dejar más preparado el terreno para usar el token contra el borde del sistema.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- el sistema puede emitir un access token real.

Eso fue un gran salto.

Pero si queremos integrar seguridad de verdad, necesitamos algo más:

**que ese token deje de ser una cadena misteriosa y pase a ser una fuente legible de identidad y autorización.**

Porque ahora conviene hacerse preguntas como:

- ¿cómo sé qué usuario representa este token?
- ¿cómo sé si trae roles?
- ¿dónde aparecen datos como vencimiento, issuer o subject?
- ¿qué parte del token va a usar el sistema para decidir acceso?

Ese cambio de enfoque es justamente el corazón de esta clase.

---

## Paso 1 · Recordar que un JWT no es solo un string opaco

A esta altura del curso, conviene fijar algo muy importante:

aunque el access token nos llegue como una cadena larga, no es solo un bloque sin estructura.

Un JWT suele tener partes claramente distinguibles y contiene payload con claims legibles una vez decodificado.

No hace falta hoy hacer criptografía profunda ni validación completa manual.  
La meta es más concreta:

- **leerlo con criterio**

Ese detalle ya cambia muchísimo la forma de trabajar el bloque.

---

## Paso 2 · Decodificar o inspeccionar el token

Podés hacerlo con:

- una herramienta local,
- una librería,
- un script simple,
- o incluso una utilidad de inspección de JWT.

Lo importante no es la herramienta puntual.

Lo importante es llegar a una vista donde puedas leer el payload y ubicar claims concretos.

Ese momento vale muchísimo porque convierte el token en algo interpretable.

---

## Paso 3 · Identificar claims básicos de identidad

Una vez inspeccionado, conviene buscar cosas como:

- `sub`
- `preferred_username`
- `email` si corresponde
- `iss`

Estos claims ya te dicen bastante.

Por ejemplo:

### `sub`
Suele representar el identificador principal de la identidad dentro del sistema de autenticación.

### `preferred_username`
Suele mostrar de una forma más amigable qué usuario es.

### `iss`
Indica quién emitió el token.

Ese primer bloque ya conecta muy bien el token con la identidad real del usuario.

---

## Paso 4 · Identificar claims de tiempo y validez

También conviene mirar cosas como:

- `iat`
- `exp`
- eventualmente `nbf` si aparece

Eso importa muchísimo porque el token no es una credencial eterna.  
Tiene una ventana temporal de validez.

Este punto nos prepara bastante bien para entender más adelante por qué el sistema no puede aceptar cualquier token en cualquier momento.

---

## Paso 5 · Buscar roles o claims ligados a autorización

Este es uno de los puntos más importantes de toda la clase.

Conviene mirar si aparecen claims relacionados con:

- roles del `realm`
- roles asociados al `client`
- u otra estructura equivalente según la configuración que hayas hecho

En muchos escenarios de Keycloak, esto aparece en estructuras como:

- `realm_access`
- `resource_access`

No hace falta hoy cerrar todos los matices posibles.

Lo importante es ver algo muy fuerte:

- **los roles ya no solo existen en la consola de Keycloak**
- también pueden viajar dentro del token

Ese cambio vale muchísimo.

---

## Paso 6 · Conectar roles del token con NovaMarket

Supongamos que el usuario `cliente.demo` trae algo coherente con un rol como:

- `customer`

y que un usuario administrador traiga algo como:

- `admin`

Ese punto es importantísimo porque ahí se ve clarísimo el puente entre:

- lo que modelaste en Keycloak
- y
- lo que después el sistema puede usar para decidir acceso

Ese puente es uno de los grandes corazones del bloque de seguridad real.

---

## Paso 7 · Entender qué claims nos van a importar más adelante

A esta altura del curso, algunos de los claims que más naturalmente nos van a importar después son:

- quién emitió el token,
- quién es el usuario,
- cuándo vence,
- y qué roles trae.

No hace falta todavía usar todos ni escribir reglas complejísimas.

La meta es algo mucho más concreta:

- saber mirar el token con ojos de integración real.

Eso ya aporta muchísimo valor.

---

## Paso 8 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, el access token ya existía.

Ahora, en cambio, además ya podemos leerlo con criterio y decir cosas como:

- este token representa a este usuario,
- fue emitido por esta infraestructura,
- vence en tal momento,
- y trae tal información útil sobre roles o acceso.

Ese salto cambia muchísimo la madurez del bloque, porque el token ya deja de ser una simple cadena transportable y empieza a verse como una credencial inteligible.

---

## Paso 9 · Entender por qué esta clase prepara tanto la integración con el gateway

A primera vista, puede parecer que todavía falta lo importante.

Pero en realidad esta clase ya hace algo enorme:

- deja claro qué información real vive en el token,
- y por lo tanto qué cosas podrá mirar más adelante el gateway o el sistema cuando empiece a proteger rutas.

Ese valor puente es uno de los más fuertes de toda la clase.

---

## Qué estamos logrando con esta clase

Esta clase inspecciona el primer access token de NovaMarket y lee sus claims principales.

Ya no estamos solo obteniendo credenciales reales.  
Ahora también estamos entendiendo qué información traen, cómo representan identidad y roles, y por qué ese contenido es el que después va a sostener la autenticación y autorización reales del sistema.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- validamos todavía el JWT desde `api-gateway`,
- ni protegimos todavía rutas reales con Spring Security,
- ni usamos aún estos claims para decidir acceso dentro del sistema.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dejar de ver el token como una cadena opaca y empezar a leerlo como una credencial con significado real para NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Tratar el JWT como un string incomprensible
La clase justamente busca romper esa opacidad.

### 2. Mirar claims sin conectarlos con usuarios y roles reales del sistema
El valor está en la traducción al proyecto.

### 3. Pensar que inspeccionar un token ya equivale a validarlo correctamente
Todavía no estamos en integración real con Spring Security.

### 4. Obsesionarse con cada claim posible demasiado pronto
En esta etapa conviene enfocarse en identidad, emisor, tiempos y roles.

### 5. No ver el valor de esta lectura antes de integrar el gateway
Este análisis es lo que hace que la integración posterior tenga sentido real.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder leer con bastante más criterio el access token de NovaMarket y reconocer qué claims principales lo conectan con la identidad, los roles y la autorización del sistema.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- pudiste inspeccionar el token,
- ubicaste claims principales,
- entendés qué relación tienen con el usuario y los roles del sistema,
- y sentís que el access token ya dejó de ser una caja negra para convertirse en una credencial legible y útil.

Si eso está bien, ya podemos pasar al siguiente tema y empezar a integrar de verdad el gateway con validación JWT.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de trabajo real con tokens antes de empezar la integración de `api-gateway` con Keycloak y JWT.

---

## Cierre

En esta clase inspeccionamos el primer access token de NovaMarket y leímos sus claims principales.

Con eso, el proyecto deja de trabajar con credenciales reales como si fueran cadenas opacas y empieza a entenderlas como objetos de identidad y autorización que después van a sostener de forma concreta la seguridad del sistema.
