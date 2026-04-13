---
title: "Validando una recolección básica de métricas en el cluster"
description: "Checkpoint de la primera recolección real de métricas en Kubernetes. Validación de una integración básica entre Prometheus y una pieza importante de NovaMarket."
order: 133
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Validando una recolección básica de métricas en el cluster

En las últimas clases del bloque de Kubernetes dimos otro paso importante de madurez:

- entendimos por qué el scraping ya tenía sentido,
- desplegamos una instancia básica de Prometheus,
- y dejamos al entorno mucho mejor preparado para una observación cuantitativa más seria.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer un checkpoint de consolidación, como en otros refinamientos del bloque:

**validar una primera recolección real de métricas dentro del cluster.**

Porque una cosa es desplegar Prometheus.  
Y otra bastante distinta es comprobar que efectivamente ya empieza a recolectar métricas útiles desde una pieza importante de NovaMarket.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- Prometheus ya vive correctamente dentro del cluster,
- una pieza importante del sistema ya expone métricas de forma compatible,
- y el entorno ya sostiene una primera recolección cuantitativa real.

Esta clase funciona como checkpoint fuerte de la nueva etapa orientada a Prometheus del módulo.

---

## Estado de partida

Partimos de un cluster donde ya tenemos:

- métricas básicas útiles
- una primera exposición en formato Prometheus
- y una instancia básica de Prometheus desplegada dentro del entorno

Eso significa que ya no falta la pieza central para intentar una validación real de recolección.

Ahora lo que queremos comprobar es que todo eso ya funciona como sistema y no solo como manifiestos aislados.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar que Prometheus siga sano,
- validar la relación entre Prometheus y una pieza importante de NovaMarket,
- confirmar que ya existe una primera recolección real,
- y consolidar esta nueva etapa del bloque antes de seguir avanzando.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si Prometheus está arriba”.

Queremos observar algo más interesante:

- si el sistema ya expone métricas en una forma útil
- si Prometheus ya las está leyendo
- y si NovaMarket empieza a ser un entorno donde la observación cuantitativa ya no depende solo de consultas puntuales

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Verificar que Prometheus sigue sano

Primero conviene comprobar que:

- el Pod de Prometheus existe
- su `Deployment` sigue sano
- y el `Service` correspondiente también está en buen estado

Este paso es importante porque una recolección real solo tiene sentido si la pieza que la realiza está viva y correctamente integrada al cluster.

---

## Paso 2 · Revisar la pieza objetivo

Ahora conviene volver a la pieza importante que elegimos en las clases anteriores, por ejemplo:

- `api-gateway`
- `order-service`
- o `notification-service`

La idea es confirmar que esa pieza:

- sigue exponiendo métricas en un formato útil
- y sigue siendo un buen candidato para esta primera validación real

---

## Paso 3 · Revisar la relación entre exposición y scraping

Este es un punto muy importante.

A esta altura del bloque ya conviene tener muy claro que:

- la aplicación expone
- Prometheus recolecta

La validación real de esta clase consiste justamente en comprobar que ambas partes ya dejaron de estar sueltas y empiezan a funcionar como una cadena más madura dentro del entorno.

---

## Paso 4 · Confirmar que ya existe una primera recolección útil

Ahora conviene verificar que Prometheus ya esté obteniendo métricas de la pieza objetivo.

No hace falta todavía un análisis súper complejo.

La meta es más concreta:

- comprobar que la integración ya funciona
- y que el cluster ya cuenta con una primera recolección cuantitativa real sobre una pieza importante del sistema

Ese paso ya aporta muchísimo valor práctico.

---

## Paso 5 · Entender qué cambió respecto de la etapa anterior

A esta altura conviene fijar algo importante:

antes, el sistema ya exponía métricas en un formato más estándar.

Ahora, en cambio, esa exposición ya empieza a formar parte de una recolección real dentro del cluster.

Ese salto es uno de los más importantes de toda esta etapa.

