---
title: "Ejecutar comandos dentro de un contenedor: usá docker exec con criterio"
description: "Séptimo tema práctico del curso de Docker: cómo usar docker exec para correr comandos dentro de un contenedor en ejecución, entrar a una shell y entender cuándo conviene usarlo frente a docker run."
order: 7
module: "Fundamentos de Docker"
level: "intro"
draft: false
---

# Ejecutar comandos dentro de un contenedor: usá docker exec con criterio

## Objetivo del tema

En este tema vas a:

- entender qué hace `docker exec`
- ejecutar comandos dentro de un contenedor que ya está corriendo
- entrar a una shell interactiva dentro de un contenedor
- distinguir claramente entre `docker run` y `docker exec`
- empezar a inspeccionar el entorno interno de un contenedor con más criterio

La idea es que aprendas a trabajar **dentro** de un contenedor ya levantado, sin confundir eso con crear uno nuevo.

---

## Qué vas a hacer hoy

En este tema vas a seguir este flujo:

1. levantar un contenedor que quede corriendo
2. ejecutar comandos dentro de ese contenedor
3. entrar a una shell interactiva
4. inspeccionar archivos y entorno básico
5. comparar `docker exec` con `docker run`
6. practicar casos simples del día a día

---

## Idea central que tenés que llevarte

`docker exec` sirve para ejecutar un comando dentro de un contenedor **que ya está corriendo**.

Dicho simple:

> `docker run` crea e inicia un contenedor nuevo.  
> `docker exec` ejecuta algo dentro de un contenedor que ya existe y sigue activo.

Esta diferencia te tiene que quedar totalmente clara.

---

## Qué dice la documentación oficial

La referencia oficial de Docker describe `docker exec` como un comando que ejecuta un nuevo proceso dentro de un contenedor en ejecución. También aclara que ese proceso adicional solo vive mientras siga activo el proceso principal del contenedor y que el comando corre en el directorio de trabajo por defecto del contenedor, salvo que indiques otro con `-w`. citeturn200109search0

---

## Primer paso: levantar un contenedor que permanezca corriendo

Para practicar `docker exec`, primero necesitás un contenedor activo.

Ejecutá:

```bash
docker run -d --name contenedor-shell alpine sleep 300
```

---

## Qué hace este comando

- usa la imagen `alpine`
- crea un contenedor llamado `contenedor-shell`
- ejecuta `sleep 300`
- lo deja corriendo en segundo plano durante 300 segundos

Esto nos da una “base viva” sobre la cual ejecutar comandos con `docker exec`.

---

## Verificar que esté corriendo

Ejecutá:

```bash
docker ps
```

Deberías ver `contenedor-shell` en la lista de contenedores activos.

---

## Primer uso real de docker exec

Ahora ejecutá:

```bash
docker exec contenedor-shell echo "Hola desde adentro del contenedor"
```

---

## Qué hace

- no crea un contenedor nuevo
- no reemplaza el proceso principal
- ejecuta solo ese comando dentro del contenedor que ya está corriendo

En este caso:

- el contenedor sigue con su `sleep 300`
- además se ejecuta el `echo`
- se muestra el mensaje
- y ese proceso puntual termina

---

## Qué tenés que visualizar

Cuando corrés:

```bash
docker exec contenedor-shell echo "Hola"
```

la idea mental correcta no es:

> “estoy arrancando un contenedor”

La idea correcta es:

> “estoy entrando a un contenedor que ya está vivo para ejecutar un proceso adicional”

Eso es exactamente lo que vuelve tan útil a `docker exec`.

---

## Segundo uso real: ver el directorio actual

Probá esto:

```bash
docker exec contenedor-shell pwd
```

---

## Qué hace

Ejecuta `pwd` dentro del contenedor.

Esto te permite empezar a inspeccionar el entorno sin necesidad de abrir una shell completa.

Es muy útil para comprobaciones rápidas.

---

## Tercer uso real: listar archivos

Ahora probá:

```bash
docker exec contenedor-shell ls
```

O también:

```bash
docker exec contenedor-shell ls -la /
```

---

## Qué hace

Ejecuta `ls` dentro del contenedor y te muestra contenido del sistema de archivos del contenedor.

