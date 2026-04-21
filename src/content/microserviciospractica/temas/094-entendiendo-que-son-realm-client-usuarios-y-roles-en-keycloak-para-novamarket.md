---
title: "Entendiendo qué son realm, client, usuarios y roles en Keycloak para NovaMarket"
description: "Siguiente paso del módulo 10. Comprensión del modelo básico de Keycloak y de cómo se traduce a la arquitectura y necesidades reales de NovaMarket."
order: 94
module: "Módulo 10 · Seguridad real con Keycloak"
level: "intermedio"
draft: false
---

# Entendiendo qué son `realm`, `client`, usuarios y roles en Keycloak para NovaMarket

En la clase anterior cerramos una etapa muy importante del bloque de Keycloak:

- Keycloak ya forma parte del entorno Compose,
- la identidad ya dejó de ser una idea abstracta,
- y NovaMarket ya tiene una pieza real de infraestructura sobre la que vamos a construir el resto del bloque de seguridad.

Eso ya tiene muchísimo valor.

Pero ahora aparece una pregunta muy natural:

**si Keycloak ya está levantado, cómo se organiza internamente y qué piezas conceptuales necesitamos entender antes de integrarlo de verdad con NovaMarket?**

Ese es el terreno de esta clase.

Porque una cosa es tener Keycloak corriendo.

Y otra bastante distinta es entender cómo se modela ahí algo tan importante como:

- el espacio de identidad del sistema,
- las aplicaciones que van a confiar en Keycloak,
- los usuarios reales,
- y los permisos o roles con los que después vamos a proteger rutas y comportamientos.

Ese es exactamente el siguiente problema que conviene abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro qué es un `realm`,
- claro qué es un `client`,
- claro qué lugar ocupan usuarios y roles,
- y mucho más visible cómo se traduce todo eso a NovaMarket.

La meta de hoy no es todavía generar tokens ni proteger endpoints con Spring Security.  
La meta es mucho más concreta: **ordenar el modelo mental de Keycloak para que el resto del bloque no se convierta en una sucesión de clicks o configuraciones sin sentido**.

---

## Estado de partida

Partimos de un sistema donde ya:

- Keycloak está levantado dentro del entorno,
- el stack ya puede correr junto con infraestructura, negocio y gateway,
- y el módulo ya dejó claro que la identidad real va a sostenerse con una pieza externa al negocio.

Eso significa que el problema ya no es si Keycloak existe.  
Ahora la pregunta útil es otra:

- **cómo pensamos su modelo de datos y su organización mínima para NovaMarket**

Y eso es exactamente lo que vamos a resolver en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué representa un `realm`,
- revisar qué representa un `client`,
- entender qué son usuarios y roles,
- y conectar cada concepto con una decisión real del proyecto.

---

## Qué problema queremos resolver exactamente

Cuando alguien abre Keycloak por primera vez, es muy común que vea muchos términos nuevos y que todo parezca una mezcla de panel, seguridad y configuración.

Eso puede generar un error muy común:

- empezar a crear cosas sin entender qué representa cada una.

En lugar de eso, queremos algo más sano:

- entender primero el mapa,
- después crear una estructura mínima coherente,
- y recién después empezar a integrar esa identidad con el sistema.

Ese orden es el corazón de esta clase.

---

## Qué es un `realm`

Para esta etapa del curso, una forma útil de pensarlo es esta:

**un `realm` es el espacio principal donde viven usuarios, roles, clientes y reglas de autenticación de una aplicación o conjunto de aplicaciones relacionadas.**

Esa idea es central.

Un `realm` no es solo una carpeta o una etiqueta.  
Es, conceptualmente, el “universo de identidad” que Keycloak va a administrar para un sistema.

Eso significa que dentro de un mismo `realm` suelen vivir:

- los usuarios del sistema,
- los roles,
- los clientes que confían en Keycloak,
- y buena parte de la configuración de autenticación.

---

## Cómo se traduce un `realm` a NovaMarket

En este punto del curso, una decisión muy razonable suele ser tener un `realm` específico para NovaMarket.

Por ejemplo:

```txt
novamarket
```

¿Por qué tiene sentido?

Porque:

- estamos construyendo una plataforma concreta,
- queremos agrupar bajo una misma identidad las piezas del sistema,
- y no necesitamos todavía mezclar todo con otros productos imaginarios o con un esquema multi-tenant más complejo.

Eso vuelve al `realm` una unidad muy clara y muy didáctica para el proyecto.

---

## Qué es un `client`

Este punto importa muchísimo.

Dentro de Keycloak, un `client` representa una aplicación o componente que interactúa con Keycloak para autenticarse, obtener tokens o validar identidad.

Dicho de otra forma:

- si el `realm` es el universo de identidad,
- el `client` es una de las aplicaciones que vive o confía en ese universo.

Eso significa que un `client` puede representar cosas como:

- una aplicación frontend,
- un gateway,
- una API,
- o cualquier componente que necesite autenticación o tokens.

---

## Cómo se traduce un `client` a NovaMarket

A esta altura del curso, una de las primeras decisiones más razonables suele ser crear al menos un `client` para algo como:

- `api-gateway`

¿Por qué?

Porque el gateway es el borde del sistema y es un candidato natural para convertirse en una de las primeras piezas que confíen en Keycloak para validar tokens o exigir autenticación.

Más adelante podrían aparecer otros `clients`, por ejemplo para:

