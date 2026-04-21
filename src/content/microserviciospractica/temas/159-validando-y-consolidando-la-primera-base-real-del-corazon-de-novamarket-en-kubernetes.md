---
title: "Validando y consolidando la primera base real del corazón de NovaMarket en Kubernetes"
description: "Checkpoint del módulo 15. Validación y consolidación de config-server y discovery-server en Kubernetes como primera base real del núcleo arquitectónico de NovaMarket."
order: 159
module: "Módulo 15 · Kubernetes y orquestación final"
level: "intermedio"
draft: false
---

# Validando y consolidando la primera base real del corazón de NovaMarket en Kubernetes

En las últimas clases del módulo 15 dimos otro paso muy importante dentro del bloque final del curso rehecho:

- Kubernetes ya dejó de ser solo teoría,
- NovaMarket ya tiene una primera base real en el cluster,
- y además ya llevamos `config-server` y `discovery-server` como primera representación concreta del corazón técnico de la arquitectura dentro de Kubernetes.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer, otra vez, lo que venimos haciendo cada vez que el proyecto gana una nueva capa de madurez:

**un checkpoint de consolidación.**

Porque una cosa es haber puesto dos piezas reales dentro del cluster.  
Y otra bastante distinta es detenerse a mirar qué significa realmente eso para la transición de NovaMarket desde Compose hacia orquestación más seria.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- NovaMarket ya cuenta con una primera base real del corazón de su arquitectura dentro de Kubernetes,
- esa base aporta valor genuino al proyecto,
- y el sistema ya empezó a dejar atrás una lectura demasiado genérica del cluster para pasar a una representación concreta de piezas estructurales del sistema.

Esta clase funciona como checkpoint fuerte del primer subbloque práctico de Kubernetes.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe un namespace propio,
- existen recursos básicos reales dentro del cluster,
- y además `config-server` y `discovery-server` ya tienen representación concreta como Deployments y Services.

Eso significa que ya no estamos discutiendo una hipótesis.

Ahora estamos leyendo una mejora real sobre cómo NovaMarket empieza a trasladar al cluster piezas que el alumno ya reconoce como corazón técnico de la arquitectura.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el valor estructural de esta primera base real,
- consolidar cómo se relaciona con todo lo construido antes,
- validar qué cambia en la madurez general del proyecto,
- y dejar este subbloque como base estable para sumar `api-gateway` y otras piezas todavía más visibles del sistema.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si los pods levantan”.

Queremos observar algo más interesante:

- si el cluster ya dejó de contener solo recursos abstractos,
- si NovaMarket ya empezó a reflejar su arquitectura real dentro de Kubernetes,
- y si el módulo 15 ya ganó una base concreta para seguir llevando piezas centrales del sistema al nuevo entorno.

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Volver sobre el recorrido de esta etapa

Antes de entrar en detalles, conviene fijar la secuencia que construimos:

- primero abrimos Kubernetes como último gran bloque técnico,
- después levantamos una primera base real con namespace, deployment y service,
- y finalmente llevamos `config-server` y `discovery-server` al cluster como primer núcleo concreto del sistema.

Ese encadenamiento importa mucho porque muestra que esta etapa no apareció aislada, sino como una evolución gradual y razonable desde recursos básicos hacia arquitectura real.

---

## Paso 2 · Consolidar la relación entre recursos genéricos y piezas concretas del sistema

Este es uno de los puntos más importantes de toda la clase.

A esta altura ya conviene poder decir algo como:

- `Namespace`, `Deployment` y `Service` son la gramática básica,
- pero su verdadero valor se vuelve visible cuando empiezan a representar piezas reales de NovaMarket.

Ese cambio importa muchísimo porque el cluster ya no es solo un tablero vacío de conceptos.  
Ahora empieza a contener partes reconocibles de la arquitectura.

Ese salto es uno de los corazones del bloque final.

---

## Paso 3 · Entender qué valor tiene haber empezado por `config-server` y `discovery-server`

También vale mucho notar que no empezamos por una pieza cualquiera.

Elegimos dos componentes estructurales:

- `config-server`
- `discovery-server`

Eso fue una muy buena decisión.

¿Por qué?

Porque permitió que el bloque final arrancara desde un corazón técnico claro del sistema y no desde ejemplos más laterales o menos representativos.

Ese criterio mejora muchísimo la calidad pedagógica del tramo final.

---

## Paso 4 · Revisar qué cambió en la madurez del proyecto

A esta altura conviene fijar algo importante:

antes, Kubernetes podía sentirse todavía como una capa medio externa al proyecto.

Ahora, en cambio, además empieza a tener una noción mucho más fuerte de que:

- NovaMarket ya puede representarse realmente dentro del cluster,
- esa representación puede empezar por piezas centrales,
- y la orquestación ya no está separada del sistema, sino que empieza a describirlo de verdad.

Ese cambio vuelve al proyecto bastante más serio desde el punto de vista de cierre técnico.

