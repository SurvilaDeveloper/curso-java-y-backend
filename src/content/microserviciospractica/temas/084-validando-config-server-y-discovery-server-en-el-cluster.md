---
title: "Validando config-server y discovery-server en el cluster"
description: "Checkpoint del núcleo base de NovaMarket en Kubernetes. Verificación del despliegue de config-server y discovery-server antes de llevar servicios de negocio al cluster."
order: 84
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Validando `config-server` y `discovery-server` en el cluster

En las clases anteriores hicimos dos pasos muy importantes dentro del bloque de Kubernetes:

- llevamos `config-server` al cluster,
- y después desplegamos `discovery-server`.

Eso ya deja al proyecto con sus dos piezas fundacionales más importantes viviendo dentro del nuevo entorno.

Antes de seguir llevando servicios de negocio, conviene hacer algo muy valioso:

**validar bien este núcleo base.**

Porque una cosa es tener dos Deployments creados.  
Y otra bastante distinta es comprobar que esas dos piezas ya forman una base operativa suficientemente sana como para sostener lo que viene después.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- `config-server` vive correctamente dentro del cluster,
- `discovery-server` también,
- ambos ya forman un núcleo base razonable de NovaMarket en Kubernetes,
- y el proyecto está listo para empezar a llevar servicios funcionales del negocio.

Esta clase funciona como checkpoint muy importante del arranque del bloque.

---

## Estado de partida

Partimos de este contexto:

- el namespace `novamarket` ya existe,
- `config-server` ya fue desplegado,
- `discovery-server` ya fue desplegado,
- y ambos ya tienen sus recursos básicos de Deployment y Service.

Ahora toca confirmar que eso no es solo “estructura creada”, sino base operativa usable.

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar Pods y Services del núcleo base,
- mirar logs,
- validar estado general,
- pensar cómo se relacionan ambas piezas,
- y dejar claro si el entorno ya está listo para sostener el siguiente escalón del sistema.

---

## Por qué esta clase importa tanto

Porque si el núcleo base todavía está frágil, llevar servicios de negocio demasiado rápido a Kubernetes solo multiplica el desorden.

En cambio, si validamos bien este punto intermedio, el resto del bloque se vuelve muchísimo más limpio.

En otras palabras:

**esta clase no agrega servicios nuevos, pero reduce muchísimo el riesgo de los próximos pasos.**

---

## Paso 1 · Verificar el namespace

Primero conviene confirmar que seguimos trabajando dentro del namespace correcto:

```txt
novamarket
```

Este paso parece obvio, pero vale mucho mantener esa disciplina desde el inicio del bloque.

---

## Paso 2 · Revisar Pods de `config-server` y `discovery-server`

Ahora revisá que ambos Deployments hayan creado correctamente sus Pods.

La idea es comprobar algo muy básico pero muy importante:

- que ambos existen
- y que no están en un estado problemático evidente

Todavía no estamos buscando un análisis finísimo.  
Queremos confirmar salud básica del núcleo base.

---

## Paso 3 · Revisar los Services de ambos

Ahora comprobá que existan:

- el Service de `config-server`
- el Service de `discovery-server`

Esto importa mucho porque, dentro de Kubernetes, esos Services empiezan a convertirse en los puntos estables de acceso interno para el resto del sistema.

---

## Paso 4 · Mirar logs de `config-server`

Ahora revisá los logs de `config-server`.

Queremos observar que:

- la aplicación arranca correctamente,
- el contenedor no reinicia sin parar,
- y el servicio parece estable dentro del cluster.

Este paso es especialmente importante porque `config-server` va a ser una pieza muy consultada a medida que el bloque crezca.

---

## Paso 5 · Mirar logs de `discovery-server`

Hacé lo mismo con `discovery-server`.

Queremos comprobar que:

- arranca correctamente,
- no está roto por referencias internas incorrectas,
- y no muestra señales obvias de una mala integración con `config-server`.

No hace falta todavía tener el ecosistema entero registrado en Eureka.  
La prioridad es que esta pieza base ya esté viva y sana.

---

## Paso 6 · Pensar la relación entre ambos servicios

A esta altura conviene fijar algo importante:

dentro del cluster ya empieza a existir una base del ecosistema donde:

- `config-server` puede ser pensado como fuente de configuración centralizada
- y `discovery-server` como punto de discovery

