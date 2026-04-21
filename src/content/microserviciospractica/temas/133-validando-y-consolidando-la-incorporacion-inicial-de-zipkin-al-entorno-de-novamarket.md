---
title: "Validando y consolidando la incorporación inicial de Zipkin al entorno de NovaMarket"
description: "Checkpoint del módulo 12. Validación y consolidación de la incorporación inicial de Zipkin al entorno Compose de NovaMarket como infraestructura real de trazabilidad distribuida."
order: 133
module: "Módulo 12 · Observabilidad"
level: "intermedio"
draft: false
---

# Validando y consolidando la incorporación inicial de Zipkin al entorno de NovaMarket

En las últimas clases del módulo 12 dimos un paso bastante importante dentro del bloque de observabilidad:

- consolidamos correlation id y logs correlacionados,
- abrimos el subtramo de trazabilidad distribuida más rica,
- y además incorporamos Zipkin al entorno como primera infraestructura real de trazas distribuidas.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer, otra vez, lo que venimos haciendo cada vez que el proyecto gana una nueva capa de madurez:

**un checkpoint de consolidación.**

Porque una cosa es haber levantado Zipkin junto al resto del stack.  
Y otra bastante distinta es detenerse a mirar qué significa realmente eso para la postura general de observabilidad del proyecto.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- NovaMarket ya cuenta con una primera infraestructura real de trazabilidad distribuida dentro de su entorno,
- esa incorporación aporta valor genuino al sistema,
- y el proyecto ya empezó a dejar atrás una observabilidad apoyada solo en correlation id y logs para pasar a una base mucho más rica.

Esta clase funciona como checkpoint fuerte de la incorporación inicial de Zipkin al módulo 12.

---

## Estado de partida

Partimos de un sistema donde ya:

- Zipkin forma parte del Compose,
- el entorno multicontenedor sostiene ahora también observabilidad distribuida además de infraestructura, negocio, seguridad y resiliencia,
- y el roadmap ya dejó claro que este bloque no se va a quedar en ids y logs mejorados como único horizonte.

Eso significa que ya no estamos discutiendo una hipótesis.

Ahora estamos leyendo una mejora real sobre cómo NovaMarket empieza a incorporar trazabilidad distribuida como parte explícita de su arquitectura operativa.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el valor estructural de esta incorporación,
- consolidar cómo se relaciona con todo lo construido antes,
- validar qué cambia en la madurez general del proyecto,
- y dejar este subbloque como base estable para empezar a emitir trazas reales desde gateway y servicios.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si Zipkin abre en un puerto”.

Queremos observar algo más interesante:

- si NovaMarket ya empezó a comportarse como un sistema donde la trazabilidad distribuida vive dentro del entorno y no solo como una idea futura,
- si la observabilidad dejó de depender únicamente de leer mensajes sueltos,
- y si el módulo 12 ya ganó una base concreta para el siguiente salto práctico: trazas reales.

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Volver sobre el recorrido de esta etapa

Antes de entrar en detalles, conviene fijar la secuencia que construimos:

- primero abrimos observabilidad como siguiente gran bloque natural,
- después incorporamos correlation id,
- luego mejoramos logs correlacionados,
- y finalmente sumamos Zipkin como infraestructura real para pasar a trazabilidad distribuida más rica.

Ese encadenamiento importa mucho porque muestra que esta etapa no apareció aislada, sino como una evolución natural después de infraestructura, seguridad y resiliencia maduras.

---

## Paso 2 · Consolidar la relación entre correlation id, logs y Zipkin

Este es uno de los puntos más importantes de toda la clase.

A esta altura ya conviene poder decir algo como:

- correlation id fue una base muy valiosa,
- logs correlacionados mejoraron mucho la legibilidad,
- pero todavía faltaba una pieza más rica:
- una infraestructura capaz de sostener recorridos distribuidos de forma más estructurada.

Ese cambio importa muchísimo porque ahora el sistema ya no solo puede “decir cosas” sobre una request.  
También empieza a prepararse para verla mejor como un recorrido distribuido real.

---

## Paso 3 · Entender qué valor tiene haber metido a Zipkin dentro de Compose

También vale mucho notar que no dejamos Zipkin corriendo “por afuera” del proyecto.

Lo incorporamos dentro del mismo entorno multicontenedor.

Eso fue una muy buena decisión.

¿Por qué?

Porque refuerza algo muy importante:

- la trazabilidad distribuida no es una preocupación lateral,
- sino una parte real de la infraestructura operativa del sistema.

Ese criterio mejora muchísimo la coherencia del bloque.

---

## Paso 4 · Revisar qué cambió en la madurez del proyecto

A esta altura conviene fijar algo importante:

antes, NovaMarket ya tenía correlation id y logs más útiles.

Ahora, en cambio, además empieza a tener una noción más clara de que:

- la observabilidad rica merece una pieza especializada,
- esa pieza puede vivir junto al resto del stack,
- y la lectura del sistema ya no tiene por qué depender solo de reconstrucciones manuales.

Ese cambio vuelve al proyecto bastante más serio desde el punto de vista operativo.

---

## Paso 5 · Entender qué todavía no está resuelto

También conviene dejar algo claro:

después de este checkpoint todavía siguen existiendo muchos pasos posibles, por ejemplo:

- emitir spans reales,
- conectar gateway y servicios con esa infraestructura,
- observar recorridos concretos,
- y leer latencias de forma mucho más estructurada.

Eso está bien.

La meta de esta etapa nunca fue resolverlo todo.  
Fue empezar con algo real, útil y bien orientado.

Y eso sí se logró muy bien.

---

## Paso 6 · Pensar por qué esto mejora muchísimo el siguiente tramo

Este punto importa mucho.

A partir de ahora, cualquier siguiente paso del bloque de observabilidad va a ser mucho más fácil de sostener porque ya existe una primera referencia concreta de cómo se ve NovaMarket cuando la trazabilidad distribuida ya no es solo una intención, sino una pieza viva del entorno.

Eso significa que esta clase no solo cierra una etapa.  
También prepara muy bien todo lo que viene después.

---

## Paso 7 · Comparar el proyecto actual con el del comienzo del subbloque

Si miramos el recorrido hasta acá, la evolución ya empieza a verse bastante clara:

### Antes
- requests distribuidas
- correlation id
- logs correlacionados
- pero sin una infraestructura específica para trazas más ricas

### Ahora
- requests distribuidas
- correlation id y logs correlacionados
- y una primera infraestructura real de trazabilidad distribuida integrada al stack

Ese cambio vale muchísimo porque ya mueve a NovaMarket hacia una postura bastante más madura también en cómo piensa observabilidad operativa.

---

## Paso 8 · Entender qué NO estamos afirmando todavía

Conviene dejar esto muy claro.

En este punto todavía no estamos diciendo:

- que NovaMarket ya emita y visualice trazas completas,
- ni que el bloque de observabilidad ya esté cerrado,
- ni que ya exista una lectura final de todos los recorridos del sistema.

Eso sería exagerado.

Lo que sí podemos decir con bastante honestidad es algo mucho más valioso:

- NovaMarket ya dejó de tratar la trazabilidad distribuida como una idea futura y empezó a sostenerla con una infraestructura real dentro de su entorno.

Y eso ya es un avance muy fuerte.

---

## Qué estamos logrando con esta clase

Esta clase consolida la incorporación inicial de Zipkin al entorno de NovaMarket.

Ya no estamos solo hablando de trazabilidad distribuida como siguiente bloque lógico.  
Ahora también estamos mostrando que el sistema ya tiene una pieza seria de observabilidad corriendo de verdad junto al resto de la arquitectura.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- emitimos todavía spans reales desde gateway y servicios,
- ni vimos todavía recorridos completos en Zipkin.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**validar y consolidar esta incorporación inicial de Zipkin como una ganancia real del proyecto.**

---

## Errores comunes en esta etapa

### 1. Pensar que esta etapa solo “agregó otro contenedor”
En realidad cambió bastante la postura de observabilidad del sistema.

### 2. Reducir el valor del bloque a que la UI de Zipkin abre
El valor real está en haber incorporado trazabilidad distribuida como infraestructura.

### 3. Confundir esta mejora con observabilidad completa
Todavía estamos en una primera capa, no en la solución final.

### 4. Exagerar lo logrado
Todavía queda mucho si quisiéramos spans completos y lecturas más ricas.

### 5. No consolidar este paso antes de emitir trazas reales
Eso haría más difícil sostener la lógica del módulo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión bastante más clara de cómo la incorporación inicial de Zipkin mejora la postura general de observabilidad de NovaMarket y por qué esta evolución ya representa una madurez real dentro del módulo 12.

Eso deja muy bien preparado el siguiente tramo del curso rehecho.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué aporta tener Zipkin dentro del entorno,
- ves que la trazabilidad distribuida ya no vive solo como idea futura,
- entendés qué cosas sí mejoraron y cuáles todavía quedan abiertas,
- y sentís que NovaMarket ya ganó una nueva capa concreta de madurez desde infraestructura real de observabilidad distribuida.

Si eso está bien, entonces este bloque ya puede pasar al siguiente frente con una base mucho más fuerte.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a emitir una primera capa de trazas reales desde gateway y servicios para que Zipkin deje de ser solo infraestructura viva y empiece a mostrar recorridos distribuidos concretos de NovaMarket.

---

## Cierre

En esta clase validamos y consolidamos la incorporación inicial de Zipkin al entorno de NovaMarket.

Con eso, el proyecto ya no solo tiene correlation id y logs correlacionados: también empieza a sostener su observabilidad distribuida con una pieza mucho más seria, mucho más visual y mucho más alineada con una arquitectura moderna de microservicios.
