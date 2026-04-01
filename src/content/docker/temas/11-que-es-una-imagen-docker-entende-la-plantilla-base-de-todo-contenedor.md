---
title: "Qué es una imagen Docker: entendé la plantilla base de todo contenedor"
description: "Tema 11 del curso práctico de Docker: qué es una imagen Docker, qué contiene, por qué no es lo mismo que un contenedor y cómo empezar a pensar imágenes locales, etiquetas y reutilización."
order: 11
module: "Primeros pasos reales con imágenes"
level: "base"
draft: false
---

# Qué es una imagen Docker: entendé la plantilla base de todo contenedor

## Objetivo del tema

En este tema vas a:

- entender con más profundidad qué es una imagen Docker
- diferenciar imagen y contenedor con total claridad
- ver qué suele contener una imagen
- empezar a pensar las imágenes como plantillas reutilizables
- prepararte para descargar, etiquetar y construir imágenes en los próximos temas

La idea es que entres al bloque de imágenes con una base conceptual sólida, porque a partir de ahora el curso va a girar mucho alrededor de ellas.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. reforzar qué es una imagen
2. entender por qué una imagen no “está corriendo”
3. ver qué suele haber dentro de una imagen
4. pensar la relación entre imagen, contenedor y registro
5. empezar a mirar las imágenes locales con más criterio

---

## Idea central que tenés que llevarte

Una imagen Docker es una **plantilla preparada** para crear contenedores.

No es una aplicación corriendo.
No es una sesión activa.
No es una máquina virtual completa.

Es la base a partir de la cual Docker puede crear una o más instancias ejecutables.

Dicho simple:

> la imagen es la plantilla  
> el contenedor es la ejecución concreta de esa plantilla

---

## Qué es una imagen Docker

Una imagen Docker es un paquete estandarizado que incluye lo necesario para ejecutar un contenedor.

En términos prácticos, una imagen puede incluir:

- archivos
- binarios
- librerías
- dependencias
- configuración
- un comando de arranque por defecto

Eso la vuelve una unidad muy útil para compartir y reutilizar entornos.

---

## Qué no es una imagen

Esto te tiene que quedar clarísimo.

Una imagen **no** es:

- un contenedor en ejecución
- un proceso vivo
- una terminal abierta
- una aplicación interactuando con vos

Una imagen está más cerca de una definición preparada que de una ejecución activa.

---

## Imagen y contenedor, otra vez pero mejor

Ya viste esta diferencia antes, pero ahora conviene reforzarla.

### Imagen
Es la plantilla o base.

### Contenedor
Es la instancia creada a partir de esa imagen.

Una misma imagen puede servir para crear varios contenedores.

Por ejemplo, podrías usar una misma imagen para levantar:

- un contenedor de prueba
- otro de desarrollo
- otro temporal para una tarea puntual

La base sería la misma, pero las ejecuciones concretas serían distintas.

---

## Qué suele contener una imagen

No todas las imágenes tienen exactamente lo mismo, pero muchas suelen incluir:

- una base mínima del sistema
- herramientas del runtime
- archivos de la aplicación
- configuración necesaria
- metadatos
- el proceso o comando por defecto para arrancar

Por eso una imagen puede representar cosas muy distintas.

Por ejemplo:

- una base de datos
- un servidor web
- una herramienta de consola
- una aplicación propia
- una imagen base para construir otra encima

---

## Ejemplos de imágenes que ya conocés

A esta altura del curso ya usaste algunas imágenes sin detenerte demasiado en ellas.

Por ejemplo:

- `hello-world`
- `alpine`
- `nginx`

Cada una representa una plantilla distinta.

### `hello-world`
Sirve como prueba muy simple de que Docker funciona.

### `alpine`
Es una imagen muy liviana, útil para pruebas y ejercicios simples.

### `nginx`
Representa un servidor web listo para usarse como base de un contenedor.

---

## Qué relación hay entre imagen y registro

Las imágenes suelen obtenerse desde un registro.

Eso significa que muchas veces el flujo real es este:

1. una imagen existe en un registro
2. la descargás a tu máquina
3. Docker la guarda localmente
4. después la usás para crear contenedores

Más adelante vas a trabajar mejor con Docker Hub y con referencias de imagen, pero ya conviene que esta idea te quede clara.

---

## Qué significa tener una imagen “local”

Cuando descargás una imagen, esa imagen queda disponible en tu máquina local.

Eso te permite:

- volver a usarla sin descargarla de nuevo cada vez
- crear varios contenedores a partir de ella
- inspeccionarla
- etiquetarla
- borrarla cuando ya no la necesites

---

## Cómo ver las imágenes que tenés

Ejecutá:

```bash
docker image ls
```

O también:

```bash
docker images
```

---

## Qué deberías ver

Deberías ver una tabla con columnas como estas:

- repository
- tag
- image ID
- created
- size

No hace falta memorizar cada una ahora.
Lo importante es empezar a reconocer que las imágenes son recursos concretos que quedan almacenados en tu entorno local.

---

## Qué te dice repository y tag

Aunque más adelante vas a ver etiquetas y versiones con más detalle, conviene ir mirando esto desde ahora.

Por ejemplo, si ves algo como:

```text
nginx   latest
```

la idea básica es:

- `nginx` identifica la imagen
- `latest` es una etiqueta

Más adelante vas a trabajar esto mucho mejor, pero por ahora solo quiero que empieces a reconocerlo visualmente.

---

