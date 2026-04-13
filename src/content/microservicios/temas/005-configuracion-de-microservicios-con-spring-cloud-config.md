---
title: "Configuración de microservicios con Spring Cloud Config"
description: "Construcción inicial del Config Server de NovaMarket, conexión de los microservicios como clientes de configuración y primeros criterios para externalizar propiedades de forma ordenada." 
order: 5
module: "Módulo 2 · Configuración centralizada"
level: "base"
draft: false
---

# Configuración de microservicios con Spring Cloud Config

En la clase anterior vimos por qué la configuración centralizada empieza a ser necesaria cuando una arquitectura de microservicios deja de ser pequeña y simple.

Ahora vamos a dar el siguiente paso: convertir esa idea en una pieza concreta del proyecto.

En esta clase vamos a introducir el **Config Server** de NovaMarket y a ver cómo los microservicios pueden empezar a consumir configuración desde una fuente central en lugar de depender únicamente de archivos locales.

El objetivo no es todavía construir una solución definitiva para todos los escenarios posibles, sino establecer una **base limpia y coherente** sobre la que después podamos seguir creciendo.

---

## El punto de partida

Supongamos que ya tenemos o vamos a tener estos servicios dentro de NovaMarket:

- `catalog-service`
- `inventory-service`
- `order-service`

Si cada uno arranca con su propia configuración interna, pronto aparecen propiedades como estas:

- `spring.application.name`
- `server.port`
- perfiles de entorno
- configuración de logs
- parámetros técnicos del servicio

Todavía no parece mucho, pero a medida que la arquitectura crezca también van a aparecer configuraciones vinculadas con:

- discovery,
- gateway,
- seguridad,
- mensajería,
- observabilidad,
- persistencia,
- resiliencia.

Por eso conviene empezar temprano a separar la configuración del código del servicio.

---

## Qué vamos a construir en esta clase

A nivel conceptual, vamos a agregar un nuevo componente a la arquitectura:

- `config-server`

Ese componente será el encargado de servir configuración a los demás servicios.

Luego, nuestros microservicios pasarán a comportarse como clientes de configuración, es decir, como aplicaciones que conocen la ubicación del Config Server y pueden obtener desde allí sus propiedades.

---

## Cómo encaja el Config Server en NovaMarket

A partir de este punto, la arquitectura empieza a verse así:

- `config-server` concentra configuración externa,
- `catalog-service`, `inventory-service` y `order-service` leen su configuración desde allí,
- y más adelante otros componentes, como gateway o discovery, también podrán apoyarse en esa misma estrategia.

Todavía no estamos resolviendo todos los problemas de la arquitectura, pero sí estamos ordenando una capa fundamental sobre la que después se apoyará gran parte del sistema.

---

## Qué hace exactamente el Config Server

El Config Server cumple un rol bastante claro:

- expone configuración a través de endpoints,
- resuelve propiedades según el nombre de la aplicación,
- puede diferenciar perfiles,
- y puede obtener esas propiedades desde una fuente externa, muy comúnmente Git.

Eso significa que, en vez de pensar la configuración como un archivo privado dentro de cada servicio, empezamos a pensarla como un recurso central administrado desde una fuente común.

---

## Primer criterio importante: nombre lógico del servicio

Para que esta estrategia funcione bien, cada microservicio necesita una identidad clara.

Un punto clave es:

```properties
spring.application.name=...
```

Ese nombre lógico no es un detalle menor.

Más adelante va a ser importante para varias cosas:

- para identificar al servicio en configuración,
- para discovery,
- para trazas y observabilidad,
- y para entender el sistema con más claridad.

Por ejemplo, en NovaMarket conviene usar nombres consistentes como:

- `catalog-service`
- `inventory-service`
- `order-service`
- `config-server`
- `api-gateway`
- `discovery-server`

La consistencia de nombres parece un detalle pequeño, pero ayuda muchísimo cuando el sistema crece.

---

## Primeras propiedades que tiene sentido externalizar

