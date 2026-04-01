---
title: "Qué queda dentro de la imagen y qué se inyecta en runtime: evitá imágenes rígidas y confusiones de configuración"
description: "Tema 52 del curso práctico de Docker: cómo distinguir lo que conviene dejar dentro de la imagen de lo que conviene inyectar en runtime, evitando imágenes demasiado rígidas y entendiendo mejor la diferencia entre ARG, ENV y environment."
order: 52
module: "Imágenes propias y flujos más cercanos a despliegue"
level: "intermedio"
draft: false
---

# Qué queda dentro de la imagen y qué se inyecta en runtime: evitá imágenes rígidas y confusiones de configuración

## Objetivo del tema

En este tema vas a:

- entender qué cosas conviene dejar dentro de la imagen
- entender qué cosas conviene inyectar recién en runtime
- distinguir mejor `ARG`, `ENV` y `environment`
- evitar imágenes demasiado rígidas
- construir un criterio más sano para configurar servicios propios

La idea es que no conviertas la imagen en una especie de “caja cerrada” con demasiadas decisiones quemadas adentro.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. distinguir build-time y run-time
2. pensar qué configuración pertenece a cada etapa
3. comparar `ARG`, `ENV` y `environment`
4. entender qué decisiones vuelven rígida a una imagen
5. construir una regla simple para diseñar mejor tus servicios

---

## Idea central que tenés que llevarte

No toda configuración pertenece al mismo momento.

Hay cosas que tienen sentido al construir la imagen.
Y hay cosas que tienen más sentido recién cuando el contenedor va a correr.

Dicho simple:

- lo que define la **forma de la imagen** suele pertenecer al build
- lo que define el **comportamiento del contenedor en un entorno concreto** suele pertenecer al runtime

Entender esa diferencia te ayuda muchísimo a no mezclar conceptos.

---

## Por qué este tema importa tanto

Cuando empezás a construir imágenes propias, es muy común caer en alguno de estos extremos:

- meter demasiada configuración adentro de la imagen
- tratar todo como variable de runtime
- usar `ARG`, `ENV` y `environment` como si fueran intercambiables
- terminar con imágenes poco reutilizables o muy acopladas a un solo entorno

Este tema existe para evitar eso.

---

## Recordatorio rápido del tema anterior

En el tema 51 viste que:

- `ARG` sirve para parametrizar el build
- `build.args` permite pasar valores desde Compose al Dockerfile
- `ARG` no es lo mismo que `ENV`
- los build args no son buena idea para secretos

Ahora toca subir un escalón más:
decidir **qué cosas tiene sentido dejar dentro de la imagen y cuáles no**.

---

## Build-time vs run-time

Esta es la gran separación del tema.

### Build-time
Es el momento en que se construye la imagen.

Acá suelen vivir decisiones como:

- qué base usar
- qué archivos copiar
- qué dependencias instalar
- qué variante del build aplicar

### Run-time
Es el momento en que corre el contenedor.

Acá suelen vivir decisiones como:

- a qué base conectarse
- qué puerto publicar
- qué modo de entorno usar
- qué credenciales o configuración concreta necesita el servicio para este despliegue

Confundir estas dos etapas vuelve todo más raro.

---

## Qué cosas suele tener sentido dejar dentro de la imagen

En general, conviene dejar dentro de la imagen cosas que definan la estructura del servicio de forma más estable.

Por ejemplo:

- archivos de la aplicación
- dependencias instaladas
- binarios necesarios
- comandos por defecto razonables
- configuraciones base que deberían viajar con la imagen
- defaults técnicos que tienen sentido casi siempre

Pensalo así:

> si una decisión debería acompañar a la imagen a cualquier entorno, probablemente tenga sentido dejarla en la imagen.

---

## Qué cosas suele tener sentido inyectar en runtime

En general, conviene inyectar en runtime cosas que dependen del entorno o del despliegue concreto.

Por ejemplo:

- credenciales
- host de base de datos
- flags de entorno
- puertos publicados
- URLs externas
- niveles de log
- modos dev/test/prod
- configuración que cambia entre entornos

Pensalo así:

> si una decisión puede variar entre desarrollo, testing o producción, normalmente conviene inyectarla en runtime.

---

## Dónde entra ARG en esta historia

`ARG` vive del lado del build.

Sirve para parametrizar cómo se construye la imagen.

Por ejemplo:

- elegir una variante de imagen base
- insertar una versión durante el build
- condicionar un paso de construcción
- marcar una variante del artefacto final

