---
title: "Entendiendo por qué readiness y liveness ya tienen sentido"
description: "Inicio del siguiente refinamiento operativo del bloque de Kubernetes en NovaMarket. Comprensión de por qué, después de reconstruir el sistema y ordenar su configuración, ya conviene endurecer la salud de los servicios con probes."
order: 102
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Entendiendo por qué `readiness` y `liveness` ya tienen sentido

En las últimas clases del bloque de Kubernetes dimos otro paso importante de madurez:

- externalizamos mejor la configuración del sistema,
- introdujimos `ConfigMap`,
- introdujimos `Secret`,
- y además validamos que el entorno ya puede vivir bastante bien apoyándose en esos recursos.

Eso deja a NovaMarket en un punto muy interesante:

**el cluster ya no solo aloja una parte importante del sistema, sino que además empieza a tener una configuración más seria.**

Y justamente por eso ahora aparece otra preocupación natural:

**¿cómo sabe Kubernetes si un servicio está realmente vivo y realmente listo para recibir tráfico?**

Ese es el terreno de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué `readiness` y `liveness` ya tienen sentido en este punto del bloque,
- entendido qué problema resuelven dentro del cluster,
- diferenciados ambos conceptos,
- y preparado el terreno para empezar a aplicar probes reales a los servicios de NovaMarket en las próximas clases.

Todavía no vamos a escribir las probes concretas.  
La meta de hoy es entender bien por qué ahora sí importa hacerlo.

---

## Estado de partida

Partimos de un cluster donde ya existe una reconstrucción bastante rica del sistema:

- núcleo base
- servicios funcionales
- gateway
- acceso vía `Ingress`
- circuitos importantes del negocio
- y una estrategia más madura de configuración

Eso significa que el entorno ya está lo suficientemente serio como para que la salud operativa de los Pods importe mucho más que al principio del bloque.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué problema aparece cuando un servicio “está corriendo” pero todavía no debería recibir tráfico,
- revisar qué problema aparece cuando un servicio queda vivo como proceso pero roto funcionalmente,
- distinguir el rol de `readiness` y `liveness`,
- y dejar clara la lógica que vamos a aplicar a NovaMarket después.

---

## Qué problema queremos resolver exactamente

En Kubernetes, que un contenedor esté “arriba” no siempre significa que el servicio esté en condiciones reales de participar del sistema.

Puede pasar, por ejemplo, que:

- el proceso Java ya arrancó pero la aplicación todavía no terminó de inicializar
- el servicio responde al sistema operativo, pero todavía no debería recibir tráfico
- o el proceso sigue vivo aunque internamente la app esté degradada o bloqueada

A medida que el entorno madura, estas diferencias se vuelven mucho más importantes.

---

## Por qué este paso tiene sentido justamente ahora

Porque al inicio del bloque de Kubernetes nuestra prioridad era otra:

- desplegar piezas
- validar que vivieran en el cluster
- reconstruir el flujo principal
- hacer accesible el gateway
- y seguir ordenando el entorno

Ahora, en cambio, el sistema ya vive de forma bastante sustancial dentro del cluster.

Eso hace que el siguiente refinamiento natural ya no sea “otro servicio más”, sino:

**hacer más robusta la forma en que Kubernetes interpreta la salud de los servicios que ya tenemos.**

---

## Qué rol cumple `readiness`

Para este curso práctico, una forma muy útil de pensarlo es esta:

**`readiness` responde a la pregunta “este servicio ya está listo para recibir tráfico?”**

Eso significa que aunque el Pod exista y el proceso corra, quizás todavía no convenga que el cluster le mande requests.

En una arquitectura como NovaMarket, eso importa bastante, porque varios servicios dependen de inicializar correctamente:

- configuración
- discovery
- conexiones
- contexto de aplicación

Ese matiz vale muchísimo.

---

## Qué rol cumple `liveness`

Ahora pensemos `liveness`.

Una forma útil de verlo es:

**`liveness` responde a la pregunta “este servicio sigue vivo de una forma saludable o quedó roto y conviene reiniciarlo?”**

Acá la preocupación no es tanto si ya está listo para recibir tráfico, sino si:

- el proceso quedó colgado,
- la aplicación está en un estado roto,
- o el contenedor sigue arriba pero ya no tiene sentido mantenerlo así.

Ese rol es distinto al de `readiness` y conviene separarlo muy bien desde ahora.

---

## Paso 1 · Entender por qué “arrancó” no alcanza

Este es uno de los puntos más importantes de la clase.

A medida que el sistema madura, deja de alcanzar con mirar algo como:

- “el Pod existe”
- “el proceso Java está corriendo”

Ahora hace falta una lectura más fina:

- ¿puede recibir tráfico?
- ¿debería recibir tráfico?
- ¿sigue siendo sano?
- ¿el cluster tendría que sacarlo temporalmente del circuito?
- ¿debería reiniciarlo?

Ese cambio mental es exactamente lo que abre la puerta a probes más serias.

---

## Paso 2 · Relacionarlo con NovaMarket

NovaMarket ya tiene varios servicios donde esta distinción importa mucho.

Por ejemplo:

- `config-server`
- `discovery-server`
- `api-gateway`
- `order-service`
- `notification-service`

No todos pesan igual, pero en conjunto ya forman un ecosistema donde la diferencia entre:

- “existe”
- y “está realmente listo o sano”

empieza a ser muy valiosa.

---

## Paso 3 · Conectar esto con Actuator

Este punto es especialmente importante porque el proyecto ya viene usando Actuator desde bloques anteriores.

Eso significa que el curso ya tiene una base muy buena para pensar probes de salud reales, por ejemplo apoyándose en endpoints como:

- `/actuator/health`

No hace falta todavía diseñar probes detalladas hoy.  
Pero sí conviene notar que el trabajo previo del curso ahora empieza a tener todavía más valor dentro de Kubernetes.

---

## Paso 4 · Entender qué ganamos operativamente

A medida que el entorno se vuelve más serio, estas probes aportan cosas muy valiosas como:

- mejor control del tráfico
- mejor lectura de la salud real del servicio
- reinicios más razonables cuando hace falta
- y menos dependencia de interpretar todo manualmente por logs o por intuición

En otras palabras:

**hacen que el cluster pueda tomar decisiones más inteligentes sobre los servicios.**

---

## Paso 5 · Pensar qué servicios conviene tocar primero

No todos los servicios tienen el mismo valor para empezar este refinamiento.

A esta altura del bloque, algunos candidatos muy razonables son:

- `config-server`
- `discovery-server`
- `api-gateway`
- `order-service`

¿Por qué?

Porque son piezas donde la diferencia entre “arrancó” y “está realmente lista o sana” puede pesar bastante más sobre el resto del sistema.

---

## Paso 6 · Entender por qué no hicimos esto antes

Igual que con `Ingress` o con `ConfigMap`, este paso tiene mucho más sentido ahora que al principio del bloque.

Antes necesitábamos:

- reconstruir el sistema
- validar circuitos
- y hacer usable el entorno

Ahora que ya existe bastante de eso, por fin vale la pena endurecer su comportamiento operativo.

Eso mantiene la coherencia del roadmap y evita meter demasiadas capas de complejidad a la vez demasiado pronto.

---

## Qué estamos logrando con esta clase

Esta clase no agrega todavía probes concretas, pero hace algo muy importante:

**prepara el siguiente refinamiento fuerte del bloque de Kubernetes.**

Ahora el foco ya no está solo en qué servicios viven dentro del cluster, sino también en cómo el cluster interpreta su disponibilidad y su salud real.

Eso es una mejora muy importante en la madurez del entorno.

---

## Qué todavía no hicimos

Todavía no:

- escribimos las probes
- las aplicamos a servicios concretos
- ni validamos su efecto dentro del entorno

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué `readiness` y `liveness` ya tienen sentido ahora.**

---

## Errores comunes en esta etapa

### 1. Pensar que `readiness` y `liveness` son lo mismo
Sus preguntas operativas son distintas.

### 2. Creer que “el proceso está vivo” ya alcanza
En Kubernetes eso muchas veces no es suficiente.

### 3. Introducir probes demasiado pronto en el bloque
Ahora tienen sentido porque el entorno ya está bastante reconstruido.

### 4. No conectar esto con Actuator
El proyecto ya construyó una gran base para esta etapa.

### 5. Ver esta clase como pura teoría
En realidad prepara directamente un refinamiento operativo muy concreto.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué `readiness` y `liveness` ya tienen sentido dentro de NovaMarket en Kubernetes y qué problema operativo real vienen a resolver.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés la diferencia entre estar corriendo y estar realmente listo,
- distinguís el rol de `readiness`,
- distinguís el rol de `liveness`,
- ves la relación con Actuator,
- y entendés por qué este refinamiento tiene sentido en este punto del bloque.

Si eso está bien, ya podemos pasar a aplicar las primeras probes reales.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a agregar `readiness` y `liveness` a uno de los servicios principales del cluster.

Ese será el primer paso concreto para endurecer la salud operativa de NovaMarket dentro de Kubernetes.

---

## Cierre

En esta clase entendimos por qué `readiness` y `liveness` ya tienen sentido en NovaMarket dentro de Kubernetes.

Con eso, el bloque queda listo para pasar de una reconstrucción funcional bastante rica a una operación todavía más madura, donde el cluster no solo aloja servicios, sino que empieza a interpretarlos mejor en términos de salud y disponibilidad.
