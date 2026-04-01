---
title: "Primer contenedor con docker run: entendé qué ejecutás y empezá a usar Docker de verdad"
description: "Cuarto tema práctico del curso de Docker: cómo usar docker run por primera vez, qué significa realmente ese comando y cómo ejecutar tus primeros contenedores con intención."
order: 4
module: "Fundamentos de Docker"
level: "intro"
draft: false
---

# Primer contenedor con docker run: entendé qué ejecutás y empezá a usar Docker de verdad

## Objetivo del tema

En este tema vas a:

- usar `docker run` con intención
- entender qué ocurre realmente cuando ejecutás ese comando
- correr tus primeros contenedores de forma práctica
- distinguir ejecución interactiva y no interactiva
- empezar a leer comandos Docker con más claridad

La idea es que dejes de ver `docker run` como una línea rara y empieces a entenderlo como el punto de partida real para trabajar con contenedores.

---

## Qué vas a hacer hoy

En este tema vas a seguir este flujo:

1. entender qué hace `docker run`
2. ejecutar un contenedor simple
3. ejecutar un contenedor interactivo
4. probar variantes básicas del comando
5. empezar a leer cada parte con sentido

---

## Idea central que tenés que llevarte

`docker run` es uno de los comandos más importantes de Docker.

Sirve para:

- tomar una imagen
- crear un contenedor a partir de esa imagen
- y ejecutarlo

Dicho simple:

> `docker run` transforma una imagen en un contenedor en ejecución.

---

## La forma más básica del comando

La forma más simple es esta:

```bash
docker run hello-world
```

Ya la usaste en el tema anterior como prueba de instalación, pero ahora la vamos a mirar con más intención.

---

## Qué significa realmente ese comando

Cuando ejecutás:

```bash
docker run hello-world
```

Docker hace, en esencia, esto:

1. busca la imagen `hello-world` en tu máquina
2. si no la encuentra, la descarga
3. crea un contenedor a partir de esa imagen
4. ejecuta el contenedor
5. el contenedor muestra un mensaje
6. el contenedor termina

O sea: no solo “corre algo”.
Hay todo un flujo detrás.

---

## Qué tenés que visualizar cada vez que uses docker run

Cada vez que leas un comando así:

```bash
docker run imagen
```

tenés que pensar:

- qué imagen se va a usar
- si ya está descargada o no
- qué contenedor se va a crear
- qué proceso se va a ejecutar dentro del contenedor
- si ese contenedor va a quedar corriendo o va a terminar enseguida

Esa forma de pensar te va a servir muchísimo más que memorizar sintaxis sin entenderla.

---

## Primer ejemplo: contenedor que se ejecuta y termina

Probá otra vez:

```bash
docker run hello-world
```

## Qué pasa acá

Este contenedor no queda funcionando de forma persistente.

Hace algo muy puntual:

- muestra un mensaje
- finaliza

Eso es importante porque no todos los contenedores están pensados para quedar activos.

Algunos hacen una tarea breve y terminan.
Otros levantan un servicio y siguen corriendo.

---

## Segundo ejemplo: un contenedor interactivo

Ahora probá esto:

```bash
docker run -it alpine sh
```

---

## Qué significa este comando

Acá ya aparecen varias piezas nuevas:

### `docker run`
Indica que vas a crear y ejecutar un contenedor.

### `-it`
Le pide a Docker una sesión interactiva en terminal.

### `alpine`
Es la imagen que se va a usar.

### `sh`
Es el comando que se va a ejecutar dentro del contenedor.

---

## Qué deberías ver

Si todo sale bien, vas a entrar a una shell dentro del contenedor.

Eso significa que ya no estás simplemente lanzando algo que imprime un mensaje y termina.

Ahora estás interactuando dentro del contenedor.

---

## Qué podés hacer ahí adentro

Una vez dentro, probá comandos simples como estos:

```sh
pwd
ls
echo "Hola desde el contenedor"
```

La idea no es explorar todo todavía, sino sentir que realmente entraste a un entorno aislado.

---

## Cómo salir del contenedor interactivo

Para salir de esa shell, ejecutá:

```sh
exit
```

Eso termina el proceso principal y, con eso, el contenedor deja de ejecutarse.

---

## Qué significa que el contenedor ejecute un proceso

Un contenedor vive mientras su proceso principal esté activo.

Esto es una idea muy importante desde el comienzo.

Por ejemplo:

- si el proceso principal termina, el contenedor termina
- si el proceso principal sigue corriendo, el contenedor sigue vivo

Por eso `hello-world` dura un instante y una shell interactiva dura mientras vos estés dentro.

---

## Tercer ejemplo: ejecutar un comando puntual dentro de un contenedor

Probá esto:

```bash
docker run alpine echo "Hola desde Alpine"
```

## Qué hace

- usa la imagen `alpine`
- crea un contenedor
- ejecuta el comando `echo "Hola desde Alpine"`
- muestra el texto
- termina

