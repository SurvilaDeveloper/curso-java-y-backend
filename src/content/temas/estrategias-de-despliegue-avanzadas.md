---
title: "Estrategias de despliegue avanzadas"
description: "Qué estrategias de despliegue existen más allá del release básico, cómo reducir riesgo al liberar cambios y qué trade-offs traen enfoques como blue-green, canary, rolling, feature flags y despliegues progresivos."
order: 240
module: "Cloud, despliegue, carrera y proyecto final"
level: "intermedio"
draft: false
---

## Introducción

Cuando un sistema es chico, muchas veces desplegar significa algo bastante directo:

- se hace merge
- se corre el pipeline
- se publica la nueva versión
- y se espera que todo salga bien

Durante un tiempo eso puede alcanzar.

Pero a medida que el backend gana tráfico, criticidad y dependencias, aparece una realidad incómoda:

**desplegar deja de ser solamente “subir una versión”.**

Empieza a ser una operación de riesgo.

Porque un deploy puede:

- introducir errores
- degradar performance
- romper compatibilidad
- activar código todavía inmaduro
- fallar a mitad de camino
- dejar usuarios en estados mezclados
- o impactar ingresos si toca checkout, billing, auth o flujos sensibles

En ese punto ya no alcanza con pensar en “cómo desplegar”.
Hace falta pensar en:

**cómo desplegar reduciendo riesgo, detectando problemas rápido y conservando capacidad de reversión.**

De eso trata esta lección.

## Qué es una estrategia de despliegue

Una estrategia de despliegue es la forma en que una nueva versión pasa de estar construida a estar realmente disponible para usuarios o sistemas consumidores.

No se trata solo del comando técnico de deploy.
Se trata de decidir:

- cómo entra la nueva versión en producción
- cuánto tráfico recibe al principio
- cómo convive con la versión anterior
- cómo se monitorea su comportamiento
- cómo se revierte si algo sale mal
- y qué nivel de exposición tiene mientras todavía hay incertidumbre

En otras palabras:

**la estrategia de despliegue define cómo administrás el riesgo de cambio en producción.**

## Por qué este tema importa tanto

Porque incluso con buen testing, una parte de la verdad recién aparece en producción.

Hay cosas que en entornos previos no se ven del todo:

- volúmenes reales
- patrones raros de uso
- combinaciones inesperadas de datos
- comportamiento con tráfico concurrente
- integraciones externas reales
- diferencias de latencia
- efectos sobre cache, colas y base de datos

Eso significa que el deploy no es solo un paso mecánico.
Es un momento donde el sistema cambia bajo condiciones reales.

Por eso los equipos maduros no dependen únicamente de “tener confianza”.
Dependen de mecanismos que les permitan:

- exponer cambios gradualmente
- observar rápido
- limitar impacto
- volver atrás con criterio

## El enfoque más básico: reemplazo directo

La forma más simple de desplegar es esta:

1. se detiene o reemplaza la versión actual
2. se publica la nueva
3. el tráfico pasa a esa nueva versión

A veces esto funciona bien.
Especialmente si:

- el sistema es chico
- el tráfico es bajo
- el impacto de error es acotado
- revertir es fácil
- hay buena compatibilidad entre versiones

Pero tiene varios problemas:

- si la versión nueva falla, el impacto es inmediato
- no hay exposición gradual
- la reversión puede no ser trivial
- si hay migraciones incompatibles, volver atrás puede ser difícil
- toda la base de usuarios queda afectada al mismo tiempo

En sistemas serios, muchas veces hace falta algo mejor.

## Objetivo real de una estrategia avanzada

Una estrategia avanzada no existe para verse sofisticada.
Existe para lograr una o varias de estas cosas:

- reducir downtime
- limitar el radio de impacto
- probar la nueva versión con una porción controlada de tráfico
- detectar regresiones antes de afectar a todos
- mantener capacidad de rollback
- separar deploy técnico de activación funcional
- controlar mejor cambios riesgosos

No todas las estrategias sirven para lo mismo.
Y no todas tienen el mismo costo operativo.

