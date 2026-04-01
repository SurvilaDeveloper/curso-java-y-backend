---
title: "Práctica integrada de Dockerfile profesional: capas ordenadas, .dockerignore, multi-stage y runtime mínima"
description: "Tema 89 del curso práctico de Docker: una práctica integrada donde combinás orden correcto de capas, .dockerignore, multi-stage builds y una etapa runtime mínima para construir una imagen más rápida, más limpia y más mantenible de punta a punta."
order: 89
module: "Dockerfiles más mantenibles y builds más rápidas"
level: "intermedio"
draft: false
---

# Práctica integrada de Dockerfile profesional: capas ordenadas, .dockerignore, multi-stage y runtime mínima

## Objetivo del tema

En este tema vas a:

- juntar varias ideas del bloque de Dockerfiles y builds en una sola práctica
- ordenar mejor las capas para aprovechar la caché
- usar `.dockerignore` para reducir ruido en el contexto
- separar build y runtime con multi-stage
- llevar a runtime solo artefactos finales y dependencias realmente necesarias
- terminar con un Dockerfile mucho más profesional de punta a punta

La idea es cerrar este bloque con una práctica integrada, para que no te queden conceptos aislados, sino una forma completa de escribir imágenes mejores.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. partir de un Dockerfile que funciona, pero construye y empaqueta de forma demasiado plana
2. mejorar el orden de instrucciones para proteger mejor la caché
3. reducir el contexto con `.dockerignore`
4. separar build y runtime con multi-stage
5. dejar la etapa final mucho más limpia
6. comparar el antes y el después como calidad de Dockerfile real

---

## Idea central que tenés que llevarte

Ya viste varias mejoras importantes por separado:

- ordenar capas
- reducir el contexto
- usar multi-stage
- copiar menos al runtime final

Este tema las junta con una idea muy concreta:

> un Dockerfile realmente bueno no solo “anda”,  
> también reconstruye mejor, envía menos ruido al builder y deja una imagen final mucho más limpia.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker recomienda ordenar las capas del Dockerfile de forma lógica para evitar invalidaciones innecesarias de caché, usar `.dockerignore` para excluir archivos irrelevantes del build context, y aprovechar multi-stage builds para separar build y runtime y copiar solo los artefactos necesarios a la imagen final. También documenta que `COPY` y `ADD` pueden invalidar el caché de capas posteriores, que los archivos ignorados por `.dockerignore` no existen para `COPY` o `ADD`, y que las imágenes finales deberían contener solo los artefactos o dependencias de runtime realmente necesarias. En las guías recientes de Node y React, Docker muestra justamente patrones de imagen “production-ready” basados en estas ideas. citeturn653792search0turn653792search1turn653792search2turn653792search3turn653792search4turn653792search7turn653792search20

---

## Escenario del tema

Vas a imaginar una aplicación web sencilla basada en Node que:

- necesita instalar dependencias
- compilar o construir un resultado final
- ejecutar solo el artefacto ya preparado
- no necesita llevar al runtime todo el árbol de desarrollo

Este es un caso perfecto para juntar:

- caché
- `.dockerignore`
- multi-stage
- runtime mínima

---

## Primera versión: funciona, pero es demasiado plana

Imaginá este Dockerfile:

```Dockerfile
FROM node:22
WORKDIR /app

COPY . .
RUN npm install
RUN npm run build

CMD ["npm", "start"]
```

Y ningún `.dockerignore`.

---

## Qué problema tiene esta primera versión

Puede funcionar, sí.

Pero deja varios problemas juntos:

- `COPY . .` llega demasiado temprano y rompe más caché de la necesaria
- todo el contexto entra al build, incluso ruido innecesario
- la instalación de dependencias depende de cualquier cambio del proyecto
- build y runtime quedan mezclados
- la imagen final arrastra mucho más de lo que realmente necesita

No está “rota”.
Pero todavía está muy lejos de un Dockerfile sano para el día a día.

---

## Paso 1: ordenar mejor las capas

Ahora imaginá esta mejora:

```Dockerfile
FROM node:22
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

---

## Qué mejora introduce esta versión

Introduce una mejora muy importante de caché:

- primero copia los archivos de dependencias
- después instala dependencias
- recién después copia el resto del código

Entonces, si cambia una línea del código fuente, muchas veces Docker puede reutilizar la capa de instalación de dependencias.

Esto se alinea perfecto con la recomendación oficial de ordenar capas de forma lógica y evitar invalidaciones innecesarias. citeturn653792search0turn653792search2turn653792search6

---

## Qué sigue faltando

Aunque esta versión ya usa mejor la caché, todavía hay otro problema:

> el builder sigue recibiendo demasiados archivos del contexto.

Ahí entra `.dockerignore`.

---

## Paso 2: achicar el contexto con `.dockerignore`

Ahora imaginá este archivo:

```text
node_modules
dist
.git
coverage
*.log
```

Docker documenta que `.dockerignore` sirve para excluir archivos y directorios del contexto de build y que eso reduce tanto la transferencia como el ruido que puede invalidar caché. citeturn653792search0turn653792search4turn653792search7turn653792search9

---

## Qué mejora introduce `.dockerignore`

Introduce varias mejoras juntas:

- `node_modules` local no entra al contexto
- artefactos previos como `dist` no viajan al builder
- `.git` no mete peso ni historial innecesario
- logs y cobertura tampoco entran

Esto hace que el `COPY . .` sea mucho más limpio que antes.

---

## Qué pasa si ignorás algo que después querés copiar

Docker lo documenta de forma muy clara: si un archivo coincide con `.dockerignore`, no está en el contexto del build, y si luego intentás copiarlo con `COPY` o `ADD`, el build falla. citeturn653792search1

Esa es una consecuencia importante del tema:

- `.dockerignore` no solo optimiza
- también define qué archivos existen realmente para el builder

---

## Paso 3: separar build y runtime

Ahora pasamos a multi-stage.

Mirá esta versión:

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

Docker documenta que cada `FROM` inicia una nueva etapa y que `COPY --from` permite copiar solo artefactos necesarios desde una etapa anterior. citeturn653792search2turn653792search10

---

## Cómo se lee esta versión

### Etapa `build`
- instala todo lo necesario para construir
- compila la app

### Etapa `runtime`
- instala solo dependencias de producción
- copia solo `dist/`
- no arrastra todo el árbol de build

Esto ya se parece mucho más a una imagen pensada para producción.

---

## Qué mejora introduce esta separación

Introduce varias mejoras de verdad:

- la imagen final arrastra menos ruido
- las dependencias de desarrollo no viajan al runtime
- el runtime queda más enfocado
- build y ejecución ya no están mezclados conceptualmente

Docker, en sus guías recientes, insiste justamente en esta lógica de “production-ready image” y separación clara entre construcción y runtime final. citeturn653792search3turn653792search20

---

## Paso 4: preguntarte si el runtime necesita incluso menos

En algunos tipos de proyecto, el runtime podría necesitar todavía menos.

Por ejemplo, un frontend estático muchas veces puede terminar así:

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

En este caso:

- el runtime ya no necesita Node
- tampoco npm
- tampoco `node_modules`
- solo necesita servir archivos ya construidos

Docker lo muestra justamente en sus guías recientes de frontend. citeturn653792search20

---

## Qué te enseña este contraste

Te enseña a hacerte esta pregunta central:

> “¿Qué necesita realmente el runtime final?”

A veces la respuesta es:

- `dist/` y dependencias de producción

Y otras veces es todavía más mínima:

- solo archivos estáticos finales

Ese criterio cambia muchísimo la calidad de la imagen.

---

## Stack integrado final de la práctica

Para una app Node que corre un `dist/server.js`, un resultado razonable podría quedar así:

### Dockerfile

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

### `.dockerignore`

```text
node_modules
dist
.git
coverage
*.log
```

---

## Cómo se lee este resultado final

La lectura conceptual sería:

- el contexto de build llega más limpio
- la instalación de dependencias queda mejor protegida por caché
- el build y el runtime están claramente separados
- el runtime instala solo dependencias de producción
- el runtime solo recibe `dist/` desde la etapa anterior
- la imagen final queda mucho más enfocada

Esto ya se ve bastante más profesional que el punto de partida.

---

## Qué gana esta práctica frente al Dockerfile inicial

Gana varias cosas al mismo tiempo:

- builds más rápidas
- menos invalidaciones innecesarias
- menos ruido en el contexto
- una imagen final más limpia
- una separación más clara entre construcción y ejecución
- una base mucho mejor para mantenimiento a largo plazo

No es una mejora cosmética.
Es una mejora estructural.

---

## Qué no tenés que confundir

### Multi-stage no reemplaza `.dockerignore`
Una cosa reduce lo que va al builder; la otra limpia la imagen final.

### Un Dockerfile bien ordenado no reemplaza una runtime mínima
Se complementan.

### Instalar solo prod deps no significa que todas las apps usen exactamente la misma receta
La lógica es general; la implementación depende del stack.

### Un runtime más limpio no siempre significa “la imagen más mínima posible ya mismo”
Primero importa que la separación esté bien pensada.

---

## Error común 1: mejorar la caché pero seguir mandando un contexto enorme

Ahí te falta `.dockerignore`.

---

## Error común 2: usar multi-stage pero seguir copiando toda la carpeta del build al runtime

Ahí todavía no limpiaste de verdad la etapa final.

---

## Error común 3: instalar dependencias de producción y desarrollo igual en runtime

Eso deja más ruido y más peso de lo necesario.

---

## Error común 4: pensar cada mejora por separado y no integrarlas nunca

Este tema existe justamente para mostrar cómo se refuerzan entre sí.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará mentalmente estas dos versiones.

#### Versión A
```Dockerfile
FROM node:22
WORKDIR /app

