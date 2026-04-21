---
title: "Mejorando el caching del build en un Dockerfile multi-stage de NovaMarket"
description: "Primer paso práctico del siguiente subtramo del módulo 9. Reorganización de un Dockerfile multi-stage para aprovechar mejor el cache del build y reducir trabajo repetido en reconstrucciones frecuentes."
order: 89
module: "Módulo 9 · Refinamiento de imágenes Docker"
level: "intermedio"
draft: false
---

# Mejorando el caching del build en un Dockerfile multi-stage de NovaMarket

En la clase anterior dejamos algo bastante claro:

- el refinamiento de imágenes ya no puede quedarse solo en multi-stage build y `.dockerignore`,
- el proceso de build también merece más criterio,
- y lo más sano ahora es aplicar una primera mejora concreta para que Docker reutilice mejor trabajo ya hecho.

Ahora toca el paso concreto:

**mejorar el caching del build en un Dockerfile multi-stage de NovaMarket.**

Ese es el objetivo de esta clase.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- mucho más clara la relación entre el orden del Dockerfile y el cache de build,
- aplicado un primer refinamiento concreto sobre un servicio real,
- más eficiente la reconstrucción habitual de imágenes,
- y NovaMarket mejor preparado para sostener un flujo de trabajo bastante más cómodo en el día a día.

La meta de hoy no es diseñar todavía la estrategia perfecta para todos los módulos.  
La meta es mucho más concreta: **hacer visible cómo un pequeño cambio de estructura en el Dockerfile puede mejorar muchísimo la forma en que Docker reutiliza capas**.

---

## Estado de partida

Partimos de un sistema donde ya:

- varios servicios importantes usan multi-stage build,
- al menos parte del contexto de build ya está más limpio,
- y el módulo ya dejó claro que ahora conviene cuidar no solo la imagen final, sino también el trabajo que se repite durante la construcción.

Eso significa que el problema ya no es si el cache de build existe.  
Ahora la pregunta útil es otra:

- **cómo escribimos el Dockerfile para aprovecharlo mejor**

Y eso es exactamente lo que vamos a convertir en algo real en esta clase.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- elegir un servicio claro para inaugurar este ajuste,
- revisar su Dockerfile multi-stage actual,
- reorganizarlo para separar mejor lo estable de lo cambiante,
- reconstruir la imagen,
- y validar qué nueva lógica de build gana NovaMarket después de este cambio.

---

## Qué servicio conviene elegir primero

A esta altura del curso, una muy buena primera opción vuelve a ser:

- `catalog-service`

¿Por qué?

Porque:

- ya lo usamos antes para introducir otros refinamientos,
- tiene un Dockerfile que conocemos bien,
- y permite enfocarnos en el patrón de caching sin sumar demasiada complejidad extra.

Eso lo vuelve un gran primer candidato para esta mejora.

---

## Qué problema suele tener el Dockerfile actual

Supongamos que partimos de algo como esto:

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

Esto ya es un buen Dockerfile multi-stage.

Pero todavía tiene una oportunidad clara de mejora:

- cada vez que cambia algo en `src`, Docker puede invalidar la etapa completa que desemboca en `mvn clean package`, incluso cuando una parte importante del entorno de dependencias no cambió.

Ese es justamente el punto que ahora queremos mejorar.

---

## Paso 1 · Separar mejor dependencias de código fuente

Una forma más razonable para aprovechar mejor el cache puede ser algo así:

```dockerfile
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace

COPY pom.xml .
RUN mvn dependency:go-offline -DskipTests

COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /workspace/target/catalog-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
```

Esta versión ya tiene muchísimo valor porque separa dos momentos bastante distintos:

- resolver dependencias
- compilar el código fuente

Ese cambio es uno de los más importantes de toda la clase.

---

## Paso 2 · Entender por qué esta separación ayuda al cache

Conviene leerla con calma.

### Primero copiamos `pom.xml`
Eso representa la definición principal de dependencias.

### Después resolvemos dependencias
Mientras `pom.xml` no cambie, esa parte puede quedar mejor cacheada.

### Recién después copiamos `src`
Eso significa que cambios en el código fuente afectan más directamente la parte de compilación, pero no necesariamente obligan a rehacer siempre la resolución completa de dependencias.

Ese matiz tiene muchísimo valor práctico.

---

## Paso 3 · Entender qué estamos optimizando realmente

Este punto importa muchísimo.

No estamos intentando que Docker “no compile nunca”.

Estamos intentando algo más razonable y mucho más útil:

- que cambios frecuentes del código no obliguen a rehacer innecesariamente capas más estables del build.

Esa mejora parece pequeña, pero cambia bastante la experiencia cotidiana cuando un proyecto se reconstruye muchas veces.

---

## Paso 4 · Reconstruir la imagen

