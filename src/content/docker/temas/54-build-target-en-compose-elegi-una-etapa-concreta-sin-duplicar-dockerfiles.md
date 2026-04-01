---
title: "Build target en Compose: elegí una etapa concreta sin duplicar Dockerfiles"
description: "Tema 54 del curso práctico de Docker: cómo usar build.target en Docker Compose para construir una etapa específica de un Dockerfile multi-stage, creando variantes de desarrollo o producción sin duplicar archivos innecesariamente."
order: 54
module: "Imágenes propias y flujos más cercanos a despliegue"
level: "intermedio"
draft: false
---

# Build target en Compose: elegí una etapa concreta sin duplicar Dockerfiles

## Objetivo del tema

En este tema vas a:

- entender qué es un build target
- usar `build.target` dentro de Compose
- elegir una etapa concreta de un Dockerfile multi-stage
- evitar duplicar Dockerfiles para variantes simples
- empezar a separar mejor desarrollo y producción dentro del mismo build

La idea es que ganes más control sobre un Dockerfile multi-stage sin tener que crear archivos casi iguales para cada caso.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. recordar qué es un multi-stage build
2. ver qué significa construir una etapa específica
3. usar `build.target` en Compose
4. pensar un Dockerfile con etapa de desarrollo y etapa final
5. entender cuándo esta técnica te simplifica muchísimo el proyecto

---

## Idea central que tenés que llevarte

Un Dockerfile multi-stage puede tener varias etapas útiles, por ejemplo:

- `build`
- `dev`
- `production`

Pero no siempre querés llegar hasta la última.

A veces te conviene construir una etapa intermedia.

Dicho simple:

> `build.target` te permite decirle a Compose  
> “de este Dockerfile multi-stage, construime esta etapa concreta”.

Eso te da mucha flexibilidad sin duplicar Dockerfiles.

---

## Recordatorio rápido del tema anterior

En el tema 53 viste que:

- un multi-stage build usa múltiples `FROM`
- cada etapa puede tener una responsabilidad distinta
- la etapa final suele ser la imagen que terminás usando
- Compose puede construir sin problema un Dockerfile multi-stage

Ahora toca una capacidad muy útil:

- no quedarte siempre con la etapa final
- elegir una etapa específica cuando te conviene

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker indica que en un Dockerfile multi-stage podés detener el build en una etapa concreta usando `--target`, y lo presenta como útil para depurar una etapa, usar una variante `debug`, o construir una etapa `testing` distinta de la final. También muestra que las etapas pueden nombrarse con `AS <NAME>`, lo que vuelve más robusto el archivo. La referencia oficial de Compose Build documenta además el atributo `target` dentro de `build`, que sirve precisamente para seleccionar qué etapa del multi-stage build querés construir desde el servicio Compose. Y la referencia de `docker buildx build` remarca que, si no especificás target, se construye la etapa por defecto, que normalmente es la última. citeturn764062view1turn764062view0turn764062view2

---

## Qué es un build target

Un build target es una etapa específica de un Dockerfile multi-stage que elegís como resultado del build.

Por ejemplo, si tu Dockerfile tiene esto:

```Dockerfile
FROM node:22 AS dev
...
FROM nginx:latest AS production
...
```

podrías decidir construir:

- `dev`
- o `production`

según el caso.

Eso evita que siempre termines en la etapa final obligatoriamente.

---

## Por qué esto es tan útil

Porque no siempre querés la misma variante de imagen.

Por ejemplo:

### En desarrollo
tal vez querés una imagen con más herramientas, hot reload o utilidades extra.

### En producción
querés una imagen más chica y limpia.

Con `target`, podés sacar ambas variantes del mismo Dockerfile.

---

## Un ejemplo simple de Dockerfile multi-stage

Imaginá este Dockerfile:

```Dockerfile
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22 AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

FROM nginx:latest AS production
COPY --from=build /app/dist /usr/share/nginx/html
```

---

## Cómo se lee este Dockerfile

### Etapa `build`
genera los archivos compilados.

### Etapa `dev`
está pensada para trabajar en desarrollo.

