---
title: "Introduciendo multi-stage build en los servicios"
description: "Continuación del refinamiento del despliegue operativo. Uso de multi-stage build para separar construcción y ejecución de las imágenes de NovaMarket."
order: 78
module: "Módulo 11 · Despliegue operativo con Docker Compose"
level: "intermedio"
draft: false
---

# Introduciendo multi-stage build en los servicios

En la clase anterior refinamos los Dockerfile de NovaMarket y dejamos una base bastante más clara para empaquetar los servicios.

Eso ya fue una mejora importante.

Pero todavía podemos dar otro paso muy valioso:

**separar el proceso de build del proceso de runtime.**

Hasta ahora, una imagen puede funcionar bien copiando un jar ya generado.  
Eso está perfecto para ciertos escenarios.  
Pero cuando queremos un empaquetado más profesional, hay una estrategia muy poderosa que conviene introducir:

**multi-stage build**.

La idea es simple:

- una etapa construye el artefacto,
- otra etapa mucho más liviana lo ejecuta.

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- introducida una estrategia de multi-stage build en los servicios principales,
- separadas las fases de construcción y ejecución,
- y mejorado el criterio general de empaquetado de imágenes en NovaMarket.

Todavía no vamos a hacer optimización extrema de cada byte de imagen.  
La meta es instalar una base de build mucho más profesional.

---

## Estado de partida

Partimos de un proyecto donde:

- los servicios ya tienen Dockerfile razonables,
- el stack ya puede levantarse con Docker Compose,
- y el empaquetado general ya es más prolijo que al inicio del bloque.

Pero todavía hay una oportunidad muy clara de mejora:

- evitar mezclar entorno de build con entorno de ejecución
- y reducir la carga conceptual y operativa de la imagen final

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar la lógica de multi-stage build,
- aplicarla a uno o más servicios representativos,
- separar Maven/compilación del runtime Java,
- y dejar una estrategia más limpia para el empaquetado de NovaMarket.

---

## Qué problema resuelve multi-stage build

Cuando una imagen hace demasiadas cosas en un solo stage, suelen aparecer varios problemas:

- la imagen final arrastra herramientas que solo servían para construir
- el Dockerfile se vuelve menos claro
- la separación entre build y runtime queda difusa
- y el tamaño final puede ser mayor del necesario

Multi-stage build ayuda justamente a resolver eso.

---

## Paso 1 · Pensar el flujo ideal

La idea conceptual del empaquetado pasa a ser esta:

### Stage 1
Construir el artefacto con una imagen que tenga Maven y JDK.

### Stage 2
Ejecutar el jar con una imagen más liviana que solo necesite Java runtime.

Ese cambio ya mejora mucho la claridad del despliegue.

---

## Paso 2 · Elegir un servicio representativo para empezar

Para esta clase, conviene empezar por uno o dos servicios representativos. Por ejemplo:

- `order-service`
- `notification-service`

Son buenos candidatos porque:

- tienen bastante lógica real,
- participan en varios bloques del curso,
- y sirven muy bien como modelo para extender después al resto.

---

## Paso 3 · Escribir un Dockerfile multi-stage base

Una versión conceptual bastante razonable para `order-service` podría verse así:

```dockerfile
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /build

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

Esta estructura ya deja mucho más clara la separación entre:

- construir
- y ejecutar

---

## Paso 4 · Entender por qué esto mejora la imagen

La imagen final ya no necesita contener:

- Maven
- el código fuente
- ni toda la infraestructura de build

Solo necesita:

- el runtime Java
- y el jar ya construido

Eso hace que la imagen final sea más limpia tanto conceptualmente como operativamente.

---

## Paso 5 · Pensar el impacto en cache y build

Este punto es muy importante.

Multi-stage build no solo ayuda al runtime final.  
También abre la puerta a pensar mejor el cache de capas.

Por ejemplo, más adelante podrías separar mejor:

- copia de `pom.xml`
- descarga de dependencias
- copia de código fuente
- y build final

Para esta clase no hace falta llegar todavía a una optimización quirúrgica, pero sí conviene empezar a notar que el orden de copia en Docker también influye bastante.

---

## Paso 6 · Repetir el patrón en otro servicio

Ahora conviene replicar el enfoque, por ejemplo, en `notification-service`.

Una versión razonable podría verse así:

```dockerfile
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /build

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

