---
title: "Validando y consolidando una primera capa de retries controlados antes de la DLQ en NovaMarket"
description: "Checkpoint del módulo 13. Validación y consolidación de una primera capa de retries controlados antes del desvío final a la dead letter queue en NovaMarket."
order: 148
module: "Módulo 13 · Comunicación asíncrona y eventos"
level: "intermedio"
draft: false
---

# Validando y consolidando una primera capa de retries controlados antes de la DLQ en NovaMarket

En las últimas clases del módulo 13 dimos otro paso muy importante dentro del bloque de mensajería robusta:

- ya existe un flujo real `OrderCreated`,
- ya existe una primera dead letter queue,
- y además ahora ya incorporamos una primera capa de retries controlados antes del desvío final a la DLQ.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer, otra vez, lo que venimos haciendo cada vez que el proyecto gana una nueva capa de madurez:

**un checkpoint de consolidación.**

Porque una cosa es haber agregado retries.  
Y otra bastante distinta es detenerse a mirar qué significa realmente eso para la robustez general de la arquitectura basada en eventos.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- NovaMarket ya cuenta con una primera capa real de retries controlados,
- esa capa aporta valor genuino al proyecto,
- y el sistema ya empezó a dejar atrás una mensajería demasiado rígida frente a ciertos fallos transitorios del lado consumidor.

Esta clase funciona como checkpoint fuerte del subbloque de retries antes de la DLQ.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe un flujo real `OrderCreated`,
- `notification-service` consume el evento,
- existe una DLQ para separar mensajes persistentemente problemáticos,
- y además ahora ya existe una pequeña ventana de nuevos intentos antes del desvío final.

Eso significa que ya no estamos discutiendo una hipótesis.

Ahora estamos leyendo una mejora real sobre cómo NovaMarket deja de reaccionar de forma demasiado binaria entre “éxito inmediato” y “desvío final”.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el valor estructural de esta primera capa de retries,
- consolidar cómo se relaciona con la DLQ,
- validar qué cambia en la madurez general del sistema,
- y dejar este subbloque como base estable para el siguiente frente del bloque de mensajería.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si el mensaje se intenta otra vez”.

Queremos observar algo más interesante:

- si el sistema ya distingue mejor entre fallos transitorios y fallos persistentes,
- si la mensajería ya no es excesivamente rígida,
- y si el módulo 13 ya ganó una base concreta para seguir profundizando confiabilidad del consumo.

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Volver sobre el recorrido de esta etapa

Antes de entrar en detalles, conviene fijar la secuencia que construimos:

- primero abrimos mensajería asíncrona como siguiente gran bloque natural,
- después sumamos RabbitMQ al entorno,
- luego publicamos y consumimos un primer evento real,
- más tarde incorporamos una DLQ para los casos claramente problemáticos,
- y finalmente agregamos retries controlados para no mandar de inmediato todo fallo a la cola de errores.

Ese encadenamiento importa mucho porque muestra que esta etapa no apareció aislada, sino como una evolución natural del flujo feliz hacia una mensajería más robusta.

---

## Paso 2 · Consolidar la relación entre retry y DLQ

Este es uno de los puntos más importantes de toda la clase.

A esta altura ya conviene poder decir algo como:

- retry da una o pocas oportunidades extra cuando el fallo parece recuperable,
- y la DLQ se queda con los casos que ya no deberían seguir viviendo en el flujo principal.

Ese cambio importa muchísimo porque la arquitectura ya no trata todos los fallos del consumidor como equivalentes.

Ahora existe una progresión mucho más madura:

1. intentar procesar
2. reintentar si puede haber recuperación
3. desviar si el problema persiste

Ese puente es uno de los corazones del bloque.

---

## Paso 3 · Entender qué valor tiene haber empezado con una política chica

También vale mucho notar que no arrancamos con una estrategia gigantesca de retries.

Empezamos con algo:

- chico,
- visible,
- fácil de probar,
- y suficientemente claro como para comparar con la situación anterior.

Eso fue una muy buena decisión.

¿Por qué?

Porque permitió ver con claridad dos cosas a la vez:

- cuándo un mensaje puede recuperarse
- y cuándo ya no conviene seguir insistiendo

Ese criterio mejora muchísimo la calidad didáctica del módulo.

---

## Paso 4 · Revisar qué cambió en la madurez del proyecto

A esta altura conviene fijar algo importante:

antes, NovaMarket ya podía:

- publicar un evento real,
- consumirlo,
- y separar mensajes claramente problemáticos en una DLQ.

Ahora, en cambio, además empieza a tener una noción más clara de que:

- no todo fallo merece desvío inmediato,
- algunos errores pueden ser transitorios,
- y la arquitectura puede ganar elasticidad sin perder disciplina.

Ese cambio vuelve al proyecto bastante más serio desde el punto de vista de mensajería robusta.

---

