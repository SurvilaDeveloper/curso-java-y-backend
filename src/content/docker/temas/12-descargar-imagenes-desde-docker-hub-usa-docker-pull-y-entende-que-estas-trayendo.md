---
title: "Descargar imágenes desde Docker Hub: usá docker pull y entendé qué estás trayendo"
description: "Tema 12 del curso práctico de Docker: cómo descargar imágenes desde Docker Hub con docker pull, cómo leer referencias de imagen y cómo entender repositorio, tag y latest sin confusiones."
order: 12
module: "Primeros pasos reales con imágenes"
level: "base"
draft: false
---

# Descargar imágenes desde Docker Hub: usá docker pull y entendé qué estás trayendo

## Objetivo del tema

En este tema vas a:

- descargar imágenes desde Docker Hub con `docker pull`
- entender qué significa una referencia de imagen
- empezar a leer con claridad `repositorio:tag`
- distinguir entre descargar una imagen y ejecutar un contenedor
- empezar a trabajar con tags de una forma más consciente

La idea es que dejes de depender siempre de `docker run` para traer imágenes y empieces a manejar `docker pull` con intención.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué hace `docker pull`
2. descargar imágenes explícitamente
3. listar imágenes locales después de descargarlas
4. empezar a leer repositorio y tag
5. entender qué pasa cuando no indicás tag
6. mirar de otra forma Docker Hub y las imágenes oficiales

---

## Idea central que tenés que llevarte

Hasta ahora muchas veces trajiste imágenes sin darte demasiada cuenta.

Por ejemplo, cuando corrías algo como:

```bash
docker run nginx
```

si la imagen no estaba localmente, Docker la descargaba por vos.

Ahora vas a separar mejor las cosas.

Dicho simple:

- `docker pull` descarga una imagen
- `docker run` crea y ejecuta un contenedor a partir de una imagen

Esa diferencia es muy importante.

---

## Qué es Docker Hub en este contexto

Docker Hub es uno de los lugares más comunes desde donde se descargan imágenes.

Para este curso, lo importante es entenderlo así:

- es un registro muy usado
- contiene imágenes listas para descargar
- incluye imágenes oficiales y otras publicadas por distintos usuarios u organizaciones

Más adelante vas a profundizar en registros y publicación, pero por ahora lo vamos a usar como fuente de imágenes.

---

## Qué hace docker pull

La forma básica es esta:

```bash
docker pull nombre_de_imagen
```

Por ejemplo:

```bash
docker pull nginx
```

---

## Qué hace este comando

- busca la imagen indicada
- la descarga desde el registro correspondiente
- la guarda en tu máquina local
- no crea todavía ningún contenedor
- no arranca ninguna aplicación

Eso último te tiene que quedar clarísimo:

> descargar una imagen no es lo mismo que ejecutar un contenedor

---

## Primer ejemplo práctico

Ejecutá:

```bash
docker pull nginx
```

---

## Qué deberías ver

Deberías ver que Docker empieza a descargar capas de la imagen y, al terminar, confirma que la imagen quedó disponible localmente.

Después podés verificarlo con:

```bash
docker image ls
```

---

## Verificar que la imagen quedó localmente

Ejecutá:

```bash
docker image ls
```

Y buscá algo parecido a:

```text
nginx   latest   ...
```

La idea es comprobar que ahora esa imagen ya está almacenada localmente en tu máquina.

---

## Qué significa una referencia de imagen

Cuando escribís algo como:

```bash
nginx
```

o:

```bash
alpine:3.20
```

estás usando una referencia de imagen.

Esa referencia sirve para identificar:

- dónde está la imagen
- de qué repositorio viene
- qué versión o variante querés usar

---

## Forma general de una referencia

Aunque al principio uses formas cortas, conviene ir viendo la estructura mental correcta.

Una referencia de imagen puede tener esta forma general:

```text
[HOST[:PORT]/]NAMESPACE/REPOSITORY[:TAG]
```