- un frontend de cliente,
- una consola admin,
- o integraciones más específicas.

Pero ahora lo más sano es empezar por una pieza clara y central.

---

## Qué es un usuario

Este punto parece obvio, pero conviene fijarlo bien.

Un usuario en Keycloak es una identidad concreta dentro del `realm`.

Puede tener cosas como:

- username,
- email,
- contraseña,
- atributos,
- roles,
- y más adelante otros datos o asociaciones.

Lo importante es entender que el usuario ya no vive “disperso” en cada parte del sistema.  
Empieza a vivir en una pieza especializada de identidad.

Ese cambio es uno de los más importantes de todo el bloque.

---

## Cómo se traduce el usuario a NovaMarket

En NovaMarket, los usuarios van a representar personas o identidades reales que interactúan con el sistema.

Por ejemplo:

- un usuario comprador,
- un usuario administrador,
- o más adelante otros perfiles según lo que queramos habilitar en el proyecto.

No hace falta hoy resolver todos los tipos posibles.

Lo importante ahora es fijar algo más valioso:

- **la identidad del usuario ya no se define localmente en cada servicio, sino centralmente en Keycloak.**

---

## Qué es un rol

Este punto importa muchísimo porque nos acerca ya a autorización real.

Un rol es una forma de expresar qué tipo de permisos, capacidades o perfil de acceso tiene una identidad dentro del sistema.

No siempre un rol equivale automáticamente a todos los permisos concretos.  
Pero sí es una forma muy fuerte de modelar categorías de acceso, por ejemplo:

- `customer`
- `admin`

Eso después nos va a permitir decir cosas como:

- esta ruta es pública,
- esta otra requiere usuario autenticado,
- y esta otra solo puede verla alguien con rol administrador.

---

## Cómo se traducen los roles a NovaMarket

A esta altura del bloque, una estructura inicial razonable puede ser muy simple:

- `customer`
- `admin`

Con eso ya podríamos modelar bastante bien los primeros escenarios del proyecto.

No hace falta hoy diseñar una taxonomía gigante de permisos.  
Lo importante es que el bloque ya empiece a pensar desde autorización real y no solo desde “usuario sí o no”.

---

## Qué relación hay entre estos conceptos

Conviene leer el mapa completo así:

- el `realm` agrupa todo el universo de identidad del sistema,
- dentro del `realm` viven usuarios, roles y clientes,
- los `clients` son aplicaciones o componentes que confían en Keycloak,
- los usuarios son identidades concretas,
- y los roles ayudan a expresar qué tipo de acceso tiene cada usuario.

Ese mapa es exactamente lo que necesitamos antes de hacer la parte práctica.

---

## Qué decisión conviene tomar para NovaMarket en esta etapa

Si tuviéramos que resumir el modelo inicial más razonable para el proyecto, podría verse así:

### Realm
- `novamarket`

### Primer client importante
- `api-gateway`

### Primeros roles
- `customer`
- `admin`

### Primeros usuarios de ejemplo
- uno comprador
- uno administrador

Eso deja una base súper clara para empezar.

---

## Por qué esta clase importa tanto aunque todavía no configuremos nada

A primera vista, esta clase puede parecer “solo conceptual”.

Pero en realidad vale muchísimo porque evita uno de los peores problemas de este bloque:

- hacer integración de Keycloak sin entender realmente qué estamos modelando.

Ese valor de claridad conceptual importa mucho más que crear cosas rápido pero de forma confusa.

---

## Qué estamos logrando con esta clase

Esta clase ordena el modelo mental de Keycloak para NovaMarket.

Ya no estamos solo diciendo que ahora existe una pieza de identidad en el entorno.  
Ahora también estamos entendiendo cómo se organiza esa pieza y cómo empieza a mapearse con la realidad del sistema.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- creamos todavía el `realm`,
- ni el `client`,
- ni los usuarios,
- ni los roles.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender el modelo mínimo de Keycloak que vamos a usar en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que `realm`, `client` y usuario son casi lo mismo
No. Cada uno vive en un nivel distinto del modelo.

### 2. Crear cosas en Keycloak sin una traducción clara al sistema real
Eso vuelve confuso todo el bloque.

### 3. Empezar por demasiados roles o estructuras complicadas
En esta etapa, una base chica y clara vale muchísimo más.

### 4. No relacionar el `client` con una pieza concreta del sistema
El modelo gana mucho valor cuando se conecta con `api-gateway` o una app real.

### 5. Reducir la clase a teoría
En realidad esta base conceptual es la que hace posible que el resto del bloque tenga sentido.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder explicar con bastante claridad qué son `realm`, `client`, usuarios y roles y cómo vamos a usar esas piezas dentro de NovaMarket.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué representa el `realm`,
- entendés qué representa un `client`,
- ves cómo usuarios y roles se traducen al sistema,
- y sentís que ya existe una base conceptual suficientemente clara para pasar a la parte práctica.

Si eso está bien, ya podemos entrar a crear la primera estructura real dentro de Keycloak.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a crear el primer `realm` de NovaMarket y el primer `client` principal para empezar a dar forma real a esta nueva infraestructura de identidad.

---

## Cierre

En esta clase entendimos qué son `realm`, `client`, usuarios y roles en Keycloak para NovaMarket.

Con eso, la identidad del sistema deja de ser solo una pieza levantada en Compose y empieza a tener un modelo claro, legible y directamente conectado con la arquitectura y las necesidades reales del proyecto.