## Rolling deployment

Una de las estrategias más comunes es el **rolling deployment**.

La idea es reemplazar instancias gradualmente.

Por ejemplo:

- salen algunas instancias viejas
- entran algunas nuevas
- parte del tráfico pasa a la nueva versión
- el proceso continúa hasta completar el reemplazo

### Ventajas

- suele evitar downtime visible
- encaja bien en orquestadores modernos
- distribuye el cambio en el tiempo
- permite detectar fallas antes de completar todo el rollout

### Riesgos y límites

- durante un tiempo conviven dos versiones
- si no hay compatibilidad entre versiones, puede romperse algo
- rollback parcial puede ser confuso
- las sesiones, colas o cambios de contrato deben tolerar coexistencia temporal

El rolling deployment funciona muy bien cuando el sistema fue diseñado para soportar convivencia entre versiones por un período corto.

## Blue-green deployment

Acá la idea es tener dos entornos:

- uno activo: **blue**
- uno nuevo preparado: **green**

Se despliega la nueva versión en green, se valida, y luego se cambia el tráfico desde blue hacia green.

### Ventajas

- cambio rápido entre versiones
- rollback relativamente simple si blue sigue intacto
- buena separación entre la versión actual y la nueva
- reduce mucho el riesgo de despliegues a medio aplicar

### Costos y trade-offs

- exige duplicar ambientes o capacidad por un tiempo
- puede ser más caro
- datos compartidos siguen siendo un punto delicado
- si hay migraciones no reversibles, el rollback deja de ser tan simple

Blue-green es muy útil cuando querés minimizar el riesgo de reemplazo progresivo desordenado y tenés capacidad para sostener dos entornos.

## Canary deployment

En un **canary deployment**, la nueva versión se expone primero a una porción pequeña de tráfico.

Por ejemplo:

- 1%
- 5%
- 10%
- 25%
- 50%
- 100%

La idea es observar comportamiento real antes de escalar exposición.

### Qué se suele monitorear

- tasa de error
- latencia
- consumo de recursos
- métricas de negocio
- anomalías de comportamiento
- diferencias entre versión vieja y nueva

### Ventajas

- reduce mucho el radio de impacto inicial
- permite validación progresiva con tráfico real
- combina bien con observabilidad madura
- ayuda a detectar fallas que no aparecieron antes

### Riesgos

- exige routing más sofisticado
- dos versiones conviven durante más tiempo
- puede generar resultados difíciles de interpretar si los usuarios ven caminos distintos
- algunas features no son fáciles de evaluar solo con una porción de tráfico

Canary vale muchísimo cuando el sistema tiene tráfico suficiente y observabilidad lo bastante buena como para tomar decisiones basadas en señales reales.

## Despliegue por porcentaje o por segmentos

Relacionado con canary, muchas veces no se libera por porcentaje puro sino por grupos concretos.

Por ejemplo:

- usuarios internos primero
- un tenant específico
- una región
- cuentas beta
- clientes de bajo riesgo
- tráfico no crítico

Esto a veces es mejor que repartir al azar porque permite:

- elegir exposición más controlada
- probar con usuarios conocidos
- limitar impacto comercial
- validar escenarios concretos antes de abrir más

La pregunta importante es:

**¿quién debería recibir el cambio primero para maximizar aprendizaje y minimizar daño?**

## Feature flags y activación separada del deploy

Una idea muy poderosa es separar:

- **deploy del código**
- **activación de la funcionalidad**

Con feature flags podés:

- desplegar una versión sin exponer todavía la nueva feature
- activar progresivamente
- limitar a ciertos usuarios o tenants
- apagar rápido sin redeploy
- probar caminos nuevos en paralelo

Esto no reemplaza una estrategia de despliegue.
Pero la complementa muchísimo.

En equipos maduros, muchas veces el deploy técnico ocurre antes, y la liberación de valor ocurre después, de forma controlada.

## Dark launch

Un dark launch consiste en poner parte de la nueva lógica en producción sin hacerla visible de forma plena para usuarios.

