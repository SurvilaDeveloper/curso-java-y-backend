---
title: "Validando order-service junto al núcleo funcional en el cluster"
description: "Checkpoint del bloque de Kubernetes en NovaMarket. Validación de order-service junto con catalog-service e inventory-service antes de reconstruir el circuito asincrónico completo."
order: 89
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Validando `order-service` junto al núcleo funcional en el cluster

En la clase anterior dimos uno de los pasos más importantes del bloque:

- llevamos `order-service` a Kubernetes,
- y con eso el cluster dejó de tener solo núcleo base e infraestructura funcional simple,
- para empezar a alojar también el servicio más central del flujo principal del negocio.

Eso ya es un avance enorme.

Pero, antes de seguir sumando piezas, conviene hacer un checkpoint muy importante:

**validar que `order-service` ya convive razonablemente bien con el núcleo funcional que construimos dentro del cluster.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- `order-service` vive razonablemente bien dentro del cluster,
- su relación básica con `inventory-service`, `catalog-service`, `config-server` y `discovery-server` ya es coherente,
- y el bloque de Kubernetes está listo para seguir avanzando hacia la reconstrucción del circuito principal y luego del circuito asincrónico.

Esta clase no busca todavía cerrar todo el flujo completo.  
Busca confirmar que la pieza más delicada del negocio ya no está “flotando sola” dentro del entorno.

---

## Estado de partida

Partimos de este contexto:

- el namespace `novamarket` ya existe,
- `config-server` y `discovery-server` ya fueron desplegados y validados,
- `catalog-service` ya vive dentro del cluster,
- `inventory-service` también,
- y ahora `order-service` ya tiene su propio Deployment y su propio Service.

Eso deja una base muy valiosa para hacer una validación más seria del corazón funcional del sistema.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar Pods y Services del núcleo funcional,
- mirar especialmente el estado de `order-service`,
- validar su arranque dentro del cluster,
- revisar señales de integración con el resto del ecosistema ya desplegado,
- y dejar claro si el entorno está listo para seguir ampliándose.

---

## Por qué esta clase importa tanto

Porque `order-service` no es un servicio más.

Es una pieza donde se cruzan muchas partes del curso:

- configuración centralizada
- discovery
- integración síncrona
- lógica del negocio
- y, más adelante, circuito asincrónico con eventos

Si esta pieza todavía no está bien plantada dentro del cluster, mover las siguientes solo va a sumar ruido.

Por eso esta clase funciona como un checkpoint muy importante del bloque.

---

## Paso 1 · Verificar el namespace

Como siempre, conviene arrancar confirmando que estamos trabajando dentro del namespace correcto:

```txt
novamarket
```

Puede parecer trivial, pero sostener esta disciplina ayuda muchísimo a mantener el bloque ordenado.

---

## Paso 2 · Revisar los Pods del núcleo funcional

Ahora revisá al menos estas piezas:

- `catalog-service`
- `inventory-service`
- `order-service`

Queremos confirmar que:

- los Pods existen,
- no están en estados evidentemente problemáticos,
- y el cluster ya sostiene una pequeña porción bastante representativa del sistema de negocio.

Este es un muy buen punto para mirar el bloque como conjunto, no solo servicio por servicio.

---

## Paso 3 · Revisar los Services del núcleo funcional

Ahora comprobá que existan y estén correctos los Services de:

- `catalog-service`
- `inventory-service`
- `order-service`

Esto importa muchísimo porque dentro del cluster esos Services ya empiezan a funcionar como puntos de acceso interno estables para la arquitectura.

No estamos validando todavía solo “recursos creados”, sino una topología funcional real.

---

## Paso 4 · Mirar logs de `order-service`

Este es el corazón de la clase.

Queremos observar en `order-service` cosas como:

- si arranca correctamente,
- si no entra en crash loop,
- si resuelve bien su entorno mínimo,
- y si no hay señales obvias de que el salto al cluster le haya roto dependencias importantes.

A esta altura del bloque, los logs de `order-service` valen muchísimo.

---

## Paso 5 · Mirar también logs de `inventory-service`

Como `order-service` depende funcionalmente de inventario, conviene revisar que `inventory-service` también siga sano y estable.

