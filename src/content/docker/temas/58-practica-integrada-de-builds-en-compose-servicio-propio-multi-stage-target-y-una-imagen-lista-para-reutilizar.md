---
title: "Práctica integrada de builds en Compose: servicio propio, multi-stage, target y una imagen lista para reutilizar"
description: "Tema 58 del curso práctico de Docker: una práctica integrada donde combinás servicio propio, Dockerfile multi-stage, build target y Compose para separar desarrollo y producción sin duplicar demasiado y llegar a una imagen más prolija y reutilizable."
order: 58
module: "Imágenes propias y flujos más cercanos a despliegue"
level: "intermedio"
draft: false
---

# Práctica integrada de builds en Compose: servicio propio, multi-stage, target y una imagen lista para reutilizar

## Objetivo del tema

En este tema vas a:

- combinar varias ideas del bloque de builds en una sola práctica
- construir un servicio propio con Dockerfile multi-stage
- usar una etapa de desarrollo y otra de producción
- seleccionar la etapa adecuada desde Compose con `target`
- entender cómo pasar de un flujo cómodo de desarrollo a una imagen más lista para reutilizar

La idea es que ya no veas cada concepto aislado, sino como parte de un flujo real y coherente.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. crear un servicio propio simple
2. escribir un Dockerfile multi-stage
3. definir una etapa `dev` y una etapa `production`
4. usar Compose para construir una variante u otra con `target`
5. comparar el flujo de desarrollo con el flujo más cercano a despliegue
6. cerrar el bloque de builds con una práctica bastante realista

---

## Idea central que tenés que llevarte

A esta altura del curso ya viste muchas piezas:

- `build`
- `image`
- `context`
- `dockerfile`
- `build.args`
- multi-stage
- `target`
- bind mounts vs build

Este tema las junta en una sola práctica con una idea central muy valiosa:

> el mismo servicio puede tener un flujo cómodo de desarrollo y una imagen mucho más prolija para uso final, sin que tengas que duplicar todo el proyecto.

---

## Escenario del tema

Vas a trabajar con un servicio web simple.

La idea no es hacer una aplicación compleja, sino construir un flujo bien claro:

- una etapa `dev` para desarrollo
- una etapa `production` para un resultado más final
- un `compose.yaml` base
- y una selección de target según lo que quieras hacer

Esto te da una forma bastante profesional de pensar tus builds.

---

## Estructura de la práctica

Vas a trabajar con una estructura así:

```text
mi-servicio-build/
├── compose.yaml
├── Dockerfile
├── package.json
├── package-lock.json
└── src/
    └── index.js
```

---

## Paso 1: crear una app mínima

### package.json

```json
{
  "name": "mi-servicio-build",
  "version": "1.0.0",
  "scripts": {
    "dev": "node src/index.js",
    "build": "mkdir -p dist && cp src/index.js dist/index.js",
    "start": "node dist/index.js"
  }
}
```

### src/index.js

```javascript
console.log("Hola desde mi servicio propio en Docker Compose");
```

La idea es extremadamente simple a propósito.
Lo importante es el flujo de build, no la lógica de la app.

---

## Paso 2: escribir un Dockerfile multi-stage

Creá este `Dockerfile`:

```Dockerfile
FROM node:22 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM base AS dev
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
CMD ["npm", "run", "start"]
```

---

## Cómo se lee este Dockerfile

### Etapa `base`
- instala dependencias
- deja una base común

### Etapa `dev`
- copia todo el proyecto
- está pensada para desarrollo rápido

### Etapa `build`
- copia el proyecto
- genera `dist/`

### Etapa `production`
- usa una base más liviana
- copia solo el resultado final del build
- arranca con `npm run start`

Esto ya muestra muy bien la lógica de multi-stage:
separar responsabilidades y no dejar en la imagen final cosas que no hacen falta.

---

## Qué ventaja tiene esta estructura

