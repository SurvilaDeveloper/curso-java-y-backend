---
title: "Exponiendo métricas en formato Prometheus para una pieza importante"
description: "Primer paso concreto de la integración orientada a Prometheus en Kubernetes. Exposición de métricas en formato Prometheus para una pieza importante de NovaMarket."
order: 129
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Exponiendo métricas en formato Prometheus para una pieza importante

En la clase anterior abrimos una nueva etapa importante del bloque:

- entendimos por qué Prometheus ya tenía sentido,
- y dejamos claro que el sistema ya está lo suficientemente maduro como para preparar una exposición de métricas más estándar dentro del entorno.

Ahora toca el paso concreto:

**exponer métricas en formato Prometheus para una pieza importante de NovaMarket.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- elegida una pieza importante del sistema para inaugurar esta integración,
- preparada la exposición de métricas en formato Prometheus,
- y más claro cómo se relaciona esta nueva salida con todo lo que ya construimos antes en el bloque.

Todavía no vamos a montar un stack completo ni dashboards finales.  
La meta de hoy es mucho más concreta: **dar el primer paso real hacia una integración orientada a Prometheus dentro del cluster**.

---

## Estado de partida

Partimos de un entorno donde varias piezas importantes de NovaMarket ya exponen señales valiosas a través de Spring Boot Actuator y donde las métricas básicas ya empezaron a aportar valor práctico dentro del cluster.

Eso significa que no estamos construyendo esta etapa desde cero.

En realidad, el siguiente paso natural es hacer que esas métricas salgan en un formato más estándar y más cómodo para el ecosistema.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir una pieza importante del sistema,
- revisar su configuración de métricas,
- habilitar o confirmar la exposición del endpoint adecuado para Prometheus,
- y dejar lista una base real para una observación más madura del servicio.

---

## Qué pieza conviene elegir primero

Para esta primera iteración, sigue teniendo mucho sentido trabajar con algo como:

- `api-gateway`
- `order-service`
- o `notification-service`

La idea es usar una pieza importante y suficientemente representativa como para que el valor del cambio sea fácil de entender.

`api-gateway` suele ser una muy buena opción porque su rol es visible y su observación tiene bastante peso dentro del sistema.

---

## Paso 1 · Entender qué endpoint nos interesa ahora

Hasta ahora trabajamos mucho con:

```txt
/actuator/health
```

Ahora, en cambio, el foco empieza a moverse hacia otro tipo de salida, por ejemplo:

```txt
/actuator/prometheus
```

El punto importante de esta clase es justamente ese cambio:

- ya no solo queremos una lectura de health
- queremos una salida de métricas en un formato más útil para Prometheus

Ese cambio es el corazón de esta etapa.

---

## Paso 2 · Revisar si el proyecto ya tiene la base necesaria

A esta altura conviene confirmar que el servicio ya cuenta con la base adecuada para exponer esta salida.

Según cómo venga armado el proyecto, eso puede implicar revisar cosas como:

- la presencia del soporte correcto en la aplicación
- la exposición del endpoint
- y la configuración mínima necesaria para que la salida realmente exista

No hace falta convertir esta clase en una tesis de configuración.  
La prioridad es que la pieza quede lista para exponer métricas en este formato.

---

## Paso 3 · Ajustar la exposición del endpoint correspondiente

Ahora conviene asegurarse de que el endpoint orientado a Prometheus quede disponible como parte de la configuración del servicio.

La idea es que la aplicación ya no solo pueda responder health o info, sino también exponer una salida de métricas pensada para ser scrapeada más adelante.

Este es el verdadero paso importante de la clase.

---

## Paso 4 · Reaplicar o relanzar la pieza si hace falta

Después de ajustar la configuración necesaria, conviene reaplicar o volver a levantar la pieza correspondiente dentro del cluster.

La idea es que el cambio no quede solo en archivos de configuración, sino que realmente forme parte del estado operativo del sistema.

---

## Paso 5 · Validar que el endpoint ahora exista

Ahora revisá que el servicio efectivamente pueda exponer la nueva salida.

