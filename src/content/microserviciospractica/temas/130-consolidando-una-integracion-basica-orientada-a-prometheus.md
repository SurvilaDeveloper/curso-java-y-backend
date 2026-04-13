---
title: "Consolidando una integración básica orientada a Prometheus"
description: "Checkpoint de la primera integración orientada a Prometheus en Kubernetes. Consolidación de una exposición más estándar de métricas dentro de NovaMarket."
order: 130
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Consolidando una integración básica orientada a Prometheus

En las últimas clases del bloque de Kubernetes dimos otro paso importante de madurez:

- entendimos por qué Prometheus ya tenía sentido,
- y además expusimos métricas en un formato más estándar para una pieza importante de NovaMarket dentro del cluster.

Eso ya tiene muchísimo valor.

Pero ahora conviene hacer, otra vez, lo que venimos haciendo cada vez que el bloque sube de nivel:

**un checkpoint de consolidación.**

Porque una cosa es exponer un endpoint nuevo.  
Y otra bastante distinta es detenerse a mirar qué cambia realmente cuando el sistema deja de hablar solo en términos de health y métricas básicas puntuales, y empieza a exponer señales cuantitativas de una forma mucho más compatible con el ecosistema real.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- NovaMarket ya cuenta con una primera integración orientada a Prometheus,
- la exposición de métricas en formato estándar aporta valor real al entorno,
- el sistema se vuelve todavía más interpretable desde una mirada cuantitativa,
- y el bloque queda listo para seguir creciendo sobre una base de observación mucho más madura.

Esta clase funciona como checkpoint fuerte de la nueva etapa orientada a Prometheus.

---

## Estado de partida

Partimos de un cluster donde ya existen muchas capas de madurez acumuladas:

- servicios importantes desplegados
- entrada madura
- configuración externalizada
- probes
- recursos
- escalado
- actualizaciones controladas
- troubleshooting básico
- observabilidad operativa básica
- métricas básicas
- y ahora también una primera exposición orientada a Prometheus

Eso significa que el entorno ya no es solo un conjunto de piezas observables.  
Empieza a hablar de una forma mucho más estándar para una observación cuantitativa más seria.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar el valor real de esta nueva exposición,
- consolidar cómo encaja con el resto de señales del sistema,
- validar que NovaMarket se entiende mejor desde esta nueva perspectiva,
- y cerrar esta etapa antes de pasar a otros refinamientos del entorno.

---

## Qué queremos comprobar ahora

No queremos mirar solo “si el endpoint existe”.

Queremos observar algo más interesante:

- si el sistema ya está mejor preparado para una recolección cuantitativa seria
- si esta nueva salida mejora realmente la evolución del entorno
- y si NovaMarket ya deja de sentirse como algo que solo podemos observar desde herramientas más puntuales o menos estándar

Ese es el verdadero valor del checkpoint.

---

## Paso 1 · Volver sobre la idea central de esta etapa

Antes de entrar en detalles, conviene fijar la idea principal:

- primero aprendimos a leer métricas básicas
- y ahora dimos un paso más para exponerlas de una forma mucho más estándar y reutilizable

Ese matiz es una de las claves más valiosas de todo este tramo del bloque.

---

## Paso 2 · Revisar una pieza importante desde esta nueva salida

Ahora conviene volver a mirar la pieza que elegimos en la clase anterior, por ejemplo:

- `api-gateway`
- `order-service`
- o `notification-service`

La idea es consolidar que ya no depende solo de una lectura métrica puntual, sino que puede exponer una salida mucho más útil para integraciones posteriores.

---

## Paso 3 · Entender qué aporta esta exposición respecto de la etapa anterior

A esta altura del curso ya debería quedar bastante claro que:

- antes ya podíamos leer mejor algunas métricas
- ahora, además, esas métricas pueden salir en una forma más estándar y preparada para recolección

Ese cambio es más importante de lo que parece, porque vuelve al sistema mucho más compatible con una evolución seria de observabilidad.

---

## Paso 4 · Consolidar la relación con el resto del entorno

No queremos leer esta salida como algo aislado.

Lo valioso es verla en relación con todo lo demás que ya construimos:

- health
- probes
- troubleshooting
- observabilidad operativa básica
- métricas básicas

La exposición orientada a Prometheus no reemplaza nada de eso.  
Lo ordena y lo proyecta hacia una etapa más madura.

