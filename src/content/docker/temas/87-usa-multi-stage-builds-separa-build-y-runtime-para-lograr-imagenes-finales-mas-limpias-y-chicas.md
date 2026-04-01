---
title: "Usá multi-stage builds: separá build y runtime para lograr imágenes finales más limpias y chicas"
description: "Tema 87 del curso práctico de Docker: cómo usar multi-stage builds para separar dependencias de construcción del runtime final, copiar solo los artefactos necesarios y conseguir imágenes más chicas, más limpias y más mantenibles."
order: 87
module: "Dockerfiles más mantenibles y builds más rápidas"
level: "intermedio"
draft: false
---

# Usá multi-stage builds: separá build y runtime para lograr imágenes finales más limpias y chicas

## Objetivo del tema

En este tema vas a:

- entender qué es un multi-stage build
- separar claramente la etapa de build de la etapa de runtime
- copiar solo los artefactos necesarios a la imagen final
- reducir tamaño, ruido y superficie innecesaria en la imagen resultante
- escribir Dockerfiles más mantenibles y más profesionales

La idea es que no metas en la imagen final herramientas que solo necesitabas para construir.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender por qué una sola etapa a veces mete demasiado en la imagen final
2. ver qué cambia cuando usás múltiples `FROM`
3. aprender a copiar artefactos entre etapas con `COPY --from`
4. ver por qué conviene nombrar las etapas
5. entender cómo `--target` ayuda para debug o testing
6. construir una regla práctica para separar build y runtime

---

## Idea central que tenés que llevarte

Muchas veces tu app necesita durante el build cosas como:

- compiladores
- gestores de paquetes
- tooling de build
- dependencias pesadas de desarrollo

Pero eso no significa que todo eso tenga que viajar a producción.

La documentación oficial de Docker lo resume muy bien: los multi-stage builds permiten usar múltiples `FROM`, separar el entorno de build del runtime final y copiar selectivamente solo los artefactos que necesitás en la imagen final. Docker también destaca que esto suele reducir el tamaño final y mantener el Dockerfile más claro y mantenible. citeturn903766search1turn903766search0turn903766search2turn903766search8

Dicho simple:

> construí con todo lo que necesites,  
> pero ejecutá con solo lo imprescindible.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- un multi-stage build usa **múltiples `FROM`** y cada uno inicia una nueva etapa. citeturn903766search1
- podés copiar artefactos de una etapa a otra con `COPY --from`. citeturn903766search1turn903766search14
- esto ayuda a reducir el tamaño de la imagen final porque dejás afuera herramientas y artefactos intermedios. citeturn903766search0turn903766search1turn903766search5
- conviene **nombrar las etapas** con `AS` para que el Dockerfile sea más robusto y legible. citeturn903766search1turn903766search14
- podés construir hasta una etapa concreta con `docker build --target ...`, lo que sirve para debug, testing o stages intermedios. citeturn903766search1
- Docker también documenta que podés usar una imagen externa como fuente en `COPY --from`, no solo una etapa local previa. citeturn903766search1turn903766search14

---

## Primer concepto: el problema de una sola etapa

Imaginá este Dockerfile:

```Dockerfile
FROM node:22
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

Puede funcionar perfectamente.

Pero tiene un problema muy común:
la misma imagen final contiene tanto el entorno de build como el entorno de runtime.

Eso puede dejar adentro cosas que ya no necesitás al final, como:

- dependencias de build
- herramientas de compilación
- archivos fuente que no hacen falta en runtime
- artefactos intermedios

---

## Qué problema real trae eso

Suele traer varias consecuencias:

- imagen final más grande
- más superficie innecesaria
- más ruido adentro del contenedor
- menos separación entre “construir” y “ejecutar”

Este es exactamente el problema que multi-stage builds viene a resolver.

---

## Segundo concepto: cada `FROM` inicia una nueva etapa

La documentación oficial de Docker lo dice literalmente: en multi-stage builds usás varios `FROM`, y cada uno comienza una nueva etapa del build. citeturn903766search1

Eso significa que podés pensar algo así:

- una etapa para instalar y compilar
- otra para ejecutar
- otra opcional para debug o testing

Cada etapa puede usar incluso una base distinta.

---

## Un ejemplo mínimo de multi-stage

```Dockerfile
FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

---

## Cómo se lee este ejemplo

La lectura conceptual sería:

### Etapa 1: `build`
- usa Node
- instala dependencias
- compila o construye la app

### Etapa 2: runtime final
- usa NGINX
- no necesita Node ni tooling de build
- solo recibe los archivos ya construidos desde la etapa anterior

Eso es exactamente la lógica que Docker recomienda cuando habla de separar build environment y final runtime environment. citeturn903766search2turn903766search12

---

## Qué gana esta versión

Gana varias cosas al mismo tiempo:

- la imagen final suele ser más chica
- la imagen final contiene menos ruido
- la etapa de runtime queda más limpia
- el Dockerfile expresa mejor qué parte es build y qué parte es runtime

Docker best practices destaca justamente que multi-stage builds reducen tamaño al separar claramente la construcción del output final. citeturn903766search0turn903766search5

---

## Tercer concepto: `COPY --from`

La referencia oficial del Dockerfile documenta:

```Dockerfile
COPY --from=<image|stage|context> <src> ... <dest>
```

y explica que esto permite copiar desde:

- otra etapa del mismo Dockerfile
- una imagen externa
- o un named context citeturn903766search14turn903766search1

En multi-stage builds, lo normal es copiar desde una etapa anterior.

Por ejemplo:

```Dockerfile
COPY --from=build /app/dist /usr/share/nginx/html
```

---

## Por qué esto es tan importante

Porque esa instrucción es la que te permite decir:

> “de toda la etapa de build, lo único que quiero llevarme al runtime es esto”.

Ese “esto” suele ser:

- un binario compilado
- una carpeta `dist`
- assets finales
- dependencias ya preparadas
- archivos de runtime muy concretos

Y nada más.

---

## Cuarto concepto: nombrá tus etapas

Docker documenta que por defecto las etapas pueden referenciarse por número (`0`, `1`, `2`, etc.), pero recomienda nombrarlas con `AS <NAME>`. También explica que eso evita que `COPY --from` se rompa si después reordenás el Dockerfile. citeturn903766search1turn903766search14

Por ejemplo:

```Dockerfile
FROM node:22 AS build
...
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

Esto es mucho más claro que:

```Dockerfile
COPY --from=0 /app/dist /usr/share/nginx/html
```

---

## Por qué nombrar etapas es mejor

Porque vuelve el Dockerfile:

- más legible
- más mantenible
- menos frágil si después cambiás el orden de cosas

Es una mejora chica, pero muy valiosa.

---

## Quinto concepto: `--target`

Docker documenta que no siempre necesitás construir hasta la última etapa. Podés usar:

```bash
docker build --target build -t mi-imagen .
```

para detener el build en una etapa concreta. citeturn903766search1

Esto es muy útil para cosas como:

- debuggear una etapa de build
- tener una etapa `debug`
- tener una etapa `test`
- inspeccionar un artefacto intermedio sin construir toda la imagen final

---

## Un ejemplo mental útil

Podrías pensar un Dockerfile así:

```Dockerfile
FROM node:22 AS build
...

FROM build AS test
RUN npm test

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
```

Y entonces podrías:

- construir `--target test` para revisar testing
- construir todo para producir la imagen runtime final

La documentación oficial da justamente ejemplos de usar `--target` para debug o stages específicos. citeturn903766search1

---

## Sexto concepto: podés usar una imagen externa como stage source

Docker también documenta que `COPY --from` no se limita a etapas definidas dentro del mismo Dockerfile.

Por ejemplo:

```Dockerfile
COPY --from=nginx:latest /etc/nginx/nginx.conf /nginx.conf
```

Docker lo explica explícitamente en la documentación de multi-stage y en la referencia de `COPY --from`. citeturn903766search1turn903766search14

Esto amplía bastante la flexibilidad del mecanismo.

---

## Qué stacks suelen beneficiarse muchísimo

### Frontends
Por ejemplo, construir con Node y servir con NGINX.

### Lenguajes compilados
Compilar en una etapa y copiar solo el binario al runtime final.

### Apps con tooling pesado de build
Donde no querés que todo ese tooling viaje a producción.

Docker incluso remarca que multi-stage builds se recomiendan para todo tipo de aplicaciones y que son especialmente valiosos cuando hay dependencias de build grandes. citeturn903766search2turn903766search10turn903766search12

---

## Relación directa con los temas 85 y 86

Este tema conversa perfecto con lo anterior:

- en el tema 85 viste cómo ordenar el Dockerfile para aprovechar mejor la caché
- en el tema 86 viste cómo reducir el contexto con `.dockerignore`

Ahora aparece otra mejora complementaria:

- incluso si el build usa muchas cosas, la imagen final no tiene por qué quedarse con todo

Estas tres ideas juntas hacen muchísimo por la calidad del Dockerfile.

---

## Un ejemplo bastante sano para frontend

```Dockerfile
FROM node:22 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Qué tiene de bueno
- dependencias de build quedan en la etapa `build`
- runtime final usa una base distinta y más apropiada
- solo viaja `dist/` a la imagen final

Esto está muy alineado con las guías recientes de Docker para apps frontend. citeturn903766search12turn903766search11

---

## Una regla muy útil

Podés pensar así:

### ¿Necesitás herramientas de build pesadas?
Ponelas en una etapa de build.

