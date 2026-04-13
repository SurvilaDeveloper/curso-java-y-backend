---
title: "Dockerizando microservicios"
description: "Cómo pensar la containerización de microservicios Spring Boot, qué aporta un Dockerfile y cómo aplicar esta práctica al proyecto NovaMarket."
order: 43
module: "Módulo 11 · Docker y despliegue local completo"
level: "base"
draft: false
---

# Dockerizando microservicios

Una vez que una arquitectura distribuida deja de ser solo un conjunto de proyectos sueltos y empieza a parecerse a un sistema real, aparece una necesidad muy concreta:

**¿cómo ejecutamos cada servicio de una forma más portable, reproducible y cercana a un entorno real?**

En **NovaMarket**, esta pregunta se vuelve inevitable.

Tenemos varios componentes:

- `catalog-service`,
- `inventory-service`,
- `order-service`,
- `api-gateway`,
- y más adelante otras piezas de infraestructura.

Si cada servicio depende demasiado de una máquina local específica, de configuraciones manuales o de un entorno difícil de repetir, el sistema se vuelve frágil y difícil de compartir.

Ahí es donde entra Docker.

---

## Qué significa dockerizar un microservicio

Dockerizar un microservicio significa definir una forma estandarizada de empaquetarlo y ejecutarlo dentro de un contenedor.

La idea no es solo “meter la app en Docker”.

La idea real es lograr que el servicio:

- pueda arrancar de forma consistente,
- dependa menos de particularidades de la máquina local,
- tenga un proceso de ejecución más predecible,
- y pueda integrarse mejor con otros componentes del sistema.

En un curso de microservicios, esto es especialmente valioso porque la arquitectura ya no vive en una sola aplicación.

---

## Por qué este paso importa tanto

Hasta ahora, NovaMarket pudo construirse y probarse desde el punto de vista funcional y arquitectónico.

Pero cuando llega el momento de levantar varios servicios juntos, empiezan a aparecer problemas como:

- versiones distintas del entorno,
- diferencias entre máquinas,
- necesidad de instalar múltiples dependencias manualmente,
- dificultad para compartir la arquitectura con otros,
- y fricción al levantar el sistema completo.

Docker ayuda a reducir gran parte de esa fricción.

---

## Qué aporta un contenedor

Un contenedor no reemplaza al microservicio.  
Tampoco resuelve automáticamente todos los problemas operativos.

Lo que sí aporta es una unidad de ejecución más controlada y portable.

Eso permite:

- empaquetar la aplicación con una estrategia explícita,
- definir cómo arranca,
- exponer puertos,
- configurar variables de entorno,
- y conectar el servicio con otros componentes de forma más ordenada.

En NovaMarket, eso ayuda mucho a que cada pieza del sistema empiece a verse como una unidad desplegable coherente.

---

## El papel del Dockerfile

Para dockerizar un microservicio suele usarse un **Dockerfile**.

Conceptualmente, el Dockerfile cumple una función muy clara:

**describir cómo construir la imagen que después dará origen al contenedor.**

No se trata solo de un archivo técnico más.  
Es la receta que define:

- qué base se usa,
- qué artefacto se copia,
- cómo se ejecuta la aplicación,
- y qué forma toma el servicio dentro de su contenedor.

En un curso práctico, entender esta idea es más importante que memorizar sintaxis.

---

## Qué decisiones aparecen al dockerizar

Aunque el ejemplo inicial pueda ser simple, dockerizar obliga a tomar algunas decisiones importantes.

Por ejemplo:

- qué artefacto se empaqueta,
- cómo se expone la aplicación,
- qué variables se reciben desde afuera,
- cómo se separa configuración del binario,
- y qué suposiciones se hacen sobre el entorno.

Estas preguntas se conectan muy bien con módulos previos del curso:

- configuración centralizada,
- gateway,
- seguridad,
- mensajería,
- y testing con entornos más reales.

Docker no aparece aislado.  
Encaja con todo lo anterior.

---

## Cómo se ve esto en NovaMarket

Pensemos en un primer tramo razonable del sistema.

