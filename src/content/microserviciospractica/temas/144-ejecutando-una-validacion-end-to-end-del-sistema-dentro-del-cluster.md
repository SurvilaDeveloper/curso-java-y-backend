---
title: "Ejecutando una validación end-to-end del sistema dentro del cluster"
description: "Primer paso concreto del cierre operativo de NovaMarket. Ejecución de una validación integral del flujo principal y del entorno que lo sostiene dentro de Kubernetes."
order: 144
module: "Módulo 13 · Cierre operativo de NovaMarket"
level: "intermedio"
draft: false
---

# Ejecutando una validación end-to-end del sistema dentro del cluster

En la clase anterior dejamos claro algo importante:

- NovaMarket ya está lo suficientemente maduro como para que un checkpoint final de conjunto tenga sentido,
- y además el proyecto ya cuenta con suficientes capas funcionales y operativas como para ser validado como sistema completo dentro del cluster.

Ahora toca el paso concreto:

**ejecutar una validación end-to-end del sistema dentro de Kubernetes.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- ejecutado un checkpoint integral del flujo principal del sistema,
- revisado cómo conviven negocio y entorno operativo durante ese recorrido,
- y mucho más claro qué tan sólido quedó NovaMarket como proyecto práctico dentro del cluster.

Todavía no vamos a cerrar el curso con un checklist final completo.  
La meta de hoy es mucho más concreta: **hacer una validación seria del sistema como conjunto**.

---

## Estado de partida

Partimos de un entorno donde ya tenemos:

- flujo principal implementado
- servicios importantes del sistema vivos dentro del cluster
- gateway e `Ingress`
- configuración externalizada
- probes
- recursos
- escalado
- Prometheus
- Grafana
- dashboards básicos
- y una primera capa básica de alerting

Eso significa que el proyecto ya no necesita otra clase de construcción para justificarse como sistema.

Ahora lo importante es comprobar qué tan bien cierra todo eso junto.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- recorrer el flujo principal del sistema de punta a punta,
- observar qué pasa en la capa funcional,
- revisar cómo acompaña el entorno operativo ese recorrido,
- y dejar una primera validación integral bastante seria del proyecto dentro del cluster.

---

## Qué queremos resolver exactamente

Queremos pasar de este estado:

- “sé que las piezas existen y varias de ellas ya fueron validadas en distintos momentos”

a un estado mucho más fuerte como este:

- “sé que el sistema, como conjunto, sigue recorriéndose bien dentro del cluster y además sé leer cómo lo acompaña el entorno operativo”

Ese cambio es uno de los más importantes de todo el cierre del curso.

---

## Paso 1 · Elegir claramente el flujo principal a validar

Para esta etapa del curso, el candidato más natural sigue siendo el flujo central de NovaMarket, por ejemplo:

- entrada por `api-gateway`
- llegada a la lógica principal del negocio
- integración entre servicios relevantes
- y observación de la reacción del entorno durante ese recorrido

La idea es trabajar sobre el corazón real del proyecto y no sobre un caso periférico.

---

## Paso 2 · Validar la entrada al sistema

Ahora conviene empezar por la puerta natural del entorno:

- `api-gateway`
- y la forma real de acceso que ya construimos dentro del cluster

Queremos confirmar que el proyecto sigue siendo accesible desde la capa que hace de entrada principal del sistema.

Este es un muy buen primer checkpoint porque conecta enseguida la arquitectura con el uso real del proyecto.

---

## Paso 3 · Ejecutar el flujo funcional principal

Ahora sí, conviene disparar el flujo principal del negocio.

La idea es validar que:

- la request entra correctamente
- alcanza la lógica adecuada
- y el sistema sigue recorriendo el corazón funcional que venimos construyendo desde hace tantas clases

Este es uno de los momentos más importantes de todo el curso práctico.

---

## Paso 4 · Observar la capa funcional durante el recorrido

A esta altura del bloque ya no alcanza con ver solo la respuesta final.

Conviene también mirar qué pasa dentro de las piezas que sostienen el flujo, por ejemplo:

- `order-service`
- `inventory-service`
- `notification-service`

o las que correspondan al recorrido que elegiste como central.

La idea es confirmar que el flujo sigue siendo real y no solo una ilusión de borde.

---

## Paso 5 · Revisar la salud del entorno alrededor del flujo

Ahora conviene sumar otra capa de lectura:

- cómo están los Pods
- cómo se comportan las probes
- si hay señales raras en el entorno
- y si el cluster sigue acompañando bien el recorrido del sistema