Eso significa que el bloque de Kubernetes ya no es una hoja en blanco.  
Ya tiene una pequeña arquitectura viva dentro del cluster.

Ese cambio de estado vale muchísimo.

---

## Paso 7 · Validar endpoints básicos si tu entorno lo permite

Si tu entorno local de Kubernetes te permite acceder a los servicios o usar mecanismos de prueba adecuados, este es un buen momento para validar:

- el health de `config-server`
- y alguna señal equivalente de vida en `discovery-server`

No hace falta cerrar toda la estrategia de exposición externa hoy.  
Lo importante es confirmar que los servicios no solo existen como recursos, sino que realmente responden.

---

## Paso 8 · Revisar si el namespace ya tiene un núcleo coherente

A esta altura conviene hacerse una pregunta concreta:

**si mañana quisiera llevar `catalog-service`, siento que el cluster ya tiene la base suficiente para sostenerlo?**

La respuesta debería empezar a acercarse a un sí, justamente gracias a este checkpoint.

Ese tipo de lectura es muy útil para medir la madurez real del bloque.

---

## Paso 9 · Comparar con Docker Compose sin confundir los modelos

Este es un buen momento para notar algo:

en Compose también teníamos `config-server` y `discovery-server` como piezas base.

Pero ahora, en Kubernetes, el modo de describirlas y operarlas ya cambió.

No queremos pensar esto como “lo mismo pero más difícil”.  
Queremos pensarlo como:

- la misma arquitectura
- expresada de otro modo
- en otro entorno de orquestación

Ese cambio de mirada es muy valioso.

---

## Paso 10 · Decidir si ya estamos listos para llevar el primer servicio de negocio

Esta es la pregunta final de la clase.

Después de revisar:

- Pods
- Services
- logs
- y salud general

la decisión razonable debería ser:

sí, ya podemos empezar a llevar una pieza funcional del negocio al cluster.

Esa pieza va a ser `catalog-service` en la próxima clase.

---

## Qué estamos logrando con esta clase

Esta clase consolida el arranque del bloque de Kubernetes.

Ya no tenemos solo recursos creados:  
tenemos dos piezas fundacionales revisadas, comprendidas y razonablemente validadas.

Eso fortalece muchísimo los siguientes pasos.

---

## Qué todavía no hicimos

Todavía no:

- llevamos `catalog-service`
- desplegamos `inventory-service`
- reconstruimos el flujo del negocio dentro del cluster
- ni conectamos el sistema completo

Todo eso empieza enseguida.

La meta de hoy es mucho más concreta:

**validar bien el núcleo base antes de seguir escalando el entorno.**

---

## Errores comunes en esta etapa

### 1. Apurarse a desplegar servicios de negocio sin validar el núcleo base
Eso suele multiplicar confusión.

### 2. Mirar solo los recursos creados y no los logs
El verdadero estado operativo aparece mucho ahí.

### 3. Confundir “Deployment aplicado” con “servicio sano”
No siempre son lo mismo.

### 4. Pensar que esta clase “no agrega nada”
En realidad, agrega confianza operativa al bloque.

### 5. Comparar Kubernetes con Compose de forma demasiado literal
Conviene entender la continuidad de la arquitectura sin forzar equivalencias simples.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener validado que `config-server` y `discovery-server` ya forman un núcleo base razonable dentro del cluster, listo para empezar a recibir servicios funcionales del negocio.

Eso deja al bloque de Kubernetes muy bien preparado para seguir creciendo.

---

## Punto de control

Antes de seguir, verificá que:

- `config-server` está sano,
- `discovery-server` también,
- ambos tienen Deployment y Service operativos,
- los logs son razonables,
- y sentís que el cluster ya tiene base suficiente para sostener un servicio de negocio.

Si eso está bien, ya podemos llevar `catalog-service` al cluster.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a desplegar `catalog-service` en Kubernetes.

Ese será el primer servicio funcional del negocio que vamos a llevar al nuevo entorno y marcará un avance muy importante del bloque.

---

## Cierre

En esta clase validamos `config-server` y `discovery-server` dentro del cluster.

Con eso, NovaMarket ya tiene un núcleo base suficientemente confiable en Kubernetes y queda perfectamente preparado para empezar a reconstruir también su capa funcional dentro del nuevo entorno.