Eso puede ser muy útil, pero no significa automáticamente que esa información pertenezca al contenedor final.

---

## Dónde entra ENV en esta historia

`ENV` queda del lado de la imagen o del contenedor final.

En la práctica, te sirve para definir variables de entorno persistentes dentro de la imagen.

Eso puede ser muy útil para defaults razonables.

Por ejemplo:

- `PATH`
- una ruta base
- una configuración interna que casi siempre querés presente
- un default técnico estable

Pero si abusás de `ENV`, podés dejar la imagen demasiado rígida.

---

## Dónde entra environment en Compose

`environment` es una forma muy clara de inyectar variables al contenedor en runtime desde el stack.

Por ejemplo:

```yaml
services:
  api:
    environment:
      APP_ENV: production
      DB_HOST: db
      DB_NAME: appdb
```

Esto ya cae del lado de ejecución.

No está decidiendo cómo se construye la imagen.
Está decidiendo cómo corre el servicio en este entorno.

---

## Regla práctica muy útil

Podés pensar así:

### Si cambia cómo se construye la imagen
Probablemente `ARG`.

### Si querés un default dentro de la imagen
Probablemente `ENV`.

### Si querés una configuración dependiente del entorno
Probablemente `environment` en Compose.

Esta regla sola ya te evita un montón de decisiones malas.

---

## Un ejemplo sano

Imaginá este Dockerfile:

```Dockerfile
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NODE_ENV=production
CMD ["npm", "start"]
```

Y este `compose.yaml`:

```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NODE_VERSION: "22"
    environment:
      DB_HOST: db
      DB_NAME: appdb
      DB_USER: postgres
      DB_PASSWORD: mysecretpassword
```

### Cómo se lee
- `NODE_VERSION` afecta el build de la imagen
- `NODE_ENV=production` queda como default dentro de la imagen
- `DB_HOST`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` se inyectan al contenedor según el entorno

Esto ya refleja una separación bastante sana.

---

## Un ejemplo rígido y menos sano

Ahora imaginá algo así:

```Dockerfile
ENV DB_HOST=db
ENV DB_NAME=appdb
ENV DB_USER=postgres
ENV DB_PASSWORD=mysecretpassword
```

### Qué problema tiene
La imagen queda demasiado atada a un entorno concreto.

Capaz en tu entorno local esto funciona.
Pero cuando quieras cambiar:

- host
- credenciales
- base
- entorno

vas a tener que reconstruir o pelearte más de la cuenta con algo que podría haberse dejado flexible.

---

## Qué cosas conviene no “hornear” demasiado

Conviene tener cuidado especial con cosas como:

- credenciales
- endpoints externos
- configuración muy dependiente del entorno
- modos locales o de desarrollo
- valores que cambian seguido entre entornos

Hornear eso dentro de la imagen te hace perder flexibilidad.

---

## Qué cosas sí pueden ser buenos defaults en la imagen

No toda variable dentro de la imagen es un problema.

Puede tener mucho sentido dejar cosas como:

- un `PATH` necesario
- una carpeta de trabajo
- un `NODE_ENV=production` como default base
- una ruta de datos por defecto
- configuración interna de tooling

La clave no es “nunca usar ENV”.
La clave es no usarlo para todo.

---

## Un criterio muy valioso

Preguntate esto:

> “Si mañana corro esta misma imagen en otro entorno, ¿este valor debería seguir siendo el mismo?”

### Si la respuesta es “sí, casi seguro”
Puede tener sentido dejarlo en la imagen.

### Si la respuesta es “no, depende del entorno”
Conviene dejarlo para runtime.

Esta pregunta suele ser sorprendentemente útil.

---

## Qué pasa si querés sobreescribir un ENV en runtime

Docker permite que variables inyectadas en runtime sobrescriban defaults definidos en la imagen.

Eso hace que `ENV` pueda ser una base razonable, siempre que no conviertas ese default en algo excesivamente rígido.

En la práctica, esto te permite pensar:

- la imagen trae defaults razonables
- el entorno puede ajustarlos cuando haga falta

Ese equilibrio suele ser bastante sano.

---

## Qué no conviene usar para secretos

Ya viste algo importante en el tema anterior, y acá conviene reforzarlo:

- no conviene usar `ARG` para secretos
- tampoco conviene confiar ciegamente en `ENV` para hornear secretos dentro de la imagen

La idea general para este curso es:
si algo es sensible, conviene tratarlo como configuración de entorno o, en flujos más avanzados, con mecanismos más adecuados como secrets.

---

## Qué no tenés que confundir

### `ARG` no es un reemplazo de `environment`
Uno afecta el build.
El otro afecta la ejecución.

### `ENV` no significa automáticamente “mala práctica”
Puede ser muy útil si deja defaults sanos.

### Runtime no significa “todo desde Compose”
También puede venir de otras formas de ejecución, pero en Compose `environment` es una de las más claras.

### Una imagen flexible no es una imagen vacía
Puede tener defaults razonables sin estar atada a un solo entorno.

---

## Error común 1: meter toda la configuración en ENV del Dockerfile

Eso suele dejar la imagen demasiado acoplada.

---

## Error común 2: usar ARG para algo que en realidad cambia por entorno

Si cambia entre dev/test/prod, probablemente no pertenece al build.

---

## Error común 3: dejar una imagen sin ningún default útil por miedo a rigidizarla

Una cosa es flexibilidad.
Otra es falta total de criterio base.

---

## Error común 4: no pensar si un valor debería viajar con la imagen o con el despliegue

Ese es exactamente el tipo de decisión que este tema quiere que empieces a tomar mejor.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Leé este Dockerfile:

```Dockerfile
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NODE_ENV=production
CMD ["npm", "start"]
```

### Ejercicio 2
Leé este `compose.yaml`:

```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NODE_VERSION: "22"
    environment:
      DB_HOST: db
      DB_NAME: appdb
      DB_USER: postgres
      DB_PASSWORD: mysecretpassword
