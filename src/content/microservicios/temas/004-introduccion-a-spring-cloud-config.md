---
title: "Introducción a Spring Cloud Config"
description: "Fundamentos de la configuración centralizada, problemas que resuelve Spring Cloud Config y por qué empieza a ser necesaria cuando una arquitectura de microservicios crece." 
order: 4
module: "Módulo 2 · Configuración centralizada"
level: "base"
draft: false
---

# Introducción a Spring Cloud Config

En una aplicación pequeña, suele ser perfectamente razonable tener la configuración dentro del mismo proyecto.

Por ejemplo, es común definir propiedades en archivos como:

- `application.properties`
- `application.yml`

Mientras hay una sola aplicación y pocos ambientes, ese enfoque puede resultar suficiente.

Pero cuando el sistema empieza a dividirse en varios servicios, la situación cambia.

En esta clase vamos a ver por qué la configuración empieza a convertirse en un problema de arquitectura y cómo **Spring Cloud Config** aparece como una solución para centralizarla.

Dentro de nuestro proyecto **NovaMarket**, esta necesidad va a surgir de forma muy natural, porque ya no pensamos en una única aplicación, sino en varios servicios que deben convivir de manera coherente.

---

## El problema de la configuración en sistemas distribuidos

Imaginemos por un momento que NovaMarket ya tiene estos servicios:

- `catalog-service`
- `inventory-service`
- `order-service`

Ahora supongamos que cada uno tiene:

- un puerto propio,
- un nombre de aplicación,
- propiedades de conexión,
- configuración de logs,
- perfiles de entorno,
- y más adelante integración con discovery, gateway o seguridad.

Si toda esa configuración queda copiada dentro de cada proyecto, empiezan a aparecer problemas bastante predecibles.

---

## Problema 1: repetición de configuración

Cuando varios servicios necesitan propiedades parecidas, lo más probable es que empieces a copiar y pegar bloques de configuración.

Por ejemplo:

- configuración de logs,
- time zone,
- perfiles,
- endpoints compartidos,
- políticas de observabilidad,
- valores comunes entre servicios.

Copiar configuración no parece grave al principio, pero con el tiempo vuelve mucho más difícil mantener consistencia.

---

## Problema 2: diferencias accidentales entre ambientes

Una de las situaciones más comunes en desarrollo es que exista una configuración para:

- desarrollo,
- testing,
- staging,
- producción.

Cuando cada servicio administra esos cambios por separado, aumentan las chances de que aparezcan diferencias no deseadas.

Por ejemplo:

- un servicio usa un perfil distinto al esperado,
- otro quedó apuntando a una URL vieja,
- otro tiene un valor diferente porque alguien olvidó actualizarlo,
- y otro directamente no refleja el mismo criterio operativo que el resto.

En una arquitectura distribuida, este tipo de incoherencias crece muy rápido.

---

## Problema 3: cambios difíciles de rastrear

Si la configuración está dispersa en varios repositorios o en muchos archivos aislados, responder preguntas simples se vuelve más complicado.

Por ejemplo:

- ¿qué puerto usa cada servicio en cierto ambiente?
- ¿qué nombre lógico tiene cada aplicación?
- ¿qué configuración comparte todo el sistema?
- ¿cuándo cambió determinada propiedad?
- ¿qué diferencia hay entre dev y prod?

Cuando la configuración está centralizada y versionada de forma consistente, este tipo de preguntas se responde mucho mejor.

---

## Problema 4: crecimiento desordenado del sistema

Cuantos más servicios tiene una arquitectura, más propiedades empiezan a aparecer.

No solo se trata de puertos o nombres. También pueden aparecer:

- configuraciones de datasource,
- límites técnicos,
- timeouts,
- políticas de logs,
- integración con discovery,
- rutas del gateway,
- observabilidad,
- credenciales o referencias externas.

Sin una estrategia clara, la configuración termina siendo un conjunto disperso de archivos locales difíciles de gobernar.

---

## Qué significa centralizar configuración