Esto es muy útil para:

- ver qué carpetas existen
- comprobar si un archivo está presente
- inspeccionar rutas
- verificar resultados simples

---

## Entrar a una shell interactiva

Ahora sí, vamos a la parte más usada al principio.

Ejecutá:

```bash
docker exec -it contenedor-shell sh
```

---

## Qué significa este comando

### `docker exec`
Ejecuta algo dentro de un contenedor ya corriendo.

### `-it`
Activa modo interactivo con terminal.

### `contenedor-shell`
Es el contenedor donde querés entrar.

### `sh`
Es la shell que querés abrir dentro del contenedor.

---

## Qué deberías ver

Deberías entrar a una terminal dentro del contenedor.

Desde ahí podés ejecutar comandos como:

```sh
pwd
ls
whoami
cat /etc/os-release
```

La idea no es explorar todo todavía, sino sentir claramente que ahora estás operando **dentro** del contenedor.

---

## Cómo salir de la shell

Para salir, ejecutá:

```sh
exit
```

Eso termina la shell que abriste con `docker exec`, pero no necesariamente detiene el contenedor principal.

Esa diferencia es muy importante.

---

## Qué aclara Docker sobre esto

La referencia oficial marca que el comando lanzado con `docker exec` solo se ejecuta mientras el proceso principal del contenedor siga corriendo, y que no se reinicia automáticamente si el contenedor se reinicia más tarde. También documenta `-i`, `-t`, `-e` y `-w` como opciones clave para sesiones interactivas, variables de entorno del proceso y cambio de directorio de trabajo. citeturn200109search0

---

## Diferencia clave entre docker run y docker exec

Esta comparación te tiene que quedar grabada.

### `docker run`
- crea un contenedor nuevo
- lo inicia
- ejecuta un proceso principal

### `docker exec`
- usa un contenedor ya corriendo
- ejecuta un proceso adicional dentro de él
- no crea un contenedor nuevo

---

## Ejemplo comparativo

### Caso 1
```bash
docker run alpine ls
```

Esto:

- crea un contenedor nuevo
- ejecuta `ls`
- termina

### Caso 2
```bash
docker exec contenedor-shell ls
```

Esto:

- usa el contenedor `contenedor-shell`, que ya existe y ya corre
- ejecuta `ls` dentro de él
- el contenedor sigue vivo después

La diferencia conceptual es enorme.

---

## Usar docker exec para ver variables de entorno

Probá esto:

```bash
docker exec contenedor-shell env
```

---

## Qué hace

Muestra las variables de entorno visibles para el proceso ejecutado dentro del contenedor.

Esto puede servirte para:

- comprobar configuración
- verificar valores cargados
- inspeccionar el entorno de ejecución

---

## Ejecutar un comando en otro directorio

La documentación oficial permite cambiar el directorio de trabajo del proceso con `-w`. Por ejemplo, podés ejecutar un comando en `/tmp` sin necesidad de moverte manualmente dentro de la shell. citeturn200109search0

Probá esto:

```bash
docker exec -it -w /tmp contenedor-shell pwd
```

Deberías ver:

```text
/tmp
```

---

## Pasar variables de entorno al proceso ejecutado

Docker también permite pasar variables al proceso puntual lanzado con `docker exec`, sin cambiar globalmente todo el contenedor. Eso se hace con `-e` o `--env`. citeturn200109search0

Probá esto:

```bash
docker exec -e MENSAJE="Hola variable" contenedor-shell sh -c 'echo $MENSAJE'
```

---

## Qué tenés que entender sobre esto

Esa variable queda disponible para el proceso que ejecutaste con `docker exec`.

No significa necesariamente que todos los procesos del contenedor cambien para siempre.

Es una configuración puntual de esa ejecución.

---

## Qué no tenés que confundir

### Entrar con exec no significa modificar la imagen
Estás trabajando sobre un contenedor en ejecución, no sobre la plantilla original.

### `docker exec` no reemplaza el proceso principal
Agrega un proceso nuevo dentro de un contenedor ya activo.

### Salir de la shell no siempre detiene el contenedor
Solo termina la shell que abriste con `docker exec`.

---

## Error común 1: intentar usar docker exec en un contenedor detenido

