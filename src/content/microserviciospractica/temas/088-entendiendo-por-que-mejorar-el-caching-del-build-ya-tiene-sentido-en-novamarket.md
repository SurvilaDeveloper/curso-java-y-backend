---
title: "Entendiendo por qué mejorar el caching del build ya tiene sentido en NovaMarket"
description: "Inicio del siguiente subtramo del módulo 9. Comprensión de por qué, después de multi-stage build y .dockerignore, ya conviene prestar atención al caching del build para volver más eficiente el trabajo cotidiano con imágenes."
order: 88
module: "Módulo 9 · Refinamiento de imágenes Docker"
level: "intermedio"
draft: false
---

# Entendiendo por qué mejorar el caching del build ya tiene sentido en NovaMarket

En la clase anterior cerramos otra etapa bastante importante del refinamiento de imágenes:

- introdujimos **multi-stage build**,
- empezamos a limpiar el contexto de construcción con `.dockerignore`,
- y además dejamos al proyecto con una primera capa bastante más seria de builds limpios que al comienzo del bloque.

Eso ya tiene muchísimo valor.

Pero ahora aparece otra pregunta muy natural:

**si ya estamos refinando cómo construimos imágenes, cuándo empieza a tener sentido mirar no solo qué construimos, sino también cómo aprovechar mejor el cache del build para no rehacer trabajo innecesario todo el tiempo?**

Ese es el terreno de esta clase.

Porque una cosa es tener un Dockerfile más limpio.

Y otra bastante distinta es empezar a preguntarse:

- cuánto trabajo se repite de más en cada reconstrucción,
- qué capas cambian seguido y cuáles no,
- y cómo ordenar mejor el Dockerfile para que Docker pueda reutilizar más del trabajo previo.

Ese es exactamente el siguiente problema que conviene abrir ahora.

---

## Objetivo de esta clase

Al terminar esta clase debería quedar:

- claro por qué el caching del build ya importa en este punto del proyecto,
- entendida la diferencia entre “build correcto” y “build razonablemente eficiente”,
- alineado el modelo mental para empezar a ordenar mejor capas y copias en los Dockerfiles,
- y preparado el terreno para aplicar una primera mejora concreta en la próxima clase.

Todavía no vamos a optimizar todos los builds del stack.  
La meta de hoy es entender por qué este nuevo frente aparece exactamente ahora.

---

## Estado de partida

Partimos de un sistema donde ya:

- varias imágenes importantes usan multi-stage build,
- el contexto de construcción ya empezó a limpiarse,
- y el proyecto ya depende bastante de reconstrucciones de imágenes como parte real del trabajo sobre NovaMarket.

Eso significa que el problema ya no es solo:

- “cómo construir una imagen limpia”
- o
- “cómo evitar meter ruido innecesario al contexto”

Ahora empieza a importar otra pregunta:

- **cómo evitar rehacer demasiado trabajo cuando solo cambian partes pequeñas del servicio**

Y esa pregunta cambia bastante el nivel del módulo.

---

## Qué vamos a construir hoy

En esta clase vamos a:

- revisar qué significa realmente el cache de build en Docker,
- entender por qué un Dockerfile puede aprovecharlo mejor o peor,
- conectar esta idea con el estado actual de NovaMarket,
- y dejar clara la lógica del siguiente subtramo del roadmap operativo.

---

## Qué problema queremos resolver exactamente

Hasta ahora ya logramos algo importante:

- el proyecto empezó a construir imágenes más limpias y más profesionales.

Eso fue un gran salto.

Pero a medida que el bloque madura, aparece otra necesidad muy concreta:

**que reconstruir imágenes no implique rehacer innecesariamente capas pesadas cada vez que tocamos algo pequeño del código.**

Porque ahora conviene hacerse preguntas como:

- ¿cada cambio en un archivo fuente obliga a reinstalar o recompilar demasiado?
- ¿el orden de `COPY` en el Dockerfile favorece o rompe el cache?
- ¿cómo separo mejor lo que cambia poco de lo que cambia mucho?
- ¿qué valor práctico tiene esto en el día a día del proyecto?  

Ese cambio de enfoque es justamente el corazón de esta etapa.

---

## Qué es el cache de build en este contexto

Para esta etapa del curso, una forma útil de pensarlo es esta:

**el cache de build es la capacidad de Docker de reutilizar capas ya construidas cuando las instrucciones y los archivos relevantes no cambiaron.**

Esa idea es central.

Si Docker detecta que una etapa sigue siendo equivalente a una ya construida antes, puede reutilizarla en vez de rehacerla.

Eso ahorra trabajo, tiempo y ruido operativo.

Pero para que eso ocurra bien, el Dockerfile tiene que estar ordenado con bastante criterio.

---

## Por qué el orden del Dockerfile importa tanto

Este punto importa muchísimo.

En Docker, el orden de las instrucciones no es neutro.

Si ponés muy arriba una instrucción que cambia todo el tiempo, podés invalidar demasiadas capas y obligar al build a rehacer trabajo pesado de forma innecesaria.

En cambio, si separás mejor lo estable de lo cambiante, el cache puede ayudarte muchísimo más.

Ese matiz es una de las claves del subbloque.

---

## Qué suele pasar con un Dockerfile multi-stage todavía ingenuo

