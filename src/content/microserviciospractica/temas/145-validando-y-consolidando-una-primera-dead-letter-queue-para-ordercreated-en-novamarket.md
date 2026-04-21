---
title: "Validando y consolidando una primera dead letter queue para OrderCreated en NovaMarket"
description: "Checkpoint del módulo 13. Validación y consolidación de una primera dead letter queue para aislar mensajes OrderCreated problemáticos del flujo principal."
order: 145
module: "Módulo 13 · Comunicación asíncrona y eventos"
level: "intermedio"
draft: false
---

# Validando y consolidando una primera dead letter queue para `OrderCreated` en NovaMarket

En las últimas clases del módulo 13 dimos otro paso muy importante dentro del bloque de mensajería:

- ya existe un primer flujo asíncrono real entre `order-service` y `notification-service`,
- ya vimos que el caso feliz no alcanza por sí solo,
- y además ya incorporamos una primera **dead letter queue** para separar mensajes `OrderCreated` problemáticos del flujo principal.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer, otra vez, lo que venimos haciendo cada vez que el proyecto gana una nueva capa de madurez:

**un checkpoint de consolidación.**

Porque una cosa es haber agregado una DLQ.  
Y otra bastante distinta es detenerse a mirar qué significa realmente eso para la robustez operativa del sistema.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- NovaMarket ya cuenta con una primera capa real de aislamiento de mensajes fallidos,
- esa capa aporta valor genuino al proyecto,
- y el sistema ya empezó a dejar atrás una mensajería demasiado frágil o demasiado ingenua frente a errores del lado consumidor.

Esta clase funciona como checkpoint fuerte del primer subbloque de robustez en mensajería.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe un flujo real `OrderCreated`,
- `notification-service` puede consumirlo,
- y además ahora ya existe una cola separada donde terminan mensajes que no pudieron procesarse correctamente.

Eso significa que ya no estamos discutiendo una hipótesis.

Ahora estamos leyendo una mejora real sobre cómo NovaMarket deja de tratar los mensajes fallidos como un caos difuso y empieza a aislarlos de forma explícita.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el valor estructural de esta primera DLQ,
- consolidar cómo se relaciona con el flujo principal,
- validar qué cambia en la madurez general del sistema,
- y dejar este subbloque como base estable para el siguiente paso fino del bloque: reintentos más controlados antes del desvío final.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si existe otra cola”.

Queremos observar algo más interesante:

- si el sistema ya distingue mejor entre mensajes sanos y mensajes problemáticos,
- si el flujo principal dejó de estar demasiado expuesto a mensajes venenosos,
- y si el módulo 13 ya ganó una base concreta para abrir una política más madura de retries y fallos del lado consumidor.

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Volver sobre el recorrido de esta etapa

Antes de entrar en detalles, conviene fijar la secuencia que construimos:

- primero abrimos comunicación asíncrona como siguiente gran bloque natural,
- después sumamos RabbitMQ al entorno,
- luego publicamos un evento real,
- más tarde cerramos un primer consumo real en `notification-service`,
- y finalmente incorporamos una dead letter queue para los casos donde ese consumo no puede completarse correctamente.

Ese encadenamiento importa mucho porque muestra que esta etapa no apareció aislada, sino como una evolución natural del primer flujo feliz hacia un flujo más robusto frente a fallos reales.

---

## Paso 2 · Consolidar la relación entre flujo principal y mensajes fallidos

Este es uno de los puntos más importantes de toda la clase.

A esta altura ya conviene poder decir algo como:

- el flujo principal necesita mantenerse lo más sano posible,
- y no todos los mensajes que llegan pueden seguir viviendo ahí si su procesamiento falla persistentemente.

La DLQ cambia eso.

¿Por qué?

Porque introduce una frontera explícita entre:

- mensajes que el sistema puede seguir procesando normalmente
- y mensajes que necesitan tratamiento separado

Ese cambio importa muchísimo porque vuelve mucho más operable a la arquitectura.

---

## Paso 3 · Entender qué valor tiene haber aislado los mensajes problemáticos

También vale mucho notar que no tratamos la DLQ como “otra cola más” sin sentido.

La usamos para algo muy concreto:

- sacar del camino principal los mensajes que ya no deberían seguir mezclados con el flujo sano.

Eso fue una muy buena decisión.

¿Por qué?

Porque evita que un caso problemático condicione demasiado al resto del procesamiento y además deja el problema visible en un lugar claro.

Ese criterio mejora muchísimo la madurez del bloque.

---

## Paso 4 · Revisar qué cambió en la madurez del proyecto

A esta altura conviene fijar algo importante:

antes, NovaMarket ya tenía infraestructura de mensajería y un flujo real de eventos.

Ahora, en cambio, además empieza a tener una noción mucho más clara de que:

