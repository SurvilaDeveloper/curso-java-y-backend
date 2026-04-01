---
title: "Nombres consistentes, tags útiles y docker compose push: empezá a pensar imágenes publicables"
description: "Tema 49 del curso práctico de Docker: cómo elegir nombres y tags más útiles para tus imágenes en Compose, cuándo conviene usar build + image y por qué docker compose push cambia la forma de pensar tus servicios propios."
order: 49
module: "Imágenes propias y flujos más cercanos a despliegue"
level: "intermedio"
draft: false
---

# Nombres consistentes, tags útiles y docker compose push: empezá a pensar imágenes publicables

## Objetivo del tema

En este tema vas a:

- elegir nombres de imagen más útiles dentro de Compose
- usar tags con más intención
- entender mejor cuándo conviene `build + image`
- ver por qué `docker compose push` te obliga a pensar distinto
- empezar a preparar tus servicios para flujos más cercanos a publicación real

La idea es que dejes de construir imágenes “solo para que anden en local” y empieces a pensar en cómo nombrarlas y reutilizarlas mejor.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. recordar cómo Compose construye imágenes
2. entender qué pasa si un servicio tiene solo `build`
3. ver qué cambia si agregás `image`
4. elegir nombres y tags con más criterio
5. entender por qué `docker compose push` vuelve importante esta decisión
6. construir una regla práctica para nombrar mejor tus servicios propios

---

## Idea central que tenés que llevarte

Cuando construís una imagen propia dentro de Compose, tarde o temprano aparece esta pregunta:

> ¿cómo conviene nombrarla?

Y esa pregunta importa mucho más de lo que parece.

Dicho simple:

- si solo construís para una prueba local, podés vivir con defaults
- si querés reutilizar, compartir o publicar la imagen, conviene que tenga un nombre y un tag claros
- ahí `image` empieza a ser mucho más importante, incluso si el servicio también usa `build`

---

## Recordatorio rápido del tema anterior

En el tema 48 viste que:

- `build` puede ser simple o detallado
- `context` define qué archivos puede usar el builder
- `dockerfile` te ayuda a ser más explícito cuando el proyecto crece

Ahora toca la siguiente capa de madurez:

- cómo se llama la imagen resultante
- cómo se etiqueta
- y qué pasa si querés empujarla fuera de tu máquina local

---

## Qué dice la documentación oficial

Docker documenta varias ideas muy importantes para este tema:

- `docker compose build` construye servicios y, si no definiste `image`, etiqueta por defecto la imagen como `project-service`. citeturn840818search1
- si el servicio sí tiene `image`, Compose etiqueta la imagen construida con ese nombre. citeturn840818search1turn840818search0
- Compose con soporte de build puede empujar imágenes construidas, pero no intenta empujar servicios construidos que no tengan `image`; además muestra una advertencia por esa ausencia. citeturn840818search0
- el servicio puede incluir `build` sin dejar de ser válido, y `image` sigue siendo parte de la definición del servicio Compose. citeturn840818search13turn840818search4

---

## El caso más simple: solo build

Supongamos este servicio:

```yaml
services:
  web:
    build: .
    ports:
      - "8080:80"
```

### Qué significa
- Compose va a construir la imagen de `web`
- pero no le diste un nombre explícito con `image`

Docker documenta que, en este caso, la imagen se etiqueta por defecto como `project-service`. citeturn840818search1

Eso puede estar perfectamente bien para desarrollo local.

---

## Qué problema tiene ese default

El problema no es que esté “mal”.

El problema es que puede volverse poco útil cuando querés:

- reconocer la imagen rápido
- reutilizarla fuera del proyecto actual
- etiquetarla por entorno o versión
- publicarla a un registry

El nombre por defecto depende del proyecto Compose y del servicio.
Sirve para local, pero no siempre comunica bien la intención.

---

## El siguiente paso: build + image

Ahora mirá este servicio:

```yaml
services:
  web:
    build: .
    image: miusuario/miweb:dev
    ports:
      - "8080:80"
```

### Qué cambia
- Compose sigue construyendo la imagen desde tu proyecto
- pero ahora la imagen resultante recibe el nombre/tag explícito `miusuario/miweb:dev`

Docker documenta justamente que, cuando el servicio tiene `image`, la imagen construida se etiqueta con ese nombre. citeturn840818search1turn840818search0

