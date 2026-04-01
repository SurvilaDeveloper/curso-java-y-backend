---
title: "Caché y orden de capas en Compose: construí más rápido entendiendo qué invalida el build"
description: "Tema 55 del curso práctico de Docker: cómo funciona la caché de build, qué cambios invalidan capas, por qué conviene ordenar bien el Dockerfile y cómo usar .dockerignore y docker compose build --no-cache con criterio."
order: 55
module: "Imágenes propias y flujos más cercanos a despliegue"
level: "intermedio"
draft: false
---

# Caché y orden de capas en Compose: construí más rápido entendiendo qué invalida el build

## Objetivo del tema

En este tema vas a:

- entender cómo funciona la caché de build
- ver qué cambios invalidan capas
- ordenar mejor el Dockerfile para reconstruir menos
- entender por qué `.dockerignore` importa tanto
- usar `docker compose build --no-cache` con más criterio

La idea es que empieces a construir imágenes más rápido y con menos reconstrucciones innecesarias.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué es la caché de build
2. ver qué tipos de cambios invalidan capas
3. ordenar el Dockerfile con más intención
4. reducir el contexto con `.dockerignore`
5. entender cuándo conviene forzar un rebuild sin caché

---

## Idea central que tenés que llevarte

Docker intenta reutilizar resultados anteriores del build para no repetir trabajo innecesario.

Eso es la caché de build.

Pero esa caché no es mágica:
si una capa cambia, las que vienen después también pueden tener que reconstruirse. Docker lo explica de forma explícita: una vez que una capa se invalida, las capas siguientes también se invalidan. citeturn907005search5turn907005search0turn907005search2

Dicho simple:

> construir más rápido no depende solo de “tener caché”,  
> sino de escribir el Dockerfile de una forma que ayude a reutilizarla bien.

---

## Qué dice la documentación oficial

Docker documenta que entender la build cache ayuda a escribir mejores Dockerfiles y a obtener builds más rápidos. También explica que el orden de las capas importa: las capas costosas que cambian poco conviene ponerlas antes, y las que cambian seguido conviene ponerlas después, para evitar invalidaciones innecesarias. Además, remarca que el contexto de build debe mantenerse lo más pequeño posible y que cambios en instrucciones `RUN`, o en archivos copiados con `COPY` o `ADD`, invalidan la caché correspondiente. citeturn907005search2turn907005search1turn907005search5turn907005search12

---

## Qué es la caché de build

Cuando Docker construye una imagen, guarda resultados intermedios de pasos anteriores.

Si en un build siguiente una instrucción y sus entradas relevantes no cambiaron, Docker puede reutilizar esa capa en vez de ejecutarla otra vez. La documentación oficial lo presenta justamente como la base para acelerar builds y evitar trabajo repetido. citeturn907005search2turn907005search5

---

## Qué cosas suelen invalidar la caché

Docker remarca varios disparadores típicos de invalidación:

- cambios en una instrucción `RUN`
- cambios en archivos copiados con `COPY` o `ADD`
- cambios en una capa previa, que arrastran a las siguientes citeturn907005search5turn907005search0turn907005search2

Esto significa que no alcanza con mirar “el paso que cambió”.
También importa dónde estaba ubicado en el Dockerfile.

---

## Por qué el orden del Dockerfile importa tanto

Docker recomienda ordenar las capas de forma lógica: poner antes las que cambian poco y son costosas, y dejar más abajo las que cambian seguido. citeturn907005search1

La intuición es esta:

- si una capa temprana cambia, arrastra a muchas otras
- si una capa tardía cambia, afecta menos del build total

Por eso el orden tiene impacto directo en velocidad.

---

## Ejemplo clásico: Node.js mal ordenado

Una versión poco conveniente sería algo así:

```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
```

### Qué problema tiene

Como `COPY . .` trae todo el proyecto de una sola vez, cualquier cambio chico en el código puede invalidar la capa y obligar a repetir `npm install` y el resto del build. Docker usa justo este tipo de ejemplo para mostrar por qué conviene separar archivos de dependencias del resto del código. citeturn907005search1turn907005search5

---

## Ejemplo mejor ordenado

Una versión más razonable sería:

```Dockerfile
FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
```

### Por qué es mejor

- `package*.json` cambia menos seguido que el resto del código
- si solo cambia un archivo fuente, Docker puede reutilizar la capa de `npm install`
- el build suele ser bastante más rápido

La documentación oficial de optimización de caché muestra este patrón justamente como ejemplo recomendado. citeturn907005search1

---

## Qué papel juega COPY

`COPY` no es una instrucción inocente.

