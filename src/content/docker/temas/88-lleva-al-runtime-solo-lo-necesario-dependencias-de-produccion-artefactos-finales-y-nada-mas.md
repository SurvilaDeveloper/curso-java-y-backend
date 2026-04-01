---
title: "Llevá al runtime solo lo necesario: dependencias de producción, artefactos finales y nada más"
description: "Tema 88 del curso práctico de Docker: cómo limpiar mejor la etapa runtime en multi-stage builds, qué dependencias o artefactos deberían quedar solo en build, cuándo usar dependencias de producción y cómo evitar llevar tooling o archivos innecesarios a la imagen final."
order: 88
module: "Dockerfiles más mantenibles y builds más rápidas"
level: "intermedio"
draft: false
---

# Llevá al runtime solo lo necesario: dependencias de producción, artefactos finales y nada más

## Objetivo del tema

En este tema vas a:

- entender qué debería quedar realmente en la etapa runtime
- distinguir dependencias de build de dependencias de producción
- copiar solo artefactos finales en multi-stage builds
- evitar llevar tooling, fuentes o paquetes innecesarios a la imagen final
- dejar la etapa runtime más limpia, más chica y más enfocada

La idea es profundizar lo que viste en multi-stage builds para dar un paso más: no solo separar build y runtime, sino **decidir con más criterio qué merece llegar al runtime final**.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué ruido suele colarse en la imagen final
2. distinguir mejor artefactos finales vs herramientas de build
3. pensar dependencias de producción con más criterio
4. copiar solo lo imprescindible al runtime
5. construir una regla práctica para dejar imágenes finales más mínimas

---

## Idea central que tenés que llevarte

Multi-stage builds ya te permite separar etapas.

Pero eso no garantiza, por sí solo, que la imagen final quede realmente limpia.

La mejora de verdad aparece cuando te preguntás:

- ¿qué necesito para construir?
- ¿qué necesito para ejecutar?
- ¿qué no necesito más una vez terminado el build?

Docker lo repite en varias guías recientes: usá una etapa de build con tooling o variantes `dev`, y después copiá únicamente los artefactos o dependencias que realmente necesita el runtime final. Docker también remarca que las runtime images no tienen por qué contener package managers ni tooling de build, y que ese enfoque ayuda a mantener imágenes mínimas y seguras. citeturn961510search5turn961510search8turn961510search12turn961510search18turn961510search20

Dicho simple:

> build con todo lo necesario;  
> runtime con solo lo imprescindible para correr.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- Docker recomienda multi-stage builds para separar build y runtime y copiar solo los artefactos necesarios a la imagen final. citeturn961510search0turn961510search2turn961510search3
- En la guía actual de Node.js, Docker muestra una imagen “production-ready” y documenta el uso de `NODE_ENV=production`, explicando que eso hace que `npm` omita paquetes necesarios solo para desarrollo. citeturn961510search1turn961510search4
- Docker Hardened Images documenta que las runtime images no contienen package managers y que la práctica recomendada es usar una variante `dev` en build y una runtime mínima al final. citeturn961510search5turn961510search8turn961510search12turn961510search18
- Docker también destaca que las minimal or distroless images funcionan mejor cuando separás bien build-time y runtime, e incluís explícitamente solo dependencias de runtime. citeturn961510search20

---

## Primer concepto: una imagen final puede seguir quedando sucia aunque uses multi-stage

Imaginá este Dockerfile:

```Dockerfile
FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22 AS runtime
WORKDIR /app
COPY --from=build /app /app
CMD ["node", "dist/server.js"]
```

Puede funcionar.
Y sí, ya es multi-stage.

Pero tiene un problema:
estás copiando **todo** `/app` desde la etapa `build` al runtime.

Eso puede llevar al runtime cosas como:

- archivos fuente
- tooling innecesario
- dependencias de desarrollo
- configs de build
- artefactos intermedios

Multi-stage por sí solo no te salva si seguís copiando demasiado.

---

## Qué problema real trae eso

Trae varios problemas a la vez:

- imagen final más grande
- más superficie innecesaria
- más cosas que podrían no estar ahí
- menos claridad sobre qué usa realmente la app en runtime

Eso va contra el espíritu del tema 87, que justamente era separar mejor build y runtime.

---

## Segundo concepto: artefacto final no es lo mismo que proyecto completo

Una de las mejores preguntas que te podés hacer es esta:

> “¿Qué necesita realmente el contenedor final para arrancar y correr?”

A veces la respuesta es muy chica.

Por ejemplo:

- una carpeta `dist/`
- un binario compilado
- archivos estáticos finales
- dependencias de producción
- un entrypoint muy puntual

