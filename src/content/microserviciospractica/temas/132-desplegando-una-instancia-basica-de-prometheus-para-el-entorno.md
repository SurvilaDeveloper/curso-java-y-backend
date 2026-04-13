---
title: "Desplegando una instancia básica de Prometheus para el entorno"
description: "Primer paso concreto de la recolección de métricas dentro de Kubernetes. Despliegue de una instancia básica de Prometheus y preparación de una recolección real sobre NovaMarket."
order: 132
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Desplegando una instancia básica de Prometheus para el entorno

En la clase anterior dejamos claro algo importante:

- exponer métricas no es lo mismo que recolectarlas,
- y además NovaMarket ya está lo suficientemente maduro dentro del cluster como para que una primera recolección real tenga mucho sentido.

Ahora toca el paso concreto:

**desplegar una instancia básica de Prometheus dentro del entorno.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- desplegada una instancia básica de Prometheus,
- preparada una base mínima de recolección dentro del cluster,
- y mucho más claro cómo se conecta esta nueva pieza con las métricas que NovaMarket ya expone.

Todavía no vamos a resolver una plataforma completa ni dashboards finales.  
La meta de hoy es mucho más concreta: **instalar una pieza real que pueda empezar a recolectar métricas dentro del entorno**.

---

## Estado de partida

Partimos de un sistema donde ya tenemos:

- métricas básicas útiles
- una primera exposición orientada a Prometheus
- y piezas importantes del cluster que ya empiezan a hablar un formato más estándar

Eso significa que el paso siguiente natural ya no está del lado de la aplicación, sino del lado del entorno:

- ahora necesitamos una pieza que empiece a leer esas métricas.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- introducir una instancia básica de Prometheus dentro del cluster,
- darle una configuración inicial razonable,
- preparar su relación con una pieza importante de NovaMarket,
- y dejar lista la base para validar una primera recolección real.

---

## Qué queremos resolver exactamente

Queremos pasar de este estado:

- “la aplicación expone métricas y yo podría mirarlas manualmente”

a un estado más maduro como este:

- “el entorno ya tiene una pieza dedicada a recolectarlas”

Ese cambio puede parecer pequeño, pero en realidad es uno de los más fuertes de toda esta etapa del bloque.

---

## Paso 1 · Pensar Prometheus como pieza del entorno, no como tema abstracto

Este punto vale muchísimo.

Hasta ahora Prometheus apareció sobre todo como una orientación conceptual.

Ahora, en cambio, empieza a convertirse en una pieza real del ecosistema operativo del cluster.

Eso significa que deja de ser una idea para pasar a ser un recurso concreto que forma parte del entorno.

---

## Paso 2 · Crear una ubicación razonable para sus manifests

Una opción bastante clara puede ser algo como:

```txt
k8s/infrastructure/prometheus/
```

y dentro de esa carpeta empezar a pensar recursos como:

- configuración
- deployment
- service

No hace falta todavía construir una arquitectura gigantesca.  
La idea es instalar una base mínima, ordenada y didáctica.

---

## Paso 3 · Preparar la configuración inicial

Prometheus necesita saber, al menos de forma básica, qué va a scrapear.

Para esta primera iteración del curso, no hace falta una configuración muy grande.

Alcanza con una base simple que deje claro:

- que existe una política de scraping
- y que una pieza importante de NovaMarket ya forma parte de esa intención

La clave es empezar chico y entendible.

---

## Paso 4 · Crear el `ConfigMap` de Prometheus

Una base conceptual razonable podría ser algo como un `ConfigMap` con una configuración inicial simple.

No hace falta llenar esta clase de detalles avanzados.

Lo importante es que la instancia de Prometheus ya tenga un punto de partida explícito desde el cual sepa qué intentar recolectar dentro del entorno.

---

## Paso 5 · Crear el `Deployment` de Prometheus

Ahora conviene desplegar la propia pieza dentro del cluster.