A esta altura del curso, es muy normal haber llegado a algo como:

```dockerfile
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /workspace/target/app.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
```

Esto ya es muchísimo mejor que un Dockerfile inicial.

Pero todavía puede haber una oportunidad clara de mejora:

- si copiás demasiado pronto todo `src/`, cualquier cambio pequeño en código invalida parte importante del build.

Ese tipo de observación es justamente la que empieza a importar ahora.

---

## Qué idea de mejora aparece naturalmente acá

Una de las ideas más sanas en este punto es separar mejor cosas como:

- archivos de definición de dependencias
- de
- código fuente que cambia con más frecuencia

Por ejemplo, en proyectos Maven puede tener mucho sentido:

1. copiar primero `pom.xml`
2. resolver dependencias
3. recién después copiar `src`
4. y ejecutar la compilación final

Ese patrón ayuda mucho a que cambios de código no rompan innecesariamente capas que podrían haber quedado cacheadas.

---

## Qué gana NovaMarket con este cambio

Aunque todavía no apliquemos la mejora práctica, el valor ya se puede ver con claridad.

A partir de un mejor uso del cache de build, NovaMarket puede ganar cosas como:

- reconstrucciones más rápidas,
- menos trabajo repetido,
- Dockerfiles más inteligentes,
- y una experiencia de desarrollo bastante más cómoda cuando el proyecto sigue creciendo.

Eso vuelve al bloque mucho más útil en la práctica cotidiana.

---

## Por qué este paso tiene sentido justamente ahora

Esto también importa mucho.

Si todavía no hubiéramos introducido multi-stage build ni limpiado contexto, este tema sería prematuro.

Pero ahora el proyecto ya:

- usa Docker de forma bastante seria,
- depende de reconstrucciones recurrentes,
- y ya tiene un nivel suficiente de madurez como para empezar a optimizar no solo el resultado final, sino también el camino para llegar a él.

Ese orden es muy sano.

---

## Qué todavía no estamos haciendo en esta etapa

Conviene dejar esto muy claro.

En este punto todavía no estamos:

- aplicando todavía la mejora concreta a un Dockerfile real,
- ni midiendo todavía el rendimiento exacto del build con y sin cache en todos los casos,
- ni cerrando una estrategia final de optimización del proceso de construcción.

La meta actual es mucho más concreta:

**abrir correctamente el bloque de caching del build.**

Y eso ya aporta muchísimo valor.

---

## Qué estamos logrando con esta clase

Esta clase no cambia todavía un Dockerfile, pero hace algo muy importante:

**abre explícitamente el siguiente frente lógico del módulo 9: mejorar no solo la limpieza del build, sino también su eficiencia operativa.**

Eso importa muchísimo, porque NovaMarket deja de refinar imágenes solo desde el resultado y empieza a prepararse para otra mejora clave: que el proceso de construcción también se vuelva más inteligente y más aprovechable.

---

## Qué todavía no hicimos

Todavía no:

- elegimos todavía qué servicio conviene usar como primer caso práctico,
- ni aplicamos todavía una mejora concreta de caching en un Dockerfile real.

Todo eso empieza en la próxima clase.

La meta de hoy es mucho más concreta:

**entender por qué mejorar el caching del build ya tiene sentido en NovaMarket.**

---

## Errores comunes en esta etapa

### 1. Pensar que si la imagen final quedó bien, el build ya no importa
Sí importa, y bastante.

### 2. Creer que Docker cachea “mágicamente” sin importar cómo esté escrito el Dockerfile
El orden de las instrucciones importa muchísimo.

### 3. Abrir este frente demasiado pronto
Antes de multi-stage build y `.dockerignore`, habría quedado prematuro.

### 4. Obsesionarse con microoptimizaciones sin entender primero el patrón general
En esta etapa, lo importante es ganar criterio estructural.

### 5. No ver el valor práctico del cambio
Este frente mejora mucho la experiencia real de trabajo sobre el proyecto.

---

## Resultado esperado al terminar la clase

Al terminar esta clase, deberías tener claro por qué NovaMarket ya está listo para empezar a mejorar el caching del build y por qué este paso aparece ahora como siguiente evolución natural del bloque de refinamiento de imágenes.

Eso deja perfectamente preparada la siguiente clase.

---

## Punto de control

Antes de seguir, verificá que:

- entendés qué es el cache de build,
- ves por qué el orden del Dockerfile importa tanto,
- entendés qué valor puede aportar separar mejor dependencias y código fuente,
- y sentís que el proyecto ya está listo para una primera mejora concreta en esta dirección.

Si eso está bien, ya podemos pasar a aplicarla sobre un servicio real.

---

## Qué sigue en la próxima clase

En la próxima clase vamos a reorganizar el Dockerfile de un servicio de NovaMarket para aprovechar mejor el cache del build y volver más eficientes las reconstrucciones habituales.

---

## Cierre

En esta clase entendimos por qué mejorar el caching del build ya tiene sentido en NovaMarket.

Con eso, el proyecto deja de refinar sus imágenes solo desde la limpieza del resultado final y empieza a prepararse para otra mejora muy valiosa: que el proceso de construcción también se vuelva más ordenado, más eficiente y mucho más inteligente.
