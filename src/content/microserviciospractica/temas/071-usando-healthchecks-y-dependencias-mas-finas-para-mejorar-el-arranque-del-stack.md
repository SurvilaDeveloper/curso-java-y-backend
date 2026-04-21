---
title: "Usando healthchecks y dependencias más finas para mejorar el arranque del stack"
description: "Siguiente paso práctico del módulo 8. Uso de healthchecks y dependencias más expresivas para volver más fino y menos frágil el arranque del stack de NovaMarket en Compose."
order: 71
module: "Módulo 8 · Docker Compose para NovaMarket"
level: "intermedio"
draft: false
---

# Usando healthchecks y dependencias más finas para mejorar el arranque del stack

En la clase anterior dimos un paso muy importante dentro del bloque de Compose:

- agregamos healthchecks a `config-server`,
- agregamos healthchecks a `discovery-server`,
- y con eso el entorno dejó de decir solamente “los contenedores existen” para empezar a decir algo bastante mejor sobre la salud real de esas piezas.

Eso ya tiene muchísimo valor.

Pero ahora toca el siguiente paso natural:

**usar esa información de salud para volver más fino y menos frágil el arranque del stack.**

Ese es el objetivo de esta clase.

Porque una cosa es tener healthchecks visibles.

Y otra bastante distinta es dejar que esa información participe de verdad en cómo se ordena el arranque del sistema.

Ese cambio es exactamente el que vamos a dar ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más claro cómo usar healthchecks para mejorar la lógica de dependencias del stack,
- refinado el arranque de piezas que dependen de infraestructura base,
- reducida una parte de la fragilidad del startup del entorno,
- y NovaMarket con una primera mejora real de coordinación dentro de Compose.

La meta de hoy no es resolver todavía toda la auto-recuperación del sistema.  
La meta es mucho más concreta: **hacer que la composición use mejor la información de salud que ya empezamos a describir.**

---

## Estado de partida

Partimos de un sistema donde ya:

- la composición incluye infraestructura, núcleo y borde,
- `config-server` y `discovery-server` ya tienen healthchecks,
- y además el módulo ya dejó claro que no alcanza siempre con un simple orden superficial de creación de contenedores.

Eso significa que el problema ya no es si podemos medir salud.  
Ahora la pregunta útil es otra:

- **cómo usamos esa salud para volver más coherente el arranque del resto del sistema**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar por qué la salud de la infraestructura base debería influir en otras piezas,
- refinar `depends_on` para expresar mejor esa lógica,
- levantar la composición mejorada,
- y validar qué nueva estabilidad conceptual gana NovaMarket después de ese cambio.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- Compose puede ver mejor la salud de `config-server` y `discovery-server`.

Eso fue un gran salto.

Pero a medida que el sistema madura, aparece otra necesidad muy concreta:

**que los servicios que dependen de infraestructura base no arranquen de una forma demasiado ciega respecto del estado real de esas piezas.**

Porque ahora conviene hacerse preguntas como:

- ¿tiene sentido que `catalog-service` se lance apenas se crea el contenedor de `config-server`, aunque este todavía no esté sano?
- ¿tiene sentido que el gateway arranque sin esperar una mínima señal de salud de infraestructura?
- ¿podemos hacer que el archivo exprese mejor la realidad del sistema sin convertirlo todavía en algo exageradamente complejo?

Ese cambio de enfoque es justamente el corazón de esta clase.

---

## Qué mejora de dependencia conviene usar ahora

A esta altura del módulo, una mejora muy razonable es pasar de un `depends_on` demasiado simple a una forma más expresiva donde algunas dependencias se aten a una condición de servicio sano.

Conceptualmente, la idea es esta:

- no solo “dependo de que exista”
- sino
- “dependo de que esté suficientemente sano como para que tenga sentido seguir”

Ese matiz es importantísimo.

---

## Paso 1 · Revisar una dependencia simple actual

Tomemos un ejemplo como `catalog-service`.

Hasta ahora podría verse conceptualmente así:

```yaml
catalog-service:
  image: novamarket/catalog-service:dev
  depends_on:
    - config-server
    - discovery-server
```

Eso expresa intención, sí.

Pero todavía no distingue entre:

- contenedor creado
- y servicio realmente sano

Ese es justamente el punto que ahora queremos mejorar.

---

## Paso 2 · Refinar `depends_on` con una condición más fuerte

Una forma más expresiva y mucho más alineada con el nuevo estado del bloque podría verse conceptualmente así:

```yaml
catalog-service:
  image: novamarket/catalog-service:dev
  depends_on:
    config-server:
      condition: service_healthy
    discovery-server:
      condition: service_healthy
```

Esta versión ya dice algo muchísimo más fuerte:

- `catalog-service` no solo espera una creación superficial,
- espera una señal de salud sobre esas piezas base.

Ese cambio vuelve al archivo mucho más serio.

---

## Paso 3 · Aplicar la misma lógica a otros servicios del stack

Ahora conviene extender la idea a:

- `inventory-service`
- `order-service`
- y `api-gateway`

siempre con bastante criterio y sin sobrediseñar.

La idea general es bastante clara:

- todo servicio que dependa de infraestructura base
- puede empezar a expresarlo de una forma más fina si esa infraestructura ya tiene healthchecks razonables

Eso vuelve muchísimo más ordenada la composición.

---

## Paso 4 · Pensar qué pasa con `api-gateway`

Este punto importa mucho.

`api-gateway` es una pieza especialmente interesante acá porque depende conceptualmente de varias capas:

- infraestructura base
- y además del ecosistema general del sistema

No hace falta todavía volverlo dependiente “saludable” de todo y de todos.

Pero sí tiene muchísimo sentido expresar mejor al menos su relación con:

- `config-server`
- `discovery-server`

Ese primer refinamiento ya aporta bastante valor.

---

## Paso 5 · Entender qué mejora estamos logrando realmente

Conviene ser muy precisos.

Lo que estamos mejorando acá no es “el tiempo de arranque” como si fuera una carrera.

Lo que estamos mejorando es algo más importante:

- la coherencia del arranque del stack,
- y la legibilidad operativa del archivo.

Ese cambio parece sutil, pero vale muchísimo.

Porque reduce una parte de la fragilidad conceptual del entorno.

---

## Paso 6 · Levantar nuevamente la composición refinada

Ahora sí, levantá otra vez la composición con los cambios:

```bash
docker compose up
```

o:

```bash
docker compose up -d
```

La idea es observar que el entorno ya no solo tiene healthchecks visibles, sino que además empieza a usarlos como parte de su lógica de arranque.

Ese es uno de los momentos más importantes de toda la clase.

---

## Paso 7 · Revisar el comportamiento del arranque

No hace falta obsesionarse con una secuencia perfecta milimétrica.

Lo importante ahora es leer algo más valioso:

- que el archivo expresa mejor la intención del sistema,
- y que el arranque de varias piezas ya no está tan separado del estado real de la infraestructura base.

Ese cambio importa muchísimo aunque todavía no resuelva todas las complejidades de un entorno final.

---

## Paso 8 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene un startup totalmente robusto y perfecto”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya usa healthchecks y dependencias más finas para reducir una parte real de la fragilidad del arranque.

Ese matiz es muchísimo más sano.

---

## Paso 9 · Pensar por qué esta clase mejora tanto el módulo

A esta altura conviene fijar algo importante:

esta clase vale muchísimo porque transforma healthchecks en algo operativo.

Antes eran una señal visible.

Ahora además participan de la forma en que el sistema se ordena y arranca.

Ese salto entre observación y uso práctico es uno de los más valiosos del subbloque.

---

## Qué estamos logrando con esta clase

Esta clase usa healthchecks y dependencias más finas para mejorar el arranque del stack de NovaMarket.

Ya no estamos solo describiendo salud dentro del Compose.  
Ahora también estamos haciendo que esa salud empiece a influir de forma explícita en la coordinación del entorno.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- cerramos este subbloque con un checkpoint fuerte,
- ni decidimos todavía si conviene seguir refinando Compose o pasar al siguiente gran frente del proyecto.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**hacer que el arranque del stack se apoye mejor en la salud real de la infraestructura base.**

---

## Errores comunes en esta etapa

### 1. Pensar que healthcheck solo sirve para mirar estados
También puede mejorar la lógica del arranque.

### 2. Querer hacer depender todo de todo
Conviene introducir estas dependencias con criterio.

### 3. Confundir arranque más fino con robustez total del entorno
Todavía estamos en una primera capa seria, no en la solución final.

### 4. No revisar si la sintaxis de dependencias sigue siendo coherente con el archivo actual
La claridad del Compose sigue siendo central.

### 5. No reconocer el valor del cambio
Ahora el archivo ya no solo dice “qué levantar”, también empieza a decir mejor “cuándo tiene sentido seguir”.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- la composición no solo conoce la salud de la infraestructura base,
- también empieza a usarla para expresar mejor el arranque del resto del sistema,
- y NovaMarket ya ganó una primera mejora real de coordinación dentro de Compose.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué mejora aporta `condition: service_healthy`,
- ves la diferencia entre dependencia superficial y dependencia más rica,
- entendés que no estamos resolviendo todavía todo el startup del stack,
- y sentís que el entorno ya dejó de ser tan ingenuo en su forma de arrancar.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar este subbloque de salud y arranque fino dentro del Compose.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de healthchecks y arranque más fino dentro de Compose, leyendo con más claridad qué nueva postura ganó NovaMarket en su entorno multicontenedor.

---

## Cierre

En esta clase usamos healthchecks y dependencias más finas para mejorar el arranque del stack.

Con eso, NovaMarket deja de tratar a Compose solo como una forma declarativa de levantar contenedores y empieza a usarlo también como una herramienta más seria para coordinar mejor la salud y el orden lógico del entorno integrado.
