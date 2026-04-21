---
title: "Cerrando el primer bloque de API Gateway con una síntesis operativa"
description: "Checkpoint de cierre del primer gran tramo rehecho de API Gateway. Síntesis operativa de lo que ganó NovaMarket al incorporar correctamente Gateway, Eureka y LoadBalancer."
order: 43
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Cerrando el primer bloque de API Gateway con una síntesis operativa

En las últimas clases del módulo de API Gateway hicimos un recorrido bastante más fuerte y bastante más correcto que el que teníamos antes:

- entendimos por qué el gateway no debería enrutar usando puertos fijos,
- incorporamos correctamente la idea de **Load Balancer** dentro de la arquitectura,
- distinguimos el modelo de **client-side load balancing**,
- integramos **Spring Cloud LoadBalancer** en `api-gateway`,
- configuramos rutas reales con `lb://`,
- levantamos múltiples instancias de `inventory-service`,
- observamos reparto de tráfico,
- y además consolidamos un mapa bastante útil de errores frecuentes del bloque.

Eso ya tiene muchísimo valor.

Y justamente por eso ahora conviene hacer algo importante:

**cerrar este primer gran bloque del gateway con una síntesis operativa clara.**

Porque una cosa es haber hecho varias mejoras por separado.  
Y otra bastante distinta es detenerse a leer qué postura nueva ganó realmente NovaMarket después de este tramo rehecho.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más claro qué ganó NovaMarket con este primer gran tramo de Gateway + Eureka + LoadBalancer,
- visible qué cambió en la arquitectura respecto del estado anterior,
- entendida la diferencia entre el gateway “recién creado” y el gateway ya integrado de forma seria,
- y consolidado el valor de este bloque como base fuerte para lo que viene después dentro del módulo.

La meta de hoy no es agregar una tecnología nueva.  
La meta es mucho más concreta: **leer con claridad qué cambió realmente en NovaMarket después de rehacer este bloque del gateway**.

---

## Estado de partida

Si miramos dónde estaba el proyecto antes de este bloque rehecho, la situación era bastante más limitada:

- `api-gateway` existía o estaba por existir como punto de entrada,
- pero todavía faltaba explicar con claridad cómo debía resolver servicios,
- cómo debía integrarse con discovery,
- y por qué un gateway serio no debería quedarse atado a puertos fijos.

Eso hacía que la arquitectura tuviera todavía un hueco importante justo en un punto clave.

Este bloque vino a cerrar precisamente ese hueco.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- recorrer las ganancias arquitectónicas más importantes del bloque,
- sintetizar qué nueva postura ganó NovaMarket en su punto de entrada,
- entender qué todavía no resolvimos,
- y dejar este tramo cerrado como base sólida antes de abrir el siguiente frente del gateway.

---

## Qué queremos resolver exactamente

Queremos evitar un cierre flojo del tipo:

- “ya vimos gateway y load balancer”

y reemplazarlo por algo bastante más fuerte:

- “NovaMarket ahora tiene un punto de entrada mucho menos ingenuo, apoyado en discovery, rutas por nombre lógico y capacidad real de repartir tráfico entre instancias”

Ese cambio de lectura es el corazón de esta clase.

---

## Paso 1 · Reconocer la primera gran mejora: el gateway dejó de pensar en puertos fijos

Una de las ganancias más importantes de este bloque es que `api-gateway` dejó de estar conceptualmente atado a cosas como:

```txt
http://localhost:8081
http://localhost:8082
http://localhost:8083
```

Eso importa muchísimo.

Porque una vez que el gateway deja de pensar en direcciones rígidas y pasa a pensar en:

- `catalog-service`
- `inventory-service`
- `order-service`

su lugar dentro de la arquitectura cambia por completo.

Ya no es solo un proxy manual.  
Empieza a comportarse como una pieza mucho más alineada con microservicios reales.

---

## Paso 2 · Reconocer la segunda gran mejora: discovery y balanceo quedaron correctamente conectados

Antes de este bloque, discovery podía quedar medio entendido como algo aislado:

- “los servicios se registran”
- y poco más

Ahora, en cambio, quedó bastante más claro que:

- Eureka registra y expone instancias,
- el gateway consume nombres lógicos,
- y Spring Cloud LoadBalancer selecciona una instancia concreta para el request.

Ese encadenamiento importa muchísimo porque convierte a discovery en algo verdaderamente útil dentro del punto de entrada del sistema.

---

## Paso 3 · Reconocer la tercera gran mejora: el gateway ya enruta de verdad con `lb://`

Otra mejora muy fuerte del bloque fue que el gateway dejó de ser una pieza “lista para más adelante” y pasó a tener rutas reales funcionando.

Eso se vio cuando configuramos rutas del tipo:

- `/catalog/**`
- `/inventory/**`
- `/order-api/**`

apuntando a URIs como:

```txt
lb://catalog-service
lb://inventory-service
lb://order-service
```

Ese cambio es enorme, porque desde ahí el sistema ya no solo existe:  
**se entra por un punto de entrada único y funcional**.

---

## Paso 4 · Reconocer la cuarta gran mejora: el balanceo dejó de ser una promesa abstracta

Este punto vale muchísimo.

Una cosa es decir:

- “si algún día hubiera varias instancias, el sistema podría balancear”

Y otra muy distinta es:

- levantar múltiples instancias reales,
- verlas registradas bajo el mismo nombre lógico,
- y observar que distintas requests pueden llegar a procesos distintos.

Eso fue exactamente lo que logramos en este bloque.

Y eso convierte al tema de Load Balancer en algo mucho más serio dentro del curso.

---

## Paso 5 · Reconocer la quinta gran mejora: el gateway dejó de ser una caja negra