```

### Ejercicio 3
Respondé con tus palabras:

- qué cosa pertenece al build
- qué cosa pertenece al runtime
- por qué `NODE_VERSION` tiene sentido como `ARG`
- por qué `DB_HOST` tiene más sentido como `environment`

### Ejercicio 4
Ahora imaginá que alguien mueve `DB_HOST` y `DB_PASSWORD` al Dockerfile como `ENV`.

Respondé:

- qué problema potencial aparece
- por qué eso vuelve más rígida a la imagen
- en qué casos podría ser incómodo después

---

## Segundo ejercicio de análisis

Pensá en uno de tus servicios propios y respondé:

- qué decisión del build te gustaría parametrizar con `ARG`
- qué default técnico dejarías en `ENV`
- qué configuración del entorno dejarías para `environment`
- qué valor sensible evitarías meter en la imagen
- qué parte de tu servicio hoy te parece más rígida de lo que debería

No hace falta escribir todavía el archivo final completo.
La idea es refinar el criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre “imagen” y “despliegue”?
- ¿qué tipo de variable te parece mejor candidata para runtime?
- ¿en qué proyecto tuyo te ayudaría más esta distinción?
- ¿qué error te parece más fácil cometer cuando arrancás a construir imágenes propias?
- ¿qué parte del tema te ayuda más a no rigidizar servicios sin darte cuenta?

Estas observaciones valen mucho más que repetir definiciones.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si un valor define cómo se construye la imagen, probablemente me conviene ________.  
> Si un valor debería viajar como default razonable dentro de la imagen, probablemente me conviene ________.  
> Si un valor cambia según el entorno donde corre el contenedor, probablemente me conviene ________.

Y además respondé:

- ¿por qué una imagen demasiado rígida se vuelve incómoda?
- ¿qué ventaja te da separar build y runtime?
- ¿qué servicio tuyo te gustaría revisar con este criterio?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir con más claridad qué dejar dentro de la imagen y qué inyectar en runtime
- usar mejor `ARG`, `ENV` y `environment`
- evitar imágenes demasiado acopladas a un único entorno
- construir servicios más flexibles y mantenibles
- tomar decisiones mucho más sanas entre build y ejecución

---

## Resumen del tema

- No toda configuración pertenece al mismo momento: build y runtime resuelven problemas distintos.
- `ARG` tiene sentido para parametrizar la construcción.
- `ENV` puede servir para defaults razonables dentro de la imagen.
- `environment` es una forma clara de inyectar configuración dependiente del entorno en runtime.
- Separar bien estas capas evita imágenes rígidas y stacks difíciles de mover entre entornos.
- Este tema te deja con un criterio mucho más maduro para construir servicios propios.

---

## Próximo tema

En el próximo tema vas a seguir avanzando hacia builds más completos y reutilizables:

- multi-stage builds dentro de servicios Compose
- por qué reducen tamaño y mejoran prolijidad
- cómo separar build y runtime incluso dentro del Dockerfile
- y cómo eso mejora muchísimo tus imágenes