No hace falta todavía una plataforma de recolección completa para capturar el valor de este paso.

La prioridad es comprobar que la pieza ya habla un lenguaje mucho más útil para Prometheus.

---

## Paso 6 · Entender qué cambió respecto de la etapa anterior

A esta altura conviene fijar algo muy importante:

antes, las métricas ya nos servían para leer mejor el comportamiento del sistema.

Ahora, en cambio, esas métricas empiezan a estar disponibles en una forma mucho más estándar y compatible con una integración más seria.

Ese salto vale muchísimo.

---

## Paso 7 · Cruzar esta nueva salida con el rol del servicio

Este punto importa bastante.

No queremos exponer métricas “porque sí”.

Queremos pensar algo como:

- esta pieza es importante dentro del sistema
- ya tiene valor leerla mejor
- y ahora además puede exponer sus señales cuantitativas en una forma preparada para una observación más madura

Ese contexto vuelve mucho más útil el paso.

---

## Paso 8 · No intentar todavía cerrar toda la plataforma

Conviene dejar esto muy claro.

En esta etapa todavía no estamos:

- montando un Prometheus final
- ni armando una estrategia completa de scraping para todo el cluster
- ni resolviendo dashboards y visualización avanzada

La meta actual es mucho más concreta:

**lograr que una pieza importante del sistema exponga métricas en un formato útil para Prometheus.**

Y eso ya aporta muchísimo valor.

---

## Paso 9 · Pensar por qué esto mejora el resto del bloque

A partir de ahora, cualquier refinamiento posterior sobre métricas y observación cuantitativa va a ser mucho más fácil de sostener porque el sistema ya empieza a hablar un formato estándar del ecosistema.

Eso significa que esta clase no solo vale por sí misma.

También prepara muy bien:

- scraping más ordenado
- monitoreo más serio
- y una evolución natural hacia una observación cuantitativa más madura

Ese efecto transversal vale muchísimo.

---

## Qué estamos logrando con esta clase

Esta clase instala la primera integración real orientada a Prometheus dentro del bloque de Kubernetes.

Ya no estamos solo observando métricas básicas de forma puntual.  
Ahora también empezamos a exponerlas de una forma mucho más compatible con el ecosistema real del cluster.

Eso es un salto importante de madurez.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos esta exposición como checkpoint del bloque
- ni la convertimos todavía en una estrategia más amplia de recolección

Todo eso viene en la próxima clase.

La meta de hoy es mucho más concreta:

**exponer métricas en formato Prometheus para una pieza importante del sistema.**

---

## Errores comunes en esta etapa

### 1. Creer que con mirar una métrica puntual ya estamos listos para Prometheus
Todavía faltaba exponerla de una forma más estándar.

### 2. Querer resolver scraping y dashboards en la misma clase
Conviene respetar la secuencia del bloque.

### 3. No validar que el endpoint realmente exista después del cambio
La integración tiene que ser real, no solo teórica.

### 4. Tratar este paso como una curiosidad aislada
En realidad prepara mucho todo lo que sigue.

### 5. Elegir una pieza poco relevante para la primera iteración
Conviene empezar donde el valor del cambio sea claro.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, al menos una pieza importante de NovaMarket debería estar exponiendo métricas en un formato útil para Prometheus dentro del cluster.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- elegiste una pieza importante del sistema,
- la salida orientada a Prometheus está disponible,
- entendés qué cambió respecto de la etapa anterior,
- y ves por qué esto mejora mucho la evolución futura de la observación del entorno.

Si eso está bien, ya podemos consolidar esta nueva etapa del bloque.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a consolidar esta integración básica orientada a Prometheus dentro de NovaMarket y dejarla conectada al resto de refinamientos del entorno.

---

## Cierre

En esta clase expusimos métricas en formato Prometheus para una pieza importante de NovaMarket.

Con eso, el bloque de Kubernetes da otro paso fuerte de madurez: el sistema ya no solo puede observarse mejor desde métricas básicas, sino que además empieza a exponerlas en una forma mucho más estándar, más reusable y mucho más alineada con el ecosistema real del cluster.
