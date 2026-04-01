---
title: "Qué es un Dockerfile: la receta con la que empezás a construir tus propias imágenes"
description: "Tema 14 del curso práctico de Docker: qué es un Dockerfile, por qué se vuelve el archivo central al crear imágenes propias y cómo empezar a leerlo como una receta reproducible para construir contenedores."
order: 14
module: "Primeros pasos reales con imágenes"
level: "base"
draft: false
---

# Qué es un Dockerfile: la receta con la que empezás a construir tus propias imágenes

## Objetivo del tema

En este tema vas a:

- entender qué es un Dockerfile
- ver por qué se vuelve el archivo central cuando querés crear imágenes propias
- empezar a leer un Dockerfile como una receta paso a paso
- distinguir claramente Dockerfile, imagen y contenedor
- prepararte para usar instrucciones como `FROM`, `WORKDIR`, `COPY`, `RUN` y `CMD` en los próximos temas

La idea es que pases de “usar imágenes ajenas” a empezar a pensar cómo se construyen las tuyas.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. entender qué es un Dockerfile
2. ver qué relación tiene con una imagen
3. entender por qué no es lo mismo que un contenedor
4. leer un ejemplo simple
5. empezar a pensar cómo se transforma código y configuración en una imagen construida por vos

---

## Idea central que tenés que llevarte

Un Dockerfile es el archivo donde escribís las instrucciones para construir una imagen Docker propia.

Dicho simple:

> el Dockerfile es la receta  
> la imagen es el resultado construido  
> el contenedor es la ejecución de esa imagen

Esa cadena te tiene que quedar totalmente clara desde ahora.

---

## Qué es un Dockerfile

Un Dockerfile es un archivo de texto que contiene instrucciones para construir una imagen.

En ese archivo podés indicar, por ejemplo:

- cuál es la imagen base
- qué archivos querés copiar
- qué dependencias querés instalar
- desde qué carpeta querés trabajar
- qué comando debería ejecutarse al arrancar el contenedor

No hace falta entender todas las instrucciones hoy.
Lo importante es captar la idea general.

---

## Qué dice la documentación oficial

La documentación oficial de Docker define el Dockerfile como un archivo de texto que contiene instrucciones para construir una imagen y explica que Docker crea imágenes leyendo ese archivo paso a paso. También lo describe como el punto de partida central para construir imágenes propias. citeturn358402search0turn358402search1turn358402search2

---

## Por qué el Dockerfile es tan importante

Hasta ahora trabajaste mucho con imágenes ya hechas, por ejemplo:

- `alpine`
- `nginx`
- `hello-world`

Eso está muy bien para aprender y practicar.

Pero en proyectos reales, muchas veces querés algo como esto:

- partir de una imagen base
- copiar tu aplicación
- instalar dependencias
- dejar un comando de arranque listo
- construir una imagen que represente tu proyecto

Ahí es donde el Dockerfile se vuelve protagonista.

---

## Qué problema resuelve un Dockerfile

Sin Dockerfile, podrías llegar a armar una imagen de formas más improvisadas o poco repetibles.

Con un Dockerfile, en cambio, dejás definido por escrito:

- cómo se construye la imagen
- qué pasos sigue
- qué archivos necesita
- qué dependencias instala
- cómo debería arrancar

Eso hace que el build sea mucho más claro, repetible y compartible.

---

## Dockerfile, imagen y contenedor

Esta diferencia te tiene que quedar clarísima.

### Dockerfile
Es la receta escrita por vos.

### Imagen
Es el resultado construido a partir de esa receta.

### Contenedor
Es la instancia que se ejecuta usando esa imagen.

Si esta relación se entiende bien, todo el bloque que sigue se vuelve mucho más simple.

---

## Qué no es un Dockerfile

Un Dockerfile **no** es:

- la imagen en sí misma
- el contenedor en ejecución
- una terminal dentro del contenedor
- un archivo para correr directamente como si fuera un programa

Es una definición de construcción.

O sea: describe cómo querés que se arme la imagen.

---

## Cómo suele llamarse

Lo habitual es que el archivo se llame exactamente así:

```text
Dockerfile
```

con D mayúscula y sin extensión.

Más adelante vas a ver que pueden usarse nombres alternativos en ciertos contextos, pero al comienzo este es el estándar que más conviene adoptar.

