---
title: "Desplegando una instancia básica de Grafana y conectándola con Prometheus"
description: "Primer paso concreto de la visualización cuantitativa en Kubernetes. Despliegue de una instancia básica de Grafana y conexión inicial con Prometheus dentro de NovaMarket."
order: 135
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Desplegando una instancia básica de Grafana y conectándola con Prometheus

En la clase anterior dejamos claro algo importante:

- recolectar métricas no es lo mismo que poder leerlas bien,
- y además NovaMarket ya está lo suficientemente maduro dentro del cluster como para que una primera visualización real tenga mucho sentido.

Ahora toca el paso concreto:

**desplegar una instancia básica de Grafana y conectarla con Prometheus dentro del entorno.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- desplegada una instancia básica de Grafana,
- conectada esa instancia con la instancia de Prometheus que ya vive en el cluster,
- y mucho más claro cómo se transforma una observación cuantitativa técnica en una lectura mucho más usable del sistema.

Todavía no vamos a construir dashboards finales ni una plataforma completa.  
La meta de hoy es mucho más concreta: **instalar una capa real de visualización dentro del entorno**.

---

## Estado de partida

Partimos de un sistema donde ya tenemos:

- métricas básicas útiles
- exposición en formato Prometheus
- una instancia básica de Prometheus desplegada
- y una primera recolección real de métricas dentro del cluster

Eso significa que el siguiente paso natural ya no está del lado de la aplicación ni del scraping, sino del lado de la visualización:

- ahora necesitamos una pieza que nos permita ver mejor todo eso.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- introducir una instancia básica de Grafana dentro del cluster,
- darle una configuración inicial razonable,
- conectarla con Prometheus,
- y dejar lista una base real para una primera visualización del entorno.

---

## Qué queremos resolver exactamente

Queremos pasar de este estado:

- “Prometheus ya está recolectando métricas y yo podría consultarlas de forma más cruda”

a un estado más maduro como este:

- “el entorno ya tiene una pieza que me permite visualizar mejor esa información”

Ese cambio puede parecer pequeño, pero en realidad es uno de los más fuertes de toda esta etapa del bloque.

---

## Paso 1 · Pensar Grafana como pieza del entorno, no como herramienta abstracta

Este punto vale muchísimo.

Hasta ahora Grafana apareció sobre todo como una dirección lógica del roadmap.

Ahora, en cambio, empieza a convertirse en una pieza real del ecosistema operativo del cluster.

Eso significa que deja de ser una idea para pasar a ser un recurso concreto que forma parte del entorno.

---

## Paso 2 · Crear una ubicación razonable para sus manifests

Una opción bastante clara puede ser algo como:

```txt
k8s/infrastructure/grafana/
```

y dentro de esa carpeta empezar a pensar recursos como:

- configuración inicial
- deployment
- service

No hace falta todavía construir una arquitectura gigantesca.  
La idea es instalar una base mínima, ordenada y didáctica.

---

## Paso 3 · Crear el `Deployment` de Grafana

Ahora conviene desplegar la propia pieza dentro del cluster.

La idea es que Grafana pase a existir como un servicio real del entorno y no solo como una intención futura.

Este es uno de los momentos más importantes de toda la clase.

No hace falta una configuración monstruosa.  
Alcanza con una base mínima razonable para que la pieza viva dentro del cluster y pueda conectarse después a Prometheus.

---

## Paso 4 · Crear también un `Service`

Igual que con otras piezas del bloque, conviene darle un `Service` para que Grafana quede accesible dentro del entorno y pueda ser consultado de forma clara.

No hace falta todavía una exposición final gigantesca.  
La prioridad es que la pieza exista y pueda usarse dentro del cluster.

---

## Paso 5 · Aplicar los recursos

Ahora aplicá:

- el `Deployment`
- y el `Service`

La idea es que Grafana ya forme parte real del entorno Kubernetes de NovaMarket.

Este es el verdadero momento importante de la clase.

---

## Paso 6 · Verificar que Grafana ya vive dentro del cluster

Después de aplicar los recursos, conviene comprobar que:

- el Pod existe
- el `Deployment` quedó bien
- y el `Service` también

No hace falta todavía validar toda la visualización.

Primero queremos confirmar que la nueva pieza ya forma parte del entorno real del cluster.

---

## Paso 7 · Conectar Grafana con Prometheus

Ahora viene el paso más importante de esta etapa:

**definir a Prometheus como fuente de datos de Grafana**

La idea es que Grafana ya no sea solo una pieza desplegada, sino una capa de visualización conectada a la recolección real que ya teníamos dentro del entorno.

Ese encastre es el corazón de esta clase.

---

## Paso 8 · Entender qué cambió respecto de la etapa anterior

A esta altura conviene fijar algo importante:

antes, el sistema ya exponía y Prometheus ya recolectaba métricas.

Ahora, en cambio, el entorno empieza a tener una capa concreta que las vuelve mucho más legibles.

Ese salto es uno de los más importantes de toda esta etapa.

Porque la observación cuantitativa deja de ser solo técnica y empieza a ser mucho más usable.

---

## Paso 9 · No intentar todavía cerrar toda la plataforma

Conviene dejar esto muy claro.

En esta etapa todavía no estamos:

- resolviendo dashboards finales de producción
- ni armando una arquitectura completa de visualización
- ni agotando todo lo que Grafana puede hacer

La meta actual es mucho más concreta:

**desplegar una instancia básica y dejarla conectada a Prometheus de forma útil.**

Y eso ya aporta muchísimo valor.

---

## Paso 10 · Pensar por qué esto mejora todo el resto del bloque

A partir de ahora, cualquier refinamiento posterior sobre métricas y observación cuantitativa va a ser mucho más fácil de sostener porque ya existe una capa real de visualización dentro del entorno.

Eso significa que esta clase no solo vale por sí misma.

También prepara muy bien:

- lectura más cómoda de señales
- comparación más clara de comportamiento
- y una evolución mucho más usable de la observación cuantitativa

Ese efecto transversal vale muchísimo.

---

## Qué estamos logrando con esta clase

Esta clase instala la primera integración real de visualización cuantitativa dentro del bloque de Kubernetes.

Ya no estamos solo exponiendo y recolectando métricas.  
Ahora también empezamos a verlas dentro de una pieza real del entorno.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos esta visualización como checkpoint del bloque
- ni la convertimos todavía en una estrategia más amplia de observación cuantitativa

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**desplegar una instancia básica de Grafana y conectarla con Prometheus dentro del cluster.**

---

## Errores comunes en esta etapa

### 1. Querer montar dashboards complejísimos desde la primera iteración
Para esta etapa, una base simple y clara es mejor.

### 2. Pensar que Grafana ya aporta valor solo por estar desplegado
Todavía faltaba conectarlo a Prometheus.

### 3. No separar bien `Deployment`, `Service` y conexión con la fuente de datos
Conviene mantener el orden que venimos trabajando en todo el bloque.

### 4. Tratar esta pieza como algo aislado del sistema
En realidad forma parte de la evolución natural de toda la observación cuantitativa.

### 5. No verificar que la instancia realmente vive dentro del cluster
El paso tiene que quedar operativamente real, no solo escrito en manifests.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería tener una instancia básica de Grafana desplegada dentro del cluster y conectada a Prometheus como fuente de datos inicial.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- Grafana ya existe dentro del cluster,
- su `Deployment` está sano,
- el `Service` existe,
- y Prometheus ya está definido como fuente de datos para esta nueva capa de visualización.

Si eso está bien, ya podemos pasar a consolidar esta nueva etapa del bloque.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a consolidar esta primera visualización cuantitativa del entorno y a dejarla conectada al resto de refinamientos operativos de NovaMarket dentro de Kubernetes.

---

## Cierre

En esta clase desplegamos una instancia básica de Grafana y la conectamos con Prometheus.

Con eso, el bloque de Kubernetes da otro salto fuerte de madurez: el sistema ya no solo expone y recolecta mejor sus métricas, sino que también empieza a contar con una capa real de visualización dentro del cluster.