Docker documenta que cambios en los archivos copiados pueden invalidar la caché de esa capa. citeturn907005search5turn907005search12

Por eso conviene mucho separar:

- archivos de dependencias
- archivos de configuración estables
- código que cambia seguido

No siempre vas a poder separar todo, pero pensar así ya mejora mucho el build.

---

## Qué papel juega el contexto de build

Docker explica que el contexto de build es el conjunto de archivos a los que el builder puede acceder, y que cuanto más grande sea, más datos se transfieren y más probable es que algo irrelevante invalide la caché. También remarca que mantener el contexto pequeño reduce trabajo y reduce la probabilidad de invalidación. citeturn907005search12turn907005search1

Esto vuelve a mostrar por qué elegir bien el contexto y tener un buen `.dockerignore` importa muchísimo.

---

## Por qué .dockerignore ayuda tanto

Si tu contexto incluye cosas innecesarias como:

- `node_modules`
- logs
- archivos temporales
- `.git`
- artefactos locales pesados

cada build puede volverse más lento y más propenso a cache misses innecesarios.

Docker lo recomienda explícitamente: mantener el contexto pequeño y usar `.dockerignore` es una de las formas más efectivas de optimizar builds. citeturn907005search1turn907005search8turn907005search15

---

## Un .dockerignore razonable para muchos proyectos

Por ejemplo:

```text
node_modules
dist
build
.git
*.log
.env
```

No es una receta universal, pero muestra la idea:
evitar que el contexto arrastre cosas que no deberían influir en la imagen.

---

## Qué pasa con RUN

Docker documenta que un cambio en el comando de una instrucción `RUN` invalida esa capa. citeturn907005search5

Entonces, si cambiás algo como:

```Dockerfile
RUN npm install
```

por:

```Dockerfile
RUN npm ci
```

esa capa deja de reutilizar la caché anterior.

Esto parece obvio, pero es importante tenerlo muy presente cuando querés entender por qué un build volvió a ejecutarse completo.

---

## Qué pasa cuando una capa previa cambia

Este es el efecto dominó clásico.

Si cambia una capa temprana, las posteriores pueden reconstruirse también, incluso si ellas no cambiaron directamente. Docker lo documenta de forma explícita en su explicación de invalidación y uso de caché. citeturn907005search5turn907005search0turn907005search2

Por eso a veces el verdadero problema no está en la capa “cara”, sino en haber puesto demasiado arriba una capa muy cambiante.

---

## Qué hace docker compose build --no-cache

La referencia oficial de `docker compose build` documenta la opción `--no-cache`, que fuerza a no usar la caché durante el build. citeturn907005search3

Esto es útil cuando querés un rebuild limpio o sospechás que la caché te está ocultando un cambio importante.

Pero no conviene usarlo por costumbre para todo, porque justamente desactiva una de las mayores ventajas del sistema.

---

## Cuándo conviene usar --no-cache

Suele tener sentido cuando:

- querés comprobar un build limpio
- cambiaste algo y sospechás un problema de caché
- querés forzar reinstalación o reconstrucción de todas las capas
- estás diagnosticando un comportamiento raro

Docker también recomienda `--no-cache` para builds limpios en sus best practices. citeturn907005search4turn907005search3

---

## Qué no hace --no-cache

No significa automáticamente “usa la base más nueva”.

Docker aclara en sus best practices que `--no-cache` desactiva la reutilización de capas, pero no necesariamente trae una base más nueva por sí solo; para eso entra en juego también `--pull` en el flujo apropiado. citeturn907005search4

Esta distinción conviene tenerla clara para no esperar un efecto que no corresponde.

---

## Un criterio muy útil para ordenar capas

Podés pensar así:

### Arriba
- cosas costosas que cambian poco

### Abajo
- cosas livianas o que cambian seguido

Por ejemplo:

- dependencias primero
- código fuente después

Esto no siempre resuelve todo, pero suele mejorar muchísimo el tiempo de build en proyectos reales.

---

## Qué relación tiene esto con Compose

Compose no cambia la lógica de la caché de Docker.

Lo que hace es integrarla al flujo del stack mediante:

- `docker compose build`
- `docker compose up --build`

La documentación oficial del comando `docker compose build` deja claro que sigue hablando en términos de build, opciones como `--no-cache`, `--pull`, y servicios del proyecto. citeturn907005search3

O sea:
el criterio para escribir buenos Dockerfiles sigue siendo igual de importante aunque uses Compose.

---

## Qué no tenés que confundir

### Tener caché no garantiza builds rápidos si el Dockerfile está mal ordenado
La caché ayuda, pero el diseño del archivo importa muchísimo.

