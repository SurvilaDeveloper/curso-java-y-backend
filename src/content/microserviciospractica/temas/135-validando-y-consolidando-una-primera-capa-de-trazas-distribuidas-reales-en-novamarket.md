---
title: "Validando y consolidando una primera capa de trazas distribuidas reales en NovaMarket"
description: "Checkpoint del módulo 12. Validación y consolidación de una primera capa de trazas distribuidas reales visibles en Zipkin desde gateway y servicios."
order: 135
module: "Módulo 12 · Observabilidad"
level: "intermedio"
draft: false
---

# Validando y consolidando una primera capa de trazas distribuidas reales en NovaMarket

En las últimas clases del módulo 12 dimos otro paso muy importante dentro del bloque de observabilidad:

- ya teníamos correlation id,
- ya teníamos logs correlacionados,
- ya incorporamos Zipkin al entorno,
- y ahora además ya emitimos una primera capa de trazas reales desde gateway y servicios.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer, otra vez, lo que venimos haciendo cada vez que el proyecto gana una nueva capa de madurez:

**un checkpoint de consolidación.**

Porque una cosa es haber logrado que aparezcan trazas reales en Zipkin.  
Y otra bastante distinta es detenerse a mirar qué significa realmente eso para la capacidad de NovaMarket de entender su comportamiento distribuido.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- NovaMarket ya cuenta con una primera capa real de trazas distribuidas visibles,
- esa capa aporta valor genuino al proyecto,
- y el sistema ya empezó a dejar atrás una observabilidad basada solo en ids y logs para pasar a una lectura mucho más estructurada de sus recorridos.

Esta clase funciona como checkpoint fuerte del subbloque de Zipkin y trazas distribuidas reales.

---

## Estado de partida

Partimos de un sistema donde ya:

- Zipkin forma parte del entorno,
- gateway y servicios emiten una primera capa de trazas,
- y ya existe la posibilidad de observar un recorrido distribuido real de una request a través del sistema.

Eso significa que ya no estamos discutiendo una hipótesis.

Ahora estamos leyendo una mejora real sobre cómo NovaMarket deja de reconstruir todo manualmente y empieza a contar con una visión mucho más rica de sus operaciones distribuidas.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el valor estructural de esta primera capa de trazas reales,
- consolidar cómo se relaciona con todo lo construido antes,
- validar qué cambia en la madurez general del sistema,
- y dejar este subbloque como base estable para decidir el siguiente tramo del módulo 12.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si Zipkin muestra algo”.

Queremos observar algo más interesante:

- si el sistema ya empezó a representar recorridos distribuidos de una forma más estructurada,
- si la observabilidad ya dejó de apoyarse solo en lectura manual de mensajes,
- y si el módulo 12 ya ganó una base concreta de trazabilidad distribuida mucho más madura que la que tenía al inicio del bloque.

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Volver sobre el recorrido de esta etapa

Antes de entrar en detalles, conviene fijar la secuencia que construimos:

- primero abrimos observabilidad,
- después correlation id,
- luego logs correlacionados,
- más tarde incorporamos Zipkin al entorno,
- y finalmente empezamos a emitir trazas reales desde gateway y servicios.

Ese encadenamiento importa mucho porque muestra que el bloque no fue una suma desordenada de herramientas, sino una progresión coherente desde señales mínimas hasta una observación mucho más rica del recorrido real de las requests.

---

## Paso 2 · Consolidar la relación entre ids, logs y trazas

Este es uno de los puntos más importantes de toda la clase.

A esta altura ya conviene poder decir algo como:

- correlation id fue una base mínima muy valiosa,
- logs correlacionados mejoraron muchísimo la legibilidad,
- y las trazas reales terminaron de aportar una visión mucho más estructurada del recorrido distribuido.

Ese cambio importa muchísimo porque el sistema ya no depende de una única señal para entenderse.  
Ahora empieza a combinar capas de observación bastante más maduras.

Ese salto es uno de los corazones del bloque.

---

## Paso 3 · Entender qué valor tiene haber llegado hasta trazas reales

También vale mucho notar que no nos quedamos en un nivel conceptual.

Llegamos a ver recorridos reales dentro de una herramienta viva del entorno.

Eso fue una muy buena decisión.

¿Por qué?

Porque es justo ahí donde observabilidad deja de ser “preparación” y empieza a convertirse en una capacidad real del proyecto para observar lo que está pasando mientras una request atraviesa varias piezas.

Ese criterio mejora muchísimo el valor práctico del módulo.

---

## Paso 4 · Revisar qué cambió en la madurez del proyecto

A esta altura conviene fijar algo importante:

antes, NovaMarket ya tenía correlation id y logs más útiles.

Ahora, en cambio, además empieza a tener una noción mucho más fuerte de que:

- una request distribuida puede verse como un recorrido estructurado,
- no solo como una cadena manual de mensajes,
- y la observabilidad del sistema ya empieza a parecerse a algo mucho más serio desde el punto de vista operativo.

