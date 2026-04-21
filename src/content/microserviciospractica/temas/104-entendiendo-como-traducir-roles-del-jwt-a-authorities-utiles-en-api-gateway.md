---
title: "Entendiendo cómo traducir roles del JWT a authorities útiles en api-gateway"
description: "Siguiente paso del módulo 10. Comprensión de cómo los roles presentes en el JWT emitido por Keycloak se traducen a authorities útiles dentro de Spring Security para autorización real."
order: 104
module: "Módulo 10 · Seguridad real con Keycloak"
level: "intermedio"
draft: false
---

# Entendiendo cómo traducir roles del JWT a authorities útiles en `api-gateway`

En la clase anterior cerramos una etapa muy importante dentro del bloque de seguridad real:

- `api-gateway` ya valida JWT reales emitidos por Keycloak,
- el borde del sistema ya dejó de ser ingenuo respecto de la identidad,
- y NovaMarket ya puede distinguir entre una request sin credencial válida y una request autenticada con un token real.

Eso ya tiene muchísimo valor.

Pero ahora aparece otra pregunta muy natural:

**si el JWT ya está validado, cómo pasamos de “usuario autenticado” a “usuario autorizado a hacer algo concreto según sus roles”?**

Ese es el terreno de esta clase.

Porque una cosa es saber que el token es válido.

Y otra bastante distinta es usar la información que trae el token para decidir cosas como:

- esta ruta puede verla cualquier autenticado,
- esta otra requiere `customer`,
- y esta otra solo debería verla alguien con `admin`.

Ese es exactamente el siguiente problema que conviene abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro dónde suelen aparecer los roles dentro del JWT emitido por Keycloak,
- entendida la idea de **authorities** dentro de Spring Security,
- visible por qué a veces no alcanza con validar el token y hace falta mapear claims a autoridades útiles,
- y preparado el terreno para aplicar autorización real por roles en la próxima clase.

Todavía no vamos a escribir toda la política final del gateway.  
La meta de hoy es entender cómo pasar de autenticación real a autorización real.

---

## Estado de partida

Partimos de un sistema donde ya:

- Keycloak emite JWT reales,
- el gateway los valida,
- y el módulo ya dejó claro que el siguiente paso no es solo “aceptar o rechazar tokens”, sino usar su contenido para decidir acceso.

Eso significa que el problema ya no es si el usuario está autenticado.  
Ahora la pregunta útil es otra:

- **cómo traducimos roles y claims del JWT a algo que Spring Security pueda usar cómodamente para autorizar rutas**

Y eso es exactamente lo que vamos a resolver en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar dónde aparecen roles en el token,
- entender qué son las `authorities` en Spring Security,
- conectar esa idea con el JWT emitido por Keycloak,
- y dejar clara la lógica del siguiente paso práctico del bloque.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- el gateway puede validar que el token es auténtico y aceptable.

Eso fue un gran salto.

Pero a medida que el bloque madura, aparece otra necesidad muy concreta:

**que el sistema no se quede solo con “el usuario existe”, sino que pueda distinguir qué tipo de usuario es y qué nivel de acceso representa.**

Porque ahora conviene hacerse preguntas como:

- ¿cómo hace Spring Security para saber que alguien es `admin`?
- ¿dónde se leen los roles dentro del JWT?
- ¿qué diferencia hay entre un claim bruto del token y una authority usable por reglas de seguridad?
- ¿por qué a veces hace falta un convertidor o mapeo explícito?

Ese cambio de enfoque es justamente el corazón de esta etapa.

---

## Dónde suelen aparecer roles en el JWT de Keycloak

A esta altura del curso, conviene recordar algo muy importante:

cuando inspeccionamos el access token, vimos que los roles pueden aparecer en estructuras como:

- `realm_access`
- `resource_access`

No hace falta hoy decidir todas las variantes posibles.

Lo importante es fijar esta idea:

- **los roles existen en el token**
- pero no siempre Spring Security los usa automáticamente de la forma exacta que nos conviene para autorizar rutas.

Ese matiz importa muchísimo.

---

## Qué es una authority en Spring Security

Para esta etapa del curso, una forma útil de pensarlo es esta:

**una authority es la forma interna con la que Spring Security representa permisos, roles o capacidades que después puede usar en reglas de acceso.**

Esa idea es central.

No estamos hablando ya del token como string crudo.  
Estamos hablando de algo que Spring Security pueda mirar y decir:

- “esta autenticación tiene estas autoridades”
- y entonces
- “puede entrar a esta ruta, pero no a esta otra”

Ese puente entre JWT y authorities es el corazón del subbloque.

---

## Por qué validar el token no alcanza