Podríamos empezar dockerizando:

- `catalog-service`,
- `inventory-service`,
- `order-service`.

Cada uno seguiría siendo una aplicación Spring Boot con su responsabilidad propia.  
La diferencia es que ahora tendría una forma explícita y repetible de ejecutarse como contenedor.

Eso ya cambia mucho la experiencia del proyecto:

- se vuelve más fácil levantarlo,
- más fácil compartirlo,
- y más fácil integrarlo después con Compose.

---

## Qué conviene mantener claro desde el principio

Dockerizar un microservicio no significa mezclar en un mismo contenedor todo lo que necesita la arquitectura.

Cada servicio debería seguir conservando su identidad y su responsabilidad.

Por ejemplo:

- `order-service` es un contenedor,
- `inventory-service` es otro,
- `catalog-service` es otro,
- la base de datos va aparte,
- RabbitMQ va aparte,
- Keycloak va aparte,
- el gateway va aparte.

Esto es importante porque ayuda a sostener el mismo diseño lógico también en el entorno de ejecución.

---

## Configuración y variables de entorno

Uno de los puntos donde más se nota la utilidad de Docker es en la forma de pasar configuración.

En vez de depender de cambios manuales en cada máquina, el servicio puede recibir desde fuera:

- puertos,
- URLs,
- credenciales,
- perfiles,
- nombres de recursos,
- y otros parámetros operativos.

Esto conecta directamente con lo que el curso ya trabajó en Spring Cloud Config y gestión de entornos.

La containerización no reemplaza la buena gestión de configuración, pero la vuelve más práctica y más visible.

---

## Qué errores comunes conviene evitar

Hay varios errores típicos cuando se empieza a dockerizar microservicios.

### 1. Pensar que Docker reemplaza el diseño
Un mal diseño de servicios no mejora por estar dentro de contenedores.

### 2. Meter demasiadas cosas en un solo contenedor
Eso rompe la idea de piezas separadas y complica la operación.

### 3. Acoplar demasiado el servicio al entorno local
Si la imagen depende de supuestos frágiles, se pierde buena parte del beneficio.

### 4. Tratar la configuración como algo fijo dentro de la imagen
Eso vuelve más rígido el despliegue.

### 5. Olvidar que el objetivo es reproducibilidad
Docker no se usa solo por moda, sino para reducir diferencias y fricción.

---

## Qué gana el alumno con este paso

A nivel didáctico, dockerizar los microservicios cambia bastante la percepción del proyecto.

Hasta ahora NovaMarket pudo verse como una arquitectura distribuida desde el código y desde la integración.  
A partir de este punto empieza a verse también como un sistema **levantable** y **portable**.

Eso tiene mucho valor, porque acerca el curso a una práctica muy real del día a día profesional.

---

## Relación con el siguiente paso

Dockerizar servicios individuales es importante, pero todavía no resuelve todo.

Una vez que tenemos varios contenedores separados, aparece una nueva pregunta:

**¿cómo los levantamos juntos como un sistema coordinado?**

Ahí entra el siguiente gran tema del módulo:

**Docker Compose para la arquitectura completa.**

Es decir:

- primero pensamos la unidad,
- después pensamos el conjunto.

Ese orden pedagógico funciona muy bien.

---

## Una idea práctica para llevarse

Dockerizar un microservicio no es solo “correrlo en contenedor”.

Es definir una manera más estable, portable y reproducible de ejecutar una pieza de la arquitectura.

En un sistema como NovaMarket, eso ayuda a que cada servicio deje de depender tanto del entorno manual del desarrollador y pase a ser una unidad más clara para integrar, probar y desplegar.

---

## Cierre

Dockerizar microservicios es un paso clave para llevar una arquitectura distribuida desde el plano del código hacia un entorno más cercano a su ejecución real.

En NovaMarket, este proceso permite transformar servicios Spring Boot en unidades más portables, reproducibles y fáciles de integrar con el resto del sistema.

Con esta base ya estamos listos para el siguiente paso natural: **orquestar varios contenedores juntos con Docker Compose**.
