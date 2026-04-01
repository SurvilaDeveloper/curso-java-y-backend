---
title: "Ejecutar una imagen propia: cerrá el ciclo Dockerfile → build → run"
description: "Tema 17 del curso práctico de Docker: cómo ejecutar una imagen construida por vos, comprobar que funciona como esperabas y entender mejor la relación entre docker build, docker run y CMD."
order: 17
module: "Primeros pasos reales con imágenes"
level: "base"
draft: false
---

# Ejecutar una imagen propia: cerrá el ciclo Dockerfile → build → run

## Objetivo del tema

En este tema vas a:

- ejecutar una imagen construida por vos
- comprobar que el contenedor hace lo que esperabas
- reforzar la relación entre Dockerfile, build e imagen resultante
- entender mejor el papel de `CMD` al ejecutar un contenedor
- cerrar el primer ciclo completo de construcción y ejecución con Docker

La idea es que pases de “ya construí una imagen” a “ya la ejecuté y entendí cómo se comporta”.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. verificar que ya tenés una imagen propia construida
2. ejecutarla con `docker run`
3. observar su salida
4. entender por qué se comporta así
5. relacionar esa ejecución con el `CMD` del Dockerfile
6. ver que también podés sobrescribir el comando por defecto

---

## Idea central que tenés que llevarte

Con este tema cerrás el primer circuito completo de trabajo con imágenes propias:

1. escribís un `Dockerfile`
2. construís una imagen con `docker build`
3. ejecutás esa imagen con `docker run`

Dicho simple:

> Dockerfile = receta  
> build = construcción de la imagen  
> run = creación y ejecución del contenedor

Si este flujo te queda claro, ya diste un salto enorme.

---

## Recordatorio del punto de partida

En el tema anterior construiste una imagen con algo como esto:

```Dockerfile
FROM alpine:3.20
WORKDIR /app
COPY mensaje.txt .
CMD ["cat", "mensaje.txt"]
```

Y después ejecutaste un build como este:

```bash
docker build -t mi-mensaje:1.0 .
```

Ahora vas a usar esa imagen.

---

## Qué dice la documentación oficial

La referencia oficial de Docker indica que `docker run` crea y ejecuta un contenedor nuevo a partir de una imagen, descargándola si hace falta. También explica que si la imagen define un `CMD`, ese comando se usa por defecto, pero puede sobrescribirse pasando otro comando posicional en `docker run`. citeturn758139search2turn758139search1

---

## Primer paso: verificar que la imagen existe

Antes de ejecutarla, conviene mirar si la imagen está disponible localmente.

Ejecutá:

```bash
docker image ls
```

Y buscá algo parecido a:

```text
mi-mensaje   1.0   ...
```

Esto confirma que la imagen está lista para usarse.

---

## Ejecutar la imagen propia

Ahora sí, ejecutá:

```bash
docker run --rm mi-mensaje:1.0
```

---

## Qué hace este comando

- toma la imagen `mi-mensaje:1.0`
- crea un contenedor nuevo a partir de ella
- ejecuta el comando por defecto definido en la imagen
- muestra la salida resultante
- elimina el contenedor al terminar gracias a `--rm`

---

## Qué deberías ver

Si tu archivo `mensaje.txt` tenía algo como:

```text
Hola desde mi imagen construida
```

entonces deberías ver ese texto en la salida.

Eso significa que todo el flujo funcionó correctamente:

- el archivo fue copiado en el build
- la imagen quedó bien construida
- el contenedor ejecutó el `CMD` esperado

---

## Qué está pasando realmente

La lectura conceptual de este comando sería algo así:

1. Docker toma la imagen `mi-mensaje:1.0`
2. crea un contenedor nuevo
3. usa el `CMD ["cat", "mensaje.txt"]` definido en la imagen
4. el contenedor imprime el contenido del archivo
5. el proceso termina
6. como usaste `--rm`, el contenedor se elimina automáticamente

Esta lectura te ayuda a unir varias piezas que venías aprendiendo separadas.

---

## Qué papel cumple CMD en esta ejecución

