---
title: "Práctica integrada de ARG y ENV: build-time, runtime y Compose sobrescribiendo donde corresponde"
description: "Tema 91 del curso práctico de Docker: una práctica integrada donde combinás ARG para parametrizar el build, ENV para defaults de runtime y Docker Compose para sobrescribir variables en ejecución sin mezclar conceptos ni usar ARG o ENV para secretos."
order: 91
module: "Variables, ARG y ENV sin mezclar conceptos"
level: "intermedio"
draft: false
---

# Práctica integrada de ARG y ENV: build-time, runtime y Compose sobrescribiendo donde corresponde

## Objetivo del tema

En este tema vas a:

- juntar en una sola práctica varias ideas del bloque de variables
- usar `ARG` para parametrizar el build
- usar `ENV` para dejar defaults razonables en la imagen
- sobrescribir variables de runtime desde Compose cuando haga falta
- entender mucho mejor qué vive solo en build y qué llega al contenedor en ejecución
- evitar meter secretos en `ARG` o `ENV`

La idea es cerrar este bloque con una práctica concreta, para que no te queden `ARG` y `ENV` como dos instrucciones parecidas, sino como dos herramientas con responsabilidades distintas.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de un Dockerfile confuso que mezcla build y runtime
2. separar una variable de build con `ARG`
3. dejar una variable de runtime con `ENV`
4. ver cómo Compose puede sobrescribir el runtime sin tocar el Dockerfile
5. identificar qué cosas no deberían pasar ni por `ARG` ni por `ENV`
6. cerrar con una configuración mucho más clara de punta a punta

---

## Idea central que tenés que llevarte

Ya viste que `ARG` y `ENV` se parecen lo suficiente como para generar confusión.

Este tema junta lo más importante en una sola práctica con una idea muy simple:

> `ARG` sirve para decidir cómo se construye la imagen.  
> `ENV` sirve para dejar configuración disponible en la imagen y en el contenedor final.  
> Compose sirve para ajustar el runtime sin tener que reconstruir la imagen por cada cambio.

Cuando esas tres piezas se usan bien, el flujo se vuelve muchísimo más claro.

---

## Escenario del tema

Vas a imaginar una app Node simple donde querés controlar tres cosas:

- la versión base de Node con la que se construye la imagen
- un valor por defecto para el entorno de ejecución
- un puerto configurable en runtime desde Compose

Además, querés evitar dos errores típicos:

- usar `ARG` esperando que la app lo lea en runtime
- meter secretos por `ARG` o `ENV`

Este caso es muy bueno para practicar separación de responsabilidades.

---

## Primera versión: funciona, pero mezcla conceptos

Imaginá este Dockerfile:

```Dockerfile
FROM node:22

WORKDIR /app

ARG APP_ENV=production
ARG APP_PORT=3000

COPY . .

RUN npm install
RUN npm run build

CMD ["node", "dist/server.js"]
```

---

## Qué problema tiene esta versión

Puede funcionar, sí.

Pero mezcla varias cosas mal:

- usa `ARG` para valores que la app quizá necesita leer en runtime
- no deja explícito qué parte del build es parametrizable y qué parte del runtime queda disponible
- no muestra cómo Compose podría sobrescribir configuración en ejecución
- da la sensación de que `APP_ENV` y `APP_PORT` van a existir mágicamente en el contenedor final

Y ese último punto es precisamente el error clásico.

---

## Paso 1: usar `ARG` solo para build

Ahora imaginá esta mejora:

```Dockerfile
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
```

---

## Qué mejora introduce esta versión

Introduce una separación mucho más sana:

- `NODE_VERSION` solo sirve para parametrizar la imagen base
- el build puede cambiar de versión sin tocar el resto del Dockerfile
- no estás fingiendo que esa variable tiene sentido en runtime

Este es un caso muy típico y muy correcto de `ARG`:
**parametrizar el build**.

---

## Paso 2: usar `ENV` para defaults de runtime

Ahora agregá una parte pensada para ejecución:

```Dockerfile
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV APP_ENV=production
ENV APP_PORT=3000

CMD ["node", "dist/server.js"]
```

---

## Qué mejora introduce esta versión

Ahora sí estás diciendo algo claro:

- `APP_ENV` queda disponible en runtime
- `APP_PORT` queda disponible en runtime
- la app puede leer esas variables al arrancar
- ya no dependés de asumir que un `ARG` va a sobrevivir mágicamente al build

Esto vuelve mucho más explícita la diferencia entre build y runtime.

---

## Cómo se lee este Dockerfile

La lectura conceptual sería:

- `NODE_VERSION` define cómo se construye la imagen
- `APP_ENV` y `APP_PORT` definen defaults de la imagen ya construida
- el contenedor final va a ver `APP_ENV` y `APP_PORT`
- el contenedor final no tiene por qué ver `NODE_VERSION`