Centralizar configuración no significa meter todo en un archivo gigante y desordenado.

Significa tener una estrategia para que los servicios obtengan sus propiedades desde una fuente común, organizada y coherente.

Esa estrategia suele buscar al menos estas cosas:

- separar configuración del código,
- diferenciar entornos,
- compartir propiedades comunes,
- mantener propiedades específicas por servicio,
- y facilitar cambios controlados.

Acá es donde entra **Spring Cloud Config**.

---

## Qué es Spring Cloud Config

Spring Cloud Config es un componente del ecosistema Spring Cloud pensado para centralizar configuración externa.

La idea base es simple:

- existe un **Config Server**,
- los microservicios actúan como **Config Clients**,
- y la configuración puede vivir en una fuente externa, muy comúnmente un repositorio Git.

En vez de depender solo de archivos locales embebidos en cada proyecto, los servicios pueden resolver sus propiedades desde ese servidor central de configuración.

---

## Qué gana una arquitectura con esta estrategia

Cuando la configuración empieza a salir del interior de cada servicio y pasa a administrarse de forma centralizada, aparecen varias ventajas importantes.

### 1. Mayor coherencia
Es más fácil mantener criterios comunes entre servicios.

### 2. Menos duplicación
Las propiedades compartidas pueden definirse una sola vez.

### 3. Mejor separación entre código y entorno
El comportamiento del sistema deja de estar tan atado al proyecto compilado.

### 4. Mejor trazabilidad
Si la configuración vive en una fuente versionada, como Git, se vuelve más fácil rastrear cambios.

### 5. Escalabilidad operativa
Cuando el sistema crece, el costo de administrar configuración empieza a ser mucho más controlable.

---

## Qué no hace Spring Cloud Config por sí solo

Es importante no idealizar la herramienta.

Spring Cloud Config **no elimina** todos los problemas de configuración.

Por ejemplo, todavía hay que decidir:

- cómo organizar archivos,
- qué propiedades compartir,
- qué propiedades dejar por servicio,
- cómo separar ambientes,
- cómo manejar información sensible,
- cuándo conviene refrescar configuración y cuándo no.

La herramienta ayuda, pero sigue haciendo falta criterio arquitectónico.

---

## Cómo encaja esto en NovaMarket

En NovaMarket, la necesidad de configuración centralizada aparece apenas el sistema deja de ser un conjunto de proyectos aislados.

Por ejemplo, vamos a necesitar administrar cosas como:

- nombre de cada servicio,
- puertos,
- perfiles,
- parámetros compartidos,
- configuración de infraestructura,
- propiedades específicas de cada microservicio.

Si todo eso queda repartido dentro de cada proyecto, se vuelve más difícil mantener la arquitectura alineada.

Con Spring Cloud Config, podemos empezar a pensar el sistema como un conjunto de servicios que **leen su configuración desde una fuente común**.

---

## Configuración local vs configuración externa

Conviene distinguir estas dos ideas.

### Configuración local
Es la que vive dentro del proyecto, generalmente en archivos del propio servicio.

Ventajas:

- simple,
- directa,
- útil para arrancar,
- cómoda en proyectos pequeños.

Desventajas:

- se dispersa rápido,
- se duplica,
- cuesta más alinear ambientes,
- complica la evolución cuando aparecen muchos servicios.

### Configuración externa
Es la que el servicio obtiene desde una fuente externa al propio artefacto desplegable.

Ventajas:

- separación entre código y configuración,
- mejor organización por entorno,
- más facilidad para compartir valores,
- mejor trazabilidad.

Desventajas:

- agrega infraestructura,
- requiere diseño,
- introduce un nuevo componente en la arquitectura.

La decisión de usar configuración externa no tiene costo cero, pero en microservicios suele ser un paso muy razonable.

---

## Una primera imagen mental del funcionamiento

La idea general del mecanismo es esta:

1. levantamos un `config-server`,
2. el servidor obtiene propiedades desde una fuente externa,
3. cada microservicio consulta al `config-server`,
4. el servicio arranca usando esa configuración.

