---
title: "Entendiendo por qué los filtros del gateway ya tienen sentido en NovaMarket"
description: "Inicio del siguiente tramo del módulo 6. Comprensión de por qué, después de tener rutas reales y balanceo funcional, ya conviene empezar a trabajar con filtros en api-gateway."
order: 44
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Entendiendo por qué los filtros del gateway ya tienen sentido en NovaMarket

En la clase anterior cerramos el primer gran bloque rehecho del gateway con una idea bastante fuerte:

- NovaMarket ya no tiene un gateway solo “creado”,
- sino un gateway funcional,
- apoyado en discovery,
- con rutas reales,
- y con balanceo visible entre instancias.

Eso ya tiene muchísimo valor.

Pero ahora aparece otra pregunta muy natural:

**si el gateway ya existe y ya enruta tráfico real, cuándo empieza a tener sentido hacer algo más que simplemente “dejar pasar” la request?**

Ese es el terreno de esta clase.

Porque una cosa es tener un punto de entrada que reciba tráfico y lo mande al microservicio correcto.

Y otra bastante distinta es empezar a pedirle cosas como:

- agregar información a la request,
- agregar información a la response,
- dejar trazas más visibles,
- validar o registrar mejor lo que entra,
- o aplicar comportamiento transversal antes y después del ruteo.

Ese es exactamente el tipo de problema que vienen a resolver los **filtros** del gateway.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué los filtros del gateway aparecen como siguiente evolución natural del módulo,
- entendida la diferencia entre enrutar tráfico y procesarlo con criterio en el borde,
- alineado el modelo mental para una primera capa razonable de filtros,
- y preparado el terreno para aplicar un filtro concreto en NovaMarket en la próxima clase.

Todavía no vamos a construir filtros complejos.  
La meta de hoy es entender por qué este nuevo frente ya tiene sentido ahora.

---

## Estado de partida

Partimos de un sistema que ya:

- tiene `api-gateway`,
- ya enruta por nombres lógicos con `lb://`,
- ya puede repartir requests entre múltiples instancias,
- y ya ofrece un punto de entrada unificado bastante más serio que antes.

Eso significa que el problema ya no es solo:

- “cómo hacer llegar la request al servicio correcto”

Ahora empieza a importar otra pregunta:

- **qué queremos hacer con esa request y con esa response mientras atraviesan el gateway**

Y esa pregunta cambia mucho el nivel del módulo.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué rol nuevo puede jugar el gateway una vez que ya enruta bien,
- entender qué tipo de problemas resuelven los filtros,
- conectar esta etapa con todo lo que ya construimos,
- y dejar clara la lógica del siguiente tramo del módulo.

---

## Qué problema queremos resolver exactamente

Hasta ahora, el gateway ya nos ayudó a resolver varias cosas importantes:

- unificar entrada,
- desacoplar acceso externo de puertos internos,
- usar discovery,
- y enrutar por nombre lógico.

Eso fue muy valioso.

Pero a medida que el punto de entrada madura, aparece otra necesidad:

**que el gateway deje de ser solo un pasamanos de tráfico y empiece a tener una capa mínima de procesamiento transversal.**

Porque ahora conviene hacerse preguntas como:

- ¿cómo dejo una traza visible de que la request pasó por el gateway?
- ¿cómo agrego headers útiles?
- ¿cómo hago más explícita la observación del borde del sistema?
- ¿qué comportamiento común conviene aplicar antes o después del ruteo?

Ese cambio de enfoque es justamente el corazón de esta etapa.

---

## Por qué este paso tiene sentido justamente ahora

Porque el gateway ya está lo suficientemente maduro como para que el problema deje de ser “cómo crearlo” o “cómo hacer que enrute” y pase a ser también:

- **cómo empezar a tratarlo como un verdadero punto de control del borde del sistema**

Antes, en etapas más tempranas, todavía tenía más sentido concentrarse en:

- crear el gateway,
- conectarlo con Eureka,
- enrutar correctamente,
- y comprobar balanceo.

Ahora, en cambio, ya existe suficiente gateway como para que empiece a importar otra pregunta:

- **qué comportamiento transversal queremos empezar a poner ahí**

Y esa pregunta tiene muchísimo más valor ahora que antes.

---

## Qué es un filtro del gateway en este contexto

Para esta etapa del curso, una forma útil de pensarlo es esta:

**un filtro del gateway es una pieza que permite interceptar, modificar, enriquecer u observar una request o una response mientras pasa por el punto de entrada del sistema.**

No hace falta todavía hablar de filtros ultra sofisticados.

Con una primera idea ya alcanza muchísimo:

- algo entra al gateway,
- el filtro participa,
- y después la request sigue su camino o la response vuelve transformada.