## Qué pasa cuando corrés un contenedor desde una imagen

Supongamos este comando:

```bash
docker run nginx
```

La idea mental correcta es esta:

- Docker toma la imagen `nginx`
- crea un contenedor a partir de ella
- ejecuta el proceso principal de ese contenedor

O sea:

la imagen sigue siendo la base,
y el contenedor es la instancia en ejecución.

---

## Qué pasa si usás la misma imagen varias veces

Podrías hacer algo como esto:

```bash
docker run --name web1 -d -p 8080:80 nginx
docker run --name web2 -d -p 9090:80 nginx
```

No hace falta ejecutar esto ahora si no querés.
La idea es que veas el concepto:

- la imagen base es la misma
- los contenedores creados son distintos
- cada uno tiene su propia ejecución, nombre y mapeo de puertos

Eso muestra claramente por qué la imagen y el contenedor no son la misma cosa.

---

## Qué valor tiene pensar bien en imágenes

Entender bien las imágenes te ayuda muchísimo porque después vas a trabajar con temas como:

- descargar imágenes desde Docker Hub
- elegir bien una imagen base
- usar etiquetas
- escribir Dockerfiles
- construir imágenes propias
- optimizar tamaño y reutilización

Si la idea de imagen no está clara, todo eso se vuelve mucho más confuso.

---

## Qué no tenés que confundir

### Imagen no es lo mismo que Dockerfile
El Dockerfile es una receta escrita por vos.
La imagen es el resultado que se construye a partir de esa receta.

### Imagen no es lo mismo que contenedor
La imagen es la plantilla.
El contenedor es la instancia en ejecución.

### Tener una imagen no significa que haya algo corriendo
Podés tener muchas imágenes descargadas y ningún contenedor activo.

---

## Error común 1: pensar que bajar una imagen ya “levanta” algo

No.

Descargar una imagen no ejecuta un contenedor automáticamente.

Para que algo corra, después tenés que crear y ejecutar un contenedor a partir de esa imagen.

---

## Error común 2: creer que borrar un contenedor borra la imagen

No necesariamente.

Un contenedor y una imagen son recursos distintos.

Podrías borrar todos los contenedores creados desde `nginx` y seguir teniendo la imagen `nginx` descargada localmente.

---

## Error común 3: pensar que todas las imágenes son aplicaciones completas

No siempre.

Algunas imágenes representan:

- una base mínima
- una utilidad concreta
- un runtime
- una app ya lista
- una base sobre la que vos vas a construir otra imagen

---

## Error común 4: ignorar el tamaño de la imagen

Aunque ahora todavía no es el foco principal, conviene empezar a mirar la columna `size` en `docker image ls`.

Más adelante vas a ver que elegir bien una imagen base afecta:

- tiempo de descarga
- tiempo de build
- consumo de espacio
- velocidad de trabajo
- superficie de complejidad

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Listá las imágenes que tenés disponibles:

```bash
docker image ls
```

### Ejercicio 2
Identificá si aparecen algunas de estas:

```text
hello-world
alpine
nginx
```

### Ejercicio 3
Respondé con tus palabras para cada una:

- ¿es una imagen o un contenedor?
- ¿está corriendo o solo está almacenada?
- ¿para qué tipo de uso te parece que serviría?

### Ejercicio 4
Si querés reforzar el concepto, corré un contenedor a partir de una imagen que ya tengas:

```bash
docker run --rm alpine echo "Usando una imagen para crear un contenedor"
```

Después explicá con tus palabras:

- qué era la imagen
- qué fue el contenedor
- por qué el contenedor terminó y la imagen siguió existiendo

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué imágenes ya estaban en tu máquina?
- ¿qué columnas te mostró `docker image ls`?
- ¿qué diferencia concreta pudiste explicar entre imagen y contenedor?
- ¿por qué una imagen puede reutilizarse varias veces?
- ¿por qué conviene pensar en una imagen como plantilla y no como ejecución?

Estas observaciones valen mucho más que repetir definiciones de memoria.

---

## Mini desafío

Intentá explicar con tus palabras esta situación:

- tenés una imagen `nginx`
- creás dos contenedores distintos usando esa misma imagen
- uno publica `8080:80`
- el otro publica `9090:80`

Respondé:

- qué parte comparten ambos contenedores
- qué parte es distinta
- por qué eso demuestra que imagen y contenedor no son lo mismo

Y además respondé:

- ¿por qué una imagen no “está viva” por sí sola?
- ¿qué lugar ocupa el registro en toda esta historia?
- ¿qué ventaja tiene poder reutilizar imágenes?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es una imagen Docker con más precisión
- diferenciar imagen, contenedor y Dockerfile
- reconocer imágenes locales en tu entorno
- entender por qué una imagen puede reutilizarse muchas veces
- prepararte mejor para descargar, etiquetar y construir imágenes

---

## Resumen del tema

- Una imagen Docker es una plantilla preparada para crear contenedores.
- Puede incluir archivos, binarios, librerías, configuración y un comando por defecto.
- La imagen no está corriendo por sí sola.
- El contenedor es la instancia creada a partir de la imagen.
- Las imágenes suelen descargarse desde registros y quedan almacenadas localmente.
- Entender bien las imágenes te prepara para todo el bloque de Dockerfile y builds.

---

## Próximo tema

En el próximo tema vas a pasar del concepto a la práctica directa:

- descargar imágenes desde Docker Hub
- entender mejor de dónde salen
- empezar a traer recursos reales a tu entorno local
