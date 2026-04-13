---
title: "Entendiendo el paso de NodePort a Ingress"
description: "Inicio del siguiente refinamiento del bloque de Kubernetes en NovaMarket. Comprensión del salto desde una exposición simple del gateway hacia una capa de entrada más madura basada en Ingress."
order: 95
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Entendiendo el paso de `NodePort` a `Ingress`

En las clases anteriores del bloque de Kubernetes logramos algo muy importante:

- `api-gateway` ya vive dentro del cluster,
- definimos una forma razonable de acceder a él,
- y además validamos el flujo principal del negocio entrando por la puerta natural del sistema dentro del nuevo entorno.

Eso ya tiene muchísimo valor.

Pero ahora aparece una pregunta muy natural:

**¿cómo seguimos madurando la capa de entrada del sistema dentro de Kubernetes?**

Porque una cosa es resolver el acceso con una estrategia simple, práctica y suficiente para pruebas, como puede ser `NodePort` o una exposición equivalente de laboratorio.

Y otra bastante distinta es empezar a pensar una capa de entrada más propia del mundo Kubernetes:

**Ingress**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- entendido por qué `NodePort` fue útil pero no es el punto final del bloque,
- clara la diferencia conceptual entre exponer el gateway y definir una capa de entrada más rica,
- alineado el modelo mental del curso para empezar a trabajar con Ingress,
- y preparado el terreno para aplicarlo a NovaMarket en las próximas clases.

Todavía no vamos a crear el recurso de Ingress.  
La meta de hoy es entender bien el salto antes de implementarlo.

---

## Estado de partida

Partimos de un cluster donde ya viven:

- `config-server`
- `discovery-server`
- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`
- `api-gateway`

Además:

- el gateway ya fue expuesto de una forma razonable para el entorno local,
- y el flujo principal ya pudo validarse entrando por esa capa.

Eso significa que el sistema ya tiene una puerta de entrada funcional dentro de Kubernetes.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué resuelve y qué no resuelve una exposición simple como `NodePort`,
- entender qué agrega `Ingress`,
- pensar cómo se adapta mejor a una arquitectura como NovaMarket,
- y dejar clara la estrategia de entrada que vamos a construir después.

---

## Qué problema queremos resolver exactamente

Hasta ahora, el gateway ya puede ser accesible.  
Eso está muy bien.

Pero esa estrategia todavía puede sentirse:

- demasiado rudimentaria,
- demasiado orientada a pruebas puntuales,
- o poco expresiva para modelar una entrada más rica al sistema.

Lo que buscamos ahora es empezar a pensar algo más alineado con cómo Kubernetes suele organizar el acceso de entrada:

- reglas más claras,
- capa de entrada más declarativa,
- y mejor separación entre servicios internos y exposición externa.

Ese cambio lo introduce `Ingress`.

---

## Qué resuelve `NodePort` y por qué igual fue útil

Conviene decirlo explícitamente:

`NodePort` no estuvo mal.  
Al contrario, fue una muy buena solución para esta etapa del curso porque nos permitió:

- exponer rápido el gateway,
- probar el flujo principal,
- y validar que el sistema ya podía usarse entrando por su puerta natural dentro del cluster.

Ese paso fue muy valioso.

Lo que pasa es que ahora estamos en otro momento del bloque, y por eso tiene sentido ir un poco más allá.

---

## Qué limitaciones empieza a mostrar una exposición simple

A medida que el entorno madura, una estrategia simple puede empezar a quedar corta en cosas como:

- claridad de entrada del sistema
- modelado de hosts o rutas
- escalabilidad de la capa de acceso
- o prolijidad de la arquitectura de entrada

No hace falta que todas esas limitaciones se vuelvan críticas hoy.  
Pero sí conviene empezar a verlas para entender por qué `Ingress` tiene sentido en este punto del roadmap.

---

## Qué es lo importante de `Ingress` en este curso

Para esta etapa del curso práctico, lo más importante no es memorizar una definición abstracta, sino entender esto:

**Ingress nos permite describir de forma más natural cómo se entra al sistema dentro de Kubernetes.**

Eso significa que empezamos a pensar en:

- reglas de entrada
- rutas
- servicios destino
- y una capa más expresiva entre el exterior y los Services internos del cluster

Ese lenguaje se parece mucho más a una arquitectura de entrada real.

---

## Paso 1 · Separar mentalmente servicio interno y capa de entrada

Este es uno de los puntos más importantes de la clase.

Hasta ahora, `api-gateway` ya tiene su Service.  
Eso está perfecto.

Pero el Service no necesariamente tiene que seguir cargando también con toda la responsabilidad de exposición de entrada al exterior.

Con `Ingress`, empezamos a pensar algo mucho más limpio:

- el Service sigue representando el acceso interno al gateway
- y el Ingress se convierte en la capa declarativa de entrada al sistema

Esa separación conceptual vale muchísimo.

---

## Paso 2 · Entender por qué esto encaja tan bien con NovaMarket

NovaMarket ya tiene un `api-gateway` que centraliza buena parte de la entrada al sistema.

Eso significa que el stack ya tiene una arquitectura de acceso bastante clara:

- los clientes entran por el gateway
- y el gateway organiza el resto del recorrido

Lo natural ahora es que Kubernetes también pueda expresar esa entrada de una forma más rica y más coherente.

Por eso `Ingress` encaja muy bien en este punto del curso.

---

## Paso 3 · Pensar qué NO estamos resolviendo todavía

Conviene ser muy explícitos con esto.

En este punto del bloque no estamos intentando todavía resolver todo lo relacionado con:

- producción completa
- TLS real de punta a punta
- múltiples dominios complejos
- o reglas avanzadísimas de entrada

Eso puede venir después.

La meta ahora es mucho más concreta:

**pasar de una exposición simple a una entrada más madura y más propia del mundo Kubernetes.**

---

## Paso 4 · Pensar el rol del host y las rutas

A esta altura del bloque ya empieza a tener más sentido pensar cosas como:

- una entrada por host lógico
- una ruta base
- o una forma más declarativa de decir “todo esto entra por acá y termina en el gateway”

Ese tipo de modelado es justamente una de las cosas que vuelve valioso a `Ingress` frente a una exposición más cruda.

---

## Paso 5 · Entender el rol del Ingress Controller

Este punto conviene mencionarlo aunque sea sin profundizar demasiado todavía.

Un recurso `Ingress` por sí solo no “hace magia” automáticamente.  
Necesita una capa que lo implemente operativamente dentro del cluster:

**un Ingress Controller**

No hace falta que esta clase se convierta todavía en una implementación completa de ese controlador.  
Pero sí es importante entender que el recurso declarativo vive en relación con una pieza que interpreta esas reglas.

---

## Paso 6 · Pensar la secuencia lógica del bloque

A partir de esta clase, una secuencia razonable del siguiente tramo queda bastante clara:

1. entender el salto conceptual  
2. crear el recurso `Ingress` para NovaMarket  
3. apuntarlo al `api-gateway`  
4. validar el acceso por esta nueva capa  
5. y comparar el resultado con la exposición simple previa  

Este mapa ayuda muchísimo a sostener la coherencia del curso.

---

## Paso 7 · Comparar mentalmente `NodePort` e `Ingress`

Sin necesidad de volver esto una tabla rígida, una comparación útil sería esta:

### `NodePort`
- simple
- rápido
- muy bueno para pruebas directas
- pero más crudo como capa de entrada

### `Ingress`
- más expresivo
- más alineado con Kubernetes
- mejor para modelar entrada
- y más cercano a una arquitectura de acceso madura

Ese contraste es exactamente lo que queremos instalar con esta clase.

---

## Paso 8 · Entender por qué no hicimos esto antes

Este punto también vale mucho.

No conviene introducir `Ingress` demasiado pronto si todavía:

- el gateway ni siquiera vive en el cluster
- el sistema no es accesible
- o la capa funcional todavía no está reconstruida

Ahora, en cambio, ya tenemos:

- gateway desplegado
- acceso funcional
- y flujo principal validado

Por eso este paso tiene mucho más sentido ahora.

---

## Qué estamos logrando con esta clase

Esta clase no crea todavía el recurso `Ingress`, pero hace algo muy importante:

**ordena el próximo salto del bloque de Kubernetes sin romper la coherencia del curso.**

Eso importa muchísimo, porque evita que `Ingress` aparezca como “otra cosa más” y lo convierte en la evolución natural de lo que ya construimos.

---

## Qué todavía no hicimos

Todavía no:

- escribimos el manifest de `Ingress`
- lo conectamos al `api-gateway`
- ni validamos el sistema entrando por esta nueva capa

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender bien el paso de una exposición simple a una capa de entrada más madura.**

---

## Errores comunes en esta etapa

### 1. Pensar que `Ingress` reemplaza totalmente al gateway
No; en este bloque el gateway sigue siendo la puerta de entrada lógica del sistema.

### 2. Creer que `NodePort` estuvo mal
En realidad fue una gran solución para el momento anterior del curso.

### 3. Querer resolver producción completa con `Ingress` de golpe
Todavía no estamos en ese nivel del bloque.

### 4. No separar mentalmente Service interno y capa de entrada
Ese cambio conceptual es clave.

### 5. Meter `Ingress` sin entender por qué ahora sí tiene sentido
Esta clase justamente existe para ordenar eso.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para pasar de una exposición simple del gateway a una capa de entrada más madura basada en `Ingress`.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés por qué `NodePort` fue útil,
- entendés qué agrega `Ingress`,
- ves el valor de separar Service interno y capa de entrada,
- y tenés claro cuál va a ser el siguiente paso práctico del bloque.

Si eso está bien, ya podemos escribir el primer recurso `Ingress` de NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a crear el recurso `Ingress` y a conectarlo con `api-gateway`.

Ese será el primer paso concreto para darle al sistema una capa de entrada más madura dentro de Kubernetes.

---

## Cierre

En esta clase entendimos el paso de una exposición simple del gateway hacia una capa de entrada más rica con `Ingress`.

Con eso, NovaMarket queda perfectamente preparado para seguir madurando su entrada al sistema dentro de Kubernetes sin perder la coherencia que venimos construyendo a lo largo de todo el bloque.