Esto ayuda mucho a que la nueva estrategia no quede como una excepción aislada.

---

## Paso 7 · Pensar si conviene extender el patrón a más servicios

A esta altura ya debería quedar claro que esta estrategia puede extenderse a:

- `catalog-service`
- `inventory-service`
- `config-server`
- `discovery-server`
- `api-gateway`

No hace falta que absolutamente todos queden migrados en la misma clase, pero sí conviene dejar establecido el criterio.

---

## Paso 8 · Revisar `.dockerignore` otra vez

Multi-stage build mejora bastante las imágenes, pero sigue siendo importante cuidar el contexto que enviamos al daemon de Docker.

Por eso, esta clase también es un buen momento para confirmar que el `.dockerignore` sigue teniendo sentido con la nueva estrategia.

No queremos mandar al build cosas que no ayudan a ninguna de las etapas.

---

## Paso 9 · Ajustar Compose si hace falta

Si el `docker-compose.yml` construye directamente desde los contextos de los servicios, esta nueva estrategia puede entrar bastante naturalmente.

No hace falta cambiar toda la estructura del compose si cada servicio ya tenía un `build` apuntando a su carpeta.

Lo importante es que, cuando Compose construya la imagen, ahora use el Dockerfile multi-stage.

---

## Paso 10 · Volver a construir imágenes

Ahora conviene reconstruir al menos uno o dos servicios con la nueva estrategia y revisar:

- que el build termine bien,
- que la imagen final arranque,
- y que el servicio siga funcionando como antes.

Siempre es importante validar que una mejora de empaquetado no rompa el comportamiento funcional.

---

## Paso 11 · Ver el valor conceptual de esta mejora

A esta altura del curso conviene fijar bien esta idea:

**el contenedor final no tiene por qué parecerse al entorno de desarrollo.**

Eso es una enseñanza muy importante.

Una cosa es el entorno donde compilás.  
Otra distinta es el entorno mínimo razonable donde ejecutás.

Ese cambio de mentalidad vale muchísimo.

---

## Qué estamos logrando con esta clase

Esta clase da un salto bastante profesional dentro del bloque de despliegue.

Antes, las imágenes ya eran razonables.  
Ahora empiezan a representar mucho mejor la diferencia entre:

- construir software
- y ejecutar software

Eso mejora muchísimo la arquitectura operativa del proyecto.

---

## Qué todavía no hicimos

Todavía no:

- afinamos cache de dependencias Maven al máximo,
- comparamos tamaños concretos de imágenes,
- ni definimos una estrategia fina de build para cada servicio del ecosistema.

Todo eso puede venir después.

La meta de hoy es mucho más concreta:

**instalar multi-stage build como criterio fuerte del proyecto.**

---

## Errores comunes en esta etapa

### 1. Copiar demasiado contexto también en el stage de build
Conviene seguir siendo ordenado.

### 2. Romper el path del jar entre stage builder y stage runtime
Hay que revisar bien de dónde se copia y a dónde.

### 3. Pensar que multi-stage build es solo una cuestión de tamaño
También mejora claridad y separación de responsabilidades.

### 4. No volver a probar el servicio después del cambio
Siempre hay que validar el comportamiento final.

### 5. Intentar optimizar todo a la vez
Para esta clase alcanza con instalar bien el patrón.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, uno o más servicios principales de NovaMarket deberían estar construyéndose con multi-stage build, dejando al proyecto mucho mejor parado para un empaquetado más profesional y sostenible.

Eso prepara muy bien el siguiente checkpoint.

---

## Punto de control

Antes de seguir, verificá que:

- al menos un servicio ya usa multi-stage build,
- el runtime final quedó separado del build,
- el servicio sigue arrancando,
- y el criterio ya puede extenderse al resto del stack.

Si eso está bien, ya podemos cerrar este tramo con una validación operativa del stack mejor empaquetado.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a volver a validar el entorno integrado después de estas mejoras de empaquetado, para comprobar que el stack no solo es más prolijo, sino también igual o más sólido en la práctica.

---

## Cierre

En esta clase introdujimos multi-stage build en los servicios de NovaMarket.

Con eso, el proyecto gana una forma mucho más profesional de empaquetar sus imágenes y deja mucho más clara la diferencia entre construir los servicios y ejecutarlos dentro del stack.
