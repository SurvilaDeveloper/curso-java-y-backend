---
title: "Context y Dockerfile en Compose: declarā mejor build cuando tu proyecto deja de ser trivial"
description: "Tema 48 del curso práctico de Docker: cómo usar build con context y dockerfile en Docker Compose, por qué conviene pasar de la forma corta a la forma detallada cuando el proyecto crece y cómo evitar configuraciones confusas con varias carpetas."
order: 48
module: "Imágenes propias y flujos más cercanos a despliegue"
level: "intermedio"
draft: false
---

# Context y Dockerfile en Compose: declarā mejor build cuando tu proyecto deja de ser trivial

## Objetivo del tema

En este tema vas a:

- entender mejor qué significa el context de build en Compose
- usar la forma detallada de `build`
- declarar un `dockerfile` explícito cuando haga falta
- evitar confusiones cuando el proyecto ya tiene varias carpetas
- preparar un stack más ordenado para builds reales

La idea es que pases de `build: .` a una forma más intencional de declarar cómo se construyen tus servicios.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. recordar qué es el contexto de build
2. ver la forma corta y la forma detallada de `build`
3. entender qué cambia cuando el Dockerfile no está en el lugar “obvio”
4. organizar un proyecto con carpetas más claras
5. aprender una regla simple para evitar paths confusos

---

## Idea central que tenés que llevarte

`build: .` está muy bien para proyectos pequeños.

Pero cuando el proyecto crece, aparecen preguntas como estas:

- ¿desde qué carpeta se construye?
- ¿qué archivos entran al build?
- ¿qué Dockerfile se usa?
- ¿qué pasa si tengo más de un Dockerfile o más de una app?

Ahí conviene pasar a una declaración más explícita.

Dicho simple:

> cuando tu proyecto deja de ser trivial, conviene declarar `build` con `context` y `dockerfile` de forma clara, para que el stack sea más fácil de entender y mantener.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker indica que en Compose, `build` puede declararse como una ruta simple o como una definición detallada. Cuando `build` es una cadena, esa ruta completa se usa como contexto de build y Compose busca un `Dockerfile` canónico en la raíz de ese directorio. También documenta que el contexto de build define el conjunto de archivos al que puede acceder el builder, igual que en `docker build`. La referencia de `docker compose build` recuerda además que si cambia el Dockerfile o el contenido del directorio de build, hace falta reconstruir el servicio. citeturn270433search0turn270433search1turn270433search2turn270433search6

---

## Recordatorio rápido: qué es el build context

El contexto de build es el conjunto de archivos que el builder puede usar durante la construcción.

Esto importa muchísimo porque instrucciones como:

```Dockerfile
COPY .
```

o:

```Dockerfile
COPY src ./src
```

solo pueden referirse a archivos que estén dentro del contexto.

Si el archivo que querés copiar queda fuera del contexto, el build no va a poder acceder a él.

---

## Cómo se relaciona esto con Compose

Cuando en Compose escribís algo como:

```yaml
services:
  app:
    build: .
```

estás diciendo:

- el contexto de build es la carpeta actual
- ahí está el Dockerfile que se va a usar por defecto
- desde ahí el builder puede acceder a los archivos del proyecto

Es una sintaxis cómoda, pero no siempre la más clara cuando la estructura crece.

---

## Forma corta de build

La forma corta es esta:

```yaml
services:
  app:
    build: .
```

Docker documenta que, cuando `build` es una cadena, se interpreta como el contexto completo y se busca un `Dockerfile` canónico en la raíz de esa carpeta. citeturn270433search0

### Cuándo conviene
- proyectos pequeños
- un solo Dockerfile
- una sola app en la carpeta actual
- ejemplos simples o primeras prácticas

---

## Forma detallada de build

La forma detallada es esta:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
```

O con otra estructura de carpetas:

```yaml
services:
  app:
    build:
      context: ./app
      dockerfile: Dockerfile.dev
```

La documentación oficial de la Compose Build Specification muestra justamente que `build` puede declararse como un objeto con campos como `context` y `dockerfile`. citeturn270433search0

### Cuándo conviene
- proyectos con varias carpetas
- más de un Dockerfile
- servicios distintos dentro del mismo repo
- cuando querés que el archivo sea más explícito para vos o para otra persona

---

## Qué papel cumple context

`context` dice desde qué carpeta se construye y qué archivos forman parte del build.

Por ejemplo:

```yaml
build:
  context: ./frontend
