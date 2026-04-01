---
title: "De imagen local a imagen publicable: nombres, tags y push al registry sin confusiones"
description: "Tema 98 del curso práctico de Docker: cómo pasar de una imagen local a una imagen publicable, entender el formato de referencia de imagen, elegir buenos tags, autenticarte y usar docker push sin confundir nombre local, namespace, repositorio y registry."
order: 98
module: "Publicación de imágenes, tags y registries"
level: "intermedio"
draft: false
---

# De imagen local a imagen publicable: nombres, tags y push al registry sin confusiones

## Objetivo del tema

En este tema vas a:

- entender qué convierte a una imagen local en una imagen publicable
- distinguir registry, namespace, repository y tag
- nombrar y tagear imágenes con más criterio
- usar `docker login`, `docker tag` y `docker push` sin mezclar conceptos
- evitar errores comunes como `requested access to the resource is denied`

La idea es que dejes de ver el `docker push` como “subir una imagen” a secas y empieces a entender que **el nombre completo de la imagen ya define a qué registry y repositorio va a intentar publicarse**.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué es un registry y qué es un repositorio
2. leer bien una referencia completa de imagen
3. entender qué hace realmente un tag
4. tagear una imagen local con nombre publicable
5. autenticarte y hacer push
6. construir una regla práctica para publicar sin confusiones

---

## Idea central que tenés que llevarte

Una imagen local no se vuelve “publicable” solo porque exista en tu máquina.

Se vuelve publicable cuando tiene un **nombre de imagen correcto para el registry de destino** y vos tenés permisos para empujarla ahí.

Docker lo explica claramente en su documentación oficial: una referencia de imagen combina registry, path y tag. Para Docker Hub, el path sigue el formato `[NAMESPACE/]REPOSITORY`, y si no especificás tag, Docker usa `latest`. Una vez que la imagen tiene ese nombre y estás autenticado, `docker push` la publica en el registry que esa referencia indique. citeturn862041search1turn862041search0turn862041search2

Dicho simple:

> `docker push` no “adivina” dónde subir tu imagen.  
> Lo decide según el nombre completo que le hayas dado.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker deja varias ideas muy claras para este tema:

- un **registry** es un lugar centralizado para almacenar y compartir imágenes; Docker Hub es el registry público por defecto. citeturn862041search7turn862041search11
- una referencia de imagen está compuesta por partes como registry, namespace/repository y tag. Docker muestra ejemplos como `nginx`, `docker/welcome-to-docker` o `ghcr.io/dockersamples/example-voting-app-vote:pr-311`. citeturn862041search1turn862041search0
- si no especificás tag, el default es `latest`. citeturn862041search1turn862041search4
- `docker image tag` asigna un nuevo nombre/tag a una imagen local, incluyendo el hostname del registry si hace falta. citeturn862041search0
- antes de poder hacer push a un repositorio, necesitás autenticarte con `docker login`. citeturn862041search1turn862041search3turn862041search5
- un repositorio de Docker Hub organiza imágenes por tags, y esos tags representan diferentes versiones o variantes. citeturn862041search9turn862041search4

---

## Primer concepto: qué es un registry

Docker define un image registry como una ubicación centralizada para almacenar y compartir imágenes. Puede ser público o privado. Docker Hub es el registry público por defecto. citeturn862041search7turn862041search11

### Ejemplos de registries
- Docker Hub
- GitHub Container Registry (`ghcr.io`)
- un registry privado propio
- un registry de una empresa o proveedor cloud

La idea importante es esta:
**el registry es el destino general**, no el nombre de tu imagen en sí.

---

## Segundo concepto: qué es un repository

Dentro del registry, Docker Hub organiza imágenes en **repositories**.

La documentación oficial de Docker Hub explica que un repository es el espacio donde almacenás y administrás imágenes de una app o servicio, organizado por tags. citeturn862041search9

Por ejemplo:

```text
gabriel/mi-app
```

ahí:

- `gabriel` sería el namespace
- `mi-app` el repository

Y dentro de ese repository puede haber tags como:

- `latest`
- `1.0.0`
- `dev`
- `prod`
- `2026-03-31`

---

## Tercer concepto: cómo leer una referencia de imagen

Docker muestra la estructura conceptual así:

```text
[REGISTRY_HOST[:PORT]/]PATH[:TAG]
```

Y para Docker Hub, ese `PATH` sigue el formato:

```text
[NAMESPACE/]REPOSITORY
```

citeturn862041search1turn862041search0

---

## Ejemplos concretos

### Ejemplo 1
```text
nginx
```

Docker explica que esto equivale a:

```text
docker.io/library/nginx:latest
```

porque:
- registry implícito: Docker Hub (`docker.io`)
- namespace implícito: `library`
- repository: `nginx`
- tag implícito: `latest` citeturn862041search1

### Ejemplo 2
```text
gabriel/mi-app:1.0.0
```

Esto se leería como:
- registry implícito: Docker Hub
- namespace: `gabriel`
- repository: `mi-app`
- tag: `1.0.0`