---

## Por qué esto es tan útil

Porque ahora la imagen deja de ser simplemente “la del proyecto actual”.

Pasa a ser algo más reutilizable y reconocible.

Por ejemplo, podés pensar:

- `miusuario/miweb:dev`
- `miusuario/miweb:test`
- `miusuario/miweb:1.0.0`

Esto cambia muchísimo la claridad del flujo.

---

## Qué papel juega image cuando pensás en publicar

Acá aparece un punto clave.

Docker documenta que Compose puede empujar imágenes construidas, pero **no intenta empujar servicios construidos que no tengan `image`**. Además avisa que la falta de `image` impide empujar esas imágenes. citeturn840818search0

Eso te da una regla muy fuerte:

> si querés publicar imágenes construidas desde Compose, no alcanza con `build`; conviene definir también `image`.

---

## Qué hace docker compose push

La idea general de `docker compose push` es empujar las imágenes de los servicios a un registry.

Pero esto tiene sentido real solo si esas imágenes tienen un nombre publicable y explícito.

Por eso `image` deja de ser un detalle y pasa a ser una decisión importante del stack. Docker lo deja claro en la especificación de build y en el comportamiento de `compose push`. citeturn840818search0

---

## Cuándo conviene seguir con solo build

Seguir con:

```yaml
build: .
```

puede seguir estando perfecto cuando:

- estás en un proyecto chico
- el flujo es solo local
- no te importa todavía publicar o compartir la imagen
- querés un ejemplo simple o una práctica rápida

No hace falta complejizar antes de tiempo.

---

## Cuándo conviene pasar a build + image

Conviene mucho cuando:

- querés un nombre claro para la imagen
- querés distinguir mejor desarrollo, test y release
- querés reutilizar la imagen en otros flujos
- querés empezar a pensar en push
- querés un stack más profesional y menos atado a defaults internos de Compose

---

## Qué hace que un nombre sea más útil

No hay una única estrategia perfecta, pero sí algunas ideas bastante útiles.

Un nombre suele ser más útil cuando deja claro:

- quién es el repositorio o namespace
- qué servicio representa
- qué tag o etapa representa

Por ejemplo:

```text
miusuario/frontend:dev
miusuario/api:test
miusuario/web:1.0.0
```

Esto suele comunicar mucho mejor que depender solo del nombre automático derivado del proyecto.

---

## Qué papel juegan los tags

Los tags te permiten distinguir variantes o estados de una misma imagen.

No hace falta que armes todavía una política de versionado compleja.
Para este curso, alcanza con que te quede claro esto:

- `:dev` puede servir para desarrollo
- `:test` puede servir para pruebas
- un tag más estable puede servir para releases o versiones

La idea importante es que el tag también comunica intención.

---

## Un ejemplo más serio

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

Podrías declarar algo así:

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

  db:
    image: postgres:18
    environment:
      POSTGRES_PASSWORD: mysecretpassword
```

---

## Cómo se lee este stack

La lectura conceptual sería:

- `frontend` y `api` son servicios propios, construidos desde tu repo
- ambos tienen nombre y tag explícitos
- `db` sigue siendo una dependencia oficial ya hecha
- el stack mezcla servicios construidos por vos con servicios que vienen de imágenes estándar

Esto se parece muchísimo a un flujo real.

---

## Qué ventaja tiene para vos o para un equipo

Tener nombres explícitos ayuda a:

- reconocer mejor qué imagen corresponde a qué servicio
- evitar ambigüedad cuando hay varias imágenes locales
- pensar más fácil en `push`
- separar entornos o etapas con tags distintos
- compartir un criterio común dentro de un equipo

Esto ya empieza a oler bastante más a despliegue real y menos a prueba aislada.

---

## Un detalle útil: imagen construida no significa imagen publicada

Esto también conviene dejarlo clarísimo.

Que Compose construya y etiquete una imagen con:

```yaml
image: miusuario/frontend:dev
```

no significa que ya esté publicada.

Significa que la imagen local resultante tiene ese nombre/tag.
Después, si querés llevarla a un registry, aparece el paso de `docker compose push` y el login correspondiente al registry.

---

## Qué no tenés que confundir

### `image` no significa automáticamente “imagen remota”
También puede ser el nombre/tag que querés darle a una imagen construida localmente.

### `build` no significa automáticamente “imagen publicable”
Construye la imagen, pero sin `image` te puede faltar un nombre útil para publicarla.

### El nombre por defecto no es incorrecto
Simplemente puede quedarse corto cuando el flujo deja de ser puramente local.

### Tag útil no significa “tag complicado”
A veces `:dev` o `:test` ya resuelven muchísimo.

---

## Error común 1: construir imágenes propias sin darles un nombre claro

En local puede pasar desapercibido, pero más adelante se vuelve incómodo.

---

## Error común 2: pensar que docker compose push va a “adivinar” qué nombre usar

Docker documenta que los servicios construidos sin `image` no se empujan. citeturn840818search0

---

## Error común 3: usar siempre :latest sin pensar

No siempre es terrible, pero muchas veces comunicar la etapa o el entorno con un tag más explícito ayuda bastante.

---

## Error común 4: dar nombres distintos y caóticos según cada servicio o entorno

Conviene buscar un criterio consistente. Eso hace que el stack sea mucho más fácil de entender.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Tomá este servicio:

```yaml
services:
  web:
    build: .
    ports:
      - "8080:80"
