---
title: "Construir imágenes propias con Compose: usá build, image y tags con intención"
description: "Tema 47 del curso práctico de Docker: cómo construir imágenes propias desde Docker Compose usando build e image, cuándo conviene cada uno, cómo se nombran las imágenes resultantes y qué relación hay entre compose.yaml y tu Dockerfile."
order: 47
module: "Imágenes propias y flujos más cercanos a despliegue"
level: "intermedio"
draft: false
---

# Construir imágenes propias con Compose: usá build, image y tags con intención

## Objetivo del tema

En este tema vas a:

- entender cómo Compose construye imágenes propias
- usar `build` dentro de `compose.yaml`
- distinguir mejor `build` e `image`
- entender cómo Compose nombra o etiqueta las imágenes resultantes
- prepararte para un flujo más serio de build, tags y publicación

La idea es que empieces a usar Compose no solo para correr servicios, sino también para construir tus propias imágenes dentro del stack.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender la relación entre Dockerfile y Compose
2. ver cómo un servicio puede construirse con `build`
3. entender cuándo conviene además declarar `image`
4. ver qué nombres o tags reciben las imágenes construidas
5. aprender una regla práctica para preparar servicios que más adelante quieras publicar

---

## Idea central que tenés que llevarte

Hasta ahora usaste mucho Compose con servicios que apuntaban a imágenes ya hechas, por ejemplo:

- `nginx`
- `postgres:18`
- `adminer`

Pero en proyectos reales, muy seguido tu servicio principal no viene “listo” de afuera.

Viene de tu propio código.

Ahí aparece `build`.

Dicho simple:

> Compose no solo puede **correr** servicios  
> también puede **construir** la imagen de un servicio a partir de tu proyecto y tu Dockerfile.

---

## Qué diferencia hay entre Dockerfile y Compose

Esta diferencia te tiene que quedar clarísima.

### Dockerfile
Define cómo se construye una imagen.

### Compose
Define cómo se ejecuta una aplicación compuesta por servicios, y uno de esos servicios puede construirse usando un Dockerfile.

Pensalo así:

- el Dockerfile describe la receta de una imagen
- el `compose.yaml` describe el stack
- Compose puede tomar la receta del Dockerfile para construir la imagen de uno de sus servicios antes de correrlo

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker explica que un servicio Compose puede incluir una sección `build` para definir cómo crear la imagen Docker del servicio. También aclara que `docker compose build` reconstruye el servicio si cambiaste el Dockerfile o el contenido del directorio de build, y que cuando un servicio se construye, la imagen se etiqueta por defecto como `project-service`, salvo que el servicio también tenga `image`, en cuyo caso se usa ese nombre. Además, Docker remarca que para poder empujar imágenes construidas con `docker compose push`, el servicio necesita un atributo `image`. citeturn975459search0turn975459search1turn975459search3turn975459search5turn975459search12

---

## Primer paso: usar build dentro de un servicio

La forma más simple es esta:

```yaml
services:
  app:
    build: .
```

La lectura conceptual sería:

- hay un servicio llamado `app`
- no está usando una imagen remota ya hecha
- Compose tiene que construir su imagen a partir del contexto `.` antes de correrlo

---

## Qué significa ese punto en build

Ese `.` representa el contexto de build.

La idea es la misma que ya viste con `docker build .`:

- el contexto es la carpeta actual
- ahí suelen estar tu Dockerfile y los archivos del proyecto
- Compose usa ese contexto para construir la imagen del servicio

Si querés, podés pensar `build: .` como el equivalente Compose de:

```bash
docker build .
```

solo que integrado dentro del stack. citeturn975459search14turn975459search2

---

## Ejemplo mínimo de proyecto

Imaginá esta estructura:

```text
mi-app-compose/
├── compose.yaml
├── Dockerfile
└── index.html
```

### Dockerfile

```Dockerfile
FROM nginx:latest
COPY index.html /usr/share/nginx/html/index.html
```

### compose.yaml

```yaml
services:
  web:
    build: .
    ports:
      - "8080:80"
```

---

## Cómo se lee este ejemplo

La lectura conceptual sería:

- el servicio `web` no usa una imagen ya publicada con nombre explícito
- Compose construye la imagen usando el Dockerfile de esta carpeta
- después arranca el servicio y expone `8080:80`

Esto ya te da un flujo real donde Compose construye y ejecuta.

---

## Qué hace docker compose build

Cuando ejecutás:

```bash
docker compose build
```

Compose construye las imágenes de los servicios que tengan `build`.

Es especialmente útil cuando:

- cambiaste el Dockerfile
- cambiaste archivos que entran al build
- querés regenerar la imagen sin arrancar todavía el stack

Docker lo documenta justo como el comando para construir o reconstruir servicios cuando cambió el Dockerfile o el contenido del directorio de build. citeturn975459search1turn975459search16

