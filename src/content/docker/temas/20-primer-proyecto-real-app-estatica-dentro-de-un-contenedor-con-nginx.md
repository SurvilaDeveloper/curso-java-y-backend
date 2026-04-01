---
title: "Primer proyecto real: app estática dentro de un contenedor con Nginx"
description: "Tema 20 del curso práctico de Docker: cómo crear un proyecto estático mínimo, construir una imagen propia basada en Nginx y servir un index.html desde un contenedor para cerrar el primer bloque práctico con algo real y usable."
order: 20
module: "Primeros pasos reales con imágenes"
level: "base"
draft: false
---

# Primer proyecto real: app estática dentro de un contenedor con Nginx

## Objetivo del tema

En este tema vas a:

- crear un proyecto estático mínimo
- escribir un Dockerfile simple pero útil
- construir una imagen propia basada en Nginx
- ejecutar el contenedor y abrir la app en el navegador
- cerrar este bloque con un proyecto real, chico y muy claro

La idea es que juntes varias piezas que ya venís viendo y las conviertas en algo concreto que puedas levantar de punta a punta.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. crear una carpeta de proyecto
2. agregar un `index.html`
3. escribir un Dockerfile simple
4. construir una imagen propia
5. ejecutar el contenedor publicando un puerto
6. abrir la app desde el navegador
7. confirmar que ya podés empaquetar una web estática con Docker

---

## Idea central que tenés que llevarte

Hasta ahora venías practicando piezas por separado:

- imágenes
- Dockerfile
- `docker build`
- `docker run`
- publicación de puertos
- `COPY`
- `CMD`

En este tema vas a unir todo eso en un proyecto real muy simple:

> una app estática servida por Nginx dentro de un contenedor

Eso te permite cerrar muy bien este bloque antes de pasar a temas más avanzados.

---

## Por qué usar Nginx para este proyecto

Nginx es una opción muy buena para este primer proyecto porque:

- ya existe una imagen oficial muy usada
- sirve contenido estático con mucha facilidad
- el ejemplo es simple de entender
- te permite concentrarte en Docker sin meter complejidad innecesaria de backend

La documentación y guías oficiales de Docker usan justamente Nginx como base frecuente para servir aplicaciones estáticas o builds frontend. citeturn849109search0turn849109search6turn849109search3

---

## Qué ruta vas a usar para el contenido estático

En este proyecto vas a copiar tu archivo HTML a una ruta típica del contenedor Nginx:

```text
/usr/share/nginx/html
```

La guía rápida oficial de Docker Hub muestra justamente un ejemplo donde se extiende la imagen `nginx` y se crea contenido HTML en esa ubicación para servir un sitio simple. citeturn849109search3

---

## Estructura del proyecto

Vas a crear algo así:

```text
mi-sitio-estatico/
├── Dockerfile
└── index.html
```

Más adelante podrías agregar CSS, imágenes o JavaScript, pero para este primer proyecto no hace falta.

---

## Paso 1: crear la carpeta del proyecto

Por ejemplo:

```bash
mkdir mi-sitio-estatico
cd mi-sitio-estatico
```

---

## Paso 2: crear index.html

Creá un archivo llamado:

```text
index.html
```

