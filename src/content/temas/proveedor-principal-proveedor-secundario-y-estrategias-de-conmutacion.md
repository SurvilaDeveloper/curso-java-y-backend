---
title: "Proveedor principal, proveedor secundario y estrategias de conmutación"
description: "Cómo pensar integraciones con proveedor principal y proveedor secundario, qué significa conmutar entre ellos y por qué esta estrategia puede ayudar a sostener continuidad operativa en flujos críticos."
order: 89
module: "Integraciones y sistemas reales"
level: "intermedio"
draft: false
---

## Introducción

En algunas integraciones reales, no alcanza con detectar que un proveedor falla o con reintentar varias veces.

A veces el sistema necesita algo más:

**tener otro camino posible.**

Por ejemplo:

- un proveedor de emails deja de responder
- una pasarela de pagos entra en degradación
- un servicio de cálculo de envíos falla de forma sostenida
- un proveedor externo empieza a devolver demasiados errores
- una integración crítica se vuelve demasiado lenta para operar normalmente

En esos casos, puede ser útil pensar en:

- un **proveedor principal**
- un **proveedor secundario**
- una estrategia de **conmutación**

Este tema aparece cuando querés que el sistema no dependa completamente de una única pieza externa para seguir operando en flujos importantes.

## Qué significa proveedor principal

El proveedor principal es el servicio externo que tu sistema usa normalmente como primera opción para resolver una determinada necesidad.

Por ejemplo:

- el proveedor principal de emails
- la pasarela principal de pagos
- el sistema principal de envíos
- el servicio principal de verificación
- la API principal de cotización

Es el camino esperado en condiciones normales.

## Qué significa proveedor secundario

El proveedor secundario es una alternativa preparada para usarse cuando el principal:

- falla
- se degrada
- responde demasiado lento
- queda temporalmente indisponible
- supera cierto umbral de errores
- necesita mantenimiento
- no puede resolver un caso puntual

No siempre tiene exactamente las mismas capacidades.
Pero puede servir como respaldo parcial o total.

## Qué significa conmutación

Conmutar significa cambiar de un proveedor a otro según una regla o condición determinada.

Por ejemplo:

- usar proveedor A normalmente
- si A falla repetidamente, pasar a B
- cuando A se recupere, decidir si volver o no
- en ciertos casos usar A y en otros B
- usar A como preferido y B como contingencia

La conmutación puede ser:

- automática
- manual
- parcial
- por tipo de operación
- por cliente
- por entorno
- por degradación detectada

## Por qué esto importa tanto

Porque algunas integraciones tienen un impacto demasiado fuerte como para depender ciegamente de una única opción externa.

Por ejemplo:

- si no sale el email, quizá el sistema sigue igual
- pero si no se puede procesar el pago, el negocio puede frenarse
- si no se puede calcular envío, una parte del checkout puede romperse
- si no se puede emitir cierta validación obligatoria, una operación crítica puede bloquearse

En ciertos contextos, tener una alternativa puede mejorar mucho la resiliencia operativa.

## No toda integración merece proveedor secundario

Esto también es importante.

No conviene asumir que siempre hay que tener dos proveedores para todo.

Porque eso también agrega:

- complejidad
- costo
- mantenimiento
- más contratos
- más testing
- más lógica de negocio
- más diferencias de comportamiento

Entonces hay que usar este patrón donde realmente tenga sentido.

## Cuándo suele tener más sentido

Suele ser más razonable cuando:

- la integración es crítica para el negocio
- el proveedor puede fallar con impacto alto
- existe una alternativa viable
- el costo de la caída es importante
- la operación necesita continuidad
- el sistema ya tiene cierto nivel de madurez

## Cuándo quizá no vale la pena

Puede no valer la pena cuando:

- la funcionalidad no es crítica
- el proveedor secundario no aporta suficiente valor real
- la complejidad de mantener ambos es demasiado alta
- no existe verdadera equivalencia operativa
- la estrategia de degradación simple ya alcanza
- el costo supera claramente el beneficio

No se trata de duplicar dependencias por reflejo.

## Ejemplo intuitivo

Supongamos un sistema que envía emails transaccionales.

Escenario posible:

- normalmente usa el proveedor A
- si A empieza a fallar o a responder mal, el sistema puede mandar ciertos mensajes críticos por B
- si ambos están disponibles, A sigue siendo el preferido
- el cambio puede ser automático o activado por operación

Eso puede evitar que una caída puntual deje completamente ciego al sistema en un flujo importante.

## Proveedor alternativo no siempre significa reemplazo perfecto

Este es un punto clave.

Dos proveedores que “hacen lo mismo” no siempre son realmente equivalentes.

Pueden diferir en:

- capacidades
- latencia
- costo
- cobertura
- formato de datos
- restricciones
- estados posibles
- features avanzadas
- calidad operativa
- límites

