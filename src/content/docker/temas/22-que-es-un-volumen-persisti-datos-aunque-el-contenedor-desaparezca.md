---
title: "Qué es un volumen: persistí datos aunque el contenedor desaparezca"
description: "Tema 22 del curso práctico de Docker: qué es un volumen, cómo crearlo, cómo montarlo en un contenedor y cómo comprobar que los datos sobreviven aunque el contenedor se elimine."
order: 22
module: "Datos y archivos"
level: "base"
draft: false
---

# Qué es un volumen: persistí datos aunque el contenedor desaparezca

## Objetivo del tema

En este tema vas a:

- entender qué es un volumen en Docker
- crear un volumen nombrado
- montarlo dentro de un contenedor
- escribir datos usando ese volumen
- comprobar que esos datos sobreviven aunque el contenedor se elimine

La idea es que pases de entender el problema de la persistencia a usar la primera solución concreta.

---

## Qué vas a hacer hoy

En este tema vas a seguir este recorrido:

1. crear un volumen
2. montarlo en un contenedor
3. escribir un archivo dentro de la ruta montada
4. eliminar el contenedor
5. crear otro contenedor usando el mismo volumen
6. comprobar que el archivo sigue existiendo

---

## Idea central que tenés que llevarte

Un volumen es un mecanismo de persistencia administrado por Docker.

Eso significa que el dato no queda atado a la vida de un contenedor puntual.

Dicho simple:

> el contenedor puede desaparecer  
> el volumen puede seguir existiendo  
> y el dato puede sobrevivir

Esa es exactamente la diferencia importante frente a guardar archivos solo dentro de la capa escribible del contenedor.

---

## Qué es un volumen

Un volumen es un almacenamiento persistente administrado por Docker.

Sirve para guardar datos que querés conservar más allá de un contenedor concreto.

Por ejemplo:

- datos de una base de datos
- archivos generados por una aplicación
- contenido compartido entre contenedores
- información que no querés perder cuando reconstruís o reemplazás un contenedor

---

## Cómo conviene pensar un volumen

Pensalo así:

- el contenedor es efímero
- el volumen vive aparte
- el contenedor puede usar ese volumen montándolo en una ruta determinada

Eso hace que el dato no dependa únicamente de la capa escribible del contenedor.

---

## Qué ventaja tiene frente a guardar dentro del contenedor

En el tema anterior viste esto:

- si escribís dentro del contenedor
- y después borrás el contenedor
- esos datos pueden perderse

Con un volumen, en cambio, la idea cambia:

- el contenedor escribe en una ruta montada sobre el volumen
- eliminás el contenedor
- el volumen sigue existiendo
- otro contenedor puede volver a usar ese mismo dato

Ahí aparece la persistencia real.

---

## Cómo crear un volumen

La forma más simple es esta:

```bash
docker volume create datos-demo
```

---

## Qué hace

Crea un volumen llamado:

```text
datos-demo
```

Después podés listarlo con:

```bash
docker volume ls
```

---

## Qué deberías ver

En la lista debería aparecer algo como esto:

```text
datos-demo
```

Eso confirma que el volumen ya existe y está disponible para ser montado en contenedores.

---

## Montar el volumen en un contenedor

Ahora vas a crear un contenedor y vas a montar el volumen en la ruta `/datos`.

Ejecutá:

```bash
docker run -it --name contenedor-vol1 --mount source=datos-demo,target=/datos alpine sh
```

---

## Qué significa este comando

### `docker run -it`
Crea y ejecuta un contenedor interactivo.

### `--name contenedor-vol1`
Le da un nombre claro al contenedor.

### `--mount source=datos-demo,target=/datos`
Monta el volumen `datos-demo` dentro del contenedor en la ruta `/datos`.

### `alpine sh`
Usa Alpine y abre una shell.

---

## Qué tenés que entender sobre --mount

La parte importante es esta:

```bash
--mount source=datos-demo,target=/datos
```

La lectura conceptual sería:

- usá el volumen llamado `datos-demo`
- hacelo visible dentro del contenedor en `/datos`

A partir de ahí, todo lo que escribas en `/datos` va al volumen, no solo a la capa escribible efímera del contenedor.

---

## Escribir un archivo dentro del volumen

