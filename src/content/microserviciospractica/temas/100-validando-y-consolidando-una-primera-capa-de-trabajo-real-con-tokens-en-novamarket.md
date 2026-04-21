---
title: "Validando y consolidando una primera capa de trabajo real con tokens en NovaMarket"
description: "Checkpoint del módulo 10. Validación y consolidación de una primera capa de trabajo real con tokens emitidos por Keycloak dentro de NovaMarket."
order: 100
module: "Módulo 10 · Seguridad real con Keycloak"
level: "intermedio"
draft: false
---

# Validando y consolidando una primera capa de trabajo real con tokens en NovaMarket

En las últimas clases del módulo 10 dimos un paso muy importante dentro del bloque de seguridad real:

- entendimos qué eran access token, ID token y refresh token,
- obtuvimos el primer access token real de NovaMarket desde Keycloak,
- e inspeccionamos sus claims principales para leer identidad, tiempos y roles de una forma mucho más concreta.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer, otra vez, lo que venimos haciendo cada vez que el proyecto gana una nueva capa de madurez:

**un checkpoint de consolidación.**

Porque una cosa es haber obtenido e inspeccionado un token.  
Y otra bastante distinta es detenerse a mirar qué significa realmente eso para la postura general de seguridad del sistema.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- NovaMarket ya cuenta con una primera capa real de trabajo con tokens,
- esa capa aporta valor genuino al proyecto,
- y el sistema ya empezó a dejar atrás una seguridad apoyada solo en modelos administrativos o barreras del borde demasiado simples.

Esta clase funciona como checkpoint fuerte del subbloque de emisión e inspección de tokens del módulo 10.

---

## Estado de partida

Partimos de un sistema donde ya:

- Keycloak forma parte del entorno Compose,
- existe un `realm`, un `client`, usuarios y roles,
- y además ya obtuvimos e inspeccionamos un access token real de NovaMarket.

Eso significa que ya no estamos discutiendo una hipótesis.

Ahora estamos leyendo una mejora real sobre cómo la identidad del sistema deja de vivir solo en paneles administrativos y empieza a expresarse en credenciales concretas.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el valor estructural del trabajo ya hecho con tokens,
- consolidar cómo se relaciona con todo lo construido antes,
- validar qué cambia en la madurez general del proyecto,
- y dejar este subbloque como base estable para la integración posterior con `api-gateway`.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si Keycloak devuelve una cadena JWT”.

Queremos observar algo más interesante:

- si NovaMarket ya empezó a comportarse como un sistema donde la identidad se materializa en credenciales reales,
- si los roles y usuarios ya dejaron de existir solo como configuración estática,
- y si el módulo 10 ya ganó una base concreta para pasar del mundo de tokens al mundo de recursos protegidos.

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Volver sobre el recorrido de esta etapa

Antes de entrar en detalles, conviene fijar la secuencia que construimos:

- primero levantamos Keycloak como infraestructura de identidad,
- después modelamos `realm`, `client`, usuarios y roles,
- y recién ahí pasamos a pedir e inspeccionar credenciales reales emitidas por esa pieza.

Ese encadenamiento importa mucho porque muestra que esta etapa no apareció aislada, sino como una evolución natural desde infraestructura hacia flujo real de autenticación.

---

## Paso 2 · Consolidar la relación entre identidad modelada y token real

Este es uno de los puntos más importantes de toda la clase.

A esta altura ya conviene poder decir algo como:

- modelar usuarios y roles fue importante,
- pero hasta que el sistema no emitió credenciales reales, la identidad todavía estaba demasiado quieta.

El access token cambia eso por completo.

¿Por qué?

Porque convierte al modelo de identidad en algo que puede circular por el sistema y sostener decisiones reales de acceso.

Ese cambio importa muchísimo.

---

## Paso 3 · Entender qué valor tuvo inspeccionar claims

También vale mucho notar que no nos quedamos solo con la obtención del token.

Lo inspeccionamos.

Eso fue una muy buena decisión.

¿Por qué?

Porque evitó uno de los peores problemas de este bloque:

- usar JWTs como cajas negras sin entender qué información real traen.

Ese criterio de leer claims antes de integrar el gateway mejora muchísimo la calidad didáctica y técnica del curso.

---

## Paso 4 · Revisar qué cambió en la madurez del proyecto

A esta altura conviene fijar algo importante:

antes, NovaMarket ya tenía un entorno serio, un gateway maduro y una pieza de identidad dentro de Compose.

Ahora, en cambio, además empieza a tener una noción más clara de que:

- la identidad no es solo un panel,
- la autenticación no es solo teoría,
- y el sistema ya puede producir credenciales reales con significado concreto para su seguridad.

