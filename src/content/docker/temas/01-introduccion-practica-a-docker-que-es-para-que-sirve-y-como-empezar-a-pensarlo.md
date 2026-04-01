---
title: "Introducción práctica a Docker: qué es, para qué sirve y cómo empezar a pensarlo"
description: "Primer tema práctico del curso de Docker: qué es Docker, qué problema resuelve, cuáles son sus conceptos base y por qué se usa tanto en desarrollo y despliegue."
order: 1
module: "Fundamentos de Docker"
level: "intro"
draft: false
---

# Introducción práctica a Docker: qué es, para qué sirve y cómo empezar a pensarlo

## Objetivo del tema

En este primer tema vas a:

- entender qué problema resuelve Docker
- diferenciar la idea de imagen y contenedor
- ver por qué Docker ayuda a evitar problemas de entorno
- empezar a pensar tus proyectos de una forma más portable y ordenada
- prepararte para empezar a usar Docker de verdad en los próximos temas

La idea no es que memorices teoría aislada, sino que entiendas para qué sirve Docker antes de empezar a ejecutar comandos.

---

## Qué es Docker

Docker es una herramienta que permite **empaquetar una aplicación junto con lo necesario para ejecutarla**.

Eso puede incluir, por ejemplo:

- el código
- dependencias
- configuración básica
- entorno de ejecución
- herramientas necesarias para arrancar la aplicación

Ese paquete se ejecuta dentro de algo llamado **contenedor**.

Dicho simple:

> Docker te ayuda a ejecutar aplicaciones de una forma más consistente, aislada y fácil de reproducir.

---

## Qué problema resuelve Docker

Uno de los problemas más comunes en desarrollo es este:

> “En mi máquina funciona.”

Eso suele pasar porque una aplicación depende de muchas cosas del entorno:

- versión de Node.js
- versión de Java
- versión de Python
- librerías instaladas
- variables de entorno
- sistema operativo
- configuración local
- puertos disponibles

Entonces, algo puede funcionar perfecto en una computadora y fallar en otra.

Docker ayuda a reducir ese problema porque **estandariza el entorno donde corre la aplicación**.

---

## Qué vas a hacer hoy

En este tema no vas a meterte todavía con comandos complejos.

Primero necesitás construir una buena base mental.

Hoy vas a entender estas ideas:

1. qué es Docker
2. qué es una imagen
3. qué es un contenedor
4. por qué Docker se usa tanto en proyectos reales
5. en qué casos te puede servir en tu propio trabajo

---

## Idea central que tenés que llevarte

Docker trabaja alrededor de una idea muy importante:

- definir un entorno reproducible
- empaquetarlo correctamente
- ejecutarlo de forma aislada

En lugar de decir:

> “Instalá todo esto y tratá de que te funcione como a mí”

la idea pasa a ser:

> “Ejecutá esto con Docker”

---

## Qué es un contenedor

Un contenedor es una forma aislada de ejecutar una aplicación.

No es una máquina virtual completa.

Es más liviano y más rápido de iniciar.

Podés pensarlo así:

- tiene lo necesario para correr una app
- está aislado del resto del sistema
- se puede crear, ejecutar, detener y borrar fácilmente

Un contenedor no pretende reemplazar todo tu sistema operativo.
Su objetivo es ejecutar una aplicación o servicio de forma controlada.

---

## Qué es una imagen

Una **imagen** es la plantilla a partir de la cual se crea un contenedor.

Una forma simple de entenderlo es esta:

- **imagen** = molde
- **contenedor** = instancia en ejecución de ese molde

Por ejemplo:

- una imagen puede representar una app Node.js lista para arrancar
- al ejecutarla, se crea un contenedor basado en esa imagen

---

## Qué diferencia hay entre imagen y contenedor

Esta diferencia es clave desde el principio.

### Imagen
Es una definición preparada, algo así como una receta o plantilla.

### Contenedor
Es la ejecución concreta de esa imagen.

Una misma imagen puede usarse para crear varios contenedores.

---

## Qué significa que Docker aísla aplicaciones

Cuando Docker ejecuta una aplicación en un contenedor, esa app no depende tanto de cómo esté preparada tu máquina.

Eso te da varias ventajas:

- menos conflictos entre proyectos
- menos “funciona acá pero allá no”
- más facilidad para compartir entornos
- más orden cuando trabajás con varias tecnologías

Por ejemplo, podrías tener:

- un proyecto con Java 21
- otro con Node 22
- otro con PostgreSQL
- otro con Redis

y usar Docker para levantar cada parte sin mezclar instalaciones locales innecesarias.

---

## Casos típicos de uso

Docker se usa mucho para:

- levantar bases de datos rápidamente
- correr aplicaciones sin instalar todo a mano
- compartir entornos entre desarrolladores
- preparar entornos de testing
- ejecutar servicios auxiliares
- desplegar aplicaciones en servidores
- levantar varios servicios juntos

Ejemplos concretos:

- correr PostgreSQL en un contenedor
- levantar una app Node.js
- ejecutar una API Java
- conectar backend y base de datos
- preparar un stack completo para desarrollo