Pero no te asustes.
Al comienzo, muchas veces vas a usar formas simplificadas.

---

## Ejemplos simples de referencias

### Solo repositorio
```bash
nginx
```

### Repositorio más tag
```bash
nginx:latest
```

```bash
alpine:3.20
```

### Namespace y repositorio
```bash
docker/welcome-to-docker
```

Estas formas te van a empezar a aparecer cada vez más seguido.

---

## Qué es un tag

El tag sirve para identificar una versión o variante de una imagen.

Por ejemplo:

```bash
alpine:3.20
```

Acá:

- `alpine` es el repositorio
- `3.20` es el tag

Esto es importante porque no siempre querés traer “lo último” sin mirar.
Muchas veces conviene pedir una versión concreta.

---

## Qué pasa si no indicás tag

Si hacés esto:

```bash
docker pull nginx
```

Docker asume por defecto el tag `latest`.

O sea, conceptualmente es parecido a hacer:

```bash
docker pull nginx:latest
```

Esto te simplifica la vida al empezar, pero también conviene que sepas que está ocurriendo.

---

## Por qué conviene pensar bien los tags

Al principio `latest` parece cómodo, pero más adelante vas a ver que fijar versiones concretas suele ser más claro y más reproducible.

Por ejemplo, no es lo mismo decir:

```bash
docker pull alpine
```

que decir:

```bash
docker pull alpine:3.20
```

En el segundo caso dejás mucho más claro qué querés usar.

---

## Segundo ejemplo práctico

Ejecutá:

```bash
docker pull alpine:3.20
```

---

## Qué deberías observar

Después de descargarla, podés volver a listar imágenes:

```bash
docker image ls
```

Y deberías ver algo como:

```text
alpine   3.20   ...
```

Eso refuerza la idea de que el tag forma parte de la identidad de la imagen que descargaste.

---

## Tercer ejemplo práctico

Probá también:

```bash
docker pull docker/welcome-to-docker
```

---

## Qué tiene de interesante

Esto te ayuda a ver una referencia que no es solo un nombre corto como `nginx`.

Acá ya aparece algo más explícito:

- `docker` como namespace
- `welcome-to-docker` como repositorio

Eso te acostumbra a leer referencias de imagen con más naturalidad.

---

## Qué diferencia hay entre pull y run

Esta comparación te tiene que quedar grabada.

### `docker pull nginx`
- descarga la imagen
- la deja disponible localmente
- no ejecuta nada

### `docker run nginx`
- usa la imagen
- si no está, puede descargarla
- crea un contenedor
- ejecuta el contenedor

Esa diferencia te da más control mental sobre lo que está pasando.

---

## Qué pasa si hacés pull de una imagen que ya tenés

Docker no vuelve a bajar todo necesariamente de cero.

Primero verifica el estado de la imagen y descarga lo que haga falta según corresponda.

Para vos, al nivel del curso actual, lo importante es esto:

- podés volver a hacer `pull`
- Docker compara y resuelve lo necesario
- no siempre significa una descarga completa desde cero

---

## Qué conviene descargar al empezar

Para practicar bien este bloque, te conviene tener a mano algunas imágenes simples y conocidas, por ejemplo:

- `hello-world`
- `alpine`
- `nginx`

Son buenas porque:

- aparecen mucho en documentación y ejemplos
- son útiles para practicar
- te ayudan a reforzar conceptos sin meter complejidad innecesaria

---

## Qué son las imágenes oficiales

Dentro de Docker Hub hay imágenes oficiales mantenidas y curadas por Docker y sus socios.
Al empezar, conviene darles prioridad porque suelen tener mejor documentación, buenas prácticas más claras y un uso muy extendido.

Por eso vas a ver tanto:

- `nginx`
- `alpine`
- `python`
- `node`
- `mysql`

Más adelante vas a aprender mejor a evaluar imágenes, pero por ahora esta es una buena referencia.

