---
title: "Creando el primer realm y el primer client principal de NovaMarket en Keycloak"
description: "Siguiente paso práctico del módulo 10. Creación del primer realm de NovaMarket y del primer client principal para empezar a modelar identidad real dentro de Keycloak."
order: 95
module: "Módulo 10 · Seguridad real con Keycloak"
level: "intermedio"
draft: false
---

# Creando el primer `realm` y el primer `client` principal de NovaMarket en Keycloak

En la clase anterior ordenamos algo muy importante:

- qué es un `realm`,
- qué es un `client`,
- qué lugar ocupan usuarios y roles,
- y cómo todo eso se traduce al sistema real que estamos construyendo.

Ahora toca el paso concreto:

**crear el primer `realm` de NovaMarket y el primer `client` principal dentro de Keycloak.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- creado un `realm` específico para NovaMarket,
- creado un primer `client` principal dentro de ese `realm`,
- mucho más clara la relación entre el modelo conceptual de Keycloak y la arquitectura real del proyecto,
- y lista la base para pasar después a usuarios, roles y tokens.

La meta de hoy no es todavía integrar Spring Security con JWT.  
La meta es mucho más concreta: **hacer que la infraestructura de identidad deje de estar vacía y empiece a tener una forma real y coherente para el sistema**.

---

## Estado de partida

Partimos de un sistema donde ya:

- Keycloak está levantado dentro del entorno Compose,
- la consola de administración ya responde,
- y el módulo ya dejó claro cuál es el modelo mínimo que conviene usar para NovaMarket.

Eso significa que el problema ya no es qué es cada concepto.  
Ahora la pregunta útil es otra:

- **cómo lo llevamos a una primera estructura concreta sin sobrediseñar el sistema**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- entrar a la consola de administración de Keycloak,
- crear el primer `realm`,
- crear el primer `client` principal,
- revisar sus decisiones mínimas más importantes,
- y dejar lista la base para el siguiente paso del bloque.

---

## Qué `realm` conviene crear primero

A esta altura del curso, una decisión muy razonable es crear un `realm` como:

```txt
novamarket
```

¿Por qué?

Porque:

- representa directamente al sistema que estamos construyendo,
- mantiene el modelo simple,
- y evita mezclar desde el primer momento escenarios más complejos que no necesitamos todavía.

Eso vuelve al `realm` una pieza muy clara y muy alineada con el proyecto.

---

## Paso 1 · Entrar a la consola de administración

Después de levantar Keycloak, entrá a la consola de administración usando el usuario admin que configuraste en el Compose.

Lo importante no es memorizar cada click exacto, sino entender que ahora estamos pasando de:

- infraestructura levantada
a
- infraestructura con forma real para el sistema

Ese cambio importa muchísimo.

---

## Paso 2 · Crear el `realm` `novamarket`

Dentro de la consola, creá un nuevo `realm` llamado:

```txt
novamarket
```

Este punto vale muchísimo porque a partir de acá Keycloak ya deja de estar solo “funcionando” y empieza a tener un universo de identidad concreto ligado al sistema.

Eso cambia bastante la madurez del bloque.

---

## Paso 3 · Entender por qué no conviene usar siempre el `master`

Conviene dejar esto claro.

Aunque Keycloak trae un `realm` `master`, no conviene usarlo como si fuera el espacio natural de la aplicación.

¿Por qué?

Porque el `master` cumple un rol más administrativo sobre la propia instancia.

Para NovaMarket, lo sano es tener su propio `realm`, con identidad y reglas propias.

Ese criterio es muy importante y muy profesional.

---

## Qué `client` conviene crear primero

A esta altura del módulo, una muy buena primera decisión suele ser crear un `client` para algo como:

```txt
api-gateway
```

¿Por qué?

Porque el gateway es el borde del sistema y es una de las piezas más naturales para convertirse en el primer componente que dialogue de verdad con Keycloak.

Eso vuelve al primer `client` muy fácil de justificar arquitectónicamente.

---

## Paso 4 · Crear el primer `client`

Dentro del `realm` `novamarket`, creá un `client` principal con un identificador como:

```txt
api-gateway
```

