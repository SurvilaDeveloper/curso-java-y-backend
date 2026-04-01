---
title: "Ordená tu Dockerfile para aprovechar la caché: construí más rápido cambiando menos capas"
description: "Tema 85 del curso práctico de Docker: cómo influye el orden de instrucciones en la caché de build, por qué conviene separar dependencias del código que cambia seguido y cómo escribir Dockerfiles que reconstruyan menos capas innecesariamente."
order: 85
module: "Dockerfiles más mantenibles y builds más rápidas"
level: "intermedio"
draft: false
---

# Ordená tu Dockerfile para aprovechar la caché: construí más rápido cambiando menos capas

## Objetivo del tema

En este tema vas a:

- entender cómo reutiliza Docker la caché de build
- ver por qué el orden de instrucciones importa muchísimo
- separar dependencias del código que cambia seguido
- reconstruir menos capas innecesariamente
- escribir Dockerfiles que se sientan mucho más rápidos en el día a día

La idea es que no pienses el Dockerfile solo como “una lista que funciona”, sino también como una secuencia que puede ayudar o arruinar la caché.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender cómo piensa Docker la caché
2. ver qué rompe la reutilización de capas
3. comparar un Dockerfile mal ordenado con uno mejor ordenado
4. aprender a separar dependencias de código cambiante
5. construir una regla práctica para escribir Dockerfiles que reconstruyan menos

---

## Idea central que tenés que llevarte

Docker construye una imagen instrucción por instrucción y, en cada paso, intenta reutilizar el resultado anterior desde caché si puede.

La documentación oficial lo dice de forma muy directa: Docker ejecuta las instrucciones en orden y para cada una verifica si puede reutilizar el resultado desde la build cache. También remarca que entender cómo funciona la caché y cómo se invalida es clave para builds más rápidas. citeturn973804search2turn973804search3

Dicho simple:

> si ordenás mal el Dockerfile, rompés la caché más de lo necesario.  
> si lo ordenás bien, reconstruís mucho menos.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- Docker recomienda **ordenar las capas** del Dockerfile de forma lógica para evitar invalidaciones innecesarias de caché. citeturn973804search0
- La guía de best practices insiste en aprovechar la build cache y entender cómo se invalida. citeturn973804search2
- La documentación de cache invalidation explica que para `COPY` y `ADD` Docker calcula un checksum a partir de metadatos de los archivos involucrados, y que si cambian esos archivos, la caché se invalida. También aclara que el `mtime` por sí solo no cuenta. citeturn973804search1
- La referencia del Dockerfile explica que el caché de `RUN` no se invalida automáticamente en la siguiente build: si el contexto anterior no cambió, Docker puede reutilizar ese paso. También aclara que `COPY` y `ADD` pueden invalidar el caché de instrucciones `RUN` posteriores. citeturn973804search6
- La guía de optimización de caché recomienda además mantener el contexto pequeño, porque un contexto grande aumenta la cantidad de datos enviados y la probabilidad de invalidación. citeturn973804search0

---

## Primer concepto: Docker construye por capas

Imaginá este Dockerfile:

```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

Docker va procesando estas instrucciones en orden:

1. `FROM`
2. `WORKDIR`
3. `COPY . .`
4. `RUN npm install`
5. `CMD`

En cada paso intenta decidir:

- ¿puedo reutilizar el resultado anterior?
- ¿o tengo que reconstruir desde acá hacia abajo?

Ese detalle cambia muchísimo el tiempo de build.

---

## Segundo concepto: una instrucción que cambia invalida lo que viene después

La lógica práctica más importante es esta:

> si cambia una capa, lo que viene después normalmente tiene que reconstruirse.

Docker lo documenta justamente así en best practices y cache docs: la caché se resuelve instrucción por instrucción, y un cambio en archivos copiados con `COPY` o `ADD` invalida capas posteriores relacionadas. citeturn973804search2turn973804search1turn973804search6

Esto significa que el orden no es neutro.

---

## El error clásico: copiar todo demasiado pronto

Mirá este Dockerfile:

```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
```

### Qué problema tiene
Con `COPY . .` estás trayendo todo el proyecto muy temprano:

- código fuente
- configuración
- assets
- cambios pequeños de archivos
- todo junto

Entonces, si cambiás una línea del código de la app, esa capa de `COPY` cambia y Docker tiene que reconstruir también:

- `RUN npm install`
- `RUN npm run build`

aunque tus dependencias no hayan cambiado en absoluto.

Ese es uno de los peores hábitos de Dockerfile al empezar.

---

## Tercer concepto: separá lo estable de lo que cambia seguido

Docker recomienda ordenar las capas de forma lógica, y el patrón más común para Node es separar primero:

- archivos de dependencias
- instalación de dependencias
- recién después el resto del código

Por ejemplo:

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

## Por qué esta versión es mejor

Ahora la lectura cambia:

1. copiás `package*.json`
2. instalás dependencias
3. copiás el resto del proyecto
4. hacés el build

Entonces:

- si cambiás un archivo de código, probablemente se invalida recién el segundo `COPY`
- pero `RUN npm install` puede seguir reutilizándose desde caché
- solo se reconstruye lo que realmente depende del código cambiante

Esto suele hacer una diferencia enorme en tiempo de build.

---

## Qué archivo conviene copiar primero

En general, conviene copiar primero los archivos que definen dependencias o metadatos de instalación.

Por ejemplo, en Node:

- `package.json`
- `package-lock.json`

En otros stacks podrían ser otros archivos equivalentes.

La idea general no depende solo de Node.
La idea es:

> primero copiá lo que cambia poco y define dependencias;  
> después copiá lo que cambia mucho.

---

## Cuarto concepto: `RUN` no se invalida “solo”

La referencia del Dockerfile documenta algo muy importante:

- una instrucción `RUN` no se invalida automáticamente “porque pasó el tiempo”
- si Docker puede reutilizar esa capa, la reutiliza
- también aclara que `COPY` y `ADD` pueden invalidar `RUN` posteriores citeturn973804search6

Esto es clave para entender por qué el orden importa tanto.

Por ejemplo:

```Dockerfile
RUN npm install
```

no se vuelve a ejecutar por magia en cada build.
Se vuelve a ejecutar si algo anterior relevante cambió y rompió esa parte del caché.

---

## Quinto concepto: `COPY` y `ADD` miran metadatos, no solo contenido

Docker documenta que para `COPY` y `ADD` calcula un checksum a partir de metadatos de los archivos involucrados y que si esos metadatos cambian, la caché se invalida. También aclara algo útil: el `mtime` por sí solo no se toma en cuenta. citeturn973804search1

Esto te deja una enseñanza práctica:

- no todo cambio trivial de timestamps rompe la caché
- pero cambios reales en el conjunto de archivos copiados sí pueden hacerlo

Por eso `COPY . .` tan temprano suele ser una bomba de invalidación.

---

## Sexto concepto: mantener el contexto chico también ayuda

La guía de optimización de caché también recomienda mantener el contexto de build lo más chico posible. Explica que así reducís datos transferidos al builder y también la probabilidad de invalidar caché innecesariamente. citeturn973804search0

Esto conversa perfectamente con el tema:

- no solo importa el orden del Dockerfile
- también importa qué archivos estás enviando al build context

Acá aparece naturalmente algo que seguramente profundizarás más adelante:

- `.dockerignore`

Hoy alcanza con entender la idea:
**menos ruido en el contexto = menos oportunidades de invalidación**.

---

## Comparación directa: mal ordenado vs mejor ordenado

### Versión más frágil

```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
```

### Versión más sana

```Dockerfile
FROM node:22
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

### Diferencia clave
- en la primera, cambiar código fuerza también la reinstalación de dependencias
- en la segunda, muchas veces cambiar código no toca la capa de `npm install`

Eso es justamente aprovechar mejor la caché.

---

## Qué te enseña realmente este tema

Te enseña a pensar el Dockerfile así:

- qué cosas cambian poco
- qué cosas cambian mucho
- qué pasos son caros
- qué pasos deberían quedar protegidos por caché el mayor tiempo posible

Ese cambio mental vale muchísimo.

Porque a partir de acá ya no escribís Dockerfiles solo para “que anden”, sino también para que reconstruyan bien.

---

## Una regla muy útil

Podés pensar así:

### Primero
poné las instrucciones más estables y menos propensas a cambio.

### Después
poné los pasos caros que querés cachear bien, como instalación de dependencias.

### Más abajo
copiá el código que cambia seguido.

### Al final
dejá lo que más probablemente vaya a invalidarse con frecuencia.

Esta regla sola mejora muchísimo la mayoría de los Dockerfiles principiantes.