---

## Dónde suele ubicarse

En muchísimos proyectos, el Dockerfile se ubica en la raíz del proyecto.

Por ejemplo:

```text
mi-app/
├── Dockerfile
├── package.json
├── src/
└── ...
```

o:

```text
mi-api/
├── Dockerfile
├── pom.xml
├── src/
└── ...
```

Esto no es casualidad:
más adelante vas a ver que la ubicación se relaciona mucho con el contexto de build.

---

## Qué aspecto tiene un Dockerfile simple

Un ejemplo muy básico podría ser este:

```Dockerfile
FROM alpine:3.20
CMD ["echo", "Hola desde mi primera imagen"]
```

---

## Qué idea general expresa ese Dockerfile

Aunque todavía no profundices en cada instrucción, la lectura conceptual sería algo así:

- partí de la imagen `alpine:3.20`
- cuando el contenedor arranque, ejecutá este comando

Eso ya te muestra algo muy importante:

un Dockerfile es una secuencia de decisiones sobre cómo armar una imagen y cómo debería comportarse al ejecutarse.

---

## Qué tipo de instrucciones suele tener

Docker muestra en su documentación que entre las instrucciones más comunes de un Dockerfile están cosas como:

- `FROM`
- `WORKDIR`
- `COPY`
- `RUN`
- `CMD`

Esas son justamente las que vas a empezar a trabajar en los próximos temas. citeturn358402search0turn358402search2

---

## Qué hace FROM a nivel de idea

`FROM` define la imagen base desde la que vas a partir.

Por ejemplo:

```Dockerfile
FROM nginx
```

o:

```Dockerfile
FROM python:3.13
```

La idea es:

> no empezás desde la nada  
> empezás desde una base sobre la cual construís algo

---

## Qué hace COPY a nivel de idea

`COPY` sirve para copiar archivos desde tu proyecto al sistema de archivos de la imagen que se está construyendo.

Eso es clave porque en algún momento vas a querer meter dentro de la imagen cosas como:

- código fuente
- archivos estáticos
- configuración
- dependencias ya preparadas
- scripts

---

## Qué hace RUN a nivel de idea

`RUN` sirve para ejecutar comandos durante la construcción de la imagen.

Por ejemplo, más adelante puede usarse para:

- instalar dependencias
- crear carpetas
- preparar archivos
- compilar partes del proyecto

Importante:

`RUN` actúa durante el build, no cuando el contenedor ya está corriendo normalmente.

---

## Qué hace CMD a nivel de idea

`CMD` ayuda a definir qué comando debería ejecutarse por defecto cuando el contenedor arranque.

Eso es distinto de construir la imagen.

Una cosa es cómo se arma.
Otra cosa es qué hace cuando la ejecutás.

Esta diferencia la vas a ir afinando cada vez más.

---

## Qué dice Docker sobre construir imágenes

Docker también explica oficialmente que las imágenes se construyen a partir de un Dockerfile y que ese proceso de build toma como entrada el Dockerfile y un contexto de build. Ese contexto incluye los archivos a los que pueden acceder instrucciones como `COPY` y `ADD`. citeturn358402search9turn358402search15

---

## Qué significa que el Dockerfile sea reproducible

Una de las grandes ventajas del Dockerfile es que deja documentado por escrito cómo construir una imagen.

Eso significa que otra persona podría:

- tomar tu proyecto
- usar el mismo Dockerfile
- construir la misma imagen o una muy parecida
- entender con mucha más facilidad cómo se arma el entorno

En otras palabras, el Dockerfile vuelve explícito el proceso de construcción.

---

## Qué relación tiene esto con tu forma de trabajar

Pensalo así.

Hasta ahora usabas imágenes ya hechas.

A partir de ahora vas a empezar a poder decir:

- esta es mi app
- esta es la base que quiero usar
- estos son mis archivos
- estas son mis dependencias
- este es el comando de arranque

Y todo eso va a quedar definido en un solo archivo central.

Ese salto es muy importante.

---

## Ejemplo mental simple

Imaginá que tenés una app web estática.

Sin Dockerfile, podrías decir algo así:

> “Bueno, más o menos hay que usar Nginx y copiar estos archivos.”

Con Dockerfile, en cambio, podés decir:

> “Partí de Nginx, copiá estos archivos al lugar correcto y dejá lista la imagen.”