---

## Qué hace docker compose up --build

Si querés todo en un solo flujo, podés usar:

```bash
docker compose up --build
```

o:

```bash
docker compose up --build -d
```

La idea es:

- construí donde haga falta
- y además levantá el stack

Esto es muy cómodo cuando ya sabés que cambiaste algo que afecta la imagen.

---

## Qué diferencia hay entre image y build

Esto es una de las claves del tema.

### `image`
Le decís a Compose qué imagen usar.

### `build`
Le decís a Compose cómo construir la imagen del servicio.

Y en algunos casos podés usar ambas cosas juntas.

---

## Cuándo usar solo image

Suele convenir cuando:

- el servicio usa una imagen oficial o externa
- no necesitás construir nada desde tu código
- el servicio es, por ejemplo, PostgreSQL, Redis o Nginx tal como vienen

Ejemplo:

```yaml
services:
  db:
    image: postgres:18
```

---

## Cuándo usar solo build

Suele convenir cuando:

- el servicio es tu propia app
- todavía no te importa tanto el nombre final de la imagen
- querés un flujo local de desarrollo o prueba
- no estás pensando todavía en publicar esa imagen a un registry

Ejemplo:

```yaml
services:
  app:
    build: .
```

---

## Cuándo usar build + image juntos

Esto se vuelve especialmente útil cuando querés que Compose:

- construya la imagen desde tu código
- y además le asigne un nombre/tag útil y explícito

Por ejemplo:

```yaml
services:
  app:
    build: .
    image: miusuario/miapp:dev
```

La documentación oficial de Docker explica justamente que, si el servicio tiene `image`, la imagen construida se etiqueta con ese nombre en vez del nombre por defecto. También remarca que ese atributo es importante si más adelante querés usar `docker compose push`. citeturn975459search0turn975459search1turn975459search3

---

## Qué nombre usa Compose si no ponés image

Docker documenta que, cuando construye un servicio y no tiene un `image` explícito, lo etiqueta por defecto con un nombre tipo:

```text
project-service
```

Ese `project` depende del nombre del proyecto Compose, que ya viste en el tema anterior. citeturn975459search1turn975459search6

La idea útil es esta:

- si no ponés `image`, Compose igual puede construir y etiquetar localmente
- pero el nombre resultante depende del proyecto y del servicio
- eso puede estar bien para desarrollo
- puede ser menos claro si ya pensás en publicación o distribución

---

## Por qué image importa más cuando pensás en push

Docker lo documenta de forma muy clara en la especificación de build y en `docker compose push`:

- Compose puede construir imágenes
- pero para poder empujarlas a un registry, el servicio necesita `image`
- si falta `image`, Compose te va a advertir que no puede empujar ese servicio construido citeturn975459search0turn975459search3

Esto te da una regla muy buena:

> si solo querés construir y probar localmente, `build` puede alcanzar  
> si querés además tener una imagen bien nombrada y empujable, conviene `build` + `image`.

---

## Ejemplo más serio

Mirá este archivo:

```yaml
services:
  web:
    build:
      context: ./web
    image: miusuario/miweb:dev
    ports:
      - "8080:80"

  db:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: mysecretpassword
```

### Cómo se lee

- `web` se construye desde `./web`
- la imagen resultante se etiqueta como `miusuario/miweb:dev`
- `db` sigue usando una imagen oficial ya lista
- el stack mezcla un servicio propio construido localmente con una dependencia estándar

Esto se parece muchísimo a un caso real.

---

## Qué conviene pensar sobre tags

Ya viste antes que los tags importan.

Acá la idea práctica es esta:

- para desarrollo local podrías usar algo como `:dev`
- para pruebas puntuales podrías usar algo como `:test`
- para algo más estable podrías usar versiones explícitas

No hace falta profundizar ahora en estrategia completa de versionado de tags.
Solo quiero que veas que `image` te da el lugar donde esa decisión empieza a importar de verdad.

---

## Un detalle útil: build puede ser simple o más explícito

Docker documenta que `build` puede ser simplemente una ruta:

```yaml
build: .
```

o una estructura más detallada:

```yaml
build:
  context: .
  dockerfile: Dockerfile
```

La forma detallada te conviene cuando querés dejar más explícito:

- de dónde se construye
- qué Dockerfile se usa
- o más adelante opciones adicionales del build citeturn975459search0turn975459search2

---

## Qué no tenés que confundir

### Compose no reemplaza el Dockerfile
Lo usa.

### `build` no significa automáticamente “imagen publicada”
Significa imagen construida para el servicio.

### `image` no significa automáticamente “imagen remota”
También puede ser el nombre/tag local que Compose va a usar para la imagen construida.