Entonces, tener proveedor secundario no significa necesariamente que todo siga funcionando exactamente igual.

A veces la conmutación ofrece:

- continuidad parcial
- capacidad reducida
- soporte solo para algunos casos
- una versión degradada del servicio

Y eso puede seguir siendo muy valioso.

## Estrategias de conmutación posibles

Hay muchas formas de pensar esta decisión.

## 1. Conmutación manual

Una persona o equipo decide cambiar de proveedor.

Ejemplo:

- operaciones detecta que A está fallando
- se activa B mediante configuración o flag

### Ventajas

- más control
- menos riesgo de oscilaciones automáticas mal diseñadas

### Desventajas

- reacción más lenta
- depende de monitoreo humano

## 2. Conmutación automática por error

El sistema cambia de proveedor cuando detecta cierto patrón de fallo.

Por ejemplo:

- demasiados errores consecutivos
- timeout repetido
- disponibilidad por debajo de un umbral

### Ventajas

- reacción más rápida

### Desventajas

- más complejidad
- riesgo de decisiones incorrectas
- posibilidad de oscilación o comportamientos difíciles de depurar

## 3. Conmutación parcial

No todo cambia.
Solo ciertas operaciones, clientes o flujos.

Por ejemplo:

- emails críticos van a B si A falla
- emails no críticos quedan pendientes
- cierto tipo de pago usa una alternativa
- cierta región usa otro proveedor

## 4. Estrategia activa/pasiva

- A es el principal
- B espera como respaldo
- solo se usa si A falla

## 5. Estrategia activa/activa

- ambos proveedores pueden usarse normalmente según reglas definidas

Esto ya suele ser más complejo.

## Decidir qué se puede conmutar

No todas las operaciones dentro de una integración tienen la misma facilidad para cambiar de proveedor.

Por ejemplo:

- mandar un email puede ser relativamente conmutable
- un pago iniciado con un proveedor quizá no pueda continuar limpio en otro
- una orden logística ya registrada puede quedar ligada a cierto sistema
- una firma digital puede depender de un proceso propio del proveedor

Entonces conviene pensar:

- ¿la conmutación aplica a nuevas operaciones?
- ¿también a operaciones ya iniciadas?
- ¿a todo el flujo o solo a una parte?
- ¿hay transición limpia o hay límites claros?

## Fuente de verdad y continuidad

Cuando conmutás entre proveedores, importa mucho no perder claridad sobre:

- cuál fue usado finalmente
- qué referencia externa quedó asociada
- qué estado depende de qué sistema
- qué proveedor es fuente de verdad para cada operación concreta

Por ejemplo, si una orden terminó usando proveedor B, el sistema debería dejar eso claro.
Si no, soporte e investigación se vuelven mucho más confusos.

## Riesgo de duplicación

Este tema conecta mucho con idempotencia.

Si el proveedor A falla de forma ambigua, pueden aparecer preguntas como:

- ¿falló realmente o procesó igual?
- ¿si mando también a B estoy duplicando la operación?
- ¿puedo terminar cobrando dos veces?
- ¿puedo disparar dos envíos?
- ¿puedo notificar por ambos proveedores?

Entonces la conmutación no debería activarse a ciegas en operaciones sensibles.
Hay que distinguir bien entre:

- fallo seguro
- fallo ambiguo
- timeout con resultado incierto
- rechazo explícito

## Ejemplo con pagos

Supongamos:

- enviás una captura de pago a A
- se corta la conexión
- no sabés si A la ejecutó o no

¿Conviene mandar inmediatamente la misma operación a B?

En muchos casos, no.
Porque podrías duplicar un efecto muy sensible.

Esto muestra que la conmutación requiere criterio de negocio, no solo lógica técnica.

## Ejemplo con emails

En cambio, si intentás enviar un email crítico y A falla con error técnico claro antes de procesarlo, quizá sí tenga bastante sentido pasar a B.

No todas las integraciones tienen el mismo riesgo de duplicación.

## Estrategias de decisión

Al pensar conmutación, algunas preguntas útiles son:

- ¿qué tipo de error habilita cambiar de proveedor?
- ¿qué tipo de error no lo habilita?
- ¿el cambio vale para una operación puntual o para todo el sistema?
- ¿quién decide volver al proveedor principal?
- ¿cómo se evita oscilar entre A y B?
- ¿qué se registra?
- ¿qué ve soporte?
- ¿qué ve el usuario?

## Oscilación y cambio constante

Otro problema común es cambiar demasiado rápido entre proveedores.

Por ejemplo:

- A falla una vez, se pasa a B
- B falla una vez, se vuelve a A
- el sistema entra en comportamiento errático

Por eso la conmutación no debería ser impulsiva.
Suele necesitar umbrales, criterios y observabilidad.

