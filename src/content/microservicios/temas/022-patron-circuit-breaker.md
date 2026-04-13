---
title: "Patrón Circuit Breaker"
description: "Explicación del patrón Circuit Breaker, sus estados y su aplicación práctica en NovaMarket para evitar cascadas de error cuando inventory-service se vuelve lento, inestable o deja de responder."
order: 22
module: "Módulo 6 · Resiliencia y tolerancia a fallas"
level: "base"
draft: false
---

# Patrón Circuit Breaker

En la clase anterior vimos una idea central de la arquitectura distribuida:

**las dependencias remotas fallan**.

No solo pueden caerse. También pueden responder lento, saturarse, fallar de forma intermitente o degradarse lo suficiente como para arrastrar a otros servicios.

En **NovaMarket**, eso se vuelve especialmente visible cuando `order-service` necesita consultar a `inventory-service` para validar stock antes de crear una orden.

Si esa dependencia se comporta mal y el sistema insiste en llamarla una y otra vez sin estrategia, el resultado puede ser una degradación general.

Ahí aparece uno de los patrones más importantes de resiliencia:

**Circuit Breaker**.

---

## La idea intuitiva detrás del patrón

El nombre viene del mundo eléctrico.

Un circuito eléctrico tiene un interruptor de protección que “salta” cuando detecta una condición peligrosa.  
Su objetivo no es que nada falle, sino **evitar que una falla puntual provoque un daño mayor**.

En software, el principio es parecido.

Un Circuit Breaker observa el comportamiento de una dependencia remota y, si detecta demasiadas fallas o tiempos de respuesta problemáticos, **deja de intentar llamadas durante un período**.

En lugar de seguir golpeando una dependencia que está fallando, el sistema:

- corta temporalmente las invocaciones,
- falla más rápido,
- protege sus recursos,
- y evita que la degradación se propague.

---

## Qué problema resuelve exactamente

Sin Circuit Breaker, el comportamiento suele ser este:

1. una dependencia empieza a responder mal,
2. el servicio llamador sigue enviando requests,
3. cada request tarda más,
4. se acumulan threads y conexiones,
5. sube la latencia general,
6. aparecen timeouts en cadena,
7. el sistema completo empieza a resentirse.

El Circuit Breaker ataca el problema en un punto muy concreto:

**deja de tratar una dependencia rota como si todavía estuviera sana**.

Eso reduce el daño que provoca insistir sobre un servicio que claramente está en problemas.

---

## Ejemplo en NovaMarket

Imaginemos el flujo de creación de una orden:

1. el usuario llama a `POST /api/orders`,
2. el gateway redirige la request a `order-service`,
3. `order-service` invoca a `inventory-service`,
4. `inventory-service` empieza a responder con errores o latencias muy altas.

Si no hay Circuit Breaker, cada nueva orden sigue intentando la llamada remota.  
Eso produce más espera, más hilos ocupados y más presión sobre una dependencia ya dañada.

Si sí hay Circuit Breaker, después de detectar cierto patrón de fallas:

- el sistema deja de llamar por un rato a `inventory-service`,
- responde rápido con un error o estrategia controlada,
- y se protege de una degradación mayor.

---

## Qué no es un Circuit Breaker

Es importante no confundirlo con otras ideas.

### No es un retry
Un retry intenta de nuevo.  
Un Circuit Breaker decide **no seguir intentando temporalmente** cuando la evidencia muestra que la dependencia está en mal estado.

### No es un timeout
Un timeout corta una llamada individual que tardó demasiado.  
El Circuit Breaker observa un conjunto de llamadas y toma una decisión global sobre esa dependencia.

### No es una solución mágica
No “arregla” el servicio remoto.  
Lo que hace es limitar el daño que esa falla causa sobre el sistema llamador.

---

## Estados del Circuit Breaker

El patrón suele modelarse con tres estados principales.

---

## Estado CLOSED

Este es el estado normal.

En **CLOSED**, las llamadas se permiten normalmente y el Circuit Breaker observa sus resultados.

