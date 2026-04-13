---
title: "Definiendo una primera alerta básica para una pieza importante"
description: "Primer paso concreto del alerting básico dentro de Kubernetes. Definición de una primera alerta simple y útil para una pieza importante de NovaMarket."
order: 141
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Definiendo una primera alerta básica para una pieza importante

En la clase anterior dejamos claro algo importante:

- medir, recolectar y visualizar el sistema ya no alcanza del todo,
- y además NovaMarket ya está lo suficientemente maduro dentro del cluster como para que una primera alerta básica tenga mucho sentido.

Ahora toca el paso concreto:

**definir una primera alerta simple para una pieza importante del sistema.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- elegida una condición simple pero valiosa para alertar,
- preparada una primera regla básica dentro del entorno,
- y mucho más claro cómo se transforma una observación pasiva en una condición que merece atención explícita.

Todavía no vamos a construir una estrategia gigante de alerting.  
La meta de hoy es mucho más concreta: **crear una primera alerta que tenga sentido real para el sistema**.

---

## Estado de partida

Partimos de un sistema donde ya tenemos:

- métricas básicas
- exposición orientada a Prometheus
- scraping real
- Grafana
- un primer dashboard útil
- y una observación cuantitativa bastante más rica del entorno

Eso significa que el siguiente paso natural ya no está del lado de visualizar mejor, sino del lado de decidir:

- qué condición vale la pena destacar activamente

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir una pieza importante del sistema,
- seleccionar una condición simple y razonable para alertar,
- definir una primera regla básica,
- y dejar lista una capa inicial de alerting dentro del entorno.

---

## Qué pieza conviene elegir primero

Para esta primera iteración, sigue teniendo mucho sentido trabajar con algo como:

- `api-gateway`
- o `order-service`

La idea es usar una pieza importante y suficientemente visible como para que el valor de la alerta se entienda rápido.

`api-gateway` suele ser una muy buena opción porque su rol es claro y cualquier degradación ahí es fácil de justificar como condición relevante.

---

## Paso 1 · Elegir una condición simple y clara

No hace falta empezar con una alerta complicada.

A esta altura del curso, conviene elegir algo muy fácil de justificar, por ejemplo:

- una condición de disponibilidad
- una señal sostenida de degradación
- o un umbral claramente anómalo sobre una métrica básica

La idea es que la alerta enseñe criterio, no complejidad.

---

## Paso 2 · Entender qué hace valiosa a una alerta

Este punto vale muchísimo.

No queremos alertar “por tener una alerta”.

Queremos algo que responda a una pregunta como:

- ¿qué situación de esta pieza dejaría de ser simplemente informativa y empezaría a requerir atención?

Ese cambio de mirada es justamente el corazón de esta clase.

---

## Paso 3 · Definir una regla simple

Ahora conviene convertir esa condición en una regla básica.

No hace falta todavía entrar en una cantidad enorme de detalles.

La prioridad es que la regla sea:

- entendible
- razonable
- y claramente relacionada con el comportamiento de una pieza importante del sistema

Este es uno de los momentos más importantes de toda la clase.

---

## Paso 4 · Pensar el umbral con criterio

A esta altura conviene notar algo importante:

el valor de una alerta no depende solo de que exista una regla, sino también de que el umbral elegido tenga sentido.

No hace falta buscar perfección absoluta desde la primera iteración.  
Pero sí conviene que la regla no sea ni ridículamente sensible ni tan laxa que no sirva para nada.

Ese equilibrio mejora muchísimo el valor práctico del paso.

---

## Paso 5 · Relacionar la alerta con el rol de la pieza

Ahora conviene mirar la regla y preguntarse algo como:

- ¿tiene sentido alertar esto en esta pieza?
- ¿la condición elegida refleja algo realmente importante del servicio?
- ¿me ayudaría a prestar atención a algo que vale la pena no perder de vista?

Ese cambio de mirada vuelve la alerta muchísimo más valiosa.

---

## Paso 6 · Entender qué cambió respecto de la etapa anterior

A esta altura conviene fijar algo muy importante:

antes, ya podíamos medir, recolectar, visualizar y organizar métricas.

Ahora, en cambio, empezamos a decir algo más fuerte:

- esta condición deja de ser solo “información visible”
- y pasa a ser “algo que el entorno debería destacar como importante”

Ese salto es uno de los más fuertes de toda esta etapa.

---

## Paso 7 · No intentar todavía construir un sistema de alerting completo

Conviene dejarlo muy claro.

En esta etapa todavía no estamos:

- construyendo un esquema completo de alertas de producción
- ni resolviendo notificaciones finales
- ni definiendo una taxonomía compleja de severidades

La meta actual es mucho más concreta:

**crear una primera alerta básica que ya aporte valor real.**

Y eso ya es un paso muy importante.

---

## Paso 8 · Pensar por qué esto mejora todo el resto del bloque

A partir de ahora, cualquier refinamiento posterior sobre observación del entorno va a ser mucho más fácil de sostener porque ya existe una primera lógica explícita de alerting.

Eso significa que esta clase no solo vale por sí misma.

También prepara muy bien:

- una observación más accionable
- una reacción más madura ante condiciones relevantes
- y una operación mucho menos pasiva del entorno

Ese efecto transversal vale muchísimo.

---

## Paso 9 · Dejar claro que menos es más

Este punto importa bastante.

Para esta primera iteración, conviene que la alerta sea:

- simple
- entendible
- y claramente útil

No hace falta que cubra todo el sistema.

De hecho, empezar con poco suele ser mejor para aprender a distinguir una alerta valiosa de una alerta ruidosa.

---

## Qué estamos logrando con esta clase

Esta clase instala la primera alerta básica real dentro del bloque de Kubernetes.

Ya no estamos solo viendo y organizando mejor las señales del sistema.  
Ahora también empezamos a destacar explícitamente una condición que merece atención dentro del entorno.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos esta alerta como checkpoint del bloque
- ni la conectamos todavía como parte estable de una capa de observación más madura

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**definir una primera alerta simple con valor real para una pieza importante del sistema.**

---

## Errores comunes en esta etapa

### 1. Querer meter demasiadas alertas desde el primer paso
Conviene empezar con una sola y bien justificada.

### 2. Elegir una condición que no cambia realmente la atención sobre el sistema
La alerta tiene que destacar algo importante.

### 3. Definir un umbral sin pensar en el rol de la pieza
La regla tiene que tener sentido en contexto.

### 4. Tratar la alerta como una curiosidad técnica
El valor está en cómo mejora la operación del entorno.

### 5. Querer cerrar en esta clase toda la estrategia de alerting
Para esta etapa, una primera alerta útil es más que suficiente.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería tener una primera alerta básica definida para una pieza importante del sistema.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- elegiste una pieza importante del sistema,
- definiste una condición simple pero valiosa,
- la regla tiene sentido respecto del rol de esa pieza,
- y sentís que la alerta ya aporta una reacción más madura dentro del entorno.

Si eso está bien, ya podemos pasar a consolidar esta nueva etapa del bloque.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a consolidar esta primera capa de alerting básico de NovaMarket y a dejarla conectada al resto de refinamientos del entorno.

---

## Cierre

En esta clase definimos una primera alerta básica para una pieza importante de NovaMarket.

Con eso, el bloque de Kubernetes da otro salto fuerte de madurez: el sistema ya no solo expone, recolecta, visualiza y organiza mejor sus métricas, sino que también empieza a destacar activamente una condición relevante dentro del cluster.