## Paso 5 · Entender qué todavía no está resuelto

También conviene dejar algo claro:

después de este checkpoint todavía siguen existiendo muchos pasos posibles, por ejemplo:

- distinguir mejor errores recuperables de irrecuperables,
- mejorar trazabilidad del mensaje durante sus reintentos,
- diseñar reprocesamiento de mensajes muertos,
- o abrir estrategias más finas de idempotencia y duplicados.

Eso está bien.

La meta de esta etapa nunca fue resolverlo todo.  
Fue empezar con algo real, útil y bien orientado.

Y eso sí se logró muy bien.

---

## Paso 6 · Pensar por qué esto mejora muchísimo el siguiente tramo

Este punto importa mucho.

A partir de ahora, cualquier siguiente paso del bloque de mensajería va a ser mucho más fácil de sostener porque ya existe una primera referencia concreta de que NovaMarket:

- no solo tiene flujo feliz,
- no solo tiene desvío final,
- también puede tolerar mejor ciertos fallos transitorios del consumidor.

Eso significa que esta clase no solo cierra una etapa.  
También prepara muy bien todo lo que viene después.

---

## Paso 7 · Comparar el proyecto actual con el del comienzo del subbloque

Si miramos el recorrido hasta acá, la evolución ya empieza a verse bastante clara:

### Antes
- flujo asíncrono feliz
- poco matiz frente a errores del consumidor
- y una salida bastante rígida entre éxito o fallo

### Ahora
- flujo asíncrono feliz
- retries controlados
- DLQ
- y una postura mucho más madura frente a fallos transitorios y persistentes

Ese cambio vale muchísimo porque ya mueve a NovaMarket hacia una postura bastante más seria también en cómo trata la confiabilidad del consumo.

---

## Paso 8 · Entender qué NO estamos afirmando todavía

Conviene dejar esto muy claro.

En este punto todavía no estamos diciendo:

- que NovaMarket ya tenga toda su política de mensajería robusta totalmente cerrada,
- ni que todos los tipos de error ya estén perfectamente clasificados,
- ni que el bloque de eventos ya esté agotado.

Eso sería exagerado.

Lo que sí podemos decir con bastante honestidad es algo mucho más valioso:

- NovaMarket ya dejó de reaccionar de forma demasiado rígida frente a fallos del consumidor y empezó a sostener una primera capa real de reintentos controlados antes del desvío final.

Y eso ya es un avance muy fuerte.

---

## Qué estamos logrando con esta clase

Esta clase consolida una primera capa real de retries controlados antes de la DLQ en NovaMarket.

Ya no estamos solo publicando, consumiendo y apartando mensajes problemáticos.  
Ahora también estamos dejando claro que el sistema ya puede tolerar mejor ciertos fallos transitorios sin perder la capacidad de aislar casos persistentes.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- resolvimos todavía el problema de procesar dos veces el mismo evento,
- ni cómo manejar mejor duplicados o idempotencia del lado consumidor.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**validar y consolidar esta primera capa de retries como una ganancia real del proyecto.**

---

## Errores comunes en esta etapa

### 1. Pensar que retry y DLQ se excluyen
En realidad se complementan muchísimo.

### 2. Reducir el valor del paso a “ahora intenta otra vez”
El valor real está en la nueva franja intermedia entre flujo sano y desvío final.

### 3. Confundir esta mejora con una estrategia completa de confiabilidad
Todavía estamos en una primera capa, no en la solución final.

### 4. Exagerar lo logrado
Todavía queda mucho si queremos más fineza en clasificación de errores y reprocesamiento.

### 5. No consolidar este paso antes de seguir
Eso haría más difícil sostener la progresión del módulo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión bastante más clara de cómo una primera capa de retries controlados mejora la postura general de NovaMarket y por qué esta evolución ya representa una madurez real dentro del módulo 13.

Eso deja muy bien preparado el siguiente tramo del curso rehecho.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué aporta retry sobre el flujo principal y la DLQ,
- ves que el sistema ya distingue mejor entre lo transitorio y lo persistente,
- entendés qué cosas sí mejoraron y cuáles todavía quedan abiertas,
- y sentís que NovaMarket ya ganó una nueva capa concreta de madurez desde robustez de consumo.

Si eso está bien, entonces este bloque ya puede pasar al siguiente frente con una base mucho más fuerte.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a entender por qué idempotencia y manejo de eventos duplicados ya tienen sentido en NovaMarket cuando la mensajería deja de ser teórica y empieza a ser realmente operativa.

---

## Cierre

En esta clase validamos y consolidamos una primera capa de retries controlados antes de la DLQ en NovaMarket.

Con eso, el proyecto deja de tratar los fallos del consumidor como un problema demasiado rígido entre éxito inmediato o desvío final y empieza a sostener una forma mucho más flexible, mucho más robusta y mucho más madura de manejar errores transitorios en su arquitectura basada en eventos.
