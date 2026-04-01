---
title: "Secrets en build con Compose: pasá datos sensibles al build sin pegarlos en la imagen"
description: "Tema 56 del curso práctico de Docker: cómo usar secrets durante el build con Docker Compose, por qué ARG y ENV no son adecuados para datos sensibles y cómo montar secretos de forma segura dentro de un Dockerfile."
order: 56
module: "Imágenes propias y flujos más cercanos a despliegue"
level: "intermedio"
draft: false
---

# Secrets en build con Compose: pasá datos sensibles al build sin pegarlos en la imagen

## Objetivo del tema

En este tema vas a:

- entender qué es un build secret
- ver por qué `ARG` y `ENV` no son adecuados para secretos
- usar secrets en el build desde Compose
- consumir esos secretos dentro del Dockerfile
- distinguir build secrets de secretos de runtime
- ver cuándo entra en juego `ssh` para builds que necesitan repos privados

La idea es que dejes de tratar datos sensibles como simples variables y empieces a usar un mecanismo pensado para exponerlos al build sin dejarlos pegados en la imagen final.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender por qué no conviene usar `ARG` o `ENV` para secretos
2. ver qué es un build secret
3. declarar un secreto en Compose
4. conceder ese secreto al build de un servicio
5. consumirlo desde el Dockerfile con `RUN --mount=type=secret`
6. distinguir este flujo del uso de secretos en runtime

---

## Idea central que tenés que llevarte

A veces un build necesita algo sensible para completarse.

Por ejemplo:

- un token para descargar dependencias privadas
- credenciales para leer un paquete interno
- una clave para acceder a una API durante el build
- datos para clonar un recurso privado

Pero eso no significa que ese valor deba quedar dentro de la imagen final.

Dicho simple:

> si el dato sensible solo hace falta durante la construcción, conviene pasarlo como build secret, no como ARG ni como ENV.

---

## Por qué este tema importa tanto

En cuanto empezás a construir imágenes reales, aparece este problema:

- el build necesita acceder a algo privado
- no querés hardcodear credenciales
- no querés que el valor quede en la imagen
- tampoco querés exponerlo por accidente en historial, metadata o logs

Build secrets existe justamente para resolver eso mejor.

---

## Recordatorio rápido del tema anterior

En el tema 55 viste:

- caché
- orden de capas
- `.dockerignore`
- reconstrucciones innecesarias

Ahora aparece otra preocupación distinta:

- seguridad y exposición de datos durante el build

Esto no compite con la caché.
Es otra capa de madurez del flujo.

---

## Qué dice la documentación oficial

La documentación oficial actual de Docker es muy clara: los build arguments (`ARG`) y las environment variables (`ENV`) no son adecuados para pasar secretos al build porque esos valores pueden persistir en la imagen final, en metadatos o en el historial. En su lugar, Docker recomienda usar build secrets, ya sea mediante secret mounts o SSH mounts. También explica que un build secret es información sensible consumida durante el proceso de build, que el uso de secrets es un proceso de dos pasos —pasar el secreto al build y consumirlo en el Dockerfile— y que Compose soporta secrets en el bloque `build`, además de `ssh` para autenticación SSH durante el build. citeturn807349search12turn870807view1turn543579view0turn543579view1

---

## Qué es un build secret

Un build secret es un dato sensible que el build necesita durante su ejecución, pero que no debería terminar horneado en la imagen.

Por ejemplo:

- un token
- una contraseña
- una credencial temporal
- una clave para leer artefactos privados

La documentación de Docker lo define exactamente en esa línea: información sensible consumida durante el build. citeturn807349search0turn870807view1

---

## Por qué ARG y ENV no alcanzan

Ya viste algo parecido en el tema 51, pero acá conviene fijarlo bien.

### Problema con ARG
`ARG` puede persistir en metadata, historial o attestations.

### Problema con ENV
`ENV` puede terminar claramente dentro de la imagen o del entorno del contenedor.

Docker lo advierte de forma explícita: ambos son inapropiados para secretos. citeturn807349search12turn870807view1

---

## Qué mecanismo usa Docker en lugar de eso

Docker recomienda dos alternativas principales:

- **secret mounts**
- **SSH mounts**

### Secret mounts
Sirven para exponer secretos generales al build.

### SSH mounts
Sirven especialmente cuando el build necesita acceso SSH, por ejemplo para clonar un repo privado.

La documentación de Build Secrets presenta justamente esas dos formas. citeturn870807view1turn543579view1

---

## Cómo se piensa el flujo de build secrets

Docker lo explica como un proceso de dos pasos:

1. pasar el secreto al build
2. consumirlo dentro del Dockerfile

En Compose, eso se traduce muy bien a:

1. definir el secreto en el archivo Compose
2. conceder ese secreto al build del servicio
3. usar `RUN --mount=type=secret` en el Dockerfile

La documentación oficial lo muestra exactamente así. citeturn870807view1turn543579view0

---

## Primera parte: definir el secreto en Compose

Compose tiene un bloque top-level `secrets`.

Ahí definís de dónde sale el secreto.

Por ejemplo, desde un archivo:

```yaml
secrets:
  npm_token:
    file: ./npm_token.txt
```

O desde una variable de entorno del host, porque la referencia oficial de secrets de Compose admite como fuente `file` o `environment`. citeturn807349search5turn870807view2

---

## Segunda parte: conceder el secreto al build del servicio

En el servicio, dentro de `build`, usás `secrets`.

La referencia oficial de Compose Build documenta que `build.secrets` concede acceso a secretos definidos arriba, en el bloque top-level `secrets`, y que ese acceso es explícito por servicio. citeturn543579view0

La forma corta sería:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      secrets:
        - npm_token

secrets:
  npm_token:
    file: ./npm_token.txt
```

---

## Qué significa esta forma corta

La documentación oficial explica que la sintaxis corta:

- usa el nombre del secreto
- monta el secreto como read-only
- lo deja disponible en `/run/secrets/<secret_name>` dentro del build container citeturn543579view0turn870807view1

En este caso, durante el build, aparecería como:

```text
/run/secrets/npm_token
```

---

## Tercera parte: consumirlo en el Dockerfile

Ahora el Dockerfile puede usarlo con:

```Dockerfile
RUN --mount=type=secret,id=npm_token     sh -c 'echo "usar secreto desde /run/secrets/npm_token"'
```

La documentación oficial de Build Secrets documenta precisamente el uso de `RUN --mount=type=secret` para acceder al secreto dentro de una instrucción `RUN`. citeturn870807view1

---

## Ejemplo simple completo

Imaginá esta estructura:

```text
mi-app/
├── compose.yaml
├── Dockerfile
└── npm_token.txt
```

### compose.yaml

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      secrets:
        - npm_token

secrets:
  npm_token:
    file: ./npm_token.txt
```

### Dockerfile

```Dockerfile
FROM alpine
RUN --mount=type=secret,id=npm_token     sh -c 'cat /run/secrets/npm_token > /tmp/token_usado_durante_build'
```

---

## Cómo se lee este ejemplo

La lectura conceptual sería:

- el secreto `npm_token` se toma del archivo local `npm_token.txt`
- Compose lo concede al build del servicio `app`
- durante una instrucción `RUN`, el Dockerfile puede leerlo desde `/run/secrets/npm_token`
- el secreto se usó durante el build, pero no se pensó para quedar como variable horneada en la imagen

Eso es el corazón del tema.

---

## Forma larga de build.secrets

La referencia oficial de Compose Build también documenta una forma larga con más control.

Por ejemplo:

```yaml
services:
  frontend:
    build:
      context: .
      secrets:
        - source: server-certificate
          target: cert
          uid: "103"
          gid: "103"
          mode: 0440

secrets:
  server-certificate:
    external: true
```

La documentación explica que en la sintaxis larga:

- `source` es el nombre del secreto en la plataforma
- `target` es el ID del secreto como lo vas a declarar en el Dockerfile
- también podés ajustar `uid`, `gid` y `mode` citeturn543579view0

---

## Qué te aporta la forma larga

Te aporta más control cuando:

- querés cambiar el ID usado por el Dockerfile
- querés definir permisos específicos
- querés integrar secretos externos
- necesitás una política de acceso un poco más fina

Para empezar, la forma corta suele alcanzar.
Pero está bueno saber que existe esta variante más expresiva.

---

## Secretos desde variable de entorno del host

Docker documenta que el origen de un secret puede ser también una variable de entorno, además de un archivo. Lo explica tanto en Build Secrets como en la referencia top-level de Compose Secrets. citeturn870807view1turn807349search5

Eso te permite, según el caso, no depender exclusivamente de un archivo local en disco.

---

## Qué pasa con el path por defecto

Docker documenta que el secreto se monta por defecto como archivo en:

```text
/run/secrets/<id>
```

Y que eso puede personalizarse con `target` o incluso exponerse como variable de entorno dentro del `RUN`, usando la sintaxis soportada por BuildKit. citeturn870807view1

Eso te da dos ideas útiles:

- el secreto no entra como variable “global” del contenedor
- entra de manera controlada dentro del build step

---

## Cuándo aparece ssh en vez de secret

Si el build necesita, por ejemplo:

- clonar un repo privado vía SSH
- usar un agent socket
- o una clave SSH

entonces Docker documenta que conviene usar `ssh` en vez de un secret mount genérico. Compose Build también soporta `build.ssh` para este caso. citeturn870807view1turn543579view1

No hace falta profundizar demasiado en este tema ahora.
Solo quiero que te quede clara esta distinción:

- secreto general → `secrets`
- acceso SSH para build → `ssh`

---

## Qué diferencia hay con secrets de runtime

Compose también tiene secrets para contenedores en ejecución, donde los secretos se montan en `/run/secrets/<secret_name>` dentro del container y se otorgan por servicio. Docker lo documenta en la guía de Compose Secrets. citeturn870807view2

Pero este tema está enfocado en **build secrets**, no en runtime secrets.

La diferencia práctica es:

### Build secrets
se usan durante la construcción.

### Runtime secrets
se usan cuando el contenedor ya está corriendo.