Porque la observación cuantitativa deja de ser solo potencial y empieza a ser operativa.

---

## Paso 6 · Cruzar esta nueva etapa con el resto del entorno

No queremos leer Prometheus como una pieza aislada.

Lo valioso es verlo en relación con:

- probes
- salud
- métricas básicas
- troubleshooting
- y observación operativa

Prometheus no reemplaza todo eso.  
Lo potencia muchísimo y lo vuelve mucho más sostenible para lo que venga después.

---

## Paso 7 · Entender qué gana el resto del curso gracias a esto

A partir de ahora, cualquier refinamiento posterior sobre métricas, observación o monitoreo va a ser mucho más fácil de sostener porque ya existe una base real de recolección dentro del entorno.

Eso significa que esta etapa no vale solo por sí misma.

También prepara muy bien:

- una lectura más seria del comportamiento del sistema
- evoluciones futuras hacia visualización
- y una observabilidad cuantitativa mucho más madura

Ese efecto transversal vale muchísimo.

---

## Paso 8 · Entender qué todavía no estamos haciendo

Conviene dejarlo claro.

En este punto todavía no estamos:

- resolviendo un stack completo de producción
- ni montando dashboards finales
- ni agotando todas las posibilidades de Prometheus

Eso está bien.

La meta actual es mucho más concreta:

**consolidar una primera recolección real y útil de métricas dentro del cluster.**

Y eso ya es un paso muy importante.

---

## Qué estamos logrando con esta clase

Esta clase consolida otra etapa importante del bloque de Kubernetes.

Ya no estamos solo exponiendo métricas de forma estándar.  
Ahora también estamos empezando a recolectarlas realmente dentro del entorno.

Eso eleva muchísimo la madurez de la observación cuantitativa del sistema.

---

## Qué todavía no hicimos

Todavía no:

- agotamos todas las posibilidades de Prometheus
- ni convertimos esta etapa en una plataforma completa de monitoreo cuantitativo

Eso puede venir después.

La meta de hoy es mucho más concreta:

**validar una primera recolección real y útil dentro del cluster.**

---

## Errores comunes en esta etapa

### 1. Pensar que con desplegar Prometheus ya estaba todo resuelto
Todavía faltaba validar que efectivamente recolecte algo útil.

### 2. Mirar solo que el endpoint exista y no confirmar la recolección real
La clase vale por el encastre entre ambas piezas.

### 3. Tratar Prometheus como una herramienta aislada del resto del entorno
En realidad potencia mucho toda la observación del bloque.

### 4. Esperar dashboards o visualización avanzada demasiado pronto
Para esta etapa, una recolección básica real ya aporta muchísimo.

### 5. No consolidar este paso antes de seguir
Eso haría más difícil sostener todo lo que venga después.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías haber validado que NovaMarket ya cuenta con una primera recolección real de métricas dentro del cluster y que la integración orientada a Prometheus ya dejó de ser teórica para convertirse en una capacidad concreta del entorno.

Eso deja muy bien preparado el siguiente tramo del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- Prometheus está sano,
- la pieza objetivo sigue exponiendo métricas,
- ya existe una primera recolección real,
- y sentís que el cluster ya ganó otra capa importante de madurez cuantitativa gracias a este refinamiento.

Si eso está bien, entonces NovaMarket ya dio otro paso fuerte de madurez práctica dentro de Kubernetes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a pensar el siguiente gran refinamiento del entorno apoyándonos en toda esta base que ya construimos: acceso, configuración, salud, recursos, escalado, actualizaciones, troubleshooting, observabilidad operativa, métricas básicas y ahora también una primera recolección real orientada a Prometheus.

---

## Cierre

En esta clase validamos una primera recolección básica de métricas dentro del cluster.

Con eso, NovaMarket ya no solo expone mejor sus señales cuantitativas: también empieza a contar con una pieza real del entorno que las recolecta y las vuelve mucho más útiles para una observación más madura del sistema.