```

Y respondé:

- qué hace Compose con la imagen
- qué le falta si más adelante quisieras publicarla mejor
- por qué el nombre por defecto puede alcanzarte en local

### Ejercicio 2
Ahora mirá esta variante:

```yaml
services:
  web:
    build: .
    image: miusuario/miweb:dev
    ports:
      - "8080:80"
```

Y respondé:

- qué ventaja te da `image`
- por qué ahora la imagen queda mejor nombrada
- por qué este servicio queda mejor preparado para `docker compose push`

### Ejercicio 3
Imaginá un stack con:

- `frontend`
- `api`
- `db`

Respondé:

- cuáles definirías con `build + image`
- cuál dejarías solo con `image`
- qué tags usarías en desarrollo

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué servicios propios construirías con Compose
- qué nombres les pondrías
- qué tags usarías para desarrollo y prueba
- en cuáles te interesa que la imagen quede pensada para futuro push
- qué ventaja te daría dejar eso ordenado desde ahora

No hace falta que publiques nada todavía.
La idea es empezar a pensar mejor el diseño del stack.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre imagen construida y nombre de imagen?
- ¿en qué momento `image` empieza a volverse importante de verdad?
- ¿qué servicio tuyo te gustaría nombrar primero con un tag explícito?
- ¿por qué este tema ya se siente más cercano a despliegue real?
- ¿qué parte de tus stacks hoy está nombrada de forma más improvisada de lo que te gustaría?

Estas observaciones valen mucho más que memorizar una bandera.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero construir una imagen solo para pruebas locales, puede alcanzarme con ________.  
> Si quiero construirla y además dejarla bien nombrada para reutilizar o publicar, probablemente me conviene ________.  
> Si quiero empujar una imagen construida con Compose, necesito ________.

Y además respondé:

- ¿por qué el nombre por defecto puede quedarse corto?
- ¿qué ventaja te da un tag explícito como `:dev`?
- ¿qué servicio tuyo te gustaría dejar preparado para `push`?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- entender por qué `image` se vuelve importante cuando pensás en publicación
- distinguir mejor `build`, `image` y `build + image`
- elegir nombres y tags más útiles para tus imágenes
- preparar servicios propios para flujos más serios
- acercarte un poco más a una forma de trabajo real con Compose y registries

---

## Resumen del tema

- `docker compose build` etiqueta por defecto las imágenes construidas como `project-service` si no definís `image`. citeturn840818search1
- Si el servicio sí define `image`, Compose usa ese nombre/tag para la imagen construida. citeturn840818search1turn840818search0
- `docker compose push` no intenta empujar servicios construidos que no tengan `image`. citeturn840818search0
- Usar `build + image` suele ser la mejor base cuando querés nombres claros y un flujo más cercano a publicación.
- Este tema te ayuda a salir del build “solo local” y pensar imágenes propias con más intención.

---

## Próximo tema

En el próximo tema vas a bajar esto a un flujo todavía más concreto:

- `docker compose build`
- `docker compose push`
- qué pasa antes de empujar
- qué necesita el servicio
- y cómo se ve un flujo básico de publicación sin complicarlo de más