Esa separación conviene tenerla muy clara.

---

## Qué no tenés que confundir

### Build secret no es lo mismo que environment
Uno se monta de forma controlada durante el build.
Lo otro es una variable de entorno.

### Top-level secrets no concede acceso por sí solo
La referencia oficial de Compose Build aclara que definir el secreto arriba no implica otorgarlo automáticamente al build de ningún servicio; el grant debe ser explícito. citeturn543579view0

### SSH mount no es exactamente lo mismo que secret mount
Resuelven problemas parecidos, pero con usos distintos.

### Tener el secreto en un archivo fuente local no significa que ya quedó seguro mágicamente
La seguridad depende también de cómo manejás esos archivos en tu entorno y repositorio.

---

## Error común 1: seguir usando ARG para un token privado

Docker recomienda explícitamente no hacerlo. citeturn807349search12turn870807view1

---

## Error común 2: definir el secreto arriba y olvidar concederlo al build del servicio

La referencia oficial aclara que el acceso al build debe darse de forma explícita. citeturn543579view0

---

## Error común 3: pensar que secrets de runtime y build secrets son exactamente lo mismo

No.
Se parecen, pero resuelven momentos distintos del ciclo de vida.

---

## Error común 4: usar un secret mount cuando en realidad el problema era acceso SSH a un repo privado

Ahí muchas veces `ssh` encaja mejor. citeturn870807view1turn543579view1

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá este `compose.yaml`:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      secrets:
        - npm_token

secrets:
  npm_token:
    file: ./npm_token.txt
```

### Ejercicio 2
Creá este `Dockerfile`:

```Dockerfile
FROM alpine
RUN --mount=type=secret,id=npm_token     sh -c 'ls /run/secrets && cat /run/secrets/npm_token > /tmp/token_usado_durante_build'
```

### Ejercicio 3
Respondé con tus palabras:

- de dónde sale el secreto
- cómo se concede al build
- cómo lo consume el Dockerfile
- por qué esto es mejor que usar `ARG` para el mismo valor

### Ejercicio 4
Ahora pensá este caso:

- querés clonar un repo privado por SSH durante el build

Respondé:

- por qué eso ya te hace pensar en `ssh`
- por qué no es exactamente el mismo caso que un token general de API

---

## Segundo ejercicio de análisis

Pensá en uno de tus proyectos y respondé:

- qué valor sensible podrías necesitar durante el build
- si ese caso es mejor con `secrets` o con `ssh`
- por qué no querrías meter ese valor en `ARG`
- qué diferencia ves entre necesitarlo en build y necesitarlo en runtime

No hace falta implementar nada todavía.
La idea es ordenar el criterio.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué tan clara te quedó la diferencia entre build secret y runtime secret?
- ¿qué caso de tus proyectos te parece mejor candidato para secret mount?
- ¿cuándo te parece que `ssh` sería más natural?
- ¿por qué este tema te parece una evolución importante respecto al uso de `ARG`?
- ¿qué parte de tu flujo actual te gustaría hacer más segura después de este tema?

Estas observaciones valen mucho más que copiar la sintaxis.

---

## Mini desafío

Intentá completar con tus palabras esta regla:

> Si el valor sensible solo hace falta durante el build, probablemente me conviene ________.  
> Si necesito acceder a un repo privado por SSH durante el build, probablemente me conviene ________.  
> Y si quiero usar un secreto durante el build desde Compose, primero debo ________ y luego ________.

Y además respondé:

- ¿por qué Docker desaconseja `ARG` y `ENV` para secretos?
- ¿qué ventaja te da montar el secreto solo durante la instrucción que lo necesita?
- ¿qué flujo tuyo te gustaría volver más seguro con esta técnica?
- ¿qué te gustaría seguir profundizando después de este tema?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es un build secret
- usar `build.secrets` en Compose
- consumir secretos en el Dockerfile con `RUN --mount=type=secret`
- distinguir mejor `secrets` y `ssh`
- evitar usar `ARG` o `ENV` para datos sensibles del build

---

## Resumen del tema

- Docker desaconseja usar `ARG` y `ENV` para secretos del build porque pueden persistir en la imagen, su metadata o historial. citeturn807349search12turn870807view1
- Build secrets exponen datos sensibles al build de forma más segura, y el flujo consta de dos pasos: conceder el secreto y consumirlo en el Dockerfile. citeturn870807view1turn543579view0
- Compose soporta `build.secrets` en sintaxis corta y larga. citeturn543579view0
- Los secretos se montan por defecto en `/run/secrets/<id>` durante el build. citeturn870807view1turn543579view0
- Para autenticación SSH durante el build, Compose también soporta `build.ssh`. citeturn543579view1turn870807view1
- Este tema te ayuda a hacer builds bastante más seguros y mucho menos ingenuos.

---

## Próximo tema

En el próximo tema vas a empezar a cerrar este bloque con otra capa importante de madurez:

- decisión entre bind mounts y build para código propio
- cuándo conviene cada uno
- cómo cambia el flujo entre desarrollo y despliegue
- y cómo evitar mezclar ambos sin criterio
