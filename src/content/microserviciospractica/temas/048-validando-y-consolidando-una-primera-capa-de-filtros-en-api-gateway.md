---
title: "Validando y consolidando una primera capa de filtros en api-gateway"
description: "Checkpoint del nuevo tramo del módulo 6. Validación y consolidación de una primera capa básica de filtros globales y por ruta en el gateway de NovaMarket."
order: 48
module: "Módulo 6 · API Gateway"
level: "intermedio"
draft: false
---

# Validando y consolidando una primera capa de filtros en `api-gateway`

En las últimas clases del módulo 6 dimos otro paso importante de madurez dentro del gateway:

- entendimos por qué los filtros ya tenían sentido,
- aplicamos un primer filtro global simple,
- distinguimos filtros globales de filtros por ruta,
- y además incorporamos un primer filtro visible específico sobre `order-api`.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer, otra vez, lo que venimos haciendo cada vez que el proyecto gana una nueva capa de madurez:

**un checkpoint de consolidación.**

Porque una cosa es haber agregado un par de filtros.  
Y otra bastante distinta es detenerse a mirar qué significa realmente eso para el rol del gateway dentro de NovaMarket.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- `api-gateway` ya cuenta con una primera capa real de filtros,
- esa capa aporta valor genuino al sistema,
- y NovaMarket ya empezó a tratar su punto de entrada no solo como enroutador, sino también como pieza de procesamiento transversal con distintos niveles de intervención.

Esta clase funciona como checkpoint fuerte del nuevo tramo del módulo 6.

---

## Estado de partida

Partimos de un sistema donde ya:

- el gateway enruta correctamente,
- discovery y balanceo ya están bien integrados,
- existe un filtro global simple,
- y además una ruta específica del sistema ya tiene un tratamiento adicional propio.

Eso significa que ya no estamos discutiendo una hipótesis.

Ahora estamos leyendo una mejora real sobre cómo el punto de entrada del sistema participa en el tráfico.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el valor estructural de esta primera capa de filtros,
- consolidar cómo se relaciona con el gateway ya construido,
- validar qué cambia en la madurez general del proyecto,
- y dejar esta nueva capa como base estable para lo que venga después.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si hay headers extra”.

Queremos observar algo más interesante:

- si NovaMarket ya empezó a comportarse como un sistema donde el gateway no solo enruta, sino que también procesa tráfico con criterio,
- si ya existe una primera diferencia clara entre comportamiento transversal y comportamiento específico,
- y si el módulo 6 ya ganó una nueva base concreta después del bloque de rutas, discovery y balanceo.

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Volver sobre el recorrido de esta etapa

Antes de entrar en detalles, conviene fijar la secuencia que construimos:

- primero cerramos el primer gran bloque rehecho del gateway,
- después entendimos por qué los filtros ya tenían sentido,
- aplicamos un primer filtro global,
- distinguimos el enfoque global del específico,
- y luego agregamos un primer filtro visible por ruta.

Ese encadenamiento importa mucho porque muestra que este tramo no apareció aislado, sino como una evolución natural del punto de entrada que ya veníamos profesionalizando.

---

## Paso 2 · Consolidar la relación entre ruteo y procesamiento transversal

Este es uno de los puntos más importantes de toda la clase.

A esta altura ya conviene poder decir algo como:

- enrutar correctamente fue clave,
- discovery y balanceo mejoraron mucho el gateway,
- pero los filtros agregan otra capa muy importante:
- el gateway ya no solo decide a dónde va la request, también empieza a intervenir en su paso.

Ese cambio es uno de los mayores saltos cualitativos del módulo 6.

---

## Paso 3 · Entender qué valor tiene haber empezado por filtros simples y visibles

También vale mucho notar que no empezamos por filtros complejos.

Empezamos por cosas como:

- logs simples,
- headers visibles,
- y una diferencia clara entre comportamiento global y comportamiento por ruta.

Eso le da muchísimo valor pedagógico y técnico al bloque.

¿Por qué?

Porque hace que la nueva capacidad del gateway se entienda con mucha claridad antes de llenarla de sofisticación.

Ese criterio de empezar por algo simple fue una gran decisión.

---

## Paso 4 · Revisar qué cambió en la madurez del gateway

A esta altura conviene fijar algo importante:

antes, el gateway ya era un punto de entrada funcional, apoyado en discovery y balanceo.

Ahora, en cambio, además empieza a tener una noción más clara de que:

- no todo tráfico debe pasar “intacto”,
- algunas marcas o transformaciones pueden aplicarse de forma transversal,
- y otras pueden aplicarse de manera más puntual sobre rutas concretas.