Te da varias ventajas al mismo tiempo:

- no repetís toda la instalación de dependencias en cada etapa
- distinguís claramente desarrollo y producción
- la etapa final queda mucho más limpia
- el mismo Dockerfile te sirve para varios usos

Eso es exactamente el tipo de diseño que vuelve más maduro a un proyecto.

---

## Paso 3: definir Compose para la variante de desarrollo

Ahora creá un `compose.yaml` así:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: dev
    image: miusuario/mi-servicio:dev
    volumes:
      - .:/app
    command: npm run dev
```

---

## Cómo se lee esta versión

La lectura conceptual sería:

- el servicio `app` se construye desde el Dockerfile del proyecto
- Compose no quiere la etapa final, quiere la etapa `dev`
- la imagen resultante se etiqueta como `miusuario/mi-servicio:dev`
- el código del host se comparte con bind mount para iterar rápido
- el comando apunta al script de desarrollo

Esto encaja perfecto con lo que ya viste sobre:
desarrollo cómodo con mounts + uso de un target específico.

---

## Qué problema resuelve esta versión

Resuelve el flujo local de desarrollo:

- cambios rápidos
- imagen base con dependencias preparadas
- etapa pensada para desarrollo
- sin necesidad de usar la variante final de producción para todo

Esto hace que no fuerces un único tipo de imagen para tareas distintas.

---

## Paso 4: pensar una variante más cercana a producción

Ahora imaginá una versión del mismo servicio orientada a una imagen más final:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    image: miusuario/mi-servicio:prod
```

---

## Cómo se lee esta variante

- el servicio sigue saliendo del mismo Dockerfile
- ahora Compose quiere la etapa `production`
- la imagen se etiqueta con un tag más final
- ya no dependés del código del host montado en vivo
- el resultado se parece más a una imagen reutilizable o publicable

Esto ya entra bastante más en terreno de despliegue real.

---

## Qué cambió entre ambas variantes

### Variante `dev`
- target `dev`
- bind mount
- foco en iteración rápida
- comando de desarrollo

### Variante `production`
- target `production`
- sin bind mount
- foco en artefacto más limpio
- imagen pensada para correr como resultado final

Esta comparación es una de las más importantes del tema.

---

## Por qué esto es mejor que duplicar todo

Una solución menos elegante podría ser:

- un Dockerfile para dev
- otro Dockerfile para prod
- una lógica repetida
- más riesgo de que se desalineen

Con multi-stage + target:

- mantenés una sola fuente de verdad
- separás etapas dentro del mismo archivo
- elegís la salida correcta desde Compose

Eso suele ser bastante más prolijo.

---

## Un detalle útil sobre el ejemplo

En un proyecto real probablemente también querrías:

- un `.dockerignore`
- una estrategia más pensada para `node_modules`
- quizá `npm ci` en lugar de `npm install`
- y posiblemente un servicio con puertos o watchers según la app

Pero para este tema, el foco está en la arquitectura del build, no en todos los detalles de Node.

---

## Qué te enseña realmente esta práctica

Te enseña a pensar un servicio propio así:

- una misma app
- varias etapas
- varias intenciones
- una variante de desarrollo
- una variante más final
- Compose como orquestador del build correcto

Eso ya es una forma bastante madura de organizar imágenes.

---

## Qué no tenés que confundir

### `target: dev` no significa “otro servicio”
Sigue siendo la misma app, pero construida hasta otra etapa.

### Bind mount no reemplaza al build
En esta práctica conviven por una razón: el build te da entorno base y el bind mount te da velocidad de iteración.

### `target: production` no significa automáticamente “ya desplegada”
Solo significa que la imagen se construye hasta esa etapa final.

### Un Dockerfile multi-stage no obliga a usar siempre todas las etapas
Podés elegir cuál te conviene según el momento.

---

## Error común 1: querer usar siempre la etapa final también en desarrollo

