---
title: "Aplicando una primera mejora real sobre el despliegue hacia Kubernetes"
description: "Primer paso real del nuevo frente del módulo 16. Aplicación de una primera mejora concreta para volver más consistente y menos manual el camino de NovaMarket hacia el cluster."
order: 187
module: "Módulo 16 · Entrega y automatización"
level: "avanzado"
draft: false
---

# Aplicando una primera mejora real sobre el despliegue hacia Kubernetes

En la clase anterior dejamos algo bastante claro:

- NovaMarket ya no solo necesita construir mejor, sino también llegar mejor al cluster,
- y además identificamos un primer punto importante del trayecto hacia Kubernetes sobre el que conviene empezar a aplicar una mejora real.

Ahora toca el paso concreto:

**aplicar una primera mejora real sobre el despliegue hacia Kubernetes.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mejorado un primer punto importante del camino entre build correcto y cambio aplicado en el cluster,
- mucho más claro cómo se traduce la idea de “hacer más confiable el deploy” en una decisión real sobre NovaMarket,
- y validado que el proyecto puede empezar a reducir fragilidad en su llegada al entorno sin perder control ni claridad.

La meta de hoy no es construir una solución final de CD.  
La meta es mucho más concreta: **hacer real una primera mejora visible sobre una parte crítica del trayecto hacia Kubernetes**.

---

## Estado de partida

Partimos de un proyecto que ya:

- tiene una arquitectura funcional seria,
- opera razonablemente bien en Kubernetes,
- ganó una primera capa fuerte de seguridad,
- volvió más repetible build y validación previa,
- y ahora eligió un punto del deploy donde todavía hay demasiada dependencia de pasos manuales o propensión a inconsistencias.

Eso significa que ya no hace falta seguir discutiendo si conviene mejorar el deploy.

Ahora lo importante es ver:

- cómo empezar a hacerlo de verdad,
- sin romper el flujo actual,
- y sin convertir esta etapa en una sobreingeniería innecesaria.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- tomar el punto elegido del trayecto al cluster,
- aplicarle una primera mejora concreta de consistencia,
- validar cómo cambia el proceso después de esa decisión,
- y dejar una base real para el resto de este frente del módulo 16.

---

## Qué queremos resolver exactamente

Queremos pasar de este estado:

- “sabemos qué parte del deploy conviene volver más consistente”

a un estado más fuerte como este:

- “esa parte ya no depende igual que antes de pequeños pasos manuales, ambigüedad o riesgo de desalineación”

Ese cambio es muy importante.

Porque transforma la mejora del deploy en algo real dentro del proyecto y no solo en una intención del roadmap.

---

## Paso 1 · Volver sobre el punto elegido

Antes de tocar nada, conviene recordar por qué elegimos este punto del deploy:

- porque aparece seguido,
- porque tiene impacto real sobre el cluster,
- porque es fácil introducir errores ahí,
- y porque el valor de volverlo más consistente se entiende muy rápido.

Este punto importa mucho porque la automatización del deploy no debería arrancar por comodidad o por moda, sino por criterio operativo.

---

## Paso 2 · Definir qué significa “mejorarlo” en esta etapa

A esta altura del módulo, no hace falta todavía un sistema final de despliegue continuo.

Lo importante es algo más concreto:

- que este tramo deje de depender tanto de decisiones manuales pequeñas pero frágiles,
- y que pase a existir una forma más explícita, más repetible y más confiable de llevar el cambio correcto al cluster.

Ese cambio ya aporta muchísimo valor.

---

## Paso 3 · Aplicar una primera mejora sencilla y seria

Ahora conviene implementar una primera mejora concreta sobre ese punto del deploy.

Por ejemplo, una lógica del tipo:

- volver más consistente la referencia entre build y manifiesto,
- dejar más explícito qué imagen llega al cluster,
- o reducir al mínimo razonable la edición manual repetitiva en ese paso.

No hace falta todavía una plataforma completa de CD.  
La prioridad es que el punto elegido ya no siga dependiendo tanto de ambigüedad o memoria operativa.

Este es uno de los momentos más importantes de toda la clase.

---

## Paso 4 · Mantener la decisión alineada con el flujo real del proyecto

Este paso vale muchísimo.

No queremos automatizar algo “porque sí”.

Queremos que la mejora tenga sentido con preguntas como:

- ¿por qué este tramo del deploy necesitaba más consistencia?
- ¿qué error o fricción nos ahorra?
- ¿qué cambia positivamente cuando deja de depender tanto de intervención manual dispersa?

Esa relación entre flujo real y mejora del deploy vuelve al cambio muchísimo más valioso.

---

## Paso 5 · Ejecutar la nueva secuencia y validar el resultado

Después de introducir esta primera mejora del despliegue, conviene ejecutarla y revisar que:

- la referencia correcta llega al cluster,
- el manifiesto o el cambio aplicado sigue siendo coherente,
- y el proceso resultante realmente sea más claro y más confiable que antes.

Este punto importa muchísimo porque la automatización útil no debería volver opaco el despliegue; debería volverlo más consistente.

---

## Paso 6 · Revisar qué cambió realmente

Ahora conviene mirar algo muy importante:

- qué parte del trayecto al cluster quedó más explícitamente ordenada,
- qué decisiones manuales dejamos atrás,
- y qué tan distinto se siente ese tramo respecto del estado anterior.

No hace falta exagerar y decir que toda la entrega continua ya quedó resuelta.

La meta es mucho más precisa:

- reconocer que ya existe una primera mejora real donde antes había demasiada fragilidad o demasiada ambigüedad entre build y cluster.

---

## Paso 7 · Entender qué todavía no resolvimos

Este punto también importa bastante.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya resolvió todo su despliegue automático”

Sería exagerado.

Lo correcto es algo más honesto:

- NovaMarket ya empezó a volver una parte importante de su llegada al cluster más consistente de forma básica pero real.

Ese matiz es mucho más sano y mucho más útil.

---

## Paso 8 · Pensar por qué esto mejora el resto del módulo

A partir de ahora, cualquier evolución posterior sobre deploy, integración con repositorio o entrega continua va a ser mucho más fácil de sostener porque ya existe una primera decisión real y visible sobre la llegada al entorno.

Eso significa que esta clase no solo vale por sí misma.

También fortalece muchísimo el resto de este frente del módulo 16.

---

## Paso 9 · Entender qué NO estamos resolviendo todavía

Conviene dejar esto muy claro.

En esta etapa todavía no estamos:

- construyendo un CD completo,
- ni resolviendo toda la promoción entre entornos,
- ni automatizando cada despliegue hacia Kubernetes,
- ni cerrando toda la estrategia final de entrega del proyecto.

La meta actual es mucho más concreta:

**hacer que el primer punto elegido deje de ser un tramo demasiado manual o ambiguo y empiece a estar gobernado por una secuencia más explícita, más consistente y más confiable.**

Y eso ya es un paso muy importante.

---

## Paso 10 · Pensar por qué esta primera mejora vale tanto

A esta altura conviene fijar algo importante:

esta primera mejora del deploy vale mucho porque marca un antes y un después bastante claro en la postura del proyecto:

- antes había un tramo demasiado manual entre build y cluster,
- ahora empieza a haber una forma más justificada, más consistente y menos frágil de ejecutar ese viaje.

Ese cambio, aunque todavía sea inicial, tiene muchísimo peso en la madurez del proyecto.

---

## Qué estamos logrando con esta clase

Esta clase aplica la primera mejora real sobre el despliegue hacia Kubernetes en NovaMarket.

Ya no estamos solo diciendo que el trayecto al entorno también debe gobernarse mejor.  
Ahora también estamos haciendo que una parte importante de ese viaje deje de depender tanto de pasos manuales cómodos pero frágiles.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- validamos con calma el impacto completo de esta primera mejora del deploy,
- ni consolidamos todavía esta nueva capa como checkpoint del módulo.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**aplicar una primera mejora real sobre el despliegue hacia Kubernetes en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Querer construir toda la entrega continua en un solo movimiento
Conviene empezar por un punto central y una mejora clara.

### 2. Automatizar sin validar luego que el trayecto al cluster siga siendo entendible
La automatización útil no debería ocultar el proceso ni volverlo opaco.

### 3. Elegir una mejora demasiado compleja para la primera iteración
En esta etapa, lo simple y claro vale mucho más.

### 4. Declarar “cerrado” todo el frente de deploy demasiado pronto
Todavía estamos en una primera capa.

### 5. No reconocer el valor del cambio de postura del proyecto
La diferencia entre viaje manual frágil y trayecto más consistente es justamente el corazón de esta clase.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería tener una primera mejora concreta sobre su despliegue hacia Kubernetes y seguir siendo un sistema entendible, confiable y operable.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el punto elegido ya no depende igual de ambigüedad o pasos manuales que antes,
- la nueva secuencia tiene sentido,
- el deploy sigue funcionando bien,
- y sentís que NovaMarket ya empezó a volver su llegada al cluster más consistente de una forma mucho más seria.

Si eso está bien, ya podemos pasar a validar y consolidar este nuevo frente del módulo 16.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a revisar el impacto de la primera mejora aplicada sobre el despliegue hacia Kubernetes y a consolidarla como un nuevo checkpoint del módulo 16.

---

## Cierre

En esta clase aplicamos una primera mejora real sobre el despliegue hacia Kubernetes.

Con eso, el módulo 16 deja de hablar de delivery solo como build y checks previos y empieza a convertir la llegada al cluster en una decisión concreta, visible y con valor real para la madurez de NovaMarket.
