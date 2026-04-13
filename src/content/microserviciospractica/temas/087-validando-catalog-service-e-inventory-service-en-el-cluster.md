---
title: "Validando catalog-service e inventory-service en el cluster"
description: "Checkpoint de la primera capa funcional del negocio dentro de Kubernetes. Validación de catalog-service e inventory-service antes de llevar order-service al cluster."
order: 87
module: "Módulo 12 · Primer paso hacia Kubernetes"
level: "intermedio"
draft: false
---

# Validando `catalog-service` e `inventory-service` en el cluster

En las clases anteriores del bloque de Kubernetes construimos algo muy importante:

- desplegamos `config-server`
- desplegamos `discovery-server`
- llevamos `catalog-service`
- y después también llevamos `inventory-service`

Eso significa que el cluster ya no tiene solo el núcleo base del ecosistema, sino también una primera capa funcional del negocio.

Antes de mover `order-service`, conviene hacer una pausa muy valiosa:

**validar bien estas dos piezas funcionales dentro del nuevo entorno.**

Porque una cosa es aplicar Deployments.  
Y otra muy distinta es confirmar que estas dos piezas ya forman una base funcional razonable dentro del cluster.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase deberíamos haber validado que:

- `catalog-service` vive correctamente dentro de Kubernetes,
- `inventory-service` también,
- ambos ya forman una primera capa funcional razonable del negocio en el cluster,
- y el entorno está listo para empezar a recibir el servicio más sensible del flujo principal: `order-service`.

---

## Estado de partida

Partimos de este contexto:

- el namespace `novamarket` ya existe,
- `config-server` y `discovery-server` ya fueron validados,
- `catalog-service` ya fue desplegado,
- `inventory-service` también,
- y ambos tienen Deployment y Service propios dentro del cluster.

La pregunta ahora es sencilla pero muy importante:

**¿ya forman juntos una base suficientemente sana para seguir escalando?**

---

## Qué vamos a hacer hoy

En esta clase vamos a:

- revisar Pods y Services de ambas piezas,
- mirar logs,
- validar salud general,
- y dejar clara la madurez de esta primera capa funcional del negocio dentro del cluster.

---

## Por qué esta clase importa tanto

Porque `order-service` va a depender directamente de un ecosistema más rico que el de los servicios anteriores.

Y si la capa funcional del negocio todavía está frágil, apurarse a desplegar órdenes solo va a multiplicar confusión.

Por eso, esta clase funciona como una especie de “puerta de seguridad” del bloque:

si acá el entorno está sano, el siguiente paso se vuelve muchísimo más limpio.

---

## Paso 1 · Verificar el namespace

Como siempre, conviene confirmar primero que estamos observando los recursos dentro del namespace correcto:

```txt
novamarket
```

Mantener esta disciplina ayuda muchísimo a sostener el orden del bloque.

---

## Paso 2 · Revisar Pods de `catalog-service` e `inventory-service`

Ahora revisá que ambos Deployments hayan creado correctamente sus Pods.

Queremos confirmar al menos esto:

- que existen
- que no están en estados evidentemente problemáticos
- y que el cluster ya sostiene dos servicios funcionales del negocio de forma razonable

Este paso es simple, pero muy importante.

---

## Paso 3 · Revisar Services de ambos

Ahora comprobá que existan también:

- el Service de `catalog-service`
- el Service de `inventory-service`

Esto importa muchísimo porque estos Services son los puntos estables de acceso interno que sostendrán el resto del ecosistema a medida que el bloque siga creciendo.

---

## Paso 4 · Mirar logs de `catalog-service`

Ahora revisá los logs de `catalog-service`.

Queremos comprobar que:

- el servicio arranca correctamente,
- no entra en crash loop,
- y no hay señales evidentes de que el entorno del cluster le esté quedando “ajeno” o mal integrado.

Este paso ayuda bastante a confirmar que el primer servicio funcional realmente ya está cómodo dentro del nuevo entorno.

---

## Paso 5 · Mirar logs de `inventory-service`

Hacé lo mismo con `inventory-service`.

Queremos observar que:

- arranca correctamente,
- se mantiene estable,
- y no muestra señales obvias de una mala relación con el núcleo base del cluster.