Otra ganancia muy fuerte fue esta:

ya no vemos al gateway solo como una pieza que “más o menos enruta”.

Ahora ya entendemos bastante mejor:

- cómo matchea paths,
- cómo traduce path público en path interno,
- cómo se apoya en discovery,
- cómo participa el balanceo,
- y qué errores típicos suelen romper ese bloque.

Ese conocimiento operativo vale muchísimo más que haber copiado una configuración que simplemente funciona.

---

## Paso 6 · Entender qué tipo de postura ganó NovaMarket en su punto de entrada

Este es probablemente el punto más importante de toda la clase.

Después de este bloque rehecho, NovaMarket no quedó:

- con un gateway ultra avanzado,
- ni con seguridad final aplicada en el borde,
- ni con toda la historia de filtros y resiliencia ya cerrada.

Pero sí quedó claramente mejor en algo muy valioso:

**su punto de entrada dejó de ser ingenuo.**

Y eso se nota porque ahora el gateway es:

- menos manual,
- menos rígido,
- menos acoplado a puertos,
- más alineado con discovery,
- y más preparado para tráfico repartido entre múltiples instancias reales.

Ese es el corazón del cambio.

---

## Paso 7 · Comparar el antes y el después del bloque

Si miramos el antes y el después, la evolución es bastante clara.

### Antes del bloque rehecho
- gateway creado o en preparación
- poca claridad sobre el rol del balanceo
- mucha tentación de usar direcciones fijas
- discovery todavía poco integrado al punto de entrada

### Después del bloque rehecho
- gateway funcional
- rutas reales con `lb://`
- servicios resueltos por nombre lógico
- múltiples instancias observables
- reparto de tráfico visible
- y un mapa bastante más sólido de cómo diagnosticar errores

Ese salto pesa muchísimo.

---

## Paso 8 · Entender qué todavía no resolvimos

También conviene dejar algo claro.

Cerrar bien este primer bloque del gateway no significa fingir que ya no queda nada por hacer.

Todavía siguen existiendo muchos pasos posibles, por ejemplo:

- filtros globales y por ruta,
- headers de trazabilidad,
- pre y post processing más claro,
- seguridad en el borde,
- rate limiting,
- retries,
- o estrategias más ricas de observabilidad del gateway.

Eso está bien.

La meta de este bloque nunca fue resolverlo todo.  
Fue sacar al gateway de una postura demasiado básica y dejarlo en un estado mucho más coherente con el resto de NovaMarket.

Y eso sí se logró muy bien.

---

## Paso 9 · Pensar por qué este bloque mejora muchísimo lo que viene después

Este punto importa mucho.

A partir de ahora, cualquier siguiente evolución del gateway va a apoyarse sobre una base bastante mejor, porque ya no estamos trabajando con:

- un gateway teórico,
- o un gateway rígido,
- o un gateway que apenas existe.

Ahora estamos trabajando sobre:

- un punto de entrada real,
- apoyado en discovery,
- con rutas funcionales,
- y con balanceo visible entre instancias reales.

Eso hace que cualquier siguiente paso tenga mucho más sentido.

---

## Qué estamos logrando con esta clase

Esta clase cierra el primer gran tramo rehecho de API Gateway con una síntesis operativa clara y fuerte.

Ya no estamos solo recordando temas.  
También estamos dejando una lectura bastante madura de cómo cambió realmente el punto de entrada de NovaMarket.

Eso es un cierre muy importante.

---

## Qué todavía podría venir después dentro del módulo

Después de este bloque todavía podrían venir varias cosas, por ejemplo:

- filtros del gateway,
- trazabilidad más visible,
- manipulación de headers,
- autenticación en el borde,
- o refinamientos sobre el acceso público al sistema.

Pero eso ya pertenece al siguiente tramo del módulo.

La meta de hoy es mucho más concreta:

**cerrar bien este primer bloque del gateway como una mejora real y coherente del proyecto.**

---

## Errores comunes en esta etapa

### 1. Pensar que este bloque solo “agregó Load Balancer”
En realidad cambió bastante la postura general del punto de entrada.

### 2. Reducir el valor del bloque a una suma de configuraciones
El valor real está en la arquitectura que dejó instalada.

### 3. No reconocer el cambio entre gateway rígido y gateway apoyado en discovery
Ese contraste es central.

### 4. Exagerar lo logrado
Todavía falta mucho dentro del módulo de gateway, aunque este primer bloque ya sea muy fuerte.

### 5. No usar este cierre como base para lo que viene después
Eso le quitaría mucha coherencia al resto del módulo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión mucho más clara de qué ganó NovaMarket después de este primer gran tramo rehecho del gateway y por qué ese cambio ya representa una mejora real y bastante fuerte del proyecto.

Eso deja muy bien preparado el siguiente frente del módulo.

---

## Punto de cierre

Antes de seguir, verificá que:

- entendés qué cambió en el rol del gateway,
- ves que discovery y balanceo ya quedaron realmente integrados,
- entendés qué cosas sí mejoraron y cuáles todavía quedan abiertas,
- y sentís que este bloque ya dejó una base fuerte para seguir construyendo el punto de entrada de NovaMarket.

Si eso está bien, entonces este primer tramo rehecho del gateway ya quedó bien cerrado.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a entender por qué los filtros del gateway ya tienen sentido como siguiente evolución natural del módulo y cómo pueden ayudarnos a seguir profesionalizando la entrada al sistema.

---

## Cierre

En esta clase cerramos el primer bloque de API Gateway con una síntesis operativa.

Con eso, NovaMarket deja este tramo del roadmap rehecho con un punto de entrada bastante más serio, bastante menos rígido y mucho mejor alineado con discovery, balanceo y múltiples instancias reales dentro de la arquitectura.
