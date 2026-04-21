---
title: "Ordenando el mapa final completo de NovaMarket como arquitectura de punta a punta"
description: "Primer paso práctico del módulo 16. Ordenamiento del mapa final completo de NovaMarket para leer el sistema como una arquitectura coherente de punta a punta y no solo como una secuencia de módulos."
order: 169
module: "Módulo 16 · Cierre general del proyecto"
level: "intermedio"
draft: false
---

# Ordenando el mapa final completo de NovaMarket como arquitectura de punta a punta

En la clase anterior dejamos algo bastante claro:

- NovaMarket ya pasó por todos sus grandes bloques técnicos,
- el sistema ya tiene suficiente madurez como para dejar de sumar complejidad lateral,
- y el siguiente paso lógico ya no es abrir otro módulo nuevo, sino empezar a ordenar la lectura final de toda la arquitectura.

Ahora toca el paso concreto:

**ordenar el mapa final completo de NovaMarket como arquitectura de punta a punta.**

Ese es el objetivo de esta clase.

Porque una cosa es haber construido:

- infraestructura,
- gateway,
- seguridad,
- resiliencia,
- observabilidad,
- eventos,
- Kubernetes.

Y otra bastante distinta es poder decir:

- “ahora veo cómo encaja todo en un único sistema”
- y
- “ahora puedo explicar de punta a punta qué papel cumple cada bloque en la arquitectura final”.

Ese es exactamente el primer gran valor práctico que vamos a construir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más claro el mapa final completo de NovaMarket,
- visible el papel de cada gran bloque dentro del sistema total,
- mejor entendida la arquitectura como una historia coherente y no como una lista de temas,
- y el curso mejor preparado para su checkpoint final antes del cierre definitivo.

La meta de hoy no es todavía dar la conclusión final del curso.  
La meta es mucho más concreta: **ordenar NovaMarket como arquitectura completa, de punta a punta, para que el cierre final se apoye sobre una lectura clara y bien estructurada del sistema**.

---

## Estado de partida

Partimos de un proyecto donde ya:

- existe una plataforma completa,
- cada gran bloque técnico ya fue trabajado,
- y el curso ya dejó claro que ahora conviene volver sobre el todo y no solo sobre cada parte por separado.

Eso significa que el problema ya no es “qué hace este servicio” o “qué hace esta tecnología”.

Ahora la pregunta útil es otra:

- **cómo se lee NovaMarket completo como una arquitectura coherente donde cada pieza tiene un lugar claro**

Y eso es exactamente lo que vamos a convertir en algo visible en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- ordenar el sistema por capas y responsabilidades,
- volver a ubicar cada gran bloque técnico dentro del mapa general,
- recorrer la relación entre las piezas sin entrar en detalle micro de cada una,
- y dejar visible una lectura final mucho más limpia y mucho más madura de toda la arquitectura.

---

## Por qué conviene ordenar el sistema como mapa y no solo como cronología

A esta altura del curso, un error bastante común sería mirar todo solo como una secuencia temporal:

- primero esto,
- después aquello,
- después lo otro.

Eso puede servir para aprender, pero ya no alcanza para cerrar.

Ahora conviene otra mirada:

- ver el sistema como arquitectura simultánea,
- donde varias capas conviven al mismo tiempo,
- y donde cada bloque técnico ya no es “el tema 1, 2 o 3”, sino una parte funcional del todo.

Ese cambio de mirada importa muchísimo.

---

## Paso 1 · Volver a identificar el flujo central del sistema

El primer punto del mapa sigue siendo el mismo que usamos como columna vertebral desde hace mucho:

- el flujo central alrededor de la creación de una orden

Esto importa muchísimo porque nos da el eje narrativo del sistema completo.

NovaMarket no es una colección arbitraria de servicios.  
NovaMarket gira alrededor de un flujo de negocio principal que fue organizando todo lo demás.

Ese detalle sigue siendo la mejor brújula para leer el proyecto.

---

## Paso 2 · Ubicar el borde de entrada de la arquitectura

La primera gran capa del mapa final es el borde de entrada.

Ahí vive principalmente:

- `api-gateway`

Y ese bloque ya no se lee solo como “otro microservicio”.

Ahora se entiende como:

- la puerta de entrada del sistema,
- el punto donde se ordena el tráfico,
- y el lugar desde el cual empieza el recorrido real de una operación.

Eso importa muchísimo porque el sistema ya tiene un borde claro y no una exposición desordenada de piezas.

---

## Paso 3 · Ubicar el núcleo de infraestructura técnica

Después del borde de entrada, conviene ubicar una segunda capa muy importante: el corazón técnico del sistema.

Ahí aparecen piezas como:

- `config-server`
- `discovery-server`

Estas piezas no son el dominio, pero tampoco son decorado.

Cumplen algo muy valioso:

- sostienen la organización técnica,
- permiten que el resto del sistema encuentre configuración y descubrimiento,
- y hacen que la arquitectura tenga una base más seria.

Ese bloque es central en el mapa final.

---

## Paso 4 · Ubicar los servicios de negocio

Ahora conviene volver sobre los servicios del dominio.

Por ejemplo:

- `catalog-service`
- `inventory-service`
- `order-service`
- `notification-service`

Este punto importa muchísimo porque acá aparece el corazón funcional del proyecto.