---

## Qué no tenés que confundir

### Descargar una imagen no levanta un servicio
La imagen queda localmente disponible, pero todavía no hay un contenedor corriendo.

### Nombre corto no significa “cosa distinta”
A veces una referencia corta como `nginx` ya alcanza porque Docker resuelve la ubicación esperada por defecto.

### Tag no es lo mismo que nombre completo
El tag es solo una parte de la referencia de imagen.

---

## Error común 1: usar pull pensando que eso ya inicia algo

No.

Después del `pull`, si querés usar la imagen, todavía necesitás crear y ejecutar un contenedor.

---

## Error común 2: ignorar el tag

Si no prestás atención al tag, después puede costarte entender qué variante o versión descargaste realmente.

Por eso conviene empezar a leer bien cosas como:

```text
nginx:latest
alpine:3.20
```

---

## Error común 3: pensar que latest significa “mejor”

No necesariamente.

`latest` solo es una etiqueta por defecto cuando no especificás otra.
Más adelante vas a ver que muchas veces conviene trabajar con versiones concretas.

---

## Error común 4: creer que docker image ls muestra contenedores

No.

`docker image ls` muestra imágenes locales.

Si querés ver contenedores, usás:

```bash
docker ps
```

o:

```bash
docker ps -a
```

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Descargá Nginx:

```bash
docker pull nginx
```

### Ejercicio 2
Listá imágenes locales:

```bash
docker image ls
```

### Ejercicio 3
Descargá Alpine con tag explícito:

```bash
docker pull alpine:3.20
```

### Ejercicio 4
Volvé a listar imágenes:

```bash
docker image ls
```

### Ejercicio 5
Descargá otra imagen con referencia más explícita:

```bash
docker pull docker/welcome-to-docker
```

### Ejercicio 6
Respondé con tus palabras:

- ¿qué diferencia viste entre `docker pull` y `docker run`?
- ¿qué representa el tag?
- ¿qué cambió cuando usaste `alpine:3.20` en vez de solo `alpine`?
- ¿por qué `docker image ls` no es lo mismo que `docker ps`?

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué imágenes ya estaban en tu máquina y cuáles descargaste recién?
- ¿cómo apareció `latest` cuando no pusiste tag?
- ¿qué te resultó más claro al ver `repositorio:tag`?
- ¿por qué conviene separar mentalmente descarga y ejecución?
- ¿qué ventaja tiene empezar a usar referencias más explícitas?

Estas observaciones valen mucho más que memorizar la sintaxis sola.

---

## Mini desafío

Intentá explicar con tus palabras este comando:

```bash
docker pull alpine:3.20
```

Respondé:

- qué parte es el repositorio
- qué parte es el tag
- qué hace Docker con esa referencia
- por qué eso no arranca todavía ningún contenedor

Y además respondé:

- ¿qué diferencia hay entre `docker pull nginx` y `docker pull nginx:latest`?
- ¿por qué una imagen descargada queda disponible localmente?
- ¿qué ventaja puede tener usar tags explícitos?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- usar `docker pull` con intención
- distinguir descarga de ejecución
- leer referencias simples de imagen
- reconocer qué rol cumple el tag
- listar imágenes locales después de descargarlas

---

## Resumen del tema

- `docker pull` descarga imágenes y las deja disponibles localmente.
- No crea ni ejecuta contenedores.
- Una referencia de imagen puede incluir repositorio, namespace, host y tag.
- Si no indicás tag, Docker usa `latest` por defecto.
- `docker image ls` muestra imágenes locales.
- Entender bien `pull` y `repositorio:tag` te prepara para trabajar mejor con versiones y Dockerfiles.

---

## Próximo tema

En el próximo tema vas a profundizar justo en esa parte que ya empezó a aparecer hoy:

- etiquetas
- versiones
- qué significa latest
- cómo elegir mejor una imagen