## Relación con feature flags y configuración dinámica

Este tema conecta mucho con control operativo.

A veces conviene poder definir cosas como:

- proveedor preferido actual
- proveedor de respaldo habilitado o no
- tipos de operaciones que pueden conmutar
- umbrales de error
- activación manual de contingencia

Eso permite responder más rápido sin redeployar.

## Relación con observabilidad

La conmutación necesita visibilidad.

Conviene poder ver:

- cuántas operaciones fueron por A y cuántas por B
- por qué se activó B
- qué error disparó el cambio
- cuánto duró la contingencia
- si el secundario se está comportando mejor
- si hubo operaciones ambiguas
- si aumentaron errores de negocio

Sin observabilidad, el sistema puede cambiar de proveedor sin que nadie entienda bien por qué.

## Relación con degradación controlada

A veces el proveedor secundario no ofrece un reemplazo perfecto.
Igual puede ser parte de una degradación controlada útil.

Por ejemplo:

- el proveedor B permite enviar solo emails de texto
- B soporta menos tipos de envío
- B no da misma precisión de cotización
- B sirve solo para operaciones nuevas, no para continuar las ya empezadas

Eso sigue siendo mejor que caída total en muchos casos.

## Qué errores comunes aparecen

Algunos muy frecuentes son:

- asumir equivalencia total entre proveedores muy distintos
- conmutar sin entender el riesgo de duplicación
- no registrar qué proveedor quedó asociado a cada operación
- no definir quién vuelve al principal y cuándo
- activar conmutación demasiado fácilmente
- no contemplar costos y diferencias funcionales
- no probar nunca el camino secundario hasta que un día hace falta de verdad

## Buenas prácticas iniciales

## 1. Evaluar si la integración realmente justifica un proveedor secundario

No usar este patrón por moda.

## 2. Distinguir operaciones conmutables de operaciones peligrosas de duplicar

Especialmente en pagos y acciones sensibles.

## 3. Registrar siempre qué proveedor se usó y por qué

Eso ayuda mucho en soporte y auditoría.

## 4. Definir criterios claros de activación y vuelta

La conmutación necesita reglas.

## 5. Usar configuración dinámica o flags donde tenga sentido

Ayuda a responder más rápido.

## 6. Medir comportamiento de ambos proveedores

La decisión no debería ser ciega.

## 7. Recordar que el secundario puede ser una degradación útil, no un clon perfecto

Eso baja expectativas irreales y mejora diseño.

## Errores comunes

### 1. Pensar que dos proveedores “similares” son intercambiables sin costo

Suele no ser tan simple.

### 2. Conmutar operaciones ambiguas sin analizar duplicación

Muy riesgoso.

### 3. No tener trazabilidad del proveedor usado

Después investigar incidentes se complica mucho.

### 4. No ejercitar el camino secundario

Entonces el día que se necesita, quizá no funciona como se esperaba.

### 5. Cambiar de proveedor demasiado rápido y sin criterio

Eso puede volver errático al sistema.

### 6. Creer que proveedor secundario reemplaza todas las demás estrategias de resiliencia

No.
Sigue haciendo falta timeouts, fallbacks, retries y observabilidad.

## Mini ejercicio mental

Pensá estas situaciones y respondé:

1. ¿qué integración de tu sistema justificaría un proveedor secundario?
2. ¿qué operación sería demasiado riesgosa para conmutar automáticamente por posible duplicación?
3. ¿qué datos guardarías para saber qué proveedor usó cada operación?
4. ¿qué funcionalidad podría seguir de forma degradada con un proveedor alternativo parcial?
5. ¿qué señales te harían decidir que conviene pasar del principal al secundario?

## Resumen

En esta lección viste que:

- un proveedor principal es la opción normal de operación y un proveedor secundario actúa como respaldo o alternativa
- conmutar significa cambiar de proveedor según reglas o condiciones definidas
- este patrón puede mejorar resiliencia en integraciones críticas, pero agrega complejidad y no siempre vale la pena
- los proveedores no siempre son equivalentes, así que muchas veces la conmutación ofrece continuidad parcial o degradada
- el riesgo de duplicación obliga a tener mucho criterio, sobre todo en operaciones sensibles
- observabilidad, trazabilidad, configuración dinámica y reglas claras de activación son piezas fundamentales de esta estrategia

## Siguiente tema

Ahora que ya entendés cómo pensar proveedor principal, proveedor secundario y estrategias de conmutación para sostener continuidad operativa en integraciones críticas, el siguiente paso natural es aprender sobre **operaciones ambiguas, confirmación incierta y resolución de estados dudosos**, porque muchos de los problemas más difíciles aparecen justamente cuando no sabés si una acción externa falló, quedó pendiente o se ejecutó igual.
