---
title: "Entendiendo por qué trazabilidad distribuida y Zipkin ya tienen sentido en NovaMarket"
description: "Siguiente paso del módulo 12. Comprensión de por qué, después de correlation id y logs correlacionados, ya conviene abrir trazabilidad distribuida más rica con Zipkin."
order: 128
module: "Módulo 12 · Observabilidad"
level: "intermedio"
draft: false
---

# Entendiendo por qué trazabilidad distribuida y Zipkin ya tienen sentido en NovaMarket

En la clase anterior cerramos algo muy importante dentro del bloque de observabilidad:

- ya existe un `correlation id`,
- ese hilo ya puede verse en logs del gateway y de servicios,
- y NovaMarket ya dejó de mirar una request distribuida como un conjunto de eventos completamente separados.

Eso ya tiene muchísimo valor.

Pero ahora aparece una pregunta muy natural:

**si ya podemos seguir mejor una request entre varias piezas, cómo hacemos para ver con más claridad su recorrido completo, sus tiempos y sus saltos entre servicios sin depender solo de leer logs manualmente?**

Ese es el terreno de esta clase.

Porque una cosa es tener:

- un id compartido,
- y logs correlacionados.

Y otra bastante distinta es poder ver:

- qué tramos recorrió una request,
- cuánto tardó cada tramo,
- qué servicio llamó a cuál,
- y dónde estuvo el cuello de botella o el fallo dentro de una cadena distribuida.

Ese es exactamente el siguiente problema que conviene abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro qué es trazabilidad distribuida en este contexto,
- entendida la diferencia entre logs correlacionados y trazas distribuidas más ricas,
- visible por qué Zipkin ya tiene sentido en este punto del proyecto,
- y preparado el terreno para introducir una primera integración práctica en la próxima clase.

Todavía no vamos a instalar todo el stack del bloque.  
La meta de hoy es mucho más concreta: **entender por qué el siguiente gran salto de observabilidad es dejar de reconstruir el flujo solo a mano y empezar a verlo como una traza distribuida**.

---

## Estado de partida

Partimos de un sistema donde ya:

- las requests pueden tener correlation id,
- varios logs ya muestran ese hilo compartido,
- y el módulo ya dejó claro que ahora hay una base mínima para entender mejor lo que pasa entre gateway y servicios.

Eso significa que el problema ya no es cómo unir mensajes.

Ahora la pregunta útil es otra:

- **cómo obtenemos una visión más estructurada y más rica del recorrido de una request distribuida**

Y eso es exactamente lo que vamos a resolver en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué significa trazabilidad distribuida,
- entender qué valor agrega sobre la correlación básica,
- conectar esta idea con el estado actual de NovaMarket,
- y dejar clara la lógica del siguiente paso práctico del bloque.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- el sistema ya puede relacionar mejor eventos de una misma operación.

Eso fue un gran salto.

Pero a medida que el bloque madura, aparece otra necesidad muy concreta:

**que el recorrido de una request ya no dependa solamente de leer varios logs y reconstruir mentalmente el camino.**

Porque ahora conviene hacerse preguntas como:

- ¿qué llamada salió desde gateway a `order-service`?
- ¿cuánto tardó?
- ¿desde ahí hubo una llamada a `inventory-service`?
- ¿qué tramo fue el más lento?
- ¿qué parte del flujo falló primero?
- ¿cómo veo esa cadena completa de forma más estructurada?

Ese cambio de enfoque es justamente el corazón de esta etapa.

---

## Qué es trazabilidad distribuida en este contexto

Para esta etapa del curso, una forma útil de pensarlo es esta:

**trazabilidad distribuida es la capacidad de representar y seguir el recorrido de una misma operación a través de varias piezas del sistema, conservando relación temporal y causal entre sus distintos tramos.**

Esa idea es central.

No es solo “tener un id”.

Es poder ver algo más rico como:

- esta request empezó acá,
- después pasó por este servicio,
- luego llamó a este otro,
- acá tardó más,
- y acá terminó o falló.

Ese salto vale muchísimo.

---

## Por qué no alcanza solo con logs correlacionados

Este punto importa muchísimo.

Los logs correlacionados ya mejoraron muchísimo la lectura del sistema.

Pero todavía tienen una limitación importante:

- siguen requiriendo bastante reconstrucción manual,
- y no siempre muestran de forma clara la estructura temporal del recorrido completo.

Eso significa que ahora ya tiene sentido dar otro paso:

- conservar la correlación,
- pero sumarle una forma más explícita de ver recorridos, tiempos y relaciones entre tramos.

Ese matiz es exactamente lo que hace natural la apertura de este bloque.

---

## Qué papel cumple Zipkin en este contexto

A esta altura del curso, una forma útil de pensarlo es esta:

**Zipkin es una herramienta que permite recolectar y visualizar trazas distribuidas para ver cómo una operación atraviesa distintos servicios y cuánto tarda en cada tramo.**