Ese cambio vuelve al proyecto bastante más maduro.

---

## Paso 5 · Entender qué todavía no está resuelto

También conviene dejar algo claro:

después de este checkpoint todavía siguen existiendo muchos pasos posibles, por ejemplo:

- leer con más profundidad los spans,
- interpretar mejor latencias,
- detectar cuellos de botella con más criterio,
- o profundizar todavía más el bloque con otras capacidades del ecosistema de observabilidad.

Eso está bien.

La meta de esta etapa nunca fue resolverlo todo.  
Fue llegar a una primera capa real, útil y bien orientada de trazabilidad distribuida más rica.

Y eso sí se logró muy bien.

---

## Paso 6 · Pensar por qué esto mejora muchísimo el siguiente tramo

Este punto importa mucho.

A partir de ahora, cualquier siguiente paso del bloque de observabilidad va a ser mucho más fácil de sostener porque ya existe una primera referencia concreta de que NovaMarket:

- no solo correlaciona mejor,
- no solo loggea mejor,
- también puede representar visual y estructuradamente el recorrido de una operación entre varias piezas.

Eso significa que esta clase no solo cierra una etapa.  
También prepara muy bien todo lo que viene después.

---

## Paso 7 · Comparar el proyecto actual con el del comienzo del bloque

Si miramos el recorrido hasta acá, la evolución ya empieza a verse bastante clara:

### Antes
- requests distribuidas
- eventos sueltos
- correlation mínima
- mucha reconstrucción manual

### Ahora
- requests distribuidas
- correlation id
- logs correlacionados
- Zipkin en el entorno
- y una primera capa real de trazas visibles que representa el recorrido distribuido de una operación

Ese cambio vale muchísimo porque ya mueve a NovaMarket hacia una postura bastante más madura también en cómo entiende y diagnostica el comportamiento real del sistema.

---

## Paso 8 · Entender qué NO estamos afirmando todavía

Conviene dejar esto muy claro.

En este punto todavía no estamos diciendo:

- que NovaMarket ya tenga observabilidad completa en todos los frentes,
- ni que todo el módulo 12 ya esté agotado,
- ni que la lectura del sistema ya sea perfecta en cualquier escenario.

Eso sería exagerado.

Lo que sí podemos decir con bastante honestidad es algo mucho más valioso:

- NovaMarket ya dejó de depender solo de correlation id y logs para seguir una request distribuida y empezó a sostener una primera capa real de trazabilidad distribuida estructurada y visible.

Y eso ya es un avance muy fuerte.

---

## Qué estamos logrando con esta clase

Esta clase consolida una primera capa real de trazas distribuidas visibles en NovaMarket.

Ya no estamos solo hablando de observabilidad o preparando herramientas.  
Ahora también estamos dejando claro que el sistema ya puede observar recorridos distribuidos concretos de una forma bastante más rica y bastante más madura.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- decidimos todavía si seguir profundizando observabilidad,
- ni si ya conviene pasar al siguiente gran bloque del roadmap rehecho.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**validar y consolidar esta primera capa de trazas distribuidas reales como una ganancia real del proyecto.**

---

## Errores comunes en esta etapa

### 1. Pensar que el subbloque solo “hizo andar Zipkin”
En realidad cambió bastante la capacidad del sistema de observar recorridos distribuidos.

### 2. Reducir el valor del paso a que aparezca una traza
El valor real está en la nueva lectura estructurada del comportamiento distribuido.

### 3. Confundir esta mejora con observabilidad total
Todavía estamos en una primera capa, no en la solución final.

### 4. Exagerar lo logrado
Todavía queda mucho si queremos más profundidad analítica.

### 5. No consolidar este paso antes de seguir
Eso haría más difícil sostener la progresión del módulo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión bastante más clara de cómo una primera capa de trazas distribuidas reales mejora la postura general de observabilidad de NovaMarket y por qué esta evolución ya representa una madurez real dentro del módulo 12.

Eso deja muy bien preparado el siguiente tramo del curso rehecho.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué aporta tener trazas distribuidas reales,
- ves que el sistema ya puede observar mejor el recorrido de una operación,
- entendés qué cosas sí mejoraron y cuáles todavía quedan abiertas,
- y sentís que NovaMarket ya ganó una nueva capa concreta de madurez desde observabilidad distribuida más rica.

Si eso está bien, entonces el bloque ya puede pasar al siguiente frente con una base mucho más fuerte.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a decidir si conviene seguir profundizando observabilidad o si ya tiene más sentido pasar al siguiente gran bloque del roadmap rehecho.

---

## Cierre

En esta clase validamos y consolidamos una primera capa de trazas distribuidas reales en NovaMarket.

Con eso, el proyecto deja de observar sus requests distribuidas solo con ids y logs mejorados y empieza a sostener una forma mucho más rica, mucho más estructurada y mucho más madura de ver cómo una operación atraviesa realmente el sistema.