Este ejemplo es muy útil porque te enseña que un contenedor no siempre arranca una aplicación compleja.
A veces simplemente ejecuta un comando puntual.

---

## Cuarto ejemplo: consultar información simple dentro del contenedor

Probá esto:

```bash
docker run alpine uname -a
```

## Qué hace

- crea un contenedor desde `alpine`
- ejecuta `uname -a`
- muestra la salida
- termina

Esto te ayuda a ver que Docker puede usarse también para correr herramientas o tareas breves en entornos aislados.

---

## Qué diferencia hay entre estos ejemplos

### `docker run hello-world`
Ejecuta una prueba simple y termina.

### `docker run -it alpine sh`
Te deja entrar de forma interactiva a una shell.

### `docker run alpine echo "Hola desde Alpine"`
Ejecuta un comando puntual y termina.

Las tres usan `docker run`, pero no hacen exactamente lo mismo.

---

## La estructura mental del comando

Aunque más adelante vas a ver muchas opciones, por ahora conviene pensar `docker run` así:

```bash
docker run [opciones] imagen [comando]
```

Eso te da una base muy buena para leer casi cualquier ejemplo inicial.

---

## Qué son las opciones

Las opciones modifican el comportamiento de `docker run`.

Por ejemplo, pueden servir para:

- entrar en modo interactivo
- poner nombre al contenedor
- publicar puertos
- pasar variables de entorno
- montar volúmenes

En este tema solo vas a usar lo mínimo.
Después cada parte va a tener su propio tema.

---

## Por qué -it aparece tanto

`-it` aparece muchísimo cuando estás aprendiendo Docker porque permite abrir una terminal interactiva dentro del contenedor.

No siempre hace falta, pero al comienzo es muy útil para entender que el contenedor es un entorno real donde se ejecutan procesos.

---

## Qué no tenés que confundir

### `docker run` no solo “inicia” algo
También crea el contenedor si todavía no existe.

### La imagen no es el contenedor
La imagen es la base.
El contenedor es lo que Docker crea al ejecutar.

### Entrar a una shell no es obligatorio
Muchos contenedores se usan sin interacción manual.

---

## Error común 1: creer que todos los contenedores quedan corriendo

No.

Depende de qué proceso ejecuten.

Si el proceso termina, el contenedor termina.

---

## Error común 2: pensar que un contenedor siempre es una app web

No necesariamente.

Un contenedor puede ejecutar:

- una shell
- una base de datos
- un servidor web
- una tarea puntual
- un script
- una utilidad de consola

---

## Error común 3: no entender qué parte es la imagen y qué parte es el comando

En esto:

```bash
docker run alpine echo "Hola"
```

- `alpine` es la imagen
- `echo "Hola"` es el comando que se ejecuta dentro del contenedor

Esta distinción te tiene que quedar clara desde ahora.

---

## Ejercicio práctico obligatorio

Quiero que ejecutes exactamente estos comandos:

### Ejercicio 1
```bash
docker run hello-world
```

### Ejercicio 2
```bash
docker run alpine echo "Hola desde Docker"
```

### Ejercicio 3
```bash
docker run alpine uname -a
```

### Ejercicio 4
```bash
docker run -it alpine sh
```

Ya dentro del contenedor, ejecutá:

```sh
pwd
ls
echo "Estoy dentro de un contenedor"
exit
```

---

## Qué tenés que observar en cada caso

Mientras hacés los ejercicios, preguntate:

- ¿la imagen ya estaba o tuvo que descargarse?
- ¿el contenedor terminó enseguida o quedó activo?
- ¿hubo interacción o no?
- ¿qué proceso principal se ejecutó?

La idea es que no solo copies comandos, sino que entiendas qué está ocurriendo.

---

## Mini desafío

Tomá uno de los comandos del tema e intentá explicarlo con tus palabras usando esta estructura:

- qué imagen usa
- qué contenedor crea
- qué comando ejecuta
- por qué termina o sigue activo

Por ejemplo, podrías hacerlo con:

```bash
docker run -it alpine sh
```

Si podés explicar bien ese comando, ya estás empezando a pensar correctamente en Docker.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- usar `docker run` en ejemplos básicos
- entender que `docker run` crea y ejecuta contenedores
- distinguir imagen y comando dentro del contenedor
- reconocer cuándo un contenedor va a terminar enseguida y cuándo no
- entrar de forma interactiva a un contenedor simple

---

## Resumen del tema

- `docker run` toma una imagen y crea un contenedor para ejecutarla.
- Un contenedor vive mientras su proceso principal siga activo.
- Podés usar `docker run` para tareas breves o para sesiones interactivas.
- La forma mental correcta es:
  - opciones
  - imagen
  - comando
- Entender bien este comando te abre la puerta al resto del curso.

---

## Próximo tema

En el próximo tema vas a seguir profundizando sobre el comportamiento real de los contenedores:

- ciclo de vida
- crear
- iniciar
- detener
- reiniciar
- eliminar
