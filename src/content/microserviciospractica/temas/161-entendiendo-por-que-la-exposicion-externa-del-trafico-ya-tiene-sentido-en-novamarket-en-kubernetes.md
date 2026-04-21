---
title: "Entendiendo por qué la exposición externa del tráfico ya tiene sentido en NovaMarket en Kubernetes"
description: "Siguiente paso del módulo 15. Comprensión de por qué, después de llevar api-gateway al cluster, ya conviene abrir el problema de la exposición externa del tráfico en Kubernetes."
order: 161
module: "Módulo 15 · Kubernetes y orquestación final"
level: "intermedio"
draft: false
---

# Entendiendo por qué la exposición externa del tráfico ya tiene sentido en NovaMarket en Kubernetes

En la clase anterior cerramos algo muy importante dentro del bloque final del curso:

- NovaMarket ya tiene una base real en Kubernetes,
- `config-server` y `discovery-server` ya viven dentro del cluster,
- y además `api-gateway` ya empezó a representar la puerta de entrada del sistema en el nuevo entorno.

Eso ya tiene muchísimo valor.

Pero ahora aparece una pregunta muy natural:

**si `api-gateway` ya vive dentro del cluster, cómo hacemos para que el tráfico real llegue hasta él de una forma coherente con Kubernetes?**

Ese es el terreno de esta clase.

Porque una cosa es tener:

- un Deployment,
- un Service interno,
- y una pieza importante del sistema corriendo en el cluster.

Y otra bastante distinta es poder decir:

- “ahora entiendo cómo se expone el sistema hacia afuera”
- y
- “ahora entiendo qué problema nuevo aparece cuando quiero que el borde del sistema deje de ser solo interno”.

Ese es exactamente el siguiente problema que conviene abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué la exposición externa del tráfico ya tiene sentido después de llevar `api-gateway` al cluster,
- entendida la diferencia entre comunicación interna del cluster y entrada externa real,
- alineado el modelo mental para abrir servicios expuestos, acceso externo e ingreso de tráfico,
- y preparado el terreno para aplicar una primera exposición concreta del gateway en la próxima clase.

La meta de hoy no es todavía cerrar toda la estrategia final de entrada al cluster.  
La meta es mucho más concreta: **entender por qué, después de tener `api-gateway` en Kubernetes, ya conviene resolver cómo entra el tráfico desde afuera del cluster**.

---

## Estado de partida

Partimos de un sistema donde ya:

- existe un namespace propio,
- existe una primera base real del corazón de NovaMarket,
- `api-gateway` ya vive dentro del cluster,
- y el bloque ya dejó claro que la puerta de entrada del sistema ya no es solo una idea externa a Kubernetes.

Eso significa que el problema ya no es cómo correr el gateway.  
Ahora la pregunta útil es otra:

- **cómo se accede desde afuera a esa puerta de entrada que ya existe dentro del cluster**

Y eso es exactamente lo que vamos a resolver en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar por qué la exposición externa aparece naturalmente después del gateway,
- entender qué problema resuelve,
- conectar esta idea con el estado actual de NovaMarket,
- y dejar clara la lógica del siguiente paso práctico del bloque final.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- la puerta de entrada del sistema ya vive dentro del cluster.

Eso fue un gran salto.

Pero a medida que el bloque madura, aparece otra necesidad muy concreta:

**que el sistema deje de estar encerrado solo en networking interno de Kubernetes y empiece a tener una forma razonable de recibir tráfico externo.**

Porque ahora conviene hacerse preguntas como:

- ¿cómo llega el tráfico al gateway?
- ¿qué diferencia hay entre un `Service` interno y una exposición real?
- ¿qué recurso conviene usar primero para hacerlo visible?
- ¿cómo se conecta esta etapa con la arquitectura final del sistema?

Ese cambio de enfoque es justamente el corazón de esta etapa.

---

## Por qué este problema aparece ahora y no antes

Esto también importa mucho.

Si todavía no tuviéramos:

- namespace,
- recursos básicos,
- corazón técnico dentro del cluster,
- y `api-gateway` ya desplegado,

hablar de tráfico externo habría quedado demasiado pronto o demasiado abstracto.

Pero ahora el sistema ya tiene una puerta de entrada real dentro de Kubernetes.

Entonces el siguiente paso natural es:

- dejar de pensar el gateway solo como pieza interna
- y empezar a pensar cómo accedemos a él desde afuera del cluster.

Ese orden es excelente.

---

## Qué significa exposición externa en este contexto

Para esta etapa del curso, una forma útil de pensarlo es esta:

**exposición externa significa que una pieza del sistema, en este caso `api-gateway`, deja de ser solo accesible dentro del cluster y empieza a poder recibir tráfico desde fuera de él mediante un mecanismo coherente con Kubernetes.**

