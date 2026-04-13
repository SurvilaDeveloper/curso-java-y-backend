---
title: "Entendiendo por qué requests y limits ya tienen sentido"
description: "Inicio del siguiente refinamiento operativo del bloque de Kubernetes en NovaMarket. Comprensión de por qué, después de reconstruir el sistema y consolidar su salud, ya conviene definir requests y limits."
order: 107
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Entendiendo por qué `requests` y `limits` ya tienen sentido

En las últimas clases del bloque de Kubernetes hicimos un trabajo muy importante sobre la calidad operativa del entorno:

- reconstruimos una parte sustancial del sistema dentro del cluster,
- ordenamos mejor su configuración con `ConfigMap` y `Secret`,
- introdujimos `readiness` y `liveness`,
- y además consolidamos una lectura más madura de la salud del cluster.

Eso ya deja a NovaMarket bastante mejor parado.

Pero ahora aparece otra pregunta muy natural:

**si el sistema ya vive de forma bastante real dentro del cluster, cómo le decimos a Kubernetes cuánto recurso necesita cada servicio?**

Ese es el terreno de esta clase.

Porque una cosa es que los Pods existan y estén sanos.  
Y otra bastante distinta es que el cluster tenga una idea razonable de:

- cuánta CPU necesita una pieza para arrancar y funcionar,
- cuánta memoria conviene reservarle,
- y qué techo operativo queremos marcarle para no dejar el entorno demasiado librado al azar.

Ese es exactamente el papel de:

- `requests`
- y `limits`

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué `requests` y `limits` ya tienen sentido en este punto del bloque,
- entendido qué problema operativo resuelven,
- diferenciados ambos conceptos,
- y preparado el terreno para aplicarlos a los servicios principales de NovaMarket en las próximas clases.

Todavía no vamos a escribir estos valores en los `Deployment`.  
La meta de hoy es entender bien por qué ahora sí importa hacerlo.

---

## Estado de partida

Partimos de un cluster donde ya viven piezas muy importantes del sistema:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- `api-gateway`

Y además el entorno ya tiene una capa de salud operativa más madura gracias a las probes.

Eso significa que Kubernetes ya no solo necesita saber si un servicio vive o está listo.

Ahora también empieza a importar algo más fino:

**cómo consume recursos ese servicio dentro del cluster.**

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué problema aparece cuando no definimos expectativas mínimas ni máximas de recursos,
- distinguir el rol de `requests` y `limits`,
- relacionarlo con una arquitectura como NovaMarket,
- y dejar claro por qué el siguiente refinamiento del bloque debería ir por ahí.

---

## Qué problema queremos resolver exactamente

Si no definimos una política razonable de recursos, el cluster puede quedar en una situación bastante difusa.

Por ejemplo:

- un servicio importante puede competir de forma poco clara con otros por CPU o memoria,
- el scheduler puede no tener una idea suficientemente buena de qué necesita cada Pod,
- y el entorno puede sentirse más impredecible de lo deseable a medida que crece.

No hace falta que esto se vuelva un desastre para que valga la pena ordenarlo.  
Justamente el mejor momento para introducir este refinamiento es cuando el entorno ya funciona y queremos volverlo más sólido.

---

## Qué rol cumplen los `requests`

Para este curso práctico, una forma muy útil de pensarlo es esta:

**`requests` le dice al cluster cuál es la cantidad mínima razonable de recursos que un Pod necesita para funcionar.**

Eso importa muchísimo porque el scheduler usa esa información para decidir mejor dónde ubicar los Pods.

En otras palabras:

- no es solo “cuánto usa”
- sino “cuánto debería asumirse que necesita como base”

Ese matiz es muy importante.

---

## Qué rol cumplen los `limits`

Ahora pensemos `limits`.

Una forma útil de verlo es:

**`limits` le marca al contenedor un techo de recursos que no debería superar.**

Eso ayuda bastante a evitar que una pieza del sistema se comporte de una forma demasiado descontrolada respecto del entorno que comparte con otras.

No hace falta pensar esto como un castigo al servicio.  
Conviene pensarlo más bien como una forma de darle al cluster una frontera más clara sobre el comportamiento esperado de cada pieza.

---

## Paso 1 · Entender por qué “dejarlo libre” ya empieza a ser poco maduro

Al principio del bloque, nuestra prioridad era mucho más simple:

- que el servicio viva
- que el cluster lo sostenga
- que el sistema responda

Ahora, en cambio, el entorno ya tiene bastante más cuerpo.

Por eso empieza a dejar de ser suficiente una lógica del tipo:

- “que use lo que haga falta y listo”

Ese tipo de libertad puede servir al comienzo, pero más adelante deja al cluster con menos criterio operativo del que conviene.

---

## Paso 2 · Relacionarlo con NovaMarket