Eso puede volverte el flujo más rígido o incómodo de lo necesario.

---

## Error común 2: duplicar Dockerfiles cuando la diferencia real era solo elegir otra etapa

Eso suele traer más mantenimiento del que vale la pena.

---

## Error común 3: confundir “desarrollo con mount” con “artefacto final validado”

No necesariamente estás probando la misma experiencia que tendrías con la imagen final.

---

## Error común 4: no separar bien el objetivo de cada variante

Si no definís con claridad qué resuelve `dev` y qué resuelve `production`, el Dockerfile se vuelve menos legible.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá esta estructura:

```text
mi-servicio-build/
├── compose.yaml
├── Dockerfile
├── package.json
└── src/
    └── index.js
```

### Ejercicio 2
Usá este `Dockerfile`:

```Dockerfile
FROM node:22 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM base AS dev
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
CMD ["npm", "run", "start"]
```

### Ejercicio 3
Escribí esta variante `dev` en Compose:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: dev
    image: miusuario/mi-servicio:dev
    volumes:
      - .:/app
    command: npm run dev
```

### Ejercicio 4
Respondé con tus palabras:

- qué hace la etapa `base`
- qué hace la etapa `dev`
- qué hace la etapa `build`
- qué hace la etapa `production`
- por qué `target: dev` es útil en desarrollo

### Ejercicio 5
Ahora imaginá esta variante:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    image: miusuario/mi-servicio:prod
```

Y respondé:

- qué cambia respecto a la versión `dev`
- por qué esta variante se parece más a una imagen final
- por qué ambas pueden convivir sin duplicar Dockerfiles

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué servicio propio podría beneficiarse de un Dockerfile multi-stage
- si tendría sentido una etapa `dev`
- si tendría sentido una etapa `production`
- si seguirías usando bind mount en desarrollo
- qué parte del proyecto te gustaría dejar fuera de la imagen final

No hace falta escribir el proyecto entero.
La idea es aplicar el criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre la variante `dev` y la variante `production`?
- ¿qué parte de esta práctica te parece más útil para proyectos reales?
- ¿en qué servicio tuyo te gustaría aplicar primero este enfoque?
- ¿qué te parece más elegante de usar un solo Dockerfile con varias etapas?
- ¿qué parte del flujo te hace sentir que ya estás muy cerca de algo desplegable?

Estas observaciones valen mucho más que copiar la sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero una variante cómoda para desarrollo, probablemente me conviene una etapa ________ y quizá combinarla con ________.  
> Si quiero una imagen más limpia y final, probablemente me conviene una etapa ________.

Y además respondé:

- ¿por qué este enfoque evita duplicar Dockerfiles?
- ¿qué parte del flujo te parece más profesional?
- ¿qué servicio tuyo te gustaría revisar con este criterio?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- integrar varias ideas del bloque de builds en una sola práctica
- usar un Dockerfile multi-stage con variantes claras
- elegir targets distintos según el objetivo
- combinar un target de desarrollo con bind mounts cuando tenga sentido
- producir una imagen más cercana a despliegue sin romper tu flujo local

---

## Resumen del tema

- El mismo servicio puede tener una variante de desarrollo y otra más final sin duplicar Dockerfiles.
- Multi-stage te permite separar claramente etapas con responsabilidades distintas.
- `build.target` te deja elegir la etapa adecuada desde Compose.
- Bind mounts pueden seguir teniendo sentido en desarrollo, incluso si el servicio usa un Dockerfile serio.
- La variante final puede quedarse mucho más limpia y más cercana a una imagen reutilizable.
- Este tema cierra el bloque de builds con una práctica bastante realista y coherente.

---

## Próximo tema

En el próximo bloque vas a empezar a moverte hacia una capa todavía más cercana a operación real:

- healthchecks
- readiness
- dependencia entre servicios con más criterio
- y cómo evitar stacks que “arrancan” pero todavía no están realmente listos