Esa idea es central.

No estamos hablando todavía de toda la política final de networking de producción.  
Estamos hablando de algo más concreto:

- cómo hacer que la entrada real del sistema pueda ser alcanzada desde afuera.

Ese matiz importa muchísimo.

---

## Por qué este paso no reemplaza la lógica interna del cluster

Este punto vale muchísimo.

Abrir exposición externa no significa que el `Service` interno deje de importar.

Al contrario:

- primero el gateway tiene que vivir bien dentro del cluster,
- y recién después cobra sentido discutir cómo entra el tráfico desde afuera.

Ese matiz importa muchísimo porque muestra que el networking externo se apoya en una base interna ya ordenada.

---

## Cómo se traduce esto a NovaMarket

A esta altura del proyecto, la situación ya se puede leer así:

- `api-gateway` es la puerta de entrada del sistema,
- ya vive dentro de Kubernetes,
- y ahora conviene empezar a pensar cómo ese gateway deja de ser solo una pieza accesible desde dentro del cluster y pasa a ser la entrada real del tráfico hacia NovaMarket.

Ese cambio vuelve muchísimo más concreta la arquitectura orquestada.

---

## Qué gana NovaMarket con este cambio

Aunque todavía no lo apliquemos en esta clase, el valor ya se puede ver con claridad.

A partir de una primera exposición externa del gateway, NovaMarket puede ganar cosas como:

- una lectura mucho más realista de su borde de entrada,
- una arquitectura en Kubernetes menos abstracta,
- mejor comprensión de cómo el sistema se vuelve accesible desde afuera,
- y una base mucho más fuerte para cerrar el bloque final con una visión de despliegue mucho más seria.

Eso vuelve al proyecto muchísimo más maduro desde el punto de vista de orquestación.

---

## Qué todavía no estamos haciendo en esta etapa

Conviene dejar esto muy claro.

En este punto todavía no estamos:

- creando todavía un recurso final de entrada externa,
- ni eligiendo aún de forma definitiva toda la estrategia de exposición,
- ni resolviendo todavía todo el tráfico del sistema en Kubernetes.

La meta actual es mucho más concreta:

**abrir correctamente el subbloque de exposición externa del tráfico.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no expone todavía `api-gateway` hacia afuera del cluster, pero hace algo muy importante:

**abre explícitamente el siguiente frente lógico del módulo 15: dejar de pensar la entrada del sistema solo como networking interno y empezar a resolver cómo se accede de verdad a NovaMarket desde fuera del cluster.**

Eso importa muchísimo, porque NovaMarket deja de madurar solo desde la presencia de piezas internas y empieza a prepararse para otra mejora clave: tener una puerta de entrada realmente accesible en Kubernetes.

---

## Qué todavía no hicimos

Todavía no:

- expusimos todavía el gateway hacia afuera,
- ni validamos aún una entrada externa real al sistema dentro del cluster.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué la exposición externa del tráfico ya tiene sentido en NovaMarket en Kubernetes.**

---

## Errores comunes en esta etapa

### 1. Pensar que con el Deployment del gateway ya está resuelta la entrada del sistema
Todavía falta abrir el tráfico desde fuera del cluster.

### 2. Abrir este frente demasiado pronto
Antes de tener gateway dentro del cluster, habría quedado abstracto.

### 3. Reducir el problema a “abrir un puerto”
En realidad toca la entrada real del sistema orquestado.

### 4. Confundir networking interno con exposición externa
Son problemas relacionados, pero no idénticos.

### 5. No ver el valor del cambio
Este subbloque vuelve muchísimo más realista la arquitectura final de NovaMarket en Kubernetes.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué la exposición externa del tráfico ya tiene sentido en NovaMarket en Kubernetes y por qué este paso aparece ahora como siguiente evolución natural del bloque final.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué problema nuevo aparece cuando el gateway ya vive dentro del cluster,
- ves la diferencia entre acceso interno y entrada externa real,
- entendés qué valor agrega resolver este frente,
- y sentís que NovaMarket ya está listo para exponer su gateway de una forma más visible en Kubernetes.

Si eso está bien, ya podemos pasar al siguiente tema y aplicar esa primera exposición real del gateway.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a exponer `api-gateway` de una primera forma concreta en Kubernetes para que NovaMarket ya tenga una entrada real visible desde fuera del cluster.

---

## Cierre

En esta clase entendimos por qué la exposición externa del tráfico ya tiene sentido en NovaMarket en Kubernetes.

Con eso, el proyecto deja de pensar el gateway solo como una pieza interna del cluster y empieza a prepararse para otra mejora muy valiosa: que la entrada del sistema sea accesible, visible y mucho más coherente con el cierre final del bloque de orquestación.