```

significa:

- el build parte de `./frontend`
- el builder puede acceder a los archivos de esa carpeta
- las rutas de `COPY` y `ADD` del Dockerfile se entienden respecto de ese contexto

Esta idea es exactamente la misma que ya viste con `docker build`, solo que ahora queda declarada dentro del stack Compose. citeturn270433search1turn270433search6

---

## Qué papel cumple dockerfile

`dockerfile` indica qué archivo Dockerfile usar dentro de ese contexto.

Por ejemplo:

```yaml
build:
  context: ./frontend
  dockerfile: Dockerfile.dev
```

significa:

- el contexto es `./frontend`
- el archivo de build no es el Dockerfile canónico por defecto
- querés usar `Dockerfile.dev`

Esto es muy útil cuando querés tener, por ejemplo:

- un Dockerfile para producción
- otro Dockerfile para desarrollo
- o distintos Dockerfiles según el servicio

Docker documenta que el servicio puede usar una definición de build detallada justamente para especificar `dockerfile`. citeturn270433search0

---

## Primer ejemplo simple

Imaginá esta estructura:

```text
mi-proyecto/
├── compose.yaml
└── web/
    ├── Dockerfile
    └── index.html
```

Podrías declarar el servicio así:

```yaml
services:
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    ports:
      - "8080:80"
```

### Cómo se lee
- el servicio `web` se construye desde `./web`
- usa el Dockerfile ubicado ahí
- después se publica en `8080:80`

Esto ya deja el stack bastante más claro que un `build: .` si el archivo Compose vive una carpeta más arriba.

---

## Segundo ejemplo: dos servicios propios en el mismo repo

Imaginá esta estructura:

```text
mi-monorepo/
├── compose.yaml
├── frontend/
│   ├── Dockerfile
│   └── ...
└── api/
    ├── Dockerfile
    └── ...
```

Podrías declarar:

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    image: miusuario/frontend:dev
    ports:
      - "8080:80"

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    image: miusuario/api:dev
    ports:
      - "3000:3000"
```

### Qué ventaja tiene
- cada servicio deja claro desde dónde se construye
- no hay ambigüedad sobre qué Dockerfile usa cada uno
- el stack es mucho más legible cuando el repo ya tiene varias partes

---

## Cuándo conviene seguir usando build: .

Seguir usando:

```yaml
build: .
```

está perfecto cuando:

- el servicio vive en la carpeta actual
- el Dockerfile está en el lugar esperado
- no hay ambigüedad
- no hay varias apps ni varias carpetas importantes

No hace falta volver compleja la configuración antes de tiempo.

---

## Cuándo conviene pasar a build detallado

Conviene mucho cuando:

- el `compose.yaml` vive en la raíz y los servicios en subcarpetas
- hay varios Dockerfiles
- querés expresar mejor la intención
- querés evitar que otra persona tenga que adivinar desde dónde se construye cada servicio
- querés preparar mejor un flujo más serio de build y despliegue

---

## Qué pasa si elegís mal el contexto

Si el contexto no contiene lo que el Dockerfile intenta copiar, el build falla o se comporta distinto de lo que esperabas.

Por ejemplo, si tu Dockerfile hace algo como:

```Dockerfile
COPY package.json .
```

pero elegiste un contexto que no contiene ese archivo, el build no va a poder resolverlo.

Ese es uno de los errores más comunes cuando el proyecto empieza a dividirse en carpetas.

---

## Qué relación tiene esto con .dockerignore

Todo lo que viste sobre `.dockerignore` sigue aplicando.

Si el contexto es grande o está mal elegido:

- el build puede ser más pesado
- puede volverse más confuso
- puede incluir archivos innecesarios
- puede invalidar caché más de la cuenta

Elegir bien `context` es una de las mejores formas de mantener un build sano.

La documentación oficial sobre build context sigue siendo la base para entender esto. citeturn270433search1turn270433search6

---

## Un detalle útil: additional_contexts

Docker también documenta `additional_contexts` dentro de la Compose Build Specification, pensado para escenarios más avanzados donde un build necesita contextos extra además del principal. Es una capacidad real de Compose y BuildKit, pero para este curso todavía no hace falta usarla en la práctica. citeturn270433search0turn270433search4

Por ahora quiero que te quede bien firme la base:

- `context`
- `dockerfile`

Eso ya resuelve muchísimos casos reales.

---

## Qué no tenés que confundir