Esa capacidad es una de las cosas más valiosas de tener un gateway y no solo acceso directo a microservicios por puertos.

---

## Qué tipos de problemas resuelven los filtros

Sin entrar todavía al detalle fino, un filtro del gateway puede servir para cosas como:

- logging o trazabilidad simple,
- agregar headers,
- quitar headers,
- dejar marcas visibles del paso por el gateway,
- validar algo en la request,
- o transformar parte de la respuesta.

No hace falta resolver todo eso ahora.

Lo importante hoy es instalar correctamente el mapa mental.

---

## Qué cambia en la arquitectura cuando aparece un filtro

Este punto importa muchísimo.

Antes del filtro, el gateway básicamente hace esto:

- recibe request
- decide ruta
- envía request
- devuelve response

Después de introducir filtros, el modelo cambia a algo mucho más interesante:

- recibe request
- puede observarla o modificarla
- decide ruta
- envía request
- recibe response
- puede observarla o modificarla otra vez
- la devuelve

Ese cambio vuelve al gateway muchísimo más poderoso y muchísimo más útil.

---

## Por qué conviene empezar por un filtro simple

A esta altura del módulo no hace falta arrancar con autenticación o reglas pesadas.

De hecho, conviene mucho más empezar por algo simple, visible y didáctico.

¿Por qué?

Porque queremos que el alumno vea claramente:

- que el filtro corre,
- cuándo participa,
- qué toca,
- y qué valor agrega

Una primera experiencia clara vale muchísimo más que una primera experiencia sofisticada pero opaca.

---

## Qué tipo de filtro inicial encaja bien en NovaMarket

Para el estado actual del proyecto, una gran primera opción es un filtro que deje una huella muy visible de que la request pasó por el gateway.

Por ejemplo:

- agregar un header en la response,
- registrar el método y el path,
- o ambas cosas de manera básica.

Eso tiene varias ventajas:

- es fácil de ver,
- no rompe el negocio,
- y deja claro que el gateway ya no solo enruta, sino que también participa activamente.

Ese tipo de primer paso encaja muy bien con el punto donde está NovaMarket ahora.

---

## Qué todavía no estamos haciendo en esta etapa

Conviene dejar esto muy claro.

En este punto todavía no estamos:

- implementando autenticación en el borde,
- ni aplicando filtros de seguridad pesados,
- ni construyendo rate limiting,
- ni resolviendo trazabilidad distribuida completa.

La meta actual es mucho más concreta:

**empezar una primera capa simple y visible de filtros en `api-gateway`.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no agrega todavía un filtro concreto, pero hace algo muy importante:

**abre explícitamente el siguiente frente lógico del módulo de API Gateway.**

Eso importa muchísimo, porque el gateway deja de madurar solo como componente de ruteo y empieza a prepararse para otra capa muy importante: el procesamiento transversal del tráfico en el borde del sistema.

---

## Qué todavía no hicimos

Todavía no:

- elegimos el primer filtro concreto,
- ni aplicamos todavía una primera mejora visible sobre requests y responses en el gateway.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué los filtros del gateway ya tienen sentido ahora.**

---

## Errores comunes en esta etapa

### 1. Pensar que el gateway ya está “completo” solo porque enruta bien
Todavía puede ganar muchísimo valor con comportamiento transversal.

### 2. Querer arrancar con filtros demasiado complejos
Conviene empezar por algo simple, claro y visible.

### 3. No distinguir entre ruteo y procesamiento
El gateway ya no solo decide a dónde va la request; también puede intervenir en su camino.

### 4. Abrir este frente demasiado pronto
Antes de las rutas reales y el balanceo, este tema habría quedado prematuro.

### 5. No ver el valor didáctico de un filtro simple
Un primer filtro visible ordena muchísimo mejor lo que viene después.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para empezar a trabajar con filtros en el gateway y por qué ese paso aparece ahora como siguiente evolución natural del módulo.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés que el gateway ya no es solo un enroutador,
- ves por qué el procesamiento transversal ya tiene sentido,
- entendés que no hace falta empezar por algo complejo,
- y sentís que el módulo ya está listo para un primer filtro concreto y visible.

Si eso está bien, ya podemos pasar a aplicar ese primer filtro en `api-gateway`.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a aplicar un primer filtro global simple en `api-gateway` para dejar una huella visible del paso de la request por el gateway y consolidar el nuevo rol del punto de entrada del sistema.

---

## Cierre

En esta clase entendimos por qué los filtros del gateway ya tienen sentido en NovaMarket.

Con eso, el módulo 6 deja de madurar solo desde rutas, discovery y balanceo y empieza a prepararse para otra capa muy importante: el procesamiento transversal del tráfico en el borde del sistema.
