---
title: "Imagen, contenedor y registro: los 3 conceptos que tenés que dominar al empezar con Docker"
description: "Segundo tema práctico del curso de Docker: qué es una imagen, qué es un contenedor, qué es un registro y cómo se relacionan entre sí dentro del flujo básico de trabajo con Docker."
order: 2
module: "Fundamentos de Docker"
level: "intro"
draft: false
---

# Imagen, contenedor y registro: los 3 conceptos que tenés que dominar al empezar con Docker

## Objetivo del tema

En este tema vas a:

- entender con claridad qué es una imagen
- entender qué es un contenedor
- entender qué es un registro
- ver cómo se relacionan estos tres conceptos
- construir una base mental correcta para empezar a usar Docker sin confusiones

La idea es que antes de meterte fuerte con comandos, tengas totalmente claro qué estás descargando, qué estás ejecutando y desde dónde lo obtenés.

---

## Qué vas a hacer hoy

En este tema vas a ordenar tres conceptos que aparecen todo el tiempo en Docker:

1. imagen
2. contenedor
3. registro

Si esto te queda claro ahora, después todo lo demás va a resultar mucho más natural.

---

## Idea central que tenés que llevarte

Docker trabaja, en gran parte, con este flujo mental:

1. una **imagen** existe como plantilla
2. esa imagen puede estar guardada en un **registro**
3. cuando ejecutás esa imagen, se crea un **contenedor**

Dicho simple:

- la imagen se prepara o se descarga
- el contenedor se ejecuta
- el registro es el lugar donde las imágenes se almacenan o se publican

---

## Qué es una imagen

Una imagen es una **plantilla inmutable** que contiene lo necesario para crear un contenedor.

Esa plantilla puede incluir:

- un sistema base liviano
- un runtime
- dependencias
- archivos de la aplicación
- configuración de arranque

Una imagen no es algo “vivo” que está corriendo.

Es una definición preparada para que después Docker pueda crear uno o más contenedores a partir de ella.

---

## Cómo conviene pensar una imagen

Una imagen se parece a:

- una receta
- un molde
- una versión empaquetada de una aplicación o servicio

No se ejecuta sola.
Sirve como base para crear contenedores.

Por ejemplo:

- una imagen puede representar `nginx`
- otra puede representar `postgres`
- otra puede representar tu propia aplicación

---

## Qué es un contenedor

Un contenedor es una **instancia en ejecución** de una imagen.

Cuando Docker toma una imagen y la arranca, crea un contenedor.

Ese contenedor:

- puede iniciarse
- puede detenerse
- puede eliminarse
- puede mostrar logs
- puede exponer puertos
- puede recibir variables de entorno
- puede conectarse a redes
- puede usar volúmenes

---

## Cómo conviene pensar un contenedor

Si la imagen es el molde, el contenedor es el resultado en uso.

O dicho de otra forma:

- **imagen** = definición
- **contenedor** = ejecución concreta

Y esto es importante:

una misma imagen puede servir para crear varios contenedores.

---

## Ejemplo mental simple

Imaginá que tenés una imagen llamada:

```text
mi-app-web:1.0
```

Eso no significa todavía que tu aplicación esté corriendo.

Para que corra, Docker tiene que crear un contenedor a partir de esa imagen.

O sea:

- la imagen existe
- el contenedor se crea usando esa imagen
- recién ahí hay algo ejecutándose

---

## Qué es un registro

Un registro es un lugar donde se almacenan imágenes Docker.

Es, básicamente, un repositorio de imágenes.

Ahí podés:

- descargar imágenes ya existentes
- publicar tus propias imágenes
- compartir imágenes con otros
- versionar imágenes

El caso más conocido es Docker Hub, pero no es el único.

---

## Cómo conviene pensar un registro

Podés pensarlo como una especie de “biblioteca” o “repositorio” de imágenes.

Por ejemplo:

- buscás una imagen de PostgreSQL
- Docker la descarga desde un registro
- luego la usás para crear un contenedor

También podrías:

- construir una imagen propia
- subirla a un registro
- después descargarla en otra máquina o servidor

---

## Relación entre imagen, contenedor y registro

Esta relación tiene que quedarte muy clara:

### Registro
Guarda imágenes.

### Imagen
Es la plantilla preparada.

### Contenedor
Es la instancia creada a partir de una imagen.

El flujo normal suele ser algo así:

1. descargás una imagen desde un registro
2. o construís una imagen propia
3. ejecutás esa imagen
4. Docker crea un contenedor

---

## Ejemplo con Nginx

Supongamos que querés usar Nginx.

En ese caso, la idea mental sería esta:

- existe una imagen de Nginx
- esa imagen está publicada en un registro
- vos la descargás
- la ejecutás
- Docker crea un contenedor con Nginx corriendo

---

## Ejemplo con una app propia

Ahora imaginá una aplicación tuya.

El flujo podría ser este:

1. escribís un `Dockerfile`
2. construís una imagen de tu app
3. ejecutás esa imagen
4. Docker crea un contenedor
5. si querés, publicás esa imagen en un registro

---

## Qué significa que la imagen sea inmutable

Cuando decimos que una imagen es inmutable, la idea es esta:

una vez construida, esa imagen representa una versión concreta.

No se comporta como una carpeta que vas tocando todo el tiempo.

Si querés cambiar la aplicación, normalmente generás una nueva imagen.

Eso ayuda a tener builds más repetibles y más ordenados.

---

## Qué pasa con los cambios dentro de un contenedor

Esto es importante desde ya:

un contenedor puede cambiar mientras está funcionando, pero esos cambios no son la forma ideal de trabajar.

En general, la idea correcta es:

- definir bien la imagen
- crear contenedores a partir de esa imagen
- recrearlos cuando haga falta

Más adelante vas a ver que para datos persistentes se usan volúmenes, no cambios improvisados dentro del contenedor.

---

## Error común 1: confundir imagen con contenedor

Esto pasa muchísimo al empezar.

No es lo mismo:

- tener una imagen descargada
- tener un contenedor creado
- tener un contenedor corriendo

Son cosas distintas.

Podrías tener:

- una imagen descargada y ningún contenedor
- varios contenedores creados desde la misma imagen
- un contenedor detenido
- otro contenedor corriendo

---

## Error común 2: creer que el registro “ejecuta” cosas

El registro no ejecuta contenedores.

El registro solo almacena imágenes.

La ejecución ocurre en tu máquina o en el entorno donde Docker está corriendo.

---

## Error común 3: pensar que una imagen siempre es tu aplicación

No necesariamente.

A veces la imagen es:

- una base de datos
- un servidor web
- una herramienta auxiliar
- un servicio de caché
- una aplicación tuya

Docker se usa tanto con imágenes oficiales como con imágenes personalizadas.

---

## Analogía simple para memorizarlo

Sin obsesionarte con comparaciones, esta puede ayudarte:

- **registro** = depósito o repositorio
- **imagen** = molde o plantilla
- **contenedor** = instancia funcionando

No es una definición técnica perfecta, pero sirve mucho para fijar la idea.

---

## Caso real de proyecto

Imaginá que estás armando un sistema con:

- frontend
- backend
- base de datos

Podrías tener:

- una imagen para el frontend
- una imagen para el backend
- una imagen de PostgreSQL descargada desde un registro

Después, al ejecutar cada una, se crearían contenedores separados.

O sea:

- varias imágenes
- varios contenedores
- posiblemente algunas imágenes tuyas y otras descargadas

---

## Qué tenés que visualizar a partir de ahora

Cuando leas algo como esto:

```text
docker run postgres
```

no pienses solo en “correr un comando”.

Pensá en el proceso completo:

- existe una imagen de PostgreSQL
- esa imagen puede venir de un registro
- Docker la usa para crear un contenedor
- ese contenedor empieza a ejecutarse

Esa forma de pensar te va a ordenar muchísimo.

---

## Ejercicio práctico obligatorio

Quiero que hagas este ejercicio mental con tres tecnologías que conozcas.

### Ejercicio 1
Elegí tres ejemplos, por ejemplo:

- Nginx
- PostgreSQL
- una app tuya

### Ejercicio 2
Para cada caso, escribí:

- cuál sería la imagen
- cuál sería el contenedor
- de dónde podría venir esa imagen
- si esa imagen sería oficial o creada por vos

### Ejercicio 3
Respondé con tus palabras:

- ¿qué diferencia hay entre imagen y contenedor?
- ¿qué función cumple el registro?
- ¿por qué una misma imagen puede generar varios contenedores?

---

## Mini desafío

Tomá uno de tus proyectos y tratá de imaginar este flujo:

1. qué tendría tu imagen
2. qué ejecutaría el contenedor
3. si te convendría publicar esa imagen en un registro
4. quién podría reutilizarla después

No hace falta que lo resuelvas perfecto.
La idea es que ya empieces a pensar tus proyectos en términos de imágenes y contenedores.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es una imagen
- explicar qué es un contenedor
- explicar qué es un registro
- entender cómo se relacionan entre sí
- detectar cuándo estás hablando de una plantilla, de una ejecución o de un repositorio de imágenes

---

## Resumen del tema

- La imagen es la plantilla.
- El contenedor es la instancia creada a partir de esa imagen.
- El registro es el lugar donde se almacenan imágenes.
- Docker usa imágenes para crear contenedores.
- Las imágenes pueden descargarse o construirse.
- Una misma imagen puede servir para crear varios contenedores.

---

## Próximo tema

En el próximo tema ya vas a empezar a tocar el entorno real de trabajo:

- instalación de Docker
- verificación del entorno
- primeras comprobaciones para asegurarte de que todo está listo para empezar a ejecutar contenedores