Ahora construí de nuevo la imagen:

```bash
docker build -t novamarket/catalog-service:dev .
```

La idea es que el servicio siga construyéndose correctamente, pero ahora con una estructura bastante más amable para el cache.

Este es uno de los momentos más importantes de la clase, porque convierte en algo real un patrón que a simple vista puede parecer solo una reorganización superficial del Dockerfile.

---

## Paso 5 · Volver a construir después de un cambio pequeño

Ahora hacé una prueba muy simple:

- modificá algo chico en un archivo dentro de `src/`
- y volvé a ejecutar `docker build`

No hace falta medir todavía con extrema precisión.  
Lo importante es observar conceptualmente que:

- la parte estable del build tiene muchas más chances de reutilizarse,
- y el trabajo repetido baja respecto de un Dockerfile menos ordenado.

Ese contraste es el corazón práctico de la clase.

---

## Paso 6 · Levantar y probar el servicio

Como siempre, validá que el servicio siga funcionando:

```bash
docker run --rm -p 8081:8081 novamarket/catalog-service:dev
curl http://localhost:8081/products
curl http://localhost:8081/products/1
```

Lo importante es confirmar que:

- el refinamiento no rompe la imagen,
- el servicio sigue arrancando,
- y el Dockerfile ahora no solo es más limpio, sino también más inteligente respecto del build.

---

## Paso 7 · Entender qué acabamos de ganar

Este punto importa muchísimo.

Hasta ahora, el refinamiento de imágenes ya trabajaba sobre:

- imagen final
- contexto
- y separación build/runtime

Ahora, en cambio, también empieza a trabajar sobre:

- **cómo reutilizar mejor trabajo ya hecho durante la construcción**

Ese salto vuelve al bloque mucho más útil para el trabajo real del día a día.

---

## Paso 8 · Entender qué todavía no resolvimos

Conviene dejar esto muy claro.

Después de esta clase, todavía no deberíamos decir:

- “NovaMarket ya tiene completamente optimizado el caching del build”

Sería exagerado.

Lo correcto es algo más preciso:

- NovaMarket ya tiene un primer Dockerfile reorganizado para aprovechar bastante mejor el cache en reconstrucciones habituales.

Ese matiz es muchísimo más sano.

---

## Qué estamos logrando con esta clase

Esta clase mejora el caching del build en un Dockerfile multi-stage real de NovaMarket.

Ya no estamos solo refinando la imagen final o el contexto de construcción.  
Ahora también estamos haciendo que el build se comporte de una forma bastante más eficiente y bastante más amigable para el trabajo continuo sobre el proyecto.

Eso es un salto muy importante.

---

## Qué todavía no hicimos

Todavía no:

- extendimos todavía este patrón a más servicios,
- ni consolidamos aún este subbloque con un checkpoint fuerte.

Todo eso puede venir enseguida.

La meta de hoy es mucho más concreta:

**dar el primer paso real para que el build de NovaMarket aproveche mejor el cache y rehaga menos trabajo innecesario.**

---

## Errores comunes en esta etapa

### 1. Pensar que cambiar el orden del Dockerfile es una obsesión menor
Puede impactar muchísimo en la experiencia real del build.

### 2. Copiar primero todo el proyecto y recién después intentar cachear dependencias
Eso suele romper bastante la reutilización de capas.

### 3. Confundir “aprovechar mejor cache” con “evitar compilar”
No es lo mismo.

### 4. No reconstruir después de un cambio pequeño para observar el efecto
La comparación práctica es parte esencial de la clase.

### 5. Pensar que esto solo mejora velocidad
También mejora bastante la calidad del diseño del Dockerfile.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías poder confirmar que:

- `catalog-service` ya tiene un Dockerfile más amigable para el cache,
- la imagen sigue construyéndose correctamente,
- el servicio sigue funcionando,
- y NovaMarket ya dio un primer paso serio hacia builds más eficientes en su trabajo cotidiano.

Eso deja muy bien preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés por qué conviene separar dependencias y código fuente,
- ves que el orden de las capas influye en la reutilización del cache,
- el servicio sigue sano después del cambio,
- y sentís que el proyecto ya dejó de tratar el build como una simple caja negra.

Si eso está bien, ya podemos pasar al siguiente tema y consolidar este nuevo subbloque del roadmap operativo.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a validar y consolidar esta primera capa de builds más eficientes, leyendo con más claridad qué nueva postura ganó NovaMarket después de empezar a aprovechar mejor el cache de Docker.

---

## Cierre

En esta clase mejoramos el caching del build en un Dockerfile multi-stage de NovaMarket.

Con eso, el proyecto deja de conformarse con builds simplemente correctos y empieza a sostener una forma de construcción bastante más inteligente, bastante más eficiente y mucho más alineada con un trabajo serio y repetido sobre imágenes Docker.
