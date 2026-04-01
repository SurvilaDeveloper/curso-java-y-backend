---
title: "Flujo básico de publicación con Compose: build, login y docker compose push sin mezclar conceptos"
description: "Tema 50 del curso práctico de Docker: cómo se ve un flujo básico de publicación de imágenes con Docker Compose, qué necesita un servicio para poder hacer push, qué papel juegan build e image y cómo pensar build local y publicación como pasos relacionados pero distintos."
order: 50
module: "Imágenes propias y flujos más cercanos a despliegue"
level: "intermedio"
draft: false
---

# Flujo básico de publicación con Compose: build, login y docker compose push sin mezclar conceptos

## Objetivo del tema

En este tema vas a:

- entender qué necesita un servicio para poder hacer `docker compose push`
- ver un flujo básico de build + push sin complicarlo de más
- distinguir imagen construida localmente e imagen publicada
- entender el papel de `docker login`
- preparar tus servicios propios para un flujo más cercano a despliegue real

La idea es que veas la publicación de imágenes como un paso natural después de construirlas, pero sin mezclar etapas ni asumir magia.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. definir un servicio propio con `build + image`
2. construir la imagen del servicio
3. entender por qué hace falta un nombre de imagen publicable
4. autenticarte en el registry
5. empujar la imagen con `docker compose push`
6. separar mentalmente build local y publicación

---

## Idea central que tenés que llevarte

Cuando una imagen deja de ser solo para tu máquina y querés compartirla o reutilizarla desde un registry, el flujo cambia.

Ya no alcanza con que Compose la construya.

Ahora también importa:

- cómo se llama
- qué tag tiene
- si estás autenticado
- si el servicio está preparado para push

Dicho simple:

> construir una imagen y publicarla son pasos distintos  
> y `docker compose push` te obliga a tratar el nombre de la imagen como algo importante.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker indica que `docker compose push` empuja las imágenes de los servicios a su registry o repositorio correspondiente y asume que ya construiste la imagen localmente. También explica que los servicios construidos sin atributo `image` no se empujan y Compose te lo advierte. La referencia de `docker compose build` recuerda que, si un servicio no tiene `image`, Compose lo etiqueta por defecto como `project-service`; si sí tiene `image`, usa ese nombre/tag. Además, la documentación de `docker image push` remarca que el proceso de push usa las credenciales gestionadas por `docker login`. citeturn577183search0turn577183search3turn577183search1turn577183search5

---

## Recordatorio rápido del tema anterior

En el tema 49 viste que:

- un servicio puede tener solo `build`
- o puede tener `build + image`
- `image` se vuelve mucho más importante cuando querés un nombre claro o pensás en publicación

Ahora toca bajar esa idea a un flujo concreto.

---

## Qué problema resuelve este tema

Hasta ahora venías construyendo imágenes para usarlas en tu entorno local.

Pero en cuanto querés hacer algo como esto:

- compartir la imagen con otra máquina
- dejarla lista para otro entorno
- reutilizarla más tarde sin volver a construir
- empezar a pensar en despliegue

aparece el paso de push.

Y ahí Compose necesita que el servicio esté preparado.

---

## Punto clave 1: no todo servicio del stack está pensado para push

En un stack Compose real, suele haber dos tipos de servicios:

### Servicios propios
Los construís vos y son candidatos a publicación.

### Dependencias ya hechas
Usan imágenes oficiales o externas y normalmente no son “tu imagen” para publicar.

Por ejemplo:

- `frontend` propio → sí podría publicarse
- `api` propia → sí podría publicarse
- `db` usando `postgres:18` → no es una imagen tuya para empujar

Esto te ayuda a no tratar a todo el stack como si tuviera el mismo rol.

---

## Punto clave 2: un servicio construible no siempre es automáticamente empujable

Mirá este servicio:

```yaml
services:
  web:
    build: .
```

### Qué pasa
Compose puede construirlo.

### Qué falta
No tiene un `image` explícito.

La documentación oficial de Docker aclara que Compose no intenta empujar servicios construidos que no tengan `image`. citeturn577183search0turn577183search1

Por eso, si pensás en push, este servicio todavía está incompleto.

---

## El patrón básico para un servicio publicable

La forma más clara y práctica es esta:

```yaml
services:
  web:
    build: .
    image: miusuario/miweb:dev
```