- el consumo puede fallar,
- no todo fallo debe seguir mezclado con el flujo principal,
- y la arquitectura ya puede empezar a separar los casos sanos de los casos problemáticos.

Ese cambio vuelve al proyecto bastante más serio desde el punto de vista operativo.

---

## Paso 5 · Entender qué todavía no está resuelto

También conviene dejar algo claro:

después de este checkpoint todavía siguen existiendo muchos pasos posibles, por ejemplo:

- decidir cuántas veces conviene reintentar antes de desviar,
- diferenciar fallos transitorios de fallos persistentes,
- enriquecer visibilidad sobre mensajes muertos,
- o diseñar estrategias más ricas de reprocesamiento.

Eso está bien.

La meta de esta etapa nunca fue resolverlo todo.  
Fue empezar con algo real, útil y bien orientado.

Y eso sí se logró muy bien.

---

## Paso 6 · Pensar por qué esto mejora muchísimo el siguiente tramo

Este punto importa mucho.

A partir de ahora, un paso como retries controlados va a ser muchísimo más fácil de sostener porque ya existe una primera referencia concreta de que:

- el flujo principal no tiene por qué absorber indefinidamente todos los errores,
- y el sistema ya sabe apartar casos problemáticos en una cola separada.

Eso significa que esta clase no solo cierra una etapa.  
También prepara muy bien todo lo que viene después.

---

## Paso 7 · Comparar el proyecto actual con el del comienzo del subbloque

Si miramos el recorrido hasta acá, la evolución ya empieza a verse bastante clara:

### Antes
- productor real
- consumidor real
- caso feliz funcionando
- pero poca claridad frente a mensajes problemáticos

### Ahora
- productor real
- consumidor real
- caso feliz funcionando
- y una primera DLQ real que aísla mensajes fallidos del flujo principal

Ese cambio vale muchísimo porque ya mueve a NovaMarket hacia una postura bastante más madura también en cómo maneja errores del lado asíncrono.

---

## Paso 8 · Entender qué NO estamos afirmando todavía

Conviene dejar esto muy claro.

En este punto todavía no estamos diciendo:

- que NovaMarket ya tenga toda su estrategia de mensajería robusta resuelta,
- ni que todos los fallos ya estén clasificados perfectamente,
- ni que el bloque de eventos ya esté cerrado.

Eso sería exagerado.

Lo que sí podemos decir con bastante honestidad es algo mucho más valioso:

- NovaMarket ya dejó de tratar mensajes fallidos como un problema difuso y empezó a aislarlos de forma explícita dentro de su arquitectura basada en eventos.

Y eso ya es un avance muy fuerte.

---

## Qué estamos logrando con esta clase

Esta clase consolida una primera dead letter queue real para `OrderCreated` en NovaMarket.

Ya no estamos solo publicando y consumiendo mensajes felices.  
Ahora también estamos dejando claro que el sistema ya puede separar y contener mejor los casos problemáticos del lado consumidor.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- definimos todavía una política fina de reintentos,
- ni abrimos aún una lectura más rica sobre cuándo reintentar y cuándo desviar.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**validar y consolidar esta primera DLQ como una ganancia real del proyecto.**

---

## Errores comunes en esta etapa

### 1. Pensar que la DLQ solo “mueve” mensajes
En realidad cambia bastante la robustez operativa del flujo.

### 2. Reducir el valor del paso a que exista otra cola
El valor real está en aislar mensajes problemáticos del flujo principal.

### 3. Confundir esta mejora con una estrategia completa de confiabilidad
Todavía estamos en una primera capa, no en la solución final.

### 4. Exagerar lo logrado
Todavía queda mucho si queremos retries finos y reprocesamiento mejor diseñado.

### 5. No consolidar este paso antes de hablar de retries
Eso haría más difícil sostener la progresión del módulo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión bastante más clara de cómo una primera DLQ mejora la postura general de NovaMarket y por qué esta evolución ya representa una madurez real dentro del módulo 13.

Eso deja muy bien preparado el siguiente tramo del curso rehecho.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué aporta una DLQ sobre el flujo principal,
- ves que el sistema ya separa mejor mensajes problemáticos,
- entendés qué cosas sí mejoraron y cuáles todavía quedan abiertas,
- y sentís que NovaMarket ya ganó una nueva capa concreta de madurez desde robustez en mensajería.

Si eso está bien, entonces este bloque ya puede pasar al siguiente frente con una base mucho más fuerte.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a entender cómo introducir retries controlados del lado consumidor antes de derivar definitivamente un mensaje a la DLQ.

---

## Cierre

En esta clase validamos y consolidamos una primera dead letter queue para `OrderCreated` en NovaMarket.

Con eso, el proyecto deja de tratar los fallos de consumo como algo desordenado o mezclado con el flujo principal y empieza a sostener una forma mucho más robusta, mucho más operable y mucho más madura de separar mensajes problemáticos dentro de su arquitectura basada en eventos.