Esa diferencia entre idea informal y receta reproducible es justamente el valor del Dockerfile.

---

## Qué no tenés que confundir

### Dockerfile no es lo mismo que imagen
El Dockerfile describe cómo construir.
La imagen es el resultado.

### Dockerfile no es lo mismo que docker run
`docker run` ejecuta contenedores.
El Dockerfile define cómo construir imágenes.

### Dockerfile no es un archivo aislado sin contexto
Muchas instrucciones dependen de los archivos de tu proyecto y del contexto de build.

---

## Error común 1: pensar que el Dockerfile ya “es la imagen”

No.

Primero escribís el Dockerfile.
Después construís una imagen a partir de él.

---

## Error común 2: pensar que el Dockerfile ejecuta el contenedor automáticamente

No.

El Dockerfile define la construcción de la imagen.

Después, en otro paso, vos construís esa imagen.
Y recién después la podés ejecutar como contenedor.

---

## Error común 3: meter todo sin pensar en el archivo

Al principio puede tentarte poner cualquier cosa en el Dockerfile.

Pero más adelante vas a ver que el orden, la claridad y la elección de la imagen base importan muchísimo.

---

## Error común 4: no distinguir build de runtime

Esto es clave desde ahora:

- una cosa es lo que pasa mientras construís la imagen
- otra cosa es lo que pasa cuando ejecutás el contenedor

Dockerfile trabaja mucho con esa diferencia.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá una carpeta de práctica, por ejemplo:

```bash
mkdir practica-dockerfile
cd practica-dockerfile
```

### Ejercicio 2
Creá un archivo llamado:

```text
Dockerfile
```

### Ejercicio 3
Pegá este contenido:

```Dockerfile
FROM alpine:3.20
CMD ["echo", "Hola desde mi primera imagen"]
```

### Ejercicio 4
Todavía no hace falta construir nada si no querés adelantarte al tema siguiente.
Primero respondé con tus palabras:

- ¿qué parte define la base?
- ¿qué parte define el comportamiento al arrancar?
- ¿qué diferencia hay entre este archivo y una imagen ya construida?

### Ejercicio 5
Si querés adelantarte un poco y probar por curiosidad, guardalo y dejalo listo para usar en el próximo tema.

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué diferencia concreta pudiste explicar entre Dockerfile, imagen y contenedor?
- ¿por qué un Dockerfile hace más repetible la construcción?
- ¿qué te sugiere visualmente una instrucción como `FROM`?
- ¿qué te sugiere visualmente una instrucción como `CMD`?
- ¿por qué te conviene que el proceso de construcción quede escrito?

Estas observaciones valen mucho más que memorizar sintaxis suelta.

---

## Mini desafío

Intentá explicar con tus palabras este Dockerfile:

```Dockerfile
FROM alpine:3.20
CMD ["echo", "Hola desde Dockerfile"]
```

Respondé:

- qué imagen base usa
- qué decisión deja escrita
- qué parte pertenece al build y qué parte al arranque
- por qué esto todavía no es una imagen ni un contenedor

Y además respondé:

- ¿qué ventaja tiene tener una receta escrita?
- ¿por qué un Dockerfile ayuda a compartir mejor un proyecto?
- ¿qué esperás que pase en el próximo tema cuando uses `docker build`?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es un Dockerfile con claridad
- distinguir Dockerfile, imagen y contenedor
- entender por qué el Dockerfile se vuelve el archivo central al crear imágenes propias
- leer un Dockerfile simple sin perderte
- prepararte mejor para construir tu primera imagen propia

---

## Resumen del tema

- Un Dockerfile es un archivo de texto con instrucciones para construir una imagen.
- Docker lo lee paso a paso para crear la imagen resultante.
- No es la imagen ni el contenedor, sino la receta de construcción.
- Instrucciones como `FROM`, `COPY`, `RUN` y `CMD` forman parte central de ese archivo.
- El Dockerfile vuelve más claro, repetible y compartible el proceso de construcción.
- Entenderlo bien te prepara para el bloque práctico de builds.

---

## Próximo tema

En el próximo tema vas a empezar a leer y usar instrucciones concretas del Dockerfile con intención:

- `FROM`
- `WORKDIR`
- `COPY`
- `CMD`
- cómo se combinan para una imagen simple y útil
