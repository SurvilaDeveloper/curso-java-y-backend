---
title: "Creando un dashboard básico para una pieza importante de NovaMarket"
description: "Primer paso concreto de la visualización útil dentro de Grafana. Creación de un dashboard básico para una pieza importante del sistema dentro del cluster."
order: 138
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Creando un dashboard básico para una pieza importante de NovaMarket

En la clase anterior dejamos claro algo importante:

- tener Grafana no es lo mismo que tener una visualización realmente útil,
- y además NovaMarket ya está lo suficientemente maduro dentro del cluster como para que un primer dashboard básico tenga mucho sentido.

Ahora toca el paso concreto:

**crear un dashboard básico para una pieza importante del sistema.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- elegida una pieza importante del sistema para inaugurar esta etapa,
- construido un dashboard básico pero útil dentro de Grafana,
- y mucho más claro cómo se transforma una colección de métricas en una lectura más práctica del entorno.

Todavía no vamos a construir un dashboard gigante.  
La meta de hoy es mucho más concreta: **crear un tablero simple, claro y realmente útil**.

---

## Estado de partida

Partimos de un sistema donde ya tenemos:

- métricas básicas
- exposición orientada a Prometheus
- scraping real
- Grafana desplegado
- y una primera visualización cuantitativa del entorno

Eso significa que el siguiente paso natural ya no está del lado de la infraestructura, sino del lado de la organización visual:

- ahora necesitamos un tablero que ayude a leer mejor una pieza importante del sistema.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir una pieza importante del sistema,
- seleccionar unas pocas métricas útiles,
- organizarlas en un dashboard simple dentro de Grafana,
- y dejar lista una primera visualización con valor real para el trabajo sobre el cluster.

---

## Qué pieza conviene elegir primero

Para esta primera iteración, sigue teniendo mucho sentido trabajar con algo como:

- `api-gateway`
- o `order-service`

La idea es usar una pieza importante y suficientemente visible como para que el valor del dashboard se entienda rápido.

`api-gateway` suele ser una muy buena opción porque su rol es claro y sus señales suelen ser bastante representativas del entorno.

---

## Paso 1 · Elegir pocas métricas, pero bien pensadas

No hace falta empezar con veinte paneles.

A esta altura del curso, conviene elegir muy pocas señales y organizarlas bien.

Por ejemplo:

- una métrica ligada al uso
- una ligada a actividad
- y una ligada al comportamiento general del servicio

La idea es que el tablero enseñe criterio, no acumulación.

---

## Paso 2 · Pensar el dashboard como una lectura, no como una galería

Este punto vale muchísimo.

No queremos un tablero lleno de cosas sueltas.

Queremos algo que ayude a responder preguntas como:

- ¿cómo está esta pieza?
- ¿qué actividad muestra?
- ¿hay algo raro en su comportamiento?
- ¿su lectura cuantitativa acompaña lo que ya veo del entorno?

Ese cambio de enfoque es justamente el corazón de esta clase.

---

## Paso 3 · Crear el dashboard dentro de Grafana

Ahora conviene crear un dashboard nuevo y empezar a agregar paneles simples.

No hace falta todavía una estructura sofisticada.

La prioridad es que el tablero exista y que ya nos permita leer mejor la pieza elegida.

Este es uno de los momentos más importantes de toda la clase.

---

## Paso 4 · Agregar el primer panel

Para el primer panel conviene elegir algo muy claro y útil.

La idea es que el dashboard ya tenga una primera señal fuerte que permita leer algo real de la pieza importante que estamos observando.

No hace falta que el primer panel sea perfecto.  
Lo importante es que tenga sentido respecto del servicio elegido.

---

## Paso 5 · Agregar uno o dos paneles más

Ahora conviene sumar una o dos señales complementarias.

La idea es que el tablero ya no diga solo “una cosa” del sistema, sino que empiece a mostrar una lectura pequeña pero más rica de la pieza.

Este es un muy buen punto para practicar criterio:

- pocas señales
- bien elegidas
- y con una relación clara entre sí

---

