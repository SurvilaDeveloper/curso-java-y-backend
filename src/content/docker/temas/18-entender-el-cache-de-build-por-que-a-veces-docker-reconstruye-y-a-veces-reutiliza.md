---
title: "Entender el caché de build: por qué a veces Docker reconstruye y a veces reutiliza"
description: "Tema 18 del curso práctico de Docker: cómo funciona el caché de build, qué cosas invalidan capas, por qué el orden de instrucciones importa y cómo empezar a escribir Dockerfiles más rápidos de reconstruir."
order: 18
module: "Primeros pasos reales con imágenes"
level: "base"
draft: false
---

# Entender el caché de build: por qué a veces Docker reconstruye y a veces reutiliza

## Objetivo del tema

En este tema vas a:

- entender qué es el caché de build
- ver por qué algunas construcciones son más rápidas que otras
- entender qué cosas invalidan el caché
- descubrir por qué el orden de instrucciones en el Dockerfile importa tanto
- empezar a pensar builds más eficientes desde el principio

La idea es que dejes de ver el build como una caja negra y empieces a entender por qué Docker a veces reutiliza pasos y a veces vuelve a ejecutar casi todo.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué significa reutilizar capas de build
2. ver cómo Docker compara instrucciones con builds anteriores
3. identificar qué cambios invalidan el caché
4. entender por qué una invalidación afecta también a pasos posteriores
5. empezar a ordenar mejor un Dockerfile para reconstrucciones más rápidas

---

## Idea central que tenés que llevarte

Docker intenta reutilizar resultados de builds anteriores cuando puede.

Dicho simple:

> si una parte del Dockerfile no cambió y Docker considera que puede reutilizarla, no la vuelve a construir desde cero

Eso acelera muchísimo los builds.

Pero también significa que:

- si cambiás algo importante
- o si una instrucción deja de coincidir con lo que Docker tenía cacheado

entonces esa parte se reconstruye.

Y muy seguido, no solo esa parte:
también los pasos que vienen después.

---

## Qué es el caché de build

El caché de build es el mecanismo que Docker usa para reutilizar resultados previos de construcción.

En lugar de repetir siempre todos los pasos desde cero, Docker intenta ver si puede aprovechar algo ya construido antes.

Eso hace que muchos rebuilds sean mucho más rápidos.

Por ejemplo, si antes ya construiste una imagen y ahora repetís exactamente el mismo proceso sin cambios relevantes, Docker puede reutilizar varias partes del build.

---

## Qué dice la documentación oficial

La documentación oficial de Docker explica que el builder compara cada instrucción del Dockerfile con capas cacheadas previas, y que si no encuentra coincidencia la caché se invalida. También aclara que, una vez invalidado un paso, las instrucciones siguientes tienen que reconstruirse otra vez, y recomienda ordenar las capas para evitar invalidaciones innecesarias. citeturn337183search1turn337183search2turn337183search4turn337183search6

---

## Cómo conviene pensarlo

Podés pensar el build así:

- Docker lee el Dockerfile en orden
- va evaluando instrucción por instrucción
- en cada paso se pregunta si puede reutilizar lo que ya tenía
- si puede, aprovecha el caché
- si no puede, reconstruye ese paso
- y desde ahí en adelante, normalmente vuelve a construir lo que sigue

Esto es lo que hace que el orden del Dockerfile importe tanto.

---

## Qué significa “reutilizar una capa”

Sin meternos en detalles demasiado pesados, la idea útil para este curso es esta:

cada instrucción del Dockerfile participa en la construcción de una secuencia de resultados parciales.

Si Docker detecta que una instrucción y su contexto relevante coinciden con algo ya construido, puede reutilizar ese resultado anterior en vez de repetirlo.

Eso ahorra:

- tiempo
- trabajo innecesario
- instalaciones repetidas
- compilaciones redundantes

---

## Ejemplo mental simple

Imaginá este Dockerfile:

```Dockerfile
FROM alpine:3.20
WORKDIR /app
COPY mensaje.txt .
CMD ["cat", "mensaje.txt"]
```

Si construís una imagen con esto y después volvés a ejecutar el mismo build sin cambiar nada, Docker puede reutilizar los pasos previos.

Pero si cambiás `mensaje.txt`, el paso:

```Dockerfile
COPY mensaje.txt .
```

ya no coincide exactamente con lo que había antes.

Entonces, desde ahí, el build tiene que rehacerse.

---

## Qué cosas suelen invalidar caché

Sin querer memorizar reglas demasiado finas todavía, quedate con estas ideas fuertes:

- cambiar una instrucción del Dockerfile invalida ese paso
- cambiar archivos usados por `COPY` o `ADD` puede invalidar ese paso
- si un paso se invalida, lo que viene después suele reconstruirse también

Esto te da una base muy buena para empezar a escribir Dockerfiles más inteligentes.

---

## Cambios en RUN

La guía oficial de Docker muestra que si cambia el comando de una instrucción `RUN`, esa capa ya no coincide con la anterior y se invalida el caché para ese paso. citeturn337183search3turn337183search1

Por ejemplo, no es lo mismo esto:

```Dockerfile
RUN echo "hola"
```

que esto:

```Dockerfile
RUN echo "hola mundo"
```

Aunque parezca un cambio pequeño, Docker ya lo considera distinto.

---

## Cambios en COPY

Docker también explica que cambios en archivos copiados con `COPY` o `ADD` afectan la reutilización del caché, porque el builder mira esos insumos para decidir si el paso sigue siendo equivalente o no. citeturn337183search3turn337183search1

Por eso, si hacés algo como:

```Dockerfile
COPY . .
```

y modificás cualquier archivo relevante dentro de ese contexto, es muy posible que ese paso deje de reutilizar caché.

---

## Por qué el orden del Dockerfile importa tanto

Este es el corazón práctico del tema.

Si ponés primero pasos que cambian todo el tiempo, podés estar forzando reconstrucciones costosas una y otra vez.

Si, en cambio, ponés primero pasos más estables y dejás para más adelante lo que cambia seguido, Docker tiene más chances de reutilizar caché en los pasos costosos.

La documentación oficial de Docker recomienda justamente ordenar las capas de forma lógica, dejando antes lo que cambia menos y más cerca del final lo que cambia más seguido. citeturn337183search2turn337183search4

---

## Ejemplo comparativo simple

### Opción menos conveniente

```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

### Qué problema tiene

Si cambiás cualquier archivo del proyecto y usás `COPY . .` antes de instalar dependencias, es muy posible que el paso de instalación también tenga que repetirse.

---

## Opción más conveniente

```Dockerfile
FROM node:22
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

### Qué ventaja tiene

Si cambiaste solo código fuente pero no cambiaste `package.json` ni `package-lock.json`, Docker tiene más chances de reutilizar el paso de instalación.

Esta es una idea muy valiosa y aparece muchísimo en proyectos reales.

---

## Qué está pasando en ese ejemplo

La lógica es esta:

- las dependencias suelen cambiar menos seguido que el código fuente
- por eso conviene copiar primero solo los archivos que describen dependencias
- instalar dependencias en ese momento
- recién después copiar el resto del proyecto

Así protegés mejor uno de los pasos más costosos del build.

---

## Qué dice Docker sobre optimizar caché

La guía oficial de optimización del caché recomienda explícitamente:

- ordenar las capas
- mantener pequeño el contexto
- evitar invalidaciones innecesarias

Y muestra ejemplos donde copiar primero los archivos de dependencias ayuda a no reinstalar todo cuando solo cambió el código de la aplicación. citeturn337183search2turn337183search4

---

## Qué relación tiene esto con .dockerignore

Todavía no vas a profundizar en ese archivo en este tema, pero sí conviene adelantarte una idea:

si el contexto de build incluye demasiados archivos innecesarios, aumentan las chances de invalidaciones y además el build manda más información de la necesaria.

Más adelante vas a ver `.dockerignore` justamente para mejorar eso.

---

## Qué no tenés que confundir

### Caché no significa que Docker “se salta cosas al azar”
Reutiliza resultados cuando detecta coincidencias válidas.

### Build rápido no significa build incorrecto
Muy seguido significa justamente que Docker pudo reutilizar trabajo anterior.

### Cambiar un archivo local no siempre invalida todo
Depende de dónde esté ese archivo y de qué instrucciones lo usen.

### Orden del Dockerfile no es un detalle estético
Afecta directamente el tiempo y la eficiencia del build.