### Ejemplo 3
```text
ghcr.io/gabriel/mi-app:main
```

Esto ya apunta a otro registry distinto: GitHub Container Registry.

---

## Qué te enseña esto

Te enseña algo fundamental:

> el nombre de la imagen no es “decorativo”.  
> Ya contiene la dirección lógica de publicación.

Por eso, si tageás una imagen como:

```text
gabriel/mi-app:1.0.0
```

y hacés `docker push gabriel/mi-app:1.0.0`, Docker va a intentar publicarla en Docker Hub bajo ese namespace/repository/tag.

---

## Cuarto concepto: qué hace un tag

Docker Hub documenta que los tags te permiten gestionar múltiples versiones de imágenes dentro de un mismo repository. Si no especificás tag, el valor por defecto es `latest`. citeturn862041search4turn862041search1

La idea útil es esta:

- el repository agrupa la familia de imágenes
- el tag distingue versión o variante

---

## Qué no deberías pensar del tag

No deberías pensar que el tag es una versión “mágica” o inmutable por sí sola.

Para este tema alcanza con entender que:

- el tag identifica una variante o versión legible
- si no lo ponés, Docker usa `latest`
- conviene elegir tags con intención, no por inercia

Más adelante podrías profundizar estrategias como:
- `latest`
- semver
- tags por branch
- tags por commit
- tags por entorno

Pero hoy el foco es publicar sin confusiones.

---

## Quinto concepto: build con tag directo

Docker documenta que podés darle nombre/tag a la imagen directamente durante el build con `-t`.

Por ejemplo:

```bash
docker build -t gabriel/mi-app:1.0.0 .
```

citeturn862041search1

### Qué gana esto
- la imagen ya sale del build con nombre publicable
- no necesitás tagearla después si ya sabés el destino
- el flujo queda más directo

---

## Sexto concepto: `docker image tag`

Si ya tenés una imagen local, Docker documenta que podés asignarle otro nombre/tag usando `docker image tag`. citeturn862041search0

Por ejemplo:

```bash
docker image tag mi-app-local gabriel/mi-app:1.0.0
```

### Cómo se lee
- `mi-app-local` es una referencia local existente
- `gabriel/mi-app:1.0.0` es el nombre nuevo, listo para publicarse en Docker Hub

Esto es muy útil cuando primero construiste algo local y después querés dejarlo listo para push.

---

## Séptimo concepto: autenticación antes del push

Docker deja esto muy claro:
antes de poder empujar una imagen a un repository, necesitás autenticarte. citeturn862041search1turn862041search3turn862041search5

El comando normal es:

```bash
docker login
```

Y después de eso ya podés hacer push, siempre que:

- estés logueado
- el namespace/repository exista o sea uno donde tengas permisos
- el nombre esté bien escrito

---

## Octavo concepto: `docker push`

La referencia oficial de `docker image push` explica que sirve para compartir imágenes en Docker Hub o en un registry self-hosted. citeturn862041search2

Por ejemplo:

```bash
docker push gabriel/mi-app:1.0.0
```

### Qué hace realmente
- toma la referencia completa
- identifica el registry de destino
- sube las layers necesarias
- publica la imagen bajo ese repository/tag

No hace falta “seleccionar” el destino aparte.
Ya está en el nombre.

---

## Flujo sano completo

Un flujo muy razonable sería:

### Opción A: build con nombre publicable directo
```bash
docker build -t gabriel/mi-app:1.0.0 .
docker login
docker push gabriel/mi-app:1.0.0
```

### Opción B: build local primero, tag después
```bash
docker build -t mi-app-local .
docker image tag mi-app-local gabriel/mi-app:1.0.0
docker login
docker push gabriel/mi-app:1.0.0
```

Ambas son válidas.
La diferencia es cuándo le das nombre “publicable”.

---

## Un error muy común: `requested access to the resource is denied`

La guía oficial de “Build, tag, and publish an image” menciona este error y sugiere revisar dos cosas clave:

- que estés autenticado
- que el username/namespace del tag sea correcto citeturn862041search1

---

## Qué suele significar ese error

Suele significar una de estas cosas:

- no hiciste `docker login`
- el namespace no es tuyo
- el repository/tag apunta a un lugar donde no tenés permisos
- escribiste mal el nombre del usuario u organización

No suele ser “Docker se rompió”.
Suele ser un problema de referencia o permisos.

---

## Un detalle importante sobre registries no Docker Hub

Docker también documenta que, si querés empujar a un registry privado, tenés que incluir el hostname y el puerto si hace falta. citeturn862041search0

Por ejemplo:

```bash
docker image tag mi-app-local myregistryhost:5000/gabriel/mi-app:1.0.0
docker push myregistryhost:5000/gabriel/mi-app:1.0.0
```

### Qué enseña esto
- el registry no se configura por “magia” aparte
- el nombre de la imagen ya lo incluye

---

## Qué no tenés que confundir