Con este contenido de ejemplo:

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mi primer sitio en Docker</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #0f172a;
        color: #e2e8f0;
        display: grid;
        place-items: center;
        min-height: 100vh;
        margin: 0;
      }

      .card {
        max-width: 700px;
        padding: 2rem;
        border-radius: 16px;
        background: #1e293b;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      }

      h1 {
        margin-top: 0;
        color: #38bdf8;
      }

      p {
        line-height: 1.6;
      }

      code {
        background: #0b1120;
        padding: 0.2rem 0.4rem;
        border-radius: 6px;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Mi primer sitio estático en Docker</h1>
      <p>
        Este sitio se está sirviendo desde un contenedor basado en
        <code>nginx</code>.
      </p>
      <p>
        Si estás viendo esto en el navegador, ya cerraste un flujo muy importante:
        <code>Dockerfile → build → run → navegador</code>.
      </p>
    </main>
  </body>
</html>
```

---

## Paso 3: crear el Dockerfile

Ahora creá un archivo llamado:

```text
Dockerfile
```

Y pegá esto:

```Dockerfile
FROM nginx:latest
COPY index.html /usr/share/nginx/html/index.html
```

---

## Cómo se lee este Dockerfile

La lectura conceptual sería esta:

1. partí de la imagen `nginx:latest`
2. copiá tu `index.html` al lugar desde donde Nginx sirve el contenido estático

Es un Dockerfile muy pequeño, pero ya resuelve algo real.

---

## Qué estás reutilizando acá

Con este proyecto ya estás aplicando varias ideas del curso:

- `FROM` para elegir una base
- `COPY` para meter tu archivo dentro de la imagen
- `docker build` para construirla
- `docker run -p` para exponerla
- el navegador para verificar el resultado final

Eso hace que el tema sea muy buen cierre de este tramo.

---

## Paso 4: construir la imagen

Ejecutá:

```bash
docker build -t mi-sitio:1.0 .
```

---

## Qué hace

- toma el Dockerfile actual
- usa la carpeta como contexto de build
- parte desde `nginx:latest`
- copia `index.html` al lugar correcto
- construye una imagen llamada `mi-sitio:1.0`

Después podés verificarla con:

```bash
docker image ls
```

---

## Paso 5: ejecutar el contenedor

Ahora levantalo así:

```bash
docker run -d --name mi-sitio-web -p 8080:80 mi-sitio:1.0
```

---

## Qué significa este comando

### `-d`
Lo deja corriendo en segundo plano.

### `--name mi-sitio-web`
Le pone un nombre claro al contenedor.

### `-p 8080:80`
Publica el puerto 80 del contenedor en el 8080 de tu máquina.

### `mi-sitio:1.0`
Es la imagen que acabás de construir.

---

## Qué deberías ver

Si todo salió bien, el contenedor debería quedar corriendo.

Podés verificarlo con:

```bash
docker ps
```

Y después abrir el navegador en:

```text
http://localhost:8080
```

Ahí deberías ver tu página estática.

La publicación de puertos con `-p host:contenedor` es el mecanismo estándar documentado por Docker para acceder desde el host a un servicio que escucha dentro del contenedor. citeturn849109search12turn849109search15

---

## Qué está pasando realmente

La lectura completa del flujo sería algo así:

1. escribiste un `index.html`
2. escribiste un Dockerfile que parte de Nginx
3. construiste una imagen propia
4. ejecutaste un contenedor desde esa imagen
5. publicaste el puerto del servidor web
6. entraste desde el navegador a tu sitio

Eso es muchísimo valor para un primer proyecto real.

---

## Cómo comprobar que realmente sale desde tu imagen

Podés hacer esta prueba:

1. dejá el contenedor corriendo
2. cambiá el contenido de `index.html`
3. recargá el navegador

Vas a ver que **no cambia nada todavía**.

¿Por qué?

Porque tu imagen ya fue construida con la versión anterior del archivo.

Para ver el cambio, tenés que:

1. detener y eliminar el contenedor actual
2. reconstruir la imagen
3. volver a correr el contenedor

Ese comportamiento refuerza la diferencia entre:

- archivo local
- imagen construida
- contenedor en ejecución

---

## Flujo de actualización

Si cambiaste el HTML, podrías hacer esto:

```bash
docker stop mi-sitio-web
docker rm mi-sitio-web
docker build -t mi-sitio:1.0 .
docker run -d --name mi-sitio-web -p 8080:80 mi-sitio:1.0
```

Esto vuelve a dejar el sitio levantado, ahora con la versión nueva del archivo.

---

## Qué no tenés que confundir

### Ver el HTML en el navegador no significa que Docker “lea tu carpeta local en vivo”
En este proyecto, el archivo quedó copiado dentro de la imagen al momento del build.

### El contenedor no está sirviendo directamente tu archivo local
Está sirviendo el archivo que quedó dentro de la imagen construida.

### Cambiar el archivo local no actualiza mágicamente la imagen
Tenés que volver a construir.

### Publicar `8080:80` no cambia el puerto interno de Nginx
Solo conecta el puerto del host con el puerto interno del contenedor.

---

## Error común 1: cambiar index.html y no reconstruir

Eso hace que sigas viendo la versión vieja servida por la imagen anterior.

---

## Error común 2: olvidarte de publicar el puerto

Si corrés el contenedor sin `-p`, el servidor puede estar andando dentro del contenedor, pero no vas a poder entrar desde `localhost`.

---

## Error común 3: usar un puerto del host ya ocupado

Si `8080` ya está ocupado en tu máquina, Docker no va a poder publicar ese puerto correctamente para este contenedor.

En ese caso, podés usar otro, por ejemplo:

```bash
-p 9090:80
```

Y después entrar por:

```text
http://localhost:9090
```

---

## Error común 4: no revisar el contenedor si el navegador no muestra lo esperado

Cuando algo falle, acordate de revisar:

```bash
docker ps
docker logs mi-sitio-web
```

Eso te ayuda a ver si el contenedor está corriendo y si Nginx tuvo algún problema.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá la carpeta del proyecto:

```bash
mkdir mi-sitio-estatico
cd mi-sitio-estatico
```

### Ejercicio 2
Creá `index.html` con un contenido propio.

### Ejercicio 3
Creá este `Dockerfile`:

```Dockerfile
FROM nginx:latest
COPY index.html /usr/share/nginx/html/index.html
```

### Ejercicio 4
Construí la imagen:

```bash
docker build -t mi-sitio:1.0 .
```

### Ejercicio 5
Ejecutá el contenedor:

```bash
docker run -d --name mi-sitio-web -p 8080:80 mi-sitio:1.0
```

### Ejercicio 6
Abrí el navegador en:

```text
http://localhost:8080
```

### Ejercicio 7
Verificá que se vea tu página.

### Ejercicio 8
Detenelo y eliminá el contenedor cuando termines:

```bash
docker stop mi-sitio-web
docker rm mi-sitio-web
```

---

## Segundo ejercicio de refuerzo

Hacé una modificación en `index.html`.

Por ejemplo:

- cambiá el título
- cambiá el color
- cambiá el texto principal

Después:

1. reconstruí la imagen
2. volvé a ejecutar el contenedor
3. recargá el navegador

Respondé con tus palabras:

- ¿por qué necesitaste rebuild?
- ¿qué parte estaba en el archivo local?
- ¿qué parte estaba en la imagen?
- ¿qué parte estaba en ejecución dentro del contenedor?

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué parte del flujo ya te resulta más natural?
- ¿qué diferencia concreta ves entre el proyecto local y la imagen construida?
- ¿por qué este ejemplo ya puede considerarse un proyecto real aunque sea simple?
- ¿qué aprendiste al abrir el sitio desde el navegador?
- ¿qué te mostró este ejercicio sobre `COPY`, build y publicación de puertos?

Estas observaciones valen mucho más que solo “hacerlo andar”.

---

## Mini desafío

Intentá explicar con tus palabras este flujo completo:

1. crear `index.html`
2. escribir un Dockerfile basado en Nginx
3. construir una imagen
4. ejecutar un contenedor con `-p 8080:80`
5. abrir el sitio en `localhost:8080`

Y además respondé:

- ¿por qué Nginx es una buena base para este primer proyecto?
- ¿qué demuestra este proyecto sobre la diferencia entre build y run?
- ¿por qué cambiar el HTML exige reconstruir si lo copiaste dentro de la imagen?
- ¿qué piezas del curso sentís que se conectaron mejor con este ejercicio?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- crear una app estática mínima
- escribir un Dockerfile simple basado en Nginx
- construir una imagen propia útil
- ejecutar un contenedor y publicar su puerto
- verificar el resultado desde el navegador
- entender mejor la diferencia entre archivo local, imagen y contenedor

---

## Resumen del tema

- Un proyecto estático simple ya alcanza para cerrar un ciclo Docker muy valioso.
- Nginx sirve muy bien como base para este tipo de ejemplo.
- `COPY` mete tu HTML dentro de la imagen.
- `docker build` transforma el Dockerfile en una imagen real.
- `docker run -p` permite acceder al sitio desde el navegador.
- Cambiar el archivo local no actualiza la imagen: primero hay que reconstruir.
- Este tema conecta conceptos clave del bloque en un proyecto chico pero real.

---

## Próximo tema

En el próximo bloque vas a empezar a trabajar con otras piezas fundamentales del mundo real en Docker:

- datos
- persistencia
- volúmenes
- bind mounts
- qué pasa con los archivos cuando un contenedor se borra
