---
title: "Validando y consolidando la primera entrada real externa de NovaMarket en Kubernetes"
description: "Checkpoint del módulo 15. Validación y consolidación de la primera entrada real externa de NovaMarket en Kubernetes a través de api-gateway."
order: 163
module: "Módulo 15 · Kubernetes y orquestación final"
level: "intermedio"
draft: false
---

# Validando y consolidando la primera entrada real externa de NovaMarket en Kubernetes

En las últimas clases del módulo 15 dimos otro paso muy importante dentro del bloque final del curso rehecho:

- NovaMarket ya tiene una primera base real en Kubernetes,
- `config-server` y `discovery-server` ya viven dentro del cluster,
- `api-gateway` ya fue llevado al nuevo entorno,
- y además ya abrimos una primera entrada externa real hacia el sistema.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer, otra vez, lo que venimos haciendo cada vez que el proyecto gana una nueva capa de madurez:

**un checkpoint de consolidación.**

Porque una cosa es haber logrado una entrada externa visible.  
Y otra bastante distinta es detenerse a mirar qué significa realmente eso para la arquitectura final del sistema dentro de Kubernetes.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- NovaMarket ya cuenta con una primera puerta de entrada externa real en Kubernetes,
- esa entrada aporta valor genuino a la arquitectura orquestada,
- y el sistema ya empezó a dejar atrás una presencia demasiado interna dentro del cluster para volverse una plataforma realmente accesible.

Esta clase funciona como checkpoint fuerte del subbloque de entrada externa dentro del módulo 15.

---

## Estado de partida

Partimos de un sistema donde ya:

- `api-gateway` vive dentro del cluster,
- existe una primera exposición externa concreta,
- y el bloque ya dejó claro que NovaMarket ya no es solo una colección de workloads internos sino una arquitectura que empieza a abrir su borde real hacia afuera.

Eso significa que ya no estamos discutiendo una hipótesis.

Ahora estamos leyendo una mejora real sobre cómo NovaMarket empieza a parecerse mucho más a un sistema orquestado accesible de verdad y no solo a una suma de pods y services internos.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el valor estructural de esta primera entrada externa,
- consolidar cómo se relaciona con el resto de la arquitectura,
- validar qué cambia en la madurez general del proyecto,
- y dejar este subbloque como base estable antes de abrir el siguiente frente lógico de Kubernetes: cómo representar configuración y secretos de forma más propia del cluster.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si el gateway responde desde afuera”.

Queremos observar algo más interesante:

- si NovaMarket ya empezó a comportarse como una arquitectura accesible desde fuera del cluster,
- si la presencia del sistema en Kubernetes dejó de ser solo interna,
- y si el módulo 15 ya ganó una base concreta para empezar a manejar configuración y secretos de una forma más madura dentro del nuevo entorno.

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Volver sobre el recorrido de esta etapa

Antes de entrar en detalles, conviene fijar la secuencia que construimos:

- primero abrimos Kubernetes como último gran bloque técnico,
- después levantamos una primera base real con `Namespace`, `Deployment` y `Service`,
- luego llevamos `config-server` y `discovery-server`,
- más tarde sumamos `api-gateway`,
- y finalmente abrimos una primera entrada externa visible hacia el sistema.

Ese encadenamiento importa mucho porque muestra que esta etapa no apareció aislada, sino como una evolución gradual y bastante sana desde recursos básicos hasta borde real del sistema.

---

## Paso 2 · Consolidar la relación entre gateway y borde externo del sistema

Este es uno de los puntos más importantes de toda la clase.

A esta altura ya conviene poder decir algo como:

- `api-gateway` no es solo un servicio más,
- tampoco es solo una pieza interna del cluster,
- es la principal puerta de entrada ordenada del sistema.

Ese cambio importa muchísimo porque el sistema ya no solo “vive” dentro de Kubernetes.  
Ahora también empieza a **presentarse** desde Kubernetes como plataforma accesible.

Ese salto es uno de los corazones del bloque final.

---

## Paso 3 · Entender qué valor tiene haber llegado hasta una entrada externa real

También vale mucho notar que no nos quedamos en el nivel de manifests internos o piezas auxiliares.

Llegamos a una etapa donde el tráfico externo ya puede encontrar una puerta de entrada real.

Eso fue una muy buena decisión.

¿Por qué?

Porque es justo ahí donde el bloque final deja de sentirse como “administrar recursos” y empieza a sentirse como orquestar de verdad un sistema que recibe tráfico desde fuera del cluster.

Ese criterio mejora muchísimo el valor práctico del módulo.

---

## Paso 4 · Revisar qué cambió en la madurez del proyecto

A esta altura conviene fijar algo importante:

antes, Kubernetes ya tenía piezas reales de NovaMarket.

Ahora, en cambio, además empieza a tener una noción más clara de que:

- el sistema ya no está solo alojado,
- también está empezando a ser accesible,
- y la orquestación del proyecto ya no vive solo del lado interno, sino también del lado del borde de entrada.