No hace falta todavía reconstruir el flujo completo de validación de stock dentro del cluster.  
Pero sí es muy útil verificar que la pieza de la que depende el núcleo del negocio esté bien parada.

---

## Paso 6 · Pensar qué ya existe dentro del cluster

A esta altura del bloque, dentro de Kubernetes ya tenemos:

### Núcleo base
- `config-server`
- `discovery-server`

### Capa funcional inicial
- `catalog-service`
- `inventory-service`

### Núcleo del flujo principal
- `order-service`

Eso significa que el cluster ya aloja una parte muy sustancial de NovaMarket.

Este punto es importante porque muestra que el bloque ya pasó claramente la fase introductoria.

---

## Paso 7 · Validar señales básicas de vida funcional si tu entorno lo permite

Si ya tenés una forma razonable de probar servicios dentro de tu entorno de Kubernetes, este es un buen momento para validar señales básicas de vida de `order-service`.

No hace falta todavía reconstruir el flujo protegido completo vía gateway ni resolver exposición externa total.  
La prioridad es confirmar que el servicio central del negocio ya está vivo de forma razonable dentro del cluster.

---

## Paso 8 · Pensar qué falta todavía para el flujo principal completo

Conviene ser muy explícitos con esto.

### Ya tenemos
- el núcleo base
- catálogo
- inventario
- órdenes

### Todavía falta
- la reconstrucción más fuerte del circuito completo
- `notification-service`
- y el tramo asincrónico con eventos dentro del cluster

Esto deja muy clara la secuencia de las próximas clases.

---

## Paso 9 · Comparar con el estado anterior del bloque

Antes de `order-service`, el cluster ya tenía piezas útiles.  
Pero ahora ya empieza a tener el servicio más representativo del flujo central del negocio.

Eso cambia muchísimo el peso real del entorno Kubernetes.

La arquitectura ya no está “empezando a parecerse al sistema”:  
**ya se parece bastante.**

Ese cambio vale mucho la pena notarlo.

---

## Qué estamos logrando con esta clase

Esta clase consolida el ingreso de `order-service` al cluster.

No agregamos un servicio nuevo, pero sí algo muy importante:

**confianza operativa** sobre una de las piezas más críticas del sistema dentro del nuevo entorno.

Eso prepara perfectamente el siguiente paso del bloque.

---

## Qué todavía no hicimos

Todavía no:

- llevamos `notification-service`
- reconstruimos el circuito asincrónico completo
- ni cerramos el flujo central de negocio dentro del cluster

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**asegurar que `order-service` ya está razonablemente bien parado junto al núcleo funcional del sistema.**

---

## Errores comunes en esta etapa

### 1. Querer cerrar todo el flujo del negocio demasiado pronto
Conviene validar bien la pieza central antes de seguir.

### 2. Mirar solo que el Pod existe y no revisar logs
En este servicio eso es especialmente riesgoso.

### 3. No pensar `order-service` en relación con inventario y el núcleo base
A esta altura del bloque ya hay que mirar más el ecosistema que la pieza aislada.

### 4. Confundir “Deployment creado” con “servicio listo para sostener el flujo”
No siempre es lo mismo.

### 5. Pensar que esta clase no agrega nada porque no crea un servicio nuevo
En realidad agrega una validación muy importante del bloque.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener validado que `order-service` ya forma parte razonablemente sana del ecosistema funcional desplegado en Kubernetes.

Eso deja al proyecto listo para empezar a reconstruir también el circuito asincrónico dentro del cluster.

---

## Punto de control

Antes de seguir, verificá que:

- `order-service` está sano,
- `inventory-service` también,
- los Services del núcleo funcional existen,
- los logs son razonables,
- y sentís que la base del flujo principal ya está suficientemente estable como para sumar la siguiente pieza.

Si eso está bien, ya podemos llevar `notification-service` a Kubernetes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a desplegar `notification-service` en Kubernetes.

Ese será un paso muy importante porque nos va a permitir empezar a reconstruir dentro del cluster el circuito asincrónico que ya veníamos trabajando en Compose.

---

## Cierre

En esta clase validamos `order-service` junto al núcleo funcional del cluster.

Con eso, NovaMarket consolida una parte muy importante de su arquitectura dentro de Kubernetes y queda perfectamente preparado para sumar la última pieza clave antes de reconstruir también la parte asincrónica del sistema.
