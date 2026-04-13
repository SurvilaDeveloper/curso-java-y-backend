---
title: "Entendiendo por qué el scraping de métricas ya tiene sentido"
description: "Inicio del siguiente refinamiento del bloque de Kubernetes en NovaMarket. Comprensión de por qué, después de exponer métricas en formato Prometheus, ya conviene pensar en su recolección dentro del cluster."
order: 131
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Entendiendo por qué el scraping de métricas ya tiene sentido

En las últimas clases del bloque de Kubernetes dimos otro paso importante de madurez:

- entendimos por qué Prometheus ya tenía sentido,
- expusimos métricas en un formato más estándar para una pieza importante de NovaMarket,
- y además consolidamos una primera integración orientada a Prometheus dentro del entorno.

Eso ya tiene muchísimo valor.

Pero ahora aparece una pregunta muy natural:

**si ya exponemos métricas en un formato compatible, cómo hace el entorno para empezar a recolectarlas de forma útil?**

Ese es el terreno de esta clase.

Porque una cosa es que una aplicación exponga un endpoint como:

```txt
/actuator/prometheus
```

Y otra bastante distinta es que exista una pieza del entorno que:

- lo consulte,
- lo lea con cierta regularidad,
- y transforme esa exposición en una base real de observación cuantitativa.

Ese paso intermedio es justamente el que empieza a importar ahora:

**el scraping de métricas**

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué el scraping de métricas ya tiene sentido en este punto del bloque,
- entendida la diferencia entre exponer métricas y recolectarlas de forma sistemática,
- alineado el modelo mental del curso para introducir una primera recolección real dentro del cluster,
- y preparado el terreno para aplicar este siguiente paso a NovaMarket en las próximas clases.

Todavía no vamos a montar un stack definitivo ni una plataforma completa.  
La meta de hoy es entender por qué este refinamiento aparece ahora y por qué encaja tan bien con todo lo que ya construimos.

---

## Estado de partida

Partimos de un cluster donde ya existe una reconstrucción bastante rica de NovaMarket:

- servicios importantes desplegados
- entrada madura
- configuración externalizada
- probes
- política de recursos
- primeras decisiones de escalado
- actualizaciones controladas
- troubleshooting básico
- observabilidad operativa
- métricas básicas
- y una primera exposición orientada a Prometheus

Eso significa que el sistema ya no solo puede hablar en un formato más estándar.  
Ahora empieza a tener sentido que alguien del entorno lo escuche de forma sistemática.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué limitación tiene una exposición de métricas cuando nadie la recolecta de forma ordenada,
- entender qué agrega la idea de scraping,
- conectarla con todo lo que ya construimos antes,
- y dejar clara la lógica del siguiente tramo del bloque.

---

## Qué problema queremos resolver exactamente

Hasta ahora, exponer métricas en formato Prometheus ya nos ayudó a dejar la aplicación mejor preparada.

Eso fue muy valioso.

Pero si nos quedáramos solo ahí, todavía dependeríamos bastante de una lógica como esta:

- ir manualmente al endpoint
- mirar lo que devuelve
- y sacar conclusiones puntuales

Eso sigue sirviendo para validar cosas.

Pero cuando el entorno madura, empieza a aparecer otra necesidad:

**que las métricas dejen de ser una lectura puntual y pasen a formar parte de una recolección más sistemática.**

Ese cambio es justamente lo que trae el scraping.

---

## Por qué este paso tiene sentido justamente ahora

Porque el bloque ya construyó varias capas previas sin las cuales este tema tendría mucho menos valor:

- Actuator
- métricas básicas
- exposición en formato Prometheus
- piezas importantes dentro del cluster
- y una observación operativa cada vez más rica

Eso significa que el scraping no cae en el vacío.

Aparece justo cuando la aplicación ya sabe exponer algo valioso, y el entorno ya es suficientemente serio como para que empiece a tener sentido recolectarlo mejor.

---

## Qué significa scraping en este contexto

Para esta etapa del curso práctico, una forma útil de pensarlo es esta:

**scraping significa que una pieza del entorno consulta periódicamente el endpoint de métricas de un servicio para recolectar su información.**

No hace falta convertir esta clase en una discusión teórica gigantesca.

La idea importante es mucho más concreta:

- antes el servicio solo exponía
- ahora queremos que otra pieza también recolecte

Ese cambio puede parecer pequeño, pero tiene muchísimo valor práctico.

---

## Paso 1 · Entender por qué exponer no alcanza

Este es uno de los puntos más importantes de la clase.

Hasta ahora, exponer métricas ya fue un gran paso.

Pero a esta altura del bloque conviene notar algo muy claro:

- exponer métricas no equivale todavía a tener una observación cuantitativa realmente integrada al entorno

Falta un actor más:

- alguien que las lea
- y las lea de forma sistemática

Ese actor empieza a entrar en juego ahora.