Ese cambio vuelve al gateway bastante más serio como pieza arquitectónica.

---

## Paso 5 · Entender qué todavía no está resuelto

También conviene dejar algo claro:

después de este checkpoint todavía siguen existiendo muchos pasos posibles, por ejemplo:

- filtros más ricos de trazabilidad,
- manipulación más fina de headers,
- controles previos más complejos,
- seguridad del borde,
- o incluso políticas más avanzadas por ruta.

Eso está bien.

La meta de esta etapa nunca fue cerrar toda la historia de filtros del gateway.  
Fue empezar con algo real, útil y muy visible.

Y eso sí se logró muy bien.

---

## Paso 6 · Pensar por qué esto mejora el resto del módulo

Este punto importa mucho.

A partir de ahora, cualquier siguiente paso sobre seguridad, trazabilidad o reglas del borde del sistema va a ser mucho más fácil de sostener porque ya existe una primera referencia concreta de cómo se ve el gateway cuando deja de ser solo un enroutador y empieza a procesar tráfico de forma explícita.

Eso significa que esta clase no solo cierra una etapa.  
También prepara muy bien todo lo que viene después.

---

## Paso 7 · Comparar el gateway actual con el del comienzo del bloque rehecho

Si miramos el recorrido hasta acá, la evolución ya empieza a verse bastante clara:

### Antes
- gateway creado
- ruteo todavía poco maduro
- poco comportamiento visible en el borde

### Ahora
- gateway funcional
- discovery y balanceo integrados
- rutas reales
- múltiples instancias visibles
- y además una primera capa explícita de filtros globales y por ruta

Ese cambio vale muchísimo porque ya mueve a NovaMarket hacia una postura bastante más madura también en el borde del sistema.

---

## Paso 8 · Entender qué NO estamos afirmando todavía

Conviene dejar esto muy claro.

En este punto todavía no estamos diciendo:

- que NovaMarket ya tiene una estrategia completa de filtros del gateway,
- ni que todo el tráfico del borde quedó perfectamente modelado,
- ni que el sistema ya alcanzó una postura final de procesamiento transversal.

Eso sería exagerado.

Lo que sí podemos decir con bastante honestidad es algo mucho más valioso:

- NovaMarket ya dejó de tratar al gateway como una pieza que solo enruta requests por defecto.

Y eso ya es un avance muy fuerte.

---

## Qué estamos logrando con esta clase

Esta clase consolida una primera capa real de filtros en `api-gateway`.

Ya no estamos solo enroutando con nombres lógicos y balanceo.  
Ahora también estamos mostrando que el punto de entrada empieza a procesar tráfico con criterio, tanto de forma global como específica por ruta.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- abrimos el siguiente frente del módulo 6,
- ni decidimos todavía cuál será la próxima prioridad concreta dentro de la evolución del gateway.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**validar y consolidar la primera capa básica de filtros del gateway como una ganancia real del proyecto.**

---

## Errores comunes en esta etapa

### 1. Pensar que esta etapa solo “agregó headers”
En realidad cambió bastante el rol del gateway dentro del sistema.

### 2. Reducir el valor del bloque a un efecto visible de la response
El valor real está en la capacidad nueva que quedó instalada.

### 3. Tratar filtros globales y por ruta como si fueran lo mismo
La diferencia entre ambos es justamente parte central del aprendizaje.

### 4. Exagerar lo logrado
Todavía estamos en una primera capa, no en una estrategia final de borde.

### 5. No consolidar este paso antes de abrir el siguiente frente
Eso haría más difícil sostener la lógica del módulo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión bastante más clara de cómo una primera capa de filtros mejora la postura general del gateway y por qué esta evolución ya representa una madurez real dentro de NovaMarket.

Eso deja muy bien preparado el siguiente tramo del módulo 6.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué hace el filtro global,
- entendés qué agrega el filtro por ruta,
- ves que ambos conviven pero resuelven problemas distintos,
- y sentís que el gateway ya ganó una nueva capa concreta de madurez desde procesamiento transversal.

Si eso está bien, entonces este bloque ya puede pasar al siguiente frente con una base mucho más fuerte.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a decidir cuál es la siguiente evolución más razonable del gateway dentro de NovaMarket: profundizar trazabilidad visible, enriquecer headers o empezar a acercarnos a una primera capa de seguridad en el borde del sistema.

---

## Cierre

En esta clase validamos y consolidamos una primera capa de filtros en `api-gateway`.

Con eso, NovaMarket ya no solo enruta mejor y balancea mejor: también empieza a procesar tráfico con una lógica más explícita, dando otro paso claro hacia un punto de entrada mucho más serio y mucho más maduro dentro de la arquitectura.