La arquitectura no existe para mostrar infraestructura por sí sola.  
Existe para sostener un dominio y un flujo de negocio real.

En el mapa final, estos servicios ya no se leen como “ejemplos técnicos”, sino como piezas que expresan responsabilidades distintas dentro del sistema.

---

## Paso 5 · Ubicar la capa de seguridad

A esta altura del mapa final, seguridad ya no es un “tema aparte”.

Ahora se ve como una capa transversal del sistema, donde aparece principalmente:

- Keycloak
- y la lógica de autenticación/autorización que protege el acceso al flujo

Eso importa muchísimo porque muestra que NovaMarket ya no es una arquitectura funcional abierta, sino una plataforma donde el acceso ya está mediado por una política real de seguridad.

Ese cambio es uno de los más importantes de todo el recorrido.

---

## Paso 6 · Ubicar la capa de resiliencia

Después de eso, conviene ubicar otra capa transversal:

- resiliencia

Acá ya no importa recordar solo nombres concretos de mecanismos.

Lo importante es leer que el sistema ya no vive sobre llamadas distribuidas ingenuas, sino sobre una arquitectura que:

- reconoce fallos,
- limita impactos,
- y empieza a degradar con más criterio.

Esa capa importa muchísimo porque cambia la madurez del sistema aunque no siempre se vea en una sola pantalla o en un solo endpoint.

---

## Paso 7 · Ubicar la capa de observabilidad

Ahora conviene ubicar otra gran capa transversal:

- observabilidad

Acá entran cosas como:

- `correlation id`
- logs correlacionados
- Zipkin
- trazas distribuidas

Este bloque importa muchísimo porque muestra que NovaMarket ya no solo “hace cosas”, sino que también puede observarlas con mucha más claridad.

En el mapa final, observabilidad ya no se lee como tema aislado, sino como una propiedad operativa del sistema completo.

---

## Paso 8 · Ubicar la capa de eventos y mensajería

A esta altura del mapa, también conviene ubicar algo que cambió muchísimo la arquitectura:

- RabbitMQ
- eventos
- consumo asíncrono
- DLQ
- retries
- idempotencia

Este bloque importa muchísimo porque muestra que NovaMarket ya no se coordina solo por request-response.

Ahora también puede:

- producir hechos del dominio,
- reaccionar de forma desacoplada,
- y sostener una primera capa real de robustez del lado asíncrono.

Eso vuelve mucho más rica la lectura final del proyecto.

---

## Paso 9 · Ubicar la capa de orquestación

Por último, conviene ubicar el bloque de Kubernetes.

Este bloque ya no se lee como una colección de manifests.

Ahora se ve como:

- la capa donde el sistema empieza a representarse en un entorno de orquestación más serio,
- con namespace, deployments, services, entrada externa, ConfigMap y Secret,
- y una lógica final de despliegue mucho más madura que la del comienzo del curso.

Ese cierre del mapa importa muchísimo.

---

## Qué estamos logrando con este orden

A simple vista, podría parecer que solo estamos “reordenando temas”.

Pero en realidad estamos haciendo algo bastante más valioso:

- transformar una secuencia larga de aprendizaje en una arquitectura final entendible,
- donde cada bloque encuentra su lugar dentro del sistema,
- y donde NovaMarket ya puede explicarse como proyecto completo.

Ese cambio importa muchísimo porque le da sentido estructural al cierre final del curso.

---

## Qué todavía no hicimos

Todavía no:

- consolidamos todavía esta lectura final con un checkpoint fuerte,
- ni cerramos todavía el curso de forma definitiva.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**ordenar el mapa final de NovaMarket para que el sistema ya pueda leerse de punta a punta como arquitectura completa.**

---

## Errores comunes en esta etapa

### 1. Seguir leyendo el curso solo como cronología
A esta altura conviene pasar a una lectura arquitectónica.

### 2. Pensar los bloques como compartimentos totalmente separados
En el sistema real conviven y se cruzan todo el tiempo.

### 3. Reducir el cierre a “resumir temas”
El valor real está en ordenar el mapa completo del proyecto.

### 4. No volver al flujo central del dominio
Ese flujo sigue siendo la mejor brújula para entender el todo.

### 5. Cerrar el curso sin esta vista global
Eso deja el proyecto mucho menos redondo.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder explicar NovaMarket mucho mejor como arquitectura de punta a punta, ubicando sus capas principales y entendiendo cómo se encadenan dentro de un único sistema coherente.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- ya podés ubicar el borde de entrada, el corazón técnico y los servicios de negocio,
- entendés qué papel transversal cumplen seguridad, resiliencia y observabilidad,
- ves cómo encajan eventos y Kubernetes en la arquitectura final,
- y sentís que NovaMarket ya puede leerse como sistema completo y no solo como una larga lista de módulos.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar esta lectura final del proyecto con un checkpoint fuerte.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta lectura final de NovaMarket como arquitectura completa antes del cierre definitivo del curso.

---

## Cierre

En esta clase ordenamos el mapa final completo de NovaMarket como arquitectura de punta a punta.

Con eso, el proyecto deja de verse como una suma larga de bloques técnicos y empieza a sostener una lectura mucho más integrada, mucho más clara y mucho más madura como sistema completo de aprendizaje.