Eso significa que el servicio llamador sigue invocando a la dependencia remota, pero registra cosas como:

- cantidad de errores,
- porcentaje de fallas,
- tiempo de respuesta,
- timeouts,
- excepciones relevantes.

Mientras los indicadores estén dentro de umbrales aceptables, el circuito permanece cerrado.

### En NovaMarket
Mientras `inventory-service` responda bien, `order-service` puede seguir consultando stock con normalidad.

---

## Estado OPEN

Cuando se supera cierto umbral de fallas o de comportamiento no saludable, el circuito pasa a **OPEN**.

En ese estado:

- las llamadas ya no se envían a la dependencia,
- la respuesta falla inmediatamente,
- se evita seguir castigando al servicio remoto,
- y se liberan recursos del servicio llamador.

Esta es la parte más valiosa del patrón desde el punto de vista operativo:

**fallar rápido es mucho mejor que esperar inútilmente a una dependencia claramente degradada**.

### En NovaMarket
Si `inventory-service` acumula suficientes errores o timeouts, `order-service` deja temporalmente de llamarlo y devuelve una respuesta controlada al intentar crear nuevas órdenes.

---

## Estado HALF_OPEN

Después de un tiempo, el Circuit Breaker no puede quedarse abierto para siempre.  
Necesita comprobar si la dependencia ya se recuperó.

Para eso pasa a **HALF_OPEN**.

En este estado:

- se permiten algunas llamadas de prueba,
- si esas llamadas salen bien, el circuito vuelve a **CLOSED**,
- si vuelven a fallar, regresa a **OPEN**.

Es una especie de fase de verificación controlada.

### En NovaMarket
Después del tiempo de espera definido, `order-service` puede volver a permitir unas pocas consultas a `inventory-service` para verificar si ya está estable.

---

## Cómo decide abrirse

La implementación concreta depende de la librería, pero conceptualmente el Circuit Breaker suele abrirse cuando detecta algo como:

- demasiados errores en una ventana reciente,
- un porcentaje alto de fallas,
- demasiadas llamadas lentas,
- una combinación de latencia y error por encima de los umbrales definidos.

Lo importante es entender que la decisión no se toma por una sola falla aislada, sino por un patrón que indica que la dependencia está en mal estado.

---

## Por qué abrir el circuito puede ser una buena noticia

A primera vista puede parecer raro:

“¿Cómo que una mejora consiste en dejar de intentar llamadas?”

Pero justamente ahí está la lógica del patrón.

Si una dependencia está mal, seguir insistiéndole puede empeorar todo:

- consume más recursos locales,
- aumenta el tiempo de respuesta,
- incrementa la saturación,
- complica el diagnóstico,
- y puede transformar una falla puntual en una caída más amplia.

Abrir el circuito es una decisión defensiva.  
No soluciona la causa original, pero protege el resto del sistema.

---

## Estrategias posibles cuando el circuito está abierto

Cuando el Circuit Breaker corta las llamadas, el sistema llamador tiene que decidir cómo responder.

No hay una única estrategia universal.  
Depende de la importancia de la operación y de la lógica del negocio.

En NovaMarket podríamos pensar en varias opciones.

### Opción 1: devolver error claro
Es la más honesta cuando la validación de stock es obligatoria.

Por ejemplo:

- “No fue posible validar disponibilidad en este momento”
- “Intente nuevamente más tarde”

### Opción 2: dejar la orden pendiente
Podría ser válida en un sistema más complejo.

Pero introduciría más estados, más compensaciones y más lógica distribuida.

### Opción 3: fallback controlado solo para fines específicos
En ciertos ejemplos de curso se puede simular una respuesta degradada para mostrar el patrón, pero no conviene enseñar como práctica general algo que oculte un chequeo crítico de stock.

Para el flujo principal de NovaMarket, la estrategia más coherente será:

**si el stock no puede validarse de manera confiable, la orden no se confirma**.

---

## Beneficios del patrón

### 1. Evita cascadas de error
Protege al servicio llamador de una dependencia inestable.