Una vez dentro del contenedor, ejecutá:

```sh
echo "Este dato vive en un volumen" > /datos/mensaje.txt
cat /datos/mensaje.txt
```

---

## Qué deberías ver

Deberías ver:

```text
Este dato vive en un volumen
```

Eso confirma que el archivo fue escrito correctamente en la ruta montada.

---

## Salí del contenedor

Ahora salí con:

```sh
exit
```

---

## Eliminar el contenedor

Después ejecutá:

```bash
docker stop contenedor-vol1
docker rm contenedor-vol1
```

---

## Qué cambia ahora

El contenedor desapareció.

Pero el volumen no.

Ese es el punto más importante del tema.

Ahora vas a demostrarlo usando un segundo contenedor diferente.

---

## Crear otro contenedor usando el mismo volumen

Ejecutá:

```bash
docker run --rm --mount source=datos-demo,target=/datos alpine cat /datos/mensaje.txt
```

---

## Qué hace

- crea un contenedor nuevo
- vuelve a montar el volumen `datos-demo` en `/datos`
- ejecuta `cat /datos/mensaje.txt`
- muestra el contenido
- elimina el contenedor al terminar

---

## Qué deberías ver

Deberías volver a ver:

```text
Este dato vive en un volumen
```

Y eso demuestra algo muy importante:

- el primer contenedor ya no existe
- el segundo contenedor es otro distinto
- pero el dato sigue ahí porque estaba en el volumen

Ese es el corazón del tema.

---

## Qué demuestra este ejercicio

Demuestra que:

- el volumen vive fuera del ciclo de vida del contenedor
- un mismo volumen puede montarse en distintos contenedores
- el dato persiste aunque elimines el contenedor que lo escribió

Esto ya es persistencia real.

---

## Qué diferencia hay entre volumen y ruta normal del contenedor

### Ruta normal del contenedor
Depende de la capa escribible del contenedor.

### Ruta montada sobre volumen
Depende del volumen administrado por Docker.

Esto cambia completamente el comportamiento cuando el contenedor se elimina.

---

## Ver detalles del volumen

Podés inspeccionar el volumen con:

```bash
docker volume inspect datos-demo
```

---

## Qué hace

Muestra información del volumen, por ejemplo:

- su nombre
- el driver
- detalles de montaje
- metadatos útiles

No hace falta memorizar toda la salida.
Lo importante es acostumbrarte a que el volumen es un recurso real y separado del contenedor.

---

## Listar volúmenes

Para ver todos los volúmenes conocidos por Docker, usá:

```bash
docker volume ls
```

Esto es útil cuando empezás a trabajar con varios proyectos o varias pruebas.

---

## Eliminar un volumen

Cuando ya no lo necesites, podés borrarlo con:

```bash
docker volume rm datos-demo
```

---

## Qué tenés que tener en cuenta

No conviene eliminar un volumen si todavía lo necesitás para conservar datos.

Y si un contenedor lo está usando, primero conviene detener y eliminar ese contenedor.

Al comienzo, pensalo así:

- contenedor se puede recrear fácilmente
- volumen puede contener datos valiosos

Por eso no conviene tratar ambos recursos como si fueran iguales.

---

## Qué no tenés que confundir

### Volumen no es lo mismo que carpeta local del host
Eso sería más cercano a un bind mount, que vas a ver después.

### Volumen no pertenece a un solo contenedor
Puede ser usado por distintos contenedores.

### Eliminar el contenedor no elimina automáticamente el volumen
Justamente esa separación es lo que permite persistencia.

### Escribir en una ruta montada no es lo mismo que escribir en cualquier carpeta interna
Si la ruta está montada sobre un volumen, el dato va al volumen.

---

## Error común 1: creer que el volumen desaparece junto con el contenedor

No.

Ese es justamente el problema que el volumen viene a resolver.

---

## Error común 2: no distinguir entre nombre del contenedor y nombre del volumen

En este tema tenés dos nombres distintos:

- `contenedor-vol1`
- `datos-demo`

Uno es el contenedor.
El otro es el volumen.

No cumplen el mismo papel.

---

## Error común 3: escribir fuera de la ruta montada

Si el volumen está montado en:

```text
/datos
```

pero vos escribís en otra ruta, entonces ese contenido no necesariamente quedará persistido en el volumen.

