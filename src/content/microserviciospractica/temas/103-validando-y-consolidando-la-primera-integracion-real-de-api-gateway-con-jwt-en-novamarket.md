---
title: "Validando y consolidando la primera integración real de api-gateway con JWT en NovaMarket"
description: "Checkpoint del módulo 10. Validación y consolidación de la primera integración real entre api-gateway y JWT emitidos por Keycloak dentro de NovaMarket."
order: 103
module: "Módulo 10 · Seguridad real con Keycloak"
level: "intermedio"
draft: false
---

# Validando y consolidando la primera integración real de `api-gateway` con JWT en NovaMarket

En la clase anterior dimos un paso muy importante dentro del bloque de seguridad real:

- `api-gateway` dejó de ser solo un punto de entrada técnico,
- lo configuramos como **resource server JWT**,
- aprendió a confiar en el `issuer` de Keycloak,
- y además ya puede reaccionar distinto frente a una request sin token y frente a una request con un bearer token real.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer, otra vez, lo que venimos haciendo cada vez que el proyecto gana una nueva capa de madurez:

**un checkpoint de consolidación.**

Porque una cosa es haber logrado que el gateway valide un JWT.  
Y otra bastante distinta es detenerse a mirar qué significa realmente eso para la postura general de seguridad del sistema.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- NovaMarket ya cuenta con una primera integración real entre `api-gateway` y JWT emitidos por Keycloak,
- esa integración aporta valor genuino al proyecto,
- y el sistema ya empezó a dejar atrás una seguridad basada solo en borde simple o barreras estáticas para pasar a una seguridad apoyada en identidad real.

Esta clase funciona como checkpoint fuerte del primer subbloque de integración entre Keycloak y el gateway.

---

## Estado de partida

Partimos de un sistema donde ya:

- Keycloak emite access tokens reales,
- `api-gateway` está configurado como resource server JWT,
- existe una `SecurityWebFilterChain` inicial,
- y el borde del sistema ya reacciona distinto según llegue o no una credencial válida.

Eso significa que ya no estamos discutiendo una hipótesis.

Ahora estamos leyendo una mejora real sobre cómo NovaMarket deja de tratar al gateway solo como un enrutableador y empieza a tratarlo también como una primera capa seria de seguridad.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el valor estructural de esta integración,
- consolidar cómo se relaciona con todo lo construido antes,
- validar qué cambia en la madurez general del proyecto,
- y dejar este subbloque como base estable para pasar a autorización más fina por roles.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si con token responde distinto que sin token”.

Queremos observar algo más interesante:

- si el gateway ya empezó a confiar de verdad en la infraestructura de identidad,
- si los JWT ya dejaron de ser objetos teóricos para convertirse en una parte activa del acceso al sistema,
- y si el módulo 10 ya ganó una base concreta para pasar del mundo de autenticación al de autorización.

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Volver sobre el recorrido de esta etapa

Antes de entrar en detalles, conviene fijar la secuencia que construimos:

- primero incorporamos Keycloak al entorno,
- después modelamos `realm`, `client`, usuarios y roles,
- luego pedimos un access token real,
- lo inspeccionamos,
- y recién ahí configuramos el gateway para validarlo.

Ese encadenamiento importa mucho porque muestra que esta etapa no apareció aislada, sino como una evolución natural desde identidad modelada hasta borde protegido por JWT reales.

---

## Paso 2 · Consolidar la relación entre Keycloak y gateway

Este es uno de los puntos más importantes de toda la clase.

A esta altura ya conviene poder decir algo como:

- Keycloak ya no es solo una consola de administración de identidad,
- y el gateway ya no es solo un proxy con rutas.

Ahora existe una relación real entre ambos:

- Keycloak **emite** identidad
- y el gateway **la valida y la usa** para decidir acceso.

Ese cambio importa muchísimo porque transforma al bloque completo en un flujo real de seguridad y no solo en una suma de piezas separadas.

---

## Paso 3 · Entender qué valor tuvo configurar `issuer-uri`

También vale mucho notar que no resolvimos la confianza del gateway con una lógica casera o con validaciones inventadas a mano.

Nos apoyamos en una configuración real de resource server JWT.

Eso fue una muy buena decisión.

¿Por qué?

Porque hace que el gateway:

- reconozca el emisor correcto,
- pueda apoyarse en la configuración estándar del proveedor de identidad,
- y trate al JWT como una credencial real, no como un string cualquiera.

Ese criterio mejora muchísimo la calidad del bloque.

---

## Paso 4 · Revisar qué cambió en la madurez del proyecto

A esta altura conviene fijar algo importante:

antes, NovaMarket ya tenía:

- gateway serio,
- filtros,
- balanceo,
- y una seguridad inicial simple en el borde.

Ahora, en cambio, además empieza a tener una noción más clara de que:

- la identidad del usuario puede venir de una infraestructura centralizada,
- el borde del sistema puede validarla de verdad,
- y el acceso ya no tiene por qué decidirse solo con reglas locales o barreras didácticas.

Ese cambio vuelve al proyecto bastante más serio desde el punto de vista arquitectónico.

---

## Paso 5 · Entender qué todavía no está resuelto

También conviene dejar algo claro:

después de este checkpoint todavía siguen existiendo muchos pasos posibles, por ejemplo:

- traducir roles del token a autoridades útiles,
- distinguir acceso por `customer` y `admin`,
- propagar mejor identidad aguas abajo,
- o incluso proteger internamente más servicios si después queremos profundizar.

Eso está bien.

La meta de esta etapa nunca fue resolverlo todo.  
Fue empezar con algo real, útil y bien orientado.

Y eso sí se logró muy bien.

---

## Paso 6 · Pensar por qué esto mejora muchísimo el siguiente tramo

Este punto importa mucho.

A partir de ahora, autorización por roles va a ser muchísimo más fácil de sostener porque ya existe una primera referencia concreta de que:

- el JWT llega,
- el gateway lo valida,
- y el borde del sistema ya dejó de ser neutral respecto de la identidad.

Eso significa que esta clase no solo cierra una etapa.  
También prepara muy bien todo lo que viene después.

---

## Paso 7 · Comparar el proyecto actual con el del comienzo del bloque

Si miramos el recorrido hasta acá, la evolución ya empieza a verse bastante clara:

### Antes
- gateway fuerte
- Keycloak levantado
- tokens reales disponibles
- pero todavía sin validación real en el borde

### Ahora
- gateway fuerte
- Keycloak integrado
- JWT real validado en el borde
- y primera protección real mediada por identidad

Ese cambio vale muchísimo porque ya mueve a NovaMarket hacia una postura bastante más madura también en cómo protege el acceso al sistema.

---

## Paso 8 · Entender qué NO estamos afirmando todavía

Conviene dejar esto muy claro.

En este punto todavía no estamos diciendo:

- que todas las rutas del sistema ya tienen autorización fina,
- ni que el gateway ya distingue perfectamente todos los perfiles,
- ni que la seguridad completa ya quedó cerrada.

Eso sería exagerado.

Lo que sí podemos decir con bastante honestidad es algo mucho más valioso:

- NovaMarket ya dejó de tratar la seguridad del borde como algo separado de la identidad real y empezó a validarla usando JWT emitidos por Keycloak.

Y eso ya es un avance muy fuerte.

---

## Qué estamos logrando con esta clase

Esta clase consolida la primera integración real entre `api-gateway` y JWT en NovaMarket.

Ya no estamos solo modelando identidad, pidiendo tokens o leyendo claims.  
Ahora también estamos dejando claro que esa identidad ya influye de verdad en el borde del sistema y que el acceso ya no está desligado de la autenticación real.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- traducimos todavía roles del JWT en reglas finas de autorización,
- ni protegimos aún rutas distintas según `customer` y `admin`.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**validar y consolidar esta primera integración real entre Keycloak y el gateway como una ganancia real del proyecto.**

---

## Errores comunes en esta etapa

### 1. Pensar que esta etapa solo “hizo andar JWT”
En realidad cambió bastante la postura de seguridad del borde del sistema.

### 2. Reducir el valor del bloque a que una request con token no falle
El valor real está en haber conectado identidad real con acceso real.

### 3. Confundir esta mejora con autorización completa del sistema
Todavía estamos en una primera capa, no en la solución final.

### 4. Exagerar lo logrado
Todavía queda mucho si quisiéramos reglas más finas y propagación más rica de identidad.

### 5. No consolidar este paso antes de hablar de roles
Eso haría más difícil sostener la lógica del módulo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión bastante más clara de cómo la primera integración real entre `api-gateway` y JWT mejora la postura general de seguridad de NovaMarket y por qué esta evolución ya representa una madurez real dentro del módulo 10.

Eso deja muy bien preparado el siguiente tramo del curso rehecho.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué aporta que el gateway valide JWT reales,
- ves que la identidad ya empezó a influir en el acceso al sistema,
- entendés qué cosas sí mejoraron y cuáles todavía quedan abiertas,
- y sentís que NovaMarket ya ganó una nueva capa concreta de madurez desde seguridad real en el borde.

Si eso está bien, entonces este bloque ya puede pasar al siguiente frente con una base mucho más fuerte.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a entender cómo traducir roles del token a autoridades útiles dentro de Spring Security para poder pasar de autenticación real a autorización real en el gateway.

---

## Cierre

En esta clase validamos y consolidamos la primera integración real de `api-gateway` con JWT en NovaMarket.

Con eso, el proyecto deja de apoyarse solo en tokens emitidos por una infraestructura externa y empieza a usar de verdad esa identidad en el punto de entrada del sistema, transformando la seguridad del borde en algo mucho más serio, mucho más centralizado y mucho más conectado con la arquitectura real.