En este ejemplo, el comportamiento por defecto del contenedor depende de esta línea del Dockerfile:

```Dockerfile
CMD ["cat", "mensaje.txt"]
```

Eso responde a esta pregunta:

> cuando alguien ejecute esta imagen sin indicar otro comando, ¿qué debería pasar?

La respuesta es:

- ejecutar `cat mensaje.txt`

Y eso es exactamente lo que acabás de comprobar con `docker run --rm mi-mensaje:1.0`.

---

## Qué significa --rm

La opción:

```bash
--rm
```

le dice a Docker que elimine automáticamente el contenedor cuando termine.

Esto es muy cómodo para pruebas simples como esta, porque evita que te queden contenedores detenidos acumulados después de cada ejecución.

---

## Qué pasa si no usás --rm

Podrías ejecutar esto:

```bash
docker run mi-mensaje:1.0
```

Y el resultado visible probablemente sería el mismo.

Pero en ese caso, el contenedor no se elimina automáticamente al terminar.

Después podrías verlo con:

```bash
docker ps -a
```

Esto no está mal.
Simplemente es otro comportamiento.

---

## Qué diferencia hay entre imagen y ejecución concreta

Este tema te ayuda a reforzar algo clave:

- la imagen `mi-mensaje:1.0` sigue existiendo después de correr el contenedor
- el contenedor fue una ejecución puntual de esa imagen
- si volvés a correr `docker run --rm mi-mensaje:1.0`, Docker crea otro contenedor nuevo

Eso muestra, una vez más, que imagen y contenedor no son la misma cosa.

---

## Ejecutar la misma imagen varias veces

Podés correr varias veces este mismo comando:

```bash
docker run --rm mi-mensaje:1.0
```

Y cada vez Docker va a:

- crear un contenedor nuevo
- ejecutar el mismo `CMD`
- mostrar la salida
- eliminar el contenedor al terminar

La imagen base sigue siendo la misma.
Lo que cambia es cada ejecución concreta.

---

## Qué pasa si cambiás el archivo y no reconstruís

Esto es importante.

Si modificás `mensaje.txt` en tu carpeta local **después** del build, eso no cambia automáticamente la imagen ya construida.

Para que la imagen refleje ese cambio, tenés que volver a construirla.

O sea:

- cambiar un archivo local no actualiza mágicamente la imagen
- primero tenés que reconstruir
- recién después, al ejecutar, vas a ver el resultado nuevo

Esto te va preparando para entender mejor el caché de build más adelante.

---

## Sobrescribir el comando por defecto

La documentación oficial explica que el `CMD` de una imagen puede sobrescribirse directamente desde `docker run` especificando un comando posicional nuevo. citeturn758139search1

Probá esto:

```bash
docker run --rm mi-mensaje:1.0 ls /app
```

---

## Qué hace este comando

Aunque la imagen tenga definido:

```Dockerfile
CMD ["cat", "mensaje.txt"]
```

al pasar:

```bash
ls /app
```

en `docker run`, estás diciendo:

> para esta ejecución puntual, no uses el comando por defecto; ejecutá este otro

Eso te muestra algo muy importante:

- la imagen trae un comportamiento por defecto
- pero `docker run` puede cambiarlo para una ejecución concreta

---

## Qué deberías ver en ese ejemplo

Si todo está bien, deberías ver algo parecido a:

```text
mensaje.txt
```

Eso confirma que el archivo copiado realmente está dentro de la imagen, en `/app`.

---

## Otro ejemplo de sobrescritura

Probá también:

```bash
docker run --rm mi-mensaje:1.0 cat /app/mensaje.txt
```

---

## Qué tiene de útil

Refuerza dos ideas al mismo tiempo:

- el archivo copiado existe realmente dentro de la imagen
- el `CMD` puede sobrescribirse con otro comando al ejecutar

Esto es muy útil para pruebas, inspección y debugging simple.

---

## Qué no tenés que confundir

### Ejecutar una imagen no modifica la imagen
Estás creando un contenedor nuevo a partir de ella.