---

## Paso 5 · Pensar qué gana el resto del curso gracias a esto

A partir de ahora, cualquier refinamiento posterior sobre observación cuantitativa del sistema va a ser mucho más fácil de sostener porque ya existe una forma estándar de exponer métricas.

Eso significa que esta etapa no solo vale por sí misma.

También prepara muy bien:

- scraping más ordenado
- monitoreo más serio
- y una evolución mucho más clara hacia una lectura cuantitativa reusable

Ese efecto transversal vale muchísimo.

---

## Paso 6 · Comparar este estado con etapas anteriores del bloque

Si miramos el recorrido completo del módulo, la evolución es muy clara:

### Primero
- hacer vivir servicios dentro del cluster

### Después
- madurar acceso, configuración, salud, recursos, escalado y actualizaciones

### Luego
- aprender a diagnosticar y observar mejor

### Ahora
- empezar a exponer señales cuantitativas en una forma mucho más estándar

Ese recorrido muestra muy bien cómo el bloque ya no se trata solo de recursos y manifiestos, sino también de construir un entorno cada vez más interpretable y más preparado para una operación seria.

---

## Paso 7 · Entender qué todavía no estamos haciendo

Conviene dejarlo claro.

En este punto todavía no estamos:

- montando un Prometheus completo con toda su configuración final
- ni armando una plataforma completa de dashboards
- ni agotando toda la observabilidad cuantitativa del sistema

Eso está bien.

La meta actual es mucho más concreta:

**consolidar una primera integración orientada a Prometheus que ya aporte valor real al entorno.**

Y eso ya es un paso muy importante.

---

## Qué estamos logrando con esta clase

Esta clase consolida otra etapa importante del bloque de Kubernetes.

Ya no estamos solo construyendo, escalando, actualizando, diagnosticando y observando mejor el sistema.  
Ahora también estamos empezando a exponerlo en un lenguaje mucho más estándar para una observación cuantitativa seria.

Eso eleva mucho la calidad operativa y pedagógica del entorno.

---

## Qué todavía no hicimos

Todavía no:

- agotamos todas las posibilidades de Prometheus
- ni transformamos esta etapa en una plataforma completa de monitoreo

Eso puede venir después.

La meta de hoy es mucho más concreta:

**consolidar una integración básica orientada a Prometheus que ya podamos usar como base para todo lo que venga.**

---

## Errores comunes en esta etapa

### 1. Pensar que este paso aporta poco porque todavía no hay dashboards
En realidad la exposición estándar ya cambia muchísimo la calidad del entorno.

### 2. Reducir Prometheus a “otro endpoint más”
El valor está en la estandarización y en lo que habilita después.

### 3. Tratar esta etapa como algo aislado de Actuator y métricas básicas
En realidad es su evolución más natural.

### 4. Esperar una plataforma enorme antes de empezar a sacar valor
Lo básico bien orientado ya aporta muchísimo.

### 5. No consolidar este paso antes de seguir
Eso haría más difícil sostener todo lo que venga después.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener una visión bastante más clara de cómo una primera integración orientada a Prometheus mejora la observación cuantitativa de NovaMarket dentro del cluster y por qué eso vuelve mucho más madura la evolución del entorno.

Eso deja muy bien preparado el siguiente tramo del bloque.

---

## Punto de control

Antes de seguir, verificá que:

- ya no pensás las métricas solo como una lectura puntual,
- entendés el valor de exponerlas en un formato más estándar,
- sentís que NovaMarket está mejor preparado para una observación cuantitativa seria,
- y ves por qué esta nueva capa mejora mucho todo lo que siga.

Si eso está bien, entonces el bloque ya dio otro paso fuerte de madurez práctica dentro de Kubernetes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a empezar a pensar el siguiente gran refinamiento del entorno apoyándonos en toda esta base que ya construimos: acceso, configuración, salud, recursos, escalado, actualizaciones, troubleshooting, observabilidad operativa, métricas básicas y ahora también una primera integración orientada a Prometheus.

---

## Cierre

En esta clase consolidamos una integración básica orientada a Prometheus.

Con eso, NovaMarket ya no solo tiene una parte muy importante del sistema reconstruida, madura y mejor observada dentro del cluster: también empieza a exponer sus señales cuantitativas en una forma mucho más estándar, más reusable y mucho más alineada con una evolución seria de observabilidad.