Ese cambio vuelve al proyecto bastante más serio desde el punto de vista de despliegue y cierre técnico.

---

## Paso 5 · Entender qué todavía no está resuelto

También conviene dejar algo claro:

después de este checkpoint todavía siguen existiendo muchos pasos posibles, por ejemplo:

- representar mejor la configuración,
- separar secretos del código y de los manifests más crudos,
- sumar servicios de negocio al cluster,
- o refinar todavía más la estrategia final de exposición.

Eso está bien.

La meta de esta etapa nunca fue resolverlo todo.  
Fue abrir una primera entrada externa real y bien orientada.

Y eso sí se logró muy bien.

---

## Paso 6 · Pensar por qué esto mejora muchísimo el siguiente tramo

Este punto importa mucho.

A partir de ahora, hablar de `ConfigMap`, `Secret` y configuración propia del cluster va a ser muchísimo más fácil de sostener porque ya existe una primera referencia concreta de que NovaMarket:

- tiene piezas reales adentro del cluster,
- tiene una entrada real desde afuera,
- y ya no puede seguir apoyándose solo en una lógica ingenua de configuración como si todavía viviera únicamente en Compose.

Eso significa que esta clase no solo cierra una etapa.  
También prepara muy bien todo lo que viene después.

---

## Paso 7 · Comparar el proyecto actual con el del comienzo del bloque final

Si miramos el recorrido hasta acá, la evolución ya empieza a verse bastante clara:

### Antes
- sistema completo en Compose
- Kubernetes como bloque todavía conceptual
- piezas reales del sistema todavía fuera del cluster

### Ahora
- namespace real de NovaMarket
- piezas centrales del sistema en Kubernetes
- `api-gateway` en el cluster
- y una primera entrada externa real accesible desde fuera

Ese cambio vale muchísimo porque ya mueve a NovaMarket hacia una postura bastante más seria también en cómo se adapta a un entorno orquestado.

---

## Paso 8 · Entender qué NO estamos afirmando todavía

Conviene dejar esto muy claro.

En este punto todavía no estamos diciendo:

- que NovaMarket ya tenga toda su estrategia final de entrada al cluster resuelta,
- ni que el bloque de Kubernetes ya esté cerrado,
- ni que todos los servicios del sistema ya vivan dentro del nuevo entorno.

Eso sería exagerado.

Lo que sí podemos decir con bastante honestidad es algo mucho más valioso:

- NovaMarket ya dejó de pensar el borde del sistema solo como algo externo a Kubernetes y ya cuenta con una primera entrada real visible desde el cluster.

Y eso ya es un avance muy fuerte.

---

## Qué estamos logrando con esta clase

Esta clase consolida la primera entrada real externa de NovaMarket en Kubernetes.

Ya no estamos solo trabajando con piezas internas o manifests aislados.  
Ahora también estamos dejando claro que el sistema ya puede presentar una puerta de entrada real desde el cluster hacia afuera.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- representamos todavía con madurez la configuración del sistema dentro de Kubernetes,
- ni separamos todavía de forma más fuerte la información configurable y sensible del resto de los recursos.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**validar y consolidar esta primera entrada externa real como una ganancia real del proyecto.**

---

## Errores comunes en esta etapa

### 1. Pensar que este paso solo “abre un puerto”
En realidad cambia bastante la lectura del sistema como arquitectura accesible.

### 2. Reducir el valor del paso a que el gateway responda
El valor real está en que NovaMarket ya empieza a tener un borde de entrada real dentro del cluster.

### 3. Confundir esta mejora con una estrategia final completa de exposición
Todavía estamos en una primera capa, no en la solución final.

### 4. Exagerar lo logrado
Todavía queda mucho si queremos una política más madura de networking.

### 5. No consolidar este paso antes de abrir ConfigMap y Secret
Eso haría más difícil sostener la progresión del bloque.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión bastante más clara de cómo esta primera entrada externa mejora la postura general de NovaMarket en Kubernetes y por qué esta evolución ya representa una madurez real dentro del bloque final.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué aporta tener una entrada externa real al sistema,
- ves que NovaMarket ya no vive solo como arquitectura interna del cluster,
- entendés qué cosas sí mejoraron y cuáles todavía quedan abiertas,
- y sentís que el proyecto ya está listo para empezar a representar configuración y secretos de una forma más propia de Kubernetes.

Si eso está bien, ya podemos pasar al siguiente tema y seguir completando la arquitectura final de NovaMarket dentro del cluster.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a entender por qué `ConfigMap` y `Secret` ya tienen sentido en NovaMarket dentro de Kubernetes y cómo ese paso refuerza muchísimo la madurez final del sistema orquestado.

---

## Cierre

En esta clase validamos y consolidamos la primera entrada real externa de NovaMarket en Kubernetes.

Con eso, el proyecto deja de pensar el cluster solo como un entorno para workloads internos y empieza a sostener una puerta de entrada visible, accesible y mucho más madura hacia la arquitectura final del sistema.