La idea es que Prometheus pase a existir como un servicio real del entorno y no solo como una intención futura.

Este es uno de los momentos más importantes de toda la clase.

---

## Paso 6 · Crear también un `Service`

Igual que con otras piezas del bloque, conviene darle un `Service` para que Prometheus quede accesible dentro del entorno y, si hace falta, pueda ser consultado o validado de forma más clara.

No hace falta todavía una exposición gigantesca.  
La prioridad es que la pieza exista y pueda usarse dentro del cluster.

---

## Paso 7 · Aplicar los recursos

Ahora aplicá:

- la configuración
- el `Deployment`
- y el `Service`

La idea es que Prometheus ya forme parte real del entorno Kubernetes de NovaMarket.

Este es el verdadero momento importante de la clase.

---

## Paso 8 · Verificar que Prometheus ya vive dentro del cluster

Después de aplicar los recursos, conviene comprobar que:

- el Pod existe
- el `Deployment` quedó bien
- y el `Service` también

No hace falta todavía validar todo el scraping.  
Primero queremos confirmar que la nueva pieza ya forma parte del entorno real del cluster.

---

## Paso 9 · Pensar qué cambió en el modelo mental del bloque

Hasta ahora, la observación cuantitativa del sistema todavía dependía bastante de:

- exposiciones puntuales
- y lecturas relativamente manuales

Ahora, en cambio, el entorno ya empieza a tener una pieza dedicada a recolectar esas señales.

Ese cambio vale muchísimo, porque marca una nueva etapa de madurez del sistema.

---

## Paso 10 · No buscar todavía una integración total

Conviene dejarlo muy claro.

En esta etapa no estamos todavía:

- resolviendo toda la configuración final de Prometheus
- ni integrando todas las piezas del cluster
- ni armando una plataforma completa de observabilidad cuantitativa

La meta actual es mucho más concreta:

**desplegar una instancia básica y dejarla lista para una primera recolección real.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase instala una pieza real de recolección de métricas dentro del entorno.

Ya no estamos solo orientando el sistema hacia Prometheus.  
Ahora también empezamos a darle al cluster una primera herramienta concreta para escuchar esas métricas.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- validamos una recolección real sobre una pieza importante del sistema
- ni consolidamos todavía esta nueva etapa del bloque

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**desplegar una instancia básica de Prometheus dentro del entorno.**

---

## Errores comunes en esta etapa

### 1. Querer montar una arquitectura gigantesca desde la primera iteración
Para esta etapa, una base simple y clara es mejor.

### 2. Pensar que Prometheus ya aporta valor solo por estar desplegado
Todavía falta validar la recolección.

### 3. No separar configuración, `Deployment` y `Service`
Conviene mantener el orden que venimos trabajando en todo el bloque.

### 4. Tratar esta pieza como algo aislado del sistema
En realidad forma parte de la evolución natural de toda la observación cuantitativa.

### 5. No verificar que la instancia realmente vive dentro del cluster
El paso tiene que quedar operativamente real, no solo escrito en manifests.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, NovaMarket debería tener una instancia básica de Prometheus desplegada dentro del cluster y lista para una primera recolección real de métricas.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- Prometheus ya existe dentro del cluster,
- su `Deployment` está sano,
- el `Service` existe,
- y el entorno ya cuenta con una pieza real dedicada a recolectar métricas.

Si eso está bien, ya podemos pasar a validar una primera recolección concreta sobre una pieza importante del sistema.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar una primera recolección básica de métricas desde Prometheus sobre NovaMarket y a consolidar esta nueva etapa del bloque.

---

## Cierre

En esta clase desplegamos una instancia básica de Prometheus dentro del entorno.

Con eso, el bloque de Kubernetes da otro salto fuerte de madurez: el sistema ya no solo expone métricas de una forma más estándar, sino que también empieza a contar con una pieza real dedicada a recolectarlas dentro del cluster.