Esa idea es central.

No reemplaza logs.  
No reemplaza seguridad.  
No reemplaza resiliencia.

Hace otra cosa:

- ayuda a observar el recorrido distribuido de una request de una forma mucho más estructurada y visual.

Ese matiz importa muchísimo.

---

## Cómo se traduce esto a NovaMarket

A esta altura del bloque, uno de los casos más naturales sigue siendo:

- una request entra por gateway,
- llega a `order-service`,
- y desde ahí depende de `inventory-service`

Hoy ya podemos seguir mejor ese flujo con correlation id y logs.

Pero con trazabilidad distribuida podríamos aspirar a ver algo mucho más rico:

- el árbol o cadena de esa request,
- los tiempos relativos,
- y los puntos más lentos o problemáticos.

Ese salto es exactamente el corazón práctico del siguiente tramo.

---

## Qué gana NovaMarket con Zipkin o trazabilidad más rica

Aunque todavía no lo apliquemos en esta clase, el valor ya se puede ver con claridad.

A partir de trazabilidad distribuida más rica, NovaMarket puede ganar cosas como:

- diagnóstico mucho más rápido,
- mejor lectura de cuellos de botella,
- mejor observación de llamadas entre servicios,
- y una base mucho más fuerte para entender cómo se comporta realmente el sistema cuando las requests atraviesan varias piezas.

Eso vuelve al proyecto muchísimo más maduro desde el punto de vista operativo.

---

## Por qué este paso aparece ahora y no antes

Esto también importa mucho.

Si todavía no tuviéramos:

- varios servicios reales,
- gateway,
- correlation id,
- y logs ya algo más correlacionados,

abrir Zipkin sería bastante prematuro o demasiado mágico.

Pero ahora el sistema ya tiene suficiente complejidad y ya existe una primera base mínima de correlación.

Entonces el siguiente salto natural es:

- dejar de unir todo solo a mano
- y empezar a observar recorridos distribuidos de forma mucho más estructurada.

Ese orden es excelente.

---

## Qué todavía no estamos haciendo en esta etapa

Conviene dejar esto muy claro.

En este punto todavía no estamos:

- levantando todavía Zipkin,
- ni agregando aún dependencias o exporters,
- ni viendo todavía trazas reales en una interfaz.

La meta actual es mucho más concreta:

**abrir correctamente el subbloque de trazabilidad distribuida más rica y Zipkin.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no integra todavía Zipkin, pero hace algo muy importante:

**abre explícitamente el siguiente frente lógico del módulo 12: pasar de correlación y logs mejorados a una visión distribuida mucho más estructurada del recorrido real de las requests.**

Eso importa muchísimo, porque NovaMarket deja de madurar solo desde señales sueltas mejor correlacionadas y empieza a prepararse para otra mejora clave: poder ver de forma más rica cómo se mueve una operación a través del sistema.

---

## Qué todavía no hicimos

Todavía no:

- levantamos todavía Zipkin,
- ni emitimos todavía trazas reales desde gateway y servicios.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué trazabilidad distribuida más rica y Zipkin ya tienen sentido en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que correlation id y Zipkin resuelven exactamente lo mismo
Se complementan, pero no aportan el mismo nivel de lectura.

### 2. Reducir trazabilidad distribuida a “más logs”
En realidad agrega estructura, tiempos y relaciones entre tramos.

### 3. Querer abrir Zipkin sin una base mínima previa
Este paso tiene mucho más sentido después de correlation id y logs correlacionados.

### 4. Suponer que logs manuales siempre alcanzan
A cierta complejidad distribuida, ya empiezan a quedarse cortos.

### 5. No ver el valor del cambio
Este bloque hace muchísimo más legible el recorrido real de una operación a través del sistema.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué trazabilidad distribuida más rica y herramientas como Zipkin ya tienen sentido en NovaMarket y por qué este paso aparece ahora como siguiente evolución natural del bloque de observabilidad.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué problema nuevo resuelve la trazabilidad distribuida,
- ves por qué logs correlacionados no siempre alcanzan,
- entendés qué valor agrega una herramienta como Zipkin,
- y sentís que el proyecto ya está listo para una primera integración práctica de este tipo.

Si eso está bien, ya podemos pasar al siguiente tema y empezar a integrar Zipkin en NovaMarket.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a sumar Zipkin al entorno y a empezar a emitir una primera capa de trazas reales desde gateway y servicios para observar recorridos distribuidos dentro de NovaMarket.

---

## Cierre

En esta clase entendimos por qué trazabilidad distribuida y Zipkin ya tienen sentido en NovaMarket.

Con eso, el proyecto deja de conformarse con correlación y logs mejorados como único modo de leer una operación distribuida y empieza a prepararse para otra mejora muy valiosa: ver de una forma mucho más estructurada, mucho más temporal y mucho más clara cómo viaja una request a través del sistema.