`docker exec` funciona sobre un contenedor en ejecución.

Si el contenedor está parado, primero tenés que arrancarlo.

Por eso conviene comprobar antes con:

```bash
docker ps
```

---

## Error común 2: creer que docker exec crea un contenedor nuevo

No.

Eso lo hace `docker run`.

`docker exec` usa uno que ya existe y está corriendo.

---

## Error común 3: pensar que todo contenedor tiene bash

No siempre.

Muchas imágenes pequeñas, como `alpine`, traen `sh` pero no `bash`.

Por eso, si esto falla:

```bash
docker exec -it contenedor-shell bash
```

probá con:

```bash
docker exec -it contenedor-shell sh
```

---

## Error común 4: salir de la shell y pensar que el contenedor murió

No necesariamente.

Si el proceso principal sigue vivo, el contenedor sigue corriendo aunque cierres la shell interactiva abierta con `docker exec`.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Levantá un contenedor que quede corriendo:

```bash
docker run -d --name contenedor-shell alpine sleep 300
```

### Ejercicio 2
Verificá que esté activo:

```bash
docker ps
```

### Ejercicio 3
Ejecutá un comando puntual dentro del contenedor:

```bash
docker exec contenedor-shell echo "Estoy ejecutando un comando dentro del contenedor"
```

### Ejercicio 4
Consultá el directorio actual:

```bash
docker exec contenedor-shell pwd
```

### Ejercicio 5
Listá archivos de la raíz:

```bash
docker exec contenedor-shell ls -la /
```

### Ejercicio 6
Mostrá variables de entorno:

```bash
docker exec contenedor-shell env
```

### Ejercicio 7
Entrá a una shell interactiva:

```bash
docker exec -it contenedor-shell sh
```

Ya dentro del contenedor, ejecutá:

```sh
pwd
ls
cat /etc/os-release
exit
```

### Ejercicio 8
Probá cambiar el directorio de trabajo del proceso:

```bash
docker exec -it -w /tmp contenedor-shell pwd
```

### Ejercicio 9
Probá pasar una variable de entorno puntual:

```bash
docker exec -e MENSAJE="Hola desde exec" contenedor-shell sh -c 'echo $MENSAJE'
```

### Ejercicio 10
Detenelo y eliminá el contenedor:

```bash
docker stop contenedor-shell
docker rm contenedor-shell
```

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿qué diferencia viste entre `docker run` y `docker exec`?
- ¿qué pasó al salir de la shell interactiva?
- ¿el contenedor seguía corriendo después?
- ¿qué comando te sirvió más para inspecciones rápidas?
- ¿qué ventaja te dio `-w /tmp`?
- ¿qué cambió al usar `-e MENSAJE=...`?

Estas observaciones son mucho más valiosas que memorizar opciones sin contexto.

---

## Mini desafío

Intentá explicar con tus palabras este flujo:

1. levantar un contenedor en segundo plano
2. entrar con `docker exec`
3. ejecutar una comprobación rápida
4. salir sin matar el contenedor
5. volver a entrar o lanzar otro comando

Y además respondé:

- ¿cuándo conviene `docker exec` en vez de `docker run`?
- ¿por qué no todos los contenedores aceptan `bash`?
- ¿qué valor práctico tiene poder lanzar comandos sin recrear el contenedor?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- usar `docker exec` sobre contenedores en ejecución
- ejecutar comandos puntuales dentro de un contenedor
- abrir una shell interactiva con `-it`
- distinguir claramente `docker run` de `docker exec`
- inspeccionar archivos, rutas y entorno básico desde adentro

---

## Resumen del tema

- `docker exec` ejecuta procesos dentro de un contenedor que ya está corriendo.
- No crea contenedores nuevos.
- `-it` permite abrir una shell interactiva.
- `-w` permite cambiar el directorio de trabajo del proceso.
- `-e` permite pasar variables al proceso ejecutado.
- `docker exec` es una herramienta clave para inspección, debugging y comprobaciones rápidas.

---

## Próximo tema

En el próximo tema vas a trabajar con algo muy importante para cualquier aplicación real:

- puertos
- publicación al host
- acceso desde el navegador o desde tu máquina
- entender qué significa realmente exponer un servicio