### Qué significa
- Compose construye la imagen desde tu proyecto
- la imagen local resultante queda etiquetada como `miusuario/miweb:dev`
- ese nombre ya está listo para ser usado en un flujo de publicación

Esto es mucho más útil que depender del nombre automático `project-service`.

---

## Qué rol cumple el tag acá

El tag te ayuda a distinguir la variante de la imagen.

Por ejemplo:

- `:dev`
- `:test`
- `:1.0.0`

No hace falta que armes todavía una política compleja de versionado.
Lo importante es entender que el tag no es decoración: comunica intención.

---

## Flujo mental correcto

Conviene pensar el flujo así:

### Paso 1
Construyo la imagen.

### Paso 2
Verifico que tiene un nombre y tag correctos.

### Paso 3
Me autentico en el registry.

### Paso 4
La empujo.

Esto ayuda a no mezclar conceptos.

---

## Ejemplo mínimo de proyecto

Imaginá esta estructura:

```text
mi-app-publicable/
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
    image: miusuario/miweb:dev
    ports:
      - "8080:80"
```

---

## Cómo se lee este ejemplo

La lectura conceptual sería:

- `web` es un servicio propio
- su imagen se construye desde el proyecto actual
- la imagen resultante se etiqueta como `miusuario/miweb:dev`
- eso deja al servicio listo para un flujo de build + push

Esto ya te pone en un terreno bastante más realista.

---

## Paso 1 del flujo: build

Podés construir con:

```bash
docker compose build
```

o si querés solo el servicio:

```bash
docker compose build web
```

La documentación oficial indica que `docker compose build` reconstruye servicios si cambió el Dockerfile o el contenido del directorio de build. También remarca cómo se etiqueta la imagen resultante según tenga o no `image`. citeturn577183search3turn577183search1

---

## Qué lográs después del build

Después del build, la imagen existe localmente y ya tiene el nombre/tag que le definiste con `image`.

Eso no significa todavía que esté publicada.

Significa que en tu máquina ya existe una imagen local lista para poder correrse o empujarse.

Esa diferencia es muy importante.

---

## Paso 2 del flujo: login

Antes de empujar una imagen a un registry, necesitás autenticarte.

La documentación oficial del comando `docker image push` remarca que las credenciales del registry se gestionan con `docker login`. citeturn577183search5

Por eso, en un flujo básico, aparece algo como:

```bash
docker login
```

O el login del registry que corresponda si no es Docker Hub.

---

## Qué rol cumple docker login

No construye.
No etiqueta.
No publica por sí solo.

Lo que hace es dejar autenticada tu sesión para que el push pueda funcionar contra el registry destino.

Esto conviene tenerlo bien separado mentalmente.

---

## Paso 3 del flujo: push

Ahora sí aparece:

```bash
docker compose push
```

O si quisieras un servicio puntual:

```bash
docker compose push web
```

La documentación oficial define `docker compose push` como el comando que empuja las imágenes de los servicios a su repositorio o registry correspondiente. También asume que esas imágenes ya fueron construidas localmente y que tenés acceso al registry. citeturn577183search0

---

## Qué hace docker compose push

- toma los servicios preparados para push
- usa el `image` de cada uno como referencia
- empuja esas imágenes al registry correspondiente

Y acá vuelve a verse por qué `image` importa tanto.

Sin ese nombre, Compose no sabe bien qué referencia publicable usar para un servicio construido.

---

## Qué pasa con servicios sin image

Docker lo documenta explícitamente:
si un servicio tiene `build` pero no tiene `image`, Compose muestra un warning y no lo empuja. citeturn577183search0turn577183search1

Esto es una de las ideas más importantes del tema.

Por eso, cuando querés publicación, `build + image` suele ser la combinación más razonable.

---

## Qué pasa con servicios que no construís vos

Supongamos un stack así:

```yaml
services:
  web:
    build: .
    image: miusuario/miweb:dev

  db:
    image: postgres:18
```

La idea útil es esta:

- `web` es tu candidata natural a build + push
- `db` es una dependencia ya publicada por otro

No hace falta que conviertas toda dependencia del stack en algo que vos empujás.

---

## Cuándo tiene sentido push en un flujo real

Tiene sentido cuando querés:

- subir una imagen a Docker Hub o a otro registry
- reutilizarla desde otra máquina
- separar build local y run en otro entorno
- preparar un paso previo a despliegue

No hace falta que hoy mismo montes todo un pipeline.
Lo importante es que entiendas el flujo.