En NovaMarket ya tenemos varias piezas con pesos distintos dentro del sistema.

No todas las apps tienen exactamente la misma importancia operativa ni el mismo perfil de consumo.

Por ejemplo, es razonable pensar que servicios como:

- `api-gateway`
- `order-service`
- `config-server`
- `discovery-server`

merecen al menos una primera mirada de recursos más consciente que una pieza muy secundaria o puramente experimental.

Ese tipo de lectura es justamente la que empieza a tener sentido ahora.

---

## Paso 3 · Conectar esto con la salud operativa que ya construimos

Este punto vale muchísimo.

Las probes nos ayudaron a que el cluster interprete mejor:

- disponibilidad
- y salud

Ahora `requests` y `limits` empiezan a ayudar a interpretar mejor otra dimensión:

- el costo operativo de sostener esos servicios dentro del cluster

Ese encastre es muy importante porque muestra que el bloque no está metiendo refinamientos al azar.  
Está subiendo por capas de madurez bastante coherentes entre sí.

---

## Paso 4 · Entender por qué no hicimos esto antes

Igual que con los refinamientos anteriores, este paso tiene mucho más sentido ahora que al principio del bloque.

Antes necesitábamos:

- reconstruir el sistema
- validarlo
- hacerlo accesible
- endurecer su salud
- ordenar su configuración

Recién ahora empieza a pesar de verdad la pregunta por los recursos.

Eso mantiene el roadmap coherente y evita meter demasiadas preocupaciones de operación demasiado pronto.

---

## Paso 5 · Pensar qué servicios conviene tocar primero

No hace falta aplicar `requests` y `limits` a absolutamente todo el stack de golpe.

A esta altura del bloque, algunos candidatos muy razonables son:

- `api-gateway`
- `order-service`
- `config-server`
- `discovery-server`

¿Por qué?

Porque son piezas donde:

- el impacto operativo es importante,
- la estabilidad del entorno depende bastante de ellas,
- y además ya las conocemos muy bien dentro del proyecto.

---

## Paso 6 · Pensar qué NO estamos haciendo todavía

Conviene aclararlo bien.

En este punto del bloque no estamos todavía:

- haciendo tuning fino de performance
- ni diseñando una política ultra precisa de consumo por servicio
- ni construyendo un entorno final de producción

La meta ahora es mucho más concreta:

**darle al cluster una primera idea razonable de cuánto necesita y cuánto debería poder usar cada pieza importante.**

Eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no agrega todavía `requests` ni `limits` a un `Deployment`, pero hace algo muy importante:

**prepara el siguiente refinamiento fuerte del bloque de Kubernetes.**

Ahora el foco ya no está solo en:

- si el servicio vive,
- si está listo,
- o si responde,

sino también en:

- cómo el cluster lo reserva,
- cómo lo ubica,
- y qué margen operativo le da.

Eso es una mejora fuerte en la madurez del entorno.

---

## Qué todavía no hicimos

Todavía no:

- agregamos valores concretos a los `Deployment`
- validamos el impacto de esos valores
- ni revisamos cómo queda el cluster después del cambio

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué `requests` y `limits` ya tienen sentido ahora.**

---

## Errores comunes en esta etapa

### 1. Pensar que `requests` y `limits` son solo un ajuste fino menor
En realidad cambian bastante la forma en que el cluster interpreta y sostiene los Pods.

### 2. Querer afinarlos de forma perfecta desde el primer intento
Para esta etapa, una primera aproximación razonable ya aporta mucho.

### 3. Aplicarlos demasiado pronto en el bloque
Ahora tienen sentido porque el entorno ya está bastante reconstruido.

### 4. Pensar que todos los servicios merecen exactamente el mismo tratamiento
Conviene empezar por las piezas más críticas.

### 5. No conectarlos con las probes y la salud operativa
Forman parte de la misma subida de nivel del entorno.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para empezar a definir `requests` y `limits` dentro de Kubernetes y qué problema operativo real vienen a resolver.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés el rol de `requests`,
- entendés el rol de `limits`,
- ves por qué no conviene dejar este tema completamente librado al azar,
- identificás qué piezas del sistema conviene tocar primero,
- y entendés por qué este refinamiento tiene sentido en este punto del bloque.

Si eso está bien, ya podemos pasar a aplicarlo en servicios concretos.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a agregar `requests` y `limits` a algunos servicios importantes de NovaMarket dentro del cluster.

Ese será el primer paso concreto para darle al entorno una política de recursos más madura.

---

## Cierre

En esta clase entendimos por qué `requests` y `limits` ya tienen sentido en NovaMarket dentro de Kubernetes.

Con eso, el bloque queda listo para seguir profesionalizando el entorno y pasar de un cluster funcional y bastante sano a uno que también empieza a pensar mejor el consumo y la reserva de recursos de sus piezas más importantes.