Este servicio importa mucho porque va a ser una dependencia directa del flujo principal cuando llevemos `order-service`.

---

## Paso 6 · Pensar qué ya tenemos dentro del cluster

A esta altura del bloque, NovaMarket ya tiene en Kubernetes:

### Núcleo base
- `config-server`
- `discovery-server`

### Primera capa funcional
- `catalog-service`
- `inventory-service`

Eso significa que el cluster ya no es una maqueta mínima.

Empieza a parecerse cada vez más a una reconstrucción real del sistema.

Este punto vale mucho como lectura global del bloque.

---

## Paso 7 · Validar endpoints funcionales si tu entorno lo permite

Si ya contás con una forma razonable de probar servicios dentro de tu entorno local de Kubernetes, este es un gran momento para validar endpoints simples de:

- catálogo
- inventario

No hace falta todavía resolver todo el tema de exposición externa perfecta.  
La prioridad sigue siendo comprobar vida funcional y coherencia dentro del cluster.

---

## Paso 8 · Comparar este momento con el bloque de Compose

Este es un buen punto para notar algo interesante.

En Docker Compose ya habíamos logrado un stack integrado bastante rico.  
Pero ahora, dentro de Kubernetes, ya tenemos algo muy importante:

- el núcleo base
- más dos servicios funcionales reales del negocio

Eso quiere decir que el bloque de Kubernetes ya no está solo en fase preparatoria.  
Ya empezó a reconstruir de verdad la arquitectura.

---

## Paso 9 · Decidir si ya estamos listos para `order-service`

Esta es la pregunta final de la clase.

Después de revisar:

- Pods
- Services
- logs
- salud general
- y señales funcionales básicas

la respuesta debería empezar a ser:

sí, ya estamos razonablemente listos para llevar `order-service` al cluster.

Ese es un paso mucho más delicado que los anteriores, por eso este checkpoint importa tanto.

---

## Qué estamos logrando con esta clase

Esta clase consolida el primer bloque funcional del negocio dentro de Kubernetes.

Ya no tenemos solo servicios aislados aplicados como ejercicio.  
Tenemos una base operativa de negocio razonablemente validada.

Eso le da muchísima fuerza al siguiente paso del roadmap.

---

## Qué todavía no hicimos

Todavía no:

- llevamos `order-service`
- conectamos el flujo principal completo
- ni validamos el circuito de órdenes dentro del cluster

Todo eso viene enseguida.

La meta de hoy es mucho más concreta:

**asegurar que la primera capa funcional del negocio ya está realmente lista para soportar el siguiente escalón.**

---

## Errores comunes en esta etapa

### 1. Llevar `order-service` demasiado rápido sin validar esta base
Eso puede hacer mucho más difícil el troubleshooting.

### 2. Mirar solo que existan los recursos y no revisar logs
La salud real suele aparecer ahí.

### 3. Tratar cada servicio como aislado
A esta altura ya conviene pensar en la capa funcional como conjunto.

### 4. No comparar con el avance logrado en Compose
Ese contraste ayuda mucho a medir el crecimiento real del bloque.

### 5. Pensar que esta clase “no agrega nada”
En realidad agrega confianza operativa, que vale muchísimo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener validado que `catalog-service` e `inventory-service` forman una primera capa funcional suficientemente sana dentro del cluster como para seguir reconstruyendo el sistema.

Eso deja el entorno listo para llevar `order-service`.

---

## Punto de control

Antes de seguir, verificá que:

- `catalog-service` está sano,
- `inventory-service` también,
- ambos tienen Deployment y Service operativos,
- los logs son razonables,
- y sentís que el cluster ya está listo para recibir el servicio más delicado del flujo principal.

Si eso está bien, ya podemos llevar `order-service` a Kubernetes.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a desplegar `order-service` en Kubernetes.

Ese será uno de los pasos más importantes del bloque porque nos va a acercar mucho a la reconstrucción real del flujo principal del negocio dentro del cluster.

---

## Cierre

En esta clase validamos `catalog-service` e `inventory-service` dentro del cluster.

Con eso, NovaMarket ya tiene una primera capa funcional del negocio razonablemente consolidada en Kubernetes y queda perfectamente preparado para avanzar hacia el despliegue del servicio más central del flujo principal.
