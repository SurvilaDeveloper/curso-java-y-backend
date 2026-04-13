---
title: "Validando el acceso al sistema a través de Ingress"
description: "Checkpoint del refinamiento de entrada en Kubernetes. Validación del acceso a NovaMarket usando Ingress y comparación con la estrategia de exposición previa."
order: 97
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Validando el acceso al sistema a través de `Ingress`

En la clase anterior dimos un paso importante dentro del bloque:

- creamos un recurso `Ingress`,
- lo conectamos con `api-gateway`,
- y dejamos al cluster con una capa de entrada más madura que la que veníamos usando antes.

Ahora toca el checkpoint natural de ese avance:

**validar el acceso al sistema a través de `Ingress`.**

Porque una cosa es tener el recurso escrito y aplicado.  
Y otra distinta es comprobar que realmente mejora o al menos reordena de una forma útil la forma en que entramos al sistema dentro de Kubernetes.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- el acceso al sistema mediante `Ingress` funciona razonablemente dentro del entorno,
- `api-gateway` sigue cumpliendo su rol como backend principal de entrada,
- y NovaMarket ya cuenta con una capa de acceso más madura dentro del cluster.

Además, esta clase debería dejar bastante clara la diferencia entre la estrategia de exposición simple anterior y esta nueva capa de entrada.

---

## Estado de partida

Partimos de este contexto:

- `api-gateway` ya vive dentro del cluster,
- su Service sigue existiendo,
- el recurso `Ingress` ya fue creado,
- y el sistema ya venía siendo validado antes a través de una exposición más simple.

Eso significa que ahora estamos en condiciones de hacer una comparación mucho más rica entre ambos enfoques.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el estado del `Ingress`,
- comprobar que `api-gateway` siga sano como backend,
- entrar al sistema a través de esta nueva capa,
- validar rutas importantes,
- y comparar esta experiencia con la del acceso simple anterior.

---

## Por qué esta clase vale tanto

Porque ya no estamos hablando solo de exponer un puerto o llegar al gateway.

Ahora estamos hablando de:

**la forma en que el sistema se presenta hacia afuera dentro de Kubernetes.**

Ese cambio es muy importante.

La entrada deja de ser solo una solución útil para pruebas y empieza a convertirse en una parte más madura de la arquitectura del entorno.

---

## Paso 1 · Verificar que el `Ingress` existe y está en el namespace correcto

Antes de hacer cualquier prueba, conviene confirmar que:

- el recurso fue aplicado correctamente
- y está dentro del namespace `novamarket`

Este paso parece simple, pero ayuda bastante a evitar confusiones tempranas.

---

## Paso 2 · Verificar que `api-gateway` sigue sano

Como el `Ingress` depende del gateway como backend, conviene confirmar que:

- el Pod de `api-gateway` sigue arriba
- su Service sigue correcto
- y no hay señales obvias de una degradación del backend

La idea es no atribuirle al `Ingress` un problema que en realidad venga de la pieza a la que apunta.

---

## Paso 3 · Confirmar el acceso a través del host o regla definida

Ahora usá la regla de entrada que definiste en la clase anterior.

La idea es comprobar que ya podés entrar al sistema por la nueva capa declarativa de acceso y no solo por la estrategia directa previa.

No hace falta arrancar con una prueba compleja.  
Primero queremos confirmar que la nueva puerta de entrada efectivamente abre.

---

## Paso 4 · Probar una ruta pública simple

Igual que hicimos antes con el gateway expuesto de forma más directa, conviene empezar con una ruta simple.

Por ejemplo, una ruta pública del catálogo si forma parte del recorrido actual.

La idea es comprobar que:

- el `Ingress` enruta correctamente
- y el gateway sigue resolviendo el acceso al backend apropiado

Este primer test es muy valioso porque valida la cadena más básica de la nueva capa.

---

## Paso 5 · Probar el flujo principal entrando por `Ingress`

Ahora sí, conviene usar la nueva puerta de entrada para ejecutar una orden válida o algún recorrido equivalente del flujo principal del negocio.

La idea es repetir el checkpoint fuerte de clases anteriores, pero ahora usando:

- `Ingress`
- como capa de entrada
- hacia el gateway
- y luego hacia el resto del ecosistema

Este es probablemente el momento más importante de la clase.

---

## Paso 6 · Revisar logs de `api-gateway`

Ahora mirá el gateway.

Queremos ver que:

- la request efectivamente llegó por la nueva capa de entrada,
- el gateway sigue actuando como backend principal del acceso,
- y la transición desde `Ingress` hacia el sistema interno se comporta de forma razonable.

Esto ayuda muchísimo a entender que no estamos “saltando” el gateway, sino dándole una capa mejor organizada por delante.

---

## Paso 7 · Revisar el resto del recorrido si corresponde

Si el flujo que probaste activa:

- `order-service`
- `inventory-service`
- y eventualmente `notification-service`

este es un gran momento para revisar también sus señales de vida o resultados observables.

La idea es comprobar que el uso de `Ingress` no es solo una mejora estética en la entrada, sino que realmente sostiene el acceso al sistema completo.

---

## Paso 8 · Comparar con la estrategia de exposición anterior

Este punto es muy importante.

Una comparación útil sería algo así:

### Exposición anterior
- rápida
- simple
- muy útil para pruebas iniciales
- pero más cruda como capa de entrada

### `Ingress`
- más declarativo
- más alineado con Kubernetes
- mejor para modelar cómo se entra al sistema
- y más cercano a una arquitectura de acceso madura

No se trata de decir que lo anterior estuvo mal.  
Se trata de ver por qué esta nueva capa tiene sentido ahora.

---

## Paso 9 · Pensar qué ya logramos dentro del cluster

A esta altura del bloque, el cluster ya tiene:

- núcleo base
- capa funcional importante
- circuito asincrónico relevante
- gateway
- y una capa de entrada más madura con `Ingress`

Eso ya convierte al entorno Kubernetes en algo mucho más que un ejercicio de despliegue por piezas.

Empieza a parecerse bastante a una reconstrucción seria del sistema.

---

## Paso 10 · Identificar qué todavía falta si quisiéramos seguir madurando este tramo

También conviene reconocer que todavía podrían venir refinamientos como:

- reglas de entrada más ricas
- varios hosts
- TLS
- estrategias más avanzadas de exposición
- o una capa aún más pulida de operación

Eso está bien.

La meta de hoy es más concreta:

**validar que `Ingress` ya mejora razonablemente la entrada al sistema dentro del cluster.**

---

## Qué estamos logrando con esta clase

Esta clase cierra de forma muy fuerte el refinamiento de la capa de entrada del bloque de Kubernetes.

Ya no solo tenemos:

- gateway desplegado
- y un acceso simple utilizable

Ahora también tenemos:

- una entrada declarativa más madura
- y validada de forma real contra el sistema

Eso le da muchísimo más peso al entorno.

---

## Qué todavía no hicimos

Todavía no:

- cerramos por completo todo el roadmap de Kubernetes
- ni convertimos este entorno en una configuración final de producción

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**demostrar que NovaMarket ya puede entrar por una capa de acceso más madura dentro de Kubernetes.**

---

## Errores comunes en esta etapa

### 1. Validar solo que el `Ingress` existe y no recorrer un flujo real
Esta clase vale por el recorrido completo.

### 2. Confundir un problema del backend con uno del `Ingress`
Por eso es tan importante revisar también el gateway.

### 3. Pensar que `Ingress` vuelve innecesario al gateway
En este diseño siguen cumpliendo roles distintos.

### 4. No comparar explícitamente con la estrategia anterior
Ese contraste ayuda muchísimo a entender el avance.

### 5. Esperar cerrar aquí toda la operación madura del sistema
Este es un checkpoint fuerte, no necesariamente el final absoluto del bloque.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías haber validado que el acceso al sistema a través de `Ingress` funciona razonablemente y que NovaMarket ya tiene dentro de Kubernetes una capa de entrada más madura que la que venía usando antes.

Eso representa un avance muy importante del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- el `Ingress` existe y funciona,
- el gateway sigue sano,
- una ruta simple responde,
- el flujo principal puede recorrerse entrando por esta nueva capa,
- y entendés por qué esta estrategia mejora la entrada del sistema dentro del cluster.

Si eso está bien, entonces el bloque de Kubernetes ya alcanzó un nivel de reconstrucción realmente muy fuerte.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a consolidar todo lo construido en Kubernetes, revisando qué partes del sistema ya quedaron reconstruidas y qué refinamientos adicionales tendría sentido abordar después.

---

## Cierre

En esta clase validamos el acceso al sistema a través de `Ingress`.

Con eso, NovaMarket ya no solo vive de forma importante dentro del cluster: también empieza a contar con una capa de entrada más madura, más declarativa y mejor alineada con la forma en que Kubernetes suele organizar el acceso al sistema.