### 2. Reduce el consumo inútil de recursos
No deja threads esperando respuestas que probablemente sigan fallando.

### 3. Mejora la previsibilidad
El sistema deja de comportarse de forma errática cuando una dependencia está rota.

### 4. Facilita la recuperación
Una vez que la dependencia mejora, el estado HALF_OPEN permite probar la recuperación gradualmente.

### 5. Hace observable la degradación
El estado del circuito puede monitorearse, lo cual ayuda mucho en operación.

---

## Qué no conviene hacer con Circuit Breaker

### Usarlo como parche para mal diseño
Si los timeouts son absurdos o las dependencias están mal planteadas, el Circuit Breaker no reemplaza decisiones de arquitectura.

### Configurarlo sin entender el negocio
No todas las fallas requieren el mismo tratamiento.  
La estrategia de fallback debe ser coherente con la operación.

### Abrirlo con umbrales arbitrarios
Si se configura demasiado agresivo, puede cortar llamadas sanas.  
Si se configura demasiado permisivo, llega tarde.

### Creer que por sí solo alcanza
El patrón funciona mejor combinado con:

- timeouts,
- retry bien pensado,
- observabilidad,
- límites de concurrencia,
- y diseño funcional claro.

---

## Cómo se relaciona con otros mecanismos

El Circuit Breaker suele convivir con otras defensas:

### Timeout
Evita que una llamada individual se quede esperando demasiado.

### Retry
Puede ayudar frente a errores puntuales, pero debe usarse con mucha prudencia.

### Fallback
Define cómo responder cuando la dependencia no puede usarse.

### Métricas y Actuator
Permiten observar cuándo el circuito abre, cierra o entra en prueba.

En el curso vamos a ver estas piezas juntas para que se entienda el sistema como un todo y no como una lista desordenada de herramientas.

---

## Un ejemplo narrado del comportamiento

Supongamos que `inventory-service` empieza a responder lento.

### Fase 1
`order-service` todavía intenta llamar normalmente.  
Las primeras llamadas fallan o exceden el umbral de lentitud.

### Fase 2
El Circuit Breaker detecta que la dependencia ya no es confiable.  
Pasa a **OPEN**.

### Fase 3
Las nuevas solicitudes de creación de orden ya no intentan consultar stock en ese período.  
Fallan rápido con una respuesta controlada.

### Fase 4
Después del tiempo configurado, el circuito pasa a **HALF_OPEN** y deja pasar algunas llamadas de prueba.

### Fase 5A
Si las pruebas salen bien, vuelve a **CLOSED** y se retoma el flujo normal.

### Fase 5B
Si las pruebas vuelven a fallar, el circuito regresa a **OPEN**.

Esta secuencia es muy útil para enseñar resiliencia porque hace visible un principio clave:

**no toda falla debe tratarse como una llamada más que merece seguir intentando igual**.

---

## Qué vamos a implementar después

En la próxima clase ya no nos vamos a quedar solo con el patrón conceptual.  
Vamos a pasar a su implementación práctica con **Resilience4j**, que es una de las librerías más usadas en el ecosistema Spring para trabajar resiliencia.

La idea será aplicar el patrón sobre el flujo real de NovaMarket, especialmente en la consulta de stock desde `order-service` hacia `inventory-service`.

Ahí veremos:

- cómo configurarlo,
- cómo combinarlo con retry,
- qué respuestas devolver,
- y cómo hacerlo observable.

---

## Cierre

El patrón Circuit Breaker existe para evitar que una dependencia inestable arrastre al resto del sistema.

En lugar de seguir tratando un servicio degradado como si estuviera sano, el Circuit Breaker observa su comportamiento y decide cortar temporalmente las llamadas cuando el costo de insistir ya es mayor que el beneficio.

En NovaMarket, este patrón será clave para proteger el flujo de creación de órdenes cuando `inventory-service` falle o responda de forma anormal.

En la próxima clase vamos a llevar este concepto a código con **Resilience4j** y a empezar a integrarlo en la arquitectura del proyecto.