### Etapa `production`
usa Nginx y copia solo el resultado final.

Esto te da tres puntos posibles de interés dentro del mismo archivo.

---

## Qué pasaría si no elegís target

Si no elegís ninguna etapa, el build termina en la etapa final del Dockerfile.

En este ejemplo, la etapa final sería:

```text
production
```

La documentación oficial de Docker deja claro que, si no especificás `--target`, se construye la etapa por defecto, que es la final. citeturn764062view1turn764062view2

---

## Qué pasaría si elegís target=dev

En ese caso, el build se detendría en la etapa `dev` y la imagen resultante sería la de esa etapa, no la `production`.

Ahí está el poder real del target.

---

## Cómo se expresa esto en Compose

La forma detallada de `build` te permite hacer algo así:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: dev
```

La Compose Build Specification documenta `target` como uno de los atributos posibles del bloque `build`. citeturn764062view0

---

## Qué significa este ejemplo

La lectura conceptual sería:

- el servicio `app` se construye desde este Dockerfile
- el Dockerfile tiene varias etapas
- Compose no quiere la etapa final
- Compose quiere específicamente la etapa `dev`

Esto te permite usar el mismo Dockerfile para más de una variante.

---

## Un ejemplo práctico con dos servicios o dos configuraciones

Mirá este caso:

```yaml
services:
  app-dev:
    build:
      context: .
      dockerfile: Dockerfile
      target: dev
    image: miusuario/app:dev

  app-prod:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    image: miusuario/app:prod
```

---

## Cómo se lee este ejemplo

- ambos servicios usan el mismo Dockerfile
- `app-dev` construye la etapa `dev`
- `app-prod` construye la etapa `production`
- las imágenes quedan diferenciadas por target y por tag

Esto ya se parece bastante a una organización seria y muy flexible.

---

## Cuándo conviene muchísimo usar target

Conviene mucho cuando:

- querés una variante `dev` y otra `production`
- querés una etapa `debug`
- querés una etapa `test`
- querés evitar duplicar Dockerfiles casi iguales
- querés mantener una única fuente de verdad para el build

La documentación oficial justamente enumera casos como debug y testing entre los usos naturales de `--target`. citeturn764062view1

---

## Qué ventaja tiene frente a duplicar Dockerfiles

Si no usás target, podrías caer en algo así:

- `Dockerfile.dev`
- `Dockerfile.prod`

Eso a veces es válido, pero muchas veces termina duplicando demasiada lógica.

Con `target`, podés mantener:

- una sola historia del build
- una sola fuente de verdad
- menos duplicación
- menos riesgo de que los Dockerfiles se desalineen

---

## Qué papel juegan los nombres de etapa

Los nombres de etapa son clave para que esto sea legible.

Por ejemplo:

```Dockerfile
FROM node:22 AS dev
...
FROM nginx:latest AS production
```

La documentación oficial de Docker recomienda nombrar etapas porque eso hace el Dockerfile más robusto y más fácil de mantener. citeturn764062view1

Sin nombres claros, usar target sería mucho menos cómodo.

---

## Qué relación tiene esto con Compose y entornos

Acá aparece algo muy interesante.

Podés combinar `build.target` con:

- overrides
- profiles
- nombres de imagen distintos
- stacks de desarrollo y producción

Por ejemplo, podrías tener:

### en desarrollo
```yaml
target: dev
```

### en producción
```yaml
target: production
```

sin cambiar de Dockerfile.

Esto encaja perfecto con todo lo que ya viste sobre stacks flexibles en Compose.

---

## Qué no tenés que confundir

### target no reemplaza al multi-stage build
Lo aprovecha.

### target no significa “otra app”
Sigue siendo el mismo servicio o imagen base, solo que terminada en otra etapa.

### Usar target no obliga a crear dos servicios separados
Podés usarlo también con overrides o distintos archivos Compose.

### La etapa final sigue existiendo aunque no la uses siempre
Simplemente a veces te conviene cortar antes.

---

## Error común 1: hacer un multi-stage build y después no usar target nunca aunque tengas una etapa útil de dev o debug

A veces ya tenés esa flexibilidad en el Dockerfile y no la estás aprovechando.

---

## Error común 2: duplicar Dockerfiles cuando una sola diferencia era elegir otra etapa

Eso puede volverse mantenimiento innecesario.

---

## Error común 3: no nombrar etapas claramente

Capaz al principio parece menor, pero después hace el archivo mucho menos legible.

---

## Error común 4: olvidar que si no elegís target, se construye la etapa final

Conviene tener eso siempre presente al leer un Dockerfile multi-stage.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Leé este Dockerfile:

```Dockerfile
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22 AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