---

## Paso 2 · Relacionarlo con NovaMarket

NovaMarket ya tiene dentro del cluster piezas suficientemente importantes como para que recolectar métricas empiece a aportar valor genuino.

Por ejemplo:

- `api-gateway`
- `order-service`
- `notification-service`

No hace falta empezar por todo.

Lo importante es entender que el sistema ya es suficientemente real como para que esa recolección deje de ser un lujo y pase a ser un refinamiento muy razonable.

---

## Paso 3 · Entender qué aporta Prometheus en esta etapa

A esta altura del bloque, una forma útil de resumirlo sería esta:

- antes preparamos la aplicación para hablar el formato correcto
- ahora queremos una primera pieza del entorno que empiece a escucharla de forma sistemática

Ese es justamente el lugar donde Prometheus empieza a dejar de ser solo una idea y empieza a convertirse en una pieza real del ecosistema operativo.

---

## Paso 4 · Entender que esto todavía no es la plataforma completa

Conviene dejar esto muy claro.

En esta etapa todavía no estamos:

- resolviendo toda la observabilidad de producción
- ni montando visualización avanzada
- ni agotando todas las posibilidades del monitoreo cuantitativo

La meta actual es mucho más concreta:

**introducir una primera recolección real de métricas dentro del cluster.**

Y eso ya aporta muchísimo valor.

---

## Paso 5 · Pensar qué servicio conviene usar primero

Para una primera iteración, sigue teniendo mucho sentido elegir una pieza importante y fácil de justificar, por ejemplo:

- `api-gateway`
- o `order-service`

La idea es que el valor del scraping se entienda rápido y no quede escondido detrás de una pieza secundaria del sistema.

---

## Paso 6 · Entender por qué esto mejora todo el resto del bloque

A partir de ahora, cualquier refinamiento posterior sobre métricas va a ser mucho más fácil de sostener si ya existe una recolección básica real dentro del entorno.

Eso significa que esta etapa no vale solo por sí misma.

También prepara muy bien:

- una lectura cuantitativa más seria
- una observación más continua
- y una evolución mucho más clara hacia monitoreo más maduro

Ese efecto transversal vale muchísimo.

---

## Paso 7 · Diferenciar exposición y scraping

Este matiz importa bastante.

### Exposición
La aplicación deja disponibles sus métricas.

### Scraping
Otra pieza del entorno las consulta y las recolecta de forma sistemática.

No son lo mismo.

El segundo paso es una evolución muy natural del primero, y justamente por eso este tema aparece ahora.

---

## Qué estamos logrando con esta clase

Esta clase no despliega todavía Prometheus dentro del cluster, pero hace algo muy importante:

**abre explícitamente la etapa de recolección básica de métricas dentro del bloque de Kubernetes.**

Eso importa muchísimo, porque el entorno deja de apoyarse solo en exposiciones puntuales y empieza a prepararse para una observación cuantitativa mucho más sistemática.

---

## Qué todavía no hicimos

Todavía no:

- desplegamos una instancia básica de Prometheus
- ni validamos una primera recolección real de métricas dentro del cluster

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué el scraping ya tiene sentido ahora.**

---

## Errores comunes en esta etapa

### 1. Pensar que exponer métricas ya resuelve toda la observación cuantitativa
Todavía falta recolectarlas de forma más sistemática.

### 2. Creer que este paso no vale hasta tener dashboards
En realidad ya aporta mucho valor antes de llegar a esa etapa.

### 3. No conectar scraping con la exposición previa
En realidad son dos pasos de una misma evolución natural.

### 4. Esperar una plataforma enorme antes de empezar
Para este curso, una primera recolección básica ya es un avance muy fuerte.

### 5. Tratar este tema como algo aislado del resto del módulo
En realidad mejora muchísimo todo lo que sigue en observación cuantitativa.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para empezar a recolectar métricas de forma más sistemática dentro de Kubernetes y por qué este tema aparece ahora, y no antes, dentro del bloque.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés la diferencia entre exponer y recolectar métricas,
- ves por qué el scraping ya tiene sentido ahora,
- entendés la relación con Prometheus,
- y sentís que el sistema ya está listo para una primera recolección básica dentro del entorno.

Si eso está bien, ya podemos pasar a desplegar una pieza simple para empezar a hacerlo.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a desplegar una instancia básica de Prometheus dentro del entorno y a conectarla con una pieza importante de NovaMarket.

Ese será el primer paso concreto de recolección cuantitativa real dentro del cluster.

---

## Cierre

En esta clase entendimos por qué el scraping de métricas ya tiene sentido en NovaMarket dentro de Kubernetes.

Con eso, el bloque queda listo para dar otro salto importante de madurez: no solo exponer métricas en un formato más estándar, sino también empezar a recolectarlas de una forma mucho más útil, más continua y más alineada con el ecosistema real del cluster.