### Que un servicio tenga `build` no obliga a que todos los demás lo tengan
Un stack real suele mezclar servicios propios y dependencias ya hechas.

---

## Error común 1: usar solo build y después sorprenderte porque no tenés un nombre útil para la imagen

En local puede estar bien, pero cuando querés más control o publicación conviene agregar `image`.

---

## Error común 2: poner image sin entender si la imagen viene de un registry o de tu build

Puede representar ambas cosas según el resto de la definición del servicio.

---

## Error común 3: cambiar el Dockerfile o el código y no reconstruir

Docker documenta claramente que si cambió el Dockerfile o el contenido del directorio de build, necesitás volver a construir. citeturn975459search1

---

## Error común 4: pensar que Compose solo sirve para correr servicios ya listos

No.
Este tema justamente te muestra que Compose puede integrarse al flujo de build de tu aplicación.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá una carpeta con esta estructura:

```text
mi-app-compose/
├── compose.yaml
├── Dockerfile
└── index.html
```

### Ejercicio 2
Creá este `Dockerfile`:

```Dockerfile
FROM nginx:latest
COPY index.html /usr/share/nginx/html/index.html
```

### Ejercicio 3
Creá este `index.html`:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Mi imagen construida con Compose</title>
  </head>
  <body>
    <h1>Hola desde una imagen construida por Compose</h1>
  </body>
</html>
```

### Ejercicio 4
Creá este `compose.yaml`:

```yaml
services:
  web:
    build: .
    ports:
      - "8080:80"
```

### Ejercicio 5
Respondé con tus palabras:

- qué papel cumple el Dockerfile
- qué papel cumple `compose.yaml`
- por qué `web` no usa una imagen remota ya escrita en `image`
- qué tendría que hacer Compose antes de correr el servicio

### Ejercicio 6
Ahora imaginá esta variante:

```yaml
services:
  web:
    build: .
    image: miusuario/miweb:dev
    ports:
      - "8080:80"
```

Y respondé:

- qué cambia respecto al ejemplo anterior
- por qué esta variante es más útil si más adelante querés publicar la imagen
- qué ventaja te da tener un tag explícito

---

## Segundo ejercicio de análisis

Imaginá un stack con estos servicios:

- `web` → tu frontend propio
- `api` → tu backend propio
- `db` → PostgreSQL

Respondé:

- cuáles usarían `build`
- cuáles usarían `image`
- en cuáles te convendría usar `build + image`
- qué servicios son propios y cuáles son dependencias ya hechas
- por qué Compose encaja tan bien en este tipo de proyecto

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué diferencia se te hizo más clara entre Dockerfile y Compose?
- ¿qué servicio de tus proyectos te imaginás definiendo primero con `build`?
- ¿qué ventaja práctica le ves a combinar `build` con `image`?
- ¿en qué momento sentís que Compose ya entra en un terreno más cercano a despliegue real?
- ¿qué parte del flujo te parece más profesional después de este tema?

Estas observaciones valen mucho más que memorizar solo la sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si el servicio usa una imagen ya existente, probablemente me conviene ________.  
> Si el servicio se construye desde mi proyecto, probablemente me conviene ________.  
> Si además quiero que esa imagen tenga un nombre y tag claros para reutilizar o publicar, probablemente me conviene ________.

Y además respondé:

- ¿por qué Compose puede ser parte del flujo de build y no solo del flujo de run?
- ¿qué ventaja te da que una imagen construida tenga nombre explícito?
- ¿qué servicio propio de tus proyectos te gustaría empezar a construir así?
- ¿qué parte te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar cómo Compose construye imágenes propias
- distinguir `build` e `image`
- entender cuándo conviene usar `build + image`
- leer un servicio Compose más cercano a un flujo real de despliegue
- prepararte para temas de etiquetado, publicación y distribución de imágenes

---

## Resumen del tema

- Un servicio Compose puede incluir `build` para construir su propia imagen. citeturn975459search0turn975459search5
- `docker compose build` reconstruye servicios si cambió el Dockerfile o el contenido del directorio de build. citeturn975459search1turn975459search16
- Si no definís `image`, Compose etiqueta por defecto las imágenes construidas con un nombre basado en proyecto y servicio. citeturn975459search1
- Si definís `image`, Compose usa ese nombre/tag para la imagen construida. citeturn975459search0turn975459search1
- Para poder empujar imágenes construidas con `docker compose push`, el servicio necesita `image`. citeturn975459search0turn975459search3
- Este tema abre el bloque donde Compose empieza a acercarse mucho más a flujos reales de build y despliegue.

---

## Próximo tema

En el próximo tema vas a seguir profundizando en este bloque:

- build context
- Dockerfile alternativo
- cómo declarar mejor `build`
- y cómo evitar configuraciones confusas cuando el proyecto ya tiene varias carpetas
