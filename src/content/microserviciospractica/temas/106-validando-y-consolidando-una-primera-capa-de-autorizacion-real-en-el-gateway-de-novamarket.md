---
title: "Validando y consolidando una primera capa de autorización real en el gateway de NovaMarket"
description: "Checkpoint del módulo 10. Validación y consolidación de una primera capa de autorización real por roles en api-gateway usando JWT emitidos por Keycloak."
order: 106
module: "Módulo 10 · Seguridad real con Keycloak"
level: "intermedio"
draft: false
---

# Validando y consolidando una primera capa de autorización real en el gateway de NovaMarket

En las últimas clases del módulo 10 dimos un paso muy importante dentro del bloque de seguridad real:

- `api-gateway` ya valida JWT reales emitidos por Keycloak,
- aprendimos a traducir roles del token a `authorities` útiles,
- y además ya protegimos rutas concretas del borde del sistema distinguiendo perfiles como `customer` y `admin`.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer, otra vez, lo que venimos haciendo cada vez que el proyecto gana una nueva capa de madurez:

**un checkpoint de consolidación.**

Porque una cosa es haber logrado una primera autorización por roles.  
Y otra bastante distinta es detenerse a mirar qué significa realmente eso para la postura general de seguridad de NovaMarket.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- NovaMarket ya cuenta con una primera capa real de autorización por roles en el gateway,
- esa capa aporta valor genuino al proyecto,
- y el sistema ya empezó a dejar atrás una seguridad basada solo en autenticación o en reglas demasiado generales para pasar a un control de acceso mucho más concreto.

Esta clase funciona como checkpoint fuerte del subbloque de autorización real en el borde del sistema.

---

## Estado de partida

Partimos de un sistema donde ya:

- Keycloak emite tokens reales,
- `api-gateway` los valida como resource server JWT,
- existe una traducción entre roles del token y authorities útiles,
- y algunas rutas ya reaccionan distinto según el perfil autenticado.

Eso significa que ya no estamos discutiendo una hipótesis.

Ahora estamos leyendo una mejora real sobre cómo NovaMarket deja de limitarse a “usuario autenticado sí o no” y empieza a tomar decisiones de acceso basadas en perfiles concretos.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el valor estructural de esta primera autorización por roles,
- consolidar cómo se relaciona con todo lo construido antes,
- validar qué cambia en la madurez general del sistema,
- y dejar este subbloque como base estable para el siguiente paso del módulo.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si `customer` entra a una ruta y `admin` a otra”.

Queremos observar algo más interesante:

- si el gateway ya empezó a comportarse como una pieza que no solo autentica, sino que además **autoriza**,
- si los roles del sistema ya dejaron de ser datos estáticos cargados en Keycloak para convertirse en decisiones reales de acceso,
- y si el módulo 10 ya ganó una base concreta para usar identidad autenticada de una forma más rica dentro de NovaMarket.

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Volver sobre el recorrido de esta etapa

Antes de entrar en detalles, conviene fijar la secuencia que construimos:

- primero incorporamos Keycloak al entorno,
- después modelamos `realm`, `client`, usuarios y roles,
- luego obtuvimos e inspeccionamos tokens reales,
- configuramos el gateway como resource server,
- y finalmente hicimos que los roles del token afectaran acceso real a rutas concretas.

Ese encadenamiento importa mucho porque muestra que esta etapa no apareció aislada, sino como una evolución natural desde infraestructura de identidad hasta autorización real en el borde del sistema.

---

## Paso 2 · Consolidar la relación entre autenticación y autorización

Este es uno de los puntos más importantes de toda la clase.

A esta altura ya conviene poder decir algo como:

- autenticar al usuario fue importante,
- pero autorizarlo correctamente según su perfil es lo que hace que la seguridad empiece a parecerse de verdad a un sistema real.

Ese cambio importa muchísimo porque el gateway deja de preguntar solamente:

- “¿este token es válido?”

y empieza también a preguntar:

- “¿esta identidad autenticada puede entrar acá?”

Ese segundo tipo de pregunta cambia muchísimo la madurez del bloque.

---

## Paso 3 · Entender qué valor tuvo traducir roles a authorities útiles

También vale mucho notar que no intentamos escribir reglas por roles “a ciegas”.

Primero entendimos cómo convertir claims del JWT en authorities que Spring Security realmente pudiera usar.

Eso fue una muy buena decisión.

¿Por qué?

Porque evitó uno de los peores problemas de este bloque:

- meter `hasRole("admin")` o `hasRole("customer")` sin entender de dónde salen realmente esos roles dentro del contexto de seguridad.

Ese criterio mejora muchísimo la calidad técnica del curso.

---

## Paso 4 · Revisar qué cambió en la madurez del proyecto

A esta altura conviene fijar algo importante:

antes, NovaMarket ya tenía:

- infraestructura de identidad,
- tokens reales,
- y validación de JWT en el gateway.

Ahora, en cambio, además empieza a tener una noción más clara de que:

- no toda identidad autenticada puede hacer lo mismo,
- el borde del sistema puede distinguir perfiles,
- y los roles emitidos por Keycloak ya no viven solo en un panel administrativo, sino también en decisiones reales de acceso.

Ese cambio vuelve al proyecto bastante más serio desde el punto de vista de seguridad.

---

## Paso 5 · Entender qué todavía no está resuelto

También conviene dejar algo claro:

después de este checkpoint todavía siguen existiendo muchos pasos posibles, por ejemplo:

- aprovechar claims adicionales del JWT,
- propagar identidad hacia servicios internos,
- enriquecer reglas de autorización,
- o decidir si conviene bajar cierta seguridad también más allá del gateway.

Eso está bien.

La meta de esta etapa nunca fue resolverlo todo.  
Fue empezar con algo real, útil y bien orientado.

Y eso sí se logró muy bien.

---

## Paso 6 · Pensar por qué esto mejora muchísimo el siguiente tramo

Este punto importa mucho.

A partir de ahora, cualquier siguiente paso del bloque de seguridad va a ser mucho más fácil de sostener porque ya existe una primera referencia concreta de que:

- el sistema emite identidad,
- el gateway la valida,
- y además la usa para autorizar de forma visible según perfiles reales.

Eso significa que esta clase no solo cierra una etapa.  
También prepara muy bien todo lo que viene después.

---

## Paso 7 · Comparar el proyecto actual con el del comienzo del bloque

Si miramos el recorrido hasta acá, la evolución ya empieza a verse bastante clara:

### Antes
- gateway fuerte
- identidad real ya modelada
- tokens válidos
- pero todavía sin una autorización fina visible por perfiles

### Ahora
- gateway fuerte
- identidad real integrada
- JWT válidos
- y una primera autorización real por roles `customer` y `admin`

Ese cambio vale muchísimo porque ya mueve a NovaMarket hacia una postura bastante más madura también en cómo decide acceso.

---

## Paso 8 · Entender qué NO estamos afirmando todavía

Conviene dejar esto muy claro.

En este punto todavía no estamos diciendo:

- que toda la política de autorización del sistema ya está cerrada,
- ni que todos los permisos ya estén perfectamente modelados,
- ni que la seguridad completa de NovaMarket ya esté terminada.

Eso sería exagerado.

Lo que sí podemos decir con bastante honestidad es algo mucho más valioso:

- NovaMarket ya dejó de limitarse a autenticación real y empezó a usar la identidad autenticada para tomar decisiones reales de acceso en el borde del sistema.

Y eso ya es un avance muy fuerte.

---

## Qué estamos logrando con esta clase

Esta clase consolida una primera capa real de autorización por roles en el gateway de NovaMarket.

Ya no estamos solo validando tokens ni reconociendo usuarios.  
Ahora también estamos mostrando que la seguridad del borde empieza a decidir acceso según perfiles concretos del sistema.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- aprovechamos todavía la identidad autenticada para enriquecer contexto hacia el interior del sistema,
- ni decidimos aún si seguimos profundizando seguridad en servicios internos o si abrimos el siguiente gran bloque del roadmap.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**validar y consolidar esta primera capa de autorización real como una ganancia real del proyecto.**

---

## Errores comunes en esta etapa

### 1. Pensar que esta etapa solo “agregó roles a unas rutas”
En realidad cambió bastante la forma de usar identidad en el borde del sistema.

### 2. Reducir el valor del bloque a una demo de `customer` contra `admin`
El valor real está en haber conectado claims, authorities y acceso concreto.

### 3. Confundir esta mejora con una política final completa
Todavía estamos en una primera capa, no en la solución final.

### 4. Exagerar lo logrado
Todavía queda mucho si quisiéramos un sistema de autorización mucho más fino.

### 5. No consolidar este paso antes de seguir profundizando
Eso haría más difícil sostener la lógica del módulo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión bastante más clara de cómo una primera capa de autorización real en el gateway mejora la postura general de seguridad de NovaMarket y por qué esta evolución ya representa una madurez real dentro del módulo 10.

Eso deja muy bien preparado el siguiente tramo del curso rehecho.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué aporta pasar de autenticación a autorización real,
- ves que el gateway ya no trata igual a todas las identidades válidas,
- entendés qué cosas sí mejoraron y cuáles todavía quedan abiertas,
- y sentís que NovaMarket ya ganó una nueva capa concreta de madurez desde control de acceso real en el borde del sistema.

Si eso está bien, entonces este bloque ya puede pasar al siguiente frente con una base mucho más fuerte.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a entender cómo aprovechar la identidad autenticada dentro del sistema y por qué propagar o exponer ciertos datos del usuario autenticado empieza a tener sentido después de esta primera autorización real.

---

## Cierre

En esta clase validamos y consolidamos una primera capa de autorización real en el gateway de NovaMarket.

Con eso, el proyecto deja de conformarse con validar tokens y empieza a usar de verdad la identidad emitida por Keycloak para decidir acceso concreto en el borde del sistema, dando un paso muy fuerte hacia una seguridad mucho más seria y mucho más conectada con la arquitectura real.