### `context` no es lo mismo que la carpeta donde está el compose.yaml
Puede coincidir, pero no es obligatorio.

### `dockerfile` no reemplaza al contexto
Solo indica qué archivo de receta usar dentro del build.

### Un Dockerfile alternativo no cambia mágicamente qué archivos puede copiar
Eso lo sigue definiendo el contexto.

### Hacer todo explícito no siempre significa hacerlo mejor
Si el proyecto es mínimo, `build: .` puede seguir siendo la opción más clara.

---

## Error común 1: dejar build: . cuando el servicio realmente vive en otra carpeta

Eso suele volver ambiguo el stack y a veces mete más archivos de los necesarios en el contexto.

---

## Error común 2: apuntar dockerfile a un archivo, pero olvidar que el contexto sigue siendo otra cosa

Mucha gente corrige el Dockerfile y se olvida de que `COPY` sigue dependiendo del contexto.

---

## Error común 3: mezclar varios servicios dentro del mismo contexto sin necesidad

Eso puede volver más pesados los builds y más confusa la intención del stack.

---

## Error común 4: no explicitar rutas cuando el repo ya creció

En proyectos con varias carpetas, la claridad paga muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Imaginá esta estructura:

```text
mi-proyecto/
├── compose.yaml
└── web/
    ├── Dockerfile
    └── index.html
```

### Ejercicio 2
Escribí mentalmente un `compose.yaml` para `web` usando la forma detallada de `build`.

Debería quedar más o menos así:

```yaml
services:
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    ports:
      - "8080:80"
```

### Ejercicio 3
Respondé con tus palabras:

- qué define `context`
- qué define `dockerfile`
- por qué este ejemplo es más claro que `build: .`
- qué archivos podría copiar el Dockerfile en este escenario

### Ejercicio 4
Ahora imaginá que el servicio usa `Dockerfile.dev` en vez de `Dockerfile`.

Respondé:

- qué cambiarías en `build`
- por qué esto puede ser útil en desarrollo
- qué seguiría dependiendo igual del `context`

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos con varias carpetas y respondé:

- qué servicios propios tendrías
- desde qué carpeta convendría construir cada uno
- si usarías un Dockerfile único o varios
- en cuáles te convendría usar `build + image`
- por qué la forma detallada de `build` te ayudaría a que el stack quede más claro

No hace falta escribir el archivo final completo.
La idea es aprender a pensar la estructura.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre contexto y Dockerfile?
- ¿en qué proyecto tuyo `build: .` empezaría a quedarse corto?
- ¿qué ventaja práctica le ves a que cada servicio declare su carpeta de build explícitamente?
- ¿por qué este tema se vuelve importante justo cuando el repo crece?
- ¿qué parte de este flujo te parece más cercana a un proyecto real o a un monorepo?

Estas observaciones valen mucho más que memorizar sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si el servicio es pequeño y vive en la carpeta actual, probablemente me alcanza con ________.  
> Si el proyecto ya tiene varias carpetas o Dockerfiles, probablemente me conviene declarar ________ y ________ de forma explícita.

Y además respondé:

- ¿por qué el contexto de build es tan importante?
- ¿qué error típico evita la forma detallada de `build`?
- ¿qué servicio tuyo te gustaría declarar primero así?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué significa el build context en Compose
- distinguir la forma corta y la forma detallada de `build`
- usar `context` y `dockerfile` con intención
- evitar confusiones en proyectos con varias carpetas
- preparar mejor el stack para builds más serios

---

## Resumen del tema

- En Compose, `build` puede declararse como una ruta simple o como una definición detallada. citeturn270433search0
- Cuando `build` es una cadena, esa ruta se usa como contexto y Compose busca un `Dockerfile` canónico en la raíz. citeturn270433search0
- El contexto define qué archivos puede usar el builder durante la construcción. citeturn270433search1turn270433search6
- La forma detallada con `context` y `dockerfile` da mucha más claridad cuando el proyecto ya tiene varias carpetas o varios Dockerfiles. citeturn270433search0
- Si cambian el Dockerfile o el contenido del directorio de build, hace falta reconstruir el servicio. citeturn270433search2
- Este tema te ayuda a declarar builds con mucha más intención y menos ambigüedad.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque, ya más cerca de un flujo real de imágenes:

- tags más útiles
- nombres consistentes
- `docker compose push`
- y por qué empezar a pensar publicación cambia varias decisiones del stack