No todo tiene que salir del proyecto de inmediato, pero sí conviene empezar por algunas propiedades muy representativas.

### Nombre de aplicación
Permite identificar el servicio de forma consistente.

### Puerto
Es una propiedad típica que cambia por entorno o por necesidad operativa.

### Perfiles
Ayudan a separar comportamientos de desarrollo, testing o producción.

### Configuración común
Ciertas propiedades compartidas pueden terminar viviendo en una configuración común del sistema.

En otras palabras, el objetivo no es externalizar por deporte, sino empezar por lo que tiene más sentido operativo.

---

## Cómo pensar la estructura de configuración

Antes incluso de entrar en detalles de implementación, conviene adoptar una forma de pensar ordenada.

La configuración suele dividirse en dos grandes grupos.

### Configuración compartida
Es la que puede aplicar a varios servicios.

Por ejemplo:

- formato o nivel base de logs,
- propiedades comunes del sistema,
- ciertos criterios de entorno.

### Configuración específica por servicio
Es la que pertenece de forma particular a cada microservicio.

Por ejemplo:

- nombre del servicio,
- puerto,
- detalles propios de su comportamiento,
- configuración técnica particular.

Pensar esta separación desde temprano ayuda a que el repositorio de configuración no se vuelva caótico.

---

## El rol del repositorio de configuración

Aunque en esta clase estamos poniendo el foco en el mecanismo general, ya conviene imaginar una fuente concreta para almacenar la configuración.

La opción más natural dentro de este enfoque es un repositorio de configuración separado.

Por ejemplo, NovaMarket puede terminar trabajando con algo conceptualmente parecido a esto:

```txt
novamarket-config/
  application.yml
  catalog-service.yml
  inventory-service.yml
  order-service.yml
```

La idea general sería:

- `application.yml` para propiedades compartidas,
- un archivo por servicio para propiedades específicas.

Más adelante se podrán sumar perfiles, repositorio privado y organización por ambiente, pero esta estructura ya da una base mental muy útil.

---

## Qué cambia para un microservicio cliente

Cuando un microservicio pasa a trabajar con configuración centralizada, deja de depender exclusivamente de su configuración local embebida.

Ahora necesita al menos estas dos cosas conceptuales:

1. saber **quién es**,
2. saber **dónde buscar su configuración**.

Eso quiere decir que el servicio necesita poder identificarse ante el Config Server y resolver sus propiedades externas antes de operar normalmente.

Esta idea es clave porque cambia el orden mental del arranque del servicio.

Antes pensábamos:

“la app arranca con lo que ya trae adentro”.

Ahora empezamos a pensar:

“la app arranca sabiendo dónde consultar su configuración y qué identidad usar para obtenerla”.

---

## Un ejemplo conceptual con NovaMarket

Pensemos en `order-service`.

Si el sistema usa Spring Cloud Config, el proceso conceptual de arranque pasa a verse así:

1. `order-service` conoce su nombre lógico,
2. conoce la dirección del Config Server,
3. consulta configuración externa,
4. resuelve propiedades,
5. termina de arrancar con esos valores.

Ese patrón luego se repite en `catalog-service`, `inventory-service` y en otros servicios que incorporemos.

Lo importante es que todos empiezan a compartir una estrategia común para resolver configuración.

---

## Qué ganamos con esto dentro del curso

Desde el punto de vista didáctico, incorporar Config Server en esta etapa tiene muchísimo valor.

### 1. Empezamos a construir infraestructura real
El curso deja de ser solo “servicios sueltos” y empieza a parecerse a una arquitectura distribuida seria.

### 2. Preparamos el terreno para lo que sigue
Discovery, gateway y otras piezas van a apoyarse sobre un sistema mejor organizado.

### 3. Evitamos que la base del proyecto crezca desordenada
En lugar de multiplicar archivos locales, adoptamos una estrategia común desde temprano.

### 4. Introducimos una separación sana entre código y entorno
Eso es muy importante en sistemas que evolucionan y se despliegan en contextos distintos.

---

## Qué todavía no estamos resolviendo del todo