Por ejemplo:

- procesar solicitudes en paralelo sin mostrar el resultado
- ejecutar un nuevo motor de cálculo solo para comparar salidas
- enviar tráfico sombra a una nueva versión
- validar performance o consistencia antes de encender la funcionalidad

Esto ayuda mucho cuando querés responder preguntas como:

- ¿la nueva implementación escala bien?
- ¿devuelve resultados coherentes?
- ¿genera efectos laterales inesperados?
- ¿está lista para tráfico real?

## Shadow traffic o mirrored traffic

Otra estrategia avanzada consiste en duplicar tráfico real hacia una nueva versión sin que esa nueva versión responda al usuario final.

Se usa para:

- comparar comportamiento
- validar capacidad
- probar sistemas nuevos bajo carga real
- identificar diferencias con producción vigente

Hay que usarla con mucho cuidado.
Porque si el sistema nuevo produce efectos laterales reales, podés generar inconsistencias.

Suele ser más segura cuando:

- las operaciones son solo de lectura
- la escritura está desactivada
- los side effects están aislados
- los resultados se observan pero no se publican

## Despliegues con pausas manuales o gates

No todo despliegue avanzado es completamente automático.

A veces conviene introducir gates, por ejemplo:

1. despliegue técnico
2. validación automática
3. observación breve
4. aprobación manual
5. expansión del tráfico

Esto puede parecer más lento, pero en cambios delicados a veces es exactamente lo correcto.

La automatización madura no significa sacar todo control humano.
Significa poner intervención humana donde realmente agrega valor.

## Qué hace que una estrategia sea viable

Para usar estrategias más avanzadas, el sistema necesita cierta base.

### 1. Compatibilidad entre versiones

Si dos versiones no pueden convivir ni por minutos, muchas estrategias se vuelven peligrosas.

### 2. Observabilidad razonable

No sirve hacer canary si no podés medir si la versión nueva está peor.

### 3. Automatización de despliegue

Sin pipelines y procesos repetibles, estas estrategias se vuelven demasiado frágiles.

### 4. Routing o control de tráfico

Necesitás alguna forma de decidir quién recibe qué versión.

### 5. Rollback claro

No solo técnico, también operativo.
Hay que saber:

- cuándo volver atrás
- quién decide
- qué métrica dispara la reversión
- qué pasa con datos ya procesados

## El punto crítico: compatibilidad

Muchas veces el mayor obstáculo no es el deploy en sí.
Es la compatibilidad entre versiones concurrentes.

Por ejemplo:

- una versión nueva escribe un formato que la vieja no entiende
- una migración de base rompe lectura de la versión anterior
- se cambian eventos o contratos sin tolerancia temporal
- una cola recibe mensajes incompatibles
- se elimina un campo que todavía se usa

Cuando esto pasa, estrategias como rolling o canary se vuelven mucho más riesgosas.

Por eso un backend maduro piensa el despliegue junto con:

- versionado de contratos
- compatibilidad hacia atrás
- migraciones expand/contract
- tolerancia a coexistencia temporal

## Migraciones y despliegues

Este es uno de los puntos más delicados del tema.

Porque aunque la app pueda desplegarse gradual o elegantemente, la base de datos puede convertirse en el verdadero cuello de botella del cambio.

Buenas ideas típicas:

- separar migraciones estructurales de activación funcional
- preferir cambios aditivos antes que destructivos
- usar estrategias expand/contract
- evitar depender de rollback mágico si el esquema ya cambió de forma irreversible
- probar tiempos y locks antes del release real

Una estrategia de despliegue nunca debería pensarse aislada del plan de evolución de datos.

## Métricas técnicas y métricas de negocio

Cuando se despliega una nueva versión, no alcanza con mirar si los pods siguen vivos.

Hay que observar dos mundos.

### Métricas técnicas

- errores
- latencia
- uso de CPU y memoria
- timeouts
- saturación de recursos
- retries
- fallas de dependencias

### Métricas de negocio