---

## Qué no tenés que confundir

### Caché de build no es lo mismo que caché de tu app
Acá estás optimizando la construcción de la imagen, no el runtime de la aplicación.

### `COPY . .` no está “prohibido”
Simplemente conviene ubicarlo bien.

### Un Dockerfile corto no siempre es un Dockerfile bien cacheado
La legibilidad importa, pero también el orden.

### Más instrucciones no siempre significa peor
A veces separar mejor las capas ayuda muchísimo al rendimiento de build.

---

## Error común 1: copiar todo el proyecto antes de instalar dependencias

Ese es el clásico error que más destruye caché sin necesidad.

---

## Error común 2: no distinguir archivos estables de archivos que cambian seguido

Si tratás todo igual, Docker tampoco puede ayudarte tanto con la caché.

---

## Error común 3: pensar que `RUN npm install` se ejecuta siempre “porque sí”

Docker documenta que `RUN` puede reutilizarse desde caché si nada anterior relevante cambió. citeturn973804search6

---

## Error común 4: ignorar el tamaño y ruido del build context

Un contexto demasiado grande también empeora el panorama de caché. citeturn973804search0

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
CMD ["npm", "start"]
```

#### Opción B
```Dockerfile
FROM node:22
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

### Ejercicio 2
Respondé con tus palabras:

- cuál te parece mejor ordenado para la caché
- por qué
- qué problema tiene copiar todo demasiado pronto
- qué capa querés proteger más para no reinstalar dependencias al cambiar código

### Ejercicio 3
Respondé además:

- qué invalida normalmente un `COPY`
- por qué una instrucción `RUN` posterior puede tener que reconstruirse
- por qué el `mtime` por sí solo no cuenta para invalidar el caché de `COPY`/`ADD`

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué archivo o grupo de archivos cambia menos seguido
- cuál define dependencias
- qué instrucción costosa te gustaría dejar cacheada más tiempo
- si hoy copiás demasiado pronto todo el proyecto
- qué cambio concreto harías primero para mejorar tu Dockerfile

No hace falta escribir todavía el Dockerfile final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la relación entre orden e invalidación de caché?
- ¿en qué proyecto tuyo hoy estás rompiendo más caché de la necesaria?
- ¿qué paso de build te cuesta más tiempo y te gustaría proteger mejor?
- ¿qué parte del contexto de build hoy te mete más ruido?
- ¿qué mejora concreta te gustaría notar después de reordenar un Dockerfile?

Estas observaciones valen mucho más que memorizar una receta fija.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero aprovechar mejor la caché, probablemente me conviene poner primero las instrucciones más ________.  
> Si quiero evitar reinstalar dependencias cuando solo cambia el código, probablemente me conviene copiar primero los archivos de ________ y recién después el resto del ________.  
> Si quiero reducir ruido e invalidaciones innecesarias, probablemente me conviene mantener el ________ lo más chico posible.

Y además respondé:

- ¿por qué este tema impacta tanto en la velocidad del día a día?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no romper la caché de más?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar cómo Docker reutiliza la caché de build
- ordenar mejor las instrucciones de un Dockerfile
- separar dependencias del código que cambia seguido
- reducir reconstrucciones innecesarias
- escribir Dockerfiles bastante más rápidos y mantenibles

---

## Resumen del tema

- Docker ejecuta las instrucciones del Dockerfile en orden y, para cada una, intenta reutilizar la build cache. citeturn973804search2turn973804search3
- Docker recomienda ordenar las capas de forma lógica para evitar invalidaciones innecesarias. citeturn973804search0
- Para `COPY` y `ADD`, la caché se invalida si cambian los metadatos relevantes de los archivos involucrados; el `mtime` por sí solo no cuenta. citeturn973804search1
- Las instrucciones `RUN` posteriores pueden invalidarse cuando cambian instrucciones previas como `COPY` o `ADD`. citeturn973804search6
- Mantener el contexto pequeño también reduce datos transferidos y probabilidad de invalidación innecesaria. citeturn973804search0
- Este tema te deja una base muy sólida para escribir Dockerfiles que no solo funcionen, sino que además construyan mucho mejor.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una herramienta súper concreta para reforzar lo que viste hoy:

- `.dockerignore`
- contexto de build más chico
- menos ruido enviado al builder
- y menos invalidaciones innecesarias desde el propio proyecto