Este punto importa muchísimo.

Validar el token resuelve algo importante:

- la identidad es confiable,
- el emisor es correcto,
- la firma es correcta,
- y el token no está vencido.

Pero todavía falta otra capa:

- **cómo usamos su contenido para autorizar acciones concretas**

Y ahí es donde las authorities se vuelven centrales.

Porque el sistema necesita una forma cómoda y consistente de traducir roles del JWT a decisiones reales de acceso.

---

## Qué hace falta traducir exactamente

A esta altura del módulo, la pregunta importante ya no es solo:

- “¿dónde está el rol?”

La pregunta más útil es:

- “¿cómo convierto ese rol en algo que Spring Security use de forma natural dentro de `authorizeExchange`, `hasRole`, `hasAuthority`, etc.?”

Ese cambio de pregunta es muy importante porque marca el paso de autenticación a autorización.

---

## Qué tipo de mapeo suele hacer falta

En muchos escenarios con Keycloak, el token puede traer roles en claims anidados o con una estructura que no coincide exactamente con la forma más cómoda de trabajar en Spring Security.

Por eso, a veces conviene algo como:

- leer los roles desde el claim correcto,
- convertirlos a authorities,
- y eventualmente normalizarlos a una convención como:
  - `ROLE_customer`
  - `ROLE_admin`

No hace falta hoy escribir el código exacto todavía.

La meta es algo más concreta:

- entender por qué este paso existe y por qué es importante.

---

## Cómo se traduce esto a NovaMarket

A esta altura del curso, una estructura muy razonable para pensar sería algo como:

- si el JWT trae `customer`
  - el gateway debería poder tratar eso como una authority o role útil
- si el JWT trae `admin`
  - el gateway debería poder usar eso para proteger rutas administrativas

Ese puente es exactamente lo que va a permitir que el sistema deje de decir solo:

- “hay token válido”

y pase a decir:

- “hay token válido y además el usuario tiene tal perfil de acceso”

Ese salto es enorme.

---

## Por qué esta clase importa tanto antes de tocar reglas concretas

A primera vista, esta clase puede parecer todavía conceptual.

Pero en realidad vale muchísimo porque evita uno de los peores problemas de este bloque:

- escribir reglas de autorización por roles sin entender de dónde salen realmente esas authorities.

Ese valor de claridad conceptual importa muchísimo más que meter `hasRole("admin")` demasiado pronto sin entender qué la respalda.

---

## Qué estamos logrando con esta clase

Esta clase ordena el modelo mental de cómo roles del JWT se traducen a authorities útiles en `api-gateway`.

Ya no estamos solo validando credenciales reales.  
Ahora también estamos entendiendo cómo usar su contenido para que el borde del sistema empiece a tomar decisiones concretas de autorización.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- escribimos todavía el convertidor concreto,
- ni protegimos aún rutas distintas según `customer` y `admin`.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender cómo pasar del rol que viaja en el JWT a una authority utilizable por Spring Security.**

---

## Errores comunes en esta etapa

### 1. Pensar que validar JWT ya resuelve autorización
No. Falta usar el contenido del token.

### 2. Asumir que Spring Security siempre interpreta automáticamente todos los roles como nos conviene
A veces hace falta un mapeo explícito.

### 3. Confundir claim de rol con authority final usable en reglas
No siempre son equivalentes de forma directa.

### 4. Escribir reglas `hasRole` sin saber cómo llega ese rol al contexto de seguridad
Eso vuelve opaca toda la integración.

### 5. Reducir la clase a teoría
En realidad ordena el paso práctico más importante del siguiente tramo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder explicar con bastante claridad por qué a veces hace falta traducir roles del JWT a authorities útiles en Spring Security y por qué ese paso es clave para proteger rutas reales en NovaMarket.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés dónde viven los roles dentro del token,
- entendés qué son las authorities,
- ves por qué validar JWT no alcanza para autorización fina,
- y sentís que ya existe una base conceptual suficientemente clara para aplicar reglas reales por roles.

Si eso está bien, ya podemos pasar al siguiente tema y empezar a proteger rutas concretas del gateway usando `customer` y `admin`.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a mapear roles del JWT a authorities útiles y a proteger rutas reales del gateway según perfiles `customer` y `admin` dentro de NovaMarket.

---

## Cierre

En esta clase entendimos cómo traducir roles del JWT a authorities útiles en `api-gateway`.

Con eso, el proyecto deja de quedarse en autenticación pura y empieza a prepararse para otra mejora muy valiosa: que el borde del sistema no solo valide tokens, sino que también use sus roles para decidir acceso real según el perfil de cada identidad.