### ¿La imagen final solo necesita artefactos listos para correr?
Copiá solo esos artefactos con `COPY --from`.

### ¿Querés un Dockerfile más claro?
Nombrá las etapas con `AS`.

### ¿Querés debuggear una etapa intermedia?
Usá `--target`.

Esta secuencia te ordena muchísimo la cabeza.

---

## Qué no tenés que confundir

### Multi-stage no es lo mismo que multi-platform
Una cosa es separar etapas dentro del build; otra, construir para varias arquitecturas. citeturn903766search4

### Más etapas no significa automáticamente más complejidad mala
Muchas veces significa más claridad.

### La imagen final no tiene que parecerse a la etapa de build
Justamente la idea es que no se parezcan demasiado.

### `COPY --from` no solo copia desde stages locales
También puede copiar desde imágenes externas o named contexts. citeturn903766search14turn903766search6

---

## Error común 1: dejar build y runtime mezclados en una sola etapa

Eso suele inflar la imagen final innecesariamente.

---

## Error común 2: usar varias etapas pero seguir copiando demasiado al runtime

La idea no es tener más `FROM` por estética.
La idea es copiar solo lo necesario.

---

## Error común 3: referenciar stages por número en Dockerfiles que después cambian mucho

Nombrarlas con `AS` suele ser bastante más sano. citeturn903766search1turn903766search14

---

## Error común 4: no aprovechar `--target` para debug o testing cuando podría ayudarte muchísimo

Docker lo documenta justamente como un caso de uso muy útil. citeturn903766search1

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará estos dos enfoques.

#### Opción A: una sola etapa
```Dockerfile
FROM node:22
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

#### Opción B: multi-stage
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

### Ejercicio 2
Respondé con tus palabras:

- cuál separa mejor build y runtime
- cuál probablemente deja menos ruido en la imagen final
- qué ventaja te da `COPY --from`
- por qué nombrar `build` y `runtime` te parece mejor que usar números

### Ejercicio 3
Respondé además:

- para qué sirve `docker build --target build`
- cuándo te parecería útil construir solo una etapa intermedia
- qué tipo de proyecto tuyo se beneficiaría más de esta técnica

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- si hoy build y runtime están mezclados en una sola imagen
- qué herramientas o dependencias de build hoy están viajando a la imagen final sin necesidad
- qué artefacto final realmente necesitarías copiar al runtime
- si tendría sentido una etapa `build`, una `test` o una `runtime`
- qué cambio concreto te gustaría probar primero

No hace falta escribir todavía el Dockerfile final completo.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre build stage y runtime stage?
- ¿en qué proyecto tuyo hoy estás llevando más cosas a la imagen final de las que necesitás?
- ¿qué parte del build te gustaría aislar mejor?
- ¿qué valor le ves a `--target` para debug o testing?
- ¿qué mejora concreta te gustaría notar después de pasar a multi-stage?

Estas observaciones valen mucho más que memorizar una receta de frontend.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si necesito herramientas pesadas para construir pero no para ejecutar, probablemente me conviene usar una etapa de ________ y otra de ________.  
> Si quiero pasar solo los artefactos finales entre etapas, probablemente me conviene usar ________.  
> Si quiero que el Dockerfile sea más legible y menos frágil, probablemente me conviene ________ las etapas.  
> Si quiero inspeccionar o construir solo una etapa intermedia, probablemente me conviene usar ________.

Y además respondé:

- ¿por qué este tema impacta tanto en el tamaño y limpieza de la imagen final?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no llevar tooling de build a producción sin necesidad?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es un multi-stage build
- separar mejor build y runtime en un Dockerfile
- copiar solo artefactos necesarios con `COPY --from`
- usar nombres de etapa con `AS`
- aprovechar `--target` para debug, testing o builds parciales
- escribir imágenes finales bastante más chicas y limpias

---

## Resumen del tema

- Los multi-stage builds usan múltiples `FROM` y cada uno inicia una nueva etapa. citeturn903766search1
- Docker los recomienda porque ayudan a separar el entorno de build del runtime final y a reducir el tamaño de la imagen final. citeturn903766search0turn903766search2turn903766search5
- `COPY --from` permite copiar artefactos desde otra etapa, una imagen externa o un named context. citeturn903766search14turn903766search1
- Conviene nombrar las etapas con `AS` para que el Dockerfile sea más legible y menos frágil. citeturn903766search1turn903766search14
- `docker build --target ...` permite construir hasta una etapa concreta para debug, testing o inspección intermedia. citeturn903766search1
- Este tema te deja una base muy sólida para construir imágenes finales más chicas, limpias y mantenibles.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con una capa muy útil de refinamiento:

- dependencias de producción
- artefactos finales
- qué copiar y qué no copiar
- y cómo dejar la etapa runtime todavía más limpia y mínima
