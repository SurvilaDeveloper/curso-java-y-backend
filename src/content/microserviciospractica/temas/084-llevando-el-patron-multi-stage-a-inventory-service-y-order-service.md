---
title: "Introduciendo multi-stage build en un servicio importante de NovaMarket"
description: "Primer paso práctico del nuevo subtramo del roadmap operativo. Aplicación de multi-stage build a un servicio de NovaMarket para separar mejor la fase de build de la fase de runtime."
order: 83
module: "Módulo 9 · Refinamiento de imágenes Docker"
level: "intermedio"
draft: false
---

# Introduciendo multi-stage build en un servicio importante de NovaMarket

En la clase anterior dejamos algo bastante claro:

- NovaMarket ya está listo para volver sobre sus Dockerfiles,
- no alcanza ya con que las imágenes simplemente funcionen,
- y lo más sano ahora es introducir una mejora concreta que vuelva más limpia y más profesional al menos una de esas imágenes.

Ahora toca el paso concreto:

**introducir multi-stage build en un servicio importante de NovaMarket.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la diferencia entre una imagen de build y una imagen de runtime,
- aplicado un primer multi-stage build real sobre un servicio del proyecto,
- más profesional el patrón de Dockerfile usado por NovaMarket,
- y el proyecto mejor preparado para refinar después el resto de sus imágenes.

La meta de hoy no es rehacer de una sola vez todos los Dockerfiles del sistema.  
La meta es mucho más concreta: **aprender bien el patrón multi-stage sobre una pieza real para que luego sea fácil extenderlo al resto del proyecto**.

---

## Estado de partida

Partimos de un sistema donde ya:

- varios servicios del proyecto tienen Dockerfiles funcionales,
- el entorno ya corre en Compose,
- y el roadmap operativo ya dejó claro que ahora conviene mejorar la calidad de las imágenes que sostienen a NovaMarket.

Eso significa que el problema ya no es si Docker funciona.  
Ahora la pregunta útil es otra:

- **cómo mejoramos de verdad una imagen sin romper el flujo del proyecto**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir un servicio adecuado para inaugurar el patrón,
- transformar su Dockerfile simple en un Dockerfile multi-stage,
- construir la imagen refinada,
- validar que el servicio sigue funcionando,
- y leer qué nueva calidad gana NovaMarket después de ese cambio.

---

## Qué servicio conviene elegir primero

A esta altura del curso, una muy buena opción para inaugurar multi-stage build suele volver a ser:

- `catalog-service`

¿Por qué?

Porque:

- ya es una pieza conocida,
- ya tiene endpoints visibles,
- y permite enfocarnos en el patrón de build sin meter demasiado ruido adicional.

Eso la vuelve una gran primera candidata para esta mejora.

---

## Qué problema estamos resolviendo con multi-stage build

Hasta ahora, un Dockerfile simple podía verse algo así:

```dockerfile
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/catalog-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
```

Eso estuvo perfecto como primer paso.

Pero ahora queremos algo más fuerte:

- separar mejor dónde se construye el artefacto
- y dónde realmente se ejecuta

Esa separación es justamente el corazón de multi-stage build.

---

## Qué idea central introduce multi-stage build

La idea es muy simple y muy poderosa:

- en una primera etapa construís el artefacto
- en una segunda etapa te quedás solo con lo que necesitás para ejecutar

Eso significa que la imagen final ya no tiene por qué cargar todo lo que fue necesario durante la compilación.

Ese cambio vuelve al resultado mucho más limpio.

---

## Paso 1 · Crear un Dockerfile multi-stage para `catalog-service`

Una versión razonable y bastante clara para esta etapa podría verse así:

```dockerfile
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /workspace/target/catalog-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
```

Esta versión ya tiene muchísimo valor porque hace muy visible la separación entre:

- etapa de build
- y etapa de runtime

Ese es uno de los puntos más importantes de toda la clase.

---

## Paso 2 · Entender qué hace cada etapa

Conviene leerlo con calma:

### Etapa 1 · `build`
Usa una imagen con Maven y Java para compilar el proyecto y generar el `.jar`.

### Etapa 2 · runtime
Usa una imagen más liviana, solo con Java runtime, y copia desde la etapa anterior únicamente el artefacto final.

Esa diferencia importa muchísimo porque hace que la imagen final deje de cargar herramientas que ya no necesita una vez construida la aplicación.

---

## Paso 3 · Entender por qué esto mejora la imagen final

Este punto vale muchísimo.

