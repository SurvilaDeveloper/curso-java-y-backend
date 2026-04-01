---
title: "Instalación de Docker y verificación del entorno: dejá todo listo para empezar a trabajar"
description: "Tercer tema práctico del curso de Docker: cómo instalar Docker, qué verificar después de la instalación y cómo comprobar con un primer contenedor que el entorno quedó funcionando correctamente."
order: 3
module: "Fundamentos de Docker"
level: "intro"
draft: false
---

# Instalación de Docker y verificación del entorno: dejá todo listo para empezar a trabajar

## Objetivo del tema

En este tema vas a:

- instalar Docker correctamente
- verificar que Docker quedó funcionando
- entender qué componentes mínimos tenés que tener listos
- ejecutar una primera comprobación real del entorno
- detectar y resolver errores comunes de instalación

La idea no es perder tiempo con teoría de más, sino dejar tu entorno preparado para empezar a trabajar de verdad con contenedores.

---

## Qué vas a hacer hoy

En este tema vas a seguir este flujo:

1. elegir el camino de instalación correcto
2. instalar Docker
3. abrir Docker y comprobar que arrancó bien
4. verificar la CLI desde terminal
5. ejecutar un contenedor de prueba
6. revisar errores comunes si algo falla

---

## Requisitos previos

Antes de empezar, necesitás:

- acceso para instalar software en tu máquina
- una terminal disponible
- conexión a internet para descargar Docker y la imagen de prueba
- reiniciar la máquina si la instalación lo requiere

---

## Idea central que tenés que llevarte

Instalar Docker no es solamente “bajar un programa”.

Lo importante es que, al terminar, puedas hacer tres cosas:

- abrir Docker sin errores
- usar comandos Docker desde terminal
- ejecutar un contenedor real

Si esas tres cosas funcionan, entonces tu entorno ya está listo para empezar el curso en serio.

---

## Qué conviene instalar según tu sistema

### Si estás en Windows o macOS
Lo más habitual para desarrollo es instalar **Docker Desktop**.

### Si estás en Linux
Podés usar **Docker Engine** o, en algunos casos, Docker Desktop para Linux.

Para este curso, si trabajás en Windows, el camino más directo y cómodo es **Docker Desktop**.

---

## Recomendación para este curso

Si estás en Windows, seguí este camino:

- instalar Docker Desktop
- dejar que complete su configuración
- abrirlo y esperar a que termine de iniciar
- verificar comandos desde terminal

Si estás en Linux, el flujo general del curso te va a servir igual, aunque algunos pasos de instalación cambien según tu distribución.

---

## Instalación en Windows

## Paso 1: descargar Docker Desktop

Descargá Docker Desktop desde el sitio oficial de Docker.

## Paso 2: ejecutar el instalador

Ejecutá el instalador y seguí los pasos que te vaya mostrando.

En muchos casos, Docker Desktop en Windows usa WSL 2 como backend, así que conviene aceptar la configuración recomendada si el instalador la solicita.

## Paso 3: completar instalación y reiniciar si hace falta

Algunas máquinas requieren reinicio para completar bien la configuración.

Si el instalador te lo pide, reiniciá.

## Paso 4: abrir Docker Desktop

Después de instalar, abrí Docker Desktop y esperá a que termine de iniciar.

No sigas con la terminal hasta que Docker realmente esté levantado.

---

## Instalación en Linux

Si estás en Linux, el proceso depende de la distribución.

La idea general suele ser esta:

1. instalar Docker Engine con el método recomendado para tu distro
2. arrancar el servicio Docker
3. verificar que el daemon esté corriendo
4. probar `hello-world`

Más adelante, si querés, podés adaptar los comandos exactos a Ubuntu, Debian, Fedora u otra distribución específica.

---

## Qué debería pasar después de instalar

Después de una instalación correcta, deberías tener:

- Docker Desktop abierto y funcionando, si usás Windows o macOS
- o el servicio Docker activo, si usás Linux
- acceso al comando `docker` desde terminal
- capacidad para descargar y ejecutar imágenes

---

## Primera verificación: comprobar la CLI

Abrí una terminal y ejecutá:

```bash
docker --version
```

Deberías ver algo parecido a esto:

```bash
Docker version ...
```

Esto confirma que el comando `docker` está disponible en tu sistema.

---

## Segunda verificación: ver más detalle de la instalación

Ahora ejecutá:

```bash
docker version
```

## Qué deberías observar

Este comando muestra información del cliente Docker y, si todo está bien, también del servidor o engine.

La idea no es memorizar cada dato.
Solo queremos confirmar que Docker puede comunicarse correctamente con el motor de contenedores.

---

## Tercera verificación: revisar información general

Ejecutá:

```bash
docker info
```

## Para qué sirve

Te muestra información general del entorno Docker, por ejemplo:

- cantidad de imágenes
- cantidad de contenedores
- driver de almacenamiento
- configuración general del engine

No hace falta entender todo ahora.
Solo buscá que el comando responda bien y no devuelva errores de conexión.

---

## La prueba importante: correr un contenedor real

Ahora hacé la prueba más importante del tema:

```bash
docker run hello-world
```

---

## Qué hace este comando

Hace varias cosas juntas:

- busca la imagen `hello-world`
- si no la tenés, la descarga
- crea un contenedor a partir de esa imagen
- lo ejecuta
- muestra un mensaje de confirmación
- termina

---

## Qué deberías ver

Si todo salió bien, deberías ver un mensaje indicando que Docker pudo:

- contactar al daemon
- descargar la imagen
- crear el contenedor
- ejecutarlo correctamente

Ese es el mejor indicador de que tu entorno está listo para seguir.

---

## Qué está pasando realmente en esta prueba

Aunque el comando sea corto, ya están ocurriendo varias cosas importantes:

1. Docker busca una imagen
2. si no está en tu máquina, la descarga
3. crea un contenedor
4. ejecuta ese contenedor
5. el contenedor imprime un mensaje
6. el contenedor finaliza

O sea: en una sola prueba ya estás usando imagen, contenedor y registro, aunque todavía de forma muy simple.

---

## Si querés ver el contenedor creado

Después de correr `hello-world`, podés ejecutar:

```bash
docker ps -a
```

## Qué te muestra

Te muestra la lista de contenedores, incluso los que ya terminaron.

Como `hello-world` se ejecuta y termina enseguida, normalmente no lo vas a ver en `docker ps`, pero sí en `docker ps -a`.

---

## Primer limpieza simple

Si querés borrar ese contenedor de prueba más adelante, podés hacerlo cuando aprendas mejor a manejar IDs y nombres.

Por ahora, no te preocupes demasiado por limpiar todo.
Lo importante del tema es validar que Docker funciona.

---

## Error común 1: el comando docker no existe

Si al ejecutar:

```bash
docker --version
```

la terminal dice que `docker` no se reconoce, entonces puede pasar una de estas cosas:

- Docker no se instaló correctamente
- la instalación no terminó
- todavía no reiniciaste la máquina
- la terminal quedó abierta desde antes de instalar y necesita reiniciarse

---

## Error común 2: Docker Desktop está instalado pero no arrancó

A veces Docker Desktop está instalado, pero todavía no terminó de iniciar.

En ese caso, comandos como estos:

```bash
docker version
docker info
```

pueden fallar porque el engine todavía no está listo.

Primero asegurate de que Docker Desktop esté realmente levantado.

---

## Error común 3: problema con WSL 2 en Windows

En Windows, algunas instalaciones fallan porque WSL 2 no está listo o no quedó bien configurado.

Si Docker Desktop te muestra mensajes relacionados con WSL, no sigas avanzando con el curso hasta corregir eso.

Primero necesitás dejar el backend funcionando bien.

---

## Error común 4: en Linux necesitás usar sudo

En algunas instalaciones Linux, al principio puede pasar que Docker funcione con:

```bash
sudo docker run hello-world
```

pero falle sin `sudo`.

Eso suele indicar que todavía te falta la configuración post-instalación para manejar Docker como usuario no root.

Más adelante podés ajustarlo, pero por ahora lo importante es verificar que el engine esté funcionando.

---

## Qué no tenés que confundir

### Tener Docker instalado no significa que ya esté funcionando
La instalación y la ejecución correcta del engine son dos cosas relacionadas, pero no idénticas.

### Ver la app Docker no alcanza
No alcanza con que exista el programa.
También tiene que responder bien la CLI.

### Que `docker --version` funcione no alcanza
Ese comando solo confirma que la CLI está disponible.
La prueba real es `docker run hello-world`.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente esto:

### Ejercicio 1
Instalá Docker en tu sistema.

### Ejercicio 2
Ejecutá:

```bash
docker --version
docker version
docker info
```

### Ejercicio 3
Ejecutá:

```bash
docker run hello-world
```

### Ejercicio 4
Ejecutá:

```bash
docker ps -a
```

### Ejercicio 5
Respondé con tus palabras:

- ¿qué confirma `docker --version`?
- ¿qué confirma `docker version`?
- ¿por qué `docker run hello-world` es una prueba más completa?
- ¿qué diferencia hay entre que Docker esté instalado y que realmente esté funcionando bien?

---

## Mini desafío

Después de hacer la prueba con `hello-world`, intentá explicar con tus palabras qué ocurrió internamente.

No lo expliques como “corrí un comando y salió un mensaje”.

Intentá pensarlo así:

- qué imagen intervino
- qué contenedor se creó
- qué tuvo que descargarse
- qué terminó ejecutándose

La idea es que empieces a mirar los comandos de Docker con más intención.

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- instalar Docker en tu sistema
- verificar si la CLI está disponible
- comprobar si Docker puede comunicarse con el engine
- ejecutar una prueba real con `hello-world`
- reconocer errores básicos de instalación y arranque

---

## Resumen del tema

- Instalar Docker no alcanza: también hay que verificar que funcione bien.
- La CLI tiene que responder correctamente.
- Docker Desktop o Docker Engine tienen que estar realmente activos.
- `docker run hello-world` es la prueba más importante del tema.
- Si esa prueba funciona, tu entorno ya está listo para empezar a trabajar con contenedores.

---

## Próximo tema

En el próximo tema vas a usar Docker por primera vez con intención práctica:

- primer contenedor con `docker run`
- lectura real del comando
- puertos, nombres y ejecución básica