---

## Error común 4: borrar el volumen sin pensar

Si eliminás el volumen, eliminás también el almacenamiento persistente asociado.

Por eso conviene ser cuidadoso cuando ya empezás a guardar datos reales.

---

## Ejercicio práctico obligatorio

Quiero que hagas exactamente este recorrido.

### Ejercicio 1
Creá un volumen:

```bash
docker volume create datos-demo
```

### Ejercicio 2
Listalo:

```bash
docker volume ls
```

### Ejercicio 3
Montalo en un contenedor interactivo:

```bash
docker run -it --name contenedor-vol1 --mount source=datos-demo,target=/datos alpine sh
```

### Ejercicio 4
Dentro del contenedor, ejecutá:

```sh
echo "Este dato vive en un volumen" > /datos/mensaje.txt
cat /datos/mensaje.txt
```

### Ejercicio 5
Salí y eliminá el contenedor:

```bash
docker stop contenedor-vol1
docker rm contenedor-vol1
```

### Ejercicio 6
Creá otro contenedor usando el mismo volumen y verificá el dato:

```bash
docker run --rm --mount source=datos-demo,target=/datos alpine cat /datos/mensaje.txt
```

### Ejercicio 7
Inspeccioná el volumen:

```bash
docker volume inspect datos-demo
```

### Ejercicio 8
Respondé con tus palabras:

- ¿por qué el dato sobrevivió aunque borraste el primer contenedor?
- ¿qué diferencia hay entre la vida del contenedor y la vida del volumen?
- ¿por qué esto ya puede considerarse persistencia real?

---

## Segundo ejercicio de análisis

Pensá en un caso real y respondé:

- ¿qué tipo de dato de uno de tus proyectos guardarías en un volumen?
- ¿qué pasaría si ese dato quedara solo dentro del contenedor?
- ¿te conviene que ese dato sobreviva a recreaciones del contenedor?
- ¿qué diferencia ves entre “recrear la app” y “perder el dato”?

---

## Qué tenés que observar mientras practicás

Mientras hacés este tema, fijate especialmente en estas preguntas:

- ¿en qué momento quedó más clara la diferencia entre contenedor y volumen?
- ¿qué te mostró el segundo contenedor sobre persistencia?
- ¿por qué este mecanismo es tan importante para bases de datos y archivos generados?
- ¿qué valor práctico le ves a que Docker administre este almacenamiento?
- ¿por qué no alcanza con “guardar dentro del contenedor” cuando querés datos duraderos?

Estas observaciones valen mucho más que aprenderte el comando de memoria.

---

## Mini desafío

Intentá explicar con tus palabras este flujo:

1. crear un volumen
2. montarlo en un contenedor
3. escribir un archivo en la ruta montada
4. borrar el contenedor
5. montar el mismo volumen en otro contenedor
6. volver a ver el archivo

Y además respondé:

- ¿qué demuestra eso sobre la persistencia?
- ¿por qué el volumen es diferente de la capa escribible del contenedor?
- ¿qué ventajas le ves frente a guardar datos solo dentro del contenedor?
- ¿qué tipo de proyecto tuyo se beneficiaría de esto?

---

## Qué deberías saber al terminar este tema

Si terminaste bien este tema, ya deberías poder:

- explicar qué es un volumen en Docker
- crear un volumen nombrado
- montarlo dentro de un contenedor
- comprobar que el dato sobrevive aunque el contenedor desaparezca
- entender por qué los volúmenes son una pieza central en proyectos reales

---

## Resumen del tema

- Un volumen es un mecanismo de persistencia administrado por Docker.
- Vive fuera del ciclo de vida de un contenedor.
- Puede montarse dentro de uno o varios contenedores.
- Los datos escritos en la ruta montada sobreviven aunque elimines el contenedor.
- `docker volume create`, `docker volume ls`, `docker volume inspect` y `docker volume rm` son comandos básicos muy importantes.
- Este tema te da la primera solución concreta al problema de persistencia que viste en el tema anterior.

---

## Próximo tema

En el próximo tema vas a ver la otra gran herramienta de este bloque:

- qué es un bind mount
- cuándo conviene usarlo
- por qué es muy útil para desarrollo y para compartir archivos con el host