Y nada más.

Esa diferencia entre **proyecto completo** y **artefacto final** es central.

---

## Un ejemplo claro con frontend

Docker lo muestra muchísimo en sus guías de frontend: construís con Node y después servís solo los archivos estáticos finales con NGINX. citeturn961510search6turn961510search9turn961510search11

Por ejemplo:

```Dockerfile
FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
```

### Qué llega al runtime
- solo `dist/`

### Qué queda afuera
- `node_modules`
- código fuente
- tooling de build
- npm
- el runtime de Node

Eso es justamente copiar el artefacto final y nada más.

---

## Tercer concepto: dependencias de producción

En aplicaciones donde el runtime sí necesita dependencias, la pregunta cambia un poco.

Ya no es solo:

- “¿copio el binario o el dist?”

También pasa a ser:

- “¿qué dependencias necesita el runtime realmente?”

En la documentación actual de variables de build, Docker muestra explícitamente un ejemplo con:

```Dockerfile
ENV NODE_ENV=production
RUN npm ci
```

y explica que `NODE_ENV=production` hace que `npm` omita los paquetes necesarios solo para desarrollo. citeturn961510search4

Esto deja una idea muy útil:

> no todas las dependencias del proyecto merecen llegar al runtime.

---

## Un ejemplo razonable para Node

```Dockerfile
FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22 AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist /app/dist

CMD ["node", "dist/server.js"]
```

---

## Cómo se lee esta versión

### Etapa `build`
- instala todo lo necesario para compilar
- construye la app

### Etapa `runtime`
- vuelve a instalar solo dependencias de producción
- copia solo `dist/`
- no arrastra todo el árbol de build

Esta versión ya piensa mucho mejor qué merece llegar al runtime.

---

## Qué ventaja tiene reinstalar solo prod deps en runtime

Tiene varias ventajas:

- evita que dependencias de desarrollo viajen al runtime
- deja más clara la intención
- puede reducir bastante el tamaño y el ruido
- se alinea con la recomendación de dejar la etapa final más mínima y enfocada

En la documentación reciente de Node y de DHI, esta lógica aparece una y otra vez: la etapa final debería contener solo lo necesario para ejecutar. citeturn961510search1turn961510search5turn961510search12turn961510search18

---

## Cuarto concepto: el package manager no siempre debería quedar en runtime

La documentación de Docker Hardened Images lo dice de forma bastante clara: las runtime images no contienen package managers, y la recomendación es usar variantes `dev` o con tooling solo en la etapa de build. citeturn961510search8turn961510search12turn961510search18

La enseñanza útil no es “siempre eliminá el package manager cueste lo que cueste”.
La enseñanza útil es:

> si el runtime final no necesita instalar nada,  
> no hace falta que cargue con ese tooling.

Esto se ve clarísimo en:

- frontends servidos por NGINX
- binarios compilados
- imágenes runtime mínimas o hardened

---

## Quinto concepto: runtime más mínima no siempre significa distroless de entrada

Docker también documenta imágenes mínimas o distroless y recomienda separar build-time y runtime, incluyendo explícitamente solo dependencias de runtime. citeturn961510search20

Pero eso no significa que desde hoy todo tenga que terminar en distroless.

La regla sana es más simple:

- primero aprendé a separar build y runtime correctamente
- después evaluá qué tan mínimo querés hacer el runtime

Un runtime mínimo empieza por **copiar menos**, incluso aunque todavía uses una base conocida.

---

## Sexto concepto: `dev` en build, runtime mínima al final

La documentación de DHI resume una recomendación muy buena:

- usá una variante `-dev` o una imagen con tooling en build
- y una runtime mínima al final citeturn961510search5turn961510search15turn961510search17

Esta idea es muy poderosa porque ordena el problema de una forma muy práctica:

### Build
acá van compiladores, package managers, tooling.

### Runtime
acá van solo artefactos y dependencias realmente necesarias para ejecutar.

---

## Un patrón mental muy útil

Podés hacerte estas preguntas en orden:

### 1. ¿Qué usa la app para construirse?
Eso va a `build`.

### 2. ¿Qué usa la app para correr?
Eso va a `runtime`.

### 3. ¿Qué solo está presente por costumbre o porque “venía junto”?
Eso probablemente no debería llegar al runtime.

Esta secuencia suele limpiar muchísimo los Dockerfiles.

---

## Un ejemplo más fino todavía

```Dockerfile
FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist /app/dist

CMD ["node", "dist/server.js"]
```