---

## Qué no tenés que confundir

### `build` no publica
Solo construye localmente.

### `image` no publica
Solo nombra o referencia la imagen.

### `docker login` no construye ni etiqueta
Solo autentica frente al registry.

### `docker compose push` no “inventa” nombres de imagen adecuados para servicios construidos sin image
Si falta `image`, Compose no empuja esos servicios. citeturn577183search0turn577183search1

---

## Error común 1: pensar que docker compose build ya deja la imagen “en internet”

No.

La deja construida en tu máquina.

---

## Error común 2: olvidar image y después sorprenderte porque push no empuja el servicio construido

La documentación oficial justamente avisa eso. citeturn577183search0turn577183search1

---

## Error común 3: no hacer login y culpar al nombre de la imagen

El flujo necesita autenticación además de buen naming.

---

## Error común 4: querer publicar todo el stack como si todos los servicios fueran tuyos

Muchas dependencias oficiales no forman parte de “tus imágenes para publicar”.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá este `compose.yaml`:

```yaml
services:
  web:
    build: .
    image: miusuario/miweb:dev
    ports:
      - "8080:80"
```

### Ejercicio 2
Respondé con tus palabras:

- qué papel cumple `build`
- qué papel cumple `image`
- por qué esta definición deja al servicio mejor preparado para push

### Ejercicio 3
Imaginá este flujo:

```bash
docker compose build
docker login
docker compose push
```

Y respondé:

- qué hace cada paso
- por qué no conviene mezclar sus roles
- en qué paso la imagen pasa a estar realmente publicada

### Ejercicio 4
Ahora compará con esta variante:

```yaml
services:
  web:
    build: .
```

Y respondé:

- qué puede hacer Compose
- qué no podría hacer bien si quisieras usar `docker compose push`
- qué te enseña eso sobre la importancia de `image`

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué servicio tuyo te gustaría dejar preparado para publicación
- qué nombre le pondrías
- qué tag usarías para desarrollo
- qué tag te imaginarías para una versión más estable
- qué servicios del stack dejarías solo como dependencias externas y no empujarías vos

No hace falta publicar nada todavía.
La idea es empezar a pensar mejor el diseño de tus imágenes.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre imagen local y publicada?
- ¿en qué momento `image` te parece dejar de ser opcional?
- ¿qué parte del flujo te parece más cercana a despliegue real?
- ¿qué servicio tuyo te gustaría tener bien nombrado desde ahora?
- ¿qué parte de tus stacks hoy está preparada solo para local y te gustaría ordenar mejor?

Estas observaciones valen mucho más que repetir comandos.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si solo quiero construir localmente, puede alcanzarme con ________.  
> Si quiero construir y además dejar la imagen lista para publicación, probablemente me conviene ________.  
> Si quiero publicarla en un registry, necesito además pasar por ________ y luego por ________.

Y además respondé:

- ¿por qué `docker compose push` cambia la forma de pensar el servicio?
- ¿qué ventaja te da separar build local y publicación?
- ¿qué imagen tuya te gustaría dejar preparada primero para este flujo?
- ¿qué te gustaría seguir aprendiendo después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- entender el flujo básico build + login + push
- explicar por qué `image` es importante para publicar servicios construidos
- distinguir imagen local de imagen publicada
- elegir nombres y tags con más intención
- prepararte para flujos más serios de distribución de imágenes

---

## Resumen del tema

- `docker compose push` empuja imágenes de servicios a su registry o repositorio correspondiente. citeturn577183search0
- Compose asume que esas imágenes ya fueron construidas localmente antes del push. citeturn577183search0
- Si un servicio construido no tiene `image`, Compose no lo empuja y lo advierte. citeturn577183search0turn577183search1
- `docker compose build` etiqueta por defecto como `project-service` si no definís `image`; si sí la definís, usa ese nombre/tag. citeturn577183search3turn577183search1
- `docker login` gestiona las credenciales usadas luego para push al registry. citeturn577183search5
- Este tema te acerca bastante más a un flujo de imágenes real y reutilizable.

---

## Próximo tema

En el próximo tema vas a seguir avanzando en este bloque, ya con una mirada más fina sobre el build dentro de Compose:

- args de build
- parametrización de imágenes
- qué entra al build y qué no
- y cómo seguir haciendo tus servicios más flexibles sin volver el stack ilegible