Ese cambio vuelve al proyecto bastante más serio desde el punto de vista arquitectónico.

---

## Paso 5 · Entender qué todavía no está resuelto

También conviene dejar algo claro:

después de este checkpoint todavía siguen existiendo muchos pasos posibles, por ejemplo:

- usar el token contra el gateway,
- validar firma, issuer y tiempos desde el borde,
- convertir claims en reglas reales de acceso,
- y después bajar incluso a servicios más internos si lo necesitamos.

Eso está bien.

La meta de esta etapa nunca fue resolverlo todo.  
Fue empezar con algo real, útil y bien orientado.

Y eso sí se logró muy bien.

---

## Paso 6 · Pensar por qué esto mejora muchísimo el siguiente tramo

Este punto importa mucho.

A partir de ahora, la integración del gateway con JWT va a ser mucho más fácil de sostener porque ya existe una primera referencia concreta de qué token esperamos, qué claims trae y qué tipo de identidad representa.

Eso significa que esta clase no solo cierra una etapa.  
También prepara muy bien todo lo que viene después.

---

## Paso 7 · Comparar el proyecto actual con el del comienzo del bloque

Si miramos el recorrido hasta acá, la evolución ya empieza a verse bastante clara:

### Antes
- Keycloak recién incorporado
- identidad todavía muy administrativa
- usuarios y roles sin credenciales reales circulando por el sistema

### Ahora
- infraestructura de identidad viva
- usuarios y roles reales
- access token real
- y claims legibles conectados con la identidad del sistema

Ese cambio vale muchísimo porque ya mueve a NovaMarket hacia una postura bastante más madura también en cómo piensa autenticación real.

---

## Paso 8 · Entender qué NO estamos afirmando todavía

Conviene dejar esto muy claro.

En este punto todavía no estamos diciendo:

- que el gateway ya valida JWT,
- ni que el sistema ya protege rutas reales con Keycloak,
- ni que la seguridad completa ya quedó integrada.

Eso sería exagerado.

Lo que sí podemos decir con bastante honestidad es algo mucho más valioso:

- NovaMarket ya dejó de tratar la identidad como pura estructura y empezó a trabajar con credenciales reales emitidas por su infraestructura de seguridad.

Y eso ya es un avance muy fuerte.

---

## Qué estamos logrando con esta clase

Esta clase consolida una primera capa real de trabajo con tokens en NovaMarket.

Ya no estamos solo modelando identidad o poblando usuarios y roles.  
Ahora también estamos dejando claro que el sistema ya puede obtener, leer y comprender credenciales reales sobre las que después va a construir autenticación y autorización concretas.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- conectamos todavía `api-gateway` con validación JWT,
- ni protegimos aún rutas reales usando esa credencial emitida por Keycloak.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**validar y consolidar esta primera capa de trabajo real con tokens como una ganancia real del proyecto.**

---

## Errores comunes en esta etapa

### 1. Pensar que esta etapa solo “pidió un token”
En realidad cambió bastante la forma de trabajar la seguridad del sistema.

### 2. Reducir el valor del bloque a ver un JWT en pantalla
El valor real está en haber conectado identidad, claims y credenciales reales.

### 3. Confundir esta mejora con integración completa de seguridad
Todavía estamos en una primera capa, no en la solución final.

### 4. Exagerar lo logrado
Todavía queda mucho si quisiéramos seguridad totalmente integrada de punta a punta.

### 5. No consolidar este paso antes de tocar el gateway
Eso haría más difícil sostener la lógica del módulo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión bastante más clara de cómo una primera capa real de trabajo con tokens mejora la postura general de seguridad de NovaMarket y por qué esta evolución ya representa una madurez real dentro del módulo 10.

Eso deja muy bien preparado el siguiente tramo del curso rehecho.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué valor aporta haber obtenido e inspeccionado un access token real,
- ves que la identidad del sistema ya no vive solo en la consola de Keycloak,
- entendés qué cosas sí mejoraron y cuáles todavía quedan abiertas,
- y sentís que NovaMarket ya ganó una nueva capa concreta de madurez desde credenciales reales de seguridad.

Si eso está bien, entonces este bloque ya puede pasar al siguiente frente con una base mucho más fuerte.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a entender por qué `api-gateway` ya puede y debe empezar a comportarse como resource server JWT dentro de NovaMarket para proteger rutas usando tokens reales emitidos por Keycloak.

---

## Cierre

En esta clase validamos y consolidamos una primera capa de trabajo real con tokens en NovaMarket.

Con eso, el proyecto deja de apoyarse solo en identidad modelada o seguridad teórica y empieza a sostener su bloque de autenticación con credenciales reales, legibles y directamente conectadas con los usuarios y roles del sistema.