---

## Paso 5 · Entender qué todavía no está resuelto

También conviene dejar algo claro:

después de este checkpoint todavía siguen existiendo muchos pasos posibles, por ejemplo:

- sumar `api-gateway`,
- llevar servicios de negocio,
- pensar configuración más rica,
- exponer tráfico de entrada,
- o seguir profundizando cómo se adapta NovaMarket a la lógica del cluster.

Eso está bien.

La meta de esta etapa nunca fue resolverlo todo.  
Fue empezar con algo real, útil y bien orientado.

Y eso sí se logró muy bien.

---

## Paso 6 · Pensar por qué esto mejora muchísimo el siguiente tramo

Este punto importa mucho.

A partir de ahora, llevar `api-gateway` y servicios de negocio a Kubernetes va a ser muchísimo más fácil de sostener porque ya existe una primera referencia concreta de que NovaMarket:

- no solo tiene recursos básicos,
- no solo tiene teoría de cluster,
- también ya tiene parte de su corazón técnico representado de verdad dentro del nuevo entorno.

Eso significa que esta clase no solo cierra una etapa.  
También prepara muy bien todo lo que viene después.

---

## Paso 7 · Comparar el proyecto actual con el del comienzo del bloque final

Si miramos el recorrido hasta acá, la evolución ya empieza a verse bastante clara:

### Antes
- sistema completo en Compose
- Kubernetes como bloque todavía conceptual
- recursos genéricos sin demasiada relación visible con la arquitectura real

### Ahora
- namespace real de NovaMarket
- recursos básicos aplicados
- `config-server` y `discovery-server` corriendo en el cluster
- y una primera representación concreta del corazón técnico del sistema

Ese cambio vale muchísimo porque ya mueve a NovaMarket hacia una postura bastante más seria también en cómo se adapta a orquestación.

---

## Paso 8 · Entender qué NO estamos afirmando todavía

Conviene dejar esto muy claro.

En este punto todavía no estamos diciendo:

- que NovaMarket ya viva entero dentro de Kubernetes,
- ni que el bloque final ya esté cerrado,
- ni que todas las piezas más visibles del sistema ya estén dentro del cluster.

Eso sería exagerado.

Lo que sí podemos decir con bastante honestidad es algo mucho más valioso:

- NovaMarket ya dejó de pensar Kubernetes solo como teoría general y empezó a sostener una primera base real del corazón de su arquitectura dentro del cluster.

Y eso ya es un avance muy fuerte.

---

## Qué estamos logrando con esta clase

Esta clase consolida la primera base real del corazón de NovaMarket en Kubernetes.

Ya no estamos solo trabajando con manifests genéricos.  
Ahora también estamos dejando claro que el cluster ya puede representar piezas estructurales del sistema de una forma concreta, visible y alineada con la arquitectura real.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- llevamos todavía `api-gateway`,
- ni los servicios de negocio,
- ni la exposición más fuerte del sistema en Kubernetes.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**validar y consolidar esta primera base real del corazón de NovaMarket en Kubernetes como una ganancia real del proyecto.**

---

## Errores comunes en esta etapa

### 1. Pensar que esta etapa solo “pasó dos servicios al cluster”
En realidad cambió bastante la forma en que NovaMarket empieza a representarse dentro de Kubernetes.

### 2. Reducir el valor del paso a que existan pods corriendo
El valor real está en que el corazón técnico ya tiene presencia concreta dentro del cluster.

### 3. Confundir esta mejora con la migración completa del sistema
Todavía estamos en una primera base, no en la solución final.

### 4. Exagerar lo logrado
Todavía queda mucho si queremos toda la plataforma orquestada.

### 5. No consolidar este paso antes de sumar gateway y negocio
Eso haría más difícil sostener la progresión del bloque.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión bastante más clara de cómo esta primera base real del corazón de NovaMarket mejora la postura general del proyecto frente a Kubernetes y por qué esta evolución ya representa una madurez real dentro del bloque final.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué aporta tener `config-server` y `discovery-server` dentro del cluster,
- ves que NovaMarket ya tiene una representación arquitectónica más concreta en Kubernetes,
- entendés qué cosas sí mejoraron y cuáles todavía quedan abiertas,
- y sentís que el proyecto ya está listo para sumar piezas más visibles como `api-gateway`.

Si eso está bien, ya podemos pasar al siguiente tema y seguir completando la arquitectura de NovaMarket dentro del cluster.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a llevar `api-gateway` a Kubernetes y a empezar a pensar la exposición real del sistema dentro del nuevo entorno.

---

## Cierre

En esta clase validamos y consolidamos la primera base real del corazón de NovaMarket en Kubernetes.

Con eso, el proyecto deja de pensar Kubernetes solo como un entorno para recursos abstractos y empieza a sostener una representación mucho más concreta, mucho más fiel y mucho más madura de su arquitectura real dentro del cluster.
