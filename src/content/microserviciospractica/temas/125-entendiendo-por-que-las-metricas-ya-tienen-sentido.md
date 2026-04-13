---
title: "Entendiendo por qué las métricas ya tienen sentido"
description: "Inicio del siguiente refinamiento del bloque de Kubernetes en NovaMarket. Comprensión de por qué, después de consolidar observabilidad operativa básica, ya conviene empezar a trabajar métricas dentro del cluster."
order: 125
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Entendiendo por qué las métricas ya tienen sentido

En las últimas clases del bloque de Kubernetes llevamos a NovaMarket a un punto bastante más maduro:

- reconstruimos una parte importante del sistema dentro del cluster,
- ordenamos acceso, configuración, salud, recursos, escalado y actualizaciones,
- aprendimos un flujo básico de troubleshooting,
- y además empezamos a leer mejor el entorno con una observabilidad operativa más rica apoyada en señales del sistema.

Eso ya tiene muchísimo valor.

Pero ahora aparece otra pregunta muy natural:

**si ya sabemos leer mejor el estado del sistema, cómo empezamos a observarlo también desde cantidades y tendencias, y no solo desde estados o síntomas puntuales?**

Ese es el terreno de esta clase.

Porque una cosa es saber si una pieza:

- está viva,
- está lista,
- o muestra una señal operativa razonable.

Y otra bastante distinta es empezar a mirar cosas como:

- cuánto está usando,
- cómo evoluciona una variable importante,
- o qué comportamiento cuantitativo viene mostrando una pieza del sistema.

Ahí es donde empiezan a importar mucho más:

- las métricas
- y una lectura más numérica del entorno

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué las métricas ya tienen sentido en este punto del bloque,
- entendida la diferencia entre leer estados y leer cantidades o tendencias,
- alineado el modelo mental del curso para trabajar una observación más cuantitativa del sistema,
- y preparado el terreno para usar métricas básicas de NovaMarket dentro del cluster en las próximas clases.

Todavía no vamos a montar un stack completo de monitoreo.  
La meta de hoy es entender por qué este refinamiento aparece ahora y no antes.

---

## Estado de partida

Partimos de un cluster donde ya existe una reconstrucción bastante rica de NovaMarket:

- núcleo base
- servicios funcionales importantes
- gateway
- `Ingress`
- configuración externalizada
- probes
- política de recursos
- primeras decisiones de escalado
- actualizaciones controladas
- troubleshooting básico
- y una observación operativa más rica del entorno

Eso significa que el sistema ya no es solo algo que vive y se diagnostica.  
Ahora empieza a tener sentido medirlo mejor.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué problema aparece cuando solo miramos estados cualitativos del sistema,
- entender qué aporta una lectura basada también en métricas,
- conectar esta etapa con Actuator y con todo lo que ya construimos antes,
- y dejar clara la lógica del siguiente tramo del bloque.

---

## Qué problema queremos resolver exactamente

Hasta ahora, gran parte de la lectura del sistema se apoyó en cosas como:

- health
- readiness
- logs
- `describe`
- eventos
- y señales operativas básicas

Todo eso sigue siendo muy valioso.

Pero cuando el entorno madura, empieza a aparecer otra necesidad:

**no solo saber si algo está bien o mal, sino también cuánto, con qué tendencia y con qué intensidad se está comportando.**

Ese cambio es muy importante.

Porque ahora conviene poder hacerse preguntas como:

- ¿cuánto está usando esta pieza?
- ¿cómo viene evolucionando esa señal?
- ¿qué tan intensa es la carga?
- ¿cuánta actividad está teniendo una parte del sistema?
- ¿qué me dice eso sobre su comportamiento?

Ese es el tipo de pregunta que abre esta etapa.

---

## Por qué este paso tiene sentido justamente ahora

Porque el bloque ya construyó muchas capas previas sin las cuales mirar métricas tendría mucho menos valor.

Por ejemplo, ya tenemos:

- servicios importantes dentro del cluster,
- probes,
- recursos,
- escalado,
- y una base de observabilidad operativa más rica.

Eso significa que ahora ya existe un sistema suficientemente real como para que mirar números y señales cuantitativas empiece a aportar valor genuino.

---

## Qué significa trabajar métricas en este contexto

Para esta etapa del curso práctico, una forma útil de pensarlo es esta:

**trabajar métricas significa empezar a observar el sistema también desde señales cuantitativas que nos ayuden a entender mejor su comportamiento.**

No estamos hablando todavía de una plataforma gigantesca.

Estamos hablando de algo bastante concreto:

- usar mejor lo que la aplicación ya puede exponer
- para entender con más profundidad cómo está funcionando

Ese cambio de enfoque vale muchísimo.

---

## Paso 1 · Entender por qué los estados no alcanzan siempre

Este es uno de los puntos más importantes de la clase.

Hasta ahora, buena parte del bloque se apoyó en preguntas como:

- ¿está arriba?
- ¿está listo?
- ¿responde?
- ¿hay errores?

Eso sigue siendo fundamental.

Pero ahora conviene sumar otras preguntas como:

- ¿cuánto uso está mostrando?
- ¿qué actividad viene teniendo?
- ¿cómo se está comportando bajo cierta carga?

Ahí aparece el valor de las métricas.

---

## Paso 2 · Relacionarlo con NovaMarket

NovaMarket ya tiene dentro del cluster piezas lo suficientemente importantes como para que una mirada cuantitativa tenga bastante sentido.

Por ejemplo:

- `api-gateway`
- `order-service`
- `notification-service`

No hace falta que todas las piezas se midan con la misma profundidad desde el principio.

Lo importante es entender que el sistema ya es suficientemente real como para que estas señales empiecen a importar.

---

## Paso 3 · Conectarlo con Actuator

Este punto vale muchísimo.

El proyecto ya viene usando Spring Boot Actuator desde hace bastante tiempo, especialmente para health y otras señales operativas.

Eso significa que la entrada a métricas no cae del cielo.

En realidad, una parte importante de esta nueva etapa del bloque consiste en aprovechar mejor una base que el proyecto ya tiene, y hacer que empiece a hablar también en términos más cuantitativos.

---

## Paso 4 · Entender qué tipo de lectura agregan las métricas

A esta altura del bloque, una forma útil de resumirlo sería esta:

- health y probes nos dicen bastante sobre disponibilidad y estado
- logs nos dicen bastante sobre comportamiento y errores
- métricas empiezan a decirnos bastante sobre intensidad, uso y tendencia

Esa diferencia es una de las ideas más valiosas de esta etapa.

---

## Paso 5 · Entender por qué esto mejora todo el bloque

Las métricas no sirven solo para “ver numeritos”.

Sirven para:

- entender mejor cómo se comporta el sistema
- validar mejor ciertos refinamientos del cluster
- razonar mejor sobre escalado
- y enriquecer bastante la lectura operativa general del entorno

Ese valor práctico y pedagógico es muy grande.

---

## Paso 6 · Pensar qué NO estamos haciendo todavía

Conviene dejarlo claro.

En este punto del bloque no estamos todavía:

- montando una plataforma enorme de monitoreo con dashboards completos
- ni agotando todo el universo de observabilidad cuantitativa
- ni entrando en un stack final de producción

La meta actual es mucho más concreta:

**aprender a usar mejor métricas básicas del sistema dentro del entorno que ya construimos.**

Eso ya aporta muchísimo valor.

---

## Paso 7 · Diferenciar observabilidad operativa básica de métricas

Este matiz importa bastante.

### Observabilidad operativa básica
Nos ayudó a leer mejor estados y señales generales del sistema.

### Métricas
Nos ayudan a sumar una lectura cuantitativa que hace todavía más rica esa observación.

No son temas aislados.  
Se potencian muchísimo entre sí.

Ese encastre es una de las claves más importantes de esta etapa.

---

## Qué estamos logrando con esta clase

Esta clase no expone todavía una métrica concreta ni monta una integración, pero hace algo muy importante:

**abre explícitamente la etapa de métricas dentro del bloque de Kubernetes.**

Eso importa muchísimo, porque el entorno deja de ser solo algo que sabemos desplegar, diagnosticar y observar mejor cualitativamente.  
También empieza a ser algo que sabemos mirar mejor desde datos cuantitativos.

---

## Qué todavía no hicimos

Todavía no:

- usamos métricas concretas dentro de NovaMarket
- ni las consolidamos como parte real de la lectura del sistema

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué las métricas ya tienen sentido ahora.**

---

## Errores comunes en esta etapa

### 1. Pensar que las métricas solo sirven para producción grande
En realidad ya aportan mucho valor en un entorno como el que construimos.

### 2. Creer que health y métricas son lo mismo
Se complementan, pero responden a preguntas distintas.

### 3. No conectar este paso con Actuator
El proyecto ya tiene una base muy buena para empezar por acá.

### 4. Tratar este tema como algo aislado del resto del módulo
En realidad aparece de forma muy natural después de observabilidad operativa básica.

### 5. Esperar una plataforma enorme antes de empezar
Para este curso, lo más valioso ahora es aprender a leer mejor lo que ya podemos exponer.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para empezar a trabajar métricas dentro de Kubernetes y por qué este tema aparece ahora, y no antes, dentro del bloque.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés la diferencia entre leer estado y leer cantidad o tendencia,
- ves por qué las métricas enriquecen mucho la observación del sistema,
- entendés la relación con Actuator,
- y sentís que ya tiene sentido sumar una lectura más cuantitativa del entorno.

Si eso está bien, ya podemos pasar a usar métricas básicas dentro del cluster.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a usar métricas básicas expuestas por Actuator para leer mejor el comportamiento de una pieza importante de NovaMarket dentro de Kubernetes.

Ese será el primer paso concreto de esta nueva etapa del bloque.

---

## Cierre

En esta clase entendimos por qué las métricas ya tienen sentido en NovaMarket dentro de Kubernetes.

Con eso, el bloque queda listo para dar otro salto importante de madurez: no solo observar mejor el sistema desde estados y síntomas, sino también empezar a leerlo desde cantidades, actividad y comportamiento cuantitativo.