### Qué gana esta versión
- build con entorno más cómodo
- runtime con base más acotada
- solo dependencias de producción
- solo artefacto final copiado desde build

Esto ya empieza a verse bastante más profesional.

---

## Qué no tenés que confundir

### Multi-stage no garantiza limpieza automática
Depende de qué copies al runtime.

### “Funciona” no significa “está mínima”
Puede seguir habiendo mucho ruido adentro.

### Dependencias de producción no siempre son cero dependencias
Depende del tipo de app.

### Runtime mínima no significa necesariamente distroless ya mismo
Primero importa separar bien responsabilidades.

---

## Error común 1: usar multi-stage pero copiar toda la carpeta del build al runtime

Eso deja casi la misma suciedad, solo repartida distinto.

---

## Error común 2: no distinguir dependencias de desarrollo de dependencias de producción

Eso hace que el runtime arrastre demasiado sin necesidad.

---

## Error común 3: dejar package manager y tooling de build en la imagen final porque “ya estaban ahí”

Muchas veces eso no aporta nada en runtime. citeturn961510search8turn961510search12

---

## Error común 4: intentar hacer una imagen ultramínima sin haber entendido primero qué necesita realmente el runtime

Eso suele complicar más de la cuenta.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará estos dos enfoques.

#### Opción A
```Dockerfile
FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22 AS runtime
WORKDIR /app
COPY --from=build /app /app
CMD ["node", "dist/server.js"]
```

#### Opción B
```Dockerfile
FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22 AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist /app/dist

CMD ["node", "dist/server.js"]
```

### Ejercicio 2
Respondé con tus palabras:

- cuál te parece más limpia para runtime
- por qué
- qué problema tiene copiar todo `/app`
- qué ventaja tiene copiar solo `dist/` y reinstalar solo dependencias de producción

### Ejercicio 3
Respondé además:

- cuándo el runtime final podría no necesitar ni siquiera Node o npm
- qué tipo de proyecto se beneficia mucho de eso
- qué ventaja te da separar build con tooling y runtime mínimo

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué artefacto final usaría realmente el runtime
- qué dependencias hoy solo usás para build o desarrollo
- si tu imagen final hoy está cargando con tooling que no necesita
- si una etapa runtime más mínima tendría sentido
- qué cambio concreto te gustaría probar primero

No hace falta escribir todavía el Dockerfile final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre “build completo” y “runtime mínima”?
- ¿en qué proyecto tuyo hoy estás copiando más de lo que el runtime realmente necesita?
- ¿qué dependencia de desarrollo hoy podría quedarse afuera de la imagen final?
- ¿qué valor le ves a una etapa runtime más limpia aunque siga usando una base conocida?
- ¿qué mejora concreta te gustaría notar después de aplicar esta lógica?

Estas observaciones valen mucho más que memorizar una receta de Node.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si una herramienta solo la necesito para construir, probablemente debería quedarse en la etapa de ________.  
> Si un archivo o carpeta no es necesaria para ejecutar, probablemente no debería llegar a la etapa de ________.  
> Si quiero que la imagen final cargue menos ruido, probablemente me conviene copiar solo los ________ finales y dejar solo dependencias de ________.

Y además respondé:

- ¿por qué este tema impacta tanto en tamaño, limpieza y seguridad del runtime?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no llevar tooling y dependencias de desarrollo a producción sin necesidad?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- distinguir mejor build-time de runtime
- decidir qué artefactos merecen llegar a la imagen final
- pensar dependencias de producción con más criterio
- dejar la etapa runtime más limpia y más mínima
- usar multi-stage de una forma bastante más inteligente que solo “poner dos FROM”

---

## Resumen del tema

- Docker recomienda usar multi-stage builds para separar build y runtime y copiar solo artefactos necesarios. citeturn961510search0turn961510search2turn961510search3
- La documentación actual de Node muestra que `NODE_ENV=production` hace que `npm` omita paquetes necesarios solo para desarrollo. citeturn961510search4turn961510search1
- Docker Hardened Images documenta que las runtime images no contienen package managers y que conviene usar variantes `dev` solo en build. citeturn961510search5turn961510search8turn961510search12turn961510search18
- Las imágenes mínimas o distroless funcionan mejor cuando separás bien build-time y runtime e incluís explícitamente solo dependencias de runtime. citeturn961510search20
- Este tema te deja una base mucho más madura para limpiar de verdad la etapa final y no solo “usar multi-stage” por cumplir.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una práctica integrada:

- orden de capas
- `.dockerignore`
- multi-stage
- runtime más mínima
- y un Dockerfile que ya se vea bastante más profesional de punta a punta