No hace falta todavía configurar todas las variantes posibles.

La meta es mucho más concreta:

- empezar con una pieza clara,
- visible,
- y directamente conectada con el borde del sistema que ya venimos trabajando desde hace bastante.

---

## Paso 5 · Entender qué tipo de `client` estamos modelando

Este punto importa muchísimo.

Cuando creamos el `client`, no estamos creando un usuario ni una ruta.  
Estamos modelando una aplicación o componente del sistema que va a confiar en Keycloak para parte de su seguridad.

Ese cambio de lectura es muy importante porque hace que el panel de Keycloak deje de parecer una serie de formularios y empiece a verse como modelado real de arquitectura.

---

## Paso 6 · Elegir una configuración inicial razonable

A esta altura del curso, no hace falta todavía habilitar todas las opciones posibles.

Lo más sano es dejar una configuración inicial simple y coherente con el uso que vamos a ir construyendo después.

Por ejemplo:

- un `client` claro,
- con nombre explícito,
- y con una base que después podamos extender cuando llegue el momento de tokens, redirect URIs o validación más concreta.

La idea central de esta clase no es perfección de detalle.  
Es crear una base real y bien orientada.

---

## Paso 7 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, la infraestructura de identidad existía pero estaba vacía desde el punto de vista del proyecto.

Ahora, en cambio, ya tiene:

- un `realm` propio
- y un `client` principal

Eso significa que Keycloak ya empieza a representar de verdad a NovaMarket y no solo a una instancia genérica levantada en Compose.

Ese salto vale muchísimo.

---

## Paso 8 · Entender por qué este paso es tan importante aunque parezca pequeño

A primera vista, puede parecer que solo creamos dos elementos administrativos.

Pero en realidad vale muchísimo porque cambia algo muy fuerte:

- la identidad del proyecto ya no está solo “disponible”
- ahora además empieza a estar **modelada**

Y ese paso de disponibilidad a modelado es uno de los más importantes del bloque.

---

## Paso 9 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya integró identidad completa”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene su primer `realm` real y su primer `client` principal definidos dentro de Keycloak.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase crea el primer `realm` y el primer `client` principal de NovaMarket en Keycloak.

Ya no estamos solo diciendo que el sistema tiene una infraestructura de identidad.  
Ahora también estamos haciendo que esa infraestructura empiece a tener una forma real, explícita y directamente ligada a la arquitectura del proyecto.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- creamos usuarios,
- ni roles,
- ni probamos todavía emisión de tokens,
- ni integramos el gateway con validación real.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso de modelado real dentro de Keycloak para NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Usar el `master` como si fuera el `realm` de la aplicación
Conviene separar claramente administración de instancia y aplicación real.

### 2. Crear un `client` sin una pieza concreta del sistema en mente
La traducción arquitectónica importa muchísimo.

### 3. Querer configurar todas las opciones del `client` de una sola vez
En esta etapa, una base simple y clara vale muchísimo más.

### 4. Reducir esta clase a clicks de consola
En realidad estamos modelando identidad para el sistema.

### 5. Pensar que este paso ya resuelve integración completa
Todavía estamos construyendo la base.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- existe un `realm` `novamarket`,
- existe un primer `client` principal como `api-gateway`,
- y la infraestructura de identidad ya empezó a modelarse de forma concreta para el sistema.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el `realm` ya existe,
- el `client` principal ya existe,
- entendés qué representa cada uno,
- y sentís que la identidad de NovaMarket ya dejó de ser solo infraestructura vacía para convertirse en una estructura real.

Si eso está bien, ya podemos pasar al siguiente tema y empezar a crear usuarios y roles iniciales.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a crear los primeros usuarios y roles de NovaMarket dentro de Keycloak para completar la base mínima de identidad sobre la que después vamos a trabajar autenticación y autorización reales.

---

## Cierre

En esta clase creamos el primer `realm` y el primer `client` principal de NovaMarket en Keycloak.

Con eso, el proyecto deja de tener solo una instancia viva de identidad y empieza a tener un modelo real, explícito y directamente conectado con la arquitectura y las necesidades concretas del sistema que estamos construyendo.