---

## Ventajas principales

### 1. Reproducibilidad
Todos pueden trabajar con un entorno mucho más parecido.

### 2. Portabilidad
La aplicación se puede mover de una máquina a otra con menos fricción.

### 3. Aislamiento
Cada proyecto puede tener sus propias dependencias sin chocar con otros.

### 4. Rapidez
Crear y borrar contenedores suele ser mucho más rápido que preparar entornos manualmente.

### 5. Orden
Docker te obliga a pensar mejor qué necesita realmente tu aplicación para funcionar.

---

## Qué Docker no hace mágicamente

Docker ayuda muchísimo, pero no resuelve todo por sí solo.

No corrige automáticamente:

- errores de tu código
- mala arquitectura
- configuraciones mal hechas
- problemas de seguridad
- falta de persistencia de datos
- dependencias mal elegidas

O sea: Docker mejora la forma de ejecutar y compartir aplicaciones, pero sigue siendo importante entender bien el proyecto.

---

## Ejemplo mental simple

Imaginá que hiciste una aplicación que necesita:

- Node.js
- una base PostgreSQL
- variables de entorno
- un puerto libre

Sin Docker, otra persona tal vez tenga que:

- instalar Node
- instalar PostgreSQL
- crear la base
- configurar variables
- revisar versiones
- corregir problemas del sistema

Con Docker, la idea es que gran parte de ese trabajo quede mejor definido y sea más reproducible.

---

## Ejemplo práctico de la vida real

Supongamos este escenario:

Tu proyecto usa:

- Java 21
- PostgreSQL 16
- una variable `PORT=8080`

En tu máquina funciona perfecto.

Pero otra persona tiene:

- otra versión de Java
- otra versión de PostgreSQL
- otra configuración local
- otro puerto ocupado

Ahí empiezan los problemas clásicos del entorno.

Docker ayuda porque permite acercar mucho más el entorno de todos.

---

## Lo importante de este tema

No hace falta memorizar nada raro todavía.

Quedate con estas ideas:

- Docker ayuda a ejecutar aplicaciones de forma consistente
- una imagen es una plantilla
- un contenedor es una ejecución concreta de esa plantilla
- Docker sirve para reducir problemas de entorno
- es muy útil tanto en desarrollo como en despliegue

---

## Mini glosario

### Docker
Herramienta para crear y ejecutar contenedores.

### Imagen
Plantilla con lo necesario para crear un contenedor.

### Contenedor
Instancia en ejecución de una imagen.

### Entorno
Conjunto de configuraciones, dependencias y herramientas necesarias para correr una aplicación.

---

## Qué no tenés que confundir

### Docker no es una aplicación en sí misma
Docker no reemplaza tu proyecto.
Te ayuda a empaquetarlo y ejecutarlo mejor.

### Un contenedor no es una máquina virtual completa
Se parece en la idea de aislamiento, pero es mucho más liviano y más directo para ejecutar apps.

### Docker no es solo para producción
También se usa muchísimo en desarrollo local.

---

## Ejercicio práctico obligatorio

Quiero que hagas este ejercicio de análisis con uno de tus proyectos actuales.

### Ejercicio 1
Elegí un proyecto tuyo.

### Ejercicio 2
Anotá:

- lenguaje principal
- framework, si tiene
- base de datos que usa
- variables de entorno importantes
- dependencias externas
- qué tendría que instalar otra persona para ejecutarlo

### Ejercicio 3
Respondé con tus palabras:

- ¿qué parte de ese proyecto podría beneficiarse de Docker?
- ¿qué problemas de entorno podrían aparecer sin Docker?
- ¿qué te gustaría poder levantar más rápido con contenedores?

---

## Mini desafío

Pensá en tres cosas que hoy instalás manualmente en tu máquina para desarrollar.

Por ejemplo:

- una base de datos
- un runtime
- una herramienta auxiliar

Ahora preguntate:

> ¿me convendría seguir instalando esto manualmente o sería mejor levantarlo con Docker?

No hace falta responder perfecto.
La idea es empezar a cambiar la forma de pensar el entorno.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este primer tema, ya deberías poder:

- explicar con tus palabras qué es Docker
- entender qué problema intenta resolver
- diferenciar imagen y contenedor
- reconocer por qué Docker es útil en proyectos reales
- mirar uno de tus proyectos y detectar dónde te podría servir

---

## Resumen del tema

- Docker ayuda a empaquetar y ejecutar aplicaciones en entornos más consistentes.
- Su objetivo principal es reducir problemas de entorno y mejorar la reproducibilidad.
- La imagen es la plantilla.
- El contenedor es la ejecución concreta de esa plantilla.
- Docker es útil tanto en desarrollo como en despliegue.
- Antes de usar comandos, conviene entender bien esta base conceptual.

---

## Próximo tema

En el próximo tema vas a bajar esta idea a tierra entendiendo mejor tres conceptos que aparecen todo el tiempo cuando trabajás con Docker:

- imagen
- contenedor
- registro