En esta etapa conviene ser realistas.

Aunque ya introducimos Spring Cloud Config, todavía quedan decisiones importantes para más adelante.

Por ejemplo:

- cómo organizar perfiles de entorno,
- cómo manejar repositorios privados,
- cómo separar propiedades sensibles,
- qué políticas de refresh usar,
- cómo estructurar mejor configuraciones compartidas y específicas.

Eso está bien.

No necesitamos resolver todo ahora. Lo importante es construir una base clara y progresiva.

---

## Criterios prácticos para no complicarse de más al principio

Cuando se introduce configuración centralizada por primera vez, hay una tentación común: querer mover absolutamente todo afuera de los servicios desde el día uno.

Didácticamente no conviene.

Es mejor seguir estos criterios:

### Mover primero lo más representativo
Por ejemplo:

- nombre del servicio,
- puerto,
- propiedades técnicas básicas.

### Mantener visible la relación entre servicio y configuración
El alumno tiene que poder entender fácilmente qué archivo configura qué componente.

### No mezclar demasiadas preocupaciones en la misma clase
Todavía no es momento de meter secretos, refresh complejo y múltiples estrategias avanzadas a la vez.

### Sostener la coherencia de nombres
Si la arquitectura usa nombres limpios y consistentes, todo lo demás resulta más fácil de entender.

---

## Una forma razonable de imaginar la implementación inicial

Sin entrar todavía en un laboratorio completo paso a paso, la imagen más útil sería esta:

### `config-server`
- proyecto Spring Boot dedicado,
- responsabilidad única,
- expone configuración.

### `catalog-service`
- se identifica como `catalog-service`,
- consulta configuración al iniciar.

### `inventory-service`
- se identifica como `inventory-service`,
- consulta configuración al iniciar.

### `order-service`
- se identifica como `order-service`,
- consulta configuración al iniciar.

Con esta base, NovaMarket empieza a tener una capa común sobre la que organizar el resto del sistema.

---

## Qué error conviene evitar

Hay un error bastante común cuando se enseña este tema: convertir la clase en una receta mecánica de propiedades y dependencias, sin explicar el sentido arquitectónico.

Eso hace que el alumno entienda “qué hay que escribir”, pero no “por qué existe este componente”.

En este curso queremos lo contrario.

Queremos que quede claro que el Config Server aparece porque la arquitectura lo empieza a necesitar, no porque sea obligatorio usarlo por moda.

---

## Relación con las próximas clases

Este paso prepara directamente el terreno para dos temas muy importantes que vienen después.

### Repositorio Git para configuración
Una vez que tenemos el Config Server, necesitamos una fuente organizada para almacenar la configuración.

### Repositorio privado y gestión de entornos
Cuando la configuración ya no vive dentro del servicio, aparece la necesidad de administrarla con criterios de acceso, perfiles y ambientes.

Es decir, esta clase no solo agrega una pieza nueva a la arquitectura, sino que abre una línea completa de evolución operativa del sistema.

---

## Qué debería quedar claro al terminar esta clase

Al finalizar esta clase, la idea principal debería ser esta:

**NovaMarket ya no piensa la configuración como algo que pertenece únicamente al interior de cada microservicio, sino como una capacidad de infraestructura compartida, servida por un Config Server y consumida por los servicios según su identidad.**

Esa forma de pensar es más importante que cualquier detalle puntual de sintaxis.

---

## Cierre

Incorporar Spring Cloud Config al proyecto significa dar uno de los primeros pasos hacia una arquitectura de microservicios más madura.

A partir de ahora, los servicios empiezan a depender menos de archivos locales aislados y más de una estrategia común para resolver su configuración.

En NovaMarket, esto nos permite ordenar la base del sistema y prepararnos para lo que viene después: discovery, gateway, seguridad y el resto de la infraestructura distribuida.

En la próxima clase vamos a profundizar en cómo usar un **repositorio Git como backend del Config Server** y cómo empezar a organizar la configuración del sistema de una manera más profesional.