### COPY . . no siempre está mal
Pero si lo ponés demasiado arriba, puede invalidar más de la cuenta.

### --no-cache no debería ser tu herramienta principal para el día a día
Es útil para casos puntuales, no para reemplazar una estrategia de caché sana.

### Contexto grande no significa automáticamente mejor
Muchas veces significa más ruido, más transferencia y más invalidaciones.

---

## Error común 1: copiar todo el proyecto antes de instalar dependencias

Eso suele empeorar mucho la reutilización de caché.

---

## Error común 2: no usar .dockerignore

En proyectos medianos o grandes, esto puede hacer una diferencia muy fuerte.

---

## Error común 3: pensar que cualquier cambio “debería” reconstruir solo una parte

Si cambió una capa previa, las posteriores pueden invalidarse también. Docker lo documenta explícitamente. citeturn907005search5turn907005search0

---

## Error común 4: usar --no-cache para todo porque “así me aseguro”

Eso te hace perder justamente la principal ventaja del sistema de build cache.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará estos dos Dockerfiles.

#### Opción A

```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
```

#### Opción B

```Dockerfile
FROM node:22
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
```

### Ejercicio 2
Respondé con tus palabras:

- cuál reutiliza mejor la caché
- por qué
- en cuál un cambio pequeño en código fuente impactaría menos
- en cuál `npm install` tiene más chances de reutilizarse

### Ejercicio 3
Ahora imaginá que tu proyecto tiene:

- `node_modules`
- `dist`
- `.git`
- logs

Respondé:

- por qué conviene usar `.dockerignore`
- qué problemas evita en el contexto
- cómo puede ayudarte también con la caché

### Ejercicio 4
Respondé además:

- cuándo tendría sentido usar `docker compose build --no-cache`
- por qué no conviene usarlo siempre

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué capa del Dockerfile cambia más seguido
- qué capa es más costosa de reconstruir
- qué moverías hacia arriba o hacia abajo
- qué pondrías en `.dockerignore`
- qué parte del build hoy sentís más lenta o más propensa a invalidarse sin necesidad

No hace falta escribir todavía el Dockerfile final.
La idea es refinar el criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la idea de “una capa que cambia arrastra las siguientes”?
- ¿qué archivo de tus proyectos cambia más seguido y no te gustaría que invalidara todo?
- ¿por qué el orden del Dockerfile te parece ahora mucho más importante?
- ¿qué parte del contexto hoy probablemente estás mandando de más?
- ¿qué mejora te imaginás notar primero si ordenás mejor tus capas?

Estas observaciones valen mucho más que memorizar dos comandos.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Las capas costosas que cambian poco conviene ponerlas más ________.  
> Las capas que cambian seguido conviene ponerlas más ________.  
> Y si quiero un rebuild limpio sin reutilizar caché, me conviene usar ________.

Y además respondé:

- ¿por qué `.dockerignore` ayuda tanto aunque no cambie el Dockerfile?
- ¿qué error típico evita separar `package*.json` del resto del código?
- ¿qué parte de tus builds te gustaría acelerar primero?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar cómo funciona la caché de build a nivel práctico
- entender qué cambios invalidan capas
- ordenar mejor el Dockerfile para reconstruir menos
- usar `.dockerignore` con más intención
- decidir mejor cuándo conviene `docker compose build --no-cache`

---

## Resumen del tema

- Docker reutiliza resultados anteriores del build cuando las instrucciones y sus entradas relevantes no cambiaron. citeturn907005search2turn907005search5
- Cambios en instrucciones `RUN`, archivos copiados con `COPY` o `ADD`, o en capas previas invalidan la caché correspondiente y pueden arrastrar a las siguientes. citeturn907005search5turn907005search0turn907005search12
- Docker recomienda ordenar las capas: arriba lo costoso y estable, abajo lo que cambia seguido. citeturn907005search1
- Mantener el contexto pequeño con `.dockerignore` reduce transferencia e invalidaciones innecesarias. citeturn907005search1turn907005search12
- `docker compose build --no-cache` fuerza un rebuild limpio, pero no conviene usarlo como estrategia por defecto. citeturn907005search3turn907005search4
- Este tema te ayuda a construir más rápido y con Dockerfiles bastante mejor pensados.

---

## Próximo tema

En el próximo tema vas a seguir avanzando hacia builds más sólidos y modernos:

- secrets en build
- por qué ARG no alcanza para todo
- cómo exponer datos sensibles al build sin filtrarlos en la imagen
- y cómo empezar a pensar un flujo más seguro