Eso ya es muchísimo más claro que el punto de partida.

---

## Paso 3: combinar `ARG` y `ENV` cuando tiene sentido

Ahora imaginá que querés dejar un default de runtime, pero también permitir configurarlo durante el build.

Podrías hacer esto:

```Dockerfile
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}

ARG APP_ENV=production
ENV APP_ENV=$APP_ENV

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV APP_PORT=3000

CMD ["node", "dist/server.js"]
```

---

## Qué resuelve esta combinación

Resuelve un caso muy útil:

- `ARG APP_ENV=production` deja parametrizar el valor en build
- `ENV APP_ENV=$APP_ENV` hace que ese valor persista en la imagen y exista en runtime

O sea:

- el build puede decidir el valor
- el runtime lo recibe como default

Esta combinación es muy útil cuando querés flexibilidad, pero sin mezclar propósitos.

---

## Paso 4: sobrescribir runtime desde Compose

Ahora imaginá este `compose.yaml`:

```yaml
services:
  app:
    build:
      context: .
      args:
        NODE_VERSION: "22"
        APP_ENV: "production"
    environment:
      APP_ENV: "staging"
      APP_PORT: "4000"
    ports:
      - "4000:4000"
```

---

## Cómo se lee este Compose

La lectura conceptual sería:

- `build.args` parametriza el build
- `environment` configura el runtime del contenedor
- `APP_ENV=production` pudo servir como valor por defecto en la imagen
- pero Compose lo sobrescribe a `staging` en ejecución
- `APP_PORT` también queda definido en runtime por Compose

Esto muestra algo muy importante:

> el Dockerfile puede dar defaults,  
> pero Compose puede ajustar el runtime sin obligarte a reconstruir la imagen.

---

## Qué gana este enfoque

Gana varias cosas a la vez:

- build-time y runtime quedan claramente separados
- los defaults viven en la imagen
- los cambios del entorno de ejecución viven en Compose
- ya no necesitás hacer una imagen distinta por cada entorno solo para cambiar un valor de runtime

Esto hace el flujo muchísimo más mantenible.

---

## Stack final de la práctica

Un resultado integrado y razonable podría quedar así:

### Dockerfile

```Dockerfile
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}

ARG APP_ENV=production
ENV APP_ENV=$APP_ENV

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV APP_PORT=3000

CMD ["node", "dist/server.js"]
```

### compose.yaml

```yaml
services:
  app:
    build:
      context: .
      args:
        NODE_VERSION: "22"
        APP_ENV: "production"
    environment:
      APP_ENV: "staging"
      APP_PORT: "4000"
    ports:
      - "4000:4000"
```

---

## Cómo se lee el resultado final

La lectura conceptual sería:

- `NODE_VERSION` solo influye en la construcción
- `APP_ENV` tiene un default en la imagen, pero Compose lo sobrescribe en runtime
- `APP_PORT` también tiene un default en la imagen, pero Compose define el valor real de ejecución
- la imagen no necesita cambiar solo porque cambie el entorno donde la corrés

Este es un patrón muy sano para muchas apps reales.

---

## Qué pasa con los secretos

En esta práctica no pusimos secretos por una razón muy importante:

- no deberías pasar secretos por `ARG`
- ni tampoco por `ENV` del Dockerfile

Si tuvieras algo como:

```Dockerfile
ARG DB_PASSWORD=supersecreto
```

o:

```Dockerfile
ENV DB_PASSWORD=supersecreto
```

estarías entrando justo en lo que Docker desaconseja.

La regla sana del tema es:

- build-time normal → `ARG`
- runtime normal → `ENV` o Compose
- secretos → mecanismos de secrets, no estas instrucciones

---

## Un error muy común que esta práctica evita

Uno de los errores más comunes es este:

```Dockerfile
ARG APP_PORT=3000
CMD ["node", "dist/server.js"]
```

y después esperar que la app lea `APP_PORT` en runtime.

Ese valor solo existió en build, salvo que vos lo hayas pasado explícitamente a un `ENV` o a otra forma persistente.

La práctica de este tema existe justamente para corregir esa intuición equivocada.

---

## Qué no tenés que confundir

### `build.args` no es lo mismo que `environment`
Uno afecta la construcción; el otro, la ejecución.

### Un `ENV` del Dockerfile no siempre es el valor final del contenedor
Compose puede sobrescribirlo.

### Un `ARG` no se vuelve variable de runtime por arte de magia
Si querés eso, tenés que transferirlo explícitamente.

### Un secreto no deja de ser secreto solo porque “era para build”
No debería ir por `ARG` ni `ENV`.

---

## Error común 1: usar `ARG` para cosas que la app necesita leer al arrancar