Conceptualmente, en lugar de decir:

“cada aplicación trae todo configurado dentro de sí misma”

pasamos a decir:

“cada aplicación sabe dónde buscar su configuración y la obtiene desde una fuente central”.

Esa diferencia, aunque parezca pequeña, cambia mucho la forma de organizar un sistema distribuido.

---

## Por qué este tema aparece tan temprano en el curso

Porque es una de las primeras necesidades reales que surge al construir una arquitectura con varios servicios.

Antes incluso de trabajar discovery, gateway o seguridad, ya aparece una pregunta muy básica:

**¿cómo vamos a mantener organizada la configuración de todos estos componentes?**

Si no resolvemos eso de manera razonable, la base del sistema empieza a crecer de forma desordenada.

Por eso la configuración centralizada aparece tan pronto en el roadmap.

---

## Qué tipos de configuración suelen interesarnos

A lo largo del curso, la configuración va a incluir cosas muy distintas.

### Configuración técnica
Por ejemplo:

- puertos,
- logs,
- nombres de aplicación,
- perfiles.

### Configuración de infraestructura
Por ejemplo:

- ubicaciones de servicios,
- integración con discovery,
- configuración de gateway,
- parámetros de observabilidad.

### Configuración funcional o de negocio
A veces también aparecen valores funcionales controlables por entorno.

No toda configuración tiene el mismo peso ni la misma sensibilidad, y esa diferencia también importa cuando se diseña una estrategia centralizada.

---

## Qué papel cumple Git en este enfoque

Aunque todavía no vamos a implementarlo en detalle en esta clase, conviene adelantar una idea importante.

Una forma muy común de trabajar con Spring Cloud Config es usar un **repositorio Git** como fuente de configuración.

Eso permite:

- versionar cambios,
- auditar modificaciones,
- organizar archivos por servicio y entorno,
- trabajar mejor la diferencia entre dev, test y prod.

Más adelante vamos a usar precisamente ese enfoque en NovaMarket.

---

## Qué cambia en la forma de pensar el sistema

Cuando una arquitectura adopta configuración centralizada, deja de mirar cada servicio como una isla completamente aislada.

Empieza a existir una capa de gobierno común para ciertas propiedades.

Eso no significa que todos los servicios pierdan autonomía.

Significa que la autonomía se ejerce dentro de un marco de configuración más ordenado.

Esa idea es especialmente importante en microservicios: autonomía no es anarquía.

---

## Una advertencia importante

Centralizar configuración no significa centralizar todas las decisiones del sistema en un solo lugar sin criterio.

Hay una diferencia entre:

- compartir lo que realmente conviene compartir,
- y forzar configuraciones idénticas donde no corresponde.

Cada servicio sigue teniendo necesidades específicas.

La configuración centralizada sirve para administrar mejor la diversidad del sistema, no para borrar sus diferencias legítimas.

---

## Qué vamos a hacer después de esta clase

En esta clase entendimos el problema y el porqué de la herramienta.

En la próxima vamos a pasar de lo conceptual a lo concreto.

Vamos a ver cómo empezar a construir el `config-server` de NovaMarket y cómo hacer que los microservicios puedan consumir configuración desde él.

Es decir, vamos a empezar a transformar la idea de configuración centralizada en una pieza real dentro del proyecto.

---

## Cierre

Spring Cloud Config aparece cuando la configuración deja de ser un detalle local de una aplicación y pasa a convertirse en una preocupación arquitectónica.

En una arquitectura de microservicios, repetir propiedades, dispersar criterios por servicio y mantener ambientes por separado sin una estrategia común vuelve cada vez más difícil sostener el sistema.

Por eso la configuración centralizada no es un lujo ni un adorno. Es una forma de ordenar la base operativa sobre la que va a crecer toda la arquitectura.

En NovaMarket, este paso nos va a permitir empezar a construir un ecosistema más coherente, preparado para seguir evolucionando hacia discovery, gateway, seguridad, resiliencia y observabilidad.