---

## Error común 1: pensar que Docker siempre recompila todo

No.

Si puede reutilizar caché, no recompila todo desde cero.

---

## Error común 2: poner COPY . . demasiado pronto

A veces eso hace que un cambio pequeño en el proyecto invalide pasos costosos que podrían haberse reutilizado mejor.

---

## Error común 3: no distinguir qué cambia seguido y qué cambia poco

Si no pensás eso, te cuesta ordenar bien el Dockerfile.

Y si ordenás mal, el build puede volverse innecesariamente lento.

---

## Error común 4: creer que una invalidación afecta solo a una línea

Muy seguido, cuando un paso deja de coincidir con el caché, también se reconstruyen los pasos siguientes.

Por eso un pequeño cambio mal ubicado puede tener mucho impacto.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá este Dockerfile mínimo:

```Dockerfile
FROM alpine:3.20
WORKDIR /app
COPY mensaje.txt .
CMD ["cat", "mensaje.txt"]
```

### Ejercicio 2
Construí la imagen una vez:

```bash
docker build -t mi-cache:1.0 .
```

### Ejercicio 3
Volvé a construirla sin cambiar nada:

```bash
docker build -t mi-cache:1.0 .
```

### Ejercicio 4
Observá la diferencia de comportamiento y velocidad general.

### Ejercicio 5
Ahora cambiá el contenido de `mensaje.txt`.

### Ejercicio 6
Volvé a ejecutar:

```bash
docker build -t mi-cache:1.0 .
```

### Ejercicio 7
Respondé con tus palabras:

- ¿qué paso dejó de coincidir?
- ¿por qué se reconstruyó?
- ¿qué relación viste entre el archivo cambiado y la instrucción `COPY mensaje.txt .`?

---

## Segundo ejercicio de análisis

Mirá estos dos Dockerfiles y respondé cuál te parece mejor para aprovechar caché en una app Node sencilla.

### Opción A

```Dockerfile
FROM node:22
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

### Opción B

```Dockerfile
FROM node:22
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

Respondé:

- cuál creés que aprovecha mejor caché
- por qué
- qué parte cambia más seguido en un proyecto real
- qué paso costoso conviene proteger mejor

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué diferencia notaste entre el primer build y el segundo sin cambios?
- ¿qué pasó cuando modificaste el archivo copiado?
- ¿por qué una pequeña modificación puede afectar pasos posteriores?
- ¿qué valor práctico tiene ordenar mejor el Dockerfile?
- ¿qué relación empezás a ver entre caché, contexto y velocidad?

Estas observaciones valen mucho más que memorizar reglas aisladas.

---

## Mini desafío

Intentá explicar con tus palabras esta idea:

> Docker lee el Dockerfile en orden y reutiliza lo que puede, pero cuando una parte deja de coincidir, desde ahí en adelante tiene que reconstruir.

Y además respondé:

- ¿por qué conviene poner pasos costosos antes de partes que cambian seguido?
- ¿por qué `COPY . .` puede ser delicado si lo usás muy pronto?
- ¿qué tipo de cambio te imaginás que invalidaría un `RUN npm install`?
- ¿cómo te ayuda este tema a escribir Dockerfiles más rápidos de reconstruir?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es el caché de build
- entender por qué algunos builds son mucho más rápidos que otros
- reconocer qué tipos de cambios invalidan el caché
- entender por qué el orden del Dockerfile importa mucho
- empezar a escribir Dockerfiles pensando en reutilización y velocidad

---

## Resumen del tema

- Docker intenta reutilizar resultados previos de build cuando puede.
- Si una instrucción o sus insumos relevantes cambian, el caché de ese paso se invalida.
- Cuando un paso se invalida, normalmente también se reconstruyen los siguientes.
- Cambios en `RUN`, `COPY` o archivos relevantes pueden afectar la caché.
- Ordenar mejor el Dockerfile ayuda muchísimo a acelerar rebuilds.
- Este tema es la base para escribir imágenes más eficientes y mantener un flujo de trabajo más ágil.

---

## Próximo tema

En el próximo tema vas a trabajar con una herramienta clave para que el contexto de build no se vuelva un problema:

- `.dockerignore`
- qué conviene excluir
- cómo reducir ruido, peso e invalidaciones innecesarias