- conversión
- checkout exitoso
- login completado
- cobro aprobado
- orden creada
- tasa de abandono
- volumen procesado

A veces una versión parece “sana” técnicamente pero rompe el producto comercialmente.

## Cuándo conviene cada estrategia

No hay una respuesta universal.

### Reemplazo directo
Puede alcanzar cuando el sistema es simple y el riesgo es bajo.

### Rolling
Muy útil para muchas aplicaciones stateless con buena compatibilidad entre versiones.

### Blue-green
Conviene cuando querés cambios limpios entre versiones y rollback rápido, y podés pagar el costo operativo.

### Canary
Excelente cuando tenés suficiente tráfico, buena observabilidad y querés liberar gradualmente.

### Feature flags + rollout progresivo
Muy potente cuando necesitás separar deploy técnico de activación funcional.

### Dark launch o shadow traffic
Útil para sistemas delicados, motores nuevos o validaciones avanzadas antes de exponer resultado.

La mejor elección depende de:

- criticidad del sistema
- costo del error
- facilidad de rollback
- madurez operativa
- volumen de tráfico
- compatibilidad entre versiones
- herramientas disponibles

## Errores comunes

### 1. Copiar una estrategia “moderna” sin base operativa suficiente

Por ejemplo hacer canary sin métricas que permitan evaluar el canary.

### 2. Pensar que rollback siempre es trivial

Muchas veces el código sí vuelve atrás, pero los datos no.

### 3. No definir criterios de avance o abortado

Si no sabés qué señal te hace frenar, el despliegue progresivo pierde valor.

### 4. Medir solo infraestructura

Y no mirar el impacto real en negocio.

### 5. Activar demasiadas cosas al mismo tiempo

Eso vuelve difícil aislar qué cambió realmente.

### 6. Diseñar una estrategia que el equipo no puede operar bien

La estrategia correcta no es la más sofisticada.
Es la que el equipo realmente puede ejecutar, observar y revertir con confianza.

## Mini ejercicio mental

Imaginá este escenario:

Tu backend procesa pagos y creación de órdenes.
Vas a lanzar una nueva versión del flujo de checkout.

Pensá:

1. ¿expondrías el cambio a todos de una vez?
2. ¿usarías rolling, blue-green o canary?
3. ¿qué métricas técnicas mirarías en los primeros minutos?
4. ¿qué métricas de negocio mirarías?
5. ¿cómo aislarías el impacto si algo sale mal?
6. ¿qué harías con la migración de base asociada?
7. ¿qué condición concreta te haría frenar o revertir?

## Relación con la lección anterior

La lección anterior se enfocó en entornos efímeros y preview environments.

Eso ayuda muchísimo a validar cambios antes del merge o antes del release.

Pero incluso con esa validación previa, sigue existiendo el desafío de:

- cómo liberar en producción
- cómo limitar riesgo
- cómo observar el comportamiento real

Esta lección toma ese problema y lo lleva al momento donde el cambio ya está por tocar usuarios reales.

## Relación con lo que viene

Esto conecta muy bien con la próxima lección sobre:

- cómo presentar una arquitectura backend profesionalmente

Porque un backend engineer más maduro no solo sabe construir sistemas.
También sabe explicar:

- cómo se despliegan
- cómo se reduce riesgo
- cómo se operan cambios delicados
- y por qué se eligió cierta estrategia en lugar de otra

Es decir:

**no alcanza con saber hacer deploys; también hay que saber justificar el diseño operativo detrás de ellos.**

## Idea final

Las estrategias de despliegue avanzadas no existen para complicar el delivery.
Existen para volverlo más seguro, más observable y más controlable.

La pregunta no es:

**“¿qué estrategia suena más moderna?”**

La pregunta correcta es:

**“¿qué forma de liberar cambios reduce mejor el riesgo en este sistema, con este equipo y bajo estas restricciones?”**

Cuando un backend madura de verdad, el deploy deja de ser un acto impulsivo.
Se vuelve una operación diseñada.

Y esa diferencia cambia muchísimo la confiabilidad del sistema a largo plazo.