## Paso 6 · Pensar el orden visual del tablero

A esta altura conviene notar algo importante:

el valor de un dashboard no está solo en las métricas que contiene, sino también en cómo se organizan visualmente.

No hace falta obsesionarse con diseño perfecto.  
Pero sí conviene que el tablero se lea con cierta lógica y no como una colección caótica de paneles.

Ese detalle mejora muchísimo la utilidad práctica de la visualización.

---

## Paso 7 · Relacionar el dashboard con el rol de la pieza

Ahora conviene mirar el tablero y preguntarse algo como:

- ¿estas señales tienen sentido para esta pieza?
- ¿me ayudan a leer mejor este servicio?
- ¿reflejan algo útil sobre su comportamiento dentro del sistema?

Ese cambio de mirada vuelve el dashboard muchísimo más valioso.

---

## Paso 8 · Entender qué cambió respecto de la etapa anterior

A esta altura conviene fijar algo muy importante:

antes, ya podíamos visualizar métricas en Grafana.

Ahora, en cambio, esas métricas empiezan a estar organizadas en una lectura concreta y reusable sobre una pieza importante del sistema.

Ese salto es uno de los más importantes de toda esta etapa.

---

## Paso 9 · No intentar todavía construir un “dashboard final”

Conviene dejarlo muy claro.

En esta etapa todavía no estamos:

- construyendo el dashboard definitivo de producción
- ni resolviendo todos los tableros que el sistema podría necesitar
- ni agotando todas las posibilidades de visualización

La meta actual es mucho más concreta:

**crear un primer dashboard básico que ya aporte valor real.**

Y eso ya es un paso muy importante.

---

## Paso 10 · Pensar por qué esto mejora todo el resto del bloque

A partir de ahora, cualquier refinamiento posterior sobre observación visual va a ser mucho más fácil de sostener porque ya existe un ejemplo concreto de dashboard útil dentro del entorno.

Eso significa que esta clase no solo vale por sí misma.

También prepara muy bien:

- visualizaciones más maduras
- comparaciones más claras de señales
- y una observación mucho más usable del sistema en el trabajo diario

Ese efecto transversal vale muchísimo.

---

## Qué estamos logrando con esta clase

Esta clase instala el primer dashboard básico real dentro del bloque de Kubernetes.

Ya no estamos solo viendo métricas sueltas dentro de Grafana.  
Ahora también empezamos a organizarlas en una lectura más útil y más práctica de una pieza importante del sistema.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos este dashboard como checkpoint del bloque
- ni lo conectamos todavía como parte estable de la lectura del entorno

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**crear un dashboard básico con valor real para una pieza importante del sistema.**

---

## Errores comunes en esta etapa

### 1. Querer meter demasiadas métricas desde el primer dashboard
Conviene empezar chico y claro.

### 2. Elegir paneles sin pensar qué pregunta ayudan a responder
El valor está en la lectura, no solo en la gráfica.

### 3. Tratar el dashboard como una galería desordenada
La organización importa mucho.

### 4. Pensar que esto ya tiene que quedar final
Para esta etapa, una primera versión útil es más que suficiente.

### 5. Elegir una pieza poco representativa para empezar
Conviene arrancar donde el valor del tablero sea claro.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería tener un primer dashboard básico dentro de Grafana para una pieza importante del sistema.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- elegiste una pieza importante del sistema,
- el dashboard ya existe,
- contiene pocas señales pero con sentido,
- y sentís que ya te ayuda a leer mejor esa pieza dentro del cluster.

Si eso está bien, ya podemos pasar a consolidar esta nueva etapa del bloque.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a consolidar esta primera visualización útil de NovaMarket y a dejarla conectada al resto de refinamientos del entorno.

---

## Cierre

En esta clase creamos un dashboard básico para una pieza importante de NovaMarket.

Con eso, el bloque de Kubernetes da otro salto fuerte de madurez: el sistema ya no solo expone, recolecta y visualiza métricas, sino que también empieza a organizarlas en una forma realmente útil para leer mejor su comportamiento dentro del cluster.