Ahí normalmente querías `ENV` o una variable puesta por Compose en runtime.

---

## Error común 2: usar `ENV` para cosas que solo importaban durante el build

Eso deja persistente algo que quizá ni hacía falta dejar en la imagen.

---

## Error común 3: meter la misma variable en todos lados sin criterio

A veces termina en una mezcla difícil de razonar entre Dockerfile, Compose y shell local.

---

## Error común 4: pasar secretos por `ARG` o `ENV` “porque era más fácil”

Eso justo es lo que Docker desaconseja.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará estas dos líneas:

```Dockerfile
ARG APP_PORT=3000
ENV APP_PORT=3000
```

Respondé con tus palabras:

- cuál solo sirve para build
- cuál queda en runtime
- cuál usarías si la app necesita leer `APP_PORT` al arrancar
- cuál usarías si solo querés parametrizar una instrucción de build

### Ejercicio 2
Mirá este resultado integrado:

```Dockerfile
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}

ARG APP_ENV=production
ENV APP_ENV=$APP_ENV

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV APP_PORT=3000

CMD ["node", "dist/server.js"]
```

```yaml
services:
  app:
    build:
      context: .
      args:
        NODE_VERSION: "22"
        APP_ENV: "production"
    environment:
      APP_ENV: "staging"
      APP_PORT: "4000"
    ports:
      - "4000:4000"
```

Respondé:

- qué valor se usa en build para `NODE_VERSION`
- qué valor queda como default de imagen para `APP_ENV`
- qué valor termina viendo el contenedor en runtime para `APP_ENV`
- qué valor termina viendo el contenedor en runtime para `APP_PORT`
- por qué esto te parece más claro que mezclar todo en un solo tipo de variable

### Ejercicio 3
Respondé además:

- por qué `APP_ENV` puede tener sentido como combinación `ARG + ENV`
- por qué `APP_PORT` podría definirse tranquilamente solo con `ENV` + Compose
- por qué no pondrías un secreto como `DB_PASSWORD` en ninguna de estas dos instrucciones

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué valor hoy solo importa en build
- qué valor hoy sí tiene que existir en runtime
- qué variable hoy estás declarando en el lugar incorrecto
- si el Dockerfile hoy da defaults que luego Compose sobrescribe
- qué secreto o dato sensible deberías sacar de inmediato de `ARG` o `ENV`
- qué cambio concreto harías primero para aclarar mejor la configuración

No hace falta escribir todavía el Dockerfile final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre build.args, ENV del Dockerfile y environment de Compose?
- ¿en qué proyecto tuyo hoy estás mezclando build-time con runtime?
- ¿qué variable te convendría sacar de `ENV` y pasar a `ARG`?
- ¿qué variable te convendría sacar de `ARG` y pasar a runtime?
- ¿qué mejora concreta te gustaría notar después de ordenar mejor esta parte?

Estas observaciones valen mucho más que memorizar ejemplos sueltos.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si una variable solo sirve para construir la imagen, probablemente me conviene usar ________.  
> Si una variable tiene que vivir en el contenedor final, probablemente me conviene usar ________.  
> Si quiero dejar un default en la imagen pero sobrescribirlo al correr el servicio, probablemente me conviene combinar el Dockerfile con ________.  
> Si el valor es secreto, probablemente no debería usar ni ________ ni ________.

Y además respondé:

- ¿por qué esta práctica te parece mucho más clara de punta a punta?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no mezclar build-time, runtime y secretos en el mismo lugar?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar `ARG`, `ENV` y Compose en una misma práctica sin mezclar conceptos
- distinguir mejor build-time, defaults de imagen y runtime efectivo
- entender que Compose puede sobrescribir el runtime sin reconstruir la imagen
- usar `ARG + ENV` cuando el caso realmente lo justifique
- evitar meter secretos en instrucciones que no corresponden

---

## Resumen del tema

- `ARG` sirve para parametrizar el build y no vive por defecto en el contenedor final.
- `ENV` persiste en la imagen y existe en runtime.
- `ARG` puede parametrizar `FROM` y otras instrucciones de build.
- `ARG + ENV` es una combinación útil cuando querés hacer configurable en build algo que también debe persistir como default de runtime.
- Compose puede sobrescribir valores de runtime definidos en `ENV`.
- Ni `ARG` ni `ENV` son un lugar correcto para secretos.
- Esta práctica te deja una forma mucho más clara de configurar imágenes y contenedores sin mezclar responsabilidades.

---

## Próximo tema

En el próximo bloque vas a empezar a moverte hacia otra capa muy importante del trabajo real con Docker:

- bind mounts
- named volumes
- persistencia
- desarrollo con código montado
- y cómo elegir mejor dónde viven tus datos y tus archivos de trabajo