### Registry no es lo mismo que repository
El registry es la plataforma o servidor; el repository es el espacio de una imagen dentro de ese registry. citeturn862041search7turn862041search9

### Tag no es lo mismo que repository
El repository agrupa; el tag diferencia versiones o variantes. citeturn862041search4turn862041search9

### `docker tag` no sube nada por sí solo
Solo crea otra referencia local hacia la imagen. citeturn862041search0

### `docker push` no decide el destino aparte del nombre
El destino ya está en la referencia completa. citeturn862041search0turn862041search2

---

## Error común 1: buildar con un nombre local y después intentar push sin darle un nombre publicable

Ahí suele faltar `docker tag`.

---

## Error común 2: confiar demasiado en `latest`

Docker documenta que, si no hay tag, usa `latest`. citeturn862041search1turn862041search4

Pero para publicar con más claridad, muchas veces conviene usar tags más explícitos.

---

## Error común 3: escribir mal el namespace del repository

Eso suele llevar directo a errores de acceso o permisos. citeturn862041search1

---

## Error común 4: creer que Docker Hub es el único registry posible

Es el default público, pero no el único. citeturn862041search7turn862041search0

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Compará estas referencias:

```text
nginx
gabriel/mi-app:1.0.0
ghcr.io/gabriel/mi-app:main
```

Respondé con tus palabras:

- cuál apunta implícitamente a Docker Hub Official Images
- cuál apunta a Docker Hub con namespace de usuario
- cuál apunta a otro registry
- qué parte de cada nombre representa el tag

### Ejercicio 2
Mirá este flujo:

```bash
docker build -t mi-app-local .
docker image tag mi-app-local gabriel/mi-app:1.0.0
docker login
docker push gabriel/mi-app:1.0.0
```

Respondé:

- qué hace `docker build`
- qué hace `docker image tag`
- qué hace `docker login`
- qué hace `docker push`
- por qué el nombre `gabriel/mi-app:1.0.0` ya define el destino lógico

### Ejercicio 3
Respondé además:

- por qué `requested access to the resource is denied` suele apuntar a permisos o naming
- por qué `latest` no siempre es el tag más claro
- cuándo necesitarías incluir hostname y puerto en la referencia

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué nombre local le estás dando hoy a la imagen
- qué nombre publicable te gustaría usar en Docker Hub u otro registry
- qué tag te parece más claro para publicar primero
- si hoy estás confiando demasiado en `latest`
- qué error te gustaría evitar primero al momento de hacer push

No hace falta publicar nada todavía.
La idea es afinar criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre registry, repository y tag?
- ¿en qué proyecto tuyo hoy el naming de la imagen todavía es demasiado local o improvisado?
- ¿qué tag te parecería más útil para empezar a publicar con más claridad?
- ¿qué parte del flujo build/tag/login/push te parece más fácil de confundir?
- ¿qué mejora concreta te gustaría notar después de ordenar bien el naming?

Estas observaciones valen mucho más que memorizar una sola sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si quiero publicar una imagen, primero necesito darle un nombre ________ para el registry de destino.  
> Si ya construí la imagen pero todavía no tiene ese nombre, probablemente me conviene usar `docker image ________`.  
> Si quiero subirla al registry, probablemente me conviene hacer `docker ________`.  
> Si el repository es privado o no es Docker Hub, probablemente el nombre de la imagen debe incluir el ________ del registry.

Y además respondé:

- ¿por qué este tema impacta tanto en pasar de “imagen local” a “imagen reutilizable”?
- ¿qué servicio tuyo te gustaría revisar primero con esta lógica?
- ¿qué riesgo evitás al no improvisar namespace, repository y tag?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es un registry y qué es un repository
- leer mejor una referencia completa de imagen
- tagear imágenes con nombres publicables
- usar `docker login` y `docker push` con más criterio
- evitar errores comunes de permisos o naming
- pasar de imagen local a imagen publicable con bastante más claridad

---

## Resumen del tema

- Un registry es una ubicación centralizada para almacenar y compartir imágenes; Docker Hub es el registry público por defecto. citeturn862041search7turn862041search11
- En Docker Hub, el path de una imagen sigue el formato `[NAMESPACE/]REPOSITORY`, y si no especificás tag, Docker usa `latest`. citeturn862041search1turn862041search4
- `docker image tag` asigna un nuevo nombre/tag a una imagen local. citeturn862041search0
- Antes de poder hacer push, necesitás autenticarte con `docker login`. citeturn862041search1turn862041search3turn862041search5
- `docker push` publica la imagen al registry que indica la referencia completa. citeturn862041search2turn862041search0
- Los repositories de Docker Hub organizan imágenes por tags, que representan diferentes versiones o variantes. citeturn862041search9turn862041search4
- Este tema te deja una base muy sólida para empezar a publicar imágenes con nombres mucho más claros y menos errores de destino o permisos.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque con otra capa muy útil de naming y publicación:

- estrategias de tags
- latest vs semver vs dev
- cómo pensar tags por entorno o por commit
- y cómo evitar publicar imágenes con nombres poco informativos