### Cambiar archivos locales no cambia una imagen ya construida
Primero necesitás reconstruir.

### Sobrescribir el comando no cambia el Dockerfile
Solo afecta esa ejecución puntual del contenedor.

### `--rm` elimina el contenedor, no la imagen
La imagen sigue disponible localmente.

---

## Error común 1: esperar que cambie la salida sin reconstruir

Si cambiaste `mensaje.txt` pero no hiciste otro `docker build`, la imagen sigue teniendo la versión anterior del archivo.

---

## Error común 2: pensar que docker run ejecuta el Dockerfile

No.

`docker run` usa una imagen ya construida.
El Dockerfile intervino antes, durante el build.

---

## Error común 3: creer que el CMD está “fijo para siempre”

No exactamente.

Es el comportamiento por defecto de la imagen, pero puede sobrescribirse en una ejecución concreta con `docker run`.

---

## Error común 4: no distinguir la imagen del contenedor temporal

El contenedor puede desaparecer con `--rm`, pero la imagen sigue quedando en tu máquina.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Verificá que la imagen exista:

```bash
docker image ls
```

### Ejercicio 2
Ejecutá la imagen con limpieza automática:

```bash
docker run --rm mi-mensaje:1.0
```

### Ejercicio 3
Respondé con tus palabras:

- ¿qué salida viste?
- ¿por qué apareció esa salida?
- ¿qué relación tiene con `CMD`?

### Ejercicio 4
Sobrescribí el comando por defecto para listar el contenido del directorio de trabajo:

```bash
docker run --rm mi-mensaje:1.0 ls /app
```

### Ejercicio 5
Sobrescribí el comando para mostrar el archivo por una ruta explícita:

```bash
docker run --rm mi-mensaje:1.0 cat /app/mensaje.txt
```

### Ejercicio 6
Si querés comprobar la diferencia con y sin limpieza automática, corré una vez sin `--rm`:

```bash
docker run mi-mensaje:1.0
```

Después mirá los contenedores:

```bash
docker ps -a
```

Y fijate qué cambió.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, prestá atención a estas preguntas:

- ¿qué diferencia concreta viste entre construir y ejecutar?
- ¿qué papel jugó `CMD` en el resultado?
- ¿qué cambió cuando sobrescribiste el comando?
- ¿qué diferencia notaste entre usar `--rm` y no usarlo?
- ¿por qué una imagen sigue existiendo aunque el contenedor desaparezca?

Estas observaciones valen mucho más que repetir el comando de memoria.

---

## Mini desafío

Intentá explicar con tus palabras este flujo completo:

1. escribir un Dockerfile
2. construir una imagen con `docker build`
3. ejecutar esa imagen con `docker run --rm`
4. sobrescribir el comando por defecto con otro comando
5. volver a ejecutar la misma imagen sin cambiarla

Y además respondé:

- ¿por qué `docker run` crea un contenedor nuevo cada vez?
- ¿qué ventaja tiene tener un `CMD` razonable por defecto?
- ¿qué demuestra el hecho de poder ejecutar `ls /app` o `cat /app/mensaje.txt` sobre la misma imagen?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- ejecutar una imagen construida por vos
- explicar por qué el contenedor hace lo que hace
- relacionar `CMD` con el comportamiento por defecto del contenedor
- sobrescribir ese comportamiento en una ejecución puntual
- cerrar el ciclo Dockerfile → build → run con mucha más claridad

---

## Resumen del tema

- `docker run` crea y ejecuta un contenedor a partir de una imagen.
- Si la imagen define un `CMD`, ese comando se usa por defecto.
- `--rm` elimina el contenedor cuando termina.
- La imagen sigue existiendo aunque el contenedor desaparezca.
- Podés sobrescribir el comando por defecto al ejecutar la imagen.
- Este tema cierra el primer circuito completo de construcción y ejecución de imágenes propias.

---

## Próximo tema

En el próximo tema vas a empezar a entender por qué a veces un build es rápido y otras veces no:

- caché de build
- orden de instrucciones
- cómo Docker reutiliza pasos anteriores