Con este patrón, la imagen final ya no necesita incluir:

- Maven
- ni toda la lógica del build
- ni todo el contexto que solo servía para construir el `.jar`

Eso ayuda a lograr una imagen más limpia, más profesional y más alineada con la idea de runtime real del servicio.

Ese salto es justamente el corazón del bloque.

---

## Paso 4 · Construir la nueva imagen

Ahora construí la imagen refinada desde la carpeta del servicio:

```bash
docker build -t novamarket/catalog-service:dev .
```

La idea es mantener el mismo nombre para no complicar demasiado el flujo en esta etapa.

Lo importante ahora no es cambiar toda la estrategia de tags.  
Lo importante es validar el nuevo patrón.

---

## Paso 5 · Levantar el contenedor refinado

Ahora ejecutá el contenedor como antes:

```bash
docker run --rm -p 8081:8081 novamarket/catalog-service:dev
```

La idea es comprobar algo muy importante:

- la imagen cambió por dentro,
- pero el servicio debería seguir comportándose igual desde afuera.

Ese contraste tiene muchísimo valor porque demuestra que el refinamiento del Dockerfile mejora el empaquetado sin cambiar la identidad funcional del servicio.

---

## Paso 6 · Probar el endpoint del catálogo

Ahora verificá que sigue respondiendo:

```bash
curl http://localhost:8081/products
curl http://localhost:8081/products/1
```

Lo importante es confirmar que:

- el build multi-stage funciona,
- la imagen final arranca,
- y `catalog-service` sigue siendo el mismo servicio desde el punto de vista funcional.

Ese paso es central, porque muestra que el refinamiento es operativo y no solo teórico.

---

## Paso 7 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya refinó profesionalmente todas sus imágenes”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene un primer multi-stage build real y un nuevo patrón de Dockerfile bastante mejor que el anterior.

Ese matiz es muchísimo más sano.

---

## Paso 8 · Pensar por qué este cambio vale tanto aunque sea sobre un solo servicio

A primera vista, podría parecer que mejorar una sola imagen no cambia tanto.

Pero en realidad vale muchísimo porque:

- instala un patrón nuevo,
- demuestra que el proyecto ya puede separar build y runtime,
- y deja una referencia concreta para extender la mejora al resto del sistema.

Ese valor de patrón importa muchísimo más que la cantidad de servicios tocados en una sola clase.

---

## Qué estamos logrando con esta clase

Esta clase introduce multi-stage build en un servicio importante de NovaMarket.

Ya no estamos solo hablando de imágenes más limpias.  
Ahora también estamos aplicando esa mejora en un caso real del sistema y dejando un patrón mucho más profesional para los siguientes Dockerfiles.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- extendimos todavía multi-stage build al resto de los servicios,
- ni consolidamos aún este subbloque con un checkpoint fuerte.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real hacia imágenes más profesionales dentro de NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Copiar un multi-stage build sin entender qué separa realmente
La diferencia entre build y runtime es el corazón del patrón.

### 2. Querer optimizar todos los Dockerfiles de una sola vez
Conviene aprender bien el patrón primero sobre un servicio claro.

### 3. No validar el endpoint después del cambio
La verificación sigue siendo parte esencial de la clase.

### 4. Pensar que el valor está solo en “pesar menos”
También mejora mucho la limpieza conceptual de la imagen.

### 5. Cambiar demasiadas cosas a la vez
En esta etapa, el foco tiene que estar puesto en el patrón multi-stage.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- `catalog-service` ya tiene un Dockerfile multi-stage,
- la imagen se construye correctamente,
- el contenedor arranca,
- y NovaMarket ya dio un primer paso serio hacia imágenes más limpias y más profesionales.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué hace cada etapa del Dockerfile,
- ves por qué la imagen final queda más limpia,
- el servicio sigue respondiendo correctamente,
- y sentís que el proyecto ya dejó atrás la fase de Dockerfiles solamente “suficientes”.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar este nuevo subbloque del roadmap operativo.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar este primer refinamiento de imágenes, leyendo con más claridad qué nueva postura ganó NovaMarket después de empezar a profesionalizar sus Dockerfiles.

---

## Cierre

En esta clase introdujimos multi-stage build en un servicio importante de NovaMarket.

Con eso, el proyecto deja de conformarse con imágenes simplemente funcionales y empieza a sostener una forma de empaquetado bastante más limpia, bastante más clara y mucho más alineada con una ejecución seria del sistema.