COPY . .
RUN npm install
RUN npm run build

CMD ["npm", "start"]
```

#### Versión B
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

Con este `.dockerignore`:

```text
node_modules
dist
.git
coverage
*.log
```

### Ejercicio 2
Respondé con tus palabras:

- qué mejora introduce el orden de capas
- qué mejora introduce `.dockerignore`
- qué mejora introduce multi-stage
- qué mejora introduce instalar solo dependencias de producción en runtime
- por qué la versión B te parece más profesional de punta a punta

### Ejercicio 3
Respondé además:

- qué parte del proyecto cambiaría seguido y conviene dejar más abajo en el Dockerfile
- qué parte del proyecto no debería viajar al build context
- qué parte del árbol de build no debería llegar al runtime
- qué artefacto final sí debería llegar

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy tu Dockerfile mezcla build y runtime
- si hoy tu `.dockerignore` existe y sirve de verdad
- qué capa costosa te gustaría proteger mejor con caché
- qué carpeta o artefacto local deberías sacar del contexto
- qué parte del árbol final hoy probablemente estás copiando de más
- qué cambio concreto harías primero para volverlo más profesional

No hace falta escribir todavía el Dockerfile final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la relación entre caché, contexto y runtime final?
- ¿en qué proyecto tuyo hoy estás fallando más: orden de capas, `.dockerignore` o multi-stage?
- ¿qué parte del runtime hoy sigue demasiado cargada?
- ¿qué mejora concreta te gustaría notar primero: menos tiempo, menos tamaño o menos ruido?
- ¿qué parte del Dockerfile te gustaría reescribir antes con esta lógica integrada?

Estas observaciones valen mucho más que memorizar una sola receta.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero aprovechar mejor la caché, probablemente me conviene ordenar primero las capas más ________.  
> Si quiero reducir ruido en el build, probablemente me conviene usar ________.  
> Si quiero separar construcción y ejecución, probablemente me conviene usar ________.  
> Si quiero que la imagen final cargue menos cosas, probablemente me conviene copiar solo los ________ finales y dejar solo dependencias de ________.

Y además respondé:

- ¿por qué esta práctica impacta tanto en velocidad, limpieza y mantenimiento?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica integrada?
- ¿qué riesgo evitás al no mezclar contexto enorme, build plana y runtime sobrecargada?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- combinar orden de capas, `.dockerignore`, multi-stage y runtime mínima en una sola práctica
- distinguir mejor contexto de build, build stage y runtime stage
- proteger más caché y reducir invalidaciones innecesarias
- dejar imágenes finales más chicas y más limpias
- escribir Dockerfiles bastante más profesionales de punta a punta

---

## Resumen del tema

- Docker recomienda ordenar las capas de forma lógica para evitar invalidaciones innecesarias de caché. citeturn653792search0turn653792search2
- `.dockerignore` sirve para excluir archivos y directorios del contexto, reduciendo ruido y transferencia al builder. citeturn653792search0turn653792search4turn653792search7
- Si un archivo está ignorado, no existe para `COPY` o `ADD` durante el build. citeturn653792search1
- Multi-stage builds permiten separar build y runtime y copiar solo artefactos necesarios. citeturn653792search2turn653792search5
- Las guías actuales de Node y React muestran imágenes production-ready basadas en estas mismas ideas. citeturn653792search3turn653792search20
- Este tema te deja una forma integrada y mucho más madura de escribir Dockerfiles que construyen mejor y empaquetan mucho menos ruido.

---

## Próximo tema

En el próximo bloque vas a empezar a moverte hacia otra capa muy importante del trabajo real con Docker:

- variables de entorno
- `ARG` y `ENV`
- build-time vs runtime
- y cómo pasar configuración sin mezclar conceptos ni filtrar cosas donde no corresponde