FROM nginx:latest AS production
COPY --from=build /app/dist /usr/share/nginx/html
```

### Ejercicio 2
Respondé con tus palabras:

- qué hace la etapa `build`
- qué hace la etapa `dev`
- qué hace la etapa `production`
- cuál sería la etapa final por defecto si no elegís target

### Ejercicio 3
Ahora mirá este `compose.yaml`:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: dev
    image: miusuario/app:dev
```

Y respondé:

- qué etapa va a construir Compose
- por qué eso es útil en desarrollo
- qué ventaja te da respecto a usar siempre la etapa final

### Ejercicio 4
Ahora imaginá esta variante:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    image: miusuario/app:prod
```

Respondé:

- qué cambia respecto al ejemplo anterior
- por qué este target tiene más sentido para una imagen final de despliegue
- por qué ambos ejemplos pueden convivir con el mismo Dockerfile

---

## Segundo ejercicio de análisis

Pensá en uno de tus servicios propios y respondé:

- si tendría sentido una etapa `dev`
- si tendría sentido una etapa `production`
- si te serviría una etapa `debug` o `test`
- qué parte del build duplicás hoy y podrías unificar con targets
- por qué esto te ayudaría a mantener mejor el proyecto

No hace falta escribir todavía el archivo final completo.
La idea es empezar a pensar la estrategia.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre “tener varias etapas” y “elegir una etapa concreta”?
- ¿qué servicio tuyo se beneficiaría más de tener target `dev` y `production`?
- ¿por qué te parece más limpio esto que duplicar Dockerfiles?
- ¿qué parte del Dockerfile te gustaría volver más explícita con nombres de etapa?
- ¿en qué momento sentís que Compose ya está entrando en un nivel bastante profesional?

Estas observaciones valen mucho más que memorizar una clave del YAML.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si tengo un Dockerfile multi-stage y quiero construir una etapa concreta desde Compose, probablemente me conviene usar ________.  
> Si no especifico ninguna etapa, Docker construye la etapa ________.

Y además respondé:

- ¿por qué `target` te ayuda a no duplicar Dockerfiles?
- ¿qué tipo de etapa te gustaría agregar primero en uno de tus proyectos?
- ¿qué ventaja te da poder sacar una imagen `dev` y otra `production` del mismo archivo?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es un build target
- usar `build.target` dentro de Compose
- elegir una etapa específica de un Dockerfile multi-stage
- pensar variantes `dev`, `debug`, `test` o `production` sin duplicar Dockerfiles
- producir builds mucho más flexibles y mantenibles

---

## Resumen del tema

- En un Dockerfile multi-stage, cada `FROM` inicia una nueva etapa. citeturn764062view1
- Docker permite detener el build en una etapa concreta usando `--target`, y lo presenta como útil para debug, testing o variantes específicas. citeturn764062view1
- Compose documenta `build.target` como atributo del bloque `build`. citeturn764062view0
- Si no especificás target, el build termina en la etapa final por defecto. citeturn764062view1turn764062view2
- Esta técnica te ayuda a sacar variantes de desarrollo y producción del mismo Dockerfile sin duplicar lógica.
- Este tema te da mucho más control sobre builds multi-stage dentro de Compose.

---

## Próximo tema

En el próximo tema vas a seguir avanzando hacia builds todavía más maduros:

- caché y orden de capas
- qué cambios invalidan el build
- cómo construir más rápido
- y cómo evitar Dockerfiles lentos o desordenados
