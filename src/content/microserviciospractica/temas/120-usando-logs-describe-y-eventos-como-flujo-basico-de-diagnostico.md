---
title: "Usando logs, describe y eventos como flujo básico de diagnóstico"
description: "Primer paso concreto del troubleshooting operativo en Kubernetes. Uso de logs, descripción de recursos y eventos del cluster para leer y diagnosticar NovaMarket con criterio."
order: 120
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Usando logs, `describe` y eventos como flujo básico de diagnóstico

En la clase anterior abrimos una nueva etapa muy importante del bloque de Kubernetes:

- entendimos por qué el troubleshooting operativo ya tiene sentido,
- y dejamos claro que el cluster ya es lo suficientemente rico como para que diagnosticarlo deje de ser algo improvisado.

Ahora toca el paso concreto:

**usar un flujo básico de diagnóstico sobre NovaMarket dentro de Kubernetes.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- instalada una secuencia simple y razonable de troubleshooting,
- entendido cómo usar logs, descripción de recursos y eventos del cluster como señales complementarias,
- y preparada una base muy útil para leer mejor qué le pasa a NovaMarket dentro del entorno Kubernetes.

Todavía no vamos a construir un sistema completo de observabilidad.  
La meta de hoy es mucho más concreta: **aprender a leer bien lo básico del cluster**.

---

## Estado de partida

Partimos de un entorno donde ya existe una reconstrucción bastante rica del sistema y donde varios refinamientos operativos ya están en juego:

- probes
- recursos
- escalado
- actualizaciones controladas
- y configuración externalizada

Eso significa que, cuando algo no se comporta como esperamos, ya hay muchas capas posibles donde conviene mirar.

Justamente por eso necesitamos una secuencia de lectura más clara.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- definir una secuencia básica de diagnóstico,
- usar logs como primera señal fuerte,
- usar descripción del recurso para agregar contexto operativo,
- usar eventos del cluster para completar la lectura,
- y dejar un patrón reusable para el resto del curso.

---

## Qué queremos resolver exactamente

Queremos evitar una forma caótica de troubleshooting del tipo:

- mirar cualquier cosa
- tocar cualquier cosa
- y esperar que algo se arregle

En lugar de eso, queremos una secuencia más sana y más útil como esta:

1. identificar el recurso afectado  
2. mirar logs  
3. describir el recurso  
4. revisar eventos  
5. recién ahí decidir qué hipótesis tiene más sentido  

Ese cambio de enfoque vale muchísimo.

---

## Paso 1 · Elegir una pieza concreta para practicar el flujo

Para esta clase, conviene usar una pieza importante del sistema, por ejemplo:

- `api-gateway`
- `order-service`
- o el servicio donde más claramente se perciba alguna duda operativa del entorno

La idea es practicar el patrón en algo real y no en un ejemplo artificialmente aislado.

---

## Paso 2 · Empezar por logs

El primer paso del flujo suele ser mirar logs del Pod o de la pieza afectada.

¿Por qué empezar por ahí?

Porque muchas veces los logs ya nos dan la primera pista fuerte sobre cosas como:

- fallos de arranque
- configuración faltante
- probes mal resueltas
- o problemas funcionales del servicio

No siempre alcanza, pero suele ser una muy buena primera ventana al problema.

---

## Paso 3 · Entender qué buscar en los logs

No se trata solo de “leer texto”.

Conviene entrar buscando cosas concretas como:

- errores repetidos
- fallos de inicialización
- mensajes de configuración
- problemas de conexión
- o transiciones raras del servicio

La idea es pasar de una lectura pasiva a una lectura orientada por hipótesis.

Ese pequeño cambio mejora muchísimo el troubleshooting.

---

## Paso 4 · Pasar a `describe`

Después de logs, el siguiente paso muy valioso es describir el recurso que estamos analizando.

¿Por qué?

Porque ahí aparece un contexto que los logs no siempre muestran claramente, por ejemplo:

- cómo está definido el Pod o el `Deployment`
- qué condiciones está viendo el cluster
- cómo están las probes
- qué imagen corre
- o qué estado operativo tiene la pieza desde la perspectiva de Kubernetes

Este paso es fundamental porque suma la mirada del cluster, no solo la de la aplicación.

---

## Paso 5 · Entender qué agrega `describe` respecto de logs

Los logs cuentan mucho sobre la aplicación.

`describe`, en cambio, suele contar mucho más sobre:

- el recurso
- su ciclo de vida
- y lo que Kubernetes está percibiendo sobre él

Es decir:

- logs = mirada de la app
- `describe` = mirada del recurso dentro del cluster

Esa combinación es una de las claves más fuertes del flujo básico de diagnóstico.

---

## Paso 6 · Revisar eventos del cluster

Ahora viene el tercer componente fuerte del flujo:

**eventos**

Los eventos ayudan muchísimo porque muchas veces dejan rastros de cosas como:

- reinicios
- fallos de imagen
- problemas de scheduling
- problemas de probes
- transiciones de estado
- o comportamientos del controlador del recurso

No hace falta tratarlos como una fuente mágica de verdad absoluta, pero sí como una pista muy valiosa para completar la lectura.

---

## Paso 7 · Entender por qué eventos completan muy bien la lectura

A esta altura del bloque ya conviene fijar algo importante:

- logs me dicen mucho de la aplicación
- `describe` me dice mucho del recurso
- eventos me ayudan a entender mejor qué estuvo pasando en el cluster alrededor de esa pieza

Esa triangulación es justamente el corazón del flujo básico de troubleshooting que queremos instalar con esta clase.

---

## Paso 8 · Construir una primera hipótesis

Después de logs, `describe` y eventos, recién ahí conviene empezar a formular hipótesis del tipo:

- parece un problema de configuración
- parece un problema de probe
- parece un problema de recursos
- parece un problema de actualización
- parece un problema de salud de la aplicación

Lo importante es el orden:

**primero leer, después inferir.**

Ese cambio de secuencia mejora muchísimo la calidad del diagnóstico.

---

## Paso 9 · Pensar por qué este flujo es tan valioso para NovaMarket

Porque NovaMarket ya tiene dentro del cluster un nivel de complejidad suficiente como para que los problemas no vivan todos en el mismo lugar.

A veces el síntoma va a aparecer más en:

- logs

otras veces más en:

- el estado del Pod
- el `Deployment`
- las probes
- o los eventos del entorno

Por eso este flujo básico no es un capricho: es una forma mucho más madura de leer el sistema.

---

## Paso 10 · Dejar el patrón explícito

A esta altura conviene dejar bien claro el patrón que queremos conservar:

1. identificar la pieza afectada  
2. mirar logs  
3. describir el recurso  
4. revisar eventos  
5. recién después construir hipótesis  

Este pequeño esquema puede parecer simple, pero para el resto del curso tiene muchísimo valor práctico.

---

## Qué estamos logrando con esta clase

Esta clase instala una primera metodología de troubleshooting operativo dentro del bloque.

Ya no estamos solo diciendo “hay que diagnosticar mejor”.  
Ahora ya tenemos un flujo básico, reutilizable y muy valioso para leer NovaMarket dentro de Kubernetes con mucho más criterio.

Eso es un salto fuerte de madurez.

---

## Qué todavía no hicimos

Todavía no:

- aplicamos este flujo a un escenario más integrado
- ni lo usamos como checkpoint fuerte de lectura del entorno completo

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**instalar el flujo básico de diagnóstico operativo del bloque.**

---

## Errores comunes en esta etapa

### 1. Mirar solo logs y no completar la lectura con el estado del recurso
Eso deja el diagnóstico a medias.

### 2. Ir directo a eventos sin entender primero qué recurso estamos leyendo
Conviene sostener el orden del flujo.

### 3. Formular hipótesis demasiado pronto
Primero leer, después inferir.

### 4. Usar `describe` como si reemplazara a los logs
En realidad se complementan.

### 5. Quedarse con una lectura demasiado caótica del cluster
Justamente queremos empezar a reemplazar eso por un patrón más claro.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una secuencia básica y razonable de troubleshooting para NovaMarket dentro de Kubernetes apoyada en:

- logs
- descripción del recurso
- y eventos del cluster

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés por qué logs no alcanzan por sí solos,
- entendés qué agrega `describe`,
- entendés qué aportan los eventos,
- y ya tenés claro un flujo simple de diagnóstico para reutilizar después.

Si eso está bien, ya podemos usar ese flujo en un checkpoint más integrado sobre el entorno.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a aplicar este flujo básico de troubleshooting sobre una lectura más integrada de NovaMarket dentro del cluster.

Ese será el paso que consolide esta nueva etapa operativa del bloque.

---

## Cierre

En esta clase usamos logs, `describe` y eventos como flujo básico de diagnóstico.

Con eso, NovaMarket ya no solo vive dentro del cluster de una forma bastante rica: también empieza a ser un entorno que sabemos leer mejor, con más método, más criterio y mucha más utilidad práctica.