Esto importa mucho porque el cierre del curso no quiere validar solo negocio.  
Quiere validar también el entorno que sostiene ese negocio.

---

## Paso 6 · Cruzar el recorrido con observación cuantitativa

A esta altura del curso ya tiene mucho sentido aprovechar también la observación cuantitativa que construimos.

Por ejemplo:

- mirar qué señales aparecen en Prometheus
- o qué muestra Grafana para la pieza importante involucrada

No hace falta convertir esta clase en una auditoría infinita.

La idea es confirmar que la validación end-to-end ya no vive solo en la lógica de negocio, sino también en una lectura operativa más rica del sistema.

---

## Paso 7 · Revisar si el alerting básico mantiene coherencia con el recorrido

Si la pieza elegida para alerting forma parte del flujo o lo acompaña de alguna manera, este es un buen momento para revisar también si esa capa sigue teniendo sentido y acompaña correctamente la lectura del sistema.

La idea no es provocar una tormenta de alertas.

La idea es confirmar que el proyecto ya no solo se usa y se observa mejor, sino que también empieza a tener una capa básica de señalización coherente con su operación.

---

## Paso 8 · Entender qué cambió respecto de etapas anteriores

A esta altura conviene fijar algo muy importante:

antes, el proyecto ya había sido validado por piezas y por bloques.

Ahora, en cambio, lo estamos leyendo como:

- un sistema de negocio
- sostenido por un entorno técnico
- y observado por una capa operativa bastante más madura

Ese salto es uno de los más fuertes de todo el curso.

---

## Paso 9 · No intentar todavía un cierre documental absoluto

Conviene dejarlo claro.

En esta etapa todavía no estamos:

- escribiendo la conclusión final del proyecto
- ni construyendo una memoria total de todo el curso
- ni intentando resolver todos los escenarios posibles

La meta actual es mucho más concreta:

**ejecutar una validación integral y seria del sistema dentro del cluster.**

Y eso ya aporta muchísimo valor.

---

## Paso 10 · Pensar por qué esto mejora muchísimo el cierre del curso

A partir de ahora, cualquier cierre del curso va a ser mucho más sólido porque ya no dependerá solo de “haber construido muchas cosas”.

Ahora también puede apoyarse en algo más fuerte:

- una validación de conjunto
- sobre el sistema real
- dentro del entorno real
- con observación operativa bastante madura

Ese valor pedagógico y técnico es enorme.

---

## Qué estamos logrando con esta clase

Esta clase instala la validación end-to-end más importante del tramo final del curso.

Ya no estamos solo diciendo que NovaMarket quedó bien construido.  
Ahora también empezamos a mostrar que puede leerse y validarse como sistema completo dentro del cluster.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- cerramos el curso con un checklist operativo final
- ni consolidamos todavía un criterio de “proyecto redondo” dentro del entorno

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**ejecutar una validación end-to-end seria del sistema dentro del cluster.**

---

## Errores comunes en esta etapa

### 1. Querer hacer un cierre integral sin recorrer el flujo principal real
Conviene apoyarse en el corazón del proyecto.

### 2. Mirar solo la respuesta funcional y no el entorno que la sostiene
El cierre del curso vale por ambas cosas juntas.

### 3. No usar las capas operativas que construimos antes
Prometheus, Grafana y alerting aportan muchísimo a esta validación.

### 4. Convertir la clase en una revisión infinita de todo
Conviene mantener foco y criterio.

### 5. Pensar que este paso es solo simbólico
En realidad es una de las validaciones más fuertes de todo el curso.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías haber validado que NovaMarket sigue recorriéndose bien de punta a punta dentro del cluster y que el entorno operativo que construimos acompaña de forma bastante sólida ese flujo principal.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- el flujo principal se ejecuta bien,
- la capa funcional responde,
- el entorno acompaña correctamente,
- la observación cuantitativa sigue teniendo sentido,
- y sentís que NovaMarket ya puede leerse como un sistema completo dentro del cluster.

Si eso está bien, ya podemos pasar a consolidar el cierre práctico del proyecto.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a consolidar un checklist final operativo del entorno y del proyecto para cerrar NovaMarket como curso práctico de una forma mucho más redonda.

---

## Cierre

En esta clase ejecutamos una validación end-to-end del sistema dentro del cluster.

Con eso, el curso práctico da uno de sus últimos saltos fuertes de madurez: NovaMarket ya no solo está construido y refinado por partes, sino que también empieza a validarse con claridad como sistema completo dentro de Kubernetes.
